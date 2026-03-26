
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, ArrowLeft, CreditCard, Lock, CheckCircle2,
  ShoppingBag, Info, Crown, Zap,
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const ELEMENT_STYLE = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      '::placeholder': { color: '#6b7280' },
    },
    invalid: { color: '#f43f5e' },
  },
};

// ── Card brand badges ──────────────────────────────────────────────────────
const CardBrands = () => (
  <div className="flex items-center gap-1.5">
    {[
      { label: 'VISA', color: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
      { label: 'MC', color: 'text-red-400 border-red-400/30 bg-red-400/5' },
      { label: 'AMEX', color: 'text-sky-400 border-sky-400/30 bg-sky-400/5' },
    ].map(({ label, color }) => (
      <span
        key={label}
        className={`px-2 py-0.5 text-[9px] font-black border rounded tracking-widest ${color}`}
      >
        {label}
      </span>
    ))}
  </div>
);

// ── PayPal wordmark (inline SVG-like text, no external assets) ─────────────
const PayPalLogo = ({ size = 16 }: { size?: number }) => (
  <span style={{ fontSize: size, fontWeight: 900, letterSpacing: '-0.5px' }}>
    <span style={{ color: '#003087' }}>Pay</span>
    <span style={{ color: '#009cde' }}>Pal</span>
  </span>
);

interface CheckoutFormProps {
  planId: string;
  plan: { title: string; price: number; color: string };
  onSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ planId, plan, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user: currentUser, updateUser } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_CRM_API_BASE || 'https://api.cenner.hr';

  // ── Stripe card submit ───────────────────────────────────────────────────
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !currentUser) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/portal/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ planId }),
      });
      const { clientSecret, error: backendError } = await res.json();
      if (backendError) throw new Error(backendError);

      const cardNumberEl = elements.getElement(CardNumberElement);
      if (!cardNumberEl) throw new Error('Card element not found');

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardNumberEl as any },
      });
      if (result.error) throw new Error(result.error.message);

      await API.updateProfile(currentUser.id, { tier: planId } as any);
      updateUser({ tier: planId } as any);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Payment failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── PayPal callbacks ─────────────────────────────────────────────────────
  const createPayPalOrder = async () => {
    const res = await fetch(`${API_BASE}/api/v1/portal/paypal/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ planId }),
    });
    const { orderId, error: err } = await res.json();
    if (err) throw new Error(err);
    return orderId;
  };

  const onPayPalApprove = async (data: { orderID: string }) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/portal/paypal/capture-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId: data.orderID, planId }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      await API.updateProfile(currentUser!.id, { tier: planId } as any);
      updateUser({ tier: planId } as any);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'PayPal payment failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Payment method tabs ──────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => { setPaymentMethod('card'); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${
            paymentMethod === 'card'
              ? 'border-brand-green text-brand-green bg-brand-green/5'
              : 'border-white/10 text-gray-400 hover:border-white/20'
          }`}
        >
          <CreditCard size={15} />
          Card
        </button>
        <button
          type="button"
          onClick={() => { setPaymentMethod('paypal'); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${
            paymentMethod === 'paypal'
              ? 'border-[#003087] bg-[#003087]/5'
              : 'border-white/10 text-gray-400 hover:border-white/20'
          }`}
        >
          <PayPalLogo size={13} />
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm font-medium bg-red-500/5 border border-red-500/20 rounded-xl p-3">
          {error}
        </p>
      )}

      {/* ── Card tab ─────────────────────────────────────────────────────── */}
      {paymentMethod === 'card' && (
        <form onSubmit={handleCardSubmit} className="space-y-4">
          {/* Card number */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Card Number</label>
              <CardBrands />
            </div>
            <div className="w-full bg-brand-black border border-white/10 rounded-xl py-4 px-5 focus-within:border-brand-green/50 transition-colors">
              <CardNumberElement options={ELEMENT_STYLE} />
            </div>
          </div>

          {/* Expiry + CVC row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Expiry Date</label>
              <div className="w-full bg-brand-black border border-white/10 rounded-xl py-4 px-5 focus-within:border-brand-green/50 transition-colors">
                <CardExpiryElement options={ELEMENT_STYLE} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">CVV</label>
              <div className="w-full bg-brand-black border border-white/10 rounded-xl py-4 px-5 focus-within:border-brand-green/50 transition-colors">
                <CardCvcElement options={ELEMENT_STYLE} />
              </div>
            </div>
          </div>

          {/* Stripe badge */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Lock size={11} />
            <span>Secured by <strong className="text-gray-500">Stripe</strong></span>
          </div>

          <div className="pt-2 border-t border-white/5">
            <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-5 flex items-start space-x-4 mb-5">
              <ShieldCheck className="text-brand-green shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-brand-green font-bold text-sm">Secure Auto-Renewal</h4>
                <p className="text-gray-500 text-xs leading-relaxed mt-1">Your subscription renews monthly. Cancel anytime from account settings.</p>
              </div>
            </div>
            <button
              disabled={isProcessing || !stripe}
              type="submit"
              className="w-full py-5 bg-brand-green text-brand-black font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-green/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isProcessing ? 'Processing...' : `Activate ${plan.title} — €${plan.price}`}
            </button>
          </div>
        </form>
      )}

      {/* ── PayPal tab ───────────────────────────────────────────────────── */}
      {paymentMethod === 'paypal' && (
        <div className="space-y-5">
          <div className="text-center py-4">
            <div className="text-3xl font-black tracking-tight mb-1">
              <span style={{ color: '#003087' }}>Pay</span>
              <span style={{ color: '#009cde' }}>Pal</span>
            </div>
            <p className="text-gray-500 text-sm">
              You'll be redirected to PayPal to complete your payment securely.
            </p>
          </div>

          {import.meta.env.VITE_PAYPAL_CLIENT_ID && import.meta.env.VITE_PAYPAL_CLIENT_ID !== 'your_paypal_client_id_here' ? (
            <PayPalScriptProvider
              options={{
                clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
                currency: 'EUR',
              }}
            >
              <PayPalButtons
                style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                disabled={isProcessing}
                createOrder={createPayPalOrder}
                onApprove={onPayPalApprove}
                onError={(err) => setError(String(err))}
              />
            </PayPalScriptProvider>
          ) : (
            <div className="p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-400 text-sm font-medium text-center">
              PayPal is not configured yet. Add <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs">VITE_PAYPAL_CLIENT_ID</code> to your frontend <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs">.env.local</code> to enable PayPal payments.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────
const SubscriptionCheckout: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const plans: Record<string, { title: string; price: number; icon: React.ReactNode; color: string }> = {
    pro: { title: '🌟 Pro Plan', price: 19, icon: <Zap size={24} />, color: 'text-brand-green' },
    ultra: { title: '🚀 Ultra Plan', price: 59, icon: <Crown size={24} />, color: 'text-brand-pink' },
  };

  const plan = planId ? plans[planId.toLowerCase()] : null;

  if (!plan) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-3xl font-bold text-white mb-4">Plan not found</h2>
        <Link to="/subscription" className="text-brand-green font-bold">Back to Subscriptions</Link>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="pt-24 pb-32 max-w-2xl mx-auto px-4 text-center">
        <div className="w-24 h-24 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green mx-auto mb-8 animate-in zoom-in duration-500">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Upgrade Successful!</h1>
        <p className="text-gray-400 text-lg mb-12">
          Your account has been upgraded to <span className={`${plan.color} font-bold`}>{plan.title}</span>.{' '}
          You now have full access to everything included in your plan.
        </p>

        <div className="bg-brand-grey/90 border border-white/10 rounded-3xl p-8 mb-12 text-left shadow-2xl">
          <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Subscription Summary</h3>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-gray-500 text-sm">Plan</span>
            <span className={`${plan.color} font-black text-sm uppercase`}>{plan.title}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-gray-500 text-sm">Billing Cycle</span>
            <span className="text-white font-bold text-sm">Monthly</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-500 text-sm">Next Charge</span>
            <span className="text-brand-pink font-bold text-sm">1 Month from today</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/profile" className="px-10 py-4 bg-brand-green text-brand-black font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-green/20">
            Go to My Profile
          </Link>
          <Link to="/marketplace" className="px-10 py-4 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-32 max-w-6xl mx-auto px-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-gray-500 hover:text-white mb-12 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <h1 className="text-4xl font-extrabold text-white mb-10 tracking-tight flex items-center space-x-4">
        <ShoppingBag className="text-brand-green" />
        <span>Plan Checkout</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* Left — form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Plan confirmation */}
          <section className="bg-brand-grey/90 border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6">Confirm Your Plan</h3>
            <div className="flex items-center space-x-4 p-6 bg-brand-black/40 rounded-2xl border border-white/10">
              <div className={`p-4 bg-white/5 rounded-xl ${plan.color}`}>{plan.icon}</div>
              <div>
                <h4 className="text-white font-black text-lg">{plan.title}</h4>
                <p className="text-gray-500 text-sm">Monthly subscription, cancel anytime.</p>
              </div>
            </div>
          </section>

          {/* Payment section */}
          <section className="bg-brand-grey/90 border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <CheckoutForm planId={planId!} plan={plan} onSuccess={() => setStep(2)} />
              </Elements>
            ) : (
              <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-400 text-sm font-medium">
                Stripe is not configured. Add{' '}
                <code className="bg-black/30 px-1 py-0.5 rounded text-xs">VITE_STRIPE_PUBLISHABLE_KEY</code> and{' '}
                <code className="bg-black/30 px-1 py-0.5 rounded text-xs">STRIPE_SECRET_KEY</code> to your env files.
              </div>
            )}
          </section>
        </div>

        {/* Right — summary */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-brand-grey/90 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="p-8">
              <h3 className="text-xl font-bold text-white mb-8">Summary</h3>

              <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-white/5">
                <div className={`p-4 bg-brand-black rounded-xl border border-white/10 ${plan.color}`}>
                  {plan.icon}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{plan.title}</h4>
                  <p className="text-gray-500 text-xs font-medium">Monthly Infrastructure</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter">Subscription</span>
                  <span className="text-white font-black">€{plan.price}.00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-gray-400">
                    <span className="font-bold uppercase tracking-tighter">Setup Fee</span>
                    <Info size={14} className="ml-1 opacity-50" />
                  </div>
                  <span className="text-brand-green font-black">€0.00</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-white font-black text-lg uppercase tracking-tighter">Due Today</span>
                  <span className="text-brand-pink font-black text-2xl">€{plan.price}.00</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-black">Recurring every 30 days</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-xs text-gray-500 font-bold uppercase tracking-tighter">
                  <ShieldCheck size={14} className="text-brand-green" />
                  <span>Instant Access</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-500 font-bold uppercase tracking-tighter">
                  <Lock size={14} className="text-brand-green" />
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
