
import React, { useState } from 'react';
import { PxMessage } from './PixelIcon';
import ChatInterface from './ChatInterface';

/** `bubble={false}`: the homepage opens the chat as a window on its desktop instead. */
const ChatWidget: React.FC<{ bubble?: boolean }> = ({ bubble = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  // The homepage's desktop opens the chat from its own icon and hides the floating bubble
  // while it is on screen; nothing else uses these events.
  const [bubbleHidden, setBubbleHidden] = useState(false);
  React.useEffect(() => {
    const open = () => setIsOpen(true);
    const hide = (e: Event) => setBubbleHidden(!!(e as CustomEvent<boolean>).detail);
    window.addEventListener('cenner-chat:open', open);
    window.addEventListener('cenner-chat:hide-bubble', hide);
    return () => { window.removeEventListener('cenner-chat:open', open); window.removeEventListener('cenner-chat:hide-bubble', hide); };
  }, []);

  // The bubble sits 24px above the bottom of the screen, but never goes into the footer: once the footer
  // scrolls into view the bubble stops a little above it.
  const [lift, setLift] = useState(0);
  const showing = bubble && !isOpen && !bubbleHidden;
  React.useEffect(() => {
    if (!showing) return;            // no bubble on screen (the homepage, chat open): nothing to keep clear
    let raf = 0;
    const update = () => {
      raf = 0;
      const f = document.querySelector('footer');
      const over = f ? window.innerHeight - f.getBoundingClientRect().top : 0;
      setLift(over > 0 ? Math.round(over) : 0);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // the page can grow or shrink without a scroll (a list loading in after a route change): measure again then too
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onScroll);
    ro?.observe(document.body);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); ro?.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [showing]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Chat"
        style={{ bottom: 24 + lift }}
        className={`fixed right-6 z-[100] h-14 w-14 items-center justify-center border-2 border-ink bg-brand-green shadow-[4px_4px_0_#0b0c0e] transition-[transform,box-shadow] duration-100 hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_#0b0c0e] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${isOpen || bubbleHidden || !bubble ? 'hidden' : 'flex'}`}
      >
        <PxMessage size={24} className="text-ink" />
        <span className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 border-2 border-ink bg-brand-pink" />
      </button>

      {isOpen && (
        <ChatInterface 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          freelancerName="Cenner Support"
          freelancerAvatar="https://picsum.photos/seed/concierge/200"
          onStartCall={() => {}}
        />
      )}
    </>
  );
};

export default ChatWidget;
