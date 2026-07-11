import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, ThemeColors } from '@/types';

interface ThemeState {
  currentThemeId: string;
  isNightMode: boolean;
  customColors: Partial<ThemeColors> | null;
  customBackgroundUrl: string | null;
  setTheme: (themeId: string) => void;
  setNightMode: (enabled: boolean) => void;
  setCustomColors: (colors: Partial<ThemeColors> | null) => void;
  setCustomBackground: (url: string | null) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentThemeId: 'sacred',
      isNightMode: false,
      customColors: null,
      customBackgroundUrl: null,
      setTheme: (themeId) => set({ currentThemeId: themeId }),
      setNightMode: (enabled) => set({ isNightMode: enabled }),
      setCustomColors: (colors) => set({ customColors: colors }),
      setCustomBackground: (url) => set({ customBackgroundUrl: url }),
    }),
    {
      name: 'sacred-living-theme',
    }
  )
);
