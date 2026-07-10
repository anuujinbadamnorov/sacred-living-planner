import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gift,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  X,
  Check,
} from 'lucide-react'
import { format, differenceInDays, parseISO, isValid } from 'date-fns'
import { cn } from '@/lib/utils'
import Layout from '@/components/Layout'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SpecialDate {
  id: string
  name: string
  date: string       // ISO date string (MM-DD for repeating annual events)
  type: 'Birthday' | 'Anniversary' | 'Holiday' | 'Custom'
  person?: string
  notes?: string
  repeat?: boolean
}

interface Gift {
  id: string
  forPerson: string
  occasion: string
  idea: string
  budget: number
  status: 'Idea' | 'Purchased' | 'Wrapped' | 'Given'
  notes: string
  dateId: string
}

/* ------------------------------------------------------------------ */
/*  2026 US Holidays                                                   */
/* ------------------------------------------------------------------ */

const HOLIDAYS_2026: SpecialDate[] = [
  { id: 'h1', name: "New Year's Day", date: '2026-01-01', type: 'Holiday', repeat: true },
  { id: 'h2', name: 'Martin Luther King Jr. Day', date: '2026-01-19', type: 'Holiday', repeat: true },
  { id: 'h3', name: "Presidents' Day", date: '2026-02-16', type: 'Holiday', repeat: true },
  { id: 'h4', name: 'Memorial Day', date: '2026-05-25', type: 'Holiday', repeat: true },
  { id: 'h5', name: 'Juneteenth', date: '2026-06-19', type: 'Holiday', repeat: true },
  { id: 'h6', name: 'Independence Day', date: '2026-07-04', type: 'Holiday', repeat: true },
  { id: 'h7', name: 'Labor Day', date: '2026-09-07', type: 'Holiday', repeat: true },
  { id: 'h8', name: 'Halloween', date: '2026-10-31', type: 'Holiday', repeat: true },
  { id: 'h9', name: 'Veterans Day', date: '2026-11-11', type: 'Holiday', repeat: true },
  { id: 'h10', name: 'Thanksgiving Day', date: '2026-11-26', type: 'Holiday', repeat: true },
  { id: 'h11', name: 'Christmas Eve', date: '2026-12-24', type: 'Holiday', repeat: true },
  { id: 'h12', name: 'Christmas Day', date: '2026-12-25', type: 'Holiday', repeat: true },
  { id: 'h13', name: "New Year's Eve", date: '2026-12-31', type: 'Holiday', repeat: true },
]

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                    */
/* ------------------------------------------------------------------ */

const STORAGE_DATES = 'planner-special-dates'
const STORAGE_GIFTS = 'planner-gifts'

function loadDates(): SpecialDate[] {
  try {
    const stored = localStorage.getItem(STORAGE_DATES)
    if (stored) return JSON.parse(stored)
  } catch { /* */ }
  return [...HOLIDAYS_2026]
}

function loadGifts(): Gift[] {
  try {
    const stored = localStorage.getItem(STORAGE_GIFTS)
    if (stored) return JSON.parse(stored)
  } catch { /* */ }
  return []
}

function saveDates(dates: SpecialDate[]) {
  localStorage.setItem(STORAGE_DATES, JSON.stringify(dates))
}

function saveGifts(gifts: Gift[]) {
  localStorage.setItem(STORAGE_GIFTS, JSON.stringify(gifts))
}

/* ------------------------------------------------------------------ */
/*  Utility: Sort dates by upcoming                                    */
/* ------------------------------------------------------------------ */

function getDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = parseISO(dateStr)
  if (!isValid(d)) return 999
  d.setHours(0, 0, 0, 0)
  return differenceInDays(d, today)
}

function sortByUpcoming(dates: SpecialDate[]): SpecialDate[] {
  return [...dates].sort((a, b) => {
    const da = getDaysUntil(a.date)
    const db = getDaysUntil(b.date)
    if (da < 0 && db >= 0) return 1
    if (db < 0 && da >= 0) return -1
    return da - db
  })
}

function getDateBlockColor(daysUntil: number): string {
  if (daysUntil === 0) return 'var(--rose-500)'
  if (daysUntil > 0 && daysUntil <= 7) return 'var(--rose-400)'
  if (daysUntil > 7 && daysUntil <= 30) return 'var(--rose-300)'
  return 'var(--warm-400)'
}

