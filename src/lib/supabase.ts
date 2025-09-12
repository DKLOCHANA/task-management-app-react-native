import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fgbigdvnddclztsuqrzf.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_7kzLItl2AFjq5y759nKbxA_APZEGrGE';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: 'todo' | 'in_progress' | 'completed';
          priority: 'low' | 'medium' | 'high';
          due_date: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
        };
      };
      task_categories: {
        Row: {
          id: string;
          task_id: string;
          category_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          category_id: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          category_id?: string;
        };
      };
    };
  };
};