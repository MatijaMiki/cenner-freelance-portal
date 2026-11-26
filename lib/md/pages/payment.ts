/** /sigurno-placanje (and /en/sigurno-placanje) as markdown. Same words as pages/SafePayment.tsx: both read content/payment.mjs. */
import { blocks, h2, list, mdLang, type PageModule } from '../format';
import { PAYMENT_PATH, paymentPage } from '../../../content/payment.mjs';

export const render: PageModule['render'] = () => {
  const lang = mdLang();
  const page = paymentPage(lang);
  return {
    title: page.title,
    summary: page.metaDescription,
    path: PAYMENT_PATH,
    body: blocks(page.lead, ...page.sections.map((s) => blocks(h2(s.heading), list(s.items)))),
    related: [
      { text: lang === 'EN' ? 'Terms of Use' : 'Uvjeti korištenja', href: '/terms' },
      { text: 'Marketplace', href: '/marketplace' },
      { text: lang === 'EN' ? 'Pricing' : 'Cijene', href: '/subscription' },
    ],
  };
};
