-- Migration: Create Gamification System Tables
-- Purpose: Implement comprehensive gamification system for affiliates
-- Date: 2024-01-XX
-- Description: Creates all tables for XP tracking, badges, levels, streaks, quests, and bonuses

-- Affiliate XP tracking
CREATE TABLE rf_affiliate_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- XP events history
CREATE TABLE rf_xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  xp_amount INTEGER NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  activity_id VARCHAR(100),
  description TEXT NOT NULL,
  multiplier DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges definition
CREATE TABLE rf_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon_url VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  rarity VARCHAR(20) NOT NULL DEFAULT 'common',
  xp_reward INTEGER DEFAULT 0,
  criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate badges earned
CREATE TABLE rf_affiliate_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  badge_id UUID NOT NULL REFERENCES rf_badges(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  is_earned BOOLEAN DEFAULT false,
  UNIQUE(affiliate_id, badge_id)
);

-- Levels definition
CREATE TABLE rf_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number INTEGER NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  xp_required INTEGER NOT NULL,
  benefits JSONB,
  icon_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true
);

-- Streaks tracking
CREATE TABLE rf_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  streak_type VARCHAR(50) NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(affiliate_id, streak_type)
);

-- Leaderboard cache
CREATE TABLE rf_leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type VARCHAR(50) NOT NULL,
  period VARCHAR(20) NOT NULL,
  entries JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Quests definition
CREATE TABLE rf_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  quest_type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  badge_reward UUID REFERENCES rf_badges(id),
  is_active BOOLEAN DEFAULT true,
  is_repeatable BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quest steps
CREATE TABLE rf_quest_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES rf_quests(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  action_data JSONB DEFAULT '{}',
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quest_id, step_number)
);

-- Affiliate quests
CREATE TABLE rf_affiliate_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  quest_id UUID NOT NULL REFERENCES rf_quests(id),
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  current_step INTEGER DEFAULT 1,
  UNIQUE(affiliate_id, quest_id)
);

-- Quest rewards
CREATE TABLE rf_quest_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES rf_quests(id),
  reward_type VARCHAR(50) NOT NULL,
  reward_value INTEGER NOT NULL,
  reward_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate bonuses (signup bonuses, etc.)
CREATE TABLE rf_affiliate_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  bonus_type VARCHAR(50) NOT NULL,
  bonus_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'DZD',
  xp_required INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  unlocked_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bonus configurations
CREATE TABLE rf_bonus_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bonus_type VARCHAR(50) NOT NULL UNIQUE,
  bonus_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'DZD',
  xp_required INTEGER NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
