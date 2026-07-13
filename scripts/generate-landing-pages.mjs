// Generates static SEO landing pages for /usluge/* and /freelanceri/*.
// Output goes to public/, which Vite copies to dist/ at build time.
// Vercel serves the static .html before applying SPA rewrites.
//
// Run: node scripts/generate-landing-pages.mjs

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');
const BASE = 'https://cenner.hr';
const OG = `${BASE}/og-image.png`;

// ---- service landing pages ----
const services = [
  {
    slug: 'izrada-web-stranica',
    title: 'Izrada Web Stranica — Freelanceri Hrvatska',
    keyword: 'izrada web stranica',
    description:
      'Trebaš novu web stranicu? Pronađi provjerene freelancere za izradu modernih web stranica u Hrvatskoj. Cijene od 300 €. Bez agencijskih marži.',
    h1: 'Izrada Web Stranica u Hrvatskoj',
    intro:
      'Tražiš profesionalnu izradu web stranice po pristupačnoj cijeni? Cenner povezuje hrvatske tvrtke i poduzetnike s provjerenim web developerima koji rade brzo, kvalitetno i bez skupih agencijskih marži.',
    sections: [
      {
        h2: 'Koliko košta izrada web stranice u Hrvatskoj?',
        body: [
          'Cijena izrade web stranice u Hrvatskoj ovisi o složenosti projekta. Jednostavna landing stranica ili predstavljajuća web stranica obrta kreće od <strong>300 € do 800 €</strong>. Korporativne web stranice s više podstranica i CMS-om kreću se od <strong>800 € do 2.500 €</strong>. Web shopovi i složenije aplikacije idu od <strong>2.000 € pa do 10.000 €</strong> i više.',
          'Na Cenneru možeš dobiti <strong>više ponuda</strong> od različitih freelancera i odabrati onu koja najbolje odgovara tvom proračunu i očekivanjima. Sve cijene su transparentne, bez skrivenih troškova.',
        ],
      },
      {
        h2: 'Što sve uključuje izrada web stranice?',
        body: [
          'Profesionalna izrada web stranice obično uključuje: <strong>dizajn</strong> (Figma macke i finalni mockup-ovi), <strong>responsive HTML/CSS implementaciju</strong>, <strong>integraciju s CMS-om</strong> (najčešće WordPress, Webflow ili custom rješenje), <strong>SEO osnovu</strong> (meta tagovi, sitemap, brzina), <strong>postavljanje na hosting</strong> i <strong>jamstvo na rad</strong>.',
          'Naši freelanceri rade s modernim tehnologijama poput Reacta, Next.jsa, Astra i Vuea — ali i s WordPressom, Shopifyem i Webflowom kad je to bolji izbor za projekt.',
        ],
      },
      {
        h2: 'Zašto angažirati freelancera umjesto agencije?',
        body: [
          'Agencija u Hrvatskoj za istu web stranicu naplaćuje <strong>2x do 3x više</strong> jer pokriva fiksne režije (uredi, account manageri, marketing). Freelancer ti dolazi izravno — niža cijena, brža komunikacija, jednako kvalitetan rezultat.',
          'Na Cenneru su svi freelanceri prošli <strong>KYC verifikaciju</strong>, a plaćanje ide kroz osigurani escrow sustav. Plaćaš tek kad si zadovoljan rezultatom.',
        ],
      },
      {
        h2: 'Kako pronaći pravog web developera?',
        body: [
          'Klikni na "Pronađi freelancera" ispod, opiši svoj projekt u par rečenica, i naš AI matching će ti predložiti 3–5 najprikladnijih kandidata u roku od minute. Pregledaj njihove portfolije, ocjene i prethodne projekte, pa odaberi najboljeg.',
        ],
      },
    ],
    related: ['programiranje', 'seo-optimizacija', 'wordpress-izrada'],
  },
  {
    slug: 'dizajn-loga',
    title: 'Dizajn Loga i Vizualnog Identiteta — Cenner',
    keyword: 'dizajn loga',
    description:
      'Pronađi grafičkog dizajnera za izradu loga, vizualnog identiteta i brendinga u Hrvatskoj. Ponude od provjerenih freelancera. Cijene od 80 €.',
    h1: 'Dizajn Loga i Vizualnog Identiteta',
    intro:
      'Tvoj brend zaslužuje logo koji ostaje u sjećanju. Cenner povezuje hrvatske tvrtke s vrhunskim grafičkim dizajnerima koji izrađuju logotipe, vizualne identitete i branding pakete po fer cijenama.',
    sections: [
      {
        h2: 'Koliko košta dizajn loga u Hrvatskoj?',
        body: [
          'Cijena dizajna loga ovisi o iskustvu dizajnera i opsegu posla. Jednostavan logo s par revizija kreće od <strong>80 € do 250 €</strong>. Kompletan vizualni identitet (logo, paleta boja, tipografija, mockup-ovi) ide od <strong>300 € do 1.200 €</strong>. Brending paket s brand guideom, social media template-ima i print materijalima kreće od <strong>800 € pa naviše</strong>.',
        ],
      },
      {
        h2: 'Što ulazi u kvalitetan vizualni identitet?',
        body: [
          'Profesionalan brending uključuje: <strong>logo u svim formatima</strong> (vektor, raster, transparentna i monokromatska verzija), <strong>brand guide</strong> s pravilima korištenja, <strong>paletu boja s HEX i CMYK kodovima</strong>, <strong>tipografski sustav</strong>, te <strong>mockup-ove primjene</strong> na vizitkama, web stranici, društvenim mrežama i print materijalima.',
        ],
      },
      {
        h2: 'Kako odabrati pravog dizajnera?',
        body: [
          'Pogledaj portfolio. Dobar dizajner pokazuje raznoliku stilsku paletu i jasno objašnjava razmišljanje iza svakog projekta. Na Cenneru svi profili sadrže ocjene prijašnjih klijenata, vrijeme isporuke i postotak zadovoljstva.',
        ],
      },
    ],
    related: ['izrada-web-stranica', 'digitalni-marketing', 'wordpress-izrada'],
  },
  {
    slug: 'seo-optimizacija',
    title: 'SEO Optimizacija — Pronađi SEO Stručnjaka | Cenner',
    keyword: 'seo optimizacija',
    description:
      'Tvoja web stranica ne dolazi na prvu stranicu Googlea? Pronađi SEO stručnjaka u Hrvatskoj. Audit, on-page optimizacija, link building. Cijene od 200 €/mj.',
    h1: 'SEO Optimizacija — Bolji Plasman na Googleu',
    intro:
      'Ako te kupci ne mogu pronaći na Googleu, ne postojiš. Cenner povezuje hrvatske tvrtke s SEO stručnjacima koji znaju kako tehnički, sadržajno i autoritativno postaviti web stranicu da rangira za prave ključne riječi.',
    sections: [
      {
        h2: 'Što uključuje SEO optimizacija?',
        body: [
          'Profesionalna SEO usluga obuhvaća: <strong>tehnički audit</strong> (brzina, indeksabilnost, struktura), <strong>keyword research</strong> za hrvatsko tržište, <strong>on-page optimizaciju</strong> (title, meta, headings, internal linking), <strong>strukturirane podatke</strong> (Schema.org), <strong>link building</strong> i <strong>kontinuirano izvještavanje</strong> kroz Google Search Console i Analytics.',
        ],
      },
      {
        h2: 'Koliko košta SEO u Hrvatskoj?',
        body: [
          'Jednokratni SEO audit s preporukama kreće od <strong>200 € do 600 €</strong>. Mjesečni paket optimizacije za malu web stranicu ide od <strong>300 € do 800 € mjesečno</strong>. Veći e-commerce projekti i nacionalne kampanje kreću od <strong>1.000 € mjesečno</strong> i više.',
          'Za razliku od plaćenih oglasa, SEO daje <strong>dugoročne rezultate</strong> — jednom kad rangiraš, dolazi besplatan promet mjesecima.',
        ],
      },
      {
        h2: 'Koliko brzo se vide rezultati?',
        body: [
          'Realističan vremenski okvir za prve značajne pomake je <strong>3–6 mjeseci</strong>. Mali popravci (brzina, meta opisi) mogu pokazati učinak za 2–4 tjedna, ali stabilno rangiranje za konkurentne pojmove zahtijeva strpljenje i konzistentan rad.',
        ],
      },
    ],
    related: ['izrada-web-stranica', 'digitalni-marketing', 'wordpress-izrada'],
  },
  {
    slug: 'digitalni-marketing',
    title: 'Digitalni Marketing — Freelance Marketinški Stručnjaci | Cenner',
    keyword: 'digitalni marketing',
    description:
      'Pronađi marketinškog freelancera u Hrvatskoj — Google Ads, Meta oglasi, social media, email marketing. Provjereni stručnjaci, transparentne cijene.',
    h1: 'Digitalni Marketing — Freelance Stručnjaci',
    intro:
      'Treba ti više kvalificiranih leadova, povratnih kupaca ili pratitelja na društvenim mrežama? Cenner povezuje hrvatske tvrtke s marketinškim freelancerima koji znaju što rade — bez gubljenja proračuna na neučinkovite kampanje.',
    sections: [
      {
        h2: 'Koje marketing usluge možeš pronaći?',
        body: [
          'Na Cenneru pronalaziš stručnjake za: <strong>Google Ads i Performance Max</strong>, <strong>Meta oglase</strong> (Facebook i Instagram), <strong>TikTok Ads</strong>, <strong>SEO i sadržajni marketing</strong>, <strong>email marketing</strong> (Klaviyo, Mailchimp), <strong>upravljanje društvenim mrežama</strong>, <strong>influencer outreach</strong> i <strong>marketinšku strategiju</strong>.',
        ],
      },
      {
        h2: 'Koliko izdvojiti za digitalni marketing?',
        body: [
          'Za male tvrtke i obrte, mjesečni proračun za oglase trebao bi biti minimalno <strong>500 € do 1.500 €</strong> da bi se vidjeli rezultati. Honorar freelancera za upravljanje kampanjama dodatno kreće od <strong>200 € do 800 € mjesečno</strong>, ovisno o opsegu.',
          'Pravilo: <strong>20% proračuna na honorar, 80% na sam media spend.</strong> Ako agencija traži obrnuto, bježi.',
        ],
      },
      {
        h2: 'Agencija ili freelancer?',
        body: [
          'Za male i srednje tvrtke u Hrvatskoj, dobar freelancer daje <strong>jednako kvalitetan rad uz upola manju cijenu</strong>. Direktna komunikacija, brže odluke, niži troškovi. Agencije imaju smisla samo kad ti treba paralelno više stručnjaka i veliki tim.',
        ],
      },
    ],
    related: ['seo-optimizacija', 'dizajn-loga', 'izrada-web-stranica'],
  },
  {
    slug: 'wordpress-izrada',
    title: 'WordPress Izrada — Freelanceri u Hrvatskoj | Cenner',
    keyword: 'wordpress izrada',
    description:
      'Trebaš WordPress web stranicu? Pronađi WordPress developera u Hrvatskoj. Tema, plugin, WooCommerce, optimizacija. Cijene od 250 €.',
    h1: 'WordPress Izrada — Freelance Developeri',
    intro:
      'WordPress pokreće više od 40% svih web stranica na svijetu i ostaje najpouzdaniji izbor za blogove, korporativne stranice i web shopove. Cenner ti pomaže pronaći WordPress developera koji izrađuje brze, sigurne i SEO-prijateljske stranice.',
    sections: [
      {
        h2: 'Koliko košta WordPress web stranica u Hrvatskoj?',
        body: [
          'WordPress stranica s gotovom temom i osnovnom prilagodbom kreće od <strong>250 € do 700 €</strong>. Custom tema rađena od nule s jedinstvenim dizajnom ide od <strong>800 € do 2.500 €</strong>. WooCommerce shop s katalogom, plaćanjem i dostavom kreće od <strong>1.200 € pa naviše</strong>.',
        ],
      },
      {
        h2: 'Što naši WordPress developeri rade?',
        body: [
          'Naši freelanceri pokrivaju cijeli WordPress stack: <strong>custom teme</strong> (PHP, ACF, Gutenberg blokovi), <strong>WooCommerce</strong> i e-commerce, <strong>plugin razvoj</strong>, <strong>migracije i performance optimizacija</strong>, <strong>sigurnosnu reviziju</strong>, te <strong>kontinuirano održavanje</strong>.',
        ],
      },
      {
        h2: 'WordPress ili Webflow / custom?',
        body: [
          'Ako trebaš stranicu koju će klijent moći sam ažurirati i kojoj treba bogat ekosustav plugina (npr. WooCommerce, formular, booking), <strong>WordPress je najbolji izbor</strong>. Za pure marketing stranice s naprednim animacijama često je bolji Webflow ili Astro. Za složene aplikacije — custom (Next.js, Remix).',
        ],
      },
    ],
    related: ['izrada-web-stranica', 'seo-optimizacija', 'dizajn-loga'],
  },
  {
    slug: 'programiranje',
    title: 'Usluge Programiranja — Freelance Developeri Hrvatska | Cenner',
    keyword: 'usluge programiranja',
    description:
      'Trebaš programera? Pronađi provjerene freelance developere u Hrvatskoj — web, mobilne aplikacije, backend, API integracije. Profesionalno programiranje bez agencijskih marži.',
    h1: 'Usluge Programiranja — Freelance Developeri',
    intro:
      'Od web aplikacija i API integracija do mobilnih aplikacija i automatizacije — Cenner te povezuje s provjerenim hrvatskim programerima koji rade s modernim tehnologijama. Profesionalno programiranje po transparentnim cijenama, bez skupih agencijskih marži.',
    sections: [
      {
        h2: 'Koje usluge programiranja možeš pronaći?',
        body: [
          'Na Cenneru pronalaziš profesionalne developere za: <strong>web aplikacije</strong> (React, Next.js, Vue, Angular), <strong>backend i API razvoj</strong> (Node.js, Python, PHP, .NET, Java), <strong>mobilne aplikacije</strong> (React Native, Flutter, iOS, Android), <strong>e-commerce i integracije plaćanja</strong>, <strong>automatizaciju i skripte</strong>, <strong>bazu podataka i DevOps</strong>, te <strong>održavanje i nadogradnju postojećeg koda</strong>.',
        ],
      },
      {
        h2: 'Koliko koštaju usluge programiranja u Hrvatskoj?',
        body: [
          'Satnica iskusnog freelance developera u Hrvatskoj kreće se od <strong>25 € do 70 € po satu</strong>, ovisno o tehnologiji i seniornosti. Manji projekti (landing aplikacija, integracija, automatizacija) kreću od <strong>500 € do 2.000 €</strong>. Kompletne web ili mobilne aplikacije idu od <strong>3.000 € pa naviše</strong>, ovisno o opsegu.',
          'Na Cenneru dobivaš <strong>više ponuda</strong> od različitih programera i biraš onu koja odgovara tvom proračunu. Plaćanje ide kroz osigurani escrow sustav — plaćaš tek kad je posao isporučen.',
        ],
      },
      {
        h2: 'Zašto freelance programer umjesto agencije?',
        body: [
          'Za većinu projekata dobar freelance developer isporučuje <strong>jednaku kvalitetu uz 2–3x nižu cijenu</strong> od agencije. Direktna komunikacija s osobom koja piše kod znači brže odluke, manje nesporazuma i transparentniji napredak.',
          'Svi programeri na Cenneru prošli su <strong>KYC verifikaciju</strong>, a njihovi profili sadrže portfolio, ocjene prijašnjih klijenata i tehnologije kojima vladaju.',
        ],
      },
      {
        h2: 'Kako pronaći pravog programera?',
        body: [
          'Klikni na "Pronađi freelancera", opiši svoj projekt i tehnički zahtjev u par rečenica, a naš AI matching predlaže 3–5 najprikladnijih developera u roku od minute. Pregledaj portfolije i reference, zatraži ponudu i kreni.',
        ],
      },
    ],
    related: ['izrada-web-stranica', 'wordpress-izrada', 'seo-optimizacija'],
  },
];

