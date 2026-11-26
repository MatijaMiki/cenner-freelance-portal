/**
 * Search for agents on cenner.hr: one search address that AI agents can find and query instead of
 * crawling page by page. It mirrors Cloudflare's "Search for Agents" (same path, same <meta> names,
 * same Markdown answer) so an agent that learned it on another site uses it here unchanged.
 * Cloudflare's own toggle cannot run here because Vercel serves cenner.hr, not Cloudflare's proxy.
 *
 * Read by: api/search.js (the endpoint), scripts/generate-landing-pages.mjs and
 * scripts/generate-sitemap.mjs. index.html carries the same four tags inline (it is not generated);
 * keep it in step with AGENT_META below.
 */

export const SEARCH_PATH = '/.well-known/search';
export const SEARCH_URL = `https://cenner.hr${SEARCH_PATH}`;

/** Where agents can read how the endpoint works (the format is Cloudflare's). */
export const SEARCH_DOCS = 'https://developers.cloudflare.com/ai-search/how-to/search-for-agents/';

export const AGENT_INSTRUCTIONS =
  'Use this search API to find freelancers, services and content across cenner.hr with keywords or ' +
  'natural-language queries, in Croatian or English, instead of crawling individual pages. ' +
  'Results are returned in Markdown; open listings come from the live marketplace.';

/** The four discovery tags, one per line, for an HTML <head>. */
export const AGENT_META = [
  `<meta name="agent:instructions" content="${AGENT_INSTRUCTIONS}" />`,
  `<meta name="agent:endpoint" content="${SEARCH_URL}?q={query}" />`,
  '<meta name="agent:method" content="GET" />',
  `<meta name="agent:documentation" content="${SEARCH_DOCS}" />`,
];

/**
 * Cloudflare AI Search instance `cenner-hr-agents` (account default namespace). It crawls only the
 * Markdown twins listed in /agent-sitemap.xml (the HTML pages are an SPA shell to a crawler) and
 * re-syncs every 15 minutes. Its public endpoint has /search on and chat + MCP off, rate limit
 * 120/min. The id is not a secret: the endpoint is public by design and serves public pages only.
 */
export const AI_SEARCH_PUBLIC_URL =
  'https://a234dc93-4aa2-4087-b0bd-e2b51fc967d0.search.ai.cloudflare.com/search';

/** The sitemap the index reads. Not listed in robots.txt: it is for the index, not for search engines. */
export const AGENT_SITEMAP_PATH = '/agent-sitemap.xml';
