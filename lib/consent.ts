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
  return merged;
};

export const hasRequiredConsent = (): boolean => {
  const c = getConsent();
  return c.tos === 'accepted' && c.cookies === 'accepted';
};

export const isConsentPending = (): boolean => {
  const c = getConsent();
  return c.tos === 'pending' || c.cookies === 'pending' || c.location === 'pending';
};

export const openConsentModal = (reason?: 'register' | 'manual') => {
  window.dispatchEvent(new CustomEvent('consent:open', { detail: { reason } }));
};
