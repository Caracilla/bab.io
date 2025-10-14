import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rcjrkxbuimoaqhkgxugy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjanJreGJ1aW1vYXFoa2d4dWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDA0NDIsImV4cCI6MjA3NjAxNjQ0Mn0.oAyhp11k6k6WVgepLN1IYoQPdJihChAXNI3YGn202wE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
