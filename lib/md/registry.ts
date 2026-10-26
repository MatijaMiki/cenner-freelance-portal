/**
 * Route id (lib/md/routes.mjs) -> markdown renderer. One entry per page; everything else (the .md
 * URLs, Accept negotiation, the catalog, llms.txt, llms-full.txt) is derived from this and
 * MD_ROUTES. scripts/check-md-coverage.mjs fails when an MD_ROUTES id has no entry here.
 */
import { MD_ROUTES, matchMdRoute, mdPathOf } from './routes.mjs';
import type { MdEntry, MdPage, PageModule } from './format';
import * as about from './pages/about';
import * as blog from './pages/blog';
import * as cjenik from './pages/cjenik';
import * as community from './pages/community';
import * as cookies from './pages/cookies';
import * as entities from './pages/entities';
import * as home from './pages/home';
import * as landing from './pages/landing';
import * as marketplace from './pages/marketplace';
import * as onboarding from './pages/onboarding';
import * as privacy from './pages/privacy';
import * as ranwhat from './pages/ranwhat';
import * as services from './pages/services';
import * as subscription from './pages/subscription';
import * as terms from './pages/terms';

export const RENDERERS: Record<string, PageModule> = {
  home,
  marketplace,
  services,
  subscription,
  about,
  cjenik,
  ranwhat,
  community,
  'landing-service': landing.service,
  'landing-city': landing.city,
  blog: blog.index,
  'blog-post': blog.post,
  onboarding,
  service: entities.service,
  freelancer: entities.freelancer,
  privacy,
  terms,
  cookies,
};

export interface CatalogEntry extends MdEntry {
  /** The .md URL path. */
  md: string;
  section: string | null;
}

/** Render one HTML path; null when the path has no markdown version or the entity is gone. */
export async function renderMarkdownPath(path: string): Promise<MdPage | null> {
  const hit = matchMdRoute(path);
  if (!hit) return null;
  const mod = RENDERERS[hit.route.id];
  return mod ? mod.render(hit.params) : null;
}

/**
 * Every addressable markdown route: static pages once, pattern routes expanded through their
 * `list()`. A pattern without `list()` (freelancer profiles) is left out. A `list()` that fails
 * (API down) drops only its own entries.
 */
export async function listMarkdownRoutes(): Promise<CatalogEntry[]> {
  const out: CatalogEntry[] = [];
  for (const route of MD_ROUTES) {
    const mod = RENDERERS[route.id];
    if (!mod) continue;
    if (!route.path.includes(':')) {
      try {
        const page = await mod.render({});
        if (page) out.push({ path: route.path, md: mdPathOf(route.path), title: page.title, summary: page.summary, section: route.section });
      } catch (err) {
        console.warn(`[md] catalog: ${route.path} failed:`, (err as Error).message);
      }
      continue;
    }
    if (!mod.list) continue;
    try {
      for (const e of await mod.list()) out.push({ ...e, md: mdPathOf(e.path), section: route.section });
    } catch (err) {
      console.warn(`[md] catalog: ${route.path} list failed:`, (err as Error).message);
    }
  }
  return out;
}
