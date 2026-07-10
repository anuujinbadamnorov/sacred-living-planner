import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  Lightbulb,
  Target,
  CheckSquare,
  Square,
  Plus,
  Star,
  BookOpen,
  Link as LinkIcon,
  Calendar,
  Briefcase,
  Layers,
  Palette,
  Code,
  Megaphone,
  PiggyBank,
  Trash2,
  Filter,
} from 'lucide-react'

/* ─── Types ─── */
interface IncomeStream {
  id: string
  name: string
  monthlyGoal: number
  actualEarnings: number
  status: 'Active' | 'Idea' | 'Planning' | 'Paused'
}

interface Idea {
  id: string
  title: string
  description: string
  category: string
  startupCost: string
  potentialIncome: string
  timeline: string
  status: 'Idea' | 'In Progress' | 'Launched' | 'On Hold'
  rating: number
}

interface MonthlyRevenue {
  month: string
  target: number
  actual: number
  bySource: Record<string, number>
}

interface ActionItem {
  id: string
  text: string
  dueDate: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Todo' | 'In Progress' | 'Done'
}

interface Resource {
  id: string
  title: string
  url: string
  notes: string
  tags: string[]
}

/* ─── Constants ─── */
const STORAGE_KEYS = {
  streams: 'money-streams',
  ideas: 'money-ideas',
  revenue: 'money-revenue',
  actions: 'money-actions',
  resources: 'money-resources',
}

const MONTHS = ['June 2026', 'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026']

const CATEGORIES = ['Digital Products', 'Services', 'Passive Income', 'Investments', 'Side Hustles', 'Freelancing']
const CAT_ICONS: Record<string, React.ElementType> = {
  'Digital Products': Palette,
  'Services': Briefcase,
  'Passive Income': PiggyBank,
  'Investments': TrendingUp,
  'Side Hustles': Megaphone,
  'Freelancing': Code,
}
const CAT_COLORS: Record<string, string> = {
  'Digital Products': 'bg-violet-50 border-violet-200 text-violet-700',
  'Services': 'bg-sky-50 border-sky-200 text-sky-700',
  'Passive Income': 'bg-emerald-50 border-emerald-200 text-emerald-700',
  'Investments': 'bg-amber-50 border-amber-200 text-amber-700',
  'Side Hustles': 'bg-rose-50 border-rose-200 text-rose-700',
  'Freelancing': 'bg-teal-50 border-teal-200 text-teal-700',
}

const STATUS_COLORS: Record<string, string> = {
  'Active': 'bg-emerald-100 text-emerald-700',
  'Idea': 'bg-sky-100 text-sky-700',
  'Planning': 'bg-amber-100 text-amber-700',
  'Paused': 'bg-warm-200 text-warm-600',
  'In Progress': 'bg-violet-100 text-violet-700',
  'Launched': 'bg-emerald-100 text-emerald-700',
  'On Hold': 'bg-warm-200 text-warm-600',
  'Todo': 'bg-warm-100 text-warm-600',
  'Done': 'bg-emerald-100 text-emerald-700',
}

const PRIORITY_COLORS: Record<string, string> = {
  'High': 'bg-rose-100 text-rose-700',
  'Medium': 'bg-amber-100 text-amber-700',
  'Low': 'bg-sky-100 text-sky-700',
}

const DEFAULT_STREAMS: IncomeStream[] = [
  { id: '1', name: 'Freelance Design', monthlyGoal: 2000, actualEarnings: 0, status: 'Active' },
  { id: '2', name: 'Digital Products', monthlyGoal: 500, actualEarnings: 0, status: 'Planning' },
  { id: '3', name: 'Consulting', monthlyGoal: 1000, actualEarnings: 0, status: 'Idea' },
]

const DEFAULT_REVENUE: MonthlyRevenue[] = MONTHS.map((m) => ({
  month: m,
  target: 3500,
  actual: 0,
  bySource: {},
}))

const DEFAULT_ACTIONS: ActionItem[] = []
const DEFAULT_RESOURCES: Resource[] = []

/* ─── Helpers ─── */
function load<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback } catch { return fallback }
}
function save<T>(key: string, v: T) { localStorage.setItem(key, JSON.stringify(v)) }

