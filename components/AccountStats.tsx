import React, { useEffect, useState } from 'react';
import { Briefcase, Clock, Star, TrendingUp, User, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import { useT } from '../i18n';

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

/** The account's numbers at a glance, at the top of the profile (they were the /dashboard page,
 *  which now lands on the profile): a freelancer's selling figures, or a client's buying ones. */
const AccountStats: React.FC = () => {
  const { user } = useAuth();
  const t = useT();
  const [stats, setStats] = useState<DashStats>({});

  useEffect(() => {
    if (user) API.getDashboardStats().then(setStats).catch(() => {});
  }, [user]);

  if (!user) return null;
  const fmt = (v: number | undefined, prefix = '') => (v !== undefined ? `${prefix}${v}` : '—');
  const tiles = user.role === 'freelancer'
    ? [
        { label: t('Active Listings'), value: fmt(stats.activeListings), icon: <Briefcase size={18} />, tone: 'text-leaf' },
        { label: t('Avg. Rating'), value: stats.avgRating !== undefined ? stats.avgRating.toFixed(1) : '—', icon: <Star size={18} />, tone: 'text-sky' },
        { label: t('Total Earned'), value: fmt(stats.totalEarned, '€'), icon: <TrendingUp size={18} />, tone: 'text-leaf' },
        { label: t('Orders Completed'), value: fmt(stats.ordersCompleted), icon: <Zap size={18} />, tone: 'text-sky' },
      ]
    : [
        { label: t('Active Jobs'), value: fmt(stats.activeJobs), icon: <Briefcase size={18} />, tone: 'text-leaf' },
        { label: t('Open Orders'), value: fmt(stats.openOrders), icon: <Clock size={18} />, tone: 'text-sky' },
        { label: t('Total Spent'), value: fmt(stats.totalSpent, '€'), icon: <TrendingUp size={18} />, tone: 'text-leaf' },
        { label: t('Hired Freelancers'), value: fmt(stats.hiredFreelancers), icon: <User size={18} />, tone: 'text-sky' },
      ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {tiles.map(tile => (
        <div key={tile.label} className="bg-white border-2 border-ink p-5">
          <div className={`${tile.tone} mb-3`}>{tile.icon}</div>
          <div className="text-2xl font-black text-ink mb-1">{tile.value}</div>
          <div className="text-[12px] font-bold text-slate uppercase tracking-widest">{tile.label}</div>
        </div>
      ))}
    </div>
  );
};

export default AccountStats;
