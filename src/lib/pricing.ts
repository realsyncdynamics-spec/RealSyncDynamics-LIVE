// pricing.ts - Single source of truth fuer Pakete, Features und Stripe-Mappings

export const PLAN_KEYS = ['GRATIS', 'BRONZE', 'SILBER', 'GOLD', 'PLATIN', 'ENTERPRISE'] as const;
export type PlanKey = typeof PLAN_KEYS[number];

export const FEATURE_KEYS = [
  'trust.c2pa',
  'trust.audit_log',
  'edit.repurpose',
  'edit.batch',
  'market.listing',
  'market.analytics',
  'auto.ufo_bridge',
  'auto.scheduled',
  'compliance.pdf_export',
  'compliance.gdpr_report',
] as const;
export type FeatureKey = typeof FEATURE_KEYS[number];

export interface PlanConfig {
  key: PlanKey;
  name: string;
  priceMonthly: number;
  stripePriceId: string | null;
  features: FeatureKey[];
  limits: Partial<Record<FeatureKey, number>>;
}

export const PAKETE: Record<PlanKey, PlanConfig> = {
  GRATIS: {
    key: 'GRATIS',
    name: 'Gratis',
    priceMonthly: 0,
    stripePriceId: null,
    features: ['trust.audit_log'],
    limits: { 'trust.audit_log': 50 },
  },
  BRONZE: {
    key: 'BRONZE',
    name: 'Bronze',
    priceMonthly: 29,
    stripePriceId: 'price_bronze_monthly',
    features: ['trust.c2pa', 'trust.audit_log', 'edit.repurpose'],
    limits: { 'trust.c2pa': 100, 'edit.repurpose': 50 },
  },
  SILBER: {
    key: 'SILBER',
    name: 'Silber',
    priceMonthly: 59,
    stripePriceId: 'price_silber_monthly',
    features: ['trust.c2pa', 'trust.audit_log', 'edit.repurpose', 'edit.batch', 'market.listing'],
    limits: { 'trust.c2pa': 500, 'edit.repurpose': 200, 'market.listing': 50 },
  },
  GOLD: {
    key: 'GOLD',
    name: 'Gold',
    priceMonthly: 99,
    stripePriceId: 'price_gold_monthly',
    features: ['trust.c2pa', 'trust.audit_log', 'edit.repurpose', 'edit.batch', 'market.listing', 'market.analytics', 'auto.ufo_bridge'],
    limits: { 'trust.c2pa': 2000, 'edit.repurpose': 1000 },
  },
  PLATIN: {
    key: 'PLATIN',
    name: 'Platin',
    priceMonthly: 199,
    stripePriceId: 'price_platin_monthly',
    features: ['trust.c2pa', 'trust.audit_log', 'edit.repurpose', 'edit.batch', 'market.listing', 'market.analytics', 'auto.ufo_bridge', 'auto.scheduled', 'compliance.pdf_export'],
    limits: { 'trust.c2pa': 10000 },
  },
  ENTERPRISE: {
    key: 'ENTERPRISE',
    name: 'Enterprise',
    priceMonthly: 0,
    stripePriceId: null,
    features: ['trust.c2pa', 'trust.audit_log', 'edit.repurpose', 'edit.batch', 'market.listing', 'market.analytics', 'auto.ufo_bridge', 'auto.scheduled', 'compliance.pdf_export', 'compliance.gdpr_report'],
    limits: {},
  },
};

export function getPlanByStripePrice(priceId: string): PlanConfig | undefined {
  return Object.values(PAKETE).find(p => p.stripePriceId === priceId);
}

export function planHasFeature(planKey: PlanKey, feature: FeatureKey): boolean {
  return PAKETE[planKey]?.features.includes(feature) ?? false;
}

export function getFeatureLimit(planKey: PlanKey, feature: FeatureKey): number {
  return PAKETE[planKey]?.limits[feature] ?? 0;
}
