/** /marketplace as markdown. Keep in step with pages/Marketplace.tsx. */
import { API_BASE, fetchJson } from '../../../api/_lib/upstream.js';
import { blocks, clean, eur, h2, link, t, type PageModule } from '../format';
import { AI_SUMMARIES } from '../summaries.mjs';

export const aiSummary: string = AI_SUMMARIES['/marketplace'];

/** Listings shown in the markdown, newest-ranked first as the API returns them. */
const LIMIT = 50;

interface Listing {
  id: string;
  title: string;
  category?: string;
  price: number;
  freelancerName?: string;
}

export const render: PageModule['render'] = async () => {
  // Same source as the page (contexts/DataContext.tsx -> API.getListings()).
  const { data } = (await fetchJson(`${API_BASE}/api/v1/portal/listings`)) as { data?: Listing[] };
  const listings = Array.isArray(data) ? data.slice(0, LIMIT) : [];

  return {
    title: t('Marketplace'),
    summary: aiSummary,
    path: '/marketplace',
    body: blocks(
      t("The world's most advanced hub for digital synchronization."),
      h2(t('Find Experts')),
      listings.length
        ? listings
            .map((l) => {
              const meta = [l.category, `${t('from (price)')} ${eur(l.price)}`, l.freelancerName].filter(Boolean).map((s) => clean(String(s)));
              return `- ${link(l.title, `/service/${encodeURIComponent(l.id)}`)} - ${meta.join(', ')}`;
            })
            .join('\n')
        : t('Nothing here yet. Be the first to post.'),
    ),
    related: [
      { text: t('Services'), href: '/services' },
      { text: t('Pricing'), href: '/subscription' },
    ],
  };
};
