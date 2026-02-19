
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CreditCard, Wallet, Lock, CheckCircle2, ShoppingBag, Info, Crown, Zap } from 'lucide-react';
import { auth } from '../lib/firebase';
import { CRM_API } from '../lib/crm';

const SubscriptionCheckout: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const currentUser = auth.currentUser;

  const plans: Record<string, { title: string, price: number, icon: any, color: string }> = {
    pro: { title: "🌟 Pro Plan", price: 19, icon: <Zap size={24} />, color: "text-brand-green" },
    ultra: { title: "🚀 Ultra Plan", price: 59, icon: <Crown size={24} />, color: "text-brand-pink" }
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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing time
    await new Promise(resolve => setTimeout(resolve, 2500));

    // CRM Integration
    if (currentUser) {
        // 1. Log Payment
        await CRM_API.logPayment(
            currentUser.uid, 
            plan.price, 
            'subscription', 
            `Upgrade to ${plan.title}`
        );

        // 2. Update Subscription Level
        const newTier = planId?.toLowerCase() as 'pro' | 'ultra';
        await CRM_API.updateSubscription(currentUser.uid, newTier);
    }

    setIsProcessing(false);
    setStep(2);
  };

  if (step === 2) {
    return (
      <div className="pt-24 pb-32 max-w-2xl mx-auto px-4 text-center">
        <div className="w-24 h-24 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green mx-auto mb-8 animate-in zoom-in duration-500">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Upgrade Successful!</h1>
        <p className="text-gray-400 text-lg mb-12">
          Your account has been upgraded to <span className={`${plan.color} font-bold`}>{plan.title}</span>. 
          Your elite nodes are now synchronizing with enhanced protocol priority.
        </p>
        
        <div className="bg-brand-grey/90 border border-white/10 rounded-3xl p-8 mb-12 text-left shadow-2xl">
          <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Subscription Summary</h3>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-gray-500 text-sm">Protocol Tier</span>
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
        <div className="lg:col-span-2">
          <div className="space-y-8">
            <section className="bg-brand-grey/90 border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6">Confirm Protocol Upgrade</h3>
              <div className="flex items-center space-x-4 p-6 bg-brand-black/40 rounded-2xl border border-white/10">
                <div className={`p-4 bg-white/5 rounded-xl ${plan.color}`}>
                  {plan.icon}
                </div>
                <div>
                  <h4 className="text-white font-black text-lg">{plan.title}</h4>
                  <p className="text-gray-500 text-sm">Elite high-fidelity infrastructure subscription.</p>
                </div>
              </div>
            </section>

            <section className="bg-brand-grey/90 border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6">Select Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'card', icon: <CreditCard />, label: 'Credit Card' },
                  { id: 'crypto', icon: <Lock />, label: 'Crypto' },
                  { id: 'paypal', icon: <Wallet />, label: 'PayPal' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                      paymentMethod === method.id 
                        ? 'border-brand-green bg-brand-green/5 text-brand-green' 
                        : 'border-white/5 bg-brand-black hover:border-white/20 text-gray-500'
                    }`}
                  >
                    <div className="mb-3">{method.icon}</div>
                    <span className="text-sm font-bold uppercase tracking-widest">{method.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-brand-grey/90 border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
              <form onSubmit={handlePayment} className="space-y-6">
                {paymentMethod === 'card' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Cardholder Name</label>
                      <input required type="text" placeholder="ALEX RIVERA" className="w-full bg-brand-black border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-brand-green transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Card Number</label>
                      <div className="relative">
                        <input required type="text" placeholder="0000 0000 0000 0000" className="w-full bg-brand-black border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-brand-green transition-all" />
                        <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Expiry Date</label>
                        <input required type="text" placeholder="MM / YY" className="w-full bg-brand-black border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-brand-green transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">CVV</label>
                        <input required type="text" placeholder="123" className="w-full bg-brand-black border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-brand-green transition-all" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-6 border-t border-white/5">
                  <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-6 flex items-start space-x-4 mb-8">
                    <ShieldCheck className="text-brand-green shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="text-brand-green font-bold text-sm">Secure Auto-Renewal</h4>
                      <p className="text-gray-500 text-xs leading-relaxed mt-1">
                        Your subscription will renew automatically every month. You can cancel at any time directly from your account settings.
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isProcessing}
                    type="submit"
                    className="w-full py-5 bg-brand-green text-brand-black font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-green/20 flex items-center justify-center space-x-3"
                  >
                    <span>{isProcessing ? 'Synchronizing Upgrade...' : `Activate ${plan.title} — €${plan.price}`}</span>
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>

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
                  <span>Immediate Protocol Access</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-500 font-bold uppercase tracking-tighter">
                  <Lock size={14} className="text-brand-green" />
                  <span>Encrypted Payment Node</span>
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
