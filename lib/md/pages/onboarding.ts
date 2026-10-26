/**
 * /onboarding as markdown: the Croatian copy of pages/Onboarding.tsx (that page keeps its own
 * HR/EN strings inline, not in i18n.tsx). Keep in step with it.
 */
import { blocks, h2, h3, link, list, type PageModule } from '../format';

const STEPS: [string, string][] = [
  ['Provjeri uvjete i odaberi djelatnost', 'Ne mogu se sve djelatnosti voditi kao paušalni obrt. Provjeri NKD šifre i obratljivost na portalu START ili kod računovođe.'],
  ['Otvori obrt putem portala START', 'Cijeli postupak može se obaviti online preko portala start.gov.hr (e-Građanin). Kao alternativu možeš koristiti šalter HITRO.HR / FINA.'],
  ['Prijavi se na HZMO i HZZO', 'U roku od nekoliko dana od početka rada potrebno je prijaviti se u mirovinski (HZMO) i zdravstveni sustav (HZZO).'],
  ['Otvori poslovni račun', 'Većina banaka u Hrvatskoj nudi jeftine ili besplatne poslovne račune za paušalne obrte. Klijenti i Cenner ti uplaćuju isključivo na taj račun.'],
  ['Postavi knjigovodstvo / računovođu', 'Iako je paušalni režim jednostavan, preporučujemo barem početni razgovor s računovođom radi prijave PO-SD obrasca i godišnjih obveza.'],
  ['Poveži se s Cennerom', 'Kada si registriran, dovrši profil i KYC verifikaciju. Tek tada možeš objaviti uslugu i primati narudžbe.'],
];

const SOURCES: [string, string][] = [
  ['START (start.gov.hr)', 'https://start.gov.hr'],
  ['Porezna uprava (porezna.gov.hr)', 'https://porezna.gov.hr'],
  ['HITRO.HR (hitro.hr)', 'https://www.hitro.hr'],
  ['HZMO (Mirovinsko)', 'https://www.hzmo.hr'],
  ['HZZO (Zdravstveno)', 'https://www.hzzo.hr'],
];

export const render: PageModule['render'] = () => ({
  title: 'Prije nego započneš rad na Cenneru.',
  summary:
    'Vodič kroz pravne korake potrebne za freelance rad u Hrvatskoj. Saznaj kako otvoriti paušalni obrt i započeti suradnju kroz Cenner.',
  path: '/onboarding',
  body: blocks(
    'Da bi mogao zakonito naplatiti svoj rad u Hrvatskoj, moraš biti registriran kao pravni subjekt. Najjednostavniji oblik za freelancere je paušalni obrt.',
    '**Pravna napomena:** Ova stranica služi isključivo u informativne svrhe i ne predstavlja pravni, porezni ili računovodstveni savjet. Pragovi, stope i postupci mogu se mijenjati. Prije bilo kakve odluke obavezno se posavjetuj s ovlaštenim računovođom ili Poreznom upravom.',
    h2('Zašto ne mogu samo raditi?'),
    'Cenner ne može legalno isplaćivati naknade osobama koje nisu registrirane kao porezni obveznici. Bez registriranog subjekta (obrta, paušalnog obrta ili tvrtke j.d.o.o./d.o.o.) ne smiješ izdati račun i ne možeš primati uplate.',
    'Registracija štiti i tebe i klijenta: jamči ti pristup mirovinskom i zdravstvenom osiguranju, a klijentu jasan, knjigovodstveno valjan trošak.',
    h2('Što je paušalni obrt?'),
    'Paušalni obrt je pojednostavljeni oblik samostalne djelatnosti namijenjen manjim freelancerima. Umjesto vođenja knjiga prihoda i rashoda, plaćaš fiksni paušalni porez ovisno o razredu prometa.',
    list([
      'Prikladno za freelancere s godišnjim prometom ispod određenog praga (orijentacijski oko 60.000 €, ali provjeri trenutno važeći iznos).',
      'Mjesečni doprinosi za mirovinsko i zdravstveno osiguranje su fiksni i niži nego kod redovnog obrta.',
      'Nije obveznik PDV-a dok god promet ne premaši PDV prag (orijentacijski 60.000 €, ali provjeri).',
    ]),
    h2('Koraci za otvaranje'),
    ...STEPS.map(([title, body], i) => blocks(h3(`${i + 1}. ${title}`), body)),
    h2('Okvirni troškovi'),
    'Iznosi se mijenjaju iz godine u godinu. Aktualne brojke uvijek provjeri na poreznoj.hr ili kod računovođe.',
    list([
      'Otvaranje obrta: niži dvocifreni iznos u eurima.',
      'Mjesečni doprinosi: orijentacijski od 100 do 150 € (HZMO + HZZO).',
      'Paušalni porez i prirez: ovisi o razredu godišnjeg prometa i mjestu prebivališta.',
      'Računovodstvo: opcionalno, najčešće od 20 do 40 € mjesečno.',
    ]),
    h2('Alternative paušalnom obrtu'),
    list([
      '**Redovni obrt:** za veće prihode ili djelatnosti koje ne mogu biti paušalne. Vodi knjige, plaća porez na dohodak.',
      '**J.d.o.o.:** jednostavno društvo s ograničenom odgovornošću. Niska osnivačka glavnica, ali kompleksnije od paušalnog obrta.',
      '**D.o.o.:** klasični LLC, primjereniji kada zapošljavaš ljude i imaš značajne troškove.',
    ]),
    h2('Službeni izvori'),
    list(SOURCES.map(([label, href]) => link(label, href))),
    'Nakon što otvoriš obrt, dovrši profil, pošalji KYC i objavi prvu uslugu.',
  ),
  related: [
    { text: 'Freelance u Hrvatskoj', href: '/blog/freelance-u-hrvatskoj' },
    { text: 'Marketplace', href: '/marketplace' },
  ],
});
