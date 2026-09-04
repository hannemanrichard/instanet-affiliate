# Platform Course System Implementation Plan

## Overview

This document outlines a comprehensive plan to implement a platform course system for the Referio affiliate marketing platform. The system will provide educational content to partners through video tutorials, track their progress, and integrate with the existing gamification system to reward learning and completion.

## Course System Features

### 1. Course Management

- **Course Structure**: Organized courses with modules and lessons
- **Video Integration**: Third-party video hosting (Google Drive, Vimeo, YouTube)
- **Progress Tracking**: Detailed progress tracking for each video and course
- **Content Management**: Admin interface for course creation and management

### 2. Video Progress Tracking

- **Playback Tracking**: Track video watch time and completion percentage
- **Milestone Tracking**: Track specific milestones (25%, 50%, 75%, 100%)
- **Engagement Metrics**: Track engagement and interaction with content
- **Resume Functionality**: Allow partners to resume videos where they left off

### 3. Gamification Integration

- **XP Rewards**: Award XP for video completion milestones
- **Badge Rewards**: Award badges for course completion
- **Progress Bars**: Visual progress indicators for courses and modules
- **Achievement System**: Recognize learning achievements and milestones

### 4. Single Course Structure

- **Single Course**: One comprehensive course covering all platform education
- **Module-based**: Organized into modules and videos within the single course
- **Progressive Learning**: Sequential module progression without prerequisites
- **Complete Coverage**: All platform education in one structured course

## Architecture Design

### Feature Structure

```
src/features/courses/
├── domain/
│   ├── entities.ts              # Core course entities
│   ├── valueObjects.ts         # Value objects and enums
│   ├── repositories.ts          # Repository interfaces
│   ├── errors.ts               # Domain-specific errors
│   └── validations.ts          # Validation schemas
├── data/
│   ├── courseService.ts        # Course data operations
│   ├── videoService.ts         # Video data operations
│   ├── progressService.ts      # Progress tracking operations
│   ├── enrollmentService.ts    # Course enrollment operations
│   └── index.ts                # Data layer exports
├── application/
│   ├── services/
│   │   ├── courseApplicationService.ts
│   │   ├── videoApplicationService.ts
│   │   ├── progressApplicationService.ts
│   │   └── enrollmentApplicationService.ts
│   ├── useCourse.ts            # Single course management hook
│   ├── useVideos.ts            # Video management hook
│   ├── useProgress.ts          # Progress tracking hook
│   ├── useEnrollment.ts        # Enrollment management hook
│   └── index.ts                # Application layer exports
├── presentation/
│   ├── components/
│   │   ├── course/
│   │   │   ├── CourseOverview.tsx
│   │   │   ├── CourseProgress.tsx
│   │   │   ├── CourseEnrollment.tsx
│   │   │   └── CourseCompletion.tsx
│   │   ├── videos/
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── VideoProgress.tsx
│   │   │   ├── VideoControls.tsx
│   │   │   └── VideoNotes.tsx
│   │   ├── modules/
│   │   │   ├── ModuleCard.tsx
│   │   │   ├── ModuleList.tsx
│   │   │   ├── ModuleProgress.tsx
│   │   │   └── ModuleNavigation.tsx
│   │   ├── progress/
│   │   │   ├── CourseProgressBar.tsx
│   │   │   ├── ModuleProgressBar.tsx
│   │   │   ├── VideoProgressBar.tsx
│   │   │   └── OverallProgressBar.tsx
│   │   └── admin/
│   │       ├── CourseAdmin.tsx
│   │       ├── VideoAdmin.tsx
│   │       ├── ProgressAdmin.tsx
│   │       └── AnalyticsAdmin.tsx
│   ├── pages/
│   │   ├── CoursePage.tsx
│   │   ├── VideoPage.tsx
│   │   └── AdminCoursePage.tsx
│   └── index.ts                 # Presentation layer exports
└── __tests__/
    ├── data/
    │   ├── courseService.test.ts
    │   ├── videoService.test.ts
    │   ├── progressService.test.ts
    │   └── enrollmentService.test.ts
    ├── application/
    │   ├── courseApplicationService.test.ts
    │   ├── videoApplicationService.test.ts
    │   ├── progressApplicationService.test.ts
    │   └── enrollmentApplicationService.test.ts
    ├── presentation/
    │   ├── useCourse.test.ts
    │   ├── useVideos.test.ts
    │   ├── useProgress.test.ts
    │   └── useEnrollment.test.ts
    └── integration/
        └── courseIntegration.test.ts
```

