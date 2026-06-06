import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';
import { hasRole } from '@/lib/rbac';
import { maskWebhookSecret } from '@/lib/utils/mask';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.role || !hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('maintainer_settings')
      .select('github_org_name, tracked_repos, webhook_secret')
      .eq('id', 1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
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

    const body = await request.json();
    const { github_org_name, tracked_repos, webhook_secret } = body;

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

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('maintainer_settings')
      .upsert(
        {
          id: 1,
          github_org_name: github_org_name.trim(),
          tracked_repos: tracked_repos.map((r: string) => r.trim()),
          webhook_secret,
          updated_by: session.user.id,
        },
        { onConflict: 'id' }
      )
      .select('github_org_name, tracked_repos, webhook_secret')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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
