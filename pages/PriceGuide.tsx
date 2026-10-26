import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Printer } from 'lucide-react';
import SEO from '../components/SEO';
import AnchorPrice from '../components/AnchorPrice';
import { priceItem } from '../lib/cjenik.js';

// Every number here is already published on the site: the ranges come from
// scripts/generate-landing-pages.mjs (/usluge/izrada-web-stranica, /usluge/wordpress-izrada,
// /usluge/web-developeri), the questions and the checklist from content/blog/posts.mjs. Change them
// there first, then here. The Cenner tim prices are read from the price list (lib/cjenik.js).
const RANGES: { type: string; what: string; price: string }[] = [
  { type: 'Prezentacijska stranica', what: 'Landing stranica ili stranica obrta: 5 do 8 podstranica, kontakt, osnovni SEO', price: '300 € – 800 €' },
  { type: 'WordPress s gotovom temom', what: 'Gotova tema s osnovnom prilagodbom, sam mijenjaš tekstove', price: '250 € – 700 €' },
  { type: 'Korporativna stranica s CMS-om', what: 'Više podstranica, sustav za uređivanje sadržaja, dizajn po mjeri', price: '800 € – 2.500 €' },
  { type: 'WooCommerce web shop', what: 'Katalog, košarica, plaćanje i dostava na WordPressu', price: 'od 1.200 €' },
  { type: 'Web shop ili aplikacija po mjeri', what: 'Rezervacije, korisnički računi, integracije, više jezika', price: '2.000 € – 10.000 €+' },
];

const COSTS = [
  'Broj podstranica i tko piše tekstove.',
  'Posebne funkcije: rezervacije, online plaćanje, više jezika.',
  'Dizajn po mjeri ili gotova tema.',
  'Je li u ponudi hosting, održavanje i obuka za uređivanje.',
];

const QUESTIONS = [
  'Možeš li mi pokazati tri slična projekta koja su živa?',
  'Koju tehnologiju predlažeš i zašto baš nju?',
  'Što točno ulazi u ponudu? (broj stranica, funkcije, revizije, unos sadržaja, SEO osnova, obuka)',
  'Što ne ulazi?',
  'Kakav je raspored i kada vidim prve rezultate?',
  'Kako se plaća? Po fazama ili kroz zaštićeno plaćanje.',
  'Kome pripadaju domena, hosting, kod i pristupi? Odgovor mora biti: tebi.',
  'Kako izgleda održavanje nakon objave i koliko košta?',
  'Kako ćemo komunicirati i tko odgovara kad je hitno?',
  'Kako ćeš znati da je stranica brza? (konkretna mjerenja, npr. Core Web Vitals)',
];

const RED_FLAGS = [
  'Ponuda bez opisa opsega, samo s jednim iznosom.',
  'Traženje cijelog iznosa unaprijed.',
  'Odbijanje da domena ili pristupi budu na tvoje ime.',
  'Portfolio od kojeg se ništa ne može otvoriti.',
  'Obećanje "prvog mjesta na Googleu" kao dijela izrade stranice.',
];

const CHECKLIST = [
  'Znam što stranica treba postići i imam sadržaj (tekstovi, fotografije, logo).',
  'Domena je (ili će biti) na moje ime.',
  'Opseg, broj revizija i rok su u pisanom obliku.',
  'Ponude uspoređujem po opsegu, ne samo po cijeni.',
  'Plaćanje je po fazama ili zaštićeno.',
  'Nakon objave znam tko održava stranicu i koliko to košta.',
];

/**
 * The guide the email popup (components/GuidePopup.tsx) hands out. It is a normal page anyone with
 * the link can open, kept out of search (noIndex, no sitemap entry) so the popup is the way in.
 * Printable: "Spremi kao PDF" prints it without the site chrome.
 */
