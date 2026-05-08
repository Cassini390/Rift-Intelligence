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

- [Node.js](https://nodejs.org) (v16 or higher recommended)
- A Riot Games API key - get one free at [developer.riotgames.com](https://developer.riotgames.com)

> **Note:** Free development API keys expire after 24 hours. You will need to regenerate one each day.

---

## Project Files

| File | Description |
|------|-------------|
| `index.html` | The frontend UI that runs in your browser - handles search, displays all stats, charts, match history, and scoreboards |
| `server.js` | A local Node.js/Express proxy server that forwards requests to the Riot API, working around browser CORS restrictions |
| `package.json` | Defines the Node.js dependencies (Express, node-fetch, cors) installed via `npm install` |
| `CHANGELOG.md` | Full history of changes made to the project across all versions |
| `README.md` | This file |

---

## Setup Instructions

### 1. Install Node.js

If you don't already have Node.js installed, download and install it from [nodejs.org](https://nodejs.org). The LTS version is recommended.

To check if it's already installed, open a terminal and run:

```
node -v
```

---

### 2. Download the Project Files

Place all of the following files into the same folder on your computer:

```
lol-tracker/
├── index.html
├── server.js
├── package.json
├── CHANGELOG.md
└── README.md
```

---

### 3. Open a Terminal in the Project Folder

**Windows:**
1. Open the folder in File Explorer
2. Click the address bar at the top
3. Type `cmd` and press Enter

**Mac:**
1. Open the folder in Finder
2. Right-click the folder and select **New Terminal at Folder**

**Either OS - drag and drop method:**
1. Open a terminal normally
2. Type `cd ` (with a space), then drag the project folder into the terminal window
3. Press Enter

---

### 4. Install Dependencies

In the terminal, run:

```
npm install
```

This installs Express, node-fetch, and cors into a `node_modules` folder. You only need to do this once.

---

### 5. Start the Server

```
node server.js
```

You should see:

```
LoL Tracker running at http://localhost:3000
```

Leave this terminal window open while using the tracker. To stop the server, press `Ctrl+C`.

---

### 6. Open the App

Open `index.html` directly by double-clicking it, or navigate to:

```
http://localhost:3000/index.html
```

in your browser.

---

## How to Use

1. Enter your **summoner name** and **tag** (the part after the `#` in your Riot ID - e.g. for `PlayerName#EUW` enter `PlayerName` and `EUW`)
2. Select your **region** from the dropdown
3. Paste your **Riot API key** (starts with `RGAPI-`)
4. Click **Search**

Loading takes around 10-20 seconds as match data is fetched in batches to avoid hitting the API rate limit.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot find module 'express'` | Run `npm install` in the project folder |
| `Cannot reach local server` | Make sure `node server.js` is running in a terminal |
| `Rate Limit Exceeded` | Wait 30 seconds and try again - the free dev key has a limit of 100 requests per 2 minutes |
| API key error | Your key may have expired - generate a new one at [developer.riotgames.com](https://developer.riotgames.com) |
| No matches showing | Check your summoner name and tag are correct, and that the right region is selected |
| Wrong region | EUW accounts use `EUW` region - make sure the dropdown matches your account's server |

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

To stay within these limits, match data is fetched in batches of 5 with a short pause between each batch. If you hit the rate limit, wait 30 seconds before searching again.

---

## Version

Current version: **v1.6** - see [CHANGELOG.md](CHANGELOG.md) for full history.
