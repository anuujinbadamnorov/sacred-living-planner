import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import HeroSection from '@/components/HeroSection'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isWeekend,
  getDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const monthImages = [
  '/month-jan.jpg', '/month-feb.jpg', '/month-mar.jpg', '/month-apr.jpg',
  '/month-may.jpg', '/month-jun.jpg', '/month-jul.jpg', '/month-aug.jpg',
  '/month-sep.jpg', '/month-oct.jpg', '/month-nov.jpg', '/month-dec.jpg',
]

const HOLIDAYS_2026 = [
  { date: '2026-01-01', name: "New Year's Day", federal: true },
  { date: '2026-01-19', name: 'MLK Jr. Day', federal: true },
  { date: '2026-02-14', name: "Valentine's Day", federal: false },
  { date: '2026-02-16', name: "Presidents' Day", federal: true },
  { date: '2026-04-05', name: 'Easter Sunday', federal: false },
  { date: '2026-05-10', name: "Mother's Day", federal: false },
  { date: '2026-05-25', name: 'Memorial Day', federal: true },
  { date: '2026-06-19', name: 'Juneteenth', federal: true },
  { date: '2026-06-21', name: "Father's Day", federal: false },
  { date: '2026-07-04', name: 'Independence Day', federal: true },
  { date: '2026-09-07', name: 'Labor Day', federal: true },
  { date: '2026-10-12', name: 'Columbus Day', federal: true },
  { date: '2026-10-31', name: 'Halloween', federal: false },
  { date: '2026-11-11', name: "Veterans Day", federal: true },
  { date: '2026-11-26', name: 'Thanksgiving', federal: true },
  { date: '2026-12-25', name: 'Christmas Day', federal: true },
  { date: '2026-12-31', name: "New Year's Eve", federal: false },
]

function getHolidaysForMonth(month: number) {
  return HOLIDAYS_2026.filter((h) => {
    const d = new Date(h.date + 'T00:00:00')
    return d.getMonth() === month
  })
}

function hasHoliday(date: Date) {
  const key = format(date, 'yyyy-MM-dd')
  return HOLIDAYS_2026.find((h) => h.date === key)
}

