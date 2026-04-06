
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.cenner.hr/api/v1/portal';
const CRM_BASE = import.meta.env.VITE_CRM_API_BASE || 'https://api.cenner.hr';

async function request<T>(
  endpoint: string,
  method: string = 'GET',
  body?: unknown,
): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const API = {
  // ── Auth ──────────────────────────────────────────────────────────────
  register: (data: { email: string; password: string; name: string; mobile?: string }) =>
    request<{ user: any }>('/auth/register', 'POST', data),

  login: (email: string, password: string) =>
    request<{ user: any }>('/auth/login', 'POST', { email, password }),

  logout: () =>
    request<{ success: boolean }>('/auth/logout', 'POST'),

  // Returns fresh user data from DB (used on startup to sync stale localStorage)
  me: () => request<any>('/auth/me', 'GET'),

  requestPasswordReset: (email: string) =>
    request<{ success: boolean }>('/auth/request-password-reset', 'POST', { email }),

  resetPassword: (token: string, newPassword: string) =>
    request<{ success: boolean }>('/auth/reset-password', 'POST', { token, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>('/auth/change-password', 'POST', { currentPassword, newPassword }),

  verifyEmail: (token: string) =>
    request<{ success: boolean }>('/auth/verify-email', 'POST', { token }),

  sendPhoneOtp: (phone: string) =>
    request<{ success: boolean }>('/auth/send-phone-otp', 'POST', { phone }),

  verifyPhoneOtp: (phone: string, code: string) =>
    request<{ success: boolean }>('/auth/verify-phone-otp', 'POST', { phone, code }),

  // ── Profile ───────────────────────────────────────────────────────────
  getProfile: (id: string) => request<any>(`/profile/${id}`),

  updateProfile: (id: string, data: Partial<any>) =>
    request<any>(`/profile/${id}`, 'PUT', data),

  uploadProfileAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch(`${API_BASE}/profile/avatar`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const { url } = await res.json();
    return url;
  },

  // ── Listings ──────────────────────────────────────────────────────────
  getListings: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    const qs = params.toString();
    return request<any[]>(`/listings${qs ? `?${qs}` : ''}`);
  },

  createListing: (data: any) => request<any>('/listings', 'POST', data),

  updateListing: (id: string, data: any) =>
    request<any>(`/listings/${id}`, 'PUT', data),

  deleteListing: (id: string) =>
    request<{ success: boolean }>(`/listings/${id}`, 'DELETE'),

  uploadListingImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/listings/images`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const { url } = await res.json();
    return url;
  },

  // ── Jobs ──────────────────────────────────────────────────────────────
  getJobs: (category?: string) =>
    request<any[]>(`/jobs${category ? `?category=${encodeURIComponent(category)}` : ''}`),

  createJob: (data: any) => request<any>('/jobs', 'POST', data),

  updateJob: (id: string, data: any) =>
    request<any>(`/jobs/${id}`, 'PUT', data),

  deleteJob: (id: string) =>
    request<{ success: boolean }>(`/jobs/${id}`, 'DELETE'),

  // ── Blog posts ────────────────────────────────────────────────────────
  getPosts: () => request<any[]>('/posts'),

  createPost: (data: any) => request<any>('/posts', 'POST', data),

  updatePost: (id: string, data: any) =>
    request<any>(`/posts/${id}`, 'PUT', data),

  deletePost: (id: string) =>
    request<{ success: boolean }>(`/posts/${id}`, 'DELETE'),

  getComments: (postId: string) =>
    request<any[]>(`/posts/${postId}/comments`),

  addComment: (postId: string, content: string, parentId?: string) =>
    request<any>(`/posts/${postId}/comments`, 'POST', { content, ...(parentId && { parentId }) }),

  // ── Contact form ─────────────────────────────────────────────────────
  contact: (data: { name: string; email: string; subject: string; message: string }) =>
    request<{ success: boolean }>('/contact', 'POST', data),

  // ── KYC (Stripe Identity) ─────────────────────────────────────────────────
  createKycSession: () =>
    request<{ clientSecret: string }>('/kyc/create-session', 'POST'),

  getKycStatus: () =>
    request<{ kycVerified: boolean; creatorStatus: string; sessionId: string | null }>('/kyc/status'),

  submitKycSession: () =>
    request<{ success: boolean }>('/kyc/submitted', 'POST'),
  markKycPending: () =>
    request<{ success: boolean; creatorStatus: string }>('/kyc/mark-pending', 'POST'),

  // ── Portfolio ─────────────────────────────────────────────────────────────
  getPortfolio: (userId: string) =>
    request<any[]>(`/portfolio/${userId}`),

  addPortfolioItem: (formData: FormData): Promise<any> => {
    return fetch(`${API_BASE}/portfolio`, { method: 'POST', credentials: 'include', body: formData })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
        return res.json();
      });
  },

  deletePortfolioItem: (itemId: string) =>
    request<{ success: boolean }>(`/portfolio/${itemId}`, 'DELETE'),

  // ── Transactions ──────────────────────────────────────────────────────────
  getTransactions: () => request<any[]>('/transactions'),

  // ── Stripe confirm ────────────────────────────────────────────────────────
  confirmStripePayment: (planId: string, paymentIntentId: string) =>
    request<{ success: boolean }>('/stripe/confirm-payment', 'POST', { planId, paymentIntentId }),

  // ── Marketplace listing purchase ──────────────────────────────────────────
  createListingPaymentIntent: (listingId: string) =>
    request<{ clientSecret: string; totalAmount: number; platformFee: number }>(`/listings/${listingId}/create-payment-intent`, 'POST'),

  // ── Notifications ─────────────────────────────────────────────────────────
  getNotifications: () => request<any[]>('/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, 'PATCH'),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', 'PATCH'),

  // ── Direct Messaging ──────────────────────────────────────────────────────
  getConversations: () => request<any[]>('/conversations'),

  getOrCreateConversation: (otherUserId: string) =>
    request<{ id: string }>('/conversations', 'POST', { userId: otherUserId }),

  getMessages: (conversationId: string, before?: string) =>
    request<any[]>(`/conversations/${conversationId}/messages${before ? `?before=${before}` : ''}`),

  sendMessage: (conversationId: string, content: string) =>
    request<any>(`/conversations/${conversationId}/messages`, 'POST', { content }),

  startConversation: (otherUserId: string) =>
    request<{ id: string }>('/conversations', 'POST', { userId: otherUserId }),

  getUnreadCount: () =>
    request<{ count: number }>('/conversations/unread-count'),

  getCompletedContracts: (userId: string) =>
    request<any[]>(`/users/${userId}/completed-contracts`),

  boostListing: (listingId: string) =>
    request<{ success: boolean; boostedUntil: string; creditsRemaining: number }>(`/listings/${listingId}/boost`, 'POST'),

  // ── Stripe Connect ────────────────────────────────────────────────────────
  connectOnboard: () =>
    request<{ url: string }>('/connect/onboard', 'POST'),

  getConnectStatus: () =>
    request<{ ready: boolean; accountId?: string }>('/connect/status'),

  // ── Contracts ─────────────────────────────────────────────────────────────
  getContracts: () =>
    request<any[]>('/contracts'),

  createContract: (data: any) =>
    request<any>('/contracts', 'POST', data),

  getContract: (id: string) =>
    request<any>(`/contracts/${id}`),

  acceptContract: (id: string) =>
    request<any>(`/contracts/${id}/accept`, 'PATCH'),

  declineContract: (id: string) =>
    request<{ success: boolean }>(`/contracts/${id}/decline`, 'PATCH'),

  cancelContract: (id: string) =>
    request<any>(`/contracts/${id}/cancel`, 'PATCH'),

  // ── Milestones ────────────────────────────────────────────────────────────
  fundMilestone: (id: string) =>
    request<any>(`/milestones/${id}/fund`, 'POST'),

  submitMilestone: (id: string) =>
    request<any>(`/milestones/${id}/submit`, 'POST'),

  approveMilestone: (id: string) =>
    request<any>(`/milestones/${id}/approve`, 'POST'),

  disputeMilestone: (id: string, reason: string) =>
    request<any>(`/milestones/${id}/dispute`, 'POST', { reason }),

  // ── Reviews ───────────────────────────────────────────────────────────────
  submitReview: (contractId: string, rating: number, comment: string) =>
    request<any>('/reviews', 'POST', { contractId, rating, comment }),

  getUserReviews: (userId: string) =>
    request<any[]>(`/users/${userId}/reviews`),

  // ── Orders ──────────────────────────────────────────────────────────────
  createOrder: (listingId: string, paymentIntentId: string) =>
    request<any>('/orders', 'POST', { listingId, paymentIntentId }),

  getOrders: (role?: 'buyer' | 'seller') =>
    request<any[]>(`/orders${role ? `?role=${role}` : ''}`),

  updateOrderStatus: (id: string, status: string) =>
    request<any>(`/orders/${id}/status`, 'PATCH', { status }),

  getInvoice: (orderId: string) =>
    request<any>(`/invoices/${orderId}`),

  // ── Earnings ────────────────────────────────────────────────────────────
  getEarnings: () =>
    request<any>('/earnings'),

  // ── Dashboard Stats ─────────────────────────────────────────────────────
  getDashboardStats: () =>
    request<any>('/dashboard/stats'),

  // ── Saved Listings ──────────────────────────────────────────────────────
  getSavedListings: () =>
    request<any[]>('/saved-listings'),

  saveListing: (listingId: string) =>
    request<any>('/saved-listings', 'POST', { listingId }),

  unsaveListing: (listingId: string) =>
    request<{ success: boolean }>(`/saved-listings/${listingId}`, 'DELETE'),

  // ── Reports ─────────────────────────────────────────────────────────────
  submitReport: (data: { targetType: string; targetRefId: string; targetId?: string; reason: string; details?: string }) =>
    request<any>('/reports', 'POST', data),

  // ── Notification Preferences ────────────────────────────────────────────
  getNotificationPreferences: () =>
    request<any>('/notification-preferences'),

  updateNotificationPreferences: (data: Record<string, boolean>) =>
    request<any>('/notification-preferences', 'PUT', data),

  // ── Subscription ────────────────────────────────────────────────────────
  getSubscriptionStatus: () =>
    request<any>('/subscription/status'),

  cancelSubscription: () =>
    request<any>('/subscription/cancel', 'POST'),

  getSubscriptionPortal: () =>
    request<{ url: string }>('/subscription/portal', 'POST'),

  // ── Dispute Evidence ────────────────────────────────────────────────────
  submitEvidence: (milestoneId: string, content: string) =>
    request<any>(`/milestones/${milestoneId}/evidence`, 'POST', { content }),

  getEvidence: (milestoneId: string) =>
    request<any[]>(`/milestones/${milestoneId}/evidence`),

  // ── Refund ──────────────────────────────────────────────────────────────
  refundMilestone: (milestoneId: string) =>
    request<{ success: boolean }>(`/milestones/${milestoneId}/refund`, 'POST'),

  // ── Advanced Search ─────────────────────────────────────────────────────
  searchListings: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: any[]; total: number; page: number; totalPages: number }>(`/listings/search?${qs}`);
  },

  // ── Blog Votes ──────────────────────────────────────────────────────────
  votePost: (postId: string, direction: 'up' | 'down') =>
    request<{ votes: number }>(`/posts/${postId}/vote`, 'POST', { direction }),

  // ── Stripe Config ────────────────────────────────────────────────────────
  getStripeConfig: () =>
    request<{ mode: string; publishableKey: string | null }>('/stripe/config'),
};
