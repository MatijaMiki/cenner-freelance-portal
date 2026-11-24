import React from 'react';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import SEO from './SEO';
import ContactForm from './ContactForm';
import AnchorPrice, { formatPrice } from './AnchorPrice';
import { useLanguage } from '../i18n';
import { COMPANY } from '../lib/company';
import { track } from '../lib/track';
import { priceItem } from '../lib/cjenik.js';

/*
 * The Google Ads landing pages (pages/ads/*.tsx), one per ad group of the "Cenner new" campaign.
 * Each says exactly what was searched, shows Cenner's own prices and puts the quote form on the
 * first screen. A sent form is a GA4 generate_lead with the page's own lead_source.
 *
 * All are noIndex and out of the sitemap (the /usluge/* pages are the ones that rank), and each
 * needs an entry in scripts/prerender-static-routes.mjs, or the path answers 404 and Google Ads
 * disapproves it.
 *
 * Prices come from the price list in force (lib/cjenik.js), each with its bazna cijena beside it
 * (NN 132/2026). Never type a price into a page: give the price list id. A pack without an id is
 * quoted on request.
 */

export type AdPack = {
  /** price list id (studio-*); none = "Na upit" */
  id?: string;
  title: string;
  desc: string;
  included: string[];
  /** said after the price, e.g. "po platformi" */
  priceNote?: string;
};

export type AdWork = { title: string; url: string; what: string; bg: string; fg: string };

export type AdLandingConfig = {
  path: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  /** what the price in the first line is for, e.g. "WordPress stranica" */
  leadLabel: string;
  /** price list id of the price in the first line */
  leadPriceId: string;
  bullets: string[];
  leadSource: string;
  placeholder: string;
  packs: AdPack[];
  /** a line under the cards, e.g. maintenance */
  afterPacks?: { label: string; id: string; anchorLabel: string };
  workTitle: string;
  work: AdWork[];
  /** answers may use {price:<id>} for a price from the price list */
  faq: { q: string; a: string }[];
  closing: string;
};

const STEPS = [
  { title: 'Razgovor', desc: 'Kažete što trebate, do kada i s kojim budžetom. Bez obveze.' },
  { title: 'Ponuda s fiksnom cijenom', desc: 'Dobijete opseg, raspored i cijenu u pisanom obliku.' },
  { title: 'Izrada i pregled', desc: 'Radimo u fazama i pokazujemo napredak dok sve ne bude kako treba.' },
  { title: 'Predaja i podrška', desc: 'Sve predajemo uredno i ostajemo dostupni nakon objave.' },
];

const COLS: Record<number, string> = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' };

