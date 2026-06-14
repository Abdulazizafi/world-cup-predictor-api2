'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Match } from '@/types';

interface PredictionHeatmapProps {
  matches: Match[];
  flat?: boolean;
}

export default function PredictionHeatmap({ matches, flat = false }: PredictionHeatmapProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sort matches chronologically
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime()
  );

  const totalMatches = 104;
  // Pad the matches to 104 in case they are not fully loaded/synced yet
  const gridItems = Array.from({ length: totalMatches }).map((_, i) => {
    return sortedMatches[i] || null;
  });

  const getCellDetails = (match: Match | null, idx: number) => {
    if (!match) {
      return {
        colorClass: 'bg-zinc-900/40 border-white/5 text-zinc-650',
        label: 'Unavailable',
        desc: 'Match details not loaded yet',
      };
    }

    const pred = match.userPrediction;
    if (!pred) {
      return {
        colorClass: 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-zinc-700 hover:bg-zinc-800/80',
        label: 'Unpredicted',
        desc: `${match.teamA} vs ${match.teamB} (Unpredicted)`,
        match,
      };
    }

    if (match.status === 'FINISHED') {
      const pts = pred.pointsEarned;
      if (pts === 100 || pts === 200) {
        return {
          colorClass: 'bg-emerald-500/20 border-emerald-500/45 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)] hover:bg-emerald-500/35 hover:border-emerald-500/60',
          label: 'Exact Outcome',
          desc: `Exact Score! ${match.teamA} ${match.scoreA}–${match.scoreB} ${match.teamB} (+${pts} pts)`,
          match,
        };
      }
      if (pts === 40 || pts === 80) {
        return {
          colorClass: 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/35 hover:border-amber-500/50',
          label: 'Correct Outcome',
          desc: `Correct Outcome: ${match.teamA} vs ${match.teamB} (Result: ${match.scoreA}–${match.scoreB}) (+${pts} pts)`,
          match,
        };
      }
      return {
        colorClass: 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25 hover:border-red-500/40',
        label: 'Incorrect',
        desc: `Wrong Outcome: ${match.teamA} vs ${match.teamB} (Result: ${match.scoreA}–${match.scoreB}, Pred: ${pred.predictedScoreA}–${pred.predictedScoreB})`,
        match,
      };
    }

    // LIVE or PENDING
    return {
      colorClass: 'bg-blue-500/20 border-blue-500/45 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.1)] hover:bg-blue-500/30 hover:border-blue-500/60',
      label: 'Predicted',
      desc: `Predicted: ${match.teamA} ${pred.predictedScoreA}–${pred.predictedScoreB} ${match.teamB} (${match.status === 'LIVE' ? 'LIVE' : 'Upcoming'})`,
      match,
    };
  };

  const hoveredItem = hoveredIndex !== null ? gridItems[hoveredIndex] : null;
  const hoveredDetails = hoveredIndex !== null ? getCellDetails(hoveredItem, hoveredIndex) : null;

  return (
    <div className={flat ? 'space-y-4' : 'glass rounded-2xl p-5 border border-white/5 space-y-4'}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-sm tracking-wide flex items-center gap-1.5">
            <span>Prediction Streak & Heatmap</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-semibold">
              104 Matches
            </span>
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Chronological grid of your predictions and results.
          </p>
        </div>

        {/* Legend summary */}
        <div className="hidden md:flex items-center gap-3 text-[10px] text-zinc-400 font-semibold select-none">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40 block" />
            <span>Exact</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/40 block" />
            <span>Outcome</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-red-500/15 border border-red-500/30 block" />
            <span>Wrong</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-500/20 border border-blue-500/40 block" />
            <span>Predicted</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-zinc-900 border border-white/5 block" />
            <span>Empty</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-8 sm:grid-cols-13 gap-1.5 select-none">
        {gridItems.map((match, idx) => {
          const { colorClass } = getCellDetails(match, idx);
          return (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: (idx % 13) * 0.008 + Math.floor(idx / 13) * 0.008,
                duration: 0.15,
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`aspect-square w-full rounded-md border text-[9px] font-bold flex items-center justify-center cursor-pointer transition-all duration-150 ${colorClass}`}
            >
              {idx + 1}
            </motion.div>
          );
        })}
      </div>

      {/* Hover details display card */}
      <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-3 min-h-[56px] flex items-center justify-between transition-all duration-200">
        {hoveredDetails && hoveredItem ? (
          <div className="flex items-center justify-between w-full gap-4 text-xs animate-fade-in">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-zinc-450 text-[10px] uppercase tracking-wider">
                Match #{hoveredIndex! + 1} · {hoveredItem.stage}
              </span>
              <span className="text-white font-bold">
                {hoveredDetails.desc}
              </span>
              {hoveredItem.userPrediction && (
                <span className="text-[10px] text-zinc-500">
                  Your Prediction: {hoveredItem.userPrediction.predictedScoreA}–{hoveredItem.userPrediction.predictedScoreB}
                  {hoveredItem.userPrediction.useDoublePoints && ' (⚡ 2x)'}
                  {hoveredItem.status === 'FINISHED' && ` · Result: ${hoveredItem.scoreA}–${hoveredItem.scoreB}`}
                </span>
              )}
            </div>
            
            <div className="shrink-0">
              {hoveredItem.status === 'FINISHED' && hoveredItem.userPrediction && (
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                  hoveredItem.userPrediction.pointsEarned >= 100
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/5'
                    : hoveredItem.userPrediction.pointsEarned >= 40
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  +{hoveredItem.userPrediction.pointsEarned} pts
                </span>
              )}
              {hoveredItem.status === 'LIVE' && (
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-md text-[10px] font-black uppercase animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Live
                </span>
              )}
              {hoveredItem.status === 'PENDING' && hoveredItem.userPrediction && (
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-md text-[10px] font-black uppercase">
                  Saved
                </span>
              )}
              {!hoveredItem.userPrediction && hoveredItem.status !== 'FINISHED' && (
                <span className="bg-zinc-800 text-zinc-400 border border-white/5 px-2 py-1 rounded-md text-[10px] font-black uppercase">
                  Open
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-zinc-500 text-xs text-center w-full italic select-none">
            Hover over any cell (1–104) to view prediction results & points breakdown
          </div>
        )}
      </div>
    </div>
  );
}
