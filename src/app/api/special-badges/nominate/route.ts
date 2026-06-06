import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { nominateSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== 'maintainer' && role !== 'admin') {
    return NextResponse.json(
      { error: 'Only maintainers and admins can nominate' },
      { status: 403 }
    );
  }

  let body: { badgeId: string; nomineeId: string };
  try {
    body = nominateSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { badgeId, nomineeId } = body;

  if (nomineeId === session.user.id) {
    return NextResponse.json({ error: 'Cannot nominate yourself' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Verify badge exists and hasn't been awarded
  const { data: badge } = await supabase
    .from('special_badges')
    .select('id, quota, awarded_to')
    .eq('id', badgeId)
    .single();

  if (!badge) {
    return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
  }

  if (badge.awarded_to) {
    return NextResponse.json({ error: 'Badge already awarded' }, { status: 409 });
  }

  // Verify nominee exists
  const { data: nominee } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', nomineeId)
    .single();

  if (!nominee) {
    return NextResponse.json({ error: 'Nominee not found' }, { status: 404 });
  }

  // Check for duplicate nomination (same badge + same nominee still pending/voting)
  const { data: existing } = await supabase
    .from('special_nominations')
    .select('id')
    .eq('badge_id', badgeId)
    .eq('nominee_id', nomineeId)
    .in('status', ['pending', 'voting'])
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'This nominee is already nominated for this badge' },
      { status: 409 }
    );
  }

  // Create nomination with 'voting' status to start right away
  const { error } = await supabase.from('special_nominations').insert({
    badge_id: badgeId,
    nominee_id: nomineeId,
    nominated_by: session.user.id,
    status: 'voting',
    votes: 0,
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to create nomination' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
