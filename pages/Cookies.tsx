
import React from 'react';
import { Cookie, Settings, ShieldCheck, Info } from 'lucide-react';

const Cookies: React.FC = () => {
  return (
    <div className="pt-20 pb-32 max-w-4xl mx-auto px-4">
      <div className="mb-16">
        <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mb-6">
          <Cookie size={32} />
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">Cookie Policy</h1>
        <p className="text-gray-500 dark:text-gray-400">Detailed information about how we use cookies.</p>
      </div>

      <div className="space-y-12 text-gray-600 dark:text-gray-400 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What are cookies?</h2>
          <p>
            Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="p-8 bg-white dark:bg-brand-grey/30 border border-gray-100 dark:border-white/5 rounded-3xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Essential Cookies</h3>
            <p className="text-sm">These are required for the website to function. They allow you to log in, navigate pages, and use the marketplace escrow features securely.</p>
          </div>
          <div className="p-8 bg-white dark:bg-brand-grey/30 border border-gray-100 dark:border-white/5 rounded-3xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Analytical Cookies</h3>
            <p className="text-sm">These help us understand how visitors interact with our portal by collecting and reporting information anonymously.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How to manage cookies</h2>
          <p className="mb-4">
            Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit <a href="https://www.aboutcookies.org" className="text-brand-pink hover:underline">www.aboutcookies.org</a>.
          </p>
          <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-6 flex items-start space-x-4">
            <Info className="text-brand-green shrink-0 mt-1" size={20} />
            <p className="text-sm">Please note that if you disable essential cookies, some parts of the Cenner ecosystem (like the chat and checkout) may not work correctly.</p>
          </div>
        </section>

        <section className="border-t border-gray-200 dark:border-white/5 pt-12">
          <p className="text-sm text-gray-500 dark:text-gray-500 italic">
            Last updated: October 2023.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Cookies;
