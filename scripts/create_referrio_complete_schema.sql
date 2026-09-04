-- ==============================================
-- COMPLETE REFERRIO SCHEMA MIGRATION
-- ==============================================
-- This script creates ALL tables, indexes, functions, and triggers
-- from the referrio schema in a new Supabase database
-- 
-- Based on: src/infrastructure/supabase/types.ts referrio schema
-- Date: 2024-01-XX
--
-- Usage:
--   1. Create new Supabase project for Referio
--   2. Run this script in SQL Editor
--   3. Generate types: npx supabase gen types typescript --project-id <referio_project_id>
--
-- ==============================================

BEGIN;

-- ==============================================
-- EXTENSIONS
-- ==============================================
-- Supabase automatically includes these, but we ensure they exist

-- ==============================================
-- 1. CORE TABLE: affiliates (no dependencies)
-- ==============================================

CREATE TABLE affiliates (
  id SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  fullname VARCHAR(255),
  username VARCHAR(100),
  avatar VARCHAR(500),
  background VARCHAR(500),
  bio TEXT,
  birthdate DATE,
  gender VARCHAR(20),
  instagram VARCHAR(255),
  linkedin VARCHAR(255),
  tiktok VARCHAR(255),
  referral_source VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_affiliates_clerk_user_id ON affiliates(clerk_user_id);
CREATE INDEX idx_affiliates_email ON affiliates(email);
CREATE INDEX idx_affiliates_username ON affiliates(username);
CREATE INDEX idx_affiliates_status ON affiliates(status);

-- ==============================================
-- 2. COMMISSIONS TABLE (depends on affiliates)
-- ==============================================

CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  order_id UUID,
  product_id INTEGER,
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10,
  order_amount DECIMAL(10,2) NOT NULL,
  qty INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

CREATE INDEX idx_commissions_affiliate_id ON commissions(affiliate_id);
CREATE INDEX idx_commissions_order_id ON commissions(order_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_created_at ON commissions(created_at);

-- ==============================================
-- 3. AFFILIATE WITHDRAWALS TABLE (depends on affiliates)
-- ==============================================

CREATE TABLE affiliate_withdrawals (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_details JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by INTEGER,
  notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_affiliate_withdrawals_affiliate_id ON affiliate_withdrawals(affiliate_id);
CREATE INDEX idx_affiliate_withdrawals_status ON affiliate_withdrawals(status);
CREATE INDEX idx_affiliate_withdrawals_requested_at ON affiliate_withdrawals(requested_at);

-- ==============================================
-- 4. GAMIFICATION TABLES (*)
-- ==============================================

-- 4.1. affiliate_xp
CREATE TABLE affiliate_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL UNIQUE REFERENCES affiliates(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_affiliate_xp_affiliate_id ON affiliate_xp(affiliate_id);
CREATE INDEX idx_affiliate_xp_level ON affiliate_xp(current_level);
CREATE INDEX idx_affiliate_xp_total_xp ON affiliate_xp(total_xp);

-- 4.2. xp_events
CREATE TABLE xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  activity_id VARCHAR(255),
  xp_amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  multiplier DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_xp_events_affiliate_id ON xp_events(affiliate_id);
CREATE INDEX idx_xp_events_activity_type ON xp_events(activity_type);
CREATE INDEX idx_xp_events_created_at ON xp_events(created_at);
CREATE INDEX idx_xp_events_affiliate_activity ON xp_events(affiliate_id, activity_type);

-- 4.3. badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon_url VARCHAR(500),
  category VARCHAR(50) NOT NULL,
  rarity VARCHAR(20) NOT NULL DEFAULT 'common',
  xp_reward INTEGER DEFAULT 0,
  criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_rarity ON badges(rarity);
CREATE INDEX idx_badges_active ON badges(is_active);
CREATE INDEX idx_badges_xp_reward ON badges(xp_reward);

-- 4.4. affiliate_badges (if exists in schema)
CREATE TABLE IF NOT EXISTS affiliate_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  is_earned BOOLEAN DEFAULT false,
  earned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(affiliate_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_affiliate_badges_affiliate_id ON affiliate_badges(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_badges_badge_id ON affiliate_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_badges_earned ON affiliate_badges(is_earned);

-- 4.5. levels
CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number INTEGER NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  xp_required INTEGER NOT NULL,
  benefits JSONB,
  icon_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_levels_level_number ON levels(level_number);
CREATE INDEX idx_levels_xp_required ON levels(xp_required);
CREATE INDEX idx_levels_active ON levels(is_active);

-- 4.6. streaks
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  streak_type VARCHAR(50) NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(affiliate_id, streak_type)
);

CREATE INDEX idx_streaks_affiliate_id ON streaks(affiliate_id);
CREATE INDEX idx_streaks_type ON streaks(streak_type);
CREATE INDEX idx_streaks_active ON streaks(is_active);
CREATE INDEX idx_streaks_last_activity ON streaks(last_activity_date);

-- 4.7. leaderboard_cache
CREATE TABLE leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type VARCHAR(50) NOT NULL,
  period VARCHAR(20) NOT NULL,
  entries JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(leaderboard_type, period)
);

CREATE INDEX idx_leaderboard_cache_type ON leaderboard_cache(leaderboard_type);
CREATE INDEX idx_leaderboard_cache_period ON leaderboard_cache(period);
CREATE INDEX idx_leaderboard_cache_expires ON leaderboard_cache(expires_at);

-- 4.8. quests
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  quest_type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  badge_reward UUID REFERENCES badges(id),
  is_active BOOLEAN DEFAULT true,
  is_repeatable BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quests_type ON quests(quest_type);
CREATE INDEX idx_quests_difficulty ON quests(difficulty);
CREATE INDEX idx_quests_active ON quests(is_active);
CREATE INDEX idx_quests_repeatable ON quests(is_repeatable);
CREATE INDEX idx_quests_xp_reward ON quests(xp_reward);

-- 4.9. quest_steps
CREATE TABLE IF NOT EXISTS quest_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  action_type VARCHAR(50) NOT NULL,
  action_data JSONB,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quest_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_quest_steps_quest_id ON quest_steps(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_steps_step_number ON quest_steps(quest_id, step_number);

-- 4.10. affiliate_quests
CREATE TABLE IF NOT EXISTS affiliate_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(affiliate_id, quest_id)
);

CREATE INDEX IF NOT EXISTS idx_affiliate_quests_affiliate_id ON affiliate_quests(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_quests_quest_id ON affiliate_quests(quest_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_quests_status ON affiliate_quests(status);

-- 4.11. quest_rewards
CREATE TABLE IF NOT EXISTS quest_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL,
  reward_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quest_rewards_quest_id ON quest_rewards(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_rewards_type ON quest_rewards(reward_type);

-- 4.12. affiliate_bonuses
CREATE TABLE affiliate_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  bonus_type VARCHAR(50) NOT NULL,
  bonus_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DZD',
  xp_required INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  unlocked_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_affiliate_bonuses_affiliate_id ON affiliate_bonuses(affiliate_id);
CREATE INDEX idx_affiliate_bonuses_type ON affiliate_bonuses(bonus_type);
CREATE INDEX idx_affiliate_bonuses_status ON affiliate_bonuses(status);
CREATE INDEX idx_affiliate_bonuses_unlocked_at ON affiliate_bonuses(unlocked_at);
CREATE INDEX idx_affiliate_bonuses_expires_at ON affiliate_bonuses(expires_at);

-- 4.13. bonus_configurations
CREATE TABLE IF NOT EXISTS bonus_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bonus_type VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  bonus_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DZD',
  xp_required INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bonus_configurations_type ON bonus_configurations(bonus_type);
CREATE INDEX IF NOT EXISTS idx_bonus_configurations_active ON bonus_configurations(is_active);

-- ==============================================
-- 5. COURSE SYSTEM TABLES
-- ==============================================

-- 5.1. courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url VARCHAR(500),
  instructor_name VARCHAR(100) NOT NULL,
  instructor_bio TEXT,
  instructor_avatar VARCHAR(500),
  duration_minutes INTEGER NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  learning_objectives TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_courses_active ON courses(is_active);
CREATE INDEX idx_courses_featured ON courses(is_featured);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_created_at ON courses(created_at);

-- 5.2. course_modules
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, order_index)
);

CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_course_modules_order ON course_modules(course_id, order_index);
CREATE INDEX idx_course_modules_active ON course_modules(is_active);

-- 5.3. course_videos
CREATE TABLE course_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  duration_seconds INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  video_type VARCHAR(50) NOT NULL,
  external_provider VARCHAR(50) NOT NULL,
  external_video_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, order_index)
);

CREATE INDEX idx_course_videos_module_id ON course_videos(module_id);
CREATE INDEX idx_course_videos_order ON course_videos(module_id, order_index);
CREATE INDEX idx_course_videos_active ON course_videos(is_active);
CREATE INDEX idx_course_videos_provider ON course_videos(external_provider);

-- 5.4. course_enrollments
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'enrolled',
  current_module_id UUID REFERENCES course_modules(id),
  current_video_id UUID REFERENCES course_videos(id),
  last_watched_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(affiliate_id, course_id)
);

CREATE INDEX idx_course_enrollments_affiliate_id ON course_enrollments(affiliate_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX idx_course_enrollments_enrolled_at ON course_enrollments(enrolled_at);
CREATE INDEX idx_course_enrollments_completed_at ON course_enrollments(completed_at);

-- 5.5. video_progress (no  prefix)
CREATE TABLE video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  video_id UUID NOT NULL REFERENCES course_videos(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  watch_time_seconds INTEGER DEFAULT 0,
  total_duration_seconds INTEGER NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(affiliate_id, video_id)
);

CREATE INDEX idx_video_progress_affiliate_id ON video_progress(affiliate_id);
CREATE INDEX idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX idx_video_progress_course_id ON video_progress(course_id);
CREATE INDEX idx_video_progress_completed ON video_progress(is_completed);
CREATE INDEX idx_video_progress_last_watched ON video_progress(last_watched_at);

-- 5.6. video_milestones (no  prefix)
CREATE TABLE video_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_progress_id UUID NOT NULL REFERENCES video_progress(id) ON DELETE CASCADE,
  milestone INTEGER NOT NULL,
  reached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_awarded INTEGER DEFAULT 0,
  UNIQUE(video_progress_id, milestone)
);

CREATE INDEX idx_video_milestones_progress_id ON video_milestones(video_progress_id);
CREATE INDEX idx_video_milestones_milestone ON video_milestones(milestone);
CREATE INDEX idx_video_milestones_reached_at ON video_milestones(reached_at);

-- 5.7. course_progress
CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  overall_progress INTEGER DEFAULT 0,
  modules_completed INTEGER DEFAULT 0,
  total_modules INTEGER NOT NULL,
  videos_completed INTEGER DEFAULT 0,
  total_videos INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  badges_earned TEXT[] DEFAULT '{}',
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(affiliate_id, course_id)
);

CREATE INDEX idx_course_progress_affiliate_id ON course_progress(affiliate_id);
CREATE INDEX idx_course_progress_course_id ON course_progress(course_id);
CREATE INDEX idx_course_progress_overall ON course_progress(overall_progress);
CREATE INDEX idx_course_progress_last_activity ON course_progress(last_activity_at);

-- 5.8. course_completions
CREATE TABLE course_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_percentage INTEGER NOT NULL,
  total_xp_earned INTEGER DEFAULT 0,
  badges_earned TEXT[] DEFAULT '{}',
  time_spent_minutes INTEGER DEFAULT 0,
  UNIQUE(affiliate_id, course_id)
);

