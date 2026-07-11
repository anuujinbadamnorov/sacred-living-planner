import { useState, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  addMonths,
  subMonths,
  getWeek,
} from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  CalendarCheck,
  ListTodo,
  AlertCircle,
} from 'lucide-react'
import { usePlanner } from '@/hooks/usePlanner'
import { dateKey } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const DAY_ABBREVS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const CATEGORY_COLORS: Record<string, string> = {
  Work: 'bg-info',
  Personal: 'bg-rose-400',
  Health: 'bg-success',
  Other: 'bg-warning',
}

const HOLIDAYS_2026: Record<string, string> = {
  '2026-01-01': "New Year's Day",
  '2026-01-19': 'MLK Jr. Day',
  '2026-02-14': "Valentine's Day",
  '2026-02-16': "Presidents' Day",
  '2026-04-05': 'Easter Sunday',
  '2026-05-10': "Mother's Day",
  '2026-05-25': 'Memorial Day',
  '2026-06-19': 'Juneteenth',
  '2026-06-21': "Father's Day",
  '2026-07-04': 'Independence Day',
  '2026-09-07': 'Labor Day',
  '2026-10-12': 'Columbus Day',
  '2026-10-31': 'Halloween',
  '2026-11-11': 'Veterans Day',
  '2026-11-26': 'Thanksgiving',
  '2026-12-25': 'Christmas Day',
  '2026-12-31': "New Year's Eve",
}

function getHoliday(date: Date): string | undefined {
  return HOLIDAYS_2026[format(date, 'yyyy-MM-dd')]
}

interface CalendarEvent {
  id: string
  title: string
  time: string
  category?: string
  notes?: string
}

interface Task {
  id: string
  text: string
  completed: boolean
}

