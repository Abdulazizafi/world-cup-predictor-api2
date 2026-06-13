'use client';
// components/match/MatchCard.tsx — Individual match prediction card
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import StatusBadge from '@/components/ui/StatusBadge';
import { apiSubmitPrediction } from '@/lib/api/client';
import { formatMatchTime, getFlag, getFlagUrl, isPastKickoff } from '@/lib/utils';
import type { Match } from '@/types';

interface MatchCardProps { match: Match; index?: number; }

export default function MatchCard({ match, index = 0 }: MatchCardProps) {
  const qc = useQueryClient();
  
  const now = Date.now();
  const matchTimeMs = new Date(match.matchTime).getTime();
  const opensAt = matchTimeMs - 24 * 60 * 60 * 1000;

  const tooEarly = now < opensAt;
  const tooLate = now >= matchTimeMs || match.status === 'FINISHED' || match.status === 'LIVE';
  const locked = tooEarly || tooLate;

  const [scoreA, setScoreA] = useState<string>(
    match.userPrediction ? String(match.userPrediction.predictedScoreA) : '',
  );
  const [scoreB, setScoreB] = useState<string>(
    match.userPrediction ? String(match.userPrediction.predictedScoreB) : '',
  );
  const [saving, setSaving] = useState(false);

  const { date, time } = formatMatchTime(match.matchTime);

  const handleSave = useCallback(async () => {
    const a = parseInt(scoreA, 10);
    const b = parseInt(scoreB, 10);
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0 || a > 30 || b > 30) {
      toast.error('Enter valid scores (0–30)');
      return;
    }
    setSaving(true);
    try {
      await apiSubmitPrediction(match.id, a, b);
      await qc.invalidateQueries({ queryKey: ['matches'] });
      toast.success(
        `⚽ Prediction saved: ${match.teamA} ${a}–${b} ${match.teamB}`,
        { id: `pred-${match.id}` }
      );
    } catch {
      toast.error('Could not save prediction');
    } finally { setSaving(false); }
  }, [scoreA, scoreB, match.id, match.teamA, match.teamB, qc]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-2xl overflow-hidden group hover:border-white/15 transition-colors duration-300"
    >
      {/* Top accent line */}
      <div className={`h-0.5 w-full ${match.status === 'LIVE' ? 'bg-gradient-to-r from-red-500 to-orange-400' : match.status === 'FINISHED' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity'}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="font-medium text-zinc-400">{match.stage}</span>
            {match.venue && (
              <>
                <span>·</span>
                <MapPin size={10} />
                <span className="truncate max-w-[120px]">{match.venue}</span>
              </>
            )}
          </div>
          <StatusBadge status={match.status} />
        </div>

        {/* Teams row */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-5">
          {/* Team A */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-11 relative rounded-lg overflow-hidden border border-white/10 shadow-md flex items-center justify-center bg-zinc-900/40">
              <img
                src={getFlagUrl(match.teamA)}
                alt={match.teamA}
                className="w-full h-full object-cover animate-fade-in"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://flagcdn.com/w160/un.png';
                }}
              />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide text-center">{match.teamA}</span>
          </div>

          {/* VS / Score */}
          <div className="flex flex-col items-center gap-1">
            {match.status === 'FINISHED' && match.scoreA !== null ? (
              <div className="text-2xl font-black bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
                {match.scoreA}–{match.scoreB}
              </div>
            ) : match.status === 'LIVE' && match.scoreA !== null ? (
              <div className="flex flex-col items-center gap-1">
                <div className="text-xl font-black text-white">{match.scoreA}–{match.scoreB}</div>
                <span className="flex items-center gap-1 text-[10px] text-red-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-[pulse-dot_1.2s_ease-in-out_infinite]" />
                  LIVE
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">vs</span>
                <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <Clock size={9} />
                  <span>{time}</span>
                </div>
              </div>
            )}
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-11 relative rounded-lg overflow-hidden border border-white/10 shadow-md flex items-center justify-center bg-zinc-900/40">
              <img
                src={getFlagUrl(match.teamB)}
                alt={match.teamB}
                className="w-full h-full object-cover animate-fade-in"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://flagcdn.com/w160/un.png';
                }}
              />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide text-center">{match.teamB}</span>
          </div>
        </div>

        {/* Date */}
        <div className="text-center text-xs text-zinc-500 mb-4">{date}</div>

        {/* Prediction section */}
        <div className="border-t border-white/6 pt-4">
          {locked ? (
            tooEarly ? (
              // Display countdown or opening date if too early to predict
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-zinc-500 font-semibold bg-zinc-900/40 border border-white/5 rounded-xl">
                <Clock size={12} className="text-amber-500/80" />
                <span>Opens {new Date(opensAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ) : match.userPrediction ? (
              // Display saved pick after match starts/finishes
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={12} className="text-zinc-500" />
                  <span className="text-sm text-zinc-400">Your pick:</span>
                  <span className="font-bold text-white">
                    {match.userPrediction.predictedScoreA}–{match.userPrediction.predictedScoreB}
                  </span>
                </div>
                {match.status === 'FINISHED' && (
                  <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">
                    +{match.userPrediction.pointsEarned} pts
                  </span>
                )}
              </div>
            ) : (
              // Locked without prediction
              <div className="flex items-center justify-center gap-2 py-1 text-sm text-zinc-500">
                <Lock size={13} />
                {match.status === 'FINISHED' ? 'No prediction made' : 'Predictions closed'}
              </div>
            )
          ) : (
            // Editable prediction
            <div className="space-y-3">
              <p className="text-xs text-zinc-400 font-medium">
                {match.userPrediction ? '✏️ Update prediction' : '⚽ Make your prediction'}
              </p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <input
                  id={`score-a-${match.id}`}
                  type="number"
                  min={0} max={30}
                  placeholder="0"
                  value={scoreA}
                  onChange={e => setScoreA(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 text-center text-xl font-black text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
                <span className="text-zinc-500 font-bold text-lg">–</span>
                <input
                  id={`score-b-${match.id}`}
                  type="number"
                  min={0} max={30}
                  placeholder="0"
                  value={scoreB}
                  onChange={e => setScoreB(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 text-center text-xl font-black text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>
              <button
                id={`predict-btn-${match.id}`}
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 text-black font-bold py-3 rounded-xl shadow-gold-glow hover:shadow-gold-glow-lg transition-all duration-200 min-h-[44px]"
              >
                {saving ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : '⚽'}
                {saving ? 'Saving...' : match.userPrediction ? 'Update Prediction' : 'Save Prediction'}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
