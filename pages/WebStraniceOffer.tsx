import React from 'react';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import SEO from '../components/SEO';
import ContactForm from '../components/ContactForm';
import AnchorPrice, { formatPrice } from '../components/AnchorPrice';
import { useLanguage } from '../i18n';
import { COMPANY } from '../lib/company';
import { track } from '../lib/track';
import { priceItem } from '../lib/cjenik.js';

/*
 * The page the Google Ads "Web stranice" ad group sends people to (cenner.hr/izrada-web-stranica).
 * One job: someone searched "izrada web stranica", so the page says exactly that, shows Cenner's
 * own prices and puts the quote form on the first screen. A sent form is a GA4 generate_lead with
 * lead_source "ads_web_stranice" (imported into Google Ads as the conversion).
 *
 * Kept out of search (noIndex, no sitemap entry): /usluge/izrada-web-stranica is the page that
 * ranks, and two pages for one search would compete.
 *
 * Prices come from the price list in force (lib/cjenik.js), each with its bazna cijena beside it
 * (NN 132/2026). Never type a price here. What each package includes follows lib/studioServices.ts.
 */

type Pack = { id: string; title: string; desc: string; included: string[] };

const PACKS: Pack[] = [
  { id: 'studio-wordpress', title: 'WordPress stranica',
    desc: 'Stranica koju sami uređujete, s obukom.',
    included: ['WordPress instaliran i postavljen', 'Tema prilagođena vašem logu i bojama', 'Kontakt obrazac i osnovni SEO', 'Obuka za samostalno uređivanje'] },
  { id: 'studio-web-stranice', title: 'Jednostavna web stranica',
    desc: 'Nekoliko podstranica, izrađeno od nule.',
    included: ['Početna, o nama, usluge, kontakt', 'Dizajn prema vašem logu i bojama', 'Radi na mobitelu, tabletu i računalu', 'Osnovni SEO i Google Search Console'] },
  { id: 'studio-woocommerce', title: 'WooCommerce web trgovina',
    desc: 'Web shop koji sami vodite.',
    included: ['Proizvodi, kategorije i varijante', 'Plaćanje karticom i dostava', 'E-mail potvrde narudžbi', 'Obuka za proizvode i narudžbe'] },
  { id: 'studio-web-aplikacija', title: 'Veća stranica ili web aplikacija',
    desc: 'Puno podstranica, dokumentacija, obrasci.',
    included: ['Jasna navigacija kroz puno stranica', 'Obrasci prema vašem e-mailu ili alatima', 'Jednostavne funkcije: prijava, pretraga', 'Osnovni SEO i Google Search Console'] },
  { id: 'studio-web-dizajn', title: 'Stranica s dizajnom po mjeri',
    desc: 'Dizajn samo za vas, bez predloška.',
    included: ['Dizajn vidite i komentirate prije izrade', 'Izrađeno od nule, bez predloška', 'Radi na svim ekranima', 'Kontakt obrazac i osnovni SEO'] },
];

const SUBJECTS = [...PACKS.map(p => `Upit: ${p.title}`), 'Upit: nisam siguran/na, savjetujte me'];

const WORK = [
  { title: 'Čistimo', url: 'https://cistimo.com', what: 'Rezervacije čišćenja, više jezika', bg: '#004d40', fg: '#f1f5f4' },
  { title: 'Selected Real Estate', url: 'https://selectedrealestate.hr', what: 'Portal za nekretnine po mjeri', bg: '#b19777', fg: '#1e1e1e' },
  { title: 'ranwhat', url: 'https://ranwhat.com', what: 'Stranica s dokumentacijom', bg: '#ea8471', fg: '#0e1318' },
  { title: 'Stenvakt', url: 'https://stenvakt.com', what: 'Stranica proizvoda i vodiči', bg: '#ffe927', fg: '#111111' },
];

const STEPS = [
  { title: 'Razgovor', desc: 'Kažete što trebate, do kada i s kojim budžetom. Bez obveze.' },
  { title: 'Ponuda s fiksnom cijenom', desc: 'Dobijete opseg, raspored i cijenu u pisanom obliku.' },
  { title: 'Izrada i pregled', desc: 'Radimo u fazama i pokazujemo napredak dok sve ne bude kako treba.' },
  { title: 'Predaja i podrška', desc: 'Stranicu predajemo uredno i ostajemo dostupni nakon objave.' },
];

