/**
 * File: habits.controller.ts
 *
 * Description: Handles habit tracking endpoints: logging completions, streak calculations, vision board CRUD, day journey entries, and performance ratings.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { success, error } from '../utils/apiResponse';
import { streakService } from '../services/streak.service';

/**
 * GET /api/habits/all
 * Get all habit streaks and recent heatmap data (last 30 days per habit type)
 */
export const getAllHabits = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch streaks and recent habit logs in parallel
    const [streaks, logsResult] = await Promise.all([
      streakService.getUserStreaks(userId),
      supabase
        .from('habit_logs')
        .select('id, habit_type, completed, duration_minutes, mood_rating, energy_level, logged_at')
        .eq('user_id', userId)
        .gte('logged_at', thirtyDaysAgo.toISOString())
        .order('logged_at', { ascending: false }),
    ]);

    if (logsResult.error) {
      res.status(500).json(error('QUERY_FAILED', logsResult.error.message, 500));
      return;
    }

    // Group logs by habit_type for heatmap rendering
    const heatmap: Record<string, Array<{ date: string; completed: boolean; duration_minutes: number | null }>> = {};
    for (const log of logsResult.data ?? []) {
      const type = log.habit_type as string;
      if (!heatmap[type]) {
        heatmap[type] = [];
      }
      heatmap[type].push({
        // Normalize to YYYY-MM-DD so mobile calendar date comparisons work correctly
        date: (log.logged_at as string).split('T')[0],
        completed: log.completed,
        duration_minutes: log.duration_minutes,
      });
    }

    const formattedStreaks: Record<string, { current_streak: number; longest_streak: number }> = {};
    if (streaks) {
      formattedStreaks['meditation'] = {
        current_streak: streaks.meditation_current_streak || 0,
        longest_streak: streaks.meditation_longest_streak || 0,
      };
      formattedStreaks['cold_shower'] = {
        current_streak: streaks.cold_shower_current_streak || 0,
        longest_streak: streaks.cold_shower_longest_streak || 0,
      };
      formattedStreaks['early_wakeup'] = {
        current_streak: streaks.early_wakeup_current_streak || 0,
        longest_streak: streaks.early_wakeup_longest_streak || 0,
      };
      formattedStreaks['exercise'] = {
        current_streak: streaks.exercise_current_streak || 0,
        longest_streak: streaks.exercise_longest_streak || 0,
      };
    }

    res.status(200).json(
      success({
        streaks: formattedStreaks,
        heatmap,
      })
    );
  } catch (err) {
    console.error('getAllHabits error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch habits data', 500));
  }
};

/**
 * POST /api/habits/log
 * Log a habit completion for today.
 * Uses a manual check-then-insert/update pattern to avoid relying on
 * database-level unique constraint for conflict resolution (Approach B).
 */
