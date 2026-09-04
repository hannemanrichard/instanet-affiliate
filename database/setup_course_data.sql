-- Course System Initial Data Setup
-- This script sets up the initial course data for the platform

-- Insert the main platform course
INSERT INTO courses (
  title,
  description,
  thumbnail_url,
  instructor_name,
  instructor_bio,
  instructor_avatar,
  duration_minutes,
  difficulty,
  category,
  tags,
  learning_objectives,
  is_active,
  is_featured
) VALUES (
  'Complete Referio Platform Training',
  'Master the Referio affiliate marketing platform with this comprehensive training course. Learn everything from basic setup to advanced strategies for maximizing your earnings.',
  'https://example.com/course-thumbnail.jpg',
  'Referio Team',
  'Our expert team has years of experience in affiliate marketing and platform development. We''ve helped thousands of partners succeed.',
  'https://example.com/instructor-avatar.jpg',
  180, -- 3 hours total
  'beginner',
  'platform_training',
  ARRAY['affiliate marketing', 'platform training', 'earning strategies', 'partner success'],
  ARRAY[
    'Understand the Referio platform structure',
    'Learn how to create effective leads',
    'Master order management and tracking',
    'Develop successful marketing strategies',
    'Optimize your earning potential',
    'Build long-term partner relationships'
  ],
  true,
  true
);

-- Get the course ID for module creation
DO $$
DECLARE
  course_uuid UUID;
