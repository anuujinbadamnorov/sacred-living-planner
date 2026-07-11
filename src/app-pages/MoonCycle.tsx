import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Moon,
  Sun,
  Droplets,
  Heart,
  Activity,
  Wind,
  Utensils,
  Dumbbell,
  Brain,
  Bed,
  Clock,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CircleDot,
  Waves,
  Zap,
  Flower2,
  Sprout,
  Baby,
  CalendarDays,
  Check,
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

/* ──────────────────── localStorage helpers ──────────────────── */

function useLsState<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
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

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

/* ──────────────────── Cycle phase data ──────────────────── */

interface PhaseData {
  name: string
  subtitle: string
  days: string
  color: string
  colorLight: string
  colorText: string
  icon: React.ElementType
  training: string[]
  nutrition: string[]
  structure: string[]
  sleep: string[]
  affirmation: string
}

const phases: PhaseData[] = [
  {
    name: 'Menstrual',
    subtitle: 'Rest & Release',
    days: 'Days 1-5',
    color: '#9e2a3b',
    colorLight: '#9e2a3b15',
    colorText: '#9e2a3b',
    icon: Droplets,
    training: [
      'Complete rest OR gentle walking 20-30 min',
      'Restorative yoga',
      'Light Pilates',
    ],
    nutrition: [
      'Iron-rich foods: beef, lentils, spinach',
      'Vitamin C with iron meals',
      'Omega-3 for inflammation',
      'Magnesium-rich foods',
    ],
    structure: [
      'Wake around 6:00 AM (or when body naturally wakes)',
      'Gentle movement only',
      'Warm, grounding breakfast',
      'Light work only, 8-10 AM max',
      'Honor need for slower pace',
    ],
    sleep: [
      'May need extra 30-60 min of sleep',
      'Heating pad 30 min before bed',
      'Warm herbal tea',
      'No demanding evening activities',
    ],
    affirmation: 'I honor my body\'s need for rest',
  },
  {
    name: 'Follicular',
    subtitle: 'Build & Grow',
    days: 'Days 6-14',
    color: '#3d8b5a',
    colorLight: '#3d8b5a15',
    colorText: '#3d8b5a',
    icon: Sprout,
    training: [
      'Full body strength training',
      'Progressive overload',
      'Learn new skills and movements',
    ],
    nutrition: [
      'Higher carbs: 40-45% of calories',
      'Lean protein at each meal',
      'Cruciferous vegetables',
      'Fermented foods for gut health',
    ],
    structure: [
      'Peak focus window: 1-4 PM',
      'High cognitive work scheduled here',
      'Tackle complex projects',
      'Social confidence rising',
    ],
    sleep: [
      'Excellent sleep quality expected',
      'Bank extra sleep for luteal phase',
      'Maintain consistent bedtime',
    ],
    affirmation: 'I am growing stronger every day',
  },
  {
    name: 'Ovulatory',
    subtitle: 'Peak & Connect',
    days: 'Days 15-17',
    color: '#c9a96e',
    colorLight: '#c9a96e18',
    colorText: '#a08240',
    icon: Sun,
    training: [
      'PR attempts welcome',
      'Power training and plyometrics',
      'Maximum intensity sessions',
    ],
    nutrition: [
      'Moderate-high carbs: 35-40%',
      'Liver support foods',
      'Antioxidant-rich fruits and veggies',
      'Stay well hydrated',
    ],
    structure: [
      'Peak verbal fluency',
      'Schedule presentations and meetings',
      'Social activities feel effortless',
      'Natural charisma is high',
    ],
    sleep: [
      'Good quality sleep',
      'May naturally want to stay up later',
      'Limit late nights to 1-2 per cycle',
    ],
    affirmation: 'I shine at my brightest',
  },
  {
    name: 'Luteal',
    subtitle: 'Sustain & Reflect',
    days: 'Days 18-32',
    color: '#6b4c7a',
    colorLight: '#6b4c7a15',
    colorText: '#6b4c7a',
    icon: Moon,
    training: [
      'Early luteal (Days 18-23): Moderate strength',
      'Late luteal (Days 24-32): Light strength, Pilates, yoga, walking',
      'Focus on consistency over intensity',
    ],
    nutrition: [
      'Complex carbs for serotonin support',
      'Magnesium: dark chocolate, almonds',
      'Blood sugar stabilization',
      'Bloat reduction: sodium <2300mg',
      'Increase potassium-rich foods',
    ],
    structure: [
      '3-4 PM anxiety protocol: even more critical',
      'Detail-oriented tasks shine here',
      'Taper social commitments 50%',
      'Communicate needs clearly',
      'Delay important conversations if possible',
    ],
    sleep: [
      'Room temp: 64-65\u00b0F',
      'Magnesium glycinate 400mg',
      'L-theanine 200mg',
      'If wake at 3-4 AM: Don\'t check time',
      '4-7-8 breathing or body scan',
      'Small snack if hungry',
    ],
    affirmation: 'I am gentle with myself',
  },
]

