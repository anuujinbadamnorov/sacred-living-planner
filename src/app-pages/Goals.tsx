import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSection from '@/components/HeroSection'
import {
  Sprout,
  Briefcase,
  HeartPulse,
  Users,
  Palette,
  Plus,
  Trash2,
  ChevronDown,
  Star,
  Flame,
  Trophy,
  Target,
} from 'lucide-react'
import { usePlanner } from '@/hooks/usePlanner'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface Goal {
  id: string
  text: string
  category: string
  description: string
  progress: number
  milestones: { id: string; text: string; done: boolean }[]
}

interface Habit {
  id: string
  name: string
  color: string
  frequency: 'daily' | 'weekly'
  timesPerWeek: number
  active: boolean
}

interface MonthlyCheckIn {
  month: number
  rating: number
  wins: string
  focus: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const GOAL_CATEGORIES = [
  { key: 'personal-growth', label: 'Personal Growth', icon: Sprout, accent: '#7a9e7a' },
  { key: 'health-wellness', label: 'Health & Wellness', icon: HeartPulse, accent: '#e85d78' },
  { key: 'career', label: 'Career', icon: Briefcase, accent: '#7a8e9e' },
  { key: 'relationships', label: 'Relationships', icon: Users, accent: '#d4a76a' },
  { key: 'finance', label: 'Finance', icon: Target, accent: '#5a7a6a' },
  { key: 'creativity', label: 'Creativity', icon: Palette, accent: '#f07d94' },
] as const

const MONTHS_2026 = [
  { value: 5, label: 'Jun' },
  { value: 6, label: 'Jul' },
  { value: 7, label: 'Aug' },
  { value: 8, label: 'Sep' },
  { value: 9, label: 'Oct' },
  { value: 10, label: 'Nov' },
  { value: 11, label: 'Dec' },
]

const HABIT_COLORS = ['#e85d78', '#7a9e7a', '#d4a76a', '#7a8e9e', '#c47272', '#f07d94', '#8e7ac4', '#5a7a6a']

const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', name: 'Drink 8 glasses of water', color: '#7a8e9e', frequency: 'daily', timesPerWeek: 7, active: true },
  { id: 'h2', name: 'Exercise 30 min', color: '#e85d78', frequency: 'daily', timesPerWeek: 7, active: true },
  { id: 'h3', name: 'Read 20 pages', color: '#d4a76a', frequency: 'daily', timesPerWeek: 7, active: true },
  { id: 'h4', name: 'Meditate', color: '#7a9e7a', frequency: 'daily', timesPerWeek: 7, active: true },
  { id: 'h5', name: 'No phone before bed', color: '#7a8e9e', frequency: 'daily', timesPerWeek: 7, active: true },
  { id: 'h6', name: 'Journal', color: '#f07d94', frequency: 'daily', timesPerWeek: 7, active: true },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const uid = () => Math.random().toString(36).slice(2, 10)

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function Goals() {
  const { getStorageItem, setStorageItem } = usePlanner()

  /* ---- Goals state ---- */
  const [goals, setGoals] = useState<Goal[]>(() =>
    getStorageItem<Goal[]>('planner-goals', [])
  )

  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [newGoalCategory, setNewGoalCategory] = useState<string | null>(null)
  const [newGoalText, setNewGoalText] = useState('')
  const [newGoalDesc, setNewGoalDesc] = useState('')

  /* ---- Habits state ---- */
  const [habits, setHabits] = useState<Habit[]>(() => {
    const stored = getStorageItem<Habit[]>('planner-habits', [])
    return stored.length > 0 ? stored : DEFAULT_HABITS
  })
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitColor, setNewHabitColor] = useState(HABIT_COLORS[0])
  const [newHabitFreq, setNewHabitFreq] = useState<'daily' | 'weekly'>('daily')

  /* ---- Monthly check-in state ---- */
  const [checkIns, setCheckIns] = useState<MonthlyCheckIn[]>(() =>
    getStorageItem<MonthlyCheckIn[]>('planner-checkins-2026', [])
  )
  const [activeCheckInMonth, setActiveCheckInMonth] = useState(5)

  /* ---- Persist ---- */
  useEffect(() => {
    setStorageItem('planner-goals', goals)
  }, [goals, setStorageItem])

  useEffect(() => {
    setStorageItem('planner-habits', habits)
  }, [habits, setStorageItem])

  useEffect(() => {
    setStorageItem('planner-checkins-2026', checkIns)
  }, [checkIns, setStorageItem])

