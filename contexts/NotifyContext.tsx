import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

interface ConfirmState extends ConfirmOptions {
  message: string;
  resolve: (val: boolean) => void;
}

interface NotifyContextType {
  toast: (message: string, type?: ToastType) => void;
  confirm: (message: string, opts?: ConfirmOptions) => Promise<boolean>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const NotifyContext = createContext<NotifyContextType | null>(null);

export const useNotify = (): NotifyContextType => {
  const ctx = useContext(NotifyContext);
  if (!ctx) throw new Error('useNotify must be used inside NotifyProvider');
  return ctx;
};

// ── Styling maps ──────────────────────────────────────────────────────────────

const ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
  warning: AlertTriangle,
};

const STYLE = {
  success: 'border-brand-green/30 text-brand-green',
  error:   'border-brand-pink/30  text-brand-pink',
  info:    'border-white/10       text-gray-400',
  warning: 'border-yellow-500/30  text-yellow-400',
};

// ── Provider ──────────────────────────────────────────────────────────────────

export const NotifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts,       setToasts]       = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  // ── toast ──────────────────────────────────────────────────────────────────
  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  // ── confirm ────────────────────────────────────────────────────────────────
  const confirm = useCallback((message: string, opts?: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmState({
        message,
        title:        opts?.title,
        confirmLabel: opts?.confirmLabel ?? 'Confirm',
        cancelLabel:  opts?.cancelLabel  ?? 'Cancel',
        variant:      opts?.variant      ?? 'default',
        resolve,
      });
    });
  }, []);

  const handleConfirm = (val: boolean) => {
    confirmState?.resolve(val);
    setConfirmState(null);
  };

  return (
    <NotifyContext.Provider value={{ toast, confirm }}>
      {children}

      {/* ── Toast stack ─────────────────────────────────────────────────── */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none w-80">
        {toasts.map(t => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              style={{ animation: 'notifySlideIn 0.25s cubic-bezier(0.16,1,0.3,1) both' }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border bg-[#1a1a1a] shadow-2xl ${STYLE[t.type]}`}
            >
              <Icon size={16} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-200 font-medium leading-snug flex-1">{t.message}</p>
              <button
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                className="text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0 mt-0.5"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Confirm modal ───────────────────────────────────────────────── */}
      {confirmState && (
        <div
          className="fixed inset-0 z-[201] flex items-center justify-center p-4"
          onClick={() => handleConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div
            className="relative bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl"
            style={{ animation: 'notifySlideIn 0.2s cubic-bezier(0.16,1,0.3,1) both' }}
            onClick={e => e.stopPropagation()}
          >
            {confirmState.title && (
              <h3 className="text-xl font-black text-white text-center mb-2">{confirmState.title}</h3>
            )}
            <p className="text-gray-400 text-sm text-center mb-7 leading-relaxed">{confirmState.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleConfirm(false)}
                className="flex-1 py-3 border border-white/10 text-gray-300 font-bold rounded-2xl hover:border-white/30 hover:text-white transition-all"
              >
                {confirmState.cancelLabel}
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className={`flex-1 py-3 font-black rounded-2xl transition-all border ${
                  confirmState.variant === 'danger'
                    ? 'bg-brand-pink/10 border-brand-pink/30 text-brand-pink hover:bg-brand-pink/20 hover:border-brand-pink/60'
                    : 'bg-brand-green/10 border-brand-green/30 text-brand-green hover:bg-brand-green/20 hover:border-brand-green/60'
                }`}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotifyContext.Provider>
  );
};
