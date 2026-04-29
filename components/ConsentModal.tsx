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
    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
      disabled ? 'bg-brand-green/40 cursor-not-allowed' : checked ? 'bg-brand-green' : 'bg-white/10'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0'
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
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-brand-grey border border-white/10 rounded-3xl shadow-2xl p-7 sm:p-8 animate-in zoom-in-95 duration-300">
        {reason !== 'register' && (
          <button
            onClick={skip}
            aria-label={isHr ? 'Zatvori' : 'Close'}
            className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <X size={18} />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center">
            <Cookie size={18} className="text-brand-green" />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowLangs(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-white/10 rounded-lg text-[10px] text-gray-400 hover:text-white hover:border-white/20 font-bold uppercase tracking-widest"
            >
              <Globe size={11} />
              <span>{lang}</span>
            </button>
            {showLangs && (
              <div className="absolute top-full mt-2 left-0 bg-brand-grey border border-white/10 rounded-xl overflow-hidden shadow-xl w-36 z-10">
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setShowLangs(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${
                      lang === l.code ? 'text-brand-green bg-brand-green/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <h2 className="text-white text-xl font-black tracking-tight mb-2">{title}</h2>
        <p className="text-gray-400 text-xs leading-relaxed mb-6">{subtitle}</p>

        {/* Toggles */}
        <div className="space-y-3 mb-6">
          {/* Terms */}
          <div className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
            <FileText size={16} className="text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-white text-xs font-bold">
                  {isHr ? 'Uvjeti korištenja' : 'Terms of Service'}
                  <span className="ml-1.5 text-[9px] text-brand-pink font-black uppercase tracking-widest">
                    {isHr ? 'Obavezno' : 'Required'}
                  </span>
                </p>
                <Toggle checked={state.tos === 'accepted'} onChange={v => toggle('tos', v)} />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {isHr
                  ? <>Slažem se s <Link to="/terms" className="text-brand-green hover:underline" onClick={skip}>Uvjetima korištenja</Link> Cennera.</>
                  : <>I agree to the Cenner <Link to="/terms" className="text-brand-green hover:underline" onClick={skip}>Terms of Service</Link>.</>}
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
            <Cookie size={16} className="text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-white text-xs font-bold">
                  {isHr ? 'Kolačići' : 'Cookies'}
                  <span className="ml-1.5 text-[9px] text-brand-pink font-black uppercase tracking-widest">
                    {isHr ? 'Obavezno' : 'Required'}
                  </span>
                </p>
                <Toggle checked={state.cookies === 'accepted'} onChange={v => toggle('cookies', v)} />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {isHr
                  ? <>Koristimo kolačiće za temeljnu funkcionalnost i analitiku. <Link to="/cookies" className="text-brand-green hover:underline" onClick={skip}>Saznaj više</Link>.</>
                  : <>We use cookies for core functionality and analytics. <Link to="/cookies" className="text-brand-green hover:underline" onClick={skip}>Learn more</Link>.</>}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
            <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-white text-xs font-bold">
                  {isHr ? 'Lokacija' : 'Location'}
                  <span className="ml-1.5 text-[9px] text-gray-500 font-black uppercase tracking-widest">
                    {isHr ? 'Neobavezno' : 'Optional'}
                  </span>
                </p>
                <Toggle checked={state.location === 'accepted'} onChange={v => toggle('location', v)} />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
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
              className="px-4 py-3 text-xs font-bold text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-colors"
            >
              {isHr ? 'Preskoči' : 'Skip'}
            </button>
          )}
          <button
            onClick={savePreferences}
            disabled={reason === 'register' && !canRegister}
            className={`flex-1 px-4 py-3 text-xs font-black border rounded-xl transition-colors uppercase tracking-widest ${
              reason === 'register' && !canRegister
                ? 'border-white/5 text-gray-600 cursor-not-allowed'
                : 'border-white/10 text-white hover:border-white/30'
            }`}
          >
            {isHr ? 'Spremi' : 'Save'}
          </button>
          <button
            onClick={acceptAll}
            className="flex-1 px-4 py-3 text-xs font-black bg-brand-green text-brand-black rounded-xl hover:scale-[1.02] transition-transform uppercase tracking-widest"
          >
            {isHr ? 'Prihvati sve' : 'Accept all'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
