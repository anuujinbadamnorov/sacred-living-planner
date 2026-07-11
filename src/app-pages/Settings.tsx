import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSection from '@/components/HeroSection'
import {
  Palette,
  Type,
  Layout as LayoutIcon,
  Database,
  Info,
  Download,
  Upload,
  AlertTriangle,
  ExternalLink,
  Sun,
  Moon,
  Clock,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePlanner } from '@/hooks/usePlanner'
import { useThemeStore } from '@/stores/theme'
import { useTheme } from '@/components/theme/ThemeProvider'
import { createClient } from '@/lib/supabase'
import type { Theme } from '@/types'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AppSettings {
  fontSize: 'compact' | 'default' | 'large'
  handwritingFont: boolean
  weekStart: 'sunday' | 'monday'
  timeFormat: '12h' | '24h'
  defaultPage: string
}

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 'default',
  handwritingFont: true,
  weekStart: 'sunday',
  timeFormat: '12h',
  defaultPage: '/planner',
}

const STORAGE_SETTINGS = 'planner-settings'

/* ------------------------------------------------------------------ */
/*  Load / save settings                                               */
/* ------------------------------------------------------------------ */

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_SETTINGS)
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
  } catch { /* */ }
  return { ...DEFAULT_SETTINGS }
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings))
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Settings() {
  const { currentThemeId, isNightMode, setTheme: setThemeId, setNightMode } = useThemeStore()
  const { theme: currentTheme } = useTheme()
  const [themesList, setThemesList] = useState<Theme[]>([])
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetConfirm, setResetConfirm] = useState('')
  const [lastBackup, setLastBackup] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchThemes = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('themes').select('*').order('name')
      if (!error && data) setThemesList(data as Theme[])
    }
    fetchThemes()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setSettings(loadSettings())
    setLastBackup(localStorage.getItem('planner-last-backup') || '')
  }, [])

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  /* Export all data */
  const exportData = () => {
    const data: Record<string, string | null> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('planner-')) {
        data[key] = localStorage.getItem(key)
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `planner-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    const now = new Date().toISOString()
    setLastBackup(now)
    localStorage.setItem('planner-last-backup', now)
  }

  /* Import data */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (window.confirm('This will overwrite your existing planner data. Continue?')) {
          Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'string') {
              localStorage.setItem(key, value)
            }
          })
          window.location.reload()
        }
      } catch {
        alert('Invalid backup file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  /* Reset all data */
  const resetAll = () => {
    if (resetConfirm !== 'DELETE') return
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.startsWith('planner-')) {
        localStorage.removeItem(key)
      }
    }
    setShowResetModal(false)
    setResetConfirm('')
    window.location.reload()
  }

  /* Apply font size CSS variable */
  useEffect(() => {
    const sizes = { compact: '0.875rem', default: '1rem', large: '1.125rem' }
    document.documentElement.style.setProperty('--planner-font-size', sizes[settings.fontSize])
  }, [settings.fontSize])

  const formattedBackupDate = lastBackup
    ? new Date(lastBackup).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Never'

  return (
    <div className="space-y-8 max-w-3xl">
      <HeroSection
        title={`Settings`}
        subtitle="Personalize your sacred space"
        imageIndex={19}
      />
        {/* ====== HEADER ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <div className="flex items-center gap-3">
            <Palette className="w-7 h-7 text-rose-500" />
            <h1 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] font-medium text-warm-900">Settings</h1>
          </div>
          <p className="text-warm-500 font-inter text-sm mt-1">Personalize your planner experience.</p>
        </motion.div>

        {/* ====== DAY / NIGHT MODE ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.04 }}
          className="card-planner"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-5 h-5 text-rose-500" />
            <h2 className="font-playfair text-xl font-medium text-warm-800">Day & Night</h2>
          </div>
          <p className="text-warm-500 font-inter text-sm mb-4">Switch between warm day and cozy night modes.</p>

          <div className="flex gap-3">
            <button
              onClick={() => setNightMode(false)}
              className={cn(
                'flex-1 p-4 rounded-lg border-2 text-center transition-all duration-200',
                !isNightMode
                  ? 'border-rose-500 bg-rose-50 shadow-sm'
                  : 'border-warm-200 bg-white hover:border-warm-300'
              )}
            >
              <Sun className={cn('w-6 h-6 mx-auto mb-2', !isNightMode ? 'text-rose-500' : 'text-warm-400')} />
              <p className={cn('font-inter font-medium text-warm-800', !isNightMode && 'text-rose-700')}>Day</p>
              <p className="text-xs text-warm-500 font-inter mt-1">Warm cream & gold</p>
            </button>
            <button
              onClick={() => setNightMode(true)}
              className={cn(
                'flex-1 p-4 rounded-lg border-2 text-center transition-all duration-200',
                isNightMode
                  ? 'border-rose-500 bg-rose-50 shadow-sm'
                  : 'border-warm-200 bg-white hover:border-warm-300'
              )}
            >
              <Moon className={cn('w-6 h-6 mx-auto mb-2', isNightMode ? 'text-rose-500' : 'text-warm-400')} />
              <p className={cn('font-inter font-medium text-warm-800', isNightMode && 'text-rose-700')}>Night</p>
              <p className="text-xs text-warm-500 font-inter mt-1">Cozy cognac & charcoal</p>
            </button>
          </div>
        </motion.div>

        {/* ====== THEME SELECTOR ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="card-planner"
        >
          <div className="flex items-center gap-2 mb-1">
            <Palette className="w-5 h-5 text-rose-500" />
            <h2 className="font-playfair text-xl font-medium text-warm-800">Color Theme</h2>
          </div>
          <p className="text-warm-500 font-inter text-sm mb-6">Choose a color that inspires you.</p>

          <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
            {themesList.map((t) => {
              const isActive = currentThemeId === t.id
              const accent = t.colors?.accent || '#c9a87c'
              const accentHover = t.colors?.accentHover || '#b8996a'
              const bg = t.colors?.bg || '#faf8f5'
              return (
                <motion.button
                  key={t.id}
                  onClick={() => setThemeId(t.id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'relative rounded-lg p-3 transition-all duration-300 border-2',
                    isActive
                      ? 'border-warm-400 shadow-md'
                      : 'border-transparent hover:border-warm-200 hover:shadow-sm'
                  )}
                  style={{ backgroundColor: bg }}
                >
                  {/* Preview strip */}
                  <div
                    className="w-full h-8 rounded-md mb-2"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${accentHover})` }}
                  />
                  {/* Mini page preview */}
                  <div className="w-full h-10 rounded bg-white/80 mb-2 p-1 space-y-1">
                    <div className="w-3/4 h-1 rounded" style={{ backgroundColor: `${accent}40` }} />
                    <div className="w-1/2 h-1 rounded" style={{ backgroundColor: `${accent}30` }} />
                    <div className="w-2/3 h-1 rounded" style={{ backgroundColor: `${accent}20` }} />
                  </div>
                  <p className={cn(
                    'text-xs font-inter font-medium text-center',
                    isActive ? 'text-warm-800' : 'text-warm-600'
                  )}>
                    {t.name}
                  </p>
                  {isActive && (
                    <motion.div
                      layoutId="theme-active-ring"
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{ boxShadow: `0 0 0 2px ${accent}40` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* ====== FONT PREFERENCES ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
          className="card-planner"
        >
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-rose-500" />
            <h2 className="font-playfair text-xl font-medium text-warm-800">Font Preferences</h2>
          </div>

          {/* Font size */}
          <h3 className="font-inter text-sm font-semibold text-warm-700 mb-3">Font Size</h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {([
              { key: 'compact' as const, label: 'Compact', desc: 'More content on screen', size: '0.875rem' },
              { key: 'default' as const, label: 'Default', desc: 'Balanced', size: '1rem' },
              { key: 'large' as const, label: 'Large', desc: 'Easier to read', size: '1.125rem' },
            ]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => updateSetting('fontSize', opt.key)}
                className={cn(
                  'p-4 rounded-md border-2 text-left transition-all duration-200',
                  settings.fontSize === opt.key
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-warm-200 bg-white hover:border-warm-300'
                )}
              >
                <p className={cn('font-inter font-medium text-warm-800 mb-1')} style={{ fontSize: opt.size }}>
                  {opt.label}
                </p>
                <p className="text-xs text-warm-500 font-inter">{opt.desc}</p>
              </button>
            ))}
          </div>

          {/* Handwriting font toggle */}
          <h3 className="font-inter text-sm font-semibold text-warm-700 mb-3">Handwriting Font</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateSetting('handwritingFont', true)}
              className={cn(
                'flex-1 p-4 rounded-md border-2 text-center transition-all duration-200',
                settings.handwritingFont
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-warm-200 bg-white hover:border-warm-300'
              )}
            >
              <p className="font-caveat text-lg text-warm-800">Caveat</p>
              <p className="text-xs text-warm-500 font-inter mt-1">Elegant handwriting</p>
            </button>
            <button
              onClick={() => updateSetting('handwritingFont', false)}
              className={cn(
                'flex-1 p-4 rounded-md border-2 text-center transition-all duration-200',
                !settings.handwritingFont
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-warm-200 bg-white hover:border-warm-300'
              )}
            >
              <p className="font-inter text-lg text-warm-800">System</p>
              <p className="text-xs text-warm-500 font-inter mt-1">Standard cursive</p>
            </button>
          </div>
        </motion.div>

        {/* ====== LAYOUT PREFERENCES ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.24 }}
          className="card-planner"
        >
          <div className="flex items-center gap-2 mb-4">
            <LayoutIcon className="w-5 h-5 text-rose-500" />
            <h2 className="font-playfair text-xl font-medium text-warm-800">Layout Preferences</h2>
          </div>

          <div className="space-y-4">
            {/* Week start */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-warm-500" />
                <span className="font-inter text-sm text-warm-700">Week starts on</span>
              </div>
              <ToggleGroup
                options={[
                  { key: 'sunday' as const, label: 'Sunday' },
                  { key: 'monday' as const, label: 'Monday' },
                ]}
                value={settings.weekStart}
                onChange={(v) => updateSetting('weekStart', v)}
              />
            </div>

            {/* Time format */}
            <div className="flex items-center justify-between py-2 border-t border-warm-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warm-500" />
                <span className="font-inter text-sm text-warm-700">Time format</span>
              </div>
              <ToggleGroup
                options={[
                  { key: '12h' as const, label: '12-hour' },
                  { key: '24h' as const, label: '24-hour' },
                ]}
                value={settings.timeFormat}
                onChange={(v) => updateSetting('timeFormat', v)}
              />
            </div>

            {/* Default landing page */}
            <div className="flex items-center justify-between py-2 border-t border-warm-100">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-warm-500" />
                <span className="font-inter text-sm text-warm-700">Default page</span>
              </div>
              <select
                value={settings.defaultPage}
                onChange={(e) => updateSetting('defaultPage', e.target.value)}
                className="px-3 py-1.5 rounded-md border border-warm-200 bg-white text-warm-700 font-inter text-xs focus:outline-none focus:border-rose-400"
              >
                <option value="/planner">Dashboard</option>
                <option value="/planner/daily/today">Daily Planner</option>
                <option value="/planner/monthly/0">Monthly Calendar</option>
                <option value="/planner/weekly/current">Weekly Spread</option>
                <option value="/planner/notes">Notes</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* ====== DATA MANAGEMENT ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.32 }}
          className="card-planner"
        >
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-rose-500" />
            <h2 className="font-playfair text-xl font-medium text-warm-800">Data Management</h2>
          </div>

          <div className="space-y-6">
            {/* Export */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Download className="w-4 h-4 text-warm-500" />
                  <h3 className="font-inter text-sm font-semibold text-warm-700">Export Your Data</h3>
                </div>
                <p className="text-warm-500 font-inter text-xs">Download a backup of all your planner data as a JSON file.</p>
                {lastBackup && (
                  <p className="text-warm-400 font-inter text-xs mt-1">Last backup: {formattedBackupDate}</p>
                )}
              </div>
              <button onClick={exportData} className="btn-primary text-sm shrink-0">
                <Download className="w-4 h-4 mr-2 inline" />
                Export
              </button>
            </div>

            {/* Import */}
            <div className="flex items-start justify-between gap-4 pt-4 border-t border-warm-100">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Upload className="w-4 h-4 text-warm-500" />
                  <h3 className="font-inter text-sm font-semibold text-warm-700">Import Data</h3>
                </div>
                <p className="text-warm-500 font-inter text-xs">Restore your planner from a backup file.</p>
                <p className="text-warning font-inter text-xs mt-1">This will overwrite existing data.</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-sm shrink-0"
              >
                <Upload className="w-4 h-4 mr-2 inline" />
                Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Reset */}
            <div className="flex items-start justify-between gap-4 pt-4 border-t border-warm-100">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-error" />
                  <h3 className="font-inter text-sm font-semibold text-warm-700">Reset Planner</h3>
                </div>
                <p className="text-warm-500 font-inter text-xs">Clear all data and start fresh. This cannot be undone.</p>
              </div>
              <button
                onClick={() => setShowResetModal(true)}
                className="btn-danger text-sm shrink-0"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </motion.div>

        {/* ====== ABOUT ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 }}
          className="card-planner"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-rose-500" />
            <h2 className="font-playfair text-xl font-medium text-warm-800">About</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg font-medium text-warm-800 mb-1">Sacred Living Planner</h3>
              <p className="text-warm-500 font-inter text-sm">
                Inspired by The Dailee&apos;s premium digital planners. Designed for daily use, built for your browser.
              </p>
              <p className="text-warm-400 font-inter text-xs mt-2">Version 1.0</p>
            </div>

            {/* Keyboard shortcuts */}
            <div className="pt-4 border-t border-warm-100">
              <h3 className="font-inter text-sm font-semibold text-warm-700 mb-3">Keyboard Shortcuts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { keys: 'Ctrl/Cmd + K', desc: 'Quick search' },
                  { keys: 'N', desc: 'New task / note' },
                  { keys: '← / →', desc: 'Previous / next day' },
                  { keys: 'T', desc: 'Jump to today' },
                  { keys: 'S', desc: 'Open settings' },
                  { keys: '?', desc: 'Show help' },
                ].map((shortcut) => (
                  <div key={shortcut.keys} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-warm-800 bg-warm-100 px-2 py-1 rounded">
                      {shortcut.keys}
                    </span>
                    <span className="text-sm font-inter text-warm-600">{shortcut.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Print guide */}
            <div className="pt-4 border-t border-warm-100">
              <h3 className="font-inter text-sm font-semibold text-warm-700 mb-2">Print Your Planner</h3>
              <p className="text-warm-500 font-inter text-xs">
                Any page can be printed. Use your browser&apos;s print function (Ctrl/Cmd + P) for a clean, planner-optimized layout.
              </p>
              <ul className="text-warm-500 font-inter text-xs mt-2 space-y-1 list-disc list-inside">
                <li>Daily pages print as a single day view</li>
                <li>Monthly calendars fit on one page</li>
                <li>Notes pages print with their lines/grid</li>
                <li>Use &quot;Save as PDF&quot; for a digital copy</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-warm-100">
              <a
                href="https://the-dailee.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-rose-600 font-inter font-medium hover:underline"
              >
                Visit The Dailee
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>

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
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg max-w-[460px] w-full mx-4 p-8 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-error" />
                </div>
                <h3 className="font-playfair text-xl font-medium text-warm-900">Are you sure?</h3>
              </div>
              <p className="text-warm-600 font-inter text-sm mb-4">
                This will permanently delete all your planner data including notes, goals, budget entries, habits, and settings. This action cannot be undone.
              </p>
              <p className="text-warm-500 font-inter text-xs mb-2">
                Type <strong className="text-warm-700">DELETE</strong> to confirm:
              </p>
              <input
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-3 py-2 rounded-md border border-warm-200 text-sm font-inter text-warm-800 placeholder:text-warm-400 focus:outline-none focus:border-rose-400 mb-6"
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowResetModal(false)} className="btn-secondary text-sm px-4 py-2">
                  Cancel
                </button>
                <button
                  onClick={resetAll}
                  disabled={resetConfirm !== 'DELETE'}
                  className={cn(
                    'text-sm px-4 py-2 rounded-md font-inter font-medium transition-all duration-200',
                    resetConfirm === 'DELETE'
                      ? 'bg-error text-white hover:brightness-90'
                      : 'bg-warm-100 text-warm-400 cursor-not-allowed'
                  )}
                >
                  Delete All
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
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Toggle Group                                                       */
/* ------------------------------------------------------------------ */

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded-md border border-warm-200 overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            'px-3 py-1.5 text-xs font-inter font-medium transition-all duration-200',
            value === opt.key
              ? 'bg-rose-500 text-white'
              : 'bg-white text-warm-600 hover:bg-warm-50'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
