'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Calendar,
  Heart,
  Dumbbell,
  Utensils,
  Moon,
  Dog,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  Leaf,
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

const navItems = [
  { href: '/planner', label: 'Dashboard', icon: Home },
  { href: '/planner/calendar/daily', label: 'Daily', icon: Calendar },
  { href: '/planner/calendar/weekly', label: 'Weekly', icon: Calendar },
  { href: '/planner/calendar/monthly', label: 'Monthly', icon: Calendar },
  { href: '/planner/calendar/yearly', label: 'Yearly', icon: Calendar },
  { href: '/planner/health', label: 'Health', icon: Heart },
  { href: '/planner/body-temple', label: 'Body Temple', icon: Dumbbell },
  { href: '/planner/nourishment', label: 'Nourishment', icon: Utensils },
  { href: '/planner/moon-cycle', label: 'Moon Cycle', icon: Moon },
  { href: '/planner/home-sanctuary', label: 'Home Sanctuary', icon: Leaf },
  { href: '/planner/rocket-realm', label: 'Rocket Realm', icon: Dog },
  { href: '/planner/rocket-business', label: 'Rocket Business', icon: DollarSign },
  { href: '/planner/notes', label: 'Notes', icon: FileText },
  { href: '/planner/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card pt-20">
      <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-4">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
