'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'day' | 'night'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: 'day',
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = 'day',
  storageKey = 'sacred-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(storageKey)
      if (stored === 'day' || stored === 'night') return stored
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('dark')
    root.removeAttribute('data-theme')
    
    if (theme === 'night') {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'night')
    } else {
      root.setAttribute('data-theme', 'day')
    }
    
    window.localStorage.setItem(storageKey, theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (t: Theme) => setTheme(t),
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
