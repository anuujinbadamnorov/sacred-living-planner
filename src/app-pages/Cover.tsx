import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import HeroSection from '@/components/HeroSection'

/* ── Seasonal Themes ── */
const SEASONS = [
  { name: 'Spring', color: '#7A8B65', accent: 'var(--sage)' },
  { name: 'Summer', color: '#7B9EA8', accent: 'var(--lake)' },
  { name: 'Fall', color: '#A67C52', accent: 'var(--cognac)' },
  { name: 'Winter', color: '#C9A96E', accent: 'var(--gold)' },
]

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
}

export default function Cover() {
  const router = useRouter()
  const [activeSeason, setActiveSeason] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('planner-season')
    if (saved) setActiveSeason(parseInt(saved, 10))
  }, [])

  const handleSeason = (idx: number) => {
    setActiveSeason(idx)
    localStorage.setItem('planner-season', String(idx))
  }

  const handleEnter = () => {
    router.push('/planner')
  }

  return (
    <div
      className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--cream)' }}
    >
      <HeroSection
        title={`Sacred Living`}
        subtitle="Welcome to your journey"
        imageIndex={27}
      />
      {/* Center Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="relative z-10 w-[min(520px,calc(100vw-32px))] flex flex-col items-center text-center px-8 py-12"
      >
        {/* Moon icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-4"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="font-display text-[clamp(2.5rem,6vw,4rem)] tracking-tight mb-2"
          style={{ color: 'var(--espresso)' }}
        >
          Sacred Living Planner
        </motion.h1>

        {/* Year */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="font-display text-[clamp(3rem,8vw,5rem)] block mb-4"
          style={{ color: SEASONS[activeSeason].color }}
        >
          2026
        </motion.span>

        {/* Divider */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 60 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="h-px mb-6"
          style={{ background: 'var(--gold)' }}
        />

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="font-body text-xs tracking-[0.2em] uppercase mb-10"
          style={{ color: 'var(--espresso-muted)' }}
        >
          Rooted in Ritual. Aligned with the Moon.
        </motion.p>

        {/* Season Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mb-10"
        >
          <p className="font-body text-[0.625rem] uppercase tracking-widest mb-3" style={{ color: 'var(--espresso-muted)' }}>
            Choose Your Season
          </p>
          <div className="flex items-center gap-3 justify-center">
            {SEASONS.map((season, idx) => (
              <button
                key={season.name}
                onClick={() => handleSeason(idx)}
                className="px-4 py-2 rounded-full font-body text-sm font-medium transition-all duration-300 border"
                style={{
                  backgroundColor: idx === activeSeason ? season.color : 'transparent',
                  color: idx === activeSeason ? '#fff' : season.color,
                  borderColor: season.color,
                  opacity: idx === activeSeason ? 1 : 0.6,
                }}
              >
                {season.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleEnter}
          className="px-10 py-3.5 rounded-full font-body text-sm font-medium text-white transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${SEASONS[activeSeason].color}, var(--espresso-light))`,
            boxShadow: `0 4px 20px ${SEASONS[activeSeason].color}44`,
          }}
        >
          <span className="flex items-center gap-2">
            Enter Your Sacred Space
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </span>
        </motion.button>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="font-handwriting text-sm mt-8"
          style={{ color: 'var(--espresso-muted)' }}
        >
          Made with love for the goddess within
        </motion.p>
      </motion.div>
    </div>
  )
}
