import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Clock, AlertTriangle, Star,
  DollarSign, Send, ShieldCheck, MessageCircle, Timer, XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import { useNotify } from '../contexts/NotifyContext';
import NeuralBackground from '../components/NeuralBackground';
import SEO from '../components/SEO';

interface Milestone {
  id: string; title: string; description?: string;
  amount: number; dueDate?: string; order: number; status: string;
  submittedAt?: string; autoReleaseAt?: string;
}
interface Review {
  id: string; rating: number; comment?: string;
  reviewer: { id: string; name: string; avatar?: string }; createdAt: string;
}
interface Contract {
  id: string; title: string; description?: string; status: string; totalAmount: number;
  clientId: string; freelancerId: string;
  initiatedBy?: string; expiresAt?: string;
  client: { id: string; name: string; avatar?: string; avgRating?: number; reviewCount: number };
  freelancer: { id: string; name: string; avatar?: string; avgRating?: number; reviewCount: number; stripeConnectReady: boolean };
  milestones: Milestone[];
  reviews: Review[];
}

function MilestoneStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING:   'text-gray-400 bg-gray-400/10',
    FUNDED:    'text-blue-400 bg-blue-400/10',
    SUBMITTED: 'text-yellow-400 bg-yellow-400/10',
    APPROVED:  'text-brand-green bg-brand-green/10',
    RELEASED:  'text-brand-green bg-brand-green/10',
    DISPUTED:  'text-red-400 bg-red-400/10',
    REFUNDED:  'text-gray-400 bg-gray-400/10',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${map[status] || 'text-gray-400 bg-gray-400/10'}`}>
      {status.toLowerCase()}
    </span>
  );
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} size={14} className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
      ))}
    </div>
  );
}

// Live countdown: shows "Xh Xm" remaining, refreshes every minute
function Countdown({ targetDate }: { targetDate: string }) {
  const [remaining, setRemaining] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function calc() {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) { setRemaining('Releasing now…'); return; }
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (h >= 24) {
      const d = Math.floor(h / 24);
      setRemaining(`${d}d ${h % 24}h`);
    } else {
      setRemaining(`${h}h ${m}m`);
    }
  }

  useEffect(() => {
    calc();
    timerRef.current = setInterval(calc, 60 * 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [targetDate]);

  return <span>{remaining}</span>;
}

const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSent, setReviewSent] = useState(false);

  const reload = () => {
    if (!id) return;
    API.getContract(id).then(setContract).catch(console.error);
  };

  useEffect(() => {
    if (!user || !id) { navigate('/auth'); return; }
    API.getContract(id)
      .then(setContract)
      .catch(() => setError('Contract not found'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const isClient = contract?.clientId === user?.id;
  const isFreelancer = contract?.freelancerId === user?.id;

  // Is the current user the recipient of this offer (not the one who sent it)?
  const isOfferRecipient = contract?.status === 'DRAFT' && (
    (contract.initiatedBy === 'CLIENT' && isFreelancer) ||
    (contract.initiatedBy === 'FREELANCER' && isClient) ||
    (!contract.initiatedBy && isFreelancer) // legacy
  );

  async function doAction(fn: () => Promise<any>, key: string) {
    setActionLoading(key);
    setError('');
    try { await fn(); reload(); }
    catch (e: any) { setError(e.message || 'Action failed'); }
    finally { setActionLoading(null); }
  }

  const hasReleased = contract?.milestones.some(m => m.status === 'RELEASED');
  const alreadyReviewed = contract?.reviews.some(r => r.reviewer.id === user?.id);

  async function submitReview() {
    if (!contract) return;
    setActionLoading('review');
    try {
      await API.submitReview(contract.id, reviewRating, reviewComment);
      setReviewSent(true);
      reload();
    } catch (e: any) {
      setError(e.message || 'Failed to submit review');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <div className="min-h-screen bg-brand-black flex items-center justify-center text-gray-500">Loading…</div>;
  if (!contract) return <div className="min-h-screen bg-brand-black flex items-center justify-center text-gray-500">{error || 'Not found'}</div>;

  const other = isClient ? contract.freelancer : contract.client;

  // Offer expiry days remaining
  const offerExpiryDays = contract.expiresAt
    ? Math.ceil((new Date(contract.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="relative min-h-screen">
      <SEO title={contract.title} canonical={`/contracts/${contract.id}`} description="Contract details" />
      <NeuralBackground parallax={false} />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <button onClick={() => navigate('/contracts')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to contracts
        </button>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
        )}

        {/* Header */}
        <div className="bg-brand-grey/70 border border-white/5 rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-black text-white mb-1">{contract.title}</h1>
              {contract.description && <p className="text-gray-400 text-sm">{contract.description}</p>}
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">€{contract.totalAmount.toFixed(2)}</p>
              <p className="text-gray-600 text-xs">total value</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {other.avatar ? (
              <img src={other.avatar} alt={other.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green font-black">
                {other.name[0]}
              </div>
            )}
            <div>
              <p className="text-white font-bold text-sm">{other.name}</p>
              {other.avgRating != null && (
                <div className="flex items-center gap-1 mt-0.5">
                  <StarRating rating={Math.round(other.avgRating)} />
                  <span className="text-gray-500 text-xs">{other.avgRating.toFixed(1)} ({other.reviewCount})</span>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/messages')}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all text-xs font-bold"
            >
              <MessageCircle size={13} /> Message
            </button>
          </div>
        </div>

        {/* Incoming offer banner — accept or decline */}
        {isOfferRecipient && (
          <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-5 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-yellow-400 font-bold text-sm">Contract offer pending your response</p>
                <p className="text-gray-500 text-xs mt-0.5">Review the milestones below, then accept or decline.</p>
                {offerExpiryDays !== null && (
                  <p className={`text-xs mt-1 font-bold ${offerExpiryDays <= 1 ? 'text-red-400' : 'text-yellow-500'}`}>
                    {offerExpiryDays <= 0 ? 'Expires today' : `Expires in ${offerExpiryDays} day${offerExpiryDays !== 1 ? 's' : ''}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => doAction(() => API.acceptContract(contract.id), 'accept')}
                disabled={!!actionLoading}
                className="flex-1 px-4 py-2.5 bg-brand-green text-brand-black font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
              >
                {actionLoading === 'accept' ? 'Accepting…' : 'Accept contract'}
              </button>
              <button
                onClick={async () => {
                  const ok = await notify.confirm('Decline this contract offer? This cannot be undone.', {
                    title: 'Decline offer?',
                    confirmLabel: 'Yes, decline',
                    cancelLabel: 'Keep reviewing',
                    variant: 'danger',
                  });
                  if (ok) doAction(() => API.declineContract(contract.id), 'decline');
                }}
                disabled={!!actionLoading}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 font-bold rounded-xl text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'decline' ? 'Declining…' : 'Decline'}
              </button>
            </div>
          </div>
        )}

        {/* Sent offer banner — waiting for other party */}
        {contract.status === 'DRAFT' && !isOfferRecipient && (
          <div className="bg-blue-400/5 border border-blue-400/20 rounded-2xl p-4 mb-4">
            <p className="text-blue-400 font-bold text-sm">Offer sent — awaiting response</p>
            <p className="text-gray-500 text-xs mt-0.5">
              Waiting for {other.name} to accept or decline.
              {offerExpiryDays !== null && ` Offer expires in ${Math.max(0, offerExpiryDays)} day${offerExpiryDays !== 1 ? 's' : ''}.`}
            </p>
          </div>
        )}

        {/* Milestones */}
        <div className="bg-brand-grey/70 border border-white/5 rounded-2xl p-6 mb-4">
          <h2 className="text-white font-black mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-brand-green" /> Milestones
          </h2>
          <div className="space-y-3">
            {contract.milestones.map(m => (
              <div key={m.id} className="border border-white/5 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">{m.title}</p>
                    {m.description && <p className="text-gray-500 text-xs mt-0.5">{m.description}</p>}
                    {m.dueDate && <p className="text-gray-600 text-xs mt-1">Due {new Date(m.dueDate).toLocaleDateString()}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-white font-black">€{m.amount.toFixed(2)}</p>
                    <MilestoneStatusBadge status={m.status} />
                  </div>
                </div>

                {/* Auto-release countdown for submitted milestones */}
                {m.status === 'SUBMITTED' && m.autoReleaseAt && (
                  <div className="flex items-center gap-1.5 mt-2 mb-1 text-yellow-400/80 text-xs">
                    <Timer size={12} />
                    <span>
                      Auto-releases in <strong><Countdown targetDate={m.autoReleaseAt} /></strong>
                      {isClient && ' — approve or dispute to override'}
                    </span>
                  </div>
                )}

                {/* Milestone actions */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {isClient && m.status === 'PENDING' && contract.status === 'ACTIVE' && (
                    <button
                      onClick={() => doAction(() => API.fundMilestone(m.id), `fund-${m.id}`)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-all disabled:opacity-50"
                    >
                      <DollarSign size={12} />
                      {actionLoading === `fund-${m.id}` ? 'Funding…' : 'Fund milestone'}
                    </button>
                  )}
                  {isFreelancer && m.status === 'FUNDED' && (
                    <button
                      onClick={() => doAction(() => API.submitMilestone(m.id), `submit-${m.id}`)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 rounded-lg text-xs font-bold hover:bg-yellow-400/20 transition-all disabled:opacity-50"
                    >
                      <Send size={12} />
                      {actionLoading === `submit-${m.id}` ? 'Submitting…' : 'Submit work'}
                    </button>
                  )}
                  {isClient && m.status === 'SUBMITTED' && (
                    <button
                      onClick={() => doAction(() => API.approveMilestone(m.id), `approve-${m.id}`)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/10 border border-brand-green/20 text-brand-green rounded-lg text-xs font-bold hover:bg-brand-green/20 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 size={12} />
                      {actionLoading === `approve-${m.id}` ? 'Approving…' : 'Approve & release payment'}
                    </button>
                  )}
                  {['FUNDED', 'SUBMITTED'].includes(m.status) && (
                    <button
                      onClick={() => doAction(() => API.disputeMilestone(m.id, 'Dispute raised'), `dispute-${m.id}`)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-400/10 border border-red-400/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-400/20 transition-all disabled:opacity-50"
                    >
                      <AlertTriangle size={12} />
                      Dispute
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review section */}
        {hasReleased && !alreadyReviewed && !reviewSent && (
          <div className="bg-brand-grey/70 border border-white/5 rounded-2xl p-6 mb-4">
            <h2 className="text-white font-black mb-4 flex items-center gap-2">
              <Star size={18} className="text-yellow-400" /> Leave a review
            </h2>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setReviewRating(n)}>
                  <Star size={28} className={n <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Share your experience (optional)"
              rows={3}
              className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none outline-none placeholder-gray-600 focus:border-brand-green/40 transition-colors mb-3"
            />
            <button
              onClick={submitReview}
              disabled={!!actionLoading}
              className="px-5 py-2.5 bg-brand-green text-brand-black font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
            >
              {actionLoading === 'review' ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        )}

        {/* Existing reviews */}
        {contract.reviews.length > 0 && (
          <div className="bg-brand-grey/70 border border-white/5 rounded-2xl p-6 mb-4">
            <h2 className="text-white font-black mb-4">Reviews</h2>
            <div className="space-y-3">
              {contract.reviews.map(r => (
                <div key={r.id} className="border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {r.reviewer.avatar ? (
                      <img src={r.reviewer.avatar} alt={r.reviewer.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green font-black text-xs">{r.reviewer.name[0]}</div>
                    )}
                    <span className="text-white font-bold text-sm">{r.reviewer.name}</span>
                    <StarRating rating={r.rating} />
                  </div>
                  {r.comment && <p className="text-gray-400 text-sm">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel */}
        {['DRAFT', 'ACTIVE'].includes(contract.status) && (
          <div className="mt-4 text-center">
            <button
              onClick={async () => {
                const ok = await notify.confirm('Are you sure you want to cancel this contract? This cannot be undone.', {
                  title: 'Cancel contract?',
                  confirmLabel: 'Yes, cancel',
                  cancelLabel: 'Keep it',
                  variant: 'danger',
                });
                if (ok) doAction(() => API.cancelContract(contract.id), 'cancel');
              }}
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 mx-auto text-gray-600 hover:text-red-400 text-xs transition-colors"
            >
              <XCircle size={13} /> Cancel contract
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractDetail;
