'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const MONTH_NAMES = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const now = new Date()
    const monthName = MONTH_NAMES[now.getMonth()]
    router.replace(`/planner/reflection/${monthName}`)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-warm-500">Loading reflection...</p>
    </div>
  )
}
