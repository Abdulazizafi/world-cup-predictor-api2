'use client';
// components/leaderboard/LeagueInsights.tsx — League analytics summary
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Users, Zap, AlertTriangle } from 'lucide-react';
import { apiGetGroupInsights } from '@/lib/api/client';

export default function LeagueInsights({ groupId }: { groupId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: insights, isLoading } = useQuery({
    queryKey: ['insights', groupId],
    queryFn: () => apiGetGroupInsights(groupId),
    enabled: !!groupId,
    refetchInterval: 60_000,
  });

  if (isLoading || !insights) return null;

  return (
    <div className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-sm tracking-wide flex items-center gap-2">
          <AreaChart size={16} className="text-amber-400" />
          <span>League Insights</span>
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors flex items-center gap-1 focus:outline-none font-bold"
        >
          {isOpen ? 'Hide Stats' : 'View Stats'}{' '}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5 border-t border-white/5 mt-4">
              {/* Average League Score */}
              <div className="flex items-center gap-3 bg-zinc-900/30 border border-white/5 rounded-xl p-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Users className="text-blue-400" size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">League Average</p>
                  <p className="text-base font-black text-white mt-0.5">
                    {insights.averagePoints} <span className="text-xs text-zinc-500 font-bold">pts</span>
                  </p>
                  <p className="text-[9px] text-zinc-500 font-medium">Per User</p>
                </div>
              </div>

              {/* Highest Match Score */}
              <div className="flex items-center gap-3 bg-zinc-900/30 border border-white/5 rounded-xl p-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Zap className="text-amber-400" size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Highest Match score</p>
                  <p className="text-base font-black text-white mt-0.5">
                    {insights.maxPointsEarned} <span className="text-xs text-zinc-500 font-bold">pts</span>
                  </p>
                  <p className="text-[9px] text-zinc-500 font-medium">Single Prediction</p>
                </div>
              </div>

              {/* League Upset of the Week */}
              <div className="flex items-center gap-3 bg-zinc-900/30 border border-white/5 rounded-xl p-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-rose-400" size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">League Upset</p>
                  {insights.upsetMatch ? (
                    <>
                      <p className="text-xs font-bold text-white mt-0.5 truncate max-w-[180px]">
                        {insights.upsetMatch.teamA} vs {insights.upsetMatch.teamB}
                      </p>
                      <p className="text-[9px] text-zinc-500 font-medium mt-0.5">
                        Avg: <span className="text-rose-455 font-bold">{insights.upsetMatch.averagePoints} pts</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-zinc-500 mt-0.5">None yet</p>
                      <p className="text-[9px] text-zinc-500 font-medium mt-0.5">Waiting for finished matches</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
