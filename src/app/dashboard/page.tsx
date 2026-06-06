'use client';

import { useCallback, useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useSession } from 'next-auth/react';
import { FamilyCard } from '@/components/dashboard/family-card';
import { ClaimedBadges } from '@/components/dashboard/claimed-badges';
import { getFamilyProgress, ALL_FAMILIES, type DashboardData } from '@/lib/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitBranch, GitCommit, Award, Star, User, Shield, Loader2 } from 'lucide-react';
import { getFamilyConfig } from '@/lib/dashboard';
import type { Family } from '@/lib/points';

interface ClaimableBadge {
  id: string;
  family: string;
  tier: string;
}

function ClaimableBadges({ userId }: { userId: string }) {
  const [badges, setBadges] = useState<ClaimableBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const refetchBadges = useCallback(async () => {
    const supabase = createBrowserClient();
    const { data } = await supabase
      .from('badge_claims')
      .select('id, family, tier')
      .eq('user_id', userId)
      .eq('status', 'available');
    setBadges(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    const supabase = createBrowserClient();

    refetchBadges();

    const channel = supabase
      .channel(`badge-claims:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'badge_claims', filter: `user_id=eq.${userId}` },
        () => {
          refetchBadges();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetchBadges]);

  const handleClaim = async (badgeId: string, family: string, tier: string) => {
    setClaiming(badgeId);
    try {
      const res = await fetch('/api/badges/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family, tier }),
      });
      if (res.ok) {
        refetchBadges();
      } else {
        const data = await res.json();
        alert(
          data.rateLimited
            ? 'Monthly quota exceeded. Try again next month.'
            : data.error || 'Claim failed'
        );
      }
    } catch {
      alert('Claim failed. Please try again.');
    } finally {
      setClaiming(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (badges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Claimable Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No badges available to claim. Keep contributing!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Claimable Badges</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {badges.map((badge) => {
          const config = getFamilyConfig(badge.family as Family);
          return (
            <div
              key={badge.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{config.emoji}</span>
                <div>
                  <p className="font-medium">
                    {config.name} - {badge.tier}
                  </p>
                  <p className="text-xs text-muted-foreground">Available to claim</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleClaim(badge.id, badge.family, badge.tier)}
                disabled={claiming === badge.id}
              >
                {claiming === badge.id ? 'Claiming...' : 'Claim'}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function RoleBadge({ role }: { role: string }) {
  const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    admin: 'destructive',
    maintainer: 'default',
    contributor: 'secondary',
  };
  const icons: Record<string, React.ReactNode> = {
    admin: <Shield className="h-3 w-3" />,
    maintainer: <Star className="h-3 w-3" />,
    contributor: <User className="h-3 w-3" />,
  };
  return (
    <Badge variant={variants[role] || 'secondary'} className="gap-1">
      {icons[role]}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchData = async () => {
      const supabase = createBrowserClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('points_frontend, points_backend, points_docs, points_ideas, points_community')
        .eq('id', session.user.id)
        .single();

      type ProfilePoints = Record<string, number>;
      const points = (profile ?? {}) as unknown as ProfilePoints;
      const families = ALL_FAMILIES.map((family) => {
        const pts = points[`points_${family}`] || 0;
        return getFamilyProgress(family, pts);
      });
      setData({ families, totalPoints: families.reduce((s, f) => s + f.points, 0) });
      setLoading(false);
    };
    fetchData();

    // Real-time subscription
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`profile:${session.user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
        fetchData
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  if (!session?.user) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Please sign in to view your dashboard.</p>
      </div>
    );
  }

  const githubUsername = session.user.githubUsername || 'Unknown';
  const role = session.user.role || 'contributor';

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {session.user.name || githubUsername}
          </h1>
          <p className="text-muted-foreground mt-1">Your contribution dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <RoleBadge role={role} />
        </div>
      </div>

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
              <div className="p-3 bg-primary/10 rounded-full">
                <GitBranch className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">GitHub</p>
                <p className="font-medium">@{githubUsername}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
              <div className="p-3 bg-emerald-500/10 rounded-full">
                <Award className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="font-medium">{data.totalPoints}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
              <div className="p-3 bg-amber-500/10 rounded-full">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Families</p>
                <p className="font-medium">
                  {data.families.filter((f) => f.points > 0).length} active
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Family Progress</h2>
            <a
              href="/contributions"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <GitCommit className="h-4 w-4" />
              View all contributions
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-10">
            {data.families.map((f) => (
              <FamilyCard key={f.family} family={f.family} points={f.points} progress={f} />
            ))}
          </div>

          <ClaimableBadges userId={session.user.id} />
          <ClaimedBadges userId={session.user.id} />
        </>
      )}
    </div>
  );
}
