import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API } from '../lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/** `className`: the bell's colours (the light homepage-style nav and the dark classic one differ). */
const NotificationBell: React.FC<{ className?: string }> = ({ className = 'text-slate hover:text-ink' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const lastFetch = useRef(0);
  const fetch = useCallback(() => {
    lastFetch.current = Date.now();
    API.getNotifications().then(setNotifications).catch(() => {});
  }, []);

  useEffect(() => {
    fetch();
    // every 30 s while the tab is in front; a background tab asks for nothing and catches up when it is back
    const id = setInterval(() => { if (!document.hidden) fetch(); }, 30000);
    const onVis = () => { if (!document.hidden && Date.now() - lastFetch.current >= 30000) fetch(); };   // only if it has gone stale
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [fetch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const handleClick = async (n: Notification) => {
    if (!n.read) {
      await API.markNotificationRead(n.id).catch(() => {});
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    }
    if (n.link) { navigate(n.link); setOpen(false); }
  };

  const markAllRead = async () => {
    await API.markAllNotificationsRead().catch(() => {});
    setNotifications(prev => prev.map(x => ({ ...x, read: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={`relative p-2 transition-colors ${className}`}>
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[12px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] bg-white border-2 border-ink overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink/15">
            <h3 className="text-ink font-bold text-sm">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-leaf font-medium flex items-center gap-1 hover:underline">
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto max-h-[340px]">
            {notifications.length === 0 ? (
              <p className="text-slate text-sm text-center py-8">No notifications</p>
            ) : (
              notifications.slice(0, 20).map(n => (
                <button key={n.id} onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-ink/15 hover:bg-ink/5 transition-colors ${!n.read ? 'bg-ink/5' : ''}`}>
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="w-2 h-2 bg-brand-green rounded-full mt-1.5 shrink-0" />}
                    <div className={!n.read ? '' : 'ml-4'}>
                      <p className="text-ink text-sm font-medium leading-tight">{n.title}</p>
                      <p className="text-slate text-xs mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-slate text-[12px] mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
