"""Animated dot corners for Cenner emails: one looping GIF per kind of email.

Each is a halftone bloom growing out of the top-right corner of the white card, slowly changing shape
(the edge breathes and turns, like the site's lava-lamp dots) and looping seamlessly: every motion is
a whole number of cycles over the loop. Also writes logo.png (the orb + CENNER wordmark on paper).

Dark mode: the GIF ground is transparent (palette index 0) and the dots are drawn crisp, as solid
colours already lightened for the faint ones, so no white halo shows on a dark card; each frame is
cleared before the next (disposal "restore to background"). logo.png is RGBA with a transparent ground.

Pure Python: dots on a float canvas, quantised to a small palette, LZW-encoded GIF89a.
Usage: python3 make_corner_gifs.py <out_dir>
"""
import math, os, struct, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_email_art import Canvas, PAPER, GLYPHS, draw_orb, draw_wordmark  # noqa: E402
import zlib

WHITE = (255, 255, 255)
MIST = (196, 201, 209)
TONES = {
    'general':  ['#e7defa', '#a47ce8', '#9a63e6', '#ef4f93', '#f2c14e'],   # the orb's violet -> pink -> gold
    'security': ['#fde8d6', '#f7b07a', '#ee7a35', '#d9531a', '#b8400f'],   # attention: orange
    'urgent':   ['#fbdbe4', '#f3879f', '#e5406a', '#c81e4d', '#9f1239'],   # disputes: rose
    'money':    ['#d9f6e3', '#8fe3ae', '#4ade80', '#22c55e', '#15803d'],   # orders and payments: green
    'activity': ['#d9e2f7', '#8aa3ea', '#3d68dc', '#1d46c4', '#002ca5'],   # messages, contracts, reviews: blue
}
SIZE = 240          # shown at 120 x 120
GAP = 14
FRAMES = 36
DELAY_CS = 12       # 36 x 0.12 s = a 4.3 s loop, slow on purpose


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def lerp(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def ramp(cols, t):
    t = min(0.9999, max(0.0, t)) * (len(cols) - 1)
    i = int(t)
    return lerp(cols[i], cols[i + 1], t - i)


def crisp_circle(c, cx, cy, r, col):
    """A solid dot, no anti-aliasing (edge pixels blended with white would halo on dark backgrounds)."""
    for y in range(int(cy - r - 1), int(cy + r + 2)):
        for x in range(int(cx - r - 1), int(cx + r + 2)):
            if 0 <= x < c.w and 0 <= y < c.h and math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r:
                c.px[y * c.w + x] = list(col)


def frame(cols, k):
    """One frame: dots swell toward the corner; the bloom's outline breathes and drifts with phase p."""
    p = 2 * math.pi * k / FRAMES
    c = Canvas(SIZE, SIZE, WHITE)
    fx, fy = SIZE + 6, -6
    for gy in range(GAP // 2, SIZE, GAP):
        for gx in range(GAP // 2, SIZE, GAP):
            dx, dy = gx - fx, gy - fy
            d = math.hypot(dx, dy)
            ang = math.atan2(dy, dx)
            # the reach changes with the angle, and the pattern of bulges turns and breathes over the loop
            reach = SIZE * (0.78
                            + 0.10 * math.sin(3 * ang + p)
                            + 0.06 * math.sin(2 * ang - 2 * p + 1.1)
                            + 0.05 * math.sin(p))
            v = math.exp(-(d / reach) ** 2 * 2.1)
            if v < 0.07:
                continue
            # faint dots fade toward a soft grey, not white: quiet on a light card, no bright specks on a dark one
            crisp_circle(c, gx, gy, 0.9 + v * GAP * 0.40, lerp(MIST, ramp(cols, v), min(1.0, 0.25 + v * 1.2)))
    return c


def palette_for(cols):
    """Index 0 is the transparent ground; then each tone colour at the strengths the faint dots use."""
    pal = [WHITE]
    for col in cols:
        for a in (0.25, 0.4, 0.55, 0.7, 0.85, 1.0):
            pal.append(tuple(round(v) for v in lerp(MIST, col, a)))
    while len(pal) < 64:
        pal.append(WHITE)
    return pal[:64]


def quantise(c, pal, cache):
    out = bytearray(len(c.px))
    for i, p in enumerate(c.px):
        if p[0] >= 254.5 and p[1] >= 254.5 and p[2] >= 254.5:
            out[i] = 0
            continue
        key = (int(p[0]) >> 2, int(p[1]) >> 2, int(p[2]) >> 2)
        idx = cache.get(key)
        if idx is None:
            best, bd = 0, 1e18
            for j, q in enumerate(pal[1:], start=1):
                dd = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2
                if dd < bd:
                    best, bd = j, dd
            idx = cache[key] = best
        out[i] = idx
    return out


def lzw(indices, min_size):
    clear, eoi = 1 << min_size, (1 << min_size) + 1
    size = min_size + 1
    table = {bytes([i]): i for i in range(clear)}
    nxt = eoi + 1
    bits, nbits, out = 0, 0, bytearray()

    def emit(code):
        nonlocal bits, nbits
        bits |= code << nbits
        nbits += size
        while nbits >= 8:
            out.append(bits & 0xff)
            bits >>= 8
            nbits -= 8

    emit(clear)
    w = b''
    for b in indices:
        wb = w + bytes([b])
        if wb in table:
            w = wb
            continue
        emit(table[w])
        if nxt < 4096:
            table[wb] = nxt
            nxt += 1
            if nxt > (1 << size) and size < 12:
                size += 1
        else:
            emit(clear)
            table = {bytes([i]): i for i in range(clear)}
            nxt, size = eoi + 1, min_size + 1
        w = bytes([b])
    if w:
        emit(table[w])
    emit(eoi)
    if nbits:
        out.append(bits & 0xff)
    return bytes(out)


def write_gif(path, frames, pal):
    min_size = 6                               # 64-colour table
    data = bytearray(b'GIF89a')
    data += struct.pack('<HHBBB', SIZE, SIZE, 0xF0 | (min_size - 1), 0, 0)
    for q in pal:
        data += bytes(q)
    data += b'\x21\xFF\x0BNETSCAPE2.0\x03\x01\x00\x00\x00'   # loop forever
    for idx in frames:
        # packed 0x09: disposal 2 (clear to background) + transparent colour flag; transparent index 0
        data += b'\x21\xF9\x04' + struct.pack('<BHBB', 0x09, DELAY_CS, 0, 0)
        data += b'\x2C' + struct.pack('<HHHHB', 0, 0, SIZE, SIZE, 0)
        data.append(min_size)
        comp = lzw(idx, min_size)
        for i in range(0, len(comp), 255):
            blk = comp[i:i + 255]
            data.append(len(blk))
            data += blk
        data.append(0)
    data += b'\x3B'
    with open(path, 'wb') as f:
        f.write(data)


def png_rgba(path, w, h, px):
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            raw.extend(int(max(0, min(255, round(v)))) for v in px[y * w + x])

    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    data = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    data += chunk(b'IDAT', zlib.compress(bytes(raw), 9)) + chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(data)


def logo(out):
    """The orb + CENNER on the green strip, on a transparent ground (RGBA), 600 x 120 shown at 300 x 60.
    The strip stays solid under the letters and only fades out past them, so the ink reads on any ground."""
    W, H, PX = 600, 120, 6
    rgba = [[0, 0, 0, 0] for _ in range(W * H)]

    def over(x, y, col, a):
        if a <= 0 or not (0 <= x < W and 0 <= y < H):
            return
        d = rgba[y * W + x]
        da = d[3] / 255
        oa = a + da * (1 - a)
        if oa <= 0:
            return
        for i in range(3):
            d[i] = (col[i] * a + d[i] * da * (1 - a)) / oa
        d[3] = oa * 255

    # orb: copy from an opaque canvas (its own dark square is part of the mark)
    orb = Canvas(112, 112, (0x0c, 0x10, 0x15))
    draw_orb(orb, 0, 0, 112)
    for y in range(112):
        for x in range(112):
            over(4 + x, 4 + y, orb.px[y * 112 + x], 1.0)
    # strip + squares + letters
    x0, y0 = 140, 39
    text_w = 6 * 8 * PX
    sx0, sy0 = x0 - PX * 1.2, y0 - PX * 2.2
    sw, sh = text_w + 16 * PX, 7 * PX + 2 * PX * 2.2
    solid = (text_w + PX * 2) / sw
    for y in range(int(sy0), int(sy0 + sh)):
        for x in range(int(sx0), int(sx0 + sw)):
            t = (x - sx0) / sw
            a = 1.0 if t <= solid else max(0.0, 1 - (t - solid) / (1 - solid))
            over(x, y, (0x22 + (0x4a - 0x22) * min(1, t / solid), 0xc5 + (0xde - 0xc5) * min(1, t / solid), 0x5e + (0x80 - 0x5e) * min(1, t / solid)), a)
    for li, ch in enumerate('CENNER'):
        for ry, row in enumerate(GLYPHS[ch]):
            for rx, bit in enumerate(row):
                if bit == 'X':
                    for yy in range(PX):
                        for xx in range(PX):
                            over(x0 + li * 8 * PX + rx * PX + xx, y0 + ry * PX + yy, (0x0b, 0x0c, 0x0e), 1.0)
    png_rgba(os.path.join(out, 'logo.png'), W, H, rgba)


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    logo(out)
    only = sys.argv[2:] or list(TONES)
    for name in only:
        cols = [hexrgb(h) for h in TONES[name]]
        pal = palette_for(cols)
        cache = {}
        frames = [quantise(frame(cols, k), pal, cache) for k in range(FRAMES)]
        path = os.path.join(out, f'corner-{name}.gif')
        write_gif(path, frames, pal)
        print(name, os.path.getsize(path), 'bytes')
