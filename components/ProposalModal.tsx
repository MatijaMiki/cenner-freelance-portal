import React, { useEffect, useId, useRef, useState } from 'react';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import { useT } from '../i18n';
import { API } from '../lib/api';

export interface ProposalTarget {
  id: string;
  title: string;
  budgetRange?: string;
}

/**
 * Proposal form for a job. The server enforces the same limits (cover letter 20-4000 chars, bid > 0,
 * delivery 1-365 whole days) and requires KYC; its message is shown as-is when it refuses.
 */
const ProposalModal: React.FC<{
  job: ProposalTarget;
  onClose: () => void;
  onSent?: (jobId: string) => void;
}> = ({ job, onClose, onSent }) => {
  const t = useT();
  const titleId = useId();
  const firstField = useRef<HTMLTextAreaElement>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [bid, setBid] = useState('');
  const [days, setDays] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const bidNum = Number(bid);
  const daysNum = Number(days);
  const valid =
    coverLetter.trim().length >= 20 && coverLetter.length <= 4000 &&
    Number.isFinite(bidNum) && bidNum > 0 && bidNum <= 1_000_000 &&
    Number.isInteger(daysNum) && daysNum > 0 && daysNum <= 365;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || status === 'loading') return;
    setStatus('loading');
    setError('');
    try {
      await API.submitJobProposal(job.id, { coverLetter: coverLetter.trim(), bidAmount: bidNum, deliveryDays: daysNum });
      setStatus('sent');
      onSent?.(job.id);
    } catch (err: any) {
      setStatus('error');
      setError(err?.message || t('Something went wrong. Please try again.'));
    }
  };

  const field = 'w-full border-2 border-ink bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-slate focus:border-sky focus:outline-none';

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="max-h-[92vh] w-full max-w-lg overflow-y-auto border-2 border-ink bg-white p-6 shadow-[8px_8px_0_0_#0b0c0e]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-display text-[1.375rem] font-extrabold tracking-[-0.02em] text-ink">{t('Send a proposal')}</h2>
            <p className="mt-1 text-[0.95rem] text-ink/80">{job.title}</p>
            {job.budgetRange && <p className="text-[13px] text-slate">{t('Budget Allocation')}: {job.budgetRange}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label={t('Close')} className="shrink-0 p-1 text-ink hover:text-sky focus-visible:text-sky focus-visible:outline-none">
            <X size={20} />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="space-y-4">
            <div role="status" className="flex items-start gap-2.5 border-2 border-leaf bg-leaf/10 px-4 py-3.5 font-display text-[14px] font-bold text-leaf">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{t('Proposal sent. The client has been notified.')}</span>
            </div>
            <button type="button" onClick={onClose} className="w-full bg-sky py-3 font-display text-[15px] font-bold text-white transition-colors hover:bg-ink focus-visible:bg-ink focus-visible:outline-none">{t('Close')}</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-3.5">
            <label className="block">
              <span className="mb-1 block font-display text-[13px] font-bold text-ink">{t('Cover letter')}</span>
              <textarea ref={firstField} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={6} maxLength={4000} className={field}
                placeholder={t('Why you are the right person for this job (at least 20 characters)')} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block font-display text-[13px] font-bold text-ink">{t('Your bid (€)')}</span>
                <input type="number" inputMode="decimal" min={1} step="any" value={bid} onChange={(e) => setBid(e.target.value)} className={field} />
              </label>
              <label className="block">
                <span className="mb-1 block font-display text-[13px] font-bold text-ink">{t('Delivery (days)')}</span>
                <input type="number" inputMode="numeric" min={1} max={365} step={1} value={days} onChange={(e) => setDays(e.target.value)} className={field} />
              </label>
            </div>
            {status === 'error' && <p role="alert" className="text-[13px] font-medium text-red-700">{error}</p>}
            <button type="submit" disabled={!valid || status === 'loading'}
              className="flex w-full items-center justify-center gap-2 bg-sky py-3 font-display text-[15px] font-bold text-white transition-colors hover:bg-ink focus-visible:bg-ink focus-visible:outline-none disabled:opacity-50">
              {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : t('Send proposal')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProposalModal;
