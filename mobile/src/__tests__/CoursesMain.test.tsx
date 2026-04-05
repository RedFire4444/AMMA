import React from 'react';
import { render } from '@testing-library/react-native';
import CoursesMain from '../screens/CoursesMain';

// Mock the courses service so the component doesn't make real API calls
jest.mock('../services/courses.service', () => ({
  coursesService: {
    getCourses: jest.fn().mockResolvedValue([]),
  },
}));

describe('CoursesMain', () => {
  it('renders "Courses" heading', () => {
    const { getByText } = render(<CoursesMain />);
    expect(getByText('Courses')).toBeTruthy();
  });

  it('renders search bar placeholder text', () => {
    const { getByPlaceholderText } = render(<CoursesMain />);
    expect(getByPlaceholderText('Search courses...')).toBeTruthy();
  });

  it('renders difficulty filter pills', () => {
    const { getAllByText, getByText } = render(<CoursesMain />);
    expect(getAllByText('All').length).toBeGreaterThanOrEqual(1);
    expect(getByText('Beginner')).toBeTruthy();
    expect(getByText('Intermediate')).toBeTruthy();
    expect(getByText('Advanced')).toBeTruthy();
  });

  it('renders category filter pills', () => {
    const { getByText } = render(<CoursesMain />);
    expect(getByText('Meditation')).toBeTruthy();
    expect(getByText('Yoga')).toBeTruthy();
    expect(getByText('Pranayama')).toBeTruthy();
    expect(getByText('Mindfulness')).toBeTruthy();
    expect(getByText('Sleep')).toBeTruthy();
    expect(getByText('Stress')).toBeTruthy();
  });
});
