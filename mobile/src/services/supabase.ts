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
const SUPABASE_URL = 'https://sachpwffbahripgsscsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhY2hwd2ZmYmFocmlwZ3NzY3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NDE4NDUsImV4cCI6MjA5NDQxNzg0NX0.U77nu2IO0yY5b1f9A5anwhYMWFRSLzPFXFptCc1yQ1A';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: keychainAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
