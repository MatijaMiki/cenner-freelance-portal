
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.cenner.hr/api/v1/portal';
const CRM_BASE = import.meta.env.VITE_CRM_API_BASE || 'https://api.cenner.hr';
const PUBLIC_BASE = API_BASE.replace(/\/portal$/, '/public');

// Thrown when the server responds with a 403 + banned:true payload.
// The router watches for this and sends the user to /banned.
export class BannedError extends Error {
  banId?: string;
  reason?: string;
  canAppeal?: boolean;
  constructor(payload: { banId?: string; reason?: string; canAppeal?: boolean; error?: string }) {
    super(payload.reason || payload.error || 'Banned');
    this.name = 'BannedError';
    this.banId = payload.banId;
    this.reason = payload.reason;
    this.canAppeal = payload.canAppeal;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 403 && err && err.banned) {
      // Notify the app so it can redirect the user to /banned
      window.dispatchEvent(new CustomEvent('api:banned', { detail: err }));
      throw new BannedError(err);
    }
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

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
  return handleResponse<T>(res);
}

async function requestPublic<T>(endpoint: string, method: string = 'GET', body?: unknown): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const res = await fetch(`${PUBLIC_BASE}${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
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

  // ── Community Hub (Reddit-style) ─────────────────────────────────────
  getCommunityPosts: () => request<any[]>('/community/posts'),

  createCommunityPost: (data: any) => request<any>('/community/posts', 'POST', data),

  updateCommunityPost: (id: string, data: any) =>
    request<any>(`/community/posts/${id}`, 'PUT', data),

  deleteCommunityPost: (id: string) =>
    request<{ success: boolean }>(`/community/posts/${id}`, 'DELETE'),

  getCommunityComments: (postId: string) =>
    request<any[]>(`/community/posts/${postId}/comments`),

  addCommunityComment: (postId: string, content: string, parentId?: string) =>
    request<any>(`/community/posts/${postId}/comments`, 'POST', { content, ...(parentId && { parentId }) }),

  // ── Blog (long-form, admin-authored) ──────────────────────────────────
  // Public reads
  listPublicBlogPosts: () => requestPublic<any[]>('/blog'),
  getPublicBlogPost: (slug: string) => requestPublic<any>(`/blog/${encodeURIComponent(slug)}`),
  // Admin (auth + ADMIN role)
  listAdminBlogPosts: () => request<any[]>('/blog'),
  getAdminBlogPost: (id: string) => request<any>(`/blog/${id}`),
  createBlogPost: (data: { title: string; slug?: string; excerpt?: string; content: string; coverImage?: string; published?: boolean }) =>
    request<any>('/blog', 'POST', data),
  updateBlogPost: (id: string, data: any) => request<any>(`/blog/${id}`, 'PUT', data),
  deleteBlogPost: (id: string) => request<{ success: boolean }>(`/blog/${id}`, 'DELETE'),

  // ── Bans (public status/appeal + admin review) ────────────────────────
  getBanStatus: () => requestPublic<{ banned: boolean; banId?: string; reason?: string; route?: string; canAppeal?: boolean; appealedAt?: string; createdAt?: string }>('/ban-status'),
  submitBanAppeal: (banId: string, appealText: string) =>
    requestPublic<{ success: boolean }>('/ban-appeal', 'POST', { banId, appealText }),
  listAdminBans: (filter?: 'active' | 'appealed' | 'lifted') =>
    request<any[]>(`/admin/bans${filter ? `?filter=${filter}` : ''}`),
  liftAdminBan: (id: string) =>
    request<any>(`/admin/bans/${id}/lift`, 'POST'),

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
    request<{ connected: boolean; ready: boolean; accountId?: string }>('/connect/status'),

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

  getMyAnalytics: () =>
    request<{
      tier: string;
      totalViews: number;
      listingCount: number;
      savedCount: number;
      contractsTotal: number;
      contractsCompleted: number;
      conversionRate: number;
      boosts: { credits: number; used: number; remaining: number };
      topListings: { id: string; title: string; views: number; rating: number; reviews: number }[];
    }>('/me/analytics'),

  getTopPros: () =>
    request<any[]>('/featured/top-pros'),

  getSpotlight: () =>
    request<any[]>('/featured/spotlight'),

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

  // ── Community Votes ──────────────────────────────────────────────────────
  voteCommunityPost: (postId: string, direction: 'up' | 'down') =>
    request<{ votes: number }>(`/community/posts/${postId}/vote`, 'POST', { direction }),

  // ── Stripe Config ────────────────────────────────────────────────────────
  getStripeConfig: () =>
    request<{ mode: string; publishableKey: string | null }>('/stripe/config'),

  // ── Listing view tracking (fire-and-forget) ───────────────────────────────
  trackListingView: (id: string) =>
    request<{ success: boolean }>(`/listings/${id}/view`, 'POST'),

  // ── Stripe receipt URL ────────────────────────────────────────────────────
  getPaymentReceipt: (paymentIntentId: string) =>
    request<{ receiptUrl: string | null }>(`/payments/${paymentIntentId}/receipt`),
};
