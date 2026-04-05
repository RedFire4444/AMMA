import { supabase } from './supabase';
import {
  Course,
  Lesson,
  Enrollment,
  CourseReview,
  CourseFilters,
} from '../types/course.types';

const PAGE_SIZE = 10;

export const coursesService = {
  async getCourses(filters: CourseFilters = {}): Promise<Course[]> {
    const {
      category,
      difficulty_level,
      is_premium,
      sort = 'popular',
      search,
      page = 0,
      limit = PAGE_SIZE,
    } = filters;

    let query = supabase
      .from('courses')
      .select(
        'id, title, description, short_description, thumbnail_url, instructor_name, total_lessons, estimated_duration_minutes, difficulty_level, category, tags, is_premium, price_cents, status, is_featured, enrollment_count',
      )
      .eq('status', 'published');

    if (category) {
      query = query.eq('category', category);
    }

    if (difficulty_level) {
      query = query.eq('difficulty_level', difficulty_level);
    }

    if (is_premium !== undefined) {
      query = query.eq('is_premium', is_premium);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'rating':
        query = query.order('is_featured', { ascending: false });
        break;
      case 'popular':
      default:
        query = query.order('enrollment_count', { ascending: false });
        break;
    }

    query = query.range(page * limit, (page + 1) * limit - 1);

    const { data, error } = await query;
    if (error) throw error;
    return (data as Course[]) || [];
  },

  async getCourseById(
    id: string,
  ): Promise<{ course: Course; lessons: Lesson[] }> {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(
        'id, title, description, short_description, thumbnail_url, instructor_name, total_lessons, estimated_duration_minutes, difficulty_level, category, tags, is_premium, price_cents, status, is_featured, enrollment_count',
      )
      .eq('id', id)
      .single();

    if (courseError) throw courseError;

    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(
        'id, course_id, title, description, audio_url, video_url, duration_minutes, lesson_number, lesson_type, is_preview, status',
      )
      .eq('course_id', id)
      .eq('status', 'published')
      .order('lesson_number', { ascending: true });

    if (lessonsError) throw lessonsError;

    return {
      course: course as Course,
      lessons: (lessons as Lesson[]) || [],
    };
  },

  async getEnrollment(courseId: string): Promise<Enrollment | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('enrollments')
      .select(
        'id, user_id, course_id, status, progress_percentage, lessons_completed, total_lessons, last_lesson_id, enrolled_at, last_accessed_at',
      )
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as Enrollment) || null;
  },

  async enrollInCourse(courseId: string): Promise<Enrollment> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get course total lessons
    const { data: course } = await supabase
      .from('courses')
      .select('total_lessons')
      .eq('id', courseId)
      .single();

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        status: 'active',
        progress_percentage: 0,
        lessons_completed: 0,
        total_lessons: course?.total_lessons ?? 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Increment enrollment_count on the course
    await supabase.rpc('increment_enrollment_count', {
      p_course_id: courseId,
    });

    return enrollment as Enrollment;
  },

  async updateProgress(
    enrollmentId: string,
    data: {
      lessons_completed: number;
      progress_percentage: number;
      last_lesson_id: string;
      status?: 'active' | 'completed' | 'dropped';
    },
  ): Promise<void> {
    const { error } = await supabase
      .from('enrollments')
      .update({
        lessons_completed: data.lessons_completed,
        progress_percentage: data.progress_percentage,
        last_lesson_id: data.last_lesson_id,
        last_accessed_at: new Date().toISOString(),
        ...(data.status ? { status: data.status } : {}),
      })
      .eq('id', enrollmentId);

    if (error) throw error;
  },

  async getReviews(courseId: string): Promise<CourseReview[]> {
    const { data, error } = await supabase
      .from('course_reviews')
      .select('id, user_id, course_id, rating, review_text, created_at')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as CourseReview[]) || [];
  },

  async submitReview(
    courseId: string,
    rating: number,
    reviewText: string,
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('course_reviews').insert({
      user_id: user.id,
      course_id: courseId,
      rating,
      review_text: reviewText,
    });

    if (error) throw error;
  },

  async getLessonById(lessonId: string): Promise<Lesson> {
    const { data, error } = await supabase
      .from('lessons')
      .select(
        'id, course_id, title, description, audio_url, video_url, duration_minutes, lesson_number, lesson_type, is_preview, status',
      )
      .eq('id', lessonId)
      .single();

    if (error) throw error;
    return data as Lesson;
  },
};
