'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import type { Database } from '@/lib/database.types';

type HabitInsert = Database['public']['Tables']['habits']['Insert'];
type NoteInsert = Database['public']['Tables']['notes']['Insert'];

export interface MigrationResult {
  habitsMigrated: number;
  notesMigrated: number;
  entriesMigrated: number;
  errors: string[];
}

export function useLocalStorageMigration() {
  const { user } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const supabase = createClient();

  const migrate = useCallback(async (): Promise<MigrationResult> => {
    if (!user) {
      return { habitsMigrated: 0, notesMigrated: 0, entriesMigrated: 0, errors: ['Not logged in'] };
    }

    setMigrating(true);
    const errors: string[] = [];
    let habitsMigrated = 0;
    let notesMigrated = 0;
    let entriesMigrated = 0;

    try {
      // Migrate habits
      const habitsJson = localStorage.getItem('planner-habits');
      if (habitsJson) {
        try {
          const habits = JSON.parse(habitsJson);
          const habitsToInsert: HabitInsert[] = Object.entries(habits).map(([name, data]: [string, any]) => ({
            user_id: user.id,
            name,
            description: '',
            frequency: data.frequency || 'daily',
            color: data.color || '#C4704B',
            reminder_time: null,
            is_active: true,
          }));

          for (const habit of habitsToInsert) {
            const { error } = await supabase.from('habits').insert(habit);
            if (error) {
              errors.push(`Habit "${habit.name}": ${error.message}`);
            } else {
              habitsMigrated++;
            }
          }
        } catch (e: any) {
          errors.push(`Habits parse error: ${e.message}`);
        }
      }

      // Migrate notes
      const notesJson = localStorage.getItem('planner-notes');
      if (notesJson) {
        try {
          const notes = JSON.parse(notesJson);
          const notesToInsert: NoteInsert[] = [];

          for (const [date, noteList] of Object.entries(notes)) {
            if (Array.isArray(noteList)) {
              for (const note of noteList) {
                notesToInsert.push({
                  user_id: user.id,
                  title: note.title || `Note from ${date}`,
                  content: note.content || note.text || '',
                  folder: 'general',
                  pinned: false,
                  tags: [],
                  archived: false,
                });
              }
            }
          }

          for (const note of notesToInsert) {
            const { error } = await supabase.from('notes').insert(note);
            if (error) {
              errors.push(`Note: ${error.message}`);
            } else {
              notesMigrated++;
            }
          }
        } catch (e: any) {
          errors.push(`Notes parse error: ${e.message}`);
        }
      }

      // Migrate daily entries (tasks, events, mood)
      const tasksJson = localStorage.getItem('planner-tasks');
      const eventsJson = localStorage.getItem('planner-events');
      
      if (tasksJson || eventsJson) {
        try {
          const tasks = tasksJson ? JSON.parse(tasksJson) : {};
          const events = eventsJson ? JSON.parse(eventsJson) : {};
          const dates = new Set([...Object.keys(tasks), ...Object.keys(events)]);

          for (const date of dates) {
            const dayTasks = tasks[date] || [];
            const dayEvents = events[date] || [];

            const { error } = await supabase.from('daily_entries').insert({
              user_id: user.id,
              date,
              tasks: dayTasks,
              events: dayEvents,
              mood: null,
              energy: null,
            });

            if (error) {
              errors.push(`Entry ${date}: ${error.message}`);
            } else {
              entriesMigrated++;
            }
          }
        } catch (e: any) {
          errors.push(`Entries parse error: ${e.message}`);
        }
      }

      const result = { habitsMigrated, notesMigrated, entriesMigrated, errors };
      setResult(result);
      return result;
    } catch (e: any) {
      const result = { habitsMigrated, notesMigrated, entriesMigrated, errors: [...errors, e.message] };
      setResult(result);
      return result;
    } finally {
      setMigrating(false);
    }
  }, [user, supabase]);

  return { migrate, migrating, result };
}
