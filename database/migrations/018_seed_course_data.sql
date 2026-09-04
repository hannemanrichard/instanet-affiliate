-- Migration: Seed Initial Course Data
-- Purpose: Create initial course data for the platform
-- Date: 2024-01-XX
-- Description: Inserts sample course data for testing and demonstration

-- Insert main platform course
INSERT INTO courses (
  id,
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
  prerequisites,
  learning_objectives,
  is_active,
  is_featured
) VALUES (
  gen_random_uuid(),
  'Complete Referio Platform Guide',
  'Master the Referio affiliate marketing platform with this comprehensive course covering everything from account setup to advanced strategies.',
  'https://example.com/course-thumbnail.jpg',
  'Referio Team',
  'Expert team with years of experience in affiliate marketing and platform development.',
  'https://example.com/instructor-avatar.jpg',
  180,
  'beginner',
  'platform_training',
  ARRAY['affiliate_marketing', 'platform_training', 'beginner_guide'],
  ARRAY[],
  ARRAY[
    'Understand the Referio platform structure',
    'Learn how to create and manage orders',
    'Master commission tracking and withdrawals',
    'Develop effective affiliate marketing strategies',
    'Optimize your earning potential'
  ],
  true,
  true
);

-- Get the course ID for modules
DO $$
DECLARE
  course_uuid UUID;
BEGIN
  SELECT id INTO course_uuid FROM courses WHERE title = 'Complete Referio Platform Guide';
  
  -- Insert course modules
  INSERT INTO course_modules (course_id, title, description, order_index, duration_minutes) VALUES
  (course_uuid, 'Getting Started', 'Introduction to the Referio platform and basic setup', 1, 30),
  (course_uuid, 'Account Management', 'Learn how to manage your affiliate account and profile', 2, 25),
  (course_uuid, 'Order Management', 'Master the order creation and management process', 3, 45),
  (course_uuid, 'Commission Tracking', 'Understand how commissions work and track your earnings', 4, 35),
  (course_uuid, 'Withdrawal Process', 'Learn how to request and manage withdrawals', 5, 20),
  (course_uuid, 'Advanced Strategies', 'Advanced tips and strategies to maximize your earnings', 6, 25);
  
  -- Insert course videos for each module
  -- Module 1: Getting Started
  INSERT INTO course_videos (module_id, title, description, video_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Welcome to Referio',
    'Introduction to the platform and what you will learn',
    'https://drive.google.com/file/d/1abc123/view',
    600,
    1,
    'tutorial',
    'google_drive',
    '1abc123'
  FROM course_modules cm 
  WHERE cm.course_id = course_uuid AND cm.order_index = 1;
  
  INSERT INTO course_videos (module_id, title, description, video_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Platform Overview',
    'Understanding the platform structure and navigation',
    'https://drive.google.com/file/d/1def456/view',
    900,
    2,
    'tutorial',
    'google_drive',
    '1def456'
  FROM course_modules cm 
  WHERE cm.course_id = course_uuid AND cm.order_index = 1;
  
  -- Module 2: Account Management
  INSERT INTO course_videos (module_id, title, description, video_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Profile Setup',
    'Setting up your affiliate profile and personal information',
    'https://drive.google.com/file/d/1ghi789/view',
    750,
    1,
    'tutorial',
    'google_drive',
    '1ghi789'
  FROM course_modules cm 
  WHERE cm.course_id = course_uuid AND cm.order_index = 2;
  
  INSERT INTO course_videos (module_id, title, description, video_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Account Settings',
    'Managing your account settings and preferences',
    'https://drive.google.com/file/d/1jkl012/view',
    750,
    2,
    'tutorial',
    'google_drive',
    '1jkl012'
  FROM course_modules cm 
  WHERE cm.course_id = course_uuid AND cm.order_index = 2;
  
  -- Module 3: Order Management
  INSERT INTO course_videos (module_id, title, description, video_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Creating Orders',
    'Step-by-step guide to creating orders for customers',
    'https://drive.google.com/file/d/1mno345/view',
    1200,
    1,
    'tutorial',
    'google_drive',
    '1mno345'
  FROM course_modules cm 
  WHERE cm.course_id = course_uuid AND cm.order_index = 3;
  
  INSERT INTO course_videos (module_id, title, description, video_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Order Tracking',
    'How to track order status and delivery',
    'https://drive.google.com/file/d/1pqr678/view',
    900,
    2,
    'tutorial',
    'google_drive',
    '1pqr678'
  FROM course_modules cm 
  WHERE cm.course_id = course_uuid AND cm.order_index = 3;
  
  INSERT INTO course_videos (module_id, title, description, video_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Order Management Best Practices',
    'Tips and best practices for efficient order management',
    'https://drive.google.com/file/d/1stu901/view',
    900,
    3,
    'tutorial',
    'google_drive',
    '1stu901'
  FROM course_modules cm 
  WHERE cm.course_id = course_uuid AND cm.order_index = 3;
  
  -- Module 4: Commission Tracking
  INSERT INTO course_videos (module_id, title, description, video_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Understanding Commissions',
    'How commissions are calculated and tracked',
    'https://drive.google.com/file/d/1vwx234/view',
    1050,
    1,
    'tutorial',
    'google_drive',
    '1vwx234'
  FROM course_modules cm 
  WHERE cm.course_id = course_uuid AND cm.order_index = 4;
  
  INSERT INTO course_videos (module_id, title, description, video_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Commission Reports',
    'How to view and understand your commission reports',
    'https://drive.google.com/file/d/1yza567/view',
    1050,
    2,
    'tutorial',
    'google_drive',
    '1yza567'
  FROM course_modules cm 
  WHERE cm.course_id = course_uuid AND cm.order_index = 4;
  
  -- Module 5: Withdrawal Process
  INSERT INTO course_videos (module_id, title, description, video_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Requesting Withdrawals',
    'How to request withdrawals and payment methods',
    'https://drive.google.com/file/d/1bcd890/view',
    600,
    1,
    'tutorial',
    'google_drive',
    '1bcd890'
  FROM course_modules cm 
  WHERE cm.course_id = course_uuid AND cm.order_index = 5;
  
  INSERT INTO course_videos (module_id, title, description, video_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Withdrawal Tracking',
    'Tracking withdrawal status and processing times',
    'https://drive.google.com/file/d/1efg123/view',
    600,
    2,
    'tutorial',
    'google_drive',
    '1efg123'
  FROM course_modules cm 
  WHERE cm.course_id = course_uuid AND cm.order_index = 5;
  
  -- Module 6: Advanced Strategies
  INSERT INTO course_videos (module_id, title, description, video_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Marketing Strategies',
    'Advanced marketing strategies to increase your sales',
    'https://drive.google.com/file/d/1hij456/view',
    900,
    1,
    'tutorial',
    'google_drive',
    '1hij456'
  FROM course_modules cm 
  WHERE cm.course_id = course_uuid AND cm.order_index = 6;
  
  INSERT INTO course_videos (module_id, title, description, video_url, duration_seconds, order_index, video_type, external_provider, external_video_id)
  SELECT 
    cm.id,
    'Customer Retention',
    'Building long-term customer relationships',
    'https://drive.google.com/file/d/1klm789/view',
    600,
    2,
    'tutorial',
    'google_drive',
    '1klm789'
  FROM course_modules cm 
  WHERE cm.course_id = course_uuid AND cm.order_index = 6;
  
END $$;
