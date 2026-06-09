'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFamilyConfig } from '@/lib/dashboard';
import { ALL_FAMILIES } from '@/lib/dashboard';
import type { LeaderboardEntry } from '@/app/api/leaderboard/route';

export default function LeaderboardPage() {
  const { status } = useSession();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') redirect('/auth/signin');
    if (status !== 'authenticated') return;

    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries || []);
        setTotalUsers(data.totalUsers || 0);
        setCurrentUserRank(data.currentUserRank);
        setCurrentUser(data.currentUser);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen px-gutter-mobile md:px-gutter py-8 max-w-container-narrow mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

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
            RANKINGS
          </span>
        </div>
        <h1 className="font-sans text-headline text-foreground">
          <span className="text-primary">{'>'}</span> Leaderboard
        </h1>
        <p className="font-mono text-sm text-muted-foreground mt-1">
          Top contributors ranked by total points across all families
          {currentUserRank && (
            <span className="ml-2 text-primary">
              — You are #{currentUserRank} of {totalUsers}
            </span>
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-base flex items-center gap-2">
            <span className="text-primary">#</span>
            Contributor Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[48px_1fr_100px_100px_80px] gap-4 px-6 py-3 text-xs font-mono text-muted-foreground border-b border-surface-container uppercase tracking-wider">
            <span>Rank</span>
            <span>Contributor</span>
            <span className="text-right">Total Points</span>
            <span className="text-right">Badges</span>
            <span className="text-right">Role</span>
          </div>

          {entries.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground font-mono text-sm">
              No contributors yet. Merge some PRs to get started!
            </div>
          ) : (
            entries.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.github_username === currentUser;
              const isTop3 = index < 3;

              return (
                <div
                  key={entry.github_username}
                  className={`grid grid-cols-[40px_1fr] md:grid-cols-[48px_1fr_100px_100px_80px] gap-2 md:gap-4 px-4 md:px-6 py-4 items-center border-b border-surface-container/50 last:border-0 transition-colors ${
                    isCurrentUser ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/30'
                  }`}
                >
                  {/* Rank */}
                  <div className="font-mono text-sm font-bold text-center">
                    {isTop3 ? (
                      <span className={`text-lg ${rankColors[index]}`}>
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">#{rank}</span>
                    )}
                  </div>

                  {/* Contributor name + family breakdown */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-foreground truncate">
                        {entry.github_username}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] font-mono text-primary border border-primary/30 px-1.5 py-0.5 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    {/* Family points bar - desktop only */}
                    <div className="hidden md:flex items-center gap-1.5 mt-1.5">
                      {ALL_FAMILIES.map((family) => {
                        const key = `points_${family}` as const;
                        const points = entry[key as keyof LeaderboardEntry] as number;
                        if (points === 0) return null;
                        const config = getFamilyConfig(family);
                        return (
                          <span
                            key={family}
                            className="text-[10px] font-mono text-muted-foreground"
                            title={`${config.name}: ${points} pts`}
                          >
                            {config.emoji}
                            {points}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total Points */}
                  <div className="hidden md:block text-right">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {entry.total_points}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-1">pts</span>
                  </div>

                  {/* Badges */}
                  <div className="hidden md:block text-right font-mono text-sm text-muted-foreground">
                    {entry.badges_count > 0 ? (
                      <span className="text-primary">{entry.badges_count}</span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </div>

                  {/* Role */}
                  <div className="hidden md:block text-right">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        entry.role === 'admin'
                          ? 'text-destructive border border-destructive/30'
                          : entry.role === 'maintainer'
                            ? 'text-primary border border-primary/30'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {entry.role}
                    </span>
                  </div>

                  {/* Mobile: points + badges inline */}
                  <div className="md:hidden text-right">
                    <div className="font-mono text-sm font-bold text-foreground">
                      {entry.total_points}{' '}
                      <span className="text-[10px] text-muted-foreground font-normal">pts</span>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {entry.badges_count > 0
                        ? `${entry.badges_count} badge${entry.badges_count !== 1 ? 's' : ''}`
                        : '—'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Top contributors section */}
      {entries.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {entries.slice(0, 3).map((entry, index) => {
            const configs = ALL_FAMILIES.map((f) => ({
              ...getFamilyConfig(f),
              points: entry[`points_${f}` as keyof LeaderboardEntry] as number,
            })).filter((c) => c.points > 0);

            return (
              <Card key={entry.github_username} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-2">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <h3 className="font-mono text-sm font-bold text-foreground">
                    {entry.github_username}
                  </h3>
                  <div className="text-2xl font-mono font-bold text-primary mt-2">
                    {entry.total_points}
                    <span className="text-sm text-muted-foreground ml-1">pts</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                    {configs.map((c) => (
                      <span
                        key={c.name}
                        className="text-xs font-mono text-muted-foreground"
                        title={`${c.name}: ${c.points}`}
                      >
                        {c.emoji}
                        {c.points}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
