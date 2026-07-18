import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Heart,
  CloudRain,
  Lightbulb,
  Compass,
  BookOpen,
  X,
} from 'lucide-react'
import { usePlanner } from '@/hooks/usePlanner'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface MonthReview {
  wins: string
  challenges: string
  lessons: string
  gratitude: string
}

interface ReflectionData {
  wins: string[]
  gratitude: string[]
  challenges: string[]
  lessons: string[]
  word: string
  priorities: string[]
  letGo: string[]
  embrace: string[]
  commitment: string
  proudOf: string
  biggestWin: string
  challengedBy: string
  learned: string
  review: MonthReview
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const MONTHS = [
  { value: 0, label: 'January', full: 'January 2026' },
  { value: 1, label: 'February', full: 'February 2026' },
  { value: 2, label: 'March', full: 'March 2026' },
  { value: 3, label: 'April', full: 'April 2026' },
  { value: 4, label: 'May', full: 'May 2026' },
  { value: 5, label: 'June', full: 'June 2026' },
  { value: 6, label: 'July', full: 'July 2026' },
  { value: 7, label: 'August', full: 'August 2026' },
  { value: 8, label: 'September', full: 'September 2026' },
  { value: 9, label: 'October', full: 'October 2026' },
  { value: 10, label: 'November', full: 'November 2026' },
  { value: 11, label: 'December', full: 'December 2026' },
]

const REFLECTION_QUOTES = [
  "Life can only be understood backwards; but it must be lived forwards.",
  "The unexamined life is not worth living.",
  "We do not learn from experience. We learn from reflecting on experience.",
  "Your life is a story of transitions. You are always leaving one chapter behind while moving on to the next.",
  "Reflection is the lamp of the heart. If it departs, the heart will have no light.",
  "What we think, we become. What we feel, we attract. What we imagine, we create.",
]

const DEFAULT_REVIEW: MonthReview = {
  wins: '',
  challenges: '',
  lessons: '',
  gratitude: '',
}

const DEFAULT_REFLECTION: ReflectionData = {
  wins: ['', '', '', '', ''],
  gratitude: ['', '', '', '', ''],
  challenges: ['', '', ''],
  lessons: ['', '', ''],
  word: '',
  priorities: ['', '', ''],
  letGo: ['', '', ''],
  embrace: ['', '', ''],
  commitment: '',
  proudOf: '',
  biggestWin: '',
  challengedBy: '',
  learned: '',
  review: DEFAULT_REVIEW,
}

/* Merge stored data over the defaults so saves from before the
   `review` field existed still load with a complete shape. */
function withDefaults(stored: ReflectionData | null): ReflectionData {
  return {
    ...DEFAULT_REFLECTION,
    ...(stored ?? {}),
    review: { ...DEFAULT_REVIEW, ...(stored?.review ?? {}) },
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function Reflection() {
  const { month: monthParam } = useParams<{ month: string }>()
  const router = useRouter()
  const { getStorageItem, setStorageItem } = usePlanner()

  /* ---- Resolve current month ---- */
  const currentMonthIndex = useMemo(() => {
    if (!monthParam || monthParam === 'current') {
      const now = new Date()
      const idx = MONTHS.findIndex((m) => m.value === now.getMonth())
      return now.getFullYear() === 2026 && idx >= 0 ? idx : 0
    }
    const byLabel = MONTHS.findIndex((m) => m.label.toLowerCase() === monthParam.toLowerCase())
    if (byLabel >= 0) return byLabel
    // Search links use a YYYY-MM month_start — match it against the storage months.
    const dateMatch = /^(\d{4})-(\d{2})/.exec(monthParam)
    if (dateMatch && dateMatch[1] === '2026') {
      const idx = MONTHS.findIndex((m) => m.value === parseInt(dateMatch[2], 10) - 1)
      if (idx >= 0) return idx
    }
    return 0
  }, [monthParam])

  const currentMonth = MONTHS[currentMonthIndex]
  const storageKey = `planner-reflection-2026-${String(currentMonth.value + 1).padStart(2, '0')}`
  const quote = REFLECTION_QUOTES[currentMonthIndex % REFLECTION_QUOTES.length]

  /* ---- State ---- */
  const [reflection, setReflection] = useState<ReflectionData>(() => {
    const stored = getStorageItem<ReflectionData | null>(storageKey, null)
    return withDefaults(stored)
  })

  const [saveIndicator, setSaveIndicator] = useState(false)

  /* ---- Persist ---- */
  useEffect(() => {
    const stored = getStorageItem<ReflectionData | null>(storageKey, null)
    setReflection(withDefaults(stored))
  }, [storageKey, getStorageItem])

  useEffect(() => {
    setStorageItem(storageKey, reflection)
  }, [reflection, storageKey, setStorageItem])

  /* ---- Auto-save indicator ---- */
  const showSaved = useCallback(() => {
    setSaveIndicator(true)
    setTimeout(() => setSaveIndicator(false), 1500)
  }, [])

  const updateField = useCallback(<K extends keyof ReflectionData>(key: K, value: ReflectionData[K]) => {
    setReflection((prev) => ({ ...prev, [key]: value }))
    showSaved()
  }, [showSaved])

  const updateArrayItem = useCallback((key: keyof ReflectionData, index: number, value: string) => {
    setReflection((prev) => {
      const arr = [...(prev[key] as string[])]
      arr[index] = value
      return { ...prev, [key]: arr }
    })
    showSaved()
  }, [showSaved])

  const updateReview = useCallback((key: keyof MonthReview, value: string) => {
    setReflection((prev) => ({ ...prev, review: { ...prev.review, [key]: value } }))
    showSaved()
  }, [showSaved])

  /* ---- Navigation ---- */
  const goToMonth = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < MONTHS.length) {
        const label = MONTHS[idx].label.toLowerCase()
        router.push(`/planner/reflection/${label}`)
      }
    },
    [router]
  )

