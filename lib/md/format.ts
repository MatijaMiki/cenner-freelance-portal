/**
 * Markdown building blocks for lib/md. Every page renderer returns an MdPage and renderPage() lays
 * it out the same way: title, summary, canonical, date, body, related links. Links always leave
 * here absolute and point at the HTML page, never at its .md twin.
 */
import { SITE_URL } from './routes.mjs';
import { translate } from '../../i18n';

export interface MdLink {
  text: string;
  /** Absolute, or a site path ("/about", "/services#upit"). */
  href: string;
}

export interface MdPage {
  /** The page's h1. */
  title: string;
  /** One sentence; the page's meta description unless it has a better one. */
  summary: string;
  /** The HTML path this markdown stands for; becomes the canonical URL. */
  path: string;
  /** Main content only, from h2 down. No nav, footer, banners or repeated CTAs. */
  body: string;
  /** YYYY-MM-DD, only when the content really has a date. */
  lastUpdated?: string;
  related?: MdLink[];
}

/** A concrete page behind a pattern route, for the catalog and llms.txt. */
export interface MdEntry {
  path: string;
  title: string;
  summary: string;
}

/**
 * What each lib/md/pages/*.ts module exports. `render` returns null when the entity does not exist
 * (the handler answers 404). Pattern routes also export `list` so the catalog and llms files can
 * enumerate them; static routes do not need it.
 */
export interface PageModule {
  render: (params: Record<string, string>) => MdPage | null | Promise<MdPage | null>;
  list?: () => MdEntry[] | Promise<MdEntry[]>;
}

/** The page copy the visitor sees on cenner.hr (Croatian is the site's default language). */
export const t = (key: string): string => translate(key, 'HR');

/** "/about" -> "https://cenner.hr/about"; absolute, mailto: and tel: pass through. */
export function abs(href: string): string {
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
  if (href.startsWith('/')) return `${SITE_URL}${href}`;
  return `${SITE_URL}/${href.replace(/^\.?\//, '')}`;
}

/** Collapse whitespace (JSX copy is often split over lines). */
export const clean = (s: string): string => String(s ?? '').replace(/\s+/g, ' ').trim();

/** Escape the characters that would break link text or a table cell. */
const escText = (s: string): string => clean(s).replace(/([\[\]])/g, '\\$1');
const escCell = (s: string): string => clean(s).replace(/\|/g, '\\|');

export const link = (text: string, href: string): string => `[${escText(text)}](${abs(href)})`;

export const h2 = (s: string): string => `## ${clean(s)}`;
export const h3 = (s: string): string => `### ${clean(s)}`;

/** Bullet list; empty items are dropped. */
export const list = (items: (string | null | undefined | false)[]): string =>
  items.filter(Boolean).map((i) => `- ${clean(i as string)}`).join('\n');

/** Numbered list. */
export const steps = (items: string[]): string => items.map((i, n) => `${n + 1}. ${clean(i)}`).join('\n');

export function table(headers: string[], rows: (string | number)[][]): string {
  const line = (cells: (string | number)[]) => `| ${cells.map((c) => escCell(String(c))).join(' | ')} |`;
  return [line(headers), `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map(line)].join('\n');
}

/** FAQ entries as "### Question" + answer. */
export const faq = (items: { q: string; a: string }[]): string =>
  items.map(({ q, a }) => `${h3(q)}\n\n${clean(a)}`).join('\n\n');

/** "2026-10-23T11:07:02.274Z" -> "2026-10-23". */
export const day = (iso?: string | null): string | undefined => (iso ? String(iso).slice(0, 10) : undefined);

/** 800 -> "800 €" (the site writes prices this way). */
export const eur = (n: number): string => `${n.toLocaleString('hr-HR')} €`;

/** Relative markdown links in authored content ("](/usluge/x)") made absolute. */
export const absolutizeLinks = (md: string): string =>
  md.replace(/\]\((\/[^)\s]*)\)/g, (_m, href: string) => `](${abs(href)})`);

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };

/**
 * The few inline tags the hand-written landing copy uses (<strong>, <em>, <a>, <br>) as markdown.
 * This is for copy authored in this repo, not for scraping rendered pages.
 */
export function inlineHtml(s: string): string {
  return String(s ?? '')
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href: string, text: string) => link(stripTags(text), href))
    .replace(/<\/?(strong|b)>/gi, '**')
    .replace(/<\/?(em|i)>/gi, '*')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_m, e: string) => ENTITIES[e]);
}

const stripTags = (s: string): string => s.replace(/<[^>]+>/g, '');

/** Join blocks with blank lines, dropping empty ones. */
export const blocks = (...parts: (string | null | undefined | false)[]): string =>
  parts.filter((p) => p && String(p).trim()).join('\n\n');

export function renderPage(p: MdPage): string {
  const related = (p.related || []).filter((r) => r.href);
  return (
    blocks(
      `# ${clean(p.title)}`,
      `> ${clean(p.summary)}`,
      [`Canonical: ${abs(p.path)}`, p.lastUpdated ? `Last updated: ${p.lastUpdated}` : ''].filter(Boolean).join('\n'),
      p.body.trim(),
      related.length ? `## Related\n${related.map((r) => `- ${link(r.text, r.href)}`).join('\n')}` : '',
    ) + '\n'
  );
}

export function notFoundPage(path: string): string {
  return blocks(
    '# Stranica nije pronađena',
    `> Na adresi ${abs(path)} nema stranice s markdown verzijom.`,
    `Popis svih markdown stranica: ${SITE_URL}/api/md/_catalog\nPregled stranice: ${SITE_URL}/llms.txt`,
  ) + '\n';
}

/** Rough token count for X-Markdown-Tokens. */
export const approxTokens = (s: string): number => Math.ceil(s.length / 4);
