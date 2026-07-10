import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Pill,
  Heart,
  Clock,
  Check,
  Droplets,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Moon,
  Sun,
  Sparkles,
  Timer,
  Utensils,
  GlassWater,
  ChevronRight,
  Star,
  Activity,
  Smile,
  Zap,
} from 'lucide-react'
import Layout from '@/components/Layout'

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

/* ──────────────────── Morning med data ──────────────────── */

interface MedItem {
  name: string
  dose: string
  time: string
  note?: string
  icon: React.ElementType
}

const morningMeds: MedItem[] = [
  { name: 'Wellbutrin XL', dose: '150mg', time: '8:00 AM', note: 'With food', icon: Pill },
  { name: 'Adderall', dose: '20mg Dose 1', time: '8:15 AM', note: 'After breakfast', icon: Zap },
  { name: 'Adderall', dose: '20mg Dose 2', time: '9:00 AM', note: 'Second morning dose', icon: Zap },
  { name: 'Ritual Multivitamin', dose: '2 capsules', time: 'With breakfast', icon: Star },
  { name: 'Ritual Omega-3', dose: '1 capsule', time: 'With breakfast', icon: Droplets },
  { name: 'Ritual Hya-Cera', dose: '1 capsule', time: 'With breakfast', icon: Sparkles },
  { name: 'Semaine Pre + Probiotic', dose: '1 capsule', time: 'With breakfast', icon: Heart },
]

const eveningMeds: MedItem[] = [
  { name: 'Lexapro', dose: '5mg', time: '8:30 PM', note: 'With a small snack', icon: Moon },
  { name: 'Magnesium Glycinate', dose: '400mg', time: '10:30 PM', note: 'For sleep & muscle relaxation', icon: Heart },
  { name: 'Hydroxyzine', dose: '50mg', time: '11:00 PM', note: 'For sleep and anxiety', icon: Moon },
  { name: 'L-Theanine', dose: '200mg', time: '10:30 PM', note: 'Optional calming', icon: Sparkles },
  { name: 'Glycine', dose: '3g', time: '10:30 PM', note: 'Optional sleep support', icon: Star },
]

/* ──────────────────── Supplement table data ──────────────────── */

interface Supplement {
  name: string
  dose: string
  when: string
  purpose: string
}

const supplements: Supplement[] = [
  { name: 'Magnesium glycinate', dose: '400mg', when: '10:30 PM', purpose: 'Sleep, muscle relaxation' },
  { name: 'Omega-3 EPA/DHA', dose: '2g', when: 'With dinner', purpose: 'Anti-inflammatory' },
  { name: 'Vitamin D3', dose: '2000-4000 IU', when: 'Morning', purpose: 'Bone health' },
  { name: 'L-theanine', dose: '200mg', when: '10:30 PM', purpose: 'Calming' },
  { name: 'Glycine', dose: '3g', when: '10:30 PM', purpose: 'Sleep support' },
]

/* ──────────────────── Medication rules ──────────────────── */

interface MedRule {
  type: 'do' | 'dont'
  text: string
}

const medRules: MedRule[] = [
  { type: 'do', text: 'Eat breakfast 30-60 min before Adderall' },
  { type: 'do', text: 'Front-load 35-40% of daily calories before 9 AM' },
  { type: 'dont', text: 'Never skip breakfast before taking medication' },
  { type: 'dont', text: 'Take supplements within 2 hours of medication' },
]

/* ──────────────────── Lexapro tracking fields ──────────────────── */

interface DailyLexaproEntry {
  date: string
  anxiety: number
  sleep: number
  mood: number
  notes: string
}

const defaultLexaproEntry = (date: string): DailyLexaproEntry => ({
  date,
  anxiety: 0,
  sleep: 0,
  mood: 0,
  notes: '',
})

/* ──────────────────── Component ──────────────────── */

