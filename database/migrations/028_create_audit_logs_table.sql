-- Migration: Create Audit Logs Table
-- Purpose: Track all data changes for compliance and debugging
-- Date: 2024-01-XX
-- Description: Creates audit_logs table to track INSERT, UPDATE, DELETE operations across all tables

BEGIN;

-- ==============================================
-- CREATE AUDIT_LOGS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name VARCHAR(255) NOT NULL,
  record_id INTEGER NULL,           -- For tables with integer IDs
  record_uuid UUID NULL,            -- For tables with UUID IDs (like orders)
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB NULL,            -- Previous values (for UPDATE/DELETE)
  new_values JSONB NULL,            -- New values (for INSERT/UPDATE)
  changed_by INTEGER NULL,          -- Reference to affiliates.id or employees.id
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure either record_id or record_uuid is set, but not both
  CONSTRAINT check_record_id_type CHECK (
    (record_id IS NULL AND record_uuid IS NOT NULL) OR
    (record_id IS NOT NULL AND record_uuid IS NULL)
  )
);

-- ==============================================
-- CREATE INDEXES
-- ==============================================

-- Index for querying by table name
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name 
ON audit_logs(table_name);

-- Index for querying by record_id
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id 
ON audit_logs(record_id) 
WHERE record_id IS NOT NULL;

-- Index for querying by record_uuid
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_uuid 
ON audit_logs(record_uuid) 
WHERE record_uuid IS NOT NULL;

-- Index for querying by changed_by (user who made the change)
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by 
ON audit_logs(changed_by) 
WHERE changed_by IS NOT NULL;

-- Index for querying by action type
CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
ON audit_logs(action);

-- Index for querying by created_at (time-based queries)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
ON audit_logs(created_at DESC);

-- Composite index for common query patterns (table + record + time)
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record_created 
ON audit_logs(table_name, created_at DESC);

-- ==============================================
-- ADD COMMENTS
-- ==============================================

COMMENT ON TABLE audit_logs IS 'Audit trail for all data changes across the application';
COMMENT ON COLUMN audit_logs.table_name IS 'Name of the table that was modified';
COMMENT ON COLUMN audit_logs.record_id IS 'ID of the record (for tables with integer primary keys)';
COMMENT ON COLUMN audit_logs.record_uuid IS 'UUID of the record (for tables with UUID primary keys like orders)';
COMMENT ON COLUMN audit_logs.action IS 'Type of operation: INSERT, UPDATE, or DELETE';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous values before the change (JSONB format)';
COMMENT ON COLUMN audit_logs.new_values IS 'New values after the change (JSONB format)';
COMMENT ON COLUMN audit_logs.changed_by IS 'ID of the affiliate or employee who made the change';

-- ==============================================
-- SET UP ROW LEVEL SECURITY (RLS)
-- ==============================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view audit logs for their own records
-- Note: This is a basic policy - you may want to restrict this further based on your needs
CREATE POLICY "Users can view audit logs"
ON audit_logs
FOR SELECT
USING (true); -- Allow all authenticated users to view audit logs
-- TODO: Restrict based on user role/permissions as needed

-- Policy: Only service role can insert audit logs
-- Audit logs should only be inserted by the application, not by users directly
CREATE POLICY "Service role can insert audit logs"
ON audit_logs
FOR INSERT
WITH CHECK (true); -- Application-level service account will handle inserts

-- ==============================================
-- GRANT PERMISSIONS
-- ==============================================

-- Grant permissions to authenticated users (read-only for viewing)
GRANT SELECT ON audit_logs TO authenticated;

-- Grant permissions to service role (for inserts)
-- Note: Service role permissions are typically handled by Supabase automatically

COMMIT;

