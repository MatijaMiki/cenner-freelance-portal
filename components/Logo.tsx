import React from 'react';
import { frameLoop } from '../lib/motion';

/**
 * The Cenner mark: a halftone orb. A 9 x 9 grid of dots on the near-black ground the blog covers use,
 * cut to a circle, every dot bigger and warmer toward the centre (violet at the rim, through pink, to gold),
 * set beside a wordmark in the pixel face (Press Start 2P, `font-crt`). Drawn in a 100 x 100 box, so it
 * stays crisp at any size. Keep public/favicon.svg (and the PNG icons made from it) in step with `DOTS`.
 */

const GROUND = '#0c1015';
const RAMP = ['#5b3aa8', '#9a63e6', '#ef4f93', '#f2c14e'];

const rgb = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const ramp = (t: number) => {
  const x = Math.min(0.9999, Math.max(0, t)) * (RAMP.length - 1);
  const i = Math.floor(x), f = x - i;
  const a = rgb(RAMP[i]), b = rgb(RAMP[i + 1]);
  return `rgb(${[0, 1, 2].map(k => Math.round(a[k] + (b[k] - a[k]) * f)).join(',')})`;
};

const DOTS = Array.from({ length: 81 }, (_, i) => {
  const x = i % 9, y = Math.floor(i / 9);
  const d = Math.hypot((x - 4) / 4, (y - 4) / 4);
  return { cx: 10 + x * 10, cy: 10 + y * 10, d };
}).filter(p => p.d <= 1.02).map(p => {
  const v = 1 - p.d;
  return { cx: p.cx, cy: p.cy, r: +(1 + v * 4.4).toFixed(1), fill: ramp(v) };
});

export const LogoMark: React.FC<{ size?: number; tone?: 'light' | 'dark'; className?: string }> = ({
  size = 40, className = '',
}) => (
  <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className={className}>
    <rect width="100" height="100" fill={GROUND} />
    {DOTS.map(d => <circle key={`${d.cx}-${d.cy}`} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />)}
  </svg>
);

// The wordmark's track, after the effort slider's fill: a pill of dithered squares behind "CENNER",
// thin at the tile and packing denser toward the far end, green with pale squares. Its top and bottom
// edges are crisp; the right end is open (the wash and the dither thin out into nothing), and the
// squares stream through it from left to right like horizontal rain. The letters stay on top.
//
// Drawn on one small canvas at ~60 fps (it was ~400 SVG rects per logo, each with its own endless CSS
// animation, repainted every frame on every page). Same motion: each square has its own speed, start,
// reach and drift. It pauses when the logo is off screen or the tab is hidden; still under reduced motion.
const TW = 116, TH = 36, STEP = 3, SQ = 2.3, OPEN = 28;           // OPEN: how far the dither runs on past the word
const CW = TW + OPEN + 60;                                         // the canvas: the strip plus room for the squares' reach
const TCOLS = Math.floor((TW + OPEN) / STEP), TROWS = Math.floor(TH / STEP);
// a cheap repeatable pseudo-random number (0..1) per square and per property
const h = (i: number, k: number) => { const t = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return t - Math.floor(t); };
const STRIP = { a: '#22c55e', b: '#4ade80', sq: '#eafff3' };         // the site's green
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
type Sq = { x: number; y: number; o: number; td: number; fd: number; sx: number; dx: number; y0: number; y1: number };
const SQUARES: Sq[] = [];
for (let i = 0; i < TCOLS * TROWS; i++) {
  const c = i % TCOLS, r = Math.floor(i / TCOLS);
  const x = c / (TCOLS - 1);
  const density = Math.min(1, 0.7 + x * 0.5) * Math.min(1, Math.max(0, (1 - x) * 5));   // 0 at the tile, full near the end, thinning out past it (no right edge)
  const edge = Math.min(1, Math.min(r, TROWS - 1 - r) / 2.4 + 0.4);      // thinner toward the top and bottom of the pill
  if ((BAYER[r % 4][c % 4] + 0.5) / 16 > density * edge) continue;
  SQUARES.push({
    x: c * STEP + 0.35, y: r * STEP + 0.35,
    o: (0.4 + 0.5 * ((BAYER[(r + 2) % 4][(c + 1) % 4] + 1) / 16)) * Math.max(0, 1 - Math.max(0, x - 0.55) / 0.35),
    // each square gets its own rhythm (speed, start, reach, a little drift up or down), so the stream is ragged
    td: h(i, 1) * 3.2, fd: 0.7 + h(i, 2) * 2.6,
    sx: -22 + h(i, 3) * 20, dx: 14 + h(i, 4) * 46,
    y0: (h(i, 5) - 0.5) * 6, y1: (h(i, 6) - 0.5) * 9,
  });
}
const ALPHA_STEPS = 16;

