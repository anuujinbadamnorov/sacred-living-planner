import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export default function ReflectionIndexPage() {
  const currentMonth = format(new Date(), 'MMMM').toLowerCase()
  redirect(`/planner/reflection/${currentMonth}`)
}