/* ──────────────────── HRV data by phase ──────────────────── */

const hrvByPhase = [
  { phase: 'Menstrual', label: 'Typically lowest', trend: 'down' as const, desc: 'Inflammation is elevated. Rest is the priority.' },
  { phase: 'Follicular', label: 'Improving', trend: 'up' as const, desc: 'Estrogen rises, supporting recovery and adaptation.' },
  { phase: 'Ovulatory', label: 'Typically highest', trend: 'up' as const, desc: 'Peak hormonal milieu for performance and recovery.' },
  { phase: 'Luteal', label: 'Declining', trend: 'down' as const, desc: 'Progesterone rises. Decline is normal; watch for excessive drop.' },
]

/* ──────────────────── Symptom tracking fields ──────────────────── */

interface DailyCycleEntry {
  date: string
  energy: number
  mood: number
  anxiety: number
  sleep: number
  cramps: number
  bloating: number
  cravings: number
  flow: 'none' | 'light' | 'medium' | 'heavy'
  notes: string
}

const defaultCycleEntry = (date: string): DailyCycleEntry => ({
  date,
  energy: 0,
  mood: 0,
  anxiety: 0,
  sleep: 0,
  cramps: 0,
  bloating: 0,
  cravings: 0,
  flow: 'none',
  notes: '',
})

/* ──────────────────── Pregnancy prep data ──────────────────── */

const fertilitySigns = [
  { sign: 'Egg white cervical mucus', desc: 'Clear, stretchy, like raw egg white' },
  { sign: 'BBT rises 0.3-0.5\u00b0F', desc: 'Basal body temperature increase after ovulation' },
  { sign: 'Ovulation predictor kits', desc: 'Detect LH surge 24-36 hours before ovulation' },
  { sign: 'Fertile window', desc: '5-6 days (sperm can survive up to 5 days)' },
]

/* ──────────────────── Component ──────────────────── */

