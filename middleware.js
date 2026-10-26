/**
 * Vercel Routing Middleware (edge, runs before the filesystem and the vercel.json rewrites).
 * Sends two kinds of request to the one markdown handler, api/md.js:
 *
 *   1. a .md URL:  /pricing.md -> markdown of /pricing, /index.md -> markdown of /
 *   2. an HTML URL whose Accept header prefers text/markdown over text/html (q-values honoured),
 *      for the content routes in lib/md/routes.mjs only. A missing Accept, or one that only says
 *      * / *, always gets HTML, so browsers, curl and link previews are unaffected.
 *
 * Everything else passes through untouched. This must stay free of user-agent checks: the same
 * request gets the same answer whoever sends it.
 */
import { matchMdRoute } from './lib/md/routes.mjs';

export const config = {
  matcher: ['/((?!api/|assets/|_next/|\\.well-known/).*)'],
};

/** Files that really end in .md and must be served as they are (none today). */
const REAL_MD = new Set([]);

const next = () => new Response(null, { headers: { 'x-middleware-next': '1' } });

function rewrite(url, path, negotiated) {
  const dest = new URL('/api/md', url);
  dest.searchParams.set('path', path);
  if (negotiated) dest.searchParams.set('neg', '1');
  return new Response(null, { headers: { 'x-middleware-rewrite': dest.toString() } });
}

/** Parse "text/html;q=0.9, text/markdown" into [{ type, q }]. */
function parseAccept(header) {
  return header
    .split(',')
    .map((part) => {
      const [type, ...params] = part.trim().toLowerCase().split(';');
      const qp = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const q = qp ? Number(qp.slice(2)) : 1;
      return { type: type.trim(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((r) => r.type);
}

/**
 * True only when text/markdown is named explicitly and outranks text/html. HTML's q comes from its
 * most specific matching range (text/html, then text/*, then * / *), as RFC 9110 defines it.
 */
export function prefersMarkdown(header) {
  const ranges = parseAccept(header);
  const md = ranges.find((r) => r.type === 'text/markdown');
  if (!md || md.q <= 0) return false;
  const html =
    ranges.find((r) => r.type === 'text/html') || ranges.find((r) => r.type === 'text/*') || ranges.find((r) => r.type === '*/*');
  return md.q > (html ? html.q : 0);
}

export default function middleware(request) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (pathname.endsWith('.md')) {
    if (REAL_MD.has(pathname)) return next();
    const html = pathname.slice(0, -3);
    return rewrite(url, html === '/index' || html === '' ? '/' : html, false);
  }

  // Any other file (llms.txt, robots.txt, sitemap.xml, images, video) is not a page.
  if (/\.[a-z0-9]+$/i.test(pathname)) return next();

  const accept = (request.headers.get('accept') || '').toLowerCase();
  if (!accept.includes('text/markdown') || !prefersMarkdown(accept)) return next();
  if (!matchMdRoute(pathname)) return next();
  return rewrite(url, pathname, true);
}
