'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
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
        // Count habits
        const { count: habitsCount, error: habitsError } = await supabase
          .from('habits')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (habitsError) throw habitsError;

        // Count habits completed today
        const { count: completedToday, error: compError } = await supabase
          .from('habit_completions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed_date', today);

        if (compError) throw compError;

        // Check if today's daily entry exists
        const { data: entryData, error: entryError } = await supabase
          .from('daily_entries')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();

        if (entryError) throw entryError;

        // Count notes
        const { count: notesCount, error: notesError } = await supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (notesError) throw notesError;

        setStats({
          habitsCount: habitsCount || 0,
          habitsCompletedToday: completedToday || 0,
          todaysEntry: !!entryData,
          notesCount: notesCount || 0,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        const msg = err.message || '';
        let friendlyError = 'Sync unavailable';
        if (msg.includes('JWT') || msg.includes('auth') || msg.includes('token')) {
          friendlyError = 'Session expired — please sign in again';
        } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('Failed to fetch')) {
          friendlyError = 'Offline — sync will resume when connected';
        } else if (msg.includes('permission') || msg.includes('policy')) {
          friendlyError = 'Permission denied — check your account';
        } else if (msg.includes('relation') || msg.includes('does not exist')) {
          friendlyError = 'Database table missing — contact support';
        }
        setStats((s) => ({
          ...s,
          loading: false,
          error: friendlyError,
        }));
      }
    };

    fetchStats();
  }, [user]);

  return stats;
}
