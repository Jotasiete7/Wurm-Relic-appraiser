import type { ScreenshotItem, ItemRarity } from '../types';

// Matches: "[rare] itemname, metal [(player note)] QL DMG [Weight] [i]"
// Extremely robust against unclosed parentheses (column clipping) and ignores columns after DMG.
const INVENTORY_LINE_RE =
  /^[-+»~#|*\s]*(?:(rare|supreme|fantastic)\s+)?([^,(]+?)(?:,\s*([a-zA-Z]+))?(?:\s*\((.*?)\)?)?\s+([\d.,]+)\s+([\d.,]+).*/i;

function parseDecimal(value: string): number {
  // Handle both comma and dot as decimal separator
  let parsed = parseFloat(value.replace(',', '.')) || 0;
  // Keep dividing by 10 if it exceeds 100 (OCR missed decimal dot/comma or merged columns)
  while (parsed > 100) {
    parsed = parsed / 10;
  }
  return parsed;
}

function cleanOcrPrefix(name: string): string {
  let cleaned = name.trim();
  
  // Strip typical OCR checkbox artifacts at the start:
  // e.g. "A. ", "Hl ", "§ ", "> ", "/ ", "& ", "Ti ® ", "BI + ", "Be / ", "[=~ ", "@ 2 "
  // 1. Strip symbols and single character + symbol/punctuation prefixes:
  cleaned = cleaned.replace(/^[^a-zA-Z0-9\s]*[0-9®+@~=[\]#|»\-&/>§\\•<().]+\s*/g, '');
  // 2. Strip single/double letter + symbol/punctuation prefixes (like "B® + ", "A. ", "Ti ® ", "Hl ", "Be / "):
  cleaned = cleaned.replace(/^[a-zA-Z]{1,2}[®+@~=[\]#|»\-&/>§\\•<().\s]+\s*/g, '');
  // 3. Strip single digits or standalone letters followed by space at the start (like "8 ", "0 ", "7 ", "f "):
  cleaned = cleaned.replace(/^[0-9a-zA-Z]\s+/g, '');
  // 4. Strip any leftover symbols/punctuation at the start:
  cleaned = cleaned.replace(/^[^a-zA-Z0-9\s]+\s*/g, '');
  
  return cleaned.trim();
}

function normalizeItemName(raw: string): string {
  let name = cleanOcrPrefix(raw);
  
  const lower = name.toLowerCase().trim();
  if (lower.endsWith('baking stone') || lower.endsWith('cake tin')) {
    // Do not strip the suffix
  } else {
    // Strip known metals/materials at the end if comma was missed in OCR
    const materialRegex = /\s+(iron|steel|bronze|silver|gold|lead|tin|zinc|copper|brass|electrum|seryll|adamantine|glimmersteel|leather|cotton|wool|silk|walnut|firwood|oakwood|cedarwood|chestnut|birchwood|willow|maple|pine|yew|linden|ashwood|marble|slate|sandstone|clay|pottery|stone)$/i;
    name = name.replace(materialRegex, '');
  }

  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function extractItemCount(note: string | null): number {
  if (!note) return 1;
  const match = note.match(/(\d+)\s*x/i) || note.match(/x\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * Parses a plain-text dump from the chest/inventory window (Ctrl+A, Ctrl+C in Wurm).
 * Each line is one item.
 */
export function parseScreenshotText(rawText: string): ScreenshotItem[] {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const rawItems: {
    line: string;
    rarity: ItemRarity;
    nameRaw: string;
    metal: string | null;
    qlRaw: string;
    damRaw: string;
    noteRaw: string | null;
    isParent: boolean;
    count: number;
  }[] = [];

  for (const line of lines) {
    const match = line.match(INVENTORY_LINE_RE);
    if (!match) continue;

    let [, rarityRaw, nameRaw, metalRaw, noteRaw, qlRaw, damRaw] = match;

    const rarity: ItemRarity = (rarityRaw?.toLowerCase() as ItemRarity) || 'common';
    
    // Clean prefix
    nameRaw = cleanOcrPrefix(nameRaw);

    // If metal is missing in OCR match, try to extract it from the end of nameRaw
    let metal: string | null = metalRaw ? metalRaw.toLowerCase() : null;
    if (!metal) {
      const lowerName = nameRaw.toLowerCase().trim();
      if (lowerName.endsWith('baking stone') || lowerName.endsWith('cake tin')) {
        // Do not extract metal from the actual item name
      } else {
        const materialRegex = /\s+(iron|steel|bronze|silver|gold|lead|tin|zinc|copper|brass|electrum|seryll|adamantine|glimmersteel|leather|cotton|wool|silk|walnut|firwood|oakwood|cedarwood|chestnut|birchwood|willow|maple|pine|yew|linden|ashwood|marble|slate|sandstone|clay|pottery|stone)$/i;
        const materialMatch = nameRaw.match(materialRegex);
        if (materialMatch) {
          metal = materialMatch[1].toLowerCase();
          nameRaw = nameRaw.replace(materialRegex, '');
        }
      }
    }

    const count = extractItemCount(noteRaw);
    const isParent = count > 1;

    rawItems.push({
      line,
      rarity,
      nameRaw,
      metal,
      qlRaw,
      damRaw,
      noteRaw: noteRaw?.trim() ?? null,
      isParent,
      count,
    });
  }

  const finalItems: ScreenshotItem[] = [];

  for (const item of rawItems) {
    const normalizedName = normalizeItemName(item.nameRaw);
    
    if (item.isParent) {
      // Check if there are individual items of the same name and metal in rawItems
      const hasSubItems = rawItems.some(
        other => !other.isParent &&
        normalizeItemName(other.nameRaw) === normalizedName &&
        other.metal === item.metal
      );
      if (hasSubItems) {
        // Skip the parent item because its sub-items are present individually!
        continue;
      }
    }

    // Add item (duplicate if parent and sub-items are not present)
    for (let i = 0; i < item.count; i++) {
      finalItems.push({
        rawName:        item.line,
        normalizedName,
        metal:          item.metal,
        rarity:         item.rarity,
        ql:             parseDecimal(item.qlRaw),
        damage:         parseDecimal(item.damRaw),
        playerNote:     item.noteRaw,
      });
    }
  }

  return finalItems;
}

/**
 * Runs Tesseract.js OCR on an image file, then feeds the result
 * to parseScreenshotText. Returns a tuple of [items, rawOcrText]
 * so the UI can display the raw OCR output for manual correction.
 */
export async function parseScreenshotImage(
  imageFile: File,
  onProgress?: (pct: number) => void,
): Promise<{ items: ScreenshotItem[]; rawOcrText: string }> {
  // Lazy-load Tesseract to avoid adding ~5MB to initial bundle
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker('eng', 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  const { data: { text } } = await worker.recognize(imageFile);
  await worker.terminate();

  return {
    items:      parseScreenshotText(text),
    rawOcrText: text,
  };
}
