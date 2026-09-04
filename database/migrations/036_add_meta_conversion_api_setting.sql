-- Add Meta Conversion API access token setting
-- Migration: 036_add_meta_conversion_api_setting.sql

INSERT INTO settings (key, value, description, category) VALUES
  ('meta_conversion_api_access_token', NULL, 'Meta Conversion API access token for server-side event tracking', 'analytics')
ON CONFLICT (key) DO NOTHING;

