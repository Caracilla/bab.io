import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rcjrkxbuimoaqhkgxugy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjanJreGJ1aW1vYXFoa2d4dWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDA0NDIsImV4cCI6MjA3NjAxNjQ0Mn0.oAyhp11k6k6WVgepLN1IYoQPdJihChAXNI3YGn202wE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DiaperType = 'pee' | 'poop';
export type BreastSide = 'left' | 'right';

export interface DiaperRecord {
  id: string;
  type: DiaperType;
  created_at: string;
  user_id: string;
}

export interface FeedingRecord {
  id: string;
  created_at: string;
  user_id: string;
}

export interface NursingRecord {
  id: string;
  side: BreastSide;
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  user_id: string;
}
