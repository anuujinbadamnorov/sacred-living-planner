import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePlanner } from '@/hooks/usePlanner'
import { useThemeStore } from '@/stores/theme'
import { useTheme } from '@/components/theme/ThemeProvider'
import { format, addDays } from 'date-fns'
import {
  Sun,
  Moon,
  Leaf,
  Heart,
  TrendingUp,
  TrendingDown,
  Activity,
  Footprints,
  Zap,
  Sparkles,
  ChevronRight,
  Wind,
  Waves,
  LayoutList,
  Pill,
  Droplets,
  Sunrise,
  Sunset,
  CloudRain,
  BookOpen,
  Dumbbell,
  Utensils,
  GlassWater,
  Music,
  Flame,
  Eye,
  Check,
  NotebookPen,
  Settings,
} from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

/* ─────────────────────── helpers ─────────────────────── */

function getMoonPhase(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const c = Math.floor((year - 1900) / 100)
  const e = Math.floor((year % 100) * 5 / 4) + Math.floor((month + 9) % 12 * 306 / 10) + day - 1
  const a = (e - 2) % 29.53059
  const phase = a < 0 ? a + 29.53059 : a
  if (phase < 1) return 'New Moon'
  if (phase < 7) return 'Waxing Crescent'
  if (phase < 8) return 'First Quarter'
  if (phase < 14) return 'Waxing Gibbous'
  if (phase < 16) return 'Full Moon'
  if (phase < 22) return 'Waning Gibbous'
  if (phase < 23) return 'Last Quarter'
  return 'Waning Crescent'
}

function getCyclePhase(date: Date): string {
  const day = date.getDate()
  if (day <= 5) return 'Menstrual'
  if (day <= 13) return 'Follicular'
  if (day <= 16) return 'Ovulation'
  if (day <= 21) return 'Luteal'
  return 'Luteal'
}

function getSeason(date: Date): string {
  const month = date.getMonth()
  if (month >= 2 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  if (month >= 8 && month <= 10) return 'Autumn'
  return 'Winter'
}

function getGreeting(date: Date): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good Morning, Love'
  if (hour < 17) return 'Good Afternoon, Love'
  return 'Good Evening, Love'
}

const RITUALS = [
  { time: '5:30 AM', label: 'Wake & Hydrate', icon: Droplets, done: false },
  { time: '6:00 AM', label: 'Sacred Movement', icon: Dumbbell, done: false },
  { time: '7:30 AM', label: 'Nourishing Breakfast', icon: Utensils, done: false },
  { time: '8:30 AM', label: 'Morning Ritual', icon: Sunrise, done: false },
  { time: '12:00 PM', label: 'Midday Pause', icon: Sun, done: false },
  { time: '6:00 PM', label: 'Evening Meal', icon: Flame, done: false },
  { time: '8:00 PM', label: 'Wind Down', icon: Moon, done: false },
  { time: '9:30 PM', label: 'Sleep Prep', icon: Eye, done: false },
]

const MEDICINES = [
  { name: 'Wellbutrin', dose: '150mg', am: true, pm: false, amTaken: false, pmTaken: false },
  { name: 'Adderall', dose: '10mg', am: true, pm: false, amTaken: false, pmTaken: false },
  { name: 'Magnesium', dose: '400mg', am: false, pm: true, amTaken: false, pmTaken: false },
  { name: 'Melatonin', dose: '3mg', am: false, pm: true, amTaken: false, pmTaken: false },
]

const NON_NEGOTIABLES = [
  { label: 'Morning ritual', done: false },
  { label: 'Movement', done: false },
  { label: 'Nourishing meals', done: false },
  { label: 'Hydration (8 glasses)', done: false },
  { label: 'Evening wind down', done: false },
]

const ANXIETY_PROTOCOL = [
  '5-4-3-2-1 grounding technique',
  'Box breathing (4-4-4-4)',
  'Cold water on wrists',
  'Step outside for 5 minutes',
  'Gentle neck stretches',
]

