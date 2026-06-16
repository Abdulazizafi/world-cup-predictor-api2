'use client';
// components/layout/BottomNav.tsx — Mobile fixed bottom navigation
import { motion } from 'framer-motion';
import { Calendar, Trophy, Star, Users } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import type { DashTab } from '@/types';
import { cn } from '@/lib/utils';

const tabs: { id: DashTab; label: string; icon: React.ElementType }[] = [
  { id: 'matches',     label: 'Matches',     icon: Calendar },
  { id: 'leaderboard', label: 'Standings',   icon: Trophy },
  { id: 'predictions', label: 'My Picks',    icon: Star },
  { id: 'friends',     label: 'Activity',     icon: Users },
];

export default function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Blur backdrop */}
      <div className="bg-zinc-950/90 backdrop-blur-xl border-t border-white/6">
        <div className="flex items-center justify-around px-2 pb-safe">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center gap-1 py-3 px-4 min-w-[56px] min-h-[56px] relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-pill"
                    className="absolute inset-x-1 top-1 h-[calc(100%-8px)] bg-amber-500/10 rounded-xl border border-amber-500/20"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                  />
                )}
                <Icon
                  size={20}
                  className={cn(
                    'relative z-10 transition-colors duration-200',
                    isActive ? 'text-amber-400' : 'text-zinc-500',
                  )}
                />
                <span className={cn(
                  'relative z-10 text-[10px] font-semibold transition-colors duration-200',
                  isActive ? 'text-amber-400' : 'text-zinc-500',
                )}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
