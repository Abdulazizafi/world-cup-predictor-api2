'use client';
// components/ui/LoadingSkeleton.tsx — Shimmer skeleton loader
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'bg-zinc-800 rounded-xl animate-pulse',
      className,
    )} />
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-3 items-center">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-8 w-12 mx-auto rounded-lg" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 glass rounded-xl">
      <Skeleton className="h-6 w-6 rounded" />
      <Skeleton className="h-9 w-9 rounded-full" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-12" />
    </div>
  );
}
