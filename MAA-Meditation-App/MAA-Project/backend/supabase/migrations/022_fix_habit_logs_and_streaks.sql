-- =====================================================
-- Migration 022: Fix habit logs unique constraint and streak function signatures
-- Restore original correct signatures matching streak.service.ts
-- And add UNIQUE constraint for onConflict support in upsert
-- =====================================================

-- 1. Add UNIQUE constraint to habit_logs to support ON CONFLICT (user_id, habit_type, logged_at)
ALTER TABLE habit_logs
  ADD CONSTRAINT uq_habit_logs_user_type_logged UNIQUE (user_id, habit_type, logged_at);

-- 2. Drop the incorrect versions from migration 020
DROP FUNCTION IF EXISTS calculate_streak(UUID, TEXT);
DROP FUNCTION IF EXISTS get_user_streaks(UUID);
DROP FUNCTION IF EXISTS get_habit_stats(UUID, TEXT, INTEGER);

-- 3. Restore the correct calculate_streak with correct signature and schema fields
-- CREATE OR REPLACE FUNCTION calculate_streak(
--   p_user_id UUID,
--   p_habit_type TEXT
-- )
-- RETURNS TABLE(
--   current_streak INTEGER,
--   longest_streak INTEGER
-- ) 
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public, pg_temp
-- AS $$
-- DECLARE
--   v_dates DATE[];
--   v_current_streak INTEGER := 0;
--   v_longest_streak INTEGER := 0;
--   v_temp_streak INTEGER := 0;
--   v_prev_date DATE;
--   v_current_date DATE;
--   v_today DATE := CURRENT_DATE;
--   i INTEGER;
-- BEGIN
--   -- Get unique dates for the habit, sorted descending (most recent first)
--   SELECT ARRAY_AGG(DISTINCT logged_at::DATE ORDER BY logged_at::DATE DESC)
--   INTO v_dates
--   FROM habit_logs
--   WHERE user_id = p_user_id 
--     AND habit_type = p_habit_type
--     AND completed = true
--     AND logged_at::DATE <= v_today;

--   -- If no data, return zeros
--   IF v_dates IS NULL OR array_length(v_dates, 1) = 0 THEN
--     current_streak := 0;
--     longest_streak := 0;
--     RETURN NEXT;
--     RETURN;
--   END IF;

--   -- Calculate current streak
--   v_current_date := v_today;
  
--   IF v_dates[1] = v_today THEN
--     v_current_streak := 1;
--     v_prev_date := v_today;
--   ELSIF v_dates[1] = v_today - INTERVAL '1 day' THEN
--     v_current_streak := 1;
--     v_prev_date := v_today - INTERVAL '1 day';
--   ELSE
--     v_current_streak := 0;
--     v_prev_date := NULL;
--   END IF;

--   IF v_current_streak > 0 THEN
--     FOR i IN 2..array_length(v_dates, 1) LOOP
--       IF v_dates[i] = v_prev_date - INTERVAL '1 day' THEN
--         v_current_streak := v_current_streak + 1;
--         v_prev_date := v_dates[i];
--       ELSE
--         EXIT;
--       END IF;
--     END LOOP;
--   END IF;

--   -- Calculate longest streak
--   v_temp_streak := 1;
--   v_longest_streak := 1;
  
--   FOR i IN 2..array_length(v_dates, 1) LOOP
--     IF v_dates[i-1] - v_dates[i] = 1 THEN
--       v_temp_streak := v_temp_streak + 1;
--       v_longest_streak := GREATEST(v_longest_streak, v_temp_streak);
--     ELSE
--       v_temp_streak := 1;
--     END IF;
--   END LOOP;

--   v_longest_streak := GREATEST(v_longest_streak, v_current_streak);

--   current_streak := v_current_streak;
--   longest_streak := v_longest_streak;
--   RETURN NEXT;
-- END;
-- $$;

-- 4. Restore the correct get_user_streaks returning the correct table format
-- CREATE OR REPLACE FUNCTION get_user_streaks(p_user_id UUID)
-- RETURNS TABLE(
--   meditation_current_streak INTEGER,
--   meditation_longest_streak INTEGER,
--   cold_shower_current_streak INTEGER,
--   cold_shower_longest_streak INTEGER,
--   early_wakeup_current_streak INTEGER,
--   early_wakeup_longest_streak INTEGER,
--   exercise_current_streak INTEGER,
--   exercise_longest_streak INTEGER
-- )
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public, pg_temp
-- AS $$
-- DECLARE
--   v_meditation_current INTEGER := 0;
--   v_meditation_longest INTEGER := 0;
--   v_cold_shower_current INTEGER := 0;
--   v_cold_shower_longest INTEGER := 0;
--   v_early_wakeup_current INTEGER := 0;
--   v_early_wakeup_longest INTEGER := 0;
--   v_exercise_current INTEGER := 0;
--   v_exercise_longest INTEGER := 0;
-- BEGIN
--   SELECT cs.current_streak, cs.longest_streak
--   INTO v_meditation_current, v_meditation_longest
--   FROM calculate_streak(p_user_id, 'meditation') cs;

