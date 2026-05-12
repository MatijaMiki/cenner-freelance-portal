
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
        <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠</div>
          <h2 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>Something went wrong</h2>
          <p style={{ color: '#e55', marginBottom: '0.75rem', fontSize: '0.75rem', maxWidth: '32rem', wordBreak: 'break-word' }}>{this.state.error.message}</p>
          <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Please refresh the page to continue.</p>
          <button onClick={() => window.location.href = '/'} style={{ padding: '0.75rem 2rem', background: '#4ade80', color: '#000', fontWeight: 800, border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '0.875rem' }}>
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
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
