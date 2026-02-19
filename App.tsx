
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import Checkout from './pages/Checkout';
import SubscriptionCheckout from './pages/SubscriptionCheckout';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import CreatorOnboarding from './pages/CreatorOnboarding';
import Blog from './pages/Blog';
import Subscription from './pages/Subscription';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Cookies from './pages/Cookies';
import ScrollToTop from './components/ScrollToTop';
import { DataProvider } from './contexts/DataContext';
import { CRM_API } from './lib/crm';
import { auth } from './lib/firebase';

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Send tracking data to CRM whenever the route changes
    CRM_API.trackTraffic(location.pathname, auth.currentUser?.uid);
  }, [location]);

  return null;
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <Router>
        <ScrollToTop />
        <AnalyticsTracker />
        <Layout>
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
          </Routes>
        </Layout>
      </Router>
    </DataProvider>
  );
};

export default App;