export const logHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const {
      habit_type,
      completed = true,
      duration_minutes,
      mood_rating,
      energy_level,
      notes,
      logged_at,
    } = req.body;

    const targetDate = logged_at ? logged_at.split('T')[0] : new Date().toISOString().split('T')[0];

    // Check if a log already exists for the target date. Use limit(1)
    // instead of maybeSingle() so duplicate historical rows do not fail
    // the request before we can update one of them.
    const { data: existingRows, error: checkError } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('habit_type', habit_type)
      .gte('logged_at', `${targetDate}T00:00:00.000Z`)
      .lte('logged_at', `${targetDate}T23:59:59.999Z`)
      .order('logged_at', { ascending: false })
      .limit(1);

    if (checkError) {
      res.status(500).json(error('CHECK_FAILED', checkError.message, 500));
      return;
    }

    let habitLog;
    let opError;

    const existing = existingRows?.[0] ?? null;

    if (existing) {
      // Update the existing log for targetDate
      const { data, error: updateErr } = await supabase
        .from('habit_logs')
        .update({
          completed,
          duration_minutes: duration_minutes ?? null,
          mood_rating: mood_rating ?? null,
          energy_level: energy_level ?? null,
          notes: notes ?? null,
        })
        .eq('id', existing.id)
        .select()
        .single();
      habitLog = data;
      opError = updateErr;
    } else {
      // Insert a new log for targetDate
      const { data, error: insertErr } = await supabase
        .from('habit_logs')
        .insert({
          user_id: userId,
          habit_type,
          completed,
          duration_minutes: duration_minutes ?? null,
          mood_rating: mood_rating ?? null,
          energy_level: energy_level ?? null,
          notes: notes ?? null,
          logged_at: `${targetDate}T00:00:00.000Z`,
        })
        .select()
        .single();
      habitLog = data;
      opError = insertErr;
    }

    if (opError) {
      res.status(500).json(error('LOG_FAILED', opError.message, 500));
      return;
    }

    // Sync manual meditation habit logs with meditation_sessions table to update Profile stats
    if (habit_type === 'meditation') {
      try {
        const start = `${targetDate}T00:00:00.000Z`;
        const end = `${targetDate}T23:59:59.999Z`;
        if (completed) {
          const { data: existingSessions, error: sessionCheckErr } = await supabase
            .from('meditation_sessions')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .gte('completed_at', start)
            .lte('completed_at', end)
            .order('completed_at', { ascending: false })
            .limit(1);

          if (sessionCheckErr) {
            console.warn('[HabitLog] Failed to check meditation session:', sessionCheckErr.message);
          }

          if (!sessionCheckErr && !(existingSessions?.[0])) {
            const { data: profile } = await supabase
              .from('users')
              .select('meditation_goal_minutes')
              .eq('id', userId)
              .maybeSingle();
              
            const duration = duration_minutes || profile?.meditation_goal_minutes || 10;
            await supabase
              .from('meditation_sessions')
              .insert({
                user_id: userId,
                duration_minutes: duration,
                session_type: 'unguided',
                status: 'completed',
                progress_percentage: 100,
                started_at: `${targetDate}T00:00:00.000Z`,
                completed_at: `${targetDate}T00:10:00.000Z`,
              });
          }
        } else {
          // Delete manual meditation session for this day if it exists
          await supabase
            .from('meditation_sessions')
            .delete()
            .eq('user_id', userId)
            .eq('session_type', 'unguided')
            .gte('completed_at', start)
            .lte('completed_at', end);
        }
      } catch (syncErr) {
        console.warn('[HabitLog] Failed to sync meditation session:', syncErr);
      }
    }

    res.status(201).json(success(habitLog));
  } catch (err) {
    console.error('logHabit error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to log habit', 500));
  }
};

/**
 * GET /api/habits/streak
 * Get streak and stats for a specific habit type
 */
export const getStreak = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const habitType = (req.query.habit_type as string) ?? 'meditation';

    const [streak, stats] = await Promise.all([
      streakService.calculateStreak(userId, habitType),
      streakService.getHabitStats(userId, habitType, 30),
    ]);

    res.status(200).json(
      success({
        habit_type: habitType,
        streak: streak ?? { current_streak: 0, longest_streak: 0 },
        stats: stats ?? null,
      })
    );
  } catch (err) {
    console.error('getStreak error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch streak data', 500));
  }
};

/**
 * POST /api/habits/checkin
 * Manual daily check-in with mood and notes.
 * Uses manual check-then-insert/update to avoid database constraint dependency.
 */
