import React from 'react';
import AdLanding, { AdLandingConfig, AdWork } from '../components/AdLanding';

/*
 * The four Google Ads landing pages, one per ad group of the "Cenner new" campaign
 * (components/AdLanding.tsx has the rules). Only what Cenner actually does, as listed in
 * lib/studioServices.ts; no delivery times. Project colours are the ones /services uses.
 * A new page also needs its route in App.tsx and an entry in scripts/prerender-static-routes.mjs.
 */

const W: Record<string, AdWork> = {
  cistimo: { title: 'Čistimo', url: 'https://cistimo.com', what: 'Rezervacije čišćenja, više jezika', bg: '#004d40', fg: '#f1f5f4' },
  selected: { title: 'Selected Real Estate', url: 'https://selectedrealestate.hr', what: 'Portal za nekretnine po mjeri', bg: '#b19777', fg: '#1e1e1e' },
  ranwhat: { title: 'ranwhat', url: 'https://ranwhat.com', what: 'Stranica s dokumentacijom', bg: '#ea8471', fg: '#0e1318' },
  stenvakt: { title: 'Stenvakt', url: 'https://stenvakt.com', what: 'Stranica proizvoda i vodiči', bg: '#ffe927', fg: '#111111' },
  cenner: { title: 'Cenner.hr', url: 'https://cenner.hr', what: 'Marketplace s plaćanjima karticom', bg: '#002ca5', fg: '#eef0f3' },
  shorten: { title: 'Shorten', url: 'https://shorten.cenner.hr', what: 'Skraćivač linkova i iPhone aplikacija', bg: '#58a6ff', fg: '#0f1419' },
  statsnest: { title: 'Statsnest', url: 'https://statsnest.app', what: 'Nadzorna ploča za poslovanje', bg: '#0c1015', fg: '#f4f5f7' },
};

const PRICE_FINAL = { q: 'Je li cijena konačna?', a: 'Da. Prije početka rada dobijete ponudu s opsegom i fiksnom cijenom. Ništa se ne naplaćuje po satu i ništa se ne dodaje bez vašeg pristanka.' };
const HOSTING = { q: 'Pomažete li s domenom i hostingom?', a: 'Da. Pomažemo postaviti domenu i hosting, a objava je dio posla, ne dodatak.' };

