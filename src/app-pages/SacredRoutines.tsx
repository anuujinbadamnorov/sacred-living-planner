import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import HeroSection from '@/components/HeroSection'
import {
  Sun,
  Moon,
  Star,
  Check,
  Heart,
  Clock,
  AlertTriangle,
  Footprints,
  Droplets,
  Wind,
  Sparkles,
  Shield,
  Coffee,
  Utensils,
  Pill,
  Dog,
  ShowerHead,
  Users,
  ClipboardList,
  Lightbulb,
  Zap,
  Timer,
  Smartphone,
  Home,
  BookOpen,
  MoonStar,
  Activity,
  RotateCcw,
  MessageCircle,
  TrendingUp,
  Flame,
} from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: EASE },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
}

/* ─────────────────────────── localStorage helpers ─────────────────────────── */

function useRoutineState<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])
  return [state, setState]
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

/* ─────────────────────────── Morning timeline data ─────────────────────────── */

interface TimelineStep {
  time: string
  label: string
  detail: string
  icon: React.ElementType
  habitStack?: string
}

const morningSteps: TimelineStep[] = [
  {
    time: '6:00 AM',
    label: 'Wake + Light Exposure',
    detail: '10-30 min of bright light',
    icon: Sun,
    habitStack: 'After I open my eyes \u2192 I will open the curtains',
  },
  {
    time: '6:30 AM',
    label: 'Hydrate',
    detail: '16-20 oz of water',
    icon: Droplets,
    habitStack: 'After I get out of bed \u2192 I will drink a full glass',
  },
  {
    time: '8:00 AM',
    label: 'Workout / Pilates Class',
    detail: 'Hardest part first — movement before the day begins',
    icon: Activity,
    habitStack: 'After I hydrate \u2192 I will move my body',
  },
  {
    time: '9:30 AM',
    label: 'Breakfast',
    detail: 'MUST eat before meds! 25-30g protein',
    icon: Utensils,
    habitStack: 'After I finish working out \u2192 I will prepare protein-rich food',
  },
  {
    time: '10:00 AM',
    label: 'Morning Medications',
    detail: 'Wellbutrin XL 150mg + Adderall 20mg Dose 1',
    icon: Pill,
    habitStack: 'After I finish eating \u2192 I will take my morning meds',
  },
  {
    time: '10:00 AM',
    label: 'Dog Care',
    detail: 'Rocket potty time \u2728',
    icon: Dog,
    habitStack: 'After my meds \u2192 I will take Rocket out',
  },
  {
    time: '9:00 AM',
    label: 'Adderall 20mg Dose 2',
    detail: 'Second dose of the morning',
    icon: Pill,
  },
  {
    time: '10:30 AM',
    label: 'Shower + Get Dressed',
    detail: 'Refresh and prepare for the day',
    icon: ShowerHead,
  },
  {
    time: '11:00 AM',
    label: 'Relationship Connection',
    detail: '10 min of quality time with partner',
    icon: Heart,
  },
  {
    time: '11:30 AM',
    label: 'Daily Planning Review',
    detail: 'Review priorities and set intentions',
    icon: ClipboardList,
  },
]

/* ─────────────────────────── Evening timeline data ─────────────────────────── */

interface EveningStep {
  time: string
  label: string
  detail: string
  icon: React.ElementType
}

const eveningSteps: EveningStep[] = [
  { time: '8:00 PM', label: 'Dim Lights', detail: 'Evening medications: Lexapro 15 MG', icon: Moon },
  { time: '8:30 PM', label: 'Wind-Down Activity', detail: 'Reading, stretching, or journaling', icon: BookOpen },
  { time: '9:00 PM', label: 'Home Reset', detail: '5 zones, 10-15 min tidy', icon: Home },
  { time: '9:30 PM', label: 'Prepare for Tomorrow', detail: 'Set out clothes, review schedule', icon: ClipboardList },
  { time: '10:30 PM', label: 'Magnesium Glycinate', detail: '400mg for sleep support', icon: Pill },
  { time: '11:00 PM', label: 'Hydroxyzine', detail: '50mg for sleep and anxiety', icon: MoonStar },
  { time: '11:30 PM', label: 'Sleep Target', detail: 'Rest your beautiful mind', icon: Star },
]

