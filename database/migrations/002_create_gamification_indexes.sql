-- Gamification System Indexes and Constraints
-- Migration: 002_create_gamification_indexes.sql

-- Additional performance indexes
CREATE INDEX idx_xp_events_event_type ON xp_events(event_type);
CREATE INDEX idx_xp_events_partner_created ON xp_events(partner_id, created_at);
CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_rarity ON badges(rarity);
CREATE INDEX idx_badges_active ON badges(is_active);
CREATE INDEX idx_levels_level_number ON levels(level_number);
CREATE INDEX idx_levels_xp_required ON levels(xp_required);
CREATE INDEX idx_partner_streaks_active ON partner_streaks(is_active);
CREATE INDEX idx_partner_streaks_last_activity ON partner_streaks(last_activity_date);
CREATE INDEX idx_quests_type ON quests(quest_type);
CREATE INDEX idx_quests_active ON quests(is_active);
CREATE INDEX idx_quest_steps_order ON quest_steps(quest_id, order_index);
CREATE INDEX idx_partner_quests_started ON partner_quests(started_at);
CREATE INDEX idx_partner_quests_completed ON partner_quests(completed_at);

-- Composite indexes for common queries
CREATE INDEX idx_partner_xp_level ON partner_xp(partner_id, current_level);
CREATE INDEX idx_xp_events_partner_type ON xp_events(partner_id, event_type);
CREATE INDEX idx_partner_badges_earned ON partner_badges(partner_id, earned_at);
CREATE INDEX idx_leaderboard_cache_type_period_rank ON leaderboard_cache(leaderboard_type, period, rank);
CREATE INDEX idx_partner_quests_partner_status ON partner_quests(partner_id, status);

-- Foreign key constraints
ALTER TABLE xp_events ADD CONSTRAINT fk_xp_events_partner 
  FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;

ALTER TABLE partner_badges ADD CONSTRAINT fk_partner_badges_partner 
  FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;

ALTER TABLE partner_badges ADD CONSTRAINT fk_partner_badges_badge 
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE;

ALTER TABLE partner_streaks ADD CONSTRAINT fk_partner_streaks_partner 
  FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;

ALTER TABLE leaderboard_cache ADD CONSTRAINT fk_leaderboard_cache_partner 
  FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;

ALTER TABLE quest_steps ADD CONSTRAINT fk_quest_steps_quest 
  FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE;

ALTER TABLE partner_quests ADD CONSTRAINT fk_partner_quests_partner 
  FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;

ALTER TABLE partner_quests ADD CONSTRAINT fk_partner_quests_quest 
  FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE;

ALTER TABLE quest_rewards ADD CONSTRAINT fk_quest_rewards_partner_quest 
  FOREIGN KEY (partner_quest_id) REFERENCES partner_quests(id) ON DELETE CASCADE;

ALTER TABLE partner_bonuses ADD CONSTRAINT fk_partner_bonuses_partner 
  FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;

-- Check constraints
ALTER TABLE partner_xp ADD CONSTRAINT chk_partner_xp_total_xp CHECK (total_xp >= 0);
ALTER TABLE partner_xp ADD CONSTRAINT chk_partner_xp_current_level CHECK (current_level >= 1);
ALTER TABLE partner_xp ADD CONSTRAINT chk_partner_xp_xp_to_next_level CHECK (xp_to_next_level >= 0);

ALTER TABLE xp_events ADD CONSTRAINT chk_xp_events_xp_amount CHECK (xp_amount > 0);
ALTER TABLE xp_events ADD CONSTRAINT chk_xp_events_multiplier CHECK (multiplier > 0);

ALTER TABLE badges ADD CONSTRAINT chk_badges_xp_reward CHECK (xp_reward >= 0);

ALTER TABLE levels ADD CONSTRAINT chk_levels_level_number CHECK (level_number >= 1);
ALTER TABLE levels ADD CONSTRAINT chk_levels_xp_required CHECK (xp_required >= 0);

ALTER TABLE partner_streaks ADD CONSTRAINT chk_partner_streaks_current_streak CHECK (current_streak >= 0);
ALTER TABLE partner_streaks ADD CONSTRAINT chk_partner_streaks_longest_streak CHECK (longest_streak >= 0);

ALTER TABLE leaderboard_cache ADD CONSTRAINT chk_leaderboard_cache_rank CHECK (rank > 0);
ALTER TABLE leaderboard_cache ADD CONSTRAINT chk_leaderboard_cache_score CHECK (score >= 0);

ALTER TABLE quests ADD CONSTRAINT chk_quests_xp_reward CHECK (xp_reward >= 0);

ALTER TABLE quest_steps ADD CONSTRAINT chk_quest_steps_step_number CHECK (step_number > 0);
ALTER TABLE quest_steps ADD CONSTRAINT chk_quest_steps_order_index CHECK (order_index > 0);

ALTER TABLE partner_quests ADD CONSTRAINT chk_partner_quests_current_step CHECK (current_step > 0);

ALTER TABLE quest_rewards ADD CONSTRAINT chk_quest_rewards_reward_value CHECK (reward_value > 0);

ALTER TABLE partner_bonuses ADD CONSTRAINT chk_partner_bonuses_bonus_amount CHECK (bonus_amount > 0);
ALTER TABLE partner_bonuses ADD CONSTRAINT chk_partner_bonuses_xp_required CHECK (xp_required >= 0);
ALTER TABLE partner_bonuses ADD CONSTRAINT chk_partner_bonuses_xp_earned CHECK (xp_earned >= 0);

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_partner_xp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_partner_xp_updated_at
  BEFORE UPDATE ON partner_xp
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_xp_updated_at();

CREATE OR REPLACE FUNCTION update_partner_streaks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_partner_streaks_updated_at
  BEFORE UPDATE ON partner_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_streaks_updated_at();

CREATE OR REPLACE FUNCTION update_partner_quests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_partner_quests_updated_at
  BEFORE UPDATE ON partner_quests
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_quests_updated_at();

CREATE OR REPLACE FUNCTION update_partner_bonuses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_partner_bonuses_updated_at
  BEFORE UPDATE ON partner_bonuses
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_bonuses_updated_at();
