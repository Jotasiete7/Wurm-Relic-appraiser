import type {
  WurmItem, ScreenshotItem, ExamineEntry,
  ItemCategory, ItemRarity, MetalType, Tier,
} from '../types';
import { getItemCategory } from '../data/itemCategoryMap';

let _idCounter = 0;
function genId(): string {
  return `item_${++_idCounter}`;
}

function normalizeForMatch(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
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
    playerNote:     null,
    playerTierTag:  null,
    score:          0,
    tier:           'Trash',
    scoreBreakdown: { runePoints: 0, metalBonus: 0, rarityBonus: 0, total: 0, effectsScored: [] },
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
    
    // Pick the first unused examine entry for this exact name
    let examineEntry = matchingEntries.find(
      e => !usedExamineKeys.has(`${key}_${matchingEntries.indexOf(e)}`)
    );
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
      normalizedName: ss.normalizedName,
      metal:          ss.metal,
      rarity,
      category,
      ql:             ss.ql,
      damage:         ss.damage,
      playerNote:     ss.playerNote,
      runes:          examineEntry?.runes ?? [],
      enchants:       examineEntry?.enchants ?? [],
      dataSource:     examineEntry ? 'merged' : 'screenshot_only',
      descriptionRaw: examineEntry?.descriptionRaw,
    };

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
      dataSource:     'examine_only',
      descriptionRaw: entry.descriptionRaw,
    };

    result.push(item);
  }

  return result;
}
