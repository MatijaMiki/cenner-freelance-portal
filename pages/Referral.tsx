
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy, Crown, Medal, Gift, Sparkles, Copy, Check, Share2, Mail,
  Twitter, MessageCircle, Users, TrendingUp, Clock, PartyPopper, Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNotify } from '../contexts/NotifyContext';
import { API } from '../lib/api';
import SEO from '../components/SEO';

// ── Types (mirror the API response shapes) ──────────────────────────────────
interface ReferralCampaign {
  name: string;
  slug: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  awarded: boolean;
}
interface ReferralWin {
  place: number;
  enterpriseMonths: number;
  boostMonths: number;
  grantedAt: string;
  campaign: { name: string };
}
interface ReferralMe {
  code: string;
  shareUrl: string;
  referralCount: number;
  rank: number;
  totalParticipants: number;
  pendingBoostMonths: number;
  tier: string;
  subscriptionExpiresAt: string | null;
  campaign: ReferralCampaign | null;
  wins: ReferralWin[];
}
interface Leader {
  rank: number;
  name: string;
  referralCount: number;
}
interface Leaderboard {
  campaign: { name: string; endsAt: string; active: boolean } | null;
  leaders: Leader[];
}

// ── Hard-coded prize data (matches backend REFERRAL_PRIZES) ──────────────────
const PRIZES = [
  {
    place: 1,
    label: '1st Place',
    icon: Crown,
    enterprise: '12 months free Enterprise',
    boost: '12-month boost on a listing of your choice',
  },
  {
    place: 2,
    label: '2nd Place',
    icon: Trophy,
    enterprise: '6 months free Enterprise',
    boost: '12-month boost',
  },
  {
    place: 3,
    label: '3rd Place',
    icon: Medal,
    enterprise: '3 months free Enterprise',
    boost: '6-month boost',
  },
];

// ── Live countdown helper ────────────────────────────────────────────────────
function useCountdown(target?: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target) return null;
  const end = new Date(target).getTime();
  if (Number.isNaN(end)) return null;
  const diff = Math.max(0, end - now);
  return {
    ended: diff <= 0,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

const fmtDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
};

