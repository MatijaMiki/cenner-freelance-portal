/**
 * Cenner's own price list (cjenik): the one place the prices Cenner itself charges live, with the
 * "dodatna cijena" (the so-called sidrena cijena) the law asks to be shown next to each of them.
 *
 * Why: Odluka o isticanju dodatne cijene kao mjera izravne kontrole cijena and Odluka o objavi
 * cjenika proizvoda i usluga kao mjera izravne kontrole cijena (NN 101/26, applying from
 * 17.11.2026 per NN 110/26). Every service sold to consumers shows, next to its price and in the
 * same place, the price it had on 10.9.2026 (or, for a service first offered later, the price it
 * was first offered at, with that date), and every website publishes the price list as .csv/.xml,
 * updated by 08:00 on the day a price changes, with superseded lists kept public for 30+ days.
 * Freelancers' listings are third-party offers on an intermediary platform and are out of scope;
 * the platform's own fees (the buyer service fee, the commission) are in.
 *
 * Plain JS so the build script (scripts/generate-cjenik.mjs) and the app read the same data.
 *
 * TO CHANGE A PRICE: do not edit an existing version. Copy the last entry of PRICE_LISTS, give it
 * the next `no` and the date and time it takes effect (`publishedAt`, deploy before 08:00 that
 * day), change `price` (keep `anchor` as it is: the reference price does not move with the
 * price). A new service gets `anchor` = its first price and the date it is first offered. The old
 * versions stay in the list so their files stay published (the 30-day archive).
 */

/** The reference date for every Cenner service that existed on it. */
export const ANCHOR_DATE = '2026-09-10';

/** Who and where, for the file name the ministry prescribes. Cenner sells only online. */
export const OUTLET = { type: 'webshop', address: 'Mikulinci 8 Zagreb', code: '01' };

/**
 * @typedef {'month' | 'year' | 'percent' | 'from' | 'from-month' | 'fixed'} Unit
 *   month/year: EUR per month/year; percent: % of the order amount; from: EUR, starting price;
 *   from-month: EUR per month, starting price; fixed: EUR, one fixed price
 * @typedef {{ id: string, name: string, nameEn: string, price: number, unit: Unit,
 *   anchor: { price: number, date: string } }} PriceItem
 * @typedef {{ no: number, publishedAt: string, items: PriceItem[] }} PriceList
 */

/** @returns {{ price: number, date: string }} */
const A = (/** @type {number} */ price, date = ANCHOR_DATE) => ({ price, date });

/** Version 1 (23.10.2026.), repeated unchanged in later versions: same prices, same anchors. */
/** @type {PriceItem[]} */
const PRICE_LISTS_V1_ITEMS = [
  { id: 'plan-free', name: 'Cenner Free plan', nameEn: 'Cenner Free plan', price: 0, unit: 'month', anchor: A(0) },
  { id: 'plan-pro', name: 'Cenner Pro plan', nameEn: 'Cenner Pro plan', price: 19, unit: 'month', anchor: A(19) },
  { id: 'plan-ultra', name: 'Cenner Ultra plan', nameEn: 'Cenner Ultra plan', price: 59, unit: 'month', anchor: A(59) },
  { id: 'plan-enterprise', name: 'Cenner Enterprise plan', nameEn: 'Cenner Enterprise plan', price: 99, unit: 'month', anchor: A(99) },
  { id: 'commission-free', name: 'Provizija platforme, Free plan', nameEn: 'Platform commission, Free plan', price: 15, unit: 'percent', anchor: A(15) },
  { id: 'commission-pro', name: 'Provizija platforme, Pro plan', nameEn: 'Platform commission, Pro plan', price: 10, unit: 'percent', anchor: A(10) },
  { id: 'commission-ultra', name: 'Provizija platforme, Ultra plan', nameEn: 'Platform commission, Ultra plan', price: 5, unit: 'percent', anchor: A(5) },
  { id: 'commission-enterprise', name: 'Provizija platforme, Enterprise plan', nameEn: 'Platform commission, Enterprise plan', price: 0, unit: 'percent', anchor: A(0) },
  { id: 'buyer-fee', name: 'Naknada za uslugu (kupac)', nameEn: 'Service fee (buyer)', price: 5, unit: 'percent', anchor: A(5) },
  { id: 'buyer-fee-enterprise', name: 'Naknada za uslugu (kupac), prodavač na Enterprise planu', nameEn: 'Service fee (buyer), seller on the Enterprise plan', price: 0, unit: 'percent', anchor: A(0) },
  // The studio's starting prices were first published on 18.10.2026 (the /services redesign).
  { id: 'studio-web-stranice', name: 'Izrada web stranice', nameEn: 'Website', price: 800, unit: 'from', anchor: A(800, '2026-10-18') },
  { id: 'studio-wordpress', name: 'Izrada WordPress stranice', nameEn: 'WordPress site', price: 500, unit: 'from', anchor: A(500, '2026-10-18') },
  { id: 'studio-dizajn', name: 'Grafički dizajn', nameEn: 'Graphic design', price: 300, unit: 'from', anchor: A(300, '2026-10-18') },
  // ranwhat Plus went on sale on ranwhat.com on 4.10.2026 (ranwhat d351bdb); ranwhat.com's
  // own price list (site/cjenik/ there) carries the same date.
  { id: 'ranwhat-plus-month', name: 'ranwhat Plus, mjesečna pretplata', nameEn: 'ranwhat Plus, monthly', price: 12, unit: 'month', anchor: A(12, '2026-10-04') },
  { id: 'ranwhat-plus-year', name: 'ranwhat Plus, godišnja pretplata', nameEn: 'ranwhat Plus, yearly', price: 120, unit: 'year', anchor: A(120, '2026-10-04') },
];