export default function MedicineRitual() {
  const tk = todayKey()

  const [morningTaken, setMorningTaken] = useLsState<Record<string, boolean>>(
    `planner-meds-morning-${tk}`,
    {}
  )
  const [eveningTaken, setEveningTaken] = useLsState<Record<string, boolean>>(
    `planner-meds-evening-${tk}`,
    {}
  )
  const [ateBreakfast, setAteBreakfast] = useLsState<boolean>(`planner-meds-ate-${tk}`, false)
  const [drankWater, setDrankWater] = useLsState<boolean>(`planner-meds-water-${tk}`, false)
  const [showTimer, setShowTimer] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(30 * 60) // 30 min default

  // Lexapro tracking
  const [lexaproEntries, setLexaproEntries] = useLsState<Record<string, DailyLexaproEntry>>(
    'planner-lexapro-entries',
    {}
  )
  const todayEntry = lexaproEntries[tk] || defaultLexaproEntry(tk)

  const updateTodayEntry = useCallback(
    (updates: Partial<DailyLexaproEntry>) => {
      setLexaproEntries((prev) => ({
        ...prev,
        [tk]: { ...(prev[tk] || defaultLexaproEntry(tk)), ...updates },
      }))
    },
    [tk, setLexaproEntries]
  )

  // Timer effect
  useEffect(() => {
    if (!showTimer || timerSeconds <= 0) return
    const interval = setInterval(() => setTimerSeconds((s) => s - 1), 1000)
    return () => clearInterval(interval)
  }, [showTimer, timerSeconds])

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const toggle = useCallback(
    (setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, name: string) => {
      setter((prev) => ({ ...prev, [name]: !prev[name] }))
    },
    []
  )

  // Morning progress
  const morningProgress = Math.round(
    (morningMeds.filter((m) => morningTaken[m.name + m.dose]).length / morningMeds.length) * 100
  )
  const eveningProgress = Math.round(
    (eveningMeds.filter((m) => eveningTaken[m.name + m.dose]).length / eveningMeds.length) * 100
  )

  // Lexapro start date
  const lexaproStart = new Date('2026-03-30')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const daysOnLexapro = Math.max(
    0,
    Math.floor((new Date(tk).getTime() - lexaproStart.getTime()) / (1000 * 60 * 60 * 24))
  )

  // Get last 14 days of entries for chart
  const chartData = useMemo(() => {
    const days: { date: string; anxiety: number; sleep: number; mood: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dk = d.toISOString().split('T')[0]
      const entry = lexaproEntries[dk]
      days.push({
        date: dk,
        anxiety: entry?.anxiety || 0,
        sleep: entry?.sleep || 0,
        mood: entry?.mood || 0,
      })
    }
    return days
  }, [lexaproEntries])

  const maxChartVal = 10

  return (
    <Layout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* ═══════════ Hero ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative w-full h-52 rounded-lg overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #faf7f2 0%, #f5e4c3 40%, #e8cc96 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 80%, #e0744c22 0%, transparent 50%),
                                  radial-gradient(circle at 80% 20%, #c9a96e22 0%, transparent 50%)`,
              }}
            />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mb-2"
            >
              <Heart className="w-5 h-5 text-[#e0744c]" />
              <span className="font-caveat text-lg text-[#7a8b65]">Sacred timing</span>
              <Sparkles className="w-5 h-5 text-[#c9a96e]" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-playfair text-4xl lg:text-5xl text-warm-900 mb-2"
            >
              Medicine &amp; Ritual
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-caveat text-xl text-warm-600"
            >
              Honoring your body&apos;s needs with sacred timing
            </motion.p>
          </div>
        </motion.div>

        {/* ═══════════ Morning Medication Sequence ═══════════ */}
        <motion.section variants={stagger} initial="initial" animate="animate" className="chic-card">
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Sun className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-playfair text-2xl text-warm-900">Morning Sequence</h2>
              <p className="font-inter text-xs text-warm-500">Step by step, with intention</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-24 h-2 bg-warm-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${morningProgress}%` }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>
              <span className="font-inter text-xs text-warm-500">{morningProgress}%</span>
            </div>
          </motion.div>

          {/* Step 1: EAT */}
          <motion.div
            variants={fadeUp}
            className="mb-5 p-4 rounded-lg border-2 border-dashed"
            style={{ borderColor: ateBreakfast ? '#7a8b6588' : '#e0744c55', background: '#faf7f2' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#e0744c22] flex items-center justify-center">
                <span className="font-inter text-sm font-bold text-[#e0744c]">1</span>
              </div>
              <div className="flex-1">
                <p className="font-inter text-sm font-semibold text-warm-800">EAT FIRST</p>
                <p className="font-inter text-xs text-warm-500">
                  Minimum 200 calories with protein
                </p>
              </div>
              <button
                onClick={() => setAteBreakfast(!ateBreakfast)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all"
                style={{
                  backgroundColor: ateBreakfast ? '#7a8b65' : '#e0744c',
                  color: 'white',
                }}
              >
                {ateBreakfast ? <Check className="w-3.5 h-3.5" /> : <Utensils className="w-3.5 h-3.5" />}
                <span className="font-inter text-xs font-medium">
                  {ateBreakfast ? 'Done' : 'Mark Done'}
                </span>
              </button>
            </div>
            {!showTimer && ateBreakfast && (
              <button
                onClick={() => {
                  setShowTimer(true)
                  setTimerSeconds(30 * 60)
                }}
                className="mt-2 flex items-center gap-2 font-inter text-xs text-[#c9a96e] hover:text-[#7a8b65] transition-colors"
              >
                <Timer className="w-3.5 h-3.5" />
                Start 30-min wait timer before meds
              </button>
            )}
            {showTimer && timerSeconds > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                <div>
                  <p className="font-inter text-sm font-semibold text-amber-700">
                    Wait timer: {formatTimer(timerSeconds)}
                  </p>
                  <p className="font-inter text-xs text-amber-600">
                    Let your food settle before taking medication
                  </p>
                </div>
              </div>
            )}
            {showTimer && timerSeconds <= 0 && (
              <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="font-inter text-sm text-green-700">
                  Time&apos;s up! You can take your medication now.
                </p>
              </div>
            )}
          </motion.div>

          {/* Step 2: Meds */}
          <motion.div variants={fadeUp} className="mb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <span className="font-inter text-sm font-bold text-rose-600">2</span>
              </div>
              <p className="font-inter text-sm font-semibold text-warm-800">
                Morning Medications
              </p>
              <p className="font-caveat text-sm text-warm-500 ml-auto">
                Same order, same location
              </p>
            </div>

            <div className="space-y-2">
              {morningMeds.map((med) => {
                const taken = !!morningTaken[med.name + med.dose]
                const Icon = med.icon
                return (
                  <div
                    key={med.name + med.dose}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                    style={{
                      backgroundColor: taken ? '#7a8b650a' : 'white',
                      borderColor: taken ? '#7a8b6533' : '#e8e2da',
                    }}
                    onClick={() => toggle(setMorningTaken, med.name + med.dose)}
                  >
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
                      style={{
                        borderColor: taken ? '#7a8b65' : '#d4c9bb',
                        backgroundColor: taken ? '#7a8b65' : 'transparent',
                      }}
                    >
                      {taken && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${taken ? 'text-[#c9a96e]' : 'text-warm-400'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          className={`font-inter text-sm font-medium transition-all ${taken ? 'line-through text-warm-400' : 'text-warm-800'}`}
                        >
                          {med.name}
                        </span>
                        <span className="font-inter text-xs text-warm-500">{med.dose}</span>
                      </div>
                      <p className="font-inter text-xs text-[#c9a96e]">
                        {med.time} {med.note && `\u2022 ${med.note}`}
                      </p>
                    </div>
                    {taken && (
                      <CheckCircle2 className="w-4 h-4 text-[#7a8b65] flex-shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Steps 3 & 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.div
              variants={fadeUp}
              className="p-4 rounded-lg border-2 border-dashed flex items-center gap-3 cursor-pointer transition-all"
              style={{
                borderColor: drankWater ? '#7a8b6588' : '#d4c9bb55',
                background: drankWater ? '#7a8b650a' : '#faf7f2',
              }}
              onClick={() => setDrankWater(!drankWater)}
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <span className="font-inter text-sm font-bold text-blue-500">3</span>
              </div>
              <div className="flex-1">
                <p className="font-inter text-sm font-semibold text-warm-800">Mark as Taken</p>
                <p className="font-inter text-xs text-warm-500">Confirm each medication</p>
              </div>
              {drankWater && <Check className="w-4 h-4 text-[#7a8b65]" />}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="p-4 rounded-lg border-2 border-dashed flex items-center gap-3"
              style={{ borderColor: '#d4c9bb55', background: '#faf7f2' }}
            >
              <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center">
                <span className="font-inter text-sm font-bold text-cyan-600">4</span>
              </div>
              <div className="flex-1">
                <p className="font-inter text-sm font-semibold text-warm-800">Full Glass of Water</p>
                <p className="font-inter text-xs text-warm-500">Help your body process</p>
              </div>
              <GlassWater className="w-4 h-4 text-cyan-500" />
            </motion.div>
          </div>
        </motion.section>

        {/* ═══════════ Evening Medication Ritual ═══════════ */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="chic-card"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Moon className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="font-playfair text-2xl text-warm-900">Evening Ritual</h2>
              <p className="font-inter text-xs text-warm-500">Winding down with intention</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-24 h-2 bg-warm-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-indigo-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${eveningProgress}%` }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>
              <span className="font-inter text-xs text-warm-500">{eveningProgress}%</span>
            </div>
          </motion.div>

          <div className="space-y-2">
            {eveningMeds.map((med) => {
              const taken = !!eveningTaken[med.name + med.dose]
              const Icon = med.icon
              return (
                <div
                  key={med.name + med.dose}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                  style={{
                    backgroundColor: taken ? '#7a8b650a' : 'white',
                    borderColor: taken ? '#7a8b6533' : '#e8e2da',
                  }}
                  onClick={() => toggle(setEveningTaken, med.name + med.dose)}
                >
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
                    style={{
                      borderColor: taken ? '#7a8b65' : '#d4c9bb',
                      backgroundColor: taken ? '#7a8b65' : 'transparent',
                    }}
                  >
                    {taken && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${taken ? 'text-indigo-400' : 'text-warm-400'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className={`font-inter text-sm font-medium transition-all ${taken ? 'line-through text-warm-400' : 'text-warm-800'}`}
                      >
                        {med.name}
                      </span>
                      <span className="font-inter text-xs text-warm-500">{med.dose}</span>
                    </div>
                    <p className="font-inter text-xs text-indigo-400">
                      {med.time} {med.note && `\u2022 ${med.note}`}
                    </p>
                  </div>
                  {taken && <CheckCircle2 className="w-4 h-4 text-[#7a8b65] flex-shrink-0" />}
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* ═══════════ Supplement Schedule Table ═══════════ */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="card-planner overflow-hidden"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="font-playfair text-2xl text-warm-900">Supplement Schedule</h2>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-warm-200">
                  <th className="text-left font-inter text-xs font-semibold text-warm-600 pb-2 pr-4">
                    Supplement
                  </th>
                  <th className="text-left font-inter text-xs font-semibold text-warm-600 pb-2 pr-4">
                    Dose
                  </th>
                  <th className="text-left font-inter text-xs font-semibold text-warm-600 pb-2 pr-4">
                    When
                  </th>
                  <th className="text-left font-inter text-xs font-semibold text-warm-600 pb-2">
                    Purpose
                  </th>
                </tr>
              </thead>
              <tbody>
                {supplements.map((sup) => (
                  <motion.tr
                    key={sup.name}
                    variants={fadeUp}
                    className="border-b border-warm-100 last:border-0 hover:bg-warm-50 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <span className="font-inter text-sm font-medium text-warm-800">
                        {sup.name}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-inter text-sm text-warm-600">{sup.dose}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-inter text-xs text-[#c9a96e] font-medium">
                        {sup.when}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="font-inter text-sm text-warm-500">{sup.purpose}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* ═══════════ Lexapro Tracking (First Month) ═══════════ */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #fdf2f4 0%, #f5efe6 50%, #fdf2f4 100%)',
            border: '1px solid #e8e2da',
          }}
        >
          <div className="p-6">
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h2 className="font-playfair text-2xl text-warm-900">Lexapro Journey</h2>
                <p className="font-inter text-xs text-warm-500">
                  Tracking your first month &mdash; started March 30, 2026
                </p>
              </div>
              <div className="ml-auto text-center">
                <p className="font-playfair text-2xl text-rose-500">{daysOnLexapro}</p>
                <p className="font-inter text-[10px] text-warm-500">days in</p>
              </div>
            </motion.div>

            {/* Mini chart */}
            <motion.div variants={fadeUp} className="mb-5">
              <p className="font-inter text-xs font-semibold text-warm-700 mb-3">
                Last 14 Days Overview
              </p>
              <div className="flex items-end gap-1 h-24">
                {chartData.map((day, i) => {
                  const hasData = day.anxiety > 0 || day.sleep > 0 || day.mood > 0
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full flex flex-col items-center gap-px">
                        {/* Anxiety bar */}
                        <div
                          className="w-full rounded-t-sm bg-rose-300"
                          style={{
                            height: hasData ? `${(day.anxiety / maxChartVal) * 32}px` : '2px',
                            opacity: hasData ? 1 : 0.2,
                          }}
                          title={`Anxiety: ${day.anxiety}`}
                        />
                        {/* Sleep bar */}
                        <div
                          className="w-full rounded-t-sm bg-indigo-300"
                          style={{
                            height: hasData ? `${(day.sleep / maxChartVal) * 32}px` : '2px',
                            opacity: hasData ? 1 : 0.2,
                          }}
                          title={`Sleep: ${day.sleep}`}
                        />
                        {/* Mood bar */}
                        <div
                          className="w-full rounded-t-sm bg-emerald-300"
                          style={{
                            height: hasData ? `${(day.mood / maxChartVal) * 32}px` : '2px',
                            opacity: hasData ? 1 : 0.2,
                          }}
                          title={`Mood: ${day.mood}`}
                        />
                      </div>
                      <span className="font-inter text-[8px] text-warm-400">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-rose-300" />
                  <span className="font-inter text-[10px] text-warm-500">Anxiety</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-300" />
                  <span className="font-inter text-[10px] text-warm-500">Sleep</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-300" />
                  <span className="font-inter text-[10px] text-warm-500">Mood</span>
                </div>
              </div>
            </motion.div>

            {/* Today's ratings */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Anxiety', value: todayEntry.anxiety, setter: (v: number) => updateTodayEntry({ anxiety: v }), icon: AlertCircle, color: 'rose', lowIsGood: true },
                { label: 'Sleep Quality', value: todayEntry.sleep, setter: (v: number) => updateTodayEntry({ sleep: v }), icon: Moon, color: 'indigo', lowIsGood: false },
                { label: 'Mood Stability', value: todayEntry.mood, setter: (v: number) => updateTodayEntry({ mood: v }), icon: Smile, color: 'emerald', lowIsGood: false },
              ].map((field) => {
                const Icon = field.icon
                return (
                  <div key={field.label} className="p-3 rounded-lg bg-white/70 border border-warm-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 text-${field.color}-500`} />
                      <span className="font-inter text-xs font-semibold text-warm-700">
                        {field.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={field.value}
                        onChange={(e) => field.setter(parseInt(e.target.value))}
                        className="flex-1 accent-rose-500"
                      />
                      <span className="font-inter text-sm font-semibold text-warm-800 w-6 text-center">
                        {field.value}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="font-inter text-[10px] text-warm-400">
                        {field.lowIsGood ? 'Good' : 'Low'}
                      </span>
                      <span className="font-inter text-[10px] text-warm-400">
                        {field.lowIsGood ? 'High' : 'Great'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </motion.div>

            {/* Notes */}
            <motion.div variants={fadeUp} className="mb-4">
              <label className="font-inter text-xs font-semibold text-warm-700 mb-1 block">
                Side effects / Notes
              </label>
              <textarea
                value={todayEntry.notes}
                onChange={(e) => updateTodayEntry({ notes: e.target.value })}
                placeholder="How are you feeling today? Any changes you notice..."
                className="planner-input w-full p-3 rounded-lg border border-warm-200 bg-white/70 min-h-[60px] text-sm"
              />
            </motion.div>

            {/* Timeline */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/60"
            >
              <div className="flex items-center gap-2">
                <CalendarDot date="Mar 30" label="Started" active={daysOnLexapro >= 0} />
                <ChevronRight className="w-3 h-3 text-warm-300" />
                <CalendarDot date="Apr 14" label="Check-in" active={daysOnLexapro >= 14} />
                <ChevronRight className="w-3 h-3 text-warm-300" />
                <CalendarDot
                  date="Apr 27"
                  label="Full effect"
                  active={daysOnLexapro >= 28}
                  highlight
                />
              </div>
            </motion.div>
            <p className="font-caveat text-sm text-warm-500 mt-2">
              Expected: 2-4 weeks for full therapeutic effect. Be patient with your body.
            </p>
          </div>
        </motion.section>

        {/* ═══════════ Medication Rules ═══════════ */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="chic-card"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="font-playfair text-2xl text-warm-900">Sacred Rules</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {medRules.map((rule) => (
              <motion.div
                key={rule.text}
                variants={fadeUp}
                className="flex items-start gap-3 p-3 rounded-lg border"
                style={{
                  backgroundColor: rule.type === 'do' ? '#7a9e7a0a' : '#c472720a',
                  borderColor: rule.type === 'do' ? '#7a8b6533' : '#c4727233',
                }}
              >
                {rule.type === 'do' ? (
                  <CheckCircle2 className="w-5 h-5 text-[#7a8b65] flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#c47272] flex-shrink-0 mt-0.5" />
                )}
                <span
                  className={`font-inter text-sm ${rule.type === 'do' ? 'text-warm-700' : 'text-warm-700'}`}
                >
                  {rule.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Gentle reminder */}
          <motion.div
            variants={fadeUp}
            className="mt-4 p-4 rounded-lg flex items-center gap-3"
            style={{ background: 'linear-gradient(90deg, #c9a96e15, transparent)' }}
          >
            <Heart className="w-5 h-5 text-[#e0744c]" />
            <p className="font-caveat text-lg text-warm-600">
              These rules exist to support you, not constrain you. On hard days, return to the
              basics: eat, hydrate, rest.
            </p>
          </motion.div>
        </motion.section>

        {/* ═══════════ Bottom quote ═══════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center py-8"
        >
          <p className="font-caveat text-2xl text-[#7a8b65]">
            &ldquo;Taking your medication is an act of self-love.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Heart className="w-3 h-3 text-[#e0744c]" />
            <Sparkles className="w-3 h-3 text-[#c9a96e]" />
            <Heart className="w-3 h-3 text-[#e0744c]" />
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}

/* ──────────────────── Mini calendar dot helper ──────────────────── */

function CalendarDot({
  date,
  label,
  active,
  highlight,
}: {
  date: string
  label: string
  active: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: highlight ? '#e85d78' : active ? '#7a8b65' : '#e8e2da',
        }}
      >
        <Check className="w-4 h-4 text-white" />
      </div>
      <span className="font-inter text-[9px] text-warm-500 mt-0.5">{date}</span>
      <span className="font-inter text-[8px] text-warm-400">{label}</span>
    </div>
  )
}
