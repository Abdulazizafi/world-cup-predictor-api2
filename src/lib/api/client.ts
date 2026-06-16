// lib/api/client.ts
// Toggle USE_MOCK to switch between mock data and real API
import axios from 'axios';
import {
  MOCK_USER, MOCK_MATCHES, MOCK_LEADERBOARD, MOCK_ACTIVITY
} from './mock';
import type { Match, LeaderboardEntry, ActivityEntry, User } from '@/types';

export const USE_MOCK = false; // ← Real API on :3000 (set true for offline mock)

const http = axios.create({
  baseURL: '/api/proxy',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Simulate network delay for mock mode
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// ── Auth ────────────────────────────────────────────────────────
export const apiGetMe = async (): Promise<User> => {
  if (USE_MOCK) { await delay(); return MOCK_USER; }
  const res = await http.get('/auth/me');
  return res.data.data.user;
};

export const apiLogin = async (username: string, password: string): Promise<User> => {
  if (USE_MOCK) { await delay(600); return MOCK_USER; }
  const res = await http.post('/auth/login', { username, password });
  return res.data.data.user;
};

export const apiRegister = async (username: string, password: string): Promise<User> => {
  if (USE_MOCK) { await delay(800); return MOCK_USER; }
  const res = await http.post('/auth/register', { username, password });
  return res.data.data.user;
};

export const apiLogout = async (): Promise<void> => {
  if (USE_MOCK) { await delay(300); return; }
  await http.post('/auth/logout');
};

// ── Matches ─────────────────────────────────────────────────────
export const apiGetMatches = async (): Promise<Match[]> => {
  if (USE_MOCK) { await delay(); return MOCK_MATCHES; }
  const res = await http.get('/matches');
  return res.data.data.matches;
};

export const apiSubmitPrediction = async (
  matchId: string,
  predictedScoreA: number,
  predictedScoreB: number,
  useDoublePoints?: boolean,
): Promise<void> => {
  if (USE_MOCK) { await delay(500); return; }
  await http.post('/predictions', { matchId, predictedScoreA, predictedScoreB, useDoublePoints });
};

// ── Groups ──────────────────────────────────────────────────────
export const apiCreateGroup = async (name: string) => {
  if (USE_MOCK) { await delay(700); return { id: 'g1', name, inviteCode: 'WC2026' }; }
  const res = await http.post('/groups/create', { name });
  return res.data.data.group;
};

export const apiJoinGroup = async (inviteCode: string) => {
  if (USE_MOCK) { await delay(600); return { groupId: 'g1', groupName: 'Office WC League', inviteCode }; }
  const res = await http.post('/groups/join', { inviteCode });
  return res.data.data;
};

export const apiGetLeaderboard = async (groupId: string): Promise<LeaderboardEntry[]> => {
  if (USE_MOCK) { await delay(); return MOCK_LEADERBOARD; }
  const res = await http.get(`/groups/${groupId}/leaderboard`);
  return res.data.data.leaderboard;
};

export const apiGetActivity = async (groupId: string, limit?: number, offset?: number): Promise<ActivityEntry[]> => {
  if (USE_MOCK) { await delay(); return MOCK_ACTIVITY; }
  const res = await http.get(`/groups/${groupId}/activity`, { params: { limit, offset } });
  return res.data.data.activity;
};

export const apiComparePredictions = async (
  groupId: string,
  userId: string,
): Promise<
  Array<{
    matchId: string;
    predictedScoreA: number;
    predictedScoreB: number;
    pointsEarned: number;
    useDoublePoints: boolean;
  }>
> => {
  if (USE_MOCK) { await delay(); return []; }
  const res = await http.get(`/groups/${groupId}/compare/${userId}`);
  return res.data.data.predictions;
};

export const apiGetGroupInsights = async (
  groupId: string,
): Promise<{
  averagePoints: number;
  maxPointsEarned: number;
  maxPointsUsername: string | null;
  upsetMatch: { teamA: string; teamB: string; averagePoints: number } | null;
}> => {
  if (USE_MOCK) {
    await delay();
    return {
      averagePoints: 120,
      maxPointsEarned: 200,
      maxPointsUsername: 'Messi',
      upsetMatch: { teamA: 'Argentina', teamB: 'Saudi Arabia', averagePoints: 1.2 }
    };
  }
  const res = await http.get(`/groups/${groupId}/insights`);
  return res.data.data.insights;
};



