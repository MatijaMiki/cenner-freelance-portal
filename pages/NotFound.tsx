import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';
import { useT } from '../i18n';

const NotFound: React.FC = () => {
  const t = useT();
  return (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <SEO title={t('Page Not Found')} noIndex={true} />
    <h1 className="text-[120px] font-black text-ink/10 leading-none select-none">404</h1>
    <h2 className="text-2xl font-bold text-ink -mt-4 mb-3">{t('Page not found')}</h2>
    <p className="text-slate mb-8 max-w-md">{t("The page you're looking for doesn't exist or has been moved.")}</p>
    <div className="flex gap-4">
      <Link to="/" className="flex items-center gap-2 px-6 py-3 bg-sky text-white font-bold hover:scale-105 transition-all">
        <Home size={16} /> {t('Go Home')}
      </Link>
      <button onClick={() => window.history.back()} className="flex items-center gap-2 px-6 py-3 border-2 border-ink text-ink font-bold hover:bg-ink/5 transition-all">
        <ArrowLeft size={16} /> {t('Go Back')}
      </button>
    </div>
  </div>
  );
};

export default NotFound;
