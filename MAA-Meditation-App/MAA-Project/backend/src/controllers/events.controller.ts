/**
 * File: events.controller.ts
 *
 * Description: Manages event endpoints: listing upcoming events, user registration with capacity checks, and stream URL access for registered users.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { scraperService } from '../services/scraper.service';
import { success, error } from '../utils/apiResponse';

/**
 * GET /api/events
 * List upcoming events ordered by event_date ascending
 */
export const listEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const now = new Date().toISOString();

    const { data: events, error: queryError, count } = await supabase
      .from('events')
      .select('*', { count: 'exact' })
      .gt('event_date', now)
      .neq('status', 'cancelled')
      .order('event_date', { ascending: true })
      .range(offset, offset + limitNum - 1);

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    // Check which events the user is registered for
    const eventIds = (events ?? []).map((e) => e.id as string);
    let registrationMap: Record<string, boolean> = {};

    if (eventIds.length > 0) {
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('event_id, status')
        .eq('user_id', userId)
        .in('event_id', eventIds)
        .eq('status', 'registered');

      if (registrations) {
        registrationMap = registrations.reduce<Record<string, boolean>>((acc, r) => {
          acc[r.event_id] = true;
          return acc;
        }, {});
      }
    }

    const eventsWithRegistration = (events ?? []).map((event) => ({
      ...event,
      is_registered: registrationMap[event.id] ?? false,
    }));

    res.status(200).json(
      success(eventsWithRegistration, {
        page: pageNum,
        limit: limitNum,
        total: count ?? 0,
        totalPages: count ? Math.ceil(count / limitNum) : 0,
      })
    );
  } catch (err) {
    console.error('listEvents error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch events', 500));
  }
};

/**
 * POST /api/events/:id/register
 * Register the authenticated user for an event
 */
export const registerForEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { id: eventId } = req.params;

    // Verify event exists and is upcoming
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, status, max_participants, registration_count')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      res.status(404).json(error('NOT_FOUND', 'Event not found', 404));
      return;
    }

    if (event.status === 'cancelled') {
      res.status(400).json(error('EVENT_CANCELLED', 'This event has been cancelled', 400));
      return;
    }

    if (event.status === 'completed') {
      res.status(400).json(error('EVENT_COMPLETED', 'This event has already ended', 400));
      return;
    }

    // Check capacity
    if (event.max_participants && event.registration_count >= event.max_participants) {
      res.status(400).json(error('EVENT_FULL', 'Event has reached maximum capacity', 400));
      return;
    }

    // Check if already registered
    const { data: existing } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      res.status(200).json(success(existing));
      return;
    }

    // Insert new registration
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: userId,
        status: 'registered',
        registered_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (regError) {
      res.status(500).json(error('REGISTRATION_FAILED', regError.message, 500));
      return;
    }

    // Atomically increment registration_count
    await supabase.rpc('increment_counter', {
      p_table: 'events',
      p_column: 'registration_count',
      p_id: eventId,
      p_delta: 1
    });

    res.status(201).json(success(registration));
  } catch (err) {
    console.error('registerForEvent error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to register for event', 500));
  }
};

/**
 * GET /api/events/:id/stream
 * Get the stream URL for a registered event
 */
export const getStreamUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { id: eventId } = req.params;

    // Verify user is registered for the event
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .eq('status', 'registered')
      .single();

    if (regError || !registration) {
      res.status(403).json(
        error('NOT_REGISTERED', 'You must be registered for this event to access the stream', 403)
      );
      return;
    }

    // Fetch stream URL
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, stream_url, recording_url, is_live, status')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      res.status(404).json(error('NOT_FOUND', 'Event not found', 404));
      return;
    }

    res.status(200).json(
      success({
        event_id: event.id,
        title: event.title,
        stream_url: event.stream_url ?? null,
        recording_url: event.recording_url ?? null,
        is_live: event.is_live,
        status: event.status,
      })
    );
  } catch (err) {
    console.error('getStreamUrl error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to get stream URL', 500));
  }
};

