import type { WurmItem, WurmRune, WurmEnchant, ItemRarity, MetalType, RuneEffect } from '../types';
import { getItemCategory } from '../data/itemCategoryMap';
import { getRuneEffects } from '../data/runeEffectMap';

// Strip timestamp prefix like [17:03:47]
const TIMESTAMP_PREFIX = /^\[\d{2}:\d{2}:\d{2}\]\s*/;

// Rarity detection in description text
const RARITY_MAP: { pattern: RegExp; rarity: ItemRarity }[] = [
  { pattern: /fantastic example/i,                   rarity: 'fantastic' },
  { pattern: /supreme example/i,                     rarity: 'supreme'   },
  { pattern: /very rare and interesting version/i,   rarity: 'rare'      },
];

// Rune line: "A lead rune of Fo has been attached, so it will ..."
const RUNE_LINE = /^A ([a-z]+) rune of ([A-Za-z]+) has been attached/i;

// Enchant line: "Wind of Ages has been cast on it... [95]"
const ENCHANT_LINE = /^(.+?) has been cast on it[^[]*\[(\d+)\]/i;

// QL line: "Ql: 74.52, Dam: 0.0."  (sometimes appears after description)
const QL_DAM = /Ql:\s*([\d.]+),\s*Dam:\s*([\d.]+)/i;

// Lines to skip entirely (not useful data)
const SKIP_PATTERNS = [
  /^You can (barely|easily) make out the signature/i,
  /^It is imbued with special abilities/i,
  /^It has been smeared with/i,
  /^Colors:/i,
  /^You need to/i,
  /^It could be improved/i,
];

// Known metals that appear in item descriptions (e.g. "iron staff", "steel shield")
const KNOWN_METALS = new Set<MetalType>([
  'iron', 'steel', 'copper', 'zinc', 'tin', 'lead',
  'gold', 'silver', 'brass', 'bronze', 'electrum',
  'seryll', 'glimmersteel', 'adamantine'
]);

// Map of description keywords -> item name
// Ordered from most-specific to least-specific so longer matches win.
const DESCRIPTION_ITEM_MAP: { keywords: string[]; name: string }[] = [
  // Mining / Stone
  { keywords: ['straight tool', 'strong hard blade', 'cutting stone'], name: 'stone chisel' },
  { keywords: ['cutting stone'],                                         name: 'stone chisel' },
  // Craft tools
  { keywords: ['hammer', 'metal head', 'wooden shaft'],                  name: 'hammer' },
  { keywords: ['metal hammer'],                                          name: 'hammer' },
  { keywords: ['mallet'],                                                name: 'mallet' },
  { keywords: ['file', 'metal blade', 'smoother'],                      name: 'file' },
  { keywords: ['rugged metal blade', 'smoother'],                       name: 'file' },
  { keywords: ['wood', 'smoother'],                                      name: 'file' },
  { keywords: ['saw', 'serrated'],                                       name: 'saw' },
  { keywords: ['chisel', 'wood carving'],                               name: 'chisel' },
  { keywords: ['awl', 'punching holes'],                                 name: 'awl' },
  { keywords: ['needle'],                                                name: 'needle' },
  { keywords: ['scissors'],                                              name: 'scissors' },
  { keywords: ['metal brush'],                                           name: 'metal brush' },
  // Archaeology
  { keywords: ['trowel', 'searching through dirt'],                      name: 'trowel' },
  { keywords: ['wide metal blade', 'construction', 'dirt and rocks'],   name: 'trowel' },
  // Gathering
  { keywords: ['rake'],                                                  name: 'rake' },
  { keywords: ['scythe'],                                                name: 'scythe' },
  { keywords: ['sickle'],                                                name: 'sickle' },
  { keywords: ['fishing rod'],                                           name: 'fishing rod' },
  // Knives — after "chisel" and "file"
  { keywords: ['carving knife', 'broad blade'],                         name: 'carving knife' },
  { keywords: ['carving', 'knife', 'broad blade'],                      name: 'carving knife' },
  { keywords: ['leather knife', 'carve in leather'],                    name: 'leather knife' },
  { keywords: ['carve in leather'],                                      name: 'leather knife' },
  { keywords: ['knife'],                                                 name: 'knife' },
  // Pickaxe
  { keywords: ['pickaxe'],                                              name: 'pickaxe' },
  { keywords: ['shovel', 'dirt'],                                       name: 'shovel' },
  // Weapons
  { keywords: ['longsword'],                                             name: 'longsword' },
  { keywords: ['shortsword'],                                            name: 'shortsword' },
  { keywords: ['maul'],                                                  name: 'maul' },
  { keywords: ['spear'],                                                 name: 'spear' },
  { keywords: ['hatchet'],                                               name: 'hatchet' },
  { keywords: ['axe'],                                                   name: 'axe' },
  { keywords: ['bow', 'arrows'],                                         name: 'bow' },
  { keywords: ['crossbow'],                                              name: 'crossbow' },
  { keywords: ['metal staff', 'shiny metal staff'],                     name: 'metal staff' },
  { keywords: ['staff', 'weapon'],                                       name: 'staff' },
  // Armor
  { keywords: ['open helm', 'open-faced'],                              name: 'open helm' },
  { keywords: ['helmet', 'head'],                                       name: 'helmet' },
  { keywords: ['helm'],                                                  name: 'helmet' },
  { keywords: ['breastplate', 'chest'],                                  name: 'breastplate' },
  { keywords: ['leggings', 'legs'],                                      name: 'leggings' },
  { keywords: ['gauntlets', 'hand'],                                     name: 'gauntlets' },
  { keywords: ['studded leather glove'],                                 name: 'studded leather glove' },
  { keywords: ['glove', 'metal studs'],                                  name: 'studded leather glove' },
  { keywords: ['boots', 'feet'],                                         name: 'boots' },
  { keywords: ['shield'],                                                name: 'shield' },
  { keywords: ['shoulder pad'],                                          name: 'shoulder pad' },
  // Containers
  { keywords: ['barrel'],                                                name: 'barrel' },
  { keywords: ['chest', 'storage'],                                      name: 'chest' },
  { keywords: ['satchel'],                                               name: 'satchel' },
  { keywords: ['backpack'],                                              name: 'backpack' },
  { keywords: ['toolbelt'],                                              name: 'toolbelt' },
];

function identifyItemFromDescription(description: string): string | null {
  const lower = description.toLowerCase();
  for (const entry of DESCRIPTION_ITEM_MAP) {
    if (entry.keywords.every(kw => lower.includes(kw))) {
      return entry.name;
    }
  }
  return null;
}

function extractRarityFromDescription(description: string): ItemRarity {
  for (const { pattern, rarity } of RARITY_MAP) {
    if (pattern.test(description)) return rarity;
  }
  return 'common';
}

function extractMetalFromDescription(description: string): MetalType | null {
  const lower = description.toLowerCase();
  for (const metal of KNOWN_METALS) {
    // Match metal as a whole word
    if (new RegExp(`\\b${metal}\\b`).test(lower)) {
      return metal;
    }
  }
  return null;
}

function isItemDescriptionLine(line: string): boolean {
  // Description lines start with an article or are descriptive sentences.
  // They are NOT rune/enchant lines.
  if (RUNE_LINE.test(line)) return false;
  if (ENCHANT_LINE.test(line)) return false;
  if (SKIP_PATTERNS.some(p => p.test(line))) return false;
  if (QL_DAM.test(line)) return false;

  // A description line typically starts with A/An/The or a capital letter describing something
  // Must contain some content keywords to distinguish from other game messages
  return /^(A |An |The |This )/i.test(line) && line.length > 20;
}

export function parseWurmLogs(logText: string): WurmItem[] {
  const lines = logText
    .split(/\r?\n/)
    .map(l => l.replace(TIMESTAMP_PREFIX, '').trim())
    .filter(l => l.length > 0);

  const itemsMap = new Map<string, WurmItem>();
  let currentItem: Partial<WurmItem> | null = null;

  for (const line of lines) {
    // Skip useless lines
    if (SKIP_PATTERNS.some(p => p.test(line))) continue;

    // Try to detect a new item description line
    if (isItemDescriptionLine(line)) {
      // Save the previous item if it has a known name
      if (currentItem && currentItem.normalizedName) {
        saveItem(currentItem as WurmItem, itemsMap);
      }

      const itemName = identifyItemFromDescription(line);
      const rarity = extractRarityFromDescription(line);
      const metal = extractMetalFromDescription(line);

      currentItem = {
        rawName: line,
        normalizedName: itemName ?? 'unknown item',
        metal,
        rarity,
        category: (itemName ? getItemCategory(itemName) : null) ?? 'tool_craft',
        runes: [],
        enchants: [],
        imbuis: [],
        playerTierTag: null,
        ql: 0,
        damage: 0,
        score: 0,
        tier: 'Trash',
        scoreBreakdown: { runePoints: 0, enchantPoints: 0, metalBonus: 0, rarityBonus: 0, total: 0, effectsScored: [], enchantsScored: [] }
      };
      continue;
    }

    if (!currentItem) continue;

    // QL/Dam line (if present)
    const qlMatch = line.match(QL_DAM);
    if (qlMatch) {
      currentItem.ql = parseFloat(qlMatch[1]) || 0;
      currentItem.damage = parseFloat(qlMatch[2]) || 0;
      continue;
    }

    // Rune line: "A lead rune of Fo has been attached, so it will..."
    const runeMatch = line.match(RUNE_LINE);
    if (runeMatch) {
      const metalName = runeMatch[1].toLowerCase();
      const god = runeMatch[2].toLowerCase();
      const rawEffectString = line.replace(RUNE_LINE, '').replace(/^,?\s*so it will\s*/i, '').trim();

      const effects = getRuneEffects(god, metalName);
      const hasEffects = effects.length > 0;

      currentItem.runes!.push({
        metal: metalName,
        god,
        effects: hasEffects ? effects : ['UNKNOWN'],
        rawEffectString,
        source: hasEffects ? 'crafted' : 'unknown',
      });
      continue;
    }

    // Enchant line: "Wind of Ages has been cast on it... [95]"
    const enchantMatch = line.match(ENCHANT_LINE);
    if (enchantMatch) {
      currentItem.enchants!.push({
        name: enchantMatch[1].trim(),
        power: parseInt(enchantMatch[2], 10) || 0,
      });
      continue;
    }
  }

  // Save the last item
  if (currentItem && currentItem.normalizedName) {
    saveItem(currentItem as WurmItem, itemsMap);
  }

  return Array.from(itemsMap.values());
}

function saveItem(item: WurmItem, map: Map<string, WurmItem>) {
  // Skip truly unidentified items with no runes or enchants
  if (item.normalizedName === 'unknown item' && item.runes!.length === 0 && item.enchants!.length === 0) {
    return;
  }
  const key = `${item.normalizedName}_${Number(item.ql).toFixed(2)}_${item.runes!.length}`;
  map.set(key, item);
}