const Referral: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();
  const { listings } = useData();

  const [data, setData] = useState<ReferralMe | null>(null);
  const [board, setBoard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedListing, setSelectedListing] = useState('');
  const [claiming, setClaiming] = useState(false);

  const loadMe = () => API.getReferralMe().then((d) => setData(d as ReferralMe));

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      loadMe().catch(() => setData(null)),
      API.getReferralLeaderboard().then((b) => setBoard(b as Leaderboard)).catch(() => setBoard(null)),
    ]).finally(() => setLoading(false));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const campaign = data?.campaign ?? null;
  const countdown = useCountdown(campaign?.active ? campaign.endsAt : null);

  // The user's own listings — reused from DataContext (same filter Profile.tsx uses).
  const myListings = useMemo(
    () => (user ? listings.filter((l) => l.freelancerId === user.id) : []),
    [listings, user],
  );

  if (!user) return null;

  const shareUrl = data?.shareUrl || '';
  const shareMessage =
    'Join me on Cenner, the freelance platform. Sign up with my link and let\'s both win:';

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      navigator.share({ title: 'Refer & Win on Cenner', text: shareMessage, url: shareUrl }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const enc = encodeURIComponent;
  const waHref = `https://wa.me/?text=${enc(`${shareMessage} ${shareUrl}`)}`;
  const mailHref = `mailto:?subject=${enc('Join me on Cenner')}&body=${enc(`${shareMessage}\n\n${shareUrl}`)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${enc(shareMessage)}&url=${enc(shareUrl)}`;

  const handleClaim = async () => {
    if (!selectedListing || claiming) return;
    setClaiming(true);
    try {
      const res = await API.claimReferralBoost(selectedListing);
      notify.toast(`Boost applied: ${res.monthsApplied} month${res.monthsApplied === 1 ? '' : 's'} of visibility!`, 'success');
      setSelectedListing('');
      await loadMe().catch(() => {});
    } catch (err: any) {
      notify.toast(err?.message || 'Could not apply the boost. Please try again.', 'error');
    } finally {
      setClaiming(false);
    }
  };

  const card = 'bg-white border-2 border-ink p-8';

  return (
    <div className="relative min-h-screen pt-12 pb-24 px-4 overflow-hidden">
      <SEO noIndex title="Refer & Win" description="Refer friends to Cenner and win free Enterprise months plus listing boosts." />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ── Winner banner ── */}
        {data && data.wins.length > 0 && (
          <div className="mb-10 p-6 border border-ink flex items-center gap-4">
            <PartyPopper size={28} className="text-leaf shrink-0" />
            <div>
              <p className="text-ink font-black text-lg tracking-tight">
                You won {ordinal(data.wins[0].place)} place!
              </p>
              <p className="text-slate text-sm mt-0.5">
                {data.wins[0].enterpriseMonths} months of Enterprise and a {data.wins[0].boostMonths}-month boost from {data.wins[0].campaign.name}.
              </p>
            </div>
          </div>
        )}

        {/* ── Hero ── */}
        <div className="mb-12">
          <p className="text-[12px] font-black uppercase tracking-[0.3em] text-leaf mb-2 flex items-center gap-2">
            <Gift size={13} /> Refer &amp; Win
          </p>
          {loading ? (
            <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tighter mb-3">Loading contest…</h1>
          ) : !campaign ? (
            <>
              <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tighter mb-3">No active contest right now</h1>
              <p className="text-slate font-medium max-w-2xl">
                There is no referral contest running at the moment. Check back soon. Your referral link below still works and counts toward the next round.
              </p>
            </>
          ) : !campaign.active ? (
            <>
              <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tighter mb-3">{campaign.name}</h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-ink/5 border-2 border-ink text-slate text-xs font-black uppercase tracking-widest">
                <Clock size={14} /> Contest ended {fmtDate(campaign.endsAt) && `· ${fmtDate(campaign.endsAt)}`}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tighter mb-4">{campaign.name}</h1>
              <p className="text-slate font-medium mb-5">Ends {fmtDate(campaign.endsAt)}</p>
              {countdown && (
                <div className="flex flex-wrap gap-3">
                  {[
                    { v: countdown.days, l: 'Days' },
                    { v: countdown.hours, l: 'Hours' },
                    { v: countdown.minutes, l: 'Min' },
                    { v: countdown.seconds, l: 'Sec' },
                  ].map((c) => (
                    <div key={c.l} className="bg-white border-2 border-ink px-5 py-3 text-center min-w-[76px]">
                      <div className="text-2xl md:text-3xl font-black text-ink tabular-nums">{String(c.v).padStart(2, '0')}</div>
                      <div className="text-[12px] font-black uppercase tracking-widest text-slate mt-1">{c.l}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Prize podium ── */}
        <div className="mb-12">
          <h2 className="text-xs font-black text-slate uppercase tracking-[0.2em] mb-5">Prizes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {PRIZES.map((p) => {
              const first = p.place === 1;
              const Icon = p.icon;
              return (
                <div
                  key={p.place}
                  className={
                    first
                      ? 'relative border-2 border-ink bg-brand-green p-6 shadow-[6px_6px_0_0_#0b0c0e] md:-mt-3'
                      : `${card}`
                  }
                >
                  {first && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-ink px-3 py-0.5 bg-ink text-white text-[12px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Sparkles size={11} /> Grand Prize
                    </div>
                  )}
                  <div className={`w-12 h-12 flex items-center justify-center mb-5 ${first ? 'bg-white border-2 border-ink text-ink' : p.place === 2 ? 'bg-sky/10 text-sky' : 'bg-ink/5 text-slate'}`}>
                    <Icon size={24} />
                  </div>
                  <div className={`text-lg font-black tracking-tight mb-4 text-ink`}>{p.label}</div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-ink">
                      <Zap size={15} className="text-leaf shrink-0 mt-0.5" />
                      <span>{p.enterprise}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-ink">
                      <TrendingUp size={15} className="text-sky shrink-0 mt-0.5" />
                      <span>{p.boost}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Boost claim panel ── */}
        {data && data.pendingBoostMonths > 0 && (
          <div className="mb-12 p-8 border border-ink">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={22} className="text-sky" />
              <h2 className="text-xl font-black text-ink tracking-tight">
                You won a {data.pendingBoostMonths}-month boost!
              </h2>
            </div>
            <p className="text-slate text-sm mb-5">Pick one of your listings to apply the boost to. It will be featured for the full duration.</p>
            {myListings.length === 0 ? (
              <p className="text-slate text-sm">
                You don&apos;t have any listings yet.{' '}
                <Link to="/profile" className="text-leaf font-bold hover:underline">Create one</Link> to apply your boost.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedListing}
                  onChange={(e) => setSelectedListing(e.target.value)}
                  className="flex-1 bg-paper2 border-2 border-ink px-4 py-3 text-sm text-ink font-medium focus:border-sky focus:outline-none"
                >
                  <option value="">Select a listing…</option>
                  {myListings.map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
                <button
                  onClick={handleClaim}
                  disabled={!selectedListing || claiming}
                  className="px-6 py-3 bg-sky text-ink font-black text-xs uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100"
                >
                  {claiming ? 'Applying…' : 'Apply boost'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Referral link + share ── */}
        <div className={`${card} mb-12`}>
          <h2 className="text-xs font-black text-slate uppercase tracking-[0.2em] mb-5">Your referral link</h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 bg-paper2 border-2 border-ink px-4 py-3 text-sm text-ink font-mono select-all"
            />
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-widest border-2 transition-all border-ink hover:border-ink hover:bg-ink/5 text-ink"
            >
              {copied ? <><Check size={15} className="text-leaf" /> Copied!</> : <><Copy size={15} /> Copy</>}
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={waHref} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 font-black text-[12px] uppercase tracking-widest border-2 border-ink hover:border-ink hover:bg-ink/5 text-ink transition-all">
              <MessageCircle size={15} className="text-leaf" /> WhatsApp
            </a>
            <a href={mailHref}
              className="flex items-center gap-2 px-4 py-2.5 font-black text-[12px] uppercase tracking-widest border-2 border-ink hover:border-ink hover:bg-ink/5 text-ink transition-all">
              <Mail size={15} className="text-sky" /> Email
            </a>
            <a href={xHref} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 font-black text-[12px] uppercase tracking-widest border-2 border-ink hover:border-ink hover:bg-ink/5 text-ink transition-all">
              <Twitter size={15} className="text-leaf" /> X
            </a>
            <button onClick={handleNativeShare}
              className="flex items-center gap-2 px-4 py-2.5 font-black text-[12px] uppercase tracking-widest border-2 border-ink hover:border-ink hover:bg-ink/5 text-ink transition-all">
              <Share2 size={15} className="text-sky" /> Share
            </button>
          </div>
        </div>

        {/* ── Your standing ── */}
        <div className="mb-12">
          <h2 className="text-xs font-black text-slate uppercase tracking-[0.2em] mb-5">Your standing</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-ink p-6">
              <div className="text-leaf mb-4"><Users size={18} /></div>
              <div className="text-2xl font-black text-ink mb-1">{data?.referralCount ?? '—'}</div>
              <div className="text-[12px] font-bold text-slate uppercase tracking-widest">Referrals</div>
            </div>
            <div className="bg-white border-2 border-ink p-6">
              <div className="text-sky mb-4"><Trophy size={18} /></div>
              <div className="text-2xl font-black text-ink mb-1">
                {data && data.rank > 0 ? `#${data.rank}` : '—'}
                {data && data.totalParticipants > 0 && (
                  <span className="text-sm font-bold text-slate"> of {data.totalParticipants}</span>
                )}
              </div>
              <div className="text-[12px] font-bold text-slate uppercase tracking-widest">Your rank</div>
            </div>
            <div className="bg-white border-2 border-ink p-6 col-span-2 lg:col-span-1">
              <div className="text-leaf mb-4"><Sparkles size={18} /></div>
              <div className="text-2xl font-black text-ink mb-1">{data?.pendingBoostMonths ? `${data.pendingBoostMonths} mo` : '—'}</div>
              <div className="text-[12px] font-bold text-slate uppercase tracking-widest">Boost to claim</div>
            </div>
          </div>
        </div>

        {/* ── Leaderboard ── */}
        <div className={card}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-black text-slate uppercase tracking-[0.2em]">Leaderboard</h2>
            {board?.campaign && (
              <span className="text-[12px] font-bold text-slate uppercase tracking-widest">{board.campaign.name}</span>
            )}
          </div>
          {!board || board.leaders.length === 0 ? (
            <div className="text-center py-10">
              <Users size={32} className="text-slate mx-auto mb-4" />
              <p className="text-slate font-bold text-sm">No referrals yet</p>
              <p className="text-slate text-xs mt-1">Be the first to climb the board. Share your link above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[12px] font-black uppercase tracking-widest text-slate border-b border-ink/15">
                    <th className="py-3 pr-4 font-black">Rank</th>
                    <th className="py-3 pr-4 font-black">Referrer</th>
                    <th className="py-3 text-right font-black">Referrals</th>
                  </tr>
                </thead>
                <tbody>
                  {board.leaders.map((leader) => {
                    const isMe = data != null && data.rank > 0 && leader.rank === data.rank;
                    return (
                      <tr
                        key={leader.rank}
                        className={`border-b border-ink/15 last:border-0 ${isMe ? 'bg-leaf/10' : ''}`}
                      >
                        <td className="py-3.5 pr-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 text-sm font-black ${
                            leader.rank === 1 ? 'bg-leaf/20 text-leaf'
                              : leader.rank === 2 ? 'bg-sky/10 text-sky'
                              : leader.rank === 3 ? 'bg-ink/10 text-ink'
                              : 'text-slate'
                          }`}>
                            {leader.rank}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className={`font-bold text-sm ${isMe ? 'text-leaf' : 'text-ink'}`}>
                            {leader.name}{isMe && <span className="text-slate font-medium"> (you)</span>}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-black text-ink tabular-nums">{leader.referralCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default Referral;
