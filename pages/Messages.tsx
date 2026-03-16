import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Send, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import NeuralBackground from '../components/NeuralBackground';

interface Conversation {
  id: string;
  otherUserId: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageAt: string | null;
  unread: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoadingConvs(true);
    API.getConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoadingConvs(false));
  }, [user]);

  useEffect(() => {
    if (!selected) return;
    setLoadingMsgs(true);
    API.getMessages(selected.id)
      .then(msgs => {
        setMessages(msgs);
        // Clear unread count locally
        setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, unread: 0 } : c));
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
  }, [selected?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null;

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    try {
      const msg = await API.sendMessage(selected.id, input.trim());
      setMessages(prev => [...prev, msg]);
      setConversations(prev => prev.map(c =>
        c.id === selected.id ? { ...c, lastMessage: input.trim() } : c
      ));
      setInput('');
    } catch {
      // silently ignore
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
      <NeuralBackground parallax={false} />

      <div className="relative z-10 h-full flex max-w-6xl mx-auto px-4">
        {/* Sidebar */}
        <div className={`flex flex-col border-r border-white/5 bg-brand-black/60 backdrop-blur-xl ${selected ? 'hidden md:flex w-80' : 'flex w-full md:w-80'}`}>
          <div className="p-5 border-b border-white/5">
            <h1 className="text-xl font-black text-white mb-4">Messages</h1>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-brand-grey/40 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-brand-green/30 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 size={20} className="text-gray-600 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageSquare size={32} className="text-gray-700 mb-4" />
                <p className="text-gray-600 font-bold text-sm">No conversations yet</p>
                <p className="text-gray-700 text-xs mt-1">Messages from clients and freelancers will appear here.</p>
              </div>
            ) : (
              filtered.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`w-full flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors text-left ${selected?.id === conv.id ? 'bg-white/5' : ''}`}
                >
                  <div className="relative shrink-0">
                    {conv.avatar ? (
                      <img src={conv.avatar} alt={conv.name} className="w-11 h-11 rounded-full" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-brand-grey border border-white/10 flex items-center justify-center text-gray-500">
                        <User size={18} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-sm truncate">{conv.name}</span>
                      <span className="text-gray-600 text-[10px] shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                    </div>
                    <p className="text-gray-500 text-xs truncate mt-0.5">{conv.lastMessage || 'No messages yet'}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="shrink-0 w-5 h-5 bg-brand-green rounded-full flex items-center justify-center text-brand-black text-[10px] font-black">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className={`flex-1 flex flex-col ${!selected ? 'hidden md:flex' : 'flex'}`}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-brand-black/30 backdrop-blur-xl">
              <div className="w-20 h-20 bg-brand-grey rounded-full flex items-center justify-center text-gray-600 mb-6">
                <MessageSquare size={32} />
              </div>
              <h2 className="text-white font-black text-xl mb-2">Select a conversation</h2>
              <p className="text-gray-600 text-sm max-w-xs">Choose a contact on the left to start messaging.</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-white/5 bg-brand-black/60 backdrop-blur-xl flex items-center gap-4">
                <button onClick={() => setSelected(null)} className="md:hidden p-2 text-gray-500 hover:text-white transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-brand-grey flex items-center justify-center text-gray-500">
                  {selected.avatar ? (
                    <img src={selected.avatar} alt={selected.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <p className="text-white font-bold text-sm">{selected.name}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-brand-black/30 backdrop-blur-xl">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 size={20} className="text-gray-600 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-gray-700 text-sm">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === (user as any).id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-brand-green text-brand-black font-medium rounded-br-sm'
                            : 'bg-brand-grey border border-white/5 text-white rounded-bl-sm'
                        }`}>
                          {msg.content}
                          <div className={`text-[10px] mt-1 ${isMe ? 'text-brand-black/60' : 'text-gray-600'}`}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-brand-black/60 backdrop-blur-xl flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 bg-brand-grey/40 border border-white/5 rounded-xl py-3 px-4 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-brand-green/30 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="w-12 h-12 bg-brand-green rounded-xl flex items-center justify-center text-brand-black hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
