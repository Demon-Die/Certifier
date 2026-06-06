'use client';

import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';

interface ProgressBarProps {
  percentage: number;
  current: number;
  target: number;
}

export function ProgressBar({ percentage, current, target }: ProgressBarProps) {
  const colorClass =
    percentage >= 75
      ? 'bg-green-500'
      : percentage >= 50
        ? 'bg-yellow-500'
        : percentage >= 25
          ? 'bg-orange-500'
          : 'bg-red-500';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>
          {current} / {target}
        </span>
      </div>
      <Progress value={percentage}>
        <ProgressTrack>
          <ProgressIndicator className={colorClass} style={{ width: `${percentage}%` }} />
        </ProgressTrack>
      </Progress>
    </div>
  );
}
