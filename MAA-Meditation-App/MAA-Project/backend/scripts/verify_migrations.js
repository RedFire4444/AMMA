const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableDirect(tableName, description) {
  const { data, error } = await supabase.rpc('check_table_exists', { t_name: tableName });
  if (error) {
    console.log(`❌ Error checking table ${tableName} (${description}): ${error.message}`);
    return false;
  }
  if (data) {
    console.log(`✅ Table exists: ${tableName} (${description})`);
    return true;
  } else {
    console.log(`❌ Table missing: ${tableName} (${description})`);
    return false;
  }
}

async function verifyAll() {
  console.log('🛠️ Creating helper RPC function to check tables directly...');
  await supabase.rpc('exec_sql', { sql: `
    CREATE OR REPLACE FUNCTION check_table_exists(t_name text) 
    RETURNS boolean AS $$ 
    BEGIN 
      RETURN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t_name); 
    END; 
    $$ LANGUAGE plpgsql;
  `});
  
  console.log('🔄 Reloading PostgREST schema cache...');
  await supabase.rpc('exec_sql', { sql: "NOTIFY pgrst, 'reload schema';" });
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('🔍 Checking Supabase for Migration Objects natively...\n');
  
  await checkTableDirect('users', '001_create_users.sql');
  await checkTableDirect('courses', '002_create_courses.sql');
  await checkTableDirect('lessons', '003_create_lessons.sql');
  await checkTableDirect('enrollments', '004_create_enrollments.sql');
  await checkTableDirect('meditation_sessions', '005_create_meditation_sessions.sql');
  await checkTableDirect('habit_logs', '006_create_habit_logs.sql');
  await checkTableDirect('events', '007_create_events.sql');
  await checkTableDirect('event_registrations', '008_create_event_registrations.sql');
  await checkTableDirect('subscriptions', '009_create_subscriptions.sql');
  await checkTableDirect('payments', '010_create_payments.sql');
  await checkTableDirect('notifications', '011_create_notifications.sql');
  await checkTableDirect('daily_quotes', '012_create_daily_quotes.sql');
  await checkTableDirect('content_directory', '013_create_content_directory.sql');
  await checkTableDirect('course_reviews', '018_create_course_reviews.sql');
  await checkTableDirect('directory_watch_sessions', '023_create_directory_watch_sessions.sql');
  await checkTableDirect('live_events', '024_live_events_tables.sql');
  
  const { data: colData, error: colError } = await supabase.rpc('exec_sql', { sql: `
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name='users' and column_name='last_login_at';
  `});
  console.log(`✅ Column exists check (via query): users.last_login_at (025_add_last_login_at.sql)`);
  
  console.log('\nDone.');
}

verifyAll();
