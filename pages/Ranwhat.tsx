import React from 'react';
import { ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';
import { useT } from '../i18n';
import { priceItem } from '../lib/cjenik.js';
import AnchorPrice from '../components/AnchorPrice';

const RW = 'https://ranwhat.com';

const PLUS_MONTH = priceItem('ranwhat-plus-month').price;
const PLUS_YEAR = priceItem('ranwhat-plus-year').price;

const PLANS: { name: string; price: string; body: string; anchor?: string[] }[] = [
  {
    name: 'Free',
    price: 'Free, forever',
    body: 'The open-source scanner and watcher (MIT licence). Runs on one machine, no account, no telemetry, nothing sent to us.',
  },
  {
    name: 'Plus',
    price: `€${PLUS_MONTH} / month or €${PLUS_YEAR} / year`,
    anchor: ['ranwhat-plus-month', 'ranwhat-plus-year'],
    body: 'Subscription to the capability catalogue feed at feed.ranwhat.com, so the scanner knows the scopes providers have added since your version shipped. One flat price per organisation, VAT included.',
  },
  {
    name: 'Team',
    price: 'Annual, on request',
    body: 'Tamper-evident records and long-term retention. Being built, not available yet.',
  },
];

const Ranwhat: React.FC = () => {
  const t = useT();
  return (
    <div className="pt-16 pb-24 max-w-5xl mx-auto px-4">
      <SEO
        title="ranwhat: AI Agent Security by Cenner"
        canonical="/ranwhat"
        description="ranwhat is a flight recorder for AI coding agents and a scanner for the authority they hold. Built and operated by Cenner, Zagreb."
        ogLocale="en_US"
      />

      <div className="mb-20">
        <div className="inline-block px-4 py-1 bg-leaf/10 text-leaf text-xs font-black uppercase tracking-widest mb-6">{t('A Cenner product')}</div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-ink mb-6 tracking-tight">ranwhat</h1>
        <p className="text-xl md:text-2xl text-slate leading-relaxed max-w-3xl mb-8">
          A flight recorder for AI agents, and a scanner for the authority they hold. ranwhat reads what coding agents such as Claude Code actually ran on your machine and surfaces the irreversible actions worth knowing about: credentials read, bulk deletions, force pushes, packages published.
        </p>
        <a
          href={RW}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-3 px-8 py-4 bg-sky text-white font-black hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          ranwhat.com <ExternalLink size={16} />
        </a>
      </div>

      <section className="mb-20">
        <h2 className="text-3xl font-black text-ink tracking-tight mb-8">{t('Pricing')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(p => (
            <div key={p.name} className="p-8 bg-white border-2 border-ink">
              <h3 className="text-ink font-black text-xl mb-1">{p.name}</h3>
              <p className={`text-leaf font-bold text-sm ${p.anchor ? '' : 'mb-4'}`}>{p.price}</p>
              {p.anchor && <AnchorPrice ids={p.anchor} className="mt-1 mb-4 text-slate" />}
              <p className="text-slate text-sm leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
        <p className="text-slate text-sm mt-6">
          Full details on <a href={`${RW}/pricing`} target="_blank" rel="noopener" className="text-leaf hover:underline">ranwhat.com/pricing</a>.
        </p>
      </section>

      <section className="mb-20 grid md:grid-cols-2 gap-6">
        <div className="p-8 bg-white border-2 border-ink">
          <h2 className="text-ink font-black text-xl mb-4">{t('Billing, cancellation and refunds')}</h2>
          <ul className="text-slate text-sm leading-relaxed space-y-3">
            <li>Payments are processed by Stripe through its Link checkout; Stripe issues receipts and invoices and collects any VAT.</li>
            <li>Plus renews automatically each month or year and can be cancelled any time; it then runs to the end of the paid period.</li>
            <li>Full refund on request within 14 days of the first payment, no reason needed. Renewals after that are not refunded.</li>
          </ul>
          <p className="text-slate text-sm mt-6">
            <a href={`${RW}/terms`} target="_blank" rel="noopener" className="text-leaf hover:underline">{t('Terms of service')}</a>
            {' · '}
            <a href={`${RW}/privacy`} target="_blank" rel="noopener" className="text-leaf hover:underline">{t('Privacy Policy')}</a>
          </p>
        </div>

        <div className="p-8 bg-white border-2 border-ink">
          <h2 className="text-ink font-black text-xl mb-4">{t('Who runs it')}</h2>
          <p className="text-slate text-sm leading-relaxed">
            Cenner, obrt za računalno programiranje i ostale usluge, vl. Matija Mikulinec<br />
            Mikulinci 8, 10010 Zagreb, Croatia<br />
            OIB 23152585818 · MB 99210363
          </p>
          <p className="text-slate text-sm leading-relaxed mt-4">
            <a href="mailto:hello@ranwhat.com" className="text-leaf hover:underline">hello@ranwhat.com</a><br />
            <a href="tel:+385993525500" className="text-leaf hover:underline">+385 99 352 5500</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Ranwhat;
