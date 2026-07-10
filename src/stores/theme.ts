import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, ThemeColors } from '@/types';

interface ThemeState {
  currentThemeId: string;
  customColors: Partial<ThemeColors> | null;
  customBackgroundUrl: string | null;
  setTheme: (themeId: string) => void;
  setCustomColors: (colors: Partial<ThemeColors> | null) => void;
  setCustomBackground: (url: string | null) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentThemeId: 'sacred',
      customColors: null,
      customBackgroundUrl: null,
      setTheme: (themeId) => set({ currentThemeId: themeId }),
      setCustomColors: (colors) => set({ customColors: colors }),
      setCustomBackground: (url) => set({ customBackgroundUrl: url }),
    }),
    {
      name: 'sacred-living-theme',
    }
  )
);
