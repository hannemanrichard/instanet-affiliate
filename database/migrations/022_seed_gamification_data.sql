-- Migration: Seed Initial Gamification Data
-- Purpose: Create initial gamification data for the platform
-- Date: 2024-01-XX
-- Description: Inserts sample levels, badges, quests, and bonus configurations

-- Insert levels
INSERT INTO rf_levels (level_number, name, description, xp_required, benefits, icon_url) VALUES
(1, 'Novice', 'Just starting your affiliate journey', 0, '{"commission_rate": 5.0, "features": ["basic_dashboard"]}', 'https://example.com/icons/level-1.svg'),
(2, 'Apprentice', 'Learning the ropes', 100, '{"commission_rate": 7.0, "features": ["basic_dashboard", "order_tracking"]}', 'https://example.com/icons/level-2.svg'),
(3, 'Associate', 'Getting the hang of it', 300, '{"commission_rate": 8.0, "features": ["basic_dashboard", "order_tracking", "analytics"]}', 'https://example.com/icons/level-3.svg'),
(4, 'Professional', 'Proven performer', 600, '{"commission_rate": 9.0, "features": ["basic_dashboard", "order_tracking", "analytics", "priority_support"]}', 'https://example.com/icons/level-4.svg'),
(5, 'Expert', 'Master of the craft', 1000, '{"commission_rate": 10.0, "features": ["basic_dashboard", "order_tracking", "analytics", "priority_support", "advanced_tools"]}', 'https://example.com/icons/level-5.svg'),
(6, 'Master', 'Elite affiliate', 1500, '{"commission_rate": 11.0, "features": ["basic_dashboard", "order_tracking", "analytics", "priority_support", "advanced_tools", "exclusive_products"]}', 'https://example.com/icons/level-6.svg'),
(7, 'Grandmaster', 'Legendary status', 2200, '{"commission_rate": 12.0, "features": ["basic_dashboard", "order_tracking", "analytics", "priority_support", "advanced_tools", "exclusive_products", "mentor_access"]}', 'https://example.com/icons/level-7.svg'),
(8, 'Champion', 'Ultimate achievement', 3000, '{"commission_rate": 13.0, "features": ["basic_dashboard", "order_tracking", "analytics", "priority_support", "advanced_tools", "exclusive_products", "mentor_access", "custom_branding"]}', 'https://example.com/icons/level-8.svg');

-- Insert badges
INSERT INTO rf_badges (name, description, icon_url, category, rarity, xp_reward, criteria) VALUES
-- Performance badges
('First Order', 'Complete your first order', 'https://example.com/icons/first-order.svg', 'performance', 'common', 50, '{"type": "orders_completed", "value": 1}'),
('Order Master', 'Complete 10 orders', 'https://example.com/icons/order-master.svg', 'performance', 'rare', 200, '{"type": "orders_completed", "value": 10}'),
('Sales Champion', 'Complete 50 orders', 'https://example.com/icons/sales-champion.svg', 'performance', 'epic', 500, '{"type": "orders_completed", "value": 50}'),
('Sales Legend', 'Complete 100 orders', 'https://example.com/icons/sales-legend.svg', 'performance', 'legendary', 1000, '{"type": "orders_completed", "value": 100}'),

-- Level badges
('Level Up', 'Reach level 5', 'https://example.com/icons/level-up.svg', 'milestone', 'rare', 100, '{"type": "level", "value": 5}'),
('Expert Status', 'Reach level 10', 'https://example.com/icons/expert-status.svg', 'milestone', 'epic', 300, '{"type": "level", "value": 10}'),
('Master Level', 'Reach level 15', 'https://example.com/icons/master-level.svg', 'milestone', 'legendary', 500, '{"type": "level", "value": 15}'),

-- XP badges
('XP Collector', 'Earn 500 XP', 'https://example.com/icons/xp-collector.svg', 'milestone', 'common', 50, '{"type": "total_xp", "value": 500}'),
('XP Master', 'Earn 2000 XP', 'https://example.com/icons/xp-master.svg', 'milestone', 'rare', 200, '{"type": "total_xp", "value": 2000}'),
('XP Legend', 'Earn 5000 XP', 'https://example.com/icons/xp-legend.svg', 'milestone', 'epic', 500, '{"type": "total_xp", "value": 5000}'),

-- Streak badges
('Consistent', 'Maintain a 7-day streak', 'https://example.com/icons/consistent.svg', 'consistency', 'rare', 100, '{"type": "streak_days", "value": 7}'),
('Dedicated', 'Maintain a 30-day streak', 'https://example.com/icons/dedicated.svg', 'consistency', 'epic', 300, '{"type": "streak_days", "value": 30}'),
('Unstoppable', 'Maintain a 100-day streak', 'https://example.com/icons/unstoppable.svg', 'consistency', 'legendary', 1000, '{"type": "streak_days", "value": 100}'),

-- Course badges
('Student', 'Complete your first course', 'https://example.com/icons/student.svg', 'learning', 'common', 100, '{"type": "course_completed", "value": 1}'),
('Scholar', 'Complete 5 courses', 'https://example.com/icons/scholar.svg', 'learning', 'rare', 300, '{"type": "course_completed", "value": 5}'),
('Graduate', 'Complete 10 courses', 'https://example.com/icons/graduate.svg', 'learning', 'epic', 500, '{"type": "course_completed", "value": 10}'),

