
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Liquid Glass, after Apple's material, for the meadow redesign.
 *
 * What makes it read as Liquid Glass rather than "frosted blur":
 *  - a clear, saturated, lightly tinted body (not milky), with the page behind it still legible;
 *  - a specular rim: a 1px gradient edge that is bright at the top-left and bottom-right
 *    and nearly gone in between, like light catching a bevel;
 *  - inner glow and a soft sheen, plus a deep, blue-tinted drop shadow so it floats;
 *  - on Chromium, real refraction: the backdrop is bent near the edge by an SVG
 *    displacement map built for the element's exact size (Safari and Firefox cannot use
 *    SVG filters in backdrop-filter, so they keep the blur/saturate version).
 *
 * Structure: the glass lives on a sibling layer behind the content, never on the content's
 * ancestor. A backdrop-filter element becomes a "backdrop root", so a dropdown nested inside
 * one would only see the glass behind it instead of the page; siblings avoid that.
 *
 * prefers-reduced-transparency swaps the blur for an opaque tint.
 */

const STYLE_ID = 'cn-liquid-glass-styles';

const CSS = `
.lg{isolation:isolate;--lg-tint-a:rgba(255,255,255,.2);--lg-tint-b:rgba(255,255,255,.07);--lg-blur:8px;--lg-sat:1.8;--lg-bright:1.06;
 --lg-rim:linear-gradient(135deg,rgba(255,255,255,.95),rgba(255,255,255,.14) 26%,rgba(255,255,255,.05) 54%,rgba(255,255,255,.38) 80%,rgba(255,255,255,.8));
 --lg-edge:inset 0 1px .5px rgba(255,255,255,.62),inset 0 0 0 .5px rgba(255,255,255,.16),inset 0 -9px 16px -9px rgba(255,255,255,.12);
 --lg-drop:0 14px 34px -10px rgba(0,22,88,.5),0 2px 8px rgba(0,22,88,.22)}
.lg--paper{--lg-tint-a:rgba(255,255,255,.7);--lg-tint-b:rgba(255,255,255,.5);--lg-blur:18px;--lg-sat:1.6;--lg-bright:1.04;
 --lg-rim:linear-gradient(135deg,#fff,rgba(16,35,28,.16) 28%,rgba(16,35,28,.1) 62%,rgba(255,255,255,.95));
 --lg-edge:inset 0 1px 0 rgba(255,255,255,.95),inset 0 -8px 14px -10px rgba(16,35,28,.1);
 --lg-drop:0 12px 30px -14px rgba(16,35,28,.38),0 1px 2px rgba(16,35,28,.1)}
.lg--ink{--lg-tint-a:rgba(32,66,53,.96);--lg-tint-b:rgba(11,30,24,.97);--lg-blur:10px;--lg-sat:1.3;--lg-bright:1;
 --lg-rim:linear-gradient(135deg,rgba(255,255,255,.6),rgba(255,255,255,.05) 30%,rgba(255,255,255,.02) 60%,rgba(255,255,255,.28));
 --lg-edge:inset 0 1px .5px rgba(255,255,255,.3),inset 0 -8px 14px -10px rgba(255,255,255,.08);
 --lg-drop:0 12px 26px -10px rgba(11,30,24,.6),0 2px 6px rgba(11,30,24,.25)}
.lg--inkpanel{--lg-tint-a:rgba(16,38,31,.84);--lg-tint-b:rgba(10,27,22,.8);--lg-blur:22px;--lg-sat:1.4;--lg-bright:1;
 --lg-rim:linear-gradient(135deg,rgba(255,255,255,.5),rgba(255,255,255,.08) 30%,rgba(255,255,255,.04) 60%,rgba(255,255,255,.3));
 --lg-edge:inset 0 1px .5px rgba(255,255,255,.25);
 --lg-drop:0 22px 50px -16px rgba(11,30,24,.6),0 2px 8px rgba(11,30,24,.25)}
.lg-surface{position:absolute;inset:0;border-radius:inherit;z-index:0;pointer-events:none;
 background:linear-gradient(180deg,var(--lg-tint-a),var(--lg-tint-b));
 -webkit-backdrop-filter:blur(var(--lg-blur)) saturate(var(--lg-sat)) brightness(var(--lg-bright));
 backdrop-filter:blur(var(--lg-blur)) saturate(var(--lg-sat)) brightness(var(--lg-bright));
 box-shadow:var(--lg-edge),var(--lg-drop)}
.lg-surface::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
 background:radial-gradient(130% 160% at 14% -40%,rgba(255,255,255,.36),rgba(255,255,255,0) 58%),radial-gradient(90% 120% at 100% 140%,rgba(255,255,255,.14),rgba(255,255,255,0) 62%)}
.lg-rim{position:absolute;inset:0;border-radius:inherit;z-index:0;pointer-events:none;padding:1.25px;
 background:var(--lg-rim);
 -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;
 mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude}
.lg-body{position:relative;z-index:1}
.lg--clear .lg-body{text-shadow:0 1px 8px rgba(0,24,96,.5)}
.lg-btn{cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .5s cubic-bezier(.34,1.56,.64,1)}
.lg-btn:hover{transform:translateY(-1px) scale(1.035)}
.lg-btn:active{transform:scale(.965);transition-duration:.15s}
.lg-btn:focus-visible{outline:2px solid rgba(255,255,255,.9);outline-offset:3px}
.lg-btn .lg-surface{transition:filter .25s}
.lg-btn:hover .lg-surface{filter:brightness(1.14)}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.lg-surface{background:rgba(12,44,128,.88)}}
@media (prefers-reduced-transparency:reduce){.lg-surface{-webkit-backdrop-filter:none!important;backdrop-filter:none!important;background:rgba(10,36,110,.94)}}
@media (prefers-reduced-motion:reduce){.lg-btn,.lg-btn:hover,.lg-btn:active{transform:none;transition:none}}
`;

