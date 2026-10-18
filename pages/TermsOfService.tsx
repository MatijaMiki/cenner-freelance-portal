
import React from 'react';
import { FileText, Scale, AlertTriangle, CheckSquare } from 'lucide-react';
import SEO from '../components/SEO';

const TermsOfService: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-24 pt-10 font-text md:px-8 md:pt-16">
      <SEO title="Terms of Service" canonical="/terms" description="Cenner's terms of service. Read the terms and conditions governing the use of our freelance talent marketplace." />
      <div className="mb-14">
        <div className="mb-6 flex h-14 w-14 items-center justify-center border-2 border-ink bg-white text-ink">
          <Scale size={32} />
        </div>
        <h1 className="mb-6 font-display text-[clamp(2.5rem,7vw,6rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.035em] text-ink">Terms of Service</h1>
        <p className="text-slate text-[1.0625rem]">Effective Date: October 12, 2023</p>
      </div>

      <div className="max-w-[46rem] space-y-12 text-[1.0625rem] leading-[1.7] text-ink/90">
        <section>
          <h2 className="mb-5 border-t-2 border-ink pt-5 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">1. Agreement to Terms</h2>
          <p>
            By accessing or using the Cenner platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service. These terms apply to all visitors, users, and others who access or use the Service.
          </p>
        </section>

        <section className="border-2 border-ink bg-white p-8">
          <h2 className="mb-5 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">2. User Accounts</h2>
          <p className="mb-4">
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
          <div className="flex items-start space-x-3 text-sm">
            <AlertTriangle className="text-ink shrink-0" size={18} />
            <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
          </div>
        </section>

        <section>
          <h2 className="mb-5 border-t-2 border-ink pt-5 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">3. Marketplace Transactions</h2>
          <p>
            Cenner provides a marketplace for freelancers to offer services. We act as an intermediary and facilitate payments through our secure escrow system. Funds are held until the client confirms receipt and satisfaction with the final delivery or until the dispute resolution process concludes.
          </p>
        </section>

        <section className="border-2 border-ink bg-white p-8">
          <h2 className="mb-5 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">4. Keeping Activity On-Platform</h2>
          <p className="mb-4">
            Cenner operates as an intermediary marketplace. The fees we charge fund the escrow, payment protection, and dispute resolution described above. To keep these protections available to everyone, you agree that while you are engaged with, or within twelve (12) months of first being introduced to, another user through Cenner, you will not:
          </p>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start space-x-3">
              <CheckSquare className="text-sky shrink-0 mt-0.5" size={18} />
              <span>Solicit, request, or arrange to move communication, negotiation, or payment for services off the platform, including requesting or sharing personal email addresses, phone numbers, or other off-platform contact details for that purpose.</span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckSquare className="text-sky shrink-0 mt-0.5" size={18} />
              <span>Pay for, invoice, or otherwise settle services outside of Cenner's payment system in order to avoid platform fees.</span>
            </li>
          </ul>
          <div className="flex items-start space-x-3 text-sm">
            <AlertTriangle className="text-ink shrink-0" size={18} />
            <p>Off-platform arrangements are not covered by Cenner's escrow, buyer or seller protection, or dispute resolution. Violations may result in suspension or permanent termination of your account.</p>
          </div>
        </section>

        <section>
          <h2 className="mb-5 border-t-2 border-ink pt-5 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">5. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Cenner, obrt za računalno programiranje i ostale usluge, vl. Matija Mikulinec (OIB 23152585818, Mikulinci 8, 10010 Zagreb), and its licensors.
          </p>
        </section>

        <section className="border-t-2 border-ink pt-8">
          <p className="text-[0.9rem] text-slate">
            For further clarification on our legal terms, contact info@cenner.hr.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
