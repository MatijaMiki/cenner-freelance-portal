/**
 * What Cenner's studio builds: the /services cards, in page order. pages/Services.tsx renders them
 * and lib/md/pages/services.ts writes the same list as markdown, so the page and its .md twin can't
 * drift. Text is English; i18n.tsx has the Croatian.
 *
 * Prices: a card shows a price only when the price list in force (lib/cjenik.js) has
 * `studio-<id>`, with its anchor ("Cijena na …") beside it, as the anchor-price rules require
 * (NN 101/26). Every other card says "On request". To price a card, add the item to a NEW
 * price-list version there; never put a number here.
 */
import { currentList } from './cjenik.js';

export type StudioService = {
  /** the card's #anchor on /services, and `studio-<id>` in the price list */
  id: string;
  title: string;
  desc: string;
  points: string[];
  /** "full package": everything listed, built and launched, for the starting price */
  fullPackage?: boolean;
  /** said right after the price, e.g. "per platform" */
  priceNote?: string;
  /** "What's included": what the price covers, shown when the card is opened. Only what Cenner
   *  actually does; no delivery times. */
  included?: string[];
  /** work it has gone into; `href` is a project card further down /services */
  examples?: { label: string; href?: string }[];
};

/**
 * The page shows the cards in THIS order: cheapest first, then the services quoted on request, then
 * design. To reorder (e.g. by what people open most: GA4 event select_content, content_type
 * "service", item_id "studio-<id>"), move entries here. Deliberately no automatic reordering: at
 * today's traffic the counts are too small to rank on, and a page that reorders itself moves under
 * the reader.
 */
