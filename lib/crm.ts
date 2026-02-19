
import { auth } from './firebase';

const API_BASE = 'https://api.cenner.io';

// Helper to handle API requests with Firebase Auth headers
const sendToBackend = async (endpoint: string, method: string, body?: any) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      // If endpoint is analytics, we might send it anonymously, but based on requirements we expect a token generally.
      // We will skip if no user is found for simplicity, unless it's traffic where we might just log locally.
      if (!endpoint.includes('analytics')) {
         return;
      }
    }

    const token = user && typeof user.getIdToken === 'function' ? await user.getIdToken() : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`[Cenner API] 🚀 Sending ${method} to ${endpoint}`);
    
    // In a real app, we would await this. Here we fire-and-forget or await depending on caller needs.
    // For CRM sync, we don't want to block the UI too much.
    
    fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    }).catch(err => console.error(`[Cenner API] Error sending to ${endpoint}:`, err));

  } catch (error) {
    console.error(`[Cenner API] System Error:`, error);
  }
};

export const CRM_API = {
  /**
   * Syncs user profile data to the CRM.
   * Endpoint: POST /users
   */
  syncUser: async (user: any) => {
    // 1. Maintain Mock Local Storage State (for UI consistency)
    console.log(`[Cenner CRM Local] 📡 Syncing user node: ${user.email}`);
    await new Promise(r => setTimeout(r, 800)); // Simulate latency

    const crmData = JSON.parse(localStorage.getItem('cenner_crm_db') || '{"users":{}, "payments": [], "analytics": []}');
    crmData.users = crmData.users || {};
    
    crmData.users[user.uid] = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      mobile: user.mobile || null,
      photoURL: user.photoURL,
      subscriptionTier: user.subscriptionTier || 'free',
      creatorStatus: user.creatorStatus,
      emailVerified: user.emailVerified || false,
      mobileVerified: user.mobileVerified || false,
      lastSynced: new Date().toISOString(),
      crmStatus: 'active',
      metadata: {
        source: 'web_portal',
        campaign: 'launch_v2'
      }
    };
    localStorage.setItem('cenner_crm_db', JSON.stringify(crmData));

    // 2. Send to Real Backend
    await sendToBackend('/users', 'POST', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      mobile: user.mobile,
      photoURL: user.photoURL,
      role: user.role || 'user',
      metadata: crmData.users[user.uid].metadata
    });

    return { success: true, crmId: `crm_${user.uid}` };
  },

  /**
   * Updates the user's subscription level.
   * Endpoint: PATCH /users/:id
   */
  updateSubscription: async (userId: string, tier: 'free' | 'pro' | 'ultra') => {
    // 1. Local
    console.log(`[Cenner CRM Local] 🔄 Updating subscription for ${userId} to [${tier.toUpperCase()}]`);
    const crmData = JSON.parse(localStorage.getItem('cenner_crm_db') || '{"users":{}, "payments": [], "analytics": []}');
    if (crmData.users && crmData.users[userId]) {
        crmData.users[userId].subscriptionLevel = tier;
        crmData.users[userId].lastSubscriptionUpdate = new Date().toISOString();
        const currentSession = JSON.parse(localStorage.getItem('cenner_active_user') || '{}');
        if (currentSession.uid === userId) {
            currentSession.subscriptionTier = tier;
            localStorage.setItem('cenner_active_user', JSON.stringify(currentSession));
        }
        localStorage.setItem('cenner_crm_db', JSON.stringify(crmData));
    }

    // 2. Real Backend
    await sendToBackend(`/users/${userId}`, 'PATCH', {
      subscriptionTier: tier,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Logs a payment transaction.
   * Endpoint: POST /payments/transactions
   */
  logPayment: async (userId: string, amount: number, type: 'subscription' | 'service', description: string) => {
    // 1. Local
    console.log(`[Cenner CRM Local] 💳 Logging payment: €${amount} (${type})`);
    const crmData = JSON.parse(localStorage.getItem('cenner_crm_db') || '{"users":{}, "payments": [], "analytics": []}');
    crmData.payments = crmData.payments || [];
    crmData.payments.push({
        id: `tx_${Date.now()}`,
        userId,
        amount,
        currency: 'EUR',
        type,
        description,
        status: 'completed',
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('cenner_crm_db', JSON.stringify(crmData));

    // 2. Real Backend
    await sendToBackend('/payments/transactions', 'POST', {
      userId,
      amount,
      currency: 'EUR',
      type,
      description,
      status: 'completed',
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Tracks user traffic and page views.
   * Endpoint: POST /analytics/traffic
   */
  trackTraffic: (path: string, userId?: string) => {
      // 1. Local
      // console.log(`[Cenner CRM Analytics] 📊 Pageview: ${path} [User: ${userId || 'Guest'}]`);
      const crmData = JSON.parse(localStorage.getItem('cenner_crm_db') || '{"users":{}, "payments": [], "analytics": []}');
      crmData.analytics = crmData.analytics || [];
      crmData.analytics.push({
          type: 'pageview',
          path,
          userId: userId || null,
          timestamp: new Date().toISOString()
      });
      localStorage.setItem('cenner_crm_db', JSON.stringify(crmData));

      // 2. Real Backend
      // Fire and forget, don't await
      sendToBackend('/analytics/traffic', 'POST', {
        path,
        userId: userId || null,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
  },

  /**
   * Updates verification status (email/mobile).
   * Note: No specific endpoint requested for this in prompt, keeping local only or syncing via syncUser if needed.
   * Ideally, verification happens via backend triggers, but we'll leave this as local update for UI state.
   */
  verifyContact: async (userId: string, type: 'email' | 'mobile') => {
      console.log(`[Cenner CRM Local] 🛡️ Verifying ${type} for ${userId}`);
      const crmData = JSON.parse(localStorage.getItem('cenner_crm_db') || '{"users":{}, "payments": [], "analytics": []}');
      
      let updatedUser = null;

      if (crmData.users && crmData.users[userId]) {
          if (type === 'email') crmData.users[userId].emailVerified = true;
          if (type === 'mobile') crmData.users[userId].mobileVerified = true;
          updatedUser = crmData.users[userId];
          
          const currentSession = JSON.parse(localStorage.getItem('cenner_active_user') || '{}');
          if (currentSession.uid === userId) {
              if (type === 'email') currentSession.emailVerified = true;
              if (type === 'mobile') currentSession.mobileVerified = true;
              localStorage.setItem('cenner_active_user', JSON.stringify(currentSession));
          }
          localStorage.setItem('cenner_crm_db', JSON.stringify(crmData));
      }

      // Sync the update to backend user profile if changed
      if (updatedUser) {
        await sendToBackend(`/users/${userId}`, 'PATCH', {
          emailVerified: updatedUser.emailVerified,
          mobileVerified: updatedUser.mobileVerified
        });
      }
  }
};
