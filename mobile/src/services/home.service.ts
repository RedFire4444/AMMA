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
      return data;
    } catch {
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
