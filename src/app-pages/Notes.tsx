import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSection from '@/components/HeroSection'
import {
  FileText,
  Plus,
  Search,
  Trash2,
  ArrowLeft,
  Type,
  LayoutList,
  BrainCircuit,
  Check,
  PenTool,
  Eraser,
  Download,
  FolderOpen,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type NoteType = 'lined' | 'blank' | 'checklist' | 'braindump'

interface Note {
  id: string
  title: string
  content: string
  type: NoteType
  tags: string[]
  createdAt: string
  updatedAt: string
}

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                    */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'planner-notes'
const WHITEBOARD_KEY = 'planner-whiteboard'

function loadNotes(): Note[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* */ }
  return []
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

const TYPE_LABELS: Record<NoteType, string> = {
  lined: 'Lined',
  blank: 'Blank',
  checklist: 'Checklist',
  braindump: 'Brain Dump',
}

const TYPE_ICONS: Record<NoteType, React.ElementType> = {
  lined: Type,
  blank: FileText,
  checklist: LayoutList,
  braindump: BrainCircuit,
}

/* Pre-populated document names */
const SACRED_DOCUMENTS = [
  'Birth Chart',
  'Human Design Chart',
  'Gene Keys Profile',
  'Moon Journal',
  'Dream Log',
  'Meditation Notes',
  'Therapy Insights',
  'Book Notes',
]

/* ------------------------------------------------------------------ */
/*  Whiteboard Component                                               */
/* ------------------------------------------------------------------ */

function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushColor, setBrushColor] = useState('#2C2420')
  const [brushSize, setBrushSize] = useState(3)

  const colors = [
    { name: 'Espresso', value: '#2C2420' },
    { name: 'Rose', value: '#C9A0A0' },
    { name: 'Sage', value: '#7A8B65' },
    { name: 'Gold', value: '#C9A96E' },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Load saved drawing
    const saved = localStorage.getItem(WHITEBOARD_KEY)
    if (saved) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = saved
    }
  }, [])

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.strokeStyle = brushColor
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      localStorage.setItem(WHITEBOARD_KEY, canvas.toDataURL())
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    localStorage.removeItem(WHITEBOARD_KEY)
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `whiteboard-${format(new Date(), 'yyyy-MM-dd')}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="rounded-xl p-8" style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}>
      <HeroSection
        title={`Sacred Notes`}
        subtitle="Your thoughts, captured in elegance"
        imageIndex={18}
      />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PenTool className="w-5 h-5" style={{ color: 'var(--sage)' }} />
          <h3 className="font-display text-lg" style={{ color: 'var(--espresso)' }}>Whiteboard</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Color picker */}
          <div className="flex items-center gap-1 mr-2">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => setBrushColor(c.value)}
                className="w-6 h-6 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: c.value,
                  borderColor: brushColor === c.value ? 'var(--espresso)' : 'transparent',
                  transform: brushColor === c.value ? 'scale(1.2)' : 'scale(1)',
                }}
                title={c.name}
              />
            ))}
          </div>
          {/* Brush size */}
          <input
            type="range"
            min={1}
            max={20}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20"
          />
          <button
            onClick={clearCanvas}
            className="p-2 rounded-md transition-colors"
            style={{ color: 'var(--rose-soft)' }}
            title="Clear"
          >
            <Eraser className="w-4 h-4" />
          </button>
          <button
            onClick={downloadCanvas}
            className="p-2 rounded-md transition-colors"
            style={{ color: 'var(--espresso-muted)' }}
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        className="w-full rounded-lg cursor-crosshair"
        style={{ background: '#FAFAF8', touchAction: 'none' }}
      />
      <p className="font-body text-xs mt-2" style={{ color: 'var(--espresso-muted)' }}>
        Draw freely with your mouse or finger. Changes auto-save.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Documents Component                                                */
/* ------------------------------------------------------------------ */

function SacredDocuments() {
  return (
    <div className="rounded-xl p-8" style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}>
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen className="w-5 h-5" style={{ color: 'var(--gold)' }} />
        <h3 className="font-display text-lg" style={{ color: 'var(--espresso)' }}>Sacred Documents</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SACRED_DOCUMENTS.map((doc) => (
          <motion.div
            key={doc}
            whileHover={{ y: -2 }}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:shadow-sm"
            style={{ background: 'var(--cream)', border: '1px solid var(--border-light)' }}
          >
            <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--espresso-muted)' }} />
            <span className="font-body text-sm" style={{ color: 'var(--espresso)' }}>{doc}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<NoteType | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')

  useEffect(() => { saveNotes(notes) }, [notes])

  const editingNote = useMemo(() => notes.find((n) => n.id === editingNoteId) || null, [notes, editingNoteId])

  /* Create new note */
  const createNote = (type: NoteType) => {
    const note: Note = {
      id: `n${Date.now()}`,
      title: '',
      content: '',
      type,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes((prev) => [note, ...prev])
    setEditingNoteId(note.id)
  }

  /* Update note */
  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) => prev.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    ))
  }, [])

  /* Delete note */
  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    if (editingNoteId === id) setEditingNoteId(null)
  }

  /* Filtered notes */
  const filteredNotes = useMemo(() => {
    let result = [...notes]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((n) =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      )
    }
    if (filterType !== 'all') {
      result = result.filter((n) => n.type === filterType)
    }
    if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } else {
      result.sort((a, b) => a.title.localeCompare(b.title))
    }
    return result
  }, [notes, searchQuery, filterType, sortBy])

  /* If editing, show editor */
  if (editingNote && editingNoteId) {
    return (
      <NoteEditor
        note={editingNote}
        onBack={() => setEditingNoteId(null)}
        onUpdate={(updates) => updateNote(editingNoteId, updates)}
        onDelete={() => deleteNote(editingNoteId)}
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
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7" style={{ color: 'var(--rose-soft)' }} />
            <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)]" style={{ color: 'var(--espresso)' }}>Notes</h1>
          </div>
          <p className="font-body text-sm mt-1" style={{ color: 'var(--espresso-muted)' }}>A place for every thought.</p>
        </motion.div>

        {/* ====== WHITEBOARD ====== */}
        <Whiteboard />

        {/* ====== SACRED DOCUMENTS ====== */}
        <SacredDocuments />

        {/* ====== SEARCH & FILTER BAR ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--espresso-muted)' }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your notes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md font-body text-sm placeholder:text-sm focus:outline-none focus:ring-2 transition-all"
              style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)', color: 'var(--espresso)' }}
            />
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'lined', 'blank', 'checklist', 'braindump'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={cn(
                  'px-3 py-2 rounded-md text-xs font-body font-medium transition-all duration-200',
                  filterType === t
                    ? 'text-white'
                    : 'hover:opacity-80'
                )}
                style={
                  filterType === t
                    ? { background: 'var(--sage)', color: '#fff' }
                    : { background: 'var(--cream-dark)', color: 'var(--espresso-light)', border: '1px solid var(--border-light)' }
                }
              >
                {t === 'all' ? 'All' : TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
            className="px-3 py-2.5 rounded-md font-body text-xs focus:outline-none transition-all"
            style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)', color: 'var(--espresso)' }}
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>
        </motion.div>

        {/* New Note buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="flex gap-2 flex-wrap"
        >
          <span className="text-sm font-body self-center mr-2" style={{ color: 'var(--espresso-muted)' }}>New:</span>
          {(['lined', 'blank', 'checklist', 'braindump'] as const).map((type) => {
            const Icon = TYPE_ICONS[type]
            return (
              <button
                key={type}
                onClick={() => createNote(type)}
                className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm transition-all duration-200"
                style={{ background: 'var(--cream-dark)', color: 'var(--espresso)', border: '1px solid var(--border-light)' }}
              >
                <Icon className="w-4 h-4" style={{ color: 'var(--espresso-muted)' }} />
                {TYPE_LABELS[type]}
              </button>
            )
          })}
        </motion.div>

        {/* ====== NOTES GRID ====== */}
        {filteredNotes.length === 0 ? (
          <EmptyState onCreate={() => createNote('blank')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredNotes.map((note, idx) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                  onClick={() => setEditingNoteId(note.id)}
                  className="cursor-pointer overflow-hidden rounded-xl p-0 transition-all hover:shadow-md"
                  style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
                >
                  {/* Preview area */}
                  <div className="h-[140px] p-4 overflow-hidden relative" style={{ background: 'var(--cream)' }}>
                    {note.type === 'lined' && (
                      <div
                        className="absolute inset-0 p-4"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(transparent, transparent 19px, var(--border-light) 19px, var(--border-light) 20px)',
                          backgroundPosition: '0 12px',
                        }}
                      >
                        <p className="font-handwriting text-sm line-clamp-4 leading-5" style={{ color: 'var(--espresso-light)' }}>
                          {note.content || <span className="italic" style={{ color: 'var(--espresso-muted)' }}>Empty note...</span>}
                        </p>
                      </div>
                    )}
                    {note.type === 'blank' && (
                      <p className="font-body text-sm line-clamp-4" style={{ color: 'var(--espresso-light)' }}>
                        {note.content || <span className="italic" style={{ color: 'var(--espresso-muted)' }}>Empty note...</span>}
                      </p>
                    )}
                    {note.type === 'checklist' && (
                      <div className="space-y-1">
                        {note.content ? (
                          note.content.split('\n').filter(Boolean).slice(0, 4).map((line, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className={cn(
                                'w-3 h-3 rounded-sm border shrink-0',
                                line.startsWith('[x]') ? 'bg-rose-500 border-rose-500' : 'border-warm-300'
                              )} style={!line.startsWith('[x]') ? { borderColor: 'var(--border-medium)' } : {}} />
                              <span className={cn(
                                'text-xs font-body truncate',
                                line.startsWith('[x]') ? 'line-through' : ''
                              )} style={line.startsWith('[x]') ? { color: 'var(--espresso-muted)' } : { color: 'var(--espresso-light)' }}>
                                {line.replace(/^\[[ x]\]\s*/, '')}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="italic text-sm" style={{ color: 'var(--espresso-muted)' }}>Empty checklist...</span>
                        )}
                      </div>
                    )}
                    {note.type === 'braindump' && (
                      <div
                        className="h-full"
                        style={{
                          backgroundImage: 'radial-gradient(circle, var(--border-medium) 1px, transparent 1px)',
                          backgroundSize: '20px 20px',
                          opacity: 0.08,
                        }}
                      >
                        <p className="font-handwriting text-sm line-clamp-4 relative z-10" style={{ color: 'var(--espresso-light)' }}>
                          {note.content || <span className="italic" style={{ color: 'var(--espresso-muted)' }}>Empty brain dump...</span>}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4" style={{ borderTop: '1px solid var(--border-light)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-body text-sm font-medium truncate" style={{ color: 'var(--espresso)' }}>
                        {note.title || 'Untitled Note'}
                      </h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }}
                        className="p-1 rounded-md transition-colors shrink-0 ml-2 hover:bg-rose-100"
                        style={{ color: 'var(--espresso-muted)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-body" style={{ color: 'var(--espresso-muted)' }}>
                      {(() => { const Icon = TYPE_ICONS[note.type]; return <Icon className="w-3 h-3" /> })()}
                      <span>{TYPE_LABELS[note.type]}</span>
                      <span>·</span>
                      <span>{format(new Date(note.updatedAt), 'MMM d')}</span>
                    </div>
                    {note.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[0.625rem] font-body px-2 py-0.5 rounded-full" style={{ background: 'var(--cream)', color: 'var(--espresso-light)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl text-center py-16"
      style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-light)' }}
    >
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(201,160,160,0.15)' }}>
        <FileText className="w-10 h-10" style={{ color: 'var(--rose-soft)' }} />
      </div>
      <h3 className="font-display text-xl mb-2" style={{ color: 'var(--espresso)' }}>No notes yet.</h3>
      <p className="font-body text-sm mb-6" style={{ color: 'var(--espresso-muted)' }}>Start writing your first note.</p>
      <button
        onClick={onCreate}
        className="px-4 py-2 rounded-md font-body text-sm font-medium text-white transition-all"
        style={{ background: 'var(--sage)' }}
      >
        <Plus className="w-4 h-4 mr-2 inline" />
        Create Note
      </button>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Note Editor                                                        */
/* ------------------------------------------------------------------ */

function NoteEditor({
  note,
  onBack,
  onUpdate,
  onDelete,
}: {
  note: Note
  onBack: () => void
  onUpdate: (updates: Partial<Note>) => void
  onDelete: () => void
}) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [noteType, setNoteType] = useState<NoteType>(note.type)
  const [lastSaved, setLastSaved] = useState('Saved')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  /* Sync from note prop (when type changes from outside) */
  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setNoteType(note.type)
  }, [note.id])

  /* Auto-save */
  const triggerSave = useCallback(() => {
    setLastSaved('Saving...')
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      onUpdate({ title, content, type: noteType })
      setLastSaved('Saved')
    }, 500)
  }, [title, content, noteType, onUpdate])

  useEffect(() => {
    triggerSave()
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current) }
  }, [title, content, noteType, triggerSave])

  const handleContentChange = (val: string) => {
    setContent(val)
  }

  /* Toggle checklist item */
  const toggleCheckItem = (lineIndex: number) => {
    const lines = content.split('\n')
    if (lineIndex >= lines.length) return
    const line = lines[lineIndex]
    if (line.startsWith('[x] ')) {
      lines[lineIndex] = line.replace(/^\[x\] /, '[ ] ')
    } else if (line.startsWith('[ ] ')) {
      lines[lineIndex] = line.replace(/^\[ \] /, '[x] ')
    }
    setContent(lines.join('\n'))
  }

  /* Handle checklist key events */
  const handleChecklistKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const textarea = e.currentTarget
      const cursorPos = textarea.selectionStart
      const before = content.slice(0, cursorPos)
      const after = content.slice(cursorPos)
      const insert = '\n[ ] '
      setContent(before + insert + after)
      requestAnimationFrame(() => {
        const newPos = cursorPos + insert.length
        textarea.setSelectionRange(newPos, newPos)
        textarea.focus()
      })
    }
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length
  const charCount = content.length

  const switchType = (newType: NoteType) => {
    setNoteType(newType)
    onUpdate({ type: newType })
  }

  return (
    <>
      <div className="h-[calc(100dvh-3.5rem)] flex flex-col -mx-6 -mt-6 -mb-8">
        {/* Editor toolbar */}
        <div className="flex items-center gap-4 px-6 py-3 shrink-0" style={{ background: 'var(--cream-dark)', borderBottom: '1px solid var(--border-light)' }}>
          <button
            onClick={onBack}
            className="p-2 rounded-md transition-colors"
            style={{ color: 'var(--espresso-light)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Note"
            className="flex-1 font-display text-lg bg-transparent border-none focus:outline-none focus:ring-0"
            style={{ color: 'var(--espresso)' }}
          />

          {/* Template toggle */}
          <div className="flex items-center gap-1 rounded-md p-0.5" style={{ background: 'var(--cream)' }}>
            {(['lined', 'blank', 'checklist', 'braindump'] as const).map((t) => {
              const Icon = TYPE_ICONS[t]
              return (
                <button
                  key={t}
                  onClick={() => switchType(t)}
                  title={TYPE_LABELS[t]}
                  className={cn(
                    'p-1.5 rounded transition-all duration-200',
                    noteType === t ? 'shadow-sm' : ''
                  )}
                  style={noteType === t ? { background: 'var(--cream-dark)', color: 'var(--sage)' } : { color: 'var(--espresso-muted)' }}
                >
                  <Icon className="w-4 h-4" />
                </button>
              )
            })}
          </div>

          <button
            onClick={onDelete}
            className="p-2 rounded-md transition-colors"
            style={{ color: 'var(--espresso-muted)' }}
            title="Delete note"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <span className="text-xs font-body hidden sm:block" style={{ color: 'var(--espresso-muted)' }}>{lastSaved}</span>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto" style={{ background: 'var(--cream)' }}>
          {noteType === 'checklist' ? (
            <ChecklistEditor content={content} onChange={setContent} onToggleItem={toggleCheckItem} onKeyDown={handleChecklistKeyDown} />
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={
                noteType === 'lined' ? 'Start writing...' :
                noteType === 'braindump' ? 'What\'s on your mind?\nWhat are you worried about?\nWhat are you excited about?\n\n'
                : 'A blank canvas for your thoughts...'
              }
              className={cn(
                'w-full min-h-full p-6 resize-none focus:outline-none',
                noteType === 'lined' || noteType === 'braindump' ? 'font-handwriting' : 'font-body text-base',
              )}
              style={{
                color: 'var(--espresso)',
                ...(noteType === 'lined'
                  ? {
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--border-light) 31px, var(--border-light) 32px)',
                      lineHeight: '32px',
                      backgroundPosition: '0 20px',
                    }
                  : noteType === 'braindump'
                    ? {
                        backgroundImage: 'radial-gradient(circle, var(--border-medium) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        lineHeight: '1.8',
                      }
                    : { lineHeight: '1.8' }),
              }}
            />
          )}
        </div>

        {/* Bottom info bar */}
        <div className="flex items-center justify-between px-6 py-2 shrink-0 text-xs font-body" style={{ background: 'var(--cream-dark)', borderTop: '1px solid var(--border-light)', color: 'var(--espresso-muted)' }}>
          <span>{wordCount} words · {charCount} characters</span>
          <span>Created {format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
          <span className="flex items-center gap-1">
            {(() => { const Icon = TYPE_ICONS[noteType]; return <Icon className="w-3 h-3" /> })()}
            {TYPE_LABELS[noteType]}
          </span>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Checklist Editor                                                   */
/* ------------------------------------------------------------------ */

function ChecklistEditor({
  content,
  onChange,
  onToggleItem,
  onKeyDown,
}: {
  content: string
  onChange: (val: string) => void
  onToggleItem: (index: number) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}) {
  const lines = content.split('\n')
  const unchecked = lines.filter((l) => l.startsWith('[ ] '))
  const checked = lines.filter((l) => l.startsWith('[x] '))
  const other = lines.filter((l) => !l.startsWith('[ ] ') && !l.startsWith('[x] ') && l.trim())

  return (
    <div className="p-6 space-y-1 min-h-full" style={{ background: 'var(--cream)' }}>
      {/* Unchecked items */}
      {unchecked.map((line) => {
        const globalIndex = lines.indexOf(line)
        return (
          <CheckItem
            key={globalIndex}
            text={line.replace(/^\[ \] /, '')}
            checked={false}
            onToggle={() => onToggleItem(globalIndex)}
          />
        )
      })}

      {/* Other (non-checkbox) lines */}
      {other.map((line) => {
        const globalIndex = lines.indexOf(line)
        return (
          <div key={globalIndex} className="py-1 pl-7 font-body text-sm" style={{ color: 'var(--espresso-light)' }}>
            {line}
          </div>
        )
      })}

      {/* Completed section */}
      {checked.length > 0 && (
        <>
          <div className="pt-4 pb-2">
            <span className="text-xs font-body font-medium uppercase tracking-wide" style={{ color: 'var(--espresso-muted)' }}>Completed</span>
          </div>
          {checked.map((line) => {
            const globalIndex = lines.indexOf(line)
            return (
              <CheckItem
                key={globalIndex}
                text={line.replace(/^\[x\] /, '')}
                checked={true}
                onToggle={() => onToggleItem(globalIndex)}
              />
            )
          })}
        </>
      )}

      {/* Empty state with first checkbox */}
      {unchecked.length === 0 && checked.length === 0 && other.length === 0 && (
        <button
          onClick={() => onChange('[ ] ')}
          className="flex items-center gap-3 py-2 transition-colors"
          style={{ color: 'var(--espresso-muted)' }}
        >
          <div className="w-[18px] h-[18px] rounded-[3px] border-[1.5px]" style={{ borderColor: 'var(--border-medium)' }} />
          <span className="text-sm font-body italic">Click to add your first item...</span>
        </button>
      )}

      {/* Hidden textarea for keyboard handling */}
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="absolute opacity-0 w-1 h-1 -z-10"
        aria-hidden="true"
      />
    </div>
  )
}

function CheckItem({ text, checked, onToggle }: { text: string; checked: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      className="flex items-center gap-3 py-1.5 w-full text-left group"
      whileTap={{ scale: 0.99 }}
    >
      <div
        className={cn(
          'w-[18px] h-[18px] rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200',
        )}
        style={
          checked
            ? { background: 'var(--sage)', borderColor: 'var(--sage)' }
            : { background: 'var(--cream)', borderColor: 'var(--border-medium)' }
        }
      >
        {checked && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </div>
      <span className={cn(
        'text-sm font-body flex-1 transition-all duration-200',
      )} style={checked ? { color: 'var(--espresso-muted)', textDecoration: 'line-through', textDecorationColor: 'var(--rose-soft)' } : { color: 'var(--espresso)' }}>
        {text}
      </span>
    </motion.button>
  )
}
