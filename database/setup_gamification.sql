-- Gamification System Setup Script
-- This script sets up the complete gamification system for Referio

-- Run the table creation migration
\i database/migrations/001_create_gamification_tables.sql

-- Run the indexes and constraints migration
\i database/migrations/002_create_gamification_indexes.sql

-- Setup signup bonus system
\i database/setup_signup_bonuses.sql

-- Create initial partner XP records for existing partners
INSERT INTO partner_xp (partner_id, total_xp, current_level, xp_to_next_level)
SELECT 
  id as partner_id,
  0 as total_xp,
  1 as current_level,
  100 as xp_to_next_level
FROM partners
WHERE id NOT IN (SELECT partner_id FROM partner_xp);

-- Create initial streak records for existing partners
INSERT INTO partner_streaks (partner_id, streak_type, current_streak, longest_streak, last_activity_date, streak_start_date)
SELECT 
  id as partner_id,
  'daily_login' as streak_type,
  0 as current_streak,
  0 as longest_streak,
  NULL as last_activity_date,
  NULL as streak_start_date
FROM partners
WHERE id NOT IN (SELECT partner_id FROM partner_streaks WHERE streak_type = 'daily_login');

-- Create initial streak records for lead creation
INSERT INTO partner_streaks (partner_id, streak_type, current_streak, longest_streak, last_activity_date, streak_start_date)
SELECT 
  id as partner_id,
  'lead_creation' as streak_type,
  0 as current_streak,
  0 as longest_streak,
  NULL as last_activity_date,
  NULL as streak_start_date
FROM partners
WHERE id NOT IN (SELECT partner_id FROM partner_streaks WHERE streak_type = 'lead_creation');

-- Create initial streak records for order completion
INSERT INTO partner_streaks (partner_id, streak_type, current_streak, longest_streak, last_activity_date, streak_start_date)
SELECT 
  id as partner_id,
  'order_completion' as streak_type,
  0 as current_streak,
  0 as longest_streak,
  NULL as last_activity_date,
  NULL as streak_start_date
FROM partners
WHERE id NOT IN (SELECT partner_id FROM partner_streaks WHERE streak_type = 'order_completion');

-- Verify setup
SELECT 'Gamification system setup completed successfully!' as status;

-- Show summary
SELECT 
  'Tables created' as item,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('partner_xp', 'xp_events', 'badges', 'partner_badges', 'levels', 'partner_streaks', 'leaderboard_cache', 'quests', 'quest_steps', 'partner_quests', 'quest_rewards')

UNION ALL

SELECT 
  'Initial levels' as item,
  COUNT(*) as count
FROM levels

UNION ALL

SELECT 
  'Initial badges' as item,
  COUNT(*) as count
FROM badges

UNION ALL

SELECT 
  'Initial quests' as item,
  COUNT(*) as count
FROM quests

UNION ALL

SELECT 
  'Partner XP records' as item,
  COUNT(*) as count
FROM partner_xp

UNION ALL

SELECT 
  'Partner streak records' as item,
  COUNT(*) as count
FROM partner_streaks;