export const checkin = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { mood_rating, energy_level, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const habitType = 'meditation';

    // Check if a meditation check-in already exists for today. Keep this
    // duplicate-safe for accounts that already have more than one row.
    const { data: existingRows, error: checkError } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('habit_type', habitType)
      .gte('logged_at', `${today}T00:00:00.000Z`)
      .lte('logged_at', `${today}T23:59:59.999Z`)
      .order('logged_at', { ascending: false })
      .limit(1);

    if (checkError) {
      res.status(500).json(error('CHECK_FAILED', checkError.message, 500));
      return;
    }

    let checkinLog;
    let opError;

    const existing = existingRows?.[0] ?? null;

    if (existing) {
      const { data, error: updateErr } = await supabase
        .from('habit_logs')
        .update({
          completed: true,
          mood_rating: mood_rating ?? null,
          energy_level: energy_level ?? null,
          notes: notes ?? null,
        })
        .eq('id', existing.id)
        .select()
        .single();
      checkinLog = data;
      opError = updateErr;
    } else {
      const { data, error: insertErr } = await supabase
        .from('habit_logs')
        .insert({
          user_id: userId,
          habit_type: habitType,
          completed: true,
          mood_rating: mood_rating ?? null,
          energy_level: energy_level ?? null,
          notes: notes ?? null,
          logged_at: `${today}T00:00:00.000Z`,
        })
        .select()
        .single();
      checkinLog = data;
      opError = insertErr;
    }

    if (opError) {
      res.status(500).json(error('CHECKIN_FAILED', opError.message, 500));
      return;
    }

    res.status(201).json(success(checkinLog));
  } catch (err) {
    console.error('checkin error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to check in', 500));
  }
};

/**
 * GET /api/habits/vision-board
 * Get user's vision board images ordered by sort_order
 */
export const getVisionBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { data: items, error: queryError } = await supabase
      .from('vision_board')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    res.status(200).json(success(items ?? []));
  } catch (err) {
    console.error('getVisionBoard error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch vision board', 500));
  }
};

/**
 * POST /api/habits/vision-board
 * Add an image to the user's vision board
 */
export const addVisionBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { image_url, caption, sort_order } = req.body;

    if (!image_url) {
      res.status(400).json(error('VALIDATION_ERROR', 'image_url is required', 400));
      return;
    }

    const { data: item, error: insertError } = await supabase
      .from('vision_board')
      .insert({
        user_id: userId,
        image_url,
        caption: caption ?? null,
        sort_order: sort_order ?? 0,
      })
      .select()
      .single();

    if (insertError) {
      res.status(500).json(error('INSERT_FAILED', insertError.message, 500));
      return;
    }

    res.status(201).json(success(item));
  } catch (err) {
    console.error('addVisionBoard error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to add vision board item', 500));
  }
};

/**
 * DELETE /api/habits/vision-board/:id
 * Remove an image from the user's vision board
 */
export const removeVisionBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { id } = req.params;

    // Verify ownership before deleting
    const { data: existing, error: fetchError } = await supabase
      .from('vision_board')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json(error('NOT_FOUND', 'Vision board item not found', 404));
      return;
    }

    if (existing.user_id !== userId) {
      res.status(403).json(error('FORBIDDEN', 'You can only delete your own items', 403));
      return;
    }

    const { error: deleteError } = await supabase
      .from('vision_board')
      .delete()
      .eq('id', id);

    if (deleteError) {
      res.status(500).json(error('DELETE_FAILED', deleteError.message, 500));
      return;
    }

    res.status(200).json(success({ message: 'Vision board item removed' }));
  } catch (err) {
    console.error('removeVisionBoard error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to remove vision board item', 500));
  }
};

/**
 * GET /api/habits/day-journey
 * Get active day journey time-slot entries
 */
export const getDayJourney = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { data: entries, error: queryError } = await supabase
      .from('day_journey')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    res.status(200).json(success(entries ?? []));
  } catch (err) {
    console.error('getDayJourney error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch day journey', 500));
  }
};

/**
 * POST /api/habits/performance/rate
 * Upsert today's productivity rating
 */
