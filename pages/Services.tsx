
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  Code, Palette, Globe, Cpu, ArrowRight,
  CheckCircle, Sparkles, Zap, Layers, Server
} from 'lucide-react';

type Feature = { name: string; detail: string };

type Service = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: Feature[];
  price: string;
  tag: string;
  accent: 'green' | 'pink';
};

const serviceCategories: Service[] = [
  {
    id: 'web-development',
    title: 'Web Development',
    description: 'Custom websites and web apps built with React, Vite, and modern HTML/CSS/JS. Fast, clean, and built to last.',
    icon: <Code className="text-brand-green" size={40} />,
    price: 'From €800',
    tag: 'Development',
    accent: 'green',
    features: [
      {
        name: 'React & Vite',
        detail: 'Component-driven frontends using React and Vite for near-instant load times and a smooth developer workflow you can hand off easily.',
      },
      {
        name: 'HTML / CSS / JavaScript',
        detail: 'Semantic, accessible markup paired with hand-crafted CSS and vanilla JS — no unnecessary dependencies, just clean code that works everywhere.',
      },
      {
        name: 'Responsive & Mobile-First',
        detail: 'Every build looks and performs perfectly on phones, tablets, and desktops. Tested across real devices before delivery.',
      },
      {
        name: 'Performance Optimised',
        detail: 'Compressed assets, lazy loading, and proper caching strategies so your site scores green on Core Web Vitals out of the box.',
      },
    ],
  },
  {
    id: 'wordpress',
    title: 'WordPress',
    description: 'Custom themes, plugins, and full WooCommerce shops. We build WordPress sites that are easy for you to manage yourself.',
    icon: <Globe className="text-brand-pink" size={40} />,
    price: 'From €500',
    tag: 'CMS',
    accent: 'pink',
    features: [
      {
        name: 'Custom Themes',
        detail: 'Fully bespoke themes built from scratch or on top of a starter — no bloated page builders, just clean PHP and modern CSS.',
      },
      {
        name: 'Plugin Development',
        detail: 'Custom plugins for any functionality your site needs — booking systems, custom post types, API integrations, payment logic.',
      },
      {
        name: 'WooCommerce Shops',
        detail: 'Complete e-commerce setups including product pages, cart, checkout, payment gateways, and shipping rules — ready to sell from day one.',
      },
      {
        name: 'Training Included',
        detail: 'We walk you through managing your own content, adding products, and updating pages so you never depend on a developer for day-to-day changes.',
      },
    ],
  },
  {
    id: 'ai-automation',
    title: 'AI & Automation',
    description: 'n8n workflows, AI integrations, and hands-on training. We automate the repetitive parts of your business and teach your team to do the same.',
    icon: <Cpu className="text-brand-green" size={40} />,
    price: 'From €600',
    tag: 'Automation',
    accent: 'green',
    features: [
      {
        name: 'n8n Workflow Builds',
        detail: 'We design and deploy n8n automations that connect your tools — CRMs, email, forms, spreadsheets, APIs — and eliminate manual busywork.',
      },
      {
        name: 'AI Integration',
        detail: 'Embed language models and AI tools directly into your website, product, or internal tools to handle queries, generate content, or assist your team.',
      },
      {
        name: 'Teaching AI & WordPress',
        detail: 'One-to-one or group training sessions where we teach your team how to get the most out of AI tools and manage WordPress independently.',
      },
      {
        name: 'Process Documentation',
        detail: 'Every automation we build comes with clear documentation so your team understands what runs, when it runs, and how to modify it if needed.',
      },
    ],
  },
  {
    id: 'graphic-design',
    title: 'Graphic Design',
    description: 'Brand identities, logos, and marketing assets crafted in Affinity. Visual work that makes your business look as good as it performs.',
    icon: <Palette className="text-brand-pink" size={40} />,
    price: 'From €300',
    tag: 'Design',
    accent: 'pink',
    features: [
      {
        name: 'Logo & Brand Identity',
        detail: 'A complete visual identity including primary logo, colour palette, and typography — delivered in all formats you need for print and digital.',
      },
      {
        name: 'Marketing Assets',
        detail: 'Social media graphics, banners, flyers, business cards, and any other collateral your brand needs to show up consistently everywhere.',
      },
      {
        name: 'Affinity Suite',
        detail: 'All work is created in Affinity Designer, Publisher, and Photo — professional-grade vector and raster output with no Adobe subscription required.',
      },
      {
        name: 'Print-Ready Delivery',
        detail: 'Files delivered in the correct colour profiles, bleed settings, and resolutions for both screen and professional print production.',
      },
    ],
  },
];

