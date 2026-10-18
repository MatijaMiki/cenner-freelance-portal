import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Lock, Star, ShieldCheck } from 'lucide-react';
import MeadowBackdrop from '../components/MeadowBackdrop';
import { Tube, TubeDot } from '../components/Tube';
import SEO from '../components/SEO';
import { useT } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import Avatar from '../components/Avatar';

/*
 * Homepage, redesign 3 ("one motif"). The film's CRT monitor gives the page its one shape:
 * a picture tube (rounded rectangle, edges bowed out; see components/Tube.tsx). It masks the
 * film, every picture, the selector screen, the primary buttons and the sky band in the
 * middle. Colours come from the film too: the sky (#002ca5) is the one accent, the grass is
 * Cenner's green. Every visible string is an existing i18n key, i.e. the live cenner.hr copy.
 */

// Motion layer: parts of each section rise in once, staggered. Content is only hidden once
// the script has marked <html> with .rv-on, so nothing stays invisible if it never runs.
const CSS = `
.rv-on .rv{opacity:0;transform:translate3d(0,24px,0);transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1);transition-delay:var(--d,0ms)}
.rv-on .rv.in{opacity:1;transform:none}
.cn-press{transition:transform .18s ease,background-color .2s ease,color .2s ease}
.cn-press:hover{transform:translateY(-2px)}
.cn-press:active{transform:translateY(1px) scale(.98)}
.cn-arrow svg{transition:transform .2s ease}
.cn-arrow:hover svg{transform:translateX(4px)}
.cn-fade{transition:opacity 1.6s ease}
details.cn-q summary::-webkit-details-marker{display:none}
details.cn-q .cn-bar{transition:transform .25s ease}
details.cn-q[open] .cn-bar-v{transform:rotate(90deg)}
@media (prefers-reduced-motion:reduce){
  .rv-on .rv{opacity:1;transform:none;transition:none}
  .cn-press,.cn-press:hover,.cn-press:active{transform:none}
  .cn-fade{transition:none}
}`;

function useReveal() {
  React.useEffect(() => {
    const root = document.documentElement;
    if (typeof IntersectionObserver === 'undefined') return;
    root.classList.add('rv-on');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('.rv').forEach(el => io.observe(el));
    return () => { io.disconnect(); root.classList.remove('rv-on'); };
  }, []);
}

const rv = (d = 0) => ({ className: 'rv', style: { '--d': `${d}ms` } as React.CSSProperties });

// One primary button shape for the whole page: a filled picture tube.
const TubeLink: React.FC<{ to: string; tone?: 'sky' | 'ink' | 'white'; children: React.ReactNode }> = ({ to, tone = 'sky', children }) => {
  const tones = { sky: 'bg-sky text-white hover:bg-ink', ink: 'bg-ink text-white hover:bg-sky', white: 'bg-white text-ink hover:bg-paper' };
  return (
    <Tube as={Link} to={to} round={0.34} bow={0.06} className={`cn-press cn-arrow inline-flex items-center gap-2.5 px-7 py-4 font-display text-[15px] font-bold ${tones[tone]}`}>
      {children}
    </Tube>
  );
};

/* ------------------------------------------------------------------ data */

const BUILDS = [
  { name: 'Landing Pages', desc: 'Fast, custom-built sites', field: 'bg-sky', ink: 'text-white hover:bg-ink' },
  { name: 'E-commerce', desc: 'WooCommerce & checkout flows', field: 'bg-brand-green', ink: 'text-ink hover:bg-ink hover:text-white' },
  { name: 'Automations', desc: 'n8n & AI integrations', field: 'bg-paper2', ink: 'text-ink hover:bg-ink hover:text-white' },
  { name: 'Brand Identity', desc: 'Logos, assets & print-ready files', field: 'bg-ink', ink: 'text-white hover:bg-sky' },
] as const;

const STEPS = ['Pick activity', 'Open via START', 'Register HZMO/HZZO', 'Connect to Cenner'] as const;
const STEP_FIELDS = ['bg-paper2 text-ink', 'bg-brand-green text-ink', 'bg-sky text-white', 'bg-ink text-white'] as const;

