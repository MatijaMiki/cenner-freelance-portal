/**
 * /subscription (freelancer plans) as markdown. Keep in step with pages/Subscription.tsx: TIERS is
 * that page's tier list (its feature text is shown untranslated there too). Prices and fees come
 * from lib/plans.ts and lib/cjenik.js.
 */
import { PLANS, type PlanId } from '../../plans';
import { priceItem } from '../../cjenik.js';
import { anchorDate, formatPrice } from '../../../components/AnchorPrice';
import { blocks, h2, h3, t, table, type PageModule } from '../format';
import { AI_SUMMARIES } from '../summaries.mjs';

const { FREE, PRO, ULTRA, ENTERPRISE } = PLANS;
export const aiSummary: string = AI_SUMMARIES['/subscription'];

const TIERS: { id: 'free' | 'pro' | 'ultra'; period: string; description: string; features: [string, string][] }[] = [
  {
    id: 'free',
    period: 'forever',
    description: 'Start freelancing',
    features: [
      ['Public freelancer profile', 'Create a fully public profile with bio, skills, hourly rate, and contact info. Clients can discover and message you directly.'],
      ['Unlimited portfolio items', 'Upload as many past projects as you want: images, PDFs, or links. There is no cap on how much work you can showcase.'],
      ['Apply to projects', 'Browse every job posted on the marketplace and submit proposals. No restrictions on how many jobs you can apply to.'],
      ['Standard visibility', 'Your profile appears in general search results. Clients searching for your skills can find you among other freelancers.'],
      ['Basic profile stats', 'See how many times your profile was viewed and how many proposals you have sent. Simple but useful to track activity.'],
      ['Secure milestone payments', 'Payments are processed securely through Cenner. Your earnings are always protected.'],
      ['15% platform fee', 'Cenner retains 15% of each transaction to cover infrastructure and support. You keep 85% of every invoice.'],
    ],
  },
  {
    id: 'pro',
    period: 'per month',
    description: 'Grow faster',
    features: [
      ['Pro badge + boosted visibility', 'A verified Pro badge appears on your profile card and in search results. The algorithm ranks Pro profiles higher so more clients see you first.'],
      ['Featured profile rotation', 'Your profile is periodically included in the "Top Pros" section displayed on the homepage and in category pages, giving you free ongoing exposure.'],
      ['Advanced profile analytics', 'Full dashboard showing click-through rates, search impressions, profile conversion stats, and which skills are driving the most interest.'],
      ['Verified ID', 'Complete KYC identity verification to earn a Verified badge. Clients consistently choose verified freelancers first.'],
      ['Lower platform fee (10%)', 'Your commission drops from 15% to 10%. On a €1,000 project that is €50 more in your pocket compared to the Free tier.'],
      ['Priority support', 'Skip the general queue. Pro members get dedicated email support with responses within 4 business hours instead of the standard 48 hours.'],
      ['3 monthly profile boosts', 'Each boost temporarily pins your profile to the top of relevant search results for 24 hours. Use them strategically when you need new clients fast.'],
    ],
  },
  {
    id: 'ultra',
    period: 'per month',
    description: 'Build your business',
    features: [
      ['Everything in Pro', 'All features from the Pro tier are included: badge, analytics, verified status, priority support, fee reduction, and the 3 monthly boosts.'],
      ['Top search placement', 'Your profile is permanently ranked at the very top of search results for your declared skills and categories, above all other tiers.'],
      ['Homepage spotlight', 'Your profile is featured in the homepage hero section on a rotating basis, the most visible placement on the entire platform.'],
      ['Trusted freelancer status', 'A gold Trusted badge that signals to clients you are among the top-tier freelancers on Cenner. Clients filter specifically for Trusted status on high-budget jobs.'],
      ['5% commission', 'A flat 5% commission. On a €1,000 project you keep €950. Designed for freelancers who earn serious revenue. (Enterprise drops this to 0%.)'],
      ['Personal onboarding call', 'A 30-minute onboarding call with a Cenner team member to set up your profile, pricing strategy, and first campaign for maximum impact from day one.'],
      ['Client CRM + revenue analytics', 'Built-in CRM to track all active clients, open proposals, contract values, and earnings. Includes revenue trends, monthly breakdowns, and a repeat-client rate metric.'],
      ['10 monthly boosts', 'Triple the boosts of the Pro tier: 10 profile boosts per month. Run near-daily visibility campaigns and stay at the top of client searches all month long.'],
    ],
  },
];

const WHY = [
  { title: 'Protected Payments', desc: 'Every transaction is processed securely through Cenner. Your payments and earnings are always protected.' },
  { title: 'More Visibility', desc: 'Higher tiers rank you above free users. Clients searching for your skills will see you before the competition.' },
  { title: 'Lower Fees', desc: 'Going from Free to Ultra cuts your commission from 15% down to 5%. On €5,000 a month that is €500 extra in your pocket.' },
];

/** "Cijena na 10.9.2026.: €19 / mj." for one price-list item. */
const anchor = (id: string): string => {
  const it = priceItem(id);
  return `${t('Price on')} ${anchorDate(it.anchor.date, 'HR')}: ${formatPrice(it.anchor.price, it.unit, t)}`;
};

const ALL: { id: string; name: string }[] = [
  ...TIERS.map((tier) => ({ id: tier.id, name: PLANS[tier.id.toUpperCase() as PlanId].name })),
  { id: 'enterprise', name: PLANS.ENTERPRISE.name },
];

export const render: PageModule['render'] = () => ({
  title: t('Simple, Honest Pricing.'),
  summary: aiSummary,
  path: '/subscription',
  body: blocks(
    t('Pick the plan that fits where you are. Upgrade or downgrade any time.'),
    table(
      ['Plan', t('Price'), t('platform fee'), t('you keep')],
      ALL.map(({ id, name }) => {
        const p = PLANS[id.toUpperCase() as PlanId];
        return [t(name), `€${p.pricePerMonth} / ${t('mo')} (${anchor(`plan-${id}`)})`, `${p.feePercent}%`, `${100 - p.feePercent}%`];
      }),
    ),
    ...TIERS.map((tier) => {
      const p = PLANS[tier.id.toUpperCase() as PlanId];
      return blocks(
        h2(`${t(p.name)}: ${t(tier.description)}`),
        `€${p.pricePerMonth} / ${t(tier.period)} · ${p.feePercent}% ${t('platform fee')} · ${t('you keep')} ${100 - p.feePercent}%`,
        tier.features.map(([name, detail]) => `- **${name}**: ${detail}`).join('\n'),
      );
    }),
    `${t('Commission shown is deducted from the freelancer’s payout. Buyers pay a flat')} ${priceItem('buyer-fee').price}% ${t('service fee at checkout.')} ${t('Enterprise sellers pay 0% commission, and their buyers pay no service fee.')}`,
    h2(t('Enterprise')),
    `**${t('Our best plan, everything included')}.** €${PLANS.ENTERPRISE.pricePerMonth} / ${t('mo')} (${anchor('plan-enterprise')})`,
    t('Keep 100% of every sale: 0% commission, and your clients pay no service fee either. Plus the highest marketplace ranking above every tier, Trusted status, homepage spotlight, 30 monthly boosts, and priority support with ~1-hour response time.'),
    t('Pays for itself above €800 in monthly sales. Above that, every euro saved is yours.'),
    h2(t('Why upgrade?')),
    ...WHY.map((w) => blocks(h3(t(w.title)), w.desc)),
  ),
  related: [
    { text: t('Price list'), href: '/cjenik' },
    { text: 'Marketplace', href: '/marketplace' },
  ],
});
