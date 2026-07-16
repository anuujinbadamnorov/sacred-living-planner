import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, subDays } from 'date-fns'
import HeroSection from '@/components/HeroSection'
import { useAuth } from '@/components/AuthProvider'
import {
  Moon,
  Zap,
  Footprints,
  Heart,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Edit3,
  Check,
  RefreshCw,
  Link as LinkIcon,
} from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]
const STORAGE_KEY = 'health-manual-data'

/* ── Types ── */
interface DailyHealth {
  date: string
  sleep: number
  readiness: number
  steps: number
  hrv: number
  restingHR: number
  deepSleep: number
  remSleep: number
  totalSleep: number
  source?: 'oura' | 'manual'
}

interface OuraApiEntry {
  date: string
  sleep_score: number | null
  readiness_score: number | null
  activity_score: number | null
  steps: number | null
  hrv: number | null
  resting_hr: number | null
  deep_sleep: number | null
  rem_sleep: number | null
  total_sleep: number | null
}

/* ── Storage ── */
function loadData(): DailyHealth[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* */ }
  // Seed with 30 days of sample data
  const seeded: DailyHealth[] = []
  for (let i = 29; i >= 0; i--) {
    seeded.push({
      date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
      sleep: 70 + Math.floor(Math.random() * 20),
      readiness: 68 + Math.floor(Math.random() * 22),
      steps: 6000 + Math.floor(Math.random() * 6000),
      hrv: 50 + Math.floor(Math.random() * 30),
      restingHR: 48 + Math.floor(Math.random() * 12),
      deepSleep: 60 + Math.floor(Math.random() * 50),
      remSleep: 80 + Math.floor(Math.random() * 60),
      totalSleep: 360 + Math.floor(Math.random() * 180),
      source: 'manual',
    })
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  return seeded
}

function saveData(data: DailyHealth[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/* ── Merge Oura data into localStorage ── */
function mergeOuraData(existing: DailyHealth[], ouraEntries: OuraApiEntry[]): DailyHealth[] {
  const map = new Map(existing.map((d) => [d.date, { ...d }]))

  for (const entry of ouraEntries) {
    const d = entry.date
    const existingEntry = map.get(d)
    const merged: DailyHealth = {
      date: d,
      sleep: entry.sleep_score ?? existingEntry?.sleep ?? 0,
      readiness: entry.readiness_score ?? existingEntry?.readiness ?? 0,
      steps: entry.steps ?? existingEntry?.steps ?? 0,
      hrv: entry.hrv ?? existingEntry?.hrv ?? 0,
      restingHR: entry.resting_hr ?? existingEntry?.restingHR ?? 0,
      deepSleep: entry.deep_sleep ?? existingEntry?.deepSleep ?? 0,
      remSleep: entry.rem_sleep ?? existingEntry?.remSleep ?? 0,
      totalSleep: entry.total_sleep ?? existingEntry?.totalSleep ?? 0,
      source: 'oura',
    }
    map.set(d, merged)
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
}

/* ── Score Color ── */
function scoreColor(score: number): string {
  if (score >= 80) return '#7A8B65'
  if (score >= 60) return '#C9A96E'
  return '#C9A0A0'
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Optimal'
  if (score >= 60) return 'Fair'
  return 'Pay Attention'
}

/* ── Score Card ── */
function ScoreCard({
  title,
  score,
  icon: Icon,
  delay,
  onClick,
  source,
}: {
  title: string
  score: number
  icon: React.ElementType
  delay: number
  onClick: () => void
  source?: 'oura' | 'manual'
}) {
  const color = scoreColor(score)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      onClick={onClick}
      className="relative rounded-xl p-8 cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden"
      style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: color }} />
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        <span className="font-body text-sm font-medium" style={{ color: 'var(--espresso-light)' }}>{title}</span>
        {source === 'oura' && (
          <span className="ml-auto text-[0.6rem] font-body uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ background: '#7A8B6518', color: '#7A8B65' }}>Oura</span>
        )}
      </div>
      <div className="relative flex flex-col items-center">
        <motion.span
          className="font-display text-5xl font-semibold"
          style={{ color: 'var(--espresso)' }}
          key={score}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: delay + 0.1 }}
        >
          {score}
        </motion.span>
        <span className="font-body text-xs mt-1" style={{ color }}>
          {scoreLabel(score)}
        </span>
      </div>
      <p className="font-body text-xs mt-3 text-center" style={{ color: 'var(--espresso-muted)' }}>
        Tap to edit
      </p>
    </motion.div>
  )
}