const WEB_STRANICE: AdLandingConfig = {
  path: '/izrada-web-stranica',
  seoTitle: 'Izrada web stranica · cijene od 500 €',
  seoDescription: 'Izrada web stranica po fiksnoj cijeni: WordPress, jednostavne stranice, web trgovine i dizajn po mjeri. Zatražite ponudu, odgovaramo s opsegom i cijenom.',
  h1: 'Izrada web stranica',
  leadLabel: 'WordPress stranica',
  leadPriceId: 'studio-wordpress',
  bullets: [
    'Fiksna cijena u pisanoj ponudi, bez naplate po satu',
    'Razgovarate s osobom koja radi vašu stranicu',
    'Radi na mobitelu, tabletu i računalu',
    'Osnovni SEO i Google Search Console uključeni',
  ],
  leadSource: 'ads_web_stranice',
  placeholder: 'Npr. stranica za obrt, 5 podstranica, imam logo i tekstove. Trebala bi biti gotova do ožujka.',
  packs: [
    { id: 'studio-wordpress', title: 'WordPress stranica', desc: 'Stranica koju sami uređujete, s obukom.',
      included: ['WordPress instaliran i postavljen', 'Tema prilagođena vašem logu i bojama', 'Kontakt obrazac i osnovni SEO', 'Obuka za samostalno uređivanje'] },
    { id: 'studio-web-stranice', title: 'Jednostavna web stranica', desc: 'Nekoliko podstranica, izrađeno od nule.',
      included: ['Početna, o nama, usluge, kontakt', 'Dizajn prema vašem logu i bojama', 'Radi na mobitelu, tabletu i računalu', 'Osnovni SEO i Google Search Console'] },
    { id: 'studio-woocommerce', title: 'WooCommerce web trgovina', desc: 'Web shop koji sami vodite.',
      included: ['Proizvodi, kategorije i varijante', 'Plaćanje karticom i dostava', 'E-mail potvrde narudžbi', 'Obuka za proizvode i narudžbe'] },
    { id: 'studio-web-aplikacija', title: 'Veća stranica ili web aplikacija', desc: 'Puno podstranica, dokumentacija, obrasci.',
      included: ['Jasna navigacija kroz puno stranica', 'Obrasci prema vašem e-mailu ili alatima', 'Jednostavne funkcije: prijava, pretraga', 'Osnovni SEO i Google Search Console'] },
    { id: 'studio-web-dizajn', title: 'Stranica s dizajnom po mjeri', desc: 'Dizajn samo za vas, bez predloška.',
      included: ['Dizajn vidite i komentirate prije izrade', 'Izrađeno od nule, bez predloška', 'Radi na svim ekranima', 'Kontakt obrazac i osnovni SEO'] },
  ],
  afterPacks: { label: 'Održavanje nakon objave (ažuriranja, sigurnosne kopije, sitne izmjene)', id: 'studio-odrzavanje', anchorLabel: 'Održavanje' },
  workTitle: 'Što smo izradili',
  work: [W.cistimo, W.selected, W.ranwhat, W.stenvakt],
  faq: [
    PRICE_FINAL,
    { q: 'Mogu li sam mijenjati tekstove?', a: 'Kod WordPress stranice i web trgovine da, obuka je uključena. Za ostale stranice manje izmjene radimo mi, u sklopu održavanja.' },
    HOSTING,
    { q: 'Što nakon objave?', a: 'Održavanje (ažuriranja, sigurnosne kopije, sigurnosne provjere i sitne izmjene) kreće {price:studio-odrzavanje}, ovisno o veličini stranice. Nije obavezno.' },
  ],
  closing: 'Opišite što trebate. Javimo se s cijenom.',
};

const WEB_SHOP: AdLandingConfig = {
  path: '/izrada-web-shopa',
  seoTitle: 'Izrada web shopa · WooCommerce od 900 €',
  seoDescription: 'Izrada web shopa po fiksnoj cijeni: WooCommerce trgovina s plaćanjem karticom, dostavom i obukom. Zatražite ponudu, odgovaramo s opsegom i cijenom.',
  h1: 'Izrada web shopa',
  leadLabel: 'WooCommerce web trgovina',
  leadPriceId: 'studio-woocommerce',
  bullets: [
    'Fiksna cijena u pisanoj ponudi, bez naplate po satu',
    'Plaćanje karticom, dostava i e-mail potvrde narudžbi',
    'Proizvode i narudžbe vodite sami, obuka je uključena',
    'Radi na mobitelu, tabletu i računalu',
  ],
  leadSource: 'ads_web_shop',
  placeholder: 'Npr. trgovina s oko 50 proizvoda, plaćanje karticom, dostava po Hrvatskoj. Imam logo i fotografije.',
  packs: [
    { id: 'studio-woocommerce', title: 'WooCommerce web trgovina', desc: 'Web shop na WordPressu koji sami vodite.',
      included: ['Proizvodi, kategorije i varijante', 'Plaćanje karticom', 'Opcije i cijene dostave', 'E-mail potvrde narudžbi', 'Obuka za proizvode i narudžbe'] },
    { id: 'studio-web-dizajn', title: 'Trgovina s dizajnom po mjeri', desc: 'Dizajn samo za vašu trgovinu, bez predloška.',
      included: ['Dizajn vidite i komentirate prije izrade', 'Izrađeno od nule, bez predloška', 'Radi na svim ekranima', 'Funkcije trgovine dogovaramo u ponudi'] },
    { id: 'studio-odrzavanje', title: 'Održavanje trgovine', desc: 'Trgovina ažurna i sigurna nakon objave.',
      included: ['Ažuriranja WordPressa, WooCommercea i dodataka', 'Redovite sigurnosne kopije', 'Sigurnosne provjere', 'Sitne izmjene kad vam trebaju'] },
  ],
  workTitle: 'Što smo izradili',
  work: [W.cenner, W.cistimo, W.selected, W.ranwhat],
  faq: [
    PRICE_FINAL,
    { q: 'Mogu li sam dodavati proizvode?', a: 'Da. WooCommerce trgovinu vodite sami: proizvode, cijene i narudžbe. Obuka je uključena u cijenu.' },
    { q: 'Kako kupci plaćaju?', a: 'Karticom, uz opcije i cijene dostave koje sami odredite. Druge načine plaćanja dogovaramo u ponudi.' },
    HOSTING,
  ],
  closing: 'Opišite svoju trgovinu. Javimo se s cijenom.',
};

