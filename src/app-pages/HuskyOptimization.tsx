import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dog,
  Heart,
  Activity,
  Stethoscope,
  Pill,
  Syringe,
  Camera,
  Plus,
  X,
  CheckSquare,
  Square,
  Footprints,
  Droplets,
  Scissors,
  Brain,
  Thermometer,
  Phone,
  User,
  Weight,
  Sparkles,
  Fence,
  Shovel,
  Wind,
  Trophy,
  Edit2,
  Save,
  Trash2,
  PawPrint,
} from 'lucide-react'

/* ─── Types ─── */
interface HuskyProfile {
  name: string
  age: string
  weight: string
  birthday: string
  vetName: string
  vetPhone: string
  lastVetVisit: string
}

interface Walk {
  id: string
  timeOfDay: 'morning' | 'evening'
  duration: string
  completed: boolean
}

interface Feeding {
  id: string
  meal: string
  portion: string
  notes: string
}

interface GroomingLog {
  brush: string
  nails: string
  bath: string
}

interface TrainingSession {
  id: string
  command: string
  duration: string
  date: string
}

interface WeightEntry {
  id: string
  weight: string
  date: string
}

interface Medication {
  id: string
  name: string
  dose: string
  time: string
  taken: boolean
}

interface Vaccination {
  id: string
  name: string
  date: string
  dueDate: string
}

interface PhotoEntry {
  id: string
  caption: string
  color: string
}


/* ─── Constants ─── */
const STORAGE_KEYS = {
  profile: 'husky-profile',
  walks: 'husky-walks',
  feedings: 'husky-feedings',
  water: 'husky-water',
  grooming: 'husky-grooming',
  training: 'husky-training',
  weights: 'husky-weights',
  medications: 'husky-medications',
  vaccinations: 'husky-vaccinations',
  photos: 'husky-photos',
  exercise: 'husky-exercise',
  cooldown: 'husky-cooldown',
  mental: 'husky-mental',
  coat: 'husky-coat',
  proofing: 'husky-proofing',
}

const DEFAULT_PROFILE: HuskyProfile = {
  name: '',
  age: '',
  weight: '',
  birthday: '',
  vetName: '',
  vetPhone: '',
  lastVetVisit: '',
}

const DEFAULT_GROOMING: GroomingLog = {
  brush: '',
  nails: '',
  bath: '',
}

const COAT_SCHEDULE = [
  { id: '1', task: 'Daily brushing (during coat blow)', period: 'Blowing Coat Season', done: false },
  { id: '2', task: 'Weekly brushing (normal)', period: 'Regular Season', done: false },
  { id: '3', task: 'Deshedding treatment', period: 'Spring & Fall', done: false },
  { id: '4', task: 'Check for mats behind ears', period: 'Weekly', done: false },
  { id: '5', task: 'Paw pad inspection', period: 'Weekly', done: false },
]

const PROOFING_LIST = [
  { id: '1', task: 'Fence height check (6ft+ recommended)', done: false },
  { id: '2', task: 'Fence perimeter inspection', period: 'Monthly', done: false },
  { id: '3', task: 'Gate latch security', done: false },
  { id: '4', task: 'Dig spots identified & managed', done: false },
  { id: '5', task: 'Escape route audit', done: false },
  { id: '6', task: 'Microchip info up to date', done: false },
]

const COOLDOWN_LIST = [
  { id: '1', task: 'Early morning walk (before 10am)', done: false },
  { id: '2', task: 'Evening walk (after 6pm)', done: false },
  { id: '3', task: 'Access to shade & water outdoors', done: false },
  { id: '4', task: 'Cooling mat or tile access', done: false },
  { id: '5', task: 'Never leave in car', done: false },
  { id: '6', task: 'Watch for overheating signs', done: false },
]

const MENTAL_ACTIVITIES = [
  { id: '1', task: 'Puzzle feeder / Kong toy', done: false },
  { id: '2', task: 'Training session (10-15 min)', done: false },
  { id: '3', task: 'Socialization (dog park / playdate)', done: false },
  { id: '4', task: 'Scent work / hide treats', done: false },
  { id: '5', task: 'New trick or command practice', done: false },
  { id: '6', task: 'Tug-of-war or fetch', done: false },
]

