/**
 * Which cenner.hr pages have a markdown version, and which paths are private.
 *
 * Plain .mjs because four different runtimes read it: middleware.js (edge, decides when to
 * rewrite to the markdown handler), lib/md/registry.ts (renders them), scripts/generate-robots.mjs
 * (robots.txt) and scripts/check-md-coverage.mjs (fails the check when App.tsx gains a public route
 * that is neither here nor in MD_SKIP).
 *
 * TO ADD A PAGE: add it to MD_ROUTES and give its `id` a renderer in lib/md/registry.ts. The .md URL,
 * the Accept negotiation, /api/md/_catalog, llms.txt and llms-full.txt all pick it up from here.
 *
 * Keep PRIVATE_PATHS in sync with robots.txt and ai.txt (both are generated from it).
 */

export const SITE_URL = 'https://cenner.hr';

/**
 * `section` places a page in llms.txt / llms-full.txt (in this order); null keeps it out of both
 * while it still answers as .md. Patterns use one `:param` per path segment.
 */
export const LLMS_SECTIONS = ['core', 'marketplace', 'guides', 'listings', 'legal'];

export const MD_ROUTES = [
  { path: '/', id: 'home', section: 'core' },
  { path: '/marketplace', id: 'marketplace', section: 'core' },
  { path: '/services', id: 'services', section: 'core' },
  { path: '/subscription', id: 'subscription', section: 'core' },
  { path: '/about', id: 'about', section: 'core' },
  { path: '/cjenik', id: 'cjenik', section: 'core' },
  { path: '/ranwhat', id: 'ranwhat', section: 'core' },
  { path: '/community', id: 'community', section: 'core' },
  { path: '/usluge/:slug', id: 'landing-service', section: 'marketplace' },
  { path: '/freelanceri/:city', id: 'landing-city', section: 'marketplace' },
  { path: '/blog', id: 'blog', section: 'guides' },
  { path: '/blog/:slug', id: 'blog-post', section: 'guides' },
  { path: '/onboarding', id: 'onboarding', section: 'guides' },
  { path: '/service/:id', id: 'service', section: 'listings' },
  // Freelancer profiles answer as .md for agents fetching one on demand, but stay out of
  // llms.txt and llms-full.txt (and out of training crawls, see robots.txt): they are people.
  { path: '/freelancer/:id', id: 'freelancer', section: null },
  { path: '/privacy', id: 'privacy', section: 'legal' },
  { path: '/terms', id: 'terms', section: 'legal' },
  { path: '/cookies', id: 'cookies', section: 'legal' },
];

/** App.tsx routes with no markdown version, and why. scripts/check-md-coverage.mjs reads this. */
export const MD_SKIP = {
  '/v3': 'draft homepage, not linked',
  '/auth': 'sign-in form, noindex',
  '/vodic/cijena-web-stranice': 'noindex on purpose: the email popup is the way in (pages/PriceGuide.tsx)',
  '/profile': 'signed-in',
  '/creator-onboarding': 'signed-in',
  '/banned': 'signed-in',
  '/admin': 'admin',
  '/admin/blog': 'admin',
  '/admin/blog/:id': 'admin',
  '/admin/bans': 'admin',
  '/checkout/:id': 'signed-in',
  '/checkout-subscription/:planId': 'signed-in',
  '/orders': 'signed-in',
  '/messages': 'signed-in',
  '/messages/:id': 'signed-in',
  '/contracts': 'signed-in',
  '/contracts/:id': 'signed-in',
  '/reset-password': 'one-time link',
  '/verify-email': 'one-time link',
  '/unsubscribe': 'one-time link',
  '/order-success': 'signed-in',
  '/referral': 'signed-in',
  // Redirects (vercel.json answers these with a 301 before the app runs).
  '/match': 'redirect',
  '/dashboard': 'redirect',
  '/saved': 'redirect',
  '/blog-admin': 'redirect',
  '/blog-admin/:id': 'redirect',
  '/contact': 'redirect',
  '/projects': 'redirect',
  '/technology': 'redirect',
  '/earnings': 'redirect',
  '*': 'not found page',
};

/** Disallowed for every crawler; the [scope] excluded list in ai.txt. */
export const PRIVATE_PATHS = [
  '/profile',
  '/dashboard',
  '/orders',
  '/messages',
  '/checkout/',
  '/checkout-subscription/',
  '/creator-onboarding',
  '/saved',
  '/contracts',
  '/reset-password',
  '/invoices/',
  '/admin',
];

/** Turn a pattern into a matcher once. */
const compiled = MD_ROUTES.map((route) => {
  const names = [];
  const source = route.path
    .split('/')
    .map((seg) => {
      if (!seg.startsWith(':')) return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      names.push(seg.slice(1));
      return '([^/]+)';
    })
    .join('/');
  return { route, names, re: new RegExp(`^${source}$`) };
});

/** "/blog/x" -> { route, params: { slug: "x" } }, or null when the path has no markdown version. */
export function matchMdRoute(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  for (const { route, names, re } of compiled) {
    const m = re.exec(path);
    if (!m) continue;
    let params;
    try {
      params = Object.fromEntries(names.map((n, i) => [n, decodeURIComponent(m[i + 1])]));
    } catch {
      return null;
    }
    return { route, params };
  }
  return null;
}

/** The .md URL of an HTML path: "/" -> "/index.md", "/about" -> "/about.md". */
export const mdPathOf = (path) => (path === '/' ? '/index.md' : `${path}.md`);
