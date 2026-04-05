import { supabase } from './supabase';

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
  }>;
  stats: {
    totalMinutes: number;
    currentStreak: number;
  };
}

export const homeService = {
  async getHomeFeed(): Promise<HomeFeedData> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch user profile for greeting
    const { data: profile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user?.id)
      .single();

    // Fetch today's quote
    const today = new Date().toISOString().split('T')[0];
    let { data: quote } = await supabase
      .from('daily_quotes')
      .select('quote_text, author, category')
      .eq('quote_date', today)
      .single();

    if (!quote) {
      const { data: fallbackQuote } = await supabase
        .from('daily_quotes')
        .select('quote_text, author, category')
        .order('quote_date', { ascending: false })
        .limit(1)
        .single();
      quote = fallbackQuote;
    }

    // Fetch trending courses
    const { data: courses } = await supabase
      .from('courses')
      .select(
        'id, title, instructor_name, thumbnail_url, difficulty_level, estimated_duration_minutes, is_premium',
      )
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .limit(5);

    // Fetch upcoming events
    const { data: events } = await supabase
      .from('events')
      .select(
        'id, title, event_date, instructor_name, thumbnail_url, is_live, category',
      )
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(3);

    // Get total meditation minutes
    const { data: sessions } = await supabase
      .from('meditation_sessions')
      .select('duration_minutes')
      .eq('user_id', user?.id)
      .eq('status', 'completed');

    const totalMinutes =
      sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) ?? 0;

    // Get current streak (simplified — counts consecutive days with habit logs)
    const { data: streakData } = await supabase.rpc('calculate_streak', {
      p_user_id: user?.id,
      p_habit_type: 'meditation',
    });

    return {
      greeting: profile?.full_name || 'Friend',
      dailyQuote: quote,
      trendingCourses: courses || [],
      upcomingEvents: events || [],
      stats: {
        totalMinutes,
        currentStreak: streakData?.current_streak ?? 0,
      },
    };
  },
};
