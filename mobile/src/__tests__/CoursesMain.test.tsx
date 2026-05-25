import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import CoursesMain from '../screens/CoursesMain';

const openURLMock = jest
  .spyOn(Linking, 'openURL')
  .mockImplementation(jest.fn().mockResolvedValue(undefined));

describe('CoursesMain', () => {
  it('renders "Courses" heading', () => {
    const { getByText } = render(<CoursesMain />);
    expect(getByText('Courses')).toBeTruthy();
  });

  it('renders the meditation course card', () => {
    const { getByText } = render(<CoursesMain />);
    expect(getByText('Meditation Course')).toBeTruthy();
  });

  it('does not render subsection filter pills', () => {
    const { queryByText } = render(<CoursesMain />);
    expect(queryByText('All')).toBeNull();
    expect(queryByText('Beginner')).toBeNull();
    expect(queryByText('Intermediate')).toBeNull();
    expect(queryByText('Advanced')).toBeNull();
  });

  it('opens the Amma meditation course link when pressed', () => {
    const { getByText } = render(<CoursesMain />);
    fireEvent.press(getByText('Meditation Course'));
    expect(openURLMock).toHaveBeenCalledWith(
      'https://na.amma.org/meeting-amma/guides/meditation-course',
    );
  });
});
