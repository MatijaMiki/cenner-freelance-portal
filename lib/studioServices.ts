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
  /** work it has gone into; `href` is a project card further down /services */
  examples?: { label: string; href?: string }[];
};

export const STUDIO_SERVICES: StudioService[] = [
  { id: 'web-stranice', title: 'Websites',
    desc: 'Custom websites built from scratch: fast, responsive and easy to find on Google.',
    points: ['Design and development', 'Works on every screen', 'Basic SEO set up'] },
  { id: 'wordpress', title: 'WordPress and WooCommerce shops',
    desc: 'WordPress sites and WooCommerce shops you can update yourself, with training included.',
    points: ['Custom themes and plugins', 'WooCommerce shop with card payments and shipping', 'Training for your team'] },
  { id: 'saas', title: 'SaaS and web apps', fullPackage: true,
    desc: 'A complete web application, ready for paying users: accounts, subscriptions, an admin side and hosting, from the first version to launch.',
    points: ['Accounts and roles', 'Stripe subscriptions and invoices', 'Admin panel', 'Transactional emails', 'Hosting and launch'],
    examples: [{ label: 'ranwhat', href: '#ranwhat' }, { label: 'Cenner.hr', href: '#cenner' }] },
  { id: 'crm', title: 'CRM systems', fullPackage: true,
    desc: 'A CRM shaped around how you actually work: clients, deals, invoices and reports in one place.',
    points: ['Clients and offers', 'Invoices and reports', 'Integrations with your tools'],
    examples: [{ label: "Cenner's own CRM" }] },
  { id: 'mobilne-aplikacije', title: 'Mobile apps (iOS and Android)', fullPackage: true,
    desc: 'Apps for iPhone and Android, on their own or alongside your web app, published to the App Store and Google Play.',
    points: ['iOS and Android', 'Accounts, payments and notifications', 'App Store and Google Play release'],
    examples: [{ label: 'Shorten', href: '#cenner-shorten' }] },
  { id: 'desktop-aplikacije', title: 'Desktop apps (Mac, Windows, Linux)', fullPackage: true,
    desc: 'Software that runs on the computer itself: native Mac apps, with Windows and Linux versions.',
    points: ['Native Mac apps', 'Windows and Linux versions', 'Installers and updates'],
    examples: [{ label: 'Stenvakt', href: '#stenvakt' }] },
  { id: 'ai-integracije', title: 'AI integrations and agents',
    desc: 'AI inside your product and your tools: assistants that work with your data, MCP servers, and plugins and skills for Claude and ChatGPT.',
    points: ['AI features in your product', 'MCP servers, Claude and ChatGPT plugins and skills', 'Agent-safe tooling and permissions', 'ChatGPT business profile and product feeds', 'n8n workflows'],
    examples: [{ label: 'ranwhat', href: '#ranwhat' }] },
  { id: 'oglasavanje', title: 'Advertising and measurement',
    desc: 'Google Ads and Meta campaigns with conversion tracking set up properly, so you know what each euro brings back.',
    points: ['Google Ads and Meta campaigns', 'GA4 conversion tracking with Consent Mode', 'Monthly reports'] },
  { id: 'seo', title: 'SEO and AI visibility',
    desc: 'Sites that search engines and AI assistants can read and recommend: technical SEO, Search Console, and pages written for ChatGPT and Claude.',
    points: ['Technical SEO and Search Console', 'AI-readable sites (llms.txt, .md pages)', 'Listings where ChatGPT and Claude find tools'],
    examples: [{ label: 'Cenner.hr', href: '#cenner' }] },
  { id: 'serveri', title: 'Servers, security and hosting',
    desc: 'Servers set up, hardened and kept patched, with backups and checks, so your sites stay up: VPS, Coolify, domains, SSL and email.',
    points: ['VPS and Coolify setup', 'Hardening and patching', 'Backups and incident checks'],
    examples: [{ label: 'Stenvakt', href: '#stenvakt' }] },
  { id: 'dizajn', title: 'Graphic design',
    desc: 'Logos, brand identity and marketing material, ready for screen and print.',
    points: ['Logo and brand identity', 'Social and ad graphics', 'Print-ready files'] },
];

/** The card's starting price from the price list in force, or null ("On request"). */
export function studioPrice(id: string) {
  return currentList().items.find(i => i.id === `studio-${id}`) || null;
}

export const STUDIO_TOOLS = ['HTML', 'CSS', 'JavaScript', 'React', 'Vite', 'WordPress', 'WooCommerce', 'Stripe', 'MCP', 'n8n', 'Linux servers', 'Coolify', 'nginx', 'DNS and SSL', 'GA4 and Google Ads', 'Affinity'];
