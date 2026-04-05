import React from 'react';
import { render } from '@testing-library/react-native';
import DirectoryMain from '../screens/DirectoryMain';

// Mock the directory service
jest.mock('../services/directory.service', () => ({
  directoryService: {
    browseDirectory: jest.fn().mockResolvedValue([]),
    getBookmarks: jest.fn().mockResolvedValue([]),
    bookmarkContent: jest.fn().mockResolvedValue({}),
    removeBookmark: jest.fn().mockResolvedValue({}),
    trackView: jest.fn().mockResolvedValue({}),
  },
}));

// Mock child components that depend on external modules
jest.mock('../components/directory/ContentCard', () => ({
  ContentCard: () => null,
}));

jest.mock('../components/directory/MiniPlayer', () => ({
  MiniPlayer: () => null,
}));

describe('DirectoryMain', () => {
  it('renders search bar with placeholder text', () => {
    const { getByPlaceholderText } = render(<DirectoryMain />);
    expect(getByPlaceholderText('Search teachings, bhajans...')).toBeTruthy();
  });

  it('renders "All" category tab', () => {
    const { getByText } = render(<DirectoryMain />);
    expect(getByText('All')).toBeTruthy();
  });

  it('renders "Bhajans" category tab', () => {
    const { getByText } = render(<DirectoryMain />);
    expect(getByText('Bhajans')).toBeTruthy();
  });

  it('renders "Meditations" category tab', () => {
    const { getByText } = render(<DirectoryMain />);
    expect(getByText('Meditations')).toBeTruthy();
  });

  it('renders "Satsangs" category tab', () => {
    const { getByText } = render(<DirectoryMain />);
    expect(getByText('Satsangs')).toBeTruthy();
  });

  it('renders all category tabs', () => {
    const { getByText } = render(<DirectoryMain />);
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Bhajans')).toBeTruthy();
    expect(getByText('Meditations')).toBeTruthy();
    expect(getByText('Satsangs')).toBeTruthy();
    expect(getByText('Discourses')).toBeTruthy();
    expect(getByText('Chanting')).toBeTruthy();
  });
});
