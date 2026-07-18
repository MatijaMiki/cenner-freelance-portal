
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Star, Shield, Zap, Globe, ChevronRight,
  Layers, Users, Search, Code, Palette,
  Terminal, BarChart3, Rocket, Activity, Server,
  ShieldCheck, Cpu, Briefcase, Globe2, Clock, CheckCircle, Lock, Plus, Minus, Gift
} from 'lucide-react';
import NeuralBackground from '../components/NeuralBackground';
import SEO from '../components/SEO';
import { useT } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import Avatar from '../components/Avatar';

const FAQ_KEYS = [
  { q: 'faq.q1', a: 'faq.a1' },
  { q: 'faq.q2', a: 'faq.a2' },
  { q: 'faq.q3', a: 'faq.a3' },
  { q: 'faq.q4', a: 'faq.a4' },
  { q: 'faq.q5', a: 'faq.a5' },
];

const FAQ: React.FC = () => {
  const t = useT();
  const [open, setOpen] = React.useState<number | null>(null);
  return (
    <section className="relative py-24 z-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em] mb-3">FAQ</p>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">{t('Frequently Asked Questions')}</h2>
          <p className="text-gray-400 mt-3 text-base">{t('Everything about freelancing in Croatia and the EU in one place.')}</p>
        </div>
        <div className="space-y-3">
          {FAQ_KEYS.map((item, i) => (
            <div key={i} className="border border-white/10 rounded-2xl overflow-hidden bg-brand-grey/40 backdrop-blur-sm">
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="text-white font-bold text-sm leading-snug">{t(item.q)}</span>
                {open === i
                  ? <Minus size={16} className="text-brand-green flex-shrink-0" />
                  : <Plus size={16} className="text-gray-500 flex-shrink-0" />}
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-gray-400 text-sm leading-relaxed">{t(item.a)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  const t = useT();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topPros, setTopPros] = React.useState<any[]>([]);
  const [spotlight, setSpotlight] = React.useState<any[]>([]);

  // Rotating hero: alternates the default headline with the Refer & Win promo.
  const [heroSlide, setHeroSlide] = React.useState(0);
  const [heroPaused, setHeroPaused] = React.useState(false);
  React.useEffect(() => {
    if (heroPaused) return;
    // heroSlide in deps restarts the countdown on every switch, so a manual dot
    // click always buys the chosen slide a full 6 seconds.
    const id = setInterval(() => setHeroSlide(s => (s + 1) % 2), 6000);
    return () => clearInterval(id);
  }, [heroPaused, heroSlide]);

  React.useEffect(() => {
    API.getTopPros().then(setTopPros).catch(() => setTopPros([]));
    API.getSpotlight().then(setSpotlight).catch(() => setSpotlight([]));
  }, []);

  return (
    <div className="relative min-h-screen">
      <SEO
        title="Freelance Hrvatska — Pronađi Freelancera"
        canonical="/"
        description="Cenner — vodeća freelance platforma u Hrvatskoj. Pronađi provjerene freelancere za izradu web stranica, dizajn, marketing i razvoj. Honorarni posao brzo i sigurno."
        keywords="freelance hrvatska, honorarni posao, izrada web stranica, freelance platforma, najam freelancera"
      />
      <NeuralBackground parallax={true} />

      {/* Hero Section — rotates between the default headline and the Refer & Win promo */}
      <section
        className="relative pt-28 pb-20 px-4 z-10"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        <div className="max-w-4xl mx-auto text-center grid overflow-x-clip">
          {(() => {
            // Staggered entrance for a slide's inner elements: each rises in a beat
            // after the previous, so the switch reads as motion, not a swap.
            const reveal = (active: boolean, delayMs: number) => ({
              className: `transition-all duration-700 ease-out ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`,
              style: { transitionDelay: active ? `${delayMs}ms` : '0ms' } as React.CSSProperties,
            });
            const slideCls = (active: boolean, dir: 1 | -1) =>
              `[grid-area:1/1] transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${active ? 'opacity-100 translate-x-0' : `opacity-0 ${dir === -1 ? '-translate-x-[80%]' : 'translate-x-[80%]'} pointer-events-none`}`;
            const a0 = heroSlide === 0, a1 = heroSlide === 1;
            return (
              <>
                {/* Slide 1 — default. Carousel ping-pong: exits/enters stage LEFT. */}
                <div className={slideCls(a0, -1)} aria-hidden={!a0}>
                  <div {...reveal(a0, 0)}>
                    <div className="inline-flex items-center space-x-2 bg-brand-black/90 border border-white/10 rounded-full px-4 py-1 mb-6 text-xs font-medium text-brand-green animate-pulse">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
                      </span>
                      <span>{t('New: Gemini Live Voice-First Integration')}</span>
                    </div>
                  </div>

                  <div {...reveal(a0, 150)}>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[0.9]">
                      {t('Freelance Hrvatska')} <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-green via-brand-pink to-brand-green bg-[length:200%_auto] animate-gradient">
                        {t('Pronađi Freelancera')}
                      </span>
                    </h1>
                  </div>

                  <div {...reveal(a0, 300)}>
                    <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-lg font-medium">
                      {t('Vodeća freelance platforma u Hrvatskoj. Povezujemo tvrtke s provjerenim freelancerima za izradu web stranica, dizajn, marketing i razvoj. Honorarni posao — brzo, sigurno, profesionalno.')}
                    </p>
                  </div>

                  <div {...reveal(a0, 450)}>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <Link
                        to="/marketplace"
                        className="w-full sm:w-auto px-8 py-4 bg-brand-green text-brand-black font-black rounded-2xl flex items-center justify-center space-x-3 hover:scale-105 transition-all shadow-[0_0_40px_rgba(74,222,128,0.2)]"
                      >
                        <span>{t('Explore Marketplace')}</span>
                        <ArrowRight size={20} />
                      </Link>
                      <Link
                        to="/services"
                        className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 backdrop-blur-xl transition-all"
                      >
                        {t('Cenner Services')}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Slide 2 — Refer & Win promo (styled after /referral). Exits/enters stage RIGHT. */}
                <div className={slideCls(a1, 1)} aria-hidden={!a1}>
                  <div {...reveal(a1, 0)}>
                    <div className="inline-flex items-center gap-2 mb-6 text-[11px] font-black uppercase tracking-[0.3em] text-brand-green">
                      <Gift size={14} />
                      <span>{t('Refer & Win')}</span>
                    </div>
                  </div>

                  <div {...reveal(a1, 150)}>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[0.9]">
                      {t('Win 12 months of')} <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-green via-brand-pink to-brand-green bg-[length:200%_auto] animate-gradient">
                        {t('free Enterprise.')}
                      </span>
                    </h1>
                  </div>

                  <div {...reveal(a1, 300)}>
                    <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-lg font-medium">
                      {t('Our referral contest is on: share your personal link, climb the leaderboard, and the top 3 referrers win free Enterprise plus year-long listing boosts.')}
                    </p>
                  </div>

                  <div {...reveal(a1, 450)}>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <Link
                        to="/referral"
                        className="w-full sm:w-auto px-8 py-4 bg-brand-green text-brand-black font-black rounded-2xl flex items-center justify-center space-x-3 hover:scale-105 transition-all shadow-[0_0_40px_rgba(74,222,128,0.2)]"
                      >
                        <span>{t('Get my referral link')}</span>
                        <ArrowRight size={20} />
                      </Link>
                      <Link
                        to="/referral"
                        className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 backdrop-blur-xl transition-all"
                      >
                        {t('See the prizes')}
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Slide dots */}
        <div className="flex justify-center mt-10">
          <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 backdrop-blur-sm">
            {[0, 1].map(i => (
              <button
                key={i}
                onClick={() => setHeroSlide(i)}
                aria-label={i === 0 ? 'Show main headline' : 'Show referral contest'}
                className={`h-2.5 rounded-full transition-all duration-500 ${heroSlide === i ? 'w-9 bg-brand-green shadow-[0_0_14px_rgba(74,222,128,0.7)]' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Ultra Spotlight */}
      {spotlight.length > 0 && (
        <section className="relative z-10 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink">{t('Ultra Spotlight')}</span>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mt-2">{t('This week\'s featured talent')}</h2>
              </div>
              <Link to="/marketplace" className="text-brand-pink text-sm font-bold hover:translate-x-1 transition-transform flex items-center gap-2">
                {t('Browse all')} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {spotlight.map(p => (
                <Link
                  key={p.id}
                  to={`/freelancer/${p.id}`}
                  className="bg-brand-grey/60 border border-brand-pink/20 rounded-[2rem] p-6 hover:border-brand-pink/50 hover:scale-[1.02] transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar src={p.avatar} name={p.name} size={48} className="rounded-2xl" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-sm truncate">{p.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {p.trusted ? (
                          <span className="text-yellow-400 text-[9px] font-black uppercase tracking-wider">★ Trusted</span>
                        ) : (
                          <span className="text-brand-pink text-[9px] font-black uppercase tracking-wider">Ultra</span>
                        )}
                        {p.avgRating > 0 && (
                          <span className="text-gray-500 text-[10px] font-bold flex items-center gap-0.5">
                            <Star size={10} fill="currentColor" className="text-yellow-400" /> {p.avgRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {p.bio && <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-3">{p.bio}</p>}
                  {p.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.skills.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Pros */}
      {topPros.length > 0 && (
        <section className="relative z-10 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-green">{t('Top Pros')}</span>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mt-2">{t('Trusted freelancers on Cenner')}</h2>
              </div>
              <Link to="/marketplace" className="text-brand-green text-sm font-bold hover:translate-x-1 transition-transform flex items-center gap-2">
                {t('Browse all')} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {topPros.slice(0, 12).map(p => (
                <Link
                  key={p.id}
                  to={`/freelancer/${p.id}`}
                  className="bg-brand-grey/40 border border-white/5 rounded-2xl p-4 hover:border-brand-green/30 transition-all text-center group"
                >
                  <Avatar src={p.avatar} name={p.name} size={56} className="rounded-full mx-auto mb-3 border-2 border-white/10 group-hover:border-brand-green/50 transition-colors" />
                  <p className="text-white font-bold text-xs truncate mb-1">{p.name}</p>
                  <div className="flex items-center justify-center gap-1">
                    {p.trusted ? (
                      <span className="text-yellow-400 text-[9px] font-black uppercase">★</span>
                    ) : p.tier === 'ultra' ? (
                      <span className="text-brand-pink text-[9px] font-black uppercase">Ultra</span>
                    ) : (
                      <span className="text-brand-green text-[9px] font-black uppercase">Pro</span>
                    )}
                    {p.avgRating > 0 && (
                      <span className="text-gray-500 text-[10px] font-bold flex items-center gap-0.5">
                        <Star size={9} fill="currentColor" className="text-yellow-400" /> {p.avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Cenner — trust pillars */}
      <section className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                label: t("In-House Team"),
                val: t("No Outsourcing"),
                icon: <Users size={16} />,
                color: "text-brand-green",
                desc: t("Direct communication")
              },
              {
                label: t("Fixed Pricing"),
                val: t("No Surprises"),
                icon: <Shield size={16} />,
                color: "text-brand-pink",
                desc: t("Quoted upfront, always")
              },
              {
                label: t("KYC Verified"),
                val: t("Identity Checked"),
                icon: <CheckCircle size={16} />,
                color: "text-brand-green",
                desc: t("Every freelancer vetted")
              },
              {
                label: t("Stripe Escrow"),
                val: t("Protected Payments"),
                icon: <Lock size={16} />,
                color: "text-brand-pink",
                desc: t("Funds held until delivery")
              },
            ].map((stat, i) => (
              <div key={i} className="bg-brand-black/60 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between group hover:border-brand-green/30 hover:bg-brand-black/80 transition-all cursor-default">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">{stat.label}</span>
                  <div className={`opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <p className={`text-2xl font-black mb-1 ${stat.color} tracking-tight`}>{stat.val}</p>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Build */}
      <section className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">{t('What You Can Build')}</h2>
              <p className="text-gray-400 font-medium">{t('Outcomes we deliver end-to-end.')}</p>
            </div>
            <Link to="/services" className="hidden md:flex items-center space-x-2 text-brand-green font-bold hover:translate-x-1 transition-transform">
              <span>{t('See all services')}</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Code />, name: t("Landing Pages"), desc: t("Fast, custom-built sites"), color: "bg-blue-500/10 text-blue-400" },
              { icon: <Briefcase />, name: t("E-commerce"), desc: t("WooCommerce & checkout flows"), color: "bg-brand-pink/10 text-brand-pink" },
              { icon: <Terminal />, name: t("Automations"), desc: t("n8n & AI integrations"), color: "bg-brand-green/10 text-brand-green" },
              { icon: <Palette />, name: t("Brand Identity"), desc: t("Logos, assets & print-ready files"), color: "bg-purple-500/10 text-purple-400" },
            ].map((spec, i) => (
              <Link key={i} to="/services" className="group p-8 bg-brand-grey/95 border border-white/5 rounded-[2.5rem] hover:border-white/20 transition-all text-center">
                <div className={`w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center ${spec.color} group-hover:scale-110 transition-transform`}>
                  {spec.icon}
                </div>
                <h3 className="text-white font-bold text-lg">{spec.name}</h3>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">{spec.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* In-House Team Visual */}
      <section className="relative py-32 z-10 overflow-hidden bg-brand-black/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
              <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
                {t('One')} <span className="text-brand-pink">{t('in-house')}</span> <br /> {t('team. Start to finish.')}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed font-medium">
                {t('We work with clients across the EU. Every project is handled in-house — no outsourcing, no middlemen. Straightforward communication, fixed pricing, and clean handover from start to finish.')}
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <h4 className="text-3xl font-black text-white">{t('100%')}</h4>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('In-House Delivery')}</p>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-brand-green">{t('24/7')}</h4>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Direct Support')}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 relative flex justify-center">
               <div className="aspect-square w-full max-w-sm bg-brand-green/5 rounded-full border border-brand-green/20 animate-pulse relative flex items-center justify-center">
                  <Globe size={180} className="text-brand-green opacity-20 animate-[spin_60s_linear_infinite]" />
                  <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-brand-pink rounded-full blur-[2px]"></div>
                  <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-brand-green rounded-full blur-[2px]"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding (paušalni obrt) — legal-readiness CTA for new freelancers */}
      <section className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-brand-pink/10 via-brand-grey/40 to-brand-green/10 p-10 md:p-16">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-pink/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-green/10 rounded-full blur-[100px]" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-6">
                  <ShieldCheck size={12} />
                  {t('Legal in Croatia')}
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.05] mb-4">
                  {t('You cannot just sign up and work.')}
                </h2>
                <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-6 font-medium">
                  {t('To invoice clients in Croatia you must be registered as a paušalni obrt or a similar legal entity. We put together a step-by-step guide so you know exactly what to do.')}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/onboarding"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-brand-black rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    {t('Read the guide')} <ArrowRight size={14} />
                  </Link>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    {t('Informational only — not legal advice')}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { n: '01', label: t('Pick activity') },
                  { n: '02', label: t('Open via START') },
                  { n: '03', label: t('Register HZMO/HZZO') },
                  { n: '04', label: t('Connect to Cenner') },
                ].map(s => (
                  <div key={s.n} className="p-5 rounded-2xl border border-white/10 bg-brand-black/40 backdrop-blur-sm">
                    <p className="text-brand-green text-2xl font-black mb-1">{s.n}</p>
                    <p className="text-white text-xs font-bold leading-snug">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      {/* FAQ section — matches FAQPage JSON-LD schema, required by Google guidelines */}
      <FAQ />

      <section className="relative py-32 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative bg-gradient-to-br from-brand-grey to-brand-black border border-white/10 rounded-[4rem] p-12 md:p-24 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/10 rounded-full blur-[120px]"></div>
            
            <div className="relative z-10">
              <Rocket size={64} className="mx-auto mb-8 text-brand-green animate-bounce" />
              <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter">{t('Ready to get started?')}</h2>
              <p className="text-gray-300 max-w-2xl mx-auto mb-12 text-xl leading-relaxed font-medium">
                {t("Whether you're a visionary founder or a technical master, Cenner is the home for your most ambitious projects.")}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <button
                  onClick={() => user ? navigate('/profile?create=1') : navigate('/marketplace')}
                  className="px-12 py-5 bg-brand-green text-brand-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
                >
                  {t('Start a Project')}
                </button>
                <button
                  onClick={() => user ? navigate('/profile') : navigate('/auth')}
                  className="px-12 py-5 bg-white/5 text-white border border-white/10 font-black rounded-2xl hover:bg-white/10 transition-all"
                >
                  {t('Join the Network')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
