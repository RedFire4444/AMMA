import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import Config from 'react-native-config';

const supabaseUrl = Config.SUPABASE_URL ?? '';
const supabaseAnonKey = Config.SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing SUPABASE_URL or SUPABASE_ANON_KEY. ' +
    'Create a .env file in the mobile directory with your Supabase credentials.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
