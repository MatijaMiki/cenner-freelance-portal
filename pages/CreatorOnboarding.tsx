
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Renamed File icon to FileIcon to avoid collision with global browser File type
import { Upload, Link as LinkIcon, FileText, CheckCircle2, AlertTriangle, ShieldCheck, X, File as FileIcon, ArrowRight, Loader2 } from 'lucide-react';
import NeuralBackground from '../components/NeuralBackground';
import { auth, updateProfile } from '../lib/firebase';

const CreatorOnboarding: React.FC = () => {
  const [links, setLinks] = useState<string[]>(['']);
  const [files, setFiles] = useState<{ name: string; type: string; size: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAddLink = () => setLinks([...links, '']);
  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Cast to File[] to fix unknown type errors when iterating
    const selectedFiles = Array.from(e.target.files || []) as File[];
    const validFiles: { name: string; type: string; size: number }[] = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError(`File type ${file.type} is not permitted. Only JPG, PNG, and PDF are allowed.`);
        return;
      }
      // Limit to 10MB per file for safety
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        return;
      }
      validFiles.push({ name: file.name, type: file.type, size: file.size });
    }

    setFiles([...files, ...validFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Filter empty links
    const filteredLinks = links.filter(l => l.trim() !== '');
    
    if (filteredLinks.length === 0 && files.length === 0) {
      setError('Please provide at least one portfolio link or file.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Mock API call to submit application
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update local user state via firebase mock
      await updateProfile(auth.currentUser, { creatorStatus: 'pending' });
      
      setIsSuccess(true);
    } catch (err: any) {
      setError('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <NeuralBackground parallax={false} />
        <div className="relative z-10 max-w-xl w-full bg-brand-grey/80 border border-white/10 rounded-[3rem] p-12 text-center backdrop-blur-3xl animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green mx-auto mb-8">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">Application Received</h1>
          <p className="text-gray-400 mb-10 leading-relaxed font-medium">
            Your portfolio is now being reviewed by our neural verification engine. This usually takes <span className="text-brand-pink">24-48 hours</span>. You can still use the platform as a client, but creator listings will be disabled until approval.
          </p>
          <button 
            onClick={() => navigate('/profile')}
            className="w-full py-5 bg-brand-green text-brand-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-green/10"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-32 pb-24 px-4 overflow-hidden">
      <NeuralBackground parallax={true} />
      
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-brand-pink/10 border border-brand-pink/20 rounded-full px-5 py-2 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink">
            <ShieldCheck size={14} />
            <span>Identity & Talent Verification</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            Join the <span className="text-brand-green">Elite.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium leading-relaxed">
            To maintain our Top 1% quality standard, we manually review every creator profile. Provide your best work to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Portfolio Links */}
          <div className="bg-brand-grey/60 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-brand-green/10 rounded-2xl text-brand-green">
                <LinkIcon size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Portfolio Links</h2>
            </div>
            
            <div className="space-y-4">
              {links.map((link, idx) => (
                <div key={idx} className="flex gap-3">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleLinkChange(idx, e.target.value)}
                    placeholder="https://behance.net/yourname"
                    className="flex-grow bg-brand-black/50 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-brand-green transition-all"
                  />
                  {links.length > 1 && (
                    <button type="button" onClick={() => removeLink(idx)} className="p-4 text-gray-500 hover:text-red-500 transition-colors">
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={handleAddLink}
                className="text-brand-green font-bold text-sm flex items-center space-x-2 hover:translate-x-1 transition-transform"
              >
                <span>+ Add another link</span>
              </button>
            </div>
          </div>

          {/* Portfolio Files */}
          <div className="bg-brand-grey/60 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-brand-pink/10 rounded-2xl text-brand-pink">
                <Upload size={24} />
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-white tracking-tight">Artifact Upload</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Allowed: JPG, PNG, PDF (Max 10MB)</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-white/10 group-hover:border-brand-pink/40 rounded-3xl p-12 text-center transition-all bg-brand-black/20">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-500 group-hover:text-brand-pink group-hover:scale-110 transition-all">
                    {/* Using FileIcon renamed above to avoid shadowing browser global File type */}
                    <FileIcon size={32} />
                  </div>
                  <p className="text-white font-bold">Drop your files here or <span className="text-brand-pink">Browse</span></p>
                  <p className="text-gray-500 text-xs mt-2 font-medium">No .ZIP, .EXE or archives allowed for protocol safety.</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-3">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-brand-black/40 p-4 rounded-xl border border-white/5 group">
                      <div className="flex items-center space-x-4">
                        <FileText size={20} className="text-brand-green" />
                        <div>
                          <p className="text-sm text-white font-bold truncate max-w-[200px]">{file.name}</p>
                          <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFile(idx)} className="p-2 text-gray-500 hover:text-red-500">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertTriangle size={18} />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full sm:w-auto px-12 py-5 bg-brand-green text-brand-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-green/20 flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <span>Submit Application</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] max-w-[200px]">
              By submitting, you agree to our creator verification protocol.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatorOnboarding;
