"""Animated dot corners for Cenner emails: one looping GIF per kind of email.

Each is a halftone bloom growing out of the top-right corner of the white card, slowly changing shape
(the edge breathes and turns, like the site's lava-lamp dots) and looping seamlessly: every motion is
a whole number of cycles over the loop. Also writes logo.png (the orb + CENNER wordmark on paper).

Pure Python: anti-aliased dots on a float canvas, quantised to a small palette, LZW-encoded GIF89a.
Usage: python3 make_corner_gifs.py <out_dir>
"""
import math, os, struct, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_email_art import Canvas, PAPER, draw_orb, draw_wordmark  # noqa: E402

WHITE = (255, 255, 255)
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
            if v < 0.04:
                continue
            c.circle(gx, gy, 0.9 + v * GAP * 0.40, ramp(cols, v), min(1.0, 0.2 + v * 1.1))
    return c


def palette_for(cols):
    """White plus each tone colour at several strengths toward white (what the anti-aliased edges need)."""
    pal = [WHITE]
    for col in cols:
        for a in (0.12, 0.28, 0.45, 0.62, 0.8, 1.0):
            pal.append(tuple(round(v) for v in lerp(WHITE, col, a)))
    while len(pal) < 64:
        pal.append(WHITE)
    return pal[:64]


def quantise(c, pal, cache):
    out = bytearray(len(c.px))
    for i, p in enumerate(c.px):
        key = (int(p[0]) >> 2, int(p[1]) >> 2, int(p[2]) >> 2)
        idx = cache.get(key)
        if idx is None:
            best, bd = 0, 1e18
            for j, q in enumerate(pal):
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
        data += b'\x21\xF9\x04' + struct.pack('<BHBB', 0x04, DELAY_CS, 0, 0)
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


def logo(out):
    c = Canvas(600, 120, PAPER)
    draw_orb(c, 4, 4, 112)
    draw_wordmark(c, 140, 39, 6)
    c.png(os.path.join(out, 'logo.png'))


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
