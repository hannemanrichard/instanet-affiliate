-- Migration: Create Notifications Table
-- Purpose: Notify affiliates about important events (new drops, delivered orders, bonuses, challenges)
-- Date: 2024-11-02
-- Description: Creates notifications system for affiliate marketing platform

BEGIN;

-- ==============================================
-- CREATE NOTIFICATIONS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS referio_notifications (
  id BIGSERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  
  -- Notification Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
    'order_delivered',
    'order_shipped',
    'order_cancelled',
    'commission_earned',
    'payout_processed',
    'bonus_unlocked',
    'bonus_claimed',
    'badge_earned',
    'level_up',
    'quest_completed',
    'quest_started',
    'new_drop',
    'challenge_available',
    'challenge_completed',
    'system_announcement',
    'course_completed',
    'course_new',
    'streak_milestone'
  )),
  priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Metadata
  metadata JSONB NULL, -- Extra data for specific notification types
  action_url VARCHAR(500) NULL, -- Deep link or route to relevant screen
  action_label VARCHAR(100) NULL, -- Text for action button
  
  -- Status
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ NULL,
  archived_at TIMESTAMPTZ NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- CREATE INDEXES
-- ==============================================

-- Index for querying by affiliate
CREATE INDEX IF NOT EXISTS idx_notifications_affiliate_id 
ON referio_notifications(affiliate_id);

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON referio_notifications(affiliate_id, is_read) 
WHERE is_read = FALSE;

-- Index for notification type
CREATE INDEX IF NOT EXISTS idx_notifications_type 
ON referio_notifications(notification_type);

-- Index for priority
CREATE INDEX IF NOT EXISTS idx_notifications_priority 
ON referio_notifications(priority);

-- Index for created_at for sorting
CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
ON referio_notifications(affiliate_id, created_at DESC);

-- Composite index for common queries (affiliate + unread + recent)
CREATE INDEX IF NOT EXISTS idx_notifications_affiliate_unread_recent 
ON referio_notifications(affiliate_id, is_read, created_at DESC);

-- Index for metadata JSONB queries
CREATE INDEX IF NOT EXISTS idx_notifications_metadata 
ON referio_notifications USING GIN(metadata);

-- ==============================================
-- ADD COMMENTS
-- ==============================================

COMMENT ON TABLE referio_notifications IS 'Notifications for affiliates about important events and updates';
COMMENT ON COLUMN referio_notifications.affiliate_id IS 'Affiliate who should receive the notification';
COMMENT ON COLUMN referio_notifications.title IS 'Notification title/headline';
COMMENT ON COLUMN referio_notifications.message IS 'Main notification message';
COMMENT ON COLUMN referio_notifications.notification_type IS 'Type of notification (order_delivered, bonus_unlocked, etc.)';
COMMENT ON COLUMN referio_notifications.priority IS 'Notification priority level';
COMMENT ON COLUMN referio_notifications.metadata IS 'Additional data specific to notification type (JSONB)';
COMMENT ON COLUMN referio_notifications.action_url IS 'Deep link or route to relevant screen';
COMMENT ON COLUMN referio_notifications.action_label IS 'Text for action button if applicable';
COMMENT ON COLUMN referio_notifications.is_read IS 'Whether notification has been read';
COMMENT ON COLUMN referio_notifications.is_archived IS 'Whether notification has been archived';
COMMENT ON COLUMN referio_notifications.read_at IS 'Timestamp when notification was read';
COMMENT ON COLUMN referio_notifications.archived_at IS 'Timestamp when notification was archived';

-- ==============================================
-- SET UP ROW LEVEL SECURITY (RLS)
-- ==============================================

ALTER TABLE referio_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Affiliates can view their own notifications
CREATE POLICY "Affiliates can view own notifications"
ON referio_notifications
FOR SELECT
USING (affiliate_id IN (
  SELECT id FROM affiliates WHERE clerk_user_id = current_setting('request.jwt.claim.sub', true)::text
));

-- Policy: Service role can insert notifications
CREATE POLICY "Service can insert notifications"
ON referio_notifications
FOR INSERT
WITH CHECK (true);

-- Policy: Affiliates can update their own notifications (mark as read, archive)
CREATE POLICY "Affiliates can update own notifications"
ON referio_notifications
FOR UPDATE
USING (affiliate_id IN (
  SELECT id FROM affiliates WHERE clerk_user_id = current_setting('request.jwt.claim.sub', true)::text
));

-- ==============================================
-- CREATE TRIGGERS
-- ==============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION referio_notifications_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_referio_notifications_updated_at
BEFORE UPDATE ON referio_notifications
FOR EACH ROW
EXECUTE FUNCTION referio_notifications_update_updated_at();

-- Trigger to set read_at when marking as read
CREATE OR REPLACE FUNCTION referio_notifications_update_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
    NEW.read_at = NOW();
  END IF;
  IF NEW.is_read = FALSE THEN
    NEW.read_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_referio_notifications_read_at
BEFORE UPDATE ON referio_notifications
FOR EACH ROW
EXECUTE FUNCTION referio_notifications_update_read_at();

-- Trigger to set archived_at when marking as archived
CREATE OR REPLACE FUNCTION referio_notifications_update_archived_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_archived = TRUE AND OLD.is_archived = FALSE THEN
    NEW.archived_at = NOW();
  END IF;
  IF NEW.is_archived = FALSE THEN
    NEW.archived_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_referio_notifications_archived_at
BEFORE UPDATE ON referio_notifications
FOR EACH ROW
EXECUTE FUNCTION referio_notifications_update_archived_at();

-- ==============================================
-- GRANT PERMISSIONS
-- ==============================================

GRANT ALL ON TABLE referio_notifications TO authenticated;
GRANT USAGE ON SEQUENCE referio_notifications_id_seq TO authenticated;

COMMIT;

