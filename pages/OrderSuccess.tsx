
import React, { useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

const API_BASE = import.meta.env.VITE_CRM_API_BASE || 'https://api.cenner.hr';

interface SuccessState {
  listingTitle?: string;
  freelancerName?: string;
  deliveryTime?: string;
  amount?: number;
  paymentId?: string;
  receiptUrl?: string;
}

const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { updateUser } = useAuth();

  const type = (searchParams.get('type') || 'service').toLowerCase();
  const planParam = searchParams.get('plan');
  const amountParam = searchParams.get('amount');
  const state = (location.state || {}) as SuccessState;

  const isSubscription = type === 'subscription';
  const planTitle = planParam ? planParam.charAt(0).toUpperCase() + planParam.slice(1) + ' Plan' : null;

  // After subscription success, refresh the user so the new tier reflects in context.
  useEffect(() => {
    if (!isSubscription) return;
    fetch(`${API_BASE}/api/v1/portal/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(me => { if (me) updateUser(me); })
      .catch(() => {});
  }, [isSubscription, updateUser]);

  const headline = isSubscription ? 'Subscription Active!' : 'Order Confirmed!';
  const subtitle = isSubscription
    ? <>Your account has been upgraded{planTitle ? <> to <span className="text-brand-green font-bold">{planTitle}</span></> : ''}. You now have full access to everything included in your plan.</>
    : <>Your payment{state.amount || amountParam ? <> of <span className="text-brand-pink font-bold">€{state.amount ?? amountParam}</span></> : ''} has been processed securely.{state.freelancerName ? <> <span className="text-brand-green font-bold">{state.freelancerName}</span> has been notified and will start working on your project immediately.</> : ' Your freelancer has been notified and will start working on your project immediately.'}</>;

  return (
    <>
      <SEO
        title={isSubscription ? 'Subscription Active — Cenner' : 'Order Confirmed — Cenner'}
        description="Thank you for your purchase on Cenner."
      />
      <div className="pt-24 pb-32 max-w-2xl mx-auto px-4 text-center">
        <div className="w-24 h-24 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green mx-auto mb-8 animate-in zoom-in duration-500">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">{headline}</h1>
        <p className="text-gray-400 text-lg mb-12">{subtitle}</p>

        {isSubscription ? (
          <div className="bg-brand-grey/90 border border-white/10 rounded-3xl p-8 mb-12 text-left shadow-2xl">
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Subscription Summary</h3>
            {planTitle && (
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-gray-500 text-sm">Plan</span>
                <span className="text-brand-green font-black text-sm uppercase">{planTitle}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-500 text-sm">Billing Cycle</span>
              <span className="text-white font-bold text-sm">Monthly</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-500 text-sm">Manage / Cancel</span>
              <span className="text-gray-400 text-sm">Profile → Settings → Billing</span>
            </div>
          </div>
        ) : (state.listingTitle || state.paymentId || state.amount || amountParam) ? (
          <div className="bg-brand-grey/90 border border-white/10 rounded-3xl p-8 mb-12 text-left shadow-2xl">
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Order Details</h3>
            {state.paymentId && (
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-gray-500 text-sm">Payment ID</span>
                <span className="text-white font-mono text-xs">{state.paymentId.slice(0, 24)}…</span>
              </div>
            )}
            {state.listingTitle && (
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-gray-500 text-sm">Project</span>
                <span className="text-white font-bold text-sm">{state.listingTitle}</span>
              </div>
            )}
            {(state.amount || amountParam) && (
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-gray-500 text-sm">Amount Paid</span>
                <span className="text-brand-pink font-black text-sm">€{state.amount ?? amountParam}</span>
              </div>
            )}
            {state.deliveryTime && (
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-500 text-sm">Estimated Delivery</span>
                <span className="text-brand-pink font-bold text-sm">{state.deliveryTime}</span>
              </div>
            )}
          </div>
        ) : null}

        {state.receiptUrl && (
          <a
            href={state.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 text-brand-green font-bold text-sm mb-8 hover:underline"
          >
            <ArrowLeft size={14} className="rotate-[-90deg]" />
            <span>Download Stripe Receipt</span>
          </a>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isSubscription ? (
            <>
              <Link to="/profile" className="px-10 py-4 bg-brand-green text-brand-black font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-green/20">
                Go to My Profile
              </Link>
              <Link to="/marketplace" className="px-10 py-4 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                Browse Marketplace
              </Link>
            </>
          ) : (
            <>
              <Link to="/orders" className="px-10 py-4 bg-brand-green text-brand-black font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-green/20">
                Go to My Orders
              </Link>
              <Link to="/marketplace" className="px-10 py-4 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                Continue Shopping
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
