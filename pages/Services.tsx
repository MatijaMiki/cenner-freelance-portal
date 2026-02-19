
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, Palette, ShoppingCart, Cpu, ArrowRight, 
  CheckCircle, Sparkles, Zap, Layers, Globe
} from 'lucide-react';

const Services: React.FC = () => {
  const serviceCategories = [
    {
      id: 'web-design',
      title: 'High-End Web Design',
      description: 'Bespoke React & Next.js experiences. We build interfaces that breathe, move, and convert.',
      icon: <Code className="text-brand-green" size={40} />,
      features: ['Performance Tuning', 'SEO Architecture', 'Advanced Animations'],
      price: 'From €1,500',
      tag: 'Lead Tech',
      examples: [
        { name: 'Quantum Finance Dashboard', img: 'https://images.unsplash.com/photo-1551288049-bbda38a10ad5?auto=format&fit=crop&w=600&h=400' },
        { name: 'Nexus AI SaaS Landing', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&h=400' }
      ]
    },
    {
      id: 'graphic-design',
      title: 'Global Brand Identity',
      description: 'High-fidelity visual systems. Logos, brand guidelines, and cinematic marketing assets.',
      icon: <Palette className="text-brand-pink" size={40} />,
      features: ['Vector Precision', 'Brand Strategy', '4K Assets'],
      price: 'From €800',
      tag: 'Creative Elite',
      examples: [
        { name: 'Ether Logo System', img: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&h=400' },
        { name: 'Nova Cinematic Brandbook', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&h=400' }
      ]
    },
    {
      id: 'premade-websites',
      title: 'Premade Website Vault',
      description: 'Meticulously crafted templates. Buy a pre-built node, edit, and deploy in hours.',
      icon: <ShoppingCart className="text-brand-green" size={40} />,
      features: ['Clean Codebase', 'Easy CMS Integration', 'Instant Delivery'],
      price: 'From €250',
      tag: 'Turbo Start',
      examples: [
        { name: 'Aesthetic Portfolio V2', img: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=600&h=400' },
        { name: 'Minimalist E-comm Pro', img: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=600&h=400' }
      ]
    },
    {
      id: 'n8n-ai-agents',
      title: 'n8n Neural Agents',
      description: 'Automate your entire operation with AI. Custom n8n workflows that think and act.',
      icon: <Cpu className="text-brand-pink" size={40} />,
      features: ['GPT-4o Hooks', 'CRM Automation', 'Custom Tooling'],
      price: 'From €1,200',
      tag: 'Neural Core',
      examples: [
        { name: 'Sales Flow Automator', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&h=400' },
        { name: 'Support Bot Sync', img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd05a?auto=format&fit=crop&w=600&h=400' }
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-brand-black">
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-32">
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <div className="inline-flex items-center space-x-2 bg-brand-green/10 border border-brand-green/20 rounded-full px-5 py-2 mb-10 text-[10px] font-black uppercase tracking-[0.3em] text-brand-green">
            <Sparkles size={14} />
            <span>Direct Cenner Core Offerings</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-[0.85]">
            Engineered <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-green via-brand-pink to-brand-green">
              Precision.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed">
            Direct access to Cenner's in-house engineering and design core. No middlemen, just pure technical mastery.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-32">
          {serviceCategories.map((service) => (
            <div key={service.id} className="group bg-brand-grey/40 border border-white/5 rounded-[3rem] p-12 flex flex-col h-full hover:border-brand-green/40 transition-all shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-green/5 rounded-full blur-[100px] transition-all"></div>
              
              <div className="mb-10 flex items-center justify-between">
                <div className="w-24 h-24 bg-brand-black/80 rounded-[2rem] flex items-center justify-center shadow-inner border border-white/5 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-5 py-2 rounded-full border border-white/5">
                  {service.tag}
                </span>
              </div>

              <h2 className="text-4xl font-black text-white mb-6 tracking-tight group-hover:text-brand-green transition-colors">{service.title}</h2>
              <p className="text-gray-400 mb-10 text-lg leading-relaxed font-medium">{service.description}</p>
              
              {/* Examples Sub-Grid */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                {service.examples.map((ex, i) => (
                  <div key={i} className="relative group/ex rounded-2xl overflow-hidden border border-white/5 aspect-video">
                    <img src={ex.img} alt={ex.name} className="w-full h-full object-cover grayscale group-hover/ex:grayscale-0 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-0 group-hover/ex:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                      <p className="text-[9px] font-black text-brand-green uppercase tracking-widest">{ex.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-12 flex-grow">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-4 text-white font-bold">
                    <CheckCircle size={20} className="text-brand-green shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Cenner Base Price</p>
                  <p className="text-3xl font-black text-white">{service.price}</p>
                </div>
                <Link to="/contact" className="w-full sm:w-auto px-10 py-5 bg-brand-green text-brand-black font-black rounded-2xl flex items-center justify-center space-x-3 hover:scale-105 transition-all shadow-xl">
                  <span>Start Protocol</span>
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Process Roadmap */}
        <section className="py-24 mb-32 border-y border-white/5">
            <h3 className="text-4xl font-black text-white text-center mb-20 tracking-tighter">The Delivery Roadmap</h3>
            <div className="grid md:grid-cols-4 gap-12 relative">
                <div className="hidden md:block absolute top-10 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                {[
                    { step: '01', title: 'Neural Map', desc: 'Scope analysis and technical topology documentation.' },
                    { step: '02', title: 'Fidelity Build', desc: 'Rapid development in secure node environments.' },
                    { step: '03', title: 'Stress Sync', desc: 'QA, performance tuning, and cross-node testing.' },
                    { step: '04', title: 'Live Edge', desc: 'Global CDN deployment and protocol handover.' }
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
        <div className="mb-40 grid md:grid-cols-3 gap-12 p-16 bg-brand-black border border-white/10 rounded-[4rem] text-center shadow-2xl">
            {[
              { icon: <Zap className="text-brand-green" />, title: "Instant Sync", desc: "Our core team is 100% remote and synced across all time zones." },
              { icon: <Layers className="text-brand-pink" />, title: "Node Isolation", desc: "Every project is isolated in its own secure dev environment." },
              { icon: <Globe className="text-brand-green" />, title: "Global CDN", desc: "Deploy your finished assets to 200+ edge nodes instantly." }
            ].map((adv, i) => (
              <div key={i} className="space-y-4">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">{adv.icon}</div>
                <h4 className="text-2xl font-bold text-white">{adv.title}</h4>
                <p className="text-gray-500 text-sm">{adv.desc}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
