import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, Clock, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import SEO from '../components/SEO';
import AvatarImg from '../components/Avatar';

interface Contract {
  id: string;
  title: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  expiresAt?: string;
  initiatedBy?: string;
  clientId: string;
  freelancerId: string;
  client: { id: string; name: string; avatar?: string };
  freelancer: { id: string; name: string; avatar?: string };
  milestones: { id: string; status: string; amount: number }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT:     { label: 'Pending acceptance', color: 'text-ink bg-ink/5 border-ink', icon: <Clock size={12} /> },
  ACTIVE:    { label: 'Active',             color: 'text-leaf bg-leaf/10 border-ink', icon: <CheckCircle2 size={12} /> },
  COMPLETED: { label: 'Completed',          color: 'text-sky bg-ink/5 border-ink', icon: <CheckCircle2 size={12} /> },
  DISPUTED:  { label: 'Disputed',           color: 'text-red-700 bg-red-50 border-red-700', icon: <AlertTriangle size={12} /> },
  CANCELLED: { label: 'Cancelled',          color: 'text-slate bg-ink/5 border-ink', icon: <XCircle size={12} /> },
};

function daysUntil(date: string) {
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

const Contracts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = () => {
    API.getContracts()
      .then(setContracts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    load();
  }, [user, navigate]);

  function milestoneProgress(milestones: Contract['milestones']) {
    const released = milestones.filter(m => m.status === 'RELEASED').length;
    return { released, total: milestones.length };
  }

  // Incoming offers = DRAFT contracts where I'm the recipient (not the initiator)
  const incomingOffers = contracts.filter(c => {
    if (c.status !== 'DRAFT') return false;
    if (c.initiatedBy === 'CLIENT') return c.freelancerId === user?.id;
    if (c.initiatedBy === 'FREELANCER') return c.clientId === user?.id;
    // Legacy: no initiatedBy — default assume freelancer must accept
    return c.freelancerId === user?.id;
  });

  // Everything else
  const otherContracts = contracts.filter(c => !incomingOffers.includes(c));

  async function handleAccept(e: React.MouseEvent, contractId: string) {
    e.stopPropagation();
    setActing(contractId + '-accept');
    try { await API.acceptContract(contractId); load(); }
    catch (err: any) { alert(err.message || 'Failed'); }
    finally { setActing(null); }
  }

  async function handleDecline(e: React.MouseEvent, contractId: string) {
    e.stopPropagation();
    if (!confirm('Decline this offer? This cannot be undone.')) return;
    setActing(contractId + '-decline');
    try { await API.declineContract(contractId); load(); }
    catch (err: any) { alert(err.message || 'Failed'); }
    finally { setActing(null); }
  }

  function renderContractRow(contract: Contract) {
    const cfg = STATUS_CONFIG[contract.status] || STATUS_CONFIG.DRAFT;
    const { released, total } = milestoneProgress(contract.milestones);
    const isClient = contract.clientId === user?.id;
    const other = isClient ? contract.freelancer : contract.client;
    return (
      <button
        key={contract.id}
        onClick={() => navigate(`/contracts/${contract.id}`)}
        className="w-full flex items-center gap-4 p-5 bg-white border-2 border-ink hover:border-ink transition-all text-left"
      >
        <div className="flex-shrink-0">
          <AvatarImg src={other.avatar} name={other.name} size={44} className="" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-ink text-sm truncate">{contract.title}</span>
            <span className={`flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 border ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
          <p className="text-slate text-xs">{isClient ? 'With' : 'For'} {other.name} · {released}/{total} milestones</p>
        </div>
        <div className="text-right flex-shrink-0 flex items-center gap-2">
          <div>
            <p className="text-ink font-black">€{contract.totalAmount.toFixed(2)}</p>
            <p className="text-slate text-xs">total</p>
          </div>
          <ChevronRight size={16} className="text-slate" />
        </div>
      </button>
    );
  }

  return (
    <div className="relative min-h-screen">
      <SEO title="Contracts" canonical="/contracts" description="Your contracts on Cenner" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="text-leaf" size={28} />
          <h1 className="text-3xl font-black text-ink tracking-tight">Contracts</h1>
        </div>

        {loading ? (
          <div className="text-slate text-sm">Loading…</div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto text-slate mb-4" size={48} />
            <p className="text-slate">No contracts yet.</p>
            <p className="text-slate text-sm mt-1">Contracts are created when you or a client proposes a deal.</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Incoming offers — need your response */}
            {incomingOffers.length > 0 && (
              <div>
                <h2 className="text-[12px] font-black text-slate uppercase tracking-widest mb-3">
                  Offers awaiting your response
                </h2>
                <div className="space-y-3">
                  {incomingOffers.map(contract => {
                    const isClient = contract.clientId === user?.id;
                    const other = isClient ? contract.freelancer : contract.client;
                    const days = contract.expiresAt ? daysUntil(contract.expiresAt) : null;
                    return (
                      <div
                        key={contract.id}
                        className="p-5 bg-ink/5 border border-ink"
                      >
                        <div
                          className="flex items-center gap-4 cursor-pointer"
                          onClick={() => navigate(`/contracts/${contract.id}`)}
                        >
                          <div className="flex-shrink-0">
                            <AvatarImg src={other.avatar} name={other.name} size={44} className="" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-ink text-sm">{contract.title}</p>
                            <p className="text-slate text-xs mt-0.5">
                              From {other.name} · €{contract.totalAmount.toFixed(2)} · {contract.milestones.length} milestone{contract.milestones.length !== 1 ? 's' : ''}
                            </p>
                            {days !== null && (
                              <p className={`text-xs mt-1 font-bold ${days <= 1 ? 'text-red-700' : 'text-ink'}`}>
                                {days <= 0 ? 'Expiring today' : `Expires in ${days} day${days !== 1 ? 's' : ''}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={e => handleAccept(e, contract.id)}
                            disabled={acting === contract.id + '-accept'}
                            className="flex-1 py-2 bg-sky text-white font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {acting === contract.id + '-accept' ? 'Accepting…' : 'Accept'}
                          </button>
                          <button
                            onClick={e => handleDecline(e, contract.id)}
                            disabled={acting === contract.id + '-decline'}
                            className="flex-1 py-2 bg-ink/5 border-2 border-ink text-ink font-bold text-sm hover:bg-ink/10 transition-colors disabled:opacity-50"
                          >
                            {acting === contract.id + '-decline' ? 'Declining…' : 'Decline'}
                          </button>
                          <button
                            onClick={() => navigate(`/contracts/${contract.id}`)}
                            className="px-4 py-2 bg-ink/5 border-2 border-ink text-slate font-bold text-sm hover:bg-ink/10 transition-colors text-xs"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All other contracts */}
            {otherContracts.length > 0 && (
              <div>
                {incomingOffers.length > 0 && (
                  <h2 className="text-[12px] font-black text-slate uppercase tracking-widest mb-3">All contracts</h2>
                )}
                <div className="space-y-3">
                  {otherContracts.map(renderContractRow)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contracts;
