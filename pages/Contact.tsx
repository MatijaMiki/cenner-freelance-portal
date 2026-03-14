
import React, { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Mail, Phone, MessageSquare, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { API } from '../lib/api';

// Extend window for grecaptcha
declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState(false);
  const recaptchaContainer = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  // Render reCAPTCHA widget once script is loaded
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY || !recaptchaContainer.current) return;

    const render = () => {
      if (!recaptchaContainer.current || widgetIdRef.current !== null) return;
      widgetIdRef.current = window.grecaptcha.render(recaptchaContainer.current, {
        sitekey: RECAPTCHA_SITE_KEY,
        theme: 'dark',
        callback: (token: string) => { setRecaptchaToken(token); setRecaptchaError(false); },
        'expired-callback': () => setRecaptchaToken(null),
        'error-callback': () => setRecaptchaToken(null),
      });
    };

    if (window.grecaptcha?.render) {
      render();
    } else {
      window.onRecaptchaLoad = render;
    }
  }, []);

  const resetRecaptcha = () => {
    if (widgetIdRef.current !== null && window.grecaptcha?.reset) {
      window.grecaptcha.reset(widgetIdRef.current);
    }
    setRecaptchaToken(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setRecaptchaError(true);
      return;
    }
    setRecaptchaError(false);
    setLoading(true);
    setError('');
    try {
      await API.contact({ name, email, subject, message });
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
      resetRecaptcha();
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.');
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 pb-24 max-w-7xl mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Get in Touch</h1>
        <p className="text-gray-500 text-lg">Have questions? We're here to help you navigate the Cenner ecosystem.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 bg-brand-grey/30 border border-white/5 rounded-3xl space-y-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-brand-green/10 rounded-2xl text-brand-green">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Email Us</h4>
                <p className="text-gray-500 text-sm">support@cenner.io</p>
                <p className="text-gray-500 text-sm">partners@cenner.io</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-brand-pink/10 rounded-2xl text-brand-pink">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Headquarters</h4>
                <p className="text-gray-500 text-sm">123 Innovation Drive</p>
                <p className="text-gray-500 text-sm">Tech District, SF 94103</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-2xl text-white">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Call Support</h4>
                <p className="text-gray-500 text-sm">+1 (555) 000-CENNER</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-br from-brand-green/10 to-transparent border border-brand-green/10 rounded-3xl">
            <div className="flex items-center space-x-3 text-brand-green mb-4">
              <MessageSquare size={20} />
              <span className="font-bold">Live Chat Available</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our support team is online 24/7 to assist with payment issues or dispute resolution.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12 space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Your Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Email Address</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Subject</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green transition-colors"
              >
                <option>General Inquiry</option>
                <option>Support Request</option>
                <option>Billing Question</option>
                <option>Become a Partner</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Message</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="How can we help you today?"
                className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green transition-colors resize-none"
              ></textarea>
            </div>

            {/* Google reCAPTCHA v2 */}
            {RECAPTCHA_SITE_KEY ? (
              <div className="space-y-2">
                <div
                  ref={recaptchaContainer}
                  className="rounded-xl overflow-hidden"
                />
                {recaptchaError && (
                  <p className="text-red-400 text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle size={12} /> Please complete the reCAPTCHA verification.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-xs">
                <ShieldCheck size={16} className="shrink-0" />
                <span>Add <code className="font-mono bg-yellow-500/10 px-1 rounded">VITE_RECAPTCHA_SITE_KEY</code> to your <code className="font-mono bg-yellow-500/10 px-1 rounded">.env.local</code> to enable reCAPTCHA. Get a key at <strong>google.com/recaptcha</strong> (choose reCAPTCHA v2 "I'm not a robot").</span>
              </div>
            )}

            <button
              disabled={loading || submitted || (!!RECAPTCHA_SITE_KEY && !recaptchaToken)}
              type="submit"
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                submitted ? 'bg-brand-green text-brand-black' : 'bg-brand-pink text-white hover:bg-opacity-90'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {submitted ? (
                <>
                  <CheckCircle size={20} />
                  <span>Message Sent Successfully</span>
                </>
              ) : loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
