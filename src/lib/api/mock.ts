// lib/api/mock.ts
// ─────────────────────────────────────────────────────────────────
// Complete mock data layer. Flip USE_MOCK=false in client.ts to
// switch to the real Express API.
// ─────────────────────────────────────────────────────────────────
import type { Match, LeaderboardEntry, ActivityEntry, User } from '@/types';

export const MOCK_USER: User = {
  id: 'u1',
  username: 'alex_fan',
  createdAt: new Date().toISOString(),
  groupId: 'g1',
  groupName: 'Office WC League',
  inviteCode: 'WC2026',
};

const now = Date.now();
const h = 3600_000;

export const MOCK_MATCHES: Match[] = [
  // Group Stage — upcoming
  {
    id: 'm1', externalId: 'ext-1',
    teamA: 'USA', teamB: 'MEX', teamAFlag: '🇺🇸', teamBFlag: '🇲🇽',
    matchTime: new Date(now + 2 * h).toISOString(),
    status: 'PENDING', scoreA: null, scoreB: null,
    stage: 'Group A', venue: 'AT&T Stadium, Dallas',
    userPrediction: null,
  },
  {
    id: 'm2', externalId: 'ext-2',
    teamA: 'BRA', teamB: 'ARG', teamAFlag: '🇧🇷', teamBFlag: '🇦🇷',
    matchTime: new Date(now + 5 * h).toISOString(),
    status: 'PENDING', scoreA: null, scoreB: null,
    stage: 'Group B', venue: 'Rose Bowl, LA',
    userPrediction: { id: 'p1', matchId: 'm2', predictedScoreA: 2, predictedScoreB: 1, pointsEarned: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  },
  // Live match
  {
    id: 'm3', externalId: 'ext-3',
    teamA: 'FRA', teamB: 'ENG', teamAFlag: '🇫🇷', teamBFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    matchTime: new Date(now - 30 * 60_000).toISOString(),
    status: 'LIVE', scoreA: 1, scoreB: 1,
    stage: 'Group C', venue: 'SoFi Stadium, Inglewood',
    userPrediction: { id: 'p2', matchId: 'm3', predictedScoreA: 2, predictedScoreB: 0, pointsEarned: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  },
  // Finished matches
  {
    id: 'm4', externalId: 'ext-4',
    teamA: 'GER', teamB: 'ESP', teamAFlag: '🇩🇪', teamBFlag: '🇪🇸',
    matchTime: new Date(now - 4 * h).toISOString(),
    status: 'FINISHED', scoreA: 2, scoreB: 1,
    stage: 'Group D', venue: 'MetLife Stadium, NJ',
    userPrediction: { id: 'p3', matchId: 'm4', predictedScoreA: 2, predictedScoreB: 1, pointsEarned: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  },
  {
    id: 'm5', externalId: 'ext-5',
    teamA: 'POR', teamB: 'BEL', teamAFlag: '🇵🇹', teamBFlag: '🇧🇪',
    matchTime: new Date(now - 6 * h).toISOString(),
    status: 'FINISHED', scoreA: 0, scoreB: 2,
    stage: 'Group E', venue: 'Levi\'s Stadium, SF',
    userPrediction: { id: 'p4', matchId: 'm5', predictedScoreA: 1, predictedScoreB: 1, pointsEarned: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  },
  {
    id: 'm6', externalId: 'ext-6',
    teamA: 'JPN', teamB: 'KOR', teamAFlag: '🇯🇵', teamBFlag: '🇰🇷',
    matchTime: new Date(now + 10 * h).toISOString(),
    status: 'PENDING', scoreA: null, scoreB: null,
    stage: 'Group F', venue: 'Arrowhead Stadium, KC',
    userPrediction: null,
  },
  {
    id: 'm7', externalId: 'ext-7',
    teamA: 'NED', teamB: 'SEN', teamAFlag: '🇳🇱', teamBFlag: '🇸🇳',
    matchTime: new Date(now + 14 * h).toISOString(),
    status: 'PENDING', scoreA: null, scoreB: null,
    stage: 'Group G', venue: 'Lincoln Financial, Philly',
    userPrediction: null,
  },
  {
    id: 'm8', externalId: 'ext-8',
    teamA: 'CAN', teamB: 'MOR', teamAFlag: '🇨🇦', teamBFlag: '🇲🇦',
    matchTime: new Date(now - 2 * h).toISOString(),
    status: 'FINISHED', scoreA: 1, scoreB: 2,
    stage: 'Group H', venue: 'BC Place, Vancouver',
    userPrediction: { id: 'p5', matchId: 'm8', predictedScoreA: 0, predictedScoreB: 1, pointsEarned: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 'u2', username: 'sarah_chen',  totalPoints: 420, isCurrentUser: false },
  { rank: 2, userId: 'u1', username: 'alex_fan',    totalPoints: 355, isCurrentUser: true  },
  { rank: 3, userId: 'u3', username: 'mike_ramos',  totalPoints: 288, isCurrentUser: false },
  { rank: 4, userId: 'u4', username: 'julia_k',     totalPoints: 210, isCurrentUser: false },
  { rank: 5, userId: 'u5', username: 'david_p',     totalPoints: 175, isCurrentUser: false },
  { rank: 6, userId: 'u6', username: 'tom_w',       totalPoints: 140, isCurrentUser: false },
  { rank: 7, userId: 'u7', username: 'nina_b',      totalPoints: 95,  isCurrentUser: false },
];

export const MOCK_ACTIVITY: ActivityEntry[] = [
  { username: 'sarah_chen', matchId: 'm1', teamA: 'USA', teamB: 'MEX', matchTime: new Date(now + 2 * h).toISOString(), status: 'PENDING', predictedScoreA: null, predictedScoreB: null, createdAt: new Date(now - 5 * 60_000).toISOString() },
  { username: 'mike_ramos', matchId: 'm2', teamA: 'BRA', teamB: 'ARG', matchTime: new Date(now + 5 * h).toISOString(), status: 'PENDING', predictedScoreA: null, predictedScoreB: null, createdAt: new Date(now - 12 * 60_000).toISOString() },
  { username: 'julia_k',    matchId: 'm4', teamA: 'GER', teamB: 'ESP', matchTime: new Date(now - 4 * h).toISOString(), status: 'FINISHED', predictedScoreA: 2, predictedScoreB: 1, createdAt: new Date(now - 4.5 * h).toISOString() },
  { username: 'sarah_chen', matchId: 'm8', teamA: 'CAN', teamB: 'MOR', matchTime: new Date(now - 2 * h).toISOString(), status: 'FINISHED', predictedScoreA: 1, predictedScoreB: 2, createdAt: new Date(now - 2.5 * h).toISOString() },
  { username: 'david_p',    matchId: 'm6', teamA: 'JPN', teamB: 'KOR', matchTime: new Date(now + 10 * h).toISOString(), status: 'PENDING', predictedScoreA: null, predictedScoreB: null, createdAt: new Date(now - 20 * 60_000).toISOString() },
];
