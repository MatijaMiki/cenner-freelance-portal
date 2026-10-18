/**
 * The freelancer plans' money facts, in one place (they were repeated, and had drifted: the
 * profile said Pro took 8% where the pricing page says 10%). Cenner's fee is taken from each
 * project a freelancer delivers through cenner.hr: 15% on Free, 10% on Pro, 5% on Ultra, 0% on
 * Enterprise (pages/Subscription.tsx is the public statement of these).
 */
export type PlanId = 'FREE' | 'PRO' | 'ULTRA' | 'ENTERPRISE';

export const PLANS: Record<PlanId, { name: string; pricePerMonth: number; feePercent: number }> = {
  FREE: { name: 'Free', pricePerMonth: 0, feePercent: 15 },
  PRO: { name: 'Pro', pricePerMonth: 19, feePercent: 10 },
  ULTRA: { name: 'Ultra', pricePerMonth: 59, feePercent: 5 },
  ENTERPRISE: { name: 'Enterprise', pricePerMonth: 99, feePercent: 0 },
};

/** A user's plan from their `tier` (any case; unknown or missing means Free). */
export function planOf(tier?: string | null): PlanId {
  const id = (tier || '').toUpperCase();
  return id in PLANS ? (id as PlanId) : 'FREE';
}
