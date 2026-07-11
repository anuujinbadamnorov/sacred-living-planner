import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Gem,
  TrendingUp,
  Target,
  DollarSign,
  CheckSquare,
  Plus,
  ShoppingBag,
  Layers,
  BookOpen,
  Heart,
  Users,
  ChevronRight,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Zap,
  Crown,
} from 'lucide-react'

/* ─── Types ─── */
interface IncomeStream {
  id: string
  name: string
  monthlyMin: number
  monthlyMax: number
  actual: number
  status: 'Active' | 'Planning' | 'Exploring'
}

interface ActionItem {
  id: string
  text: string
  dueDate: string
  status: 'To Do' | 'In Progress' | 'Done'
  priority: 'High' | 'Medium' | 'Low'
}

interface DigitalProduct {
  id: string
  title: string
  description: string
  status: 'Idea' | 'In Progress' | 'Launched'
}

interface MonthRevenue {
  month: string
  actual: number
}

/* ─── Constants ─── */
const STORAGE_KEYS = {
  streams: 'abundance-streams',
  actions: 'abundance-actions',
  products: 'abundance-products',
  revenue: 'abundance-revenue',
  week: 'abundance-week',
}

const MONTH_1_WEEKS = [
  {
    week: 1,
    title: 'Skill Inventory & Research',
    tasks: ['List your current skills and strengths', 'Research UGC market rates and niches', 'Study successful UGC creators in your space', 'Set up your creator portfolio'],
  },
  {
    week: 2,
    title: 'First Experiments',
    tasks: ['Create sample UGC video with Rocket', 'Film 3 practice videos for different brands', 'Edit and refine your style', 'Get feedback from a trusted friend'],
  },
  {
    week: 3,
    title: 'Validation',
    tasks: ['Post first content on triedbyagirl', 'Reach out to 5 potential clients/brands', 'Join UGC creator communities', 'Track engagement on your posts'],
  },
  {
    week: 4,
    title: 'Decision & Planning',
    tasks: ['Review what worked and what didn\'t', 'Decide your top 2 income streams', 'Set concrete 60-day goals', 'Create your content calendar'],
  },
]

const TIKTOK_STRATEGY = [
  { title: 'Product Selection', tip: 'Choose products you actually use and love. Authenticity converts.', icon: Heart },
  { title: 'Commission Tracking', tip: 'Log every commission. Small earnings compound into abundance.', icon: DollarSign },
  { title: 'Performance Log', tip: 'Track views-to-clicks ratio for each product you promote.', icon: TrendingUp },
  { title: 'Earnings Tracker', tip: 'Weekly check-in on affiliate earnings and top-performing content.', icon: Target },
]

const DEFAULT_STREAMS: IncomeStream[] = [
  { id: '1', name: 'UGC Creation', monthlyMin: 500, monthlyMax: 15000, actual: 0, status: 'Active' },
  { id: '2', name: 'Digital Products', monthlyMin: 500, monthlyMax: 20000, actual: 0, status: 'Planning' },
  { id: '3', name: 'AI Automation Services', monthlyMin: 2000, monthlyMax: 10000, actual: 0, status: 'Exploring' },
]

const DEFAULT_PRODUCTS: DigitalProduct[] = [
  { id: '1', title: 'Life Operating System Templates', description: 'Notion/printable planners for holistic life management', status: 'Idea' },
  { id: '2', title: 'Cycle Syncing Guides', description: 'Wellness guides aligned with monthly cycles', status: 'Idea' },
  { id: '3', title: 'ADHD-Friendly Planners', description: 'Visual, color-coded planning systems', status: 'Idea' },
  { id: '4', title: 'Fitness Programs', description: 'Workout guides for women building strength', status: 'Idea' },
  { id: '5', title: 'Nutrition Guides', description: 'Meal planning and nutrition for busy creators', status: 'Idea' },
]

