-- Signup Bonus System Setup
-- This script sets up the 5000 DZD signup bonus system for eligible partners

-- Create signup bonus configuration
CREATE TABLE IF NOT EXISTS bonus_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bonus_type VARCHAR(50) NOT NULL UNIQUE,
  bonus_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DZD',
  xp_required INTEGER NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert signup bonus configuration
INSERT INTO bonus_configurations (bonus_type, bonus_amount, currency, xp_required, description)
VALUES (
  'signup_bonus',
  5000.00,
  'DZD',
  100,
  'Earn 100 XP to unlock your 5000 DZD signup bonus!'
) ON CONFLICT (bonus_type) DO UPDATE SET
  bonus_amount = EXCLUDED.bonus_amount,
  xp_required = EXCLUDED.xp_required,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Function to create signup bonus for new partners
CREATE OR REPLACE FUNCTION create_signup_bonus_for_partner(partner_id_param INTEGER)
RETURNS UUID AS $$
DECLARE
  bonus_id UUID;
  xp_required INTEGER;
BEGIN
  -- Get the XP requirement for signup bonus
  SELECT xp_required INTO xp_required
  FROM bonus_configurations
  WHERE bonus_type = 'signup_bonus' AND is_active = true;
  
  -- Create the signup bonus record
  INSERT INTO partner_bonuses (
    partner_id,
    bonus_type,
    bonus_amount,
    currency,
    xp_required,
    xp_earned,
    status,
    description,
    expires_at
  ) VALUES (
    partner_id_param,
    'signup_bonus',
    5000.00,
    'DZD',
    xp_required,
    0,
    'pending',
    'Earn 100 XP to unlock your 5000 DZD signup bonus!',
    NOW() + INTERVAL '30 days' -- Bonus expires in 30 days
  ) RETURNING id INTO bonus_id;
  
  RETURN bonus_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check and unlock bonuses when XP is earned
CREATE OR REPLACE FUNCTION check_and_unlock_bonuses(partner_id_param INTEGER, new_total_xp INTEGER)
RETURNS TABLE(bonus_id UUID, bonus_amount DECIMAL(10,2), status VARCHAR(20)) AS $$
DECLARE
  bonus_record RECORD;
BEGIN
  -- Find pending bonuses that can now be unlocked
  FOR bonus_record IN
    SELECT id, bonus_amount, xp_required
    FROM partner_bonuses
    WHERE partner_id = partner_id_param
      AND status = 'pending'
      AND new_total_xp >= xp_required
  LOOP
    -- Update bonus status to unlocked
    UPDATE partner_bonuses
    SET status = 'unlocked',
        unlocked_at = NOW(),
        xp_earned = new_total_xp
    WHERE id = bonus_record.id;
    
    -- Return the unlocked bonus info
    bonus_id := bonus_record.id;
    bonus_amount := bonus_record.bonus_amount;
    status := 'unlocked';
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to claim a bonus
CREATE OR REPLACE FUNCTION claim_bonus(bonus_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  bonus_record RECORD;
BEGIN
  -- Get the bonus record
  SELECT * INTO bonus_record
  FROM partner_bonuses
  WHERE id = bonus_id_param;
  
  -- Check if bonus exists and is unlocked
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  IF bonus_record.status != 'unlocked' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if bonus has expired
  IF bonus_record.expires_at IS NOT NULL AND bonus_record.expires_at < NOW() THEN
    UPDATE partner_bonuses
    SET status = 'expired'
    WHERE id = bonus_id_param;
    RETURN FALSE;
  END IF;
  
  -- Mark bonus as claimed
  UPDATE partner_bonuses
  SET status = 'claimed',
      claimed_at = NOW()
  WHERE id = bonus_id_param;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create signup bonuses for existing partners who don't have one
INSERT INTO partner_bonuses (
  partner_id,
  bonus_type,
  bonus_amount,
  currency,
  xp_required,
  xp_earned,
  status,
  description,
  expires_at
)
SELECT 
  p.id as partner_id,
  'signup_bonus' as bonus_type,
  5000.00 as bonus_amount,
  'DZD' as currency,
  100 as xp_required,
  COALESCE(px.total_xp, 0) as xp_earned,
  CASE 
    WHEN COALESCE(px.total_xp, 0) >= 100 THEN 'unlocked'
    ELSE 'pending'
  END as status,
  'Earn 100 XP to unlock your 5000 DZD signup bonus!' as description,
  NOW() + INTERVAL '30 days' as expires_at
FROM partners p
LEFT JOIN partner_xp px ON p.id = px.partner_id
WHERE p.id NOT IN (
  SELECT partner_id 
  FROM partner_bonuses 
  WHERE bonus_type = 'signup_bonus'
);

-- Update existing bonuses that should be unlocked
UPDATE partner_bonuses
SET status = 'unlocked',
    unlocked_at = NOW(),
    xp_earned = px.total_xp
FROM partner_xp px
WHERE partner_bonuses.partner_id = px.partner_id
  AND partner_bonuses.bonus_type = 'signup_bonus'
  AND partner_bonuses.status = 'pending'
  AND px.total_xp >= partner_bonuses.xp_required;

-- Show summary of signup bonuses
SELECT 
  'Signup bonuses created' as item,
  COUNT(*) as count
FROM partner_bonuses
WHERE bonus_type = 'signup_bonus'

UNION ALL

SELECT 
  'Pending bonuses' as item,
  COUNT(*) as count
FROM partner_bonuses
WHERE bonus_type = 'signup_bonus' AND status = 'pending'

UNION ALL

SELECT 
  'Unlocked bonuses' as item,
  COUNT(*) as count
FROM partner_bonuses
WHERE bonus_type = 'signup_bonus' AND status = 'unlocked'

UNION ALL

SELECT 
  'Claimed bonuses' as item,
  COUNT(*) as count
FROM partner_bonuses
WHERE bonus_type = 'signup_bonus' AND status = 'claimed';
