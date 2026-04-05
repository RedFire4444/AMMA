import { supabase } from './supabase';

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
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .in('status', ['upcoming', 'live'])
      .order('event_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getEvent(eventId: string): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return data;
  },

  async registerForEvent(eventId: string): Promise<EventRegistration> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('event_registrations')
      .upsert(
        { event_id: eventId, user_id: user.id, status: 'registered' },
        { onConflict: 'event_id,user_id' },
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async isRegistered(eventId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();

    return !!data;
  },

  async getStreamUrl(eventId: string): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check registration
    const registered = await this.isRegistered(eventId);
    if (!registered) throw new Error('Must be registered to access stream');

    const { data, error } = await supabase
      .from('events')
      .select('stream_url')
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return data?.stream_url || null;
  },
};
