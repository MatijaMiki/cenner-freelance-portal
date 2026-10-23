import React from 'react';
import { FileText } from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../i18n';
import { PRICE_LISTS, currentList, fileName, hrDate } from '../lib/cjenik.js';
import { anchorDate, formatPrice } from '../components/AnchorPrice';

/** "2026-10-23T08:00" -> "23.10.2026. u 08:00" / "23.10.2026 at 08:00" */
const when = (iso: string, lang: string) => {
  const [date, time] = iso.split('T');
  return lang === 'HR' ? `${hrDate(date)} u ${time}` : `${hrDate(date).slice(0, -1)} at ${time}`;
};

const fileHref = (list: (typeof PRICE_LISTS)[number]) => `/cjenik/${encodeURIComponent(fileName(list))}`;

/**
 * The public price list: Cenner's own prices with their dodatna cijena, and the machine-readable
 * files the Odluka o objavi cjenika (NN 101/26) asks for (written by scripts/generate-cjenik.mjs).
 */
const Cjenik: React.FC = () => {
  const { lang, t } = useLanguage();
  const tx = (hr: string, en: string) => (lang === 'HR' ? hr : en);
  const list = currentList();
  const archive = PRICE_LISTS.slice(0, -1).reverse();
  const h2 = 'mb-5 border-t-2 border-ink pt-5 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink';
  const link = 'text-sky underline underline-offset-4 hover:text-ink break-all';

  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-24 pt-10 font-text md:px-8 md:pt-16">
      <SEO
        title="Cjenik"
        canonical="/cjenik"
        description="Cjenik usluga koje naplaćuje Cenner (planovi, naknade, izrada web stranica, ranwhat) s cijenom na referentni datum, te strojno čitljivi cjenik u .csv obliku."
      />
      <div className="mb-14">
        <div className="mb-6 flex h-14 w-14 items-center justify-center border-2 border-ink bg-white text-ink">
          <FileText size={32} />
        </div>
        <h1 className="mb-6 font-display text-[clamp(2.5rem,7vw,6rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.035em] text-ink">{t('Price list')}</h1>
        <p className="max-w-[60ch] text-[1.0625rem] text-slate">
          {tx(
            'Cijene usluga koje naplaćuje Cenner, i uz svaku cijenu ona koja je vrijedila na referentni datum (dodatna cijena, prema Odluci o isticanju dodatne cijene, NN 101/26).',
            'The prices of the services Cenner itself charges, each with the price that applied on the reference date (the additional price required by the Croatian Decision on displaying an additional price, NN 101/26).',
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
                  <th className="px-4 py-3">{tx('Dodatna cijena', 'Additional price')}</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map(it => (
                  <tr key={it.id} className="border-b border-ink/15 last:border-0">
                    <td className="px-4 py-3">{lang === 'HR' ? it.name : it.nameEn}</td>
                    <td className="px-4 py-3 font-bold text-ink">{formatPrice(it.price, it.unit, t)}</td>
                    <td className="px-4 py-3">{t('Price on')} {anchorDate(it.anchor.date, lang)}: {formatPrice(it.anchor.price, it.unit, t)}</td>
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
            {tx('Cjenik je objavljen i u .csv obliku (UTF-8, odvojeno znakom ";"), u skladu s Odlukom o objavi cjenika proizvoda i usluga (NN 101/26). Novi se cjenik objavljuje pri svakoj promjeni cijene.',
              'The price list is also published as .csv (UTF-8, ";"-separated), as the Croatian Decision on publishing price lists (NN 101/26) requires. A new file is published whenever a price changes.')}
          </p>
          <ul className="space-y-2">
            <li><a href={fileHref(list)} className={link} download>{fileName(list)}</a></li>
            <li>
              {tx('Uvijek aktualni cjenik', 'Always the current list')}: <a href="/cjenik/cjenik.csv" className={link} download>cjenik.csv</a>
            </li>
          </ul>
          {archive.length > 0 && (
            <>
              <h3 className="mb-3 mt-8 font-display text-[1.25rem] font-extrabold text-ink">{tx('Raniji cjenici', 'Earlier price lists')}</h3>
              <ul className="space-y-2">
                {archive.map(l => (
                  <li key={l.no}><a href={fileHref(l)} className={link} download>{fileName(l)}</a></li>
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
