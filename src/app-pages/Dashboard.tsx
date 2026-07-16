import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  format,
  getHours,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns'
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  Sun,
  Moon,
  Star,
  Heart,
  Flame,
  Leaf,
  Sparkles,
  Target,
  CheckCircle,
  ChevronRight,
  Activity,
  Droplets,
} from 'lucide-react'
import { usePlanner } from '@/hooks/usePlanner'
import { useSupabaseDashboard } from '@/hooks/useSupabaseDashboard'
import { useAuth } from '@/components/AuthProvider'
import { dateKey } from '@/lib/dateUtils'
import { getMoonPhase } from '@/lib/moonPhase'
import HeroSection from '@/components/HeroSection'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

/* ── Affirmations ── */
const affirmations = [
  'I am rooted, grounded, and deeply connected to the earth.',
  'My body is a temple, and I honor it with loving care.',
  'I flow with the cycles of the moon and my own rhythm.',
  'Every ritual I perform strengthens my spirit.',
  'I am abundant in health, love, and creative energy.',
  'My intuition guides me toward what serves my highest good.',
  'I nurture myself so I can nurture others.',
  'I am exactly where I am meant to be.',
  'Today I choose peace over perfection.',
  'My breath anchors me to the present moment.',
  'I trust the wisdom of my body.',
  'I am a vessel of creative light.',
  'My cycle is sacred, and I honor each phase.',
  'I welcome abundance in all its forms.',
  'I am gentle with myself as I grow.',
  'My home is my sanctuary.',
  'I radiate warmth and grounded energy.',
  'Each small ritual is an act of self-love.',
  'I am connected to the ancient wisdom within.',
  'I bloom at my own pace.',
  'My nervous system is safe, supported, and calm.',
  'I choose nourishment over punishment.',
  'I am a Taurus goddess: strong, sensual, and steady.',
  'I honor rest as much as action.',
  'The earth supports me, always.',
  'My intentions are seeds that blossom in divine timing.',
  'I am worthy of care, love, and abundance.',
  'I move through the world with gentle power.',
  'My rituals are my medicine.',
  'I am home within myself.',
]

/* ── Navigation Cards ── */
const navCards = [
  { title: 'Yearly', desc: 'Full year at a glance', icon: Calendar, path: '/planner/yearly', sparkle: '✦' },
  { title: 'Monthly', desc: 'Detailed month grid', icon: CalendarDays, path: '/planner/monthly/0', sparkle: '✧' },
  { title: 'Weekly', desc: '7-day overview', icon: CalendarRange, path: '/planner/weekly/current', sparkle: '✦' },
  { title: 'Daily', desc: 'Hour-by-hour planning', icon: Clock, path: '/planner/daily/today', sparkle: '✧' },
  { title: 'Sacred Routines', desc: 'Morning & evening rituals', icon: Sun, path: '/planner/sacred-routines', sparkle: '☀' },
  { title: 'Body Temple', desc: 'Workouts & movement', icon: Flame, path: '/planner/body-temple', sparkle: '🔥' },
  { title: 'Nourishment', desc: 'Meals & nutrition', icon: Leaf, path: '/planner/nourishment', sparkle: '🌿' },
  { title: 'Moon & Cycle', desc: 'Track your rhythm', icon: Moon, path: '/planner/moon-cycle', sparkle: '🌙' },
]

/* ── Workout Split (6-day) ── */
const WORKOUT_SPLIT = ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest']

/* ── Helpers ── */
function getGreeting() {
  const hour = getHours(new Date())
  if (hour < 6) return 'Sweet dreams, goddess 🌙'
  if (hour < 12) return 'Good morning, goddess ☀️'
  if (hour < 15) return 'Good afternoon, goddess 🌤️'
  if (hour < 18) return 'Good afternoon, goddess 🌻'
  return 'Good evening, goddess 🌙'
}

/* ── Cycle Phase Detection ── */
function getCyclePhase(dayOfCycle: number): { name: string; emoji: string } {
  if (dayOfCycle <= 5) return { name: 'Menstrual', emoji: '🩸' }
  if (dayOfCycle <= 13) return { name: 'Follicular', emoji: '🌱' }
  if (dayOfCycle <= 16) return { name: 'Ovulatory', emoji: '🌸' }
  if (dayOfCycle <= 21) return { name: 'Luteal (Early)', emoji: '🌾' }
  return { name: 'Luteal (Late)', emoji: '🍂' }
}

