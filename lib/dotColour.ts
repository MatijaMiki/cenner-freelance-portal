/**
 * Colour for the dot art (blog covers, page backdrop): every dot runs from the colour of the
 * ground it sits on (so it vanishes there) into a colour picked from a seed, and on into a second,
 * nearby hue at the brightest point.
 */

export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

type RGB = [number, number, number];

const hexRgb = (hex: string): RGB => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

function hslRgb(h: number, s: number, l: number): RGB {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

const smooth = (t: number) => { const x = Math.min(1, Math.max(0, t)); return x * x * (3 - 2 * x); };

/** Hues that sit well on the paper: blue, orange, violet, teal, rose, sky. Each page and cover picks one. */
const HUES = [218, 24, 262, 172, 342, 200];
export const pickHue = (seed: string) => HUES[hash(seed) % HUES.length];

/**
 * A duotone run for one hue: the ground it sits on, then a washed tint of the hue (light blue,
 * washed orange...), then the strong colour at the brightest point. v is the intensity, 0..1.
 */
export function dotGradient(seed: string, groundHex: string, onDark: boolean, hueOverride?: number): (v: number) => string {
  const g = hexRgb(groundHex);
  const hue = hueOverride ?? pickHue(seed);
  const light = hslRgb(hue, 0.8, onDark ? 0.8 : 0.82);
  const strong = hslRgb(hue, 0.82, onDark ? 0.62 : 0.5);
  return (v: number) => {
    const a = mix(g, light, smooth(v / 0.55));
    const b = mix(a, strong, smooth((v - 0.45) / 0.55));
    return `rgb(${b[0]},${b[1]},${b[2]})`;
  };
}
