# Supabase Setup Guide — Sacred Living Planner

## Project Info
- **Project URL:** https://tnklcqydqilbgwvgbemm.supabase.co
- **Region:** us-east-1 (N. Virginia)

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://tnklcqydqilbgwvgbemm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_qf4E9l0Er5VxX9KTcM9rQw_VcFX7zGN
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>  # for server-side only
```

## Setup Steps

### 1. Create Project (if not done)
- Go to https://supabase.com/dashboard
- Create new project → name it "sacred-living-planner"
- Note the Project URL and API keys

### 2. Run Base Schema
In Supabase SQL Editor (New Query), paste and run:
```
sql/schema.sql
```
This creates all tables, indexes, RLS policies, triggers, and seed data.

### 3. Run Daily Planner Migration
After the base schema is applied, run:
```
sql/migration_001_daily_enhancements.sql
```
This adds:
- `tasks` JSONB column to `daily_entries`
- `priorities` JSONB column to `daily_entries`
- `notes` TEXT column to `daily_entries`
- `events` JSONB column to `daily_entries`
- `gratitude` JSONB column to `daily_entries`
- `save_daily_entry_field()` RPC function
- `get_or_create_daily_entry()` RPC function
- `upsert_daily_entry()` RPC function

### 4. Enable Auth
In Supabase Dashboard → Authentication → Settings:
- Enable Email provider
- Disable "Confirm email" if you want password-only signup
- Site URL: `http://localhost:3000` (dev) or your production domain

### 5. Verify RLS
All tables have Row Level Security enabled. Each user can only CRUD their own data.

## Tables Summary

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles extending auth.users |
| `themes` | Pre-built + custom color themes |
| `habits` | User-defined habits with frequency/reminders |
| `habit_completions` | Daily habit check-ins |
| `daily_entries` | Full daily planner data (mood, tasks, schedule, meals, etc.) |
| `weekly_reviews` | Weekly reflection + meal plan + cleaning |
| `monthly_reflections` | Monthly highlights, goals, budget |
| `yearly_goals` | Word of year + categorized goals |
| `notes` | Freeform notes with folders/tags |
| `documents` | File uploads for Rocket's business |
| `sync_queue` | Offline-first sync queue |

## RPC Functions

| Function | Purpose |
|----------|---------|
| `save_daily_entry_field()` | Save a single field to daily_entries (used by usePlanner hook) |
| `get_or_create_daily_entry()` | Get or initialize a daily entry for a date |
| `upsert_daily_entry()` | Batch upsert all daily entry fields |
| `get_habit_streak()` | Calculate current streak for a habit |
| `handle_new_user()` | Auto-create profile on signup (trigger) |

## Next Steps
See Task C: Wire the Daily Planner page to read/write from Supabase via the usePlanner hook.
