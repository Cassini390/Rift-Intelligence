# LoL Stat Tracker - Changelog

## v4.10 - Navigation & readability pass (UX feedback)
- **Section nav now shows where you are.** The masthead nav (`client/src/components/Masthead.jsx`) tracks the section in view via an `IntersectionObserver` scrollspy and marks the active item gold with an underline (`aria-current` for accessibility) — previously every item read the same and gave no positional cue.
- **Nav no longer double-links the same row.** `Findings` and `Profile` both pointed into the same side-by-side grid row, so two nav items scrolled to one spot. `Profile` is replaced by `Record`, which jumps to the Field Record match history (`#sec-rec`) — the three nav items now land on three distinct sections.
- **Tag accepts `#EUW` or `EUW`.** The intake form strips a leading `#` from the tag on submit, and the placeholder now shows `#EUW` by example (`client/src/App.jsx`).
- **Removed the full-screen `CONFIDENTIAL` background watermark** — it was distracting behind the content. The confidential marking is retained in the masthead top-right label and the "File opened" ink stamp; the corner registration ticks stay.
- **Long summoner names wrap on mobile.** The subject header name is given `min-w-0` + `break-words` so long Riot IDs wrap inside the card instead of overflowing the layout (`client/src/components/Subject.jsx`).
- Behaviour-only pass — no analytics, data-shape, or API changes.

---

## v4.9 - Riot legal compliance
- **Added the disclaimer Riot's "Legal Jibber Jabber" policy requires on every shared fan project.** A new in-theme `Footer` component (`client/src/components/Footer.jsx`) renders it verbatim — "Rift Intelligence was created under Riot Games' 'Legal Jibber Jabber' policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project." — on every screen, including the blank intake state. Styled as a `§ Notice` ink/gold footer so it fits the dossier identity.
- The footer also carries a trademark line clarifying this is an unofficial, non-commercial tool with no affiliation to Riot, and that all champion/item/rune/spell data come from the official Riot API and Data Dragon.
- New **Legal** section in the README covering the disclaimer, trademark attribution, and the API Terms of Use / API Policies obligations (key confidentiality, rate limits, no commercial use without a production key).
- No functional or data changes — this release is documentation and a compliance notice only. Full audit of `server.js` (stateless proxy, key in git-ignored `.env`, rate-limited batching), asset sourcing (Data Dragon only, nothing redistributed), and prohibited-use rules confirmed already compliant.

---

## v4.8 - LCU integration removed
- **The optional local-client (LCU) hook is gone entirely.** `server.js` no longer conditionally loads `lcu-local/`, the `buildChampionMap()` helper and the match-merge block are removed, and the API response no longer carries an `lcu` field. The `2400` ARAM Mayhem queue label is dropped too — it was only reachable through the local client.
- `.env.example` and `.gitignore` no longer reference `ENABLE_LCU` / `LCU_*` or the `lcu-local/` / `lcu-archive/` folders; `start-tracker.bat` no longer preserves `ENABLE_LCU` across `.env` rewrites.
- README's "Local Client (LCU) match history" section and the `lcu-local/` project-files row are removed.
- The untracked `lcu-local/` and `lcu-archive/` folders and the `local` git branch that carried the feature have been deleted.

---

## v4.7 - Dossier, Refined (design pass)
- **Card surfaces** — the subject header, assessment stats, field findings, biometric profile, champion dossier table and every match row now sit on physical card panels: `#12151C` stock with a hairline border and a 1px inner top-light (`.card` / `.match-card` in `index.css`). Hairline token brightened `#1C2027` → `#1E232C` so borders actually read.
- **Win/loss spine on match rows** — each engagement is its own card with a 3px jade/oxblood left edge; the expanded scoreboard is separated by an internal hairline. Replaces the old flat list with hover-drawn gold underline.
- **"FILE OPENED" ink stamp** — a distressed red date stamp slams onto the top-right corner of the subject card when a file loads (Framer Motion keyframes: scale 2.6→0.96→1 with rotation settle; edge distress via an SVG-noise luminance mask with graceful fallback). Re-keyed per subject so every new search gets stamped; honors `prefers-reduced-motion`; hidden on mobile.
- **Boxed intake form** — search inputs and the Open File button move from bare underlines to bordered, filled fields with gold focus states; reads as a proper console rather than a sketch.
- **Type hierarchy pass** — stat values up to 27px on cards, card sub-lines out of all-caps mono into quiet sans, subject meta line de-mono'd. Loading screen and decrypt sequence unchanged.

---

## v4.6 - Optional local-client hook
- **`server.js` now supports an optional, self-contained local-client integration** without any branch split. If a (not included, untracked) `lcu-local/` folder is present and `ENABLE_LCU=true`, `server.js` loads it via a conditional `require` and calls `getLcuMatches(searched, ctx)` to augment match history — otherwise this is a complete no-op.
- Corrected the queue-label table: `900` is `ARURF`, not `ARAM Mayhem`. Mayhem's real queue id is `2400`, which the public Riot API doesn't serve at all — the label is included so any future or local-client source that does surface it renders correctly.
- Added a `buildChampionMap()` helper (numeric championId → Data Dragon key), needed by any integration that receives numeric champion ids instead of names.
- `.env.example` documents `ENABLE_LCU` (default `false`) and the optional `LCU_INSTALL_DIR` / `LCU_LOCKFILE` overrides; `start-tracker.bat` now preserves `ENABLE_LCU` across `.env` rewrites, the same way it already preserves `PORT`.
- `.gitignore` excludes `lcu-local/` and `lcu-archive/` — neither the integration code nor any locally captured match data can ever be committed to this repo.
- New README section: "Local Client (LCU) match history" *(feature and section removed again in v4.8)*.

