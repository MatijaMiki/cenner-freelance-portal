
import React from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../i18n';

// Inline branded SVG icons (lucide doesn't include X/Facebook/Medium)
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const MediumIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
  </svg>
);

const SOCIAL = [
  { Icon: XIcon,        href: '#', label: 'X' },
  { Icon: FacebookIcon, href: '#', label: 'Facebook' },
  { Icon: MediumIcon,   href: '#', label: 'Medium' },
];

const PLATFORM_LINKS = [
  { label: 'Marketplace',   path: '/marketplace' },
  { label: 'Services',      path: '/services' },
  { label: 'Job Matching',  path: '/match' },
  { label: 'Dashboard',     path: '/dashboard' },
];

const COMPANY_LINKS = [
  { label: 'About Us',          path: '/about' },
  { label: 'Previous Projects', path: '/projects' },
  { label: 'Technology',        path: '/technology' },
  { label: 'Contact',           path: '/contact' },
];

const RESOURCE_LINKS = [
  { label: 'Blog',           path: '/blog' },
  { label: 'Community',      path: '/community' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Terms of Use',   path: '/terms' },
  { label: 'Cookie Policy',  path: '/cookies' },
];

const Footer: React.FC = () => {
  const t = useT();
  return (
    <footer className="pt-24 border-t border-white/5 bg-brand-black/20 rounded-t-[4rem] relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-20">

          {/* Brand column */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-green to-brand-pink rounded-xl flex items-center justify-center font-black text-brand-black">C</div>
              <span className="text-2xl font-black tracking-tighter text-white">CENNER</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              {t("The platform for high-quality digital collaboration. Connecting top creators worldwide.")}
            </p>
            <div className="flex space-x-3">
              {SOCIAL.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-brand-green hover:border-brand-green transition-all"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{t('Platform')}</h5>
            <ul className="space-y-3">
              {PLATFORM_LINKS.map(({ label, path }) => (
                <li key={label}>
                  <Link to={path} className="text-gray-500 hover:text-brand-green text-sm transition-colors">
                    {t(label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{t('Company')}</h5>
            <ul className="space-y-3">
              {COMPANY_LINKS.map(({ label, path }) => (
                <li key={label}>
                  <Link to={path} className="text-gray-500 hover:text-brand-pink text-sm transition-colors">
                    {t(label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{t('Resources')}</h5>
            <ul className="space-y-3">
              {RESOURCE_LINKS.map(({ label, path }) => (
                <li key={label}>
                  <Link to={path} className="text-gray-500 hover:text-brand-green text-sm transition-colors">
                    {t(label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center py-10 border-t border-white/5 gap-6">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            © {new Date().getFullYear()} Cenner. {t('All rights reserved.')}
          </p>
          <div className="flex space-x-8">
            <Link to="/privacy" className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest">{t('Privacy')}</Link>
            <Link to="/terms"   className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest">{t('Terms')}</Link>
            <Link to="/cookies" className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest">{t('Cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
