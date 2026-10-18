import React, { useEffect, useRef } from 'react';
import { dotGradient, hash, pickHue } from '../lib/dotColour';

/**
 * The full-page dot background for every page except the homepage: a faint halftone grid across
 * the whole page, with hotspots down its length where the dots swell and a colour comes in.
 *
 *  - every hotspot has its own colour, picked from the page's seed: page colour -> colour -> a
 *    nearby second hue at the brightest point, so each one melts into the paper around it;
 *  - hotspots sit in the page itself and travel a little slower than the content, and drift
 *    slowly on their own, so scrolling feels like passing through them;
 *  - text in the open (headings, paragraphs, labels, anything marked `data-calm`) sits in a quiet
 *    zone where the dots fade almost out; text inside cards and coloured bands is skipped, since those are
 *    opaque and hide the canvas anyway;
 *  - it is fixed behind everything (Layout isolates the page so `-z-10` lands above the paper but
 *    below all content), and the footer is opaque, so the art ends where the footer begins.
 *
 * With reduced motion it is drawn once and stays still.
 */

const GAP = 14;
const PAPER = '#eef0f3';
const FLOOR = 0.1;
/** Soft edges for the quiet zones: two passes of a small box blur over the dot grid. */
function blurGrid(a: Float32Array, cols: number, rows: number, radius: number, passes: number) {
  const tmp = new Float32Array(a.length);
  const span = radius * 2 + 1;
  for (let k = 0; k < passes; k++) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let sum = 0;
        for (let d = -radius; d <= radius; d++) sum += a[y * cols + Math.min(cols - 1, Math.max(0, x + d))];
        tmp[y * cols + x] = sum / span;
      }
    }
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let sum = 0;
        for (let d = -radius; d <= radius; d++) sum += tmp[Math.min(rows - 1, Math.max(0, y + d)) * cols + x];
        a[y * cols + x] = sum / span;
      }
    }
  }
}

const SELECTOR = 'main h1, main h2, main h3, main p, main label, main li, main dt, main dd, [data-calm]';
/** Cards and boxes: the dots fade out as they near their edges instead of stopping dead at them. */
const BOXES = 'main .bg-white, main .bg-paper2';
const OPAQUE = '.bg-white, .bg-ink, .bg-paper2, .bg-sky, .bg-brand-green, [data-opaque]';

type Spot = { fx: number; fy: number; rad: number; phase: number; grad: (v: number) => string };