BEGIN
  -- Get the course ID
  SELECT id INTO course_uuid FROM courses WHERE title = 'Complete Referio Platform Training';
  
  -- Insert course modules
  INSERT INTO course_modules (course_id, title, description, order_index, duration_minutes) VALUES
  (course_uuid, 'Getting Started', 'Introduction to the Referio platform and basic setup', 1, 30),
  (course_uuid, 'Lead Management', 'How to create, track, and manage leads effectively', 2, 45),
  (course_uuid, 'Order Processing', 'Understanding the order lifecycle and management', 3, 40),
  (course_uuid, 'Marketing Strategies', 'Advanced marketing techniques for partner success', 4, 35),
  (course_uuid, 'Analytics & Optimization', 'Using data to improve your performance', 5, 30);
  
  -- Insert videos for Module 1: Getting Started
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Welcome to Referio',
    'Introduction to the platform and what you''ll learn',
    'https://youtube.com/watch?v=welcome-video',
    'https://example.com/thumbnails/welcome.jpg',
    300, -- 5 minutes
    1,
    'tutorial',
    'youtube',
    'welcome-video'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 1;
  
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Platform Overview',
    'Understanding the main features and navigation',
    'https://youtube.com/watch?v=platform-overview',
    'https://example.com/thumbnails/overview.jpg',
    600, -- 10 minutes
    2,
    'tutorial',
    'youtube',
    'platform-overview'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 1;
  
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Account Setup',
    'Setting up your partner account and profile',
    'https://youtube.com/watch?v=account-setup',
    'https://example.com/thumbnails/setup.jpg',
    900, -- 15 minutes
    3,
    'tutorial',
    'youtube',
    'account-setup'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 1;
  
  -- Insert videos for Module 2: Lead Management
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Creating Your First Lead',
    'Step-by-step guide to creating effective leads',
    'https://youtube.com/watch?v=first-lead',
    'https://example.com/thumbnails/first-lead.jpg',
    1200, -- 20 minutes
    1,
    'tutorial',
    'youtube',
    'first-lead'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 2;
  
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Lead Tracking & Analytics',
    'Monitoring your lead performance and metrics',
    'https://youtube.com/watch?v=lead-tracking',
    'https://example.com/thumbnails/tracking.jpg',
    900, -- 15 minutes
    2,
    'tutorial',
    'youtube',
    'lead-tracking'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 2;
  
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Lead Optimization Strategies',
    'Advanced techniques for improving lead quality',
    'https://youtube.com/watch?v=lead-optimization',
    'https://example.com/thumbnails/optimization.jpg',
    1200, -- 20 minutes
    3,
    'tutorial',
    'youtube',
    'lead-optimization'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 2;
  
  -- Insert videos for Module 3: Order Processing
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Order Lifecycle Overview',
    'Understanding the complete order process',
    'https://youtube.com/watch?v=order-lifecycle',
    'https://example.com/thumbnails/lifecycle.jpg',
    900, -- 15 minutes
    1,
    'tutorial',
    'youtube',
    'order-lifecycle'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 3;
  
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Order Management Best Practices',
    'Tips for efficient order processing',
    'https://youtube.com/watch?v=order-management',
    'https://example.com/thumbnails/management.jpg',
    1200, -- 20 minutes
    2,
    'tutorial',
    'youtube',
    'order-management'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 3;
  
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Customer Communication',
    'Effective communication with customers',
    'https://youtube.com/watch?v=customer-communication',
    'https://example.com/thumbnails/communication.jpg',
    900, -- 15 minutes
    3,
    'tutorial',
    'youtube',
    'customer-communication'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 3;
  
  -- Insert videos for Module 4: Marketing Strategies
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Digital Marketing Fundamentals',
    'Core concepts of digital marketing for affiliates',
    'https://youtube.com/watch?v=digital-marketing',
    'https://example.com/thumbnails/digital-marketing.jpg',
    1200, -- 20 minutes
    1,
    'tutorial',
    'youtube',
    'digital-marketing'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 4;
  
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Social Media Marketing',
    'Leveraging social media for affiliate success',
    'https://youtube.com/watch?v=social-media',
    'https://example.com/thumbnails/social-media.jpg',
    900, -- 15 minutes
    2,
    'tutorial',
    'youtube',
    'social-media'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 4;
  
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Content Marketing Strategies',
    'Creating engaging content to attract customers',
    'https://youtube.com/watch?v=content-marketing',
    'https://example.com/thumbnails/content-marketing.jpg',
    1200, -- 20 minutes
    3,
    'tutorial',
    'youtube',
    'content-marketing'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 4;
  
  -- Insert videos for Module 5: Analytics & Optimization
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Understanding Your Dashboard',
    'Navigating and interpreting your partner dashboard',
    'https://youtube.com/watch?v=dashboard',
    'https://example.com/thumbnails/dashboard.jpg',
    900, -- 15 minutes
    1,
    'tutorial',
    'youtube',
    'dashboard'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 5;
  
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Performance Analytics',
    'Analyzing your performance data for insights',
    'https://youtube.com/watch?v=performance-analytics',
    'https://example.com/thumbnails/analytics.jpg',
    1200, -- 20 minutes
    2,
    'tutorial',
    'youtube',
    'performance-analytics'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 5;
  
  INSERT INTO course_videos (module_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Optimization Techniques',
    'Advanced techniques for improving your results',
    'https://youtube.com/watch?v=optimization',
    'https://example.com/thumbnails/optimization.jpg',
    900, -- 15 minutes
    3,
    'tutorial',
    'youtube',
    'optimization'
  FROM course_modules cm
  WHERE cm.course_id = course_uuid AND cm.order_index = 5;
  
END $$;

-- Create initial course analytics record
INSERT INTO course_analytics (course_id, total_enrollments, completion_rate, average_completion_time, average_rating, engagement_metrics)
SELECT 
  c.id,
  0,
  0.0,
  0,
  0.0,
  '{"total_views": 0, "average_watch_time": 0, "completion_rate": 0.0}'::jsonb
FROM courses c
WHERE c.title = 'Complete Referio Platform Training';

-- Display summary
SELECT 
  'Course System Setup Complete' as status,
  (SELECT COUNT(*) FROM courses) as total_courses,
  (SELECT COUNT(*) FROM course_modules) as total_modules,
  (SELECT COUNT(*) FROM course_videos) as total_videos;
