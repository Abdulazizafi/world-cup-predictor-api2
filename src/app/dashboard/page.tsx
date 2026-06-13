'use client';
// app/dashboard/page.tsx — Main SPA dashboard with all tabs
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import TabNav from '@/components/layout/TabNav';
import MatchCard from '@/components/match/MatchCard';
import Podium from '@/components/leaderboard/Podium';
import LeaderboardRow from '@/components/leaderboard/LeaderboardRow';
import PredictionCard from '@/components/predictions/PredictionCard';
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
  const stages = ['All', ...Array.from(new Set(matches.map((m: Match) => m.stage)))];
  const filtered = filter === 'All' ? matches : matches.filter((m: Match) => m.stage === filter);

  // Count active x2 double points tokens
  const x2Used = (matches as Match[]).filter((m: Match) => m.userPrediction?.useDoublePoints).length;

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

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black">⚽ Matches</h2>
          <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full shadow-gold-glow/10">
            ⚡ Double Points: {x2Used}/5 used
          </span>
        </div>
        <p className="text-xs text-zinc-500">Exact = 100pts · Outcome = 40pts (Doubled with x2)</p>
      </div>

      {/* Stage filter dropdown */}
      {stages.length > 2 && (
        <div className="flex items-center gap-2 max-w-xs">
          <Filter size={14} className="text-zinc-400 shrink-0" />
          <div className="relative flex-1">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer"
            >
              {stages.map((s) => (
                <option key={s} value={s} className="bg-zinc-950 text-white">
                  {s === 'All' ? '📅 All Stages / Groups' : s}
                </option>
              ))}
            </select>
            {/* Custom arrow decoration */}
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
      ) : sortedMatches.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center text-zinc-500 gap-3">
          <span className="text-5xl">🏟️</span>
          <p className="font-medium">No matches found</p>
          <p className="text-sm">Match data syncs from the World Cup API automatically</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedMatches.map((match: Match, i: number) => (
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
        <h2 className="text-xl font-black">🏆 {user?.groupName ?? 'Leaderboard'}</h2>
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
          <span className="text-5xl">🏆</span>
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
    { label: '🔴 Live',     items: myMatches.filter((m: Match) => m.status === 'LIVE') },
    { label: '⏳ Upcoming', items: myMatches.filter((m: Match) => m.status === 'PENDING') },
    { label: '✅ Finished', items: myMatches.filter((m: Match) => m.status === 'FINISHED') },
  ].filter(s => s.items.length > 0);

  const totalPoints = myMatches
    .filter((m: Match) => m.status === 'FINISHED')
    .reduce((sum: number, m: Match) => sum + (m.userPrediction?.pointsEarned ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">⭐ My Predictions</h2>
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
          <span className="text-5xl">⭐</span>
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
        <h2 className="text-xl font-black">👥 League Activity</h2>
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
