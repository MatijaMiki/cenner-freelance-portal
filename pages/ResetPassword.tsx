import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { API } from '../lib/api';
import SEO from '../components/SEO';

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search || location.hash?.split('?')[1]);
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (!token) { setError('Invalid or missing reset token'); return; }
    setLoading(true);
    setError('');
    try {
      await API.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-leaf/20 flex items-center justify-center text-leaf mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="text-2xl font-bold text-ink mb-2">Password Reset</h1>
        <p className="text-slate mb-6">Your password has been updated successfully.</p>
        <Link to="/auth" className="px-8 py-3 bg-sky text-white font-bold hover:scale-105 transition-all">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <SEO noIndex />
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-leaf/10 flex items-center justify-center text-leaf">
            <Lock size={20} />
          </div>
          <h1 className="text-2xl font-bold text-ink">Reset Password</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate uppercase tracking-widest block mb-2">New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              className="w-full bg-zinc-900 border-2 border-ink py-3 px-4 text-ink focus:outline-none focus:border-sky transition-colors" placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate uppercase tracking-widest block mb-2">Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              className="w-full bg-zinc-900 border-2 border-ink py-3 px-4 text-ink focus:outline-none focus:border-sky transition-colors" placeholder="Repeat password" />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-700 px-4 py-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-sky text-white font-bold hover:scale-[1.02] transition-all disabled:opacity-50">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="text-center text-slate text-sm mt-6">
          Remember your password? <Link to="/auth" className="text-leaf font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
