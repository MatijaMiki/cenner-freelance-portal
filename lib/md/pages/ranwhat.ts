/** /ranwhat as markdown. Keep in step with pages/Ranwhat.tsx. */
import { COMPANY, companyAddress } from '../../company';
import { priceItem } from '../../cjenik.js';
import { anchorDate, formatPrice } from '../../../components/AnchorPrice';
import { blocks, h2, h3, link, list, t, type PageModule } from '../format';

const RW = 'https://ranwhat.com';

const PLUS_MONTH = priceItem('ranwhat-plus-month').price;
const PLUS_YEAR = priceItem('ranwhat-plus-year').price;

/** The "dodatna cijena" line AnchorPrice shows under a price ("Cijena na 4.10.2026.: €12 / mj. · €120 / god."). */
function anchorLine(ids: string[]): string {
  const items = ids.map((id) => priceItem(id));
  return `${t('Price on')} ${anchorDate(items[0].anchor.date, 'HR')}: ${items.map((it) => formatPrice(it.anchor.price, it.unit, t)).join(' · ')}`;
}

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

export const render: PageModule['render'] = () => ({
  title: 'ranwhat',
  summary:
    'ranwhat is a flight recorder for AI coding agents and a scanner for the authority they hold. Built and operated by Cenner, Zagreb.',
  path: '/ranwhat',
  body: blocks(
    t('A Cenner product'),
    'A flight recorder for AI agents, and a scanner for the authority they hold. ranwhat reads what coding agents such as Claude Code actually ran on your machine and surfaces the irreversible actions worth knowing about: credentials read, bulk deletions, force pushes, packages published.',
    link('ranwhat.com', RW),
    h2(t('Pricing')),
    ...PLANS.map((p) => blocks(h3(p.name), `**${p.price}**`, p.anchor && anchorLine(p.anchor), p.body)),
    `Full details on ${link('ranwhat.com/pricing', `${RW}/pricing`)}.`,
    h2(t('Billing, cancellation and refunds')),
    list([
      'Payments are processed by Stripe through its Link checkout; Stripe issues receipts and invoices and collects any VAT.',
      'Plus renews automatically each month or year and can be cancelled any time; it then runs to the end of the paid period.',
      'Full refund on request within 14 days of the first payment, no reason needed. Renewals after that are not refunded.',
    ]),
    `${link(t('Terms of service'), `${RW}/terms`)} · ${link(t('Privacy Policy'), `${RW}/privacy`)}`,
    h2(t('Who runs it')),
    list([
      COMPANY.legalName,
      `${companyAddress}, Croatia`,
      `OIB ${COMPANY.oib} · MB ${COMPANY.mb}`,
      'hello@ranwhat.com',
      COMPANY.phone,
    ]),
  ),
  related: [
    { text: 'ranwhat.com', href: RW },
    { text: t('About Cenner'), href: '/about' },
  ],
});
