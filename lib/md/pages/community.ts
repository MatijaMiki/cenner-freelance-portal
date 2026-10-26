/**
 * /community as markdown. Keep in step with pages/Community.tsx. The posts are user-written, so
 * only their titles and channels are listed (no bodies, no authors), and private ones never.
 */
import { API_BASE, fetchJson } from '../../../api/_lib/upstream.js';
import type { CommunityPost } from '../../../types';
import { blocks, h2, h3, list, type PageModule } from '../format';

const MAX_POSTS = 20;

const GUIDELINES = [
  { title: 'Be respectful and courteous', content: 'Keep it professional at all times. Disruptive users will be removed.' },
  { title: 'No Spam or Self-Promo', content: 'Only relevant industry discussion allowed here.' },
  { title: 'Keep the quality high', content: 'Focus on high-quality work and collaborative growth.' },
];

/** The page's list, ordered the same way (most votes first). Null when the API can't be read. */
async function latestPosts(): Promise<CommunityPost[] | null> {
  try {
    const res = await fetchJson(`${API_BASE}/api/v1/portal/community/posts`);
    if ('missing' in res || !Array.isArray(res.data)) return null;
    return (res.data as CommunityPost[])
      .filter((p) => !p.isPrivate && p.title)
      .sort((a, b) => b.votes - a.votes)
      .slice(0, MAX_POSTS);
  } catch (err) {
    console.warn('[md] community posts unavailable:', (err as Error).message);
    return null;
  }
}

export const render: PageModule['render'] = async () => {
  const posts = await latestPosts();
  return {
    title: 'Community Pulse',
    summary:
      'Diskutirajte, dijelite iskustva i postavljajte pitanja s drugim freelancerima i klijentima u Cenner zajednici.',
    path: '/community',
    body: blocks(
      posts && h2('Posts'),
      posts && (posts.length ? list(posts.map((p) => `${p.title} (c/${p.category.replace(/\s/g, '')})`)) : 'No Posts Yet'),
      h2('Community Guidelines'),
      ...GUIDELINES.map((g) => blocks(h3(g.title), g.content)),
    ),
    related: [{ text: 'Marketplace', href: '/marketplace' }],
  };
};
