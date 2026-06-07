'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFamilyConfig } from '@/lib/dashboard';
import { getBadgeDisplayName } from '@/lib/badges';
import { SkeletonBadgeGrid } from '@/components/ui/skeleton';
import { Award, ExternalLink } from 'lucide-react';
import type { Family, Tier } from '@/lib/points';

interface ClaimedBadge {
  id: string;
  family: string;
  tier: string;
  status: string;
  certifier_credential_id: string | null;
  claimed_at: string | null;
  created_at: string;
}

export function ClaimedBadges() {
  const [badges, setBadges] = useState<ClaimedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch('/api/badges/claimed');
        const json = await res.json();
        setBadges(json.data || []);
      } catch {
        setBadges([]);
      }
      setLoading(false);
    };
    fetchBadges();

    // Poll every 30s as fallback
    const interval = setInterval(fetchBadges, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Claimed Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonBadgeGrid count={6} />
        </CardContent>
      </Card>
    );
  }

  if (badges.length === 0) return null;

  const claimed = badges.filter((b) => b.status === 'claimed');

  if (claimed.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="h-5 w-5" aria-hidden="true" />
          Claimed Badges ({claimed.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {claimed.map((badge) => {
            const config = getFamilyConfig(badge.family as Family);
            const name = getBadgeDisplayName(badge.family as Family, badge.tier as Tier);
            return (
              <div
                key={badge.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
              >
                <span className="text-2xl" aria-hidden="true">
                  {config.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    Claimed{' '}
                    {badge.claimed_at
                      ? new Date(badge.claimed_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''}
                  </p>
                  {badge.certifier_credential_id && (
                    <a
                      href={`https://app.certifier.io/credentials/${badge.certifier_credential_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      View credential
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
