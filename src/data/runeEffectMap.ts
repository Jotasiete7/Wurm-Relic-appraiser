import type { RuneEffect } from '../types';

export function getRuneEffects(god: string, metal: string): RuneEffect[] {
  const g = god.toLowerCase();
  const m = metal.toLowerCase();
  const key = `${g}_${m}`;

  const effects: Record<string, RuneEffect[]> = {
    // Fo
    'fo_adamantine': ['ENCHANT_POWER', 'ENCHANT_SUCCESS'],
    'fo_brass': ['MORE_QL_IMPED', 'GATHER_QUALITY'],
    'fo_bronze': ['WIND_SPEED'],
    'fo_copper': ['SPELL'],
    'fo_glimmersteel': ['SKILL_BONUS'],
    'fo_gold': ['RAKING_HARVESTING'],
    'fo_iron': ['LESS_FUEL'],
    'fo_lead': ['LESS_QL_LOSS_REPAIR', 'USAGE_SPEED'],
    'fo_seryll': ['ENCHANT_SUCCESS'],
    'fo_silver': ['GLOW', 'SKILL_BONUS'],
    'fo_steel': ['LESS_DECAY', 'LESS_DAMAGE_TAKEN'],
    'fo_tin': ['RARITY_CHANCE', 'LESS_DAMAGE_TAKEN'],
    'fo_zinc': ['SPELL'],

    // Jackal
    'jackal_adamantine': ['SPELL'], // random color
    'jackal_brass': ['GLOW'],
    'jackal_bronze': ['SPELL'],
    'jackal_copper': ['IMPROVE_CHANCE', 'LESS_DECAY_CONTENTS'],
    'jackal_glimmersteel': ['SKILL_BONUS', 'MORE_QL_IMPED'],
    'jackal_gold': ['VOLUME_DECREASE'], // reduced size
    'jackal_iron': ['RAKING_HARVESTING', 'LESS_DECAY'],
    'jackal_lead': ['VOLUME_DECREASE'], // less volume
    'jackal_seryll': ['ENCHANT_SUCCESS', 'LESS_QL_LOSS_REPAIR'],
    'jackal_silver': ['GLOW', 'VOLUME_INCREASE'],
    'jackal_steel': ['LESS_DECAY'],
    'jackal_tin': ['SPELL'],
    'jackal_zinc': ['LESS_WEIGHT', 'VEHICLE_SPEED'],

    // Libila
    'libila_adamantine': ['LESS_ENCHANT_DECAY'],
    'libila_brass': ['GLOW', 'GATHER_QUALITY'],
    'libila_bronze': ['GATHER_QUALITY'],
    'libila_copper': ['SPELL'],
    'libila_glimmersteel': ['USAGE_SPEED'],
    'libila_gold': ['RAKING_HARVESTING', 'LESS_WEIGHT'],
    'libila_iron': ['SPELL'],
    'libila_lead': ['VOLUME_DECREASE', 'USAGE_SPEED'],
    'libila_seryll': ['SHATTER_RESIST', 'LESS_QL_LOSS_REPAIR'],
    'libila_silver': ['VOLUME_INCREASE', 'LESS_DECAY_CONTENTS'],
    'libila_steel': ['LESS_DAMAGE_TAKEN', 'WIND_SPEED'],
    'libila_tin': ['RARITY_CHANCE', 'IMPROVE_CHANCE'],
    'libila_zinc': ['LESS_WEIGHT'],

    // Magranon
    'magranon_adamantine': ['VEHICLE_SPEED'],
    'magranon_brass': ['MORE_QL_IMPED'],
    'magranon_bronze': ['GATHER_QUALITY', 'LESS_ENCHANT_DECAY'],
    'magranon_copper': ['IMPROVE_CHANCE', 'RARITY_CHANCE'],
    'magranon_glimmersteel': ['USAGE_SPEED', 'SKILL_BONUS'],
    'magranon_gold': ['VOLUME_DECREASE', 'LESS_WEIGHT'], // reduced size = volume decrease
    'magranon_iron': ['SPELL'],
    'magranon_lead': ['LESS_QL_LOSS_REPAIR'],
    'magranon_seryll': ['SHATTER_RESIST'],
    'magranon_silver': ['VOLUME_INCREASE'],
    'magranon_steel': ['LESS_DECAY', 'WIND_SPEED'],
    'magranon_tin': ['SPELL'],
    'magranon_zinc': ['VOLUME_INCREASE', 'VEHICLE_SPEED'],

    // Vynora
    'vynora_adamantine': ['VEHICLE_SPEED', 'LESS_DECAY'],
    'vynora_brass': ['MORE_QL_IMPED', 'GLOW'],
    'vynora_bronze': ['WIND_SPEED', 'VEHICLE_SPEED'],
    'vynora_copper': ['IMPROVE_CHANCE'],
    'vynora_glimmersteel': ['USAGE_SPEED', 'MORE_QL_IMPED'],
    'vynora_gold': ['SPELL'],
    'vynora_iron': ['LESS_FUEL', 'LESS_DECAY'],
    'vynora_lead': ['LESS_QL_LOSS_REPAIR', 'VOLUME_INCREASE'],
    'vynora_seryll': ['SHATTER_RESIST', 'ENCHANT_SUCCESS'],
    'vynora_silver': ['LESS_DECAY_CONTENTS'],
    'vynora_steel': ['LESS_DAMAGE_TAKEN'],
    'vynora_tin': ['RARITY_CHANCE'],
    'vynora_zinc': ['SPELL'],

    // The Scavenger (Archaeology / Restoration exclusive runes)
    'the scavenger_lead': ['VOLUME_DECREASE', 'USAGE_SPEED'],
    'the scavenger_steel': ['LESS_DAMAGE_TAKEN', 'LESS_DECAY'],
    'the scavenger_adamantine': ['ENCHANT_SUCCESS', 'LESS_DECAY'],
  };

  return effects[key] || [];
}
