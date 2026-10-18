"""Email art for Cenner's transactional emails, drawn with the site's dot language.

header.png  (1200 x 240, shown at 600 x 120): paper ground, the halftone orb, the CENNER wordmark in a
            pixel face on the green dithered strip, and a blue-to-green dot bloom growing out of the
            right edge (like the footer's animation), fading into faint grey dots.
footer.png  (1200 x 72, shown at 600 x 36): a thin band of dots that swell toward the left corner.

Pure Python (no PIL): a float RGB canvas, analytic anti-aliased circles, zlib PNG writer.
Usage: python3 make_email_art.py <out_dir>
"""
import math, struct, sys, zlib, os

PAPER = (0xee, 0xf0, 0xf3)
INK = (0x0b, 0x0c, 0x0e)
GROUND = (0x0c, 0x10, 0x15)
ORB_RAMP = [(0x5b, 0x3a, 0xa8), (0x9a, 0x63, 0xe6), (0xef, 0x4f, 0x93), (0xf2, 0xc1, 0x4e)]
BLOOM = [(0xcf, 0xd8, 0xf0), (0x6d, 0x8c, 0xe8), (0x00, 0x2c, 0xa5), (0x1f, 0x9d, 0x5a), (0x4a, 0xde, 0x80)]
GREEN_A, GREEN_B = (0x22, 0xc5, 0x5e), (0x4a, 0xde, 0x80)
MINT = (0xea, 0xff, 0xf3)


