import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format,
  parseISO,
  isValid,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  subDays,
  isToday,
  getDate,
  getDay,
  getMonth,
  getYear,
  startOfMonth,
  endOfMonth,
} from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  GlassWater,
  Heart,
  Smile,
  PenLine,
  Target,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { usePlanner } from '@/hooks/usePlanner'
import { dateKey, getWeekDays } from '@/lib/dateUtils'
import HeroSection from '@/components/HeroSection'

/* ─────────────────────── types ─────────────────────── */

interface TaskItem {
  id: string
  text: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
}

interface TimeEvent {
  id: string
  title: string
  hour: number
  minute: number
}

interface GratitudeItem {
  id: string
  text: string
}

type Mood = 1 | 2 | 3 | 4 | 5 | null

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: 1, emoji: '\u{1F634}', label: 'Terrible' },
  { value: 2, emoji: '\u{1F615}', label: 'Bad' },
  { value: 3, emoji: '\u{1F610}', label: 'Okay' },
  { value: 4, emoji: '\u{1F642}', label: 'Good' },
  { value: 5, emoji: '\u{1F929}', label: 'Great' },
]

const QUOTES = [
  'The secret of your future is hidden in your daily routine.',
  'Small steps every day lead to big results.',
  'Plan your work, then work your plan.',
  'Today is a fresh start. Make it count.',
  'Progress, not perfection.',
  'Your only limit is you.',
  'Dream big. Start small. Act now.',
]

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5) // 5 AM to 10 PM

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ─────────────────────── helpers ─────────────────────── */

function useDebouncedCallback(
  callback: (val: string) => void,
  delay: number
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  return useCallback(
    (val: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => callback(val), delay)
    },
    [callback, delay]
  )
}

function useDebouncedCallbackArr(
  callback: (vals: string[]) => void,
  delay: number
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  return useCallback(
    (vals: string[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => callback(vals), delay)
    },
    [callback, delay]
  )
}

function useDebouncedCallbackGratitude(
  callback: (items: GratitudeItem[]) => void,
  delay: number
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  return useCallback(
    (items: GratitudeItem[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => callback(items), delay)
    },
    [callback, delay]
  )
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function getQuoteForDate(dateStr: string): string {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) hash = dateStr.charCodeAt(i) + ((hash << 5) - hash)
  const idx = Math.abs(hash) % QUOTES.length
  return QUOTES[idx]
}

/* ─══════════════════════════════════════════════════════ */
/*                     DAILY PLANNER                       */
/* ─══════════════════════════════════════════════════════ */

