import { get, post, patch } from './api';
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
    const data = await get<any>('/courses', { params: { ...filters, limit: filters.limit || PAGE_SIZE } });
    return data?.results || data || [];
  },

  async getCourseById(
    id: string,
  ): Promise<{ course: Course; lessons: Lesson[] }> {
    return get<{ course: Course; lessons: Lesson[] }>(`/courses/${id}`);
  },

  async getEnrollment(courseId: string): Promise<Enrollment | null> {
    try {
      // Backend's /courses/:id returns the enrollment record alongside the course.
      const response = await get<{ enrollment?: Enrollment }>(`/courses/${courseId}`);
      return response.enrollment ?? null;
    } catch {
      return null;
    }
  },

  async enrollInCourse(courseId: string): Promise<Enrollment> {
    return post<Enrollment>(`/courses/${courseId}/enroll`);
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
    await patch(`/courses/enrollments/${enrollmentId}/progress`, data);
  },

  async getReviews(courseId: string): Promise<CourseReview[]> {
    const data = await get<any>(`/courses/${courseId}/reviews`);
    return data || [];
  },

  async submitReview(
    courseId: string,
    rating: number,
    reviewText: string,
  ): Promise<void> {
    await post(`/courses/${courseId}/reviews`, { rating, review_text: reviewText });
  },

  async getLessonById(lessonId: string, courseId: string): Promise<Lesson> {
    // Optimization: Lessons are always part of a Course detail.
    // We fetch the course and extract the specific lesson to ensure data consistency.
    const { lessons } = await this.getCourseById(courseId);
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');
    return lesson;
  },
};
