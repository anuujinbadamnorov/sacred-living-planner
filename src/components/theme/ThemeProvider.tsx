'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useThemeStore } from '@/stores/theme';
import { createClient } from '@/lib/supabase';
import type { Theme, ThemeColors } from '@/types';

const defaultColors: ThemeColors = {
  bg: '#FAF7F2',
  surface: '#FFFFFF',
  text: '#2D2A26',
  textMuted: '#8B8680',
  accent: '#D4A574',
  accentHover: '#C49464',
  border: '#E8E4DE',
  success: '#6B8E6B',
  warning: '#D4A574',
  error: '#C4706B',
  calendarWeekend: '#F5F0EB',
};

interface ThemeContextType {
  theme: Theme | null;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  isLoading: true,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentThemeId, customColors, customBackgroundUrl } = useThemeStore();

  useEffect(() => {
    const loadTheme = async () => {
      const supabase = createClient();
      
      if (currentThemeId === 'custom' && customColors) {
        setTheme({
          id: 'custom',
          name: 'Custom',
          description: 'Your custom theme',
          is_premium: false,
          is_custom: true,
          user_id: null,
          colors: { ...defaultColors, ...customColors },
          font_heading: 'font-sans',
          font_body: 'font-sans',
          background_image_url: customBackgroundUrl,
          background_opacity: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('id', currentThemeId)
        .single();

      if (data) {
        setTheme(data as Theme);
      } else {
        // Fallback to sacred theme
        setTheme({
          id: 'sacred',
          name: 'Sacred Living',
          description: 'Warm cream with earthy gold accents',
          is_premium: false,
          is_custom: false,
          user_id: null,
          colors: defaultColors,
          font_heading: 'font-serif',
          font_body: 'font-sans',
          background_image_url: null,
          background_opacity: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      setIsLoading(false);
    };

    loadTheme();
  }, [currentThemeId, customColors, customBackgroundUrl]);

  // Apply CSS variables when theme changes
  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;
    const colors = theme.colors as ThemeColors;
    
    root.style.setProperty('--color-bg', colors.bg);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-muted', colors.textMuted);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-accent-hover', colors.accentHover);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-calendar-weekend', colors.calendarWeekend);
    
    root.style.setProperty('--font-heading', theme.font_heading);
    root.style.setProperty('--font-body', theme.font_body);

    // Apply background image if exists
    if (theme.background_image_url) {
      root.style.setProperty('--bg-image', `url(${theme.background_image_url})`);
      root.style.setProperty('--bg-opacity', String(theme.background_opacity));
    } else {
      root.style.removeProperty('--bg-image');
      root.style.removeProperty('--bg-opacity');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}