function MiniMonth({
  year,
  month,
}: {
  year: number
  month: number
}) {
  const router = useRouter()
  const monthDate = new Date(year, month)

  const days = useMemo(() => {
    const firstDay = startOfMonth(monthDate)
    const lastDay = endOfMonth(firstDay)
    const start = startOfWeek(firstDay, { weekStartsOn: 0 })
    const end = endOfWeek(lastDay, { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [monthDate])

  const monthHolidays = useMemo(() => getHolidaysForMonth(month), [month])

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/planner/monthly/${month}`)}
      className="relative rounded-xl overflow-hidden text-left transition-all duration-200 shadow-sm hover:shadow-md"
    >
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `url(${monthImages[month]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 p-4">
        {/* Month name */}
        <h3 className="font-display text-center text-white text-lg mb-1 drop-shadow-lg">
          {format(monthDate, 'MMMM')}
        </h3>
        <p className="font-body text-xs text-white/70 text-center mb-3">{year}</p>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, marginBottom: '4px' }}>
          {weekDays.map((d) => (
            <div
              key={d}
              className="font-body text-[0.625rem] font-semibold text-white/80 uppercase text-center w-7 h-7 flex items-center justify-center"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Date grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
          {days.map((day, idx) => {
            const inMonth = isSameMonth(day, monthDate)
            const dayIsToday = isToday(day)
            const holiday = hasHoliday(day)
            const weekend = isWeekend(day)

            return (
              <div
                key={idx}
                className={cn(
                  'w-7 h-7 flex flex-col items-center justify-center relative',
                  !inMonth && 'opacity-30'
                )}
              >
                <span
                  className={cn(
                    'font-body text-[0.75rem] w-6 h-6 flex items-center justify-center rounded-full',
                    dayIsToday
                      ? 'bg-white text-rose-600 font-bold'
                      : weekend && inMonth
                        ? 'text-white/60'
                        : 'text-white'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {holiday && inMonth && (
                  <div className="w-1 h-1 rounded-full bg-rose-300 mt-px" />
                )}
              </div>
            )
          })}
        </div>

        {/* Holiday dots legend */}
        {monthHolidays.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/20 space-y-0.5">
            {monthHolidays.slice(0, 2).map((h) => (
              <div key={h.date} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-rose-300 shrink-0" />
                <span className="font-body text-[0.625rem] text-white/70 truncate">
                  {h.name}
                </span>
              </div>
            ))}
            {monthHolidays.length > 2 && (
              <span className="font-body text-[0.625rem] text-white/50 pl-2.5">
                +{monthHolidays.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* View link */}
        <div className="mt-3 text-center">
          <span className="font-body text-xs text-white/80 hover:text-white inline-flex items-center gap-1 transition-colors">
            View Month <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.button>
  )
}

export default function Yearly() {
  const router = useRouter()
  const today = new Date()
  const year = 2026

  const upcomingHolidays = useMemo(() => {
    const now = new Date()
    return HOLIDAYS_2026.filter((h) => {
      const d = new Date(h.date + 'T00:00:00')
      return d >= now
    }).slice(0, 8)
  }, [today])

  const yearStats = useMemo(() => {
    const now = new Date()
    const endOfYear = new Date(year, 11, 31)
    const daysRemaining = Math.max(0, Math.ceil((endOfYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    let weekendsLeft = 0
    const checkDate = new Date(now)
    while (checkDate <= endOfYear) {
      const dow = getDay(checkDate)
      if (dow === 0 || dow === 6) weekendsLeft++
      checkDate.setDate(checkDate.getDate() + 1)
    }

    let totalEvents = 0
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('planner-events-')) {
          try {
            const val = JSON.parse(localStorage.getItem(key) || '[]')
            totalEvents += val.length
          } catch {
            // ignore
          }
        }
      }
    }

    return {
      daysRemaining,
      weekendsLeft,
      holidays: HOLIDAYS_2026.length,
      totalEvents,
    }
  }, [today])

  const months = Array.from({ length: 12 }, (_, i) => i)

  return (
    <>
      <div className="space-y-8">
        {/* ── Header ── */}
        <motion.div
          className="flex items-center justify-between flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div>
            <h1 className="font-display" style={{ color: 'var(--espresso)' }}>{year}</h1>
            <p className="font-body" style={{ color: 'var(--espresso-muted)' }}>Year at a Glance</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/planner/yearly')}
              className="p-2 rounded-md transition-colors"
              style={{ color: 'var(--espresso-muted)' }}
              aria-label="Previous year"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const now = new Date()
                const m = now.getMonth()
                router.push(`/planner/monthly/${m}`)
              }}
              className="px-4 py-2 rounded-md font-body text-sm font-medium text-white transition-all"
              style={{ background: 'var(--sage)' }}
            >
              Today
            </button>
            <button
              onClick={() => router.push('/planner/yearly')}
              className="p-2 rounded-md transition-colors"
              style={{ color: 'var(--espresso-muted)' }}
              aria-label="Next year"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* ── 12-Month Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {months.map((month, i) => (
            <motion.div
              key={month}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04, ease: EASE }}
            >
              <MiniMonth year={year} month={month} />
            </motion.div>
          ))}
        </div>

        {/* ── Holidays & Stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Holiday List */}
          <motion.div
            className="lg:col-span-3 rounded-xl p-8"
            style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl" style={{ color: 'var(--espresso)' }}>{year} Holidays</h3>
              <span className="font-body text-xs px-2 py-1 rounded-md" style={{ background: 'var(--border-light)', color: 'var(--espresso-muted)' }}>
                United States
              </span>
            </div>
            <div className="space-y-0">
              {HOLIDAYS_2026.map((holiday, idx) => {
                const hDate = new Date(holiday.date + 'T00:00:00')
                const isUpcoming =
                  (hDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 30 &&
                  hDate >= today
                return (
                  <motion.div
                    key={holiday.date}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    className={cn(
                      'flex items-center justify-between py-2.5',
                      isUpcoming ? 'border-l-[3px] border-l-rose-soft pl-3' : '',
                      idx < HOLIDAYS_2026.length - 1 ? 'border-b' : '',
                    )}
                    style={idx < HOLIDAYS_2026.length - 1 ? { borderColor: 'var(--border-light)' } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs min-w-[80px]" style={{ color: 'var(--espresso-muted)' }}>
                        {format(hDate, 'MMM d')}
                      </span>
                      <span className="font-body text-sm" style={{ color: 'var(--espresso)' }}>
                        {holiday.name}
                      </span>
                      {holiday.federal && (
                        <span className="font-body text-[0.625rem] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,160,160,0.15)', color: 'var(--rose-soft)' }}>
                          Federal
                        </span>
                      )}
                    </div>
                    <span className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>
                      {format(hDate, 'EEEE')}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Year Stats */}
          <motion.div
            className="lg:col-span-2 rounded-xl p-8"
            style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
          >
            <h3 className="font-display text-xl mb-4" style={{ color: 'var(--espresso)' }}>Year in Numbers</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Days Remaining', value: yearStats.daysRemaining },
                { label: 'Weekends Left', value: yearStats.weekendsLeft },
                { label: 'Holidays', value: yearStats.holidays },
                { label: 'Your Events', value: yearStats.totalEvents },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                  className="text-center p-4 rounded-lg"
                  style={{ background: 'var(--cream)' }}
                >
                  <p className="font-display text-3xl font-semibold" style={{ color: 'var(--sage)' }}>
                    {stat.value}
                  </p>
                  <p className="font-body text-xs mt-1" style={{ color: 'var(--espresso-muted)' }}>{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Upcoming holidays */}
            <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
              <h4 className="font-body text-sm font-semibold mb-3" style={{ color: 'var(--espresso-light)' }}>
                Upcoming Holidays
              </h4>
              {upcomingHolidays.length > 0 ? (
                <div className="space-y-2">
                  {upcomingHolidays.slice(0, 4).map((h) => {
                    const hDate = new Date(h.date + 'T00:00:00')
                    return (
                      <div key={h.date} className="flex items-center justify-between">
                        <span className="font-body text-xs" style={{ color: 'var(--espresso)' }}>{h.name}</span>
                        <span className="font-mono text-xs" style={{ color: 'var(--espresso-muted)' }}>
                          {format(hDate, 'MMM d')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="font-body text-xs italic" style={{ color: 'var(--espresso-muted)' }}>
                  No more holidays this year
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
