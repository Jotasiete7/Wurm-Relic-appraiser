import type { ExamineEntry, ItemRarity, WurmRune } from '../types';
import { getRuneEffects } from '../data/runeEffectMap';
import { resolveItemName } from '../data/descriptionToName';

const TIMESTAMP_RE = /^\[\d{2}:\d{2}:\d{2}\]\s*/;
const RUNE_LINE_RE = /^A (\w+) rune of (\w+) has been attached/i;
const ENCHANT_LINE_RE = /^(.+?) has been cast on it[^[]*\[(\d+)\]/i;
const MAKER_LINE_RE = /^You can (?:barely|easily) make out the signature of its maker/i;
const OINTMENT_LINE_RE = /^It has been smeared with (.+?)(?:,|\.)/i;
const SKIP_LINE_RE = /^(Colors:|It is imbued|It could be improved|You need to)/i;

const RARITY_CHECKS: { pattern: RegExp; rarity: ItemRarity }[] = [
  { pattern: /very rare and interesting/i, rarity: 'rare'      },
  { pattern: /supreme example/i,           rarity: 'supreme'   },
  { pattern: /fantastic example/i,         rarity: 'fantastic' },
];

function isDescriptionLine(line: string): boolean {
  if (RUNE_LINE_RE.test(line)) return false;
  if (ENCHANT_LINE_RE.test(line)) return false;
  if (MAKER_LINE_RE.test(line)) return false;
  if (OINTMENT_LINE_RE.test(line)) return false;
  if (SKIP_LINE_RE.test(line)) return false;
  // Description lines in Wurm start with a capital letter.
  // We removed the A/An/The requirement because tools like Carving Knife start with "Made for carving"
  // and Scissors start with "Rough and clumsy". We also lowered length to 10 for "A small iron needle".
  return /^[A-Z]/i.test(line) && line.length > 10;
}

function extractRarity(line: string): ItemRarity {
  for (const { pattern, rarity } of RARITY_CHECKS) {
    if (pattern.test(line)) return rarity;
  }
  return 'common';
}

export function parseExamineLog(logText: string): ExamineEntry[] {
  const lines = logText
    .split(/\r?\n/)
    .map(l => l.replace(TIMESTAMP_RE, '').trim())
    .filter(l => l.length > 0);

  const entries: ExamineEntry[] = [];
  let current: ExamineEntry | null = null;

  function flush() {
    if (current) entries.push(current);
    current = null;
  }

  for (const line of lines) {
    if (SKIP_LINE_RE.test(line)) continue;

    if (isDescriptionLine(line)) {
      flush();
      const resolved = resolveItemName(line);
      current = {
        descriptionRaw: line,
        normalizedName: resolved ?? 'unknown',
        rarity: extractRarity(line),
        runes: [],
        enchants: [],
        maker: null,
        ointments: [],
      };
      continue;
    }

    if (!current) continue;

    // Maker signature
    if (MAKER_LINE_RE.test(line)) {
      const m = line.match(/'([^']+)'/);
      current.maker = m ? m[1] : null;
      continue;
    }

    // Ointment / oil / potion
    if (OINTMENT_LINE_RE.test(line)) {
      const m = line.match(OINTMENT_LINE_RE);
      if (m) current.ointments.push(m[1].trim());
      continue;
    }

    // Rune line
    const runeMatch = line.match(RUNE_LINE_RE);
    if (runeMatch) {
      const metal = runeMatch[1].toLowerCase();
      const god   = runeMatch[2].toLowerCase();
      const rawEffectString = line
        .replace(RUNE_LINE_RE, '')
        .replace(/^,?\s*so it will\s*/i, '')
        .trim();

      const effects = getRuneEffects(god, metal);
      const rune: WurmRune = {
        metal,
        god,
        effects: effects.length > 0 ? effects : ['UNKNOWN'],
        rawEffectString,
        source: effects.length > 0 ? 'crafted' : 'unknown',
      };
      current.runes.push(rune);
      continue;
    }

    // Enchant line
    const enchantMatch = line.match(ENCHANT_LINE_RE);
    if (enchantMatch) {
      current.enchants.push({
        name:  enchantMatch[1].trim(),
        power: parseInt(enchantMatch[2], 10) || 0,
      });
      continue;
    }
  }

  flush();

  // Filter out completely empty non-item entries
  return entries.filter(e =>
    e.normalizedName !== 'unknown' ||
    e.runes.length > 0 ||
    e.enchants.length > 0
  );
}
