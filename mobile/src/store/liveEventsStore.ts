import { create } from 'zustand';
import { Event, eventsService } from '../services/events.service';

interface LiveEventsState {
  liveEvents: Event[];
  upcomingEvents: Event[];
  isLoading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  toggleReminder: (eventId: string, isRegistered: boolean) => Promise<void>;
}

export const useLiveEventsStore = create<LiveEventsState>((set, get) => ({
  liveEvents: [],
  upcomingEvents: [],
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const [live, upcoming] = await Promise.all([
        eventsService.getLiveEvents(),
        eventsService.getUpcomingEvents()
      ]);
      set({ liveEvents: live, upcomingEvents: upcoming, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch events', isLoading: false });
    }
  },

  toggleReminder: async (eventId: string, isRegistered: boolean) => {
    try {
      if (isRegistered) {
        await eventsService.deleteReminder(eventId);
      } else {
        await eventsService.setReminder(eventId);
      }
      
      // Optimistic update - in a real app, you might want to fetch or manually toggle a state 
      // array property `hasReminder`. For this implementation, we just trigger fetchEvents.
      get().fetchEvents();
    } catch (err: any) {
      console.error('Failed to toggle reminder:', err);
    }
  }
}));
