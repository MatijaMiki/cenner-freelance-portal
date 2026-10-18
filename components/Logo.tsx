import React from 'react';

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

// The wordmark's track, after the effort slider's fill: on hover a pill of dithered squares sweeps in behind
// "CENNER" from the tile, thin at the tile and packing denser toward the far end, green with pale squares.
// Its top and bottom edges are crisp; the right end is open (the wash and the dither thin out into nothing),
// and the squares stream through it from left to right like horizontal rain (index.html `.lm-track`, `.lm-sq`). The letters stay on top.
const TW = 116, TH = 36, STEP = 3, SQ = 2.3, OPEN = 28;           // OPEN: how far the dither runs on past the word
const TCOLS = Math.floor((TW + OPEN) / STEP), TROWS = Math.floor(TH / STEP);
// a cheap repeatable pseudo-random number (0..1) per square and per property
const h = (i: number, k: number) => { const t = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return t - Math.floor(t); };
const STRIP = { a: '#22c55e', b: '#4ade80', sq: '#eafff3' };         // the site's green
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const SQUARES = Array.from({ length: TCOLS * TROWS }, (_, i) => {
  const c = i % TCOLS, r = Math.floor(i / TCOLS);
  const x = c / (TCOLS - 1);
  const density = Math.min(1, 0.7 + x * 0.5) * Math.min(1, Math.max(0, (1 - x) * 5));   // 0 at the tile, full near the end, thinning out past it (no right edge)
  const edge = Math.min(1, Math.min(r, TROWS - 1 - r) / 2.4 + 0.4);      // thinner toward the top and bottom of the pill
  if ((BAYER[r % 4][c % 4] + 0.5) / 16 > density * edge) return null;
  return {
    key: i, x: c * STEP + 0.35, y: r * STEP + 0.35, fill: STRIP.sq,
    op: +((0.4 + 0.5 * ((BAYER[(r + 2) % 4][(c + 1) % 4] + 1) / 16)) * Math.max(0, 1 - Math.max(0, x - 0.55) / 0.35)).toFixed(2),
    vars: {
      // each square gets its own rhythm (speed, start, reach, a little drift up or down), so the stream is ragged
      '--td': `${(h(i, 1) * 3.2).toFixed(2)}s`,
      '--fd': `${(0.7 + h(i, 2) * 2.6).toFixed(2)}s`,
      '--sx': `${(-22 + h(i, 3) * 20).toFixed(0)}px`,
      '--dx': `${(14 + h(i, 4) * 46).toFixed(0)}px`,
      '--y0': `${((h(i, 5) - 0.5) * 6).toFixed(1)}px`,
      '--y1': `${((h(i, 6) - 0.5) * 9).toFixed(1)}px`,
      '--o': `${((0.4 + 0.5 * ((BAYER[(r + 2) % 4][(c + 1) % 4] + 1) / 16)) * Math.max(0, 1 - Math.max(0, x - 0.55) / 0.35)).toFixed(2)}`,
    } as React.CSSProperties,
  };
}).filter((q): q is NonNullable<typeof q> => !!q);

/** Mark + wordmark. The parent link should carry the `group` class: on hover the cursor after the
 *  name blinks (its space is always reserved, so nothing shifts). */
export const Logo: React.FC<{ tone?: 'light' | 'dark'; size?: number; className?: string }> = ({
  tone = 'light', size = 36, className = '',
}) => (
  <span className={`flex items-center gap-2 ${className}`}>
    <LogoMark size={size} tone={tone} className="shrink-0" />
    <span className={`relative ml-1.5 font-crt text-[15px] leading-none [-webkit-text-stroke:0.8px_currentColor] ${tone === 'dark' ? 'text-white' : 'text-ink'}`}>
      <svg aria-hidden="true" width={TW} height={TH} viewBox={`0 0 ${TW} ${TH}`} className="pointer-events-none absolute -left-2 top-1/2 -translate-y-1/2" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="lm-fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={STRIP.a} stopOpacity="0.9" />
            <stop offset="0.55" stopColor={STRIP.b} stopOpacity="0.9" />
            <stop offset="0.9" stopColor={STRIP.b} stopOpacity="0" />
          </linearGradient>
          <clipPath id="lm-clip"><rect x="0" y="0" width={TW + OPEN + 60} height={TH} /></clipPath>
        </defs>
        <g className="lm-track">
          <rect width={TW + OPEN} height={TH} fill="url(#lm-fade)" />
          {/* an explicit clip, so squares that start left of the strip are cut off at its edge (a CSS clip would grow with them) */}
          <g clipPath="url(#lm-clip)">
            {SQUARES.map(q => <rect key={q.key} className="lm-sq" x={q.x} y={q.y} width={SQ} height={SQ} fill={q.fill} opacity={q.op} style={q.vars} />)}
          </g>
        </g>
      </svg>
      <span className="relative">
        CENNER<span aria-hidden="true" className="inline-block w-[0.7em] opacity-0 group-hover:animate-pulse group-hover:opacity-100">_</span>
      </span>
    </span>
  </span>
);

export default Logo;
