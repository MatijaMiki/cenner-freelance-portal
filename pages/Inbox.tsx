import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MessageCircle, Search, Send, AlertTriangle, Loader2,
  ShieldCheck, Star, Mail, Phone, BadgeCheck, User,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import { connectSocket, getSocket } from '../hooks/useSocket';
import SEO from '../components/SEO';

interface Conversation {
  id: string;
  other: { id: string; name: string; avatar?: string };
  lastMessage?: string;
  lastMessageAt?: string;
  unread: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  flagged: boolean;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string };
}

interface OtherProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  kycVerified?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  avgRating?: number;
  reviewCount?: number;
}

const MessagingHub: React.FC = () => {
  const { id: activeConvId } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convsLoading, setConvsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Active chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [otherProfile, setOtherProfile] = useState<OtherProfile | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load conversations
  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    API.getConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setConvsLoading(false));
  }, [user]);

  // Load messages + socket for active conversation
  useEffect(() => {
    if (!activeConvId || !user || !token) return;

    setMessages([]);
    setMessagesLoading(true);
    setOtherProfile(null);

    API.getMessages(activeConvId)
      .then((msgs: Message[]) => {
        setMessages(msgs);
        const other = msgs.find(m => m.senderId !== user.id)?.sender;
        if (other) {
          setOtherProfile(prev => prev ?? { id: other.id, name: other.name, avatar: other.avatar });
          API.getProfile(other.id).then(p => setOtherProfile(p)).catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setMessagesLoading(false));

    // Also get other user from conversation list
    const conv = conversations.find(c => c.id === activeConvId);
    if (conv) {
      setOtherProfile(prev => prev ?? { id: conv.other.id, name: conv.other.name, avatar: conv.other.avatar });
      API.getProfile(conv.other.id).then(p => setOtherProfile(p)).catch(() => {});
    }

    const socket = connectSocket(token);
    socket.emit('join_conversation', activeConvId);
    socket.emit('mark_read', { conversationId: activeConvId });

    // Update unread count in conversation list
    setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, unread: 0 } : c));

    const onNewMessage = (msg: Message) => {
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
  }, [activeConvId, token, user]);

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

  const filtered = conversations.filter(c => c.other.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-80px)] bg-brand-black overflow-hidden">
      <SEO title="Messages" canonical="/messages" description="Your messages on Cenner" />

      {/* ── LEFT: Conversation list ───────────────────────────────── */}
      <div className="w-72 flex-shrink-0 border-r border-white/5 flex flex-col">
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="text-brand-green" size={18} />
            <span className="text-white font-black text-base tracking-tight">Messages</span>
            {conversations.reduce((s, c) => s + c.unread, 0) > 0 && (
              <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-brand-green rounded-full text-brand-black text-[10px] font-black flex items-center justify-center">
                {conversations.reduce((s, c) => s + c.unread, 0)}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={13} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-green/30 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-2.5 bg-white/5 rounded w-1/2" />
                    <div className="h-2 bg-white/5 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 px-4 text-center">
              <MessageCircle className="text-gray-700 mb-3" size={32} />
              <p className="text-gray-500 text-xs">{search ? 'No results' : 'No conversations yet'}</p>
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
                      ? 'bg-brand-green/8 border-brand-green'
                      : 'border-transparent hover:bg-white/3'
                  }`}
                >
                  <div className="relative shrink-0">
                    {conv.other.avatar ? (
                      <img src={conv.other.avatar} alt={conv.other.name} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green font-black text-sm">
                        {conv.other.name[0]?.toUpperCase()}
                      </div>
                    )}
                    {conv.unread > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-green rounded-full flex items-center justify-center text-brand-black text-[9px] font-black">
                        {conv.unread > 9 ? '9+' : conv.unread}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold truncate ${conv.unread > 0 ? 'text-white' : 'text-gray-300'}`}>
                        {conv.other.name}
                      </span>
                      <span className="text-gray-600 text-[10px] shrink-0 ml-1">{timeAgo(conv.lastMessageAt)}</span>
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${conv.unread > 0 ? 'text-gray-400' : 'text-gray-600'}`}>
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
            <div className="w-16 h-16 rounded-full bg-brand-green/5 border border-brand-green/10 flex items-center justify-center mb-4">
              <MessageCircle className="text-brand-green/30" size={28} />
            </div>
            <p className="text-white font-bold mb-1">Select a conversation</p>
            <p className="text-gray-600 text-sm">or start one from a freelancer's profile</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 bg-brand-grey/40 flex-shrink-0">
              {otherProfile?.avatar ? (
                <img src={otherProfile.avatar} alt={otherProfile.name} className="w-8 h-8 rounded-xl object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green font-black text-sm">
                  {otherProfile?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div>
                <span className="font-bold text-white text-sm">{otherProfile?.name}</span>
                {typingUsers.size > 0 && (
                  <p className="text-[11px] text-brand-green animate-pulse">typing…</p>
                )}
              </div>
              <div className="ml-auto">
                <div className="flex items-center gap-1 text-[10px] text-gray-600 bg-white/3 border border-white/5 rounded-lg px-2.5 py-1.5">
                  <ShieldCheck size={10} className="text-brand-green" />
                  Keep payments on Cenner
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center pt-20">
                  <Loader2 className="animate-spin text-gray-600" size={22} />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-600 text-sm pt-20">Say hello 👋</div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && (
                        msg.sender.avatar ? (
                          <img src={msg.sender.avatar} alt={msg.sender.name} className="w-7 h-7 rounded-xl object-cover shrink-0 mb-4" />
                        ) : (
                          <div className="w-7 h-7 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green text-[10px] font-black shrink-0 mb-4">
                            {msg.sender.name[0]}
                          </div>
                        )
                      )}
                      <div className={`flex flex-col gap-1 max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                        {msg.flagged && (
                          <div className="flex items-center gap-1 text-yellow-500/70 text-[10px] px-1">
                            <AlertTriangle size={9} />
                            Keep communication on Cenner for payment protection
                          </div>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-brand-green text-brand-black font-medium rounded-br-sm'
                            : 'bg-brand-grey border border-white/5 text-gray-200 rounded-bl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-gray-600 px-1">{formatTime(msg.createdAt)}</span>
                      </div>
                      {isMe && (
                        user?.avatar ? (
                          <img src={user.avatar} alt="You" className="w-7 h-7 rounded-xl object-cover shrink-0 mb-4" />
                        ) : (
                          <div className="w-7 h-7 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green text-[10px] font-black shrink-0 mb-4">
                            {user?.name?.[0]}
                          </div>
                        )
                      )}
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-white/5">
              <div className="flex items-end gap-3 bg-brand-grey border border-white/8 rounded-2xl px-4 py-2.5 focus-within:border-brand-green/30 transition-colors">
                <textarea
                  value={input}
                  onChange={handleTyping}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a message…"
                  rows={1}
                  className="flex-1 bg-transparent text-white text-sm resize-none outline-none placeholder-gray-600 py-1 max-h-32"
                  style={{ scrollbarWidth: 'none' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="shrink-0 w-8 h-8 bg-brand-green rounded-xl flex items-center justify-center text-brand-black hover:scale-105 transition-all disabled:opacity-30 disabled:scale-100"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT: Profile summary ────────────────────────────────── */}
      <div className="w-64 flex-shrink-0 border-l border-white/5 flex flex-col overflow-y-auto">
        {otherProfile ? (
          <div className="p-5 space-y-5">
            {/* Avatar + name */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="relative mb-3">
                {otherProfile.avatar ? (
                  <img src={otherProfile.avatar} alt={otherProfile.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-green/20" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-brand-green/10 border-2 border-brand-green/20 flex items-center justify-center text-brand-green font-black text-2xl">
                    {otherProfile.name[0]?.toUpperCase()}
                  </div>
                )}
                {otherProfile.kycVerified && (
                  <div className="absolute -bottom-2 -right-2">
                    <BadgeCheck size={22} className="text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]" fill="#1a1a1a" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <h3 className="text-white font-bold text-sm">{otherProfile.name}</h3>
              {otherProfile.avgRating != null && otherProfile.avgRating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-gray-400 text-xs font-medium">{otherProfile.avgRating.toFixed(1)}</span>
                  <span className="text-gray-600 text-xs">({otherProfile.reviewCount})</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {otherProfile.bio && (
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-1.5">About</p>
                <p className="text-gray-400 text-xs leading-relaxed">{otherProfile.bio}</p>
              </div>
            )}

            {/* Verifications */}
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-2">Verifications</p>
              <div className="space-y-1.5">
                <div className={`flex items-center gap-2 text-xs ${otherProfile.kycVerified ? 'text-brand-green' : 'text-gray-600'}`}>
                  <BadgeCheck size={13} className={otherProfile.kycVerified ? 'text-amber-400' : 'text-gray-700'} />
                  Identity {otherProfile.kycVerified ? 'verified' : 'not verified'}
                </div>
                <div className={`flex items-center gap-2 text-xs ${otherProfile.emailVerified ? 'text-brand-green' : 'text-gray-600'}`}>
                  <Mail size={13} />
                  Email {otherProfile.emailVerified ? 'verified' : 'not verified'}
                </div>
                <div className={`flex items-center gap-2 text-xs ${otherProfile.phoneVerified ? 'text-brand-green' : 'text-gray-600'}`}>
                  <Phone size={13} />
                  Phone {otherProfile.phoneVerified ? 'verified' : 'not verified'}
                </div>
              </div>
            </div>

            {/* Skills */}
            {otherProfile.skills && otherProfile.skills.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {otherProfile.skills.slice(0, 8).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-white/5 border border-white/8 rounded-lg text-gray-400 text-[10px]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* View profile */}
            <button
              onClick={() => navigate(`/freelancer/${otherProfile.id}`)}
              className="w-full py-2.5 border border-white/10 rounded-xl text-gray-400 text-xs font-bold hover:border-brand-green/30 hover:text-brand-green transition-colors"
            >
              View full profile
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
            <User className="text-gray-700 mb-2" size={28} />
            <p className="text-gray-600 text-xs">Select a conversation to see the profile</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingHub;
