import type { PixelIcon } from './PixelIcon';
import {
  PxShoppingBag as ShoppingBag, PxBriefcase as Briefcase, PxLabel as Tag, PxUserPlus as UserPlus,
  PxBookOpen as BookOpen, PxUsers as Users, PxGift as Gift, PxMail as Mail, PxInfoBox as Info, PxFolder as FolderOpen,
} from './PixelIcon';
import { useT } from '../i18n';

/*
 * The site's navigation, in one place: the page nav (Layout) and the homepage desktop's
 * Start menu (pages/Home) both read it, so a new page only has to be added here.
 */

// icons: the pixel set (components/PixelIcon), drawn on the same grid as the pixel lettering
export interface NavItem { label: string; path: string; icon: PixelIcon; desc?: string }

export const LANGUAGES = [
  { code: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'HR', flag: '🇭🇷', name: 'Hrvatski' },
  { code: 'DE', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'ES', flag: '🇪🇸', name: 'Español' },
  { code: 'IT', flag: '🇮🇹', name: 'Italiano' },
];

export function useSiteNav() {
  const t = useT();
  // the Marketplace (AI job matching's waitlist is a block on it now, not a page of its own)
  const market: NavItem[] = [
    { label: t('Marketplace'), path: '/marketplace', icon: ShoppingBag, desc: t('Browse all freelancer listings') },
  ];
  // the plain links, in nav order
  const links: NavItem[] = [
    { label: t('Services'), path: '/services', icon: Briefcase, desc: t('Websites, apps and automations, built in-house') },
    { label: t('Pricing'), path: '/subscription', icon: Tag, desc: t('Plans and fees') },
    { label: t('Blog'), path: '/blog', icon: BookOpen },
    { label: t('Community'), path: '/community', icon: Users },
    { label: t('Refer & Win'), path: '/referral', icon: Gift },
    { label: t('Contact'), path: '/about#kontakt', icon: Mail },
  ];
  // the "O nama" dropdown (Contact is part of About now; Projects and Technology are part of Services)
  const about: NavItem[] = [
    { label: t('About Us'), path: '/about', icon: Info, desc: t('Who we are, company details and contact') },
    { label: t('Previous Projects'), path: '/services#radovi', icon: FolderOpen, desc: t("Work we've delivered") },
  ];
  return { market, links, about };
}
