import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSection from '@/components/HeroSection'
import {
  Heart,
  Target,
  Sparkles,
  Home,
  DollarSign,
  Briefcase,
  Users,
  Plus,
  X,
  TrendingUp,
  CheckSquare,
  Square,
  RotateCcw,
  Edit2,
  Save,
  Star,
  Calendar,
  Award,
} from 'lucide-react'

/* ─── Types ─── */
interface VisionCard {
  id: string
  title: string
  description: string
  color: string
  progress: number
}

interface WheelCategory {
  name: string
  score: number
  icon: React.ElementType
  color: string
}

interface QuarterlyGoal {
  id: string
  text: string
  completed: boolean
}

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
  category: string
}

/* ─── Constants ─── */
const STORAGE_KEYS = {
  vision: 'life-integration-vision',
  wheel: 'life-integration-wheel',
  goalsQ1: 'life-integration-goals-q1',
  goalsQ2: 'life-integration-goals-q2',
  goalsQ3: 'life-integration-goals-q3',
  goalsQ4: 'life-integration-goals-q4',
  checklist: 'life-integration-checklist',
}

const DEFAULT_VISION_CARDS: VisionCard[] = [
  { id: '1', title: 'Career Goals', description: 'Advance in your professional journey', color: 'bg-rose-400', progress: 0 },
  { id: '2', title: 'Relationships', description: 'Nurture meaningful connections', color: 'bg-amber-400', progress: 0 },
  { id: '3', title: 'Health & Wellness', description: 'Prioritize mind and body', color: 'bg-emerald-400', progress: 0 },
  { id: '4', title: 'Personal Growth', description: 'Learn, evolve, and expand', color: 'bg-sky-400', progress: 0 },
  { id: '5', title: 'Home & Environment', description: 'Create your sanctuary', color: 'bg-violet-400', progress: 0 },
  { id: '6', title: 'Travel & Adventure', description: 'Explore the world', color: 'bg-teal-400', progress: 0 },
  { id: '7', title: 'Creativity', description: 'Express your inner artist', color: 'bg-fuchsia-400', progress: 0 },
  { id: '8', title: 'Finances', description: 'Build wealth and security', color: 'bg-amber-500', progress: 0 },
]

const DEFAULT_WHEEL: WheelCategory[] = [
  { name: 'Career', score: 5, icon: Briefcase, color: '#e85d78' },
  { name: 'Money', score: 5, icon: DollarSign, color: '#d4a76a' },
  { name: 'Health', score: 5, icon: Heart, color: '#7a9e7a' },
  { name: 'Family & Friends', score: 5, icon: Users, color: '#7a8e9e' },
  { name: 'Romance', score: 5, icon: Sparkles, color: '#f07d94' },
  { name: 'Personal Growth', score: 5, icon: TrendingUp, color: '#5a7a6a' },
  { name: 'Fun', score: 5, icon: Star, color: '#c4a882' },
  { name: 'Physical Environment', score: 5, icon: Home, color: '#8b6f5e' },
]

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', text: 'Moved toward career vision', checked: false, category: 'Career' },
  { id: '2', text: 'Nurtured a relationship', checked: false, category: 'Relationships' },
  { id: '3', text: 'Exercised or meditated', checked: false, category: 'Health' },
  { id: '4', text: 'Learned something new', checked: false, category: 'Growth' },
  { id: '5', text: 'Organized living space', checked: false, category: 'Environment' },
  { id: '6', text: 'Planned or took a small adventure', checked: false, category: 'Adventure' },
  { id: '7', text: 'Creative activity', checked: false, category: 'Creativity' },
  { id: '8', text: 'Reviewed finances', checked: false, category: 'Finances' },
]

