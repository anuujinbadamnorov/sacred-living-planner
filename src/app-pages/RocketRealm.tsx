import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import HeroSection from '@/components/HeroSection'
import {
  PawPrint,
  Sun,
  Sunrise,
  Moon,
  Footprints,
  Timer,
  TrendingUp,
  Target,
  Award,
  CalendarDays,
  Star,
  Plus,
  X,
  CheckCircle2,
  Trash2,
  Camera,
  MapPin,
  Zap,
  Brain,
  Heart,
} from 'lucide-react'

/* ─── Types ─── */
interface ExerciseEntry {
  id: string
  date: string
  morningMinutes: number
  eveningMinutes: number
  activity: string
}

interface TrainingSession {
  id: string
  date: string
  command: string
  duration: string
  rating: number
  notes: string
}

interface PhotoEntry {
  id: string
  caption: string
  date: string
  color: string
}

interface CommandProgress {
  command: string
  practiced: number
}

/* ─── Constants ─── */
const STORAGE_KEYS = {
  exercise: 'rocket-exercise',
  training: 'rocket-training',
  photos: 'rocket-photos',
  commands: 'rocket-commands',
}

const DAILY_SCHEDULE = [
  { icon: Sunrise, time: 'Morning', activity: 'Potty + breakfast (puzzle feeder)', duration: '15 min', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { icon: Sun, time: 'Midday', activity: 'Quick potty break', duration: '5 min', color: 'bg-sky-50 border-sky-200 text-sky-700' },
  { icon: Footprints, time: '5:30 PM', activity: 'Main walk + training', duration: '45-60 min', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { icon: Moon, time: 'Evening', activity: 'Potty + dinner + calm time', duration: '30 min', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
]

const WEEKLY_STRUCTURE = [
  { day: 'Monday', activity: 'Daycare day', type: 'daycare', color: 'bg-violet-50 border-violet-200' },
  { day: 'Tuesday', activity: 'Recovery day (lighter activity)', type: 'recovery', color: 'bg-amber-50 border-amber-200' },
  { day: 'Wednesday', activity: 'Normal training day', type: 'normal', color: 'bg-sky-50 border-sky-200' },
  { day: 'Thursday', activity: 'Normal training day', type: 'normal', color: 'bg-sky-50 border-sky-200' },
  { day: 'Friday', activity: 'Normal training day', type: 'normal', color: 'bg-sky-50 border-sky-200' },
  { day: 'Saturday', activity: 'Adventure walk + content filming', type: 'adventure', color: 'bg-emerald-50 border-emerald-200' },
  { day: 'Sunday', activity: 'Adventure walk + content filming', type: 'adventure', color: 'bg-emerald-50 border-emerald-200' },
]

const TRAINING_ROTATION = [
  { weeks: '1-2', name: 'Leash Manners', focus: 'Loose leash walking, stopping when pulling, proper heel position', color: 'bg-rose-50 border-rose-200' },
  { weeks: '3-4', name: 'Distance & Duration', focus: 'Stay at distance, longer holds, proofing with distractions', color: 'bg-sky-50 border-sky-200' },
  { weeks: '5-6', name: 'Impulse Control', focus: 'Leave it, wait at door, calm before meals, drop it', color: 'bg-amber-50 border-amber-200' },
  { weeks: '7-8', name: 'Advanced Skills', focus: 'Place, paw, combined commands, off-leash prep', color: 'bg-emerald-50 border-emerald-200' },
]

const ALL_COMMANDS = ['Sit', 'Stay', 'Come', 'Leave it', 'Heel', 'Place', 'Down', 'Paw']

const PHOTO_COLORS = ['bg-rose-200', 'bg-sky-200', 'bg-amber-200', 'bg-emerald-200', 'bg-violet-200', 'bg-teal-200']

const ACTIVITY_TYPES = ['Walk', 'Run', 'Hike', 'Play', 'Training']

/* ─── Storage Helpers ─── */
function load<T>(key: string, fallback: T): T {
  try {
    const r = localStorage.getItem(key)
    return r ? JSON.parse(r) : fallback
  } catch {
    return fallback
  }
}
function save<T>(key: string, v: T) {
  localStorage.setItem(key, JSON.stringify(v))
}

/* ─── Card Entrance Variants ─── */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

/* ─── Star Rating ─── */
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      <HeroSection
        title={`Rocket's Realm`}
        subtitle="Care for your loyal companion"
        imageIndex={11}
      />
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} onClick={() => onChange(s)} className="p-0.5">
          <Star className={`w-4 h-4 ${s <= value ? 'text-amber-400 fill-amber-400' : 'text-warm-300'}`} />
        </button>
      ))}
    </div>
  )
}

