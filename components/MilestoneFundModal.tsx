import React, { useEffect, useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, Lock, ShieldCheck, X } from 'lucide-react';
import { API } from '../lib/api';

interface Props {
  milestoneId: string;
  milestoneTitle: string;
  amount: number;
  onClose: () => void;
  onPaid: () => void;
}

let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (stripePromise) return stripePromise;
  const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (envKey) {
    stripePromise = loadStripe(envKey);
    return stripePromise;
  }
  stripePromise = API.getStripeConfig()
    .then(({ publishableKey }) => publishableKey ? loadStripe(publishableKey) : null)
    .catch(() => null);
  return stripePromise;
}

const PayForm: React.FC<{ amount: number; serviceFee: number; total: number; feeRate: number; onPaid: () => void }> = ({ amount, serviceFee, total, feeRate, onPaid }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please try again.');
      setProcessing(false);
      return;
    }

    // Manual-capture flow: success status is `requires_capture`, not `succeeded`.
    if (paymentIntent && ['requires_capture', 'succeeded', 'processing'].includes(paymentIntent.status)) {
      onPaid();
    } else {
      setError('Payment did not complete. Please try again.');
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <PaymentElement options={{ layout: 'tabs', wallets: { applePay: 'auto', googlePay: 'auto' } }} />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-400"><span>Milestone amount</span><span className="text-white font-bold">€{amount.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-400"><span>Service fee ({feeRate}%)</span><span className="text-white font-bold">€{serviceFee.toFixed(2)}</span></div>
        <div className="flex justify-between pt-2 border-t border-white/10"><span className="text-white font-black uppercase tracking-tighter">Total</span><span className="text-brand-green font-black">€{total.toFixed(2)}</span></div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
      )}

      <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="text-brand-green shrink-0 mt-0.5" size={18} />
        <p className="text-gray-400 text-xs leading-relaxed">
          Funds are <span className="text-white font-bold">held in escrow</span> by Stripe and only released to the freelancer once you approve the delivered work (or 72h after submission).
        </p>
      </div>

      <button
        disabled={processing || !stripe || !elements}
        type="submit"
        className="w-full py-4 bg-brand-green text-brand-black font-black rounded-2xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
      >
        {processing ? (
          <><Loader2 className="animate-spin" size={18} /><span>Authorising…</span></>
        ) : (
          <><Lock size={16} /><span>Fund €{total.toFixed(2)}</span></>
        )}
      </button>
    </form>
  );
};

const MilestoneFundModal: React.FC<Props> = ({ milestoneId, milestoneTitle, amount, onClose, onPaid }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [charge, setCharge] = useState<{ serviceFee: number; total: number; feeRate: number }>({
    serviceFee: Math.round(amount * 5) / 100,
    total: amount + Math.round(amount * 5) / 100,
    feeRate: 5,
  });

  useEffect(() => {
    let cancelled = false;
    getStripe().then(s => { if (!cancelled) setStripe(s); });
    API.fundMilestone(milestoneId)
      .then((data: any) => {
        if (cancelled) return;
        setClientSecret(data.clientSecret);
        if (typeof data.total === 'number') {
          setCharge({ serviceFee: data.serviceFee ?? 0, total: data.total, feeRate: data.serviceFeeRate ?? 5 });
        }
      })
      .catch(err => { if (!cancelled) setLoadError(err?.message || 'Could not initialise payment'); });
    return () => { cancelled = true; };
  }, [milestoneId]);

  const elementsOptions = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#4ade80',
        colorBackground: '#111111',
        colorText: '#ffffff',
        colorTextSecondary: '#9ca3af',
        colorDanger: '#f43f5e',
        fontFamily: '"Inter", sans-serif',
        borderRadius: '12px',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': { border: '1px solid rgba(255,255,255,0.1)', padding: '14px 18px' },
        '.Input:focus': { border: '1px solid #4ade80', boxShadow: 'none' },
        '.Tab': { border: '1px solid rgba(255,255,255,0.1)' },
        '.Tab--selected': { border: '1px solid #4ade80', color: '#4ade80' },
        '.Label': { fontWeight: '700', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' },
      },
    },
  } : null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-brand-grey border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl my-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-white font-black text-lg">Fund milestone</h3>
            <p className="text-gray-500 text-xs mt-0.5 truncate">{milestoneTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 -m-2 text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {loadError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-6 text-red-400 text-sm text-center">
            <p className="font-bold mb-1">Could not start payment</p>
            <p className="text-xs text-gray-500">{loadError}</p>
          </div>
        ) : !clientSecret || !stripe || !elementsOptions ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="animate-spin mr-2" size={18} />
            <span className="text-sm">Preparing payment…</span>
          </div>
        ) : (
          <Elements stripe={stripe} options={elementsOptions}>
            <PayForm amount={amount} serviceFee={charge.serviceFee} total={charge.total} feeRate={charge.feeRate} onPaid={onPaid} />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default MilestoneFundModal;
