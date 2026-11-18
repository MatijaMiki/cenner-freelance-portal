/**
 * /services (the studio hub) as markdown. The service cards and tools come from lib/studioServices.ts,
 * like the page's; keep PROJECTS, STEPS and WHY below in step with pages/Services.tsx (projects as
 * the page sorts them, by colour). Prices come from the price list.
 */
import { COMPANY } from '../../company';
import { STUDIO_SERVICES as SERVICES, STUDIO_TOOLS as TOOLS, studioPrice } from '../../studioServices';
import { anchorDate, eurAmount, formatPrice } from '../../../components/AnchorPrice';
import { blocks, h2, h3, link, list, t, type PageModule } from '../format';

/** In the order the page shows them (sorted by colour, warm to cool). */
const PROJECTS: { title: string; url: string; internal?: string; internalLabel?: string; badges?: string[]; category: string; desc: string }[] = [
  { title: 'ranwhat', url: 'https://ranwhat.com', internal: '/ranwhat', badges: ['In active development', 'A Cenner project'], category: 'Our product · AI agent security',
    desc: 'A flight recorder for AI coding agents and a scanner for the authority they hold: open-source CLI, website and a paid catalogue feed. Our own product, built and run at Cenner.' },
  { title: 'Selected Real Estate', url: 'https://selectedrealestate.hr', category: 'Real estate',
    desc: 'Premium portal for a Croatian luxury property agency: property listings, search, agent profiles and several languages.' },
  { title: 'Stenvakt', url: 'https://stenvakt.com', internal: '/stenvakt', internalLabel: 'About Stenvakt', badges: ['In active development', 'A Cenner project'], category: 'Our product · Server maintenance',
    desc: 'A Mac app that reviews, watches and updates Linux servers over SSH, with a safe mode that undoes firewall and SSH changes if access is lost, plus a website of server guides. Our own product, built and run at Cenner.' },
  { title: 'Čistimo', url: 'https://cistimo.com', category: 'Cleaning services',
    desc: 'Booking platform and web presence for a Zagreb apartment and office cleaning company: online scheduling, clear pricing and several languages.' },
  { title: 'Shorten', url: 'https://shorten.cenner.hr', category: 'Our product · Link shortener',
    desc: 'The first app Cenner published: a link shortener with its own server, click counts by country, and an iPhone app to make and track links on the go.' },
  { title: 'Cenner.hr', url: 'https://cenner.hr', category: 'Our platform · Marketplace',
    desc: 'This marketplace: freelancer listings, protected payments, identity checks and subscriptions, and the design of this site. Built and run in-house.' },
  { title: 'Cenner Links', url: 'https://links.cenner.hr', category: 'Our product · Link in bio',
    desc: 'A link-in-bio builder for creators: one page with all your links, your own look, and a share link ready in minutes.' },
];

const STEPS = [
  { title: 'Discovery Call', desc: 'We talk through what you need, your timeline and your budget. No obligation.' },
  { title: 'Proposal & Quote', desc: 'You get a clear scope, a timeline and a fixed price. No hidden extras.' },
  { title: 'Build & Review', desc: 'We build in stages and show progress. You give feedback until it is right.' },
  { title: 'Delivery & Support', desc: 'Everything is handed over cleanly, and we stay available after launch.' },
];


const WHY = [
  { title: 'Direct Communication', desc: 'You talk to the person doing the work, not an account manager.' },
  { title: 'Fixed Pricing', desc: 'Every project is quoted upfront. No hourly surprises and no scope creep without agreement.' },
  { title: 'We Handle Hosting Too', desc: 'Servers, domains and the launch are part of the job, not an extra.' },
];

/** "Počevši od: €750 (Cijena na 18.10.2026.: od €800)", "Cijena: €250 (…)", or "Cijena: Na upit". */
function price(id: string, note?: string): string {
  const it = studioPrice(id);
  if (!it) return `${t('Price')}: ${t('On request')}`;
  const label = it.unit === 'fixed' ? t('Price') : t('Starting at');
  const amount = `${eurAmount(it.price)}${it.unit === 'from-month' ? ` / ${t('mo')}` : ''}${note ? ` ${t(note)}` : ''}`;
  return `${label}: ${amount} (${t('Price on')} ${anchorDate(it.anchor.date, 'HR')}: ${formatPrice(it.anchor.price, it.unit, t)})`;
}

export const render: PageModule['render'] = () => ({
  title: t('Built by Cenner.'),
  summary:
    'Cenner izrađuje web stranice i WooCommerce trgovine, SaaS i CRM sustave, mobilne i desktop aplikacije, AI integracije, oglase i SEO te postavlja servere. Fiksna cijena, izravna komunikacija.',
  path: '/services',
  body: blocks(
    t('Websites, web and mobile apps, desktop software, AI integrations and the servers they run on, built in-house. You talk directly to the person building it, and the price is agreed before work starts.'),
    h2(t('What we build')),
    ...SERVICES.map((s) =>
      blocks(
        h3(t(s.title)),
        s.fullPackage ? `**${t('Full package')}.** ${t(s.desc)}` : t(s.desc),
        list(s.points.map(t)),
        s.examples && `${t('For example')}: ${s.examples.map((ex) => t(ex.label)).join(', ')}.`,
        price(s.id, s.priceNote),
      ),
    ),
    h2(t('Previous Projects')),
    t('Sites and products we have built and run. Visit them live.'),
    ...PROJECTS.map((p) =>
      blocks(
        h3(p.title),
        t(p.desc),
        list([`${t(p.category)}`, ...(p.badges || []).map(t), link(p.url.replace(/^https:\/\//, ''), p.url), p.internal && link(t(p.internalLabel || 'About ranwhat'), p.internal)]),
      ),
    ),
    h2(t('How It Works')),
    STEPS.map((s, i) => `${i + 1}. **${t(s.title)}**: ${t(s.desc)}`).join('\n'),
    h2(t('Tools we work with')),
    list(TOOLS.map(t)),
    h2(t('Why work with us')),
    ...WHY.map((w) => blocks(h3(t(w.title)), t(w.desc))),
    h2(t('Request a Quote')),
    `${t('Tell us what you need. You get a reply with a scope and a fixed price.')} ${t('Or write to')} ${COMPANY.email}.`,
  ),
  related: [
    { text: 'Marketplace', href: '/marketplace' },
    { text: t('Price list'), href: '/cjenik' },
    { text: t('About Cenner'), href: '/about' },
  ],
});