export default function Dashboard() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { getEvents, getTasks, getGoals, getHabits } = usePlanner()
  const { habitsCount, habitsCompletedToday, todaysEntry, notesCount, loading: sbLoading, error: sbError } = useSupabaseDashboard()
  const today = new Date()
  const todayKey = dateKey(today)

  /* ── State ── */
  const [waterCount, setWaterCount] = useState(0)
  const [intention, setIntention] = useState('')
  const [morningRituals, setMorningRituals] = useState<string[]>([])
  const [eveningRituals, setEveningRituals] = useState<string[]>([])
  const [nonNegotiables, setNonNegotiables] = useState<Record<string, boolean>>({
    meds: false,
    breakfast: false,
    movement: false,
    dog: false,
    relationship: false,
    bedBy1130: false,
  })
  const [cycleDay, setCycleDay] = useState(1)
  const [medsMorning, setMedsMorning] = useState<boolean>(false)
  const [medsEvening, setMedsEvening] = useState<boolean>(false)

  /* ── Load from localStorage on mount ── */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedWater = localStorage.getItem(`planner-water-${todayKey}`)
    if (storedWater) setWaterCount(parseInt(storedWater, 10))
    const storedIntention = localStorage.getItem(`planner-intention-${todayKey}`)
    if (storedIntention) setIntention(storedIntention)
    const storedMorning = localStorage.getItem(`planner-morning-${todayKey}`)
    if (storedMorning) setMorningRituals(JSON.parse(storedMorning))
    const storedEvening = localStorage.getItem(`planner-evening-${todayKey}`)
    if (storedEvening) setEveningRituals(JSON.parse(storedEvening))
    const storedNonNeg = localStorage.getItem(`planner-nonneg-${todayKey}`)
    if (storedNonNeg) setNonNegotiables(JSON.parse(storedNonNeg))
    const storedCycle = localStorage.getItem('planner-cycle-day')
    if (storedCycle) setCycleDay(parseInt(storedCycle, 10))
    const storedMedsAm = localStorage.getItem(`planner-meds-am-${todayKey}`)
    if (storedMedsAm) setMedsMorning(storedMedsAm === 'true')
    const storedMedsPm = localStorage.getItem(`planner-meds-pm-${todayKey}`)
    if (storedMedsPm) setMedsEvening(storedMedsPm === 'true')
  }, [todayKey])

  /* ── Derived ── */
  const todayEvents = useMemo(() => getEvents(todayKey), [getEvents, todayKey])
  const todayTasks = useMemo(() => getTasks(todayKey), [getTasks, todayKey])
  const allGoals = useMemo(() => getGoals(), [getGoals])
  const allHabits = useMemo(() => getHabits(), [getHabits])

  const weekDays = useMemo(() => {
    const start = startOfWeek(today, { weekStartsOn: 0 })
    const end = endOfWeek(today, { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [today])

  const affirmation = useMemo(() => {
    const idx = today.getDate() % affirmations.length
    return affirmations[idx]
  }, [today])

  const moon = useMemo(() => getMoonPhase(today), [today])

  const cyclePhase = useMemo(() => getCyclePhase(cycleDay), [cycleDay])

  const workoutToday = WORKOUT_SPLIT[today.getDay()]

  /* ── Persist ── */
  useEffect(() => {
    localStorage.setItem(`planner-water-${todayKey}`, String(waterCount))
  }, [waterCount, todayKey])

  useEffect(() => {
    localStorage.setItem(`planner-intention-${todayKey}`, intention)
  }, [intention, todayKey])

  useEffect(() => {
    localStorage.setItem(`planner-morning-${todayKey}`, JSON.stringify(morningRituals))
  }, [morningRituals, todayKey])

  useEffect(() => {
    localStorage.setItem(`planner-evening-${todayKey}`, JSON.stringify(eveningRituals))
  }, [eveningRituals, todayKey])

  useEffect(() => {
    localStorage.setItem(`planner-nonneg-${todayKey}`, JSON.stringify(nonNegotiables))
  }, [nonNegotiables, todayKey])

  useEffect(() => {
    localStorage.setItem('planner-cycle-day', String(cycleDay))
  }, [cycleDay])

  useEffect(() => {
    localStorage.setItem(`planner-meds-am-${todayKey}`, String(medsMorning))
  }, [medsMorning, todayKey])

  useEffect(() => {
    localStorage.setItem(`planner-meds-pm-${todayKey}`, String(medsEvening))
  }, [medsEvening, todayKey])

  /* ── Handlers ── */
  const toggleMorningRitual = (ritual: string) => {
    setMorningRituals((prev) =>
      prev.includes(ritual) ? prev.filter((r) => r !== ritual) : [...prev, ritual]
    )
  }

  const toggleEveningRitual = (ritual: string) => {
    setEveningRituals((prev) =>
      prev.includes(ritual) ? prev.filter((r) => r !== ritual) : [...prev, ritual]
    )
  }

  const toggleNonNeg = (key: string) => {
    setNonNegotiables((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const greeting = getGreeting()
  const pendingTasks = todayTasks.filter((t) => !t.completed).length
  const goalsProgress =
    allGoals.length > 0
      ? Math.round(allGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / allGoals.length)
      : 0

  return (
    <div className="space-y-8">
      {/* ── Elegant Hero (matching reference aesthetic) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="mb-12 text-center py-12 md:py-16"
      >
        <p 
          className="text-sm uppercase tracking-[0.2em] mb-4" 
          style={{ color: '#8B7D70' }}
        >
          Welcome to Your Year
        </p>
        <h1 
          className="font-display text-6xl md:text-7xl font-light mb-2" 
          style={{ 
            color: '#2C2420',
            fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
            letterSpacing: '0.02em',
          }}
        >
          {format(today, 'yyyy')}
        </h1>
        <p 
          className="text-xl md:text-2xl font-light mb-6" 
          style={{ 
            color: '#5C4D42',
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          A Year of Intention
        </p>
        <p 
          className="text-sm max-w-lg mx-auto leading-relaxed" 
          style={{ color: '#8B7D70' }}
        >
          Your complete personal operating system for mind, body, spirit, and abundance.
        </p>
        
        {/* Quote */}
        <div className="mt-8 pt-8 border-t" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <p 
            className="text-sm italic max-w-md mx-auto" 
            style={{ color: '#6B5E52' }}
          >
            "{affirmation}"
          </p>
        </div>
      </motion.div>

      {/* ── Cloud Sync Status ── */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="sage-card"
        >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--sage-700)' }}>
                ☁️ Cloud Sync
              </h4>
              {sbLoading ? (
                <span className="text-xs" style={{ color: 'var(--stone)' }}>Loading…</span>
              ) : sbError ? (
                <span className="text-xs" style={{ color: 'var(--terracotta-500)' }}>{sbError}</span>
              ) : (
                <span className="text-xs" style={{ color: 'var(--sage)' }}>Connected</span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg" style={{ background: 'var(--cream-dark)' }}>
                <p className="text-2xl font-playfair font-semibold" style={{ color: 'var(--sage-800)' }}>{habitsCount}</p>
                <p className="text-[0.625rem] uppercase tracking-wider mt-1" style={{ color: 'var(--stone)' }}>Active Habits</p>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ background: 'var(--cream-dark)' }}>
                <p className="text-2xl font-playfair font-semibold" style={{ color: 'var(--sage-800)' }}>{habitsCompletedToday}</p>
                <p className="text-[0.625rem] uppercase tracking-wider mt-1" style={{ color: 'var(--stone)' }}>Done Today</p>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ background: 'var(--cream-dark)' }}>
                <p className="text-2xl font-playfair font-semibold" style={{ color: todaysEntry ? 'var(--sage)' : 'var(--stone)' }}>{todaysEntry ? '✓' : '—'}</p>
                <p className="text-[0.625rem] uppercase tracking-wider mt-1" style={{ color: 'var(--stone)' }}>Daily Entry</p>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ background: 'var(--cream-dark)' }}>
                <p className="text-2xl font-playfair font-semibold" style={{ color: 'var(--sage-800)' }}>{notesCount}</p>
                <p className="text-[0.625rem] uppercase tracking-wider mt-1" style={{ color: 'var(--stone)' }}>Notes</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Top Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Sacred Intention */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="sage-card xl:col-span-2"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--gold)' }} />
              <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--sage-700)' }}>
                Today&apos;s Sacred Intention
              </h4>
            </div>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="What is your soul calling you to focus on today?"
              className="intention-textarea"
              rows={3}
            />
          </motion.div>

          {/* Moon & Cycle */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="sage-card"
          >
            <div className="flex items-center gap-2 mb-3">
              <Moon className="w-4 h-4" style={{ color: 'var(--terracotta-500)' }} />
              <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--sage-700)' }}>
                Moon & Cycle
              </h4>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{moon.emoji}</span>
              <div>
                <p className="font-inter text-sm font-medium" style={{ color: 'var(--sage-800)' }}>
                  {moon.name}
                </p>
                <p className="font-inter text-xs" style={{ color: 'var(--stone)' }}>
                  {moon.illumination}% illuminated
                </p>
              </div>
            </div>
            <div className="border-t pt-2 mt-2" style={{ borderColor: 'var(--sage-200)' }}>
              <div className="flex items-center justify-between">
                <span className="font-inter text-xs" style={{ color: 'var(--stone)' }}>Cycle Day</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCycleDay(Math.max(1, cycleDay - 1))}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ background: 'var(--sage-100)', color: 'var(--sage-600)' }}
                  >
                    -
                  </button>
                  <span className="font-inter text-sm font-medium w-6 text-center" style={{ color: 'var(--sage-700)' }}>
                    {cycleDay}
                  </span>
                  <button
                    onClick={() => setCycleDay(Math.min(35, cycleDay + 1))}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ background: 'var(--sage-100)', color: 'var(--sage-600)' }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-base">{cyclePhase.emoji}</span>
                <span className="font-caveat text-base" style={{ color: 'var(--terracotta-600)' }}>
                  {cyclePhase.name} Phase
                </span>
              </div>
            </div>
          </motion.div>

          {/* Body Temple Preview */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="sage-card cursor-pointer card-planner-hover"
            onClick={() => router.push('/planner/body-temple')}
          >
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4" style={{ color: 'var(--terracotta-500)' }} />
              <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--sage-700)' }}>
                Body Temple
              </h4>
            </div>
            <div className="text-center py-2">
              <p className="font-inter text-xs uppercase tracking-wider" style={{ color: 'var(--stone)' }}>
                Today&apos;s Workout
              </p>
              <p className="font-playfair text-3xl font-semibold mt-1" style={{ color: 'var(--sage-700)' }}>
                {workoutToday}
              </p>
              {workoutToday !== 'Rest' && (
                <p className="font-inter text-xs mt-1" style={{ color: 'var(--moss)' }}>
                  6-Day Split
                </p>
              )}
            </div>
            <div className="border-t pt-2 mt-2" style={{ borderColor: 'var(--sage-200)' }}>
              <div className="flex items-center justify-between text-xs font-inter" style={{ color: 'var(--stone)' }}>
                <span>Protein</span>
                <span style={{ color: 'var(--sage-600)' }}>120g</span>
              </div>
              <div className="w-full h-1.5 rounded-full mt-1" style={{ background: 'var(--sage-100)' }}>
                <div className="h-full rounded-full" style={{ width: '60%', background: 'var(--sage-400)' }} />
              </div>
              <div className="flex items-center justify-between text-xs font-inter mt-2" style={{ color: 'var(--stone)' }}>
                <span>Water</span>
                <span style={{ color: 'var(--sage-600)' }}>{waterCount}/8 glasses</span>
              </div>
              <div className="w-full h-1.5 rounded-full mt-1" style={{ background: 'var(--sage-100)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (waterCount / 8) * 100)}%`, background: 'var(--sage-400)' }}
                />
              </div>
              <div className="flex justify-center gap-1 mt-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation()
                      setWaterCount(i + 1 === waterCount ? i : i + 1)
                    }}
                    className="transition-all duration-200"
                  >
                    <Droplets
                      className="w-4 h-4"
                      style={{
                        color: i < waterCount ? 'var(--terracotta-400)' : 'var(--sage-200)',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Rituals & Medicine ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* Morning Rituals */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="sage-card"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-4 h-4" style={{ color: 'var(--gold)' }} />
              <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--sage-700)' }}>
                Morning Rituals
              </h4>
              <span className="ml-auto font-caveat text-sm" style={{ color: 'var(--gold)' }}>☀️</span>
            </div>
            <div className="space-y-2">
              {['Gentle stretch or yoga', 'Meditation / breathwork', 'Nourishing breakfast', 'Intention setting'].map(
                (ritual) => (
                  <label key={ritual} className="ritual-checkbox">
                    <input
                      type="checkbox"
                      checked={morningRituals.includes(ritual)}
                      onChange={() => toggleMorningRitual(ritual)}
                    />
                    <span className="font-inter text-sm">{ritual}</span>
                  </label>
                )
              )}
            </div>
            <div className="border-t mt-3 pt-3" style={{ borderColor: 'var(--sage-200)' }}>
              <p className="font-inter text-[0.625rem] uppercase tracking-widest mb-1" style={{ color: 'var(--stone)' }}>
                3-4 PM Anxiety Protocol
              </p>
              <p className="font-caveat text-sm" style={{ color: 'var(--terracotta-600)' }}>
                Grounding walk, herbal tea, box breathing
              </p>
            </div>
          </motion.div>

          {/* Medicine Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="sage-card"
          >
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4" style={{ color: 'var(--rose-deep)' }} />
              <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--sage-700)' }}>
                Medicine & Ritual
              </h4>
            </div>
            <div className="space-y-3">
              <div>
                <label className="ritual-checkbox mb-2">
                  <input type="checkbox" checked={medsMorning} onChange={() => setMedsMorning(!medsMorning)} />
                  <span className="font-inter text-sm">Morning Medications</span>
                </label>
                <label className="ritual-checkbox">
                  <input type="checkbox" checked={medsEvening} onChange={() => setMedsEvening(!medsEvening)} />
                  <span className="font-inter text-sm">Evening Medications</span>
                </label>
              </div>
              <div className="border-t pt-3" style={{ borderColor: 'var(--sage-200)' }}>
                <p className="font-inter text-[0.625rem] uppercase tracking-widest mb-2" style={{ color: 'var(--stone)' }}>
                  Evening Wind-Down
                </p>
                <div className="space-y-2">
                  {['Screen off by 9:30 PM', 'Herbal tea ritual', 'Journaling / gratitude', 'Bed by 11:30 PM'].map(
                    (ritual) => (
                      <label key={ritual} className="ritual-checkbox">
                        <input
                          type="checkbox"
                          checked={eveningRituals.includes(ritual)}
                          onChange={() => toggleEveningRitual(ritual)}
                        />
                        <span className="font-inter text-sm">{ritual}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Daily Non-Negotiables */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="sage-card"
          >
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4" style={{ color: 'var(--gold)' }} />
              <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--sage-700)' }}>
                Daily Non-Negotiables
              </h4>
            </div>
            <div className="space-y-2">
              {[
                { key: 'meds', label: 'Take medications', emoji: '💊' },
                { key: 'breakfast', label: 'Breakfast before meds', emoji: '🍳' },
                { key: 'movement', label: 'Movement / workout', emoji: '💪' },
                { key: 'dog', label: 'Dog care (Rocket)', emoji: '🐕' },
                { key: 'relationship', label: 'Relationship time', emoji: '💕' },
                { key: 'bedBy1130', label: 'Bed by 11:30 PM', emoji: '🌙' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => toggleNonNeg(item.key)}
                  className="w-full flex items-center gap-3 py-1.5 rounded-md px-2 transition-all duration-200 text-left"
                  style={{
                    background: nonNegotiables[item.key] ? 'var(--sage-50)' : 'transparent',
                  }}
                >
                  <span className="text-sm">{item.emoji}</span>
                  <span
                    className={`font-inter text-sm flex-1 ${
                      nonNegotiables[item.key] ? 'line-through opacity-50' : ''
                    }`}
                    style={{ color: 'var(--sage-700)' }}
                  >
                    {item.label}
                  </span>
                  {nonNegotiables[item.key] && <CheckCircle className="w-4 h-4" style={{ color: 'var(--moss)' }} />}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Health Tracking Preview ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="sage-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: 'var(--terracotta-500)' }} />
              <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--sage-700)' }}>
                Health Tracking
              </h4>
            </div>
            <button
              onClick={() => router.push('/planner/oura')}
              className="flex items-center gap-1 font-inter text-xs transition-colors hover:opacity-70"
              style={{ color: 'var(--terracotta-500)' }}
            >
              View Details <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Sleep', value: '--', sub: 'Score', icon: Moon },
              { label: 'Readiness', value: '--', sub: 'Score', icon: Heart },
              { label: 'Activity', value: '--', sub: 'Score', icon: Flame },
            ].map((item) => (
              <div key={item.label} className="text-center py-3 rounded-md" style={{ background: 'var(--sage-50)' }}>
                <item.icon className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--sage-400)' }} />
                <p className="font-playfair text-2xl font-semibold" style={{ color: 'var(--sage-700)' }}>
                  {item.value}
                </p>
                <p className="font-inter text-xs" style={{ color: 'var(--stone)' }}>
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
          <p className="font-inter text-xs text-center mt-3" style={{ color: 'var(--stone)' }}>
            Connect your Oura ring to see live data
          </p>
        </motion.div>

        {/* ── Quick Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Today\'s Events', value: todayEvents.length, icon: CalendarDays, color: 'var(--sage-500)' },
            { label: 'Pending Tasks', value: pendingTasks, icon: CheckCircle, color: 'var(--terracotta-500)' },
            { label: 'Goals Progress', value: `${goalsProgress}%`, icon: Target, color: 'var(--gold)' },
            { label: 'Habit Streak', value: `${(() => {
              if (!allHabits.length) return 0
              let streak = 0
              let checkDate = today
              while (streak < 365) {
                const key = dateKey(checkDate)
                const anyDone = allHabits.some((h: { history?: Record<string, boolean> }) => h.history?.[key])
                if (!anyDone) break
                streak++
                checkDate = new Date(checkDate.getTime() - 86400000)
              }
              return streak
            })()} days`, icon: Flame, color: 'var(--moss)' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="crystal-card text-center"
            >
              <stat.icon className="w-5 h-5 mx-auto mb-1" style={{ color: stat.color }} />
              <p className="font-playfair text-2xl font-semibold" style={{ color: 'var(--sage-700)' }}>
                {stat.value}
              </p>
              <p className="font-inter text-xs" style={{ color: 'var(--stone)' }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Navigation Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {navCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.05, duration: 0.4 }}
              onClick={() => router.push(card.path)}
              className="crystal-card cursor-pointer card-planner-hover"
            >
              <div className="flex items-start justify-between mb-2">
                <card.icon className="w-5 h-5" style={{ color: 'var(--sage-500)' }} />
                <span className="text-xs opacity-60">{card.sparkle}</span>
              </div>
              <h4 className="font-inter text-sm font-semibold" style={{ color: 'var(--sage-800)' }}>
                {card.title}
              </h4>
              <p className="font-inter text-xs mt-0.5" style={{ color: 'var(--stone)' }}>
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── This Week Preview ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="sage-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--sage-700)' }}>
              This Week
            </h4>
            <button
              onClick={() => router.push('/planner/weekly/current')}
              className="flex items-center gap-1 font-inter text-xs transition-colors hover:opacity-70"
              style={{ color: 'var(--terracotta-500)' }}
            >
              View Full Week <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date) => {
              const key = dateKey(date)
              const active = isToday(date)
              return (
                <motion.div
                  key={key}
                  whileHover={{ y: -2 }}
                  className="text-center py-3 rounded-md cursor-pointer transition-all duration-200"
                  style={{
                    background: active ? 'var(--sage-500)' : 'var(--sage-50)',
                  }}
                  onClick={() => router.push(`/planner/daily/${key}`)}
                >
                  <p
                    className="font-inter text-[0.625rem] uppercase"
                    style={{ color: active ? 'white' : 'var(--stone)' }}
                  >
                    {format(date, 'EEE')}
                  </p>
                  <p
                    className="font-playfair text-lg font-semibold mt-0.5"
                    style={{ color: active ? 'white' : 'var(--sage-700)' }}
                  >
                    {format(date, 'd')}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ── Bottom Spacing ── */}
        <div className="h-4" />
    </div>
  )
}