---

## v4.5 - Tier-1 Field Findings
- **Six new Scouting Report reads, mined from data already in every match payload** (the Match-V5 `challenges` block plus participant fields) — **zero additional API calls**. Each compares your win window against your loss window, the same effect-size logic the fingerprint uses, so it self-calibrates per player and champion rather than relying on absolute, role-dependent thresholds:
  - **LANE** — *Lane bully / Losing lane*: average peak CS lead over your direct lane opponent (`maxCsAdvantageOnLaneOpponent`). Summoner's Rift only.
  - **POSTURE** — *Pick-driven / Forcing duels*: whether solo kills (`soloKills`) cluster in your wins or your losses.
  - **MECHANICS** — *Hands win games*: skillshots landed (`skillshotsHit`) and crowd-control landed (`enemyChampionImmobilizations`), win window vs loss window.
  - **DISCIPLINE** — *Dead weight*: share of each game spent on the respawn timer (`totalTimeSpentDead` ÷ duration), wins vs losses.
  - **TEAMFIGHT** — *Keeps the team alive / Fight-winner*: effective healing & shielding for enchanters/tanks, multikills for damage dealers. Works in ARAM, where lane and objective reads don't apply.
  - **OBJECTIVES** — *Plays the map*: dragon + herald + baron takedowns in wins vs losses. Summoner's Rift only.
- **Mode-aware** — lane and objective reads suppress on ARAM theatres where they're meaningless; combat reads run everywhere. Every finding tolerates missing data, so older games simply drop out of a read's sample rather than breaking it.
- Plumbed through a per-match `signals` object in `server.js`; consumed by new finding builders in `client/src/lib/analytics.js`. Rendering is unchanged — the new reads flow into the existing Field Findings list and rank by score alongside the originals.

---

## v4.4 - UX refinements
- **Sample data toggle** — a "◈ Sample data: On/Off" button sits alongside the auto-refresh toggle below the search form. Switching it off clears the dossier to a blank slate so the app starts empty; switching it on restores the deterministic sample dossier. Preference is saved to `localStorage` and restored on reload.
- **Champion filter display names** — champion names in the queue filter now use the same `displayChamp()` lookup as the match rows, giving correct capitalisation and spacing (e.g. Tahm Kench, Twisted Fate, Kai'Sa) instead of lowercased internal Data Dragon keys. A state-version bump after `loadChampNames` resolves ensures names like Kai'Sa are correct on the very first render, not only after an interaction.

---

## v4.3 - Editorial pass
- **Ghost section numerals** — a faint oversized `01`–`04` sits behind each section eyebrow (Assessment, Field findings, Biometric profile, Field record). Pure editorial texture, pointer-events-none.
- **Masthead cursor spotlight** — a radial gold highlight follows the cursor across the sticky header in real time, giving it a physical light-source feel.
- **Letterpress on the foil wordmark** — `drop-shadow` filter adds depth to the gradient "RIFT INTELLIGENCE" title (dark shadow below, faint highlight above). Works correctly on `background-clip:text` where `text-shadow` would not.
- **Fingerprint measurement axis** — the centre zero-line is now visible (`rgba(faint, 0.5)` instead of near-invisible `bg-hair`); boundary ticks added at track edges; track height increased to `h-4`. Reads as a calibrated measurement instrument.

---

## v4.2 - Micro-interactions
- **Match row hover hairline** — a 1px gold line draws in from the left edge on hover (`::before` scaleX 0→1); row background lifts subtly. CSS-only, zero JS overhead.
- **Champion dossier sparklines** — inline SVG polylines replace the text-based mastery trend (▲/▼/→). Color-coded by first/second-half KDA comparison: jade rising, oxblood falling, slate steady. Em-dash fallback for <2 data points.
- **Win/loss ribbon shimmer** — a translucent highlight sweeps left-to-right across the engagement ribbon once, timed to fire right after the last bar finishes rising.

---

## v4.1 - Atmosphere pass
- **Film grain** — `body::after` SVG `feTurbulence` fractalNoise overlay at 4% opacity; hidden under `prefers-reduced-motion`.
- **Corner registration marks + CONFIDENTIAL watermark** — fixed `PageDecor` component: four gold hairline ticks in the viewport corners and a large diagonal ghost watermark behind the content column.
- **Foil metallic wordmark** — "RIFT INTELLIGENCE" uses `background-clip:text` with a goldsoft→bone→goldsoft gradient; reads as gold leaf.
- **Confidence stamp animation** — Framer Motion spring entrance (scale 1.4→1, rotate −3°→0°), like a rubber stamp landing on paper.
- **Loading screen** — full-screen `AnimatePresence` overlay while scouting: a scan-line sweep, `DECRYPTING SUBJECT FILE` typewriter, flickering case number, and pulsing dots. Turns the 10–20s API wait into an atmospheric moment.

---

## v4.0 - React interface (cutover)
- The **React build is now the frontend.** `server.js` serves the production build from `client/dist` (with an SPA fallback for client-side routes); `/api` is unchanged.
- The vanilla single-file `index.html` has been **retired and removed** — the React app fully replaces it.
- `start-tracker.bat` now installs the `client/` dependencies on first run, **builds the interface**, then prompts for the key and starts the server in the same console as before.
- README updated: file tree, project-files table, manual setup (build step), and the new "The interface" section covering production build vs. `npm run dev` hot reload.

---

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
