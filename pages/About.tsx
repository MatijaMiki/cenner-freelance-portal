
import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, ArrowRight, Zap } from 'lucide-react';
import SEO from '../components/SEO';

const About: React.FC = () => {
  return (
    <div className="pt-16 pb-24 max-w-7xl mx-auto px-4">
      <SEO
        title="About"
        canonical="/about"
        description="Learn about Cenner's mission to connect the world's best freelance talent with ambitious businesses through AI-powered matching and verified creator profiles."
      />
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

      {/* Technology teaser */}
      <section className="mb-40">
        <div className="bg-gradient-to-br from-brand-grey/60 to-brand-black border border-white/5 rounded-[3rem] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-green mb-3">Our Stack</p>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-3">Technology We Work With</h2>
            <p className="text-gray-500 max-w-lg">From React and n8n to server setup and Affinity Design — see every tool we bring to the table.</p>
          </div>
          <Link
            to="/technology"
            className="shrink-0 flex items-center gap-3 px-8 py-4 bg-brand-green text-brand-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-green/10 text-sm uppercase tracking-widest"
          >
            View Stack <Zap size={16} />
          </Link>
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
