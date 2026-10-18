import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Edit2, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SEO from '../components/SEO';
import AvatarImg from '../components/Avatar';
import BlogCover from '../components/BlogCover';
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
    <div className="relative min-h-screen font-text text-ink">
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

      <article className="relative z-10 mx-auto max-w-[1500px] px-4 pb-24 pt-10 md:px-8 md:pt-14">
        <Link
          to="/blog"
          data-calm
          className="mb-10 inline-flex items-center gap-2 font-display text-[15px] font-bold hover:text-sky"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to Blog
        </Link>

        {loading && <div className="text-[1rem] text-slate">Loading…</div>}
        {!loading && error && <div className="border-2 border-ink bg-white p-6 font-display font-bold" role="alert">{error}</div>}

        {post && (
          <>
            <header data-calm className="mb-10 max-w-[62rem]">
              <h1 className="font-display text-[clamp(2.25rem,1.2rem+4.6vw,5.25rem)] font-extrabold leading-[0.98] tracking-[-0.035em]">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-8 max-w-[46ch] text-[clamp(1.125rem,1.05rem+0.5vw,1.375rem)] leading-snug">{post.excerpt}</p>
              )}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-y-2 border-ink py-4 text-[15px]">
                <div className="flex items-center gap-3">
                  <AvatarImg src={post.authorAvatar} name={post.author} size={32} className="rounded-none border-2 border-ink" />
                  <span className="font-display font-bold">{post.author}</span>
                </div>
                <div className="flex items-center gap-5 text-slate">
                  {post.publishedAt && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={15} aria-hidden="true" />
                      <span>{fmtDate(post.publishedAt)}</span>
                    </div>
                  )}
                  {isAdmin && post.id && (
                    <Link
                      to={`/admin/blog/${post.id}`}
                      className="flex items-center gap-1.5 font-display font-bold text-ink hover:text-sky"
                    >
                      <Edit2 size={15} aria-hidden="true" /> Edit
                    </Link>
                  )}
                </div>
              </div>
            </header>

            {/* An uploaded image is part of the article. Without one, the page background (PageBackdrop)
                carries the post's art, so no generated cover is repeated here. */}
            {post.coverImage && (
              <div className="mb-12 overflow-hidden border-2 border-ink bg-paper2">
                <img src={post.coverImage} alt={post.title} className="w-full" />
              </div>
            )}

            <div data-calm className="blog-content max-w-[46rem] space-y-6 text-[1.1875rem] leading-[1.7] text-ink/90">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...p }) => <h2 className="mb-4 mt-14 border-t-2 border-ink pt-5 font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink" {...p} />,
                  h2: ({ node, ...p }) => <h2 className="mb-4 mt-14 border-t-2 border-ink pt-5 font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink" {...p} />,
                  h3: ({ node, ...p }) => <h3 className="mb-3 mt-10 font-display text-[1.625rem] font-extrabold leading-tight tracking-[-0.02em] text-ink" {...p} />,
                  h4: ({ node, ...p }) => <h4 className="mb-3 mt-8 font-display text-[1.25rem] font-extrabold text-ink" {...p} />,
                  p:  ({ node, ...p }) => <p className="leading-[1.7]" {...p} />,
                  a:  ({ node, ...p }) => <a className="text-sky underline underline-offset-[3px] hover:text-ink" target="_blank" rel="noopener noreferrer" {...p} />,
                  strong: ({ node, ...p }) => <strong className="font-bold text-ink" {...p} />,
                  ul: ({ node, ...p }) => <ul className="list-outside list-disc space-y-2 pl-6 marker:text-ink" {...p} />,
                  ol: ({ node, ...p }) => <ol className="list-outside list-decimal space-y-2 pl-6 marker:font-bold marker:text-ink" {...p} />,
                  li: ({ node, ...p }) => <li {...p} />,
                  blockquote: ({ node, ...p }) => <blockquote className="border-l-4 border-sky pl-5 font-display text-[1.25rem] font-medium leading-snug text-ink" {...p} />,
                  code: ({ node, ...p }) => <code className="bg-paper2 px-1.5 py-0.5 font-mono text-[0.9em] text-ink" {...p} />,
                  pre:  ({ node, ...p }) => <pre className="overflow-x-auto border-2 border-ink bg-ink p-4 text-[0.9rem] text-white [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-white" {...p} />,
                  hr:   () => <hr className="my-12 border-t-2 border-ink" />,
                  img:  ({ node, ...p }) => <img className="my-8 w-full border-2 border-ink" loading="lazy" {...p} />,
                  table: ({ node, ...p }) => <div className="overflow-x-auto"><table className="w-full border-2 border-ink text-[1rem]" {...p} /></div>,
                  th: ({ node, ...p }) => <th className="border-2 border-ink bg-paper2 px-3 py-2 text-left font-display font-bold" {...p} />,
                  td: ({ node, ...p }) => <td className="border-2 border-ink px-3 py-2" {...p} />,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </>
        )}

        {relatedPosts.length > 0 && (
          <aside data-calm className="mt-20 border-t-2 border-ink pt-8">
            <div className="mb-6 flex items-center gap-2 font-display text-[13px] font-extrabold uppercase tracking-[0.12em] text-slate">
              <BookOpen size={15} aria-hidden="true" />
              <span>Više s bloga</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {relatedPosts.map(r => (
                <Link
                  key={r.slug}
                  to={`/blog/${r.slug}`}
                  className="group flex flex-col border-2 border-ink bg-white transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#0b0c0e] focus-visible:-translate-x-1 focus-visible:-translate-y-1 focus-visible:shadow-[6px_6px_0_0_#002ca5] focus-visible:outline-none"
                >
                  {r.coverImage ? (
                    <img
                      src={r.coverImage}
                      alt={r.title}
                      className="h-36 w-full border-b-2 border-ink object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <BlogCover seed={r.slug} className="h-36 w-full border-b-2 border-ink object-cover" />
                  )}
                  <div className="p-5">
                    <p className="line-clamp-2 font-display text-[1.125rem] font-extrabold leading-snug transition-colors group-hover:text-sky">
                      {r.title}
                    </p>
                    {r.excerpt && (
                      <p className="mt-2 line-clamp-2 text-[0.95rem] text-slate">{r.excerpt}</p>
                    )}
                  </div>
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