CREATE INDEX idx_course_completions_affiliate_id ON course_completions(affiliate_id);
CREATE INDEX idx_course_completions_course_id ON course_completions(course_id);
CREATE INDEX idx_course_completions_completed_at ON course_completions(completed_at);

-- 5.9. course_analytics
CREATE TABLE course_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL UNIQUE REFERENCES courses(id) ON DELETE CASCADE,
  total_enrollments INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.0,
  average_completion_time INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  most_watched_videos TEXT[] DEFAULT '{}',
  drop_off_points TEXT[] DEFAULT '{}',
  engagement_metrics JSONB DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_course_analytics_course_id ON course_analytics(course_id);
CREATE INDEX idx_course_analytics_calculated_at ON course_analytics(calculated_at);

-- ==============================================
-- 6. DELIVERY HISTORIES
-- ==============================================

CREATE TABLE IF NOT EXISTS delivery_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  delivery_company VARCHAR(255) NOT NULL,
  tracking_number VARCHAR(255) NOT NULL,
  status VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  raw_data JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_histories_order_id ON delivery_histories(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_histories_tracking_number ON delivery_histories(tracking_number);
CREATE INDEX IF NOT EXISTS idx_delivery_histories_status ON delivery_histories(status);

-- ==============================================
-- 7. ORDERS TABLES (if needed - check types.ts)
-- ==============================================
-- Note: types.ts shows referrio schema but may not include orders
-- Add if orders tables should be in referrio schema

-- ==============================================
-- 8. SEQUENCES (for SERIAL columns)
-- ==============================================
-- Supabase auto-creates sequences, but ensure they exist

-- ==============================================
-- 9. TRIGGERS AND FUNCTIONS
-- ==============================================

-- 9.1. Update updated_at trigger for affiliates
CREATE OR REPLACE FUNCTION update_affiliates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliates_updated_at();

-- 9.2. Update updated_at trigger for commissions
CREATE OR REPLACE FUNCTION update_commissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_commissions_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_commissions_updated_at();

-- 9.3. Update updated_at trigger for affiliate_withdrawals
CREATE OR REPLACE FUNCTION update_affiliate_withdrawals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_affiliate_withdrawals_updated_at
  BEFORE UPDATE ON affiliate_withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_withdrawals_updated_at();

-- 9.4. Update updated_at trigger for affiliate_xp
CREATE OR REPLACE FUNCTION update_affiliate_xp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_affiliate_xp_updated_at
  BEFORE UPDATE ON affiliate_xp
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_xp_updated_at();

-- 9.5. Update updated_at trigger for streaks
CREATE OR REPLACE FUNCTION update_streaks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_streaks_updated_at();

-- 9.6. Update updated_at trigger for courses
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_courses_updated_at();

-- 9.7. Update updated_at trigger for video_progress
CREATE OR REPLACE FUNCTION update_video_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_video_progress_updated_at
  BEFORE UPDATE ON video_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_video_progress_updated_at();

-- 9.8. Update updated_at trigger for course_progress
CREATE OR REPLACE FUNCTION update_course_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_progress_updated_at
  BEFORE UPDATE ON course_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_course_progress_updated_at();

-- 9.9. Update updated_at trigger for affiliate_bonuses
CREATE OR REPLACE FUNCTION update_affiliate_bonuses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_affiliate_bonuses_updated_at
  BEFORE UPDATE ON affiliate_bonuses
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_bonuses_updated_at();

-- ==============================================
-- 10. ADD GAMIFICATION FUNCTIONS
-- ==============================================

-- Include all functions from database/migrations/021_create_gamification_functions.sql
-- (Functions are included below, but you may need to update them based on actual table names)

-- Function: initialize_affiliate_xp
CREATE OR REPLACE FUNCTION initialize_affiliate_xp(affiliate_id_param INTEGER)
RETURNS UUID AS $$
DECLARE
  xp_profile_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM affiliate_xp WHERE affiliate_id = affiliate_id_param) THEN
    RAISE EXCEPTION 'XP profile already exists for affiliate %', affiliate_id_param;
  END IF;
  
  INSERT INTO affiliate_xp (
    affiliate_id,
    total_xp,
    current_level,
    xp_to_next_level
  ) VALUES (
    affiliate_id_param,
    0,
    1,
    100
  ) RETURNING id INTO xp_profile_id;
  
  RETURN xp_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Function: add_affiliate_xp
