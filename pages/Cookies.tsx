
import React from 'react';
import { Cookie, Settings, ShieldCheck, Info } from 'lucide-react';
import SEO from '../components/SEO';

const Cookies: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-24 pt-10 font-text md:px-8 md:pt-16">
      <SEO title="Cookie Policy" canonical="/cookies" description="Learn how Cenner uses cookies and similar technologies to improve your experience on our platform." />
      <div className="mb-14">
        <div className="mb-6 flex h-14 w-14 items-center justify-center border-2 border-ink bg-white text-ink">
          <Cookie size={32} />
        </div>
        <h1 className="mb-6 font-display text-[clamp(2.5rem,7vw,6rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.035em] text-ink">Cookie Policy</h1>
        <p className="text-slate text-[1.0625rem]">Detailed information about how we use cookies.</p>
      </div>

      <div className="max-w-[46rem] space-y-12 text-[1.0625rem] leading-[1.7] text-ink/90">
        <section>
          <h2 className="mb-5 border-t-2 border-ink pt-5 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">What are cookies?</h2>
          <p>
            Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="border-2 border-ink bg-white p-8">
            <h3 className="mb-3 font-display text-[1.25rem] font-extrabold text-ink">Essential Cookies</h3>
            <p className="text-[0.95rem]">These are required for the website to function. They allow you to log in, navigate pages, and use the marketplace escrow features securely.</p>
          </div>
          <div className="border-2 border-ink bg-white p-8">
            <h3 className="mb-3 font-display text-[1.25rem] font-extrabold text-ink">Analytical Cookies</h3>
            <p className="text-[0.95rem]">These help us understand how visitors interact with our portal by collecting and reporting information anonymously.</p>
          </div>
        </section>

        <section>
          <h2 className="mb-5 border-t-2 border-ink pt-5 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">How to manage cookies</h2>
          <p className="mb-4">
            Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit <a href="https://www.aboutcookies.org" className="text-sky underline underline-offset-4 hover:text-ink">www.aboutcookies.org</a>.
          </p>
          <div className="flex items-start gap-4 border-2 border-ink bg-brand-green p-6 text-ink">
            <Info className="text-ink shrink-0 mt-1" size={20} />
            <p className="text-[0.95rem]">Please note that if you disable essential cookies, some parts of the Cenner ecosystem (like the chat and checkout) may not work correctly.</p>
          </div>
        </section>

        <section className="border-t-2 border-ink pt-8">
          <p className="text-[0.9rem] italic text-slate">
            Last updated: October 2023.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Cookies;
