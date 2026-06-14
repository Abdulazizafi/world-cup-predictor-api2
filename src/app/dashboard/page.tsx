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
import MatchCard from '@/components/match/MatchCard';
import Podium from '@/components/leaderboard/Podium';
import LeaderboardRow from '@/components/leaderboard/LeaderboardRow';
import PredictionCard from '@/components/predictions/PredictionCard';
import PredictionHeatmap from '@/components/predictions/PredictionHeatmap';
import ActivityFeed from '@/components/friends/ActivityFeed';
import { MatchCardSkeleton, LeaderboardRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  apiGetMatches, apiGetLeaderboard, apiGetActivity,
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

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard', groupId],
    queryFn: () => apiGetLeaderboard(groupId),
    refetchInterval: 30_000,
  });

  const below3 = leaderboard.filter(e => e.rank > 3);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Trophy className="text-amber-400 fill-amber-400/10" size={20} />
          <span>{user?.groupName ?? 'Leaderboard'}</span>
        </h2>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['leaderboard', groupId] })}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
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
              <LeaderboardRow key={entry.userId} entry={entry} index={i} />
            ))}
          </div>
        </>
      )}
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

  const { data: activity = [], isLoading } = useQuery({
    queryKey: ['activity', groupId],
    queryFn: () => apiGetActivity(groupId),
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Users className="text-amber-450 fill-amber-450/10" size={20} />
          <span>League Activity</span>
        </h2>
        <p className="text-xs text-zinc-500">Scores hidden until kickoff</p>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <LeaderboardRowSkeleton key={i} />)}
        </div>
      ) : (
        <ActivityFeed entries={activity} />
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
    </div>
  );
}
