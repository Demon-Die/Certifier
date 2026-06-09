import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, parsePullRequestPayload, extractFamilyTierLabels } from '@/lib/webhook';
import { calculatePoints, isValidFamily, isValidTier, type Family, type Tier } from '@/lib/points';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getSettings() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/maintainer_settings?id=eq.1&select=webhook_secret,tracked_repos`,
    {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      cache: 'no-store',
    }
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as Array<{
    webhook_secret: string;
    tracked_repos: string[];
  }>;
  return rows[0] ?? null;
}

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256') || '';
    const event = request.headers.get('x-github-event') || '';

    // Get webhook settings
    const settings = await getSettings();
    if (!settings) {
      return NextResponse.json(
        { error: 'Webhook not configured — set up settings first' },
        { status: 500 }
      );
    }

    // Verify HMAC-SHA256 signature
    if (!verifySignature(body, signature, settings.webhook_secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Handle ping — GitHub sends this when webhook is registered
    if (event === 'ping') {
      return NextResponse.json({ ok: true, message: 'pong' });
    }

    // Only process pull_request events
    if (event !== 'pull_request') {
      return NextResponse.json({ ok: true, ignored: true, reason: `unhandled event: ${event}` });
    }

    // Parse payload — only process merged PRs
    const payload = JSON.parse(body);
    const prEvent = parsePullRequestPayload(payload);
    if (!prEvent) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'not a merged PR' });
    }

    const pr = prEvent.pull_request;
    const repoFullName = pr.base.repo.full_name;

    // Check if repo is tracked
    const trackedRepos = (settings.tracked_repos ?? []) as string[];
    if (!trackedRepos.some((r: string) => r.toLowerCase() === repoFullName.toLowerCase())) {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: `repo not tracked: ${repoFullName}`,
      });
    }

    // Extract matching family:tier labels
    const matchingLabels = extractFamilyTierLabels(pr.labels);
    if (matchingLabels.length === 0) {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: 'no valid family:tier labels found',
      });
    }

    // Look up the contributor by GitHub login — find their profiles.id
    const authorUsername = pr.user.login;
    const profileLookup = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?github_username=eq.${encodeURIComponent(authorUsername)}&select=id`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    );
    const profiles = profileLookup.ok ? (await profileLookup.json()) as Array<{ id: string }> : [];
    if (profiles.length === 0) {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: `user not registered: ${authorUsername}`,
      });
    }
    const profileId = profiles[0].id;

    const results: Array<{
      label: string;
      status: string;
      points?: number;
      error?: string;
    }> = [];

    for (const label of matchingLabels) {
      if (!isValidFamily(label.family) || !isValidTier(label.tier)) {
        results.push({ label: label.label, status: 'skipped', error: 'invalid family/tier' });
        continue;
      }

      const family = label.family as Family;
      const tier = label.tier as Tier;
      const points = calculatePoints(tier);

      // 1. Insert into contributions table (uses profiles.id which is GitHub ID text)
      const contribRes = await fetch(`${SUPABASE_URL}/rest/v1/contributions`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: profileId,
          repo: repoFullName,
          pr_number: pr.number,
          pr_title: pr.title,
          pr_url: pr.html_url,
          merged_at: pr.merged_at,
          family,
          tier,
          points_awarded: points,
          label_used: label.label,
        }),
      });

      if (!contribRes.ok) {
        const errText = await contribRes.text();
        console.error(`[webhook] contribution insert failed: ${errText}`);
        results.push({ label: label.label, status: 'error', error: errText });
        continue;
      }

      // 2. Increment points via the stored procedure
      const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_points`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_user_id: profileId,
          p_column: `points_${family}`,
          p_points: points,
        }),
      });

      if (!rpcRes.ok) {
        const errText = await rpcRes.text();
        console.error(`[webhook] increment_points failed: ${errText}`);
        results.push({ label: label.label, status: 'partial', error: errText });
      } else {
        results.push({ label: label.label, status: 'awarded', points });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error('[webhook] unhandled error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
