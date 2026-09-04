-- ==============================================
-- REFERIO DATABASE COMPLETE MIGRATION SCRIPT
-- ==============================================
-- This script creates ALL Referio tables, indexes, and functions
-- Run this on the NEW Referio Supabase database
--
-- Usage:
--   1. Create new Supabase project for Referio
--   2. Run this script on that database
--   3. Generate types: npx supabase gen types typescript --project-id <referio_project_id>
--
-- ==============================================

BEGIN;

-- ==============================================
-- EXTENSIONS
-- ==============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================
-- 1. AFFILIATES TABLE (Core - No dependencies)
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
CREATE INDEX idx_affiliates_referral_source ON affiliates(referral_source);
CREATE INDEX idx_affiliates_created_at ON affiliates(created_at);

-- ==============================================
-- 2. COMMISSIONS TABLE
-- ==============================================

CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  order_id UUID, -- UUID string (from referio_orders)
  product_id INTEGER,
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) DEFAULT 0.10,
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
-- 3. AFFILIATE WITHDRAWALS TABLE
-- ==============================================

CREATE TABLE affiliate_withdrawals (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_details JSONB NOT NULL, -- {bank_name, account_number, etc}
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
-- 4. REFERIO ORDERS TABLES
-- ==============================================

CREATE TABLE referio_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  customer_address_line_1 VARCHAR(255) NOT NULL,
  customer_address_line_2 VARCHAR(255),
  customer_city VARCHAR(100) NOT NULL,
  customer_state_province VARCHAR(100),
  customer_postal_code VARCHAR(20),
  customer_country VARCHAR(100) DEFAULT 'Algeria',
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping_cost DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  payment_method VARCHAR(50),
  delivery_company VARCHAR(100),
  tracking_number VARCHAR(100),
  commission_rate DECIMAL(5,4) DEFAULT 0.10,
  commission_amount DECIMAL(10,2),
  commission_status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE referio_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES referio_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  color VARCHAR(50),
  size VARCHAR(50),
  sku VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for referio_orders
CREATE INDEX idx_referio_orders_affiliate_id ON referio_orders(affiliate_id);
CREATE INDEX idx_referio_orders_status ON referio_orders(status);
CREATE INDEX idx_referio_orders_payment_status ON referio_orders(payment_status);
CREATE INDEX idx_referio_orders_commission_status ON referio_orders(commission_status);
CREATE INDEX idx_referio_orders_created_at ON referio_orders(created_at DESC);
CREATE INDEX idx_referio_orders_customer_phone ON referio_orders(customer_phone);
CREATE INDEX idx_referio_orders_tracking_number ON referio_orders(tracking_number) WHERE tracking_number IS NOT NULL;
CREATE INDEX idx_referio_orders_affiliate_status ON referio_orders(affiliate_id, status);
CREATE INDEX idx_referio_orders_affiliate_created ON referio_orders(affiliate_id, created_at DESC);

-- Indexes for referio_order_items
CREATE INDEX idx_referio_order_items_order_id ON referio_order_items(order_id);
CREATE INDEX idx_referio_order_items_product_id ON referio_order_items(product_id) WHERE product_id IS NOT NULL;

-- Triggers for referio_orders
CREATE OR REPLACE FUNCTION update_referio_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_referio_orders_updated_at
  BEFORE UPDATE ON referio_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_referio_orders_updated_at();

CREATE OR REPLACE FUNCTION calculate_referio_order_commission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total IS NOT NULL AND NEW.commission_rate IS NOT NULL THEN
    NEW.commission_amount = NEW.total * NEW.commission_rate;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_referio_order_commission
  BEFORE INSERT OR UPDATE OF total, commission_rate ON referio_orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_referio_order_commission();

-- ==============================================
-- 5. COURSE SYSTEM TABLES
-- ==============================================

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

CREATE TABLE video_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_progress_id UUID NOT NULL REFERENCES video_progress(id) ON DELETE CASCADE,
  milestone INTEGER NOT NULL,
  reached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_awarded INTEGER DEFAULT 0,
  UNIQUE(video_progress_id, milestone)
);

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

