export const FEATURES = {
  AI: true,
  VOICE: true,
  MULTI_LANG: true,
  RICH_EDITOR: true,
} as const;

export type FeatureKey = keyof typeof FEATURES;

export const isFeatureEnabled = (feature: FeatureKey) => FEATURES[feature];
