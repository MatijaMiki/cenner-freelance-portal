
import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import RedirectTo from './components/RedirectTo';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { NotifyProvider } from './contexts/NotifyContext';

const Home = lazy(() => import('./pages/Home'));
// LOCAL COMPARISON ONLY: the saved pass-3 homepage. Remove before shipping.
const HomeV3 = lazy(() => import('./pages/HomeV3'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetails = lazy(() => import('./pages/ServiceDetails'));
const Checkout = lazy(() => import('./pages/Checkout'));
const SubscriptionCheckout = lazy(() => import('./pages/SubscriptionCheckout'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const About = lazy(() => import('./pages/About'));
const CreatorOnboarding = lazy(() => import('./pages/CreatorOnboarding'));
const Community = lazy(() => import('./pages/Community'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const BlogEditor = lazy(() => import('./pages/BlogEditor'));
const Banned = lazy(() => import('./pages/Banned'));
const AdminBans = lazy(() => import('./pages/AdminBans'));
const Subscription = lazy(() => import('./pages/Subscription'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Cookies = lazy(() => import('./pages/Cookies'));
const Cjenik = lazy(() => import('./pages/Cjenik'));
const PriceGuide = lazy(() => import('./pages/PriceGuide'));
const FreelancerProfile = lazy(() => import('./pages/FreelancerProfile'));
const Orders = lazy(() => import('./pages/Orders'));
const Inbox = lazy(() => import('./pages/Inbox'));
const Contracts = lazy(() => import('./pages/Contracts'));
const ContractDetail = lazy(() => import('./pages/ContractDetail'));
const Ranwhat = lazy(() => import('./pages/Ranwhat'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Unsubscribe = lazy(() => import('./pages/Unsubscribe'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Referral = lazy(() => import('./pages/Referral'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
  // Capture ?ref=CODE on any entry point and persist it for the signup flow.
  // Only overwrite an existing stored code when a new one is actually present.
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get('ref');
      if (ref) localStorage.setItem('cenner_ref', ref);
    } catch { /* ignore */ }
  }, []);

  return (
    <HelmetProvider>
      <NotifyProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <ScrollToTop />
            <Layout>
              <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/v3" element={<HomeV3 />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/service/:id" element={<ServiceDetails />} />
                  <Route path="/checkout/:id" element={<Checkout />} />
                  <Route path="/checkout-subscription/:planId" element={<SubscriptionCheckout />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/creator-onboarding" element={<CreatorOnboarding />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/banned" element={<Banned />} />
                  {/* the admin area: one place, a tab per screen */}
                  <Route path="/admin" element={<RedirectTo to="/admin/blog" />} />
                  <Route path="/admin/blog" element={<BlogEditor />} />
                  <Route path="/admin/blog/:id" element={<BlogEditor />} />
                  <Route path="/admin/bans" element={<AdminBans />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/cookies" element={<Cookies />} />
                  <Route path="/cjenik" element={<Cjenik />} />
                  <Route path="/vodic/cijena-web-stranice" element={<PriceGuide />} />
                  <Route path="/freelancer/:id" element={<FreelancerProfile />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/messages" element={<Inbox />} />
                  <Route path="/messages/:id" element={<Inbox />} />
                  <Route path="/contracts" element={<Contracts />} />
                  <Route path="/contracts/:id" element={<ContractDetail />} />
                  <Route path="/ranwhat" element={<Ranwhat />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/unsubscribe" element={<Unsubscribe />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/referral" element={<Referral />} />
                  {/* Pages folded into others: the old URLs land on their new home (vercel.json
                      redirects the same paths on a full page load) */}
                  <Route path="/match" element={<RedirectTo to="/marketplace#ai-matching" />} />
                  <Route path="/dashboard" element={<RedirectTo to="/profile" />} />
                  <Route path="/saved" element={<RedirectTo to="/profile?tab=saved" />} />
                  <Route path="/blog-admin" element={<RedirectTo to="/admin/blog" />} />
                  <Route path="/blog-admin/:id" element={<RedirectTo to="/admin/blog/:id" />} />
                  <Route path="/contact" element={<RedirectTo to="/about#kontakt" />} />
                  <Route path="/projects" element={<RedirectTo to="/services#radovi" />} />
                  <Route path="/technology" element={<RedirectTo to="/services#alati" />} />
                  <Route path="/earnings" element={<RedirectTo to="/profile?tab=earnings" />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          </Router>
        </DataProvider>
      </AuthProvider>
      </NotifyProvider>
    </HelmetProvider>
  );
};

export default App;
