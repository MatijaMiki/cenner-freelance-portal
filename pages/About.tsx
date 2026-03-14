
import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, ArrowRight, Code2, Code, Atom, Zap, Globe, Workflow, Server, Palette, Brain, GraduationCap } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="pt-16 pb-24 max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <div className="max-w-4xl mb-32">
        <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-[1.1]">
          The High-Fidelity <br />
          <span className="text-brand-pink">Freelance Standard.</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-3xl">
          Cenner was founded on a singular premise: talent is abundant, but truly elite infrastructure is rare. We've built the world's most sophisticated gateway for creators who operate at the bleeding edge of their craft.
        </p>
      </div>

      {/* Philosophy Section */}
      <div className="grid lg:grid-cols-2 gap-24 mb-40 items-center">
        <div className="relative">
          <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
            <img src="https://picsum.photos/seed/vision/1200/1600" alt="Visionary Thinking" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-10 -right-10 bg-brand-green text-brand-black p-8 rounded-3xl font-black text-2xl rotate-3 shadow-xl">
            BUILT BY <br /> PROS
          </div>
        </div>
        <div className="space-y-10">
          <div className="inline-block px-4 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-black uppercase tracking-widest">Our Philosophy</div>
          <h2 className="text-5xl font-bold text-white tracking-tight">Quality is not a luxury. It's the baseline.</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            In a world of commoditized labor, Cenner stands apart as a sanctuary for craftsmanship. We believe that the best work happens when the friction of bureaucracy is removed, allowing visionaries to communicate directly with masters.
          </p>
          <p className="text-gray-400 text-lg leading-relaxed">
            Our neural-matched ecosystem ensures that you're not just finding a 'contractor', but a technical partner who understands the nuance of your specific industry—from algorithmic trading interfaces to generative cinematic environments.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-6">
            <div>
              <h4 className="text-white font-bold text-xl mb-2">Vetted for Mastery</h4>
              <p className="text-gray-500 text-sm">Every pro on Cenner passes a rigorous 4-stage technical and soft-skill assessment.</p>
            </div>
            <div>
              <h4 className="text-white font-bold text-xl mb-2">Human-Centric Tech</h4>
              <p className="text-gray-500 text-sm">We use AI to facilitate connection, not to replace the human creative spark.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <section className="mb-40 grid md:grid-cols-2 gap-8">
        <div className="p-12 bg-brand-grey/40 border border-white/5 rounded-[3.5rem] relative overflow-hidden group hover:border-brand-green/30 transition-all shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-brand-green/10 transition-all"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mb-8 shadow-inner">
              <Target size={32} />
            </div>
            <h3 className="text-3xl font-black text-white mb-6 tracking-tight uppercase">Our Mission</h3>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              To dismantle the barriers between global elite talent and visionary projects. We aim to provide a frictionless, high-fidelity environment where technical excellence is the only currency that matters.
            </p>
          </div>
        </div>

        <div className="p-12 bg-brand-grey/40 border border-white/5 rounded-[3.5rem] relative overflow-hidden group hover:border-brand-pink/30 transition-all shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-brand-pink/10 transition-all"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-brand-pink/10 rounded-2xl flex items-center justify-center text-brand-pink mb-8 shadow-inner">
              <Eye size={32} />
            </div>
            <h3 className="text-3xl font-black text-white mb-6 tracking-tight uppercase">Our Vision</h3>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              To become the neural backbone of the global digital economy. We envision a world where the most complex problems are solved by globally distributed nodes of expertise, perfectly synchronized through the Cenner Protocol.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="technology" className="mb-40 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 bg-brand-green/10 border border-brand-green/20 rounded-full px-5 py-2 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-brand-green">
            <Zap size={12} />
            <span>Our Stack</span>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Technology We Work With</h2>
          <p className="text-gray-500 text-lg">Every tool selected for reliability, speed, and real-world results.</p>
        </div>

        {/* Category: Web Development */}
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-5 pl-1">Web Development</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: <Code2 size={22} />, name: 'HTML', desc: 'Semantic, accessible markup', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/10' },
              { icon: <Palette size={22} />, name: 'CSS', desc: 'Custom styling & animations', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/10' },
              { icon: <Code size={22} />, name: 'JavaScript', desc: 'Dynamic web interactions', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/10' },
              { icon: <Atom size={22} />, name: 'React', desc: 'Component-driven UIs', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/10' },
              { icon: <Zap size={22} />, name: 'Vite', desc: 'Lightning-fast dev builds', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/10' },
            ].map((t) => (
              <div key={t.name} className={`group p-6 bg-brand-grey/40 border ${t.border} rounded-3xl hover:bg-white/5 transition-all duration-300 flex flex-col gap-3`}>
                <div className={`w-11 h-11 ${t.bg} rounded-2xl flex items-center justify-center ${t.color} group-hover:scale-110 transition-transform`}>
                  {t.icon}
                </div>
                <div>
                  <p className="text-sm font-black text-white">{t.name}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category: CMS & Platforms */}
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-5 pl-1">CMS & Platforms</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: <Globe size={22} />, name: 'WordPress', desc: 'Custom themes, plugins & shops', color: 'text-blue-300', bg: 'bg-blue-400/10', border: 'border-blue-400/10' },
              { icon: <Workflow size={22} />, name: 'n8n', desc: 'Workflow & process automation', color: 'text-brand-green', bg: 'bg-brand-green/10', border: 'border-brand-green/10' },
              { icon: <Brain size={22} />, name: 'AI Integration', desc: 'LLMs embedded into products', color: 'text-brand-pink', bg: 'bg-brand-pink/10', border: 'border-brand-pink/10' },
              { icon: <GraduationCap size={22} />, name: 'AI & WP Training', desc: 'Teaching teams to use AI tools & WordPress', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/10' },
            ].map((t) => (
              <div key={t.name} className={`group p-6 bg-brand-grey/40 border ${t.border} rounded-3xl hover:bg-white/5 transition-all duration-300 flex flex-col gap-3`}>
                <div className={`w-11 h-11 ${t.bg} rounded-2xl flex items-center justify-center ${t.color} group-hover:scale-110 transition-transform`}>
                  {t.icon}
                </div>
                <div>
                  <p className="text-sm font-black text-white">{t.name}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category: Infrastructure & Design */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-5 pl-1">Infrastructure & Design</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: <Server size={22} />, name: 'Server Setup', desc: 'VPS configuration, DNS, SSL, nginx', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/10' },
              { icon: <Server size={22} />, name: 'Website Deployment', desc: 'End-to-end hosting & go-live', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/10' },
              { icon: <Palette size={22} />, name: 'Affinity Design', desc: 'Brand identity, graphics & print', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/10' },
            ].map((t) => (
              <div key={t.name} className={`group p-6 bg-brand-grey/40 border ${t.border} rounded-3xl hover:bg-white/5 transition-all duration-300 flex flex-col gap-3`}>
                <div className={`w-11 h-11 ${t.bg} rounded-2xl flex items-center justify-center ${t.color} group-hover:scale-110 transition-transform`}>
                  {t.icon}
                </div>
                <div>
                  <p className="text-sm font-black text-white">{t.name}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Previous Projects teaser */}
      <section id="projects" className="mb-40 scroll-mt-24">
        <div className="bg-gradient-to-br from-brand-grey/60 to-brand-black border border-white/5 rounded-[3rem] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink mb-3">Delivered Work</p>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-3">Previous Projects</h2>
            <p className="text-gray-500 max-w-lg">Real client work delivered through the Cenner network — see the live sites and what was built.</p>
          </div>
          <Link
            to="/projects"
            className="shrink-0 flex items-center gap-3 px-8 py-4 bg-brand-green text-brand-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-green/10 text-sm uppercase tracking-widest"
          >
            View Projects <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-gradient-to-br from-brand-grey to-brand-black border border-white/10 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-pink/10 rounded-full blur-[120px]"></div>
        <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter">Ready to join the elite?</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-16 text-xl leading-relaxed">
          Whether you're a visionary founder or a technical master, Cenner is the home for your most ambitious projects.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button className="px-12 py-5 bg-brand-green text-brand-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl">
            Start a Project
          </button>
          <button className="px-12 py-5 bg-white/5 text-white border border-white/10 font-black rounded-2xl hover:bg-white/10 transition-all">
            Join the Network
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;
