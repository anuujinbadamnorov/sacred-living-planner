import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Apple,
  Droplets,
  Clock,
  Heart,
  CheckCircle2,
  Circle,
  Utensils,
  ShoppingCart,
  ChefHat,
  Leaf,
  Moon,
  Sun,
  Sunrise,
  Coffee,
  Pill,
  AlertTriangle,
  Plus,
  X,
  Save,
  TrendingUp,
  Sparkles,
  CupSoda,
  ArrowRight,
  Beef,
  Fish,
  Egg,
  Wheat,
  Carrot,
  Cherry,
  Target,
  ThermometerSun,
  Flame,

} from 'lucide-react'
import Layout from '@/components/Layout'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

// ─── Colors ───
const SAGE = '#7a8b65'
const TERRACOTTA = '#e0744c'
const CREAM = '#faf7f2'
const GOLD = '#c9a96e'

// ─── Types ───
interface WaterEntry {
  id: string
  timestamp: string
  glasses: number
}

interface NutritionLog {
  id: string
  date: string
  protein: number
  carbs: number
  fats: number
  fiber: number
  calories: number
}

interface GutChecklist {
  [key: string]: boolean
}

// ─── Data ───
const nutritionTargets = [
  { label: 'Protein', min: 140, max: 160, unit: 'g', color: SAGE, icon: Beef },
  { label: 'Fiber', min: 35, max: 40, unit: 'g', color: '#7a8b9e', icon: Leaf },
  { label: 'Carbs', min: 180, max: 220, unit: 'g', color: GOLD, icon: Wheat },
  { label: 'Fats', min: 55, max: 70, unit: 'g', color: TERRACOTTA, icon: Droplets },
  { label: 'Calories', min: 1800, max: 2000, unit: '', color: '#b8a896', icon: Flame },
]

const mealTiming = [
  {
    time: '7:30 AM',
    label: 'Wake + Hydrate',
    detail: '16oz water first thing',
    icon: Sunrise,
    critical: false,
    color: '#d4a76a',
  },
  {
    time: '8:00 AM',
    label: 'BREAKFAST',
    detail: '25-30g protein — CRITICAL before meds!',
    icon: Egg,
    critical: true,
    color: SAGE,
  },
  {
    time: '12:30 PM',
    label: 'LUNCH',
    detail: '35-45g protein — big meal when appetite returns',
    icon: Sun,
    critical: false,
    color: GOLD,
  },
  {
    time: '3:00 PM',
    label: 'Pre-Training Snack',
    detail: '15-20g protein',
    icon: Coffee,
    critical: false,
    color: '#7a8b9e',
  },
  {
    time: '6:30 PM',
    label: 'DINNER',
    detail: '40-50g protein — recovery meal',
    icon: Moon,
    critical: false,
    color: TERRACOTTA,
  },
  {
    time: '8:00 PM',
    label: 'Last Caffeine Cutoff',
    detail: 'No more caffeine for quality sleep',
    icon: CupSoda,
    critical: false,
    color: '#b8a896',
  },
]

const breakfastOptions = [
  'Greek yogurt + berries + hemp seeds',
  'Protein smoothie (oat milk + protein + banana + spinach)',
  '3-egg scramble with spinach + sourdough + avocado',
  'Overnight oats + hard-boiled eggs',
]

const gutChecklistItems = [
  { id: 'fermented', label: 'Fermented food (sauerkraut, kimchi, yogurt, kefir)' },
  { id: 'prebiotic', label: 'Prebiotic fiber (oats, onions, garlic, bananas, legumes)' },
  { id: 'fiber', label: '30-40g total fiber' },
  { id: 'probiotic', label: 'Probiotic supplement with breakfast' },
  { id: 'tea', label: 'Ginger or peppermint tea after dinner' },
  { id: 'chew', label: 'Chew thoroughly, eat slowly' },
  { id: 'water', label: '2.5-3L water' },
]