export const PageBackdrop: React.FC<{ seed: string }> = ({ seed }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const h = hash(seed);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let vw = 0, vh = 0, raf = 0, last = 0;

    // The hotspots, as fractions of the page's content height, each with a colour of its own.
    const count = 5;
    const base = pickHue(seed);                    // one hue per page: a strong colour and its washed tint
    const SPREAD = [0, 6, -6, 3, -3];
    const spots: Spot[] = Array.from({ length: count }, (_, i) => {
      const r = ((h >>> (i * 3)) ^ (h * (i + 3))) >>> 0;
      const jitter = ((r % 100) / 100 - 0.5) * (0.5 / count);
      // on wide screens most of the page's centre is text, so the hotspots drift out toward the empty margins
      let fx = 0.08 + (((r >>> 4) % 100) / 100) * 0.84;
      if (window.innerWidth > 1100 && fx > 0.25 && fx < 0.75) fx = fx < 0.5 ? fx * 0.45 : 1 - (1 - fx) * 0.45;
      return {
        fx,
        fy: Math.min(0.98, Math.max(0.02, (i + 0.5) / count + jitter)),
        rad: 230 + ((r >>> 9) % 150),
        phase: ((r >>> 13) % 628) / 100,
        grad: dotGradient(`${seed}#${i}`, PAPER, false, (base + SPREAD[i % SPREAD.length] + 360) % 360),
      };
    });

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = window.innerWidth; vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, vw, vh);
      const sy = window.scrollY;
      const t = reduce ? 0 : now;

      // where the content runs, in page coordinates
      const main = document.querySelector('main');
      const mb = main ? main.getBoundingClientRect() : null;
      const top = mb ? mb.top + sy : 0;
      const height = main ? main.offsetHeight : Math.max(vh, document.documentElement.scrollHeight);

      // the quiet zones, on the dot grid
      const cols = Math.ceil(vw / GAP) + 2, rows = Math.ceil(vh / GAP) + 2;
      const floor = vw < 700 ? 0.2 : FLOOR;
      const text = new Float32Array(cols * rows);      // 1 where there is text (padded), else 0
      const paint = (l: number, tp: number, r: number, b: number) => {
        const c0 = Math.max(0, Math.floor(l / GAP)), c1 = Math.min(cols - 1, Math.floor(r / GAP));
        const r0 = Math.max(0, Math.floor(tp / GAP)), r1 = Math.min(rows - 1, Math.floor(b / GAP));
        for (let ry = r0; ry <= r1; ry++) for (let cx = c0; cx <= c1; cx++) text[ry * cols + cx] = 1;
      };
      // Only the text itself: its line boxes, not the (often much wider) element box, so the width of a
      // paragraph or a card never shows in the dots. Marked blocks use their own box.
      const range = document.createRange();
      document.querySelectorAll(SELECTOR).forEach(el => {
        const eb = el.getBoundingClientRect();
        if (eb.width < 4 || eb.height < 4 || eb.bottom < -GAP * 6 || eb.top > vh + GAP * 6) return;
        if (!el.hasAttribute('data-calm') && el.closest(OPAQUE)) return;
        if (el.hasAttribute('data-calm')) { paint(eb.left, eb.top, eb.right, eb.bottom); return; }
        range.selectNodeContents(el);
        const lines = range.getClientRects();
        for (let i = 0; i < lines.length; i++) {
          const b = lines[i];
          if (b.width < 2 || b.height < 2) continue;
          paint(b.left - 14, b.top - 12, b.right + 14, b.bottom + 12);
        }
      });
      // A wide, soft falloff, then lifted so even a single short label still gets a full quiet zone.
      blurGrid(text, cols, rows, 3, 3);
      // A softer halo around cards and boxes, so their ends blend into the colours.
      const box = new Float32Array(cols * rows);
      document.querySelectorAll(BOXES).forEach(el => {
        const b = el.getBoundingClientRect();
        if (b.width < 120 || b.height < 36 || b.bottom < -GAP * 5 || b.top > vh + GAP * 5) return;
        const l = Math.max(0, Math.floor((b.left + 4) / GAP)), r = Math.min(cols - 1, Math.floor((b.right - 4) / GAP));
        const t = Math.max(0, Math.floor((b.top + 4) / GAP)), bt = Math.min(rows - 1, Math.floor((b.bottom - 4) / GAP));
        for (let ry = t; ry <= bt; ry++) for (let cx = l; cx <= r; cx++) box[ry * cols + cx] = 1;
      });
      blurGrid(box, cols, rows, 2, 2);
      const calm = new Float32Array(cols * rows);
      for (let i = 0; i < calm.length; i++) {
        const quietText = 1 - (1 - floor) * Math.min(1, text[i] * 2.4);
        const quietBox = 1 - 0.75 * Math.min(1, box[i] * 1.5);
        calm[i] = Math.min(quietText, quietBox);
      }

      // hotspots on screen: slower than the content, drifting a little on their own
      const live = spots.map(s => ({
        x: s.fx * vw + Math.sin(t * 0.00018 + s.phase) * 38,
        y: top + s.fy * height - sy * 0.8 + Math.cos(t * 0.00014 + s.phase) * 30,
        rad: s.rad * (0.94 + 0.06 * Math.sin(t * 0.0003 + s.phase)),
        grad: s.grad,
      }));

      const ox = reduce ? 0 : Math.sin(sy * 0.004) * GAP * 0.5;
      const oy = reduce ? 0 : -(sy * 0.12) % GAP;
      for (let y = oy - GAP; y < vh + GAP; y += GAP) {
        for (let x = ox - GAP; x < vw + GAP; x += GAP) {
          let v = 0, best: (typeof live)[number] | null = null;
          for (const s of live) {
            const dx = (x - s.x) / s.rad, dy = (y - s.y) / s.rad;
            const d = Math.exp(-(dx * dx + dy * dy));
            if (d > v) { v = d; best = s; }
          }
          const ci = Math.min(rows - 1, Math.max(0, Math.floor(y / GAP))) * cols + Math.min(cols - 1, Math.max(0, Math.floor(x / GAP)));
          const m = calm[ci];
          // the colour fades out over the last stretch of the page, so nothing sits behind the footer's own animation
          const tail = Math.min(1, Math.max(0, (top + height - sy - y) / 340));
          const vm = v * m * tail * tail * (3 - 2 * tail);
          if (best && vm > 0.04) {
            ctx.globalAlpha = Math.min(0.85, 0.14 + vm * 0.75);
            ctx.fillStyle = best.grad(vm);
            ctx.beginPath(); ctx.arc(x, y, 0.9 + vm * 3.8, 0, 6.2832); ctx.fill();
            ctx.globalAlpha = 1;
          } else {
            ctx.fillStyle = `rgba(11,12,14,${0.035 * (0.4 + 0.6 * m)})`;
            ctx.beginPath(); ctx.arc(x, y, 0.9, 0, 6.2832); ctx.fill();
          }
        }
      }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden || now - last < 66) return;     // about 15 frames a second is enough for a slow drift
      last = now;
      draw(now);
    };

    const onResize = () => { size(); draw(performance.now()); };

    size();
    draw(0);
    // the page grows once its text and images are in: draw again when it has settled
    const settle = window.setTimeout(() => draw(performance.now()), 700);
    window.addEventListener('resize', onResize);
    if (reduce) window.addEventListener('scroll', onResize, { passive: true });
    else raf = requestAnimationFrame(tick);
    return () => {
      window.clearTimeout(settle);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize);
    };
  }, [seed]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
};

export default PageBackdrop;
