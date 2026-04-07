import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, Globe } from 'lucide-react';
import { useLanguage } from '../i18n';

const CONSENT_KEY = 'cenner_cookie_consent';
const LANGS = [
  { code: 'HR', label: 'Hrvatski' },
  { code: 'EN', label: 'English' },
  { code: 'DE', label: 'Deutsch' },
  { code: 'IT', label: 'Italiano' },
  { code: 'FR', label: 'Français' },
];

const CookieBanner: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [showLangs, setShowLangs] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      // Small delay so it doesn't flash instantly on first paint
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[300] p-4 sm:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-brand-grey border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">

        {/* Icon */}
        <div className="shrink-0 w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center">
          <Cookie size={20} className="text-brand-green" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold mb-1">
            {lang === 'HR' ? 'Koristimo kolačiće' : 'We use cookies'}
          </p>
          <p className="text-gray-400 text-xs leading-relaxed">
            {lang === 'HR'
              ? <>Koristimo kolačiće za poboljšanje iskustva. <Link to="/cookies" className="text-brand-green hover:underline" onClick={accept}>Saznaj više</Link></>
              : <>We use cookies to improve your experience. <Link to="/cookies" className="text-brand-green hover:underline" onClick={accept}>Learn more</Link></>
            }
          </p>
        </div>

        {/* Language picker */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowLangs(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white hover:border-white/20 transition-colors"
          >
            <Globe size={13} />
            <span className="font-bold">{lang}</span>
          </button>
          {showLangs && (
            <div className="absolute bottom-full mb-2 right-0 bg-brand-grey border border-white/10 rounded-xl overflow-hidden shadow-xl w-36">
              {LANGS.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setShowLangs(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                    lang === l.code ? 'text-brand-green bg-brand-green/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white border border-white/10 rounded-xl transition-colors"
          >
            {lang === 'HR' ? 'Odbij' : 'Decline'}
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 text-xs font-black bg-brand-green text-brand-black rounded-xl hover:scale-105 transition-all"
          >
            {lang === 'HR' ? 'Prihvati' : 'Accept'}
          </button>
          <button onClick={decline} className="p-1.5 text-gray-600 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
