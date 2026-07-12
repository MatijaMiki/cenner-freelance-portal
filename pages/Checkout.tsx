
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, ShoppingBag, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import SEO from '../components/SEO';

interface PaymentFormProps {
  listing: any;
  totalAmount: number;
  onSuccess: (paymentIntentId: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ listing, totalAmount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/order-success?type=service`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    } else if (paymentIntent && ['requires_capture', 'succeeded', 'processing'].includes(paymentIntent.status)) {
      // Manual-capture marketplace flow returns `requires_capture` after auth.
      onSuccess(paymentIntent.id);
    } else {
      setError('Payment did not complete. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="pt-4 border-t border-white/5">
        <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-5 flex items-start space-x-4 mb-6">
          <ShieldCheck className="text-brand-green shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-brand-green font-bold text-sm">Secure Payment Protection</h4>
            <p className="text-gray-500 text-xs leading-relaxed mt-1">
              Processed securely by Stripe. Cenner never stores your card details.
              <span className="text-white font-bold"> {listing.freelancerName}</span> will be notified immediately.
            </p>
          </div>
        </div>

        <button
          disabled={isProcessing || !stripe || !elements}
          type="submit"
          className="w-full py-5 bg-brand-green text-brand-black font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-green/20 flex items-center justify-center space-x-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isProcessing ? (
            <><Loader2 className="animate-spin" size={20} /><span>Processing Securely...</span></>
          ) : (
            <span>Confirm & Pay €{totalAmount}</span>
          )}
        </button>
      </div>
    </form>
  );
};

const Checkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getListingById } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  const listing = id ? getListingById(id) : undefined;

  // Buyer pays the listing price; the platform commission is deducted from the freelancer's payout.
  const totalAmount = listing ? listing.price : 0;

  useEffect(() => {
    API.getStripeConfig()
      .then(({ publishableKey }) => {
        const key = publishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (key) setStripePromise(loadStripe(key));
      })
      .catch(() => {
        const fallback = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (fallback) setStripePromise(loadStripe(fallback));
      });
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoadingIntent(true);
    API.createListingPaymentIntent(id)
      .then(data => {
        setClientSecret(data.clientSecret);
        setServerTotal(data.totalAmount);
      })
      .catch(err => setIntentError(err.message || 'Could not initialise payment'))
      .finally(() => setLoadingIntent(false));
  }, [id]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-3xl font-bold text-white mb-4">Sign in to complete your purchase</h2>
        <p className="text-gray-400 mb-6">You need to be logged in to buy this service.</p>
        <Link to="/auth" className="px-8 py-3 bg-brand-green text-brand-black font-black rounded-xl">
          Log In / Register
        </Link>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-3xl font-bold text-white mb-4">Service not found</h2>
        <Link to="/marketplace" className="text-brand-green font-bold">Back to Marketplace</Link>
      </div>
    );
  }

  const elementsOptions = {
    clientSecret: clientSecret!,
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
  };

  return (
    <div className="pt-12 pb-32 max-w-6xl mx-auto px-4">
      <SEO noIndex />
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-gray-500 hover:text-white mb-12 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back to Service</span>
      </button>

      <h1 className="text-4xl font-extrabold text-white mb-10 tracking-tight flex items-center space-x-4">
        <ShoppingBag className="text-brand-green" />
        <span>Secure Checkout</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* Left: Payment Form */}
        <div className="lg:col-span-2">
          <section className="bg-brand-grey/90 border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <Lock size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Powered by Stripe</span>
            </div>

            {loadingIntent ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 className="animate-spin mr-3" size={24} />
                <span>Initialising payment...</span>
              </div>
            ) : intentError ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-6 text-red-400 text-sm text-center">
                <p className="font-bold mb-2">Could not load payment</p>
                <p className="text-xs text-gray-500">{intentError}</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-xs text-brand-green underline">
                  Go back
                </button>
              </div>
            ) : clientSecret && stripePromise ? (
              <Elements stripe={stripePromise} options={elementsOptions}>
                <PaymentForm
                  listing={listing}
                  totalAmount={serverTotal ?? totalAmount}
                  onSuccess={(paymentId) => {
                    API.createOrder(id!, paymentId).catch(() => {});
                    API.getPaymentReceipt(paymentId)
                      .then(({ receiptUrl: url }) => {
                        navigate('/order-success?type=service', {
                          replace: true,
                          state: {
                            listingTitle: listing.title,
                            freelancerName: listing.freelancerName,
                            deliveryTime: listing.deliveryTime,
                            amount: serverTotal ?? totalAmount,
                            paymentId,
                            receiptUrl: url || undefined,
                          },
                        });
                      })
                      .catch(() => {
                        navigate('/order-success?type=service', {
                          replace: true,
                          state: {
                            listingTitle: listing.title,
                            freelancerName: listing.freelancerName,
                            deliveryTime: listing.deliveryTime,
                            amount: serverTotal ?? totalAmount,
                            paymentId,
                          },
                        });
                      });
                  }}
                />
              </Elements>
            ) : null}
          </section>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-brand-grey/90 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="p-8">
              <h3 className="text-xl font-bold text-white mb-8">Order Summary</h3>

              <div className="flex items-start space-x-4 mb-8 pb-8 border-b border-white/5">
                <img src={listing.imageUrl} alt={listing.title} className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
                <div>
                  <h4 className="text-white font-bold text-sm line-clamp-2 mb-1">{listing.title}</h4>
                  <p className="text-gray-500 text-xs font-medium">By {listing.freelancerName}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter">Subtotal</span>
                  <span className="text-white font-black">€{listing.price}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-white font-black text-lg uppercase tracking-tighter">Total Amount</span>
                  <span className="text-brand-pink font-black text-2xl">€{serverTotal ?? totalAmount}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-black">No hidden buyer fees — price shown is what you pay</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-xs text-gray-500 font-bold uppercase tracking-tighter">
                  <ShieldCheck size={14} className="text-brand-green" />
                  <span>Money Back Guarantee</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-500 font-bold uppercase tracking-tighter">
                  <Lock size={14} className="text-brand-green" />
                  <span>End-to-End Encryption</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-brand-black text-center border-t border-white/5">
              <p className="text-[10px] text-gray-600 leading-tight font-bold uppercase tracking-widest">
                By completing this order, you agree to the Cenner Marketplace <Link to="/terms" className="text-brand-pink hover:underline">Terms of Service</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
