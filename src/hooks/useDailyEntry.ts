'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase';
import type { DailyEntry } from '@/types';

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  priority?: string;
}

export interface TimeEvent {
  id: string;
  title: string;
  hour: number;
  minute: number;
}

export interface GratitudeItem {
  id: string;
  text: string;
}

export type Mood = 1 | 2 | 3 | 4 | 5 | null;

export interface DailyEntryState {
  focus: string;
  priorities: string[];
  tasks: TaskItem[];
  events: TimeEvent[];
  notes: string;
  gratitude: GratitudeItem[];
  mood: Mood;
  waterCount: number;
}

export function useDailyEntry(dateStr: string) {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [entry, setEntry] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Supabase on mount / date change
  useEffect(() => {
    if (!user) {
      setEntry(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('entry_date', dateStr)
      .single()
      .then(({ data, error }: { data: Record<string, unknown> | null; error: { code: string; message: string } | null }) => {
        if (cancelled) return;
        if (error && error.code !== 'PGRST116') {
          console.warn('Failed to load daily entry:', error.message);
        }
        setEntry(data || null);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          console.warn('Daily entry load error:', err);
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [dateStr, user, supabase]);

  // Save to Supabase (upsert full payload)
  const saveEntry = useCallback(async (state: Partial<DailyEntryState>) => {
    if (!user) return;

    const payload: Record<string, unknown> = {};

    if (state.focus !== undefined) payload.focus = state.focus;
    if (state.priorities !== undefined) payload.priorities = state.priorities;
    if (state.tasks !== undefined) payload.tasks = state.tasks;
    if (state.events !== undefined) payload.events = state.events;
    if (state.notes !== undefined) payload.notes = state.notes;
    if (state.gratitude !== undefined) {
      payload.gratitude = state.gratitude.map(g => g.text);
    }
    if (state.mood !== undefined) payload.mood = state.mood;
    if (state.waterCount !== undefined) payload.water_intake = state.waterCount;

    if (Object.keys(payload).length === 0) return;

    try {
      const { error } = await supabase.rpc('upsert_daily_entry', {
        p_user_id: user.id,
        p_date: dateStr,
        p_data: payload,
      });

      if (error) {
        console.warn('Failed to save daily entry:', error.message);
      }
    } catch (err) {
      console.warn('Daily entry save error:', err);
    }
  }, [user, supabase, dateStr]);

  return { entry, isLoading, saveEntry };
}
