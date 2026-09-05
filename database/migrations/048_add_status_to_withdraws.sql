ALTER TABLE withdraws
ADD COLUMN status TEXT;

UPDATE withdraws
SET status = CASE
  WHEN is_paid = true THEN 'approved'
  ELSE 'pending'
END
WHERE status IS NULL;

ALTER TABLE withdraws
ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE withdraws
ALTER COLUMN status SET NOT NULL;

ALTER TABLE withdraws
ADD CONSTRAINT withdraws_status_check
CHECK (status IN ('pending', 'approved', 'denied'));

CREATE INDEX idx_withdraws_status_created_at
ON withdraws(status, created_at DESC);