const Services: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-brand-black">
      <SEO
        title="Services"
        canonical="/services"
        description="Explore Cenner's premium freelance services — web development, design, AI, marketing, video production and more from elite verified creators."
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-32">

        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <div className="inline-flex items-center space-x-2 bg-brand-green/10 border border-brand-green/20 rounded-full px-5 py-2 mb-10 text-[10px] font-black uppercase tracking-[0.3em] text-brand-green">
            <Sparkles size={14} />
            <span>Cenner Core Services</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-[0.85]">
            Built by <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-green via-brand-pink to-brand-green">
              Cenner.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed">
            Everything we offer is done in-house — no outsourcing, no middlemen. You work directly with the people building your project.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-32">
          {serviceCategories.map((service) => (
            <div
              key={service.id}
              className={`group bg-brand-grey/40 border border-white/5 rounded-[3rem] p-12 flex flex-col hover:border-${service.accent === 'green' ? 'brand-green' : 'brand-pink'}/30 transition-all shadow-2xl relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-48 h-48 ${service.accent === 'green' ? 'bg-brand-green/5' : 'bg-brand-pink/5'} rounded-full blur-[100px] pointer-events-none`} />

              {/* Card header */}
              <div className="mb-10 flex items-center justify-between relative">
                <div className="w-20 h-20 bg-brand-black/80 rounded-[2rem] flex items-center justify-center shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-5 py-2 rounded-full border border-white/5">
                  {service.tag}
                </span>
              </div>

              <h2 className={`text-4xl font-black text-white mb-4 tracking-tight group-hover:text-${service.accent === 'green' ? 'brand-green' : 'brand-pink'} transition-colors`}>
                {service.title}
              </h2>
              <p className="text-gray-400 mb-10 text-base leading-relaxed">
                {service.description}
              </p>

              {/* Features with detail */}
              <div className="space-y-6 mb-12 flex-grow relative">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <CheckCircle
                      size={18}
                      className={`mt-0.5 shrink-0 ${service.accent === 'green' ? 'text-brand-green' : 'text-brand-pink'}`}
                    />
                    <div>
                      <p className="text-sm font-bold text-white leading-snug">{feature.name}</p>
                      <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">{feature.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Starting from</p>
                  <p className="text-3xl font-black text-white">{service.price}</p>
                </div>
                <Link
                  to="/contact"
                  className={`w-full sm:w-auto px-10 py-4 ${service.accent === 'green' ? 'bg-brand-green text-brand-black shadow-brand-green/20' : 'bg-brand-pink text-white shadow-brand-pink/20'} font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl`}
                >
                  Get a Quote
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Process Roadmap */}
        <section className="py-24 mb-32 border-y border-white/5">
          <h3 className="text-4xl font-black text-white text-center mb-20 tracking-tighter">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-12 relative">
            <div className="hidden md:block absolute top-10 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            {[
              { step: '01', title: 'Discovery Call', desc: 'We talk through what you need, your timeline, and your budget. No obligation.' },
              { step: '02', title: 'Proposal & Quote', desc: 'We send a clear scope, timeline, and fixed price — no hidden extras.' },
              { step: '03', title: 'Build & Review', desc: 'We build in stages and share progress. You give feedback until it is right.' },
              { step: '04', title: 'Delivery & Support', desc: 'We hand everything over clean and stay available for questions after launch.' },
            ].map((item, i) => (
              <div key={i} className="relative z-10 text-center group">
                <div className="w-20 h-20 bg-brand-grey border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:border-brand-pink transition-colors">
                  <span className="text-2xl font-black text-white">{item.step}</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Advantage Banner */}
        <div className="grid md:grid-cols-3 gap-12 p-16 bg-brand-black border border-white/10 rounded-[4rem] text-center shadow-2xl">
          {[
            { icon: <Zap className="text-brand-green" />, title: 'Direct Communication', desc: 'You talk to the people actually doing the work — not account managers or project coordinators.' },
            { icon: <Layers className="text-brand-pink" />, title: 'Fixed Pricing', desc: 'Every project is quoted upfront. No hourly billing surprises, no scope creep without agreement.' },
            { icon: <Server className="text-brand-green" />, title: 'We Handle Hosting Too', desc: 'Need a server set up or a site deployed? We do that as part of the service, not as an extra.' },
          ].map((adv, i) => (
            <div key={i} className="space-y-4">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">{adv.icon}</div>
              <h4 className="text-2xl font-bold text-white">{adv.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{adv.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Services;
