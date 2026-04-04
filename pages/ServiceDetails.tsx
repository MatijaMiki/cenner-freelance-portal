
import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, CheckCircle, MessageSquare, ShieldCheck, Share2, Heart, ArrowLeft, Edit2, Save, X, Loader2, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import PermissionModal from '../components/PermissionModal';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import SEO from '../components/SEO';
import { CATEGORIES } from '../constants';

const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getListingById, updateListing, refreshListings } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [contacting, setContacting] = useState(false);

  const [activeImage, setActiveImage] = useState(0);

  // Edit mode for listing owner
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDelivery, setEditDelivery] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editGallery, setEditGallery] = useState<string[]>([]);
  const [uploadingImg, setUploadingImg] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const listing = id ? getListingById(id) : undefined;
  const isOwner = !!(user && listing && user.id === listing.freelancerId);

  const startEdit = () => {
    if (!listing) return;
    setEditTitle(listing.title);
    setEditDescription(listing.description);
    setEditPrice(String(listing.price));
    setEditDelivery(listing.deliveryTime);
    setEditCategory(listing.category);
    // Build gallery: cover first, then extras
    const cover = listing.imageUrl ? [listing.imageUrl] : [];
    const extras = (listing.galleryImages || []).filter((u: string) => u !== listing.imageUrl);
    setEditGallery([...cover, ...extras]);
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!listing) return;
    setSaving(true);
    try {
      const imageUrl = editGallery[0] || listing.imageUrl;
      await updateListing(listing.id, {
        title: editTitle,
        description: editDescription,
        price: parseFloat(editPrice) || listing.price,
        deliveryTime: editDelivery,
        category: editCategory,
        imageUrl,
        galleryImages: editGallery,
      });
      await refreshListings();
      setActiveImage(0);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (!listing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-3xl font-bold text-white mb-4">Listing not found</h2>
        <p className="text-gray-500 mb-8">This node may have been disconnected.</p>
        <Link to="/marketplace" className="text-brand-green font-bold hover:underline">Back to Marketplace</Link>
      </div>
    );
  }

  const handleContactClick = async () => {
    if (!user) { navigate('/auth'); return; }
    if (contacting || !listing) return;
    setContacting(true);
    try {
      const conv = await API.startConversation(listing.freelancerId);
      navigate(`/messages/${conv.id}`);
    } catch {
      navigate('/messages');
    } finally {
      setContacting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({ title: listing?.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  const handleStartCall = () => {
    setIsPermissionModalOpen(true);
  };

  const handleContinue = () => {
    navigate(`/checkout/${listing.id}`);
  };

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: listing.title,
    description: listing.description,
    provider: {
      '@type': 'Person',
      name: listing.freelancerName,
      image: listing.freelancerAvatar,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: listing.price,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: listing.rating,
      reviewCount: listing.reviewsCount,
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <SEO
        title={listing.title}
        canonical={`/service/${listing.id}`}
        description={`${listing.description.slice(0, 150)}... Delivered by ${listing.freelancerName} — rated ${listing.rating}/5.`}
        jsonLd={serviceJsonLd}
      />
      <PermissionModal isOpen={isPermissionModalOpen} onClose={() => setIsPermissionModalOpen(false)} />
      
      <Link to="/marketplace" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back to Results</span>
      </Link>

      {isEditing ? (
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="w-full text-4xl font-extrabold text-white mb-10 leading-tight tracking-tight bg-white/5 border border-brand-green/30 rounded-xl px-4 py-2 focus:outline-none focus:border-brand-green"
        />
      ) : (
        <h1 className="text-4xl font-extrabold text-white mb-10 leading-tight tracking-tight">{listing.title}</h1>
      )}

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center space-x-4 mb-8">
              <img
                src={listing.freelancerAvatar}
                alt={listing.freelancerName}
                className="w-12 h-12 rounded-full border-2 border-brand-green"
              />
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-white font-bold">{listing.freelancerName}</span>
                  {listing.freelancerTier && listing.freelancerTier !== 'free' && (
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                      listing.freelancerTier === 'ultra' || listing.freelancerTier === 'enterprise'
                        ? 'bg-brand-pink/10 text-brand-pink'
                        : 'bg-brand-green/10 text-brand-green'
                    }`}>
                      {listing.freelancerTier === 'ultra' || listing.freelancerTier === 'enterprise' ? 'Ultra' : 'Pro'}
                    </span>
                  )}
                  {isOwner && !isEditing && (
                    <button
                      onClick={startEdit}
                      className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors uppercase font-bold"
                    >
                      <Edit2 size={10} /> Edit
                    </button>
                  )}
                  {isOwner && isEditing && (
                    <div className="flex gap-1">
                      <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-brand-green/10 border border-brand-green/30 text-brand-green hover:border-brand-green/60 transition-colors uppercase font-bold disabled:opacity-50">
                        {saving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />} Save
                      </button>
                      <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-white/10 text-gray-400 hover:text-white transition-colors uppercase font-bold">
                        <X size={10} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center text-yellow-400">
                    <Star size={14} fill="currentColor" />
                    <span className="ml-1 font-bold">{listing.rating}</span>
                  </div>
                  <span className="text-gray-500">({listing.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Gallery */}
            {isEditing ? (
              <div className="mb-8">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Gallery Images (up to 5) — First is the cover</p>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || editGallery.length >= 5) return;
                    setUploadingImg(true);
                    try {
                      const url = await API.uploadListingImage(file);
                      setEditGallery(prev => [...prev, url]);
                    } catch (err: any) {
                      alert(err.message || 'Upload failed');
                    } finally {
                      setUploadingImg(false);
                      if (galleryInputRef.current) galleryInputRef.current.value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {editGallery.map((url, i) => (
                    <div key={i} className="relative group/img">
                      <div className={`rounded-2xl overflow-hidden border-2 ${i === 0 ? 'w-48 h-32 border-brand-green' : 'w-24 h-16 border-white/10'}`}>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                      {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] font-black bg-brand-green text-brand-black px-1.5 py-0.5 rounded-md">Cover</span>}
                      <button
                        type="button"
                        onClick={() => setEditGallery(prev => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-black border border-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {editGallery.length < 5 && (
                    <button
                      type="button"
                      disabled={uploadingImg}
                      onClick={() => galleryInputRef.current?.click()}
                      className="w-24 h-16 rounded-2xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-gray-500 hover:border-brand-green/50 hover:text-brand-green transition-colors disabled:opacity-50"
                    >
                      {uploadingImg ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      <span className="text-[9px] font-bold">Add</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              (() => {
                const allImages = listing.imageUrl
                  ? [listing.imageUrl, ...(listing.galleryImages || []).filter((u: string) => u !== listing.imageUrl)]
                  : (listing.galleryImages || []);
                const current = allImages[activeImage] || listing.imageUrl;
                const hasPrev = activeImage > 0;
                const hasNext = activeImage < allImages.length - 1;
                return (
                  <div className="mb-8">
                    {/* Main image with arrow navigation */}
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-video bg-brand-black shadow-2xl group">
                      <img
                        src={current}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={() => setActiveImage(i => Math.max(0, i - 1))}
                            disabled={!hasPrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-brand-green flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-0 hover:scale-110 active:scale-95"
                          >
                            <ChevronLeft size={22} className="text-brand-black" strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => setActiveImage(i => Math.min(allImages.length - 1, i + 1))}
                            disabled={!hasNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-brand-green flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-0 hover:scale-110 active:scale-95"
                          >
                            <ChevronRight size={22} className="text-brand-black" strokeWidth={2.5} />
                          </button>
                          {/* Image counter pill */}
                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                            {activeImage + 1} / {allImages.length}
                          </div>
                        </>
                      )}
                    </div>
                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                      <div className="flex gap-2 mt-3">
                        {allImages.map((url: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                              i === activeImage
                                ? 'border-brand-green scale-105 shadow-[0_0_12px_rgba(74,222,128,0.4)]'
                                : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()
            )}

            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-bold text-white mb-4">About This Service</h3>
              {isEditing ? (
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  rows={6}
                  className="w-full text-gray-300 leading-relaxed bg-white/5 border border-brand-green/30 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-green resize-none"
                />
              ) : (
                <p className="text-gray-400 leading-relaxed">{listing.description}</p>
              )}
            </div>
          </section>

          {listing.includes && listing.includes.length > 0 && (
            <section className="bg-brand-grey/50 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
              <h3 className="text-xl font-bold text-white mb-6">What's included</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {listing.includes.map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 text-gray-300">
                    <CheckCircle size={18} className="text-brand-green flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xl font-bold text-white mb-8">About the Freelancer</h3>
            <div className="p-8 bg-brand-grey/50 border border-white/10 rounded-3xl flex flex-col md:flex-row gap-8 backdrop-blur-md">
              <img
                src={listing.freelancerAvatar}
                alt={listing.freelancerName}
                className="w-24 h-24 rounded-2xl border border-white/10 mx-auto md:mx-0"
              />
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-white">{listing.freelancerName}</h4>
                  </div>
                  <button
                    onClick={handleContactClick}
                    disabled={contacting}
                    className="px-6 py-2 border border-white/20 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    {contacting ? 'Opening…' : 'Contact Me'}
                  </button>
                </div>
                {listing.freelancerBio && (
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{listing.freelancerBio}</p>
                )}
                <div className="flex flex-wrap gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {listing.freelancerLocation && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-600">From</span>
                      <span className="text-white">{listing.freelancerLocation}</span>
                    </div>
                  )}
                  {listing.freelancerCreatedAt && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-600">Member Since</span>
                      <span className="text-white">{new Date(listing.freelancerCreatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Purchase Sidebar */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="space-y-6">
            <div className="bg-brand-grey/80 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
              <div className="p-8 border-b border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-white">{listing.title}</h3>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <span className="text-brand-green font-black text-lg">€</span>
                      <input value={editPrice} onChange={e => setEditPrice(e.target.value)} type="number" min="0" className="w-24 text-right text-brand-green font-black text-xl bg-white/5 border border-brand-green/30 rounded-lg px-2 py-1 focus:outline-none focus:border-brand-green" />
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-brand-green">€{listing.price}</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Best for high-stakes professional projects that require absolute attention to detail and precision.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <Clock size={16} className="mr-2 opacity-50" />
                      <span className="font-bold uppercase tracking-tighter">Delivery Time</span>
                    </div>
                    {isEditing ? (
                      <input value={editDelivery} onChange={e => setEditDelivery(e.target.value)} className="w-28 text-right text-white font-black bg-white/5 border border-brand-green/30 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-brand-green" />
                    ) : (
                      <span className="text-white font-black">{listing.deliveryTime}</span>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <span className="font-bold uppercase tracking-tighter ml-6">Category</span>
                      </div>
                      <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="text-right text-white font-black bg-white/5 border border-brand-green/30 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-brand-green">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {isOwner ? (
                  <div className="space-y-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button onClick={saveEdit} disabled={saving} className="flex-1 py-4 bg-brand-green text-brand-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-green/20 disabled:opacity-50 flex items-center justify-center gap-2">
                          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                        </button>
                        <button onClick={() => setIsEditing(false)} className="py-4 px-5 border border-white/10 text-gray-400 font-bold rounded-2xl hover:border-white/30 transition-all">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={startEdit} className="w-full py-4 border border-white/10 text-gray-300 font-black rounded-2xl hover:border-brand-green/40 hover:text-brand-green transition-all flex items-center justify-center gap-2">
                        <Edit2 size={16} /> Edit Listing
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleContinue}
                      className="w-full py-4 bg-brand-green text-brand-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all mb-4 shadow-lg shadow-brand-green/20"
                    >
                      Confirm & Buy (€{listing.price})
                    </button>
                    <button
                      onClick={handleContactClick}
                      disabled={contacting}
                      className="w-full py-3 border border-brand-pink text-brand-pink font-bold rounded-2xl hover:bg-brand-pink/5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <MessageSquare size={18} />
                      <span>{contacting ? 'Opening…' : 'Contact Freelancer'}</span>
                    </button>
                  </>
                )}
              </div>
              <div className="p-6 bg-brand-black/50 text-center">
                <div className="flex items-center justify-center space-x-2 text-[10px] font-black text-gray-500 uppercase mb-2">
                  <ShieldCheck size={14} className="text-brand-green" />
                  <span>Secure Payment</span>
                </div>
                <p className="text-[10px] text-gray-600 px-4 leading-tight">
                  Your payment is processed securely through Cenner's protected payment system.
                </p>
              </div>
            </div>

            <div className="flex justify-between px-4">
              <button onClick={handleShare} className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors">
                <Share2 size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Share</span>
              </button>
              <button onClick={() => setSaved(s => !s)} className={`flex items-center space-x-2 transition-colors ${saved ? 'text-brand-pink' : 'text-gray-500 hover:text-brand-pink'}`}>
                <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
                <span className="text-xs font-black uppercase tracking-widest">{saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