const antiBloatingEatMore = ['Cucumber', 'Ginger', 'Papaya', 'Fennel', 'Pineapple', 'Yogurt']
const antiBloatingEatLess = [
  'Carbonated drinks',
  'Sugar alcohols',
  'Large raw salads',
  'Eating too fast',
  'Large meals',
]

const cyclePhases = [
  {
    name: 'Menstrual',
    days: 'Days 1-5',
    icon: Droplets,
    color: '#c47272',
    nutrition: [
      'Increase iron: grass-fed beef, lentils, spinach, pumpkin seeds',
      'Vitamin C with iron meals: citrus, bell peppers',
      'Omega-3 for inflammation: salmon, walnuts',
      'Magnesium for cramps: dark chocolate, almonds, avocado',
      'Warm, comforting foods: soups, stews, herbal teas',
      'Allow extra calories if needed',
    ],
  },
  {
    name: 'Follicular',
    days: 'Days 6-14',
    icon: Sunrise,
    color: '#7a9e7a',
    nutrition: [
      'Higher carbs (40-45%) — best insulin sensitivity',
      'Lean protein for muscle building: chicken, turkey, fish, Greek yogurt',
      'Complex carbs: quinoa, sweet potato, oats',
      'Cruciferous veggies: broccoli, cauliflower, Brussels sprouts',
      'Fresh, light foods',
    ],
  },
  {
    name: 'Ovulatory',
    days: 'Days 15-17',
    icon: ThermometerSun,
    color: '#d4a76a',
    nutrition: [
      'Moderate-high carbs (35-40%)',
      'Liver support: beets, dandelion greens, artichoke',
      'Antioxidants: berries, green tea, colorful vegetables',
      'Healthy fats for hormone synthesis: avocado, olive oil, nuts',
    ],
  },
  {
    name: 'Luteal',
    days: 'Days 18-32',
    icon: Moon,
    color: '#7a8e9e',
    nutrition: [
      'Protein: 1.6-1.8g/kg bodyweight (satiety, blood sugar)',
      'Complex carbs (30-35%) for serotonin',
      'Higher fats (30-35%) to support progesterone',
    ],
    critical: [
      { title: 'BLOATING REDUCTION', items: ['Sodium <2300mg', 'Increase potassium (bananas, sweet potato, spinach)', 'Water 2.5-3L', 'Digestive enzymes', 'Avoid carbonation'] },
      { title: 'SEROTONIN SUPPORT', items: ['Complex carbs evening', 'Turkey/chicken, salmon, eggs', 'Dark chocolate 70%+', 'Pumpkin seeds'] },
      { title: 'BLOOD SUGAR', items: ['Eat within 1 hour of waking', 'Protein+fat at every meal', 'No naked carbs', '3 meals + 1-2 snacks'] },
      { title: 'CRAVING MANAGEMENT', items: ['Sweet → dark chocolate + berries', 'Salty → roasted chickpeas + nuts', 'Carbs → sweet potato/quinoa/oats'] },
    ],
  },
]

const restaurantGoTos = [
  { name: 'Chipotle', order: 'Burrito bowl, double chicken, beans, veggies, guac', icon: Utensils },
  { name: 'Sweetgreen', order: 'Custom bowl, double protein', icon: Leaf },
  { name: 'Panera', order: 'Mediterranean bowl, add chicken', icon: Coffee },
  { name: 'Starbucks', order: 'Egg bites, protein boxes', icon: CupSoda },
  { name: 'Sushi', order: 'Sashimi, edamame, miso soup', icon: Fish },
]

const mealPrepTasks = [
  {
    category: 'Proteins',
    color: SAGE,
    tasks: [
      'Grill 4-6 chicken breasts',
      'Bake 2 lbs salmon',
      'Hard-boil 12 eggs',
      'Cook 1 lb ground turkey',
    ],
  },
  {
    category: 'Grains',
    color: GOLD,
    tasks: [
      'Cook 3 cups quinoa/rice',
      'Roast 4-5 sweet potatoes',
    ],
  },
  {
    category: 'Veggies',
    color: '#7a8b9e',
    tasks: [
      'Wash/chop raw veggies',
      'Roast 2 sheet pans vegetables',
    ],
  },
  {
    category: 'Sauces',
    color: TERRACOTTA,
    tasks: [
      'Tahini dressing',
      'Vinaigrette',
    ],
  },
]

