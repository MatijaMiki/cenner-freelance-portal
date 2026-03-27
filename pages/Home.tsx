
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Star, Shield, Zap, Globe, ChevronRight,
  Layers, Users, Search, Code, Palette,
  Terminal, BarChart3, Rocket, Activity, Server,
  ShieldCheck, Cpu, Briefcase, Globe2, Clock, CheckCircle, Lock,
  Link2, Scissors, Store
} from 'lucide-react';

const ROTATING_TAGS = ['#Links', '#Shorten', '#Freelancer Marketplace'];
import { MOCK_LISTINGS } from '../constants';
import SEO from '../components/SEO';
import { useT } from '../i18n';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Cenner',
  url: 'https://cenner.hr',
  logo: 'https://cenner.hr/favicon.svg',
  description: 'Elite freelance talent network connecting businesses with the top 1% of creators using AI-powered matching.',
  sameAs: [],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Cenner',
  url: 'https://cenner.hr',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://cenner.hr/marketplace?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const Home: React.FC = () => {
  const t = useT();
  const [activeTag, setActiveTag] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTag((prev) => (prev + 1) % ROTATING_TAGS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen">
      <SEO
        canonical="/"
        description="Cenner connects businesses with the top 1% of freelance talent. AI-powered matching, verified creators, and premium collaboration tools for high-end projects."
        jsonLd={[organizationJsonLd, websiteJsonLd] as any}
      />
      {/* Hero Section — Dark purple-to-black gradient */}
      <section className="relative pt-32 pb-24 px-4 z-10 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 30%, #2d1854 60%, #3b1d6e 100%)' }}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          {/* Left side — Cenner branding + rotating tags */}
          <div className="flex-1 space-y-8">
            {/* Cenner + rotating product name */}
            <div className="flex items-center gap-4 md:gap-6">
              <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-none flex-shrink-0">
                Cenner
              </h1>
              <div className="h-[1.1em] text-5xl md:text-7xl font-extrabold overflow-hidden relative">
                <div
                  className="transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateY(-${activeTag * 100}%)` }}
                >
                  {ROTATING_TAGS.map((tag, i) => (
                    <div key={i} className="h-[1.1em] flex items-center text-purple-400 whitespace-nowrap">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-lg md:text-xl text-purple-200/70 max-w-lg leading-relaxed font-medium">
              {t('The high-end freelance portal where projects meet precision. Connect with top 1% creators using modern AI-driven collaboration tools.')}
            </p>

            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/marketplace"
                className="px-8 py-4 bg-white text-purple-900 font-black rounded-2xl flex items-center space-x-3 hover:scale-105 transition-all shadow-[0_0_40px_rgba(124,58,237,0.3)]"
              >
                <span>{t('Explore Marketplace')}</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/services"
                className="px-8 py-4 bg-white/10 text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 backdrop-blur-xl transition-all"
              >
                {t('Cenner Services')}
              </Link>
            </div>
          </div>

          {/* Right side — Scrollable grid with grid overlay effect */}
          <div className="flex-1 w-full lg:max-w-md relative">
            {/* Grid overlay effect */}
            <div
              className="absolute inset-0 z-0 pointer-events-none opacity-[0.07]"
              style={{
                backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            {/* Top/bottom fade masks */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#1a0a2e] to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#2d1854] to-transparent z-10 pointer-events-none" />

            <div className="h-[420px] overflow-y-auto pr-2 space-y-4 relative z-[1]" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.4) transparent' }}>
              {[
                { title: 'Web Development', desc: 'Full-stack apps & sites', icon: <Code size={20} />, accent: 'from-violet-500 to-purple-600' },
                { title: 'Brand Design', desc: 'Logos, identity & visuals', icon: <Palette size={20} />, accent: 'from-fuchsia-500 to-purple-600' },
                { title: 'AI & Machine Learning', desc: 'Models, pipelines & automation', icon: <Cpu size={20} />, accent: 'from-purple-500 to-indigo-600' },
                { title: 'Data Science', desc: 'Analytics & insights', icon: <BarChart3 size={20} />, accent: 'from-indigo-500 to-violet-600' },
                { title: 'Mobile Apps', desc: 'iOS, Android & cross-platform', icon: <Terminal size={20} />, accent: 'from-violet-500 to-fuchsia-600' },
                { title: 'SEO & Marketing', desc: 'Growth & visibility', icon: <Search size={20} />, accent: 'from-purple-500 to-violet-600' },
                { title: 'Video & Animation', desc: 'Motion graphics & editing', icon: <Activity size={20} />, accent: 'from-fuchsia-500 to-indigo-600' },
                { title: 'Cloud & DevOps', desc: 'Infrastructure & deployment', icon: <Server size={20} />, accent: 'from-indigo-500 to-purple-600' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-pointer group">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.accent} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">{item.title}</h3>
                    <p className="text-purple-300/50 text-xs font-medium">{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-purple-400/30 ml-auto group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Vitals - Refined for clarity and business relevance */}
      <section className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                label: t("Avg. Response"),
                val: t("< 2 Hours"),
                icon: <Clock size={16} />,
                color: "text-brand-green",
                desc: t("Expert connection time")
              },
              {
                label: t("Selection Rate"),
                val: t("Top 1%"),
                icon: <Shield size={16} />,
                color: "text-brand-pink",
                desc: t("Strict technical vetting")
              },
              {
                label: t("Project Success"),
                val: "99.4%",
                icon: <CheckCircle size={16} />,
                color: "text-brand-green",
                desc: t("Milestone delivery record")
              },
              {
                label: t("Capital Security"),
                val: "100%",
                icon: <Lock size={16} />,
                color: "text-brand-pink",
                desc: t("Secure payment protection")
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
                  <p className={`text-4xl font-black mb-1 ${stat.color} tracking-tighter`}>{stat.val}</p>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Specializations */}
      <section className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">{t('Top Specializations')}</h2>
              <p className="text-gray-400 font-medium">{t('Browse our most popular categories.')}</p>
            </div>
            <Link to="/marketplace" className="hidden md:flex items-center space-x-2 text-brand-green font-bold hover:translate-x-1 transition-transform">
              <span>{t('View all categories')}</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Code />, name: t("Development"), color: "bg-blue-500/10 text-blue-400" },
              { icon: <Palette />, name: t("Creative Design"), color: "bg-brand-pink/10 text-brand-pink" },
              { icon: <Terminal />, name: t("AI & ML"), color: "bg-brand-green/10 text-brand-green" },
              { icon: <BarChart3 />, name: t("Data Science"), color: "bg-purple-500/10 text-purple-400" },
            ].map((spec, i) => (
              <Link key={i} to="/marketplace" className="group p-8 bg-brand-grey/95 border border-white/5 rounded-[2.5rem] hover:border-white/20 transition-all text-center">
                <div className={`w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center ${spec.color} group-hover:scale-110 transition-transform`}>
                  {spec.icon}
                </div>
                <h3 className="text-white font-bold text-lg">{spec.name}</h3>
                <p className="text-gray-500 text-xs mt-2 font-bold uppercase tracking-widest">{t('1.2k+ Experts')}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Global Network Visual */}
      <section className="relative py-32 z-10 overflow-hidden bg-brand-black/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
              <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
                {t('A truly')} <span className="text-brand-pink">{t('Global')}</span> <br /> {t('Expert Network.')}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed font-medium">
                {t('Our specialists operate from 142 countries, providing a follow-the-sun workflow that ensures your project never sleeps. Every node in our network is verified for local compliance and global mastery.')}
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <h4 className="text-3xl font-black text-white">{t('142+')}</h4>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Countries Represented')}</p>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-brand-green">{t('24/7')}</h4>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Active Collaboration')}</p>
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

      {/* Final Call to Action */}
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
                <Link to="/marketplace" className="px-12 py-5 bg-brand-green text-brand-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl">
                  {t('Start a Project')}
                </Link>
                <Link to="/auth" className="px-12 py-5 bg-white/5 text-white border border-white/10 font-black rounded-2xl hover:bg-white/10 transition-all">
                  {t('Join the Network')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
