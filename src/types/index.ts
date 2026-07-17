export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  subscription_tier: string | null
  subscription_status: string | null
  created_at: string
  updated_at: string
}

export interface ThemeColors {
  bg: string
  surface: string
  text: string
  textMuted: string
  accent: string
  accentHover: string
  border: string
  success: string
  warning: string
  error: string
  calendarWeekend: string
}

export interface Theme {
  id: string
  name: string
  description: string
  is_premium: boolean
  is_custom: boolean
  user_id: string | null
  colors: ThemeColors
  font_heading: string
  font_body: string
  background_image_url: string | null
  background_opacity: number
  created_at: string
  updated_at: string
}

export interface DailyEntry {
  id: string
  user_id: string
  date: string
  focus: string
  priorities: string[]
  tasks: { id: string; text: string; completed: boolean; priority: string }[]
  events: { id: string; time: string; label: string; completed: boolean }[]
  notes: string
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
  frequency: string
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

export interface Document {
  id: string
  user_id: string
  title: string
  category: 'income' | 'expense' | 'receipt' | 'contract' | 'other'
  amount: number | null
  document_date: string | null
  description: string | null
  file_url: string | null
  file_name: string | null
  file_type: string | null
  created_at: string
  updated_at: string
}

export interface HabitCompletion {
  id: string
  user_id: string
  habit_id: string
  completed_date: string
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
