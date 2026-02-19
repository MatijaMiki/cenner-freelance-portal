
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Globe, Cpu, Crown, Star, Rocket, Sparkles } from 'lucide-react';
import NeuralBackground from '../components/NeuralBackground';
import { auth } from '../lib/firebase';

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const tiers = [
    {
      name: "🆓 Free",
      id: "free",
      price: "€0",
      period: "forever",
      description: "Start freelancing",
      features: [
        "Public freelancer profile",
        "Unlimited portfolio items",
        "Apply to projects",
        "Standard visibility",
        "Basic profile stats",
        "Secure escrow payments",
        "15% platform fee"
      ],
      cta: "👉 Start for free",
      highlight: false,
      icon: <Globe className="text-gray-400" size={24} />
    },
    {
      name: "🌟 Pro",
      id: "pro",
      price: "€19",
      period: "per month",
      description: "Grow faster",
      features: [
        "Pro badge + boosted visibility",
        "Featured profile rotation",
        "Advanced profile analytics",
        "Verified ID + Skill tests",
        "Lower platform fee (8%)",
        "Priority support",
        "3 monthly profile boosts"
      ],
      cta: "👉 Upgrade to Pro",
      highlight: true,
      icon: <Zap className="text-brand-green" size={24} />
    },
    {
      name: "🚀 Ultra",
      id: "ultra",
      price: "€59",
      period: "per month",
      description: "Build your business",
      features: [
        "Everything in Pro model",
        "Top search placement",
        "Homepage spotlight",
        "Dedicated profile review",
        "Trusted freelancer status",
        "Lowest fee (3–5%)",
        "Concierge onboarding",
        "Client CRM + revenue analytics",
        "10 monthly boosts"
      ],
      cta: "👉 Go Ultra",
      highlight: false,
      special: true,
      icon: <Crown className="text-brand-pink" size={24} />
    }
  ];

  const handlePlanSelection = (tierId: string) => {
    if (!currentUser) {
      // If not logged in, point to sign up/auth but carry the destination in state
      const targetPath = tierId === 'free' ? '/profile' : `/checkout-subscription/${tierId}`;
      navigate('/auth', { state: { from: targetPath } });
      return;
    }

    if (tierId === 'free') {
      navigate('/profile');
    } else {
      navigate(`/checkout-subscription/${tierId}`);
    }
  };

  return (
    <div className="relative min-h-screen">
      <NeuralBackground parallax={true} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 lg:py-32">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 lg:mb-28">
          <div className="inline-flex items-center space-x-2 bg-brand-green/10 border border-brand-green/20 rounded-full px-5 py-2 mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-brand-green">
            <Cpu size={14} />
            <span>Infrastructure Tiers</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none">
            Synchronize <br /> 
            <span className="text-brand-pink">Your Success.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
            Choose the protocol that matches your ambition. From standard access to elite zero-fee engineering environments.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => (
            <div 
              key={tier.id}
              className={`relative group bg-brand-grey/40 border transition-all duration-500 rounded-[3rem] p-10 flex flex-col h-full shadow-2xl overflow-hidden ${
                tier.highlight 
                  ? 'border-brand-green/50 ring-4 ring-brand-green/5 bg-brand-green/[0.02]' 
                  : tier.special 
                  ? 'border-brand-pink/50 ring-4 ring-brand-pink/5 bg-brand-pink/[0.02]'
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              {/* Special Effects for High-Tier */}
              {tier.special && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
              )}
              {tier.highlight && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
              )}

              {/* Tier Label/Badge */}
              {tier.highlight && (
                <div className="absolute top-8 right-8 px-4 py-1.5 bg-brand-green text-brand-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  Recommended
                </div>
              )}

              <div className="mb-10 relative">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${
                  tier.highlight ? 'bg-brand-green/10 border-brand-green/20' : 
                  tier.special ? 'bg-brand-pink/10 border-brand-pink/20' : 
                  'bg-white/5 border-white/10'
                }`}>
                  {tier.icon}
                </div>
                <h3 className="text-3xl font-black text-white mb-2 tracking-tight">{tier.name}</h3>
                <p className={`text-sm font-black uppercase tracking-widest ${
                  tier.highlight ? 'text-brand-green' : tier.special ? 'text-brand-pink' : 'text-gray-500'
                }`}>{tier.description}</p>
              </div>

              <div className="mb-10 relative">
                <div className="flex items-baseline space-x-1">
                  <span className="text-5xl font-black text-white tracking-tighter">{tier.price}</span>
                  <span className="text-gray-600 font-black uppercase text-xs tracking-widest">/ {tier.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-12 flex-grow relative">
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-start space-x-3 text-sm group/feature">
                    <Check className={`mt-0.5 shrink-0 transition-colors ${
                      tier.highlight ? 'text-brand-green' : tier.special ? 'text-brand-pink' : 'text-gray-600'
                    }`} size={18} />
                    <span className="text-gray-400 font-medium group-hover/feature:text-white transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handlePlanSelection(tier.id)}
                className={`w-full py-5 rounded-2xl font-black text-sm transition-all relative ${
                  tier.highlight 
                    ? 'bg-brand-green text-brand-black hover:scale-105 shadow-xl shadow-brand-green/20' 
                    : tier.special 
                    ? 'bg-brand-pink text-white hover:scale-105 shadow-xl shadow-brand-pink/20'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison / Trust section */}
        <section className="mt-32 py-20 border-y border-white/5 text-center">
          <h2 className="text-3xl font-black text-white mb-16 tracking-tighter">Why upgrade your protocol?</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <Star />, title: "Node Security", desc: "Advanced smart-contract encryption for every transaction node." },
              { icon: <Rocket />, title: "Turbo Discovery", desc: "Be seen by top-tier clients searching for specific elite skillsets." },
              { icon: <Sparkles />, title: "Neural Perks", desc: "Early access to our proprietary AI workflow tools and agents." }
            ].map((item, i) => (
              <div key={i} className="space-y-4">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-green">{item.icon}</div>
                <h4 className="text-xl font-bold text-white">{item.title}</h4>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Subscription;
