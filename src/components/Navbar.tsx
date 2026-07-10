'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, Calendar, CalendarRange, Clock,
  Sun, Flame, Heart, Leaf, Moon, Home, PawPrint, Briefcase,
  Sparkles, Gem, Activity, Star, StickyNote, Settings,
  Menu, X
} from 'lucide-react'

/* ── Types ─────────────────────────────────────────────────────────── */

interface NavbarProps {
  collapsed?: boolean
  onToggle?: () => void
}

/* ── Component ─────────────────────────────────────────────────────── */

export default function Navbar({ collapsed = false, onToggle }: NavbarProps) {
  const pathname = usePathname() || ''

  const isActive = (path: string) => {
    const current = pathname
    if (path === '/planner' && current === '/planner') return true
    if (
      path !== '/planner' &&
      current.startsWith(
        path
          .replace('/:month', '')
          .replace('/:week', '')
          .replace('/:date', '')
          .replace('/current', '')
          .replace('/today', '')
      )
    )
      return true
    return false
  }

  const navItem = (to: string, icon: ReactNode, label: string) => (
    <Link
      href={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 w-full ${
        isActive(to)
          ? 'bg-rose-500/10 text-rose-600 font-medium'
          : 'text-espresso-light hover:bg-black/5 hover:text-espresso'
      }`}
    >
      {icon}
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </Link>
  )

  const section = (title: string) =>
    !collapsed && (
      <p className="px-3 mt-4 mb-1 text-[11px] font-semibold tracking-widest uppercase text-espresso-muted">
        {title}
      </p>
    )

  return (
    <nav
      className="fixed left-0 top-0 h-full flex flex-col border-r transition-all duration-300 z-50"
      style={{
        width: collapsed ? 64 : 240,
        background: 'var(--cream-dark)',
        borderColor: 'var(--border-light)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center shrink-0">
          <Star className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-display text-lg text-espresso">Sacred Living</span>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="mx-3 mb-2 p-1.5 rounded-lg hover:bg-black/5 transition-colors self-end"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
      </button>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 flex flex-col gap-1">
        {section('My Sacred Space')}
        {navItem('/planner', <LayoutDashboard className="w-4 h-4 shrink-0" />, 'Dashboard')}
        {navItem('/planner/yearly', <CalendarDays className="w-4 h-4 shrink-0" />, 'Yearly')}
        {navItem('/planner/monthly', <Calendar className="w-4 h-4 shrink-0" />, 'Monthly')}
        {navItem('/planner/weekly', <CalendarRange className="w-4 h-4 shrink-0" />, 'Weekly')}
        {navItem('/planner/daily', <Clock className="w-4 h-4 shrink-0" />, 'Daily')}

        {section('Body & Ritual')}
        {navItem('/planner/sacred-routines', <Sun className="w-4 h-4 shrink-0" />, 'Sacred Routines')}
        {navItem('/planner/body-temple', <Flame className="w-4 h-4 shrink-0" />, 'Body Temple')}
        {navItem('/planner/medicine-ritual', <Heart className="w-4 h-4 shrink-0" />, 'Medicine & Ritual')}

        {section('Nourishment')}
        {navItem('/planner/nourishment', <Leaf className="w-4 h-4 shrink-0" />, 'Nourishment')}
        {navItem('/planner/moon-cycle', <Moon className="w-4 h-4 shrink-0" />, 'Moon & Cycle')}

        {section('Home & Life')}
        {navItem('/planner/home-sanctuary', <Home className="w-4 h-4 shrink-0" />, 'Home Sanctuary')}
        {navItem('/planner/rocket-realm', <PawPrint className="w-4 h-4 shrink-0" />, "Rocket's Realm")}
        {navItem('/planner/rocket-business', <Briefcase className="w-4 h-4 shrink-0" />, "Rocket's Business")}

        {section('Abundance')}
        {navItem('/planner/content-creation', <Sparkles className="w-4 h-4 shrink-0" />, 'Content & Creation')}
        {navItem('/planner/money', <Gem className="w-4 h-4 shrink-0" />, 'Abundance')}

        {section('Health')}
        {navItem('/planner/oura', <Activity className="w-4 h-4 shrink-0" />, 'Health Tracking')}

        {section('Reflection')}
        {navItem('/planner/reflection', <Star className="w-4 h-4 shrink-0" />, 'Reflection')}
        {navItem('/planner/notes', <StickyNote className="w-4 h-4 shrink-0" />, 'Notes')}
        {navItem('/planner/settings', <Settings className="w-4 h-4 shrink-0" />, 'Settings')}
      </div>
    </nav>
  )
}
