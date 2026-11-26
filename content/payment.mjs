/**
 * /sigurno-placanje (and /en/sigurno-placanje): how payment works on Cenner, for clients and
 * freelancers. One source for the page (pages/SafePayment.tsx) and its markdown twin
 * (lib/md/pages/payment.ts), so people, search engines and AI agents read the same facts.
 *
 * Every claim here mirrors the live payment code in cenner-crm/server (services/heldPayments.js
 * and the order + milestone routes in index.js). Change the code, change this:
 *   - the card is charged at checkout and the money waits in Cenner's Stripe balance;
 *   - Buy Now orders: the buyer can cancel before delivery for a full refund; completing the order
 *     pays the freelancer; otherwise it auto-releases (listing delivery time + 3 days) after purchase;
 *   - contract milestones: funded before work, 72 h to approve or dispute after submission, then
 *     auto-release; a dispute keeps the money held until an admin releases or refunds it;
 *   - payouts go to the freelancer's connected Stripe account, minus the plan commission.
 * Fees and commissions come from the price list (lib/cjenik.js), never typed here.
 */
import { priceItem } from '../lib/cjenik.js';

const p = (id) => priceItem(id).price;

export const PAYMENT_PATH = '/sigurno-placanje';
export const SUPPORT_EMAIL = 'support@cenner.hr';

const commissions = (lang) =>
  lang === 'HR'
    ? `${p('commission-free')}% na planu Free, ${p('commission-pro')}% na Pro, ${p('commission-ultra')}% na Ultra i ${p('commission-enterprise')}% na Enterprise`
    : `${p('commission-free')}% on Free, ${p('commission-pro')}% on Pro, ${p('commission-ultra')}% on Ultra and ${p('commission-enterprise')}% on Enterprise`;

