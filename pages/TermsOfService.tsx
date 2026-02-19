
import React from 'react';
import { FileText, Scale, AlertTriangle, CheckSquare } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="pt-20 pb-32 max-w-4xl mx-auto px-4">
      <div className="mb-16">
        <div className="w-16 h-16 bg-brand-pink/10 rounded-2xl flex items-center justify-center text-brand-pink mb-6">
          <Scale size={32} />
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400">Effective Date: October 12, 2023</p>
      </div>

      <div className="space-y-12 text-gray-600 dark:text-gray-400 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">1. Agreement to Terms</h2>
          <p>
            By accessing or using the Cenner platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service. These terms apply to all visitors, users, and others who access or use the Service.
          </p>
        </section>

        <section className="bg-white dark:bg-brand-grey/30 border border-gray-100 dark:border-white/5 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">2. User Accounts</h2>
          <p className="mb-4">
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
          <div className="flex items-start space-x-3 text-sm">
            <AlertTriangle className="text-yellow-500 shrink-0" size={18} />
            <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">3. Marketplace Transactions</h2>
          <p>
            Cenner provides a marketplace for freelancers to offer services. We act as an intermediary and facilitate payments through our secure escrow system. Funds are held until the client confirms receipt and satisfaction with the final delivery or until the dispute resolution process concludes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">4. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Cenner Platform Inc. and its licensors.
          </p>
        </section>

        <section className="border-t border-gray-200 dark:border-white/5 pt-12">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            For further clarification on our legal terms, contact legal@cenner.io.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
