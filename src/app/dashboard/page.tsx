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
import { toast } from 'sonner';
import { GitBranch, Award, Star, User, Shield, Loader2, Trophy, GitCommit } from 'lucide-react';
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
        toast.error(
          data.rateLimited
            ? 'Monthly quota exceeded. Try again next month.'
            : data.error || 'Claim failed'
        );
      }
    } catch {
      toast.error('Claim failed. Please try again.');
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
          <CardTitle className="text-lg font-mono">
            <span className="text-primary">{'>'}</span> Claimable Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-sm text-muted-foreground">
            No badges available to claim. Keep contributing!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-mono">
          <span className="text-primary">{'>'}</span> Claimable Badges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {badges.map((badge) => {
          const config = getFamilyConfig(badge.family as Family);
          return (
            <div
              key={badge.id}
              className="flex items-center justify-between p-3 bg-muted/50 border border-surface-container glow-hover hover:border-primary"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{config.emoji}</span>
                <div>
                  <p className="font-mono text-sm font-medium">
                    {config.name} - {badge.tier}
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">Available to claim</p>
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
    <Badge variant={variants[role] || 'secondary'} className="gap-1 font-mono">
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
      <div className="container mx-auto py-16 px-4 text-center">
        <p className="font-mono text-muted-foreground">
          <span className="text-primary">{'>'}</span> Please sign in to view your dashboard.
        </p>
      </div>
    );
  }

  const githubUsername = session.user.githubUsername || 'Unknown';
  const role = session.user.role || 'contributor';

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="font-mono text-sm text-muted-foreground mt-4">
          <span className="text-primary">{'>'}</span> Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-gutter-mobile md:px-gutter py-8 max-w-container-max mx-auto">
      {/* Terminal header */}
      <div className="mb-8 border-b border-surface-container pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" aria-hidden="true" />
              <span className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">
                USER_DASHBOARD
              </span>
            </div>
            <h1 className="font-sans text-headline text-foreground">
              Welcome back,{' '}
              <span className="text-primary">{session.user.name || githubUsername}</span>
            </h1>
            <p className="font-mono text-sm text-muted-foreground mt-1">
              <span className="text-primary">{'>'}</span> Your contribution dashboard
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role={role} />
          </div>
        </div>
      </div>

      {data && (
        <>
          {/* Stats cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <div className="md:col-span-1 flex items-center gap-4 p-4 bg-card border border-surface-container glow-hover hover:border-primary">
              <div className="p-3 border border-primary rounded-full bg-primary/10">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">
                  GitHub
                </p>
                <p className="font-mono text-sm font-medium">@{githubUsername}</p>
              </div>
            </div>
            <div className="md:col-span-2 flex items-center gap-4 p-4 bg-card border border-surface-container glow-hover hover:border-primary">
              <div className="p-3 border border-success rounded-full bg-success/10">
                <Award className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">
                  Total Points
                </p>
                <p className="font-mono text-sm font-medium">{data.totalPoints}</p>
              </div>
            </div>
            <div className="md:col-span-1 flex items-center gap-4 p-4 bg-card border border-surface-container glow-hover hover:border-primary">
              <div className="p-3 border border-warning rounded-full bg-warning/10">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">
                  Families
                </p>
                <p className="font-mono text-sm font-medium">
                  {data.families.filter((f) => f.points > 0).length} active
                </p>
              </div>
            </div>
          </div>

          {/* Family Progress section */}
          <div className="mb-4 flex items-center justify-between border-b border-surface-container pb-3">
            <h2 className="font-mono text-sm font-medium">
              <span className="text-primary">{'>'}</span> Family Progress
            </h2>
            <div className="flex items-center gap-3">
              <a
                href="/special-badges"
                className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <Trophy className="h-3.5 w-3.5" />
                Special badges
              </a>
              <a
                href="/contributions"
                className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <GitCommit className="h-3.5 w-3.5" />
                Contributions
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-10">
            {data.families.map((f) => (
              <FamilyCard key={f.family} family={f.family} points={f.points} progress={f} />
            ))}
          </div>

          <ClaimableBadges userId={session.user.id} />
          <div className="mt-6">
            <ClaimedBadges userId={session.user.id} />
          </div>
        </>
      )}
    </div>
  );
}