## Domain Layer Implementation

### Core Entities

```typescript
// src/features/courses/domain/entities.ts

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  instructor_name: string;
  instructor_bio: string;
  instructor_avatar: string;
  duration_minutes: number;
  difficulty: CourseDifficulty;
  category: CourseCategory;
  tags: string[];
  learning_objectives: string[];
  modules: CourseModule[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  videos: CourseVideo[];
  duration_minutes: number;
  is_active: boolean;
}

export interface CourseVideo {
  id: string;
  module_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  order_index: number;
  video_type: VideoType;
  external_provider: VideoProvider;
  external_video_id: string;
  is_active: boolean;
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  partner_id: number;
  course_id: string;
  enrolled_at: string;
  started_at: string;
  completed_at?: string;
  progress_percentage: number;
  status: EnrollmentStatus;
  current_module_id?: string;
  current_video_id?: string;
  last_watched_at: string;
}

export interface VideoProgress {
  id: string;
  partner_id: number;
  video_id: string;
  course_id: string;
  watch_time_seconds: number;
  total_duration_seconds: number;
  completion_percentage: number;
  milestones_reached: VideoMilestone[];
  is_completed: boolean;
  last_watched_at: string;
  created_at: string;
  updated_at: string;
}

export interface VideoMilestone {
  milestone: number; // 25, 50, 75, 100
  reached_at: string;
  xp_awarded: number;
}

export interface CourseProgress {
  id: string;
  partner_id: number;
  course_id: string;
  overall_progress: number;
  modules_completed: number;
  total_modules: number;
  videos_completed: number;
  total_videos: number;
  xp_earned: number;
  badges_earned: string[];
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface CourseCompletion {
  id: string;
  partner_id: number;
  course_id: string;
  completed_at: string;
  completion_percentage: number;
  total_xp_earned: number;
  badges_earned: string[];
  time_spent_minutes: number;
}

export interface CourseAnalytics {
  course_id: string;
  total_enrollments: number;
  completion_rate: number;
  average_completion_time: number;
  average_rating: number;
  most_watched_videos: string[];
  drop_off_points: string[];
  engagement_metrics: EngagementMetrics;
}
```

### Value Objects

```typescript
// src/features/courses/domain/valueObjects.ts

export enum CourseDifficulty {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  EXPERT = "expert",
}

export enum CourseCategory {
  PLATFORM_BASICS = "platform_basics",
  SALES_TECHNIQUES = "sales_techniques",
  MINDSET_DEVELOPMENT = "mindset_development",
  MARKETING_STRATEGIES = "marketing_strategies",
  PRODUCT_KNOWLEDGE = "product_knowledge",
  CUSTOMER_MANAGEMENT = "customer_management",
  ANALYTICS_AND_REPORTING = "analytics_and_reporting",
  BUSINESS_DEVELOPMENT = "business_development",
}

export enum VideoType {
  TUTORIAL = "tutorial",
  LECTURE = "lecture",
  DEMONSTRATION = "demonstration",
  CASE_STUDY = "case_study",
  INTERVIEW = "interview",
  WORKSHOP = "workshop",
}

export enum VideoProvider {
  GOOGLE_DRIVE = "google_drive",
  VIMEO = "vimeo",
  YOUTUBE = "youtube",
  CUSTOM = "custom",
}

export enum EnrollmentStatus {
  ENROLLED = "enrolled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  PAUSED = "paused",
  DROPPED = "dropped",
}

export enum ProgressMilestone {
  STARTED = "started",
  QUARTER = "quarter", // 25%
  HALF = "half", // 50%
  THREE_QUARTERS = "three_quarters", // 75%
  COMPLETED = "completed", // 100%
}

export interface EngagementMetrics {
  average_watch_time: number;
  completion_rate: number;
  rewatch_rate: number;
  notes_taken: number;
  bookmarks_created: number;
  shares_count: number;
}
```