// ---- city landing pages ----
const cities = [
  {
    slug: 'zagreb',
    name: 'Zagreb',
    title: 'Freelanceri Zagreb — Honorarni Posao u Zagrebu | Cenner',
    description:
      'Pronađi provjerene freelancere u Zagrebu — web developere, dizajnere, marketinške stručnjake. Honorarni posao u Zagrebu, brzo i sigurno.',
    h1: 'Freelanceri u Zagrebu',
    intro:
      'Zagreb je freelance metropola Hrvatske — više od 60% svih registriranih freelancera na Cenneru radi iz glavnog grada. Bez obzira tražiš li web developera, grafičkog dizajnera ili marketinškog stručnjaka, na jednom mjestu pregledavaš ponudu vrhunskih zagrebačkih kreatora.',
    extra:
      'Zagreb je posebno jak u <strong>tech sektoru</strong> (web razvoj, mobile aplikacije, AI/ML), <strong>kreativnim industrijama</strong> (UX/UI, branding, motion design) i <strong>digitalnom marketingu</strong>. Mnogi naši zagrebački freelanceri rade za inozemne klijente, što jamči visoku razinu kvalitete i komunikacijskih vještina.',
  },
  {
    slug: 'split',
    name: 'Split',
    title: 'Freelanceri Split — Honorarni Posao u Splitu | Cenner',
    description:
      'Pronađi vrhunske freelancere u Splitu i Dalmaciji. Web razvoj, dizajn, marketing, prijevodi. Provjereni stručnjaci, sigurno plaćanje.',
    h1: 'Freelanceri u Splitu',
    intro:
      'Split i Dalmacija imaju brzorastuću freelance scenu — posebno u području web razvoja, turizma, hospitalityja i digitalnog marketinga. Cenner te povezuje s provjerenim splitskim freelancerima za honorarni posao u svim ključnim industrijama.',
    extra:
      'Mnogi splitski freelanceri specijalizirani su za <strong>turistički sektor</strong> — izradu booking stranica, marketing za hotele i privatne smještaje, multilingual SEO. Drugi rade s globalnim klijentima u tech-u i dizajnu, koristeći prednost mediteranskog načina života.',
  },
  {
    slug: 'rijeka',
    name: 'Rijeka',
    title: 'Freelanceri Rijeka — Honorarni Posao u Rijeci | Cenner',
    description:
      'Pronađi freelancere u Rijeci i Primorsko-goranskoj županiji. Web izrada, dizajn, marketing, copywriting. Cenner — vodeća freelance platforma u Hrvatskoj.',
    h1: 'Freelanceri u Rijeci',
    intro:
      'Rijeka je važno sveučilišno i tech središte sjeverne Hrvatske s rastućom freelance zajednicom. Na Cenneru pronalaziš riječke web developere, dizajnere, marketinške stručnjake i copywritere s referencama iz hrvatskih i međunarodnih projekata.',
    extra:
      'Rijeka ima jako tehničko sveučilište što znači <strong>stalan priljev mladih, kvalificiranih developera i inženjera</strong>. Posebno snažna kategorija su backend razvoj, embedded sustavi i industrijski softver.',
  },
  {
    slug: 'osijek',
    name: 'Osijek',
    title: 'Freelanceri Osijek — Honorarni Posao u Slavoniji | Cenner',
    description:
      'Pronađi freelancere u Osijeku i Slavoniji. Web izrada, dizajn, marketing, prijevodi. Profesionalni rad po pristupačnim cijenama.',
    h1: 'Freelanceri u Osijeku',
    intro:
      'Osijek ima izuzetno aktivnu IT i kreativnu zajednicu, posebno povezanu s FERIT-om i Osječkim softverskim klubom. Na Cenneru pronalaziš osječke freelancere koji nude profesionalan rad po vrlo konkurentnim cijenama u odnosu na zagrebačko tržište.',
    extra:
      'Slavonski freelanceri poznati su po <strong>jakoj radnoj etici i fer cijenama</strong>. Mnogi rade i za inozemne klijente, što znači visoku razinu profesionalizma uz lokalnu dostupnost i razumijevanje hrvatskog tržišta.',
  },
];

