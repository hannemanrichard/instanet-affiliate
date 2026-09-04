-- Migration: Create Course System Tables
-- Purpose: Implement comprehensive course system for affiliate education
-- Date: 2024-01-XX
-- Description: Creates all tables for course management, video tracking, and progress monitoring

-- Courses definition
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url VARCHAR(500),
  instructor_name VARCHAR(100) NOT NULL,
  instructor_bio TEXT,
  instructor_avatar VARCHAR(500),
  duration_minutes INTEGER NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  learning_objectives TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course modules
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, order_index)
);

-- Course videos
CREATE TABLE course_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  duration_seconds INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  video_type VARCHAR(50) NOT NULL,
  external_provider VARCHAR(50) NOT NULL,
  external_video_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, order_index)
);

-- Course enrollments (using affiliates instead of partners)
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'enrolled',
  current_module_id UUID REFERENCES course_modules(id),
  current_video_id UUID REFERENCES course_videos(id),
  last_watched_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(affiliate_id, course_id)
);

-- Video progress tracking
CREATE TABLE video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  video_id UUID NOT NULL REFERENCES course_videos(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  watch_time_seconds INTEGER DEFAULT 0,
  total_duration_seconds INTEGER NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(affiliate_id, video_id)
);

-- Video milestones
CREATE TABLE video_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_progress_id UUID NOT NULL REFERENCES video_progress(id) ON DELETE CASCADE,
  milestone INTEGER NOT NULL, -- 25, 50, 75, 100
  reached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_awarded INTEGER DEFAULT 0,
  UNIQUE(video_progress_id, milestone)
);

-- Course progress summary
CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  overall_progress INTEGER DEFAULT 0,
  modules_completed INTEGER DEFAULT 0,
  total_modules INTEGER NOT NULL,
  videos_completed INTEGER DEFAULT 0,
  total_videos INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  badges_earned TEXT[] DEFAULT '{}',
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(affiliate_id, course_id)
);

-- Course completion records
CREATE TABLE course_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_percentage INTEGER NOT NULL,
  total_xp_earned INTEGER DEFAULT 0,
  badges_earned TEXT[] DEFAULT '{}',
  time_spent_minutes INTEGER DEFAULT 0,
  UNIQUE(affiliate_id, course_id)
);

-- Course analytics
CREATE TABLE course_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  total_enrollments INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.0,
  average_completion_time INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  most_watched_videos TEXT[] DEFAULT '{}',
  drop_off_points TEXT[] DEFAULT '{}',
  engagement_metrics JSONB DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id)
);
