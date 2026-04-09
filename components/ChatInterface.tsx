import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Smile, MoreHorizontal, Loader2, Copy, Check } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'freelancer';
  timestamp: string;
  isStreaming?: boolean;
}

// Matches what the backend expects in conversationHistory
interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  freelancerName: string;
  freelancerAvatar: string;
  onStartCall?: () => void;
  // Point this at your Express backend, e.g. "http://localhost:3000"
  backendUrl?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'https://api.cenner.hr';

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ---------------------------------------------------------------------------
// MessageContent — renders **bold** and bullet points
// ---------------------------------------------------------------------------

const MessageContent: React.FC<{ text: string; isUser: boolean }> = ({ text, isUser }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        let processedLine = line.trim();

        const isBullet = processedLine.startsWith('* ') || processedLine.startsWith('- ');
        if (isBullet) processedLine = processedLine.substring(2);

        const parts = processedLine.split(/(\*\*.*?\*\*)/g);
        const content = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={j} className={isUser ? 'text-brand-black' : 'text-white font-black'}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={i} className="flex items-start space-x-2 ml-1">
              <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${isUser ? 'bg-brand-black' : 'bg-brand-green'}`} />
              <p className="flex-grow">{content}</p>
            </div>
          );
        }

        return processedLine ? <p key={i}>{content}</p> : <div key={i} className="h-2" />;
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// ChatInterface
// ---------------------------------------------------------------------------

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  isOpen,
  onClose,
  freelancerName,
  freelancerAvatar,
  onStartCall,
  backendUrl = BACKEND_URL,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      text: `Hi! I'm the Cenner support assistant. I can help you with your account, listings, payments, contracts, and more. What do you need help with?`,
      sender: 'freelancer',
      timestamp: nowTime(),
    },
  ]);

  // Conversation history sent to backend on every request (grows each turn)
  const conversationHistory = useRef<HistoryEntry[]>([]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFlagged, setIsFlagged] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content grows
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [inputText]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  // -------------------------------------------------------------------------
  // Send message
  // -------------------------------------------------------------------------

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping || isFlagged) return;

    const userText = inputText.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: nowTime(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    const botMessageId = (Date.now() + 1).toString();

    // Optimistic bot bubble
    setMessages(prev => [
      ...prev,
      { id: botMessageId, text: '', sender: 'freelancer', timestamp: nowTime(), isStreaming: true },
    ]);

    try {
      const res = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversationHistory: conversationHistory.current,
          // userId can be replaced with a real auth token / user id later
          user_id: 'guest',
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Backend error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const assistantText: string = data.response ?? '';
      const flagged: boolean = data.flagged ?? false;

      // Update the bot bubble with the real response
      setMessages(prev =>
        prev.map(msg =>
          msg.id === botMessageId ? { ...msg, text: assistantText, isStreaming: false } : msg,
        ),
      );

      if (flagged) {
        // Account has been flagged — lock the input so the user can't keep sending
        setIsFlagged(true);
      } else {
        // Only append to history when the exchange was clean
        conversationHistory.current = [
          ...conversationHistory.current,
          { role: 'user', content: userText },
          { role: 'assistant', content: assistantText },
        ];
      }
    } catch (error) {
      console.error('[CHAT ERROR]', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === botMessageId
            ? {
                ...msg,
                text: 'Something went wrong. Please try again in a moment.',
                isStreaming: false,
              }
            : msg,
        ),
      );
    } finally {
      setIsTyping(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="fixed inset-x-0 bottom-0 z-[110] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-full sm:max-w-md animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div className="bg-brand-grey border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col h-[90dvh] sm:h-[650px] overflow-hidden backdrop-blur-3xl ring-1 ring-white/5">

        {/* Header */}
        <div className="p-6 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-brand-green/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src={freelancerAvatar}
                alt={freelancerName}
                className="relative w-11 h-11 rounded-full border border-brand-green/40 object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-brand-green rounded-full border-[3px] border-brand-grey shadow-sm" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-white font-black text-sm tracking-tight">{freelancerName}</h4>
                <div className="px-1.5 py-0.5 bg-brand-green/10 rounded text-[8px] font-black text-brand-green uppercase tracking-tighter">
                  Support
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isFlagged ? 'bg-red-500' : 'bg-brand-green animate-pulse'}`} />
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.1em]">
                  {isFlagged ? 'Account flagged' : 'Online'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button onClick={onClose} className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div
          ref={scrollRef}
          className="flex-grow p-6 overflow-y-auto space-y-6 custom-scrollbar bg-gradient-to-b from-brand-black/10 to-brand-black/40"
        >
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`relative group max-w-[88%] p-5 rounded-[1.75rem] text-sm leading-[1.6] shadow-xl transition-all ${
                  msg.sender === 'user'
                    ? 'bg-brand-green text-brand-black font-semibold rounded-tr-none shadow-brand-green/5'
                    : 'bg-white/[0.04] text-gray-300 rounded-tl-none border border-white/5'
                }`}
              >
                {msg.sender === 'freelancer' && (
                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="absolute -right-10 top-2 p-2 text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    {copiedId === msg.id ? (
                      <Check size={14} className="text-brand-green" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                )}

                <MessageContent text={msg.text} isUser={msg.sender === 'user'} />

                {!msg.text && msg.isStreaming && (
                  <div className="flex items-center space-x-2 py-1">
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>
              <span
                className={`text-[9px] mt-2 font-black uppercase tracking-[0.15em] opacity-40 ${
                  msg.sender === 'user' ? 'text-brand-green' : 'text-gray-500'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isTyping && messages[messages.length - 1]?.sender === 'user' && (
            <div className="flex items-center space-x-3 text-brand-green/40">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-current rounded-full animate-pulse [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-current rounded-full animate-pulse [animation-delay:0.4s]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Thinking</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-6 pt-2 bg-white/[0.02] border-t border-white/5">
          <form onSubmit={handleSend} className="relative group">
            <div className="absolute inset-0 bg-brand-green/5 rounded-3xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputText.trim() && !isTyping && !isFlagged) handleSend(e as any);
                  }
                }}
                disabled={isTyping || isFlagged}
                placeholder={
                  isFlagged
                    ? 'Session locked. Contact support@cenner.hr'
                    : isTyping
                    ? 'Support is typing...'
                    : 'Ask us anything...'
                }
                className="w-full resize-none overflow-hidden bg-brand-black/60 border border-white/10 rounded-2xl py-5 pl-14 pr-16 text-white text-base placeholder:text-gray-600 focus:outline-none focus:border-brand-green/50 focus:ring-4 focus:ring-brand-green/5 transition-all disabled:opacity-50 leading-relaxed max-h-40"
              />
              <div className="absolute left-5 top-5 text-gray-600 group-focus-within:text-brand-green transition-colors">
                <Smile size={24} />
              </div>
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping || isFlagged}
                className="absolute right-3 top-3 w-12 h-12 bg-brand-pink text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-pink/20 disabled:opacity-0 disabled:scale-90"
              >
                <Send size={20} />
              </button>
            </div>
          </form>

          <div className="flex items-center justify-end mt-4 px-1">
            <span className="text-[8px] text-gray-700 font-black uppercase tracking-[0.2em]">Cenner Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
