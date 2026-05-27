import type { ExamineEntry, ItemRarity, WurmRune } from '../types';
import { getRuneEffects } from '../data/runeEffectMap';
import { resolveItemName } from '../data/descriptionToName';

const TIMESTAMP_RE = /^\[\d{2}:\d{2}:\d{2}\]\s*/;
const RUNE_LINE_RE = /^An?\s+(\w+)\s+rune\s+of\s+(.+?)\s+has\s+been\s+attached/i;
const ENCHANT_LINE_RE = /^(.+?) has been cast on it[^[]*\[(\d+)\]/i;
const MAKER_LINE_RE = /^You can (?:barely|easily) make out the signature of its maker/i;
const IMBUI_LINE_RE = /^It has been smeared with (?:a|an)?\s*(.+?)(?:,\s*so it improves\s+(.+?)\s+max QL\s*\[(\d+)\]|\.|$)/i;
const SKIP_LINE_RE = /^(Colors:|It is imbued|It could be improved)/i;

// ── Heuristic patterns for extracting item name from repair/improvement lines ──
const HEURISTIC_PATTERNS: RegExp[] = [
  // "You need to polish the trowel with a pelt"
  /(?:polish|temper|sharpen|improve|punch|file)\s+the\s+([a-zA-Z][a-zA-Z\s-]{1,30}?)\s+(?:with|by|to|using)/i,
  // "The saddle needs some holes punched"  /  "The hatchet needs to be sharpened"
  /^(?:The|This)\s+([a-zA-Z][a-zA-Z\s-]{1,30}?)\s+(?:needs|has some|must be|is in need|could be)/i,
  // "You need to temper the longsword"  (no trailing preposition)
  /(?:polish|temper|sharpen|improve|punch|file)\s+the\s+([a-zA-Z][a-zA-Z\s-]{1,30})$/i,
];

/**
 * Attempt to extract the item name from context lines using repair/improvement phrases.
 * These lines typically appear after the description and reveal the exact item name.
 */
function extractNameFromContextLines(contextLines: string[]): string | null {
  for (const line of contextLines) {
    for (const pattern of HEURISTIC_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        const candidate = match[1].trim().toLowerCase();
        // Filter out clearly wrong matches (too short, or common false positives)
        if (candidate.length >= 3 && !['it', 'the', 'this', 'that', 'them'].includes(candidate)) {
          return candidate;
        }
      }
    }
  }
  return null;
}

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
  // Any line starting with "You " is a player perception line, not an item description.
  if (/^You /i.test(line)) return false;
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
  let currentContextLines: string[] = []; // lines in the current block for heuristic

  function flush() {
    if (current) {
      // ── Heuristic pass: if the item is still unknown, try extracting from context lines ──
      if (current.normalizedName === 'unknown') {
        const heuristicName = extractNameFromContextLines([current.descriptionRaw, ...currentContextLines]);
        if (heuristicName) {
          current.normalizedName = heuristicName;
          console.log(`%c[Parser Heuristic] Resolvido: "${current.descriptionRaw.slice(0, 50)}..." → "${heuristicName}"`, 'color: #f59e0b; font-style: italic;');
        }
      }
      entries.push(current);
    }
    current = null;
    currentContextLines = [];
  }

  for (const line of lines) {
    if (SKIP_LINE_RE.test(line)) {
      // Still collect "You need to" lines for heuristic — they're skipped from parsing
      // but contain valuable item name hints
      if (/^You need to/i.test(line)) {
        currentContextLines.push(line);
      }
      continue;
    }

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

    // Collect all lines in block for heuristic analysis
    currentContextLines.push(line);

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


