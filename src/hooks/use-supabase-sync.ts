import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Syncs localStorage planner data to Supabase when user is logged in.
 * This is a background sync — the UI continues to use localStorage for speed.
 */
export function useSupabaseSync() {
  const syncRef = useRef(false)
  
  useEffect(() => {
    if (syncRef.current) return
    syncRef.current = true
    
    const sync = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // Get all localStorage keys that start with 'planner-'
      if (typeof window === 'undefined') return
      const keys = Object.keys(window.localStorage).filter(k => k.startsWith('planner-'))
      
      for (const key of keys) {
        try {
          const raw = window.localStorage.getItem(key)
          if (!raw) continue
          
          // Extract date from key: 'planner-daily-2026-07-16' or 'planner-events-2026-07-16'
          const match = key.match(/planner-(\w+)-(\d{4}-\d{2}-\d{2})/)
          if (!match) continue
          
          const type = match[1] // 'daily', 'events', 'mood', etc.
          const date = match[2]
          const value = JSON.parse(raw)
          
          if (type === 'daily') {
            await supabase.from('daily_entries').upsert({
              user_id: user.id,
              date,
              events: value.events || [],
              habits_completed: value.habits_completed || [],
              mood: value.mood || '',
              gratitude: value.gratitude || '',
              water_intake: value.water_intake || 0,
            }, { onConflict: 'user_id,date' })
          }
        } catch (e) {
          console.error('Sync error for key', key, e)
        }
      }
      
      console.log('Supabase sync complete for', keys.length, 'entries')
    }
    
    // Sync every 30 seconds when user is active
    const interval = setInterval(sync, 30000)
    
    // Also sync on page unload
    const handleBeforeUnload = () => {
      sync()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Initial sync after 5 seconds
    setTimeout(sync, 5000)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])
}
