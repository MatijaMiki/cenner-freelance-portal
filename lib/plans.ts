/**
 * The freelancer plans' money facts, in one place (they were repeated, and had drifted: the
 * profile said Pro took 8% where the pricing page says 10%). Cenner's fee is taken from each
 * project a freelancer delivers through cenner.hr: 15% on Free, 10% on Pro, 5% on Ultra, 0% on
 * Enterprise (pages/Subscription.tsx is the public statement of these).
 */
import { priceItem } from './cjenik.js';

export type PlanId = 'FREE' | 'PRO' | 'ULTRA' | 'ENTERPRISE';

// The amounts come from the published price list (lib/cjenik.js), so the site and the cjenik
// file cannot disagree.
const plan = (name: string, id: string) => ({
  name,
  pricePerMonth: priceItem(`plan-${id}`).price,
  feePercent: priceItem(`commission-${id}`).price,
});

export const PLANS: Record<PlanId, { name: string; pricePerMonth: number; feePercent: number }> = {
  FREE: plan('Free', 'free'),
  PRO: plan('Pro', 'pro'),
  ULTRA: plan('Ultra', 'ultra'),
  ENTERPRISE: plan('Enterprise', 'enterprise'),
};

/** A user's plan from their `tier` (any case; unknown or missing means Free). */
export function planOf(tier?: string | null): PlanId {
  const id = (tier || '').toUpperCase();
  return id in PLANS ? (id as PlanId) : 'FREE';
}
