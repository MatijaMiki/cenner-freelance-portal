
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { AI_SUMMARIES } from '../lib/md/summaries.mjs';
import {
  Search, Filter, Star, Clock, ChevronDown,
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
import { GlassLayers } from '../components/LiquidGlass';
import JobMatches from '../components/JobMatches';
import ProposalModal, { ProposalTarget } from '../components/ProposalModal';

type MarketplaceMode = 'freelancers' | 'clients';

const Marketplace: React.FC = () => {
  const { listings: allListings, jobs, loading: dataLoading } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const [mode, setMode] = useState<MarketplaceMode>('freelancers');
  const [proposing, setProposing] = useState<ProposalTarget | null>(null);
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

  const catBtn = (active: boolean) =>
    `w-full text-left px-3 py-2.5 font-display text-[14px] font-bold transition-colors focus-visible:outline-none focus-visible:underline ${
      active ? 'bg-ink text-white' : 'text-ink/75 hover:bg-ink/[0.06] hover:text-ink'
    }`;

  const SidebarContent = () => (
    <div className="space-y-10">
      <div>
        <h3 className="mb-4 flex items-center gap-2.5 border-b-2 border-ink pb-3 font-display text-[13px] font-extrabold uppercase tracking-[0.12em]">
          <Filter size={15} aria-hidden="true" />
          <span>Categories</span>
        </h3>
        <div data-calm className="max-h-[400px] space-y-0.5 overflow-y-auto custom-scrollbar pr-2">
          <button onClick={() => setSelectedCategory('All')} className={catBtn(selectedCategory === 'All')}>
            {t('All Specializations')}
          </button>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={catBtn(selectedCategory === cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {mode === 'freelancers' && (
        <div data-calm>
          <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-ink pb-3">
            <h3 className="font-display text-[13px] font-extrabold uppercase tracking-[0.12em]">{t('Budget Threshold')}</h3>
            <div className="flex items-center border-2 border-ink bg-white focus-within:border-sky">
              <span className="select-none pl-2.5 font-display text-sm font-bold text-slate">€</span>
              <input
                ref={priceInputRef}
                type="number"
                min={50}
                max={5000}
                step={50}
                defaultValue={priceRange}
                onChange={handlePriceNumberChange}
                aria-label={t('Budget Threshold')}
                className="w-20 bg-transparent px-2 py-1.5 text-right font-display text-sm font-extrabold text-ink focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
              className="cenner-slider-paper w-full cursor-pointer"
            />
          </div>
          <div className="flex justify-between font-display text-[12px] font-bold text-slate">
            <span>€50</span>
            <span>€5000+</span>
          </div>
        </div>
      )}

    </div>
  );

  const marketplaceJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Cenner Marketplace: Freelance Usluge Hrvatska',
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

  const chip = (active: boolean) =>
    `flex-shrink-0 border-2 border-ink px-4 py-2 font-display text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:underline ${
      active ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-paper2'
    }`;
  const tab = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-2.5 px-4 py-3.5 text-center font-display text-[15px] font-bold transition-colors focus-visible:outline-none focus-visible:underline sm:flex-none sm:px-6 ${
      active ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-paper2'
    }`;
  const btn = 'inline-flex items-center justify-center gap-2.5 bg-sky px-7 py-4 font-display text-[15px] font-bold text-white transition-colors hover:bg-ink focus-visible:bg-ink focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4';

  return (
    <div className="font-text text-ink">
      <div className="relative z-10 w-full px-4 pb-24 pt-10 md:px-10 md:pt-16 2xl:px-14">
      <SEO
        title="Marketplace: Freelanceri Hrvatska"
        canonical="/marketplace"
        description="Pronađi verificirane freelancere u Hrvatskoj i EU na Cenner marketplaceu. Web razvoj, dizajn, marketing, pisanje i više. Honorarni posao na jednom mjestu."
        keywords="freelance marketplace hrvatska, freelanceri hrvatska, najam freelancera, web developer hrvatska, grafički dizajner hrvatska, digitalni marketing hrvatska, honorarni posao eu"
        jsonLd={marketplaceJsonLd}
        aiSummary={AI_SUMMARIES['/marketplace']}
      />
      {/* Mobile Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto border-l-2 border-ink bg-paper p-6 animate-in slide-in-from-right duration-500">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em]">{t('Node Filters')}</h2>
              <button onClick={() => setIsFilterDrawerOpen(false)} aria-label="Close" className="p-2 hover:text-sky">
                <X size={24} />
              </button>
            </div>
            {SidebarContent()}
            <button onClick={() => setIsFilterDrawerOpen(false)} className={`${btn} mt-10 w-full`}>
              Sync Results
            </button>
          </div>
        </div>
      )}

      {/* Header: the page name at poster scale, then what you can do here. */}
      <header>
        <h1 className="font-display text-[clamp(2.75rem,9vw,8.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em]">
          {t('Marketplace')}
        </h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <p className="max-w-[46ch] text-[clamp(1.125rem,1.05rem+0.5vw,1.375rem)] leading-snug lg:col-span-6">
            {t("The world's most advanced hub for digital synchronization.")}
          </p>
          <div className="flex flex-wrap items-center gap-4 lg:col-span-6 lg:justify-end">
            {user && (
              <button
                onClick={() => navigate('/profile?tab=selling&section=listings&create=1')}
                className={btn}
              >
                <Plus size={17} aria-hidden="true" />
                <span>{t('Post a Service')}</span>
              </button>
            )}
            <div role="group" aria-label="Marketplace mode" className="flex w-full items-stretch border-2 border-ink sm:w-auto">
              <button
                onClick={() => { setMode('freelancers'); setSelectedCategory('All'); }}
                aria-pressed={mode === 'freelancers'}
                className={tab(mode === 'freelancers')}
              >
                <Users size={17} aria-hidden="true" />
                <span>{t('Find Experts')}</span>
              </button>
              <button
                onClick={() => { setMode('clients'); setSelectedCategory('All'); }}
                aria-pressed={mode === 'clients'}
                className={`${tab(mode === 'clients')} border-l-2 border-ink`}
              >
                <Briefcase size={17} aria-hidden="true" />
                <span>{t('Open Requests')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Mobile Filter Trigger */}
      <div className="mb-4 mt-12 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-grow border-2 border-ink bg-white transition-shadow focus-within:shadow-[5px_5px_0_0_#002ca5]">
          {searching ? (
            <Loader2 className="absolute left-5 top-1/2 -translate-y-1/2 animate-spin text-sky" size={18} />
          ) : (
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate" size={18} aria-hidden="true" />
          )}
          <input
            type="text"
            placeholder={mode === 'freelancers' ? t('Search for services (UI/UX, Dev, AI...)') : t('Search for project requests...')}
            aria-label={mode === 'freelancers' ? t('Search for services (UI/UX, Dev, AI...)') : t('Search for project requests...')}
            className="w-full bg-transparent py-4 pl-14 pr-6 font-display text-[16px] font-medium text-ink placeholder:text-slate focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="flex items-center justify-center gap-3 border-2 border-ink bg-white px-8 py-4 font-display text-[15px] font-bold transition-colors hover:bg-paper2 lg:hidden"
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
          <span>{t('Filters')}</span>
        </button>
      </div>

      {/* Sort row — under search bar so users don't have to open the filters drawer */}
      <div className="-mx-1 mb-12 flex items-center gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="flex-shrink-0 pr-1 font-display text-[12px] font-extrabold uppercase tracking-[0.12em] text-slate">{t('Sort')}:</span>
        {[
          { label: t('Recently Added'), val: 'newest' },
          { label: t('Price: Low to High'), val: 'price-asc' },
          { label: t('Price: High to Low'), val: 'price-desc' },
          { label: t('Top Rated'), val: 'rating' }
        ].map(opt => (
          <button
            key={opt.val}
            onClick={() => setSortBy(opt.val as any)}
            aria-pressed={sortBy === opt.val}
            className={chip(sortBy === opt.val)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden w-56 flex-shrink-0 lg:block">
          <div className="sticky top-24">
            {SidebarContent()}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0 flex-grow">
          {mode === 'freelancers' ? (
            /* Service Listings Grid */
            filteredServices.length > 0 ? (
              <div className="grid gap-6 animate-in fade-in duration-500 sm:grid-cols-2 2xl:grid-cols-3">
                {filteredServices.map((listing) => {
                  // Liquid Glass is the premium look: sponsored listings and Pro, Ultra and Enterprise freelancers
                  const glass = !!listing.isSponsored || ['pro', 'ultra', 'enterprise'].includes(listing.freelancerTier ?? '');
                  return (
                  <Link
                    key={listing.id}
                    to={`/service/${listing.id}`}
                    className={glass
                      ? 'group lg lg--clear relative flex h-full flex-col rounded-[28px] transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none [&_*]:[text-shadow:none]'
                      : `group flex h-full flex-col border-2 bg-white transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#0b0c0e] focus-visible:-translate-x-1 focus-visible:-translate-y-1 focus-visible:shadow-[6px_6px_0_0_#002ca5] focus-visible:outline-none ${
                        listing.isSponsored ? 'border-sky' : 'border-ink'
                      }`}
                  >
                    {glass && <GlassLayers refract={{ bezel: 22, shift: 14 }} />}
                    <div className={glass
                      ? 'relative z-[1] m-2 aspect-[16/10] overflow-hidden rounded-[22px]'
                      : `relative aspect-[16/10] overflow-hidden border-b-2 ${listing.isSponsored ? 'border-sky' : 'border-ink'}`}>
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {listing.isSponsored && (
                        <div className="absolute right-3 top-3">
                          <span className="flex items-center gap-1 bg-sky px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-white">
                            <Zap size={11} aria-hidden="true" />Sponsored
                          </span>
                        </div>
                      )}
                      <div className="absolute left-3 top-3">
                        <span className="border-2 border-ink bg-paper px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-ink">
                          {listing.category}
                        </span>
                      </div>
                    </div>

                    <div className={`flex flex-grow flex-col p-5 ${glass ? 'relative z-[1]' : ''}`}>
                      <div className="mb-5 flex items-center gap-3">
                        <AvatarImg src={listing.freelancerAvatar} name={listing.freelancerName} size={40} className="rounded-none border-2 border-ink" />
                        <div className="min-w-0 flex-grow">
                          <p className="truncate font-display text-[15px] font-bold">{listing.freelancerName}</p>
                          <div className="flex items-center gap-2 font-display text-[12px] font-bold">
                            {listing.freelancerTier === 'ultra' || listing.freelancerTier === 'enterprise' ? (
                              <span className="text-sky">Ultra</span>
                            ) : listing.freelancerTier === 'pro' ? (
                              <span className="text-leaf">Pro</span>
                            ) : (
                              <span className="text-slate">Free</span>
                            )}
                            {listing.freelancerTrusted && (
                              <span title="Trusted freelancer">★ Trusted</span>
                            )}
                            {listing.freelancerKycVerified && !listing.freelancerTrusted && (
                              <span title="KYC verified" className="text-leaf">✓ Verified</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star size={15} fill="currentColor" aria-hidden="true" />
                          <span className="font-display text-sm font-extrabold">{listing.rating}</span>
                        </div>
                      </div>

                      <h3 className="line-clamp-2 font-display text-[1.25rem] font-extrabold leading-snug tracking-[-0.01em] transition-colors group-hover:text-sky">
                        {listing.title}
                      </h3>

                      <div className="mt-auto flex items-end justify-between border-t-2 border-ink pt-4">
                        <div className="flex items-center gap-2 text-[14px] text-slate">
                          <Clock size={16} aria-hidden="true" />
                          <span>{listing.deliveryTime}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] text-slate">{t('Starting at')}</p>
                          <p className="font-display text-[1.75rem] font-extrabold leading-none">€{listing.price}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                  );
                })}
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
              <div className="space-y-5 animate-in fade-in duration-500">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col gap-8 border-2 border-ink bg-white p-6 transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#0b0c0e] md:flex-row md:items-center md:p-8"
                  >
                    <div className="min-w-0 flex-grow">
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className="border-2 border-ink bg-paper px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wide">
                          {job.category}
                        </span>
                        {job.urgency === 'high' && (
                          <span className="flex items-center gap-1.5 font-display text-[12px] font-extrabold uppercase tracking-wide text-sky">
                            <Zap size={14} aria-hidden="true" />
                            <span>{t('High Priority')}</span>
                          </span>
                        )}
                        <span className="text-[13px] text-slate">Posted {job.postedAt}</span>
                      </div>

                      <h3 className="mb-3 font-display text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em]">
                        {job.title}
                      </h3>
                      <p className="mb-6 line-clamp-2 text-[1rem] leading-relaxed text-ink/80">{job.description}</p>

                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                          <AvatarImg src={job.clientAvatar} name={job.clientName} size={32} className="rounded-none border-2 border-ink" />
                          <span className="font-display text-[14px] font-bold">{job.clientName}</span>
                        </div>
                        <div className="flex items-center gap-2 font-display text-[13px] font-bold text-slate">
                          <FileText size={16} aria-hidden="true" />
                          <span>{job.proposalsCount} {t('Proposals Syncing')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 flex-col justify-between gap-6 md:text-right">
                      <div>
                        <p className="text-[13px] text-slate">{t('Budget Allocation')}</p>
                        <p className="font-display text-[1.75rem] font-extrabold leading-tight">{job.budgetRange}</p>
                      </div>
                      <button
                        type="button"
                        className={btn}
                        onClick={() => user
                          ? setProposing({ id: job.id, title: job.title, budgetRange: job.budgetRange })
                          : navigate('/auth', { state: { from: '/marketplace' } })}
                      >
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
          {/* Job matching (where /match lands): under the results at every width. The #ai-matching
              anchor appears only once the listings are in, so a /match visit scrolls to where it
              finally sits, not to where it was before the cards pushed it down. */}
          <JobMatches id={dataLoading ? undefined : 'ai-matching'} className="mt-12 max-w-3xl" />
        </div>

        {/* Right column — Talent density heatmap (freelancer mode only) */}
        {mode === 'freelancers' && (
          <aside className="hidden w-[360px] flex-shrink-0 xl:block">
            <div className="sticky top-24">
              <FreelancerHeatmap listings={listings} />
            </div>
          </aside>
        )}
      </div>
      </div>
      {proposing && <ProposalModal job={proposing} onClose={() => setProposing(null)} />}
    </div>
  );
};

const EmptyState: React.FC<{ onReset: () => void, mode: 'freelancers' | 'jobs', t: (k: string) => string }> = ({ onReset, mode, t }) => (
  <div className="animate-in fade-in border-2 border-dashed border-ink/40 bg-white px-6 py-24 text-center duration-500">
    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-2 border-ink text-ink">
      <Search size={30} aria-hidden="true" />
    </div>
    <h3 className="mb-3 font-display text-[1.75rem] font-extrabold tracking-[-0.02em]">
      {mode === 'freelancers' ? t('No Freelancers Found') : t('No Jobs Posted Yet')}
    </h3>
    <p className="mx-auto max-w-sm text-[1rem] text-slate">
      {t('Nothing here yet. Be the first to post.')}
    </p>
    <div className="mt-8 flex flex-wrap justify-center gap-4">
      <button
        onClick={onReset}
        className="border-2 border-ink bg-white px-7 py-3.5 font-display text-[15px] font-bold transition-colors hover:bg-paper2"
      >
        {t('Clear Filters')}
      </button>
      <Link
        to="/profile"
        className="inline-flex items-center bg-sky px-7 py-3.5 font-display text-[15px] font-bold text-white transition-colors hover:bg-ink"
      >
        {mode === 'freelancers' ? t('Create Listing') : t('Post a Job')}
      </Link>
    </div>
  </div>
);

export default Marketplace;
