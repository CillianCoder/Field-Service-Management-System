export const FEATURE_AREAS = [
  "auth",
  "customers",
  "technicians",
  "work-orders",
  "dashboard",
] as const;

export type FeatureArea = (typeof FEATURE_AREAS)[number];
