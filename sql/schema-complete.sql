-- ==========================================
-- Sacred Living Planner — Full Database Schema
-- Safe to re-run (drops existing policies first)
-- ==========================================

-- Drop existing policies first (safe re-run)
drop policy if exists "Users can only see their own daily entries" on daily_entries;
drop policy if exists "Users can only see their own health metrics" on health_metrics;
drop policy if exists "Users can only see their own habits" on habits;
drop policy if exists "Users can only see their own workouts" on workouts;
drop policy if exists "Users can only see their own meals" on meals;
drop policy if exists "Users can only see their own rocket photos" on rocket_photos;
drop policy if exists "Users can only see their own business income" on business_income;
drop policy if exists "Users can only see their own business expenses" on business_expenses;
drop policy if exists "Users can only see their own notes" on notes;
drop policy if exists "Users can only see their own settings" on user_settings;

-- Enable RLS on all tables
alter table if exists daily_entries enable row level security;
alter table if exists health_metrics enable row level security;
alter table if exists habits enable row level security;
alter table if exists workouts enable row level security;
alter table if exists meals enable row level security;
alter table if exists rocket_photos enable row level security;
alter table if exists business_income enable row level security;
alter table if exists business_expenses enable row level security;
alter table if exists notes enable row level security;
alter table if exists user_settings enable row level security;

-- ==========================================
-- 1. DAILY ENTRIES
-- ==========================================
create table if not exists daily_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  events jsonb default '[]',
  habits_completed jsonb default '[]',
  mood text,
  gratitude text,
  water_intake int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- ==========================================
-- 2. HEALTH METRICS (Oura + Manual)
-- ==========================================
create table if not exists health_metrics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  sleep_score int,
  readiness_score int,
  activity_score int,
  steps int,
  hrv float,
  resting_hr int,
  deep_sleep int,
  rem_sleep int,
  total_sleep int,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- ==========================================
-- 3. HABITS
-- ==========================================
create table if not exists habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  color text default '#E85D78',
  icon text,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 4. WORKOUTS
-- ==========================================
create table if not exists workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  day_type text,
  exercises jsonb default '[]',
  completed boolean default false,
  duration int,
  notes text,
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 5. MEALS
-- ==========================================
create table if not exists meals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  meal_type text,
  name text,
  protein int,
  carbs int,
  fat int,
  calories int,
  completed boolean default false,
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 6. ROCKET PHOTOS
-- ==========================================
create table if not exists rocket_photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  url text not null,
  caption text,
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 7. BUSINESS INCOME
-- ==========================================
create table if not exists business_income (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  source text,
  amount decimal(10,2),
  description text,
  receipt_url text,
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 8. BUSINESS EXPENSES
-- ==========================================
create table if not exists business_expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  category text,
  amount decimal(10,2),
  description text,
  receipt_url text,
  tax_deductible boolean default true,
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 9. NOTES
-- ==========================================
create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text,
  content text,
  type text default 'text',
  whiteboard_data jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==========================================
-- 10. USER SETTINGS
-- ==========================================
create table if not exists user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  theme text default 'day',
  accent_color text default 'sage',
  font_preference text default 'cormorant',
  oura_token text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

-- ==========================================
-- RLS POLICIES
-- ==========================================

create policy "Users can only see their own daily entries"
  on daily_entries for all
  using (auth.uid() = user_id);

create policy "Users can only see their own health metrics"
  on health_metrics for all
  using (auth.uid() = user_id);

create policy "Users can only see their own habits"
  on habits for all
  using (auth.uid() = user_id);

create policy "Users can only see their own workouts"
  on workouts for all
  using (auth.uid() = user_id);

create policy "Users can only see their own meals"
  on meals for all
  using (auth.uid() = user_id);

create policy "Users can only see their own rocket photos"
  on rocket_photos for all
  using (auth.uid() = user_id);

create policy "Users can only see their own business income"
  on business_income for all
  using (auth.uid() = user_id);

create policy "Users can only see their own business expenses"
  on business_expenses for all
  using (auth.uid() = user_id);

create policy "Users can only see their own notes"
  on notes for all
  using (auth.uid() = user_id);

create policy "Users can only see their own settings"
  on user_settings for all
  using (auth.uid() = user_id);

-- ==========================================
-- DONE! All tables created with RLS enabled.
-- ==========================================
