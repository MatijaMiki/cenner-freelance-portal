
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Globe, Cpu, Crown, Star, Rocket, Sparkles } from 'lucide-react';
import NeuralBackground from '../components/NeuralBackground';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';

type Feature = {
  name: string;
  detail: string;
};

type Tier = {
  name: string;
  id: string;
  price: string;
  period: string;
  description: string;
  features: Feature[];
  cta: string;
  highlight?: boolean;
  special?: boolean;
  icon: React.ReactNode;
};

const tiers: Tier[] = [
  {
    name: 'Free',
    id: 'free',
    price: '€0',
    period: 'forever',
    description: 'Start freelancing',
    icon: <Globe className="text-gray-400" size={24} />,
    highlight: false,
    cta: 'Get started free',
    features: [
      {
        name: 'Public freelancer profile',
        detail: 'Create a fully public profile with bio, skills, hourly rate, and contact info. Clients can discover and message you directly.',
      },
      {
        name: 'Unlimited portfolio items',
        detail: 'Upload as many past projects as you want — images, PDFs, or links. There is no cap on how much work you can showcase.',
      },
      {
        name: 'Apply to projects',
        detail: 'Browse every job posted on the marketplace and submit proposals. No restrictions on how many jobs you can apply to.',
      },
      {
        name: 'Standard visibility',
        detail: 'Your profile appears in general search results. Clients searching for your skills can find you among other freelancers.',
      },
      {
        name: 'Basic profile stats',
        detail: 'See how many times your profile was viewed and how many proposals you have sent. Simple but useful to track activity.',
      },
      {
        name: 'Secure escrow payments',
        detail: 'Every payment is held in escrow and released only when you and the client approve a milestone. Your earnings are always protected.',
      },
      {
        name: '15% platform fee',
        detail: 'Cenner retains 15% of each transaction to cover infrastructure, escrow, and support. You keep 85% of every invoice.',
      },
    ],
  },
  {
    name: 'Pro',
    id: 'pro',
    price: '€19',
    period: 'per month',
    description: 'Grow faster',
    icon: <Zap className="text-brand-green" size={24} />,
    highlight: true,
    cta: 'Upgrade to Pro',
    features: [
      {
        name: 'Pro badge + boosted visibility',
        detail: 'A verified Pro badge appears on your profile card and in search results. The algorithm ranks Pro profiles higher so more clients see you first.',
      },
      {
        name: 'Featured profile rotation',
        detail: 'Your profile is periodically included in the "Top Pros" section displayed on the homepage and in category pages — free ongoing exposure.',
      },
      {
        name: 'Advanced profile analytics',
        detail: 'Full dashboard showing click-through rates, search impressions, profile conversion stats, and which skills are driving the most interest.',
      },
      {
        name: 'Verified ID + Skill tests',
        detail: 'Complete KYC identity verification and optional skill assessments to earn a Verified badge. Clients consistently choose verified freelancers first.',
      },
      {
        name: 'Lower platform fee (8%)',
        detail: 'Your fee drops from 15% to 8% — nearly half. On a €1,000 project that is €70 more in your pocket compared to the Free tier.',
      },
      {
        name: 'Priority support',
        detail: 'Skip the general queue. Pro members get dedicated email support with responses within 4 business hours instead of the standard 48 hours.',
      },
      {
        name: '3 monthly profile boosts',
        detail: 'Each boost temporarily pins your profile to the top of relevant search results for 24 hours. Use them strategically when you need new clients fast.',
      },
    ],
  },
  {
    name: 'Ultra',
    id: 'ultra',
    price: '€59',
    period: 'per month',
    description: 'Build your business',
    icon: <Crown className="text-brand-pink" size={24} />,
    highlight: false,
    special: true,
    cta: 'Go Ultra',
    features: [
      {
        name: 'Everything in Pro',
        detail: 'All features from the Pro tier are included — badge, analytics, verified status, priority support, fee reduction, and the 3 monthly boosts.',
      },
      {
        name: 'Top search placement',
        detail: 'Your profile is permanently ranked at the very top of search results for your declared skills and categories, above all other tiers.',
      },
      {
        name: 'Homepage spotlight',
        detail: 'Your profile is featured in the homepage hero section on a rotating basis — the most visible placement on the entire platform.',
      },
      {
        name: 'Dedicated profile review',
        detail: 'A Cenner team member personally reviews your profile, portfolio, and pricing, then sends you a tailored recommendations report to maximise conversions.',
      },
      {
        name: 'Trusted freelancer status',
        detail: 'A gold Trusted badge that signals to clients you are among the top-tier freelancers on Cenner. Clients filter specifically for Trusted status on high-budget jobs.',
      },
      {
        name: 'Lowest fee (3–5%)',
        detail: 'Only 3% on long-term retainer clients, 5% on one-off projects. The most competitive fee structure available — designed for freelancers who earn serious revenue.',
      },
      {
        name: 'Concierge onboarding',
        detail: 'A 30-minute onboarding call with a Cenner team member to set up your profile, pricing strategy, and first campaign for maximum impact from day one.',
      },
      {
        name: 'Client CRM + revenue analytics',
        detail: 'Built-in CRM to track all active clients, open proposals, contract values, and earnings. Includes revenue trends, monthly breakdowns, and a repeat-client rate metric.',
      },
      {
        name: '10 monthly boosts',
        detail: 'Triple the boosts of the Pro tier — 10 profile boosts per month. Run near-daily visibility campaigns and stay at the top of client searches all month long.',
      },
    ],
  },
];

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const handlePlanSelection = (tierId: string) => {
    if (!currentUser) {
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
      <SEO
        title="Pricing & Plans"
        canonical="/subscription"
        description="Choose the Cenner plan that fits your needs. From Starter to Enterprise — unlock elite freelance talent, AI matching, and premium collaboration tools."
      />
      <NeuralBackground parallax={true} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 lg:py-32">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 lg:mb-28">
          <div className="inline-flex items-center space-x-2 bg-brand-green/10 border border-brand-green/20 rounded-full px-5 py-2 mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-brand-green">
            <Cpu size={14} />
            <span>Pricing</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none">
            Simple, <br />
            <span className="text-brand-pink">Honest Pricing.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
            Pick the plan that fits where you are. Upgrade or downgrade any time — no lock-in, no surprises.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative group bg-brand-grey/70 border transition-all duration-500 rounded-[3rem] p-10 flex flex-col shadow-2xl overflow-hidden ${
                tier.highlight
                  ? 'border-brand-green/50 ring-4 ring-brand-green/5 bg-brand-green/[0.02]'
                  : tier.special
                  ? 'border-brand-pink/50 ring-4 ring-brand-pink/5 bg-brand-pink/[0.02]'
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              {tier.special  && <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/10  rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />}
              {tier.highlight && <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />}

              {tier.highlight && (
                <div className="absolute top-8 right-8 px-4 py-1.5 bg-brand-green text-brand-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  Recommended
                </div>
              )}

              {/* Tier header */}
              <div className="mb-8 relative">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${
                  tier.highlight ? 'bg-brand-green/10 border-brand-green/20' :
                  tier.special  ? 'bg-brand-pink/10 border-brand-pink/20' :
                  'bg-white/5 border-white/10'
                }`}>
                  {tier.icon}
                </div>
                <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{tier.name}</h3>
                <p className={`text-sm font-black uppercase tracking-widest ${
                  tier.highlight ? 'text-brand-green' : tier.special ? 'text-brand-pink' : 'text-gray-500'
                }`}>{tier.description}</p>
              </div>

              {/* Price */}
              <div className="mb-10 relative">
                <div className="flex items-baseline space-x-1">
                  <span className="text-5xl font-black text-white tracking-tighter">{tier.price}</span>
                  <span className="text-gray-600 font-black uppercase text-xs tracking-widest">/ {tier.period}</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => handlePlanSelection(tier.id)}
                className={`w-full py-4 rounded-2xl font-black text-sm transition-all mb-10 relative ${
                  tier.highlight
                    ? 'bg-brand-green text-brand-black hover:scale-105 shadow-xl shadow-brand-green/20'
                    : tier.special
                    ? 'bg-brand-pink text-white hover:scale-105 shadow-xl shadow-brand-pink/20'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                {tier.cta}
              </button>

              {/* Features with detail */}
              <div className="space-y-5 relative">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-600 mb-2">
                  What's included
                </p>
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check
                      className={`mt-0.5 shrink-0 ${
                        tier.highlight ? 'text-brand-green' : tier.special ? 'text-brand-pink' : 'text-gray-600'
                      }`}
                      size={16}
                    />
                    <div>
                      <p className="text-sm font-bold text-white leading-snug">{feature.name}</p>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{feature.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <section className="mt-32 py-20 border-y border-white/5 text-center">
          <h2 className="text-3xl font-black text-white mb-16 tracking-tighter">Why upgrade?</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <Star />, title: 'Protected Payments', desc: 'Every transaction runs through escrow. Money is only released when both sides agree the work is done.' },
              { icon: <Rocket />, title: 'More Visibility', desc: 'Higher tiers rank you above free users. Clients searching for your skills will see you before the competition.' },
              { icon: <Sparkles />, title: 'Lower Fees', desc: 'Going from Free to Ultra cuts your platform fee from 15% down to 3–5%. On €5,000 a month that is €500 extra in your pocket.' },
            ].map((item, i) => (
              <div key={i} className="space-y-4">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-green">{item.icon}</div>
                <h4 className="text-xl font-bold text-white">{item.title}</h4>
                <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Subscription;
