
import React, { useState } from 'react';
// Fixed missing 'CheckCircle' import
import { Send, MapPin, Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
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
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Your Name</label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Subject</label>
              <select className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green transition-colors">
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
                placeholder="How can we help you today?"
                className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green transition-colors resize-none"
              ></textarea>
            </div>

            <button
              disabled={submitted}
              type="submit"
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                submitted ? 'bg-brand-green text-brand-black' : 'bg-brand-pink text-white hover:bg-opacity-90'
              }`}
            >
              {submitted ? (
                <>
                  <CheckCircle size={20} />
                  <span>Message Sent Successfully</span>
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