// Side effect on import (browser only): the stylesheet is tiny and shared by every glass element.
if (typeof document !== 'undefined') {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = CSS; // also refreshes the rules on a hot reload
}

/* ------------------------------------------------------------------ refraction */

export type Refract = {
  /** Width in px of the edge band that bends the backdrop. */
  bezel: number;
  /** Largest displacement in px, reached at the very edge. */
  shift: number;
};

/**
 * Displacement map for a rounded rect: neutral grey (128,128) everywhere except a band of
 * `bezel` px along the inside of the edge, where R/G encode an inward vector that grows
 * quadratically towards the edge. The backdrop there is sampled from further inside, which
 * magnifies it like the rim of a lens.
 */
function lensMap(w: number, h: number, radius: number, bezel: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const img = ctx.createImageData(w, h);
  const px = img.data;
  const hw = w / 2, hh = h / 2;
  const r = Math.min(radius, hw, hh);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x + 0.5 - hw, dy = y + 0.5 - hh;
      const qx = Math.abs(dx) - (hw - r), qy = Math.abs(dy) - (hh - r);
      const ox = Math.max(qx, 0), oy = Math.max(qy, 0);
      const inside = -(Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r); // px from the edge
      let rr = 128, gg = 128;
      if (inside >= 0 && inside < bezel) {
        let nx: number, ny: number; // outward normal
        if (ox > 0 || oy > 0) {
          const len = Math.hypot(ox, oy) || 1;
          nx = (Math.sign(dx) * ox) / len;
          ny = (Math.sign(dy) * oy) / len;
        } else if (qx > qy) { nx = Math.sign(dx); ny = 0; }
        else { nx = 0; ny = Math.sign(dy); }
        const t = 1 - inside / bezel;
        const mag = t * t;
        rr = 128 - nx * mag * 127; // minus: sample from further inside
        gg = 128 - ny * mag * 127;
      }
      const i = (y * w + x) * 4;
      px[i] = rr; px[i + 1] = gg; px[i + 2] = 128; px[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}

let lensUid = 0;

function isChromium(): boolean {
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
  return !!brands?.some(b => /Chromium/i.test(b.brand));
}

/** Adds real edge refraction to a glass surface on Chromium; a no-op elsewhere. */
function useRefraction(ref: React.RefObject<HTMLElement | null>, cfg?: Refract) {
  const bezel = cfg?.bezel, shift = cfg?.shift;
  React.useEffect(() => {
    const el = ref.current;
    if (!el || bezel === undefined || shift === undefined) return;
    if (!isChromium() || window.matchMedia('(prefers-reduced-transparency: reduce)').matches) return;

    const NS = 'http://www.w3.org/2000/svg';
    const id = `cn-lens-${++lensUid}`;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;pointer-events:none';
    svg.innerHTML =
      `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
      `<feImage result="map" preserveAspectRatio="none"/>` +
      `<feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G"/></filter>`;
    document.body.appendChild(svg);
    const feImage = svg.querySelector('feImage');
    const feDisp = svg.querySelector('feDisplacementMap');
    if (!feImage || !feDisp) { svg.remove(); return; }

    let frame = 0;
    const apply = () => {
      const w = el.offsetWidth, h = el.offsetHeight; // layout size: unaffected by hover transforms
      if (w < 8 || h < 8) return;
      const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      feImage.setAttribute('x', '0');
      feImage.setAttribute('y', '0');
      feImage.setAttribute('width', String(w));
      feImage.setAttribute('height', String(h));
      feImage.setAttribute('href', lensMap(w, h, radius, bezel));
      feDisp.setAttribute('scale', String(shift * 2));
      el.style.setProperty('backdrop-filter', `url(#${id}) blur(var(--lg-blur)) saturate(var(--lg-sat)) brightness(var(--lg-bright))`);
    };
    const ro = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(apply); });
    ro.observe(el);
    apply();
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      svg.remove();
      el.style.removeProperty('backdrop-filter');
    };
  }, [ref, bezel, shift]);
}

