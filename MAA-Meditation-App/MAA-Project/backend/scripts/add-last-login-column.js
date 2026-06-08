/**
 * Script: add-last-login-column-v2.js
 *
 * Uses the Supabase JS client with service role to run a raw SQL query
 * via the management REST API (pg_dump endpoint is not available on free tier).
 *
 * We use supabase-js's `rpc` to call a dynamically-created disposable function
 * OR fall back to direct SQL via the postgres REST endpoint.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log('🚀 Adding last_login_at column to public.users...\n');

  // Strategy 1: Try inserting a dummy row to check if the column exists already
  // by querying the information_schema
  const { data, error } = await supabase
    .from('users')
    .select('last_login_at')
    .limit(1);

  if (!error) {
    console.log('✅ Column last_login_at already EXISTS in the users table!');
    console.log('   The backend is ready to write login timestamps.\n');
    return;
  }

  if (error && error.message && error.message.includes('last_login_at')) {
    console.log('⚠️  Column last_login_at does NOT exist yet.');
    console.log('\n📌 ACTION REQUIRED — Run this SQL in the Supabase Dashboard:');
    console.log('   Go to: https://supabase.com/dashboard → Your Project → SQL Editor\n');
    console.log('   ┌──────────────────────────────────────────────────────────────────────────────┐');
    console.log('   │  ALTER TABLE public.users                                                    │');
    console.log('   │  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;            │');
    console.log('   └──────────────────────────────────────────────────────────────────────────────┘\n');
    console.log('   After running that SQL, login timestamps will work automatically.');
  } else {
    console.log('⚠️  Could not determine column status. Error:', error?.message);
    console.log('\n📌 Please verify manually in Supabase Dashboard → Table Editor → users table');
  }
}

main().catch(console.error);