export default function MoonCycle() {
  const tk = todayKey()

  // Cycle settings (last period start date)
  const [lastPeriodDate, setLastPeriodDate] = useLsState<string>(
    'planner-cycle-last-period',
    '2026-03-15'
  )
  const [cycleLength, setCycleLength] = useLsState<number>('planner-cycle-length', 32)

  // Symptom tracking
  const [cycleEntries, setCycleEntries] = useLsState<Record<string, DailyCycleEntry>>(
    'planner-cycle-entries',
    {}
  )
  const todayEntry = cycleEntries[tk] || defaultCycleEntry(tk)

  const updateTodayEntry = useCallback(
    (updates: Partial<DailyCycleEntry>) => {
      setCycleEntries((prev) => ({
        ...prev,
        [tk]: { ...(prev[tk] || defaultCycleEntry(tk)), ...updates },
      }))
    },
    [tk, setCycleEntries]
  )

  // Calculate current cycle day
  const currentCycleDay = useMemo(() => {
    const lastPeriod = new Date(lastPeriodDate)
    const today = new Date(tk)
    const diffDays = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(1, (diffDays % cycleLength) + 1)
  }, [lastPeriodDate, cycleLength, tk])

  // Determine current phase
  const currentPhase = useMemo(() => {
    const day = currentCycleDay
    if (day <= 5) return 0 // Menstrual
    if (day <= 14) return 1 // Follicular
    if (day <= 17) return 2 // Ovulatory
    return 3 // Luteal
  }, [currentCycleDay])

  // Cycle wheel data
  const wheelDays = useMemo(() => {
    const days: { day: number; phase: number; isCurrent: boolean }[] = []
    for (let i = 1; i <= cycleLength; i++) {
      let phase = 3 // luteal default
      if (i <= 5) phase = 0
      else if (i <= 14) phase = 1
      else if (i <= 17) phase = 2
      days.push({ day: i, phase, isCurrent: i === currentCycleDay })
    }
    return days
  }, [cycleLength, currentCycleDay])

  // Prediction dates
  const nextPeriodDate = useMemo(() => {
    const d = new Date(lastPeriodDate)
    d.setDate(d.getDate() + cycleLength)
    return d.toISOString().split('T')[0]
  }, [lastPeriodDate, cycleLength])

  const ovulationDate = useMemo(() => {
    const d = new Date(lastPeriodDate)
    d.setDate(d.getDate() + 13) // Day 14
    return d.toISOString().split('T')[0]
  }, [lastPeriodDate])

  const fertileStart = useMemo(() => {
    const d = new Date(ovulationDate)
    d.setDate(d.getDate() - 5)
    return d.toISOString().split('T')[0]
  }, [ovulationDate])

  const phaseColors = ['#9e2a3b', '#3d8b5a', '#c9a96e', '#6b4c7a']
  const phaseNames = ['Menstrual', 'Follicular', 'Ovulatory', 'Luteal']

  // Trend data (last 14 days)
  const trendData = useMemo(() => {
    const days: { date: string; energy: number; mood: number; anxiety: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dk = d.toISOString().split('T')[0]
      const entry = cycleEntries[dk]
      days.push({
        date: dk,
        energy: entry?.energy || 0,
        mood: entry?.mood || 0,
        anxiety: entry?.anxiety || 0,
      })
    }
    return days
  }, [cycleEntries])

  return (
    <>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* ═══════════ Hero ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative w-full h-56 rounded-lg overflow-hidden"
        >
          <img
            src="/moon-cycle.jpg"
            alt="Moon and cycle"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(250,247,242,0.92) 0%, rgba(107,76,122,0.15) 50%, rgba(250,247,242,0.4) 100%)',
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mb-2"
            >
              <Moon className="w-5 h-5 text-[#6b4c7a]" />
              <span className="font-caveat text-lg text-[#7a8b65]">Living in flow</span>
              <Waves className="w-5 h-5 text-[#3d8b5a]" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-playfair text-4xl lg:text-5xl text-warm-900 mb-2"
            >
              Moon &amp; Cycle
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-caveat text-xl text-warm-600"
            >
              Working WITH your biology, not against it
            </motion.p>
          </div>
        </motion.div>

        {/* ═══════════ Cycle Tracker Wheel ═══════════ */}
        <motion.section variants={stagger} initial="initial" animate="animate" className="chic-card">
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: phaseColors[currentPhase] + '22' }}
            >
              <CircleDot className="w-5 h-5" style={{ color: phaseColors[currentPhase] }} />
            </div>
            <div>
              <h2 className="font-playfair text-2xl text-warm-900">Cycle Tracker</h2>
              <p className="font-inter text-xs text-warm-500">
                Day {currentCycleDay} of {cycleLength} &mdash;{' '}
                <span style={{ color: phaseColors[currentPhase] }}>
                  {phaseNames[currentPhase]} Phase
                </span>
              </p>
            </div>
          </motion.div>

          {/* Visual cycle wheel */}
          <motion.div variants={fadeUp} className="flex flex-col items-center mb-6">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Background ring segments */}
                {wheelDays.map((wd, i) => {
                  const anglePerDay = 360 / cycleLength
                  const startAngle = i * anglePerDay - 90
                  const endAngle = (i + 1) * anglePerDay - 90 - 1 // gap
                  const startRad = (startAngle * Math.PI) / 180
                  const endRad = (endAngle * Math.PI) / 180
                  const innerR = 55
                  const outerR = 75
                  const x1 = 100 + innerR * Math.cos(startRad)
                  const y1 = 100 + innerR * Math.sin(startRad)
                  const x2 = 100 + outerR * Math.cos(startRad)
                  const y2 = 100 + outerR * Math.sin(startRad)
                  const x3 = 100 + outerR * Math.cos(endRad)
                  const y3 = 100 + outerR * Math.sin(endRad)
                  const x4 = 100 + innerR * Math.cos(endRad)
                  const y4 = 100 + innerR * Math.sin(endRad)
                  return (
                    <path
                      key={i}
                      d={`M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1}`}
                      fill={phaseColors[wd.phase] + (wd.isCurrent ? '' : '60')}
                      stroke="white"
                      strokeWidth={wd.isCurrent ? 2 : 0.5}
                      opacity={wd.isCurrent ? 1 : 0.7}
                    />
                  )
                })}
                {/* Center info */}
                <circle cx="100" cy="100" r="44" fill="white" stroke="#e8e2da" strokeWidth="1" />
                <text x="100" y="92" textAnchor="middle" className="fill-warm-800" style={{ fontSize: '10px', fontFamily: 'Inter' }}>
                  Day
                </text>
                <text
                  x="100"
                  y="112"
                  textAnchor="middle"
                  style={{ fontSize: '22px', fontWeight: 600, fill: phaseColors[currentPhase], fontFamily: 'Playfair Display' }}
                >
                  {currentCycleDay}
                </text>
              </svg>
              {/* Phase legend around the wheel */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="mt-20 pt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
                  {phases.map((p) => (
                    <div key={p.name} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="font-inter text-[10px] text-warm-500">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Date inputs and predictions */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg border border-warm-200 bg-warm-50/50">
              <label className="font-inter text-[10px] text-warm-500 uppercase tracking-wider block mb-1">
                Last Period Started
              </label>
              <input
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="font-inter text-sm text-warm-800 bg-transparent border-none w-full outline-none"
              />
            </div>
            <div className="p-3 rounded-lg border border-warm-200 bg-warm-50/50">
              <label className="font-inter text-[10px] text-warm-500 uppercase tracking-wider block mb-1">
                Cycle Length
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCycleLength((l) => Math.max(21, l - 1))}
                  className="w-6 h-6 rounded bg-warm-200 text-warm-600 font-inter text-xs"
                >
                  -
                </button>
                <span className="font-inter text-sm text-warm-800 w-6 text-center">
                  {cycleLength}
                </span>
                <button
                  onClick={() => setCycleLength((l) => Math.min(40, l + 1))}
                  className="w-6 h-6 rounded bg-warm-200 text-warm-600 font-inter text-xs"
                >
                  +
                </button>
                <span className="font-inter text-xs text-warm-500">days</span>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-warm-200 bg-warm-50/50">
              <label className="font-inter text-[10px] text-warm-500 uppercase tracking-wider block mb-1">
                Next Period
              </label>
              <p className="font-inter text-sm text-warm-800">{nextPeriodDate}</p>
            </div>
          </motion.div>

          {/* Ovulation & Fertile Window */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border flex items-center gap-3" style={{ borderColor: '#c9a96e55', background: '#c9a96e0a' }}>
              <Zap className="w-5 h-5 text-[#c9a96e]" />
              <div>
                <p className="font-inter text-xs text-warm-500">Predicted Ovulation</p>
                <p className="font-inter text-sm font-semibold text-warm-800">{ovulationDate}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg border flex items-center gap-3" style={{ borderColor: '#6b4c7a55', background: '#6b4c7a0a' }}>
              <Flower2 className="w-5 h-5 text-[#6b4c7a]" />
              <div>
                <p className="font-inter text-xs text-warm-500">Fertile Window</p>
                <p className="font-inter text-sm font-semibold text-warm-800">
                  {fertileStart} &ndash; {ovulationDate}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ═══════════ Four Phase Framework ═══════════ */}
        {phases.map((phase, phaseIdx) => {
          const isCurrentPhase = phaseIdx === currentPhase
          const PhaseIcon = phase.icon
          return (
            <motion.section
              key={phase.name}
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="rounded-xl overflow-hidden"
              style={{
                background: 'white',
                border: `2px solid ${isCurrentPhase ? phase.color + '66' : '#e8e2da'}`,
                boxShadow: isCurrentPhase ? `0 4px 16px ${phase.color}15` : undefined,
              }}
            >
              {/* Phase header */}
              <div className="p-5" style={{ background: phase.colorLight }}>
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: phase.color + '22' }}
                  >
                    <PhaseIcon className="w-5 h-5" style={{ color: phase.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-playfair text-xl text-warm-900">{phase.name}</h2>
                      <span
                        className="font-caveat text-base"
                        style={{ color: phase.color }}
                      >
                        {phase.subtitle}
                      </span>
                    </div>
                    <p className="font-inter text-xs text-warm-500">
                      {phase.days}
                      {isCurrentPhase && (
                        <span
                          className="ml-2 font-inter text-xs font-semibold"
                          style={{ color: phase.color }}
                        >
                          &larr; You are here (Day {currentCycleDay})
                        </span>
                      )}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Phase content */}
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Training */}
                  <motion.div variants={fadeUp}>
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell className="w-4 h-4 text-warm-500" />
                      <h3 className="font-inter text-sm font-semibold text-warm-700">
                        Training
                      </h3>
                    </div>
                    <ul className="space-y-1">
                      {phase.training.map((t, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-warm-300 mt-0.5 flex-shrink-0" />
                          <span className="font-inter text-sm text-warm-600">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Nutrition */}
                  <motion.div variants={fadeUp}>
                    <div className="flex items-center gap-2 mb-2">
                      <Utensils className="w-4 h-4 text-warm-500" />
                      <h3 className="font-inter text-sm font-semibold text-warm-700">
                        Nutrition
                      </h3>
                    </div>
                    <ul className="space-y-1">
                      {phase.nutrition.map((n, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-warm-300 mt-0.5 flex-shrink-0" />
                          <span className="font-inter text-sm text-warm-600">{n}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Daily Structure */}
                  <motion.div variants={fadeUp}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-warm-500" />
                      <h3 className="font-inter text-sm font-semibold text-warm-700">
                        Daily Structure
                      </h3>
                    </div>
                    <ul className="space-y-1">
                      {phase.structure.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-warm-300 mt-0.5 flex-shrink-0" />
                          <span className="font-inter text-sm text-warm-600">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Sleep */}
                  <motion.div variants={fadeUp}>
                    <div className="flex items-center gap-2 mb-2">
                      <Bed className="w-4 h-4 text-warm-500" />
                      <h3 className="font-inter text-sm font-semibold text-warm-700">
                        Sleep
                      </h3>
                    </div>
                    <ul className="space-y-1">
                      {phase.sleep.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-warm-300 mt-0.5 flex-shrink-0" />
                          <span className="font-inter text-sm text-warm-600">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {/* Late luteal special section */}
                {phaseIdx === 3 && (
                  <motion.div
                    variants={fadeUp}
                    className="mt-4 p-4 rounded-lg border-2 border-dashed"
                    style={{ borderColor: '#6b4c7a44', background: '#6b4c7a08' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-[#6b4c7a]" />
                      <h3 className="font-inter text-sm font-semibold text-[#6b4c7a]">
                        Late Luteal / PMS Window (Days 24-32)
                      </h3>
                    </div>
                    <p className="font-caveat text-base text-warm-600 mb-2">
                      This is the most tender time of your cycle. The 3-4 PM anxiety protocol is
                      especially important here. Your body is doing complex work &mdash; be
                      extraordinarily gentle with yourself.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-start gap-2">
                        <Moon className="w-3 h-3 text-warm-400 mt-0.5" />
                        <span className="font-inter text-warm-600">
                          Sleep protocol: 64-65&deg;F room, magnesium, L-theanine
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Wind className="w-3 h-3 text-warm-400 mt-0.5" />
                        <span className="font-inter text-warm-600">
                          If you wake at 3-4 AM: don&apos;t check the time, try 4-7-8 breathing
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Heart className="w-3 h-3 text-warm-400 mt-0.5" />
                        <span className="font-inter text-warm-600">
                          Reduce social commitments by 50%
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Brain className="w-3 h-3 text-warm-400 mt-0.5" />
                        <span className="font-inter text-warm-600">
                          Delay important conversations if possible
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Affirmation */}
                <motion.div
                  variants={fadeUp}
                  className="mt-4 flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: phase.colorLight }}
                >
                  <Heart className="w-4 h-4 flex-shrink-0" style={{ color: phase.color }} />
                  <p className="font-caveat text-lg" style={{ color: phase.colorText }}>
                    &ldquo;{phase.affirmation}&rdquo;
                  </p>
                </motion.div>
              </div>
            </motion.section>
          )
        })}

        {/* ═══════════ Symptom Tracker ═══════════ */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="chic-card"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h2 className="font-playfair text-2xl text-warm-900">Symptom Tracker</h2>
              <p className="font-inter text-xs text-warm-500">Log today &mdash; spot your patterns</p>
            </div>
          </motion.div>

          {/* Sliders grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Energy', value: todayEntry.energy, setter: (v: number) => updateTodayEntry({ energy: v }), icon: Zap, color: '#c9a96e' },
              { label: 'Mood', value: todayEntry.mood, setter: (v: number) => updateTodayEntry({ mood: v }), icon: Heart, color: '#e85d78' },
              { label: 'Anxiety', value: todayEntry.anxiety, setter: (v: number) => updateTodayEntry({ anxiety: v }), icon: AlertTriangle, color: '#e0744c' },
              { label: 'Sleep (hrs)', value: todayEntry.sleep, setter: (v: number) => updateTodayEntry({ sleep: v }), icon: Bed, color: '#6b4c7a', max: 12 },
              { label: 'Cramps', value: todayEntry.cramps, setter: (v: number) => updateTodayEntry({ cramps: v }), icon: Waves, color: '#9e2a3b' },
              { label: 'Bloating', value: todayEntry.bloating, setter: (v: number) => updateTodayEntry({ bloating: v }), icon: CircleDot, color: '#7a8b65' },
              { label: 'Cravings', value: todayEntry.cravings, setter: (v: number) => updateTodayEntry({ cravings: v }), icon: Utensils, color: '#8b6f5e' },
            ].map((field) => {
              const Icon = field.icon
              const maxVal = field.max || 10
              return (
                <div key={field.label} className="p-3 rounded-lg border border-warm-200 bg-warm-50/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: field.color }} />
                    <span className="font-inter text-xs font-semibold text-warm-700">
                      {field.label}
                    </span>
                    <span className="font-inter text-sm font-semibold text-warm-800 ml-auto">
                      {field.value}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxVal}
                    value={field.value}
                    onChange={(e) => field.setter(parseInt(e.target.value))}
                    className="w-full accent-rose-500"
                    style={{ accentColor: field.color }}
                  />
                  <div className="flex justify-between mt-0.5">
                    <span className="font-inter text-[9px] text-warm-400">None</span>
                    <span className="font-inter text-[9px] text-warm-400">{maxVal === 12 ? '12 hrs' : 'Intense'}</span>
                  </div>
                </div>
              )
            })}

            {/* Flow selector */}
            <div className="p-3 rounded-lg border border-warm-200 bg-warm-50/30">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-[#9e2a3b]" />
                <span className="font-inter text-xs font-semibold text-warm-700">
                  Flow
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['none', 'light', 'medium', 'heavy'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => updateTodayEntry({ flow: f })}
                    className="px-2 py-1.5 rounded text-xs font-inter capitalize transition-all border"
                    style={{
                      backgroundColor: todayEntry.flow === f ? '#9e2a3b' : 'white',
                      color: todayEntry.flow === f ? 'white' : '#5e5245',
                      borderColor: todayEntry.flow === f ? '#9e2a3b' : '#e8e2da',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div variants={fadeUp} className="mb-5">
            <label className="font-inter text-xs font-semibold text-warm-700 mb-1 block">
              Notes for today
            </label>
            <textarea
              value={todayEntry.notes}
              onChange={(e) => updateTodayEntry({ notes: e.target.value })}
              placeholder="How does your body feel today? Any observations..."
              className="planner-input w-full p-3 rounded-lg border border-warm-200 bg-white/70 min-h-[60px] text-sm"
            />
          </motion.div>

          {/* Trend mini-chart */}
          <motion.div variants={fadeUp}>
            <p className="font-inter text-xs font-semibold text-warm-700 mb-3">
              14-Day Energy &amp; Mood Trend
            </p>
            <div className="flex items-end gap-1 h-20">
              {trendData.map((day, i) => {
                const hasData = day.energy > 0 || day.mood > 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-px">
                    <div className="w-full flex justify-center gap-px">
                      <div
                        className="w-full rounded-t-sm"
                        style={{
                          height: hasData ? `${(day.energy / 10) * 28}px` : '2px',
                          backgroundColor: '#c9a96e',
                          opacity: hasData ? 1 : 0.2,
                        }}
                      />
                    </div>
                    <div className="w-full flex justify-center gap-px">
                      <div
                        className="w-full rounded-t-sm"
                        style={{
                          height: hasData ? `${(day.mood / 10) * 28}px` : '2px',
                          backgroundColor: '#e85d78',
                          opacity: hasData ? 1 : 0.2,
                        }}
                      />
                    </div>
                    <span className="font-inter text-[7px] text-warm-400">
                      {new Date(day.date).getDate()}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#c9a96e]" />
                <span className="font-inter text-[10px] text-warm-500">Energy</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#e85d78]" />
                <span className="font-inter text-[10px] text-warm-500">Mood</span>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ═══════════ HRV by Phase ═══════════ */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="card-planner"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h2 className="font-playfair text-2xl text-warm-900">HRV by Phase</h2>
              <p className="font-inter text-xs text-warm-500">
                Heart rate variability patterns across your cycle
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {hrvByPhase.map((h) => {
              const TrendIcon = h.trend === 'up' ? TrendingUp : TrendingDown
              return (
                <motion.div
                  key={h.phase}
                  variants={fadeUp}
                  className="p-4 rounded-lg border"
                  style={{
                    borderColor: h.phase === phaseNames[currentPhase] ? phaseColors[phases.findIndex(p => p.name === h.phase)] + '55' : '#e8e2da',
                    background: h.phase === phaseNames[currentPhase] ? phaseColors[phases.findIndex(p => p.name === h.phase)] + '08' : 'white',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendIcon
                      className="w-4 h-4"
                      style={{
                        color: h.trend === 'up' ? '#3d8b5a' : '#9e2a3b',
                      }}
                    />
                    <span className="font-inter text-sm font-semibold text-warm-800">
                      {h.phase}
                    </span>
                  </div>
                  <p className="font-inter text-xs text-warm-500 mb-1">{h.label}</p>
                  <p className="font-inter text-xs text-warm-400">{h.desc}</p>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            variants={fadeUp}
            className="mt-4 p-3 rounded-lg flex items-center gap-3"
            style={{ background: 'linear-gradient(90deg, #6b4c7a10, transparent)' }}
          >
            <Heart className="w-4 h-4 text-[#6b4c7a]" />
            <p className="font-caveat text-base text-warm-600">
              Your HRV is a window into your nervous system. Be gentle with the data &mdash; it
              fluctuates, and that&apos;s perfectly okay.
            </p>
          </motion.div>
        </motion.section>

        {/* ═══════════ Pregnancy Prep Integration ═══════════ */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #fdf2f4, #f5efe6)',
            border: '1px solid #e8e2da',
          }}
        >
          <div className="p-6">
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Baby className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h2 className="font-playfair text-2xl text-warm-900">Pregnancy Prep</h2>
                <p className="font-inter text-xs text-warm-500">Fertility awareness and readiness</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fertile window calculator */}
              <motion.div
                variants={fadeUp}
                className="p-4 rounded-lg bg-white/70 border border-rose-200/50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Flower2 className="w-4 h-4 text-[#c9a96e]" />
                  <h3 className="font-inter text-sm font-semibold text-warm-800">
                    Fertility Awareness
                  </h3>
                </div>
                <div className="space-y-2">
                  {fertilitySigns.map((fs, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-[#7a8b65] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-inter text-sm text-warm-700">{fs.sign}</p>
                        <p className="font-inter text-xs text-warm-500">{fs.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Current status */}
              <motion.div
                variants={fadeUp}
                className="p-4 rounded-lg bg-white/70 border border-rose-200/50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="w-4 h-4 text-[#6b4c7a]" />
                  <h3 className="font-inter text-sm font-semibold text-warm-800">
                    Current Cycle Status
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-inter text-xs text-warm-500">Cycle Day</span>
                    <span className="font-inter text-sm font-semibold text-warm-800">
                      {currentCycleDay} / {cycleLength}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-xs text-warm-500">Current Phase</span>
                    <span
                      className="font-inter text-sm font-semibold"
                      style={{ color: phaseColors[currentPhase] }}
                    >
                      {phaseNames[currentPhase]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-xs text-warm-500">Ovulation (est.)</span>
                    <span className="font-inter text-sm font-semibold text-warm-800">
                      {ovulationDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-xs text-warm-500">Fertile Window</span>
                    <span className="font-inter text-sm font-semibold text-[#6b4c7a]">
                      {fertileStart} &ndash; {ovulationDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-xs text-warm-500">Next Period (est.)</span>
                    <span className="font-inter text-sm font-semibold text-warm-800">
                      {nextPeriodDate}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Gentle note */}
            <motion.div
              variants={fadeUp}
              className="mt-4 p-3 rounded-lg flex items-center gap-3"
              style={{ background: 'linear-gradient(90deg, #c9a96e15, transparent)' }}
            >
              <Sparkles className="w-4 h-4 text-[#c9a96e]" />
              <p className="font-caveat text-base text-warm-600">
                However your journey unfolds &mdash; pregnancy now, pregnancy later, or pregnancy
                never &mdash; your body is wise and worthy of deep care.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* ═══════════ Bottom quote ═══════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center py-8"
        >
          <p className="font-caveat text-2xl text-[#6b4c7a]">
            &ldquo;Listen to your body. It whispers before it screams.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Moon className="w-3 h-3 text-[#6b4c7a]" />
            <Sparkles className="w-3 h-3 text-[#c9a96e]" />
            <Sun className="w-3 h-3 text-[#c9a96e]" />
          </div>
        </motion.div>
      </div>
    </>
  )
}
