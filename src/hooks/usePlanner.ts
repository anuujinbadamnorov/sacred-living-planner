'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

// ─── Types ───

interface Task { id: string; text: string; completed: boolean; time?: string; category?: string }
interface Event { id: string; title: string; time: string; duration?: string; category?: string; description?: string }
interface Budget { id: string; category: string; amount: number; type: 'income' | 'expense' }
interface Note { id: string; text: string; createdAt: string }
interface Habit { id: string; name: string; completed: boolean; streak: number; color: string; frequency: string; bestStreak: number; history: Record<string, boolean> }
interface MoodEntry { rating: number; label: string; note: string; timestamp: string }
interface JournalEntry { title: string; content: string; gratitude: string; intentions: string; timestamp: string; category: string; wordCount: number }
interface FocusEntry { focus: string; goals: string[]; priorities: string[]; timestamp: string }
interface OuraData { sleepScore: number; readiness: number; hrv: number; temp: number; steps: number; calories: number; sleepDuration: number; restingHR: number; spo2: number; activityScore: number }

const LS = {
  tasks: 'planner-tasks',
  events: 'planner-events',
  budget: 'planner-budget',
  habits: 'planner-habits',
  notes: 'planner-notes',
  mood: 'planner-mood',
  journal: 'planner-journal',
  focus: 'planner-focus',
  oura: 'planner-oura',
  theme: 'planner-theme',
  goals: 'planner-goals',
  reflections: 'planner-reflections',
  health: 'planner-health',
  meals: 'planner-meals',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Hook ───

export function usePlanner() {
  const { user } = useAuth();
  const [forceUpdate, setForceUpdate] = useState(0);
  const supabase = createClient();

  const refresh = useCallback(() => setForceUpdate((n) => n + 1), []);

  // ─── Tasks ───
  const getTasks = useCallback((date: string) => {
    const all = getItem<Record<string, Task[]>>(LS.tasks, {});
    return all[date] || [];
  }, [forceUpdate]);

  const saveTask = useCallback((date: string, task: Task) => {
    const all = getItem<Record<string, Task[]>>(LS.tasks, {});
    if (!all[date]) all[date] = [];
    const idx = all[date].findIndex((t) => t.id === task.id);
    if (idx >= 0) all[date][idx] = task;
    else all[date].push(task);
    setItem(LS.tasks, all);

    // Sync to Supabase if logged in
    if (user) {
      supabase.rpc('save_daily_entry_field', {
        p_user_id: user.id,
        p_date: date,
        p_field: 'tasks',
        p_value: all[date],
      }).catch(() => {});
    }
    refresh();
  }, [user, supabase, refresh]);

  const deleteTask = useCallback((date: string, id: string) => {
    const all = getItem<Record<string, Task[]>>(LS.tasks, {});
    if (all[date]) {
      all[date] = all[date].filter((t) => t.id !== id);
      setItem(LS.tasks, all);
      if (user) {
        supabase.rpc('save_daily_entry_field', {
          p_user_id: user.id,
          p_date: date,
          p_field: 'tasks',
          p_value: all[date],
        }).catch(() => {});
      }
      refresh();
    }
  }, [user, supabase, refresh]);

  // ─── Events ───
  const getEvents = useCallback((date: string) => {
    const all = getItem<Record<string, Event[]>>(LS.events, {});
    return all[date] || [];
  }, [forceUpdate]);

  const saveEvent = useCallback((date: string, event: Event) => {
    const all = getItem<Record<string, Event[]>>(LS.events, {});
    if (!all[date]) all[date] = [];
    const idx = all[date].findIndex((e) => e.id === event.id);
    if (idx >= 0) all[date][idx] = event;
    else all[date].push(event);
    setItem(LS.events, all);

    if (user) {
      supabase.rpc('save_daily_entry_field', {
        p_user_id: user.id,
        p_date: date,
        p_field: 'events',
        p_value: all[date],
      }).catch(() => {});
    }
    refresh();
  }, [user, supabase, refresh]);

  const deleteEvent = useCallback((date: string, id: string) => {
    const all = getItem<Record<string, Event[]>>(LS.events, {});
    if (all[date]) {
      all[date] = all[date].filter((e) => e.id !== id);
      setItem(LS.events, all);
      if (user) {
        supabase.rpc('save_daily_entry_field', {
          p_user_id: user.id,
          p_date: date,
          p_field: 'events',
          p_value: all[date],
        }).catch(() => {});
      }
      refresh();
    }
  }, [user, supabase, refresh]);

  // ─── Budget ───
  const getBudget = useCallback((date: string) => {
    const all = getItem<Record<string, Budget[]>>(LS.budget, {});
    return all[date] || [];
  }, [forceUpdate]);

  const saveBudget = useCallback((date: string, budget: Budget) => {
    const all = getItem<Record<string, Budget[]>>(LS.budget, {});
    if (!all[date]) all[date] = [];
    const idx = all[date].findIndex((b) => b.id === budget.id);
    if (idx >= 0) all[date][idx] = budget;
    else all[date].push(budget);
    setItem(LS.budget, all);
    refresh();
  }, [refresh]);

  const deleteBudget = useCallback((date: string, id: string) => {
    const all = getItem<Record<string, Budget[]>>(LS.budget, {});
    if (all[date]) {
      all[date] = all[date].filter((b) => b.id !== id);
      setItem(LS.budget, all);
      refresh();
    }
  }, [refresh]);

  // ─── Habits ───
  const getHabits = useCallback(() => {
    return getItem<Habit[]>(LS.habits, []);
  }, [forceUpdate]);

  const saveHabit = useCallback((habit: Habit) => {
    const habits = getItem<Habit[]>(LS.habits, []);
    const idx = habits.findIndex((h) => h.id === habit.id);
    if (idx >= 0) habits[idx] = habit;
    else habits.push(habit);
    setItem(LS.habits, habits);

    if (user) {
      supabase.from('habits').upsert({
        id: habit.id,
        user_id: user.id,
        name: habit.name,
        description: '',
        frequency: habit.frequency,
        color: habit.color,
        reminder_time: null,
        is_active: true,
      }).catch(() => {});
    }
    refresh();
  }, [user, supabase, refresh]);

  const deleteHabit = useCallback((id: string) => {
    const habits = getItem<Habit[]>(LS.habits, []);
    setItem(LS.habits, habits.filter((h) => h.id !== id));
    if (user) {
      supabase.from('habits').delete().eq('id', id).catch(() => {});
    }
    refresh();
  }, [user, supabase, refresh]);

  const toggleHabit = useCallback((id: string) => {
    const habits = getItem<Habit[]>(LS.habits, []);
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];
    habit.completed = !habit.completed;
    if (!habit.history) habit.history = {};
    habit.history[today] = habit.completed;

    if (habit.completed) {
      habit.streak = (habit.streak || 0) + 1;
      if (habit.streak > (habit.bestStreak || 0)) habit.bestStreak = habit.streak;
    } else {
      habit.streak = 0;
    }

    setItem(LS.habits, habits);

    if (user) {
      if (habit.completed) {
        supabase.from('habit_completions').insert({
          user_id: user.id,
          habit_id: id,
          completed_date: today,
        }).catch(() => {});
      } else {
        supabase.from('habit_completions').delete()
          .eq('user_id', user.id)
          .eq('habit_id', id)
          .eq('completed_date', today)
          .catch(() => {});
      }
    }
    refresh();
  }, [user, supabase, refresh]);

  // ─── Notes ───
  const getNotes = useCallback((date: string) => {
    const all = getItem<Record<string, Note[]>>(LS.notes, {});
    return all[date] || [];
  }, [forceUpdate]);

  const saveNote = useCallback((date: string, note: Note) => {
    const all = getItem<Record<string, Note[]>>(LS.notes, {});
    if (!all[date]) all[date] = [];
    const idx = all[date].findIndex((n) => n.id === note.id);
    if (idx >= 0) all[date][idx] = note;
    else all[date].push(note);
    setItem(LS.notes, all);

    if (user) {
      supabase.from('notes').insert({
        user_id: user.id,
        title: `Note from ${date}`,
        content: note.text,
        category: 'general',
        is_pinned: false,
      }).catch(() => {});
    }
    refresh();
  }, [user, supabase, refresh]);

  const deleteNote = useCallback((date: string, id: string) => {
    const all = getItem<Record<string, Note[]>>(LS.notes, {});
    if (all[date]) {
      all[date] = all[date].filter((n) => n.id !== id);
      setItem(LS.notes, all);
      refresh();
    }
  }, [refresh]);

  // ─── Mood ───
  const getMood = useCallback((date: string) => {
    const all = getItem<Record<string, MoodEntry>>(LS.mood, {});
    return all[date] || null;
  }, [forceUpdate]);

  const saveMood = useCallback((date: string, mood: MoodEntry) => {
    const all = getItem<Record<string, MoodEntry>>(LS.mood, {});
    all[date] = mood;
    setItem(LS.mood, all);

    if (user) {
      supabase.rpc('save_daily_entry_field', {
        p_user_id: user.id,
        p_date: date,
        p_field: 'mood',
        p_value: mood,
      }).catch(() => {});
    }
    refresh();
  }, [user, supabase, refresh]);

  // ─── Journal ───
  const getJournal = useCallback((date: string) => {
    const all = getItem<Record<string, JournalEntry>>(LS.journal, {});
    return all[date] || null;
  }, [forceUpdate]);

  const saveJournal = useCallback((date: string, entry: JournalEntry) => {
    const all = getItem<Record<string, JournalEntry>>(LS.journal, {});
    all[date] = entry;
    setItem(LS.journal, all);
    refresh();
  }, [refresh]);

  // ─── Focus ───
  const getFocus = useCallback((date: string) => {
    const all = getItem<Record<string, FocusEntry>>(LS.focus, {});
    return all[date] || null;
  }, [forceUpdate]);

  const saveFocus = useCallback((date: string, focus: FocusEntry) => {
    const all = getItem<Record<string, FocusEntry>>(LS.focus, {});
    all[date] = focus;
    setItem(LS.focus, all);
    refresh();
  }, [refresh]);

  // ─── Oura ───
  const getOura = useCallback((date: string) => {
    const all = getItem<Record<string, OuraData>>(LS.oura, {});
    return all[date] || null;
  }, [forceUpdate]);

  const saveOura = useCallback((date: string, data: OuraData) => {
    const all = getItem<Record<string, OuraData>>(LS.oura, {});
    all[date] = data;
    setItem(LS.oura, all);
    refresh();
  }, [refresh]);

  // ─── Theme ───
  const getTheme = useCallback(() => {
    return getItem<string>(LS.theme, 'light');
  }, [forceUpdate]);

  const saveTheme = useCallback((theme: string) => {
    setItem(LS.theme, theme);
    refresh();
  }, [refresh]);

  // ─── Goals ───
  const getGoals = useCallback(() => {
    return getItem<any[]>(LS.goals, []);
  }, [forceUpdate]);

  const saveGoal = useCallback((goal: any) => {
    const goals = getItem<any[]>(LS.goals, []);
    const idx = goals.findIndex((g) => g.id === goal.id);
    if (idx >= 0) goals[idx] = goal;
    else goals.push(goal);
    setItem(LS.goals, goals);
    refresh();
  }, [refresh]);

  const deleteGoal = useCallback((id: string) => {
    const goals = getItem<any[]>(LS.goals, []);
    setItem(LS.goals, goals.filter((g) => g.id !== id));
    refresh();
  }, [refresh]);

  // ─── Reflections ───
  const getReflections = useCallback((month: string) => {
    const all = getItem<Record<string, any[]>>(LS.reflections, {});
    return all[month] || [];
  }, [forceUpdate]);

  const saveReflection = useCallback((month: string, reflection: any) => {
    const all = getItem<Record<string, any[]>>(LS.reflections, {});
    if (!all[month]) all[month] = [];
    const idx = all[month].findIndex((r) => r.id === reflection.id);
    if (idx >= 0) all[month][idx] = reflection;
    else all[month].push(reflection);
    setItem(LS.reflections, all);
    refresh();
  }, [refresh]);

  const deleteReflection = useCallback((month: string, id: string) => {
    const all = getItem<Record<string, any[]>>(LS.reflections, {});
    if (all[month]) {
      all[month] = all[month].filter((r) => r.id !== id);
      setItem(LS.reflections, all);
      refresh();
    }
  }, [refresh]);

  // ─── Health ───
  const getHealth = useCallback(() => {
    return getItem<any[]>(LS.health, []);
  }, [forceUpdate]);

  const saveHealth = useCallback((entry: any) => {
    const health = getItem<any[]>(LS.health, []);
    const idx = health.findIndex((h) => h.id === entry.id);
    if (idx >= 0) health[idx] = entry;
    else health.push(entry);
    setItem(LS.health, health);
    refresh();
  }, [refresh]);

  const deleteHealth = useCallback((id: string) => {
    const health = getItem<any[]>(LS.health, []);
    setItem(LS.health, health.filter((h) => h.id !== id));
    refresh();
  }, [refresh]);

  // ─── Meals ───
  const getMeals = useCallback((date: string) => {
    const all = getItem<Record<string, any[]>>(LS.meals, {});
    return all[date] || [];
  }, [forceUpdate]);

  const saveMeal = useCallback((date: string, meal: any) => {
    const all = getItem<Record<string, any[]>>(LS.meals, {});
    if (!all[date]) all[date] = [];
    const idx = all[date].findIndex((m) => m.id === meal.id);
    if (idx >= 0) all[date][idx] = meal;
    else all[date].push(meal);
    setItem(LS.meals, all);
    refresh();
  }, [refresh]);

  const deleteMeal = useCallback((date: string, id: string) => {
    const all = getItem<Record<string, any[]>>(LS.meals, {});
    if (all[date]) {
      all[date] = all[date].filter((m) => m.id !== id);
      setItem(LS.meals, all);
      refresh();
    }
  }, [refresh]);

  return {
    getTasks, saveTask, deleteTask,
    getEvents, saveEvent, deleteEvent,
    getBudget, saveBudget, deleteBudget,
    getHabits, saveHabit, deleteHabit, toggleHabit,
    getNotes, saveNote, deleteNote,
    getMood, saveMood,
    getJournal, saveJournal,
    getFocus, saveFocus,
    getOura, saveOura,
    getTheme, saveTheme,
    getGoals, saveGoal, deleteGoal,
    getReflections, saveReflection, deleteReflection,
    getHealth, saveHealth, deleteHealth,
    getMeals, saveMeal, deleteMeal,
    refresh,
  };
}