/* ─── Star Rating ─── */
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} onClick={() => onChange(s)} className="p-0.5">
          <Star className={`w-4 h-4 ${s <= value ? 'text-amber-400 fill-amber-400' : 'text-warm-300'}`} />
        </button>
      ))}
    </div>
  )
}

/* ─── Main Page ─── */
export default function MoneyMaking() {
  /* Income Streams */
  const [streams, setStreams] = useState<IncomeStream[]>(() => load(STORAGE_KEYS.streams, DEFAULT_STREAMS))
  const [newStream, setNewStream] = useState({ name: '', monthlyGoal: '', status: 'Idea' as IncomeStream['status'] })

  /* Ideas */
  const [ideas, setIdeas] = useState<Idea[]>(() => load(STORAGE_KEYS.ideas, []))
  const [ideaFilter, setIdeaFilter] = useState('All')
  const [newIdea, setNewIdea] = useState({
    title: '', description: '', category: 'Digital Products', startupCost: '', potentialIncome: '', timeline: '',
  })

  /* Revenue */
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>(() => load(STORAGE_KEYS.revenue, DEFAULT_REVENUE))

  /* Actions */
  const [actions, setActions] = useState<ActionItem[]>(() => load(STORAGE_KEYS.actions, DEFAULT_ACTIONS))
  const [newAction, setNewAction] = useState({ text: '', dueDate: '', priority: 'Medium' as ActionItem['priority'] })

  /* Resources */
  const [resources, setResources] = useState<Resource[]>(() => load(STORAGE_KEYS.resources, DEFAULT_RESOURCES))
  const [newResource, setNewResource] = useState({ title: '', url: '', notes: '', tags: '' })

  /* Persistence */
  useEffect(() => save(STORAGE_KEYS.streams, streams), [streams])
  useEffect(() => save(STORAGE_KEYS.ideas, ideas), [ideas])
  useEffect(() => save(STORAGE_KEYS.revenue, revenue), [revenue])
  useEffect(() => save(STORAGE_KEYS.actions, actions), [actions])
  useEffect(() => save(STORAGE_KEYS.resources, resources), [resources])

  /* Derived */
  const totalMonthlyGoal = streams.reduce((s, x) => s + x.monthlyGoal, 0)
  const totalActual = streams.reduce((s, x) => s + x.actualEarnings, 0)
  const annualProjection = totalMonthlyGoal * 12
  const thisWeekActions = actions.filter(a => {
    if (!a.dueDate) return false
    const d = new Date(a.dueDate)
    const now = new Date()
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff >= -1 && diff <= 7
  })
  const filteredIdeas = ideaFilter === 'All' ? ideas : ideas.filter(i => i.category === ideaFilter)

  /* Handlers */
  const addStream = useCallback(() => {
    if (!newStream.name.trim()) return
    setStreams(prev => [...prev, {
      id: Date.now().toString(),
      name: newStream.name,
      monthlyGoal: parseFloat(newStream.monthlyGoal) || 0,
      actualEarnings: 0,
      status: newStream.status,
    }])
    setNewStream({ name: '', monthlyGoal: '', status: 'Idea' })
  }, [newStream])

  const addIdea = useCallback(() => {
    if (!newIdea.title.trim()) return
    setIdeas(prev => [...prev, {
      id: Date.now().toString(),
      ...newIdea,
      status: 'Idea',
      rating: 0,
    }])
    setNewIdea({ title: '', description: '', category: 'Digital Products', startupCost: '', potentialIncome: '', timeline: '' })
  }, [newIdea])

  const addAction = useCallback(() => {
    if (!newAction.text.trim()) return
    setActions(prev => [...prev, {
      id: Date.now().toString(),
      text: newAction.text,
      dueDate: newAction.dueDate,
      priority: newAction.priority,
      status: 'Todo',
    }])
    setNewAction({ text: '', dueDate: '', priority: 'Medium' })
  }, [newAction])

  const addResource = useCallback(() => {
    if (!newResource.title.trim()) return
    setResources(prev => [...prev, {
      id: Date.now().toString(),
      title: newResource.title,
      url: newResource.url,
      notes: newResource.notes,
      tags: newResource.tags.split(',').map(t => t.trim()).filter(Boolean),
    }])
    setNewResource({ title: '', url: '', notes: '', tags: '' })
  }, [newResource])

  const toggleActionStatus = useCallback((id: string) => {
    const order: Record<string, ActionItem['status']> = { 'Todo': 'In Progress', 'In Progress': 'Done', 'Done': 'Todo' }
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: order[a.status] || 'Todo' } : a))
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
        style={{ background: 'linear-gradient(135deg, #fdf8f0 0%, #f5ecd8 40%, #e8e2da 100%)' }}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 30% 40%, #d4a76a 0%, transparent 50%), radial-gradient(circle at 70% 60%, #e85d78 0%, transparent 40%)',
        }} />
        <div className="relative z-10 p-8 w-full">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-amber-600" />
            <span className="text-sm font-inter font-medium text-amber-600 uppercase tracking-widest">2026 Entrepreneur</span>
          </div>
          <h1 className="font-playfair text-4xl font-semibold text-warm-900 mb-1">Money Making Hub</h1>
          <p className="font-caveat text-xl text-warm-600">Turn ideas into income</p>
        </div>
      </motion.section>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="card-planner bg-emerald-50 border-emerald-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <Target className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-emerald-600 font-inter uppercase tracking-wide">Monthly Goal</p>
            <p className="text-2xl font-playfair font-semibold text-warm-800">${totalMonthlyGoal.toLocaleString()}</p>
          </div>
        </div>
        <div className="card-planner bg-amber-50 border-amber-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-amber-600 font-inter uppercase tracking-wide">Actual This Month</p>
            <p className="text-2xl font-playfair font-semibold text-warm-800">${totalActual.toLocaleString()}</p>
          </div>
        </div>
        <div className="card-planner bg-sky-50 border-sky-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <p className="text-xs text-sky-600 font-inter uppercase tracking-wide">Annual Projection</p>
            <p className="text-2xl font-playfair font-semibold text-warm-800">${annualProjection.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Income Streams */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2 card-planner"
        >
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-playfair font-semibold text-warm-800">Income Streams</h2>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {streams.map((stream) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-4 p-3 rounded-md bg-warm-50 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold font-inter text-warm-800">{stream.name}</p>
                      <span className={`text-[0.625rem] px-2 py-0.5 rounded-full font-inter font-medium ${STATUS_COLORS[stream.status]}`}>
                        {stream.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-warm-500 font-inter">Goal: ${stream.monthlyGoal.toLocaleString()}/mo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-warm-400 font-inter">$</span>
                    <input
                      type="number"
                      value={stream.actualEarnings || ''}
                      onChange={(e) => setStreams(prev => prev.map(s => s.id === stream.id ? { ...s, actualEarnings: parseFloat(e.target.value) || 0 } : s))}
                      className="w-20 text-sm bg-white border border-warm-200 rounded px-2 py-1 text-right font-inter"
                      placeholder="0"
                    />
                  </div>
                  <div className="w-20">
                    <div className="h-1.5 bg-warm-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${Math.min(100, stream.monthlyGoal > 0 ? (stream.actualEarnings / stream.monthlyGoal) * 100 : 0)}%` }}
                      />
                    </div>
                  </div>
                  <button onClick={() => setStreams(prev => prev.filter(s => s.id !== stream.id))} className="text-warm-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t border-warm-200">
            <input
              placeholder="Stream name..."
              value={newStream.name}
              onChange={(e) => setNewStream(p => ({ ...p, name: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && addStream()}
              className="flex-1 text-sm bg-warm-50 border border-warm-200 rounded px-3 py-1.5 outline-none focus:border-rose-300 font-inter"
            />
            <input
              type="number"
              placeholder="Goal $"
              value={newStream.monthlyGoal}
              onChange={(e) => setNewStream(p => ({ ...p, monthlyGoal: e.target.value }))}
              className="w-20 text-sm bg-warm-50 border border-warm-200 rounded px-3 py-1.5 outline-none focus:border-rose-300 font-inter"
            />
            <select
              value={newStream.status}
              onChange={(e) => setNewStream(p => ({ ...p, status: e.target.value as IncomeStream['status'] }))}
              className="text-sm bg-warm-50 border border-warm-200 rounded px-2 py-1.5 outline-none focus:border-rose-300 font-inter"
            >
              <option>Idea</option>
              <option>Planning</option>
              <option>Active</option>
              <option>Paused</option>
            </select>
            <button onClick={addStream} className="btn-primary px-3"><Plus className="w-4 h-4" /></button>
          </div>
        </motion.div>

        {/* This Week's Money Moves */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-planner"
        >
          <div className="flex items-center gap-3 mb-4">
            <ZapIcon />
            <h2 className="text-xl font-playfair font-semibold text-warm-800">This Week&apos;s Money Moves</h2>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {thisWeekActions.length === 0 && (
              <p className="text-sm text-warm-400 font-inter text-center py-4">No actions due this week</p>
            )}
            {thisWeekActions.map((action) => (
              <div key={action.id} className="flex items-center gap-2 p-2 rounded-md bg-warm-50">
                <button onClick={() => toggleActionStatus(action.id)}>
                  {action.status === 'Done' ? <CheckSquare className="w-4 h-4 text-success" /> : <Square className="w-4 h-4 text-warm-400" />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm font-inter ${action.status === 'Done' ? 'line-through text-warm-400' : 'text-warm-700'}`}>{action.text}</p>
                  <div className="flex items-center gap-2">
                    {action.dueDate && <span className="text-[0.625rem] text-warm-400 font-inter">{action.dueDate}</span>}
                    <span className={`text-[0.625rem] px-1.5 py-0.5 rounded-full font-inter ${PRIORITY_COLORS[action.priority]}`}>{action.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Idea Bank */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-planner"
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-playfair font-semibold text-warm-800">Idea Bank</h2>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-warm-400" />
            <select
              value={ideaFilter}
              onChange={(e) => setIdeaFilter(e.target.value)}
              className="text-sm bg-warm-50 border border-warm-200 rounded px-3 py-1 font-inter outline-none focus:border-amber-300"
            >
              <option>All</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Add Idea */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 p-4 bg-warm-50 rounded-lg">
          <input placeholder="Idea title..." value={newIdea.title} onChange={(e) => setNewIdea(p => ({ ...p, title: e.target.value }))} className="text-sm bg-white border border-warm-200 rounded px-3 py-2 outline-none focus:border-amber-300 font-inter" />
          <select value={newIdea.category} onChange={(e) => setNewIdea(p => ({ ...p, category: e.target.value }))} className="text-sm bg-white border border-warm-200 rounded px-3 py-2 outline-none focus:border-amber-300 font-inter">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input placeholder="Startup cost..." value={newIdea.startupCost} onChange={(e) => setNewIdea(p => ({ ...p, startupCost: e.target.value }))} className="text-sm bg-white border border-warm-200 rounded px-3 py-2 outline-none focus:border-amber-300 font-inter" />
          <input placeholder="Potential monthly income..." value={newIdea.potentialIncome} onChange={(e) => setNewIdea(p => ({ ...p, potentialIncome: e.target.value }))} className="text-sm bg-white border border-warm-200 rounded px-3 py-2 outline-none focus:border-amber-300 font-inter" />
          <input placeholder="Timeline..." value={newIdea.timeline} onChange={(e) => setNewIdea(p => ({ ...p, timeline: e.target.value }))} className="text-sm bg-white border border-warm-200 rounded px-3 py-2 outline-none focus:border-amber-300 font-inter" />
          <button onClick={addIdea} className="btn-primary flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Idea
          </button>
          <input placeholder="Description..." value={newIdea.description} onChange={(e) => setNewIdea(p => ({ ...p, description: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addIdea()} className="md:col-span-2 lg:col-span-3 text-sm bg-white border border-warm-200 rounded px-3 py-2 outline-none focus:border-amber-300 font-inter" />
        </div>

        {/* Idea Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredIdeas.map((idea, i) => {
              const Icon = CAT_ICONS[idea.category] || Lightbulb
              return (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-planner card-planner-hover group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-warm-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating
                        value={idea.rating}
                        onChange={(v) => setIdeas(prev => prev.map(x => x.id === idea.id ? { ...x, rating: v } : x))}
                      />
                      <button onClick={() => setIdeas(prev => prev.filter(x => x.id !== idea.id))} className="text-warm-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <span className={`text-[0.625rem] px-2 py-0.5 rounded-full font-inter font-medium inline-block mb-2 ${CAT_COLORS[idea.category] || 'bg-warm-100 text-warm-600'}`}>
                    {idea.category}
                  </span>
                  <h3 className="font-playfair font-semibold text-warm-800 mb-1">{idea.title}</h3>
                  <p className="text-sm text-warm-500 font-inter mb-3">{idea.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-inter mb-2">
                    <div className="bg-warm-50 rounded px-2 py-1">
                      <span className="text-warm-400">Startup:</span>
                      <span className="text-warm-700 ml-1">{idea.startupCost || '—'}</span>
                    </div>
                    <div className="bg-warm-50 rounded px-2 py-1">
                      <span className="text-warm-400">Monthly:</span>
                      <span className="text-warm-700 ml-1">{idea.potentialIncome || '—'}</span>
                    </div>
                    <div className="bg-warm-50 rounded px-2 py-1">
                      <span className="text-warm-400">Timeline:</span>
                      <span className="text-warm-700 ml-1">{idea.timeline || '—'}</span>
                    </div>
                    <div className="bg-warm-50 rounded px-2 py-1">
                      <span className="text-warm-400">Status:</span>
                      <span className="text-warm-700 ml-1">{idea.status}</span>
                    </div>
                  </div>
                  <select
                    value={idea.status}
                    onChange={(e) => setIdeas(prev => prev.map(x => x.id === idea.id ? { ...x, status: e.target.value as Idea['status'] } : x))}
                    className="w-full text-xs bg-warm-50 border border-warm-200 rounded px-2 py-1 font-inter outline-none focus:border-amber-300"
                  >
                    <option>Idea</option>
                    <option>In Progress</option>
                    <option>Launched</option>
                    <option>On Hold</option>
                  </select>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Monthly Revenue Goals */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-planner"
      >
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-playfair font-semibold text-warm-800">Monthly Revenue Goals</h2>
          <span className="text-xs text-warm-400 font-inter ml-auto">June – December 2026</span>
        </div>
        <div className="space-y-4">
          {revenue.map((rev, i) => {
            const pct = rev.target > 0 ? (rev.actual / rev.target) * 100 : 0
            return (
              <div key={rev.month}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-inter text-warm-700 w-28">{rev.month}</span>
                  <div className="flex items-center gap-2 flex-1 mx-4">
                    <span className="text-xs text-warm-400 font-inter">Target: ${rev.target.toLocaleString()}</span>
                    <div className="flex-1 h-3 bg-warm-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, pct)}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-warm-400 font-inter">$</span>
                    <input
                      type="number"
                      value={rev.actual || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        setRevenue(prev => prev.map((r, idx) => idx === i ? { ...r, actual: val } : r))
                      }}
                      className="w-20 text-sm bg-warm-50 border border-warm-200 rounded px-2 py-1 text-right font-inter"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Action Items */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-planner"
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckSquare className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-playfair font-semibold text-warm-800">Action Items</h2>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              placeholder="Action..."
              value={newAction.text}
              onChange={(e) => setNewAction(p => ({ ...p, text: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && addAction()}
              className="flex-1 text-sm bg-warm-50 border border-warm-200 rounded px-3 py-1.5 outline-none focus:border-rose-300 font-inter"
            />
            <input
              type="date"
              value={newAction.dueDate}
              onChange={(e) => setNewAction(p => ({ ...p, dueDate: e.target.value }))}
              className="text-sm bg-warm-50 border border-warm-200 rounded px-2 py-1.5 outline-none focus:border-rose-300 font-inter"
            />
            <select
              value={newAction.priority}
              onChange={(e) => setNewAction(p => ({ ...p, priority: e.target.value as ActionItem['priority'] }))}
              className="text-sm bg-warm-50 border border-warm-200 rounded px-2 py-1.5 outline-none focus:border-rose-300 font-inter"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <button onClick={addAction} className="btn-primary px-3"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {actions.map((action) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-2 rounded-md bg-warm-50 group"
                >
                  <button onClick={() => toggleActionStatus(action.id)}>
                    {action.status === 'Done' ? <CheckSquare className="w-4 h-4 text-success" /> : action.status === 'In Progress' ? <div className="w-4 h-4 rounded border-2 border-amber-400 bg-amber-100" /> : <Square className="w-4 h-4 text-warm-400" />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-inter ${action.status === 'Done' ? 'line-through text-warm-400' : 'text-warm-700'}`}>{action.text}</p>
                    <div className="flex items-center gap-2">
                      {action.dueDate && <span className="text-[0.625rem] text-warm-400 font-inter">{action.dueDate}</span>}
                      <span className={`text-[0.625rem] px-1.5 py-0.5 rounded-full font-inter ${PRIORITY_COLORS[action.priority]}`}>{action.priority}</span>
                      <span className={`text-[0.625rem] px-1.5 py-0.5 rounded-full font-inter ${STATUS_COLORS[action.status]}`}>{action.status}</span>
                    </div>
                  </div>
                  <button onClick={() => setActions(prev => prev.filter(a => a.id !== action.id))} className="text-warm-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {actions.length === 0 && <p className="text-sm text-warm-400 font-inter text-center py-4">No actions yet. Add one above!</p>}
          </div>
        </motion.div>

        {/* Resource Library */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-planner"
        >
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-violet-500" />
            <h2 className="text-xl font-playfair font-semibold text-warm-800">Resource Library</h2>
          </div>
          <div className="flex flex-col gap-2 mb-4">
            <input placeholder="Title..." value={newResource.title} onChange={(e) => setNewResource(p => ({ ...p, title: e.target.value }))} className="text-sm bg-warm-50 border border-warm-200 rounded px-3 py-1.5 outline-none focus:border-violet-300 font-inter" />
            <div className="flex gap-2">
              <input placeholder="URL..." value={newResource.url} onChange={(e) => setNewResource(p => ({ ...p, url: e.target.value }))} className="flex-1 text-sm bg-warm-50 border border-warm-200 rounded px-3 py-1.5 outline-none focus:border-violet-300 font-inter" />
              <input placeholder="Tags (comma sep)..." value={newResource.tags} onChange={(e) => setNewResource(p => ({ ...p, tags: e.target.value }))} className="flex-1 text-sm bg-warm-50 border border-warm-200 rounded px-3 py-1.5 outline-none focus:border-violet-300 font-inter" />
              <button onClick={addResource} className="btn-primary px-3"><Plus className="w-4 h-4" /></button>
            </div>
            <textarea
              placeholder="Notes..."
              value={newResource.notes}
              onChange={(e) => setNewResource(p => ({ ...p, notes: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && addResource()}
              className="text-sm bg-warm-50 border border-warm-200 rounded px-3 py-1.5 outline-none focus:border-violet-300 font-inter resize-none"
              rows={2}
            />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {resources.map((res) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-md bg-warm-50 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {res.url ? (
                        <a href={res.url.startsWith('http') ? res.url : `https://${res.url}`} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700">
                          <LinkIcon className="w-4 h-4" />
                        </a>
                      ) : (
                        <BookOpen className="w-4 h-4 text-warm-400" />
                      )}
                      <h4 className="text-sm font-semibold font-inter text-warm-800">{res.title}</h4>
                    </div>
                    <button onClick={() => setResources(prev => prev.filter(r => r.id !== res.id))} className="text-warm-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {res.notes && <p className="text-xs text-warm-500 font-inter mt-1 ml-6">{res.notes}</p>}
                  {res.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 ml-6 flex-wrap">
                      {res.tags.map(tag => (
                        <span key={tag} className="text-[0.625rem] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 font-inter">{tag}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {resources.length === 0 && <p className="text-sm text-warm-400 font-inter text-center py-4">No resources yet. Add one above!</p>}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/* Zap icon for Money Moves */
function ZapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}
