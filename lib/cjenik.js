/**
 * Cenner's own price list (cjenik): the prices Cenner itself charges, each with its "bazna cijena"
 * (popularly: sidrena cijena), the price the law asks to be shown next to it.
 *
 * Why: Zakon o zaštiti potrošača čl. 7 (NN 19/22, 59/23, 59/26), Pravilnik o isticanju bazne
 * cijene proizvoda and Pravilnik o načinu objave cjenika proizvoda (both NN 132/2026, in force
 * since 17.11.2026; they replace the Odluke of NN 101/26 and their "dodatna cijena"). Every
 * service sold to consumers shows, in the same place as its price, the price it had on 10.9.2026
 * (or, for a service first offered later, the price it was first offered at), and the website
 * publishes the price list as a .csv, replaced by 11:00 on the day a price changes, with the
 * replaced lists kept public for 15+ days. Freelancers' listings are third-party offers on an
 * intermediary platform and are out of scope (čl. 4. st. 3.); the platform's own fees are in.
 *
 * THE DATA IS NOT HERE. It is generated into lib/cjenik.data.js, together with the published
 * files under public/cjenik/, by the updater on the Mac mini (~/sidrene-cijene/cjenik.py) from
 * ~/sidrene-cijene/prices.json, the single source of truth shared with stenvakt.com and
 * ranwhat.com. TO CHANGE A PRICE: edit prices.json there and run the updater (it also runs daily
 * at 10:00); never edit cjenik.data.js or public/cjenik/ by hand.
 *
 * Plain JS so the build scripts and the app read the same data.
 */
import data from './cjenik.data.js';

/**
 * @typedef {'month' | 'year' | 'percent' | 'from'} Unit
 *   month/year: EUR per month/year; percent: % of the order amount; from: EUR, starting price
 * @typedef {{ id: string, name: string, nameEn: string, price: number, unit: Unit, special: boolean,
 *   anchor: { price: number, date: string } }} PriceItem
 *   special: sold under a "posebni oblik prodaje" (akcija, popust); anchor: the bazna cijena and its date
 * @typedef {{ file: string, no: number, publishedAt: string, archive: string[], items: PriceItem[] }} PriceList
 *   file: the published .csv under /cjenik/; archive: replaced files under /cjenik/arhiva/, newest first
 */

/** @type {PriceList} */
const list = /** @type {any} */ (data);

/** The price list in force. */
export const currentList = () => list;

/** One item of the price list in force; throws on an unknown id so a typo fails the build. */
export function priceItem(/** @type {string} */ id) {
  const item = list.items.find(i => i.id === id);
  if (!item) throw new Error(`cjenik: no price "${id}"`);
  return item;
}

/** "2026-09-10" -> "10. 9. 2026." */
export function hrDate(/** @type {string} */ iso) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d}. ${m}. ${y}.`;
}