  /* ---- lined textarea style ---- */
  const linedStyle: React.CSSProperties = {
    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e8e2da 27px, #e8e2da 28px)',
    lineHeight: '28px',
  }

  return (
    <>
      <div className="space-y-8 pb-12 max-w-5xl mx-auto">
        {/* ====== Header ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="text-center pt-6 pb-2"
        >
          <p className="text-sm font-inter font-light text-warm-500 uppercase tracking-[0.1em] mb-2">
            Monthly Reflection
          </p>
          <h1
            className="font-playfair font-semibold text-rose-700"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            {currentMonth.full}
          </h1>
          <div className="w-20 h-px bg-rose-300 mx-auto my-4" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-caveat text-lg text-warm-600 italic max-w-md mx-auto"
          >
            &ldquo;{quote}&rdquo;
          </motion.p>
        </motion.div>

        {/* ====== Month Selector ====== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {MONTHS.map((m, i) => {
            const isActive = currentMonthIndex === i
            return (
              <motion.button
                key={m.value}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                onClick={() => goToMonth(i)}
                className={`px-4 py-1.5 rounded-full text-sm font-inter font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                }`}
              >
                {m.label}
              </motion.button>
            )
          })}
        </motion.div>

        {/* ====== Month in Review ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="card-planner"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <BookOpen className="w-5 h-5" style={{ color: 'var(--gold)' }} />
            <h3 className="font-playfair font-medium" style={{ color: 'var(--espresso)' }}>Month in Review</h3>
          </div>
          <p className="text-xs font-inter mb-5" style={{ color: 'var(--espresso-muted)' }}>
            Your {currentMonth.full} snapshot &mdash; saved automatically, and always here when you look back
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { key: 'wins' as const, label: "This Month's Wins", hint: 'What went well? What are you proud of?', icon: Trophy, color: 'var(--gold)' },
              { key: 'challenges' as const, label: 'Challenges', hint: 'What was difficult this month?', icon: CloudRain, color: '#7a8e9e' },
              { key: 'lessons' as const, label: 'Lessons Learned', hint: 'What did these experiences teach you?', icon: Lightbulb, color: 'var(--gold)' },
              { key: 'gratitude' as const, label: 'Gratitude', hint: 'What are you thankful for this month?', icon: Heart, color: 'var(--sage)' },
            ].map((field) => (
              <div
                key={field.key}
                className="rounded-md p-4"
                style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <field.icon className="w-4 h-4" style={{ color: field.color }} />
                  <label className="text-sm font-inter font-medium" style={{ color: 'var(--espresso)' }}>
                    {field.label}
                  </label>
                </div>
                <p className="text-xs font-inter mb-2" style={{ color: 'var(--espresso-muted)' }}>{field.hint}</p>
                <textarea
                  value={reflection.review[field.key]}
                  onChange={(e) => updateReview(field.key, e.target.value)}
                  placeholder="Write your thoughts..."
                  rows={3}
                  className="w-full px-3 py-2 text-base font-caveat bg-white/60 border rounded-md focus:outline-none focus:border-[var(--gold)] resize-none placeholder:text-warm-400"
                  style={{ ...linedStyle, color: 'var(--espresso)', borderColor: 'var(--border-light)' }}
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs font-inter text-center" style={{ color: 'var(--espresso-muted)' }}>
            Choose a month above to revisit or update past reviews &mdash; each month keeps its own page.
          </p>
        </motion.div>

        {/* ====== Reflection Prompts ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="card-planner"
          style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #fdfcfa 100%)' }}
        >
          <h3 className="font-playfair font-medium text-warm-800 mb-5">Reflection Prompts</h3>
          <div className="space-y-4">
            {[
              { key: 'proudOf' as const, label: "This month I'm proud of..." },
              { key: 'biggestWin' as const, label: 'My biggest win was...' },
              { key: 'challengedBy' as const, label: 'Something that challenged me...' },
              { key: 'learned' as const, label: 'What I learned...' },
            ].map((prompt) => (
              <div key={prompt.key}>
                <label className="block text-sm font-inter font-medium text-warm-700 mb-1.5">
                  {prompt.label}
                </label>
                <textarea
                  value={reflection[prompt.key]}
                  onChange={(e) => updateField(prompt.key, e.target.value)}
                  placeholder="Write your thoughts..."
                  rows={3}
                  className="w-full px-3 py-2 text-base font-caveat text-warm-700 border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none"
                  style={linedStyle}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* ====== Wins & Gratitude ====== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Wins */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="card-planner"
            style={{ backgroundColor: '#fdf2f4' }}
          >
            <div className="flex items-center gap-2.5 mb-1">
              <Trophy className="w-5 h-5" style={{ color: '#d4a76a' }} />
              <h3 className="font-playfair font-medium text-warm-800">My Wins</h3>
            </div>
            <p className="text-xs font-inter text-warm-500 mb-4">Big and small, they all count</p>
            <p className="text-sm font-caveat text-rose-600 mb-3">What went well this month? What are you proud of?</p>
            <div className="space-y-2">
              {reflection.wins.map((win, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <span className="font-playfair font-medium text-rose-400 text-base mt-1 w-4 text-center shrink-0">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={win}
                    onChange={(e) => updateArrayItem('wins', i, e.target.value)}
                    placeholder="A win I'm celebrating..."
                    className="flex-1 bg-transparent border-b border-warm-200 focus:border-rose-400 outline-none text-base font-caveat text-warm-700 placeholder:text-warm-400 py-1 transition-colors"
                  />
                  {win && (
                    <button
                      onClick={() => updateArrayItem('wins', i, '')}
                      className="opacity-0 group-hover:opacity-100 text-warm-400 hover:text-warm-600 transition-all mt-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Gratitude */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="card-planner"
          >
            <div className="flex items-center gap-2.5 mb-1">
              <Heart className="w-5 h-5 text-rose-400" />
              <h3 className="font-playfair font-medium text-warm-800">Gratitude</h3>
            </div>
            <p className="text-xs font-inter text-warm-500 mb-4">Count your blessings</p>
            <p className="text-sm font-caveat text-rose-600 mb-3">What are you thankful for this month?</p>
            <div className="space-y-2">
              {reflection.gratitude.map((item, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <span className="font-playfair font-medium text-rose-400 text-base mt-1 w-4 text-center shrink-0">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayItem('gratitude', i, e.target.value)}
                    placeholder="I'm grateful for..."
                    className="flex-1 bg-transparent border-b border-warm-200 focus:border-rose-400 outline-none text-base font-caveat text-warm-700 placeholder:text-warm-400 py-1 transition-colors"
                  />
                  {item && (
                    <button
                      onClick={() => updateArrayItem('gratitude', i, '')}
                      className="opacity-0 group-hover:opacity-100 text-warm-400 hover:text-warm-600 transition-all mt-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ====== Challenges & Growth ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="card-planner"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Challenges */}
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <CloudRain className="w-5 h-5 text-[#7a8e9e]" />
                <h3 className="font-playfair font-medium text-warm-800">Challenges</h3>
              </div>
              <p className="text-xs font-inter text-warm-500 mb-4">It&apos;s okay to struggle</p>
              <p className="text-sm font-caveat text-rose-600 mb-3">What was difficult this month?</p>
              <div className="space-y-2">
                {reflection.challenges.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <span className="font-playfair font-medium text-[#7a8e9e] text-base mt-1 w-4 text-center shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('challenges', i, e.target.value)}
                      placeholder="A challenge I faced..."
                      className="flex-1 bg-transparent border-b border-warm-200 focus:border-[#7a8e9e] outline-none text-base font-caveat text-warm-700 placeholder:text-warm-400 py-1 transition-colors"
                    />
                    {item && (
                      <button
                        onClick={() => updateArrayItem('challenges', i, '')}
                        className="opacity-0 group-hover:opacity-100 text-warm-400 hover:text-warm-600 transition-all mt-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Lessons Learned */}
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <Lightbulb className="w-5 h-5" style={{ color: '#d4a76a' }} />
                <h3 className="font-playfair font-medium text-warm-800">What I Learned</h3>
              </div>
              <p className="text-xs font-inter text-warm-500 mb-4">Every challenge is a teacher</p>
              <p className="text-sm font-caveat text-rose-600 mb-3">What did you learn from these experiences?</p>
              <div className="space-y-2">
                {reflection.lessons.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <span className="font-playfair font-medium text-[#d4a76a] text-base mt-1 w-4 text-center shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('lessons', i, e.target.value)}
                      placeholder="A lesson I learned..."
                      className="flex-1 bg-transparent border-b border-warm-200 focus:border-[#d4a76a] outline-none text-base font-caveat text-warm-700 placeholder:text-warm-400 py-1 transition-colors"
                    />
                    {item && (
                      <button
                        onClick={() => updateArrayItem('lessons', i, '')}
                        className="opacity-0 group-hover:opacity-100 text-warm-400 hover:text-warm-600 transition-all mt-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* One Word */}
          <div className="mt-8 text-center">
            <label className="block text-[0.6875rem] font-inter font-semibold text-rose-500 uppercase tracking-[0.06em] mb-3">
              One Word for This Month
            </label>
            <input
              type="text"
              value={reflection.word}
              onChange={(e) => updateField('word', e.target.value)}
              placeholder="e.g., Growth, Resilience, Joy..."
              className="text-center bg-transparent border-b-2 border-warm-200 focus:border-rose-400 outline-none text-2xl font-caveat text-rose-700 placeholder:text-warm-400 py-2 px-4 transition-colors max-w-xs w-full"
            />
          </div>
        </motion.div>

        {/* ====== Looking Forward ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="card-planner"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <Compass className="w-5 h-5 text-[#7a9e7a]" />
            <h3 className="font-playfair font-medium text-warm-800">Looking Ahead</h3>
          </div>
          <p className="text-xs font-inter text-warm-500 mb-5">Set your intentions for the next month</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* I will prioritize */}
            <div className="bg-warm-50 rounded-md p-4">
              <h4 className="text-sm font-inter font-semibold text-warm-700 mb-3">I will prioritize...</h4>
              <div className="space-y-2">
                {reflection.priorities.map((item, i) => (
                  <input
                    key={i}
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayItem('priorities', i, e.target.value)}
                    placeholder={`Priority ${i + 1}...`}
                    className="w-full bg-transparent border-b border-warm-200 focus:border-rose-400 outline-none text-base font-caveat text-warm-700 placeholder:text-warm-400 py-1 transition-colors"
                  />
                ))}
              </div>
            </div>

            {/* I will let go of */}
            <div className="bg-warm-50 rounded-md p-4">
              <h4 className="text-sm font-inter font-semibold text-warm-700 mb-3">I will let go of...</h4>
              <div className="space-y-2">
                {reflection.letGo.map((item, i) => (
                  <input
                    key={i}
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayItem('letGo', i, e.target.value)}
                    placeholder={`Let go ${i + 1}...`}
                    className="w-full bg-transparent border-b border-warm-200 focus:border-rose-400 outline-none text-base font-caveat text-warm-700 placeholder:text-warm-400 py-1 transition-colors"
                  />
                ))}
              </div>
            </div>

            {/* I will embrace */}
            <div className="bg-warm-50 rounded-md p-4">
              <h4 className="text-sm font-inter font-semibold text-warm-700 mb-3">I will embrace...</h4>
              <div className="space-y-2">
                {reflection.embrace.map((item, i) => (
                  <input
                    key={i}
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayItem('embrace', i, e.target.value)}
                    placeholder={`Embrace ${i + 1}...`}
                    className="w-full bg-transparent border-b border-warm-200 focus:border-rose-400 outline-none text-base font-caveat text-warm-700 placeholder:text-warm-400 py-1 transition-colors"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Commitment */}
          <div className="mt-8 text-center">
            <label className="block text-[0.6875rem] font-inter font-semibold text-rose-500 uppercase tracking-[0.06em] mb-3">
              My Commitment to Myself
            </label>
            <textarea
              value={reflection.commitment}
              onChange={(e) => updateField('commitment', e.target.value)}
              placeholder="I commit to..."
              rows={3}
              className="w-full max-w-xl mx-auto px-4 py-3 text-lg font-caveat text-rose-700 placeholder:text-warm-400 border border-warm-200 rounded-md focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none"
              style={linedStyle}
            />
          </div>

          {/* Save indicator */}
          <div className="mt-6 flex justify-center items-center gap-3">
            <AnimatePresence>
              {saveIndicator && (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-inter text-[#7a9e7a] flex items-center gap-1.5"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Saved
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  )
}
