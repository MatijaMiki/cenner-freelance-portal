
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CreditCard, Wallet, Lock, CheckCircle2, ShoppingBag, Info } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Checkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getListingById } = useData();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const listing = id ? getListingById(id) : undefined;

  if (!listing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-3xl font-bold text-white mb-4">Service not found</h2>
        <Link to="/marketplace" className="text-brand-green font-bold">Back to Marketplace</Link>
      </div>
    );
  }

  const platformFee = Math.round(listing.price * 0.05);
  const totalAmount = listing.price + platformFee;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
    }, 2500);
  };

  if (step === 2) {
    return (
      <div className="pt-24 pb-32 max-w-2xl mx-auto px-4 text-center">
        <div className="w-24 h-24 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green mx-auto mb-8 animate-in zoom-in duration-500">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Order Confirmed!</h1>
        <p className="text-gray-400 text-lg mb-12">
          Your payment of <span className="text-brand-pink font-bold">€{totalAmount}</span> has been secured in escrow. 
          <span className="text-brand-green font-bold"> {listing.freelancerName}</span> has been notified and will start working on your project immediately.
        </p>
        
        <div className="bg-brand-grey/90 border border-white/10 rounded-3xl p-8 mb-12 text-left shadow-2xl">
          <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Order Details</h3>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-gray-500 text-sm">Order ID</span>
            <span className="text-white font-mono text-sm">#CEN-{Math.floor(Math.random() * 900000) + 100000}</span>
          </div>
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
        {/* Left: Form */}
        <div className="lg:col-span-2">
          <div className="space-y-8">
            {/* Payment Method Selection */}
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

            {/* Payment Details Form */}
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

                {paymentMethod === 'crypto' && (
                  <div className="text-center py-12 animate-in fade-in duration-300">
                    <div className="w-16 h-16 bg-brand-pink/10 rounded-full flex items-center justify-center text-brand-pink mx-auto mb-6">
                      <Lock size={32} />
                    </div>
                    <h4 className="text-white font-bold mb-2">Pay with Cryptocurrency</h4>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">Connect your wallet to process the payment via our secure Web3 bridge. We support ETH, BTC, and USDC.</p>
                    <button type="button" className="px-8 py-3 bg-white text-brand-black font-black rounded-xl hover:scale-105 transition-all">Connect Wallet</button>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="text-center py-12 animate-in fade-in duration-300">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-6">
                      <Wallet size={32} />
                    </div>
                    <h4 className="text-white font-bold mb-2">PayPal Express</h4>
                    <p className="text-gray-500 text-sm mb-8">Quick checkout using your PayPal account.</p>
                    <button type="button" className="px-8 py-3 bg-[#0070ba] text-white font-black rounded-xl hover:opacity-90 transition-all">Proceed to PayPal</button>
                  </div>
                )}

                <div className="pt-6 border-t border-white/5">
                  <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-6 flex items-start space-x-4 mb-8">
                    <ShieldCheck className="text-brand-green shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="text-brand-green font-bold text-sm">Military-Grade Escrow Security</h4>
                      <p className="text-gray-500 text-xs leading-relaxed mt-1">
                        Your funds are held safely in our secure escrow. Payment will only be released to <span className="text-white font-bold">{listing.freelancerName}</span> once you've reviewed and approved the final project files.
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isProcessing}
                    type="submit"
                    className="w-full py-5 bg-brand-green text-brand-black font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-green/20 flex items-center justify-center space-x-3"
                  >
                    <span>{isProcessing ? 'Processing Securely...' : `Confirm & Pay €${totalAmount}`}</span>
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>

        {/* Right: Summary Card */}
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
                  <span className="text-white font-black">€{platformFee}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-white font-black text-lg uppercase tracking-tighter">Total Amount</span>
                  <span className="text-brand-pink font-black text-2xl">€{totalAmount}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-black">Includes local taxes & escrow fees</p>
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
