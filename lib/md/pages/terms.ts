/** /terms as markdown. Keep in step with pages/TermsOfService.tsx (legal text: copy it word for word). */
import { COMPANY } from '../../company';
import { blocks, h2, list, type PageModule } from '../format';

export const render: PageModule['render'] = () => ({
  title: 'Terms of Service',
  summary: "Cenner's terms of service. Read the terms and conditions governing the use of our freelance talent marketplace.",
  path: '/terms',
  lastUpdated: '2023-10-12',
  body: blocks(
    'Effective Date: October 12, 2023',
    h2('1. Agreement to Terms'),
    'By accessing or using the Cenner platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service. These terms apply to all visitors, users, and others who access or use the Service.',
    h2('2. User Accounts'),
    'When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.',
    'You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.',
    h2('3. Marketplace Transactions'),
    'Cenner provides a marketplace for freelancers to offer services. We act as an intermediary and facilitate payments through our secure escrow system. Funds are held until the client confirms receipt and satisfaction with the final delivery or until the dispute resolution process concludes.',
    h2('4. Keeping Activity On-Platform'),
    'Cenner operates as an intermediary marketplace. The fees we charge fund the escrow, payment protection, and dispute resolution described above. To keep these protections available to everyone, you agree that while you are engaged with, or within twelve (12) months of first being introduced to, another user through Cenner, you will not:',
    list([
      'Solicit, request, or arrange to move communication, negotiation, or payment for services off the platform, including requesting or sharing personal email addresses, phone numbers, or other off-platform contact details for that purpose.',
      "Pay for, invoice, or otherwise settle services outside of Cenner's payment system in order to avoid platform fees.",
    ]),
    "Off-platform arrangements are not covered by Cenner's escrow, buyer or seller protection, or dispute resolution. Violations may result in suspension or permanent termination of your account.",
    h2('5. Intellectual Property'),
    `The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of ${COMPANY.legalName} (OIB ${COMPANY.oib}, ${COMPANY.street}, ${COMPANY.postcode} ${COMPANY.city}), and its licensors.`,
    `For further clarification on our legal terms, contact ${COMPANY.email}.`,
  ),
  related: [
    { text: 'Privacy Policy', href: '/privacy' },
    { text: 'Cookie Policy', href: '/cookies' },
  ],
});
