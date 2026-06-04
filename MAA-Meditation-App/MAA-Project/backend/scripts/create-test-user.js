/**
 * Create Test User Script
 * Uses the Supabase Admin API to create a confirmed user with email and password.
 * Bypasses email verification so the user can log in immediately.
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  // Read arguments from terminal, or use defaults
  const email = process.argv[2] || 'testuser@example.com';
  const password = process.argv[3] || 'password123';

  console.log(`🚀 Creating user: ${email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true // Auto-confirm email so they can log in instantly
  });

  if (error) {
    console.error('❌ Failed to create user:', error.message);
    process.exit(1);
  }

  console.log('\n🎉 User created successfully!');
  console.log(`📧 Email:   ${data.user.email}`);
  console.log(`🔑 Password: ${password}`);
  console.log(`🆔 User ID:  ${data.user.id}`);
}

createTestUser();
