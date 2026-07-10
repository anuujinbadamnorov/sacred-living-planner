import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Flame,
  Timer,
  Activity,
  Calendar,
  Scale,
  Camera,
  Sparkles,
  Sunrise,
  Sunset,
  RotateCcw,
  Zap,
  Wind,
  Target,
  Plus,
  X,
  Save,
} from 'lucide-react'
import Layout from '@/components/Layout'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

// ─── Colors ───
const SAGE = '#7a8b65'
const TERRACOTTA = '#e0744c'
const CREAM = '#faf7f2'
const GOLD = '#c9a96e'

// ─── Types ───
interface ExerciseLog {
  id: string
  exercise: string
  date: string
  weight: number
  reps: number
  sets: number
}

interface BodyMeasurement {
  id: string
  date: string
  waist?: number
  hip?: number
  weight?: number
  notes?: string
}

interface WeeklyChecklist {
  [key: string]: boolean
}

// ─── 6-Day Split Data ───
const trainingSplit = [
  {
    day: 'Monday',
    focus: 'Heavy Glutes + Posterior Chain',
    duration: '60-75 min',
    color: SAGE,
    elements: ['Hip thrust', 'RDL', 'Bulgarian split squat'],
  },
  {
    day: 'Tuesday',
    focus: 'Pilates + Core Control',
    duration: '45-60 min',
    color: '#7a8b9e',
    elements: ['Breath', 'alignment', 'pelvic floor'],
  },
  {
    day: 'Wednesday',
    focus: 'Glute Hypertrophy + Upper Push',
    duration: '60-75 min',
    color: TERRACOTTA,
    elements: ['Sumo DL', 'B-stance thrust', 'chest/shoulders'],
  },
  {
    day: 'Thursday',
    focus: 'Pilates + Mobility',
    duration: '45-60 min',
    color: '#7a8b9e',
    elements: ['Recovery', 'hip mobility flow'],
  },
  {
    day: 'Friday',
    focus: 'Full Glute Focus + Pull',
    duration: '60-75 min',
    color: TERRACOTTA,
    elements: ['All angles', 'back/biceps'],
  },
  {
    day: 'Saturday',
    focus: 'Cardio + Core + Recovery',
    duration: '45-60 min',
    color: GOLD,
    elements: ['Zone 2 or intervals', 'core circuit'],
  },
  {
    day: 'Sunday',
    focus: 'REST',
    duration: '-',
    color: '#b8a896',
    elements: ['Active recovery', 'dog walks only'],
  },
]

// ─── Workout Details ───
const mondayWorkout = {
  warmUp: [
    { name: 'Cat-Cow', reps: '10 reps' },
    { name: "World's Greatest Stretch", reps: '5/side' },
    { name: '90/90 Hip Switch', reps: '8/side' },
    { name: 'Glute Activation Circuit', reps: 'Complete all' },
  ],
  main: [
    { name: 'Barbell Hip Thrust', sets: '4', reps: '6-8', rest: '2-3 min' },
    { name: 'Romanian Deadlift', sets: '3', reps: '8-10', rest: '2 min' },
    { name: 'Bulgarian Split Squat', sets: '3', reps: '8-10/leg', rest: '2 min' },
    { name: '45° Hyperextension', sets: '3', reps: '12-15', rest: '90 sec' },
    { name: 'Banded Lateral Walk', sets: '3', reps: '15/side', rest: '60 sec' },
  ],
  finisher: [
    { name: 'Dead Bug', sets: '3', reps: '8/side' },
    { name: 'Bird Dog', sets: '3', reps: '8/side' },
    { name: '360° Breathing', sets: '1', reps: '10 breaths' },
  ],
}

const wednesdayWorkout = {
  main: [
    { name: 'Sumo Deadlift', sets: '3', reps: '6-8', rest: '2-3 min' },
    { name: 'B-Stance Hip Thrust', sets: '3', reps: '10-12/leg', rest: '2 min' },
    { name: 'Cable Pull-Through', sets: '3', reps: '12-15', rest: '90 sec' },
    { name: 'Frog Pump', sets: '3', reps: '20-25', rest: '60 sec' },
    { name: 'Incline DB Press', sets: '3', reps: '8-10', rest: '90 sec', superset: 'PUSH' },
    { name: 'Lateral Raise', sets: '3', reps: '12-15', rest: '90 sec', superset: 'PUSH' },
    { name: 'Tricep Pushdown', sets: '3', reps: '12-15', rest: '60 sec', superset: 'TRI' },
    { name: 'Overhead Extension', sets: '3', reps: '12-15', rest: '60 sec', superset: 'TRI' },
    { name: 'Cable Kickback', sets: '3', reps: '15/leg', rest: '60 sec', superset: 'TRI' },
  ],
}

