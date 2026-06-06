import {
  getNextBadgeThreshold,
  getProgressToNext,
  BADGE_THRESHOLDS,
  BADGE_TIER_ORDER,
  type Family,
} from '@/lib/points';

export interface FamilyProgress {
  family: Family;
  points: number;
  currentTier: string | null;
  nextTier: { tier: string; threshold: number } | null;
  progress: { current: number; target: number; percentage: number };
}

export interface DashboardData {
  families: FamilyProgress[];
  totalPoints: number;
}

const FAMILY_CONFIG: Record<Family, { name: string; emoji: string; color: string; desc: string }> =
  {
    frontend: {
      name: 'Frontend',
      emoji: '🎨',
      color: 'rose',
      desc: 'UI code, components, accessibility',
    },
    backend: { name: 'Backend', emoji: '⚙️', color: 'blue', desc: 'Server logic, APIs, databases' },
    docs: {
      name: 'Documentation',
      emoji: '📚',
      color: 'green',
      desc: 'Docs, tutorials, translations',
    },
    ideas: { name: 'Ideas', emoji: '💡', color: 'yellow', desc: 'Feature proposals, UX research' },
    community: { name: 'Community', emoji: '🤝', color: 'purple', desc: 'Support, reviews, CI/CD' },
  };

export const ALL_FAMILIES: Family[] = ['frontend', 'backend', 'docs', 'ideas', 'community'];

export function getFamilyProgress(family: Family, points: number): FamilyProgress {
  let currentTier: string | null = null;
  for (let i = BADGE_TIER_ORDER.length - 1; i >= 0; i--) {
    if (points >= BADGE_THRESHOLDS[BADGE_TIER_ORDER[i]]) {
      currentTier = BADGE_TIER_ORDER[i];
      break;
    }
  }
  const next = getNextBadgeThreshold(points);
  const progress = getProgressToNext(points);
  return { family, points, currentTier, nextTier: next, progress };
}

export function getFamilyConfig(family: Family) {
  return FAMILY_CONFIG[family];
}