## Data Layer Implementation

### Course Service

```typescript
// src/features/courses/data/courseService.ts

export class SupabaseCourseService implements CourseRepository {
  async getCourse(): Promise<Course | null> {
    // Implementation to get the single course
  }

  async getCourseById(courseId: string): Promise<Course | null> {
    // Implementation with modules and videos
  }

  async getCourseModules(): Promise<CourseModule[]> {
    // Implementation to get all modules of the course
  }

  async updateCourse(courseData: Partial<Course>): Promise<Course> {
    // Implementation to update the course
  }
}
```

### Video Service

```typescript
// src/features/courses/data/videoService.ts

export class SupabaseVideoService implements VideoRepository {
  async getVideoById(videoId: string): Promise<CourseVideo | null> {
    // Implementation following established patterns
  }

  async getVideosByModule(moduleId: string): Promise<CourseVideo[]> {
    // Implementation for module videos
  }

  async getVideoProgress(
    partnerId: number,
    videoId: string
  ): Promise<VideoProgress | null> {
    // Implementation for video progress tracking
  }

  async updateVideoProgress(
    partnerId: number,
    videoId: string,
    watchTimeSeconds: number,
    totalDurationSeconds: number
  ): Promise<VideoProgress> {
    // Implementation for progress updates
  }

  async markVideoMilestone(
    partnerId: number,
    videoId: string,
    milestone: ProgressMilestone
  ): Promise<VideoMilestone> {
    // Implementation for milestone tracking
  }
}
```

### Progress Service

```typescript
// src/features/courses/data/progressService.ts

export class SupabaseProgressService implements ProgressRepository {
  async getCourseProgress(
    partnerId: number,
    courseId: string
  ): Promise<CourseProgress | null> {
    // Implementation following established patterns
  }

  async updateCourseProgress(
    partnerId: number,
    courseId: string
  ): Promise<CourseProgress> {
    // Implementation for course progress calculation
  }

  async getVideoProgress(
    partnerId: number,
    videoId: string
  ): Promise<VideoProgress | null> {
    // Implementation for video progress tracking
  }

  async updateVideoProgress(
    partnerId: number,
    videoId: string,
    progressData: VideoProgressUpdate
  ): Promise<VideoProgress> {
    // Implementation for video progress updates
  }

  async getOverallProgress(partnerId: number): Promise<CourseProgress> {
    // Implementation for overall course progress
  }

  async calculateCourseCompletion(
    partnerId: number,
    courseId: string
  ): Promise<number> {
    // Implementation for completion percentage calculation
  }
}
```

### Enrollment Service

```typescript
// src/features/courses/data/enrollmentService.ts

export class SupabaseEnrollmentService implements EnrollmentRepository {
  async enrollInCourse(
    partnerId: number,
    courseId: string
  ): Promise<CourseEnrollment> {
    // Implementation following established patterns
  }

  async getEnrollment(
    partnerId: number,
    courseId: string
  ): Promise<CourseEnrollment | null> {
    // Implementation for enrollment retrieval
  }

  async getPartnerEnrollments(partnerId: number): Promise<CourseEnrollment[]> {
    // Implementation for partner's enrollments
  }

  async updateEnrollmentProgress(
    partnerId: number,
    courseId: string,
    progressData: EnrollmentUpdate
  ): Promise<CourseEnrollment> {
    // Implementation for enrollment progress updates
  }

  async completeCourse(
    partnerId: number,
    courseId: string
  ): Promise<CourseEnrollment> {
    // Implementation for course completion
  }
}
```