  /* ---- Goal helpers ---- */
  const addGoal = useCallback(() => {
    if (!newGoalText.trim() || !newGoalCategory) return
    const goal: Goal = {
      id: uid(),
      text: newGoalText.trim(),
      category: newGoalCategory,
      description: newGoalDesc.trim(),
      progress: 0,
      milestones: [],
    }
    setGoals((prev) => [...prev, goal])
    setNewGoalText('')
    setNewGoalDesc('')
    setNewGoalCategory(null)
  }, [newGoalText, newGoalCategory, newGoalDesc])

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)))
  }, [])

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
    setExpandedGoal(null)
  }, [])

  const addMilestone = useCallback((goalId: string, text: string) => {
    if (!text.trim()) return
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, milestones: [...g.milestones, { id: uid(), text: text.trim(), done: false }] }
          : g
      )
    )
  }, [])

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g
        const updated = g.milestones.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m))
        const doneCount = updated.filter((m) => m.done).length
        const progress = updated.length > 0 ? Math.round((doneCount / updated.length) * 100) : g.progress
        return { ...g, milestones: updated, progress }
      })
    )
  }, [])

  const deleteMilestone = useCallback((goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, milestones: g.milestones.filter((m) => m.id !== milestoneId) }
          : g
      )
    )
  }, [])

  /* ---- Habit helpers ---- */
  const addHabit = useCallback(() => {
    if (!newHabitName.trim()) return
    const habit: Habit = {
      id: uid(),
      name: newHabitName.trim(),
      color: newHabitColor,
      frequency: newHabitFreq,
      timesPerWeek: newHabitFreq === 'daily' ? 7 : 3,
      active: true,
    }
    setHabits((prev) => [...prev, habit])
    setNewHabitName('')
    setNewHabitColor(HABIT_COLORS[0])
    setNewHabitFreq('daily')
    setShowAddHabit(false)
  }, [newHabitName, newHabitColor, newHabitFreq])

  const toggleHabit = useCallback((id: string) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, active: !h.active } : h)))
  }, [])

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }, [])

  /* ---- Check-in helpers ---- */
  const getCheckIn = useCallback(
    (month: number): MonthlyCheckIn => {
      return checkIns.find((c) => c.month === month) || { month, rating: 0, wins: '', focus: '' }
    },
    [checkIns]
  )

  const updateCheckIn = useCallback((month: number, updates: Partial<MonthlyCheckIn>) => {
    setCheckIns((prev) => {
      const existing = prev.find((c) => c.month === month)
      if (existing) {
        return prev.map((c) => (c.month === month ? { ...c, ...updates } : c))
      }
      return [...prev, { month, rating: 0, wins: '', focus: '', ...updates }]
    })
  }, [])

  /* ---- Render ---- */
  return (
    <>
      <div className="space-y-8 pb-12">
        {/* ====== Page Header ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <p className="text-sm font-inter font-medium text-warm-500 uppercase tracking-widest mb-1">
            Goals & Intentions
          </p>
          <h1 className="font-playfair font-semibold text-warm-900" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            My Goals for 2026
          </h1>
          <p className="text-warm-500 font-inter mt-1">Dream big. Track progress. Celebrate wins.</p>
        </motion.div>

        {/* ====== Yearly Goals Section ====== */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {GOAL_CATEGORIES.map((cat, i) => {
            const catGoals = goals.filter((g) => g.category === cat.key)
            const Icon = cat.icon
            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                }}
                className="card-planner"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cat.accent}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: cat.accent }} />
                    </div>
                    <h3 className="font-playfair font-medium text-warm-800 text-base">{cat.label}</h3>
                  </div>
                  <button
                    onClick={() => setNewGoalCategory(newGoalCategory === cat.key ? null : cat.key)}
                    className="text-rose-600 hover:text-rose-700 text-sm font-inter font-medium flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {/* Add Goal Inline Form */}
                <AnimatePresence>
                  {newGoalCategory === cat.key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden mb-3"
                    >
                      <div className="bg-warm-50 rounded-md p-3 space-y-2">
                        <input
                          type="text"
                          value={newGoalText}
                          onChange={(e) => setNewGoalText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                          placeholder="Enter your goal..."
                          className="w-full px-3 py-2 text-sm font-inter border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                          autoFocus
                        />
                        <textarea
                          value={newGoalDesc}
                          onChange={(e) => setNewGoalDesc(e.target.value)}
                          placeholder="Why this goal matters... (optional)"
                          className="w-full px-3 py-2 text-sm font-caveat border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button onClick={addGoal} className="btn-primary text-xs py-1.5">Save</button>
                          <button
                            onClick={() => { setNewGoalCategory(null); setNewGoalText(''); setNewGoalDesc('') }}
                            className="px-3 py-1.5 text-xs font-inter font-medium text-warm-600 hover:text-warm-800 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Goals List */}
                <div className="space-y-2">
                  <AnimatePresence>
                    {catGoals.length === 0 ? (
                      <p className="text-sm text-warm-400 font-inter italic py-2">No goals yet. Add your first goal!</p>
                    ) : (
                      catGoals.map((goal) => (
                        <motion.div
                          key={goal.id}
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="border border-warm-200 rounded-md overflow-hidden"
                        >
                          {/* Goal Row */}
                          <div
                            className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-warm-50 transition-colors"
                            onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                          >
                            <span className="font-inter font-medium text-sm text-warm-700 flex-1 truncate pr-2">
                              {goal.text}
                            </span>
                            <div className="flex items-center gap-2">
                              {/* Progress Bar */}
                              <div className="w-[80px] h-1.5 bg-warm-200 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: cat.accent }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${goal.progress}%` }}
                                  transition={{ duration: 0.5, ease: 'easeOut' }}
                                />
                              </div>
                              <span className="text-xs font-inter font-semibold text-warm-500 w-8 text-right">
                                {goal.progress}%
                              </span>
                              <motion.div
                                animate={{ rotate: expandedGoal === goal.id ? 180 : 0 }}
                                transition={{ duration: 0.25 }}
                              >
                                <ChevronDown className="w-4 h-4 text-warm-400" />
                              </motion.div>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {expandedGoal === goal.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                                className="overflow-hidden"
                              >
                                <div className="px-3 pb-3 pt-1 border-t border-warm-100 space-y-3">
                                  {/* Description */}
                                  <textarea
                                    value={goal.description}
                                    onChange={(e) => updateGoal(goal.id, { description: e.target.value })}
                                    placeholder="Why this goal matters..."
                                    className="planner-input text-sm"
                                    rows={2}
                                    onClick={(e) => e.stopPropagation()}
                                  />

                                  {/* Progress Slider */}
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-inter text-warm-500">Progress:</span>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      value={goal.progress}
                                      onChange={(e) => updateGoal(goal.id, { progress: Number(e.target.value) })}
                                      className="flex-1 accent-rose-500"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="text-xs font-inter font-semibold text-warm-600 w-8">{goal.progress}%</span>
                                  </div>

                                  {/* Milestones */}
                                  <div className="space-y-1.5">
                                    <span className="text-xs font-inter font-semibold text-warm-500 uppercase tracking-wide">
                                      Milestones
                                    </span>
                                    {goal.milestones.map((m) => (
                                      <div key={m.id} className="flex items-center gap-2 group">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); toggleMilestone(goal.id, m.id) }}
                                          className={`w-[18px] h-[18px] rounded-[3px] border-[1.5px] flex items-center justify-center transition-all duration-200 shrink-0 ${
                                            m.done
                                              ? 'bg-rose-500 border-rose-500'
                                              : 'border-warm-300 hover:border-rose-300'
                                          }`}
                                        >
                                          {m.done && (
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                          )}
                                        </button>
                                        <span
                                          className={`text-sm font-inter flex-1 ${
                                            m.done ? 'line-through text-warm-400' : 'text-warm-700'
                                          }`}
                                          style={{ textDecorationColor: 'var(--rose-300)' }}
                                        >
                                          {m.text}
                                        </span>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); deleteMilestone(goal.id, m.id) }}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity text-warm-400 hover:text-error"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                    {/* Add Milestone */}
                                    <AddMilestoneInput onAdd={(text) => addMilestone(goal.id, text)} />
                                  </div>

                                  {/* Delete Goal */}
                                  <div className="pt-1">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id) }}
                                      className="text-xs font-inter text-error hover:underline flex items-center gap-1"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      Delete Goal
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ====== Monthly Check-In Section ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="card-planner"
        >
          <h2 className="font-playfair font-medium text-warm-900 mb-5">Monthly Check-In</h2>

          {/* Month Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {MONTHS_2026.map((m) => {
              const isActive = activeCheckInMonth === m.value
              return (
                <button
                  key={m.value}
                  onClick={() => setActiveCheckInMonth(m.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-inter font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                  }`}
                >
                  {m.label}
                </button>
              )
            })}
          </div>

          {/* Check-in Form */}
          <CheckInForm
            checkIn={getCheckIn(activeCheckInMonth)}
            onUpdate={(updates) => updateCheckIn(activeCheckInMonth, updates)}
          />
        </motion.div>

        {/* ====== Habit Configuration Section ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="card-planner"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-playfair font-medium text-warm-900">My Habits</h2>
              <p className="text-sm text-warm-500 font-inter mt-0.5">Build consistency. Small actions, big results.</p>
            </div>
            <button onClick={() => setShowAddHabit(!showAddHabit)} className="btn-primary flex items-center gap-1.5 text-sm">
              <Plus className="w-4 h-4" />
              New Habit
            </button>
          </div>

          {/* Add Habit Form */}
          <AnimatePresence>
            {showAddHabit && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mb-5"
              >
                <div className="bg-warm-50 rounded-md p-4 space-y-3">
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                    placeholder="Habit name..."
                    className="w-full px-3 py-2 text-sm font-inter border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    autoFocus
                  />
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-inter text-warm-500">Color:</span>
                      <div className="flex gap-1.5">
                        {HABIT_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setNewHabitColor(c)}
                            className={`w-6 h-6 rounded-full transition-transform ${newHabitColor === c ? 'ring-2 ring-offset-1 ring-warm-400 scale-110' : ''}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-inter text-warm-500">Frequency:</span>
                      <select
                        value={newHabitFreq}
                        onChange={(e) => setNewHabitFreq(e.target.value as 'daily' | 'weekly')}
                        className="text-sm font-inter border border-warm-200 rounded-md px-2 py-1 focus:outline-none focus:border-rose-400"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addHabit} className="btn-primary text-xs py-1.5">Save</button>
                    <button
                      onClick={() => { setShowAddHabit(false); setNewHabitName('') }}
                      className="px-3 py-1.5 text-xs font-inter font-medium text-warm-600 hover:text-warm-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Habits List */}
          <div className="space-y-3">
            <AnimatePresence>
              {habits.map((habit, i) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex items-center justify-between py-3 px-3 border border-warm-200 rounded-md hover:bg-warm-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                    <span className={`font-inter font-medium text-sm ${habit.active ? 'text-warm-700' : 'text-warm-400 line-through'}`}>
                      {habit.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-inter text-warm-500 capitalize">{habit.frequency}</span>
                    <div className="flex items-center gap-1 text-rose-600">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-inter font-semibold">0</span>
                    </div>
                    <div className="flex items-center gap-1 text-warm-400">
                      <Trophy className="w-3.5 h-3.5" />
                      <span className="text-xs font-inter">0</span>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                        habit.active ? 'bg-rose-500' : 'bg-warm-300'
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                        animate={{ x: habit.active ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    </button>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-warm-400 hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  )
}

/* ==================================================================== */
/*  Sub-components                                                      */
/* ==================================================================== */

function AddMilestoneInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('')
  return (
    <div className="flex items-center gap-2 mt-1">
      <HeroSection
        title={`Goals & Tracking`}
        subtitle="Dreams turned into daily action"
        imageIndex={22}
      />
      <div className="w-[18px] h-[18px] rounded-[3px] border-[1.5px] border-warm-200 shrink-0" />
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onAdd(text)
            setText('')
          }
        }}
        placeholder="Add a milestone..."
        className="flex-1 text-sm font-inter bg-transparent border-none outline-none placeholder:text-warm-400 text-warm-700"
      />
      {text.trim() && (
        <button onClick={() => { onAdd(text); setText('') }} className="text-xs text-rose-600 font-inter hover:underline">
          Add
        </button>
      )}
    </div>
  )
}

function CheckInForm({
  checkIn,
  onUpdate,
}: {
  checkIn: MonthlyCheckIn
  onUpdate: (updates: Partial<MonthlyCheckIn>) => void
}) {
  return (
    <div className="space-y-5">
      {/* Star Rating */}
      <div>
        <label className="text-sm font-inter font-medium text-warm-700 mb-2 block">
          How would you rate this month overall?
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdate({ rating: star })}
              className="p-1"
            >
              <Star
                className="w-7 h-7 transition-colors duration-200"
                fill={star <= checkIn.rating ? '#d4a76a' : 'transparent'}
                stroke={star <= checkIn.rating ? '#d4a76a' : '#d4c9bb'}
                strokeWidth={1.5}
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Key Wins */}
      <div>
        <label className="text-sm font-inter font-medium text-warm-700 mb-2 block">Key wins this month</label>
        <textarea
          value={checkIn.wins}
          onChange={(e) => onUpdate({ wins: e.target.value })}
          placeholder="What went well..."
          className="w-full px-3 py-2 text-base font-caveat border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none"
          style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e8e2da 27px, #e8e2da 28px)' }}
          rows={3}
        />
      </div>

      {/* Focus for Next Month */}
      <div>
        <label className="text-sm font-inter font-medium text-warm-700 mb-2 block">Focus for next month</label>
        <textarea
          value={checkIn.focus}
          onChange={(e) => onUpdate({ focus: e.target.value })}
          placeholder="What I want to focus on..."
          className="w-full px-3 py-2 text-base font-caveat border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none"
          style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e8e2da 27px, #e8e2da 28px)' }}
          rows={3}
        />
      </div>
    </div>
  )
}
