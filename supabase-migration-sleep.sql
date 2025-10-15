-- Add sleep sessions table
CREATE TABLE IF NOT EXISTS sleep_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_sleep_user_created ON sleep_sessions(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE sleep_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own sleep sessions" ON sleep_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep sessions" ON sleep_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep sessions" ON sleep_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep sessions" ON sleep_sessions
  FOR DELETE USING (auth.uid() = user_id);
