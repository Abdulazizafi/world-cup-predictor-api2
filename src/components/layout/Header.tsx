'use client';
// components/layout/Header.tsx — Dashboard top header with WC2026 branding
import { motion } from 'framer-motion';
import { Star, Users, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAppStore } from '@/lib/store/useAppStore';
import { apiLogout, apiGetLeaderboard } from '@/lib/api/client';

export default function Header() {
  const { user, setUser } = useAppStore();
  const router = useRouter();
  const groupId = user?.groupId ?? '';

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard', groupId],
    queryFn: () => apiGetLeaderboard(groupId),
    enabled: !!groupId,
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const myEntry = leaderboard.find((e) => e.isCurrentUser);

  const handleLogout = async () => {
    try {
      await apiLogout();
      setUser(null);
      router.push('/login');
      toast.success('See you next match! 👋');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/6"
    >
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* WC2026 Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/wc2026-logo.svg"
            alt="FIFA World Cup 2026"
            width={28}
            height={40}
            className="drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
          />
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">FIFA</span>
            <span className="text-sm font-black text-white">
              World Cup <span className="text-amber-400">2026</span>
            </span>
          </div>
        </div>

        {/* Center: rank + points + group */}
        <div className="flex items-center gap-2 flex-1 justify-center flex-wrap">
          {myEntry && (
            <div className="glass rounded-xl px-3 py-1.5 flex items-center gap-2">
              <Star size={12} className="text-amber-400" />
              <span className="text-sm font-black text-amber-400">#{myEntry.rank}</span>
              <span className="w-px h-3 bg-white/10" />
              <span className="text-sm font-black text-white">{myEntry.totalPoints}</span>
              <span className="text-xs text-zinc-400">pts</span>
            </div>
          )}
          {user?.groupName && (
            <div className="glass rounded-xl px-3 py-1.5 items-center gap-2 hidden md:flex">
              <Users size={12} className="text-zinc-400 shrink-0" />
              <span className="text-xs text-zinc-300 truncate max-w-[160px]">{user.groupName}</span>
            </div>
          )}
        </div>

        {/* Right: avatar + username + logout */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-sm shadow-gold-glow select-none">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span className="text-sm font-medium text-zinc-300 hidden sm:block max-w-[100px] truncate">
            {user?.username}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>

      </div>
    </motion.header>
  );
}
