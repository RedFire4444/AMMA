import { post } from './api';

export interface MeditationSessionInput {
  duration_minutes: number;
  session_type: string;
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
  session_type: string;
  status: string;
  mood_before: number | null;
  mood_after: number | null;
  notes: string | null;
  started_at: string;
  completed_at: string;
}

export const meditationService = {
  async logSession(data: MeditationSessionInput): Promise<MeditationSession> {
    return post<MeditationSession>('/sessions', data);
  },

  async autoLogHabit(_userId: string): Promise<void> {
    // Usually backend automatically handles auto-logging habits on session creation.
    // If not, we can trigger the habit log endpoint.
    try {
      await post('/habits/log', { habit_type: 'meditation', completed: true });
    } catch {
      // Avoid failing the whole session logging if auto log throws
    }
  },
};