--   SELECT cs.current_streak, cs.longest_streak
--   INTO v_cold_shower_current, v_cold_shower_longest
--   FROM calculate_streak(p_user_id, 'cold_shower') cs;

--   SELECT cs.current_streak, cs.longest_streak
--   INTO v_early_wakeup_current, v_early_wakeup_longest
--   FROM calculate_streak(p_user_id, 'early_wakeup') cs;

--   SELECT cs.current_streak, cs.longest_streak
--   INTO v_exercise_current, v_exercise_longest
--   FROM calculate_streak(p_user_id, 'exercise') cs;

--   meditation_current_streak := v_meditation_current;
--   meditation_longest_streak := v_meditation_longest;
--   cold_shower_current_streak := v_cold_shower_current;
--   cold_shower_longest_streak := v_cold_shower_longest;
--   early_wakeup_current_streak := v_early_wakeup_current;
--   early_wakeup_longest_streak := v_early_wakeup_longest;
--   exercise_current_streak := v_exercise_current;
--   exercise_longest_streak := v_exercise_longest;

--   RETURN NEXT;
-- END;
-- $$;

-- 5. Restore the correct get_habit_stats returning the correct table format
-- CREATE OR REPLACE FUNCTION get_habit_stats(
--   p_user_id UUID,
--   p_habit_type TEXT,
--   p_days_back INTEGER DEFAULT 30
-- )
-- RETURNS TABLE(
--   current_streak INTEGER,
--   longest_streak INTEGER,
--   total_days INTEGER,
--   completion_rate DECIMAL,
--   days_this_week INTEGER,
--   days_this_month INTEGER
-- )
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public, pg_temp
-- AS $$
-- DECLARE
--   v_current_streak INTEGER := 0;
--   v_longest_streak INTEGER := 0;
--   v_total_days INTEGER := 0;
--   v_completion_rate DECIMAL := 0;
--   v_days_this_week INTEGER := 0;
--   v_days_this_month INTEGER := 0;
--   v_possible_days INTEGER;
-- BEGIN
--   SELECT cs.current_streak, cs.longest_streak
--   INTO v_current_streak, v_longest_streak
--   FROM calculate_streak(p_user_id, p_habit_type) cs;

--   SELECT COUNT(DISTINCT logged_at::DATE)
--   INTO v_total_days
--   FROM habit_logs
--   WHERE user_id = p_user_id 
--     AND habit_type = p_habit_type
--     AND completed = true
--     AND logged_at >= CURRENT_DATE - INTERVAL '1 day' * p_days_back;

--   v_possible_days := LEAST(p_days_back, 
--     EXTRACT(days FROM CURRENT_DATE - (
--       SELECT MIN(logged_at::DATE) 
--       FROM habit_logs 
--       WHERE user_id = p_user_id AND habit_type = p_habit_type AND completed = true
--     ))::INTEGER + 1
--   );
  
--   IF v_possible_days > 0 THEN
--     v_completion_rate := ROUND((v_total_days::DECIMAL / v_possible_days) * 100, 2);
--   END IF;

--   SELECT COUNT(DISTINCT logged_at::DATE)
--   INTO v_days_this_week
--   FROM habit_logs
--   WHERE user_id = p_user_id 
--     AND habit_type = p_habit_type
--     AND completed = true
--     AND logged_at >= DATE_TRUNC('week', CURRENT_DATE);

--   SELECT COUNT(DISTINCT logged_at::DATE)
--   INTO v_days_this_month
--   FROM habit_logs
--   WHERE user_id = p_user_id 
--     AND habit_type = p_habit_type
--     AND completed = true
--     AND logged_at >= DATE_TRUNC('month', CURRENT_DATE);

--   current_streak := v_current_streak;
--   longest_streak := v_longest_streak;
--   total_days := v_total_days;
--   completion_rate := v_completion_rate;
--   days_this_week := v_days_this_week;
--   days_this_month := v_days_this_month;

--   RETURN NEXT;
-- END;
-- $$;
