
import React from 'react';
import { Code2, Code, Atom, Zap, Globe, Workflow, Server, Palette, Brain, GraduationCap, Cpu } from 'lucide-react';
import NeuralBackground from '../components/NeuralBackground';
import SEO from '../components/SEO';

type Tech = {
  icon: React.ReactNode;
  name: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
};

const CATEGORIES: { label: string; techs: Tech[] }[] = [
  {
    label: 'Web Development',
    techs: [
      { icon: <Code2 size={24} />, name: 'HTML', desc: 'Semantic, accessible markup', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/15' },
      { icon: <Palette size={24} />, name: 'CSS', desc: 'Custom styling & animations', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/15' },
      { icon: <Code size={24} />, name: 'JavaScript', desc: 'Dynamic web interactions', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/15' },
      { icon: <Atom size={24} />, name: 'React', desc: 'Component-driven UIs', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/15' },
      { icon: <Zap size={24} />, name: 'Vite', desc: 'Lightning-fast dev builds', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/15' },
    ],
  },
  {
    label: 'CMS & Platforms',
    techs: [
      { icon: <Globe size={24} />, name: 'WordPress', desc: 'Custom themes, plugins & shops', color: 'text-blue-300', bg: 'bg-blue-400/10', border: 'border-blue-400/15' },
      { icon: <Workflow size={24} />, name: 'n8n', desc: 'Workflow & process automation', color: 'text-brand-green', bg: 'bg-brand-green/10', border: 'border-brand-green/20' },
      { icon: <Brain size={24} />, name: 'AI Integration', desc: 'LLMs embedded into products', color: 'text-brand-pink', bg: 'bg-brand-pink/10', border: 'border-brand-pink/20' },
      { icon: <GraduationCap size={24} />, name: 'AI & WP Training', desc: 'Teaching teams to use AI tools & WordPress', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/15' },
    ],
  },
  {
    label: 'Infrastructure & Design',
    techs: [
      { icon: <Server size={24} />, name: 'Server Setup', desc: 'VPS configuration, DNS, SSL, nginx', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/15' },
      { icon: <Cpu size={24} />, name: 'Website Deployment', desc: 'End-to-end hosting & go-live', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/15' },
      { icon: <Palette size={24} />, name: 'Affinity Design', desc: 'Brand identity, graphics & print', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/15' },
    ],
  },
];

const Technology: React.FC = () => {
  return (
    <div className="relative min-h-screen pt-16 pb-24 overflow-hidden">
      <SEO
        title="Technology"
        canonical="/technology"
        description="Discover the technology stack powering Cenner — AI matching, real-time collaboration, and secure infrastructure built for elite freelance work."
      />
      <NeuralBackground parallax={false} />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center space-x-2 bg-brand-green/10 border border-brand-green/20 rounded-full px-5 py-2 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-brand-green">
            <Zap size={12} />
            <span>Our Stack</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            Technology We Work With
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Every tool selected for reliability, speed, and real-world results.
          </p>
        </div>

        {/* Category Blocks */}
        <div className="space-y-16">
          {CATEGORIES.map((cat) => (
            <div key={cat.label}>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6 pl-1">
                {cat.label}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {cat.techs.map((t) => (
                  <div
                    key={t.name}
                    className={`group p-7 bg-brand-grey/80 backdrop-blur-sm border ${t.border} rounded-3xl hover:bg-white/10 transition-all duration-300 flex flex-col gap-4`}
                  >
                    <div className={`w-12 h-12 ${t.bg} rounded-2xl flex items-center justify-center ${t.color} group-hover:scale-110 transition-transform duration-300`}>
                      {t.icon}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{t.name}</p>
                      <p className="text-[11px] text-gray-600 mt-1 leading-snug">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Technology;
