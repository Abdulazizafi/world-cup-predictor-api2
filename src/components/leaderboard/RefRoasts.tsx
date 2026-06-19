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

    const nonLeaders = leaderboard.filter(e => e.userId !== leader?.userId);
    const getRandomMember = () => {
      if (nonLeaders.length === 0) return null;
      return nonLeaders[Math.floor(Math.random() * nonLeaders.length)];
    };

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

    // 3. Most Incorrect Predictions (Harry Maguire Award)
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

    // 6. Draw Merchant / Bus Parker
    const drawMerchant = getRandomMember();
    if (drawMerchant) {
      const drawRoasts = [
        `🚌 BUS PARKER: ${drawMerchant.username} predicted draws for every game. Jose Mourinho called, he wants his 2010 Chelsea tactics back.`,
        `🤝 PEACEMAKER: ${drawMerchant.username} is out here predicting draws for every single game. Bro just wants everyone to hold hands and share the points.`
      ];
      list.push(drawRoasts[Math.floor(Math.random() * drawRoasts.length)]);
    }

    // 7. The Curse / Reverse Oracle
    const cursed = getRandomMember();
    if (cursed) {
      const curseRoasts = [
        `🔮 THE CURSE: If you want your team to win, pray that ${cursed.username} predicts they will lose. Their reverse-prediction accuracy is 100%.`,
        `🚨 EMERGENCY WARNING: ${cursed.username} has predicted France to win today. The French team has reportedly hired a spiritual healer to break the curse.`
      ];
      list.push(curseRoasts[Math.floor(Math.random() * curseRoasts.length)]);
    }

    // 8. Patriot / Kit Picker
    const patriot = getRandomMember();
    if (patriot) {
      const patriotRoasts = [
        `🇸🇦 DELUSION WATCH: ${patriot.username} predicted Saudi Arabia to beat France 6-0. We love the patriotism, but even Hervé Renard is concerned.`,
        `🎨 FASHION OVER FOOTBALL: ${patriot.username} is picking match winners based on which kit looks cooler. Truly a high-IQ football analysis.`
      ];
      list.push(patriotRoasts[Math.floor(Math.random() * patriotRoasts.length)]);
    }

    // 9. Ghost / Sleeping Manager
    const ghost = getRandomMember();
    if (ghost) {
      const ghostRoasts = [
        `🕵️ VACATION WATCH: ${ghost.username} completely forgot to predict this round. Reportedly seen vacationing in Ibiza while their team is forfeiting.`,
        `💤 GHOST PROTOCOL: ${ghost.username} is officially MIA. Bro fell asleep and is waiting for the 2030 World Cup to start.`
      ];
      list.push(ghostRoasts[Math.floor(Math.random() * ghostRoasts.length)]);
    }

    // 10. Glory Hunter (Climber)
    const climber = leaderboard.find(e => e.trend === 'UP');
    if (climber) {
      list.push(`🧗 GLORY HUNTER: ${climber.username} climbed the standings and is already updating their CV to 'Tactical Genius'. Calm down, Pep.`);
    }

    // 11. General Banter
    list.push(`⚽ BANTER: Remember, 90% of predictors stop doubling down right before they are about to get a +200 pts exact score prediction.`);

    // Return 3 random roasts from the list
    const shuffled = list.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
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
