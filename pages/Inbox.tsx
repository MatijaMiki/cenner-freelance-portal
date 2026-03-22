import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Clock, Search, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import NeuralBackground from '../components/NeuralBackground';
import SEO from '../components/SEO';

interface Conversation {
  id: string;
  other: { id: string; name: string; avatar?: string };
  lastMessage?: string;
  lastMessageAt?: string;
  unread: number;
}

const Inbox: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    API.getConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  function timeAgo(dateStr?: string) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const filtered = conversations.filter(c =>
    c.other.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen">
      <SEO title="Messages" canonical="/messages" description="Your messages on Cenner" />
      <NeuralBackground parallax={false} />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-brand-green/10 rounded-2xl">
            <MessageCircle className="text-brand-green" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Messages</h1>
            <p className="text-gray-500 text-xs">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-brand-grey/80 backdrop-blur-sm border border-white/10 rounded-[2rem] overflow-hidden">

          {/* Search */}
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-green/40 transition-colors"
              />
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex flex-col gap-3 p-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-white/5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-1/3" />
                    <div className="h-3 bg-white/5 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-green/5 border border-brand-green/10 flex items-center justify-center mb-4">
                <MessageCircle className="text-brand-green/40" size={28} />
              </div>
              <p className="text-white font-bold mb-1">
                {search ? 'No results found' : 'No conversations yet'}
              </p>
              <p className="text-gray-500 text-sm">
                {search ? 'Try a different name.' : "Visit a freelancer's profile and hit Message to start chatting."}
              </p>
              {!search && (
                <button
                  onClick={() => navigate('/poslovi')}
                  className="mt-6 px-5 py-2.5 bg-brand-green text-brand-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
                >
                  Browse Freelancers
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/3 transition-colors text-left group"
                >
                  <div className="relative shrink-0">
                    {conv.other.avatar ? (
                      <img src={conv.other.avatar} alt={conv.other.name} className="w-12 h-12 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green font-black text-lg">
                        {conv.other.name[0]?.toUpperCase()}
                      </div>
                    )}
                    {conv.unread > 0 && (
                      <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-brand-green rounded-full flex items-center justify-center text-brand-black text-[10px] font-black">
                        {conv.unread > 9 ? '9+' : conv.unread}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-sm ${conv.unread > 0 ? 'text-white' : 'text-gray-300'} group-hover:text-white transition-colors`}>
                        {conv.other.name}
                      </span>
                      <span className="flex items-center gap-1 text-gray-600 text-[11px] shrink-0 ml-2">
                        <Clock size={10} />
                        {timeAgo(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${conv.unread > 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>

                  {conv.unread > 0 && (
                    <div className="w-2 h-2 rounded-full bg-brand-green shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
