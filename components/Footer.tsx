
import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="pt-24 border-t border-white/5 bg-brand-black/20 rounded-t-[4rem] relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-8 group">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-green to-brand-pink rounded-xl flex items-center justify-center font-black text-brand-black">C</div>
              <span className="text-2xl font-black tracking-tighter text-white">CENNER</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              The elite protocol for high-end digital collaboration. Connecting the world's top 1% creators.
            </p>
            <div className="flex space-x-4">
              {[Twitter, Linkedin, Github, Instagram].map((Icon, i) => (
                <button key={i} className="w-10 h-10 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-brand-green hover:border-brand-green transition-all">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Platform</h5>
            <ul className="space-y-3">
              {['Marketplace', 'Talent Directory', 'Pro Dashboard', 'Project Hub'].map(link => (
                <li key={link}><Link to="/marketplace" className="text-gray-500 hover:text-brand-green text-sm transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Company</h5>
            <ul className="space-y-3">
              {['About Protocol', 'Global Network', 'Contact Core', 'Press Kits'].map(link => (
                <li key={link}><Link to="/about" className="text-gray-500 hover:text-brand-pink text-sm transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Resources</h5>
            <ul className="space-y-3">
              {['API Documentation', 'Escrow Security', 'Privacy Protocol', 'Terms of Node'].map(link => (
                <li key={link}><Link to="/terms" className="text-gray-500 hover:text-brand-green text-sm transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center py-10 border-t border-white/5 gap-6">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">© {new Date().getFullYear()} Cenner Global Network. Handcrafted for the Elite.</p>
          <div className="flex space-x-8">
            <Link to="/privacy" className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest">Privacy</Link>
            <Link to="/terms" className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest">Terms</Link>
            <Link to="/cookies" className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
