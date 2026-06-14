'use client';
// components/leaderboard/Podium.tsx — Top 3 podium display
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { getInitial } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types';

const podiumConfig = [
  { pos: 1, height: 'h-24', avatarSize: 'w-16 h-16', textSize: 'text-lg', ring: 'ring-2 ring-amber-400 shadow-gold-glow', color: 'from-amber-400 to-amber-600', label: 'text-amber-400', order: 'order-2' },
  { pos: 2, height: 'h-16', avatarSize: 'w-13 h-13', textSize: 'text-base', ring: 'ring-1 ring-zinc-400', color: 'from-zinc-400 to-zinc-600', label: 'text-zinc-300', order: 'order-1' },
  { pos: 3, height: 'h-12', avatarSize: 'w-12 h-12', textSize: 'text-sm',  ring: 'ring-1 ring-amber-700', color: 'from-amber-700 to-amber-900', label: 'text-amber-700', order: 'order-3' },
];



interface PodiumProps {
  entries: LeaderboardEntry[];
}

export default function Podium({ entries }: PodiumProps) {
  const top3 = [
    entries.find(e => e.rank === 1),
    entries.find(e => e.rank === 2),
    entries.find(e => e.rank === 3),
  ];

  return (
    <div className="flex items-end justify-center gap-3 py-6 px-4">
      {podiumConfig.map(({ pos, height, avatarSize, ring, color, label, order }, i) => {
        const entry = top3[pos - 1];
        if (!entry) return null;

        return (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className={`flex flex-col items-center gap-2 ${order}`}
          >
            {/* Crown for #1 */}
            {pos === 1 && (
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Crown size={18} className="text-amber-400" />
              </motion.div>
            )}

            {/* Avatar */}
            <div className={`${avatarSize} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-black text-black ${ring}`}>
              <span className="text-base">{getInitial(entry.username)}</span>
            </div>

            {/* Username & points */}
            <div className="text-center">
              <div className={`font-bold text-white text-xs ${entry.isCurrentUser ? 'underline decoration-amber-400' : ''}`}>
                {entry.username}
                {entry.isCurrentUser && <span className="ml-1 text-[9px] text-amber-400">(you)</span>}
              </div>
              <div className={`font-black text-sm ${label}`}>{entry.totalPoints} pts</div>
            </div>

            {/* Podium block */}
            <div className={`${height} w-20 bg-gradient-to-b ${color} opacity-20 rounded-t-xl relative`}>
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color} opacity-60 rounded-t-xl`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black opacity-40 text-white">{pos}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
