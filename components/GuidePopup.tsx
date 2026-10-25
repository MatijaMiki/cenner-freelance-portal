import React, { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2, X } from 'lucide-react';
import { API } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n';
import { isConsentPending } from '../lib/consent';

export const GUIDE_PATH = '/vodic/cijena-web-stranice';

// Pages where someone may be shopping for a website. Not the homepage (its scroll scenes own the
// screen), not checkout, auth, admin or account pages.
const ELIGIBLE = (path: string) => path === '/services' || path === '/marketplace' || path === '/blog' || path.startsWith('/blog/');

const DELAY_MS = 15_000;          // "interested but undecided"
const EXIT_MIN_MS = 4_000;        // exit intent counts only after a short read
const SNOOZE_MS = 14 * 24 * 3600 * 1000;
const KEY = 'cenner_guide_popup'; // 'done' after a signup, or the time it was closed
const SESSION_KEY = 'cenner_guide_popup_seen';

const read = (store: Storage | undefined, key: string) => { try { return store?.getItem(key) ?? null; } catch { return null; } };
const write = (store: Storage | undefined, key: string, value: string) => { try { store?.setItem(key, value); } catch { /* private mode */ } };
const local = () => (typeof window === 'undefined' ? undefined : window.localStorage);
const session = () => (typeof window === 'undefined' ? undefined : window.sessionStorage);

const blocked = () => {
  const v = read(local(), KEY);
  if (v === 'done') return true;
  if (v && Date.now() - Number(v) < SNOOZE_MS) return true;
  return read(session(), SESSION_KEY) === '1';
};

/**
 * Email capture for the price guide (pages/PriceGuide.tsx): a corner card, not a blocking modal,
 * shown once per visit to signed-out visitors after DELAY_MS on an eligible page, or earlier when
 * the mouse leaves through the top of the window. The guide opens right away after the signup;
 * the server also emails the link (feature 'vodic-web-stranica' on /notify-launch).
 */
const GuidePopup: React.FC = () => {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();
  const { lang } = useLanguage();
  const tx = (hr: string, en: string) => (lang === 'HR' ? hr : en);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [consentOpen, setConsentOpen] = useState(() => isConsentPending());
  const shownRef = useRef(false);

  // Wait for the cookie banner: two dialogs at once is the worst first impression.
  useEffect(() => {
    const onChange = () => setConsentOpen(isConsentPending());
    window.addEventListener('consent:changed', onChange);
    return () => window.removeEventListener('consent:changed', onChange);
  }, []);

  const armed = !open && !loading && !user && !consentOpen && ELIGIBLE(pathname) && pathname !== GUIDE_PATH;

  useEffect(() => {
    if (!armed || shownRef.current || blocked()) return;
    const start = Date.now();
    const show = () => {
      if (shownRef.current || blocked()) return;
      shownRef.current = true;
      write(session(), SESSION_KEY, '1');
      setOpen(true);
    };
    const timer = window.setTimeout(show, DELAY_MS);
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0 && Date.now() - start >= EXIT_MIN_MS) show();
    };
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.clearTimeout(timer);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [armed, pathname]);

  // Leaving for an ineligible page (e.g. signing in) puts it away without counting as a close.
  useEffect(() => {
    if (open && (!ELIGIBLE(pathname) || user)) setOpen(false);
  }, [pathname, user, open]);

  const close = () => {
    if (status !== 'success') write(local(), KEY, String(Date.now()));
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading' || !email.trim()) return;
    setStatus('loading');
    try {
      await API.notifyLaunch(email.trim(), 'vodic-web-stranica');
      write(local(), KEY, 'done');
      setStatus('success');
      // Google Consent Mode decides what this may store; without analytics consent it is cookieless.
      (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'generate_lead', { lead_source: 'guide_popup' });
    } catch {
      setStatus('error');
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="fixed inset-x-3 bottom-3 z-[110] border-2 border-ink bg-white p-5 font-text text-ink shadow-[6px_6px_0_0_#0b0c0e] animate-in fade-in slide-in-from-bottom-4 duration-300 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[24rem] motion-reduce:animate-none"
    >
      <button
        type="button"
        onClick={close}
        aria-label={tx('Zatvori', 'Close')}
        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center text-ink/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-sky"
      >
        <X size={18} />
      </button>

      {status === 'success' ? (
        <div role="status">
          <p className="mb-2 flex items-center gap-2 font-display text-[15px] font-bold text-leaf">
            <CheckCircle2 size={16} /> {tx('Vodič je tvoj.', 'The guide is yours.')}
          </p>
          <p className="mb-4 text-[0.95rem] text-ink/80">
            {tx('Poslali smo ti i poveznicu na e-mail, da ga lako pronađeš kasnije.', 'We also emailed you the link so you can find it later.')}
          </p>
          <Link
            to={GUIDE_PATH}
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 bg-sky py-3 font-display text-[15px] font-bold text-white transition-colors hover:bg-ink"
          >
            {tx('Otvori vodič', 'Open the guide')} <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-2 pr-8 font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-sky">{tx('Besplatni vodič', 'Free guide')}</p>
          <h2 id={titleId} className="mb-2 pr-6 font-display text-[1.375rem] font-extrabold leading-tight tracking-[-0.02em]">
            {tx('Koliko košta web stranica?', 'What does a website cost?')}
          </h2>
          {/* Hidden on phones so the card stays a small strip at the bottom, not an interstitial. */}
          <p className="mb-4 hidden text-[0.95rem] leading-relaxed text-ink/80 sm:block">
            {tx(
              'Okvirne cijene u Hrvatskoj, 10 pitanja za developera i popis za provjeru prije nego što platiš. Jedna stranica, spremna za ispis.',
              'Typical prices in Croatia, 10 questions to ask a developer and a checklist before you pay. One printable page (in Croatian).',
            )}
          </p>
          <form onSubmit={submit} noValidate className="space-y-2.5">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
              placeholder={tx('tvoj@email.hr', 'you@email.com')}
              aria-label={tx('E-mail adresa', 'Email address')}
              disabled={status === 'loading'}
              className="w-full border-2 border-ink bg-white px-3 py-3 text-[16px] text-ink placeholder:text-slate focus:border-sky focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              className="flex w-full items-center justify-center gap-2 bg-sky py-3 font-display text-[15px] font-bold text-white transition-colors hover:bg-ink focus-visible:bg-ink focus-visible:outline-none disabled:opacity-50"
            >
              {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <>{tx('Pošalji mi vodič', 'Send me the guide')} <ArrowRight size={14} /></>}
            </button>
            {status === 'error' && (
              <p className="text-[13px] font-medium text-red-700">{tx('Provjeri e-mail adresu i pokušaj ponovno.', 'Check the email address and try again.')}</p>
            )}
            <p className="text-[12px] leading-snug text-slate">
              {tx('Šaljemo ti vodič i povremeno savjet o izradi weba. Odjava odgovorom na bilo koji naš e-mail. ', 'We send the guide and the occasional web tip. Reply to any of our emails to opt out. ')}
              <Link to="/privacy" className="underline hover:text-ink">{tx('Privatnost', 'Privacy')}</Link>
            </p>
          </form>
        </>
      )}
    </div>
  );
};

export default GuidePopup;
