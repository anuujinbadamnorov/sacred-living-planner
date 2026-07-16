import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface DailyEntryData {
  events: { id: string; title: string; hour: number; minute: number }[]
  habits_completed: string[]
  mood: string
  gratitude: string
  water_intake: number
  focus: string
  priorities: string[]
  tasks: { id: string; text: string; completed: boolean }[]
}

const defaultData: DailyEntryData = {
  events: [],
  habits_completed: [],
  mood: '',
  gratitude: '',
  water_intake: 0,
  focus: '',
  priorities: ['', '', ''],
  tasks: [],
}

function getLocalStorageKey(date: string) {
  return `planner-daily-${date}`
}

function loadFromLocal(date: string): DailyEntryData {
  if (typeof window === 'undefined') return defaultData
  try {
    const raw = window.localStorage.getItem(getLocalStorageKey(date))
    if (raw) return { ...defaultData, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return defaultData
}

function saveToLocal(date: string, data: DailyEntryData) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(getLocalStorageKey(date), JSON.stringify(data))
  } catch { /* ignore */ }
}

export function useDailyEntrySupabase(date: string) {
  const [data, setData] = useState<DailyEntryData>(defaultData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Load from Supabase or localStorage
  useEffect(() => {
    const supabase = createClient()
    
    const load = async () => {
      setLoading(true)
      
      // Always start with localStorage for instant UI
      const local = loadFromLocal(date)
      setData(local)
      
      // Then try to fetch from Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: entry } = await supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', date)
          .single()
        
        if (entry) {
          const merged: DailyEntryData = {
            events: entry.events || [],
            habits_completed: entry.habits_completed || [],
            mood: entry.mood || '',
            gratitude: entry.gratitude || '',
            water_intake: entry.water_intake || 0,
            focus: local.focus, // keep local focus
            priorities: local.priorities, // keep local priorities
            tasks: local.tasks, // keep local tasks
          }
          setData(merged)
          saveToLocal(date, merged)
        }
      }
      
      setLoading(false)
    }
    
    load()
  }, [date])

  // Save to Supabase + localStorage
  const save = useCallback(async (updates: Partial<DailyEntryData>) => {
    const newData = { ...data, ...updates }
    setData(newData)
    saveToLocal(date, newData)
    
    if (!userId) return // not logged in, skip Supabase
    
    setSaving(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('daily_entries')
      .upsert({
        user_id: userId,
        date,
        events: newData.events,
        habits_completed: newData.habits_completed,
        mood: newData.mood,
        gratitude: newData.gratitude,
        water_intake: newData.water_intake,
      }, { onConflict: 'user_id,date' })
    
    if (error) {
      console.error('Failed to save daily entry:', error)
    }
    
    setSaving(false)
  }, [data, date, userId])

  return { data, loading, saving, save, setData }
}
