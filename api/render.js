/**
 * Server-side <head> rendering for the SPA's dynamic entity pages.
 *
 * cenner.hr is a client-rendered Vite SPA: vercel.json rewrites every unmatched
 * path to /index.html, so /service/:id, /freelancer/:id and /blog/:slug all
 * shipped one shell with a generic title and no canonical. components/SEO.tsx
 * fixes that at runtime, but only after JS executes — after the pass that
 * decides canonicalisation and indexing. Two consequences:
 *   1. every entity page looked like a copy of every other one;
 *   2. a deleted entity still answered 200, i.e. a soft 404.
 *
 * This function is rewritten in front of those three route families. It fetches
 * minimal public metadata, injects a real <head> into the shell, and passes a
 * genuine 404 through when the entity is gone. Everything else about the page
 * is unchanged — the same shell, the same bundle, the same content for every
 * visitor. It must stay that way: serving crawlers something users don't get is
 * cloaking, so there is deliberately no user-agent branching here.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const API_BASE = process.env.PUBLIC_API_BASE || 'https://api.cenner.hr';
const SITE = 'https://cenner.hr';
const OG_IMAGE = `${SITE}/og-image.png`;

// The built shell, loaded once per cold start. It carries the hashed asset names
// for THIS deployment, so it can be neither committed nor hardcoded.
//
// Primary source is the filesystem: vercel.json ships dist/index.html inside the
// lambda via `includeFiles`. The HTTP fallback deliberately uses the *request's*
// host rather than VERCEL_URL — ssoProtection is enabled for
// `all_except_custom_domains`, so the .vercel.app URL answers 401 and only the
// custom domain is fetchable. That host is aliased to this deployment (it is why
// this code is running), so it returns a matching shell.
let shellCache = null;

function looksLikeShell(html) {
  return typeof html === 'string' && html.includes('<title>') && html.includes('<meta name="robots"');
}

async function getShell(host) {
  if (shellCache) return shellCache;

  try {
    const html = await readFile(join(process.cwd(), 'dist', 'index.html'), 'utf8');
    if (looksLikeShell(html)) {
      shellCache = html;
      return shellCache;
    }
    console.warn('[render] bundled shell did not look like the shell; falling back to HTTP');
  } catch (err) {
    console.warn('[render] bundled shell unavailable:', err.message);
  }

  const res = await fetch(`https://${host}/index.html`, { signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error(`shell fetch failed: ${res.status}`);
  const html = await res.text();
  if (!looksLikeShell(html)) throw new Error('fetched shell did not look like the shell');
  shellCache = html;
  return shellCache;
}

const escAttr = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escText = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Collapse whitespace and cut on a word boundary near `max`. */
function clamp(s, max = 160) {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trim();
}

async function fetchJson(url) {
  // Short timeout: a slow API must not hold a page render open.
  const res = await fetch(url, { signal: AbortSignal.timeout(4000) });

  if (res.status === 404) {
    // Distinguish "this entity is gone" from "this endpoint isn't there".
    // The API answers a missing entity with JSON ({"error":"Not found"}); a
    // route it doesn't know gets Express's default HTML 404. Without this
    // check, a backend rollback that drops these endpoints would turn every
    // live service and profile page into a hard 404 for crawlers — far worse
    // than the soft-404 problem this renderer exists to fix. Treat only the
    // JSON form as authoritative; anything else is an upstream fault, which
    // the caller handles by failing open.
    const type = res.headers.get('content-type') || '';
    if (!type.includes('application/json')) {
      throw new Error('404 without a JSON body — endpoint likely missing');
    }
    return { missing: true };
  }

  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return { data: await res.json() };
}

/**
 * Resolve an entity to the metadata for its <head>.
 *
 * `type` and `id` come from the query string, which vercel.json fills in from
 * the rewrite (?type=…&id=…). Vercel does preserve the original path here, so
 * parsing req.url would also work; the query form is kept because it states
 * the contract explicitly and cannot drift from the rewrite patterns.
 *
 * Returns null when this isn't a page we render (so we fall through to the shell).
 */
