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

interface NavbarProps {
  collapsed?: boolean
  onToggle?: () => void
}

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

  const navItem = (to: string, icon: ReactNode, label: string) => {
    const active = isActive(to)
    return (
      <Link
        href={to}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 12px',
          borderRadius: '12px',
          fontSize: '14px',
          width: '100%',
          textDecoration: 'none',
          backgroundColor: active ? 'rgba(244, 63, 94, 0.1)' : 'transparent',
          color: active ? '#e11d48' : '#6B6056',
          fontWeight: active ? 500 : 400,
          transition: 'all 0.2s ease',
          minHeight: '40px',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'
            e.currentTarget.style.color = '#2C2420'
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#6B6056'
          }
        }}
      >
        {icon}
        {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
      </Link>
    )
  }

  const section = (title: string) =>
    !collapsed && (
      <p style={{
        padding: '16px 12px 4px 12px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: '#9B9086',
        margin: 0,
        flexShrink: 0,
      }}>
        {title}
      </p>
    )

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #E5E0D8',
        zIndex: 50,
        width: collapsed ? 64 : 240,
        backgroundColor: '#EDE8DF',
        transition: 'width 0.3s ease',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 16px', flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          backgroundColor: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Star className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: '#2C2420', whiteSpace: 'nowrap' }}>
            Sacred Living
          </span>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        style={{
          margin: '0 12px 8px 12px',
          padding: '6px',
          borderRadius: 8,
          alignSelf: 'flex-end',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#6B6056',
          flexShrink: 0,
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
      </button>

      {/* Scrollable nav */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 8px 16px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
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
