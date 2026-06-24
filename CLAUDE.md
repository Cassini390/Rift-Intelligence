# CLAUDE.md — Personal-Stat-Tracker-LoL ("Rift Intelligence")

## What this is
A locally-hosted League of Legends stat tracker. A Node/Express proxy
(`server.js`) calls the Riot API and serves a single-file frontend
(`index.html`) presented as a premium "intelligence dossier" called
**Rift Intelligence**. Repo: github.com/Cassini390/Personal-Stat-Tracker-LoL.
Local path: C:\Users\steve.drane\source\repos\Personal-Stat-Tracker-LoL

## Architecture
- **server.js** — Express on `PORT` (default 3000), serves the static
  `index.html`, exposes `GET /api/summoner?name&tag&region`. Uses dotenv,
  CORS restricted to localhost, and the `node-fetch` v3 dynamic-import shim.
  Fetches the last ~20 matches in batches of 5 with a 1.2s pause (dev-key
  rate limits). Surfaces `role`, `firstBlood`, `killParticipation`,
  `teamDmgPct` — all pulled from the match payload already fetched, so
  **zero extra API calls**.
- **index.html** — the entire frontend in one file: markup + `<style>` +
  vanilla JS. **No framework** (no React/Vue/etc. — it builds the UI with
  plain DOM APIs like `document.createElement` and `innerHTML`) and **no
  build step** (no bundler or transpiler; the file is served and runs in the
  browser exactly as written — Tailwind is compiled at runtime by the CDN
  script). Workflow is just: edit the file, refresh the page.

## Stack & conventions
- **Tailwind via CDN** (`cdn.tailwindcss.com`) with an inline
  `tailwind.config`. The "should not be used in production" console warning
  is expected and accepted for this local tool.
- **Fonts:** Space Grotesk (display) · Inter (body) · JetBrains Mono (data).
- **Design tokens:** ink `#0B0D11` bg · bone `#E9E6DD` headings · hextech gold
  `#C7A86A` accent · slate `#8A93A0` · jade `#4FA890` = win/good ·
  oxblood `#C75D54` = loss/bad. Muted semantics, never neon. Generous-but-
  compact spacing, hairline structure, sticky section nav.
- **JS style:** ES5-flavoured vanilla (`var`, function declarations),
  inline in index.html. No modules.

## Gotchas (important)
- **`.env` is git-ignored and must NEVER be committed.** It was tracked
  historically and was untracked with `git rm --cached`; only `.env.example`
  ships. The API key is server-side only — never send it from the browser or
  put it in query params. Riot dev keys expire every 24h.
- **Animations use `setTimeout`, not `requestAnimationFrame`** (count-ups,
  bar fills, reveals). rAF is throttled in background tabs, which left final
  values blank — setTimeout guarantees the end state; CSS transitions still
  animate when visible.
- **Champion names:** display names come from Data Dragon `champion.json`
  (`displayChamp()`), with a space-insertion fallback. The raw key is kept
  for image URLs and filtering — don't swap it.
- **Analytics rules:** strictly per-queue (never mix queues into one
  aggregate); trends gated at `MIN_TREND_GAMES = 10` with a binomial
  confidence check; per-champ win rate gated at 3 games. No true rank/role
  percentiles (Riot doesn't expose them).
- **Verifying in preview:** screenshots time out because of the external Data
  Dragon image loads — verify via DOM inspection (`preview_eval`) instead.
  Test the UI by injecting mock data through `render()`, since `.env` is
  often a placeholder.

## Running it
- **Windows:** double-click `start-tracker.bat` — prompts for the API key,
  writes `.env` (preserving PORT), runs the server in the *same* console,
  opens the browser. Gold ANSI banner.
- **Manual / Mac-Linux:** `cp .env.example .env`, add your key,
  `npm install`, `node server.js`, open http://localhost:3000.
- Preview server config: `.claude/launch.json` → name `lol-tracker`.

## Git / release workflow
- Commit to `main` directly (user owns the repo). Bump the version in
  `CHANGELOG.md` (currently v3.x) and keep README in sync.
- The remote occasionally gets out-of-band edits made directly on GitHub
  (e.g. "Fix formatting issues") — `git pull --rebase` before pushing.
- Commit messages: write to a temp file and `git commit -F` (PowerShell
  mangles multi-line `-m` strings here).
