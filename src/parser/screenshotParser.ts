import type { ScreenshotItem, ItemRarity } from '../types';

// Matches: "[rare] itemname, metal [(player note)] QL DMG [Weight] [i]"
// Extremely robust against unclosed parentheses (column clipping) and ignores columns after DMG.
const INVENTORY_LINE_RE =
  /^[-+»~#|*\s]*(?:(rare|supreme|fantastic)\s+)?([^,(]+?)(?:,\s*([a-zA-Z]+))?(?:\s*\((.*?)\)?)?\s+([\d.,]+)\s+([\d.,]+).*/i;

function parseDecimal(value: string): number {
  // Handle both comma and dot as decimal separator
  return parseFloat(value.replace(',', '.')) || 0;
}

function normalizeItemName(raw: string): string {
  return raw.toLowerCase().trim()
    .replace(/\s+/g, ' ');
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

    const [, rarityRaw, nameRaw, metalRaw, noteRaw, qlRaw, damRaw] = match;

    const rarity: ItemRarity = (rarityRaw?.toLowerCase() as ItemRarity) || 'common';
    const metal: string | null = metalRaw ? metalRaw.toLowerCase() : null;

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
