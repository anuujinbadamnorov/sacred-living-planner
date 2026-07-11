'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase';

// Global refresh event — any component using usePlanner can listen
const REFRESH_EVENT = 'planner-data-refresh';

type RealtimePayload = { new: any; eventType?: string };

export function useRealtimeSync() {
  const { user } = useAuth();
  const subscriptionsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    const subscriptions: any[] = [];

    // Subscribe to daily_entries changes
    const dailyChannel = supabase
      .channel('daily_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_entries',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePayload) => {
          // Update localStorage from Supabase data
          const data = payload.new as any;
          if (!data) return;

          const dateKey = data.entry_date;
          if (!dateKey) return;

          // Map Supabase fields to localStorage keys
          if (data.schedule) {
            try {
              const events = Object.entries(data.schedule).map(([time, title]) => ({
                id: `evt-${Date.now()}`,
                title: String(title),
                time: String(time),
                duration: '30 min',
              }));
              localStorage.setItem(`planner-events-${dateKey}`, JSON.stringify(events));
            } catch { /* */ }
          }

          if (data.focus) {
            try {
              localStorage.setItem(`planner-focus-${dateKey}`, JSON.stringify(data.focus));
            } catch { /* */ }
          }

          if (data.mood !== null) {
            try {
              const moodLabels: Record<number, string> = {
                1: 'Awful', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Great',
              };
              localStorage.setItem(`planner-mood-${dateKey}`, JSON.stringify({
                rating: data.mood,
                label: moodLabels[data.mood] || 'Okay',
                note: '',
                timestamp: data.updated_at || new Date().toISOString(),
              }));
            } catch { /* */ }
          }

          if (data.water_intake !== null) {
            try {
              localStorage.setItem(`planner-water-${dateKey}`, JSON.stringify(data.water_intake));
            } catch { /* */ }
          }

          if (data.morning_notes) {
            try {
              localStorage.setItem(`planner-notes-${dateKey}`, JSON.stringify(data.morning_notes));
            } catch { /* */ }
          }

          if (data.gratitude) {
            try {
              localStorage.setItem(`planner-gratitude-${dateKey}`, JSON.stringify(data.gratitude.split('\n')));
            } catch { /* */ }
          }

          // Trigger refresh across all components
          dispatchRefresh();
        }
      )
      .subscribe();

    subscriptions.push(dailyChannel);

    // Subscribe to habits changes
    const habitsChannel = supabase
      .channel('habits_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habits',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePayload) => {
          if (payload.eventType === 'DELETE') {
            // Reload all habits from Supabase
            refreshLocalHabits(supabase, user.id);
          } else if (payload.new) {
            refreshLocalHabits(supabase, user.id);
          }
          dispatchRefresh();
        }
      )
      .subscribe();

    subscriptions.push(habitsChannel);

    // Subscribe to habit completions
    const completionsChannel = supabase
      .channel('habit_completions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habit_completions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refreshLocalHabits(supabase, user.id);
          dispatchRefresh();
        }
      )
      .subscribe();

    subscriptions.push(completionsChannel);

    // Subscribe to notes
    const notesChannel = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          dispatchRefresh();
        }
      )
      .subscribe();

    subscriptions.push(notesChannel);

    // Subscribe to weekly reviews
    const weeklyChannel = supabase
      .channel('weekly_reviews_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_reviews',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          dispatchRefresh();
        }
      )
      .subscribe();

    subscriptions.push(weeklyChannel);

    // Subscribe to monthly reflections
    const monthlyChannel = supabase
      .channel('monthly_reflections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'monthly_reflections',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          dispatchRefresh();
        }
      )
      .subscribe();

    subscriptions.push(monthlyChannel);

    subscriptionsRef.current = subscriptions;

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [user]);

  return null;
}

// Refresh local habits from Supabase
async function refreshLocalHabits(supabase: any, userId: string) {
  try {
    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);

    const { data: completions } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', userId);

    if (!habits) return;

    const habitMap = new Map(completions?.map((c: any) => [`${c.habit_id}-${c.completed_date}`, true]) || []);

    const localHabits = habits.map((h: any) => {
      const history: Record<string, boolean> = {};
      // Build last 30 days of completion history
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        if (habitMap.has(`${h.id}-${dateStr}`)) {
          history[dateStr] = true;
        }
      }

      // Calculate streak
      let streak = 0;
      let bestStreak = 0;
      let currentStreak = 0;
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        if (history[dateStr]) {
          currentStreak++;
        } else {
          bestStreak = Math.max(bestStreak, currentStreak);
          if (i === 0) {
            // Today not completed, streak stays at 0
          }
          currentStreak = 0;
        }
      }
      bestStreak = Math.max(bestStreak, currentStreak);
      streak = currentStreak;

      return {
        id: h.id,
        name: h.name,
        completed: !!history[today.toISOString().split('T')[0]],
        streak,
        bestStreak,
        color: h.color || '#C4704B',
        frequency: h.frequency || 'daily',
        history,
      };
    });

    localStorage.setItem('planner-habits', JSON.stringify(localHabits));
  } catch {
    // Silently fail — localStorage will be refreshed on next page load
  }
}

function dispatchRefresh() {
  window.dispatchEvent(new Event(REFRESH_EVENT));
  // Also dispatch storage event for cross-tab sync
  window.dispatchEvent(new StorageEvent('storage', { key: 'planner-habits', newValue: '' }));
}

// Hook for components to listen for refresh events
export function usePlannerRefresh(callback: () => void) {
  useEffect(() => {
    const handle = () => callback();
    window.addEventListener(REFRESH_EVENT, handle);
    window.addEventListener('storage', handle);
    return () => {
      window.removeEventListener(REFRESH_EVENT, handle);
      window.removeEventListener('storage', handle);
    };
  }, [callback]);
}
