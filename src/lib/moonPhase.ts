// Known new moon: January 29, 2025 at 12:36 UTC
const KNOWN_NEW_MOON = new Date('2025-01-29T12:36:00Z')
const LUNAR_CYCLE = 29.53059 // days

export interface MoonPhase {
  name: string
  emoji: string
  illumination: number
  age: number
  phase: number // 0-1 normalized
}

const PHASES = [
  { name: 'New Moon', emoji: '🌑', threshold: 0.02 },
  { name: 'Waxing Crescent', emoji: '🌒', threshold: 0.23 },
  { name: 'First Quarter', emoji: '🌓', threshold: 0.27 },
  { name: 'Waxing Gibbous', emoji: '🌔', threshold: 0.48 },
  { name: 'Full Moon', emoji: '🌕', threshold: 0.52 },
  { name: 'Waning Gibbous', emoji: '🌖', threshold: 0.73 },
  { name: 'Last Quarter', emoji: '🌗', threshold: 0.77 },
  { name: 'Waning Crescent', emoji: '🌘', threshold: 0.98 },
  { name: 'New Moon', emoji: '🌑', threshold: 1.0 },
]

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const diff = (date.getTime() - KNOWN_NEW_MOON.getTime()) / (1000 * 60 * 60 * 24)
  const cycles = diff / LUNAR_CYCLE
  const age = ((cycles % 1) + 1) % 1 // normalized 0-1 within current cycle
  const illumination = Math.sin(age * Math.PI) // 0-1

  const phaseEntry = PHASES.find((p) => age <= p.threshold) ?? PHASES[PHASES.length - 1]

  return {
    name: phaseEntry.name,
    emoji: phaseEntry.emoji,
    illumination: Math.round(illumination * 100),
    age: Math.round(age * LUNAR_CYCLE * 10) / 10,
    phase: age,
  }
}

export function getMoonPhaseForDate(date: Date): MoonPhase {
  return getMoonPhase(date)
}

export function getCycleDay(date: Date = new Date()): number {
  const diff = (date.getTime() - KNOWN_NEW_MOON.getTime()) / (1000 * 60 * 60 * 24)
  const cycles = diff / LUNAR_CYCLE
  const age = ((cycles % 1) + 1) % 1
  return Math.round(age * LUNAR_CYCLE) + 1
}
