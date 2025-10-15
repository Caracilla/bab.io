-- Diaper changes table (Çiş ve Kaka kayıtları)
CREATE TABLE diaper_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pee', 'poop')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feeding records table (Mama kayıtları)
CREATE TABLE feeding_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nursing sessions table (Meme verme kayıtları)
CREATE TABLE nursing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('left', 'right')),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  is_paused BOOLEAN DEFAULT FALSE,
  pause_start_time BIGINT,
  paused_duration BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_diaper_user_created ON diaper_changes(user_id, created_at DESC);
CREATE INDEX idx_feeding_user_created ON feeding_records(user_id, created_at DESC);
CREATE INDEX idx_nursing_user_created ON nursing_sessions(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE diaper_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursing_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only see their own data)
CREATE POLICY "Users can view own diaper changes" ON diaper_changes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diaper changes" ON diaper_changes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own diaper changes" ON diaper_changes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own feeding records" ON feeding_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feeding records" ON feeding_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own feeding records" ON feeding_records
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own nursing sessions" ON nursing_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nursing sessions" ON nursing_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nursing sessions" ON nursing_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nursing sessions" ON nursing_sessions
  FOR DELETE USING (auth.uid() = user_id);
