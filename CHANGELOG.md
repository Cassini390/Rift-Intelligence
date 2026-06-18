# LoL Stat Tracker - Changelog

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
