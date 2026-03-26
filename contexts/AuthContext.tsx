
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { API } from '../lib/api';
import { signInWithGoogle as firebaseSignInWithGoogle } from '../lib/firebase';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  bio?: string;
  skills?: string[];
  creatorStatus?: string;
  kycVerified?: boolean;
  tier?: string;
  emailVerified: boolean;
  mobileVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; mobile?: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'cenner_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // On startup: call /auth/me — cookie is sent automatically, no token needed.
  // Syncs fresh user data (tier, verification status, avatar) from DB.
  useEffect(() => {
    API.me()
      .then((freshUser: AuthUser) => {
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        setUser(freshUser);
      })
      .catch(() => {
        // Cookie invalid/expired — clear stale user data
        localStorage.removeItem(USER_KEY);
        setUser(null);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persistSession = (newUser: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: newUser } = await API.login(email, password);
      persistSession(newUser);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: Parameters<typeof API.register>[0]) => {
    setLoading(true);
    try {
      const { user: newUser } = await API.register(data);
      persistSession(newUser);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const idToken = await firebaseSignInWithGoogle();
      const CRM_BASE = import.meta.env.VITE_CRM_API_BASE || 'https://api.cenner.hr';
      const res = await fetch(`${CRM_BASE}/api/v1/portal/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Google sign-in failed');
      }
      const { user: newUser } = await res.json();
      persistSession(newUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try { await API.logout(); } catch { /* ignore */ }
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
