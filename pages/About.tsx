import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import ContactForm from '../components/ContactForm';
import { useT } from '../i18n';
import { COMPANY, companyAddress } from '../lib/company';

/*
 * About and Contact, one page (Contact had nothing else; About had no way to reach us): what
 * Cenner is, how to get in touch (#kontakt) and who runs it (#tvrtka, the one place the company's
 * registered details live, from lib/company). In the homepage's look.
 */

const About: React.FC = () => {
  const t = useT();
  const h2 = 'font-display text-[clamp(2.25rem,1.3rem+3.8vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.04em]';
  const lead = 'text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.55]';
  const subjects = [t('General Inquiry'), t('Support Request'), t('Billing Question'), t('Become a Partner')];

  const rows: [string, React.ReactNode][] = [
    [t('Company'), COMPANY.legalName],
    [t('Address'), `${companyAddress}, ${COMPANY.country}`],
    ['OIB', COMPANY.oib],
    ['MB', COMPANY.mb],
    [t('Activity'), COMPANY.activity],
  ];

  return (
    <div className="font-text text-ink">
      <SEO
        title="O nama i kontakt"
        canonical="/about"
        description="Cenner je hrvatska freelance platforma i vlastiti studio za web stranice, aplikacije i automatizacije. Kontakt, adresa i podaci o tvrtki."
        keywords="o cenneru, cenner kontakt, freelance platforma hrvatska, cenner obrt"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: COMPANY.brand,
          legalName: COMPANY.legalName,
          url: 'https://cenner.hr',
          logo: 'https://cenner.hr/favicon.svg',
          email: COMPANY.email,
          telephone: COMPANY.phone,
          taxID: COMPANY.oib,
          foundingDate: COMPANY.founded,
          founder: { '@type': 'Person', name: COMPANY.owner },
          address: { '@type': 'PostalAddress', streetAddress: COMPANY.street, postalCode: COMPANY.postcode, addressLocality: COMPANY.city, addressCountry: COMPANY.countryCode },
          contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: COMPANY.supportEmail, telephone: COMPANY.phone, availableLanguage: ['hr', 'en'] }],
        }}
      />

      {/* Header */}
      <section className="relative overflow-hidden px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-16">
        <div className="relative z-10 mx-auto max-w-[1500px]">
          <h1 className="font-display text-[clamp(2.75rem,9vw,8.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em]">
            {t('About Cenner')}
          </h1>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <p className="max-w-[52ch] text-[clamp(1.25rem,1.1rem+0.7vw,1.625rem)] leading-snug lg:col-span-8">
              {t('Cenner is a Croatian freelance marketplace and a small in-house studio. On the marketplace, businesses hire verified freelancers with the price agreed upfront and the money held until the work is delivered. In the studio, we build websites, apps and automations ourselves.')}
            </p>
            <div className="lg:col-span-4 lg:text-right">
              <a href="#kontakt" className="inline-flex items-center gap-2 font-display text-[15px] font-bold hover:text-sky">
                {t('Contact')} <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* The two halves of Cenner */}
      <section className="relative overflow-hidden bg-paper2 px-4 py-16 md:px-8 md:py-24">
        <div className="relative z-10 mx-auto grid max-w-[1500px] gap-4 md:grid-cols-2">
          <article className="flex flex-col border-2 border-ink bg-white p-7 md:p-10">
            <h2 className="font-display text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-extrabold leading-tight tracking-[-0.03em]">{t('The marketplace')}</h2>
            <p className={`${lead} mt-4`}>{t('Verified freelancers for web, design, marketing and development. Every identity is checked, the price is agreed upfront, and the payment waits until the work is delivered.')}</p>
            <Link to="/marketplace" className="mt-auto inline-flex items-center gap-2 pt-8 font-display text-[15px] font-bold hover:text-sky">
              {t('Browse the marketplace')} <ArrowRight size={17} />
            </Link>
          </article>
          <article className="flex flex-col border-2 border-ink bg-white p-7 md:p-10">
            <h2 className="font-display text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-extrabold leading-tight tracking-[-0.03em]">{t('The studio')}</h2>
            <p className={`${lead} mt-4`}>{t('Websites, SaaS, CRM systems, automations, design, ads and servers, built in-house by Matija Mikulinec, who runs Cenner.')}</p>
            <Link to="/services" className="mt-auto inline-flex items-center gap-2 pt-8 font-display text-[15px] font-bold hover:text-sky">
              {t('See services and work')} <ArrowRight size={17} />
            </Link>
          </article>
        </div>
      </section>

      {/* Contact */}
      <section id="kontakt" aria-labelledby="kontakt-title" className="scroll-mt-24 px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="kontakt-title" className={h2}>{t('Contact')}</h2>
            <dl className="mt-8 space-y-5 text-[1.0625rem]">
              <div>
                <dt className="font-display text-[15px] font-bold">{t('Email')}</dt>
                <dd className="mt-1">
                  <a href={`mailto:${COMPANY.email}`} className="underline underline-offset-2 hover:text-sky">{COMPANY.email}</a>
                  <span className="text-slate"> · {t('support')}: </span>
                  <a href={`mailto:${COMPANY.supportEmail}`} className="underline underline-offset-2 hover:text-sky">{COMPANY.supportEmail}</a>
                </dd>
              </div>
              <div>
                <dt className="font-display text-[15px] font-bold">{t('Phone')}</dt>
                <dd className="mt-1"><a href={COMPANY.phoneHref} className="underline underline-offset-2 hover:text-sky">{COMPANY.phone}</a></dd>
              </div>
              <div>
                <dt className="font-display text-[15px] font-bold">{t('Address')}</dt>
                <dd className="mt-1">{companyAddress}, {COMPANY.country}</dd>
              </div>
            </dl>
            <p className="mt-8 text-[1rem]">
              {t('Need a quote for a project?')}{' '}
              <Link to="/services#upit" className="font-bold underline underline-offset-2 hover:text-sky">{t('Request a Quote')}</Link>
            </p>
          </div>
          <div className="lg:col-span-7">
            <ContactForm idPrefix="kontakt" subjects={subjects} messagePlaceholder={t('How can we help you today?')} />
          </div>
        </div>
      </section>

      {/* Who runs it */}
      <section id="tvrtka" aria-labelledby="tvrtka-title" className="relative overflow-hidden scroll-mt-24 bg-ink px-4 py-16 text-white md:px-8 md:py-20">
        <div className="relative z-10 mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-12">
          <h2 id="tvrtka-title" className="font-display text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-extrabold leading-tight tracking-[-0.03em] lg:col-span-5">{t('Company details')}</h2>
          <dl className="grid gap-x-8 gap-y-4 text-[1rem] sm:grid-cols-[auto_1fr] lg:col-span-7">
            {rows.map(([k, v]) => (
              <React.Fragment key={String(k)}>
                <dt className="font-display font-bold text-white/70">{k}</dt>
                <dd>{v}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
};

export default About;
