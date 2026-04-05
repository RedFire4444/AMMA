import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { success, error } from '../utils/apiResponse';

/**
 * GET /api/home/feed
 * Returns the home screen feed data for the authenticated user
 */
export const getHomeFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    // Run all queries in parallel for performance
    const [quoteResult, coursesResult, eventsResult, userResult, streakResult] = await Promise.all([
      // Daily quote: today's quote, fallback to latest available
      supabase
        .from('daily_quotes')
        .select('*')
        .eq('quote_date', new Date().toISOString().split('T')[0])
        .single(),

      // Trending courses: top 5 published by enrollment count
      supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('enrollment_count', { ascending: false })
        .limit(5),

      // Upcoming events: next 3 future events
      supabase
        .from('events')
        .select('*')
        .gt('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(3),

      // User greeting data
      supabase
        .from('users')
        .select('full_name')
        .eq('id', userId)
        .single(),

      // Meditation streak via RPC
      supabase.rpc('calculate_streak', {
        p_user_id: userId,
        p_habit_type: 'meditation'
      })
    ]);

    // Handle daily quote fallback: if no quote for today, get the latest one
    let dailyQuote = quoteResult.data;
    if (quoteResult.error || !dailyQuote) {
      const { data: fallbackQuote } = await supabase
        .from('daily_quotes')
        .select('*')
        .order('quote_date', { ascending: false })
        .limit(1)
        .single();

      dailyQuote = fallbackQuote;
    }

    const feed = {
      daily_quote: dailyQuote ?? null,
      trending_courses: coursesResult.data ?? [],
      upcoming_events: eventsResult.data ?? [],
      user_greeting: userResult.data?.full_name ?? null,
      streak: streakResult.data ?? 0
    };

    res.status(200).json(success(feed));
  } catch (err) {
    console.error('getHomeFeed error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch home feed', 500));
  }
};