/* ─── Main Page ─── */
export default function RocketRealm() {
  const [exercise, setExercise] = useState<ExerciseEntry[]>(() => load(STORAGE_KEYS.exercise, []))
  const [training, setTraining] = useState<TrainingSession[]>(() => load(STORAGE_KEYS.training, []))
  const [photos, setPhotos] = useState<PhotoEntry[]>(() =>
    load(STORAGE_KEYS.photos, [
      { id: '1', caption: 'Rocket&apos;s first snow', date: '2026-01-15', color: 'bg-rose-200' },
      { id: '2', caption: 'After a long hike', date: '2026-01-20', color: 'bg-sky-200' },
      { id: '3', caption: 'Training session win', date: '2026-01-22', color: 'bg-amber-200' },
      { id: '4', caption: 'Nap time champion', date: '2026-01-25', color: 'bg-emerald-200' },
      { id: '5', caption: 'Beach day adventure', date: '2026-02-01', color: 'bg-violet-200' },
      { id: '6', caption: 'Best boy pose', date: '2026-02-05', color: 'bg-teal-200' },
    ])
  )

  /* New Entry Inputs */
  const [newExercise, setNewExercise] = useState({ morning: '', evening: '', activity: 'Walk' })
  const [newTraining, setNewTraining] = useState({ command: '', duration: '', rating: 0, notes: '' })
  const [newPhotoCaption, setNewPhotoCaption] = useState('')
  const [activeWeek, setActiveWeek] = useState(1)

  /* Persistence */
  useEffect(() => save(STORAGE_KEYS.exercise, exercise), [exercise])
  useEffect(() => save(STORAGE_KEYS.training, training), [training])
  useEffect(() => save(STORAGE_KEYS.photos, photos), [photos])

  /* Derived Stats */
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = exercise.find((e) => e.date === today)
  const todayMinutes = (todayEntry?.morningMinutes || 0) + (todayEntry?.eveningMinutes || 0)
  const weeklyMinutes = exercise
    .filter((e) => {
      const d = new Date(e.date)
      const now = new Date()
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
      return diff >= 0 && diff < 7
    })
    .reduce((sum, e) => sum + e.morningMinutes + e.eveningMinutes, 0)

  const weeklyGoal = 120 * 7 // 120 min/day * 7 days
  const weeklyProgress = Math.min((weeklyMinutes / weeklyGoal) * 100, 100)
  const statusColor = weeklyMinutes >= 120 * 7 ? 'text-emerald-600' : weeklyMinutes >= 90 * 7 ? 'text-yellow-600' : 'text-red-500'
  const statusBg = weeklyMinutes >= 120 * 7 ? 'bg-emerald-500' : weeklyMinutes >= 90 * 7 ? 'bg-yellow-500' : 'bg-red-500'

  /* Command Progress */
  const commandProgress: CommandProgress[] = ALL_COMMANDS.map((cmd) => ({
    command: cmd,
    practiced: training.filter((t) => t.command.toLowerCase() === cmd.toLowerCase()).length,
  }))

  /* Handlers */
  const addExercise = useCallback(() => {
    const morning = parseInt(newExercise.morning) || 0
    const evening = parseInt(newExercise.evening) || 0
    if (morning === 0 && evening === 0) return
    const existingIdx = exercise.findIndex((e) => e.date === today)
    if (existingIdx >= 0) {
      const updated = [...exercise]
      updated[existingIdx] = {
        ...updated[existingIdx],
        morningMinutes: morning,
        eveningMinutes: evening,
        activity: newExercise.activity,
      }
      setExercise(updated)
    } else {
      setExercise((prev) => [
        ...prev,
        { id: Date.now().toString(), date: today, morningMinutes: morning, eveningMinutes: evening, activity: newExercise.activity },
      ])
    }
    setNewExercise({ morning: '', evening: '', activity: 'Walk' })
  }, [newExercise, exercise, today])

  const addTraining = useCallback(() => {
    if (!newTraining.command.trim()) return
    setTraining((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        date: today,
        command: newTraining.command,
        duration: newTraining.duration || '10',
        rating: newTraining.rating || 3,
        notes: newTraining.notes,
      },
    ])
    setNewTraining({ command: '', duration: '', rating: 0, notes: '' })
  }, [newTraining, today])

  const addPhoto = useCallback(() => {
    if (!newPhotoCaption.trim()) return
    setPhotos((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        caption: newPhotoCaption,
        date: today,
        color: PHOTO_COLORS[prev.length % PHOTO_COLORS.length],
      },
    ])
    setNewPhotoCaption('')
  }, [newPhotoCaption, today])

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const removeTraining = useCallback((id: string) => {
    setTraining((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <>
      <div className="space-y-8 pb-12">
        {/* ═══════════════ HERO ═══════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-lg h-56 flex items-end"
          style={{
            background: 'linear-gradient(135deg, #e8eef5 0%, #dce5f0 40%, #c9d8eb 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage:
              'radial-gradient(circle at 30% 50%, #7a8e9e 0%, transparent 45%), radial-gradient(circle at 70% 40%, #9ab8c8 0%, transparent 35%)',
          }} />
          <div className="absolute top-6 right-8 flex gap-2 opacity-10">
            <PawPrint className="w-20 h-20 text-warm-800" />
            <PawPrint className="w-14 h-14 text-warm-800 translate-y-4" />
          </div>
          <div className="relative z-10 p-8 w-full">
            <div className="flex items-center gap-3 mb-2">
              <PawPrint className="w-5 h-5" style={{ color: '#5a7a8a' }} />
              <span className="text-sm font-inter font-medium uppercase tracking-widest" style={{ color: '#5a7a8a' }}>Husky Life</span>
            </div>
            <h1 className="font-playfair text-4xl font-semibold text-warm-900 mb-1">Rocket&apos;s Realm</h1>
            <p className="font-caveat text-xl text-warm-700">Everything for your best friend&apos;s best life</p>
          </div>
        </motion.section>

        {/* ═══════════════ STATS ROW ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: 'Today', value: `${todayMinutes} min`, icon: Timer, color: 'text-sky-600', bg: 'bg-sky-50' },
            { label: 'This Week', value: `${weeklyMinutes} min`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Goal', value: '120+/day', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Sessions', value: training.length, icon: Award, color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="card-planner flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-warm-500 font-inter uppercase tracking-wide">{stat.label}</p>
                <p className={`text-xl font-playfair font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══════════════ DAILY SCHEDULE + WEEKLY STRUCTURE ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Schedule */}
          <motion.section
            custom={4}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card-planner"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <Sunrise className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="font-playfair text-xl font-semibold text-warm-800">Daily Schedule</h2>
            </div>
            <div className="space-y-3">
              {DAILY_SCHEDULE.map((item) => (
                <div key={item.time} className={`rounded-md border p-3.5 ${item.color}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span className="font-inter text-sm font-semibold">{item.time}</span>
                    </div>
                    <span className="text-xs font-inter opacity-70">{item.duration}</span>
                  </div>
                  <p className="font-inter text-sm text-warm-700">{item.activity}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Weekly Structure */}
          <motion.section
            custom={5}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card-planner"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="font-playfair text-xl font-semibold text-warm-800">Weekly Structure</h2>
            </div>
            <div className="space-y-2">
              {WEEKLY_STRUCTURE.map((day) => (
                <div
                  key={day.day}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md border ${day.color}`}
                >
                  <div className="w-20 shrink-0">
                    <span className="font-inter text-sm font-semibold">{day.day}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    {day.type === 'daycare' && <Zap className="w-4 h-4 text-violet-500" />}
                    {day.type === 'recovery' && <Heart className="w-4 h-4 text-amber-500" />}
                    {day.type === 'normal' && <Footprints className="w-4 h-4 text-sky-500" />}
                    {day.type === 'adventure' && <MapPin className="w-4 h-4 text-emerald-500" />}
                    <span className="font-inter text-sm text-warm-700">{day.activity}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* ═══════════════ EXERCISE TRACKER ═══════════════ */}
        <motion.section
          custom={6}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-planner"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
              <Footprints className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-playfair text-xl font-semibold text-warm-800">Exercise Tracker</h2>
              <p className="font-caveat text-base text-warm-500">Goal: 120+ min/day for huskies</p>
            </div>
            <div className={`text-right ${statusColor}`}>
              <p className="font-playfair text-2xl font-semibold">{Math.round(weeklyProgress)}%</p>
              <p className="font-inter text-xs uppercase tracking-wide opacity-70">weekly</p>
            </div>
          </div>

          {/* Weekly Progress Bar */}
          <div className="w-full h-3 bg-warm-100 rounded-full overflow-hidden mb-5">
            <motion.div
              className={`h-full rounded-full ${statusBg}`}
              initial={{ width: 0 }}
              animate={{ width: `${weeklyProgress}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>

          {/* Status Legend */}
          <div className="flex gap-4 mb-5 text-xs font-inter text-warm-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 120+ min (green)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> 90-120 min (yellow)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> &lt;90 min (red)</span>
          </div>

          {/* Log Exercise */}
          <div className="bg-warm-50/70 rounded-md p-4 border border-warm-200">
            <h4 className="font-inter text-sm font-semibold text-warm-600 uppercase tracking-wider mb-3">Log Today&apos;s Exercise</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="number"
                placeholder="Morning (min)"
                value={newExercise.morning}
                onChange={(e) => setNewExercise((p) => ({ ...p, morning: e.target.value }))}
                className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-emerald-300"
              />
              <input
                type="number"
                placeholder="Evening (min)"
                value={newExercise.evening}
                onChange={(e) => setNewExercise((p) => ({ ...p, evening: e.target.value }))}
                className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-emerald-300"
              />
              <select
                value={newExercise.activity}
                onChange={(e) => setNewExercise((p) => ({ ...p, activity: e.target.value }))}
                className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-emerald-300"
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                onClick={addExercise}
                className="px-4 py-2 bg-emerald-500 text-white rounded-md font-inter text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Log
              </button>
            </div>
          </div>

          {/* Recent Entries */}
          {exercise.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-warm-200">
                    <th className="text-left py-2 px-2 font-inter font-medium text-warm-500 text-xs uppercase">Date</th>
                    <th className="text-left py-2 px-2 font-inter font-medium text-warm-500 text-xs uppercase">Morning</th>
                    <th className="text-left py-2 px-2 font-inter font-medium text-warm-500 text-xs uppercase">Evening</th>
                    <th className="text-left py-2 px-2 font-inter font-medium text-warm-500 text-xs uppercase">Total</th>
                    <th className="text-left py-2 px-2 font-inter font-medium text-warm-500 text-xs uppercase">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {exercise.slice(-7).reverse().map((e) => {
                    const total = e.morningMinutes + e.eveningMinutes
                    return (
                      <tr key={e.id} className="border-b border-warm-100">
                        <td className="py-2 px-2 font-inter text-warm-700">{e.date}</td>
                        <td className="py-2 px-2 font-inter text-warm-600">{e.morningMinutes}m</td>
                        <td className="py-2 px-2 font-inter text-warm-600">{e.eveningMinutes}m</td>
                        <td className={`py-2 px-2 font-inter font-medium ${total >= 120 ? 'text-emerald-600' : total >= 90 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {total}m
                        </td>
                        <td className="py-2 px-2 font-inter text-warm-500">{e.activity}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        {/* ═══════════════ 8-WEEK TRAINING ROTATION + COMMAND TRACKER ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Training Rotation */}
          <motion.section
            custom={7}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card-planner"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                <Target className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <h2 className="font-playfair text-xl font-semibold text-warm-800">8-Week Training Rotation</h2>
                <p className="font-caveat text-base text-warm-500">Click a week to set active focus</p>
              </div>
            </div>

            <div className="space-y-3">
              {TRAINING_ROTATION.map((tr, i) => {
                const weekNum = i * 2 + 1
                const isActive = activeWeek >= weekNum && activeWeek < weekNum + 2
                return (
                  <button
                    key={tr.weeks}
                    onClick={() => setActiveWeek(weekNum)}
                    className={`w-full text-left rounded-md border p-4 transition-all ${
                      isActive
                        ? `${tr.color} shadow-sm`
                        : 'bg-white border-warm-200 hover:border-warm-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-inter font-semibold uppercase tracking-wider ${isActive ? 'text-warm-600' : 'text-warm-400'}`}>
                        Weeks {tr.weeks}
                      </span>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <h4 className={`font-inter text-sm font-semibold mb-1 ${isActive ? 'text-warm-800' : 'text-warm-600'}`}>
                      {tr.name}
                    </h4>
                    <p className={`font-inter text-xs ${isActive ? 'text-warm-600' : 'text-warm-400'}`}>
                      {tr.focus}
                    </p>
                  </button>
                )
              })}
            </div>
          </motion.section>

          {/* Commands Tracker */}
          <motion.section
            custom={8}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card-planner"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <Brain className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="font-playfair text-xl font-semibold text-warm-800">Commands Progress</h2>
            </div>

            <div className="space-y-3">
              {commandProgress.map((cmd) => (
                <div key={cmd.command} className="flex items-center gap-3">
                  <span className="font-inter text-sm text-warm-700 w-20 shrink-0">{cmd.command}</span>
                  <div className="flex-1 h-2.5 bg-warm-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-amber-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((cmd.practiced / 10) * 100, 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="font-inter text-xs text-warm-500 w-8 text-right">{cmd.practiced}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-md bg-amber-50/50 border border-amber-100">
              <p className="font-caveat text-base text-warm-500">
                Practice 2-3 commands per session. Short, positive sessions work best for huskies!
              </p>
            </div>
          </motion.section>
        </div>

        {/* ═══════════════ TRAINING SESSION LOG ═══════════════ */}
        <motion.section
          custom={9}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-planner"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center">
              <Award className="w-4 h-4 text-sky-600" />
            </div>
            <h2 className="font-playfair text-xl font-semibold text-warm-800">Training Session Log</h2>
          </div>

          {/* Add Session */}
          <div className="bg-warm-50/70 rounded-md p-4 border border-warm-200 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <select
                value={newTraining.command}
                onChange={(e) => setNewTraining((p) => ({ ...p, command: e.target.value }))}
                className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-sky-300"
              >
                <option value="">Command...</option>
                {ALL_COMMANDS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Duration (min)"
                value={newTraining.duration}
                onChange={(e) => setNewTraining((p) => ({ ...p, duration: e.target.value }))}
                className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-sky-300"
              />
              <div className="flex items-center">
                <StarRating value={newTraining.rating} onChange={(v) => setNewTraining((p) => ({ ...p, rating: v }))} />
              </div>
              <input
                type="text"
                placeholder="Notes..."
                value={newTraining.notes}
                onChange={(e) => setNewTraining((p) => ({ ...p, notes: e.target.value }))}
                className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-sky-300"
              />
              <button
                onClick={addTraining}
                className="px-4 py-2 bg-sky-500 text-white rounded-md font-inter text-sm font-medium hover:bg-sky-600 transition-colors"
              >
                Log Session
              </button>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-warm-200">
                  <th className="text-left py-2 px-2 font-inter font-medium text-warm-500 text-xs uppercase">Date</th>
                  <th className="text-left py-2 px-2 font-inter font-medium text-warm-500 text-xs uppercase">Command</th>
                  <th className="text-left py-2 px-2 font-inter font-medium text-warm-500 text-xs uppercase">Duration</th>
                  <th className="text-left py-2 px-2 font-inter font-medium text-warm-500 text-xs uppercase">Rating</th>
                  <th className="text-left py-2 px-2 font-inter font-medium text-warm-500 text-xs uppercase">Notes</th>
                  <th className="py-2 px-2" />
                </tr>
              </thead>
              <tbody>
                {training.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center font-caveat text-lg text-warm-400">
                      No sessions logged yet — every great dog starts with one training session
                    </td>
                  </tr>
                )}
                {training.slice().reverse().map((s) => (
                  <tr key={s.id} className="border-b border-warm-100">
                    <td className="py-2 px-2 font-inter text-warm-700">{s.date}</td>
                    <td className="py-2 px-2 font-inter text-warm-700 font-medium">{s.command}</td>
                    <td className="py-2 px-2 font-inter text-warm-600">{s.duration}m</td>
                    <td className="py-2 px-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <Star key={r} className={`w-3 h-3 ${r <= s.rating ? 'text-amber-400 fill-amber-400' : 'text-warm-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-2 font-caveat text-sm text-warm-500">{s.notes}</td>
                    <td className="py-2 px-2">
                      <button
                        onClick={() => removeTraining(s.id)}
                        className="p-1 rounded hover:bg-rose-100 text-warm-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* ═══════════════ PHOTO GALLERY ═══════════════ */}
        <motion.section
          custom={10}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-planner"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
              <Camera className="w-4 h-4 text-rose-500" />
            </div>
            <h2 className="font-playfair text-xl font-semibold text-warm-800">Rocket&apos;s Gallery</h2>
          </div>

          {/* Add Photo */}
          <div className="flex gap-2 mb-5">
            <input
              type="text"
              placeholder="Caption for this memory..."
              value={newPhotoCaption}
              onChange={(e) => setNewPhotoCaption(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPhoto()}
              className="flex-1 px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-rose-300"
            />
            <button
              onClick={addPhoto}
              className="px-4 py-2 bg-rose-500 text-white rounded-md font-inter text-sm font-medium hover:bg-rose-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`relative aspect-square rounded-lg ${photo.color} flex flex-col items-center justify-center border border-warm-200 overflow-hidden group`}
              >
                <PawPrint className="w-10 h-10 text-white/50 mb-2" />
                <p className="font-caveat text-sm text-warm-700 text-center px-3 leading-tight">{photo.caption}</p>
                <p className="font-inter text-[0.6875rem] text-warm-500 mt-1">{photo.date}</p>
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-white/80 text-warm-500 hover:text-rose-500 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>

          {photos.length === 0 && (
            <p className="font-caveat text-lg text-warm-400 text-center py-8">
              No photos yet — every moment with Rocket is worth capturing
            </p>
          )}
        </motion.section>
      </div>
    </>
  )
}
