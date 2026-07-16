import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDailyEntry(date: string) {
  const [entry, setEntry] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    const fetchEntry = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      
      const { data } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .single()
      
      setEntry(data)
      setLoading(false)
    }
    
    fetchEntry()
  }, [date])

  return { entry, loading }
}
