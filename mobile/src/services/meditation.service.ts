import { supabase } from './supabase';

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: session, error } = await supabase
      .from('meditation_sessions')
      .insert({
        user_id: user.id,
        duration_minutes: data.duration_minutes,
        session_type: data.session_type,
        status: 'completed',
        mood_before: data.mood_before ?? null,
        mood_after: data.mood_after ?? null,
        notes: data.notes ?? null,
        started_at: data.started_at,
        completed_at: data.completed_at,
      })
      .select()
      .single();

    if (error) throw error;
    return session as MeditationSession;
  },

  async autoLogHabit(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('habit_logs').upsert(
      {
        user_id: userId,
        habit_type: 'meditation',
        completed: true,
        logged_at: today,
      },
      {
        onConflict: 'user_id,habit_type,logged_at',
      },
    );

    if (error) throw error;
  },
};
