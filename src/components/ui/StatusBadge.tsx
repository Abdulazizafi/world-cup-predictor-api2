'use client';
// components/ui/StatusBadge.tsx
import { cn } from '@/lib/utils';
import type { MatchStatus } from '@/types';

const config: Record<MatchStatus, { label: string; className: string; dot?: boolean }> = {
  PENDING:  { label: 'Upcoming',  className: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  LIVE:     { label: 'Live',      className: 'bg-red-500/15 text-red-400 border-red-500/25', dot: true },
  FINISHED: { label: 'Finished',  className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
};

export default function StatusBadge({ status, className }: { status: MatchStatus; className?: string }) {
  const { label, className: sc, dot } = config[status];
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border',
      sc, className,
    )}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-[pulse-dot_1.2s_ease-in-out_infinite]" />
      )}
      {label}
    </span>
  );
}
