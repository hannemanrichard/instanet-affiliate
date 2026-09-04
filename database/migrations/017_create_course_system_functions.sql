-- Migration: Create Course System Functions
-- Purpose: Add helper functions for course operations
-- Date: 2024-01-XX
-- Description: Creates functions for course management, progress tracking, and analytics

-- Function to enroll affiliate in course
CREATE OR REPLACE FUNCTION enroll_affiliate_in_course(
  affiliate_id_param INTEGER,
  course_id_param UUID
)
RETURNS UUID AS $$
DECLARE
  enrollment_id UUID;
BEGIN
  -- Check if already enrolled
  IF EXISTS (SELECT 1 FROM course_enrollments WHERE affiliate_id = affiliate_id_param AND course_id = course_id_param) THEN
    RAISE EXCEPTION 'Affiliate already enrolled in this course';
  END IF;
  
  -- Create enrollment
  INSERT INTO course_enrollments (
    affiliate_id,
    course_id,
    enrolled_at,
    status
  ) VALUES (
    affiliate_id_param,
    course_id_param,
    NOW(),
    'enrolled'
  ) RETURNING id INTO enrollment_id;
  
  -- Initialize course progress
  INSERT INTO course_progress (
    affiliate_id,
    course_id,
    total_modules,
    total_videos
  ) VALUES (
    affiliate_id_param,
    course_id_param,
    (SELECT COUNT(*) FROM course_modules WHERE course_id = course_id_param AND is_active = true),
    (SELECT COUNT(*) FROM course_videos cv 
     JOIN course_modules cm ON cv.module_id = cm.id 
     WHERE cm.course_id = course_id_param AND cv.is_active = true)
  );
  
  RETURN enrollment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update video progress
