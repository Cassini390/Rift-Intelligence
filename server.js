const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const ROUTING = {
  na1:'americas', euw1:'europe', eune1:'europe', kr:'asia',
  br1:'americas', la1:'americas', la2:'americas', oc1:'sea', tr1:'europe', ru:'europe'
};
const QUEUE_LABELS = {
  420:'Ranked Solo', 440:'Ranked Flex', 400:'Normal Draft',
  430:'Normal Blind', 450:'ARAM', 900:'ARAM Mayhem', 700:'Clash'
};

async function riotFetch(url, apiKey) {
  const res = await fetch(url, { headers: { 'X-Riot-Token': apiKey } });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data?.status?.message || 'Riot API error' };
  return data;
}

app.get('/api/summoner', async (req, res) => {
  const { name, tag, region, apiKey } = req.query;
  console.log(`\n-> Request: "${name}#${tag}" [${region}]`);
  if (!name || !tag || !region || !apiKey)
    return res.status(400).json({ error: 'Missing params' });

  const routing = ROUTING[region] || 'americas';
  try {
    const account = await riotFetch(
      `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, apiKey);
    const puuid = account.puuid;
    const summoner = await riotFetch(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`, apiKey);

    let rankInfo = 'Unranked';
    let rankTier = '';
    let rankedStats = {};
    try {
      const ranked = await riotFetch(
        `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`, apiKey);
      const solo = ranked.find(r => r.queueType === 'RANKED_SOLO_5x5');
      const flex = ranked.find(r => r.queueType === 'RANKED_FLEX_SR');
      if (solo) {
        rankInfo = `${solo.tier} ${solo.rank} - ${solo.leaguePoints} LP`;
        rankTier = solo.tier;
        rankedStats.solo = { tier: solo.tier, rank: solo.rank, lp: solo.leaguePoints, wins: solo.wins, losses: solo.losses };
      }
      if (flex) rankedStats.flex = { tier: flex.tier, rank: flex.rank, lp: flex.leaguePoints, wins: flex.wins, losses: flex.losses };
    } catch (_) {}

    let ddVersion = '14.24.1';
    try {
      const versions = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(r => r.json());
      ddVersion = versions[0];
    } catch (_) {}

    // Fetch latest Data Dragon rune/spell data
    let spellData = {};
    let runeData = [];
    try {
      const spellJson = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/summoner.json`).then(r => r.json());
      Object.values(spellJson.data).forEach(sp => { spellData[sp.key] = sp.id; });
    } catch (_) {}
    try {
      runeData = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/runesReforged.json`).then(r => r.json());
    } catch (_) {}

    // Build rune lookup: id -> { name, icon }
    const runeLookup = {};
    runeData.forEach(tree => {
      tree.slots.forEach(slot => {
        slot.runes.forEach(rune => {
          runeLookup[rune.id] = { name: rune.name, icon: rune.icon };
        });
      });
      runeLookup[tree.id] = { name: tree.name, icon: tree.icon };
    });

    const [allIds, aramIds, mayhemIds] = await Promise.all([
      riotFetch(`https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`, apiKey),
      riotFetch(`https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=450&start=0&count=10`, apiKey).catch(() => []),
      riotFetch(`https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=900&start=0&count=10`, apiKey).catch(() => []),
    ]);

        const merged = [...new Set([...allIds, ...aramIds, ...mayhemIds])].slice(0, 20);
    console.log(`  Fetching ${merged.length} matches in batches...`);

    // Batch fetching to respect dev key rate limits (20 req/s, 100 req/2min)
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    const BATCH_SIZE = 5;
    const details = [];
    for (let i = 0; i < merged.length; i += BATCH_SIZE) {
      const batch = merged.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(id => riotFetch(`https://${routing}.api.riotgames.com/lol/match/v5/matches/${id}`, apiKey))
      );
      details.push(...results);
      if (i + BATCH_SIZE < merged.length) {
        console.log(`  Batch ${Math.floor(i/BATCH_SIZE)+1} done, pausing...`);
        await delay(1200);
      }
    }
    console.log(`  All batches complete.`);

    const matches = details.map(m => {
      const p = m.info.participants.find(x => x.puuid === puuid);
      if (!p) return null;
      const items = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].filter(id => id > 0);
      const trinket = p.item6 > 0 ? p.item6 : null;
      const spell1Id = String(p.summoner1Id);
      const spell2Id = String(p.summoner2Id);
      const keystoneId = p.perks?.styles?.[0]?.selections?.[0]?.perk;
      const keystoneInfo = keystoneId && runeLookup[keystoneId] ? runeLookup[keystoneId] : null;
      return {
        win: p.win,
        champion: p.championName,
        kills: p.kills, deaths: p.deaths, assists: p.assists,
        cs: p.totalMinionsKilled + p.neutralMinionsKilled,
        damageDealt: p.totalDamageDealtToChampions,
        goldEarned: p.goldEarned,
        visionScore: p.visionScore,
        wardsPlaced: p.wardsPlaced,
        wardsKilled: p.wardsKilled,
        duration: m.info.gameDuration,
        ts: m.info.gameEndTimestamp,
        queueId: m.info.queueId,
        queueLabel: QUEUE_LABELS[m.info.queueId] || 'Other',
        items, trinket,
        spell1: spellData[spell1Id] || null,
        spell2: spellData[spell2Id] || null,
        keystone: keystoneInfo,
        ddVersion
      };
    }).filter(Boolean).sort((a, b) => b.ts - a.ts);

    console.log(`  Done: ${matches.length} matches for ${account.gameName}#${account.tagLine}`);
    if (matches[0]) console.log(`  Sample items:`, matches[0].items, `trinket:`, matches[0].trinket);

    res.json({ gameName: account.gameName, tagLine: account.tagLine, summonerLevel: summoner.summonerLevel, rankInfo, rankTier, rankedStats, matches, ddVersion });
  } catch (e) {
    console.log('  Error:', e.message);
    res.status(e.status || 500).json({ error: e.message || 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`\nLoL Tracker running at http://localhost:${PORT}\n`);
});
