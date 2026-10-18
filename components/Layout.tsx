
import Logo from './Logo';
import PageBackdrop from './PageBackdrop';
import ProjectDots from './ProjectDots';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// the nav's icons are the pixel set (drawn on the same grid as the pixel lettering)
import {
  PxMenu as Menu, PxClose as X, PxUser as UserIcon, PxLogout as LogOut, PxChevronDown as ChevronDown, PxMessage as MessageSquare,
  PxUser as UserCheck, PxFileText as FileText, PxShoppingBag as ShoppingBag, PxInfoBox as Info, PxGift as Gift,
  PxShield as Shield,
} from './PixelIcon';
import AvatarImg from './Avatar';
import NotificationBell from './NotificationBell';
import ChatWidget from './ChatWidget';
import Footer from './Footer';
import ConsentModal from './ConsentModal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, useT } from '../i18n';
import { API } from '../lib/api';
import { connectSocket, disconnectSocket } from '../hooks/useSocket';
import { LANGUAGES, useSiteNav } from './siteNav';

interface LayoutProps {
  children: React.ReactNode;
}

// The homepage nav is a plain bar on the page's grey ground; every other page
// keeps the classic dark bar until its own sections are redesigned. These two helpers are the
// only places the two looks differ structurally (the class-level differences live in Layout).
const NavShell: React.FC<{ glass: boolean; children: React.ReactNode }> = ({ glass, children }) =>
  glass ? (
    <div className="w-full px-4 md:px-8 lg:px-10">{children}</div>
  ) : (
    <div className="w-full px-6 lg:px-10">{children}</div>
  );

const Panel: React.FC<{ glass: boolean; className: string; rounded?: string; children: React.ReactNode }> = ({
  glass, className, rounded = 'rounded-2xl', children,
}) =>
  glass ? (
    <div className={`${className} overflow-hidden border-2 border-ink bg-white text-ink shadow-[6px_6px_0_0_#0b0c0e]`}>{children}</div>
  ) : (
    <div className={`${className} bg-brand-grey border border-white/10 ${rounded} shadow-2xl overflow-hidden`}>{children}</div>
  );


