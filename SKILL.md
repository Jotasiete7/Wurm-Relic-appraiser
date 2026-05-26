# SKILL.md — Wurm Relic Appraiser PRO
## Game Design & Scoring Reference Document

---

## 1. Project Overview

A web tool for **Wurm Online** players to analyze bulk item data from chests and inventories.
The player provides data via **two complementary inputs**:

1. **Screenshot of the chest/inventory window** → OCR extracts item name, metal/material, QL, DMG, rarity.
2. **Examine log (paste)** → Parser extracts runes, enchants, makers, ointments.

The app crosses both inputs by item name, scores each item, assigns a tier, and provides
a rename string the player can use in-game to tag items for fast sorting.

**Primary use case:** Items obtained via **Archaeology + Restoration** — these are the only items
that can have multiple runes simultaneously, making them the most valuable and complex to evaluate.

---

## 2. Parser Resilience & Fallback Logic

To handle the chaotic nature of OCR (Tesseract.js) and the nuances of the Wurm client:

### 2.1 Screenshot Regex (`screenshotParser.ts`)
The regex ignores leading inventory state characters (`+`, `-`, `~`, `|`, `»`, `#`) which denote equipped/improves states.
It parses materials dynamically without a hardcoded whitelist, supporting woods (`maplewood`, `oakenwood`), metals (`iron`, `glimmersteel`), and others (leather, cloth). 

### 2.2 Description Resolution (`examineParser.ts`)
Description lines from the Examine log don't always start with articles (`A`, `An`, `The`). For example, the Carving Knife starts with `Made for carving...`. The parser evaluates any line starting with a capital letter and length > 10, skipping known rune/enchant patterns.

### 2.3 Fuzzy Correlation (`mergeInputs.ts`)
If exact name matching fails between the Examine log and the OCR output (due to typos like `Rarefile` instead of `file`, or name variants like `mountain lion pelt` vs `pelt`), the system falls back to a bidirectional substring check (`includes`). This guarantees data fusion even with heavy OCR noise.

---

## 3. Visual Identity

The project imports the **A Guilda** ecosystem identity:
- **Colors**: Deep dark backgrounds (`#050505`), panel elevations (`#0a0a0a`), and Guild Gold accents (`#d4b483`).
- **Typography**: Inter (UI), JetBrains Mono (data), Playfair Display (brand).
- **Layout**: Features the `EcosystemMenu` and top Header bar to navigate seamlessly between the Mining Optimizer, Chest Inspector, and other tools.
