/**
 * GET|QUERY /.well-known/search  (vercel.json rewrites it here)
 *
 * Search for AI agents, in the format of Cloudflare's "Search for Agents" (see lib/agentSearch.mjs).
 * One answer in Markdown, from two sources:
 *
 *   1. Live marketplace: open service listings (and the freelancers behind them) read from
 *      api.cenner.hr on every request, so a listing is findable the moment it is published and gone
 *      the moment it is removed. CMS blog posts come the same way.
 *   2. Site index: Cloudflare AI Search over the Markdown twins of every public page (services,
 *      landing pages, blog, pricing, about...), re-synced every 15 minutes.
 *
 * Retrieved content only, never a generated answer: the agent has its own model.
 * Either source may fail; the other still answers. Both failing is a 502.
 *
 * Request forms (same as Cloudflare's):
 *   GET   /.well-known/search?q=...
 *   QUERY /.well-known/search   body: plain text, or JSON {"q": "..."}   (RFC 10008)
 * POST is accepted the same way as QUERY for clients that cannot send QUERY yet.
 */

import { API_BASE, fetchJson } from './_lib/upstream.js';
import { AI_SEARCH_PUBLIC_URL } from '../lib/agentSearch.mjs';

const SITE = 'https://cenner.hr';
const MAX_QUERY = 500;
const MAX_BODY = 8 * 1024;
const MAX_LISTINGS = 6;
const MAX_PAGES = 8;
const INDEX_TIMEOUT_MS = 6000;

// ---------------------------------------------------------------- query parsing

async function readBody(req) {
  // Vercel parses JSON / text bodies for known methods; for QUERY it may not, so read the stream.
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error('body too large'), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function readQuery(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    const url = new URL(req.url, SITE);
    return url.searchParams.get('q') || '';
  }
  const raw = (await readBody(req)).trim();
  const type = String(req.headers['content-type'] || '').toLowerCase();
  if (type.includes('application/json') || raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed?.q === 'string' ? parsed.q : '';
    } catch {
      throw Object.assign(new Error('invalid JSON body'), { status: 400 });
    }
  }
  return raw;
}

// ---------------------------------------------------------------- live marketplace

/** Lowercase, strip Croatian diacritics, keep letters/digits. */
const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .trim();

const STOP = new Set(
  ('a i u na za od do je su se da li ili ne sto koji koja koje kako gdje tko mi me mo moj moja treba trebam ' +
    'trazim zelim neki neka nekog netko the and or for of to in on a an is are i me my we need want find looking ' +
    'with who can do does how much what which some any please hrvatska croatia cenner')
    .split(' '),
);

/** Croatian and English words for the same work, so "logo design" finds "dizajn loga". */
const SYNONYMS = [
  ['web', 'website', 'stranica', 'stranice', 'stranicu', 'sajt', 'webshop', 'web shop'],
  ['dizajn', 'design', 'designer', 'dizajner', 'grafika', 'graphics', 'graficki'],
  ['logo', 'loga', 'logotip', 'branding', 'brand', 'identitet', 'identity'],
  ['seo', 'optimizacija', 'trazilice', 'google'],
  ['video', 'montaza', 'editing', 'editor', 'snimanje'],
  ['marketing', 'oglasi', 'ads', 'drustvene', 'social'],
  ['programiranje', 'programming', 'developer', 'programer', 'development', 'razvoj', 'kod', 'code', 'api', 'app', 'aplikacija'],
  ['print', 'tisak', 'letak', 'vizitke', 'packaging', 'ambalaza'],
];

function expand(tokens) {
  const out = new Set(tokens);
  for (const tok of tokens) {
    for (const group of SYNONYMS) {
      if (group.some((w) => stemEq(norm(w), tok))) group.forEach((w) => out.add(norm(w)));
    }
  }
  return [...out].filter(Boolean);
}

/** Loose match for Croatian endings: "stranica" ~ "stranice" ~ "stranicu", "dizajn" ~ "dizajna". */
function stemEq(a, b) {
  if (a === b) return true;
  const n = Math.min(a.length, b.length);
  if (n < 4) return false;
  const k = Math.max(4, n - 2);
  return a.slice(0, k) === b.slice(0, k);
}

function tokenize(q) {
  return norm(q)
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP.has(w));
}

function fieldScore(text, terms) {
  const words = norm(text).split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const joined = words.join(' ');
  let hits = 0;
  for (const t of terms) {
    if (t.includes(' ')) {
      if (joined.includes(t)) hits += 1;
    } else if (words.some((w) => stemEq(w, t))) hits += 1;
  }
  return hits;
}

