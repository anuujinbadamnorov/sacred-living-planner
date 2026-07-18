import { useState, useEffect, useMemo, type ElementType, type CSSProperties, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSection from '@/components/HeroSection'
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  PiggyBank,
  Receipt,
  Gem,
  Layers,
  Plus,
  Trash2,
  CheckSquare,
  CheckCircle2,
  Circle,
  AlertCircle,
  Home,
  Utensils,
  Car,
  Zap,
  Film,
  ShoppingBag,
  HeartPulse,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react'

/* ─── Types ─── */
interface IncomeEntry {
  id: string
  date: string
  source: 'triedbyagirl' | 'Rocket' | 'Other'
  amount: number
  description: string
}

type ExpenseCategory = 'Equipment' | 'Food/Treats' | 'Grooming' | 'Vet/Medical' | 'Toys' | 'Training' | 'Other'

interface ExpenseEntry {
  id: string
  date: string
  item: string
  amount: number
  category: ExpenseCategory
  receiptUrl: string
  taxDeductible: boolean
}

interface BusinessData {
  income: IncomeEntry[]
  expenses: ExpenseEntry[]
}

interface BudgetCategory {
  id: string
  name: string
  budgeted: number
  color: string
  icon: string
  isDefault: boolean
}

interface Transaction {
  id: string
  date: string
  categoryId: string
  description: string
  amount: number
}

interface MonthBudget {
  income: { expected: number; actual: number }
  categories: BudgetCategory[]
  transactions: Transaction[]
}

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

type TabKey = 'overview' | 'income' | 'expenses' | 'budget' | 'streams'

/* ─── Constants ─── */
const BIZ_KEY = 'rocket-business-data'
const STREAMS_KEY = 'abundance-streams'
const ACTIONS_KEY = 'abundance-actions'

const budgetKeyFor = (year: number, monthIndex: number) =>
  `planner-budget-${year}-${String(monthIndex + 1).padStart(2, '0')}`

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Equipment',
  'Food/Treats',
  'Grooming',
  'Vet/Medical',
  'Toys',
  'Training',
  'Other',
]

const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: 'c1', name: 'Housing', budgeted: 1500, color: '#9c7a5e', icon: 'home', isDefault: true },
  { id: 'c2', name: 'Food & Dining', budgeted: 600, color: '#7a9e7a', icon: 'utensils', isDefault: true },
  { id: 'c3', name: 'Transportation', budgeted: 400, color: '#7a8e9e', icon: 'car', isDefault: true },
  { id: 'c4', name: 'Utilities', budgeted: 200, color: '#d4a76a', icon: 'zap', isDefault: true },
  { id: 'c5', name: 'Entertainment', budgeted: 200, color: '#c4728e', icon: 'film', isDefault: true },
  { id: 'c6', name: 'Shopping', budgeted: 300, color: '#8e7ac4', icon: 'shopping-bag', isDefault: true },
  { id: 'c7', name: 'Health', budgeted: 150, color: '#c4a07a', icon: 'heart-pulse', isDefault: true },
  { id: 'c8', name: 'Savings', budgeted: 500, color: '#5a7a6a', icon: 'piggy-bank', isDefault: true },
  { id: 'c9', name: 'Personal Care', budgeted: 100, color: '#9e7a9e', icon: 'sparkles', isDefault: true },
  { id: 'c10', name: 'Miscellaneous', budgeted: 150, color: '#8a8a8a', icon: 'more-horizontal', isDefault: true },
]

const MONTHS = [
  { value: 5, label: 'June', year: 2026 },
  { value: 6, label: 'July', year: 2026 },
  { value: 7, label: 'August', year: 2026 },
  { value: 8, label: 'September', year: 2026 },
  { value: 9, label: 'October', year: 2026 },
  { value: 10, label: 'November', year: 2026 },
  { value: 11, label: 'December', year: 2026 },
]

const CATEGORY_ICONS: Record<string, ElementType> = {
  home: Home,
  utensils: Utensils,
  car: Car,
  zap: Zap,
  film: Film,
  'shopping-bag': ShoppingBag,
  'heart-pulse': HeartPulse,
  'piggy-bank': PiggyBank,
  sparkles: Sparkles,
  'more-horizontal': MoreHorizontal,
}

const DEFAULT_STREAMS: IncomeStream[] = [
  { id: '1', name: 'UGC Creation', monthlyMin: 500, monthlyMax: 15000, actual: 0, status: 'Active' },
  { id: '2', name: 'Digital Products', monthlyMin: 500, monthlyMax: 20000, actual: 0, status: 'Planning' },
  { id: '3', name: 'AI Automation Services', monthlyMin: 2000, monthlyMax: 10000, actual: 0, status: 'Exploring' },
]

/* Earthy badge palette (gold / sage / espresso family — no rose or pink) */
const GOLD_DARK = '#b08a2e'
const SAGE_DARK = '#5a7a6a'
const SAGE = '#8BA88C'
const GOLD = '#c9a96e'

