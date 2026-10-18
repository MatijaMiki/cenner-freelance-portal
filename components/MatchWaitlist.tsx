import React, { useId, useState } from 'react';
import { ArrowRight, Bell, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { useT } from '../i18n';
import { API } from '../lib/api';

/**
 * AI job matching is not built yet; this is its waitlist, on the Marketplace (it was the /match
 * page, which now lands here at #ai-matching). One email when it ships.
 */
const MatchWaitlist: React.FC<{ id?: string; className?: string }> = ({ id, className = '' }) => {
  const t = useT();
  const titleId = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading' || !email.trim()) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      await API.notifyLaunch(email.trim(), 'job-matching');
      setStatus('success');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message || t('Something went wrong. Please try again.'));
    }
  };

  return (
    <section id={id} aria-labelledby={titleId} className={`border-2 border-ink bg-white p-6 ${className}`}>
      <span className="mb-4 inline-flex items-center gap-1.5 bg-sky px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-white">
        <Zap size={10} />
        {t('Coming Soon')}
      </span>
      <h4 id={titleId} className="mb-2 font-display text-[1.375rem] font-extrabold tracking-[-0.02em] text-ink">{t('AI Job Matching')}</h4>
      <p className="mb-5 text-[0.95rem] leading-relaxed text-ink/80">
        {t("We're building an AI matching engine that connects freelancers with the right jobs in seconds. It isn't ready yet, but it will be soon.")}
      </p>
      {status === 'success' ? (
        <div role="status" className="flex items-start gap-2.5 border-2 border-leaf bg-leaf/10 px-4 py-3.5 font-display text-[14px] font-bold text-leaf">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{t("You're on the list. We'll email you when it's live.")}</span>
        </div>
      ) : (
        <form onSubmit={handleNotify} noValidate className="space-y-2.5">
          <div className="relative">
            <Bell className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate" size={14} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
              placeholder={t('Enter email address...')}
              aria-label={t('Email Address')}
              disabled={status === 'loading'}
              className="w-full border-2 border-ink bg-white py-3 pl-9 pr-3 text-[15px] text-ink placeholder:text-slate focus:border-sky focus:outline-none disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading' || !email.trim()}
            className="flex w-full items-center justify-center gap-2 bg-sky py-3 font-display text-[15px] font-bold text-white transition-colors hover:bg-ink focus-visible:bg-ink focus-visible:outline-none disabled:opacity-50"
          >
            {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <><span>{t('Notify Me')}</span><ArrowRight size={14} /></>}
          </button>
          {status === 'error' && <p className="text-[13px] font-medium text-red-700">{errorMsg}</p>}
          <p className="text-[13px] text-slate">{t('No spam. One email when it ships.')}</p>
        </form>
      )}
    </section>
  );
};

export default MatchWaitlist;
