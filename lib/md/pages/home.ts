/**
 * / as markdown. Keep in step with pages/Home.tsx: the hero, the desktop's windows (trust, team,
 * "what we build"), the marquee, the paušalni-obrt wizard, the terminal FAQ and the closing CTA.
 * The scroll story, the fake OS chrome and the live freelancer avatars are left out.
 */
import { blocks, faq, h2, link, list, steps, t, type PageModule } from '../format';
import { AI_SUMMARIES } from '../summaries.mjs';

export const aiSummary: string = AI_SUMMARIES['/'];

// pages/Home.tsx MARQUEE_ROWS and STEPS, same keys.
const BUILD = ['Web Development', 'Landing Pages', 'E-commerce', 'WordPress', 'Automations', 'Graphic Design', 'Brand Identity', 'SEO'];
const PROCESS = ['Discovery Call', 'Proposal & Quote', 'Build & Review', 'Delivery & Support', 'We Handle Hosting Too', 'Direct Communication'];
const OBRT_STEPS = ['Pick activity', 'Open via START', 'Register HZMO/HZZO', 'Connect to Cenner'];

export const render: PageModule['render'] = () => ({
  title: `${t('Freelanceri iz Hrvatske')} ${t('za tvoj sljedeći projekt')}`,
  summary: aiSummary,
  path: '/',
  body: blocks(
    t('Hrvatska freelance platforma za web stranice, dizajn, marketing i programiranje. Freelanceri s provjerenim identitetom, gotovi paketi s fiksnom cijenom, a novac se freelanceru isplaćuje tek kad posao bude isporučen.'),
    `${link(t('Explore Marketplace'), '/marketplace')} · ${link(t('Cenner Services'), '/services')}`,
    list([
      `**${t('Verified freelancers')}**: ${t('Every identity checked')}`,
      `**${t('Secure payment')}**: ${t('Money held until delivery')}`,
      `**${t('Fixed Pricing')}**: ${t('Price agreed upfront')}`,
      `**${t('In-House Team')}**: ${t('No Outsourcing')}`,
    ]),
    h2(`${t('One')} ${t('in-house')} ${t('team. Start to finish.')}`),
    list([`${t('100%')} ${t('In-House Delivery')}`, `${t('24/7')} ${t('Direct Support')}`]),
    h2(t('The site you are looking at is our work.')),
    t('Behind the marketplace is an in-house team that designs, builds and runs websites, shops and automations. This screen is a small working sample: open the windows, drag them around, press CENNER for every page.'),
    list(['Web Development', 'Graphic Design', 'SEO', 'Automations'].map(t)),
    h2(t('What You Can Build')),
    t('Outcomes we deliver end-to-end.'),
    list(BUILD.map(t)),
    steps(PROCESS.map(t)),
    link(t('See all services'), '/services'),
    h2(t("Your first invoice? We'll show you how.")),
    t('To invoice clients in Croatia you must be registered as a paušalni obrt or a similar legal entity. We put together a step-by-step guide so you know exactly what to do.'),
    steps(OBRT_STEPS.map(t)),
    `*${t('Informational only, not legal advice')}* ${link(t('Legal in Croatia'), '/onboarding')}`,
    h2(t('Frequently Asked Questions')),
    t('Everything about freelancing in Croatia and the EU in one place.'),
    faq([1, 2, 3, 4, 5].map((n) => ({ q: t(`faq.q${n}`), a: t(`faq.a${n}`) }))),
    h2(t('Ready to get started?')),
    t("Whether you're a visionary founder or a technical master, Cenner is the home for your most ambitious projects."),
  ),
  related: [
    { text: 'Marketplace', href: '/marketplace' },
    { text: t('Services'), href: '/services' },
    { text: t('Pricing'), href: '/subscription' },
    { text: t('Blog'), href: '/blog' },
  ],
});
