-- ============================================================
-- SACRED LIVING PLANNER - Complete Database Schema
-- Supabase PostgreSQL + Row Level Security
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro_monthly', 'pro_yearly')),
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  theme_id TEXT DEFAULT 'sacred',
  custom_primary_color TEXT,
  custom_background_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  timezone TEXT DEFAULT 'America/Chicago',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. THEMES (Pre-built + User Custom)
-- ============================================================
CREATE TABLE themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_custom BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  colors JSONB NOT NULL DEFAULT '{
    "bg": "#FAF7F2",
    "surface": "#FFFFFF",
    "text": "#2D2A26",
    "textMuted": "#8B8680",
    "accent": "#D4A574",
    "accentHover": "#C49464",
    "border": "#E8E4DE",
    "success": "#6B8E6B",
    "warning": "#D4A574",
    "error": "#C4706B",
    "calendarWeekend": "#F5F0EB"
  }'::jsonb,
  font_heading TEXT DEFAULT 'font-serif',
  font_body TEXT DEFAULT 'font-sans',
  background_image_url TEXT,
  background_opacity NUMERIC DEFAULT 1.0 CHECK (background_opacity >= 0 AND background_opacity <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed pre-built themes
INSERT INTO themes (id, name, description, is_premium, colors, font_heading, font_body) VALUES
('sacred', 'Sacred Living', 'Warm cream with earthy gold accents', FALSE, '{
  "bg": "#FAF7F2", "surface": "#FFFFFF", "text": "#2D2A26", "textMuted": "#8B8680",
  "accent": "#D4A574", "accentHover": "#C49464", "border": "#E8E4DE",
  "success": "#6B8E6B", "warning": "#D4A574", "error": "#C4706B", "calendarWeekend": "#F5F0EB"
}', 'font-serif', 'font-sans'),

('midnight', 'Midnight Bloom', 'Deep navy with soft lavender accents', FALSE, '{
  "bg": "#1A1A2E", "surface": "#16213E", "text": "#E8E8E8", "textMuted": "#A0A0B0",
  "accent": "#9B7EDE", "accentHover": "#8B6ECE", "border": "#2A2A4E",
  "success": "#7EBB8A", "warning": "#D4A574", "error": "#E07A7A", "calendarWeekend": "#252545"
}', 'font-sans', 'font-sans'),

('sage', 'Sage Garden', 'Soft green with cream accents', FALSE, '{
  "bg": "#F5F7F2", "surface": "#FFFFFF", "text": "#2D3326", "textMuted": "#7A8B6E",
  "accent": "#7A9E6E", "accentHover": "#6A8E5E", "border": "#DEE5D8",
  "success": "#5A8A5A", "warning": "#B8A070", "error": "#B87070", "calendarWeekend": "#EDF2E8"
}', 'font-serif', 'font-sans'),

('blush', 'Blush Rose', 'Soft pink with rose gold', TRUE, '{
  "bg": "#FDF5F5", "surface": "#FFFFFF", "text": "#3D2A2A", "textMuted": "#A08080",
  "accent": "#D4A5A5", "accentHover": "#C49595", "border": "#F0E0E0",
  "success": "#8BAE8B", "warning": "#D4B0A0", "error": "#C48080", "calendarWeekend": "#F8EBEB"
}', 'font-serif', 'font-sans'),

('minimal', 'Pure Minimal', 'Clean white with black accents', FALSE, '{
  "bg": "#FFFFFF", "surface": "#FAFAFA", "text": "#1A1A1A", "textMuted": "#888888",
  "accent": "#1A1A1A", "accentHover": "#333333", "border": "#E5E5E5",
  "success": "#4CAF50", "warning": "#FF9800", "error": "#F44336", "calendarWeekend": "#F5F5F5"
}', 'font-sans', 'font-sans'),

('ocean', 'Ocean Mist', 'Soft blue with seafoam', TRUE, '{
  "bg": "#F0F5FA", "surface": "#FFFFFF", "text": "#1E2A3A", "textMuted": "#6B8299",
  "accent": "#5B8DB8", "accentHover": "#4B7DA8", "border": "#D5E0EB",
  "success": "#5A9E8A", "warning": "#B8A060", "error": "#B86060", "calendarWeekend": "#E8F0F8"
}', 'font-sans', 'font-sans'),

('terracotta', 'Terracotta Sun', 'Warm clay with burnt orange', TRUE, '{
  "bg": "#FDF8F3", "surface": "#FFFFFF", "text": "#3D2A1E", "textMuted": "#A08060",
  "accent": "#C4703E", "accentHover": "#B4602E", "border": "#E8D8C8",
  "success": "#6B8E6B", "warning": "#D4A060", "error": "#B86060", "calendarWeekend": "#F5EDE0"
}', 'font-serif', 'font-sans')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. HABITS
-- ============================================================
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#D4A574',
  icon TEXT DEFAULT 'check',
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_days INTEGER DEFAULT 7, -- per week
  reminder_time TIME,
  reminder_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6], -- 0=Sun
  sort_order INTEGER DEFAULT 0,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. HABIT COMPLETIONS
