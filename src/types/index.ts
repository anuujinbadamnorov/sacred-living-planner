export interface DailyEntry {
  id: string
  user_id: string
  date: string
  events: { id: string; time: string; label: string; completed: boolean }[]
  habits_completed: string[]
  mood: string
  gratitude: string
  water_intake: number
  created_at: string
  updated_at: string
}

export interface HealthMetric {
  id: string
  user_id: string
  date: string
  sleep_score: number
  readiness_score: number
  activity_score: number
  steps: number
  hrv: number
  resting_hr: number
  deep_sleep: number
  rem_sleep: number
  total_sleep: number
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  active: boolean
  created_at: string
}

export interface Workout {
  id: string
  user_id: string
  date: string
  day_type: string
  exercises: { name: string; sets: string; reps: string; completed: boolean }[]
  completed: boolean
  duration: number
  notes: string
  created_at: string
}

export interface Meal {
  id: string
  user_id: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  protein: number
  carbs: number
  fat: number
  calories: number
  completed: boolean
  created_at: string
}

export interface RocketPhoto {
  id: string
  user_id: string
  url: string
  caption: string
  created_at: string
}

export interface BusinessIncome {
  id: string
  user_id: string
  date: string
  source: string
  amount: number
  description: string
  receipt_url: string
  created_at: string
}

export interface BusinessExpense {
  id: string
  user_id: string
  date: string
  category: string
  amount: number
  description: string
  receipt_url: string
  tax_deductible: boolean
  created_at: string
}

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  type: 'text' | 'checklist' | 'whiteboard'
  whiteboard_data: any
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  theme: string
  accent_color: string
  font_preference: string
  oura_token: string
  created_at: string
  updated_at: string
}
