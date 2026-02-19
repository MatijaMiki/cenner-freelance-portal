
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, CreditCard, MessageSquare, Briefcase, PlusCircle, 
  TrendingUp, Clock, CheckCircle, AlertCircle, MoreVertical, 
  MoreHorizontal, Edit2, Pause, Trash2, ArrowUpRight, Search, 
  Calendar, X, Send, Download, User as UserIcon, ShieldAlert, Rocket, Play, Image as ImageIcon, Smartphone, Mail, Crown, Zap, Globe
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { useData } from '../contexts/DataContext';
import { CATEGORIES } from '../constants';
import { CRM_API } from '../lib/crm';

type ActiveTab = 'listings' | 'inbox' | 'earnings' | 'settings';

const Profile: React.FC = () => {
  const { listings, addListing } = useData();
  const [activeTab, setActiveTab] = useState<ActiveTab>('listings');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local UI State
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread'>('all');
  const [skills, setSkills] = useState<string[]>([]);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Creating Listing State
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    category: CATEGORIES[0],
    price: '',
    deliveryTime: '3 Days',
    description: ''
  });

  const availableBalance = 0;
  const pendingClearance = 0;
  
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  
  // Check auth status for rendering
  const creatorStatus = currentUser?.creatorStatus || 'none';
  const subscriptionTier = currentUser?.subscriptionTier || 'free';

  const [inboxMessages, setInboxMessages] = useState([
    { 
      id: 1, 
      sender: "Cenner System", 
      subject: "Protocol Initialization", 
      snippet: "Welcome to the elite network. Your node is active...", 
      time: "Now", 
      unread: true, 
      avatar: "", // Empty for default icon
      messages: [{ from: 'them', text: 'Welcome. Your identity has been established on the blockchain. To begin trading services, verify your creator status or browse the marketplace.' }] 
    }
  ]);

  const transactions: any[] = [];

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill('');
      setShowSkillInput(false);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
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
      if (currentUser) {
          await CRM_API.verifyContact(currentUser.uid, type);
          // Force refresh would be needed here in a real app, but for mock assume it worked
          alert(`Verification signal sent for ${type}. Check CRM logs.`);
      }
  };

  const handleOpenMessage = (msg: any) => {
    setSelectedMessage(msg);
    setInboxMessages(prev => prev.map(m => m.id === msg.id ? { ...m, unread: false } : m));
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Generate a semi-random abstract image for the listing
    const randomImageId = Math.floor(Math.random() * 1000);
    const imageUrl = `https://picsum.photos/seed/${randomImageId}/800/600`;

    addListing({
      id: `listing-${Date.now()}`,
      title: newListing.title,
      description: newListing.description,
      category: newListing.category,
      price: parseInt(newListing.price) || 0,
      deliveryTime: newListing.deliveryTime,
      freelancerId: currentUser.uid,
      freelancerName: currentUser.displayName || 'Anonymous',
      freelancerAvatar: currentUser.photoURL || '',
      rating: 0, // New listings start with no ratings
      reviewsCount: 0,
      imageUrl: imageUrl
    });

    setIsCreatingListing(false);
    setNewListing({
      title: '',
      category: CATEGORIES[0],
      price: '',
      deliveryTime: '3 Days',
      description: ''
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'listings':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Creator Verification Alert */}
            {creatorStatus === 'none' && (
              <div className="p-8 bg-brand-pink/10 border border-brand-pink/20 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-brand-pink/20 rounded-2xl text-brand-pink">
                    <Rocket size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Ready to sell?</h4>
                    <p className="text-gray-400 text-sm font-medium">Complete your creator onboarding to start offering services to our global network.</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/creator-onboarding')}
                  className="px-8 py-3 bg-brand-pink text-white font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-pink/20 shrink-0"
                >
                  Start Verification
                </button>
              </div>
            )}

            {creatorStatus === 'pending' && (
              <div className="p-8 bg-brand-green/5 border border-brand-green/10 rounded-[2rem] flex items-center space-x-4 mb-8">
                <div className="p-3 bg-brand-green/10 rounded-2xl text-brand-green animate-pulse">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">Neural Review in Progress</h4>
                  <p className="text-gray-400 text-sm font-medium">Your portfolio is being verified. Creation of new listings is temporarily locked.</p>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search listings..." 
                  className="w-full bg-brand-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-green"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setIsCreatingListing(true)}
                  disabled={creatorStatus !== 'approved'}
                  className={`flex items-center space-x-2 px-6 py-3 font-black rounded-xl text-sm transition-all ${
                    creatorStatus === 'approved' 
                    ? 'bg-brand-green text-brand-black hover:scale-105' 
                    : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                  }`}
                >
                  <PlusCircle size={18} />
                  <span>Create New</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {listings.filter(l => l.freelancerId === currentUser?.uid).length === 0 ? (
                <div className="text-center py-20 bg-brand-grey/20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                  <p className="text-gray-500 font-bold mb-4">You have no active listings.</p>
                  {creatorStatus === 'approved' && (
                     <button onClick={() => setIsCreatingListing(true)} className="text-brand-pink font-black hover:underline">Create your first gig</button>
                  )}
                </div>
              ) : listings.filter(l => l.freelancerId === currentUser?.uid && l.title.toLowerCase().includes(searchQuery.toLowerCase())).map((listing) => (
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
                           <button className="p-2 text-gray-500 hover:text-white transition-colors" title="Edit"><Edit2 size={16} /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Impressions</span>
                          <span className="text-white font-bold flex items-center">
                            0 <TrendingUp size={12} className="text-gray-500 ml-1" />
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Price</span>
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
             <div className="p-6 bg-brand-black/20 border-t border-white/5">
                <div className="relative">
                  <input type="text" placeholder="Type your reply..." className="w-full bg-brand-black/50 border border-white/10 rounded-xl py-4 pl-6 pr-14 text-white focus:outline-none focus:border-brand-green" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-brand-pink text-white rounded-lg hover:scale-105 transition-all"><Send size={18} /></button>
                </div>
             </div>
          </div>
        ) : (
          <div className="bg-brand-grey/30 border border-white/5 rounded-[2.5rem] overflow-hidden animate-in fade-in duration-500">
            <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Direct Messages</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setInboxFilter('all')}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${inboxFilter === 'all' ? 'bg-brand-green text-brand-black' : 'text-gray-500 hover:bg-white/5'}`}
                >All Messages</button>
                <button 
                  onClick={() => setInboxFilter('unread')}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${inboxFilter === 'unread' ? 'bg-brand-pink text-white' : 'text-gray-500 hover:bg-white/5'}`}
                >Unread</button>
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
                  <span className="text-xs font-bold uppercase tracking-widest">Available</span>
                </div>
                <h3 className="text-4xl font-black text-white mb-2">€{availableBalance}<span className="text-gray-600">.00</span></h3>
                <button 
                  onClick={handleWithdraw}
                  disabled={availableBalance <= 0}
                  className="w-full mt-4 py-3 bg-brand-green text-brand-black font-black rounded-xl text-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(74,222,128,0.2)]"
                >
                  Withdraw Now
                </button>
              </div>
              <div className="p-8 bg-brand-grey/30 border border-white/10 rounded-3xl">
                <div className="flex items-center space-x-3 text-gray-500 mb-4">
                  <Clock size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Pending</span>
                </div>
                <h3 className="text-4xl font-black text-gray-400 mb-2">€{pendingClearance}<span className="text-gray-600">.00</span></h3>
                <p className="text-[10px] text-brand-pink font-bold uppercase tracking-widest mt-4 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> No active pending funds
                </p>
              </div>
              <div className="p-8 bg-brand-grey/30 border border-white/10 rounded-3xl">
                <div className="flex items-center space-x-3 text-gray-500 mb-4">
                  <TrendingUp size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Total Income</span>
                </div>
                <h3 className="text-4xl font-black text-brand-green mb-2">€0<span className="text-gray-600">.00</span></h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">New Account Milestone</p>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-white font-bold">Transaction History</h3>
                <div className="flex space-x-3">
                   <button 
                    onClick={handleDownloadReport}
                    className="flex items-center space-x-2 text-xs font-bold text-brand-pink hover:text-white transition-colors"
                  >
                    {isDownloading ? <span className="animate-pulse">Generating...</span> : <><Download size={14} /> <span>Download Report</span></>}
                  </button>
                </div>
              </div>
              {transactions.length === 0 ? (
                <div className="p-20 text-center text-gray-600 italic text-sm">No transaction data available yet.</div>
              ) : (
                <table className="w-full text-left">
                  {/* Empty state handles this */}
                </table>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Create Listing Modal */}
      {isCreatingListing && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-brand-grey border border-white/10 rounded-[3rem] p-10 relative overflow-y-auto max-h-[90vh] custom-scrollbar">
              <button onClick={() => setIsCreatingListing(false)} className="absolute top-10 right-10 text-gray-500 hover:text-white"><X size={24} /></button>
              <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">Create Service Node</h2>
              <p className="text-gray-500 mb-8">Define your service parameters for the marketplace.</p>
              
              <form onSubmit={handleCreateListing} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Service Title</label>
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
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Base Price (€)</label>
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
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Delivery Time</label>
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

                <div className="p-4 bg-brand-black/50 rounded-xl border border-white/10 flex items-center space-x-4">
                  <div className="p-3 bg-white/5 rounded-lg text-brand-green">
                    <ImageIcon size={20} />
                  </div>
                  <p className="text-xs text-gray-500">A high-quality abstract cover image will be generated for your listing automatically.</p>
                </div>

                <button type="submit" className="w-full py-4 bg-brand-green text-brand-black font-black rounded-xl hover:scale-[1.02] transition-all">
                  Publish Listing
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
              <h2 className="text-4xl font-black text-white mb-10 tracking-tighter">Edit Your Identity</h2>
              <div className="space-y-8">
                <div className="flex items-center space-x-8">
                  <div className="relative">
                    {currentUser?.photoURL ? (
                        <img src={currentUser?.photoURL} className="w-24 h-24 rounded-full border-4 border-brand-green" alt="" />
                    ) : (
                        <div className="w-24 h-24 rounded-full border-4 border-brand-green bg-brand-black flex items-center justify-center">
                            <UserIcon size={40} className="text-brand-green"/>
                        </div>
                    )}
                    <button className="absolute bottom-0 right-0 p-2 bg-brand-pink text-white rounded-full"><Edit2 size={12} /></button>
                  </div>
                  <div className="flex-grow space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Display Name</label>
                      <input type="text" defaultValue={currentUser?.displayName || "New User"} className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Professional Bio</label>
                  <textarea rows={4} className="w-full bg-brand-black border border-white/10 rounded-xl py-3 px-4 text-white resize-none" defaultValue="Write a short bio to introduce yourself..."></textarea>
                </div>
                <button onClick={() => setIsEditingProfile(false)} className="w-full py-4 bg-brand-green text-brand-black font-black rounded-xl hover:scale-[1.02] transition-all">Update Profile</button>
              </div>
           </div>
        </div>
      )}

      {/* Seller Dashboard Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Response Rate", value: `N/A`, color: "text-gray-500" },
          { label: "Delivered on Time", value: `N/A`, color: "text-gray-500" },
          { label: "Order Completion", value: `N/A`, color: "text-gray-500" },
          { label: "Avg. Rating", value: `0.0`, color: "text-gray-500", sub: `(No Reviews Yet)` },
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
              {currentUser?.photoURL ? (
                <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-brand-green p-1 group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-brand-green p-1 group-hover:scale-105 transition-transform duration-500 bg-brand-black flex items-center justify-center">
                    <UserIcon size={64} className="text-brand-green"/>
                </div>
              )}
              <div className="absolute bottom-1 right-1 w-7 h-7 bg-brand-green rounded-full border-4 border-brand-black flex items-center justify-center">
                <CheckCircle size={14} className="text-brand-black" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{currentUser?.displayName || "New Member"}</h2>
            <div className="flex flex-col items-center">
              <p className={`text-sm font-bold uppercase tracking-widest mb-2 ${
                  subscriptionTier === 'ultra' ? 'text-brand-pink' : 
                  subscriptionTier === 'pro' ? 'text-brand-green' : 'text-gray-500'
              }`}>
                  {subscriptionTier} Node
              </p>
              
              {creatorStatus === 'pending' && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-brand-green/10 text-brand-green text-[9px] font-black uppercase tracking-widest rounded-full mb-6">
                  <ShieldAlert size={10} />
                  <span>Verification Pending</span>
                </span>
              )}
              {creatorStatus === 'approved' && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-brand-green/10 text-brand-green text-[9px] font-black uppercase tracking-widest rounded-full mb-6">
                  <CheckCircle size={10} />
                  <span>Verified Creator</span>
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
                { id: 'listings', icon: <Briefcase size={18} />, label: "Manage Listings" },
                { id: 'inbox', icon: <MessageSquare size={18} />, label: "Messages", badge: inboxMessages.filter(m => m.unread).length },
                { id: 'earnings', icon: <CreditCard size={18} />, label: "Financials" },
                { id: 'settings', icon: <Settings size={18} />, label: "Global Settings" },
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

          <div className="p-8 bg-brand-black/40 border border-white/5 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-xs font-bold text-white uppercase tracking-widest">Active Skills</h5>
              <button 
                onClick={() => setShowSkillInput(true)}
                className="text-brand-pink hover:text-white transition-colors"
              >
                <PlusCircle size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.length === 0 && !showSkillInput && (
                <p className="text-xs text-gray-600 italic">No skills added yet.</p>
              )}
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
        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-3">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
              <p className="text-gray-500 mt-1">Real-time performance metrics and operations.</p>
            </div>
            <div className="hidden sm:flex items-center space-x-4 text-xs font-bold text-gray-500">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-brand-green mr-2 animate-pulse"></span> System Online</span>
            </div>
          </div>

          {renderTabContent()}

          {/* Detailed Activity Log */}
          <section className="mt-12 bg-brand-grey/40 border border-white/5 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white">Neural Activity Log</h3>
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