const fridayWorkout = {
  main: [
    { name: 'Barbell Hip Thrust', sets: '3', reps: '8-10', rest: '2 min' },
    { name: 'Deficit RDL', sets: '3', reps: '10-12', rest: '2 min' },
    { name: 'Step-Ups (weighted)', sets: '3', reps: '10-12/leg', rest: '90 sec' },
    { name: 'B-Stance RDL', sets: '3', reps: '10-12/leg', rest: '90 sec' },
    { name: 'Fire Hydrant (weighted)', sets: '3', reps: '12-15/side', rest: '60 sec' },
    { name: 'Lat Pulldown', sets: '3', reps: '10-12', rest: '90 sec', superset: 'PULL' },
    { name: 'Seated Row', sets: '3', reps: '10-12', rest: '90 sec', superset: 'PULL' },
    { name: 'Barbell Curl', sets: '3', reps: '10-12', rest: '60 sec', superset: 'BI' },
    { name: 'Hammer Curl', sets: '3', reps: '12-15', rest: '60 sec', superset: 'BI' },
  ],
}

const pilatesSession = [
  { phase: 'Breath work', duration: '5 min', details: '360° breathing, pelvic floor activation' },
  { phase: 'Warm-up flow', duration: '10 min', details: 'Cat-Cow, pelvic tilts, spinal articulation' },
  { phase: 'Main sequence', duration: '30 min', details: 'Hundreds, roll-ups, single/double leg stretch, scissors, criss-cross, plank variations, side-lying leg series, glute bridges' },
  { phase: 'Cool down', duration: '5 min', details: 'Spinal twist, child\'s pose, deep breathing' },
]

const saturdayWorkout = {
  cardio: [
    { option: 'Week A: Zone 2 Steady State', duration: '30 min', detail: '60-70% max HR' },
    { option: 'Week B: Interval Training', duration: '25 min', detail: '8 rounds: 30 sec hard / 90 sec easy' },
    { option: 'Week C: Active Recovery', duration: '20 min', detail: 'Light walk or cycle' },
  ],
  core: [
    { name: 'Pallof Press', reps: '12/side', rest: '30 sec' },
    { name: 'Dead Bug', reps: '10/side', rest: '30 sec' },
    { name: 'Side Plank', reps: '30 sec/side', rest: '30 sec' },
    { name: 'Bird Dog', reps: '10/side', rest: '30 sec' },
    { name: 'Plank', reps: '45 sec', rest: '60 sec' },
  ],
  recovery: [
    { name: 'Foam rolling', duration: '5 min' },
    { name: 'Static stretching', duration: '5 min' },
  ],
}

const dailyCore = {
  morning: [
    { name: '360° Breathing', reps: '10 breaths' },
    { name: 'Pelvic floor "knack"', reps: '10 reps' },
    { name: 'Dead Bug', reps: '2 x 8 reps' },
  ],
  evening: [
    { name: 'Cat-Cow', reps: '10 reps' },
    { name: "Child's Pose", reps: '1 min' },
    { name: 'Pelvic Tilts', reps: '10 reps' },
  ],
}

const gluteActivation = [
  { name: 'Glute Bridge with Band', reps: '15 reps' },
  { name: 'Clamshells', reps: '15/side' },
  { name: 'Quadruped Hip Extension', reps: '12/side' },
  { name: 'Banded Lateral Walk', reps: '10 steps each direction' },
  { name: 'Bodyweight Hip Thrust', reps: '15 reps' },
]

const weeklyChecklistItems = [
  { id: 'sessions', label: '6 training sessions' },
  { id: 'pilates', label: '2 Pilates sessions' },
  { id: 'gluteSets', label: '28-34 glute sets' },
  { id: 'corePF', label: 'Daily core/PF work' },
  { id: 'cardio', label: '2-3 cardio sessions' },
  { id: 'sleep', label: '7-9 hours sleep' },
  { id: 'protein', label: 'Protein target met' },
  { id: 'hrv', label: 'HRV monitored' },
  { id: 'rest', label: 'One complete rest day' },
]

