import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Clock, AlertTriangle, Star,
  DollarSign, Send, ShieldCheck, MessageCircle, Timer, XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import { useNotify } from '../contexts/NotifyContext';
import AvatarImg from '../components/Avatar';
import SEO from '../components/SEO';
import MilestoneFundModal from '../components/MilestoneFundModal';

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
    PENDING:   'text-slate bg-ink/5',
    FUNDED:    'text-sky bg-ink/5',
    SUBMITTED: 'text-ink bg-ink/5',
    APPROVED:  'text-leaf bg-leaf/10',
    RELEASED:  'text-leaf bg-leaf/10',
    DISPUTED:  'text-red-700 bg-red-50',
    REFUNDED:  'text-slate bg-ink/5',
  };
  return (
    <span className={`text-[12px] font-bold uppercase tracking-wider px-2 py-0.5 ${map[status] || 'text-slate bg-ink/5'}`}>
      {status.toLowerCase()}
    </span>
  );
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} size={14} className={i < rating ? 'text-ink fill-ink' : 'text-slate'} />
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
  const [fundTarget, setFundTarget] = useState<Milestone | null>(null);

  const reload = () => {
    if (!id) return;
    API.getContract(id).then(setContract).catch(() => {});
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate">Loading…</div>;
  if (!contract) return <div className="min-h-screen flex items-center justify-center text-slate">{error || 'Not found'}</div>;

  const other = isClient ? contract.freelancer : contract.client;

  // Offer expiry days remaining
  const offerExpiryDays = contract.expiresAt
    ? Math.ceil((new Date(contract.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="relative min-h-screen">
      <SEO title={contract.title} canonical={`/contracts/${contract.id}`} description="Contract details" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <button onClick={() => navigate('/contracts')} className="flex items-center gap-2 text-slate hover:text-ink mb-6 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to contracts
        </button>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-700 text-red-700 text-sm">{error}</div>
        )}

        {/* Header */}
        <div className="bg-white border-2 border-ink p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-black text-ink mb-1">{contract.title}</h1>
              {contract.description && <p className="text-slate text-sm">{contract.description}</p>}
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-ink">€{contract.totalAmount.toFixed(2)}</p>
              <p className="text-slate text-xs">total value</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AvatarImg src={other.avatar} name={other.name} size={40} className="" />
            <div>
              <p className="text-ink font-bold text-sm">{other.name}</p>
              {other.avgRating != null && (
                <div className="flex items-center gap-1 mt-0.5">
                  <StarRating rating={Math.round(other.avgRating)} />
                  <span className="text-slate text-xs">{other.avgRating.toFixed(1)} ({other.reviewCount})</span>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/messages')}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 border-2 border-ink text-slate hover:text-ink hover:border-ink transition-all text-xs font-bold"
            >
              <MessageCircle size={13} /> Message
            </button>
          </div>
        </div>

        {/* Incoming offer banner — accept or decline */}
        {isOfferRecipient && (
          <div className="bg-ink/5 border border-ink p-5 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-ink font-bold text-sm">Contract offer pending your response</p>
                <p className="text-slate text-xs mt-0.5">Review the milestones below, then accept or decline.</p>
                {offerExpiryDays !== null && (
                  <p className={`text-xs mt-1 font-bold ${offerExpiryDays <= 1 ? 'text-red-700' : 'text-ink'}`}>
                    {offerExpiryDays <= 0 ? 'Expires today' : `Expires in ${offerExpiryDays} day${offerExpiryDays !== 1 ? 's' : ''}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => doAction(() => API.acceptContract(contract.id), 'accept')}
                disabled={!!actionLoading}
                className="flex-1 px-4 py-2.5 bg-sky text-white font-black text-sm hover:scale-105 transition-all disabled:opacity-50"
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
                className="flex-1 px-4 py-2.5 bg-ink/5 border-2 border-ink text-ink font-bold text-sm hover:bg-ink/10 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'decline' ? 'Declining…' : 'Decline'}
              </button>
            </div>
          </div>
        )}

        {/* Sent offer banner — waiting for other party */}
        {contract.status === 'DRAFT' && !isOfferRecipient && (
          <div className="bg-ink/5 border border-ink p-4 mb-4">
            <p className="text-sky font-bold text-sm">Offer sent, awaiting response</p>
            <p className="text-slate text-xs mt-0.5">
              Waiting for {other.name} to accept or decline.
              {offerExpiryDays !== null && ` Offer expires in ${Math.max(0, offerExpiryDays)} day${offerExpiryDays !== 1 ? 's' : ''}.`}
            </p>
          </div>
        )}

        {/* Milestones */}
        <div className="bg-white border-2 border-ink p-6 mb-4">
          <h2 className="text-ink font-black mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-leaf" /> Milestones
          </h2>
          <div className="space-y-3">
            {contract.milestones.map(m => (
              <div key={m.id} className="border-2 border-ink p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-ink font-bold text-sm">{m.title}</p>
                    {m.description && <p className="text-slate text-xs mt-0.5">{m.description}</p>}
                    {m.dueDate && <p className="text-slate text-xs mt-1">Due {new Date(m.dueDate).toLocaleDateString()}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-ink font-black">€{m.amount.toFixed(2)}</p>
                    <MilestoneStatusBadge status={m.status} />
                  </div>
                </div>

                {/* Auto-release countdown for submitted milestones */}
                {m.status === 'SUBMITTED' && m.autoReleaseAt && (
                  <div className="flex items-center gap-1.5 mt-2 mb-1 text-yellow-400/80 text-xs">
                    <Timer size={12} />
                    <span>
                      Auto-releases in <strong><Countdown targetDate={m.autoReleaseAt} /></strong>
                      {isClient && ' (approve or dispute to override)'}
                    </span>
                  </div>
                )}

                {/* Milestone actions */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {isClient && m.status === 'PENDING' && contract.status === 'ACTIVE' && (
                    <button
                      onClick={() => setFundTarget(m)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-ink/5 border border-ink text-sky text-xs font-bold hover:bg-ink/5 transition-all disabled:opacity-50"
                    >
                      <DollarSign size={12} />
                      Fund milestone
                    </button>
                  )}
                  {isFreelancer && m.status === 'FUNDED' && (
                    <button
                      onClick={() => doAction(() => API.submitMilestone(m.id), `submit-${m.id}`)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-ink/5 border border-ink text-ink text-xs font-bold hover:bg-ink/5 transition-all disabled:opacity-50"
                    >
                      <Send size={12} />
                      {actionLoading === `submit-${m.id}` ? 'Submitting…' : 'Submit work'}
                    </button>
                  )}
                  {isClient && m.status === 'SUBMITTED' && (
                    <button
                      onClick={() => doAction(() => API.approveMilestone(m.id), `approve-${m.id}`)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-leaf/10 border border-ink text-leaf text-xs font-bold hover:bg-leaf/20 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 size={12} />
                      {actionLoading === `approve-${m.id}` ? 'Approving…' : 'Approve & release payment'}
                    </button>
                  )}
                  {['FUNDED', 'SUBMITTED'].includes(m.status) && (
                    <button
                      onClick={() => {
                        const raw = window.prompt('Briefly describe why you are disputing this milestone (max 1000 chars):', '');
                        if (raw === null) return; // user cancelled
                        const reason = raw.trim().slice(0, 1000) || 'Dispute raised';
                        doAction(() => API.disputeMilestone(m.id, reason), `dispute-${m.id}`);
                      }}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-700 text-red-700 text-xs font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      <AlertTriangle size={12} />
                      Dispute
                    </button>
                  )}
                  {isClient && m.status === 'DISPUTED' && (
                    <button
                      onClick={async () => {
                        const ok = await notify.confirm('Refund this milestone back to your card? This cannot be undone, and the freelancer will be notified.', {
                          title: 'Request refund?',
                          confirmLabel: 'Yes, refund',
                          cancelLabel: 'Keep disputed',
                          variant: 'danger',
                        });
                        if (ok) doAction(() => API.refundMilestone(m.id), `refund-${m.id}`);
                      }}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-ink/5 border border-ink text-ink text-xs font-bold hover:bg-ink/5 transition-all disabled:opacity-50"
                    >
                      <DollarSign size={12} />
                      {actionLoading === `refund-${m.id}` ? 'Refunding…' : 'Request refund'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review section */}
        {hasReleased && !alreadyReviewed && !reviewSent && (
          <div className="bg-white border-2 border-ink p-6 mb-4">
            <h2 className="text-ink font-black mb-4 flex items-center gap-2">
              <Star size={18} className="text-ink" /> Leave a review
            </h2>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setReviewRating(n)}>
                  <Star size={28} className={n <= reviewRating ? 'text-ink fill-ink' : 'text-slate'} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Share your experience (optional)"
              rows={3}
              className="w-full bg-paper border-2 border-ink px-4 py-3 text-ink text-sm resize-none outline-none placeholder:text-slate focus:border-sky transition-colors mb-3"
            />
            <button
              onClick={submitReview}
              disabled={!!actionLoading}
              className="px-5 py-2.5 bg-sky text-white font-black text-sm hover:scale-105 transition-all disabled:opacity-50"
            >
              {actionLoading === 'review' ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        )}

        {/* Existing reviews */}
        {contract.reviews.length > 0 && (
          <div className="bg-white border-2 border-ink p-6 mb-4">
            <h2 className="text-ink font-black mb-4">Reviews</h2>
            <div className="space-y-3">
              {contract.reviews.map(r => (
                <div key={r.id} className="border-2 border-ink p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AvatarImg src={r.reviewer.avatar} name={r.reviewer.name} size={28} className="" />
                    <span className="text-ink font-bold text-sm">{r.reviewer.name}</span>
                    <StarRating rating={r.rating} />
                  </div>
                  {r.comment && <p className="text-slate text-sm">{r.comment}</p>}
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
              className="flex items-center gap-1.5 mx-auto text-slate hover:text-red-700 text-xs transition-colors"
            >
              <XCircle size={13} /> Cancel contract
            </button>
          </div>
        )}
      </div>

      {fundTarget && (
        <MilestoneFundModal
          milestoneId={fundTarget.id}
          milestoneTitle={fundTarget.title}
          amount={fundTarget.amount}
          onClose={() => setFundTarget(null)}
          onPaid={() => {
            setFundTarget(null);
            notify.toast('Payment authorised. The milestone will be marked funded once Stripe confirms.', 'success');
            // Webhook flips status to FUNDED; reload now and again after a short delay.
            reload();
            setTimeout(reload, 3000);
          }}
        />
      )}
    </div>
  );
};

export default ContractDetail;
