
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, ShieldAlert, Briefcase, MessageSquare,
  Star, TrendingUp, Plus, ArrowRight, User, Zap, Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import NeuralBackground from '../components/NeuralBackground';
import { useT } from '../i18n';
import SEO from '../components/SEO';

interface DashStats {
  activeListings?: number;
  avgRating?: number;
  totalEarned?: number;
  ordersCompleted?: number;
  activeJobs?: number;
  openOrders?: number;
  totalSpent?: number;
  hiredFreelancers?: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const [stats, setStats] = useState<DashStats>({});

  useEffect(() => {
    if (!user) navigate('/auth');
    else API.getDashboardStats().then(setStats).catch(() => {});
  }, [user, navigate]);

  if (!user) return null;

  const isVerified = user.kycVerified || user.creatorStatus === 'approved';
  const isFreelancer = user.role === 'freelancer';

  const fmt = (v: number | undefined, prefix = '') => v !== undefined ? `${prefix}${v}` : '—';

  const quickStats = isFreelancer
    ? [
        { label: t('Active Listings'), value: fmt(stats.activeListings), icon: <Briefcase size={18} />, color: 'brand-green' },
        { label: t('Avg. Rating'), value: stats.avgRating !== undefined ? stats.avgRating.toFixed(1) : '—', icon: <Star size={18} />, color: 'brand-pink' },
        { label: t('Total Earned'), value: fmt(stats.totalEarned, '€'), icon: <TrendingUp size={18} />, color: 'brand-green' },
        { label: t('Orders Completed'), value: fmt(stats.ordersCompleted), icon: <Zap size={18} />, color: 'brand-pink' },
      ]
    : [
        { label: t('Active Jobs'), value: fmt(stats.activeJobs), icon: <Briefcase size={18} />, color: 'brand-green' },
        { label: t('Open Orders'), value: fmt(stats.openOrders), icon: <Clock size={18} />, color: 'brand-pink' },
        { label: t('Total Spent'), value: fmt(stats.totalSpent, '€'), icon: <TrendingUp size={18} />, color: 'brand-green' },
        { label: t('Hired Freelancers'), value: fmt(stats.hiredFreelancers), icon: <User size={18} />, color: 'brand-pink' },
      ];

  const quickActions = isFreelancer
    ? [
        { label: t('Create Listing'), icon: <Plus size={16} />, to: '/profile', desc: 'Post a new service' },
        { label: t('View Orders'), icon: <Briefcase size={16} />, to: '/orders', desc: 'Track active work' },
        { label: t('Messages'), icon: <MessageSquare size={16} />, to: '/messages', desc: 'Client conversations' },
        { label: t('My Profile'), icon: <User size={16} />, to: '/profile', desc: 'Edit your portfolio' },
      ]
    : [
        { label: t('Post a Job'), icon: <Plus size={16} />, to: '/profile', desc: 'Find top talent' },
        { label: t('Browse Market'), icon: <Zap size={16} />, to: '/marketplace', desc: 'Explore services' },
        { label: t('My Orders'), icon: <Briefcase size={16} />, to: '/orders', desc: 'Track projects' },
        { label: t('Messages'), icon: <MessageSquare size={16} />, to: '/messages', desc: 'Talk to freelancers' },
      ];

  return (
    <div className="relative min-h-screen pt-12 pb-24 px-4 overflow-hidden">
      <SEO noIndex />
      <NeuralBackground parallax={false} />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-green mb-2">{t('Welcome back')}</p>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3">
            {user.name || 'Freelancer'}
          </h1>
          <p className="text-gray-500 font-medium">
            {isFreelancer ? 'Freelancer dashboard' : 'Client dashboard'} · {user.email}
          </p>
        </div>

        {/* KYC Banner */}
        {!isVerified && (
          <div className="mb-10 p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ShieldAlert size={24} className="text-yellow-400 shrink-0" />
              <div>
                <p className="text-white font-bold text-sm">{t('Identity verification required')}</p>
                <p className="text-gray-400 text-xs mt-0.5">{t('Complete KYC to unlock listings, orders, and full platform access.')}</p>
              </div>
            </div>
            <Link
              to="/creator-onboarding"
              className="shrink-0 px-5 py-2.5 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-400 text-xs font-black uppercase tracking-widest hover:bg-yellow-500/30 transition-colors flex items-center gap-2"
            >
              {t('Verify Now')} <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {isVerified && (
          <div className="mb-10 p-5 bg-brand-green/10 border border-brand-green/20 rounded-2xl flex items-center gap-4">
            <ShieldCheck size={24} className="text-brand-green shrink-0" />
            <div>
              <p className="text-white font-bold text-sm">{t('Identity verified')}</p>
              <p className="text-gray-400 text-xs mt-0.5">{t('Your account has full platform access.')}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {quickStats.map((stat, i) => (
            <div key={i} className="bg-brand-grey/60 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
              <div className={`text-${stat.color} mb-4`}>{stat.icon}</div>
              <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-5">{t('Quick Actions')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                to={action.to}
                className="group bg-brand-grey/40 border border-white/5 rounded-2xl p-6 hover:border-brand-green/30 hover:bg-white/5 transition-all"
              >
                <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green mb-4 group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <div className="text-white font-bold text-sm mb-1">{action.label}</div>
                <div className="text-gray-600 text-[11px]">{action.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div>
          <h2 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-5">Recent Activity</h2>
          <div className="bg-brand-grey/40 border border-white/5 rounded-2xl p-10 text-center">
            <Clock size={32} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-600 font-bold text-sm">{t('No recent activity yet')}</p>
            <p className="text-gray-700 text-xs mt-1">{t('Your orders and interactions will appear here.')}</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-brand-green text-brand-black font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all"
            >
              {t('Explore Marketplace')} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
