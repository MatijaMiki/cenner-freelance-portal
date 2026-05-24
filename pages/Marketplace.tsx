
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  Search, Filter, Star, Clock, Tag, ChevronDown,
  X, SlidersHorizontal, ArrowUpDown, Briefcase,
  Zap, Users, FileText, TrendingUp, AlertCircle, Loader2, Plus
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import { useT } from '../i18n';
import AvatarImg from '../components/Avatar';
import FreelancerHeatmap from '../components/FreelancerHeatmap';

type MarketplaceMode = 'freelancers' | 'clients';

const Marketplace: React.FC = () => {
  const { listings: allListings, jobs } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const [mode, setMode] = useState<MarketplaceMode>('freelancers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof allListings | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Slider runs uncontrolled (defaultValue + ref) so React re-renders don't
  // fight the browser's native drag. We push state updates through rAF.
  const sliderRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const sliderRafRef = useRef<number | null>(null);

  const updateSliderFill = useCallback((value: number) => {
    const pct = ((value - 50) / (5000 - 50)) * 100;
    sliderRef.current?.style.setProperty('--slider-pct', `${pct}%`);
  }, []);

  const handleSliderInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const v = parseInt(e.currentTarget.value);
    updateSliderFill(v);
    // Mirror to the number input without going through React (avoids re-render mid-drag).
    if (priceInputRef.current && document.activeElement !== priceInputRef.current) {
      priceInputRef.current.value = String(v);
    }
    // Defer state update to next frame so the browser's drag isn't interrupted.
    if (sliderRafRef.current != null) cancelAnimationFrame(sliderRafRef.current);
    sliderRafRef.current = requestAnimationFrame(() => setPriceRange(v));
  }, [updateSliderFill]);

  // When user types into the number input, push the value into the slider via ref.
  const handlePriceNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInt(e.target.value);
    const v = isNaN(raw) ? 50 : Math.max(50, Math.min(5000, raw));
    setPriceRange(v);
    if (sliderRef.current) {
      sliderRef.current.value = String(v);
      updateSliderFill(v);
    }
  }, [updateSliderFill]);

  // Track latest priceRange in a ref so the ref callback can read it on mount
  // without re-binding when state changes.
  const priceRangeRef = useRef(priceRange);
  priceRangeRef.current = priceRange;

  // Ref callback runs only on actual mount/unmount of the slider DOM node
  // (e.g. when the filter drawer opens). It sets the initial fill so the
  // green bar matches the thumb position right away. We deliberately do NOT
  // re-set the fill on every render — the onInput handler owns it during drag.
  const setSliderRef = useCallback((el: HTMLInputElement | null) => {
    sliderRef.current = el;
    if (el) updateSliderFill(priceRangeRef.current);
  }, [updateSliderFill]);

  // Server-side search with 350ms debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchTerm.trim()) { setSearchResults(null); return; }
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      const cat = selectedCategory !== 'All' ? selectedCategory : undefined;
      API.getListings(cat, searchTerm.trim())
        .then(r => setSearchResults(r))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchTerm, selectedCategory]);

  // Body scroll lock for mobile menu
  useEffect(() => {
    if (isFilterDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFilterDrawerOpen]);

  // When no search term, use the DataContext listings (already sorted by rating/recency from backend)
  const listings = searchResults !== null ? searchResults : allListings;

  const filteredServices = useMemo(() => {
    let result = listings.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesPrice = item.price <= priceRange;
      return matchesCategory && matchesPrice;
    });

    switch (sortBy) {
      case 'price-asc': return result.sort((a, b) => a.price - b.price);
      case 'price-desc': return result.sort((a, b) => b.price - a.price);
      case 'rating': return result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      default: return result; // backend already sorted by relevance or rating/recency
    }
  }, [listings, selectedCategory, priceRange, sortBy]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           job.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => b.id.localeCompare(a.id));
  }, [jobs, searchTerm, selectedCategory]);

  const SidebarContent = () => (
    <div className="space-y-10">
      <div>
        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center space-x-3">
          <Filter size={14} className="text-brand-pink" />
          <span>Categories</span>
        </h3>
        <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'All' ? 'bg-brand-green text-brand-black shadow-lg shadow-brand-green/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
            }`}
          >
            {t('All Specializations')}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat ? 'bg-brand-green text-brand-black shadow-lg shadow-brand-green/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {mode === 'freelancers' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{t('Budget Threshold')}</h3>
            <div className="flex items-center bg-brand-black border border-white/10 rounded-lg focus-within:border-brand-green transition-colors">
              <span className="text-gray-500 text-sm font-bold pl-2.5 select-none">€</span>
              <input
                ref={priceInputRef}
                type="number"
                min={50}
                max={5000}
                step={50}
                defaultValue={priceRange}
                onChange={handlePriceNumberChange}
                aria-label={t('Budget Threshold')}
                className="w-20 bg-transparent text-brand-green font-black text-sm py-1.5 px-2 text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          <div className="relative py-3">
            <input
              ref={setSliderRef}
              type="range"
              min={50}
              max={5000}
              step={1}
              defaultValue={priceRange}
              onInput={handleSliderInput}
              aria-label={t('Budget Threshold')}
              className="cenner-slider w-full cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase">
            <span>€50</span>
            <span>€5000+</span>
          </div>
        </div>
      )}

      <div className="p-8 rounded-[2rem] bg-gradient-to-br from-brand-pink/20 to-brand-green/20 border border-white/10 backdrop-blur-md hidden lg:block">
        <Tag size={24} className="text-white mb-4" />
        <h4 className="text-white font-black text-lg mb-2">{t('Priority Matching')}</h4>
        <p className="text-gray-400 text-xs leading-relaxed mb-6 font-medium">{t('Skip the search and get matched with a verified freelancer within 2 hours.')}</p>
        <button disabled className="w-full py-3.5 bg-white/20 text-gray-400 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed">
          {t('Coming Soon')}
        </button>
      </div>
    </div>
  );

  const marketplaceJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Cenner Marketplace — Freelance Usluge Hrvatska',
      description: 'Pretraži stotine provjerenih freelance usluga u Hrvatskoj i EU. Web razvoj, dizajn, marketing, pisanje i više.',
      url: 'https://cenner.hr/marketplace',
      inLanguage: ['hr', 'en'],
      about: {
        '@type': 'Thing',
        name: 'Freelance usluge Hrvatska',
      },
      provider: {
        '@type': 'Organization',
        name: 'Cenner',
        url: 'https://cenner.hr',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Početna', item: 'https://cenner.hr' },
        { '@type': 'ListItem', position: 2, name: 'Marketplace', item: 'https://cenner.hr/marketplace' },
      ],
    },
  ];

  return (
    <div className="pt-12 pb-24 px-4 max-w-[1600px] mx-auto">
      <SEO
        title="Marketplace — Freelanceri Hrvatska"
        canonical="/marketplace"
        description="Pronađi verificirane freelancere u Hrvatskoj i EU na Cenner marketplaceu. Web razvoj, dizajn, marketing, pisanje i više — honorarni posao na jednom mjestu."
        keywords="freelance marketplace hrvatska, freelanceri hrvatska, najam freelancera, web developer hrvatska, grafički dizajner hrvatska, digitalni marketing hrvatska, honorarni posao eu"
        jsonLd={marketplaceJsonLd}
      />
      {/* Mobile Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-brand-black/95 backdrop-blur-xl" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-brand-grey border-l border-white/10 p-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-white tracking-tighter">{t('Node Filters')}</h2>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            {SidebarContent()}
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="w-full mt-10 py-5 bg-brand-green text-brand-black font-black rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-brand-green/20"
            >
              Sync Results
            </button>
          </div>
        </div>
      )}

      {/* Header & Main Mode Toggle */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-16">
        <div>
          <h1 className="text-5xl font-black text-white mb-3 tracking-tighter">{t('Marketplace')}</h1>
          <p className="text-gray-500 font-medium">{t("The world's most advanced hub for digital synchronization.")}</p>
        </div>

        <div className="flex items-center gap-4">
        {user && (
          <button
            onClick={() => navigate('/profile?tab=selling&section=listings&create=1')}
            className="px-6 py-3.5 bg-brand-pink text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-pink/20"
          >
            <Plus size={16} />
            <span>{t('Post a Service')}</span>
          </button>
        )}

        {/* High-Fidelity Mode Toggle */}
        <div className="bg-brand-grey/50 border border-white/10 p-1.5 rounded-2xl flex items-center shadow-inner">
          <button 
            onClick={() => { setMode('freelancers'); setSelectedCategory('All'); }}
            className={`px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-3 ${
              mode === 'freelancers' 
              ? 'bg-brand-green text-brand-black shadow-lg shadow-brand-green/10' 
              : 'text-gray-500 hover:text-white'
            }`}
          >
            <Users size={16} />
            <span>{t('Find Experts')}</span>
          </button>
          <button
            onClick={() => { setMode('clients'); setSelectedCategory('All'); }}
            className={`px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-3 ${
              mode === 'clients'
              ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/10'
              : 'text-gray-500 hover:text-white'
            }`}
          >
            <Briefcase size={16} />
            <span>{t('Open Requests')}</span>
          </button>
        </div>
        </div>
      </div>

      {/* Search & Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          {searching ? (
            <Loader2 className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-green animate-spin" size={18} />
          ) : (
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          )}
          <input
            type="text"
            placeholder={mode === 'freelancers' ? t('Search for services (UI/UX, Dev, AI...)') : t('Search for project requests...')}
            className="w-full bg-brand-grey/50 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-brand-green transition-all placeholder:text-gray-600 shadow-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="lg:hidden flex items-center justify-center space-x-3 bg-brand-grey border border-white/10 rounded-2xl py-5 px-8 text-white font-bold text-sm hover:border-brand-pink transition-all active:scale-95 shadow-2xl"
        >
          <SlidersHorizontal size={18} className="text-brand-pink" />
          <span>{t('Filters')}</span>
        </button>
      </div>

      {/* Sort row — under search bar so users don't have to open the filters drawer */}
      <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex-shrink-0">{t('Sort')}:</span>
        {[
          { label: t('Recently Added'), val: 'newest' },
          { label: t('Price: Low to High'), val: 'price-asc' },
          { label: t('Price: High to Low'), val: 'price-desc' },
          { label: t('Top Rated'), val: 'rating' }
        ].map(opt => (
          <button
            key={opt.val}
            onClick={() => setSortBy(opt.val as any)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              sortBy === opt.val
                ? 'border-brand-pink/60 text-brand-pink bg-brand-pink/10 shadow-md shadow-brand-pink/10'
                : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30 bg-brand-grey/40'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            {SidebarContent()}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-grow min-w-0">
          {mode === 'freelancers' ? (
            /* Service Listings Grid */
            filteredServices.length > 0 ? (
              <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-8 animate-in fade-in duration-500">
                {filteredServices.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/service/${listing.id}`}
                    className={`group bg-brand-grey/90 border rounded-[2.5rem] overflow-hidden hover:border-brand-green/50 transition-all flex flex-col h-full shadow-xl ${
                      listing.isSponsored
                        ? 'border-amber-400/40 shadow-amber-400/5 shadow-2xl'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {listing.isSponsored && (
                        <div className="absolute top-5 right-5">
                          <span className="bg-amber-400/90 backdrop-blur-md text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Zap size={9} />Sponsored
                          </span>
                        </div>
                      )}
                      <div className="absolute top-5 left-5">
                        <span className="bg-brand-black/90 backdrop-blur-md text-brand-green px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                          {listing.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-grow bg-brand-black/20">
                      <div className="flex items-center space-x-3 mb-6">
                        <AvatarImg src={listing.freelancerAvatar} name={listing.freelancerName} size={40} className="rounded-full border-2 border-brand-green" />
                        <div className="flex-grow min-w-0">
                          <p className="text-white text-sm font-bold truncate">{listing.freelancerName}</p>
                          <div className="flex items-center gap-1.5">
                            {listing.freelancerTier === 'ultra' || listing.freelancerTier === 'enterprise' ? (
                              <p className="text-brand-pink text-[10px] font-black uppercase tracking-tighter">Ultra</p>
                            ) : listing.freelancerTier === 'pro' ? (
                              <p className="text-brand-green text-[10px] font-black uppercase tracking-tighter">Pro</p>
                            ) : (
                              <p className="text-gray-600 text-[10px] font-black uppercase tracking-tighter">Free</p>
                            )}
                            {listing.freelancerTrusted && (
                              <span title="Trusted freelancer" className="text-yellow-400 text-[9px] font-black uppercase tracking-tighter">★ Trusted</span>
                            )}
                            {listing.freelancerKycVerified && !listing.freelancerTrusted && (
                              <span title="KYC verified" className="text-brand-green text-[9px] font-bold">✓ Verified</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5 text-yellow-400">
                          <Star size={14} fill="currentColor" />
                          <span className="text-xs font-black">{listing.rating}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-4 group-hover:text-brand-green transition-colors leading-snug line-clamp-2">
                        {listing.title}
                      </h3>
                      
                      <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                          <Clock size={16} className="mr-2 opacity-50" />
                          <span>{listing.deliveryTime}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5">{t('Starting at')}</p>
                          <p className="text-2xl font-black text-white">€{listing.price}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                mode="freelancers"
                onReset={() => {setSearchTerm(''); setSelectedCategory('All'); setPriceRange(3000);}}
                t={t}
              />
            )
          ) : (
            /* Job Request Board */
            filteredJobs.length > 0 ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                {filteredJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="group bg-brand-grey/90 border border-white/10 rounded-[2.5rem] p-8 hover:border-brand-pink/50 transition-all shadow-xl flex flex-col md:flex-row md:items-center gap-8"
                  >
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <span className="bg-brand-pink/10 text-brand-pink px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-pink/20">
                          {job.category}
                        </span>
                        {job.urgency === 'high' && (
                          <span className="flex items-center space-x-2 text-brand-pink animate-pulse">
                            <Zap size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t('High Priority')}</span>
                          </span>
                        )}
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Posted {job.postedAt}</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-brand-pink transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">{job.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center space-x-3">
                          <AvatarImg src={job.clientAvatar} name={job.clientName} size={32} className="rounded-full border border-white/10" />
                          <span className="text-xs font-bold text-gray-300">{job.clientName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-gray-500">
                          <FileText size={16} className="text-brand-green" />
                          <span>{job.proposalsCount} {t('Proposals Syncing')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:text-right flex-shrink-0 flex flex-col justify-between h-full">
                      <div className="mb-6">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{t('Budget Allocation')}</p>
                        <p className="text-2xl font-black text-white">{job.budgetRange}</p>
                      </div>
                      <button className="w-full md:w-auto px-10 py-4 bg-brand-pink text-white font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-pink/20 uppercase tracking-widest text-xs">
                        {t('Sync Proposal')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                mode="jobs"
                onReset={() => {setSearchTerm(''); setSelectedCategory('All');}}
                t={t}
              />
            )
          )}
        </div>

        {/* Right column — Talent density heatmap (freelancer mode only) */}
        {mode === 'freelancers' && (
          <aside className="hidden xl:block w-[360px] flex-shrink-0">
            <div className="sticky top-24">
              <FreelancerHeatmap listings={listings} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ onReset: () => void, mode: 'freelancers' | 'jobs', t: (k: string) => string }> = ({ onReset, mode, t }) => (
  <div className="text-center py-32 bg-brand-grey/20 rounded-[3rem] border-2 border-dashed border-white/5 animate-in fade-in zoom-in duration-500">
    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600">
      <Search size={36} />
    </div>
    <h3 className="text-2xl font-black text-white mb-3">
      {mode === 'freelancers' ? t('No Freelancers Found') : t('No Jobs Posted Yet')}
    </h3>
    <p className="text-gray-500 font-medium max-w-sm mx-auto">
      {t('Nothing here yet. Be the first to post.')}
    </p>
    <div className="mt-8 flex justify-center gap-4">
      <button
        onClick={onReset}
        className="px-8 py-3 bg-white/5 text-white font-black rounded-xl hover:bg-white/10 transition-all border border-white/10"
      >
        {t('Clear Filters')}
      </button>
      <Link
        to="/profile"
        className="px-8 py-3 bg-brand-green text-brand-black font-black rounded-xl hover:scale-105 transition-all shadow-lg"
      >
        {mode === 'freelancers' ? t('Create Listing') : t('Post a Job')}
      </Link>
    </div>
  </div>
);

export default Marketplace;
