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
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sortedBlogPosts } from '../content/blog/posts.mjs';
import { matchMdRoute, mdPathOf } from '../lib/md/routes.mjs';
import { AI_SUMMARIES } from '../lib/md/summaries.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const BASE = 'https://cenner.hr';

const escapeAttr = (s) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- blog ----
// Posts from content/blog/posts.mjs get a shell each, like the routes below, plus the
// article itself as the page text and BlogPosting JSON-LD. The same file wins over the
// vercel.json /blog/:slug rewrite to api/render.js, which stays in front of CMS posts only.
// Keep the copy in step with pages/Blog.tsx and pages/BlogPost.tsx.

const BLOG_INDEX_DESCRIPTION =
  'Vodiči za klijente i freelancere u Hrvatskoj: izrada web stranica, odabir web developera, cijene SEO optimizacije, dizajn loga i kako početi s freelanceom.';

const BLOG_CSS = `<style>
.cb{max-width:760px;font-size:19px;line-height:1.7;color:#1d2026}
.cb h2{font-size:32px;font-weight:800;line-height:1.1;margin:56px 0 16px;padding-top:20px;border-top:2px solid #0b0c0e;color:#0b0c0e}
.cb h3{font-size:24px;font-weight:800;margin:40px 0 12px;color:#0b0c0e}
.cb p{margin:0 0 20px}.cb ul,.cb ol{margin:0 0 20px;padding-left:24px}.cb li{margin:0 0 8px}
.cb a{color:#002ca5}.cb strong{color:#0b0c0e}
</style>`;

const fmtDateHr = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('hr-HR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

const markdownToHtml = (md) => renderToStaticMarkup(createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, md));

function blogIndexBody() {
  const items = sortedBlogPosts()
    .map(
      (p) => `<li style="margin:0 0 32px;"><a href="/blog/${p.slug}" style="font-size:24px;font-weight:800;color:#0b0c0e;text-decoration:none;">${escapeText(p.title)}</a>
          <p style="margin:8px 0 0;color:#5d6470;line-height:1.6;">${escapeText(p.excerpt)}</p></li>`
    )
    .join('\n        ');
  return `<main style="max-width:1100px;margin:0 auto;padding:80px 24px;font-family:Inter,sans-serif;color:#0b0c0e;">
        <h1 style="font-size:56px;font-weight:800;line-height:1.05;margin:0 0 24px;">Blog</h1>
        <p style="font-size:20px;line-height:1.6;color:#5d6470;max-width:720px;margin:0 0 56px;">Vodiči za klijente i freelancere u Hrvatskoj.</p>
        <ul style="list-style:none;padding:0;margin:0;">
        ${items}
        </ul>
      </main>`;
}

function blogPostBody(post, others) {
  const more = others
    .map((p) => `<li style="margin:0 0 12px;"><a href="/blog/${p.slug}" style="color:#002ca5;">${escapeText(p.title)}</a></li>`)
    .join('');
  return `<main style="max-width:1100px;margin:0 auto;padding:56px 24px 80px;font-family:Inter,sans-serif;color:#0b0c0e;">
        ${BLOG_CSS}
        <p style="margin:0 0 40px;"><a href="/blog" style="color:#0b0c0e;font-weight:700;">← Blog</a></p>
        <article>
          <h1 style="font-size:52px;font-weight:800;line-height:1.02;margin:0 0 28px;max-width:960px;">${escapeText(post.title)}</h1>
          <p style="font-size:21px;line-height:1.5;max-width:640px;margin:0 0 28px;">${escapeText(post.excerpt)}</p>
          <p style="border-top:2px solid #0b0c0e;border-bottom:2px solid #0b0c0e;padding:14px 0;margin:0 0 40px;font-size:15px;color:#5d6470;"><strong style="color:#0b0c0e;">${escapeText(post.author)}</strong> · <time datetime="${post.publishedAt}">${fmtDateHr(post.publishedAt)}</time></p>
          <div class="cb">${markdownToHtml(post.content)}</div>
        </article>
        <aside style="margin-top:80px;border-top:2px solid #0b0c0e;padding-top:24px;">
          <p style="font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#5d6470;margin:0 0 16px;">Više s bloga</p>
          <ul style="list-style:none;padding:0;margin:0;">${more}</ul>
        </aside>
      </main>`;
}

