import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, FileText, Shield, Receipt, ArrowRight,
  CheckCircle2, ExternalLink, Building2, Wallet, Scale, Info,
} from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../i18n';

const Onboarding: React.FC = () => {
  const { lang } = useLanguage();
  const isHr = lang === 'HR';

  const t = (hr: string, en: string) => (isHr ? hr : en);

  return (
    <div className="pt-16 pb-24 max-w-5xl mx-auto px-4">
      <SEO
        title={isHr ? 'Početak rada — Otvaranje paušalnog obrta | Cenner' : 'Get Started — Opening a Paušalni Obrt | Cenner'}
        canonical="/onboarding"
        description={isHr
          ? 'Vodič kroz pravne korake potrebne za freelance rad u Hrvatskoj. Saznaj kako otvoriti paušalni obrt i započeti suradnju kroz Cenner.'
          : 'A practical guide to the legal steps required to freelance from Croatia. Learn how to open a paušalni obrt and start working through Cenner.'}
      />

      {/* Hero */}
      <div className="mb-12">
        <div className="inline-block px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-[10px] font-black uppercase tracking-widest mb-6">
          {t('Vodič za početak', 'Getting Started')}
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6">
          {t('Prije nego započneš', 'Before you start working')}{' '}
          <span className="text-brand-pink">{t('rad na Cenneru.', 'on Cenner.')}</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl">
          {t(
            'Da bi mogao zakonito naplatiti svoj rad u Hrvatskoj, moraš biti registriran kao pravni subjekt. Najjednostavniji oblik za freelancere je paušalni obrt.',
            'To legally invoice your work in Croatia, you must be registered as a legal entity. The simplest form for freelancers is a paušalni obrt (flat-rate sole trader).'
          )}
        </p>
      </div>

      {/* Disclaimer — prominent */}
      <div className="mb-14 p-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/5">
        <div className="flex items-start gap-4">
          <AlertTriangle size={22} className="text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 text-xs font-black uppercase tracking-widest mb-2">
              {t('Pravna napomena', 'Legal disclaimer')}
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t(
                'Ova stranica služi isključivo u informativne svrhe i ne predstavlja pravni, porezni ili računovodstveni savjet. Pragovi, stope i postupci mogu se mijenjati. Prije bilo kakve odluke obavezno se posavjetuj s ovlaštenim računovođom ili Poreznom upravom.',
                'This page is for informational purposes only and is not legal, tax, or accounting advice. Thresholds, rates, and procedures may change. Always consult a licensed accountant or the Croatian Tax Administration before acting.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Why you need it */}
      <Section
        icon={<Scale size={20} />}
        title={t('Zašto ne mogu samo raditi?', "Why can't I just sign up and work?")}
      >
        <p>
          {t(
            'Cenner ne može legalno isplaćivati naknade osobama koje nisu registrirane kao porezni obveznici. Bez registriranog subjekta — obrta, paušalnog obrta ili tvrtke (j.d.o.o./d.o.o.) — ne smiješ izdati račun i ne možeš primati uplate.',
            'Cenner cannot legally pay individuals who are not registered as tax-paying entities. Without a registered entity — a regular obrt, paušalni obrt, or a company (j.d.o.o./d.o.o.) — you cannot issue an invoice and cannot receive payments.'
          )}
        </p>
        <p className="mt-3">
          {t(
            'Registracija štiti i tebe i klijenta: jamči ti pristup mirovinskom i zdravstvenom osiguranju, a klijentu jasan, knjigovodstveno valjan trošak.',
            'Registration protects both you and the client: it gives you access to pension and health insurance, and gives the client a clean, accountable expense.'
          )}
        </p>
      </Section>

      {/* What is paušalni obrt */}
      <Section
        icon={<Building2 size={20} />}
        title={t('Što je paušalni obrt?', 'What is a paušalni obrt?')}
      >
        <p>
          {t(
            'Paušalni obrt je pojednostavljeni oblik samostalne djelatnosti namijenjen manjim freelancerima. Umjesto vođenja knjiga prihoda i rashoda, plaćaš fiksni paušalni porez ovisno o razredu prometa.',
            'A paušalni obrt is a simplified form of self-employment for smaller freelancers. Instead of bookkeeping income and expenses, you pay a fixed flat-rate tax based on your annual revenue tier.'
          )}
        </p>
        <ul className="mt-4 space-y-2 text-gray-400">
          <Bullet>
            {t(
              'Prikladno za freelancere s godišnjim prometom ispod određenog praga (orijentacijski oko 60.000 € — provjeri trenutno važeći iznos).',
              'Suitable for freelancers under a defined yearly revenue threshold (roughly €60,000 — verify the currently applicable cap).'
            )}
          </Bullet>
          <Bullet>
            {t(
              'Mjesečni doprinosi za mirovinsko i zdravstveno osiguranje su fiksni i niži nego kod redovnog obrta.',
              'Monthly pension and health insurance contributions are fixed and lower than a regular obrt.'
            )}
          </Bullet>
          <Bullet>
            {t(
              'Nije obveznik PDV-a dok god promet ne premaši PDV prag (orijentacijski 60.000 € — provjeri).',
              'Not VAT-registered as long as revenue stays below the VAT threshold (roughly €60,000 — verify).'
            )}
          </Bullet>
        </ul>
      </Section>

      {/* Steps */}
      <Section
        icon={<FileText size={20} />}
        title={t('Koraci za otvaranje', 'Steps to open one')}
      >
        <ol className="space-y-4 mt-2">
          <Step n={1} title={t('Provjeri uvjete i odaberi djelatnost', 'Check eligibility and pick your activity')}>
            {t(
              'Ne mogu se sve djelatnosti voditi kao paušalni obrt. Provjeri NKD šifre i obratljivost na portalu START ili kod računovođe.',
              'Not every activity qualifies for the paušalni regime. Verify NKD activity codes and eligibility on the START portal or with an accountant.'
            )}
          </Step>
          <Step n={2} title={t('Otvori obrt putem portala START', 'Open the obrt via the START portal')}>
            {t(
              'Cijeli postupak može se obaviti online preko portala start.gov.hr (e-Građanin). Kao alternativu možeš koristiti šalter HITRO.HR / FINA.',
              'The whole process can be completed online via start.gov.hr (e-Građanin). As an alternative, you can go through a HITRO.HR / FINA counter.'
            )}
          </Step>
          <Step n={3} title={t('Prijavi se na HZMO i HZZO', 'Register with HZMO and HZZO')}>
            {t(
              'U roku od nekoliko dana od početka rada potrebno je prijaviti se u mirovinski (HZMO) i zdravstveni sustav (HZZO).',
              'Within a few days of starting, you must register with the pension fund (HZMO) and the health insurance fund (HZZO).'
            )}
          </Step>
          <Step n={4} title={t('Otvori poslovni račun', 'Open a business bank account')}>
            {t(
              'Većina banaka u Hrvatskoj nudi jeftine ili besplatne poslovne račune za paušalne obrte. Klijenti i Cenner ti uplaćuju isključivo na taj račun.',
              'Most Croatian banks offer affordable or free business accounts for paušalni obrti. Clients and Cenner will deposit only into this account.'
            )}
          </Step>
          <Step n={5} title={t('Postavi knjigovodstvo / računovođu', 'Set up bookkeeping / an accountant')}>
            {t(
              'Iako je paušalni režim jednostavan, preporučujemo barem početni razgovor s računovođom radi prijave PO-SD obrasca i godišnjih obveza.',
              'Even though the paušalni regime is simple, we recommend at least an initial chat with an accountant for the annual PO-SD form and other obligations.'
            )}
          </Step>
          <Step n={6} title={t('Poveži se s Cennerom', 'Link your obrt to Cenner')}>
            {t(
              'Kada si registriran, dovrši profil i KYC verifikaciju. Tek tada možeš objaviti uslugu i primati narudžbe.',
              'Once registered, complete your profile and KYC verification. Only then can you publish a listing and receive orders.'
            )}
          </Step>
        </ol>
      </Section>

      {/* Costs */}
      <Section
        icon={<Wallet size={20} />}
        title={t('Okvirni troškovi', 'Approximate costs')}
      >
        <p className="mb-3">
          {t(
            'Iznosi se mijenjaju iz godine u godinu. Aktualne brojke uvijek provjeri na poreznoj.hr ili kod računovođe.',
            'Amounts change yearly. Always verify current figures on porezna.hr or with an accountant.'
          )}
        </p>
        <ul className="space-y-2 text-gray-400">
          <Bullet>{t('Otvaranje obrta: niži dvocifreni iznos u eurima.', 'Opening the obrt: a low double-digit amount in euros.')}</Bullet>
          <Bullet>{t('Mjesečni doprinosi: orijentacijski oko 100—150 € (HZMO + HZZO).', 'Monthly contributions: roughly €100–€150 (HZMO + HZZO).')}</Bullet>
          <Bullet>{t('Paušalni porez i prirez: ovisi o razredu godišnjeg prometa i mjestu prebivališta.', 'Flat-rate tax and surtax: depends on revenue tier and your municipality.')}</Bullet>
          <Bullet>{t('Računovodstvo: opcionalno, najčešće 20—40 € mjesečno.', 'Accountant: optional, typically €20–€40 per month.')}</Bullet>
        </ul>
      </Section>

      {/* Alternatives */}
      <Section
        icon={<Receipt size={20} />}
        title={t('Alternative paušalnom obrtu', 'Alternatives to paušalni obrt')}
      >
        <ul className="space-y-3 text-gray-400">
          <Bullet>
            <strong className="text-white">{t('Redovni obrt — ', 'Regular obrt — ')}</strong>
            {t('za veće prihode ili djelatnosti koje ne mogu biti paušalne. Vodi knjige, plaća porez na dohodak.', 'for higher revenue or activities that cannot be paušalni. Requires bookkeeping; income tax applies.')}
          </Bullet>
          <Bullet>
            <strong className="text-white">{t('J.d.o.o. — ', 'J.d.o.o. — ')}</strong>
            {t('jednostavno društvo s ograničenom odgovornošću. Niska osnivačka glavnica, ali kompleksnije od paušalnog obrta.', 'simple limited liability company. Low founding capital but more complex than paušalni obrt.')}
          </Bullet>
          <Bullet>
            <strong className="text-white">{t('D.o.o. — ', 'D.o.o. — ')}</strong>
            {t('klasični LLC, primjereniji kada zapošljavaš ljude i imaš značajne troškove.', 'classic LLC, better suited when employing people or carrying significant expenses.')}
          </Bullet>
        </ul>
      </Section>

      {/* Resources */}
      <Section
        icon={<Info size={20} />}
        title={t('Službeni izvori', 'Official sources')}
      >
        <ul className="space-y-2">
          <ResourceLink href="https://start.gov.hr" label="START — start.gov.hr" />
          <ResourceLink href="https://porezna.gov.hr" label="Porezna uprava — porezna.gov.hr" />
          <ResourceLink href="https://www.hitro.hr" label="HITRO.HR — hitro.hr" />
          <ResourceLink href="https://www.hzmo.hr" label="HZMO (Mirovinsko)" />
          <ResourceLink href="https://www.hzzo.hr" label="HZZO (Zdravstveno)" />
        </ul>
      </Section>

      {/* CTA */}
      <div className="mt-16 p-10 rounded-3xl bg-gradient-to-br from-brand-green/20 to-brand-pink/20 border border-white/10 backdrop-blur-md text-center">
        <Shield size={32} className="text-brand-green mx-auto mb-4" />
        <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
          {t('Kada budeš spreman, mi te čekamo.', 'When you are ready, we are waiting.')}
        </h3>
        <p className="text-gray-400 text-sm mb-6 max-w-xl mx-auto">
          {t(
            'Nakon što otvoriš obrt, dovrši profil, pošalji KYC i objavi prvu uslugu.',
            'Once your obrt is open, complete your profile, submit KYC, and publish your first listing.'
          )}
        </p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-green text-brand-black rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
        >
          {t('Otvori račun', 'Create account')} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section className="mb-12">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center">{icon}</div>
      <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{title}</h2>
    </div>
    <div className="text-gray-400 text-base leading-relaxed pl-1">{children}</div>
  </section>
);

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start gap-2.5">
    <CheckCircle2 size={16} className="text-brand-green shrink-0 mt-1" />
    <span>{children}</span>
  </li>
);

const Step: React.FC<{ n: number; title: string; children: React.ReactNode }> = ({ n, title, children }) => (
  <li className="flex gap-4">
    <div className="w-9 h-9 rounded-xl bg-brand-pink/10 text-brand-pink font-black flex items-center justify-center shrink-0">{n}</div>
    <div>
      <h3 className="text-white font-bold text-base mb-1">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
    </div>
  </li>
);

const ResourceLink: React.FC<{ href: string; label: string }> = ({ href, label }) => (
  <li>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-brand-green hover:underline text-sm font-bold"
    >
      {label} <ExternalLink size={12} />
    </a>
  </li>
);

export default Onboarding;