CREATE OR REPLACE FUNCTION add_affiliate_xp(
  affiliate_id_param INTEGER,
  xp_amount_param INTEGER,
  activity_type_param VARCHAR(50),
  description_param TEXT,
  activity_id_param VARCHAR(100) DEFAULT NULL,
  multiplier_param DECIMAL(3,2) DEFAULT 1.0
)
RETURNS UUID AS $$
DECLARE
  xp_event_id UUID;
  current_xp INTEGER;
  new_total_xp INTEGER;
  current_level INTEGER;
  xp_to_next_level INTEGER;
  new_level INTEGER;
BEGIN
  xp_amount_param := xp_amount_param * multiplier_param;
  
  SELECT total_xp, current_level, xp_to_next_level 
  INTO current_xp, current_level, xp_to_next_level
  FROM affiliate_xp 
  WHERE affiliate_id = affiliate_id_param;
  
  IF NOT FOUND THEN
    PERFORM initialize_affiliate_xp(affiliate_id_param);
    current_xp := 0;
    current_level := 1;
    xp_to_next_level := 100;
  END IF;
  
  new_total_xp := current_xp + xp_amount_param;
  
  WHILE new_total_xp >= xp_to_next_level LOOP
    new_level := current_level + 1;
    
    SELECT l.xp_required INTO xp_to_next_level
    FROM levels l
    WHERE l.level_number = new_level + 1
    ORDER BY l.level_number ASC
    LIMIT 1;
    
    IF NOT FOUND THEN
      xp_to_next_level := new_total_xp + 1;
      EXIT;
    END IF;
    
    current_level := new_level;
  END LOOP;
  
  UPDATE affiliate_xp SET
    total_xp = new_total_xp,
    current_level = current_level,
    xp_to_next_level = xp_to_next_level - new_total_xp,
    updated_at = NOW()
  WHERE affiliate_id = affiliate_id_param;
  
  INSERT INTO xp_events (
    affiliate_id,
    xp_amount,
    activity_type,
    activity_id,
    description,
    multiplier
  ) VALUES (
    affiliate_id_param,
    xp_amount_param,
    activity_type_param,
    activity_id_param,
    description_param,
    multiplier_param
  ) RETURNING id INTO xp_event_id;
  
  PERFORM check_and_award_badges(affiliate_id_param);
  PERFORM check_and_unlock_bonuses(affiliate_id_param, new_total_xp);
  
  RETURN xp_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function: check_and_award_badges
