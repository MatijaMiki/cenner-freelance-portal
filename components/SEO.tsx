import React from 'react';
import { Helmet } from 'react-helmet-async';
import { matchMdRoute, mdPathOf } from '../lib/md/routes.mjs';
import { alternatesFor, LANG_PREFIXES, OG_LOCALE } from '../lib/langRoutes.mjs';
import { useLanguage } from '../i18n';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  ogLocale?: string;
  noIndex?: boolean;
  jsonLd?: object | object[];
  keywords?: string;
  /** <meta name="ai-summary">; defaults to the description. Key pages take theirs from lib/md/summaries.mjs. */
  aiSummary?: string;
  /**
   * The English title/description/keywords, used under /en (lib/langRoutes.mjs). A page in
   * TRANSLATED_PATHS must pass this; elsewhere the Croatian ones are kept, with the canonical on
   * the Croatian URL.
   */
  en?: { title: string; description: string; keywords?: string };
}

const BASE_URL = 'https://cenner.hr';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'Cenner';

// Core keyword set injected on every page — kept short so per-page keywords stay focused
const BASE_KEYWORDS = 'freelance hrvatska, honorarni posao, izrada web stranica, freelance platforma, najam freelancera';

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  ogLocale = 'hr_HR',
  noIndex = false,
  jsonLd,
  keywords,
  aiSummary,
  en,
}) => {
  const { lang } = useLanguage();
  // Under a language prefix (/en/...) the English copy, when the page has one.
  const prefixed = lang in LANG_PREFIXES;
  const english = prefixed && en ? en : undefined;
  if (english) {
    title = english.title;
    description = english.description;
    keywords = english.keywords;
    aiSummary = english.description;
  }
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME}: Freelance Platforma Hrvatska`;
  // canonical is the page's root (Croatian) path; lib/langRoutes.mjs turns it into this language's
  // URL and the hreflang set (a self canonical per language, x-default = the Croatian root).
  const links = canonical ? alternatesFor(canonical, english ? lang : 'HR') : undefined;
  const fullCanonical = links?.canonical;
  // Only pages that really have a markdown version (lib/md/routes.mjs) advertise one. The markdown
  // is the Croatian copy, so the English page doesn't point at it.
  const markdownHref = canonical && !noIndex && !english && matchMdRoute(canonical) ? `${BASE_URL}${mdPathOf(canonical)}` : undefined;
  const summary = noIndex ? undefined : aiSummary || description;
  // The base set is Croatian search terms: only for the Croatian page.
  const fullKeywords = english ? keywords : keywords ? `${keywords}, ${BASE_KEYWORDS}` : BASE_KEYWORDS;
  if (english) ogLocale = (OG_LOCALE as Record<string, string>)[lang] || ogLocale;

  // Support both a single JSON-LD object and an array of schemas
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  // SECURITY: JSON.stringify does NOT escape `<`, `>` or `&`, so user-controlled fields
  // (bio, listing title/description, etc.) fed into a JSON-LD <script> could break out
  // with `</script>`. Escape those to their \u-encoded forms — still valid JSON, but
  // inert as markup. Also escape the JS line/paragraph separators.
  const safeJsonLd = (obj: object): string =>
    JSON.stringify(obj)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {fullKeywords && <meta name="keywords" content={fullKeywords} />}
      <meta name="author" content="Cenner" />
      <meta name="geo.region" content="HR" />
      <meta name="geo.placename" content="Croatia" />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}

      {/* hreflang: Croatian at the root (also x-default), English under /en where translated */}
      {links?.alternates.map(a => <link key={a.hreflang} rel="alternate" hrefLang={a.hreflang} href={a.href} />)}

      {/* For AI agents: a one-line summary and the page's markdown version */}
      {summary && <meta name="ai-summary" content={summary} />}
      {markdownHref && <link rel="alternate" type="text/markdown" href={markdownHref} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={ogLocale} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@cennerhr" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD — each schema as its own script block for AI Overview compatibility */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {safeJsonLd(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
