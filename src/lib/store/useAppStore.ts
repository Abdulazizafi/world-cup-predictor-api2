// lib/store/useAppStore.ts — Zustand global state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DashTab, User } from '@/types';

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Active dashboard tab
  activeTab: DashTab;
  setActiveTab: (tab: DashTab) => void;

  // Hydrated flag (to avoid SSR mismatch)
  hydrated: boolean;
  setHydrated: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      activeTab: 'matches',
      setActiveTab: (activeTab) => set({ activeTab }),

      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'wc-predictor-store',
      partialize: (state) => ({
        user: state.user,
        activeTab: state.activeTab,
      }),
    }
  )
);