const SOURCE_COLORS: Record<IncomeEntry['source'], string> = {
  triedbyagirl: GOLD_DARK,
  Rocket: SAGE_DARK,
  Other: '#8a8a8a',
}

const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Equipment: '#9c7a5e',
  'Food/Treats': '#7a9e7a',
  Grooming: '#c4a07a',
  'Vet/Medical': '#7a8e9e',
  Toys: '#d4a76a',
  Training: SAGE_DARK,
  Other: '#8a8a8a',
}

const STREAM_STATUS_COLORS: Record<IncomeStream['status'], string> = {
  Active: SAGE_DARK,
  Planning: GOLD_DARK,
  Exploring: '#7a8e9e',
}

const ACTION_STATUS_COLORS: Record<ActionItem['status'], string> = {
  'To Do': '#8a8a8a',
  'In Progress': GOLD_DARK,
  Done: SAGE_DARK,
}

const PRIORITY_COLORS: Record<ActionItem['priority'], string> = {
  High: GOLD_DARK,
  Medium: '#9c7a5e',
  Low: '#7a8e9e',
}

const SELF_EMPLOYMENT_TAX_RATE = 0.153

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const uid = () =>
  typeof window !== 'undefined'
    ? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    : Math.random().toString(36).slice(2, 10)

/* ─── Storage Helpers (SSR-safe) ─── */
function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const r = localStorage.getItem(key)
    return r ? (JSON.parse(r) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, v: T) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(v))
  } catch {
    /* storage full or unavailable — ignore */
  }
}

function defaultBudget(): MonthBudget {
  return {
    income: { expected: 5000, actual: 0 },
    categories: DEFAULT_BUDGET_CATEGORIES.map((c) => ({ ...c })),
    transactions: [],
  }
}

function loadBudget(key: string): MonthBudget {
  const stored = load<MonthBudget | null>(key, null)
  if (stored && Array.isArray(stored.categories)) {
    return {
      income: stored.income ?? { expected: 5000, actual: 0 },
      categories: stored.categories,
      transactions: Array.isArray(stored.transactions) ? stored.transactions : [],
    }
  }
  return defaultBudget()
}

/* ─── Card Entrance Variants ─── */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: EASE },
  }),
}

const rowStyle: CSSProperties = {
  background: 'var(--cream-dark)',
  border: '1px solid var(--border-light)',
}

/* ─── Small Presentational Pieces ─── */
function Badge({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      className="text-xs px-1.5 py-0.5 rounded whitespace-nowrap"
      style={{ backgroundColor: `${color}1f`, color }}
    >
      {children}
    </span>
  )
}

function SectionHeader({ icon: Icon, accent, title, sub }: { icon: ElementType; accent: string; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}1f` }}
      >
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <div>
        <h2 className="font-playfair text-xl font-semibold" style={{ color: 'var(--espresso)' }}>
          {title}
        </h2>
        {sub && (
          <p className="font-caveat text-base" style={{ color: 'var(--espresso-muted)' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, accent, index }: { label: string; value: string; icon: ElementType; accent: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: EASE }}
      className="card-planner flex items-center gap-4"
      style={{ padding: '1.25rem' }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}1f` }}
      >
        <Icon className="w-6 h-6" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--espresso-muted)' }}>
          {label}
        </p>
        <p className="text-xl font-playfair font-semibold break-words" style={{ color: 'var(--espresso)' }}>
          {value}
        </p>
      </div>
    </motion.div>
  )
}

const TABS: { key: TabKey; label: string; icon: ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: Briefcase },
  { key: 'income', label: 'Income', icon: TrendingUp },
  { key: 'expenses', label: 'Expenses', icon: Receipt },
  { key: 'budget', label: 'Budget', icon: PiggyBank },
  { key: 'streams', label: 'Streams', icon: Gem },
]

