# CLAUDE.md — Rift Intelligence

## What this is

A locally hosted League of Legends performance tracker presented as a premium
"intelligence dossier" about a **player**. A Node/Express proxy (`server.js`)
calls the Riot API and serves a React + Vite + Tailwind v4 + Framer Motion app
built from `client/` to `client/dist`.

Repo: github.com/Cassini390/Rift-Intelligence · Local:
`C:\Users\steve.drane\source\repos\Rift-Intelligence`

## The core concept — do not diverge from this

**Rift Intelligence is a scouting report on the *player*, not the champions.**
The subject of every screen is the summoner: their habits, form, tendencies and
win conditions. Champions only ever appear as *evidence about the player*
(comfort pick, trap pick, pool concentration) — never as the topic itself.

Guardrails when adding features:

- **Player-first framing.** New analytics must answer "what does this say about
  how *this person* wins or loses?" Reject anything that drifts toward champion
  tier lists, build/rune recommendations, meta analysis, patch-note commentary,
  or "best champions this patch" content. Sites like op.gg/u.gg already do
  champion stats; this tool exists because they *don't* do the player read.
- **Insight leads, tables support.** The hero is the auto-generated Scouting
  Report in plain language. Raw numbers (match rows, scoreboards, champion
  table) are the supporting record, never the headline. A new feature that is
  "another wall of tables" is off-concept.
- **Self-calibrating, not absolute.** Findings compare the player's win window
  against their own loss window (effect-size logic), so reads calibrate per
  player and per champion instead of leaning on role-dependent absolute
  thresholds. Follow this pattern (`splitMean` in `analytics.js`) for new reads.
- **Statistical honesty is identity, not polish.** Every finding suppresses
  itself when the sample is too thin to claim honestly. Trends are gated at
  `MIN_TREND_GAMES = 10` with a binomial confidence check; per-champion win
  rate is gated at 3 games; reports carry a LOW/MEDIUM/HIGH confidence stamp.
  Never let a new feature make a confident claim from a thin sample.
- **Strict per-queue partitioning.** Stats are never mixed across queues — no
  "All" aggregate, ever. Queue tabs default to the most-played queue.
- **Mode-aware reads.** Lane and objective findings suppress on ARAM-family
  queues where they're meaningless (`isAramSet`); combat reads run everywhere.
- **Zero-extra-API-call rule.** New signals should be mined from data already
  in the match payload (the `challenges` block + participant fields — the
  "Tier-1" pattern). Anything needing more Riot calls (e.g. the timeline
  endpoint) must be weighed against dev-key rate limits and flagged to the
  user first. Findings must tolerate missing fields — older games drop out of
  a read's sample rather than breaking it.
