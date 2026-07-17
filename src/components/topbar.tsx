'use client'

import Link from 'next/link'
import { Flower2 } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

export function Topbar() {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <Link href="/planner" className="flex items-center gap-2">
          <Flower2 className="h-5 w-5 text-primary" />
          <span className="font-serif text-lg tracking-wide">Sacred Living</span>
        </Link>

        <div className="flex items-center gap-3">
          {user?.email && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
