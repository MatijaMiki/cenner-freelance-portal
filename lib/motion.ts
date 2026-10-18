/**
 * One clock for the site's canvas animations (the page backdrop, the footer and card dots, the logo strip).
 *
 *  - Each runs on a timer at its own rate, not on every screen refresh: between its frames the page
 *    does nothing at all (a requestAnimationFrame loop that returns early still wakes the main thread
 *    60-120 times a second).
 *  - It only runs while it can be seen (`active`) and the tab is visible.
 *  - After 20 s with no input (pointer, key, wheel, touch, scroll) every loop drops to its idle rate;
 *    the first input brings the normal rate straight back.
 */

const IDLE_MS = 20000;
let lastInput = typeof performance !== 'undefined' ? performance.now() : 0;
const loops = new Set<{ wake: () => void }>();

if (typeof window !== 'undefined') {
  const onInput = () => {
    const now = performance.now();
    const wasIdle = now - lastInput > IDLE_MS;
    lastInput = now;
    if (wasIdle) loops.forEach(l => l.wake());
  };
  for (const e of ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll']) {
    window.addEventListener(e, onInput, { passive: true, capture: true });
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loops.forEach(l => l.wake()); });
}

export const isIdle = (now = performance.now()) => now - lastInput > IDLE_MS;

/**
 * Calls `frame(now)` on an animation frame about every `ms` (every `idleMs` once the visitor is idle)
 * while `active()` is true and the tab is visible. When either stops being true the loop simply stops;
 * `wake()` starts it again (and draws a frame right away). The module wakes every loop when the tab
 * comes back and on the first input after idle; a component wakes its own, e.g. when it scrolls into view.
 */
export function frameLoop(frame: (now: number) => void, ms: number, idleMs: number, active: () => boolean = () => true) {
  let timer = 0, raf = 0, dead = false;
  const run = (now: number) => {
    raf = 0;
    if (dead || document.hidden || !active()) return;
    frame(now);
    timer = window.setTimeout(() => { timer = 0; raf = requestAnimationFrame(run); }, isIdle(now) ? idleMs : ms);
  };
  const loop = {
    wake: () => {
      if (dead || raf) return;
      if (timer) { window.clearTimeout(timer); timer = 0; }
      raf = requestAnimationFrame(run);
    },
    stop: () => {
      dead = true;
      window.clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
      loops.delete(loop);
    },
  };
  loops.add(loop);
  loop.wake();
  return loop;
}
