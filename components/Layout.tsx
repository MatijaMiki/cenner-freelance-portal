
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogOut, ChevronDown, Briefcase, MessageSquare, Settings, CreditCard, UserCheck } from 'lucide-react';
import PermissionModal from './PermissionModal';
import ChatWidget from './ChatWidget';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';

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
  const [selectedLang, setSelectedLang]     = useState(() => localStorage.getItem('cenner_lang') || 'EN');
  const { user, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const langRef    = useRef<HTMLDivElement>(null);
  const aboutRef   = useRef<HTMLDivElement>(null);
  const marketRef  = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current    && !langRef.current.contains(e.target as Node))    setIsLangOpen(false);
      if (aboutRef.current   && !aboutRef.current.contains(e.target as Node))   setIsAboutOpen(false);
      if (marketRef.current  && !marketRef.current.contains(e.target as Node))  setIsMarketOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => { setIsProfileOpen(false); logout(); navigate('/'); };
  const handleLangSelect = (code: string) => {
    setSelectedLang(code);
    localStorage.setItem('cenner_lang', code);
    setIsLangOpen(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0];

  const navLinks = [
    { name: 'Services',  path: '/services' },
    { name: 'Pricing',   path: '/subscription' },
    { name: 'Blog',      path: '/blog' },
    { name: 'Contact',   path: '/contact' },
  ];

  const marketDropdownItems = [
    { label: 'Marketplace', path: '/marketplace', desc: 'Browse all freelancer listings' },
    { label: 'Job Matching', path: '/match',       desc: 'Find jobs that match your skills' },
  ];

  const aboutDropdownItems = [
    { label: 'About Us',          path: '/about',       desc: 'Our mission & story' },
    { label: 'Previous Projects', path: '/projects',    desc: "Work we've delivered" },
    { label: 'Technology',        path: '/technology',  desc: 'The stack powering Cenner' },
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
                  Marketplace
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
                  About
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

              {user ? (
                <div className="flex items-center space-x-3">

                  {/* Profile dropdown */}
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
                            Profile
                          </Link>
                          <Link to="/messages" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                            <MessageSquare size={15} className="text-gray-500" />
                            Messages
                          </Link>
                          <Link to="/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                            <Briefcase size={15} className="text-gray-500" />
                            Orders
                          </Link>
                          <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                            <Settings size={15} className="text-gray-500" />
                            Account settings
                          </Link>
                          <Link to="/billing" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                            <CreditCard size={15} className="text-gray-500" />
                            Billing and payments
                          </Link>
                        </div>

                        <div className="border-t border-white/10" />

                        {/* Language & Currency */}
                        <div className="py-1">
                          <div ref={langRef} className="relative">
                            <button
                              onClick={() => setIsLangOpen(v => !v)}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <span>{currentLang.name}</span>
                              <ChevronDown size={12} className={`text-gray-500 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isLangOpen && (
                              <div className="absolute bottom-full left-0 w-full bg-[#222] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                                {LANGUAGES.map(lang => (
                                  <button key={lang.code} onClick={() => handleLangSelect(lang.code)}
                                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-white/5 transition-colors ${selectedLang === lang.code ? 'text-brand-green' : 'text-gray-300'}`}>
                                    <span>{lang.flag}</span>
                                    <span className="text-xs">{lang.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300">
                            <span className="text-gray-500 text-xs">€</span>
                            EUR
                          </div>
                        </div>

                        <div className="border-t border-white/10" />

                        {/* Sign out */}
                        <div className="py-1">
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-brand-pink hover:bg-white/5 transition-colors">
                            <LogOut size={15} className="text-gray-500" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/auth" className="px-8 py-3 rounded-xl bg-white text-brand-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                    Login / Signup
                  </Link>
                  {/* Language Selector (logged out) */}
                  <div ref={langRef} className="relative">
                    <button
                      onClick={() => setIsLangOpen(v => !v)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-colors text-gray-400 hover:text-white"
                    >
                      <span className="text-base leading-none">{currentLang.flag}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{currentLang.code}</span>
                      <ChevronDown size={10} className={`transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isLangOpen && (
                      <div className="absolute top-full right-0 mt-3 w-40 bg-brand-grey border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                        {LANGUAGES.map(lang => (
                          <button key={lang.code} onClick={() => handleLangSelect(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${selectedLang === lang.code ? 'text-brand-green' : 'text-gray-300'}`}>
                            <span className="text-base">{lang.flag}</span>
                            <div>
                              <div className="text-[10px] font-black uppercase tracking-widest">{lang.code}</div>
                              <div className="text-[10px] text-gray-600">{lang.name}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center gap-3">
              <div ref={langRef} className="relative">
                <button onClick={() => setIsLangOpen(v => !v)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-gray-400">
                  <span className="text-sm">{currentLang.flag}</span>
                  <span className="text-[10px] font-black">{currentLang.code}</span>
                </button>
                {isLangOpen && (
                  <div className="absolute top-full right-0 mt-2 w-36 bg-brand-grey border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    {LANGUAGES.map(lang => (
                      <button key={lang.code} onClick={() => handleLangSelect(lang.code)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/5 ${selectedLang === lang.code ? 'text-brand-green' : 'text-gray-300'}`}>
                        <span>{lang.flag}</span>
                        <span className="text-[10px] font-bold">{lang.name}</span>
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
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 pt-5 pb-1">Marketplace</p>
            {marketDropdownItems.map(item => (
              <Link key={item.label} to={item.path} onClick={() => setIsMenuOpen(false)} className="block py-2.5 text-base font-bold text-white border-b border-white/5 pl-2">{item.label}</Link>
            ))}
            {navLinks.map(link => (
              <Link key={link.name} to={link.path} onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg font-bold text-white border-b border-white/5">{link.name}</Link>
            ))}
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 pt-4 pb-1">Company</p>
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
                  <Link to="/profile"   onClick={() => setIsMenuOpen(false)} className="block py-2.5 text-base font-bold text-white">Profile</Link>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block py-2.5 text-base font-bold text-brand-green">Dashboard</Link>
                  <Link to="/messages"  onClick={() => setIsMenuOpen(false)} className="block py-2.5 text-base font-bold text-white">Messages</Link>
                  <Link to="/orders"    onClick={() => setIsMenuOpen(false)} className="block py-2.5 text-base font-bold text-white">Orders</Link>
                  <Link to="/settings"  onClick={() => setIsMenuOpen(false)} className="block py-2.5 text-base font-bold text-white">Account settings</Link>
                  <button onClick={handleLogout} className="block py-2.5 text-base font-bold text-brand-pink w-full text-left">Sign out</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg font-bold text-brand-pink">Login / Signup</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
