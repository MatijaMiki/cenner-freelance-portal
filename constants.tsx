
import { ServiceListing, BlogPost, BlogComment, JobPosting } from './types';

export const CATEGORIES = [
  'Design', 
  'Development', 
  'Writing', 
  'Marketing', 
  'Video', 
  'Music', 
  'AI/ML', 
  'Mobile Apps', 
  'SEO', 
  'Illustration', 
  'Data Science',
  'Voice Over'
];

// Initialize as empty arrays for a fresh platform state
export const MOCK_BLOG_POSTS: BlogPost[] = [];

export const MOCK_BLOG_COMMENTS: BlogComment[] = [];

export const MOCK_LISTINGS: ServiceListing[] = [];

export const MOCK_JOBS: JobPosting[] = [];