-- ============================================================
CREATE TABLE habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(habit_id, completed_date)
);

-- ============================================================
-- 5. DAILY ENTRIES
-- ============================================================
CREATE TABLE daily_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  
  -- Mood & Energy
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  energy INTEGER CHECK (energy >= 1 AND energy <= 5),
  sleep_hours NUMERIC(3,1),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  
  -- Daily Planning
  focus TEXT,
  gratitude TEXT,
  intention TEXT,
  
  -- Time Blocking (5am - 10pm, 30-min slots)
  schedule JSONB DEFAULT '{}'::jsonb,
  
  -- Notes & Reflection
  morning_notes TEXT,
  evening_reflection TEXT,
  wins TEXT,
  improvements TEXT,
  
  -- Health
  water_intake INTEGER, -- glasses
  steps INTEGER,
  workout_done BOOLEAN DEFAULT FALSE,
  workout_type TEXT,
  workout_duration INTEGER, -- minutes
  
  -- Meals
  breakfast TEXT,
  lunch TEXT,
  dinner TEXT,
  snacks TEXT,
  
  -- Oura / Wearable Data (cached)
  oura_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, entry_date)
);

-- ============================================================
-- 6. WEEKLY REVIEWS
-- ============================================================
CREATE TABLE weekly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  
  -- Weekly Planning
  theme TEXT,
  priorities TEXT[],
  
  -- Review
  wins TEXT,
  challenges TEXT,
  lessons TEXT,
  next_week_focus TEXT,
  
  -- Meal Plan
  meal_plan JSONB DEFAULT '{}'::jsonb,
  grocery_list TEXT[],
  
  -- Cleaning Schedule
  cleaning_tasks JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, week_start)
);

-- ============================================================
-- 7. MONTHLY REFLECTIONS
-- ============================================================
CREATE TABLE monthly_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month_start DATE NOT NULL, -- first day of month
  
  -- Reflection
  highlights TEXT,
  challenges TEXT,
  gratitude_list TEXT[],
  lessons_learned TEXT,
  
  -- Goals Review
  goals_progress JSONB DEFAULT '{}'::jsonb,
  
  -- Next Month
  next_month_priorities TEXT[],
  next_month_goals TEXT[],
  
  -- Budget
  budget_planned NUMERIC(12,2),
  budget_actual NUMERIC(12,2),
  expenses JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, month_start)
);

-- ============================================================
-- 8. YEARLY GOALS
-- ============================================================
CREATE TABLE yearly_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  
  -- Vision
  word_of_year TEXT,
  vision_statement TEXT,
  
  -- Goals by Category
  goals JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"category": "Health", "goals": [{"title": "Run 5k", "targetDate": "2026-06", "status": "in_progress"}]}]
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, year)
);