/* ── Mini Bar Chart ── */
function MiniBarChart({
  data,
  color,
  label,
}: {
  data: { day: string; value: number }[]
  color: string
  label: string
}) {
  const max = Math.max(...data.map((d) => d.value), 100)
  const avg = Math.round(data.reduce((s, d) => s + d.value, 0) / data.length)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-body text-xs font-medium" style={{ color: 'var(--espresso-light)' }}>{label}</span>
        <span className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>Avg: {avg}</span>
      </div>
      <div className="flex items-end gap-1.5 h-20">
        {data.map((item, i) => (
          <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              className="w-full rounded-t-md min-h-[4px]"
              style={{ backgroundColor: color }}
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
            />
            <span className="font-mono text-[0.6rem]" style={{ color: 'var(--espresso-muted)' }}>
              {item.day.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Sparkline ── */
function Sparkline({ data, color, label }: { data: number[]; color: string; label: string }) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const w = 300
  const h = 60
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')

  return (
    <div className="space-y-2">
      <span className="font-body text-xs font-medium" style={{ color: 'var(--espresso-light)' }}>{label}</span>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

/* ── Metric Pill ── */
function MetricPill({ icon: Icon, label, value, unit, color }: {
  icon: React.ElementType; label: string; value: number; unit: string; color: string
}) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-lg" style={{ background: 'var(--cream)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="font-body text-[0.625rem] uppercase tracking-wide" style={{ color: 'var(--espresso-muted)' }}>{label}</p>
        <p className="font-body text-sm font-semibold" style={{ color: 'var(--espresso)' }}>{value} <span className="text-xs font-normal" style={{ color: 'var(--espresso-muted)' }}>{unit}</span></p>
      </div>
    </div>
  )
}

/* ── Edit Modal ── */
function EditModal({
  open,
  onClose,
  todayData,
  onSave,
}: {
  open: boolean
  onClose: () => void
  todayData: DailyHealth
  onSave: (d: DailyHealth) => void
}) {
  const [form, setForm] = useState({ ...todayData })

  if (!open) return null

  const handleSave = () => {
    onSave(form)
    onClose()
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border font-body text-sm placeholder:text-sm transition-all focus:outline-none focus:ring-2"
  const inputStyle = { background: 'var(--cream)', borderColor: 'var(--border-light)', color: 'var(--espresso)' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(44,36,32,0.4)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-xl p-8 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
      >
        <h3 className="font-display text-xl mb-4" style={{ color: 'var(--espresso)' }}>Edit Today&apos;s Scores</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { key: 'sleep', label: 'Sleep Score', min: 0, max: 100 },
            { key: 'readiness', label: 'Readiness', min: 0, max: 100 },
            { key: 'steps', label: 'Steps', min: 0, max: 50000 },
            { key: 'hrv', label: 'HRV (ms)', min: 0, max: 200 },
            { key: 'restingHR', label: 'Resting HR', min: 30, max: 120 },
            { key: 'deepSleep', label: 'Deep Sleep (min)', min: 0, max: 300 },
            { key: 'remSleep', label: 'REM Sleep (min)', min: 0, max: 300 },
            { key: 'totalSleep', label: 'Total Sleep (min)', min: 0, max: 720 },
          ].map((field) => (
            <div key={field.key}>
              <label className="font-body text-xs mb-1 block" style={{ color: 'var(--espresso-muted)' }}>{field.label}</label>
              <input
                type="number"
                min={field.min}
                max={field.max}
                value={form[field.key as keyof DailyHealth]}
                onChange={(e) => setForm((p) => ({ ...p, [field.key]: Number(e.target.value) || 0 }))}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-lg font-body text-sm font-medium text-white flex items-center gap-2 transition-all"
            style={{ background: 'var(--sage)' }}
          >
            <Check className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg font-body text-sm transition-all"
            style={{ background: 'var(--cream)', color: 'var(--espresso-light)', border: '1px solid var(--border-light)' }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════ */

export default function OuraHealth() {
  const { user } = useAuth()
  const [data, setData] = useState<DailyHealth[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    setData(loadData())
  }, [])

  // Auto-fetch from Oura on mount if user is logged in
  useEffect(() => {
    if (!user) return
    syncFromOura()
  }, [user])

  const syncFromOura = async () => {
    setSyncLoading(true)
    setSyncError(null)
    try {
      const res = await fetch(`/api/oura/today?date=${todayStr}&range=30`)
      if (!res.ok) {
        const err = await res.json()
        if (res.status === 404) {
          setSyncError('Oura not connected. Add your token in Settings.')
        } else if (res.status === 401) {
          setSyncError('Please sign in to sync Oura data.')
        } else {
          setSyncError(err.error || 'Failed to fetch Oura data.')
        }
        setSyncLoading(false)
        return
      }
      const { data: ouraData } = await res.json()
      if (ouraData && ouraData.length > 0) {
        setData((prev) => {
          const merged = mergeOuraData(prev, ouraData as OuraApiEntry[])
          saveData(merged)
          return merged
        })
      }
    } catch (err) {
      setSyncError('Network error. Please try again.')
    } finally {
      setSyncLoading(false)
    }
  }

  const todayData = useMemo(() => {
    return data.find((d) => d.date === todayStr) || data[data.length - 1]
  }, [data, todayStr])

  const yesterdayData = useMemo(() => {
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    return data.find((d) => d.date === yesterdayStr)
  }, [data])

  const handleSave = useCallback((updated: DailyHealth) => {
    setData((prev) => {
      const idx = prev.findIndex((d) => d.date === updated.date)
      const next = [...prev]
      const saved: DailyHealth = { ...updated, source: 'manual' }
      if (idx >= 0) next[idx] = saved
      else next.push(saved)
      saveData(next)
      return next
    })
  }, [])

  // Trends
  const sleepTrend = todayData && yesterdayData ? todayData.sleep - yesterdayData.sleep : 0
  const readinessTrend = todayData && yesterdayData ? todayData.readiness - yesterdayData.readiness : 0
  const stepsTrend = todayData && yesterdayData ? todayData.steps - yesterdayData.steps : 0

  // Weekly data (last 7 days)
  const weeklySleep = data.slice(-7).map((d) => ({ day: d.date.slice(5), value: d.sleep }))
  const weeklyReadiness = data.slice(-7).map((d) => ({ day: d.date.slice(5), value: d.readiness }))
  const weeklySteps = data.slice(-7).map((d) => ({ day: d.date.slice(5), value: Math.min(d.steps / 100, 100) }))

  // Monthly sparkline data (last 30 days)
  const monthlySleep = data.slice(-30).map((d) => d.sleep)
  const monthlySteps = data.slice(-30).map((d) => Math.min(d.steps / 100, 100))

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ═══ Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative rounded-2xl overflow-hidden h-48 md:h-56"
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--cream-dark), var(--border-light), var(--cream-dark))' }} />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold" style={{ color: 'var(--espresso)' }}>
                Health Tracking
              </h1>
              <p className="font-body text-sm mt-1" style={{ color: 'var(--espresso-muted)' }}>
                {format(new Date(), 'EEEE, MMMM do')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={syncFromOura}
                  disabled={syncLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm font-medium transition-all"
                  style={{ background: 'var(--sage)', color: 'white' }}
                >
                  <RefreshCw className={`w-4 h-4 ${syncLoading ? 'animate-spin' : ''}`} />
                  {syncLoading ? 'Syncing...' : 'Sync Oura'}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sync status */}
      {syncError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg"
          style={{ background: '#C9A0A010', border: '1px solid #C9A0A040' }}
        >
          <LinkIcon className="w-4 h-4" style={{ color: '#C9A0A0' }} />
          <span className="font-body text-sm" style={{ color: '#C9A0A0' }}>{syncError}</span>
          <a href="/planner/settings" className="font-body text-sm font-medium underline ml-auto" style={{ color: 'var(--sage)' }}>Open Settings →</a>
        </motion.div>
      )}

      {/* ═══ Score Cards ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard
          title="Sleep Score"
          score={todayData?.sleep ?? 78}
          icon={Moon}
          delay={0.1}
          onClick={() => setEditOpen(true)}
          source={todayData?.source}
        />
        <ScoreCard
          title="Readiness"
          score={todayData?.readiness ?? 82}
          icon={Zap}
          delay={0.2}
          onClick={() => setEditOpen(true)}
          source={todayData?.source}
        />
        <ScoreCard
          title="Steps"
          score={Math.min(Math.round((todayData?.steps ?? 8432) / 100), 100)}
          icon={Footprints}
          delay={0.3}
          onClick={() => setEditOpen(true)}
          source={todayData?.source}
        />
      </div>

      {/* ═══ Trend Summary ═══ */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Sleep', trend: sleepTrend, icon: Moon },
          { label: 'Readiness', trend: readinessTrend, icon: Zap },
          { label: 'Steps', trend: stepsTrend, icon: Footprints },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-2 p-3 rounded-lg"
            style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
          >
            <item.icon className="w-4 h-4" style={{ color: 'var(--espresso-muted)' }} />
            <span className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>{item.label}</span>
            <span className="flex items-center gap-1 ml-auto">
              {item.trend >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--sage)' }} />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" style={{ color: 'var(--rose-soft)' }} />
              )}
              <span className="font-body text-xs font-medium" style={{ color: item.trend >= 0 ? 'var(--sage)' : 'var(--rose-soft)' }}>
                {item.trend >= 0 ? '+' : ''}{item.trend}
              </span>
            </span>
          </motion.div>
        ))}
      </div>

      {/* ═══ Weekly Trends ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
        className="rounded-xl p-8"
        style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--sage)' }} />
            <h3 className="font-display text-lg" style={{ color: 'var(--espresso)' }}>Weekly Trends</h3>
          </div>
          <span className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>Last 7 days</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MiniBarChart data={weeklySleep} color="#C9A96E" label="Sleep Score" />
          <MiniBarChart data={weeklyReadiness} color="#7A8B65" label="Readiness Score" />
          <MiniBarChart data={weeklySteps} color="#C9A0A0" label="Steps (/100)" />
        </div>
      </motion.div>

      {/* ═══ Monthly Sparklines ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
        className="rounded-xl p-8"
        style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" style={{ color: 'var(--lake)' }} />
            <h3 className="font-display text-lg" style={{ color: 'var(--espresso)' }}>Monthly Trends</h3>
          </div>
          <span className="font-body text-xs" style={{ color: 'var(--espresso-muted)' }}>Last 30 days</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Sparkline data={monthlySleep} color="#C9A96E" label="Sleep Score (30d)" />
          <Sparkline data={monthlySteps} color="#7A8B65" label="Steps /100 (30d)" />
        </div>
      </motion.div>

      {/* ═══ Metrics ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.55 }}
        className="rounded-xl p-8"
        style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Heart className="w-5 h-5" style={{ color: 'var(--rose-soft)' }} />
          <h3 className="font-display text-lg" style={{ color: 'var(--espresso)' }}>Today&apos;s Metrics</h3>
          <span className="ml-auto font-body text-xs cursor-pointer flex items-center gap-1" style={{ color: 'var(--sage)' }} onClick={() => setEditOpen(true)}>
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricPill icon={Heart} label="HRV" value={todayData?.hrv ?? 65} unit="ms" color="#C9A0A0" />
          <MetricPill icon={Activity} label="Resting HR" value={todayData?.restingHR ?? 52} unit="bpm" color="#C9A96E" />
          <MetricPill icon={Moon} label="Deep Sleep" value={todayData?.deepSleep ?? 90} unit="min" color="#7A8B65" />
          <MetricPill icon={Zap} label="REM Sleep" value={todayData?.remSleep ?? 120} unit="min" color="#7B9EA8" />
          <MetricPill icon={Clock} label="Total Sleep" value={todayData?.totalSleep ?? 480} unit="min" color="#A67C52" />
        </div>
      </motion.div>

      {/* ═══ Edit Modal ═══ */}
      <EditModal open={editOpen} onClose={() => setEditOpen(false)} todayData={todayData} onSave={handleSave} />
    </div>
  )
}