## Application Layer Implementation

### Course Application Service

```typescript
// src/features/courses/application/services/courseApplicationService.ts

export class CourseApplicationService {
  constructor(
    private courseService: CourseRepository,
    private videoService: VideoRepository,
    private progressService: ProgressRepository,
    private enrollmentService: EnrollmentRepository,
    private gamificationService: GamificationRepository
  ) {}

  async enrollInCourse(
    partnerId: number,
    courseId: string
  ): Promise<CourseEnrollment> {
    // Enroll partner in course and initialize progress tracking
  }

  async watchVideo(
    partnerId: number,
    videoId: string,
    watchTimeSeconds: number,
    totalDurationSeconds: number
  ): Promise<VideoProgress> {
    // Update video progress and award XP for milestones
  }

  async completeVideo(
    partnerId: number,
    videoId: string
  ): Promise<VideoProgress> {
    // Mark video as completed and award XP
  }

  async getCourseProgress(
    partnerId: number,
    courseId: string
  ): Promise<CourseProgress> {
    // Get comprehensive course progress data
  }

  async getCourseOverview(partnerId: number): Promise<{
    course: Course;
    enrollment: CourseEnrollment | null;
    progress: CourseProgress | null;
  }> {
    // Get course overview with enrollment and progress
  }
}
```

### React Hooks

```typescript
// src/features/courses/application/useCourse.ts

export const useCourse = (partnerId: number) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Implementation following established hook patterns
};

// src/features/courses/application/useVideoProgress.ts

export const useVideoProgress = (partnerId: number, videoId: string) => {
  const [progress, setProgress] = useState<VideoProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Implementation for video progress tracking
};

// src/features/courses/application/useCourseProgress.ts

export const useCourseProgress = (partnerId: number, courseId: string) => {
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Implementation for course progress tracking
};
```

## Presentation Layer Implementation

### Video Player Component

```typescript
// src/features/courses/presentation/components/videos/VideoPlayer.tsx

interface VideoPlayerProps {
  video: CourseVideo;
  partnerId: number;
  onProgressUpdate: (progress: VideoProgress) => void;
  onMilestoneReached: (milestone: ProgressMilestone) => void;
}

export const VideoPlayer = ({
  video,
  partnerId,
  onProgressUpdate,
  onMilestoneReached
}: VideoPlayerProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState<VideoProgress | null>(null);
  const [milestonesReached, setMilestonesReached] = useState<number[]>([]);

  const { updateVideoProgress } = useVideoProgress(partnerId, video.id);

  const handleTimeUpdate = useCallback(async (time: number) => {
    setCurrentTime(time);

    const completionPercentage = (time / video.duration_seconds) * 100;

    // Update progress in database
    const updatedProgress = await updateVideoProgress({
      watchTimeSeconds: time,
      totalDurationSeconds: video.duration_seconds,
      completionPercentage,
    });

    setProgress(updatedProgress);
    onProgressUpdate(updatedProgress);

    // Check for milestones
    const milestones = [25, 50, 75, 100];
    milestones.forEach(milestone => {
      if (completionPercentage >= milestone && !milestonesReached.includes(milestone)) {
        setMilestonesReached(prev => [...prev, milestone]);
        onMilestoneReached(milestone as ProgressMilestone);
      }
    });
  }, [video.duration_seconds, updateVideoProgress, onProgressUpdate, onMilestoneReached]);

  const renderVideoPlayer = () => {
    switch (video.video_provider) {
      case VideoProvider.YOUTUBE:
        return (
          <YouTubePlayer
            videoId={video.external_video_id}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        );
      case VideoProvider.VIMEO:
        return (
          <VimeoPlayer
            videoId={video.external_video_id}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        );
      case VideoProvider.GOOGLE_DRIVE:
        return (
          <GoogleDrivePlayer
            videoUrl={video.video_url}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        );
      default:
        return <div>Unsupported video provider</div>;
    }
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      {renderVideoPlayer()}
      <VideoProgress
        currentTime={currentTime}
        duration={video.duration_seconds}
        progress={progress}
        milestonesReached={milestonesReached}
      />
    </div>
  );
};
```

