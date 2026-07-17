'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, Calendar, CalendarRange, Clock,
  Sun, Flame, Heart, Leaf, Moon, Home, PawPrint, Briefcase,
  Sparkles, Gem, Activity, Star, StickyNote, Settings, ImageIcon,
  Menu, X, Flower2
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
          padding: '9px 14px',
          borderRadius: '10px',
          fontSize: '13px',
          width: '100%',
          textDecoration: 'none',
          backgroundColor: active ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
          color: active ? 'var(--gold)' : 'var(--espresso-muted)',
          fontWeight: active ? 500 : 400,
          transition: 'all 0.25s ease',
          minHeight: '38px',
          flexShrink: 0,
          letterSpacing: '0.01em',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.06)'
            e.currentTarget.style.color = 'var(--espresso)'
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--espresso-muted)'
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
        padding: '18px 14px 6px 14px',
        fontSize: '9px',
        fontWeight: 500,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--espresso-muted)',
        margin: 0,
        flexShrink: 0,
        fontFamily: "'Inter', system-ui, sans-serif",
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
        borderRight: '1px solid var(--border-light)',
        zIndex: 50,
        width: collapsed ? 64 : 240,
        backgroundColor: 'var(--cream)',
        transition: 'width 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Elegant Branding */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '22px 16px 18px',
        flexShrink: 0,
        borderBottom: '1px solid var(--border-light)',
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: 'var(--gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(212, 175, 55, 0.25)',
        }}>
          <Flower2 className="w-4 h-4" style={{ color: 'var(--cream)' }} strokeWidth={1.5} />
        </div>
        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--espresso)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.03em',
              lineHeight: 1.2,
            }}>
              Sacred Living
            </span>
            <span style={{
              fontSize: '9px',
              color: 'var(--espresso-muted)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 400,
              marginTop: '2px',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              A Year of Intention
            </span>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        style={{
          margin: '6px 10px',
          padding: '5px',
          borderRadius: 8,
          alignSelf: 'flex-end',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--espresso-muted)',
          flexShrink: 0,
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--espresso-muted)' }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <Menu className="w-3.5 h-3.5" strokeWidth={1.5} /> : <X className="w-3.5 h-3.5" strokeWidth={1.5} />}
      </button>

      {/* Scrollable nav */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 8px 16px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
      }}>
        {section('My Sacred Space')}
        {navItem('/planner', <LayoutDashboard className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Dashboard')}
        {navItem('/planner/yearly', <CalendarDays className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Yearly')}
        {navItem('/planner/monthly', <Calendar className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Monthly')}
        {navItem('/planner/weekly', <CalendarRange className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Weekly')}
        {navItem('/planner/daily', <Clock className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Daily')}

        {section('Body & Ritual')}
        {navItem('/planner/sacred-routines', <Sun className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Sacred Routines')}
        {navItem('/planner/body-temple', <Flame className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Body Temple')}
        {navItem('/planner/medicine-ritual', <Heart className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Medicine & Ritual')}

        {section('Nourishment')}
        {navItem('/planner/nourishment', <Leaf className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Nourishment')}
        {navItem('/planner/moon-cycle', <Moon className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Moon & Cycle')}

        {section('Home & Life')}
        {navItem('/planner/home-sanctuary', <Home className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Home Sanctuary')}
        {navItem('/planner/rocket-realm', <PawPrint className="w-4 h-4 shrink-0" strokeWidth={1.5} />, "Rocket's Realm")}
        {navItem('/planner/rocket-business', <Briefcase className="w-4 h-4 shrink-0" strokeWidth={1.5} />, "Rocket's Business")}

        {section('Abundance')}
        {navItem('/planner/content-creation', <Sparkles className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Content & Creation')}
        {navItem('/planner/money', <Gem className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Abundance')}

        {section('Health')}
        {navItem('/planner/oura', <Activity className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Health Tracking')}

        {section('Reflection')}
        {navItem('/planner/reflection', <Star className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Reflection')}
        {navItem('/planner/inspiration', <ImageIcon className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Inspiration')}
        {navItem('/planner/notes', <StickyNote className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Notes')}
        {navItem('/planner/settings', <Settings className="w-4 h-4 shrink-0" strokeWidth={1.5} />, 'Settings')}
      </div>
    </nav>
  )
}
