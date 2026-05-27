import type { ExamineEntry, ItemRarity, WurmRune } from '../types';
import { getRuneEffects } from '../data/runeEffectMap';
import { resolveItemName } from '../data/descriptionToName';

const TIMESTAMP_RE = /^\[\d{2}:\d{2}:\d{2}\]\s*/;
const RUNE_LINE_RE = /^An?\s+(\w+)\s+rune\s+of\s+(.+?)\s+has\s+been\s+attached/i;
const ENCHANT_LINE_RE = /^(.+?) has been cast on it[^[]*\[(\d+)\]/i;
const MAKER_LINE_RE = /^You can (?:barely|easily) make out the signature of its maker/i;
const IMBUI_LINE_RE = /^It has been smeared with (?:a|an)?\s*(.+?)(?:,\s*so it improves\s+(.+?)\s+max QL\s*\[(\d+)\]|\.|$)/i;
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
  if (IMBUI_LINE_RE.test(line)) return false;
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
        imbuis: [],
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

    // Ointment / oil / potion -> Imbui
    if (IMBUI_LINE_RE.test(line)) {
      const m = line.match(IMBUI_LINE_RE);
      if (m) {
        const name = m[1].trim();
        const skill = m[2] ? m[2].trim() : 'Unknown';
        const ql = m[3] ? parseInt(m[3], 10) : 100;
        current.imbuis.push({
          name,
          skill,
          ql,
          rawLine: line,
        });
      }
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
