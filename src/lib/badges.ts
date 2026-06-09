import { type Family, type Tier } from '@/lib/points';
import { getAccountForFamily, isCertifierConfigured } from './certifier';

/**
 * Look up the certifier template (group) ID for a given family × tier.
 *
 * Resolves from the account mapped to this family (via CERTIFIER_ACCOUNTS).
 * Supports two key formats:
 * - `${family}:${tier}` (e.g. "frontend:imp") — legacy CERTIFIER_TEMPLATES format
 * - `${tier}` (e.g. "imp") — simpler per-account format
 */
export function getTemplateGroupId(family: Family, tier: Tier): string | null {
  const account = getAccountForFamily(family);
  if (!account) return null;

  // Try full key first (legacy CERTIFIER_TEMPLATES format)
  const fullKey = account.templates[`${family}:${tier}`];
  if (fullKey) return fullKey;

  // Then try short key (per-account format where keys are just tier names)
  return account.templates[tier] || null;
}

export function getBadgeDisplayName(family: Family, tier: Tier): string {
  const familyNames: Record<Family, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    docs: 'Documentation',
    community: 'Community',
  };
  const tierNames: Record<Tier, string> = {
    imp: 'Imp',
    fiend: 'Fiend',
    overlord: 'Overlord',
    'demon king': 'Demon King',
  };
  return `${familyNames[family]} ${tierNames[tier]}`;
}

/**
 * True when at least one certifier.io account is fully configured
 * (has both API key and template mappings).
 */
export const CERTIFIER_IS_CONFIGURED: boolean = isCertifierConfigured();
