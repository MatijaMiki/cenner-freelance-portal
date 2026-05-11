import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Edit2, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SEO from '../components/SEO';
import AvatarImg from '../components/Avatar';
import { API } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface BlogPostData {
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  publishedAt?: string | null;
  author: string;
  authorAvatar?: string;
  viewCount?: number;
  id?: string;
}

const fmtDate = (iso?: string | null) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('hr-HR', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return ''; }
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    API.getPublicBlogPost(slug)
      .then(setPost)
      .catch(() => setError('Post not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    API.listPublicBlogPosts()
      .then((posts: BlogPostData[]) => {
        setRelatedPosts(posts.filter(p => p.slug !== slug).slice(0, 3));
      })
      .catch(() => {});
  }, [slug]);

  const canonical = slug ? `/blog/${slug}` : '/blog';

  return (
    <div className="min-h-screen bg-brand-black pt-12 pb-24">
      {post ? (
        <SEO
          title={post.title}
          canonical={canonical}
          description={post.excerpt || post.title}
          ogType="article"
          ogImage={post.coverImage || undefined}
          jsonLd={[
            {
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.excerpt || undefined,
              image: post.coverImage || undefined,
              datePublished: post.publishedAt || undefined,
              dateModified: post.publishedAt || undefined,
              wordCount: post.content ? post.content.trim().split(/\s+/).length : undefined,
              articleSection: 'Freelance',
              keywords: `freelance hrvatska, ${post.title.toLowerCase()}`,
              inLanguage: 'hr',
              author: { '@type': 'Person', name: post.author },
              publisher: {
                '@type': 'Organization',
                name: 'Cenner',
                url: 'https://cenner.hr',
                logo: { '@type': 'ImageObject', url: 'https://cenner.hr/favicon.svg' },
              },
              mainEntityOfPage: { '@type': 'WebPage', '@id': `https://cenner.hr${canonical}` },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Početna', item: 'https://cenner.hr' },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://cenner.hr/blog' },
                { '@type': 'ListItem', position: 3, name: post.title, item: `https://cenner.hr${canonical}` },
              ],
            },
          ]}
        />
      ) : (
        <SEO title="Loading…" canonical={canonical} noIndex />
      )}

      <article className="max-w-3xl mx-auto px-4 lg:px-12">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        {loading && <div className="text-gray-500 text-sm">Loading…</div>}
        {!loading && error && <div className="text-red-400 text-sm">{error}</div>}

        {post && (
          <>
            <header className="mb-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.05] mb-6">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-xl text-gray-400 leading-relaxed mb-8">{post.excerpt}</p>
              )}
              <div className="flex items-center justify-between flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <AvatarImg src={post.authorAvatar} name={post.author} size={32} className="rounded-full" />
                  <span className="font-bold text-gray-300">{post.author}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                  {post.publishedAt && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{fmtDate(post.publishedAt)}</span>
                    </div>
                  )}
                  {isAdmin && post.id && (
                    <Link
                      to={`/blog-admin/${post.id}`}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-white"
                    >
                      <Edit2 size={14} /> Edit
                    </Link>
                  )}
                </div>
              </div>
            </header>

            {post.coverImage && (
              <div className="rounded-2xl overflow-hidden mb-10 bg-black/40">
                <img src={post.coverImage} alt={post.title} className="w-full" />
              </div>
            )}

            <div className="blog-content text-gray-300 leading-relaxed space-y-5 text-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...p }) => <h2 className="text-3xl font-black text-white mt-10 mb-4 tracking-tight" {...p} />,
                  h2: ({ node, ...p }) => <h2 className="text-3xl font-black text-white mt-10 mb-4 tracking-tight" {...p} />,
                  h3: ({ node, ...p }) => <h3 className="text-2xl font-black text-white mt-8 mb-3 tracking-tight" {...p} />,
                  h4: ({ node, ...p }) => <h4 className="text-xl font-black text-white mt-6 mb-3" {...p} />,
                  p:  ({ node, ...p }) => <p className="text-gray-300 leading-relaxed" {...p} />,
                  a:  ({ node, ...p }) => <a className="text-brand-pink underline underline-offset-2 hover:text-brand-pink/80" target="_blank" rel="noopener noreferrer" {...p} />,
                  ul: ({ node, ...p }) => <ul className="list-disc list-outside pl-6 space-y-2" {...p} />,
                  ol: ({ node, ...p }) => <ol className="list-decimal list-outside pl-6 space-y-2" {...p} />,
                  li: ({ node, ...p }) => <li className="text-gray-300" {...p} />,
                  blockquote: ({ node, ...p }) => <blockquote className="border-l-4 border-brand-pink pl-5 italic text-gray-400" {...p} />,
                  code: ({ node, ...p }) => <code className="bg-white/10 text-brand-green px-1.5 py-0.5 rounded text-sm font-mono" {...p} />,
                  pre:  ({ node, ...p }) => <pre className="bg-white/5 border border-white/10 p-4 rounded-xl overflow-x-auto text-sm" {...p} />,
                  hr:   () => <hr className="border-white/10 my-10" />,
                  img:  ({ node, ...p }) => <img className="rounded-xl my-6 w-full" loading="lazy" {...p} />,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </>
        )}

        {relatedPosts.length > 0 && (
          <aside className="mt-20 pt-10 border-t border-white/10">
            <div className="flex items-center gap-2 text-brand-green text-xs font-black uppercase tracking-widest mb-6">
              <BookOpen size={14} />
              <span>Više s bloga</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedPosts.map(r => (
                <Link
                  key={r.slug}
                  to={`/blog/${r.slug}`}
                  className="group block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-green/30 rounded-2xl p-4 transition-all"
                >
                  {r.coverImage && (
                    <img
                      src={r.coverImage}
                      alt={r.title}
                      className="w-full h-28 object-cover rounded-xl mb-3"
                      loading="lazy"
                    />
                  )}
                  <p className="text-sm font-bold text-white group-hover:text-brand-green transition-colors leading-snug line-clamp-2">
                    {r.title}
                  </p>
                  {r.excerpt && (
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{r.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </aside>
        )}
      </article>
    </div>
  );
};

export default BlogPost;
