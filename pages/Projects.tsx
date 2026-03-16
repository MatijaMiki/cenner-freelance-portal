
import React from 'react';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';
import NeuralBackground from '../components/NeuralBackground';

const CLIENT_PROJECTS = [
  {
    id: 'marubosfood',
    title: 'Marubosfood',
    url: 'https://marubosfood.com',
    category: 'Food & E-commerce',
    deliverable: 'Full-stack web presence and e-commerce platform for a premium Croatian food brand — product catalogue, online ordering, and brand identity.',
    tags: ['Web', 'E-commerce', 'Branding'],
    logo: '/logos/marubosfood.png',
    accentLight: 'rgba(92,45,11,0.12)',
  },
  {
    id: 'selectedrealestate',
    title: 'Selected Real Estate',
    url: 'https://selectedrealestate.hr',
    category: 'Real Estate',
    deliverable: 'Premium real estate portal for a Croatian luxury property agency — property listings, search, agent profiles, and multilingual support.',
    tags: ['Web', 'Real Estate', 'Multilingual'],
    logo: '/logos/selectedrealestate.webp',
    accentLight: 'rgba(201,168,112,0.08)',
  },
];

const Projects: React.FC = () => {
  return (
    <div className="relative min-h-screen pt-16 pb-24 overflow-hidden">
      <NeuralBackground parallax={false} />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center space-x-2 bg-brand-pink/10 border border-brand-pink/20 rounded-full px-5 py-2 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink">
            <CheckCircle2 size={12} />
            <span>Delivered Work</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            Previous Projects
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Real work delivered through the Cenner network — visit the live sites below.
          </p>
        </div>

        {/* Project Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {CLIENT_PROJECTS.map((project) => (
            <a
              key={project.id}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-brand-grey/70 border border-white/5 rounded-[2.5rem] p-10 hover:border-white/10 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Glow blob on hover */}
              <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: project.accentLight }}
              />

              <div className="relative z-10 flex flex-col h-full">
                {/* Logo — grayscale by default, full color on hover */}
                <div className="mb-8 h-16 flex items-center">
                  <img
                    src={project.logo}
                    alt={project.title}
                    className="max-h-14 w-auto object-contain transition-all duration-500 grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100"
                  />
                </div>

                {/* Category */}
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                  {project.category}
                </span>

                {/* Title */}
                <h2 className="text-2xl font-black text-white mb-4 tracking-tight">
                  {project.title}
                </h2>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-1">
                  {project.deliverable}
                </p>

                {/* Tags + arrow */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 text-gray-600 group-hover:border-white/20 group-hover:text-white transition-all shrink-0 ml-4">
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