// ---- shared template ----
function pageHTML({
  url, title, description, keyword, h1, body, jsonLd,
}) {
  return `<!DOCTYPE html>
<html lang="hr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${keyword}, freelance hrvatska, honorarni posao, cenner">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<meta name="author" content="Cenner">
<meta name="geo.region" content="HR">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="hr-HR" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${OG}">
<meta property="og:locale" content="hr_HR">
<meta property="og:site_name" content="Cenner">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${OG}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
  *{box-sizing:border-box}
  body{margin:0;font-family:'Inter',sans-serif;background:#050505;color:#f3f4f6;line-height:1.6;-webkit-font-smoothing:antialiased}
  a{color:#4ade80;text-decoration:none}
  a:hover{text-decoration:underline}
  header{padding:20px 24px;border-bottom:1px solid #ffffff14;display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto}
  .logo{font-weight:800;font-size:20px;color:#fff}
  .logo span{color:#4ade80}
  nav a{color:#d1d5db;margin-left:24px;font-size:14px;font-weight:500}
  main{max-width:880px;margin:0 auto;padding:64px 24px 96px}
  h1{font-size:44px;font-weight:800;line-height:1.05;margin:0 0 24px;letter-spacing:-0.02em}
  h2{font-size:28px;font-weight:700;margin:48px 0 16px;letter-spacing:-0.01em}
  p{font-size:17px;color:#d1d5db;margin:0 0 16px}
  strong{color:#fff}
  .lead{font-size:19px;color:#e5e7eb;margin-bottom:32px}
  .cta{display:inline-block;background:linear-gradient(135deg,#4ade80,#22c55e);color:#0a0a0a;padding:14px 28px;border-radius:14px;font-weight:700;margin:8px 12px 8px 0;box-shadow:0 0 24px rgba(74,222,128,0.25)}
  .cta:hover{text-decoration:none;transform:translateY(-1px)}
  .cta-secondary{background:transparent;color:#fff;border:1px solid #ffffff33}
  .related{margin-top:64px;padding-top:32px;border-top:1px solid #ffffff14}
  .related h3{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 16px}
  .related ul{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
  .related li{padding:14px 18px;border:1px solid #ffffff14;border-radius:12px;transition:border-color 0.2s}
  .related li:hover{border-color:#4ade8055}
  footer{border-top:1px solid #ffffff14;padding:32px 24px;text-align:center;color:#6b7280;font-size:14px;max-width:1200px;margin:0 auto}
  footer a{color:#9ca3af;margin:0 12px}
  @media (max-width:640px){
    h1{font-size:32px}
    h2{font-size:22px}
    nav a{display:none}
    nav a:first-child{display:inline-block}
  }
</style>
</head>
<body>
<header>
  <a href="/" class="logo">cenner<span>.</span></a>
  <nav>
    <a href="/marketplace">Marketplace</a>
    <a href="/services">Usluge</a>
    <a href="/blog">Blog</a>
    <a href="/about">O nama</a>
  </nav>
</header>
<main>
${body}
</main>
<footer>
  <div>
    <a href="/">Naslovna</a>
    <a href="/marketplace">Marketplace</a>
    <a href="/services">Usluge</a>
    <a href="/blog">Blog</a>
    <a href="/about">O nama</a>
    <a href="/contact">Kontakt</a>
    <a href="/privacy">Privatnost</a>
    <a href="/terms">Uvjeti</a>
  </div>
  <div style="margin-top:16px">© Cenner — Freelance Platforma Hrvatska</div>
</footer>
</body>
</html>
`;
}