export default function Monthly() {
  const { month } = useParams<{ month: string }>()
  const router = useRouter()
  const { getEvents, setEvents, getTasks } = usePlanner()

  const currentMonthIndex = month === 'current' ? new Date().getMonth() : (month ? parseInt(month, 10) : new Date().getMonth())
  const currentYear = 2026

  const [displayDate, setDisplayDate] = useState(() => new Date(currentYear, currentMonthIndex))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [navDirection, setNavDirection] = useState<'prev' | 'next'>('next')

  // Event form state
  const [eventTitle, setEventTitle] = useState('')
  const [eventTime, setEventTime] = useState('09:00')
  const [eventCategory, setEventCategory] = useState('Personal')
  const [eventNotes, setEventNotes] = useState('')

  const monthStart = startOfMonth(displayDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weeks = useMemo(() => {
    const result: Date[][] = []
    let week: Date[] = []
    calendarDays.forEach((day, idx) => {
      week.push(day)
      if ((idx + 1) % 7 === 0) {
        result.push([...week])
        week = []
      }
    })
    return result
  }, [calendarDays])

  const goToPrevMonth = () => {
    setNavDirection('prev')
    setDisplayDate((d) => subMonths(d, 1))
    setSelectedDate(null)
  }

  const goToNextMonth = () => {
    setNavDirection('next')
    setDisplayDate((d) => addMonths(d, 1))
    setSelectedDate(null)
  }

  const goToToday = () => {
    const now = new Date()
    setDisplayDate(new Date(currentYear, now.getMonth()))
    setSelectedDate(now)
  }

  const getDayEvents = useCallback(
    (date: Date): CalendarEvent[] => {
      return getEvents(dateKey(date))
    },
    [getEvents]
  )

  const getDayTasks = useCallback(
    (date: Date): Task[] => {
      return getTasks(dateKey(date))
    },
    [getTasks]
  )

  const selectedDateEvents = selectedDate ? getDayEvents(selectedDate) : []
  const selectedDateTasks = selectedDate ? getDayTasks(selectedDate) : []

  // Month-wide stats
  const monthEvents = useMemo(() => {
    let count = 0
    calendarDays.forEach((d) => {
      if (isSameMonth(d, displayDate)) {
        count += getDayEvents(d).length
      }
    })
    return count
  }, [calendarDays, displayDate, getDayEvents])

  const monthTasks = useMemo(() => {
    let total = 0
    let remaining = 0
    calendarDays.forEach((d) => {
      if (isSameMonth(d, displayDate)) {
        const tasks = getDayTasks(d)
        total += tasks.length
        remaining += tasks.filter((t) => !t.completed).length
      }
    })
    return { total, remaining }
  }, [calendarDays, displayDate, getDayTasks])

  const daysWithEntries = useMemo(() => {
    return calendarDays.filter((d) => {
      if (!isSameMonth(d, displayDate)) return false
      return getDayEvents(d).length > 0 || getDayTasks(d).length > 0
    }).length
  }, [calendarDays, displayDate, getDayEvents, getDayTasks])

  const upcomingEvents = useMemo(() => {
    const events: { date: Date; event: CalendarEvent }[] = []
    const today = new Date()
    calendarDays.forEach((d) => {
      if (d >= today && isSameMonth(d, displayDate)) {
        getDayEvents(d).forEach((evt) => {
          events.push({ date: d, event: evt })
        })
      }
    })
    return events.slice(0, 5)
  }, [calendarDays, displayDate, getDayEvents])

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
  }

  const handleDayDoubleClick = (day: Date) => {
    router.push(`/planner/daily/${dateKey(day)}`)
  }

  const handleWeekClick = (weekDates: Date[]) => {
    const midWeek = weekDates[3] || weekDates[0]
    const weekNum = getWeek(midWeek)
    router.push(`/planner/weekly/${currentYear}-W${weekNum}`)
  }

  const handleAddEvent = () => {
    setEventTitle('')
    setEventTime('09:00')
    setEventCategory('Personal')
    setEventNotes('')
    setShowEventModal(true)
  }

  const saveEvent = () => {
    if (!eventTitle.trim()) return
    const targetDate = selectedDate || displayDate
    const key = dateKey(targetDate)
    const existing = getEvents(key)
    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      title: eventTitle.trim(),
      time: eventTime,
      category: eventCategory,
      notes: eventNotes.trim(),
    }
    setEvents(key, [...existing, newEvent])
    setShowEventModal(false)
    setEventTitle('')
    setEventTime('09:00')
    setEventCategory('Personal')
    setEventNotes('')
  }

  return (
    <>
      <div className="space-y-6">
        {/* ── Header & Controls ── */}
        <motion.div
          className="flex items-center justify-between flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {/* Left: Month navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrevMonth}
              className="p-2 rounded-md hover:bg-warm-100 text-warm-500 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="font-playfair text-warm-900 min-w-[180px] text-center">
              {format(displayDate, 'MMMM yyyy')}
            </h1>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-md hover:bg-warm-100 text-warm-500 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 rounded-md border border-warm-200 bg-warm-100 text-warm-800 font-inter text-sm font-medium hover:bg-warm-200 transition-colors"
            >
              Today
            </button>
            <div className="flex rounded-md border border-warm-200 overflow-hidden">
              <button className="px-3 py-2 bg-rose-500 text-white font-inter text-xs font-medium">
                Month
              </button>
              <button
                onClick={() => {
                  const weekNum = getWeek(displayDate)
                  router.push(`/planner/weekly/${currentYear}-W${weekNum}`)
                }}
                className="px-3 py-2 bg-warm-100 text-warm-600 font-inter text-xs font-medium hover:bg-warm-200 transition-colors"
              >
                Week
              </button>
            </div>
            <button
              onClick={handleAddEvent}
              className="btn-primary flex items-center gap-1.5 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          </div>
        </motion.div>

        {/* ── Calendar + Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Calendar Grid (70%) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={format(displayDate, 'yyyy-MM')}
                initial={{ opacity: 0, x: navDirection === 'next' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: navDirection === 'next' ? -20 : 20 }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-0">
                  {DAY_ABBREVS.map((d) => (
                    <div
                      key={d}
                      className="font-inter text-[0.6875rem] font-semibold text-warm-500 uppercase text-center py-2"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Week rows */}
                <div className="border border-warm-200 rounded-md overflow-hidden">
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid grid-cols-7 relative group/week">
                      {/* Week number hover button */}
                      <button
                        onClick={() => handleWeekClick(week)}
                        className="absolute left-0 top-0 bottom-0 w-5 opacity-0 group-hover/week:opacity-100 bg-rose-50 hover:bg-rose-100 flex items-center justify-center transition-opacity z-10"
                        title="View week"
                      >
                        <ChevronRight className="w-3 h-3 text-rose-500" />
                      </button>
                      {week.map((day, dayIdx) => {
                        const inMonth = isSameMonth(day, displayDate)
                        const dayIsToday = isToday(day)
                        const weekend = isWeekend(day)
                        const holiday = getHoliday(day)
                        const dayEvents = inMonth ? getDayEvents(day) : []
                        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false

                        return (
                          <motion.div
                            key={dayIdx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: weekIdx * 7 * 0.008 + dayIdx * 0.008,
                            }}
                            onClick={() => handleDayClick(day)}
                            onDoubleClick={() => handleDayDoubleClick(day)}
                            className={cn(
                              'min-h-[100px] p-1.5 border border-warm-200 -mt-px -ml-px cursor-pointer transition-colors duration-150 flex flex-col gap-1',
                              !inMonth && 'opacity-30 bg-warm-50',
                              weekend && inMonth && 'bg-warm-50/50',
                              isSelected && 'ring-2 ring-rose-500 ring-inset z-10',
                              !isSelected && 'hover:bg-warm-100'
                            )}
                          >
                            {/* Date number */}
                            <div className="flex items-start justify-between">
                              <span
                                className={cn(
                                  'font-inter text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                                  dayIsToday
                                    ? 'bg-rose-500 text-white'
                                    : 'text-warm-700'
                                )}
                              >
                                {format(day, 'd')}
                              </span>
                              {holiday && inMonth && (
                                <span className="font-inter text-[0.625rem] text-rose-500 truncate max-w-[70%] text-right leading-tight">
                                  {holiday}
                                </span>
                              )}
                            </div>

                            {/* Event pills */}
                            {inMonth && dayEvents.length > 0 && (
                              <div className="flex flex-col gap-0.5 mt-auto">
                                {dayEvents.slice(0, 3).map((evt: CalendarEvent, idx: number) => (
                                  <div
                                    key={evt.id || idx}
                                    className={cn(
                                      'px-1.5 py-0.5 rounded-full text-[0.6875rem] font-inter font-medium truncate leading-tight',
                                      CATEGORY_COLORS[evt.category || 'Other'] || 'bg-warning',
                                      'bg-opacity-20 text-warm-700'
                                    )}
                                  >
                                    {evt.title}
                                  </div>
                                ))}
                                {dayEvents.length > 3 && (
                                  <span className="font-inter text-[0.625rem] text-warm-500 pl-1">
                                    +{dayEvents.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Empty state dots for days with no events but are selected */}
                            {inMonth && dayEvents.length === 0 && isSelected && (
                              <div className="mt-auto flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-warm-200" />
                                <span className="font-inter text-[0.625rem] text-warm-400 italic">
                                  No events
                                </span>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar (30%) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Selected Day Info */}
            <motion.div
              className="card-planner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
            >
              {selectedDate ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={dateKey(selectedDate)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h4 className="mb-3 flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-rose-500" />
                      {format(selectedDate, 'EEEE, MMM d')}
                    </h4>

                    {/* Tasks for selected date */}
                    <div className="mb-4">
                      <p className="font-inter text-xs text-warm-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <ListTodo className="w-3 h-3" /> Tasks
                      </p>
                      {selectedDateTasks.length > 0 ? (
                        <div className="space-y-1.5">
                          {selectedDateTasks.map((task: Task) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div
                                className={cn(
                                  'w-[18px] h-[18px] rounded-[3px] border flex items-center justify-center transition-colors shrink-0',
                                  task.completed
                                    ? 'bg-rose-500 border-rose-500'
                                    : 'border-warm-300'
                                )}
                              >
                                {task.completed && (
                                  <svg width="10" height="10" viewBox="0 0 10 10">
                                    <path
                                      d="M2 5L4 7L8 3"
                                      stroke="white"
                                      strokeWidth="1.5"
                                      fill="none"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span
                                className={cn(
                                  'font-inter text-warm-700 text-xs',
                                  task.completed && 'line-through text-warm-400'
                                )}
                              >
                                {task.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="font-inter text-xs text-warm-400 italic">
                          No tasks for this day
                        </p>
                      )}
                    </div>

                    {/* Events for selected date */}
                    <div>
                      <p className="font-inter text-xs text-warm-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Events
                      </p>
                      {selectedDateEvents.length > 0 ? (
                        <div className="space-y-1.5">
                          {selectedDateEvents.map((evt: CalendarEvent) => (
                            <div
                              key={evt.id}
                              className="flex items-center gap-2 py-1 border-b border-warm-100 last:border-0"
                            >
                              <div
                                className={cn(
                                  'w-2 h-2 rounded-full shrink-0',
                                  CATEGORY_COLORS[evt.category || 'Other'] || 'bg-warning'
                                )}
                              />
                              <span className="font-mono text-xs text-warm-500 min-w-[44px]">
                                {evt.time}
                              </span>
                              <span className="font-inter text-xs text-warm-700 truncate">
                                {evt.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="font-inter text-xs text-warm-400 italic">
                          No events for this day
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => router.push(`/planner/daily/${dateKey(selectedDate)}`)}
                      className="mt-4 w-full py-2 rounded-md border border-rose-200 text-rose-600 font-inter text-xs font-medium hover:bg-rose-50 transition-colors flex items-center justify-center gap-1"
                    >
                      Open Daily View
                    </button>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="text-center py-6">
                  <AlertCircle className="w-8 h-8 text-warm-300 mx-auto mb-2" />
                  <p className="font-inter text-sm text-warm-500">
                    Select a day to see details
                  </p>
                </div>
              )}
            </motion.div>

            {/* Upcoming Events */}
            <motion.div
              className="card-planner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
            >
              <h4 className="mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-500" />
                Upcoming
              </h4>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-2">
                  {upcomingEvents.map(({ date, event }, idx) => (
                    <button
                      key={`${dateKey(date)}-${event.id}-${idx}`}
                      onClick={() => router.push(`/planner/daily/${dateKey(date)}`)}
                      className="w-full flex items-center gap-2 py-1.5 border-b border-warm-100 last:border-0 text-left hover:bg-warm-50 rounded px-1 -mx-1 transition-colors"
                    >
                      <span className="font-mono text-xs text-warm-500 min-w-[44px]">
                        {format(date, 'MMM d')}
                      </span>
                      <span className="font-inter text-xs text-warm-700 truncate">
                        {event.title}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="font-inter text-xs text-warm-400 italic">
                  No upcoming events this month
                </p>
              )}
            </motion.div>

            {/* Month Stats */}
            <motion.div
              className="card-planner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
            >
              <h4 className="mb-3">Month Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-inter text-xs text-warm-500">Events</span>
                  <span className="font-inter text-xs font-medium text-warm-700">
                    {monthEvents}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-inter text-xs text-warm-500">Tasks remaining</span>
                  <span className="font-inter text-xs font-medium text-warm-700">
                    {monthTasks.remaining}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-inter text-xs text-warm-500">Days with entries</span>
                  <span className="font-inter text-xs font-medium text-warm-700">
                    {daysWithEntries}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Holidays this month */}
            <motion.div
              className="card-planner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
            >
              <h4 className="mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                Holidays
              </h4>
              {(() => {
                const monthHols = Object.entries(HOLIDAYS_2026).filter(([key]) => {
                  const d = new Date(key + 'T00:00:00')
                  return d.getMonth() === displayDate.getMonth()
                })
                return monthHols.length > 0 ? (
                  <div className="space-y-1.5">
                    {monthHols.map(([key, name]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="font-mono text-xs text-warm-500 min-w-[44px]">
                          {format(new Date(key + 'T00:00:00'), 'MMM d')}
                        </span>
                        <span className="font-inter text-xs text-warm-700">{name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-inter text-xs text-warm-400 italic">
                    No holidays this month
                  </p>
                )
              })()}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Add Event Modal ── */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(42,37,32,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-8 w-full max-w-[520px] shadow-xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-playfair text-warm-800">Add Event</h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-1.5 rounded-md hover:bg-warm-100 text-warm-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Date display */}
              <p className="font-inter text-sm text-warm-500 mb-4">
                {selectedDate
                  ? format(selectedDate, 'EEEE, MMMM do, yyyy')
                  : format(displayDate, 'EEEE, MMMM do, yyyy')}
              </p>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block font-inter text-xs font-medium text-warm-600 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Event title"
                    className="w-full px-3 py-2 rounded-md border border-warm-200 bg-white font-inter text-sm text-warm-700 placeholder:text-warm-400 focus:border-rose-400 focus:outline-none focus:ring-[3px] focus:ring-rose-500/10 transition-all"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-inter text-xs font-medium text-warm-600 mb-1.5">
                      Time
                    </label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-warm-200 bg-white font-inter text-sm text-warm-700 focus:border-rose-400 focus:outline-none focus:ring-[3px] focus:ring-rose-500/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-inter text-xs font-medium text-warm-600 mb-1.5">
                      Category
                    </label>
                    <select
                      value={eventCategory}
                      onChange={(e) => setEventCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-warm-200 bg-white font-inter text-sm text-warm-700 focus:border-rose-400 focus:outline-none focus:ring-[3px] focus:ring-rose-500/10 transition-all"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Work">Work</option>
                      <option value="Health">Health</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-inter text-xs font-medium text-warm-600 mb-1.5">
                    Notes
                  </label>
                  <textarea
                    value={eventNotes}
                    onChange={(e) => setEventNotes(e.target.value)}
                    placeholder="Add notes..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-md border border-warm-200 bg-white font-inter text-sm text-warm-700 placeholder:text-warm-400 focus:border-rose-400 focus:outline-none focus:ring-[3px] focus:ring-rose-500/10 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-md border border-warm-200 bg-warm-100 text-warm-800 font-inter text-sm font-medium hover:bg-warm-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEvent}
                  disabled={!eventTitle.trim()}
                  className={cn(
                    'px-4 py-2 rounded-md font-inter text-sm font-medium transition-colors',
                    eventTitle.trim()
                      ? 'btn-primary'
                      : 'bg-warm-200 text-warm-400 cursor-not-allowed'
                  )}
                >
                  Save Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Helper to check if two dates are the same day
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  )
}