const STATUS_COLORS: Record<string, string> = {
  'Active': 'bg-emerald-100 text-emerald-700',
  'Planning': 'bg-amber-100 text-amber-700',
  'Exploring': 'bg-sky-100 text-sky-700',
  'To Do': 'bg-warm-100 text-warm-600',
  'In Progress': 'bg-violet-100 text-violet-700',
  'Done': 'bg-emerald-100 text-emerald-700',
  'Idea': 'bg-sky-100 text-sky-700',
  'Launched': 'bg-emerald-100 text-emerald-700',
}

const PRIORITY_COLORS: Record<string, string> = {
  'High': 'bg-rose-100 text-rose-700',
  'Medium': 'bg-amber-100 text-amber-700',
  'Low': 'bg-sky-100 text-sky-700',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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

/* ─── Main Page ─── */
export default function Abundance() {
  const [streams, setStreams] = useState<IncomeStream[]>(() => load(STORAGE_KEYS.streams, DEFAULT_STREAMS))
  const [actions, setActions] = useState<ActionItem[]>(() => load(STORAGE_KEYS.actions, []))
  const [products, setProducts] = useState<DigitalProduct[]>(() => load(STORAGE_KEYS.products, DEFAULT_PRODUCTS))
  const [revenue, setRevenue] = useState<MonthRevenue[]>(() =>
    load(STORAGE_KEYS.revenue, MONTHS.map((m) => ({ month: m, actual: 0 })))
  )
  const [activeWeek, setActiveWeek] = useState(() => load(STORAGE_KEYS.week, 1))

  /* New Inputs */
  const [newAction, setNewAction] = useState({ text: '', dueDate: '', priority: 'Medium' as ActionItem['priority'] })
  const [newProduct, setNewProduct] = useState({ title: '', description: '' })
  const [editingRevenue, setEditingRevenue] = useState<number | null>(null)
  const [newActual, setNewActual] = useState('')

  /* Persistence */
  useEffect(() => save(STORAGE_KEYS.streams, streams), [streams])
  useEffect(() => save(STORAGE_KEYS.actions, actions), [actions])
  useEffect(() => save(STORAGE_KEYS.products, products), [products])
  useEffect(() => save(STORAGE_KEYS.revenue, revenue), [revenue])
  useEffect(() => save(STORAGE_KEYS.week, activeWeek), [activeWeek])

  /* Derived */
  const totalGoalMin = streams.reduce((s, x) => s + x.monthlyMin, 0)
  const totalGoalMax = streams.reduce((s, x) => s + x.monthlyMax, 0)
  const totalActual = streams.reduce((s, x) => s + x.actual, 0)
  const annualProjectionMin = totalGoalMin * 12
  const annualProjectionMax = totalGoalMax * 12

  const statusOrder: Record<string, ActionItem['status']> = { 'To Do': 'In Progress', 'In Progress': 'Done', 'Done': 'To Do' }

  /* Handlers */
  const addAction = useCallback(() => {
    if (!newAction.text.trim()) return
    setActions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: newAction.text,
        dueDate: newAction.dueDate,
        priority: newAction.priority,
        status: 'To Do',
      },
    ])
    setNewAction({ text: '', dueDate: '', priority: 'Medium' })
  }, [newAction])

  const toggleActionStatus = useCallback((id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: statusOrder[a.status] } : a)))
  }, [])

  const removeAction = useCallback((id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const addProduct = useCallback(() => {
    if (!newProduct.title.trim()) return
    setProducts((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newProduct.title, description: newProduct.description, status: 'Idea' },
    ])
    setNewProduct({ title: '', description: '' })
  }, [newProduct])

  const cycleProductStatus = useCallback((id: string) => {
    const order: Record<string, DigitalProduct['status']> = { 'Idea': 'In Progress', 'In Progress': 'Launched', 'Launched': 'Idea' }
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: order[p.status] || 'Idea' } : p)))
  }, [])

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updateRevenue = useCallback((index: number, value: number) => {
    setRevenue((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], actual: value }
      return updated
    })
    setEditingRevenue(null)
  }, [])

  const updateStreamActual = useCallback((id: string, value: number) => {
    setStreams((prev) => prev.map((s) => (s.id === id ? { ...s, actual: value } : s)))
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
            background: 'linear-gradient(135deg, #fdf8f0 0%, #f5ecd8 30%, #e8dcc8 60%, #d4c4a0 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #c9a96e 0%, transparent 40%), radial-gradient(circle at 80% 40%, #e0744c 0%, transparent 35%)',
          }} />
          <div className="absolute top-6 right-8 opacity-10">
            <Gem className="w-32 h-32 text-warm-800" />
          </div>
          <div className="relative z-10 p-8 w-full">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-5 h-5 text-amber-700" />
              <span className="text-sm font-inter font-medium text-amber-700 uppercase tracking-widest">Prosperity</span>
            </div>
            <h1 className="font-playfair text-4xl font-semibold text-warm-900 mb-1">Abundance</h1>
            <p className="font-caveat text-xl text-warm-700">Turn ideas into income, passion into prosperity</p>
          </div>
        </motion.section>

        {/* ═══════════════ SUMMARY CARDS ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { label: 'Monthly Goal', value: `$${totalGoalMin.toLocaleString()}-$${totalGoalMax.toLocaleString()}`, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Actual This Month', value: `$${totalActual.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Annual Projection', value: `$${annualProjectionMin.toLocaleString()}-$${annualProjectionMax.toLocaleString()}`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="card-planner flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-warm-500 font-inter uppercase tracking-wide">{stat.label}</p>
                <p className="text-xl font-playfair font-semibold text-warm-800">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══════════════ INCOME STREAMS + MONTHLY REVENUE ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Streams */}
          <motion.section
            custom={3}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card-planner"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                <Layers className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="font-playfair text-xl font-semibold text-warm-800">Income Streams</h2>
            </div>

            <div className="space-y-4">
              {streams.map((stream) => (
                <div key={stream.id} className="p-4 rounded-md border border-warm-200 bg-warm-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-inter text-sm font-semibold text-warm-700">{stream.name}</h4>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-inter ${STATUS_COLORS[stream.status]}`}>
                        {stream.status}
                      </span>
                    </div>
                    <span className="font-inter text-xs text-warm-500">
                      ${stream.monthlyMin.toLocaleString()}-${stream.monthlyMax.toLocaleString()}/mo
                    </span>
                  </div>

                  {/* Stream Progress */}
                  <div className="w-full h-2 bg-warm-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${Math.min((stream.actual / stream.monthlyMin) * 100, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="font-inter text-xs text-warm-500">Actual: $</label>
                    <input
                      type="number"
                      value={stream.actual || ''}
                      onChange={(e) => updateStreamActual(stream.id, parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 rounded border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-emerald-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Monthly Revenue Tracker */}
          <motion.section
            custom={4}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card-planner"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-violet-600" />
              </div>
              <h2 className="font-playfair text-xl font-semibold text-warm-800">Monthly Revenue</h2>
            </div>

            <div className="space-y-2">
              {revenue.map((m, i) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="font-inter text-xs text-warm-500 w-8 shrink-0">{m.month}</span>
                  <div className="flex-1 h-5 bg-warm-100 rounded-full overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #c9a96e, #d4b97a)',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((m.actual / 5000) * 100, 100)}%` }}
                      transition={{ duration: 0.5, delay: i * 0.03 }}
                    />
                    {editingRevenue === i ? (
                      <div className="absolute inset-0 flex items-center px-2">
                        <input
                          type="number"
                          autoFocus
                          value={newActual}
                          onChange={(e) => setNewActual(e.target.value)}
                          onBlur={() => updateRevenue(i, parseFloat(newActual) || 0)}
                          onKeyDown={(e) => e.key === 'Enter' && updateRevenue(i, parseFloat(newActual) || 0)}
                          className="w-16 px-1 py-0.5 rounded font-inter text-xs bg-white border border-warm-200"
                        />
                      </div>
                    ) : m.actual > 0 ? (
                      <button
                        onClick={() => { setEditingRevenue(i); setNewActual(m.actual.toString()) }}
                        className="absolute inset-0 flex items-center px-2"
                      >
                        <span className="font-inter text-[0.625rem] text-warm-700 font-medium">${m.actual.toLocaleString()}</span>
                      </button>
                    ) : null}
                  </div>
                  <button
                    onClick={() => { setEditingRevenue(i); setNewActual(m.actual.toString()) }}
                    className="text-warm-400 hover:text-warm-600 transition-colors"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Annual Projection */}
            <div className="mt-5 p-4 rounded-md bg-amber-50/60 border border-amber-100">
              <div className="flex items-center justify-between">
                <span className="font-inter text-sm font-semibold text-amber-700">Total Tracked</span>
                <span className="font-playfair text-lg font-semibold text-amber-800">
                  ${revenue.reduce((s, m) => s + m.actual, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.section>
        </div>

        {/* ═══════════════ UGC CREATION ROADMAP ═══════════════ */}
        <motion.section
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-planner"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <h2 className="font-playfair text-xl font-semibold text-warm-800">UGC Creation Roadmap</h2>
              <p className="font-caveat text-base text-warm-500">Month 1 Focus: Exploration &amp; Validation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MONTH_1_WEEKS.map((w) => (
              <button
                key={w.week}
                onClick={() => setActiveWeek(w.week)}
                className={`text-left rounded-md border p-4 transition-all ${
                  activeWeek === w.week
                    ? 'bg-rose-50 border-rose-300 shadow-sm'
                    : 'bg-white border-warm-200 hover:border-warm-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-inter font-semibold uppercase tracking-wider ${activeWeek === w.week ? 'text-rose-600' : 'text-warm-400'}`}>
                    Week {w.week}
                  </span>
                  {activeWeek === w.week && <CheckCircle2 className="w-4 h-4 text-rose-500" />}
                </div>
                <h4 className={`font-inter text-sm font-semibold mb-2 ${activeWeek === w.week ? 'text-warm-800' : 'text-warm-600'}`}>
                  {w.title}
                </h4>
                <ul className="space-y-1.5">
                  {w.tasks.map((t, ti) => (
                    <li key={ti} className="flex items-start gap-1.5">
                      <ChevronRight className={`w-3 h-3 mt-0.5 shrink-0 ${activeWeek === w.week ? 'text-rose-400' : 'text-warm-300'}`} />
                      <span className={`font-inter text-xs ${activeWeek === w.week ? 'text-warm-600' : 'text-warm-400'}`}>
                        {t}
                      </span>
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </motion.section>

        {/* ═══════════════ TIKTOK SHOP STRATEGY + GOALS ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TikTok Shop Strategy */}
          <motion.section
            custom={6}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card-planner"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-pink-500" />
              </div>
              <h2 className="font-playfair text-xl font-semibold text-warm-800">TikTok Shop Strategy</h2>
            </div>

            <div className="space-y-4">
              {TIKTOK_STRATEGY.map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-md bg-warm-50/50 border border-warm-200">
                  <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="font-inter text-sm font-semibold text-warm-700">{item.title}</h4>
                    <p className="font-inter text-xs text-warm-500 mt-0.5">{item.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Goals */}
          <motion.section
            custom={7}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card-planner"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <Target className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="font-playfair text-xl font-semibold text-warm-800">Abundance Goals</h2>
            </div>

            <div className="space-y-3">
              {[
                { timeframe: '30-Day', goal: 'First $100+ income', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50' },
                { timeframe: '60-Day', goal: '$300-500/month', icon: TrendingUp, color: 'text-sky-600 bg-sky-50' },
                { timeframe: '90-Day', goal: '$500-1,000/month', icon: DollarSign, color: 'text-violet-600 bg-violet-50' },
                { timeframe: '90-Day', goal: '10K followers on triedbyagirl', icon: Users, color: 'text-rose-600 bg-rose-50' },
              ].map((g) => (
                <div key={g.goal} className="flex items-center gap-3 p-3 rounded-md border border-warm-200">
                  <div className={`w-8 h-8 rounded-full ${g.color.split(' ')[1]} flex items-center justify-center shrink-0`}>
                    <g.icon className={`w-4 h-4 ${g.color.split(' ')[0]}`} />
                  </div>
                  <div className="flex-1">
                    <span className="font-inter text-xs text-warm-400 uppercase tracking-wider">{g.timeframe}</span>
                    <p className="font-inter text-sm font-semibold text-warm-700">{g.goal}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* ═══════════════ DIGITAL PRODUCTS ═══════════════ */}
        <motion.section
          custom={8}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-planner"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="font-playfair text-xl font-semibold text-warm-800">Digital Products</h2>
          </div>

          {/* Add Product */}
          <div className="flex gap-2 mb-5">
            <input
              type="text"
              placeholder="Product idea title..."
              value={newProduct.title}
              onChange={(e) => setNewProduct((p) => ({ ...p, title: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-indigo-300"
            />
            <input
              type="text"
              placeholder="Description..."
              value={newProduct.description}
              onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-indigo-300"
            />
            <button
              onClick={addProduct}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md font-inter text-sm font-medium hover:bg-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                className="p-4 rounded-md border border-warm-200 bg-white group"
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => cycleProductStatus(product.id)}
                    className={`text-xs px-2 py-0.5 rounded font-inter ${STATUS_COLORS[product.status]}`}
                  >
                    {product.status}
                  </button>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-100 text-warm-400 hover:text-rose-500 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <h4 className="font-inter text-sm font-semibold text-warm-700 mb-1">{product.title}</h4>
                <p className="font-inter text-xs text-warm-500">{product.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══════════════ WEEKLY ACTION ITEMS ═══════════════ */}
        <motion.section
          custom={9}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-planner"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-playfair text-xl font-semibold text-warm-800">This Week&apos;s Money Moves</h2>
              <p className="font-caveat text-base text-warm-500">Priority tasks with due dates</p>
            </div>
          </div>

          {/* Add Action */}
          <div className="flex gap-2 mb-5">
            <input
              type="text"
              placeholder="What income-generating task will you do?"
              value={newAction.text}
              onChange={(e) => setNewAction((p) => ({ ...p, text: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-emerald-300"
            />
            <input
              type="date"
              value={newAction.dueDate}
              onChange={(e) => setNewAction((p) => ({ ...p, dueDate: e.target.value }))}
              className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-emerald-300"
            />
            <select
              value={newAction.priority}
              onChange={(e) => setNewAction((p) => ({ ...p, priority: e.target.value as ActionItem['priority'] }))}
              className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-emerald-300"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <button
              onClick={addAction}
              className="px-4 py-2 bg-emerald-500 text-white rounded-md font-inter text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Actions List */}
          <div className="space-y-2">
            {actions.length === 0 && (
              <p className="font-caveat text-lg text-warm-400 text-center py-6">
                No money moves yet — what&apos;s one small step toward abundance today?
              </p>
            )}
            {actions.map((action) => (
              <motion.div
                key={action.id}
                layout
                className="flex items-center gap-3 px-3 py-3 rounded-md bg-white border border-warm-200 hover:border-emerald-200 transition-colors group"
              >
                <button onClick={() => toggleActionStatus(action.id)} className="shrink-0">
                  {action.status === 'Done' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : action.status === 'In Progress' ? (
                    <Circle className="w-5 h-5 text-violet-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-warm-400" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-inter text-sm ${action.status === 'Done' ? 'line-through text-warm-400' : 'text-warm-700'}`}>
                    {action.text}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-inter ${PRIORITY_COLORS[action.priority]}`}>
                      {action.priority}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-inter ${STATUS_COLORS[action.status]}`}>
                      {action.status}
                    </span>
                    {action.dueDate && (
                      <span className="text-xs text-warm-400 font-inter">{action.dueDate}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeAction(action.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-100 text-warm-400 hover:text-rose-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </>
  )
}
