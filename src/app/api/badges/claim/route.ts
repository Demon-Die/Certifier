import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { claimBadgeWithFallback } from '@/lib/certifier';
import { getTemplateGroupId, getBadgeDisplayName, CERTIFIER_IS_CONFIGURED } from '@/lib/badges';
import { type Family, type Tier } from '@/lib/points';
import { claimBadgeSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = claimBadgeSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { family, tier } = parsed.data;

    // Verify badge is available for this user (admin client bypasses RLS)
    const supabase = createAdminClient();
    const { data: badgeClaim, error: lookupError } = await supabase
      .from('badge_claims')
      .select('id, status')
      .eq('user_id', session.user.id)
      .eq('family', family)
      .eq('tier', tier)
      .single();

    if (lookupError) {
      console.error('Claim: badge lookup error:', lookupError);
      return NextResponse.json({ error: 'Badge lookup failed' }, { status: 500 });
    }

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
      const { error: updateError } = await supabase
        .from('badge_claims')
        .update({ status: 'claimed', claimed_at: new Date().toISOString() })
        .eq('id', badgeClaim.id);

      if (updateError) {
        console.error('Claim: update error:', updateError);
        return NextResponse.json({ error: 'Failed to update badge status' }, { status: 500 });
      }

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
          error: 'No certifier template configured for this badge. Set CERTIFIER_ACCOUNTS env var.',
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

    // Execute multi-account claim flow with fallback across accounts
    const result = await claimBadgeWithFallback(
      family as string,
      tier as string,
      groupId,
      recipient
    );

    if (result.rateLimited) {
      return NextResponse.json(
        {
          error: 'Certifier rate limit exceeded on all accounts. Try again later.',
          rateLimited: true,
        },
        { status: 429 }
      );
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Update badge_claims record with credential ID and account index
    const credentialId = result.publicId || result.credentialId;
    const { error: updateError } = await supabase
      .from('badge_claims')
      .update({
        status: 'claimed',
        claimed_at: new Date().toISOString(),
        certifier_credential_id: credentialId,
        certifier_account_index: result.accountIndex,
      })
      .eq('id', badgeClaim.id);

    if (updateError) {
      console.error('Claim: final update error:', updateError);
      return NextResponse.json({ error: 'Failed to update badge' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      credentialId,
      accountIndex: result.accountIndex,
      message: `Badge "${badgeName}" has been issued! Check your email.`,
    });
  } catch (err) {
    console.error('Claim: unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: claims } = await supabase
    .from('badge_claims')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ data: claims || [] });
}
