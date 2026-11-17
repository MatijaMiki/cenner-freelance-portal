// Conversion events for GA4 (property "Cenner", G-MQ8LYQNEC5), sent through the gtag set up in
// index.html. Google Consent Mode decides what an event may store: without analytics consent it
// goes out cookieless. Mark `generate_lead` and `sign_up` as key events in GA4, then import them
// into Google Ads as conversions.
//
// Never pass personal data (email, name, phone, message text) as a parameter.

type Params = Record<string, string | number | boolean | undefined>;

export const track = (event: string, params: Params = {}): void => {
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    w.gtag?.('event', event, params);
  } catch {
    /* analytics must never break the page */
  }
};

/** A person asked us for something: the quote form, the contact form, the guide popup, an email click. */
export const trackLead = (lead_source: string, extra: Params = {}): void =>
  track('generate_lead', { lead_source, ...extra });

/** A new account was created. */
export const trackSignUp = (method: 'email' | 'google'): void => track('sign_up', { method });
