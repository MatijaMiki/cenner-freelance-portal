
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogOut, Sun, Moon, Sparkles } from 'lucide-react';
import PermissionModal from './PermissionModal';
import ChatWidget from './ChatWidget';
import Footer from './Footer';
import { auth, signOut, onAuthStateChanged } from '../lib/firebase';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const navLinks = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Subscription', path: '/subscription' },
    { name: 'Services', path: '/services' },
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-300 bg-brand-black text-white`}>
      <PermissionModal 
        isOpen={isPermissionModalOpen} 
        onClose={() => setIsPermissionModalOpen(false)} 
      />

      <ChatWidget />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-brand-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-green to-brand-pink rounded-xl flex items-center justify-center font-black text-brand-black group-hover:rotate-12 transition-transform">C</div>
              <span className="text-2xl font-black tracking-tighter text-white">CENNER</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:text-brand-green ${
                    location.pathname === link.path ? 'text-brand-green' : 'text-gray-400'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="h-6 w-px bg-white/10 mx-2"></div>

              {user ? (
                <div className="flex items-center space-x-5 pl-4">
                  <Link to="/profile" className="flex items-center space-x-4 group/profile">
                    <div className="text-right">
                      <p className="text-[9px] font-black text-brand-green uppercase tracking-widest leading-none mb-1">Elite Node</p>
                      <p className="text-xs font-bold text-white group-hover/profile:text-brand-pink transition-colors">{user.displayName || 'Freelancer'}</p>
                    </div>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full border-2 border-brand-green p-0.5 group-hover/profile:scale-110 transition-transform" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-grey border-2 border-brand-green flex items-center justify-center text-brand-green group-hover/profile:scale-110 transition-transform">
                        <UserIcon size={20} />
                      </div>
                    )}
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-brand-pink transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="px-8 py-3 rounded-xl bg-white text-brand-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                  Authenticate
                </Link>
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-brand-black border-b border-white/10 pb-8 px-6 space-y-4">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg font-bold text-white border-b border-white/5">{link.name}</Link>
            ))}
            {user ? (
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg font-bold text-brand-green">My Dashboard</Link>
            ) : (
              <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg font-bold text-brand-pink">Login / Sign Up</Link>
            )}
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
