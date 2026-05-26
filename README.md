# Wurm Relic Appraiser PRO

A web-based tool for **Wurm Online** players to analyze and score bulk item data from chests and inventories. This tool is specially designed for items obtained via **Archaeology + Restoration**, evaluating their runes, enchants, rarity, and material qualities to generate an actionable sorting score.

## Features
- **Dual Data Input**: Fuses image OCR data (inventory screenshots) with exact text logs (examine logs).
- **Fuzzy Item Correlation**: Automatically matches screenshot data with log data using substring fallbacks to bypass OCR inaccuracies (e.g. `rarefile` matching `file`).
- **Resilient Parsing**: Custom regex handles messy inventory states (`+`, `-`, `~`, `»`) and flawlessly identifies Wurm item descriptions even for non-standard items.
- **Scoring Engine**: Evaluates `WurmRune` and `WurmEnchant` power, providing a Tier (S, A, B, C, Trash) to help sort archaeology hauls.
- **Guild Ecosystem Integrated**: Uses the official `A Guilda` visual identity and layout, seamlessly fitting into the broader Wurm tool suite.

## Technical Stack
- React 19 + TypeScript + Vite
- TailwindCSS (via CDN) + CSS Modules
- Tesseract.js (for offline browser OCR)
- Lucide React (for iconography)

## Usage
1. Take a screenshot of the in-game inventory/toolbelt and paste it in the "Image" step.
2. Select all items in-game, examine them, and copy the Event window log.
3. Paste the log into the "Examine Log" step.
4. The tool merges both datasets and generates a score report for each item, providing quick copy-paste commands to rename items in-game.
