/**
 * /blog and /blog/:slug as markdown. Posts written in the repo (content/blog/posts.mjs) come first
 * and win over a CMS post with the same slug, as in pages/Blog.tsx and pages/BlogPost.tsx.
 */
import { BLOG_POSTS, findBlogPost, sortedBlogPosts } from '../../../content/blog/posts.mjs';
import { API_BASE, fetchJson } from '../../../api/_lib/upstream.js';
import { absolutizeLinks, blocks, day, link, list, type MdEntry, type PageModule } from '../format';

interface CmsPost {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  published?: boolean;
}

const BLOG_DESCRIPTION =
  'Vodiči za klijente i freelancere u Hrvatskoj: izrada web stranica, odabir web developera, cijene SEO optimizacije, dizajn loga i kako početi s freelanceom.';

/** Repo posts plus published CMS posts, newest first. The blog index keeps working when the API is down. */
async function allPosts(): Promise<MdEntry[]> {
  const repo = sortedBlogPosts().map((p) => ({ path: `/blog/${p.slug}`, title: p.title, summary: p.excerpt, at: p.publishedAt }));
  let cms: CmsPost[] = [];
  try {
    const res = await fetchJson(`${API_BASE}/api/v1/public/blog`);
    if ('data' in res && Array.isArray(res.data)) cms = res.data;
  } catch (err) {
    console.warn('[md] CMS blog list unavailable:', (err as Error).message);
  }
  const seen = new Set(BLOG_POSTS.map((p) => p.slug));
  const extra = cms
    .filter((p) => p.slug && p.published !== false && !seen.has(p.slug))
    .map((p) => ({ path: `/blog/${p.slug}`, title: p.title, summary: p.excerpt || p.title, at: p.publishedAt || '' }));
  return [...repo, ...extra]
    .sort((a, b) => (b.at || '').localeCompare(a.at || ''))
    .map(({ path, title, summary }) => ({ path, title, summary }));
}

export const index: PageModule = {
  render: async () => {
    const posts = await allPosts();
    return {
      title: 'Blog',
      summary: BLOG_DESCRIPTION,
      path: '/blog',
      body: blocks('Vodiči za klijente i freelancere u Hrvatskoj.', list(posts.map((p) => `${link(p.title, p.path)} - ${p.summary}`))),
    };
  },
};

export const post: PageModule = {
  render: async ({ slug }) => {
    const repo = findBlogPost(slug);
    if (repo) {
      const others = sortedBlogPosts().filter((p) => p.slug !== slug).slice(0, 3);
      return {
        title: repo.title,
        summary: repo.description || repo.excerpt,
        path: `/blog/${repo.slug}`,
        lastUpdated: day(repo.updatedAt || repo.publishedAt),
        body: blocks(`Autor: ${repo.author} · Objavljeno: ${repo.publishedAt}`, absolutizeLinks(repo.content)),
        related: [
          ...repo.services.map((s: string) => ({ text: `Usluga: ${s.replace(/-/g, ' ')}`, href: `/usluge/${s}` })),
          ...others.map((p) => ({ text: p.title, href: `/blog/${p.slug}` })),
        ],
      };
    }
    // Throws when the API is unreachable; the handler answers 503 rather than a false 404.
    const res = await fetchJson(`${API_BASE}/api/v1/public/blog/${encodeURIComponent(slug)}`);
    if (!('data' in res) || !res.data || res.data.published === false) return null;
    const p = res.data as CmsPost;
    return {
      title: p.title,
      summary: p.excerpt || p.title,
      path: `/blog/${p.slug}`,
      lastUpdated: day(p.updatedAt || p.publishedAt),
      body: blocks(
        [p.author ? `Autor: ${p.author}` : '', p.publishedAt ? `Objavljeno: ${day(p.publishedAt)}` : ''].filter(Boolean).join(' · '),
        absolutizeLinks(p.content || ''),
      ),
      related: [{ text: 'Blog', href: '/blog' }],
    };
  },
  list: allPosts,
};
