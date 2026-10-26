// Generates static SEO landing pages for /usluge/* and /freelanceri/*.
// Output goes to public/, which Vite copies to dist/ at build time.
// Vercel serves the static .html before applying SPA rewrites.
//
// Run: node scripts/generate-landing-pages.mjs

import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sortedBlogPosts } from '../content/blog/posts.mjs';
import { services, cities } from '../content/landing/pages.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');
const BASE = 'https://cenner.hr';
const OG = `${BASE}/og-image.png`;
// The site's mark (the halftone orb), inlined from the favicon so these pages always match it.
const MARK = readFileSync(join(PUBLIC_DIR, 'favicon.svg'), 'utf8')
  .trim().replace('<svg ', '<svg width="36" height="36" aria-hidden="true" ');

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
<meta name="ai-summary" content="${description}">
<link rel="alternate" type="text/markdown" href="${url}.md">
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;700;800;900&family=Press+Start+2P&display=swap">
<meta name="theme-color" content="#eef0f3">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
  *{box-sizing:border-box}
  :root{--paper:#eef0f3;--paper2:#e2e5ea;--ink:#0b0c0e;--slate:#5d6470;--sky:#002ca5}
  body{margin:0;font-family:'Libre Franklin',system-ui,sans-serif;background:var(--paper);color:var(--ink);line-height:1.6;-webkit-font-smoothing:antialiased}
  a{color:var(--sky);text-decoration:underline;text-underline-offset:3px}
  a:hover{color:var(--ink)}
  a:focus-visible,button:focus-visible{outline:3px solid var(--sky);outline-offset:3px}
  .bar{position:sticky;top:0;z-index:10;background:var(--paper)}
  .bar-in{max-width:1400px;margin:0 auto;padding:0 24px;height:72px;display:flex;align-items:center;justify-content:space-between;gap:16px}
  .logo{display:flex;align-items:center;gap:14px;color:var(--ink);text-decoration:none}
  .logo:hover{color:var(--ink)}
  .logo svg{flex:none;display:block}
  /* the wordmark in the pixel face on the same green strip as the site's nav logo, fading out to the right */
  .logo span{font-family:'Press Start 2P',monospace;font-size:15px;line-height:1;padding:10px 34px 10px 8px;margin-left:-6px;-webkit-text-stroke:.8px currentColor;
    background:linear-gradient(90deg,rgba(34,197,94,.9),rgba(74,222,128,.9) 55%,rgba(74,222,128,0) 90%)}
  .bar nav{display:flex;align-items:center;gap:4px}
  .bar nav a{color:#0b0c0eb0;text-decoration:none;font-size:14px;font-weight:700;padding:6px 10px;border:2px solid transparent;white-space:nowrap;transition:transform .1s,box-shadow .1s,background-color .1s}
  .bar nav a:hover,.bar nav a:focus-visible{color:var(--ink);border-color:var(--ink);background:#fff;box-shadow:3px 3px 0 0 var(--ink);transform:translate(-1px,-1px)}
  .bar nav a.login{background:var(--sky);color:#fff;border-color:var(--ink);padding:10px 18px;margin-left:8px}
  .bar nav a.login:hover,.bar nav a.login:focus-visible{background:var(--sky);color:#fff}
  main{max-width:1400px;margin:0 auto;padding:48px 24px 96px}
  h1{font-size:clamp(2rem,9vw,6.5rem);hyphens:auto;-webkit-hyphens:auto;font-weight:800;line-height:0.94;margin:0 0 32px;letter-spacing:-0.035em;text-transform:uppercase;max-width:16ch;overflow-wrap:break-word}
  main>*:not(h1):not(.related):not(.cta-row){max-width:46rem}
  h2{font-size:clamp(1.625rem,1.2rem+1.6vw,2.5rem);font-weight:800;line-height:1.05;margin:56px 0 16px;padding-top:20px;border-top:2px solid var(--ink);letter-spacing:-0.025em}
  p{font-size:18px;color:#1d2126;margin:0 0 16px}
  strong{color:var(--ink);font-weight:700}
  .lead{font-size:clamp(1.25rem,1.1rem+0.7vw,1.625rem);line-height:1.4;color:var(--ink);margin-bottom:32px}
  .cta-row{margin:0 0 8px}
  .cta{display:inline-block;background:var(--sky);color:#fff;padding:16px 28px;border:2px solid var(--sky);font-weight:700;font-size:16px;margin:8px 12px 8px 0;text-decoration:none;transition:background .15s,color .15s,border-color .15s}
  .cta:hover{background:var(--ink);border-color:var(--ink);color:#fff}
  .cta-secondary{background:transparent;color:var(--ink);border-color:var(--ink)}
  .cta-secondary:hover{background:var(--ink);color:#fff}
  main>ul{list-style:none;padding:0;margin:0 0 16px}
  main>ul li{border-top:1px solid #0b0c0e33;padding:12px 0;font-weight:700;font-size:18px}
  main>ul li:last-child{border-bottom:1px solid #0b0c0e33}
  .related{max-width:none;margin-top:72px;padding-top:24px;border-top:2px solid var(--ink)}
  .related h3{font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:var(--slate);margin:0 0 16px}
  .related ul{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
  .related li{background:#fff;border:2px solid var(--ink);transition:transform .15s,box-shadow .15s}
  .related li:hover{transform:translate(-3px,-3px);box-shadow:6px 6px 0 0 var(--ink)}
  .related li a{display:block;padding:16px 18px;color:var(--ink);font-weight:700;text-decoration:none}
  .related li a:hover{color:var(--sky)}
  .related li small{display:block;margin-top:4px;font-weight:400;font-size:14px;color:var(--slate)}
  footer{background:var(--ink);color:#ffffffb3;padding:40px 24px;font-size:14px}
  .foot{max-width:1400px;margin:0 auto}
  footer a{color:#fff;text-decoration:none;display:inline-block;margin:0 20px 8px 0;font-weight:500}
  footer a:hover{text-decoration:underline;color:#fff}
  footer a:focus-visible{outline:3px solid #fff;outline-offset:3px;text-decoration:underline}
  .copy{margin-top:16px}
  @media (max-width:760px){
    .bar nav a:not(.login){display:none}
    .bar-in{padding:0 16px}
    .logo span{padding-right:18px}
    .bar nav a.login{padding:10px 14px;margin-left:0}
    .bar nav a.login .long{display:none}
    h1{max-width:none}
    p{font-size:17px}
  }
</style>
</head>
<body>
<div class="bar"><div class="bar-in">
  <a href="/" class="logo" aria-label="Cenner">${MARK}<span>CENNER</span></a>
  <nav>
    <a href="/marketplace">Marketplace</a>
    <a href="/services">Usluge</a>
    <a href="/blog">Blog</a>
    <a href="/about">O nama</a>
    <a href="/auth" class="login">Prijava<span class="long"> / Registracija</span></a>
  </nav>
</div></div>
<main>
${body}
</main>
<footer>
  <div class="foot">
    <div>
      <a href="/">Naslovna</a>
      <a href="/marketplace">Marketplace</a>
      <a href="/services">Usluge</a>
      <a href="/blog">Blog</a>
      <a href="/about">O nama</a>
      <a href="/about#kontakt">Kontakt</a>
      <a href="/privacy">Privatnost</a>
      <a href="/terms">Uvjeti</a>
    </div>
    <div class="copy">© Cenner, Freelance Platforma Hrvatska</div>
  </div>
</footer>
</body>
</html>
`;
}

// Cross-links to Cenner's own products on their subdomains (never the vercel.app hosts).
const TOOLS_HTML = `<div class="related">
  <h3>Cenner alati</h3>
  <ul>
    <li><a href="https://links.cenner.hr">Cenner Links<small>Link-in-bio stranica za kreatore: sve tvoje poveznice na jednom mjestu.</small></a></li>
    <li><a href="https://shorten.cenner.hr">Shorten<small>Skraćivač poveznica s brojanjem klikova po državama.</small></a></li>
  </ul>
</div>`;

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
  // Blog posts that name this page in `services` (content/blog/posts.mjs).
  const guides = sortedBlogPosts().filter((p) => p.services.includes(svc.slug));
  const guidesHTML = guides.length
    ? `<div class="related">
  <h3>Vodiči s bloga</h3>
  <ul>${guides.map((p) => `<li><a href="/blog/${p.slug}">${p.title}</a></li>`).join('\n')}</ul>
</div>
`
    : '';
  return `<h1>${svc.h1}</h1>
<p class="lead">${svc.intro}</p>
<p class="cta-row">
  <a href="/marketplace" class="cta">Pronađi freelancera</a>
  <a href="/services" class="cta cta-secondary">Pregledaj sve usluge</a>
</p>
${sectionsHTML}
<h2>Spreman za početak?</h2>
<p>Cenner ti pomaže pronaći pravog freelancera u par minuta. Bez agencijskih marži, bez skrivenih troškova, uz osigurano plaćanje.</p>
<p class="cta-row">
  <a href="/marketplace" class="cta">Istraži marketplace</a>
  <a href="/auth" class="cta cta-secondary">Otvori račun</a>
</p>
<div class="related">
  <h3>Povezane usluge</h3>
  <ul>${relatedHTML}</ul>
</div>
${guidesHTML}${TOOLS_HTML}`;
}

function cityBody(city) {
  const otherCities = cities
    .filter((c) => c.slug !== city.slug)
    .map((c) => `<li><a href="/freelanceri/${c.slug}">Freelanceri ${c.name}</a></li>`)
    .join('\n');
  return `<h1>${city.h1}</h1>
<p class="lead">${city.intro}</p>
<p class="cta-row">
  <a href="/marketplace" class="cta">Pronađi freelancera u ${city.loc}</a>
  <a href="/services" class="cta cta-secondary">Pregledaj usluge</a>
</p>
<h2>Što čini ${city.acc} jakim freelance tržištem?</h2>
<p>${city.extra}</p>
<h2>Najtraženije kategorije u ${city.loc}</h2>
<ul>
  <li><a href="/usluge/izrada-web-stranica">Izrada web stranica</a></li>
  <li><a href="/usluge/dizajn-loga">Dizajn loga i vizualnog identiteta</a></li>
  <li><a href="/usluge/seo-optimizacija">SEO optimizacija</a></li>
  <li><a href="/usluge/digitalni-marketing">Digitalni marketing</a></li>
  <li><a href="/usluge/wordpress-izrada">WordPress izrada</a></li>
  <li><a href="/usluge/web-developeri">Web developeri</a></li>
</ul>
<h2>Kako Cenner radi?</h2>
<p>Klikni "Pronađi freelancera", opiši svoj projekt u par rečenica, i naš AI ti predlaže najprikladnije kandidate iz ${city.gen} i okolice. Pregledaj njihove portfolije, ocjene i prethodne radove. Plaćanje je osigurano kroz escrow. Plaćaš tek kad si zadovoljan.</p>
<p class="cta-row">
  <a href="/marketplace" class="cta">Započni sad</a>
</p>
<div class="related">
  <h3>Freelanceri u drugim gradovima</h3>
  <ul>${otherCities}</ul>
</div>
${TOOLS_HTML}`;
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
      '@type': 'Service',
      name: `Freelanceri ${city.name}`,
      serviceType: 'Freelance usluge',
      description: city.description,
      url,
      areaServed: { '@type': 'City', name: city.name },
      provider: {
        '@type': 'Organization',
        name: 'Cenner',
        url: BASE,
        address: { '@type': 'PostalAddress', streetAddress: 'Mikulinci 8', postalCode: '10010', addressLocality: 'Zagreb', addressCountry: 'HR' },
      },
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
