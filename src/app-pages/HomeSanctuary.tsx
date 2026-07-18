import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import HeroSection from '@/components/HeroSection'
import {
  Home,
  Moon,
  CheckCircle2,
  Circle,
  Sparkles,
  RefreshCw,
  ShoppingCart,
  Palette,
  Brain,
  Eye,
  Footprints,
  Droplets,
  Container,
  Apple,
  Pill,
  Dumbbell,
  Dog,
  ChevronRight,
  Plus,
  Trash2,
  Wrench,
  Check,
} from 'lucide-react'

/* ─── Types ─── */
interface ZoneTask {
  id: string
  text: string
  checked: boolean
}

interface ShoppingItem {
  id: string
  text: string
  checked: boolean
  category: 'protein' | 'produce' | 'pantry' | 'dairy' | 'supplies' | 'dog'
}

interface DailyZone {
  id: string
  name: string
  time: string
  tasks: ZoneTask[]
  color: string
}

interface MaintenanceTask {
  id: string
  task: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'biannual' | 'annual'
  lastDone: string | null // ISO date 'YYYY-MM-DD'
}

/* ─── Constants ─── */
const STORAGE_KEYS = {
  zones: 'home-sanctuary-zones',
  weeklyZone: 'home-sanctuary-weekly-zone',
  shopping: 'home-sanctuary-shopping',
  adhdItems: 'home-sanctuary-adhd',
  maintenance: 'home-maintenance-tasks',
}

const DEFAULT_DAILY_ZONES: DailyZone[] = [
  {
    id: 'kitchen',
    name: 'Kitchen',
    time: '3-4 min',
    color: 'bg-sky-50 border-sky-200',
    tasks: [
      { id: 'k1', text: 'Dishes in dishwasher/sink', checked: false },
      { id: 'k2', text: 'Wipe counters', checked: false },
      { id: 'k3', text: 'Take out trash', checked: false },
      { id: 'k4', text: 'Quick floor sweep', checked: false },
    ],
  },
  {
    id: 'living',
    name: 'Living Area',
    time: '2-3 min',
    color: 'bg-amber-50 border-amber-200',
    tasks: [
      { id: 'l1', text: 'Fluff pillows & fold throws', checked: false },
      { id: 'l2', text: 'Clear surfaces', checked: false },
      { id: 'l3', text: 'Tidy magazines/remote', checked: false },
    ],
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    time: '2 min',
    color: 'bg-teal-50 border-teal-200',
    tasks: [
      { id: 'b1', text: 'Wipe sink & faucet', checked: false },
      { id: 'b2', text: 'Hang/fold towels', checked: false },
      { id: 'b3', text: 'Toilet lid down', checked: false },
    ],
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    time: '2-3 min',
    color: 'bg-violet-50 border-violet-200',
    tasks: [
      { id: 'br1', text: 'Clothes in hamper', checked: false },
      { id: 'br2', text: 'Tomorrow clothes laid out', checked: false },
      { id: 'br3', text: 'Phone on charger', checked: false },
    ],
  },
  {
    id: 'entry',
    name: 'Entry',
    time: '1 min',
    color: 'bg-emerald-50 border-emerald-200',
    tasks: [
      { id: 'e1', text: 'Shoes in place', checked: false },
      { id: 'e2', text: 'Bag hung up', checked: false },
      { id: 'e3', text: 'Keys in bowl/hook', checked: false },
    ],
  },
]

const WEEKLY_ZONES = [
  { week: 1, name: 'Kitchen Deep Clean', focus: 'Appliances, cabinets, pantry, fridge' },
  { week: 2, name: 'Bathroom Deep Clean', focus: 'Shower, grout, mirrors, under sink' },
  { week: 3, name: 'Living Areas', focus: 'Dust, vacuum, windows, cushion covers' },
  { week: 4, name: 'Bedrooms & Closets', focus: 'Closet purge, sheets, under bed' },
]