const AFFIRMATIONS = [
  'I am exactly where I need to be.',
  'I trust the rhythm of my body.',
  'Every breath is a return to center.',
  'I am nourished, I am whole, I am here.',
  'Today, I choose peace over perfection.',
]

/* ── Progress Ring ── */
function ProgressRing({ progress, size = 120, stroke = 10, color = '#7A8B65' }: {
  progress: number; size?: number; stroke?: number; color?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="var(--border-light)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: EASE }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-semibold" style={{ color: 'var(--espresso)' }}>{progress}%</span>
        <span className="text-[0.6rem] uppercase tracking-wider" style={{ color: 'var(--espresso-muted)' }}>Done</span>
      </div>
    </div>
  )
}

/* ── Health Preview Card ── */
function HealthPreviewCard({
  label, value, unit, icon: Icon, color, trend,
}: {
  label: string; value: string | number; unit: string; icon: React.ElementType; color: string; trend?: number
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--cream)' }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[0.65rem] uppercase tracking-wider font-body" style={{ color: 'var(--espresso-muted)' }}>{label}</p>
        <p className="font-body text-sm font-semibold" style={{ color: 'var(--espresso)' }}>
          {value} <span className="text-xs font-normal" style={{ color: 'var(--espresso-muted)' }}>{unit}</span>
        </p>
      </div>
      {trend !== undefined && (
        <span className="flex items-center gap-0.5 text-xs font-body">
          {trend >= 0 ? (
            <TrendingUp className="w-3 h-3" style={{ color: 'var(--sage)' }} />
          ) : (
            <TrendingDown className="w-3 h-3" style={{ color: 'var(--rose-soft)' }} />
          )}
          <span style={{ color: trend >= 0 ? 'var(--sage)' : 'var(--rose-soft)' }}>{trend >= 0 ? '+' : ''}{trend}</span>
        </span>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*                    DASHBOARD PAGE                       */
/* ═══════════════════════════════════════════════════════ */

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const { currentThemeId } = useThemeStore()
  const { theme } = useTheme()
  const [today, setToday] = useState<Date | null>(null)
  useEffect(() => { setToday(new Date()) }, [])
  const [rituals, setRituals] = useState(RITUALS)
  const [medicines, setMedicines] = useState(MEDICINES)
  const [nonNegs, setNonNegs] = useState(NON_NEGOTIABLES)
  const [intention, setIntention] = useState('')
  const [showAnxiety, setShowAnxiety] = useState(false)
  const [affirmation, setAffirmation] = useState(AFFIRMATIONS[0])
  useEffect(() => {
    setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)])
  }, [])
  const [healthData, setHealthData] = useState({
    sleep: 78, readiness: 82, activity: 65, steps: 8432, hrv: 65, restingHR: 52,
  })
  const [ouraToken, setOuraToken] = useState('')
  const [ouraConnected, setOuraConnected] = useState(false)
  const { getStorageItem } = usePlanner()
  const todayDate = today ?? new Date()
  
  /* Load saved data */
  useEffect(() => {
    const dateStr = format(todayDate, 'yyyy-MM-dd')
    // Saved rituals only carry the `done` flags — icons are React components
    // and cannot survive JSON serialization, so merge onto the static list.
    const savedRituals = getStorageItem(`dashboard-rituals-${dateStr}`, null)
    if (Array.isArray(savedRituals)) {
      setRituals(RITUALS.map((r, i) => ({ ...r, done: Boolean(savedRituals[i]?.done) })))
    }
    const savedMeds = getStorageItem(`dashboard-meds-${dateStr}`, null)
    if (savedMeds) setMedicines(savedMeds)
    const savedNonNegs = getStorageItem(`dashboard-nonneg-${dateStr}`, null)
    if (savedNonNegs) setNonNegs(savedNonNegs)
    const savedIntention = getStorageItem(`dashboard-intention-${dateStr}`, '')
    setIntention(savedIntention)
    const savedToken = getStorageItem('oura-token', '')
    setOuraToken(savedToken)
    setOuraConnected(!!savedToken)
  }, [today, getStorageItem])

  /* Save data */
  const saveData = useCallback(() => {
    const dateStr = format(todayDate, 'yyyy-MM-dd')
    // Strip `icon` (React component) before persisting — functions/forwardRef
    // objects do not survive JSON.stringify (they come back as `{}`).
    localStorage.setItem(`dashboard-rituals-${dateStr}`, JSON.stringify(rituals.map((r) => ({ time: r.time, label: r.label, done: r.done }))))
    localStorage.setItem(`dashboard-meds-${dateStr}`, JSON.stringify(medicines))
    localStorage.setItem(`dashboard-nonneg-${dateStr}`, JSON.stringify(nonNegs))
    localStorage.setItem(`dashboard-intention-${dateStr}`, intention)
    localStorage.setItem('oura-token', ouraToken)
  }, [today, rituals, medicines, nonNegs, intention, ouraToken])

  useEffect(() => { saveData() }, [saveData])

  /* Fetch Oura data if token exists */
  useEffect(() => {
    if (!ouraToken) return
    const fetchOura = async () => {
      try {
        const res = await fetch(`/api/oura?token=${ouraToken}&date=${format(todayDate, 'yyyy-MM-dd')}`)
        if (res.ok) {
          const data = await res.json()
          setHealthData({
            sleep: data.sleep_score ?? 78,
            readiness: data.readiness_score ?? 82,
            activity: data.activity_score ?? 65,
            steps: data.steps ?? 8432,
            hrv: data.hrv ?? 65,
            restingHR: data.resting_hr ?? 52,
          })
          setOuraConnected(true)
        }
      } catch { /* fallback to manual */ }
    }
    fetchOura()
  }, [ouraToken, today])

  const nonNegProgress = nonNegs.length > 0
    ? Math.round((nonNegs.filter((n) => n.done).length / nonNegs.length) * 100)
    : 0

  const tags = [
    { label: getMoonPhase(todayDate), icon: Moon },
    { label: getCyclePhase(todayDate), icon: Leaf },
    { label: getSeason(todayDate), icon: Sun },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-serif">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* ═══ Greeting + Tags ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-center space-y-3"
      >
        <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-tight" style={{ color: 'var(--espresso)' }}>
          {getGreeting(todayDate)}
        </h1>
        <p className="font-body text-sm" style={{ color: 'var(--espresso-muted)' }}>
          {format(todayDate, 'EEEE, MMMM d, yyyy')}
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag.label}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body"
              style={{ background: 'var(--cream-dark)', color: 'var(--espresso-light)', border: '1px solid var(--border-light)' }}
            >
              <tag.icon className="w-3 h-3" />
              {tag.label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ═══ Sacred Intention ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className="rounded-2xl p-8 text-center"
        style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
      >
        <span className="text-[0.65rem] uppercase tracking-[0.2em] font-body font-medium" style={{ color: 'var(--espresso-muted)' }}>
          Today&apos;s Sacred Intention
        </span>
        <textarea
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="What is your intention for today?"
          className="w-full mt-4 font-caveat text-xl text-center bg-transparent outline-none resize-none placeholder:text-center"
          style={{ color: 'var(--espresso)', minHeight: '3rem' }}
          rows={2}
        />
        <p className="font-body text-xs italic mt-2" style={{ color: 'var(--espresso-muted)' }}>
          &ldquo;The secret of your future is hidden in your daily routine.&rdquo;
        </p>
      </motion.div>

      {/* ═══ Two Column Layout ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left Column ── */}
        <div className="space-y-6">
          {/* Today's Rituals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
            className="rounded-2xl p-6"
            style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] font-body font-medium" style={{ color: 'var(--espresso-muted)' }}>
                Today&apos;s Rituals
              </span>
              <Sparkles className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            </div>
            <div className="space-y-2">
              {rituals.map((ritual, i) => {
                const Icon = ritual.icon
                return (
                  <motion.button
                    key={ritual.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                    onClick={() => {
                      setRituals((prev) => prev.map((r, idx) => idx === i ? { ...r, done: !r.done } : r))
                    }}
                    className="flex items-center gap-3 w-full text-left py-2 px-2 rounded-lg transition-all hover:bg-white/50 group"
                  >
                    <div
                      className={`w-5 h-5 rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200 ${
                        ritual.done
                          ? 'bg-rose-500 border-rose-500'
                          : 'border-warm-300 group-hover:border-rose-300'
                      }`}
                    >
                      {ritual.done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-mono text-[0.65rem] w-14 shrink-0" style={{ color: 'var(--espresso-muted)' }}>{ritual.time}</span>
                      <span className={`font-body text-sm ${ritual.done ? 'line-through text-warm-400' : 'text-warm-800'}`}>{ritual.label}</span>
                    </div>
                    <Icon className="w-4 h-4 shrink-0" style={{ color: ritual.done ? 'var(--espresso-muted)' : 'var(--gold)' }} />
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Medicine Check */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
            className="rounded-2xl p-6"
            style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] font-body font-medium" style={{ color: 'var(--espresso-muted)' }}>
                Medicine Check
              </span>
              <Pill className="w-4 h-4" style={{ color: 'var(--lake)' }} />
            </div>
            <div className="space-y-3">
              {medicines.map((med, i) => (
                <div key={med.name} className="flex items-center justify-between py-1">
                  <div>
                    <p className="font-body text-sm font-medium" style={{ color: 'var(--espresso)' }}>{med.name}</p>
                    <p className="text-xs font-body" style={{ color: 'var(--espresso-muted)' }}>{med.dose}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {med.am && (
                      <button
                        onClick={() => setMedicines((prev) => prev.map((m, idx) => idx === i ? { ...m, amTaken: !m.amTaken } : m))}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-body font-medium transition-all ${
                          (med as any).amTaken
                            ? 'text-white'
                            : 'text-warm-600 hover:bg-warm-100'
                        }`}
                        style={{ background: (med as any).amTaken ? 'var(--sage)' : 'var(--cream)' }}
                      >
                        <Sun className="w-3 h-3" /> AM
                      </button>
                    )}
                    {med.pm && (
                      <button
                        onClick={() => setMedicines((prev) => prev.map((m, idx) => idx === i ? { ...m, pmTaken: !m.pmTaken } : m))}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-body font-medium transition-all ${
                          (med as any).pmTaken
                            ? 'text-white'
                            : 'text-warm-600 hover:bg-warm-100'
                        }`}
                        style={{ background: (med as any).pmTaken ? 'var(--cognac)' : 'var(--cream)' }}
                      >
                        <Moon className="w-3 h-3" /> PM
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 3-4 PM Anxiety Protocol */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
            className="rounded-2xl p-6 cursor-pointer transition-all hover:shadow-md"
            style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
            onClick={() => setShowAnxiety(!showAnxiety)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(123,158,168,0.15)' }}>
                  <Wind className="w-5 h-5" style={{ color: 'var(--lake)' }} />
                </div>
                <div>
                  <p className="font-body text-sm font-medium" style={{ color: 'var(--espresso)' }}>3-4 PM Anxiety Protocol</p>
                  <p className="text-xs font-body" style={{ color: 'var(--espresso-muted)' }}>Tap to expand grounding techniques</p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-300 ${showAnxiety ? 'rotate-90' : ''}`}
                style={{ color: 'var(--espresso-muted)' }}
              />
            </div>
            {showAnxiety && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-warm-200 space-y-2"
              >
                {ANXIETY_PROTOCOL.map((step, i) => (
                  <div key={step} className="flex items-center gap-2 text-sm font-body" style={{ color: 'var(--espresso-light)' }}>
                    <span className="w-5 h-5 rounded-full bg-lake/10 flex items-center justify-center text-xs font-mono shrink-0" style={{ color: 'var(--lake)' }}>{i + 1}</span>
                    {step}
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">
          {/* Daily Non-Negotiables */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
            className="rounded-2xl p-6"
            style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] font-body font-medium" style={{ color: 'var(--espresso-muted)' }}>
                Daily Non-Negotiables
              </span>
              <Heart className="w-4 h-4" style={{ color: 'var(--rose-soft)' }} />
            </div>
            <div className="flex items-center gap-6">
              <ProgressRing progress={nonNegProgress} size={100} stroke={8} color="#7A8B65" />
              <div className="flex-1 space-y-2">
                {nonNegs.map((item, i) => (
                  <button
                    key={item.label}
                    onClick={() => setNonNegs((prev) => prev.map((n, idx) => idx === i ? { ...n, done: !n.done } : n))}
                    className="flex items-center gap-2 w-full text-left group"
                  >
                    <div
                      className={`w-4 h-4 rounded-[2px] border flex items-center justify-center shrink-0 transition-all ${
                        item.done ? 'bg-sage border-sage' : 'border-warm-300 group-hover:border-rose-300'
                      }`}
                    >
                      {item.done && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </div>
                    <span className={`font-body text-sm ${item.done ? 'line-through text-warm-400' : 'text-warm-800'}`}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Health Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
            className="rounded-2xl p-6"
            style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] font-body font-medium" style={{ color: 'var(--espresso-muted)' }}>
                Health Preview
              </span>
              <div className="flex items-center gap-2">
                {ouraConnected ? (
                  <span className="flex items-center gap-1 text-xs font-body" style={{ color: 'var(--sage)' }}>
                    <Zap className="w-3 h-3" /> Oura Connected
                  </span>
                ) : (
                  <Link href="/planner/settings" className="flex items-center gap-1 text-xs font-body hover:underline" style={{ color: 'var(--espresso-muted)' }}>
                    <Settings className="w-3 h-3" /> Connect
                  </Link>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <HealthPreviewCard label="Sleep" value={healthData.sleep} unit="score" icon={Moon} color="#C9A96E" trend={2} />
              <HealthPreviewCard label="Readiness" value={healthData.readiness} unit="score" icon={Zap} color="#7A8B65" trend={-1} />
              <HealthPreviewCard label="Activity" value={healthData.activity} unit="score" icon={Activity} color="#C9A0A0" trend={3} />
              <HealthPreviewCard label="Steps" value={healthData.steps.toLocaleString()} unit="" icon={Footprints} color="#7B9EA8" trend={1247} />
            </div>
            <Link
              href="/planner/oura"
              className="flex items-center justify-center gap-1 mt-4 text-xs font-body hover:underline"
              style={{ color: 'var(--espresso-muted)' }}
            >
              View full health tracking <ChevronRight className="w-3 h-3" />
            </Link>
          </motion.div>

          {/* Quick Navigation Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { label: 'Daily', href: '/planner/daily/today', icon: LayoutList, color: 'var(--sage)' },
              { label: 'Notes', href: '/planner/notes', icon: NotebookPen, color: 'var(--cognac)' },
              { label: 'Routines', href: '/planner/routines', icon: Sunrise, color: 'var(--gold)' },
              { label: 'Body', href: '/planner/body', icon: Dumbbell, color: 'var(--rose-soft)' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 p-4 rounded-xl transition-all hover:shadow-md group"
                style={{ background: 'var(--cream)', border: '1px solid var(--border-light)' }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${item.color}18` }}>
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <span className="font-body text-sm font-medium" style={{ color: 'var(--espresso)' }}>{item.label}</span>
                <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--espresso-muted)' }} />
              </Link>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ═══ Bottom Affirmation ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-center py-8"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf className="w-4 h-4" style={{ color: 'var(--gold)' }} />
        </div>
        <p className="font-caveat text-xl" style={{ color: 'var(--espresso-light)' }}>
          {affirmation}
        </p>
      </motion.div>
    </div>
  )
}
