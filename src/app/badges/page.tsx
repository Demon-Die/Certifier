'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getFamilyConfig } from '@/lib/dashboard';
import { ALL_FAMILIES } from '@/lib/dashboard';
import { BADGE_THRESHOLDS, BADGE_TIER_ORDER, type Family, type Tier } from '@/lib/points';
import { getBadgeDisplayName } from '@/lib/badges';
import { toast } from 'sonner';

interface BadgeClaim {
  id: string;
  family: Family;
  tier: Tier;
  status: 'available' | 'claimed';
}

const TIER_ICONS: Record<Tier, string> = {
  imp: '🪽',
  fiend: '🔥',
  overlord: '👑',
  'demon king': '💀',
};

const TIER_COLORS: Record<Tier, string> = {
  imp: 'border-amber-700/50 text-amber-400',
  fiend: 'border-orange-600/50 text-orange-400',
  overlord: 'border-purple-600/50 text-purple-400',
  'demon king': 'border-red-600/50 text-red-400',
};

const TIER_BG: Record<Tier, string> = {
  imp: 'bg-amber-950/20',
  fiend: 'bg-orange-950/20',
  overlord: 'bg-purple-950/20',
  'demon king': 'bg-red-950/20',
};

export default function BadgesPage() {
  const { status } = useSession();
  const [available, setAvailable] = useState<BadgeClaim[]>([]);
  const [claimed, setClaimed] = useState<BadgeClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') redirect('/auth/signin');
    if (status !== 'authenticated') return;

    Promise.all([
      fetch('/api/badges/available').then((r) => r.json()),
      fetch('/api/badges/claimed').then((r) => r.json()),
    ])
      .then(([availData, claimedData]) => {
        setAvailable((availData.data || []) as BadgeClaim[]);
        setClaimed((claimedData.data || []) as BadgeClaim[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  const handleClaim = async (family: Family, tier: Tier) => {
    setClaimingId(`${family}:${tier}`);
    try {
      const res = await fetch('/api/badges/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family, tier }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Badge claimed!');
        // Refresh
        const [availData, claimedData] = await Promise.all([
          fetch('/api/badges/available').then((r) => r.json()),
          fetch('/api/badges/claimed').then((r) => r.json()),
        ]);
        setAvailable((availData.data || []) as BadgeClaim[]);
        setClaimed((claimedData.data || []) as BadgeClaim[]);
      } else {
        toast.error(data.error || 'Failed to claim badge');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setClaimingId(null);
    }
  };

  const isAvailable = (family: Family, tier: Tier) =>
    available.some((b) => b.family === family && b.tier === tier);
  const isClaimed = (family: Family, tier: Tier) =>
    claimed.some((b) => b.family === family && b.tier === tier && b.status === 'claimed');

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen px-gutter-mobile md:px-gutter py-8 max-w-container-narrow mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-gutter-mobile md:px-gutter py-8 max-w-container mx-auto">
      {/* Terminal header */}
      <div className="mb-8 border-b border-surface-container pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block"
            aria-hidden="true"
          />
          <span className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">
            BADGES
          </span>
        </div>
        <h1 className="font-sans text-headline text-foreground">
          <span className="text-primary">{'>'}</span> All Badges
        </h1>
        <p className="font-mono text-sm text-muted-foreground mt-1">
          Earn points by merging labeled PRs to unlock badges across 5 families
        </p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-mono font-bold text-primary">{claimed.length}</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Claimed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-mono font-bold text-amber-400">{available.length}</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-mono font-bold text-muted-foreground">
              {20 - claimed.length - available.length}
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Locked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-mono font-bold text-foreground">{20}</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Badge grid: 5 families × 4 tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {ALL_FAMILIES.map((family) => {
          const config = getFamilyConfig(family);
          return (
            <Card key={family}>
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <span>{config.emoji}</span>
                  <span>{config.name}</span>
                </CardTitle>
                <p className="text-[10px] font-mono text-muted-foreground">{config.desc}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {BADGE_TIER_ORDER.map((tier) => {
                  const avail = isAvailable(family, tier);
                  const claimed = isClaimed(family, tier);
                  const threshold = BADGE_THRESHOLDS[tier];
                  const displayName = getBadgeDisplayName(family, tier);

                  return (
                    <div
                      key={tier}
                      className={`rounded border px-3 py-2.5 transition-all ${
                        claimed
                          ? `${TIER_BG[tier]} ${TIER_COLORS[tier]} border`
                          : avail
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-surface-container/50 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm">{TIER_ICONS[tier]}</span>
                          <div className="min-w-0">
                            <div className="font-mono text-xs font-medium text-foreground truncate">
                              {displayName}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground">
                              {threshold} pts
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {claimed ? (
                            <span className="text-[10px] font-mono text-green-400 border border-green-400/30 px-1.5 py-0.5 rounded">
                              ✓ Claimed
                            </span>
                          ) : avail ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] font-mono"
                              onClick={() => handleClaim(family, tier)}
                              disabled={claimingId === `${family}:${tier}`}
                            >
                              {claimingId === `${family}:${tier}` ? '...' : 'Claim'}
                            </Button>
                          ) : (
                            <span className="text-[10px] font-mono text-muted-foreground/50">
                              🔒
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Claiming info */}
      <Card className="mt-8">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs font-mono text-muted-foreground">
            <span className="text-primary">{'>'}</span> Badges become available when you earn enough
            points in a family. Merge PRs with{' '}
            <code className="bg-muted px-1 rounded">family:tier</code> labels to earn points and
            unlock badges.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