const TYPE_COLORS: Record<string, string> = {
  Birthday: 'var(--rose-300)',
  Anniversary: 'var(--warning)',
  Holiday: 'var(--info)',
  Custom: 'var(--success)',
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function SpecialDates() {
  const [dates, setDates] = useState<SpecialDate[]>(loadDates)
  const [gifts, setGifts] = useState<Gift[]>(loadGifts)
  const [showAddDate, setShowAddDate] = useState(false)
  const [expandedDateId, setExpandedDateId] = useState<string | null>(null)
  const [editingDateId, setEditingDateId] = useState<string | null>(null)
  const [giftTab, setGiftTab] = useState<string>('All')

  // Add date form
  const [newName, setNewName] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newType, setNewType] = useState<SpecialDate['type']>('Birthday')
  const [newPerson, setNewPerson] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newRepeat, setNewRepeat] = useState(true)

  // Edit form
  const [editName, setEditName] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editType, setEditType] = useState<SpecialDate['type']>('Birthday')
  const [editPerson, setEditPerson] = useState('')
  const [editNotes, setEditNotes] = useState('')

  useEffect(() => { saveDates(dates) }, [dates])
  useEffect(() => { saveGifts(gifts) }, [gifts])

  const upcomingDates = useMemo(() => sortByUpcoming(dates.filter((d) => getDaysUntil(d.date) >= -1)), [dates])
  const datesIn30Days = upcomingDates.filter((d) => getDaysUntil(d.date) >= 0 && getDaysUntil(d.date) <= 30)

  const addDate = () => {
    if (!newName || !newDate) return
    const entry: SpecialDate = {
      id: `sd${Date.now()}`,
      name: newName,
      date: newDate,
      type: newType,
      person: newPerson || undefined,
      notes: newNotes || undefined,
      repeat: newRepeat,
    }
    setDates((prev) => [...prev, entry])
    setNewName('')
    setNewDate('')
    setNewPerson('')
    setNewNotes('')
    setShowAddDate(false)
  }

  const deleteDate = (id: string) => {
    setDates((prev) => prev.filter((d) => d.id !== id))
    setGifts((prev) => prev.filter((g) => g.dateId !== id))
  }

  const startEdit = (date: SpecialDate) => {
    setEditingDateId(date.id)
    setEditName(date.name)
    setEditDate(date.date)
    setEditType(date.type)
    setEditPerson(date.person || '')
    setEditNotes(date.notes || '')
  }

  const saveEdit = () => {
    if (!editingDateId || !editName || !editDate) return
    setDates((prev) => prev.map((d) =>
      d.id === editingDateId
        ? { ...d, name: editName, date: editDate, type: editType, person: editPerson || undefined, notes: editNotes || undefined }
        : d
    ))
    setEditingDateId(null)
  }

  // Gift helpers
  const addGift = (dateId: string, personName: string, occasion: string) => {
    const gift: Gift = {
      id: `g${Date.now()}`,
      forPerson: personName,
      occasion,
      idea: '',
      budget: 0,
      status: 'Idea',
      notes: '',
      dateId,
    }
    setGifts((prev) => [...prev, gift])
  }

  const advanceGiftStatus = (giftId: string) => {
    const order: Gift['status'][] = ['Idea', 'Purchased', 'Wrapped', 'Given']
    setGifts((prev) => prev.map((g) => {
      if (g.id !== giftId) return g
      const idx = order.indexOf(g.status)
      return { ...g, status: order[(idx + 1) % order.length] }
    }))
  }

  const deleteGift = (giftId: string) => {
    setGifts((prev) => prev.filter((g) => g.id !== giftId))
  }

  const filteredGifts = giftTab === 'All'
    ? gifts
    : gifts.filter((g) => g.status === giftTab)

  // Year-at-a-glance data
  const months = Array.from({ length: 12 }, (_, i) => i)

  return (
    <Layout>
      <div className="space-y-8">
        {/* ====== HEADER ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <div className="flex items-center gap-3">
            <Gift className="w-7 h-7 text-rose-500" />
            <h1 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] font-medium text-warm-900">Special Dates</h1>
          </div>
          <p className="text-warm-500 font-inter text-sm mt-1">Never forget the moments that matter.</p>
          <p className="text-warm-500 font-inter text-sm mt-1">
            {datesIn30Days.length} date{datesIn30Days.length !== 1 ? 's' : ''} in the next 30 days
          </p>
        </motion.div>

        {/* ====== UPCOMING DATES LIST ====== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-xl font-medium text-warm-800">Upcoming Dates</h2>
            <button onClick={() => setShowAddDate(true)} className="btn-primary text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Date
            </button>
          </div>

          {upcomingDates.length === 0 ? (
            <div className="card-planner text-center py-12">
              <Calendar className="w-10 h-10 text-warm-300 mx-auto mb-3" />
              <p className="text-warm-500 font-inter text-sm">No upcoming dates. Add one to get started.</p>
            </div>
          ) : (
            <AnimatePresence>
              {upcomingDates.map((item, idx) => {
                const daysUntil = getDaysUntil(item.date)
                const isExpanded = expandedDateId === item.id
                const isEditing = editingDateId === item.id
                const itemGifts = gifts.filter((g) => g.dateId === item.id)
                const hasGifts = itemGifts.length > 0
                const dateColor = getDateBlockColor(daysUntil)

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    className="card-planner py-4 overflow-hidden"
                  >
                    {isEditing ? (
                      /* Edit mode */
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="label-text">Name *</label>
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 rounded-md border border-warm-200 text-sm font-inter focus:outline-none focus:border-rose-400" />
                          </div>
                          <div>
                            <label className="label-text">Date *</label>
                            <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full px-3 py-2 rounded-md border border-warm-200 text-sm font-inter focus:outline-none focus:border-rose-400" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="label-text">Type</label>
                            <select value={editType} onChange={(e) => setEditType(e.target.value as SpecialDate['type'])} className="w-full px-3 py-2 rounded-md border border-warm-200 text-sm font-inter focus:outline-none focus:border-rose-400">
                              {(['Birthday', 'Anniversary', 'Holiday', 'Custom'] as const).map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="label-text">Person</label>
                            <input value={editPerson} onChange={(e) => setEditPerson(e.target.value)} placeholder="Who is this for?" className="w-full px-3 py-2 rounded-md border border-warm-200 text-sm font-inter placeholder:text-warm-400 focus:outline-none focus:border-rose-400" />
                          </div>
                        </div>
                        <div>
                          <label className="label-text">Notes</label>
                          <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="w-full px-3 py-2 rounded-md border border-warm-200 text-sm font-inter focus:outline-none focus:border-rose-400 resize-none min-h-[60px]" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setEditingDateId(null)} className="btn-secondary text-sm px-3 py-1.5">Cancel</button>
                          <button onClick={saveEdit} className="btn-primary text-sm px-3 py-1.5">Save</button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <>
                        <div className="flex items-center gap-4">
                          {/* Date block */}
                          <div
                            className="w-14 h-14 rounded-md flex flex-col items-center justify-center shrink-0"
                            style={{
                              backgroundColor: dateColor,
                              animation: daysUntil === 0 ? 'pulse-glow 2s infinite' : undefined,
                            } as React.CSSProperties}
                          >
                            <span className="text-[0.625rem] font-inter font-semibold text-white uppercase tracking-wide">
                              {isValid(parseISO(item.date)) ? format(parseISO(item.date), 'MMM') : '---'}
                            </span>
                            <span className="text-xl font-inter font-bold text-white leading-none">
                              {isValid(parseISO(item.date)) ? format(parseISO(item.date), 'd') : '--'}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-inter text-[0.9375rem] font-medium text-warm-800 truncate">{item.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className="text-[0.6875rem] font-inter font-medium px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: TYPE_COLORS[item.type] }}
                              >
                                {item.type}
                              </span>
                              <span className={cn(
                                'text-xs font-inter',
                                daysUntil === 0 ? 'text-rose-600 font-semibold' : 'text-warm-500'
                              )}>
                                {daysUntil === 0 ? 'Today!' : daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` : `In ${daysUntil} days`}
                              </span>
                            </div>
                            {item.person && (
                              <p className="text-xs text-warm-500 font-inter mt-0.5">For: {item.person}</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            {hasGifts && (
                              <div className="p-1.5 rounded-md text-rose-500" title="Gifts planned">
                                <Gift className="w-4 h-4" />
                              </div>
                            )}
                            <button onClick={() => setExpandedDateId(isExpanded ? null : item.id)} className="p-1.5 rounded-md hover:bg-warm-100 text-warm-400 transition-colors">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button onClick={() => startEdit(item)} className="p-1.5 rounded-md hover:bg-warm-100 text-warm-400 hover:text-warm-600 transition-colors opacity-0 group-hover:opacity-100">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteDate(item.id)} className="p-1.5 rounded-md hover:bg-error/10 text-warm-400 hover:text-error transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded gift planning */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 mt-4 border-t border-warm-200">
                                <h4 className="font-inter text-sm font-semibold text-warm-700 mb-3">Gift Planning</h4>
                                {itemGifts.length === 0 ? (
                                  <p className="text-xs text-warm-400 font-inter mb-3">No gifts planned yet.</p>
                                ) : (
                                  <div className="space-y-2 mb-3">
                                    {itemGifts.map((gift) => (
                                      <GiftRow key={gift.id} gift={gift} onAdvance={() => advanceGiftStatus(gift.id)} onDelete={() => deleteGift(gift.id)} />
                                    ))}
                                  </div>
                                )}
                                <button
                                  onClick={() => addGift(item.id, item.person || item.name, item.name)}
                                  className="text-xs text-rose-600 font-inter font-medium hover:underline flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Add Gift Idea
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>

        {/* ====== GIFT PLANNING SECTION ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="card-planner"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-rose-500" />
              <h2 className="font-playfair text-[clamp(1.25rem,2vw,1.75rem)] font-medium text-warm-900">Gift Planning</h2>
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['All', 'Idea', 'Purchased', 'Wrapped', 'Given'].map((t) => (
              <button
                key={t}
                onClick={() => setGiftTab(t)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-200',
                  giftTab === t
                    ? 'bg-rose-500 text-white'
                    : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {filteredGifts.length === 0 ? (
            <p className="text-warm-500 font-inter text-sm text-center py-8">No gifts in this category yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredGifts.map((gift, idx) => (
                  <motion.div
                    key={gift.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.08 }}
                    className="card-planner p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-inter text-sm font-semibold text-warm-800">{gift.forPerson}</p>
                        <p className="text-xs text-warm-500 font-inter">{gift.occasion}</p>
                      </div>
                      <button onClick={() => deleteGift(gift.id)} className="p-1 rounded-md hover:bg-error/10 text-warm-400 hover:text-error">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {gift.idea && (
                      <p className="font-caveat text-base text-warm-700 mb-2">{gift.idea}</p>
                    )}
                    {gift.budget > 0 && (
                      <p className="text-xs font-mono text-warm-600 mb-2">Budget: ${gift.budget}</p>
                    )}
                    {/* Status flow */}
                    <div className="flex items-center gap-0">
                      {(['Idea', 'Purchased', 'Wrapped', 'Given'] as const).map((step, si) => {
                        const isCompleted = (['Idea', 'Purchased', 'Wrapped', 'Given'] as const).indexOf(gift.status) >= si
                        const isCurrent = gift.status === step
                        return (
                          <div key={step} className="flex items-center">
                            <button
                              onClick={() => advanceGiftStatus(gift.id)}
                              className={cn(
                                'w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300',
                                isCompleted
                                  ? 'bg-success'
                                  : isCurrent
                                    ? 'bg-rose-500 ring-2 ring-rose-200'
                                    : 'border-2 border-warm-200'
                              )}
                            >
                              {isCompleted && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                            </button>
                            {si < 3 && (
                              <div className={cn('w-8 h-0.5', isCompleted ? 'bg-success' : 'bg-warm-200')} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex gap-4 mt-1">
                      {(['Idea', 'Purchased', 'Wrapped', 'Given'] as const).map((step) => (
                        <span key={step} className={cn(
                          'text-[0.625rem] font-inter',
                          gift.status === step ? 'text-rose-600 font-medium' : 'text-warm-400'
                        )}>
                          {step}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* ====== YEAR AT A GLANCE ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="card-planner"
        >
          <h2 className="font-playfair text-[clamp(1.25rem,2vw,1.75rem)] font-medium text-warm-900 mb-4">Year at a Glance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {months.map((month) => {
              const monthDates = dates.filter((d) => {
                try { return parseISO(d.date).getMonth() === month } catch { return false }
              })
              return (
                <motion.div
                  key={month}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: month * 0.04 }}
                  className="border border-warm-200 rounded-md p-3"
                >
                  <p className="text-xs font-inter font-semibold text-warm-700 mb-2 text-center">
                    {format(new Date(2026, month), 'MMMM')}
                  </p>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1
                      const dateStr = `2026-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      const hasDate = monthDates.some((d) => d.date === dateStr)
                      const dateItem = monthDates.find((d) => d.date === dateStr)
                      return (
                        <div
                          key={day}
                          className="aspect-square rounded-sm flex items-center justify-center relative"
                          title={dateItem ? dateItem.name : undefined}
                        >
                          <span className={cn(
                            'text-[0.625rem] font-inter',
                            hasDate ? 'font-semibold' : 'text-warm-300'
                          )}>
                            {day}
                          </span>
                          {hasDate && dateItem && (
                            <div
                              className="absolute bottom-0.5 w-1 h-1 rounded-full"
                              style={{ backgroundColor: TYPE_COLORS[dateItem.type] }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex gap-4 mt-4 flex-wrap justify-center">
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-inter text-warm-600">{type}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ====== ADD DATE MODAL ====== */}
      <AnimatePresence>
        {showAddDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(42,37,32,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowAddDate(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg max-w-[480px] w-full mx-4 p-8 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-playfair text-xl font-medium text-warm-900">Add Special Date</h3>
                <button onClick={() => setShowAddDate(false)} className="p-1 rounded-md hover:bg-warm-100 text-warm-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label-text">Name *</label>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Mom's Birthday" className="w-full px-3 py-2 rounded-md border border-warm-200 text-sm font-inter placeholder:text-warm-400 focus:outline-none focus:border-rose-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Date *</label>
                    <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full px-3 py-2 rounded-md border border-warm-200 text-sm font-inter focus:outline-none focus:border-rose-400" />
                  </div>
                  <div>
                    <label className="label-text">Type</label>
                    <select value={newType} onChange={(e) => setNewType(e.target.value as SpecialDate['type'])} className="w-full px-3 py-2 rounded-md border border-warm-200 text-sm font-inter focus:outline-none focus:border-rose-400">
                      <option value="Birthday">Birthday</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Holiday">Holiday</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-text">Person (optional)</label>
                  <input value={newPerson} onChange={(e) => setNewPerson(e.target.value)} placeholder="Who is this for?" className="w-full px-3 py-2 rounded-md border border-warm-200 text-sm font-inter placeholder:text-warm-400 focus:outline-none focus:border-rose-400" />
                </div>
                <div>
                  <label className="label-text">Notes (optional)</label>
                  <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className="w-full px-3 py-2 rounded-md border border-warm-200 text-sm font-inter focus:outline-none focus:border-rose-400 resize-none min-h-[60px]" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNewRepeat(!newRepeat)}
                    className={cn(
                      'w-4 h-4 rounded border border-warm-300 flex items-center justify-center transition-all',
                      newRepeat ? 'bg-rose-500 border-rose-500' : 'bg-white'
                    )}
                  >
                    {newRepeat && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </button>
                  <span className="text-sm font-inter text-warm-700">Repeats annually</span>
                </div>
                <button onClick={addDate} className="btn-primary w-full">Add Date</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .label-text { display: block; font-family: 'Inter', system-ui, sans-serif; font-size: 0.8125rem; font-weight: 500; color: var(--warm-700); margin-bottom: 4px; }
      `}</style>
    </Layout>
  )
}

/* ====== Gift Row (inline) ====== */
function GiftRow({ gift, onAdvance, onDelete }: { gift: Gift; onAdvance: () => void; onDelete: () => void }) {
  const [idea, setIdea] = useState(gift.idea)

  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-warm-50">
      <div className="flex-1 min-w-0">
        <input
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Gift idea..."
          className="w-full bg-transparent text-sm font-inter text-warm-700 placeholder:text-warm-400 focus:outline-none"
        />
      </div>
      <button
        onClick={onAdvance}
        className={cn(
          'text-[0.625rem] font-inter font-medium px-2 py-1 rounded-full text-white transition-colors',
          gift.status === 'Idea' ? 'bg-warning' :
          gift.status === 'Purchased' ? 'bg-info' :
          gift.status === 'Wrapped' ? 'bg-rose-400' :
          'bg-success'
        )}
      >
        {gift.status}
      </button>
      <button onClick={onDelete} className="p-1 rounded-md hover:bg-error/10 text-warm-400 hover:text-error">
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  )
}
