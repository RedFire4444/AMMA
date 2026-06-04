import { get, post, del } from './api';

export interface HabitLog {
  id: string;
  user_id: string;
  habit_type: string;
  completed: boolean;
  duration_minutes: number | null;
  mood_rating: number | null;
  energy_level: number | null;
  logged_at: string;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
}

export interface VisionBoardImage {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export interface DayJourneyEntry {
  id: string;
  user_id: string;
  period: 'morning' | 'afternoon' | 'night';
  title: string;
  description: string;
  time_range: string;
  completed: boolean;
  logged_at: string;
}

export interface PerformanceRating {
  id: string;
  user_id: string;
  rating: number;
  rated_at: string;
}

export interface AllHabitsData {
  streaks: Record<string, StreakData>;
  logs: HabitLog[];
}

interface HeatmapEntry {
  date: string;
  completed: boolean;
  duration_minutes: number | null;
}

interface AllHabitsResponse {
  streaks?: Record<string, StreakData>;
  heatmap?: Record<string, HeatmapEntry[]>;
}

export const habitsService = {
  async getAllHabits(): Promise<AllHabitsData> {
    try {
      const data = await get<AllHabitsResponse>('/habits/all');
      const heatmap = data?.heatmap ?? {};
      // Backend returns heatmap as Record<habit_type, entries[]> for efficient
      // grid rendering; mobile components want a flat HabitLog[] list. Flatten
      // here so callers get a single, consistent shape.
      const logs: HabitLog[] = Object.entries(heatmap).flatMap(([habitType, entries]) =>
        entries.map((entry) => ({
          id: `${habitType}-${entry.date}`,
          user_id: '',
          habit_type: habitType,
          completed: entry.completed,
          duration_minutes: entry.duration_minutes,
          mood_rating: null,
          energy_level: null,
          // Normalize to YYYY-MM-DD — backend may return full ISO timestamps;
          // HabitGrid and handleLogHabit compare against 'YYYY-MM-DD' strings.
          logged_at: entry.date.split('T')[0],
        })),
      );
      return {
        streaks: data?.streaks ?? {},
        logs,
      };
    } catch {
      return { streaks: {}, logs: [] };
    }
  },

  async logHabit(
    habitType: string,
    data: {
      completed?: boolean;
      duration_minutes?: number;
      mood_rating?: number;
      energy_level?: number;
    },
  ): Promise<void> {
    await post('/habits/log', { habit_type: habitType, ...data });
  },

  async getStreak(habitType: string): Promise<StreakData> {
    try {
      const data = await get<any>('/habits/streak', { params: { habit_type: habitType } });
      return data || { current_streak: 0, longest_streak: 0 };
    } catch {
      return { current_streak: 0, longest_streak: 0 };
    }
  },

  async checkin(mood: number, _notes: string): Promise<void> {
    await post('/habits/checkin', { mood_rating: mood, notes: _notes });
  },

  async getVisionBoard(): Promise<VisionBoardImage[]> {
    const data = await get<any>('/habits/vision-board');
    return data || [];
  },

  async addVisionBoardImage(
    imageUrl: string,
    caption: string,
  ): Promise<void> {
    await post('/habits/vision-board', { image_url: imageUrl, caption });
  },

  async removeVisionBoardImage(id: string): Promise<void> {
    await del(`/habits/vision-board/${id}`);
  },

  async getDayJourney(): Promise<DayJourneyEntry[]> {
    const data = await get<any>('/habits/day-journey');
    return data || [];
  },

  async ratePerformance(rating: number): Promise<void> {
    await post('/habits/performance/rate', { productivity_rating: rating });
  },

  async getWeeklyPerformance(): Promise<PerformanceRating[]> {
    try {
      const data = await get<any>('/habits/performance/weekly');
      // Backend returns { ratings, weekly_average, days_rated }
      // Map the raw database fields to PerformanceRating interface
      const ratings = (data?.ratings) || [];
      return ratings.map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        rating: r.productivity_rating,
        rated_at: r.rated_date,
      }));
    } catch {
      return [];
    }
  },
};
