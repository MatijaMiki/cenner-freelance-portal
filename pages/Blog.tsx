import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, PenTool, Settings, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import AvatarImg from '../components/Avatar';
import BlogCover from '../components/BlogCover';
import { API } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { sortedBlogPosts } from '../content/blog/posts.mjs';

interface BlogListItem {
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: string | null;
  author: string;
  authorAvatar?: string;
}

// Posts written in the repo (content/blog/posts.mjs) are there before the API answers, and stay if it fails.
const REPO_POSTS: BlogListItem[] = sortedBlogPosts().map(p => ({
  slug: p.slug, title: p.title, excerpt: p.excerpt, publishedAt: p.publishedAt, author: p.author,
}));

/** Repo and CMS posts in one list, newest first; a CMS post never replaces a repo post with the same slug. */
const mergePosts = (cms: BlogListItem[]) => {
  const seen = new Set(REPO_POSTS.map(p => p.slug));
  return [...REPO_POSTS, ...cms.filter(p => !seen.has(p.slug))]
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('hr-HR', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return ''; }
};

const Blog: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [posts, setPosts] = useState<BlogListItem[]>(REPO_POSTS);
  const [loading, setLoading] = useState(REPO_POSTS.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    API.listPublicBlogPosts()
      .then(cms => setPosts(mergePosts(cms)))
      .catch(() => { if (REPO_POSTS.length === 0) setError('Could not load posts'); })
      .finally(() => setLoading(false));
  }, []);

  const [first, ...rest] = posts;
  const lift = 'transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#0b0c0e] focus-visible:-translate-x-1 focus-visible:-translate-y-1 focus-visible:shadow-[6px_6px_0_0_#002ca5] focus-visible:outline-none';

  const Meta = ({ p }: { p: BlogListItem }) => (
    <div className="flex items-center justify-between gap-4 text-[14px] text-slate">
      <div className="flex items-center gap-2.5">
        <AvatarImg src={p.authorAvatar} name={p.author} size={24} className="rounded-none border-2 border-ink" />
        <span className="font-display font-bold text-ink">{p.author}</span>
      </div>
      {p.publishedAt && (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} aria-hidden="true" />
          <span>{fmtDate(p.publishedAt)}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen font-text text-ink">
      <SEO
        title="Blog: Vodiči za Klijente i Freelancere"
        canonical="/blog"
        description="Vodiči za klijente i freelancere u Hrvatskoj: izrada web stranica, odabir web developera, cijene SEO optimizacije, dizajn loga i kako početi s freelanceom."
        keywords="freelance blog hrvatska, izrada web stranica vodič, seo optimizacija cijena, kako odabrati web developera, dizajn loga, freelance hrvatska"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Cenner Blog',
            description: 'Vodiči za klijente i freelancere u Hrvatskoj i EU.',
            url: 'https://cenner.hr/blog',
            inLanguage: ['hr', 'en'],
            publisher: {
              '@type': 'Organization',
              name: 'Cenner',
              url: 'https://cenner.hr',
              logo: { '@type': 'ImageObject', url: 'https://cenner.hr/favicon.svg' },
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Početna', item: 'https://cenner.hr' },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://cenner.hr/blog' },
            ],
          },
        ]}
      />

      <div className="relative z-10 mx-auto max-w-[1500px] px-4 pb-24 pt-10 md:px-8 md:pt-16">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-[clamp(2.75rem,9vw,8.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em]">Blog</h1>
            <p className="mt-8 max-w-[46ch] text-[clamp(1.125rem,1.05rem+0.5vw,1.375rem)] leading-snug">Vodiči za klijente i freelancere u Hrvatskoj.</p>
          </div>
          {isAdmin && (
            <Link
              to="/admin/blog"
              className="hidden items-center gap-2 border-2 border-ink bg-white px-5 py-3 font-display text-[15px] font-bold transition-colors hover:bg-paper2 sm:inline-flex"
            >
              <Settings size={16} aria-hidden="true" /> Manage
            </Link>
          )}
        </header>

        <div className="mt-12 md:mt-16">
          {loading && (
            <div className="text-[1rem] text-slate">Loading…</div>
          )}

          {!loading && error && (
            <div className="border-2 border-ink bg-white p-6 font-display font-bold" role="alert">{error}</div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="border-2 border-dashed border-ink/40 bg-white px-6 py-20 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border-2 border-ink">
                <PenTool size={26} aria-hidden="true" />
              </div>
              <p className="font-display text-[1.5rem] font-extrabold tracking-[-0.02em]">No posts yet.</p>
              {isAdmin && (
                <Link to="/admin/blog" className="mt-5 inline-flex items-center gap-2 font-display text-[15px] font-bold text-sky hover:text-ink">
                  Write the first one <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </div>
          )}

          {first && (
            <Link
              to={`/blog/${first.slug}`}
              className={`group grid border-2 border-ink bg-white lg:grid-cols-12 ${lift}`}
            >
              <div className="overflow-hidden border-b-2 border-ink bg-paper2 lg:col-span-7 lg:border-b-0 lg:border-r-2">
                {first.coverImage ? (
                  <img
                    src={first.coverImage}
                    alt={first.title}
                    className="aspect-[16/9] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <BlogCover seed={first.slug} className="aspect-[16/9] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
              </div>
              <div className={`flex flex-col justify-between gap-8 p-6 md:p-10 lg:col-span-5`}>
                <div>
                  <h2 className="font-display text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-extrabold leading-[1.02] tracking-[-0.03em] transition-colors group-hover:text-sky">
                    {first.title}
                  </h2>
                  {first.excerpt && (
                    <p className="mt-5 line-clamp-4 text-[1.0625rem] leading-relaxed text-ink/85">{first.excerpt}</p>
                  )}
                </div>
                <Meta p={first} />
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {rest.map(p => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className={`group flex flex-col border-2 border-ink bg-white ${lift}`}
                >
                  <div className="overflow-hidden border-b-2 border-ink bg-paper2">
                    {p.coverImage ? (
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        loading="lazy"
                        className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <BlogCover seed={p.slug} className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="flex flex-grow flex-col gap-5 p-6">
                    <div className="flex-grow">
                      <h2 className="font-display text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em] transition-colors group-hover:text-sky">
                        {p.title}
                      </h2>
                      {p.excerpt && (
                        <p className="mt-3 line-clamp-3 text-[1rem] leading-relaxed text-ink/85">{p.excerpt}</p>
                      )}
                    </div>
                    <Meta p={p} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;
