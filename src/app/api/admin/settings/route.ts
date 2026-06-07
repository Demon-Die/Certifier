import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasRole } from '@/lib/rbac';
import { maskWebhookSecret } from '@/lib/utils/mask';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.role || !hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/maintainer_settings?id=eq.1&select=github_org_name,tracked_repos,webhook_secret`,
      {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
        cache: 'no-store',
      }
    );

    if (res.status === 404 || res.status === 406) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }
    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({ error: body }, { status: 500 });
    }

    const rows = (await res.json()) as Array<{
      github_org_name: string;
      tracked_repos: unknown;
      webhook_secret: string;
    }>;
    const data = rows[0];

    if (!data) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    return NextResponse.json({
      github_org_name: data.github_org_name,
      tracked_repos: data.tracked_repos as string[],
      webhook_secret: maskWebhookSecret(data.webhook_secret),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.role || !hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const requestBody = await request.json();
    const { github_org_name, tracked_repos, webhook_secret } = requestBody;

    // Validate input
    if (!github_org_name || github_org_name.trim().length === 0) {
      return NextResponse.json({ error: 'GitHub organization name is required' }, { status: 400 });
    }

    if (!Array.isArray(tracked_repos)) {
      return NextResponse.json({ error: 'Tracked repositories must be an array' }, { status: 400 });
    }

    // Check for duplicates
    const uniqueRepos = new Set(tracked_repos);
    if (uniqueRepos.size !== tracked_repos.length) {
      return NextResponse.json(
        { error: 'Duplicate repositories are not allowed' },
        { status: 400 }
      );
    }

    // Validate format: owner/repo
    for (const repo of tracked_repos) {
      if (!repo || repo.trim().length === 0) {
        return NextResponse.json({ error: 'Repository names cannot be empty' }, { status: 400 });
      }
      if (!/^[^/]+\/[^/]+$/.test(repo.trim())) {
        return NextResponse.json(
          { error: `Invalid repository format: "${repo}". Expected format: owner/repo` },
          { status: 400 }
        );
      }
    }

    if (!webhook_secret || webhook_secret.length < 20) {
      return NextResponse.json(
        { error: 'Webhook secret must be at least 20 characters' },
        { status: 400 }
      );
    }

    const patchBody = {
      github_org_name: github_org_name.trim(),
      tracked_repos: tracked_repos.map((r: string) => r.trim()),
      webhook_secret,
    };

    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/maintainer_settings?id=eq.1`, {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(patchBody),
    });

    if (!patchRes.ok) {
      const text = await patchRes.text();
      return NextResponse.json({ error: text }, { status: 500 });
    }

    const rows = (await patchRes.json()) as Array<{
      github_org_name: string;
      tracked_repos: unknown;
      webhook_secret: string;
    }>;
    const data = rows[0];

    return NextResponse.json({
      github_org_name: data.github_org_name,
      tracked_repos: data.tracked_repos as string[],
      webhook_secret: maskWebhookSecret(data.webhook_secret),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
