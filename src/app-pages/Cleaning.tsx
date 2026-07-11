import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSection from '@/components/HeroSection'
import {
  Sparkles,
  ChevronDown,
  RotateCcw,
  AlertTriangle,
  Brush,
  Clock,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CleaningTask {
  id: string
  text: string
  completed: boolean
}

interface RoomSection {
  id: string
  name: string
  color: string
  tasks: CleaningTask[]
}

interface DaySchedule {
  day: string
  label: string
  tint: string
  tasks: { id: string; text: string; completed: boolean }[]
  timeEstimate: string
}

interface SupplyItem {
  id: string
  name: string
  checked: boolean
  low: boolean
}

/* ------------------------------------------------------------------ */
/*  Default data                                                       */
/* ------------------------------------------------------------------ */

const DEFAULT_ROOMS: RoomSection[] = [
  {
    id: 'kitchen', name: 'Kitchen', color: '#d4a76a',
    tasks: [
      { id: 'k1', text: 'Clean oven & stove top', completed: false },
      { id: 'k2', text: 'Wipe down all counter surfaces', completed: false },
      { id: 'k3', text: 'Organize pantry & discard expired items', completed: false },
      { id: 'k4', text: 'Clean refrigerator inside & out', completed: false },
      { id: 'k5', text: 'Descale coffee maker', completed: false },
      { id: 'k6', text: 'Clean dishwasher filter', completed: false },
      { id: 'k7', text: 'Wipe cabinet exteriors', completed: false },
      { id: 'k8', text: 'Deep clean sink & disposal', completed: false },
      { id: 'k9', text: 'Mop kitchen floors', completed: false },
      { id: 'k10', text: 'Clean microwave inside', completed: false },
      { id: 'k11', text: 'Organize drawers & utensil trays', completed: false },
      { id: 'k12', text: 'Clean range hood & filter', completed: false },
    ],
  },
  {
    id: 'bedrooms', name: 'Bedrooms', color: '#f07d94',
    tasks: [
      { id: 'b1', text: 'Wash bedding & pillowcases', completed: false },
      { id: 'b2', text: 'Rotate mattress', completed: false },
      { id: 'b3', text: 'Dust all surfaces & nightstands', completed: false },
      { id: 'b4', text: 'Organize closet & donate unused clothes', completed: false },
      { id: 'b5', text: 'Clean under bed', completed: false },
      { id: 'b6', text: 'Wash curtains or wipe blinds', completed: false },
      { id: 'b7', text: 'Vacuum thoroughly including corners', completed: false },
      { id: 'b8', text: 'Clean mirrors & windows', completed: false },
      { id: 'b9', text: 'Organize nightstands', completed: false },
      { id: 'b10', text: 'Freshen room with natural scent', completed: false },
    ],
  },
  {
    id: 'bathrooms', name: 'Bathrooms', color: '#7a8e9e',
    tasks: [
      { id: 'ba1', text: 'Scrub toilet inside & out', completed: false },
      { id: 'ba2', text: 'Clean shower/tub & tile grout', completed: false },
      { id: 'ba3', text: 'Wash bath mats & shower curtain', completed: false },
      { id: 'ba4', text: 'Clean mirrors & fixtures', completed: false },
      { id: 'ba5', text: 'Organize cabinets & drawers', completed: false },
      { id: 'ba6', text: 'Replace shower curtain liner', completed: false },
      { id: 'ba7', text: 'Deep clean grout lines', completed: false },
      { id: 'ba8', text: 'Descale faucets & showerhead', completed: false },
      { id: 'ba9', text: 'Clean exhaust fan', completed: false },
      { id: 'ba10', text: 'Mop floors', completed: false },
      { id: 'ba11', text: 'Wash towels & replace hand towels', completed: false },
      { id: 'ba12', text: 'Empty & sanitize trash bin', completed: false },
    ],
  },
  {
    id: 'living', name: 'Living Room', color: '#7a9e7a',
    tasks: [
      { id: 'l1', text: 'Dust all shelves & surfaces', completed: false },
      { id: 'l2', text: 'Vacuum upholstery & cushions', completed: false },
      { id: 'l3', text: 'Clean windows inside', completed: false },
      { id: 'l4', text: 'Wipe baseboards', completed: false },
      { id: 'l5', text: 'Organize media & cables', completed: false },
      { id: 'l6', text: 'Clean light fixtures & lampshades', completed: false },
      { id: 'l7', text: 'Polish furniture', completed: false },
      { id: 'l8', text: 'Vacuum or mop floors', completed: false },
      { id: 'l9', text: 'Fluff & arrange pillows', completed: false },
      { id: 'l10', text: 'Wipe down TV screen & electronics', completed: false },
    ],
  },
  {
    id: 'dining', name: 'Dining Room', color: '#d4a76a',
    tasks: [
      { id: 'd1', text: 'Dust table & chairs', completed: false },
      { id: 'd2', text: 'Polish wooden furniture', completed: false },
      { id: 'd3', text: 'Clean chandelier/light fixture', completed: false },
      { id: 'd4', text: 'Wipe baseboards', completed: false },
      { id: 'd5', text: 'Clean windows & window sills', completed: false },
      { id: 'd6', text: 'Vacuum or mop floors', completed: false },
      { id: 'd7', text: 'Organize china cabinet', completed: false },
      { id: 'd8', text: 'Wash table linens', completed: false },
    ],
  },
  {
    id: 'office', name: 'Home Office', color: '#7a8e9e',
    tasks: [
      { id: 'o1', text: 'Organize desk & clear clutter', completed: false },
      { id: 'o2', text: 'Dust electronics & monitor', completed: false },
      { id: 'o3', text: 'File or shred loose papers', completed: false },
      { id: 'o4', text: 'Clean keyboard & mouse', completed: false },
      { id: 'o5', text: 'Organize cables', completed: false },
      { id: 'o6', text: 'Dust bookshelves', completed: false },
      { id: 'o7', text: 'Vacuum floors & under desk', completed: false },
      { id: 'o8', text: 'Clean windows', completed: false },
      { id: 'o9', text: 'Sanitize phone & high-touch items', completed: false },
      { id: 'o10', text: 'Empty trash & recycling', completed: false },
    ],
  },
  {
    id: 'laundry', name: 'Laundry Room', color: '#7a9e7a',
    tasks: [
      { id: 'la1', text: 'Clean washing machine drum', completed: false },
      { id: 'la2', text: 'Clean lint trap & dryer vent', completed: false },
      { id: 'la3', text: 'Wipe down all surfaces', completed: false },
      { id: 'la4', text: 'Organize detergents & supplies', completed: false },
      { id: 'la5', text: 'Mop floors', completed: false },
      { id: 'la6', text: 'Clean sink', completed: false },
      { id: 'la7', text: 'Check & restock supplies', completed: false },
      { id: 'la8', text: 'Wipe down washer & dryer exteriors', completed: false },
    ],
  },
  {
    id: 'outdoor', name: 'Outdoor / Garage', color: '#e85d78',
    tasks: [
      { id: 'ou1', text: 'Sweep patio/deck', completed: false },
      { id: 'ou2', text: 'Clean outdoor furniture', completed: false },
      { id: 'ou3', text: 'Wash exterior windows', completed: false },
      { id: 'ou4', text: 'Organize garage & tools', completed: false },
      { id: 'ou5', text: 'Clean garage floor', completed: false },
      { id: 'ou6', text: 'Check & clean gutters', completed: false },
      { id: 'ou7', text: 'Trim hedges & tidy garden', completed: false },
      { id: 'ou8', text: 'Clean grill/BBQ', completed: false },
      { id: 'ou9', text: 'Wash exterior doors', completed: false },
      { id: 'ou10', text: 'Organize outdoor storage', completed: false },
    ],
  },
]

const DEFAULT_WEEKLY: DaySchedule[] = [
  {
    day: 'Monday', label: 'Deep Clean Day', tint: 'rgba(122,158,122,0.08)',
    tasks: [
      { id: 'm1', text: 'Clean bathroom', completed: false },
      { id: 'm2', text: 'Wipe kitchen counters', completed: false },
      { id: 'm3', text: 'Vacuum main areas', completed: false },
    ],
    timeEstimate: '~45 min',
  },
  {
    day: 'Tuesday', label: 'Laundry Day', tint: 'rgba(196,160,122,0.08)',
    tasks: [
      { id: 't1', text: 'Wash clothes', completed: false },
      { id: 't2', text: 'Fold & put away', completed: false },
      { id: 't3', text: 'Wash bedding (bi-weekly)', completed: false },
    ],
    timeEstimate: '~30 min active',
  },
  {
    day: 'Wednesday', label: 'Mid-Week Tidy', tint: 'rgba(212,167,106,0.08)',
    tasks: [
      { id: 'w1', text: 'Tidy all rooms', completed: false },
      { id: 'w2', text: 'Wipe surfaces', completed: false },
      { id: 'w3', text: 'Empty trash bins', completed: false },
    ],
    timeEstimate: '~20 min',
  },
  {
    day: 'Thursday', label: 'Kitchen Focus', tint: 'rgba(196,114,142,0.08)',
    tasks: [
      { id: 'th1', text: 'Deep clean appliances', completed: false },
      { id: 'th2', text: 'Organize fridge', completed: false },
      { id: 'th3', text: 'Clean sink thoroughly', completed: false },
    ],
    timeEstimate: '~30 min',
  },
  {
    day: 'Friday', label: 'Floors & Dusting', tint: 'rgba(122,142,158,0.08)',
    tasks: [
      { id: 'f1', text: 'Dust all surfaces', completed: false },
      { id: 'f2', text: 'Mop hard floors', completed: false },
      { id: 'f3', text: 'Vacuum carpets', completed: false },
    ],
    timeEstimate: '~40 min',
  },
  {
    day: 'Saturday', label: 'Big Clean', tint: 'rgba(156,114,158,0.08)',
    tasks: [
      { id: 's1', text: 'All weekly tasks combined', completed: false },
      { id: 's2', text: 'Outdoor areas', completed: false },
      { id: 's3', text: 'Car cleaning (monthly)', completed: false },
    ],
    timeEstimate: '~90 min',
  },
  {
    day: 'Sunday', label: 'Rest or Light Tidy', tint: 'rgba(243,240,236,0.5)',
    tasks: [
      { id: 'su1', text: 'Light tidy as needed', completed: false },
      { id: 'su2', text: 'Prep for the week', completed: false },
      { id: 'su3', text: 'Plan next week\'s meals', completed: false },
    ],
    timeEstimate: '~15 min or Rest Day',
  },
]

const DEFAULT_SUPPLIES: SupplyItem[] = [
  { id: 's1', name: 'All-Purpose Cleaner', checked: false, low: false },
  { id: 's2', name: 'Glass Cleaner', checked: false, low: false },
  { id: 's3', name: 'Disinfectant Spray', checked: false, low: false },
  { id: 's4', name: 'Baking Soda', checked: false, low: false },
  { id: 's5', name: 'White Vinegar', checked: false, low: false },
  { id: 's6', name: 'Microfiber Cloths', checked: false, low: false },
  { id: 's7', name: 'Scrub Brushes', checked: false, low: false },
  { id: 's8', name: 'Sponges', checked: false, low: false },
  { id: 's9', name: 'Trash Bags', checked: false, low: false },
  { id: 's10', name: 'Laundry Detergent', checked: false, low: false },
  { id: 's11', name: 'Dish Soap', checked: false, low: false },
  { id: 's12', name: 'Floor Cleaner', checked: false, low: false },
]

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                    */
/* ------------------------------------------------------------------ */

function loadRooms(): RoomSection[] {
  try {
    const stored = localStorage.getItem('planner-spring-cleaning')
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return DEFAULT_ROOMS
}

function loadWeekly(): DaySchedule[] {
  try {
    const stored = localStorage.getItem('planner-weekly-cleaning')
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return DEFAULT_WEEKLY
}

function loadSupplies(): SupplyItem[] {
  try {
    const stored = localStorage.getItem('planner-cleaning-supplies')
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return DEFAULT_SUPPLIES
}

function loadNotes(): string {
  try {
    const stored = localStorage.getItem('planner-cleaning-notes')
    if (stored) return stored
  } catch { /* ignore */ }
  return ''
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

export default function Cleaning() {
  const [rooms, setRooms] = useState<RoomSection[]>(loadRooms)
  const [weekly, setWeekly] = useState<DaySchedule[]>(loadWeekly)
  const [supplies, setSupplies] = useState<SupplyItem[]>(loadSupplies)
  const [notes, setNotes] = useState<string>(loadNotes)
  const [expandedRoom, setExpandedRoom] = useState<string | null>('kitchen')
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetTarget, setResetTarget] = useState<'all' | 'weekly'>('all')

  /* Persist */
  useEffect(() => { localStorage.setItem('planner-spring-cleaning', JSON.stringify(rooms)) }, [rooms])
  useEffect(() => { localStorage.setItem('planner-weekly-cleaning', JSON.stringify(weekly)) }, [weekly])
  useEffect(() => { localStorage.setItem('planner-cleaning-supplies', JSON.stringify(supplies)) }, [supplies])
  useEffect(() => { localStorage.setItem('planner-cleaning-notes', notes) }, [notes])

  const toggleTask = useCallback((roomId: string, taskId: string) => {
    setRooms((prev) => prev.map((room) => {
      if (room.id !== roomId) return room
      return {
        ...room,
        tasks: room.tasks.map((t) => t.id === taskId ? { ...t, completed: !t.completed } : t),
      }
    }))
  }, [])

  const toggleWeeklyTask = useCallback((dayIndex: number, taskId: string) => {
    setWeekly((prev) => prev.map((day, i) => {
      if (i !== dayIndex) return day
      return {
        ...day,
        tasks: day.tasks.map((t) => t.id === taskId ? { ...t, completed: !t.completed } : t),
      }
    }))
  }, [])

  const toggleSupply = useCallback((id: string) => {
    setSupplies((prev) => prev.map((s) => s.id === id ? { ...s, checked: !s.checked } : s))
  }, [])

  const toggleLow = useCallback((id: string) => {
    setSupplies((prev) => prev.map((s) => s.id === id ? { ...s, low: !s.low } : s))
  }, [])

  const resetAll = () => {
    if (resetTarget === 'all') {
      setRooms(DEFAULT_ROOMS)
      setExpandedRoom(null)
    }
    setWeekly(DEFAULT_WEEKLY)
    setShowResetModal(false)
  }

  const resetWeek = () => {
    setWeekly(DEFAULT_WEEKLY)
  }

  /* Progress calculations */
  const totalTasks = rooms.reduce((sum, r) => sum + r.tasks.length, 0)
  const completedTasks = rooms.reduce((sum, r) => sum + r.tasks.filter((t) => t.completed).length, 0)
  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const weekCompleted = weekly.reduce((sum, d) => sum + d.tasks.filter((t) => t.completed).length, 0)
  const weekTotal = weekly.reduce((sum, d) => sum + d.tasks.length, 0)

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1 // Mon=0, Sun=6

  return (
    <>
      <div className="space-y-8">
        {/* ====== SPRING CLEANING HEADER ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-rose-500" />
              <h1 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] font-medium text-warm-900">
                Spring Cleaning
              </h1>
            </div>
            <p className="text-warm-500 font-inter text-sm mt-1">Deep clean your space, clear your mind.</p>
          </div>

          {/* Overall progress ring */}
          <div className="flex items-center gap-4">
            <div className="relative w-[100px] h-[100px]">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--warm-200)" strokeWidth="8" />
                <motion.circle
                  cx="60" cy="60" r="52" fill="none" stroke="var(--rose-500)"
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - overallPercent / 100)}
                  initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - overallPercent / 100) }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-inter font-semibold text-lg text-warm-800">{overallPercent}%</span>
              </div>
            </div>
            <div>
              <p className="font-inter text-sm text-warm-700 font-medium">{completedTasks} of {totalTasks} tasks</p>
              <p className="font-inter text-xs text-warm-500">completed</p>
            </div>
          </div>
        </motion.div>

        {/* ====== ROOM CARDS ====== */}
        <div className="space-y-3">
          <AnimatePresence>
            {rooms.map((room, idx) => {
              const done = room.tasks.filter((t) => t.completed).length
              const pct = room.tasks.length > 0 ? Math.round((done / room.tasks.length) * 100) : 0
              const isOpen = expandedRoom === room.id
              const allDone = done === room.tasks.length && room.tasks.length > 0

              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  className="card-planner overflow-hidden"
                  style={allDone ? { boxShadow: `0 0 0 2px ${room.color}40, 0 4px 12px rgba(42,37,32,0.08)` } : {}}
                >
                  {/* Room header */}
                  <button
                    onClick={() => setExpandedRoom(isOpen ? null : room.id)}
                    className="w-full flex items-center gap-4 py-1"
                  >
                    <div
                      className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${room.color}20` }}
                    >
                      <Sparkles className="w-5 h-5" style={{ color: room.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-playfair font-medium text-lg text-warm-800">{room.name}</h3>
                    </div>

                    {/* Mini progress */}
                    <div className="hidden sm:flex items-center gap-3">
                      <div className="w-20 h-2 bg-warm-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: room.color }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-xs text-warm-500 font-inter w-12 text-right">{done}/{room.tasks.length}</span>
                    </div>

                    <ChevronDown
                      className={cn('w-5 h-5 text-warm-400 transition-transform duration-300', isOpen && 'rotate-180')}
                    />
                  </button>

                  {/* Expanded tasks */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-warm-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {room.tasks.map((task) => (
                            <TaskRow key={task.id} task={task} onToggle={() => toggleTask(room.id, task.id)} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Reset buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setResetTarget('all'); setShowResetModal(true) }}
              className="btn-secondary text-sm"
            >
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              Reset All Progress
            </button>
          </div>
        </div>

        {/* ====== WEEKLY SCHEDULE ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="card-planner"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Brush className="w-6 h-6 text-rose-500" />
                <h2 className="font-playfair text-[clamp(1.5rem,2.5vw,2rem)] font-medium text-warm-900">
                  Weekly Cleaning Schedule
                </h2>
              </div>
              <p className="text-warm-500 font-inter text-sm mt-1">A little each day keeps the mess away.</p>
            </div>
            <button onClick={resetWeek} className="btn-secondary text-sm">
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              Reset Week
            </button>
          </div>

          {/* Week progress */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex-1 h-2 bg-warm-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-rose-500 rounded-full"
                animate={{ width: `${weekTotal > 0 ? (weekCompleted / weekTotal) * 100 : 0}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="text-xs text-warm-500 font-inter">{weekCompleted}/{weekTotal}</span>
          </div>

          {/* 7-day grid */}
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {weekly.map((day, dIdx) => {
              const isToday = dIdx === todayIndex
              const dayDone = day.tasks.filter((t) => t.completed).length
              const dayTotal = day.tasks.length
              return (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.4 + dIdx * 0.06, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  className="rounded-md p-3 space-y-2 relative"
                  style={{
                    backgroundColor: day.tint,
                    borderLeft: isToday ? '3px solid var(--rose-500)' : '3px solid transparent',
                  }}
                >
                  <div>
                    <p className={cn('font-inter text-sm font-semibold', isToday ? 'text-rose-600' : 'text-warm-700')}>
                      {day.day.slice(0, 3)}
                    </p>
                    <p className="text-[0.6875rem] text-warm-500 font-inter">{day.label}</p>
                  </div>
                  <div className="space-y-1.5">
                    {day.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => toggleWeeklyTask(dIdx, task.id)}
                        className="flex items-center gap-2 w-full text-left group"
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded-sm border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200',
                            task.completed
                              ? 'bg-rose-500 border-rose-500'
                              : 'border-warm-300 bg-white group-hover:border-rose-300'
                          )}
                        >
                          {task.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <span className={cn(
                          'text-xs font-inter transition-all duration-200',
                          task.completed ? 'text-warm-400 line-through decoration-rose-300' : 'text-warm-700'
                        )}>
                          {task.text}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3 text-warm-400" />
                    <span className="text-[0.6875rem] text-warm-500 font-inter">{day.timeEstimate}</span>
                  </div>
                  {dayTotal > 0 && (
                    <div className="w-full h-1 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-400 rounded-full transition-all duration-300"
                        style={{ width: `${(dayDone / dayTotal) * 100}%` }}
                      />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ====== SUPPLIES & NOTES ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-6"
        >
          {/* Supply Checklist */}
          <div className="lg:col-span-3 card-planner">
            <h3 className="font-playfair font-medium text-xl text-warm-800 mb-1">Supply Checklist</h3>
            <p className="text-warm-500 font-inter text-sm mb-4">Restock when running low</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {supplies.map((supply) => (
                <div
                  key={supply.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-warm-50 transition-colors group"
                >
                  <button
                    onClick={() => toggleSupply(supply.id)}
                    className={cn(
                      'w-[18px] h-[18px] rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200',
                      supply.checked
                        ? 'bg-rose-500 border-rose-500'
                        : 'border-warm-300 bg-white hover:border-rose-300'
                    )}
                  >
                    {supply.checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </button>
                  <span className={cn(
                    'text-sm font-inter flex-1 transition-all duration-200',
                    supply.checked ? 'text-warm-400 line-through decoration-rose-300' : 'text-warm-700'
                  )}>
                    {supply.name}
                  </span>
                  <button
                    onClick={() => toggleLow(supply.id)}
                    className={cn(
                      'text-[0.625rem] font-inter font-medium px-2 py-0.5 rounded-full transition-all duration-200',
                      supply.low
                        ? 'bg-warning/20 text-warning-700'
                        : 'bg-warm-100 text-warm-500 opacity-0 group-hover:opacity-100'
                    )}
                    title={supply.low ? 'Running low' : 'Mark as low'}
                  >
                    {supply.low ? 'LOW' : 'low'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Household Notes */}
          <div className="lg:col-span-2 card-planner">
            <h3 className="font-playfair font-medium text-xl text-warm-800 mb-1">Notes</h3>
            <p className="text-warm-500 font-inter text-sm mb-4">Reminders, repair lists, etc.</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Home maintenance reminders, repair contacts, seasonal tasks..."
              className="w-full min-h-[160px] p-3 rounded-md border border-warm-200 bg-white font-caveat text-base text-warm-700 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 resize-none leading-relaxed"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e8e2da 27px, #e8e2da 28px)',
                lineHeight: '28px',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* ====== RESET CONFIRMATION MODAL ====== */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(42,37,32,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="bg-white rounded-lg max-w-[420px] w-full mx-4 p-8 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-error" />
                </div>
                <h3 className="font-playfair text-xl font-medium text-warm-900">Reset Progress?</h3>
              </div>
              <p className="text-warm-600 font-inter text-sm mb-6">
                This will clear all your {resetTarget === 'all' ? 'spring cleaning' : 'weekly'} progress.
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowResetModal(false)} className="btn-secondary text-sm px-4 py-2">
                  Cancel
                </button>
                <button onClick={resetAll} className="btn-danger text-sm px-4 py-2">
                  Reset Progress
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .btn-secondary {
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--warm-100); color: var(--warm-800);
          border: 1px solid var(--warm-200); border-radius: 6px;
          font-family: 'Inter', system-ui, sans-serif; font-weight: 500; font-size: 0.875rem;
          padding: 8px 16px; transition: all 0.2s ease; cursor: pointer;
        }
        .btn-secondary:hover { background: var(--warm-200); }
        .btn-danger {
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--error); color: white; border: none; border-radius: 6px;
          font-family: 'Inter', system-ui, sans-serif; font-weight: 500; font-size: 0.875rem;
          padding: 8px 16px; transition: all 0.2s ease; cursor: pointer;
        }
        .btn-danger:hover { filter: brightness(0.9); }
      `}</style>
    </>
  )
}

/* ====== Task Row ====== */
function TaskRow({ task, onToggle }: { task: CleaningTask; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      className="flex items-center gap-3 p-2 rounded-md hover:bg-warm-50 transition-colors w-full text-left group"
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={cn(
          'w-[18px] h-[18px] rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200',
          task.completed
            ? 'bg-rose-500 border-rose-500'
            : 'border-warm-300 bg-white group-hover:border-rose-300'
        )}
      >
        {task.completed && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </div>
      <span className={cn(
        'text-[0.9375rem] font-inter flex-1 transition-all duration-300',
        task.completed ? 'text-warm-400 line-through decoration-rose-300' : 'text-warm-700'
      )}>
        {task.text}
      </span>
    </motion.button>
  )
}
