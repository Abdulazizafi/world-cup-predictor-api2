'use client';
// components/leaderboard/LeaderboardRow.tsx
import { motion } from 'framer-motion';
import { cn, getInitial } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types';

const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  index: number;
}

export default function LeaderboardRow({ entry, index }: LeaderboardRowProps) {
  const isTop3 = entry.rank <= 3;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] },
        x: { duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }
      }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
        entry.isCurrentUser
          ? 'bg-amber-500/8 border border-amber-500/25 shadow-gold-glow/30'
          : 'bg-zinc-900/50 border border-white/5 hover:border-white/10',
      )}
    >
      {/* Rank */}
      <div className="w-8 text-center shrink-0">
        {isTop3
          ? <span className="text-xl">{medals[entry.rank]}</span>
          : <span className="text-sm font-bold text-zinc-500">#{entry.rank}</span>
        }
      </div>

      {/* Avatar */}
      <div className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
        entry.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-gold-glow' :
        entry.rank === 2 ? 'bg-gradient-to-br from-zinc-300 to-zinc-500 text-black' :
        entry.rank === 3 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white' :
        'bg-zinc-800 text-zinc-300',
      )}>
        {getInitial(entry.username)}
      </div>

      {/* Username */}
      <div className="flex-1 min-w-0">
        <div className={cn('font-semibold truncate text-sm', entry.isCurrentUser ? 'text-amber-400' : 'text-white')}>
          {entry.username}
          {entry.isCurrentUser && <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">YOU</span>}
        </div>
      </div>

      {/* Points */}
      <div className={cn(
        'text-right shrink-0',
        entry.isCurrentUser ? 'text-amber-400' : 'text-white',
      )}>
        <div className="text-base font-black">{entry.totalPoints}</div>
        <div className="text-[10px] text-zinc-500">pts</div>
      </div>
    </motion.div>
  );
}
