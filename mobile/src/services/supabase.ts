import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Ensure you replace these with values from the .env or Krupal's config
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
