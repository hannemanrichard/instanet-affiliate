-- Gamification System Database Schema
-- Migration: 001_create_gamification_tables.sql

-- Partner XP tracking
CREATE TABLE partner_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  xp_to_next_level INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id)
);

-- XP events history
CREATE TABLE xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  xp_amount INTEGER NOT NULL,
  multiplier DECIMAL(3,2) DEFAULT 1.0,
  total_xp_earned INTEGER NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges definition
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon_url VARCHAR(500),
  category VARCHAR(50) NOT NULL,
  rarity VARCHAR(20) NOT NULL DEFAULT 'common',
  xp_reward INTEGER DEFAULT 0,
  requirements JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- Partner badges (earned badges)
CREATE TABLE partner_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(partner_id, badge_id)
);

-- Levels definition
CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number INTEGER NOT NULL,
  xp_required INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  benefits JSONB DEFAULT '{}',
  icon_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(level_number)
);

-- Partner streaks
CREATE TABLE partner_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  streak_type VARCHAR(50) NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_start_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, streak_type)
);

-- Leaderboard cache
CREATE TABLE leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type VARCHAR(50) NOT NULL,
  period VARCHAR(20) NOT NULL,
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  score INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(leaderboard_type, period, partner_id)
);

-- Quests definition
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  quest_type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'easy',
  xp_reward INTEGER DEFAULT 0,
  badge_reward_id UUID REFERENCES badges(id),
  requirements JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_repeatable BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quest steps
CREATE TABLE quest_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  action_type VARCHAR(50) NOT NULL,
  action_data JSONB DEFAULT '{}',
  is_required BOOLEAN DEFAULT true,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quest_id, step_number)
);

-- Partner quests (active quests)
CREATE TABLE partner_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  current_step INTEGER DEFAULT 1,
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, quest_id)
);

