# LoL Stat Tracker - Changelog

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
- Last search (name, tag, region, API key) saved to localStorage and restored on reload
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
