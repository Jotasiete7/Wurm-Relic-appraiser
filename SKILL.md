# SKILL.md — Wurm Relic Appraiser PRO
## Game Design, Scoring Reference & Technical Evolution Log

---

## 1. Project Overview

A web tool for **Wurm Online** players to analyze bulk item data from chests and inventories.
The player provides data via **two complementary inputs**:

1. **Screenshot of the chest/inventory window** → OCR (Tesseract.js) extracts item name, metal/material, QL, DMG, rarity.
2. **Examine log (paste)** → Parser extracts runes, enchants, makers, imbuis (oil ointments).

The app crosses both inputs by item name, scores each item, assigns a tier (S / A / B / C / Trash / Skiller), and provides a rename string the player can use in-game to tag items for fast sorting.

**Primary use case:** Items obtained via **Archaeology + Restoration** — these are the only items
that can have multiple runes simultaneously, making them the most valuable and complex to evaluate.

---

## 2. Parser Resilience & Fallback Logic

### 2.1 Screenshot Regex (`screenshotParser.ts`)
The regex ignores leading inventory state characters (`+`, `-`, `~`, `|`, `»`, `#`) which denote equipped/improved states.
It parses materials dynamically without a hardcoded whitelist, supporting woods (`maplewood`, `oakenwood`), metals (`iron`, `glimmersteel`), and others (leather, cloth).

### 2.2 Description Resolution (`examineParser.ts`)
Description lines from the Examine log don't always start with articles (`A`, `An`, `The`). For example, the Carving Knife starts with `Made for carving...`. The parser evaluates any line starting with a capital letter and length > 10, skipping known rune/enchant patterns.

### 2.3 Fuzzy Correlation (`mergeInputs.ts`)
If exact name matching fails between the Examine log and the OCR output (due to typos like `Rarefile` instead of `file`, or name variants like `mountain lion pelt` vs `pelt`), the system falls back to a bidirectional substring check (`includes`). This guarantees data fusion even with heavy OCR noise.

### 2.4 Maker Propagation
The `maker` field (item creator name from examine log) is now propagated through `defaultItem()`, the screenshot-examine merge loop, and the examine-only loop, all the way into the final `WurmItem` type. This enables statistical tracking of prolific crafters.

### 2.5 Imbui / Ointment Parsing
The examine parser now fully extracts oil-of-the-blacksmith type imbuis from examine lines, including skill name and QL of the ointment applied. These are stored as `WurmImbui[]` per item.

---

## 3. Scoring Engine

| Factor | Points |
|---|---|
| Usage Speed rune | 20 pts |
| Less Damage Taken rune | 15 pts |
| Enchant power 90-99 | 10 pts |
| Enchant power 95-99 | 15 pts |
| Enchant power 100 | 20 pts |
| Moonmetal (Glimmersteel / Adamantine) | +15 pts bonus |
| Rare item | +5 pts bonus |
| Supreme item | +15 pts bonus |
| Fantastic item | +30 pts bonus |
| No runes + no enchants + no skiller → Trash | 0-4 pts |
| Pure skiller (no rune/enchant, QL 1) | Skiller tier |

---

## 4. Global Statistics Database (Supabase)

Implemented a real-time community analytics backend:

- **Technology:** Supabase (PostgreSQL) with SDK v2
- **Schema:** 5 relational tables — `appraisals`, `appraised_items`, `item_runes`, `item_enchants`, `item_imbuis`
- **Privacy:** No images stored, no player identity captured — 100% anonymous metadata only
- **Smart Simulation Mode:** If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars are missing (local testing), the app prints a full structured console report instead of crashing
- **Security guardrails (code-level):**
  - 15-second cooldown between submissions
  - Max 200 items per appraisal before slicing
  - String truncation (200 chars) to prevent DB overflow
  - Score capped at 10,000 in code mirroring the DB constraint
- **Security guardrails (DB-level):**
  - `items_count BETWEEN 1 AND 200` constraint
  - `score BETWEEN 0 AND 10000` constraint
  - GRANT INSERT to public role (anonymous insert only — no SELECT, UPDATE, DELETE)
- **New publishable key fix:** The new Supabase `sb_publishable_` key format is not a JWT. A custom global `fetch` interceptor strips the `Authorization: Bearer` header (which would cause a 401 JWTSignatureError) for all requests, relying solely on the `apikey` header.

---

## 5. Ecosystem & Visual Identity

The project is integrated into the **A Guilda** ecosystem:

- **Colors:** Deep dark backgrounds (`#050505`), panel elevations (`#0a0a0a`), Guild Gold accents (`#d4b483`).
- **Typography:** Inter (UI), JetBrains Mono (data), Playfair Display (brand).
- **Header:** Features the `EcosystemMenu` and top header bar to navigate between guild tools. The language selector (EN/PT) is now integrated directly into the ecosystem `Header.tsx` via the `onLanguageChange` callback prop — making it a reusable guild-wide standard.
- **LayoutBase:** The main app is wrapped in `<LayoutBase>` from the ecosystem package, guaranteeing consistent font resets, anti-aliasing and theme tokens across all views.

---

## 6. UX & Interface Improvements

| Feature | Description |
|---|---|
| **QuickGuide component** | Collapsible 4-step guide visible on the input screen. EN/PT bilingual via the translation system. Cards for each step with gold left-border accent. |
| **Parse Examine Log button** | 3-state button: disabled (dim), active-pulsing gold with ⚡ Zap icon, parsed-confirmed green ✅. Resets to active state on textarea change. |
| **Beta notice banner** | Dashed gold banner persistent at the top of the app to invite feedback. |
| **Tier distribution stats** | Persistent local `StatsCard` showing S/A/B/C/Trash/Skiller distribution across all parser runs in the session. |
| **Drag-and-drop screenshots** | Robust drag-and-drop zone with `pointer-events: none` on children to prevent drop target miss. Global `dragover` listener prevents browser file-open behavior. |
| **Copy Rename button** | Copied! → 2s green flash feedback on both Table and Card views. |

---

## 7. Bilingual Support (EN / PT)

All user-facing strings are stored in `src/data/translations.ts` and accessed via the `useLanguage()` hook and `t(key)` function. The selected language is persisted in `localStorage`. New keys added in this session:

- `guideTitle`, `guideIntro`
- `guideTip1Title` / `guideTip1Body`
- `guideTip2Title` / `guideTip2Body`
- `guideTip3Title` / `guideTip3Body`
- `guideTip4Title` / `guideTip4Body`
- `guideClose`, `guideOpen`
