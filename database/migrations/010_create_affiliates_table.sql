-- Migration: Create Affiliates Table
-- Purpose: Add affiliates table to preserve affiliate marketing functionality
-- Date: 2024-01-XX
-- Description: Creates affiliates table with same structure as old partners table

-- Create affiliates table
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

-- Create indexes for better performance
CREATE INDEX idx_affiliates_clerk_user_id ON affiliates(clerk_user_id);
CREATE INDEX idx_affiliates_email ON affiliates(email);
CREATE INDEX idx_affiliates_username ON affiliates(username);
CREATE INDEX idx_affiliates_status ON affiliates(status);
CREATE INDEX idx_affiliates_referral_source ON affiliates(referral_source);
CREATE INDEX idx_affiliates_created_at ON affiliates(created_at);

-- Add comments for documentation
COMMENT ON TABLE affiliates IS 'Affiliate marketing partners (referral partners)';
COMMENT ON COLUMN affiliates.id IS 'Unique identifier for affiliate';
COMMENT ON COLUMN affiliates.clerk_user_id IS 'Clerk user ID for authentication';
COMMENT ON COLUMN affiliates.email IS 'Email address of the affiliate';
COMMENT ON COLUMN affiliates.fullname IS 'Full name of the affiliate';
COMMENT ON COLUMN affiliates.username IS 'Username for the affiliate';
COMMENT ON COLUMN affiliates.avatar IS 'URL to affiliate avatar image';
COMMENT ON COLUMN affiliates.background IS 'URL to affiliate background image';
COMMENT ON COLUMN affiliates.bio IS 'Biography/description of the affiliate';
COMMENT ON COLUMN affiliates.birthdate IS 'Date of birth of the affiliate';
COMMENT ON COLUMN affiliates.gender IS 'Gender of the affiliate';
COMMENT ON COLUMN affiliates.instagram IS 'Instagram handle/URL';
COMMENT ON COLUMN affiliates.linkedin IS 'LinkedIn profile URL';
COMMENT ON COLUMN affiliates.tiktok IS 'TikTok handle/URL';
COMMENT ON COLUMN affiliates.referral_source IS 'Source that referred this affiliate';
COMMENT ON COLUMN affiliates.status IS 'Current status of the affiliate (active, inactive, suspended)';
COMMENT ON COLUMN affiliates.created_at IS 'Timestamp when affiliate was created';
COMMENT ON COLUMN affiliates.updated_at IS 'Timestamp when affiliate was last updated';
