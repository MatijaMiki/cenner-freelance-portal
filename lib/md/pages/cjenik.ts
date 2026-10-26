/** /cjenik (Cenner's own price list) as markdown. Keep in step with pages/Cjenik.tsx. */
import { PRICE_LISTS, currentList, fileName, hrDate } from '../../cjenik.js';
import { anchorDate, formatPrice } from '../../../components/AnchorPrice';
import { blocks, day, h2, h3, link, list, t, table, type PageModule } from '../format';

const fileHref = (l: (typeof PRICE_LISTS)[number]) => `/cjenik/${encodeURIComponent(fileName(l))}`;

export const render: PageModule['render'] = () => {
  const current = currentList();
  const archive = PRICE_LISTS.slice(0, -1).reverse();
  const [date, time] = current.publishedAt.split('T');

  return {
    title: t('Price list'),
    summary:
      'Cjenik usluga koje naplaćuje Cenner (planovi, naknade, izrada web stranica, ranwhat) s cijenom na referentni datum, te strojno čitljivi cjenik u .csv obliku.',
    path: '/cjenik',
    lastUpdated: day(current.publishedAt),
    body: blocks(
      'Cijene usluga koje naplaćuje Cenner, i uz svaku cijenu ona koja je vrijedila na referentni datum (dodatna cijena, prema Odluci o isticanju dodatne cijene, NN 101/26).',
      h2('Cijene'),
      `Cjenik na snazi od ${hrDate(date)} u ${time}.`,
      table(
        ['Usluga', 'Cijena', 'Dodatna cijena'],
        current.items.map((it) => [
          it.name,
          formatPrice(it.price, it.unit, t),
          `${t('Price on')} ${anchorDate(it.anchor.date, 'HR')}: ${formatPrice(it.anchor.price, it.unit, t)}`,
        ]),
      ),
      'Provizija se odbija od isplate freelanceru; naknadu za uslugu plaća kupac pri plaćanju. Cijene usluga koje nude freelanceri na Cenneru određuju sami freelanceri i nisu dio ovog cjenika.',
      h2('Strojno čitljiv cjenik'),
      'Cjenik je objavljen i u .csv obliku (UTF-8, odvojeno znakom ";"), u skladu s Odlukom o objavi cjenika proizvoda i usluga (NN 101/26). Novi se cjenik objavljuje pri svakoj promjeni cijene.',
      list([link(fileName(current), fileHref(current)), `Uvijek aktualni cjenik: ${link('cjenik.csv', '/cjenik/cjenik.csv')}`]),
      archive.length > 0 && blocks(h3('Raniji cjenici'), list(archive.map((l) => link(fileName(l), fileHref(l))))),
    ),
    related: [
      { text: t('Pricing'), href: '/subscription' },
      { text: t('Services'), href: '/services' },
    ],
  };
};
