import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: badges } = await supabase
    .from('badge_claims')
    .select('id, family, tier')
    .eq('user_id', session.user.id)
    .eq('status', 'available');

  return NextResponse.json({ data: badges || [] });
}
