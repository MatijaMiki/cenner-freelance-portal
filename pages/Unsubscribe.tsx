import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MailX, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { API } from '../lib/api';
import SEO from '../components/SEO';
import { useLanguage } from '../i18n';

/**
 * The "Unsubscribe" link in marketing emails lands here (/unsubscribe?token=...).
 * Opening the link only checks the token. Nothing changes until the person presses the button,
 * because mail scanners and link previewers open every URL in an email and must not opt anyone out.
 */
const Unsubscribe: React.FC = () => {
  const location = useLocation();
  const { lang } = useLanguage();
  const isHr = lang === 'HR';
  // Read the token once, then take it out of the URL so it doesn't sit in history or analytics.
  const [token] = useState(() => new URLSearchParams(location.search || location.hash?.split('?')[1]).get('token') || '');
  const [state, setState] = useState<'checking' | 'ready' | 'working' | 'done' | 'error'>(token ? 'checking' : 'error');
  const [failed, setFailed] = useState(false);
  const checked = useRef(false);

  useEffect(() => {
    if (!token || checked.current) return;   // StrictMode runs effects twice
    checked.current = true;
    window.history.replaceState(window.history.state, '', window.location.pathname);
    API.unsubscribeCheck(token)
      .then(() => setState('ready'))
      .catch(() => setState('error'));
  }, [token]);

  const confirm = () => {
    setState('working');
    setFailed(false);
    API.unsubscribe(token)
      .then(() => setState('done'))
      .catch(() => { setFailed(true); setState('ready'); });
  };

  const card = 'w-full max-w-md border-2 border-ink bg-white p-8 text-center shadow-[6px_6px_0_0_#0b0c0e]';
  const button = 'inline-flex items-center justify-center border-2 border-ink bg-sky px-7 py-3 font-display text-[15px] font-bold text-white transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#0b0c0e] disabled:opacity-60';

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <SEO title={isHr ? 'Odjava s e-mail obavijesti' : 'Unsubscribe'} noIndex />
      <div className={card}>
        {state === 'checking' && (
          <>
            <Loader2 size={32} className="mx-auto mb-5 animate-spin text-ink" />
            <h1 className="font-display text-2xl font-black text-ink">{isHr ? 'Provjeravamo poveznicu…' : 'Checking your link…'}</h1>
          </>
        )}
        {(state === 'ready' || state === 'working') && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border-2 border-ink bg-sky/10 text-sky"><MailX size={28} /></div>
            <h1 className="mb-2 font-display text-2xl font-black text-ink">{isHr ? 'Odjava s marketinških e-mailova' : 'Unsubscribe from marketing emails'}</h1>
            <p className="mb-7 text-slate">
              {isHr
                ? 'Više ti nećemo slati novosti i promocije. Poruke o tvom računu, narudžbama i sigurnosti i dalje stižu.'
                : 'You will stop getting our news and promotions. Messages about your account, orders and security still arrive.'}
            </p>
            {failed && (
              <p className="mb-4 text-sm text-red-700">
                {isHr ? 'Nešto je pošlo po krivu. Pokušaj ponovno.' : 'Something went wrong. Please try again.'}
              </p>
            )}
            <button type="button" onClick={confirm} disabled={state === 'working'} className={button}>
              {state === 'working' && <Loader2 size={16} className="mr-2 animate-spin" />}
              {isHr ? 'Odjavi me' : 'Unsubscribe me'}
            </button>
          </>
        )}
        {state === 'done' && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border-2 border-ink bg-leaf/10 text-leaf"><CheckCircle2 size={28} /></div>
            <h1 className="mb-2 font-display text-2xl font-black text-ink">{isHr ? 'Odjavljen/a si' : 'You are unsubscribed'}</h1>
            <p className="mb-7 text-slate">
              {isHr
                ? 'Gotovo. Marketinške e-mailove više nećeš primati.'
                : 'Done. You will no longer receive marketing emails from us.'}
            </p>
            <Link to="/" className={button}>{isHr ? 'Na početnu' : 'Back to Cenner'}</Link>
          </>
        )}
        {state === 'error' && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border-2 border-ink bg-red-50 text-red-700"><AlertCircle size={28} /></div>
            <h1 className="mb-2 font-display text-2xl font-black text-ink">{isHr ? 'Poveznica ne vrijedi' : 'This link does not work'}</h1>
            <p className="mb-7 text-slate">
              {isHr
                ? 'Poveznica je neispravna ili je istekla. Otvori najnoviji e-mail od nas i klikni odjavu iz njega.'
                : 'The link is invalid or has expired. Open the latest email from us and use its unsubscribe link.'}
            </p>
            <Link to="/" className={button}>{isHr ? 'Na početnu' : 'Back to Cenner'}</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
