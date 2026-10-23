
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle2, Loader2, Crown, Zap, Rocket, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import AnchorPrice from '../components/AnchorPrice';
import { PLANS as PRICES } from '../lib/plans';

const API_BASE = import.meta.env.VITE_CRM_API_BASE || 'https://api.cenner.hr';

const PLANS: Record<string, { title: string; price: number; icon: React.ReactNode; color: string }> = {
  pro:        { title: 'Pro Plan',        price: PRICES.PRO.pricePerMonth, icon: <Zap size={24} />,    color: 'text-leaf' },
  ultra:      { title: 'Ultra Plan',      price: PRICES.ULTRA.pricePerMonth, icon: <Crown size={24} />,  color: 'text-sky'  },
  enterprise: { title: 'Enterprise Plan', price: PRICES.ENTERPRISE.pricePerMonth, icon: <Rocket size={24} />, color: 'text-ink'       },
};

// ── Success screen ─────────────────────────────────────────────────────────
const SuccessScreen: React.FC<{ plan: typeof PLANS[string] }> = ({ plan }) => (
  <div className="pt-24 pb-32 max-w-2xl mx-auto px-4 text-center">
    <div className="w-24 h-24 bg-leaf/20 flex items-center justify-center text-leaf mx-auto mb-8 animate-in zoom-in duration-500">
      <CheckCircle2 size={48} />
    </div>
    <h1 className="text-5xl font-extrabold text-ink mb-4 tracking-tight">Subscription Active!</h1>
    <p className="text-slate text-lg mb-12">
      Your account has been upgraded to{' '}
      <span className={`${plan.color} font-bold`}>{plan.title}</span>.{' '}
      You now have full access to everything included in your plan.
    </p>

    <div className="bg-white border-2 border-ink p-8 mb-12 text-left">
      <h3 className="text-ink font-bold mb-4 uppercase text-xs tracking-widest">Subscription Summary</h3>
      <div className="flex justify-between items-center py-3 border-b border-ink/15">
        <span className="text-slate text-sm">Plan</span>
        <span className={`${plan.color} font-black text-sm uppercase`}>{plan.title}</span>
      </div>
      <div className="flex justify-between items-center py-3 border-b border-ink/15">
        <span className="text-slate text-sm">Billing Cycle</span>
        <span className="text-ink font-bold text-sm">Monthly</span>
      </div>
      <div className="flex justify-between items-center py-3">
        <span className="text-slate text-sm">Manage / Cancel</span>
        <span className="text-slate text-sm">Profile → Settings → Billing</span>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link to="/profile" className="px-10 py-4 bg-sky text-white font-black hover:scale-105 transition-all">
        Go to My Profile
      </Link>
      <Link to="/marketplace" className="px-10 py-4 border-2 border-ink text-ink font-bold hover:bg-ink/10 transition-all">
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
        <h2 className="text-3xl font-bold text-ink mb-4">Plan not found</h2>
        <Link to="/subscription" className="text-leaf font-bold">Back to Subscriptions</Link>
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
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate hover:text-ink mb-12 transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="bg-white border-2 border-ink p-10 space-y-8">
        {/* Plan header */}
        <div className="flex items-center gap-4">
          <div className={`p-4 bg-ink/5 border-2 border-ink ${plan.color}`}>
            {plan.icon}
          </div>
          <div>
            <h1 className="text-2xl font-black text-ink tracking-tight">{plan.title}</h1>
            <p className="text-slate text-sm">€{plan.price} / month · cancel anytime</p>
            <AnchorPrice ids={[`plan-${planKey}`]} className="mt-1 text-slate" />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-3 py-6 border-t border-b border-ink/15">
          <div className="flex justify-between text-sm">
            <span className="text-slate">Subscription</span>
            <span className="text-ink font-black">€{plan.price}.00 / mo</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate">Setup fee</span>
            <span className="text-leaf font-black">€0.00</span>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-2 text-xs text-slate font-bold">
          <ShieldCheck size={14} className="text-leaf" />
          Secure checkout via Stripe · cancel anytime from your profile
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-700 p-3">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-5 bg-sky text-white font-black text-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-3"
        >
          {loading ? (
            <><Loader2 size={20} className="animate-spin" /> Redirecting to Stripe…</>
          ) : (
            `Activate ${plan.title} for €${plan.price}/mo`
          )}
        </button>

        <p className="text-[12px] text-slate text-center leading-relaxed">
          You'll be taken to Stripe's secure checkout. After subscribing you can upgrade, downgrade, or cancel anytime from your profile billing settings.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
