-- Course System Indexes and Constraints
-- This migration creates indexes and additional constraints for the course system

-- Courses table indexes
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
CREATE INDEX idx_course_videos_external_provider ON course_videos(external_provider);
CREATE INDEX idx_course_videos_external_id ON course_videos(external_video_id);

-- Course enrollments indexes
CREATE INDEX idx_course_enrollments_partner_id ON course_enrollments(partner_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX idx_course_enrollments_enrolled_at ON course_enrollments(enrolled_at);
CREATE INDEX idx_course_enrollments_completed_at ON course_enrollments(completed_at);
CREATE INDEX idx_course_enrollments_progress ON course_enrollments(progress_percentage);

-- Video progress indexes
CREATE INDEX idx_video_progress_partner_id ON video_progress(partner_id);
CREATE INDEX idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX idx_video_progress_course_id ON video_progress(course_id);
CREATE INDEX idx_video_progress_completion ON video_progress(completion_percentage);
CREATE INDEX idx_video_progress_completed ON video_progress(is_completed);
CREATE INDEX idx_video_progress_last_watched ON video_progress(last_watched_at);

-- Video milestones indexes
CREATE INDEX idx_video_milestones_progress_id ON video_milestones(video_progress_id);
CREATE INDEX idx_video_milestones_milestone ON video_milestones(milestone);
CREATE INDEX idx_video_milestones_reached_at ON video_milestones(reached_at);

-- Course progress indexes
CREATE INDEX idx_course_progress_partner_id ON course_progress(partner_id);
CREATE INDEX idx_course_progress_course_id ON course_progress(course_id);
CREATE INDEX idx_course_progress_overall ON course_progress(overall_progress);
CREATE INDEX idx_course_progress_last_activity ON course_progress(last_activity_at);

-- Course completions indexes
CREATE INDEX idx_course_completions_partner_id ON course_completions(partner_id);
CREATE INDEX idx_course_completions_course_id ON course_completions(course_id);
CREATE INDEX idx_course_completions_completed_at ON course_completions(completed_at);
CREATE INDEX idx_course_completions_percentage ON course_completions(completion_percentage);

-- Course analytics indexes
CREATE INDEX idx_course_analytics_course_id ON course_analytics(course_id);
CREATE INDEX idx_course_analytics_calculated_at ON course_analytics(calculated_at);
CREATE INDEX idx_course_analytics_completion_rate ON course_analytics(completion_rate);

-- Composite indexes for common queries
CREATE INDEX idx_course_enrollments_partner_status ON course_enrollments(partner_id, status);
CREATE INDEX idx_course_enrollments_course_status ON course_enrollments(course_id, status);
CREATE INDEX idx_video_progress_partner_course ON video_progress(partner_id, course_id);
CREATE INDEX idx_video_progress_partner_video ON video_progress(partner_id, video_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_courses_updated_at();

CREATE OR REPLACE FUNCTION update_video_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_progress_updated_at
  BEFORE UPDATE ON video_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_video_progress_updated_at();

CREATE OR REPLACE FUNCTION update_course_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_progress_updated_at
  BEFORE UPDATE ON course_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_course_progress_updated_at();

-- Function to calculate course progress
CREATE OR REPLACE FUNCTION calculate_course_progress(
  p_partner_id INTEGER,
  p_course_id UUID
) RETURNS INTEGER AS $$
DECLARE
  total_videos INTEGER;
  completed_videos INTEGER;
  progress_percentage INTEGER;
BEGIN
  -- Get total videos in course
  SELECT COUNT(*) INTO total_videos
  FROM course_videos cv
  JOIN course_modules cm ON cv.module_id = cm.id
  WHERE cm.course_id = p_course_id
    AND cv.is_active = true
    AND cm.is_active = true;
  
  -- Get completed videos
  SELECT COUNT(*) INTO completed_videos
  FROM video_progress vp
  JOIN course_videos cv ON vp.video_id = cv.id
  JOIN course_modules cm ON cv.module_id = cm.id
  WHERE vp.partner_id = p_partner_id
    AND cm.course_id = p_course_id
    AND vp.is_completed = true;
  
  -- Calculate percentage
  IF total_videos > 0 THEN
    progress_percentage := (completed_videos * 100) / total_videos;
  ELSE
    progress_percentage := 0;
  END IF;
  
  RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to update course progress
CREATE OR REPLACE FUNCTION update_course_progress(
  p_partner_id INTEGER,
  p_course_id UUID
) RETURNS VOID AS $$
DECLARE
  total_modules INTEGER;
  completed_modules INTEGER;
  total_videos INTEGER;
  completed_videos INTEGER;
  overall_progress INTEGER;
BEGIN
  -- Get total modules and videos
  SELECT COUNT(*) INTO total_modules
  FROM course_modules
  WHERE course_id = p_course_id AND is_active = true;
  
  SELECT COUNT(*) INTO total_videos
  FROM course_videos cv
  JOIN course_modules cm ON cv.module_id = cm.id
  WHERE cm.course_id = p_course_id
    AND cv.is_active = true
    AND cm.is_active = true;
  
  -- Get completed modules and videos
  SELECT COUNT(DISTINCT cm.id) INTO completed_modules
  FROM course_modules cm
  JOIN course_videos cv ON cm.id = cv.module_id
  JOIN video_progress vp ON cv.id = vp.video_id
  WHERE cm.course_id = p_course_id
    AND vp.partner_id = p_partner_id
    AND vp.is_completed = true
    AND cm.is_active = true
    AND cv.is_active = true;
  
  SELECT COUNT(*) INTO completed_videos
  FROM video_progress vp
  JOIN course_videos cv ON vp.video_id = cv.id
  JOIN course_modules cm ON cv.module_id = cm.id
  WHERE vp.partner_id = p_partner_id
    AND cm.course_id = p_course_id
    AND vp.is_completed = true;
  
  -- Calculate overall progress
  overall_progress := calculate_course_progress(p_partner_id, p_course_id);
  
  -- Update or insert course progress
  INSERT INTO course_progress (
    partner_id, course_id, overall_progress,
    modules_completed, total_modules,
    videos_completed, total_videos,
    last_activity_at
  ) VALUES (
    p_partner_id, p_course_id, overall_progress,
    completed_modules, total_modules,
    completed_videos, total_videos,
    NOW()
  )
  ON CONFLICT (partner_id, course_id)
  DO UPDATE SET
    overall_progress = EXCLUDED.overall_progress,
    modules_completed = EXCLUDED.modules_completed,
    total_modules = EXCLUDED.total_modules,
    videos_completed = EXCLUDED.videos_completed,
    total_videos = EXCLUDED.total_videos,
    last_activity_at = EXCLUDED.last_activity_at,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to award XP for video milestones
CREATE OR REPLACE FUNCTION award_video_milestone_xp(
  p_partner_id INTEGER,
  p_video_id UUID,
  p_milestone INTEGER
) RETURNS INTEGER AS $$
DECLARE
  xp_amount INTEGER;
BEGIN
  -- Calculate XP based on milestone
  CASE p_milestone
    WHEN 25 THEN xp_amount := 10;
    WHEN 50 THEN xp_amount := 15;
    WHEN 75 THEN xp_amount := 20;
    WHEN 100 THEN xp_amount := 25;
    ELSE xp_amount := 0;
  END CASE;
  
  -- Award XP (this would integrate with the gamification system)
  -- For now, we'll just return the XP amount
  -- In a real implementation, this would call the gamification service
  
  RETURN xp_amount;
END;
$$ LANGUAGE plpgsql;
