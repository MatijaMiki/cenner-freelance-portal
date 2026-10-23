export type ConsentItem = 'tos' | 'cookies' | 'location';
export type ConsentStatus = 'accepted' | 'declined' | 'pending';
export type ConsentState = Record<ConsentItem, ConsentStatus>;

const KEY = 'cenner_consent_v2';
const DEFAULT: ConsentState = { tos: 'pending', cookies: 'pending', location: 'pending' };

export const getConsent = (): ConsentState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT, ...parsed };
  } catch {
    return { ...DEFAULT };
  }
};

export const setConsent = (patch: Partial<ConsentState>) => {
  const merged = { ...getConsent(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent('consent:changed', { detail: merged }));

  // Google Consent Mode v2 — propagate cookie consent to gtag so Ads/Analytics
  // switch between cookieless pings and full tracking without a page reload.
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') {
    const granted = merged.cookies === 'accepted' ? 'granted' : 'denied';
    w.gtag('consent', 'update', {
      ad_storage: granted,
      ad_user_data: granted,
      ad_personalization: granted,
      analytics_storage: granted,
    });
  }

  return merged;
};

// Creating an account requires the Terms and nothing else. Analytics/advertising cookies are
// optional (consent must be freely given, so it cannot be a condition of signing up), and
// strictly necessary cookies (login, security) need no consent at all.
export const hasRequiredConsent = (): boolean => getConsent().tos === 'accepted';

export const isConsentPending = (): boolean => {
  const c = getConsent();
  return c.tos === 'pending' || c.cookies === 'pending' || c.location === 'pending';
};

// "Skip" used to leave every answer pending, so the prompt came back on every page load and
// every new tab. Remember the skip for a week instead (the answers stay pending, so analytics
// stays off and signing up still asks for the Terms).
const SKIP_KEY = 'cenner_consent_skip_until';
const SKIP_DAYS = 7;

export const skipConsentPrompt = () => {
  try { localStorage.setItem(SKIP_KEY, String(Date.now() + SKIP_DAYS * 86_400_000)); } catch { /* storage blocked */ }
};

// Should the prompt open by itself on page load?
export const shouldAutoPromptConsent = (): boolean => {
  if (!isConsentPending()) return false;
  try {
    const until = Number(localStorage.getItem(SKIP_KEY) || 0);
    if (until > Date.now()) return false;
  } catch { /* storage blocked: fall through and prompt */ }
  return true;
};

export const openConsentModal = (reason?: 'register' | 'manual') => {
  window.dispatchEvent(new CustomEvent('consent:open', { detail: { reason } }));
};
