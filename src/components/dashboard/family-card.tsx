'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/dashboard/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { getFamilyConfig, type FamilyProgress } from '@/lib/dashboard';
import type { Family } from '@/lib/points';

interface FamilyCardProps {
  family: Family;
  points: number;
  progress: FamilyProgress;
}

export function FamilyCard({ family, points, progress }: FamilyCardProps) {
  const config = getFamilyConfig(family);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span aria-hidden="true">{config.emoji}</span>
          <span>{config.name}</span>
          {progress.currentTier && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {progress.currentTier}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <span className="text-3xl font-bold">{points}</span>
          <span className="text-muted-foreground ml-1">pts</span>
        </div>
        <ProgressBar
          percentage={progress.progress.percentage}
          current={progress.progress.current}
          target={progress.progress.target}
        />
        <p className="text-xs text-muted-foreground">
          {progress.nextTier
            ? `Next: ${progress.nextTier.tier} (${progress.nextTier.threshold} pts)`
            : '🏆 Max tier reached!'}
        </p>
      </CardContent>
    </Card>
  );
}

export function FamilyCardSkeleton() {
  return (
    <div className="rounded-none border border-surface-container bg-card p-4">
      <div className="flex items-center gap-2 pb-2">
        <Skeleton className="h-5 w-5 shrink-0" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-12 ml-auto" />
      </div>
      <div className="space-y-3 pt-1">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
  );
}
