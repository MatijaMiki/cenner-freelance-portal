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

/** English versions for the /en pages' markdown (lib/md/index.ts). Same facts as AI_SUMMARIES. */
export const AI_SUMMARIES_EN = {
  '/':
    'Cenner is a Croatian freelance platform where businesses hire identity-verified (KYC) freelancers for websites, design, marketing and development, at a fixed price, with the money paid to the freelancer only after delivery. Alongside the platform, Cenner\'s own team builds websites, apps and automations.',
  '/marketplace':
    'Cenner Marketplace lists fixed-price services from identity-verified freelancers in Croatia and the EU (web development, design, marketing, writing). Payment goes through Cenner and is released to the freelancer after delivery.',
  '/subscription':
    `Cenner has four plans for freelancers: Free (${price('plan-free')} €, ${price('commission-free')}% commission), ` +
    `Pro (${price('plan-pro')} € a month, ${price('commission-pro')}%), Ultra (${price('plan-ultra')} € a month, ${price('commission-ultra')}%) ` +
    `and Enterprise (${price('plan-enterprise')} € a month, ${price('commission-enterprise')}% commission and no buyer fee). ` +
    `Buyers pay a ${price('buyer-fee')}% service fee at checkout.`,
  '/services':
    'Cenner builds websites and WooCommerce shops, SaaS and CRM systems, mobile and desktop apps, AI integrations, ads and SEO, and sets up servers. Fixed price, direct communication.',
  '/about':
    'Cenner is a Croatian freelance platform and an in-house studio for websites, apps and AI integrations. Contact details, address and company information.',
};