- **Dossier voice everywhere.** Verdicts, findings, empty states, errors and
  tooltips speak in a consistent scout/analyst register ("the subject", "field
  findings", "engagement", "theatre", "Open file"). New copy must match it.
- **Local, personal, non-commercial.** This runs on the player's own machine
  with their own dev key. No hosting, no accounts, no telemetry, and the key
  never leaves the server. The Riot "Legal Jibber Jabber" footer disclaimer
  must remain on every screen (v4.9).

## Architecture

- **`server.js`** — Express on `PORT` (default 3000). Serves the React build
  from `client/dist` with an SPA fallback; exposes
  `GET /api/summoner?name&tag&region`. Stateless: shapes match data (including
  the per-match `signals` object of Tier-1 challenge fields) and returns it —
  all analytics happen client-side. dotenv for the key, CORS locked to
  localhost, `node-fetch` v3 via dynamic-import shim. Fetches ~20 matches in
  batches of 5 with a 1.2s pause (dev-key limits: 20 req/s, 100 req/2min).
- **`client/`** — the whole frontend. Key files:
  - `src/lib/analytics.js` — **the brain.** Pure, framework-agnostic: metrics,
    win-rate trend + verdict, all 14 Scouting Report finding builders, the
    win-condition fingerprint. New player reads go here as small
    `fSomething(ms)` builders returning
    `{ sev, tag, headline, detail, score }` or `null` (self-suppression),
    registered in `scoutingReport()` and ranked by `score`.
  - `src/lib/ddragon.js` — Data Dragon version/champion-name lookups
    (`displayChamp()`); `src/lib/mock.js` — deterministic sample dossier.
  - `src/App.jsx` — state, intake form, queue/champion filters, sample-data
    toggle, loading screen; `src/components/` — Masthead, Subject, Assessment,
    Findings, Fingerprint, FieldRecord, MatchRow, Scoreboard, ChampionPool,
    Footer (legal), primitives.
- **`start-tracker.bat`** — Windows one-click launcher: installs deps, builds
  the client, prompts for the key into `.env` (preserving `PORT`), runs the
  server in the same console, opens the browser.

## Design system

- **Identity:** classified subject file. Ink `#0B0D11` bg · bone `#E9E6DD`
  headings · hextech gold `#C7A86A` accent · slate `#8A93A0` · jade `#4FA890`
  = win/good · oxblood `#C75D54` = loss/bad. Muted semantics, **never neon**.
  Card stock `#12151C` with hairline borders (`.card` in `index.css`),
  hairline structure, §-numbered sections, sticky section nav.
- **Type:** Space Grotesk (display) · Inter (body) · JetBrains Mono (dossier
  metadata & all data figures).
- **Motion:** Framer Motion (count-ups, stamps, bar fills, loading overlay).
  Every animation must respect `prefers-reduced-motion`. Atmosphere touches
  (film grain, CONFIDENTIAL watermark, ink stamp, cursor spotlight) are
  deliberate — keep them subtle and pointer-events-none.

## Gotchas

- **`.env` is git-ignored and must NEVER be committed.** It was tracked
  historically and was removed with `git rm --cached`; only `.env.example`
  ships. The key is server-side only — never send it to the browser or put it
  in query params. Riot dev keys expire every 24h.
- **Champion names:** display names come from Data Dragon `champion.json` via
  `displayChamp()`, with a space-insertion fallback. The raw key is still used
  for icons and filtering — don't swap it. After async name loads, a state
  bump forces a re-render so first paint isn't stale.
- **Rebuild to see changes in production mode:** the server serves
  `client/dist`, so edits under `client/src` need `npm run build` (or use the
  Vite dev server for hot reload).
- **Verifying in preview:** full-page screenshots can time out on the external
  Data Dragon image loads — verify via DOM inspection (`preview_inspect` /
  `preview_eval`) instead. The **sample-data toggle** gives a full
  deterministic dossier without a valid API key, so UI work never needs `.env`.
- **LCU integration was removed in v4.8** — do not reintroduce local-client
  hooks. CSV export and on-site release notes were dropped by design in the
  React rebuild.
- Three analytics ideas are intentionally omitted (not derivable from the API
  within limits): gold diff @10/15 (timeline endpoint), patch-boundary
  marking, true rank/role percentiles. Trends are framed against the player's
  own baseline instead.

## Running it

- **Windows:** double-click `start-tracker.bat`.
- **Manual:** `cp .env.example .env` + key → `npm install` →
  `cd client && npm install && npm run build && cd ..` → `node server.js` →
  http://localhost:3000.
- **Dev with hot reload:** `node server.js` plus `npm run dev` in `client/`
  (Vite on :5173, proxies `/api` → :3000).
- Preview configs in `.claude/launch.json`: `LoL Stat Tracker` (server, :3000)
  and `LoL Vite` (:5173).

## Git / release workflow

- Commit directly to `main` (user owns the repo). Each release: bump the
  version heading in `CHANGELOG.md` (newest at top, `v4.x - Title` format,
  currently v4.9) and keep the README's feature list and version line in sync.
- The remote occasionally gets out-of-band edits made on GitHub —
  `git pull --rebase` before pushing.
- Commit messages: write to a temp file and `git commit -F` (PowerShell
  mangles multi-line `-m` strings here).
