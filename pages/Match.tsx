
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Bell, CheckCircle2, Loader2 } from 'lucide-react';
import NeuralBackground from '../components/NeuralBackground';
import SEO from '../components/SEO';
import { useT } from '../i18n';
import { API } from '../lib/api';

const Match: React.FC = () => {
  const t = useT();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
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
    <div className="relative min-h-screen">
      <SEO
        title={t('Job Matching')}
        canonical="/match"
        description={t('AI-powered job matching is coming soon to Cenner. Sign up to be the first to try it.')}
        noIndex
      />
      <NeuralBackground parallax={false} />

      <section className="relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-brand-pink/30 bg-brand-pink/5 text-brand-pink text-[10px] font-black uppercase tracking-[0.25em]">
          <Zap size={12} />
          <span>{t('In Development')}</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[0.95]">
          {t('AI Job Matching')}
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-green via-brand-pink to-brand-green bg-[length:200%_auto] animate-gradient">
            {t('Coming Soon')}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed mb-10">
          {t("We're building an AI matching engine that connects freelancers with the right jobs in seconds. It isn't ready yet — but it will be soon.")}
        </p>

        {/* Notify-me waitlist form */}
        <div className="max-w-md mx-auto mb-12">
          {status === 'success' ? (
            <div
              role="status"
              className="flex items-center justify-center gap-3 px-6 py-5 rounded-2xl bg-brand-green/10 border border-brand-green/30 text-brand-green font-bold text-sm"
            >
              <CheckCircle2 size={18} />
              <span>{t("You're on the list. We'll email you when it's live.")}</span>
            </div>
          ) : (
            <form onSubmit={handleNotify} noValidate>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Bell className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                    placeholder={t('Enter email address...')}
                    aria-label={t('Email Address')}
                    disabled={status === 'loading'}
                    className="w-full bg-brand-black/80 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-green transition-colors disabled:opacity-60"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading' || !email.trim()}
                  className="px-6 py-3.5 bg-brand-green text-brand-black font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(74,222,128,0.18)] min-w-[140px]"
                >
                  {status === 'loading' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>{t('Notify Me')}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
              {status === 'error' && (
                <p className="mt-3 text-xs text-red-400 font-medium">{errorMsg}</p>
              )}
              <p className="mt-3 text-[11px] text-gray-600">{t('No spam. One email when it ships.')}</p>
            </form>
          )}
        </div>

        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-brand-green text-sm font-bold transition-colors"
        >
          <span>{t('Browse Marketplace in the meantime')}</span>
          <ArrowRight size={14} />
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20">
          {[
            { label: t('AI Matching'), desc: t('Project-to-talent pairing using semantic search.') },
            { label: t('Auto-Apply'), desc: t('One click to send your profile to the best fits.') },
            { label: t('Smart Alerts'), desc: t('Instant pings when a great match goes live.') },
          ].map((item) => (
            <div
              key={item.label}
              className="p-6 rounded-2xl border border-white/5 bg-brand-grey/30 backdrop-blur-sm text-left"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green mb-2">{item.label}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Match;
