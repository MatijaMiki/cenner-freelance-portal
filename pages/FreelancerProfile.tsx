
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Briefcase, ShieldCheck, MessageSquare,
  Clock, ArrowRight, User, ExternalLink, AlertCircle, Loader2,
  FileText, Plus, Trash2, X, ChevronRight,
} from 'lucide-react';
import { API } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import NeuralBackground from '../components/NeuralBackground';

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
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Propose Contract</h2>
            <p className="text-xs text-gray-500 mt-0.5">to {freelancerName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Contract Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Brand identity design"
              maxLength={120}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-green/40"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Description <span className="text-gray-600 normal-case font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the scope of work..."
              rows={3}
              maxLength={2000}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-green/40 resize-none"
            />
          </div>

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Milestones</label>
              <button
                type="button"
                onClick={addMilestone}
                className="flex items-center gap-1 text-[11px] text-brand-green font-bold hover:opacity-80 transition-opacity"
              >
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="bg-white/3 border border-white/8 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-green/10 text-brand-green text-[10px] font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <input
                      value={m.title}
                      onChange={e => updateMilestone(i, 'title', e.target.value)}
                      placeholder="Milestone title"
                      maxLength={120}
                      className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
                    />
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(i)}
                        className="text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€</span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={m.amount}
                        onChange={e => updateMilestone(i, 'amount', e.target.value)}
                        placeholder="Amount"
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-green/40"
                      />
                    </div>
                    <input
                      type="date"
                      value={m.dueDate}
                      onChange={e => updateMilestone(i, 'dueDate', e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-green/40"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-xs text-gray-500">Total contract value</span>
            <span className="text-brand-green font-black text-base">€{totalAmount.toFixed(2)}</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-gray-400 font-bold hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-brand-green text-brand-black font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
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
        className={s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700 fill-gray-700'}
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
        <Loader2 size={32} className="animate-spin text-brand-green" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle size={40} className="text-red-400" />
        <h2 className="text-2xl font-black text-white">Profile not found</h2>
        <p className="text-gray-500">{error || 'This freelancer profile does not exist.'}</p>
        <Link to="/marketplace" className="mt-4 px-6 py-3 bg-brand-green text-brand-black font-black rounded-xl text-sm">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const isVerified = profile.kycVerified || profile.creatorStatus === 'approved' || profile.creatorStatus === 'APPROVED';
  const isSelf = user?.id === id;
  const isLoggedIn = !!user;

  return (
    <div className="relative min-h-screen pt-12 pb-24 px-4 overflow-hidden">
      <NeuralBackground parallax={false} />

      {showContractModal && id && (
        <ContractModal
          freelancerId={id}
          freelancerName={profile.name}
          onClose={() => setShowContractModal(false)}
          onCreated={handleContractCreated}
        />
      )}

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Hero Card */}
        <div className="bg-brand-grey/60 border border-white/10 rounded-[3rem] p-10 md:p-14 mb-10 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-28 h-28 rounded-3xl border-2 border-brand-green/30 object-cover" />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-brand-grey border-2 border-brand-green/30 flex items-center justify-center text-brand-green">
                  <User size={40} />
                </div>
              )}
              {isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-green rounded-full flex items-center justify-center shadow-lg" title="Verified">
                  <ShieldCheck size={16} className="text-brand-black" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-white tracking-tighter">{profile.name}</h1>
                {isVerified && (
                  <span className="px-3 py-1 bg-brand-green/10 border border-brand-green/20 rounded-full text-[10px] font-black text-brand-green uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck size={10} /> Verified
                  </span>
                )}
              </div>

              <p className="text-gray-400 text-sm font-medium capitalize mb-3">{profile.role || 'Freelancer'}</p>

              {/* Rating */}
              {profile.avgRating != null && profile.reviewCount > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={profile.avgRating} />
                  <span className="text-white font-bold text-sm">{profile.avgRating.toFixed(1)}</span>
                  <span className="text-gray-500 text-xs">({profile.reviewCount} review{profile.reviewCount !== 1 ? 's' : ''})</span>
                </div>
              )}

              {profile.bio && (
                <p className="text-gray-300 leading-relaxed mb-6 max-w-xl">{profile.bio}</p>
              )}
              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[11px] font-bold text-gray-400">{skill}</span>
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
                  className="flex items-center gap-2 px-6 py-3 bg-brand-green text-brand-black font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-60 disabled:scale-100"
                >
                  {messagingLoading
                    ? <Loader2 size={15} className="animate-spin" />
                    : <MessageSquare size={15} />}
                  Message
                </button>

                {isLoggedIn && (
                  <button
                    onClick={() => setShowContractModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/10 transition-colors"
                  >
                    <FileText size={15} className="text-brand-green" />
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
                <h2 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-6">Portfolio</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {portfolio.map((item: any) => (
                    <div key={item.id} className="bg-brand-grey/40 border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-colors">
                      {(item.imageUrl || item.fileType?.startsWith('image/')) && (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                        {item.description && <p className="text-gray-500 text-xs">{item.description}</p>}
                        {item.fileUrl && (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-brand-green text-[11px] font-bold mt-3 hover:underline"
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
              <div className="bg-brand-grey/40 border border-white/5 rounded-2xl p-10 text-center">
                <Briefcase size={28} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-600 text-sm font-bold">No portfolio items yet</p>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h2 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-6">
                  Reviews <span className="text-gray-700 font-normal">({reviews.length})</span>
                </h2>
                <div className="space-y-4">
                  {reviews.map((rev: any) => (
                    <div key={rev.id} className="bg-brand-grey/40 border border-white/5 rounded-2xl p-5">
                      <div className="flex items-start gap-4">
                        {rev.reviewer?.avatar ? (
                          <img src={rev.reviewer.avatar} alt={rev.reviewer.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            <User size={16} className="text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-white font-bold text-sm">{rev.reviewer?.name || 'Anonymous'}</span>
                            <StarRating rating={rev.rating} size={12} />
                            <span className="text-gray-600 text-[11px] ml-auto">
                              {new Date(rev.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          {rev.comment && (
                            <p className="text-gray-400 text-sm leading-relaxed">{rev.comment}</p>
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
            <div className="bg-brand-grey/40 border border-white/5 rounded-2xl p-6">
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-5">Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={16} className="text-gray-600 shrink-0" />
                  <span className="text-gray-400">Member since <span className="text-white font-bold">{profile.createdAt ? new Date(profile.createdAt).getFullYear() : '—'}</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck size={16} className={isVerified ? 'text-brand-green shrink-0' : 'text-gray-600 shrink-0'} />
                  <span className="text-gray-400">
                    KYC: <span className={`font-bold ${isVerified ? 'text-brand-green' : 'text-yellow-400'}`}>{isVerified ? 'Verified' : 'Pending'}</span>
                  </span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={16} className="text-gray-600 shrink-0" />
                    <span className="text-gray-400">{profile.location}</span>
                  </div>
                )}
                {profile.avgRating != null && profile.reviewCount > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <Star size={16} className="text-yellow-400 shrink-0" />
                    <span className="text-gray-400">
                      <span className="text-white font-bold">{profile.avgRating.toFixed(1)}</span> avg rating
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
                  className="w-full py-3 bg-brand-green/10 border border-brand-green/20 rounded-2xl text-center text-sm font-black text-brand-green hover:bg-brand-green/15 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {messagingLoading ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                  Send message
                </button>
                <button
                  onClick={() => setShowContractModal(true)}
                  className="w-full py-3 bg-white/3 border border-white/8 rounded-2xl text-center text-sm font-bold text-gray-300 hover:bg-white/8 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText size={14} className="text-brand-green" />
                  Propose a contract
                </button>
              </div>
            )}

            <Link
              to="/marketplace"
              className="flex items-center justify-center gap-1.5 w-full py-4 bg-brand-grey/40 border border-white/5 rounded-2xl text-center text-xs font-black text-gray-400 hover:text-white hover:border-white/10 transition-colors"
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
