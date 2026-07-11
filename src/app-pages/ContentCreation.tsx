import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Clapperboard,
  CalendarDays,
  Lightbulb,
  Plus,
  CheckCircle2,
  Circle,
  Video,
  Camera,
  Sparkles,
  TrendingUp,
  Users,
  Film,
  Star,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

/* ─── Types ─── */
interface ContentIdea {
  id: string
  title: string
  account: 'triedbyagirl' | 'rocket'
  pillar: string
  status: 'idea' | 'filmed' | 'posted'
  notes: string
}

interface WeeklySlot {
  id: string
  day: string
  slot: number
  content: string
  filmed: boolean
  posted: boolean
}

interface BatchCheckItem {
  id: string
  text: string
  checked: boolean
}

/* ─── Constants ─── */
const STORAGE_KEYS = {
  ideas: 'content-creation-ideas',
  weekly: 'content-creation-weekly',
  batch: 'content-creation-batch',
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const CONTENT_PILLARS = {
  triedbyagirl: [
    'Product testing and reviews',
    'Routine challenges',
    'Transformations',
    'Life experiments',
    'Day-in-the-life',
  ],
  rocket: [
    'Training progress',
    'Daily moments',
    'Food reviews',
    'Adventures',
    'Dog tips',
  ],
}

const WEEKLY_SCHEDULE = [
  { day: 'Monday', triedbyagirl: 'Batch film 6-8 videos', rocket: 'Batch film 2-3 videos' },
  { day: 'Tuesday', triedbyagirl: 'Post 2', rocket: 'Post 1' },
  { day: 'Wednesday', triedbyagirl: 'Post 2', rocket: 'Post 1' },
  { day: 'Thursday', triedbyagirl: 'Post 2', rocket: 'Post 1' },
  { day: 'Friday', triedbyagirl: 'Post 2', rocket: 'Post 1' },
  { day: 'Saturday', triedbyagirl: 'Post 2', rocket: 'Post 2' },
  { day: 'Sunday', triedbyagirl: 'Post 1', rocket: 'Post 1' },
]

const DEFAULT_BATCH: BatchCheckItem[] = [
  { id: '1', text: 'Film 6-8 triedbyagirl videos', checked: false },
  { id: '2', text: 'Film 2-3 Rocket videos', checked: false },
  { id: '3', text: 'Ring light setup', checked: false },
  { id: '4', text: 'Tripod positioned', checked: false },
  { id: '5', text: 'Props ready', checked: false },
  { id: '6', text: 'Rocket at daycare = max focus time', checked: false },
]

const DEFAULT_WEEKLY: WeeklySlot[] = DAYS.flatMap((day) =>
  [1, 2, 3].map((slot) => ({
    id: `${day}-${slot}`,
    day,
    slot,
    content: '',
    filmed: false,
    posted: false,
  }))
)

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
export default function ContentCreation() {
  /* State */
  const [ideas, setIdeas] = useState<ContentIdea[]>(() => load(STORAGE_KEYS.ideas, []))
  const [weekly, setWeekly] = useState<WeeklySlot[]>(() => load(STORAGE_KEYS.weekly, DEFAULT_WEEKLY))
  const [batch, setBatch] = useState<BatchCheckItem[]>(() => load(STORAGE_KEYS.batch, DEFAULT_BATCH))

  /* New Idea Inputs */
  const [newIdea, setNewIdea] = useState({ title: '', account: 'triedbyagirl' as 'triedbyagirl' | 'rocket', pillar: '', notes: '' })
  const [expandedPillars, setExpandedPillars] = useState<'triedbyagirl' | 'rocket' | null>(null)

  /* Persistence */
  useEffect(() => save(STORAGE_KEYS.ideas, ideas), [ideas])
  useEffect(() => save(STORAGE_KEYS.weekly, weekly), [weekly])
  useEffect(() => save(STORAGE_KEYS.batch, batch), [batch])

  /* Derived Stats */
  const totalIdeas = ideas.length
  const filmedCount = ideas.filter((i) => i.status === 'filmed' || i.status === 'posted').length
  const postedCount = ideas.filter((i) => i.status === 'posted').length
  const triedbyagirlWeeklyPosts = WEEKLY_SCHEDULE.reduce((sum, d) => sum + parseInt(d.triedbyagirl.match(/\d+/)?.[0] || '0'), 0)
  const rocketWeeklyPosts = WEEKLY_SCHEDULE.reduce((sum, d) => sum + parseInt(d.rocket.match(/\d+/)?.[0] || '0'), 0)

  /* Handlers */
  const addIdea = useCallback(() => {
    if (!newIdea.title.trim()) return
    const idea: ContentIdea = {
      id: Date.now().toString(),
      title: newIdea.title,
      account: newIdea.account,
      pillar: newIdea.pillar || CONTENT_PILLARS[newIdea.account][0],
      status: 'idea',
      notes: newIdea.notes,
    }
    setIdeas((prev) => [...prev, idea])
    setNewIdea({ title: '', account: 'triedbyagirl', pillar: '', notes: '' })
  }, [newIdea])

  const removeIdea = useCallback((id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateIdeaStatus = useCallback((id: string, status: ContentIdea['status']) => {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
  }, [])

  const toggleBatchItem = useCallback((id: string) => {
    setBatch((prev) => prev.map((b) => (b.id === id ? { ...b, checked: !b.checked } : b)))
  }, [])

  const updateWeeklySlot = useCallback((id: string, content: string) => {
    setWeekly((prev) => prev.map((s) => (s.id === id ? { ...s, content } : s)))
  }, [])

  const toggleWeeklyFilmed = useCallback((id: string) => {
    setWeekly((prev) => prev.map((s) => (s.id === id ? { ...s, filmed: !s.filmed } : s)))
  }, [])

  const toggleWeeklyPosted = useCallback((id: string) => {
    setWeekly((prev) => prev.map((s) => (s.id === id ? { ...s, posted: !s.posted } : s)))
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
            background: 'linear-gradient(135deg, #faf3e0 0%, #f5e6c8 30%, #e8d5a3 60%, #d4b97a 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #c9a96e 0%, transparent 40%), radial-gradient(circle at 80% 30%, #e0744c 0%, transparent 35%)',
          }} />
          <div className="absolute top-6 right-8 opacity-10">
            <Clapperboard className="w-32 h-32 text-warm-800" />
          </div>
          <div className="relative z-10 p-8 w-full">
            <div className="flex items-center gap-3 mb-2">
              <Video className="w-5 h-5 text-amber-700" />
              <span className="text-sm font-inter font-medium text-amber-700 uppercase tracking-widest">Creator Journey</span>
            </div>
            <h1 className="font-playfair text-4xl font-semibold text-warm-900 mb-1">Content &amp; Creation</h1>
            <p className="font-caveat text-xl text-warm-700">Sharing your journey, building your tribe</p>
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
            { label: 'Content Ideas', value: totalIdeas, icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Filmed', value: filmedCount, icon: Film, color: 'text-sky-600', bg: 'bg-sky-50' },
            { label: 'Posted', value: postedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Weekly Posts', value: `${triedbyagirlWeeklyPosts + rocketWeeklyPosts}`, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
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
                <p className="text-xl font-playfair font-semibold text-warm-800">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══════════════ WEEKLY CONTENT SCHEDULE ═══════════════ */}
        <motion.section
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-planner"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="font-playfair text-xl font-semibold text-warm-800">Weekly Content Schedule</h2>
              <p className="font-caveat text-base text-warm-500">
                triedbyagirl: 2-3x daily ({triedbyagirlWeeklyPosts}/week) &middot; Rocket: 1-2x daily ({rocketWeeklyPosts}/week)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-200">
                  <th className="text-left py-3 px-3 font-inter font-medium text-warm-500 uppercase text-xs tracking-wider">Day</th>
                  <th className="text-left py-3 px-3 font-inter font-medium text-warm-500 uppercase text-xs tracking-wider">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> triedbyagirl</span>
                  </th>
                  <th className="text-left py-3 px-3 font-inter font-medium text-warm-500 uppercase text-xs tracking-wider">
                    <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Rocket Account</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {WEEKLY_SCHEDULE.map((row, i) => (
                  <tr key={row.day} className={`border-b border-warm-100 ${i % 2 === 0 ? 'bg-warm-50/50' : ''}`}>
                    <td className="py-3 px-3 font-inter font-medium text-warm-700">{row.day}</td>
                    <td className="py-3 px-3 font-inter text-warm-600">{row.triedbyagirl}</td>
                    <td className="py-3 px-3 font-inter text-warm-600">{row.rocket}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* ═══════════════ CONTENT PILLARS ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* triedbyagirl Pillars */}
          <motion.section
            custom={5}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card-planner"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-rose-500" />
                </div>
                <h3 className="font-playfair text-lg font-semibold text-warm-800">triedbyagirl Pillars</h3>
              </div>
              <button
                onClick={() => setExpandedPillars(expandedPillars === 'triedbyagirl' ? null : 'triedbyagirl')}
                className="p-1.5 rounded-md hover:bg-warm-100 text-warm-500 transition-colors"
              >
                {expandedPillars === 'triedbyagirl' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-2">
              {CONTENT_PILLARS.triedbyagirl.map((pillar) => (
                <div key={pillar} className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-rose-50/60 border border-rose-100">
                  <Star className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-inter text-sm text-warm-700">{pillar}</span>
                </div>
              ))}
            </div>
            {expandedPillars === 'triedbyagirl' && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="font-caveat text-base text-warm-500 mt-3 px-1"
              >
                Your main channel — 15 posts per week. Focus on authenticity and transformation stories that inspire your tribe.
              </motion.p>
            )}
          </motion.section>

          {/* Rocket Pillars */}
          <motion.section
            custom={6}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card-planner"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                </div>
                <h3 className="font-playfair text-lg font-semibold text-warm-800">Rocket Pillars</h3>
              </div>
              <button
                onClick={() => setExpandedPillars(expandedPillars === 'rocket' ? null : 'rocket')}
                className="p-1.5 rounded-md hover:bg-warm-100 text-warm-500 transition-colors"
              >
                {expandedPillars === 'rocket' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-2">
              {CONTENT_PILLARS.rocket.map((pillar) => (
                <div key={pillar} className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-sky-50/60 border border-sky-100">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-inter text-sm text-warm-700">{pillar}</span>
                </div>
              ))}
            </div>
            {expandedPillars === 'rocket' && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="font-caveat text-base text-warm-500 mt-3 px-1"
              >
                Rocket&apos;s channel — 9 posts per week. Capture his personality, training wins, and adorable daily moments.
              </motion.p>
            )}
          </motion.section>
        </div>

        {/* ═══════════════ BATCH FILMING MONDAY ═══════════════ */}
        <motion.section
          custom={7}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-planner"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
              <Film className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="font-playfair text-xl font-semibold text-warm-800">Batch Filming Monday</h2>
              <p className="font-caveat text-base text-warm-500">When Rocket is at daycare = maximum focus time</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Checklist */}
            <div>
              <h4 className="font-inter text-sm font-semibold text-warm-600 uppercase tracking-wider mb-3">Setup Checklist</h4>
              <div className="space-y-2">
                {batch.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleBatchItem(item.id)}
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-md hover:bg-warm-50 transition-colors"
                  >
                    {item.checked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-warm-400 shrink-0" />
                    )}
                    <span className={`font-inter text-sm ${item.checked ? 'text-warm-400 line-through' : 'text-warm-700'}`}>
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Setup Reminders */}
            <div className="bg-violet-50/50 rounded-md p-4 border border-violet-100">
              <h4 className="font-inter text-sm font-semibold text-violet-700 uppercase tracking-wider mb-3">Setup Reminders</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Camera className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                  <p className="font-inter text-sm text-warm-600">Ring light at 45&deg; angle, brightness at 80%</p>
                </div>
                <div className="flex items-start gap-2">
                  <Camera className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                  <p className="font-inter text-sm text-warm-600">Tripod at eye level, phone vertical</p>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                  <p className="font-inter text-sm text-warm-600">Props organized by content pillar</p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                  <p className="font-inter text-sm text-warm-600">Aim for 8-11 videos in 3-hour block</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════ CONTENT IDEAS TRACKER ═══════════════ */}
        <motion.section
          custom={8}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-planner"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="font-playfair text-xl font-semibold text-warm-800">Content Ideas Tracker</h2>
          </div>

          {/* Add New Idea */}
          <div className="bg-warm-50/70 rounded-md p-4 border border-warm-200 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Video idea title..."
                value={newIdea.title}
                onChange={(e) => setNewIdea((p) => ({ ...p, title: e.target.value }))}
                className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-amber-300"
              />
              <select
                value={newIdea.account}
                onChange={(e) => setNewIdea((p) => ({ ...p, account: e.target.value as 'triedbyagirl' | 'rocket', pillar: '' }))}
                className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-amber-300"
              >
                <option value="triedbyagirl">triedbyagirl</option>
                <option value="rocket">Rocket</option>
              </select>
              <select
                value={newIdea.pillar}
                onChange={(e) => setNewIdea((p) => ({ ...p, pillar: e.target.value }))}
                className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-amber-300"
              >
                <option value="">Select pillar...</option>
                {CONTENT_PILLARS[newIdea.account].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Notes..."
                value={newIdea.notes}
                onChange={(e) => setNewIdea((p) => ({ ...p, notes: e.target.value }))}
                className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-amber-300"
              />
            </div>
            <button
              onClick={addIdea}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md font-inter text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Idea
            </button>
          </div>

          {/* Ideas List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {ideas.length === 0 && (
              <p className="font-caveat text-lg text-warm-400 text-center py-6">No ideas yet — your creativity is waiting to flow...</p>
            )}
            {ideas.map((idea) => (
              <motion.div
                key={idea.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 px-3 py-3 rounded-md bg-white border border-warm-200 hover:border-amber-200 transition-colors group"
              >
                <button
                  onClick={() => updateIdeaStatus(idea.id, idea.status === 'idea' ? 'filmed' : idea.status === 'filmed' ? 'posted' : 'idea')}
                  className="shrink-0"
                >
                  {idea.status === 'posted' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : idea.status === 'filmed' ? (
                    <Film className="w-5 h-5 text-sky-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-warm-400" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-inter text-sm ${idea.status === 'posted' ? 'line-through text-warm-400' : 'text-warm-700'}`}>
                    {idea.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-inter ${
                      idea.account === 'triedbyagirl' ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'
                    }`}>
                      {idea.account}
                    </span>
                    <span className="text-xs text-warm-400 font-inter">{idea.pillar}</span>
                    {idea.notes && <span className="text-xs text-warm-400 font-caveat truncate">{idea.notes}</span>}
                  </div>
                </div>
                <button
                  onClick={() => removeIdea(idea.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-100 text-warm-400 hover:text-rose-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══════════════ WEEKLY CONTENT PLANNER ═══════════════ */}
        <motion.section
          custom={9}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-planner overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-playfair text-xl font-semibold text-warm-800">Weekly Content Planner</h2>
              <p className="font-caveat text-base text-warm-500">3 slots per day — plan, film, post</p>
            </div>
          </div>

          <div className="space-y-4">
            {DAYS.map((day) => {
              const daySlots = weekly.filter((s) => s.day === day)
              return (
                <div key={day} className="border border-warm-200 rounded-md overflow-hidden">
                  <div className="bg-warm-50 px-4 py-2 font-inter text-sm font-semibold text-warm-700 uppercase tracking-wider">
                    {day}
                  </div>
                  <div className="divide-y divide-warm-100">
                    {daySlots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-3 px-4 py-2.5 min-w-0 overflow-hidden">
                        <span className="text-xs font-inter text-warm-400 w-12 shrink-0">Slot {slot.slot}</span>
                        <input
                          type="text"
                          placeholder="Video idea..."
                          value={slot.content}
                          onChange={(e) => updateWeeklySlot(slot.id, e.target.value)}
                          className="flex-1 px-2 py-1.5 rounded border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-emerald-300"
                        />
                        <button
                          onClick={() => toggleWeeklyFilmed(slot.id)}
                          className={`shrink-0 px-2 py-1 rounded text-xs font-inter font-medium transition-colors ${
                            slot.filmed ? 'bg-sky-100 text-sky-700' : 'bg-warm-100 text-warm-500 hover:bg-sky-50'
                          }`}
                        >
                          {slot.filmed ? 'Filmed' : 'Film'}
                        </button>
                        <button
                          onClick={() => toggleWeeklyPosted(slot.id)}
                          className={`shrink-0 px-2 py-1 rounded text-xs font-inter font-medium transition-colors ${
                            slot.posted ? 'bg-emerald-100 text-emerald-700' : 'bg-warm-100 text-warm-500 hover:bg-emerald-50'
                          }`}
                        >
                          {slot.posted ? 'Posted' : 'Post'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.section>
      </div>
    </>
  )
}
