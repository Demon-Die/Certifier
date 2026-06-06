import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { claimBadge } from '@/lib/certifier';
import { getTemplateGroupId, getBadgeDisplayName, CERTIFIER_IS_CONFIGURED } from '@/lib/badges';
import { type Family, type Tier } from '@/lib/points';
import { claimBadgeSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { family: string; tier: string };
  try {
    body = claimBadgeSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { family, tier } = body;

  // Verify badge is available for this user
  const supabase = createServerClient();
  const { data: badgeClaim } = await supabase
    .from('badge_claims')
    .select('id, status')
    .eq('user_id', session.user.id)
    .eq('family', family)
    .eq('tier', tier)
    .single();

  if (!badgeClaim) {
    return NextResponse.json(
      { error: 'No badge available to claim for this family/tier' },
      { status: 404 }
    );
  }

  if (badgeClaim.status !== 'available') {
    return NextResponse.json({ error: 'Badge already claimed' }, { status: 409 });
  }

  // If certifier is not configured, mark as claimed without external API call
  if (!CERTIFIER_IS_CONFIGURED) {
    await supabase
      .from('badge_claims')
      .update({ status: 'claimed', claimed_at: new Date().toISOString() })
      .eq('id', badgeClaim.id);

    return NextResponse.json({
      success: true,
      message: 'Badge marked as claimed. Configure certifier.io to issue digital credentials.',
    });
  }

  // Get the certifier template group ID
  const groupId = getTemplateGroupId(family as Family, tier as Tier);
  if (!groupId) {
    return NextResponse.json(
      {
        error: 'No certifier template configured for this badge. Set CERTIFIER_TEMPLATES env var.',
      },
      { status: 500 }
    );
  }

  // Fetch user profile for recipient info
  const { data: profile } = await supabase
    .from('profiles')
    .select('github_username')
    .eq('id', session.user.id)
    .single();

  const recipient = {
    name: session.user.name || profile?.github_username || 'Contributor',
    email: session.user.email || '',
  };

  const badgeName = getBadgeDisplayName(family as Family, tier as Tier);

  // Execute claim flow
  const result = await claimBadge(groupId, recipient, {
    'custom.badge': badgeName,
    'custom.github_username': profile?.github_username || '',
  });

  if (result.rateLimited) {
    return NextResponse.json(
      { error: 'Certifier rate limit exceeded. Try again later.', rateLimited: true },
      { status: 429 }
    );
  }

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // Update badge_claims record with credential ID
  await supabase
    .from('badge_claims')
    .update({
      status: 'claimed',
      claimed_at: new Date().toISOString(),
      certifier_credential_id: result.credentialId,
    })
    .eq('id', badgeClaim.id);

  return NextResponse.json({
    success: true,
    credentialId: result.credentialId,
    message: `Badge "${badgeName}" has been issued! Check your email.`,
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data: claims } = await supabase
    .from('badge_claims')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ data: claims || [] });
}
