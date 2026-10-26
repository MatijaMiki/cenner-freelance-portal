
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Globe, Crown } from 'lucide-react';
import SEO from '../components/SEO';
import { AI_SUMMARIES } from '../lib/md/summaries.mjs';
import { useAuth } from '../contexts/AuthContext';
import { useT } from '../i18n';
import { PLANS } from '../lib/plans';
import AnchorPrice from '../components/AnchorPrice';

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
    price: `€${PLANS.FREE.pricePerMonth}`,
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
        detail: 'Upload as many past projects as you want: images, PDFs, or links. There is no cap on how much work you can showcase.',
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
        name: 'Secure milestone payments',
        detail: 'Payments are processed securely through Cenner. Your earnings are always protected.',
      },
      {
        name: '15% platform fee',
        detail: 'Cenner retains 15% of each transaction to cover infrastructure and support. You keep 85% of every invoice.',
      },
    ],
  },
  {
    name: 'Pro',
    id: 'pro',
    price: `€${PLANS.PRO.pricePerMonth}`,
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
        detail: 'Your profile is periodically included in the "Top Pros" section displayed on the homepage and in category pages, giving you free ongoing exposure.',
      },
      {
        name: 'Advanced profile analytics',
        detail: 'Full dashboard showing click-through rates, search impressions, profile conversion stats, and which skills are driving the most interest.',
      },
      {
        name: 'Verified ID',
        detail: 'Complete KYC identity verification to earn a Verified badge. Clients consistently choose verified freelancers first.',
      },
      {
        name: 'Lower platform fee (10%)',
        detail: 'Your commission drops from 15% to 10%. On a €1,000 project that is €50 more in your pocket compared to the Free tier.',
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
    price: `€${PLANS.ULTRA.pricePerMonth}`,
    period: 'per month',
    description: 'Build your business',
    icon: <Crown className="text-brand-pink" size={24} />,
    highlight: false,
    special: true,
    cta: 'Go Ultra',
    features: [
      {
        name: 'Everything in Pro',
        detail: 'All features from the Pro tier are included: badge, analytics, verified status, priority support, fee reduction, and the 3 monthly boosts.',
      },
      {
        name: 'Top search placement',
        detail: 'Your profile is permanently ranked at the very top of search results for your declared skills and categories, above all other tiers.',
      },
      {
        name: 'Homepage spotlight',
        detail: 'Your profile is featured in the homepage hero section on a rotating basis, the most visible placement on the entire platform.',
      },
      {
        name: 'Trusted freelancer status',
        detail: 'A gold Trusted badge that signals to clients you are among the top-tier freelancers on Cenner. Clients filter specifically for Trusted status on high-budget jobs.',
      },
      {
        name: '5% commission',
        detail: 'A flat 5% commission. On a €1,000 project you keep €950. Designed for freelancers who earn serious revenue. (Enterprise drops this to 0%.)',
      },
      {
        name: 'Personal onboarding call',
        detail: 'A 30-minute onboarding call with a Cenner team member to set up your profile, pricing strategy, and first campaign for maximum impact from day one.',
      },
      {
        name: 'Client CRM + revenue analytics',
        detail: 'Built-in CRM to track all active clients, open proposals, contract values, and earnings. Includes revenue trends, monthly breakdowns, and a repeat-client rate metric.',
      },
      {
        name: '10 monthly boosts',
        detail: 'Triple the boosts of the Pro tier: 10 profile boosts per month. Run near-daily visibility campaigns and stay at the top of client searches all month long.',
      },
    ],
  },
];

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const t = useT();

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
    <div className="font-text text-ink">
      <SEO
        title="Pricing & Plans"
        canonical="/subscription"
        aiSummary={AI_SUMMARIES['/subscription']}
        description="Choose the Cenner plan that fits your needs. Free, Pro, and Ultra plans lower your commission and boost your visibility, with Enterprise for teams."
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Cenner Planovi: Pretplata za Freelancere i Klijente',
            description: 'Odaberi plan koji odgovara tvojim potrebama. Besplatni i premium planovi za freelancere i klijente na Cenner platformi.',
            url: 'https://cenner.hr/subscription',
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Postoji li besplatan plan na Cenner platformi?',
                acceptedAnswer: { '@type': 'Answer', text: 'Da, Cenner nudi besplatan Free plan koji omogućuje kreiranje profila, pregledavanje usluga i osnovno komuniciranje s klijentima i freelancerima.' },
              },
              {
                '@type': 'Question',
                name: 'Mogu li otkazati pretplatu u bilo koje vrijeme?',
                acceptedAnswer: { '@type': 'Answer', text: 'Da, možeš otkazati premium pretplatu u bilo koje vrijeme bez penala. Pristup premium značajkama traje do kraja plaćenog razdoblja.' },
              },
              {
                '@type': 'Question',
                name: 'Koje načine plaćanja Cenner prihvaća?',
                acceptedAnswer: { '@type': 'Answer', text: 'Cenner prihvaća plaćanje kreditnim i debitnim karticama (Visa, Mastercard), Apple Pay i Google Pay. Sve transakcije su zaštićene SSL enkripcijom.' },
              },
              {
                '@type': 'Question',
                name: 'Koja je razlika između freelancer i klijent planova?',
                acceptedAnswer: { '@type': 'Answer', text: 'Freelancer planovi fokusirani su na vidljivost profila, broj aktivnih oglasa i prioritetno pojavljivanje u pretrazi. Klijent planovi nude napredne filtere pretrage, AI matching i upravljanje projektima.' },
              },
            ],
          },
        ]}
      />
      <div className="relative z-10 mx-auto max-w-[1500px] px-4 pb-24 pt-10 md:px-8 md:pt-16">
        {/* Header: the claim at poster scale, then the promise. */}
        <header>
          <h1 className="max-w-[16ch] font-display text-[clamp(2.5rem,7.5vw,7rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.035em]">
            {t('Simple, Honest Pricing.')}
          </h1>
          <p className="mt-8 max-w-[46ch] text-[clamp(1.125rem,1.05rem+0.5vw,1.375rem)] leading-snug">
            {t('Pick the plan that fits where you are. Upgrade or downgrade any time.')}
          </p>
        </header>

        {/* Pricing Grid */}
        <div className="mt-12 grid items-stretch gap-6 md:mt-16 lg:grid-cols-3">
          {tiers.map((tier) => {
            const feeRate = PLANS[tier.id.toUpperCase() as keyof typeof PLANS].feePercent;
            const dark = !!tier.highlight;   // Pro: the recommended plan is the inverted card
            const muted = dark ? 'text-white/70' : 'text-slate';
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col border-2 p-7 transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 md:p-8 ${
                  dark
                    ? 'border-ink bg-ink text-white hover:shadow-[8px_8px_0_0_#4ade80]'
                    : tier.special
                    ? 'border-sky bg-white shadow-[6px_6px_0_0_#002ca5] hover:shadow-[10px_10px_0_0_#002ca5]'
                    : 'border-ink bg-white hover:shadow-[8px_8px_0_0_#0b0c0e]'
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-4 left-6 bg-brand-green px-3 py-1 font-display text-[12px] font-extrabold uppercase tracking-wide text-ink">
                    {t('Recommended')}
                  </span>
                )}

                <h2 className="font-display text-[1.75rem] font-extrabold leading-none tracking-[-0.02em]">{t(tier.name)}</h2>
                <p className={`mt-2 font-display text-[14px] font-bold ${dark ? 'text-brand-green' : tier.special ? 'text-sky' : 'text-slate'}`}>{t(tier.description)}</p>

                <div className="mt-8 flex items-baseline gap-2">
                  <span className="font-display text-[4rem] font-extrabold leading-none tracking-[-0.04em]">{tier.price}</span>
                  <span className={`text-[14px] ${muted}`}>/ {t(tier.period)}</span>
                </div>
                <AnchorPrice ids={[`plan-${tier.id}`, [`commission-${tier.id}`, 'platform fee']]} className={`mt-2 ${muted}`} />

                <p className={`mt-3 text-[15px] ${muted}`}>
                  <span className={`font-display font-extrabold ${dark ? 'text-white' : 'text-ink'}`}>{feeRate}% {t('platform fee')}</span>
                  {' · '}{t('you keep')} {100 - feeRate}%
                </p>

                <button
                  onClick={() => handlePlanSelection(tier.id)}
                  className={`mt-7 w-full px-6 py-4 font-display text-[15px] font-bold transition-colors focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4 ${
                    dark
                      ? 'bg-brand-green text-ink hover:bg-white'
                      : tier.special
                      ? 'bg-sky text-white hover:bg-ink'
                      : 'bg-ink text-white hover:bg-sky'
                  }`}
                >
                  {t(tier.cta)}
                </button>

                <div className={`mt-8 border-t-2 pt-6 ${dark ? 'border-white/80' : 'border-ink'}`}>
                  <p className={`font-display text-[12px] font-extrabold uppercase tracking-[0.12em] ${muted}`}>
                    {t("What's included")}
                  </p>
                  <ul className="mt-4 space-y-4">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span aria-hidden="true" className={`mt-[0.55em] h-1.5 w-1.5 shrink-0 ${dark ? 'bg-brand-green' : tier.special ? 'bg-sky' : 'bg-ink'}`} />
                        <div>
                          <p className="font-display text-[15px] font-bold leading-snug">{feature.name}</p>
                          <p className={`mt-0.5 text-[14px] leading-relaxed ${muted}`}>{feature.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fee transparency note */}
        <p className="mt-8 max-w-[72ch] text-[14px] leading-relaxed text-slate">
          {t('Commission shown is deducted from the freelancer’s payout. Buyers pay a flat')} <span className="font-bold text-ink">5%</span> {t('service fee at checkout.')}{' '}
          {t('Enterprise sellers pay 0% commission, and their buyers pay no service fee.')}
        </p>
        <AnchorPrice ids={[['buyer-fee', 'service fee'], ['buyer-fee-enterprise', 'service fee, Enterprise sellers']]} className="mt-1 text-slate" />

        {/* Enterprise */}
        <div className="mt-8 grid gap-8 border-2 border-ink bg-brand-green p-7 transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#0b0c0e] md:p-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-extrabold leading-none tracking-[-0.03em]">{t('Enterprise')}</h2>
              <span className="border-2 border-ink px-2.5 py-1 font-display text-[12px] font-bold">{t('Our best plan, everything included')}</span>
            </div>
            <p className="mt-5 max-w-[60ch] text-[1.0625rem] leading-relaxed">
              {t('Keep 100% of every sale: 0% commission, and your clients pay no service fee either. Plus the highest marketplace ranking above every tier, Trusted status, homepage spotlight, 30 monthly boosts, and priority support with ~1-hour response time.')}
            </p>
            <p className="mt-3 font-display text-[15px] font-bold">
              {t('Pays for itself above €800 in monthly sales. Above that, every euro saved is yours.')}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 lg:col-span-4 lg:items-end">
            <div className="lg:text-right">
              <span className="font-display text-[3.5rem] font-extrabold leading-none tracking-[-0.04em]">€{PLANS.ENTERPRISE.pricePerMonth}</span>
              <span className="text-[15px]"> / {t('per month').replace('per ', '')}</span>
              <AnchorPrice ids={['plan-enterprise', ['commission-enterprise', 'platform fee'], ['buyer-fee-enterprise', 'service fee']]} className="mt-2" />
            </div>
            <button
              onClick={() => handlePlanSelection('enterprise')}
              className="bg-ink px-8 py-4 font-display text-[15px] font-bold text-white transition-colors hover:bg-sky focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
            >
              {t('Get Enterprise')}
            </button>
            <button
              onClick={() => navigate('/about#kontakt')}
              className="font-display text-[14px] font-bold underline underline-offset-4 hover:text-sky"
            >
              {t('Custom needs? Contact sales')}
            </button>
          </div>
        </div>

        {/* Why upgrade */}
        <section className="mt-20 md:mt-28" aria-labelledby="why-upgrade">
          <h2 id="why-upgrade" className="font-display text-[clamp(2.25rem,1.3rem+3.8vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">{t('Why upgrade?')}</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { title: t('Protected Payments'), desc: 'Every transaction is processed securely through Cenner. Your payments and earnings are always protected.' },
              { title: t('More Visibility'), desc: 'Higher tiers rank you above free users. Clients searching for your skills will see you before the competition.' },
              { title: t('Lower Fees'), desc: 'Going from Free to Ultra cuts your commission from 15% down to 5%. On €5,000 a month that is €500 extra in your pocket.' },
            ].map((item, i) => (
              <li key={i} className="border-t-2 border-ink pt-5">
                <p className="font-display text-[1rem] font-bold text-sky">0{i + 1}</p>
                <h3 className="mt-2 font-display text-[1.5rem] font-extrabold leading-tight">{item.title}</h3>
                <p className="mt-3 max-w-[38ch] text-[1rem] leading-relaxed">{item.desc}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
};

export default Subscription;
