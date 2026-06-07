import { type Family, type Tier } from '@/lib/points';

/**
 * Certifier group (template) IDs for each family × tier combination.
 *
 * Users must create 20 badge templates in their Certifier dashboard,
 * then set the CERTIFIER_TEMPLATES env var as a JSON string:
 *
 *   CERTIFIER_TEMPLATES='{"frontend:imp":"grp_id_1","frontend:fiend":"grp_id_2",...}'
 *
 * The templateGroupId is the `groupId` from Certifier (the credential group/template ID).
 */

function getTemplateMapping(): Record<string, string> {
  try {
    const raw = process.env.CERTIFIER_TEMPLATES;
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    console.error('[badges] Invalid CERTIFIER_TEMPLATES env var');
    return {};
  }
}

export function getTemplateGroupId(family: Family, tier: Tier): string | null {
  const mapping = getTemplateMapping();
  return mapping[`${family}:${tier}`] || null;
}

export function getBadgeDisplayName(family: Family, tier: Tier): string {
  const familyNames: Record<Family, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    docs: 'Documentation',
    ideas: 'Ideas',
    community: 'Community',
  };
  const tierNames: Record<Tier, string> = {
    imp: 'Imp',
    fiend: 'Fiend',
    overlord: 'Overlord',
    'demon king': 'Demon King',
  };
  return `${familyNames[family]} ${tierNames[family === 'community' ? tier : tier]}`;
}

export const CERTIFIER_IS_CONFIGURED = (() => {
  try {
    const hasApiKey = !!process.env.CERTIFIER_API_KEY;
    const templates = process.env.CERTIFIER_TEMPLATES;
    if (!hasApiKey || !templates) return false;
    // Only consider configured if at least one template mapping exists
    const parsed = JSON.parse(templates);
    return Object.keys(parsed).length > 0;
  } catch {
    return false;
  }
})();
