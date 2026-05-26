import type { WurmItem, ScoreBreakdown, ItemRarity, MetalType } from '../types';
import { SCORING_MATRIX } from '../data/scoringMatrix';
import { METAL_TIER_MAP } from '../data/metalTierMap';

const RARITY_BONUS: Record<ItemRarity, number> = {
  fantastic: 20,
  supreme:   12,
  rare:       6,
  common:     0,
};

function isTool(category: string): boolean {
  return category.startsWith('tool_');
}

function getEnchantPoints(name: string, power: number, category: string): number {
  if (power < 90) return 0;
  
  const normName = name.toLowerCase().trim();
  let matchesCategory = false;
  
  if (normName === 'wind of ages') {
    matchesCategory = isTool(category) || category === 'weapon';
  } else if (normName === 'circle of cunning') {
    matchesCategory = isTool(category);
  } else if (normName === 'blessings of the dark') {
    matchesCategory = isTool(category) || category === 'weapon';
  } else if (normName === 'life transfer' || normName === 'nimbleness' || normName === 'bloodthirst') {
    matchesCategory = category === 'weapon';
  } else if (normName === 'aura of shared pain') {
    matchesCategory = category === 'armor';
  } else if (normName === 'shatter protection') {
    matchesCategory = true; // any item
  }
  
  if (!matchesCategory) return 0;
  
  if (power >= 110) return 20;
  if (power >= 100) return 12;
  if (power >= 90) return 5;
  return 0;
}

export function scoreAndTierItems(items: WurmItem[]): WurmItem[] {
  return items.map(item => {
    const scored = { ...item };

    // Check for Skiller first
    const cocEnchant = scored.enchants.find(e => e.name.toLowerCase() === 'circle of cunning');
    const isSkiller = (scored.ql !== null && scored.ql <= 10) && (cocEnchant !== undefined && cocEnchant.power >= 70);

    if (isSkiller && cocEnchant) {
      scored.isSkiller = true;
      let skillerScore = 0;
      const cocPower = cocEnchant.power;
      if (cocPower >= 110) skillerScore = 90;
      else if (cocPower >= 100) skillerScore = 65;
      else if (cocPower >= 90) skillerScore = 40;
      else if (cocPower >= 70) skillerScore = 20;

      const breakdown: ScoreBreakdown = {
        runePoints:     0,
        enchantPoints:  skillerScore,
        metalBonus:     0,
        rarityBonus:    0,
        total:          skillerScore,
        effectsScored:  [],
        enchantsScored: [{ name: cocEnchant.name, power: cocPower, points: skillerScore }]
      };

      scored.scoreBreakdown = breakdown;
      scored.score          = skillerScore;
      scored.tier           = 'Skiller';

      return scored;
    }

    const breakdown: ScoreBreakdown = {
      runePoints:     0,
      enchantPoints:  0,
      metalBonus:     0,
      rarityBonus:    0,
      total:          0,
      effectsScored:  [],
      enchantsScored: [],
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

    // 2. Enchant points
    for (const enc of scored.enchants) {
      const pts = getEnchantPoints(enc.name, enc.power, scored.category);
      if (pts > 0) {
        breakdown.enchantPoints += pts;
        breakdown.enchantsScored.push({ name: enc.name, power: enc.power, points: pts });
      }
    }

    // 3. Metal bonus (null = 0)
    breakdown.metalBonus = scored.metal
      ? (METAL_TIER_MAP[scored.metal as MetalType] ?? 0)
      : 0;

    // 4. Rarity bonus
    breakdown.rarityBonus = RARITY_BONUS[scored.rarity] ?? 0;

    // 5. Total
    breakdown.total = breakdown.runePoints + breakdown.enchantPoints + breakdown.metalBonus + breakdown.rarityBonus;

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