/* ------------------------------------------------------------------ components */

type Variant = 'clear' | 'paper' | 'ink' | 'inkpanel';

const withPosition = (className: string) =>
  /(^|\s)(absolute|fixed|sticky|relative)(\s|$)/.test(className) ? className : `relative ${className}`;

interface GlassProps {
  variant?: Variant;
  as?: 'div' | 'nav' | 'span';
  className?: string;
  /** Classes for the content wrapper that sits above the glass. */
  bodyClassName?: string;
  refract?: Refract;
  children?: React.ReactNode;
}

/** A glass panel. Put the content inside; the glass is a sibling layer behind it. */
export const Glass: React.FC<GlassProps> = ({
  variant = 'clear', as: Tag = 'div', className = '', bodyClassName = '', refract, children,
}) => {
  const surface = React.useRef<HTMLSpanElement>(null);
  useRefraction(surface, refract);
  return (
    <Tag className={`lg lg--${variant} ${withPosition(className)}`}>
      <span ref={surface} className="lg-surface" aria-hidden="true" />
      <span className="lg-rim" aria-hidden="true" />
      <div className={`lg-body ${bodyClassName}`}>{children}</div>
    </Tag>
  );
};

/** The bare glass layers (surface + rim) for an element that carries the `lg lg--<variant>` classes and
 *  its own `relative` itself. The element's content must be positioned (e.g. `relative z-[1]`) to sit above. */
export const GlassLayers: React.FC<{ refract?: Refract }> = ({ refract }) => {
  const surface = React.useRef<HTMLSpanElement>(null);
  useRefraction(surface, refract);
  return (
    <>
      <span ref={surface} className="lg-surface" aria-hidden="true" />
      <span className="lg-rim" aria-hidden="true" />
    </>
  );
};

interface GlassButtonProps {
  variant?: 'clear' | 'paper' | 'ink';
  /** Renders a router Link when set, a button otherwise. */
  to?: string;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
  /** Defaults to on for the see-through "clear" glass and off for the opaque paper/ink ones. */
  refract?: boolean;
  children?: React.ReactNode;
}

/** A pill button made of Liquid Glass with a springy press. */
export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'clear', to, onClick, className = '', refract, children, ...rest
}) => {
  const surface = React.useRef<HTMLSpanElement>(null);
  useRefraction(surface, (refract ?? variant === 'clear') ? { bezel: 14, shift: 9 } : undefined);
  const cls = `lg lg-btn lg--${variant} inline-flex items-center justify-center rounded-full ${withPosition(className)}`;
  const inner = (
    <>
      <span ref={surface} className="lg-surface" aria-hidden="true" />
      <span className="lg-rim" aria-hidden="true" />
      <span className="lg-body inline-flex items-center justify-center gap-2">{children}</span>
    </>
  );
  return to
    ? <Link to={to} className={cls} {...rest}>{inner}</Link>
    : <button type="button" onClick={onClick} className={cls} {...rest}>{inner}</button>;
};
