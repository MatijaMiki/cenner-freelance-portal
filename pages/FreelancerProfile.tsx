
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Briefcase, ShieldCheck, MessageSquare,
  Clock, ArrowRight, User, ExternalLink, AlertCircle, Loader2,
  FileText, Plus, Trash2, X, ChevronRight, BadgeCheck,
} from 'lucide-react';
import AvatarImg from '../components/Avatar';
import { API } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

// ── Create Contract Modal ─────────────────────────────────────────────────────

interface MilestoneInput {
  title: string;
  description: string;
  amount: string;
  dueDate: string;
}

interface ContractModalProps {
  freelancerId: string;
  freelancerName: string;
  onClose: () => void;
  onCreated: (contractId: string) => void;
}

const ContractModal: React.FC<ContractModalProps> = ({ freelancerId, freelancerName, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: '', description: '', amount: '', dueDate: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addMilestone = () =>
    setMilestones(ms => [...ms, { title: '', description: '', amount: '', dueDate: '' }]);

  const removeMilestone = (i: number) =>
    setMilestones(ms => ms.filter((_, idx) => idx !== i));

  const updateMilestone = (i: number, field: keyof MilestoneInput, value: string) =>
    setMilestones(ms => ms.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  const totalAmount = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Title is required.'); return; }
    if (milestones.some(m => !m.title.trim() || !m.amount || parseFloat(m.amount) <= 0)) {
      setError('Each milestone needs a title and a positive amount.'); return;
    }
    setSubmitting(true);
    try {
      const contract = await API.createContract({
        freelancerId,
        title: title.trim(),
        description: description.trim(),
        milestones: milestones.map((m, i) => ({
          title: m.title.trim(),
          description: m.description.trim(),
          amount: parseFloat(m.amount),
          dueDate: m.dueDate || undefined,
          order: i,
        })),
      });
      onCreated(contract.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create contract.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(11,12,14,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border-2 border-ink bg-paper text-ink">
        <div className="flex items-center justify-between border-b-2 border-ink p-6">
          <div>
            <h2 className="font-display text-xl font-extrabold tracking-[-0.02em]">Propose Contract</h2>
            <p className="mt-0.5 text-sm text-slate">to {freelancerName}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center border-2 border-ink transition-colors hover:bg-ink hover:text-white">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="mb-2 block font-display text-[12px] font-extrabold uppercase tracking-wide">Contract Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Brand identity design"
              maxLength={120}
              className="w-full border-2 border-ink bg-white px-4 py-3 text-sm placeholder:text-slate focus:border-sky focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block font-display text-[12px] font-extrabold uppercase tracking-wide">Description <span className="font-normal normal-case text-slate">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the scope of work..."
              rows={3}
              maxLength={2000}
              className="w-full resize-none border-2 border-ink bg-white px-4 py-3 text-sm placeholder:text-slate focus:border-sky focus:outline-none"
            />
          </div>

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-display text-[12px] font-extrabold uppercase tracking-wide">Milestones</label>
              <button
                type="button"
                onClick={addMilestone}
                className="flex items-center gap-1 font-display text-[13px] font-bold text-sky hover:text-ink"
              >
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="space-y-3 border-2 border-ink bg-white p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-ink font-display text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <input
                      value={m.title}
                      onChange={e => updateMilestone(i, 'title', e.target.value)}
                      placeholder="Milestone title"
                      maxLength={120}
                      className="flex-1 bg-transparent text-sm placeholder:text-slate focus:outline-none"
                    />
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(i)}
                        className="text-slate transition-colors hover:text-red-700"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate">€</span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={m.amount}
                        onChange={e => updateMilestone(i, 'amount', e.target.value)}
                        placeholder="Amount"
                        className="w-full border-2 border-ink bg-white py-2 pl-7 pr-3 text-sm placeholder:text-slate focus:border-sky focus:outline-none"
                      />
                    </div>
                    <input
                      type="date"
                      value={m.dueDate}
                      onChange={e => updateMilestone(i, 'dueDate', e.target.value)}
                      className="flex-1 border-2 border-ink bg-white px-3 py-2 text-sm focus:border-sky focus:outline-none"
                      style={{ colorScheme: 'light' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t-2 border-ink pt-3">
            <span className="text-sm text-slate">Total contract value</span>
            <span className="font-display text-lg font-extrabold">€{totalAmount.toFixed(2)}</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 border-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-ink py-3 text-sm font-bold transition-colors hover:bg-ink hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 bg-sky py-3 font-display text-sm font-bold text-white transition-colors hover:bg-ink disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              {submitting ? 'Creating...' : 'Send Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Star Rating display ───────────────────────────────────────────────────────

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star
        key={s}
        size={size}
        className={s <= Math.round(rating) ? 'fill-ink text-ink' : 'fill-ink/20 text-ink/20'}
      />
    ))}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const FreelancerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [messagingLoading, setMessagingLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      API.getProfile(id),
      API.getPortfolio(id),
      API.getUserReviews(id).catch(() => []),
    ])
      .then(([prof, port, revs]) => {
        setProfile(prof);
        setPortfolio(port || []);
        setReviews(revs || []);
      })
      .catch(err => setError(err.message || 'Could not load profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMessage = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!id) return;
    setMessagingLoading(true);
    try {
      const conv = await API.startConversation(id);
      navigate(`/messages/${conv.id}`);
    } catch {
      navigate('/messages');
    } finally {
      setMessagingLoading(false);
    }
  };

  const handleContractCreated = (contractId: string) => {
    setShowContractModal(false);
    navigate(`/contracts/${contractId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-ink" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle size={40} className="text-red-700" />
        <h2 className="font-display text-2xl font-extrabold">Profile not found</h2>
        <p className="text-slate">{error || 'This freelancer profile does not exist.'}</p>
        <Link to="/marketplace" className="mt-4 bg-sky px-6 py-3 font-display text-sm font-bold text-white transition-colors hover:bg-ink">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const isVerified = profile.kycVerified || profile.creatorStatus === 'approved' || profile.creatorStatus === 'APPROVED';
  const isSelf = user?.id === id;
  const isLoggedIn = !!user;

  const freelancerJsonLd = profile ? {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    description: profile.bio || undefined,
    url: `https://cenner.hr/freelancer/${id}`,
    image: profile.avatar || undefined,
    jobTitle: 'Freelancer',
    worksFor: {
      '@type': 'Organization',
      name: 'Cenner',
      url: 'https://cenner.hr',
    },
    knowsAbout: Array.isArray(profile.skills) ? profile.skills : undefined,
    ...(profile.avgRating && profile.reviewCount > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: profile.avgRating,
        bestRating: 5,
        ratingCount: profile.reviewCount,
      },
    } : {}),
  } : undefined;

  return (
    <div className="min-h-screen px-4 pb-24 pt-10 font-text md:px-8 md:pt-14">
      <SEO
        title={`${profile.name}, Freelance ${profile.skills?.[0] || 'Usluge'}`}
        canonical={`/freelancer/${id}`}
        description={profile.bio || `Pogledaj profil freelancera ${profile.name} na Cenner platformi.`}
        jsonLd={freelancerJsonLd}
      />

      {showContractModal && id && (
        <ContractModal
          freelancerId={id}
          freelancerName={profile.name}
          onClose={() => setShowContractModal(false)}
          onCreated={handleContractCreated}
        />
      )}

      <div className="mx-auto max-w-[1500px]">
        {/* Hero Card */}
        <div className="mb-10 border-2 border-ink bg-white p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <AvatarImg src={profile.avatar} name={profile.name} size={112} className="rounded-none border-2 border-ink" />
              {isVerified && (
                <div className="absolute -bottom-2 -right-2 w-9 h-9 flex items-center justify-center" title="Identity Verified">
                  <BadgeCheck size={36} className="text-ink" fill="#4ade80" strokeWidth={1.75} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-display text-[clamp(2rem,1.4rem+2.4vw,3.5rem)] font-extrabold leading-none tracking-[-0.035em]">{profile.name}</h1>
                {profile.trusted && (
                  <span className="flex items-center gap-1 bg-ink px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-white" title="Trusted freelancer, top-tier Ultra">
                    ★ Trusted
                  </span>
                )}
                {profile.tier === 'ultra' && !profile.trusted && (
                  <span className="bg-sky px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-white">
                    Ultra
                  </span>
                )}
                {profile.tier === 'pro' && (
                  <span className="border-2 border-ink px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wide">
                    Pro
                  </span>
                )}
                {isVerified && (
                  <span className="flex items-center gap-1 bg-brand-green px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-ink">
                    <ShieldCheck size={10} /> Verified
                  </span>
                )}
              </div>

              <p className="mb-3 text-[1rem] capitalize text-slate">{profile.role || 'Freelancer'}</p>

              {/* Rating */}
              {profile.avgRating != null && profile.reviewCount > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={profile.avgRating} />
                  <span className="font-display text-sm font-bold">{profile.avgRating.toFixed(1)}</span>
                  <span className="text-xs text-slate">({profile.reviewCount} review{profile.reviewCount !== 1 ? 's' : ''})</span>
                </div>
              )}

              {profile.bio && (
                <p className="mb-6 max-w-xl leading-relaxed text-ink/90">{profile.bio}</p>
              )}
              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string) => (
                    <span key={skill} className="border-2 border-ink bg-white px-3 py-1.5 font-display text-[12px] font-bold">{skill}</span>
                  ))}
                </div>
              )}
            </div>

            {/* CTA buttons — hidden if viewing own profile */}
            {!isSelf && (
              <div className="flex flex-col gap-3 shrink-0">
                <button
                  onClick={handleMessage}
                  disabled={messagingLoading}
                  className="flex items-center gap-2 bg-sky px-6 py-3 font-display text-sm font-bold text-white transition-colors hover:bg-ink disabled:opacity-60"
                >
                  {messagingLoading
                    ? <Loader2 size={15} className="animate-spin" />
                    : <MessageSquare size={15} />}
                  Message
                </button>

                {isLoggedIn && (
                  <button
                    onClick={() => setShowContractModal(true)}
                    className="flex items-center gap-2 border-2 border-ink px-6 py-3 font-display text-sm font-bold transition-colors hover:bg-ink hover:text-white"
                  >
                    <FileText size={15} />
                    Propose Contract
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Portfolio + Reviews */}
          <div className="lg:col-span-2 space-y-10">
            {/* Portfolio */}
            {portfolio.length > 0 ? (
              <div>
                <h2 className="mb-6 border-t-2 border-ink pt-4 font-display text-[13px] font-extrabold uppercase tracking-[0.12em]">Portfolio</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {portfolio.map((item: any) => (
                    <div key={item.id} className="group overflow-hidden border-2 border-ink bg-white transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#0b0c0e]">
                      {(item.imageUrl || item.fileType?.startsWith('image/')) && (
                        <div className="h-40 overflow-hidden border-b-2 border-ink">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="mb-1 font-display text-[1rem] font-bold">{item.title}</h3>
                        {item.description && <p className="text-[13px] text-slate">{item.description}</p>}
                        {item.fileUrl && /^https?:\/\//i.test(item.fileUrl) && (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1 font-display text-[13px] font-bold text-sky underline underline-offset-4 hover:text-ink"
                          >
                            View file <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-ink/40 bg-white p-10 text-center">
                <Briefcase size={28} className="mx-auto mb-3 text-slate" />
                <p className="font-display text-sm font-bold text-slate">No portfolio items yet</p>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h2 className="mb-6 border-t-2 border-ink pt-4 font-display text-[13px] font-extrabold uppercase tracking-[0.12em]">
                  Reviews <span className="font-normal text-slate">({reviews.length})</span>
                </h2>
                <div className="space-y-4">
                  {reviews.map((rev: any) => (
                    <div key={rev.id} className="border-2 border-ink bg-white p-5">
                      <div className="flex items-start gap-4">
                        <AvatarImg src={rev.reviewer?.avatar} name={rev.reviewer?.name} size={36} className="shrink-0 rounded-none border-2 border-ink" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-display text-sm font-bold">{rev.reviewer?.name || 'Anonymous'}</span>
                            <StarRating rating={rev.rating} size={12} />
                            <span className="ml-auto text-[12px] text-slate">
                              {new Date(rev.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          {rev.comment && (
                            <p className="text-[0.95rem] leading-relaxed text-ink/90">{rev.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="border-2 border-ink bg-white p-6">
              <h3 className="mb-5 font-display text-[13px] font-extrabold uppercase tracking-[0.12em]">Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={16} className="shrink-0 text-slate" />
                  <span className="text-slate">Member since <span className="font-bold text-ink">{profile.createdAt ? new Date(profile.createdAt).getFullYear() : '—'}</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck size={16} className={isVerified ? 'shrink-0 text-leaf' : 'shrink-0 text-slate'} />
                  <span className="text-slate">
                    KYC: <span className={`font-bold ${isVerified ? 'text-leaf' : 'text-slate'}`}>{isVerified ? 'Verified' : 'Pending'}</span>
                  </span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={16} className="shrink-0 text-slate" />
                    <span className="text-slate">{profile.location}</span>
                  </div>
                )}
                {profile.avgRating != null && profile.reviewCount > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <Star size={16} className="shrink-0" />
                    <span className="text-slate">
                      <span className="font-bold text-ink">{profile.avgRating.toFixed(1)}</span> avg rating
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!isSelf && isLoggedIn && (
              <div className="space-y-3">
                <button
                  onClick={handleMessage}
                  disabled={messagingLoading}
                  className="flex w-full items-center justify-center gap-2 bg-sky py-3 text-center font-display text-sm font-bold text-white transition-colors hover:bg-ink disabled:opacity-60"
                >
                  {messagingLoading ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                  Send message
                </button>
                <button
                  onClick={() => setShowContractModal(true)}
                  className="flex w-full items-center justify-center gap-2 border-2 border-ink py-3 text-center font-display text-sm font-bold transition-colors hover:bg-ink hover:text-white"
                >
                  <FileText size={14} />
                  Propose a contract
                </button>
              </div>
            )}

            <Link
              to="/marketplace"
              className="flex w-full items-center justify-center gap-1.5 border-2 border-ink bg-white py-4 text-center font-display text-[13px] font-bold transition-colors hover:bg-ink hover:text-white"
            >
              Browse More Freelancers <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;
