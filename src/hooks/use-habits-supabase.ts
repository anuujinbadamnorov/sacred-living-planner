import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Habit {
  id: string
  name: string
  color: string
  icon: string
  active: boolean
}

export function useHabitsSupabase() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    
    const load = async () => {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .order('created_at', { ascending: true })
        
        if (data && data.length > 0) {
          setHabits(data.map(h => ({
            id: h.id,
            name: h.name,
            color: h.color || '#E85D78',
            icon: h.icon || '',
            active: h.active !== false,
          })))
        } else {
          // Fallback: create default habits
          const defaults = [
            { name: 'Morning Meditation', color: '#7A8B65', icon: 'sun' },
            { name: 'Gratitude Journal', color: '#D4A76A', icon: 'heart' },
            { name: 'Water (8 glasses)', color: '#6B8F9A', icon: 'droplet' },
            { name: 'Movement', color: '#E85D78', icon: 'flame' },
            { name: 'Read', color: '#B5A642', icon: 'book' },
          ]
          
          for (const h of defaults) {
            await supabase.from('habits').insert({
              user_id: user.id,
              name: h.name,
              color: h.color,
              icon: h.icon,
              active: true,
            })
          }
          
          // Reload
          const { data: refreshed } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', user.id)
            .eq('active', true)
            .order('created_at', { ascending: true })
          
          if (refreshed) {
            setHabits(refreshed.map(h => ({
              id: h.id,
              name: h.name,
              color: h.color || '#E85D78',
              icon: h.icon || '',
              active: h.active !== false,
            })))
          }
        }
      }
      
      setLoading(false)
    }
    
    load()
  }, [])

  const toggleHabit = useCallback(async (habitId: string, date: string) => {
    if (!userId) return
    
    const supabase = createClient()
    
    // Check if already completed
    const { data: existing } = await supabase
      .from('habit_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .eq('completed_date', date)
      .single()
    
    if (existing) {
      // Remove completion
      await supabase
        .from('habit_completions')
        .delete()
        .eq('id', existing.id)
    } else {
      // Add completion
      await supabase
        .from('habit_completions')
        .insert({
          user_id: userId,
          habit_id: habitId,
          completed_date: date,
        })
    }
  }, [userId])

  const addHabit = useCallback(async (name: string, color: string = '#E85D78') => {
    if (!userId) return
    
    const supabase = createClient()
    const { data } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name,
        color,
        active: true,
      })
      .select()
      .single()
    
    if (data) {
      setHabits(prev => [...prev, {
        id: data.id,
        name: data.name,
        color: data.color || '#E85D78',
        icon: data.icon || '',
        active: true,
      }])
    }
  }, [userId])

  return { habits, loading, toggleHabit, addHabit }
}