const DEFAULT_SHOPPING: ShoppingItem[] = [
  // Protein
  { id: 's1', text: 'Chicken breast (2-3 lbs)', checked: false, category: 'protein' },
  { id: 's2', text: 'Salmon (1-1.5 lbs)', checked: false, category: 'protein' },
  { id: 's3', text: 'Eggs (2 dozen)', checked: false, category: 'protein' },
  // Produce
  { id: 's4', text: 'Spinach (2 containers)', checked: false, category: 'produce' },
  { id: 's5', text: 'Broccoli / Brussels sprouts', checked: false, category: 'produce' },
  { id: 's6', text: 'Sweet potatoes (4-5)', checked: false, category: 'produce' },
  { id: 's7', text: 'Avocados (4-5)', checked: false, category: 'produce' },
  { id: 's8', text: 'Bananas / berries', checked: false, category: 'produce' },
  // Dairy
  { id: 's9', text: 'Greek yogurt (32 oz)', checked: false, category: 'dairy' },
  { id: 's10', text: 'Oat milk (2 cartons)', checked: false, category: 'dairy' },
  // Pantry
  { id: 's11', text: 'Oats / quinoa', checked: false, category: 'pantry' },
  { id: 's12', text: 'Sauerkraut / kimchi', checked: false, category: 'pantry' },
  { id: 's13', text: 'Hemp / chia seeds', checked: false, category: 'pantry' },
  { id: 's14', text: 'Sunflower seed butter', checked: false, category: 'pantry' },
  // Supplies
  { id: 's15', text: 'Cleaning supplies', checked: false, category: 'supplies' },
  // Dog
  { id: 's16', text: 'Dog food / treats', checked: false, category: 'dog' },
]

const ADHD_ENVIRONMENT = [
  { icon: Pill, label: 'Pill Organizer', tip: 'ON counter, visible — not in cabinet', color: 'text-rose-500 bg-rose-50' },
  { icon: Apple, label: 'Breakfast Items', tip: 'One shelf, eye level', color: 'text-amber-500 bg-amber-50' },
  { icon: Container, label: 'Prepped Meals', tip: 'Clear containers, front of fridge', color: 'text-sky-500 bg-sky-50' },
  { icon: Droplets, label: 'Water Bottle', tip: 'Multiple locations: bedside, desk, kitchen', color: 'text-teal-500 bg-teal-50' },
  { icon: Dumbbell, label: 'Gym Bag', tip: 'Packed night before, by door', color: 'text-violet-500 bg-violet-50' },
  { icon: Dog, label: 'Dog Leash', tip: 'Hook by door at eye level', color: 'text-indigo-500 bg-indigo-50' },
  { icon: Footprints, label: 'Shoes', tip: 'By door, organized', color: 'text-emerald-500 bg-emerald-50' },
  { icon: Sparkles, label: 'Cleaning Supplies', tip: 'Visible and accessible', color: 'text-orange-500 bg-orange-50' },
]

const COLOR_CODING = [
  { color: 'bg-blue-400', label: 'Content Creation', hex: '#60a5fa' },
  { color: 'bg-green-400', label: 'Fitness / Training', hex: '#4ade80' },
  { color: 'bg-yellow-400', label: 'Dog Care', hex: '#facc15' },
  { color: 'bg-orange-400', label: 'Home Management', hex: '#fb923c' },
  { color: 'bg-purple-400', label: 'Relationship', hex: '#c084fc' },
  { color: 'bg-red-400', label: 'Non-Negotiables', hex: '#f87171' },
]

const CAT_LABELS: Record<string, string> = {
  protein: 'Proteins',
  produce: 'Produce',
  pantry: 'Pantry',
  dairy: 'Dairy',
  supplies: 'Supplies',
  dog: 'Rocket',
}

/* ─── Maintenance Schedule ─── */
type MaintenanceFrequency = MaintenanceTask['frequency']
type MaintenanceStatus = 'done' | 'due' | 'overdue'

const FREQUENCY_DAYS: Record<MaintenanceFrequency, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  biannual: 180,
  annual: 365,
}

const FREQUENCY_LABELS: Record<MaintenanceFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  biannual: 'Every 6 Months',
  annual: 'Annually',
}

const FREQUENCY_ORDER: MaintenanceFrequency[] = ['daily', 'weekly', 'monthly', 'biannual', 'annual']

