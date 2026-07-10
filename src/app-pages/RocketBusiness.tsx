import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  Plus,
  X,
  Trash2,
  Receipt,
  Camera,
  Image,
  AlertCircle,
  PiggyBank,
} from 'lucide-react'
import Layout from '../components/Layout'

/* ─── Types ─── */
interface IncomeEntry {
  id: string
  date: string
  source: 'triedbyagirl' | 'Rocket' | 'Other'
  amount: number
  description: string
}

interface ExpenseEntry {
  id: string
  date: string
  item: string
  amount: number
  category: ExpenseCategory
  receiptUrl: string
  taxDeductible: boolean
}

type ExpenseCategory = 'Equipment' | 'Food/Treats' | 'Grooming' | 'Vet/Medical' | 'Toys' | 'Training' | 'Other'

interface BusinessData {
  income: IncomeEntry[]
  expenses: ExpenseEntry[]
}

/* ─── Constants ─── */
const STORAGE_KEY = 'rocket-business-data'

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Equipment',
  'Food/Treats',
  'Grooming',
  'Vet/Medical',
  'Toys',
  'Training',
  'Other',
]

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Equipment: 'bg-violet-100 text-violet-700',
  'Food/Treats': 'bg-amber-100 text-amber-700',
  Grooming: 'bg-pink-100 text-pink-700',
  'Vet/Medical': 'bg-rose-100 text-rose-700',
  Toys: 'bg-sky-100 text-sky-700',
  Training: 'bg-emerald-100 text-emerald-700',
  Other: 'bg-warm-100 text-warm-600',
}

const SOURCE_COLORS: Record<string, string> = {
  triedbyagirl: 'bg-rose-100 text-rose-700',
  Rocket: 'bg-sky-100 text-sky-700',
  Other: 'bg-warm-100 text-warm-600',
}

const SELF_EMPLOYMENT_TAX_RATE = 0.153

/* ─── Storage Helpers ─── */
function loadData(): BusinessData {
  try {
    const r = localStorage.getItem(STORAGE_KEY)
    return r ? JSON.parse(r) : { income: [], expenses: [] }
  } catch {
    return { income: [], expenses: [] }
  }
}
function saveData(data: BusinessData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/* ─── Card Entrance Variants ─── */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' as const },
  }),
}