-- Special badges
('Early Bird', 'Join the platform in the first month', 'https://example.com/icons/early-bird.svg', 'special', 'legendary', 200, '{"type": "special", "value": 1}'),
('Team Player', 'Refer 5 affiliates', 'https://example.com/icons/team-player.svg', 'social', 'epic', 400, '{"type": "referrals", "value": 5}'),
('Community Leader', 'Refer 20 affiliates', 'https://example.com/icons/community-leader.svg', 'social', 'legendary', 800, '{"type": "referrals", "value": 20}');

-- Insert bonus configurations
INSERT INTO rf_bonus_configurations (bonus_type, bonus_amount, currency, xp_required, description) VALUES
('signup', 5000.00, 'DZD', 100, 'Welcome bonus for new affiliates - earn 100 XP to unlock'),
('level_5', 2000.00, 'DZD', 0, 'Bonus for reaching level 5'),
('level_10', 5000.00, 'DZD', 0, 'Bonus for reaching level 10'),
('first_order', 1000.00, 'DZD', 0, 'Bonus for completing first order'),
('course_completion', 500.00, 'DZD', 0, 'Bonus for completing platform course');

-- Insert initial quests
INSERT INTO rf_quests (title, description, quest_type, difficulty, xp_reward, is_active, is_repeatable) VALUES
-- Tutorial quests
('Welcome to Referio', 'Complete your profile setup and explore the platform', 'tutorial', 'easy', 100, true, false),
('First Steps', 'Create your first order and understand the process', 'tutorial', 'easy', 150, true, false),
('Platform Navigation', 'Explore all main sections of the platform', 'tutorial', 'easy', 75, true, false),

-- Achievement quests
('Order Master', 'Complete 10 orders successfully', 'achievement', 'medium', 500, true, false),
('Course Completion', 'Complete the platform training course', 'achievement', 'medium', 300, true, false),
('Streak Keeper', 'Maintain activity for 7 consecutive days', 'achievement', 'medium', 200, true, false),

-- Daily quests
('Daily Activity', 'Log in and check your dashboard', 'daily', 'easy', 25, true, true),
('Order Creator', 'Create at least one order today', 'daily', 'easy', 50, true, true),
('Learning Time', 'Watch at least one course video today', 'daily', 'easy', 30, true, true),

-- Weekly quests
('Weekly Performer', 'Complete 5 orders this week', 'weekly', 'medium', 200, true, true),
('Learning Week', 'Complete 3 course videos this week', 'weekly', 'medium', 150, true, true),
('Consistent Growth', 'Maintain 5-day activity streak', 'weekly', 'medium', 100, true, true);

-- Insert quest steps for tutorial quests
DO $$
DECLARE
  quest_id_val UUID;
BEGIN
  -- Welcome to Referio quest steps
  SELECT id INTO quest_id_val FROM rf_quests WHERE title = 'Welcome to Referio';
  
  INSERT INTO rf_quest_steps (quest_id, step_number, title, description, action_type, action_data) VALUES
  (quest_id_val, 1, 'Complete Profile', 'Fill out your affiliate profile information', 'profile_update', '{"fields": ["fullname", "bio", "avatar"]}'),
  (quest_id_val, 2, 'Explore Dashboard', 'Navigate through the main dashboard sections', 'navigation', '{"sections": ["orders", "commissions", "profile"]}'),
  (quest_id_val, 3, 'Check Settings', 'Review and update your account settings', 'settings_update', '{"sections": ["notifications", "preferences"]}');
  
  -- First Steps quest steps
  SELECT id INTO quest_id_val FROM rf_quests WHERE title = 'First Steps';
  
  INSERT INTO rf_quest_steps (quest_id, step_number, title, description, action_type, action_data) VALUES
  (quest_id_val, 1, 'Create Order', 'Create your first order for a customer', 'order_creation', '{"required_fields": ["customer_info", "products", "payment"]}'),
  (quest_id_val, 2, 'Track Order', 'Monitor your order status', 'order_tracking', '{"status_check": true}'),
  (quest_id_val, 3, 'View Commission', 'Check your commission for the order', 'commission_view', '{"commission_check": true}');
  
  -- Platform Navigation quest steps
  SELECT id INTO quest_id_val FROM rf_quests WHERE title = 'Platform Navigation';
  
  INSERT INTO rf_quest_steps (quest_id, step_number, title, description, action_type, action_data) VALUES
  (quest_id_val, 1, 'Visit Orders Section', 'Navigate to the orders management section', 'navigation', '{"section": "orders"}'),
  (quest_id_val, 2, 'Visit Commissions Section', 'Navigate to the commissions tracking section', 'navigation', '{"section": "commissions"}'),
  (quest_id_val, 3, 'Visit Profile Section', 'Navigate to your profile management section', 'navigation', '{"section": "profile"}'),
  (quest_id_val, 4, 'Visit Courses Section', 'Navigate to the learning courses section', 'navigation', '{"section": "courses"}');
END $$;

-- Insert quest rewards
INSERT INTO rf_quest_rewards (quest_id, reward_type, reward_value, reward_data)
SELECT 
  q.id,
  'xp',
  q.xp_reward,
  '{"description": "XP reward for completing quest"}'
FROM rf_quests q
WHERE q.is_active = true;
