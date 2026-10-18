/**
 * Who runs Cenner, in one place (the About page's company block and contact details, the footer,
 * the legal pages, ranwhat's page). From the court/obrt register (fininfo.hr, MB 99210363).
 * Public contact goes to the cenner.hr mailboxes, not the owner's personal address.
 */
export const COMPANY = {
  brand: 'Cenner',
  legalName: 'Cenner, obrt za računalno programiranje i ostale usluge, vl. Matija Mikulinec',
  owner: 'Matija Mikulinec',
  street: 'Mikulinci 8',
  postcode: '10010',
  city: 'Zagreb',
  country: 'Hrvatska',
  countryCode: 'HR',
  oib: '23152585818',
  mb: '99210363',
  activity: '62109 Ostalo računalno programiranje',
  founded: '2026',
  email: 'info@cenner.hr',
  supportEmail: 'support@cenner.hr',
  phone: '+385 99 352 5500',
  phoneHref: 'tel:+385993525500',
} as const;

/** "Mikulinci 8, 10010 Zagreb" */
export const companyAddress = `${COMPANY.street}, ${COMPANY.postcode} ${COMPANY.city}`;
