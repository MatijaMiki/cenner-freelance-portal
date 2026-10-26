/**
 * Reads from api.cenner.hr for the server-side renderers: api/render.js (HTML heads) and the
 * markdown handler (lib/md, bundled into api/_md). Underscore directory, so Vercel does not
 * deploy it as a function of its own.
 */

export const API_BASE = process.env.PUBLIC_API_BASE || 'https://api.cenner.hr';

// Optional shared secret. api.cenner.hr sits behind Cloudflare, and a rule there
// currently answers this function with 403 while the same requests from a laptop
// succeed. Set RENDER_API_KEY here and add a matching Cloudflare WAF *Skip* rule
// (Custom rule: http.request.headers["x-cenner-render"][0] eq "<value>" -> Skip:
// All remaining custom rules + Bot Fight Mode) so the renderer is exempt without
// widening anything for the public internet. Keyed on a header, not an IP,
// because Vercel's egress addresses rotate. Unset = header simply not sent.
const RENDER_KEY = process.env.RENDER_API_KEY || '';

/**
 * Describe a non-OK upstream response well enough to act on it from the log alone.
 *
 * The previous version threw `upstream ${status}` and dropped the body, which made
 * a 403 unattributable: a Cloudflare block and an origin rejection look identical
 * at that level of detail. Both are cheap to tell apart from the payload, so keep it.
 */
async function describe(res) {
  const body = await res.text().catch(() => '');
  const snippet = body.slice(0, 300).replace(/\s+/g, ' ').trim();
  const cfMitigated = res.headers.get('cf-mitigated');
  const server = res.headers.get('server') || '?';
  const ray = res.headers.get('cf-ray') || '-';
  // A Cloudflare denial is served by the edge and never reaches Express.
  const edge = Boolean(cfMitigated) || /Attention Required|Sorry, you have been blocked|__cf_chl/i.test(body);
  const who = edge ? 'CLOUDFLARE EDGE' : `origin (server=${server})`;
  return `upstream ${res.status} from ${who} cf-ray=${ray}` +
    (cfMitigated ? ` cf-mitigated=${cfMitigated}` : '') +
    (snippet ? ` body="${snippet}"` : ' body=<empty>');
}

/** @returns {Promise<{ missing: true } | { data: any }>} throws on any other upstream failure */
export async function fetchJson(url) {
  // Short timeout: a slow API must not hold a page render open.
  const res = await fetch(url, {
    signal: AbortSignal.timeout(4000),
    ...(RENDER_KEY ? { headers: { 'x-cenner-render': RENDER_KEY } } : {}),
  });

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

  if (!res.ok) throw new Error(await describe(res));
  return { data: await res.json() };
}
