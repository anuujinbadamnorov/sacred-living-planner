import { redirect } from 'next/navigation'

export default function HealthPageRedirect() {
  redirect('/planner/oura')
}
