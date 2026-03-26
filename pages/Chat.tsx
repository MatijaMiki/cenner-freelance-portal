import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import { connectSocket, getSocket } from '../hooks/useSocket';
import SEO from '../components/SEO';

interface Message {
  id: string;
  content: string;
  senderId: string;
  flagged: boolean;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string };
}

const Chat: React.FC = () => {
  const { id: convId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<{ name: string; avatar?: string } | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || !convId) { navigate('/auth'); return; }

    // Load messages
    API.getMessages(convId)
      .then((msgs: Message[]) => {
        setMessages(msgs);
        // Extract other user from messages
        const other = msgs.find(m => m.senderId !== user.id)?.sender;
        if (other) setOtherUser(other);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Socket
    const socket = connectSocket();
    socket.emit('join_conversation', convId);
    socket.emit('mark_read', { conversationId: convId });

    const onNewMessage = (msg: Message) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (msg.senderId !== user.id) {
        socket.emit('mark_read', { conversationId: convId });
        setOtherUser(prev => prev ?? msg.sender);
      }
    };
    const onTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        isTyping ? next.add(userId) : next.delete(userId);
        return next;
      });
    };

    socket.on('new_message', onNewMessage);
    socket.on('user_typing', onTyping);

    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('user_typing', onTyping);
    };
  }, [convId, user, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || sending || !convId) return;
    const socket = getSocket();
    if (!socket) return;
    setSending(true);
    socket.emit('send_message', { conversationId: convId, content: input.trim() });
    setInput('');
    setSending(false);
  }, [input, sending, convId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const socket = getSocket();
    if (!socket || !convId) return;
    socket.emit('typing', { conversationId: convId, isTyping: true });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('typing', { conversationId: convId, isTyping: false });
    }, 1500);
  };

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="flex flex-col h-screen bg-brand-black">
      <SEO title={`Chat — ${otherUser?.name || ''}`} canonical={`/messages/${convId}`} description="Direct message" />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-brand-grey/80 backdrop-blur-md flex-shrink-0">
        <button onClick={() => navigate('/messages')} className="text-gray-400 hover:text-white transition-colors p-1">
          <ArrowLeft size={20} />
        </button>
        {otherUser && (
          <>
            {otherUser.avatar ? (
              <img src={otherUser.avatar} alt={otherUser.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green font-black text-sm">
                {otherUser.name[0]}
              </div>
            )}
            <span className="font-bold text-white text-sm">{otherUser.name}</span>
          </>
        )}
        {typingUsers.size > 0 && (
          <span className="text-xs text-gray-500 ml-auto animate-pulse">typing…</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-gray-600" size={24} /></div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-600 text-sm pt-20">Start the conversation</div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {msg.flagged && (
                    <div className="flex items-center gap-1 text-yellow-500/80 text-[10px] font-medium px-1">
                      <AlertTriangle size={10} />
                      Platform reminder: keep communication on Cenner to stay protected
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
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-white/5 bg-brand-grey/80 backdrop-blur-md">
        <div className="flex items-end gap-3 bg-brand-black border border-white/10 rounded-2xl px-4 py-2 focus-within:border-brand-green/40 transition-colors">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message…"
            rows={1}
            className="flex-1 bg-transparent text-white text-sm resize-none outline-none placeholder-gray-600 py-1.5 max-h-32"
            style={{ scrollbarWidth: 'none' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 w-8 h-8 bg-brand-green rounded-xl flex items-center justify-center text-brand-black transition-all hover:scale-105 disabled:opacity-30 disabled:scale-100"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-gray-700 text-center mt-2">
          Keep conversations on Cenner to maintain payment protection
        </p>
      </div>
    </div>
  );
};

export default Chat;