-- Quest rewards
CREATE TABLE quest_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_quest_id UUID NOT NULL REFERENCES partner_quests(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL,
  reward_value INTEGER NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partner bonuses (signup bonuses, XP unlocks, etc.)
CREATE TABLE partner_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  bonus_type VARCHAR(50) NOT NULL,
  bonus_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DZD',
  xp_required INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, unlocked, claimed, expired
  unlocked_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_partner_xp_partner_id ON partner_xp(partner_id);
CREATE INDEX idx_xp_events_partner_id ON xp_events(partner_id);
CREATE INDEX idx_xp_events_created_at ON xp_events(created_at);
CREATE INDEX idx_partner_badges_partner_id ON partner_badges(partner_id);
CREATE INDEX idx_partner_badges_badge_id ON partner_badges(badge_id);
CREATE INDEX idx_partner_streaks_partner_id ON partner_streaks(partner_id);
CREATE INDEX idx_partner_streaks_type ON partner_streaks(streak_type);
CREATE INDEX idx_leaderboard_cache_type_period ON leaderboard_cache(leaderboard_type, period);
CREATE INDEX idx_leaderboard_cache_rank ON leaderboard_cache(leaderboard_type, period, rank);
CREATE INDEX idx_partner_quests_partner_id ON partner_quests(partner_id);
CREATE INDEX idx_partner_quests_status ON partner_quests(status);
CREATE INDEX idx_quest_steps_quest_id ON quest_steps(quest_id);
CREATE INDEX idx_partner_bonuses_partner_id ON partner_bonuses(partner_id);
CREATE INDEX idx_partner_bonuses_status ON partner_bonuses(status);
CREATE INDEX idx_partner_bonuses_type ON partner_bonuses(bonus_type);

-- Insert initial levels
INSERT INTO levels (level_number, xp_required, name, description, benefits) VALUES
(1, 0, 'Rookie', 'Just getting started', '{"commission_rate": 0.05, "features": ["basic_dashboard"]}'),
(2, 100, 'Apprentice', 'Learning the ropes', '{"commission_rate": 0.06, "features": ["basic_dashboard", "lead_tracking"]}'),
(3, 250, 'Associate', 'Building momentum', '{"commission_rate": 0.07, "features": ["basic_dashboard", "lead_tracking", "analytics"]}'),
(4, 500, 'Specialist', 'Proven performer', '{"commission_rate": 0.08, "features": ["basic_dashboard", "lead_tracking", "analytics", "priority_support"]}'),
(5, 1000, 'Expert', 'Top tier partner', '{"commission_rate": 0.10, "features": ["basic_dashboard", "lead_tracking", "analytics", "priority_support", "exclusive_tools"]}'),
(6, 2000, 'Master', 'Elite partner', '{"commission_rate": 0.12, "features": ["basic_dashboard", "lead_tracking", "analytics", "priority_support", "exclusive_tools", "mentor_access"]}'),
(7, 3500, 'Champion', 'Platform champion', '{"commission_rate": 0.15, "features": ["basic_dashboard", "lead_tracking", "analytics", "priority_support", "exclusive_tools", "mentor_access", "beta_features"]}'),
(8, 5000, 'Legend', 'Referio legend', '{"commission_rate": 0.20, "features": ["basic_dashboard", "lead_tracking", "analytics", "priority_support", "exclusive_tools", "mentor_access", "beta_features", "custom_commission"]}');

-- Insert initial badges
INSERT INTO badges (name, description, category, rarity, xp_reward, requirements) VALUES
('First Lead', 'Created your first lead', 'milestone', 'common', 10, '{"leads_created": 1}'),
('Lead Creator', 'Created 10 leads', 'performance', 'common', 25, '{"leads_created": 10}'),
('Lead Master', 'Created 50 leads', 'performance', 'rare', 100, '{"leads_created": 50}'),
('First Order', 'Completed your first order', 'milestone', 'common', 15, '{"orders_completed": 1}'),
('Order Champion', 'Completed 10 orders', 'performance', 'common', 50, '{"orders_completed": 10}'),
('Sales Expert', 'Completed 25 orders', 'performance', 'rare', 150, '{"orders_completed": 25}'),
('Daily Streak', 'Maintained a 7-day streak', 'consistency', 'common', 30, '{"streak_days": 7}'),
('Weekly Warrior', 'Maintained a 30-day streak', 'consistency', 'rare', 100, '{"streak_days": 30}'),
('Monthly Master', 'Maintained a 90-day streak', 'consistency', 'epic', 300, '{"streak_days": 90}'),
('Level Up', 'Reached level 5', 'milestone', 'common', 50, '{"level": 5}'),
('Rising Star', 'Reached level 10', 'milestone', 'rare', 150, '{"level": 10}'),
('Platform Pro', 'Reached level 15', 'milestone', 'epic', 500, '{"level": 15}'),
('Referio Legend', 'Reached level 20', 'milestone', 'legendary', 1000, '{"level": 20}');

-- Insert initial quests
INSERT INTO quests (title, description, quest_type, difficulty, xp_reward, requirements) VALUES
('Welcome to Referio', 'Complete your profile setup', 'tutorial', 'easy', 25, '{"steps": ["complete_profile", "verify_email", "add_payment_method"]}'),
('First Steps', 'Create your first lead', 'tutorial', 'easy', 15, '{"steps": ["create_lead"]}'),
('Getting Started', 'Complete your first order', 'tutorial', 'easy', 20, '{"steps": ["complete_order"]}'),
('Daily Check-in', 'Log in for 3 consecutive days', 'daily', 'easy', 10, '{"steps": ["login_3_days"]}'),
('Weekly Goals', 'Create 5 leads this week', 'weekly', 'medium', 50, '{"steps": ["create_5_leads_week"]}'),
('Monthly Challenge', 'Complete 10 orders this month', 'monthly', 'hard', 200, '{"steps": ["complete_10_orders_month"]}');
