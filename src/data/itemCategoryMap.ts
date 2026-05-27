import type { ItemCategory } from '../types';

const categoryMap: Record<string, ItemCategory> = {
  // tool_craft
  'hammer': 'tool_craft',
  'mallet': 'tool_craft',
  'saw': 'tool_craft',
  'file': 'tool_craft',
  'chisel': 'tool_craft',
  'awl': 'tool_craft',
  'needle': 'tool_craft',
  'scissors': 'tool_craft',
  'trowel': 'tool_craft', // archaeology tool
  'metal brush': 'tool_craft', // archaeology tool
  'hatchet': 'tool_craft', // Explicitly tool_craft per 2022 patch

  // tool_mining
  'pickaxe': 'tool_mining',
  'shovel': 'tool_mining',
  'stone chisel': 'tool_mining',

  // tool_gather
  'rake': 'tool_gather',
  'scythe': 'tool_gather',
  'sickle': 'tool_gather',
  'fishing rod': 'tool_gather',

  // tool_craft knives
  'carving knife': 'tool_craft',
  'leather knife': 'tool_craft',
  'butchering knife': 'tool_craft',
  'knife': 'tool_craft',

  // weapon
  'longsword': 'weapon',
  'shortsword': 'weapon',
  'axe': 'weapon',
  'spear': 'weapon',
  'maul': 'weapon',
  'bow': 'weapon',
  'crossbow': 'weapon',
  'metal staff': 'weapon',
  'staff': 'weapon',

  // armor
  'helmet': 'armor',
  'open helm': 'armor',
  'breastplate': 'armor',
  'leggings': 'armor',
  'gauntlets': 'armor',
  'studded leather glove': 'armor',
  'boots': 'armor',
  'shield': 'armor',
  'large shield': 'armor',
  'shoulder pad': 'armor',

  // container
  'barrel': 'container',
  'chest': 'container',
  'small chest': 'container',
  'fish keep net': 'container',
  'satchel': 'container',
  'backpack': 'container',
  'toolbelt': 'container',

  // tool_misc / other
  'bridle': 'tool_misc',
  'huge sword blade': 'tool_misc',
  'huge axe head': 'tool_misc',

  // tool_craft cooking/dairy
  'cake tin': 'tool_craft',
  'cheese drill': 'tool_craft',
  'baking stone': 'tool_craft',
};

export function getItemCategory(itemName: string): ItemCategory | null {
  // Normalize the name (just in case)
  const normalized = itemName.toLowerCase().trim();
  
  // Direct match
  if (categoryMap[normalized]) {
    return categoryMap[normalized];
  }

  // Fallback heuristic: check if word contains key terms
  if (normalized.includes('sword') || normalized.includes('axe') || normalized.includes('maul')) return 'weapon';
  if (normalized.includes('helmet') || normalized.includes('boot') || normalized.includes('gauntlet') || normalized.includes('shield')) return 'armor';
  
  return null;
}
