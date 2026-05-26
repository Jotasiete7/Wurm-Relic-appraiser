import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: (url, options) => {
          const headers = new Headers(options?.headers);
          // Se a chave for do formato novo 'sb_publishable_', removemos o header 'Authorization'
          // para evitar que o gateway do Supabase tente decodificar como JWT e retorne 401 (signature error).
          if (headers.has('Authorization')) {
            const authHeader = headers.get('Authorization') || '';
            if (authHeader.includes('sb_publishable_')) {
              headers.delete('Authorization');
            }
          }
          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    })
  : null;