/* ─── Main Page ─── */
export default function RocketBusiness() {
  const [hydrated, setHydrated] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  /* Business (income / expenses) */
  const [bizData, setBizData] = useState<BusinessData>({ income: [], expenses: [] })

  /* Budget — keyed by the month it belongs to so switching months never clobbers data */
  const [selectedMonth, setSelectedMonth] = useState(0)
  const [budgetState, setBudgetState] = useState<{ key: string; data: MonthBudget }>(() => ({
    key: budgetKeyFor(MONTHS[0].year, MONTHS[0].value),
    data: defaultBudget(),
  }))
  const [overviewBudget, setOverviewBudget] = useState<MonthBudget>(defaultBudget)

  /* Abundance (streams / actions) */
  const [streams, setStreams] = useState<IncomeStream[]>([])
  const [actions, setActions] = useState<ActionItem[]>([])

  /* Form state */
  const today = () => new Date().toISOString().split('T')[0]
  const [newIncome, setNewIncome] = useState({ date: '', source: 'triedbyagirl' as IncomeEntry['source'], amount: '', description: '' })
  const [newExpense, setNewExpense] = useState({ date: '', item: '', amount: '', category: 'Equipment' as ExpenseCategory, taxDeductible: true })
  const [newTx, setNewTx] = useState({ date: '', categoryId: 'c1', description: '', amount: '' })
  const [newStream, setNewStream] = useState({ name: '', min: '', max: '', status: 'Planning' as IncomeStream['status'] })
  const [newAction, setNewAction] = useState({ text: '', dueDate: '', priority: 'Medium' as ActionItem['priority'] })

  const currentBudgetKey = useMemo(() => {
    const n = new Date()
    return budgetKeyFor(n.getFullYear(), n.getMonth())
  }, [])

  const currentMonthLabel = useMemo(
    () => new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    []
  )

  /* ─── Hydrate from localStorage (client only) ─── */
  useEffect(() => {
    const biz = load<BusinessData>(BIZ_KEY, { income: [], expenses: [] })
    setBizData({
      income: Array.isArray(biz.income) ? biz.income : [],
      expenses: Array.isArray(biz.expenses) ? biz.expenses : [],
    })
    setStreams(load(STREAMS_KEY, DEFAULT_STREAMS))
    setActions(load(ACTIONS_KEY, []))

    const n = new Date()
    const idx = MONTHS.findIndex((m) => m.year === n.getFullYear() && m.value === n.getMonth())
    const monthIdx = idx >= 0 ? idx : 0
    setSelectedMonth(monthIdx)
    const key = budgetKeyFor(MONTHS[monthIdx].year, MONTHS[monthIdx].value)
    setBudgetState({ key, data: loadBudget(key) })
    setOverviewBudget(loadBudget(budgetKeyFor(n.getFullYear(), n.getMonth())))

    const todayStr = new Date().toISOString().split('T')[0]
    setNewIncome((p) => ({ ...p, date: todayStr }))
    setNewExpense((p) => ({ ...p, date: todayStr }))
    setNewTx((p) => ({ ...p, date: todayStr }))

    setHydrated(true)
  }, [])

  /* ─── Persistence ─── */
  useEffect(() => {
    if (hydrated) save(BIZ_KEY, bizData)
  }, [bizData, hydrated])
  useEffect(() => {
    if (hydrated) save(STREAMS_KEY, streams)
  }, [streams, hydrated])
  useEffect(() => {
    if (hydrated) save(ACTIONS_KEY, actions)
  }, [actions, hydrated])
  useEffect(() => {
    if (!hydrated) return
    save(budgetState.key, budgetState.data)
    if (budgetState.key === currentBudgetKey) setOverviewBudget(budgetState.data)
  }, [budgetState, hydrated, currentBudgetKey])

  /* ─── Derived: business stats ─── */
  const totalIncome = useMemo(() => bizData.income.reduce((s, e) => s + e.amount, 0), [bizData.income])
  const totalExpenses = useMemo(() => bizData.expenses.reduce((s, e) => s + e.amount, 0), [bizData.expenses])
  const netProfit = totalIncome - totalExpenses
  const taxEstimate = Math.max(netProfit * SELF_EMPLOYMENT_TAX_RATE, 0)

  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), [])
  const currentYearStr = useMemo(() => String(new Date().getFullYear()), [])

  const monthlyIncome = useMemo(
    () => bizData.income.filter((e) => e.date.startsWith(currentMonthStr)).reduce((s, e) => s + e.amount, 0),
    [bizData.income, currentMonthStr]
  )
  const annualIncome = useMemo(
    () => bizData.income.filter((e) => e.date.startsWith(currentYearStr)).reduce((s, e) => s + e.amount, 0),
    [bizData.income, currentYearStr]
  )
  const monthlyExpenses = useMemo(
    () => bizData.expenses.filter((e) => e.date.startsWith(currentMonthStr)).reduce((s, e) => s + e.amount, 0),
    [bizData.expenses, currentMonthStr]
  )
  const deductibleExpenses = useMemo(
    () => bizData.expenses.filter((e) => e.taxDeductible).reduce((s, e) => s + e.amount, 0),
    [bizData.expenses]
  )

  const sortedIncome = useMemo(
    () => [...bizData.income].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [bizData.income]
  )
  const sortedExpenses = useMemo(
    () => [...bizData.expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [bizData.expenses]
  )

  /* ─── Derived: budget health (current real month) ─── */
  const healthSpentByCat = useMemo(() => {
    const map: Record<string, number> = {}
    overviewBudget.transactions.forEach((tx) => {
      map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount
    })
    return map
  }, [overviewBudget])
  const healthBudgeted = useMemo(() => overviewBudget.categories.reduce((s, c) => s + c.budgeted, 0), [overviewBudget])
  const healthSpent = useMemo(() => Object.values(healthSpentByCat).reduce((s, v) => s + v, 0), [healthSpentByCat])
  const healthPct = healthBudgeted > 0 ? Math.min((healthSpent / healthBudgeted) * 100, 100) : 0
  const overspentCategories = useMemo(
    () =>
      overviewBudget.categories
        .map((c) => ({ ...c, spent: healthSpentByCat[c.id] || 0 }))
        .filter((c) => c.spent > c.budgeted)
        .sort((a, b) => b.spent - b.budgeted - (a.spent - a.budgeted))
        .slice(0, 3),
    [overviewBudget, healthSpentByCat]
  )

  /* ─── Derived: selected-month budget ─── */
  const budget = budgetState.data
  const selectedMonthLabel = `${MONTHS[selectedMonth].label} ${MONTHS[selectedMonth].year}`
  const spendingByCat = useMemo(() => {
    const map: Record<string, number> = {}
    budget.transactions.forEach((tx) => {
      map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount
    })
    return map
  }, [budget.transactions])

  /* ─── Handlers: income / expenses ─── */
  const addIncome = () => {
    const amt = parseFloat(newIncome.amount)
    if (!newIncome.description.trim() || isNaN(amt) || amt <= 0) return
    setBizData((prev) => ({
      ...prev,
      income: [
        ...prev.income,
        { id: uid(), date: newIncome.date || today(), source: newIncome.source, amount: amt, description: newIncome.description.trim() },
      ],
    }))
    setNewIncome({ date: today(), source: 'triedbyagirl', amount: '', description: '' })
  }

  const removeIncome = (id: string) => {
    setBizData((prev) => ({ ...prev, income: prev.income.filter((i) => i.id !== id) }))
  }

  const addExpense = () => {
    const amt = parseFloat(newExpense.amount)
    if (!newExpense.item.trim() || isNaN(amt) || amt <= 0) return
    setBizData((prev) => ({
      ...prev,
      expenses: [
        ...prev.expenses,
        {
          id: uid(),
          date: newExpense.date || today(),
          item: newExpense.item.trim(),
          amount: amt,
          category: newExpense.category,
          receiptUrl: '',
          taxDeductible: newExpense.taxDeductible,
        },
      ],
    }))
    setNewExpense({ date: today(), item: '', amount: '', category: 'Equipment', taxDeductible: true })
  }

  const removeExpense = (id: string) => {
    setBizData((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== id) }))
  }

  const toggleTaxDeductible = (id: string) => {
    setBizData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, taxDeductible: !e.taxDeductible } : e)),
    }))
  }

  /* ─── Handlers: budget ─── */
  const selectMonth = (idx: number) => {
    const key = budgetKeyFor(MONTHS[idx].year, MONTHS[idx].value)
    setSelectedMonth(idx)
    setBudgetState({ key, data: loadBudget(key) })
  }

  const addTransaction = () => {
    const amt = parseFloat(newTx.amount)
    if (!newTx.description.trim() || isNaN(amt) || amt <= 0 || budget.categories.length === 0) return
    const categoryId = budget.categories.some((c) => c.id === newTx.categoryId)
      ? newTx.categoryId
      : budget.categories[0].id
    const tx: Transaction = {
      id: uid(),
      date: newTx.date || today(),
      categoryId,
      description: newTx.description.trim(),
      amount: amt,
    }
    setBudgetState((prev) => ({ ...prev, data: { ...prev.data, transactions: [tx, ...prev.data.transactions] } }))
    setNewTx((p) => ({ ...p, description: '', amount: '' }))
  }

  const deleteTransaction = (id: string) => {
    setBudgetState((prev) => ({
      ...prev,
      data: { ...prev.data, transactions: prev.data.transactions.filter((t) => t.id !== id) },
    }))
  }

  /* ─── Handlers: streams / actions ─── */
  const addStream = () => {
    if (!newStream.name.trim()) return
    setStreams((prev) => [
      ...prev,
      {
        id: uid(),
        name: newStream.name.trim(),
        monthlyMin: parseFloat(newStream.min) || 0,
        monthlyMax: parseFloat(newStream.max) || 0,
        actual: 0,
        status: newStream.status,
      },
    ])
    setNewStream({ name: '', min: '', max: '', status: 'Planning' })
  }

  const removeStream = (id: string) => {
    setStreams((prev) => prev.filter((s) => s.id !== id))
  }

  const updateStreamActual = (id: string, value: number) => {
    setStreams((prev) => prev.map((s) => (s.id === id ? { ...s, actual: value } : s)))
  }

  const addAction = () => {
    if (!newAction.text.trim()) return
    setActions((prev) => [
      ...prev,
      { id: uid(), text: newAction.text.trim(), dueDate: newAction.dueDate, status: 'To Do', priority: newAction.priority },
    ])
    setNewAction({ text: '', dueDate: '', priority: 'Medium' })
  }

  const removeAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id))
  }

  const cycleActionStatus = (id: string) => {
    const order: Record<ActionItem['status'], ActionItem['status']> = {
      'To Do': 'In Progress',
      'In Progress': 'Done',
      Done: 'To Do',
    }
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: order[a.status] } : a)))
  }

  /* ═══════════════ Render ═══════════════ */
  return (
    <div className="space-y-8 pb-12">
      <HeroSection title="Business" subtitle="The business of caring" imageIndex={12} />

      {/* ─── Tab Bar ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-wrap gap-2"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all"
              style={{
                background: active ? 'var(--gold)' : 'var(--cream-dark)',
                color: active ? '#FFFFFF' : 'var(--espresso-muted)',
                border: `1px solid ${active ? 'var(--gold)' : 'var(--border-light)'}`,
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ═══════════ OVERVIEW ═══════════ */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Income" value={`$${totalIncome.toLocaleString()}`} icon={TrendingUp} accent={SAGE_DARK} index={0} />
              <StatCard label="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} icon={TrendingDown} accent="#9c7a5e" index={1} />
              <StatCard label="Net Profit" value={`$${netProfit.toLocaleString()}`} icon={DollarSign} accent={netProfit >= 0 ? SAGE_DARK : GOLD_DARK} index={2} />
              <StatCard label="Est. SE Tax (15.3%)" value={`$${Math.round(taxEstimate).toLocaleString()}`} icon={Calculator} accent={GOLD_DARK} index={3} />
            </div>

            {/* Budget Health */}
            <motion.section custom={1} variants={cardVariants} initial="hidden" animate="visible" className="card-planner">
              <SectionHeader
                icon={PiggyBank}
                accent={GOLD}
                title="This Month's Budget Health"
                sub={currentMonthLabel}
              />

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wider mb-0.5" style={{ color: 'var(--espresso-muted)' }}>
                    Budgeted
                  </p>
                  <p className="font-playfair text-lg font-semibold" style={{ color: 'var(--espresso)' }}>
                    ${healthBudgeted.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wider mb-0.5" style={{ color: 'var(--espresso-muted)' }}>
                    Spent
                  </p>
                  <p className="font-playfair text-lg font-semibold" style={{ color: 'var(--espresso)' }}>
                    ${healthSpent.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wider mb-0.5" style={{ color: 'var(--espresso-muted)' }}>
                    Remaining
                  </p>
                  <p
                    className="font-playfair text-lg font-semibold"
                    style={{ color: healthBudgeted - healthSpent >= 0 ? SAGE_DARK : GOLD_DARK }}
                  >
                    ${(healthBudgeted - healthSpent).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="h-3 rounded-full overflow-hidden mb-5" style={{ background: 'var(--cream-dark)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: healthSpent > healthBudgeted ? GOLD_DARK : SAGE }}
                  initial={{ width: 0 }}
                  animate={{ width: `${healthPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>

              {overspentCategories.length === 0 ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: SAGE_DARK }} />
                  <p className="text-sm" style={{ color: 'var(--espresso-muted)' }}>
                    Every category is within budget this month.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'var(--espresso-muted)' }}>
                    Overspent Categories
                  </p>
                  {overspentCategories.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-md" style={rowStyle}>
                      <AlertCircle className="w-4 h-4 shrink-0" style={{ color: GOLD_DARK }} />
                      <span className="text-sm font-medium flex-1" style={{ color: 'var(--espresso)' }}>
                        {c.name}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: GOLD_DARK }}>
                        ${(c.spent - c.budgeted).toLocaleString()} over
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>

            {/* Tax Note */}
            <motion.section custom={2} variants={cardVariants} initial="hidden" animate="visible" className="card-planner">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GOLD }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--espresso)' }}>
                    Self-employment tax is estimated at 15.3% of net profit (12.4% Social Security + 2.9% Medicare).
                    Federal and state income taxes may apply on top of this.
                  </p>
                  <p className="font-caveat text-base mt-1" style={{ color: 'var(--espresso-muted)' }}>
                    Consult a tax professional for personalized advice — and keep receipts for at least 3 years.
                  </p>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}

        {/* ═══════════ INCOME ═══════════ */}
        {activeTab === 'income' && (
          <motion.div
            key="income"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <motion.section custom={0} variants={cardVariants} initial="hidden" animate="visible" className="card-planner">
              <SectionHeader icon={Plus} accent={SAGE_DARK} title="Log Income" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <input
                  type="date"
                  value={newIncome.date}
                  onChange={(e) => setNewIncome((p) => ({ ...p, date: e.target.value }))}
                  className="planner-input"
                />
                <select
                  value={newIncome.source}
                  onChange={(e) => setNewIncome((p) => ({ ...p, source: e.target.value as IncomeEntry['source'] }))}
                  className="planner-input"
                >
                  <option value="triedbyagirl">triedbyagirl</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={newIncome.amount}
                  onChange={(e) => setNewIncome((p) => ({ ...p, amount: e.target.value }))}
                  className="planner-input"
                />
                <input
                  type="text"
                  placeholder="Description..."
                  value={newIncome.description}
                  onChange={(e) => setNewIncome((p) => ({ ...p, description: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addIncome()}
                  className="planner-input"
                />
                <button onClick={addIncome} className="planner-button">
                  Add Income
                </button>
              </div>
            </motion.section>

            <motion.section custom={1} variants={cardVariants} initial="hidden" animate="visible" className="card-planner">
              <SectionHeader
                icon={TrendingUp}
                accent={SAGE_DARK}
                title="Income Entries"
                sub={`This month: $${monthlyIncome.toLocaleString()} · This year: $${annualIncome.toLocaleString()}`}
              />
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sortedIncome.length === 0 && (
                  <p className="font-caveat text-lg text-center py-6" style={{ color: 'var(--espresso-muted)' }}>
                    No income logged yet — every dollar counts
                  </p>
                )}
                {sortedIncome.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 px-3 py-3 rounded-md group overflow-hidden"
                    style={rowStyle}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${SAGE_DARK}1f` }}
                    >
                      <DollarSign className="w-4 h-4" style={{ color: SAGE_DARK }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--espresso)' }}>
                        {entry.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge color={SOURCE_COLORS[entry.source] ?? SOURCE_COLORS.Other}>{entry.source}</Badge>
                        <span className="text-xs" style={{ color: 'var(--espresso-muted)' }}>
                          {entry.date}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold shrink-0" style={{ color: SAGE_DARK }}>
                      +${entry.amount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeIncome(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity shrink-0"
                      style={{ color: 'var(--espresso-muted)' }}
                      aria-label="Delete income entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}

        {/* ═══════════ EXPENSES ═══════════ */}
        {activeTab === 'expenses' && (
          <motion.div
            key="expenses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <motion.section custom={0} variants={cardVariants} initial="hidden" animate="visible" className="card-planner">
              <SectionHeader icon={Plus} accent={GOLD} title="Log Expense" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense((p) => ({ ...p, date: e.target.value }))}
                  className="planner-input"
                />
                <input
                  type="text"
                  placeholder="Item name..."
                  value={newExpense.item}
                  onChange={(e) => setNewExpense((p) => ({ ...p, item: e.target.value }))}
                  className="planner-input"
                />
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense((p) => ({ ...p, amount: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addExpense()}
                  className="planner-input"
                />
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense((p) => ({ ...p, category: e.target.value as ExpenseCategory }))}
                  className="planner-input"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newExpense.taxDeductible}
                    onChange={(e) => setNewExpense((p) => ({ ...p, taxDeductible: e.target.checked }))}
                    className="w-4 h-4"
                    style={{ accentColor: 'var(--sage)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--espresso)' }}>
                    Tax deductible
                  </span>
                </label>
                <button onClick={addExpense} className="planner-button ml-auto">
                  Add Expense
                </button>
              </div>
            </motion.section>

            <motion.section custom={1} variants={cardVariants} initial="hidden" animate="visible" className="card-planner">
              <SectionHeader
                icon={Receipt}
                accent={GOLD}
                title="Expense Entries"
                sub={`This month: $${monthlyExpenses.toLocaleString()} · Tax deductible: $${deductibleExpenses.toLocaleString()}`}
              />
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sortedExpenses.length === 0 && (
                  <p className="font-caveat text-lg text-center py-6" style={{ color: 'var(--espresso-muted)' }}>
                    No expenses logged yet — track every business purchase
                  </p>
                )}
                {sortedExpenses.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 px-3 py-3 rounded-md group overflow-hidden"
                    style={rowStyle}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${GOLD}1f` }}
                    >
                      <Receipt className="w-4 h-4" style={{ color: GOLD_DARK }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--espresso)' }}>
                        {entry.item}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge color={EXPENSE_CATEGORY_COLORS[entry.category] ?? EXPENSE_CATEGORY_COLORS.Other}>
                          {entry.category}
                        </Badge>
                        <span className="text-xs" style={{ color: 'var(--espresso-muted)' }}>
                          {entry.date}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleTaxDeductible(entry.id)}
                      className="shrink-0"
                      title="Toggle tax deductible"
                    >
                      {entry.taxDeductible ? (
                        <Badge color={SAGE_DARK}>Deductible</Badge>
                      ) : (
                        <Badge color="#8a8a8a">Not Deductible</Badge>
                      )}
                    </button>
                    <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--espresso)' }}>
                      -${entry.amount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeExpense(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity shrink-0"
                      style={{ color: 'var(--espresso-muted)' }}
                      aria-label="Delete expense entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}

        {/* ═══════════ BUDGET ═══════════ */}
        {activeTab === 'budget' && (
          <motion.div
            key="budget"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Month Selector */}
            <div className="flex flex-wrap gap-2">
              {MONTHS.map((m, idx) => {
                const active = idx === selectedMonth
                return (
                  <button
                    key={m.label}
                    onClick={() => selectMonth(idx)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                    style={{
                      background: active ? 'var(--gold)' : 'var(--cream-dark)',
                      color: active ? '#FFFFFF' : 'var(--espresso-muted)',
                      border: `1px solid ${active ? 'var(--gold)' : 'var(--border-light)'}`,
                    }}
                  >
                    {m.label}
                  </button>
                )
              })}
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {budget.categories.map((cat, i) => {
                const spent = spendingByCat[cat.id] || 0
                const remaining = cat.budgeted - spent
                const pct = cat.budgeted > 0 ? Math.min((spent / cat.budgeted) * 100, 100) : 0
                const Icon = CATEGORY_ICONS[cat.icon] || MoreHorizontal
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.04, ease: EASE }}
                    className="card-planner"
                    style={{ padding: '1.25rem' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-4 h-4 shrink-0" style={{ color: cat.color }} />
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--espresso)' }}>
                        {cat.name}
                      </span>
                      <span className="ml-auto text-xs shrink-0" style={{ color: 'var(--espresso-muted)' }}>
                        {Math.round(pct)}%
                      </span>
                    </div>
                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'var(--espresso-muted)' }}>
                          Spent
                        </p>
                        <p className="font-playfair text-lg font-semibold" style={{ color: 'var(--espresso)' }}>
                          ${spent.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'var(--espresso-muted)' }}>
                          of ${cat.budgeted.toLocaleString()}
                        </p>
                        <p className="text-xs" style={{ color: remaining >= 0 ? SAGE_DARK : GOLD_DARK }}>
                          {remaining >= 0 ? `$${remaining.toLocaleString()} left` : `$${Math.abs(remaining).toLocaleString()} over`}
                        </p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--cream-dark)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: remaining >= 0 ? cat.color : GOLD_DARK }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Add Transaction */}
            <motion.section custom={1} variants={cardVariants} initial="hidden" animate="visible" className="card-planner">
              <SectionHeader icon={Plus} accent={GOLD} title="Add Transaction" sub={selectedMonthLabel} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <input
                  type="date"
                  value={newTx.date}
                  onChange={(e) => setNewTx((p) => ({ ...p, date: e.target.value }))}
                  className="planner-input"
                />
                <select
                  value={newTx.categoryId}
                  onChange={(e) => setNewTx((p) => ({ ...p, categoryId: e.target.value }))}
                  className="planner-input"
                >
                  {budget.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Description..."
                  value={newTx.description}
                  onChange={(e) => setNewTx((p) => ({ ...p, description: e.target.value }))}
                  className="planner-input"
                />
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={newTx.amount}
                  onChange={(e) => setNewTx((p) => ({ ...p, amount: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addTransaction()}
                  className="planner-input"
                />
                <button onClick={addTransaction} className="planner-button">
                  Add
                </button>
              </div>
            </motion.section>

            {/* Transactions List */}
            <motion.section custom={2} variants={cardVariants} initial="hidden" animate="visible" className="card-planner">
              <SectionHeader
                icon={Receipt}
                accent={GOLD}
                title="Transactions"
                sub={`${budget.transactions.length} recorded for ${selectedMonthLabel}`}
              />
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {budget.transactions.length === 0 && (
                  <p className="font-caveat text-lg text-center py-6" style={{ color: 'var(--espresso-muted)' }}>
                    No transactions yet — add your first expense for {MONTHS[selectedMonth].label}
                  </p>
                )}
                {budget.transactions.map((tx) => {
                  const cat = budget.categories.find((c) => c.id === tx.categoryId)
                  return (
                    <motion.div
                      key={tx.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 px-3 py-3 rounded-md group overflow-hidden"
                      style={rowStyle}
                    >
                      <span className="text-xs w-20 shrink-0" style={{ color: 'var(--espresso-muted)' }}>
                        {tx.date}
                      </span>
                      <span className="flex-1 min-w-0 text-sm truncate" style={{ color: 'var(--espresso)' }}>
                        {tx.description}
                      </span>
                      {cat && <Badge color={cat.color}>{cat.name}</Badge>}
                      <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--espresso)' }}>
                        ${tx.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity shrink-0"
                        style={{ color: 'var(--espresso-muted)' }}
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>
          </motion.div>
        )}

        {/* ═══════════ STREAMS ═══════════ */}
        {activeTab === 'streams' && (
          <motion.div
            key="streams"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Income Streams */}
            <motion.section custom={0} variants={cardVariants} initial="hidden" animate="visible" className="card-planner">
              <SectionHeader icon={Layers} accent={SAGE_DARK} title="Income Streams" sub="Diversify how money flows in" />

              {/* Add Stream */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
                <input
                  type="text"
                  placeholder="Stream name..."
                  value={newStream.name}
                  onChange={(e) => setNewStream((p) => ({ ...p, name: e.target.value }))}
                  className="planner-input"
                />
                <input
                  type="number"
                  placeholder="Min $/mo"
                  value={newStream.min}
                  onChange={(e) => setNewStream((p) => ({ ...p, min: e.target.value }))}
                  className="planner-input"
                />
                <input
                  type="number"
                  placeholder="Max $/mo"
                  value={newStream.max}
                  onChange={(e) => setNewStream((p) => ({ ...p, max: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addStream()}
                  className="planner-input"
                />
                <select
                  value={newStream.status}
                  onChange={(e) => setNewStream((p) => ({ ...p, status: e.target.value as IncomeStream['status'] }))}
                  className="planner-input"
                >
                  <option value="Active">Active</option>
                  <option value="Planning">Planning</option>
                  <option value="Exploring">Exploring</option>
                </select>
                <button onClick={addStream} className="planner-button">
                  Add Stream
                </button>
              </div>

              <div className="space-y-3">
                {streams.length === 0 && (
                  <p className="font-caveat text-lg text-center py-6" style={{ color: 'var(--espresso-muted)' }}>
                    No income streams yet — plant the first seed
                  </p>
                )}
                {streams.map((stream) => (
                  <div key={stream.id} className="p-4 rounded-md group" style={rowStyle}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--espresso)' }}>
                          {stream.name}
                        </h4>
                        <Badge color={STREAM_STATUS_COLORS[stream.status]}>{stream.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs" style={{ color: 'var(--espresso-muted)' }}>
                          ${stream.monthlyMin.toLocaleString()}-${stream.monthlyMax.toLocaleString()}/mo
                        </span>
                        <button
                          onClick={() => removeStream(stream.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity"
                          style={{ color: 'var(--espresso-muted)' }}
                          aria-label="Delete stream"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--cream)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: SAGE }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${stream.monthlyMin > 0 ? Math.min((stream.actual / stream.monthlyMin) * 100, 100) : 0}%`,
                        }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs" style={{ color: 'var(--espresso-muted)' }}>
                        Actual: $
                      </label>
                      <input
                        type="number"
                        value={stream.actual || ''}
                        onChange={(e) => updateStreamActual(stream.id, parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 rounded text-sm"
                        style={{
                          background: 'var(--cream)',
                          border: '1px solid var(--border-light)',
                          color: 'var(--espresso)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Action Items */}
            <motion.section custom={1} variants={cardVariants} initial="hidden" animate="visible" className="card-planner">
              <SectionHeader icon={CheckSquare} accent={SAGE_DARK} title="Money Moves" sub="Priority tasks with due dates" />

              {/* Add Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <input
                  type="text"
                  placeholder="What income-generating task will you do?"
                  value={newAction.text}
                  onChange={(e) => setNewAction((p) => ({ ...p, text: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addAction()}
                  className="planner-input"
                />
                <input
                  type="date"
                  value={newAction.dueDate}
                  onChange={(e) => setNewAction((p) => ({ ...p, dueDate: e.target.value }))}
                  className="planner-input"
                />
                <select
                  value={newAction.priority}
                  onChange={(e) => setNewAction((p) => ({ ...p, priority: e.target.value as ActionItem['priority'] }))}
                  className="planner-input"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <button onClick={addAction} className="planner-button">
                  Add Task
                </button>
              </div>

              <div className="space-y-2">
                {actions.length === 0 && (
                  <p className="font-caveat text-lg text-center py-6" style={{ color: 'var(--espresso-muted)' }}>
                    No money moves yet — what&apos;s one small step toward abundance today?
                  </p>
                )}
                {actions.map((action) => (
                  <motion.div
                    key={action.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 px-3 py-3 rounded-md group"
                    style={rowStyle}
                  >
                    <button onClick={() => cycleActionStatus(action.id)} className="shrink-0" title="Toggle status">
                      {action.status === 'Done' ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: SAGE_DARK }} />
                      ) : (
                        <Circle
                          className="w-5 h-5"
                          style={{ color: action.status === 'In Progress' ? GOLD_DARK : 'var(--espresso-muted)' }}
                        />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${action.status === 'Done' ? 'line-through' : ''}`}
                        style={{ color: action.status === 'Done' ? 'var(--espresso-muted)' : 'var(--espresso)' }}
                      >
                        {action.text}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge color={PRIORITY_COLORS[action.priority]}>{action.priority}</Badge>
                        <Badge color={ACTION_STATUS_COLORS[action.status]}>{action.status}</Badge>
                        {action.dueDate && (
                          <span className="text-xs" style={{ color: 'var(--espresso-muted)' }}>
                            {action.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeAction(action.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity shrink-0"
                      style={{ color: 'var(--espresso-muted)' }}
                      aria-label="Delete action"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
