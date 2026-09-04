-- Migration: Create Gamification System Indexes
-- Purpose: Add performance indexes for gamification system tables
-- Date: 2024-01-XX
-- Description: Creates indexes for optimal query performance

-- Affiliate XP indexes
CREATE INDEX idx_rf_affiliate_xp_affiliate_id ON rf_affiliate_xp(affiliate_id);
CREATE INDEX idx_rf_affiliate_xp_level ON rf_affiliate_xp(current_level);
CREATE INDEX idx_rf_affiliate_xp_total_xp ON rf_affiliate_xp(total_xp);
CREATE INDEX idx_rf_affiliate_xp_updated_at ON rf_affiliate_xp(updated_at);

-- XP events indexes
CREATE INDEX idx_rf_xp_events_affiliate_id ON rf_xp_events(affiliate_id);
CREATE INDEX idx_rf_xp_events_activity_type ON rf_xp_events(activity_type);
CREATE INDEX idx_rf_xp_events_created_at ON rf_xp_events(created_at);
CREATE INDEX idx_rf_xp_events_affiliate_activity ON rf_xp_events(affiliate_id, activity_type);

-- Badges indexes
CREATE INDEX idx_rf_badges_category ON rf_badges(category);
CREATE INDEX idx_rf_badges_rarity ON rf_badges(rarity);
CREATE INDEX idx_rf_badges_active ON rf_badges(is_active);
CREATE INDEX idx_rf_badges_xp_reward ON rf_badges(xp_reward);

-- Affiliate badges indexes
CREATE INDEX idx_rf_affiliate_badges_affiliate_id ON rf_affiliate_badges(affiliate_id);
CREATE INDEX idx_rf_affiliate_badges_badge_id ON rf_affiliate_badges(badge_id);
CREATE INDEX idx_rf_affiliate_badges_earned ON rf_affiliate_badges(is_earned);
CREATE INDEX idx_rf_affiliate_badges_earned_at ON rf_affiliate_badges(earned_at);

-- Levels indexes
CREATE INDEX idx_rf_levels_level_number ON rf_levels(level_number);
CREATE INDEX idx_rf_levels_xp_required ON rf_levels(xp_required);
CREATE INDEX idx_rf_levels_active ON rf_levels(is_active);

-- Streaks indexes
CREATE INDEX idx_rf_streaks_affiliate_id ON rf_streaks(affiliate_id);
CREATE INDEX idx_rf_streaks_type ON rf_streaks(streak_type);
CREATE INDEX idx_rf_streaks_active ON rf_streaks(is_active);
CREATE INDEX idx_rf_streaks_last_activity ON rf_streaks(last_activity_date);
CREATE INDEX idx_rf_streaks_current ON rf_streaks(current_streak);

-- Leaderboard cache indexes
CREATE INDEX idx_rf_leaderboard_cache_type ON rf_leaderboard_cache(leaderboard_type);
CREATE INDEX idx_rf_leaderboard_cache_period ON rf_leaderboard_cache(period);
CREATE INDEX idx_rf_leaderboard_cache_expires ON rf_leaderboard_cache(expires_at);
CREATE INDEX idx_rf_leaderboard_cache_generated ON rf_leaderboard_cache(generated_at);

-- Quests indexes
CREATE INDEX idx_rf_quests_type ON rf_quests(quest_type);
CREATE INDEX idx_rf_quests_difficulty ON rf_quests(difficulty);
CREATE INDEX idx_rf_quests_active ON rf_quests(is_active);
CREATE INDEX idx_rf_quests_repeatable ON rf_quests(is_repeatable);
CREATE INDEX idx_rf_quests_xp_reward ON rf_quests(xp_reward);

-- Quest steps indexes
CREATE INDEX idx_rf_quest_steps_quest_id ON rf_quest_steps(quest_id);
CREATE INDEX idx_rf_quest_steps_step_number ON rf_quest_steps(quest_id, step_number);
CREATE INDEX idx_rf_quest_steps_action_type ON rf_quest_steps(action_type);

-- Affiliate quests indexes
CREATE INDEX idx_rf_affiliate_quests_affiliate_id ON rf_affiliate_quests(affiliate_id);
CREATE INDEX idx_rf_affiliate_quests_quest_id ON rf_affiliate_quests(quest_id);
CREATE INDEX idx_rf_affiliate_quests_status ON rf_affiliate_quests(status);
CREATE INDEX idx_rf_affiliate_quests_started_at ON rf_affiliate_quests(started_at);
CREATE INDEX idx_rf_affiliate_quests_completed_at ON rf_affiliate_quests(completed_at);

-- Quest rewards indexes
CREATE INDEX idx_rf_quest_rewards_quest_id ON rf_quest_rewards(quest_id);
CREATE INDEX idx_rf_quest_rewards_type ON rf_quest_rewards(reward_type);

-- Affiliate bonuses indexes
CREATE INDEX idx_rf_affiliate_bonuses_affiliate_id ON rf_affiliate_bonuses(affiliate_id);
CREATE INDEX idx_rf_affiliate_bonuses_type ON rf_affiliate_bonuses(bonus_type);
CREATE INDEX idx_rf_affiliate_bonuses_status ON rf_affiliate_bonuses(status);
CREATE INDEX idx_rf_affiliate_bonuses_unlocked_at ON rf_affiliate_bonuses(unlocked_at);
CREATE INDEX idx_rf_affiliate_bonuses_claimed_at ON rf_affiliate_bonuses(claimed_at);
CREATE INDEX idx_rf_affiliate_bonuses_expires_at ON rf_affiliate_bonuses(expires_at);

-- Bonus configurations indexes
CREATE INDEX idx_rf_bonus_configurations_type ON rf_bonus_configurations(bonus_type);
CREATE INDEX idx_rf_bonus_configurations_active ON rf_bonus_configurations(is_active);
CREATE INDEX idx_rf_bonus_configurations_xp_required ON rf_bonus_configurations(xp_required);
