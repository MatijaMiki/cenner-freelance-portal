import React, { useEffect, useRef } from 'react';

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
 */
export const ProjectDots: React.FC<{ palette: string[]; lowerPalette?: string[]; splitAt?: number; avoid?: string; intensity?: number; pace?: number; reach?: number; crisp?: boolean; focus?: { x: number; y: number; rx: number; ry: number }; fixedForm?: 'blob' | 'ring' | 'band' | 'wave' | 'cross'; className?: string; style?: React.CSSProperties }> = ({ palette, lowerPalette, splitAt = 0.5, avoid, intensity = 1, pace = 1, reach = 30, crisp = false, focus, fixedForm, className = '', style }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const [groundHex, ...rest] = palette;
    const ground = rgb(groundHex);
    const cols = rest.map(rgb);
    const ground2 = lowerPalette ? rgb(lowerPalette[0]) : ground;
    const cols2 = lowerPalette ? lowerPalette.slice(1).map(rgb) : cols;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, raf = 0, last = 0, visible = true;
    // `avoid`: a selector for text the animation must keep clear of. The dots fade out in a soft halo
    // around each match (their rects, in this canvas's own coordinates, refreshed about once a second).
    let rects: { l: number; t: number; r: number; b: number }[] = [];
    let rectsAt = -1e9;
    const readRects = (now: number) => {
      if (!avoid || now - rectsAt < 300) return;
      rectsAt = now;
      const cb = canvas.getBoundingClientRect();
      rects = [];
      // the text itself (its line boxes), not the often much wider element box, so a link or a
      // paragraph clears only the dots right around its words
      const range = document.createRange();
      document.querySelectorAll(avoid).forEach(el => {
        const eb = el.getBoundingClientRect();
        if (eb.width < 4 || eb.height < 4 || eb.right < cb.left || eb.left > cb.right || eb.bottom < cb.top || eb.top > cb.bottom) return;
        if (el instanceof HTMLInputElement || el instanceof HTMLButtonElement) { rects.push({ l: eb.left - cb.left, t: eb.top - cb.top, r: eb.right - cb.left, b: eb.bottom - cb.top }); return; }
        range.selectNodeContents(el);
        const lines = range.getClientRects();
        for (let i = 0; i < lines.length; i++) {
          const rr = lines[i];
          if (rr.width < 2 || rr.height < 2) continue;
          rects.push({ l: rr.left - cb.left, t: rr.top - cb.top, r: rr.right - cb.left, b: rr.bottom - cb.top });
        }
      });
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
    // The glows take a form (blobs, rings, bands, waves, crosses) and keep changing it: the box
    // shuffles its own order of forms and melts from one into the next, like a lava lamp.
    const FORMS = ['blob', 'ring', 'band', 'wave', 'cross'] as const;
    type Form = typeof FORMS[number];
    const order = fixedForm ? [fixedForm] : [...FORMS].sort(() => Math.random() - 0.5);
    const hold = 7 + Math.random() * 6;                    // seconds per form, melting included
    const one = (f: Form, dx: number, dy: number, ang: number, t: number) => {
      switch (f) {
        case 'ring': { const d = Math.hypot(dx, dy); const e = (d - 0.7) / 0.24; return Math.exp(-e * e) * Math.exp(-d * d * 0.35); }
        case 'band': { const u = dx * Math.cos(ang) + dy * Math.sin(ang); return Math.exp(-(u / 0.3) * (u / 0.3)) * Math.exp(-(dx * dx + dy * dy) * 0.18); }
        case 'wave': { const e = (dy - 0.38 * Math.sin(dx * 3.2 + t * 0.9 + ang)) / 0.26; return Math.exp(-e * e) * Math.exp(-dx * dx * 0.45); }
        case 'cross': {
          const u = dx * Math.cos(ang) + dy * Math.sin(ang), v = -dx * Math.sin(ang) + dy * Math.cos(ang);
          return Math.max(Math.exp(-(u / 0.26) * (u / 0.26)), Math.exp(-(v / 0.26) * (v / 0.26))) * Math.exp(-(dx * dx + dy * dy) * 0.3);
        }
        default: return Math.exp(-(dx * dx + dy * dy) * 1.6);
      }
    };
    const field = (dx: number, dy: number, ang: number, t: number) => {
      const seg = t / hold, k = Math.floor(seg), p = seg - k;
      const m = Math.min(1, Math.max(0, (p - 0.5) / 0.5)); // hold for half the time, then melt
      const e = m * m * (3 - 2 * m);
      const a = one(order[k % order.length], dx, dy, ang, t);
      return e < 0.001 ? a : a + (one(order[(k + 1) % order.length], dx, dy, ang, t) - a) * e;
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

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      if (!w || !h) return;
      const t = reduce ? 0 : now * 0.001 * pace;
      readRects(now);
      if (lowerPalette) ctx.clearRect(0, 0, w, h); else { ctx.fillStyle = groundHex; ctx.fillRect(0, 0, w, h); }
      // one glow per colour; every card rolls its own paths when it mounts, so no two move alike
      const blobs = cols.map((c, i) => {
        const q = path[i];
        return {
          x: w * (0.5 + q.ax * Math.sin(t * q.fx + q.px) + q.bx * Math.sin(t * q.gx + q.qx)),
          y: h * (0.5 + q.ay * Math.cos(t * q.fy + q.py) + q.by * Math.sin(t * q.gy + q.qy)),
          r: Math.min(w, h) * (q.r + 0.08 * Math.sin(t * q.fr + q.px)),
          ang: q.px + t * q.fr * 0.6,
          c, c2: cols2[i] ?? c,
        };
      });
      const gap = w < 360 ? 11 : 13;
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2 + ((Math.round(y / gap)) % 2 ? gap / 2 : 0); x < w; x += gap) {
          const low = !!lowerPalette && y > h * splitAt;
          const gr = low ? ground2 : ground;
          let sum = 0, r = 0, g = 0, b = 0;
          for (const o of blobs) {
            const dx = (x - o.x) / o.r, dy = (y - o.y) / o.r;
            const v = field(dx, dy, o.ang, t);
            const c = low ? o.c2 : o.c;
            sum += v; r += c[0] * v; g += c[1] * v; b += c[2] * v;
          }
          let v = Math.min(1, sum) * intensity * (avoid ? clear(x, y) : 1);
          if (focus) {
            // fade by shrinking and then dropping dots toward the edge of an ellipse (instead of a CSS
            // mask, which would leave half-grey dots), so every dot that remains is solid
            const dd = Math.hypot((x / w - focus.x) / focus.rx, (y / h - focus.y) / focus.ry);
            const f = Math.min(1, Math.max(0, (1 - dd) / 0.7));
            v *= f * f * (3 - 2 * f);
          }
          const k = sum > 0.0001 ? 1 / sum : 0;
          // the blend of the colours near this dot, fading out of the ground
          // crisp: only full-strength dots (no dim, half-faded ones), for text that blends with them
          if (crisp && v < 0.42) continue;
          const m = crisp ? 1 : Math.min(1, v * 1.15);
          const cr = gr[0] + (r * k - gr[0]) * m, cg = gr[1] + (g * k - gr[1]) * m, cb = gr[2] + (b * k - gr[2]) * m;
          ctx.fillStyle = `rgb(${cr | 0},${cg | 0},${cb | 0})`;
          ctx.globalAlpha = crisp ? 1 : Math.min(1, 0.18 + 0.82 * v);
          // crisp dots only exist big and close together: the field is either a near-solid white patch
          // (text over it turns dark and reads cleanly) or empty (text stays white), with a narrow edge between
          const cr2 = crisp ? gap * (0.32 + 0.2 * Math.min(1, (v - 0.42) / 0.5)) : 0.9 + v * (gap * 0.3);
          ctx.beginPath(); ctx.arc(x, y, cr2, 0, 6.2832); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden || now - last < 50) return;
      last = now; draw(now);
    };

    size(); draw(0);
    const ro = new ResizeObserver(() => { size(); draw(performance.now()); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    if (!reduce) raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [palette.join(), lowerPalette?.join(), fixedForm, avoid]);

  return <canvas ref={ref} aria-hidden="true" className={`block ${className}`} style={style} />;
};

export default ProjectDots;
