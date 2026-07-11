'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { format, subDays } from 'date-fns';
import HeroSection from '@/components/HeroSection';

export default function HealthPage() {
  const { user, isPro } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');

    const { data } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', user!.id)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: false });

    setEntries(data || []);
    setLoading(false);
  };

  const avgSleep = entries.length > 0
    ? (entries.reduce((sum, e) => sum + (e.sleep_hours || 0), 0) / entries.filter((e: any) => e.sleep_hours).length).toFixed(1)
    : '—';

  const avgMood = entries.length > 0
    ? (entries.reduce((sum, e) => sum + (e.mood || 0), 0) / entries.filter((e: any) => e.mood).length).toFixed(1)
    : '—';

  const avgWater = entries.length > 0
    ? Math.round(entries.reduce((sum, e) => sum + (e.water_intake || 0), 0) / entries.length)
    : '—';

  const totalSteps = entries.reduce((sum, e) => sum + (e.steps || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <HeroSection
        title="Health"
        subtitle="Data-driven insights for your wellbeing"
        imageIndex={15}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="planner-card text-center">
          <p className="text-3xl font-serif" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
            {avgSleep}
          </p>
          <p className="text-xs uppercase tracking-wider mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Avg Sleep (hrs)
          </p>
        </div>
        <div className="planner-card text-center">
          <p className="text-3xl font-serif" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
            {avgMood}
          </p>
          <p className="text-xs uppercase tracking-wider mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Avg Mood
          </p>
        </div>
        <div className="planner-card text-center">
          <p className="text-3xl font-serif" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
            {avgWater}
          </p>
          <p className="text-xs uppercase tracking-wider mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Avg Water
          </p>
        </div>
        <div className="planner-card text-center">
          <p className="text-3xl font-serif" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
            {totalSteps.toLocaleString()}
          </p>
          <p className="text-xs uppercase tracking-wider mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Total Steps
          </p>
        </div>
      </div>

      {/* Oura Integration */}
      <div className="planner-card">
        <h3 className="text-sm font-medium mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          Oura Ring Integration
        </h3>
        {!isPro ? (
          <div className="text-center py-8">
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Oura Ring integration is available on Pro plans.
            </p>
            <a href="/planner/settings" className="planner-button inline-block">
              Upgrade to Pro
            </a>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Connect your Oura Ring to automatically sync sleep, readiness, and activity data.
            </p>
            <button className="planner-button">
              Connect Oura Ring
            </button>
          </div>
        )}
      </div>

      {/* Apple Health */}
      <div className="planner-card">
        <h3 className="text-sm font-medium mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          Apple Health
        </h3>
        <div className="text-center py-8">
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Apple HealthKit integration will be available in the native app.
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            For now, manually enter your health data in the Daily view.
          </p>
        </div>
      </div>

      {/* Recent Entries Table */}
      <div className="planner-card">
        <h3 className="text-sm font-medium mb-4 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          Recent Entries
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th className="text-left text-xs py-2 px-3" style={{ color: 'var(--color-text-muted)' }}>Date</th>
                <th className="text-center text-xs py-2 px-2" style={{ color: 'var(--color-text-muted)' }}>Mood</th>
                <th className="text-center text-xs py-2 px-2" style={{ color: 'var(--color-text-muted)' }}>Sleep</th>
                <th className="text-center text-xs py-2 px-2" style={{ color: 'var(--color-text-muted)' }}>Water</th>
                <th className="text-center text-xs py-2 px-2" style={{ color: 'var(--color-text-muted)' }}>Workout</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 10).map((entry) => (
                <tr key={entry.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td className="py-2 px-3 text-sm" style={{ color: 'var(--color-text)' }}>
                    {new Date(entry.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="text-center py-2 px-2">
                    {entry.mood ? ['😢', '😕', '😐', '🙂', '😊'][entry.mood - 1] : '—'}
                  </td>
                  <td className="text-center py-2 px-2 text-sm" style={{ color: 'var(--color-text)' }}>
                    {entry.sleep_hours || '—'}
                  </td>
                  <td className="text-center py-2 px-2 text-sm" style={{ color: 'var(--color-text)' }}>
                    {entry.water_intake || '—'}
                  </td>
                  <td className="text-center py-2 px-2">
                    {entry.workout_done ? '💪' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