const STATUS_PILL: Record<MaintenanceStatus, string> = {
  done: 'bg-emerald-100 text-emerald-700',
  due: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-600',
}

const DEFAULT_MAINTENANCE_TASKS: MaintenanceTask[] = [
  { id: 'm1', task: 'Floors deep clean (vacuum + mop)', frequency: 'weekly', lastDone: null },
  { id: 'm2', task: 'Bathroom deep clean', frequency: 'weekly', lastDone: null },
  { id: 'm3', task: 'Fridge deep clean', frequency: 'monthly', lastDone: null },
  { id: 'm4', task: 'Garbage disposal refresh', frequency: 'monthly', lastDone: null },
  { id: 'm5', task: 'Dishwasher clean cycle', frequency: 'monthly', lastDone: null },
  { id: 'm6', task: 'Washing machine clean cycle', frequency: 'monthly', lastDone: null },
  { id: 'm7', task: 'Oven deep clean', frequency: 'biannual', lastDone: null },
  { id: 'm8', task: 'Windows inside & out', frequency: 'biannual', lastDone: null },
  { id: 'm9', task: 'Descale coffee maker / kettle', frequency: 'biannual', lastDone: null },
  { id: 'm10', task: 'Rotate & vacuum mattress', frequency: 'biannual', lastDone: null },
  { id: 'm11', task: 'Clean behind appliances', frequency: 'annual', lastDone: null },
  { id: 'm12', task: 'Air vents & filters', frequency: 'annual', lastDone: null },
  { id: 'm13', task: 'Closet declutter', frequency: 'annual', lastDone: null },
]

const DAY_MS = 86400000

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function daysSince(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  const then = new Date(y, (m || 1) - 1, d || 1).getTime()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.max(0, Math.round((today - then) / DAY_MS))
}