/* ─────────────────────────── Deep work checklist ─────────────────────────── */

const deepWorkItems = [
  { id: 'phone-away', label: 'Phone placed in another room', icon: Smartphone },
  { id: 'timer-set', label: 'Pomodoro timer: 50 min work / 10 min break', icon: Timer },
  { id: 'workspace', label: 'Workspace clear and ready', icon: Home },
  { id: 'hydration', label: 'Water bottle filled and nearby', icon: Droplets },
  { id: 'priority', label: 'Single priority task identified', icon: Lightbulb },
]

/* ─────────────────────────── Anxiety protocol steps ─────────────────────────── */

interface AnxietyStep {
  num: number
  label: string
  detail: string
  icon: React.ElementType
}

const anxietySteps: AnxietyStep[] = [
  {
    num: 1,
    label: '3:00 PM Alarm',
    detail: 'A gentle reminder that this window is approaching',
    icon: Clock,
  },
  {
    num: 2,
    label: 'Physical Movement',
    detail: 'Walk, stretch, or dance for 10 minutes',
    icon: Footprints,
  },
  {
    num: 3,
    label: 'Hydrate + Protein Snack',
    detail: 'Nourish your body through the transition',
    icon: Droplets,
  },
  {
    num: 4,
    label: 'Grounding Exercise',
    detail: 'Pick one technique that calls to you today',
    icon: Wind,
  },
  {
    num: 5,
    label: 'Low-Demand Transition',
    detail: '30-minute bridge task: something gentle',
    icon: Coffee,
  },
]

const groundingTechniques = [
  '5-4-3-2-1 senses technique',
  'Box breathing (4 counts in, hold, out, hold)',
  'Cold water face splash',
  'Body scan meditation',
  'Walk outside for 5 minutes',
]

/* ─────────────────────────── Non-negotiables ─────────────────────────── */

const nonNegotiables = [
  { id: 'nn-meds', label: 'Meds on time', icon: Pill },
  { id: 'nn-breakfast', label: 'Breakfast before meds', icon: Utensils },
  { id: 'nn-meal', label: 'One balanced meal', icon: Heart },
  { id: 'nn-movement', label: '10 min movement', icon: Activity },
  { id: 'nn-rocket', label: 'Rocket care', icon: Dog },
  { id: 'nn-relationship', label: '10 min relationship', icon: Users },
  { id: 'nn-sleep', label: 'Bed by 11:30 PM', icon: Moon },
]

/* ─────────────────────────── Weekly stats helpers ─────────────────────────── */

const daySectionCounts: Record<string, number> = {
  morning: morningSteps.length,
  evening: eveningSteps.length,
  deepwork: deepWorkItems.length,
  anxiety: anxietySteps.length,
  nn: nonNegotiables.length,
}

function getDayTotals(dateKey: string): { done: number; total: number } {
  let done = 0
  let total = 0
  for (const [suffix, count] of Object.entries(daySectionCounts)) {
    total += count
    try {
      const stored = localStorage.getItem(`planner-sacred-${dateKey}-${suffix}`)
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, boolean>
        done += Math.min(Object.values(parsed).filter(Boolean).length, count)
      }
    } catch {
      /* ignore malformed entries */
    }
  }
  return { done, total }
}

function getWeekDateKeys(): string[] {
  const now = new Date()
  const daysSinceMonday = (now.getDay() + 6) % 7
  const keys: string[] = []
  for (let i = daysSinceMonday; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    keys.push(d.toISOString().split('T')[0])
  }
  return keys
}

function getFullDayStreak(): number {
  let streak = 0
  const now = new Date()
  for (let i = 0; ; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const { done, total } = getDayTotals(d.toISOString().split('T')[0])
    if (total > 0 && done >= total) {
      streak++
    } else if (i === 0) {
      continue // today is still in progress — it doesn't break the streak
    } else {
      break
    }
  }
  return streak
}

/* ─────────────────────────── Component ─────────────────────────── */

