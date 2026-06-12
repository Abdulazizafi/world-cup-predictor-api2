'use client';
// components/layout/TabNav.tsx — Desktop horizontal tab navigation
import { motion } from 'framer-motion';
import { Calendar, Trophy, Star, Users } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import type { DashTab } from '@/types';
import { cn } from '@/lib/utils';

const tabs: { id: DashTab; label: string; icon: React.ElementType }[] = [
  { id: 'matches',     label: 'Matches',     icon: Calendar },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'predictions', label: 'My Predictions', icon: Star },
  { id: 'friends',     label: 'Friends',     icon: Users },
];

export default function TabNav() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <div className="hidden md:block border-b border-white/6 bg-zinc-950/60 backdrop-blur-md sticky top-16 z-40">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-1">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors duration-200',
                  isActive ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-200',
                )}
              >
                <Icon size={15} />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
