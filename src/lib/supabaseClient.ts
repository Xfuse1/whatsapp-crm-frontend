import { createClient } from '@supabase/supabase-js';
import { config } from './env';

export const supabaseBrowserClient = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
  {
    auth: {
      persistSession: false, // Disable auto session persistence for now
      autoRefreshToken: false, // Disable auto token refresh
    },
  }
);