export default function SacredRoutines() {
  const todayKey = getTodayKey()
  const lsKey = (suffix: string) => `planner-sacred-${todayKey}-${suffix}`

  const [morningChecked, setMorningChecked] = useRoutineState<Record<string, boolean>>(
    lsKey('morning'), {}
  )
  const [eveningChecked, setEveningChecked] = useRoutineState<Record<string, boolean>>(
    lsKey('evening'), {}
  )
  const [deepWorkChecked, setDeepWorkChecked] = useRoutineState<Record<string, boolean>>(
    lsKey('deepwork'), {}
  )
  const [anxietyChecked, setAnxietyChecked] = useRoutineState<Record<string, boolean>>(
    lsKey('anxiety'), {}
  )
  const [nnChecked, setNnChecked] = useRoutineState<Record<string, boolean>>(
    lsKey('nn'), {}
  )
  const [selectedGrounding, setSelectedGrounding] = useState<number | null>(null)

  const toggle = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
      id: string
    ) => {
      setter((prev) => ({ ...prev, [id]: !prev[id] }))
    },
    []
  )

  const morningProgress = Math.round(
    (morningSteps.filter((s) => morningChecked[s.label]).length / morningSteps.length) * 100
  )
  const eveningProgress = Math.round(
    (eveningSteps.filter((s) => eveningChecked[s.label]).length / eveningSteps.length) * 100
  )
  const nnProgress = Math.round(
    (nonNegotiables.filter((n) => nnChecked[n.id]).length / nonNegotiables.length) * 100
  )

  /* ── Overview stats ── */
  const [weekStats, setWeekStats] = useState({ weekPct: 0, streak: 0 })
  useEffect(() => {
    let done = 0
    let total = 0
    for (const key of getWeekDateKeys()) {
      const t = getDayTotals(key)
      done += t.done
      total += t.total
    }
    setWeekStats({
      weekPct: total > 0 ? Math.round((done / total) * 100) : 0,
      streak: getFullDayStreak(),
    })
  }, [morningChecked, eveningChecked, deepWorkChecked, anxietyChecked, nnChecked])

  const todayDone =
    morningSteps.filter((s) => morningChecked[s.label]).length +
    eveningSteps.filter((s) => eveningChecked[s.label]).length +
    deepWorkItems.filter((i) => deepWorkChecked[i.id]).length +
    anxietySteps.filter((s) => anxietyChecked[`anxiety-${s.num}`]).length +
    nonNegotiables.filter((n) => nnChecked[n.id]).length
  const todayTotal =
    morningSteps.length + eveningSteps.length + deepWorkItems.length + anxietySteps.length + nonNegotiables.length
  const onTrack = weekStats.weekPct >= 70

  return (
    <>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* ═══════════════ Hero ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative w-full h-56 rounded-lg overflow-hidden"
        >
          <img
            src="/sacred-routine.jpg"
            alt="Sacred morning light"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(246,242,235,0.92) 0%, rgba(246,242,235,0.75) 50%, rgba(201,169,110,0.25) 100%)',
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-2 mb-2"
            >
              <Sun className="w-5 h-5" style={{ color: '#C9A96E' }} />
              <span className="font-handwriting text-lg" style={{ color: 'var(--sage)' }}>Your daily rhythm</span>
              <Moon className="w-5 h-5" style={{ color: 'var(--lake)' }} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="font-display text-4xl lg:text-5xl mb-2"
              style={{ color: 'var(--espresso)' }}
            >
              Sacred Routines
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="font-handwriting text-xl"
              style={{ color: 'var(--espresso-light)' }}
            >
              Rivers, not walls &mdash; flowing with your energy
            </motion.p>
          </div>
        </motion.div>

        {/* ═══════════════ Overview ═══════════════ */}
        <motion.section variants={stagger} initial="initial" animate="animate">
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(122,139,101,0.15)' }}
            >
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--sage)' }} />
            </div>
            <div>
              <h2 className="font-display text-2xl" style={{ color: 'var(--espresso)' }}>Overview</h2>
              <p className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>Your week at a glance</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* This week's completion */}
            <motion.div variants={fadeUp} className="card-planner" style={{ padding: '1.25rem' }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                <span className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>This Week</span>
              </div>
              <p className="font-display text-3xl" style={{ color: 'var(--espresso)' }}>{weekStats.weekPct}%</p>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'var(--gold)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${weekStats.weekPct}%` }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>
            </motion.div>

            {/* Current streak */}
            <motion.div variants={fadeUp} className="card-planner" style={{ padding: '1.25rem' }}>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                <span className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>Current Streak</span>
              </div>
              <p className="font-display text-3xl" style={{ color: 'var(--espresso)' }}>
                {weekStats.streak}{' '}
                <span className="font-body text-sm" style={{ color: 'var(--espresso-muted)' }}>
                  {weekStats.streak === 1 ? 'day' : 'days'}
                </span>
              </p>
              <p className="font-body text-xs mt-1" style={{ color: 'var(--espresso-muted)' }}>
                All routines completed
              </p>
            </motion.div>

            {/* Today's progress */}
            <motion.div variants={fadeUp} className="card-planner" style={{ padding: '1.25rem' }}>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4" style={{ color: 'var(--sage)' }} />
                <span className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>Today&apos;s Tasks</span>
              </div>
              <p className="font-display text-3xl" style={{ color: 'var(--espresso)' }}>
                {todayDone}
                <span className="font-body text-sm" style={{ color: 'var(--espresso-muted)' }}>/{todayTotal}</span>
              </p>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'var(--sage)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0}%` }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>
            </motion.div>

            {/* On-track indicator */}
            <motion.div variants={fadeUp} className="card-planner" style={{ padding: '1.25rem' }}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4" style={{ color: onTrack ? 'var(--sage)' : 'var(--gold)' }} />
                <span className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>Status</span>
              </div>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs font-semibold"
                style={{
                  background: onTrack ? 'rgba(122,139,101,0.12)' : 'rgba(201,169,110,0.15)',
                  color: onTrack ? 'var(--sage)' : 'var(--gold)',
                }}
              >
                {onTrack ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {onTrack ? 'On track' : 'Needs attention'}
              </span>
              <p className="font-body text-xs mt-2" style={{ color: 'var(--espresso-muted)' }}>
                {onTrack ? 'Keep flowing — you&apos;re doing beautifully' : 'Be gentle, then begin again'}
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* ═══════════════ Morning Ritual Block ═══════════════ */}
        <motion.section variants={stagger} initial="initial" animate="animate">
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(201,169,110,0.15)' }}
            >
              <Sun className="w-5 h-5" style={{ color: '#C9A96E' }} />
            </div>
            <div>
              <h2 className="font-display text-2xl" style={{ color: 'var(--espresso)' }}>Morning Ritual</h2>
              <p className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>6:00 AM &ndash; 12:00 PM</p>
            </div>
            {/* Progress */}
            <div className="ml-auto flex items-center gap-2">
              <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: '#C9A96E' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${morningProgress}%` }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>
              <span className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>{morningProgress}%</span>
            </div>
          </motion.div>

          {/* Timeline */}
          <div className="relative pl-6 ml-4 space-y-0" style={{ borderLeftWidth: '2px', borderLeftColor: 'var(--border-light)' }}>
            {morningSteps.map((step, i) => {
              const checked = !!morningChecked[step.label]
              return (
                <motion.div
                  key={step.label + i}
                  variants={fadeUp}
                  className="relative pb-5"
                >
                  {/* Dot */}
                  <button
                    onClick={() => toggle(setMorningChecked, step.label)}
                    className="absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                    style={{
                      borderColor: checked ? 'var(--sage)' : 'var(--border-medium)',
                      backgroundColor: checked ? 'var(--sage)' : 'var(--cream)',
                    }}
                  >
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </button>

                  <div
                    className={`ml-4 -mt-1 transition-opacity duration-200 ${checked ? 'opacity-50' : 'opacity-100'}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body text-xs font-medium" style={{ color: 'var(--gold)' }}>
                        {step.time}
                      </span>
                      <span className="font-body text-sm font-semibold" style={{ color: 'var(--espresso)' }}>
                        {step.label}
                      </span>
                    </div>
                    <p className="font-body text-xs mt-0.5" style={{ color: 'var(--espresso-muted)' }}>{step.detail}</p>
                    {step.habitStack && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-handwriting" style={{ color: 'var(--sage)' }}>
                        <RotateCcw className="w-3 h-3" />
                        <span>{step.habitStack}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Minimum Viable Morning */}
          <motion.div
            variants={fadeUp}
            className="mt-4 p-4 rounded-lg border border-dashed"
            style={{
              background: 'var(--cream)',
              borderColor: 'rgba(201,169,110,0.33)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4" style={{ color: 'var(--gold)' }} />
              <span className="font-body text-sm font-semibold" style={{ color: 'var(--espresso)' }}>
                Minimum Viable Morning
              </span>
            </div>
            <p className="font-handwriting text-base" style={{ color: 'var(--espresso-light)' }}>
              If your energy is low today, that&apos;s okay. Just do these three things: take your
              meds, eat something nourishing, and drink water. Everything else is a bonus. You are
              enough.
            </p>
          </motion.div>
        </motion.section>

        {/* ═══════════════ Peak Performance Block ═══════════════ */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="rounded-xl p-8"
          style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(201,169,110,0.15)' }}
            >
              <Zap className="w-5 h-5" style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h2 className="font-display text-2xl" style={{ color: 'var(--espresso)' }}>Peak Performance</h2>
              <p className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>1:00 PM &ndash; 4:00 PM</p>
            </div>
          </motion.div>

          <p className="font-handwriting text-lg mb-4" style={{ color: 'var(--espresso-light)' }}>
            Your afternoon focus window. Set yourself up for success with this pre-work ritual.
          </p>

          <div className="space-y-3">
            {deepWorkItems.map((item) => {
              const checked = !!deepWorkChecked[item.id]
              const Icon = item.icon
              return (
                <motion.div
                  key={item.id}
                  variants={fadeUp}
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => toggle(setDeepWorkChecked, item.id)}
                >
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200"
                    style={{
                      borderColor: checked ? 'var(--gold)' : 'var(--border-medium)',
                      backgroundColor: checked ? 'var(--gold)' : 'transparent',
                    }}
                  >
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <Icon
                    className="w-4 h-4 transition-colors"
                    style={{ color: checked ? 'var(--gold)' : 'var(--espresso-muted)' }}
                  />
                  <span
                    className={`font-body text-sm transition-all ${checked ? 'line-through' : ''}`}
                    style={{ color: checked ? 'var(--espresso-muted)' : 'var(--espresso)' }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* ═══════════════ 3-4 PM Anxiety Protocol ═══════════════ */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="rounded-xl overflow-hidden"
          style={{
            background: 'var(--cream)',
            border: '1px solid var(--border-light)',
          }}
        >
          {/* Header */}
          <div className="p-6 pb-0">
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(201,160,160,0.15)' }}
              >
                <AlertTriangle className="w-5 h-5" style={{ color: 'var(--rose-soft)' }} />
              </motion.div>
              <div>
                <h2 className="font-display text-2xl" style={{ color: 'var(--espresso)' }}>3-4 PM Window</h2>
                <p className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>Anxiety Protocol &mdash; Your Safety Net</p>
              </div>
            </motion.div>

            {/* Warm alarm card */}
            <motion.div
              variants={fadeUp}
              className="rounded-lg p-4 mb-5 flex items-center gap-4"
              style={{
                background: 'rgba(201,160,160,0.08)',
                border: '1px solid rgba(201,160,160,0.2)',
              }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,160,160,0.15)' }}>
                <Clock className="w-6 h-6" style={{ color: 'var(--rose-soft)' }} />
              </div>
              <div>
                <p className="font-body text-sm font-semibold" style={{ color: 'var(--rose-soft)' }}>
                  This is your most vulnerable time of day
                </p>
                <p className="font-handwriting text-base mt-0.5" style={{ color: 'var(--espresso-light)' }}>
                  The transition between afternoon and evening can feel heavy. You&apos;ve been here
                  before, and you&apos;ve always made it through. This protocol is your warm blanket.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Protocol steps */}
          <div className="px-6 pb-2 space-y-3">
            {anxietySteps.map((step) => {
              const checked = !!anxietyChecked[`anxiety-${step.num}`]
              const Icon = step.icon
              return (
                <motion.div
                  key={step.num}
                  variants={fadeUp}
                  className="flex items-start gap-3 cursor-pointer group"
                  onClick={() => toggle(setAnxietyChecked, `anxiety-${step.num}`)}
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                    style={{
                      borderColor: checked ? 'var(--sage)' : 'var(--border-medium)',
                      backgroundColor: checked ? 'var(--sage)' : 'var(--cream)',
                    }}
                  >
                    {checked ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <span className="font-body text-[10px]" style={{ color: 'var(--espresso-muted)' }}>{step.num}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon
                        className="w-4 h-4"
                        style={{ color: checked ? 'var(--sage)' : 'var(--espresso-muted)' }}
                      />
                      <span
                        className={`font-body text-sm font-medium transition-all ${checked ? 'line-through' : ''}`}
                        style={{ color: checked ? 'var(--espresso-muted)' : 'var(--espresso)' }}
                      >
                        {step.label}
                      </span>
                    </div>
                    <p className="font-body text-xs mt-0.5 ml-6" style={{ color: 'var(--espresso-muted)' }}>{step.detail}</p>
                  </div>
                </motion.div>
              )
            })}

            {/* Grounding technique selector */}
            <motion.div variants={fadeUp} className="ml-9 mt-3 mb-4">
              <p className="font-body text-xs font-semibold mb-2" style={{ color: 'var(--espresso)' }}>
                Choose your grounding technique:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {groundingTechniques.map((tech, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedGrounding(idx === selectedGrounding ? null : idx)}
                    className="text-left px-3 py-2 rounded-md border transition-all duration-200 font-handwriting text-sm"
                    style={{
                      borderColor: selectedGrounding === idx ? 'var(--sage)' : 'var(--border-light)',
                      backgroundColor: selectedGrounding === idx ? 'rgba(122,139,101,0.08)' : 'var(--cream)',
                      color: 'var(--espresso)',
                    }}
                  >
                    {selectedGrounding === idx && (
                      <Check className="w-3 h-3 inline mr-1" style={{ color: 'var(--sage)' }} />
                    )}
                    {tech}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Affirmation */}
          <div
            className="px-6 py-5 flex items-center gap-3"
            style={{ background: 'rgba(122,139,101,0.08)' }}
          >
            <Heart className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--rose-soft)' }} />
            <p className="font-handwriting text-lg" style={{ color: 'var(--sage)' }}>
              &ldquo;This feeling is temporary. It will pass. You are safe, you are loved, and you
              are doing your best.&rdquo;
            </p>
          </div>
        </motion.section>

        {/* ═══════════════ Evening Wind-Down ═══════════════ */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(122,139,101,0.15)' }}
            >
              <Moon className="w-5 h-5" style={{ color: 'var(--sage)' }} />
            </div>
            <div>
              <h2 className="font-display text-2xl" style={{ color: 'var(--espresso)' }}>Evening Wind-Down</h2>
              <p className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>8:00 PM &ndash; 11:30 PM</p>
            </div>
            {/* Progress */}
            <div className="ml-auto flex items-center gap-2">
              <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'var(--sage)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${eveningProgress}%` }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>
              <span className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>{eveningProgress}%</span>
            </div>
          </motion.div>

          <div className="space-y-2">
            {eveningSteps.map((step, i) => {
              const checked = !!eveningChecked[step.label]
              const Icon = step.icon
              return (
                <motion.div
                  key={step.label + i}
                  variants={fadeUp}
                  className="flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer"
                  style={{
                    backgroundColor: checked ? 'rgba(122,139,101,0.04)' : 'var(--cream-dark)',
                    borderColor: checked ? 'rgba(122,139,101,0.2)' : 'var(--border-light)',
                  }}
                  onClick={() => toggle(setEveningChecked, step.label)}
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: checked ? 'var(--sage)' : 'var(--border-medium)',
                      backgroundColor: checked ? 'var(--sage)' : 'var(--cream)',
                    }}
                  >
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: checked ? 'var(--sage)' : 'var(--espresso-muted)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body text-xs font-medium" style={{ color: 'var(--sage)' }}>
                        {step.time}
                      </span>
                      <span
                        className={`font-body text-sm font-medium transition-all ${checked ? 'line-through' : ''}`}
                        style={{ color: checked ? 'var(--espresso-muted)' : 'var(--espresso)' }}
                      >
                        {step.label}
                      </span>
                    </div>
                    <p className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>{step.detail}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* ═══════════════ Non-Negotiables ═══════════════ */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="rounded-xl p-8"
          style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(201,160,160,0.15)' }}
            >
              <Sparkles className="w-5 h-5" style={{ color: 'var(--rose-soft)' }} />
            </div>
            <div>
              <h2 className="font-display text-2xl" style={{ color: 'var(--espresso)' }}>Daily Non-Negotiables</h2>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'var(--rose-soft)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${nnProgress}%` }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>
              <span className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>{nnProgress}%</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nonNegotiables.map((item) => {
              const checked = !!nnChecked[item.id]
              const Icon = item.icon
              return (
                <motion.div
                  key={item.id}
                  variants={fadeUp}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                  style={{
                    backgroundColor: checked ? 'rgba(122,139,101,0.07)' : 'var(--cream)',
                    borderColor: checked ? 'rgba(122,139,101,0.27)' : 'var(--border-light)',
                  }}
                  onClick={() => toggle(setNnChecked, item.id)}
                >
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
                    style={{
                      borderColor: checked ? 'var(--sage)' : 'var(--border-medium)',
                      backgroundColor: checked ? 'var(--sage)' : 'transparent',
                    }}
                  >
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: checked ? 'var(--sage)' : 'var(--espresso-muted)' }}
                  />
                  <span
                    className={`font-body text-sm transition-all ${checked ? 'line-through' : ''}`}
                    style={{ color: checked ? 'var(--espresso-muted)' : 'var(--espresso)' }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* ═══════════════ Bad Day Protocol ═══════════════ */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="rounded-xl p-8"
          style={{
            background: 'var(--cream)',
            border: '1px solid var(--border-light)',
          }}
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,160,160,0.15)' }}>
              <Heart className="w-5 h-5" style={{ color: 'var(--rose-soft)' }} />
            </div>
            <div>
              <h2 className="font-display text-2xl" style={{ color: 'var(--espresso)' }}>Bad Day Protocol</h2>
              <p className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>For the days that feel impossible</p>
            </div>
          </motion.div>

          {/* Self-compassion script */}
          <motion.div
            variants={fadeUp}
            className="mb-5 p-4 rounded-lg border"
            style={{ background: 'var(--cream-dark)', borderColor: 'rgba(201,160,160,0.3)' }}
          >
            <p className="font-handwriting text-xl mb-2" style={{ color: 'var(--rose-soft)' }}>
              &ldquo;I&apos;m having a hard day. That&apos;s okay. I&apos;m doing my best with the
              energy I have. My worth is not measured by my productivity. I am still worthy of love,
              care, and rest &mdash; especially today.&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3" style={{ color: 'var(--rose-soft)' }} />
              <span className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>Read this aloud. Slowly. Breathe.</span>
            </div>
          </motion.div>

          {/* Minimum day */}
          <motion.div variants={fadeUp} className="mb-4">
            <p className="font-body text-sm font-semibold mb-2" style={{ color: 'var(--espresso)' }}>
              Your Minimum Day:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { icon: Pill, label: 'Take your meds' },
                { icon: Utensils, label: 'Eat something' },
                { icon: Dog, label: 'Let Rocket out' },
                { icon: MessageCircle, label: 'Text your partner' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 p-3 rounded-lg border"
                  style={{ background: 'var(--cream-dark)', borderColor: 'var(--border-light)' }}
                >
                  <item.icon className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <span className="font-body text-sm" style={{ color: 'var(--espresso)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Never miss twice */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ background: 'rgba(201,169,110,0.1)' }}
          >
            <RotateCcw className="w-5 h-5" style={{ color: 'var(--gold)' }} />
            <div>
              <p className="font-body text-sm font-semibold" style={{ color: 'var(--espresso)' }}>
                The &ldquo;Never Miss Twice&rdquo; Rule
              </p>
              <p className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>
                One bad day is a stumble. Two in a row is a pattern. Be gentle with yourself today,
                and tomorrow, try again.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* ═══════════════ Bottom quote ═══════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center py-8"
        >
          <p className="font-handwriting text-2xl" style={{ color: 'var(--sage)' }}>
            &ldquo;You don&apos;t have to be perfect. You just have to show up.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-1 mt-2" style={{ color: 'var(--gold)' }}>
            <Star className="w-3 h-3" />
            <Sparkles className="w-3 h-3" />
            <Star className="w-3 h-3" />
          </div>
        </motion.div>
      </div>
    </>
  )
}
