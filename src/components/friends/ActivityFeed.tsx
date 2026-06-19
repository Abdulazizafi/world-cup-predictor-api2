'use client';
// components/friends/ActivityFeed.tsx — Group activity feed
import { motion } from 'framer-motion';
import { Lock, Zap, Users } from 'lucide-react';
import { timeAgo, getFlagUrl, getInitial, isPastKickoff } from '@/lib/utils';
import type { ActivityEntry } from '@/types';

function ActivityItem({ entry, index }: { entry: ActivityEntry; index: number }) {
  if (entry.isLoyaltyOath) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
        className="p-4 glass rounded-xl border border-amber-550/25 bg-amber-500/5 relative overflow-hidden shadow-gold-glow/5 flex gap-3.5 items-start"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-sm text-black shrink-0 shadow-gold-glow">
          📜
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-black text-amber-400 text-sm">{entry.username}</span>
            <span className="text-zinc-400 text-xs font-semibold">has sworn the</span>
            <span className="text-amber-400 text-xs font-black uppercase tracking-wider">Loyalty Oath</span>
            <span className="text-zinc-400 text-xs font-semibold">to Sheikh {entry.sheikhName || 'Sheikh'}!</span>
          </div>
          <p className="mt-2 text-xs italic text-zinc-100 border-l-2 border-amber-500/30 pl-3 leading-relaxed">
            "{entry.commentText}"
          </p>
        </div>
        <span className="text-[10px] text-zinc-500 shrink-0 self-center">{timeAgo(entry.createdAt)}</span>
      </motion.div>
    );
  }

  const isRevealed = entry.matchTime ? isPastKickoff(entry.matchTime) : false;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-3 p-4 glass rounded-xl border border-white/5 hover:border-white/10 transition-colors shadow-sm"
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-inner">
        {getInitial(entry.username)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-white text-sm">{entry.username}</span>
          <span className="text-zinc-400 text-sm">predicted</span>
          <span className="inline-flex items-center gap-1 font-semibold text-sm">
            <span className="w-5 h-3.5 relative rounded overflow-hidden border border-white/10 shrink-0 bg-zinc-900 inline-block align-middle">
              <img src={getFlagUrl(entry.teamA || '')} alt={entry.teamA} className="w-full h-full object-cover" />
            </span>
            <span>{entry.teamA}</span>
            <span className="text-zinc-500 font-normal mx-0.5">vs</span>
            <span>{entry.teamB}</span>
            <span className="w-5 h-3.5 relative rounded overflow-hidden border border-white/10 shrink-0 bg-zinc-900 inline-block align-middle">
              <img src={getFlagUrl(entry.teamB || '')} alt={entry.teamB} className="w-full h-full object-cover" />
            </span>
          </span>
        </div>

        {/* Score reveal & Side-by-Side Comparison */}
        {isRevealed && entry.predictedScoreA !== null ? (
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-xs text-zinc-400 gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-500">Prediction:</span>
                <span className="text-sm font-black text-white bg-zinc-900/60 border border-white/5 rounded-md px-2.5 py-0.5">
                  {entry.predictedScoreA} – {entry.predictedScoreB}
                </span>
                {entry.useDoublePoints && (
                  <span className="inline-flex items-center gap-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black px-1.5 py-0.5 rounded shadow-gold-glow/5">
                    <Zap size={9} className="fill-amber-400 text-amber-400" />
                    2X BOOST
                  </span>
                )}
              </div>

              {entry.status === 'FINISHED' && entry.scoreA !== null && entry.scoreB !== null && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-500">Actual:</span>
                  <span className="text-sm font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-md px-2.5 py-0.5">
                    {entry.scoreA} – {entry.scoreB}
                  </span>
                </div>
              )}
            </div>

            {/* Points Badge (Finished Matches) */}
            {entry.status === 'FINISHED' && entry.pointsEarned !== undefined && (
              <div className="flex items-center gap-2 mt-0.5">
                {entry.pointsEarned === 100 && (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-emerald-500/5">
                    Exact Score (+100 pts)
                  </span>
                )}
                {entry.pointsEarned === 40 && (
                  <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-gold-glow/5">
                    Correct Outcome (+40 pts)
                  </span>
                )}
                {entry.pointsEarned === 0 && (
                  <span className="text-[10px] bg-zinc-800/40 text-zinc-500 border border-zinc-700/20 px-2.5 py-0.5 rounded-full font-semibold">
                    Incorrect (+0 pts)
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Lock size={11} className="text-amber-400" />
              <span className="text-xs text-amber-450/80 font-semibold uppercase tracking-wider text-[10px]">Score hidden until kickoff</span>
            </div>
            {entry.useDoublePoints && (
              <span className="inline-flex items-center gap-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black px-1.5 py-0.5 rounded shadow-gold-glow/5">
                <Zap size={9} className="fill-amber-400 text-amber-400" />
                2X BOOST
              </span>
            )}
          </div>
        )}
      </div>

      {/* Time */}
      <span className="text-[11px] text-zinc-500 shrink-0 self-center">{timeAgo(entry.createdAt)}</span>
    </motion.div>
  );
}

export default function ActivityFeed({
  entries,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: {
  entries: ActivityEntry[];
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center text-zinc-500 gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-center">
          <Users className="text-zinc-500" size={24} />
        </div>
        <div>
          <p className="font-bold text-white text-sm">No activity yet</p>
          <p className="text-xs text-zinc-500 mt-1">Be the first in your league to predict a match!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <ActivityItem key={`${entry.username}-${entry.matchId}-${i}`} entry={entry} index={i} />
      ))}

      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-3">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 hover:border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all cursor-pointer disabled:opacity-50 select-none shadow-sm focus:outline-none"
          >
            {isLoadingMore ? (
              <div className="w-3.5 h-3.5 border-2 border-zinc-500/30 border-t-zinc-400 rounded-full animate-spin" />
            ) : null}
            See More
          </button>
        </div>
      )}
    </div>
  );
}
