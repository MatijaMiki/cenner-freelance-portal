
import './tailwind.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './i18n';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    // Stale chunk after new deploy — silently reload to get fresh assets
    if (error.message?.includes('Failed to fetch dynamically imported module') ||
        error.message?.includes('Importing a module script failed')) {
      window.location.reload();
      return { error: null };
    }
    return { error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#eef0f3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0b0c0e', fontFamily: "'Libre Franklin', system-ui, sans-serif", padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠</div>
          <h2 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>Something went wrong</h2>
          <p style={{ color: '#b91c1c', marginBottom: '0.75rem', fontSize: '0.75rem', maxWidth: '32rem', wordBreak: 'break-word' }}>{this.state.error.message}</p>
          <p style={{ color: '#5d6470', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Please refresh the page to continue.</p>
          <button onClick={() => window.location.href = '/'} style={{ padding: '0.75rem 2rem', background: '#002ca5', color: '#fff', fontWeight: 800, border: '2px solid #0b0c0e', borderRadius: 0, boxShadow: '4px 4px 0 #0b0c0e', cursor: 'pointer', fontSize: '0.875rem' }}>
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Older emails linked to hash routes ("/#/reset-password?token=..."); this is a BrowserRouter app, so
// turn those into real paths before the router reads the URL. Plain anchors ("#kontakt") are left alone.
// Only same-site paths ("#/x", not "#//host" or "#/\host"), and never let a bad hash stop the app mounting.
if (/^#\/(?![\/\\])/.test(window.location.hash)) {
  try { window.history.replaceState(null, '', window.location.hash.slice(1)); } catch { /* leave the URL as it is */ }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Reuse a single root across HMR re-runs (dev) and clear any prerendered SEO
// fallback content from index.html before the very first createRoot call.
type RootHolder = { __root?: ReturnType<typeof ReactDOM.createRoot> };
const holder = rootElement as HTMLElement & RootHolder;
if (!holder.__root) {
  rootElement.replaceChildren();
  holder.__root = ReactDOM.createRoot(rootElement);
}
holder.__root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