function serviceBody(svc) {
  const sectionsHTML = svc.sections
    .map((s) => `<h2>${s.h2}</h2>${s.body.map((p) => `<p>${p}</p>`).join('\n')}`)
    .join('\n');
  const relatedHTML = svc.related
    .map((slug) => {
      const r = services.find((x) => x.slug === slug);
      return r ? `<li><a href="/usluge/${r.slug}">${r.h1}</a></li>` : '';
    })
    .join('\n');
  return `<h1>${svc.h1}</h1>
<p class="lead">${svc.intro}</p>
<p>
  <a href="/marketplace" class="cta">Pronađi freelancera</a>
  <a href="/services" class="cta cta-secondary">Pregledaj sve usluge</a>
</p>
${sectionsHTML}
<h2>Spreman za početak?</h2>
<p>Cenner ti pomaže pronaći pravog freelancera u par minuta. Bez agencijskih marži, bez skrivenih troškova, uz osigurano plaćanje.</p>
<p>
  <a href="/marketplace" class="cta">Istraži marketplace</a>
  <a href="/auth" class="cta cta-secondary">Otvori račun</a>
</p>
<div class="related">
  <h3>Povezane usluge</h3>
  <ul>${relatedHTML}</ul>
</div>`;
}

function cityBody(city) {
  const otherCities = cities
    .filter((c) => c.slug !== city.slug)
    .map((c) => `<li><a href="/freelanceri/${c.slug}">Freelanceri ${c.name}</a></li>`)
    .join('\n');
  return `<h1>${city.h1}</h1>
<p class="lead">${city.intro}</p>
<p>
  <a href="/marketplace" class="cta">Pronađi freelancera u ${city.name}u</a>
  <a href="/services" class="cta cta-secondary">Pregledaj usluge</a>
</p>
<h2>Što čini ${city.name} jakim freelance tržištem?</h2>
<p>${city.extra}</p>
<h2>Najtraženije kategorije u ${city.name}u</h2>
<ul>
  <li><a href="/usluge/izrada-web-stranica">Izrada web stranica</a></li>
  <li><a href="/usluge/dizajn-loga">Dizajn loga i vizualnog identiteta</a></li>
  <li><a href="/usluge/seo-optimizacija">SEO optimizacija</a></li>
  <li><a href="/usluge/digitalni-marketing">Digitalni marketing</a></li>
  <li><a href="/usluge/wordpress-izrada">WordPress izrada</a></li>
</ul>
<h2>Kako Cenner radi?</h2>
<p>Klikni "Pronađi freelancera", opiši svoj projekt u par rečenica, i naš AI ti predlaže najprikladnije kandidate iz ${city.name}a i okolice. Pregledaj njihove portfolije, ocjene i prethodne radove. Plaćanje je osigurano kroz escrow — plaćaš tek kad si zadovoljan.</p>
<p>
  <a href="/marketplace" class="cta">Započni sad</a>
</p>
<div class="related">
  <h3>Freelanceri u drugim gradovima</h3>
  <ul>${otherCities}</ul>
</div>`;
}