const groceryEssentials = [
  { item: 'Chicken breast', qty: '2-3 lbs', icon: Beef },
  { item: 'Salmon', qty: '1-1.5 lbs', icon: Fish },
  { item: 'Eggs', qty: '2 dozen', icon: Egg },
  { item: 'Greek yogurt', qty: '32 oz', icon: Apple },
  { item: 'Spinach', qty: '2 containers', icon: Leaf },
  { item: 'Broccoli/Brussels sprouts', qty: '2 bags', icon: Carrot },
  { item: 'Sweet potatoes', qty: '4-5', icon: Carrot },
  { item: 'Avocados', qty: '4-5', icon: Leaf },
  { item: 'Bananas/berries', qty: '1-2 packs', icon: Cherry },
  { item: 'Oats/quinoa', qty: '1 bag', icon: Wheat },
  { item: 'Oat milk', qty: '2 cartons', icon: CupSoda },
  { item: 'Sauerkraut/kimchi', qty: '1 jar each', icon: Apple },
  { item: 'Hemp/chia seeds', qty: '1 bag each', icon: Wheat },
]

// localStorage Keys
const LS_NUTRITION_LOG = 'nourishment-nutrition-log'
const LS_WATER_LOG = 'nourishment-water-log'
const LS_GUT_CHECKLIST = 'nourishment-gut-checklist'
const LS_GROCERY_CHECKED = 'nourishment-grocery-checked'

