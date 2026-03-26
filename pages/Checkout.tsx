
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CreditCard, Lock, CheckCircle2, ShoppingBag, Info, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useData } from '../contexts/DataContext';
import { API } from '../lib/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '"Inter", sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#6b7280' },
    },
    invalid: { color: '#f43f5e', iconColor: '#f43f5e' },
  },
};

interface PaymentFormProps {
  listing: any;
  totalAmount: number;
  platformFee: number;
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ listing, totalAmount, platformFee, clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) { setIsProcessing(false); return; }

    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: { name: cardholderName },
      },
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Cardholder Name</label>
          <input
            required
            type="text"
            value={cardholderName}
            onChange={e => setCardholderName(e.target.value)}
            placeholder="ALEX RIVERA"
            className="w-full bg-brand-black border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-brand-green transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Card Number</label>
          <div className="w-full bg-brand-black border border-white/10 rounded-xl py-4 px-5 focus-within:border-brand-green transition-all">
            <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Expiry Date</label>
            <div className="w-full bg-brand-black border border-white/10 rounded-xl py-4 px-5 focus-within:border-brand-green transition-all">
              <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">CVV</label>
            <div className="w-full bg-brand-black border border-white/10 rounded-xl py-4 px-5 focus-within:border-brand-green transition-all">
              <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="pt-6 border-t border-white/5">
        <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-6 flex items-start space-x-4 mb-8">
          <ShieldCheck className="text-brand-green shrink-0 mt-1" size={24} />
          <div>
            <h4 className="text-brand-green font-bold text-sm">Secure Payment Protection</h4>
            <p className="text-gray-500 text-xs leading-relaxed mt-1">
              Payments are processed securely by Stripe. Cenner never stores your card details.
              <span className="text-white font-bold"> {listing.freelancerName}</span> will be notified immediately.
            </p>
          </div>
        </div>

        <button
          disabled={isProcessing || !stripe}
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
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [serverFee, setServerFee] = useState<number | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [confirmedPaymentId, setConfirmedPaymentId] = useState<string | null>(null);

  const listing = id ? getListingById(id) : undefined;

  const platformFee = listing ? Math.round(listing.price * 0.05) : 0;
  const totalAmount = listing ? listing.price + platformFee : 0;

  useEffect(() => {
    if (!id) return;
    setLoadingIntent(true);
    API.createListingPaymentIntent(id)
      .then(data => {
        setClientSecret(data.clientSecret);
        setServerTotal(data.totalAmount);
        setServerFee(data.platformFee);
      })
      .catch(err => setIntentError(err.message || 'Could not initialise payment'))
      .finally(() => setLoadingIntent(false));
  }, [id]);

  if (!listing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-3xl font-bold text-white mb-4">Service not found</h2>
        <Link to="/marketplace" className="text-brand-green font-bold">Back to Marketplace</Link>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="pt-24 pb-32 max-w-2xl mx-auto px-4 text-center">
        <div className="w-24 h-24 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green mx-auto mb-8 animate-in zoom-in duration-500">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Order Confirmed!</h1>
        <p className="text-gray-400 text-lg mb-12">
          Your payment of <span className="text-brand-pink font-bold">€{serverTotal ?? totalAmount}</span> has been processed securely.
          <span className="text-brand-green font-bold"> {listing.freelancerName}</span> has been notified and will start working on your project immediately.
        </p>

        <div className="bg-brand-grey/90 border border-white/10 rounded-3xl p-8 mb-12 text-left shadow-2xl">
          <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Order Details</h3>
          {confirmedPaymentId && (
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-500 text-sm">Payment ID</span>
              <span className="text-white font-mono text-xs">{confirmedPaymentId.slice(0, 24)}…</span>
            </div>
          )}
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-gray-500 text-sm">Project</span>
            <span className="text-white font-bold text-sm">{listing.title}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-500 text-sm">Estimated Delivery</span>
            <span className="text-brand-pink font-bold text-sm">{listing.deliveryTime}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/profile" className="px-10 py-4 bg-brand-green text-brand-black font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-green/20">
            Go to My Orders
          </Link>
          <Link to="/marketplace" className="px-10 py-4 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
            Continue Shopping
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
              <CreditCard className="text-brand-green" size={20} />
              <h3 className="text-xl font-bold text-white">Card Details</h3>
              <Lock size={14} className="text-gray-500 ml-auto" />
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
                <button
                  onClick={() => navigate(-1)}
                  className="mt-4 text-xs text-brand-green underline"
                >
                  Go back
                </button>
              </div>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  listing={listing}
                  totalAmount={serverTotal ?? totalAmount}
                  platformFee={serverFee ?? platformFee}
                  clientSecret={clientSecret}
                  onSuccess={(id) => { setConfirmedPaymentId(id); setStep(2); }}
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
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-gray-400">
                    <span className="font-bold uppercase tracking-tighter">Cenner Fee</span>
                    <Info size={14} className="ml-1 opacity-50" />
                  </div>
                  <span className="text-white font-black">€{serverFee ?? platformFee}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-white font-black text-lg uppercase tracking-tighter">Total Amount</span>
                  <span className="text-brand-pink font-black text-2xl">€{serverTotal ?? totalAmount}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-black">Includes local taxes & platform fees</p>
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
