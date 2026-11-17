/**
 * Language in the URL.
 *
 * Croatian is the site's language and lives at the root (/services is Croatian, and every URL that
 * was ever indexed or advertised keeps working unchanged). Other languages get a path prefix:
 * /en/services is the same page in English.
 *
 * A language gets a prefix only once its key pages (home, /services, the contact form, the consent
 * modal) are really translated. Today that is English alone: i18n.tsx has no German, French,
 * Spanish or Italian dictionary, so those still fall back to English text and keep the old
 * behaviour (picked in the language menu, remembered in localStorage, no URL of their own).
 * TO ADD ONE: give it a dictionary in i18n.tsx, add it to LANG_PREFIXES, give its key pages their
 * own SEO title/description (components/SEO.tsx, scripts/prerender-static-routes.mjs) and add its
 * prefix to the /en rewrites in vercel.json.
 *
 * Plain .mjs because the app, the prerender script, the sitemap and robots scripts all read it.
 */

export const SITE_URL = 'https://cenner.hr';

/** The default language: served at the root, x-default in hreflang. */
export const DEFAULT_LANG = 'HR';

/** Language code (as i18n.tsx uses it) -> URL prefix. */
export const LANG_PREFIXES = { EN: '/en' };

/** BCP 47 tags for <html lang> and hreflang. */
export const HTML_LANG = { HR: 'hr', EN: 'en', DE: 'de', FR: 'fr', ES: 'es', IT: 'it' };
export const HREFLANG = { HR: 'hr-HR', EN: 'en' };
export const OG_LOCALE = { HR: 'hr_HR', EN: 'en_GB' };

/**
 * Pages whose English version is a real translation: UI, title and description. Only these
 * advertise an `en` hreflang alternate, a self canonical under /en and a sitemap entry. Every other
 * page still opens under /en (English menus around it), but its canonical points at the Croatian
 * root URL, because its main content is Croatian (blog posts, onboarding guide) or the same in
 * both (legal pages, which are English-only today).
 */
export const TRANSLATED_PATHS = ['/', '/services', '/about', '/marketplace', '/subscription'];

/** "/en/services" -> { lang: "EN", path: "/services" }; "/services" -> { lang: null, path: "/services" }. */
export function splitLangPath(pathname) {
  for (const [lang, prefix] of Object.entries(LANG_PREFIXES)) {
    if (pathname === prefix || pathname === `${prefix}/`) return { lang, path: '/' };
    if (pathname.startsWith(`${prefix}/`)) return { lang, path: pathname.slice(prefix.length) };
  }
  return { lang: null, path: pathname || '/' };
}

/** The prefix a language's URLs start with: "" for Croatian and for languages without one. */
export const prefixOf = (lang) => LANG_PREFIXES[lang] || '';

/** "/services" in English -> "/en/services"; "/" in English -> "/en" (vercel.json has trailingSlash: false). */
export function localizedPath(path, lang) {
  const prefix = prefixOf(lang);
  if (!prefix) return path;
  return path === '/' ? prefix : `${prefix}${path}`;
}

export const isTranslated = (path) => TRANSLATED_PATHS.includes(path);

/**
 * canonical + hreflang alternates for a root path shown in `lang`.
 * A translated page nominates itself in each language and lists every language plus x-default
 * (the Croatian root). An untranslated one always nominates the Croatian URL and lists only it.
 */
export function alternatesFor(path, lang) {
  const hrUrl = `${SITE_URL}${path}`;
  if (!isTranslated(path)) {
    return { canonical: hrUrl, alternates: [{ hreflang: HREFLANG.HR, href: hrUrl }, { hreflang: 'x-default', href: hrUrl }] };
  }
  const alternates = [{ hreflang: HREFLANG.HR, href: hrUrl }];
  for (const code of Object.keys(LANG_PREFIXES)) {
    alternates.push({ hreflang: HREFLANG[code], href: `${SITE_URL}${localizedPath(path, code)}` });
  }
  alternates.push({ hreflang: 'x-default', href: hrUrl });
  const canonical = LANG_PREFIXES[lang] ? `${SITE_URL}${localizedPath(path, lang)}` : hrUrl;
  return { canonical, alternates };
}
