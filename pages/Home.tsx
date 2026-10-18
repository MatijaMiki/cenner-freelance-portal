import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowDown, Briefcase, Lock, ShieldCheck, Check, Star,
} from 'lucide-react';
import ProjectDots from '../components/ProjectDots';
import MeadowBackdrop from '../components/MeadowBackdrop';
// the desktop's chrome (desktop icons, window buttons, taskbar, Start menu, the pocket device) wears the pixel icon set
import {
  PxShoppingBag, PxBriefcase, PxFolder, PxBookOpen, PxMessage, PxChevronUp, PxChevronRight, PxBell, PxCheck, PxUser, PxFileText,
  PxLogout, PxPower, PxGlobe, PxCalendar, PxStar, PxLabel, PxUsers, PxMail, PxListBox, PxVolume, PxKeyboard, PxClock, PxClose,
  PxGift, PxMinus, PxSave, PxArrowBigUp, PxBatteryMedium, PxInfoBox, PxShield,
} from '../components/PixelIcon';
import SEO from '../components/SEO';
import { useT, useLanguage } from '../i18n';
import { LANGUAGES, useSiteNav } from '../components/siteNav';
import { disconnectSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import Avatar from '../components/Avatar';
import ChatInterface from '../components/ChatInterface';

/*
 * Homepage, pass 4: "Into the screen".
 *
 * Scrolling pushes the camera from the meadow into the CRT monitor on the desk. Inside the
 * screen is a desktop whose windows hold the site and can be
 * dragged around. (Cenner is not an operating system; nothing on the page says "OS".)
 * Then a scroll-linked marquee, a setup wizard for the
 * legal steps, a terminal that answers the FAQ, and at the end the screen switches off and
 * the camera pulls back out to the meadow.
 *
 * Every visible string is an existing i18n key (the live cenner.hr copy). Under
 * prefers-reduced-motion nothing is pinned or zoomed and every section simply stands still.
 * The saved pass-3 page lives at pages/HomeV3.tsx (route /v3, local only).
 */

// The CRT glass in the 1920x1080 film, corner by corner (TL, TR, BR, BL), measured from the
// frames. The monitor is turned slightly, so the glass is a quad, not a rectangle; the camera
// does not move during the loop, so fixed corners stay on it.
const GLASS: [number, number][] = [[910, 492.5], [971, 492], [971, 548], [910.5, 551.5]];
const SCREEN = {
  x: GLASS.reduce((a, c) => a + c[0], 0) / 4 / 1920,
  y: GLASS.reduce((a, c) => a + c[1], 0) / 4 / 1080,
  w: 61 / 1920,
  h: 58 / 1080,
};
const OUTRO_MAX = 4.2;   // the pull-back at the end runs on the film alone, so it stays shallow

// A 3840x2160 still (Higgsfield, GPT Image 2.5, from a frame of the film) of the same view with
// the Cenner screen on the glass. It covers exactly this rectangle of the 1920x1080 film, at 8x
// the detail, so the camera can fly deep into it and stay sharp. Its glass sits within 1-3 px of
// GLASS above.
const STILL = { x: 700, y: 386, w: 480, h: 270 };

const FOCUS_X = 0.48; // MeadowBackdrop keeps the film centred on 48% across
const NAV_H = 72;     // the sticky nav bar above the pinned stages
// The desktop section's layout: the full desktop (windows, icons, taskbar) on laptop-size screens,
// set into a CRT from 1024px and into a 90s laptop lid on tablet-size screens; phones and
// landscape phones get the pocket device.
const DESK_QUERY = '(min-width: 1024px), (min-width: 768px) and (min-height: 560px)';
const CRT_QUERY = '(min-width: 1024px)';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

function useReducedMotion() {
  // read synchronously, so reduced-motion visitors never get a first render of the pinned stages
  const [reduce, setReduce] = React.useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduce;
}

function useMedia(query: string) {
  const [m, setM] = React.useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}

/** Calls onP(progress 0..1) while a tall section scrolls past its sticky stage. */
function usePin(ref: React.RefObject<HTMLElement>, onP: (p: number, stageW: number, stageH: number) => void, enabled = true) {
  const cb = React.useRef(onP);
  cb.current = onP;
  React.useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const stageH = window.innerHeight - NAV_H;
      const p = clamp((NAV_H - r.top) / Math.max(1, r.height - stageH));
      cb.current(p, el.clientWidth, stageH);
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    return () => { window.removeEventListener('scroll', req); window.removeEventListener('resize', req); cancelAnimationFrame(raf); };
  }, [ref, enabled]);
}

/** The zoom that fills the stage with the CRT screen: transform-origin and the end scale. */
function screenZoom(W: number, H: number) {
  const bw = Math.max(W, (H * 16) / 9);
  const bh = (bw * 9) / 16;
  const ox = FOCUS_X * W - FOCUS_X * bw + SCREEN.x * bw;
  const oy = 0.5 * H - 0.5 * bh + SCREEN.y * bh;
  const end = Math.max(W / (SCREEN.w * bw), H / (SCREEN.h * bh)) * 1.35;
  return { ox, oy, end, bw, bh };
}

