/** /privacy as markdown. Keep in step with pages/PrivacyPolicy.tsx (legal text: copy it word for word). */
import { COMPANY } from '../../company';
import { blocks, h2, list, type PageModule } from '../format';

export const render: PageModule['render'] = () => ({
  title: 'Privacy Policy',
  summary: "Cenner's privacy policy. Learn how we collect, use, and protect your personal data on our freelance talent platform.",
  path: '/privacy',
  body: blocks(
    'Last updated: October 2023',
    h2('1. Introduction'),
    'Welcome to Cenner. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.',
    h2('2. The Data We Collect'),
    list([
      '**Identity Data:** includes first name, last name, username or similar identifier.',
      '**Contact Data:** includes email address and telephone numbers.',
      '**Financial Data:** includes payment card details (processed securely via our escrow partners).',
      '**Technical Data:** includes internet protocol (IP) address, login data, browser type and version.',
    ]),
    h2('3. How We Use Your Data'),
    'We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:',
    list([
      'Where we need to perform the contract we are about to enter into or have entered into with you.',
      'Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.',
      'Where we need to comply with a legal or regulatory obligation.',
    ]),
    h2('4. Data Security'),
    'We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.',
    `*Questions regarding this policy should be directed to ${COMPANY.email}. The data controller is ${COMPANY.legalName}, ${COMPANY.street}, ${COMPANY.postcode} ${COMPANY.city} (OIB ${COMPANY.oib}).*`,
  ),
  related: [
    { text: 'Terms of Service', href: '/terms' },
    { text: 'Cookie Policy', href: '/cookies' },
  ],
});