/* ─── Main Page ─── */
export default function RocketBusiness() {
  const [data, setData] = useState<BusinessData>(loadData)
  const [activeSection, setActiveSection] = useState<'income' | 'expenses' | 'tax' | 'receipts'>('income')
  const [enlargedReceipt, setEnlargedReceipt] = useState<string | null>(null)

  /* Income Form */
  const [newIncome, setNewIncome] = useState({
    date: new Date().toISOString().split('T')[0],
    source: 'triedbyagirl' as IncomeEntry['source'],
    amount: '',
    description: '',
  })

  /* Expense Form */
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    item: '',
    amount: '',
    category: 'Equipment' as ExpenseCategory,
    receiptUrl: '',
    taxDeductible: true,
  })

  /* Persistence */
  useEffect(() => saveData(data), [data])

  /* ─── Derived Stats ─── */
  const currentMonth = new Date().toISOString().slice(0, 7) // "2026-06"
  const currentYear = new Date().getFullYear()

  const monthlyIncome = useMemo(
    () => data.income
      .filter((e) => e.date.startsWith(currentMonth))
      .reduce((sum, e) => sum + e.amount, 0),
    [data.income, currentMonth]
  )

  const annualIncome = useMemo(
    () => data.income
      .filter((e) => e.date.startsWith(String(currentYear)))
      .reduce((sum, e) => sum + e.amount, 0),
    [data.income, currentYear]
  )

  const monthlyExpenses = useMemo(
    () => data.expenses
      .filter((e) => e.date.startsWith(currentMonth))
      .reduce((sum, e) => sum + e.amount, 0),
    [data.expenses, currentMonth]
  )

  const totalIncome = useMemo(() => data.income.reduce((sum, e) => sum + e.amount, 0), [data.income])
  const totalExpenses = useMemo(() => data.expenses.reduce((sum, e) => sum + e.amount, 0), [data.expenses])
  const netProfit = totalIncome - totalExpenses
  const taxEstimate = Math.max(netProfit * SELF_EMPLOYMENT_TAX_RATE, 0)

  const deductibleExpenses = useMemo(
    () => data.expenses.filter((e) => e.taxDeductible).reduce((sum, e) => sum + e.amount, 0),
    [data.expenses]
  )

  const receiptsWithImages = useMemo(
    () => data.expenses.filter((e) => e.receiptUrl.trim()),
    [data.expenses]
  )

  /* ─── Handlers ─── */
  const addIncome = useCallback(() => {
    const amt = parseFloat(newIncome.amount)
    if (!newIncome.description.trim() || isNaN(amt) || amt <= 0) return
    setData((prev) => ({
      ...prev,
      income: [
        ...prev.income,
        {
          id: Date.now().toString(),
          date: newIncome.date,
          source: newIncome.source,
          amount: amt,
          description: newIncome.description,
        },
      ],
    }))
    setNewIncome({
      date: new Date().toISOString().split('T')[0],
      source: 'triedbyagirl',
      amount: '',
      description: '',
    })
  }, [newIncome])

  const removeIncome = useCallback((id: string) => {
    setData((prev) => ({ ...prev, income: prev.income.filter((i) => i.id !== id) }))
  }, [])

  const addExpense = useCallback(() => {
    const amt = parseFloat(newExpense.amount)
    if (!newExpense.item.trim() || isNaN(amt) || amt <= 0) return
    setData((prev) => ({
      ...prev,
      expenses: [
        ...prev.expenses,
        {
          id: Date.now().toString(),
          date: newExpense.date,
          item: newExpense.item,
          amount: amt,
          category: newExpense.category,
          receiptUrl: newExpense.receiptUrl,
          taxDeductible: newExpense.taxDeductible,
        },
      ],
    }))
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      item: '',
      amount: '',
      category: 'Equipment',
      receiptUrl: '',
      taxDeductible: true,
    })
  }, [newExpense])

  const removeExpense = useCallback((id: string) => {
    setData((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== id) }))
  }, [])

  const toggleTaxDeductible = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, taxDeductible: !e.taxDeductible } : e)),
    }))
  }, [])

  return (
    <Layout>
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
            <Briefcase className="w-32 h-32 text-warm-800" />
          </div>
          <div className="relative z-10 p-8 w-full">
            <div className="flex items-center gap-3 mb-2">
              <PiggyBank className="w-5 h-5 text-amber-700" />
              <span className="text-sm font-inter font-medium text-amber-700 uppercase tracking-widest">Business</span>
            </div>
            <h1 className="font-display text-4xl font-semibold text-warm-900 mb-1">Rocket&apos;s Business</h1>
            <p className="font-caveat text-xl text-warm-700">Track income, expenses, and taxes for your creator empire</p>
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
            { label: 'This Month', value: `$${monthlyIncome.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Total Income', value: `$${totalIncome.toLocaleString()}`, icon: DollarSign, color: 'text-sky-600', bg: 'bg-sky-50' },
            { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}`, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Net Profit', value: `$${netProfit.toLocaleString()}`, icon: Calculator, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="card-luxury flex items-center gap-3 overflow-hidden"
            >
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-warm-500 font-inter uppercase tracking-wide truncate">{stat.label}</p>
                <p className="text-xl font-display font-semibold text-warm-800 break-words">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══════════════ SECTION TABS ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2"
        >
          {[
            { key: 'income' as const, label: 'Income Tracker', icon: DollarSign },
            { key: 'expenses' as const, label: 'Expense Tracker', icon: Receipt },
            { key: 'tax' as const, label: 'Tax Summary', icon: Calculator },
            { key: 'receipts' as const, label: `Receipt Gallery (${receiptsWithImages.length})`, icon: Camera },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-inter text-sm font-medium transition-all ${
                activeSection === tab.key
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white border border-warm-200 text-warm-600 hover:border-warm-300 hover:bg-warm-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* ═══════════════ INCOME TRACKER ═══════════════ */}
        <AnimatePresence mode="wait">
          {activeSection === 'income' && (
            <motion.div
              key="income"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Income Form */}
              <motion.section
                custom={0}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="card-luxury"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-warm-800">Log Income</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <input
                    type="date"
                    value={newIncome.date}
                    onChange={(e) => setNewIncome((p) => ({ ...p, date: e.target.value }))}
                    className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-emerald-300"
                  />
                  <select
                    value={newIncome.source}
                    onChange={(e) => setNewIncome((p) => ({ ...p, source: e.target.value as IncomeEntry['source'] }))}
                    className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-emerald-300"
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
                    className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-emerald-300"
                  />
                  <input
                    type="text"
                    placeholder="Description..."
                    value={newIncome.description}
                    onChange={(e) => setNewIncome((p) => ({ ...p, description: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addIncome()}
                    className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-emerald-300"
                  />
                  <button
                    onClick={addIncome}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-md font-inter text-sm font-medium hover:bg-emerald-600 transition-colors"
                  >
                    Add Income
                  </button>
                </div>
              </motion.section>

              {/* Income List */}
              <motion.section
                custom={1}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="card-luxury"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-warm-800">Income Entries</h2>
                    <p className="font-caveat text-base text-warm-500">
                      Monthly: ${monthlyIncome.toLocaleString()} &middot; Annual: ${annualIncome.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {data.income.length === 0 && (
                    <p className="font-caveat text-lg text-warm-400 text-center py-6">
                      No income logged yet — every dollar counts
                    </p>
                  )}
                  {data.income.slice().reverse().map((entry) => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 px-3 py-3 rounded-md bg-white border border-warm-200 hover:border-emerald-200 transition-colors group overflow-hidden"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-medium text-warm-700 truncate">{entry.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-inter ${SOURCE_COLORS[entry.source]}`}>
                            {entry.source}
                          </span>
                          <span className="text-xs text-warm-400 font-inter">{entry.date}</span>
                        </div>
                      </div>
                      <span className="font-inter text-sm font-semibold text-emerald-600 shrink-0">
                        +${entry.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeIncome(entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-100 text-warm-400 hover:text-rose-500 transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            </motion.div>
          )}

          {/* ═══════════════ EXPENSE TRACKER ═══════════════ */}
          {activeSection === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Expense Form */}
              <motion.section
                custom={0}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="card-luxury"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-rose-500" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-warm-800">Log Expense</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense((p) => ({ ...p, date: e.target.value }))}
                    className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-rose-300"
                  />
                  <input
                    type="text"
                    placeholder="Item name..."
                    value={newExpense.item}
                    onChange={(e) => setNewExpense((p) => ({ ...p, item: e.target.value }))}
                    className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-rose-300"
                  />
                  <input
                    type="number"
                    placeholder="Amount ($)"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense((p) => ({ ...p, amount: e.target.value }))}
                    className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-rose-300"
                  />
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense((p) => ({ ...p, category: e.target.value as ExpenseCategory }))}
                    className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-rose-300"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Paste receipt image URL..."
                    value={newExpense.receiptUrl}
                    onChange={(e) => setNewExpense((p) => ({ ...p, receiptUrl: e.target.value }))}
                    className="px-3 py-2 rounded-md border border-warm-200 font-inter text-sm text-warm-700 bg-white focus:outline-none focus:border-rose-300"
                  />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newExpense.taxDeductible}
                        onChange={(e) => setNewExpense((p) => ({ ...p, taxDeductible: e.target.checked }))}
                        className="w-4 h-4 rounded border-warm-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="font-inter text-sm text-warm-600">Tax deductible</span>
                    </label>
                    <button
                      onClick={addExpense}
                      className="ml-auto px-4 py-2 bg-rose-500 text-white rounded-md font-inter text-sm font-medium hover:bg-rose-600 transition-colors"
                    >
                      Add Expense
                    </button>
                  </div>
                </div>
              </motion.section>

              {/* Expense List */}
              <motion.section
                custom={1}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="card-luxury"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-warm-800">Expense Entries</h2>
                    <p className="font-caveat text-base text-warm-500">
                      Monthly: ${monthlyExpenses.toLocaleString()} &middot; Tax deductible: ${deductibleExpenses.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {data.expenses.length === 0 && (
                    <p className="font-caveat text-lg text-warm-400 text-center py-6">
                      No expenses logged yet — track every business purchase
                    </p>
                  )}
                  {data.expenses.slice().reverse().map((entry) => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 px-3 py-3 rounded-md bg-white border border-warm-200 hover:border-rose-200 transition-colors group overflow-hidden"
                    >
                      <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-medium text-warm-700 truncate">{entry.item}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-inter ${CATEGORY_COLORS[entry.category]}`}>
                            {entry.category}
                          </span>
                          <span className="text-xs text-warm-400 font-inter">{entry.date}</span>
                          {entry.receiptUrl && (
                            <span className="text-xs text-sky-500 font-inter flex items-center gap-0.5">
                              <Camera className="w-3 h-3" /> Receipt
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleTaxDeductible(entry.id)}
                        className={`shrink-0 text-xs px-2 py-0.5 rounded font-inter transition-colors ${
                          entry.taxDeductible
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-warm-100 text-warm-400 hover:bg-warm-200'
                        }`}
                        title="Toggle tax deductible"
                      >
                        {entry.taxDeductible ? 'Deductible' : 'Not Deductible'}
                      </button>
                      <span className="font-inter text-sm font-semibold text-rose-600 shrink-0">
                        -${entry.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeExpense(entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-100 text-warm-400 hover:text-rose-500 transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            </motion.div>
          )}

          {/* ═══════════════ TAX SUMMARY ═══════════════ */}
          {activeSection === 'tax' && (
            <motion.div
              key="tax"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <motion.section
                custom={0}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="card-luxury"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                    <Calculator className="w-4 h-4 text-amber-600" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-warm-800">Tax Summary</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Income */}
                  <div className="p-4 rounded-md bg-emerald-50/60 border border-emerald-100">
                    <p className="text-xs font-inter uppercase tracking-wide text-emerald-600 mb-1">Total Income</p>
                    <p className="text-2xl font-display font-semibold text-emerald-700">${totalIncome.toLocaleString()}</p>
                  </div>
                  {/* Total Expenses */}
                  <div className="p-4 rounded-md bg-rose-50/60 border border-rose-100">
                    <p className="text-xs font-inter uppercase tracking-wide text-rose-600 mb-1">Total Expenses</p>
                    <p className="text-2xl font-display font-semibold text-rose-700">${totalExpenses.toLocaleString()}</p>
                  </div>
                  {/* Net Profit */}
                  <div className="p-4 rounded-md bg-sky-50/60 border border-sky-100">
                    <p className="text-xs font-inter uppercase tracking-wide text-sky-600 mb-1">Net Profit</p>
                    <p className={`text-2xl font-display font-semibold ${netProfit >= 0 ? 'text-sky-700' : 'text-rose-700'}`}>
                      ${netProfit.toLocaleString()}
                    </p>
                  </div>
                  {/* Tax Estimate */}
                  <div className="p-4 rounded-md bg-amber-50/60 border border-amber-100">
                    <p className="text-xs font-inter uppercase tracking-wide text-amber-600 mb-1">Est. Self-Employment Tax (15.3%)</p>
                    <p className="text-2xl font-display font-semibold text-amber-700">${Math.round(taxEstimate).toLocaleString()}</p>
                  </div>
                </div>

                {/* Tax Note */}
                <div className="mt-5 p-4 rounded-md bg-warm-50 border border-warm-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warm-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-inter text-sm text-warm-600">
                      The self-employment tax rate is 15.3% (12.4% for Social Security + 2.9% for Medicare).
                      You may also owe federal and state income taxes on top of this.
                    </p>
                    <p className="font-caveat text-base text-warm-500 mt-1">
                      Consult a tax professional for personalized advice. Keep all receipts for at least 3 years.
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* Category Breakdown */}
              <motion.section
                custom={1}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="card-luxury"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-violet-600" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-warm-800">Expense Breakdown by Category</h2>
                </div>

                <div className="space-y-3">
                  {EXPENSE_CATEGORIES.map((cat) => {
                    const catTotal = data.expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
                    const pct = totalExpenses > 0 ? (catTotal / totalExpenses) * 100 : 0
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="font-inter text-sm text-warm-600 w-28 shrink-0">{cat}</span>
                        <div className="flex-1 h-4 bg-warm-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-violet-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <span className="font-inter text-sm text-warm-700 w-16 text-right shrink-0">${catTotal.toLocaleString()}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.section>
            </motion.div>
          )}

          {/* ═══════════════ RECEIPT GALLERY ═══════════════ */}
          {activeSection === 'receipts' && (
            <motion.div
              key="receipts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <motion.section
                custom={0}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="card-luxury"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-amber-600" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-warm-800">Receipt Gallery</h2>
                </div>

                <p className="font-caveat text-base text-warm-500 mb-4">
                  Tap a receipt to enlarge it. Add receipt URLs when logging expenses.
                </p>

                {receiptsWithImages.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-warm-300 mx-auto mb-3" />
                    <p className="font-caveat text-lg text-warm-400">
                      No receipt images yet — paste a URL when adding an expense
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" style={{ minHeight: 400 }}>
                    {receiptsWithImages.map((entry, i) => (
                      <motion.button
                        key={entry.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setEnlargedReceipt(entry.receiptUrl)}
                        className="relative rounded-lg border border-warm-200 overflow-hidden group flex flex-col"
                        style={{ minHeight: 150, minWidth: 150 }}
                      >
                        <div className="flex-1 relative bg-warm-50 flex items-center justify-center">
                          <img
                            src={entry.receiptUrl}
                            alt={entry.item}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                          <Image className="w-8 h-8 text-warm-300 group-hover:opacity-0 transition-opacity" />
                        </div>
                        <div className="p-2 bg-white border-t border-warm-100">
                          <p className="font-inter text-xs text-warm-700 truncate">{entry.item}</p>
                          <p className="font-inter text-xs text-warm-500">${entry.amount.toLocaleString()} &middot; {entry.date}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════ ENLARGED RECEIPT MODAL ═══════════════ */}
        <AnimatePresence>
          {enlargedReceipt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
              onClick={() => setEnlargedReceipt(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="relative max-w-3xl max-h-[90vh] w-full bg-white rounded-lg overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setEnlargedReceipt(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <img
                  src={enlargedReceipt}
                  alt="Receipt"
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '90vh' }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}
