import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, PenTool, Settings } from 'lucide-react';
import SEO from '../components/SEO';
import AvatarImg from '../components/Avatar';
import { API } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface BlogListItem {
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: string | null;
  author: string;
  authorAvatar?: string;
}

const fmtDate = (iso?: string | null) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('hr-HR', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return ''; }
};

const Blog: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    API.listPublicBlogPosts()
      .then(setPosts)
      .catch(() => setError('Could not load posts'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-brand-black pt-12 pb-24">
      <SEO
        title="Blog — Freelance Savjeti i Vodiči"
        canonical="/blog"
        description="Vodiči, savjeti i vijesti o freelancingu u Hrvatskoj i EU. Otvaranje paušalnog obrta, ugovori, cijene, alati i sve ostalo što trebate znati kao slobodni radnik."
        keywords="freelance blog hrvatska, paušalni obrt vodič, freelancing savjeti, slobodni radnik blog, freelance hrvatska vijesti"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Cenner Blog',
          description: 'Vodiči i savjeti za freelancere i klijente u Hrvatskoj i EU.',
          url: 'https://cenner.hr/blog',
          inLanguage: ['hr', 'en'],
          publisher: {
            '@type': 'Organization',
            name: 'Cenner',
            url: 'https://cenner.hr',
            logo: { '@type': 'ImageObject', url: 'https://cenner.hr/favicon.svg' },
          },
        }}
      />

      <div className="max-w-5xl mx-auto px-4 lg:px-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter">Blog</h1>
            <p className="text-gray-500 mt-3 text-lg">Vodiči, savjeti i vijesti o freelancingu u Hrvatskoj.</p>
          </div>
          {isAdmin && (
            <Link
              to="/blog-admin"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 text-xs font-black uppercase tracking-widest transition-colors"
            >
              <Settings size={14} /> Manage
            </Link>
          )}
        </div>

        {loading && (
          <div className="text-gray-500 text-sm">Loading…</div>
        )}

        {!loading && error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="border border-white/10 rounded-2xl p-12 text-center">
            <PenTool size={32} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 font-medium">No posts yet.</p>
            {isAdmin && (
              <Link to="/blog-admin" className="inline-block mt-4 text-brand-pink font-black text-sm uppercase tracking-widest">
                Write the first one →
              </Link>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {posts.map(p => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="group block bg-brand-grey border border-white/5 rounded-3xl overflow-hidden hover:border-white/20 transition-all"
            >
              {p.coverImage && (
                <div className="aspect-[16/9] bg-black/40 overflow-hidden">
                  <img
                    src={p.coverImage}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-7">
                <h2 className="text-2xl font-black text-white tracking-tight mb-3 group-hover:text-brand-pink transition-colors">
                  {p.title}
                </h2>
                {p.excerpt && (
                  <p className="text-gray-400 leading-relaxed line-clamp-3 mb-5">{p.excerpt}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <AvatarImg src={p.authorAvatar} name={p.author} size={20} className="rounded-full" />
                    <span className="font-bold text-gray-400">{p.author}</span>
                  </div>
                  {p.publishedAt && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{fmtDate(p.publishedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
