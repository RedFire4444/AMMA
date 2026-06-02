-- =====================================================
-- Phase 13: Live Events Tables Integration
-- =====================================================

-- 1. Alter existing events table to support YouTube specifics
ALTER TABLE events
ADD COLUMN IF NOT EXISTS youtube_video_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS viewer_count INTEGER DEFAULT 0;

-- 2. Create event_reminders table
CREATE TABLE IF NOT EXISTS event_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- 3. Create event_views table for watch tracking
CREATE TABLE IF NOT EXISTS event_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    watch_duration_seconds INTEGER DEFAULT 0,
    last_pinged_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- 4. Create event_analytics table
CREATE TABLE IF NOT EXISTS event_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE UNIQUE,
    peak_concurrent_viewers INTEGER DEFAULT 0,
    total_unique_viewers INTEGER DEFAULT 0,
    total_reminder_clicks INTEGER DEFAULT 0,
    total_notification_opens INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_event_reminders_event_id ON event_reminders (event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_user_id ON event_reminders (user_id);
CREATE INDEX IF NOT EXISTS idx_event_views_event_id ON event_views (event_id);
CREATE INDEX IF NOT EXISTS idx_event_views_user_id ON event_views (user_id);

-- Auto-update timestamp triggers
CREATE TRIGGER update_event_analytics_updated_at
  BEFORE UPDATE ON event_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
