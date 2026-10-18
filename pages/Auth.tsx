
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Github, ArrowRight, Phone, AlertCircle, ChevronDown, Facebook, Search, Eye, EyeOff } from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { useT } from '../i18n';
import { hasRequiredConsent, openConsentModal } from '../lib/consent';

// Cloudflare Turnstile: sitekey via env. No key = widget hidden and no token sent
// (backend skips verification while its TURNSTILE_SECRET_KEY is unset too).
const TURNSTILE_SITE_KEY = (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || '';

const SAFE_REDIRECT_PATHS = ['/profile', '/marketplace', '/messages', '/orders', '/creator-onboarding', '/subscription', '/blog', '/community', '/services', '/about'];
function getSafeRedirect(from: unknown): string {
  if (typeof from !== 'string') return '/profile';
  // the whitelist checks the path; a query or hash after it (/profile?tab=saved) comes along
  const path = from.split(/[?#]/)[0];
  if (SAFE_REDIRECT_PATHS.some(p => path === p || path.startsWith(p + '/'))) return from;
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

  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileDivRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    const render = () => {
      const ts = (window as any).turnstile;
      if (!ts || !turnstileDivRef.current || turnstileWidgetId.current !== null) return;
      turnstileWidgetId.current = ts.render(turnstileDivRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'light',
        callback: (token: string) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      });
    };
    if ((window as any).turnstile) { render(); return; }
    const existing = document.getElementById('cf-turnstile-script');
    if (existing) { existing.addEventListener('load', render); return; }
    const s = document.createElement('script');
    s.id = 'cf-turnstile-script';
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = render;
    document.head.appendChild(s);
  }, []);
  const resetTurnstile = () => {
    const ts = (window as any).turnstile;
    if (ts && turnstileWidgetId.current !== null) { ts.reset(turnstileWidgetId.current); setTurnstileToken(''); }
  };

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
        await login(email, password, turnstileToken || undefined);
      } else {
        if (!hasRequiredConsent()) {
          openConsentModal('register');
          setLoading(false);
          return;
        }
        const fullPhone = `${selectedCountry.code}${phone}`;
        const referralCode = localStorage.getItem('cenner_ref') || undefined;
        await register({ email, password, name: username, mobile: fullPhone, referralCode, turnstileToken: turnstileToken || undefined });
        // Registration no longer auto-logs-in (anti-enumeration). Switch to the sign-in
        // view and prompt the user to check their email — same message regardless of
        // whether the address was already registered.
        setIsLogin(true);
        setPassword('');
        setNotice(t('Almost there. Check your email to continue, then sign in.'));
        return;
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'An authentication error occurred.');
      resetTurnstile(); // tokens are single-use — a failed attempt needs a fresh one
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

  const field = 'w-full border-2 border-ink bg-white py-3.5 pl-12 pr-4 font-text text-[16px] text-ink placeholder:text-slate transition-shadow focus:border-sky focus:shadow-[4px_4px_0_0_#002ca5] focus:outline-none';
  const label = 'mb-1.5 block font-display text-[14px] font-bold';
  const icon = 'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate';
  const social = 'group flex items-center justify-center gap-2 border-2 border-ink bg-white py-3.5 font-display text-[14px] font-bold transition-colors hover:bg-paper2 disabled:cursor-not-allowed';
  const heading = isLogin ? t('Welcome Back') : t('Create Account');
  const lead = isLogin ? t('Welcome back. Good to have you.') : t("Join thousands of freelancers and clients on Cenner.");

  return (
    <div className="flex justify-center px-4 py-10 font-text text-ink md:px-8 md:py-16">
      <SEO title="Login / Sign Up" canonical="/auth" noIndex description="Sign in or create your Cenner account to access elite freelance talent and premium collaboration tools." />

      <div className="w-full max-w-xl">
        <div className="mb-8">
          <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.035em]">{heading}</h1>
          <p className="mt-3 max-w-[34ch] text-[1.0625rem] leading-snug text-ink/80">{lead}</p>
        </div>

        {/* The form sits in a bordered card on the page background, like every other card. */}
        <div className="border-2 border-ink bg-white p-6 shadow-[8px_8px_0_0_#0b0c0e] md:p-10">
          {error && (
            <div role="alert" className="mb-6 flex items-center gap-3 border-2 border-red-700 bg-red-50 p-4 text-[15px] font-medium text-red-800 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div role="status" className="mb-6 flex items-center gap-3 border-2 border-leaf bg-leaf/10 p-4 text-[15px] font-medium text-leaf animate-in fade-in slide-in-from-top-2">
              <span>{notice}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="auth-username" className={label}>{t('Username')}</label>
                  <div className="relative">
                    <User className={icon} size={18} aria-hidden="true" />
                    <input
                      id="auth-username"
                      required
                      type="text"
                      name="username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={field}
                      placeholder={t('Enter username...')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-phone" className={label}>{t('Phone Number')}</label>
                  <div className="relative flex gap-2">
                    <div className="relative" ref={countryDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowCountrySelector(!showCountrySelector)}
                        aria-expanded={showCountrySelector}
                        className="flex h-full min-w-[104px] items-center gap-2 border-2 border-ink bg-white px-3 font-display text-[14px] font-bold transition-colors hover:bg-paper2 focus:border-sky focus:outline-none"
                      >
                        <span className="text-base leading-none">{selectedCountry.flag}</span>
                        <span>{selectedCountry.code}</span>
                        <ChevronDown size={14} aria-hidden="true" className={`ml-auto text-slate transition-transform ${showCountrySelector ? 'rotate-180' : ''}`} />
                      </button>

                      {showCountrySelector && (
                        <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden border-2 border-ink bg-white shadow-[6px_6px_0_0_#0b0c0e] animate-in fade-in zoom-in-95 duration-150">
                          <div className="border-b-2 border-ink p-2">
                            <div className="relative">
                              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate" size={14} aria-hidden="true" />
                              <input
                                ref={countrySearchRef}
                                type="text"
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                placeholder={t('Search country...')}
                                aria-label={t('Search country...')}
                                className="w-full border-2 border-ink bg-white py-2 pl-9 pr-3 text-[14px] text-ink placeholder:text-slate focus:border-sky focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="custom-scrollbar max-h-64 overflow-y-auto">
                            {filteredCountries.length === 0 ? (
                              <div className="px-4 py-6 text-center text-[14px] font-bold text-slate">
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
                                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left font-display text-[14px] font-bold transition-colors ${
                                    selectedCountry.country === item.country && selectedCountry.code === item.code
                                      ? 'bg-ink text-white'
                                      : 'hover:bg-paper2'
                                  }`}
                                >
                                  <span className="flex-shrink-0 text-lg leading-none">{item.flag}</span>
                                  <span className="flex-grow truncate">{item.name}</span>
                                  <span className="flex-shrink-0 opacity-70">{item.code}</span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative flex-grow">
                      <Phone className={icon} size={18} aria-hidden="true" />
                      <input
                        id="auth-phone"
                        required
                        type="tel"
                        name="tel"
                        autoComplete="tel-national"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={field}
                        placeholder={t('Enter phone number...')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className={label}>{t('Email Address')}</label>
              <div className="relative">
                <Mail className={icon} size={18} aria-hidden="true" />
                <input
                  id="auth-email"
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={field}
                  placeholder={t('Enter email address...')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className={label}>{t('Password')}</label>
              <div className="relative">
                <Lock className={icon} size={18} aria-hidden="true" />
                <input
                  id="auth-password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${field} pr-12`}
                  placeholder={t('Enter password...')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? t('Hide password') : t('Show password')}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate transition-colors hover:text-sky focus:text-sky focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {TURNSTILE_SITE_KEY && (
              <div ref={turnstileDivRef} className="flex justify-center" />
            )}

            <button
              disabled={loading || (!!TURNSTILE_SITE_KEY && !turnstileToken)}
              type="submit"
              className="group flex w-full items-center justify-center gap-2.5 bg-sky px-7 py-4 font-display text-[16px] font-bold text-white transition-colors hover:bg-ink focus-visible:bg-ink focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4 disabled:opacity-50"
            >
              <span>{loading ? t('Processing...') : (isLogin ? t('Sign In Now') : t('Create My Account'))}</span>
              {!loading && <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <div className="relative my-9">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t-2 border-ink/25"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 font-display text-[12px] font-extrabold uppercase tracking-[0.12em] text-slate">{t('Or authorize with')}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className={social}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="hidden sm:inline">Google</span>
            </button>
            <button
              disabled={loading}
              className={`${social} cursor-not-allowed opacity-50`}
              title="Coming soon"
            >
              <Facebook size={16} className="text-[#1877F2]" aria-hidden="true" />
              <span className="hidden sm:inline">Facebook</span>
            </button>
            <button
              disabled={loading}
              className={`${social} cursor-not-allowed opacity-50`}
              title="Coming soon"
            >
              <Github size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Github</span>
            </button>
          </div>

          <p className="mt-9 text-center text-[15px] text-ink/80">
            {isLogin ? t('New to the platform?') : t('Already a member?')}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setNotice(null);
              }}
              className="ml-2 font-display font-bold text-sky underline underline-offset-4 hover:text-ink"
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
