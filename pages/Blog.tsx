
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  ArrowUp, ArrowDown, MessageSquare, Share2,
  ArrowLeft, Send, Sparkles, AlertCircle, ShieldCheck, Radio, X, PenTool,
  Edit2, Trash2, EyeOff, Eye, Loader2, CornerDownRight
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { BlogComment, BlogPost } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import { CATEGORIES } from '../constants';

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog: React.FC<{
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      <p className="text-white font-bold text-base mb-6 leading-relaxed">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-bold text-sm hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 bg-brand-pink text-white font-black rounded-xl text-sm hover:scale-105 transition-all"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Vote Control ─────────────────────────────────────────────────────────────
const VoteControl: React.FC<{ postId?: string; votes: number; orientation?: 'vertical' | 'horizontal' }> = ({ postId, votes, orientation = 'vertical' }) => {
  const [currentVotes, setCurrentVotes] = useState(votes);
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);

  const handleVote = async (type: 'up' | 'down') => {
    if (voted === type) { setCurrentVotes(votes); setVoted(null); }
    else {
      setCurrentVotes(type === 'up' ? votes + 1 : votes - 1);
      setVoted(type);
      if (postId) {
        try { const res = await API.votePost(postId, type); if (res.votes !== undefined) setCurrentVotes(res.votes); } catch {}
      }
    }
  };

  return (
    <div className={`flex ${orientation === 'vertical' ? 'flex-col items-center' : 'items-center space-x-2'} rounded-lg p-1`}>
      <button onClick={() => handleVote('up')} className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${voted === 'up' ? 'text-brand-pink' : 'text-gray-500'}`}>
        <ArrowUp size={20} strokeWidth={3} />
      </button>
      <span className={`text-xs font-black ${voted === 'up' ? 'text-brand-pink' : voted === 'down' ? 'text-brand-green' : 'text-white'}`}>{currentVotes}</span>
      <button onClick={() => handleVote('down')} className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${voted === 'down' ? 'text-brand-green' : 'text-gray-500'}`}>
        <ArrowDown size={20} strokeWidth={3} />
      </button>
    </div>
  );
};

// ─── Comment Node ─────────────────────────────────────────────────────────────
interface CommentNodeProps {
  comment: BlogComment & { replies?: any[] };
  depth?: number;
  postId: string;
  isVerified: boolean;
  replyingTo: string | null;
  replyInput: string;
  submittingReply: boolean;
  onReplyClick: (id: string | null) => void;
  onReplyInputChange: (v: string) => void;
  onReplySubmit: (parentId: string) => void;
}

