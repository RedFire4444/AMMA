export interface Course {
  id: string;
  title: string;
  description: string;
  short_description: string;
  thumbnail_url: string | null;
  instructor_name: string;
  total_lessons: number;
  estimated_duration_minutes: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  is_premium: boolean;
  price_cents: number;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  enrollment_count: number;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  audio_url: string | null;
  video_url: string | null;
  duration_minutes: number;
  lesson_number: number;
  lesson_type: 'video' | 'audio' | 'text' | 'exercise';
  is_preview: boolean;
  status: 'draft' | 'published';
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'dropped';
  progress_percentage: number;
  lessons_completed: number;
  total_lessons: number;
  last_lesson_id: string | null;
  enrolled_at: string;
  last_accessed_at: string;
}

export interface CourseReview {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  user_name?: string;
}

export interface CourseFilters {
  category?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  is_premium?: boolean;
  sort?: 'newest' | 'popular' | 'rating';
  search?: string;
  page?: number;
  limit?: number;
}
