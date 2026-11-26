// Desktop/tablet scaling: the whole site is sized in rem (px lengths are turned into rem at build
// time), and on screens 768px and wider the root font size follows the window height. A 1080p
// monitor (about 960px of browser window) gets 12px, the same as browsing it at 75% zoom; a window
// 1280px tall or more keeps the full 16px. Phones (under 768px) keep 16px, so they do not change.
//
// Used by postcss.config.js (the app's CSS) and by the static page generators (their inline CSS).

// 1.25vh = 16px at a 1280px-tall window. rem inside the root's own font-size means the browser
// default (16px), so the user's own font-size setting still counts. Touch tablets get a higher
// floor because they are held closer than a monitor.
export const ROOT_SCALE_CSS = `@media (min-width:768px){html{font-size:clamp(.75rem,1.25vh,1rem)}}
@media (min-width:768px) and (pointer:coarse){html{font-size:clamp(.875rem,1.25vh,1rem)}}`;

const fmt = (n) => String(+(n / 16).toFixed(4));

// px -> rem in a CSS value or stylesheet. 0-2px stay px (hairline borders and offsets stay
// crisp); @media/@container conditions and url(...) contents are left alone.
export function pxToRem(css) {
  const kept = [];
  const keep = (m) => `\u0000${kept.push(m) - 1}\u0000`;
  let out = css
    .replace(/url\([^)]*\)/g, keep)
    .replace(/@(media|container|supports)[^{]*\{/g, keep);
  out = out.replace(/(^|[^\w.#-])(-?(?:\d+\.?\d*|\.\d+))px\b/g, (m, pre, num) => {
    const n = parseFloat(num);
    return Math.abs(n) < 3 ? m : `${pre}${fmt(n)}rem`;
  });
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => kept[+i]);
}

// PostCSS plugin form, run after Tailwind so its generated classes (text-[13px] and the like) are
// converted too. At-rule params (media queries) are never touched: breakpoints stay real px.
export const pxToRemPlugin = () => ({
  postcssPlugin: 'cenner-px-to-rem',
  OnceExit(root) {
    root.walkDecls((decl) => {
      if (decl.value.includes('px')) decl.value = pxToRem(decl.value);
    });
  },
});
pxToRemPlugin.postcss = true;
