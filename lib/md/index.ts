/**
 * Entry of the markdown handler. scripts/build-md.mjs bundles this file (with the i18n copy, the
 * price list and the page renderers) into api/_md/bundle.mjs, which api/md.js serves.
 *
 * Requests arrive as /api/md?path=/pricing (from middleware.js, or the /api/md/:path* rewrite) or
 * /api/md?file=llms|llms-full|ai|catalog (from the vercel.json rewrites). Never answers HTML.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { matchMdRoute, SITE_URL } from './routes.mjs';
import { RENDERERS, renderMarkdownPath } from './registry';
import { abs, notFoundPage, renderPage } from './format';
import { send, type CacheKind } from './http';
import { aiTxt, catalogJson, llmsFullTxt, llmsTxt } from './site-files';

export { RENDERERS };

/** Static routes whose content still comes from the API, so they get the shorter cache. */
const API_BACKED = new Set(['marketplace', 'community', 'blog']);

export async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url || '/', SITE_URL);
  const file = url.searchParams.get('file');

  try {
    if (file === 'llms') return send(req, res, { status: 200, body: await llmsTxt(), type: 'text/plain', cache: 'dynamic' });
    if (file === 'llms-full') return send(req, res, { status: 200, body: await llmsFullTxt(), type: 'text/plain', cache: 'full' });
    if (file === 'ai') return send(req, res, { status: 200, body: aiTxt(), type: 'text/plain', cache: 'static' });
    if (file === 'catalog') return send(req, res, { status: 200, body: await catalogJson(), type: 'application/json', cache: 'dynamic' });
  } catch (err) {
    console.error(`[md] ${file} failed:`, (err as Error).message);
    return send(req, res, { status: 503, body: 'Temporarily unavailable.\n', type: 'text/plain', cache: 'error' });
  }

  const raw = url.searchParams.get('path') || '/';
  const path = ('/' + raw.replace(/^\/+/, '')).replace(/\/index$/, '/') || '/';
  const negotiated = url.searchParams.get('neg') === '1';
  const hit = matchMdRoute(path);

  const notFound = () =>
    send(req, res, { status: 404, body: notFoundPage(path), type: 'text/markdown', cache: 'notfound', negotiated });

  if (!hit) return notFound();

  try {
    const page = await renderMarkdownPath(path);
    if (!page) return notFound();
    const cache: CacheKind = hit.route.path.includes(':') || API_BACKED.has(hit.route.id) ? 'dynamic' : 'static';
    return send(req, res, {
      status: 200,
      body: renderPage(page),
      type: 'text/markdown',
      cache,
      canonical: abs(page.path),
      lastModified: page.lastUpdated,
      negotiated,
    });
  } catch (err) {
    // API down or blocked: say so instead of a false 404, and let the next request retry.
    console.error('[md] render failed:', path, (err as Error).message);
    return send(req, res, {
      status: 503,
      body: `# Privremeno nedostupno\n\n> Sadržaj stranice ${abs(path)} trenutačno nije dostupan. Pokušajte ponovno za minutu.\n`,
      type: 'text/markdown',
      cache: 'error',
      canonical: abs(path),
      negotiated,
    });
  }
}
