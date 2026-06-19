'use client';
// components/layout/Header.tsx — Dashboard top header with WC2026 branding
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Users, LogOut, Trophy, Palette, Check } from 'lucide-react';
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
  const [theme, setTheme] = useState('theme-lusail-gold');
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard', groupId],
    queryFn: () => apiGetLeaderboard(groupId),
    enabled: !!groupId,
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const myEntry = leaderboard.find((e) => e.isCurrentUser);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('wcp_theme') || 'theme-lusail-gold';
    setTheme(savedTheme);
    
    // Clean up other themes and apply the loaded one
    const themes = ['theme-lusail-gold', 'theme-al-bayt-crimson', 'theme-al-janoub-teal', 'theme-lusail-night', 'theme-ahmad-sunset'];
    themes.forEach((t) => document.body.classList.remove(t));
    document.body.classList.add(savedTheme);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await apiLogout();
      setUser(null);
      router.push('/login');
      toast.success('See you next match!');
    } catch {
      toast.error('Logout failed');
    }
  };

  const themesList = [
    { id: 'theme-lusail-gold', name: 'Seleção Gold', colorClass: 'bg-amber-500 border-amber-400' },
    { id: 'theme-al-bayt-crimson', name: 'Wembley 66', colorClass: 'bg-red-650 border-red-500' },
    { id: 'theme-al-janoub-teal', name: 'Owairan 94', colorClass: 'bg-teal-500 border-teal-400' },
    { id: 'theme-lusail-night', name: 'Maradona 86', colorClass: 'bg-cyan-500 border-cyan-400' },
    { id: 'theme-ahmad-sunset', name: 'Total Football', colorClass: 'bg-orange-500 border-orange-400' },
  ];

  const handleThemeChange = (newTheme: string) => {
    const themes = ['theme-lusail-gold', 'theme-al-bayt-crimson', 'theme-al-janoub-teal', 'theme-lusail-night', 'theme-ahmad-sunset'];
    themes.forEach((t) => document.body.classList.remove(t));
    document.body.classList.add(newTheme);
    setTheme(newTheme);
    localStorage.setItem('wcp_theme', newTheme);
    setIsThemeOpen(false);
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
            style={{ filter: `drop-shadow(0 0 10px var(--theme-accent-glow, rgba(245,158,11,0.5)))` }}
            className="transition-all duration-300"
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
              <Trophy size={12} className="text-amber-400 fill-amber-400/10" />
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

        {/* Right: avatar + username + theme picker + logout */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-sm shadow-gold-glow select-none">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span className="text-sm font-medium text-zinc-300 hidden sm:block max-w-[100px] truncate">
            {user?.username}
          </span>

          {/* Theme Selector Dropdown */}
          <div className="relative flex items-center" ref={dropdownRef}>
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all relative cursor-pointer focus:outline-none"
              title="Stadium Themes"
            >
              <Palette size={15} />
            </button>

            <AnimatePresence>
              {isThemeOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 top-full w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-50 p-1.5 space-y-0.5"
                >
                  <p className="text-[10px] font-bold text-zinc-500 px-2.5 py-1.5 uppercase tracking-wider">
                    Stadium Themes
                  </p>
                  {themesList.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        theme === t.id
                          ? 'bg-white/5 text-white'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3.5 h-3.5 rounded-full border border-white/10 shrink-0 ${t.colorClass}`} />
                        <span>{t.name}</span>
                      </div>
                      {theme === t.id && <Check size={12} className="text-amber-400 shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all focus:outline-none"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>

      </div>
    </motion.header>
  );
}

