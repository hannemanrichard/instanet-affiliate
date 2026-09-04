-- Migration: Create Course System Indexes
-- Purpose: Add performance indexes for course system tables
-- Date: 2024-01-XX
-- Description: Creates indexes for optimal query performance

-- Courses indexes
CREATE INDEX idx_courses_active ON courses(is_active);
CREATE INDEX idx_courses_featured ON courses(is_featured);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_created_at ON courses(created_at);

-- Course modules indexes
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_course_modules_order ON course_modules(course_id, order_index);
CREATE INDEX idx_course_modules_active ON course_modules(is_active);

-- Course videos indexes
CREATE INDEX idx_course_videos_module_id ON course_videos(module_id);
CREATE INDEX idx_course_videos_order ON course_videos(module_id, order_index);
CREATE INDEX idx_course_videos_active ON course_videos(is_active);
CREATE INDEX idx_course_videos_provider ON course_videos(external_provider);

-- Course enrollments indexes
CREATE INDEX idx_course_enrollments_affiliate_id ON course_enrollments(affiliate_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX idx_course_enrollments_enrolled_at ON course_enrollments(enrolled_at);
CREATE INDEX idx_course_enrollments_completed_at ON course_enrollments(completed_at);

-- Video progress indexes
CREATE INDEX idx_video_progress_affiliate_id ON video_progress(affiliate_id);
CREATE INDEX idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX idx_video_progress_course_id ON video_progress(course_id);
CREATE INDEX idx_video_progress_completed ON video_progress(is_completed);
CREATE INDEX idx_video_progress_last_watched ON video_progress(last_watched_at);

-- Video milestones indexes
CREATE INDEX idx_video_milestones_progress_id ON video_milestones(video_progress_id);
CREATE INDEX idx_video_milestones_milestone ON video_milestones(milestone);
CREATE INDEX idx_video_milestones_reached_at ON video_milestones(reached_at);

-- Course progress indexes
CREATE INDEX idx_course_progress_affiliate_id ON course_progress(affiliate_id);
CREATE INDEX idx_course_progress_course_id ON course_progress(course_id);
CREATE INDEX idx_course_progress_overall ON course_progress(overall_progress);
CREATE INDEX idx_course_progress_last_activity ON course_progress(last_activity_at);

-- Course completions indexes
CREATE INDEX idx_course_completions_affiliate_id ON course_completions(affiliate_id);
CREATE INDEX idx_course_completions_course_id ON course_completions(course_id);
CREATE INDEX idx_course_completions_completed_at ON course_completions(completed_at);

-- Course analytics indexes
CREATE INDEX idx_course_analytics_course_id ON course_analytics(course_id);
CREATE INDEX idx_course_analytics_calculated_at ON course_analytics(calculated_at);
