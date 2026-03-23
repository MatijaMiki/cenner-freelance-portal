
import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Settings, CreditCard, MessageSquare, Briefcase, PlusCircle,
  TrendingUp, Clock, CheckCircle, AlertCircle, MoreVertical,
  MoreHorizontal, Edit2, Pause, Trash2, ArrowUpRight, Search,
  Calendar, X, Download, User as UserIcon, ShieldAlert, Rocket, Play, Image as ImageIcon, Smartphone, Mail, Crown, Zap, Globe,
  Upload, Loader2, ExternalLink, ShieldCheck, MapPin, Banknote, BadgeCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { CATEGORIES } from '../constants';
import { API } from '../lib/api';
import { useT } from '../i18n';

type ActiveTab = 'listings' | 'inbox' | 'earnings' | 'settings' | 'portfolio';

// ─── Settings Tab ────────────────────────────────────────────────────────────
const SettingsTab: React.FC<{ currentUser: any; updateUser: (u: any) => void; navigate: any; initialSection?: string }> = ({ currentUser, updateUser, navigate, initialSection = 'account' }) => {
  const t = useT();
  const [section, setSection] = React.useState<'account' | 'security' | 'billing'>(initialSection as any);

  // Account fields
  const [name, setName] = React.useState(currentUser?.name || '');
  const [bio, setBio] = React.useState((currentUser as any)?.bio || '');
  const [location, setLocation] = React.useState((currentUser as any)?.location || '');
  const [savingAccount, setSavingAccount] = React.useState(false);
  const [accountMsg, setAccountMsg] = React.useState('');

  // Security fields
  const [currentPwd, setCurrentPwd] = React.useState('');
  const [newPwd, setNewPwd] = React.useState('');
  const [confirmPwd, setConfirmPwd] = React.useState('');
  const [savingPwd, setSavingPwd] = React.useState(false);
  const [pwdMsg, setPwdMsg] = React.useState('');
  const [pwdError, setPwdError] = React.useState('');

  // Payout / Stripe Connect
  const [connectStatus, setConnectStatus] = React.useState<{ connected: boolean; ready: boolean } | null>(null);
  const [connectLoading, setConnectLoading] = React.useState(false);
  const [connectError, setConnectError] = React.useState('');

  React.useEffect(() => {
    if (section !== 'billing') return;
    API.getConnectStatus()
      .then(setConnectStatus)
      .catch(() => setConnectStatus({ connected: false, ready: false }));
  }, [section]);

  const handleConnectOnboard = async () => {
    setConnectLoading(true);
    setConnectError('');
    try {
      const { url } = await API.connectOnboard();
      if (!url || !/^https:\/\//i.test(url)) throw new Error('Invalid redirect URL');
      window.location.href = url;
    } catch (e: any) {
      setConnectError(e.message || 'Failed to start payout setup');
      setConnectLoading(false);
    }
  };

  const handleSaveAccount = async () => {
    if (!currentUser) return;
    setSavingAccount(true);
    setAccountMsg('');
    try {
      await API.updateProfile(currentUser.id, { name, bio, location } as any);
      updateUser({ name, bio, location } as any);
      setAccountMsg(t('Saved successfully.'));
    } catch { setAccountMsg(t('Failed to save.')); }
    finally { setSavingAccount(false); }
  };

  const handleChangePassword = async () => {
    setPwdError(''); setPwdMsg('');
    if (newPwd !== confirmPwd) { setPwdError(t('Passwords do not match.')); return; }
    if (newPwd.length < 8) { setPwdError(t('Password must be at least 8 characters.')); return; }
    setSavingPwd(true);
    try {
      await API.changePassword(currentPwd, newPwd);
      setPwdMsg(t('Password updated successfully.'));
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e: any) { setPwdError(e.message || t('Failed to update password.')); }
    finally { setSavingPwd(false); }
  };

  const sections = [
    { id: 'account', label: t('Account') },
    { id: 'security', label: t('Security') },
    { id: 'billing', label: t('Billing') },
  ] as const;

  const inputClass = "w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-green/50 transition-colors text-sm";
  const labelClass = "text-[10px] font-black text-gray-500 uppercase tracking-widest";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Section tabs */}
      <div className="flex gap-1 p-1 bg-brand-grey/30 border border-white/5 rounded-2xl w-fit">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${section === s.id ? 'bg-brand-green text-brand-black' : 'text-gray-500 hover:text-white'}`}
          >{s.label}</button>
        ))}
      </div>

      {section === 'account' && (
        <div className="bg-brand-grey/30 border border-white/5 rounded-3xl p-8 space-y-6">
          <h3 className="text-white font-bold text-lg">{t('Account Information')}</h3>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className={labelClass}>{t('Display Name')}</label>
              <input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>{t('Email')}</label>
              <input className={`${inputClass} opacity-50 cursor-not-allowed`} value={currentUser?.email || ''} readOnly />
              <p className="text-[10px] text-gray-600">{t('Email cannot be changed here.')}</p>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>{t('Location')}</label>
              <input className={inputClass} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Zagreb, Croatia" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className={labelClass}>{t('Bio')}</label>
              <textarea className={`${inputClass} resize-none`} rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell clients about yourself..." />
            </div>
          </div>
          {accountMsg && <p className={`text-sm font-medium ${accountMsg.includes('Failed') ? 'text-brand-pink' : 'text-brand-green'}`}>{accountMsg}</p>}
          <button onClick={handleSaveAccount} disabled={savingAccount}
            className="flex items-center gap-2 px-6 py-3 bg-brand-green text-brand-black font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-sm"
          >
            {savingAccount ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            {t('Save Changes')}
          </button>
        </div>
      )}

      {section === 'security' && (
        <div className="space-y-6">
          <div className="bg-brand-grey/30 border border-white/5 rounded-3xl p-8 space-y-5">
            <h3 className="text-white font-bold text-lg">{t('Change Password')}</h3>
            <div className="space-y-1">
              <label className={labelClass}>{t('Current Password')}</label>
              <input type="password" className={inputClass} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className={labelClass}>{t('New Password')}</label>
                <input type="password" className={inputClass} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Min. 8 characters" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{t('Confirm New Password')}</label>
                <input type="password" className={inputClass} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Repeat password" />
              </div>
            </div>
            {pwdError && <p className="text-brand-pink text-sm font-medium">{pwdError}</p>}
            {pwdMsg && <p className="text-brand-green text-sm font-medium">{pwdMsg}</p>}
            <button onClick={handleChangePassword} disabled={savingPwd || !currentPwd || !newPwd || !confirmPwd}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl transition-all disabled:opacity-50 text-sm"
            >
              {savingPwd ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
              {t('Update Password')}
            </button>
          </div>

          <div className="bg-brand-grey/30 border border-white/5 rounded-3xl p-8 space-y-4">
            <h3 className="text-white font-bold text-lg">{t('Verification Status')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-white font-medium">{t('Email')}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  </div>
                </div>
                {currentUser?.emailVerified
                  ? <span className="flex items-center gap-1 text-[10px] font-bold text-brand-green"><CheckCircle size={12} /> {t('Verified')}</span>
                  : <span className="text-[10px] font-bold text-brand-pink">{t('Unverified')}</span>}
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Smartphone size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-white font-medium">{t('Phone')}</p>
                    <p className="text-xs text-gray-500">{(currentUser as any)?.mobile || t('Not set')}</p>
                  </div>
                </div>
                {currentUser?.mobileVerified
                  ? <span className="flex items-center gap-1 text-[10px] font-bold text-brand-green"><CheckCircle size={12} /> {t('Verified')}</span>
                  : <span className="text-[10px] font-bold text-brand-pink">{t('Unverified')}</span>}
              </div>
            </div>
          </div>

          <div className="bg-red-950/30 border border-red-900/30 rounded-3xl p-8 space-y-4">
            <h3 className="text-red-400 font-bold text-lg">{t('Danger Zone')}</h3>
            <p className="text-gray-500 text-sm">{t('Permanently delete your account and all associated data. This action cannot be undone.')}</p>
            <button className="px-6 py-3 border border-red-900/50 text-red-400 hover:bg-red-950/50 font-black rounded-xl transition-all text-sm">
              {t('Delete Account')}
            </button>
          </div>
        </div>
      )}

      {section === 'billing' && (
        <div className="space-y-6">
          <div className="bg-brand-grey/30 border border-white/5 rounded-3xl p-8">
            <h3 className="text-white font-bold text-lg mb-6">{t('Current Plan')}</h3>
            <div className="flex items-center justify-between p-5 bg-brand-black/40 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center">
                  <Crown size={22} className="text-brand-green" />
                </div>
                <div>
                  <p className="text-white font-bold capitalize">{currentUser?.tier?.toLowerCase() || 'free'} Plan</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {currentUser?.tier === 'FREE' && 'Basic access — upgrade to unlock all features'}
                    {currentUser?.tier === 'STARTER' && '€9/mo — Essential features'}
                    {currentUser?.tier === 'PRO' && '€19/mo — Full feature access'}
                    {currentUser?.tier === 'ENTERPRISE' && '€99/mo — Unlimited everything'}
                  </p>
                </div>
              </div>
              <button onClick={() => navigate('/subscription')}
                className="px-5 py-2.5 bg-brand-green text-brand-black font-black rounded-xl text-sm hover:scale-[1.02] active:scale-95 transition-all"
              >
                {currentUser?.tier === 'FREE' ? t('Upgrade') : t('Change Plan')}
              </button>
            </div>
          </div>

          {/* Payout Setup (freelancers only) */}
          <div className="bg-brand-grey/30 border border-white/5 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-2">
              <Banknote size={20} className="text-brand-green" />
              <h3 className="text-white font-bold text-lg">{t('Payout Account')}</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Set up your Stripe payout account to receive payments from clients. Required before clients can fund milestones on your contracts.
            </p>
            {connectError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{connectError}</div>
            )}
            {connectStatus === null ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader2 size={14} className="animate-spin" /> Checking status…</div>
            ) : connectStatus.ready ? (
              <div className="flex items-center justify-between p-5 bg-brand-black/40 border border-brand-green/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
                    <CheckCircle size={20} className="text-brand-green" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Payout account active</p>
                    <p className="text-gray-500 text-xs mt-0.5">You can receive payments from clients</p>
                  </div>
                </div>
                <button
                  onClick={handleConnectOnboard}
                  disabled={connectLoading}
                  className="px-4 py-2 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {connectLoading ? 'Loading…' : 'Manage account'}
                </button>
              </div>
            ) : connectStatus.connected ? (
              <div className="flex items-center justify-between p-5 bg-brand-black/40 border border-yellow-400/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                    <AlertCircle size={20} className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Setup incomplete</p>
                    <p className="text-gray-500 text-xs mt-0.5">Complete your Stripe onboarding to start receiving payments</p>
                  </div>
                </div>
                <button
                  onClick={handleConnectOnboard}
                  disabled={connectLoading}
                  className="px-4 py-2 bg-yellow-400 text-black font-black rounded-xl text-xs hover:scale-105 transition-all disabled:opacity-50"
                >
                  {connectLoading ? 'Loading…' : 'Continue setup'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-5 bg-brand-black/40 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Banknote size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">No payout account</p>
                    <p className="text-gray-500 text-xs mt-0.5">Connect Stripe to receive milestone payments</p>
                  </div>
                </div>
                <button
                  onClick={handleConnectOnboard}
                  disabled={connectLoading}
                  className="px-4 py-2 bg-brand-green text-brand-black font-black rounded-xl text-xs hover:scale-105 transition-all disabled:opacity-50"
                >
                  {connectLoading ? 'Loading…' : 'Set up payouts'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-brand-grey/30 border border-white/5 rounded-3xl p-8">
            <h3 className="text-white font-bold text-lg mb-2">{t('Payment Methods')}</h3>
            <p className="text-gray-500 text-sm mb-6">{t('Manage cards and payment options used for subscriptions.')}</p>
            <div className="p-6 border border-dashed border-white/10 rounded-2xl flex flex-col items-center text-center gap-3">
              <CreditCard size={28} className="text-gray-600" />
              <p className="text-gray-500 text-sm">{t('No saved payment methods.')}</p>
              <p className="text-gray-600 text-xs">Payment methods are managed through Stripe and PayPal at checkout.</p>
            </div>
          </div>

          <div className="bg-brand-grey/30 border border-white/5 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">{t('Billing History')}</h3>
              <button onClick={() => { /* switch to earnings tab */ }}
                className="text-xs font-bold text-brand-green hover:underline"
              >View all in Financials →</button>
            </div>
            <p className="text-gray-500 text-sm">Your full transaction history is available in the <button onClick={() => {}} className="text-brand-green underline">Financials</button> tab.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const Profile: React.FC = () => {
  const t = useT();
  const { listings, addListing, refreshListings } = useData();
  const [searchParams] = useSearchParams();
  const connectResult = searchParams.get('connect');
  const initialTab = (searchParams.get('tab') as ActiveTab) || (connectResult ? 'settings' : 'listings');
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Local UI State
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread'>('all');
  const [skills, setSkills] = useState<string[]>([]);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Phone verification modal state
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'enter_phone' | 'enter_code'>('enter_phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const handleBoost = async (listingId: string) => {
    if (myCredits === 0) {
      alert('Sponsored boosts are available on Pro and Ultra plans.');
      return;
    }
    setBoostingId(listingId);
    try {
      const res = await API.boostListing(listingId);
      alert(`Listing boosted for 7 days! You have ${res.creditsRemaining} boost${res.creditsRemaining === 1 ? '' : 's'} remaining this month.`);
      await refreshListings();
    } catch (err: any) {
      alert(err.message || 'Failed to boost listing.');
    } finally {
      setBoostingId(null);
    }
  };

  // Creating Listing State
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    category: CATEGORIES[0],
    price: '',
    deliveryTime: '3 Days',
    description: '',
    includesInput: '',
  });
  const [includesList, setIncludesList] = useState<string[]>([]);

  // Portfolio state
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState('');
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
  const portfolioFileRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();

  // Boost state — must be after currentUser
  const [boostingId, setBoostingId] = useState<string | null>(null);
  const boostCredits = { free: 0, starter: 1, pro: 3, ultra: 10, enterprise: 10 };
  const myCredits = boostCredits[(currentUser?.tier || 'free') as keyof typeof boostCredits] ?? 0;

  const [transactions, setTransactions] = React.useState<any[]>([]);
  React.useEffect(() => {
    if (currentUser) {
      API.getTransactions().then(setTransactions).catch(() => {});
    }
  }, [currentUser?.id]);
  const availableBalance = transactions.filter(t => t.status === 'SUCCESS').reduce((s, t) => s + t.amount, 0);
  const pendingClearance = transactions.filter(t => t.status === 'PENDING').reduce((s, t) => s + t.amount, 0);

  // Sync local state from user data on mount / user change
  React.useEffect(() => {
    if (currentUser) {
      setSkills((currentUser as any).skills || []);
      setEditName(currentUser.name || '');
      setEditBio((currentUser as any).bio || '');
      setEditLocation((currentUser as any).location || '');
    }
  }, [currentUser?.id]);

  // Load portfolio when tab is active
  React.useEffect(() => {
    if (activeTab === 'portfolio' && currentUser?.id) {
      API.getPortfolio(currentUser.id).then(setPortfolioItems).catch(() => {});
    }
  }, [activeTab, currentUser?.id]);

  // Check auth status for rendering
  const creatorStatus = currentUser?.creatorStatus || 'none';
  const kycVerified = currentUser?.kycVerified ?? false;
  const canCreateListings = kycVerified || creatorStatus === 'approved';
  const subscriptionTier = currentUser?.tier || 'free';

  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  React.useEffect(() => {
    if (currentUser) {
      API.getConversations().then(convs => {
        setInboxMessages((Array.isArray(convs) ? convs : []).map(c => ({
          id: c.id,
          sender: c.other?.name ?? 'Unknown',
          avatar: c.other?.avatar,
          snippet: c.lastMessage || 'No messages yet',
          time: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString() : '',
          unread: c.unread > 0,
          conversationId: c.id,
        })));
      }).catch(() => {});
    }
  }, [currentUser?.id, activeTab]);

  const saveSkills = async (updated: string[]) => {
    if (!currentUser) return;
    try {
      await API.updateProfile(currentUser.id, { skills: updated } as any);
      updateUser({ skills: updated } as any);
    } catch {}
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      const updated = skills.includes(newSkill.trim()) ? skills : [...skills, newSkill.trim()];
      setSkills(updated);
      setNewSkill('');
      setShowSkillInput(false);
      saveSkills(updated);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const updated = skills.filter(s => s !== skill);
    setSkills(updated);
    saveSkills(updated);
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSavingProfile(true);
    try {
      const updated = await API.updateProfile(currentUser.id, { name: editName, bio: editBio, location: editLocation } as any);
      updateUser({ name: editName, bio: editBio, location: editLocation } as any);
      setIsEditingProfile(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleWithdraw = () => {
    if (availableBalance <= 0) return;
  };

  const handleDownloadReport = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert('Report empty. No transactions recorded.');
    }, 1500);
  };

  const handleVerifyContact = async (type: 'email' | 'mobile') => {
    if (!currentUser) return;
    if (type === 'email') {
      // Trigger re-send of verification email via backend
      await API.requestPasswordReset(currentUser.email).catch(() => {});
      alert('Verification email sent. Check your inbox.');
    } else {
      // Open phone verification modal
      setPhoneInput((currentUser as any).mobile || '');
      setOtpInput('');
      setPhoneError('');
      setPhoneStep('enter_phone');
      setIsPhoneModalOpen(true);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneInput.trim()) {
      setPhoneError('Please enter a valid phone number.');
      return;
    }
    setPhoneLoading(true);
    setPhoneError('');
    try {
      await API.sendPhoneOtp(phoneInput.trim());
      setPhoneStep('enter_code');
    } catch (err: any) {
      setPhoneError(err.message || 'Failed to send verification code.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput.trim()) {
      setPhoneError('Please enter the 6-digit code.');
      return;
    }
    setPhoneLoading(true);
    setPhoneError('');
    try {
      await API.verifyPhoneOtp(phoneInput.trim(), otpInput.trim());
      updateUser({ mobileVerified: true } as any);
      setIsPhoneModalOpen(false);
    } catch (err: any) {
      setPhoneError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleOpenMessage = (msg: any) => {
    navigate(`/messages/${msg.conversationId}`);
  };

  const handlePortfolioUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioTitle.trim()) {
      setPortfolioError('Title is required.');
      return;
    }
    setIsAddingPortfolio(true);
    setPortfolioError('');
    try {
      const formData = new FormData();
      formData.append('title', portfolioTitle.trim());
      if (portfolioDescription.trim()) formData.append('description', portfolioDescription.trim());
      if (portfolioFile) formData.append('file', portfolioFile);
      const newItem = await API.addPortfolioItem(formData);
      setPortfolioItems(prev => [newItem, ...prev]);
      setPortfolioTitle('');
      setPortfolioDescription('');
      setPortfolioFile(null);
      if (portfolioFileRef.current) portfolioFileRef.current.value = '';
    } catch (err: any) {
      setPortfolioError(err.message || 'Failed to add portfolio item.');
    } finally {
      setIsAddingPortfolio(false);
    }
  };

  const handlePortfolioDelete = async (itemId: string) => {
    try {
      await API.deletePortfolioItem(itemId);
      setPortfolioItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete item.');
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const randomImageId = Math.floor(Math.random() * 1000);
    const imageUrl = `https://picsum.photos/seed/${randomImageId}/800/600`;

    try {
      await addListing({
        title: newListing.title,
        description: newListing.description,
        category: newListing.category,
        price: parseInt(newListing.price) || 0,
        deliveryTime: newListing.deliveryTime,
        freelancerId: currentUser.id,
        freelancerName: currentUser.name,
        freelancerAvatar: currentUser.avatar || '',
        includes: includesList,
        rating: 0,
        reviewsCount: 0,
        imageUrl,
      });

      setIsCreatingListing(false);
      setIncludesList([]);
      setNewListing({
        title: '',
        category: CATEGORIES[0],
        price: '',
        deliveryTime: '3 Days',
        description: '',
        includesInput: '',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to create listing.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'listings':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* KYC / Verification Alert */}
            {!canCreateListings && creatorStatus !== 'pending' && (
              <div className="p-8 bg-brand-pink/10 border border-brand-pink/20 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-brand-pink/20 rounded-2xl text-brand-pink">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{t('Identity Verification Required')}</h4>
                    <p className="text-gray-400 text-sm font-medium">{t('All users must verify their identity to create listings and offer services.')}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/creator-onboarding')}
                  className="px-8 py-3 bg-brand-pink text-white font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-pink/20 shrink-0"
                >
                  {t('Verify Identity')}
                </button>
              </div>
            )}

            {creatorStatus === 'pending' && !kycVerified && (
              <div className="p-8 bg-yellow-500/5 border border-yellow-500/20 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-400 animate-pulse">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{t('Verification Under Review')}</h4>
                    <p className="text-gray-400 text-sm font-medium">{t('Your documents have been submitted and are being reviewed. This can take up to 24 hours. Listings will unlock once approved.')}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder={t('Search listings...')}
                  className="w-full bg-brand-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-green"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsCreatingListing(true)}
                  disabled={!canCreateListings}
                  className={`flex items-center space-x-2 px-6 py-3 font-black rounded-xl text-sm transition-all ${
                    canCreateListings
                    ? 'bg-brand-green text-brand-black hover:scale-105'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                  }`}
                >
                  <PlusCircle size={18} />
                  <span>{t('Create New')}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {listings.filter(l => l.freelancerId === currentUser?.id).length === 0 ? (
                <div className="text-center py-20 bg-brand-grey/20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                  <p className="text-gray-500 font-bold mb-4">{t('You have no active listings.')}</p>
                  {canCreateListings && (
                     <button onClick={() => setIsCreatingListing(true)} className="text-brand-pink font-black hover:underline">{t('Create your first gig')}</button>
                  )}
                </div>
              ) : listings.filter(l => l.freelancerId === currentUser?.id && l.title.toLowerCase().includes(searchQuery.toLowerCase())).map((listing) => (
                <div key={listing.id} className={`group bg-brand-grey/30 border border-white/5 rounded-3xl p-6 transition-all hover:border-brand-green/30`}>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <img src={listing.imageUrl} className="w-24 h-24 rounded-2xl object-cover border border-white/10" alt="" />
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-lg font-bold text-white group-hover:text-brand-green transition-colors">{listing.title}</h4>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{listing.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Boost button */}
                          {myCredits > 0 && (
                            listing.isSponsored ? (
                              <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-400/10 border border-amber-400/30 rounded-lg text-amber-400 text-[10px] font-black uppercase tracking-wider">
                                <Zap size={10} /> Boosted · {new Date(listing.boostedUntil!).toLocaleDateString()}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleBoost(listing.id)}
                                disabled={boostingId === listing.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 hover:border-amber-400/50 rounded-lg text-amber-400 text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                                title={`Boost for 7 days (${myCredits} credit${myCredits === 1 ? '' : 's'} remaining)`}
                              >
                                {boostingId === listing.id ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                                Boost
                              </button>
                            )
                          )}
                          <button className="p-2 text-gray-500 hover:text-white transition-colors" title="Edit"><Edit2 size={16} /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{t('Impressions')}</span>
                          <span className="text-white font-bold flex items-center">
                            0 <TrendingUp size={12} className="text-gray-500 ml-1" />
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{t('Price')}</span>
                          <span className="text-brand-green font-bold">€{listing.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'inbox':
        // ... (Existing Inbox Logic)
        return selectedMessage ? (
          <div className="bg-brand-grey/30 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-[600px] animate-in slide-in-from-right-10 duration-500">
             <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button onClick={() => setSelectedMessage(null)} className="p-2 text-gray-500 hover:text-white"><X size={20} /></button>
                  {selectedMessage.avatar ? (
                    <img src={selectedMessage.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-black border border-white/10 flex items-center justify-center"><UserIcon size={16} className="text-gray-500"/></div>
                  )}
                  <div>
                    <h4 className="text-white font-bold text-sm">{selectedMessage.sender}</h4>
                    <p className="text-gray-500 text-xs">{selectedMessage.subject}</p>
                  </div>
                </div>
                <button className="p-2 text-gray-500 hover:text-white"><MoreHorizontal size={20} /></button>
             </div>
             <div className="flex-grow p-8 overflow-y-auto space-y-6">
                {selectedMessage.messages.map((m: any, idx: number) => (
                  <div key={idx} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${m.from === 'me' ? 'bg-brand-green text-brand-black font-bold' : 'bg-white/5 text-gray-300'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="bg-brand-grey/30 border border-white/5 rounded-[2.5rem] overflow-hidden animate-in fade-in duration-500">
            <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{t('Direct Messages')}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setInboxFilter('all')}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${inboxFilter === 'all' ? 'bg-brand-green text-brand-black' : 'text-gray-500 hover:bg-white/5'}`}
                >{t('All Messages')}</button>
                <button
                  onClick={() => setInboxFilter('unread')}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${inboxFilter === 'unread' ? 'bg-brand-pink text-white' : 'text-gray-500 hover:bg-white/5'}`}
                >{t('Unread')}</button>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {inboxMessages.filter(m => inboxFilter === 'all' || m.unread).map((msg) => (
                <button key={msg.id} onClick={() => handleOpenMessage(msg)} className="w-full text-left p-6 hover:bg-white/[0.03] transition-colors flex items-center gap-6 group">
                  <div className="relative flex-shrink-0">
                    {msg.avatar ? (
                        <img src={msg.avatar} className="w-12 h-12 rounded-full border border-white/10" alt="" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-brand-black border border-white/10 flex items-center justify-center"><UserIcon size={24} className="text-gray-500"/></div>
                    )}
                    {msg.unread && <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-pink rounded-full border-4 border-brand-grey"></div>}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm ${msg.unread ? 'text-white font-bold' : 'text-gray-400'}`}>{msg.sender}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">{msg.time}</span>
                    </div>
                    <h5 className={`text-sm truncate ${msg.unread ? 'text-brand-green font-bold' : 'text-gray-500'}`}>{msg.subject}</h5>
                    <p className="text-xs text-gray-600 truncate mt-1">{msg.snippet}</p>
                  </div>
                  <MoreVertical size={16} className="text-gray-700 group-hover:text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        );
      case 'earnings':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 bg-brand-grey/30 border border-white/10 rounded-3xl">
                <div className="flex items-center space-x-3 text-gray-500 mb-4">
                  <CreditCard size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">{t('Available')}</span>
                </div>
                <h3 className="text-4xl font-black text-white mb-2">€{availableBalance}<span className="text-gray-600">.00</span></h3>
                <button
                  onClick={handleWithdraw}
                  disabled={availableBalance <= 0}
                  className="w-full mt-4 py-3 bg-brand-green text-brand-black font-black rounded-xl text-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(74,222,128,0.2)]"
                >
                  {t('Withdraw Now')}
                </button>
              </div>
              <div className="p-8 bg-brand-grey/30 border border-white/10 rounded-3xl">
                <div className="flex items-center space-x-3 text-gray-500 mb-4">
                  <Clock size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">{t('Pending')}</span>
                </div>
                <h3 className="text-4xl font-black text-gray-400 mb-2">€{pendingClearance}<span className="text-gray-600">.00</span></h3>
                <p className="text-[10px] text-brand-pink font-bold uppercase tracking-widest mt-4 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> {t('No active pending funds')}
                </p>
              </div>
              <div className="p-8 bg-brand-grey/30 border border-white/10 rounded-3xl">
                <div className="flex items-center space-x-3 text-gray-500 mb-4">
                  <TrendingUp size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">{t('Total Income')}</span>
                </div>
                <h3 className="text-4xl font-black text-brand-green mb-2">€{(availableBalance + pendingClearance).toFixed(0)}<span className="text-gray-600">.00</span></h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-white font-bold">{t('Transaction History')}</h3>
                <div className="flex space-x-3">
                   <button
                    onClick={handleDownloadReport}
                    className="flex items-center space-x-2 text-xs font-bold text-brand-pink hover:text-white transition-colors"
                  >
                    {isDownloading ? <span className="animate-pulse">{t('Generating...')}</span> : <><Download size={14} /> <span>{t('Download Report')}</span></>}
                  </button>
                </div>
              </div>
              {transactions.length === 0 ? (
                <div className="p-20 text-center text-gray-600 italic text-sm">{t('No transactions yet.')}</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-widest">
                      <th className="px-6 py-3 font-bold">{t('Date')}</th>
                      <th className="px-6 py-3 font-bold">{t('Plan')}</th>
                      <th className="px-6 py-3 font-bold">{t('Amount')}</th>
                      <th className="px-6 py-3 font-bold">{t('Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-white font-medium capitalize">{tx.plan}</td>
                        <td className="px-6 py-4 text-brand-green font-bold">€{tx.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            tx.status === 'SUCCESS' ? 'bg-brand-green/10 text-brand-green' :
                            tx.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>{tx.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      case 'portfolio':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Upload Form */}
            <div className="bg-brand-grey/60 border border-white/10 rounded-[2rem] p-8">
              <h3 className="text-xl font-bold text-white mb-6">{t('Add Portfolio Item')}</h3>
              <form onSubmit={handlePortfolioUpload} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Title *</label>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={portfolioTitle}
                    onChange={e => setPortfolioTitle(e.target.value)}
                    placeholder="e.g. E-commerce UX Redesign"
                    className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Description</label>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={portfolioDescription}
                    onChange={e => setPortfolioDescription(e.target.value)}
                    placeholder="Briefly describe this work..."
                    className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white resize-none focus:outline-none focus:border-brand-green transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Image / PDF (max 10MB)</label>
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="flex-grow bg-brand-black border border-white/10 border-dashed rounded-xl py-4 px-5 text-sm text-gray-500 group-hover:border-brand-green group-hover:text-gray-300 transition-all flex items-center gap-3">
                      <Upload size={18} />
                      <span>{portfolioFile ? portfolioFile.name : 'Choose file or drag here'}</span>
                    </div>
                    <input
                      ref={portfolioFileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={e => setPortfolioFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                {portfolioError && (
                  <p className="text-brand-pink text-sm font-medium">{portfolioError}</p>
                )}
                <button
                  type="submit"
                  disabled={isAddingPortfolio || !portfolioTitle.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-green text-brand-black font-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isAddingPortfolio ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                  <span>Add Item</span>
                </button>
              </form>
            </div>

            {/* Portfolio Grid */}
            {portfolioItems.length === 0 ? (
              <div className="text-center py-20 bg-brand-grey/20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <ImageIcon size={40} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-bold">{t('No portfolio items yet. Add your first piece above.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map(item => (
                  <div key={item.id} className="group bg-brand-grey/30 border border-white/5 rounded-2xl overflow-hidden hover:border-brand-green/30 transition-all">
                    {item.imageUrl && (
                      <div className="aspect-video bg-brand-black overflow-hidden">
                        <img
                          src={`${import.meta.env.VITE_CRM_API_BASE || 'https://api.cenner.hr'}${item.imageUrl}`}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    {!item.imageUrl && item.fileUrl && (
                      <div className="aspect-video bg-brand-black flex items-center justify-center">
                        <ExternalLink size={32} className="text-gray-600" />
                      </div>
                    )}
                    <div className="p-5">
                      <h4 className="text-white font-bold text-sm mb-1 truncate">{item.title}</h4>
                      {item.description && (
                        <p className="text-gray-500 text-xs line-clamp-2">{item.description}</p>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        {item.fileUrl && (
                          <a
                            href={`${import.meta.env.VITE_CRM_API_BASE || 'https://api.cenner.hr'}${item.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-brand-green hover:underline flex items-center gap-1"
                          >
                            <ExternalLink size={10} /> {t('View File')}
                          </a>
                        )}
                        <button
                          onClick={() => handlePortfolioDelete(item.id)}
                          className="ml-auto p-2 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'settings':
        return <SettingsTab currentUser={currentUser} updateUser={updateUser} navigate={navigate} initialSection={(searchParams.get('section') as any) || (connectResult ? 'billing' : 'account')} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      {/* Phone Verification Modal */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-brand-grey border border-white/10 rounded-[3rem] p-10 relative">
            <button
              onClick={() => setIsPhoneModalOpen(false)}
              className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
            >
              <X size={22} />
            </button>

            {phoneStep === 'enter_phone' ? (
              <>
                <div className="mb-8">
                  <div className="inline-flex p-3 bg-brand-green/10 rounded-2xl text-brand-green mb-4">
                    <Smartphone size={28} />
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">{t('Verify Mobile')}</h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Enter your phone number in international format. We'll send a 6-digit code.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      {t('Phone Number')}
                    </label>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value)}
                      placeholder="+385993525500"
                      className="w-full bg-brand-black border border-white/10 rounded-xl py-4 px-5 text-white text-lg tracking-wider focus:outline-none focus:border-brand-green transition-colors"
                    />
                    <p className="text-[10px] text-gray-600">Include country code, e.g. +1 for US, +385 for Croatia</p>
                  </div>

                  {phoneError && (
                    <p className="text-brand-pink text-sm font-medium">{phoneError}</p>
                  )}

                  <button
                    onClick={handleSendOtp}
                    disabled={phoneLoading || !phoneInput.trim()}
                    className="w-full py-4 bg-brand-green text-brand-black font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {phoneLoading ? 'Sending…' : t('Send Verification Code')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <div className="inline-flex p-3 bg-brand-green/10 rounded-2xl text-brand-green mb-4">
                    <CheckCircle size={28} />
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">{t('Enter Code')}</h2>
                  <p className="text-gray-400 text-sm mt-2">
                    A 6-digit code was sent to <span className="text-white font-bold">{phoneInput}</span>.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpInput}
                      onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="_ _ _ _ _ _"
                      className="w-full bg-brand-black border border-white/10 rounded-xl py-4 px-5 text-white text-2xl tracking-[0.5em] text-center font-black focus:outline-none focus:border-brand-green transition-colors"
                    />
                  </div>

                  {phoneError && (
                    <p className="text-brand-pink text-sm font-medium">{phoneError}</p>
                  )}

                  <button
                    onClick={handleVerifyOtp}
                    disabled={phoneLoading || otpInput.length < 6}
                    className="w-full py-4 bg-brand-green text-brand-black font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {phoneLoading ? 'Verifying…' : t('Verify Number')}
                  </button>

                  <button
                    onClick={() => { setPhoneStep('enter_phone'); setPhoneError(''); setOtpInput(''); }}
                    className="w-full py-3 text-gray-500 hover:text-white text-sm font-bold transition-colors"
                  >
                    ← Change number / Resend code
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {isCreatingListing && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-brand-grey border border-white/10 rounded-[3rem] p-10 relative overflow-y-auto max-h-[90vh] custom-scrollbar">
              <button onClick={() => setIsCreatingListing(false)} className="absolute top-10 right-10 text-gray-500 hover:text-white"><X size={24} /></button>
              <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">{t('Create Service Node')}</h2>
              <p className="text-gray-500 mb-8">Define your service parameters for the marketplace.</p>

              <form onSubmit={handleCreateListing} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Service Title')}</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. High-Fidelity UI Design for FinTech"
                    className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green"
                    value={newListing.title}
                    onChange={e => setNewListing({...newListing, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
                    <select
                      className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green appearance-none"
                      value={newListing.category}
                      onChange={e => setNewListing({...newListing, category: e.target.value})}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Base Price (€)')}</label>
                    <input
                      required
                      type="number"
                      placeholder="1500"
                      className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green"
                      value={newListing.price}
                      onChange={e => setNewListing({...newListing, price: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Delivery Time')}</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 5 Days"
                    className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green"
                    value={newListing.deliveryTime}
                    onChange={e => setNewListing({...newListing, deliveryTime: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Description</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your service methodology and deliverables..."
                    className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white resize-none focus:outline-none focus:border-brand-green"
                    value={newListing.description}
                    onChange={e => setNewListing({...newListing, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">What's Included</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Source Files, 2 Revisions…"
                      className="flex-1 bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-green text-sm"
                      value={newListing.includesInput}
                      onChange={e => setNewListing({...newListing, includesInput: e.target.value})}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = newListing.includesInput.trim();
                          if (val && includesList.length < 10) {
                            setIncludesList(prev => [...prev, val]);
                            setNewListing(prev => ({...prev, includesInput: ''}));
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newListing.includesInput.trim();
                        if (val && includesList.length < 10) {
                          setIncludesList(prev => [...prev, val]);
                          setNewListing(prev => ({...prev, includesInput: ''}));
                        }
                      }}
                      className="px-4 py-3 bg-brand-green text-brand-black font-bold rounded-xl text-sm hover:scale-105 transition-transform"
                    >
                      Add
                    </button>
                  </div>
                  {includesList.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {includesList.map((item, i) => (
                        <span key={i} className="flex items-center gap-1.5 bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs px-3 py-1.5 rounded-lg">
                          {item}
                          <button type="button" onClick={() => setIncludesList(prev => prev.filter((_, j) => j !== i))} className="text-brand-green/60 hover:text-brand-green">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-brand-black/50 rounded-xl border border-white/10 flex items-center space-x-4">
                  <div className="p-3 bg-white/5 rounded-lg text-brand-green">
                    <ImageIcon size={20} />
                  </div>
                  <p className="text-xs text-gray-500">A high-quality abstract cover image will be generated for your listing automatically.</p>
                </div>

                <button type="submit" className="w-full py-4 bg-brand-green text-brand-black font-black rounded-xl hover:scale-[1.02] transition-all">
                  {t('Publish Listing')}
                </button>
              </form>
           </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-brand-grey border border-white/10 rounded-[3rem] p-10 relative">
              <button onClick={() => setIsEditingProfile(false)} className="absolute top-10 right-10 text-gray-500 hover:text-white"><X size={24} /></button>
              <h2 className="text-4xl font-black text-white mb-10 tracking-tighter">{t('Edit Your Identity')}</h2>
              <div className="space-y-8">
                <div className="flex items-center space-x-8">
                  <div className="relative">
                    {currentUser?.avatar ? (
                        <img src={currentUser?.avatar} className="w-24 h-24 rounded-full border-4 border-brand-green" alt="" />
                    ) : (
                        <div className="w-24 h-24 rounded-full border-4 border-brand-green bg-brand-black flex items-center justify-center">
                            <UserIcon size={40} className="text-brand-green"/>
                        </div>
                    )}
                    <button className="absolute bottom-0 right-0 p-2 bg-brand-pink text-white rounded-full"><Edit2 size={12} /></button>
                  </div>
                  <div className="flex-grow space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Display Name')}</label>
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Professional Bio')}</label>
                  <textarea rows={4} value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Write a short bio to introduce yourself..." className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white resize-none"></textarea>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Location')}</label>
                  <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="e.g. Zagreb, Croatia" className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white" />
                </div>
                <button onClick={handleSaveProfile} disabled={isSavingProfile} className="w-full py-4 bg-brand-green text-brand-black font-black rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50">{isSavingProfile ? 'Saving...' : t('Update Profile')}</button>
              </div>
           </div>
        </div>
      )}

      {/* Seller Dashboard Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: t('Response Rate'), value: `N/A`, color: "text-gray-500" },
          { label: t('Delivered on Time'), value: `N/A`, color: "text-gray-500" },
          { label: t('Order Completion'), value: `N/A`, color: "text-gray-500" },
          { label: t('Avg. Rating'), value: `0.0`, color: "text-gray-500", sub: `(No Reviews Yet)` },
        ].map((stat, i) => (
          <div key={i} className="bg-brand-grey/40 border border-white/5 rounded-2xl p-6 text-center">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            {stat.sub && <p className="text-[10px] text-gray-600 mt-1">{stat.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
        {/* Navigation & Micro-management Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-brand-grey/50 border border-white/10 rounded-[2.5rem] p-8 text-center relative overflow-hidden group">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-brand-green/10 rounded-full blur-3xl"></div>
            <div className="relative inline-block mb-6">
              {currentUser?.avatar ? (
                <img
                    src={currentUser.avatar}
                    alt="Profile"
                    loading="eager"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    className="w-32 h-32 rounded-full border-4 border-brand-green p-1 group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-brand-green p-1 group-hover:scale-105 transition-transform duration-500 bg-brand-black flex items-center justify-center">
                    <UserIcon size={64} className="text-brand-green"/>
                </div>
              )}
              {canCreateListings && (
                <div className="absolute bottom-1 right-1 w-8 h-8 flex items-center justify-center drop-shadow-lg">
                  <BadgeCheck size={32} className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" fill="#1a1a1a" strokeWidth={1.5} />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{currentUser?.name || "New Member"}</h2>
            <div className="flex flex-col items-center">
              <p className={`text-sm font-bold uppercase tracking-widest mb-2 ${
                  subscriptionTier === 'ultra' ? 'text-brand-pink' :
                  subscriptionTier === 'pro' ? 'text-brand-green' : 'text-gray-500'
              }`}>
                  {subscriptionTier} Node
              </p>

              {canCreateListings ? (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-brand-green/10 text-brand-green text-[9px] font-black uppercase tracking-widest rounded-full mb-6">
                  <ShieldCheck size={10} />
                  <span>Identity Verified</span>
                </span>
              ) : creatorStatus === 'pending' ? (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-500/10 text-yellow-400 text-[9px] font-black uppercase tracking-widest rounded-full mb-6 animate-pulse">
                  <Clock size={10} />
                  <span>Under Review</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-brand-pink/10 text-brand-pink text-[9px] font-black uppercase tracking-widest rounded-full mb-6">
                  <ShieldAlert size={10} />
                  <span>{t('Unverified')}</span>
                </span>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => setIsEditingProfile(true)}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-sm hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
              >
                <Edit2 size={16} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* CRM Data Section - Visualized */}
          <div className="bg-brand-grey/50 border border-white/10 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Protocol Status</h4>
              <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <Mail size={16} />
                        <span>Email Protocol</span>
                    </div>
                    {currentUser?.emailVerified ? (
                        <CheckCircle size={16} className="text-brand-green" />
                    ) : (
                        <button onClick={() => handleVerifyContact('email')} className="text-[10px] font-bold text-brand-pink hover:underline">Verify</button>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <Smartphone size={16} />
                        <span>Mobile Node</span>
                    </div>
                    {currentUser?.mobileVerified ? (
                        <CheckCircle size={16} className="text-brand-green" />
                    ) : (
                        <button onClick={() => handleVerifyContact('mobile')} className="text-[10px] font-bold text-brand-pink hover:underline">Verify</button>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <ShieldCheck size={16} />
                        <span>KYC</span>
                    </div>
                    {canCreateListings ? (
                        <CheckCircle size={16} className="text-brand-green" />
                    ) : (
                        <button onClick={() => navigate('/creator-onboarding')} className="text-[10px] font-bold text-brand-pink hover:underline">Verify</button>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <Crown size={16} />
                        <span>Sub Level</span>
                    </div>
                    <span className="text-[10px] font-bold text-white uppercase bg-white/10 px-2 py-0.5 rounded">{subscriptionTier}</span>
                </div>
            </div>
          </div>

          <div className="bg-brand-grey/50 border border-white/10 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Workspace</h4>
            </div>
            <nav className="flex flex-col">
              {[
                { id: 'listings', icon: <Briefcase size={18} />, label: t('Manage Listings') },
                { id: 'portfolio', icon: <ImageIcon size={18} />, label: t('Portfolio') },
                { id: 'inbox', icon: <MessageSquare size={18} />, label: t('Messages'), badge: inboxMessages.filter(m => m.unread).length },
                { id: 'earnings', icon: <CreditCard size={18} />, label: t('Financials') },
                { id: 'settings', icon: <Settings size={18} />, label: t('Settings') },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as ActiveTab); setSelectedMessage(null); }}
                  className={`flex items-center justify-between px-8 py-5 text-sm font-medium transition-all border-l-4 ${
                    activeTab === item.id
                      ? 'bg-brand-green/5 border-brand-green text-brand-green'
                      : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="w-5 h-5 rounded-full bg-brand-pink text-white text-[10px] flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-3">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
              <p className="text-gray-500 mt-1">Real-time performance metrics and operations.</p>
            </div>
            <div className="hidden sm:flex items-center space-x-4 text-xs font-bold text-gray-500">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-brand-green mr-2 animate-pulse"></span> {t('System Online')}</span>
            </div>
          </div>

          {/* About Box */}
          <div className="mb-8 bg-brand-grey/30 border border-white/5 rounded-2xl p-6">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">{t('About')}</h3>

            {/* Bio */}
            {(currentUser as any)?.bio ? (
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">{(currentUser as any).bio}</p>
            ) : (
              <p className="text-gray-600 text-sm italic mb-4">
                {t('No bio yet. Add one')}{' '}
                <button onClick={() => setIsEditingProfile(true)} className="text-brand-pink hover:underline font-bold not-italic">Add one</button>
              </p>
            )}

            {/* Location */}
            {(currentUser as any)?.location && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <MapPin size={13} className="text-gray-600 shrink-0" />
                <span>{(currentUser as any).location}</span>
              </div>
            )}

            {/* Active Skills */}
            {(skills.length > 0 || showSkillInput) && (
              <div className="mt-2 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Skills')}</span>
                  <button onClick={() => setShowSkillInput(true)} className="text-brand-pink hover:text-white transition-colors">
                    <PlusCircle size={13} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => handleRemoveSkill(skill)}
                      className="group relative px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 font-bold hover:border-red-500/50 hover:text-red-500 transition-all cursor-pointer"
                    >
                      <span className="group-hover:opacity-0 transition-opacity">{skill}</span>
                      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"><Trash2 size={10} /></span>
                    </button>
                  ))}
                  {showSkillInput && (
                    <input
                      autoFocus
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={handleAddSkill}
                      onBlur={() => setShowSkillInput(false)}
                      placeholder="Type & Enter..."
                      className="bg-brand-black border border-brand-green/30 rounded-full text-[10px] text-white px-3 py-1 focus:outline-none focus:border-brand-green w-24"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Show skill input trigger when no skills yet */}
            {skills.length === 0 && !showSkillInput && (
              <button
                onClick={() => setShowSkillInput(true)}
                className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-600 hover:text-brand-pink transition-colors font-bold uppercase tracking-widest"
              >
                <PlusCircle size={11} /> {t('Add skills')}
              </button>
            )}
          </div>

          {renderTabContent()}

          {/* Detailed Activity Log */}
          <section className="mt-12 bg-brand-grey/40 border border-white/5 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white">{t('Neural Activity Log')}</h3>
            </div>
            <div className="space-y-6">
              {[
                { type: 'onboarding', text: 'Account successfully initialized on the Cenner Protocol', time: 'Just now', color: 'bg-brand-green' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start space-x-5 group cursor-default">
                  <div className={`mt-1.5 w-2 h-2 rounded-full ${activity.color} group-hover:scale-150 transition-transform`}></div>
                  <div className="flex-grow border-b border-white/5 pb-4 last:border-0">
                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-white transition-colors">{activity.text}</p>
                    <p className="text-[10px] text-gray-600 mt-1 font-black uppercase tracking-tighter">{activity.time}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-gray-800 group-hover:text-gray-500 transition-colors" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