const progressionTargets = [
  { exercise: 'Hip Thrust', target: '+10-20 lbs/month' },
  { exercise: 'RDL', target: '+10-15 lbs/month' },
  { exercise: 'Bulgarian Split Squat', target: '+5-10 lbs/month' },
]

// ─── localStorage Keys ───
const LS_EXERCISE_LOG = 'body-temple-exercise-log'
const LS_MEASUREMENTS = 'body-temple-measurements'
const LS_CHECKLIST = 'body-temple-checklist'

// ─── Component ───
export default function BodyTemple() {
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [exerciseLog, setExerciseLog] = useState<ExerciseLog[]>([])
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [checklist, setChecklist] = useState<WeeklyChecklist>({})
  const [showPRConfetti, setShowPRConfetti] = useState(false)
  const [activeTab, setActiveTab] = useState<'schedule' | 'tracker' | 'measurements'>('schedule')

  // Form states
  const [logExercise, setLogExercise] = useState('')
  const [logWeight, setLogWeight] = useState('')
  const [logReps, setLogReps] = useState('')
  const [logSets, setLogSets] = useState('')
  const [measureWaist, setMeasureWaist] = useState('')
  const [measureHip, setMeasureHip] = useState('')
  const [measureWeight, setMeasureWeight] = useState('')

  // Load from localStorage
  useEffect(() => {
    const storedLog = localStorage.getItem(LS_EXERCISE_LOG)
    if (storedLog) setExerciseLog(JSON.parse(storedLog))
    const storedMeas = localStorage.getItem(LS_MEASUREMENTS)
    if (storedMeas) setMeasurements(JSON.parse(storedMeas))
    const storedCheck = localStorage.getItem(LS_CHECKLIST)
    if (storedCheck) setChecklist(JSON.parse(storedCheck))
  }, [])

  // Save helpers
  const saveExerciseLog = useCallback((logs: ExerciseLog[]) => {
    setExerciseLog(logs)
    localStorage.setItem(LS_EXERCISE_LOG, JSON.stringify(logs))
  }, [])

  const saveMeasurements = useCallback((meas: BodyMeasurement[]) => {
    setMeasurements(meas)
    localStorage.setItem(LS_MEASUREMENTS, JSON.stringify(meas))
  }, [])

  const saveChecklist = useCallback((check: WeeklyChecklist) => {
    setChecklist(check)
    localStorage.setItem(LS_CHECKLIST, JSON.stringify(check))
  }, [])

  const toggleChecklistItem = (id: string) => {
    const updated = { ...checklist, [id]: !checklist[id] }
    saveChecklist(updated)
  }

  const addExerciseLog = () => {
    if (!logExercise || !logWeight || !logReps || !logSets) return
    const newLog: ExerciseLog = {
      id: Date.now().toString(),
      exercise: logExercise,
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(logWeight),
      reps: parseInt(logReps),
      sets: parseInt(logSets),
    }
    const updated = [newLog, ...exerciseLog]
    saveExerciseLog(updated)
    setShowPRConfetti(true)
    setTimeout(() => setShowPRConfetti(false), 3000)
    setLogExercise('')
    setLogWeight('')
    setLogReps('')
    setLogSets('')
  }

  const deleteLog = (id: string) => {
    const updated = exerciseLog.filter((l) => l.id !== id)
    saveExerciseLog(updated)
  }

  const addMeasurement = () => {
    if (!measureWaist && !measureHip && !measureWeight) return
    const newMeas: BodyMeasurement = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      waist: measureWaist ? parseFloat(measureWaist) : undefined,
      hip: measureHip ? parseFloat(measureHip) : undefined,
      weight: measureWeight ? parseFloat(measureWeight) : undefined,
    }
    const updated = [newMeas, ...measurements]
    saveMeasurements(updated)
    setMeasureWaist('')
    setMeasureHip('')
    setMeasureWeight('')
  }

  const deleteMeasurement = (id: string) => {
    const updated = measurements.filter((m) => m.id !== id)
    saveMeasurements(updated)
  }

  const toggleExpand = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day)
  }

  // Calculate 1RM estimate (Epley formula)
  const calculate1RM = (weight: number, reps: number) => {
    return Math.round(weight * (1 + reps / 30))
  }

  // Get today's day name
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ─── Hero ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative overflow-hidden rounded-lg"
          style={{ background: `linear-gradient(135deg, ${CREAM} 0%, #f0ebe3 100%)` }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 text-8xl font-playfair text-sage-600">✦</div>
            <div className="absolute bottom-4 left-8 text-6xl font-playfair" style={{ color: SAGE }}>✦</div>
          </div>
          <div className="relative px-8 py-12 md:px-12 md:py-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${SAGE}20` }}>
                <Dumbbell className="w-5 h-5" style={{ color: SAGE }} />
              </div>
              <span className="font-caveat text-lg" style={{ color: SAGE }}>Move with intention</span>
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-semibold text-warm-900 mb-2">
              Body Temple
            </h1>
            <p className="font-caveat text-xl text-warm-600">
              Movement as medicine, strength as ritual
            </p>
          </div>
        </motion.div>

        {/* ─── Tab Navigation ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          className="flex gap-2 border-b border-warm-200"
        >
          {[
            { key: 'schedule', label: 'Training Schedule', icon: Calendar },
            { key: 'tracker', label: 'Progress Tracker', icon: TrendingUp },
            { key: 'measurements', label: 'Body & Checklist', icon: Scale },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 font-inter text-sm font-medium transition-all border-b-2 -mb-px',
                activeTab === tab.key
                  ? 'border-warm-800 text-warm-900'
                  : 'border-transparent text-warm-500 hover:text-warm-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* ─── SCHEDULE TAB ─── */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            {/* Weekly Split Overview */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
            >
              <h2 className="font-playfair text-2xl text-warm-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: SAGE }} />
                6-Day Training Split
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {trainingSplit.map((day, i) => {
                  const isToday = day.day === todayName
                  return (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE, delay: 0.2 + i * 0.05 }}
                      onClick={() => day.day !== 'Sunday' && toggleExpand(day.day)}
                      className={cn(
                        'card-planner card-planner-hover cursor-pointer relative overflow-hidden',
                        isToday && 'ring-2',
                        expandedDay === day.day && 'ring-1'
                      )}
                      style={isToday ? { outline: `2px solid ${SAGE}` } : undefined}
                    >
                      {isToday && (
                        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: SAGE }} />
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-inter text-xs font-semibold uppercase tracking-wider" style={{ color: day.color }}>
                          {day.day}
                        </span>
                        {isToday && (
                          <span className="text-[0.625rem] font-inter font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${SAGE}20`, color: SAGE }}>
                            TODAY
                          </span>
                        )}
                      </div>
                      <h3 className="font-playfair text-base font-medium text-warm-900 mb-1">{day.focus}</h3>
                      <div className="flex items-center gap-1 text-warm-500">
                        <Timer className="w-3 h-3" />
                        <span className="font-inter text-xs">{day.duration}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {day.elements.map((el) => (
                          <span key={el} className="text-[0.625rem] font-inter px-2 py-0.5 rounded-full bg-warm-100 text-warm-600">
                            {el}
                          </span>
                        ))}
                      </div>
                      {day.day !== 'Sunday' && (
                        <div className="flex items-center gap-1 mt-3 text-warm-400">
                          {expandedDay === day.day ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                          <span className="text-xs font-inter">
                            {expandedDay === day.day ? 'Collapse' : 'Expand'}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Expanded Workout Details */}
            <AnimatePresence mode="wait">
              {expandedDay === 'Monday' && (
                <ExpandedWorkoutCard
                  key="monday"
                  title="Monday: Heavy Glutes + Posterior Chain"
                  color={SAGE}
                  icon={Dumbbell}
                >
                  <WorkoutSection title="Warm-Up (10 min)" color={SAGE}>
                    {mondayWorkout.warmUp.map((ex, i) => (
                      <ExerciseRow key={i} name={ex.name} detail={ex.reps} color={SAGE} />
                    ))}
                  </WorkoutSection>
                  <WorkoutSection title="Main Workout" color={SAGE}>
                    {mondayWorkout.main.map((ex, i) => (
                      <ExerciseRow key={i} name={ex.name} sets={ex.sets} reps={ex.reps} rest={ex.rest} color={SAGE} />
                    ))}
                  </WorkoutSection>
                  <WorkoutSection title="Core Finisher (5 min)" color={SAGE}>
                    {mondayWorkout.finisher.map((ex, i) => (
                      <ExerciseRow key={i} name={ex.name} sets={ex.sets} reps={ex.reps} color={SAGE} />
                    ))}
                  </WorkoutSection>
                </ExpandedWorkoutCard>
              )}

              {expandedDay === 'Wednesday' && (
                <ExpandedWorkoutCard
                  key="wednesday"
                  title="Wednesday: Glute Hypertrophy + Upper Push"
                  color={TERRACOTTA}
                  icon={Flame}
                >
                  <WorkoutSection title="Main Workout" color={TERRACOTTA}>
                    {wednesdayWorkout.main.map((ex, i) => (
                      <ExerciseRow key={i} name={ex.name} sets={ex.sets} reps={ex.reps} rest={ex.rest} color={TERRACOTTA} superset={ex.superset} />
                    ))}
                  </WorkoutSection>
                  <div className="mt-4 p-3 rounded-md bg-warm-50">
                    <p className="font-caveat text-warm-600 text-base">
                      Superset exercises marked PUSH and TRI — perform back-to-back with minimal rest.
                    </p>
                  </div>
                </ExpandedWorkoutCard>
              )}

              {expandedDay === 'Friday' && (
                <ExpandedWorkoutCard
                  key="friday"
                  title="Friday: Full Glute Focus + Pull"
                  color={TERRACOTTA}
                  icon={Target}
                >
                  <WorkoutSection title="Main Workout" color={TERRACOTTA}>
                    {fridayWorkout.main.map((ex, i) => (
                      <ExerciseRow key={i} name={ex.name} sets={ex.sets} reps={ex.reps} rest={ex.rest} color={TERRACOTTA} superset={ex.superset} />
                    ))}
                  </WorkoutSection>
                  <div className="mt-4 p-3 rounded-md bg-warm-50">
                    <p className="font-caveat text-warm-600 text-base">
                      Superset exercises marked PULL and BI — perform back-to-back with minimal rest.
                    </p>
                  </div>
                </ExpandedWorkoutCard>
              )}

              {expandedDay === 'Tuesday' && (
                <ExpandedWorkoutCard
                  key="tuesday"
                  title="Tuesday: Pilates + Core Control"
                  color="#7a8b9e"
                  icon={Wind}
                >
                  {pilatesSession.map((phase, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#7a8b9e' }} />
                        <span className="font-inter text-sm font-medium text-warm-800">
                          {phase.phase}
                        </span>
                        <span className="font-inter text-xs text-warm-400">({phase.duration})</span>
                      </div>
                      <p className="font-inter text-sm text-warm-600 ml-4">{phase.details}</p>
                    </div>
                  ))}
                </ExpandedWorkoutCard>
              )}

              {expandedDay === 'Thursday' && (
                <ExpandedWorkoutCard
                  key="thursday"
                  title="Thursday: Pilates + Mobility"
                  color="#7a8b9e"
                  icon={Activity}
                >
                  {pilatesSession.map((phase, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#7a8b9e' }} />
                        <span className="font-inter text-sm font-medium text-warm-800">
                          {phase.phase}
                        </span>
                        <span className="font-inter text-xs text-warm-400">({phase.duration})</span>
                      </div>
                      <p className="font-inter text-sm text-warm-600 ml-4">{phase.details}</p>
                    </div>
                  ))}
                  <div className="mt-4 p-3 rounded-md bg-warm-50">
                    <p className="font-caveat text-warm-600 text-base">
                      Focus on deep hip mobility and spinal articulation. Move slowly with breath.
                    </p>
                  </div>
                </ExpandedWorkoutCard>
              )}

              {expandedDay === 'Saturday' && (
                <ExpandedWorkoutCard
                  key="saturday"
                  title="Saturday: Cardio + Core + Recovery"
                  color={GOLD}
                  icon={Zap}
                >
                  <WorkoutSection title="Cardio Options (rotate weekly)" color={GOLD}>
                    {saturdayWorkout.cardio.map((opt, i) => (
                      <ExerciseRow key={i} name={opt.option} detail={`${opt.duration} — ${opt.detail}`} color={GOLD} />
                    ))}
                  </WorkoutSection>
                  <WorkoutSection title="Core Circuit (3 rounds)" color={GOLD}>
                    {saturdayWorkout.core.map((ex, i) => (
                      <ExerciseRow key={i} name={ex.name} reps={ex.reps} rest={ex.rest} color={GOLD} />
                    ))}
                  </WorkoutSection>
                  <WorkoutSection title="Recovery Protocol (10 min)" color={GOLD}>
                    {saturdayWorkout.recovery.map((ex, i) => (
                      <ExerciseRow key={i} name={ex.name} detail={ex.duration} color={GOLD} />
                    ))}
                  </WorkoutSection>
                </ExpandedWorkoutCard>
              )}
            </AnimatePresence>

            {/* Glute Activation Protocol */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
              className="card-planner"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${SAGE}18` }}>
                  <Flame className="w-4.5 h-4.5" style={{ color: SAGE }} />
                </div>
                <h2 className="font-playfair text-xl text-warm-900">Glute Activation Protocol</h2>
                <span className="font-caveat text-sm text-warm-500 ml-auto">Before every glute session</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {gluteActivation.map((ex, i) => (
                  <motion.div
                    key={ex.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="p-3 rounded-md bg-warm-50 border border-warm-200"
                  >
                    <p className="font-inter text-sm font-medium text-warm-800">{ex.name}</p>
                    <p className="font-inter text-xs text-warm-500 mt-1">{ex.reps}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Daily Core + Pelvic Floor */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="card-planner">
                <div className="flex items-center gap-2 mb-4">
                  <Sunrise className="w-4 h-4" style={{ color: GOLD }} />
                  <h3 className="font-playfair text-lg text-warm-900">Morning Core (5 min)</h3>
                </div>
                <div className="space-y-2">
                  {dailyCore.morning.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-warm-100 last:border-0">
                      <span className="font-inter text-sm text-warm-700">{ex.name}</span>
                      <span className="font-inter text-xs text-warm-500">{ex.reps}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-planner">
                <div className="flex items-center gap-2 mb-4">
                  <Sunset className="w-4 h-4" style={{ color: '#7a8b9e' }} />
                  <h3 className="font-playfair text-lg text-warm-900">Evening Core (5 min)</h3>
                </div>
                <div className="space-y-2">
                  {dailyCore.evening.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-warm-100 last:border-0">
                      <span className="font-inter text-sm text-warm-700">{ex.name}</span>
                      <span className="font-inter text-xs text-warm-500">{ex.reps}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Weekly Checklist */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
              className="card-planner"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${GOLD}18` }}>
                  <CheckCircle2 className="w-4.5 h-4.5" style={{ color: GOLD }} />
                </div>
                <h2 className="font-playfair text-xl text-warm-900">Weekly Checklist</h2>
                <span className="ml-auto font-inter text-xs text-warm-500">
                  {Object.values(checklist).filter(Boolean).length}/{weeklyChecklistItems.length} completed
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {weeklyChecklistItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className="flex items-center gap-3 p-3 rounded-md border border-warm-200 hover:bg-warm-50 transition-all text-left"
                  >
                    {checklist[item.id] ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: SAGE }} />
                    ) : (
                      <Circle className="w-5 h-5 shrink-0 text-warm-300" />
                    )}
                    <span className={cn('font-inter text-sm', checklist[item.id] ? 'text-warm-800 line-through' : 'text-warm-700')}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-2 bg-warm-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: SAGE }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(Object.values(checklist).filter(Boolean).length / weeklyChecklistItems.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
              </div>
            </motion.div>
          </div>
        )}

        {/* ─── TRACKER TAB ─── */}
        {activeTab === 'tracker' && (
          <div className="space-y-8">
            {/* PR Confetti */}
            <AnimatePresence>
              {showPRConfetti && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed top-20 right-8 z-50 bg-white border border-warm-200 rounded-lg shadow-lg p-4 flex items-center gap-3"
                >
                  <Trophy className="w-6 h-6" style={{ color: GOLD }} />
                  <div>
                    <p className="font-playfair text-base font-medium text-warm-900">New Entry Logged!</p>
                    <p className="font-caveat text-sm text-warm-500">Every rep is a prayer of strength</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add Exercise Log */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="card-planner"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${SAGE}18` }}>
                  <Plus className="w-4.5 h-4.5" style={{ color: SAGE }} />
                </div>
                <h2 className="font-playfair text-xl text-warm-900">Log Exercise</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <input
                  type="text"
                  placeholder="Exercise name..."
                  value={logExercise}
                  onChange={(e) => setLogExercise(e.target.value)}
                  className="planner-input border border-warm-200 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Weight (lbs)"
                  value={logWeight}
                  onChange={(e) => setLogWeight(e.target.value)}
                  className="planner-input border border-warm-200 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Reps"
                  value={logReps}
                  onChange={(e) => setLogReps(e.target.value)}
                  className="planner-input border border-warm-200 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Sets"
                  value={logSets}
                  onChange={(e) => setLogSets(e.target.value)}
                  className="planner-input border border-warm-200 rounded-md px-3 py-2"
                />
                <button
                  onClick={addExerciseLog}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-inter text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: SAGE }}
                >
                  <Save className="w-4 h-4" />
                  Log
                </button>
              </div>
            </motion.div>

            {/* Progressive Overload Targets */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              className="card-planner"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${TERRACOTTA}18` }}>
                  <TrendingUp className="w-4.5 h-4.5" style={{ color: TERRACOTTA }} />
                </div>
                <h2 className="font-playfair text-xl text-warm-900">Progressive Overload Targets</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {progressionTargets.map((target, i) => (
                  <div key={target.exercise} className="p-4 rounded-md border border-warm-200 bg-warm-50">
                    <p className="font-inter text-sm font-medium text-warm-800">{target.exercise}</p>
                    <p className="font-inter text-xs text-warm-500 mt-1">Target: {target.target}</p>
                    <div className="mt-2 h-1.5 bg-warm-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: TERRACOTTA }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((exerciseLog.filter(l => l.exercise.toLowerCase().includes(target.exercise.toLowerCase().split(' ')[0])).length * 20) + 20, 100)}%` }}
                        transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Exercise Log History */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
              className="card-planner"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${GOLD}18` }}>
                  <RotateCcw className="w-4.5 h-4.5" style={{ color: GOLD }} />
                </div>
                <h2 className="font-playfair text-xl text-warm-900">Exercise History</h2>
                <span className="ml-auto font-inter text-xs text-warm-500">{exerciseLog.length} entries</span>
              </div>
              {exerciseLog.length === 0 ? (
                <div className="text-center py-8">
                  <Dumbbell className="w-8 h-8 mx-auto text-warm-300 mb-2" />
                  <p className="font-caveat text-lg text-warm-400">No entries yet. Start logging your lifts!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {exerciseLog.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="flex items-center justify-between p-3 rounded-md border border-warm-200 hover:bg-warm-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-inter text-sm font-medium text-warm-800">{log.exercise}</span>
                          <span className="font-inter text-xs text-warm-400">{log.date}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="font-inter text-xs text-warm-600">{log.weight} lbs</span>
                          <span className="font-inter text-xs text-warm-600">{log.reps} reps</span>
                          <span className="font-inter text-xs text-warm-600">{log.sets} sets</span>
                          <span className="font-inter text-xs" style={{ color: SAGE }}>
                            Est 1RM: {calculate1RM(log.weight, log.reps)} lbs
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteLog(log.id)}
                        className="p-1.5 rounded-md hover:bg-warm-100 text-warm-400 hover:text-error transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* ─── MEASUREMENTS TAB ─── */}
        {activeTab === 'measurements' && (
          <div className="space-y-8">
            {/* Add Measurement */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="card-planner"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${SAGE}18` }}>
                  <Plus className="w-4.5 h-4.5" style={{ color: SAGE }} />
                </div>
                <h2 className="font-playfair text-xl text-warm-900">Log Measurement</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="number"
                  placeholder="Waist (inches)"
                  value={measureWaist}
                  onChange={(e) => setMeasureWaist(e.target.value)}
                  className="planner-input border border-warm-200 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Hip (inches)"
                  value={measureHip}
                  onChange={(e) => setMeasureHip(e.target.value)}
                  className="planner-input border border-warm-200 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Weight (lbs)"
                  value={measureWeight}
                  onChange={(e) => setMeasureWeight(e.target.value)}
                  className="planner-input border border-warm-200 rounded-md px-3 py-2"
                />
                <button
                  onClick={addMeasurement}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-inter text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: SAGE }}
                >
                  <Save className="w-4 h-4" />
                  Log
                </button>
              </div>
            </motion.div>

            {/* Measurements Table */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              className="card-planner"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${TERRACOTTA}18` }}>
                  <Scale className="w-4.5 h-4.5" style={{ color: TERRACOTTA }} />
                </div>
                <h2 className="font-playfair text-xl text-warm-900">Body Measurements</h2>
              </div>
              {measurements.length === 0 ? (
                <div className="text-center py-8">
                  <Scale className="w-8 h-8 mx-auto text-warm-300 mb-2" />
                  <p className="font-caveat text-lg text-warm-400">No measurements yet. Track your progress!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-warm-200">
                        <th className="text-left py-2 px-3 font-inter text-xs font-medium text-warm-500 uppercase">Date</th>
                        <th className="text-left py-2 px-3 font-inter text-xs font-medium text-warm-500 uppercase">Waist</th>
                        <th className="text-left py-2 px-3 font-inter text-xs font-medium text-warm-500 uppercase">Hip</th>
                        <th className="text-left py-2 px-3 font-inter text-xs font-medium text-warm-500 uppercase">Weight</th>
                        <th className="text-left py-2 px-3 font-inter text-xs font-medium text-warm-500 uppercase">W/H Ratio</th>
                        <th className="text-right py-2 px-3 font-inter text-xs font-medium text-warm-500 uppercase"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {measurements.map((m, i) => (
                        <motion.tr
                          key={m.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-warm-100 last:border-0 hover:bg-warm-50"
                        >
                          <td className="py-2 px-3 font-inter text-sm text-warm-700">{m.date}</td>
                          <td className="py-2 px-3 font-inter text-sm text-warm-700">{m.waist ? `${m.waist}"` : '-'}</td>
                          <td className="py-2 px-3 font-inter text-sm text-warm-700">{m.hip ? `${m.hip}"` : '-'}</td>
                          <td className="py-2 px-3 font-inter text-sm text-warm-700">{m.weight ? `${m.weight} lbs` : '-'}</td>
                          <td className="py-2 px-3 font-inter text-sm text-warm-700">
                            {m.waist && m.hip ? (m.waist / m.hip).toFixed(2) : '-'}
                          </td>
                          <td className="text-right py-2 px-3">
                            <button
                              onClick={() => deleteMeasurement(m.id)}
                              className="p-1.5 rounded-md hover:bg-warm-100 text-warm-400 hover:text-error transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* Progress Photos Reminder */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
              className="card-planner"
              style={{ borderTop: `2px solid ${GOLD}` }}
            >
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5" style={{ color: GOLD }} />
                <div>
                  <h3 className="font-playfair text-base text-warm-900">Progress Photos</h3>
                  <p className="font-inter text-xs text-warm-500">Take front, side, and back photos every 4 weeks, same time of day, same lighting</p>
                </div>
              </div>
            </motion.div>

            {/* Affirmation */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
              className="chic-card text-center"
            >
              <Sparkles className="w-5 h-5 mx-auto mb-2" style={{ color: GOLD }} />
              <p className="font-caveat text-xl text-warm-700">
                "Your body is the temple, movement is the prayer, strength is the devotion."
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  )
}

// ─── Sub-Components ───

function ExpandedWorkoutCard({
  title,
  color,
  icon: Icon,
  children,
}: {
  title: string
  color: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="card-planner overflow-hidden"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        <h3 className="font-playfair text-lg text-warm-900">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

function WorkoutSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <h4 className="font-inter text-sm font-semibold text-warm-700 mb-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        {title}
      </h4>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function ExerciseRow({
  name,
  detail,
  sets,
  reps,
  rest,
  color,
  superset,
}: {
  name: string
  detail?: string
  sets?: string
  reps?: string
  rest?: string
  color: string
  superset?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-2 px-3 rounded-md',
        superset ? 'bg-warm-50 border border-warm-100' : 'hover:bg-warm-50'
      )}
    >
      <div className="flex items-center gap-2">
        {superset && (
          <span
            className="text-[0.625rem] font-inter font-bold px-1.5 py-0.5 rounded text-white"
            style={{ backgroundColor: color }}
          >
            {superset}
          </span>
        )}
        <span className="font-inter text-sm text-warm-700">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        {sets && <span className="font-inter text-xs text-warm-500">{sets} sets</span>}
        {reps && <span className="font-inter text-xs text-warm-500">{reps}</span>}
        {rest && <span className="font-inter text-xs text-warm-400 flex items-center gap-1"><Timer className="w-3 h-3" />{rest}</span>}
        {detail && <span className="font-inter text-xs text-warm-500">{detail}</span>}
      </div>
    </div>
  )
}