const StripCanvas: React.FC = () => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    // the real pixel ratio (the strip is tiny, so even 3x is cheap), measured again on resize: browser zoom
    // and moving the window to another screen change it, and the pixel-art squares must stay crisp
    let dpr = 0;
    const size = () => {
      const d = Math.min(window.devicePixelRatio || 1, 3);
      if (d === dpr) return false;
      dpr = d;
      canvas.width = Math.round(CW * dpr); canvas.height = Math.round(TH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    };
    size();
    const wash = ctx.createLinearGradient(0, 0, TW + OPEN, 0);
    wash.addColorStop(0, 'rgba(34,197,94,0.9)');
    wash.addColorStop(0.55, 'rgba(74,222,128,0.9)');
    wash.addColorStop(0.9, 'rgba(74,222,128,0)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const draw = (sec: number | null) => {
      ctx.clearRect(0, 0, CW, TH);
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, TW + OPEN, TH);
      // squares batched by opacity step: a handful of fills a frame
      const paths: (Path2D | null)[] = Array(ALPHA_STEPS).fill(null);
      for (const q of SQUARES) {
        let x = q.x, y = q.y, a = q.o;
        if (sec !== null) {
          const p = ((sec + q.td) % q.fd) / q.fd;                  // same timing as the old keyframes:
          a = p < 0.18 ? q.o * (p / 0.18) : q.o * (1 - (p - 0.18) / 0.82);   // fade in to 18%, then out
          x += q.sx + (q.dx - q.sx) * p;
          y += q.y0 + (q.y1 - q.y0) * p;
        }
        if (a <= 0.02 || x + SQ < 0) continue;                   // cut at the strip's left edge
        const st = Math.min(ALPHA_STEPS - 1, Math.floor(a * ALPHA_STEPS));
        (paths[st] || (paths[st] = new Path2D())).rect(x, y, SQ, SQ);
      }
      ctx.fillStyle = STRIP.sq;
      for (let st = 0; st < ALPHA_STEPS; st++) {
        const path = paths[st];
        if (!path) continue;
        ctx.globalAlpha = (st + 0.5) / ALPHA_STEPS;
        ctx.fill(path);
      }
      ctx.globalAlpha = 1;
    };

    if (reduce) {
      draw(null);
      const onResize = () => { if (size()) draw(null); };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
    let visible = true;
    // ~60 fps, so the 2.3 px squares glide as the CSS animation did (30 once the visitor is idle); the
    // footer's copy, and the nav's when the homepage has pushed it away, are off screen and don't run
    const loop = frameLoop(now => draw(now / 1000), 12, 33, () => visible);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop.wake(); });
    io.observe(canvas);
    const onResize = () => { if (size()) loop.wake(); };
    window.addEventListener('resize', onResize);
    return () => { loop.stop(); io.disconnect(); window.removeEventListener('resize', onResize); };
  }, []);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="lm-track pointer-events-none absolute -left-2 top-1/2 -translate-y-1/2"
      style={{ width: CW, height: TH }}
    />
  );
};

/** Mark + wordmark. The parent link should carry the `group` class: on hover the cursor after the
 *  name blinks (its space is always reserved, so nothing shifts). */
export const Logo: React.FC<{ tone?: 'light' | 'dark'; size?: number; className?: string }> = ({
  tone = 'light', size = 36, className = '',
}) => (
  <span className={`flex items-center gap-2 ${className}`}>
    <LogoMark size={size} tone={tone} className="shrink-0" />
    <span className={`relative ml-1.5 font-crt text-[15px] leading-none [-webkit-text-stroke:0.8px_currentColor] ${tone === 'dark' ? 'text-white' : 'text-ink'}`}>
      <StripCanvas />
      <span className="relative">
        CENNER<span aria-hidden="true" className="inline-block w-[0.7em] opacity-0 group-hover:animate-pulse group-hover:opacity-100">_</span>
      </span>
    </span>
  </span>
);

export default Logo;
