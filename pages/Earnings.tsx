import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Clock, Briefcase, Loader2 } from 'lucide-react';
import { API } from '../lib/api';
import SEO from '../components/SEO';

interface EarningsData {
  totalEarnings: number;
  pendingAmount: number;
  activeContracts: number;
  completedOrders: number;
  completedMilestones: number;
  monthly: { month: string; amount: number }[];
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
  <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon size={20} /></div>
      <span className="text-gray-400 text-sm font-medium">{label}</span>
    </div>
    <p className="text-2xl font-black text-white">{value}</p>
  </div>
);

const Earnings: React.FC = () => {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.getEarnings().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-gray-500" size={32} /></div>
  );

  if (!data || data.totalEarnings === 0) return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
      <DollarSign size={48} className="text-gray-700 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">No earnings yet</h2>
      <p className="text-gray-500">Complete contracts and orders to see your earnings here.</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 pt-8 pb-24">
      <SEO title="Earnings" />
      <h1 className="text-3xl font-extrabold text-white mb-8">Earnings</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={DollarSign} label="Total Earned" value={`€${data.totalEarnings.toFixed(2)}`} color="bg-brand-green/10 text-brand-green" />
        <StatCard icon={Clock} label="Pending Payouts" value={`€${data.pendingAmount.toFixed(2)}`} color="bg-yellow-500/10 text-yellow-400" />
        <StatCard icon={Briefcase} label="Active Contracts" value={String(data.activeContracts)} color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={TrendingUp} label="Completed" value={`${data.completedOrders + data.completedMilestones}`} color="bg-gray-500/10 text-gray-400" />
      </div>

      <div className="bg-zinc-900/80 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Monthly Breakdown</h2>
        </div>
        {data.monthly.length === 0 ? (
          <p className="text-gray-500 text-sm px-6 py-8 text-center">No monthly data yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {data.monthly.map(m => (
              <div key={m.month} className="flex items-center justify-between px-6 py-4">
                <span className="text-gray-400 font-medium">{m.month}</span>
                <span className="text-white font-bold">€{m.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;
