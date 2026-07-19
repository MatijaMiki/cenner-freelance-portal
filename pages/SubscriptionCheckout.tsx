
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle2, Loader2, Crown, Zap, Rocket, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

const API_BASE = import.meta.env.VITE_CRM_API_BASE || 'https://api.cenner.hr';

const PLANS: Record<string, { title: string; price: number; icon: React.ReactNode; color: string }> = {
  pro:        { title: 'Pro Plan',        price: 19, icon: <Zap size={24} />,    color: 'text-brand-green' },
  ultra:      { title: 'Ultra Plan',      price: 59, icon: <Crown size={24} />,  color: 'text-brand-pink'  },
  enterprise: { title: 'Enterprise Plan', price: 99, icon: <Rocket size={24} />, color: 'text-white'       },
};

// ── Success screen ─────────────────────────────────────────────────────────
const SuccessScreen: React.FC<{ plan: typeof PLANS[string] }> = ({ plan }) => (
  <div className="pt-24 pb-32 max-w-2xl mx-auto px-4 text-center">
    <div className="w-24 h-24 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green mx-auto mb-8 animate-in zoom-in duration-500">
      <CheckCircle2 size={48} />
    </div>
    <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Subscription Active!</h1>
    <p className="text-gray-400 text-lg mb-12">
      Your account has been upgraded to{' '}
      <span className={`${plan.color} font-bold`}>{plan.title}</span>.{' '}
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
        <span className="text-gray-500 text-sm">Manage / Cancel</span>
        <span className="text-gray-400 text-sm">Profile → Settings → Billing</span>
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

// ── Main page ──────────────────────────────────────────────────────────────
const SubscriptionCheckout: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planKey = planId?.toLowerCase() ?? '';
  const plan = PLANS[planKey];

  // Success return from Stripe Checkout
  const isSuccess = searchParams.get('success') === '1';

  // Refresh user data on success so tier updates in context
  useEffect(() => {
    if (!isSuccess) return;
    fetch(`${API_BASE}/api/v1/portal/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(me => { if (me) updateUser(me); })
      .catch(() => {});
  }, [isSuccess]);

  if (!plan) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-3xl font-bold text-white mb-4">Plan not found</h2>
        <Link to="/subscription" className="text-brand-green font-bold">Back to Subscriptions</Link>
      </div>
    );
  }

  if (isSuccess) return <SuccessScreen plan={plan} />;

  const handleCheckout = async () => {
    if (!currentUser) { navigate('/auth', { state: { from: `/checkout-subscription/${planKey}` } }); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/portal/subscription/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: planKey.toUpperCase() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="pt-12 pb-32 max-w-lg mx-auto px-4">
      <SEO noIndex />
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-12 transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="bg-brand-grey/90 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
        {/* Plan header */}
        <div className="flex items-center gap-4">
          <div className={`p-4 bg-white/5 rounded-2xl border border-white/10 ${plan.color}`}>
            {plan.icon}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">{plan.title}</h1>
            <p className="text-gray-500 text-sm">€{plan.price} / month · cancel anytime</p>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-3 py-6 border-t border-b border-white/5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subscription</span>
            <span className="text-white font-black">€{plan.price}.00 / mo</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Setup fee</span>
            <span className="text-brand-green font-black">€0.00</span>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
          <ShieldCheck size={14} className="text-brand-green" />
          Secure checkout via Stripe · cancel anytime from your profile
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl p-3">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-5 bg-brand-green text-brand-black font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-green/20 disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-3"
        >
          {loading ? (
            <><Loader2 size={20} className="animate-spin" /> Redirecting to Stripe…</>
          ) : (
            `Activate ${plan.title} — €${plan.price}/mo`
          )}
        </button>

        <p className="text-[10px] text-gray-600 text-center leading-relaxed">
          You'll be taken to Stripe's secure checkout. After subscribing you can upgrade, downgrade, or cancel anytime from your profile billing settings.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
