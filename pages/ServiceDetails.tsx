
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, CheckCircle, MessageSquare, ShieldCheck, Share2, Heart, ArrowLeft } from 'lucide-react';
import PermissionModal from '../components/PermissionModal';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import SEO from '../components/SEO';

const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getListingById } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [contacting, setContacting] = useState(false);

  const listing = id ? getListingById(id) : undefined;

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

      <h1 className="text-4xl font-extrabold text-white mb-10 leading-tight tracking-tight">{listing.title}</h1>

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
                <div className="flex items-center space-x-2">
                  <span className="text-white font-bold">{listing.freelancerName}</span>
                  <span className="bg-brand-green/10 text-brand-green text-[10px] px-2 py-0.5 rounded uppercase font-bold">Pro Seller</span>
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

            <div className="rounded-3xl overflow-hidden border border-white/10 aspect-video mb-8 bg-brand-black shadow-2xl">
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-bold text-white mb-4">About This Service</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                {listing.description}
              </p>
              <p className="text-gray-400 leading-relaxed">
                Working with me ensures high-quality output tailored to your specific needs. I use industry-standard tools and follow a rigorous process to deliver projects that not only look good but perform exceptionally well.
              </p>
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
                  <h3 className="text-xl font-black text-white">Elite Package</h3>
                  <span className="text-2xl font-black text-brand-green">€{listing.price}</span>
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
                    <span className="text-white font-black">{listing.deliveryTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <CheckCircle size={16} className="mr-2 opacity-50" />
                      <span className="font-bold uppercase tracking-tighter">Revisions</span>
                    </div>
                    <span className="text-white font-black">Unlimited</span>
                  </div>
                </div>
                
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
