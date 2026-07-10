export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: string;
          subscription_status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_end: string | null;
          trial_ends_at: string | null;
          theme_id: string;
          custom_primary_color: string | null;
          custom_background_url: string | null;
          onboarding_completed: boolean;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: string;
          subscription_status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          trial_ends_at?: string | null;
          theme_id?: string;
          custom_primary_color?: string | null;
          custom_background_url?: string | null;
          onboarding_completed?: boolean;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: string;
          subscription_status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          trial_ends_at?: string | null;
          theme_id?: string;
          custom_primary_color?: string | null;
          custom_background_url?: string | null;
          onboarding_completed?: boolean;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      themes: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_premium: boolean;
          is_custom: boolean;
          user_id: string | null;
          colors: Json;
          font_heading: string;
          font_body: string;
          background_image_url: string | null;
          background_opacity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          description?: string | null;
          is_premium?: boolean;
          is_custom?: boolean;
          user_id?: string | null;
          colors?: Json;
          font_heading?: string;
          font_body?: string;
          background_image_url?: string | null;
          background_opacity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_premium?: boolean;
          is_custom?: boolean;
          user_id?: string | null;
          colors?: Json;
          font_heading?: string;
          font_body?: string;
          background_image_url?: string | null;
          background_opacity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string;
          icon: string;
          frequency: string;
          target_days: number;
          reminder_time: string | null;
          reminder_days: number[];
          sort_order: number;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          icon?: string;
          frequency?: string;
          target_days?: number;
          reminder_time?: string | null;
          reminder_days?: number[];
          sort_order?: number;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          icon?: string;
          frequency?: string;
          target_days?: number;
          reminder_time?: string | null;
          reminder_days?: number[];
          sort_order?: number;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_date: string;
          completed_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          completed_date?: string;
          completed_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          completed_date?: string;
          completed_at?: string;
          notes?: string | null;
        };
      };
      daily_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          mood: number | null;
          energy: number | null;
          sleep_hours: number | null;
          sleep_quality: number | null;
          focus: string | null;
          gratitude: string | null;
          intention: string | null;
          schedule: Json;
          morning_notes: string | null;
          evening_reflection: string | null;
          wins: string | null;
          improvements: string | null;
          water_intake: number | null;
          steps: number | null;
          workout_done: boolean;
          workout_type: string | null;
          workout_duration: number | null;
          breakfast: string | null;
          lunch: string | null;
          dinner: string | null;
          snacks: string | null;
          oura_data: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          entry_date?: string;
          mood?: number | null;
          energy?: number | null;
          sleep_hours?: number | null;
          sleep_quality?: number | null;
          focus?: string | null;
          gratitude?: string | null;
          intention?: string | null;
          schedule?: Json;
          morning_notes?: string | null;
          evening_reflection?: string | null;
          wins?: string | null;
          improvements?: string | null;
          water_intake?: number | null;
          steps?: number | null;
          workout_done?: boolean;
          workout_type?: string | null;
          workout_duration?: number | null;
          breakfast?: string | null;
          lunch?: string | null;
          dinner?: string | null;
          snacks?: string | null;
          oura_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entry_date?: string;
          mood?: number | null;
          energy?: number | null;
          sleep_hours?: number | null;
          sleep_quality?: number | null;
          focus?: string | null;
          gratitude?: string | null;
          intention?: string | null;
          schedule?: Json;
          morning_notes?: string | null;
          evening_reflection?: string | null;
          wins?: string | null;
          improvements?: string | null;
          water_intake?: number | null;
          steps?: number | null;
          workout_done?: boolean;
          workout_type?: string | null;
          workout_duration?: number | null;
          breakfast?: string | null;
          lunch?: string | null;
          dinner?: string | null;
          snacks?: string | null;
          oura_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      weekly_reviews: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          theme: string | null;
          priorities: string[];
          wins: string | null;
          challenges: string | null;
          lessons: string | null;
          next_week_focus: string | null;
          meal_plan: Json;
          grocery_list: string[];
          cleaning_tasks: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          week_start?: string;
          theme?: string | null;
          priorities?: string[];
          wins?: string | null;
          challenges?: string | null;
          lessons?: string | null;
          next_week_focus?: string | null;
          meal_plan?: Json;
          grocery_list?: string[];
          cleaning_tasks?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start?: string;
          theme?: string | null;
          priorities?: string[];
          wins?: string | null;
          challenges?: string | null;
          lessons?: string | null;
          next_week_focus?: string | null;
          meal_plan?: Json;
          grocery_list?: string[];
          cleaning_tasks?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      monthly_reflections: {
        Row: {
          id: string;
          user_id: string;
          month_start: string;
          highlights: string | null;
          challenges: string | null;
          gratitude_list: string[];
          lessons_learned: string | null;
          goals_progress: Json;
          next_month_priorities: string[];
          next_month_goals: string[];
          budget_planned: number | null;
          budget_actual: number | null;
          expenses: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          month_start?: string;
          highlights?: string | null;
          challenges?: string | null;
          gratitude_list?: string[];
          lessons_learned?: string | null;
          goals_progress?: Json;
          next_month_priorities?: string[];
          next_month_goals?: string[];
          budget_planned?: number | null;
          budget_actual?: number | null;
          expenses?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          month_start?: string;
          highlights?: string | null;
          challenges?: string | null;
          gratitude_list?: string[];
          lessons_learned?: string | null;
          goals_progress?: Json;
          next_month_priorities?: string[];
          next_month_goals?: string[];
          budget_planned?: number | null;
          budget_actual?: number | null;
          expenses?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      yearly_goals: {
        Row: {
          id: string;
          user_id: string;
          year: number;
          word_of_year: string | null;
          vision_statement: string | null;
          goals: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          year?: number;
          word_of_year?: string | null;
          vision_statement?: string | null;
          goals?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          year?: number;
          word_of_year?: string | null;
          vision_statement?: string | null;
          goals?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string | null;
          folder: string;
          tags: string[];
          pinned: boolean;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string | null;
          folder?: string;
          tags?: string[];
          pinned?: boolean;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string | null;
          folder?: string;
          tags?: string[];
          pinned?: boolean;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: string;
          amount: number | null;
          document_date: string | null;
          description: string | null;
          file_url: string | null;
          file_name: string | null;
          file_type: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          title?: string;
          category?: string;
          amount?: number | null;
          document_date?: string | null;
          description?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          file_type?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          category?: string;
          amount?: number | null;
          document_date?: string | null;
          description?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          file_type?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      sync_queue: {
        Row: {
          id: string;
          user_id: string;
          table_name: string;
          record_id: string;
          operation: string;
          payload: Json;
          synced: boolean;
          retry_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          table_name?: string;
          record_id?: string;
          operation?: string;
          payload?: Json;
          synced?: boolean;
          retry_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          table_name?: string;
          record_id?: string;
          operation?: string;
          payload?: Json;
          synced?: boolean;
          retry_count?: number;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
