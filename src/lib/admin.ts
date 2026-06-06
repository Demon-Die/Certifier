'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/auth-guards';

export type MaintainerSettings = {
  github_org_name: string;
  tracked_repos: string[];
  webhook_secret: string;
};

export type SettingsInput = {
  github_org_name: string;
  tracked_repos: string[];
  webhook_secret: string;
};

/**
 * Validate settings input
 */
function validateSettings(data: SettingsInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.github_org_name || data.github_org_name.trim().length === 0) {
    errors.push('GitHub organization name is required');
  }

  if (!Array.isArray(data.tracked_repos)) {
    errors.push('Tracked repositories must be an array');
  } else {
    // Check for duplicates
    const uniqueRepos = new Set(data.tracked_repos);
    if (uniqueRepos.size !== data.tracked_repos.length) {
      errors.push('Duplicate repositories are not allowed');
    }
    // Validate format: owner/repo
    for (const repo of data.tracked_repos) {
      if (!repo || repo.trim().length === 0) {
        errors.push('Repository names cannot be empty');
      } else if (!/^[^/]+\/[^/]+$/.test(repo.trim())) {
        errors.push(`Invalid repository format: "${repo}". Expected format: owner/repo`);
      }
    }
  }

  if (!data.webhook_secret || data.webhook_secret.length < 20) {
    errors.push('Webhook secret must be at least 20 characters');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get maintainer settings from database
 * Returns null if not found
 */
export async function getSettings(): Promise<MaintainerSettings | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('maintainer_settings')
    .select('github_org_name, tracked_repos, webhook_secret')
    .eq('id', 1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    throw new Error(`Failed to fetch settings: ${error.message}`);
  }

  return {
    github_org_name: data.github_org_name,
    tracked_repos: data.tracked_repos as string[],
    webhook_secret: data.webhook_secret,
  };
}

/**
 * Update maintainer settings in database
 * Upserts row with id=1
 */
export async function updateSettings(input: SettingsInput): Promise<MaintainerSettings> {
  // Validate input
  const validation = validateSettings(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }

  // Check admin role
  await requireAdmin();

  const session = await auth();
  const userId = session?.user?.id;

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('maintainer_settings')
    .upsert(
      {
        id: 1,
        github_org_name: input.github_org_name.trim(),
        tracked_repos: input.tracked_repos.map((r) => r.trim()),
        webhook_secret: input.webhook_secret,
        updated_by: userId,
      },
      { onConflict: 'id' }
    )
    .select('github_org_name, tracked_repos, webhook_secret')
    .single();

  if (error) {
    throw new Error(`Failed to update settings: ${error.message}`);
  }

  revalidatePath('/admin');

  return {
    github_org_name: data.github_org_name,
    tracked_repos: data.tracked_repos as string[],
    webhook_secret: data.webhook_secret,
  };
}
