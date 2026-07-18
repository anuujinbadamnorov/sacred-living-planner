import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cake,
  Calendar,
  Gift,
  Heart,
  Plus,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react'
import { format, differenceInDays, parseISO, isValid, startOfDay } from 'date-fns'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type CustomDateType = 'birthday' | 'anniversary' | 'other'
type DateKind = CustomDateType | 'holiday'

interface CustomDate {
  id: string
  name: string
  date: string // ISO date string (yyyy-MM-dd)
  type: CustomDateType
}

interface Holiday {
  id: string
  name: string
  date: string // 2026 ISO date string
}

const TYPE_META: Record<DateKind, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  birthday: { label: 'Birthday', color: 'var(--gold)', bg: 'rgba(212,175,55,0.14)', icon: Cake },
  anniversary: { label: 'Anniversary', color: 'var(--sage)', bg: 'rgba(139,168,140,0.16)', icon: Heart },
  other: { label: 'Other', color: 'var(--cognac)', bg: 'rgba(166,124,82,0.14)', icon: Star },
  holiday: { label: 'Holiday', color: 'var(--lake)', bg: 'rgba(123,158,168,0.16)', icon: Sparkles },
}

/* ------------------------------------------------------------------ */
/*  2026 US Holidays                                                   */
/* ------------------------------------------------------------------ */

const HOLIDAYS_2026: Holiday[] = [
  { id: 'h1', name: "New Year's Day", date: '2026-01-01' },
  { id: 'h2', name: 'Martin Luther King Jr. Day', date: '2026-01-19' },
  { id: 'h3', name: "Presidents' Day", date: '2026-02-16' },
  { id: 'h4', name: 'Memorial Day', date: '2026-05-25' },
  { id: 'h5', name: 'Juneteenth', date: '2026-06-19' },
  { id: 'h6', name: 'Independence Day', date: '2026-07-04' },
  { id: 'h7', name: 'Labor Day', date: '2026-09-07' },
  { id: 'h8', name: 'Halloween', date: '2026-10-31' },
  { id: 'h9', name: 'Veterans Day', date: '2026-11-11' },
  { id: 'h10', name: 'Thanksgiving Day', date: '2026-11-26' },
  { id: 'h11', name: 'Christmas Eve', date: '2026-12-24' },
  { id: 'h12', name: 'Christmas Day', date: '2026-12-25' },
  { id: 'h13', name: "New Year's Eve", date: '2026-12-31' },
]

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                    */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'planner-custom-dates'

function loadCustomDates(): CustomDate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* */ }
  return []
}

function saveCustomDates(dates: CustomDate[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dates))
  } catch { /* */ }
}

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */

function getNextOccurrence(dateStr: string, today: Date): Date | null {
  const d = parseISO(dateStr)
  if (!isValid(d)) return null
  let next = new Date(today.getFullYear(), d.getMonth(), d.getDate())
  if (next.getTime() < today.getTime()) {
    next = new Date(today.getFullYear() + 1, d.getMonth(), d.getDate())
  }
  return next
}

