/**
 * /services (the studio hub) as markdown. Keep in step with pages/Services.tsx: SERVICES, PROJECTS,
 * STEPS, TOOLS and WHY below are that page's lists, in its order (projects as the page sorts them,
 * by colour). Prices come from the price list.
 */
import { COMPANY } from '../../company';
import { priceItem } from '../../cjenik.js';
import { anchorDate, formatPrice } from '../../../components/AnchorPrice';
import { blocks, h2, h3, link, list, t, type PageModule } from '../format';

const SERVICES: { id: string; title: string; desc: string; points: string[]; priced?: boolean }[] = [
  { id: 'web-stranice', title: 'Websites', priced: true,
    desc: 'Custom websites built from scratch: fast, responsive and easy to find on Google.',
    points: ['Design and development', 'Works on every screen', 'Basic SEO set up'] },
  { id: 'wordpress', title: 'WordPress', priced: true,
    desc: 'WordPress sites and WooCommerce shops you can update yourself, with training included.',
    points: ['Custom themes and plugins', 'WooCommerce shops', 'Training for your team'] },
  { id: 'saas', title: 'SaaS and web apps',
    desc: 'Web applications with accounts, payments and an admin side, from the first version to launch.',
    points: ['Accounts and roles', 'Stripe payments and subscriptions', 'Admin dashboards'] },
  { id: 'crm', title: 'CRM systems',
    desc: 'A CRM shaped around how you actually work: clients, deals, invoices and reports in one place.',
    points: ['Client and deal tracking', 'Invoices and reports', 'Connected to your tools'] },
  { id: 'automatizacija', title: 'Automation and AI',
    desc: 'n8n workflows and AI that take repetitive work off your team: forms, emails, spreadsheets, CRMs and APIs, connected.',
    points: ['n8n workflows', 'AI in your product or tools', 'Documentation and training'] },
  { id: 'dizajn', title: 'Graphic design', priced: true,
    desc: 'Logos, brand identity and marketing material, ready for screen and print.',
    points: ['Logo and brand identity', 'Social and ad graphics', 'Print-ready files'] },
  { id: 'oglasavanje', title: 'Advertising',
    desc: 'Ad campaigns set up, run and measured, so you know what each euro brings back.',
    points: ['Google and social ads', 'Tracking and conversions', 'Monthly reports'] },
  { id: 'serveri', title: 'Servers, network and hosting',
    desc: 'Servers set up, networks managed, sites deployed and kept running: domains, SSL, email and backups.',
    points: ['Server setup and upkeep', 'Network management', 'Website setup and launch'] },
];

/** In the order the page shows them (sorted by colour, warm to cool). */
const PROJECTS: { title: string; url: string; internal?: string; category: string; desc: string }[] = [
  { title: 'ranwhat', url: 'https://ranwhat.com', internal: '/ranwhat', category: 'Our product · AI agent security',
    desc: 'A flight recorder for AI coding agents and a scanner for the authority they hold: open-source CLI, website and a paid catalogue feed. Our own product, built and run at Cenner.' },
  { title: 'Selected Real Estate', url: 'https://selectedrealestate.hr', category: 'Real estate',
    desc: 'Premium portal for a Croatian luxury property agency: property listings, search, agent profiles and several languages.' },
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

const TOOLS = ['HTML', 'CSS', 'JavaScript', 'React', 'Vite', 'WordPress', 'WooCommerce', 'n8n', 'AI integration', 'Stripe', 'Linux servers', 'nginx', 'DNS and SSL', 'Affinity'];

const WHY = [
  { title: 'Direct Communication', desc: 'You talk to the person doing the work, not an account manager.' },
  { title: 'Fixed Pricing', desc: 'Every project is quoted upfront. No hourly surprises and no scope creep without agreement.' },
  { title: 'We Handle Hosting Too', desc: 'Servers, domains and the launch are part of the job, not an extra.' },
];

/** "Počevši od: od €800 (Cijena na 18.10.2026.: od €800)", or "Cijena: Na upit". */
function price(id: string, priced?: boolean): string {
  if (!priced) return `${t('Price')}: ${t('On request')}`;
  const it = priceItem(`studio-${id}`);
  return `${t('Starting at')}: €${it.price} (${t('Price on')} ${anchorDate(it.anchor.date, 'HR')}: ${formatPrice(it.anchor.price, it.unit, t)})`;
}

export const render: PageModule['render'] = () => ({
  title: t('Built by Cenner.'),
  summary:
    'Cenner izrađuje web stranice, WordPress, SaaS i CRM sustave, n8n automatizacije, grafički dizajn i oglase te postavlja servere i hosting. Fiksna cijena, izravna komunikacija.',
  path: '/services',
  body: blocks(
    t('Websites, apps, automations and the servers they run on, built in-house. You talk directly to the person building it, and the price is agreed before work starts.'),
    h2(t('What we build')),
    ...SERVICES.map((s) => blocks(h3(t(s.title)), t(s.desc), list(s.points.map(t)), price(s.id, s.priced))),
    h2(t('Previous Projects')),
    t('Sites and products we have built and run. Visit them live.'),
    ...PROJECTS.map((p) =>
      blocks(
        h3(p.title),
        t(p.desc),
        list([`${t(p.category)}`, link(p.url.replace(/^https:\/\//, ''), p.url), p.internal && link(t('About ranwhat'), p.internal)]),
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
