'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/dashboard/progress-bar';
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
          <span>{config.emoji}</span>
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
