import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle2, XCircle, ArrowRight, Package, Loader2, Truck, RefreshCw, FileText, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotify } from '../contexts/NotifyContext';
import { API } from '../lib/api';
import SEO from '../components/SEO';

type OrderStatus = 'PENDING' | 'PAID' | 'IN_PROGRESS' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

interface Order {
  id: string;
  listing: { title: string; category?: string; freelancer?: { name: string } };
  buyer: { name: string };
  amount: number;
  status: OrderStatus;
  createdAt: string;
  deliveryDueAt?: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:     { label: 'Pending',     color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: <Clock size={12} /> },
  PAID:        { label: 'Paid',        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',       icon: <CheckCircle2 size={12} /> },
  IN_PROGRESS: { label: 'In Progress', color: 'text-brand-green bg-brand-green/10 border-brand-green/20', icon: <Briefcase size={12} /> },
  DELIVERED:   { label: 'Delivered',   color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: <Truck size={12} /> },
  COMPLETED:   { label: 'Completed',   color: 'text-gray-400 bg-white/5 border-white/10',             icon: <CheckCircle2 size={12} /> },
  CANCELLED:   { label: 'Cancelled',   color: 'text-red-400 bg-red-500/10 border-red-500/20',         icon: <XCircle size={12} /> },
  REFUNDED:    { label: 'Refunded',    color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: <RefreshCw size={12} /> },
};

const Orders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [actionId, setActionId] = useState<string | null>(null);

  const reload = () => API.getOrders(role).then(setOrders).catch(() => {});

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    setLoading(true);
    API.getOrders(role).then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, [user, navigate, role]);

  async function markComplete(orderId: string) {
    const ok = await notify.confirm('Mark this order as complete and release payment to the freelancer? This cannot be undone.', {
      title: 'Complete order?',
      confirmLabel: 'Yes, release payment',
      cancelLabel: 'Not yet',
    });
    if (!ok) return;
    setActionId(orderId);
    try {
      await API.updateOrderStatus(orderId, 'COMPLETED');
      notify.toast('Payment released to the freelancer.', 'success');
      reload();
    } catch (e: any) {
      notify.toast(e?.message || 'Could not complete order', 'error');
    } finally {
      setActionId(null);
    }
  }

  async function refundOrder(orderId: string) {
    const ok = await notify.confirm('Refund this order to the buyer? This cannot be undone.', {
      title: 'Issue refund?',
      confirmLabel: 'Yes, refund',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    setActionId(orderId);
    try {
      await API.refundOrder(orderId);
      notify.toast('Order refunded. The buyer was notified.', 'success');
      reload();
    } catch (e: any) {
      notify.toast(e?.message || 'Could not issue refund', 'error');
    } finally {
      setActionId(null);
    }
  }

  if (!user) return null;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-24">
      <SEO title="Orders" />
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Track your purchases and sales.</p>
      </div>

      <div className="flex gap-2 mb-8">
        {(['buyer', 'seller'] as const).map(r => (
          <button key={r} onClick={() => setRole(r)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              role === r ? 'bg-brand-green text-brand-black' : 'bg-zinc-900 border border-white/10 text-gray-500 hover:text-white'
            }`}>
            {r === 'buyer' ? 'Purchases' : 'Sales'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-500" size={32} />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-16 text-center">
          <Package size={40} className="text-gray-700 mx-auto mb-5" />
          <h3 className="text-white font-bold text-xl mb-2">No orders yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">
            {role === 'seller' ? 'Orders from buyers will appear here.' : 'Purchase a service to see your orders.'}
          </p>
          <Link to="/marketplace" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-green text-brand-black font-bold rounded-xl hover:scale-105 transition-all">
            Explore Marketplace <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            const counterparty = role === 'buyer' ? order.listing?.freelancer?.name : order.buyer?.name;
            return (
              <div key={order.id} className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6 flex items-center justify-between gap-4 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green shrink-0">
                    <Briefcase size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-sm truncate">{order.listing?.title || 'Order'}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {counterparty || 'Unknown'} · {formatDate(order.createdAt)}
                      {order.deliveryDueAt && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                        <span className="ml-2 text-brand-pink">· Due {formatDate(order.deliveryDueAt)}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-white font-black">&euro;{Number(order.amount).toFixed(2)}</span>
                  <span className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>

                  {role === 'buyer' && ['PAID', 'IN_PROGRESS', 'DELIVERED'].includes(order.status) && (
                    <button
                      onClick={() => markComplete(order.id)}
                      disabled={actionId === order.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/10 border border-brand-green/20 text-brand-green rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-green/20 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 size={12} />
                      {actionId === order.id ? '…' : 'Complete'}
                    </button>
                  )}
                  {role === 'seller' && ['PAID', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED'].includes(order.status) && (
                    <button
                      onClick={() => refundOrder(order.id)}
                      disabled={actionId === order.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-400/10 border border-orange-400/20 text-orange-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-400/20 transition-all disabled:opacity-50"
                    >
                      <DollarSign size={12} />
                      {actionId === order.id ? '…' : 'Refund'}
                    </button>
                  )}

                  <a
                    href={`${import.meta.env.VITE_CRM_API_BASE || 'https://api.cenner.hr'}/api/v1/portal/orders/${order.id}/invoice`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Download R1 invoice"
                    className="p-2 rounded-xl border border-white/10 text-gray-500 hover:text-brand-green hover:border-brand-green/30 transition-colors"
                  >
                    <FileText size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
