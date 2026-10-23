import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import SEO from '../components/SEO';
import ProjectDots from '../components/ProjectDots';
import { Tube } from '../components/Tube';
import ContactForm from '../components/ContactForm';
import { useT } from '../i18n';
import { COMPANY } from '../lib/company';
import { priceItem } from '../lib/cjenik.js';
import AnchorPrice from '../components/AnchorPrice';

/*
 * Cenner's own work, one page (it was three: Services, Technology and Previous Projects). What
 * we build (#usluge), the work it has gone into (#radovi, each project keeps its own anchor), how
 * a project runs (#proces), the tools (#alati) and the quote request (#upit). In the homepage's
 * look: paper, ink, one display face, the grass field.
 */

type Service = { id: string; title: string; desc: string; points: string[]; from?: number };

const SERVICES: Service[] = [
  { id: 'web-stranice', title: 'Websites', from: priceItem('studio-web-stranice').price,
    desc: 'Custom websites built from scratch: fast, responsive and easy to find on Google.',
    points: ['Design and development', 'Works on every screen', 'Basic SEO set up'] },
  { id: 'wordpress', title: 'WordPress', from: priceItem('studio-wordpress').price,
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
  { id: 'dizajn', title: 'Graphic design', from: priceItem('studio-dizajn').price,
    desc: 'Logos, brand identity and marketing material, ready for screen and print.',
    points: ['Logo and brand identity', 'Social and ad graphics', 'Print-ready files'] },
  { id: 'oglasavanje', title: 'Advertising',
    desc: 'Ad campaigns set up, run and measured, so you know what each euro brings back.',
    points: ['Google and social ads', 'Tracking and conversions', 'Monthly reports'] },
  { id: 'serveri', title: 'Servers, network and hosting',
    desc: 'Servers set up, networks managed, sites deployed and kept running: domains, SSL, email and backups.',
    points: ['Server setup and upkeep', 'Network management', 'Website setup and launch'] },
];

/** bg and fg are the project's own colours, taken from its site: its signature colour as the
 *  ground, and its own dark or light for the type. palette is its darkest colour and four more
 *  from its stylesheet, shown as its swatch. */
type Project = { id: string; title: string; url?: string; internal?: string; category: string; desc: string; bg: string; fg: string; palette: string[] };

const PROJECTS: Project[] = [
  { id: 'cistimo', title: 'Čistimo', url: 'https://cistimo.com', category: 'Cleaning services',
    desc: 'Booking platform and web presence for a Zagreb apartment and office cleaning company: online scheduling, clear pricing and several languages.',
    bg: '#004d40', fg: '#f1f5f4',
    palette: ['#06231d', '#ff6f00', '#d7f0ea', '#2fb6a3', '#80cbc4'] },
  { id: 'selectedrealestate', title: 'Selected Real Estate', url: 'https://selectedrealestate.hr', category: 'Real estate',
    desc: 'Premium portal for a Croatian luxury property agency: property listings, search, agent profiles and several languages.',
    bg: '#b19777', fg: '#1e1e1e',
    palette: ['#1e1e1e', '#f8f4f3', '#b19777', '#665745', '#252531'] },
  { id: 'ranwhat', title: 'ranwhat', url: 'https://ranwhat.com', internal: '/ranwhat', category: 'Our product · AI agent security',
    desc: 'A flight recorder for AI coding agents and a scanner for the authority they hold: open-source CLI, website and a paid catalogue feed. Our own product, built and run at Cenner.',
    bg: '#ea8471', fg: '#0e1318',
    palette: ['#0e1318', '#ea8471', '#e0b25c', '#72c69d', '#8db4dd'] },
  { id: 'cenner', title: 'Cenner.hr', url: 'https://cenner.hr', category: 'Our platform · Marketplace',
    desc: 'This marketplace: freelancer listings, protected payments, identity checks and subscriptions, and the design of this site. Built and run in-house.',
    bg: '#002ca5', fg: '#eef0f3',
    palette: ['#040826', '#4ade80', '#eef0f3', '#364587', '#f472b6'] },
  { id: 'cenner-shorten', title: 'Shorten', url: 'https://shorten.cenner.hr', category: 'Our product · Link shortener',
    desc: 'The first app Cenner published: a link shortener with its own server, click counts by country, and an iPhone app to make and track links on the go.',
    bg: '#58a6ff', fg: '#0f1419',
    palette: ['#0f1419', '#f85149', '#79b8ff', '#e6edf3', '#2d3a4f'] },
  { id: 'cenner-links', title: 'Cenner Links', url: 'https://links.cenner.hr', category: 'Our product · Link in bio',
    desc: 'A link-in-bio builder for creators: one page with all your links, your own look, and a share link ready in minutes.',
    bg: '#f472b6', fg: '#141414',
    palette: ['#141414', '#4ade80', '#6ee89a', '#f0f0ff', '#f472b6'] },
];

/** Hue of a #rrggbb colour, 0–360. */
function hue(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  if (!d) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

/** The work runs as a spectrum: each project's colour, warm to cool (ranwhat's coral, Selected's
 *  gold, Čistimo's green, Shorten's and Cenner's blues, Cenner Links' pink), and on into the ink of the section after it. */
const BY_COLOUR = [...PROJECTS].sort((a, b) => hue(a.bg) - hue(b.bg));


const TOOLS = ['HTML', 'CSS', 'JavaScript', 'React', 'Vite', 'WordPress', 'WooCommerce', 'n8n', 'AI integration', 'Stripe', 'Linux servers', 'nginx', 'DNS and SSL', 'Affinity'];

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


const Services: React.FC = () => {
  const t = useT();
  const subjects = [...SERVICES.map(s => `${t('Quote request')}: ${t(s.title)}`), t('Something else')];
  const [pick, setPick] = useState<{ index: number; n: number } | undefined>(undefined);

  // (the Tube's clip-path clips any outline, so focus shows inside the shape)
  const btn = 'inline-flex items-center gap-2.5 bg-sky px-7 py-4 font-display text-[15px] font-bold text-white transition-colors hover:bg-ink focus-visible:bg-ink focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4';
  const h2 = 'font-display text-[clamp(2.25rem,1.3rem+3.8vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.04em]';
  const lead = 'text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.55]';

  return (
    <div className="font-text text-ink">
      <SEO
        title="Izrada web stranica, aplikacija i automatizacija"
        canonical="/services"
        description="Cenner izrađuje web stranice, WordPress, SaaS i CRM sustave, n8n automatizacije, grafički dizajn i oglase te postavlja servere i hosting. Fiksna cijena, izravna komunikacija."
        keywords="izrada web stranica, wordpress izrada, izrada aplikacija, crm sustav, n8n automatizacija, grafički dizajn, postavljanje servera, zagreb"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ProfessionalService',
          name: COMPANY.brand,
          legalName: COMPANY.legalName,
          url: 'https://cenner.hr/services',
          email: COMPANY.email,
          telephone: COMPANY.phone,
          address: { '@type': 'PostalAddress', streetAddress: COMPANY.street, postalCode: COMPANY.postcode, addressLocality: COMPANY.city, addressCountry: COMPANY.countryCode },
          areaServed: 'HR',
          makesOffer: SERVICES.map(s => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: s.title },
            ...(s.from ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: s.from, priceCurrency: 'EUR' } } : {}),
          })),
        }}
      />

      {/* Header: the claim at poster scale, then where to go. */}
      <section className="relative overflow-hidden px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-16">
        <div className="relative z-10 mx-auto max-w-[1500px]">
          <h1 className="font-display text-[clamp(2.75rem,9vw,8.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em]">
            {t('Built by Cenner.')}
          </h1>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <p className="max-w-[46ch] text-[clamp(1.25rem,1.1rem+0.7vw,1.625rem)] leading-snug lg:col-span-7">
              {t('Websites, apps, automations and the servers they run on, built in-house. You talk directly to the person building it, and the price is agreed before work starts.')}
            </p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4 lg:col-span-5 lg:justify-end">
              <a href="#upit" className={btn}>
                {t('Request a Quote')} <ArrowRight size={17} />
              </a>
              <a href="#radovi" className="inline-flex items-center gap-2 font-display text-[15px] font-bold hover:text-sky">
                {t('See the work')} <ArrowRight size={17} />
              </a>
              <Link to="/marketplace" className="inline-flex items-center gap-2 font-display text-[15px] font-bold hover:text-sky">
                {t('Or hire a freelancer')} <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What we build */}
      <section id="usluge" aria-labelledby="usluge-title" className="relative overflow-hidden scroll-mt-24 px-4 py-16 md:px-8 md:py-24">
        <div className="relative z-10 mx-auto max-w-[1500px]">
          <div className="flex items-end justify-between gap-8">
            <h2 id="usluge-title" className={h2}>{t('What we build')}</h2>
            <ProjectDots palette={['#eff0f3', '#5b86e8', '#8fb0f5', '#a9c0f7', '#7aa0f0']} className="hidden h-32 w-72 shrink-0 md:block lg:h-40 lg:w-[28rem] [mask-image:radial-gradient(closest-side,#000_55%,transparent)] [-webkit-mask-image:radial-gradient(closest-side,#000_55%,transparent)]" />
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 md:mt-14">
            {SERVICES.map((s, si) => (
              <article key={s.id} id={s.id} className="group relative flex scroll-mt-28 flex-col border-2 border-ink bg-white p-6 transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#0b0c0e] focus-within:-translate-x-1 focus-within:-translate-y-1 focus-within:shadow-[6px_6px_0_0_#002ca5]">
                <h3 className="font-display text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em] transition-colors group-hover:text-sky">{t(s.title)}</h3>
                <p className="mt-3 text-[1rem] leading-relaxed">{t(s.desc)}</p>
                <ul className="mt-4 space-y-1.5 text-[0.95rem]">
                  {s.points.map(p => (
                    <li key={p} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-ink" />
                      {t(p)}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                  <div>
                    <p className="text-[0.85rem] text-slate">{s.from ? t('Starting at') : t('Price')}</p>
                    <p className="font-display text-[1.375rem] font-extrabold">{s.from ? `€${s.from}` : t('On request')}</p>
                    {s.from && <AnchorPrice ids={[`studio-${s.id}`]} className="mt-1 text-slate" />}
                  </div>
                  {/* The whole card is the target: this link stretches over it (::after), so keyboard and screen readers still get a real link. */}
                  <a
                    href="#upit"
                    onClick={() => setPick({ index: si, n: Date.now() })}
                    className="after:absolute after:inset-0 focus-visible:outline-none"
                  >
                    <span className="sr-only">{t('Request a Quote')}: {t(s.title)}</span>
                    <ArrowRight aria-hidden="true" size={26} strokeWidth={2.5} className="transition-transform duration-150 group-hover:translate-x-1.5 group-hover:text-sky" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* The work: one band per project in that project's own colour, sorted by colour, each with
          its own anchor (#cistimo, #ranwhat, ...), and a stair where each hands over to the next. */}
      <section id="radovi" aria-labelledby="radovi-title" className="scroll-mt-24">
        <div className="px-4 pb-14 pt-16 md:px-8 md:pb-20 md:pt-28">
          <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-12 lg:items-end">
            <h2 id="radovi-title" className={`${h2} lg:col-span-7`}>{t('Previous Projects')}</h2>
            <p className={`${lead} max-w-[44ch] lg:col-span-5`}>{t('Sites and products we have built and run. Visit them live.')}</p>
          </div>
        </div>
        <div className="mx-auto grid max-w-[1500px] gap-6 px-4 pb-16 md:px-8 md:pb-24 lg:grid-cols-2">
          {BY_COLOUR.map(p => (
            <article
              key={p.id}
              id={p.id}
              aria-labelledby={`${p.id}-title`}
              className="group relative flex scroll-mt-28 flex-col border-2 border-ink bg-white p-6 transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#0b0c0e] focus-within:-translate-x-1 focus-within:-translate-y-1 focus-within:shadow-[6px_6px_0_0_#002ca5] md:p-8"
            >
              <ProjectDots palette={p.palette} className="mb-6 aspect-[16/7] w-full border-2 border-ink" />
              {/* The whole card is the target: the title link stretches over it (::after). */}
              <h3 id={`${p.id}-title`} className="font-display text-[clamp(2rem,1.4rem+2.4vw,3.5rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-[0.12em] after:absolute after:inset-0 focus-visible:outline-none">
                    {p.title}
                    <ArrowUpRight aria-hidden="true" strokeWidth={2.5} className="mt-[0.06em] h-[0.55em] w-[0.55em] shrink-0 transition-transform group-hover:-translate-y-[0.06em] group-hover:translate-x-[0.06em] group-hover:text-sky" />
                  </a>
                ) : p.title}
              </h3>
              <div className="mt-6 max-w-[52ch]">
                <p className={lead}>{t(p.desc)}</p>
                <p className="mt-4 text-[1rem] text-slate">{t(p.category)}</p>
              </div>
              {p.internal && (
                <Link to={p.internal} className="relative z-10 mt-6 inline-flex items-center gap-2 self-start font-display text-[1.0625rem] font-bold underline-offset-4 hover:underline">
                  {t('About ranwhat')} <ArrowRight size={18} />
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* How a project runs */}
      <section id="proces" aria-labelledby="proces-title" className="relative overflow-hidden scroll-mt-24 bg-ink px-4 py-16 text-white md:px-8 md:py-24">
        <div className="relative z-10 mx-auto max-w-[1500px]">
          <h2 id="proces-title" className={h2}>{t('How It Works')}</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 md:mt-14">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t-2 border-white/80 pt-5">
                <p className="font-display text-[1rem] font-bold text-brand-green">0{i + 1}</p>
                <h3 className="mt-2 font-display text-[1.5rem] font-extrabold leading-tight">{t(s.title)}</h3>
                <p className="mt-3 text-[1rem] leading-relaxed text-white/80">{t(s.desc)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tools, and why work with us */}
      <section id="alati" aria-labelledby="alati-title" className="scroll-mt-24 px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="alati-title" className="font-display text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-extrabold leading-tight tracking-[-0.03em]">{t('Tools we work with')}</h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {TOOLS.map(tool => (
                <li key={tool} className="border-2 border-ink bg-white px-3 py-1.5 font-display text-[15px] font-bold">{t(tool)}</li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <h2 className="sr-only">{t('Why work with us')}</h2>
            <ul className="grid gap-8 sm:grid-cols-3">
              {WHY.map(w => (
                <li key={w.title}>
                  <h3 className="font-display text-[1.375rem] font-extrabold leading-tight">{t(w.title)}</h3>
                  <p className="mt-3 text-[1rem] leading-relaxed">{t(w.desc)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* The quote request */}
      <section id="upit" aria-labelledby="upit-title" className="relative overflow-hidden scroll-mt-24 bg-brand-green px-4 py-16 md:px-8 md:py-24">
        <div className="relative z-10 mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="upit-title" className={h2}>{t('Request a Quote')}</h2>
            <p className={`${lead} mt-6 max-w-[38ch]`}>{t('Tell us what you need. You get a reply with a scope and a fixed price.')}</p>
            <p className="mt-6 text-[1rem]">
              {t('Or write to')}{' '}
              <a href={`mailto:${COMPANY.email}`} className="font-bold underline underline-offset-2 hover:text-sky">{COMPANY.email}</a>
            </p>
          </div>
          <div className="lg:col-span-7">
            <ContactForm idPrefix="upit" subjects={subjects} pick={pick} messagePlaceholder={t('What do you need, and by when?')} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