const PriceGuide: React.FC = () => {
  const h2 = 'mb-5 border-t-2 border-ink pt-5 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink';
  const box = 'border-2 border-ink bg-white p-5 md:p-6';

  return (
    <div className="guide-print mx-auto max-w-[1500px] px-4 pb-24 pt-10 font-text md:px-8 md:pt-16">
      <SEO
        title="Vodič: koliko košta izrada web stranice"
        canonical="/vodic/cijena-web-stranice"
        description="Okvirne cijene izrade web stranica u Hrvatskoj, o čemu ovisi cijena, 10 pitanja za developera i popis za provjeru prije narudžbe."
        noIndex
      />
      <style>{`@media print {
        nav, footer, .guide-no-print, button[aria-label="Chat"] { display: none !important; }
        .guide-print { padding-top: 0 !important; }
        .guide-print section { break-inside: avoid; }
      }`}</style>

      <div className="mb-14">
        <p className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-[0.14em] text-sky">Vodič · 2026</p>
        <h1 className="mb-6 font-display text-[clamp(2.5rem,7vw,6rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.035em] text-ink">
          Koliko košta web stranica
        </h1>
        <p className="max-w-[60ch] text-[1.0625rem] text-slate">
          Okvirne cijene po vrsti projekta, o čemu cijena ovisi, pitanja koja trebaš postaviti developeru i popis za provjeru prije nego što nekome platiš. Na jednoj stranici, spremno za ispis.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="guide-no-print mt-8 inline-flex items-center gap-2 border-2 border-ink bg-white px-5 py-3 font-display text-[15px] font-bold text-ink transition-colors hover:bg-ink hover:text-white"
        >
          <Printer size={16} /> Spremi kao PDF
        </button>
      </div>

      <div className="max-w-[60rem] space-y-14 text-[1.0625rem] leading-[1.7] text-ink/90">
        <section>
          <h2 className={h2}>1. Okvirne cijene u Hrvatskoj</h2>
          <div className="overflow-x-auto border-2 border-ink bg-white">
            <table className="w-full min-w-[34rem] text-left text-[0.95rem]">
              <thead className="border-b-2 border-ink font-display text-[12px] font-extrabold uppercase tracking-[0.12em]">
                <tr>
                  <th className="px-4 py-3">Vrsta projekta</th>
                  <th className="px-4 py-3">Što obično uključuje</th>
                  <th className="whitespace-nowrap px-4 py-3">Okvirna cijena</th>
                </tr>
              </thead>
              <tbody>
                {RANGES.map((r) => (
                  <tr key={r.type} className="border-t border-ink/15 align-top">
                    <td className="px-4 py-3 font-bold text-ink">{r.type}</td>
                    <td className="px-4 py-3">{r.what}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-display font-bold text-ink">{r.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[0.95rem] text-slate">
            Satnica iskusnog web developera u Hrvatskoj kreće se od 25 € do 70 € po satu, ovisno o tehnologiji i seniornosti. Prezentacijska stranica obično je gotova za 1 do 3 tjedna.
          </p>
        </section>

        <section>
          <h2 className={h2}>2. O čemu ovisi cijena</h2>
          <ul className="list-disc space-y-2 pl-6">
            {COSTS.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <p className="mt-4">
            Kad uspoređuješ ponude, nemoj gledati samo ukupan iznos. Usporedi <strong>što je točno uključeno</strong>: broj revizija dizajna, unos sadržaja, SEO postavku, obuku za uređivanje i rok. Jeftinija ponuda bez unosa sadržaja ili mobilne verzije dizajna na kraju često ispadne skuplja.
          </p>
        </section>

        <section>
          <h2 className={h2}>3. Deset pitanja za web developera</h2>
          <ol className="list-decimal space-y-2 pl-6">
            {QUESTIONS.map((q) => <li key={q}>{q}</li>)}
          </ol>
        </section>

        <section>
          <h2 className={h2}>4. Znakovi za uzbunu</h2>
          <ul className="list-disc space-y-2 pl-6">
            {RED_FLAGS.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </section>

        <section>
          <h2 className={h2}>5. Popis prije nego što platiš</h2>
          <ul className="space-y-3">
            {CHECKLIST.map((c) => (
              <li key={c} className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-1.5 h-4 w-4 shrink-0 border-2 border-ink bg-white" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={box}>
          <h2 className="mb-3 font-display text-[1.375rem] font-extrabold tracking-[-0.02em] text-ink">Kako ti Cenner može pomoći</h2>
          <p className="mb-3">
            <strong>Marketplace:</strong> pregledaj gotove pakete web developera s fiksnom cijenom i rokom ili objavi projekt i usporedi ponude. Freelanceri prolaze KYC provjeru identiteta, a novac se drži dok posao nije isporučen.
          </p>
          <p className="mb-2">
            <strong>Cenner tim:</strong> ako ne želiš uspoređivati ponude, izrađujemo web stranice po fiksnoj cijeni: web stranice po mjeri od {priceItem('studio-web-stranice')?.price} €, WordPress stranice od {priceItem('studio-wordpress')?.price} €.
          </p>
          {/* Cenner's own prices carry their dodatna cijena (NN 101/26), the same as on /services. */}
          <AnchorPrice ids={[['studio-web-stranice', 'Web stranica po mjeri'], ['studio-wordpress', 'WordPress stranica']]} className="mb-5 text-[0.9rem] text-slate" />
          <div className="guide-no-print flex flex-wrap gap-3">
            <Link to="/marketplace" className="inline-flex items-center gap-2 bg-sky px-5 py-3 font-display text-[15px] font-bold text-white transition-colors hover:bg-ink">
              Pregledaj freelancere <ArrowRight size={14} />
            </Link>
            <Link to="/services" className="inline-flex items-center gap-2 border-2 border-ink bg-white px-5 py-[10px] font-display text-[15px] font-bold text-ink transition-colors hover:bg-ink hover:text-white">
              Usluge Cenner tima
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PriceGuide;
