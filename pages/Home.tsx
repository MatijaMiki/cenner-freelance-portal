
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Star, Shield, Zap, Globe, ChevronRight, 
  Layers, Users, Search, Code, Palette, 
  Terminal, BarChart3, Rocket, Activity, Server,
  ShieldCheck, Cpu, Briefcase, Globe2, Clock, CheckCircle, Lock
} from 'lucide-react';
import NeuralBackground from '../components/NeuralBackground';
import { MOCK_LISTINGS } from '../constants';

const Home: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      <NeuralBackground parallax={true} />

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-4 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-brand-black/90 border border-white/10 rounded-full px-4 py-1 mb-8 text-xs font-medium text-brand-green animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
            </span>
            <span>New: Gemini Live Voice-First Integration</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-8 tracking-tight leading-[0.9]">
            Elite Talent <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-green via-brand-pink to-brand-green bg-[length:200%_auto] animate-gradient">
              Neural Network
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-lg font-medium">
            The high-end freelance portal where projects meet precision. Connect with top 1% creators using modern AI-driven collaboration tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/marketplace"
              className="w-full sm:w-auto px-10 py-5 bg-brand-green text-brand-black font-black rounded-2xl flex items-center justify-center space-x-3 hover:scale-105 transition-all shadow-[0_0_40px_rgba(74,222,128,0.2)]"
            >
              <span>Explore Marketplace</span>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/services"
              className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 backdrop-blur-xl transition-all"
            >
              Cenner Services
            </Link>
          </div>
        </div>
      </section>

      {/* Ecosystem Vitals - Refined for clarity and business relevance */}
      <section className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { 
                label: "Avg. Response", 
                val: "< 2 Hours", 
                icon: <Clock size={16} />, 
                color: "text-brand-green", 
                desc: "Expert connection time" 
              },
              { 
                label: "Selection Rate", 
                val: "Top 1%", 
                icon: <Shield size={16} />, 
                color: "text-brand-pink", 
                desc: "Strict technical vetting" 
              },
              { 
                label: "Project Success", 
                val: "99.4%", 
                icon: <CheckCircle size={16} />, 
                color: "text-brand-green", 
                desc: "Milestone delivery record" 
              },
              { 
                label: "Capital Security", 
                val: "100%", 
                icon: <Lock size={16} />, 
                color: "text-brand-pink", 
                desc: "Encrypted escrow protection" 
              },
            ].map((stat, i) => (
              <div key={i} className="bg-brand-black/60 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between group hover:border-brand-green/30 hover:bg-brand-black/80 transition-all cursor-default">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">{stat.label}</span>
                  <div className={`opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <p className={`text-4xl font-black mb-1 ${stat.color} tracking-tighter`}>{stat.val}</p>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Specializations */}
      <section className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Top Specializations</h2>
              <p className="text-gray-400 font-medium">Browse our most sought-after categories indexed by our neural matching engine.</p>
            </div>
            <Link to="/marketplace" className="hidden md:flex items-center space-x-2 text-brand-green font-bold hover:translate-x-1 transition-transform">
              <span>View all categories</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Code />, name: "Development", color: "bg-blue-500/10 text-blue-400" },
              { icon: <Palette />, name: "Creative Design", color: "bg-brand-pink/10 text-brand-pink" },
              { icon: <Terminal />, name: "AI & ML", color: "bg-brand-green/10 text-brand-green" },
              { icon: <BarChart3 />, name: "Data Science", color: "bg-purple-500/10 text-purple-400" },
            ].map((spec, i) => (
              <Link key={i} to="/marketplace" className="group p-8 bg-brand-grey/95 border border-white/5 rounded-[2.5rem] hover:border-white/20 transition-all text-center">
                <div className={`w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center ${spec.color} group-hover:scale-110 transition-transform`}>
                  {spec.icon}
                </div>
                <h3 className="text-white font-bold text-lg">{spec.name}</h3>
                <p className="text-gray-500 text-xs mt-2 font-bold uppercase tracking-widest">1.2k+ Experts</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Global Network Visual */}
      <section className="relative py-32 z-10 overflow-hidden bg-brand-black/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
              <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
                A truly <span className="text-brand-pink">Global</span> <br /> Expert Network.
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed font-medium">
                Our specialists operate from 142 countries, providing a follow-the-sun workflow that ensures your project never sleeps. Every node in our network is verified for local compliance and global mastery.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <h4 className="text-3xl font-black text-white">142+</h4>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Countries Represented</p>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-brand-green">24/7</h4>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Collaboration</p>
                </div>
              </div>
            </div>
            <div className="flex-1 relative flex justify-center">
               <div className="aspect-square w-full max-w-sm bg-brand-green/5 rounded-full border border-brand-green/20 animate-pulse relative flex items-center justify-center">
                  <Globe size={180} className="text-brand-green opacity-20 animate-[spin_60s_linear_infinite]" />
                  <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-brand-pink rounded-full blur-[2px]"></div>
                  <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-brand-green rounded-full blur-[2px]"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative py-32 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative bg-gradient-to-br from-brand-grey to-brand-black border border-white/10 rounded-[4rem] p-12 md:p-24 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/10 rounded-full blur-[120px]"></div>
            
            <div className="relative z-10">
              <Rocket size={64} className="mx-auto mb-8 text-brand-green animate-bounce" />
              <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter">Ready to join the elite?</h2>
              <p className="text-gray-300 max-w-2xl mx-auto mb-12 text-xl leading-relaxed font-medium">
                Whether you're a visionary founder or a technical master, Cenner is the home for your most ambitious projects.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link to="/marketplace" className="px-12 py-5 bg-brand-green text-brand-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl">
                  Start a Project
                </Link>
                <Link to="/auth" className="px-12 py-5 bg-white/5 text-white border border-white/10 font-black rounded-2xl hover:bg-white/10 transition-all">
                  Join the Network
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
