'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import type { Habit, HabitCompletion } from '@/types';

export default function HabitsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#D4A574');
  const [newHabitFrequency, setNewHabitFrequency] = useState<'daily' | 'weekly'>('daily');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const colors = [
    '#D4A574', '#7A9E6E', '#9B7EDE', '#C4703E', '#D4A5A5',
    '#5B8DB8', '#B8A070', '#6B8E6B', '#C4706B', '#8B8680',
  ];

  useEffect(() => {
    if (!user) return;
    loadHabits();
  }, [user]);

  const loadHabits = async () => {
    setLoading(true);
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user!.id)
      .eq('archived', false)
      .order('sort_order');

    const habitsList = habitsData as Habit[] || [];
    setHabits(habitsList);

    // Calculate streaks for each habit
    const streakMap: Record<string, number> = {};
    for (const habit of habitsList) {
      const streak = await calculateStreak(habit.id);
      streakMap[habit.id] = streak;
    }
    setStreaks(streakMap);
    setLoading(false);
  };

  const calculateStreak = async (habitId: string): Promise<number> => {
    // Get all completions for this habit, ordered by date desc
    const { data } = await supabase
      .from('habit_completions')
      .select('completed_date')
      .eq('habit_id', habitId)
      .eq('user_id', user!.id)
      .order('completed_date', { ascending: false });

    if (!data || data.length === 0) return 0;

    const dates = data.map((d: HabitCompletion) => new Date(d.completed_date));
    let streak = 1;
    let currentDate = dates[0];

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);

      if (dates[i].toDateString() === prevDate.toDateString()) {
        streak++;
        currentDate = dates[i];
      } else {
        break;
      }
    }

    // Check if streak is current (today or yesterday was the last completion)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastCompletion = dates[0];
    lastCompletion.setHours(0, 0, 0, 0);

    if (lastCompletion.getTime() !== today.getTime() && lastCompletion.getTime() !== yesterday.getTime()) {
      return 0; // Streak broken
    }

    return streak;
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim() || !user) return;

    const { error } = await supabase.from('habits').insert({
      user_id: user.id,
      name: newHabitName.trim(),
      color: newHabitColor,
      frequency: newHabitFrequency,
      sort_order: habits.length,
    });

    if (!error) {
      setNewHabitName('');
      loadHabits();
    }
  };

  const archiveHabit = async (id: string) => {
    await supabase.from('habits').update({ archived: true }).eq('id', id);
    loadHabits();
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '✨';
    if (streak >= 7) return '⭐';
    if (streak >= 3) return '💫';
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-serif" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
        Habits
      </h2>

      {/* Add Habit */}
      <form onSubmit={addHabit} className="planner-card space-y-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>
              New Habit
            </label>
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="What habit do you want to build?"
              className="planner-input w-full"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>
              Frequency
            </label>
            <select
              value={newHabitFrequency}
              onChange={(e) => setNewHabitFrequency(e.target.value as 'daily' | 'weekly')}
              className="planner-input"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <button type="submit" className="planner-button px-6">
            Add
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Color:</span>
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setNewHabitColor(c)}
              className="w-6 h-6 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                border: newHabitColor === c ? '2px solid var(--color-text)' : '2px solid transparent',
              }}
            />
          ))}
        </div>
      </form>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.map((habit) => {
          const streak = streaks[habit.id] || 0;
          const badge = getStreakBadge(streak);

          return (
            <div key={habit.id} className="planner-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: habit.color || 'var(--color-accent)' }}
                  />
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {habit.name}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
                  >
                    {habit.frequency}
                  </span>
                  {streak > 0 && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                    >
                      {badge} {streak} day{streak !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => archiveHabit(habit.id)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--color-error)', backgroundColor: 'var(--color-bg)' }}
                >
                  Archive
                </button>
              </div>

              {/* Streak visualization */}
              {streak > 0 && (
                <div className="mt-3">
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(streak, 14) }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-2 rounded-full"
                        style={{ backgroundColor: habit.color || 'var(--color-accent)' }}
                      />
                    ))}
                    {streak > 14 && (
                      <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
                        +{streak - 14} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {habits.length === 0 && (
          <div className="planner-card text-center py-12">
            <p style={{ color: 'var(--color-text-muted)' }}>
              No habits yet. Add your first habit above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
