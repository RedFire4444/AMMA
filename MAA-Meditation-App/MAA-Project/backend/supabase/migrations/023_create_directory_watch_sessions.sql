-- =====================================================
-- Migration 022: Create directory watch sessions table
-- Tracks user-specific watch time for directory items
-- =====================================================

CREATE TABLE IF NOT EXISTS directory_watch_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content_directory(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_directory_watch_user ON directory_watch_sessions (user_id);

ALTER TABLE directory_watch_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_watch_sessions FORCE ROW LEVEL SECURITY;

CREATE POLICY "directory_watch_select_own" ON directory_watch_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "directory_watch_insert_own" ON directory_watch_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
