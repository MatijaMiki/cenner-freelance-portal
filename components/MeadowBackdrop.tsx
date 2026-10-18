
import React from 'react';
import { Pause, Play } from 'lucide-react';
import { useT } from '../i18n';

/**
 * Full-bleed hero backdrop: the meadow loop with the CRT monitor at its centre.
 *
 * Layers, bottom to top: poster still -> muted looping video (fades in once it
 * is actually playing) -> film grain masked to the sky -> legibility scrims.
 *
 * Weight is the whole game here, so:
 *  - the poster paints first and the video is only requested after the page has
 *    loaded and the browser is idle, never in the critical path;
 *  - nothing but the poster is loaded under prefers-reduced-motion, Save-Data
 *    or a 2G connection;
 *  - phones get the 720p cut (~2.8 MB), everyone else the 1080p cut (~4.8 MB);
 *  - the video pauses whenever the hero is off screen or the tab is hidden;
 *  - the owner-approved "grain 30" is drawn by a tiny tiled PNG instead of being
 *    baked into the video, which keeps the file ~5 MB instead of ~26 MB.
 */

const DIR = '/video';
const VIDEO_WIDE = `${DIR}/meadow-v1-1080.mp4`;
const VIDEO_NARROW = `${DIR}/meadow-v1-720.mp4`;
const POSTER_WIDE = `${DIR}/meadow-v1-poster-1920.webp`;
const POSTER_NARROW = `${DIR}/meadow-v1-poster-960.webp`;
const SKY_MASK = `${DIR}/sky-mask-v1.png`;
const GRAIN_TILE = `${DIR}/grain-v1.png`;

// The monitor sits ~48% across the 1920x1080 frame: keep it centred when a
// narrow (portrait) hero crops the sides.
const FOCUS_X = 48;

// The picture is a 16:9 box that always covers the hero (like object-fit:cover,
// object-position FOCUS_X% 50%). Video, poster, grain and sky mask all live in
// that one box, so the mask and grain stay locked to the picture at any size.
// --bw is the box width; the grain tile (256 of 1920 video px) scales with it.
const CSS = `
.mh-cover{position:absolute;top:50%;left:${FOCUS_X}%;width:100%;aspect-ratio:16/9;transform:translate(-${FOCUS_X}%,-50%)}
@supports (width:1cqw){.mh-cover{--bw:max(100cqw,calc(100cqh * 16 / 9));width:var(--bw)}}
.mh-grain{position:absolute;inset:0;overflow:hidden;pointer-events:none;opacity:var(--mh-grain-opacity,.88);-webkit-mask:url(${SKY_MASK}) 0 0/100% 100% no-repeat;mask:url(${SKY_MASK}) 0 0/100% 100% no-repeat}
.mh-grain-tile{position:absolute;inset:-25% -14%;background:url(${GRAIN_TILE}) 0 0/calc(var(--bw,1920px) / 7.5) auto;will-change:transform}
@media (prefers-reduced-motion:no-preference){.mh-grain-tile{animation:mh-grain .32s steps(1,end) infinite}}
@keyframes mh-grain{
0%{transform:translate3d(0,0,0)}
12.5%{transform:translate3d(calc(var(--bw) * -.041),calc(var(--bw) * .052),0)}
25%{transform:translate3d(calc(var(--bw) * .037),calc(var(--bw) * -.026),0)}
37.5%{transform:translate3d(calc(var(--bw) * -.058),calc(var(--bw) * -.047),0)}
50%{transform:translate3d(calc(var(--bw) * .021),calc(var(--bw) * .063),0)}
62.5%{transform:translate3d(calc(var(--bw) * -.016),calc(var(--bw) * -.059),0)}
75%{transform:translate3d(calc(var(--bw) * .049),calc(var(--bw) * .018),0)}
87.5%{transform:translate3d(calc(var(--bw) * -.033),calc(var(--bw) * .036),0)}
100%{transform:translate3d(0,0,0)}
}`;

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

interface MeadowBackdropProps {
  /**
   * 'cover': full-bleed behind text, with legibility scrims (the dark hero).
   * 'frame': fills a rounded media band with nothing laid over it (the cream hero).
   */
  variant?: 'cover' | 'frame';
  /** Show the pause/play button (off when the film is scaled, e.g. the zoom-in hero). */
  controls?: boolean;
  /** false while something opaque covers the film: it pauses (on its current frame) until it can be seen. */
  active?: boolean;
  /** false while the grain can't be seen (its opacity is 0): it is taken out instead of animating unseen. */
  grain?: boolean;
}