// The site's pixel arrow (the desktop's cursor; inverted, the cue's ghost cursor), as an SVG data URI.
const PIXEL_ARROW = (fill: string, stroke: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='32' shape-rendering='crispEdges'%3E%3Cpath d='M2 2h2v2h2v2h2v2h2v2h2v2h2v2h2v2h-6v2h2v4h2v4h-2v2h-2v-4h-2v-4h-2v2h-2v2h-2z' fill='%23${fill}' stroke='%23${stroke}' stroke-width='2'/%3E%3C/svg%3E`;

const CSS = `
/* index.html sets overflow-x:hidden on html and body, which makes body a scroll container and
   breaks position:sticky. clip still stops sideways scrolling without that side effect. */
html,body{overflow-x:clip}
.cn-scan{background-image:repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 1px,transparent 1px 3px)}
.cn-glow{text-shadow:0 0 12px rgba(74,222,128,.55)}
@keyframes cn-escrow{0%{width:4%}70%,100%{width:100%}}
.cn-escrow{animation:cn-escrow 4s cubic-bezier(.6,0,.3,1) infinite}
@keyframes cn-blink{50%{opacity:0}}
.cn-caret{animation:cn-blink 1s steps(1) infinite}
@keyframes cn-toast{from{transform:translate3d(0,24px,0);opacity:0}to{transform:none;opacity:1}}
.cn-toast{animation:cn-toast .6s cubic-bezier(.22,1,.36,1) both}
.cn-press{transition:transform .15s ease,background-color .2s ease,color .2s ease,box-shadow .15s ease}
.cn-press:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 #0b0c0e}
.cn-press:active{transform:translate(2px,2px);box-shadow:0 0 0 #0b0c0e}
.cn-cursor,.cn-cursor *{cursor:url("${PIXEL_ARROW('fff', '0b0c0e')}") 2 2,auto}
.cn-cursor a,.cn-cursor button,.cn-cursor a *,.cn-cursor button *{cursor:pointer}
/* Film grain, same tile and jitter as MeadowBackdrop's (one tile = 1/7.5 of the frame width). */
.cn-grain{position:absolute;inset:-25% -14%;background:url(/video/grain-v1.png) 0 0/calc(100vw / 7.5) auto;opacity:.88;will-change:transform}
@keyframes cn-grain{0%{transform:translate3d(0,0,0)}12.5%{transform:translate3d(-4.1vw,5.2vw,0)}25%{transform:translate3d(3.7vw,-2.6vw,0)}37.5%{transform:translate3d(-5.8vw,-4.7vw,0)}50%{transform:translate3d(2.1vw,6.3vw,0)}62.5%{transform:translate3d(-1.6vw,-5.9vw,0)}75%{transform:translate3d(4.9vw,1.8vw,0)}87.5%{transform:translate3d(-3.3vw,3.6vw,0)}100%{transform:translate3d(0,0,0)}}
@media (prefers-reduced-motion:no-preference){.cn-grain{animation:cn-grain .32s steps(1,end) infinite}}
@keyframes cn-marquee{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}
.cn-marquee{animation:cn-marquee linear infinite;will-change:transform}
.cn-marquee-row:hover .cn-marquee{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.cn-marquee{animation:none}}
/* the monitor's power light: a slow standby blink with a soft glow */
@keyframes cn-led{0%,100%{opacity:1;box-shadow:0 0 6px 1px rgba(74,222,128,.9)}50%{opacity:.35;box-shadow:0 0 1px 0 rgba(74,222,128,.3)}}
.cn-led{animation:cn-led 1.8s ease-in-out infinite}
.cn-pda{--pz:.6;--pt:calc(104px*var(--pz));--ps:calc(41px*var(--pz));--pb:calc(255px*var(--pz))}
@media (min-width:640px){.cn-pda{--pz:.85}}
@media (max-height:520px){.cn-pda{--pz:.42}}
.cn-pda-frame{border-style:solid;border-width:var(--pt) var(--ps) var(--pb);border-image:url(/home/pda-frame.webp) 208 82 510 stretch}
.cn-lcd-on{animation:cn-lcd .76s ease-out forwards}
@keyframes cn-lcd{0%{opacity:1}14%{opacity:.35}22%{opacity:.85}38%{opacity:.2}55%{opacity:.45}100%{opacity:0}}
.cn-balloon{animation:cn-balloon .32s cubic-bezier(.22,1.3,.36,1) both}
@keyframes cn-balloon{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.cn-balloon{animation:none}}
.cn-mark{opacity:0;transform:translate3d(0,4vh,0);transition:opacity .9s ease,transform 1.1s cubic-bezier(.22,1,.36,1)}
.cn-mark[data-on="1"]{opacity:1;transform:none}
.cn-bob{animation:cn-bob 1.1s steps(4,end) infinite}
@keyframes cn-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(9px)}}
@media (prefers-reduced-motion:reduce){.cn-bob{animation:none}}
.cn-pon{transform-origin:50% 50%;box-shadow:0 0 30px 6px #fff;animation:cn-pon .76s cubic-bezier(.3,0,.3,1) forwards}
@keyframes cn-pon{0%{transform:scale(.006,.006);opacity:1}16%{transform:scale(1,.008);opacity:1}40%{transform:scale(1,1);opacity:1}100%{transform:scale(1,1);opacity:0}}
.cn-pon-dark{animation:cn-pon-dark .76s steps(1,end) forwards}
@keyframes cn-pon-dark{0%{opacity:1}40%{opacity:0}100%{opacity:0}}
.cn-start-hint{animation:cn-start-hint 1.4s ease-out 3}
/* the "how to use it" cue: the ghost cursor, its press rings, the pocket device's beacon, title-bar grips */
.cn-ghost{animation:cn-ghost-in .16s steps(2,end) backwards;transition:opacity .16s steps(2,end)}
@keyframes cn-ghost-in{from{opacity:0}}
.cn-ghost[data-out]{opacity:0}
.cn-ghost[data-glide]{transition:left .55s cubic-bezier(.3,0,.2,1),top .55s cubic-bezier(.55,0,.35,1),opacity .16s steps(2,end)}
.cn-tap{position:absolute;left:-10px;top:-10px;width:20px;height:20px;border:2px solid #4ade80;box-shadow:0 0 0 2px #0b0c0e;animation:cn-tap .35s steps(4,end) both}
@keyframes cn-tap{from{transform:scale(.3);opacity:1}to{transform:scale(1.8);opacity:0}}
.cn-beacon{animation:cn-start-hint 1.4s ease-out 2}
.cn-grip{display:inline-block;flex:none;width:8px;height:12px;opacity:.65;background:radial-gradient(circle,currentColor 1px,transparent 1.4px) 0 0/4px 4px}
@media (prefers-reduced-motion:reduce){.cn-ghost,.cn-ghost[data-glide]{animation:none;transition:none}.cn-tap{display:none}.cn-start-hint,.cn-beacon{animation:none;box-shadow:0 0 0 3px #4ade80}}
@keyframes cn-start-hint{0%{box-shadow:0 0 0 0 rgba(74,222,128,.95)}100%{box-shadow:0 0 0 14px rgba(74,222,128,0)}}
.cn-bezel{--bz:.4}
@media (min-width:1024px){.cn-bezel{padding:calc(78px*var(--bz)) calc(111px*var(--bz)) calc(191px*var(--bz))}}
.cn-bezel-frame{border-style:solid;border-width:calc(98px*var(--bz)) calc(131px*var(--bz)) calc(211px*var(--bz));border-image:url(/home/crt-bezel.webp) 98 131 211 stretch}
/* The laptop lid (tablet-size screens): laptop-bezel.webp is 1168 x 872 with the LCD opening at
   86-1081 x 84-708; the screen tucks 1 px under the bezel all round. The slices reach past the
   bezel into the (transparent) opening so the badge, the standby button and the hinges sit in
   the corners and are never stretched. */
.cn-laptop{--lz:.3;padding:calc(83px*var(--lz)) calc(86px*var(--lz)) calc(163px*var(--lz)) calc(85px*var(--lz))}
.cn-laptop [data-wheel-box]{overscroll-behavior:contain}
@media (min-width:900px){.cn-laptop{--lz:.34}}
.cn-laptop-frame{border-style:solid;border-width:calc(130px*var(--lz)) calc(152px*var(--lz)) calc(170px*var(--lz)) calc(152px*var(--lz));border-image:url(/home/laptop-bezel.webp) 130 152 170 152 stretch}
@keyframes cn-disk{0%,62%,100%{opacity:.25}64%,70%,76%{opacity:1}67%,73%{opacity:.4}}
.cn-disk{animation:cn-disk 5.5s steps(1,end) infinite}
@media (prefers-reduced-motion:reduce){.cn-disk{animation:none}}
@media (prefers-reduced-motion:reduce){.cn-led{animation:none}}
/* phones and the laptop: the device's top is a snap point that a scroll from either side stops
   at (Desktop toggles cn-snap; glides switch it off while they run) */
/* the homepage's scenes run edge to edge: no scrollbar gutter beside them where the browser keeps
   one (a mouse on macOS, Windows); the wheel, trackpad, touch and keys still scroll. This sheet is
   only mounted on the homepage, so other pages keep theirs. */
html{scrollbar-width:none}
html::-webkit-scrollbar{display:none}
html.cn-snap{scroll-snap-type:y proximity}
html.cn-snap [data-desktop]{scroll-snap-align:start;scroll-snap-stop:always}
/* the site nav steps aside while the desktop fills the window (wide screens) */
nav.sticky{transition:transform .35s cubic-bezier(.22,1,.36,1)}
.cn-nav-hidden nav.sticky{transform:translate3d(0,-100%,0)}
/* the device (CRT, laptop, PDA) pushes the nav up as it scrolls in, pixel for pixel */
.cn-nav-push nav.sticky{transition:none;transform:translate3d(0,calc(-1px * var(--nav-push,0)),0)}
/* ...and while the device's top rests within NAV_LEAD of the window's, its own ground reaches up
   NAV_LEAD px, so a device that stops a few px short sits on its ground, with no strip of the page
   above it showing */
html.cn-desk-gap [data-desktop]:not(.cn-pda-ground)::before{content:"";position:absolute;left:0;right:0;bottom:100%;height:24px;background:inherit;pointer-events:none}
/* the pocket device's ground: solid navy across the whole width of the window, square and opaque.
   It always reaches 60px above the device: the top 36px dissolve into whatever is above (the boot
   screen's blue) in a 6px ordered dither, 25% / 50% / 75% (the 90s way to blend two colours), and
   the 24px under that (NAV_LEAD) are solid, so a device that stops short sits on its own ground */
.cn-pda-ground{background:#040826}
.cn-pda-ground::before{content:"";position:absolute;left:0;right:0;bottom:100%;height:60px;pointer-events:none;
  background:conic-gradient(#040826 0 25%,#0000 0) 0 0/12px 12px repeat-x,
    repeating-conic-gradient(#040826 0 25%,#0000 0 50%) 0 12px/12px 12px repeat-x,
    conic-gradient(#0000 0 25%,#040826 0) 0 24px/12px 12px repeat-x,
    linear-gradient(#040826,#040826) 0 36px/100% 24px no-repeat}
@media (prefers-reduced-motion:reduce){.cn-escrow,.cn-caret,.cn-toast{animation:none}.cn-escrow{width:66%}.cn-press:hover,.cn-press:active{transform:none}}
`;

/** A short CRT "switch" flash: a white line opens to the full screen and fades out. One flash
 *  per moment (a cool-down stops two triggers of the same arrival from doubling it). */
/** True while the page is gliding somewhere on its own (the desktop's entry stays dark then). */
let deskGliding = false;

// The desktop's "how to use it" cue (see Desktop): played once per visitor, and the double-click
// tag until the first double-click open. '?demo' in the URL plays the cue again (for checking it).
const TIP_KEY = 'cenner_desk_tip', DBL_KEY = 'cenner_desk_dbl';
const seen = (k: string) => { try { return localStorage.getItem(k) === '1'; } catch { return false; } };
const remember = (k: string) => { try { localStorage.setItem(k, '1'); } catch { /* storage blocked: once per page load */ } };
let deskTipDone = false;
const tipForced = () => { try { return new URLSearchParams(window.location.search).has('demo'); } catch { return false; } };
/** A timer / an eased rAF tween that reject at once when the signal aborts. */
function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const id = window.setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { window.clearTimeout(id); reject(signal.reason); }, { once: true });
  });
}
function tween(ms: number, step: (k: number) => void, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const t0 = performance.now();
    const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    let raf = 0;
    const frame = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      step(ease(k));
      if (k < 1) raf = requestAnimationFrame(frame); else resolve();
    };
    raf = requestAnimationFrame(frame);
    signal.addEventListener('abort', () => { cancelAnimationFrame(raf); reject(signal.reason); }, { once: true });
  });
}

/** An eased glide to a scroll position (the visitor's wheel is held meanwhile, so it cannot fight
 *  the animation); `done` runs on arrival. */
let cancelGlide = () => {};
/** The device's snap point is wanted on phones and the laptop, never on the CRT, and only on the homepage. */
const snapWanted = () => !window.matchMedia(CRT_QUERY).matches && !!document.querySelector('[data-desktop]');
let resnapTimer = 0;
/** The phone hero (ZoomInPocket) while it is mounted: the nav leaves as its camera's blue fills the view. */
let pocketHero: HTMLElement | null = null;
/** The site nav and the device (CRT, laptop or pocket device) are never seen together; the nav moves
 *  tied to the scroll, no delay:
 *  - coming in, the device's top pushes it up half again as fast as it moves, so the nav has gone
 *    while the device is still NAV_LEAD px short of the top (a device that stops a few px short
 *    never leaves the nav's bottom edge showing above it);
 *  - while any of the device is in view the nav stays away, and it comes back over the next
 *    section's first NAV_H px (on the way up, it has gone by the time the device's bottom shows);
 *  - phones: it already leaves as the hero's camera goes into the PDA's screen (its blue fills the
 *    view), so the boot screen and the device that follows it are seen without it. */
const NAV_LEAD = 24;
function pushNav(sec: HTMLElement) {
  const r = sec.getBoundingClientRect(), root = document.documentElement;
  const enter = clamp((NAV_H - r.top) / (NAV_H - NAV_LEAD));
  const leave = clamp((r.bottom + NAV_H) / NAV_H);
  let k = Math.min(enter, leave);
  const hero = pocketHero?.getBoundingClientRect();
  if (hero && hero.bottom > 0) {
    // the hero's progress, as usePin measures it
    const p = clamp((NAV_H - hero.top) / Math.max(1, hero.height - (window.innerHeight - NAV_H)));
    k = Math.max(k, span(p, 0.6, 0.68));
  }
  const push = k * NAV_H;
  root.style.setProperty('--nav-push', String(Math.round(push * 10) / 10));
  root.classList.toggle('cn-nav-push', push > 0);
  root.classList.toggle('cn-nav-hidden', push >= NAV_H - 0.5);
  // a device resting just short of the top: its own ground fills the gap above it (see the CSS)
  root.classList.toggle('cn-desk-gap', r.top > 0.5 && r.top < NAV_LEAD + 0.5);
}
function releaseNav() {
  const root = document.documentElement;
  root.classList.remove('cn-nav-push', 'cn-nav-hidden', 'cn-desk-gap');
  root.style.removeProperty('--nav-push');
}
function glideTo(to: number, done?: () => void, opts?: { ms?: number; ease?: (x: number) => number }) {
  if (deskGliding) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { window.scrollTo(0, to); done?.(); return; }
  deskGliding = true;
  // a snap point would pull the glide's intermediate frames back to it
  const root = document.documentElement;
  root.classList.remove('cn-snap');
  const from = window.scrollY;
  const dur = opts?.ms ?? Math.min(1600, 650 + Math.abs(to - from) * 0.25);
  const t0 = performance.now();
  const ease = opts?.ease ?? ((x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2));
  const hold = (e: WheelEvent) => e.preventDefault();
  let raf = 0;
  const stop = () => { cancelAnimationFrame(raf); window.removeEventListener('wheel', hold); deskGliding = false; cancelGlide = () => {}; if (snapWanted()) root.classList.add('cn-snap'); };
  cancelGlide = stop; // Home's unmount stops a glide that is still running (the visitor left the page)
  window.addEventListener('wheel', hold, { passive: false });
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / dur);
    window.scrollTo(0, from + (to - from) * ease(k));
    if (k < 1) raf = requestAnimationFrame(step);
    else { stop(); done?.(); }
  };
  raf = requestAnimationFrame(step);
}

/** From the end of the hero into the desktop: a glide down onto the dark monitor, which then
 *  powers on (see Desktop). */
function goToDesktop() {
  const desk = document.querySelector<HTMLElement>('[data-desktop]');
  if (!desk) return;
  // the CRT (and on phones the pocket device) fills the window and the nav steps aside: land at 0
  glideTo(desk.getBoundingClientRect().top + window.scrollY, () => window.dispatchEvent(new Event('cenner-desktop:power')));
}

/** The Start menu's "Turn off": glide down to the outro, where the monitor shuts down. */
function goToShutdown() {
  const out = document.querySelector<HTMLElement>('[data-outro]');
  if (out) glideTo(out.getBoundingClientRect().top + window.scrollY - NAV_H);
}

/* ===================================================================== hero: zoom in */

const STATIC_DELAY_MS = 500;
// The four status lines under the card: first one after BOOT_FIRST_MS, then one every BOOT_STEP_MS.
const BOOT_FIRST_MS = 350;
const BOOT_STEP_MS = 420;
// Desktop lock: wheel input in the first LOCK_SETTLE_MS after arriving is absorbed; a "flick"
// is a burst of wheel events after at least FLICK_GAP_MS of quiet; two flicks move on.
const LOCK_SETTLE_MS = 800;
const FLICK_GAP_MS = 300;
const POWER_DELAY_MS = 250; // the dark glass holds this long before the power-on
const POWER_MS = 760;       // dot -> line -> white field -> fade
const EXIT_HOLD_MS = 1400; // after leaving the desktop: downward wheel held while landing
const CATCH_QUIET_MS = 240;  // scrolling back up onto the desktop: the flick's momentum is absorbed
const CATCH_MAX_MS = 1800;   // until the wheel goes quiet this long, or for at most this long

// The close-up the push-in video starts from: this rectangle of the film (a crop of the still).
const CLOSEUP = { x: 868, y: 479.25, w: 145, h: 81.6 };
// Three Higgsfield clips (Kling 3.0), all with real CRT glitch static in the footage, and like
// the still, graded to the meadow film's colours (per-channel gain/offset fitted on the frames):
//  - HOLD: the close-up, camera locked, the screen glitching (a seamless loop). It lies on the
//    still's monitor inside the zooming layer and plays from the moment the screen appears;
//  - PUSH: from that close-up into the screen until the Cenner card fills the frame
//    (short GOPs so scroll can scrub it);
//  - CARD: the full-frame Cenner card glitching (a seamless loop, plays live).
const CLIPS = {
  hold: ['/video/glitch-closeup-v1-1280.mp4', '/video/glitch-closeup-v1-854.mp4'],
  push: ['/video/push-in-v3-1280.mp4', '/video/push-in-v3-854.mp4'],
  card: ['/video/glitch-card-v1-1280.mp4', '/video/glitch-card-v1-854.mp4'],
} as const;

const ZoomIn: React.FC<{ reduce: boolean }> = ({ reduce }) => {
  const t = useT();
  const ref = React.useRef<HTMLElement>(null);
  const film = React.useRef<HTMLDivElement>(null);
  const line1 = React.useRef<HTMLDivElement>(null);
  const line2 = React.useRef<HTMLDivElement>(null);
  const intro = React.useRef<HTMLDivElement>(null);
  const still = React.useRef<HTMLImageElement>(null);
  const hold = React.useRef<HTMLVideoElement>(null);
  const push = React.useRef<HTMLVideoElement>(null);
  const card = React.useRef<HTMLVideoElement>(null);
  const inside = React.useRef<HTMLDivElement>(null);
  const boot = React.useRef<HTMLDivElement>(null);
  const grain = React.useRef<HTMLDivElement>(null);
  // The static starts STATIC_DELAY_MS after the Cenner screen has appeared (a timer, not a
  // scroll position), so the clean screen always holds for a beat first.
  const staticTimer = React.useRef<number | null>(null);
  const staticOn = React.useRef(false);
  const lastP = React.useRef(-1);
  const pushEnded = React.useRef(false);   // the push-in played to its end on its own
  const curP = React.useRef(0);
  const bootRun = React.useRef({ started: false, done: false, timers: [] as number[] });
  const bootLines = () => Array.from(boot.current?.querySelectorAll<HTMLElement>('[data-boot]') ?? []);
  const startBoot = () => {
    const run = bootRun.current;
    run.started = true;
    const lines = bootLines();
    lines.forEach((el, i) => {
      run.timers.push(window.setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; }, BOOT_FIRST_MS + i * BOOT_STEP_MS));
    });
    run.timers.push(window.setTimeout(() => {
      run.done = true;
    }, BOOT_FIRST_MS + lines.length * BOOT_STEP_MS + 200));
  };
  const resetBoot = () => {
    const run = bootRun.current;
    run.timers.forEach(id => window.clearTimeout(id));
    run.timers = []; run.started = false; run.done = false;
    bootLines().forEach(el => { el.style.opacity = '0'; el.style.transform = ''; });
  };
  // While the lines are ticking in, extra downward wheel scrolling past the card is held back
  // (about two seconds at most), so a free-spinning wheel cannot fling the visitor past them.
  // Touch and keyboard scrolling are never blocked.
  React.useEffect(() => {
    if (reduce) return;
    const brake = (e: WheelEvent) => {
      const run = bootRun.current, sec = ref.current;
      if (e.deltaY <= 0 || !sec) return;
      const p = curP.current;
      if (p < 0.6 || p >= 1) return;
      // Lines done: the next downward scroll goes straight into the desktop.
      if (run.done) { if (p >= 0.84) { e.preventDefault(); goToDesktop(); } return; }
      const range = Math.max(1, sec.offsetHeight - (window.innerHeight - NAV_H));
      const px = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      const next = p + px / range;
      if (run.started && p >= 0.84) { e.preventDefault(); return; }
      // A fast wheel would jump straight past the card: stop exactly on it instead, which
      // starts the lines, and hold there until they have finished.
      if (!run.started && next > 0.86) {
        e.preventDefault();
        const top = sec.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top - NAV_H + 0.855 * range);
      }
    };
    window.addEventListener('wheel', brake, { passive: false });
    return () => { window.removeEventListener('wheel', brake); bootRun.current.timers.forEach(id => window.clearTimeout(id)); };
  }, [reduce]);
  const lastScrollT = React.useRef(-1);    // push time the scroll last asked for
  const idle = React.useRef(0);            // timer: start playing when the scroll pauses
  const lastScroll = React.useRef({ y: 0, t: 0, v: 0 }); // for the visitor's scroll speed
  const lastHeroP = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(idle.current), []);
  React.useEffect(() => () => { if (staticTimer.current) window.clearTimeout(staticTimer.current); }, []);
  const [narrow, setNarrow] = React.useState<boolean | null>(null); // null until the clips may load

  // The clips are only fetched once the page has loaded and the browser is idle.
  React.useEffect(() => {
    if (reduce) return;
    const pick = () => setNarrow(window.matchMedia('(max-width: 767px)').matches);
    const go = () => (typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(pick, { timeout: 2000 }) : window.setTimeout(pick, 800));
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  }, [reduce]);

  usePin(ref, (p, W, H) => {
    const bw = Math.max(W, (H * 16) / 9);
    const bh = (bw * 9) / 16;
    const boxL = FOCUS_X * W - FOCUS_X * bw, boxT = 0.5 * H - 0.5 * bh;
    const fx = (x: number) => boxL + (x / 1920) * bw;
    const fy = (y: number) => boxT + (y / 1080) * bh;

    // 1. The camera moves in on the film (and the 4K still laid over it) until the view is
    //    exactly the close-up the push-in video starts from.
    const cx = fx(CLOSEUP.x + CLOSEUP.w / 2), cy = fy(CLOSEUP.y + CLOSEUP.h / 2);
    // Wide screens fill the stage with the close-up (cover); tall phone screens fit its width
    // (contain), so the clips that follow are never cropped at the sides.
    const tall = W / H < 16 / 9 * 0.8;
    const fit = tall ? Math.min : Math.max;
    const camEnd = fit(W / ((CLOSEUP.w / 1920) * bw), H / ((CLOSEUP.h / 1080) * bh));
    const z = smooth(span(p, 0.03, 0.4));
    const cam = Math.pow(camEnd, z);
    const tx = (W / 2 - cx) * z, ty = (H / 2 - cy) * z;
    if (film.current) {
      film.current.style.transformOrigin = `${cx}px ${cy}px`;
      film.current.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${cam})`;
      // The film's own grain (sky only, and it would scale with the zoom) hands over to the
      // screen-sized grain layer below, which covers the still and the clips too.
      film.current.style.setProperty('--mh-grain-opacity', String(0.88 * (1 - span(p, 0.015, 0.1))));
    }
    if (grain.current) grain.current.style.opacity = String(span(p, 0.015, 0.1) * (1 - span(p, 0.95, 1)));
    // The Higgsfield still (graded to the film's colours) fades in slowly as the scroll starts,
    // a touch soft at first like the film, sharpening as the camera moves in. The glitch loop
    // sits on its monitor (it is a crop of the same picture) and plays from the first moment.
    const appear = smooth(span(p, 0.005, 0.16));
    const soft = `blur(${(1.1 * (1 - smooth(span(p, 0.005, 0.25)))).toFixed(2)}px)`;
    const place = (el: HTMLElement | null, r: { x: number; y: number; w: number; h: number }) => {
      if (!el) return;
      el.style.left = `${fx(r.x)}px`;
      el.style.top = `${fy(r.y)}px`;
      el.style.width = `${(r.w / 1920) * bw}px`;
      el.style.height = `${(r.h / 1080) * bh}px`;
      el.style.filter = soft;
    };
    place(still.current, STILL);
    place(hold.current, CLOSEUP);
    if (still.current) still.current.style.opacity = String(appear);
    // 2. Hold on the close-up: the glitch loop takes over from the still (same frame) and
    //    plays live. 3. The push-in takes over (same frame again) and scroll scrubs it.
    //    4. The card loop takes over from its last frame and plays live.
    const show = (el: HTMLVideoElement | null, o: number) => {
      if (!el) return;
      el.style.opacity = String(o);
      if (o > 0 && el.loop && el.paused) el.play().catch(() => {});
      if (o === 0 && el.loop && !el.paused) el.pause();
    };
    if (appear > 0.6 && !staticOn.current && staticTimer.current === null) {
      staticTimer.current = window.setTimeout(() => {
        staticTimer.current = null;
        staticOn.current = true;
        lastP.current >= 0 && show(hold.current, 1 - span(lastP.current, 0.51, 0.52));
      }, STATIC_DELAY_MS);
    } else if (appear < 0.1) {
      // Back out in the meadow: reset, so the beat happens again next time.
      if (staticTimer.current !== null) { window.clearTimeout(staticTimer.current); staticTimer.current = null; }
      staticOn.current = false;
    }
    lastP.current = p;
    show(hold.current, staticOn.current ? 1 - span(p, 0.51, 0.52) : 0);
    // The push-in follows the scroll, but if the scroll stops part-way it keeps playing on its
    // own (static and all) and the card takes over when it ends, even before p reaches .84.
    const vid = push.current;
    const inZone = p >= 0.5 && p < 0.84;
    // Scrolling back up out of the monitor (leaving the push-in for the close-up): a flash.
    lastHeroP.current = p;
    if (p < 0.5) pushEnded.current = false;
    const cardOn = Math.max(span(p, 0.84, 0.85), pushEnded.current && p >= 0.5 ? 1 : 0);
    show(push.current, span(p, 0.5, 0.51) * (1 - cardOn));
    show(card.current, cardOn);
    // On a phone the clips sit as a band across the middle: the meadow still shows around the
    // close-up, and from the push-in on the band sits on the card's own edge blue.
    if (inside.current) inside.current.style.backgroundColor = tall && p >= 0.5 ? '#051199' : 'transparent';
    [push.current, card.current].forEach(el => { if (el) el.style.objectFit = tall ? 'contain' : 'cover'; });
    if (vid && vid.readyState >= 1 && isFinite(vid.duration)) {
      const end = Math.max(0, vid.duration - 0.05);
      const scrollT = span(p, 0.5, 0.84) * end;
      if (!vid.paused) vid.pause();
      if (idle.current) { window.clearTimeout(idle.current); idle.current = 0; }
      // Relative scrub: move by as much as the scroll moved, from wherever the video is now,
      // so there is no jump after it has played ahead on its own. Pinned at the zone's ends.
      let target = p < 0.5 ? 0 : p >= 0.84 ? end : clamp(vid.currentTime + (scrollT - lastScrollT.current), 0, end);
      if (lastScrollT.current < 0) target = scrollT;
      lastScrollT.current = scrollT;
      if (Math.abs(vid.currentTime - target) > 1 / 60) vid.currentTime = target;
      // How fast the visitor was scrolling (px/s, smoothed): the push-in carries on at a
      // matching speed when they stop, from 1.5x for a gentle scroll up to 4x for a fast spin.
      const now = performance.now(), y = window.scrollY;
      const dt = Math.max(1, now - lastScroll.current.t);
      if (dt < 400) lastScroll.current.v = lastScroll.current.v * 0.6 + (Math.abs(y - lastScroll.current.y) / dt) * 1000 * 0.4;
      lastScroll.current = { y, t: now, v: lastScroll.current.v };
      if (inZone && !pushEnded.current && target < end) {
        idle.current = window.setTimeout(() => {
          idle.current = 0;
          vid.playbackRate = clamp(1.5 + lastScroll.current.v / 900, 1.5, 4);
          vid.play().catch(() => {});
        }, 180);
      }
      vid.onended = () => {
        pushEnded.current = true;
        show(push.current, 0);
        show(card.current, 1);
      };
    }

    // 3. Once the card is fully on, the status lines tick in on a timer (not the scroll, so a
    //    fast wheel cannot skip them); after that the next scroll goes straight to the desktop.
    curP.current = p;
    if (cardOn >= 1 && !bootRun.current.started) startBoot();
    if (p < 0.8 && bootRun.current.started) resetBoot();

    const split = span(p, 0, 0.4);
    if (line1.current) line1.current.style.transform = `translate3d(${-split * 110}vw,0,0)`;
    if (line2.current) line2.current.style.transform = `translate3d(${split * 110}vw,0,0)`;
    if (intro.current) { intro.current.style.opacity = String(1 - span(p, 0, 0.12)); intro.current.style.visibility = p > 0.14 ? 'hidden' : 'visible'; }
  }, !reduce);

  const words = [[t('Freelance Hrvatska')], [t('Pronađi Freelancera')]];

  return (
    <section ref={ref} className={reduce ? 'relative' : 'relative h-[380vh]'}>
      <div className={`${reduce ? 'relative h-[calc(100svh-4.5rem)]' : 'sticky top-[4.5rem] h-[calc(100svh-4.5rem)]'} overflow-hidden bg-sky`}>
        <div ref={film} className="absolute inset-0 will-change-transform">
          <MeadowBackdrop variant="frame" controls={false} />
          {!reduce && (
            <img
              ref={still}
              src="/home/monitor-screen-1440.jpg"
              srcSet="/home/monitor-screen-1440.jpg 1440w, /home/monitor-screen-2880.jpg 2880w"
              sizes="1600px"
              alt=""
              decoding="async"
              className="pointer-events-none absolute opacity-0 [mask-image:radial-gradient(closest-side,#000_46%,rgba(0,0,0,.6)_70%,transparent_100%)] [-webkit-mask-image:radial-gradient(closest-side,#000_46%,rgba(0,0,0,.6)_70%,transparent_100%)]"
            />
          )}
          {!reduce && narrow !== null && (
            <video
              ref={hold}
              src={CLIPS.hold[narrow ? 1 : 0]}
              muted
              loop
              playsInline
              preload="auto"
              tabIndex={-1}
              className="pointer-events-none absolute object-cover opacity-0 transition-opacity duration-300"
              style={{
                WebkitMaskImage: 'linear-gradient(to right,transparent,#000 14%,#000 86%,transparent),linear-gradient(to bottom,transparent,#000 14%,#000 86%,transparent)',
                maskImage: 'linear-gradient(to right,transparent,#000 14%,#000 86%,transparent),linear-gradient(to bottom,transparent,#000 14%,#000 86%,transparent)',
                WebkitMaskComposite: 'source-in',
                maskComposite: 'intersect',
              }}
            />
          )}
        </div>

        {/* The headline splits apart as the camera moves in. */}
        <h1 className="pointer-events-none absolute inset-x-0 top-[5%] z-10 px-4 font-display font-black uppercase leading-[0.86] tracking-[-0.04em] text-white md:px-8">
          <div ref={line1} className="will-change-transform [text-shadow:.045em_.045em_0_#0b0c0e] text-[12.5vw] md:whitespace-nowrap md:text-[6.9vw]">{words[0]}</div>
          <div ref={line2} className="will-change-transform text-right [text-shadow:.045em_.045em_0_#0b0c0e] text-[12.5vw] md:whitespace-nowrap md:text-[6.9vw]">{words[1]}</div>
        </h1>

        <div ref={intro} className="absolute inset-x-4 bottom-4 z-10 flex flex-col items-start gap-3 md:inset-x-8 md:bottom-5">
          <div className="flex flex-col items-center gap-3">
          <div className="max-w-[34rem] text-ink md:border-2 md:border-ink md:bg-paper md:p-5 md:shadow-[8px_8px_0_#0b0c0e]">
            <p className="hidden font-text text-[1.0625rem] leading-[1.5] md:block">
              {t('Vodeća freelance platforma u Hrvatskoj. Povezujemo tvrtke s provjerenim freelancerima za izradu web stranica, dizajn, marketing i razvoj. Honorarni posao: brzo, sigurno, profesionalno.')}
            </p>
            <div className="flex flex-wrap gap-3 md:mt-4">
              <Link to="/marketplace" className="cn-press inline-flex items-center gap-2 border-2 border-ink bg-brand-green px-5 py-3 font-display text-[15px] font-bold">
                {t('Explore Marketplace')} <ArrowRight size={17} />
              </Link>
              <Link to="/services" className="cn-press inline-flex items-center gap-2 border-2 border-ink bg-white px-5 py-3 font-display text-[15px] font-bold">
                {t('Cenner Services')}
              </Link>
            </div>
          </div>
          </div>
          {/* Scroll cue: the word in the pixel font, a pixel arrow stepping up and down under it,
              always right under the intro card. */}
          {!reduce && (
            <span aria-hidden="true" className="pointer-events-none flex flex-col items-center gap-2 self-center font-crt text-[11px] uppercase tracking-[0.12em] text-white [text-shadow:2px_2px_0_#0b0c0e] md:text-[13px]">
              {t('Scroll')}
              <svg className="cn-bob h-[21px] w-[27px] md:h-[24px] md:w-[30px]" viewBox="0 0 9 7" shapeRendering="crispEdges" style={{ filter: 'drop-shadow(2px 2px 0 #0b0c0e)' }}>
                {[[4, 0], [4, 1], [4, 2], [1, 3], [4, 3], [7, 3], [2, 4], [4, 4], [6, 4], [3, 5], [4, 5], [5, 5], [4, 6]].map(([x, y]) => (
                  <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#fff" />
                ))}
              </svg>
            </span>
          )}
        </div>

        {/* Inside the monitor: the three glitching clips, stacked, each faded in on the frame
            the previous one ends on. */}
        {!reduce && (
          <div ref={inside} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
            {narrow !== null && (
              <>
                <video ref={push} src={CLIPS.push[narrow ? 1 : 0]} muted playsInline preload="auto" tabIndex={-1} className="absolute inset-0 h-full w-full object-cover opacity-0" />
                <video ref={card} src={CLIPS.card[narrow ? 1 : 0]} muted loop playsInline preload="auto" tabIndex={-1} className="absolute inset-0 h-full w-full object-cover opacity-0" />
              </>
            )}
            <div ref={boot} className="absolute inset-x-0 top-[calc(72%+60px)] flex flex-col items-center space-y-2 font-crt text-[clamp(0.7rem,1.1vw,1.05rem)] uppercase leading-[1.6] text-brand-green cn-glow">
              <p data-boot className="translate-y-1.5 opacity-0 transition duration-300 ease-out">{t('Verified freelancers')} ........ OK</p>
              <p data-boot className="translate-y-1.5 opacity-0 transition duration-300 ease-out">{t('Secure payment')} ........ OK</p>
              <p data-boot className="translate-y-1.5 opacity-0 transition duration-300 ease-out">{t('Fixed Pricing')} ........ OK</p>
              <p data-boot className="translate-y-1.5 opacity-0 transition duration-300 ease-out">{t('In-House Team')} ........ OK<span className="cn-caret">_</span></p>
            </div>
          </div>
        )}

        {/* The same film grain as the meadow loop (grain-v1.png, approved "grain 30"), at screen
            scale over the still and the clips once the camera starts moving. */}
        {!reduce && (
          <div ref={grain} aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 overflow-hidden opacity-0">
            <span className="cn-grain" />
          </div>
        )}
      </div>
    </section>
  );
};

/* ===================================================================== hero: pocket (phones, tablets) */

/* Below laptop width the opening is a busy man's hand holding the CENNER pocket PDA on a
 * 1998 New York street (Higgsfield still + Kling loop), the years PDAs were everywhere. Scrolling does what the PC hero does:
 * the headline splits, the camera pushes into the PDA's screen, the screen comes up crisp
 * with the status lines, and the page runs on into the pocket device itself. */
const CITY = {
  poster: ['/home/city-pda-720.webp', '/home/city-pda-1080.webp'],
  // Kling Pro's native 1076px for sharp phone screens; 720 for low-density screens and slow links
  // v3: v2 plus a seamless steam layer that rises out of the manhole for ever (one tile per loop)
  video: ['/video/city-pda-v3-720.mp4', '/video/city-pda-v3-1076.mp4'],
};
// the PDA's screen in the 9:16 frame: centre and size, as fractions (of the box the picture
// covers: the 1080x1935 still loses 0.4% top and bottom to the 9:16 crop)
const CITY_SCREEN = { x: 0.5283, y: 0.5385, w: 0.2663, h: 0.1992 };
// Where the photo's screen draws its lettering (ink boxes measured on the still, as fractions of
// the screen's height): CENNER's top and FREELANCE HRVATSKA's bottom. The crisp overlay sets its
// own lettering on exactly those boxes (see SCREEN_TYPE), so the handoff is a sharpen, not a
// second layer.
const CITY_INK = { top: 0.3943, bottom: 0.5957 };
// The overlay's lettering in fractions of the screen's width (--fw) and height (--fh), which the
// scroll handler sets in px (container units would drop out on older Safari/Chrome). Calibrated
// with canvas text metrics so the ink lands on the photo's: CENNER 6.7-93.7% across, 39.4-52.0%
// down (Libre Franklin 900); FREELANCE HRVATSKA 4.9-94.3% across, 55.7-59.6% down (JetBrains Mono 700).
const SCREEN_TYPE = {
  title: { left: 'calc(var(--fw) * .0603)', top: 'calc(var(--fh) * .3791)', fontSize: 'calc(var(--fh) * .1648)', letterSpacing: '-0.0624em', textShadow: '0 0 calc(var(--fw) * .016) rgba(166,223,204,.45)' },
  sub: { left: 'calc(var(--fw) * .0438)', top: 'calc(var(--fh) * .5529)', fontSize: 'calc(var(--fh) * .05224)', letterSpacing: '0.1282em' },
} as const;
// The calibration only holds in those two faces: until both are loaded (or if they are blocked),
// the lettering waits for the screen to be opaque, so a fallback font never crossfades onto the
// photo's lettering.
function screenFontsLoaded() {
  let title = false, sub = false;
  document.fonts.forEach(f => {
    if (f.status !== 'loaded') return;
    const fam = f.family.replace(/["']/g, '');
    if (fam === 'Libre Franklin' && f.weight === '900') title = true;
    if (fam === 'JetBrains Mono' && f.weight === '700') sub = true;
  });
  return title && sub;
}

const ZoomInPocket: React.FC<{ reduce: boolean }> = ({ reduce }) => {
  const t = useT();
  const ref = React.useRef<HTMLElement>(null);
  const stage = React.useRef<HTMLDivElement>(null);
  const film = React.useRef<HTMLDivElement>(null);
  const box = React.useRef<HTMLDivElement>(null);
  const still = React.useRef<HTMLImageElement>(null);
  const video = React.useRef<HTMLVideoElement>(null);
  const screen = React.useRef<HTMLDivElement>(null);   // the overlay: face, surround, scanlines, lines
  const face = React.useRef<HTMLDivElement>(null);     // the PDA's screen, crisp, riding on the photo's
  const surround = React.useRef<HTMLDivElement>(null); // screen blue over the rest of the view
  const scan = React.useRef<HTMLDivElement>(null);
  const faceScan = React.useRef<HTMLDivElement>(null);
  const letters = React.useRef<HTMLDivElement>(null);
  const bootBox = React.useRef<HTMLDivElement>(null);
  const fontsOk = React.useRef(false);
  const line1 = React.useRef<HTMLDivElement>(null);
  const line2 = React.useRef<HTMLDivElement>(null);
  const intro = React.useRef<HTMLDivElement>(null);
  const [src, setSrc] = React.useState<string | null>(null);
  const booted = React.useRef<number[] | null>(null);
  const curP = React.useRef(0);

  // the nav leaves as the camera goes into the screen (pushNav reads where this section is)
  React.useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    pocketHero = el;
    window.dispatchEvent(new Event('scroll'));
    return () => { if (pocketHero === el) pocketHero = null; };
  }, [reduce]);

  // Tablet-size screens go on to the laptop's full desktop: once the status lines are up, the next
  // downward wheel glides onto it (as the CRT hero does), so it lands full-frame and the desktop's
  // wheel lock takes over. Touch scrolling is never held.
  React.useEffect(() => {
    if (reduce) return;
    const brake = (e: WheelEvent) => {
      if (e.deltaY <= 0 || !window.matchMedia(DESK_QUERY).matches) return;
      if (booted.current && curP.current >= 0.7 && curP.current < 1) { e.preventDefault(); goToDesktop(); }
    };
    window.addEventListener('wheel', brake, { passive: false });
    return () => window.removeEventListener('wheel', brake);
  }, [reduce]);

  // the loop loads once the page is idle, not on a data saver
  React.useEffect(() => {
    if (reduce) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData) return;
    const lean = window.devicePixelRatio < 1.5 || conn?.effectiveType === '3g';
    const pick = () => setSrc(CITY.video[lean ? 0 : 1]);
    const go = () => (typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(pick, { timeout: 2000 }) : window.setTimeout(pick, 800));
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  }, [reduce]);

  const lines = () => Array.from(screen.current?.querySelectorAll<HTMLElement>('[data-boot]') ?? []);
  const startLines = () => {
    if (booted.current) return;
    booted.current = lines().map((el, i) => window.setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; }, BOOT_FIRST_MS + i * BOOT_STEP_MS));
  };
  const resetLines = () => {
    if (!booted.current) return;
    booted.current.forEach(id => window.clearTimeout(id));
    booted.current = null;
    lines().forEach(el => { el.style.opacity = '0'; el.style.transform = ''; });
  };
  React.useEffect(() => () => booted.current?.forEach(id => window.clearTimeout(id)), []);

  // Ask for the screen's two faces up front, and re-run the scroll handler when any font lands.
  React.useEffect(() => {
    if (reduce || !document.fonts) return;
    const kick = () => window.dispatchEvent(new Event('scroll'));
    document.fonts.addEventListener('loadingdone', kick);
    document.fonts.load('900 1em "Libre Franklin"', 'CENNER').catch(() => {});
    document.fonts.load('700 1em "JetBrains Mono"', 'FREELANCE HRVATSKA').catch(() => {});
    return () => document.fonts.removeEventListener('loadingdone', kick);
  }, [reduce]);

  // Reduced motion switched on mid-scroll: drop the camera the scroll handler left behind.
  React.useEffect(() => {
    if (!reduce) return;
    if (film.current) { film.current.style.transform = ''; film.current.style.transformOrigin = ''; }
    if (box.current) Object.assign(box.current.style, { left: '', top: '', width: '', height: '' });
  }, [reduce]);

  usePin(ref, (p, pinW, pinH) => {
    curP.current = p;
    // the real stage size (it is 100svh tall; innerHeight changes as mobile toolbars collapse)
    const W = stage.current?.clientWidth || pinW, H = stage.current?.clientHeight || pinH;
    const bootH = bootBox.current?.offsetHeight ?? 0; // read before any style is written this frame
    // the 9:16 picture covers the stage (like object-fit: cover)
    const bw = Math.max(W, (H * 9) / 16), bh = (bw * 16) / 9;
    const bl = (W - bw) / 2, bt = (H - bh) / 2;
    if (box.current) Object.assign(box.current.style, { left: `${bl}px`, top: `${bt}px`, width: `${bw}px`, height: `${bh}px` });
    // The camera pushes into the PDA's screen until the screen spans the stage's width, so its
    // lettering is never cropped (on a short landscape stage it stops sooner, so the lettering and
    // the status lines under it fit the height). The lettering and the lines are centred as one
    // block; around the screen the view floods with the screen's blue.
    const cx = bl + CITY_SCREEN.x * bw, cy = bt + CITY_SCREEN.y * bh;
    const sw = CITY_SCREEN.w * bw, sh = CITY_SCREEN.h * bh;
    const gap = clamp(H * 0.05, 16, 48);
    const inkH = (CITY_INK.bottom - CITY_INK.top) * (sh / sw); // lettering height per px of screen width
    const margin = Math.max(24, H * 0.1);
    const faceW = Math.max(sw, Math.min(W, (H - bootH - gap - 2 * margin) / inkH));
    const end = faceW / sw, faceH = sh * end;
    // On stages too short for the whole block even at the smallest zoom, the status lines shrink.
    const inkPx = inkH * faceW;
    const bootK = bootH > 0 ? clamp((H - inkPx - gap) / bootH, 0.5, 1) : 1;
    // the lettering ends in the centre; it moves up only as far as the status lines under it need
    const blockTop = Math.max(0, Math.min((H - inkPx) / 2, H - margin - (inkPx + gap + bootH * bootK)));
    const faceTop = blockTop - CITY_INK.top * faceH;
    // The camera zooms to just short of the end, then keeps pushing in gently through the handoff
    // (the screen sharpens and the blue floods while it still moves) instead of stopping dead.
    const PUSH = 1.08;
    const z = smooth(span(p, 0.06, 0.58));
    const q = smooth(span(p, 0.48, 0.68));
    const scale = Math.pow(end / PUSH, z) * (1 + (PUSH - 1) * q);
    // The pan never uncovers the stage: at scale s about origin o, the picture [lo, lo+len] must
    // still cover [0, size] (matters on short landscape stages, where the zoom is small).
    const fit = (want: number, s: number, o: number, lo: number, len: number, size: number) =>
      clamp(want, size - o - s * (lo + len - o), -o - s * (lo - o));
    const txEnd = fit(W / 2 - cx, end, cx, bl, bw, W);
    const tyEnd = fit(faceTop + faceH / 2 - cy, end, cy, bt, bh, H);
    const tx = fit(txEnd * z, scale, cx, bl, bw, W), ty = fit(tyEnd * z, scale, cy, bt, bh, H);
    if (film.current) {
      film.current.style.transformOrigin = `${cx}px ${cy}px`;
      film.current.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${scale})`;
    }
    // the still takes over from the loop as the camera starts, so the hand holds still
    if (still.current) still.current.style.opacity = String(span(p, 0.01, 0.06));
    const v = video.current;
    if (v) { if (p > 0.07) v.pause(); else if (v.paused) v.play().catch(() => {}); }
    // The crisp screen rides exactly on the photo's (laid out at its final size, scaled down onto
    // it) and fades in over it while the camera is still moving; then the blue floods the rest of
    // the view and the status lines tick in under the lettering.
    const faceOn = span(p, 0.5, 0.56), allOn = span(p, 0.5, 0.6);
    if (screen.current) screen.current.style.visibility = faceOn > 0 ? 'visible' : 'hidden';
    if (face.current) {
      const k = scale / end; // the screen's size now, relative to its final size
      // rounded like the photo's LCD while it rides on it; square once the blue fills the view
      const rr = 1 - allOn;
      Object.assign(face.current.style, {
        width: `${faceW}px`, height: `${faceH}px`, opacity: String(faceOn),
        borderRadius: rr > 0 ? `${5.5 * rr}% ${5.5 * rr}% ${0.7 * rr}% ${0.7 * rr}% / ${3 * rr}% ${3 * rr}% ${0.5 * rr}% ${0.5 * rr}%` : '0',
        transform: `translate3d(${cx + tx - (sw * scale) / 2}px,${cy + ty - (sh * scale) / 2}px,0) scale(${k})`,
      });
      face.current.style.setProperty('--fw', `${faceW}px`);
      face.current.style.setProperty('--fh', `${faceH}px`);
    }
    if (!fontsOk.current) fontsOk.current = screenFontsLoaded();
    if (letters.current) letters.current.style.opacity = fontsOk.current ? '1' : String(span(p, 0.56, 0.62));
    if (surround.current) surround.current.style.opacity = String(allOn);
    // once the blue fills the view the stage itself is that blue, fully opaque, so nothing behind it can show
    if (stage.current) stage.current.style.backgroundColor = allOn >= 1 ? '#364587' : '';
    // the screen's own scanlines ride on it; once the blue fills the view, one full-stage layer takes over
    if (faceScan.current) faceScan.current.style.opacity = String(0.5 * (1 - allOn));
    if (scan.current) scan.current.style.opacity = String(0.5 * allOn);
    if (bootBox.current) {
      // under the lettering, wherever the camera's end left it
      const faceTopEnd = cy + tyEnd - faceH / 2;
      Object.assign(bootBox.current.style, {
        top: `${faceTopEnd + CITY_INK.bottom * faceH + gap}px`,
        opacity: String(allOn),
        transformOrigin: '50% 0',
        transform: `translate3d(${cx + txEnd - W / 2}px,0,0)${bootK < 1 ? ` scale(${bootK})` : ''}`,
      });
    }
    if (allOn >= 1 && q >= 1) startLines(); else if (p < 0.55) resetLines();
    const split = span(p, 0, 0.4);
    if (line1.current) line1.current.style.transform = `translate3d(${-split * 110}vw,0,0)`;
    if (line2.current) line2.current.style.transform = `translate3d(${split * 110}vw,0,0)`;
    if (intro.current) { intro.current.style.opacity = String(1 - span(p, 0, 0.12)); intro.current.style.visibility = p > 0.14 ? 'hidden' : 'visible'; }
  }, !reduce);

  const words = [t('Freelance Hrvatska'), t('Pronađi Freelancera')];
  return (
    <section ref={ref} className={reduce ? 'relative' : 'relative flow-root h-[300vh]'}>
      {/* The strip above the stage, under the nav: the screen's blue, seen once the nav has left as
          the camera goes into the screen (see pushNav). It takes no room (the stage stays put; the
          section is a flow root so its negative margin does not pull the whole section up). */}
      {!reduce && (
        <div aria-hidden="true" className="pointer-events-none sticky top-0 -mt-[4.5rem] h-[4.5rem] bg-[#364587]">
          <div className="cn-scan absolute inset-0 opacity-50" />
        </div>
      )}
      <div ref={stage} className={`${reduce ? 'relative' : 'sticky top-[4.5rem]'} h-[calc(100svh-4.5rem)] overflow-hidden bg-ink`}>
        <div ref={film} className="absolute inset-0 will-change-transform">
          <div ref={box} className="absolute inset-0">
            <img
              src={CITY.poster[0]}
              srcSet={`${CITY.poster[0]} 720w, ${CITY.poster[1]} 1080w`}
              sizes="100vw"
              alt=""
              decoding="async"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {src && (
              // no autoPlay: the scroll position decides (it plays only near the top of the hero)
              <video ref={video} src={src} muted loop playsInline preload="auto" tabIndex={-1}
                onLoadedData={() => window.dispatchEvent(new Event('scroll'))}
                onError={() => setSrc(null)}
                className="absolute inset-0 h-full w-full object-cover" />
            )}
            {/* the same frame, sharp, over the loop once the camera moves */}
            {!reduce && <img ref={still} src={CITY.poster[1]} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-0" />}
          </div>
        </div>

        <h1 className="pointer-events-none absolute inset-x-0 top-[5%] z-10 px-4 font-display font-black uppercase leading-[0.86] tracking-[-0.04em] text-white md:px-8">
          <div ref={line1} className="will-change-transform text-[min(12.5vw,8.5svh)] [text-shadow:.045em_.045em_0_#0b0c0e]">{words[0]}</div>
          <div ref={line2} className="will-change-transform text-right text-[min(12.5vw,8.5svh)] [text-shadow:.045em_.045em_0_#0b0c0e]">{words[1]}</div>
        </h1>

        <div ref={intro} className="absolute inset-x-4 bottom-3 z-10 flex flex-col gap-3 md:inset-x-8 md:bottom-5">
          <div className="flex flex-wrap gap-3">
            <Link to="/marketplace" className="cn-press inline-flex items-center gap-2 border-2 border-ink bg-brand-green px-5 py-3 font-display text-[15px] font-bold">
              {t('Explore Marketplace')} <ArrowRight size={17} />
            </Link>
            <Link to="/services" className="cn-press inline-flex items-center gap-2 border-2 border-ink bg-white px-5 py-3 font-display text-[15px] font-bold">
              {t('Cenner Services')}
            </Link>
          </div>
          {!reduce && (
            <span aria-hidden="true" className="pointer-events-none flex flex-col items-center gap-2 self-center font-crt text-[11px] uppercase tracking-[0.12em] text-white [text-shadow:2px_2px_0_#0b0c0e]">
              {t('Scroll')}
              <svg className="cn-bob h-[21px] w-[27px]" viewBox="0 0 9 7" shapeRendering="crispEdges" style={{ filter: 'drop-shadow(2px 2px 0 #0b0c0e)' }}>
                {[[4, 0], [4, 1], [4, 2], [1, 3], [4, 3], [7, 3], [2, 4], [4, 4], [6, 4], [3, 5], [4, 5], [5, 5], [4, 6]].map(([x, y]) => (
                  <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#fff" />
                ))}
              </svg>
            </span>
          )}
        </div>

        {/* The PDA's screen, crisp: a face that rides on the photo's screen (same blue, lettering
            on the photo's own ink boxes), the blue around it, and the status lines. */}
        {!reduce && (
          <div ref={screen} aria-hidden="true" className="pointer-events-none invisible absolute inset-0 z-20">
            <div ref={surround} className="absolute inset-0 bg-[#364587] opacity-0" />
            {/* rounded like the photo's LCD (its top corners are about 16 x 12 of its 288 x 383 px) */}
            <div ref={face} className="absolute left-0 top-0 origin-top-left overflow-hidden bg-[#364587] opacity-0" style={{ borderRadius: '5.5% 5.5% 0.7% 0.7% / 3% 3% 0.5% 0.5%' }}>
              <div ref={letters}>
                <p className="absolute whitespace-nowrap font-display font-black leading-none text-[#a6dfcc]" style={SCREEN_TYPE.title}>CENNER</p>
                <p className="absolute whitespace-nowrap font-term font-bold leading-none text-[#a6dfcc]" style={SCREEN_TYPE.sub}>FREELANCE HRVATSKA</p>
              </div>
              <div ref={faceScan} className="cn-scan absolute inset-0 opacity-50" />
            </div>
            <div ref={scan} className="cn-scan absolute inset-0 opacity-0" />
            <div ref={bootBox} className="absolute inset-x-0 flex flex-col items-center space-y-2 font-crt text-[clamp(0.6rem,min(2.6vw,4.2svh),0.95rem)] uppercase leading-[1.6] text-brand-green opacity-0 cn-glow">
              <p data-boot className="translate-y-1.5 opacity-0 transition duration-300 ease-out">{t('Verified freelancers')} .... OK</p>
              <p data-boot className="translate-y-1.5 opacity-0 transition duration-300 ease-out">{t('Secure payment')} .... OK</p>
              <p data-boot className="translate-y-1.5 opacity-0 transition duration-300 ease-out">{t('Fixed Pricing')} .... OK</p>
              <p data-boot className="translate-y-1.5 opacity-0 transition duration-300 ease-out">{t('In-House Team')} .... OK<span className="cn-caret">_</span></p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ===================================================================== the desktop */

type Win = {
  id: string;
  title: string;
  bar: string;
  x: number; // initial position, fraction of the desktop
  y: number;
  w: string;
  body: React.ReactNode;
};

const Clock: React.FC = () => {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 15000); return () => window.clearInterval(id); }, []);
  return (
    <time dateTime={now.toISOString()} className="tabular-nums">
      {new Intl.DateTimeFormat('hr-HR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zagreb' }).format(now)}
    </time>
  );
};

// Leave the desktop alone for a while and the old bouncing-logo screensaver starts. Any
// input ends it. Off under reduced motion, and only while the desktop is on screen.
const SAVER_IDLE_MS = 120000; // two minutes without input
const SAVER_COLOURS = ['#4ade80', '#ffffff', '#f472b6', '#facc15', '#60a5fa'];

function useScreensaver(ref: React.RefObject<HTMLElement>) {
  const [on, setOn] = React.useState(false);
  const logo = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let visible = false;
    let timer = 0;
    const arm = () => { window.clearTimeout(timer); if (visible) timer = window.setTimeout(() => setOn(true), SAVER_IDLE_MS); };
    const wake = () => { setOn(false); arm(); };
    const io = new IntersectionObserver(entries => { const e = entries[entries.length - 1]; visible = e.intersectionRatio > 0.6; if (!visible) setOn(false); arm(); }, { threshold: [0, 0.6, 1] });
    io.observe(el);
    const evs = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;
    evs.forEach(ev => window.addEventListener(ev, wake, { passive: true }));
    return () => { io.disconnect(); window.clearTimeout(timer); evs.forEach(ev => window.removeEventListener(ev, wake)); };
  }, [ref]);

  React.useEffect(() => {
    if (!on) return;
    const el = logo.current;
    const box = (el?.offsetParent as HTMLElement | null) ?? ref.current; // the screen it is drawn on, not the whole bezel
    if (!box || !el) return;
    let x = 40, y = 40, vx = 2.4, vy = 1.9, c = 0, raf = 0;
    const step = () => {
      const W = box.clientWidth - el.offsetWidth, H = box.clientHeight - el.offsetHeight;
      x += vx; y += vy;
      let hit = false;
      if (x <= 0 || x >= W) { vx = -vx; x = clamp(x, 0, W); hit = true; }
      if (y <= 0 || y >= H) { vy = -vy; y = clamp(y, 0, H); hit = true; }
      if (hit) { c = (c + 1) % SAVER_COLOURS.length; el.style.color = SAVER_COLOURS[c]; }
      el.style.transform = `translate3d(${x}px,${y}px,0)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [on, ref]);

  if (!on) return null;
  return (
    <div aria-hidden="true" className="absolute inset-0 z-[90] bg-black">
      <div ref={logo} className="absolute left-0 top-0 font-display text-[clamp(3rem,8vw,7rem)] font-black uppercase leading-none tracking-[-0.05em]" style={{ color: SAVER_COLOURS[0] }}>
        Cenner
      </div>
    </div>
  );
}

/* ===================================================================== the pocket device */

/* Below laptop width the desktop is a pocket PDA instead of the CRT: a photographed silver
 * device (Higgsfield, screen keyed out) running early-2000s pocket software. A Today screen
 * (date, who is signed in, the safety points as the day's entries, the referral as an unread
 * message, the two first steps as tasks), a Start menu holding the whole site menu, and the
 * desktop's windows as full-screen apps closed with the round "ok". The hardware keys work:
 * jobs, account, chat, home; the pad's centre opens Start, its arrows scroll; power shuts down.
 * The screen chrome is sized in screen units (--u = 1/240 of its width), so it scales with the
 * device from a small phone to a tablet. */
// The device fills the viewport like the CRT on wide screens: a 9-slice frame cut from the
// photo (slimmer sides, thinner inner bezel, decorations painted out), with the CENNER mark,
// the power button and the key row laid over it at their natural shape. All measured in the
// frame's own pixels (pda-frame.webp is 2x: 984 x 1828), scaled by --pz.
// hardware keys on the keys' plate (the middle 992 x 390 of pda-keys-wide.webp): centre (% of its
// width / height), diameter (% of width)
const PDA_KEYS = {
  jobs: { x: 8.2, y: 47.4, d: 12.5 },
  account: { x: 25.1, y: 47.4, d: 12.5 },
  pad: { x: 50, y: 50.8, d: 9 },
  up: { x: 50, y: 26.2, d: 7.5 },
  down: { x: 50, y: 75.4, d: 7.5 },
  chat: { x: 74.8, y: 47.4, d: 12.5 },
  home: { x: 91.7, y: 47.4, d: 12.5 },
};
type PocketApp = 'trust' | 'team' | 'people' | 'chat' | 'lang';
const u = (n: number) => `calc(var(--u) * ${n})`;

const CFlag: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-brand-green to-brand-pink font-display font-black text-ink" style={{ width: u(size), height: u(size), fontSize: u(size * 0.66), borderRadius: u(size * 0.18), transform: 'skewY(-7deg)' }}>C</span>
);

const PocketPC: React.FC<{
  wins: Win[];
  power: 'dark' | 'warming' | 'on';
  screenOn: boolean;
  unread: boolean;
  balloon: boolean;
  onBalloon: (open: boolean) => void;
  onRead: () => void;
  cue?: false | 'on' | 'out'; // the "how to use it" cue: a beacon on Start and a tag under it
}> = ({ wins, power, screenOn, unread, balloon, onBalloon, onRead, cue = false }) => {
  const t = useT();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, setLang } = useLanguage();
  const { market, links, about } = useSiteNav();
  const [menu, setMenu] = React.useState(false);
  const [chatMounted, setChatMounted] = React.useState(false); // kept once opened: the conversation survives
  const okRef = React.useRef<HTMLButtonElement>(null);
  const [sub, setSub] = React.useState<null | 'programs' | 'about'>(null);
  const [app, setApp] = React.useState<PocketApp | null>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const openApp = (a: PocketApp) => { setMenu(false); setApp(a); if (a === 'chat') setChatMounted(true); };
  // an app takes keyboard focus on its "ok" (it closes the app)
  React.useEffect(() => { if (app) okRef.current?.focus({ preventScroll: true }); }, [app]);
  const home = () => { setMenu(false); setApp(null); bodyRef.current?.scrollTo({ top: 0 }); };
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || (e.target as HTMLElement | null)?.closest?.('textarea, input')) return;
      setMenu(false); setApp(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const date = new Intl.DateTimeFormat(lang === 'HR' ? 'hr-HR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Zagreb' }).format(new Date());
  const appTitle = app === 'trust' ? t('Security') : app === 'team' ? t('Team') : app === 'people' ? t('Freelancers') : app === 'chat' ? t('Chat') : app === 'lang' ? t('Language') : '';
  const hasPeople = wins.some(w => w.id === 'people');
  const ico = { width: u(13), height: u(13) };
  const iconBox = (Icon: React.ComponentType<{ style?: React.CSSProperties }>) => (
    <span aria-hidden="true" className="flex shrink-0 items-center justify-center bg-white/90 text-[#3d7a0b]" style={{ width: u(16), height: u(16), borderRadius: u(2), marginTop: u(1) }}><Icon style={ico} /></span>
  );
  const rowCls = 'relative flex w-full items-start border-b border-[#10230a]/15 text-left transition-colors hover:bg-white/25 focus-visible:bg-white/35 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#10230a]';
  const rowPad = { gap: u(6), padding: `${u(4)} ${u(6)}` };
  const menuRow = 'flex w-full items-center text-left text-ink transition-colors hover:bg-[#3f6e0e] hover:text-white focus-visible:bg-[#3f6e0e] focus-visible:text-white focus-visible:outline-none';
  const mRowSt = { gap: u(6), padding: `${u(2.5)} ${u(7)}`, fontSize: `max(13px, ${u(12)})`, minHeight: `max(40px, ${u(20)})` }; // thumb-sized
  const mIco = { width: u(13), height: u(13) };
  const key = (k: keyof typeof PDA_KEYS) => ({ left: `${PDA_KEYS[k].x}%`, top: `${PDA_KEYS[k].y}%`, width: `${PDA_KEYS[k].d}%` });
  const pz = (n: number) => `calc(${n}px * var(--pz))`;
  // the keys plate's margins also fade with the wrapper's edges (only the margins: where the plate
  // fills the inner width, the fade is 0 wide), so a clip part-way through never shows
  const plateEdge = `calc((100% - min(${pz(496)}, calc(100vw - ${pz(82)}))) / 2)`;
  const plateMask = `linear-gradient(90deg, transparent, #000 ${plateEdge}, #000 calc(100% - ${plateEdge}), transparent)`;
  const plateFade: React.CSSProperties = { WebkitMaskImage: plateMask, maskImage: plateMask };
  const keyCls = 'absolute z-20 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors active:bg-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green';
  // the arrow keys scroll whatever is in front: the Start menu, the chat, an app, or Today
  const scrollBy = (dy: number) => {
    const el = (menu && document.getElementById('cn-pocket-start'))
      || (app === 'chat' && document.querySelector<HTMLElement>('#cn-pocket-chat [data-wheel-box]'))
      || (app && document.getElementById('cn-pocket-app'))
      || bodyRef.current;
    el?.scrollBy({ top: dy, behavior: 'smooth' });
  };

  return (
    <div className="cn-pda relative h-[100svh] w-full">
      {/* the screen, in the frame's opening (2px under the frame on every side) */}
      <div className="absolute overflow-hidden bg-[#5c9a10]" style={{ top: 'calc(var(--pt) - 2px)', left: 'calc(var(--ps) - 2px)', right: 'calc(var(--ps) - 2px)', bottom: 'calc(var(--pb) - 2px)', containerType: 'inline-size' }}>
          <div className="absolute inset-0 flex flex-col font-text" style={{ ['--u' as string]: 'min(calc(100cqw / 240), 1.75px)' } as React.CSSProperties}>
            {/* title bar */}
            <div className="relative z-30 flex shrink-0 items-center text-white" style={{ height: u(26), fontSize: u(13), background: 'linear-gradient(180deg,#6d8f22 0%,#36540d 50%,#1d3206 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.3)' }}>
              {app ? (
                <span className="flex min-w-0 flex-1 items-center font-bold" style={{ gap: u(5), padding: `0 ${u(5)}` }}><CFlag /><span className="truncate">{appTitle}</span></span>
              ) : (
                <button type="button" aria-expanded={menu} aria-controls="cn-pocket-start" onClick={() => { setMenu(v => !v); setSub(null); }} className={`relative flex h-full items-center font-bold ${menu ? 'bg-[#16290a]' : ''}`} style={{ gap: u(5), padding: `0 ${u(6)}` }}>
                  <CFlag /> Start
                  {cue && screenOn && <span aria-hidden="true" className="cn-beacon absolute rounded-full border border-ink bg-brand-green" style={{ right: u(-1), top: '50%', marginTop: u(-3.5), width: u(7), height: u(7) }} />}
                </button>
              )}
              {cue && screenOn && !app && !menu && (
                <span aria-hidden="true" data-out={cue === 'out' || undefined} className="cn-ghost pointer-events-none absolute whitespace-nowrap border border-ink bg-ink font-crt uppercase leading-none text-brand-green" style={{ left: u(5), top: `calc(100% + ${u(6)})`, padding: `${u(3.5)} ${u(4.5)}`, fontSize: `max(8px, ${u(6.5)})`, boxShadow: '2px 2px 0 #4ade80' }}>
                  <span className="absolute h-0 w-0 border-x-[5px] border-b-[6px] border-x-transparent border-b-ink" style={{ left: u(8), bottom: '100%' }} />
                  {t('Tap me')}
                </span>
              )}
              <span className="ml-auto flex items-center font-bold" style={{ gap: u(6), paddingRight: u(5) }}>
                <PxVolume aria-hidden="true" style={ico} />
                <Clock />
                {/* the notification sits last, by the screen edge, so its balloon has the room */}
                {unread && (
                  <button type="button" aria-label={t('Notifications')} aria-expanded={balloon} onClick={() => onBalloon(!balloon)} className="flex"><PxBell className="cn-caret" style={ico} /></button>
                )}
                {unread && balloon && screenOn && !app && !menu && (
                  <NotifyBalloon drop="down" width={u(226)} right={u(3)} onClose={() => { onBalloon(false); onRead(); }} onFollow={onRead} />
                )}
                {app && (
                  <button ref={okRef} type="button" aria-label={t('Close')} onClick={home} className="flex items-center justify-center border border-white/85 bg-[#5d9a17] hover:bg-[#3f6e0e] focus-visible:bg-[#3f6e0e]" style={{ width: u(20), height: u(20) }}><PxClose aria-hidden="true" style={{ width: u(12), height: u(12) }} /></button>
                )}
              </span>
            </div>

            {/* the Today screen's wallpaper: the live dot animation, behind the rows */}
            {!app && <ProjectDots palette={['#7bb423', '#86bd2b', '#8fc532', '#74ac1e', '#93c83a']} avoid="[data-pocket-today] p, [data-pocket-today] h2, [data-pocket-today] li, [data-pocket-today] strong, [data-pocket-today] span" className="pointer-events-none absolute left-0 z-0 w-full" style={{ top: u(26), height: `calc(100% - ${u(26)})` }} />}

            {/* Today, or the open app */}
            {chatMounted && (
              <div id="cn-pocket-chat" className={`relative z-10 min-h-0 flex-1 flex-col bg-white text-ink ${app === 'chat' ? 'flex' : 'hidden'}`}>
                <ChatInterface variant="window" isOpen onClose={home} freelancerName="Cenner Support" freelancerAvatar="https://picsum.photos/seed/concierge/200" />
              </div>
            )}
            {app === 'chat' ? null : app ? (
              <div id="cn-pocket-app" data-wheel-box className="relative z-10 min-h-0 flex-1 overflow-y-auto bg-white text-ink">
                {app === 'lang' ? (
                  <ul className="py-1">
                    {LANGUAGES.map(l => (
                      <li key={l.code}>
                        <button type="button" aria-pressed={lang === l.code} onClick={() => setLang(l.code)} className="flex w-full items-center gap-3 px-4 py-3 text-left font-display text-[15px] font-bold hover:bg-[#3f6e0e] hover:text-white">
                          <span aria-hidden="true">{l.flag}</span>{l.name}{lang === l.code && <PxCheck size={16} className="ml-auto" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  wins.find(w => w.id === app)?.body
                )}
              </div>
            ) : (
              <div ref={bodyRef} data-wheel-box data-pocket-today className="relative z-10 min-h-0 flex-1 overflow-y-auto text-[#10230a]" style={{ fontSize: u(12), background: 'radial-gradient(130% 50% at 85% 92%, rgba(255,255,255,.4), rgba(255,255,255,0) 60%), radial-gradient(90% 40% at 0% 0%, rgba(255,255,255,.12), rgba(255,255,255,0) 70%)' }}>
                <div className={rowCls} style={rowPad}>{iconBox(PxClock)}<p className="font-bold leading-tight first-letter:uppercase">{date}</p></div>
                <div className={rowCls} style={rowPad}>
                  {iconBox(PxFileText)}
                  <div className="leading-tight">
                    <h2 className="font-bold">{t('Freelance Hrvatska')}</h2>
                    <p className="opacity-90">{t('Vodeća freelance platforma u Hrvatskoj. Povezujemo tvrtke s provjerenim freelancerima za izradu web stranica, dizajn, marketing i razvoj. Honorarni posao: brzo, sigurno, profesionalno.')}</p>
                  </div>
                </div>
                <Link to={user ? '/profile' : '/auth'} className={rowCls} style={rowPad}>
                  {iconBox(PxUser)}
                  <span className="leading-tight"><b>{t('User')}:</b> {user ? (user.name || 'Freelancer') : t('Guest')}{!user && <span className="block opacity-85">{t('Login / Signup')} ›</span>}</span>
                </Link>
                <button type="button" onClick={() => openApp('trust')} className={rowCls} style={rowPad}>
                  {iconBox(PxShield)}
                  <span className="space-y-[calc(var(--u)*3)] leading-tight">
                    {[[t('Verified freelancers'), t('Every identity checked')], [t('Secure payment'), t('Money held until delivery')], [t('Fixed Pricing'), t('Price agreed upfront')], [t('In-House Team'), t('No Outsourcing')]].map(([a, b]) => (
                      <span key={a} className="block"><b>{a}</b><span className="block opacity-90">{b}</span></span>
                    ))}
                  </span>
                </button>
                <Link to="/referral" onClick={onRead} className={rowCls} style={rowPad}>
                  {iconBox(PxMail)}
                  <span className="leading-tight"><b>{t('Notifications')}:</b> {unread ? t('1 new') : t('None new')}<span className="block opacity-90">{t('Win 12 months of')} {t('free Enterprise.')}</span></span>
                </Link>
                <div className={rowCls} style={rowPad}>
                  {iconBox(PxListBox)}
                  <span className="leading-tight">
                    <b>{t('2 active tasks')}</b>
                    <Link to="/marketplace" className="block underline-offset-2 hover:underline">› {t('Explore Marketplace')}</Link>
                    <Link to="/services" className="block underline-offset-2 hover:underline">› {t('Cenner Services')}</Link>
                  </span>
                </div>
                <button type="button" onClick={() => openApp('team')} className={rowCls} style={rowPad}>
                  {iconBox(PxUsers)}
                  <span className="leading-tight"><b>{t('Team')}:</b> 100% · {t('In-House Delivery')}</span>
                </button>
                {hasPeople && (
                  <button type="button" onClick={() => openApp('people')} className={rowCls} style={rowPad}>
                    {iconBox(PxStar)}
                    <span className="leading-tight"><b>{t('Freelancers')}</b> ›</span>
                  </button>
                )}
                {/* the brand mark, where the old Today screen had its flag */}
                <div aria-hidden="true" className="flex items-end justify-end" style={{ height: u(78), padding: `0 ${u(14)} ${u(10)} 0` }}>
                  <span style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.25))' }}><CFlag size={46} /></span>
                </div>
              </div>
            )}

            {/* the Start menu */}
            {menu && !app && (
              <nav id="cn-pocket-start" data-wheel-box aria-label={t('Menu')} className="absolute left-0 z-40 overflow-y-auto border border-[#4f6b2a] bg-white shadow-[2px_3px_6px_rgba(0,0,0,.35)]" style={{ top: u(26), width: 'max(64%, min(100%, 13rem))', maxHeight: `calc(100% - ${u(26 + 26)})` }}>
                <div className="flex flex-wrap border-b border-[#b6cf8c] bg-[#eef6e0]" style={{ gap: u(3), padding: u(3) }}>
                  {[
                    { label: market[0].label, Icon: PxShoppingBag, go: () => navigate(market[0].path) },
                    { label: links[0].label, Icon: PxBriefcase, go: () => navigate(links[0].path) },
                    { label: links[1].label, Icon: PxLabel, go: () => navigate(links[1].path) },
                    { label: t('Chat'), Icon: PxMessage, go: () => openApp('chat') },
                    { label: t('Language'), Icon: PxGlobe, go: () => openApp('lang') },
                  ].map(({ label, Icon, go }) => (
                    <button key={label} type="button" aria-label={label} title={label} onClick={go} className="flex items-center justify-center border border-transparent text-[#3d7a0b] hover:border-[#3f6e0e] hover:bg-white" style={{ width: `max(36px, ${u(20)})`, height: `max(36px, ${u(20)})` }}><Icon style={mIco} /></button>
                  ))}
                </div>
                <ul>
                  <li><button type="button" onClick={home} className={menuRow} style={mRowSt}><PxCalendar style={mIco} />{t('Today')}</button></li>
                  {[market[0], links[0], links[1], links[2]].map(it => (
                    <li key={it.path}><Link to={it.path} className={menuRow} style={mRowSt}><it.icon style={mIco} />{it.label}</Link></li>
                  ))}
                  <li><button type="button" onClick={() => openApp('chat')} className={menuRow} style={mRowSt}><PxMessage style={mIco} />{t('Chat')}</button></li>
                  <li aria-hidden="true" className="border-t border-[#b6cf8c]" style={{ margin: `${u(2)} 0` }} />
                  <li>
                    <button type="button" aria-expanded={sub === 'programs'} onClick={() => setSub(v => (v === 'programs' ? null : 'programs'))} className={menuRow} style={mRowSt}><PxFolder style={mIco} />{t('Programs')}<PxChevronRight className={`ml-auto transition-transform ${sub === 'programs' ? 'rotate-90' : ''}`} style={mIco} /></button>
                    {sub === 'programs' && (
                      <ul className="bg-[#f3f9ea]">{links.slice(3).map(it => <li key={it.path}><Link to={it.path} className={menuRow} style={{ ...mRowSt, paddingLeft: u(18) }}><it.icon style={mIco} />{it.label}</Link></li>)}</ul>
                    )}
                  </li>
                  <li>
                    <button type="button" aria-expanded={sub === 'about'} onClick={() => setSub(v => (v === 'about' ? null : 'about'))} className={menuRow} style={mRowSt}><PxStar style={mIco} />{t('About')}<PxChevronRight className={`ml-auto transition-transform ${sub === 'about' ? 'rotate-90' : ''}`} style={mIco} /></button>
                    {sub === 'about' && (
                      <ul className="bg-[#f3f9ea]">{about.map(it => <li key={it.path}><Link to={it.path} className={menuRow} style={{ ...mRowSt, paddingLeft: u(18) }}><it.icon style={mIco} />{it.label}</Link></li>)}</ul>
                    )}
                  </li>
                  <li aria-hidden="true" className="border-t border-[#b6cf8c]" style={{ margin: `${u(2)} 0` }} />
                  <li><button type="button" onClick={() => openApp('lang')} className={menuRow} style={mRowSt}><PxGlobe style={mIco} />{t('Settings')}</button></li>
                  <li><Link to={user ? '/profile' : '/auth'} className={menuRow} style={mRowSt}><PxUser style={mIco} />{user ? t('Profile') : t('Sign in')}</Link></li>
                </ul>
              </nav>
            )}

            {/* the LCD before the device is on, and its backlight coming up (no CRT flash here) */}
            {power !== 'on' && (
              <div aria-hidden="true" className={`absolute inset-0 z-[60] bg-[#0c1409] ${power === 'warming' ? 'cn-lcd-on' : ''}`} />
            )}

            {/* soft keys */}
            <div className="relative z-30 flex shrink-0 items-center justify-between border-t border-[#2a430a] font-bold text-white" style={{ height: u(24), fontSize: u(12.5), padding: `0 ${u(7)}`, background: 'linear-gradient(180deg,#5f9a18 0%,#3a6a0c 50%,#284c07 100%)', textShadow: '0 1px 0 rgba(0,0,0,.3)' }}>
              {app ? <button type="button" onClick={home} className="-mx-2 px-2 py-2">{t('Today')}</button> : <Link to={user ? '/profile?create=1' : '/marketplace'} className="-mx-2 px-2 py-2">{t('New')}</Link>}
              <PxKeyboard aria-hidden="true" className="text-white" style={{ width: u(16), height: u(16) }} />
              <button type="button" onClick={() => openApp('chat')} className="-mx-2 px-2 py-2">{t('Chat')}</button>
            </div>
          </div>
      </div>

      {/* the device: the frame, then its pieces at their natural shape */}
      <div aria-hidden="true" className="cn-pda-frame pointer-events-none absolute inset-0 z-10" />
      <img src="/home/pda-mark.webp" alt="" aria-hidden="true" draggable={false} className="pointer-events-none absolute z-20 select-none" style={{ left: pz(27), top: pz(30), width: pz(136) }} />
      <div className="absolute z-20" style={{ left: `calc(50% - ${pz(33)})`, top: pz(14), width: pz(190) }}>
        <img src="/home/pda-power.webp" alt="" aria-hidden="true" draggable={false} className="pointer-events-none block w-full select-none" />
        <button type="button" aria-label={t('Turn off')} onClick={goToShutdown} className={keyCls} style={{ left: '17.4%', top: '48.4%', width: '27%' }} />
      </div>
      {/* The keys' plate (pda-keys-wide.webp: the 992 x 390 plate with 640 px of its own silver
          added at each side, fading out), so on wide screens it has no edges against the frame.
          Clipped to the frame's inner width; the keys sit exactly on the box below. */}
      <div aria-hidden="true" className="pointer-events-none absolute z-20 overflow-hidden" style={{ left: 'var(--ps)', right: 'var(--ps)', bottom: pz(48), height: `calc(min(${pz(496)}, calc(100vw - ${pz(82)})) * 390 / 992)`, ...plateFade }}>
        <img src="/home/pda-keys-wide.webp" alt="" draggable={false} className="absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2 select-none" />
      </div>
      <div className="absolute left-1/2 z-20 -translate-x-1/2" style={{ bottom: pz(48), width: `min(${pz(496)}, calc(100vw - ${pz(82)}))`, aspectRatio: '992 / 390' }}>
        <button type="button" aria-label={t('Explore Marketplace')} onClick={() => navigate('/marketplace')} className={keyCls} style={key('jobs')} />
        <button type="button" aria-label={user ? t('Profile') : t('Login / Signup')} onClick={() => navigate(user ? '/profile' : '/auth')} className={keyCls} style={key('account')} />
        <button type="button" aria-label="Start" aria-expanded={menu} onClick={() => { setApp(null); setMenu(v => !v); }} className={keyCls} style={key('pad')} />
        <button type="button" aria-label={`${t('Scroll')} ↑`} onClick={() => scrollBy(-80)} className={keyCls} style={key('up')} />
        <button type="button" aria-label={`${t('Scroll')} ↓`} onClick={() => scrollBy(80)} className={keyCls} style={key('down')} />
        <button type="button" aria-label={t('Chat with us')} onClick={() => openApp('chat')} className={keyCls} style={key('chat')} />
        <button type="button" aria-label={t('Today')} onClick={home} className={keyCls} style={key('home')} />
      </div>
    </div>
  );
};

/* A notification balloon in the Windows XP manner: cream paper, rounded, a tail pointing at the
 * bell it came from, a little close box that turns red. Here it carries the referral contest. */
const NotifyBalloon: React.FC<{ drop: 'up' | 'down'; onClose: () => void; onFollow: () => void; width?: string; right?: string }> = ({ drop, onClose, onFollow, width, right }) => {
  const t = useT();
  const up = drop === 'up';
  const sm = !!width; // on the pocket device's small screen
  return (
    <div role="status" style={width ? { width, ...(right ? { right } : {}) } : undefined} className={`cn-balloon absolute -right-2.5 z-[90] w-[min(21rem,calc(100vw-4.5rem))] rounded-[10px] border border-ink bg-[#ffffe1] px-3.5 pb-3 pt-2.5 text-left text-ink shadow-[4px_5px_12px_rgba(0,0,0,.35)] ${up ? 'bottom-[calc(100%+15px)] origin-bottom-right' : 'top-[calc(100%+15px)] origin-top-right'}`}>
      {/* the tail: an ink triangle with a cream one over it, so it reads as one outlined shape */}
      <span aria-hidden="true" className={`absolute right-[15px] h-0 w-0 border-l-[16px] border-l-transparent ${up ? '-bottom-[14px] border-t-[14px] border-t-ink' : '-top-[14px] border-b-[14px] border-b-ink'}`} />
      <span aria-hidden="true" className={`absolute right-[16px] h-0 w-0 border-l-[14px] border-l-transparent ${up ? '-bottom-[12px] border-t-[13px] border-t-[#ffffe1]' : '-top-[12px] border-b-[13px] border-b-[#ffffe1]'}`} />
      <button type="button" aria-label={t('Close')} onClick={onClose} className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-[3px] border border-ink/40 bg-white/70 transition-colors hover:border-[#9b1c1c] hover:bg-[#e04343] hover:text-white focus-visible:bg-[#e04343] focus-visible:text-white focus-visible:outline-none">
        <PxClose size={12} />
      </button>
      <p className={`flex items-center gap-2 pr-7 font-display font-black leading-tight ${sm ? 'text-[12.5px]' : 'text-[15px]'}`}>
        <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full border border-ink bg-sky text-white ${sm ? 'h-5 w-5' : 'h-6 w-6'}`}><PxGift size={12} /></span>
        {t('Win 12 months of')} {t('free Enterprise.')}
      </p>
      <p className={`mt-1.5 font-text leading-snug ${sm ? 'pl-7 text-[12px]' : 'pl-8 text-[14px]'}`}>{t('Invite friends to Cenner with your link.')}</p>
      <Link to="/referral" onClick={onFollow} className={`mt-1.5 inline-flex items-center gap-1 font-text font-medium text-sky underline underline-offset-2 hover:text-ink ${sm ? 'ml-7 text-[12px]' : 'ml-8 text-[14px]'}`}>
        {t('Get my referral link')} <ArrowRight size={14} />
      </Link>
    </div>
  );
};

/* The Start menu behind the green CENNER button: the whole site menu, laid out like the
 * Windows XP Start menu. Who you are along the top (or the sign-in button), the main pages
 * with icons and a line each on the left, everything else on the right, language and
 * sign out / turn off along the bottom. Links come from components/siteNav, shared with the
 * page nav. */
const StartMenu: React.FC<{ drop: 'up' | 'down'; onClose: () => void; onChat: () => void; onDemo?: () => void }> = ({ drop, onClose, onChat, onDemo }) => {
  const t = useT();
  const { lang, setLang } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { market, links, about } = useSiteNav();
  const first = React.useRef<HTMLAnchorElement>(null);
  const box = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    // phones: the desktop is a tall stack, so bring the whole menu into view under the site nav
    const el = box.current, anchor = el?.parentElement;
    if (el && anchor && !window.matchMedia(DESK_QUERY).matches) {
      const a = anchor.getBoundingClientRect();
      const top = drop === 'up' ? a.top - 8 - el.offsetHeight : a.bottom + 8; // final place, ignoring the entry animation
      const bottom = top + el.offsetHeight;
      if (top < NAV_H + 8) window.scrollBy(0, top - NAV_H - 8);
      else if (bottom > window.innerHeight - 8) window.scrollBy(0, Math.min(bottom - window.innerHeight + 8, top - NAV_H - 8));
    }
    first.current?.focus({ preventScroll: true });
  }, [drop]);
  // left: Marketplace, Usluge, Cijene, Početak rada, Job Matching; right: the rest, in nav order
  const main = [market[0], ...links.slice(0, 3)];
  const tiles = ['bg-brand-green', 'bg-sky text-white', 'bg-brand-pink', 'bg-white', 'bg-paper2'];
  const more = links.slice(3);
  const account = [
    { label: t('Profile'), path: '/profile', icon: PxUser },
    { label: t('Messages'), path: '/messages', icon: PxMessage },
    { label: t('Contracts'), path: '/contracts', icon: PxFileText },
  ];
  const signOut = () => { onClose(); disconnectSocket(); logout(); navigate('/'); };
  const rowCls = 'flex items-center gap-2.5 px-2.5 py-1.5 font-display text-[14px] font-bold transition-colors hover:bg-ink hover:text-white focus-visible:bg-ink focus-visible:text-white focus-visible:outline-none';
  const heading = 'px-2.5 pb-1 pt-2.5 font-term text-[11px] font-bold uppercase tracking-[0.14em] text-slate';
  const footBtn = 'flex items-center gap-1.5 border-2 border-white/70 px-2 py-1 font-display text-[13px] font-bold transition-colors hover:bg-white hover:text-ink focus-visible:bg-white focus-visible:text-ink focus-visible:outline-none';
  return (
    <div ref={box} id="cn-start" className={`cn-toast absolute left-0 z-[90] flex max-h-[min(38rem,calc(100svh-10rem))] w-[min(36rem,calc(100vw-4rem))] flex-col ${drop === 'up' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'} border-2 border-ink bg-white font-text text-ink shadow-[10px_10px_0_#0b0c0e]`}>
      <div className="flex items-center gap-3 border-b-2 border-ink bg-sky px-3 py-2.5 text-white">
        {user ? (
          <Avatar src={user.avatar} name={user.name} size={40} className="h-10 w-10 shrink-0 border-2 border-white object-cover" />
        ) : (
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-white bg-gradient-to-br from-brand-green to-brand-pink font-display text-[18px] font-black text-ink">C</span>
        )}
        <p className={`min-w-0 flex-1 truncate font-display text-[17px] font-black ${user ? '' : 'max-sm:hidden'}`}>{user ? (user.name || 'Freelancer') : t('Welcome to Cenner')}</p>
        {!user && (
          <Link to="/auth" onClick={onClose} className="ml-auto shrink-0 border-2 border-ink bg-brand-green px-3 py-1.5 font-display text-[14px] font-bold text-ink transition-colors hover:bg-white">
            {t('Login / Signup')}
          </Link>
        )}
      </div>

      <nav data-wheel-box aria-label={t('Menu')} className="grid min-h-0 flex-1 overflow-y-auto overscroll-contain sm:grid-cols-[1.2fr_1fr]">
        <ul className="p-1.5">
          {main.map((it, i) => (
            <li key={it.path}>
              <Link ref={i === 0 ? first : undefined} to={it.path} onClick={onClose} className="group flex items-center gap-3 px-2.5 py-2 transition-colors hover:bg-ink hover:text-white focus-visible:bg-ink focus-visible:text-white focus-visible:outline-none">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center border-2 border-ink text-ink ${tiles[i]}`}><it.icon size={18} /></span>
                <span className="min-w-0">
                  <span className="block font-display text-[15px] font-bold leading-tight">{it.label}</span>
                  {it.desc && <span className="block truncate text-[13px] text-slate group-hover:text-white/75 group-focus-visible:text-white/75">{it.desc}</span>}
                </span>
              </Link>
            </li>
          ))}
          <li aria-hidden="true" className="mx-2.5 my-1.5 border-t-2 border-dashed border-ink/25" />
          <li>
            <button type="button" onClick={() => { onClose(); onChat(); }} className="group flex w-full items-center gap-3 px-2.5 py-2 text-left transition-colors hover:bg-ink hover:text-white focus-visible:bg-ink focus-visible:text-white focus-visible:outline-none">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-ink bg-brand-green text-ink"><PxMessage size={18} /></span>
              <span className="font-display text-[15px] font-bold">{t('Chat with us')}</span>
            </button>
          </li>
          {onDemo && (
            <li>
              <button type="button" onClick={() => { onClose(); onDemo(); }} className="group flex w-full items-center gap-3 px-2.5 py-2 text-left transition-colors hover:bg-ink hover:text-white focus-visible:bg-ink focus-visible:text-white focus-visible:outline-none">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-ink bg-white text-ink"><PxInfoBox size={18} /></span>
                <span className="font-display text-[15px] font-bold">{t('Show me how')}</span>
              </button>
            </li>
          )}
        </ul>
        <div className="border-t-2 border-ink bg-[#dde5f4] p-1.5 sm:border-l-2 sm:border-t-0">
          <p className={heading}>{t('More')}</p>
          <ul>{more.map(it => <li key={it.path}><Link to={it.path} onClick={onClose} className={rowCls}><it.icon size={16} className="shrink-0" />{it.label}</Link></li>)}</ul>
          <p className={heading}>{t('About')}</p>
          <ul>{about.map(it => <li key={it.path}><Link to={it.path} onClick={onClose} className={rowCls}><it.icon size={16} className="shrink-0" />{it.label}</Link></li>)}</ul>
          {user && (
            <>
              <p className={heading}>{t('Your account')}</p>
              <ul>{account.map(it => <li key={it.path}><Link to={it.path} onClick={onClose} className={rowCls}><it.icon size={16} className="shrink-0" />{it.label}</Link></li>)}</ul>
            </>
          )}
        </div>
      </nav>

      <div className="flex flex-wrap items-center gap-2 border-t-2 border-ink bg-sky px-2.5 py-2 text-white">
        <div role="group" aria-label={t('Language')} className="flex flex-wrap items-center gap-1">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              type="button"
              aria-pressed={lang === l.code}
              title={l.name}
              onClick={() => setLang(l.code)}
              className={`border-2 px-1.5 py-0.5 font-term text-[12px] font-bold transition-colors ${lang === l.code ? 'border-white bg-white text-ink' : 'border-white/40 hover:border-white'}`}
            >
              <span aria-hidden="true">{l.flag}</span> {l.code}
            </button>
          ))}
          <span className="px-1 font-term text-[12px] text-white/75">€ EUR</span>
        </div>
        <span className="ml-auto flex gap-1.5">
          {user && <button type="button" onClick={signOut} className={footBtn}><PxLogout size={14} /> {t('Sign out')}</button>}
          <button type="button" onClick={() => { onClose(); goToShutdown(); }} className={footBtn}><PxPower size={14} /> {t('Turn off')}</button>
        </span>
      </div>
    </div>
  );
};

const Desktop: React.FC<{ people: any[] }> = ({ people }) => {
  const t = useT();
  const wide = useMedia(DESK_QUERY);  // the full desktop (else the pocket device)
  const crt = useMedia(CRT_QUERY);    // ...in the CRT; below it, in the laptop lid
  const laptop = wide && !crt;
  const fine = useMedia('(hover: hover) and (pointer: fine)'); // a mouse: icons select on one click
  const roomy = useMedia('(min-width: 1400px)'); // the scroll hint clears the balloon
  const areaRef = React.useRef<HTMLDivElement>(null);
  const [order, setOrder] = React.useState<string[]>([]);
  const [pos, setPos] = React.useState<Record<string, { x: number; y: number }>>({});
  const [hidden, setHidden] = React.useState<Record<string, boolean>>({});
  // The referral contest arrives as a notification: a bell in the tray (badged while unread)
  // and an XP-style balloon that pops from it a moment after the screen comes on.
  const [balloon, setBalloon] = React.useState(false);
  const [unread, setUnread] = React.useState(true);
  const [start, setStart] = React.useState<false | 'bar' | 'top'>(false); // the Start menu: from the taskbar, or (phones) the top bar
  const drag = React.useRef<{ id: string; dx: number; dy: number; pid: number } | null>(null);
  const sectionRef = React.useRef<HTMLElement>(null);
  const saver = useScreensaver(sectionRef);
  const [aligned, setAligned] = React.useState(false);
  const [armed, setArmed] = React.useState(false);

  // Locked in: while the desktop fills the window (wide screens, nav hidden), downward wheel
  // scrolling is held; two separate flicks within 1.8s move on to the next section. Scrolling
  // up, touch and the keyboard are never held.
  React.useEffect(() => {
    const sec = sectionRef.current;
    if (!sec || !wide) { setAligned(false); return; }
    const isAligned = () => Math.abs(sec.getBoundingClientRect().top) < 4;
    let last = 0, flicks: number[] = [], arrivedAt = 0, was = false, holdUntil = 0, catchAt = 0, catchLast = 0;
    const onScroll = () => {
      const a = isAligned();
      // the site nav makes way as the monitor comes in: pushed up pixel for pixel (see pushNav)
      pushNav(sec);
      if (a && !was) arrivedAt = performance.now();
      was = a; setAligned(a);
      if (!a) { flicks = []; setArmed(false); }
    };
    let exitTimer = 0;
    const onWheel = (e: WheelEvent) => {
      // a list on the screen that can still scroll this way (the Start menu) takes the wheel
      const box = (e.target as Element | null)?.closest?.('[data-wheel-box]') as HTMLElement | null;
      if (box && (e.deltaY > 0 ? box.scrollTop + box.clientHeight < box.scrollHeight - 1 : box.scrollTop > 0)) { last = performance.now(); return; }
      if (e.deltaY < 0) { // turning back up cancels the exit's re-snap (and puts the snap point back now)
        window.clearTimeout(exitTimer);
        if (resnapTimer) { window.clearTimeout(resnapTimer); resnapTimer = 0; if (snapWanted() && !deskGliding) document.documentElement.classList.add('cn-snap'); }
      }
      // Scrolling back UP from the sections below: caught on the monitor. Instead of flying on
      // into the film, the page settles with the desktop filling the window and soaks up the rest
      // of that flick; the next scroll up (after a short pause) carries on. No double-scroll lock.
      if (e.deltaY < 0) {
        const now = performance.now();
        if (catchAt) {
          if (now - catchLast < CATCH_QUIET_MS && now - catchAt < CATCH_MAX_MS) { e.preventDefault(); catchLast = now; return; }
          catchAt = 0;
        }
        const top = sec.getBoundingClientRect().top;
        const px = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
        if (top < -2 && top - px > 0) {   // this scroll would carry the desktop down past the top
          e.preventDefault();
          catchAt = catchLast = now;
          glideTo(top + window.scrollY, () => {
            // arrived from below without having seen it power on: just on, no flash
            if (screenRef.current === 'dark' && !powering.current) setScreen('on');
          });
        }
        return;
      }
      if (e.deltaY > 0 && performance.now() < holdUntil) { e.preventDefault(); return; }
      if (e.deltaY <= 0 || !isAligned()) return;
      e.preventDefault();
      const now = performance.now();
      // The tail of the scroll that brought the visitor here does not count.
      if (now - arrivedAt < LOCK_SETTLE_MS) { last = now; return; }
      if (now - last > FLICK_GAP_MS) {              // a new flick, after a real pause
        flicks = flicks.filter(f => now - f < 1800);
        flicks.push(now);
        if (flicks.length >= 2) {
          flicks = []; setArmed(false);
          // Glide to the next section and hold there for a moment, so a hard flick's momentum
          // cannot carry the visitor past it.
          // (the next section lands at the top; the nav comes back as the visitor scrolls on, see pushNav)
          const target = sec.getBoundingClientRect().bottom + window.scrollY;
          holdUntil = now + EXIT_HOLD_MS;
          // (on the laptop the device's snap point is off while this scroll leaves it)
          const root = document.documentElement;
          if (root.classList.contains('cn-snap')) { root.classList.remove('cn-snap'); window.clearTimeout(resnapTimer); resnapTimer = window.setTimeout(() => { if (snapWanted()) root.classList.add('cn-snap'); }, EXIT_HOLD_MS); }
          window.scrollTo({ top: target, behavior: 'smooth' });
          exitTimer = window.setTimeout(() => { if (Math.abs(window.scrollY - target) > 4) window.scrollTo({ top: target }); }, 700);
        } else { setArmed(true); setBalloon(false); } // the held flick also clears the balloon away
      }
      last = now;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => { window.clearTimeout(exitTimer); window.removeEventListener('scroll', onScroll); window.removeEventListener('wheel', onWheel); releaseNav(); };
  }, [wide]);

  // Phones and the laptop are reached by a free scroll (only the CRT is glided onto): a snap point
  // at the device's top catches the scroll there from either side, so it lands full-frame and the
  // nav steps aside; the next scroll carries on.
  React.useEffect(() => {
    if (crt) return;
    const root = document.documentElement;
    if (!deskGliding) root.classList.add('cn-snap'); // a running glide puts it back when it ends
    return () => { root.classList.remove('cn-snap'); window.clearTimeout(resnapTimer); resnapTimer = 0; };
  }, [crt]);

  // Every layout (phone, laptop, CRT): a scroll that stops with the device part-way in view (moving
  // towards it) waits a beat, then the device drops into place, with a small overshoot and settle.
  React.useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    let lastY = window.scrollY, dir = 0, idle = 0, touching = false;
    const fall = (x: number) => { const c1 = 1.25, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }; // easeOutBack
    const settle = () => {
      if (touching || deskGliding) return;
      const top = sec.getBoundingClientRect().top, H = window.innerHeight;
      if (Math.abs(top) < 3) return;
      const toward = (top > 0 && dir > 0 && top < H * 0.65) || (top < 0 && dir < 0 && top > -H * 0.45);
      if (!toward) return;
      const target = top + window.scrollY;
      glideTo(target, () => { if (top > 0) window.dispatchEvent(new Event('cenner-desktop:power')); },
        { ms: clamp(320 + Math.abs(top) * 0.6, 360, 620), ease: fall });
    };
    const onScroll = () => {
      const y = window.scrollY;
      if (y !== lastY) dir = y > lastY ? 1 : -1;
      lastY = y;
      if (deskGliding) return;
      window.clearTimeout(idle);
      idle = window.setTimeout(settle, 200);
    };
    const onTouchStart = () => { touching = true; window.clearTimeout(idle); };
    const onTouchEnd = () => { touching = false; window.clearTimeout(idle); idle = window.setTimeout(settle, 260); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      window.clearTimeout(idle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [crt]);

  // a menu left open on a wide screen does not come back after a rotate below lg
  React.useEffect(() => { if (!wide) { setStart(false); setLangOpen(false); setSelIcon(null); } }, [wide]);

  // Phones and tablets: while the pocket device fills the screen, the site nav steps aside (the
  // device's Start menu carries the whole nav), as it does for the CRT on wide screens.
  React.useEffect(() => {
    const sec = sectionRef.current;
    if (!sec || wide) return;
    const onScroll = () => pushNav(sec);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); releaseNav(); };
  }, [wide]);

  // The chat opens as a window on the desktop. It stays mounted once opened, so closing and
  // reopening it keeps the conversation.
  const [chatOpen, setChatOpen] = React.useState(false);
  const openChat = () => {
    setChatOpen(true);
    setHidden(h => ({ ...h, chat: false }));
    focus('chat');
  };

  // Boot-in: arriving from the hero, the desktop assembles itself (taskbar, then the icons,
  // then the windows one by one, the notification last) instead of just appearing.
  const [boot, setBoot] = React.useState<'idle' | 'off' | 'on'>('idle');
  React.useEffect(() => {
    let raf = 0, done = 0;
    const go = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      setBoot('off');
      raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => setBoot('on')); });
      window.clearTimeout(done);
      done = window.setTimeout(() => setBoot('idle'), 1800);
    };
    window.addEventListener('cenner-desktop:boot', go);
    return () => { window.removeEventListener('cenner-desktop:boot', go); cancelAnimationFrame(raf); window.clearTimeout(done); };
  }, []);
  // The screen is dark until the monitor powers on. Arriving from above (the glide from the hero,
  // or scrolling down into it) the glass stays black for a beat, then the picture opens from a dot
  // to a line to a white field, which fades onto the desktop as it assembles itself. Coming back
  // up from the sections below it is simply on; going back up to the film switches it off again.
  const [screen, setScreen] = React.useState<'dark' | 'warming' | 'on'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'on' : 'dark');
  const screenRef = React.useRef(screen);
  screenRef.current = screen;
  const powering = React.useRef(false);
  const powerTimers = React.useRef<number[]>([]);
  const [hint, setHint] = React.useState(false); // the Start button pulses once, after power-on
  const hintOff = React.useRef(0);
  const pulseStart = (ms = 4300) => { setHint(true); window.clearTimeout(hintOff.current); hintOff.current = window.setTimeout(() => setHint(false), ms); };

  // "How to use it", once per visitor: when the picture is on and the visitor has stopped, a ghost
  // pixel cursor really drags the welcome window out and back, then points at the CENNER button
  // ("all pages"), which pulses. About 4s; any click, tap, key, wheel, scroll or real mouse move
  // stops it, and nothing is left changed. Phones get a beacon on the pocket device's Start.
  const [tip, setTip] = React.useState<'wait' | 'drag' | 'start' | 'bye' | 'done'>(() =>
    (deskTipDone || seen(TIP_KEY)) && !tipForced() ? 'done' : 'wait');
  const tipRef = React.useRef(tip);
  tipRef.current = tip;
  const tipRunning = tip === 'drag' || tip === 'start' || tip === 'bye';
  const [tipRun, setTipRun] = React.useState(0);
  const [ghost, setGhost] = React.useState<{ x: number; y: number; glide?: boolean; out?: boolean; ring?: number } | null>(null);
  const [inView, setInView] = React.useState(false);
  const tipRan = React.useRef(false);   // a cue played this page load (the balloon follows sooner)
  const touched = React.useRef(false);  // pressed inside the desktop before the cue: they found it
  const tabbed = React.useRef(false);   // keyboard visitors are not cued
  const stopEvt = React.useRef<Event | null>(null);
  const posRef = React.useRef(pos); posRef.current = pos;
  const hiddenRef = React.useRef(hidden); hiddenRef.current = hidden;
  const orderRef = React.useRef(order); orderRef.current = order;
  const startRef = React.useRef(start); startRef.current = start;
  React.useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    // Turning back up while it powers on (measured from the deepest point reached) cancels it:
    // the glass stays dark and nothing flashes on the way up.
    let peakY = 0;
    const onReverse = () => {
      peakY = Math.max(peakY, window.scrollY);
      if (window.scrollY < peakY - 8) powerOff();
    };
    const clear = () => {
      powerTimers.current.forEach(id => window.clearTimeout(id));
      powerTimers.current = [];
      powering.current = false;
      window.removeEventListener('scroll', onReverse);
    };
    const powerOn = () => {
      if (powering.current || screenRef.current !== 'dark') return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setScreen('on'); return; }
      powering.current = true;
      peakY = window.scrollY;
      window.addEventListener('scroll', onReverse, { passive: true });
      powerTimers.current = [
        window.setTimeout(() => setScreen('warming'), POWER_DELAY_MS),
        // the windows assemble as the white field fades
        window.setTimeout(() => window.dispatchEvent(new Event('cenner-desktop:boot')), POWER_DELAY_MS + POWER_MS * 0.4),
        window.setTimeout(() => { window.removeEventListener('scroll', onReverse); setScreen('on'); powering.current = false; if (tipRef.current === 'done') pulseStart(); }, POWER_DELAY_MS + POWER_MS),
      ];
    };
    function powerOff() {
      // reduced motion: the screen is simply always on
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      clear(); setHint(false); window.clearTimeout(hintOff.current); if (screenRef.current !== 'dark') setScreen('dark');
    }
    window.addEventListener('cenner-desktop:power', powerOn);
    if (sec.getBoundingClientRect().top <= 0) setScreen('on'); // landed below it (back navigation)
    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(entries => { const e = entries[entries.length - 1];
        const top = e.boundingClientRect.top;
        const vis = e.intersectionRect.height >= Math.min(window.innerHeight, e.boundingClientRect.height) * 0.6;
        if (vis && top > 0 && !deskGliding) powerOn();                       // scrolling DOWN into it
        else if (vis && top <= 0 && !deskGliding && screenRef.current === 'dark' && !powering.current) setScreen('on'); // arrived from below: just on
        if (!e.isIntersecting && top > 0) powerOff();                        // back up in the film
      }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) });
      io.observe(sec);
    }
    return () => { window.removeEventListener('cenner-desktop:power', powerOn); io?.disconnect(); clear(); };
  }, []);
  React.useEffect(() => {
    if (screen !== 'on' || !unread || tip !== 'done') return;
    const id = window.setTimeout(() => setBalloon(true), tipRan.current ? 600 : 1400);
    return () => window.clearTimeout(id);
  }, [screen, unread, tip]);

  // the cue's gate: the section mostly in view, no Tab seen, then 700ms without input
  React.useEffect(() => {
    const sec = sectionRef.current;
    if (!sec || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(entries => {
      const e = entries[entries.length - 1];
      setInView(e.intersectionRect.height >= Math.min(window.innerHeight, e.boundingClientRect.height) * 0.85);
    }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) });
    io.observe(sec);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Tab') tabbed.current = true; };
    window.addEventListener('keydown', onKey);
    return () => { io.disconnect(); window.removeEventListener('keydown', onKey); };
  }, []);

  const bootIn = (delay: number, from = 'translate3d(0,10px,0) scale(.96)'): React.CSSProperties =>
    boot === 'off' ? { opacity: 0, transform: from, transition: 'none' }
      : boot === 'on' ? { transition: `opacity .35s ease ${delay}ms, transform .5s cubic-bezier(.22,1,.36,1) ${delay}ms` }
      : {};

  // The Start menu and the language pop-up close on Escape or a click anywhere else.
  const [langOpen, setLangOpen] = React.useState(false);
  const startBtn = React.useRef<HTMLButtonElement>(null);
  const langBtn = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (!start && !langOpen) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent) {
        if (e.key !== 'Escape') return;
        if (start === 'bar') startBtn.current?.focus();
        else if (langOpen) langBtn.current?.focus();
      } else if ((e.target as HTMLElement).closest('[data-start]')) return;
      setStart(false); setLangOpen(false);
    };
    window.addEventListener('keydown', close);
    window.addEventListener('pointerdown', close);
    return () => { window.removeEventListener('keydown', close); window.removeEventListener('pointerdown', close); };
  }, [start, langOpen]);
  const { lang, setLang } = useLanguage();
  const curLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[1];

  React.useEffect(() => {
    if (tip !== 'wait' || screen !== 'on' || !inView || start || langOpen) return;
    const evs = ['wheel', 'keydown', 'pointerdown', 'touchstart', 'scroll'] as const;
    let idle = 0, over = false;
    let mx = -1, my = -1, moved = 0;
    const onMove = (e: PointerEvent) => { // a moving mouse is not idle (the same 12px the run stops on)
      if (e.pointerType !== 'mouse') return;
      if (mx >= 0) moved += Math.abs(e.clientX - mx) + Math.abs(e.clientY - my);
      mx = e.clientX; my = e.clientY;
      if (moved > 12) { moved = 0; arm(); }
    };
    const end = () => { over = true; window.clearTimeout(idle); window.clearTimeout(deadline); evs.forEach(ev => window.removeEventListener(ev, arm)); window.removeEventListener('pointermove', onMove); };
    const skip = (store: boolean) => { end(); if (store) remember(TIP_KEY); deskTipDone = true; setTip('done'); if (wide && !startRef.current) pulseStart(); };
    const fire = () => {
      if (over) return;
      if (deskGliding) { arm(); return; }
      if (touched.current) { skip(true); return; }   // they found it themselves
      end(); tipRan.current = true; setTipRun(n => n + 1); // stored as seen once it has really shown (the run)
    };
    function arm() { if (over) return; window.clearTimeout(idle); idle = window.setTimeout(fire, 700); }
    const deadline = window.setTimeout(() => skip(false), 6000); // never still: try again next visit
    if (tabbed.current) { skip(false); return; }
    evs.forEach(ev => window.addEventListener(ev, arm, { passive: true }));
    window.addEventListener('pointermove', onMove, { passive: true });
    arm();
    return end;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tip, screen, inView, start, langOpen, wide]);

  const wins: Win[] = [
    {
      id: 'welcome', title: 'dobrodosli.txt', bar: 'bg-brand-green text-ink', x: 0.17, y: 0.07, w: 'w-[30rem]',
      body: (
        <div className="p-5">
          <h2 className="font-display text-[2rem] font-black uppercase leading-[0.95] tracking-[-0.03em]">{t('Freelance Hrvatska')}</h2>
          <p className="mt-3 font-text text-[1.0625rem] leading-[1.5]">{t('Vodeća freelance platforma u Hrvatskoj. Povezujemo tvrtke s provjerenim freelancerima za izradu web stranica, dizajn, marketing i razvoj. Honorarni posao: brzo, sigurno, profesionalno.')}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/marketplace" className="cn-press inline-flex items-center gap-2 border-2 border-ink bg-sky px-5 py-3 font-display text-[15px] font-bold text-white">{t('Explore Marketplace')} <ArrowRight size={17} /></Link>
            <Link to="/services" className="cn-press inline-flex items-center gap-2 border-2 border-ink bg-white px-5 py-3 font-display text-[15px] font-bold">{t('Cenner Services')}</Link>
          </div>
        </div>
      ),
    },
    {
      id: 'trust', title: 'sigurnost.app', bar: 'bg-ink text-white', x: 0.56, y: 0.05, w: 'w-[25rem]',
      body: (
        <ul className="divide-y-2 divide-ink">
          <li className="flex items-center gap-3 p-4"><ShieldCheck size={22} className="text-sky" /><div><p className="font-display font-bold">{t('Verified freelancers')}</p><p className="text-[15px] text-slate">{t('Every identity checked')}</p></div></li>
          <li className="p-4">
            <div className="flex items-center gap-3"><Lock size={22} className="text-sky" /><div className="flex-1"><p className="font-display font-bold">{t('Secure payment')}</p><p className="text-[15px] text-slate">{t('Money held until delivery')}</p></div><span className="font-term text-[13px]">€1.200,00</span></div>
            <div className="mt-3 h-3 border-2 border-ink bg-paper"><div className="cn-escrow h-full bg-brand-green" /></div>
          </li>
          <li className="flex items-center gap-3 p-4"><Check size={22} className="text-sky" /><div><p className="font-display font-bold">{t('Fixed Pricing')}</p><p className="text-[15px] text-slate">{t('Price agreed upfront')}</p></div></li>
          <li className="flex items-center gap-3 p-4"><Briefcase size={22} className="text-sky" /><div><p className="font-display font-bold">{t('In-House Team')}</p><p className="text-[15px] text-slate">{t('No Outsourcing')}</p></div></li>
        </ul>
      ),
    },
    {
      id: 'team', title: 'interni_tim.jpg', bar: 'bg-sky text-white', x: 0.33, y: 0.44, w: 'w-[34rem]',
      body: (
        <div className="grid sm:grid-cols-[1fr_1.1fr]">
          <img src="/home/meadow-desk-760.jpg" alt="" width={760} height={760} loading="lazy" className="h-full max-h-72 w-full object-cover sm:max-h-none" />
          <div className="p-5">
            <h2 className="font-display text-[1.5rem] font-black leading-[1] tracking-[-0.03em]">{t('One')} {t('in-house')} {t('team. Start to finish.')}</h2>
            <div className={`mt-4 flex flex-wrap gap-x-6 gap-y-3 ${wide ? 'flex-nowrap' : ''}`}>
              <div><p className="font-display text-[2.75rem] font-black leading-none">{t('100%')}</p><p className="text-[14px]">{t('In-House Delivery')}</p></div>
              <div><p className="font-display text-[2.75rem] font-black leading-none text-sky">{t('24/7')}</p><p className="text-[14px]">{t('Direct Support')}</p></div>
            </div>
          </div>
        </div>
      ),
    },
    ...(people.length ? [{
      id: 'people', title: 'freelanceri/', bar: 'bg-paper2 text-ink', x: 0.68, y: 0.5, w: 'w-[24rem]',
      body: (
        <ul className="grid grid-cols-3 gap-3 p-4">
          {people.slice(0, 6).map(p => (
            <li key={p.id}>
              <Link to={`/freelancer/${p.id}`} className="block text-center">
                <Avatar src={p.avatar} name={p.name} size={72} className="mx-auto h-16 w-16 rounded-full object-cover" />
                <p className="mt-1 truncate text-[13px] font-bold">{p.name}</p>
                {p.avgRating > 0 && <p className="flex items-center justify-center gap-1 text-[13px]"><Star size={11} fill="currentColor" className="text-sky" />{p.avgRating.toFixed(1)}</p>}
              </Link>
            </li>
          ))}
        </ul>
      ),
    }] as Win[] : []),
    ...(chatOpen ? [{
      id: 'chat', title: 'razgovor.exe', bar: 'bg-brand-pink text-ink', x: 0.6, y: 0.04, w: 'w-[25rem]',
      body: (
        <div className={wide ? 'h-[min(30rem,calc(100svh-18rem))]' : 'h-[26rem]'}>
          <ChatInterface
            variant="window"
            isOpen
            onClose={() => setHidden(h => ({ ...h, chat: true }))}
            freelancerName="Cenner Support"
            freelancerAvatar="https://picsum.photos/seed/concierge/200"
          />
        </div>
      ),
    }] as Win[] : []),
  ];

  // Until a window is dragged it sits at its fractions of the desktop, kept inside the screen's
  // width by CSS (so it needs no measuring and follows any resize); a drag pins it in px. Moving
  // between the CRT and the smaller laptop screen puts every window back at its fractions.
  const winLeft = (w: Win) => {
    const rem = Number(/w-\[(\d+(?:\.\d+)?)rem\]/.exec(w.w)?.[1] ?? 24);
    // right of the icon column (9rem) where there is room; never past the screen's right edge
    return `max(8px, min(max(9rem, ${w.x * 100}%), calc(100% - min(${rem}rem, 100% - 1.5rem) - 12px)))`;
  };
  // top: its fraction, but never so low that it runs under the taskbar on a short screen; on the
  // laptop the welcome window sits just under the trust window's title bar (see the order below)
  const winTop = (w: Win) => laptop && w.id === 'welcome' ? 'calc(5% + 2.75rem)' : `min(${w.y * 100}%, max(1rem, calc(100% - 19rem)))`;
  React.useEffect(() => { setPos({}); }, [crt]);
  React.useLayoutEffect(() => {
    if (!wide) return; // only the wide layout positions windows (phones stack them)
    setOrder(prev => {
      const add = wins.map(w => w.id).filter(id => !prev.includes(id));
      // the laptop screen is too narrow for welcome and trust side by side: welcome starts on top
      if (!prev.length && laptop) { const i = add.indexOf('welcome'); if (i >= 0) add.push(...add.splice(i, 1)); }
      return [...prev, ...add];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wide, people.length, chatOpen]);
  // a dragged window stays reachable when the screen gets smaller (a resize, Split View)
  React.useEffect(() => {
    const el = areaRef.current;
    if (!el || !wide || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      setPos(prev => {
        let changed = false;
        const next: typeof prev = {};
        for (const [id, q] of Object.entries(prev)) {
          const c = { x: clamp(q.x, -200, Math.max(0, width - 120)), y: clamp(q.y, 0, Math.max(0, height - 48)) };
          if (c.x !== q.x || c.y !== q.y) changed = true;
          next[id] = c;
        }
        return changed ? next : prev;
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [wide]);

  const focus = (id: string) => setOrder(o => [...o.filter(x => x !== id), id]);

  const onDown = (e: React.PointerEvent, id: string) => {
    if (!wide || (e.target as HTMLElement).closest('button')) return;
    const el = document.getElementById(`cn-win-${id}`);
    const p = pos[id] || { x: el?.offsetLeft ?? 0, y: el?.offsetTop ?? 0 };
    drag.current = { id, dx: e.clientX - p.x, dy: e.clientY - p.y, pid: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    focus(id);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = areaRef.current;
    if (!d || !el || e.pointerId !== d.pid) return;
    if (e.pointerType === 'mouse' && e.buttons === 0) { drag.current = null; return; } // the release was missed
    const r = el.getBoundingClientRect();
    setPos(p => ({ ...p, [d.id]: { x: clamp(e.clientX - d.dx, -200, r.width - 120), y: clamp(e.clientY - d.dy, 0, r.height - 48) } }));
  };
  const onUp = () => { drag.current = null; };

  // The cue's run (see the state above). Everything it changes is put back in `finally`.
  const tipStop = React.useRef<() => void>(() => {});
  React.useEffect(() => {
    if (!tipRun) return;
    const ac = new AbortController();
    tipStop.current = () => ac.abort();
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stopEvt.current = null;
    const stop = (e: Event) => { if (!ac.signal.aborted) stopEvt.current = e.type === 'pointerdown' ? e : null; ac.abort(); };
    let moved = 0, lx = -1, ly = -1;
    const onMove = (e: PointerEvent) => { // a real mouse move (not a resting hand) stops it
      if (e.pointerType !== 'mouse') return;
      if (lx >= 0) moved += Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly);
      lx = e.clientX; ly = e.clientY;
      if (moved > 12) stop(e);
    };
    const onHide = () => { if (document.hidden) stop(new Event('visibilitychange')); };
    const hard = ['pointerdown', 'touchstart', 'keydown', 'wheel'] as const;
    hard.forEach(ev => window.addEventListener(ev, stop, { capture: true, passive: true }));
    window.addEventListener('pointermove', onMove, { capture: true, passive: true });
    window.addEventListener('scroll', stop, { passive: true });
    document.addEventListener('visibilitychange', onHide);

    let id: string | undefined, prev: { x: number; y: number } | undefined, savedOrder: string[] | null = null;
    let pinned = false, reordered = false, startReached = false;
    const t0 = performance.now();
    // put back the stacking the cue changed, keeping any window that arrived meanwhile
    const restoreOrder = (snap: string[], raise?: string) => setOrder(o => {
      const r = [...snap.filter(x => o.includes(x)), ...o.filter(x => !snap.includes(x))];
      return raise ? [...r.filter(x => x !== raise), raise] : r;
    });
    const unpin = () => { const k = id!; setPos(p => { const n = { ...p }; if (prev) n[k] = prev; else delete n[k]; return n; }); pinned = false; };
    const ring = () => setGhost(g => g && { ...g, ring: (g.ring || 0) + 1 });
    const play = async () => {
      const area = areaRef.current;
      if (wide && area) {
        id = ['welcome', 'trust', 'team'].find(w => !hiddenRef.current[w] && document.getElementById(`cn-win-${w}`));
        if (id) {
          const el = document.getElementById(`cn-win-${id}`)!;
          const x0 = el.offsetLeft, y0 = el.offsetTop, W = area.clientWidth;
          let dx = clamp(W * 0.06, 48, 72);
          if (x0 + el.offsetWidth + dx > W - 8) dx = -dx;          // no room on the right: the other way
          const dy = 0.4 * Math.abs(dx);
          const gx = x0 + Math.min(el.offsetWidth * 0.4, 180), gy = y0 + 18; // on the title bar, clear of _ and x
          prev = posRef.current[id]; savedOrder = orderRef.current;
          if (!still) { focus(id); reordered = true; }
          setTip('drag'); setGhost({ x: gx, y: gy });
          const k0 = id;
          if (still) await wait(2400, ac.signal);
          else {
            await wait(400, ac.signal); ring(); await wait(100, ac.signal);
            pinned = true;
            const at = (k: number) => { setPos(p => ({ ...p, [k0]: { x: x0 + dx * k, y: y0 + dy * k } })); setGhost(g => g && { ...g, x: gx + dx * k, y: gy + dy * k }); };
            await tween(600, at, ac.signal);
            await wait(200, ac.signal);
            await tween(600, k => at(1 - k), ac.signal);
            unpin(); restoreOrder(savedOrder); reordered = false; ring();
            await wait(200, ac.signal);
          }
        }
        // then point at the CENNER button: every page is in its Start menu
        const s0 = startBtn.current?.getBoundingClientRect(), a = area.getBoundingClientRect();
        if (s0) {
          setGhost({ x: s0.left - a.left + s0.width * 0.72, y: s0.top - a.top + s0.height * 0.55, glide: !still });
          if (!still) await wait(550, ac.signal);
        }
        setTip('start'); startReached = true; pulseStart(still ? 2400 : 4300);
        await wait(still ? 2400 : 1300, ac.signal);
        setGhost(g => g && { ...g, out: true }); setTip('bye');
        await wait(160, ac.signal);
      } else {
        setTip('start');                                         // the pocket device: its Start beacon
        await wait(still ? 4000 : 3200, ac.signal);
        setTip('bye');
        await wait(160, ac.signal);
      }
    };
    play().catch(() => {}).finally(() => {
      const tgt = stopEvt.current?.target as Element | null | undefined;
      stopEvt.current = null;
      const el = tgt && typeof tgt.closest === 'function' ? tgt : null;
      // a press on that window's title bar takes the window over where it is; anything else puts it back
      const grabbed = !!(el && id && !el.closest('button') && el.closest('[data-grip]')?.closest(`#cn-win-${id}`));
      if (pinned && id && !grabbed) unpin();
      const hit = el?.closest('[id^="cn-win-"]')?.id.slice(7);
      if (reordered && savedOrder) restoreOrder(savedOrder, hit);
      if (wide && !startReached && !startRef.current) pulseStart();
      // seen only once it has really shown something (a run cut off in its first frames comes back)
      if (startReached || performance.now() - t0 >= 400) { remember(TIP_KEY); deskTipDone = true; }
      setGhost(null); setTip('done');
    });
    return () => {
      ac.abort();
      hard.forEach(ev => window.removeEventListener(ev, stop, { capture: true }));
      window.removeEventListener('pointermove', onMove, { capture: true });
      window.removeEventListener('scroll', stop);
      document.removeEventListener('visibilitychange', onHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipRun]);
  // the picture goes off or the desktop leaves the window: stop the cue
  React.useEffect(() => { if (tipRunning && (screen !== 'on' || !inView)) tipStop.current(); }, [tipRunning, screen, inView]);

  // Like a real desktop: with a mouse, one click selects an icon and a double-click opens it
  // (Enter opens it too). Touch screens (tablets on the laptop, phones) open on the first tap.
  const [selIcon, setSelIcon] = React.useState<string | null>(null);
  const dblClick = wide && fine;
  // the moment a single click only selects is where a desktop can look broken: a tag says
  // "double-click to open" next to the selected icon, until the visitor's first double-click
  const [dblKnown, setDblKnown] = React.useState(() => seen(DBL_KEY));
  const learnDbl = () => { if (!dblKnown) { setDblKnown(true); remember(DBL_KEY); } };
  const dblTag = dblClick && !dblKnown && !!selIcon;
  const dblHint = (id: string) => dblTag && selIcon === id && (
    <span aria-hidden="true" className="pointer-events-none absolute left-[calc(100%+10px)] top-4 whitespace-nowrap border-2 border-ink bg-white px-2 py-1.5 font-crt text-[10px] uppercase leading-none text-ink shadow-[3px_3px_0_#0b0c0e]">
      <span className="absolute -left-[8px] top-1/2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-r-[7px] border-y-transparent border-r-ink" />
      {t('Double-click to open')}
    </span>
  );
  const iconClick = (id: string, open: () => void) => (e: React.MouseEvent) => {
    if (dblClick && e.detail === 1) { e.preventDefault(); setSelIcon(id); return; }
    if (e.detail >= 2 || !dblClick || e.detail === 0) { if (e.detail >= 2) learnDbl(); setSelIcon(null); open(); }
  };
  const icons = [
    { to: '/marketplace', label: t('Explore Marketplace'), Icon: PxShoppingBag },
    { to: '/services', label: t('Cenner Services'), Icon: PxBriefcase },
    { to: '/services#radovi', label: t('Previous Projects'), Icon: PxFolder },
    { to: '/onboarding', label: t('Read the guide'), Icon: PxBookOpen },
  ];

  const balloonShown = balloon && screen === 'on' && !start && !langOpen;
  const bell = (drop: 'up' | 'down') => (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label={t('Notifications')}
        aria-expanded={balloon}
        onClick={() => { setBalloon(v => !v); setUnread(false); setStart(false); setLangOpen(false); }}
        className={`group/tray relative flex items-center border-2 border-ink px-2 ${drop === 'up' ? 'py-1' : 'py-0.5'} ${balloon ? 'bg-ink text-white' : 'bg-white'}`}
      >
        <PxBell size={16} />
        {drop === 'up' && !balloon && <span aria-hidden="true" className="pointer-events-none absolute bottom-[calc(100%+8px)] z-[90] whitespace-nowrap border-2 border-ink bg-ink px-2 py-0.5 text-[12px] font-bold text-white opacity-0 shadow-[3px_3px_0_#0b0c0e] transition-opacity group-hover/tray:opacity-100 group-focus-visible/tray:opacity-100 left-1/2 -translate-x-1/2">{t('Notifications')}</span>}
        {unread && <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-ink bg-brand-pink" />}
      </button>
      {balloonShown && (
        <NotifyBalloon drop={drop} onClose={() => { setBalloon(false); setUnread(false); }} onFollow={() => setUnread(false)} />
      )}
    </div>
  );

  return (
    <section ref={sectionRef} data-desktop aria-label="Cenner" onPointerDownCapture={e => { if (e.pointerType !== 'touch' && tipRef.current === 'wait') touched.current = true; }} onPointerUpCapture={e => { if (e.pointerType === 'touch' && tipRef.current === 'wait') touched.current = true; }} className={`cn-cursor relative isolate text-ink ${crt ? 'cn-bezel bg-[#d8ccb6]' : laptop ? 'cn-laptop bg-ink' : 'cn-pda-ground'}`}>
      {/* The screen, set into the monitor's bezel (a photographed CRT front, or on tablet-size
          screens a 90s laptop lid, drawn over it). */}
      <div className={`relative overflow-hidden bg-[#05070c]`}>
      {/* Wallpaper: a halftone dot field in Cenner colours (no nature: the film is that moment). */}
      <ProjectDots
        palette={['#05070c', '#2a4bd8', '#4ade80', '#3a64e8', '#34c46e']}
        fixedForm="wave"
        intensity={0.5}
        pace={0.3}
        className="absolute inset-0 h-full w-full"
      />
      {crt && <div aria-hidden="true" className="cn-scan pointer-events-none absolute inset-0 opacity-40" />}
      {wide ? (
      <div className="relative flex flex-col" style={{ height: crt ? 'calc(100svh - 6.725rem)' : 'calc(100svh - 246px * var(--lz))', minHeight: crt ? '38rem' : '30rem' }}>
        <div ref={areaRef} className="relative flex-1 p-6" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onLostPointerCapture={onUp} onPointerDown={e => { if (!(e.target as HTMLElement).closest('[data-icon]')) setSelIcon(null); }}>
          {/* Desktop icons */}
          <ul className={`absolute left-6 top-6 grid w-28 grid-cols-1 gap-5 ${dblTag ? 'z-[30]' : 'z-0'}`} role="list">
            {icons.map(({ to, label, Icon }, i) => (
              <li key={to} className="relative" style={bootIn(120 + i * 70)}>
                <Link to={to} data-icon onClick={e => { if (dblClick && e.detail === 1) { e.preventDefault(); setSelIcon(to); } else if (dblClick && e.detail >= 2) learnDbl(); }} className="group flex flex-col items-center gap-1.5 text-center">
                  <span className={`flex h-14 w-14 items-center justify-center border-2 border-ink transition-colors ${selIcon === to ? 'bg-brand-green' : 'bg-white group-hover:bg-brand-green'}`}><Icon size={24} /></span>
                  <span className={`px-1.5 py-0.5 font-display text-[13px] font-bold leading-tight ${selIcon === to ? 'bg-sky text-white outline-dotted outline-1 outline-offset-1 outline-white' : 'bg-ink text-white'}`}>{label}</span>
                </Link>
                {dblHint(to)}
              </li>
            ))}
            <li className="relative" style={bootIn(120 + icons.length * 70)}>
              <button type="button" data-icon onClick={iconClick('chat', openChat)} className="group flex w-full flex-col items-center gap-1.5 text-center">
                <span className={`relative flex h-14 w-14 items-center justify-center border-2 border-ink transition-colors ${selIcon === 'chat' ? 'bg-white' : 'bg-brand-green group-hover:bg-white'}`}>
                  <PxMessage size={24} />
                  <span className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-ink bg-brand-pink" />
                </span>
                <span className={`px-1.5 py-0.5 font-display text-[13px] font-bold leading-tight text-white ${selIcon === 'chat' ? 'bg-sky outline-dotted outline-1 outline-offset-1 outline-white' : 'bg-ink'}`}>{t('Chat with us')}</span>
              </button>
              {dblHint('chat')}
            </li>
          </ul>

          {/* Windows */}
          <div>
            {wins.map(w => {
              const p = pos[w.id];
              const z = order.indexOf(w.id) + 1;
              const min = hidden[w.id];
              return (
                <div
                  key={w.id}
                  id={`cn-win-${w.id}`}
                  data-ui
                  role="dialog"
                  aria-label={w.title}
                  onPointerDown={() => focus(w.id)}
                  aria-hidden={min || undefined}
                  inert={min || undefined}
                  className={`max-w-[calc(100%-1.5rem)] border-2 border-ink bg-white shadow-[10px_10px_0_#0b0c0e] ${w.w} ${wide ? 'absolute transition-[transform,opacity] duration-300 ease-[cubic-bezier(.4,0,.2,1)]' : 'relative'} ${min ? (wide ? 'pointer-events-none translate-y-[60vh] scale-[0.15] opacity-0' : 'hidden') : ''}`}
                  style={{ ...(wide ? { left: p ? p.x : winLeft(w), top: p ? p.y : winTop(w), zIndex: 10 + z, transformOrigin: '50% 100%' } : {}), ...(min ? {} : bootIn(480 + wins.indexOf(w) * 160)) }}
                >
                  <div
                    data-grip
                    onPointerDown={e => onDown(e, w.id)}
                    className={`flex select-none items-center justify-between border-b-2 border-ink px-3 py-2 font-term text-[13px] font-bold ${w.bar} ${wide ? 'cursor-grab touch-none active:cursor-grabbing' : ''}`}
                  >
                    <span className="flex items-center gap-2"><span aria-hidden="true" className="cn-grip" />{w.title}</span>
                    <span className="flex gap-1.5">
                      <button type="button" aria-label={`${t('Minimize')}: ${w.title}`} onClick={() => setHidden(h => ({ ...h, [w.id]: true }))} className="flex h-6 w-6 items-center justify-center border-2 border-current"><PxMinus size={12} /></button>
                      <button type="button" aria-label={`${t('Close')}: ${w.title}`} onClick={() => setHidden(h => ({ ...h, [w.id]: true }))} className="flex h-6 w-6 items-center justify-center border-2 border-current"><PxClose size={12} /></button>
                    </span>
                  </div>
                  {w.body}
                </div>
              );
            })}
          </div>

          {/* the cue's ghost cursor (the site's arrow inverted, or a fingertip on touch) and its chip */}
          {ghost && (
            <div aria-hidden="true" className="cn-ghost pointer-events-none absolute z-[75]" data-glide={ghost.glide || undefined} data-out={ghost.out || undefined} style={{ left: ghost.x, top: ghost.y }}>
              {fine
                ? <img src={PIXEL_ARROW('0b0c0e', 'fff')} alt="" width={24} height={32} className="absolute -left-0.5 -top-0.5 max-w-none" />
                : <span className="absolute -left-3.5 -top-3.5 block h-7 w-7 rounded-full border-2 border-ink bg-white/60" />}
              {ghost.ring ? <span key={ghost.ring} className={`cn-tap ${fine ? '' : 'rounded-full'}`} /> : null}
              <span className={`absolute left-5 whitespace-nowrap border-2 border-ink bg-ink px-2 py-1.5 font-crt text-[10px] uppercase leading-none text-brand-green shadow-[3px_3px_0_#4ade80] ${tip === 'drag' ? 'top-7' : '-top-9'}`}>
                {tip === 'drag' ? t('Drag me') : t('All pages')}
              </span>
            </div>
          )}
        </div>

        {/* Taskbar */}
        <div className="relative z-[85] flex items-center gap-2 border-t-2 border-ink bg-paper px-2 py-1.5 font-term text-[13px]" style={bootIn(0, 'translate3d(0,100%,0)')}>
          <div data-start className="relative" onBlur={e => { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) setStart(false); }}>
            <button
              ref={startBtn}
              type="button"
              aria-expanded={start === 'bar'}
              aria-controls="cn-start"
              onClick={() => { setStart(v => (v === 'bar' ? false : 'bar')); setLangOpen(false); setHint(false); }}
              className={`group/tray relative flex items-center gap-2 border-2 border-ink px-2 py-1 font-display text-[14px] font-black ${start ? 'bg-ink text-brand-green' : 'bg-brand-green'} ${hint && !start ? 'cn-start-hint' : ''}`}
            >
              <span aria-hidden="true" className={`flex h-5 w-5 items-center justify-center font-display text-[12px] font-black ${start ? 'bg-brand-green text-ink' : 'bg-ink text-brand-green'}`}>C</span>
              CENNER
              <PxChevronUp aria-hidden="true" size={12} className={`transition-transform ${start ? 'rotate-180' : ''}`} />
              {!start && <span aria-hidden="true" className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0 z-[90] whitespace-nowrap border-2 border-ink bg-ink px-2 py-0.5 font-term text-[12px] font-bold text-white opacity-0 shadow-[3px_3px_0_#0b0c0e] transition-opacity group-hover/tray:opacity-100 group-focus-visible/tray:opacity-100">{t('Menu')}</span>}
            </button>
            {start === 'bar' && <StartMenu drop="up" onClose={() => setStart(false)} onChat={openChat} onDemo={() => { if (tipRunning) return; setBalloon(false); window.setTimeout(() => { tipRan.current = true; setTipRun(n => n + 1); }, 350); }} />}
          </div>
          {/* the open windows, as icons; the file name shows on hover or focus */}
          <div className="flex min-w-0 flex-1 gap-1.5">
            {wins.map(w => {
              const Ico = ({ welcome: PxFileText, trust: PxShield, team: PxUsers, people: PxFolder, chat: PxMessage } as Record<string, typeof PxFileText>)[w.id] ?? PxFileText;
              return (
                <button
                  key={w.id}
                  type="button"
                  aria-label={w.title}
                  onClick={() => { setHidden(h => ({ ...h, [w.id]: false })); focus(w.id); }}
                  className={`group/win relative shrink-0 border-2 border-ink p-1.5 ${hidden[w.id] ? 'bg-paper2' : 'bg-white'}`}
                >
                  <Ico aria-hidden="true" size={16} />
                  <span aria-hidden="true" className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-[90] -translate-x-1/2 whitespace-nowrap border-2 border-ink bg-ink px-2 py-0.5 text-[12px] font-bold text-white opacity-0 shadow-[3px_3px_0_#0b0c0e] transition-opacity group-hover/win:opacity-100 group-focus-visible/win:opacity-100">{w.title}</span>
                </button>
              );
            })}
          </div>
          {/* the tray: notifications, language, chat, clock */}
          {wide && bell('up')}
          <div data-start className="relative shrink-0">
            <button
              ref={langBtn}
              type="button"
              aria-expanded={langOpen}
              aria-label={`${t('Language')}: ${curLang.name}`}
              onClick={() => { setLangOpen(v => !v); setStart(false); }}
              className={`group/tray relative flex items-center gap-1 border-2 border-ink px-2 py-1 font-bold ${langOpen ? 'bg-ink text-white' : 'bg-white'}`}
            >
              <span aria-hidden="true">{curLang.flag}</span>{curLang.code}
              {!langOpen && <span aria-hidden="true" className="pointer-events-none absolute bottom-[calc(100%+8px)] z-[90] whitespace-nowrap border-2 border-ink bg-ink px-2 py-0.5 text-[12px] font-bold text-white opacity-0 shadow-[3px_3px_0_#0b0c0e] transition-opacity group-hover/tray:opacity-100 group-focus-visible/tray:opacity-100 left-1/2 -translate-x-1/2">{t('Language')}</span>}
            </button>
            {langOpen && (
              <div role="group" aria-label={t('Language')} className="cn-toast absolute bottom-[calc(100%+8px)] right-0 z-[90] w-44 border-2 border-ink bg-white py-1 shadow-[8px_8px_0_#0b0c0e]">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    type="button"
                    aria-pressed={lang === l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); langBtn.current?.focus(); }}
                    className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left hover:bg-ink hover:text-white ${lang === l.code ? 'font-bold' : ''}`}
                  >
                    <span aria-hidden="true">{l.flag}</span>{l.name}
                    {lang === l.code && <PxCheck size={14} className="ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={openChat} aria-label={t('Chat with us')} className="group/tray relative shrink-0 border-2 border-ink bg-brand-green px-2 py-1"><PxMessage size={16} /><span aria-hidden="true" className="pointer-events-none absolute bottom-[calc(100%+8px)] z-[90] whitespace-nowrap border-2 border-ink bg-ink px-2 py-0.5 text-[12px] font-bold text-white opacity-0 shadow-[3px_3px_0_#0b0c0e] transition-opacity group-hover/tray:opacity-100 group-focus-visible/tray:opacity-100 left-1/2 -translate-x-1/2">{t('Chat with us')}</span></button>
          <span className="group/tray relative shrink-0 border-2 border-ink bg-white px-2.5 py-1"><Clock /><span aria-hidden="true" className="pointer-events-none absolute bottom-[calc(100%+8px)] z-[90] whitespace-nowrap border-2 border-ink bg-ink px-2 py-0.5 text-[12px] font-bold text-white opacity-0 shadow-[3px_3px_0_#0b0c0e] transition-opacity group-hover/tray:opacity-100 group-focus-visible/tray:opacity-100 right-0">{new Date().toLocaleDateString(lang === 'hr' ? 'hr-HR' : lang, { weekday: 'long', day: 'numeric', month: 'long' })}</span></span>
        </div>
      </div>
      ) : (
        <PocketPC wins={wins} power={screen} screenOn={screen === 'on'} unread={unread} balloon={balloon} onBalloon={setBalloon} onRead={() => setUnread(false)} cue={tip === 'start' ? 'on' : tip === 'bye' ? 'out' : false} />
      )}
      {aligned && !start && !tipRunning && !(balloonShown && !roomy) && (
        <div aria-live="polite" className={`pointer-events-none absolute bottom-24 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 border-2 border-ink px-3 py-1.5 font-term text-[13px] font-bold shadow-[4px_4px_0_#0b0c0e] transition-colors ${armed ? 'bg-white text-ink' : 'bg-ink text-white'}`}>
          <ArrowDown size={14} className="animate-bounce" />
          {armed ? t('Once more to continue') : t('Scroll twice to continue')}
        </div>
      )}
      {wide && saver}
      {/* the screen while it is off, and its power-on: the CRT's dot, line, white field and fade;
          the laptop's LCD backlight flickering on */}
      {wide && screen !== 'on' && (
        <div aria-hidden="true" className="absolute inset-0 z-[94]">
          {crt ? (
            <>
              <div className={`absolute inset-0 bg-[#06080d] ${screen === 'warming' ? 'cn-pon-dark' : ''}`} />
              {screen === 'warming' && <div className="cn-pon absolute inset-0 bg-[#f4f8ff]" />}
            </>
          ) : (
            <div className={`absolute inset-0 bg-[#07090c] ${screen === 'warming' ? 'cn-lcd-on' : ''}`} />
          )}
        </div>
      )}
      {/* the glass: the CRT's dark edge and vignette, or the LCD's shallow inset */}
      {wide && <div aria-hidden="true" className={`pointer-events-none absolute inset-0 z-[95] ${crt ? 'shadow-[inset_0_0_60px_rgba(0,0,0,.55)]' : 'shadow-[inset_0_0_14px_rgba(0,0,0,.6)]'}`} />}
      </div>
      {crt && (
        <>
          {/* The bezel over the screen's edge, then the maker's mark, the power light and the power button. */}
          <div aria-hidden="true" className="cn-bezel-frame pointer-events-none absolute inset-0 z-[96]" />
          <img src="/home/crt-mark.webp" alt="" aria-hidden="true" className="pointer-events-none absolute z-[97] select-none" style={{ left: 'calc(70px * var(--bz))', bottom: 'calc(66px * var(--bz))', width: 'calc(180px * var(--bz))' }} />
          <span aria-hidden="true" className="pointer-events-none absolute z-[97]" style={{ right: 'calc(90px * var(--bz))', bottom: 'calc(51px * var(--bz))', width: 'calc(160px * var(--bz))' }}>
            <img src="/home/crt-power.webp" alt="" className="block w-full select-none" />
            <span className="cn-led absolute left-[13.1%] top-1/2 h-[calc(14px*var(--bz))] w-[calc(14px*var(--bz))] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-green" />
          </span>
        </>
      )}
      {laptop && (
        <>
          {/* The lid over the screen's edge (laptop-bezel.webp: badge, standby button, hinges),
              then the status lights across the bottom bezel: power, disk, caps, battery. */}
          <div aria-hidden="true" className="cn-laptop-frame pointer-events-none absolute inset-0 z-[96]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-[97] flex items-center justify-center gap-[calc(34px*var(--lz))]" style={{ bottom: 'calc(58px * var(--lz))', height: 'calc(48px * var(--lz))' }}>
            {[
              { Icon: PxPower, led: screen === 'on' ? 'cn-led bg-brand-green' : 'bg-[#2a2d33]' },
              { Icon: PxSave, led: screen === 'on' ? 'cn-disk bg-[#ffb02e]' : 'bg-[#2a2d33]' },
              { Icon: PxArrowBigUp, led: 'bg-[#2a2d33]' },
              { Icon: PxBatteryMedium, led: screen === 'on' ? 'bg-brand-green' : 'bg-[#2a2d33]' },
            ].map(({ Icon, led }, i) => (
              <span key={i} className="flex items-center gap-[calc(9px*var(--lz))] text-[#6b707a]">
                <Icon strokeWidth={2.25} style={{ width: 'calc(30px * var(--lz))', height: 'calc(30px * var(--lz))' }} />
                <span className={`rounded-full ${led}`} style={{ width: 'calc(13px * var(--lz))', height: 'calc(13px * var(--lz))' }} />
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

/* ===================================================================== marquee */

// Three rows of what Cenner does and promises, each looping across the page on its own
// (alternating direction; a row pauses under the pointer). Static under reduced motion.
const MARQUEE_ROWS: { keys: string[]; cls: string; secs: number; reverse?: boolean }[] = [
  { keys: ['Web Development', 'Landing Pages', 'E-commerce', 'WordPress', 'Automations', 'Graphic Design', 'Brand Identity', 'SEO'], cls: 'text-white', secs: 46 },
  { keys: ['Verified freelancers', 'Fixed Pricing', 'Protected Payments', 'Identity Checked', 'No Outsourcing', 'In-House Team', 'Direct Support'], cls: 'text-transparent [-webkit-text-stroke:2px_#4ade80]', secs: 54, reverse: true },
  { keys: ['Discovery Call', 'Proposal & Quote', 'Build & Review', 'Delivery & Support', 'We Handle Hosting Too', 'Direct Communication'], cls: 'text-white [-webkit-text-stroke:1px_#4ade80]', secs: 40 },
];

const Marquee: React.FC<{ reduce: boolean }> = ({ reduce }) => {
  const t = useT();
  return (
    <section className="overflow-hidden bg-ink py-16 md:py-24">
      <h2 className="sr-only">{t('What You Can Build')}</h2>
      <div className="space-y-3 md:space-y-5">
        {MARQUEE_ROWS.map((row, r) => (
          <Link key={r} to="/services" className="cn-marquee-row block" aria-hidden={r > 0 || undefined} tabIndex={r > 0 ? -1 : undefined}>
            <div
              className="cn-marquee flex w-max whitespace-nowrap font-display font-black uppercase leading-[0.95] tracking-[-0.03em]"
              style={reduce ? undefined : { animationDuration: `${row.secs}s`, animationDirection: row.reverse ? 'reverse' : 'normal' }}
            >
              {[0, 1].map(copy => (
                <span key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1 || undefined}>
                  {row.keys.map(k => (
                    <span key={k} className="flex items-center">
                      <span className={`text-[clamp(2.5rem,6.5vw,6.5rem)] transition-colors hover:text-brand-green ${row.cls}`}>{t(k)}</span>
                      <span className="mx-[2.2vw] inline-block h-[2.2vw] min-h-4 w-[3.2vw] min-w-6 rounded-[38%/48%] bg-brand-green" aria-hidden="true" />
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-12 flex flex-wrap items-end justify-between gap-6 px-4 md:px-8">
        <p className="max-w-[34ch] font-text text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.55] text-white">{t('Outcomes we deliver end-to-end.')}</p>
        <Link to="/services" className="cn-press inline-flex items-center gap-2 border-2 border-white bg-brand-green px-6 py-3.5 font-display text-[15px] font-bold text-ink">{t('See all services')} <ArrowRight size={17} /></Link>
      </div>
    </section>
  );
};

/* ===================================================================== setup wizard */

const STEPS = ['Pick activity', 'Open via START', 'Register HZMO/HZZO', 'Connect to Cenner'] as const;

const Wizard: React.FC = () => {
  const t = useT();
  const [step, setStep] = React.useState(0);
  const last = step === STEPS.length - 1;
  return (
    <section className="bg-paper2 px-4 py-24 md:px-8 md:py-36">
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-6">
          <h2 className="font-display text-[clamp(2.25rem,1.2rem+4vw,5rem)] font-black uppercase leading-[1.02] tracking-[-0.03em]">
            {t("Your first invoice? We'll show you how.")}
          </h2>
          <p className="mt-6 max-w-[46ch] font-text text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.55]">
            {t('To invoice clients in Croatia you must be registered as a paušalni obrt or a similar legal entity. We put together a step-by-step guide so you know exactly what to do.')}
          </p>
          <p className="mt-4 text-[14px] text-slate">{t('Informational only, not legal advice')}</p>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <div data-ui className="border-2 border-ink bg-white shadow-[12px_12px_0_#0b0c0e]">
            <div className="flex items-center justify-between border-b-2 border-ink bg-sky px-3 py-2 font-term text-[13px] font-bold text-white">
              <span>cenner_setup.exe — {t('Legal in Croatia')}</span>
              <span className="tabular-nums">{step + 1}/{STEPS.length}</span>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex gap-1.5" aria-hidden="true">
                {STEPS.map((_, i) => <span key={i} className={`h-4 flex-1 border-2 border-ink transition-colors duration-300 ${i <= step ? 'bg-brand-green' : 'bg-paper'}`} />)}
              </div>
              <p aria-live="polite" className="mt-8 min-h-[2.2em] font-display text-[clamp(1.75rem,3vw,2.75rem)] font-black leading-[1] tracking-[-0.03em]">{t(STEPS[step])}</p>
              <ul className="mt-6 space-y-2 font-term text-[14px]">
                {STEPS.map((s, i) => (
                  <li key={s} className={i <= step ? 'text-ink' : 'text-slate'}>[{i < step ? 'x' : i === step ? '>' : ' '}] {t(s)}</li>
                ))}
              </ul>
              <div className="mt-8 flex justify-between gap-3">
                <button type="button" disabled={step === 0} onClick={() => setStep(s => s - 1)} className="cn-press border-2 border-ink bg-paper px-5 py-3 font-display text-[15px] font-bold disabled:opacity-40">←</button>
                {last ? (
                  <Link to="/onboarding" className="cn-press inline-flex items-center gap-2 border-2 border-ink bg-brand-green px-5 py-3 font-display text-[15px] font-bold">{t('Read the guide')} <ArrowRight size={17} /></Link>
                ) : (
                  <button type="button" onClick={() => setStep(s => s + 1)} className="cn-press inline-flex items-center gap-2 border-2 border-ink bg-sky px-5 py-3 font-display text-[15px] font-bold text-white">{t(STEPS[step + 1])} <ArrowRight size={17} /></button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ===================================================================== terminal FAQ */

const FAQ_KEYS = [1, 2, 3, 4, 5].map(n => ({ q: `faq.q${n}`, a: `faq.a${n}` }));

// Commands the terminal understands, besides the numbered questions.
const ROUTES: Record<string, string> = {
  poslovi: '/marketplace', jobs: '/marketplace', usluge: '/services', services: '/services',
  projekti: '/services#radovi', projects: '/services#radovi', vodic: '/onboarding', guide: '/onboarding', prijava: '/auth', login: '/auth',
};

const Terminal: React.FC<{ reduce: boolean }> = ({ reduce }) => {
  const t = useT();
  const navigate = useNavigate();
  const [cmd, setCmd] = React.useState('');
  const [log, setLog] = React.useState<{ q: string; a: string }[]>([]);
  const [typed, setTyped] = React.useState(0);
  const outRef = React.useRef<HTMLDivElement>(null);
  const sectionRef = React.useRef<HTMLElement>(null);
  const touched = React.useRef(false);
  const current = log[log.length - 1];

  React.useEffect(() => {
    if (!current) return;
    if (reduce) { setTyped(current.a.length); return; }
    setTyped(0);
    let i = 0;
    const id = window.setInterval(() => { i += 3; setTyped(Math.min(i, current.a.length)); if (i >= current.a.length) window.clearInterval(id); }, 12);
    return () => window.clearInterval(id);
  }, [current, reduce]);

  React.useEffect(() => { outRef.current?.scrollTo({ top: outRef.current.scrollHeight }); }, [typed, log.length]);

  const help = [
    ...FAQ_KEYS.map((f, i) => `${i + 1}   ${t(f.q)}`),
    'poslovi · usluge · projekti · vodic · prijava',
    'help · clear',
  ].join('\n');

  // The first time the terminal scrolls into view, a beat later the first question is typed into the
  // prompt letter by letter, entered, and answered, as a demo of what the questions below do.
  // Anything the visitor does first (typing, clicking a question) cancels it.
  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    let start = 0, tick = 0, enter = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      start = window.setTimeout(() => {
        if (touched.current) return;
        const text = t(FAQ_KEYS[0].q);
        if (reduce) { demo('1'); return; }
        let i = 0;
        tick = window.setInterval(() => {
          if (touched.current) { window.clearInterval(tick); return; }
          i += 1;
          setCmd(text.slice(0, i));
          if (i >= text.length) {
            window.clearInterval(tick);
            enter = window.setTimeout(() => { if (!touched.current) { setCmd(''); demo('1'); } }, 450);
          }
        }, 38);
      }, 650);
    }, { threshold: 0.45 });
    io.observe(el);
    return () => { io.disconnect(); window.clearTimeout(start); window.clearInterval(tick); window.clearTimeout(enter); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const demo = (raw: string) => run(raw, true);
  const run = (raw: string, auto = false) => {
    if (!auto) touched.current = true;
    const c = raw.trim().toLowerCase();
    if (!c) return;
    if (c === 'clear' || c === 'cls') { setLog([]); return; }
    const n = Number(c);
    if (Number.isInteger(n) && n >= 1 && n <= FAQ_KEYS.length) { setLog(l => [...l, { q: t(FAQ_KEYS[n - 1].q), a: t(FAQ_KEYS[n - 1].a) }]); return; }
    if (c === 'help' || c === '?' || c === 'pomoc' || c === 'pomoć') { setLog(l => [...l, { q: c, a: help }]); return; }
    const to = ROUTES[c.replace('ć', 'c')];
    if (to) { setLog(l => [...l, { q: c, a: `→ ${to}` }]); window.setTimeout(() => navigate(to), 450); return; }
    setLog(l => [...l, { q: c, a: `bash: ${c}: command not found  (help)` }]);
  };

  return (
    <section ref={sectionRef} className="bg-ink px-4 py-24 text-white md:px-8 md:py-36">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          <h2 className="font-display text-[clamp(2.25rem,1.2rem+4vw,5rem)] font-black uppercase leading-[1.02] tracking-[-0.03em] text-brand-green">
            {t('Frequently Asked Questions')}
          </h2>
          <p className="mt-6 max-w-[34ch] font-text text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.55]">
            {t('Everything about freelancing in Croatia and the EU in one place.')}
          </p>
        </div>
        <div className="lg:col-span-7">
          <div data-ui className="border-2 border-brand-green bg-black shadow-[12px_12px_0_#4ade80]">
            <div className="flex items-center justify-between border-b-2 border-brand-green px-3 py-2 font-term text-[13px] font-bold text-brand-green">
              <span>cenner@hr: ~/faq</span><span>bash</span>
            </div>
            <div ref={outRef} aria-live="polite" className="h-[22rem] overflow-y-auto p-5 font-term text-[14px] leading-[1.6] text-brand-green md:h-[26rem]">
              <p className="cn-glow">cenner.hr · {t('Frequently Asked Questions')}</p>
              {log.map((l, i) => (
                <div key={i} className="mt-4">
                  <p className="text-white"><span className="text-brand-green">cenner@hr:~$</span> {l.q}</p>
                  <p className="mt-1 whitespace-pre-wrap text-[#c7f9d7]">{i === log.length - 1 ? l.a.slice(0, typed) : l.a}</p>
                </div>
              ))}
              {log.length === 1 && typed >= log[0].a.length && (
                <p className="mt-4 text-brand-green/70">↓ {t('Pick a question below, or type its number')}</p>
              )}
              <form
                className="mt-4 flex items-center gap-2"
                onSubmit={e => { e.preventDefault(); run(cmd); setCmd(''); }}
              >
                <label htmlFor="cn-term" className="shrink-0">cenner@hr:~$</label>
                <input
                  id="cn-term"
                  value={cmd}
                  onChange={e => { touched.current = true; setCmd(e.target.value); }}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="help"
                  className="min-w-0 flex-1 bg-transparent font-term text-[14px] text-white caret-brand-green outline-none placeholder:text-brand-green/40"
                />
              </form>
            </div>
            <ul className="border-t-2 border-brand-green p-3" role="list">
              {FAQ_KEYS.map(f => (
                <li key={f.q}>
                  <button
                    type="button"
                    onClick={() => run(String(FAQ_KEYS.indexOf(f) + 1))}
                    className="w-full px-2 py-2 text-left font-term text-[14px] text-white transition-colors hover:bg-brand-green hover:text-ink"
                  >
                    <span className={log.length === 1 && !log.some(l => l.q === t(f.q)) ? 'cn-caret' : ''}>&gt;</span> {t(f.q)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* The answers in plain text as well, for search and for anyone without the terminal. */}
          <dl className="sr-only">
            {FAQ_KEYS.map(f => (<React.Fragment key={f.q}><dt>{t(f.q)}</dt><dd>{t(f.a)}</dd></React.Fragment>))}
          </dl>
        </div>
      </div>
    </section>
  );
};

/* ===================================================================== CTA + outro */

const Cta: React.FC = () => {
  const t = useT();
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <section className="bg-brand-green px-4 py-24 text-ink md:px-8 md:py-32">
      <div className="mx-auto max-w-[1500px]">
        <h2 className="font-display text-[clamp(3rem,11vw,12rem)] font-black uppercase leading-[0.98] tracking-[-0.04em]">
          {t('Ready to get started?')}
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <p className="max-w-[40ch] font-text text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.55] md:col-span-6">
            {t("Whether you're a visionary founder or a technical master, Cenner is the home for your most ambitious projects.")}
          </p>
          <div className="flex flex-wrap gap-4 md:col-span-6 md:justify-end">
            <button type="button" onClick={() => navigate(user ? '/profile?create=1' : '/marketplace')} className="cn-press inline-flex items-center gap-2 border-2 border-ink bg-sky px-7 py-4 font-display text-[17px] font-black text-white">
              {t('Start a Project')} <ArrowRight size={19} />
            </button>
            <button type="button" onClick={() => navigate(user ? '/profile' : '/auth')} className="cn-press inline-flex items-center gap-2 border-2 border-ink bg-white px-7 py-4 font-display text-[17px] font-black">
              {t('Join the Network')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// The shutdown. As the outro pins, the screen is back on the CENNER card (the hero's last frame)
// with a status line: "Shutting down...", then "It is now safe to turn off your computer.".
// Then a Higgsfield clip plays: the picture collapses to a bright line and a dot, and the camera
// pulls back out of the glass to the dark monitor on its desk. Its last frame is the same view as
// the switched-off still, so the CSS camera takes over from there out to the whole meadow, CENNER
// returns, and the page runs on into the footer. Downward wheel scrolling is held while it plays
// (scrolling harder plays it faster); scrolling back up resets it.
const DARK_STATIC = ['/video/dark-static-v1-1280.mp4', '/video/dark-static-v1-854.mp4'] as const;
const POWER_OFF = ['/video/power-off-v1-1280.mp4', '/video/power-off-v1-854.mp4'] as const;
const GLASS_BOX = { x: 907, y: 489, w: 68, h: 65 }; // the glass's bounding box in the film
const POWER_RATE = 1.3;

const ZoomOut: React.FC<{ reduce: boolean }> = ({ reduce }) => {
  const ref = React.useRef<HTMLElement>(null);
  const film = React.useRef<HTMLDivElement>(null);
  const still = React.useRef<HTMLImageElement>(null);
  const screenOff = React.useRef<HTMLVideoElement>(null);
  const clip = React.useRef<HTMLVideoElement>(null);
  const mark = React.useRef<HTMLDivElement>(null);
  const grainFx = React.useRef<HTMLDivElement>(null);
  const [src, setSrc] = React.useState<string | null>(null);
  const [clipSrc, setClipSrc] = React.useState<string | null>(null);
  const t = useT();

  const [power, setPower] = React.useState<'on' | 'safe' | 'play' | 'off'>(reduce ? 'off' : 'on');
  const powerRef = React.useRef(power);
  powerRef.current = power;
  const powerTimers = React.useRef<number[]>([]);
  const curP = React.useRef(0);
  const rateTimer = React.useRef(0);
  const finish = () => { powerTimers.current.forEach(id => window.clearTimeout(id)); powerTimers.current = []; setPower('off'); };
  const playClip = () => {
    const v = clip.current;
    // no clip, or it failed: skip straight to the dark monitor
    if (!v || v.error) { finish(); return; }
    setPower('play');
    v.playbackRate = POWER_RATE;
    // safety nets, so a stalled or blocked clip never holds the wheel: if it has not started
    // within ~0.9s (iOS only preloads metadata), or has not ended well after its length, move on
    let started = false;
    const onPlaying = () => { started = true; };
    v.addEventListener('playing', onPlaying, { once: true });
    const d = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 4;
    powerTimers.current.push(
      window.setTimeout(() => { if (!started) finish(); }, 900),
      window.setTimeout(finish, (d / POWER_RATE) * 1000 + 1500),
    );
    // a pause() from resetPower rejects this promise with AbortError: that is not a failure
    v.play().catch((err: unknown) => { if ((err as { name?: string })?.name !== 'AbortError') finish(); });
  };
  const startPowerOff = () => {
    if (powerTimers.current.length || powerRef.current !== 'on') return;
    powerTimers.current = [
      window.setTimeout(() => setPower('safe'), 650),
      window.setTimeout(() => { powerTimers.current = []; playClip(); }, 1500),
    ];
  };
  const resetPower = () => {
    powerTimers.current.forEach(id => window.clearTimeout(id));
    powerTimers.current = [];
    const v = clip.current;
    if (v) { v.pause(); v.currentTime = 0; }
    if (powerRef.current !== 'on') setPower('on');
  };
  React.useEffect(() => () => { powerTimers.current.forEach(id => window.clearTimeout(id)); window.clearTimeout(rateTimer.current); }, []);
  React.useEffect(() => {
    if (reduce) return;
    const brake = (e: WheelEvent) => {
      const sec = ref.current;
      if (e.deltaY <= 0 || !sec || powerRef.current === 'off') return;
      const top = sec.getBoundingClientRect().top;
      const px = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      if (top <= NAV_H + 1 && curP.current < 0.12) {
        e.preventDefault();
        startPowerOff();
        // scrolling while it plays speeds it up, at the visitor's own pace
        const v = clip.current;
        if (v && powerRef.current === 'play') {
          v.playbackRate = Math.min(3.5, Math.max(v.playbackRate, POWER_RATE + Math.abs(px) / 220));
          window.clearTimeout(rateTimer.current);
          rateTimer.current = window.setTimeout(() => { if (clip.current) clip.current.playbackRate = POWER_RATE; }, 260);
        }
        return;
      }
      // a fast wheel would jump past the pin point: land exactly on it instead
      if (top > NAV_H + 1 && top - px < NAV_H - 40) {
        e.preventDefault();
        window.scrollTo(0, top + window.scrollY - NAV_H);
        startPowerOff();
      }
    };
    window.addEventListener('wheel', brake, { passive: false });
    return () => window.removeEventListener('wheel', brake);
  }, [reduce]);

  // The clips only load (and the static only plays) once the outro is near.
  React.useEffect(() => {
    const el = ref.current;
    if (reduce || !el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(entries => { const e = entries[entries.length - 1];
      const narrow = window.matchMedia('(max-width: 767px)').matches ? 1 : 0;
      if (e.isIntersecting) { setSrc(s => s ?? DARK_STATIC[narrow]); setClipSrc(s => s ?? POWER_OFF[narrow]); }
      const v = screenOff.current;
      if (v) { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }
    }, { rootMargin: '100% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, src]);

  usePin(ref, (p, W, H) => {
    curP.current = p;
    const top = ref.current?.getBoundingClientRect().top ?? 0;
    if (top > window.innerHeight * 0.6) resetPower();       // scrolled back up, away from it
    else if (p > 0.18 && powerRef.current !== 'off') finish(); // jumped past it (scrollbar, keys)
    else if (top <= NAV_H + 1) startPowerOff();
    const bw = Math.max(W, (H * 16) / 9);
    const bh = (bw * 9) / 16;
    const boxL = FOCUS_X * W - FOCUS_X * bw, boxT = 0.5 * H - 0.5 * bh;
    const fx = (x: number) => boxL + (x / 1920) * bw;
    const fy = (y: number) => boxT + (y / 1080) * bh;
    const place = (el: HTMLElement | null, r: { x: number; y: number; w: number; h: number }) => {
      if (!el) return;
      el.style.left = `${fx(r.x)}px`; el.style.top = `${fy(r.y)}px`;
      el.style.width = `${(r.w / 1920) * bw}px`; el.style.height = `${(r.h / 1080) * bh}px`;
    };
    place(still.current, STILL);
    place(screenOff.current, GLASS_BOX);
    // The clip ends on the switched-off still, framed to fill the stage (like object-fit:cover);
    // from that framing the camera pulls back out to the whole meadow.
    const cx = fx(STILL.x + STILL.w / 2), cy = fy(STILL.y + STILL.h / 2);
    const camEnd = Math.max(W / ((STILL.w / 1920) * bw), H / ((STILL.h / 1080) * bh));
    const z = 1 - smooth(span(p, 0.12, 0.72));
    if (film.current) {
      film.current.style.transformOrigin = `${cx}px ${cy}px`;
      film.current.style.transform = `translate3d(${(W / 2 - cx) * z}px,${(H / 2 - cy) * z}px,0) scale(${Math.pow(camEnd, z)})`;
      film.current.style.setProperty('--mh-grain-opacity', String(0.88 * (1 - z)));
    }
    if (grainFx.current) grainFx.current.style.opacity = String(z);
    // CENNER returns once the camera is out: a timed fade (CSS), not tied to the scroll
    if (mark.current) mark.current.dataset.on = p >= 0.7 ? '1' : '0';
  }, !reduce);

  return (
    <section ref={ref} data-outro aria-hidden="true" className={reduce ? 'relative' : 'relative h-[300vh]'}>
      <div className={`${reduce ? 'relative' : 'sticky top-[4.5rem]'} h-[calc(100svh-4.5rem)] overflow-hidden bg-sky`}>
        <div ref={film} className="absolute inset-0 will-change-transform">
          <MeadowBackdrop variant="frame" controls={false} />
          {!reduce && (
            <>
              <img
                ref={still}
                src="/home/monitor-off-1440.jpg"
                srcSet="/home/monitor-off-1440.jpg 1440w, /home/monitor-off-2880.jpg 2880w"
                sizes="1600px"
                alt=""
                decoding="async"
                loading="lazy"
                className="pointer-events-none absolute [mask-image:radial-gradient(closest-side,#000_46%,rgba(0,0,0,.6)_70%,transparent_100%)] [-webkit-mask-image:radial-gradient(closest-side,#000_46%,rgba(0,0,0,.6)_70%,transparent_100%)]"
              />
              {src && (
                <video
                  ref={screenOff}
                  src={src}
                  muted
                  loop
                  playsInline
                  preload="auto"
                  tabIndex={-1}
                  // it arrives after the first layout pass: re-run the pin so it is placed on the glass
                  onLoadedData={() => window.dispatchEvent(new Event('scroll'))}
                  className="pointer-events-none absolute left-0 top-0 h-0 w-0 rounded-[14%/16%] object-cover opacity-[.35] mix-blend-screen"
                />
              )}
            </>
          )}
        </div>
        {!reduce && (
          // the power-off clip, over the film until it has played out (then it fades away and
          // the film, framed exactly like its last frame, carries on)
          <div className={`pointer-events-none absolute inset-0 z-[5] transition-opacity duration-500 ${power === 'off' ? 'opacity-0' : 'opacity-100'}`}>
            <img src="/home/power-off-poster.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            {clipSrc && (
              <video
                ref={clip}
                src={clipSrc}
                muted
                playsInline
                preload="auto"
                tabIndex={-1}
                onEnded={finish}
                onError={() => { if (powerRef.current === 'play') finish(); }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <p
              className={`absolute inset-x-0 bottom-[14%] px-6 text-center font-crt text-[clamp(.8rem,.55rem+1vw,1.35rem)] leading-relaxed text-brand-green [text-shadow:0_0_12px_rgba(74,222,128,.7)] transition-opacity duration-200 ${power === 'on' || power === 'safe' ? 'opacity-100' : 'opacity-0'}`}
            >
              {power === 'on' ? <>{t('Shutting down...')}<span className="cn-caret">_</span></> : t('It is now safe to turn off your computer.')}
            </p>
          </div>
        )}
        {!reduce && <div ref={grainFx} className="pointer-events-none absolute inset-0 z-10 overflow-hidden"><span className="cn-grain" /></div>}
        <div ref={mark} className={`absolute inset-x-0 top-[6%] z-20 px-2 text-center font-display text-[14vw] font-black uppercase leading-none tracking-[-0.05em] text-white [text-shadow:.04em_.04em_0_#0b0c0e] ${reduce ? '' : 'cn-mark'}`}>
          Cenner
        </div>
      </div>
    </section>
  );
};

/* ===================================================================== page */

const Home: React.FC = () => {
  const reduce = useReducedMotion();
  const wideHero = useMedia('(min-width: 1024px)'); // the CRT in a meadow; below it, the PDA in a city
  const [topPros, setTopPros] = React.useState<any[]>([]);
  const [spotlight, setSpotlight] = React.useState<any[]>([]);

  React.useEffect(() => {
    API.getTopPros().then(setTopPros).catch(() => setTopPros([]));
    API.getSpotlight().then(setSpotlight).catch(() => setSpotlight([]));
  }, []);
  const people = [...spotlight, ...topPros.filter(p => !spotlight.some(s => s.id === p.id))];

  // The page is a scroll story: a reload starts it from the top (index.html also switches the
  // browser's own scroll restoration off before it can jump mid-way); other pages keep theirs.
  React.useEffect(() => {
    if (!('scrollRestoration' in history)) return;
    history.scrollRestoration = 'manual';
    if (!window.location.hash) window.scrollTo(0, 0);
    return () => { history.scrollRestoration = 'auto'; cancelGlide(); };
  }, []);

  return (
    <div className="relative bg-ink font-text text-ink">
      <style>{CSS}</style>
      <SEO
        title="Freelance Hrvatska: Pronađi Freelancera"
        canonical="/"
        description="Cenner je vodeća freelance platforma u Hrvatskoj. Pronađi provjerene freelancere za izradu web stranica, dizajn, marketing i razvoj. Honorarni posao brzo i sigurno."
        keywords="freelance hrvatska, honorarni posao, izrada web stranica, freelance platforma, najam freelancera"
      />
      {wideHero ? <ZoomIn reduce={reduce} /> : <ZoomInPocket reduce={reduce} />}
      <Desktop people={people} />
      <Marquee reduce={reduce} />
      <Wizard />
      <Terminal reduce={reduce} />
      <Cta />
      <ZoomOut reduce={reduce} />
    </div>
  );
};

export default Home;
