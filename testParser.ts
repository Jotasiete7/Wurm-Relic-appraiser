import { parseWurmLogs } from './src/parser/wurmParser.ts';
import { scoreAndTierItems } from './src/scoring/tierEngine.ts';

const log = `[17:03:47] A straight tool with a strong hard blade made for cutting stone. This is a very rare and interesting version of the item. It could be improved with a lump.
[17:03:47] You can barely make out the signature of its maker, '.ej.ckson'.
[17:03:47] Wind of Ages has been cast on it, so it will be quicker to use. [95]
[17:03:47] It has been smeared with an ointment of stonecutting, so it improves Stone Cutting max QL [100]
[17:03:47] A lead rune of Fo has been attached, so it will reduce the quality change when repairing damage (5%) and increase usage speed (5%)
[17:03:47] Circle of Cunning has been cast on it, so it will increase skill gained with it when used. [92]
[17:03:49] A wide metal blade on a shaft, useful in construction and searching through dirt and rocks for useful items. This is a very rare and interesting version of the item. You need to polish the trowel with a pelt.
[17:03:49] You can barely make out the signature of its maker, '.el.a'.
[17:03:49] A glimmersteel rune of Vynora has been attached, so it will increase usage speed (5%) and increase quality at a faster rate when being improved (5%)
[17:03:49] A seryll rune of Vynora has been attached, so it will increase chance to resist shattering when being enchanted (5%) and decrease the difficulty of enchanting the item (5%)
[17:03:49] A steel rune of Fo has been attached, so it will reduce decay taken (5%) and reduce damage taken (5%)
[17:03:49] Blessings of the Dark has been cast on it, so it will increase skill gained and speed with it when used. [91]
[17:05:39] A shiny metal staff etched with decorations that works as a weapon itself but which may be fitted with a blade for that little extra punch. This is a supreme example of the item, with fine details and slick design. Colors: R=12, G=252, B=250. It could be improved with a lump.
[17:05:39] A steel rune of Vynora has been attached, so it will reduce damage taken (10%)`;

const parsed = parseWurmLogs(log);
console.log("Total items:", parsed.length);
for (const item of parsed) {
  console.log(`\n--- ${item.normalizedName} ---`);
  console.log(`  Rarity: ${item.rarity}, Metal: ${item.metal}, Category: ${item.category}`);
  console.log(`  Runes: ${item.runes.length}`);
  for (const r of item.runes) {
    console.log(`    ${r.metal} of ${r.god}: ${r.effects.join(', ')}`);
  }
  console.log(`  Enchants: ${item.enchants.length}`);
  for (const e of item.enchants) {
    console.log(`    ${e.name} [${e.power}]`);
  }
}

const scored = scoreAndTierItems(parsed);
console.log('\n=== SCORED ===');
for (const item of scored) {
  console.log(`${item.normalizedName} → ${item.tier} (score: ${item.score})`);
}
