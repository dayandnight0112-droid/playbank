import { createClient } from '@supabase/supabase-js';

const env = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env
  : (typeof process !== 'undefined' ? process.env : {});

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://odphibljvpdhfsnkhoqs.supabase.co';
const supabasePublishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_f9gWOUEV7TGcBF277zjTsQ_IXt9mbw3';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  !supabaseUrl.includes('your-project-ref')
);

/**
 * Global Supabase Client for PlayBank Player
 * Note: Only the public publishable/anon key is used here.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: typeof window !== 'undefined',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  : null;

/**
 * Diagnostic utility to check Supabase connection status
 */
export const checkSupabaseConnection = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      configured: false,
      message: 'Supabase URL or Publishable Key is missing in environment (.env).',
    };
  }

  try {
    const { data, error } = await supabase.from('published_chapters').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        configured: true,
        message: error.message,
      };
    }
    return {
      connected: true,
      configured: true,
      message: 'Successfully connected to PlayBank Supabase.',
    };
  } catch (err) {
    return {
      connected: false,
      configured: true,
      message: err.message || 'Network error connecting to Supabase.',
    };
  }
};
