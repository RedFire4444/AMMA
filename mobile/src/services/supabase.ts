import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Configuration — set these in a .env file and load via react-native-config,
// or replace with your project's actual values for development.
// NEVER commit real credentials to source control.
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials not configured. ' +
    'Set SUPABASE_URL and SUPABASE_ANON_KEY in mobile/src/services/supabase.ts ' +
    'or configure react-native-config with a .env file.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