const APLIKACIJE: AdLandingConfig = {
  path: '/izrada-aplikacija',
  seoTitle: 'Izrada aplikacija · web, mobilne i desktop',
  seoDescription: 'Izrada web, mobilnih i desktop aplikacija te CRM sustava po fiksnoj cijeni. Od prve verzije do objave. Zatražite ponudu, odgovaramo s opsegom i cijenom.',
  h1: 'Izrada aplikacija',
  leadLabel: 'Web aplikacija',
  leadPriceId: 'studio-web-aplikacija',
  bullets: [
    'Fiksna cijena u pisanoj ponudi, bez naplate po satu',
    'Web, iOS, Android, Mac, Windows i Linux',
    'Od prve verzije do objave u App Storeu i Google Playu',
    'Razgovarate s osobom koja radi vašu aplikaciju',
  ],
  leadSource: 'ads_aplikacije',
  placeholder: 'Npr. aplikacija za rezervacije termina, prijava korisnika i plaćanje karticom, za web i iPhone.',
  packs: [
    { id: 'studio-web-aplikacija', title: 'Web aplikacija', desc: 'Aplikacija u pregledniku, s obrascima i prijavom.',
      included: ['Jasna navigacija kroz puno stranica', 'Obrasci prema vašem e-mailu ili alatima', 'Jednostavne funkcije: prijava, pretraga', 'Radi na svim ekranima'] },
    { id: 'studio-saas', title: 'SaaS ili CRM, cijeli paket', desc: 'Gotov sustav za prave korisnike.',
      included: ['Računi, prijava i uloge', 'Stripe pretplate, plaćanja i računi', 'Administracija i e-mailovi sustava', 'Za CRM: klijenti, ponude, računi i izvještaji', 'Hosting, domena i objava'] },
    { id: 'studio-aplikacije', title: 'Mobilna ili desktop aplikacija', desc: 'iOS, Android, Mac, Windows ili Linux.', priceNote: 'po platformi',
      included: ['Cijena po platformi', 'Više platformi u jednoj ponudi', 'Objava u App Storeu i Google Playu', 'Potpisane verzije za Mac, instalacije za Windows i Linux'] },
  ],
  workTitle: 'Što smo izradili',
  work: [W.stenvakt, W.ranwhat, W.cenner, W.shorten],
  faq: [
    PRICE_FINAL,
    { q: 'Radite li mobilne aplikacije?', a: 'Da: iOS i Android, te Mac, Windows i Linux. Svaka platforma ima svoju cijenu, a projekt za više platformi nudimo zajedno.' },
    { q: 'Tko objavljuje aplikaciju?', a: 'Mi. Objava u App Storeu i Google Playu dio je posla, kao i hosting i domena za web aplikacije.' },
    { q: 'Radite li CRM po mjeri?', a: 'Da. CRM s klijentima, ponudama, računima i izvještajima dio je paketa SaaS ili CRM, {price:studio-saas}.' },
  ],
  closing: 'Opišite svoju aplikaciju. Javimo se s cijenom.',
};

