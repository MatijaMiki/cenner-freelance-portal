/** /cjenik (Cenner's own price list) as markdown. Keep in step with pages/Cjenik.tsx. */
import { currentList, hrDate } from '../../cjenik.js';
import { baseLabel, formatPrice } from '../../../components/AnchorPrice';
import { blocks, day, h2, h3, link, list, mdLang, t, table, type PageModule } from '../format';

export const render: PageModule['render'] = () => {
  const current = currentList();
  const [date, time] = current.publishedAt.split('T');

  return {
    title: t('Price list'),
    summary:
      'Cjenik usluga koje naplaćuje Cenner (planovi, naknade, izrada web stranica, ranwhat, Stenvakt) s baznom cijenom uz svaku cijenu, te strojno čitljivi cjenik u .csv obliku.',
    path: '/cjenik',
    lastUpdated: day(current.publishedAt),
    body: blocks(
      'Cijene usluga koje naplaćuje Cenner i, uz svaku, njezina bazna cijena: cijena koja je vrijedila 10. 9. 2026. ili, za uslugu ponuđenu kasnije, cijena na dan kada je prvi put ponuđena (Zakon o zaštiti potrošača, čl. 7.; Pravilnik o isticanju bazne cijene proizvoda, NN 132/2026).',
      h2('Cijene'),
      `Cjenik na snazi od ${hrDate(date)} u ${time}.`,
      table(
        ['Usluga', 'Cijena', 'Bazna cijena'],
        current.items.map((it) => [
          it.name,
          formatPrice(it.price, it.unit, t) + (it.special ? ' (posebni oblik prodaje)' : ''),
          `${baseLabel(it.anchor.date, mdLang())}: ${formatPrice(it.anchor.price, it.unit, t)}`,
        ]),
      ),
      'Provizija se odbija od isplate freelanceru; naknadu za uslugu plaća kupac pri plaćanju. Cijene usluga koje nude freelanceri na Cenneru određuju sami freelanceri i nisu dio ovog cjenika.',
      h2('Strojno čitljiv cjenik'),
      'Cjenik je objavljen i u .csv obliku (UTF-8, stupci odvojeni znakom ";": naziv usluge; maloprodajna cijena i podatak o posebnom obliku prodaje, DA/NE; bazna cijena), u skladu s Pravilnikom o načinu objave cjenika proizvoda (NN 132/2026). Izmijenjeni cjenik objavljuje se na istoj adresi najkasnije do 11:00 na dan izmjene, a zamijenjeni cjenici ostaju dostupni u arhivi.',
      list([
        `Važeći cjenik, stalna adresa: ${link('/cjenik/cjenik.csv', '/cjenik/cjenik.csv')}`,
        `Ista datoteka pod propisanim nazivom: ${link(current.file, `/cjenik/${current.file}`)}`,
        `Arhiva ranijih cjenika: ${link('/cjenik/arhiva/', '/cjenik/arhiva/')}`,
      ]),
      'Trgovac: Cenner, obrt za računalno programiranje i ostale usluge, vl. Matija Mikulinec, Mikulinci 8, 10010 Zagreb, MB 99210363, OIB 23152585818.',
      current.archive.length > 0 &&
        blocks(h3('Raniji cjenici'), list(current.archive.map((name) => link(name, `/cjenik/arhiva/${encodeURIComponent(name)}`)))),
    ),
    related: [
      { text: t('Pricing'), href: '/subscription' },
      { text: t('Services'), href: '/services' },
    ],
  };
};
