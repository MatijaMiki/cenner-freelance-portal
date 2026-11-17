/**
 * A language switch re-mounts the router (App.tsx) on the same page in the other language, and a
 * fresh page starts at its top. i18n.tsx notes the reader's position here before it switches, and
 * components/ScrollToTop puts them back there. Kept apart from both so i18n.tsx, which lib/md also
 * bundles for the server, imports no React Router code.
 */
let pending: number | null = null;

export const keepScrollAcrossRemount = (y: number) => { pending = y; };
export const pendingScroll = () => pending;
/** Cleared a moment after use, so a re-run of the same mount effect (StrictMode) still sees it. */
export const clearPendingScroll = () => { setTimeout(() => { pending = null; }, 300); };
