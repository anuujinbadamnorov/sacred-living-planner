'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import type { Database } from '@/lib/database.types';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];
type DailyEntry = Database['public']['Tables']['daily_entries']['Row'];
type Note = Database['public']['Tables']['notes']['Row'];

export interface PlannerData {
  habits: Habit[];
  habitCompletions: Record<string, string[]>; // date -> habit_ids
  dailyEntry: DailyEntry | null;
  notes: Note[];
  loading: boolean;
  error: string | null;
}

export function useSupabasePlanner(selectedDate?: string) {
  const { user } = useAuth();
  const [data, setData] = useState<PlannerData>({
    habits: [],
    habitCompletions: {},
    dailyEntry: null,
    notes: [],
    loading: true,
    error: null,
  });

  const date = selectedDate || new Date().toISOString().split('T')[0];
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!user) {
      setData((d) => ({ ...d, loading: false }));
      return;
    }

    setData((d) => ({ ...d, loading: true, error: null }));

    try {
      // Fetch habits
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;

      // Fetch habit completions for the selected date
      const { data: completions, error: compError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed_date', date);

      if (compError) throw compError;

      const habitCompletions: Record<string, string[]> = {};
      habitCompletions[date] = completions?.map((c) => c.habit_id) || [];

      // Fetch daily entry for the selected date
      const { data: dailyEntry, error: entryError } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle();

      if (entryError) throw entryError;

      // Fetch notes
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (notesError) throw notesError;

      setData({
        habits: habits || [],
        habitCompletions,
        dailyEntry: dailyEntry || null,
        notes: notes || [],
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setData((d) => ({
        ...d,
        loading: false,
        error: err.message || 'Failed to load planner data',
      }));
    }
  }, [user, date, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Habit operations
  const addHabit = useCallback(
    async (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'streak'>) => {
      if (!user) return null;
      const { data: newHabit, error } = await supabase
        .from('habits')
        .insert({ ...habit, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      await fetchData();
      return newHabit;
    },
    [user, supabase, fetchData]
  );

  const toggleHabitCompletion = useCallback(
    async (habitId: string, completed: boolean) => {
      if (!user) return;

      if (completed) {
        await supabase
          .from('habit_completions')
          .insert({ user_id: user.id, habit_id: habitId, completed_date: date });
      } else {
        await supabase
          .from('habit_completions')
          .delete()
          .eq('user_id', user.id)
          .eq('habit_id', habitId)
          .eq('completed_date', date);
      }

      await fetchData();
    },
    [user, date, supabase, fetchData]
  );

  // Daily entry operations
  const saveDailyEntry = useCallback(
    async (entry: Partial<DailyEntry>) => {
      if (!user) return null;

      const { data: existing } = await supabase
        .from('daily_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase
          .from('daily_entries')
          .update({ ...entry, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('daily_entries')
          .insert({
            user_id: user.id,
            date,
            ...entry,
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;
      await fetchData();
      return result.data;
    },
    [user, date, supabase, fetchData]
  );

  // Note operations
  const addNote = useCallback(
    async (note: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) return null;
      const { data: newNote, error } = await supabase
        .from('notes')
        .insert({ ...note, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      await fetchData();
      return newNote;
    },
    [user, supabase, fetchData]
  );

  const updateNote = useCallback(
    async (id: string, updates: Partial<Note>) => {
      const { error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    },
    [supabase, fetchData]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    },
    [supabase, fetchData]
  );

  return {
    ...data,
    refresh: fetchData,
    addHabit,
    toggleHabitCompletion,
    saveDailyEntry,
    addNote,
    updateNote,
    deleteNote,
  };
}
