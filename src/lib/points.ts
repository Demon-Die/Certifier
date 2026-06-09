export const VALID_FAMILIES = ['frontend', 'backend', 'docs', 'community'] as const;
export type Family = (typeof VALID_FAMILIES)[number];

export const VALID_TIERS = ['imp', 'fiend', 'overlord', 'demon king'] as const;
export type Tier = (typeof VALID_TIERS)[number];

export const TIER_POINTS: Record<Tier, number> = {
  imp: 1,
  fiend: 3,
  overlord: 9,
  'demon king': 27,
};

export const BADGE_THRESHOLDS: Record<Tier, number> = {
  imp: 5,
  fiend: 15,
  overlord: 45,
  'demon king': 135,
};

export const BADGE_TIER_ORDER: Tier[] = ['imp', 'fiend', 'overlord', 'demon king'];

export function calculatePoints(tier: Tier): number {
  return TIER_POINTS[tier] || 0;
}

export function getBadgeTier(points: number): Tier | null {
  for (let i = BADGE_TIER_ORDER.length - 1; i >= 0; i--) {
    const tier = BADGE_TIER_ORDER[i];
    if (points >= BADGE_THRESHOLDS[tier]) return tier;
  }
  return null;
}

export function getNextBadgeThreshold(points: number): { tier: Tier; threshold: number } | null {
  const currentTier = getBadgeTier(points);
  if (!currentTier) return { tier: 'imp', threshold: BADGE_THRESHOLDS.imp };

  const currentIndex = BADGE_TIER_ORDER.indexOf(currentTier);
  if (currentIndex >= BADGE_TIER_ORDER.length - 1) return null;

  const nextTier = BADGE_TIER_ORDER[currentIndex + 1];
  return { tier: nextTier, threshold: BADGE_THRESHOLDS[nextTier] };
}

export function getProgressToNext(points: number): {
  current: number;
  target: number;
  percentage: number;
} {
  const next = getNextBadgeThreshold(points);
  if (!next) return { current: points, target: points, percentage: 100 };

  const currentTier = getBadgeTier(points);
  const currentThreshold = currentTier ? BADGE_THRESHOLDS[currentTier] : 0;
  const progress = points - currentThreshold;
  const needed = next.threshold - currentThreshold;

  return {
    current: progress,
    target: needed,
    percentage: Math.min(100, Math.round((progress / needed) * 100)),
  };
}

export function isValidFamily(family: string): family is Family {
  return VALID_FAMILIES.includes(family as Family);
}

export function isValidTier(tier: string): tier is Tier {
  return VALID_TIERS.includes(tier as Tier);
}
