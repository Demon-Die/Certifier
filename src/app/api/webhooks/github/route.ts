import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { verifySignature, parsePullRequestPayload, extractFamilyTierLabels } from '@/lib/webhook';
import { calculatePoints, type Tier, BADGE_THRESHOLDS } from '@/lib/points';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256') || '';
  const eventName = request.headers.get('x-github-event') || '';

  // Only accept push and pull_request events
  if (eventName !== 'pull_request') {
    return NextResponse.json({ received: true, processed: false });
  }

  // Fetch settings
  const supabase = createServerClient();
  const { data: settings } = await supabase
    .from('maintainer_settings')
    .select('webhook_secret, tracked_repos, github_org_name')
    .eq('id', 1)
    .single();

  if (!settings?.webhook_secret) {
    console.error('[webhook] Webhook secret not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // Verify signature
  if (!verifySignature(body, signature, settings.webhook_secret)) {
    console.warn('[webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Parse payload
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const prPayload = parsePullRequestPayload(payload);
  if (!prPayload) {
    return NextResponse.json({ received: true, processed: false, reason: 'not a merged PR' });
  }

  // Validate repo is tracked
  const repoFullName = prPayload.pull_request.base.repo.full_name;
  const trackedRepos = (settings.tracked_repos as string[]) || [];
  if (!trackedRepos.includes(repoFullName)) {
    console.log(`[webhook] Repo ${repoFullName} not tracked`);
    return NextResponse.json({ received: true, processed: false, reason: 'repo not tracked' });
  }

  // Extract labels
  const labels = extractFamilyTierLabels(prPayload.pull_request.labels);
  if (labels.length === 0) {
    return NextResponse.json({ received: true, processed: false, reason: 'no valid labels' });
  }

  // Calculate points
  const awards = labels.map(({ family, tier, label }) => ({
    family: family,
    tier: tier,
    label,
    points: calculatePoints(tier as Tier),
  }));

  // Find user by GitHub username
  const authorUsername = prPayload.pull_request.user.login;
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('github_username', authorUsername)
    .single();

  if (!profile) {
    console.log(`[webhook] User ${authorUsername} not found (not registered)`);
    return NextResponse.json({ received: true, processed: false, reason: 'user not registered' });
  }

  // Award points and log contributions
  for (const award of awards) {
    const column = `points_${award.family}`;

    // Update points
    await supabase.rpc('increment_points', {
      p_user_id: profile.id,
      p_column: column,
      p_points: award.points,
    });

    // Log contribution
    const insertPayload = {
      user_id: profile.id,
      repo: repoFullName,
      pr_number: prPayload.pull_request.number,
      pr_title: prPayload.pull_request.title,
      pr_url: prPayload.pull_request.html_url,
      merged_at: prPayload.pull_request.merged_at || new Date().toISOString(),
      family: award.family as 'frontend' | 'backend' | 'docs' | 'ideas' | 'community',
      tier: award.tier as 'imp' | 'fiend' | 'overlord' | 'demon king',
      points_awarded: award.points,
      label_used: award.label,
    };
    await supabase.from('contributions').insert(insertPayload);

    // Check for new badge thresholds
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select(column)
      .eq('id', profile.id)
      .single();

    if (currentProfile && typeof currentProfile === 'object' && !Array.isArray(currentProfile)) {
      type PointsRecord = { [key: string]: number };
      const record = currentProfile as unknown as PointsRecord;
      const totalPoints = record[column] || 0;

      const newBadges: string[] = [];
      if (totalPoints >= BADGE_THRESHOLDS.imp) newBadges.push('imp');
      if (totalPoints >= BADGE_THRESHOLDS.fiend) newBadges.push('fiend');
      if (totalPoints >= BADGE_THRESHOLDS.overlord) newBadges.push('overlord');
      if (totalPoints >= BADGE_THRESHOLDS['demon king']) newBadges.push('demon king');

      for (const badgeTier of newBadges) {
        await supabase.from('badge_claims').upsert(
          {
            user_id: profile.id,
            family: award.family as 'frontend' | 'backend' | 'docs' | 'ideas' | 'community',
            tier: badgeTier as 'imp' | 'fiend' | 'overlord' | 'demon king',
            status: 'available' as const,
          },
          { onConflict: 'user_id,family,tier', ignoreDuplicates: true }
        );
      }
    }
  }

  return NextResponse.json({
    received: true,
    processed: true,
    pr_number: prPayload.pull_request.number,
    repo: repoFullName,
    author: authorUsername,
    awards,
    total_points: awards.reduce((sum, a) => sum + a.points, 0),
  });
}