/** @param {'HR'|'EN'} lang */
export function paymentPage(lang) {
  if (lang === 'HR') {
    return {
      metaTitle: 'Kako funkcionira plaćanje: je li moj novac siguran?',
      metaDescription:
        'Na Cenneru novac ne ide freelanceru kad platite: Cenner ga čuva dok posao nije gotov. Povrat prije isporuke, 72 sata za pregled faze, spor koji rješava naš tim.',
      title: 'Kako funkcionira plaćanje',
      lead: 'Kad platite, novac ne ide freelanceru. Cenner ga čuva dok posao nije gotov.',
      faqHeading: 'Česta pitanja o plaćanju',
      faq: [
        {
          q: 'Je li moj novac siguran?',
          a: 'Da. Novac ne ide freelanceru kad platite, nego ostaje kod Cennera dok ne prihvatite posao. Ako nešto pođe po zlu, novac je još kod nas.',
        },
        {
          q: 'Mogu li dobiti povrat novca?',
          a: `Da. Gotovu uslugu možete otkazati prije isporuke i dobiti cijeli iznos natrag. Kod ugovora s fazama otvorite spor u roku od 72 sata, a naš tim odluči o povratu. U ostalim slučajevima javite se na ${SUPPORT_EMAIL}.`,
        },
        {
          q: 'Kada freelancer dobiva novac?',
          a: 'Kad prihvatite posao. Ako se ne javite, automatski: 72 sata nakon predaje faze ugovora, odnosno 3 dana nakon roka isporuke gotove usluge.',
        },
        {
          q: 'Što ako posao nije dobar?',
          a: `Kod ugovora s fazama otvorite spor, novac ostaje kod nas, a član našeg tima pregleda obje strane. Kod gotove usluge javite se na ${SUPPORT_EMAIL} prije automatske isplate.`,
        },
      ],
      sections: [
        {
          id: 'placanje',
          heading: 'Kad plaćate',
          items: [
            'Plaćate karticom na naplati, preko Stripea. Cenner nikad ne vidi i ne sprema podatke vaše kartice.',
            `Plaćate cijenu s oglasa i naknadu za uslugu od ${p('buyer-fee')}%.`,
            'Novac ide Cenneru, ne freelanceru, i ostaje kod nas dok posao nije gotov.',
          ],
        },
        {
          id: 'gotove-usluge',
          heading: 'Gotove usluge („Kupi odmah”)',
          items: [
            'Prije nego što freelancer preda posao, narudžbu možete otkazati i dobiti cijeli iznos natrag.',
            'Kad ste zadovoljni predanim poslom, označite narudžbu kao završenu. Tada se freelanceru isplaćuje novac.',
            `Ako ništa ne napravite, novac se isplaćuje automatski 3 dana nakon roka isporuke navedenog u oglasu. Ako nešto nije u redu, javite se na ${SUPPORT_EMAIL} prije toga.`,
          ],
        },
        {
          id: 'ugovori',
          heading: 'Ugovori s fazama',
          items: [
            'Svaka faza uplaćuje se Cenneru prije nego što rad na njoj počne.',
            'Kad freelancer preda fazu, imate 72 sata da je prihvatite ili otvorite spor. Ako se ne javite, novac se isplaćuje automatski.',
            'Ako otvorite spor, novac ostaje kod nas. Član Cennerovog tima pregleda obje strane i odluči hoće li isplatiti freelancera ili vratiti novac vama.',
          ],
        },
        {
          id: 'freelanceri',
          heading: 'Za freelancere',
          items: [
            `Isplata ide na vaš povezani Stripe račun, umanjena za proviziju vašeg plana: ${commissions('HR')}.`,
            'Stripe obično isplati novac na vaš bankovni račun za 2 do 7 radnih dana.',
            'Svakom freelanceru provjeravamo identitet (KYC) prije nego što može prodavati.',
          ],
        },
        {
          id: 'samo-na-cenneru',
          heading: 'Samo na Cenneru',
          items: [
            'Ova zaštita vrijedi samo za plaćanja preko Cennera. Ako freelanceru platite izravno, uplatom na račun ili gotovinom, niste zaštićeni.',
          ],
        },
      ],
    };
  }
  return {
    metaTitle: 'How payment works: is my money safe?',
    metaDescription:
      "On Cenner your money doesn't go to the freelancer when you pay: Cenner holds it until the work is done. Refund before delivery, 72 hours to review a milestone, disputes decided by our team.",
    title: 'How payment works',
    lead: "When you pay, the money doesn't go to the freelancer. Cenner holds it until the work is done.",
    faqHeading: 'Common questions about payment',
    faq: [
      {
        q: 'Is my money safe?',
        a: "Yes. The money doesn't go to the freelancer when you pay; it stays with Cenner until you accept the work. If something goes wrong, the money is still with us.",
      },
      {
        q: 'Can I get a refund?',
        a: `Yes. You can cancel a ready-made service before delivery and get a full refund. On a contract with milestones, raise a dispute within 72 hours and our team decides on the refund. Otherwise, write to ${SUPPORT_EMAIL}.`,
      },
      {
        q: 'When does the freelancer get paid?',
        a: "When you accept the work. If you don't respond, automatically: 72 hours after a contract milestone is submitted, or 3 days after a ready-made service's delivery time.",
      },
      {
        q: "What if the work isn't right?",
        a: `On a contract with milestones, raise a dispute: the money stays with us and a member of our team reviews both sides. On a ready-made service, write to ${SUPPORT_EMAIL} before the automatic release.`,
      },
    ],
    sections: [
      {
        id: 'placanje',
        heading: 'When you pay',
        items: [
          'You pay by card at checkout, through Stripe. Cenner never sees or stores your card details.',
          `You pay the price on the listing plus a ${p('buyer-fee')}% service fee.`,
          'The money goes to Cenner, not to the freelancer, and stays with us until the work is finished.',
        ],
      },
      {
        id: 'gotove-usluge',
        heading: 'Ready-made services ("Buy Now")',
        items: [
          'Before the freelancer delivers, you can cancel the order and get a full refund.',
          "When you're happy with the delivered work, mark the order complete. That's when the freelancer is paid.",
          `If you do nothing, the payment is released automatically 3 days after the delivery time on the listing. If something is wrong, contact ${SUPPORT_EMAIL} before then.`,
        ],
      },
      {
        id: 'ugovori',
        heading: 'Contracts with milestones',
        items: [
          'Each milestone is paid to Cenner before work on it starts.',
          "When the freelancer submits a milestone, you have 72 hours to approve it or raise a dispute. If you don't respond, the payment is released automatically.",
          'If you raise a dispute, the money stays with us. A Cenner team member reviews both sides and decides whether to pay the freelancer or refund you.',
        ],
      },
      {
        id: 'freelanceri',
        heading: 'For freelancers',
        items: [
          `You're paid to your connected Stripe account, minus your plan's commission: ${commissions('EN')}.`,
          'Stripe usually pays out to your bank in 2 to 7 business days.',
          'Every freelancer has their identity checked (KYC) before they can sell.',
        ],
      },
      {
        id: 'samo-na-cenneru',
        heading: 'Only on Cenner',
        items: [
          "This protection only covers payments made through Cenner. If you pay a freelancer directly, by bank transfer or in cash, you're not covered.",
        ],
      },
    ],
  };
}
