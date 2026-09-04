-- Migration: Create Gamification System Functions
-- Purpose: Add helper functions for gamification operations
-- Date: 2024-01-XX
-- Description: Creates functions for XP management, badge awarding, level progression, and bonus handling

-- Function to initialize affiliate XP profile
CREATE OR REPLACE FUNCTION rf_initialize_affiliate_xp(affiliate_id_param INTEGER)
RETURNS UUID AS $$
DECLARE
  xp_profile_id UUID;
BEGIN
  -- Check if XP profile already exists
  IF EXISTS (SELECT 1 FROM rf_affiliate_xp WHERE affiliate_id = affiliate_id_param) THEN
    RAISE EXCEPTION 'XP profile already exists for affiliate %', affiliate_id_param;
  END IF;
  
  -- Create XP profile
  INSERT INTO rf_affiliate_xp (
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

-- Function to add XP to affiliate
CREATE OR REPLACE FUNCTION rf_add_affiliate_xp(
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
  level_up BOOLEAN := FALSE;
BEGIN
  -- Calculate actual XP with multiplier
  xp_amount_param := xp_amount_param * multiplier_param;
  
  -- Get current XP profile
  SELECT total_xp, current_level, xp_to_next_level 
  INTO current_xp, current_level, xp_to_next_level
  FROM rf_affiliate_xp 
  WHERE affiliate_id = affiliate_id_param;
  
  -- If no profile exists, create one
  IF NOT FOUND THEN
    PERFORM rf_initialize_affiliate_xp(affiliate_id_param);
    current_xp := 0;
    current_level := 1;
    xp_to_next_level := 100;
  END IF;
  
  -- Calculate new total XP
  new_total_xp := current_xp + xp_amount_param;
  
  -- Check for level up
  WHILE new_total_xp >= xp_to_next_level LOOP
    new_level := current_level + 1;
    
    -- Get XP required for next level
    SELECT l.xp_required INTO xp_to_next_level
    FROM rf_levels l
    WHERE l.level_number = new_level + 1
    ORDER BY l.level_number ASC
    LIMIT 1;
    
    -- If no next level found, cap at current level
    IF NOT FOUND THEN
      xp_to_next_level := new_total_xp + 1; -- Prevent further leveling
      EXIT;
    END IF;
    
    current_level := new_level;
    level_up := TRUE;
  END LOOP;
  
  -- Update XP profile
  UPDATE rf_affiliate_xp SET
    total_xp = new_total_xp,
    current_level = current_level,
    xp_to_next_level = xp_to_next_level - new_total_xp,
    updated_at = NOW()
  WHERE affiliate_id = affiliate_id_param;
  
  -- Create XP event
  INSERT INTO rf_xp_events (
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
  
  -- Check and award badges
  PERFORM rf_check_and_award_badges(affiliate_id_param);
  
  -- Check and unlock bonuses
  PERFORM rf_check_and_unlock_bonuses(affiliate_id_param, new_total_xp);
  
  RETURN xp_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION rf_check_and_award_badges(affiliate_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
  badge_record RECORD;
  badges_awarded INTEGER := 0;
BEGIN
  -- Check all active badges
  FOR badge_record IN 
    SELECT b.* FROM rf_badges b 
    WHERE b.is_active = true
  LOOP
    -- Check if affiliate already has this badge
    IF NOT EXISTS (
      SELECT 1 FROM rf_affiliate_badges ab 
      WHERE ab.affiliate_id = affiliate_id_param 
      AND ab.badge_id = badge_record.id
    ) THEN
      -- Check if affiliate meets badge criteria
      IF rf_check_badge_criteria(affiliate_id_param, badge_record.id) THEN
        -- Award the badge
        INSERT INTO rf_affiliate_badges (
          affiliate_id,
          badge_id,
          earned_at,
          progress,
          is_earned
        ) VALUES (
          affiliate_id_param,
          badge_record.id,
          NOW(),
          100,
          true
        );
        
        badges_awarded := badges_awarded + 1;
        
        -- Award XP for badge if configured
        IF badge_record.xp_reward > 0 THEN
          PERFORM rf_add_affiliate_xp(
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

-- Function to check badge criteria (simplified version)
CREATE OR REPLACE FUNCTION rf_check_badge_criteria(
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
  -- Get badge criteria
  SELECT b.criteria INTO criteria
  FROM rf_badges b
  WHERE b.id = badge_id_param;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  criteria_type := criteria->>'type';
  required_value := (criteria->>'value')::INTEGER;
  
  -- Check different criteria types
  CASE criteria_type
    WHEN 'total_xp' THEN
      SELECT total_xp INTO current_value
      FROM rf_affiliate_xp
      WHERE affiliate_id = affiliate_id_param;
      
    WHEN 'level' THEN
      SELECT current_level INTO current_value
      FROM rf_affiliate_xp
      WHERE affiliate_id = affiliate_id_param;
      
    WHEN 'orders_completed' THEN
      SELECT COUNT(*)::INTEGER INTO current_value
      FROM orders
      WHERE affiliate_id = affiliate_id_param
      AND status = 'delivered';
      
    WHEN 'course_completed' THEN
      SELECT COUNT(*)::INTEGER INTO current_value
      FROM course_completions
      WHERE affiliate_id = affiliate_id_param;
      
    WHEN 'streak_days' THEN
      SELECT COALESCE(MAX(current_streak), 0) INTO current_value
      FROM rf_streaks
      WHERE affiliate_id = affiliate_id_param
      AND is_active = true;
      
    ELSE
      RETURN FALSE;
  END CASE;
  
  RETURN current_value >= required_value;
END;
$$ LANGUAGE plpgsql;

-- Function to update streak
CREATE OR REPLACE FUNCTION rf_update_affiliate_streak(
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
  -- Check if streak exists
  SELECT EXISTS(
    SELECT 1 FROM rf_streaks 
    WHERE affiliate_id = affiliate_id_param 
    AND streak_type = streak_type_param
  ) INTO streak_exists;
  
  IF NOT streak_exists THEN
    -- Create new streak
    INSERT INTO rf_streaks (
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
    -- Get last activity date
    SELECT last_activity_date INTO last_activity_date
    FROM rf_streaks
    WHERE affiliate_id = affiliate_id_param
    AND streak_type = streak_type_param;
    
    -- Check if streak should continue or reset
    IF last_activity_date = current_date THEN
      -- Already updated today, no change needed
      RETURN FALSE;
    ELSIF last_activity_date = current_date - INTERVAL '1 day' THEN
      -- Continue streak
      UPDATE rf_streaks SET
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = current_date,
        updated_at = NOW()
      WHERE affiliate_id = affiliate_id_param
      AND streak_type = streak_type_param;
      streak_updated := TRUE;
    ELSE
      -- Reset streak
      UPDATE rf_streaks SET
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

-- Function to create signup bonus
CREATE OR REPLACE FUNCTION rf_create_signup_bonus(affiliate_id_param INTEGER)
RETURNS UUID AS $$
DECLARE
  bonus_id UUID;
  bonus_config RECORD;
BEGIN
  -- Get signup bonus configuration
  SELECT * INTO bonus_config
  FROM rf_bonus_configurations
  WHERE bonus_type = 'signup'
  AND is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Signup bonus configuration not found';
  END IF;
  
  -- Check if affiliate already has signup bonus
  IF EXISTS (
    SELECT 1 FROM rf_affiliate_bonuses
    WHERE affiliate_id = affiliate_id_param
    AND bonus_type = 'signup'
  ) THEN
    RAISE EXCEPTION 'Affiliate already has signup bonus';
  END IF;
  
  -- Create signup bonus
  INSERT INTO rf_affiliate_bonuses (
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

-- Function to check and unlock bonuses
CREATE OR REPLACE FUNCTION rf_check_and_unlock_bonuses(
  affiliate_id_param INTEGER,
  total_xp_param INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  bonus_record RECORD;
  bonuses_unlocked INTEGER := 0;
BEGIN
  -- Check all pending bonuses for this affiliate
  FOR bonus_record IN 
    SELECT * FROM rf_affiliate_bonuses
    WHERE affiliate_id = affiliate_id_param
    AND status = 'pending'
    AND total_xp_param >= xp_required
  LOOP
    -- Unlock the bonus
    UPDATE rf_affiliate_bonuses SET
      status = 'unlocked',
      unlocked_at = NOW(),
      updated_at = NOW()
    WHERE id = bonus_record.id;
    
    bonuses_unlocked := bonuses_unlocked + 1;
  END LOOP;
  
  RETURN bonuses_unlocked;
END;
$$ LANGUAGE plpgsql;

-- Function to claim bonus
CREATE OR REPLACE FUNCTION rf_claim_affiliate_bonus(
  affiliate_id_param INTEGER,
  bonus_id_param UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  bonus_exists BOOLEAN;
  bonus_status VARCHAR(20);
BEGIN
  -- Check if bonus exists and belongs to affiliate
  SELECT EXISTS(
    SELECT 1 FROM rf_affiliate_bonuses
    WHERE id = bonus_id_param
    AND affiliate_id = affiliate_id_param
  ) INTO bonus_exists;
  
  IF NOT bonus_exists THEN
    RAISE EXCEPTION 'Bonus not found or does not belong to affiliate';
  END IF;
  
  -- Get bonus status
  SELECT status INTO bonus_status
  FROM rf_affiliate_bonuses
  WHERE id = bonus_id_param;
  
  -- Check if bonus can be claimed
  IF bonus_status != 'unlocked' THEN
    RAISE EXCEPTION 'Bonus is not unlocked';
  END IF;
  
  -- Claim the bonus
  UPDATE rf_affiliate_bonuses SET
    status = 'claimed',
    claimed_at = NOW(),
    updated_at = NOW()
  WHERE id = bonus_id_param;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get affiliate gamification summary
CREATE OR REPLACE FUNCTION rf_get_affiliate_gamification_summary(affiliate_id_param INTEGER)
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
  FROM rf_affiliate_xp ax
  FULL OUTER JOIN (
    SELECT COUNT(*) as count
    FROM rf_affiliate_badges
    WHERE affiliate_id = affiliate_id_param AND is_earned = true
  ) earned_badges ON true
  FULL OUTER JOIN (
    SELECT COUNT(*) as count
    FROM rf_badges
    WHERE is_active = true
  ) total_badges ON true
  FULL OUTER JOIN (
    SELECT MAX(current_streak) as max_streak
    FROM rf_streaks
    WHERE affiliate_id = affiliate_id_param AND is_active = true
  ) current_streak ON true
  FULL OUTER JOIN (
    SELECT MAX(longest_streak) as max_streak
    FROM rf_streaks
    WHERE affiliate_id = affiliate_id_param
  ) longest_streak ON true
  FULL OUTER JOIN (
    SELECT COUNT(*) as count
    FROM rf_affiliate_bonuses
    WHERE affiliate_id = affiliate_id_param AND status = 'unlocked'
  ) unlocked_bonuses ON true
  FULL OUTER JOIN (
    SELECT COUNT(*) as count
    FROM rf_affiliate_bonuses
    WHERE affiliate_id = affiliate_id_param AND status = 'claimed'
  ) claimed_bonuses ON true
  WHERE ax.affiliate_id = affiliate_id_param OR ax.affiliate_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION rf_initialize_affiliate_xp(INTEGER) IS 'Initialize XP profile for new affiliate';
COMMENT ON FUNCTION rf_add_affiliate_xp(INTEGER, INTEGER, VARCHAR(50), TEXT, VARCHAR(100), DECIMAL(3,2)) IS 'Add XP to affiliate and handle level progression';
COMMENT ON FUNCTION rf_check_and_award_badges(INTEGER) IS 'Check and award eligible badges to affiliate';
COMMENT ON FUNCTION rf_check_badge_criteria(INTEGER, UUID) IS 'Check if affiliate meets badge criteria';
COMMENT ON FUNCTION rf_update_affiliate_streak(INTEGER, VARCHAR(50)) IS 'Update affiliate streak for specific activity type';
COMMENT ON FUNCTION rf_create_signup_bonus(INTEGER) IS 'Create signup bonus for new affiliate';
COMMENT ON FUNCTION rf_check_and_unlock_bonuses(INTEGER, INTEGER) IS 'Check and unlock bonuses based on XP threshold';
COMMENT ON FUNCTION rf_claim_affiliate_bonus(INTEGER, UUID) IS 'Claim unlocked bonus for affiliate';
COMMENT ON FUNCTION rf_get_affiliate_gamification_summary(INTEGER) IS 'Get comprehensive gamification summary for affiliate';