const MeadowBackdrop: React.FC<MeadowBackdropProps> = ({ variant = 'cover', controls = true, active = true, grain = true }) => {
  const t = useT();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [src, setSrc] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);     // the video is really playing
  const [inView, setInView] = React.useState(true);
  const [paused, setPaused] = React.useState(false);   // the visitor pressed pause
  const [blocked, setBlocked] = React.useState(false); // the browser refused to autoplay

  // Decide whether to load the video at all, which cut, and when.
  React.useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const lean = !!conn?.saveData || conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g';
    if (reduceMotion || lean) return; // poster only

    const narrow = window.matchMedia('(max-width: 767px)').matches;
    let cancelled = false;
    let idleId: number | undefined;
    let timerId: number | undefined;
    const start = () => { if (!cancelled) setSrc(narrow ? VIDEO_NARROW : VIDEO_WIDE); };
    const schedule = () => {
      // Safari has no requestIdleCallback. (typeof, not `in`: `in` narrows window to never in the else.)
      if (typeof window.requestIdleCallback === 'function') idleId = window.requestIdleCallback(start, { timeout: 2500 });
      else timerId = window.setTimeout(start, 1200);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', schedule);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, []);

  // Only spend decode/battery while the hero is on screen.
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    // threshold 0: when the homepage zooms the film 13x, only a sliver of it is on screen, and a
    // ratio threshold would pause the video mid-zoom.
    const io = new IntersectionObserver(entries => setInView(entries[entries.length - 1].isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    v.muted = true; // React sets the property late; autoplay policies want it first
    const sync = () => {
      if (inView && active && !paused && !document.hidden) {
        v.play().then(() => setBlocked(false)).catch((err: unknown) => {
          // AbortError just means a pause() raced the play(); only NotAllowedError is a refusal.
          if ((err as { name?: string })?.name === 'NotAllowedError') setBlocked(true);
        });
      } else {
        v.pause();
      }
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [src, inView, paused, active]);

  const playing = !paused && !blocked;
  const toggle = () => {
    if (blocked) { // this click is the user gesture the browser was waiting for
      setBlocked(false);
      setPaused(false);
      videoRef.current?.play().catch(() => setBlocked(true));
      return;
    }
    setPaused(p => !p);
  };

  return (
    <>
      <style>{CSS}</style>

      <div
        ref={wrapRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#002d9e]"
        style={{ containerType: 'size' }}
      >
        <div className="mh-cover">
          <img
            src={POSTER_WIDE}
            srcSet={`${POSTER_NARROW} 960w, ${POSTER_WIDE} 1920w`}
            sizes={variant === 'frame' ? '100vw' : 'max(100vw, 178vh)'}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full select-none"
          />
          {src && (
            <video
              ref={videoRef}
              src={src}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              tabIndex={-1}
              onPlaying={() => setReady(true)}
              className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
          {/* (the grain jitters 25 times a second over a masked, screen-sized layer: only while it shows) */}
          {grain && active && inView && <div className="mh-grain"><span className="mh-grain-tile" /></div>}
        </div>
      </div>

      {variant === 'cover' && (
        <>
          {/* Legibility: the headline sits in the sky (clouds drift behind it), the copy and
              buttons sit on the grass. The top one is a soft halo behind the headline only, so the
              clouds elsewhere stay white; neither scrim reaches the monitor in the middle. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[54%] bg-[radial-gradient(ellipse_72%_62%_at_50%_46%,rgba(0,22,88,0.5),rgba(0,22,88,0.18)_55%,transparent_82%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-[#001a66]/50 via-[#001a66]/20 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[46%] bg-gradient-to-t from-brand-black via-brand-black/75 to-transparent" />
        </>
      )}

      {src && controls && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? t('Pause background video') : t('Play background video')}
          className={`absolute z-20 flex h-11 w-11 items-center justify-center rounded-full bg-ink/80 text-white transition-colors hover:bg-ink ${variant === 'frame' ? 'bottom-5 left-5 md:bottom-7 md:left-7' : 'bottom-5 left-5'}`}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
      )}
    </>
  );
};

export default MeadowBackdrop;
