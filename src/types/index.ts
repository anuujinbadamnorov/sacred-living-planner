export type SubscriptionTier = 'free' | 'pro_monthly' | 'pro_yearly';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  theme_id: string;
  custom_primary_color: string | null;
  custom_background_url: string | null;
  onboarding_completed: boolean;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string | null;
  is_premium: boolean;
  is_custom: boolean;
  user_id: string | null;
  colors: ThemeColors;
  font_heading: string;
  font_body: string;
  background_image_url: string | null;
  background_opacity: number;
  created_at: string;
  updated_at: string;
}

export interface ThemeColors {
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  calendarWeekend: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  frequency: 'daily' | 'weekly' | 'custom';
  target_days: number;
  reminder_time: string | null;
  reminder_days: number[];
  sort_order: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
  streak?: number;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  completed_at: string;
  notes: string | null;
}

export interface DailyEntry {
  id: string;
  user_id: string;
  entry_date: string;
  mood: number | null;
  energy: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  focus: string | null;
  gratitude: string[] | null;
  intention: string | null;
  schedule: Record<string, string>;
  morning_notes: string | null;
  evening_reflection: string | null;
  wins: string | null;
  improvements: string | null;
  water_intake: number | null;
  steps: number | null;
  workout_done: boolean;
  workout_type: string | null;
  workout_duration: number | null;
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  snacks: string | null;
  oura_data: Record<string, unknown> | null;
  tasks: Array<{ id: string; text: string; completed: boolean; priority?: string }> | null;
  priorities: string[] | null;
  notes: string | null;
  events: Array<{ id: string; title: string; hour: number; minute: number }> | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start: string;
  theme: string | null;
  priorities: string[];
  wins: string | null;
  challenges: string | null;
  lessons: string | null;
  next_week_focus: string | null;
  meal_plan: Record<string, string>;
  grocery_list: string[];
  cleaning_tasks: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface MonthlyReflection {
  id: string;
  user_id: string;
  month_start: string;
  highlights: string | null;
  challenges: string | null;
  gratitude_list: string[];
  lessons_learned: string | null;
  goals_progress: Record<string, unknown>;
  next_month_priorities: string[];
  next_month_goals: string[];
  budget_planned: number | null;
  budget_actual: number | null;
  expenses: Array<{
    category: string;
    amount: number;
    description: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface YearlyGoal {
  id: string;
  user_id: string;
  year: number;
  word_of_year: string | null;
  vision_statement: string | null;
  goals: Array<{
    category: string;
    goals: Array<{
      title: string;
      targetDate: string;
      status: 'not_started' | 'in_progress' | 'completed';
    }>;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  folder: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  category: 'income' | 'expense' | 'receipt' | 'contract' | 'other';
  amount: number | null;
  document_date: string | null;
  description: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type PlannerView = 'daily' | 'weekly' | 'monthly' | 'yearly';
