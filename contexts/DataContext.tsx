
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServiceListing, JobPosting, BlogPost } from '../types';
import { API } from '../lib/api';
import { io } from 'socket.io-client';

const BACKEND = import.meta.env.VITE_CRM_API_BASE || 'https://api.cenner.hr';

interface DataContextType {
  listings: ServiceListing[];
  jobs: JobPosting[];
  blogPosts: BlogPost[];
  loading: boolean;
  addListing: (listing: Omit<ServiceListing, 'id'>) => Promise<ServiceListing>;
  addJob: (job: Omit<JobPosting, 'id'>) => Promise<JobPosting>;
  addBlogPost: (post: Omit<BlogPost, 'id'>) => Promise<BlogPost>;
  updateBlogPost: (id: string, data: Partial<BlogPost>) => Promise<BlogPost>;
  deleteBlogPost: (id: string) => Promise<void>;
  updateListing: (id: string, data: Partial<ServiceListing>) => Promise<ServiceListing>;
  deleteListing: (id: string) => Promise<void>;
  getListingById: (id: string) => ServiceListing | undefined;
  refreshListings: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.getListings(), API.getJobs(), API.getPosts()])
      .then(([l, j, p]) => {
        setListings(l);
        setJobs(j);
        setBlogPosts(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Live listing updates via socket — no auth needed, public channel
  useEffect(() => {
    const socket = io(BACKEND, { transports: ['websocket', 'polling'], withCredentials: true });
    socket.on('listing_created', (newListing: ServiceListing) => {
      setListings(prev => {
        if (prev.some(l => l.id === newListing.id)) return prev;
        return [newListing, ...prev];
      });
    });
    return () => { socket.disconnect(); };
  }, []);

  const addListing = async (data: Omit<ServiceListing, 'id'>): Promise<ServiceListing> => {
    const listing = await API.createListing(data);
    setListings(prev => [listing, ...prev]);
    return listing;
  };

  const addJob = async (data: Omit<JobPosting, 'id'>): Promise<JobPosting> => {
    const job = await API.createJob(data);
    setJobs(prev => [job, ...prev]);
    return job;
  };

  const addBlogPost = async (data: Omit<BlogPost, 'id'>): Promise<BlogPost> => {
    const post = await API.createPost(data);
    setBlogPosts(prev => [post, ...prev]);
    return post;
  };

  const updateBlogPost = async (id: string, data: Partial<BlogPost>): Promise<BlogPost> => {
    const post = await API.updatePost(id, data);
    setBlogPosts(prev => prev.map(p => p.id === id ? { ...p, ...post } : p));
    return post;
  };

  const deleteBlogPost = async (id: string): Promise<void> => {
    await API.deletePost(id);
    setBlogPosts(prev => prev.filter(p => p.id !== id));
  };

  const updateListing = async (id: string, data: Partial<ServiceListing>): Promise<ServiceListing> => {
    const listing = await API.updateListing(id, data);
    setListings(prev => prev.map(l => l.id === id ? listing : l));
    return listing;
  };

  const deleteListing = async (id: string): Promise<void> => {
    await API.deleteListing(id);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const getListingById = (id: string) => listings.find(l => l.id === id);

  const refreshListings = async () => {
    const l = await API.getListings();
    setListings(l);
  };

  return (
    <DataContext.Provider value={{
      listings, jobs, blogPosts, loading,
      addListing, addJob, addBlogPost, updateBlogPost, deleteBlogPost,
      updateListing, deleteListing,
      getListingById, refreshListings,
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
