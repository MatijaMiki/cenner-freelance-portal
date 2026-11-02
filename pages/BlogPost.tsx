import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Components } from 'react-markdown';
import { createPortal } from 'react-dom';
import { ArrowLeft, Calendar, Edit2, BookOpen, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SEO from '../components/SEO';
import AvatarImg from '../components/Avatar';
import BlogCover from '../components/BlogCover';
import { API } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { BLOG_POSTS, findBlogPost } from '../content/blog/posts.mjs';

interface BlogPostData {
  slug: string;
  title: string;
  /** Repo posts only: a shorter <title> and a meta description written for search. */
  seoTitle?: string;
  description?: string;
  keywords?: string[];
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

// Markdown links: a site path opens in the same tab through the router, anything else in a new one.
/**
 * An article image that opens full screen on click, so a screenshot can be read. The picture grows from where it
 * sits to fit the screen and shrinks back on close (Esc, a click or the button), over a light veil. The page
 * does not scroll while it is open (the scrollbar stays, so nothing on the page reflows or redraws).
 */
const ZOOM_MS = 200;
type Box = { left: number; top: number; width: number; height: number };

const fitBox = (img: HTMLImageElement): Box => {
  const ratio = (img.naturalWidth || 16) / (img.naturalHeight || 9);
  const maxW = window.innerWidth * 0.96, maxH = window.innerHeight * 0.92;
  const width = Math.min(maxW, maxH * ratio), height = width / ratio;
  return { left: (window.innerWidth - width) / 2, top: (window.innerHeight - height) / 2, width, height };
};
const boxOf = (el: Element): Box => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };

// The part of the thumbnail that is not on screen or under the sticky nav, in px from its top and bottom edges. The
// picture starts clipped to what can be seen, so it never covers the nav (or the screen's edge) on the first frame.
type Cut = { t: number; b: number };
const cutOf = (el: Element): Cut => {
  const r = el.getBoundingClientRect();
  const nav = document.querySelector('nav');
  const navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
  return { t: Math.max(0, Math.min(r.height, navBottom - r.top)), b: Math.max(0, Math.min(r.height, r.bottom - window.innerHeight)) };
};

const ZoomImg: Components['img'] = ({ node, ...p }) => {
  const thumb = React.useRef<HTMLImageElement>(null);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);     // false: the veil is clear and the picture sits on its thumbnail
  const [box, setBox] = useState<Box | null>(null);
  const [cut, setCut] = useState<Cut>({ t: 0, b: 0 });
  const closing = React.useRef(false);

  const open = async () => {
    const el = thumb.current;
    if (!el || mounted) return;
    closing.current = false;
    // Have the picture decoded before it replaces the thumbnail, so there is no blank frame in between.
    try { const pre = new Image(); pre.src = p.src || ''; await pre.decode(); } catch { /* shows when it loads */ }
    if (!thumb.current) return;
    setBox(boxOf(thumb.current));
    setCut(cutOf(thumb.current));
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!thumb.current) return;
      setBox(fitBox(thumb.current));
      setCut({ t: 0, b: 0 });
      setShown(true);
    }));
  };
  const close = () => {
    if (closing.current || !thumb.current) return;
    closing.current = true;
    setBox(boxOf(thumb.current));   // where the thumbnail is now, in case the page moved
    setCut(cutOf(thumb.current));
    setShown(false);
    window.setTimeout(() => { setMounted(false); closing.current = false; }, ZOOM_MS);
  };

  useEffect(() => {
    if (!mounted) return;
    // No scrolling while it is open, without touching overflow: that would remove the scrollbar and reflow the page.
    const x0 = window.scrollX, y0 = window.scrollY;
    const stop = (e: Event) => e.preventDefault();
    const hold = () => { if (window.scrollY !== y0 || window.scrollX !== x0) window.scrollTo(x0, y0); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if ([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
    };
    const onResize = () => { if (thumb.current && !closing.current) setBox(fitBox(thumb.current)); };
    window.addEventListener('wheel', stop, { passive: false });
    window.addEventListener('touchmove', stop, { passive: false });
    window.addEventListener('scroll', hold);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
      window.removeEventListener('scroll', hold);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [mounted]);

  const ease = `${ZOOM_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
  return (
    <>
      <button type="button" onClick={open} aria-label={`Povećaj sliku: ${p.alt || ''}`} className="my-8 block w-full cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky">
        <img ref={thumb} className="w-full border-2 border-ink" style={{ visibility: shown ? 'hidden' : 'visible' }} loading="lazy" {...p} />
      </button>
      {mounted && box && createPortal(
        <>
          {/* The veil dims the whole page, nav included, with a quick fade; the picture sits over it. */}
          <div aria-hidden="true" onClick={close}
            className="fixed inset-0 z-[45] cursor-zoom-out motion-reduce:!transition-none"
            style={{ background: 'rgba(11,12,14,0.5)', opacity: shown ? 1 : 0, transition: `opacity ${shown ? ZOOM_MS : Math.round(ZOOM_MS * 0.6)}ms ease` }} />
          <div role="dialog" aria-modal="true" aria-label={p.alt || 'Slika'} className="pointer-events-none fixed inset-0 z-[60]">
            <img src={p.src} alt={p.alt} onClick={close}
              className="pointer-events-auto fixed cursor-zoom-out border-4 border-ink object-fill motion-reduce:!transition-none"
              style={{ left: box.left, top: box.top, width: box.width, height: box.height, clipPath: `inset(${cut.t}px 0 ${cut.b}px 0)`, transition: `left ${ease}, top ${ease}, width ${ease}, height ${ease}, clip-path ${ease}` }} />
            <button type="button" onClick={close} aria-label="Zatvori"
              className="pointer-events-auto fixed bottom-4 left-4 border-2 border-ink bg-white p-2 text-ink hover:bg-ink hover:text-white"
              style={{ opacity: shown ? 1 : 0, transition: 'opacity 120ms ease' }}>
              <X size={22} aria-hidden="true" />
            </button>
          </div>
        </>,
        document.body,
      )}
    </>
  );
};

const MdLink: Components['a'] = ({ node, href = '', ...p }) =>
  href.startsWith('/')
    ? <Link to={href} className="text-sky underline underline-offset-[3px] hover:text-ink" {...p} />
    : <a href={href} className="text-sky underline underline-offset-[3px] hover:text-ink" target="_blank" rel="noopener noreferrer" {...p} />;

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  // A post written in the repo (content/blog/posts.mjs) needs no API call; its page is also prerendered.
  const repoPost = slug ? findBlogPost(slug) : null;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([]);

  useEffect(() => {
    if (!slug) return;
    if (repoPost) {
      setPost(repoPost);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    API.getPublicBlogPost(slug)
      .then(setPost)
      .catch(() => setError('Post not found'))
      .finally(() => setLoading(false));
  }, [slug, repoPost]);

  useEffect(() => {
    const others = (posts: BlogPostData[]) => posts.filter(p => p.slug !== slug);
    setRelatedPosts(others(BLOG_POSTS).slice(0, 3));
    API.listPublicBlogPosts()
      .then((posts: BlogPostData[]) => {
        const repoSlugs = new Set(BLOG_POSTS.map(p => p.slug));
        setRelatedPosts(others([...BLOG_POSTS, ...posts.filter(p => !repoSlugs.has(p.slug))]).slice(0, 3));
      })
      .catch(() => {});
  }, [slug]);

  const canonical = slug ? `/blog/${slug}` : '/blog';

  return (
    <div className="relative min-h-screen font-text text-ink">
      {post ? (
        <SEO
          title={post.seoTitle || post.title}
          canonical={canonical}
          description={post.description || post.excerpt || post.title}
          keywords={post.keywords?.join(', ')}
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
              keywords: post.keywords?.join(', ') || `freelance hrvatska, ${post.title.toLowerCase()}`,
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

            <div data-calm className="blog-content max-w-[60rem] space-y-6 text-[1.1875rem] leading-[1.7] text-ink/90 lg:text-[1.3125rem]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...p }) => <h2 className="mb-4 mt-14 border-t-2 border-ink pt-5 font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink" {...p} />,
                  h2: ({ node, ...p }) => <h2 className="mb-4 mt-14 border-t-2 border-ink pt-5 font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink" {...p} />,
                  h3: ({ node, ...p }) => <h3 className="mb-3 mt-10 font-display text-[1.625rem] font-extrabold leading-tight tracking-[-0.02em] text-ink" {...p} />,
                  h4: ({ node, ...p }) => <h4 className="mb-3 mt-8 font-display text-[1.25rem] font-extrabold text-ink" {...p} />,
                  p:  ({ node, ...p }) => <p className="leading-[1.7]" {...p} />,
                  a: MdLink,
                  strong: ({ node, ...p }) => <strong className="font-bold text-ink" {...p} />,
                  ul: ({ node, ...p }) => <ul className="list-outside list-disc space-y-2 pl-6 marker:text-ink" {...p} />,
                  ol: ({ node, ...p }) => <ol className="list-outside list-decimal space-y-2 pl-6 marker:font-bold marker:text-ink" {...p} />,
                  li: ({ node, ...p }) => <li {...p} />,
                  blockquote: ({ node, ...p }) => <blockquote className="border-l-4 border-sky pl-5 font-display text-[1.25rem] font-medium leading-snug text-ink" {...p} />,
                  code: ({ node, ...p }) => <code className="bg-paper2 px-1.5 py-0.5 font-mono text-[0.9em] text-ink" {...p} />,
                  pre:  ({ node, ...p }) => <pre className="overflow-x-auto border-2 border-ink bg-ink p-4 text-[0.9rem] text-white [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-white" {...p} />,
                  hr:   () => <hr className="my-12 border-t-2 border-ink" />,
                  img: ZoomImg,
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
