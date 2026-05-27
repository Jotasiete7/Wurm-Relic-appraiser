/**
 * Community-sourced dictionary — downloads validated description→name mappings
 * from Supabase (crowdsourced from all users) and caches locally.
 *
 * - On app load: fetches mappings with 3+ votes (single lightweight query).
 * - Cache TTL: 24 hours in localStorage.
 * - Reports new learned mappings to Supabase (debounced, non-blocking).
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';

const CACHE_KEY = 'wurm_community_dictionary';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

interface CacheData {
  mappings: Record<string, string>;  // description_key → normalized_name
  fetchedAt: number;
}

// In-memory store loaded from cache or Supabase
let communityDict: Record<string, string> = {};
let isLoaded = false;

/**
 * Load the community dictionary from cache or Supabase.
 * Call this once during app initialization.
 */
export async function loadCommunityDictionary(): Promise<void> {
  // 1. Try to load from localStorage cache first
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached: CacheData = JSON.parse(raw);
      if (Date.now() - cached.fetchedAt < CACHE_TTL) {
        communityDict = cached.mappings;
        isLoaded = true;
        console.log(`%c[Community Dict] Carregado do cache local: ${Object.keys(communityDict).length} mapeamentos`, 'color: #8b5cf6;');
        return;
      }
    }
  } catch {
    // Cache corrupted — continue to fetch
  }

  // 2. Fetch from Supabase
  if (!isSupabaseConfigured || !supabase) {
    console.log('[Community Dict] Supabase não configurado — dicionário comunitário desativado.');
    isLoaded = true;
    return;
  }

  try {
    const { data, error } = await supabase.rpc('get_community_dictionary');

    if (error) {
      console.warn('[Community Dict] Erro ao carregar dicionário:', error.message);
      isLoaded = true;
      return;
    }

    if (Array.isArray(data)) {
      communityDict = {};
      for (const row of data) {
        communityDict[row.description_key] = row.normalized_name;
      }

      // Save to localStorage cache
      const cacheData: CacheData = {
        mappings: communityDict,
        fetchedAt: Date.now(),
      };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch { /* quota exceeded — ignore */ }

      console.log(`%c[Community Dict] Carregado do Supabase: ${Object.keys(communityDict).length} mapeamentos validados`, 'color: #8b5cf6; font-weight: bold;');
    }
  } catch (err) {
    console.warn('[Community Dict] Falha na conexão com Supabase:', err);
  }

  isLoaded = true;
}

/**
 * Look up a description in the community dictionary.
 */
export function lookupCommunity(description: string): string | null {
  if (!isLoaded) return null;

  const match = description.match(/^([^.]+)/);
  const key = match ? match[1].toLowerCase().trim() : description.toLowerCase().trim();

  return communityDict[key] ?? null;
}

/**
 * Report a learned mapping to Supabase for community benefit.
 * Non-blocking, fire-and-forget. Won't report if Supabase is not configured.
 */
export async function reportMappingToServer(description: string, normalizedName: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  if (!description || !normalizedName || normalizedName === 'unknown') return;

  const descKey = description.match(/^([^.]+)/)?.[1]?.toLowerCase().trim();
  if (!descKey || descKey.length < 5) return;

  try {
    const { error } = await supabase.rpc('report_learned_mapping', {
      p_description: descKey,
      p_name: normalizedName.toLowerCase().trim(),
    });

    if (error) {
      console.warn('[Community Dict] Erro ao reportar mapeamento:', error.message);
    } else {
      console.log(`%c[Community Dict] Mapeamento reportado: "${descKey}" → "${normalizedName}"`, 'color: #8b5cf6; font-style: italic;');
    }
  } catch {
    // Network error — silently ignore
  }
}

/** Returns true if the community dictionary has been loaded */
export function isCommunityDictLoaded(): boolean {
  return isLoaded;
}

/** Returns the number of community mappings loaded */
export function getCommunityDictSize(): number {
  return Object.keys(communityDict).length;
}
