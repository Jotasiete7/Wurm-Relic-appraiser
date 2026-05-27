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

  // --- Missing restored / archaeological items ---
  "a tool for working the fields": "rake",
  "a long pole with a half meter long sharp blade, used for cutting grass or harvesting crops": "scythe",
  "a net that is used to hold fish caught, whilst fishing, to keep them fresh": "fish keep net",
  "a huge axe with a heavy head and a wooden shaft": "huge axe",
  "a huge axe head": "huge axe head",
  "a blade for a giant sword": "huge sword blade",
  "a sword with a blade the length of an underarm": "short sword",
  "a large heavy shield hammered from a metal sheet": "large shield",
  "a tool for digging": "shovel",
  "a tool for mining": "pickaxe",
  "a flat stone surface used for baking food": "baking stone",
  "a circular tin used to make cakes in": "cake tin",
  "a wooden tube made from planks with a shaft to press in order to separate the whey from the curd, and to press the curd into a mould": "cheese drill",
  "a small chest made from planks": "small chest",
  "these thin leather reins, headstall and metal bit should be put on the head of a creature to direct it": "bridle",
  "a heavy knife with a bent blade perfect for butchering": "butchering knife",

  // --- Newly identified plate / chain armour ---
  "a glove made from small metal plates": "plate gauntlet",
  "plate armour for the foot, with plenty of space for the toes": "plate sabaton",
  "a thick helm that only exposes a pair of slits where the eyes are": "great helm",
  "a sock made from metal chain": "chain boot",
  "a heavy jacket made from metal chain": "chain jacket",
  "leg protection made from metal chain": "chain pants",
  "chains sewn into a cylinder to protect the arms": "chain sleeve",
  "a heavy chain coif, worn on the head": "chain coif",
  "a chain glove": "chain gauntlet",
  "a protection closed completely around the lower arm and secured shut with spring snaps": "plate vambrace",
  "leather sewn into a cylinder to protect the arms": "leather sleeve",

  // --- Newly identified weapons & components ---
  "the heavy spiked metal head for a maul": "medium maul head",
  "a blade for a longsword": "long sword blade",
  "a large battle axe head": "large battle axe head",
  "a large battle axe with a wooden shaft": "large battle axe",
  "a smooth heavy clump of metal on a shaft": "small maul",
  "a long and slender sword": "sabre",
  "a small axe head": "small axe head",
  "a large spiked heavy clump of metal on a shaft": "medium maul",
  "a huge spiked heavy clump of metal on a shaft": "large maul",
  "a large axe head fit for a hatchet": "hatchet head",
  "a short but sturdy axe with a thick blade specially designed to cut down trees with but poor in combat": "hatchet",
  "a large heavy sword almost as tall as a ten year old child": "two handed sword",
  "a short but sturdy axe with a thick blade": "small axe",

  // --- Miscellaneous / Containers ---
  "a backpack made from leather with metal husks": "backpack",
  "a festive hangable wooden snow flake": "dendrite snowflake",
  "a clay bowl hardened by fire": "pottery bowl",
  "a clay planter hardened by fire": "pottery planter",
  "a wooden construction made from planks with a large wooden screw connected to a shaft": "press",
  "a large fork": "fork",
  "a large cutlery knife": "cutlery knife",
  "a large spoon": "spoon",
  "a kitchen utensil used primarily to measure the volume of liquid ingredients such as milk": "measuring jug",
  "a small iron box with wick and a canister for oil": "lantern",
  "a kind of small hand-held scythe with a crescent-moon formed blade": "sickle",
  "greaves for the lower part of the legs, a cuisse for the upper part, joined by a poleyne covering the knee": "plate leggings",
  "a saw, good for creating and sawing planks": "saw",
  "a thin blade for a rake": "rake blade",
  "a flat, faintly pointed broad blade used to smooth out mortar on bricks and sift through dirt and rocks": "trowel blade",
  "a leather saddle complete with a girth and stirrups": "saddle",
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
