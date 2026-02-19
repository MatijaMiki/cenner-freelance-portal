
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup as firebaseSignInWithPopup, 
  signInWithEmailAndPassword as firebaseSignInWithEmail, 
  createUserWithEmailAndPassword as firebaseCreateUser, 
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { CRM_API } from './crm';

const firebaseConfig = {
  apiKey: "AIzaSyDxODMT6PFmtYUnmg9qi124cqpzmxti9LM",
  authDomain: "cenner-main.firebaseapp.com",
  projectId: "cenner-main",
  storageBucket: "cenner-main.firebasestorage.app",
  messagingSenderId: "613455746040",
  appId: "1:613455746040:web:a4433cf96bf890b5757c0d",
  measurementId: "G-SPN588RLQN"
};

const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey.length > 0;

let _auth: any = null;
let _googleProvider: any = null;

if (isConfigValid) {
  try {
    const app = initializeApp(firebaseConfig);
    _auth = getAuth(app);
    _googleProvider = new GoogleAuthProvider();
  } catch (e) {
    console.error("Firebase init failed:", e);
  }
}

// --- Mock Database & Auth Layer ---
const MOCK_SESSION_KEY = 'cenner_active_user';

const authListeners: Array<(user: any) => void> = [];

const notifyAuthChange = () => {
  const user = getMockUser();
  authListeners.forEach(cb => cb(user));
};

const getMockUser = () => {
  const user = JSON.parse(localStorage.getItem(MOCK_SESSION_KEY) || 'null');
  if (user) {
    // Add mock method to simulate Firebase User object behavior
    user.getIdToken = async () => `mock-token-${user.uid}`;
  }
  return user;
};

const mockAuth = {
  get currentUser() {
    return getMockUser();
  },
  onAuthStateChanged: (callback: (user: any) => void) => {
    authListeners.push(callback);
    callback(mockAuth.currentUser); // Initial check
    return () => {
      const idx = authListeners.indexOf(callback);
      if (idx > -1) authListeners.splice(idx, 1);
    };
  },
  signOut: async () => {
    localStorage.removeItem(MOCK_SESSION_KEY);
    notifyAuthChange();
    return Promise.resolve();
  }
};

export const auth = isConfigValid ? _auth : mockAuth;
export const googleProvider = _googleProvider;

export const signInWithPopup = async (authObj: any, provider: any) => {
  if (!isConfigValid) {
    const user = { 
      uid: 'mock-' + Date.now(),
      displayName: "New User", 
      email: "user@cenner.io", 
      photoURL: null, // Blank slate
      creatorStatus: 'none',
      subscriptionTier: 'free',
      emailVerified: true, // Google auth implies verification
      mobileVerified: false
    };
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
    
    // Sync with CRM
    await CRM_API.syncUser(user);
    
    notifyAuthChange();
    return { user };
  }
  return firebaseSignInWithPopup(authObj, provider);
};

export const signInWithEmailAndPassword = async (authObj: any, email: string, pass: string) => {
  if (!isConfigValid) {
    // In a real mock, we'd check credentials, but here we just create a session for simplicity or return existing
    // For this demo, let's assume login always succeeds and creates a session if needed or refreshes
    const existing = JSON.parse(localStorage.getItem(MOCK_SESSION_KEY) || 'null');
    const user = existing || { 
      uid: 'mock-' + Date.now(), 
      email, 
      displayName: email.split('@')[0], 
      photoURL: null, 
      creatorStatus: 'none', 
      subscriptionTier: 'free',
      emailVerified: false,
      mobileVerified: false
    };
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
    notifyAuthChange();
    return { user };
  }
  return firebaseSignInWithEmail(authObj, email, pass);
};

export const createUserWithEmailAndPassword = async (authObj: any, email: string, pass: string) => {
  if (!isConfigValid) {
    const user = { 
      uid: 'mock-' + Date.now(), 
      email, 
      displayName: email.split('@')[0], 
      photoURL: null, 
      creatorStatus: 'none', 
      subscriptionTier: 'free',
      emailVerified: false,
      mobileVerified: false
    };
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
    
    // Sync with CRM - Initial registration
    await CRM_API.syncUser(user);

    notifyAuthChange();
    return { user };
  }
  return firebaseCreateUser(authObj, email, pass);
};

export const updateProfile = async (user: any, data: any) => {
  if (!isConfigValid) {
    const current = JSON.parse(localStorage.getItem(MOCK_SESSION_KEY) || '{}');
    const updated = { ...current, ...data };
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updated));
    
    // Sync updates with CRM
    await CRM_API.syncUser(updated);
    
    notifyAuthChange();
    return Promise.resolve();
  }
  return firebaseUpdateProfile(user, data);
};

export const onAuthStateChanged = (authObj: any, callback: any) => {
  if (!authObj) return () => {};
  return authObj.onAuthStateChanged(callback);
};

export const signOut = (authObj: any) => {
  if (!authObj) return Promise.resolve();
  return authObj.signOut();
};
