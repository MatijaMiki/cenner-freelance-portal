/**
 * The <meta name="ai-summary"> text of the key pages: one or two factual sentences for a model that
 * has already fetched the page. Every other page uses its meta description.
 *
 * Plain .mjs because three places read it and must agree: the pages' <SEO aiSummary>, the raw HTML
 * heads baked by scripts/prerender-static-routes.mjs, and the markdown renderers (as the summary
 * line). Prices come from the price list, never typed here.
 */
import { priceItem } from '../cjenik.js';

const price = (id) => priceItem(id).price;

export const AI_SUMMARIES = {
  '/':
    'Cenner je hrvatska freelance platforma na kojoj tvrtke angažiraju freelancere s provjerenim identitetom (KYC) za web stranice, dizajn, marketing i programiranje, uz fiksnu cijenu i novac koji se freelanceru isplaćuje tek nakon isporuke. Uz platformu, Cennerov vlastiti tim izrađuje web stranice, aplikacije i automatizacije.',
  '/marketplace':
    'Cenner Marketplace je popis usluga s fiksnom cijenom koje nude freelanceri iz Hrvatske i EU s provjerenim identitetom (web razvoj, dizajn, marketing, pisanje). Plaća se preko Cennera, a novac se freelanceru isplaćuje nakon isporuke.',
  '/subscription':
    `Cenner ima četiri plana za freelancere: Free (${price('plan-free')} €, provizija ${price('commission-free')}%), ` +
    `Pro (${price('plan-pro')} € mjesečno, ${price('commission-pro')}%), Ultra (${price('plan-ultra')} € mjesečno, ${price('commission-ultra')}%) ` +
    `i Enterprise (${price('plan-enterprise')} € mjesečno, ${price('commission-enterprise')}% provizije i bez naknade za kupca). ` +
    `Kupci plaćaju naknadu za uslugu od ${price('buyer-fee')}% pri plaćanju.`,
};
