/**
 * The response every markdown/text request gets, on a Node (req, res) pair as Vercel functions
 * receive them. The HTML page stays canonical: markdown is noindex and points back to it.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { SITE_URL } from './routes.mjs';
import { approxTokens } from './format';

export type CacheKind = 'static' | 'dynamic' | 'full' | 'notfound' | 'error';

const CACHE: Record<CacheKind, string> = {
  static: 'public, s-maxage=86400, stale-while-revalidate=604800',
  dynamic: 'public, s-maxage=3600, stale-while-revalidate=86400',
  full: 'public, s-maxage=86400, stale-while-revalidate=604800',
  notfound: 'public, s-maxage=60',
  error: 'public, s-maxage=30',
};

/** The machine-readable site files, advertised on every markdown response (and on HTML via vercel.json). */
export const DESCRIBED_BY = [
  `<${SITE_URL}/llms.txt>; rel="describedby"; type="text/plain"`,
  `<${SITE_URL}/llms-full.txt>; rel="describedby"; type="text/plain"`,
  `<${SITE_URL}/ai.txt>; rel="describedby"; type="text/plain"`,
];

export interface TextResponse {
  status: number;
  body: string;
  type: 'text/markdown' | 'text/plain' | 'application/json';
  cache: CacheKind;
  /** The HTML page this stands for. */
  canonical?: string;
  /** YYYY-MM-DD */
  lastModified?: string;
  /** Set when the client reached this through Accept negotiation on the HTML URL. */
  negotiated?: boolean;
}

export function send(req: IncomingMessage, res: ServerResponse, r: TextResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Accept');
  res.setHeader('Access-Control-Expose-Headers', 'X-Markdown-Tokens, Content-Location, Link');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Max-Age', '86400');
    res.end();
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD, OPTIONS');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Method Not Allowed\n');
    return;
  }

  const body = Buffer.from(r.body, 'utf8');
  res.statusCode = r.status;
  res.setHeader('Content-Type', `${r.type}; charset=utf-8`);
  res.setHeader('Content-Length', String(body.length));
  res.setHeader('X-Markdown-Tokens', String(approxTokens(r.body)));
  res.setHeader('X-Robots-Tag', 'noindex, follow');
  res.setHeader('Cache-Control', CACHE[r.cache]);
  if (r.negotiated) res.setHeader('Vary', 'Accept');
  if (r.lastModified) res.setHeader('Last-Modified', new Date(`${r.lastModified}T00:00:00Z`).toUTCString());
  const links = [...DESCRIBED_BY];
  if (r.canonical) {
    res.setHeader('Content-Location', r.canonical);
    links.unshift(`<${r.canonical}>; rel="canonical"`);
  }
  res.setHeader('Link', links.join(', '));
  res.end(req.method === 'HEAD' ? undefined : body);
}
