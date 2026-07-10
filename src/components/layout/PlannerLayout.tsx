'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { id: 'daily', label: 'Daily', href: '/planner/daily', icon: '☀' },
  { id: 'weekly', label: 'Weekly', href: '/planner/weekly', icon: '📅' },
  { id: 'monthly', label: 'Monthly', href: '/planner/monthly', icon: '📆' },
  { id: 'yearly', label: 'Yearly', href: '/planner/yearly', icon: '🎯' },
  { id: 'habits', label: 'Habits', href: '/planner/habits', icon: '✓' },
  { id: 'health', label: 'Health', href: '/planner/health', icon: '♥' },
  { id: 'goals', label: 'Goals', href: '/planner/goals', icon: '★' },
  { id: 'notes', label: 'Notes', href: '/planner/notes', icon: '📝' },
  { id: 'documents', label: 'Documents', href: '/planner/documents', icon: '📁' },
  { id: 'settings', label: 'Settings', href: '/planner/settings', icon: '⚙' },
];

export function PlannerLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading your sacred space...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg planner-card"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-text)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h1 className="text-xl font-serif tracking-wide" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
            Sacred Living
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {formatDate(currentDate)}
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive ? 'font-medium' : ''
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                  color: isActive ? 'white' : 'var(--color-text)',
                }}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                {profile?.subscription_tier === 'pro_monthly' || profile?.subscription_tier === 'pro_yearly' ? '✨ Pro' : 'Free'}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full text-xs py-2 rounded-lg text-center transition-colors"
            style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="lg:p-8 p-4 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
