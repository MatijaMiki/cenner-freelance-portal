
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Star, Clock, Tag, ChevronDown, 
  X, SlidersHorizontal, ArrowUpDown, Briefcase, 
  Zap, Users, FileText, TrendingUp, AlertCircle 
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import { useData } from '../contexts/DataContext';

type MarketplaceMode = 'freelancers' | 'clients';

const Marketplace: React.FC = () => {
  const { listings, jobs } = useData();
  const [mode, setMode] = useState<MarketplaceMode>('freelancers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

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

  const filteredServices = useMemo(() => {
    let result = listings.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesPrice = item.price <= priceRange;
      return matchesSearch && matchesCategory && matchesPrice;
    });

    switch (sortBy) {
      case 'price-asc': return result.sort((a, b) => a.price - b.price);
      case 'price-desc': return result.sort((a, b) => b.price - a.price);
      case 'rating': return result.sort((a, b) => b.rating - a.rating);
      default: return result.sort((a, b) => b.id.localeCompare(a.id));
    }
  }, [listings, searchTerm, selectedCategory, priceRange, sortBy]);

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
          <span>Category Protocol</span>
        </h3>
        <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'All' ? 'bg-brand-green text-brand-black shadow-lg shadow-brand-green/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
            }`}
          >
            All Specializations
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
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Budget Threshold</h3>
            <span className="text-brand-green font-black text-sm">€{priceRange}</span>
          </div>
          <input
            type="range"
            min="50"
            max="5000"
            step="50"
            value={priceRange}
            onChange={(e) => setPriceRange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-brand-black border border-white/5 rounded-lg appearance-none cursor-pointer accent-brand-green"
          />
          <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-600 uppercase">
            <span>€50</span>
            <span>€5000+</span>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Sort Mechanism</h3>
        <div className="space-y-2">
          {[
            { label: 'Recently Added', val: 'newest' },
            { label: 'Price: Low to High', val: 'price-asc' },
            { label: 'Price: High to Low', val: 'price-desc' },
            { label: 'Top Rated', val: 'rating' }
          ].map(opt => (
            <button 
              key={opt.val}
              onClick={() => setSortBy(opt.val as any)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold border transition-all ${sortBy === opt.val ? 'border-brand-pink/50 text-brand-pink bg-brand-pink/5' : 'border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 rounded-[2rem] bg-gradient-to-br from-brand-pink/20 to-brand-green/20 border border-white/10 backdrop-blur-md hidden lg:block">
        <Tag size={24} className="text-white mb-4" />
        <h4 className="text-white font-black text-lg mb-2">Priority Matching</h4>
        <p className="text-gray-400 text-xs leading-relaxed mb-6 font-medium">Bypass the queue and get matched with certified Elite Pros within 2 hours.</p>
        <button className="w-full py-3.5 bg-white text-brand-black rounded-xl text-xs font-black hover:scale-105 transition-all uppercase tracking-widest">
          Activate Elite
        </button>
      </div>
    </div>
  );

  return (
    <div className="pt-12 pb-24 px-4 max-w-7xl mx-auto">
      {/* Mobile Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-brand-black/95 backdrop-blur-xl" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-brand-grey border-l border-white/10 p-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-white tracking-tighter">Node Filters</h2>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <SidebarContent />
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
          <h1 className="text-5xl font-black text-white mb-3 tracking-tighter">Marketplace</h1>
          <p className="text-gray-500 font-medium">The world's most advanced hub for digital synchronization.</p>
        </div>

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
            <span>Find Experts</span>
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
            <span>Open Requests</span>
          </button>
        </div>
      </div>

      {/* Search & Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <div className="relative flex-grow">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder={mode === 'freelancers' ? "Search for services (UI/UX, Dev, AI...)" : "Search for project requests..."}
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
          <span>Adjust Protocol</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <SidebarContent />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-grow">
          {mode === 'freelancers' ? (
            /* Service Listings Grid */
            filteredServices.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in duration-500">
                {filteredServices.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/service/${listing.id}`}
                    className="group bg-brand-grey/90 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-brand-green/50 transition-all flex flex-col h-full shadow-xl"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-5 left-5">
                        <span className="bg-brand-black/90 backdrop-blur-md text-brand-green px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                          {listing.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-grow bg-brand-black/20">
                      <div className="flex items-center space-x-3 mb-6">
                        <img
                          src={listing.freelancerAvatar}
                          alt={listing.freelancerName}
                          className="w-10 h-10 rounded-full border-2 border-brand-green"
                        />
                        <div className="flex-grow min-w-0">
                          <p className="text-white text-sm font-bold truncate">{listing.freelancerName}</p>
                          <p className="text-brand-pink text-[10px] font-black uppercase tracking-tighter">Verified Specialist</p>
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
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Starting at</p>
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
                            <span className="text-[10px] font-black uppercase tracking-widest">High Priority</span>
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
                          <img src={job.clientAvatar} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                          <span className="text-xs font-bold text-gray-300">{job.clientName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-gray-500">
                          <FileText size={16} className="text-brand-green" />
                          <span>{job.proposalsCount} Proposals Syncing</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:text-right flex-shrink-0 flex flex-col justify-between h-full">
                      <div className="mb-6">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Budget Allocation</p>
                        <p className="text-2xl font-black text-white">{job.budgetRange}</p>
                      </div>
                      <button className="w-full md:w-auto px-10 py-4 bg-brand-pink text-white font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-pink/20 uppercase tracking-widest text-xs">
                        Sync Proposal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                mode="jobs"
                onReset={() => {setSearchTerm(''); setSelectedCategory('All');}} 
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ onReset: () => void, mode: 'freelancers' | 'jobs' }> = ({ onReset, mode }) => (
  <div className="text-center py-32 bg-brand-grey/20 rounded-[3rem] border-2 border-dashed border-white/5 animate-in fade-in zoom-in duration-500">
    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600">
      <Search size={36} />
    </div>
    <h3 className="text-2xl font-black text-white mb-3">
      {mode === 'freelancers' ? "No Expert Nodes Active" : "No Open Protocols"}
    </h3>
    <p className="text-gray-500 font-medium max-w-sm mx-auto">
      The network is currently waiting for new signals. Be the first to synchronize your data.
    </p>
    <div className="mt-8 flex justify-center gap-4">
      <button
        onClick={onReset}
        className="px-8 py-3 bg-white/5 text-white font-black rounded-xl hover:bg-white/10 transition-all border border-white/10"
      >
        Clear Filters
      </button>
      <Link
        to="/profile"
        className="px-8 py-3 bg-brand-green text-brand-black font-black rounded-xl hover:scale-105 transition-all shadow-lg"
      >
        {mode === 'freelancers' ? "Create Listing" : "Post a Job"}
      </Link>
    </div>
  </div>
);

export default Marketplace;