// ─── Component ───
export default function Nourishment() {
  const [activeTab, setActiveTab] = useState<'tracker' | 'timing' | 'cycles' | 'prep'>('tracker')
  const [nutritionLog, setNutritionLog] = useState<NutritionLog[]>([])
  const [waterLog, setWaterLog] = useState<WaterEntry[]>([])
  const [gutChecklist, setGutChecklist] = useState<GutChecklist>({})
  const [groceryChecked, setGroceryChecked] = useState<Record<string, boolean>>({})

  // Form states
  const [logProtein, setLogProtein] = useState('')
  const [logCarbs, setLogCarbs] = useState('')
  const [logFats, setLogFats] = useState('')
  const [logFiber, setLogFiber] = useState('')
  const [logCalories, setLogCalories] = useState('')

  // Load from localStorage
  useEffect(() => {
    const storedNut = localStorage.getItem(LS_NUTRITION_LOG)
    if (storedNut) setNutritionLog(JSON.parse(storedNut))
    const storedWater = localStorage.getItem(LS_WATER_LOG)
    if (storedWater) setWaterLog(JSON.parse(storedWater))
    const storedGut = localStorage.getItem(LS_GUT_CHECKLIST)
    if (storedGut) setGutChecklist(JSON.parse(storedGut))
    const storedGroc = localStorage.getItem(LS_GROCERY_CHECKED)
    if (storedGroc) setGroceryChecked(JSON.parse(storedGroc))
  }, [])

  const saveNutritionLog = useCallback((logs: NutritionLog[]) => {
    setNutritionLog(logs)
    localStorage.setItem(LS_NUTRITION_LOG, JSON.stringify(logs))
  }, [])

  const saveWaterLog = useCallback((logs: WaterEntry[]) => {
    setWaterLog(logs)
    localStorage.setItem(LS_WATER_LOG, JSON.stringify(logs))
  }, [])

  const saveGutChecklist = useCallback((check: GutChecklist) => {
    setGutChecklist(check)
    localStorage.setItem(LS_GUT_CHECKLIST, JSON.stringify(check))
  }, [])

  const saveGroceryChecked = useCallback((checked: Record<string, boolean>) => {
    setGroceryChecked(checked)
    localStorage.setItem(LS_GROCERY_CHECKED, JSON.stringify(checked))
  }, [])

  const addNutritionLog = () => {
    if (!logProtein && !logCarbs && !logFats && !logCalories) return
    const newLog: NutritionLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      protein: parseFloat(logProtein) || 0,
      carbs: parseFloat(logCarbs) || 0,
      fats: parseFloat(logFats) || 0,
      fiber: parseFloat(logFiber) || 0,
      calories: parseFloat(logCalories) || 0,
    }
    const updated = [newLog, ...nutritionLog]
    saveNutritionLog(updated)
    setLogProtein('')
    setLogCarbs('')
    setLogFats('')
    setLogFiber('')
    setLogCalories('')
  }

  const addWater = (glasses: number) => {
    const entry: WaterEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      glasses,
    }
    const updated = [entry, ...waterLog]
    saveWaterLog(updated)
  }

  const todayWater = waterLog
    .filter((w) => w.timestamp.startsWith(new Date().toISOString().split('T')[0]))
    .reduce((sum, w) => sum + w.glasses, 0)

  const toggleGutItem = (id: string) => {
    const updated = { ...gutChecklist, [id]: !gutChecklist[id] }
    saveGutChecklist(updated)
  }

  const toggleGroceryItem = (item: string) => {
    const updated = { ...groceryChecked, [item]: !groceryChecked[item] }
    saveGroceryChecked(updated)
  }

  // Today's nutrition totals
  const todayStr = new Date().toISOString().split('T')[0]
  const todayNutrition = nutritionLog.find((n) => n.date === todayStr)

  const getProgressPct = (current: number, _min: number, max: number) => {
    return Math.min((current / max) * 100, 100)
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ─── Hero ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative overflow-hidden rounded-lg"
          style={{ background: `linear-gradient(135deg, ${CREAM} 0%, #f0ebe3 100%)` }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 text-8xl font-playfair" style={{ color: SAGE }}>✦</div>
            <div className="absolute bottom-4 left-8 text-6xl font-playfair" style={{ color: TERRACOTTA }}>✦</div>
          </div>
          <div className="relative px-8 py-12 md:px-12 md:py-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${SAGE}20` }}>
                <Apple className="w-5 h-5" style={{ color: SAGE }} />
              </div>
              <span className="font-caveat text-lg" style={{ color: SAGE }}>Nourish with intention</span>
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-semibold text-warm-900 mb-2">
              Nourishment
            </h1>
            <p className="font-caveat text-xl text-warm-600">
              Food as medicine, eating as ritual
            </p>
          </div>
        </motion.div>

        {/* ─── Tab Navigation ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          className="flex gap-2 border-b border-warm-200"
        >
          {[
            { key: 'tracker', label: 'Daily Tracker', icon: TrendingUp },
            { key: 'timing', label: 'Meal Timing', icon: Clock },
            { key: 'cycles', label: 'Cycle Nutrition', icon: Moon },
            { key: 'prep', label: 'Meal Prep & Shopping', icon: ChefHat },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 font-inter text-sm font-medium transition-all border-b-2 -mb-px',
                activeTab === tab.key
                  ? 'border-warm-800 text-warm-900'
                  : 'border-transparent text-warm-500 hover:text-warm-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* ─── TRACKER TAB ─── */}
        {activeTab === 'tracker' && (
          <div className="space-y-8">
            {/* Daily Nutrition Targets */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <h2 className="font-playfair text-2xl text-warm-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" style={{ color: SAGE }} />
                Daily Nutrition Targets
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nutritionTargets.map((target, i) => {
                  const current = todayNutrition
                    ? target.label === 'Protein'
                      ? todayNutrition.protein
                      : target.label === 'Carbs'
                        ? todayNutrition.carbs
                        : target.label === 'Fats'
                          ? todayNutrition.fats
                          : target.label === 'Fiber'
                            ? todayNutrition.fiber
                            : todayNutrition.calories
                    : 0
                  const pct = getProgressPct(current, target.min, target.max)
                  return (
                    <motion.div
                      key={target.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE, delay: 0.1 + i * 0.05 }}
                      className="card-planner"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${target.color}18` }}>
                          <target.icon className="w-4.5 h-4.5" style={{ color: target.color }} />
                        </div>
                        <div>
                          <p className="font-inter text-sm font-medium text-warm-800">{target.label}</p>
                          <p className="font-inter text-xs text-warm-500">
                            {target.min}-{target.max}{target.unit} goal
                          </p>
                        </div>
                        <span className="ml-auto font-playfair text-2xl font-semibold" style={{ color: target.color }}>
                          {current}
                        </span>
                      </div>
                      <div className="h-2.5 bg-warm-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: target.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: EASE, delay: 0.2 + i * 0.1 }}
                        />
                      </div>
                      <p className="font-inter text-xs text-warm-400 mt-1 text-right">
                        {Math.round(pct)}% of max target
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Water Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
              className="card-planner"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#7a8e9e18' }}>
                  <Droplets className="w-4.5 h-4.5" style={{ color: '#7a8e9e' }} />
                </div>
                <h2 className="font-playfair text-xl text-warm-900">Water Tracker</h2>
                <span className="ml-auto font-playfair text-2xl font-semibold" style={{ color: '#7a8e9e' }}>
                  {todayWater}/8
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => addWater(1)}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all border-2',
                      i < todayWater
                        ? 'border-transparent text-white'
                        : 'border-warm-200 text-warm-300 hover:border-warm-300'
                    )}
                    style={i < todayWater ? { backgroundColor: '#7a8e9e' } : undefined}
                  >
                    <Droplets className="w-4 h-4" />
                  </motion.button>
                ))}
              </div>
              <div className="h-2.5 bg-warm-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: '#7a8e9e' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((todayWater / 8) * 100, 100)}%` }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
              </div>
              <p className="font-caveat text-sm text-warm-500 mt-2">Click a glass to log water. Goal: 8 glasses (2.5-3L)</p>
            </motion.div>

            {/* Log Nutrition */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
              className="card-planner"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${SAGE}18` }}>
                  <Plus className="w-4.5 h-4.5" style={{ color: SAGE }} />
                </div>
                <h2 className="font-playfair text-xl text-warm-900">Log Today's Nutrition</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <input
                  type="number"
                  placeholder="Protein (g)"
                  value={logProtein}
                  onChange={(e) => setLogProtein(e.target.value)}
                  className="planner-input border border-warm-200 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Carbs (g)"
                  value={logCarbs}
                  onChange={(e) => setLogCarbs(e.target.value)}
                  className="planner-input border border-warm-200 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Fats (g)"
                  value={logFats}
                  onChange={(e) => setLogFats(e.target.value)}
                  className="planner-input border border-warm-200 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Fiber (g)"
                  value={logFiber}
                  onChange={(e) => setLogFiber(e.target.value)}
                  className="planner-input border border-warm-200 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Calories"
                  value={logCalories}
                  onChange={(e) => setLogCalories(e.target.value)}
                  className="planner-input border border-warm-200 rounded-md px-3 py-2"
                />
              </div>
              <button
                onClick={addNutritionLog}
                className="mt-3 flex items-center justify-center gap-2 px-6 py-2 rounded-md font-inter text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: SAGE }}
              >
                <Save className="w-4 h-4" />
                Log Nutrition
              </button>
            </motion.div>

            {/* Gut Health Checklist */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
              className="card-planner"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${SAGE}18` }}>
                  <Heart className="w-4.5 h-4.5" style={{ color: SAGE }} />
                </div>
                <h2 className="font-playfair text-xl text-warm-900">Gut Health Daily Checklist</h2>
                <span className="ml-auto font-inter text-xs text-warm-500">
                  {Object.values(gutChecklist).filter(Boolean).length}/{gutChecklistItems.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {gutChecklistItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleGutItem(item.id)}
                    className="flex items-center gap-3 p-3 rounded-md border border-warm-200 hover:bg-warm-50 transition-all text-left"
                  >
                    {gutChecklist[item.id] ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: SAGE }} />
                    ) : (
                      <Circle className="w-5 h-5 shrink-0 text-warm-300" />
                    )}
                    <span className={cn('font-inter text-sm', gutChecklist[item.id] ? 'text-warm-800 line-through' : 'text-warm-700')}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Anti-Bloating Guide */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="card-planner" style={{ borderLeft: `3px solid ${SAGE}` }}>
                <h3 className="font-playfair text-base text-warm-900 mb-3 flex items-center gap-2">
                  <Leaf className="w-4 h-4" style={{ color: SAGE }} />
                  Anti-Bloating: Eat More
                </h3>
                <div className="flex flex-wrap gap-2">
                  {antiBloatingEatMore.map((food) => (
                    <span key={food} className="text-sm font-inter px-3 py-1.5 rounded-full bg-warm-50 border border-warm-200 text-warm-700">
                      {food}
                    </span>
                  ))}
                </div>
              </div>
              <div className="card-planner" style={{ borderLeft: `3px solid ${TERRACOTTA}` }}>
                <h3 className="font-playfair text-base text-warm-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" style={{ color: TERRACOTTA }} />
                  Anti-Bloating: Eat Less
                </h3>
                <div className="flex flex-wrap gap-2">
                  {antiBloatingEatLess.map((food) => (
                    <span key={food} className="text-sm font-inter px-3 py-1.5 rounded-full bg-warm-50 border border-warm-200 text-warm-700">
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Medication + Food Rules */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
              className="card-planner"
              style={{ borderTop: `3px solid ${TERRACOTTA}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Pill className="w-5 h-5" style={{ color: TERRACOTTA }} />
                <h2 className="font-playfair text-lg text-warm-900">Medication + Food Rules</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-md bg-warm-50 border border-warm-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: SAGE }} />
                    <span className="font-inter text-sm font-semibold text-warm-800">DO</span>
                  </div>
                  <ul className="space-y-1">
                    <li className="font-inter text-sm text-warm-600 flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 mt-1 shrink-0" style={{ color: SAGE }} />
                      Eat breakfast 30-60 min before Adderall
                    </li>
                    <li className="font-inter text-sm text-warm-600 flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 mt-1 shrink-0" style={{ color: SAGE }} />
                      Front-load 35-40% calories before 9 AM
                    </li>
                  </ul>
                </div>
                <div className="p-3 rounded-md bg-warm-50 border border-warm-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" style={{ color: TERRACOTTA }} />
                    <span className="font-inter text-sm font-semibold text-warm-800">DON'T</span>
                  </div>
                  <ul className="space-y-1">
                    <li className="font-inter text-sm text-warm-600 flex items-start gap-2">
                      <X className="w-3 h-3 mt-1 shrink-0" style={{ color: TERRACOTTA }} />
                      Skip breakfast before medication
                    </li>
                    <li className="font-inter text-sm text-warm-600 flex items-start gap-2">
                      <X className="w-3 h-3 mt-1 shrink-0" style={{ color: TERRACOTTA }} />
                      Force food during 10 AM-12 PM suppression window
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ─── TIMING TAB ─── */}
        {activeTab === 'timing' && (
          <div className="space-y-8">
            {/* Meal Timing Protocol */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <h2 className="font-playfair text-2xl text-warm-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: SAGE }} />
                Meal Timing Protocol
              </h2>
              <div className="space-y-3">
                {mealTiming.map((meal, i) => (
                  <motion.div
                    key={meal.time}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}
                    className={cn(
                      'card-planner flex items-start gap-4',
                      meal.critical && 'ring-1'
                    )}
                    style={meal.critical ? { borderLeft: `3px solid ${TERRACOTTA}`, boxShadow: `0 0 0 1px ${TERRACOTTA}33` } : { borderLeft: `3px solid ${meal.color}` }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${meal.color}18` }}>
                      <meal.icon className="w-5 h-5" style={{ color: meal.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-inter text-xs font-semibold uppercase tracking-wider" style={{ color: meal.color }}>
                          {meal.time}
                        </span>
                        {meal.critical && (
                          <span className="text-[0.625rem] font-inter font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: TERRACOTTA }}>
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <h3 className="font-playfair text-lg text-warm-900 mt-0.5">{meal.label}</h3>
                      <p className="font-inter text-sm text-warm-600">{meal.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Breakfast Options */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
              className="card-planner"
              style={{ borderTop: `3px solid ${SAGE}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${SAGE}18` }}>
                  <Sunrise className="w-4.5 h-4.5" style={{ color: SAGE }} />
                </div>
                <div>
                  <h2 className="font-playfair text-xl text-warm-900">Breakfast Options</h2>
                  <p className="font-inter text-xs text-warm-500">25-30g protein — must eat BEFORE medication</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {breakfastOptions.map((option, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="p-3 rounded-md bg-warm-50 border border-warm-200 flex items-center gap-3"
                  >
                    <Egg className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                    <span className="font-inter text-sm text-warm-700">{option}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Restaurant Go-Tos */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
              className="card-planner"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${GOLD}18` }}>
                  <Utensils className="w-4.5 h-4.5" style={{ color: GOLD }} />
                </div>
                <h2 className="font-playfair text-xl text-warm-900">Restaurant Go-Tos</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {restaurantGoTos.map((rest, i) => (
                  <motion.div
                    key={rest.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="p-4 rounded-md border border-warm-200 bg-warm-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <rest.icon className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="font-inter text-sm font-semibold text-warm-800">{rest.name}</span>
                    </div>
                    <p className="font-inter text-xs text-warm-600">{rest.order}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Affirmation */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
              className="chic-card text-center"
            >
              <Sparkles className="w-5 h-5 mx-auto mb-2" style={{ color: GOLD }} />
              <p className="font-caveat text-xl text-warm-700">
                "Eat with gratitude, nourish with intention, fuel your temple with love."
              </p>
            </motion.div>
          </div>
        )}

        {/* ─── CYCLES TAB ─── */}
        {activeTab === 'cycles' && (
          <div className="space-y-8">
            {/* Cycle Phase Nutrition */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <h2 className="font-playfair text-2xl text-warm-900 mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5" style={{ color: SAGE }} />
                Cycle-Phase Nutrition
              </h2>
              <div className="space-y-4">
                {cyclePhases.map((phase, i) => (
                  <motion.div
                    key={phase.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: i * 0.08 }}
                    className="card-planner"
                    style={{ borderLeft: `4px solid ${phase.color}` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${phase.color}18` }}>
                        <phase.icon className="w-5 h-5" style={{ color: phase.color }} />
                      </div>
                      <div>
                        <h3 className="font-playfair text-lg text-warm-900">{phase.name} Phase</h3>
                        <span className="font-inter text-xs" style={{ color: phase.color }}>{phase.days}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {phase.nutrition.map((item, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: phase.color }} />
                          <p className="font-inter text-sm text-warm-700">{item}</p>
                        </div>
                      ))}
                    </div>
                    {'critical' in phase && phase.critical && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {phase.critical.map((section) => (
                          <div key={section.title} className="p-3 rounded-md bg-warm-50 border border-warm-200">
                            <h4 className="font-inter text-xs font-bold uppercase tracking-wider text-warm-800 mb-2">
                              {section.title}
                            </h4>
                            <ul className="space-y-1">
                              {section.items.map((item, k) => (
                                <li key={k} className="font-inter text-xs text-warm-600 flex items-start gap-1.5">
                                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: TERRACOTTA }} />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Luteal Phase Special Focus */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
              className="card-planner"
              style={{ borderTop: `3px solid ${TERRACOTTA}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5" style={{ color: TERRACOTTA }} />
                <h2 className="font-playfair text-lg text-warm-900">Luteal Phase — Critical Focus</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-warm-50 border border-warm-200">
                  <h4 className="font-inter text-sm font-semibold text-warm-800 mb-2 flex items-center gap-2">
                    <Droplets className="w-4 h-4" style={{ color: '#7a8e9e' }} />
                    Bloating Reduction
                  </h4>
                  <ul className="space-y-1.5">
                    {['Sodium <2300mg', 'Increase potassium (bananas, sweet potato, spinach)', 'Water 2.5-3L daily', 'Take digestive enzymes', 'Avoid carbonation completely'].map((item, i) => (
                      <li key={i} className="font-inter text-xs text-warm-600 flex items-start gap-1.5">
                        <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#7a8e9e' }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-md bg-warm-50 border border-warm-200">
                  <h4 className="font-inter text-sm font-semibold text-warm-800 mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4" style={{ color: SAGE }} />
                    Serotonin Support
                  </h4>
                  <ul className="space-y-1.5">
                    {['Complex carbs in the evening', 'Turkey/chicken, salmon, eggs', 'Dark chocolate 70%+', 'Pumpkin seeds daily'].map((item, i) => (
                      <li key={i} className="font-inter text-xs text-warm-600 flex items-start gap-1.5">
                        <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: SAGE }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-md bg-warm-50 border border-warm-200">
                  <h4 className="font-inter text-sm font-semibold text-warm-800 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" style={{ color: GOLD }} />
                    Blood Sugar Stability
                  </h4>
                  <ul className="space-y-1.5">
                    {['Eat within 1 hour of waking', 'Protein + fat at every meal', 'No naked carbs', '3 meals + 1-2 snacks'].map((item, i) => (
                      <li key={i} className="font-inter text-xs text-warm-600 flex items-start gap-1.5">
                        <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: GOLD }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-md bg-warm-50 border border-warm-200">
                  <h4 className="font-inter text-sm font-semibold text-warm-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: TERRACOTTA }} />
                    Craving Management
                  </h4>
                  <ul className="space-y-1.5">
                    {['Sweet → dark chocolate + berries', 'Salty → roasted chickpeas + nuts', 'Carbs → sweet potato / quinoa / oats'].map((item, i) => (
                      <li key={i} className="font-inter text-xs text-warm-600 flex items-start gap-1.5">
                        <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: TERRACOTTA }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ─── PREP TAB ─── */}
        {activeTab === 'prep' && (
          <div className="space-y-8">
            {/* Weekly Meal Prep */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <h2 className="font-playfair text-2xl text-warm-900 mb-4 flex items-center gap-2">
                <ChefHat className="w-5 h-5" style={{ color: SAGE }} />
                Weekly Meal Prep (Sunday)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mealPrepTasks.map((category, i) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}
                    className="card-planner"
                    style={{ borderLeft: `3px solid ${category.color}` }}
                  >
                    <h3 className="font-playfair text-base text-warm-900 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.category}
                    </h3>
                    <ul className="space-y-2">
                      {category.tasks.map((task, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: category.color }} />
                          <span className="font-inter text-sm text-warm-700">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Grocery Essentials */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
              className="card-planner"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${SAGE}18` }}>
                  <ShoppingCart className="w-4.5 h-4.5" style={{ color: SAGE }} />
                </div>
                <h2 className="font-playfair text-xl text-warm-900">Grocery Essentials (Every Week)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groceryEssentials.map((item, i) => (
                  <motion.button
                    key={item.item}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    onClick={() => toggleGroceryItem(item.item)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-md border transition-all text-left',
                      groceryChecked[item.item]
                        ? 'bg-warm-50 border-warm-300'
                        : 'bg-white border-warm-200 hover:border-warm-300'
                    )}
                  >
                    {groceryChecked[item.item] ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: SAGE }} />
                    ) : (
                      <Circle className="w-4 h-4 shrink-0 text-warm-300" />
                    )}
                    <item.icon className="w-4 h-4 shrink-0" style={{ color: groceryChecked[item.item] ? SAGE : '#b8a896' }} />
                    <div className="flex-1">
                      <span className={cn('font-inter text-sm', groceryChecked[item.item] ? 'text-warm-800 line-through' : 'text-warm-700')}>
                        {item.item}
                      </span>
                      <span className="font-inter text-xs text-warm-400 ml-2">{item.qty}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Sacred Food Affirmation */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
              className="chic-card text-center"
            >
              <Sparkles className="w-5 h-5 mx-auto mb-2" style={{ color: GOLD }} />
              <p className="font-caveat text-xl text-warm-700">
                "Preparation is an act of self-love. Every meal prepped is a promise kept to your body."
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  )
}


