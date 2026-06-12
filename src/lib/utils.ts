// lib/utils.ts — Utility functions
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatMatchTime = (iso: string) => {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    full: d.toLocaleString('en-GB'),
  };
};

export const timeAgo = (iso: string): string => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)     return 'just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const isPastKickoff = (matchTime: string) =>
  new Date() >= new Date(matchTime);

// Country code → flag emoji
const FLAGS: Record<string, string> = {
  USA:'🇺🇸',MEX:'🇲🇽',CAN:'🇨🇦',BRA:'🇧🇷',ARG:'🇦🇷',FRA:'🇫🇷',
  ENG:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',GER:'🇩🇪',ESP:'🇪🇸',POR:'🇵🇹',NED:'🇳🇱',BEL:'🇧🇪',
  URU:'🇺🇾',COL:'🇨🇴',JPN:'🇯🇵',KOR:'🇰🇷',SEN:'🇸🇳',MOR:'🇲🇦',
  NGA:'🇳🇬',CMR:'🇨🇲',CRO:'🇭🇷',POL:'🇵🇱',DEN:'🇩🇰',SUI:'🇨🇭',
  AUT:'🇦🇹',TUR:'🇹🇷',SRB:'🇷🇸',UKR:'🇺🇦',WAL:'🏴󠁧󠁢󠁷󠁬󠁳󠁿',SCO:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  AUS:'🇦🇺',NZL:'🇳🇿',IRN:'🇮🇷',KSA:'🇸🇦',QAT:'🇶🇦',CHN:'🇨🇳',
  IND:'🇮🇳',VEN:'🇻🇪',ECU:'🇪🇨',CHI:'🇨🇱',PER:'🇵🇪',BOL:'🇧🇴',
};

export const getFlag = (teamName: string, apiFlag?: string | null): string => {
  if (apiFlag && !apiFlag.startsWith('http')) return apiFlag;
  const key = teamName.toUpperCase().slice(0, 3);
  return FLAGS[key] ?? '🏳️';
};

export const getInitial = (name: string) => name[0]?.toUpperCase() ?? '?';
