# LoL Stat Tracker - Changelog

## v4.0-beta - React + Vite rebuild (parallel)
- New `client/` app: the Rift Intelligence dossier rebuilt on **React + Vite + Tailwind v4 + Framer Motion**, for a higher animation/interaction ceiling than the CDN-Tailwind single file allowed.
- Feature parity with the vanilla core — Subject reveal, Assessment, Scouting findings, Win-condition fingerprint, Field record (engagements + champion dossier), queue/champion filtering, hover tooltips, last-search persistence (shared `lol_last_search` key), and an auto-refresh toggle (defaults Off, re-runs the last search every 5 min).
- Dropped from the rebuild by design: **CSV export** and on-site **release notes**.
- Motion handled by Framer Motion (count-ups, redaction wipe, bar fills, expand/collapse), so the old `setTimeout`-vs-rAF background-tab issue no longer applies.
- The vanilla `index.html` remains the served frontend until the cutover; `client/node_modules` and `client/dist` are git-ignored.

---

## v3.3.2 - Explanatory tooltips & setup docs
- Added hover/focus tooltips that explain each data point. The Biometric profile bars now describe the metric, show your actual win-vs-loss averages, and read out what the bar means; the confidence stamp and the Win rate / KDA / Rank figures get short explanations too.
- Tooltips are styled to match the dossier (ink panel, gold label, mono figures), keyboard-accessible, viewport-clamped, and don't double-bind on re-render.
- README: clarified that `.env` is **not** shipped in the repo — you create it by copying `.env.example` to `.env` (or let `start-tracker.bat` create it for you on Windows). Updated the file list and file tree accordingly.

---

