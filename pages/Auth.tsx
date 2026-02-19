
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Github, ArrowRight, Phone, AlertCircle, CheckCircle, ChevronDown, Facebook } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from '../lib/firebase';

const COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+31', country: 'NL', flag: '🇳🇱' },
];

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const from = (location.state as any)?.from || '/profile';

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const fullPhone = `${selectedCountry.code}${phone}`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: username,
          mobile: fullPhone,
          mobileVerified: false // CRM logic: needs verification later
        });
        console.log("Saving phone number to user record:", fullPhone);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setError(null);
    setLoading(true);
    const from = (location.state as any)?.from || '/profile';
    try {
      await signInWithPopup(auth, googleProvider);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || `${provider} authentication failed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-brand-grey/50 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-2xl shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-500 font-medium">
              {isLogin 
                ? 'The elite network is waiting for your return.' 
                : 'Join the world\'s most exclusive freelance ecosystem.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      required
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-brand-black border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand-green transition-all"
                      placeholder="alex_pro"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Phone Number</label>
                  <div className="flex space-x-2 relative">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountrySelector(!showCountrySelector)}
                        className="h-full bg-brand-black border border-white/5 rounded-xl px-4 flex items-center space-x-2 text-white hover:border-white/10 transition-all text-xs font-bold min-w-[80px]"
                      >
                        <span>{selectedCountry.flag}</span>
                        <ChevronDown size={14} className="text-gray-500" />
                      </button>
                      
                      {showCountrySelector && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-brand-grey border border-white/10 rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                          <div className="max-h-48 overflow-y-auto custom-scrollbar">
                            {COUNTRY_CODES.map((item) => (
                              <button
                                key={item.country}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(item);
                                  setShowCountrySelector(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-[11px] font-bold flex items-center space-x-3 hover:bg-white/5 transition-colors ${selectedCountry.country === item.country ? 'text-brand-green bg-brand-green/5' : 'text-gray-400'}`}
                              >
                                <span className="text-lg">{item.flag}</span>
                                <span className="flex-grow">{item.country}</span>
                                <span className="text-gray-500">{item.code}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="relative flex-grow">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-brand-black border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand-green transition-all"
                        placeholder="000 0000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-black border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand-green transition-all"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-black border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand-green transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="group w-full py-4 bg-brand-green text-brand-black font-black rounded-xl flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all shadow-[0_10px_30px_rgba(74,222,128,0.15)]"
            >
              <span>{loading ? 'Processing...' : (isLogin ? 'Sign In Now' : 'Create My Account')}</span>
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-[#121212] px-4 text-gray-500 font-bold">Or authorize with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSocialAuth('Google')}
              disabled={loading}
              className="flex items-center justify-center space-x-2 py-3.5 border border-white/10 rounded-xl text-white hover:bg-white/5 active:scale-95 transition-all group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-xs font-bold hidden sm:inline">Google</span>
            </button>
            <button
              onClick={() => handleSocialAuth('Facebook')}
              disabled={loading}
              className="flex items-center justify-center space-x-2 py-3.5 border border-white/10 rounded-xl text-white hover:bg-white/5 active:scale-95 transition-all group"
            >
              <Facebook size={16} className="text-[#1877F2]" />
              <span className="text-xs font-bold hidden sm:inline">Facebook</span>
            </button>
            <button
              onClick={() => handleSocialAuth('Github')}
              disabled={loading}
              className="flex items-center justify-center space-x-2 py-3.5 border border-white/10 rounded-xl text-white hover:bg-white/5 active:scale-95 transition-all group"
            >
              <Github size={16} />
              <span className="text-xs font-bold hidden sm:inline">Github</span>
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            {isLogin ? "New to the platform?" : "Already a member?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="ml-2 text-brand-pink font-bold hover:text-brand-green hover:underline transition-colors"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
