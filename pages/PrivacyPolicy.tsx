
import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="pt-20 pb-32 max-w-4xl mx-auto px-4">
      <div className="mb-16">
        <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mb-6">
          <Shield size={32} />
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400">Last updated: October 2023</p>
      </div>

      <div className="space-y-12 text-gray-600 dark:text-gray-400 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">1. Introduction</h2>
          <p>
            Welcome to Cenner. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section className="bg-white dark:bg-brand-grey/30 border border-gray-100 dark:border-white/5 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">2. The Data We Collect</h2>
          <ul className="space-y-4 list-disc pl-5">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
            <li><strong>Financial Data:</strong> includes payment card details (processed securely via our escrow partners).</li>
            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, login data, browser type and version.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">3. How We Use Your Data</h2>
          <p className="mb-4">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">4. Data Security</h2>
          <div className="flex items-start space-x-4">
            <Lock className="text-brand-pink mt-1 shrink-0" size={20} />
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
          </div>
        </section>

        <section className="border-t border-gray-200 dark:border-white/5 pt-12">
          <p className="text-sm text-gray-500 dark:text-gray-500 italic">
            Questions regarding this policy should be directed to privacy@cenner.io.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
