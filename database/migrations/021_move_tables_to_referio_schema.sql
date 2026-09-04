-- Migration: Move Referio Tables to referio Schema
-- Purpose: Organize all Referio platform tables into referio schema
-- Date: 2024-01-XX
-- Description: Moves commissions, withdrawals, courses, and gamification tables to referio schema

BEGIN;

-- ==============================================
-- 1. CREATE REFERIO SCHEMA
-- ==============================================

CREATE SCHEMA IF NOT EXISTS referio;

-- Grant permissions on schema
GRANT USAGE ON SCHEMA referio TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA referio TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA referio TO authenticated;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA referio 
  GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA referio 
  GRANT ALL ON SEQUENCES TO authenticated;

-- ==============================================
-- 2. MOVE COMMISSIONS & WITHDRAWALS
-- ==============================================

ALTER TABLE commissions SET SCHEMA referio;
ALTER TABLE affiliate_withdrawals SET SCHEMA referio;

-- ==============================================
-- 3. MOVE GAMIFICATION TABLES (rf_*)
-- ==============================================

ALTER TABLE rf_affiliate_xp SET SCHEMA referio;
ALTER TABLE rf_badges SET SCHEMA referio;
ALTER TABLE rf_quests SET SCHEMA referio;
ALTER TABLE rf_quest_steps SET SCHEMA referio;
ALTER TABLE rf_xp_events SET SCHEMA referio;
ALTER TABLE rf_levels SET SCHEMA referio;
ALTER TABLE rf_leaderboard_cache SET SCHEMA referio;
ALTER TABLE rf_affiliate_bonuses SET SCHEMA referio;
ALTER TABLE rf_affiliate_streaks SET SCHEMA referio;

-- ==============================================
-- 4. MOVE COURSE TABLES
-- ==============================================

ALTER TABLE courses SET SCHEMA referio;
ALTER TABLE course_modules SET SCHEMA referio;
ALTER TABLE course_videos SET SCHEMA referio;
ALTER TABLE course_enrollments SET SCHEMA referio;
ALTER TABLE course_progress SET SCHEMA referio;
ALTER TABLE video_progress SET SCHEMA referio;
ALTER TABLE video_milestones SET SCHEMA referio;
ALTER TABLE course_completions SET SCHEMA referio;
ALTER TABLE course_analytics SET SCHEMA referio;

-- ==============================================
-- 5. UPDATE FOREIGN KEYS IN COURSE TABLES
-- ==============================================
-- Note: Course tables reference 'partners' but should reference 'affiliates'
-- This will be handled in a separate migration to rename columns

-- For now, just verify foreign keys point to public.affiliates (or update if needed)
-- Course tables should reference: public.affiliates.id

-- ==============================================
-- 6. VERIFY MOVES
-- ==============================================

-- List all tables in referio schema
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'referio';
    
    RAISE NOTICE 'Successfully moved % tables to referio schema', table_count;
END $$;

-- ==============================================
-- 7. COMMENTS
-- ==============================================

COMMENT ON SCHEMA referio IS 'Referio affiliate marketing platform - all platform-specific tables including orders, commissions, courses, and gamification';

COMMIT;

