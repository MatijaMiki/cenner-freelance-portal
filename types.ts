
export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  avatar: string;
  role: 'freelancer' | 'client';
  bio?: string;
  skills?: string[];
  creatorStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  subscriptionTier?: 'free' | 'pro' | 'ultra';
  emailVerified?: boolean;
  mobileVerified?: boolean;
}

export interface CreatorApplication {
  userId: string;
  portfolioLinks: string[];
  portfolioFiles: string[]; // Base64 or URLs
  submittedAt: string;
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
  rating: number;
  reviewsCount: number;
  imageUrl: string;
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

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  content: string;
  category: string;
  timestamp: string;
  votes: number;
  commentCount: number;
}

export interface BlogComment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  votes: number;
  replies?: BlogComment[];
}

export type Category = 'Design' | 'Development' | 'Writing' | 'Marketing' | 'Video' | 'Music';

export interface AuthContextType {
  user: User | null;
  login: (google?: boolean) => void;
  logout: () => void;
  loading: boolean;
}
