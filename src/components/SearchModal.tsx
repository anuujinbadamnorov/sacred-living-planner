'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  FileText,
  CheckCircle,
  Calendar,
  BookOpen,
  Star,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

interface SearchResult {
  id: string
  type: 'daily' | 'note' | 'habit' | 'weekly' | 'monthly'
  title: string
  subtitle: string
  href: string
  date?: string
}

const TYPE_ICONS = {
  daily: Calendar,
  note: FileText,
  habit: CheckCircle,
  weekly: BookOpen,
  monthly: Star,
}

const TYPE_LABELS = {
  daily: 'Daily Entry',
  note: 'Note',
  habit: 'Habit',
  weekly: 'Weekly Review',
  monthly: 'Monthly Reflection',
}

export default function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault()
        router.push(results[selectedIndex].href)
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKey)
      return () => window.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, results, selectedIndex, router, onClose])

  // Debounced search
  useEffect(() => {
    if (!isOpen || !user) return
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()
      const q = query.trim().toLowerCase()
      const allResults: SearchResult[] = []

      // Search daily entries
      const { data: daily } = await supabase
        .from('daily_entries')
        .select('id, entry_date, focus, morning_notes, evening_reflection, gratitude')
        .eq('user_id', user.id)
        .or(`focus.ilike.%${q}%,morning_notes.ilike.%${q}%,evening_reflection.ilike.%${q}%,gratitude.ilike.%${q}%`)
        .limit(5)

      daily?.forEach((d: { id: string; entry_date: string; focus: string | null; morning_notes: string | null; evening_reflection: string | null; gratitude: string | null }) => {
        const snippet = d.focus || d.morning_notes || d.evening_reflection || d.gratitude || ''
        allResults.push({
          id: d.id,
          type: 'daily',
          title: formatDate(d.entry_date),
          subtitle: truncate(snippet, 60),
          href: `/planner/daily/${d.entry_date}`,
          date: d.entry_date,
        })
      })

      // Search notes
      const { data: notes } = await supabase
        .from('notes')
        .select('id, title, content, folder')
        .eq('user_id', user.id)
        .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
        .limit(5)

      notes?.forEach((n: { id: string; title: string | null; content: string | null; folder: string }) => {
        allResults.push({
          id: n.id,
          type: 'note',
          title: n.title || 'Untitled Note',
          subtitle: truncate(n.content || '', 60),
          href: '/planner/notes',
        })
      })

      // Search habits
      const { data: habits } = await supabase
        .from('habits')
        .select('id, name, description')
        .eq('user_id', user.id)
        .ilike('name', `%${q}%`)
        .limit(5)

      habits?.forEach((h: { id: string; name: string; description: string | null }) => {
        allResults.push({
          id: h.id,
          type: 'habit',
          title: h.name,
          subtitle: truncate(h.description || '', 60),
          href: '/planner/habits',
        })
      })

      // Search weekly reviews
      const { data: weekly } = await supabase
        .from('weekly_reviews')
        .select('id, week_start, theme, wins')
        .eq('user_id', user.id)
        .or(`theme.ilike.%${q}%,wins.ilike.%${q}%`)
        .limit(3)

      weekly?.forEach((w: { id: string; week_start: string; theme: string | null; wins: string | null }) => {
        allResults.push({
          id: w.id,
          type: 'weekly',
          title: `Week of ${formatDate(w.week_start)}`,
          subtitle: truncate(w.theme || w.wins || '', 60),
          href: `/planner/weekly/${w.week_start}`,
        })
      })

      // Search monthly reflections
      const { data: monthly } = await supabase
        .from('monthly_reflections')
        .select('id, month_start, highlights')
        .eq('user_id', user.id)
        .ilike('highlights', `%${q}%`)
        .limit(3)

      monthly?.forEach((m: { id: string; month_start: string; highlights: string | null }) => {
        allResults.push({
          id: m.id,
          type: 'monthly',
          title: formatMonth(m.month_start),
          subtitle: truncate(m.highlights || '', 60),
          href: `/planner/reflection/${m.month_start}`,
        })
      })

      setResults(allResults)
      setSelectedIndex(0)
      setLoading(false)
    }, 250)

    return () => clearTimeout(timer)
  }, [query, isOpen, user])

  const handleClick = (href: string) => {
    router.push(href)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
          style={{ backgroundColor: 'rgba(44,36,32,0.35)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-xl mx-4 rounded-xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--cream)', border: '1px solid var(--border-light)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ borderColor: 'var(--border-light)' }}
            >
              <Search className="w-5 h-5 shrink-0" style={{ color: 'var(--espresso-muted)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={user ? 'Search your planner...' : 'Sign in to search'}
                disabled={!user}
                className="flex-1 bg-transparent outline-none text-base"
                style={{ color: 'var(--espresso)' }}
              />
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--espresso-muted)' }} />
              ) : (
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-black/5 transition-colors"
                >
                  <X className="w-4 h-4" style={{ color: 'var(--espresso-muted)' }} />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!user ? (
                <div className="py-12 text-center">
                  <Search className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--border-medium)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--espresso-light)' }}>
                    Sign in to search across your data
                  </p>
                </div>
              ) : !query.trim() ? (
                <div className="py-10 px-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-center mb-3" style={{ color: 'var(--espresso-muted)' }}>
                    Try searching for
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['gratitude', 'habits', 'focus', 'notes', 'wins'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-colors hover:bg-black/5"
                        style={{ color: 'var(--espresso-light)', border: '1px solid var(--border-light)' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 && !loading ? (
                <div className="py-12 text-center">
                  <Search className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--border-medium)' }} />
                  <p className="text-sm" style={{ color: 'var(--espresso-muted)' }}>
                    No results for &ldquo;{query}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {results.map((r, i) => {
                    const Icon = TYPE_ICONS[r.type]
                    const isSelected = i === selectedIndex
                    return (
                      <button
                        key={`${r.type}-${r.id}`}
                        onClick={() => handleClick(r.href)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className="w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors"
                        style={{
                          backgroundColor: isSelected ? 'rgba(196,112,75,0.08)' : 'transparent',
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: 'rgba(196,112,75,0.12)' }}
                        >
                          <Icon className="w-4 h-4" style={{ color: 'var(--terracotta)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate" style={{ color: 'var(--espresso)' }}>
                              {r.title}
                            </span>
                            <span
                              className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium shrink-0"
                              style={{
                                backgroundColor: 'var(--cream-dark)',
                                color: 'var(--espresso-muted)',
                              }}
                            >
                              {TYPE_LABELS[r.type]}
                            </span>
                          </div>
                          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--espresso-muted)' }}>
                            {r.subtitle}
                          </p>
                        </div>
                        <ArrowRight
                          className="w-4 h-4 shrink-0 self-center opacity-0 transition-opacity"
                          style={{
                            color: 'var(--terracotta)',
                            opacity: isSelected ? 1 : 0,
                          }}
                        />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-4 py-2 text-[11px] border-t"
              style={{ borderColor: 'var(--border-light)', color: 'var(--espresso-muted)' }}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 rounded bg-white border text-[10px] font-mono">↑↓</kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 rounded bg-white border text-[10px] font-mono">↵</kbd>
                  <span>open</span>
                </span>
              </div>
              <span>{results.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* helpers */
function truncate(str: string, len: number) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

function formatMonth(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
