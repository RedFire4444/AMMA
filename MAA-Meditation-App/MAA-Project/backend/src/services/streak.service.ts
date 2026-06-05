/**
 * File: streak.service.ts
 *
 * Description: Calculates and retrieves habit streak data using application-level
 * TypeScript logic (Approach B). Fetches raw habit logs from Supabase and computes
 * current streak, longest streak, and statistics in-memory.
 * No SQL stored procedures are required.
 *
 * Author: Navnit(Ninjacode911)
 */

import { supabase } from './supabase.service';

interface StreakResult {
  current_streak: number;
  longest_streak: number;
}

interface UserStreaksResult {
  meditation_current_streak: number;
  meditation_longest_streak: number;
  cold_shower_current_streak: number;
  cold_shower_longest_streak: number;
  early_wakeup_current_streak: number;
  early_wakeup_longest_streak: number;
  exercise_current_streak: number;
  exercise_longest_streak: number;
}

interface HabitStatsResult {
  current_streak: number;
  longest_streak: number;
  total_days: number;
  completion_rate: number;
  days_this_week: number;
  days_this_month: number;
}

/**
 * Fetch all completed unique habit date strings (YYYY-MM-DD) sorted descending
 * for a specific user and habit type.
 */
/**
 * Fetch the user's configured timezone from the database.
 */
async function getUserTimezone(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('users')
    .select('timezone')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return 'UTC';
  }
  return data.timezone || 'UTC';
}

/**
 * Fetch all completed unique habit date strings (YYYY-MM-DD) sorted descending
 * for a specific user and habit type.
 */
async function fetchHabitDates(userId: string, habitType: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('logged_at')
    .eq('user_id', userId)
    .eq('habit_type', habitType)
    .eq('completed', true)
    .order('logged_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch habit logs: ${error.message}`);
  }

  // Extract date portion only and deduplicate (handles multiple entries per day)
  const dateStrings = (data ?? []).map((row) => (row.logged_at as string).split('T')[0]);
  return [...new Set(dateStrings)];
}

/**
 * Compute current and longest streak from an array of unique date strings (YYYY-MM-DD)
 * Expects dates sorted descending (most recent first).
 */
function computeStreaks(dates: string[], timezone: string = 'UTC'): StreakResult {
  if (dates.length === 0) {
    return { current_streak: 0, longest_streak: 0 };
  }

  const todayTime = new Date();
  const todayStr = todayTime.toLocaleDateString('en-CA', { timeZone: timezone });
  
  const yesterdayTime = new Date(todayTime.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterdayTime.toLocaleDateString('en-CA', { timeZone: timezone });

  // Current streak: count consecutive days backwards from today or yesterday
  let currentStreak = 0;
  if (dates[0] === todayStr || dates[0] === yesterdayStr) {
    currentStreak = 1;
    let prevDate = dates[0];
    for (let i = 1; i < dates.length; i++) {
      const diffMs =
        new Date(prevDate + 'T00:00:00Z').getTime() -
        new Date(dates[i] + 'T00:00:00Z').getTime();
      const diffDays = Math.round(diffMs / 86400000);
      if (diffDays === 1) {
        currentStreak++;
        prevDate = dates[i];
      } else {
        break;
      }
    }
  }

  // Longest streak: scan all consecutive date sequences
  let longestStreak = 1;
  let tempStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diffMs =
      new Date(dates[i - 1] + 'T00:00:00Z').getTime() -
      new Date(dates[i] + 'T00:00:00Z').getTime();
    const diffDays = Math.round(diffMs / 86400000);
    if (diffDays === 1) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);
  return { current_streak: currentStreak, longest_streak: longestStreak };
}

export const streakService = {
  /**
   * Calculate current and longest streak for a specific habit type.
   */
  async calculateStreak(userId: string, habitType: string): Promise<StreakResult> {
    const timezone = await getUserTimezone(userId);
    const dates = await fetchHabitDates(userId, habitType);
    return computeStreaks(dates, timezone);
  },

  /**
   * Get all four habit streaks for a user in a single parallel call.
   */
  async getUserStreaks(userId: string): Promise<UserStreaksResult> {
    const timezone = await getUserTimezone(userId);
    const [meditation, cold_shower, early_wakeup, exercise] = await Promise.all([
      fetchHabitDates(userId, 'meditation').then((dates) => computeStreaks(dates, timezone)),
      fetchHabitDates(userId, 'cold_shower').then((dates) => computeStreaks(dates, timezone)),
      fetchHabitDates(userId, 'early_wakeup').then((dates) => computeStreaks(dates, timezone)),
      fetchHabitDates(userId, 'exercise').then((dates) => computeStreaks(dates, timezone)),
    ]);

    return {
      meditation_current_streak: meditation.current_streak,
      meditation_longest_streak: meditation.longest_streak,
      cold_shower_current_streak: cold_shower.current_streak,
      cold_shower_longest_streak: cold_shower.longest_streak,
      early_wakeup_current_streak: early_wakeup.current_streak,
      early_wakeup_longest_streak: early_wakeup.longest_streak,
      exercise_current_streak: exercise.current_streak,
      exercise_longest_streak: exercise.longest_streak,
    };
  },

  /**
   * Get comprehensive habit statistics for a user over the last daysBack days.
   */
  async getHabitStats(
    userId: string,
    habitType: string,
    daysBack: number = 30
  ): Promise<HabitStatsResult> {
    const timezone = await getUserTimezone(userId);
    const allDates = await fetchHabitDates(userId, habitType);
    const { current_streak, longest_streak } = computeStreaks(allDates, timezone);

    // Window: last daysBack days
    const sinceDate = new Date();
    sinceDate.setUTCDate(sinceDate.getUTCDate() - daysBack);
    const sinceDateStr = sinceDate.toISOString().split('T')[0];

    // Start of current ISO week (Monday)
    const weekStart = new Date();
    weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Start of current month
    const monthStartStr = new Date().toISOString().slice(0, 7) + '-01';

    const windowDates = allDates.filter((d) => d >= sinceDateStr);
    const total_days = windowDates.length;
    const completion_rate =
      daysBack > 0 ? Math.round((total_days / daysBack) * 10000) / 10000 : 0;

    const days_this_week = allDates.filter((d) => d >= weekStartStr).length;
    const days_this_month = allDates.filter((d) => d >= monthStartStr).length;

    return {
      current_streak,
      longest_streak,
      total_days,
      completion_rate,
      days_this_week,
      days_this_month,
    };
  },
};
