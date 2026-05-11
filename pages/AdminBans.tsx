import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import { API } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Ban {
  id: string;
  ip: string;
  reason: string;
  evidence?: string | null;
  route?: string | null;
  userId?: string | null;
  appealText?: string | null;
  appealedAt?: string | null;
  liftedAt?: string | null;
  liftedBy?: string | null;
  createdAt: string;
}

type Filter = 'active' | 'appealed' | 'lifted' | 'all';

const fmt = (iso?: string | null) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString('hr-HR'); } catch { return ''; }
};

const AdminBans: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [bans, setBans] = useState<Ban[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('active');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/', { replace: true });
  }, [authLoading, isAdmin, navigate]);

  const load = (f: Filter) => {
    setLoading(true);
    API.listAdminBans(f === 'all' ? undefined : f)
      .then(setBans)
      .catch(() => setBans([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { if (isAdmin) load(filter); }, [isAdmin, filter]);

  const handleLift = async (id: string) => {
    if (!window.confirm('Lift this ban? The user will regain posting access.')) return;
    setBusyId(id);
    try {
      await API.liftAdminBan(id);
      load(filter);
    } catch {} finally {
      setBusyId(null);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-brand-black flex items-center justify-center text-gray-500"><Loader2 className="animate-spin" /></div>;
  }
  if (!isAdmin) return null;

  const tabs: Filter[] = ['active', 'appealed', 'lifted', 'all'];

  return (
    <div className="min-h-screen bg-brand-black pt-12 pb-24">
      <SEO title="Ban management" canonical="/admin/bans" noIndex />

      <div className="max-w-5xl mx-auto px-4 lg:px-12">
        <div className="flex items-center justify-between mb-8">
          <Link to="/blog-admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest">
            <ArrowLeft size={14} /> Admin
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tighter">Bans</h1>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-colors ${
                filter === t
                  ? 'bg-brand-pink text-white border-brand-pink'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && <div className="text-gray-500 text-sm flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Loading…</div>}

        {!loading && bans.length === 0 && (
          <div className="border border-white/10 rounded-2xl p-12 text-center text-gray-500">
            No bans in this view.
          </div>
        )}

        <div className="space-y-4">
          {bans.map(b => (
            <div key={b.id} className="bg-brand-grey border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {b.liftedAt
                      ? <ShieldCheck size={16} className="text-brand-green" />
                      : <ShieldAlert size={16} className="text-red-400" />}
                    <span className="font-mono text-white text-sm">{b.ip}</span>
                  </div>
                  <div className="text-gray-400 text-sm">{b.reason}</div>
                  {b.route && <div className="text-gray-600 text-xs font-mono mt-1">{b.route}</div>}
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div>Banned {fmt(b.createdAt)}</div>
                  {b.userId && <div className="font-mono text-gray-600">user: {b.userId.slice(0, 12)}…</div>}
                </div>
              </div>

              {b.evidence && (
                <div className="mb-4">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Evidence</div>
                  <pre className="bg-brand-black border border-white/5 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono">
                    {b.evidence}
                  </pre>
                </div>
              )}

              {b.appealText && (
                <div className="mb-4">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                    Appeal {b.appealedAt && `(${fmt(b.appealedAt)})`}
                  </div>
                  <blockquote className="border-l-4 border-brand-pink pl-4 text-gray-300 text-sm italic">
                    {b.appealText}
                  </blockquote>
                </div>
              )}

              {b.liftedAt ? (
                <div className="flex items-center gap-2 text-brand-green text-xs font-black uppercase tracking-widest">
                  <CheckCircle2 size={14} /> Lifted {fmt(b.liftedAt)}
                </div>
              ) : (
                <button
                  onClick={() => handleLift(b.id)}
                  disabled={busyId === b.id}
                  className="px-4 py-2 bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-green/20 disabled:opacity-50"
                >
                  {busyId === b.id ? 'Lifting…' : 'Lift ban'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBans;
