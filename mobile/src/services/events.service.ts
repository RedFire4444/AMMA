import { get, post } from './api';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  instructor_name: string;
  instructor_avatar_url: string | null;
  event_date: string;
  duration_minutes: number;
  timezone: string;
  thumbnail_url: string | null;
  stream_url: string | null;
  recording_url: string | null;
  category: string;
  is_live: boolean;
  is_premium: boolean;
  max_participants: number | null;
  registration_count: number;
  status: string;
  viewer_count?: number;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  registered_at: string;
}

export const eventsService = {
  async listEvents(): Promise<Event[]> {
    const data = await get<any>('/events');
    return data || [];
  },

  async getEvent(eventId: string): Promise<Event> {
    return get<Event>(`/events/${eventId}`);
  },

  async registerForEvent(eventId: string): Promise<EventRegistration> {
    return post<EventRegistration>(`/events/${eventId}/register`);
  },

  async isRegistered(eventId: string): Promise<boolean> {
    try {
      // In a strict REST architecture, fetching the event stream or checking registration
      // is usually verified on access. We fallback to querying events to see if we're registered.
      const eventWithReg = await get<any>(`/events/${eventId}`);
      // Usually backend attaches enrollment or registration status
      return !!eventWithReg?.registration || !!eventWithReg?.is_registered;
    } catch {
      return false;
    }
  },

  async getStreamUrl(eventId: string): Promise<string | null> {
    const data = await get<any>(`/events/${eventId}/stream`);
    return data?.stream_url || null;
  },
};
