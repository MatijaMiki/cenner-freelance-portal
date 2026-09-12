#!/usr/bin/env node
/**
 * Prerenders per-route <head> metadata for the static SPA routes.
 *
 * WHY: vercel.json rewrites /:path* -> /index.html, so every SPA route shipped
 * byte-identical raw HTML — same <title>, same description, and (since the
 * 2026-07-13 canonical fix) NO canonical at all. Google saw 13 sitemap URLs
 * with indistinguishable markup and no user-selected canonical, and clustered
 * them: GSC "Duplicate without user-selected canonical".
 *
 * react-helmet sets the right tags, but only after JS runs — too late for the
 * pre-render pass that decides canonicalisation. So we bake the same values
 * into a per-route copy of the shell. Vercel matches the file on the
 * filesystem before applying the SPA rewrite (same mechanism the /usluge/*
 * landing pages already rely on), the router still boots from
 * location.pathname, and helmet then reconciles to identical values.
 *
 * NOT applied to dist/index.html: that file is also the catch-all fallback for
 * /service/:id, /freelancer/:id and /blog/:slug. A canonical there would
 * re-point every dynamic page at the homepage — precisely the bug removed on
 * 2026-07-13. Those routes need real SSR; leaving them canonical-free is
 * correct-by-omission until then.
 *
 * Run: node scripts/prerender-static-routes.mjs   (after `vite build`)
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const BASE = 'https://cenner.hr';

// Titles/descriptions mirror what components/SEO.tsx renders for each page, so
// the pre-render and post-render heads agree. SEO.tsx formats as `${title} | Cenner`.
const ROUTES = [
  {
    path: '/marketplace',
    title: 'Marketplace — Freelanceri Hrvatska | Cenner',
    description:
      'Pronađi verificirane freelancere u Hrvatskoj i EU na Cenner marketplaceu. Web razvoj, dizajn, marketing, pisanje i više — honorarni posao na jednom mjestu.',
  },
  {
    path: '/services',
    title: 'Usluge — Web Razvoj, Dizajn i Marketing Hrvatska | Cenner',
    description:
      'Freelance usluge u Hrvatskoj i EU: web razvoj, grafički dizajn, digitalni marketing, AI razvoj, video produkcija. Verificirani freelanceri, sigurno plaćanje, zajamčena kvaliteta.',
  },
  {
    path: '/match',
    title: 'Job Matching | Cenner',
    description:
      'AI-powered job matching is coming soon to Cenner. Sign up to be the first to try it.',
    noIndex: true, // pages/Match.tsx passes noIndex — keep raw HTML consistent
  },
  {
    path: '/subscription',
    title: 'Pricing & Plans | Cenner',
    description:
      'Choose the Cenner plan that fits your needs. Free, Pro, and Ultra plans lower your commission and boost your visibility — with Enterprise for teams.',
  },
  {
    path: '/technology',
    title: 'Technology | Cenner',
    description:
      'Discover the technology stack powering Cenner — AI matching, real-time collaboration, and secure infrastructure built for elite freelance work.',
  },
  {
    path: '/blog',
    title: 'Blog — Freelance Savjeti i Vodiči | Cenner',
    description:
      'Vodiči, savjeti i vijesti o freelancingu u Hrvatskoj i EU. Otvaranje paušalnog obrta, ugovori, cijene, alati i sve ostalo što trebate znati kao slobodni radnik.',
  },
  {
    path: '/about',
    title: 'O Nama — Freelance Platforma Hrvatska | Cenner',
    description:
      'Cenner je hrvatska freelance platforma osnovana s misijom povezivanja tvrtki s najboljim slobodnim radnicima iz Hrvatske i EU. Saznaj više o nama i našoj viziji.',
  },
  {
    path: '/contact',
    title: 'Contact | Cenner',
    description:
      "Get in touch with the Cenner team. We're here to help you find elite freelance talent or answer any questions about the platform.",
  },
  {
    path: '/auth',
    title: 'Login / Sign Up | Cenner',
    description:
      'Sign in or create your Cenner account to access elite freelance talent and premium collaboration tools.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Cenner',
    description:
      "Cenner's privacy policy. Learn how we collect, use, and protect your personal data on our freelance talent platform.",
  },
  {
    path: '/terms',
    title: 'Terms of Service | Cenner',
    description:
      "Cenner's terms of service. Read the terms and conditions governing the use of our freelance talent marketplace.",
  },
  {
    // Written LAST, and it overwrites dist/index.html itself — see the note in main().
    // Mirrors the props pages/Home.tsx passes to <SEO canonical="/">, so the raw and
    // hydrated heads agree. api/render.js strips this canonical back out when it uses
    // the same file as its shell for an entity page.
    path: '/',
    title: 'Freelance Hrvatska — Pronađi Freelancera | Cenner',
    description:
      'Cenner — vodeća freelance platforma u Hrvatskoj. Pronađi provjerene freelancere za izradu web stranica, dizajn, marketing i razvoj. Honorarni posao brzo i sigurno.',
  },
  {
    path: '/cookies',
    title: 'Cookie Policy | Cenner',
    description:
      'Learn how Cenner uses cookies and similar technologies to improve your experience on our platform.',
  },
];

const escapeAttr = (s) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Replace an existing tag if present, otherwise leave the HTML untouched. */
function replaceTag(html, pattern, replacement, label, route) {
  if (!pattern.test(html)) {
    throw new Error(
      `prerender: could not find ${label} in dist/index.html while building ${route}. ` +
        'The shell head changed — update scripts/prerender-static-routes.mjs.'
    );
  }
  return html.replace(pattern, () => replacement);
}