const QUARTER_COLORS = [
  { bg: 'bg-rose-50', border: 'border-rose-200', header: 'text-rose-700', bar: 'bg-rose-500' },
  { bg: 'bg-sky-50', border: 'border-sky-200', header: 'text-sky-700', bar: 'bg-sky-500' },
  { bg: 'bg-amber-50', border: 'border-amber-200', header: 'text-amber-700', bar: 'bg-amber-500' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', header: 'text-emerald-700', bar: 'bg-emerald-500' },
]

/* ─── Helpers ─── */
function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function saveStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

/* ─── Wheel SVG Component ─── */
function WheelSVG({ categories, average }: { categories: WheelCategory[]; average: number }) {
  const cx = 100, cy = 100, radius = 80
  const angleStep = (Math.PI * 2) / categories.length

  const points = categories.map((cat, i) => {
    const angle = i * angleStep - Math.PI / 2
    const r = (cat.score / 10) * radius
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')

  const gridLines = [2, 4, 6, 8, 10].map((level) => {
    const r = (level / 10) * radius
    const pts = categories.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
    }).join(' ')
    return <polygon key={level} points={pts} fill="none" stroke="#e8e2da" strokeWidth="0.5" />
  })

  const axisLines = categories.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2
    const x2 = cx + radius * Math.cos(angle)
    const y2 = cy + radius * Math.sin(angle)
    return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="#e8e2da" strokeWidth="0.5" />
  })

  const labels = categories.map((cat, i) => {
    const angle = i * angleStep - Math.PI / 2
    const labelR = radius + 14
    const x = cx + labelR * Math.cos(angle)
    const y = cy + labelR * Math.sin(angle)
    return (
      <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central"
        fontSize="5" fill="#5e5245" fontFamily="Inter, sans-serif" fontWeight="500">
        {cat.name}
      </text>
    )
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <HeroSection
        title={`Life Integration`}
        subtitle="Balance all the threads of your life"
        imageIndex={23}
      />
      <svg viewBox="0 0 200 200" className="w-72 h-72 drop-shadow-sm">
        {gridLines}
        {axisLines}
        <polygon points={points} fill="rgba(232,93,120,0.15)" stroke="#e85d78" strokeWidth="1.5" />
        {categories.map((cat, i) => {
          const angle = i * angleStep - Math.PI / 2
          const r = (cat.score / 10) * radius
          const x = cx + r * Math.cos(angle)
          const y = cy + r * Math.sin(angle)
          return <circle key={i} cx={x} cy={y} r="3" fill={cat.color} />
        })}
        {labels}
      </svg>
      <div className="text-center">
        <div className="text-3xl font-playfair font-semibold text-warm-800">{average.toFixed(1)}</div>
        <div className="text-sm text-warm-500 font-inter">Average Score</div>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function LifeIntegration() {
  /* Vision Board */
  const [visionCards, setVisionCards] = useState<VisionCard[]>(() =>
    loadStorage(STORAGE_KEYS.vision, DEFAULT_VISION_CARDS)
  )
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [newCardDesc, setNewCardDesc] = useState('')

  /* Wheel of Life */
  const [wheelCategories, setWheelCategories] = useState<WheelCategory[]>(() =>
    loadStorage(STORAGE_KEYS.wheel, DEFAULT_WHEEL)
  )

  /* Quarterly Goals */
  const [q1Goals, setQ1Goals] = useState<QuarterlyGoal[]>(() => loadStorage(STORAGE_KEYS.goalsQ1, []))
  const [q2Goals, setQ2Goals] = useState<QuarterlyGoal[]>(() => loadStorage(STORAGE_KEYS.goalsQ2, []))
  const [q3Goals, setQ3Goals] = useState<QuarterlyGoal[]>(() => loadStorage(STORAGE_KEYS.goalsQ3, []))
  const [q4Goals, setQ4Goals] = useState<QuarterlyGoal[]>(() => loadStorage(STORAGE_KEYS.goalsQ4, []))
  const [newGoalTexts, setNewGoalTexts] = useState(['', '', '', ''])

  /* Checklist */
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() =>
    loadStorage(STORAGE_KEYS.checklist, DEFAULT_CHECKLIST)
  )

  /* Persistence */
  useEffect(() => saveStorage(STORAGE_KEYS.vision, visionCards), [visionCards])
  useEffect(() => saveStorage(STORAGE_KEYS.wheel, wheelCategories), [wheelCategories])
  useEffect(() => saveStorage(STORAGE_KEYS.goalsQ1, q1Goals), [q1Goals])
  useEffect(() => saveStorage(STORAGE_KEYS.goalsQ2, q2Goals), [q2Goals])
  useEffect(() => saveStorage(STORAGE_KEYS.goalsQ3, q3Goals), [q3Goals])
  useEffect(() => saveStorage(STORAGE_KEYS.goalsQ4, q4Goals), [q4Goals])
  useEffect(() => saveStorage(STORAGE_KEYS.checklist, checklist), [checklist])

  /* Computed */
  const wheelAverage = wheelCategories.reduce((s, c) => s + c.score, 0) / wheelCategories.length
  const qProgress = [
    q1Goals.length ? (q1Goals.filter(g => g.completed).length / q1Goals.length) * 100 : 0,
    q2Goals.length ? (q2Goals.filter(g => g.completed).length / q2Goals.length) * 100 : 0,
    q3Goals.length ? (q3Goals.filter(g => g.completed).length / q3Goals.length) * 100 : 0,
    q4Goals.length ? (q4Goals.filter(g => g.completed).length / q4Goals.length) * 100 : 0,
  ]

  /* Handlers */
  const addVisionCard = useCallback(() => {
    if (!newCardTitle.trim()) return
    const colors = ['bg-rose-400', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400', 'bg-violet-400', 'bg-teal-400', 'bg-fuchsia-400']
    const card: VisionCard = {
      id: Date.now().toString(),
      title: newCardTitle,
      description: newCardDesc || 'Your vision...',
      color: colors[Math.floor(Math.random() * colors.length)],
      progress: 0,
    }
    setVisionCards(prev => [...prev, card])
    setNewCardTitle('')
    setNewCardDesc('')
  }, [newCardTitle, newCardDesc])

  const removeVisionCard = useCallback((id: string) => {
    setVisionCards(prev => prev.filter(c => c.id !== id))
  }, [])

  const updateProgress = useCallback((id: string, delta: number) => {
    setVisionCards(prev => prev.map(c =>
      c.id === id ? { ...c, progress: Math.max(0, Math.min(100, c.progress + delta)) } : c
    ))
  }, [])

  const addGoal = useCallback((quarter: number) => {
    const text = newGoalTexts[quarter]
    if (!text.trim()) return
    const goal: QuarterlyGoal = { id: Date.now().toString(), text, completed: false }
    const setters = [setQ1Goals, setQ2Goals, setQ3Goals, setQ4Goals]
    setters[quarter](prev => [...prev, goal])
    setNewGoalTexts(prev => { const n = [...prev]; n[quarter] = ''; return n })
  }, [newGoalTexts])

  const toggleGoal = useCallback((quarter: number, id: string) => {
    const setters = [setQ1Goals, setQ2Goals, setQ3Goals, setQ4Goals]
    setters[quarter](prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g))
  }, [])

  const removeGoal = useCallback((quarter: number, id: string) => {
    const setters = [setQ1Goals, setQ2Goals, setQ3Goals, setQ4Goals]
    setters[quarter](prev => prev.filter(g => g.id !== id))
  }, [])

  const toggleChecklist = useCallback((id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
  }, [])

  const resetWeek = useCallback(() => {
    setChecklist(prev => prev.map(item => ({ ...item, checked: false })))
  }, [])

  /* ─── Render ─── */
  return (
    <div className="space-y-8 pb-12">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-lg h-64 flex items-end"
        style={{
          background: 'linear-gradient(135deg, #fdf2f4 0%, #f9d0d9 40%, #e8e2da 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #e85d78 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f5a9b8 0%, transparent 40%)',
        }} />
        <div className="relative z-10 p-8 w-full">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-rose-500" />
            <span className="text-sm font-inter font-medium text-rose-600 uppercase tracking-widest">2026 Planner</span>
          </div>
          <h1 className="font-playfair text-4xl font-semibold text-warm-900 mb-1">Life Integration Plan</h1>
          <p className="font-caveat text-xl text-warm-600">Design your most aligned year</p>
        </div>
      </motion.section>

      {/* Vision Board */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-rose-500" />
          <h2 className="text-2xl font-playfair font-semibold text-warm-800">Vision Board</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {visionCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="card-planner card-planner-hover group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-md ${card.color} flex items-center justify-center shadow-sm`}>
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <button onClick={() => removeVisionCard(card.id)} className="text-warm-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {editingCard === card.id ? (
                  <div className="space-y-2">
                    <input
                      value={card.title}
                      onChange={(e) => setVisionCards(prev => prev.map(c => c.id === card.id ? { ...c, title: e.target.value } : c))}
                      className="w-full text-sm font-semibold text-warm-800 border border-warm-200 rounded px-2 py-1 outline-none focus:border-rose-300"
                    />
                    <textarea
                      value={card.description}
                      onChange={(e) => setVisionCards(prev => prev.map(c => c.id === card.id ? { ...c, description: e.target.value } : c))}
                      className="w-full text-xs text-warm-600 border border-warm-200 rounded px-2 py-1 outline-none focus:border-rose-300 resize-none"
                      rows={2}
                    />
                    <button onClick={() => setEditingCard(null)} className="text-xs text-rose-500 flex items-center gap-1">
                      <Save className="w-3 h-3" /> Save
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-playfair font-semibold text-warm-800">{card.title}</h3>
                      <button onClick={() => setEditingCard(card.id)} className="text-warm-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm text-warm-500 mt-1 mb-3 font-inter">{card.description}</p>
                  </>
                )}
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-warm-500 font-inter">{card.progress}%</span>
                    <div className="flex gap-1">
                      <button onClick={() => updateProgress(card.id, -10)} className="text-warm-400 hover:text-rose-500 text-xs px-1">-</button>
                      <button onClick={() => updateProgress(card.id, 10)} className="text-warm-400 hover:text-rose-500 text-xs px-1">+</button>
                    </div>
                  </div>
                  <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${card.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${card.progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-planner border-dashed border-2 border-warm-300 flex flex-col justify-center items-center gap-3 p-4 min-h-[200px]"
          >
            <input
              placeholder="New vision title..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              className="w-full text-sm text-warm-700 bg-transparent border-b border-warm-200 outline-none focus:border-rose-300 text-center font-inter"
            />
            <input
              placeholder="Description..."
              value={newCardDesc}
              onChange={(e) => setNewCardDesc(e.target.value)}
              className="w-full text-xs text-warm-500 bg-transparent border-b border-warm-200 outline-none focus:border-rose-300 text-center font-inter"
            />
            <button onClick={addVisionCard} className="btn-primary flex items-center gap-2 mt-2">
              <Plus className="w-4 h-4" /> Add Vision
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Wheel of Life */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card-planner"
      >
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-5 h-5 text-rose-500" />
          <h2 className="text-2xl font-playfair font-semibold text-warm-800">Wheel of Life</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SVG Wheel */}
          <WheelSVG categories={wheelCategories} average={wheelAverage} />

          {/* Sliders */}
          <div className="space-y-4">
            {wheelCategories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <cat.icon className="w-4 h-4 shrink-0" style={{ color: cat.color }} />
                <span className="text-sm font-inter text-warm-700 w-28 shrink-0">{cat.name}</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={cat.score}
                  onChange={(e) => {
                    const score = parseInt(e.target.value)
                    setWheelCategories(prev => prev.map((c, idx) => idx === i ? { ...c, score } : c))
                  }}
                  className="flex-1 h-1.5 bg-warm-200 rounded-full appearance-none cursor-pointer accent-rose-500"
                />
                <span className="text-sm font-semibold font-inter text-warm-800 w-6 text-right">{cat.score}</span>
              </motion.div>
            ))}
            <div className="pt-4 mt-4 border-t border-warm-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-inter text-warm-600">Overall Life Satisfaction</span>
                <span className="text-2xl font-playfair font-semibold text-rose-500">{wheelAverage.toFixed(1)}<span className="text-sm text-warm-400"> /10</span></span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Quarterly Goals */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-rose-500" />
          <h2 className="text-2xl font-playfair font-semibold text-warm-800">Life Goals Timeline</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[q1Goals, q2Goals, q3Goals, q4Goals].map((goals, qi) => (
            <motion.div
              key={qi}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qi * 0.1 }}
              className={`card-planner ${QUARTER_COLORS[qi].bg} border ${QUARTER_COLORS[qi].border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-playfair font-semibold ${QUARTER_COLORS[qi].header}`}>Q{qi + 1} 2026</h3>
                <span className="text-xs font-inter text-warm-500">{goals.filter(g => g.completed).length}/{goals.length}</span>
              </div>
              <div className="h-1.5 bg-white/60 rounded-full overflow-hidden mb-4">
                <motion.div
                  className={`h-full ${QUARTER_COLORS[qi].bar}`}
                  animate={{ width: `${qProgress[qi]}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="space-y-2 mb-4">
                <AnimatePresence>
                  {goals.map((goal) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 group"
                    >
                      <button onClick={() => toggleGoal(qi, goal.id)}>
                        {goal.completed ? (
                          <CheckSquare className="w-4 h-4 text-success" />
                        ) : (
                          <Square className="w-4 h-4 text-warm-400" />
                        )}
                      </button>
                      <span className={`flex-1 text-sm font-inter ${goal.completed ? 'line-through text-warm-400' : 'text-warm-700'}`}>
                        {goal.text}
                      </span>
                      <button onClick={() => removeGoal(qi, goal.id)} className="text-warm-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-2">
                <input
                  placeholder={`Add Q${qi + 1} goal...`}
                  value={newGoalTexts[qi]}
                  onChange={(e) => setNewGoalTexts(prev => { const n = [...prev]; n[qi] = e.target.value; return n })}
                  onKeyDown={(e) => e.key === 'Enter' && addGoal(qi)}
                  className="flex-1 text-sm bg-white/60 border border-warm-200 rounded px-3 py-1.5 outline-none focus:border-rose-300 font-inter"
                />
                <button onClick={() => addGoal(qi)} className="btn-primary px-2.5 py-1.5">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Integration Checklist */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card-planner"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-rose-500" />
            <h2 className="text-2xl font-playfair font-semibold text-warm-800">Weekly Alignment Check</h2>
          </div>
          <button onClick={resetWeek} className="flex items-center gap-2 text-sm text-warm-500 hover:text-rose-500 transition-colors font-inter">
            <RotateCcw className="w-4 h-4" /> Reset Week
          </button>
        </div>
        <p className="text-sm text-warm-500 font-inter mb-4">Did I move toward my vision this week?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {checklist.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggleChecklist(item.id)}
              className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                item.checked
                  ? 'bg-rose-50 border-rose-200 shadow-sm'
                  : 'bg-white border-warm-200 hover:border-warm-300'
              }`}
            >
              {item.checked ? (
                <CheckSquare className="w-5 h-5 text-rose-500 shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-warm-400 shrink-0" />
              )}
              <div>
                <p className={`text-sm font-inter ${item.checked ? 'text-rose-700 line-through' : 'text-warm-700'}`}>{item.text}</p>
                <p className="text-[0.6875rem] text-warm-400 font-inter">{item.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 bg-warm-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-rose-500 rounded-full"
              animate={{ width: `${(checklist.filter(c => c.checked).length / checklist.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-sm font-inter text-warm-600">
            {checklist.filter(c => c.checked).length}/{checklist.length}
          </span>
        </div>
      </motion.section>
    </div>
  )
}
