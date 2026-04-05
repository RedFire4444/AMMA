import { supabase } from './supabase';

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

export const habitsService = {
  async getAllHabits(): Promise<AllHabitsData> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Attempt to get streaks via RPC
    let streaks: Record<string, StreakData> = {};
    try {
      const { data: streakData } = await supabase.rpc('get_user_streaks', {
        p_user_id: user.id,
      });
      if (streakData && Array.isArray(streakData)) {
        for (const s of streakData) {
          streaks[s.habit_type as string] = {
            current_streak: s.current_streak as number,
            longest_streak: s.longest_streak as number,
          };
        }
      }
    } catch {
      // RPC may not exist yet
    }

    // Fetch recent logs for heatmap (last 35 days)
    const thirtyFiveDaysAgo = new Date();
    thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

    const { data: logs, error } = await supabase
      .from('habit_logs')
      .select(
        'id, user_id, habit_type, completed, duration_minutes, mood_rating, energy_level, logged_at',
      )
      .eq('user_id', user.id)
      .gte('logged_at', thirtyFiveDaysAgo.toISOString().split('T')[0])
      .order('logged_at', { ascending: false });

    if (error) throw error;

    return {
      streaks,
      logs: (logs as HabitLog[]) || [],
    };
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('habit_logs').insert({
      user_id: user.id,
      habit_type: habitType,
      completed: data.completed ?? true,
      duration_minutes: data.duration_minutes ?? null,
      mood_rating: data.mood_rating ?? null,
      energy_level: data.energy_level ?? null,
      logged_at: today,
    });

    if (error) throw error;
  },

  async getStreak(habitType: string): Promise<StreakData> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data } = await supabase.rpc('calculate_streak', {
      p_user_id: user.id,
      p_habit_type: habitType,
    });

    return {
      current_streak: data?.current_streak ?? 0,
      longest_streak: data?.longest_streak ?? 0,
    };
  },

  async checkin(mood: number, notes: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('habit_logs').insert({
      user_id: user.id,
      habit_type: 'checkin',
      completed: true,
      mood_rating: mood,
      logged_at: today,
    });

    if (error) throw error;
  },

  async getVisionBoard(): Promise<VisionBoardImage[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vision_board')
      .select('id, user_id, image_url, caption, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as VisionBoardImage[]) || [];
  },

  async addVisionBoardImage(
    imageUrl: string,
    caption: string,
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('vision_board').insert({
      user_id: user.id,
      image_url: imageUrl,
      caption,
    });

    if (error) throw error;
  },

  async removeVisionBoardImage(id: string): Promise<void> {
    const { error } = await supabase
      .from('vision_board')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getDayJourney(): Promise<DayJourneyEntry[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('day_journey')
      .select(
        'id, user_id, period, title, description, time_range, completed, logged_at',
      )
      .eq('user_id', user.id)
      .eq('logged_at', today)
      .order('period', { ascending: true });

    if (error) throw error;
    return (data as DayJourneyEntry[]) || [];
  },

  async ratePerformance(rating: number): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('performance_ratings').upsert(
      {
        user_id: user.id,
        rating,
        rated_at: today,
      },
      {
        onConflict: 'user_id,rated_at',
      },
    );

    if (error) throw error;
  },

  async getWeeklyPerformance(): Promise<PerformanceRating[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('performance_ratings')
      .select('id, user_id, rating, rated_at')
      .eq('user_id', user.id)
      .gte('rated_at', sevenDaysAgo.toISOString().split('T')[0])
      .order('rated_at', { ascending: true });

    if (error) throw error;
    return (data as PerformanceRating[]) || [];
  },
};
