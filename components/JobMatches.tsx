import React, { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useT } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { API, JobMatch } from '../lib/api';
import ProposalModal from './ProposalModal';

/**
 * Jobs ranked for the signed-in freelancer (skills, category, profile text, standing; scored on the
 * server). This is where /match lands (#ai-matching on the Marketplace).
 */
const JobMatches: React.FC<{ id?: string; className?: string }> = ({ id, className = '' }) => {
  const t = useT();
  const titleId = useId();
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [hasProfile, setHasProfile] = useState(true);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [proposing, setProposing] = useState<JobMatch['job'] | null>(null);

  useEffect(() => {
    if (!user) { setState('idle'); setMatches([]); return; }
    let cancelled = false;
    setState('loading');
    API.getJobMatches(10)
      .then((r) => { if (!cancelled) { setHasProfile(r.hasProfile); setMatches(r.matches); setState('ready'); } })
      .catch(() => { if (!cancelled) setState('error'); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const link = 'inline-flex items-center gap-2 bg-sky px-5 py-3 font-display text-[15px] font-bold text-white transition-colors hover:bg-ink focus-visible:bg-ink focus-visible:outline-none';

  let body: React.ReactNode;
  if (authLoading || state === 'loading') {
    body = <div role="status" className="flex items-center gap-2 text-slate"><Loader2 size={16} className="animate-spin" />{t('Finding your matches...')}</div>;
  } else if (!user) {
    body = (
      <>
        <p className="mb-5 text-[0.95rem] leading-relaxed text-ink/80">{t('Sign in and we rank open jobs against your skills, listings and profile, so the best fits come first.')}</p>
        <Link to="/auth" state={{ from: '/marketplace#ai-matching' }} className={link}>{t('Sign in to see matches')}<ArrowRight size={14} /></Link>
      </>
    );
  } else if (state === 'error') {
    body = <p role="alert" className="text-[13px] font-medium text-red-700">{t('Something went wrong. Please try again.')}</p>;
  } else if (!hasProfile) {
    body = (
      <>
        <p className="mb-5 text-[0.95rem] leading-relaxed text-ink/80">{t('Add your skills or publish a listing and we can match you with jobs.')}</p>
        <Link to="/profile" className={link}>{t('Complete your profile')}<ArrowRight size={14} /></Link>
      </>
    );
  } else if (matches.length === 0) {
    body = <p className="text-[0.95rem] leading-relaxed text-ink/80">{t('No open jobs fit your profile right now. New jobs are checked as they are posted.')}</p>;
  } else {
    body = (
      <ul className="space-y-3">
        {matches.map(({ job, score, matchedSkills, categoryMatch }) => (
          <li key={job.id} className="flex flex-col gap-3 border-2 border-ink bg-white p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="bg-ink px-2 py-0.5 font-display text-[12px] font-bold text-white" aria-label={`${t('Match')} ${score}%`}>{score}%</span>
                <span className="text-[13px] text-slate">{job.category}</span>
              </div>
              <h5 className="truncate font-display text-[1.05rem] font-extrabold text-ink">{job.title}</h5>
              <p className="mt-0.5 text-[13px] text-slate">
                {[
                  matchedSkills.length > 0 ? `${t('Matches your skills')}: ${matchedSkills.slice(0, 4).join(', ')}` : null,
                  categoryMatch ? t('Your category') : null,
                ].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-1.5">
              <p className="font-display text-[1.1rem] font-extrabold text-ink">{job.budgetRange}</p>
              <button type="button" onClick={() => setProposing(job)} className="bg-sky px-4 py-2 font-display text-[14px] font-bold text-white transition-colors hover:bg-ink focus-visible:bg-ink focus-visible:outline-none">
                {t('Sync Proposal')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section id={id} aria-labelledby={titleId} className={`border-2 border-ink bg-white p-6 ${className}`}>
      <span className="mb-4 inline-flex items-center gap-1.5 bg-sky px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-white">
        <Sparkles size={10} />
        {t('Job Matching')}
      </span>
      <h4 id={titleId} className="mb-2 font-display text-[1.375rem] font-extrabold tracking-[-0.02em] text-ink">{t('Jobs picked for you')}</h4>
      {body}
      {proposing && (
        <ProposalModal
          job={proposing}
          onClose={() => setProposing(null)}
          onSent={(jobId) => setMatches((m) => m.filter((x) => x.job.id !== jobId))}
        />
      )}
    </section>
  );
};

export default JobMatches;
