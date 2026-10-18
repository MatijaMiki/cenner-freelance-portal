import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { API } from '../lib/api';
import { useT } from '../i18n';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

/**
 * The site's one message form (About's #kontakt and the Services quote request, #upit), in the
 * homepage's look: paper fields with ink borders. `subjects` are the choices offered; `subject`
 * sets the chosen one from outside (a service's "Request a quote" picks its own).
 */
const ContactForm: React.FC<{ subjects: string[]; pick?: { index: number; n: number }; idPrefix: string; messagePlaceholder?: string }> = ({
  subjects, pick, idPrefix, messagePlaceholder,
}) => {
  const t = useT();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [idx, setIdx] = useState(pick?.index ?? 0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [needCaptcha, setNeedCaptcha] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<number | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  // a service's "Request a quote" picks its own subject (every click, even the same one again)
  useEffect(() => { if (pick) setIdx(pick.index); }, [pick?.n]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (status === 'sent') doneRef.current?.focus(); }, [status]);

  // reCAPTCHA v2, when the site has a key (index.html loads the script)
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY || !box.current) return;
    const render = () => {
      if (!box.current || widget.current !== null || !window.grecaptcha?.render) return;
      widget.current = window.grecaptcha.render(box.current, {
        sitekey: RECAPTCHA_SITE_KEY,
        callback: (tk: string) => { setToken(tk); setNeedCaptcha(false); },
        'expired-callback': () => setToken(null),
        'error-callback': () => setToken(null),
      });
    };
    if (window.grecaptcha?.render) render();
    else (window as any)._onRecaptchaReady = render;
  }, []);

  const resetCaptcha = () => {
    if (widget.current !== null && window.grecaptcha?.reset) window.grecaptcha.reset(widget.current);
    setToken(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (RECAPTCHA_SITE_KEY && !token) { setNeedCaptcha(true); return; }
    setStatus('sending');
    setError('');
    try {
      await API.contact({ name: name.trim(), email: email.trim(), subject: subjects[idx] ?? subjects[0], message: message.trim() });
      setStatus('sent');
      setName(''); setEmail(''); setMessage('');
      resetCaptcha();
    } catch (err: any) {
      setStatus('error');
      setError(err?.message || t('Failed to send message. Please try again.'));
      resetCaptcha();
    }
  };

  const field = 'w-full border-2 border-ink bg-white px-4 py-3 font-text text-[1rem] text-ink placeholder:text-slate focus:outline-none focus-visible:shadow-[4px_4px_0_#0b0c0e]';
  const label = 'mb-2 block font-display text-[15px] font-bold';

  // one live region, mounted in every state, so the result is announced
  const live = <div role="status" aria-live="polite" className="sr-only">{status === 'sent' ? t("Message sent. We'll reply by email.") : ''}</div>;

  if (status === 'sent') {
    return (
      <>
        {live}
        <div ref={doneRef} tabIndex={-1} className="flex items-start gap-3 border-2 border-ink bg-brand-green p-6 font-display text-[1.125rem] font-bold outline-none">
          <CheckCircle size={22} className="mt-0.5 shrink-0" />
          <span>{t("Message sent. We'll reply by email.")}</span>
        </div>
      </>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {live}
      {status === 'error' && (
        <p role="alert" className="flex items-center gap-2 border-2 border-[#9b1c1c] bg-[#fdecec] px-4 py-3 text-[0.95rem] text-[#9b1c1c]">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-name`} className={label}>{t('Your Name')}</label>
          <input id={`${idPrefix}-name`} required type="text" autoComplete="name" value={name} onChange={e => setName(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-email`} className={label}>{t('Email Address')}</label>
          <input id={`${idPrefix}-email`} required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={field} />
        </div>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-subject`} className={label}>{t('Subject')}</label>
        <select id={`${idPrefix}-subject`} value={idx} onChange={e => setIdx(+e.target.value)} className={field}>
          {subjects.map((s, i) => <option key={i} value={i}>{s}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-message`} className={label}>{t('Message')}</label>
        <textarea id={`${idPrefix}-message`} required rows={6} value={message} onChange={e => setMessage(e.target.value)} placeholder={messagePlaceholder} className={`${field} resize-y`} />
      </div>
      {RECAPTCHA_SITE_KEY && (
        <div>
          <div ref={box} />
          {needCaptcha && <p className="mt-2 text-[0.95rem] text-[#9b1c1c]">{t('Please confirm you are not a robot.')}</p>}
        </div>
      )}
      <button type="submit" disabled={status === 'sending'} className="cn-press inline-flex items-center gap-2.5 border-2 border-ink bg-sky px-7 py-4 font-display text-[15px] font-bold text-white transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#0b0c0e] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60">
        {status === 'sending' ? <Loader2 size={17} className="animate-spin" /> : null}
        {status === 'sending' ? t('Sending...') : t('Send Message')}
        {status !== 'sending' && <ArrowRight size={17} />}
      </button>
    </form>
  );
};

export default ContactForm;
