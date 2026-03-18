
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

const Home = lazy(() => import('./pages/Home'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetails = lazy(() => import('./pages/ServiceDetails'));
const Checkout = lazy(() => import('./pages/Checkout'));
const SubscriptionCheckout = lazy(() => import('./pages/SubscriptionCheckout'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const CreatorOnboarding = lazy(() => import('./pages/CreatorOnboarding'));
const Blog = lazy(() => import('./pages/Blog'));
const Subscription = lazy(() => import('./pages/Subscription'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Cookies = lazy(() => import('./pages/Cookies'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FreelancerProfile = lazy(() => import('./pages/FreelancerProfile'));
const Orders = lazy(() => import('./pages/Orders'));
const Messages = lazy(() => import('./pages/Messages'));
const Projects = lazy(() => import('./pages/Projects'));
const Technology = lazy(() => import('./pages/Technology'));
const Match = lazy(() => import('./pages/Match'));

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <ScrollToTop />
            <Layout>
              <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/service/:id" element={<ServiceDetails />} />
                  <Route path="/checkout/:id" element={<Checkout />} />
                  <Route path="/checkout-subscription/:planId" element={<SubscriptionCheckout />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/creator-onboarding" element={<CreatorOnboarding />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/cookies" element={<Cookies />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/freelancer/:id" element={<FreelancerProfile />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/technology" element={<Technology />} />
                  <Route path="/match" element={<Match />} />
                </Routes>
              </Suspense>
            </Layout>
          </Router>
        </DataProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
