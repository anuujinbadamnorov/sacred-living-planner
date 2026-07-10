import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Utensils,
  Car,
  Zap,
  Film,
  ShoppingBag,
  HeartPulse,
  PiggyBank,
  Sparkles,
  MoreHorizontal,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Layout from '@/components/Layout'
import { usePlanner } from '@/hooks/usePlanner'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface ExpenseCategory {
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
  categories: ExpenseCategory[]
  transactions: Transaction[]
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_CATEGORIES: ExpenseCategory[] = [
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

const CATEGORY_ICONS: Record<string, React.ElementType> = {
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

const uid = () => Math.random().toString(36).slice(2, 10)

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function Budget() {
  const { month: monthParam } = useParams<{ month: string }>()
  const router = useRouter()
  const { getStorageItem, setStorageItem } = usePlanner()

  /* ---- Resolve current month ---- */
  const currentMonthIndex = useMemo(() => {
    if (monthParam === 'current') return 0
    const idx = MONTHS.findIndex((m) => m.label.toLowerCase() === monthParam?.toLowerCase())
    return idx >= 0 ? idx : 0
  }, [monthParam])

  const currentMonth = MONTHS[currentMonthIndex]
  const storageKey = `planner-budget-${currentMonth.year}-${String(currentMonth.value + 1).padStart(2, '0')}`

  /* ---- Budget state ---- */
  const [budget, setBudget] = useState<MonthBudget>(() => {
    const stored = getStorageItem<MonthBudget | null>(storageKey, null)
    if (stored) return stored
    return {
      income: { expected: 5000, actual: 0 },
      categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
      transactions: [],
    }
  })

  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [newTxDate, setNewTxDate] = useState(new Date(2026, currentMonth.value, 1).toISOString().split('T')[0])
  const [newTxCategory, setNewTxCategory] = useState(DEFAULT_CATEGORIES[0].id)
  const [newTxDesc, setNewTxDesc] = useState('')
  const [newTxAmount, setNewTxAmount] = useState('')

  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatBudget, setNewCatBudget] = useState('')
  const [newCatColor, setNewCatColor] = useState('#8e7ac4')

  /* ---- Persist ---- */
  useEffect(() => {
    setBudget((prev) => {
      const stored = getStorageItem<MonthBudget | null>(storageKey, null)
      if (stored) return stored
      return {
        income: { expected: prev.income.expected, actual: 0 },
        categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
        transactions: [],
      }
    })
  }, [storageKey, getStorageItem])

  useEffect(() => {
    setStorageItem(storageKey, budget)
  }, [budget, storageKey, setStorageItem])

  /* ---- Computed values ---- */
  const categorySpending = useMemo(() => {
    const map: Record<string, number> = {}
    budget.categories.forEach((c) => { map[c.id] = 0 })
    budget.transactions.forEach((tx) => {
      if (map[tx.categoryId] !== undefined) {
        map[tx.categoryId] += tx.amount
      }
    })
    return map
  }, [budget.transactions, budget.categories])

  const totalBudgeted = useMemo(() => budget.categories.reduce((s, c) => s + c.budgeted, 0), [budget.categories])
  const totalSpent = useMemo(() => Object.values(categorySpending).reduce((s, v) => s + v, 0), [categorySpending])
  const remaining = budget.income.actual - totalSpent
  const budgetProgress = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0

  const sortedCategories = useMemo(() => {
    return [...budget.categories].sort((a, b) => categorySpending[b.id] - categorySpending[a.id])
  }, [budget.categories, categorySpending])

  /* ---- Navigation ---- */
  const goToMonth = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < MONTHS.length) {
        const label = MONTHS[idx].label.toLowerCase()
        router.push(`/planner/budget/${label}`)
      }
    },
    [router]
  )

  /* ---- Actions ---- */
  const updateIncome = useCallback((field: 'expected' | 'actual', value: number) => {
    setBudget((prev) => ({
      ...prev,
      income: { ...prev.income, [field]: value },
    }))
  }, [])

  const updateCategoryBudget = useCallback((catId: string, amount: number) => {
    setBudget((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === catId ? { ...c, budgeted: amount } : c)),
    }))
  }, [])

  const addTransaction = useCallback(() => {
    const amount = parseFloat(newTxAmount)
    if (!newTxDesc.trim() || isNaN(amount) || amount <= 0) return
    const tx: Transaction = {
      id: uid(),
      date: newTxDate,
      categoryId: newTxCategory,
      description: newTxDesc.trim(),
      amount,
    }
    setBudget((prev) => ({ ...prev, transactions: [tx, ...prev.transactions] }))
    setNewTxDesc('')
    setNewTxAmount('')
    setShowAddTransaction(false)
  }, [newTxDate, newTxCategory, newTxDesc, newTxAmount])

  const deleteTransaction = useCallback((id: string) => {
    setBudget((prev) => ({ ...prev, transactions: prev.transactions.filter((t) => t.id !== id) }))
  }, [])

  const addCategory = useCallback(() => {
    const amount = parseFloat(newCatBudget) || 0
    if (!newCatName.trim()) return
    const cat: ExpenseCategory = {
      id: uid(),
      name: newCatName.trim(),
      budgeted: amount,
      color: newCatColor,
      icon: 'more-horizontal',
      isDefault: false,
    }
    setBudget((prev) => ({ ...prev, categories: [...prev.categories, cat] }))
    setNewCatName('')
    setNewCatBudget('')
    setShowAddCategory(false)
  }, [newCatName, newCatBudget, newCatColor])

  const deleteCategory = useCallback((id: string) => {
    setBudget((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
      transactions: prev.transactions.filter((t) => t.categoryId !== id),
    }))
  }, [])

  /* ---- Render helpers ---- */
  const formatCurrency = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <Layout>
      <div className="space-y-6 pb-12">
        {/* ====== Month Navigation ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToMonth(currentMonthIndex - 1)}
              disabled={currentMonthIndex === 0}
              className="p-2 rounded-md hover:bg-warm-100 text-warm-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-playfair font-semibold text-warm-900 text-2xl">
              {currentMonth.label} {currentMonth.year}
            </h2>
            <button
              onClick={() => goToMonth(currentMonthIndex + 1)}
              disabled={currentMonthIndex === MONTHS.length - 1}
              className="p-2 rounded-md hover:bg-warm-100 text-warm-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* ====== Summary Cards ====== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Income', amount: formatCurrency(budget.income.actual), sub: 'Actual income', color: 'text-[#7a9e7a]', icon: null },
            { label: 'Total Spent', amount: formatCurrency(totalSpent), sub: `${budget.transactions.length} transactions`, color: 'text-rose-600', icon: null },
            { label: 'Remaining', amount: formatCurrency(remaining), sub: `${totalBudgeted > 0 ? Math.round((remaining / totalBudgeted) * 100) : 0}% of budget`, color: remaining >= 0 ? 'text-[#7a9e7a]' : 'text-[#c47272]', icon: null },
            { label: 'Budget Used', amount: `${Math.round(budgetProgress)}%`, sub: 'of total budget', color: 'text-[#7a8e9e]', icon: null },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="card-planner text-center py-5"
            >
              <p className="text-[0.6875rem] font-inter font-semibold text-warm-500 uppercase tracking-widest mb-1">
                {card.label}
              </p>
              <p className={`font-playfair font-semibold text-[1.75rem] ${card.color}`}>{card.amount}</p>
              <p className="text-sm font-inter text-warm-500 mt-0.5">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ====== Income Section ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="card-planner"
        >
          <h3 className="font-playfair font-medium text-warm-800 mb-4">Income</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-inter font-semibold text-warm-500 uppercase tracking-wide mb-1 block">
                Expected Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 font-inter text-sm">$</span>
                <input
                  type="number"
                  value={budget.income.expected || ''}
                  onChange={(e) => updateIncome('expected', Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-inter font-semibold text-warm-500 uppercase tracking-wide mb-1 block">
                Actual Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 font-inter text-sm">$</span>
                <input
                  type="number"
                  value={budget.income.actual || ''}
                  onChange={(e) => updateIncome('actual', Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-inter font-semibold text-warm-500 uppercase tracking-wide mb-1 block">
                Difference
              </label>
              <div className={`font-mono text-sm font-semibold py-2 ${budget.income.actual - budget.income.expected >= 0 ? 'text-[#7a9e7a]' : 'text-[#c47272]'}`}>
                {formatCurrency(budget.income.actual - budget.income.expected)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ====== Charts Row ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Donut Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="card-planner"
          >
            <h3 className="font-playfair font-medium text-warm-800 mb-4">Spending Breakdown</h3>
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="#e8e2da" strokeWidth="16" />
                  {totalSpent > 0 && (() => {
                    let offset = 0
                    const circumference = 2 * Math.PI * 60
                    return budget.categories
                      .filter((c) => categorySpending[c.id] > 0)
                      .map((cat) => {
                        const pct = categorySpending[cat.id] / totalSpent
                        const dash = pct * circumference
                        const el = (
                          <circle
                            key={cat.id}
                            cx="70"
                            cy="70"
                            r="60"
                            fill="none"
                            stroke={cat.color}
                            strokeWidth="16"
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            strokeDashoffset={-offset}
                            strokeLinecap="butt"
                            transform="rotate(-90 70 70)"
                            className="transition-all duration-700"
                          />
                        )
                        offset += dash
                        return el
                      })
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-inter font-semibold text-base text-warm-800">{formatCurrency(totalSpent)}</span>
                  <span className="text-xs text-warm-500 font-inter">Total</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
                {sortedCategories
                  .filter((c) => categorySpending[c.id] > 0)
                  .map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-inter text-warm-600 truncate">{cat.name}</span>
                      <span className="text-xs font-mono text-warm-500 ml-auto">{formatCurrency(categorySpending[cat.id])}</span>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>

          {/* Top Spending Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="card-planner"
          >
            <h3 className="font-playfair font-medium text-warm-800 mb-4">Top Spending Categories</h3>
            <div className="space-y-3">
              {sortedCategories.slice(0, 5).map((cat, i) => {
                const spent = categorySpending[cat.id]
                const maxSpent = sortedCategories.length > 0 ? categorySpending[sortedCategories[0].id] : 1
                const barWidth = maxSpent > 0 ? (spent / maxSpent) * 100 : 0
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-inter text-warm-700">{cat.name}</span>
                      <span className="text-sm font-mono text-warm-600">{formatCurrency(spent)}</span>
                    </div>
                    <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                )
              })}
              {sortedCategories.every((c) => categorySpending[c.id] === 0) && (
                <p className="text-sm text-warm-400 font-inter italic">No spending yet. Add transactions to see your breakdown.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* ====== Expense Categories ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="card-planner"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-playfair font-medium text-warm-800">Budget Categories</h3>
            <button
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="text-rose-600 hover:text-rose-700 text-sm font-inter font-medium flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {/* Add Category Form */}
          <AnimatePresence>
            {showAddCategory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-warm-50 rounded-md p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Category name"
                      className="px-3 py-2 text-sm font-inter border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 text-sm">$</span>
                      <input
                        type="number"
                        value={newCatBudget}
                        onChange={(e) => setNewCatBudget(e.target.value)}
                        placeholder="Budget"
                        className="w-full pl-7 pr-3 py-2 text-sm font-mono border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {['#9c7a5e', '#7a9e7a', '#7a8e9e', '#d4a76a', '#c4728e', '#8e7ac4', '#5a7a6a', '#9e7a9e'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setNewCatColor(c)}
                          className={`w-6 h-6 rounded-full transition-transform ${newCatColor === c ? 'ring-2 ring-offset-1 ring-warm-400 scale-110' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addCategory} className="btn-primary text-xs py-1.5">Save</button>
                    <button onClick={() => setShowAddCategory(false)} className="px-3 py-1.5 text-xs font-inter text-warm-600 hover:text-warm-800 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Rows */}
          <div className="space-y-2">
            <AnimatePresence>
              {budget.categories.map((cat, i) => {
                const spent = categorySpending[cat.id] || 0
                const pct = cat.budgeted > 0 ? Math.min((spent / cat.budgeted) * 100, 100) : 0
                const overBudget = spent > cat.budgeted
                const Icon = CATEGORY_ICONS[cat.icon] || MoreHorizontal
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={`flex items-center gap-4 py-3 px-3 border rounded-md transition-colors ${
                      overBudget ? 'bg-[#c472720a] border-[#c4727230]' : 'border-warm-100 hover:bg-warm-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" style={{ color: cat.color }} />
                    <span className="text-sm font-inter font-medium text-warm-700 w-28 shrink-0">{cat.name}</span>

                    {/* Budgeted */}
                    <div className="w-20 shrink-0">
                      <EditableAmount
                        value={cat.budgeted}
                        onChange={(v) => updateCategoryBudget(cat.id, v)}
                      />
                    </div>

                    {/* Spent */}
                    <span className="text-sm font-mono text-warm-600 w-20 text-right shrink-0">
                      {formatCurrency(spent)}
                    </span>

                    {/* Remaining */}
                    <span className={`text-sm font-mono w-20 text-right shrink-0 ${overBudget ? 'text-[#c47272]' : 'text-[#7a9e7a]'}`}>
                      {formatCurrency(cat.budgeted - spent)}
                    </span>

                    {/* Progress Bar */}
                    <div className="flex-1 h-1.5 bg-warm-200 rounded-full overflow-hidden hidden sm:block">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: overBudget ? '#c47272' : pct > 90 ? '#d4a76a' : cat.color,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>

                    {/* % Used */}
                    <span className="text-xs font-inter text-warm-500 w-10 text-right shrink-0">
                      {cat.budgeted > 0 ? Math.round((spent / cat.budgeted) * 100) : 0}%
                    </span>

                    {!cat.isDefault && (
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="text-warm-400 hover:text-[#c47272] transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ====== Transaction Log ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="card-planner"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-playfair font-medium text-warm-800">Transactions</h3>
            <button
              onClick={() => setShowAddTransaction(!showAddTransaction)}
              className="btn-primary flex items-center gap-1.5 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>

          {/* Add Transaction Form */}
          <AnimatePresence>
            {showAddTransaction && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-warm-50 rounded-md p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="date"
                      value={newTxDate}
                      onChange={(e) => setNewTxDate(e.target.value)}
                      className="px-3 py-2 text-sm font-inter border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    />
                    <select
                      value={newTxCategory}
                      onChange={(e) => setNewTxCategory(e.target.value)}
                      className="px-3 py-2 text-sm font-inter border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    >
                      {budget.categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newTxDesc}
                      onChange={(e) => setNewTxDesc(e.target.value)}
                      placeholder="Description"
                      className="px-3 py-2 text-sm font-inter border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 text-sm">$</span>
                      <input
                        type="number"
                        value={newTxAmount}
                        onChange={(e) => setNewTxAmount(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTransaction()}
                        placeholder="Amount"
                        className="w-full pl-7 pr-3 py-2 text-sm font-mono border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addTransaction} className="btn-primary text-xs py-1.5">Save</button>
                    <button onClick={() => setShowAddTransaction(false)} className="px-3 py-1.5 text-xs font-inter text-warm-600 hover:text-warm-800 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transaction List */}
          <div className="overflow-x-auto">
            {budget.transactions.length === 0 ? (
              <p className="text-sm text-warm-400 font-inter italic py-4 text-center">No transactions yet. Add your first expense!</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-warm-200">
                    <th className="text-left text-[0.6875rem] font-inter font-semibold text-warm-500 uppercase tracking-wider py-2 pr-4">Date</th>
                    <th className="text-left text-[0.6875rem] font-inter font-semibold text-warm-500 uppercase tracking-wider py-2 pr-4">Description</th>
                    <th className="text-left text-[0.6875rem] font-inter font-semibold text-warm-500 uppercase tracking-wider py-2 pr-4">Category</th>
                    <th className="text-right text-[0.6875rem] font-inter font-semibold text-warm-500 uppercase tracking-wider py-2 pr-4">Amount</th>
                    <th className="py-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {budget.transactions.map((tx, i) => {
                      const cat = budget.categories.find((c) => c.id === tx.categoryId)
                      return (
                        <motion.tr
                          key={tx.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25, delay: i * 0.03 }}
                          className="border-b border-warm-100 hover:bg-warm-50 transition-colors"
                        >
                          <td className="py-2.5 pr-4 text-sm font-mono text-warm-600 whitespace-nowrap">{tx.date}</td>
                          <td className="py-2.5 pr-4 text-sm font-inter text-warm-700">{tx.description}</td>
                          <td className="py-2.5 pr-4">
                            {cat && (
                              <span
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-inter font-medium"
                                style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                {cat.name}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 pr-4 text-sm font-mono text-rose-600 text-right whitespace-nowrap">
                            ${tx.amount.toFixed(2)}
                          </td>
                          <td className="py-2.5">
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              className="text-warm-400 hover:text-[#c47272] transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}

/* ==================================================================== */
/*  Sub-components                                                      */
/* ==================================================================== */

function EditableAmount({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [temp, setTemp] = useState(String(value))

  useEffect(() => {
    setTemp(String(value))
  }, [value])

  if (editing) {
    return (
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-warm-400 text-xs">$</span>
        <input
          type="number"
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          onBlur={() => {
            onChange(Number(temp) || 0)
            setEditing(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onChange(Number(temp) || 0)
              setEditing(false)
            }
          }}
          autoFocus
          className="w-full pl-5 pr-2 py-1 text-sm font-mono border border-rose-400 rounded focus:outline-none focus:ring-2 focus:ring-rose-100"
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-sm font-mono text-warm-600 hover:text-warm-800 transition-colors"
    >
      ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </button>
  )
}
