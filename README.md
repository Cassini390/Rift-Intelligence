# Rift Intelligence — LoL Scouting Dossier

A locally hosted League of Legends performance tracker that pulls live data from the Riot Games API and reads your recent games back to you like a scout. Instead of another wall of tables, it leads with plain-language insight: what your wins have in common, where your form is slipping, and which habits are costing you games. Presented as a premium, minimalist intelligence dossier — ink, parchment and hextech gold, with a sticky section nav so any data point is one click away.

---

## What It Does

**The hero — an auto-generated Scouting Report.** From your last 20 games it mines ranked, plain-language findings such as:
- **One-trick risk** — how concentrated your champion pool is, and your off-champ win rate
- **Early-game / snowball dependence** — win rate with vs without first blood
- **Tilt tell** — how your results decay across a session (game 1 vs game 3+)
- **Carry or passenger** — your damage share in wins vs losses
- **Closing / scaling** — win rate in short vs long games
- **Comfort & trap picks** — your best and worst champions (minimum-games gated)
- **Autofill tax** — how often you're off-role and how you perform there
- **Lane dominance** — your peak CS lead over your direct lane opponent (Summoner's Rift)
- **Posture** — whether your wins are built on hunting solo-kill picks, or those picks are dragging you out of position
- **Mechanics** — whether skillshots and crowd-control landed track your wins (a trainable edge)
- **Discipline** — how much of each loss is spent on the respawn timer vs your wins
- **Teamfight impact** — healing/shielding for enchanters, multikills for damage dealers (works in ARAM)
- **Objective priority** — dragon/herald/baron takedowns in wins vs losses (Summoner's Rift)

The last six are **Tier-1 reads**: mined entirely from data already in each match payload (the `challenges` block), so they cost no extra API calls. Lane and objective reads suppress automatically on ARAM modes where they don't apply.

Every finding suppresses itself when the sample is too thin to claim honestly, and each report carries a **LOW / MEDIUM / HIGH confidence stamp** based on sample size.

**Plus the supporting readout:**
- **Win-condition Fingerprint** — diverging bars showing how each factor (KDA, kill participation, damage share, vision, CS/min, game length, deaths) separates your wins from your losses
- **Assessment verdict + engagement ribbon** — a synthesised verdict (Ascending / Holding / Declining / Volatile / Inconclusive) beside a 20-game win/loss ribbon
- **Strict per-queue view** — stats are never mixed across queues; tabs default to your most-played queue
- Per-engagement rows with KDA colour thresholds, a CS/min figure, role tag, and a one-line "Read" of why each game was won or lost (match list capped at 8 with a show-all toggle)
- Expandable full scoreboard for each match (all 10 players, builds, runes, spells)
- Champion dossier with gated win rate, a mastery trend, and pool-concentration signal
- Win/loss streak detection, last-search memory, and an optional auto-refresh of your last search
- **Sample data toggle** — load the app with the built-in sample dossier or a blank slate; preference persists across reloads
- Sticky section nav, orchestrated load animation that respects `prefers-reduced-motion`, and a responsive layout down to mobile

---

## Requirements

- [Node.js](https://nodejs.org) v16 or higher
- A Riot Games API key — get one free at [developer.riotgames.com](https://developer.riotgames.com)

> **Note:** Free development API keys expire after 24 hours. See [Renewing Your API Key](#renewing-your-api-key) below.

---

## Project Files

| File | Description |
|------|-------------|
| `client/` | **The frontend** — a React + Vite + Tailwind v4 + Framer Motion app: search, Scouting Report, fingerprint, match history, scoreboards, and the analytics engine. Built to `client/dist`, which the server serves. See [The interface](#the-interface) |
| `server.js` | Local Node.js/Express proxy that forwards requests to the Riot API, shapes the match data, and serves the built React app from `client/dist` |
| `start-tracker.bat` | **Windows one-click launcher** — prompts for your API key, saves it to `.env`, starts the server, and opens the browser |
| `package.json` | Node.js dependencies (Express, node-fetch, cors, dotenv) |
| `.env.example` | Template showing the required environment variables — **this is in the repo; copy it to `.env`** |
| `.env` | **Your API key lives here.** *Not* shipped in the repo (git-ignored so your key is never committed). On Windows the launcher creates it for you; for manual setup you copy `.env.example` to `.env` — see [Create your `.env`](#3-create-your-env-and-add-your-api-key) |
| `.gitignore` | Prevents `.env` and `node_modules` from being committed |
| `CHANGELOG.md` | Full version history |
| `README.md` | This file |

---

## The interface

The frontend lives in `client/` and is built with **React + Vite + Tailwind v4 + Framer Motion**. `server.js` serves the production build from `client/dist`, so the app is always available at `http://localhost:3000` once built. The Windows launcher (`start-tracker.bat`) builds it for you; for manual setup you build it once with `npm run build` (see step 5 below).

**Production (what the server serves):**

```bash
cd client
npm install        # first run only
npm run build      # outputs client/dist, served by node server.js on :3000
```

**Live development (hot reload):** run the Vite dev server alongside `node server.js`:

```bash
cd client
npm run dev        # http://localhost:5173, proxies /api → :3000
```

`client/node_modules` and `client/dist` are git-ignored.

---

## Quick Start (Windows)

The fastest way to run the tracker:

1. Make sure [Node.js](https://nodejs.org) is installed.
2. Double-click **`start-tracker.bat`**.

It will:
- install dependencies on first run (server + `client/`),
- build the React interface,
- prompt you to paste your Riot API key (and save it to `.env` for you — or let you keep the existing one),
- start the server, and
- open `http://localhost:3000` in your browser.

The server runs right in that same window (no extra console pops up). Because free dev keys expire every 24 hours, just run the `.bat` again and paste a fresh key when prompted. To stop the tracker, press `Ctrl+C` in the window.

Prefer to do it by hand, or on Mac/Linux? Follow the manual steps below.

---

## Setup Instructions (manual)

### 1. Install Node.js

If you don't already have Node.js installed, download and install it from [nodejs.org](https://nodejs.org). The LTS version is recommended.

To check if it's already installed:

```
node -v
```

---

### 2. Download the Project Files

Place all files into the same folder on your computer:

```
lol-tracker/
├── client/           ← React + Vite frontend (built to client/dist)
├── server.js
├── package.json
├── start-tracker.bat
├── .env.example      ← template (you copy this to .env in step 3)
├── .gitignore
├── CHANGELOG.md
└── README.md
```

> There is no `.env` file yet — it's intentionally not included so nobody's API key ends up in the repo. You create it in step 3.

---

### 3. Create your `.env` and add your API key

The repo ships a template called `.env.example`. **Copy it to a new file named `.env`** — the app reads `.env`, which is git-ignored so your key is never committed. (There is no `.env` in the repo until you make one.)

**Windows (Command Prompt):**

```
copy .env.example .env
```

**Mac / Linux:**

```
cp .env.example .env
```

Then open `.env` in any text editor (Notepad, VS Code, etc.) and replace the placeholder with your actual key:

```
RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PORT=3000
```

Get a free key at [developer.riotgames.com](https://developer.riotgames.com) — log in, and click **Generate API Key** on the dashboard. The key starts with `RGAPI-`.

> **On Windows you can skip this step** — `start-tracker.bat` creates and updates `.env` automatically from the key you paste in when it runs. You only need to copy the template by hand when setting up manually or on Mac/Linux.
>
> Keep your `.env` private. It's listed in `.gitignore`, so it won't be committed if you use git.

---

### 4. Open a Terminal in the Project Folder

**Windows:**
1. Open the folder in File Explorer
2. Click the address bar at the top
3. Type `cmd` and press Enter

**Mac:**
1. Open the folder in Finder
2. Right-click the folder and select **New Terminal at Folder**

**Drag and drop method (either OS):**
1. Open a terminal normally
2. Type `cd ` (with a space), then drag the project folder into the terminal window
3. Press Enter

---

### 5. Install Dependencies

```
npm install
```

This installs Express, node-fetch, cors, and dotenv into a `node_modules` folder. You only need to do this once (or again after deleting `node_modules`).

Then install the interface's dependencies and build it (the server serves the built output from `client/dist`):

```
cd client
npm install
npm run build
cd ..
```

You only need to rebuild after changing files under `client/src`. For live development with hot reload, run `npm run dev` in `client/` instead (see [The interface](#the-interface)).

---

### 6. Start the Server

```
node server.js
```

You should see:

```
LoL Tracker running at http://localhost:3000
```

Leave this terminal window open while using the tracker. To stop the server, press `Ctrl+C`.

---

### 7. Open the App

Navigate to:

```
http://localhost:3000
```

in your browser.

---

## How to Use

1. Enter your **summoner name** and **tag** (the part after the `#` in your Riot ID — e.g. for `PlayerName#EUW` enter `PlayerName` and `EUW`)
2. Select your **region** from the dropdown
3. Click **Search**

Loading takes around 10–20 seconds as match data is fetched in batches to avoid hitting the API rate limit.

---

## Renewing Your API Key

Free development keys expire every 24 hours. To renew:

1. Go to [developer.riotgames.com](https://developer.riotgames.com) and log in
2. Click **Generate API Key** on the dashboard — this replaces your old key
3. Open the `.env` file in your project folder and update the `RIOT_API_KEY` line with the new key
4. Stop the server (`Ctrl+C` in the terminal) and start it again with `node server.js`

The app will show a clear error message if the key is missing or expired.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot find module 'express'` | Run `npm install` in the project folder |
| `Cannot reach server` | Make sure `node server.js` is running in a terminal |
| `RIOT_API_KEY not configured` | Open `.env` and paste your API key in — see [Add Your API Key](#3-add-your-api-key) |
| `API key expired` | Generate a new key at [developer.riotgames.com](https://developer.riotgames.com), update `.env`, and restart the server |
| `Rate Limit Exceeded` | Wait 30 seconds and try again — the free dev key allows 100 requests per 2 minutes |
| No matches showing | Check your summoner name and tag are correct, and that the right region is selected |
| Wrong region | EUW accounts use the `EUW` region — make sure the dropdown matches your account's server |

---

## Supported Regions

| Code | Region |
|------|--------|
| NA | North America |
| EUW | Europe West |
| EUNE | Europe Nordic & East |
| KR | Korea |
| BR | Brazil |
| LAN | Latin America North |
| LAS | Latin America South |
| OCE | Oceania |
| TR | Turkey |
| RU | Russia |

---

## API Rate Limits

This project uses a free Riot development API key which has the following limits:

- 20 requests per second
- 100 requests per 2 minutes

Match data is fetched in batches of 5 with a short pause between each batch to stay within these limits. If you hit the rate limit, wait 30 seconds before searching again.

---

## Legal

Rift Intelligence was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.

League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. This is an unofficial, non-commercial tool with no affiliation to Riot Games. All match, champion, item, rune and summoner-spell data are retrieved at runtime from the official [Riot Games API](https://developer.riotgames.com) and [Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon); none of Riot's assets are redistributed in this repository.

Use of the Riot Games API is subject to the [API Terms of Use](https://developer.riotgames.com/terms) and [API Policies](https://developer.riotgames.com/policies/general). Keep your API key private (it lives in the git-ignored `.env`), respect the rate limits, and do not use this project for any commercial purpose without a valid production key and Riot's approval.

---

## Version

Current version: **v4.10 — Navigation & readability pass** — see [CHANGELOG.md](CHANGELOG.md) for full history.
