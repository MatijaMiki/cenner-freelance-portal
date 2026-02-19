
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Phone, Video, Smile, Paperclip, MoreHorizontal, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'freelancer';
  timestamp: string;
  isStreaming?: boolean;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  freelancerName: string;
  freelancerAvatar: string;
  onStartCall: () => void;
}

/**
 * Renders message content with support for basic markdown-like formatting (bold, lists).
 */
const MessageContent: React.FC<{ text: string; isUser: boolean }> = ({ text, isUser }) => {
  if (!text) return null;

  // Simple parser for **bold** and * bullet points
  const lines = text.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        let processedLine = line.trim();
        
        // Handle bullet points
        const isBullet = processedLine.startsWith('* ') || processedLine.startsWith('- ');
        if (isBullet) {
          processedLine = processedLine.substring(2);
        }

        // Handle bolding **text**
        const parts = processedLine.split(/(\*\*.*?\*\*)/g);
        const content = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className={isUser ? "text-brand-black" : "text-white font-black"}>{part.slice(2, -2)}</strong>;
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

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose, freelancerName, freelancerAvatar, onStartCall }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'initial', 
      text: `Greetings. I am the **Cenner Concierge**, your neural interface for the elite portal. How may I facilitate your professional synchronization today?`, 
      sender: 'freelancer', 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatSessionRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `You are the Cenner Concierge, the sophisticated AI interface of the Cenner Elite Freelance Portal.
          - Tone: Premium, clinical yet helpful, high-tech, and extremely professional.
          - Terminology: Use 'Neural Sync', 'Project Protocol', 'Escrow Security', 'Node Deployment'.
          - Format: Use **bold** for key terms. Use bullet points for lists.
          - Goal: Help users navigate the marketplace or understand our elite vetting process.
          - Keep responses structured and aesthetically pleasing.`,
        },
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const botMessageId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMessageId,
        text: '',
        sender: 'freelancer',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true
      };
      
      setMessages(prev => [...prev, botMessage]);

      const streamResponse = await chatSessionRef.current.sendMessageStream({ message: inputText });
      
      let fullText = '';
      for await (const chunk of streamResponse) {
        const part = chunk as GenerateContentResponse;
        const textChunk = part.text || '';
        fullText += textChunk;
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: fullText } : msg
        ));
      }

      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
      ));
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      setMessages(prev => [...prev, {
        id: 'error',
        text: "System Alert: **Neural Link Disrupted**. Retrying protocol connection...",
        sender: 'freelancer',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[110] w-full max-w-md animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div className="bg-brand-grey border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col h-[650px] overflow-hidden backdrop-blur-3xl ring-1 ring-white/5">
        
        {/* Tidy Header */}
        <div className="p-6 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-brand-green/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img src={freelancerAvatar} alt={freelancerName} className="relative w-11 h-11 rounded-full border border-brand-green/40 object-cover" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-brand-green rounded-full border-[3px] border-brand-grey shadow-sm"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-white font-black text-sm tracking-tight">{freelancerName}</h4>
                <div className="px-1.5 py-0.5 bg-brand-green/10 rounded text-[8px] font-black text-brand-green uppercase tracking-tighter">AI CORE</div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse"></span>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.1em]">Protocol Active</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button onClick={onStartCall} className="p-2.5 text-gray-500 hover:text-brand-green hover:bg-white/5 rounded-xl transition-all"><Phone size={18} /></button>
            <button onClick={onStartCall} className="p-2.5 text-gray-500 hover:text-brand-pink hover:bg-white/5 rounded-xl transition-all"><Video size={18} /></button>
            <div className="w-px h-4 bg-white/10 mx-2"></div>
            <button onClick={onClose} className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"><X size={20} /></button>
          </div>
        </div>

        {/* Tidy Message Area */}
        <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-6 custom-scrollbar bg-gradient-to-b from-brand-black/10 to-brand-black/40">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`relative group max-w-[88%] p-5 rounded-[1.75rem] text-sm leading-[1.6] shadow-xl transition-all ${
                msg.sender === 'user' 
                  ? 'bg-brand-green text-brand-black font-semibold rounded-tr-none shadow-brand-green/5' 
                  : 'bg-white/[0.04] text-gray-300 rounded-tl-none border border-white/5'
              }`}>
                {msg.sender === 'freelancer' && (
                  <button 
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="absolute -right-10 top-2 p-2 text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    {copiedId === msg.id ? <Check size={14} className="text-brand-green" /> : <Copy size={14} />}
                  </button>
                )}
                
                <MessageContent text={msg.text} isUser={msg.sender === 'user'} />
                
                {!msg.text && msg.isStreaming && (
                  <div className="flex items-center space-x-2 py-1">
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                )}
              </div>
              <span className={`text-[9px] mt-2 font-black uppercase tracking-[0.15em] opacity-40 ${msg.sender === 'user' ? 'text-brand-green' : 'text-gray-500'}`}>
                {msg.timestamp}
              </span>
            </div>
          ))}
          {isTyping && messages[messages.length-1].sender === 'user' && (
             <div className="flex items-center space-x-3 text-brand-green/40">
               <div className="flex space-x-1">
                 <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
                 <div className="w-1 h-1 bg-current rounded-full animate-pulse [animation-delay:0.2s]"></div>
                 <div className="w-1 h-1 bg-current rounded-full animate-pulse [animation-delay:0.4s]"></div>
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest">Neural Processing</span>
             </div>
          )}
        </div>

        {/* Tidy Input Footer - Enhanced with more height */}
        <div className="p-6 pt-2 bg-white/[0.02] border-t border-white/5">
          <form onSubmit={handleSend} className="relative group">
            <div className="absolute inset-0 bg-brand-green/5 rounded-3xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
                placeholder={isTyping ? "Concierge is thinking..." : "Synchronize your request..."}
                className="w-full bg-brand-black/60 border border-white/10 rounded-2xl py-6 pl-14 pr-16 text-white text-base placeholder:text-gray-600 focus:outline-none focus:border-brand-green/50 focus:ring-4 focus:ring-brand-green/5 transition-all disabled:opacity-50"
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-green transition-colors">
                <Smile size={24} />
              </div>
              <button 
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-brand-pink text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-pink/20 disabled:opacity-0 disabled:scale-90"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
          
          <div className="flex items-center justify-between mt-4 px-1">
            <div className="flex items-center space-x-4">
              <button type="button" className="flex items-center space-x-1.5 text-gray-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-[0.1em]">
                <Paperclip size={12} className="text-brand-pink" />
                <span>Payload</span>
              </button>
              <button type="button" className="flex items-center space-x-1.5 text-gray-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-[0.1em]">
                <Sparkles size={12} className="text-brand-green" />
                <span>AI Prompt</span>
              </button>
            </div>
            <span className="text-[8px] text-gray-700 font-black uppercase tracking-[0.2em]">Cenner v2.4.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