CREATE OR REPLACE FUNCTION check_and_award_badges(affiliate_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
  badge_record RECORD;
  badges_awarded INTEGER := 0;
BEGIN
  FOR badge_record IN 
    SELECT b.* FROM badges b 
    WHERE b.is_active = true
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM affiliate_badges ab 
      WHERE ab.affiliate_id = affiliate_id_param 
      AND ab.badge_id = badge_record.id
    ) THEN
      IF check_badge_criteria(affiliate_id_param, badge_record.id) THEN
        INSERT INTO affiliate_badges (
          affiliate_id,
          badge_id,
          earned_at,
          is_earned
        ) VALUES (
          affiliate_id_param,
          badge_record.id,
          NOW(),
          true
        ) ON CONFLICT (affiliate_id, badge_id) DO NOTHING;
        
        badges_awarded := badges_awarded + 1;
        
        IF badge_record.xp_reward > 0 THEN
          PERFORM add_affiliate_xp(
            affiliate_id_param,
            badge_record.xp_reward,
            'badge_earned',
            'Badge earned: ' || badge_record.name,
            badge_record.id::VARCHAR
          );
        END IF;
      END IF;
    END IF;
  END LOOP;
  
  RETURN badges_awarded;
END;
$$ LANGUAGE plpgsql;

-- Function: check_badge_criteria
CREATE OR REPLACE FUNCTION check_badge_criteria(
  affiliate_id_param INTEGER,
  badge_id_param UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  criteria JSONB;
  criteria_type VARCHAR(50);
  required_value INTEGER;
  current_value INTEGER;
BEGIN
  SELECT b.criteria INTO criteria
  FROM badges b
  WHERE b.id = badge_id_param;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  criteria_type := criteria->>'type';
  required_value := (criteria->>'value')::INTEGER;
  
  CASE criteria_type
    WHEN 'total_xp' THEN
      SELECT total_xp INTO current_value
      FROM affiliate_xp
      WHERE affiliate_id = affiliate_id_param;
      
    WHEN 'level' THEN
      SELECT current_level INTO current_value
      FROM affiliate_xp
      WHERE affiliate_id = affiliate_id_param;
      
    WHEN 'course_completed' THEN
      SELECT COUNT(*)::INTEGER INTO current_value
      FROM course_completions
      WHERE affiliate_id = affiliate_id_param;
      
    WHEN 'streak_days' THEN
      SELECT COALESCE(MAX(current_streak), 0) INTO current_value
      FROM streaks
      WHERE affiliate_id = affiliate_id_param
      AND is_active = true;
      
    ELSE
      RETURN FALSE;
  END CASE;
  
  RETURN current_value >= required_value;
END;
$$ LANGUAGE plpgsql;

-- Function: update_affiliate_streak
CREATE OR REPLACE FUNCTION update_affiliate_streak(
  affiliate_id_param INTEGER,
  streak_type_param VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
  streak_exists BOOLEAN;
  last_activity_date DATE;
  current_date DATE := CURRENT_DATE;
  streak_updated BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM streaks 
    WHERE affiliate_id = affiliate_id_param 
    AND streak_type = streak_type_param
  ) INTO streak_exists;
  
  IF NOT streak_exists THEN
    INSERT INTO streaks (
      affiliate_id,
      streak_type,
      current_streak,
      longest_streak,
      last_activity_date,
      is_active
    ) VALUES (
      affiliate_id_param,
      streak_type_param,
      1,
      1,
      current_date,
      true
    );
    streak_updated := TRUE;
  ELSE
    SELECT last_activity_date INTO last_activity_date
    FROM streaks
    WHERE affiliate_id = affiliate_id_param
    AND streak_type = streak_type_param;
    
    IF last_activity_date = current_date THEN
      RETURN FALSE;
    ELSIF last_activity_date = current_date - INTERVAL '1 day' THEN
      UPDATE streaks SET
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = current_date,
        updated_at = NOW()
      WHERE affiliate_id = affiliate_id_param
      AND streak_type = streak_type_param;
      streak_updated := TRUE;
    ELSE
      UPDATE streaks SET
        current_streak = 1,
        last_activity_date = current_date,
        updated_at = NOW()
      WHERE affiliate_id = affiliate_id_param
      AND streak_type = streak_type_param;
      streak_updated := TRUE;
    END IF;
  END IF;
  
  RETURN streak_updated;
END;
$$ LANGUAGE plpgsql;

-- Function: create_signup_bonus
CREATE OR REPLACE FUNCTION create_signup_bonus(affiliate_id_param INTEGER)
RETURNS UUID AS $$
DECLARE
  bonus_id UUID;
  bonus_config RECORD;
BEGIN
  SELECT * INTO bonus_config
  FROM bonus_configurations
  WHERE bonus_type = 'signup'
  AND is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Signup bonus configuration not found';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM affiliate_bonuses
    WHERE affiliate_id = affiliate_id_param
    AND bonus_type = 'signup'
  ) THEN
    RAISE EXCEPTION 'Affiliate already has signup bonus';
  END IF;
  
  INSERT INTO affiliate_bonuses (
    affiliate_id,
    bonus_type,
    bonus_amount,
    currency,
    xp_required,
    xp_earned,
    status,
    expires_at,
    description
  ) VALUES (
    affiliate_id_param,
    bonus_config.bonus_type,
    bonus_config.bonus_amount,
    bonus_config.currency,
    bonus_config.xp_required,
    0,
    'pending',
    NOW() + INTERVAL '30 days',
    bonus_config.description
  ) RETURNING id INTO bonus_id;
  
  RETURN bonus_id;