### Course Progress Component

```typescript
// src/features/courses/presentation/components/progress/CourseProgressBar.tsx

interface CourseProgressBarProps {
  courseProgress: CourseProgress;
  showDetails?: boolean;
}

export const CourseProgressBar = ({
  courseProgress,
  showDetails = true
}: CourseProgressBarProps) => {
  const completionPercentage = courseProgress.overall_progress;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-900">Course Progress</h3>
        <span className="text-sm font-medium text-blue-600">
          {completionPercentage}% Complete
        </span>
      </div>

      <ProgressBar
        current={completionPercentage}
        target={100}
        variant="success"
        animated={true}
        size="md"
      />

      {showDetails && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {courseProgress.modules_completed}/{courseProgress.total_modules}
            </div>
            <div className="text-sm text-gray-500">Modules</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {courseProgress.videos_completed}/{courseProgress.total_videos}
            </div>
            <div className="text-sm text-gray-500">Videos</div>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">XP Earned:</span>
          <span className="text-sm font-medium text-green-600">
            {courseProgress.xp_earned}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Badges:</span>
          <span className="text-sm font-medium text-purple-600">
            {courseProgress.badges_earned.length}
          </span>
        </div>
      </div>
    </div>
  );
};
```

### Course Overview Component

```typescript
// src/features/courses/presentation/components/course/CourseOverview.tsx

interface CourseOverviewProps {
  course: Course;
  enrollment?: CourseEnrollment;
  progress?: CourseProgress;
  onEnroll: () => void;
  onContinue: () => void;
}

export const CourseOverview = ({
  course,
  enrollment,
  progress,
  onEnroll,
  onContinue
}: CourseOverviewProps) => {
  const isEnrolled = !!enrollment;
  const progressPercentage = progress?.overall_progress || 0;
  const isCompleted = enrollment?.status === EnrollmentStatus.COMPLETED;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          course.difficulty === CourseDifficulty.BEGINNER ? 'bg-green-100 text-green-800' :
          course.difficulty === CourseDifficulty.INTERMEDIATE ? 'bg-yellow-100 text-yellow-800' :
          course.difficulty === CourseDifficulty.ADVANCED ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          {course.difficulty}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900">{course.duration_minutes}</div>
          <div className="text-sm text-gray-500">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900">{course.modules.length}</div>
          <div className="text-sm text-gray-500">Modules</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900">{course.instructor_name}</div>
          <div className="text-sm text-gray-500">Instructor</div>
        </div>
      </div>

      {isEnrolled && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Your Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <ProgressBar
            current={progressPercentage}
            target={100}
            size="lg"
            variant={isCompleted ? 'success' : 'default'}
          />
          {progress && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {progress.modules_completed}/{progress.total_modules}
                </div>
                <div className="text-sm text-gray-500">Modules</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {progress.videos_completed}/{progress.total_videos}
                </div>
                <div className="text-sm text-gray-500">Videos</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {course.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex space-x-3">
          {!isEnrolled && (
            <Button size="lg" onClick={onEnroll}>
              Start Course
            </Button>
          )}
          {isEnrolled && !isCompleted && (
            <Button size="lg" onClick={onContinue}>
              Continue Learning
            </Button>
          )}
          {isCompleted && (
            <Button size="lg" variant="outline" onClick={onContinue}>
              Review Course
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
```

## Database Schema

