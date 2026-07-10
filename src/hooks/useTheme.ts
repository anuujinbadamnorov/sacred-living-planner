import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'day' | 'night'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('planner-theme')
      if (saved === 'day' || saved === 'night') return saved
    }
    const hour = new Date().getHours()
    return hour >= 6 && hour < 18 ? 'day' : 'night'
  })

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('planner-theme', theme)
  }, [theme])

  return { theme, toggle: () => setTheme(t => t === 'day' ? 'night' : 'day') }
}
