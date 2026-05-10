
export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  avatar: string;
  role: 'freelancer' | 'client' | 'admin';
  bio?: string;
  skills?: string[];
  creatorStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  kycVerified?: boolean;
  subscriptionTier?: 'free' | 'pro' | 'ultra';
  emailVerified?: boolean;
  mobileVerified?: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileType?: string;
  createdAt: string;
}

export interface ServiceListing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  deliveryTime: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerLocation?: string;
  freelancerBio?: string;
  freelancerCreatedAt?: string;
  includes: string[];
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  galleryImages?: string[];
  createdAt?: string;
  freelancerTier?: string;
  freelancerTrusted?: boolean;
  freelancerKycVerified?: boolean;
  isSponsored?: boolean;
  boostedUntil?: string | null;
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetRange: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  postedAt: string;
  proposalsCount: number;
  urgency: 'low' | 'medium' | 'high';
}

export interface CommunityPost {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  authorAvatar: string;
  content: string;
  category: string;
  timestamp: string;
  votes: number;
  commentCount: number;
  isPrivate?: boolean;
}

export interface CommunityComment {
  id: string;
  author: string;
  authorId?: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  votes: number;
  replies?: CommunityComment[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  published: boolean;
  publishedAt?: string | null;
  viewCount?: number;
  author: string;
  authorAvatar?: string;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Category = 'Design' | 'Development' | 'Writing' | 'Marketing' | 'Video' | 'Music';

// ── Messaging ────────────────────────────────────────────────────────────────

export interface DMConversation {
  id: string;
  other: { id: string; name: string; avatar?: string } | null;
  otherUserId?: string;
  name?: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageAt?: string | null;
  unread: number;
}

export interface DMMessage {
  id: string;
  content: string;
  senderId: string;
  flagged?: boolean;
  readAt?: string | null;
  createdAt: string;
  sender?: { id: string; name: string; avatar?: string };
}

export interface AuthContextType {
  user: User | null;
  login: (google?: boolean) => void;
  logout: () => void;
  loading: boolean;
}
