import { get } from './api';

export interface HomeFeedData {
  greeting: string;
  dailyQuote: {
    quote_text: string;
    author: string;
    category: string;
  } | null;
  trendingCourses: Array<{
    id: string;
    title: string;
    instructor_name: string;
    thumbnail_url: string | null;
    difficulty_level: string;
    estimated_duration_minutes: number;
    is_premium: boolean;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    event_date: string;
    instructor_name: string;
    thumbnail_url: string | null;
    is_live: boolean;
    category: string;
    booking_url?: string;
  }>;
  stats: {
    totalMinutes: number;
    currentStreak: number;
  };
}

export const homeService = {
  async getHomeFeed(): Promise<HomeFeedData> {
    try {
      const data = await get<any>('/home/feed');
      return {
        greeting: data?.user_greeting || 'Friend',
        dailyQuote: data?.daily_quote ? {
          quote_text: data.daily_quote.quote_text,
          author: data.daily_quote.author,
          category: data.daily_quote.category,
        } : null,
        trendingCourses: (data?.trending_courses || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          instructor_name: c.instructor_name,
          thumbnail_url: c.thumbnail_url,
          difficulty_level: c.difficulty_level,
          estimated_duration_minutes: c.estimated_duration_minutes,
          is_premium: c.is_premium,
        })),
        upcomingEvents: (data?.upcoming_events || []).map((e: any) => ({
          id: e.id,
          title: e.title,
          event_date: e.event_date,
          instructor_name: e.instructor_name,
          thumbnail_url: e.thumbnail_url,
          is_live: e.is_live,
          category: e.category,
          booking_url: e.booking_url,
        })),
        stats: {
          totalMinutes: data?.total_minutes ?? 0,
          currentStreak: data?.streak ?? 0,
        },
      };
    } catch (err) {
      if (__DEV__) console.warn('[homeService] getHomeFeed error:', err);
      return {
        greeting: 'Friend',
        dailyQuote: null,
        trendingCourses: [],
        upcomingEvents: [],
        stats: { totalMinutes: 0, currentStreak: 0 }
      };
    }
  },
};