const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen]         = useState(false);
  const [isLangOpen, setIsLangOpen]         = useState(false);
  const [isAboutOpen, setIsAboutOpen]       = useState(false);
  const [isProfileOpen, setIsProfileOpen]   = useState(false);
  const { lang, setLang } = useLanguage();
  const t = useT();
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const langRefDesktop  = useRef<HTMLDivElement>(null);
  const langRefMobile   = useRef<HTMLDivElement>(null);
  const aboutRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideLang =
        (langRefDesktop.current && langRefDesktop.current.contains(target)) ||
        (langRefMobile.current  && langRefMobile.current.contains(target));
      if (!insideLang) setIsLangOpen(false);
      if (aboutRef.current   && !aboutRef.current.contains(target))   setIsAboutOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-redirect to /banned when any API call returns 403 + banned:true.
  // api.ts dispatches this event from its central response handler.
  useEffect(() => {
    const onBanned = () => {
      if (window.location.pathname !== '/banned') navigate('/banned');
    };
    window.addEventListener('api:banned', onBanned);
    return () => window.removeEventListener('api:banned', onBanned);
  }, [navigate]);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    let last = 0;
    const fetchUnread = () => {
      last = Date.now();
      API.getUnreadCount()
        .then((data: any) => setUnread(data?.count ?? 0))
        .catch(() => {});
    };
    fetchUnread();
    // every 30 s while the tab is in front (a background tab asks for nothing and catches up when it is back)
    const interval = setInterval(() => { if (!document.hidden) fetchUnread(); }, 30000);
    const onVis = () => { if (!document.hidden && Date.now() - last >= 30000) fetchUnread(); };   // only if it has gone stale
    document.addEventListener('visibilitychange', onVis);

    // Real-time: bump count immediately when a new message arrives
    const socket = connectSocket();
    const onNew = () => fetchUnread();
    socket.on('new_message', onNew);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
      socket.off('new_message', onNew);
    };
  }, [user?.id]);

  const handleLogout = () => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    disconnectSocket();
    logout();
    navigate('/');
  };
  const handleLangSelect = (code: string) => {
    setLang(code);
    setIsLangOpen(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  // Shared with the homepage desktop's Start menu (components/siteNav.ts).
  const siteNav = useSiteNav();
  const navLinks = siteNav.links.map(l => ({ name: l.label, path: l.path, icon: l.icon }));
  const market = siteNav.market[0];
  const aboutDropdownItems = siteNav.about;
  const isAdmin = user?.role === 'admin';

  const isMarketActive = location.pathname === market.path;
  const isAboutActive  = location.pathname === '/about';

  // Homepage = plain bar on the grey ground; elsewhere the classic bar (strings unchanged).
  // Pages already in the new look (homepage design): plain bar, solid menus, `Footer home`.
  // Every page is in the new look.
  const isHome = true;
  const navItem = (active: boolean) => isHome
    ? `group/navicon relative flex items-center whitespace-nowrap border-2 font-display text-[14px] font-bold transition-[background-color,color,box-shadow,transform] duration-100 lg:p-2 2xl:px-2.5 2xl:py-1.5 ${active ? 'border-ink bg-ink text-white' : 'border-transparent text-ink/70 hover:-translate-x-px hover:-translate-y-px hover:border-ink hover:bg-white hover:text-ink hover:shadow-[3px_3px_0_0_#0b0c0e] focus-visible:border-ink focus-visible:outline-none'}`
    : `group/navicon relative flex items-center whitespace-nowrap text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:text-brand-green lg:p-2 lg:rounded-lg lg:hover:bg-white/10 2xl:p-0 2xl:rounded-none 2xl:hover:bg-transparent ${active ? 'text-brand-green' : 'text-gray-400'}`;
  const tip = isHome
    ? 'pointer-events-none absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-ink text-white text-[10px] font-medium tracking-wide rounded-full px-3 py-1 opacity-0 group-hover/navicon:opacity-100 transition-opacity whitespace-nowrap 2xl:hidden z-50'
    : 'pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-brand-grey border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-lg px-2 py-1 opacity-0 group-hover/navicon:opacity-100 transition-opacity whitespace-nowrap 2xl:hidden z-50';
  const subText = isHome ? 'text-slate' : 'text-gray-600';

  return (
    <div className={`min-h-screen flex flex-col relative isolate ${isHome ? 'bg-paper font-text text-ink' : 'bg-brand-black text-white'}`}>
      {/* Every new-look page but the homepage gets the full-page dot background (components/PageBackdrop). */}
      {/* (not behind the inbox: it fills the window with an opaque panel, so the dots could never be seen) */}
      {isHome && location.pathname !== '/' && location.pathname !== '/v3' && !location.pathname.startsWith('/messages') && <PageBackdrop seed={location.pathname} />}
      <ChatWidget bubble={location.pathname !== '/'} />

      {/* Navbar */}
      <nav className={isHome
        ? 'sticky top-0 z-50 bg-paper'
        : 'sticky top-0 z-50 bg-brand-black/80 backdrop-blur-xl border-b border-white/10'}>
        <NavShell glass={isHome}>
          <div className={isHome ? 'flex h-[4.5rem] items-center justify-between' : 'flex justify-between h-20 items-center'}>
            <Link to="/" aria-label="Cenner" className="group flex items-center focus-visible:outline-none focus-visible:underline">
              <Logo tone={isHome ? 'light' : 'dark'} />
            </Link>

            {/* Desktop Navigation */}
            <div className={`hidden lg:flex items-center lg:space-x-1 ${isHome ? '2xl:space-x-0.5' : '2xl:space-x-6'}`}>

              {/* Marketplace (AI job matching's waitlist is a block on it) */}
              <Link to={market.path} className={navItem(isMarketActive)}>
                <ShoppingBag size={24} className="2xl:hidden" />
                <span className="hidden 2xl:block">{market.label}</span>
                <span className={tip}>{market.label}</span>
              </Link>

              {/* Plain links */}
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path}
                  className={navItem(location.pathname === link.path)}
                >
                  <link.icon size={24} className="2xl:hidden" />
                  <span className="hidden 2xl:block">{link.name}</span>
                  <span className={tip}>
                    {link.name}
                  </span>
                </Link>
              ))}

              {/* About Dropdown */}
              <div ref={aboutRef} className="relative">
                <button
                  onClick={() => setIsAboutOpen(v => !v)}
                  className={`${navItem(isAboutActive)} gap-1`}
                >
                  <Info size={24} className="2xl:hidden" />
                  <span className="hidden 2xl:flex items-center gap-1">
                    {t('About')}
                    <ChevronDown size={12} className={`transition-transform duration-200 ${isAboutOpen ? 'rotate-180' : ''}`} />
                  </span>
                  <span className={tip}>
                    {t('About')}
                  </span>
                </button>
                {isAboutOpen && (
                  <Panel glass={isHome} className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {aboutDropdownItems.map(item => (
                      <Link key={item.label} to={item.path} onClick={() => setIsAboutOpen(false)} className="block border-b-2 border-ink/10 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-paper2 group/about">
                        <div className="font-display text-[14px] font-bold text-ink transition-colors group-hover/about:text-sky">{item.label}</div>
                        <div className={`text-[10px] ${subText} mt-0.5`}>{item.desc}</div>
                      </Link>
                    ))}
                  </Panel>
                )}
              </div>

              {isHome ? <div className="mx-1" /> : <div className="h-6 w-px mx-2 bg-white/10" />}

              {/* Language + Currency pill — always visible */}
              <div ref={langRefDesktop} className="relative">
                <button
                  onClick={() => setIsLangOpen(v => !v)}
                  className={isHome
                    ? 'flex h-11 items-stretch border-2 border-ink bg-white font-display text-[14px] font-bold text-ink transition-colors hover:bg-paper2'
                    : 'flex items-center gap-0 rounded-xl border border-white/10 hover:border-white/20 transition-colors text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest overflow-hidden'}
                >
                  <span className={`flex items-center gap-1.5 px-3 ${isHome ? '' : 'py-2'}`}>
                    <span className="text-[13px] leading-none">{currentLang.flag}</span>
                    <span>{currentLang.code}</span>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                  </span>
                  {isHome ? <span aria-hidden="true" className="w-0.5 bg-ink" /> : <span className="w-px h-5 bg-white/10" />}
                  <span className={`flex items-center gap-1 px-3 ${isHome ? 'text-ink' : 'py-2 text-gray-500'}`}>
                    <span>€</span>
                    <span>EUR</span>
                  </span>
                </button>
                {isLangOpen && (
                  <Panel glass={isHome} className="absolute top-full right-0 mt-3 w-40 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => handleLangSelect(l.code)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${lang === l.code ? 'bg-ink text-white' : 'text-ink hover:bg-paper2'}`}>
                        <span className="text-base">{l.flag}</span>
                        <div>
                          <div className="font-display text-[12px] font-black uppercase tracking-widest">{l.code}</div>
                          <div className={`text-[11px] ${lang === l.code ? 'text-white/70' : subText}`}>{l.name}</div>
                        </div>
                      </button>
                    ))}
                  </Panel>
                )}
              </div>

              {/* Conditional: profile avatar or login button */}
              {user ? (
                <>
                <NotificationBell className={isHome ? 'text-ink/65 hover:text-ink' : 'text-gray-400 hover:text-white'} />
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setIsProfileOpen(v => !v)}
                    className="flex items-center gap-2 group/profile"
                  >
                    <div className="relative">
                      <AvatarImg src={user.avatar} name={user.name} size={36} className="border-2 border-brand-green shadow-[2px_2px_0_0_#0b0c0e] group-hover/profile:scale-110 transition-transform" />
                      {unread > 0 && (
                        <div className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-brand-green flex items-center justify-center text-ink text-[9px] font-black border-2 border-ink">
                          {unread > 9 ? '9+' : unread}
                        </div>
                      )}
                    </div>
                    <ChevronDown size={12} className={`text-ink/60 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-3 w-64 overflow-hidden border-2 border-ink bg-white shadow-[6px_6px_0_0_#0b0c0e] z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* Who is signed in, on an ink bar like the Start menu's */}
                      <div className="flex items-center gap-3 bg-ink px-4 py-3.5 text-white">
                        <AvatarImg src={user.avatar} name={user.name} size={40} className="shrink-0 border-2 border-brand-green" />
                        <div className="min-w-0">
                          <p className="truncate font-display text-[15px] font-bold">{user.name || 'Freelancer'}</p>
                          <p className="truncate text-[12px] text-white/60">{user.email}</p>
                        </div>
                      </div>

                      <div className="py-1.5">
                        <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 font-display text-[14px] font-bold text-ink transition-colors hover:bg-paper2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink bg-paper2"><UserCheck size={14} /></span>
                          {t('Profile')}
                        </Link>
                        <Link to="/messages" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 font-display text-[14px] font-bold text-ink transition-colors hover:bg-paper2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink bg-paper2"><MessageSquare size={14} /></span>
                          <span className="flex-1">{t('Messages')}</span>
                          {unread > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center border-2 border-ink bg-brand-green px-1 text-[10px] font-black text-ink">
                              {unread > 9 ? '9+' : unread}
                            </span>
                          )}
                        </Link>
                        <Link to="/contracts" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 font-display text-[14px] font-bold text-ink transition-colors hover:bg-paper2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink bg-paper2"><FileText size={14} /></span>
                          {t('Contracts')}
                        </Link>
                        <Link to="/referral" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 font-display text-[14px] font-bold text-ink transition-colors hover:bg-paper2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink bg-brand-green"><Gift size={14} /></span>
                          {t('Refer & Win')}
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 font-display text-[14px] font-bold text-ink transition-colors hover:bg-paper2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink bg-paper2"><Shield size={14} /></span>
                            Admin
                          </Link>
                        )}
                      </div>

                      <div className="border-t-2 border-ink py-1.5">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 font-display text-[14px] font-bold text-ink transition-colors hover:bg-paper2 w-full text-left hover:text-red-700">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink bg-paper2"><LogOut size={14} /></span>
                          {t('Sign out')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                </>
              ) : (
                isHome ? (
                  <Link to="/auth" className="inline-flex h-11 items-center whitespace-nowrap border-2 border-ink bg-sky px-5 font-display text-[15px] font-bold text-white transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#0b0c0e] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:bg-ink focus-visible:outline-none">
                    {t('Login / Signup')}
                  </Link>
                ) : (
                  <Link to="/auth" className="whitespace-nowrap px-8 py-3 rounded-xl bg-white text-brand-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                    {t('Login / Signup')}
                  </Link>
                )
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="lg:hidden flex items-center gap-3">
              <div ref={langRefMobile} className="relative">
                <button onClick={() => setIsLangOpen(v => !v)} className={isHome
                  ? 'flex items-center gap-1 border-2 border-ink bg-white px-2.5 py-1 font-display text-ink'
                  : 'flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-gray-400'}>
                  <span className="text-sm">{currentLang.flag}</span>
                  <span className="text-[10px] font-black">{currentLang.code}</span>
                </button>
                {isLangOpen && (
                  <Panel glass={isHome} rounded="rounded-xl" className="absolute top-full right-0 mt-2 w-36 z-50">
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => handleLangSelect(l.code)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left ${lang === l.code ? 'bg-ink text-white' : 'text-ink hover:bg-paper2'}`}>
                        <span>{l.flag}</span>
                        <span className="text-[10px] font-bold">{l.name}</span>
                      </button>
                    ))}
                  </Panel>
                )}
              </div>
              <button type="button" aria-label={t('Menu')} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} className={isHome ? 'text-ink' : 'text-white'}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </NavShell>

        {/* Mobile menu, new look: a compact Start-menu panel under the button, tiles instead of a list, no scrolling */}
        {isMenuOpen && isHome && (() => {
          const close = () => setIsMenuOpen(false);
          const tiles = [market, ...siteNav.links, ...siteNav.about];
          return (
            <div className="lg:hidden absolute right-3 top-full z-50 mt-1 w-[min(23rem,calc(100vw-1.5rem))] border-2 border-ink bg-white shadow-[6px_6px_0_0_#0b0c0e] animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="grid grid-cols-2 gap-1.5 p-2.5">
                {tiles.map(item => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path.split('#')[0] && !item.path.includes('#');
                  return (
                    <Link key={item.path + item.label} to={item.path} onClick={close}
                      className={`flex items-center gap-2.5 border-2 px-2.5 py-2 font-display text-[13px] font-bold leading-tight transition-[background-color,box-shadow,transform] duration-100 ${active ? 'border-ink bg-ink text-white' : 'border-transparent text-ink hover:-translate-x-px hover:-translate-y-px hover:border-ink hover:bg-paper hover:shadow-[2px_2px_0_0_#0b0c0e]'}`}>
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center border-2 ${active ? 'border-white/80' : 'border-ink bg-paper2'}`}><Icon size={14} /></span>
                      <span className="min-w-0 truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 border-t-2 border-ink bg-ink px-2.5 py-2 text-white">
                {user ? (
                  <>
                    <Link to="/profile" onClick={close} className="flex min-w-0 flex-1 items-center gap-2">
                      {user.avatar
                        ? <img src={user.avatar} alt={user.name || 'User avatar'} className="h-8 w-8 border-2 border-brand-green object-cover" />
                        : <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-white/80 bg-white/10"><UserIcon size={16} /></span>}
                      <span className="min-w-0 truncate font-display text-[13px] font-bold">{user.name}</span>
                    </Link>
                    <Link to="/messages" onClick={close} aria-label={t('Messages')} className="relative flex h-8 w-8 items-center justify-center border-2 border-white/30 hover:border-white">
                      <MessageSquare size={15} />
                      {unread > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-brand-green px-0.5 text-[9px] font-black text-ink">{unread > 9 ? '9+' : unread}</span>}
                    </Link>
                    <Link to="/contracts" onClick={close} aria-label={t('Contracts')} className="flex h-8 w-8 items-center justify-center border-2 border-white/30 hover:border-white"><FileText size={15} /></Link>
                    {isAdmin && <Link to="/admin" onClick={close} aria-label="Admin" className="flex h-8 w-8 items-center justify-center border-2 border-white/30 hover:border-white"><Shield size={15} /></Link>}
                    <button type="button" onClick={handleLogout} aria-label={t('Sign out')} className="flex h-8 w-8 items-center justify-center border-2 border-white/30 hover:border-white"><LogOut size={15} /></button>
                  </>
                ) : (
                  <Link to="/auth" onClick={close} className="flex-1 border-2 border-white bg-white py-2 text-center font-display text-[13px] font-bold text-ink hover:bg-paper">{t('Login / Signup')}</Link>
                )}
              </div>
            </div>
          );
        })()}

        {/* Mobile Menu (classic look) */}
        {isMenuOpen && !isHome && (
          <div className={isHome
            ? 'lg:hidden mx-3 mb-3 max-h-[78svh] overflow-y-auto overscroll-contain border-2 border-ink bg-white pb-5 px-5 space-y-0 shadow-[6px_6px_0_0_#0b0c0e]'
            : 'lg:hidden max-h-[calc(100svh-5rem)] overflow-y-auto overscroll-contain bg-brand-black border-b border-white/10 pb-8 px-6 space-y-1'}>
            <div className="pt-3" />
            {[{ name: market.label, path: market.path }, ...navLinks].map(link => (
              <Link key={link.name} to={link.path} onClick={() => setIsMenuOpen(false)} className={isHome ? 'block border-b-2 border-ink/10 py-3 font-display text-lg font-bold text-ink hover:text-sky' : 'block py-3 text-lg font-bold text-white border-b border-white/5'}>{link.name}</Link>
            ))}
            <p className={`text-[9px] font-black uppercase tracking-[0.3em] pt-4 pb-1 ${isHome ? 'text-slate' : 'text-gray-700'}`}>{t('Company')}</p>
            {aboutDropdownItems.map(item => (
              <Link key={item.label} to={item.path} onClick={() => setIsMenuOpen(false)} className={isHome ? 'block py-2.5 pl-2 font-display text-base font-semibold text-ink/80 hover:text-sky' : 'block py-2.5 text-base font-semibold text-gray-300 pl-2'}>{item.label}</Link>
            ))}
            <div className={isHome ? 'mt-3 border-t-2 border-ink pt-3' : 'pt-3 border-t border-white/5'}>
              {user ? (
                <>
                  <div className="flex items-center gap-3 py-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name || 'User avatar'} className={isHome ? 'h-8 w-8 border-2 border-brand-green object-cover' : 'w-8 h-8 rounded-full border border-brand-green'} />
                    ) : (
                      <div className={isHome ? 'flex h-8 w-8 items-center justify-center border-2 border-ink bg-paper2 text-ink' : 'w-8 h-8 rounded-full bg-brand-grey border border-brand-green flex items-center justify-center text-brand-green'}>
                        <UserIcon size={16} />
                      </div>
                    )}
                    <div>
                      <p className={`text-sm font-bold ${isHome ? 'text-ink' : 'text-white'}`}>{user.name}</p>
                      <p className={`text-[10px] ${isHome ? 'text-slate' : 'text-gray-500'}`}>{user.email}</p>
                    </div>
                  </div>
                  <Link to="/profile"   onClick={() => setIsMenuOpen(false)} className={isHome ? 'block py-2.5 font-display text-base font-bold text-ink' : 'block py-2.5 text-base font-bold text-white'}>{t('Profile')}</Link>
                  <Link to="/messages"   onClick={() => setIsMenuOpen(false)} className={isHome ? 'flex items-center justify-between py-2.5 font-display text-base font-bold text-ink' : 'flex items-center justify-between py-2.5 text-base font-bold text-white'}>
                    <span>{t('Messages')}</span>
                    {unread > 0 && (
                      <span className="w-5 h-5 bg-brand-green rounded-full flex items-center justify-center text-brand-black text-[10px] font-black">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </Link>
                  <Link to="/contracts" onClick={() => setIsMenuOpen(false)} className={isHome ? 'block py-2.5 font-display text-base font-bold text-ink' : 'block py-2.5 text-base font-bold text-white'}>{t('Contracts')}</Link>
                  <Link to="/referral" onClick={() => setIsMenuOpen(false)} className={isHome ? 'flex items-center gap-2 py-2.5 font-display text-base font-bold text-ink' : 'flex items-center gap-2 py-2.5 text-base font-bold text-white'}><Gift size={16} className="text-brand-green" />{t('Refer & Win')}</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className={isHome ? 'flex items-center gap-2 py-2.5 font-display text-base font-bold text-ink' : 'flex items-center gap-2 py-2.5 text-base font-bold text-white'}><Shield size={16} className="text-gray-400" />Admin</Link>}
                  <button onClick={handleLogout} className={isHome ? 'block w-full py-2.5 text-left font-display text-base font-bold text-red-600' : 'block py-2.5 text-base font-bold text-brand-pink w-full text-left'}>{t('Sign out')}</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className={isHome ? 'block py-3 font-display text-lg font-bold text-sky' : 'block py-3 text-lg font-bold text-brand-pink'}>{t('Login / Signup')}</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">{children}</main>
      {!location.pathname.startsWith('/messages') && (isHome
        ? <div className="relative text-white">
          {/* The footer's ink and the top-right footer animation sit on layers behind all content (the root isolates its stacking), so cards and footer text always draw over the dots (dots keep clear of the text). */}
          <div aria-hidden="true" className="absolute inset-0 -z-[6] bg-ink" />
          <ProjectDots
            avoid={'footer a:not([aria-label="Cenner"]), footer p, footer h3, footer h4, footer h5, footer li, footer small, footer button, footer input, footer span:not(a[aria-label="Cenner"] span)'}
            reach={80}
            focus={{ x: 1, y: 0.18, rx: 1, ry: 0.85 }}
            palette={['#0b0c0e', '#ffffff', '#cfd4dc', '#8c93a0', '#eef0f3']}
            className="pointer-events-none absolute right-0 top-0 -z-[5] h-[20rem] w-[19rem] md:h-[28rem] md:w-[30rem]"
          />
          {/* and a second, all white, growing out of the bottom-left corner on wide screens */}
          <ProjectDots
            avoid={'footer a:not([aria-label="Cenner"]), footer p, footer h3, footer h4, footer h5, footer li, footer small, footer button, footer input, footer span:not(a[aria-label="Cenner"] span)'}
            reach={70}
            focus={{ x: 0, y: 1, rx: 1.35, ry: 1.5 }}
            intensity={1.45}
            palette={['#0b0c0e', '#ffffff', '#cfd4dc', '#8c93a0', '#eef0f3']}
            className="pointer-events-none absolute bottom-0 left-0 -z-[5] h-[17rem] w-[26rem] md:h-[20rem] md:w-[46rem]"
          />
          <Footer home />
        </div>
        : <Footer />)}
      <ConsentModal />
    </div>
  );
};

export default Layout;
