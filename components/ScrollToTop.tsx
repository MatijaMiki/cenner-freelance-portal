
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Utility component that ensures the page scrolls to the top whenever the route changes.
 * This is crucial for SPAs where navigation doesn't naturally trigger a scroll reset.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Instant scroll for better navigation feel
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