### Tables Structure

```sql
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

-- Course enrollments
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id INTEGER NOT NULL REFERENCES partners(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'enrolled',
  current_module_id UUID REFERENCES course_modules(id),
  current_video_id UUID REFERENCES course_videos(id),
  last_watched_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(partner_id, course_id)
);

-- Video progress tracking
CREATE TABLE video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id INTEGER NOT NULL REFERENCES partners(id),
  video_id UUID NOT NULL REFERENCES course_videos(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  watch_time_seconds INTEGER DEFAULT 0,
  total_duration_seconds INTEGER NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, video_id)
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
  partner_id INTEGER NOT NULL REFERENCES partners(id),
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
  UNIQUE(partner_id, course_id)
);

-- Course completion records
CREATE TABLE course_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id INTEGER NOT NULL REFERENCES partners(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_percentage INTEGER NOT NULL,
  total_xp_earned INTEGER DEFAULT 0,
  badges_earned TEXT[] DEFAULT '{}',
  time_spent_minutes INTEGER DEFAULT 0,
  UNIQUE(partner_id, course_id)
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
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal**: Set up core course system infrastructure

#### Tasks:

1. **Database Setup**
   - Create course system tables
   - Set up indexes and constraints
   - Create initial course data

2. **Domain Layer**
   - Implement core course entities
   - Define value objects and enums
   - Create repository interfaces
   - Set up validation schemas

3. **Data Layer**
   - Implement course service
   - Implement video service
   - Implement progress service
   - Implement enrollment service
   - Add comprehensive tests

#### Deliverables:

- Complete database schema
- Domain entities and value objects
- Data layer services with tests
- Repository interfaces

### Phase 2: Core Features (Week 3-4)

**Goal**: Implement course management and enrollment

#### Tasks:

1. **Course Management**
   - Single course configuration and editing
   - Module and video management
   - Course content organization
   - Course metadata management

2. **Enrollment System**
   - Course enrollment logic
   - Enrollment status tracking
   - Enrollment analytics

3. **Application Layer**
   - Course application service
   - Enrollment application service
   - React hooks for single course and enrollment
   - Integration with gamification system

#### Deliverables:

- Working single course management system
- Course enrollment functionality
- Application services with tests
- React hooks with tests

### Phase 3: Video Integration (Week 5-6)

**Goal**: Implement video player and progress tracking

#### Tasks:

1. **Video Player Integration**
   - Google Drive video integration
   - Vimeo video integration
   - YouTube video integration
   - Custom video player controls

2. **Progress Tracking**
   - Video progress tracking
   - Milestone detection and XP awarding
   - Resume functionality
   - Progress analytics

3. **Video Features**
   - Video notes and bookmarks
   - Video speed controls
   - Video quality settings
   - Mobile video support

#### Deliverables:

- Working video player system
- Video progress tracking
- Milestone and XP integration
- Video display components

### Phase 4: Progress and Analytics (Week 7-8)

**Goal**: Implement comprehensive progress tracking and analytics

#### Tasks:

1. **Progress Tracking**
   - Course progress calculation
   - Module progress tracking
   - Overall course progress
   - Progress visualization

2. **Analytics System**
   - Course analytics
   - Student progress analytics
   - Engagement metrics
   - Performance insights

3. **Reporting**
   - Progress reports
   - Completion certificates
   - Learning achievements
   - Analytics dashboards

#### Deliverables:

- Complete progress tracking system
- Analytics and reporting features
- Progress visualization components
- Admin analytics dashboard

### Phase 5: Gamification Integration (Week 9-10)

**Goal**: Integrate course system with gamification features

#### Tasks:

1. **XP Integration**
   - Video milestone XP rewards
   - Course completion XP rewards
   - Course completion XP bonuses
   - XP multiplier systems

2. **Badge Integration**
   - Course completion badges
   - Learning milestone badges
   - Special achievement badges
   - Badge progress tracking

3. **Progress Integration**
   - Course progress bars
   - Overall course progress
   - Achievement progress
   - Gamification notifications

#### Deliverables:

- Complete gamification integration
- XP and badge systems
- Progress visualization
- Achievement notifications

### Phase 6: Polish and Optimization (Week 11-12)

**Goal**: Polish user experience and optimize performance

#### Tasks:

1. **User Experience**
   - Course overview and navigation
   - Course completion celebration
   - Mobile optimization
   - Accessibility improvements

2. **Performance Optimization**
   - Video loading optimization
   - Progress tracking optimization
   - Database query optimization
   - Caching implementation

3. **Testing and Documentation**
   - Integration tests
   - End-to-end tests
   - Performance tests
   - Documentation updates

#### Deliverables:

- Polished user interface
- Optimized performance
- Comprehensive test coverage
- Complete documentation

## Video Provider Integration

### Google Drive Integration

```typescript
// src/features/courses/presentation/components/videos/GoogleDrivePlayer.tsx

