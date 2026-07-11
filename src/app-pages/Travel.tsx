import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plane,
  Plus,
  MapPin,
  Calendar,
  ChevronLeft,
  Check,
  Trash2,
  Globe,
  Star,
  Clock,
  Luggage,
  FileText,
  List,
  Bed,
  Ticket,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays, parseISO } from 'date-fns'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Trip {
  id: string
  destination: string
  startDate: string
  endDate: string
  color: string
  notes: string
  status: 'Planning' | 'Upcoming' | 'Current' | 'Completed'
}

interface Activity {
  id: string
  time: string
  description: string
  location: string
}

interface DayItinerary {
  day: number
  date: string
  activities: Activity[]
}

interface PackingCategory {
  id: string
  name: string
  items: PackingItem[]
}

interface PackingItem {
  id: string
  text: string
  checked: boolean
  quantity?: number
}

interface BucketItem {
  id: string
  destination: string
  status: 'Not started' | 'Planning' | 'Booked' | 'Visited'
  priority: number
  notes: string
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const TRIP_COLORS = ['#e85d78', '#5a7a6a', '#5a5a62', '#3a3a52', '#c4b8b0', '#8b6f5e', '#6b4f3a', '#d4a76a']

const DEFAULT_TRIPS: Trip[] = [
  {
    id: 't1', destination: 'Kyoto, Japan', startDate: '2026-04-10', endDate: '2026-04-20',
    color: '#e85d78', notes: 'Cherry blossom season!', status: 'Planning',
  },
  {
    id: 't2', destination: 'Paris, France', startDate: '2026-06-15', endDate: '2026-06-22',
    color: '#5a7a6a', notes: 'Summer getaway', status: 'Planning',
  },
]

const DEFAULT_PACKING: PackingCategory[] = [
  {
    id: 'clothing', name: 'Clothing', items: [
      { id: 'c1', text: 'Underwear', checked: false, quantity: 5 },
      { id: 'c2', text: 'Socks', checked: false, quantity: 5 },
      { id: 'c3', text: 'T-shirts / Tops', checked: false, quantity: 4 },
      { id: 'c4', text: 'Pants / Shorts', checked: false, quantity: 2 },
      { id: 'c5', text: 'Sleepwear', checked: false, quantity: 1 },
      { id: 'c6', text: 'Jacket / Sweater', checked: false, quantity: 1 },
      { id: 'c7', text: 'Comfortable Shoes', checked: false, quantity: 1 },
      { id: 'c8', text: 'Swimsuit', checked: false, quantity: 1 },
    ],
  },
  {
    id: 'toiletries', name: 'Toiletries', items: [
      { id: 't1', text: 'Toothbrush & Toothpaste', checked: false },
      { id: 't2', text: 'Shampoo & Conditioner', checked: false },
      { id: 't3', text: 'Deodorant', checked: false },
      { id: 't4', text: 'Skincare products', checked: false },
      { id: 't5', text: 'Hairbrush / Comb', checked: false },
      { id: 't6', text: 'Razor', checked: false },
      { id: 't7', text: 'Makeup', checked: false },
      { id: 't8', text: 'Sunscreen', checked: false },
    ],
  },
  {
    id: 'electronics', name: 'Electronics', items: [
      { id: 'e1', text: 'Phone Charger', checked: false },
      { id: 'e2', text: 'Headphones', checked: false },
      { id: 'e3', text: 'Power Adapter', checked: false },
      { id: 'e4', text: 'Camera', checked: false },
      { id: 'e5', text: 'Portable Battery', checked: false },
    ],
  },
  {
    id: 'documents', name: 'Documents', items: [
      { id: 'd1', text: 'ID / Passport', checked: false },
      { id: 'd2', text: 'Tickets / Boarding Pass', checked: false },
      { id: 'd3', text: 'Hotel Confirmation', checked: false },
      { id: 'd4', text: 'Travel Insurance', checked: false },
    ],
  },
  {
    id: 'misc', name: 'Misc', items: [
      { id: 'm1', text: 'Sunglasses', checked: false },
      { id: 'm2', text: 'Reusable Water Bottle', checked: false },
      { id: 'm3', text: 'Snacks', checked: false },
      { id: 'm4', text: 'Book / Kindle', checked: false },
      { id: 'm5', text: 'Umbrella', checked: false },
      { id: 'm6', text: 'First Aid Kit', checked: false },
    ],
  },
]

const STATUS_COLORS: Record<string, string> = {
  Planning: '#d4a76a',
  Upcoming: '#7a8e9e',
  Current: '#e85d78',
  Completed: '#7a9e7a',
}

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                    */
/* ------------------------------------------------------------------ */

function loadTrips(): Trip[] {
  try { const s = localStorage.getItem('planner-trips'); if (s) return JSON.parse(s) } catch { /* */ }
  return DEFAULT_TRIPS
}
function loadPacking(tripId: string): PackingCategory[] {
  try { const s = localStorage.getItem(`planner-packing-${tripId}`); if (s) return JSON.parse(s) } catch { /* */ }
  return DEFAULT_PACKING.map((c) => ({ ...c, items: c.items.map((i) => ({ ...i })) }))
}
function loadItinerary(tripId: string): DayItinerary[] {
  try { const s = localStorage.getItem(`planner-itinerary-${tripId}`); if (s) return JSON.parse(s) } catch { /* */ }
  // Auto-generate from trip dates
  const trip = loadTrips().find((t) => t.id === tripId)
  if (!trip) return []
  const days: DayItinerary[] = []
  let d = parseISO(trip.startDate)
  const end = parseISO(trip.endDate)
  let dayNum = 1
  while (d <= end) {
    days.push({ day: dayNum, date: format(d, 'yyyy-MM-dd'), activities: [] })
    d = new Date(d.getTime() + 86400000)
    dayNum++
  }
  return days
}
function loadTripNotes(tripId: string): string {
  return localStorage.getItem(`planner-travel-notes-${tripId}`) || ''
}
function loadBucket(): BucketItem[] {
  try { const s = localStorage.getItem('planner-travel-bucket'); if (s) return JSON.parse(s) } catch { /* */ }
  return [
    { id: 'b1', destination: 'Santorini, Greece', status: 'Planning', priority: 3, notes: '' },
    { id: 'b2', destination: 'Bali, Indonesia', status: 'Not started', priority: 2, notes: '' },
    { id: 'b3', destination: 'New York, USA', status: 'Visited', priority: 1, notes: '' },
  ]
}
function saveBucket(items: BucketItem[]) { localStorage.setItem('planner-travel-bucket', JSON.stringify(items)) }
function saveTrips(trips: Trip[]) { localStorage.setItem('planner-trips', JSON.stringify(trips)) }
function savePacking(tripId: string, cats: PackingCategory[]) { localStorage.setItem(`planner-packing-${tripId}`, JSON.stringify(cats)) }
function saveItinerary(tripId: string, itin: DayItinerary[]) { localStorage.setItem(`planner-itinerary-${tripId}`, JSON.stringify(itin)) }
function saveTripNotes(tripId: string, notes: string) { localStorage.setItem(`planner-travel-notes-${tripId}`, notes) }

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Travel() {
  const [trips, setTrips] = useState<Trip[]>(loadTrips)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [showAddTrip, setShowAddTrip] = useState(false)

  useEffect(() => { saveTrips(trips) }, [trips])

  const selectedTrip = trips.find((t) => t.id === selectedTripId) || null

  /* Add trip form state */
  const [newTripDest, setNewTripDest] = useState('')
  const [newTripStart, setNewTripStart] = useState('')
  const [newTripEnd, setNewTripEnd] = useState('')
  const [newTripColor, setNewTripColor] = useState(TRIP_COLORS[0])
  const [newTripNotes, setNewTripNotes] = useState('')

  const addTrip = () => {
    if (!newTripDest || !newTripStart || !newTripEnd) return
    const trip: Trip = {
      id: `t${Date.now()}`,
      destination: newTripDest,
      startDate: newTripStart,
      endDate: newTripEnd,
      color: newTripColor,
      notes: newTripNotes,
      status: 'Planning',
    }
    setTrips((prev) => [...prev, trip])
    setNewTripDest('')
    setNewTripStart('')
    setNewTripEnd('')
    setNewTripNotes('')
    setShowAddTrip(false)
  }

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id))
    if (selectedTripId === id) setSelectedTripId(null)
  }

  /* If a trip is selected, show detail view */
  if (selectedTrip && selectedTripId) {
    return (
      <TripDetail
        trip={selectedTrip}
        onBack={() => setSelectedTripId(null)}
        onDelete={() => deleteTrip(selectedTrip.id)}
      />
    )
  }

  return (
    <>
      <div className="space-y-8">
        {/* ====== HEADER ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <div className="relative h-[200px] rounded-lg overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(250,249,247,0.95)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-rose-100/50 to-warm-100" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3">
                <Plane className="w-7 h-7 text-rose-500" />
                <h1 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] font-medium text-warm-900">
                  Travel Planner
                </h1>
              </div>
              <p className="text-warm-500 font-inter text-sm mt-1">Plan adventures, create memories.</p>
            </div>
          </div>
        </motion.div>

        {/* ====== TRIP CARDS ====== */}
        <div className="flex items-center justify-between">
          <h2 className="font-playfair text-xl font-medium text-warm-800">
            {trips.length} {trips.length === 1 ? 'Trip' : 'Trips'} Planned
          </h2>
          <button onClick={() => setShowAddTrip(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Plan New Trip
          </button>
        </div>

        {trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-planner text-center py-16"
          >
            <Globe className="w-12 h-12 text-warm-300 mx-auto mb-4" />
            <h3 className="font-playfair text-xl text-warm-800 mb-2">No trips planned yet.</h3>
            <p className="text-warm-500 font-inter text-sm mb-6">Start planning your next adventure.</p>
            <button onClick={() => setShowAddTrip(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4 mr-2 inline" />
              Plan Your First Trip
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {trips.map((trip, idx) => {
                const duration = differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1
                const packing = loadPacking(trip.id)
                const totalPack = packing.reduce((s, c) => s + c.items.length, 0)
                const donePack = packing.reduce((s, c) => s + c.items.filter((i) => i.checked).length, 0)
                return (
                  <motion.div
                    key={trip.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    onClick={() => setSelectedTripId(trip.id)}
                    className="card-planner card-planner-hover cursor-pointer overflow-hidden p-0"
                  >
                    {/* Color header */}
                    <div className="h-12 px-4 flex items-center" style={{ backgroundColor: trip.color }}>
                      <h3 className="font-playfair text-lg font-semibold text-white drop-shadow-sm">{trip.destination}</h3>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-warm-600 font-inter text-sm">
                        <Calendar className="w-4 h-4 text-warm-400" />
                        {format(parseISO(trip.startDate), 'MMM d')} – {format(parseISO(trip.endDate), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2 text-warm-500 font-inter text-sm">
                        <Clock className="w-4 h-4 text-warm-400" />
                        {duration} days
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-inter font-medium px-2.5 py-1 rounded-full text-white"
                          style={{ backgroundColor: STATUS_COLORS[trip.status] }}
                        >
                          {trip.status}
                        </span>
                      </div>
                      {totalPack > 0 && (
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-xs text-warm-500 mb-1">
                            <span className="flex items-center gap-1"><Luggage className="w-3 h-3" />Packing</span>
                            <span>{donePack}/{totalPack}</span>
                          </div>
                          <div className="w-full h-1.5 bg-warm-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${totalPack > 0 ? (donePack / totalPack) * 100 : 0}%`, backgroundColor: trip.color }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-sm text-rose-600 font-inter font-medium group-hover:underline">View Trip →</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteTrip(trip.id) }}
                          className="p-1.5 rounded-md hover:bg-error/10 text-warm-400 hover:text-error transition-colors"
                          title="Delete trip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* ====== BUCKET LIST ====== */}
        <BucketList />
      </div>

      {/* ====== ADD TRIP MODAL ====== */}
      <AnimatePresence>
        {showAddTrip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(42,37,32,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowAddTrip(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg max-w-[500px] w-full mx-4 p-8 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-playfair text-xl font-medium text-warm-900">Plan New Trip</h3>
                <button onClick={() => setShowAddTrip(false)} className="p-1 rounded-md hover:bg-warm-100 text-warm-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label-text">Destination *</label>
                  <input
                    value={newTripDest}
                    onChange={(e) => setNewTripDest(e.target.value)}
                    placeholder="e.g., Paris, France"
                    className="w-full px-3 py-2 rounded-md border border-warm-200 bg-white text-warm-800 font-inter text-sm placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Start Date *</label>
                    <input
                      type="date"
                      value={newTripStart}
                      onChange={(e) => setNewTripStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-warm-200 bg-white text-warm-800 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400"
                    />
                  </div>
                  <div>
                    <label className="label-text">End Date *</label>
                    <input
                      type="date"
                      value={newTripEnd}
                      onChange={(e) => setNewTripEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-warm-200 bg-white text-warm-800 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="label-text">Trip Color</label>
                  <div className="flex gap-3 flex-wrap">
                    {TRIP_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setNewTripColor(c)}
                        className={cn(
                          'w-8 h-8 rounded-full transition-all duration-200',
                          newTripColor === c ? 'ring-2 ring-warm-400 ring-offset-2 scale-110' : 'hover:scale-110'
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-text">Notes (optional)</label>
                  <textarea
                    value={newTripNotes}
                    onChange={(e) => setNewTripNotes(e.target.value)}
                    placeholder="Trip notes..."
                    className="w-full px-3 py-2 rounded-md border border-warm-200 bg-white font-caveat text-base text-warm-700 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 resize-none min-h-[80px]"
                  />
                </div>
                <button onClick={addTrip} className="btn-primary w-full mt-2">
                  Save Trip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .label-text { display: block; font-family: 'Inter', system-ui, sans-serif; font-size: 0.8125rem; font-weight: 500; color: var(--warm-700); margin-bottom: 4px; }
      `}</style>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Trip Detail View                                                   */
/* ------------------------------------------------------------------ */

function TripDetail({ trip, onBack, onDelete }: { trip: Trip; onBack: () => void; onDelete: () => void }) {
  const [tab, setTab] = useState<'itinerary' | 'packing' | 'details' | 'notes'>('itinerary')
  const [packing, setPacking] = useState<PackingCategory[]>(() => loadPacking(trip.id))
  const [itinerary, setItinerary] = useState<DayItinerary[]>(() => loadItinerary(trip.id))
  const [notes, setNotes] = useState(() => loadTripNotes(trip.id))

  useEffect(() => { savePacking(trip.id, packing) }, [trip.id, packing])
  useEffect(() => { saveItinerary(trip.id, itinerary) }, [trip.id, itinerary])
  useEffect(() => { saveTripNotes(trip.id, notes) }, [trip.id, notes])

  const tabs = [
    { key: 'itinerary' as const, label: 'Itinerary', icon: List },
    { key: 'packing' as const, label: 'Packing', icon: Luggage },
    { key: 'details' as const, label: 'Details', icon: FileText },
    { key: 'notes' as const, label: 'Notes', icon: FileText },
  ]

  const togglePackItem = (catId: string, itemId: string) => {
    setPacking((prev) => prev.map((c) => {
      if (c.id !== catId) return c
      return { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, checked: !i.checked } : i) }
    }))
  }

  const totalPacked = packing.reduce((s, c) => s + c.items.length, 0)
  const donePacked = packing.reduce((s, c) => s + c.items.filter((i) => i.checked).length, 0)
  const packingPercent = totalPacked > 0 ? Math.round((donePacked / totalPacked) * 100) : 0

  const duration = differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1

  return (
    <>
      <div className="space-y-6">
        {/* Trip header bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="h-2 rounded-full mb-4" style={{ backgroundColor: trip.color }} />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <button onClick={onBack} className="text-sm text-rose-600 font-inter font-medium hover:underline mb-2 flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> All Trips
              </button>
              <h1 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] font-medium text-warm-900">
                {trip.destination}
              </h1>
              <p className="text-warm-500 font-inter text-sm mt-1">
                {format(parseISO(trip.startDate), 'MMM d')} – {format(parseISO(trip.endDate), 'MMM d, yyyy')} · {duration} days
              </p>
            </div>
            <button onClick={onDelete} className="p-2 rounded-md hover:bg-error/10 text-warm-400 hover:text-error transition-colors" title="Delete trip">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="border-b border-warm-200 flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 font-inter text-sm font-medium transition-colors relative',
                tab === t.key ? 'text-rose-600' : 'text-warm-500 hover:text-warm-700'
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {tab === t.key && (
                <motion.div
                  layoutId="travel-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500"
                  transition={{ duration: 0.25 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {tab === 'itinerary' && (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {itinerary.map((day, dIdx) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dIdx * 0.1 }}
                  className="flex gap-4"
                >
                  {/* Timeline node */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-inter font-semibold"
                      style={{ backgroundColor: trip.color }}
                    >
                      {day.day}
                    </div>
                    {dIdx < itinerary.length - 1 && <div className="w-0.5 flex-1 bg-warm-200 mt-2" />}
                  </div>
                  {/* Day card */}
                  <div className="card-planner py-4 flex-1 mb-4">
                    <h4 className="font-inter text-sm font-semibold text-warm-700 mb-1">
                      Day {day.day} — {format(parseISO(day.date), 'EEEE, MMMM d')}
                    </h4>
                    {day.activities.length === 0 ? (
                      <p className="text-warm-400 text-xs font-inter italic">No activities yet. Click + to add.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {day.activities.map((act) => (
                          <div key={act.id} className="flex items-center gap-2 text-sm">
                            <span className="font-mono text-xs text-warm-500">{act.time}</span>
                            <span className="font-inter text-warm-700">{act.description}</span>
                            {act.location && (
                              <span className="flex items-center gap-1 text-xs text-warm-400">
                                <MapPin className="w-3 h-3" />{act.location}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <AddActivityButton onAdd={(activity) => {
                      setItinerary((prev) => prev.map((d) => {
                        if (d.day !== day.day) return d
                        return { ...d, activities: [...d.activities, activity] }
                      }))
                    }} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {tab === 'packing' && (
            <motion.div
              key="packing"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Packing progress */}
              <div className="card-planner flex items-center gap-6">
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="var(--warm-200)" strokeWidth="8" />
                    <motion.circle
                      cx="60" cy="60" r="52" fill="none" stroke={trip.color}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 52}
                      strokeDashoffset={2 * Math.PI * 52 * (1 - packingPercent / 100)}
                      transition={{ duration: 0.6 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-inter font-semibold text-sm text-warm-800">{packingPercent}%</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-playfair text-lg font-medium text-warm-800">Packing Progress</h3>
                  <p className="text-warm-500 font-inter text-sm">{donePacked} of {totalPacked} items packed</p>
                  {packingPercent === 100 && donePacked > 0 && (
                    <motion.p
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-success font-inter text-sm font-medium mt-1"
                    >
                      All packed! Ready to go! ✈️
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                {packing.map((cat) => {
                  const catDone = cat.items.filter((i) => i.checked).length
                  return (
                    <div key={cat.id} className="card-planner">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-inter text-sm font-semibold text-warm-700">{cat.name}</h4>
                        <span className="text-xs text-warm-500 font-inter">{catDone}/{cat.items.length}</span>
                      </div>
                      <div className="space-y-2">
                        {cat.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => togglePackItem(cat.id, item.id)}
                            className="flex items-center gap-3 w-full text-left group"
                          >
                            <div
                              className={cn(
                                'w-[18px] h-[18px] rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200',
                                item.checked
                                  ? 'bg-rose-500 border-rose-500'
                                  : 'border-warm-300 bg-white group-hover:border-rose-300'
                              )}
                            >
                              {item.checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </div>
                            <span className={cn(
                              'text-sm font-inter flex-1',
                              item.checked ? 'text-warm-400 line-through decoration-rose-300' : 'text-warm-700'
                            )}>
                              {item.text}
                              {item.quantity ? <span className="text-warm-400 ml-1">×{item.quantity}</span> : null}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {tab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <DetailCard icon={Ticket} title="Flights" placeholder="Airline, flight numbers, times..." />
              <DetailCard icon={Bed} title="Accommodation" placeholder="Hotel name, address, confirmation..." />
              <DetailCard icon={Users} title="Emergency Contacts" placeholder="Name, phone, relationship..." />
              <DetailCard icon={Wallet} title="Budget" placeholder="Estimated costs..." />
            </motion.div>
          )}

          {tab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="card-planner">
                <h3 className="font-playfair text-lg font-medium text-warm-800 mb-4">Travel Journal</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Travel journal, restaurant recommendations, memories..."
                  className="w-full min-h-[60vh] p-4 rounded-md border border-warm-200 bg-white font-caveat text-lg text-warm-700 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 resize-none leading-8"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e8e2da 31px, #e8e2da 32px)',
                    lineHeight: '32px',
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function DetailCard({ icon: Icon, title, placeholder }: { icon: React.ElementType; title: string; placeholder: string }) {
  const [val, setVal] = useState('')
  return (
    <div className="card-planner">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-rose-500" />
        <h4 className="font-inter text-sm font-semibold text-warm-700">{title}</h4>
      </div>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[120px] p-3 rounded-md border border-warm-200 bg-white font-caveat text-base text-warm-700 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 resize-none leading-relaxed"
      />
    </div>
  )
}

function AddActivityButton({ onAdd }: { onAdd: (a: Activity) => void }) {
  const [show, setShow] = useState(false)
  const [time, setTime] = useState('')
  const [desc, setDesc] = useState('')
  const [loc, setLoc] = useState('')

  if (!show) {
    return (
      <button onClick={() => setShow(true)} className="text-xs text-rose-600 font-inter font-medium mt-2 hover:underline flex items-center gap-1">
        <Plus className="w-3 h-3" /> Add activity
      </button>
    )
  }

  const save = () => {
    if (!desc) return
    onAdd({ id: `a${Date.now()}`, time, description: desc, location: loc })
    setTime('')
    setDesc('')
    setLoc('')
    setShow(false)
  }

  return (
    <div className="mt-2 flex gap-2 items-end">
      <input
        placeholder="Time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="w-20 px-2 py-1.5 rounded border border-warm-200 text-xs font-mono focus:outline-none focus:border-rose-400"
      />
      <input
        placeholder="Activity"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="flex-1 px-2 py-1.5 rounded border border-warm-200 text-xs font-inter focus:outline-none focus:border-rose-400"
      />
      <input
        placeholder="Location"
        value={loc}
        onChange={(e) => setLoc(e.target.value)}
        className="w-28 px-2 py-1.5 rounded border border-warm-200 text-xs font-inter focus:outline-none focus:border-rose-400"
      />
      <button onClick={save} className="btn-primary text-xs px-3 py-1.5">Add</button>
      <button onClick={() => setShow(false)} className="text-warm-400 hover:text-warm-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Bucket List                                                        */
/* ------------------------------------------------------------------ */

function BucketList() {
  const [items, setItems] = useState<BucketItem[]>(loadBucket)
  const [newDest, setNewDest] = useState('')
  const [newPriority, setNewPriority] = useState(2)

  useEffect(() => { saveBucket(items) }, [items])

  const addItem = () => {
    if (!newDest.trim()) return
    setItems((prev) => [...prev, { id: `bk${Date.now()}`, destination: newDest, status: 'Not started', priority: newPriority, notes: '' }])
    setNewDest('')
    setNewPriority(2)
  }

  const cycleStatus = (id: string) => {
    const order = ['Not started', 'Planning', 'Booked', 'Visited'] as const
    setItems((prev) => prev.map((i) => {
      if (i.id !== id) return i
      const next = (order.indexOf(i.status) + 1) % order.length
      return { ...i, status: order[next] }
    }))
  }

  const deleteItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const statusColors: Record<string, string> = {
    'Not started': 'var(--warm-300)',
    'Planning': 'var(--warning)',
    'Booked': 'var(--info)',
    'Visited': 'var(--success)',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="card-planner"
    >
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-6 h-6 text-rose-500" />
        <h2 className="font-playfair text-[clamp(1.25rem,2vw,1.75rem)] font-medium text-warm-900">Travel Bucket List</h2>
      </div>
      <p className="text-warm-500 font-inter text-sm mb-4">Places to see, experiences to have.</p>

      {/* Add destination */}
      <div className="flex gap-3 mb-6 items-end">
        <div className="flex-1">
          <label className="label-text">Destination</label>
          <input
            value={newDest}
            onChange={(e) => setNewDest(e.target.value)}
            placeholder="Where do you want to go?"
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            className="w-full px-3 py-2 rounded-md border border-warm-200 bg-white text-warm-800 font-inter text-sm placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400"
          />
        </div>
        <div>
          <label className="label-text">Priority</label>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button key={p} onClick={() => setNewPriority(p)} className="p-1">
                <Star
                  className={cn('w-5 h-5 transition-colors', p <= newPriority ? 'text-warning fill-warning' : 'text-warm-300')}
                />
              </button>
            ))}
          </div>
        </div>
        <button onClick={addItem} className="btn-primary text-sm px-4 py-2">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.06 }}
              className="card-planner p-4 card-planner-hover relative group"
            >
              {/* Placeholder image area */}
              <div
                className="w-full aspect-[3/2] rounded-md mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${statusColors[item.status]}30` }}
              >
                <span className="font-playfair text-3xl font-semibold" style={{ color: statusColors[item.status] }}>
                  {item.destination.charAt(0)}
                </span>
              </div>
              <h4 className="font-inter text-sm font-medium text-warm-800 mb-1">{item.destination}</h4>
              <button
                onClick={() => cycleStatus(item.id)}
                className="text-xs font-inter font-medium px-2.5 py-1 rounded-full text-white mb-2 transition-colors"
                style={{ backgroundColor: statusColors[item.status] }}
              >
                {item.status}
              </button>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3].map((p) => (
                  <Star
                    key={p}
                    className={cn('w-3.5 h-3.5', p <= item.priority ? 'text-warning fill-warning' : 'text-warm-200')}
                  />
                ))}
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="absolute top-3 right-3 p-1 rounded-md bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity text-warm-400 hover:text-error"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
