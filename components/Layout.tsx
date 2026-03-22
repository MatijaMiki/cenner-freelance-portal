
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogOut, ChevronDown, Briefcase, MessageSquare, UserCheck, FileText } from 'lucide-react';
import PermissionModal from './PermissionModal';
import ChatWidget from './ChatWidget';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, useT } from '../i18n';
import { API } from '../lib/api';

interface LayoutProps {
  children: React.ReactNode;
}

const LANGUAGES = [
  { code: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'HR', flag: '🇭🇷', name: 'Hrvatski' },
  { code: 'DE', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'ES', flag: '🇪🇸', name: 'Español' },
  { code: 'IT', flag: '🇮🇹', name: 'Italiano' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen]         = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isLangOpen, setIsLangOpen]         = useState(false);
  const [isAboutOpen, setIsAboutOpen]       = useState(false);
  const [isMarketOpen, setIsMarketOpen]     = useState(false);
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
  const marketRef  = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideLang =
        (langRefDesktop.current && langRefDesktop.current.contains(target)) ||
        (langRefMobile.current  && langRefMobile.current.contains(target));
      if (!insideLang) setIsLangOpen(false);
      if (aboutRef.current   && !aboutRef.current.contains(target))   setIsAboutOpen(false);
      if (marketRef.current  && !marketRef.current.contains(target))  setIsMarketOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    const fetchUnread = () => {
      API.getUnreadCount()
        .then((data: any) => setUnread(data?.count ?? 0))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    import('../hooks/useSocket').then(({ disconnectSocket }) => disconnectSocket());
    logout();
    navigate('/');
  };
  const handleLangSelect = (code: string) => {
    setLang(code);
    setIsLangOpen(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const navLinks = [
    { name: t('Services'),  path: '/services' },
    { name: t('Pricing'),   path: '/subscription' },
    { name: t('Blog'),      path: '/blog' },
    { name: t('Contact'),   path: '/contact' },
  ];

  const marketDropdownItems = [
    { label: t('Marketplace'), path: '/marketplace', desc: t('Browse all freelancer listings') },
    { label: t('Job Matching'), path: '/match',       desc: t('Find jobs that match your skills') },
  ];

  const aboutDropdownItems = [
    { label: t('About Us'),          path: '/about',       desc: t('Our mission & story') },
    { label: t('Previous Projects'), path: '/projects',    desc: t("Work we've delivered") },
    { label: t('Technology'),        path: '/technology',  desc: t('The stack powering Cenner') },
  ];

  const isMarketActive = ['/marketplace', '/match'].includes(location.pathname);
  const isAboutActive  = ['/about', '/projects', '/technology'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-300 bg-brand-black text-white">
      <PermissionModal isOpen={isPermissionModalOpen} onClose={() => setIsPermissionModalOpen(false)} />
      <ChatWidget />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-brand-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="w-full px-6 lg:px-10">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-green to-brand-pink rounded-xl flex items-center justify-center font-black text-brand-black group-hover:rotate-12 transition-transform">C</div>
              <span className="text-2xl font-black tracking-tighter text-white">CENNER</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">

              {/* Marketplace Dropdown */}
              <div ref={marketRef} className="relative">
                <button
                  onClick={() => setIsMarketOpen(v => !v)}
                  className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:text-brand-green ${isMarketActive ? 'text-brand-green' : 'text-gray-400'}`}
                >
                  {t('Marketplace')}
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isMarketOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMarketOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-brand-grey border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {marketDropdownItems.map(item => (
                      <Link key={item.label} to={item.path} onClick={() => setIsMarketOpen(false)} className="block px-5 py-3.5 hover:bg-white/5 transition-colors group/item">
                        <div className="text-xs font-bold text-white group-hover/item:text-brand-green transition-colors">{item.label}</div>
                        <div className="text-[10px] text-gray-600 mt-0.5">{item.desc}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Plain links */}
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path}
                  className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:text-brand-green ${location.pathname === link.path ? 'text-brand-green' : 'text-gray-400'}`}
                >
                  {link.name}
                </Link>
              ))}

              {/* About Dropdown */}
              <div ref={aboutRef} className="relative">
                <button
                  onClick={() => setIsAboutOpen(v => !v)}
                  className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:text-brand-green ${isAboutActive ? 'text-brand-green' : 'text-gray-400'}`}
                >
                  {t('About')}
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isAboutOpen ? 'rotate-180' : ''}`} />
                </button>
                {isAboutOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-brand-grey border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {aboutDropdownItems.map(item => (
                      <Link key={item.label} to={item.path} onClick={() => setIsAboutOpen(false)} className="block px-5 py-3.5 hover:bg-white/5 transition-colors group/about">
                        <div className="text-xs font-bold text-white group-hover/about:text-brand-green transition-colors">{item.label}</div>
                        <div className="text-[10px] text-gray-600 mt-0.5">{item.desc}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-white/10 mx-2" />

              {/* Language switcher — always visible */}
              <div ref={langRefDesktop} className="relative">
                <button
                  onClick={() => setIsLangOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-colors text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest"
                >
                  <span className="text-[13px] leading-none">{currentLang.flag}</span>
                  <span>{currentLang.code}</span>
                  <ChevronDown size={10} className={`transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLangOpen && (
                  <div className="absolute top-full right-0 mt-3 w-40 bg-brand-grey border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => handleLangSelect(l.code)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${lang === l.code ? 'text-brand-green' : 'text-gray-300'}`}>
                        <span className="text-base">{l.flag}</span>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest">{l.code}</div>
                          <div className="text-[10px] text-gray-600">{l.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Currency — always visible */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <span>€</span>
                <span>EUR</span>
              </div>

              {/* Conditional: profile avatar or login button */}
              {user ? (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setIsProfileOpen(v => !v)}
                    className="flex items-center gap-2 group/profile"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-9 h-9 rounded-full border-2 border-brand-green p-0.5 group-hover/profile:scale-110 transition-transform" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-brand-grey border-2 border-brand-green flex items-center justify-center text-brand-green group-hover/profile:scale-110 transition-transform">
                        <UserIcon size={18} />
                      </div>
                    )}
                    <ChevronDown size={12} className={`text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-3 w-64 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                      {/* User info */}
                      <div className="px-4 pt-4 pb-3">
                        <div className="flex items-center gap-3 mb-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-brand-green p-0.5" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-brand-grey border-2 border-brand-green flex items-center justify-center text-brand-green">
                              <UserIcon size={18} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user.name || 'Freelancer'}</p>
                            <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/10" />

                      {/* Menu items */}
                      <div className="py-1">
                        <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                          <UserCheck size={15} className="text-gray-500" />
                          {t('Profile')}
                        </Link>
                        <Link to="/messages" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                          <MessageSquare size={15} className="text-gray-500" />
                          <span className="flex-1">{t('Messages')}</span>
                          {unread > 0 && (
                            <span className="w-5 h-5 bg-brand-green rounded-full flex items-center justify-center text-brand-black text-[10px] font-black">
                              {unread > 9 ? '9+' : unread}
                            </span>
                          )}
                        </Link>
                        <Link to="/contracts" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                          <FileText size={15} className="text-gray-500" />
                          {t('Contracts')}
                        </Link>
                        <Link to="/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                          <Briefcase size={15} className="text-gray-500" />
                          {t('Orders')}
                        </Link>
                      </div>

                      <div className="border-t border-white/10" />

                      {/* Sign out */}
                      <div className="py-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-brand-pink hover:bg-white/5 transition-colors">
                          <LogOut size={15} className="text-gray-500" />
                          {t('Sign out')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="px-8 py-3 rounded-xl bg-white text-brand-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                  {t('Login / Signup')}
                </Link>
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center gap-3">
              <div ref={langRefMobile} className="relative">
                <button onClick={() => setIsLangOpen(v => !v)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-gray-400">
                  <span className="text-sm">{currentLang.flag}</span>
                  <span className="text-[10px] font-black">{currentLang.code}</span>
                </button>
                {isLangOpen && (
                  <div className="absolute top-full right-0 mt-2 w-36 bg-brand-grey border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => handleLangSelect(l.code)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/5 ${lang === l.code ? 'text-brand-green' : 'text-gray-300'}`}>
                        <span>{l.flag}</span>
                        <span className="text-[10px] font-bold">{l.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-brand-black border-b border-white/10 pb-8 px-6 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 pt-5 pb-1">{t('Marketplace')}</p>
            {marketDropdownItems.map(item => (
              <Link key={item.label} to={item.path} onClick={() => setIsMenuOpen(false)} className="block py-2.5 text-base font-bold text-white border-b border-white/5 pl-2">{item.label}</Link>
            ))}
            {navLinks.map(link => (
              <Link key={link.name} to={link.path} onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg font-bold text-white border-b border-white/5">{link.name}</Link>
            ))}
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 pt-4 pb-1">{t('Company')}</p>
            {aboutDropdownItems.map(item => (
              <Link key={item.label} to={item.path} onClick={() => setIsMenuOpen(false)} className="block py-2.5 text-base font-semibold text-gray-300 pl-2">{item.label}</Link>
            ))}
            <div className="pt-3 border-t border-white/5">
              {user ? (
                <>
                  <div className="flex items-center gap-3 py-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border border-brand-green" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-grey border border-brand-green flex items-center justify-center text-brand-green">
                        <UserIcon size={16} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-white">{user.name}</p>
                      <p className="text-[10px] text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/profile"   onClick={() => setIsMenuOpen(false)} className="block py-2.5 text-base font-bold text-white">{t('Profile')}</Link>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block py-2.5 text-base font-bold text-brand-green">{t('Dashboard')}</Link>
                  <Link to="/messages"   onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between py-2.5 text-base font-bold text-white">
                    <span>{t('Messages')}</span>
                    {unread > 0 && (
                      <span className="w-5 h-5 bg-brand-green rounded-full flex items-center justify-center text-brand-black text-[10px] font-black">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </Link>
                  <Link to="/contracts" onClick={() => setIsMenuOpen(false)} className="block py-2.5 text-base font-bold text-white">{t('Contracts')}</Link>
                  <Link to="/orders"    onClick={() => setIsMenuOpen(false)} className="block py-2.5 text-base font-bold text-white">{t('Orders')}</Link>
                  <button onClick={handleLogout} className="block py-2.5 text-base font-bold text-brand-pink w-full text-left">{t('Sign out')}</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg font-bold text-brand-pink">{t('Login / Signup')}</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">{children}</main>
      {!location.pathname.startsWith('/messages') && <Footer />}
    </div>
  );
};

export default Layout;
