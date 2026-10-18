
import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, CheckCircle, MessageSquare, ShieldCheck, Share2, Heart, ArrowLeft, Edit2, Save, X, Loader2, Upload, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import SEO from '../components/SEO';
import { CATEGORIES } from '../constants';
import { useNotify } from '../contexts/NotifyContext';
import AvatarImg from '../components/Avatar';

const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getListingById, updateListing, deleteListing, refreshListings } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();
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
  const [deleting, setDeleting] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const wasEditingRef = useRef(false);
  const mainImgRef = useRef<HTMLImageElement>(null);

  // Reset load state whenever the active image changes.
  // Also check img.complete immediately — iOS Safari skips onLoad for cached images.
  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
    const img = mainImgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, [activeImage]);

  // Reset load state when exiting edit mode so the gallery image reloads cleanly
  useEffect(() => {
    if (!isEditing && wasEditingRef.current) {
      setImgLoaded(false);
      setImgError(false);
    }
    wasEditingRef.current = isEditing;
  }, [isEditing]);

  const listing = id ? getListingById(id) : undefined;
  const isOwner = !!(user && listing && user.id === listing.freelancerId);

  // Track view — fire-and-forget, don't count owner's own views
  useEffect(() => {
    if (id && !isOwner) {
      API.trackListingView(id).catch(() => {});
    }
  }, [id, isOwner]);

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
      notify.toast(err.message || 'Failed to save changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    const ok = await notify.confirm(
      `This will permanently remove "${listing.title}". This cannot be undone.`,
      { title: 'Delete listing?', confirmLabel: 'Delete', cancelLabel: 'Cancel', variant: 'danger' }
    );
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteListing(listing.id);
      navigate('/profile');
    } catch (err: any) {
      notify.toast(err.message || 'Failed to delete listing.', 'error');
      setDeleting(false);
    }
  };

  if (!listing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="mb-4 font-display text-3xl font-extrabold">Listing not found</h2>
        <p className="mb-8 text-slate">This node may have been disconnected.</p>
        <Link to="/marketplace" className="font-display font-bold text-sky underline underline-offset-4 hover:text-ink">Back to Marketplace</Link>
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

  const handleContinue = () => {
    navigate(`/checkout/${listing.id}`);
  };

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: listing.title,
    description: listing.description,
    areaServed: ['HR', 'EU'],
    provider: {
      '@type': 'Person',
      name: listing.freelancerName,
      image: listing.freelancerAvatar,
      jobTitle: 'Freelancer',
      worksFor: { '@type': 'Organization', name: 'Cenner', url: 'https://cenner.hr' },
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: listing.price,
      availability: 'https://schema.org/InStock',
      url: `https://cenner.hr/service/${listing.id}`,
      seller: { '@type': 'Organization', name: 'Cenner', url: 'https://cenner.hr' },
    },
    ...(listing.reviewsCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: listing.rating,
        reviewCount: listing.reviewsCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Marketplace', item: 'https://cenner.hr/marketplace' },
      { '@type': 'ListItem', position: 2, name: listing.category, item: `https://cenner.hr/marketplace?category=${encodeURIComponent(listing.category)}` },
      { '@type': 'ListItem', position: 3, name: listing.title, item: `https://cenner.hr/service/${listing.id}` },
    ],
  };

  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-24 pt-10 font-text md:px-8 md:pt-14">
      <SEO
        title={`${listing.title}, ${listing.freelancerName} | Freelancer Hrvatska`}
        canonical={`/service/${listing.id}`}
        description={`${listing.description.slice(0, 140)}... Usluga dostupna u Hrvatskoj i EU. Isporučuje ${listing.freelancerName}${listing.reviewsCount > 0 ? `, ocjena ${listing.rating}/5` : ''}.`}
        keywords={`${listing.category.toLowerCase()} freelancer hrvatska, ${listing.title.toLowerCase()}, honorarni posao ${listing.category.toLowerCase()}`}
        ogType="product"
        jsonLd={[serviceJsonLd, breadcrumbJsonLd]}
      />
      
      <Link to="/marketplace" className="mb-8 inline-flex items-center gap-2 font-display text-[15px] font-bold hover:text-sky">
        <ArrowLeft size={18} aria-hidden="true" />
        <span>Back to Results</span>
      </Link>

      {isEditing ? (
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="mb-10 w-full border-2 border-ink bg-white px-4 py-2 font-display text-4xl font-extrabold leading-tight tracking-tight focus:border-sky focus:outline-none"
        />
      ) : (
        <h1 className="mb-10 max-w-[24ch] font-display text-[clamp(2.25rem,1.2rem+4.4vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.035em]">{listing.title}</h1>
      )}

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center space-x-4 mb-8">
              <AvatarImg src={listing.freelancerAvatar} name={listing.freelancerName} size={40} className="h-10 w-10 rounded-none border-2 border-ink" />
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="font-display font-bold">{listing.freelancerName}</span>
                  {listing.freelancerTier && listing.freelancerTier !== 'free' && (
                    <span className={`px-2 py-0.5 font-display text-[11px] font-bold uppercase text-white ${
                      listing.freelancerTier === 'ultra' || listing.freelancerTier === 'enterprise'
                        ? 'bg-sky'
                        : 'bg-ink'
                    }`}>
                      {listing.freelancerTier === 'ultra' || listing.freelancerTier === 'enterprise' ? 'Ultra' : 'Pro'}
                    </span>
                  )}
                  {isOwner && !isEditing && (
                    <button
                      onClick={startEdit}
                      className="flex items-center gap-1 border-2 border-ink px-2 py-0.5 font-display text-[11px] font-bold uppercase transition-colors hover:bg-ink hover:text-white"
                    >
                      <Edit2 size={10} /> Edit
                    </button>
                  )}
                  {isOwner && isEditing && (
                    <div className="flex gap-1">
                      <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 border-2 border-ink bg-brand-green px-2 py-0.5 font-display text-[11px] font-bold uppercase text-ink transition-colors hover:bg-white disabled:opacity-50">
                        {saving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />} Save
                      </button>
                      <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 border-2 border-ink px-2 py-0.5 font-display text-[11px] font-bold uppercase transition-colors hover:bg-ink hover:text-white">
                        <X size={10} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center">
                    <Star size={14} fill="currentColor" />
                    <span className="ml-1 font-bold">{listing.rating}</span>
                  </div>
                  <span className="text-slate">({listing.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Gallery */}
            {isEditing ? (
              <div className="mb-8">
                <p className="mb-3 font-display text-[12px] font-extrabold uppercase tracking-wide text-slate">Gallery Images (up to 5). First is the cover</p>
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
                      notify.toast(err.message || 'Upload failed', 'error');
                    } finally {
                      setUploadingImg(false);
                      if (galleryInputRef.current) galleryInputRef.current.value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {editGallery.map((url, i) => (
                    <div key={i} className="relative group/img">
                      <div className={`overflow-hidden border-2 ${i === 0 ? 'h-32 w-48 border-sky' : 'h-16 w-24 border-ink/30'}`}>
                        <img src={url} alt={`Gallery image ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-sky px-1.5 py-0.5 font-display text-[10px] font-bold text-white">Cover</span>}
                      <button
                        type="button"
                        onClick={() => setEditGallery(prev => prev.filter((_, j) => j !== i))}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center border-2 border-ink bg-white text-ink opacity-0 transition-opacity hover:bg-ink hover:text-white group-hover/img:opacity-100"
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
                      className="flex h-16 w-24 flex-col items-center justify-center gap-1 border-2 border-dashed border-ink/40 text-slate transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
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
                    <div className="group relative aspect-video overflow-hidden border-2 border-ink bg-paper2">
                      {/* Skeleton shown while image loads */}
                      {!imgLoaded && !imgError && (
                        <div className="absolute inset-0 z-10 flex animate-pulse items-center justify-center bg-paper2">
                          <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
                        </div>
                      )}
                      {/* Broken image fallback */}
                      {imgError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate">
                          <Upload size={32} className="opacity-30" />
                          <span className="text-xs font-bold uppercase tracking-widest opacity-40">Image unavailable</span>
                        </div>
                      )}
                      <img
                        key={current}
                        ref={mainImgRef}
                        src={current}
                        alt={listing.title}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => { setImgLoaded(true); setImgError(true); }}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded && !imgError ? 'opacity-100' : 'opacity-0'}`}
                      />
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={() => setActiveImage(i => Math.max(0, i - 1))}
                            disabled={!hasPrev}
                            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border-2 border-ink bg-white text-ink opacity-0 transition-[opacity,background-color,color] duration-200 hover:bg-ink hover:text-white disabled:opacity-0 group-hover:opacity-100"
                          >
                            <ChevronLeft size={22} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => setActiveImage(i => Math.min(allImages.length - 1, i + 1))}
                            disabled={!hasNext}
                            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border-2 border-ink bg-white text-ink opacity-0 transition-[opacity,background-color,color] duration-200 hover:bg-ink hover:text-white disabled:opacity-0 group-hover:opacity-100"
                          >
                            <ChevronRight size={22} strokeWidth={2.5} />
                          </button>
                          {/* Image counter pill */}
                          <div className="absolute bottom-3 right-3 border-2 border-ink bg-white px-2.5 py-1 font-display text-[11px] font-bold text-ink">
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
                            className={`h-12 w-16 flex-shrink-0 overflow-hidden border-2 transition-all ${
                              i === activeImage
                                ? 'border-sky'
                                : 'border-ink/30 opacity-70 hover:border-ink hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt={`Service image ${i + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()
            )}

            <div className="max-w-none">
              <h3 className="mb-4 border-t-2 border-ink pt-5 font-display text-[1.75rem] font-extrabold tracking-[-0.02em]">About This Service</h3>
              {isEditing ? (
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  rows={6}
                  className="w-full resize-none border-2 border-ink bg-white px-4 py-3 leading-relaxed focus:border-sky focus:outline-none"
                />
              ) : (
                <p className="max-w-[60ch] text-[1.0625rem] leading-[1.7] text-ink/90">{listing.description}</p>
              )}
            </div>
          </section>

          {listing.includes && listing.includes.length > 0 && (
            <section className="border-2 border-ink bg-white p-8">
              <h3 className="mb-6 font-display text-[1.5rem] font-extrabold tracking-[-0.02em]">What's included</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {listing.includes.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={18} className="flex-shrink-0 text-leaf" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-6 border-t-2 border-ink pt-5 font-display text-[1.75rem] font-extrabold tracking-[-0.02em]">About the Freelancer</h3>
            <div className="flex flex-col gap-8 border-2 border-ink bg-white p-8 md:flex-row">
              <AvatarImg src={listing.freelancerAvatar} name={listing.freelancerName} size={40} className="h-10 w-10 rounded-none border-2 border-ink" />
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="font-display text-xl font-extrabold">{listing.freelancerName}</h4>
                  </div>
                  <button
                    onClick={handleContactClick}
                    disabled={contacting}
                    className="border-2 border-ink px-6 py-2 font-display text-sm font-bold transition-colors hover:bg-ink hover:text-white disabled:opacity-50"
                  >
                    {contacting ? 'Opening…' : 'Contact Me'}
                  </button>
                </div>
                {listing.freelancerBio && (
                  <p className="mb-6 text-[1rem] leading-relaxed text-ink/90">{listing.freelancerBio}</p>
                )}
                <div className="flex flex-wrap gap-6 font-display text-[12px] font-bold uppercase tracking-wide text-slate">
                  {listing.freelancerLocation && (
                    <div className="flex flex-col gap-1">
                      <span className="text-slate">From</span>
                      <span className="text-ink">{listing.freelancerLocation}</span>
                    </div>
                  )}
                  {listing.freelancerCreatedAt && (
                    <div className="flex flex-col gap-1">
                      <span className="text-slate">Member Since</span>
                      <span className="text-ink">{new Date(listing.freelancerCreatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
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
            <div className="overflow-hidden border-2 border-ink bg-white">
              <div className="border-b-2 border-ink p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display text-xl font-extrabold leading-snug">{listing.title}</h3>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <span className="font-display text-lg font-extrabold">€</span>
                      <input value={editPrice} onChange={e => setEditPrice(e.target.value)} type="number" min="0" className="w-24 border-2 border-ink bg-white px-2 py-1 text-right font-display text-xl font-extrabold focus:border-sky focus:outline-none" />
                    </div>
                  ) : (
                    <span className="font-display text-[2.25rem] font-extrabold leading-none">€{listing.price}</span>
                  )}
                </div>
                <p className="mb-6 text-[0.95rem] leading-relaxed text-ink/80">
                  Best for high-stakes professional projects that require absolute attention to detail and precision.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-slate">
                      <Clock size={16} className="mr-2" aria-hidden="true" />
                      <span className="font-display font-bold uppercase tracking-wide">Delivery Time</span>
                    </div>
                    {isEditing ? (
                      <input value={editDelivery} onChange={e => setEditDelivery(e.target.value)} className="w-28 border-2 border-ink bg-white px-2 py-1 text-right font-display text-sm font-extrabold focus:border-sky focus:outline-none" />
                    ) : (
                      <span className="font-display font-extrabold">{listing.deliveryTime}</span>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-slate">
                        <span className="ml-6 font-display font-bold uppercase tracking-wide">Category</span>
                      </div>
                      <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="border-2 border-ink bg-white px-2 py-1 text-right font-display text-sm font-extrabold focus:border-sky focus:outline-none">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {isOwner ? (
                  <div className="space-y-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button onClick={saveEdit} disabled={saving} className="flex flex-1 items-center justify-center gap-2 bg-sky py-4 font-display font-bold text-white transition-colors hover:bg-ink disabled:opacity-50">
                          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                        </button>
                        <button onClick={() => setIsEditing(false)} className="border-2 border-ink px-5 py-4 font-bold transition-colors hover:bg-ink hover:text-white">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={startEdit} className="flex w-full items-center justify-center gap-2 border-2 border-ink py-4 font-display font-bold transition-colors hover:bg-ink hover:text-white">
                        <Edit2 size={16} /> Edit Listing
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex w-full items-center justify-center gap-2 border-2 border-red-700 py-3 text-sm font-bold text-red-700 transition-colors hover:bg-red-700 hover:text-white disabled:opacity-40"
                    >
                      {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      {deleting ? 'Deleting…' : 'Delete Listing'}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleContinue}
                      className="mb-4 w-full bg-sky py-4 font-display font-bold text-white transition-colors hover:bg-ink"
                    >
                      Confirm & Buy (€{listing.price})
                    </button>
                    <button
                      onClick={handleContactClick}
                      disabled={contacting}
                      className="flex w-full items-center justify-center gap-2 border-2 border-ink py-3 font-display font-bold transition-colors hover:bg-ink hover:text-white disabled:opacity-50"
                    >
                      <MessageSquare size={18} />
                      <span>{contacting ? 'Opening…' : 'Contact Freelancer'}</span>
                    </button>
                  </>
                )}
              </div>
              <div className="bg-paper2 p-6 text-center">
                <div className="mb-2 flex items-center justify-center gap-2 font-display text-[12px] font-extrabold uppercase">
                  <ShieldCheck size={14} className="text-leaf" />
                  <span>Secure Payment</span>
                </div>
                <p className="px-4 text-[12px] leading-snug text-slate">
                  Your payment is processed securely through Cenner's protected payment system.
                </p>
              </div>
            </div>

            <div className="flex justify-between px-4">
              <button onClick={handleShare} className="flex items-center gap-2 text-slate transition-colors hover:text-ink">
                <Share2 size={18} />
                <span className="font-display text-[13px] font-bold uppercase tracking-wide">Share</span>
              </button>
              <button onClick={() => setSaved(s => !s)} className={`flex items-center gap-2 transition-colors ${saved ? 'text-sky' : 'text-slate hover:text-sky'}`}>
                <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
                <span className="font-display text-[13px] font-bold uppercase tracking-wide">{saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