const CommentNode: React.FC<CommentNodeProps> = ({
  comment, depth = 0, postId, isVerified,
  replyingTo, replyInput, submittingReply,
  onReplyClick, onReplyInputChange, onReplySubmit,
}) => {
  const isReplying = replyingTo === comment.id;

  return (
    <div className={`relative ${depth > 0 ? 'ml-6 md:ml-10 mt-3' : 'mt-6'}`}>
      {depth > 0 && <div className="absolute -left-5 md:-left-8 top-0 bottom-0 w-px bg-white/10" />}

      <div className="flex space-x-3">
        <div className="flex flex-col items-center shrink-0">
          <img
            src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author)}&background=333&color=fff`}
            alt="" className="w-8 h-8 rounded-full border border-white/10"
          />
          {((comment.replies && comment.replies.length > 0) || isReplying) && (
            <div className="flex-grow w-px bg-white/10 my-2 min-h-[16px]" />
          )}
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center space-x-2 text-[11px] mb-1">
            <span className="text-white font-bold">{comment.author}</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-600 font-bold">
              {typeof comment.timestamp === 'string' && comment.timestamp.includes('T')
                ? new Date(comment.timestamp).toLocaleDateString()
                : comment.timestamp}
            </span>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed mb-2">{comment.content}</p>

          {isVerified && (
            <button
              onClick={() => onReplyClick(isReplying ? null : comment.id)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-brand-green transition-colors mb-2"
            >
              <CornerDownRight size={11} />
              {isReplying ? 'Cancel' : 'Reply'}
            </button>
          )}

          {/* Inline reply input */}
          {isReplying && (
            <div className="relative mb-4 mt-1">
              <textarea
                value={replyInput}
                onChange={e => onReplyInputChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onReplySubmit(comment.id); }}
                placeholder={`Reply to ${comment.author}...`}
                rows={2}
                autoFocus
                className="w-full bg-brand-black/60 border border-white/10 rounded-xl p-3 pr-14 text-white text-sm focus:outline-none focus:border-brand-green resize-none transition-all"
              />
              <button
                onClick={() => onReplySubmit(comment.id)}
                disabled={!replyInput.trim() || submittingReply}
                className="absolute bottom-3 right-3 p-2 bg-brand-green text-brand-black rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100"
              >
                {submittingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.map((reply: any) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              postId={postId}
              isVerified={isVerified}
              replyingTo={replyingTo}
              replyInput={replyInput}
              submittingReply={submittingReply}
              onReplyClick={onReplyClick}
              onReplyInputChange={onReplyInputChange}
              onReplySubmit={onReplySubmit}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Blog ─────────────────────────────────────────────────────────────────────
const Blog: React.FC = () => {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useData();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Comments
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Replies
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Post creation
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', category: CATEGORIES[0], content: '' });

  // Post editing
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPost, setEditPost] = useState({ title: '', category: CATEGORIES[0], content: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  // Custom confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isVerified = !!(currentUser?.kycVerified || currentUser?.creatorStatus === 'approved');

  const sortedPosts = useMemo(() => [...blogPosts].sort((a, b) => b.votes - a.votes), [blogPosts]);

  useEffect(() => {
    if (!selectedPost) { setComments([]); setReplyingTo(null); return; }
    setCommentsLoading(true);
    API.getComments(selectedPost.id).then(setComments).catch(() => {}).finally(() => setCommentsLoading(false));
  }, [selectedPost?.id]);

  const isPostAuthor = !!(selectedPost && currentUser && selectedPost.authorId === currentUser.id);

  const handleShare = async (title: string, url?: string) => {
    const shareUrl = url || window.location.href;
    if (navigator.share) {
      navigator.share({ title, url: shareUrl }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await addBlogPost({
        title: newPost.title, content: newPost.content, category: newPost.category,
        author: currentUser.name || 'Anonymous', authorAvatar: currentUser.avatar || '',
        authorId: currentUser.id, timestamp: 'Just now', votes: 0, commentCount: 0,
      });
      setIsCreatingPost(false);
      setNewPost({ title: '', category: CATEGORIES[0], content: '' });
    } catch {}
  };

  const handleSubmitComment = async () => {
    if (!commentInput.trim() || !selectedPost || submittingComment) return;
    setSubmittingComment(true);
    try {
      const comment = await API.addComment(selectedPost.id, commentInput.trim());
      setComments(prev => [...prev, { ...comment, replies: [] }]);
      setCommentInput('');
      setSelectedPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev);
    } catch {}
    finally { setSubmittingComment(false); }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyInput.trim() || !selectedPost || submittingReply) return;
    setSubmittingReply(true);
    try {
      const reply = await API.addComment(selectedPost.id, replyInput.trim(), parentId);
      setComments(prev => prev.map(c => {
        if (c.id === parentId) return { ...c, replies: [...(c.replies || []), reply] };
        return c;
      }));
      setReplyInput('');
      setReplyingTo(null);
      setSelectedPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev);
    } catch {}
    finally { setSubmittingReply(false); }
  };

  const handleOpenEdit = () => {
    if (!selectedPost) return;
    setEditPost({ title: selectedPost.title, category: selectedPost.category, content: selectedPost.content });
    setIsEditingPost(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;
    setSavingEdit(true);
    try {
      await updateBlogPost(selectedPost.id, editPost);
      setSelectedPost(prev => prev ? { ...prev, ...editPost } : prev);
      setIsEditingPost(false);
    } catch {}
    finally { setSavingEdit(false); }
  };

  const handleDeletePost = () => {
    if (!selectedPost) return;
    setConfirmDialog({
      message: 'Delete this post? This cannot be undone.',
      onConfirm: async () => {
        setConfirmDialog(null);
        try { await deleteBlogPost(selectedPost.id); setSelectedPost(null); } catch {}
      },
    });
  };

  const handleTogglePrivate = async () => {
    if (!selectedPost) return;
    const newPrivate = !selectedPost.isPrivate;
    try {
      await updateBlogPost(selectedPost.id, { isPrivate: newPrivate });
      setSelectedPost(prev => prev ? { ...prev, isPrivate: newPrivate } : prev);
    } catch {}
  };

  const fmtDate = (ts: string) =>
    ts && ts.includes('T') ? new Date(ts).toLocaleDateString() : ts;

  const inputClass = "w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green";

  return (
    <div className="min-h-screen bg-brand-black pt-12 pb-24">
      <SEO
        title="Blog — Freelance Savjeti i Vijesti"
        canonical="/blog"
        description="Savjeti, trendovi i priče iz Cenner zajednice. Sve o freelancingu u Hrvatskoj i EU — honorarni rad, cijene, ugovori, alati i karijera slobodnog radnika."
        keywords="freelance blog hrvatska, honorarni rad savjeti, slobodni radnik blog, freelancing hrvatska vijesti, online posao hrvatska savjeti"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Cenner Blog — Freelance Savjeti i Vijesti',
          description: 'Savjeti za freelancere i klijente u Hrvatskoj i EU. Vijesti s freelance tržišta, vodiči za honorarni rad i više.',
          url: 'https://cenner.hr/blog',
          inLanguage: ['hr', 'en'],
          publisher: {
            '@type': 'Organization',
            name: 'Cenner',
            url: 'https://cenner.hr',
            logo: {
              '@type': 'ImageObject',
              url: 'https://cenner.hr/favicon.svg',
            },
          },
        }}
      />

      {/* Custom confirm */}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* Create Post Modal */}
      {isCreatingPost && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-brand-grey border border-white/10 rounded-[3rem] p-10 relative">
            <button onClick={() => setIsCreatingPost(false)} className="absolute top-10 right-10 text-gray-500 hover:text-white"><X size={24} /></button>
            <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">Write a Post</h2>
            <p className="text-gray-500 mb-8">Share your thoughts with the community.</p>
            <form onSubmit={handleCreatePost} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Title</label>
                <input required type="text" placeholder="e.g. The Future of Generative UI" className={inputClass}
                  value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Channel / Category</label>
                <select className={inputClass + ' appearance-none'} value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Content</label>
                <textarea required rows={8} placeholder="Transmit your thoughts..."
                  className={inputClass + ' resize-none'}
                  value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-4 bg-brand-pink text-white font-black rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-brand-pink/20">
                Transmit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {isEditingPost && selectedPost && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-brand-grey border border-white/10 rounded-[3rem] p-10 relative">
            <button onClick={() => setIsEditingPost(false)} className="absolute top-10 right-10 text-gray-500 hover:text-white"><X size={24} /></button>
            <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">Edit Post</h2>
            <form onSubmit={handleSaveEdit} className="space-y-6 mt-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Title</label>
                <input required type="text" className={inputClass}
                  value={editPost.title} onChange={e => setEditPost({...editPost, title: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
                <select className={inputClass + ' appearance-none'} value={editPost.category} onChange={e => setEditPost({...editPost, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Content</label>
                <textarea required rows={8} className={inputClass + ' resize-none'}
                  value={editPost.content} onChange={e => setEditPost({...editPost, content: e.target.value})} />
              </div>
              <button type="submit" disabled={savingEdit} className="w-full py-4 bg-brand-green text-brand-black font-black rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50">
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        {/* Header */}
        <div className="mb-6">
          {selectedPost ? (
            <div className="flex items-center justify-between w-full">
              <button onClick={() => setSelectedPost(null)}
                className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                <ArrowLeft size={16} /><span>Back to Pulse</span>
              </button>
              {isPostAuthor && (
                <div className="flex items-center gap-2">
                  <button onClick={handleTogglePrivate}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border ${
                      selectedPost.isPrivate
                        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}>
                    {selectedPost.isPrivate ? <Eye size={12} /> : <EyeOff size={12} />}
                    {selectedPost.isPrivate ? 'Make Public' : 'Private'}
                  </button>
                  <button onClick={handleOpenEdit}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={handleDeletePost}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-brand-pink/10 border border-brand-pink/20 text-brand-pink hover:bg-brand-pink/20 transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex justify-between items-center">
              <h2 className="text-4xl font-black text-white tracking-tighter">Community Pulse</h2>
              {isVerified && (
                <button onClick={() => setIsCreatingPost(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-brand-pink/10 text-brand-pink border border-brand-pink/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-pink hover:text-white transition-all">
                  <PenTool size={16} /><span>New Signal</span>
                </button>
              )}
            </div>
          )}
        </div>
        <div className="h-px bg-white/5 w-full mb-10" />

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Main */}
          <div className="lg:col-span-8">
            {sortedPosts.length === 0 ? (
              <div className="py-32 text-center bg-brand-grey/20 border-2 border-dashed border-white/5 rounded-[3rem]">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Radio size={32} className="text-gray-500 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">No Posts Yet</h3>
                <p className="text-gray-500 font-medium mb-8">Be the first to post something.</p>
                {isVerified ? (
                  <button onClick={() => setIsCreatingPost(true)} className="px-8 py-3 bg-brand-pink text-white font-black rounded-xl hover:scale-105 transition-all shadow-lg">
                    Broadcast First Signal
                  </button>
                ) : (
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Authenticate to broadcast</p>
                )}
              </div>
            ) : selectedPost ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                {/* Post card */}
                <div className="bg-brand-grey/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="flex">
                    <div className="hidden md:flex flex-col items-center py-6 px-4 bg-white/[0.02]">
                      <VoteControl postId={selectedPost.id} votes={selectedPost.votes} />
                    </div>
                    <div className="flex-grow p-6 md:p-10">
                      <div className="flex items-center flex-wrap gap-2 mb-4">
                        <img src={selectedPost.authorAvatar || "https://ui-avatars.com/api/?name=User&background=333&color=fff"} alt="" className="w-6 h-6 rounded-full border border-white/10" />
                        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          <span className="text-brand-pink">c/{selectedPost.category.replace(/\s/g, '')}</span>
                          <span>•</span>
                          <span className="text-gray-400">Posted by {selectedPost.author}</span>
                          <span>•</span>
                          <span>{fmtDate(selectedPost.timestamp)}</span>
                        </div>
                        {selectedPost.isPrivate && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-yellow-400">
                            <EyeOff size={9} /> Private
                          </span>
                        )}
                      </div>
                      <h1 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight leading-tight">{selectedPost.title}</h1>
                      <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap mb-10">{selectedPost.content}</div>
                      <div className="flex items-center space-x-6 py-6 border-t border-white/5">
                        <div className="md:hidden">
                          <VoteControl postId={selectedPost.id} votes={selectedPost.votes} orientation="horizontal" />
                        </div>
                        <span className="flex items-center space-x-2 text-gray-500 text-xs font-black uppercase tracking-widest">
                          <MessageSquare size={18} /><span>{selectedPost.commentCount} Comments</span>
                        </span>
                        <button onClick={() => handleShare(selectedPost.title)} className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                          <Share2 size={18} /><span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment input */}
                <div className="space-y-6">
                  {isVerified ? (
                    <div className="bg-brand-grey/30 border border-white/5 rounded-[2rem] p-6">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-3 flex items-center space-x-2">
                        <ShieldCheck size={12} className="text-brand-green" />
                        <span>Reply as verified creator</span>
                      </div>
                      <div className="relative">
                        <textarea
                          value={commentInput}
                          onChange={e => setCommentInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmitComment(); }}
                          placeholder="Join the conversation..."
                          rows={3}
                          className="w-full bg-brand-black/50 border border-white/10 rounded-2xl p-5 pr-16 text-white text-sm focus:outline-none focus:border-brand-green resize-none transition-all"
                        />
                        <button
                          onClick={handleSubmitComment}
                          disabled={!commentInput.trim() || submittingComment}
                          className="absolute bottom-4 right-4 p-2.5 bg-brand-green text-brand-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-40 disabled:scale-100"
                        >
                          {submittingComment ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-700 mt-2">⌘/Ctrl + Enter to send</p>
                    </div>
                  ) : (
                    <div className="bg-brand-pink/5 border border-brand-pink/10 rounded-[2rem] p-10 text-center">
                      <AlertCircle className="mx-auto text-brand-pink mb-4" size={32} />
                      <p className="text-gray-400 text-base font-medium mb-4">
                        Only <span className="text-brand-pink font-bold">Verified Creators</span> can post comments.
                      </p>
                      <button onClick={() => navigate('/creator-onboarding')}
                        className="text-[10px] font-black uppercase tracking-widest text-brand-pink hover:text-white transition-colors underline decoration-2 underline-offset-4">
                        Verify your account
                      </button>
                    </div>
                  )}

                  {/* Comments list */}
                  {commentsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 size={24} className="animate-spin text-gray-600" />
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="bg-brand-grey/20 border border-white/5 rounded-[2rem] p-6 md:p-8">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">
                        {comments.length} comment{comments.length !== 1 ? 's' : ''}
                      </p>
                      {comments.map(c => (
                        <CommentNode
                          key={c.id}
                          comment={c}
                          postId={selectedPost.id}
                          isVerified={isVerified}
                          replyingTo={replyingTo}
                          replyInput={replyInput}
                          submittingReply={submittingReply}
                          onReplyClick={id => { setReplyingTo(id); setReplyInput(''); }}
                          onReplyInputChange={setReplyInput}
                          onReplySubmit={handleReplySubmit}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedPosts.map(post => (
                  <button key={post.id} onClick={() => setSelectedPost(post)}
                    className="w-full text-left bg-brand-grey/20 border border-white/5 rounded-[2rem] p-6 lg:p-8 hover:border-brand-green/30 hover:bg-white/[0.02] transition-all flex group shadow-xl">
                    <div className="mr-6 lg:mr-8 flex flex-col items-center justify-center bg-white/[0.03] rounded-2xl px-3 py-4 min-w-[65px]">
                      <ArrowUp className="text-gray-600 group-hover:text-brand-pink transition-colors" size={20} />
                      <span className="text-sm font-black my-2 text-white">{post.votes}</span>
                      <ArrowDown className="text-gray-600" size={20} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center flex-wrap gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">
                        <span className="text-brand-pink">c/{post.category.replace(/\s/g, '')}</span>
                        <span>•</span>
                        <span>{fmtDate(post.timestamp)}</span>
                        {post.isPrivate && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400">
                            <EyeOff size={8} /> Private
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 group-hover:text-brand-green transition-colors leading-tight">{post.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed font-medium">{post.content}</p>
                      <div className="flex items-center space-x-6 text-[9px] font-black uppercase tracking-widest text-gray-600">
                        <span className="flex items-center space-x-2 group-hover:text-white transition-colors">
                          <MessageSquare size={12} /><span>{post.commentCount} Comments</span>
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); handleShare(post.title); }} className="hover:text-white transition-colors flex items-center space-x-2">
                          <Share2 size={12} /><span>Share</span>
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-3">
            <div className="bg-brand-grey/30 border border-white/5 rounded-[2rem] p-6 lg:p-8 shadow-2xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
                  <Sparkles className="text-brand-green" size={20} />
                </div>
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Trending</h3>
              </div>
              {sortedPosts.length > 0 ? (
                <div className="space-y-2.5">
                  {sortedPosts.slice(0, 5).map(post => (
                    <button key={post.id} onClick={() => setSelectedPost(post)}
                      className={`w-full text-left group p-4 rounded-xl border transition-all ${selectedPost?.id === post.id ? 'bg-brand-green/5 border-brand-green/20' : 'border-transparent bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[8px] font-black text-brand-pink uppercase tracking-widest">c/{post.category.replace(/\s/g, '')}</span>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <ArrowUp size={8} /><span className="text-[9px] font-black">{post.votes}</span>
                        </div>
                      </div>
                      <h4 className={`text-xs font-bold transition-colors line-clamp-1 ${selectedPost?.id === post.id ? 'text-brand-green' : 'text-gray-300 group-hover:text-white'}`}>{post.title}</h4>
                      <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-2">{post.commentCount} Active Threads</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-xs italic">Nothing trending yet.</div>
              )}
            </div>

            <div className="bg-brand-grey/30 border border-white/5 rounded-[2rem] p-6 lg:p-8 shadow-2xl">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6">Community Guidelines</h3>
              <div className="space-y-5">
                {[
                  { id: 1, title: 'Be respectful and courteous', content: 'Keep it professional at all times. Disruptive users will be removed.' },
                  { id: 2, title: 'No Spam or Self-Promo', content: 'Only relevant industry discussion allowed here.' },
                  { id: 3, title: 'Keep the quality high', content: 'Focus on high-quality work and collaborative growth.' },
                ].map(rule => (
                  <div key={rule.id} className="group">
                    <div className="flex items-start space-x-4">
                      <span className="text-gray-700 font-black text-[10px] mt-0.5">{rule.id}</span>
                      <div>
                        <h4 className="text-[11px] font-bold text-gray-300 group-hover:text-white transition-colors mb-1 tracking-tight">{rule.title}</h4>
                        <p className="text-[9px] text-gray-600 leading-relaxed font-medium line-clamp-2">{rule.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Blog;
