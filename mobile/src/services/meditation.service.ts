import { post } from './api';

export type MeditationSessionType =
  | 'guided'
  | 'unguided'
  | 'free'
  | 'breathing'
  | 'body_scan'
  | 'loving_kindness';

export interface MeditationSessionInput {
  duration_minutes: number;
  session_type: MeditationSessionType;
  mood_before?: number;
  mood_after?: number;
  notes?: string;
  started_at: string;
  completed_at: string;
}

export interface MeditationSession {
  id: string;
  user_id: string;
  duration_minutes: number;
  session_type: MeditationSessionType;
  status: string;
  mood_before: number | null;
  mood_after: number | null;
  notes: string | null;
  started_at: string;
  completed_at: string;
}

export const meditationService = {
  /**
   * Log a meditation session. Backend's createSession also auto-logs a
   * meditation habit entry for streak tracking, so callers should NOT
   * separately call habitsService.logHabit('meditation', ...) — it would
   * be redundant and double-log under racy conditions.
   */
  async logSession(data: MeditationSessionInput): Promise<MeditationSession> {
    return post<MeditationSession>('/sessions', data);
  },
};