const PHOTO_COLORS = ['bg-rose-300', 'bg-sky-300', 'bg-amber-300', 'bg-emerald-300', 'bg-violet-300', 'bg-teal-300']

/* ─── Storage Helpers ─── */
function load<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback } catch { return fallback }
}
function save<T>(key: string, v: T) { localStorage.setItem(key, JSON.stringify(v)) }

/* ─── Section Card Wrapper ─── */
function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`card-planner ${className}`}
    >
      {children}
    </motion.div>
  )
}

/* ─── Main Page ─── */
export default function HuskyOptimization() {
  /* Profile */
  const [profile, setProfile] = useState<HuskyProfile>(() => load(STORAGE_KEYS.profile, DEFAULT_PROFILE))
  const [editingProfile, setEditingProfile] = useState(false)
  const [editProfile, setEditProfile] = useState<HuskyProfile>(profile)

  /* Daily Care */
  const [walks, setWalks] = useState<Walk[]>(() => load(STORAGE_KEYS.walks, [
    { id: '1', timeOfDay: 'morning', duration: '60', completed: false },
    { id: '2', timeOfDay: 'evening', duration: '60', completed: false },
  ]))
  const [feedings, setFeedings] = useState<Feeding[]>(() => load(STORAGE_KEYS.feedings, [
    { id: '1', meal: 'Breakfast', portion: '2 cups', notes: '' },
    { id: '2', meal: 'Dinner', portion: '2 cups', notes: '' },
  ]))
  const [waterIntake, setWaterIntake] = useState(() => load(STORAGE_KEYS.water, 0))
  const [grooming, setGrooming] = useState<GroomingLog>(() => load(STORAGE_KEYS.grooming, DEFAULT_GROOMING))
  const [training, setTraining] = useState<TrainingSession[]>(() => load(STORAGE_KEYS.training, []))

  /* Health */
  const [weights, setWeights] = useState<WeightEntry[]>(() => load(STORAGE_KEYS.weights, []))
  const [medications, setMedications] = useState<Medication[]>(() => load(STORAGE_KEYS.medications, []))
  const [vaccinations, setVaccinations] = useState<Vaccination[]>(() => load(STORAGE_KEYS.vaccinations, [
    { id: '1', name: 'Rabies', date: '', dueDate: '' },
    { id: '2', name: 'DHPP', date: '', dueDate: '' },
    { id: '3', name: 'Bordetella', date: '', dueDate: '' },
  ]))

  const [exerciseLog] = useState<Record<string, boolean>>(() => load(STORAGE_KEYS.exercise, {}))

  /* Husky Specific */
  const [todayExercise, setTodayExercise] = useState(() => load('husky-today-exercise', 0))
  const [cooldown, setCooldown] = useState(() => load(STORAGE_KEYS.cooldown, COOLDOWN_LIST.map(c => ({ ...c }))))
  const [mental, setMental] = useState(() => load(STORAGE_KEYS.mental, MENTAL_ACTIVITIES.map(m => ({ ...m }))))
  const [coat, setCoat] = useState(() => load(STORAGE_KEYS.coat, COAT_SCHEDULE.map(c => ({ ...c }))))
  const [proofing, setProofing] = useState(() => load(STORAGE_KEYS.proofing, PROOFING_LIST.map(p => ({ ...p }))))

  /* Photos */
  const [photos, setPhotos] = useState<PhotoEntry[]>(() => load(STORAGE_KEYS.photos, [
    { id: '1', caption: 'My majestic husky', color: 'bg-rose-300' },
    { id: '2', caption: 'Snow day adventure', color: 'bg-sky-300' },
    { id: '3', caption: 'After a long walk', color: 'bg-amber-300' },
    { id: '4', caption: 'Best friends forever', color: 'bg-emerald-300' },
  ]))
  const [newCaption, setNewCaption] = useState('')

  /* Temp inputs */
  const [newTraining, setNewTraining] = useState({ command: '', duration: '' })
  const [newWeight, setNewWeight] = useState('')
  const [newMed, setNewMed] = useState({ name: '', dose: '', time: '' })

  /* Persistence */
  useEffect(() => save(STORAGE_KEYS.profile, profile), [profile])
  useEffect(() => save(STORAGE_KEYS.walks, walks), [walks])
  useEffect(() => save(STORAGE_KEYS.feedings, feedings), [feedings])
  useEffect(() => save(STORAGE_KEYS.water, waterIntake), [waterIntake])
  useEffect(() => save(STORAGE_KEYS.grooming, grooming), [grooming])
  useEffect(() => save(STORAGE_KEYS.training, training), [training])
  useEffect(() => save(STORAGE_KEYS.weights, weights), [weights])
  useEffect(() => save(STORAGE_KEYS.medications, medications), [medications])
  useEffect(() => save(STORAGE_KEYS.vaccinations, vaccinations), [vaccinations])
  useEffect(() => save(STORAGE_KEYS.exercise, exerciseLog), [exerciseLog])
  useEffect(() => save('husky-today-exercise', todayExercise), [todayExercise])
  useEffect(() => save(STORAGE_KEYS.cooldown, cooldown), [cooldown])
  useEffect(() => save(STORAGE_KEYS.mental, mental), [mental])
  useEffect(() => save(STORAGE_KEYS.coat, coat), [coat])
  useEffect(() => save(STORAGE_KEYS.proofing, proofing), [proofing])
  useEffect(() => save(STORAGE_KEYS.photos, photos), [photos])

  /* Derived */
  const birthdayCountdown = (() => {
    if (!profile.birthday) return null
    const now = new Date()
    const bday = new Date(profile.birthday)
    const nextBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate())
    if (nextBday < now) nextBday.setFullYear(nextBday.getFullYear() + 1)
    const days = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return days
  })()

  const targetWeight = 50
  const currentWeightNum = parseFloat(weights[weights.length - 1]?.weight || profile.weight || '0')

  /* Handlers */
  const toggleWalk = (id: string) => setWalks(prev => prev.map(w => w.id === id ? { ...w, completed: !w.completed } : w))
  const addTraining = () => {
    if (!newTraining.command.trim()) return
    setTraining(prev => [...prev, { id: Date.now().toString(), command: newTraining.command, duration: newTraining.duration || '10', date: new Date().toISOString().split('T')[0] }])
    setNewTraining({ command: '', duration: '' })
  }
  const addWeight = () => {
    if (!newWeight.trim()) return
    setWeights(prev => [...prev, { id: Date.now().toString(), weight: newWeight, date: new Date().toISOString().split('T')[0] }])
    setNewWeight('')
  }
  const addMed = () => {
    if (!newMed.name.trim()) return
    setMedications(prev => [...prev, { id: Date.now().toString(), ...newMed, taken: false }])
    setNewMed({ name: '', dose: '', time: '' })
  }
  const toggleMed = (id: string) => setMedications(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m))
  const addPhoto = () => {
    if (!newCaption.trim()) return
    setPhotos(prev => [...prev, { id: Date.now().toString(), caption: newCaption, color: PHOTO_COLORS[prev.length % PHOTO_COLORS.length] }])
    setNewCaption('')
  }

  const toggleList = (_list: any[], setter: any, id: string) => setter((prev: any[]) => prev.map((item: any) => item.id === id ? { ...item, done: !item.done } : item))

  /* ─── Render ─── */
  return (
    <div className="space-y-8 pb-12">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-lg h-64 flex items-end"
        style={{ background: 'linear-gradient(135deg, #e8f4f8 0%, #d0e8f0 40%, #e8e2da 100%)' }}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 70% 30%, #7a8e9e 0%, transparent 50%), radial-gradient(circle at 30% 70%, #5a7a6a 0%, transparent 40%)',
        }} />
        <div className="relative z-10 p-8 w-full">
          <div className="flex items-center gap-3 mb-2">
            <Dog className="w-6 h-6 text-sky-600" />
            <span className="text-sm font-inter font-medium text-sky-600 uppercase tracking-widest">Care Planner</span>
          </div>
          <h1 className="font-playfair text-4xl font-semibold text-warm-900 mb-1">Husky Optimization Center</h1>
          <p className="font-caveat text-xl text-warm-600">Everything for your best friend's best life</p>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile Card */}
        <SectionCard className="xl:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center">
              <PawPrint className="w-8 h-8 text-sky-600" />
            </div>
            <div>
              <h2 className="text-xl font-playfair font-semibold text-warm-800">Husky Profile</h2>
              <p className="text-sm text-warm-500 font-inter">Your companion's details</p>
            </div>
          </div>

          {editingProfile ? (
            <div className="space-y-3">
              {(['name', 'age', 'weight', 'birthday', 'vetName', 'vetPhone', 'lastVetVisit'] as const).map((field) => (
                <div key={field}>
                  <label className="text-xs font-inter text-warm-500 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    type={field === 'birthday' || field === 'lastVetVisit' ? 'date' : 'text'}
                    value={editProfile[field]}
                    onChange={(e) => setEditProfile(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full text-sm bg-warm-50 border border-warm-200 rounded px-3 py-1.5 outline-none focus:border-sky-300 font-inter"
                  />
                </div>
              ))}
              <button
                onClick={() => { setProfile(editProfile); setEditingProfile(false) }}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Profile
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-warm-50 rounded-md p-3">
                  <p className="text-xs text-warm-400 font-inter">Name</p>
                  <p className="text-sm font-semibold text-warm-800 font-inter">{profile.name || '—'}</p>
                </div>
                <div className="bg-warm-50 rounded-md p-3">
                  <p className="text-xs text-warm-400 font-inter">Age</p>
                  <p className="text-sm font-semibold text-warm-800 font-inter">{profile.age || '—'}</p>
                </div>
                <div className="bg-warm-50 rounded-md p-3">
                  <p className="text-xs text-warm-400 font-inter">Weight</p>
                  <p className="text-sm font-semibold text-warm-800 font-inter">{profile.weight ? `${profile.weight} lbs` : '—'}</p>
                </div>
                <div className="bg-warm-50 rounded-md p-3">
                  <p className="text-xs text-warm-400 font-inter">Birthday</p>
                  <p className="text-sm font-semibold text-warm-800 font-inter">{profile.birthday || '—'}</p>
                </div>
              </div>
              {birthdayCountdown !== null && (
                <div className="bg-sky-50 border border-sky-200 rounded-md p-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <span className="text-sm font-inter text-sky-700">
                    <span className="font-semibold">{birthdayCountdown}</span> days until birthday!
                  </span>
                </div>
              )}
              <div className="border-t border-warm-200 pt-3 mt-3">
                <p className="text-xs font-inter text-warm-400 mb-2 flex items-center gap-1"><Stethoscope className="w-3 h-3" /> Vet Info</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-inter text-warm-700"><User className="w-3 h-3 inline mr-1" />{profile.vetName || '—'}</div>
                  <div className="text-sm font-inter text-warm-700"><Phone className="w-3 h-3 inline mr-1" />{profile.vetPhone || '—'}</div>
                </div>
                {profile.lastVetVisit && (
                  <p className="text-xs text-warm-500 mt-1 font-inter">Last visit: {profile.lastVetVisit}</p>
                )}
              </div>
              <button onClick={() => { setEditProfile(profile); setEditingProfile(true) }} className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1 font-inter">
                <Edit2 className="w-3 h-3" /> Edit Profile
              </button>
            </div>
          )}
        </SectionCard>

        {/* Daily Care Tracker */}
        <SectionCard className="xl:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-sky-600" />
            <h2 className="text-xl font-playfair font-semibold text-warm-800">Daily Care Tracker</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Walks */}
            <div>
              <h3 className="text-sm font-inter font-semibold text-warm-600 mb-3 flex items-center gap-2">
                <Footprints className="w-4 h-4" /> Walks
              </h3>
              <div className="space-y-2">
                {walks.map((walk) => (
                  <div key={walk.id} className="flex items-center gap-3 p-2 rounded-md bg-warm-50">
                    <button onClick={() => toggleWalk(walk.id)}>
                      {walk.completed ? <CheckSquare className="w-5 h-5 text-success" /> : <Square className="w-5 h-5 text-warm-400" />}
                    </button>
                    <span className={`flex-1 text-sm font-inter capitalize ${walk.completed ? 'line-through text-warm-400' : 'text-warm-700'}`}>
                      {walk.timeOfDay} Walk
                    </span>
                    <input
                      type="number"
                      value={walk.duration}
                      onChange={(e) => setWalks(prev => prev.map(w => w.id === walk.id ? { ...w, duration: e.target.value } : w))}
                      className="w-14 text-sm bg-white border border-warm-200 rounded px-2 py-1 text-center font-inter"
                    />
                    <span className="text-xs text-warm-500 font-inter">min</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feeding */}
            <div>
              <h3 className="text-sm font-inter font-semibold text-warm-600 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4" /> Feeding
              </h3>
              <div className="space-y-2">
                {feedings.map((feed) => (
                  <div key={feed.id} className="p-2 rounded-md bg-warm-50 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold font-inter text-warm-700 w-20">{feed.meal}</span>
                      <input
                        value={feed.portion}
                        onChange={(e) => setFeedings(prev => prev.map(f => f.id === feed.id ? { ...f, portion: e.target.value } : f))}
                        className="flex-1 text-sm bg-white border border-warm-200 rounded px-2 py-1 font-inter"
                      />
                    </div>
                    <input
                      placeholder="Notes..."
                      value={feed.notes}
                      onChange={(e) => setFeedings(prev => prev.map(f => f.id === feed.id ? { ...f, notes: e.target.value } : f))}
                      className="w-full text-xs bg-transparent border-b border-warm-200 outline-none focus:border-sky-300 font-caveat text-base"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Water Intake */}
          <div className="mt-4 pt-4 border-t border-warm-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-inter font-semibold text-warm-600 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-500" /> Water Intake Today
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))} className="w-7 h-7 rounded-full bg-warm-100 text-warm-600 hover:bg-warm-200 flex items-center justify-center text-sm">-</button>
                <span className="text-lg font-semibold font-inter text-warm-800 w-12 text-center">{waterIntake}</span>
                <button onClick={() => setWaterIntake(waterIntake + 1)} className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 flex items-center justify-center text-sm">+</button>
                <span className="text-xs text-warm-500 font-inter">bowls</span>
              </div>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`flex-1 h-3 rounded-full ${i < waterIntake ? 'bg-sky-400' : 'bg-warm-100'}`} />
              ))}
            </div>
          </div>

          {/* Grooming Log */}
          <div className="mt-4 pt-4 border-t border-warm-200">
            <h3 className="text-sm font-inter font-semibold text-warm-600 mb-3 flex items-center gap-2">
              <Scissors className="w-4 h-4" /> Grooming Log <span className="text-xs font-normal text-warm-400">(last done date)</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['brush', 'nails', 'bath'] as const).map((type) => (
                <div key={type} className="bg-warm-50 rounded-md p-3">
                  <p className="text-xs text-warm-400 font-inter capitalize mb-1">{type}</p>
                  <input
                    type="date"
                    value={grooming[type]}
                    onChange={(e) => setGrooming(prev => ({ ...prev, [type]: e.target.value }))}
                    className="w-full text-sm bg-white border border-warm-200 rounded px-2 py-1 font-inter"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Training */}
          <div className="mt-4 pt-4 border-t border-warm-200">
            <h3 className="text-sm font-inter font-semibold text-warm-600 mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" /> Training Sessions
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                placeholder="Command practiced..."
                value={newTraining.command}
                onChange={(e) => setNewTraining(p => ({ ...p, command: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addTraining()}
                className="flex-1 text-sm bg-warm-50 border border-warm-200 rounded px-3 py-1.5 outline-none focus:border-sky-300 font-inter"
              />
              <input
                placeholder="Min"
                value={newTraining.duration}
                onChange={(e) => setNewTraining(p => ({ ...p, duration: e.target.value }))}
                className="w-16 text-sm bg-warm-50 border border-warm-200 rounded px-3 py-1.5 outline-none focus:border-sky-300 font-inter"
              />
              <button onClick={addTraining} className="btn-primary px-3">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              <AnimatePresence>
                {training.map((t) => (
                  <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center justify-between text-sm py-1 font-inter">
                    <span className="text-warm-700">{t.command}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-warm-400 text-xs">{t.duration} min</span>
                      <span className="text-warm-400 text-xs">{t.date}</span>
                      <button onClick={() => setTraining(prev => prev.filter(x => x.id !== t.id))} className="text-warm-400 hover:text-rose-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Health & Wellness */}
      <SectionCard>
        <div className="flex items-center gap-3 mb-4">
          <Stethoscope className="w-5 h-5 text-rose-500" />
          <h2 className="text-xl font-playfair font-semibold text-warm-800">Health & Wellness</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weight Chart */}
          <div>
            <h3 className="text-sm font-inter font-semibold text-warm-600 mb-3 flex items-center gap-2">
              <Weight className="w-4 h-4" /> Weight Tracking
            </h3>
            {/* Visual bar chart */}
            <div className="flex items-end gap-1 h-32 mb-3">
              {weights.slice(-10).map((w, _i) => {
                const val = parseFloat(w.weight) || 0
                const h = val ? Math.min(100, (val / (targetWeight * 1.5)) * 100) : 0
                return (
                  <div key={w.id} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-rose-100 rounded-t-sm relative" style={{ height: `${h}%` }}>
                      <div className="absolute inset-x-0 bottom-0 bg-rose-400 rounded-t-sm transition-all" style={{ height: '100%' }} />
                    </div>
                    <span className="text-[0.5rem] text-warm-500 font-inter">{w.date.slice(5)}</span>
                  </div>
                )
              })}
              {weights.length === 0 && (
                <div className="flex-1 flex items-center justify-center h-full bg-warm-50 rounded-md">
                  <p className="text-xs text-warm-400 font-inter">No entries yet</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Weight (lbs)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addWeight()}
                className="flex-1 text-sm bg-warm-50 border border-warm-200 rounded px-3 py-1.5 font-inter"
              />
              <button onClick={addWeight} className="btn-primary px-3"><Plus className="w-4 h-4" /></button>
            </div>
            {currentWeightNum > 0 && (
              <p className="text-xs text-warm-500 mt-2 font-inter">
                Current: <span className="font-semibold">{currentWeightNum} lbs</span>
                {targetWeight && <span> (Target: {targetWeight} lbs)</span>}
              </p>
            )}
          </div>

          {/* Medications */}
          <div>
            <h3 className="text-sm font-inter font-semibold text-warm-600 mb-3 flex items-center gap-2">
              <Pill className="w-4 h-4" /> Medications
            </h3>
            <div className="flex gap-2 mb-3">
              <input placeholder="Name" value={newMed.name} onChange={(e) => setNewMed(p => ({ ...p, name: e.target.value }))} className="flex-1 text-xs bg-warm-50 border border-warm-200 rounded px-2 py-1 font-inter" />
              <input placeholder="Dose" value={newMed.dose} onChange={(e) => setNewMed(p => ({ ...p, dose: e.target.value }))} className="w-16 text-xs bg-warm-50 border border-warm-200 rounded px-2 py-1 font-inter" />
              <input placeholder="Time" value={newMed.time} onChange={(e) => setNewMed(p => ({ ...p, time: e.target.value }))} className="w-16 text-xs bg-warm-50 border border-warm-200 rounded px-2 py-1 font-inter" />
              <button onClick={addMed} className="btn-primary px-2 py-1"><Plus className="w-3 h-3" /></button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {medications.map((med) => (
                <div key={med.id} className="flex items-center gap-2 p-2 rounded-md bg-warm-50">
                  <button onClick={() => toggleMed(med.id)}>
                    {med.taken ? <CheckSquare className="w-4 h-4 text-success" /> : <Square className="w-4 h-4 text-warm-400" />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-inter ${med.taken ? 'line-through text-warm-400' : 'text-warm-700'}`}>{med.name}</p>
                    <p className="text-[0.6875rem] text-warm-400 font-inter">{med.dose} · {med.time}</p>
                  </div>
                  <button onClick={() => setMedications(prev => prev.filter(m => m.id !== med.id))} className="text-warm-400 hover:text-rose-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Vaccinations */}
          <div>
            <h3 className="text-sm font-inter font-semibold text-warm-600 mb-3 flex items-center gap-2">
              <Syringe className="w-4 h-4" /> Vaccination Record
            </h3>
            <div className="space-y-3">
              {vaccinations.map((vax) => (
                <div key={vax.id} className="p-3 rounded-md bg-warm-50 space-y-2">
                  <p className="text-sm font-semibold font-inter text-warm-700">{vax.name}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[0.625rem] text-warm-400 font-inter">Given</p>
                      <input type="date" value={vax.date} onChange={(e) => setVaccinations(prev => prev.map(v => v.id === vax.id ? { ...v, date: e.target.value } : v))} className="w-full text-xs bg-white border border-warm-200 rounded px-2 py-1 font-inter" />
                    </div>
                    <div>
                      <p className="text-[0.625rem] text-warm-400 font-inter">Due</p>
                      <input type="date" value={vax.dueDate} onChange={(e) => setVaccinations(prev => prev.map(v => v.id === vax.id ? { ...v, dueDate: e.target.value } : v))} className="w-full text-xs bg-white border border-warm-200 rounded px-2 py-1 font-inter" />
                    </div>
                  </div>
                  {vax.dueDate && (() => {
                    const days = Math.ceil((new Date(vax.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    if (days < 0) return <p className="text-[0.625rem] text-rose-500 font-inter">Overdue by {Math.abs(days)} days</p>
                    if (days < 30) return <p className="text-[0.625rem] text-warning font-inter">Due in {days} days</p>
                    return <p className="text-[0.625rem] text-success font-inter">Up to date</p>
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Husky Specific Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exercise Tracker */}
        <SectionCard>
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-playfair font-semibold text-warm-800">Exercise Tracker</h2>
            <span className="text-xs text-warm-400 font-inter ml-auto">Goal: 120+ min/day</span>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-inter text-warm-600">Today&apos;s Exercise</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setTodayExercise(Math.max(0, todayExercise - 15))} className="w-7 h-7 rounded-full bg-warm-100 text-warm-600 hover:bg-warm-200 flex items-center justify-center">-</button>
                <span className="text-lg font-semibold font-inter text-warm-800 w-14 text-center">{todayExercise}</span>
                <button onClick={() => setTodayExercise(todayExercise + 15)} className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 flex items-center justify-center">+</button>
                <span className="text-xs text-warm-500 font-inter">min</span>
              </div>
            </div>
            <div className="h-4 bg-warm-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: todayExercise >= 120 ? '#7a9e7a' : todayExercise >= 60 ? '#d4a76a' : '#e85d78' }}
                animate={{ width: `${Math.min(100, (todayExercise / 120) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-warm-500 mt-1 font-inter">
              {todayExercise >= 120 ? 'Goal met! Great job!' : `${120 - todayExercise} more minutes to reach goal`}
            </p>
          </div>
          <p className="text-xs text-warm-400 font-inter">Huskies need 2+ hours of exercise daily. Mix walks, runs, and play sessions.</p>
        </SectionCard>

        {/* Cool-Down Checklist */}
        <SectionCard>
          <div className="flex items-center gap-3 mb-4">
            <Thermometer className="w-5 h-5 text-sky-500" />
            <h2 className="text-xl font-playfair font-semibold text-warm-800">Hot Weather Cool-Down</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cooldown.map((item: any) => (
              <button key={item.id} onClick={() => toggleList(cooldown, setCooldown, item.id)}
                className={`flex items-center gap-2 p-2 rounded-md border text-left transition-all ${item.done ? 'bg-sky-50 border-sky-200' : 'bg-white border-warm-200 hover:border-warm-300'}`}>
                {item.done ? <CheckSquare className="w-4 h-4 text-sky-500 shrink-0" /> : <Square className="w-4 h-4 text-warm-400 shrink-0" />}
                <span className={`text-sm font-inter ${item.done ? 'text-sky-700 line-through' : 'text-warm-700'}`}>{item.task}</span>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Mental Stimulation */}
        <SectionCard>
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-5 h-5 text-violet-500" />
            <h2 className="text-xl font-playfair font-semibold text-warm-800">Mental Stimulation</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mental.map((item: any) => (
              <button key={item.id} onClick={() => toggleList(mental, setMental, item.id)}
                className={`flex items-center gap-2 p-2 rounded-md border text-left transition-all ${item.done ? 'bg-violet-50 border-violet-200' : 'bg-white border-warm-200 hover:border-warm-300'}`}>
                {item.done ? <CheckSquare className="w-4 h-4 text-violet-500 shrink-0" /> : <Square className="w-4 h-4 text-warm-400 shrink-0" />}
                <span className={`text-sm font-inter ${item.done ? 'text-violet-700 line-through' : 'text-warm-700'}`}>{item.task}</span>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Coat Care */}
        <SectionCard>
          <div className="flex items-center gap-3 mb-4">
            <Wind className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-playfair font-semibold text-warm-800">Coat Care Schedule</h2>
          </div>
          <p className="text-xs text-warm-500 font-inter mb-3">Huskies &quot;blow coat&quot; twice yearly. Be prepared for lots of fur!</p>
          <div className="space-y-2">
            {coat.map((item: any) => (
              <button key={item.id} onClick={() => toggleList(coat, setCoat, item.id)}
                className={`flex items-center gap-2 p-2 rounded-md border text-left transition-all w-full ${item.done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-warm-200 hover:border-warm-300'}`}>
                {item.done ? <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" /> : <Square className="w-4 h-4 text-warm-400 shrink-0" />}
                <div>
                  <span className={`text-sm font-inter block ${item.done ? 'text-emerald-700 line-through' : 'text-warm-700'}`}>{item.task}</span>
                  <span className="text-[0.625rem] text-warm-400 font-inter">{item.period}</span>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Husky-Proofing */}
        <SectionCard className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Fence className="w-5 h-5 text-warm-600" />
            <h2 className="text-xl font-playfair font-semibold text-warm-800">Husky-Proofing Checklist</h2>
            <Shovel className="w-4 h-4 text-warm-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {proofing.map((item: any) => (
              <button key={item.id} onClick={() => toggleList(proofing, setProofing, item.id)}
                className={`flex items-center gap-2 p-3 rounded-md border text-left transition-all ${item.done ? 'bg-warm-50 border-warm-300' : 'bg-white border-warm-200 hover:border-warm-300'}`}>
                {item.done ? <CheckSquare className="w-4 h-4 text-warm-600 shrink-0" /> : <Square className="w-4 h-4 text-warm-400 shrink-0" />}
                <span className={`text-sm font-inter ${item.done ? 'text-warm-700 line-through' : 'text-warm-700'}`}>{item.task}</span>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Photo Gallery */}
      <SectionCard>
        <div className="flex items-center gap-3 mb-4">
          <Camera className="w-5 h-5 text-rose-500" />
          <h2 className="text-xl font-playfair font-semibold text-warm-800">Husky Photo Gallery</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence>
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <div className={`aspect-square rounded-lg ${photo.color} flex items-center justify-center relative overflow-hidden`}>
                  <PawPrint className="w-10 h-10 text-white/60" />
                  <button onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))} className="absolute top-2 right-2 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-warm-600 mt-1 font-inter text-center font-caveat text-base">{photo.caption}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {/* Add photo */}
          <div className="aspect-square rounded-lg border-2 border-dashed border-warm-300 flex flex-col items-center justify-center gap-2 hover:border-rose-300 transition-colors">
            <input
              placeholder="Caption..."
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPhoto()}
              className="w-3/4 text-xs text-center bg-transparent border-b border-warm-200 outline-none focus:border-rose-300 font-caveat text-base"
            />
            <button onClick={addPhoto} className="text-rose-500 hover:text-rose-600">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
