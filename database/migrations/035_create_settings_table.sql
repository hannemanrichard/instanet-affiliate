-- Create settings table for managing analytics and tracking pixels
-- Migration: 035_create_settings_table.sql

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on key for fast lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Insert default settings
INSERT INTO settings (key, value, description, category) VALUES
  ('facebook_pixel_id', NULL, 'Facebook Pixel ID for tracking conversions', 'analytics'),
  ('tiktok_pixel_id', NULL, 'TikTok Pixel ID(s); comma-separated for multiple pixels', 'analytics'),
  ('google_analytics_id', NULL, 'Google Analytics tracking ID (GA4)', 'analytics'),
  ('microsoft_clarity_id', NULL, 'Microsoft Clarity project ID for user behavior tracking', 'analytics')
ON CONFLICT (key) DO NOTHING;

