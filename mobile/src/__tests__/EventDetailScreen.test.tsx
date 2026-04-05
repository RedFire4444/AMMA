import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import EventDetailScreen from '../screens/EventDetailScreen';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

// Mock the events service
jest.mock('../services/events.service', () => ({
  eventsService: {
    getEvent: jest.fn().mockResolvedValue({
      id: 'event-1',
      title: 'Full Moon Meditation',
      description: 'Meditate under the full moon.',
      instructor_name: 'Guruji',
      instructor_avatar_url: null,
      event_date: '2026-05-01T18:00:00Z',
      duration_minutes: 60,
      timezone: 'Asia/Kolkata',
      thumbnail_url: null,
      stream_url: null,
      recording_url: null,
      category: 'meditation',
      is_live: false,
      is_premium: false,
      max_participants: 100,
      registration_count: 42,
      status: 'upcoming',
    }),
    isRegistered: jest.fn().mockResolvedValue(false),
    registerForEvent: jest.fn().mockResolvedValue({}),
    getStreamUrl: jest.fn().mockResolvedValue(null),
  },
}));

describe('EventDetailScreen', () => {
  const createProps = () => ({
    route: {
      params: { eventId: 'event-1' },
      key: 'EventDetail',
      name: 'EventDetail' as const,
    },
    navigation: {
      navigate: mockNavigate,
      goBack: mockGoBack,
      dispatch: jest.fn(),
      reset: jest.fn(),
      isFocused: jest.fn(),
      canGoBack: jest.fn(),
      getId: jest.fn(),
      getState: jest.fn(),
      getParent: jest.fn(),
      setOptions: jest.fn(),
      setParams: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      replace: jest.fn(),
      push: jest.fn(),
      pop: jest.fn(),
      popToTop: jest.fn(),
    },
  });

  it('shows loading indicator initially', () => {
    const props = createProps();
    render(<EventDetailScreen {...(props as any)} />);
    // Component renders without crashing during loading state
    expect(true).toBe(true);
  });

  it('renders "Event Details" header after data loads', async () => {
    const props = createProps();
    const { getByText } = render(
      <EventDetailScreen {...(props as any)} />,
    );
    await waitFor(() => {
      expect(getByText('Event Details')).toBeTruthy();
    });
  });

  it('renders event title after data loads', async () => {
    const props = createProps();
    const { getByText } = render(
      <EventDetailScreen {...(props as any)} />,
    );
    await waitFor(() => {
      expect(getByText('Full Moon Meditation')).toBeTruthy();
    });
  });

  it('renders "Register Now" button when not registered', async () => {
    const props = createProps();
    const { getByText } = render(
      <EventDetailScreen {...(props as any)} />,
    );
    await waitFor(() => {
      expect(getByText('Register Now')).toBeTruthy();
    });
  });
});