/**
 * A listing only counts when the query names what it is: a hit in its title, category or inclusions
 * (directly or through a synonym). A shared word in a long description ("work", "safe") is not enough.
 */
function isAbout(l, expanded) {
  return fieldScore([l.title, l.category, (l.includes || []).join(' ')].join(' '), expanded) > 0;
}

function scoreListing(l, original, expanded) {
  if (!isAbout(l, expanded)) return 0;
  const extra = expanded.filter((t) => !original.includes(t));
  const fields = [
    [l.title, 3],
    [l.category, 2],
    [l.freelancerName, 2],
    [(l.includes || []).join(' '), 1.5],
    [l.freelancerLocation, 1.5],
    [l.description, 1],
    [l.freelancerBio, 0.5],
  ];
  let score = 0;
  for (const [text, w] of fields) {
    score += w * fieldScore(text, original); // the words the agent used count most
    score += 0.4 * w * fieldScore(text, extra);
  }
  return score;
}

const eur = (n) => (Number.isFinite(Number(n)) ? `${Number(n).toLocaleString('hr-HR')} €` : '');
const oneLine = (s, max = 240) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max * 0.6))}…`;
};

async function searchMarketplace(q) {
  const original = tokenize(q);
  if (!original.length) return { listings: [], posts: [] };
  const expanded = expand(original);

  const [listingsRes, postsRes] = await Promise.allSettled([
    fetchJson(`${API_BASE}/api/v1/portal/listings`),
    fetchJson(`${API_BASE}/api/v1/public/blog`),
  ]);
  if (listingsRes.status === 'rejected' && postsRes.status === 'rejected') throw listingsRes.reason;

  const all = listingsRes.status === 'fulfilled' && Array.isArray(listingsRes.value.data) ? listingsRes.value.data : [];
  const scored = all
    .map((l) => ({ l, s: scoreListing(l, original, expanded) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  // Keep the close matches only: a weak tail behind a strong hit is noise for the agent.
  const floor = scored.length ? scored[0].s * 0.35 : 0;
  const listings = scored.filter((x) => x.s >= floor).slice(0, MAX_LISTINGS).map((x) => x.l);

  const allPosts = postsRes.status === 'fulfilled' && Array.isArray(postsRes.value.data) ? postsRes.value.data : [];
  const posts = allPosts
    .filter((p) => p && p.slug && p.published !== false)
    .map((p) => ({ p, s: 3 * fieldScore(p.title, original) + fieldScore(p.excerpt, original) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => x.p);

  return { listings, posts, total: all.length };
}

function listingMd(l) {
  const url = `${SITE}/service/${encodeURIComponent(l.id)}`;
  const facts = [
    l.category,
    l.price != null ? `od ${eur(l.price)}` : '',
    l.deliveryTime ? `isporuka: ${String(l.deliveryTime).trim()}` : '',
    l.reviewsCount > 0 ? `ocjena ${l.rating}/5 (${l.reviewsCount})` : '',
  ].filter(Boolean);
  const who = [
    l.freelancerName && l.freelancerId ? `[${l.freelancerName}](${SITE}/freelancer/${encodeURIComponent(l.freelancerId)})` : l.freelancerName || '',
    l.freelancerKycVerified ? 'identitet provjeren (KYC)' : '',
    l.freelancerLocation || '',
  ].filter(Boolean);
  const lines = [`### [${l.title}](${url})`, '', facts.join(' · ')];
  if (who.length) lines.push(`Freelancer: ${who.join(' · ')}`);
  lines.push('', oneLine(l.description));
  if (l.includes?.length) lines.push('', `Uključeno: ${l.includes.slice(0, 6).join('; ')}`);
  return lines.join('\n').trim();
}

// ---------------------------------------------------------------- site index (Cloudflare AI Search)

/** The index holds .md twins; agents should get the page itself. "/index.md" is the homepage. */
function htmlUrl(key) {
  let u = String(key || '');
  if (!/^https?:/.test(u)) u = `${SITE}/${u.replace(/^\/+/, '')}`;
  u = u.replace(/\.md$/, '');
  if (u.endsWith('/index')) u = u.slice(0, -'/index'.length);
  return u === SITE || u === '' ? `${SITE}/` : u;
}

