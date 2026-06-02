/**
 * File: users.controller.ts
 *
 * Description: Handles user profile endpoints: fetching the authenticated user's profile and updating allowed profile fields.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { success, error } from '../utils/apiResponse';

/**
 * GET /api/users/me
 * B2.1 — Get current user's profile + stats
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const [userResult, sessionsResult, directoryWatchResult, streakResult] = await Promise.all([
      supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single(),

      supabase
        .from('meditation_sessions')
        .select('duration_minutes')
        .eq('user_id', userId)
        .eq('status', 'completed'),

      supabase
        .from('directory_watch_sessions')
        .select('duration_minutes')
        .eq('user_id', userId),

      supabase.rpc('calculate_streak', {
        p_user_id: userId,
        p_habit_type: 'meditation',
      }),
    ]);

    if (userResult.error || !userResult.data) {
      console.log(`[User] Profile not found for ${userId}. Auto-creating profile...`);
      const newUserProfile = {
        id: userId,
        email: req.user?.email || null,
        phone: req.user?.phone || null,
        auth_provider: req.user?.email ? 'email' : 'phone',
        updated_at: new Date().toISOString(),
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert(newUserProfile)
        .select()
        .single();

      if (createError) {
        console.error('[User] Failed to auto-create user profile:', createError);
        res.status(404).json(error('USER_NOT_FOUND', 'User profile not found and could not be created', 404));
        return;
      }

      userResult.data = createdUser;
    }

    const sessions = sessionsResult.data || [];
    
    let watchSessions: any[] = [];
    if (directoryWatchResult && !directoryWatchResult.error) {
      watchSessions = directoryWatchResult.data || [];
    } else if (directoryWatchResult?.error) {
      console.warn('[User] Failed to fetch directory watch sessions, table might not exist yet:', directoryWatchResult.error.message);
    }

    const meditationMinutes = sessions.reduce((sum, item) => sum + (item.duration_minutes || 0), 0);
    const watchMinutes = watchSessions.reduce((sum, item) => sum + (item.duration_minutes || 0), 0);
    const totalMinutes = meditationMinutes + watchMinutes;

    const totalSessions = sessions.length + watchSessions.length;
    const longestSession = Math.max(
      sessions.reduce((max, item) => Math.max(max, item.duration_minutes || 0), 0),
      watchSessions.reduce((max, item) => Math.max(max, item.duration_minutes || 0), 0)
    );

    const streakDataRaw = streakResult.data;
    const streakData = Array.isArray(streakDataRaw) ? streakDataRaw[0] : streakDataRaw;
    const currentStreak = streakData?.current_streak ?? 0;
    const longestStreak = streakData?.longest_streak ?? 0;

    const profileWithStats = {
      ...userResult.data,
      stats: {
        total_duration_minutes: totalMinutes,
        total_sessions: totalSessions,
        longest_session_minutes: longestSession,
        current_streak: currentStreak,
        longest_streak: longestStreak,
      }
    };

    res.status(200).json(success(profileWithStats));
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch profile', 500));
  }
};

/**
 * PATCH /api/users/me
 * B2.2 — Update current user's profile
 */
export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    // Only allow safe fields to be updated (never id, role, created_at)
    const {
      full_name, avatar_url, date_of_birth, timezone,
      preferred_language, notification_preferences,
      interests, meditation_goal_minutes, onboarding_complete, notification_enabled
    } = req.body;

    const updates: Record<string, unknown> = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth;
    if (timezone !== undefined) updates.timezone = timezone;
    if (preferred_language !== undefined) updates.preferred_language = preferred_language;
    if (notification_preferences !== undefined) updates.notification_preferences = notification_preferences;
    if (interests !== undefined) updates.interests = interests;
    if (meditation_goal_minutes !== undefined) updates.meditation_goal_minutes = meditation_goal_minutes;
    if (onboarding_complete !== undefined) updates.onboarding_complete = onboarding_complete;
    if (notification_enabled !== undefined) updates.notification_enabled = notification_enabled;

    if (Object.keys(updates).length === 0) {
      res.status(400).json(error('NO_FIELDS', 'No valid fields provided to update', 400));
      return;
    }

    const { data, error: dbError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (dbError) {
      res.status(400).json(error('UPDATE_FAILED', dbError.message, 400));
      return;
    }

    res.status(200).json(success(data));
  } catch (err) {
    console.error('updateMe error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to update profile', 500));
  }
};
