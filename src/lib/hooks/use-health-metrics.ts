import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useHealthMetrics(date: string) {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    const fetchMetrics = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      
      const { data } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .single()
      
      setMetrics(data)
      setLoading(false)
    }
    
    fetchMetrics()
  }, [date])

  return { metrics, loading }
}
