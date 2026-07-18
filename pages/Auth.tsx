
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Github, ArrowRight, Phone, AlertCircle, ChevronDown, Facebook, Search, Eye, EyeOff } from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { useT } from '../i18n';
import { hasRequiredConsent, openConsentModal } from '../lib/consent';

const SAFE_REDIRECT_PATHS = ['/profile', '/dashboard', '/marketplace', '/messages', '/orders', '/projects', '/creator-onboarding', '/subscription', '/match', '/blog', '/community', '/services'];
function getSafeRedirect(from: unknown): string {
  if (typeof from !== 'string') return '/profile';
  if (SAFE_REDIRECT_PATHS.some(p => from === p || from.startsWith(p + '/'))) return from;
  return '/profile';
}

// `name` is English, `nameLocal` is Croatian — both are searched against the typed query.
const COUNTRY_CODES = [
  { code: '+385', country: 'HR', flag: '🇭🇷', name: 'Croatia',                nameLocal: 'Hrvatska' },
  { code: '+1',   country: 'US', flag: '🇺🇸', name: 'United States',          nameLocal: 'Sjedinjene Države' },
  { code: '+44',  country: 'GB', flag: '🇬🇧', name: 'United Kingdom',         nameLocal: 'Velika Britanija' },
  { code: '+49',  country: 'DE', flag: '🇩🇪', name: 'Germany',                nameLocal: 'Njemačka' },
  { code: '+43',  country: 'AT', flag: '🇦🇹', name: 'Austria',                nameLocal: 'Austrija' },
  { code: '+39',  country: 'IT', flag: '🇮🇹', name: 'Italy',                  nameLocal: 'Italija' },
  { code: '+386', country: 'SI', flag: '🇸🇮', name: 'Slovenia',               nameLocal: 'Slovenija' },
  { code: '+387', country: 'BA', flag: '🇧🇦', name: 'Bosnia and Herzegovina', nameLocal: 'Bosna i Hercegovina' },
  { code: '+381', country: 'RS', flag: '🇷🇸', name: 'Serbia',                 nameLocal: 'Srbija' },
  { code: '+382', country: 'ME', flag: '🇲🇪', name: 'Montenegro',             nameLocal: 'Crna Gora' },
  { code: '+389', country: 'MK', flag: '🇲🇰', name: 'North Macedonia',        nameLocal: 'Sjeverna Makedonija' },
  { code: '+383', country: 'XK', flag: '🇽🇰', name: 'Kosovo',                 nameLocal: 'Kosovo' },
  { code: '+355', country: 'AL', flag: '🇦🇱', name: 'Albania',                nameLocal: 'Albanija' },
  { code: '+359', country: 'BG', flag: '🇧🇬', name: 'Bulgaria',               nameLocal: 'Bugarska' },
  { code: '+30',  country: 'GR', flag: '🇬🇷', name: 'Greece',                 nameLocal: 'Grčka' },
  { code: '+40',  country: 'RO', flag: '🇷🇴', name: 'Romania',                nameLocal: 'Rumunjska' },
  { code: '+36',  country: 'HU', flag: '🇭🇺', name: 'Hungary',                nameLocal: 'Mađarska' },
  { code: '+420', country: 'CZ', flag: '🇨🇿', name: 'Czechia',                nameLocal: 'Češka' },
  { code: '+48',  country: 'PL', flag: '🇵🇱', name: 'Poland',                 nameLocal: 'Poljska' },
  { code: '+33',  country: 'FR', flag: '🇫🇷', name: 'France',                 nameLocal: 'Francuska' },
  { code: '+34',  country: 'ES', flag: '🇪🇸', name: 'Spain',                  nameLocal: 'Španjolska' },
  { code: '+351', country: 'PT', flag: '🇵🇹', name: 'Portugal',               nameLocal: 'Portugal' },
  { code: '+31',  country: 'NL', flag: '🇳🇱', name: 'Netherlands',            nameLocal: 'Nizozemska' },
  { code: '+32',  country: 'BE', flag: '🇧🇪', name: 'Belgium',                nameLocal: 'Belgija' },
  { code: '+352', country: 'LU', flag: '🇱🇺', name: 'Luxembourg',             nameLocal: 'Luksemburg' },
  { code: '+41',  country: 'CH', flag: '🇨🇭', name: 'Switzerland',            nameLocal: 'Švicarska' },
  { code: '+353', country: 'IE', flag: '🇮🇪', name: 'Ireland',                nameLocal: 'Irska' },
  { code: '+45',  country: 'DK', flag: '🇩🇰', name: 'Denmark',                nameLocal: 'Danska' },
  { code: '+46',  country: 'SE', flag: '🇸🇪', name: 'Sweden',                 nameLocal: 'Švedska' },
  { code: '+47',  country: 'NO', flag: '🇳🇴', name: 'Norway',                 nameLocal: 'Norveška' },
  { code: '+358', country: 'FI', flag: '🇫🇮', name: 'Finland',                nameLocal: 'Finska' },
  { code: '+354', country: 'IS', flag: '🇮🇸', name: 'Iceland',                nameLocal: 'Island' },
  { code: '+372', country: 'EE', flag: '🇪🇪', name: 'Estonia',                nameLocal: 'Estonija' },
  { code: '+371', country: 'LV', flag: '🇱🇻', name: 'Latvia',                 nameLocal: 'Latvija' },
  { code: '+370', country: 'LT', flag: '🇱🇹', name: 'Lithuania',              nameLocal: 'Litva' },
  { code: '+90',  country: 'TR', flag: '🇹🇷', name: 'Turkey',                 nameLocal: 'Turska' },
  { code: '+380', country: 'UA', flag: '🇺🇦', name: 'Ukraine',                nameLocal: 'Ukrajina' },
  { code: '+7',   country: 'RU', flag: '🇷🇺', name: 'Russia',                 nameLocal: 'Rusija' },
  { code: '+1',   country: 'CA', flag: '🇨🇦', name: 'Canada',                 nameLocal: 'Kanada' },
  { code: '+52',  country: 'MX', flag: '🇲🇽', name: 'Mexico',                 nameLocal: 'Meksiko' },
  { code: '+55',  country: 'BR', flag: '🇧🇷', name: 'Brazil',                 nameLocal: 'Brazil' },
  { code: '+54',  country: 'AR', flag: '🇦🇷', name: 'Argentina',              nameLocal: 'Argentina' },
  { code: '+61',  country: 'AU', flag: '🇦🇺', name: 'Australia',              nameLocal: 'Australija' },
  { code: '+64',  country: 'NZ', flag: '🇳🇿', name: 'New Zealand',            nameLocal: 'Novi Zeland' },
  { code: '+81',  country: 'JP', flag: '🇯🇵', name: 'Japan',                  nameLocal: 'Japan' },
  { code: '+82',  country: 'KR', flag: '🇰🇷', name: 'South Korea',            nameLocal: 'Južna Koreja' },
  { code: '+86',  country: 'CN', flag: '🇨🇳', name: 'China',                  nameLocal: 'Kina' },
  { code: '+91',  country: 'IN', flag: '🇮🇳', name: 'India',                  nameLocal: 'Indija' },
  { code: '+62',  country: 'ID', flag: '🇮🇩', name: 'Indonesia',              nameLocal: 'Indonezija' },
  { code: '+60',  country: 'MY', flag: '🇲🇾', name: 'Malaysia',               nameLocal: 'Malezija' },
  { code: '+65',  country: 'SG', flag: '🇸🇬', name: 'Singapore',              nameLocal: 'Singapur' },
  { code: '+66',  country: 'TH', flag: '🇹🇭', name: 'Thailand',               nameLocal: 'Tajland' },
  { code: '+63',  country: 'PH', flag: '🇵🇭', name: 'Philippines',            nameLocal: 'Filipini' },
  { code: '+84',  country: 'VN', flag: '🇻🇳', name: 'Vietnam',                nameLocal: 'Vijetnam' },
  { code: '+880', country: 'BD', flag: '🇧🇩', name: 'Bangladesh',             nameLocal: 'Bangladeš' },
  { code: '+92',  country: 'PK', flag: '🇵🇰', name: 'Pakistan',               nameLocal: 'Pakistan' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'United Arab Emirates',   nameLocal: 'Ujedinjeni Arapski Emirati' },
  { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia',           nameLocal: 'Saudijska Arabija' },
  { code: '+972', country: 'IL', flag: '🇮🇱', name: 'Israel',                 nameLocal: 'Izrael' },
  { code: '+20',  country: 'EG', flag: '🇪🇬', name: 'Egypt',                  nameLocal: 'Egipat' },
  { code: '+27',  country: 'ZA', flag: '🇿🇦', name: 'South Africa',           nameLocal: 'Južnoafrička Republika' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria',                nameLocal: 'Nigerija' },
  { code: '+254', country: 'KE', flag: '🇰🇪', name: 'Kenya',                  nameLocal: 'Kenija' },
];

const Auth: React.FC = () => {
  const t = useT();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const countrySearchRef = useRef<HTMLInputElement>(null);

  // Close country dropdown when clicking outside.
  useEffect(() => {
    if (!showCountrySelector) return;
    const onDown = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountrySelector(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showCountrySelector]);

  // Auto-focus search input when dropdown opens.
  useEffect(() => {
    if (showCountrySelector) {
      setCountrySearch('');
      // Slight delay to let the dropdown mount before focusing.
      requestAnimationFrame(() => countrySearchRef.current?.focus());
    }
  }, [showCountrySelector]);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.nameLocal.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.code.includes(q)
    );
  }, [countrySearch]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loginWithGoogle } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const from = getSafeRedirect((location.state as any)?.from);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!hasRequiredConsent()) {
          openConsentModal('register');
          setLoading(false);
          return;
        }
        const fullPhone = `${selectedCountry.code}${phone}`;
        const referralCode = localStorage.getItem('cenner_ref') || undefined;
        await register({ email, password, name: username, mobile: fullPhone, referralCode });
        // Registration no longer auto-logs-in (anti-enumeration). Switch to the sign-in
        // view and prompt the user to check their email — same message regardless of
        // whether the address was already registered.
        setIsLogin(true);
        setPassword('');
        setNotice(t('Almost there — check your email to continue, then sign in.'));
        return;
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'An authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    const from = getSafeRedirect((location.state as any)?.from);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <SEO title="Login / Sign Up" canonical="/auth" description="Sign in or create your Cenner account to access elite freelance talent and premium collaboration tools." />
      <div className="w-full max-w-lg">
        <div className="bg-brand-grey/50 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-2xl shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
              {isLogin ? t('Welcome Back') : t('Create Account')}
            </h2>
            <p className="text-gray-500 font-medium">
              {isLogin
                ? t('Welcome back. Good to have you.')
                : t("Join thousands of freelancers and clients on Cenner.")}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-3 text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2">
              <span>{notice}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">{t('Username')}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      required
                      type="text"
                      name="username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-brand-black border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand-green transition-all"
                      placeholder={t('Enter username...')}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">{t('Phone Number')}</label>
                  <div className="flex space-x-2 relative">
                    <div className="relative" ref={countryDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowCountrySelector(!showCountrySelector)}
                        className="h-full bg-brand-black border border-white/5 rounded-xl px-3 flex items-center gap-2 text-white hover:border-white/15 focus:border-brand-green focus:outline-none transition-all text-xs font-bold min-w-[100px]"
                      >
                        <span className="text-base leading-none">{selectedCountry.flag}</span>
                        <span className="text-gray-300 font-bold">{selectedCountry.code}</span>
                        <ChevronDown size={14} className={`text-gray-500 ml-auto transition-transform ${showCountrySelector ? 'rotate-180' : ''}`} />
                      </button>

                      {showCountrySelector && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-brand-grey border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                          <div className="p-2 border-b border-white/5">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                              <input
                                ref={countrySearchRef}
                                type="text"
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                placeholder={t('Search country...')}
                                className="w-full bg-brand-black border border-white/5 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-green transition-colors"
                              />
                            </div>
                          </div>
                          <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {filteredCountries.length === 0 ? (
                              <div className="px-4 py-6 text-center text-[11px] text-gray-500 font-bold">
                                {t('No countries found')}
                              </div>
                            ) : (
                              filteredCountries.map((item) => (
                                <button
                                  key={`${item.country}-${item.code}`}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(item);
                                    setShowCountrySelector(false);
                                  }}
                                  className={`w-full text-left px-3 py-2.5 text-[12px] font-semibold flex items-center gap-3 hover:bg-white/5 transition-colors ${
                                    selectedCountry.country === item.country && selectedCountry.code === item.code
                                      ? 'text-brand-green bg-brand-green/5'
                                      : 'text-gray-300'
                                  }`}
                                >
                                  <span className="text-lg leading-none flex-shrink-0">{item.flag}</span>
                                  <span className="flex-grow truncate">{item.name}</span>
                                  <span className="text-gray-500 font-bold flex-shrink-0">{item.code}</span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative flex-grow">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        required
                        type="tel"
                        name="tel"
                        autoComplete="tel-national"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-brand-black border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand-green transition-all"
                        placeholder={t('Enter phone number...')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">{t('Email Address')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-black border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand-green transition-all"
                  placeholder={t('Enter email address...')}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">{t('Password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-black border border-white/5 rounded-xl py-3.5 pl-12 pr-12 text-white focus:outline-none focus:border-brand-green transition-all"
                  placeholder={t('Enter password...')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? t('Hide password') : t('Show password')}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-500 hover:text-brand-green hover:bg-white/5 transition-colors focus:outline-none focus:text-brand-green"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="group w-full py-4 bg-brand-green text-brand-black font-black rounded-xl flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all shadow-[0_10px_30px_rgba(74,222,128,0.15)]"
            >
              <span>{loading ? t('Processing...') : (isLogin ? t('Sign In Now') : t('Create My Account'))}</span>
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-[#121212] px-4 text-gray-500 font-bold">{t('Or authorize with')}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleGoogleAuth}
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
              disabled={loading}
              className="flex items-center justify-center space-x-2 py-3.5 border border-white/10 rounded-xl text-white hover:bg-white/5 active:scale-95 transition-all group opacity-50 cursor-not-allowed"
              title="Coming soon"
            >
              <Facebook size={16} className="text-[#1877F2]" />
              <span className="text-xs font-bold hidden sm:inline">Facebook</span>
            </button>
            <button
              disabled={loading}
              className="flex items-center justify-center space-x-2 py-3.5 border border-white/10 rounded-xl text-white hover:bg-white/5 active:scale-95 transition-all group opacity-50 cursor-not-allowed"
              title="Coming soon"
            >
              <Github size={16} />
              <span className="text-xs font-bold hidden sm:inline">Github</span>
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            {isLogin ? t('New to the platform?') : t('Already a member?')}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setNotice(null);
              }}
              className="ml-2 text-brand-pink font-bold hover:text-brand-green hover:underline transition-colors"
            >
              {isLogin ? t('Sign up') : t('Log in')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