const FAQ_KEYS = [
  { q: 'faq.q1', a: 'faq.a1' },
  { q: 'faq.q2', a: 'faq.a2' },
  { q: 'faq.q3', a: 'faq.a3' },
  { q: 'faq.q4', a: 'faq.a4' },
  { q: 'faq.q5', a: 'faq.a5' },
];

/* -------------------------------------------------------- interface bits */

// Small fragments of Cenner's own interface (data-ui), standing in for product photos.
const UiCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div data-ui className={`w-[15.5rem] rounded-2xl bg-white p-5 font-display text-[14px] text-ink shadow-[0_18px_40px_-18px_rgba(11,12,14,0.45)] ${className}`}>
    {children}
  </div>
);

const KycFragment: React.FC = () => {
  const t = useT();
  return (
    <UiCard>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper2 font-display text-[15px] font-bold">C</span>
        <div>
          <p className="font-semibold">{t('Verified Specialist')}</p>
          <p className="text-slate">{t('Identity Checked')}</p>
        </div>
      </div>
      <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-green/25 px-2.5 py-1 font-semibold text-[#14532d]">
        <ShieldCheck size={14} /> {t('KYC Verified')}
      </p>
    </UiCard>
  );
};

const EscrowFragment: React.FC = () => {
  const t = useT();
  return (
    <UiCard className="w-[17.5rem]">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 font-semibold"><Lock size={14} /> {t('Stripe Escrow')}</p>
        <p className="font-semibold tabular-nums">€1.200,00</p>
      </div>
      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        <span className="h-1.5 flex-1 rounded-full bg-sky" />
        <span className="h-1.5 flex-1 rounded-full bg-sky" />
        <span className="h-1.5 flex-1 rounded-full bg-paper2" />
      </div>
      <p className="mt-3 text-slate">{t('Funds held until delivery')}</p>
    </UiCard>
  );
};

const PricingFragment: React.FC = () => {
  const t = useT();
  return (
    <UiCard>
      <p className="font-semibold">{t('Fixed Pricing')}</p>
      <ul className="mt-3 space-y-2">
        {BUILDS.slice(0, 3).map(b => (
          <li key={b.name} className="flex items-center gap-2"><Check size={14} className="text-sky" /> {t(b.name)}</li>
        ))}
      </ul>
      <p className="mt-3 text-slate">{t('Quoted upfront, always')}</p>
    </UiCard>
  );
};

// The same checklist, one field further along each time: it grows by the step just done.
const StepCard: React.FC<{ done: number }> = ({ done }) => {
  const t = useT();
  return (
    <div data-ui className="w-full max-w-[20rem] rounded-2xl bg-white p-5 font-display text-[14px] text-ink shadow-[0_18px_40px_-18px_rgba(11,12,14,0.45)]">
      <p className="flex items-center justify-between font-semibold">
        {t('Legal in Croatia')}
        <span className="tabular-nums text-slate">{done + 1}/{STEPS.length}</span>
      </p>
      <div className="mt-3 flex gap-1" aria-hidden="true">
        {STEPS.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= done ? 'bg-sky' : 'bg-paper2'}`} />)}
      </div>
      <ul className="mt-4 space-y-2.5">
        {STEPS.slice(0, done + 1).map(s => (
          <li key={s} className="flex items-center gap-2">
            <Check size={14} strokeWidth={3} className="text-sky" /> {t(s)}
          </li>
        ))}
      </ul>
    </div>
  );
};

/* -------------------------------------------------------------- sections */

// What Cenner builds, set as a list in large type; each row goes to the services page.
const BuildList: React.FC = () => {
  const t = useT();
  return (
    <section className="px-4 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 {...rv(0)} className="rv font-display text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-bold leading-[0.98] tracking-[-0.035em] lg:col-span-7">
            {t('What You Can Build')}
          </h2>
          <p {...rv(80)} className="rv max-w-[34ch] text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.55] lg:col-span-4 lg:col-start-9">
            {t('Outcomes we deliver end-to-end.')}
          </p>
        </div>
        <ul className="mt-12 space-y-2" role="list">
          {BUILDS.map((b, i) => (
            <li key={b.name} {...rv(60 + i * 70)} className="rv">
              <Link
                to="/services"
                className={`cn-arrow group grid items-center gap-2 rounded-[1.25rem] px-5 py-6 transition-colors md:grid-cols-12 md:gap-6 md:px-8 md:py-8 ${b.field} ${b.ink}`}
              >
                <span className="font-display text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-bold leading-[1] tracking-[-0.035em] md:col-span-7">{t(b.name)}</span>
                <span className="text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.45] md:col-span-4">{t(b.desc)}</span>
                <ArrowRight size={28} className="hidden justify-self-end md:block md:col-span-1" />
              </Link>
            </li>
          ))}
        </ul>
        <div {...rv(360)} className="rv mt-10">
          <TubeLink to="/services">{t('See all services')} <ArrowRight size={17} /></TubeLink>
        </div>
      </div>
    </section>
  );
};

const Talent: React.FC<{ spotlight: any[]; topPros: any[] }> = ({ spotlight, topPros }) => {
  const t = useT();
  const people = [...spotlight, ...topPros.filter(p => !spotlight.some(s => s.id === p.id))].slice(0, 8);
  if (people.length === 0) return null;
  return (
    <section className="px-4 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 {...rv(0)} className="rv font-display text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-bold leading-[0.98] tracking-[-0.035em]">
            {t('Trusted freelancers on Cenner')}
          </h2>
          <Link {...rv(80)} to="/marketplace" className="rv cn-arrow inline-flex items-center gap-2 font-display text-[15px] font-bold text-sky">
            {t('Browse all')} <ArrowRight size={17} />
          </Link>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {people.map((p, i) => (
            <li key={p.id} {...rv(60 * (i % 4))} className="rv">
              <Link to={`/freelancer/${p.id}`} className="group block">
                <Tube round={0.14} bow={0.025} className="aspect-[4/5] w-full overflow-hidden bg-paper2">
                  <Avatar src={p.avatar} name={p.name} size={480} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </Tube>
                <p className="mt-3 font-display text-[1.125rem] font-bold">{p.name}</p>
                <p className="mt-0.5 flex items-center gap-1.5 font-text text-[1rem] text-slate">
                  {p.avgRating > 0 && <><Star size={13} fill="currentColor" className="text-sky" /> {p.avgRating.toFixed(1)} · </>}
                  {p.skills?.[0] ?? (p.trusted ? 'Trusted' : p.tier === 'ultra' ? 'Ultra' : 'Pro')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ page */

const Home: React.FC = () => {
  const t = useT();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topPros, setTopPros] = React.useState<any[]>([]);
  const [spotlight, setSpotlight] = React.useState<any[]>([]);
  const [path, setPath] = React.useState<'client' | 'freelancer'>('client');
  useReveal();

  React.useEffect(() => {
    API.getTopPros().then(setTopPros).catch(() => setTopPros([]));
    API.getSpotlight().then(setSpotlight).catch(() => setSpotlight([]));
  }, []);

  const startPath = () => {
    if (path === 'client') navigate(user ? '/profile?create=1' : '/marketplace');
    else navigate(user ? '/profile' : '/auth');
  };

  return (
    <div className="relative bg-paper font-text text-ink">
      <style>{CSS}</style>
      <SEO
        title="Freelance Hrvatska: Pronađi Freelancera"
        canonical="/"
        description="Cenner je vodeća freelance platforma u Hrvatskoj. Pronađi provjerene freelancere za izradu web stranica, dizajn, marketing i razvoj. Honorarni posao brzo i sigurno."
        keywords="freelance hrvatska, honorarni posao, izrada web stranica, freelance platforma, najam freelancera"
      />

      {/* ---------- Hero: the headline at poster scale, then the film inside a giant picture tube,
          cropped by the bottom of the first screen. */}
      <section className="px-4 pt-8 md:px-8 md:pt-12">
        <div className="mx-auto max-w-[1500px]">
          <h1 {...rv(0)} className="rv font-display text-[clamp(1.6rem,6.7vw,8rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.035em]">
            {t('Freelance Hrvatska')}<br />{t('Pronađi Freelancera')}
          </h1>
          <div className="mt-8 grid gap-8 md:mt-10 lg:grid-cols-12 lg:items-end">
            <p {...rv(120)} className="rv max-w-[46ch] text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.55] lg:col-span-6">
              {t('Vodeća freelance platforma u Hrvatskoj. Povezujemo tvrtke s provjerenim freelancerima za izradu web stranica, dizajn, marketing i razvoj. Honorarni posao: brzo, sigurno, profesionalno.')}
            </p>
            <div {...rv(220)} className="rv flex flex-wrap items-center gap-x-7 gap-y-4 lg:col-span-6 lg:justify-end">
              <TubeLink to="/marketplace">{t('Explore Marketplace')} <ArrowRight size={17} /></TubeLink>
              <Link to="/services" className="cn-arrow inline-flex items-center gap-2 font-display text-[15px] font-bold hover:text-sky">
                {t('Cenner Services')} <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
        <div {...rv(300)} className="rv mx-auto mt-10 max-w-[1500px] md:mt-14">
          <Tube round={0.09} bow={0.018} className="relative h-[min(78svh,62rem)] min-h-[24rem] w-full overflow-hidden bg-sky">
            <MeadowBackdrop variant="frame" />
          </Tube>
          <Link to="/referral" className="cn-arrow mt-4 flex items-center gap-2 text-[1.0625rem] text-slate hover:text-ink">
            <TubeDot className="text-brand-green" />
            {t('Win 12 months of')} {t('free Enterprise.')} <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ---------- Trust: the four promises, each shown as a piece of the product on a colour tile. */}
      <section className="px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-3">
            <h2 {...rv(0)} className="rv font-display text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-bold leading-[0.98] tracking-[-0.035em]">
              {t('No Surprises')}
            </h2>
            <p {...rv(80)} className="rv mt-5 max-w-[30ch] text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.55]">
              {t('Every freelancer vetted')}. {t('Funds held until delivery')}. {t('Quoted upfront, always')}.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-2.5 lg:col-span-9 lg:grid-cols-3" role="list">
            {[
              { span: 'col-span-2 lg:col-span-1', ratio: 'aspect-[8/5] lg:aspect-[4/5]', field: 'bg-paper2', body: <KycFragment />, name: 'KYC Verified', fact: 'Identity Checked' },
              { span: 'col-span-2', ratio: 'aspect-[8/5]', field: 'bg-sky', body: <EscrowFragment />, name: 'Stripe Escrow', fact: 'Protected Payments' },
              { span: 'col-span-2', ratio: 'aspect-[8/5]', field: 'bg-brand-green', body: null, photo: '/home/meadow-desk-760.jpg', name: 'In-House Team', fact: 'No Outsourcing' },
              { span: 'col-span-2 lg:col-span-1', ratio: 'aspect-[8/5] lg:aspect-[4/5]', field: 'bg-ink', body: <PricingFragment />, name: 'Fixed Pricing', fact: 'No Surprises' },
            ].map((tile, i) => (
              <li key={tile.name} {...rv(70 * i)} className={`rv ${tile.span}`}>
                <Tube round={0.08} bow={0.02} className={`relative flex ${tile.ratio} items-center justify-center overflow-hidden ${tile.field}`}>
                  {tile.photo
                    ? <img src={tile.photo} alt="" width={760} height={760} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[50%_40%]" />
                    : <div className="scale-[0.72] sm:scale-90 xl:scale-100">{tile.body}</div>}
                </Tube>
                <p className="mt-3 font-display text-[1.125rem] font-bold md:text-[1.25rem]">{t(tile.name)}</p>
                <p className="text-[1rem] text-slate">{t(tile.fact)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BuildList />

      {/* ---------- The band between the page's two halves: the sky, as one wide tube. */}
      <section className="px-2 md:px-3">
        <Tube round={0.06} bow={0.012} className="bg-sky px-6 py-20 text-white md:px-14 md:py-32">
          <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-6">
              <h2 {...rv(0)} className="rv font-display text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-bold leading-[0.98] tracking-[-0.035em]">
                {t('One')} {t('in-house')} {t('team. Start to finish.')}
              </h2>
              <p {...rv(80)} className="rv mt-7 max-w-[48ch] text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.55]">
                {t('We work with clients across the EU. Every project is handled in-house. No outsourcing, no middlemen. Straightforward communication, fixed pricing, and clean handover from start to finish.')}
              </p>
              <dl {...rv(160)} className="rv mt-12 grid grid-cols-2 gap-6">
                <div>
                  <dt className="sr-only">{t('In-House Delivery')}</dt>
                  <dd className="font-display text-[clamp(3rem,6vw,6rem)] font-extrabold leading-none tracking-[-0.04em]">{t('100%')}</dd>
                  <dd className="mt-2 text-[1rem]">{t('In-House Delivery')}</dd>
                </div>
                <div>
                  <dt className="sr-only">{t('Direct Support')}</dt>
                  <dd className="font-display text-[clamp(3rem,6vw,6rem)] font-extrabold leading-none tracking-[-0.04em] text-brand-green">{t('24/7')}</dd>
                  <dd className="mt-2 text-[1rem]">{t('Direct Support')}</dd>
                </div>
              </dl>
            </div>
            <div {...rv(120)} className="rv lg:col-span-5 lg:col-start-8">
              <Tube round={0.1} bow={0.025} className="aspect-[16/9] w-full overflow-hidden lg:aspect-[4/5]">
                <img src="/home/meadow-flowers-1200.jpg" alt="" width={1200} height={675} loading="lazy" className="h-full w-full object-cover object-[20%_50%]" />
              </Tube>
            </div>
          </div>
        </Tube>
      </section>

      <Talent spotlight={spotlight} topPros={topPros} />

      {/* ---------- Legal readiness: four fields, the same checklist further along in each. */}
      <section className="pt-24 md:pt-36">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-4 md:px-8 lg:grid-cols-12 lg:gap-6">
          <h2 {...rv(0)} className="rv font-display text-[clamp(1.75rem,1.2rem+2.6vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.035em] lg:col-span-7">
            {t('You cannot just sign up and work.')}
          </h2>
          <div className="lg:col-span-5">
            <p {...rv(80)} className="rv text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.55]">
              {t('To invoice clients in Croatia you must be registered as a paušalni obrt or a similar legal entity. We put together a step-by-step guide so you know exactly what to do.')}
            </p>
            <div {...rv(140)} className="rv mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <TubeLink to="/onboarding" tone="ink">{t('Read the guide')} <ArrowRight size={17} /></TubeLink>
              <span className="text-[0.875rem] text-slate">{t('Informational only, not legal advice')}</span>
            </div>
          </div>
        </div>
        <ol className="mt-14 grid md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s} className={`group relative flex min-h-[30rem] flex-col justify-between gap-10 px-5 py-8 md:min-h-[84svh] md:px-7 ${STEP_FIELDS[i]}`}>
              <div {...rv(80 * i)} className="rv pt-[20%] transition-transform duration-150 group-hover:-translate-y-1.5 md:pt-[38%]">
                <StepCard done={i} />
              </div>
              <p className="font-display text-[clamp(1.5rem,2vw,2rem)] font-bold leading-[1.1] tracking-[-0.02em]">{t(s)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- FAQ: a sticky heading beside a stack of filled tiles (matches the FAQPage JSON-LD). */}
      <section className="px-4 pb-24 md:px-8 md:pb-36">
        <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-28">
              <h2 {...rv(0)} className="rv font-display text-[clamp(1.75rem,1.2rem+2.6vw,3.5rem)] font-bold leading-[0.98] tracking-[-0.035em]">
                {t('Frequently Asked Questions')}
              </h2>
              <p {...rv(80)} className="rv mt-5 max-w-[32ch] text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.55]">
                {t('Everything about freelancing in Croatia and the EU in one place.')}
              </p>
            </div>
          </div>
          <div className="space-y-2 lg:col-span-6">
            {FAQ_KEYS.map((item, i) => (
              <details key={item.q} name="cenner-faq" {...rv(50 * i)} className="rv cn-q group rounded-[1.25rem] bg-paper2 transition-colors open:bg-sky open:text-white">
                <summary className="flex min-h-[4.5rem] cursor-pointer list-none items-center justify-between gap-6 px-6 py-4 font-display text-[1.125rem] font-bold leading-snug md:text-[1.25rem]">
                  {t(item.q)}
                  <span aria-hidden="true" className="relative h-4 w-4 shrink-0">
                    <span className="cn-bar absolute left-0 top-[6.5px] h-[3px] w-4 rounded-full bg-current" />
                    <span className="cn-bar cn-bar-v absolute left-0 top-[6.5px] h-[3px] w-4 rotate-90 rounded-full bg-current" />
                  </span>
                </summary>
                <p className="max-w-[52ch] px-6 pb-6 text-[1.0625rem] leading-[1.55]">{t(item.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Close: the grass field, with the first step already open. */}
      <section className="bg-brand-green px-4 py-20 text-ink md:px-8 md:py-0">
        <div className="mx-auto grid max-w-[1500px] gap-12 md:min-h-[90svh] md:grid-cols-12 md:items-center md:gap-6">
          <div className="md:col-span-6 md:self-end md:pb-16">
            <h2 {...rv(0)} className="rv font-display text-[clamp(2.75rem,7vw,7rem)] font-extrabold leading-[0.92] tracking-[-0.04em]">
              {t('Ready to get started?')}
            </h2>
            <p {...rv(80)} className="rv mt-6 max-w-[40ch] text-[clamp(1.0625rem,1rem+0.25vw,1.1875rem)] leading-[1.55]">
              {t("Whether you're a visionary founder or a technical master, Cenner is the home for your most ambitious projects.")}
            </p>
          </div>
          <div {...rv(160)} className="rv md:col-span-5 md:col-start-8">
            <div data-ui className="w-full max-w-[27.5rem] rounded-3xl bg-white p-6 font-display shadow-[0_30px_60px_-24px_rgba(11,12,14,0.5)] md:p-8">
              <p className="font-display text-[1.25rem] font-bold">CENNER</p>
              <div role="radiogroup" aria-label={t('Ready to get started?')} className="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-paper p-1">
                {(['client', 'freelancer'] as const).map(k => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={path === k}
                    onClick={() => setPath(k)}
                    className={`rounded-xl px-3 py-3 text-[14px] font-semibold transition-colors ${path === k ? 'bg-white text-ink' : 'text-slate hover:text-ink'}`}
                  >
                    {k === 'client' ? t('Start a Project') : t('Join the Network')}
                  </button>
                ))}
              </div>
              <ul className="mt-5 space-y-2 text-[14px] text-ink">
                {(['KYC Verified', 'Stripe Escrow', 'Fixed Pricing'] as const).map(k => (
                  <li key={k} className="flex items-center gap-2"><Check size={15} className="text-sky" /> {t(k)}</li>
                ))}
              </ul>
              <Tube as="button" type="button" onClick={startPath} round={0.3} bow={0.05} className="cn-press cn-arrow mt-6 flex h-[3.25rem] w-full items-center justify-center gap-2.5 bg-sky font-display text-[15px] font-bold text-white hover:bg-ink">
                {path === 'client' ? t('Start a Project') : t('Join the Network')} <ArrowRight size={17} />
              </Tube>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- The mark, built large: each letter knocked out of its own block. */}
      <section aria-hidden="true" className="bg-brand-green px-2 pb-2 md:px-3 md:pb-3">
        <div className="flex h-[22svh] items-end gap-1 md:h-[34svh]">
          {['C', 'E', 'N', 'N', 'E', 'R'].map((l, i) => {
            const heights = ['h-full', 'h-[72%]', 'h-[88%]', 'h-[62%]', 'h-[94%]', 'h-[78%]'];
            const fields = ['bg-ink text-brand-green', 'bg-sky text-white', 'bg-paper text-ink', 'bg-ink text-white', 'bg-sky text-brand-green', 'bg-paper text-sky'];
            return (
              <Tube key={i} round={0.14} bow={0.02} className={`flex flex-1 items-end justify-center overflow-hidden ${heights[i]} ${fields[i]}`}>
                <span className="translate-y-[12%] font-display text-[clamp(4rem,15vw,15rem)] font-extrabold leading-none">{l}</span>
              </Tube>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
