#!/usr/bin/env node
/**
 * Generates public/sitemap.xml by merging:
 *   - static routes (hardcoded below)
 *   - dynamic blog posts  fetched from the live API
 *   - dynamic service listings fetched from the live API
 *
 * Usage:  node scripts/generate-sitemap.mjs
 * In CI:  add "node scripts/generate-sitemap.mjs" before the vite build step.
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://cenner.hr';
const API_BASE = 'https://api.cenner.hr';
const OUTPUT   = join(__dirname, '../public/sitemap.xml');
const TODAY    = new Date().toISOString().split('T')[0];

const STATIC_ROUTES = [
  { path: '/',             priority: '1.0', changefreq: 'weekly'  },
  { path: '/marketplace',  priority: '0.95', changefreq: 'daily'  },
  { path: '/services',     priority: '0.9',  changefreq: 'weekly' },
  { path: '/match',        priority: '0.9',  changefreq: 'weekly' },
  { path: '/subscription', priority: '0.85', changefreq: 'weekly' },
  { path: '/technology',   priority: '0.8',  changefreq: 'monthly'},
  { path: '/blog',         priority: '0.8',  changefreq: 'daily'  },
  { path: '/about',        priority: '0.75', changefreq: 'monthly'},
  { path: '/contact',      priority: '0.7',  changefreq: 'monthly'},
  { path: '/auth',         priority: '0.5',  changefreq: 'yearly' },
  { path: '/privacy',      priority: '0.3',  changefreq: 'yearly' },
  { path: '/terms',        priority: '0.3',  changefreq: 'yearly' },
  { path: '/cookies',      priority: '0.3',  changefreq: 'yearly' },
];

function urlEntry({ loc, lastmod = TODAY, changefreq = 'monthly', priority = '0.5' }) {
  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="hr"        href="${loc}" />
    <xhtml:link rel="alternate" hreflang="en"        href="${loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />
  </url>`;
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    console.warn(`[sitemap] Could not fetch ${url}: ${err.message}`);
    return [];
  }
}

async function main() {
  const entries = [];

  // Static routes
  for (const r of STATIC_ROUTES) {
    entries.push(urlEntry({ loc: `${BASE_URL}${r.path}`, changefreq: r.changefreq, priority: r.priority }));
  }

  // Dynamic: blog posts
  const posts = await fetchJson(`${API_BASE}/blog`);
  for (const post of posts) {
    if (!post.slug || post.published === false) continue;
    entries.push(urlEntry({
      loc: `${BASE_URL}/blog/${encodeURIComponent(post.slug)}`,
      lastmod: (post.updatedAt || post.publishedAt || TODAY).split('T')[0],
      changefreq: 'monthly',
      priority: '0.7',
    }));
  }

  // Dynamic: service listings
  const services = await fetchJson(`${API_BASE}/listings/public?limit=1000`);
  const list = Array.isArray(services) ? services : (services?.listings ?? []);
  for (const svc of list) {
    if (!svc.id) continue;
    entries.push(urlEntry({
      loc: `${BASE_URL}/service/${svc.id}`,
      lastmod: (svc.updatedAt || svc.createdAt || TODAY).split('T')[0],
      changefreq: 'weekly',
      priority: '0.65',
    }));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}
</urlset>
`;

  writeFileSync(OUTPUT, xml, 'utf8');
  console.log(`[sitemap] Written ${entries.length} URLs → ${OUTPUT}`);
}

main().catch(err => { console.error(err); process.exit(1); });
