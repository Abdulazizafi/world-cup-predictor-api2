'use client';
// components/leaderboard/LeaderboardLegend.tsx — Achievement badge guide
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Crosshair, Zap, Target } from 'lucide-react';

export default function LeaderboardLegend() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass rounded-2xl p-4 border border-white/5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors cursor-pointer select-none focus:outline-none w-full text-left"
        >
          <HelpCircle size={16} className="text-zinc-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Badge Guide</span>
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors focus:outline-none font-bold"
        >
          {isOpen ? 'Close' : 'Open'}{' '}
          <span
            className="inline-block text-[10px] transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            &gt;
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/5 mt-3">
              {/* Sniper Badge */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Crosshair size={13} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Sniper</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                  Awarded to the player(s) with the highest number of exact scoreline predictions in the league.
                </p>
              </div>

              {/* 2X Max Badge */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-purple-500/5 border border-purple-500/15">
                <div className="flex items-center gap-1.5 text-purple-400">
                  <Zap size={13} className="fill-purple-500/20" />
                  <span className="text-[10px] font-black uppercase tracking-wider">2X Max</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                  Earned immediately once a user has deployed all 5 of their Double Points (2x) prediction tokens.
                </p>
              </div>

              {/* Perfect Pick Badge */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Target size={13} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Perfect</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                  Earned for predicting at least one exact match scoreline (only shown if not holding the Sniper title).
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