function serviceJsonLd(svc, url) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: svc.h1,
      description: svc.description,
      provider: {
        '@type': 'Organization',
        name: 'Cenner',
        url: BASE,
      },
      areaServed: { '@type': 'Country', name: 'Croatia' },
      url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Naslovna', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Usluge', item: `${BASE}/services` },
        { '@type': 'ListItem', position: 3, name: svc.h1, item: url },
      ],
    },
  ];
}

function cityJsonLd(city, url) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: `Cenner — Freelanceri ${city.name}`,
      description: city.description,
      url,
      areaServed: { '@type': 'City', name: city.name },
      address: {
        '@type': 'PostalAddress',
        addressLocality: city.name,
        addressCountry: 'HR',
      },
      parentOrganization: { '@type': 'Organization', name: 'Cenner', url: BASE },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Naslovna', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Freelanceri', item: `${BASE}/marketplace` },
        { '@type': 'ListItem', position: 3, name: city.name, item: url },
      ],
    },
  ];
}

async function writePage(path, html) {
  const full = join(PUBLIC_DIR, path);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, html, 'utf-8');
  console.log(`✓ ${path}`);
}

async function main() {
  for (const svc of services) {
    const url = `${BASE}/usluge/${svc.slug}`;
    const html = pageHTML({
      url,
      title: svc.title,
      description: svc.description,
      keyword: svc.keyword,
      h1: svc.h1,
      body: serviceBody(svc),
      jsonLd: serviceJsonLd(svc, url),
    });
    await writePage(`usluge/${svc.slug}/index.html`, html);
  }
  for (const city of cities) {
    const url = `${BASE}/freelanceri/${city.slug}`;
    const html = pageHTML({
      url,
      title: city.title,
      description: city.description,
      keyword: `freelanceri ${city.name.toLowerCase()}`,
      h1: city.h1,
      body: cityBody(city),
      jsonLd: cityJsonLd(city, url),
    });
    await writePage(`freelanceri/${city.slug}/index.html`, html);
  }
  console.log(`\nGenerated ${services.length} service pages and ${cities.length} city pages.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
