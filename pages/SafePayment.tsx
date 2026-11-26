import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../i18n';
import { PAYMENT_PATH, paymentPage, SUPPORT_EMAIL } from '../content/payment.mjs';

/*
 * /sigurno-placanje: how payment works, for clients ("is my money safe?") and freelancers.
 * The words live in content/payment.mjs (Croatian and English), shared with the markdown twin
 * that AI agents and /.well-known/search read. In the About page's look.
 */

const SafePayment: React.FC = () => {
  const { lang } = useLanguage();
  const hr = paymentPage('HR');
  const en = paymentPage('EN');
  const page = lang === 'EN' ? en : hr;

  return (
    <div className="font-text text-ink">
      <SEO
        title={hr.metaTitle}
        canonical={PAYMENT_PATH}
        description={hr.metaDescription}
        keywords="sigurno plaćanje, escrow, je li novac siguran, povrat novca, freelance plaćanje, cenner plaćanje"
        en={{
          title: en.metaTitle,
          description: en.metaDescription,
          keywords: 'safe payment, escrow, is my money safe, refund, freelance payment, cenner payment',
        }}
      />

      <section className="relative overflow-hidden px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-16">
        <div className="relative z-10 mx-auto max-w-[1500px]">
          <h1 className="font-display text-[clamp(2.5rem,8vw,7.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em]">
            {page.title}
          </h1>
          <p className="mt-8 max-w-[44ch] text-[clamp(1.25rem,1.1rem+0.7vw,1.625rem)] leading-snug">{page.lead}</p>
        </div>
      </section>

      <section className="bg-paper2 px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-4 md:grid-cols-2">
          {page.sections.map((s, i) => (
            <article
              key={s.id}
              id={s.id}
              className={`scroll-mt-24 border-2 border-ink bg-white p-7 md:p-10 ${i === page.sections.length - 1 && page.sections.length % 2 === 1 ? 'md:col-span-2' : ''}`}
            >
              <h2 className="font-display text-[clamp(1.5rem,1.1rem+1.6vw,2.5rem)] font-extrabold leading-tight tracking-[-0.03em]">{s.heading}</h2>
              <ul className="mt-5 space-y-3 text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.55]">
                {s.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className="mt-[0.62em] h-1.5 w-1.5 shrink-0 bg-ink" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[52ch] text-[1.0625rem]">
            {lang === 'EN' ? 'Questions about a payment? Write to ' : 'Pitanje o plaćanju? Pišite na '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold underline underline-offset-2 hover:text-sky">{SUPPORT_EMAIL}</a>
            {lang === 'EN' ? '. The full rules are in the ' : '. Sva pravila su u '}
            <Link to="/terms" className="underline underline-offset-2 hover:text-sky">{lang === 'EN' ? 'Terms of Use' : 'Uvjetima korištenja'}</Link>.
          </p>
          <Link to="/marketplace" className="inline-flex items-center gap-2 font-display text-[15px] font-bold hover:text-sky">
            {lang === 'EN' ? 'Browse the marketplace' : 'Pregledaj marketplace'} <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SafePayment;
