import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CourseCard } from '../components/course/CourseCard';
import { Course } from '../types/course.types';

const mockCourse: Course = {
  id: 'course-1',
  title: 'Introduction to Pranayama',
  description: 'Learn the fundamentals of pranayama breathing techniques.',
  short_description: 'Breathing basics',
  thumbnail_url: null,
  instructor_name: 'Swami Vivekananda',
  total_lessons: 8,
  estimated_duration_minutes: 90,
  difficulty_level: 'beginner',
  category: 'Pranayama',
  tags: ['breathing', 'beginner'],
  is_premium: false,
  price_cents: 0,
  status: 'published',
  is_featured: false,
  enrollment_count: 150,
};

describe('CourseCard', () => {
  it('renders course title', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <CourseCard course={mockCourse} onPress={onPress} />,
    );
    expect(getByText('Introduction to Pranayama')).toBeTruthy();
  });

  it('renders instructor name', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <CourseCard course={mockCourse} onPress={onPress} />,
    );
    expect(getByText('Swami Vivekananda')).toBeTruthy();
  });

  it('renders difficulty level badge', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <CourseCard course={mockCourse} onPress={onPress} />,
    );
    expect(getByText('beginner')).toBeTruthy();
  });

  it('renders lesson count', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <CourseCard course={mockCourse} onPress={onPress} />,
    );
    expect(getByText('8 lessons')).toBeTruthy();
  });

  it('renders category name', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <CourseCard course={mockCourse} onPress={onPress} />,
    );
    expect(getByText('Pranayama')).toBeTruthy();
  });

  it('calls onPress with courseId when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <CourseCard course={mockCourse} onPress={onPress} />,
    );
    fireEvent.press(getByText('Introduction to Pranayama'));
    expect(onPress).toHaveBeenCalledWith('course-1');
  });

  it('renders "FREE" badge when course is not premium', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <CourseCard course={mockCourse} onPress={onPress} />,
    );
    expect(getByText('FREE')).toBeTruthy();
  });

  it('renders "PREMIUM" badge when course is premium', () => {
    const onPress = jest.fn();
    const premiumCourse: Course = { ...mockCourse, is_premium: true };
    const { getByText } = render(
      <CourseCard course={premiumCourse} onPress={onPress} />,
    );
    expect(getByText('PREMIUM')).toBeTruthy();
  });
});
