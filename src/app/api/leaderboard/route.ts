import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export interface LeaderboardEntry {
  github_username: string;
  role: string;
  points_frontend: number;
  points_backend: number;
  points_docs: number;
  points_community: number;
  total_points: number;
  badges_count: number;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Fetch all profiles with their points
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(
      'github_username, role, points_frontend, points_backend, points_docs, points_community'
    );

  if (error) {
    console.error('[leaderboard] Failed to fetch profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }

  // Fetch badge counts for all users
  const { data: badgeCounts } = await supabase
    .from('badge_claims')
    .select('user_id')
    .eq('status', 'claimed');

  // Build a map of user_id → badge count
  const badgeCountMap: Record<string, number> = {};
  if (badgeCounts) {
    for (const row of badgeCounts) {
      badgeCountMap[row.user_id] = (badgeCountMap[row.user_id] || 0) + 1;
    }
  }

  // Compute total points and sort
  const entries: LeaderboardEntry[] = (profiles || []).map((p) => {
    const total =
      (p.points_frontend || 0) +
      (p.points_backend || 0) +
      (p.points_docs || 0) +
      (p.points_community || 0);
    return {
      github_username: p.github_username,
      role: p.role,
      points_frontend: p.points_frontend || 0,
      points_backend: p.points_backend || 0,
      points_docs: p.points_docs || 0,
      points_community: p.points_community || 0,
      total_points: total,
      badges_count: badgeCountMap[p.github_username] || 0,
    };
  });

  // Sort by total_points descending
  entries.sort((a, b) => b.total_points - a.total_points);

  // Current user's rank
  const currentUserId = session.user.id;
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('github_username')
    .eq('id', currentUserId)
    .single();

  const currentUserRank = currentProfile
    ? entries.findIndex((e) => e.github_username === currentProfile.github_username) + 1
    : null;

  return NextResponse.json({
    entries,
    totalUsers: entries.length,
    currentUserRank,
    currentUser: currentProfile?.github_username || null,
  });
}
