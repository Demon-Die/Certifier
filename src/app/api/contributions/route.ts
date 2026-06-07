import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const PAGE_SIZE = 15;

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '0', 10);
  const family = searchParams.get('family');
  const tier = searchParams.get('tier');
  const search = searchParams.get('search');

  const supabase = createAdminClient();
  let query = supabase
    .from('contributions')
    .select('*', { count: 'exact' })
    .eq('user_id', session.user.id)
    .order('merged_at', { ascending: false });

  if (family && family !== 'all') {
    query = query.eq('family', family as 'frontend' | 'backend' | 'docs' | 'ideas' | 'community');
  }
  if (tier && tier !== 'all') {
    query = query.eq('tier', tier as 'imp' | 'fiend' | 'overlord' | 'demon king');
  }
  if (search && search.trim()) {
    query = query.ilike('pr_title', `%${search.trim()}%`);
  }

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, count } = await query;

  return NextResponse.json({
    data: (data || []) as Record<string, unknown>[],
    totalCount: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });
}
