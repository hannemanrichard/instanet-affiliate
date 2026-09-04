-- ==============================================
-- QUICK REFERENCE: Remove Commission Trigger
-- ==============================================
-- Run these queries to remove the commission trigger
-- that was accidentally added

-- Drop the trigger
DROP TRIGGER IF EXISTS trigger_calculate_commission_amount ON commissions;

-- Drop the function
DROP FUNCTION IF EXISTS calculate_commission_amount();

-- Verify it's removed (optional check)
SELECT 
  trigger_name, 
  event_object_table, 
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'commissions'
  AND trigger_name = 'trigger_calculate_commission_amount';
-- Should return 0 rows if successfully removed

