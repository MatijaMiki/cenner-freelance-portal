import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, FileText, MapPin, X, Globe } from 'lucide-react';
import { useLanguage, useT } from '../i18n';
import {
  getConsent,
  setConsent,
  isConsentPending,
  type ConsentState,
} from '../lib/consent';

const LANGS = [
  { code: 'HR', label: 'Hrvatski' },
  { code: 'EN', label: 'English' },
  { code: 'DE', label: 'Deutsch' },
  { code: 'IT', label: 'Italiano' },
  { code: 'FR', label: 'Français' },
];

type Reason = 'first-visit' | 'register' | 'manual';

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    aria-pressed={checked}
    disabled={disabled}
    className={`relative h-6 w-11 shrink-0 border-2 border-ink transition-colors ${
      disabled ? 'cursor-not-allowed bg-leaf/40' : checked ? 'bg-ink' : 'bg-white'
    }`}
  >
    <span
      className={`absolute left-0.5 top-0.5 h-4 w-4 transition-transform ${
        checked ? 'translate-x-5 bg-white' : 'translate-x-0 bg-ink'
      }`}
    />
  </button>
);

const ConsentModal: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason>('first-visit');
  const [showLangs, setShowLangs] = useState(false);
  const [state, setState] = useState<ConsentState>(getConsent());

  // Auto-open on first visit if any consent is pending
  useEffect(() => {
    if (isConsentPending()) {
      const t = setTimeout(() => setOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, []);

  // Listen for external open requests
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setReason((detail?.reason as Reason) ?? 'manual');
      setState(getConsent());
      setOpen(true);
    };
    window.addEventListener('consent:open', handler);
    return () => window.removeEventListener('consent:open', handler);
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [open]);

  if (!open) return null;

  const toggle = (key: keyof ConsentState, value: boolean) => {
    setState(s => ({ ...s, [key]: value ? 'accepted' : 'declined' }));
  };

  const acceptAll = () => {
    const all: ConsentState = { tos: 'accepted', cookies: 'accepted', location: 'accepted' };
    setState(all);
    setConsent(all);
    setOpen(false);
    if (all.location === 'accepted' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {}, { timeout: 10000 });
    }
  };

  const savePreferences = () => {
    setConsent(state);
    setOpen(false);
    if (state.location === 'accepted' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {}, { timeout: 10000 });
    }
  };

  const skip = () => {
    // Skipping is allowed on first-visit; not allowed at register-gate (forced)
    setOpen(false);
  };

  const isHr = lang === 'HR';
  const title = reason === 'register'
    ? (isHr ? 'Potrebna je suglasnost za registraciju' : 'Consent required to register')
    : (isHr ? 'Vaše postavke privatnosti' : 'Your privacy preferences');
  const subtitle = reason === 'register'
    ? (isHr
        ? 'Za izradu računa morate prihvatiti Uvjete korištenja i kolačiće.'
        : 'To create an account, please accept the Terms of Service and Cookies.')
    : (isHr
        ? 'Vi odlučujete što dijelite. Ove postavke možete promijeniti u bilo kojem trenutku.'
        : 'You decide what to share. You can change these settings at any time.');

  const canRegister = state.tos === 'accepted' && state.cookies === 'accepted';

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-ink/55 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="relative w-full max-h-[92vh] max-w-md overflow-y-auto border-2 border-ink bg-paper p-6 text-ink shadow-[6px_6px_0_0_#0b0c0e] sm:p-8 animate-in zoom-in-95 duration-300">
        {reason !== 'register' && (
          <button
            onClick={skip}
            aria-label={isHr ? 'Zatvori' : 'Close'}
            className="absolute top-4 right-4 border-2 border-transparent p-1 text-slate transition-colors hover:border-ink hover:text-ink"
          >
            <X size={18} />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-white">
            <Cookie size={18} className="text-ink" />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowLangs(v => !v)}
              className="flex items-center gap-1.5 border-2 border-ink bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-ink hover:bg-paper2"
            >
              <Globe size={11} />
              <span>{lang}</span>
            </button>
            {showLangs && (
              <div className="absolute left-0 top-full z-10 mt-2 w-36 overflow-hidden border-2 border-ink bg-white shadow-[3px_3px_0_0_#0b0c0e]">
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setShowLangs(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${
                      lang === l.code ? 'bg-ink text-white' : 'text-ink hover:bg-paper2'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <h2 className="mb-2 text-xl font-black tracking-tight text-ink">{title}</h2>
        <p className="mb-6 text-xs leading-relaxed text-slate">{subtitle}</p>

        {/* Toggles */}
        <div className="space-y-3 mb-6">
          {/* Terms */}
          <div className="flex items-start gap-3 border-2 border-ink bg-white p-3">
            <FileText size={16} className="mt-0.5 shrink-0 text-ink" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-xs font-bold text-ink">
                  {isHr ? 'Uvjeti korištenja' : 'Terms of Service'}
                  <span className="ml-1.5 text-[9px] font-black text-sky uppercase tracking-widest">
                    {isHr ? 'Obavezno' : 'Required'}
                  </span>
                </p>
                <Toggle checked={state.tos === 'accepted'} onChange={v => toggle('tos', v)} />
              </div>
              <p className="text-[11px] leading-relaxed text-slate">
                {isHr
                  ? <>Slažem se s <Link to="/terms" className="font-bold text-sky underline hover:no-underline" onClick={skip}>Uvjetima korištenja</Link> Cennera.</>
                  : <>I agree to the Cenner <Link to="/terms" className="font-bold text-sky underline hover:no-underline" onClick={skip}>Terms of Service</Link>.</>}
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div className="flex items-start gap-3 border-2 border-ink bg-white p-3">
            <Cookie size={16} className="mt-0.5 shrink-0 text-ink" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-xs font-bold text-ink">
                  {isHr ? 'Kolačići' : 'Cookies'}
                  <span className="ml-1.5 text-[9px] font-black text-sky uppercase tracking-widest">
                    {isHr ? 'Obavezno' : 'Required'}
                  </span>
                </p>
                <Toggle checked={state.cookies === 'accepted'} onChange={v => toggle('cookies', v)} />
              </div>
              <p className="text-[11px] leading-relaxed text-slate">
                {isHr
                  ? <>Koristimo kolačiće za temeljnu funkcionalnost i analitiku. <Link to="/cookies" className="font-bold text-sky underline hover:no-underline" onClick={skip}>Saznaj više</Link>.</>
                  : <>We use cookies for core functionality and analytics. <Link to="/cookies" className="font-bold text-sky underline hover:no-underline" onClick={skip}>Learn more</Link>.</>}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 border-2 border-ink bg-white p-3">
            <MapPin size={16} className="mt-0.5 shrink-0 text-ink" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-xs font-bold text-ink">
                  {isHr ? 'Lokacija' : 'Location'}
                  <span className="ml-1.5 text-[9px] font-black text-slate uppercase tracking-widest">
                    {isHr ? 'Neobavezno' : 'Optional'}
                  </span>
                </p>
                <Toggle checked={state.location === 'accepted'} onChange={v => toggle('location', v)} />
              </div>
              <p className="text-[11px] leading-relaxed text-slate">
                {isHr
                  ? 'Anonimno doprinosite mapi zajednice Cennera. Bez praćenja u stvarnom vremenu.'
                  : 'Contribute anonymously to the Cenner community heatmap. No real-time tracking.'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          {reason !== 'register' && (
            <button
              onClick={skip}
              className="border-2 border-ink bg-white px-4 py-3 text-xs font-bold text-ink transition-colors hover:bg-paper2"
            >
              {isHr ? 'Preskoči' : 'Skip'}
            </button>
          )}
          <button
            onClick={savePreferences}
            disabled={reason === 'register' && !canRegister}
            className={`flex-1 border-2 px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
              reason === 'register' && !canRegister
                ? 'cursor-not-allowed border-slate/40 bg-white text-slate/50'
                : 'border-ink bg-white text-ink hover:bg-paper2'
            }`}
          >
            {isHr ? 'Spremi' : 'Save'}
          </button>
          <button
            onClick={acceptAll}
            className="flex-1 border-2 border-ink bg-ink px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[3px_3px_0_0_#1b7a3e] transition-transform hover:-translate-y-0.5"
          >
            {isHr ? 'Prihvati sve' : 'Accept all'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
