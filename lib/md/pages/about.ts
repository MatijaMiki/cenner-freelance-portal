/** /about as markdown. Keep in step with pages/About.tsx. */
import { COMPANY, companyAddress } from '../../company';
import { blocks, h2, link, list, t, table, type PageModule } from '../format';

export const render: PageModule['render'] = () => ({
  title: t('About Cenner'),
  summary:
    'Cenner je hrvatska freelance platforma i vlastiti studio za web stranice, aplikacije i automatizacije. Kontakt, adresa i podaci o tvrtki.',
  path: '/about',
  body: blocks(
    t('Cenner is a Croatian freelance marketplace and a small in-house studio. On the marketplace, businesses hire verified freelancers with the price agreed upfront and the money held until the work is delivered. In the studio, we build websites, apps and automations ourselves.'),
    h2(t('The marketplace')),
    t('Verified freelancers for web, design, marketing and development. Every identity is checked, the price is agreed upfront, and the payment waits until the work is delivered.'),
    link(t('Browse the marketplace'), '/marketplace'),
    h2(t('The studio')),
    t('Websites, SaaS, CRM systems, automations, design, ads and servers, built in-house by Matija Mikulinec, who runs Cenner.'),
    link(t('See services and work'), '/services'),
    h2(t('Contact')),
    list([
      `${t('Email')}: ${COMPANY.email} (${t('support')}: ${COMPANY.supportEmail})`,
      `${t('Phone')}: ${COMPANY.phone}`,
      `${t('Address')}: ${companyAddress}, ${COMPANY.country}`,
    ]),
    `${t('Need a quote for a project?')} ${link(t('Request a Quote'), '/services#upit')}`,
    h2(t('Company details')),
    table(
      ['', ''],
      [
        [t('Company'), COMPANY.legalName],
        [t('Address'), `${companyAddress}, ${COMPANY.country}`],
        ['OIB', COMPANY.oib],
        ['MB', COMPANY.mb],
        [t('Activity'), COMPANY.activity],
      ],
    ),
  ),
  related: [
    { text: t('Services'), href: '/services' },
    { text: 'Marketplace', href: '/marketplace' },
  ],
});
