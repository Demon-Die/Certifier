'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-guards';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface SettingsRow {
  github_org_name: string;
  tracked_repos: unknown;
  webhook_secret: string;
}

async function fetchSettingsRaw(): Promise<SettingsRow | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/maintainer_settings?id=eq.1&select=github_org_name,tracked_repos,webhook_secret`,
    {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      cache: 'no-store',
    }
  );
  if (res.status === 404 || res.status === 406) return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch settings: ${body}`);
  }
  const rows = (await res.json()) as SettingsRow[];
  return rows[0] ?? null;
}

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
  const row = await fetchSettingsRaw();
  if (!row) return null;

  return {
    github_org_name: row.github_org_name,
    tracked_repos: row.tracked_repos as string[],
    webhook_secret: row.webhook_secret,
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

  const body = {
    github_org_name: input.github_org_name.trim(),
    tracked_repos: input.tracked_repos.map((r) => r.trim()),
    webhook_secret: input.webhook_secret,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/maintainer_settings?id=eq.1`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({ id: 1, ...body }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update settings: ${text}`);
  }

  const rows = (await res.json()) as SettingsRow[];
  const data = rows[0];

  revalidatePath('/admin');

  return {
    github_org_name: data.github_org_name,
    tracked_repos: data.tracked_repos as string[],
    webhook_secret: data.webhook_secret,
  };
}