async function resolve(type, id) {
  if (!type || !id) return null;

  if (type === 'service') {
    const { missing, data: l } = await fetchJson(`${API_BASE}/api/v1/public/listings/${encodeURIComponent(id)}`);
    if (missing) return { notFound: true, canonical: `${SITE}/service/${id}` };
    // Mirrors pages/ServiceDetails.tsx so the pre- and post-render heads agree.
    const rated = l.reviewsCount > 0 ? ` — ocjena ${l.rating}/5` : '';
    return {
      title: `${l.title} — ${l.freelancerName} | Freelancer Hrvatska | Cenner`,
      description: `${clamp(l.description, 140)}... Usluga dostupna u Hrvatskoj i EU. Isporučuje ${l.freelancerName}${rated}.`,
      canonical: `${SITE}/service/${l.id}`,
      image: l.imageUrl || OG_IMAGE,
      ogType: 'product',
    };
  }

  if (type === 'freelancer') {
    const { missing, data: u } = await fetchJson(`${API_BASE}/api/v1/public/freelancers/${encodeURIComponent(id)}`);
    if (missing) return { notFound: true, canonical: `${SITE}/freelancer/${id}` };
    return {
      title: `${u.name} — Freelance ${u.skills?.[0] || 'Usluge'} | Cenner`,
      description: clamp(u.bio || `Pogledaj profil freelancera ${u.name} na Cenner platformi.`),
      canonical: `${SITE}/freelancer/${u.id}`,
      image: u.avatar || OG_IMAGE,
      ogType: 'profile',
    };
  }

  if (type === 'blog') {
    const slug = id;
    const { missing, data: p } = await fetchJson(`${API_BASE}/api/v1/public/blog/${encodeURIComponent(slug)}`);
    if (missing) return { notFound: true, canonical: `${SITE}/blog/${slug}` };
    return {
      title: `${p.title} | Cenner`,
      description: clamp(p.excerpt || p.title),
      canonical: `${SITE}/blog/${p.slug}`,
      image: p.coverImage || OG_IMAGE,
      ogType: 'article',
    };
  }

  return null;
}

/** Swap a tag that the shell is known to contain; throw loudly if the shell drifts. */
function swap(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`render: ${label} missing from shell`);
  return html.replace(pattern, () => replacement);
}

function buildHead(shell, meta) {
  const title = escText(meta.title);
  const titleAttr = escAttr(meta.title);
  const desc = escAttr(meta.description);

  let html = shell;
  html = swap(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, '<title>');
  html = swap(html, /<meta name="description" content="[\s\S]*?"\s*\/>/,
    `<meta name="description" content="${desc}" />`, 'description');
  html = swap(html, /<meta property="og:type" content="[\s\S]*?"\s*\/>/,
    `<meta property="og:type" content="${escAttr(meta.ogType)}" />`, 'og:type');
  html = swap(html, /<meta property="og:title" content="[\s\S]*?"\s*\/>/,
    `<meta property="og:title" content="${titleAttr}" />`, 'og:title');
  html = swap(html, /<meta property="og:description" content="[\s\S]*?"\s*\/>/,
    `<meta property="og:description" content="${desc}" />`, 'og:description');
  html = swap(html, /<meta property="og:image" content="[\s\S]*?"\s*\/>/,
    `<meta property="og:image" content="${escAttr(meta.image)}" />`, 'og:image');
  html = swap(html, /<meta name="twitter:title" content="[\s\S]*?"\s*\/>/,
    `<meta name="twitter:title" content="${titleAttr}" />`, 'twitter:title');
  html = swap(html, /<meta name="twitter:description" content="[\s\S]*?"\s*\/>/,
    `<meta name="twitter:description" content="${desc}" />`, 'twitter:description');
  html = swap(html, /<meta name="twitter:image" content="[\s\S]*?"\s*\/>/,
    `<meta name="twitter:image" content="${escAttr(meta.image)}" />`, 'twitter:image');

  const head = [
    '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />',
    `<link rel="canonical" href="${escAttr(meta.canonical)}" />`,
    `<link rel="alternate" hreflang="hr-HR" href="${escAttr(meta.canonical)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escAttr(meta.canonical)}" />`,
    `<meta property="og:url" content="${escAttr(meta.canonical)}" />`,
  ].join('\n    ');

  return swap(html, /<meta name="robots" content="[\s\S]*?"\s*\/>/, head, 'robots');
}

/** A gone entity: real 404 status, noindex, and no canonical to a dead URL. */
function buildNotFound(shell) {
  let html = shell;
  html = swap(html, /<title>[\s\S]*?<\/title>/, '<title>Stranica nije pronađena | Cenner</title>', '<title>');
  return swap(html, /<meta name="robots" content="[\s\S]*?"\s*\/>/,
    '<meta name="robots" content="noindex, nofollow" />', 'robots');
}

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const url = new URL(req.url, `https://${host}`);
  const type = url.searchParams.get('type');
  const id = url.searchParams.get('id');

  let shell;
  try {
    shell = await getShell(host);
  } catch (err) {
    // Without the shell there is nothing to serve; let Vercel surface it.
    console.error('[render] shell unavailable:', err.message);
    return res.status(500).send('Internal Server Error');
  }

  let meta = null;
  try {
    meta = await resolve(type, id);
  } catch (err) {
    // API down or slow: fail OPEN. The visitor still gets a working SPA that
    // fetches its own data; we just lose the pre-rendered head for this hit.
    // Short cache so the next crawl retries rather than freezing a bad head.
    console.error('[render] metadata lookup failed:', type, id, err.message);
    res.setHeader('Cache-Control', 'public, s-maxage=30');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(shell);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (!meta) {
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(200).send(shell);
  }

  if (meta.notFound) {
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.status(404).send(buildNotFound(shell));
  }

  // CDN-cached so crawl traffic doesn't turn into a function invocation per hit.
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  return res.status(200).send(buildHead(shell, meta));
}