function daysLabel(days: number): string {
  if (days === 0) return 'Today!'
  if (days === 1) return 'Tomorrow'
  if (days > 1) return `In ${days} days`
  if (days === -1) return 'Yesterday'
  return `${Math.abs(days)} days ago`
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function SpecialDates() {
  const [mounted, setMounted] = useState(false)
  const [today, setToday] = useState<Date | null>(null)
  const [customDates, setCustomDates] = useState<CustomDate[]>([])
  const [showAdd, setShowAdd] = useState(false)

  // Add form
  const [newName, setNewName] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newType, setNewType] = useState<CustomDateType>('birthday')

  useEffect(() => {
    setCustomDates(loadCustomDates())
    setToday(startOfDay(new Date()))
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) saveCustomDates(customDates)
  }, [customDates, mounted])

  /* Countdown cards: next 5 dates across holidays + custom dates */
  const countdowns = useMemo(() => {
    if (!today) return []
    const items: { id: string; name: string; type: DateKind; date: Date; days: number }[] = []
    for (const h of HOLIDAYS_2026) {
      const next = getNextOccurrence(h.date, today)
      if (next) items.push({ id: h.id, name: h.name, type: 'holiday', date: next, days: differenceInDays(next, today) })
    }
    for (const c of customDates) {
      const next = getNextOccurrence(c.date, today)
      if (next) items.push({ id: c.id, name: c.name, type: c.type, date: next, days: differenceInDays(next, today) })
    }
    return items.sort((a, b) => a.days - b.days).slice(0, 5)
  }, [today, customDates])

  const addDate = () => {
    if (!newName.trim() || !newDate) return
    setCustomDates((prev) => [
      ...prev,
      { id: `cd${Date.now()}`, name: newName.trim(), date: newDate, type: newType },
    ])
    setNewName('')
    setNewDate('')
    setNewType('birthday')
    setShowAdd(false)
  }

  const deleteDate = (id: string) => {
    setCustomDates((prev) => prev.filter((d) => d.id !== id))
  }

  if (!mounted || !today) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* ═══ Hero ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-center space-y-3"
      >
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
          style={{ background: 'var(--cream-dark)', color: 'var(--espresso-light)', border: '1px solid var(--border-light)' }}
        >
          <Gift className="w-3 h-3" style={{ color: 'var(--gold)' }} />
          Special Dates
        </span>
        <h1
          className="font-playfair text-[clamp(2.25rem,5vw,3.5rem)] font-medium leading-tight"
          style={{ color: 'var(--espresso)' }}
        >
          Moments That Matter
        </h1>
        <p className="font-caveat text-xl md:text-2xl" style={{ color: 'var(--espresso-light)' }}>
          &ldquo;The best thing to hold onto in life is each other.&rdquo;
        </p>
        <p className="text-[0.65rem] uppercase tracking-[0.2em] font-medium" style={{ color: 'var(--espresso-muted)' }}>
          — Audrey Hepburn
        </p>
      </motion.div>

      {/* ═══ Coming Up ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{ color: 'var(--gold)' }} />
          <h2 className="font-playfair text-[clamp(1.25rem,2vw,1.75rem)] font-medium" style={{ color: 'var(--espresso)' }}>
            Coming Up
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {countdowns.map((item, i) => {
            const meta = TYPE_META[item.type]
            const Icon = meta.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.06, ease: EASE }}
                className="card-planner p-4 text-center"
              >
                <div
                  className="w-9 h-9 rounded-lg mx-auto flex items-center justify-center"
                  style={{ background: meta.bg }}
                >
                  <Icon className="w-4 h-4" style={{ color: meta.color }} />
                </div>
                <p className="font-playfair text-3xl font-medium mt-3 leading-none" style={{ color: 'var(--espresso)' }}>
                  {item.days === 0 ? 'Today' : item.days}
                </p>
                <p className="text-[0.6rem] uppercase tracking-[0.15em] mt-1" style={{ color: 'var(--espresso-muted)' }}>
                  {item.days === 0 ? 'Celebrate!' : item.days === 1 ? 'day away' : 'days away'}
                </p>
                <p className="text-sm font-medium mt-3 truncate" style={{ color: 'var(--espresso)' }}>{item.name}</p>
                <p className="text-xs" style={{ color: 'var(--espresso-muted)' }}>{format(item.date, 'MMM d, yyyy')}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ═══ 2026 US Holidays ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
        className="card-planner"
      >
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--gold)' }} />
          <h2 className="font-playfair text-[clamp(1.25rem,2vw,1.75rem)] font-medium" style={{ color: 'var(--espresso)' }}>
            2026 US Holidays
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {MONTH_NAMES.map((monthName, m) => {
            const monthHolidays = HOLIDAYS_2026.filter((h) => parseISO(h.date).getMonth() === m)
            return (
              <div
                key={monthName}
                className="rounded-lg p-3"
                style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
              >
                <p className="font-playfair text-sm font-medium mb-2" style={{ color: 'var(--espresso)' }}>
                  {monthName}
                </p>
                {monthHolidays.length === 0 ? (
                  <p className="text-[0.6875rem]" style={{ color: 'var(--espresso-muted)' }}>No holidays</p>
                ) : (
                  monthHolidays.map((h) => {
                    const d = parseISO(h.date)
                    const days = differenceInDays(d, today)
                    return (
                      <div key={h.id} className="flex items-center gap-2 py-1">
                        <span
                          className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0"
                          style={{ background: 'rgba(123,158,168,0.16)', color: 'var(--lake)' }}
                        >
                          {format(d, 'd')}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[0.6875rem] font-medium leading-tight" style={{ color: 'var(--espresso)' }}>
                            {h.name}
                          </p>
                          <p className="text-[0.625rem]" style={{ color: 'var(--espresso-muted)' }}>
                            {format(d, 'MMM d')} · {daysLabel(days)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ═══ My Special Dates ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5" style={{ color: 'var(--gold)' }} />
            <h2 className="font-playfair text-[clamp(1.25rem,2vw,1.75rem)] font-medium" style={{ color: 'var(--espresso)' }}>
              My Special Dates
            </h2>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="planner-button text-sm">
            <Plus className="w-4 h-4" />
            Add Date
          </button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="card-planner space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="label-style">Name</label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g., Mom's Birthday"
                      className="planner-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="label-style">Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="planner-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-style">Type</label>
                  <div className="flex gap-2 flex-wrap">
                    {(['birthday', 'anniversary', 'other'] as const).map((t) => {
                      const meta = TYPE_META[t]
                      const selected = newType === t
                      return (
                        <button
                          key={t}
                          onClick={() => setNewType(t)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                          style={{
                            background: selected ? meta.bg : 'var(--cream-dark)',
                            color: selected ? meta.color : 'var(--espresso-muted)',
                            border: `1px solid ${selected ? meta.color : 'var(--border-light)'}`,
                          }}
                        >
                          {meta.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAdd(false)}
                    className="px-4 py-2 rounded-lg text-sm transition-all hover:opacity-80"
                    style={{ background: 'var(--cream-dark)', color: 'var(--espresso-light)', border: '1px solid var(--border-light)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addDate}
                    disabled={!newName.trim() || !newDate}
                    className="planner-button text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Date
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {customDates.length === 0 ? (
          <div className="card-planner text-center py-10">
            <Gift className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--espresso-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--espresso-muted)' }}>
              No custom dates yet — add a birthday or anniversary and it will join your countdowns.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {customDates.map((item, i) => {
              const meta = TYPE_META[item.type]
              const Icon = meta.icon
              const parsed = parseISO(item.date)
              const next = getNextOccurrence(item.date, today)
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
                  className="card-planner py-4 px-6 flex items-center gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: meta.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--espresso)' }}>{item.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className="text-[0.625rem] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--espresso-muted)' }}>
                        {isValid(parsed) ? format(parsed, 'MMM d, yyyy') : item.date}
                      </span>
                      {next && (
                        <span className="text-xs font-medium" style={{ color: 'var(--espresso-light)' }}>
                          · {daysLabel(differenceInDays(next, today))}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDate(item.id)}
                    className="p-2 rounded-lg transition-all hover:opacity-70 shrink-0"
                    style={{ color: 'var(--espresso-muted)' }}
                    title="Delete date"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  )
}
