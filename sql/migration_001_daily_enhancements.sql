-- ============================================================
-- MIGRATION: Daily Planner Enhancements
-- Adds tasks, priorities, and the save_daily_entry_field RPC
-- Run this in Supabase SQL Editor after applying schema.sql
-- ============================================================

-- 1. Add tasks column to daily_entries (JSONB array of task objects)
ALTER TABLE daily_entries
ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]'::jsonb;

-- 2. Add priorities column to daily_entries (JSONB array of 3 strings)
ALTER TABLE daily_entries
ADD COLUMN IF NOT EXISTS priorities JSONB DEFAULT '["","",""]'::jsonb;

-- 3. Add notes column to daily_entries (rich text notes for the day)
ALTER TABLE daily_entries
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. Add gratitude column to daily_entries (JSONB array of gratitude strings)
ALTER TABLE daily_entries
ADD COLUMN IF NOT EXISTS gratitude JSONB DEFAULT '["","",""]'::jsonb;

-- 5. Add events column to daily_entries (structured schedule events)
ALTER TABLE daily_entries
ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]'::jsonb;

-- 6. Create/update index for daily_entries lookup
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON daily_entries(user_id, entry_date);

-- 7. RPC: Save any field on a daily entry (upsert)
-- This is used by the usePlanner hook for real-time sync
CREATE OR REPLACE FUNCTION save_daily_entry_field(
  p_user_id UUID,
  p_date DATE,
  p_field TEXT,
  p_value JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_entries (user_id, entry_date)
  VALUES (p_user_id, p_date)
  ON CONFLICT (user_id, entry_date) DO NOTHING;

  CASE p_field
    WHEN 'tasks' THEN
      UPDATE daily_entries SET tasks = p_value, updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
    WHEN 'events' THEN
      UPDATE daily_entries SET events = p_value, updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
    WHEN 'schedule' THEN
      UPDATE daily_entries SET schedule = p_value, updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
    WHEN 'mood' THEN
      UPDATE daily_entries SET mood = (p_value->>'rating')::INTEGER, updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
    WHEN 'priorities' THEN
      UPDATE daily_entries SET priorities = p_value, updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
    WHEN 'notes' THEN
      UPDATE daily_entries SET notes = p_value::TEXT, updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
    WHEN 'gratitude' THEN
      UPDATE daily_entries SET gratitude = p_value, updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
    WHEN 'focus' THEN
      UPDATE daily_entries SET focus = p_value::TEXT, updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
    WHEN 'intention' THEN
      UPDATE daily_entries SET intention = p_value::TEXT, updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
    WHEN 'water_intake' THEN
      UPDATE daily_entries SET water_intake = (p_value::TEXT)::INTEGER, updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
    WHEN 'morning_notes' THEN
      UPDATE daily_entries SET morning_notes = p_value::TEXT, updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
    WHEN 'evening_reflection' THEN
      UPDATE daily_entries SET evening_reflection = p_value::TEXT, updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
    WHEN 'wins' THEN
      UPDATE daily_entries SET wins = p_value::TEXT, updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
    WHEN 'improvements' THEN
      UPDATE daily_entries SET improvements = p_value::TEXT, updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
    ELSE
      -- Generic: store in schedule JSONB under the field key
      UPDATE daily_entries
      SET schedule = COALESCE(schedule, '{}'::jsonb) || jsonb_build_object(p_field, p_value),
          updated_at = NOW()
      WHERE user_id = p_user_id AND entry_date = p_date;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RPC: Get or create a daily entry for a user + date
CREATE OR REPLACE FUNCTION get_or_create_daily_entry(
  p_user_id UUID,
  p_date DATE
)
RETURNS SETOF daily_entries AS $$
BEGIN
  INSERT INTO daily_entries (user_id, entry_date)
  VALUES (p_user_id, p_date)
  ON CONFLICT (user_id, entry_date) DO NOTHING;

  RETURN QUERY SELECT * FROM daily_entries WHERE user_id = p_user_id AND entry_date = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RPC: Upsert full daily entry (for batch saves)
CREATE OR REPLACE FUNCTION upsert_daily_entry(
  p_user_id UUID,
  p_date DATE,
  p_data JSONB
)
RETURNS VOID AS $$
DECLARE
  _mood INTEGER;
  _energy INTEGER;
  _sleep_hours NUMERIC;
  _sleep_quality INTEGER;
  _focus TEXT;
  _gratitude JSONB;
  _intention TEXT;
  _schedule JSONB;
  _morning_notes TEXT;
  _evening_reflection TEXT;
  _wins TEXT;
  _improvements TEXT;
  _water_intake INTEGER;
  _steps INTEGER;
  _workout_done BOOLEAN;
  _workout_type TEXT;
  _workout_duration INTEGER;
  _breakfast TEXT;
  _lunch TEXT;
  _dinner TEXT;
  _snacks TEXT;
  _tasks JSONB;
  _priorities JSONB;
  _notes TEXT;
  _events JSONB;
BEGIN
  -- Extract values from JSONB payload
  _mood := (p_data->>'mood')::INTEGER;
  _energy := (p_data->>'energy')::INTEGER;
  _sleep_hours := (p_data->>'sleep_hours')::NUMERIC;
  _sleep_quality := (p_data->>'sleep_quality')::INTEGER;
  _focus := p_data->>'focus';
  _gratitude := p_data->'gratitude';
  _intention := p_data->>'intention';
  _schedule := p_data->'schedule';
  _morning_notes := p_data->>'morning_notes';
  _evening_reflection := p_data->>'evening_reflection';
  _wins := p_data->>'wins';
  _improvements := p_data->>'improvements';
  _water_intake := (p_data->>'water_intake')::INTEGER;
  _steps := (p_data->>'steps')::INTEGER;
  _workout_done := (p_data->>'workout_done')::BOOLEAN;
  _workout_type := p_data->>'workout_type';
  _workout_duration := (p_data->>'workout_duration')::INTEGER;
  _breakfast := p_data->>'breakfast';
  _lunch := p_data->>'lunch';
  _dinner := p_data->>'dinner';
  _snacks := p_data->>'snacks';
  _tasks := p_data->'tasks';
  _priorities := p_data->'priorities';
  _notes := p_data->>'notes';
  _events := p_data->'events';

  INSERT INTO daily_entries (
    user_id, entry_date,
    mood, energy, sleep_hours, sleep_quality,
    focus, gratitude, intention, schedule,
    morning_notes, evening_reflection, wins, improvements,
    water_intake, steps, workout_done, workout_type, workout_duration,
    breakfast, lunch, dinner, snacks,
    tasks, priorities, notes, events
  )
  VALUES (
    p_user_id, p_date,
    _mood, _energy, _sleep_hours, _sleep_quality,
    _focus, _gratitude, _intention, _schedule,
    _morning_notes, _evening_reflection, _wins, _improvements,
    _water_intake, _steps, _workout_done, _workout_type, _workout_duration,
    _breakfast, _lunch, _dinner, _snacks,
    _tasks, _priorities, _notes, _events
  )
  ON CONFLICT (user_id, entry_date)
  DO UPDATE SET
    mood = COALESCE(EXCLUDED.mood, daily_entries.mood),
    energy = COALESCE(EXCLUDED.energy, daily_entries.energy),
    sleep_hours = COALESCE(EXCLUDED.sleep_hours, daily_entries.sleep_hours),
    sleep_quality = COALESCE(EXCLUDED.sleep_quality, daily_entries.sleep_quality),
    focus = COALESCE(EXCLUDED.focus, daily_entries.focus),
    gratitude = COALESCE(EXCLUDED.gratitude, daily_entries.gratitude),
    intention = COALESCE(EXCLUDED.intention, daily_entries.intention),
    schedule = COALESCE(EXCLUDED.schedule, daily_entries.schedule),
    morning_notes = COALESCE(EXCLUDED.morning_notes, daily_entries.morning_notes),
    evening_reflection = COALESCE(EXCLUDED.evening_reflection, daily_entries.evening_reflection),
    wins = COALESCE(EXCLUDED.wins, daily_entries.wins),
    improvements = COALESCE(EXCLUDED.improvements, daily_entries.improvements),
    water_intake = COALESCE(EXCLUDED.water_intake, daily_entries.water_intake),
    steps = COALESCE(EXCLUDED.steps, daily_entries.steps),
    workout_done = COALESCE(EXCLUDED.workout_done, daily_entries.workout_done),
    workout_type = COALESCE(EXCLUDED.workout_type, daily_entries.workout_type),
    workout_duration = COALESCE(EXCLUDED.workout_duration, daily_entries.workout_duration),
    breakfast = COALESCE(EXCLUDED.breakfast, daily_entries.breakfast),
    lunch = COALESCE(EXCLUDED.lunch, daily_entries.lunch),
    dinner = COALESCE(EXCLUDED.dinner, daily_entries.dinner),
    snacks = COALESCE(EXCLUDED.snacks, daily_entries.snacks),
    tasks = COALESCE(EXCLUDED.tasks, daily_entries.tasks),
    priorities = COALESCE(EXCLUDED.priorities, daily_entries.priorities),
    notes = COALESCE(EXCLUDED.notes, daily_entries.notes),
    events = COALESCE(EXCLUDED.events, daily_entries.events),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
