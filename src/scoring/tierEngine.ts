import type { WurmItem, ScoreBreakdown, ItemRarity, MetalType } from '../types';
import { SCORING_MATRIX } from '../data/scoringMatrix';
import { METAL_TIER_MAP } from '../data/metalTierMap';

const RARITY_BONUS: Record<ItemRarity, number> = {
  fantastic: 20,
  supreme:   12,
  rare:       6,
  common:     0,
};

export function scoreAndTierItems(items: WurmItem[]): WurmItem[] {
  return items.map(item => {
    const scored = { ...item };
    const breakdown: ScoreBreakdown = {
      runePoints:     0,
      metalBonus:     0,
      rarityBonus:    0,
      total:          0,
      effectsScored:  [],
    };

    // 1. Rune points
    for (const rune of scored.runes) {
      const runeName = `${rune.metal} of ${rune.god}`;
      for (const effect of rune.effects) {
        const pts = SCORING_MATRIX[effect]?.[scored.category] ?? 0;
        breakdown.runePoints += pts;
        breakdown.effectsScored.push({ effect, points: pts, runeName });
      }
    }

    // 2. Metal bonus (null = 0)
    breakdown.metalBonus = scored.metal
      ? (METAL_TIER_MAP[scored.metal as MetalType] ?? 0)
      : 0;

    // 3. Rarity bonus
    breakdown.rarityBonus = RARITY_BONUS[scored.rarity] ?? 0;

    // 4. Total
    breakdown.total = breakdown.runePoints + breakdown.metalBonus + breakdown.rarityBonus;

    scored.scoreBreakdown = breakdown;
    scored.score          = breakdown.total;
    scored.tier           = assignTier(scored.score);

    return scored;
  });
}

function assignTier(score: number): 'S' | 'A' | 'B' | 'C' | 'Trash' {
  if (score >= 80) return 'S';
  if (score >= 55) return 'A';
  if (score >= 30) return 'B';
  if (score >= 15) return 'C';
  return 'Trash';
}