interface GoogleDrivePlayerProps {
  videoUrl: string;
  onTimeUpdate: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
}

export const GoogleDrivePlayer = ({
  videoUrl,
  onTimeUpdate,
  onPlay,
  onPause,
}: GoogleDrivePlayerProps) => {
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    // Initialize Google Drive video player
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onload = () => {
      // Configure Google Drive player
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [videoUrl]);

  // Implementation for Google Drive video playback
};
```

### Vimeo Integration

```typescript
// src/features/courses/presentation/components/videos/VimeoPlayer.tsx

interface VimeoPlayerProps {
  videoId: string;
  onTimeUpdate: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
}

export const VimeoPlayer = ({
  videoId,
  onTimeUpdate,
  onPlay,
  onPause,
}: VimeoPlayerProps) => {
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    // Initialize Vimeo player
    const script = document.createElement("script");
    script.src = "https://player.vimeo.com/api/player.js";
    script.onload = () => {
      // Configure Vimeo player
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [videoId]);

  // Implementation for Vimeo video playback
};
```

### YouTube Integration

```typescript
// src/features/courses/presentation/components/videos/YouTubePlayer.tsx

interface YouTubePlayerProps {
  videoId: string;
  onTimeUpdate: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
}

export const YouTubePlayer = ({
  videoId,
  onTimeUpdate,
  onPlay,
  onPause,
}: YouTubePlayerProps) => {
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    // Initialize YouTube player
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onload = () => {
      // Configure YouTube player
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [videoId]);

  // Implementation for YouTube video playback
};
```

## Gamification Integration

### XP Rewards System

```typescript
// XP rewards for video milestones
const XP_REWARDS = {
  [ProgressMilestone.QUARTER]: 10, // 25% completion
  [ProgressMilestone.HALF]: 15, // 50% completion
  [ProgressMilestone.THREE_QUARTERS]: 20, // 75% completion
  [ProgressMilestone.COMPLETED]: 50, // 100% completion
};

// XP rewards for course completion
const COURSE_XP_REWARDS = {
  [CourseDifficulty.BEGINNER]: 100,
  [CourseDifficulty.INTERMEDIATE]: 200,
  [CourseDifficulty.ADVANCED]: 300,
  [CourseDifficulty.EXPERT]: 500,
};
```

### Badge Integration

```typescript
// Badges for course completion
const COURSE_BADGES = {
  FIRST_COURSE: {
    id: "first_course",
    name: "First Steps",
    description: "Complete your first course",
    xp_reward: 100,
  },
  COURSE_MASTER: {
    id: "course_master",
    name: "Course Master",
    description: "Complete 10 courses",
    xp_reward: 500,
  },
  LEARNING_CHAMPION: {
    id: "learning_champion",
    name: "Learning Champion",
    description: "Complete all courses in a category",
    xp_reward: 1000,
  },
};
```

## Testing Strategy

### Test Coverage Requirements

- **Unit Tests**: 90%+ coverage for all services and hooks
- **Integration Tests**: All cross-feature interactions
- **E2E Tests**: Complete user journeys
- **Performance Tests**: Video loading and progress tracking

### Test Patterns

Following established patterns from existing features:

```typescript
// Data Layer Tests
describe("SupabaseCourseService", () => {
  beforeEach(() => {
    // Mock DatabaseWrapper and withPerformanceTracking
    mockDatabaseWrapper.executeQuery.mockImplementation(async (queryFn) => {
      const result = await queryFn();
      return result.data;
    });

    mockWithPerformanceTracking.mockImplementation(
      async (service, method, fn) => {
        return await fn();
      }
    );
  });

  it("should get course by id successfully", async () => {
    // Test implementation following established patterns
  });
});

