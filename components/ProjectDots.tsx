import React, { useEffect, useRef } from 'react';
import { frameLoop } from '../lib/motion';

/**
 * A project's colours as a living halftone, locked inside its own box: dots on the project's darkest
 * colour, with one glow per remaining palette colour drifting around on slow loops (each box
 * rolls the form of its glows: blobs, rings, bands, waves or crosses). Where
 * two glows meet, their colours blend. Only runs while on screen; with reduced motion it is drawn once.
 */

type RGB = [number, number, number];
const rgb = (hex: string): RGB => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };


/**
 * `focus` fades the field out toward the edge of an ellipse (centre x/y as fractions of the box, radii rx/ry as
 * fractions of its width/height) by shrinking the dots, with no CSS mask. `crisp` draws only solid, full-colour dots (nothing half-faded), so text that blends against them with
 * `mix-blend-mode: difference` flips cleanly. `reach` is how far (px) the clear zone around `avoid` text fades out. `fixedForm` keeps one form instead of shapeshifting. The effect is keyed on the palette's *values*, so
 * an inline array does not restart (and re-roll) the animation on every render.
 *
 * `intensity` (0..1) turns the whole field down (smaller, dimmer dots) and `pace` slows or speeds the movement,
 * for places where it should stay calm.
 *
 * `lowerPalette` splits one animation in two along `splitAt` (default the middle): the same moving field, drawn in
 * `palette` above the line and in `lowerPalette` below it (no ground is painted, so each half sits
 * on whatever surface is behind it, e.g. blue on the paper and white on the dark footer).
 *
 * Cost: what doesn't move (each dot's place, its focus fade and its distance from the `avoid` text) is
 * worked out once per size or text change, dots that can never show are dropped, and a frame only works
 * out the glows, at ~20 fps (10 once the visitor is idle), as a few dozen batched fills.
 */
