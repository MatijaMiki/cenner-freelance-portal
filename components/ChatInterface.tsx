import React, { useState, useEffect, useRef } from 'react';
import { Send, Copy, Check } from 'lucide-react';
import { PxMessage, PxClose } from './PixelIcon';
import DotAvatar from './DotAvatar';

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
  // 'floating': the dark panel in the corner (every page). 'window': the body of a window on the
  // homepage's CRT desktop, light and bordered; the window's own title bar holds the close box.
  variant?: 'floating' | 'window';
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

const MessageContent: React.FC<{ text: string; isUser: boolean; light?: boolean }> = ({ text, isUser, light }) => {
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
              <strong key={j} className={isUser ? 'text-brand-black' : light ? 'font-black text-ink' : 'text-white font-black'}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={i} className="flex items-start space-x-2 ml-1">
              <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${isUser ? 'bg-brand-black' : light ? 'bg-ink' : 'bg-brand-green'}`} />
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
  variant = 'floating',
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

  const onFieldKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !isTyping && !isFlagged) handleSend(e as any);
    }
  };
  const placeholder = isFlagged
    ? 'Session locked. Contact support@cenner.hr'
    : isTyping
    ? 'Support is typing...'
    : 'Ask us anything...';

  if (variant === 'window') {
    return (
      <div className="flex h-full min-h-0 flex-col bg-[#f6f7f9] font-text text-ink">
        <div className="flex items-center gap-2 border-b-2 border-ink bg-paper px-3 py-1.5 font-term text-[12px]">
          <span className={`h-2 w-2 rounded-full ${isFlagged ? 'bg-red-500' : 'bg-brand-green'}`} />
          <span className="font-bold">{freelancerName}</span>
          <span className="text-slate">· {isFlagged ? 'Account flagged' : 'Online'}</span>
        </div>
        {/* data-wheel-box: the desktop's scroll lock leaves a list that can still scroll alone */}
        <div ref={scrollRef} data-wheel-box className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 lg:overscroll-contain">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[88%] border-2 border-ink px-3 py-2 text-[14px] leading-[1.5] shadow-[3px_3px_0_#0b0c0e] ${msg.sender === 'user' ? 'bg-brand-green' : 'bg-white'}`}>
                <MessageContent text={msg.text} isUser={msg.sender === 'user'} light />
                {!msg.text && msg.isStreaming && (
                  <div className="flex items-center gap-1.5 py-1">
                    <div className="h-1.5 w-1.5 animate-bounce bg-ink" />
                    <div className="h-1.5 w-1.5 animate-bounce bg-ink [animation-delay:0.2s]" />
                    <div className="h-1.5 w-1.5 animate-bounce bg-ink [animation-delay:0.4s]" />
                  </div>
                )}
              </div>
              <span className="mt-1 font-term text-[11px] text-slate">{msg.timestamp}</span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="border-t-2 border-ink bg-paper p-2.5">
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={onFieldKeyDown}
              disabled={isTyping || isFlagged}
              placeholder={placeholder}
              aria-label={placeholder}
              className="block w-full resize-none border-2 border-ink bg-white py-2.5 pl-3 pr-12 text-[16px] text-ink placeholder:text-slate focus:bg-[#fffef0] focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!inputText.trim() || isTyping || isFlagged}
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border-2 border-ink bg-sky text-white transition-opacity disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  // The floating chat is a retro messenger window: a title bar, a contact strip, a chat log
  // (name + line, like an old instant messenger or a terminal) and a prompt to type at.
  return (
    <div className="fixed inset-x-0 bottom-0 z-[110] animate-in slide-in-from-bottom-8 fade-in duration-300 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-full sm:max-w-md">
      <div className="flex h-[90dvh] flex-col border-2 border-ink bg-paper font-term text-ink shadow-[8px_8px_0_#0b0c0e] sm:h-[620px]">

        {/* Title bar */}
        <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-brand-green px-3 py-1.5">
          <span className="flex min-w-0 items-center gap-2 text-[13px] font-bold">
            <PxMessage size={14} aria-hidden="true" />
            <span className="truncate">razgovor.exe</span>
          </span>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-ink bg-white hover:bg-ink hover:text-white">
            <PxClose size={12} />
          </button>
        </div>

        {/* Contact strip */}
        <div className="flex items-center gap-3 border-b-2 border-ink bg-white px-3 py-2.5">
          <DotAvatar className="h-10 w-10 shrink-0 border-2 border-ink" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[14px] font-bold leading-tight">
              <span className="truncate">{freelancerName}</span>
              <span className="border-2 border-ink bg-ink px-1 text-[10px] font-bold uppercase leading-4 text-white">Support</span>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-slate">
              <span className={`h-2 w-2 ${isFlagged ? 'bg-red-500' : 'bg-brand-green'} border border-ink`} />
              {isFlagged ? 'Account flagged' : 'Online'}
            </p>
          </div>
        </div>

        {/* Chat log */}
        <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#f6f7f9] p-3 text-[13px] leading-[1.55]">
          {messages.map(msg => (
            <div key={msg.id} className="group">
              <p className="flex items-center gap-2 text-[12px] font-bold">
                <span className={msg.sender === 'user' ? 'text-sky' : 'text-leaf'}>{msg.sender === 'user' ? 'Ti' : freelancerName}</span>
                <span className="font-normal text-slate">{msg.timestamp}</span>
                {msg.sender === 'freelancer' && msg.text && (
                  <button type="button" onClick={() => handleCopy(msg.text, msg.id)} aria-label="Copy" className="ml-auto text-slate opacity-0 transition-opacity hover:text-ink group-hover:opacity-100 focus-visible:opacity-100">
                    {copiedId === msg.id ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                )}
              </p>
              <div className={`mt-1 border-l-2 pl-3 ${msg.sender === 'user' ? 'border-sky' : 'border-ink'}`}>
                <MessageContent text={msg.text} isUser={false} light />
                {!msg.text && msg.isStreaming && (
                  <span className="inline-flex items-center gap-1.5 py-1" aria-label="Typing">
                    <span className="h-1.5 w-1.5 animate-bounce bg-ink" />
                    <span className="h-1.5 w-1.5 animate-bounce bg-ink [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce bg-ink [animation-delay:0.4s]" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Prompt */}
        <form onSubmit={handleSend} className="border-t-2 border-ink bg-white p-2.5">
          <div className="flex items-end gap-2 border-2 border-ink bg-white focus-within:bg-[#fffef0]">
            <span aria-hidden="true" className="select-none pb-2.5 pl-3 text-[15px] font-bold text-leaf">&gt;</span>
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={onFieldKeyDown}
              disabled={isTyping || isFlagged}
              placeholder={placeholder}
              aria-label={placeholder}
              className="block min-w-0 flex-1 resize-none bg-transparent py-2.5 text-[16px] text-ink placeholder:text-slate focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!inputText.trim() || isTyping || isFlagged}
              className="m-1 flex h-9 shrink-0 items-center gap-1.5 border-2 border-ink bg-ink px-3 text-[13px] font-bold text-white transition-opacity hover:bg-sky disabled:opacity-40"
            >
              <Send size={14} /> Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
