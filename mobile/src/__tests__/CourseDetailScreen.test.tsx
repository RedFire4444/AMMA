import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import CourseDetailScreen from '../screens/CourseDetailScreen';

// Override useRoute to provide courseId param
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { courseId: 'test-course-123' },
  }),
}));

jest.mock('../services/courses.service', () => ({
  coursesService: {
    getCourseById: jest.fn().mockResolvedValue({
      course: {
        id: 'test-course-123',
        title: 'Beginner Meditation',
        description: 'A course for beginners.',
        short_description: 'Start your journey',
        thumbnail_url: null,
        instructor_name: 'Guruji',
        total_lessons: 5,
        estimated_duration_minutes: 120,
        difficulty_level: 'beginner',
        category: 'Meditation',
        tags: ['focus', 'calm'],
        is_premium: false,
        price_cents: 0,
        status: 'published',
        is_featured: false,
        enrollment_count: 42,
      },
      lessons: [],
    }),
    getEnrollment: jest.fn().mockResolvedValue(null),
    getReviews: jest.fn().mockResolvedValue([]),
  },
}));

describe('CourseDetailScreen', () => {
  it('renders loading indicator initially', () => {
    const { getByText } = render(<CourseDetailScreen />);
    expect(getByText('Loading course...')).toBeTruthy();
  });

  it('shows "Enroll Now" button after data loads', async () => {
    const { getByText } = render(<CourseDetailScreen />);
    await waitFor(() => {
      expect(getByText('Enroll Now')).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);

  it('renders course title after loading', async () => {
    const { getByText } = render(<CourseDetailScreen />);
    await waitFor(() => {
      expect(getByText('Beginner Meditation')).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);

  it('renders "Course Details" header after loading', async () => {
    const { getByText } = render(<CourseDetailScreen />);
    await waitFor(() => {
      expect(getByText('Course Details')).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);
});