// Application Layer Tests
describe("CourseApplicationService", () => {
  it("should enroll partner in course", async () => {
    // Test with proper mocking
  });
});

// React Hook Tests
describe("useCourses", () => {
  it("should return courses data", async () => {
    // Test with useAsyncOperation mocking
  });
});
```

## Performance Considerations

### Video Optimization

- **Lazy Loading**: Load videos only when needed
- **Progressive Loading**: Load video quality based on connection
- **Caching**: Cache video metadata and progress
- **CDN Integration**: Use CDN for video delivery

### Database Optimization

- **Indexes**: Strategic indexes on frequently queried columns
- **Partitioning**: Partition large tables by date ranges
- **Caching**: Redis cache for course data and progress
- **Query Optimization**: Optimize complex progress calculations

### Application Optimization

- **Memoization**: Cache course calculations
- **Debounced Updates**: Prevent excessive progress updates
- **Background Processing**: Process analytics in background
- **Efficient State Management**: Optimize React state updates

## Security Considerations

### Content Protection

- **Video Access Control**: Restrict video access to enrolled users
- **Progress Validation**: Validate progress updates on server
- **Rate Limiting**: Prevent progress manipulation
- **Audit Logging**: Track all course activities

### Data Protection

- **Input Validation**: Validate all course inputs
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Protection**: Sanitize user-generated content
- **CSRF Protection**: Implement CSRF tokens

## Analytics and Reporting

### Course Analytics

- **Enrollment Metrics**: Track course enrollment rates
- **Completion Rates**: Measure course completion rates
- **Engagement Metrics**: Track video engagement
- **Drop-off Analysis**: Identify where students drop off

### Student Analytics

- **Progress Tracking**: Track individual student progress
- **Learning Patterns**: Analyze learning behaviors
- **Performance Insights**: Provide performance feedback
- **Completion Analysis**: Track course completion patterns

## Mobile Considerations

### Responsive Design

- **Mobile Video Player**: Optimized mobile video experience
- **Touch Controls**: Touch-friendly video controls
- **Offline Support**: Basic offline functionality
- **Performance**: Optimized for mobile devices

### Mobile Features

- **Download for Offline**: Allow video downloads
- **Mobile Notifications**: Push notifications for course updates
- **Mobile Progress**: Optimized progress tracking
- **Mobile Analytics**: Mobile-specific analytics

## Conclusion

This comprehensive platform course system implementation plan provides a structured approach to adding educational content to the Referio platform. By following the established architecture patterns and implementing in phases, we can create a robust, scalable, and maintainable course system that enhances partner education and engagement.

The plan emphasizes:

- **Clean Architecture**: Following established domain-driven design patterns
- **Comprehensive Testing**: Following proven testing patterns from existing features
- **Performance Optimization**: Ensuring scalability and performance
- **Security**: Implementing proper security measures
- **User Experience**: Creating engaging and intuitive interfaces
- **Gamification Integration**: Seamless integration with existing gamification features

This implementation will significantly enhance partner education and drive platform engagement while maintaining the high code quality standards established in the project.