def lerp(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def ramp(cols, t):
    t = min(0.9999, max(0.0, t)) * (len(cols) - 1)
    i = int(t)
    return lerp(cols[i], cols[i + 1], t - i)


class Canvas:
    def __init__(self, w, h, bg):
        self.w, self.h = w, h
        self.px = [list(bg) for _ in range(w * h)]

    def blend(self, x, y, col, a):
        if a <= 0 or x < 0 or y < 0 or x >= self.w or y >= self.h:
            return
        p = self.px[y * self.w + x]
        a = min(1.0, a)
        for i in range(3):
            p[i] = p[i] + (col[i] - p[i]) * a

    def rect(self, x0, y0, x1, y1, col, a=1.0):
        for y in range(max(0, int(y0)), min(self.h, int(math.ceil(y1)))):
            for x in range(max(0, int(x0)), min(self.w, int(math.ceil(x1)))):
                self.blend(x, y, col, a)

    def circle(self, cx, cy, r, col, a=1.0):
        if r <= 0.2:
            return
        for y in range(int(cy - r - 1), int(cy + r + 2)):
            for x in range(int(cx - r - 1), int(cx + r + 2)):
                d = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
                cov = min(1.0, max(0.0, r + 0.5 - d))
                if cov > 0:
                    self.blend(x, y, col, cov * a)

    def png(self, path):
        raw = bytearray()
        for y in range(self.h):
            raw.append(0)
            for x in range(self.w):
                p = self.px[y * self.w + x]
                raw.extend(int(max(0, min(255, round(c)))) for c in p)

        def chunk(tag, data):
            c = struct.pack('>I', len(data)) + tag + data
            return c + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

        data = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', self.w, self.h, 8, 2, 0, 0, 0))
        data += chunk(b'IDAT', zlib.compress(bytes(raw), 9)) + chunk(b'IEND', b'')
        with open(path, 'wb') as f:
            f.write(data)


# The pixel face (Press Start 2P style), 7 rows each.
GLYPHS = {
    'C': ['.XXXXX.', 'XX...XX', 'XX.....', 'XX.....', 'XX.....', 'XX...XX', '.XXXXX.'],
    'E': ['XXXXXXX', 'XX.....', 'XX.....', 'XXXXXX.', 'XX.....', 'XX.....', 'XXXXXXX'],
    'N': ['XX...XX', 'XXX..XX', 'XXXX.XX', 'XX.XXXX', 'XX..XXX', 'XX...XX', 'XX...XX'],
    'R': ['XXXXXX.', 'XX...XX', 'XX...XX', 'XXXXXX.', 'XX.XX..', 'XX..XX.', 'XX...XX'],
}
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def h(i, k):
    t = math.sin(i * 127.1 + k * 311.7) * 43758.5453
    return t - math.floor(t)


def draw_orb(c, x0, y0, size):
    c.rect(x0, y0, x0 + size, y0 + size, GROUND)
    step = size / 10
    for i in range(81):
        gx, gy = i % 9, i // 9
        d = math.hypot((gx - 4) / 4, (gy - 4) / 4)
        if d > 1.02:
            continue
        v = 1 - d
        r = (1 + v * 4.4) * size / 100
        c.circle(x0 + (gx + 1) * step, y0 + (gy + 1) * step, r, ramp(ORB_RAMP, v))


def draw_wordmark(c, x0, y0, px):
    """The green dithered strip (as in the nav logo), then CENNER on top of it."""
    word = 'CENNER'
    text_w = len(word) * 8 * px
    strip_h = 7 * px + 2 * px * 2.2
    sx0, sy0 = x0 - px * 1.2, y0 - px * 2.2
    open_w = 16 * px
    sw = text_w + open_w
    for y in range(int(sy0), int(sy0 + strip_h)):
        for x in range(int(sx0), int(sx0 + sw)):
            t = (x - sx0) / sw
            a = 0.9 if t < 0.55 else max(0.0, 0.9 * (1 - (t - 0.55) / 0.35))
            c.blend(x, y, lerp(GREEN_A, GREEN_B, min(1, t / 0.55)), a)
    # pale squares over the strip, densest toward the open end, then thinning out
    sq = px * 0.78
    gap = px
    cols, rows = int(sw / gap), int(strip_h / gap)
    for r in range(rows):
        for k in range(cols):
            t = k / max(1, cols - 1)
            dens = min(1, 0.7 + t * 0.5) * min(1, max(0, (1 - t) * 5))
            if (BAYER[r % 4][k % 4] + 0.5) / 16 > dens * 0.85:
                continue
            fade = max(0.0, 1 - max(0.0, t - 0.55) / 0.35)
            a = (0.25 + 0.35 * h(r * 97 + k, 3)) * fade
            jx = (h(r * 31 + k, 1) - 0.5) * gap * 0.6
            c.rect(sx0 + k * gap + jx, sy0 + r * gap, sx0 + k * gap + jx + sq, sy0 + r * gap + sq, MINT, a)
    for li, ch in enumerate(word):
        for ry, row in enumerate(GLYPHS[ch]):
            for rx, bit in enumerate(row):
                if bit == 'X':
                    gx = x0 + li * 8 * px + rx * px
                    gy = y0 + ry * px
                    c.rect(gx, gy, gx + px, gy + px, INK)


def draw_bloom(c, fx, fy, rx, ry, gap, x_min, strength=1.0, faint=True):
    """Halftone bloom: dots swell and colour in toward a focus at the edge, faint grey elsewhere."""
    for gy in range(int(gap / 2), c.h, gap):
        for gx in range(int(gap / 2), c.w, gap):
            if gx < x_min:
                continue
            ex, ey = (gx - fx) / rx, (gy - fy) / ry
            v = math.exp(-(ex * ex + ey * ey) * 1.6) * strength
            # an organic edge: the bloom's outline breathes with the angle
            ang = math.atan2(ey, ex)
            v *= 0.82 + 0.18 * math.sin(3 * ang + 1.3)
            if v > 0.05:
                c.circle(gx, gy, 1.2 + v * gap * 0.36, ramp(BLOOM, v), min(1, 0.25 + v))
            elif faint:
                c.circle(gx, gy, 1.2, INK, 0.05)


def header(out):
    W, H = 1200, 240
    c = Canvas(W, H, PAPER)
    draw_bloom(c, fx=W + 20, fy=H * 0.62, rx=560, ry=230, gap=20, x_min=560)
    # keep the logo side calm: a soft paper wash over the left half of the bloom's tail
    for x in range(560, 760):
        a = (1 - (x - 560) / 200) * 0.85
        for y in range(H):
            c.blend(x, y, PAPER, a)
    draw_orb(c, 64, 64, 112)
    draw_wordmark(c, 200, 99, 6)
    c.png(os.path.join(out, 'header.png'))


def footer(out):
    W, H = 1200, 72
    c = Canvas(W, H, PAPER)
    draw_bloom(c, fx=-30, fy=H + 10, rx=520, ry=120, gap=16, x_min=0, strength=0.75)
    c.png(os.path.join(out, 'footer.png'))


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    header(out)
    footer(out)
    print('wrote', [f for f in os.listdir(out) if f.endswith('.png')])
