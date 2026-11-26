// Desktop/tablet scaling: the whole site is sized in rem (px lengths are turned into rem at build
// time), and from 768px wide the root font size is picked from a table of screen classes below.
// Phones (under 768px) keep 16px and do not change.
//
// Used by postcss.config.js (prepended to index.css, so the app and this table never drift) and by
// the static page generators (their inline CSS).
//
// Why steps and not one formula: a CSS pixel is a different physical size on each screen. On a
// 24" 1080p monitor it is ~0.28mm; on a MacBook at "More Space" (1800x1169) it is ~0.17mm and the
// screen sits closer. So the MacBook needs a bigger root size than the monitor to look the same.
// Fixed steps also keep browser zoom working normally (a fluid vh size used to cancel part of it).
//
// Root sizes are written in rem: rem in the root's own font-size means the browser default (16px),
// so a user's own font-size setting still counts. Later rules win, so the list goes from general
// to specific. Heights are the browser window (inner) height, not the screen.
//
//   screen class                                   window (typ.)   root
//   phones (< 768 wide)                            —               16px (unchanged)
//   small desktop windows, 1024-1439 laptops       768-1439 wide   13px
//     (1280x720, 1366x768, 1440x900 at 1x)
//   1440-1799 wide at 1x (1536x864, 1600x900,      ~1536x730..     13px
//     1680x1050)
//   1080p class monitors (1920x1080, 2560x1080)    >=1800, <=1080  12px  (owner's 75% look)
//   1920x1200 class                                >=1800, >1080   13px
//   1440p and up (2560x1440, 3440x1440, 5K/4K      >=1440, >=1250  16px
//     "looks like 2560x1440")
//   4K at 100% (3840x2160)                          >=2400, >=1800  18px
//   Retina laptops, default sizes (1440x900 2x,    2x, < 1250 tall 14px
//     1470x956 MBA, 1512x982 MBP 14")
//   Retina laptops, More Space (1728x1117,         2x, >=1700 wide 15px
//     1800x1169)
//   touch tablets portrait (iPad 820x1180,         coarse pointer  15px
//     iPad Pro 1024x1366)
//   touch tablets landscape (1180x820, 1366x1024)  coarse, landsc. 14px
export const ROOT_SCALE_CSS = [
  '@media (min-width:768px){html{font-size:.8125rem}}',
  '@media (min-width:1800px) and (max-height:1080px){html{font-size:.75rem}}',
  '@media (min-width:1440px) and (min-height:1250px){html{font-size:1rem}}',
  '@media (min-width:2400px) and (min-height:1800px){html{font-size:1.125rem}}',
  '@media (min-width:768px) and (max-height:1249.98px) and (min-resolution:2dppx){html{font-size:.875rem}}',
  '@media (min-width:1700px) and (max-height:1249.98px) and (min-resolution:2dppx){html{font-size:.9375rem}}',
  '@media (min-width:768px) and (pointer:coarse){html{font-size:.9375rem}}',
  '@media (min-width:768px) and (pointer:coarse) and (orientation:landscape){html{font-size:.875rem}}',
].join('\n');

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
// The screen-class table above is prepended to index.css (the app's one stylesheet).
export const pxToRemPlugin = () => ({
  postcssPlugin: 'cenner-px-to-rem',
  OnceExit(root, { parse }) {
    root.walkDecls((decl) => {
      if (decl.value.includes('px')) decl.value = pxToRem(decl.value);
    });
    if (/[\\/]index\.css$/.test(root.source?.input?.file || '')) root.prepend(parse(ROOT_SCALE_CSS));
  },
});
pxToRemPlugin.postcss = true;
