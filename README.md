![Visual Example](https://i.postimg.cc/dDcDR8D1/Github-Image.png)


# LoL Stat Tracker

A locally hosted League of Legends stat tracker that pulls live data from the Riot Games API and displays your match history, champion stats, item builds, and full game scoreboards in a polished dark-themed web interface.

---

## What It Does

- Displays your recent match history across all queue types (Ranked, Normal, ARAM, ARAM Mayhem, etc.)
- Shows per-match stats: champion, K/D/A, CS, damage dealt, gold earned, vision score, item builds, summoner spells, and keystone rune
- Expandable full scoreboard for each match showing all 10 players with their stats and builds
- Champion breakdown tab with aggregated win rate, KDA, CS, damage, and gold per champion
- Summary stat cards: overall win rate, average KDA, CS, damage, gold, and vision score
- KDA trend chart and rolling 5-game win rate chart
- Win/loss streak detection
- Best, worst, and most played champion highlights
- Filter matches by queue type or champion
- Auto-refresh every 5 minutes (optional)
- Export your match history to a CSV file
- Remembers your last search across page reloads

---

## Requirements

- [Node.js](https://nodejs.org) v16 or higher
- A Riot Games API key — get one free at [developer.riotgames.com](https://developer.riotgames.com)

> **Note:** Free development API keys expire after 24 hours. See [Renewing Your API Key](#renewing-your-api-key) below.

---

## Project Files

| File | Description |
|------|-------------|
| `index.html` | The frontend UI — handles search, displays all stats, charts, match history, and scoreboards |
| `server.js` | Local Node.js/Express proxy server that forwards requests to the Riot API |
| `package.json` | Node.js dependencies (Express, node-fetch, cors, dotenv) |
| `.env` | **Your API key goes here** — never committed to git |
| `.env.example` | Template showing the required environment variables |
| `.gitignore` | Prevents `.env` and `node_modules` from being committed |
| `CHANGELOG.md` | Full version history |
| `README.md` | This file |

---

## Setup Instructions

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
├── index.html
├── server.js
├── package.json
├── .env
├── .env.example
├── .gitignore
├── CHANGELOG.md
└── README.md
```

---

### 3. Add Your API Key

Open the `.env` file in any text editor (Notepad, VS Code, etc.) and replace the placeholder with your actual key:

```
RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PORT=3000
```

Get a free key at [developer.riotgames.com](https://developer.riotgames.com) — log in, and click **Generate API Key** on the dashboard. The key starts with `RGAPI-`.

> **Important:** Keep your `.env` file private. It is listed in `.gitignore` so it will not be accidentally committed if you use git.

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

## Version

Current version: **v1.8** — see [CHANGELOG.md](CHANGELOG.md) for full history.
