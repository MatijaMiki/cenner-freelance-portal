import React from 'react';
import { Helmet } from 'react-helmet-async';

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
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Freelance Platforma Hrvatska`;
  const fullCanonical = canonical ? `${BASE_URL}${canonical}` : undefined;
  const fullKeywords = keywords ? `${keywords}, ${BASE_KEYWORDS}` : BASE_KEYWORDS;

  // Support both a single JSON-LD object and an array of schemas
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content="Cenner" />
      <meta name="geo.region" content="HR" />
      <meta name="geo.placename" content="Croatia" />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}

      {/* hreflang — Croatian primary market */}
      {fullCanonical && <link rel="alternate" hrefLang="hr-HR" href={fullCanonical} />}
      {fullCanonical && <link rel="alternate" hrefLang="x-default" href={fullCanonical} />}

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
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
