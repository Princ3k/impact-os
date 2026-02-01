-- Standup cache table for storing generated standups
-- Prevents redundant AI calls when entries haven't changed
CREATE TABLE IF NOT EXISTS standup_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entries_hash TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE standup_cache ENABLE ROW LEVEL SECURITY;

-- Users can only access their own cache
CREATE POLICY "Users can manage their own standup cache"
  ON standup_cache
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Rate limiting table to track API usage per user per day
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'standup' or 'report'
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, action, date)
);

-- Enable RLS
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only access their own rate limits
CREATE POLICY "Users can manage their own rate limits"
  ON api_rate_limits
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_rate_limits_lookup ON api_rate_limits(user_id, action, date);

-- Optional: Auto-cleanup old cache entries (older than 24 hours)
-- Run this periodically via Supabase cron or Edge Function
-- DELETE FROM standup_cache WHERE created_at < NOW() - INTERVAL '24 hours';

-- Optional: Auto-cleanup old rate limit entries (older than 7 days)
-- DELETE FROM api_rate_limits WHERE date < CURRENT_DATE - INTERVAL '7 days';
