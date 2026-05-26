# Wurm Relic Appraiser PRO

> A **free, open-source** web tool for **Wurm Online** players to evaluate and sort bulk item hauls — especially those obtained via **Archaeology + Restoration**.

🌐 **Live App:** [wurm-relic-appraiser.pages.dev](https://wurm-relic-appraiser.pages.dev)
📖 **Guild:** [A Guilda](https://aguilda.pages.dev) — the Wurm Online crafting & archaeology community

---

## What does it do?

You paste or screenshot your **chest/inventory window**, examine all items in-game, paste the **Event log**, hit **Analyze** — and the app instantly scores every item by rune power, enchant values, metal type, and rarity. Items are ranked into tiers (**S / A / B / C / Trash / Skiller**) with a copy-paste rename string for in-game tagging.

---

## How to use

### Step 1 — Chest / Inventory Window *(optional, gives QL + metal)*
- **Text list:** In Wurm, open the chest, press `Ctrl+A` → `Ctrl+C` to select and copy all items, then paste in the "Paste Text" tab.
- **Screenshot:** Take a screenshot of the chest window and drop it into the upload zone. Tesseract.js OCR will automatically extract item names, metals and QL.

### Step 2 — Examine Log *(optional, gives runes + enchants)*
- In Wurm, right-click → **Examine** on every item inside the chest.
- Open your **Event** tab, select all the text, copy it.
- Paste into the "Examine Log" card on the right.
- Click the **gold pulsing button** — it will animate to attract your attention as soon as you paste.

### Step 3 — Analyze
- Click **"Analyze & Score Items"** — the app merges both inputs by item name (with fuzzy matching to handle OCR errors).
- Review the ranked table. Green = valuable, orange = consider selling, grey = discard.
- Use **"Copy Rename"** to instantly copy a tag like `[S] stone chisel iron ql87` for in-game renaming.

> 💡 **Best results:** Use both inputs together. Without the examine log, rune/enchant bonuses won't appear. Without the screenshot, QL/metal bonuses won't appear.

---

## Features

| Feature | Details |
|---|---|
| **Dual-input fusion** | Merges screenshot OCR + examine log text by item name |
| **Fuzzy matching** | Bidirectional substring fallback handles heavy OCR noise (`rarefile` → `file`) |
| **Resilient parsing** | Ignores inventory state chars (`+`, `-`, `~`, `»`), handles non-article descriptions |
| **Scoring engine** | Rune type × power, enchant power tiers, moonmetal bonus, rarity bonus |
| **Tier ranking** | S / A / B / C / Trash / Skiller tiers with color-coded badges |
| **Copy Rename** | One-click tag copy for in-game renaming |
| **Imbui tracking** | Detects oil-of-the-blacksmith ointment effects from examine log |
| **Maker tracking** | Captures item creator name from examine log |
| **Session stats** | Live Tier distribution, parser run counters, screenshot/log counts |
| **Global DB** | Anonymous community statistics stored in Supabase (no images, no identity) |
| **EN / PT bilingual** | Full translation of all UI strings via `useLanguage()` hook |
| **Quick Guide** | Collapsible 4-step onboarding guide with best practice tips |

---

## Technical Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Styling | Vanilla CSS + CSS Custom Properties (guild design tokens) |
| OCR | Tesseract.js (offline, browser-native) |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) — anonymous insert only |
| Hosting | Cloudflare Pages (auto-deploy from GitHub main) |
| Ecosystem | A Guilda shared components (`Header`, `LayoutBase`, `EcosystemMenu`) |

---

## Security Model

The global statistics database collects **only anonymous item metadata** (no screenshots, no player identities):

- **Client-side:** 15s cooldown, 200-item cap per submission, string truncation at 200 chars
- **Database-side:** PostgreSQL `CHECK` constraints on score and item count, INSERT-only grants to the public role
- **No RLS needed:** Data is purely statistical; nothing sensitive requires row-level isolation

---

## Development

```bash
# Install dependencies
npm install

# Local dev server
npm run dev

# Production build
npm run build
```

To enable Supabase statistics locally, copy `.env.example` to `.env` and fill in your project credentials.
The app runs in **Smart Simulation Mode** (console logs only) if credentials are not provided.

---

## Database Setup

Run `SQL_SETUP.sql` in your Supabase SQL Editor to create the 5 relational tables, indexes, and public INSERT grants.

---

## Contributing

Bug reports and scoring suggestions welcome on **Discord** (A Guilda server).
See [SKILL.md](./SKILL.md) for the full technical design reference and scoring rules.
