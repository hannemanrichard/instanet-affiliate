-- Course System Setup Script
-- This script sets up the complete course system

-- Run table creation migration
\i database/migrations/003_create_course_tables.sql

-- Run indexes and constraints migration
\i database/migrations/004_create_course_indexes.sql

-- Setup initial course data
\i database/setup_course_data.sql

-- Display final summary
SELECT 
  'Course System Setup Complete' as status,
  NOW() as completed_at,
  (SELECT COUNT(*) FROM courses) as total_courses,
  (SELECT COUNT(*) FROM course_modules) as total_modules,
  (SELECT COUNT(*) FROM course_videos) as total_videos,
  (SELECT COUNT(*) FROM course_analytics) as analytics_records;
