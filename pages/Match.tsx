
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, X, Search, Briefcase, Clock, Zap, ArrowUpRight, ChevronDown } from 'lucide-react';
import NeuralBackground from '../components/NeuralBackground';
import { useData } from '../contexts/DataContext';
import { CATEGORIES } from '../constants';
import SEO from '../components/SEO';
import AvatarImg from '../components/Avatar';

const URGENCY_LABEL: Record<string, string> = {
  high: 'Urgent',
  medium: 'Active',
  low: 'Open',
};

const URGENCY_COLOR: Record<string, string> = {
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
  medium: 'text-brand-green bg-brand-green/10 border-brand-green/20',
  low: 'text-gray-400 bg-white/5 border-white/10',
};

const Match: React.FC = () => {
  const { jobs, loading } = useData();
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const suggestions = CATEGORIES.filter(
    (c) => c.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(c)
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const matchedJobs = useMemo(() => {
    if (tags.length === 0) return [];
    return jobs.filter((job) => {
      const haystack = `${job.title} ${job.description} ${job.category}`.toLowerCase();
      return tags.some((tag) => haystack.includes(tag.toLowerCase()));
    });
  }, [jobs, tags]);

  return (
    <div className="relative min-h-screen pt-16 pb-24 overflow-hidden">
      <SEO
        title="Match"
        canonical="/match"
        description="Find your perfect freelancer-client match on Cenner. AI-powered matching connects talent with the right projects."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Cenner AI Match — Pronađi Savršenog Freelancera',
          description: 'AI-powered matching za pronalazak idealnog freelancera u Hrvatskoj i EU. Opišite projekt i dobijte personaliziranu listu kandidata.',
          url: 'https://cenner.hr/match',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
        }}
      />
      <NeuralBackground parallax={false} />

      <div className="relative z-10 max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 bg-brand-pink/10 border border-brand-pink/20 rounded-full px-5 py-2 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink">
            <Zap size={12} />
            <span>Smart Matching</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-5 tracking-tighter">
            Find Jobs That Fit You
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Enter your skills or interests and we'll surface matching opportunities instantly.
          </p>
        </div>

        {/* Tag Input */}
        <div className="relative mb-12">
          <div
            className="flex flex-wrap items-center gap-2 min-h-[64px] w-full bg-brand-grey/80 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 focus-within:border-brand-green/50 transition-colors cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            <Tag size={18} className="text-gray-600 shrink-0" />
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-green/15 border border-brand-green/25 text-brand-green text-xs font-bold rounded-full"
              >
                {tag}
                <button onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="hover:text-white transition-colors">
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder={tags.length === 0 ? 'Type a skill (e.g. React, Design, WordPress)...' : 'Add another...'}
              className="flex-1 min-w-[160px] bg-transparent text-white placeholder:text-gray-600 text-sm outline-none"
            />
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && inputValue && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-brand-grey border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
                  className="w-full text-left px-5 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-brand-green transition-colors flex items-center gap-3"
                >
                  <Tag size={12} className="text-gray-600" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick-pick category pills */}
        {tags.length === 0 && (
          <div className="mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4 text-center">
              Or pick a category
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => addTag(cat)}
                  className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-xs font-bold text-gray-400 hover:text-brand-green hover:border-brand-green/30 hover:bg-brand-green/5 transition-all"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {tags.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6">
              {loading ? 'Searching...' : `${matchedJobs.length} match${matchedJobs.length !== 1 ? 'es' : ''} found`}
            </p>

            {loading && (
              <div className="grid md:grid-cols-2 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-44 bg-brand-grey/50 backdrop-blur-sm rounded-3xl border border-white/5 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && matchedJobs.length === 0 && (
              <div className="text-center py-24 bg-brand-grey/50 backdrop-blur-sm border border-white/5 rounded-[2.5rem]">
                <Search size={40} className="text-gray-700 mx-auto mb-5" />
                <p className="text-white font-black text-xl mb-2">No matches yet</p>
                <p className="text-gray-600 text-sm max-w-sm mx-auto">
                  No open jobs match <span className="text-gray-400">{tags.join(', ')}</span> right now. Try different tags or check back soon.
                </p>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-brand-green text-brand-black font-black text-xs rounded-xl uppercase tracking-widest hover:scale-105 transition-all"
                >
                  Browse All Listings <ArrowUpRight size={14} />
                </Link>
              </div>
            )}

            {!loading && matchedJobs.length > 0 && (
              <div className="grid md:grid-cols-2 gap-5">
                {matchedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="group bg-brand-grey/80 backdrop-blur-sm border border-white/5 rounded-[2rem] p-7 hover:border-white/10 hover:bg-white/5 transition-all duration-300 flex flex-col gap-4"
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarImg src={job.clientAvatar} name={job.clientName} size={36} className="rounded-full border border-white/10 shrink-0" />
                        <span className="text-[11px] text-gray-500 font-bold truncate">{job.clientName}</span>
                      </div>
                      <span className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${URGENCY_COLOR[job.urgency]}`}>
                        {URGENCY_LABEL[job.urgency]}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-white font-black text-base leading-snug mb-1.5 group-hover:text-brand-green transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{job.description}</p>
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-4 text-[11px] text-gray-600">
                        <span className="flex items-center gap-1.5"><Tag size={11} />{job.category}</span>
                        <span className="flex items-center gap-1.5"><Clock size={11} />{job.budgetRange}</span>
                      </div>
                      <Link
                        to="/marketplace"
                        className="flex items-center gap-1 text-[10px] font-black text-gray-500 hover:text-brand-green transition-colors uppercase tracking-widest"
                      >
                        Apply <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Match;