/**
 * GET /api/events/live
 * List currently live events
 */
export const getLiveEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data: events, error: queryError } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'live')
      .order('actual_start_time', { ascending: false });

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    res.status(200).json(success(events ?? []));
  } catch (err) {
    console.error('getLiveEvents error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch live events', 500));
  }
};

/**
 * GET /api/events/upcoming
 * List upcoming events
 */
export const getUpcomingEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [dbEventsResult, scrapedEvents] = await Promise.all([
      supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .order('event_date', { ascending: true }),
      scraperService.getRecentEvents().catch((err) => {
        console.error('[events.controller] Failed to scrape events:', err);
        return [];
      })
    ]);

    const { data: dbEvents, error: queryError } = dbEventsResult;

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    const allEvents = [...(dbEvents ?? []), ...scrapedEvents];

    res.status(200).json(success(allEvents));
  } catch (err) {
    console.error('getUpcomingEvents error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch upcoming events', 500));
  }
};

/**
 * GET /api/events/:id
 * Get full event details
 */
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { data: event, error: queryError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (queryError || !event) {
      res.status(404).json(error('NOT_FOUND', 'Event not found', 404));
      return;
    }

    res.status(200).json(success(event));
  } catch (err) {
    console.error('getEventById error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch event', 500));
  }
};

/**
 * POST /api/events/:id/reminder
 * Add a reminder
 */
export const setReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id: eventId } = req.params;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { data, error: insertError } = await supabase
      .from('event_reminders')
      .insert({ event_id: eventId, user_id: userId })
      .select()
      .single();

    if (insertError && insertError.code !== '23505') { // Ignore unique violation
      res.status(500).json(error('INSERT_FAILED', insertError.message, 500));
      return;
    }

    res.status(201).json(success(data || { message: 'Reminder already exists' }));
  } catch (err) {
    console.error('setReminder error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to set reminder', 500));
  }
};

/**
 * DELETE /api/events/:id/reminder
 * Remove a reminder
 */
export const deleteReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id: eventId } = req.params;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { error: deleteError } = await supabase
      .from('event_reminders')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (deleteError) {
      res.status(500).json(error('DELETE_FAILED', deleteError.message, 500));
      return;
    }

    res.status(200).json(success({ message: 'Reminder removed' }));
  } catch (err) {
    console.error('deleteReminder error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to remove reminder', 500));
  }
};

/**
 * GET /api/events/:id/viewers
 * Get viewer count
 */
export const getEventViewers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: eventId } = req.params;

    const { data: event, error: queryError } = await supabase
      .from('events')
      .select('viewer_count')
      .eq('id', eventId)
      .single();

    if (queryError || !event) {
      res.status(404).json(error('NOT_FOUND', 'Event not found', 404));
      return;
    }

    res.status(200).json(success({ viewers: event.viewer_count }));
  } catch (err) {
    console.error('getEventViewers error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to get viewer count', 500));
  }
};

/**
 * POST /api/events/:id/ping
 * Ping watch duration and viewer presence
 */
export const pingWatchDuration = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id: eventId } = req.params;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    // Upsert view record
    const { data: existingView } = await supabase
      .from('event_views')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existingView) {
      await supabase
        .from('event_views')
        .update({ 
          watch_duration_seconds: existingView.watch_duration_seconds + 30,
          last_pinged_at: new Date().toISOString()
        })
        .eq('id', existingView.id);
    } else {
      await supabase
        .from('event_views')
        .insert({
          event_id: eventId,
          user_id: userId,
          watch_duration_seconds: 30
        });
        
      // Increment viewer count roughly
      await supabase.rpc('increment_counter', {
        p_table: 'events',
        p_column: 'viewer_count',
        p_id: eventId,
        p_delta: 1
      });
    }

    res.status(200).json(success({ message: 'Ping recorded' }));
  } catch (err) {
    console.error('pingWatchDuration error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to record ping', 500));
  }
};
