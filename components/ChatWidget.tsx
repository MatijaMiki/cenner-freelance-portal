
import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatInterface from './ChatInterface';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-[100] w-14 h-14 bg-brand-green rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(74,222,128,0.4)] hover:scale-110 active:scale-95 transition-all group ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageSquare size={24} className="text-brand-black" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-pink rounded-full border-2 border-brand-black animate-pulse"></span>
      </button>

      {isOpen && (
        <ChatInterface 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          freelancerName="Cenner Concierge"
          freelancerAvatar="https://picsum.photos/seed/concierge/200"
          onStartCall={() => {}}
        />
      )}
    </>
  );
};

export default ChatWidget;