const FAQ: { q: string; a?: string }[] = [
  { q: 'Je li cijena konačna?', a: 'Da. Prije početka rada dobijete ponudu s opsegom i fiksnom cijenom. Ništa se ne naplaćuje po satu i ništa se ne dodaje bez vašeg pristanka.' },
  { q: 'Mogu li sam mijenjati tekstove?', a: 'Kod WordPress stranice i web trgovine da, obuka je uključena. Za ostale stranice manje izmjene radimo mi, u sklopu održavanja.' },
  { q: 'Pomažete li s domenom i hostingom?', a: 'Da. Pomažemo postaviti domenu i hosting, a objava stranice dio je posla, ne dodatak.' },
  { q: 'Što nakon objave?' },
];

const WebStraniceOffer: React.FC = () => {
  const { lang, t } = useLanguage();
  const price = (id: string) => { const it = priceItem(id); return formatPrice(it.price, it.unit, t, lang); };
  const upkeep = priceItem('studio-odrzavanje');
  const upkeepPrice = formatPrice(upkeep.price, upkeep.unit, t, lang);

  const h2 = 'font-display text-[clamp(2rem,1.3rem+2.6vw,3.75rem)] font-extrabold leading-[0.98] tracking-[-0.035em]';
  const toForm = 'inline-flex items-center gap-2.5 bg-sky px-7 py-4 font-display text-[15px] font-bold text-white transition-colors hover:bg-ink focus-visible:bg-ink focus-visible:outline-none';

  return (
    <div className="font-text text-ink">
      <SEO
        title="Izrada web stranica · cijene od 500 €"
        canonical="/izrada-web-stranica"
        description="Izrada web stranica po fiksnoj cijeni: WordPress, jednostavne stranice, web trgovine i dizajn po mjeri. Zatražite ponudu, odgovaramo s opsegom i cijenom."
        noIndex
      />

      {/* First screen: what they searched, the starting price, the form */}
      <section className="px-4 pb-16 pt-10 md:px-8 md:pb-24 md:pt-16">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6 lg:pt-4">
            <p className="font-display text-[15px] font-bold text-sky">Cenner tim · {COMPANY.city}</p>
            <h1 className="mt-4 font-display text-[clamp(2.75rem,1.6rem+5vw,6rem)] font-extrabold leading-[0.9] tracking-[-0.045em]">
              Izrada web stranica
            </h1>
            <p className="mt-6 max-w-[34ch] text-[clamp(1.125rem,1rem+0.4vw,1.375rem)] leading-[1.5]">
              WordPress stranica <strong className="font-display font-extrabold">{price('studio-wordpress')}</strong>, a cijenu znate prije nego što počnemo.
            </p>
            <AnchorPrice ids={[['studio-wordpress', 'WordPress stranica']]} className="mt-2 text-slate" />
            {/* on a phone the form sits below the first screen, so the first screen gets a way to it */}
            <a href="#ponuda" className={`${toForm} mt-7 lg:hidden`}>Zatražite ponudu <ArrowRight size={17} /></a>
            <ul className="mt-8 space-y-3 text-[1.0625rem]">
              {[
                'Fiksna cijena u pisanoj ponudi, bez naplate po satu',
                'Razgovarate s osobom koja radi vašu stranicu',
                'Radi na mobitelu, tabletu i računalu',
                'Osnovni SEO i Google Search Console uključeni',
              ].map(x => (
                <li key={x} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center bg-brand-green"><Check size={14} strokeWidth={3} /></span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[1rem] text-slate">
              Radije pišete izravno?{' '}
              <a href={`mailto:${COMPANY.email}`} onClick={() => track('contact_click', { method: 'email', page: 'izrada-web-stranica' })} className="font-bold text-ink underline underline-offset-2 hover:text-sky">{COMPANY.email}</a>
            </p>
          </div>

          <div id="ponuda" className="scroll-mt-24 lg:col-span-6">
            <div className="border-2 border-ink bg-white p-6 shadow-[8px_8px_0_#0b0c0e] md:p-8">
              <h2 className="font-display text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em]">Zatražite ponudu</h2>
              <p className="mb-6 mt-2 text-[1rem] text-slate">Odgovaramo e-mailom s opsegom i fiksnom cijenom.</p>
              <ContactForm
                idPrefix="ponuda"
                leadSource="ads_web_stranice"
                subjects={SUBJECTS}
                messagePlaceholder="Npr. stranica za obrt, 5 podstranica, imam logo i tekstove. Trebala bi biti gotova do ožujka."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Prices */}
      <section id="cijene" aria-labelledby="cijene-title" className="border-t-2 border-ink px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="cijene-title" className={h2}>Cijene</h2>
            <p className="max-w-[44ch] text-[1rem] text-slate">Početne cijene iz našeg <a href="/cjenik" className="text-ink underline underline-offset-2 hover:text-sky">cjenika</a>. Točan iznos piše u ponudi, prije početka rada.</p>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {PACKS.map(p => (
              <li key={p.id} className="flex flex-col border-2 border-ink bg-white p-5">
                {/* same height in every card of a row, so the prices line up */}
                <div className="lg:min-h-[6.25rem]">
                  <h3 className="font-display text-[1.125rem] font-extrabold leading-tight">{p.title}</h3>
                  <p className="mt-1 text-[0.95rem] text-slate">{p.desc}</p>
                </div>
                <p className="mt-5 font-display text-[1.75rem] font-extrabold leading-none tracking-[-0.02em]">{price(p.id)}</p>
                <AnchorPrice ids={[p.id]} className="mt-2 text-slate" />
                <ul className="mt-5 space-y-2 border-t border-ink/15 pt-4 text-[0.95rem]">
                  {p.included.map(x => (
                    <li key={x} className="flex items-start gap-2"><Check size={15} className="mt-[3px] shrink-0 text-sky" strokeWidth={3} /><span>{x}</span></li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[1rem]">
            Održavanje nakon objave (ažuriranja, sigurnosne kopije, sitne izmjene): <strong className="font-display">{upkeepPrice}</strong>.
          </p>
          <AnchorPrice ids={[['studio-odrzavanje', 'Održavanje']]} className="mt-1 text-slate" />
        </div>
      </section>

      {/* Work */}
      <section aria-labelledby="radovi-title" className="bg-ink px-4 py-16 text-paper md:px-8 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <h2 id="radovi-title" className={h2}>Što smo izradili</h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WORK.map(w => (
              <li key={w.title}>
                <a
                  href={w.url}
                  target="_blank"
                  rel="noopener"
                  onClick={() => track('select_content', { content_type: 'project', item_id: w.title, page: 'izrada-web-stranica' })}
                  className="group flex aspect-[4/3] flex-col justify-between p-5 transition-transform duration-150 hover:-translate-y-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-paper"
                  style={{ background: w.bg, color: w.fg }}
                >
                  <ArrowUpRight size={22} className="self-end opacity-70 transition-opacity group-hover:opacity-100" />
                  <span>
                    <span className="block font-display text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em]">{w.title}</span>
                    <span className="mt-1 block text-[0.95rem] opacity-80">{w.what}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it runs + questions (plain list, no drawers: nothing below moves) */}
      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className={h2}>Kako radimo</h2>
            <ol className="mt-10 space-y-7">
              {STEPS.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[2.75rem_1fr] gap-4">
                  <span className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-brand-green font-display text-[1.125rem] font-extrabold">{i + 1}</span>
                  <span>
                    <span className="block font-display text-[1.25rem] font-extrabold leading-tight">{s.title}</span>
                    <span className="mt-1 block text-[1rem] text-slate">{s.desc}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className={h2}>Pitanja</h2>
            <dl className="mt-10 space-y-7">
              {FAQ.map(f => (
                <div key={f.q} className="border-t-2 border-ink pt-4">
                  <dt className="font-display text-[1.25rem] font-extrabold leading-tight">{f.q}</dt>
                  <dd className="mt-2 text-[1rem] leading-relaxed">
                    {f.a ?? `Održavanje (ažuriranja, sigurnosne kopije, sigurnosne provjere i sitne izmjene) kreće ${upkeepPrice}, ovisno o veličini stranice. Nije obavezno.`}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Last call */}
      <section className="bg-brand-green px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-8">
          <p className="max-w-[22ch] font-display text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
            Opišite što trebate. Javimo se s cijenom.
          </p>
          <a href="#ponuda" className={toForm}>Zatražite ponudu <ArrowRight size={17} /></a>
        </div>
      </section>
    </div>
  );
};

export default WebStraniceOffer;
