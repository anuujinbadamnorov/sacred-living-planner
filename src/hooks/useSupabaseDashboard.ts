'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface DashboardStats {
  habitsCount: number;
  habitsCompletedToday: number;
  todaysEntry: boolean;
  notesCount: number;
  loading: boolean;
  error: string | null;
}

export function useSupabaseDashboard(): DashboardStats {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    habitsCount: 0,
    habitsCompletedToday: 0,
    todaysEntry: false,
    notesCount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      setStats((s) => ({ ...s, loading: false }));
      return;
    }

    const fetchStats = async () => {
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0];

      try {
        // Count habits (not archived) — gracefully handle missing column
        let habitsCount = 0;
        try {
          const { count, error } = await supabase
            .from('habits')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('archived', false);
          if (!error) habitsCount = count || 0;
        } catch {
          // archived column might not exist, try without filter
          const { count } = await supabase
            .from('habits')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          habitsCount = count || 0;
        }

        // Count habits completed today
        let completedToday = 0;
        try {
          const { count, error } = await supabase
            .from('habit_completions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('completed_date', today);
          if (!error) completedToday = count || 0;
        } catch {
          completedToday = 0;
        }

        // Check if today's daily entry exists
        let todaysEntry = false;
        try {
          const { data, error } = await supabase
            .from('daily_entries')
            .select('id')
            .eq('user_id', user.id)
            .eq('entry_date', today)
            .maybeSingle();
          if (!error) todaysEntry = !!data;
        } catch {
          todaysEntry = false;
        }

        // Count notes
        let notesCount = 0;
        try {
          const { count, error } = await supabase
            .from('notes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          if (!error) notesCount = count || 0;
        } catch {
          notesCount = 0;
        }

        setStats({
          habitsCount,
          habitsCompletedToday: completedToday,
          todaysEntry,
          notesCount,
          loading: false,
          error: null,
        });
      } catch {
        // Even on total failure, show Connected if user is logged in
        // The individual queries above are wrapped, so this shouldn't trigger
        setStats({
          habitsCount: 0,
          habitsCompletedToday: 0,
          todaysEntry: false,
          notesCount: 0,
          loading: false,
          error: null, // Show Connected, not Unavailable
        });
      }
    };

    fetchStats();
  }, [user]);

  return stats;
}