/** The day the version 2 services are first offered (their anchor date). See the TODO in version 2. */
const GO_LIVE = '2026-11-19';

/** @type {PriceList[]} oldest first; the last one is the price list in force */
export const PRICE_LISTS = [
  {
    no: 1,
    publishedAt: '2026-10-23T08:00',
    items: PRICE_LISTS_V1_ITEMS,
  },
  {
    // The /services refresh (approved by the owner on 18.11.2026). New studio services are first
    // offered with this list, so their anchor is their own price on GO_LIVE. Websites (the same
    // service, now from €750) keeps its 18.10.2026 anchor of €800: a lower price never moves the
    // reference price. Version 1's other items are repeated unchanged.
    // TODO(owner): set GO_LIVE above to the real go-live date (the day this deploys, published by
    // 08:00) before merging.
    no: 2,
    publishedAt: `${GO_LIVE}T08:00`,
    items: [
      ...PRICE_LISTS_V1_ITEMS.map(it => (it.id === 'studio-web-stranice' ? { ...it, name: 'Izrada jednostavne web stranice', nameEn: 'Simple website', price: 750 } : it)),
      { id: 'studio-web-aplikacija', name: 'Izrada web stranice ili web aplikacije (više stranica, dokumentacija, obrasci)', nameEn: 'Website or web app (multi-page, docs, forms)', price: 1200, unit: 'from', anchor: A(1200, GO_LIVE) },
      { id: 'studio-web-dizajn', name: 'Izrada web stranice s dizajnom po mjeri', nameEn: 'Custom-designed website', price: 2000, unit: 'from', anchor: A(2000, GO_LIVE) },
      { id: 'studio-woocommerce', name: 'Izrada WooCommerce web trgovine', nameEn: 'WooCommerce online shop', price: 900, unit: 'from', anchor: A(900, GO_LIVE) },
      { id: 'studio-odrzavanje', name: 'Održavanje web stranice', nameEn: 'Website maintenance', price: 50, unit: 'from-month', anchor: A(50, GO_LIVE) },
      { id: 'studio-seo-provjera', name: 'Provjera SEO-a i vidljivosti u AI alatima (jednokratno)', nameEn: 'SEO and AI-visibility check (one-off)', price: 250, unit: 'fixed', anchor: A(250, GO_LIVE) },
      { id: 'studio-saas', name: 'Izrada SaaS ili CRM sustava, cijeli paket', nameEn: 'SaaS or CRM, full build', price: 5000, unit: 'from', anchor: A(5000, GO_LIVE) },
      { id: 'studio-aplikacije', name: 'Izrada mobilne ili desktop aplikacije, po platformi (iOS, Android, Mac, Windows, Linux)', nameEn: 'Mobile or desktop app, per platform (iOS, Android, Mac, Windows, Linux)', price: 10000, unit: 'from', anchor: A(10000, GO_LIVE) },
    ],
  },
];

/** The price list in force. */
export const currentList = () => PRICE_LISTS[PRICE_LISTS.length - 1];

/** One item of the price list in force; throws on an unknown id so a typo fails the build. */
export function priceItem(/** @type {string} */ id) {
  const item = currentList().items.find(i => i.id === id);
  if (!item) throw new Error(`cjenik: no price "${id}"`);
  return item;
}

/** "2026-09-10" -> "10.9.2026." (the date as the ministry's example writes it) */
export function hrDate(/** @type {string} */ iso) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d}.${m}.${y}.`;
}

/** 19 -> "19,00" */
const hrNumber = (/** @type {number} */ n) => n.toFixed(2).replace('.', ',');

/** The ministry's file name: oblik objekta_adresa_oznaka_broj pohrane_datum i vrijeme slanja. */
export function fileName(/** @type {PriceList} */ list) {
  const [date, time] = list.publishedAt.split('T');
  const [y, m, d] = date.split('-');
  // the ministry's example writes the time as 07:45; ":" is not safe in a URL path or on every
  // file system, so the time is written 07-45
  return `${OUTLET.type}_${OUTLET.address}_${OUTLET.code}_${String(list.no).padStart(3, '0')}_${d}.${m}.${y}_${time.replace(':', '-')}.csv`;
}

const UNIT_HR = { month: 'EUR mjesečno', year: 'EUR godišnje', percent: '% iznosa narudžbe', from: 'EUR, početna cijena', 'from-month': 'EUR mjesečno, početna cijena', fixed: 'EUR' };

/** The price list as the .csv the Odluka asks for: one row per service, ";"-separated, UTF-8. */
export function toCsv(/** @type {PriceList} */ list) {
  const header = ['naziv_usluge', 'maloprodajna_cijena', 'jedinica', 'posebni_oblik_prodaje', 'naziv_posebnog_oblika_prodaje', 'dodatna_cijena', 'datum_dodatne_cijene'];
  const cell = (/** @type {string} */ v) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const rows = list.items.map(i => [i.name, hrNumber(i.price), UNIT_HR[i.unit], 'NE', '', hrNumber(i.anchor.price), hrDate(i.anchor.date)]);
  return [header, ...rows].map(r => r.map(cell).join(';')).join('\r\n') + '\r\n';
}
