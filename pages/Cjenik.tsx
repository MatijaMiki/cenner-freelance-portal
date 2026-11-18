import React from 'react';
import { FileText } from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../i18n';
import { currentList, hrDate } from '../lib/cjenik.js';
import { baseLabel, formatPrice } from '../components/AnchorPrice';

/** "2026-11-18T10:00" -> "18. 11. 2026. u 10:00" / "18. 11. 2026. at 10:00" */
const when = (iso: string, lang: string) => {
  const [date, time] = iso.split('T');
  return `${hrDate(date)} ${lang === 'HR' ? 'u' : 'at'} ${time}`;
};

/**
 * The public price list: Cenner's own prices with their bazna cijena, and the machine-readable
 * files the Pravilnik o načinu objave cjenika proizvoda (NN 132/2026) asks for (lib/cjenik.js
 * says where they come from).
 */
const Cjenik: React.FC = () => {
  const { lang, t } = useLanguage();
  const tx = (hr: string, en: string) => (lang === 'HR' ? hr : en);
  const list = currentList();
  const h2 = 'mb-5 border-t-2 border-ink pt-5 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink';
  const link = 'text-sky underline underline-offset-4 hover:text-ink break-all';

  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-24 pt-10 font-text md:px-8 md:pt-16">
      <SEO
        title="Cjenik"
        canonical="/cjenik"
        description="Cjenik usluga koje naplaćuje Cenner (planovi, naknade, izrada web stranica, ranwhat, Stenvakt) s baznom cijenom uz svaku cijenu, te strojno čitljivi cjenik u .csv obliku."
      />
      <div className="mb-14">
        <div className="mb-6 flex h-14 w-14 items-center justify-center border-2 border-ink bg-white text-ink">
          <FileText size={32} />
        </div>
        <h1 className="mb-6 font-display text-[clamp(2.5rem,7vw,6rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.035em] text-ink">{t('Price list')}</h1>
        <p className="max-w-[60ch] text-[1.0625rem] text-slate">
          {tx(
            'Cijene usluga koje naplaćuje Cenner i, uz svaku, njezina bazna cijena: cijena koja je vrijedila 10. 9. 2026. ili, za uslugu ponuđenu kasnije, cijena na dan kada je prvi put ponuđena (Zakon o zaštiti potrošača, čl. 7.; Pravilnik o isticanju bazne cijene proizvoda, NN 132/2026).',
            'The prices of the services Cenner itself charges, each with its base price (bazna cijena): the price that applied on 10 September 2026 or, for a service first offered later, the price on the day it was first offered (Croatian Consumer Protection Act, Art. 7; Ordinance on displaying the base price of products, NN 132/2026).',
          )}
        </p>
      </div>

      <div className="max-w-[60rem] space-y-12 text-[1.0625rem] leading-[1.7] text-ink/90">
        <section>
          <h2 className={h2}>{tx('Cijene', 'Prices')}</h2>
          <p className="mb-5 text-[0.95rem] text-slate">{tx('Cjenik na snazi od', 'In force since')} {when(list.publishedAt, lang)}.</p>
          <div className="overflow-x-auto border-2 border-ink bg-white">
            <table className="w-full min-w-[34rem] text-left text-[0.95rem]">
              <thead className="border-b-2 border-ink font-display text-[12px] font-extrabold uppercase tracking-[0.12em]">
                <tr>
                  <th className="px-4 py-3">{tx('Usluga', 'Service')}</th>
                  <th className="px-4 py-3">{tx('Cijena', 'Price')}</th>
                  <th className="px-4 py-3">{tx('Bazna cijena', 'Base price')}</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map(it => (
                  <tr key={it.id} className="border-b border-ink/15 last:border-0">
                    <td className="px-4 py-3">{lang === 'HR' ? it.name : it.nameEn}</td>
                    <td className="px-4 py-3 font-bold text-ink">{formatPrice(it.price, it.unit, t, lang)}{it.special && ` (${tx('posebni oblik prodaje', 'special offer')})`}</td>
                    <td className="px-4 py-3">{baseLabel(it.anchor.date, lang)}: {formatPrice(it.anchor.price, it.unit, t, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-[0.95rem] text-slate">
            {tx(
              'Provizija se odbija od isplate freelanceru; naknadu za uslugu plaća kupac pri plaćanju. Cijene usluga koje nude freelanceri na Cenneru određuju sami freelanceri i nisu dio ovog cjenika.',
              'The commission is deducted from the freelancer’s payout; the service fee is paid by the buyer at checkout. The prices of services offered by freelancers on Cenner are set by the freelancers and are not part of this price list.',
            )}
          </p>
        </section>

        <section>
          <h2 className={h2}>{tx('Strojno čitljiv cjenik', 'Machine-readable price list')}</h2>
          <p className="mb-4">
            {tx('Cjenik je objavljen i u .csv obliku (UTF-8, stupci odvojeni znakom ";": naziv usluge; maloprodajna cijena i podatak o posebnom obliku prodaje, DA/NE; bazna cijena), u skladu s Pravilnikom o načinu objave cjenika proizvoda (NN 132/2026). Izmijenjeni cjenik objavljuje se na istoj adresi najkasnije do 11:00 na dan izmjene, a zamijenjeni cjenici ostaju dostupni u arhivi.',
              'The price list is also published as .csv (UTF-8, columns separated by ";": service name; retail price and whether it is a special-offer price, DA/NE; base price), as the Croatian Ordinance on publishing price lists (NN 132/2026) requires. A changed list is published at the same address by 11:00 on the day of the change, and replaced lists stay available in the archive.')}
          </p>
          <ul className="space-y-2">
            <li>
              {tx('Važeći cjenik, stalna adresa', 'The list in force, at a fixed address')}: <a href="/cjenik/cjenik.csv" className={link} download>/cjenik/cjenik.csv</a>
            </li>
            <li>{tx('Ista datoteka pod propisanim nazivom', 'The same file under its prescribed name')}: <a href={`/cjenik/${list.file}`} className={link} download>{list.file}</a></li>
            <li>{tx('Arhiva ranijih cjenika', 'Archive of earlier lists')}: <a href="/cjenik/arhiva/" className={link}>/cjenik/arhiva/</a></li>
          </ul>
          <p className="mt-5 text-[0.95rem] text-slate">Trgovac: Cenner, obrt za računalno programiranje i ostale usluge, vl. Matija Mikulinec, Mikulinci 8, 10010 Zagreb, MB 99210363, OIB 23152585818.</p>
          {list.archive.length > 0 && (
            <>
              <h3 className="mb-3 mt-8 font-display text-[1.25rem] font-extrabold text-ink">{tx('Raniji cjenici', 'Earlier price lists')}</h3>
              <ul className="space-y-2">
                {list.archive.map(name => (
                  <li key={name}><a href={`/cjenik/arhiva/${encodeURIComponent(name)}`} className={link} download>{name}</a></li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Cjenik;
