#!/usr/bin/env node
/**
 * get-streaks-by-email.js
 *
 * Usage: node get-streaks-by-email.js krupal@gmail.com
 *
 * Reads Supabase credentials from the repository's `credentialsSupabase.txt`,
 * finds the user by email (tries `users`, then `auth.users`), calls the
 * RPC `get_user_streaks` if available, or falls back to listing `habit_logs`.
 */

const fs = require('fs');
const path = require('path');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node get-streaks-by-email.js <email>');
    process.exit(2);
  }

  // Attempt to locate credentials file relative to this script
  const credsPath = path.resolve(__dirname, '..', '..', '..', '..', 'credentialsSupabase.txt');
  if (!fs.existsSync(credsPath)) {
    console.error('Credentials file not found at', credsPath);
    process.exit(1);
  }

  const contents = fs.readFileSync(credsPath, 'utf8');
  const urlMatch = contents.match(/^SUPABASE_URL=(.*)$/m);
  const keyMatch = contents.match(/^SUPABASE_SERVICE_ROLE_KEY=(.*)$/m);

  if (!urlMatch || !keyMatch) {
    console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in credentials file');
    process.exit(1);
  }

  const SUPABASE_URL = urlMatch[1].trim();
  const SUPABASE_SERVICE_ROLE_KEY = keyMatch[1].trim();

  // Lazy import of supabase client
  let createClient;
  try {
    ({ createClient } = require('@supabase/supabase-js'));
  } catch (e) {
    console.error('Please install @supabase/supabase-js in the backend project (npm install @supabase/supabase-js)');
    console.error(e.message);
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    console.log(`Looking up user by email: ${email}`);

    // Try public.users first
    let { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Querying public.users failed:', error.message);
    }

    if (!user) {
      // Try auth.users
      console.log('Not found in public.users — trying auth.users');
      const resp = await supabase
        .from('auth.users')
        .select('id, email')
        .eq('email', email)
        .limit(1)
        .maybeSingle();
      user = resp.data;
      if (resp.error) {
        console.warn('Querying auth.users failed:', resp.error.message);
      }
    }

    if (!user) {
      console.error('User not found for email:', email);
      process.exit(3);
    }

    const userId = user.id;
    console.log('Found user id:', userId);

    // Call calculate_streak RPC for meditation to observe exact return format
    console.log('Calling RPC calculate_streak (meditation)...');
    const calc = await supabase.rpc('calculate_streak', { p_user_id: userId, p_habit_type: 'meditation' });
    console.log('calculate_streak raw response:', { data: calc.data, error: calc.error });

    // Try RPC get_user_streaks once and fall back to habit_logs if it fails
    console.log('Calling RPC get_user_streaks...');
    const { data: streaks, error: rpcError } = await supabase.rpc('get_user_streaks', { p_user_id: userId });

    if (rpcError) {
      console.warn('RPC get_user_streaks failed:', rpcError.message);
      console.log('Falling back to listing habit_logs for user...');
      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('id, user_id, habit_type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (logsError) {
        console.error('Failed to query habit_logs:', logsError.message);
        process.exit(4);
      }
      console.log('Habit logs for user:', logs);
    } else {
      console.log('User streaks (from RPC):', streaks);
    }

  } catch (err) {
    console.error('Error while fetching streaks:', err && err.message ? err.message : err);
    process.exit(5);
  }

  process.exit(0);
}

main();