END;
$$ LANGUAGE plpgsql;

-- Function: check_and_unlock_bonuses
CREATE OR REPLACE FUNCTION check_and_unlock_bonuses(
  affiliate_id_param INTEGER,
  total_xp_param INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  bonus_record RECORD;
  bonuses_unlocked INTEGER := 0;
BEGIN
  FOR bonus_record IN 
    SELECT * FROM affiliate_bonuses
    WHERE affiliate_id = affiliate_id_param
    AND status = 'pending'
    AND total_xp_param >= xp_required
  LOOP
    UPDATE affiliate_bonuses SET
      status = 'unlocked',
      unlocked_at = NOW(),
      updated_at = NOW()
    WHERE id = bonus_record.id;
    
    bonuses_unlocked := bonuses_unlocked + 1;
  END LOOP;
  
  RETURN bonuses_unlocked;
END;
$$ LANGUAGE plpgsql;

-- Function: claim_affiliate_bonus
CREATE OR REPLACE FUNCTION claim_affiliate_bonus(
  affiliate_id_param INTEGER,
  bonus_id_param UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  bonus_exists BOOLEAN;
  bonus_status VARCHAR(20);
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM affiliate_bonuses
    WHERE id = bonus_id_param
    AND affiliate_id = affiliate_id_param
  ) INTO bonus_exists;
  
  IF NOT bonus_exists THEN
    RAISE EXCEPTION 'Bonus not found or does not belong to affiliate';
  END IF;
  
  SELECT status INTO bonus_status
  FROM affiliate_bonuses
  WHERE id = bonus_id_param;
  
  IF bonus_status != 'unlocked' THEN
    RAISE EXCEPTION 'Bonus is not unlocked';
  END IF;
  
  UPDATE affiliate_bonuses SET
    status = 'claimed',
    claimed_at = NOW(),
    updated_at = NOW()
  WHERE id = bonus_id_param;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: get_affiliate_gamification_summary
CREATE OR REPLACE FUNCTION get_affiliate_gamification_summary(affiliate_id_param INTEGER)
RETURNS TABLE (
  total_xp INTEGER,
  current_level INTEGER,
  xp_to_next_level INTEGER,
  badges_earned BIGINT,
  badges_total BIGINT,
  current_streak INTEGER,
  longest_streak INTEGER,
  bonuses_unlocked BIGINT,
  bonuses_claimed BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ax.total_xp, 0) as total_xp,
    COALESCE(ax.current_level, 1) as current_level,
    COALESCE(ax.xp_to_next_level, 100) as xp_to_next_level,
    COALESCE(earned_badges.count, 0) as badges_earned,
    COALESCE(total_badges.count, 0) as badges_total,
    COALESCE(current_streak.max_streak, 0) as current_streak,
    COALESCE(longest_streak.max_streak, 0) as longest_streak,
    COALESCE(unlocked_bonuses.count, 0) as bonuses_unlocked,
    COALESCE(claimed_bonuses.count, 0) as bonuses_claimed
  FROM affiliate_xp ax
  FULL OUTER JOIN (
    SELECT COUNT(*) as count
    FROM affiliate_badges
    WHERE affiliate_id = affiliate_id_param AND is_earned = true
  ) earned_badges ON true
  FULL OUTER JOIN (
    SELECT COUNT(*) as count
    FROM badges
    WHERE is_active = true
  ) total_badges ON true
  FULL OUTER JOIN (
    SELECT MAX(current_streak) as max_streak
    FROM streaks
    WHERE affiliate_id = affiliate_id_param AND is_active = true
  ) current_streak ON true
  FULL OUTER JOIN (
    SELECT MAX(longest_streak) as max_streak
    FROM streaks
    WHERE affiliate_id = affiliate_id_param
  ) longest_streak ON true
  FULL OUTER JOIN (
    SELECT COUNT(*) as count
    FROM affiliate_bonuses
    WHERE affiliate_id = affiliate_id_param AND status = 'unlocked'
  ) unlocked_bonuses ON true
  FULL OUTER JOIN (
    SELECT COUNT(*) as count
    FROM affiliate_bonuses
    WHERE affiliate_id = affiliate_id_param AND status = 'claimed'
  ) claimed_bonuses ON true
  WHERE ax.affiliate_id = affiliate_id_param OR ax.affiliate_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 11. ADD COURSE SYSTEM FUNCTIONS
-- ==============================================

-- Function: enroll_affiliate_in_course
CREATE OR REPLACE FUNCTION enroll_affiliate_in_course(
  affiliate_id_param INTEGER,
  course_id_param UUID
)
RETURNS UUID AS $$
DECLARE
  enrollment_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM course_enrollments WHERE affiliate_id = affiliate_id_param AND course_id = course_id_param) THEN
    RAISE EXCEPTION 'Affiliate already enrolled in this course';
  END IF;
  
  INSERT INTO course_enrollments (
    affiliate_id,
    course_id,
    enrolled_at,
    status
  ) VALUES (
    affiliate_id_param,
    course_id_param,
    NOW(),
    'enrolled'
  ) RETURNING id INTO enrollment_id;
  
  INSERT INTO course_progress (
    affiliate_id,
    course_id,
    total_modules,
    total_videos
  ) VALUES (
    affiliate_id_param,
    course_id_param,
    (SELECT COUNT(*) FROM course_modules WHERE course_id = course_id_param AND is_active = true),
    (SELECT COUNT(*) FROM course_videos cv 
     JOIN course_modules cm ON cv.module_id = cm.id 
     WHERE cm.course_id = course_id_param AND cv.is_active = true)
  );
  
  RETURN enrollment_id;
