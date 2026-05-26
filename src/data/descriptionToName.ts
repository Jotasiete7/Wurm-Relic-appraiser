/**
 * Maps the first sentence of an examine log description (lowercase, trimmed)
 * to the normalized item name.
 *
 * Key = first sentence of description up to the first period, lowercased, trimmed.
 * Value = normalized item name (no rarity, no metal).
 *
 * To add new items: examine an unknown item in-game, copy the first sentence
 * of its description, and add it here.
 */
export const DESCRIPTION_TO_NAME: Record<string, string> = {
  // --- Mining / Stone ---
  "a straight tool with a strong hard blade made for cutting stone": "stone chisel",
  "a metal instrument used for surveying and measuring angles": "dioptra",
  "a short handled tool with a flat metal blade": "shovel",
  "a metal pickaxe head attached to a wooden shaft": "pickaxe",
  "a pickaxe with a wooden shaft and a metal head": "pickaxe",

  // --- Archaeology ---
  "a wide metal blade on a shaft, useful in construction and searching through dirt and rocks for useful items": "trowel",
  "a metal brush used to clean items": "metal brush",

  // --- Craft tools ---
  "a hammer with a metal head and wooden shaft": "hammer",
  "a mallet with a wooden head and handle": "mallet",
  "a hammer with a thick head made entirely from wood": "mallet",
  "a saw with a blade of fine teeth used to cut through wood": "saw",
  "a rugged metal blade on a shaft, used to make wood smoother": "file",
  "a flat metal blade used to shape and smooth surfaces": "file",
  "a small metal chisel used to carve stone": "chisel",
  "a small metal tool with a sharp point used to make holes in leather": "awl",
  "a metal needle used in tailoring": "needle",
  "a pair of scissors used in tailoring": "scissors",
  "made for carving, this knife has a broad blade and half a hilt": "carving knife",
  "a very short and sharp curved blade on a shaft, used to carve in leather": "leather knife",

  // --- Gathering ---
  "a rake with a wooden shaft and metal tines": "rake",
  "a scythe with a long wooden shaft and a curved metal blade": "scythe",
  "a sickle with a wooden handle and a curved metal blade": "sickle",
  "a fishing rod made from wood and metal": "fishing rod",

  // --- Weapons ---
  "a sword with a long blade": "longsword",
  "a sword with a shorter blade": "shortsword",
  "a large two-handed sword": "two handed sword",
  "an axe with a wooden shaft": "axe",
  "a hatchet with a wooden shaft": "hatchet",
  "a spear with a wooden shaft": "spear",
  "a large maul with a wooden shaft": "maul",
  "a shiny metal staff etched with decorations that works as a weapon itself but which may be fitted with a blade for that little extra punch": "metal staff",
  "a staff with a wooden shaft and metal tip": "staff",
  "a crossbow made from wood and metal": "crossbow",
  "a short bow made of wood": "shortbow",
  "a longbow made of wood": "longbow",

  // --- Armor ---
  "a full metal helmet": "helmet",
  "an open-faced round-top helm": "open helm",
  "a breastplate made of metal": "breastplate",
  "metal leggings": "leggings",
  "metal gauntlets": "gauntlets",
  "a leather glove strengthened with metal studs": "studded leather glove",
  "a plate gauntlet made of metal": "plate gauntlet",
  "metal boots": "boots",
  "a round metal shield": "round shield",
  "a kite shield made of metal": "kite shield",
  "a shoulder pad of this design increases all damage dealt and received by the same amount": "shoulder pad",

  // --- Containers ---
  "a large wooden barrel": "barrel",
  "a small wooden barrel": "barrel",
  "a wooden chest": "chest",
  "a leather satchel": "satchel",
  "a leather backpack": "backpack",
  "a toolbelt made of leather": "toolbelt",

  // --- Miscellaneous / Materials ---
  "a small finely polished stone used to sharpen the edges of weapons": "whetstone",
  "a fine pelt, skinned from an animal": "pelt",
  "rough and clumsy, but pretty sharp scissors": "scissors",
  "a small iron needle": "needle",
  "a small metal needle": "needle",
};

/**
 * Resolves an item name from a full description line.
 * Extracts the first sentence (up to first period) and looks it up.
 * Returns null if not found.
 */
export function resolveItemName(descriptionLine: string): string | null {
  // Extract first sentence: everything up to the first period
  const firstSentenceMatch = descriptionLine.match(/^([^.]+)/);
  if (!firstSentenceMatch) return null;

  const firstSentence = firstSentenceMatch[1].toLowerCase().trim();
  return DESCRIPTION_TO_NAME[firstSentence] ?? null;
}