export const ratePerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { productivity_rating, notes, rated_date } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const targetDate = rated_date ?? today;

    // Validate rated_date not in the future
    const nowDateStr = new Date().toISOString().split('T')[0];
    if (targetDate > nowDateStr) {
      res.status(400).json(error('VALIDATION_ERROR', 'rated_date cannot be in the future', 400));
      return;
    }

    // Validate input: productivity_rating must be an integer 1-5
    const ratingNumber = Number(productivity_rating);
    if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      // Log detailed debug info for the failing request so we can inspect client payload
      try {
        console.warn('Invalid productivity_rating payload received:', {
          headers: req.headers,
          body: req.body,
          productivity_rating_type: typeof req.body?.productivity_rating,
          productivity_rating_raw: JSON.stringify(req.body?.productivity_rating),
          keys: Object.keys(req.body ?? {}),
        });
      } catch (logErr) {
        console.warn('Failed to stringify invalid payload for debug:', logErr);
        console.warn('Raw req.body:', req.body);
      }

      res.status(400).json(error('VALIDATION_ERROR', 'productivity_rating must be an integer between 1 and 5', 400));
      return;
    }

    const payload = {
      user_id: userId,
      productivity_rating: ratingNumber,
      rated_date: targetDate,
      notes: notes ?? null,
    };

    const { data: rating, error: upsertError } = await supabase
      .from('performance_ratings')
      .upsert(payload, { onConflict: 'user_id,rated_date', ignoreDuplicates: false })
      .select()
      .single();

    if (upsertError) {
      // Log full error for debugging
      console.error('performance_ratings upsert failed', {
        message: upsertError.message,
        code: upsertError.code,
        details: upsertError.details,
        hint: upsertError.hint,
        payload,
      });
      res.status(500).json(error('RATING_FAILED', upsertError.message || 'Database error while saving rating', 500));
      return;
    }

    // Also sync a habit_logs entry for the performance rating so the
    // calendar / heatmap (which reads from `habit_logs`) marks this day.
    let syncedHabitLog: any = null;
    try {
  const start = `${targetDate}T00:00:00.000Z`;
  const end = `${targetDate}T23:59:59.999Z`;

      // Check if a performance habit_log exists for this date
      const { data: existingLogs, error: checkErr } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('habit_type', 'performance')
        .gte('logged_at', start)
        .lte('logged_at', end)
        .order('logged_at', { ascending: false })
        .limit(1);

      if (checkErr) {
        console.warn('Failed to check existing performance habit_log:', checkErr.message);
      } else if (existingLogs?.[0]) {
        // Update existing habit_log to mark completed (keep other fields intact)
        const { data: updatedLog, error: updateLogErr } = await supabase
          .from('habit_logs')
          .update({ completed: true })
          .eq('id', existingLogs[0].id)
          .select()
          .single();
        if (updateLogErr) console.warn('Failed to update performance habit_log:', updateLogErr.message);
        syncedHabitLog = updatedLog ?? null;
      } else {
        // Insert a new habit_log for performance (so heatmaps pick it up)
        const { data: insertedLog, error: insertLogErr } = await supabase
          .from('habit_logs')
          .insert({
            user_id: userId,
            habit_type: 'performance',
            completed: true,
            logged_at: `${today}T00:00:00.000Z`,
          })
          .select()
          .single();
        if (insertLogErr) console.warn('Failed to insert performance habit_log:', insertLogErr.message);
        syncedHabitLog = insertedLog ?? null;
      }
    } catch (syncErr) {
      console.warn('Error syncing performance to habit_logs:', syncErr);
    }

    // Return the rating and the synced habit_log so the client can update UI immediately
    res.status(201).json(success({ rating, habit_log: syncedHabitLog }));
  } catch (err) {
    console.error('ratePerformance error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to save performance rating', 500));
  }
};

/**
 * GET /api/habits/performance/weekly
 * Get the last 7 days of productivity ratings
 */
export const getWeeklyPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];

    const { data: ratings, error: queryError } = await supabase
      .from('performance_ratings')
      .select('*')
      .eq('user_id', userId)
      .gte('rated_date', startDate)
      .order('rated_date', { ascending: true });

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    // Calculate weekly average
    const ratingValues = (ratings ?? []).map((r) => r.productivity_rating as number);
    const weeklyAverage =
      ratingValues.length > 0
        ? Math.round((ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) * 10) / 10
        : 0;

    res.status(200).json(
      success({
        ratings: ratings ?? [],
        weekly_average: weeklyAverage,
        days_rated: ratingValues.length,
      })
    );
  } catch (err) {
    console.error('getWeeklyPerformance error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch weekly performance', 500));
  }
};
