'use client';
// components/friends/ActivityFeed.tsx — Group activity feed
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { timeAgo, getFlag, getInitial, isPastKickoff } from '@/lib/utils';
import type { ActivityEntry } from '@/types';

function ActivityItem({ entry, index }: { entry: ActivityEntry; index: number }) {
  const isRevealed = isPastKickoff(entry.matchTime);
  const flagA = getFlag(entry.teamA);
  const flagB = getFlag(entry.teamB);

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-3 p-4 glass rounded-xl border border-white/5"
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white shrink-0">
        {getInitial(entry.username)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-white text-sm">{entry.username}</span>
          <span className="text-zinc-400 text-sm">predicted</span>
          <span className="font-semibold text-sm">
            {flagA} {entry.teamA} vs {entry.teamB} {flagB}
          </span>
        </div>

        {/* Score reveal */}
        {isRevealed && entry.predictedScoreA !== null ? (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-zinc-400">Score:</span>
            <span className="text-sm font-bold text-emerald-400">
              {entry.predictedScoreA} – {entry.predictedScoreB}
            </span>
            {entry.status === 'FINISHED' && (
              <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-semibold">
                Finished
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mt-1.5">
            <Lock size={11} className="text-amber-400" />
            <span className="text-xs text-amber-400/80 font-medium">Score hidden until kickoff</span>
          </div>
        )}
      </div>

      {/* Time */}
      <span className="text-[11px] text-zinc-500 shrink-0">{timeAgo(entry.createdAt)}</span>
    </motion.div>
  );
}

export default function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center text-zinc-500 gap-3">
        <span className="text-4xl">👥</span>
        <p className="text-sm">No activity yet. Be the first to predict!</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <ActivityItem key={`${entry.username}-${entry.matchId}-${i}`} entry={entry} index={i} />
      ))}
    </div>
  );
}