async function searchIndex(q) {
  const res = await fetch(AI_SEARCH_PUBLIC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: q }] }),
    signal: AbortSignal.timeout(INDEX_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`AI Search ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
  const json = await res.json();
  const chunks = json?.result?.chunks || json?.chunks || json?.result?.data || json?.data || [];

  // One entry per page, keeping its best chunk; listings and profiles come live, not from here.
  const byPage = new Map();
  for (const c of chunks) {
    const key = c?.item?.key || c?.filename || c?.item?.metadata?.url || '';
    const url = htmlUrl(key);
    if (/\/(service|freelancer)\//.test(url)) continue;
    const text = c?.text ?? (Array.isArray(c?.content) ? c.content.map((x) => x.text).join('\n') : '');
    const score = Number(c?.score ?? 0);
    const prev = byPage.get(url);
    if (!prev || score > prev.score) byPage.set(url, { url, score, text: String(text || '') });
  }
  return [...byPage.values()].sort((a, b) => b.score - a.score).slice(0, MAX_PAGES);
}

function pageMd({ url, score, text }) {
  // Chunks of our own .md twins start with "# Title"; keep the content, drop the "Canonical:" line.
  const body = text
    .replace(/^Canonical: .*$/m, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const clipped = body.length > 1400 ? `${body.slice(0, 1400).replace(/\s+\S*$/, '')}…` : body;
  return `## ${url} (score: ${score.toFixed(3)})\n\n${clipped}`;
}

// ---------------------------------------------------------------- handler

function usage() {
  return [
    '# cenner.hr search for agents',
    '',
    'Search freelancers, services and content on cenner.hr (Croatian freelance marketplace).',
    '',
    `- GET ${SITE}/.well-known/search?q=izrada+web+stranice`,
    `- QUERY ${SITE}/.well-known/search with a plain-text body, or JSON {"q": "..."}`,
    '',
    'Results are Markdown: open listings from the live marketplace first, then matching pages.',
  ].join('\n');
}

function send(res, status, body, extra = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Cache-Control', status === 200 ? 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' : 'no-store');
  for (const [k, v] of Object.entries(extra)) res.setHeader(k, v);
  res.end(body);
}

export default async function handler(req, res) {
  const method = String(req.method || 'GET').toUpperCase();

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Allow', 'GET, HEAD, QUERY, POST, OPTIONS');
    res.setHeader('Accept-Query', 'text/plain, application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, QUERY, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.end();
  }
  if (!['GET', 'HEAD', 'QUERY', 'POST'].includes(method)) {
    return send(res, 405, usage(), { Allow: 'GET, HEAD, QUERY, POST, OPTIONS' });
  }

  let q;
  try {
    q = (await readQuery(req)).replace(/\s+/g, ' ').trim();
  } catch (err) {
    return send(res, err.status || 400, `${err.message}\n\n${usage()}`);
  }
  if (!q) return send(res, 400, `Missing query.\n\n${usage()}`);
  if (q.length > MAX_QUERY) q = q.slice(0, MAX_QUERY);

  const [live, index] = await Promise.allSettled([searchMarketplace(q), searchIndex(q)]);
  if (live.status === 'rejected') console.warn('[search] marketplace failed:', live.reason?.message);
  if (index.status === 'rejected') console.warn('[search] index failed:', index.reason?.message);
  if (live.status === 'rejected' && index.status === 'rejected') {
    return send(res, 502, 'Search is temporarily unavailable. Try again shortly, or read https://cenner.hr/llms.txt');
  }

  const parts = [`# Search results for: "${q.replace(/"/g, '\\"')}"`];

  const listings = live.status === 'fulfilled' ? live.value.listings : [];
  const posts = live.status === 'fulfilled' ? live.value.posts : [];
  if (listings.length) {
    parts.push(
      '## Open listings on the marketplace (live)\n\nUsluge koje se sada mogu naručiti na Cenneru; novac čeka do isporuke.\n\n' +
        listings.map(listingMd).join('\n\n'),
    );
  }
  if (posts.length) {
    parts.push(
      '## Blog (live)\n\n' +
        posts
          .map((p) => `- [${p.title}](${SITE}/blog/${encodeURIComponent(p.slug)})${p.excerpt ? `: ${oneLine(p.excerpt, 200)}` : ''}`)
          .join('\n'),
    );
  }

  const pages = index.status === 'fulfilled' ? index.value : [];
  if (pages.length) parts.push(pages.map(pageMd).join('\n\n---\n\n'));

  if (!listings.length && !posts.length && !pages.length) {
    parts.push(`No matches. Browse all listings at ${SITE}/marketplace`);
  }

  if (method === 'HEAD') return send(res, 200, '');
  return send(res, 200, parts.join('\n\n') + '\n');
}
