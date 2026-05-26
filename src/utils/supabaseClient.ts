import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// As novas chaves 'sb_publishable_' do Supabase não são JWTs estruturados.
// Se passadas no cabeçalho 'Authorization: Bearer sb_publishable_...', o gateway do Supabase
// tenta descriptografar como JWT e retorna erro 401 (JWTSignatureError).
// Para corrigir isso automaticamente no SDK, limpamos o header Authorization global se for uma nova chave,
// forçando o uso exclusivo do header 'apikey' que funciona perfeitamente para acesso anônimo!
const isNewKeyFormat = supabaseAnonKey.trim().startsWith('sb_publishable_');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: isNewKeyFormat
          ? { Authorization: '' }
          : {},
      },
    })
  : null;
