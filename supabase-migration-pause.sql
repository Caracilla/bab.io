-- Add pause functionality to nursing_sessions table
ALTER TABLE nursing_sessions
ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pause_start_time BIGINT,
ADD COLUMN IF NOT EXISTS paused_duration BIGINT DEFAULT 0;

-- Update existing records to have default pause values
UPDATE nursing_sessions
SET is_paused = FALSE,
    paused_duration = 0
WHERE is_paused IS NULL;
