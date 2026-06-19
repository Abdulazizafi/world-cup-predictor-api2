'use client';
// app/dashboard/page.tsx — Main SPA dashboard with all tabs
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Filter, LayoutGrid, Clock, Flag, SlidersHorizontal, Calendar, Target, TrendingUp, Flame, Star, Trophy, Users, Zap } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import TabNav from '@/components/layout/TabNav';
import { toast } from 'react-hot-toast';
import MatchCard from '@/components/match/MatchCard';
import Podium from '@/components/leaderboard/Podium';
import LeaderboardRow from '@/components/leaderboard/LeaderboardRow';
import CompareModal from '@/components/leaderboard/CompareModal';
import RefRoasts from '@/components/leaderboard/RefRoasts';
import PredictionCard from '@/components/predictions/PredictionCard';
import PredictionHeatmap from '@/components/predictions/PredictionHeatmap';
import ActivityFeed from '@/components/friends/ActivityFeed';
import { MatchCardSkeleton, LeaderboardRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  apiGetMatches, apiGetLeaderboard, apiGetActivity, apiGetActiveDecree, apiIssueDecree, apiSwearAllegiance
} from '@/lib/api/client';
import type { Match, DashTab } from '@/types';

// ── Matches Tab ──────────────────────────────────────────────────
function MatchesTab() {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: apiGetMatches,
    refetchInterval: 60_000,
  });

  const [filter, setFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'LIVE' | 'FINISHED'>('ALL');
  const [showStageFilter, setShowStageFilter] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const stages = ['All', ...Array.from(new Set(matches.map((m: Match) => m.stage)))];
  const filtered = filter === 'All' ? matches : matches.filter((m: Match) => m.stage === filter);

  // Count active x2 double points tokens
  const x2Used = (matches as Match[]).filter((m: Match) => m.userPrediction?.useDoublePoints).length;

  // Calculate Progress Stats
  const predictedCount = matches.filter((m: Match) => m.userPrediction !== null).length;
  const totalMatchesCount = matches.length;
  const finishedPredicted = matches.filter((m: Match) => m.status === 'FINISHED' && m.userPrediction !== null);
  const correctCount = finishedPredicted.filter((m: Match) => m.userPrediction!.pointsEarned >= 40).length;
  const accuracyPct = finishedPredicted.length > 0 ? Math.round((correctCount / finishedPredicted.length) * 100) : 0;

  let bestStreak = 0;
  let currentStreak = 0;
  const sortedFinishedPredictions = [...finishedPredicted].sort(
    (a: Match, b: Match) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime()
  );
  for (const match of sortedFinishedPredictions) {
    if (match.userPrediction && match.userPrediction.pointsEarned >= 40) {
      currentStreak++;
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  // Sort matches: LIVE first, then PENDING (kickoff ascending), then FINISHED (kickoff descending)
  const sortedMatches = [...filtered].sort((a: Match, b: Match) => {
    const statusPriority = (status: string) => {
      if (status === 'LIVE') return 1;
      if (status === 'PENDING') return 2;
      return 3;
    };

    const prioA = statusPriority(a.status);
    const prioB = statusPriority(b.status);

    if (prioA !== prioB) {
      return prioA - prioB;
    }

    const timeA = new Date(a.matchTime).getTime();
    const timeB = new Date(b.matchTime).getTime();

    // For finished matches, we want descending order (most recently finished first)
    if (a.status === 'FINISHED') {
      return timeB - timeA;
    }
    // For pending/live matches, we want ascending order (soonest kickoff first)
    return timeA - timeB;
  });

  // Apply Status Filter
  const statusFilteredMatches = sortedMatches.filter((m: Match) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'UPCOMING') return m.status === 'PENDING';
    if (statusFilter === 'LIVE') return m.status === 'LIVE';
    return m.status === 'FINISHED';
  });

  return (
    <div className="space-y-5">
      {/* Your Progress Dashboard Card */}
      <div className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-sm tracking-wide">Your Progress</h3>
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors flex items-center gap-1 focus:outline-none font-bold"
          >
            {showStats ? 'Hide Stats' : 'View Stats'}{' '}
            <span
              className="inline-block text-[10px] transition-transform duration-200"
              style={{ transform: showStats ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              &gt;
            </span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 bg-zinc-900/30 border border-white/5 rounded-xl p-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Calendar className="text-purple-400" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Predicted</p>
              <p className="text-base font-black text-white mt-0.5">
                {predictedCount} <span className="text-xs text-zinc-500 font-bold">/ {totalMatchesCount}</span>
              </p>
              <p className="text-[9px] text-zinc-500 font-medium">Matches</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/30 border border-white/5 rounded-xl p-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Target className="text-emerald-400" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Correct</p>
              <p className="text-base font-black text-white mt-0.5">{correctCount}</p>
              <p className="text-[9px] text-zinc-500 font-medium">Predictions</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/30 border border-white/5 rounded-xl p-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="text-blue-400" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Accuracy</p>
              <p className="text-base font-black text-white mt-0.5">{accuracyPct}%</p>
              <p className="text-[9px] text-zinc-500 font-medium">Outcomes</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/30 border border-white/5 rounded-xl p-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Flame className="text-amber-400" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Best Streak</p>
              <p className="text-base font-black text-white mt-0.5">{bestStreak}</p>
              <p className="text-[9px] text-zinc-500 font-medium">Matches</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-white/5 mt-5 pt-5"
            >
              <PredictionHeatmap matches={matches} flat={true} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">Matches</h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full shadow-gold-glow/10">
            <Zap size={11} className="fill-amber-400 text-amber-400" />
            Double Points: {x2Used}/5 used
          </span>
          {stages.length > 2 && (
            <button
              onClick={() => setShowStageFilter(!showStageFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                showStageFilter
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal size={13} />
              Filters
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Status Filter Bar */}
      <div className="flex gap-1 bg-zinc-900/40 p-1 rounded-xl border border-white/5 select-none w-fit overflow-x-auto max-w-full shrink-0">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            statusFilter === 'ALL'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-gold-glow/5'
              : 'text-zinc-400 hover:text-white border border-transparent'
          }`}
        >
          <LayoutGrid size={13} />
          All Matches
        </button>
        <button
          onClick={() => setStatusFilter('UPCOMING')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            statusFilter === 'UPCOMING'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-gold-glow/5'
              : 'text-zinc-400 hover:text-white border border-transparent'
          }`}
        >
          <Clock size={13} />
          Upcoming
        </button>
        <button
          onClick={() => setStatusFilter('LIVE')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            statusFilter === 'LIVE'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-gold-glow/5'
              : 'text-zinc-400 hover:text-white border border-transparent'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </button>
        <button
          onClick={() => setStatusFilter('FINISHED')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            statusFilter === 'FINISHED'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-gold-glow/5'
              : 'text-zinc-400 hover:text-white border border-transparent'
          }`}
        >
          <Flag size={13} />
          Finished
        </button>
      </div>

      {/* Stage filter dropdown (toggled via Filters button) */}
      {showStageFilter && stages.length > 2 && (
        <div className="flex items-center gap-2 max-w-xs animate-fade-in">
          <Filter size={14} className="text-zinc-400 shrink-0" />
          <div className="relative flex-1">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer"
            >
              {stages.map((s) => (
                <option key={s} value={s} className="bg-zinc-950 text-white">
                  {s === 'All' ? 'All Stages / Groups' : s}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-zinc-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <MatchCardSkeleton key={i} />)}
        </div>
      ) : statusFilteredMatches.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center text-zinc-500 gap-3">
          <Calendar size={48} className="text-zinc-650" />
          <p className="font-medium">No matches found</p>
          <p className="text-sm">Match data syncs from the World Cup API automatically</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {statusFilteredMatches.map((match: Match, i: number) => (
            <MatchCard key={match.id} match={match} index={i} x2Remaining={5 - x2Used} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Leaderboard Tab ──────────────────────────────────────────────
function LeaderboardTab() {
  const { user } = useAppStore();
  const groupId = user?.groupId ?? 'g1';
  const qc = useQueryClient();
  const [compareUserId, setCompareUserId] = useState<string | null>(null);
  const [compareUsername, setCompareUsername] = useState<string>('');

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard', groupId],
    queryFn: () => apiGetLeaderboard(groupId),
    refetchInterval: 30_000,
  });

  const { data: activeDecree, refetch: refetchDecree } = useQuery({
    queryKey: ['activeDecree', groupId],
    queryFn: () => apiGetActiveDecree(groupId),
  });

  const DECREE_OPTIONS = {
    TRANSFER_BAN: { label: '🚫 Transfer Ban (Block Double Points)', value: 'TRANSFER_BAN' },
    COMMUNITY_SERVICE: { label: '🧹 Community Service (Lock Last Place Theme)', value: 'COMMUNITY_SERVICE' },
    ROYAL_PARDON: { label: '🎁 Royal Pardon (+5 points to all)', value: 'ROYAL_PARDON' },
    LOYALTY_OATH: { label: '📜 The Loyalty Oath (Force apology comment)', value: 'LOYALTY_OATH' },
    CLOWN_LOCK: { label: '🤡 Clown Theme Lock (Lock target to clown theme)', value: 'CLOWN_LOCK' },
    ROYAL_SPY: { label: '👀 Royal Spy (Spy on target predictions)', value: 'ROYAL_SPY' }
  };

  const [decreeType, setDecreeType] = useState<string>('NONE');
  const [decreeTarget, setDecreeTarget] = useState<string>('');
  const [customOathText, setCustomOathText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSheikh = leaderboard[0]?.userId === user?.id;
  const nonLeaders = leaderboard.filter(m => m.userId !== user?.id);
  const firstTarget = nonLeaders[0]?.userId || '';

  useEffect(() => {
    if (!decreeTarget && firstTarget) {
      setDecreeTarget(firstTarget);
    }
  }, [leaderboard, firstTarget, decreeTarget]);

  // Sync state if a decree is already active
  useEffect(() => {
    if (activeDecree) {
      setDecreeType(activeDecree.activeDecreeType || 'NONE');
      setDecreeTarget(activeDecree.activeDecreeTargetId || firstTarget);
      setCustomOathText(activeDecree.activeDecreeComment || '');
    }
  }, [activeDecree, firstTarget]);

  const handleIssueDecree = async () => {
    setIsSubmitting(true);
    try {
      const needTarget = ['TRANSFER_BAN', 'COMMUNITY_SERVICE', 'LOYALTY_OATH', 'CLOWN_LOCK', 'ROYAL_SPY'].includes(decreeType);
      await apiIssueDecree(
        groupId,
        decreeType,
        needTarget ? decreeTarget : undefined,
        decreeType === 'LOYALTY_OATH' ? customOathText : undefined
      );
      toast.success('Royal Decree issued successfully!');
      qc.invalidateQueries({ queryKey: ['leaderboard', groupId] });
      qc.invalidateQueries({ queryKey: ['activeDecree', groupId] });
      refetchDecree();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to issue decree');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Relegation calculation: bottom 3 if N >= 4, bottom 1 if N = 2 or 3, else 0
  const totalMembers = leaderboard.length;
  const relegationCount = totalMembers >= 4 ? 3 : totalMembers > 1 ? 1 : 0;
  const relegationThresholdIndex = totalMembers - relegationCount;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Trophy className="text-amber-400 fill-amber-400/10" size={20} />
          <span>{user?.groupName ?? 'Leaderboard'}</span>
        </h2>
        <button
          onClick={() => {
            qc.invalidateQueries({ queryKey: ['leaderboard', groupId] });
            qc.invalidateQueries({ queryKey: ['activeDecree', groupId] });
          }}
          className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <LeaderboardRowSkeleton key={i} />)}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center text-zinc-500 gap-3">
          <Trophy size={48} className="text-zinc-650" />
          <p className="font-medium">No members in this league</p>
          <p className="text-sm">Invite friends using your league's invite code!</p>
        </div>
      ) : (
        <>
          {/* Round Sheikh announcement card for non-Sheikhs */}
          {!isSheikh && leaderboard[0] && (
            <div className="glass rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5 relative overflow-hidden shadow-gold-glow/5 mb-4 flex items-center gap-3 animate-fade-in">
              <span className="text-xl">👑</span>
              <div>
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Sheikh of the Round</p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  <span className="text-amber-400 font-black">{leaderboard[0].username}</span> is the Sheikh of the Round! They hold absolute power to issue decrees.
                </p>
              </div>
            </div>
          )}

          {/* Podium for top 3 (only shown if there are at least 3 players) */}
          {leaderboard.length >= 3 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />
              <Podium entries={leaderboard} />
            </div>
          )}

          {/* List of members (shows everyone in the league) */}
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                index={i}
                isRelegated={i >= relegationThresholdIndex}
                isCompareBlocked={activeDecree?.activeDecreeType === 'ROYAL_SPY' && activeDecree?.activeDecreeTargetId === user?.id}
                onCompare={(id, name) => {
                  setCompareUserId(id);
                  setCompareUsername(name);
                }}
              />
            ))}
          </div>

          {/* Dynamic referee banter roasts */}
          <RefRoasts leaderboard={leaderboard} />

          {/* Sheikh Decree Console */}
          {isSheikh && (
            <div className="glass rounded-2xl p-5 border border-amber-500/10 bg-amber-500/3 relative overflow-hidden shadow-sm mt-4">
              <div className="flex items-center gap-2 text-amber-400 mb-3.5">
                <span className="text-lg">👑</span>
                <h3 className="font-bold text-xs uppercase tracking-wider">Sheikh of the Round's Decree Console</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                As the Sheikh of the Round (the leader for this round), you hold the power to issue one Royal Decree to change the rules of the game. Your active decree is pinned to the activity feed for all players.
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Select Decree</label>
                    <select
                      value={decreeType}
                      onChange={(e) => setDecreeType(e.target.value)}
                      className="bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-550/50 cursor-pointer"
                    >
                      <option value="NONE">None (Clear Decrees)</option>
                      {(activeDecree?.availableDecrees || ['TRANSFER_BAN', 'COMMUNITY_SERVICE', 'ROYAL_PARDON']).map((type) => {
                        const opt = DECREE_OPTIONS[type as keyof typeof DECREE_OPTIONS];
                        if (!opt) return null;
                        return (
                          <option key={type} value={type}>
                            {opt.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {['TRANSFER_BAN', 'CLOWN_LOCK', 'ROYAL_SPY', 'LOYALTY_OATH'].includes(decreeType) && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Select Target Player</label>
                      <select
                        value={decreeTarget}
                        onChange={(e) => setDecreeTarget(e.target.value)}
                        className="bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-550/50 cursor-pointer"
                      >
                        {nonLeaders.map((m) => (
                          <option key={m.userId} value={m.userId}>
                            {m.username}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {decreeType === 'LOYALTY_OATH' && (
                    <div className="flex flex-col gap-2 col-span-1 sm:col-span-2 mt-2">
                      <label className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Statement to Sign (Forced Apology Comment)</label>
                      <textarea
                        value={customOathText}
                        onChange={(e) => setCustomOathText(e.target.value)}
                        placeholder={`e.g., I apologize to Sheikh ${user?.username} for my terrible football knowledge.`}
                        className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/10 transition-all resize-none h-20"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleIssueDecree}
                    disabled={isSubmitting}
                    className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-gold-glow flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? 'Issuing...' : 'Issue Royal Decree'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Comparison Modal */}
      <CompareModal
        isOpen={compareUserId !== null}
        onClose={() => setCompareUserId(null)}
        groupId={groupId}
        friendId={compareUserId || ''}
        friendName={compareUsername}
      />
    </div>
  );
}

// ── My Predictions Tab ───────────────────────────────────────────
function PredictionsTab() {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: apiGetMatches,
  });

  const myMatches = (matches as Match[]).filter((m: Match) => m.userPrediction !== null);

  const sections = [
    { label: 'Live',     items: myMatches.filter((m: Match) => m.status === 'LIVE') },
    { label: 'Upcoming', items: myMatches.filter((m: Match) => m.status === 'PENDING') },
    { label: 'Finished', items: myMatches.filter((m: Match) => m.status === 'FINISHED') },
  ].filter(s => s.items.length > 0);

  const totalPoints = myMatches
    .filter((m: Match) => m.status === 'FINISHED')
    .reduce((sum: number, m: Match) => sum + (m.userPrediction?.pointsEarned ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Star className="text-amber-400 fill-amber-400/10" size={20} />
          <span>My Predictions</span>
        </h2>
        {totalPoints > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/25 text-amber-400 text-sm font-bold px-3 py-1.5 rounded-full shadow-gold-glow/30">
            {totalPoints} pts total
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <LeaderboardRowSkeleton key={i} />)}
        </div>
      ) : myMatches.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center text-zinc-500 gap-3">
          <Star size={48} className="text-zinc-650" />
          <p className="font-medium">No predictions yet</p>
          <p className="text-sm">Head to the Matches tab to make your first prediction!</p>
        </div>
      ) : (
        sections.map(section => (
          <div key={section.label} className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-400">{section.label}</h3>
            {section.items.map((match: Match, i: number) => (
              <PredictionCard key={match.id} match={match} index={i} />
            ))}
          </div>
        ))
      )}
    </div>
  );
}

// ── Friends Tab ──────────────────────────────────────────────────
function FriendsTab() {
  const { user } = useAppStore();
  const groupId = user?.groupId ?? 'g1';
  const [limit, setLimit] = useState(20);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('ALL');

  // Fetch leaderboard to get group members list for filtering
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard', groupId],
    queryFn: () => apiGetLeaderboard(groupId),
  });

  const { data: activity = [], isLoading, isFetching } = useQuery({
    queryKey: ['activity', groupId, limit, selectedUserId],
    queryFn: () => apiGetActivity(groupId, limit, undefined, selectedUserId === 'ALL' ? undefined : selectedUserId),
    refetchInterval: 30_000,
  });

  const { data: activeDecree } = useQuery({
    queryKey: ['activeDecree', groupId],
    queryFn: () => apiGetActiveDecree(groupId),
    refetchInterval: 30_000,
  });

  const handleLoadMore = () => {
    setIsFetchingMore(true);
    setLimit((prev) => prev + 20);
  };

  useEffect(() => {
    if (!isFetching) {
      setIsFetchingMore(false);
    }
  }, [isFetching]);

  const hasMore = activity.length >= limit;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Users className="text-amber-550 fill-amber-555/10" size={20} />
          <span>League Activity</span>
        </h2>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* User selector dropdown */}
          {leaderboard.length > 0 && (
            <div className="relative flex items-center gap-2">
              <span className="text-[11px] text-zinc-550 font-bold uppercase tracking-wider hidden sm:inline">Filter:</span>
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setLimit(20); // Reset limit when filter changes
                }}
                className="bg-zinc-900/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 cursor-pointer transition-all"
              >
                <option value="ALL">All Players</option>
                {leaderboard.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.username}
                  </option>
                ))}
              </select>
            </div>
          )}
          <p className="text-xs text-zinc-550 hidden md:block">Scores hidden until kickoff</p>
        </div>
      </div>

      {/* Pinned Decree Banner */}
      {activeDecree && activeDecree.activeDecreeType && (
        <div className="glass rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5 relative overflow-hidden shadow-gold-glow/5 animate-fade-in flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">👑</span>
          <div className="flex-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-0.5">ROYAL DECREE IN EFFECT</h4>
            <p className="text-sm text-zinc-200 leading-relaxed font-semibold">
              {activeDecree.activeDecreeType === 'TRANSFER_BAN' && (
                <>Sheikh <span className="text-amber-400">{activeDecree.activeDecreeByName}</span> has banned <span className="text-amber-400">{activeDecree.activeDecreeTargetName}</span> from using Double Points this round! 🚫</>
              )}
              {activeDecree.activeDecreeType === 'GREEN_FALCONS' && (
                <>Sheikh <span className="text-amber-400">{activeDecree.activeDecreeByName}</span> has declared the Green Falcons Subsidy! Everyone gets +10 points if they predict a Saudi win. 🇸🇦</>
              )}
              {activeDecree.activeDecreeType === 'COMMUNITY_SERVICE' && (
                <>Sheikh <span className="text-amber-400">{activeDecree.activeDecreeByName}</span> has sentenced <span className="text-amber-400">{activeDecree.activeDecreeTargetName}</span> to Community Service! Last place layout lock is active. 🧹</>
              )}
              {activeDecree.activeDecreeType === 'ROYAL_PARDON' && (
                <>Sheikh <span className="text-amber-400">{activeDecree.activeDecreeByName}</span> has granted <span className="text-amber-400">{activeDecree.activeDecreeTargetName}</span> a Royal Pardon (+5 points). 🎁</>
              )}
              {activeDecree.activeDecreeType === 'LOYALTY_OATH' && (
                activeDecree.activeDecreeSigned ? (
                  <>📜 <span className="text-amber-400 font-black">{activeDecree.activeDecreeTargetName}</span> has sworn allegiance to Sheikh <span className="text-amber-400">{activeDecree.activeDecreeByName}</span>! They commented: <span className="italic text-zinc-100">"{activeDecree.activeDecreeComment}"</span></>
                ) : (
                  <>Sheikh <span className="text-amber-400">{activeDecree.activeDecreeByName}</span> has ordered <span className="text-amber-400">{activeDecree.activeDecreeTargetName}</span> to swear the Loyalty Oath! Awaiting signature... 📜</>
                )
              )}
            </p>
          </div>
        </div>
      )}

      {isLoading && activity.length === 0 ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <LeaderboardRowSkeleton key={i} />)}
        </div>
      ) : (
        <ActivityFeed
          entries={activity}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          isLoadingMore={isFetchingMore}
        />
      )}
    </div>
  );
}

// ── Tab content map ──────────────────────────────────────────────
const TAB_CONTENT: Record<DashTab, React.ComponentType> = {
  matches:     MatchesTab,
  leaderboard: LeaderboardTab,
  predictions: PredictionsTab,
  friends:     FriendsTab,
};

// Tab slide animation variants
const tabVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

const TAB_ORDER: DashTab[] = ['matches', 'leaderboard', 'predictions', 'friends'];

export default function DashboardPage() {
  const { activeTab, user, hydrated } = useAppStore();
  const router = useRouter();
  const [prevTab, setPrevTab] = useState<DashTab>(activeTab);
  const [direction, setDirection] = useState(0);

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard', user?.groupId],
    queryFn: () => apiGetLeaderboard(user?.groupId || ''),
    enabled: !!user?.groupId,
  });

  const { data: activeDecree } = useQuery({
    queryKey: ['activeDecree', user?.groupId],
    queryFn: () => apiGetActiveDecree(user?.groupId || ''),
    enabled: !!user?.groupId,
  });

  const isLoyaltyOathTarget =
    activeDecree?.activeDecreeType === 'LOYALTY_OATH' &&
    activeDecree?.activeDecreeTargetId === user?.id &&
    !activeDecree?.activeDecreeSigned;

  const [apologyComment, setApologyComment] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const qc = useQueryClient();

  const handleSwearAllegiance = async () => {
    setIsSigning(true);
    try {
      const byName = activeDecree?.activeDecreeByName || 'Sheikh';
      const defaultComment = `I, ${user?.username || 'the peasant'}, hereby swear absolute allegiance to Sheikh ${byName} and apologize for my absolute tactical incompetence! 📜👑`;
      const finalComment = apologyComment.trim() !== '' ? apologyComment.trim() : defaultComment;

      await apiSwearAllegiance(user?.groupId || '', finalComment);
      toast.success('You have sworn allegiance to the Sheikh! 📜👑');
      qc.invalidateQueries({ queryKey: ['activeDecree', user?.groupId] });
      qc.invalidateQueries({ queryKey: ['leaderboard', user?.groupId] });
      qc.invalidateQueries({ queryKey: ['activity', user?.groupId] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to sign the Loyalty Oath');
    } finally {
      setIsSigning(false);
    }
  };

  const lastPlacePlayerId = leaderboard.length > 0 ? leaderboard[leaderboard.length - 1]?.userId : null;
  const isCommunityServiceLock =
    activeDecree?.activeDecreeType === 'COMMUNITY_SERVICE' &&
    activeDecree?.activeDecreeTargetId === user?.id &&
    user?.id === lastPlacePlayerId;

  const isClownLock =
    activeDecree?.activeDecreeType === 'CLOWN_LOCK' &&
    activeDecree?.activeDecreeTargetId === user?.id;

  useEffect(() => {
    const themes = ['theme-lusail-gold', 'theme-al-bayt-crimson', 'theme-al-janoub-teal', 'theme-lusail-night', 'theme-ahmad-sunset', 'theme-sacked-manager', 'theme-clown'];
    themes.forEach((t) => document.body.classList.remove(t));

    if (isCommunityServiceLock) {
      document.body.classList.add('theme-sacked-manager');
    } else if (isClownLock) {
      document.body.classList.add('theme-clown');
    } else {
      const savedTheme = localStorage.getItem('wcp_theme') || 'theme-lusail-gold';
      document.body.classList.add(savedTheme);
    }
  }, [isCommunityServiceLock, isClownLock]);

  // Auth guard — redirect to login if no session, or to group-setup if no group
  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      router.replace('/login');
    } else if (!user.groupId) {
      router.replace('/group-setup');
    }
  }, [user, hydrated, router]);

  useEffect(() => {
    const prevIndex = TAB_ORDER.indexOf(prevTab);
    const currIndex = TAB_ORDER.indexOf(activeTab);
    setDirection(currIndex > prevIndex ? 1 : -1);
    setPrevTab(activeTab);
  }, [activeTab]); // eslint-disable-line

  if (!hydrated || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-pattern">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    </div>
  );

  const ActiveTabContent = TAB_CONTENT[activeTab];

  return (
    <div className="min-h-screen bg-pattern">
      <Header />
      <TabNav />

      <main className="max-w-5xl mx-auto px-4 pt-6 pb-28 md:pb-10">
        {isCommunityServiceLock && (
          <div className="bg-zinc-950 border border-red-500/20 text-zinc-400 rounded-2xl p-4 mb-5 text-center text-xs font-semibold relative overflow-hidden shadow-inner animate-pulse-border">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 rotate-45 bg-red-550/10 text-red-500 text-[8px] font-black py-1 px-10 tracking-widest uppercase">
              SACKED
            </div>
            🔒 **COMMUNITY SERVICE MODE ACTIVE:** You have been sentenced to community service by order of the Sheikh. Your dashboard theme is locked to plain gray.
          </div>
        )}

        {isClownLock && (
          <div className="bg-pink-950 border border-pink-500/30 text-pink-300 rounded-2xl p-4 mb-5 text-center text-xs font-bold relative overflow-hidden shadow-inner animate-pulse-border">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 rotate-45 bg-pink-500/20 text-pink-400 text-[8px] font-black py-1 px-10 tracking-widest uppercase">
              CLOWN
            </div>
            🤡 **CLOWN THEME LOCK ACTIVE:** You have been crowned the League Clown by order of the Sheikh. Your theme is locked to neon clown styling.
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <ActiveTabContent />
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />

      {/* Loyalty Oath Overlay Modal */}
      <AnimatePresence>
        {isLoyaltyOathTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-fade-in"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-full max-w-lg bg-gradient-to-b from-amber-950/30 to-zinc-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-center"
            >
              {/* Background ambient gold light */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 shadow-gold-glow/10">
                <span className="text-3xl animate-bounce">📜</span>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight">The Loyalty Oath</h2>
              <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mt-1">BY ORDER OF THE SHEIKH</p>

              <div className="bg-zinc-950/60 border border-white/5 rounded-2xl p-5 my-6 text-left relative">
                <span className="text-zinc-650 font-serif text-5xl absolute -top-2 -left-1 select-none pointer-events-none">“</span>
                <p className="text-sm text-zinc-300 leading-relaxed font-medium relative z-10 pl-4 pr-2 pt-2">
                  I, <span className="text-amber-400 font-black">{user?.username}</span>, do hereby acknowledge my absolute tactical incompetence and swear total, undivided allegiance to Sheikh <span className="text-amber-400 font-black">{activeDecree?.activeDecreeByName}</span>. I pledge to honor their rule and consult their wisdom for the remainder of this round.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 text-left mb-6">
                <label className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider font-semibold">Leave your apology comment for the league feed</label>
                <textarea
                  value={apologyComment}
                  onChange={(e) => setApologyComment(e.target.value)}
                  placeholder={`e.g., I apologize to Sheikh ${activeDecree?.activeDecreeByName || 'Sheikh'} for my terrible football knowledge.`}
                  className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/10 transition-all resize-none h-20"
                />
              </div>

              <button
                onClick={handleSwearAllegiance}
                disabled={isSigning}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-550 hover:from-amber-500 hover:to-amber-600 disabled:from-amber-500/50 disabled:to-amber-600/50 text-black font-black uppercase tracking-wider py-4 rounded-xl shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer transition-all text-xs"
              >
                {isSigning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Signing Oath...
                  </>
                ) : (
                  <>
                    <span>Sign & Swear Allegiance</span>
                    <span className="text-sm">👑</span>
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clown Emojis floating animation */}
      {isClownLock && (
        <div className="fixed inset-0 pointer-events-none z-[45] overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute text-3xl animate-float-clown animate-infinite"
              style={{
                left: `${(i * 9) % 100}%`,
                animationDelay: `${i * 0.7}s`,
                bottom: `-50px`,
              }}
            >
              🤡
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
