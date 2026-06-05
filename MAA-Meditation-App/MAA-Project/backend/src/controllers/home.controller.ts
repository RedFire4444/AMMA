/**
 * File: home.controller.ts
 *
 * Description: Builds the home screen feed by aggregating daily quote, trending courses, upcoming events, user greeting, and meditation streak data.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { streakService } from '../services/streak.service';
import { scraperService } from '../services/scraper.service';
import { success, error } from '../utils/apiResponse';

const AMMA_QUOTES = [
  { quote_text: "Our efforts to remove hatred and indifference from the world begin by trying to remove them from our own mind.", author: "Amma" },
  { quote_text: "The world should know that a life inspired by love and service to humanity is possible.", author: "Amma" },
  { quote_text: "May the tree of our lives be rooted in the soil of love, may good deeds be the leaves, kind words be the flowers, and peace be the fruit. May the world flourish as one family, united in love. May we thus be able to create a world in which peace and contentment prevail. This is Amma’s sincere prayer.", author: "Amma" },
  { quote_text: "It is one of our foremost duties to lovingly care for all living things.", author: "Amma" },
  { quote_text: "Spirituality starts and ends with compassion.", author: "Amma" },
  { quote_text: "Love is our true essence. This love has no limitations of caste, creed, color, or religion.", author: "Amma" },
  { quote_text: "In this universe, it is love that binds everything together. Love is the very foundation, beauty, and fulfillment of life.", author: "Amma" },
  { quote_text: "When love overflows and is expressed through every word and deed, we call it compassion.", author: "Amma" },
  { quote_text: "Serving the world with love and cooperation, you will find your own true Self.", author: "Amma" },
  { quote_text: "Only when goodness awakens within, will one's personality and actions gain beauty and strength.", author: "Amma" },
  { quote_text: "Look carefully at what is of value in others and respect that.", author: "Amma" },
  { quote_text: "Only humility will help us grow. The feeling of 'I' and 'mine' obstructs inner growth.", author: "Amma" },
  { quote_text: "The more you give, the more your heart is filled. Love is a never-ending stream.", author: "Amma" },
  { quote_text: "When we come to know who we truly are, we will see ourselves in all people.", author: "Amma" },
  { quote_text: "Happiness is not found in external circumstances but in the depths of your own being.", author: "Amma" },
  { quote_text: "Don't be discouraged by your incapacity to dispel darkness from the world. Light your own lamp.", author: "Amma" },
  { quote_text: "Your heart is the temple where God should be enshrined. Your good thoughts are the flowers, your good words the hymns, your good deeds the rituals, and love is the offering.", author: "Amma" }
];

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

    const nowIso = new Date().toISOString();

    // Select a random Amma quote on every refresh
    const quoteIndex = Math.floor(Math.random() * AMMA_QUOTES.length);
    const dailyQuote = AMMA_QUOTES[quoteIndex];

    // All queries run in parallel. Selects are trimmed to the columns the
    // mobile client actually renders, which cuts roundtrip payload ~30-50%.
    const [coursesResult, eventsResult, userResult, streakResult, sessionsResult] = await Promise.all([
      supabase
        .from('courses')
        .select(
          'id, title, instructor_name, thumbnail_url, estimated_duration_minutes, difficulty_level, is_premium, category',
        )
        .eq('status', 'published')
        .order('enrollment_count', { ascending: false })
        .limit(5),

      Promise.all([
        supabase
          .from('events')
          .select(
            'id, title, event_date, instructor_name, thumbnail_url, is_live, category',
          )
          .gt('event_date', nowIso)
          .order('event_date', { ascending: true })
          .limit(3),
        scraperService.getRecentEvents().catch(() => []),
      ]).then(([dbRes, scraped]) => {
        const dbEvents = dbRes.data ?? [];
        return { data: [...dbEvents, ...scraped] };
      }),

      supabase
        .from('users')
        .select('full_name')
        .eq('id', userId)
        .single(),

      // Use backend streakService to compute streaks from habit_logs (uses logged_at)
      (async () => ({ data: await streakService.calculateStreak(userId, 'meditation') }))(),

      supabase
        .from('meditation_sessions')
        .select('duration_minutes')
        .eq('user_id', userId)
        .eq('status', 'completed'),
    ]);

    const totalMinutes = sessionsResult.data?.reduce((sum, item) => sum + (item.duration_minutes || 0), 0) ?? 0;

    const feed = {
      daily_quote: dailyQuote,
      trending_courses: coursesResult.data ?? [],
      upcoming_events: eventsResult.data ?? [],
      user_greeting: userResult.data?.full_name ?? null,
      // streakResult.data is expected to be { current_streak, longest_streak }
      streak: (streakResult.data && streakResult.data.current_streak) || 0,
      total_minutes: totalMinutes,
    };

    res.status(200).json(success(feed));
  } catch (err) {
    console.error('getHomeFeed error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch home feed', 500));
  }
};
