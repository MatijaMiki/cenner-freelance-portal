import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Plus, Save, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import AdminTabs from '../components/AdminTabs';
import { API } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface BlogPostFull {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  published: boolean;
  publishedAt?: string | null;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  published: boolean;
  publishedAt?: string | null;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

const slugify = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
   .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

const inputClass =
  'w-full bg-paper border-2 border-ink py-3 px-4 text-ink focus:outline-none focus:border-sky';

const BlogEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [published, setPublished] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);

  const isEditing = Boolean(id);

  // Auth gate
  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/blog', { replace: true });
  }, [authLoading, isAdmin, navigate]);

  // Load list
  const loadList = () => {
    setLoadingList(true);
    API.listAdminBlogPosts()
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoadingList(false));
  };
  useEffect(() => { if (isAdmin) loadList(); }, [isAdmin]);

  // Load post when id changes
  useEffect(() => {
    if (!id) {
      setTitle(''); setSlug(''); setExcerpt(''); setContent('');
      setCoverImage(''); setPublished(false);
      setSlugTouched(false);
      return;
    }
    setLoadingPost(true);
    API.getAdminBlogPost(id)
      .then((p: BlogPostFull) => {
        setTitle(p.title);
        setSlug(p.slug);
        setSlugTouched(true);
        setExcerpt(p.excerpt || '');
        setContent(p.content);
        setCoverImage(p.coverImage || '');
        setPublished(p.published);
      })
      .catch(() => setError('Could not load post'))
      .finally(() => setLoadingPost(false));
  }, [id]);

  // Auto-slug from title until user edits the slug field
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const wordCount = useMemo(() => content.trim().split(/\s+/).filter(Boolean).length, [content]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        excerpt: excerpt.trim() || undefined,
        content,
        coverImage: coverImage.trim() || undefined,
        published,
      };
      if (isEditing && id) {
        await API.updateBlogPost(id, payload);
      } else {
        const created = await API.createBlogPost(payload);
        navigate(`/admin/blog/${created.id}`, { replace: true });
      }
      loadList();
    } catch (err: any) {
      setError(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await API.deleteBlogPost(id);
      navigate('/admin/blog', { replace: true });
      loadList();
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate"><Loader2 className="animate-spin" /></div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen pt-12 pb-24">
      <SEO title="Blog Admin" canonical="/admin/blog" noIndex />

      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <AdminTabs />
          <Link to="/blog" className="inline-flex items-center gap-2 text-slate hover:text-ink text-xs font-black uppercase tracking-widest">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-2">
            <Link
              to="/admin/blog"
              className={`flex items-center gap-2 px-4 py-3 border text-sm font-black uppercase tracking-widest transition-colors ${
                !id ? 'bg-sky text-white border-ink' : 'bg-ink/5 border-ink text-ink hover:bg-ink/10'
              }`}
            >
              <Plus size={14} /> New Post
            </Link>
            <div className="text-[12px] font-black text-slate uppercase tracking-widest pt-4 pb-2 px-2">
              {loadingList ? 'Loading…' : `${posts.length} post${posts.length === 1 ? '' : 's'}`}
            </div>
            <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
              {posts.map(p => (
                <Link
                  key={p.id}
                  to={`/admin/blog/${p.id}`}
                  className={`block px-4 py-3 border text-sm transition-colors ${
                    id === p.id
                      ? 'bg-ink/10 border-ink text-ink'
                      : 'bg-ink/5 border-ink/15 text-slate hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={12} className="flex-shrink-0" />
                    <span className="font-bold truncate">{p.title || '(untitled)'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] uppercase tracking-widest font-black">
                    {p.published
                      ? <span className="text-leaf">Published</span>
                      : <span className="text-slate">Draft</span>}
                  </div>
                </Link>
              ))}
            </div>
          </aside>

          {/* Editor */}
          <main>
            {loadingPost ? (
              <div className="text-slate text-sm flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Loading…</div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[12px] font-black text-slate uppercase tracking-widest">Title</label>
                  <input
                    required
                    type="text"
                    placeholder="How to open a paušalni obrt in 2026"
                    className={inputClass}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-black text-slate uppercase tracking-widest">Slug</label>
                  <input
                    required
                    type="text"
                    placeholder="how-to-open-pausalni-obrt-2026"
                    className={inputClass + ' font-mono text-sm'}
                    value={slug}
                    onChange={e => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
                  />
                  <p className="text-[12px] text-slate pt-1">URL: cenner.hr/blog/{slug || '...'}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-black text-slate uppercase tracking-widest">Excerpt</label>
                  <textarea
                    rows={2}
                    maxLength={500}
                    placeholder="One- or two-sentence summary that appears in lists and search results."
                    className={inputClass + ' resize-none'}
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-black text-slate uppercase tracking-widest">Cover image URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className={inputClass}
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-black text-slate uppercase tracking-widest">Content (Markdown)</label>
                    <span className="text-[12px] text-slate">{wordCount} words</span>
                  </div>
                  <textarea
                    required
                    rows={20}
                    placeholder={`# Heading\n\nWrite your post in **markdown**. Lists, links, code blocks all work.\n\n- bullet one\n- bullet two\n\n[Link to source](https://example.com)`}
                    className={inputClass + ' resize-y font-mono text-sm leading-relaxed'}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-ink/5 border-2 border-ink">
                  <button
                    type="button"
                    onClick={() => setPublished(p => !p)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-widest border transition-colors ${
                      published
                        ? 'bg-leaf/10 border-ink text-leaf'
                        : 'bg-ink/5 border-ink text-slate hover:text-ink'
                    }`}
                  >
                    {published ? <Eye size={14} /> : <EyeOff size={14} />}
                    {published ? 'Published' : 'Draft'}
                  </button>
                  <p className="text-xs text-slate">
                    {published ? 'This post is live at /blog' : 'Toggle to publish.'}
                  </p>
                </div>

                {error && (
                  <div className="text-red-700 text-sm">{error}</div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-700 text-red-700 text-xs font-black uppercase tracking-widest hover:bg-red-50"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={saving || !title.trim() || !content.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-sky text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 hover:scale-[1.02] transition-all"
                  >
                    {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                    {isEditing ? 'Save' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
