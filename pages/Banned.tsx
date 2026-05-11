import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Send, Loader2, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import { API } from '../lib/api';

interface BanInfo {
  banned: boolean;
  banId?: string;
  reason?: string;
  route?: string;
  canAppeal?: boolean;
  appealedAt?: string;
  createdAt?: string;
}

const fmt = (iso?: string) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString('hr-HR'); } catch { return ''; }
};

const Banned: React.FC = () => {
  const [ban, setBan] = useState<BanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [appealText, setAppealText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    API.getBanStatus()
      .then(setBan)
      .catch(() => setBan({ banned: false }))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ban?.banId || !appealText.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await API.submitBanAppeal(ban.banId, appealText.trim());
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Could not submit appeal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black pt-12 pb-24">
      <SEO title="Account restricted" canonical="/banned" noIndex />

      <div className="max-w-2xl mx-auto px-4 lg:px-12">
        {loading && <div className="text-gray-500 text-sm">Loading…</div>}

        {!loading && !ban?.banned && (
          <div className="bg-brand-grey border border-white/10 rounded-3xl p-10 text-center">
            <CheckCircle2 size={36} className="mx-auto text-brand-green mb-4" />
            <h1 className="text-3xl font-black text-white tracking-tight mb-3">You're not restricted</h1>
            <p className="text-gray-400 mb-6">Your access is normal. Head back to the site.</p>
            <Link to="/" className="inline-block px-6 py-3 bg-brand-pink text-white rounded-xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all">
              Go home
            </Link>
          </div>
        )}

        {!loading && ban?.banned && (
          <div className="space-y-6">
            <div className="bg-brand-grey border border-red-500/30 rounded-3xl p-10">
              <ShieldAlert size={36} className="text-red-400 mb-4" />
              <h1 className="text-3xl font-black text-white tracking-tight mb-3">Posting restricted</h1>
              <p className="text-gray-400 leading-relaxed mb-6">
                Our automated system detected content from your IP that looked like an attempt to inject code or scripts.
                You can no longer post in the community, send messages, or use the support chat from this connection until a human reviews your case.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border-t border-white/10 pt-5">
                {ban.reason && (
                  <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Reason</div>
                    <div className="text-gray-300">{ban.reason}</div>
                  </div>
                )}
                {ban.createdAt && (
                  <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">When</div>
                    <div className="text-gray-300">{fmt(ban.createdAt)}</div>
                  </div>
                )}
                {ban.route && (
                  <div className="sm:col-span-2">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Triggered on</div>
                    <div className="text-gray-300 font-mono text-xs">{ban.route}</div>
                  </div>
                )}
              </div>
            </div>

            {submitted ? (
              <div className="bg-brand-grey border border-brand-green/30 rounded-3xl p-10 text-center">
                <CheckCircle2 size={32} className="mx-auto text-brand-green mb-4" />
                <h2 className="text-2xl font-black text-white mb-2">Appeal submitted</h2>
                <p className="text-gray-400">
                  A human from our team will review and decide within a few business days.
                  You'll keep the same status here until they do.
                </p>
              </div>
            ) : ban.appealedAt && !ban.canAppeal ? (
              <div className="bg-brand-grey border border-white/10 rounded-3xl p-10">
                <h2 className="text-xl font-black text-white mb-2">Appeal under review</h2>
                <p className="text-gray-400">
                  You submitted an appeal on {fmt(ban.appealedAt)}. A human will review and decide.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-brand-grey border border-white/10 rounded-3xl p-10 space-y-4">
                <div>
                  <h2 className="text-xl font-black text-white mb-2">Appeal this decision</h2>
                  <p className="text-gray-500 text-sm">
                    If this was a mistake — for example you were pasting code in good faith — explain what happened
                    and an admin will review. One appeal per ban.
                  </p>
                </div>
                <textarea
                  required
                  rows={6}
                  maxLength={2000}
                  placeholder="Tell us what you were trying to do and why this was flagged in error."
                  className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-brand-green resize-none"
                  value={appealText}
                  onChange={e => setAppealText(e.target.value)}
                />
                {error && <div className="text-red-400 text-sm">{error}</div>}
                <button
                  type="submit"
                  disabled={!appealText.trim() || submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-pink text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 hover:scale-[1.02] transition-all"
                >
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  Submit appeal
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Banned;
