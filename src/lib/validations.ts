import { z } from 'zod';

export const claimBadgeSchema = z.object({
  family: z.enum(['frontend', 'backend', 'docs', 'ideas', 'community']),
  tier: z.enum(['imp', 'fiend', 'overlord', 'demon king']),
});

export const nominateSchema = z.object({
  badgeId: z.string().uuid(),
  nomineeId: z.string().uuid(),
});

export const voteSchema = z.object({
  nominationId: z.string().uuid(),
});

export const adminSettingsSchema = z.object({
  github_org_name: z.string().min(1).max(100),
  tracked_repos: z.array(z.string()),
  webhook_secret: z.string().min(1),
});