function buildRouteHtml(shell, route) {
  const url = `${BASE}${route.path}`;
  const title = escapeText(route.title);
  const titleAttr = escapeAttr(route.title);
  const descAttr = escapeAttr(route.description);

  let html = shell;

  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, '<title>', route.path);

  html = replaceTag(
    html,
    /<meta name="description" content="[\s\S]*?"\s*\/>/,
    `<meta name="description" content="${descAttr}" />`,
    'description meta',
    route.path
  );

  html = replaceTag(
    html,
    /<meta property="og:title" content="[\s\S]*?"\s*\/>/,
    `<meta property="og:title" content="${titleAttr}" />`,
    'og:title',
    route.path
  );

  html = replaceTag(
    html,
    /<meta property="og:description" content="[\s\S]*?"\s*\/>/,
    `<meta property="og:description" content="${descAttr}" />`,
    'og:description',
    route.path
  );

  html = replaceTag(
    html,
    /<meta name="twitter:title" content="[\s\S]*?"\s*\/>/,
    `<meta name="twitter:title" content="${titleAttr}" />`,
    'twitter:title',
    route.path
  );

  html = replaceTag(
    html,
    /<meta name="twitter:description" content="[\s\S]*?"\s*\/>/,
    `<meta name="twitter:description" content="${descAttr}" />`,
    'twitter:description',
    route.path
  );

  // The canonical block is what actually resolves the GSC duplicate cluster:
  // each route now nominates itself instead of leaving Google to guess.
  const robots = route.noIndex
    ? '<meta name="robots" content="noindex, nofollow" />'
    : '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />';

  const head = [
    robots,
    `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" hreflang="hr-HR" href="${url}" />`,
    `<link rel="alternate" hreflang="x-default" href="${url}" />`,
    `<meta property="og:url" content="${url}" />`,
  ].join('\n    ');

  html = replaceTag(html, /<meta name="robots" content="[\s\S]*?"\s*\/>/, head, 'robots meta', route.path);

  return html;
}

async function main() {
  const shellPath = join(DIST, 'index.html');
  let shell;
  try {
    shell = await readFile(shellPath, 'utf8');
  } catch {
    throw new Error(`prerender: ${shellPath} not found — run \`vite build\` first.`);
  }

  // '/' writes dist/index.html — the very file `shell` was read from above. The read
  // already happened, so this cannot contaminate the other routes, but process it last
  // so that stays true if anyone later moves the read inside the loop.
  const ordered = [...ROUTES].sort((a, b) => (a.path === '/' ? 1 : 0) - (b.path === '/' ? 1 : 0));

  for (const route of ordered) {
    const outDir = join(DIST, route.path.replace(/^\//, ''));
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'index.html'), buildRouteHtml(shell, route), 'utf8');
    console.log(`  prerendered ${route.path}${route.noIndex ? '  (noindex)' : ''}`);
  }

  console.log(`prerender: wrote ${ROUTES.length} route shells with self-referencing canonicals`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
