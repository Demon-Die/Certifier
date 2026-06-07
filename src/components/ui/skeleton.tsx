import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-none bg-muted/60', className)}
      {...props}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-none border border-surface-container bg-card p-4">
      <div className="flex items-center gap-2 pb-2">
        <Skeleton className="h-5 w-5" />
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

function SkeletonBadgeGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-muted/5 border border-surface-container"
        >
          <Skeleton className="h-8 w-8 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-surface-container">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-surface-container/50 p-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === 0 ? 'flex-1' : 'w-20')} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonBadgeGrid, SkeletonStatCard, SkeletonTableRow };
