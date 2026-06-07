import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const [badgesRes, nominationsRes, profilesRes] = await Promise.all([
    supabase.from('special_badges').select('*').order('name'),
    supabase.from('special_nominations').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, github_username').order('github_username'),
  ]);

  return NextResponse.json({
    badges: badgesRes.data || [],
    nominations: nominationsRes.data || [],
    profiles: profilesRes.data || [],
  });
}
