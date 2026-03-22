
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Clock, XCircle, Loader2, ArrowRight, AlertTriangle, UserCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import NeuralBackground from '../components/NeuralBackground';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const CreatorOnboarding: React.FC = () => {
  const { user: currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Start polling immediately if Stripe redirected back with a session_id
  const [verifying, setVerifying] = useState(() => !!searchParams.get('session_id'));

  const kycVerified = currentUser?.kycVerified ?? false;
  const creatorStatus = currentUser?.creatorStatus ?? 'none';

  // Poll KYC status after returning from Stripe Identity modal
  useEffect(() => {
    if (!verifying) return;
    let attempts = 0;
    const maxAttempts = 30; // poll up to ~60s

    const poll = async () => {
      if (attempts >= maxAttempts) {
        // Timed out — mark as pending so the user sees "under review"
        updateUser({ creatorStatus: 'pending' } as any);
        setVerifying(false);
        return;
      }
      try {
        const status = await API.getKycStatus();
        if (status.kycVerified) {
          updateUser({ kycVerified: true, creatorStatus: 'approved' } as any);
          setVerifying(false);
          return;
        }
        if (status.creatorStatus === 'rejected') {
          updateUser({ creatorStatus: 'rejected' } as any);
          setVerifying(false);
          return;
        }
      } catch {
        // ignore polling errors
      }
      attempts++;
      setTimeout(poll, 2000);
    };

    poll();
  }, [verifying]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartKYC = async () => {
    if (!stripePromise) {
      setError('Stripe is not configured. Please contact support.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { clientSecret } = await API.createKycSession();
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { error: stripeError } = await stripe.verifyIdentity(clientSecret);
      if (stripeError) {
        if (stripeError.code !== 'session_cancelled') {
          setError(stripeError.message || 'Verification failed. Please try again.');
        }
      } else {
        // Stripe modal closed successfully — mark pending in DB, then poll
        try { await API.submitKycSession(); } catch { /* ignore */ }
        updateUser({ creatorStatus: 'pending' } as any);
        setVerifying(true);
      }
    } catch (err: any) {
      // If Stripe Identity isn't available, fall back to manual review queue
      try {
        await API.markKycPending();
        updateUser({ creatorStatus: 'pending' } as any);
      } catch { /* ignore */ }
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (kycVerified || creatorStatus === 'approved') {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <NeuralBackground parallax={false} />
        <div className="relative z-10 max-w-xl w-full bg-brand-grey/80 border border-white/10 rounded-[3rem] p-12 text-center backdrop-blur-3xl animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green mx-auto mb-8">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">Identity Verified</h1>
          <p className="text-gray-400 mb-10 leading-relaxed font-medium">
            Your identity has been verified. You now have full access to create listings and offer services.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="w-full py-5 bg-brand-green text-brand-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-green/10"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (creatorStatus === 'pending' || verifying) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <NeuralBackground parallax={false} />
        <div className="relative z-10 max-w-xl w-full bg-brand-grey/80 border border-white/10 rounded-[3rem] p-12 text-center backdrop-blur-3xl animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green mx-auto mb-8 animate-pulse">
            <Clock size={40} />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">Verification Under Review</h1>
          <p className="text-gray-400 mb-10 leading-relaxed font-medium">
            Your documents have been submitted and are being reviewed by Stripe. This typically takes a few minutes but can take up to 24 hours.
            {verifying && ' Checking for updates...'}
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="w-full py-5 bg-brand-green text-brand-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-green/10"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (creatorStatus === 'rejected') {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <NeuralBackground parallax={false} />
        <div className="relative z-10 max-w-xl w-full bg-brand-grey/80 border border-white/10 rounded-[3rem] p-12 text-center backdrop-blur-3xl animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-400 mx-auto mb-8">
            <XCircle size={40} />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">Verification Failed</h1>
          <p className="text-gray-400 mb-10 leading-relaxed font-medium">
            We were unable to verify your identity. Please ensure your document is valid and the images are clear, then try again.
          </p>
          <button
            onClick={handleStartKYC}
            disabled={isLoading || !stripePromise}
            className="w-full py-5 bg-brand-pink text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-pink/10 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <>Try Again <ArrowRight size={20} /></>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-32 pb-24 px-4 overflow-hidden">
      <NeuralBackground parallax={true} />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-brand-pink/10 border border-brand-pink/20 rounded-full px-5 py-2 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink">
            <ShieldCheck size={14} />
            <span>Identity Verification</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            Verify Your <span className="text-brand-green">Identity.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium leading-relaxed">
            To keep Cenner safe for everyone, all users must complete identity verification. The process takes under 2 minutes.
          </p>
        </div>

        <div className="bg-brand-grey/60 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl mb-8">
          <div className="space-y-6">
            {[
              { icon: UserCheck, title: 'Government ID', desc: 'Passport, national ID card, or driving licence' },
              { icon: ShieldCheck, title: 'Selfie Check', desc: 'Quick photo to match your face to your document' },
              { icon: CheckCircle2, title: 'Instant Result', desc: 'Most verifications complete in under 2 minutes' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-5">
                <div className="p-3 bg-brand-green/10 rounded-2xl text-brand-green shrink-0">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">{title}</h3>
                  <p className="text-gray-400 text-sm font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!stripePromise && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center gap-3 text-yellow-400 text-sm">
            <AlertTriangle size={18} />
            <span>Stripe is not configured. Set <code>VITE_STRIPE_PUBLISHABLE_KEY</code> in your environment.</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
            <AlertTriangle size={18} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <button
          onClick={handleStartKYC}
          disabled={isLoading || !stripePromise}
          className="w-full py-5 bg-brand-green text-brand-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-green/10 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
        >
          {isLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <>
              <ShieldCheck size={24} />
              Start Identity Verification
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-6">
          Powered by Stripe Identity · Your data is encrypted and secure
        </p>
      </div>
    </div>
  );
};

export default CreatorOnboarding;