-- ============================================================
-- 9. NOTES
-- ============================================================
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  folder TEXT DEFAULT 'General',
  tags TEXT[],
  pinned BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. DOCUMENTS (Rocket's Business, Receipts, etc.)
-- ============================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'income', 'expense', 'receipt', 'contract', 'other'
  amount NUMERIC(12,2),
  document_date DATE,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. SYNC QUEUE (Offline-First)
-- ============================================================
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('insert', 'update', 'delete')),
  payload JSONB NOT NULL,
  synced BOOLEAN DEFAULT FALSE,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_habits_user ON habits(user_id);
CREATE INDEX idx_habit_completions_user_date ON habit_completions(user_id, completed_date);
CREATE INDEX idx_habit_completions_habit ON habit_completions(habit_id);
CREATE INDEX idx_daily_entries_user_date ON daily_entries(user_id, entry_date);
CREATE INDEX idx_weekly_reviews_user_week ON weekly_reviews(user_id, week_start);
CREATE INDEX idx_monthly_reflections_user_month ON monthly_reflections(user_id, month_start);
CREATE INDEX idx_yearly_goals_user_year ON yearly_goals(user_id, year);
CREATE INDEX idx_notes_user ON notes(user_id);
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_sync_queue_user ON sync_queue(user_id, synced);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Habits
CREATE POLICY "Users can CRUD own habits" ON habits FOR ALL USING (auth.uid() = user_id);

-- Habit Completions
CREATE POLICY "Users can CRUD own completions" ON habit_completions FOR ALL USING (auth.uid() = user_id);

-- Daily Entries
CREATE POLICY "Users can CRUD own entries" ON daily_entries FOR ALL USING (auth.uid() = user_id);

-- Weekly Reviews
CREATE POLICY "Users can CRUD own reviews" ON weekly_reviews FOR ALL USING (auth.uid() = user_id);

-- Monthly Reflections
CREATE POLICY "Users can CRUD own reflections" ON monthly_reflections FOR ALL USING (auth.uid() = user_id);

-- Yearly Goals
CREATE POLICY "Users can CRUD own goals" ON yearly_goals FOR ALL USING (auth.uid() = user_id);

-- Notes
CREATE POLICY "Users can CRUD own notes" ON notes FOR ALL USING (auth.uid() = user_id);

-- Documents
CREATE POLICY "Users can CRUD own documents" ON documents FOR ALL USING (auth.uid() = user_id);

-- Sync Queue
CREATE POLICY "Users can CRUD own sync queue" ON sync_queue FOR ALL USING (auth.uid() = user_id);

-- Themes: Everyone can read pre-built, only owner can read custom
CREATE POLICY "Anyone can read themes" ON themes FOR SELECT USING (is_custom = FALSE);
CREATE POLICY "Users can read own custom themes" ON themes FOR SELECT USING (is_custom = TRUE AND auth.uid() = user_id);
CREATE POLICY "Users can CRUD own custom themes" ON themes FOR ALL USING (is_custom = TRUE AND auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habit_completions_updated_at BEFORE UPDATE ON habit_completions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_entries_updated_at BEFORE UPDATE ON daily_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_reviews_updated_at BEFORE UPDATE ON weekly_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monthly_reflections_updated_at BEFORE UPDATE ON monthly_reflections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_yearly_goals_updated_at BEFORE UPDATE ON yearly_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NOW() + INTERVAL '14 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Calculate habit streak
CREATE OR REPLACE FUNCTION get_habit_streak(p_habit_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  current_date_var DATE := CURRENT_DATE;
  has_completion BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM habit_completions
      WHERE habit_id = p_habit_id AND user_id = p_user_id AND completed_date = current_date_var
    ) INTO has_completion;
    
    IF has_completion THEN
      streak := streak + 1;
      current_date_var := current_date_var - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak;
END;
$$ LANGUAGE plpgsql;
