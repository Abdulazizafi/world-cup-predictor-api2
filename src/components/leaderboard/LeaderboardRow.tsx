'use client';
// components/leaderboard/LeaderboardRow.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronUp, ChevronDown, Minus, ArrowRightLeft } from 'lucide-react';
import { cn, getInitial } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  index: number;
  isRelegated?: boolean;
  onCompare?: (userId: string, username: string) => void;
}

export default function LeaderboardRow({ entry, index, isRelegated, onCompare }: LeaderboardRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isTop3 = entry.rank <= 3;

  return (
    <div className="flex flex-col gap-1.5">
      <motion.div
        layout="position"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          layout: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] },
          x: { duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer select-none',
          isRelegated
            ? 'bg-red-950/10 border border-red-500/30 shadow-red-glow animate-pulse-border'
            : entry.isCurrentUser
            ? 'bg-amber-500/8 border border-amber-500/25 shadow-gold-glow/20'
            : 'bg-zinc-900/50 border border-white/5 hover:border-white/10',
        )}
      >
        {/* Trend Indicator */}
        <div className="flex items-center shrink-0 w-3">
          {entry.trend === 'UP' && (
            <span title="Rank Climbed">
              <ChevronUp size={14} className="text-emerald-400 font-black" />
            </span>
          )}
          {entry.trend === 'DOWN' && (
            <span title="Rank Slipped">
              <ChevronDown size={14} className="text-rose-450 font-black" />
            </span>
          )}
          {entry.trend === 'SAME' && (
            <span title="Rank Same">
              <Minus size={14} className="text-zinc-650" />
            </span>
          )}
        </div>

        {/* Rank */}
        <div className="w-8 text-center shrink-0">
          {isTop3 ? (
            <Trophy
              size={18}
              className={cn(
                'mx-auto',
                entry.rank === 1 ? 'text-amber-400 fill-amber-450/5' :
                entry.rank === 2 ? 'text-zinc-300 fill-zinc-400/5' :
                'text-amber-700 fill-amber-800/5'
              )}
            />
          ) : (
            <span className="text-sm font-bold text-zinc-550">#{entry.rank}</span>
          )}
        </div>

        {/* Avatar */}
        <div className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-inner',
          entry.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-gold-glow' :
          entry.rank === 2 ? 'bg-gradient-to-br from-zinc-300 to-zinc-500 text-black' :
          entry.rank === 3 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white' :
          'bg-zinc-800 text-zinc-300',
        )}>
          {getInitial(entry.username)}
        </div>

        {/* Username */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn('font-bold truncate text-sm', entry.isCurrentUser ? 'text-amber-400' : 'text-white')}>
              {entry.username}
            </span>
            {entry.isCurrentUser && (
              <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-black shrink-0">YOU</span>
            )}
            {isRelegated && (
              <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-black tracking-wider shrink-0 animate-pulse">RELEGATION</span>
            )}
          </div>
        </div>

        {/* Points */}
        <div className={cn(
          'text-right shrink-0',
          entry.isCurrentUser ? 'text-amber-400' : 'text-white',
        )}>
          <div className="text-base font-black leading-none">{entry.totalPoints}</div>
          <div className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider mt-0.5">pts</div>
        </div>
      </motion.div>

      {/* Expandable detailed breakdown card */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className={cn(
              'border border-t-0 rounded-b-xl px-5 py-4 flex flex-col gap-3.5',
              entry.isCurrentUser ? 'bg-amber-500/4 border-amber-500/15' : 'bg-zinc-950/20 border-white/5'
            )}>
              <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">detailed performance</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-2.5">
                  <span className="text-[9px] text-zinc-500 font-black tracking-wider uppercase">exact scores</span>
                  <p className="text-sm font-black text-white mt-0.5">{entry.exactCount ?? 0}</p>
                </div>
                <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-2.5">
                  <span className="text-[9px] text-zinc-500 font-black tracking-wider uppercase">outcomes</span>
                  <p className="text-sm font-black text-white mt-0.5">{entry.outcomeCount ?? 0}</p>
                </div>
                <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-2.5">
                  <span className="text-[9px] text-zinc-500 font-black tracking-wider uppercase">incorrect</span>
                  <p className="text-sm font-black text-white mt-0.5">{entry.incorrectCount ?? 0}</p>
                </div>
                <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-2.5">
                  <span className="text-[9px] text-zinc-500 font-black tracking-wider uppercase">double used</span>
                  <p className="text-sm font-black text-white mt-0.5">{entry.doubleUsed ?? 0} <span className="text-xs text-zinc-550 font-bold">/ 5</span></p>
                </div>
              </div>

              {/* Compare Button */}
              {!entry.isCurrentUser && onCompare && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompare(entry.userId, entry.username);
                  }}
                  className="w-fit flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-white/10 rounded-xl text-xs font-bold text-zinc-350 hover:text-white transition-all cursor-pointer select-none focus:outline-none"
                >
                  <ArrowRightLeft size={12} className="text-zinc-400" />
                  Compare Picks
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
