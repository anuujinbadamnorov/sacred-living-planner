import { useState, useEffect, useCallback } from 'react'

export type ThemeName =
  | 'dusty-rose'
  | 'evergreen'
  | 'graphite'
  | 'midnight'
  | 'pearl'
  | 'mocha'
  | 'brown-leather'
  | 'black-leather'
  | 'ivory-leather'

export interface ThemeConfig {
  name: ThemeName
  label: string
  primary: string
  primaryLight: string
  primaryDark: string
}

export const THEMES: ThemeConfig[] = [
  { name: 'dusty-rose', label: 'Dusty Rose', primary: '#e85d78', primaryLight: '#fdf2f4', primaryDark: '#b32d4a' },
  { name: 'evergreen', label: 'Evergreen', primary: '#5a7a6a', primaryLight: '#f0f4f2', primaryDark: '#3d5a4c' },
  { name: 'graphite', label: 'Graphite', primary: '#5a5a62', primaryLight: '#f2f2f3', primaryDark: '#3e3e44' },
  { name: 'midnight', label: 'Midnight', primary: '#3a3a52', primaryLight: '#ebebf0', primaryDark: '#262638' },
  { name: 'pearl', label: 'Pearl', primary: '#c4b8b0', primaryLight: '#f8f6f5', primaryDark: '#9e9189' },
  { name: 'mocha', label: 'Mocha', primary: '#8b6f5e', primaryLight: '#f5f1ee', primaryDark: '#6b5546' },
  { name: 'brown-leather', label: 'Brown Leather', primary: '#6b4f3a', primaryLight: '#f3efeb', primaryDark: '#4f3a2a' },
  { name: 'black-leather', label: 'Black Leather', primary: '#3a3a3a', primaryLight: '#f0f0f0', primaryDark: '#262626' },
  { name: 'ivory-leather', label: 'Ivory Leather', primary: '#c4a882', primaryLight: '#faf7f3', primaryDark: '#9e8262' },
]

const THEME_STORAGE_KEY = 'planner-theme'

export function usePlanner() {
  // Theme management
  const [theme, setThemeState] = useState<ThemeName>('dusty-rose')

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null
    if (stored) setThemeState(stored)
  }, [])

  const setTheme = useCallback((newTheme: ThemeName) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    // Apply theme colors to CSS variables
    const themeConfig = THEMES.find((t) => t.name === newTheme)
    if (themeConfig) {
      document.documentElement.style.setProperty('--rose-500', themeConfig.primary)
      document.documentElement.style.setProperty('--rose-50', themeConfig.primaryLight)
      document.documentElement.style.setProperty('--rose-700', themeConfig.primaryDark)
      // Apply derived colors
      // Simple darkening/lightening would go here for a full implementation
      // For now we rely on the CSS variable overrides
    }
  }, [])

  useEffect(() => {
    setTheme(theme)
  }, [])

  // Current date tracking
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  // localStorage helpers
  const getStorageItem = useCallback(<T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key)
      if (stored === null) return defaultValue
      return JSON.parse(stored) as T
    } catch {
      return defaultValue
    }
  }, [])

  const setStorageItem = useCallback(<T,>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  }, [])

  const removeStorageItem = useCallback((key: string): void => {
    localStorage.removeItem(key)
  }, [])

  // Typed data helpers
  const getNotes = useCallback(
    (date: string) => getStorageItem<string>(`planner-notes-${date}`, ''),
    [getStorageItem]
  )
  const setNotes = useCallback(
    (date: string, value: string) => setStorageItem(`planner-notes-${date}`, value),
    [setStorageItem]
  )

  const getTasks = useCallback(
    (date: string) => getStorageItem<{ id: string; text: string; completed: boolean }[]>(`planner-tasks-${date}`, []),
    [getStorageItem]
  )
  const setTasks = useCallback(
    (date: string, value: { id: string; text: string; completed: boolean }[]) =>
      setStorageItem(`planner-tasks-${date}`, value),
    [setStorageItem]
  )

  const getEvents = useCallback(
    (date: string) => getStorageItem<{ id: string; title: string; time: string }[]>(`planner-events-${date}`, []),
    [getStorageItem]
  )
  const setEvents = useCallback(
    (date: string, value: { id: string; title: string; time: string }[]) =>
      setStorageItem(`planner-events-${date}`, value),
    [setStorageItem]
  )

  const getBudget = useCallback(
    (month: string) =>
      getStorageItem<{ income: number; expenses: { id: string; category: string; amount: number }[] }>(
        `planner-budget-${month}`,
        { income: 0, expenses: [] }
      ),
    [getStorageItem]
  )
  const setBudget = useCallback(
    (month: string, value: { income: number; expenses: { id: string; category: string; amount: number }[] }) =>
      setStorageItem(`planner-budget-${month}`, value),
    [setStorageItem]
  )

  const getGoals = useCallback(
    () => getStorageItem<{ id: string; text: string; category: string; progress: number }[]>('planner-goals', []),
    [getStorageItem]
  )
  const setGoals = useCallback(
    (value: { id: string; text: string; category: string; progress: number }[]) =>
      setStorageItem('planner-goals', value),
    [setStorageItem]
  )

  const getReflection = useCallback(
    (month: string) =>
      getStorageItem<{
        wins: string
        improvements: string
        gratitude: string
        mood: number
      }>(`planner-reflection-${month}`, { wins: '', improvements: '', gratitude: '', mood: 0 }),
    [getStorageItem]
  )
  const setReflection = useCallback(
    (
      month: string,
      value: { wins: string; improvements: string; gratitude: string; mood: number }
    ) => setStorageItem(`planner-reflection-${month}`, value),
    [setStorageItem]
  )

  const getHabits = useCallback(
    () => getStorageItem<{ id: string; name: string; dates: Record<string, boolean> }[]>('planner-habits', []),
    [getStorageItem]
  )
  const setHabits = useCallback(
    (value: { id: string; name: string; dates: Record<string, boolean> }[]) => setStorageItem('planner-habits', value),
    [setStorageItem]
  )

  return {
    theme,
    setTheme,
    currentDate,
    setCurrentDate,
    getStorageItem,
    setStorageItem,
    removeStorageItem,
    getNotes,
    setNotes,
    getTasks,
    setTasks,
    getEvents,
    setEvents,
    getBudget,
    setBudget,
    getGoals,
    setGoals,
    getReflection,
    setReflection,
    getHabits,
    setHabits,
    THEMES,
  }
}

export type PlannerContextType = ReturnType<typeof usePlanner>