-- Course System Indexes
CREATE INDEX idx_courses_active ON courses(is_active);
CREATE INDEX idx_courses_featured ON courses(is_featured);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_created_at ON courses(created_at);
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_course_modules_order ON course_modules(course_id, order_index);
CREATE INDEX idx_course_modules_active ON course_modules(is_active);
CREATE INDEX idx_course_videos_module_id ON course_videos(module_id);
CREATE INDEX idx_course_videos_order ON course_videos(module_id, order_index);
CREATE INDEX idx_course_videos_active ON course_videos(is_active);
CREATE INDEX idx_course_videos_provider ON course_videos(external_provider);
CREATE INDEX idx_course_enrollments_affiliate_id ON course_enrollments(affiliate_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX idx_course_enrollments_enrolled_at ON course_enrollments(enrolled_at);
CREATE INDEX idx_course_enrollments_completed_at ON course_enrollments(completed_at);
CREATE INDEX idx_video_progress_affiliate_id ON video_progress(affiliate_id);
CREATE INDEX idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX idx_video_progress_course_id ON video_progress(course_id);
CREATE INDEX idx_video_progress_completed ON video_progress(is_completed);
CREATE INDEX idx_video_progress_last_watched ON video_progress(last_watched_at);
CREATE INDEX idx_video_milestones_progress_id ON video_milestones(video_progress_id);
CREATE INDEX idx_video_milestones_milestone ON video_milestones(milestone);
CREATE INDEX idx_video_milestones_reached_at ON video_milestones(reached_at);
CREATE INDEX idx_course_progress_affiliate_id ON course_progress(affiliate_id);
CREATE INDEX idx_course_progress_course_id ON course_progress(course_id);
CREATE INDEX idx_course_progress_overall ON course_progress(overall_progress);
CREATE INDEX idx_course_progress_last_activity ON course_progress(last_activity_at);
CREATE INDEX idx_course_completions_affiliate_id ON course_completions(affiliate_id);
CREATE INDEX idx_course_completions_course_id ON course_completions(course_id);
CREATE INDEX idx_course_completions_completed_at ON course_completions(completed_at);
CREATE INDEX idx_course_analytics_course_id ON course_analytics(course_id);
CREATE INDEX idx_course_analytics_calculated_at ON course_analytics(calculated_at);

-- ==============================================
-- 6. GAMIFICATION TABLES (rf_*)
-- ==============================================

CREATE TABLE rf_affiliate_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL UNIQUE REFERENCES affiliates(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rf_xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  activity_id VARCHAR(255),
  xp_amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  multiplier DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rf_badges (
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

CREATE TABLE rf_affiliate_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES rf_badges(id) ON DELETE CASCADE,
  is_earned BOOLEAN DEFAULT false,
  earned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(affiliate_id, badge_id)
);

CREATE TABLE rf_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number INTEGER NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  xp_required INTEGER NOT NULL,
  benefits JSONB,
  icon_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE rf_streaks (
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

CREATE TABLE rf_leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type VARCHAR(50) NOT NULL,
  period VARCHAR(20) NOT NULL,
  entries JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(leaderboard_type, period)
);

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

CREATE TABLE rf_quest_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES rf_quests(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  action_type VARCHAR(50) NOT NULL,
  action_data JSONB,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quest_id, step_number)
);

CREATE TABLE rf_affiliate_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES rf_quests(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(affiliate_id, quest_id)
);

CREATE TABLE rf_quest_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES rf_quests(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL,
  reward_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rf_affiliate_bonuses (
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

CREATE TABLE rf_bonus_configurations (
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

-- Gamification Indexes
CREATE INDEX idx_rf_affiliate_xp_affiliate_id ON rf_affiliate_xp(affiliate_id);
CREATE INDEX idx_rf_affiliate_xp_level ON rf_affiliate_xp(current_level);
CREATE INDEX idx_rf_affiliate_xp_total_xp ON rf_affiliate_xp(total_xp);
CREATE INDEX idx_rf_affiliate_xp_updated_at ON rf_affiliate_xp(updated_at);
CREATE INDEX idx_rf_xp_events_affiliate_id ON rf_xp_events(affiliate_id);
CREATE INDEX idx_rf_xp_events_activity_type ON rf_xp_events(activity_type);
CREATE INDEX idx_rf_xp_events_created_at ON rf_xp_events(created_at);
CREATE INDEX idx_rf_xp_events_affiliate_activity ON rf_xp_events(affiliate_id, activity_type);
CREATE INDEX idx_rf_badges_category ON rf_badges(category);
CREATE INDEX idx_rf_badges_rarity ON rf_badges(rarity);
CREATE INDEX idx_rf_badges_active ON rf_badges(is_active);
CREATE INDEX idx_rf_badges_xp_reward ON rf_badges(xp_reward);
CREATE INDEX idx_rf_affiliate_badges_affiliate_id ON rf_affiliate_badges(affiliate_id);
CREATE INDEX idx_rf_affiliate_badges_badge_id ON rf_affiliate_badges(badge_id);
CREATE INDEX idx_rf_affiliate_badges_earned ON rf_affiliate_badges(is_earned);
CREATE INDEX idx_rf_affiliate_badges_earned_at ON rf_affiliate_badges(earned_at);
CREATE INDEX idx_rf_levels_level_number ON rf_levels(level_number);
CREATE INDEX idx_rf_levels_xp_required ON rf_levels(xp_required);
CREATE INDEX idx_rf_levels_active ON rf_levels(is_active);
CREATE INDEX idx_rf_streaks_affiliate_id ON rf_streaks(affiliate_id);
CREATE INDEX idx_rf_streaks_type ON rf_streaks(streak_type);
CREATE INDEX idx_rf_streaks_active ON rf_streaks(is_active);
CREATE INDEX idx_rf_streaks_last_activity ON rf_streaks(last_activity_date);
CREATE INDEX idx_rf_streaks_current ON rf_streaks(current_streak);
CREATE INDEX idx_rf_leaderboard_cache_type ON rf_leaderboard_cache(leaderboard_type);
CREATE INDEX idx_rf_leaderboard_cache_period ON rf_leaderboard_cache(period);
CREATE INDEX idx_rf_leaderboard_cache_expires ON rf_leaderboard_cache(expires_at);
CREATE INDEX idx_rf_leaderboard_cache_generated ON rf_leaderboard_cache(generated_at);
CREATE INDEX idx_rf_quests_type ON rf_quests(quest_type);
CREATE INDEX idx_rf_quests_difficulty ON rf_quests(difficulty);
CREATE INDEX idx_rf_quests_active ON rf_quests(is_active);
CREATE INDEX idx_rf_quests_repeatable ON rf_quests(is_repeatable);
CREATE INDEX idx_rf_quests_xp_reward ON rf_quests(xp_reward);
CREATE INDEX idx_rf_quest_steps_quest_id ON rf_quest_steps(quest_id);
CREATE INDEX idx_rf_quest_steps_step_number ON rf_quest_steps(quest_id, step_number);
CREATE INDEX idx_rf_quest_steps_action_type ON rf_quest_steps(action_type);
CREATE INDEX idx_rf_affiliate_quests_affiliate_id ON rf_affiliate_quests(affiliate_id);
CREATE INDEX idx_rf_affiliate_quests_quest_id ON rf_affiliate_quests(quest_id);
CREATE INDEX idx_rf_affiliate_quests_status ON rf_affiliate_quests(status);
CREATE INDEX idx_rf_affiliate_quests_started_at ON rf_affiliate_quests(started_at);
CREATE INDEX idx_rf_affiliate_quests_completed_at ON rf_affiliate_quests(completed_at);
CREATE INDEX idx_rf_quest_rewards_quest_id ON rf_quest_rewards(quest_id);
CREATE INDEX idx_rf_quest_rewards_type ON rf_quest_rewards(reward_type);
CREATE INDEX idx_rf_affiliate_bonuses_affiliate_id ON rf_affiliate_bonuses(affiliate_id);
CREATE INDEX idx_rf_affiliate_bonuses_type ON rf_affiliate_bonuses(bonus_type);
CREATE INDEX idx_rf_affiliate_bonuses_status ON rf_affiliate_bonuses(status);
CREATE INDEX idx_rf_affiliate_bonuses_unlocked_at ON rf_affiliate_bonuses(unlocked_at);
CREATE INDEX idx_rf_affiliate_bonuses_claimed_at ON rf_affiliate_bonuses(claimed_at);
CREATE INDEX idx_rf_affiliate_bonuses_expires_at ON rf_affiliate_bonuses(expires_at);
CREATE INDEX idx_rf_bonus_configurations_type ON rf_bonus_configurations(bonus_type);
CREATE INDEX idx_rf_bonus_configurations_active ON rf_bonus_configurations(is_active);
CREATE INDEX idx_rf_bonus_configurations_xp_required ON rf_bonus_configurations(xp_required);

COMMIT;

-- ==============================================
-- NOTE: Functions will be added in a separate step
-- They can be migrated from:
-- - database/migrations/012_create_affiliate_functions.sql
-- - database/migrations/017_create_course_system_functions.sql
-- - database/migrations/021_create_gamification_functions.sql
-- ==============================================

