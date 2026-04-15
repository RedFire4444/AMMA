import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { SecureStore } from '../utils/keychain';

// Supabase expectations for a storage adapter
const keychainAdapter = {
  getItem: (key: string) => SecureStore.getToken(key),
  setItem: (key: string, value: string) => SecureStore.saveToken(key, value),
  removeItem: (key: string) => SecureStore.deleteToken(key),
};

// Configuration
const SUPABASE_URL = 'https://lbviqtrxwxybpbjnalrc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidmlxdHJ4d3h5YnBiam5hbHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzU3MDIsImV4cCI6MjA5MDYxMTcwMn0.4f6iHFW432RsJ4C0rF5_uaH6O1hGEf4l-Sx93D6glZk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: keychainAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