const ODRZAVANJE: AdLandingConfig = {
  path: '/odrzavanje-web-stranica',
  seoTitle: 'Održavanje web stranica · od 50 € mjesečno',
  seoDescription: 'Održavanje web stranica i WordPressa: ažuriranja, sigurnosne kopije, sigurnosne provjere i sitne izmjene, od 50 € mjesečno. Zatražite ponudu.',
  h1: 'Održavanje web stranica',
  leadLabel: 'Održavanje',
  leadPriceId: 'studio-odrzavanje',
  bullets: [
    'Ažuriranja WordPressa, teme i dodataka',
    'Redovite sigurnosne kopije',
    'Sigurnosne provjere i popravak ako ažuriranje nešto pokvari',
    'Sitne izmjene sadržaja kad vam trebaju',
  ],
  leadSource: 'ads_odrzavanje',
  placeholder: 'Npr. WordPress stranica s oko 20 podstranica i web shopom. Adresa stranice: ...',
  packs: [
    { id: 'studio-odrzavanje', title: 'Održavanje stranice', desc: 'Stranica ažurna i sigurna, mjesečno.',
      included: ['Ažuriranja softvera, teme i dodataka', 'Redovite sigurnosne kopije', 'Sigurnosne provjere', 'Popravak ako ažuriranje nešto pokvari', 'Sitne izmjene sadržaja', 'Cijena ovisi o veličini stranice'] },
    { id: 'studio-seo-provjera', title: 'Provjera SEO-a i AI vidljivosti', desc: 'Jednokratno, s popisom popravaka.',
      included: ['Tehnički SEO: indeksiranje, brzina, naslovi', 'Pregled Google Search Consolea', 'Kako vas opisuju ChatGPT i Claude', 'Pisani izvještaj, najvažnije prvo'] },
    { title: 'Serveri, sigurnost i hosting', desc: 'Za stranice na vlastitom serveru.',
      included: ['Postavljanje VPS-a i Coolifyja', 'Zaštita i redovite zakrpe', 'Sigurnosne kopije i provjere incidenata', 'Domene, SSL i e-mail'] },
  ],
  workTitle: 'Stranice koje sami vodimo',
  work: [
    { ...W.cenner, what: 'Marketplace, serveri i plaćanja' },
    { ...W.ranwhat, what: 'Stranica, dokumentacija i server' },
    { ...W.stenvakt, what: 'Stranica i vodiči' },
    { ...W.statsnest, what: 'Aplikacija na vlastitom serveru' },
  ],
  faq: [
    { q: 'Koliko košta mjesečno?', a: 'Kreće {price:studio-odrzavanje}, ovisno o veličini stranice. Točan iznos piše u ponudi, prije početka.' },
    { q: 'Što ako ažuriranje pokvari stranicu?', a: 'Popravak je dio održavanja, a redovite sigurnosne kopije znače da se stranica uvijek može vratiti.' },
    { q: 'Mogu li tražiti izmjene sadržaja?', a: 'Da. Sitne izmjene sadržaja, poput teksta, slika ili cijena, dio su održavanja.' },
    { q: 'A brzina i Google?', a: 'Za to je jednokratna provjera SEO-a i AI vidljivosti ({price:studio-seo-provjera}): dobijete pisani popis popravaka, najvažnije prvo.' },
  ],
  closing: 'Pošaljite adresu stranice. Javimo se s cijenom.',
};

export const WebStranice: React.FC = () => <AdLanding c={WEB_STRANICE} />;
export const WebShop: React.FC = () => <AdLanding c={WEB_SHOP} />;
export const Aplikacije: React.FC = () => <AdLanding c={APLIKACIJE} />;
export const Odrzavanje: React.FC = () => <AdLanding c={ODRZAVANJE} />;