## v3.3.1 - Champion display names
- Champion names now show their proper display form (e.g. Twisted Fate, Tahm Kench, Wukong, Kai'Sa) instead of Data Dragon's mashed-together keys.
- Names are pulled from Data Dragon's `champion.json`, with a space-insertion fallback if that lookup is unavailable. Raw keys are still used for icons and filtering, so nothing else changes.

---

## v3.3 - Type, density & navigation pass
- Retuned the type system: **Space Grotesk** (display) / **Inter** (body) / **JetBrains Mono** (data) — replaces the earlier Fraunces serif for a sharper, more even feel.
- Tighter, compact spacing on a regular vertical rhythm; smaller type scale throughout.
- **Sticky section nav** in the masthead (Assessment · Findings · Profile · Record) so any data point is one click away — no long scrolling.
- **Findings and the Biometric profile now sit side by side**, and the match list is **capped at 8** with a "show all" toggle — cutting roughly 17% of page height.
- Robustness fix: count-up numbers and bar heights now use `setTimeout` instead of `requestAnimationFrame`, so final values always land even if the tab loads in the background (CSS still animates them when visible). Fixed the "LP" suffix being wiped mid-animation.
- Launcher (`start-tracker.bat`) polished: gold/bone ANSI banner, and the server now runs in the **same console** with the browser opening from a hidden background timer — no second window, nothing closes and reopens.

---

## v3.2 - Classified Subject File (premium minimalist redesign)
- Reframed the whole page as a refined intelligence dossier *about a summoner*: case-file masthead, classification stamp, and §-numbered sections.
- **Signature moment:** a redaction bar that wipes away to reveal the subject's codename on load (respects `prefers-reduced-motion`).
- New premium-minimalist identity: ink / parchment / hextech-gold palette (muted jade & oxblood semantics, never neon), generous whitespace, hairline structure instead of boxed cards.
- New type system: **Fraunces** (display serif, used sparingly), **Hanken Grotesk** (body), **JetBrains Mono** (dossier metadata & tabular data).
- Same engine underneath — Scouting Report findings, Biometric (win-condition) fingerprint, per-engagement "Read", strict per-queue partitioning, confidence stamp.
- Removed the secondary trend-tile strip to cut clutter; findings + fingerprint carry the analysis.
- No data or server changes from v3.1.

---

## v3.1 - The Scouting Report
- **New hero — Scouting Report:** an auto-generated set of plain-language reads mined from your last 20 games, ranked by signal strength. Findings include one-trick risk, early-game/snowball dependence, session tilt decay, carry-or-passenger, late-game closing, comfort/trap champions, and autofill (off-role) tax. Each finding suppresses itself when the sample is too thin to claim honestly.
- **New signature visual — Win-condition Fingerprint:** diverging bars showing how each factor (KDA, kill participation, damage share, vision, CS/min, game length, deaths) separates your wins from your losses.
- **Confidence stamp:** every report is labelled LOW / MEDIUM / HIGH by sample size — the tool won't call a small sample a trend.
- **Dossier voice** throughout: verdicts, empty states, per-match reads, and tooltips speak in a consistent scout/analyst register.
- **Orchestrated load motion:** report cards stagger in, fingerprint and form-ribbon bars grow from baseline, headline numbers count up once. Fully disabled under `prefers-reduced-motion`.
- **Match-row craft:** KDA colour thresholds, a CS/min benchmark micro-bar, a role tag, and a one-line "Read" of why each game was won or lost on expand.
- **CSS rank emblems** (hexagon tier badges) for instant rank recognition; secondary trend tiles demoted into a collapsible panel.
- **Server:** surfaces `role`, `firstBlood`, `killParticipation`, and `teamDmgPct` — all extracted from the match payload already fetched, with **zero additional Riot API calls**.

---

## v3.0 - Rift Readout (full rebuild)
- **New identity "Rift Readout":** a tactical scouting-dossier look rooted in the actual League client palette — blue-black surfaces, hextech gold brand accent, warm parchment headings. Replaces the old multi-theme system and banner.
- **Full Tailwind migration:** markup rebuilt on Tailwind (CDN runtime) with an inline token config for colours, type, and spacing.
- **Signature element — Form Verdict + Form Ribbon:** a synthesised verdict word (CLIMBING / HOLDING / SLIPPING / VOLATILE / WARMING UP) beside a 20-game ribbon of win/loss bars whose height encodes per-game KDA. Answers "how am I doing?" at a glance.
- **Noise-controlled analytics (within the 20-game data):**
  - Rolling-window win-rate trend with a binomial confidence check — a coin-flip swing is reported as *stable*, not a trend.
  - Minimum 10-game sample before any trend is flagged; below it, raw stats show with a "low sample" note.
  - EWMA-smoothed sparklines (favouring recent games) on KDA, CS/min, vision, and damage share.
  - **Strict per-queue partitioning** — queue tabs replace the old "All" aggregate so stats never mix queues.
  - Per-champion win rate gated to a 3-game minimum, plus mastery-trend and pool-concentration signals.
- **Typography:** Rajdhani (HUD/display) · IBM Plex Sans (body) · IBM Plex Mono (all data, tabular figures).
- **UX/quality floor:** skeleton loaders over spinners, F-pattern match rows with a sacred win/loss left stripe, keyboard focus rings, reduced-motion support, responsive down to mobile.
- Theme switcher and per-theme banners removed in favour of the single fixed identity.
- Three analytics rules from the spec are not derivable from the Riot API and were intentionally omitted: gold diff @10/15 (needs the timeline endpoint), patch-boundary marking (needs more history), and true rank/role percentiles (no Riot endpoint — trends are framed against the player's own baseline instead).

---

## v2.2 - Visual Redesign & Scoreboard Improvements
- Full visual redesign: sticky glass-blur navigation bar replaces the in-page title
- Theme switcher moved into the nav bar as compact colour dots with an active ring indicator
- Added Space Grotesk display font for the nav title, champion names, and section headings
- Added JetBrains Mono for all numeric stat values, KDA ratios, and scoreboard data
- Banner is now purely decorative — no text overlaid, with a full-bleed fade to page background
- Profile card, stat cards, and match cards have increased padding and spacing
- Stat cards show a gradient top accent line on hover with a subtle lift animation
- Release notes section converted from inline styles to proper CSS classes
- Summoner profile avatar now shows the actual in-game portrait icon via Data Dragon
- Match scoreboard now shows Blue Team and Red Team side by side
- Scoreboard columns simplified to: Champion, Spells, Keystone, Summoner, K/D/A, CS, Items
- Trinket icons removed from the expanded scoreboard
- Scoreboard falls back to stacked layout on screens below 800px

---

## v2.1 - Theme Colour Fixes & Per-Theme Banners
- Fixed colour clashes across themes — each theme now has three visually distinct accent colours (accent, teal, purple)
  - Demacia: `--purple` changed from a duplicate gold to silver-blue (`#8ca8c8`)
  - Noxus: `--teal` changed from a second red to rust/bronze (`#d4824a`); `--purple` changed to wine/rose (`#8b4a6a`)
  - Freljord: `--teal` changed to a deeper steel blue (`#60a8e8`); `--purple` changed to frost amethyst (`#9080c8`)
  - Ionia: `--teal` changed to spirit-water blue (`#88c0d0`); `--purple` now uses the former `--teal` violet (`#c084fc`)
- Banner image now changes per theme — switching themes swaps the banner photo and falls back to the theme gradient if no image is set
- Added `bannerImg` field to each theme in the THEMES object — paste an image URL to activate it per theme
- Shadow Isles keeps the existing banner image; other themes default to the gradient until you add your own URLs

---

## v2.0 - Theme System & Visual Overhaul
- Added 5 selectable themes: Shadow Isles, Demacia, Noxus, Freljord, and Ionia
- Each theme applies a full colour scheme — backgrounds, accents, borders, glows, and button colours
- Banner gradient and subtitle text ("Shadow Isles Edition", "Noxus Edition", etc.) update to match the selected theme
- Theme selection is saved to localStorage and restored on next visit
- All accent colours now use CSS variables throughout, making the theme system consistent
- Win/Loss text replaced with pill badges (coloured background + border) for quicker at-a-glance reading
- Champion icons added to Best/Worst/Most Played highlight cards
- Removed KDA trend and Win/Loss trend charts
- Removed "BUILD" label from item rows in match cards
- Added subtle top-edge accent line to stat cards

---

## v1.9 - Security & Configuration Improvements
- API key moved from browser input to a `.env` file on the server — the key is never sent over the network or stored in the browser
- Added `dotenv` support — server reads `RIOT_API_KEY` from `.env` on startup
- Added `.env.example` as a safe-to-commit template showing required variables
- Added `.gitignore` to prevent `.env` and `node_modules` from being accidentally committed
- CORS restricted to localhost only — the server no longer accepts requests from other origins
- Server now validates the region parameter and returns a clear error for unknown values
- Server returns a descriptive error if `RIOT_API_KEY` is missing or still set to the placeholder value
- Port is now configurable via `PORT` in `.env` (defaults to 3000)
- Removed API key input field from the UI — key is managed server-side only
- Search state saved to localStorage no longer includes the API key
- Fixed missing `--blue` and `--blue-dim` CSS variables that caused ARAM queue badges and Diamond/Emerald rank badges to display incorrectly
- Fixed stale "Latest" label showing on the v1.5 release notes entry
- Added `engines` field to `package.json` documenting the Node.js v16+ requirement
- Updated README with full setup instructions for the `.env` workflow and key renewal process

---

## v1.8 - Scoreboard & Layout Improvements
- Widened page container from 960px to 1200px for more space
- Scoreboard teams now stack vertically instead of side by side, giving each player row full width
- Scoreboard grid updated with dedicated columns for keystone rune, vision score, and trinket
- Item icons in scoreboard increased from 18px to 24px for better readability
- Trinket now shown in scoreboard alongside the 6 main item slots
- LP tracker removed as it is not needed for casual play

---

## v1.7 - Shadow Isles Theme & Banner
- Full Shadow Isles colour scheme - deep blacks, toxic greens, eerie teals and purples throughout
- Added image banner at the top of the page with animated mist/glow fallback background
- Banner image easily configurable - find the BANNER IMAGE comment in index.html and paste your URL
- Page title uses a green gradient with a glow filter effect
- All accent colours updated from gold to Shadow Isles green and teal
- Subtitle added below the title in the banner area
- Body background updated with subtle green and purple radial glows

---

## v1.6 - Expandable Match Scoreboard
- Each match card now has a collapsible 'Full Scoreboard' button
- Clicking reveals all 10 players split into Blue and Red teams
- Per-player data: champion icon, summoner spells, name, K/D/A, gold, CS, and item build
- Your row is highlighted in gold with a star prefix for easy identification
- Victory/Defeat label shown per team with colour coding
- Premium dark UI redesign: new fonts (Syne + DM Sans), gold gradient title, polished cards and tab styles

---

## v1.5 - Rate Limit Fix
- Fixed "Rate Limit Exceeded" errors caused by parallel API calls
- Match fetching now uses sequential batches of 5 with a 1.2s pause between each batch
- Reduced max matches fetched from 25 to 20 to stay comfortably within dev key limits
- Batch progress is now logged to the terminal during fetch

---

## v1.4 - Release Notes Log
- Added a collapsible release notes section at the bottom of the page
- Lists all versions from v1.0 to current with descriptions and bullet points
- Toggle show/hide with a chevron button

---

## v1.3 - Stats Overhaul & Quality of Life
- Added summoner spell icons per match (from Data Dragon)
- Added keystone rune icon per match
- Added damage dealt, gold earned, and vision score to every match card
- KDA trend line chart across last 20 games
- Rolling 5-game win rate percentage chart
- LP tracker - manually log LP after each game, persists via localStorage with a chart
- Best / worst / most played champion highlight cards above the match list
- Win/loss streak banner shown when on a streak of 2 or more
- Queue type filter buttons (All, Ranked Solo, ARAM, Mayhem, etc.)
- Champion filter buttons - click any champion to show only those matches
- All stats, charts, and champion table update live when filters change
- Last search (name, tag, region) saved to localStorage and restored on reload
- Auto-refresh toggle - re-fetches data every 5 minutes when enabled
- Export match history to CSV button
- Champion portraits added to the champion stats table
- Ranked solo/duo and flex badges now show full W/L record alongside tier and LP

---

## v1.2 - Champion Icons & Item Builds
- Champion portrait icons now shown in match history (from Data Dragon)
- Item build row added to each match card showing up to 6 item icons
- Trinket shown separately with a circular icon
- Queue type badge on each match card (colour-coded: ARAM blue, Mayhem purple, Ranked red)
- ARAM Mayhem (queue 900) match history support added
- Server fetches ARAM and Mayhem match IDs separately and merges with normal history

---

## v1.1 - Multi-Queue Support & Bug Fixes
- Expanded match fetch to include all queue types, not just ranked (removed queue=420 filter)
- Fixed results panel not appearing after a successful search (display logic rewrite)
- Rewrote JavaScript using explicit DOM methods to avoid silent parse errors in some browsers
- Improved error messages - server errors now display on the page rather than silently failing
- Added server-side console logging for every request, including item and trinket samples
- "Games tracked" label updated from "ranked solo/duo" to "all queues"

---

## v1.0 - Initial Release
- Local Node.js proxy server (Express) to bypass Riot API CORS restrictions
- Search by summoner name, Riot tag, and region
- Fetches account, summoner, and ranked data from Riot API
- Win/loss rate, average KDA, and average CS summary stat cards
- Recent match history showing result, champion, KDA, CS, and game duration
- Champion breakdown tab with per-champion win rate and KDA ratio
- Ranked solo/duo and flex rank display
- Supports all regions: NA, EUW, EUNE, KR, BR, LAN, LAS, OCE, TR, RU