const AdLanding: React.FC<{ c: AdLandingConfig }> = ({ c }) => {
  const { lang, t } = useLanguage();
  const price = (id: string) => { const it = priceItem(id); return formatPrice(it.price, it.unit, t, lang); };
  const withPrices = (s: string) => s.replace(/\{price:([a-z0-9-]+)\}/g, (_, id) => price(id));
  const page = c.path.slice(1);
  const subjects = [...c.packs.map(p => `Upit: ${p.title}`), 'Upit: nisam siguran/na, savjetujte me'];

  const h2 = 'font-display text-[clamp(2rem,1.3rem+2.6vw,3.75rem)] font-extrabold leading-[0.98] tracking-[-0.035em]';
  const toForm = 'inline-flex items-center gap-2.5 bg-sky px-7 py-4 font-display text-[15px] font-bold text-white transition-colors hover:bg-ink focus-visible:bg-ink focus-visible:outline-none';

  return (
    <div className="font-text text-ink">
      <SEO title={c.seoTitle} canonical={c.path} description={c.seoDescription} noIndex />

      {/* First screen: what they searched, the starting price, the form */}
      <section className="px-4 pb-16 pt-10 md:px-8 md:pb-24 md:pt-16">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6 lg:pt-4">
            <p className="font-display text-[15px] font-bold text-sky">Cenner tim · {COMPANY.city}</p>
            <h1 className="mt-4 font-display text-[clamp(2.75rem,1.6rem+5vw,6rem)] font-extrabold leading-[0.9] tracking-[-0.045em]">
              {c.h1}
            </h1>
            <p className="mt-6 max-w-[34ch] text-[clamp(1.125rem,1rem+0.4vw,1.375rem)] leading-[1.5]">
              {c.leadLabel} <strong className="font-display font-extrabold">{price(c.leadPriceId)}</strong>, a cijenu znate prije nego što počnemo.
            </p>
            <AnchorPrice ids={[[c.leadPriceId, c.leadLabel]]} className="mt-2 text-slate" />
            {/* on a phone the form sits below the first screen, so the first screen gets a way to it */}
            <a href="#ponuda" className={`${toForm} mt-7 lg:hidden`}>Zatražite ponudu <ArrowRight size={17} /></a>
            <ul className="mt-8 space-y-3 text-[1.0625rem]">
              {c.bullets.map(x => (
                <li key={x} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center bg-brand-green"><Check size={14} strokeWidth={3} /></span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[1rem] text-slate">
              Radije pišete izravno?{' '}
              <a href={`mailto:${COMPANY.email}`} onClick={() => track('contact_click', { method: 'email', page })} className="font-bold text-ink underline underline-offset-2 hover:text-sky">{COMPANY.email}</a>
            </p>
          </div>

          <div id="ponuda" className="scroll-mt-24 lg:col-span-6">
            <div className="border-2 border-ink bg-white p-6 shadow-[8px_8px_0_#0b0c0e] md:p-8">
              <h2 className="font-display text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em]">Zatražite ponudu</h2>
              <p className="mb-6 mt-2 text-[1rem] text-slate">Odgovaramo e-mailom s opsegom i fiksnom cijenom.</p>
              <ContactForm idPrefix="ponuda" leadSource={c.leadSource} subjects={subjects} messagePlaceholder={c.placeholder} />
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
          <ul className={`mt-10 grid gap-5 sm:grid-cols-2 ${COLS[c.packs.length] || 'lg:grid-cols-3'}`}>
            {c.packs.map(p => (
              <li key={p.title} className="flex flex-col border-2 border-ink bg-white p-5">
                {/* same height in every card of a row, so the prices line up */}
                <div className="lg:min-h-[6.25rem]">
                  <h3 className="font-display text-[1.125rem] font-extrabold leading-tight">{p.title}</h3>
                  <p className="mt-1 text-[0.95rem] text-slate">{p.desc}</p>
                </div>
                {p.id ? (
                  <>
                    <p className="mt-5 font-display text-[1.75rem] font-extrabold leading-none tracking-[-0.02em]">
                      {price(p.id)}{p.priceNote && <span className="ml-1.5 text-[1rem] font-bold tracking-normal">{p.priceNote}</span>}
                    </p>
                    <AnchorPrice ids={[p.id]} className="mt-2 text-slate" />
                  </>
                ) : (
                  <p className="mt-5 font-display text-[1.75rem] font-extrabold leading-none tracking-[-0.02em]">Na upit</p>
                )}
                <ul className="mt-5 space-y-2 border-t border-ink/15 pt-4 text-[0.95rem]">
                  {p.included.map(x => (
                    <li key={x} className="flex items-start gap-2"><Check size={15} className="mt-[3px] shrink-0 text-sky" strokeWidth={3} /><span>{x}</span></li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          {c.afterPacks && (
            <>
              <p className="mt-6 text-[1rem]">
                {c.afterPacks.label}: <strong className="font-display">{price(c.afterPacks.id)}</strong>.
              </p>
              <AnchorPrice ids={[[c.afterPacks.id, c.afterPacks.anchorLabel]]} className="mt-1 text-slate" />
            </>
          )}
        </div>
      </section>

      {/* Work */}
      <section aria-labelledby="radovi-title" className="bg-ink px-4 py-16 text-paper md:px-8 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <h2 id="radovi-title" className={h2}>{c.workTitle}</h2>
          <ul className={`mt-10 grid gap-5 sm:grid-cols-2 ${COLS[c.work.length] || 'lg:grid-cols-4'}`}>
            {c.work.map(w => (
              <li key={w.title}>
                <a
                  href={w.url}
                  target="_blank"
                  rel="noopener"
                  onClick={() => track('select_content', { content_type: 'project', item_id: w.title, page })}
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
              {c.faq.map(f => (
                <div key={f.q} className="border-t-2 border-ink pt-4">
                  <dt className="font-display text-[1.25rem] font-extrabold leading-tight">{f.q}</dt>
                  <dd className="mt-2 text-[1rem] leading-relaxed">{withPrices(f.a)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Last call */}
      <section className="bg-brand-green px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-8">
          <p className="max-w-[22ch] font-display text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">{c.closing}</p>
          <a href="#ponuda" className={toForm}>Zatražite ponudu <ArrowRight size={17} /></a>
        </div>
      </section>
    </div>
  );
};

export default AdLanding;
