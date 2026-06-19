'use client';
// components/leaderboard/CompareModal.tsx — Compare predictions side-by-side
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Target, HelpCircle } from 'lucide-react';
import { apiComparePredictions, apiGetMatches } from '@/lib/api/client';
import { getFlagUrl } from '@/lib/utils';
import type { Match } from '@/types';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  friendId: string;
  friendName: string;
}

export default function CompareModal({ isOpen, onClose, groupId, friendId, friendName }: CompareModalProps) {
  // 1. Fetch friend's past predictions
  const { data: friendPredictions = [], isLoading: loadingFriend, error: compareError, isError: isCompareError } = useQuery({
    queryKey: ['compare', groupId, friendId],
    queryFn: () => apiComparePredictions(groupId, friendId),
    enabled: isOpen && !!friendId,
    retry: false,
  });

  // 2. Fetch matches (contains current user's predictions and actual scores)
  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ['matches'],
    queryFn: apiGetMatches,
    enabled: isOpen,
  });

  const isLoading = loadingFriend || loadingMatches;

  // Map predictions by matchId
  const friendPredMap = new Map(friendPredictions.map((p) => [p.matchId, p]));

  // Filter matches that have kicked off and at least one user predicted
  const startedMatches = matches.filter((m: Match) => {
    const isStarted = new Date(m.matchTime) <= new Date();
    const hasMyPred = m.userPrediction !== null;
    const hasFriendPred = friendPredMap.has(m.id);
    
    // If the backend has returned the friend's prediction (e.g. Royal Spy active),
    // we should allow it to be displayed, even if it hasn't kicked off yet.
    if (hasFriendPred && !isStarted) {
      return true;
    }
    
    return isStarted && (hasMyPred || hasFriendPred);
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl bg-zinc-950/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] z-10 glass"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-zinc-900/20">
              <div>
                <h3 className="text-lg font-black text-white">Head-to-Head Comparison</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Comparing with <span className="text-amber-400 font-bold">{friendName}</span></p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {isCompareError ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-red-400 gap-3">
                  <span className="text-4xl animate-bounce">👀</span>
                  <div>
                    <p className="font-bold text-white text-sm">Comparison Blocked</p>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-sm mx-auto">
                      {(compareError as any)?.response?.data?.message || 'You are blocked from comparing picks by order of the Sheikh!'}
                    </p>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                  <p className="text-zinc-550 text-xs">Loading comparison details...</p>
                </div>
              ) : startedMatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500 gap-3">
                  <HelpCircle size={40} className="text-zinc-700" />
                  <div>
                    <p className="font-bold text-white text-sm">No matches compared yet</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Comparison starts once predicted matches kickoff!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {startedMatches.map((match: Match) => {
                    const friendPred = friendPredMap.get(match.id);
                    const myPred = match.userPrediction;

                    return (
                      <div
                        key={match.id}
                        className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 flex flex-col gap-3.5 hover:border-white/10 transition-colors"
                      >
                        {/* Match Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                            {match.stage}
                          </span>
                          {match.status === 'FINISHED' && match.scoreA !== null && match.scoreB !== null ? (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black">
                              Final: {match.scoreA} – {match.scoreB}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold animate-pulse">
                              LIVE
                            </span>
                          )}
                        </div>

                        {/* Match Teams Row */}
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                            <span className="text-sm font-bold text-white truncate">{match.teamA}</span>
                            <span className="w-5 h-3.5 relative rounded overflow-hidden border border-white/10 bg-zinc-900 shrink-0">
                              <img src={getFlagUrl(match.teamA)} alt="" className="w-full h-full object-cover" />
                            </span>
                          </div>
                          <span className="text-xs font-medium text-zinc-550 shrink-0">vs</span>
                          <div className="flex items-center gap-2 flex-1 justify-start min-w-0">
                            <span className="w-5 h-3.5 relative rounded overflow-hidden border border-white/10 bg-zinc-900 shrink-0">
                              <img src={getFlagUrl(match.teamB)} alt="" className="w-full h-full object-cover" />
                            </span>
                            <span className="text-sm font-bold text-white truncate">{match.teamB}</span>
                          </div>
                        </div>

                        {/* Comparisons Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          {/* My Prediction */}
                          <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-3 flex flex-col items-center text-center">
                            <span className="text-[9px] text-zinc-500 font-black tracking-wider uppercase mb-1">YOU</span>
                            {myPred ? (
                              <div className="space-y-1">
                                <p className="text-base font-black text-white">
                                  {myPred.predictedScoreA} – {myPred.predictedScoreB}
                                </p>
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-[9px] font-black text-zinc-400">
                                    {match.status === 'FINISHED' ? `+${myPred.pointsEarned} pts` : 'Pending'}
                                  </span>
                                  {myPred.useDoublePoints && (
                                    <span title="Double Points Boosted">
                                      <Zap size={9} className="fill-amber-400 text-amber-400" />
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-650 italic py-2">No Prediction</span>
                            )}
                          </div>

                          {/* Friend Prediction */}
                          <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-3 flex flex-col items-center text-center">
                            <span className="text-[9px] text-zinc-500 font-black tracking-wider uppercase mb-1 truncate max-w-full">
                              {friendName.toUpperCase()}
                            </span>
                            {friendPred ? (
                              <div className="space-y-1">
                                <p className="text-base font-black text-white">
                                  {friendPred.predictedScoreA} – {friendPred.predictedScoreB}
                                </p>
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-[9px] font-black text-zinc-400">
                                    {match.status === 'FINISHED' ? `+${friendPred.pointsEarned} pts` : 'Pending'}
                                  </span>
                                  {friendPred.useDoublePoints && (
                                    <span title="Double Points Boosted">
                                      <Zap size={9} className="fill-amber-400 text-amber-400" />
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-650 italic py-2">No Prediction</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
