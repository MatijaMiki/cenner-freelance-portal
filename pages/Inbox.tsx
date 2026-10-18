import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MessageCircle, Search, Send, AlertTriangle, Loader2,
  ShieldCheck, Star, X, BadgeCheck, Mail, Phone,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import AvatarImg from '../components/Avatar';
import { connectSocket, getSocket } from '../hooks/useSocket';
import SEO from '../components/SEO';
import type { DMConversation, DMMessage } from '../types';

interface OtherProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  kycVerified?: boolean;
  emailVerified?: boolean;
  mobileVerified?: boolean;
  avgRating?: number;
  reviewCount?: number;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer: { id: string; name: string; avatar?: string };
}

interface CompletedContract {
  id: string;
  title: string;
  clientId: string;
  freelancerId: string;
}

const MessagingHub: React.FC = () => {
  const { id: activeConvId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Conversations
  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [convsLoading, setConvsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Active chat
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [otherProfile, setOtherProfile] = useState<OtherProfile | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [completedContracts, setCompletedContracts] = useState<CompletedContract[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPaymentSafetyPopout, setShowPaymentSafetyPopout] = useState(false);
  const [reviewContractId, setReviewContractId] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load conversations — when done, resolve otherProfile if not yet set
  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    API.getConversations()
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setConversations(list);
        // If a conversation is active but profile not yet resolved, load it now
        if (activeConvId) {
          const conv = list.find(c => c.id === activeConvId);
          if (conv?.other) {
            setOtherProfile(prev => prev ?? { id: conv.other.id, name: conv.other.name, avatar: conv.other.avatar });
            API.getProfile(conv.other.id).then(p => { if (p) setOtherProfile(p); }).catch(() => {});
            API.getUserReviews(conv.other.id).then(d => setReviews(Array.isArray(d) ? d : [])).catch(() => {});
            API.getCompletedContracts(conv.other.id).then(d => setCompletedContracts(Array.isArray(d) ? d : [])).catch(() => {});
          }
        }
      })
      .catch(() => {})
      .finally(() => setConvsLoading(false));
  }, [user, activeConvId]);

  // Load messages + socket for active conversation
  useEffect(() => {
    if (!activeConvId || !user) return;

    setMessages([]);
    setMessagesLoading(true);
    setOtherProfile(null);

    // Try to resolve the other user from the already-loaded conversation list first
    const conv = conversations.find(c => c.id === activeConvId);
    if (conv?.other) {
      setOtherProfile({ id: conv.other.id, name: conv.other.name, avatar: conv.other.avatar });
      API.getProfile(conv.other.id).then(p => { if (p) setOtherProfile(p); }).catch(() => {});
      API.getUserReviews(conv.other.id).then(d => setReviews(Array.isArray(d) ? d : [])).catch(() => {});
      API.getCompletedContracts(conv.other.id).then(d => setCompletedContracts(Array.isArray(d) ? d : [])).catch(() => {});
    }

    API.getMessages(activeConvId)
      .then((msgs: DMMessage[]) => {
        setMessages(msgs);
        // Only derive other user from messages if we didn't already get it from conversations
        const other = msgs.find(m => m.senderId !== user.id)?.sender;
        if (other) {
          setOtherProfile(prev => prev ?? { id: other.id, name: other.name, avatar: other.avatar });
          API.getProfile(other.id).then(p => { if (p) setOtherProfile(p); }).catch(() => {});
          API.getUserReviews(other.id).then(d => setReviews(Array.isArray(d) ? d : [])).catch(() => {});
          API.getCompletedContracts(other.id).then(d => setCompletedContracts(Array.isArray(d) ? d : [])).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setMessagesLoading(false));

    const socket = connectSocket();
    socket.emit('join_conversation', activeConvId);
    socket.emit('mark_read', { conversationId: activeConvId });

    // Update unread count in conversation list
    setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, unread: 0 } : c));

    const onNewMessage = (msg: DMMessage) => {
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
      if (msg.senderId !== user.id) {
        socket.emit('mark_read', { conversationId: activeConvId });
        setOtherProfile(prev => prev ?? { id: msg.sender.id, name: msg.sender.name, avatar: msg.sender.avatar });
      }
      // Update last message in list
      setConversations(prev => prev.map(c =>
        c.id === activeConvId ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt } : c
      ));
    };

    const onTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => { const n = new Set(prev); isTyping ? n.add(userId) : n.delete(userId); return n; });
    };

    socket.on('new_message', onNewMessage);
    socket.on('user_typing', onTyping);
    return () => { socket.off('new_message', onNewMessage); socket.off('user_typing', onTyping); };
  }, [activeConvId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || sending || !activeConvId) return;
    const socket = getSocket();
    if (!socket) return;
    setSending(true);
    socket.emit('send_message', { conversationId: activeConvId, content: input.trim() });
    setInput('');
    setSending(false);
  }, [input, sending, activeConvId]);

  const sendReviewRequest = useCallback((contract: CompletedContract) => {
    const socket = getSocket();
    if (!socket || !activeConvId) return;
    socket.emit('send_review_request', {
      conversationId: activeConvId,
      contractId: contract.id,
      contractTitle: contract.title,
    });
    setCompletedContracts(prev => prev.filter(c => c.id !== contract.id));
  }, [activeConvId]);

  const submitReview = async () => {
    if (!reviewContractId || reviewRating === 0) return;
    setReviewSubmitting(true);
    try {
      await API.submitReview(reviewContractId, reviewRating, reviewComment);
      if (otherProfile) {
        API.getUserReviews(otherProfile.id).then(setReviews).catch(() => {});
        API.getProfile(otherProfile.id).then(p => setOtherProfile(p)).catch(() => {});
      }
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewComment('');
      setReviewContractId('');
    } catch {
      // already reviewed or other error — still close
      setShowReviewModal(false);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const socket = getSocket();
    if (!socket || !activeConvId) return;
    socket.emit('typing', { conversationId: activeConvId, isTyping: true });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => socket.emit('typing', { conversationId: activeConvId, isTyping: false }), 1500);
  };

  function timeAgo(d?: string) {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }

  function formatTime(d: string) {
    return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const filtered = (conversations ?? []).filter(c =>
    c.other != null && (!search || c.other.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-[calc(100vh-80px)] bg-paper overflow-hidden">
      <SEO title="Messages" canonical="/messages" description="Your messages on Cenner" />

      {/* ── LEFT: Conversation list ───────────────────────────────── */}
      {/* On mobile: hidden when a conversation is active */}
      <div className={`w-72 flex-shrink-0 border-r border-ink/15 flex flex-col ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-ink/15 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="text-leaf" size={18} />
            <span className="text-ink font-black text-base tracking-tight">Messages</span>
            {(conversations ?? []).reduce((s, c) => s + (c.unread ?? 0), 0) > 0 && (
              <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-sky text-white text-[12px] font-black flex items-center justify-center">
                {(conversations ?? []).reduce((s, c) => s + (c.unread ?? 0), 0)}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" size={13} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-ink/5 border-2 border-ink pl-8 pr-3 py-2 text-xs text-ink placeholder:text-slate focus:outline-none focus:border-sky transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-ink/5 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-2.5 bg-ink/5 w-1/2" />
                    <div className="h-2 bg-ink/5 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 px-4 text-center">
              <MessageCircle className="text-slate mb-3" size={32} />
              <p className="text-slate text-xs">{search ? 'No results' : 'No conversations yet'}</p>
            </div>
          ) : (
            filtered.map(conv => {
              const isActive = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-2 ${
                    isActive
                      ? 'bg-leaf/10 border-ink'
                      : 'border-transparent hover:bg-ink/5'
                  }`}
                >
                  <div className="relative shrink-0">
                    <AvatarImg src={conv.other?.avatar} name={conv.other?.name} size={40} className="" />
                    {conv.unread > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-sky flex items-center justify-center text-white text-[12px] font-black">
                        {conv.unread > 9 ? '9+' : conv.unread}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold truncate ${conv.unread > 0 ? 'text-ink' : 'text-ink'}`}>
                        {conv.other?.name ?? 'Unknown'}
                      </span>
                      <span className="text-slate text-[12px] shrink-0 ml-1">{timeAgo(conv.lastMessageAt)}</span>
                    </div>
                    <p className={`text-[12px] truncate mt-0.5 ${conv.unread > 0 ? 'text-slate' : 'text-slate'}`}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── MIDDLE: Chat body ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 bg-leaf/10 border border-ink flex items-center justify-center mb-4">
              <MessageCircle className="text-brand-green/30" size={28} />
            </div>
            <p className="text-ink font-bold mb-1">Select a conversation</p>
            <p className="text-slate text-sm">or start one from a freelancer's profile</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-ink/15 bg-white flex-shrink-0">
              {/* Back to list — mobile only */}
              <button
                onClick={() => navigate('/messages')}
                className="md:hidden flex-shrink-0 w-8 h-8 bg-ink/5 flex items-center justify-center text-slate hover:text-ink transition-colors"
                aria-label="Back to conversations"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              </button>
              <AvatarImg src={otherProfile?.avatar} name={otherProfile?.name} size={32} className="flex-shrink-0" />
              <div className="min-w-0">
                <span className="font-bold text-ink text-sm truncate block">{otherProfile?.name}</span>
                {typingUsers.size > 0 && (
                  <p className="text-[12px] text-leaf animate-pulse">typing…</p>
                )}
              </div>
              <div className="ml-auto flex-shrink-0 relative">
                <button
                  onClick={() => setShowPaymentSafetyPopout(v => !v)}
                  className="hidden sm:flex items-center gap-1 text-[12px] text-slate hover:text-ink bg-ink/5 border-2 border-ink hover:border-ink px-2.5 py-1.5 transition-colors"
                >
                  <ShieldCheck size={10} className="text-leaf" />
                  Keep payments on Cenner
                </button>
                {showPaymentSafetyPopout && (
                  <div className="absolute top-full right-0 mt-2 w-96 bg-white border-2 border-ink p-6 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center gap-3 mb-4">
                      <ShieldCheck size={20} className="text-leaf flex-shrink-0" />
                      <p className="text-base font-bold text-ink">Why keep payments on Cenner?</p>
                    </div>
                    <ul className="space-y-4 text-sm text-slate leading-relaxed">
                      <li className="flex gap-3"><span className="text-leaf mt-0.5 font-black">✓</span><span>Payments are processed through Cenner's milestone system. Funds are only released to the freelancer once you approve the delivered work.</span></li>
                      <li className="flex gap-3"><span className="text-leaf mt-0.5 font-black">✓</span><span>Dispute resolution is available for all platform payments. Off-platform transactions are not covered.</span></li>
                      <li className="flex gap-3"><span className="text-leaf mt-0.5 font-black">✓</span><span>Paying outside Cenner violates our Terms of Service and removes all buyer and seller protections.</span></li>
                    </ul>
                    <button onClick={() => setShowPaymentSafetyPopout(false)} className="mt-5 w-full text-xs font-black text-slate hover:text-ink transition-colors uppercase tracking-widest">Got it</button>
                  </div>
                )}
              </div>
            </div>

            {/* Off-platform safety notice — pinned at the top of every thread */}
            <div className="flex-shrink-0 flex items-start gap-2.5 mx-6 mt-4 bg-leaf/10 border border-ink px-4 py-3">
              <ShieldCheck size={15} className="text-leaf shrink-0 mt-0.5" />
              <p className="text-[12px] text-slate leading-relaxed">
                Keep all communication and payments on Cenner. Sharing personal contact details or taking the deal off-platform to avoid fees violates our{' '}
                <button onClick={() => navigate('/terms')} className="text-leaf hover:underline font-semibold">Terms of Service</button>
                {' '}and voids buyer and seller protection.
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center pt-20">
                  <Loader2 className="animate-spin text-slate" size={22} />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-slate text-sm pt-20">Say hello 👋</div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === user?.id;
                  // Review request card
                  let reviewReq: { _type: string; contractId: string; contractTitle: string } | null = null;
                  // (only a JSON body can be one: plain text would throw, for every message on every render)
                  if (msg.content?.trimStart().startsWith('{')) { try { const p = JSON.parse(msg.content); if (p?._type === 'review_request') reviewReq = p; } catch {} }
                  if (reviewReq) {
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[70%] bg-white border border-ink p-4 flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <Star size={14} className="text-ink fill-ink" />
                            <span className="text-ink text-xs font-bold">Review Request</span>
                          </div>
                          <p className="text-slate text-[12px] leading-relaxed">
                            {isMe ? 'You asked' : `${msg.sender?.name ?? 'They'} asked`} for a review on:<br />
                            <span className="text-ink font-semibold">{reviewReq.contractTitle}</span>
                          </p>
                          {!isMe && (
                            <button
                              onClick={() => { setReviewContractId(reviewReq!.contractId); setShowReviewModal(true); }}
                              className="py-2 bg-sky text-white text-xs font-black hover:opacity-90 transition-opacity"
                            >
                              Leave a Review
                            </button>
                          )}
                          <span className="text-[12px] text-slate">{formatTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={msg.id} className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && (
                        <AvatarImg src={msg.sender?.avatar} name={msg.sender?.name} size={28} className="shrink-0 mb-4" />
                      )}
                      <div className={`flex flex-col gap-1 max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                        {msg.flagged && (
                          <div className="flex items-center gap-1 text-yellow-500/70 text-[12px] px-1">
                            <AlertTriangle size={9} />
                            Keep communication on Cenner for payment protection
                          </div>
                        )}
                        <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                          isMe
                            ? 'bg-sky text-white font-medium'
                            : 'bg-white border-2 border-ink text-ink'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[12px] text-slate px-1">{formatTime(msg.createdAt)}</span>
                      </div>
                      {isMe && (
                        <AvatarImg src={user?.avatar} name={user?.name} size={28} className="shrink-0 mb-4" />
                      )}
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-ink/15">
              <div className="flex items-end gap-3 bg-white border-2 border-ink px-4 py-2.5 focus-within:border-sky transition-colors">
                <textarea
                  value={input}
                  onChange={handleTyping}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a message…"
                  rows={1}
                  className="flex-1 bg-transparent text-ink text-sm resize-none outline-none placeholder:text-slate py-1 max-h-32"
                  style={{ scrollbarWidth: 'none' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="shrink-0 w-8 h-8 bg-sky flex items-center justify-center text-white hover:scale-105 transition-all disabled:opacity-30 disabled:scale-100"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT: Profile + Reviews ──────────────────────────────── */}
      <div className="hidden lg:flex w-64 flex-shrink-0 border-l border-ink/15 flex-col overflow-y-auto">
        {otherProfile ? (
          <div className="p-5 space-y-5">

            {/* ── Profile summary ── */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="relative mb-3">
                <AvatarImg src={otherProfile.avatar} name={otherProfile.name} size={80} className="border-2 border-ink" />
                {otherProfile.kycVerified && (
                  <div className="absolute -bottom-2 -right-2">
                    <BadgeCheck size={22} className="text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]" fill="#1a1a1a" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <h3 className="text-ink font-bold text-sm">{otherProfile.name}</h3>
              {(otherProfile.avgRating ?? 0) > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star size={11} className="text-ink fill-ink" />
                  <span className="text-slate text-xs font-medium">{otherProfile.avgRating!.toFixed(1)}</span>
                  <span className="text-slate text-xs">({otherProfile.reviewCount})</span>
                </div>
              )}
            </div>

            {/* Verifications */}
            <div className="space-y-1.5">
              <div className={`flex items-center gap-2 text-xs ${otherProfile.kycVerified ? 'text-leaf' : 'text-slate'}`}>
                <BadgeCheck size={13} className={otherProfile.kycVerified ? 'text-ink' : 'text-slate'} />
                Identity {otherProfile.kycVerified ? 'verified' : 'not verified'}
              </div>
              <div className={`flex items-center gap-2 text-xs ${otherProfile.emailVerified ? 'text-leaf' : 'text-slate'}`}>
                <Mail size={13} />
                Email {otherProfile.emailVerified ? 'verified' : 'not verified'}
              </div>
              <div className={`flex items-center gap-2 text-xs ${otherProfile.mobileVerified ? 'text-leaf' : 'text-slate'}`}>
                <Phone size={13} />
                Phone {otherProfile.mobileVerified ? 'verified' : 'not verified'}
              </div>
            </div>

            {otherProfile.bio && (
              <p className="text-slate text-[12px] leading-relaxed border-t border-ink/15 pt-4">{otherProfile.bio}</p>
            )}

            {/* ── Reviews — only shown after a deal exists ── */}
            {(completedContracts.length > 0 || reviews.length > 0) && (
              <>
                <div className="border-t border-ink/15 pt-4">
                  <p className="text-[12px] text-slate uppercase tracking-widest font-bold mb-3">Reviews</p>

                  {/* Request review — visible to freelancer only */}
                  {completedContracts.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {completedContracts.map(c => (
                        <button
                          key={c.id}
                          onClick={() => sendReviewRequest(c)}
                          className="w-full text-left px-3 py-2.5 bg-leaf/10 border border-ink hover:border-ink transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <Star size={11} className="text-leaf shrink-0" />
                            <span className="text-xs text-ink font-medium truncate group-hover:text-leaf transition-colors">{c.title}</span>
                          </div>
                          <p className="text-[12px] text-slate mt-0.5 ml-[19px]">Tap to send review request</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {reviews.length === 0 ? (
                    <p className="text-slate text-xs">No reviews yet</p>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map(r => (
                        <div key={r.id} className="bg-ink/5 border-2 border-ink p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <AvatarImg src={r.reviewer.avatar} name={r.reviewer.name} size={24} className="" />
                            <span className="text-ink text-[12px] font-bold truncate flex-1">{r.reviewer.name}</span>
                            <div className="flex gap-0.5 shrink-0">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} size={8} className={s <= r.rating ? 'text-ink fill-ink' : 'text-slate'} />
                              ))}
                            </div>
                          </div>
                          {r.comment && <p className="text-slate text-[12px] leading-relaxed">{r.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              onClick={() => navigate(`/freelancer/${otherProfile.id}`)}
              className="w-full py-2.5 border-2 border-ink text-slate text-xs font-bold hover:border-ink hover:text-leaf transition-colors"
            >
              View full profile
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
            <MessageCircle className="text-slate mb-2" size={24} />
            <p className="text-slate text-xs">Select a conversation</p>
          </div>
        )}
      </div>

      {/* ── Review submission modal ───────────────────────────────── */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-ink p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-ink font-black text-base">Leave a Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate hover:text-ink transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex justify-center gap-3 mb-5">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setReviewRating(s)}>
                  <Star size={32} className={s <= reviewRating ? 'text-ink fill-ink' : 'text-slate'} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Share your experience (optional)..."
              rows={4}
              className="w-full bg-ink/5 border-2 border-ink px-4 py-3 text-ink text-sm placeholder:text-slate resize-none outline-none focus:border-sky transition-colors mb-4"
            />
            <button
              onClick={submitReview}
              disabled={reviewRating === 0 || reviewSubmitting}
              className="w-full py-3 bg-sky text-white font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingHub;
