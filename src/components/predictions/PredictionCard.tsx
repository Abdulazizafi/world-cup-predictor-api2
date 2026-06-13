'use client';
// components/predictions/PredictionCard.tsx — User prediction with status
import { motion } from 'framer-motion';
import { Edit2 } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatMatchTime, getFlag, getFlagUrl } from '@/lib/utils';
import type { Match } from '@/types';

export default function PredictionCard({ match, index = 0 }: { match: Match; index?: number }) {
  const pred = match.userPrediction;
  if (!pred) return null;
  const { date, time } = formatMatchTime(match.matchTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-2xl p-4 border border-white/6 hover:border-white/12 transition-colors"
    >
      {/* Match info row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-4.5 relative rounded overflow-hidden border border-white/10 shrink-0 bg-zinc-900 inline-block align-middle">
            <img src={getFlagUrl(match.teamA)} alt={match.teamA} className="w-full h-full object-cover" />
          </span>
          <span className="text-sm font-bold">{match.teamA}</span>
          <span className="text-zinc-500 text-sm">vs</span>
          <span className="text-sm font-bold">{match.teamB}</span>
          <span className="w-6 h-4.5 relative rounded overflow-hidden border border-white/10 shrink-0 bg-zinc-900 inline-block align-middle">
            <img src={getFlagUrl(match.teamB)} alt={match.teamB} className="w-full h-full object-cover" />
          </span>
        </div>
        <StatusBadge status={match.status} />
      </div>

      {/* Prediction & actual */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs text-zinc-500">Your prediction</div>
          <div className="text-xl font-black text-white">
            {pred.predictedScoreA} – {pred.predictedScoreB}
          </div>
          {match.status === 'FINISHED' && match.scoreA !== null && (
            <div className="text-xs text-zinc-400">
              Result: <span className="font-bold text-zinc-200">{match.scoreA}–{match.scoreB}</span>
            </div>
          )}
          <div className="text-xs text-zinc-500">{date} · {time}</div>
        </div>

        <div className="text-right">
          {match.status === 'FINISHED' && (
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl font-black text-lg ${
              pred.pointsEarned === 100 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-gold-glow' :
              pred.pointsEarned === 40 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              'bg-zinc-800 text-zinc-500 border border-white/5'
            }`}>
              +{pred.pointsEarned}
            </div>
          )}
          {match.status === 'PENDING' && (
            <button className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg transition-colors min-h-[44px]">
              <Edit2 size={12} /> Edit
            </button>
          )}
          {match.status === 'LIVE' && (
            <div className="text-xs text-zinc-500 italic">Waiting...</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
