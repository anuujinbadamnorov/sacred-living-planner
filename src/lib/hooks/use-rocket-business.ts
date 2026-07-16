import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRocketBusiness() {
  const [income, setIncome] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      
      const [{ data: incomeData }, { data: expensesData }] = await Promise.all([
        supabase.from('business_income').select('*').eq('user_id', user.id),
        supabase.from('business_expenses').select('*').eq('user_id', user.id)
      ])
      
      setIncome(incomeData || [])
      setExpenses(expensesData || [])
      setLoading(false)
    }
    
    fetchData()
  }, [])

  return { income, expenses, loading }
}