export const STUDIO_SERVICES: StudioService[] = [
  { id: 'web-stranice', title: 'Simple website',
    included: ['A few pages, such as home, about, services and contact', 'Design that follows your logo and colours', 'Works on phones, tablets and computers', 'Contact form', 'Basic SEO: page titles, descriptions, sitemap and Google Search Console', 'Help setting up your domain and hosting', 'Handover and a short walkthrough'],
    desc: 'A website of a few pages, built from scratch: fast, responsive and easy to find on Google.',
    points: ['A few pages', 'Works on every screen', 'Basic SEO set up'] },
  { id: 'web-aplikacija', title: 'Website or web app',
    included: ['Many pages with clear navigation', 'Documentation or help pages', 'Forms that send to your email or your tools', 'Simple app features, such as sign-up or search', 'Works on every screen', 'Basic SEO and Google Search Console', 'Help setting up your domain and hosting'],
    desc: 'A larger site with many pages, documentation, forms or a few app features, like ranwhat.com.',
    points: ['Many pages and documentation', 'Forms and simple app features', 'Basic SEO set up'],
    examples: [{ label: 'ranwhat', href: '#ranwhat' }] },
  { id: 'web-dizajn', title: 'Custom-designed website',
    included: ['A design made for you, shown to you before it is built', 'Your feedback on the design before building starts', 'Built from scratch, no template', 'Works on phones, tablets and computers', 'Contact form', 'Basic SEO and Google Search Console', 'Help setting up your domain and hosting'],
    desc: 'A website with a design made only for you, not a template, built from scratch.',
    points: ['Unique design', 'Built from scratch', 'Works on every screen'],
    examples: [{ label: 'Selected Real Estate', href: '#selectedrealestate' }, { label: 'Čistimo', href: '#cistimo' }] },
  { id: 'wordpress', title: 'WordPress website',
    included: ['WordPress installed and set up', 'Theme adapted to your logo and colours', 'The plugins you need, set up', 'Contact form', 'Basic SEO', 'Training so you can edit pages yourself'],
    desc: 'A WordPress site you can update yourself, with training included.',
    points: ['Custom themes and plugins', 'Easy to edit yourself', 'Training for your team'] },
  { id: 'woocommerce', title: 'WooCommerce online shop',
    included: ['Everything in the WordPress website', 'Products, categories and variants', 'Card payments', 'Shipping options and prices', 'Order confirmation emails', 'Training on managing products and orders'],
    desc: 'An online shop on WordPress and WooCommerce: products, card payments, shipping and orders you manage yourself.',
    points: ['Products and categories', 'Card payments and shipping', 'Training for your team'] },
  { id: 'odrzavanje', title: 'Website maintenance',
    included: ['Software, theme and plugin updates', 'Regular backups', 'Security checks', 'Fixes if an update breaks something', 'Small content changes when you need them', 'The monthly price depends on the size of the site'],
    desc: 'Your site kept up to date and safe, with small changes when you need them.',
    points: ['Updates', 'Backups', 'Security checks', 'Small changes'] },
  { id: 'seo-provjera', title: 'SEO and AI-visibility check',
    included: ['Technical SEO: indexing, speed, titles and descriptions', 'Google Search Console review', 'How ChatGPT and Claude describe your site', 'AI-readable pages (llms.txt, .md)', 'A written report with fixes, most important first'],
    desc: 'A one-off check of how Google and AI assistants like ChatGPT and Claude see your site, with a list of what to fix first. Ongoing SEO work is quoted on request.',
    points: ['Technical SEO and Search Console', 'AI-readable pages (llms.txt, .md)', 'A list of fixes, most important first'],
    examples: [{ label: 'Cenner.hr', href: '#cenner' }] },
  { id: 'saas', title: 'SaaS or CRM, full build', fullPackage: true,
    included: ['Accounts, sign-in and roles', 'Stripe subscriptions, payments and invoices', 'Admin panel', 'Transactional emails: sign-up, receipts, password reset', 'For a CRM: clients, offers, invoices and reports', 'Hosting, domain and launch'],
    desc: 'A complete web application or CRM, ready for real users: accounts, subscriptions, an admin side and hosting, from the first version to launch.',
    points: ['Accounts and roles', 'Stripe subscriptions and invoices', 'Admin panel and transactional emails', 'For a CRM: clients, offers, invoices and reports', 'Hosting and launch'],
    examples: [{ label: 'ranwhat', href: '#ranwhat' }, { label: 'Cenner.hr', href: '#cenner' }, { label: "Cenner's own CRM" }] },
  { id: 'aplikacije', title: 'Mobile and desktop apps', priceNote: 'per platform',
    included: ['Priced per platform: iOS, Android, Mac, Windows or Linux', 'Several platforms quoted together', 'App Store and Google Play submission for mobile apps', 'Signed and notarised builds for Mac', 'Installers for Windows and Linux', 'Updates delivered to installed desktop apps'],
    desc: 'Apps for iOS, Android, Mac, Windows and Linux. Each platform is priced separately; a project for several platforms is quoted together.',
    points: ['iOS and Android', 'Mac, Windows and Linux', 'App Store, Google Play, installers and updates'],
    examples: [{ label: 'Stenvakt', href: '#stenvakt' }] },
  { id: 'ai-integracije', title: 'AI integrations and agents',
    desc: 'AI inside your product and your tools: assistants that work with your data, MCP servers, and plugins and skills for Claude and ChatGPT.',
    points: ['AI features in your product', 'MCP servers, Claude and ChatGPT plugins and skills', 'Agent-safe tooling and permissions', 'ChatGPT business profile and product feeds', 'n8n workflows'],
    examples: [{ label: 'ranwhat', href: '#ranwhat' }] },
  { id: 'oglasavanje', title: 'Advertising and measurement',
    desc: 'Google Ads and Meta campaigns with conversion tracking set up properly, so you know what each euro brings back.',
    points: ['Google Ads and Meta campaigns', 'GA4 conversion tracking with Consent Mode', 'Monthly reports'] },
  { id: 'serveri', title: 'Servers, security and hosting',
    desc: 'Servers set up, hardened and kept patched, with backups and checks, so your sites stay up: VPS, Coolify, domains, SSL and email.',
    points: ['VPS and Coolify setup', 'Hardening and patching', 'Backups and incident checks'],
    examples: [{ label: 'Stenvakt', href: '#stenvakt' }] },
  { id: 'dizajn', title: 'Graphic design',
    included: ['Logo in several versions', 'Colours and fonts for your brand', 'Social and ad graphics', 'Files ready for screen and print'],
    desc: 'Logos, brand identity and marketing material, ready for screen and print.',
    points: ['Logo and brand identity', 'Social and ad graphics', 'Print-ready files'] },
];

/** The card's starting price from the price list in force, or null ("On request"). */
export function studioPrice(id: string) {
  return currentList().items.find(i => i.id === `studio-${id}`) || null;
}

export const STUDIO_TOOLS = ['HTML', 'CSS', 'JavaScript', 'React', 'Vite', 'WordPress', 'WooCommerce', 'Stripe', 'MCP', 'n8n', 'Linux servers', 'Coolify', 'nginx', 'DNS and SSL', 'GA4 and Google Ads', 'Affinity'];