CREATE OR REPLACE FUNCTION update_video_progress(
  affiliate_id_param INTEGER,
  video_id_param UUID,
  watch_time_seconds_param INTEGER,
  completion_percentage_param INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  video_duration INTEGER;
  course_id_val UUID;
  is_video_completed BOOLEAN;
BEGIN
  -- Get video duration and course_id
  SELECT duration_seconds, cm.course_id INTO video_duration, course_id_val
  FROM course_videos cv
  JOIN course_modules cm ON cv.module_id = cm.id
  WHERE cv.id = video_id_param;
  
  -- Determine if video is completed
  is_video_completed := completion_percentage_param >= 100;
  
  -- Insert or update video progress
  INSERT INTO video_progress (
    affiliate_id,
    video_id,
    course_id,
    watch_time_seconds,
    total_duration_seconds,
    completion_percentage,
    is_completed,
    last_watched_at,
    updated_at
  ) VALUES (
    affiliate_id_param,
    video_id_param,
    course_id_val,
    watch_time_seconds_param,
    video_duration,
    completion_percentage_param,
    is_video_completed,
    NOW(),
    NOW()
  ) ON CONFLICT (affiliate_id, video_id) DO UPDATE SET
    watch_time_seconds = watch_time_seconds_param,
    completion_percentage = completion_percentage_param,
    is_completed = is_video_completed,
    last_watched_at = NOW(),
    updated_at = NOW();
  
  -- Award XP for milestones (25%, 50%, 75%, 100%)
  IF completion_percentage_param >= 25 AND NOT EXISTS (
    SELECT 1 FROM video_milestones vm 
    JOIN video_progress vp ON vm.video_progress_id = vp.id 
    WHERE vp.affiliate_id = affiliate_id_param 
    AND vp.video_id = video_id_param 
    AND vm.milestone = 25
  ) THEN
    INSERT INTO video_milestones (video_progress_id, milestone, xp_awarded)
    SELECT vp.id, 25, 10 FROM video_progress vp 
    WHERE vp.affiliate_id = affiliate_id_param AND vp.video_id = video_id_param;
  END IF;
  
  IF completion_percentage_param >= 50 AND NOT EXISTS (
    SELECT 1 FROM video_milestones vm 
    JOIN video_progress vp ON vm.video_progress_id = vp.id 
    WHERE vp.affiliate_id = affiliate_id_param 
    AND vp.video_id = video_id_param 
    AND vm.milestone = 50
  ) THEN
    INSERT INTO video_milestones (video_progress_id, milestone, xp_awarded)
    SELECT vp.id, 50, 15 FROM video_progress vp 
    WHERE vp.affiliate_id = affiliate_id_param AND vp.video_id = video_id_param;
  END IF;
  
  IF completion_percentage_param >= 75 AND NOT EXISTS (
    SELECT 1 FROM video_milestones vm 
    JOIN video_progress vp ON vm.video_progress_id = vp.id 
    WHERE vp.affiliate_id = affiliate_id_param 
    AND vp.video_id = video_id_param 
    AND vm.milestone = 75
  ) THEN
    INSERT INTO video_milestones (video_progress_id, milestone, xp_awarded)
    SELECT vp.id, 75, 20 FROM video_progress vp 
    WHERE vp.affiliate_id = affiliate_id_param AND vp.video_id = video_id_param;
  END IF;
  
  IF completion_percentage_param >= 100 AND NOT EXISTS (
    SELECT 1 FROM video_milestones vm 
    JOIN video_progress vp ON vm.video_progress_id = vp.id 
    WHERE vp.affiliate_id = affiliate_id_param 
    AND vp.video_id = video_id_param 
    AND vm.milestone = 100
  ) THEN
    INSERT INTO video_milestones (video_progress_id, milestone, xp_awarded)
    SELECT vp.id, 100, 50 FROM video_progress vp 
    WHERE vp.affiliate_id = affiliate_id_param AND vp.video_id = video_id_param;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to update course progress
CREATE OR REPLACE FUNCTION update_course_progress(affiliate_id_param INTEGER, course_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  videos_completed_count INTEGER;
  modules_completed_count INTEGER;
  total_videos_count INTEGER;
  total_modules_count INTEGER;
  overall_progress_val INTEGER;
  total_xp INTEGER;
BEGIN
  -- Get counts
  SELECT COUNT(*) INTO videos_completed_count
  FROM video_progress vp
  WHERE vp.affiliate_id = affiliate_id_param 
    AND vp.course_id = course_id_param 
    AND vp.is_completed = true;
  
  SELECT COUNT(*) INTO total_videos_count
  FROM course_videos cv
  JOIN course_modules cm ON cv.module_id = cm.id
  WHERE cm.course_id = course_id_param AND cv.is_active = true;
  
  SELECT COUNT(*) INTO modules_completed_count
  FROM course_modules cm
  WHERE cm.course_id = course_id_param 
    AND cm.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM course_videos cv 
      WHERE cv.module_id = cm.id 
        AND cv.is_active = true 
        AND NOT EXISTS (
          SELECT 1 FROM video_progress vp 
          WHERE vp.video_id = cv.id 
            AND vp.affiliate_id = affiliate_id_param 
            AND vp.is_completed = true
        )
    );
  
  SELECT COUNT(*) INTO total_modules_count
  FROM course_modules cm
  WHERE cm.course_id = course_id_param AND cm.is_active = true;
  
  -- Calculate overall progress
  IF total_videos_count > 0 THEN
    overall_progress_val := ROUND((videos_completed_count::DECIMAL / total_videos_count::DECIMAL) * 100);
  ELSE
    overall_progress_val := 0;
  END IF;
  
  -- Calculate total XP earned
  SELECT COALESCE(SUM(vm.xp_awarded), 0) INTO total_xp
  FROM video_milestones vm
  JOIN video_progress vp ON vm.video_progress_id = vp.id
  WHERE vp.affiliate_id = affiliate_id_param AND vp.course_id = course_id_param;
  
  -- Update course progress
  UPDATE course_progress SET
    overall_progress = overall_progress_val,
    modules_completed = modules_completed_count,
    videos_completed = videos_completed_count,
    xp_earned = total_xp,
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE affiliate_id = affiliate_id_param AND course_id = course_id_param;
  
  -- Check if course is completed
  IF overall_progress_val >= 100 THEN
    -- Mark enrollment as completed
    UPDATE course_enrollments SET
      completed_at = NOW(),
      progress_percentage = 100,
      status = 'completed'
    WHERE affiliate_id = affiliate_id_param AND course_id = course_id_param;
    
    -- Create completion record
    INSERT INTO course_completions (
      affiliate_id,
      course_id,
      completion_percentage,
      total_xp_earned,
      time_spent_minutes
    ) VALUES (
      affiliate_id_param,
      course_id_param,
      overall_progress_val,
      total_xp,
      (SELECT COALESCE(SUM(watch_time_seconds), 0) / 60 FROM video_progress 
       WHERE affiliate_id = affiliate_id_param AND course_id = course_id_param)
    ) ON CONFLICT (affiliate_id, course_id) DO NOTHING;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get affiliate course statistics
CREATE OR REPLACE FUNCTION get_affiliate_course_stats(affiliate_id_param INTEGER)
RETURNS TABLE (
  total_enrollments BIGINT,
  completed_courses BIGINT,
  total_xp_earned INTEGER,
  total_time_spent_minutes INTEGER,
  average_completion_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(enrollments.count, 0) as total_enrollments,
    COALESCE(completed.count, 0) as completed_courses,
    COALESCE(xp.total, 0) as total_xp_earned,
    COALESCE(time_spent.total, 0) as total_time_spent_minutes,
    COALESCE(avg_completion.rate, 0) as average_completion_rate
  FROM (
    SELECT COUNT(*) as count
    FROM course_enrollments 
    WHERE affiliate_id = affiliate_id_param
  ) enrollments
  CROSS JOIN (
    SELECT COUNT(*) as count
    FROM course_completions 
    WHERE affiliate_id = affiliate_id_param
  ) completed
  CROSS JOIN (
    SELECT SUM(total_xp_earned) as total
    FROM course_completions 
    WHERE affiliate_id = affiliate_id_param
  ) xp
  CROSS JOIN (
    SELECT SUM(time_spent_minutes) as total
    FROM course_completions 
    WHERE affiliate_id = affiliate_id_param
  ) time_spent
  CROSS JOIN (
    SELECT AVG(completion_percentage) as rate
    FROM course_completions 
    WHERE affiliate_id = affiliate_id_param
  ) avg_completion;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION enroll_affiliate_in_course(INTEGER, UUID) IS 'Enroll affiliate in course and initialize progress tracking';
COMMENT ON FUNCTION update_video_progress(INTEGER, UUID, INTEGER, INTEGER) IS 'Update video progress and award XP for milestones';
COMMENT ON FUNCTION update_course_progress(INTEGER, UUID) IS 'Update overall course progress and handle completion';
COMMENT ON FUNCTION get_affiliate_course_stats(INTEGER) IS 'Get comprehensive course statistics for an affiliate';