function blogPostJsonLd(post) {
  const url = `${BASE}/blog/${post.slug}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      inLanguage: 'hr',
      keywords: post.keywords.join(', '),
      wordCount: post.content.trim().split(/\s+/).length,
      author: { '@type': 'Organization', name: 'Cenner', url: BASE },
      publisher: {
        '@type': 'Organization',
        name: 'Cenner',
        url: BASE,
        logo: { '@type': 'ImageObject', url: `${BASE}/favicon.svg` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Početna', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
  ];
}

const blogPostRoutes = () => {
  const posts = sortedBlogPosts();
  return posts.map((post) => ({
    path: `/blog/${post.slug}`,
    title: `${post.seoTitle || post.title} | Cenner`,
    description: post.description,
    ogType: 'article',
    jsonLd: blogPostJsonLd(post),
    body: blogPostBody(post, posts.filter((p) => p.slug !== post.slug).slice(0, 3)),
  }));
};

// Titles/descriptions mirror what components/SEO.tsx renders for each page, so
// the pre-render and post-render heads agree. SEO.tsx formats as `${title} | Cenner`.
const ROUTES = [
  {
    path: '/marketplace',
    title: 'Marketplace: Freelanceri Hrvatska | Cenner',
    description:
      'Pronađi verificirane freelancere u Hrvatskoj i EU na Cenner marketplaceu. Web razvoj, dizajn, marketing, pisanje i više. Honorarni posao na jednom mjestu.',
  },
  {
    path: '/services',
    title: 'Izrada web stranica, aplikacija i automatizacija | Cenner',
    description:
      'Cenner izrađuje web stranice, WordPress, SaaS i CRM sustave, n8n automatizacije, grafički dizajn i oglase te postavlja servere i hosting. Fiksna cijena, izravna komunikacija.',
  },
  {
    path: '/subscription',
    title: 'Pricing & Plans | Cenner',
    description:
      'Choose the Cenner plan that fits your needs. Free, Pro, and Ultra plans lower your commission and boost your visibility, with Enterprise for teams.',
  },
  {
    path: '/ranwhat',
    title: 'ranwhat: AI Agent Security by Cenner | Cenner',
    description:
      'ranwhat is a flight recorder for AI coding agents and a scanner for the authority they hold. Built and operated by Cenner, Zagreb.',
    // The page's own text, so the first byte already says what the page says (keep in step with pages/Ranwhat.tsx).
    body: `<main style="max-width:1024px;margin:0 auto;padding:80px 24px;font-family:Inter,sans-serif;color:#0b0c0e;">
        <p style="font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1b7a3e;margin:0 0 16px;">A Cenner product</p>
        <h1 style="font-size:56px;font-weight:800;line-height:1.05;margin:0 0 24px;">ranwhat</h1>
        <p style="font-size:20px;line-height:1.6;color:#5d6470;max-width:760px;margin:0 0 32px;">A flight recorder for AI agents, and a scanner for the authority they hold. ranwhat reads what coding agents such as Claude Code actually ran on your machine and surfaces the irreversible actions worth knowing about: credentials read, bulk deletions, force pushes, packages published.</p>
        <p style="margin:0 0 56px;"><a href="https://ranwhat.com" style="display:inline-block;background:#002ca5;color:#fff;padding:14px 28px;text-decoration:none;font-weight:800;">ranwhat.com</a></p>
        <h2 style="font-size:30px;font-weight:800;margin:0 0 24px;">Pricing</h2>
        <h3 style="font-size:20px;margin:0;">Free</h3><p style="margin:4px 0 8px;font-weight:700;color:#1b7a3e;">Free, forever</p><p style="margin:0 0 24px;color:#5d6470;">The open-source scanner and watcher (MIT licence). Runs on one machine, no account, no telemetry, nothing sent to us.</p>
        <h3 style="font-size:20px;margin:0;">Plus</h3><p style="margin:4px 0 8px;font-weight:700;color:#1b7a3e;">€12 / month or €120 / year</p><p style="margin:0 0 24px;color:#5d6470;">Subscription to the capability catalogue feed at feed.ranwhat.com, so the scanner knows the scopes providers have added since your version shipped. One flat price per organisation, VAT included.</p>
        <h3 style="font-size:20px;margin:0;">Team</h3><p style="margin:4px 0 8px;font-weight:700;color:#1b7a3e;">Annual, on request</p><p style="margin:0 0 24px;color:#5d6470;">Tamper-evident records and long-term retention. Being built, not available yet.</p>
        <p style="margin:0 0 56px;color:#5d6470;">Full details on <a href="https://ranwhat.com/pricing" style="color:#002ca5;">ranwhat.com/pricing</a>.</p>
        <h2 style="font-size:24px;font-weight:800;margin:0 0 16px;">Billing, cancellation and refunds</h2>
        <ul style="color:#5d6470;line-height:1.7;margin:0 0 56px;padding-left:20px;">
          <li>Payments are processed by Stripe through its Link checkout; Stripe issues receipts and invoices and collects any VAT.</li>
          <li>Plus renews automatically each month or year and can be cancelled any time; it then runs to the end of the paid period.</li>
          <li>Full refund on request within 14 days of the first payment, no reason needed. Renewals after that are not refunded.</li>
        </ul>
        <h2 style="font-size:24px;font-weight:800;margin:0 0 16px;">Who runs it</h2>
        <p style="color:#5d6470;line-height:1.7;margin:0 0 12px;">Cenner, obrt za računalno programiranje i ostale usluge, vl. Matija Mikulinec<br />Mikulinci 8, 10010 Zagreb, Croatia<br />OIB 23152585818 · MB 99210363</p>
        <p style="color:#5d6470;line-height:1.7;margin:0;"><a href="mailto:hello@ranwhat.com" style="color:#002ca5;">hello@ranwhat.com</a><br /><a href="tel:+385993525500" style="color:#002ca5;">+385 99 352 5500</a></p>
      </main>`,
  },
  {
    path: '/blog',
    title: 'Blog: Vodiči za Klijente i Freelancere | Cenner',
    description: BLOG_INDEX_DESCRIPTION,
    body: blogIndexBody(),
  },
  {
    path: '/community',
    title: 'Community Hub | Cenner',
    description:
      'Diskutirajte, dijelite iskustva i postavljajte pitanja s drugim freelancerima i klijentima u Cenner zajednici.',
  },
  {
    path: '/about',
    title: 'O nama i kontakt | Cenner',
    description:
      'Cenner je hrvatska freelance platforma i vlastiti studio za web stranice, aplikacije i automatizacije. Kontakt, adresa i podaci o tvrtki.',
  },
  {
    path: '/auth',
    noIndex: true, // a sign-in form, not a page to rank (SEO page map)
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
    title: 'Izrada web stranica i freelance Hrvatska | Cenner',
    description:
      'Cenner: profesionalna izrada web stranica i web rješenja po pristupačnoj cijeni, plus provjereni freelanceri u Hrvatskoj za dizajn, marketing i razvoj.',
  },
  {
    path: '/onboarding',
    title: 'Početak rada: Otvaranje paušalnog obrta | Cenner',
    description:
      'Vodič kroz pravne korake potrebne za freelance rad u Hrvatskoj. Saznaj kako otvoriti paušalni obrt i započeti suradnju kroz Cenner.',
  },
  {
    path: '/cookies',
    title: 'Cookie Policy | Cenner',
    description:
      'Learn how Cenner uses cookies and similar technologies to improve your experience on our platform.',
  },
  {
    path: '/cjenik',
    title: 'Cjenik | Cenner',
    description:
      'Cjenik usluga koje naplaćuje Cenner (planovi, naknade, izrada web stranica, ranwhat) s cijenom na referentni datum, te strojno čitljivi cjenik u .csv obliku.',
  },
  ...blogPostRoutes(),
];

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
    // For AI agents, matching components/SEO.tsx: a one-line summary and the markdown version.
    ...(route.noIndex
      ? []
      : [`<meta name="ai-summary" content="${escapeAttr(AI_SUMMARIES[route.path] || route.description)}" />`]),
    ...(!route.noIndex && matchMdRoute(route.path)
      ? [`<link rel="alternate" type="text/markdown" href="${BASE}${mdPathOf(route.path)}" />`]
      : []),
  ].join('\n    ');

  html = replaceTag(html, /<meta name="robots" content="[\s\S]*?"\s*\/>/, head, 'robots meta', route.path);

  if (route.ogType) {
    html = replaceTag(html, /<meta property="og:type" content="[\s\S]*?"\s*\/>/, `<meta property="og:type" content="${route.ogType}" />`, 'og:type', route.path);
  }

  // JSON-LD for this page goes after the shell's own blocks. "<" is escaped so text can never close the tag.
  if (route.jsonLd) {
    const blocks = route.jsonLd
      .map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`)
      .join('\n');
    html = replaceTag(html, /<\/head>/, `${blocks}\n</head>`, '</head>', route.path);
  }

  // Routes that have their own page text swap the shell's homepage copy for it (same words the page renders).
  if (route.body) {
    html = replaceTag(html, /<main style="max-width:1100px[\s\S]*?<\/main>/, route.body, 'shell <main>', route.path);
  }

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
