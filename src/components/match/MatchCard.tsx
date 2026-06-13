'use client';
// components/match/MatchCard.tsx — Individual match prediction card
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import StatusBadge from '@/components/ui/StatusBadge';
import StepperInput from '@/components/ui/StepperInput';
import CountdownTimer from './CountdownTimer';
import { apiSubmitPrediction } from '@/lib/api/client';
import { formatMatchTime, getFlagUrl } from '@/lib/utils';
import type { Match } from '@/types';

interface MatchCardProps {
  match: Match;
  index?: number;
  x2Remaining: number;
}

export default function MatchCard({ match, index = 0, x2Remaining }: MatchCardProps) {
  const qc = useQueryClient();
  
  const now = Date.now();
  const matchTimeMs = new Date(match.matchTime).getTime();
  const opensAt = matchTimeMs - 24 * 60 * 60 * 1000;

  const tooEarly = now < opensAt;
  const tooLate = now >= matchTimeMs || match.status === 'FINISHED' || match.status === 'LIVE';
  const locked = tooEarly || tooLate;

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [scoreA, setScoreA] = useState<string>(
    match.userPrediction ? String(match.userPrediction.predictedScoreA) : '',
  );
  const [scoreB, setScoreB] = useState<string>(
    match.userPrediction ? String(match.userPrediction.predictedScoreB) : '',
  );
  const [useDoublePoints, setUseDoublePoints] = useState<boolean>(
    !!match.userPrediction?.useDoublePoints
  );
  const [saving, setSaving] = useState(false);

  const { date, time } = formatMatchTime(match.matchTime);

  // Sync state when props update (e.g. after query invalidation or tab navigation)
  useEffect(() => {
    if (match.userPrediction) {
      setScoreA(String(match.userPrediction.predictedScoreA));
      setScoreB(String(match.userPrediction.predictedScoreB));
      setUseDoublePoints(!!match.userPrediction.useDoublePoints);
      setIsEditing(false);
    } else {
      setScoreA('');
      setScoreB('');
      setUseDoublePoints(false);
      setIsEditing(false);
    }
  }, [match.userPrediction]);

  const handleSave = useCallback(async () => {
    const a = parseInt(scoreA, 10);
    const b = parseInt(scoreB, 10);
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0 || a > 30 || b > 30) {
      toast.error('Enter valid scores (0–30)');
      return;
    }
    setSaving(true);
    try {
      await apiSubmitPrediction(match.id, a, b, useDoublePoints);
      await qc.invalidateQueries({ queryKey: ['matches'] });
      setIsEditing(false);
      toast.success(
        `⚽ Prediction saved: ${match.teamA} ${a}–${b} ${match.teamB}${useDoublePoints ? ' (⚡ 2x)' : ''}`,
        { id: `pred-${match.id}` }
      );
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not save prediction';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [scoreA, scoreB, useDoublePoints, match.id, match.teamA, match.teamB, qc]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-2xl overflow-hidden group hover:border-white/15 transition-colors duration-300"
    >
      {/* Top accent line */}
      <div
        className={`h-0.5 w-full ${
          match.status === 'LIVE'
            ? 'bg-gradient-to-r from-red-500 to-orange-400'
            : match.status === 'FINISHED'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
            : 'bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity'
        }`}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex flex-col items-start gap-1">
            <StatusBadge status={match.status} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {match.stage}
            </span>
          </div>
          <div className="flex justify-end min-h-[32px] items-center">
            {match.status === 'PENDING' && (
              <CountdownTimer kickoffTime={match.matchTime} />
            )}
          </div>
        </div>

        {/* Teams row */}
        <div className="grid grid-cols-[1.2fr_1fr_1.2fr] items-center gap-3 mb-6">
          {/* Team A */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-14 relative rounded-xl overflow-hidden border border-white/10 shadow-lg flex items-center justify-center bg-zinc-900/40">
              <img
                src={getFlagUrl(match.teamA)}
                alt={match.teamA}
                className="w-full h-full object-cover animate-fade-in"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://flagcdn.com/w160/un.png';
                }}
              />
            </div>
            <span className="text-sm font-black tracking-wide text-center text-white">
              {match.teamA}
            </span>
          </div>

          {/* VS / Info / Score */}
          <div className="flex flex-col items-center justify-center text-center">
            {match.status === 'FINISHED' && match.scoreA !== null ? (
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent tracking-tight">
                  {match.scoreA}–{match.scoreB}
                </span>
                <span className="text-[10px] font-bold text-zinc-500 mt-1">FT</span>
              </div>
            ) : match.status === 'LIVE' && match.scoreA !== null ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-black text-white tracking-tight animate-pulse">
                  {match.scoreA}–{match.scoreB}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs text-zinc-600 font-black tracking-widest uppercase mb-1">
                  VS
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-300">{time}</span>
                  <span className="text-[10px] text-zinc-500 font-medium">{date}</span>
                </div>
              </div>
            )}
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-14 relative rounded-xl overflow-hidden border border-white/10 shadow-lg flex items-center justify-center bg-zinc-900/40">
              <img
                src={getFlagUrl(match.teamB)}
                alt={match.teamB}
                className="w-full h-full object-cover animate-fade-in"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://flagcdn.com/w160/un.png';
                }}
              />
            </div>
            <span className="text-sm font-black tracking-wide text-center text-white">
              {match.teamB}
            </span>
          </div>
        </div>

        {/* Prediction section */}
        <div className="border-t border-white/5 pt-4">
          {/* Case 1: Match is locked AND no prediction was made */}
          {locked && !match.userPrediction && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-zinc-500 bg-zinc-950/40 border border-white/5 rounded-xl">
              {tooEarly ? (
                <>
                  <Clock size={12} className="text-amber-500/80" />
                  <span>
                    Opens{' '}
                    {new Date(opensAt).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </>
              ) : (
                <>
                  <Lock size={12} />
                  <span>
                    {match.status === 'FINISHED' ? 'No prediction made' : 'Predictions closed'}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Case 2: Match is locked AND prediction exists */}
          {locked && match.userPrediction && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                {/* Disabled Steppers */}
                <div className="flex-1 max-w-[220px]">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <StepperInput
                      value={scoreA}
                      onChange={setScoreA}
                      disabled={true}
                    />
                    <span className="text-zinc-600 font-black text-sm">–</span>
                    <StepperInput
                      value={scoreB}
                      onChange={setScoreB}
                      disabled={true}
                    />
                  </div>
                </div>

                {/* X2 Badge */}
                <div className="shrink-0 flex items-center">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border ${
                      useDoublePoints
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        : 'bg-zinc-900/30 border-white/5 text-zinc-500'
                    }`}
                  >
                    {useDoublePoints ? '⚡ 2X Active' : 'Standard'}
                  </div>
                </div>
              </div>

              {/* Bottom Success / Status Bar */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold">
                  <Lock size={12} className="text-zinc-500" />
                  <span>Prediction locked</span>
                </div>
                {match.status === 'FINISHED' && (
                  <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full shadow-gold-glow/5 animate-fade-in">
                    +{match.userPrediction.pointsEarned} pts
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Case 3: Match is NOT locked */}
          {!locked && (
            <>
              {/* If NOT editing and NO prediction exists */}
              {!isEditing && !match.userPrediction && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold py-3.5 rounded-xl shadow-gold-glow hover:shadow-gold-glow-lg transition-all duration-200 text-sm min-h-[44px]"
                >
                  ✏️ Make Prediction
                </button>
              )}

              {/* If NOT editing but prediction DOES exist (Saved State) */}
              {!isEditing && match.userPrediction && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Disabled Steppers */}
                    <div className="flex-1 max-w-[220px]">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <StepperInput
                          value={scoreA}
                          onChange={setScoreA}
                          disabled={true}
                        />
                        <span className="text-zinc-600 font-black text-sm">–</span>
                        <StepperInput
                          value={scoreB}
                          onChange={setScoreB}
                          disabled={true}
                        />
                      </div>
                    </div>

                    {/* X2 Toggle */}
                    <div className="shrink-0 flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer select-none py-1 group/toggle bg-zinc-950 border border-white/10 hover:border-amber-500/30 hover:bg-zinc-900/60 rounded-xl px-3 py-2 transition-all">
                        <input
                          type="checkbox"
                          checked={useDoublePoints}
                          disabled={saving}
                          onChange={async (e) => {
                            const checked = e.target.checked;
                            if (checked && x2Remaining <= 0 && !match.userPrediction?.useDoublePoints) {
                              toast.error('You have used all 5 Double Points (x2) tokens!');
                              return;
                            }
                            setSaving(true);
                            try {
                              const a = parseInt(scoreA, 10);
                              const b = parseInt(scoreB, 10);
                              await apiSubmitPrediction(match.id, a, b, checked);
                              await qc.invalidateQueries({ queryKey: ['matches'] });
                              toast.success(
                                `⚽ Double Points ${checked ? 'enabled' : 'disabled'} for ${match.teamA} vs ${match.teamB}`,
                                { id: `pred-${match.id}` }
                              );
                            } catch (err: any) {
                              const msg = err.response?.data?.message || 'Could not update double points';
                              toast.error(msg);
                            } finally {
                              setSaving(false);
                            }
                          }}
                          className="rounded border-white/10 bg-zinc-950 text-amber-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer accent-amber-500 disabled:opacity-50"
                        />
                        <span className="text-xs font-bold text-zinc-300 group-hover/toggle:text-white transition-colors flex items-center gap-1">
                          ⚡ X2
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Bottom Success Footer: Prediction saved | Edit Prediction */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Prediction saved
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                    >
                      Edit Prediction
                    </button>
                  </div>
                </div>
              )}

              {/* If in edit mode (Making or Editing Prediction) */}
              {isEditing && (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                    {match.userPrediction ? '✏️ Edit your prediction' : '⚽ Make your prediction'}
                  </p>

                  <div className="flex items-center justify-between gap-4">
                    {/* Enabled Steppers */}
                    <div className="flex-1 max-w-[220px]">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <StepperInput
                          value={scoreA}
                          onChange={setScoreA}
                          disabled={false}
                        />
                        <span className="text-zinc-600 font-black text-sm">–</span>
                        <StepperInput
                          value={scoreB}
                          onChange={setScoreB}
                          disabled={false}
                        />
                      </div>
                    </div>

                    {/* X2 Checkbox */}
                    <div className="shrink-0 flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer select-none py-1 group/toggle bg-zinc-950 border border-white/10 hover:border-amber-500/30 hover:bg-zinc-900/60 rounded-xl px-3 py-2 transition-all">
                        <input
                          type="checkbox"
                          checked={useDoublePoints}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked && x2Remaining <= 0 && !match.userPrediction?.useDoublePoints) {
                              toast.error('You have used all 5 Double Points (x2) tokens!');
                              return;
                            }
                            setUseDoublePoints(checked);
                          }}
                          className="rounded border-white/10 bg-zinc-950 text-amber-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer accent-amber-500"
                        />
                        <span className="text-xs font-bold text-zinc-300 group-hover/toggle:text-white transition-colors flex items-center gap-1">
                          ⚡ X2
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Save & Cancel Buttons */}
                  <div className="flex gap-2 w-full pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (match.userPrediction) {
                          setScoreA(String(match.userPrediction.predictedScoreA));
                          setScoreB(String(match.userPrediction.predictedScoreB));
                          setUseDoublePoints(!!match.userPrediction.useDoublePoints);
                        } else {
                          setScoreA('');
                          setScoreB('');
                          setUseDoublePoints(false);
                        }
                        setIsEditing(false);
                      }}
                      className="flex-1 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-300 font-bold py-3 rounded-xl transition-all text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      id={`predict-btn-${match.id}`}
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 text-black font-bold py-3 rounded-xl shadow-gold-glow hover:shadow-gold-glow-lg transition-all duration-200 text-xs min-h-[44px]"
                    >
                      {saving ? (
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        '💾'
                      )}
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

