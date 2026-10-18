import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MailCheck, AlertCircle, Loader2 } from 'lucide-react';
import { API } from '../lib/api';
import SEO from '../components/SEO';
import { useLanguage } from '../i18n';

/** The link in the "Confirm your email address" mail lands here (/verify-email?token=...). */
const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const { lang } = useLanguage();
  const isHr = lang === 'HR';
  const token = new URLSearchParams(location.search || location.hash?.split('?')[1]).get('token') || '';
  const [state, setState] = useState<'working' | 'done' | 'error'>(token ? 'working' : 'error');
  const [error, setError] = useState('');
  const sent = useRef(false);

  useEffect(() => {
    if (!token || sent.current) return;   // tokens are single-use: never send one twice (StrictMode runs effects twice)
    sent.current = true;
    API.verifyEmail(token)
      .then(() => setState('done'))
      .catch((err: any) => { setError(err?.message || ''); setState('error'); });
  }, [token]);

  const card = 'w-full max-w-md border-2 border-ink bg-white p-8 text-center shadow-[6px_6px_0_0_#0b0c0e]';
  const button = 'inline-flex items-center justify-center border-2 border-ink bg-sky px-7 py-3 font-display text-[15px] font-bold text-white transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#0b0c0e]';

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <SEO title={isHr ? 'Potvrda e-mail adrese' : 'Verify email'} noIndex />
      <div className={card}>
        {state === 'working' && (
          <>
            <Loader2 size={32} className="mx-auto mb-5 animate-spin text-ink" />
            <h1 className="font-display text-2xl font-black text-ink">{isHr ? 'Potvrđujemo tvoju adresu…' : 'Confirming your address…'}</h1>
          </>
        )}
        {state === 'done' && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border-2 border-ink bg-leaf/10 text-leaf"><MailCheck size={28} /></div>
            <h1 className="mb-2 font-display text-2xl font-black text-ink">{isHr ? 'E-mail je potvrđen' : 'Email confirmed'}</h1>
            <p className="mb-7 text-slate">{isHr ? 'Hvala! Tvoja adresa je potvrđena.' : 'Thanks, your address is confirmed.'}</p>
            <Link to="/profile" className={button}>{isHr ? 'Otvori profil' : 'Open your profile'}</Link>
          </>
        )}
        {state === 'error' && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border-2 border-ink bg-red-50 text-red-700"><AlertCircle size={28} /></div>
            <h1 className="mb-2 font-display text-2xl font-black text-ink">{isHr ? 'Poveznica ne vrijedi' : 'This link does not work'}</h1>
            <p className="mb-7 text-slate">
              {error || (isHr
                ? 'Poveznica je istekla ili je već iskorištena. Prijavi se i zatraži novu iz profila.'
                : 'The link has expired or was already used. Sign in and request a new one from your profile.')}
            </p>
            <Link to="/auth" className={button}>{isHr ? 'Prijava' : 'Sign in'}</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
