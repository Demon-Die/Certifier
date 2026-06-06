import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== 'maintainer' && role !== 'admin') {
    return NextResponse.json({ error: 'Only maintainers and admins can vote' }, { status: 403 });
  }

  const body: { nominationId?: string } = await request.json();
  const { nominationId } = body;

  if (!nominationId) {
    return NextResponse.json({ error: 'nominationId is required' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Fetch nomination
  const { data: nomination } = await supabase
    .from('special_nominations')
    .select('id, badge_id, nominee_id, nominated_by, votes, status')
    .eq('id', nominationId)
    .single();

  if (!nomination) {
    return NextResponse.json({ error: 'Nomination not found' }, { status: 404 });
  }

  if (nomination.status !== 'voting') {
    return NextResponse.json({ error: 'This nomination is not in voting status' }, { status: 400 });
  }

  if (nomination.nominated_by === session.user.id) {
    return NextResponse.json({ error: 'Cannot vote for your own nomination' }, { status: 400 });
  }

  const newVotes = nomination.votes + 1;

  // Increment votes
  await supabase.from('special_nominations').update({ votes: newVotes }).eq('id', nominationId);

  // Check if vote threshold reached (3 votes = awarded)
  if (newVotes >= 3) {
    // Award the badge
    await supabase
      .from('special_badges')
      .update({
        awarded_to: nomination.nominee_id,
        awarded_at: new Date().toISOString(),
      })
      .eq('id', nomination.badge_id);

    await supabase.from('special_nominations').update({ status: 'awarded' }).eq('id', nominationId);

    // Also create a badge_claim entry for the nominee
    await supabase.from('badge_claims').upsert(
      {
        user_id: nomination.nominee_id,
        family: 'community',
        tier: 'imp',
        status: 'available',
      },
      { onConflict: 'user_id,family,tier', ignoreDuplicates: true }
    );
  }

  return NextResponse.json({ success: true });
}
