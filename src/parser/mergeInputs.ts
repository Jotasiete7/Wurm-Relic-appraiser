import type {
  WurmItem, ScreenshotItem, ExamineEntry,
  ItemCategory, ItemRarity,
} from '../types';
import { getItemCategory } from '../data/itemCategoryMap';
import { learnMapping } from '../utils/learnedDictionary';
import { reportMappingToServer } from '../utils/communityDictionary';

let _idCounter = 0;
function genId(): string {
  return `item_${++_idCounter}`;
}

function normalizeForMatch(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function deobfuscateMaker(maker: string | null): string {
  if (!maker) return '';
  return maker.replace(/\./g, '').toLowerCase();
}

function matchesMaker(maker: string | null, note: string | null): boolean {
  if (!maker || !note) return false;
  const cleanMaker = deobfuscateMaker(maker);
  if (!cleanMaker) return false;
  return note.toLowerCase().includes(cleanMaker);
}

function defaultItem(): Omit<WurmItem, 'id' | 'rawName' | 'normalizedName' | 'dataSource'> {
  return {
    metal:          null,
    rarity:         'common',
    category:       'tool_craft',
    ql:             null,
    damage:         null,
    runes:          [],
    enchants:       [],
    imbuis:         [],
    playerNote:     null,
    playerTierTag:  null,
    maker:          null,
    score:          0,
    tier:           'Trash',
    scoreBreakdown: { runePoints: 0, enchantPoints: 0, metalBonus: 0, rarityBonus: 0, total: 0, effectsScored: [], enchantsScored: [] },
    descriptionRaw: undefined,
  };
}

/**
 * Builds the final WurmItem list from up to two sources.
 * Either source may be empty (mode A / mode C).
 */
export function mergeInputs(
  screenshotItems: ScreenshotItem[],
  examineEntries: ExamineEntry[],
): WurmItem[] {
  const result: WurmItem[] = [];

  // Index examine entries by normalizedName for fast lookup.
  // Multiple entries with the same name are stored as an array (same item, different rune sets).
  const examineMap = new Map<string, ExamineEntry[]>();
  for (const entry of examineEntries) {
    const key = normalizeForMatch(entry.normalizedName);
    if (!examineMap.has(key)) examineMap.set(key, []);
    examineMap.get(key)!.push(entry);
  }

  const usedExamineKeys = new Set<string>();

  // --- Process screenshot items ---
  for (const ss of screenshotItems) {
    const key = normalizeForMatch(ss.normalizedName);
    const matchingEntries = examineMap.get(key) ?? [];
    
    // Pick the first unused examine entry for this exact name, or disambiguate
    const unusedEntries = matchingEntries.filter(
      e => !usedExamineKeys.has(`${key}_${matchingEntries.indexOf(e)}`)
    );

    let examineEntry: ExamineEntry | undefined = undefined;
    if (unusedEntries.length > 0) {
      if (unusedEntries.length > 1 && ss.playerNote) {
        examineEntry = unusedEntries.find(e => matchesMaker(e.maker, ss.playerNote));
      }
      if (!examineEntry) {
        examineEntry = unusedEntries[0];
      }
    }

    let entryIdx = examineEntry ? matchingEntries.indexOf(examineEntry) : -1;
    let usedKey = key;

    // Fallback: If exact match fails, try substring matching (helps with OCR typos like 'rarefile' or variants like 'mountain lion pelt' vs 'pelt')
    if (!examineEntry) {
      for (const [eKey, entries] of examineMap.entries()) {
        if (key.includes(eKey) || eKey.includes(key)) {
          const fallbackEntry = entries.find(e => !usedExamineKeys.has(`${eKey}_${entries.indexOf(e)}`));
          if (fallbackEntry) {
            examineEntry = fallbackEntry;
            entryIdx = entries.indexOf(fallbackEntry);
            usedKey = eKey;
            break;
          }
        }
      }
    }

    if (entryIdx >= 0) usedExamineKeys.add(`${usedKey}_${entryIdx}`);

    const category: ItemCategory = getItemCategory(ss.normalizedName) ?? 'tool_craft';
    // Rarity: trust screenshot; fallback to examine
    const rarity: ItemRarity = ss.rarity !== 'common'
      ? ss.rarity
      : (examineEntry?.rarity ?? 'common');

    const item: WurmItem = {
      ...defaultItem(),
      id:             genId(),
      rawName:        ss.rawName,
      normalizedName: examineEntry ? examineEntry.normalizedName : ss.normalizedName,
      metal:          ss.metal,
      rarity,
      category,
      ql:             ss.ql,
      damage:         ss.damage,
      playerNote:     ss.playerNote,
      runes:          examineEntry?.runes ?? [],
      enchants:       examineEntry?.enchants ?? [],
      imbuis:         examineEntry?.imbuis ?? [],
      maker:          examineEntry?.maker ?? null,
      dataSource:     examineEntry ? 'merged' : 'screenshot_only',
      descriptionRaw: examineEntry?.descriptionRaw,
    };

    // ── Auto-learning: if examine was 'unknown' but screenshot gave us the real name,
    //    learn the description→name mapping for future sessions ──
    if (
      examineEntry &&
      examineEntry.descriptionRaw &&
      ss.normalizedName &&
      ss.normalizedName !== 'unknown'
    ) {
      // Learn locally (localStorage)
      learnMapping(examineEntry.descriptionRaw, ss.normalizedName);
      // Report to Supabase for community benefit (fire-and-forget)
      reportMappingToServer(examineEntry.descriptionRaw, ss.normalizedName);
    }

    result.push(item);
  }

  // --- Process examine-only entries (no matching screenshot item) ---
  for (const entry of examineEntries) {
    const key = normalizeForMatch(entry.normalizedName);
    const entries = examineMap.get(key) ?? [];
    const idx = entries.indexOf(entry);
    if (usedExamineKeys.has(`${key}_${idx}`)) continue; // Already merged

    const category: ItemCategory = getItemCategory(entry.normalizedName) ?? 'tool_craft';

    const item: WurmItem = {
      ...defaultItem(),
      id:             genId(),
      rawName:        entry.descriptionRaw,
      normalizedName: entry.normalizedName,
      rarity:         entry.rarity,
      category,
      runes:          entry.runes,
      enchants:       entry.enchants,
      imbuis:         entry.imbuis,
      maker:          entry.maker,
      dataSource:     'examine_only',
      descriptionRaw: entry.descriptionRaw,
    };

    result.push(item);
  }

  return result;
}
