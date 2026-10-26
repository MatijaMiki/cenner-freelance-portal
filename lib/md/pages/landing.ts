/**
 * /usluge/:slug and /freelanceri/:city as markdown, from the same copy the static pages are
 * generated from. The fixed sentences mirror serviceBody() and cityBody() in
 * scripts/generate-landing-pages.mjs; keep them in step.
 */
import { services, cities } from '../../../content/landing/pages.mjs';
import { sortedBlogPosts } from '../../../content/blog/posts.mjs';
import { blocks, h2, inlineHtml, link, list, type PageModule } from '../format';

const TOOLS = [
  `${link('Cenner Links', 'https://links.cenner.hr')}: Link-in-bio stranica za kreatore: sve tvoje poveznice na jednom mjestu.`,
  `${link('Shorten', 'https://shorten.cenner.hr')}: Skraćivač poveznica s brojanjem klikova po državama.`,
];

export const service: PageModule = {
  render: ({ slug }) => {
    const svc = services.find((s) => s.slug === slug);
    if (!svc) return null;
    const guides = sortedBlogPosts().filter((p) => p.services.includes(svc.slug));
    return {
      title: svc.h1,
      summary: svc.description,
      path: `/usluge/${svc.slug}`,
      body: blocks(
        inlineHtml(svc.intro),
        ...svc.sections.flatMap((s) => [h2(s.h2), ...s.body.map(inlineHtml)]),
        h2('Spreman za početak?'),
        'Cenner ti pomaže pronaći pravog freelancera u par minuta. Bez agencijskih marži, bez skrivenih troškova, uz osigurano plaćanje.',
        h2('Povezane usluge'),
        list(
          svc.related.map((r) => {
            const other = services.find((x) => x.slug === r);
            return other ? link(other.h1, `/usluge/${other.slug}`) : null;
          }),
        ),
        guides.length ? h2('Vodiči s bloga') : '',
        list(guides.map((p) => link(p.title, `/blog/${p.slug}`))),
        h2('Cenner alati'),
        list(TOOLS),
      ),
      related: [
        { text: 'Marketplace', href: '/marketplace' },
        { text: 'Usluge Cenner tima', href: '/services' },
      ],
    };
  },
  list: () => services.map((s) => ({ path: `/usluge/${s.slug}`, title: s.h1, summary: s.description })),
};

export const city: PageModule = {
  render: ({ city: slug }) => {
    const c = cities.find((x) => x.slug === slug);
    if (!c) return null;
    return {
      title: c.h1,
      summary: c.description,
      path: `/freelanceri/${c.slug}`,
      body: blocks(
        inlineHtml(c.intro),
        h2(`Što čini ${c.acc} jakim freelance tržištem?`),
        inlineHtml(c.extra),
        h2(`Najtraženije kategorije u ${c.loc}`),
        list([
          link('Izrada web stranica', '/usluge/izrada-web-stranica'),
          link('Dizajn loga i vizualnog identiteta', '/usluge/dizajn-loga'),
          link('SEO optimizacija', '/usluge/seo-optimizacija'),
          link('Digitalni marketing', '/usluge/digitalni-marketing'),
          link('WordPress izrada', '/usluge/wordpress-izrada'),
          link('Web developeri', '/usluge/web-developeri'),
        ]),
        h2('Kako Cenner radi?'),
        `Klikni "Pronađi freelancera", opiši svoj projekt u par rečenica, i naš AI ti predlaže najprikladnije kandidate iz ${c.gen} i okolice. Pregledaj njihove portfolije, ocjene i prethodne radove. Plaćanje je osigurano kroz escrow. Plaćaš tek kad si zadovoljan.`,
        h2('Freelanceri u drugim gradovima'),
        list(cities.filter((o) => o.slug !== c.slug).map((o) => link(`Freelanceri ${o.name}`, `/freelanceri/${o.slug}`))),
        h2('Cenner alati'),
        list(TOOLS),
      ),
      related: [{ text: 'Marketplace', href: '/marketplace' }],
    };
  },
  list: () => cities.map((c) => ({ path: `/freelanceri/${c.slug}`, title: c.h1, summary: c.description })),
};
