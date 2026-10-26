/**
 * /service/:id and /freelancer/:id as markdown, from the public API endpoints api/render.js uses
 * for their HTML heads, plus the listing collection the Marketplace loads (it carries the delivery
 * time and inclusions the public detail endpoint leaves out). Keep in step with
 * pages/ServiceDetails.tsx and pages/FreelancerProfile.tsx.
 */
import { API_BASE, fetchJson } from '../../../api/_lib/upstream.js';
import { blocks, clean, day, eur, h2, link, list, table, type PageModule } from '../format';

interface Listing {
  id: string;
  title: string;
  description: string;
  category?: string;
  price: number;
  deliveryTime?: string;
  includes?: string[];
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
  freelancerId: string;
  freelancerName: string;
  freelancerLocation?: string;
}

/** Every live listing; throws when the API is unreachable (the handler answers 503). */
async function listings(): Promise<Listing[]> {
  const res = await fetchJson(`${API_BASE}/api/v1/portal/listings`);
  return 'data' in res && Array.isArray(res.data) ? res.data : [];
}

const summaryOf = (l: Listing) =>
  `${l.title}: ${l.category ? `${l.category}, ` : ''}od ${eur(l.price)}, isporučuje ${l.freelancerName} preko Cennera.`;

export const service: PageModule = {
  render: async ({ id }) => {
    const res = await fetchJson(`${API_BASE}/api/v1/public/listings/${encodeURIComponent(id)}`);
    if (!('data' in res)) return null;
    const pub = res.data as Listing;
    const full = (await listings()).find((l) => l.id === pub.id);
    const l: Listing = { ...full, ...pub };
    const rows: [string, string][] = [
      ['Kategorija', l.category || ''],
      ['Cijena', `od ${eur(l.price)}`],
      ['Rok isporuke', l.deliveryTime || ''],
      ['Freelancer', l.freelancerName],
      ['Lokacija', l.freelancerLocation || ''],
      ['Ocjena', l.reviewsCount ? `${l.rating}/5 (${l.reviewsCount} recenzija)` : 'još nema recenzija'],
    ];
    return {
      title: l.title,
      summary: summaryOf(l),
      path: `/service/${l.id}`,
      lastUpdated: day(l.createdAt),
      body: blocks(
        table(['', ''], rows.filter(([, v]) => v)),
        h2('Opis'),
        clean(l.description),
        l.includes?.length ? h2('Uključeno') : '',
        l.includes?.length ? list(l.includes) : '',
        'Plaćanje ide kroz Cenner i freelanceru se oslobađa nakon isporuke.',
      ),
      related: [
        { text: `Profil: ${l.freelancerName}`, href: `/freelancer/${l.freelancerId}` },
        { text: 'Marketplace', href: '/marketplace' },
      ],
    };
  },
  list: async () => (await listings()).map((l) => ({ path: `/service/${l.id}`, title: l.title, summary: summaryOf(l) })),
};

interface Freelancer {
  id: string;
  name: string;
  bio?: string;
  location?: string;
  skills?: string[];
  avgRating?: number | null;
  reviewCount?: number;
}

export const freelancer: PageModule = {
  render: async ({ id }) => {
    const res = await fetchJson(`${API_BASE}/api/v1/public/freelancers/${encodeURIComponent(id)}`);
    if (!('data' in res)) return null;
    const u = res.data as Freelancer;
    const theirs = (await listings()).filter((l) => l.freelancerId === u.id);
    return {
      title: u.name,
      summary: clean(u.bio || `Profil freelancera ${u.name} na Cenner platformi.`).slice(0, 200),
      path: `/freelancer/${u.id}`,
      body: blocks(
        list([
          u.location ? `Lokacija: ${u.location}` : '',
          u.skills?.length ? `Vještine: ${u.skills.join(', ')}` : '',
          u.reviewCount ? `Ocjena: ${u.avgRating}/5 (${u.reviewCount} recenzija)` : '',
        ]),
        u.bio ? h2('O meni') : '',
        u.bio ? clean(u.bio) : '',
        theirs.length ? h2('Usluge') : '',
        list(theirs.map((l) => `${link(l.title, `/service/${l.id}`)} - od ${eur(l.price)}`)),
      ),
      related: [{ text: 'Marketplace', href: '/marketplace' }],
    };
  },
};
