
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServiceListing, JobPosting, BlogPost } from '../types';
import { MOCK_LISTINGS, MOCK_JOBS, MOCK_BLOG_POSTS } from '../constants';

interface DataContextType {
  listings: ServiceListing[];
  jobs: JobPosting[];
  blogPosts: BlogPost[];
  addListing: (listing: ServiceListing) => void;
  addJob: (job: JobPosting) => void;
  addBlogPost: (post: BlogPost) => void;
  getListingById: (id: string) => ServiceListing | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LISTINGS: 'cenner_db_listings',
  JOBS: 'cenner_db_jobs',
  POSTS: 'cenner_db_posts'
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage or fallback to empty arrays
  const [listings, setListings] = useState<ServiceListing[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    return saved ? JSON.parse(saved) : MOCK_LISTINGS;
  });

  const [jobs, setJobs] = useState<JobPosting[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JOBS);
    return saved ? JSON.parse(saved) : MOCK_JOBS;
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
    return saved ? JSON.parse(saved) : MOCK_BLOG_POSTS;
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(blogPosts));
  }, [blogPosts]);

  const addListing = (listing: ServiceListing) => {
    setListings(prev => [listing, ...prev]);
  };

  const addJob = (job: JobPosting) => {
    setJobs(prev => [job, ...prev]);
  };

  const addBlogPost = (post: BlogPost) => {
    setBlogPosts(prev => [post, ...prev]);
  };

  const getListingById = (id: string) => {
    return listings.find(l => l.id === id);
  };

  return (
    <DataContext.Provider value={{ 
      listings, 
      jobs, 
      blogPosts, 
      addListing, 
      addJob, 
      addBlogPost,
      getListingById 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
