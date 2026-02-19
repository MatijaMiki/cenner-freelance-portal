
import React from 'react';
import { Camera, Mic, Zap, X, ShieldCheck, Video, MessageCircle, Info } from 'lucide-react';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-black/90 backdrop-blur-md animate-in fade-in zoom-in duration-300">
      <div className="relative w-full max-w-xl bg-brand-grey border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_0_50px_rgba(74,222,128,0.1)] overflow-hidden">
        {/* Background Accents */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl"></div>

        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-gray-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-10">
            <div className="p-4 bg-brand-green/20 rounded-2xl text-brand-green">
              <ShieldCheck size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Media Permissions</h2>
              <p className="text-brand-pink text-sm font-bold uppercase tracking-widest">Transparency Report</p>
            </div>
          </div>

          <p className="text-gray-300 mb-8 leading-relaxed">
            To provide a world-class freelance experience, Cenner utilizes advanced media capabilities. Here is exactly why we request access to your <span className="text-white font-bold">Camera</span> and <span className="text-white font-bold">Microphone</span>:
          </p>

          <div className="space-y-8 mb-12">
            <div className="flex items-start space-x-5">
              <div className="mt-1 p-2.5 bg-white/5 rounded-xl text-brand-green">
                <Video size={22} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1.5">Live Video Consultations</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Face-to-face meetings are essential for high-stakes projects. Verify identities, clarify project scopes, and build lasting professional relationships through high-definition video calls.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-5">
              <div className="mt-1 p-2.5 bg-white/5 rounded-xl text-brand-pink">
                <MessageCircle size={22} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1.5">Voice-First Collaboration</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Cenner leverages the <span className="text-brand-green">Gemini Live API</span> to provide low-latency, human-like voice interaction. This allows for natural "stand-up" meetings and collaborative sessions directly in your browser.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-5">
              <div className="mt-1 p-2.5 bg-white/5 rounded-xl text-brand-green">
                <Zap size={22} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1.5">Zero-Friction Workflow</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We pre-request these permissions to ensure that when a critical project milestone requires a call, your browser is already configured, preventing any technical delays during your work.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-brand-black/40 border border-white/5 rounded-2xl p-5 flex items-start space-x-4 mb-10">
            <Info className="text-brand-pink flex-shrink-0" size={20} />
            <p className="text-xs text-gray-500 leading-relaxed">
              Cenner follows strict privacy protocols. Your audio and video streams are encrypted and used solely for the duration of your active sessions. No data is recorded without your explicit confirmation.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-5 bg-gradient-to-r from-brand-green to-brand-pink text-brand-black font-black rounded-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-[0_10px_30px_rgba(74,222,128,0.2)]"
          >
            I UNDERSTAND & AGREE
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
