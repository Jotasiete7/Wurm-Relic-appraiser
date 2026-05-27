import type { ScreenshotItem, ItemRarity } from '../types';

// Matches: "[rare] itemname, metal [(player note)] QL DMG [Weight] [i]"
// Extremely robust against unclosed parentheses (column clipping) and ignores columns after DMG.
const INVENTORY_LINE_RE =
  /^[-+»~#|*\s]*(?:(rare|supreme|fantastic)\s+)?([^,(]+?)(?:,\s*([a-zA-Z]+))?(?:\s*\((.*?)\)?)?\s+([\d.,]+)\s+([\d.,]+).*/i;

function parseDecimal(value: string): number {
  // Handle both comma and dot as decimal separator
  let parsed = parseFloat(value.replace(',', '.')) || 0;
  // If QL/Dam is greater than 100, assume the decimal separator was missed in OCR (e.g. "2946.0" instead of "29.46")
  if (parsed > 100) {
    parsed = parsed / 100;
  }
  return parsed;
}

function cleanOcrPrefix(name: string): string {
  let cleaned = name.trim();
  // 1. Strip symbols and single character + symbol combinations from the start
  cleaned = cleaned.replace(/^[^a-zA-Z0-9\s]*[0-9®+@~=[\]#|»-]+\s*/g, '');
  // 2. Strip single letter + symbol prefixes like "B® + ", "O = "
  cleaned = cleaned.replace(/^[a-zA-Z][®+@~=[\]#|»-\s]+\s*/g, '');
  // 3. Strip single digit prefix followed by space
  cleaned = cleaned.replace(/^[0-9]\s+/g, '');
  // 4. Strip any standalone single characters at the beginning followed by spaces and symbols
  cleaned = cleaned.replace(/^[a-zA-Z0-9]\s+[+~=®-]\s*/g, '');
  return cleaned;
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

  const items: ScreenshotItem[] = [];

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
    for (let i = 0; i < count; i++) {
      items.push({
        rawName:        line,
        normalizedName: normalizeItemName(nameRaw),
        metal,
        rarity,
        ql:             parseDecimal(qlRaw),
        damage:         parseDecimal(damRaw),
        playerNote:     noteRaw?.trim() ?? null,
      });
    }
  }

  return items;
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