function getTaskStatus(t: MaintenanceTask): { status: MaintenanceStatus; label: string } {
  const interval = FREQUENCY_DAYS[t.frequency]
  if (!t.lastDone) return { status: 'due', label: 'Due now' }
  const elapsed = daysSince(t.lastDone)
  if (elapsed > interval * 1.5) return { status: 'overdue', label: `${elapsed - interval} days overdue` }
  if (elapsed >= interval) return { status: 'due', label: 'Due now' }
  const remaining = interval - elapsed
  return { status: 'done', label: `Due in ${remaining} day${remaining === 1 ? '' : 's'}` }
}

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
export default function HomeSanctuary() {
  const [zones, setZones] = useState<DailyZone[]>(() => load(STORAGE_KEYS.zones, DEFAULT_DAILY_ZONES))
  const [weeklyZoneIdx, setWeeklyZoneIdx] = useState(() => load(STORAGE_KEYS.weeklyZone, 0))
  const [shopping, setShopping] = useState<ShoppingItem[]>(() => load(STORAGE_KEYS.shopping, DEFAULT_SHOPPING))
  const [newItem, setNewItem] = useState('')
  const [newCategory, setNewCategory] = useState<ShoppingItem['category']>('produce')
  const [maintenance, setMaintenance] = useState<MaintenanceTask[]>(() => load(STORAGE_KEYS.maintenance, DEFAULT_MAINTENANCE_TASKS))
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskFreq, setNewTaskFreq] = useState<MaintenanceFrequency>('weekly')

  useEffect(() => save(STORAGE_KEYS.zones, zones), [zones])
  useEffect(() => save(STORAGE_KEYS.weeklyZone, weeklyZoneIdx), [weeklyZoneIdx])
  useEffect(() => save(STORAGE_KEYS.shopping, shopping), [shopping])
  useEffect(() => save(STORAGE_KEYS.maintenance, maintenance), [maintenance])

  const toggleZoneTask = useCallback((zoneId: string, taskId: string) => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId
          ? { ...z, tasks: z.tasks.map((t) => (t.id === taskId ? { ...t, checked: !t.checked } : t)) }
          : z
      )
    )
  }, [])

  const toggleShoppingItem = useCallback((id: string) => {
    setShopping((prev) => prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s)))
  }, [])

  const addShoppingItem = useCallback(() => {
    if (!newItem.trim()) return
    setShopping((prev) => [...prev, { id: Date.now().toString(), text: newItem, checked: false, category: newCategory }])
    setNewItem('')
  }, [newItem, newCategory])

  const removeShoppingItem = useCallback((id: string) => {
    setShopping((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const resetDailyZones = useCallback(() => {
    setZones((prev) => prev.map((z) => ({ ...z, tasks: z.tasks.map((t) => ({ ...t, checked: false })) })))
  }, [])

  const addMaintenanceTask = useCallback(() => {
    if (!newTaskText.trim()) return
    setMaintenance((prev) => [
      ...prev,
      { id: Date.now().toString(), task: newTaskText.trim(), frequency: newTaskFreq, lastDone: null },
    ])
    setNewTaskText('')
  }, [newTaskText, newTaskFreq])

  const removeMaintenanceTask = useCallback((id: string) => {
    setMaintenance((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const markMaintenanceDone = useCallback((id: string) => {
    const today = todayISO()
    setMaintenance((prev) => prev.map((t) => (t.id === id ? { ...t, lastDone: today } : t)))
  }, [])

  const completedTasks = zones.reduce((sum, z) => sum + z.tasks.filter((t) => t.checked).length, 0)
  const totalTasks = zones.reduce((sum, z) => sum + z.tasks.length, 0)
  const resetProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const maintenanceCounts = maintenance.reduce(
    (acc, t) => {
      const st = getTaskStatus(t).status
      acc[st === 'done' ? 'onTrack' : st] += 1
      return acc
    },
    { due: 0, overdue: 0, onTrack: 0 }
  )

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
            background: 'linear-gradient(135deg, #f0f4ec 0%, #e4ebdc 40%, #d4e0c8 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage:
              'radial-gradient(circle at 25% 60%, #7a8b65 0%, transparent 45%), radial-gradient(circle at 75% 35%, #a8b896 0%, transparent 35%)',
          }} />
          <div className="absolute top-6 right-8 opacity-10">
            <Home className="w-32 h-32 text-warm-800" />
          </div>
          <div className="relative z-10 p-8 w-full">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-sage-600" style={{ color: '#7a8b65' }} />
              <span className="text-sm font-inter font-medium uppercase tracking-widest" style={{ color: '#7a8b65' }}>Sacred Space</span>
            </div>
            <h1 className="font-playfair text-4xl font-semibold text-warm-900 mb-1">Home Sanctuary</h1>
            <p className="font-caveat text-xl text-warm-700">A space that supports your wellbeing</p>
          </div>
        </motion.section>

        {/* ═══════════════ DAILY RESET PROGRESS ═══════════════ */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-planner"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                <Moon className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-playfair text-xl font-semibold text-warm-800">Daily Reset</h2>
                <p className="font-caveat text-base text-warm-500">8-9 PM &middot; 10-15 min &middot; 5 Zone Method</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-inter text-sm text-warm-500">
                {completedTasks}/{totalTasks} done
              </span>
              <button
                onClick={resetDailyZones}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-warm-100 text-warm-600 rounded-md font-inter text-xs font-medium hover:bg-warm-200 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-warm-100 rounded-full overflow-hidden mb-5">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #7a8b65, #a8b896)' }}
              initial={{ width: 0 }}
              animate={{ width: `${resetProgress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          {/* 5 Zones Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {zones.map((zone) => {
              const zoneDone = zone.tasks.filter((t) => t.checked).length
              const zoneTotal = zone.tasks.length
              return (
                <div key={zone.id} className={`rounded-md border p-4 ${zone.color}`}>
      <HeroSection
        title={`Home Sanctuary`}
        subtitle="Create sacred space in every corner"
        imageIndex={10}
      />
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-inter text-sm font-semibold text-warm-700">{zone.name}</h4>
                    <span className="text-xs font-inter text-warm-400">{zone.time}</span>
                  </div>
                  <div className="space-y-2">
                    {zone.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => toggleZoneTask(zone.id, task.id)}
                        className="flex items-start gap-2 w-full text-left group"
                      >
                        {task.checked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-warm-400 shrink-0 mt-0.5 group-hover:text-emerald-400" />
                        )}
                        <span className={`font-inter text-xs leading-relaxed ${task.checked ? 'text-warm-400 line-through' : 'text-warm-600'}`}>
                          {task.text}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/60">
                    <span className="text-xs font-inter text-warm-500">
                      {zoneDone}/{zoneTotal} complete
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* ═══════════════ WEEKLY ZONE ROTATION + PARTNER SYSTEM ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Zone */}
          <motion.section
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card-planner lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-playfair text-xl font-semibold text-warm-800">Weekly Zone Rotation</h2>
                <p className="font-caveat text-base text-warm-500">Sunday 2-4 PM &middot; One zone per week</p>
              </div>
            </div>

            <div className="space-y-3">
              {WEEKLY_ZONES.map((wz, i) => (
                <button
                  key={wz.week}
                  onClick={() => setWeeklyZoneIdx(i)}
                  className={`w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-md border transition-all ${
                    i === weeklyZoneIdx
                      ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                      : 'bg-white border-warm-200 hover:border-warm-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-inter text-xs font-semibold ${
                    i === weeklyZoneIdx ? 'bg-emerald-500 text-white' : 'bg-warm-100 text-warm-500'
                  }`}>
                    {wz.week}
                  </div>
                  <div className="flex-1">
                    <p className={`font-inter text-sm font-medium ${i === weeklyZoneIdx ? 'text-emerald-800' : 'text-warm-700'}`}>
                      {wz.name}
                    </p>
                    <p className={`font-inter text-xs ${i === weeklyZoneIdx ? 'text-emerald-600' : 'text-warm-400'}`}>
                      {wz.focus}
                    </p>
                  </div>
                  {i === weeklyZoneIdx && <ChevronRight className="w-4 h-4 text-emerald-500" />}
                </button>
              ))}
            </div>

            {/* Partner System */}
            <div className="mt-5 p-4 rounded-md bg-violet-50/60 border border-violet-100">
              <h4 className="font-inter text-sm font-semibold text-violet-700 uppercase tracking-wider mb-2">Partner System</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-2">
                  <RefreshCw className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                  <p className="font-inter text-sm text-warm-600">Trade zones monthly</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                  <p className="font-inter text-sm text-warm-600">Weekly 5-min check-in Sunday evening</p>
                </div>
                <div className="flex items-start gap-2">
                  <Eye className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                  <p className="font-inter text-sm text-warm-600">Visual reminders posted</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Color Coding System */}
          <motion.section
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card-planner"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center">
                <Palette className="w-4 h-4 text-pink-500" />
              </div>
              <h3 className="font-playfair text-lg font-semibold text-warm-800">Color Coding</h3>
            </div>
            <div className="space-y-2.5">
              {COLOR_CODING.map((cc) => (
                <div key={cc.label} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full ${cc.color} shadow-sm`} />
                  <span className="font-inter text-sm text-warm-600">{cc.label}</span>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* ═══════════════ HOME MAINTENANCE SCHEDULE ═══════════════ */}
        <motion.section
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-planner"
        >
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="font-playfair text-xl font-semibold text-warm-800">Home Maintenance Schedule</h2>
                <p className="font-caveat text-base text-warm-500">Recurring care that keeps the sanctuary humming</p>
              </div>
            </div>
            <span className="font-inter text-sm" style={{ color: 'var(--espresso-muted)' }}>
              {maintenanceCounts.due} due &middot; {maintenanceCounts.overdue} overdue &middot; {maintenanceCounts.onTrack} on track
            </span>
          </div>

          {/* Add Task */}
          <div className="flex gap-2 mb-5">
            <input
              type="text"
              placeholder="Add maintenance task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMaintenanceTask()}
              className="flex-1 px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-amber-300"
            />
            <select
              value={newTaskFreq}
              onChange={(e) => setNewTaskFreq(e.target.value as MaintenanceFrequency)}
              className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-amber-300"
            >
              {FREQUENCY_ORDER.map((f) => (
                <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
              ))}
            </select>
            <button
              onClick={addMaintenanceTask}
              className="px-3 py-2 bg-amber-500 text-white rounded-md font-inter text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Tasks grouped by frequency */}
          <div className="space-y-5">
            {FREQUENCY_ORDER.map((freq) => {
              const group = maintenance.filter((t) => t.frequency === freq)
              if (group.length === 0) return null
              return (
                <div key={freq}>
                  <h4
                    className="font-inter text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--espresso-muted)' }}
                  >
                    {FREQUENCY_LABELS[freq]}
                  </h4>
                  <div className="space-y-2">
                    {group.map((t) => {
                      const st = getTaskStatus(t)
                      return (
                        <div
                          key={t.id}
                          className="flex items-center gap-3 px-3 py-3 rounded-md bg-white border border-warm-200 group"
                        >
                          <span className={`text-xs px-2 py-0.5 rounded-full font-inter font-medium shrink-0 ${STATUS_PILL[st.status]}`}>
                            {st.label}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-inter text-sm text-warm-700 truncate">{t.task}</p>
                            <p className="font-inter text-xs text-warm-400">
                              last done: {t.lastDone ?? 'never'}
                            </p>
                          </div>
                          <button
                            onClick={() => markMaintenanceDone(t.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md font-inter text-xs font-medium shrink-0 text-white transition-colors"
                            style={{ background: 'var(--sage)' }}
                          >
                            <Check className="w-3 h-3" /> Done
                          </button>
                          <button
                            onClick={() => removeMaintenanceTask(t.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-warm-100 text-warm-400 transition-all shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* ═══════════════ ADHD-FRIENDLY ENVIRONMENT ═══════════════ */}
        <motion.section
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-planner"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
              <Brain className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h2 className="font-playfair text-xl font-semibold text-warm-800">ADHD-Friendly Environment</h2>
              <p className="font-caveat text-base text-warm-500">Out of sight = out of mind. Visibility is everything.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ADHD_ENVIRONMENT.map((item) => (
              <div
                key={item.label}
                className={`rounded-md p-4 border ${item.color.replace('text-', 'border-').replace('50', '100')} ${item.color.replace('text-', 'bg-')}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className={`w-4 h-4 ${item.color.split(' ')[0]}`} />
                  <h4 className={`font-inter text-sm font-semibold ${item.color.split(' ')[0]}`}>{item.label}</h4>
                </div>
                <p className="font-inter text-xs text-warm-600 leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ═══════════════ SUPPLY SHOPPING LIST ═══════════════ */}
        <motion.section
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-planner"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h2 className="font-playfair text-xl font-semibold text-warm-800">Supply Shopping List</h2>
              <p className="font-caveat text-base text-warm-500">Weekly essentials for your sanctuary</p>
            </div>
          </div>

          {/* Add Item */}
          <div className="flex gap-2 mb-5">
            <input
              type="text"
              placeholder="Add item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addShoppingItem()}
              className="flex-1 px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-teal-300"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ShoppingItem['category'])}
              className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-teal-300"
            >
              {Object.entries(CAT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <button
              onClick={addShoppingItem}
              className="px-3 py-2 bg-teal-500 text-white rounded-md font-inter text-sm font-medium hover:bg-teal-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Shopping List by Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(CAT_LABELS).map(([cat, label]) => {
              const items = shopping.filter((s) => s.category === cat)
              if (items.length === 0) return null
              return (
                <div key={cat} className="rounded-md bg-warm-50/50 border border-warm-200 p-3">
                  <h4 className="font-inter text-xs font-semibold text-warm-500 uppercase tracking-wider mb-2">{label}</h4>
                  <div className="space-y-1.5">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 group">
                        <button onClick={() => toggleShoppingItem(item.id)} className="shrink-0">
                          {item.checked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-warm-400" />
                          )}
                        </button>
                        <span className={`font-inter text-sm flex-1 ${item.checked ? 'line-through text-warm-400' : 'text-warm-700'}`}>
                          {item.text}
                        </span>
                        <button
                          onClick={() => removeShoppingItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-rose-100 text-warm-400 hover:text-rose-500 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
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