export default function Daily() {
  const { date: dateParam } = useParams<{ date: string }>()
  const router = useRouter()
  const { getStorageItem, setStorageItem, getHabits, setHabits } = usePlanner()

  /* ── Resolve current date ── */
  const currentDate: Date = useMemo(() => {
    if (!dateParam || dateParam === 'today') return new Date()
    const parsed = parseISO(dateParam)
    return isValid(parsed) ? parsed : new Date()
  }, [dateParam])

  const currentDateStr = dateKey(currentDate)
  const weekDays = getWeekDays(currentDate)

  /* ── Handlers ── */
  const goToDate = useCallback(
    (d: Date) => router.push(`/planner/daily/${dateKey(d)}`),
    [router]
  )
  const goPrevDay = () => goToDate(subDays(currentDate, 1))
  const goNextDay = () => goToDate(addDays(currentDate, 1))
  const goToday = () => router.push('/planner/daily/today')

  /* ── Data: Focus ── */
  const [focus, setFocus] = useState(() =>
    getStorageItem<string>(`planner-focus-${currentDateStr}`, '')
  )
  const saveFocus = useDebouncedCallback((val) => {
    setStorageItem(`planner-focus-${currentDateStr}`, val)
  }, 500)

  /* ── Data: Priorities ── */
  const [priorities, setPriorities] = useState(() =>
    getStorageItem<string[]>(`planner-priorities-${currentDateStr}`, ['', '', ''])
  )
  const savePriorities = useDebouncedCallbackArr((vals) => {
    setStorageItem(`planner-priorities-${currentDateStr}`, vals)
  }, 500)

  /* ── Data: Tasks ── */
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    getStorageItem<TaskItem[]>(`planner-tasks-${currentDateStr}`, [])
  )
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [newTaskText, setNewTaskText] = useState('')

  /* ── Data: Events ── */
  const [events, setEvents] = useState<TimeEvent[]>(() =>
    getStorageItem<TimeEvent[]>(`planner-events-${currentDateStr}`, [])
  )
  const [addingEventHour, setAddingEventHour] = useState<number | null>(null)
  const [addingEventText, setAddingEventText] = useState('')

  /* ── Data: Notes ── */
  const [notes, setNotes] = useState(() =>
    getStorageItem<string>(`planner-notes-${currentDateStr}`, '')
  )
  const saveNotes = useDebouncedCallback((val) => {
    setStorageItem(`planner-notes-${currentDateStr}`, val)
  }, 500)

  /* ── Data: Gratitude ── */
  const [gratitude, setGratitude] = useState<GratitudeItem[]>(() => {
    const stored = getStorageItem<string[]>(`planner-gratitude-${currentDateStr}`, ['', '', ''])
    return stored.map((text, i) => ({ id: `g${i}`, text }))
  })
  const saveGratitude = useDebouncedCallbackGratitude((items) => {
    setStorageItem(
      `planner-gratitude-${currentDateStr}`,
      items.map((i) => i.text)
    )
  }, 500)

  /* ── Data: Mood ── */
  const [mood, setMood] = useState<Mood>(() =>
    getStorageItem<Mood>(`planner-mood-${currentDateStr}`, null)
  )

  /* ── Data: Water ── */
  const [waterCount, setWaterCount] = useState(() =>
    getStorageItem<number>(`planner-water-${currentDateStr}`, 0)
  )

  /* ── Data: Habits ── */
  const [habitsData, setHabitsData] = useState(() => getHabits())

  /* ── Current time indicator ── */
  const [currentTimePos, setCurrentTimePos] = useState(() => {
    const now = new Date()
    const h = now.getHours()
    const m = now.getMinutes()
    return ((h - 5) * 60 + m) * (48 / 30) // 48px per 30-min slot
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const h = now.getHours()
      const m = now.getMinutes()
      if (h >= 5 && h <= 22) {
        setCurrentTimePos(((h - 5) * 60 + m) * (48 / 30))
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  /* ── Sync when date changes ── */
  useEffect(() => {
    setFocus(getStorageItem<string>(`planner-focus-${currentDateStr}`, ''))
    setPriorities(getStorageItem<string[]>(`planner-priorities-${currentDateStr}`, ['', '', '']))
    setTasks(getStorageItem<TaskItem[]>(`planner-tasks-${currentDateStr}`, []))
    setEvents(getStorageItem<TimeEvent[]>(`planner-events-${currentDateStr}`, []))
    setNotes(getStorageItem<string>(`planner-notes-${currentDateStr}`, ''))
    const grat = getStorageItem<string[]>(`planner-gratitude-${currentDateStr}`, ['', '', ''])
    setGratitude(grat.map((text, i) => ({ id: `g${i}`, text })))
    setMood(getStorageItem<Mood>(`planner-mood-${currentDateStr}`, null))
    setWaterCount(getStorageItem<number>(`planner-water-${currentDateStr}`, 0))
    setHabitsData(getHabits())
  }, [currentDateStr, getStorageItem, getHabits])

  /* ── Mini calendar days ── */
  const miniCalDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentDate])

  /* ── Task helpers ── */
  const addTask = () => {
    if (!newTaskText.trim()) return
    const newTask: TaskItem = {
      id: generateId(),
      text: newTaskText.trim(),
      completed: false,
      priority: 'medium',
    }
    const updated = [...tasks, newTask]
    setTasks(updated)
    setStorageItem(`planner-tasks-${currentDateStr}`, updated)
    setNewTaskText('')
  }

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    setTasks(updated)
    setStorageItem(`planner-tasks-${currentDateStr}`, updated)
  }

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id)
    setTasks(updated)
    setStorageItem(`planner-tasks-${currentDateStr}`, updated)
  }

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'active') return tasks.filter((t) => !t.completed)
    if (taskFilter === 'completed') return tasks.filter((t) => t.completed)
    return tasks
  }, [tasks, taskFilter])

  const taskProgress = tasks.length > 0 ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100) : 0

  /* ── Event helpers ── */
  const addEvent = (hour: number) => {
    if (!addingEventText.trim()) {
      setAddingEventHour(null)
      return
    }
    const newEvent: TimeEvent = {
      id: generateId(),
      title: addingEventText.trim(),
      hour,
      minute: 0,
    }
    const updated = [...events, newEvent]
    setEvents(updated)
    setStorageItem(`planner-events-${currentDateStr}`, updated)
    setAddingEventText('')
    setAddingEventHour(null)
  }

  const deleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id)
    setEvents(updated)
    setStorageItem(`planner-events-${currentDateStr}`, updated)
  }

  /* ── Habit helpers ── */
  const toggleHabit = (habitId: string, date: string) => {
    const updated = habitsData.map((h) =>
      h.id === habitId ? { ...h, history: { ...h.history, [date]: !h.history[date] } } : h
    )
    setHabitsData(updated)
    setHabits(updated)
  }

  /* ── Water helpers ── */
  const toggleWater = (idx: number) => {
    const newCount = waterCount === idx + 1 ? idx : idx + 1
    setWaterCount(newCount)
    setStorageItem(`planner-water-${currentDateStr}`, newCount)
  }

  /* ── Mood helper ── */
  const selectMood = (value: Mood) => {
    const newMood = mood === value ? null : value
    setMood(newMood)
    setStorageItem(`planner-mood-${currentDateStr}`, newMood)
  }

  /* ── Stagger animation ── */
  const containerStagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.05 },
    },
  }
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  }

  /* ════════════════════════ RENDER ════════════════════════ */

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      <HeroSection
        imageIndex={1}
        title="Daily Planner"
        subtitle="Hour by hour, moment by moment"
      />
      {/* ── Header ── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="space-y-4">
        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goPrevDay}
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-warm-100 text-warm-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-inter hidden sm:inline">Previous</span>
          </button>

          <div className="text-center">
            <motion.div
              key={`day-${currentDateStr}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <p className="font-playfair font-medium text-rose-600 text-base">
                {format(currentDate, 'EEEE')}
              </p>
              <h1 className="font-playfair font-semibold text-warm-900" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', lineHeight: 1.1 }}>
                {format(currentDate, 'MMMM d')}
              </h1>
              <p className="font-inter text-sm text-warm-500 mt-1">{format(currentDate, 'yyyy')}</p>
            </motion.div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className="px-3 py-2 rounded-md text-sm font-inter font-medium text-rose-600 border border-rose-300 hover:bg-rose-50 transition-colors"
            >
              Today
            </button>
            <button
              onClick={goNextDay}
              className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-warm-100 text-warm-600 transition-colors"
            >
              <span className="text-sm font-inter hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quote */}
        <motion.p
          variants={fadeUp}
          className="text-center font-caveat text-lg text-warm-500 italic"
        >
          &ldquo;{getQuoteForDate(currentDateStr)}&rdquo;
        </motion.p>

        {/* ── Daily Routine Inspiration ── */}
        <motion.div
          variants={fadeUp}
          className="relative rounded-2xl overflow-hidden h-48 md:h-64"
        >
          <img
            src="/inspo/IMG_1314.JPG"
            alt="Sacred morning routine"
            className="absolute inset-0 w-full h-full object-cover image-elegant"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
            <p className="font-caveat text-white/90 text-xl md:text-2xl mb-1">Sacred Morning Ritual</p>
            <p className="text-white/70 text-sm md:text-base max-w-md">
              5:30 AM · Wake, hydrate, stretch · 15 min sacred space prep
            </p>
          </div>
        </motion.div>

        {/* ── Focus + Priorities Banner ── */}
        <motion.div variants={fadeUp} className="card-planner">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Focus */}
            <div className="flex-1">
              <label className="label-style text-rose-500 flex items-center gap-2 mb-2">
                <Target className="w-3.5 h-3.5" />
                TODAY&apos;S FOCUS
              </label>
              <input
                type="text"
                value={focus}
                onChange={(e) => {
                  setFocus(e.target.value)
                  saveFocus(e.target.value)
                }}
                placeholder="What is your main intention today?"
                className="planner-input text-lg"
              />
            </div>

            {/* Priorities */}
            <div className="flex-1">
              <label className="label-style text-warm-500 mb-2">TOP 3 PRIORITIES</label>
              <div className="space-y-2">
                {priorities.map((p, i) => (
                  <motion.div
                    key={`prio-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-2"
                  >
                    <span className="font-playfair font-medium text-rose-400 text-base w-5">
                      {i + 1}.
                    </span>
                    <input
                      type="text"
                      value={p}
                      onChange={(e) => {
                        const updated = [...priorities]
                        updated[i] = e.target.value
                        setPriorities(updated)
                        savePriorities(updated)
                      }}
                      placeholder="Priority..."
                      className="planner-input text-base"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── 3-Column Layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* ═══════════ LEFT COLUMN: Schedule & Tasks ═══════════ */}
          <motion.div variants={fadeUp} className="xl:col-span-5 space-y-6">
            {/* Time-Blocking Schedule */}
            <div className="card-planner overflow-hidden">
              <h3 className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-rose-500" />
                Schedule
              </h3>

              <div className="relative" style={{ height: `${HOURS.length * 48}px` }}>
                {/* Current time indicator */}
                {currentTimePos >= 0 && currentTimePos <= HOURS.length * 48 && (
                  <div
                    className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                    style={{ top: `${currentTimePos}px` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-rose-500 -ml-1" />
                    <div className="flex-1 h-0.5 bg-rose-500" />
                  </div>
                )}

                {/* Time slots */}
                <div className="absolute inset-0">
                  {HOURS.map((hour, idx) => (
                    <div
                      key={hour}
                      className="flex"
                      style={{ height: '48px' }}
                    >
                      {/* Time label */}
                      <div className="w-[60px] shrink-0 pr-2 text-right flex items-center justify-end">
                        <span className="font-mono text-xs text-warm-500">
                          {hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}
                        </span>
                      </div>

                      {/* Slot */}
                      <div
                        className={`flex-1 relative border-b border-warm-100 cursor-pointer transition-colors hover:bg-rose-50 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-warm-50'
                        }`}
                        onClick={() => {
                          setAddingEventHour(hour)
                          setAddingEventText('')
                        }}
                      >
                        {/* Events in this hour */}
                        {events
                          .filter((e) => e.hour === hour)
                          .map((event) => (
                            <div
                              key={event.id}
                              className="absolute inset-x-1 top-0.5 bottom-0.5 rounded-md flex items-center px-2 justify-between group"
                              style={{
                                backgroundColor: 'rgba(232, 93, 120, 0.15)',
                                borderLeft: '3px solid #e85d78',
                              }}
                            >
                              <span className="font-inter text-[0.8125rem] font-medium text-warm-800 truncate">
                                {event.title}
                              </span>
                              <button
                                onClick={(ev) => {
                                  ev.stopPropagation()
                                  deleteEvent(event.id)
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-rose-200"
                              >
                                <Trash2 className="w-3 h-3 text-rose-600" />
                              </button>
                            </div>
                          ))}

                        {/* Inline add event */}
                        {addingEventHour === hour && (
                          <div
                            className="absolute inset-x-1 top-0.5 bottom-0.5 rounded-md bg-white border border-rose-300 flex items-center px-2 z-10 shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              autoFocus
                              value={addingEventText}
                              onChange={(e) => setAddingEventText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') addEvent(hour)
                                if (e.key === 'Escape') setAddingEventHour(null)
                              }}
                              onBlur={() => addEvent(hour)}
                              placeholder="Event name..."
                              className="w-full text-sm font-inter outline-none bg-transparent text-warm-800 placeholder:text-warm-400"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* To-Do List */}
            <div className="card-planner">
              <div className="flex items-center justify-between mb-4">
                <h3>To-Do List</h3>
                <span className="text-sm text-warm-500 font-inter">
                  {tasks.filter((t) => t.completed).length} of {tasks.length} done
                </span>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 mb-4 border-b border-warm-200 pb-2">
                {(['all', 'active', 'completed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    className={`px-3 py-1 rounded-md text-xs font-inter font-medium transition-colors capitalize ${
                      taskFilter === f
                        ? 'bg-rose-500 text-white'
                        : 'text-warm-500 hover:bg-warm-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Task list */}
              <div className="space-y-1 min-h-[60px]">
                <AnimatePresence mode="popLayout">
                  {filteredTasks.length === 0 ? (
                    <p className="text-sm text-warm-400 text-center py-4 font-inter italic">
                      No tasks yet. Add your first task below!
                    </p>
                  ) : (
                    filteredTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 25 }}
                        className="flex items-center gap-3 py-2 border-b border-warm-100 group"
                      >
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => toggleTask(task.id)}
                          className={`w-[18px] h-[18px] rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200 ${
                            task.completed
                              ? 'bg-rose-500 border-rose-500'
                              : 'border-warm-300 hover:border-rose-300 bg-white'
                          }`}
                        >
                          {task.completed && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            >
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </motion.button>

                        <span
                          className={`flex-1 font-inter text-[0.9375rem] transition-all duration-300 ${
                            task.completed
                              ? 'line-through text-warm-400'
                              : 'text-warm-700'
                          }`}
                          style={task.completed ? { textDecorationColor: '#f5a9b8' } : undefined}
                        >
                          {task.text}
                        </span>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-warm-100"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-warm-400" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Add task */}
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  placeholder="Add a task..."
                  className="flex-1 text-sm font-inter px-3 py-2 rounded-md border border-warm-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all placeholder:text-warm-400"
                />
                <button
                  onClick={addTask}
                  className="btn-primary p-2"
                  aria-label="Add task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              {tasks.length > 0 && (
                <div className="mt-4">
                  <div className="w-full h-2 bg-warm-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-rose-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${taskProgress}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-warm-500 font-inter mt-1 text-right">{taskProgress}% Complete</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* ═══════════ MIDDLE COLUMN: Notes & Journal ═══════════ */}
          <motion.div variants={fadeUp} className="xl:col-span-4 space-y-6">
            {/* Notes */}
            <div className="card-planner">
              <h3 className="flex items-center gap-2 mb-3">
                <PenLine className="w-5 h-5 text-rose-500" />
                Notes
              </h3>
              <div
                className="relative rounded-lg overflow-hidden"
                style={{
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, var(--warm-100) 27px, var(--warm-100) 28px)',
                  backgroundSize: '100% 28px',
                }}
              >
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value)
                    saveNotes(e.target.value)
                  }}
                  placeholder="Write your thoughts, ideas, or notes for today..."
                  className="w-full min-h-[200px] p-3 font-caveat text-lg text-warm-700 bg-transparent outline-none resize-none leading-7"
                />
              </div>
            </div>

            {/* Gratitude */}
            <div className="card-planner bg-rose-50/40">
              <h3 className="flex items-center gap-2 mb-1">
                <Heart className="w-5 h-5 text-rose-400" />
                Gratitude
              </h3>
              <p className="font-caveat text-rose-600 text-base mb-3">
                What are you grateful for today?
              </p>
              <div className="space-y-3">
                {gratitude.map((g, i) => (
                  <div key={g.id} className="flex items-center gap-2">
                    <span className="text-rose-400 font-caveat text-base">{i + 1}.</span>
                    <input
                      type="text"
                      value={g.text}
                      onChange={(e) => {
                        const updated = gratitude.map((item) =>
                          item.id === g.id ? { ...item, text: e.target.value } : item
                        )
                        setGratitude(updated)
                        saveGratitude(updated)
                      }}
                      placeholder="I am grateful for..."
                      className="planner-input text-base"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mood + Water Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mood Tracker */}
              <div className="card-planner">
                <h4 className="flex items-center gap-2 mb-3 text-sm">
                  <Smile className="w-4 h-4 text-rose-500" />
                  Today&apos;s Mood
                </h4>
                <div className="flex items-center justify-center gap-3">
                  {MOODS.map((m) => (
                    <motion.button
                      key={m.value}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => selectMood(m.value)}
                      className={`text-2xl transition-all duration-200 ${
                        mood === m.value ? 'grayscale-0 opacity-100 scale-110' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-80'
                      }`}
                      title={m.label}
                    >
                      {m.emoji}
                    </motion.button>
                  ))}
                </div>
                {mood && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-xs font-inter font-medium text-warm-600 mt-2"
                  >
                    {MOODS.find((m) => m.value === mood)?.label}
                  </motion.p>
                )}
              </div>

              {/* Water Intake */}
              <div className="card-planner">
                <h4 className="flex items-center gap-2 mb-3 text-sm">
                  <GlassWater className="w-4 h-4 text-info" />
                  Water Intake
                </h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Array.from({ length: 8 }, (_, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => toggleWater(i)}
                      className={`w-6 h-7 rounded-sm border transition-all duration-300 flex items-center justify-center ${
                        i < waterCount
                          ? 'bg-info border-info'
                          : 'bg-transparent border-warm-300 hover:border-info'
                      }`}
                    >
                      {i < waterCount && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          <GlassWater className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
                <p className="text-center text-xs font-inter font-medium text-warm-600 mt-2">
                  {waterCount} / 8 glasses
                </p>
              </div>
            </div>
          </motion.div>

          {/* ═══════════ RIGHT COLUMN: Habits & Reflection ═══════════ */}
          <motion.div variants={fadeUp} className="xl:col-span-3 space-y-6">
            {/* Daily Habits */}
            <div className="card-planner">
              <h3 className="flex items-center gap-2 mb-4">
                <Check className="w-5 h-5 text-rose-500" />
                Habits
              </h3>
              {habitsData.length === 0 ? (
                <p className="text-sm text-warm-400 font-inter text-center py-4">
                  No habits configured yet.
                  <br />
                  <Link href="/planner/goals" className="text-rose-500 hover:underline">
                    Manage Habits &rarr;
                  </Link>
                </p>
              ) : (
                <div className="space-y-2">
                  {habitsData.slice(0, 7).map((habit) => {
                    const isChecked = !!habit.history[currentDateStr]
                    return (
                      <motion.div
                        key={habit.id}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 py-1.5 cursor-pointer group"
                        onClick={() => toggleHabit(habit.id, currentDateStr)}
                      >
                        <div
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all duration-200 ${
                            isChecked
                              ? 'bg-rose-500 border-rose-500'
                              : 'border-warm-300 group-hover:border-rose-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <span
                          className={`font-inter text-sm flex-1 ${
                            isChecked ? 'line-through text-warm-400' : 'text-warm-700'
                          }`}
                        >
                          {habit.name}
                        </span>
                      </motion.div>
                    )
                  })}
                  {habitsData.length > 7 && (
                    <Link
                      href="/planner/goals"
                      className="text-xs text-rose-500 font-inter hover:underline block mt-2"
                    >
                      +{habitsData.length - 7} more habits &rarr;
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Mini Calendar */}
            <div className="card-planner">
              <h3 className="mb-4">{format(currentDate, 'MMMM yyyy')}</h3>
              <div className="grid grid-cols-7 gap-1">
                {WEEK_DAYS.map((d) => (
                  <div key={d} className="text-center text-[0.6875rem] font-inter font-semibold text-warm-500 uppercase tracking-wider py-1">
                    {d[0]}
                  </div>
                ))}
                {miniCalDays.map((day) => {
                  const isCurrentMonth = getMonth(day) === getMonth(currentDate)
                  const dayIsToday = isToday(day)
                  const isSelected = isSameDay(day, currentDate)
                  return (
                    <Link
                      key={day.toISOString()}
                      href={`/planner/daily/${dateKey(day)}`}
                      className={`aspect-square flex items-center justify-center rounded-md text-xs font-inter transition-all duration-150 ${
                        !isCurrentMonth
                          ? 'text-warm-300'
                          : dayIsToday
                            ? 'bg-rose-500 text-white font-semibold'
                            : isSelected
                              ? 'bg-rose-100 text-rose-700 font-medium ring-1 ring-rose-500'
                              : 'text-warm-700 hover:bg-warm-100'
                      }`}
                    >
                      {getDate(day)}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Daily Intention */}
            <div className="card-planner">
              <h4 className="text-sm mb-2">Daily Intention</h4>
              <textarea
                value={focus}
                onChange={(e) => {
                  setFocus(e.target.value)
                  saveFocus(e.target.value)
                }}
                placeholder="Set your intention..."
                className="w-full min-h-[60px] p-2 font-caveat text-base text-warm-700 bg-transparent outline-none resize-none border border-warm-100 rounded-md focus:border-rose-300 transition-colors"
              />
            </div>

            {/* Quick Week Navigation */}
            <div className="card-planner">
              <h4 className="text-sm mb-3">This Week</h4>
              <div className="flex justify-between gap-1">
                {weekDays.map((day) => {
                  const dKey = dateKey(day)
                  const isActiveDay = isSameDay(day, currentDate)
                  const dayIsToday = isToday(day)
                  return (
                    <Link
                      key={dKey}
                      href={`/planner/daily/${dKey}`}
                      className={`flex flex-col items-center py-2 px-1 rounded-md min-w-[44px] transition-all duration-150 ${
                        isActiveDay
                          ? 'bg-rose-500 text-white'
                          : dayIsToday
                            ? 'bg-rose-100 text-rose-700'
                            : 'hover:bg-warm-100 text-warm-600'
                      }`}
                    >
                      <span className="text-[0.625rem] font-inter font-medium uppercase">
                        {WEEK_DAYS[getDay(day)]}
                      </span>
                      <span className={`text-sm font-inter font-medium ${isActiveDay ? 'text-white' : ''}`}>
                        {getDate(day)}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Helper: isSameDay check without importing from date-fns twice ── */
function isSameDay(a: Date, b: Date): boolean {
  return (
    getYear(a) === getYear(b) &&
    getMonth(a) === getMonth(b) &&
    getDate(a) === getDate(b)
  )
}
