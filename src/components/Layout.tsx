'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { format } from 'date-fns'
import {
  Search,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'

function getPageTitle(pathname: string): string {
  if (pathname === '/' || pathname === '') return 'Sacred Living Planner'
  if (pathname === '/planner') return 'Dashboard'
  if (pathname.startsWith('/planner/yearly')) return 'Yearly Calendar'
  if (pathname.startsWith('/planner/monthly')) return 'Monthly Calendar'
  if (pathname.startsWith('/planner/weekly')) return 'Weekly Spread'
  if (pathname.startsWith('/planner/daily')) return 'Daily Planner'
  if (pathname.startsWith('/planner/goals')) return 'Goals & Tracking'
  if (pathname.startsWith('/planner/budget')) return 'Budget & Expenses'
  if (pathname.startsWith('/planner/reflection')) return 'Monthly Reflection'
  if (pathname.startsWith('/planner/sacred-routines')) return 'Sacred Routines'
  if (pathname.startsWith('/planner/body-temple')) return 'Body Temple'
  if (pathname.startsWith('/planner/medicine-ritual')) return 'Medicine & Ritual'
  if (pathname.startsWith('/planner/nourishment')) return 'Nourishment'
  if (pathname.startsWith('/planner/moon-cycle')) return 'Moon & Cycle'
  if (pathname.startsWith('/planner/home-sanctuary')) return 'Home Sanctuary'
  if (pathname.startsWith('/planner/rocket-realm')) return "Rocket's Realm"
  if (pathname.startsWith('/planner/content-creation')) return 'Content & Creation'
  if (pathname.startsWith('/planner/travel')) return 'Travel Planner'
  if (pathname.startsWith('/planner/special-dates')) return 'Special Dates'
  if (pathname.startsWith('/planner/notes')) return 'Notes'
  if (pathname.startsWith('/planner/settings')) return 'Settings'
  if (pathname.startsWith('/planner/life-integration')) return 'Life Integration'
  if (pathname.startsWith('/planner/husky')) return 'Husky Optimization'
  if (pathname.startsWith('/planner/money')) return 'Abundance'
  if (pathname.startsWith('/planner/oura')) return 'Health Tracking'
  return 'Sacred Living Planner'
}

interface PlannerLayoutProps {
  children: React.ReactNode
}

export default function PlannerLayout({ children }: PlannerLayoutProps) {
  const pathname = usePathname() || ''
  const [scrolled, setScrolled] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState<'day' | 'night'>('day')

  const pageTitle = getPageTitle(pathname)
  const today = new Date()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'day' ? 'night' : 'day'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const sidebarWidth = sidebarCollapsed ? 64 : 240

  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--cream)' }}>
      <Navbar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      <header
        className="fixed top-0 right-0 h-14 z-40 flex items-center justify-between px-6 transition-all duration-300"
        style={{
          left: sidebarWidth,
          background: 'var(--cream)',
          borderBottom: '1px solid var(--border-light)',
          boxShadow: scrolled ? '0 2px 8px rgba(44,36,32,0.06)' : 'none',
        }}
      >
        <div className="flex items-center gap-4">
          <h3 className="font-display text-base" style={{ color: 'var(--espresso)' }}>
            {pageTitle}
          </h3>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button
            className="p-1.5 rounded-md transition-colors"
            style={{ color: 'var(--espresso-muted)' }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-body text-sm min-w-[120px] text-center" style={{ color: 'var(--espresso-light)' }}>
            {format(today, 'MMMM yyyy')}
          </span>
          <button
            className="p-1.5 rounded-md transition-colors"
            style={{ color: 'var(--espresso-muted)' }}
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-md transition-colors"
            style={{ color: 'var(--espresso-muted)' }}
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md transition-colors"
            style={{ color: 'var(--espresso-muted)' }}
            aria-label={theme === 'day' ? 'Switch to night mode' : 'Switch to day mode'}
          >
            {theme === 'day' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--border-light)' }}
          >
            <span className="text-xs" style={{ color: 'var(--sage)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 6 9.5 6c2.5 0 2.5-2 5-2a2.5 2.5 0 0 1 0 5H14" />
                <path d="M8 9v10" /><path d="M16 9v10" /><path d="M9 18h6" />
              </svg>
            </span>
          </div>
        </div>
      </header>

      <main
        className="pt-14 min-h-[100dvh] transition-all duration-300"
        style={{ marginLeft: sidebarWidth, background: 'var(--cream)' }}
      >
        <div className="p-6 lg:p-8">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  )
}
