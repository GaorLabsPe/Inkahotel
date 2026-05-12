import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseSchema = import.meta.env.VITE_SUPABASE_SCHEMA || 'public';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. The app will run in offline mode.');
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      db: {
        schema: supabaseSchema,
      },
    })
  : ({
      from: () => ({
        select: () => ({ single: () => Promise.resolve({ data: null, error: null }), eq: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: null, error: null }) }),
        insert: () => Promise.resolve({ data: null, error: null }),
        upsert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      })
    } as any);

