
import React from 'react';
import { Target, Users, Rocket, Award, Shield, Cpu, Zap, Globe, Eye, Compass } from 'lucide-react';

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

      {/* Tech Stack / Innovation Section */}
      <section className="mb-40">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">The Technological Edge</h2>
          <p className="text-gray-500 text-lg">We've integrated a proprietary stack to ensure seamless collaboration at any scale.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <Cpu />, title: "Gemini Integration", desc: "Low-latency voice protocols powered by Google's most advanced LLMs for real-time translation and scope documentation." },
            { icon: <Shield />, title: "Escrow 2.0", desc: "Smart-contract based fund security. Payments are disbursed only upon multi-signature approval of milestones." },
            { icon: <Zap />, title: "Neural Indexing", desc: "Our search doesn't just match keywords. It maps the technical topology of your project to the freelancer's specific portfolio history." }
          ].map((item, i) => (
            <div key={i} className="p-10 bg-brand-grey/40 border border-white/5 rounded-[2.5rem] hover:bg-white/5 transition-colors group">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 text-brand-pink group-hover:scale-110 group-hover:bg-brand-pink/10 transition-all">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
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
