
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to the top whenever the route changes (SPAs don't on their own), or, when the URL has a
 * #hash, to that section: it waits for the (lazy) page to render it, brings it just under the
 * sticky nav, and keeps it there while the page settles (Tailwind's CDN builds styles after the
 * first paint, and images and fonts arrive, all of which move the section), until the visitor
 * scrolls themselves or 2s pass. Old URLs that now live as a section of another page land this way.
 */
const ScrollToTop = () => {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }
    let id = '';
    try { id = decodeURIComponent(hash.slice(1)); } catch { id = hash.slice(1); }
    const until = performance.now() + 3000;
    const INPUT = ['wheel', 'touchstart', 'keydown', 'mousedown'];
    let raf = 0, settleUntil = 0, done = false, first = true;
    let observer: ResizeObserver | null = null;
    const stop = () => {
      done = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      INPUT.forEach(e => window.removeEventListener(e, stop));
    };
    // the visitor's own scrolling (wheel, touch, keys, a click) ends it at once, found or not
    INPUT.forEach(e => window.addEventListener(e, stop, { passive: true }));
    const align = (el: HTMLElement) => {
      const nav = document.querySelector<HTMLElement>('nav.sticky');
      const top = el.getBoundingClientRect().top + window.scrollY - (nav?.offsetHeight ?? 0) - 16;
      if (Math.abs(window.scrollY - top) > 1) window.scrollTo({ top, left: 0, behavior: 'instant' });
    };
    const find = () => {
      if (done) return;
      const el = document.getElementById(id);
      if (el) {
        if (!settleUntil) {
          settleUntil = performance.now() + 2000;
          if ('ResizeObserver' in window) {
            observer = new ResizeObserver(() => {
              const target = document.getElementById(id);
              if (!done && target) align(target);
            });
            observer.observe(document.body);
          }
        }
        align(el);
        if (performance.now() < settleUntil) raf = requestAnimationFrame(find);
        else stop();
        return;
      }
      // not there yet: a new page starts at its top meanwhile (once); give up quietly after 3s
      if (first) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      first = false;
      if (performance.now() < until) raf = requestAnimationFrame(find);
      else stop();
    };
    find();
    return stop;
    // a link to the hash the page is already on (only the history key changes) aligns again
  }, [pathname, hash, hash ? key : '']); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export default ScrollToTop;
