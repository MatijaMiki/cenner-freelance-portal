
import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import SEO from '../components/SEO';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-24 pt-10 font-text md:px-8 md:pt-16">
      <SEO title="Privacy Policy" canonical="/privacy" description="Cenner's privacy policy. Learn how we collect, use, and protect your personal data on our freelance talent platform." />
      <div className="mb-14">
        <div className="mb-6 flex h-14 w-14 items-center justify-center border-2 border-ink bg-white text-ink">
          <Shield size={32} />
        </div>
        <h1 className="mb-6 font-display text-[clamp(2.5rem,7vw,6rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.035em] text-ink">Privacy Policy</h1>
        <p className="text-slate text-[1.0625rem]">Last updated: October 2023</p>
      </div>

      <div className="max-w-[46rem] space-y-12 text-[1.0625rem] leading-[1.7] text-ink/90">
        <section>
          <h2 className="mb-5 border-t-2 border-ink pt-5 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">1. Introduction</h2>
          <p>
            Welcome to Cenner. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section className="border-2 border-ink bg-white p-8">
          <h2 className="mb-5 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">2. The Data We Collect</h2>
          <ul className="space-y-4 list-disc pl-5">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
            <li><strong>Financial Data:</strong> includes payment card details (processed securely via our escrow partners).</li>
            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, login data, browser type and version.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-5 border-t-2 border-ink pt-5 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">3. How We Use Your Data</h2>
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
          <h2 className="mb-5 border-t-2 border-ink pt-5 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">4. Data Security</h2>
          <div className="flex items-start space-x-4">
            <Lock className="text-sky mt-1 shrink-0" size={20} />
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
          </div>
        </section>

        <section className="border-t-2 border-ink pt-8">
          <p className="text-[0.9rem] italic text-slate">
            Questions regarding this policy should be directed to info@cenner.hr. The data controller is Cenner, obrt za računalno programiranje i ostale usluge, vl. Matija Mikulinec, Mikulinci 8, 10010 Zagreb (OIB 23152585818).
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
