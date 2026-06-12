// types/index.ts — All shared TypeScript types for WC Predictor 2026
export type MatchStatus = 'PENDING' | 'LIVE' | 'FINISHED';

export interface User {
  id: string;
  username: string;
  createdAt: string;
  groupId: string | null;
  groupName: string | null;
  inviteCode: string | null;
}

export interface Match {
  id: string;
  externalId: string;
  teamA: string;
  teamB: string;
  teamAFlag: string | null;
  teamBFlag: string | null;
  matchTime: string;        // ISO UTC
  status: MatchStatus;
  scoreA: number | null;
  scoreB: number | null;
  stage: string;
  venue: string | null;
  userPrediction: UserPrediction | null;
}

export interface UserPrediction {
  id: string;
  matchId: string;
  predictedScoreA: number;
  predictedScoreB: number;
  pointsEarned: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalPoints: number;
  isCurrentUser: boolean;
}

export interface ActivityEntry {
  username: string;
  matchId: string;
  teamA: string;
  teamB: string;
  matchTime: string;
  status: MatchStatus;
  predictedScoreA: number | null;   // null = hidden pre-kickoff
  predictedScoreB: number | null;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  creatorId: string;
  createdAt: string;
}

export type DashTab = 'matches' | 'leaderboard' | 'predictions' | 'friends';
