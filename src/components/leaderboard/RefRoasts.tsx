'use client';
// components/leaderboard/RefRoasts.tsx — Referee's Banter & Roast Report
import { useState, useEffect } from 'react';
import { Megaphone, RefreshCw } from 'lucide-react';

interface RefRoastsProps {
  leaderboard: any[];
}

export default function RefRoasts({ leaderboard }: RefRoastsProps) {
  const [roasts, setRoasts] = useState<string[]>([]);

  const generateRoasts = () => {
    if (!leaderboard || leaderboard.length === 0) return [];

    const list: string[] = [];
    const sortedByPoints = [...leaderboard].sort((a, b) => b.totalPoints - a.totalPoints);
    const leader = sortedByPoints[0];
    const last = sortedByPoints[sortedByPoints.length - 1];

    // 1. Leader Roast
    if (leader) {
      const leaderRoasts = [
        `🚨 REF REPORT: ${leader.username} is leading the league. VAR is currently auditing their bank account for suspicious referee payouts.`,
        `🏆 SPECIAL ONE WATCH: ${leader.username} is in 1st place. They've reportedly booked a press conference to demand 'Respect, respect, respect!'`,
        `📈 MATCH FIXER: ${leader.username} is at the top. The rest of the league is petitioning FIFA to inspect their predictions for insider trading.`
      ];
      list.push(leaderRoasts[Math.floor(Math.random() * leaderRoasts.length)]);
    }

    // 2. Last Place Roast
    if (last && last.userId !== leader?.userId) {
      const lastRoasts = [
        `📉 FRAUD WATCH: ${last.username} is holding up the table. Sacking their tactical manager is reportedly imminent.`,
        `🤡 CLUELESS CORNER: ${last.username} is currently in the Relegation Zone. They are apparently trying to see if they can get negative points.`,
        `🦲 BALD FRAUD: ${last.username} is sitting in last place. Absolute tactical disaster class.`
      ];
      list.push(lastRoasts[Math.floor(Math.random() * lastRoasts.length)]);
    }

    // 3. Most Incorrect Predictions
    const mostIncorrect = [...leaderboard].sort((a, b) => (b.incorrectCount ?? 0) - (a.incorrectCount ?? 0))[0];
    if (mostIncorrect && (mostIncorrect.incorrectCount ?? 0) > 0) {
      list.push(`🧱 HARRY MAGUIRE AWARD: ${mostIncorrect.username} has got ${mostIncorrect.incorrectCount} predictions completely wrong. They are officially qualified to teach defending.`);
    }

    // 4. Most Double Boosts Used
    const mostDouble = [...leaderboard].sort((a, b) => (b.doubleUsed ?? 0) - (a.doubleUsed ?? 0))[0];
    if (mostDouble && (mostDouble.doubleUsed ?? 0) >= 3) {
      list.push(`💸 BOOSTER SHAME: ${mostDouble.username} has burned ${mostDouble.doubleUsed} Double Tokens. A masterclass in doubling down on wrong scores.`);
    }

    // 5. Recent Faller
    const faller = leaderboard.find(e => e.trend === 'DOWN');
    if (faller) {
      list.push(`📉 GRAVITY WATCH: ${faller.username} slipped down the standings. Slipped faster than Steven Gerrard in 2014.`);
    }

    // 6. General Banter
    list.push(`⚽ BANTER: Remember, 90% of predictors stop doubling down right before they are about to get a +200 pts exact score prediction.`);

    // Return 2 random roasts from the list
    const shuffled = list.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  };

  useEffect(() => {
    setRoasts(generateRoasts());
  }, [leaderboard]); // eslint-disable-line

  if (roasts.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-5 border border-red-500/10 bg-red-500/3 relative overflow-hidden shadow-sm animate-fade-in mt-4">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2 text-red-400">
          <Megaphone size={16} className="animate-float" />
          <h3 className="font-bold text-xs uppercase tracking-wider">Referee's Banter Report</h3>
        </div>
        <button
          onClick={() => setRoasts(generateRoasts())}
          className="text-zinc-550 hover:text-zinc-350 transition-colors p-1 cursor-pointer"
          title="Refresh Roasts"
        >
          <RefreshCw size={12} />
        </button>
      </div>
      <div className="space-y-3">
        {roasts.map((roast, i) => (
          <div key={i} className="text-sm text-zinc-300 font-medium leading-relaxed bg-zinc-950/40 border border-white/5 rounded-xl p-3">
            {roast}
          </div>
        ))}
      </div>
    </div>
  );
}
