/**
 * Self-learning dictionary that persists description→name mappings in localStorage.
 * When a screenshot item (which has the exact name via OCR) is merged with an
 * examine-only item (which only has a raw description), we learn the mapping
 * and can resolve it automatically in future sessions.
 *
 * Storage key: 'wurm_learned_dictionary'
 * Max entries: 500 (LRU eviction)
 */

const STORAGE_KEY = 'wurm_learned_dictionary';
const MAX_ENTRIES = 500;

interface LearnedEntry {
  name: string;
  usedAt: number; // timestamp for LRU
}

type LearnedDict = Record<string, LearnedEntry>;

function loadDict(): LearnedDict {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LearnedDict;
  } catch {
    return {};
  }
}

function saveDict(dict: LearnedDict): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dict));
  } catch {
    // localStorage full — evict oldest entries and retry
    const entries = Object.entries(dict).sort((a, b) => a[1].usedAt - b[1].usedAt);
    const trimmed: LearnedDict = {};
    const keep = Math.floor(entries.length * 0.7); // keep 70%
    entries.slice(entries.length - keep).forEach(([k, v]) => {
      trimmed[k] = v;
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // give up silently
    }
  }
}

function normalizeKey(description: string): string {
  // Extract first sentence (up to first period), lowercase, trim — same logic as descriptionToName
  const match = description.match(/^([^.]+)/);
  const sentence = match ? match[1] : description;
  return sentence.toLowerCase().trim();
}

/**
 * Learn a new description→name mapping.
 * Won't learn mappings to 'unknown' or empty strings.
 */
export function learnMapping(description: string, normalizedName: string): void {
  if (!description || !normalizedName) return;
  if (normalizedName === 'unknown' || normalizedName.trim() === '') return;

  const key = normalizeKey(description);
  if (!key || key.length < 5) return; // too short to be meaningful

  const dict = loadDict();

  // Already known with same value — just update timestamp
  if (dict[key]?.name === normalizedName) {
    dict[key].usedAt = Date.now();
    saveDict(dict);
    return;
  }

  // LRU eviction if at capacity
  const keys = Object.keys(dict);
  if (keys.length >= MAX_ENTRIES) {
    const oldest = keys.reduce((a, b) => (dict[a].usedAt < dict[b].usedAt ? a : b));
    delete dict[oldest];
  }

  dict[key] = { name: normalizedName, usedAt: Date.now() };
  saveDict(dict);

  console.log(`%c[Learned Dict] Novo mapeamento: "${key}" → "${normalizedName}"`, 'color: #10b981; font-style: italic;');
}

/**
 * Look up a description in the learned dictionary.
 * Returns the normalized name if found, null otherwise.
 */
export function lookupLearned(description: string): string | null {
  const key = normalizeKey(description);
  if (!key) return null;

  const dict = loadDict();
  const entry = dict[key];
  if (!entry) return null;

  // Update LRU timestamp
  entry.usedAt = Date.now();
  saveDict(dict);

  return entry.name;
}

/**
 * Returns a snapshot of all learned mappings (for reporting to Supabase).
 */
export function getLearnedMappings(): Array<{ description: string; name: string }> {
  const dict = loadDict();
  return Object.entries(dict).map(([desc, entry]) => ({
    description: desc,
    name: entry.name,
  }));
}

/** Returns the number of learned entries. */
export function getLearnedCount(): number {
  return Object.keys(loadDict()).length;
}