END;
$$ LANGUAGE plpgsql;

-- Function: update_video_progress
CREATE OR REPLACE FUNCTION update_video_progress(
  affiliate_id_param INTEGER,
  video_id_param UUID,
  watch_time_seconds_param INTEGER,
  completion_percentage_param INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  video_duration INTEGER;
  course_id_val UUID;
  is_video_completed BOOLEAN;
BEGIN
  SELECT duration_seconds, cm.course_id INTO video_duration, course_id_val
  FROM course_videos cv
  JOIN course_modules cm ON cv.module_id = cm.id
  WHERE cv.id = video_id_param;
  
  is_video_completed := completion_percentage_param >= 100;
  
  INSERT INTO video_progress (
    affiliate_id,
    video_id,
    course_id,
    watch_time_seconds,
    total_duration_seconds,
    completion_percentage,
    is_completed,
    last_watched_at,
    updated_at
  ) VALUES (
    affiliate_id_param,
    video_id_param,
    course_id_val,
    watch_time_seconds_param,
    video_duration,
    completion_percentage_param,
    is_video_completed,
    NOW(),
    NOW()
  ) ON CONFLICT (affiliate_id, video_id) DO UPDATE SET
    watch_time_seconds = watch_time_seconds_param,
    completion_percentage = completion_percentage_param,
    is_completed = is_video_completed,
    last_watched_at = NOW(),
    updated_at = NOW();
  
  -- Award XP for milestones
  IF completion_percentage_param >= 25 AND NOT EXISTS (
    SELECT 1 FROM video_milestones vm 
    JOIN video_progress vp ON vm.video_progress_id = vp.id 
    WHERE vp.affiliate_id = affiliate_id_param 
    AND vp.video_id = video_id_param 
    AND vm.milestone = 25
  ) THEN
    INSERT INTO video_milestones (video_progress_id, milestone, xp_awarded)
    SELECT vp.id, 25, 10 FROM video_progress vp 
    WHERE vp.affiliate_id = affiliate_id_param AND vp.video_id = video_id_param;
  END IF;
  
  IF completion_percentage_param >= 50 AND NOT EXISTS (
    SELECT 1 FROM video_milestones vm 
    JOIN video_progress vp ON vm.video_progress_id = vp.id 
    WHERE vp.affiliate_id = affiliate_id_param 
    AND vp.video_id = video_id_param 
    AND vm.milestone = 50
  ) THEN
    INSERT INTO video_milestones (video_progress_id, milestone, xp_awarded)
    SELECT vp.id, 50, 15 FROM video_progress vp 
    WHERE vp.affiliate_id = affiliate_id_param AND vp.video_id = video_id_param;
  END IF;
  
  IF completion_percentage_param >= 75 AND NOT EXISTS (
    SELECT 1 FROM video_milestones vm 
    JOIN video_progress vp ON vm.video_progress_id = vp.id 
    WHERE vp.affiliate_id = affiliate_id_param 
    AND vp.video_id = video_id_param 
    AND vm.milestone = 75
  ) THEN
    INSERT INTO video_milestones (video_progress_id, milestone, xp_awarded)
    SELECT vp.id, 75, 20 FROM video_progress vp 
    WHERE vp.affiliate_id = affiliate_id_param AND vp.video_id = video_id_param;
  END IF;
  
  IF completion_percentage_param >= 100 AND NOT EXISTS (
    SELECT 1 FROM video_milestones vm 
    JOIN video_progress vp ON vm.video_progress_id = vp.id 
    WHERE vp.affiliate_id = affiliate_id_param 
    AND vp.video_id = video_id_param 
    AND vm.milestone = 100
  ) THEN
    INSERT INTO video_milestones (video_progress_id, milestone, xp_awarded)
    SELECT vp.id, 100, 50 FROM video_progress vp 
    WHERE vp.affiliate_id = affiliate_id_param AND vp.video_id = video_id_param;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: update_course_progress
CREATE OR REPLACE FUNCTION update_course_progress(affiliate_id_param INTEGER, course_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  videos_completed_count INTEGER;
  modules_completed_count INTEGER;
  total_videos_count INTEGER;
  total_modules_count INTEGER;
  overall_progress_val INTEGER;
  total_xp INTEGER;
BEGIN
  SELECT COUNT(*) INTO videos_completed_count
  FROM video_progress vp
  WHERE vp.affiliate_id = affiliate_id_param 
    AND vp.course_id = course_id_param 
    AND vp.is_completed = true;
  
  SELECT COUNT(*) INTO total_videos_count
  FROM course_videos cv
  JOIN course_modules cm ON cv.module_id = cm.id
  WHERE cm.course_id = course_id_param AND cv.is_active = true;
  
  SELECT COUNT(*) INTO modules_completed_count
  FROM course_modules cm
  WHERE cm.course_id = course_id_param 
    AND cm.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM course_videos cv 
      WHERE cv.module_id = cm.id 
        AND cv.is_active = true 
        AND NOT EXISTS (
          SELECT 1 FROM video_progress vp 
          WHERE vp.video_id = cv.id 
            AND vp.affiliate_id = affiliate_id_param 
            AND vp.is_completed = true
        )
    );
  
  SELECT COUNT(*) INTO total_modules_count
  FROM course_modules cm
  WHERE cm.course_id = course_id_param AND cm.is_active = true;
  
  IF total_videos_count > 0 THEN
    overall_progress_val := ROUND((videos_completed_count::DECIMAL / total_videos_count::DECIMAL) * 100);
  ELSE
    overall_progress_val := 0;
  END IF;
  
  SELECT COALESCE(SUM(vm.xp_awarded), 0) INTO total_xp
  FROM video_milestones vm
  JOIN video_progress vp ON vm.video_progress_id = vp.id
  WHERE vp.affiliate_id = affiliate_id_param AND vp.course_id = course_id_param;
  
  UPDATE course_progress SET
    overall_progress = overall_progress_val,
    modules_completed = modules_completed_count,
    videos_completed = videos_completed_count,
    xp_earned = total_xp,
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE affiliate_id = affiliate_id_param AND course_id = course_id_param;
  
  IF overall_progress_val >= 100 THEN
    UPDATE course_enrollments SET
      completed_at = NOW(),
      progress_percentage = 100,
      status = 'completed'
    WHERE affiliate_id = affiliate_id_param AND course_id = course_id_param;
    
    INSERT INTO course_completions (
      affiliate_id,
      course_id,
      completion_percentage,
      total_xp_earned,
      time_spent_minutes
    ) VALUES (
      affiliate_id_param,
      course_id_param,
      overall_progress_val,
      total_xp,
      (SELECT COALESCE(SUM(watch_time_seconds), 0) / 60 FROM video_progress 
       WHERE affiliate_id = affiliate_id_param AND course_id = course_id_param)
    ) ON CONFLICT (affiliate_id, course_id) DO NOTHING;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: get_affiliate_course_stats
CREATE OR REPLACE FUNCTION get_affiliate_course_stats(affiliate_id_param INTEGER)
RETURNS TABLE (
  total_enrollments BIGINT,
  completed_courses BIGINT,
  total_xp_earned INTEGER,
  total_time_spent_minutes INTEGER,
  average_completion_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(enrollments.count, 0) as total_enrollments,
    COALESCE(completed.count, 0) as completed_courses,
    COALESCE(xp.total, 0) as total_xp_earned,
    COALESCE(time_spent.total, 0) as total_time_spent_minutes,
    COALESCE(avg_completion.rate, 0) as average_completion_rate
  FROM (
    SELECT COUNT(*) as count
    FROM course_enrollments 
    WHERE affiliate_id = affiliate_id_param
  ) enrollments
  CROSS JOIN (
    SELECT COUNT(*) as count
    FROM course_completions 
    WHERE affiliate_id = affiliate_id_param
  ) completed
  CROSS JOIN (
    SELECT SUM(total_xp_earned) as total
    FROM course_completions 
    WHERE affiliate_id = affiliate_id_param
  ) xp
  CROSS JOIN (
    SELECT SUM(time_spent_minutes) as total
    FROM course_completions 
    WHERE affiliate_id = affiliate_id_param
  ) time_spent
  CROSS JOIN (
    SELECT AVG(completion_percentage) as rate
    FROM course_completions 
    WHERE affiliate_id = affiliate_id_param
  ) avg_completion;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 12. ADD AFFILIATE FUNCTIONS (Updated for Referio-only)
-- ==============================================

-- Function: get_affiliate_stats (updated - no leads/orders table references)
CREATE OR REPLACE FUNCTION get_affiliate_stats(affiliate_id_param INTEGER)
RETURNS TABLE (
  total_orders BIGINT,
  total_commissions DECIMAL(10,2),
  total_withdrawals DECIMAL(10,2),
  pending_commissions DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(orders.count, 0) as total_orders,
    COALESCE(commissions.total, 0) as total_commissions,
    COALESCE(withdrawals.total, 0) as total_withdrawals,
    COALESCE(pending_commissions.total, 0) as pending_commissions
  FROM (
    SELECT COUNT(*) as count
    FROM commissions 
    WHERE affiliate_id = affiliate_id_param
  ) orders  -- Using commissions count as proxy for orders
  CROSS JOIN (
    SELECT COALESCE(SUM(amount), 0) as total
    FROM commissions 
    WHERE affiliate_id = affiliate_id_param
  ) commissions
  CROSS JOIN (
    SELECT COALESCE(SUM(amount), 0) as total
    FROM affiliate_withdrawals 
    WHERE affiliate_id = affiliate_id_param
  ) withdrawals
  CROSS JOIN (
    SELECT COALESCE(SUM(amount), 0) as total
    FROM commissions 
    WHERE affiliate_id = affiliate_id_param 
    AND status = 'pending'
  ) pending_commissions;
END;
$$ LANGUAGE plpgsql;

-- Function: calculate_affiliate_commission
CREATE OR REPLACE FUNCTION calculate_affiliate_commission(
  affiliate_id_param INTEGER,
  order_id_param UUID,
  order_amount DECIMAL(10,2),
  commission_rate DECIMAL(5,4) DEFAULT 0.10,
  qty_param INTEGER DEFAULT 1
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  commission_amount DECIMAL(10,2);
BEGIN
  commission_amount := order_amount * commission_rate;
  
  INSERT INTO commissions (
    affiliate_id,
    order_id,
    amount,
    commission_rate,
    order_amount,
    qty,
    status,
    created_at,
    updated_at
  ) VALUES (
    affiliate_id_param,
    order_id_param,
    commission_amount,
    commission_rate,
    order_amount,
    qty_param,
    'pending',
    NOW(),
    NOW()
  );
  
  RETURN commission_amount;
END;
$$ LANGUAGE plpgsql;

-- Function: get_commission_stats
CREATE OR REPLACE FUNCTION get_commission_stats(affiliate_id_param INTEGER)
RETURNS TABLE (
  total_commissions BIGINT,
  total_amount DECIMAL(10,2),
  pending_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  average_commission_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(total.count, 0) as total_commissions,
    COALESCE(total.amount, 0) as total_amount,
    COALESCE(pending.amount, 0) as pending_amount,
    COALESCE(paid.amount, 0) as paid_amount,
    COALESCE(avg_rate.rate, 0) as average_commission_rate
  FROM (
    SELECT COUNT(*) as count, SUM(amount) as amount
    FROM commissions 
    WHERE affiliate_id = affiliate_id_param
  ) total
  CROSS JOIN (
    SELECT SUM(amount) as amount
    FROM commissions 
    WHERE affiliate_id = affiliate_id_param AND status = 'pending'
  ) pending
  CROSS JOIN (
    SELECT SUM(amount) as amount
    FROM commissions 
    WHERE affiliate_id = affiliate_id_param AND status = 'paid'
  ) paid
  CROSS JOIN (
    SELECT AVG(commission_rate) as rate
    FROM commissions 
    WHERE affiliate_id = affiliate_id_param
  ) avg_rate;
END;
$$ LANGUAGE plpgsql;

-- Function: get_withdrawal_stats
CREATE OR REPLACE FUNCTION get_withdrawal_stats(affiliate_id_param INTEGER)
RETURNS TABLE (
  total_withdrawals BIGINT,
  total_amount DECIMAL(10,2),
  pending_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  rejected_amount DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(total.count, 0) as total_withdrawals,
    COALESCE(total.amount, 0) as total_amount,
    COALESCE(pending.amount, 0) as pending_amount,
    COALESCE(paid.amount, 0) as paid_amount,
    COALESCE(rejected.amount, 0) as rejected_amount
  FROM (
    SELECT COUNT(*) as count, SUM(amount) as amount
    FROM affiliate_withdrawals 
    WHERE affiliate_id = affiliate_id_param
  ) total
  CROSS JOIN (
    SELECT SUM(amount) as amount
    FROM affiliate_withdrawals 
    WHERE affiliate_id = affiliate_id_param AND status = 'pending'
  ) pending
  CROSS JOIN (
    SELECT SUM(amount) as amount
    FROM affiliate_withdrawals 
    WHERE affiliate_id = affiliate_id_param AND status = 'paid'
  ) paid
  CROSS JOIN (
    SELECT SUM(amount) as amount
    FROM affiliate_withdrawals 
    WHERE affiliate_id = affiliate_id_param AND status = 'rejected'
  ) rejected;
END;
$$ LANGUAGE plpgsql;

-- Function: process_withdrawal
CREATE OR REPLACE FUNCTION process_withdrawal(
  withdrawal_id_param INTEGER,
  processed_by_param INTEGER,
  new_status VARCHAR(50),
  notes_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  IF new_status NOT IN ('approved', 'paid', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;
  
  UPDATE affiliate_withdrawals 
  SET 
    status = new_status,
    processed_at = NOW(),
    processed_by = processed_by_param,
    notes = COALESCE(notes_param, notes),
    updated_at = NOW()
  WHERE id = withdrawal_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function: approve_commission_on_delivery
CREATE OR REPLACE FUNCTION approve_commission_on_delivery(order_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE commissions 
  SET 
    status = 'approved',
    updated_at = NOW()
  WHERE order_id = order_id_param 
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function: get_affiliate_available_balance
CREATE OR REPLACE FUNCTION get_affiliate_available_balance(affiliate_id_param INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  available_balance DECIMAL(10,2);
BEGIN
  SELECT COALESCE(
    (SELECT SUM(amount) FROM commissions 
     WHERE affiliate_id = affiliate_id_param AND status = 'approved') -
    (SELECT SUM(amount) FROM affiliate_withdrawals 
     WHERE affiliate_id = affiliate_id_param AND status IN ('paid', 'pending')),
    0
  ) INTO available_balance;
  
  RETURN COALESCE(available_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 13. COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON SCHEMA public IS 'Referio affiliate marketing platform - complete database schema';

COMMENT ON TABLE affiliates IS 'Core affiliates table - all Referio platform users';
COMMENT ON TABLE commissions IS 'Commission records for affiliate orders';
COMMENT ON TABLE affiliate_withdrawals IS 'Withdrawal requests from affiliates';
COMMENT ON TABLE affiliate_xp IS 'XP profiles for gamification system';
COMMENT ON TABLE courses IS 'Course catalog for affiliate training';

-- ==============================================
-- VERIFICATION
-- ==============================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND (tablename LIKE '%' OR tablename IN ('video_progress', 'video_milestones'));
    
    RAISE NOTICE 'Successfully created % Referio tables', table_count;
END $$;

COMMIT;

