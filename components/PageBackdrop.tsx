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

type Spot = { fx: number; fy: number; rad: number; phase: number; rot: number; spin: number; grad: (v: number) => string };

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
        rot: ((r >>> 5) % 628) / 100,
        spin: (((r >>> 11) % 2 ? 1 : -1) * (0.00003 + ((r >>> 2) % 30) / 1e6)),
        grad: dotGradient(`${seed}#${i}`, PAPER, false, (base + SPREAD[i % SPREAD.length] + 360) % 360),
      };
    });

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = window.innerWidth; vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // The quiet-zone mask lives in PAGE coordinates over a window around the viewport, so scrolling only
    // shifts which rows are read: it is rebuilt when the window runs out or every half second (content changes).
    const MARGIN = 420;
    let win: { top: number; rows: number; calm: Float32Array; at: number; mainTop: number; mainH: number } | null = null;
    const cols = () => Math.ceil(vw / GAP) + 2;

    const buildMask = (sy: number, now: number) => {
      const C = cols();
      const winTop = Math.floor((sy - MARGIN) / GAP) * GAP;
      const R = Math.ceil((vh + MARGIN * 2) / GAP) + 2;
      const floor = vw < 700 ? 0.2 : FLOOR;
      const text = new Float32Array(C * R);
      const paint = (l: number, tp: number, r: number, b: number) => {   // page coordinates
        const c0 = Math.max(0, Math.floor(l / GAP)), c1 = Math.min(C - 1, Math.floor(r / GAP));
        const r0 = Math.max(0, Math.floor((tp - winTop) / GAP)), r1 = Math.min(R - 1, Math.floor((b - winTop) / GAP));
        for (let ry = r0; ry <= r1; ry++) for (let cx = c0; cx <= c1; cx++) text[ry * C + cx] = 1;
      };
      const lo = winTop - GAP * 6, hi = winTop + R * GAP + GAP * 6;
      const range = document.createRange();
      document.querySelectorAll(SELECTOR).forEach(el => {
        const eb = el.getBoundingClientRect();
        if (eb.width < 4 || eb.height < 4 || eb.bottom + sy < lo || eb.top + sy > hi) return;
        if (!el.hasAttribute('data-calm') && el.closest(OPAQUE)) return;
        if (el.hasAttribute('data-calm')) { paint(eb.left, eb.top + sy, eb.right, eb.bottom + sy); return; }
        range.selectNodeContents(el);
        const lines = range.getClientRects();
        for (let i = 0; i < lines.length; i++) {
          const b = lines[i];
          if (b.width < 2 || b.height < 2) continue;
          paint(b.left - 14, b.top + sy - 12, b.right + 14, b.bottom + sy + 12);
        }
      });
      blurGrid(text, C, R, 3, 3);
      const box = new Float32Array(C * R);
      document.querySelectorAll(BOXES).forEach(el => {
        const b = el.getBoundingClientRect();
        if (b.width < 120 || b.height < 36 || b.bottom + sy < lo || b.top + sy > hi) return;
        const l = Math.max(0, Math.floor((b.left + 4) / GAP)), r = Math.min(C - 1, Math.floor((b.right - 4) / GAP));
        const t = Math.max(0, Math.floor((b.top + sy + 4 - winTop) / GAP)), bt = Math.min(R - 1, Math.floor((b.bottom + sy - 4 - winTop) / GAP));
        for (let ry = t; ry <= bt; ry++) for (let cx = l; cx <= r; cx++) box[ry * C + cx] = 1;
      });
      blurGrid(box, C, R, 2, 2);
      const calm = new Float32Array(C * R);
      for (let i = 0; i < calm.length; i++) {
        const quietText = 1 - (1 - floor) * Math.min(1, text[i] * 2.4);
        const quietBox = 1 - 0.75 * Math.min(1, box[i] * 1.5);
        calm[i] = Math.min(quietText, quietBox);
      }
      const main = document.querySelector('main');
      const mb = main ? main.getBoundingClientRect() : null;
      win = {
        top: winTop, rows: R, calm, at: now,
        mainTop: mb ? mb.top + sy : 0,
        mainH: main ? main.offsetHeight : Math.max(vh, document.documentElement.scrollHeight),
      };
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, vw, vh);
      const sy = window.scrollY;
      const t = reduce ? 0 : now;
      if (!win || sy < win.top + MARGIN * 0.4 || sy + vh > win.top + win.rows * GAP - MARGIN * 0.4 || now - win.at > 500) buildMask(sy, now);
      const w = win!;
      const C = cols();

      // The blobs ride behind the page at a slower speed, and each one slowly changes shape:
      // it stretches, turns, and its edge breathes in and out, like the forms in the cards.
      const live = spots.map(sp => {
        const el = 1 + 0.38 * Math.sin(t * 0.00021 + sp.phase);
        const th = sp.rot + t * sp.spin;
        return {
          x: sp.fx * vw + Math.sin(t * 0.00018 + sp.phase) * 46,
          // depth: a blob crosses the middle of the screen when its place in the page does, but travels at 0.6 of
          // the content's speed, so the colour slides through the dots as you scroll (a parallax layer behind the page)
          y: sy + vh * 0.5 + ((w.mainTop + sp.fy * w.mainH) - (sy + vh * 0.5)) * 0.6 + Math.cos(t * 0.00014 + sp.phase) * 36,
          rad: sp.rad * (0.94 + 0.06 * Math.sin(t * 0.0003 + sp.phase)),
          c: Math.cos(th), s: Math.sin(th), el, ph: sp.phase, grad: sp.grad,
        };
      });

      const j0 = Math.floor(sy / GAP) - 1, j1 = Math.ceil((sy + vh) / GAP) + 1;
      const i1 = Math.ceil(vw / GAP) + 1;
      const base = new Path2D();
      for (let j = j0; j <= j1; j++) {
        const yp = j * GAP, y = yp - sy;
        const row = j - w.top / GAP;
        for (let i = -1; i <= i1; i++) {
          const x = i * GAP + GAP * 0.5;
          let v = 0, best: (typeof live)[number] | null = null;
          for (const s of live) {
            const dx = x - s.x, dy = yp - s.y;
            if (dx * dx + dy * dy > s.rad * s.rad * 6) continue;
            const u = (dx * s.c + dy * s.s) / (s.rad * s.el), q = (-dx * s.s + dy * s.c) / (s.rad / s.el);
            const ang = Math.atan2(q, u);
            const wob = 1 + 0.2 * Math.sin(3 * ang + t * 0.00033 + s.ph) + 0.1 * Math.sin(2 * ang - t * 0.00027 + s.ph * 1.7);
            const d = Math.exp(-(u * u + q * q) / (wob * wob));
            if (d > v) { v = d; best = s; }
          }
          const ci = Math.min(w.rows - 1, Math.max(0, row)) * C + Math.min(C - 1, Math.max(0, i));
          const m = w.calm[ci];
          // the colour fades out over the last stretch of the page, so nothing sits behind the footer's own animation
          const tail = Math.min(1, Math.max(0, (w.mainTop + w.mainH - yp) / 340));
          const vm = v * m * tail * tail * (3 - 2 * tail) * 0.88;
          if (best && vm > 0.04) {
            ctx.globalAlpha = Math.min(0.75, 0.12 + vm * 0.7);
            ctx.fillStyle = best.grad(vm);
            ctx.beginPath(); ctx.arc(x, y, 0.9 + vm * 3.3, 0, 6.2832); ctx.fill();
          } else if (m > 0.3) {
            base.moveTo(x + 0.9, y); base.arc(x, y, 0.9, 0, 6.2832);
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(11,12,14,0.03)';
      ctx.fill(base);
    };

    let lastSy = -1;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      const sy = window.scrollY;
      // while the page is scrolling, redraw every frame so the dots travel with the content; otherwise a gentle ~15fps
      if (sy === lastSy && now - last < 66) return;
      lastSy = sy; last = now;
      draw(now);
    };

    const onResize = () => { size(); win = null; draw(performance.now()); };

    size();
    draw(0);
    // the page grows once its text and images are in: draw again when it has settled
    const settle = window.setTimeout(() => { win = null; draw(performance.now()); }, 700);
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