export const ProjectDots: React.FC<{ palette: string[]; lowerPalette?: string[]; splitAt?: number; avoid?: string; intensity?: number; pace?: number; reach?: number; crisp?: boolean; focus?: { x: number; y: number; rx: number; ry: number }; fixedForm?: 'blob' | 'ring' | 'band' | 'wave' | 'cross'; paused?: boolean; className?: string; style?: React.CSSProperties }> = ({ palette, lowerPalette, splitAt = 0.5, avoid, intensity = 1, pace = 1, reach = 30, crisp = false, focus, fixedForm, paused = false, className = '', style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  // `paused`: something opaque covers it (the homepage's screensaver): it holds its frame until uncovered
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const wakeRef = useRef<(() => void) | null>(null);
  useEffect(() => { if (!paused) wakeRef.current?.(); }, [paused]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const [groundHex, ...rest] = palette;
    const ground = rgb(groundHex);
    const cols = rest.map(rgb);
    const ground2 = lowerPalette ? rgb(lowerPalette[0]) : ground;
    const cols2 = lowerPalette ? lowerPalette.slice(1).map(rgb) : cols;
    const painted = !lowerPalette;   // the ground is painted, so a dot's fade can be mixed into its colour (no alpha)
    // Dots are drawn in batches, one path per colour, filled once. The key is the colour's offset from its
    // ground in steps of 4 (never more than 2 levels off, and a faint dot stays exactly on the ground):
    // 8 bits a channel, the half (lowerPalette) in bit 24, and without a painted ground the alpha step above.
    const styles = new Map<number, string>();
    const styleOf = (key: number) => {
      let st = styles.get(key);
      if (!st) {
        const g = (key >> 24) & 1 ? ground2 : ground;
        const ch = (k: number, sh: number) => Math.min(255, Math.max(0, g[k] + (((key >> sh) & 255) - 64) * 4));
        const c = `${ch(0, 16)},${ch(1, 8)},${ch(2, 0)}`;
        const a = Math.floor(key / 33554432);
        st = a ? `rgba(${c},${(a / 16).toFixed(3)})` : `rgb(${c})`;
        styles.set(key, st);
      }
      return st;
    };
    const off = (c: number, g: number) => Math.max(0, Math.min(128, Math.round((c - g) / 4) + 64));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, visible = true;

    // `avoid`: a selector for text the animation must keep clear of. The dots fade out in a soft halo
    // around each match (their rects, in this canvas's own coordinates), read every 300 ms, and at once
    // when the fonts come in, the box resizes, or an inner list scrolls the text past the canvas.
    let rects: { l: number; t: number; r: number; b: number }[] = [];
    let rectsKey = '', rectsAt = -1e9;
    const readRects = (now: number) => {
      if (!avoid) return false;
      rectsAt = now;
      const cb = canvas.getBoundingClientRect();
      const next: typeof rects = [];
      // the text itself (its line boxes), not the often much wider element box, so a link or a
      // paragraph clears only the dots right around its words
      const range = document.createRange();
      document.querySelectorAll(avoid).forEach(el => {
        const eb = el.getBoundingClientRect();
        if (eb.width < 4 || eb.height < 4 || eb.right < cb.left || eb.left > cb.right || eb.bottom < cb.top || eb.top > cb.bottom) return;
        if (el instanceof HTMLInputElement || el instanceof HTMLButtonElement) { next.push({ l: eb.left - cb.left, t: eb.top - cb.top, r: eb.right - cb.left, b: eb.bottom - cb.top }); return; }
        range.selectNodeContents(el);
        const lines = range.getClientRects();
        for (let i = 0; i < lines.length; i++) {
          const rr = lines[i];
          if (rr.width < 2 || rr.height < 2) continue;
          next.push({ l: rr.left - cb.left, t: rr.top - cb.top, r: rr.right - cb.left, b: rr.bottom - cb.top });
        }
      });
      const key = next.map(q => `${q.l | 0},${q.t | 0},${q.r | 0},${q.b | 0}`).join(';');
      if (key === rectsKey) return false;
      rectsKey = key; rects = next;
      return true;
    };
    const clear = (x: number, y: number) => {
      let d = 1e9;
      for (const q of rects) {
        const dx = Math.max(q.l - x, 0, x - q.r), dy = Math.max(q.t - y, 0, y - q.b);
        const dd = Math.hypot(dx, dy);
        if (dd < d) d = dd;
      }
      // a gaussian falloff, like the text mask had been blurred: no kink where the clear zone ends
      const e = Math.max(0, d - 6) / reach;
      return 1 - Math.exp(-e * e * 2.2);
    };

    // The dots that can show, with what about them never changes: place, which half, and weight (focus x text halo).
    let N = 0, gap = 13;
    let xs = new Float32Array(0), ys = new Float32Array(0), wt = new Float32Array(0), low = new Uint8Array(0);
    const layout = () => {
      gap = w < 360 ? 11 : 13;
      const px: number[] = [], py: number[] = [], pw: number[] = [], pl: number[] = [];
      // the weakest a dot can be and still show (crisp: half strength; otherwise a barely-there 2%)
      const cut = (crisp ? 0.42 : 0.02) / Math.max(0.001, intensity);
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2 + ((Math.round(y / gap)) % 2 ? gap / 2 : 0); x < w; x += gap) {
          let v = avoid ? clear(x, y) : 1;
          if (focus) {
            // fade by shrinking and then dropping dots toward the edge of an ellipse (instead of a CSS
            // mask, which would leave half-grey dots), so every dot that remains is solid
            const dd = Math.hypot((x / w - focus.x) / focus.rx, (y / h - focus.y) / focus.ry);
            const f = Math.min(1, Math.max(0, (1 - dd) / 0.7));
            v *= f * f * (3 - 2 * f);
          }
          // a dot whose weight can't lift it over the cut never shows. (Without a painted ground, lowerPalette,
          // even the weakest dot shows as a faint ground-coloured point on whatever is behind, so all stay.)
          if ((painted || crisp) && v < cut) continue;
          px.push(x); py.push(y); pw.push(v); pl.push(lowerPalette && y > h * splitAt ? 1 : 0);
        }
      }
      N = px.length;
      xs = Float32Array.from(px); ys = Float32Array.from(py); wt = Float32Array.from(pw); low = Uint8Array.from(pl);
    };

    // The glows take a form (blobs, rings, bands, waves, crosses) and keep changing it: the box
    // shuffles its own order of forms and melts from one into the next, like a lava lamp.
    const FORMS = ['blob', 'ring', 'band', 'wave', 'cross'] as const;
    type Form = typeof FORMS[number];
    const order = fixedForm ? [fixedForm] : [...FORMS].sort(() => Math.random() - 0.5);
    const hold = 7 + Math.random() * 6;                    // seconds per form, melting included
    // ca/sa: the glow's angle (cos, sin); wv: the wave's phase. All worked out once per glow per frame.
    const one = (f: Form, dx: number, dy: number, ca: number, sa: number, wv: number) => {
      switch (f) {
        case 'ring': { const d = Math.sqrt(dx * dx + dy * dy); const e = (d - 0.7) / 0.24; return Math.exp(-e * e - d * d * 0.35); }
        case 'band': { const u = (dx * ca + dy * sa) / 0.3; return Math.exp(-u * u - (dx * dx + dy * dy) * 0.18); }
        case 'wave': { const e = (dy - 0.38 * Math.sin(dx * 3.2 + wv)) / 0.26; return Math.exp(-e * e - dx * dx * 0.45); }
        case 'cross': {
          const u = (dx * ca + dy * sa) / 0.26, v = (-dx * sa + dy * ca) / 0.26;
          return Math.exp(-Math.min(u * u, v * v) - (dx * dx + dy * dy) * 0.3);
        }
        default: return Math.exp(-(dx * dx + dy * dy) * 1.6);
      }
    };
    const rnd = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
    const speed = rnd(0.6, 1.8);
    const path = cols.map(() => ({
      ax: rnd(0.12, 0.34), bx: rnd(0, 0.14), ay: rnd(0.1, 0.32), by: rnd(0, 0.14),
      fx: rnd(0.08, 0.5) * speed * (Math.random() < 0.5 ? -1 : 1), gx: rnd(0.2, 0.9) * speed,
      fy: rnd(0.08, 0.5) * speed * (Math.random() < 0.5 ? -1 : 1), gy: rnd(0.2, 0.9) * speed,
      px: rnd(0, 6.28), py: rnd(0, 6.28), qx: rnd(0, 6.28), qy: rnd(0, 6.28),
      r: rnd(0.38, 0.62), fr: rnd(0.2, 0.7),
    }));
    const G = cols.length;
    const gx = new Float32Array(G), gy = new Float32Array(G), gs = new Float32Array(G);
    const gca = new Float32Array(G), gsa = new Float32Array(G), gwv = new Float32Array(G);

    const size = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(canvas.width / Math.max(1, w), 0, 0, canvas.height / Math.max(1, h), 0, 0);
    };

    const batches = new Map<number, Path2D>();
    const draw = (now: number) => {
      if (!w || !h) return;
      if (avoid && now - rectsAt > 300 && readRects(now)) layout();
      const t = reduce ? 0 : now * 0.001 * pace;
      if (painted) { ctx.fillStyle = groundHex; ctx.fillRect(0, 0, w, h); } else ctx.clearRect(0, 0, w, h);
      // one glow per colour; every card rolls its own paths when it mounts, so no two move alike
      const m0 = Math.min(w, h);
      for (let i = 0; i < G; i++) {
        const q = path[i];
        gx[i] = w * (0.5 + q.ax * Math.sin(t * q.fx + q.px) + q.bx * Math.sin(t * q.gx + q.qx));
        gy[i] = h * (0.5 + q.ay * Math.cos(t * q.fy + q.py) + q.by * Math.sin(t * q.gy + q.qy));
        gs[i] = 1 / (m0 * (q.r + 0.08 * Math.sin(t * q.fr + q.px)));
        const ang = q.px + t * q.fr * 0.6;
        gca[i] = Math.cos(ang); gsa[i] = Math.sin(ang); gwv[i] = t * 0.9 + ang;
      }
      // the form now, the next one, and how far the melt between them has got (the same for every dot)
      const seg = t / hold, k = Math.floor(seg), p = seg - k;
      const mm = Math.min(1, Math.max(0, (p - 0.5) / 0.5));   // hold for half the time, then melt
      const melt = mm * mm * (3 - 2 * mm);
      const fa = order[k % order.length], fb = order[(k + 1) % order.length];
      const both = melt >= 0.001 && fb !== fa;

      batches.clear();
      for (let n = 0; n < N; n++) {
        const x = xs[n], y = ys[n], lo = low[n] === 1;
        let sum = 0, r = 0, g = 0, b = 0;
        for (let i = 0; i < G; i++) {
          const s = gs[i], dx = (x - gx[i]) * s, dy = (y - gy[i]) * s;
          let v = one(fa, dx, dy, gca[i], gsa[i], gwv[i]);
          if (both) v += (one(fb, dx, dy, gca[i], gsa[i], gwv[i]) - v) * melt;
          const c = lo ? cols2[i] ?? cols[i] : cols[i];
          sum += v; r += c[0] * v; g += c[1] * v; b += c[2] * v;
        }
        const v = Math.min(1, sum) * intensity * wt[n];
        // crisp: only full-strength dots (no dim, half-faded ones), for text that blends with them
        if (crisp ? v < 0.42 : painted && v < 0.02) continue;
        const gr = lo ? ground2 : ground;
        const kk = sum > 0.0001 ? 1 / sum : 0;
        // the blend of the colours near this dot, fading out of the ground
        const m = crisp ? 1 : Math.min(1, v * 1.15);
        const a = crisp ? 1 : Math.min(1, 0.18 + 0.82 * v);
        let cr = gr[0] + (r * kk - gr[0]) * m, cg = gr[1] + (g * kk - gr[1]) * m, cb = gr[2] + (b * kk - gr[2]) * m;
        let key: number;
        if (painted) {
          // over a painted ground the dot's fade is a mix toward the ground: the same pixels, no alpha
          cr = gr[0] + (cr - gr[0]) * a; cg = gr[1] + (cg - gr[1]) * a; cb = gr[2] + (cb - gr[2]) * a;
          key = (off(cr, gr[0]) << 16) | (off(cg, gr[1]) << 8) | off(cb, gr[2]);
          if (key === 0x404040) continue;                  // within 2 levels of the ground: nothing to see
        } else {
          key = (off(cr, gr[0]) << 16) | (off(cg, gr[1]) << 8) | off(cb, gr[2]) | (lo ? 1 << 24 : 0);
          key += Math.max(1, Math.min(16, Math.round(a * 16))) * 33554432;
        }
        // crisp dots only exist big and close together: the field is either a near-solid white patch
        // (text over it turns dark and reads cleanly) or empty (text stays white), with a narrow edge between
        const rad = crisp ? gap * (0.32 + 0.2 * Math.min(1, (v - 0.42) / 0.5)) : 0.9 + v * (gap * 0.3);
        let pth = batches.get(key);
        if (!pth) { pth = new Path2D(); batches.set(key, pth); }
        pth.moveTo(x + rad, y); pth.arc(x, y, rad, 0, 6.2832);
      }
      batches.forEach((pth, key) => { ctx.fillStyle = styleOf(key); ctx.fill(pth); });
    };

    // A box off screen is only measured, and drawn once it comes near (150px early, so it is never seen
    // blank); a long blog list costs nothing until it is scrolled to. A box already near is drawn at once.
    let drawn = false;
    const show = (now: number) => { drawn = true; draw(now); };
    const near = () => {
      const r = canvas.getBoundingClientRect();
      return r.width > 0 && r.bottom > -150 && r.top < window.innerHeight + 150 && r.right > 0 && r.left < window.innerWidth;
    };
    const refit = () => {
      size(); readRects(performance.now()); layout();
      visible = near();
      if (visible) show(reduce ? 0 : performance.now()); else drawn = false;
    };
    // slow fields (the homepage wallpaper drifts at pace .3) look the same at ~12 fps
    const ms = pace <= 0.4 ? 80 : 50;
    const loop = reduce ? null : frameLoop(show, ms, ms * 2, () => visible && !pausedRef.current);
    wakeRef.current = () => loop?.wake();
    refit();
    const ro = new ResizeObserver(refit);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!visible) return;
      if (!drawn) show(reduce ? 0 : performance.now());
      loop?.wake();
    }, { rootMargin: '150px 0px' });
    io.observe(canvas);
    // The halo is read again on the next frame when text moves against the canvas: an inner list scrolls
    // (the phone homepage's Today screen), or the window resizes and the text reflows.
    const stale = (e: Event) => { if (e.type === 'resize' || e.target !== document) rectsAt = -1e9; };
    if (avoid) {
      document.addEventListener('scroll', stale, { capture: true, passive: true });
      window.addEventListener('resize', stale, { passive: true });
    }
    // the halo follows the text once the web fonts have swapped in
    let alive = true;
    document.fonts?.ready.then(() => { if (alive && readRects(performance.now())) { layout(); if (visible) show(reduce ? 0 : performance.now()); } });
    return () => {
      alive = false; wakeRef.current = null; loop?.stop(); ro.disconnect(); io.disconnect();
      document.removeEventListener('scroll', stale, true);
      window.removeEventListener('resize', stale);
    };
  }, [palette.join(), lowerPalette?.join(), fixedForm, avoid]);

  return <canvas ref={ref} aria-hidden="true" className={`block ${className}`} style={style} />;
};

export default ProjectDots;
