export type RuneEffect =
  | 'USAGE_SPEED' | 'LESS_DAMAGE_TAKEN' | 'LESS_QL_LOSS_REPAIR'
  | 'GATHER_QUALITY' | 'IMPROVE_CHANCE' | 'MORE_QL_IMPED'
  | 'LESS_DECAY' | 'LESS_DECAY_CONTENTS' | 'ENCHANT_POWER'
  | 'ENCHANT_SUCCESS' | 'LESS_ENCHANT_DECAY' | 'RARITY_CHANCE'
  | 'SKILL_BONUS' | 'LESS_FUEL' | 'SHATTER_RESIST' | 'LESS_WEIGHT'
  | 'VOLUME_INCREASE' | 'VOLUME_DECREASE' | 'RAKING_HARVESTING'
  | 'WIND_SPEED' | 'VEHICLE_SPEED' | 'SPELL' | 'GLOW' | 'COLOR'
  | 'UNKNOWN';

export type ItemCategory =
  | 'tool_craft' | 'tool_mining' | 'tool_gather'
  | 'tool_misc' | 'weapon' | 'armor' | 'container';

export type ItemRarity = 'common' | 'rare' | 'supreme' | 'fantastic';

export type MetalType = string; // Was limited to metals, now accepts any material string

export type Tier = 'S' | 'A' | 'B' | 'C' | 'Trash';

export type DataSource = 'screenshot_only' | 'examine_only' | 'merged';

export interface WurmRune {
  metal: string;
  god: string;
  effects: RuneEffect[];
  rawEffectString: string;
  source: 'crafted' | 'scavenger' | 'unknown';
}

export interface WurmEnchant {
  name: string;
  power: number;
}

export interface ScoreBreakdown {
  runePoints: number;
  metalBonus: number;
  rarityBonus: number;
  total: number;
  effectsScored: { effect: RuneEffect; points: number; runeName: string }[];
}

export interface WurmItem {
  id: string;
  rawName: string;
  normalizedName: string;
  metal: MetalType | null;       // null if only examine log was provided
  rarity: ItemRarity;
  category: ItemCategory;        // defaults to tool_craft if unknown
  ql: number | null;             // null if only examine log was provided
  damage: number | null;
  runes: WurmRune[];
  enchants: WurmEnchant[];
  playerNote: string | null;     // text in parens from screenshot — display only
  playerTierTag: Tier | null;
  score: number;
  tier: Tier;
  scoreBreakdown: ScoreBreakdown;
  dataSource: DataSource;
  descriptionRaw?: string;       // raw description for unknown items UI
}

// Intermediate type from examine log before merge
export interface ExamineEntry {
  descriptionRaw: string;
  normalizedName: string;        // resolved from DESCRIPTION_TO_NAME, or 'unknown'
  rarity: ItemRarity;
  runes: WurmRune[];
  enchants: WurmEnchant[];
  maker: string | null;
  ointments: string[];
}

// Intermediate type from screenshot OCR/text before merge
export interface ScreenshotItem {
  rawName: string;
  normalizedName: string;
  metal: MetalType | null;
  rarity: ItemRarity;
  ql: number;
  damage: number;
  playerNote: string | null;
}
