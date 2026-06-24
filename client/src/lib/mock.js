// Deterministic sample dossier so the app renders without a live API key.
// Mirrors the shape returned by /api/summoner.
function players(youWin, youChamp, k, d, a, cs, dmg, vis) {
  const arr = []
  const fill = ['Lux', 'Jinx', 'Thresh', 'LeeSin', 'Yasuo', 'Ezreal', 'Kaisa', 'Sett']
  for (let t = 0; t < 2; t++) for (let i = 0; i < 5; i++) {
    const you = t === 0 && i === 0
    arr.push({
      summonerName: you ? 'Vanguard#EUW' : 'Operative' + (t * 5 + i),
      champion: you ? youChamp : fill[(t * 5 + i) % fill.length],
      teamId: t === 0 ? 100 : 200, isYou: you, win: t === 0 ? youWin : !youWin,
      kills: you ? k : (i * 3) % 11, deaths: you ? d : (i * 2 + 1) % 8, assists: you ? a : (i * 4) % 15,
      cs: you ? cs : 90 + i * 22, damageDealt: you ? dmg : 9000 + i * 3500, goldEarned: 11000 + i * 700,
      visionScore: you ? vis : 14 + i * 4, items: [3157, 6655, 4645, 3020, 3165, 0], trinket: 3340,
      spell1: 'SummonerFlash', spell2: 'SummonerDot',
      keystone: { name: 'Electrocute', icon: 'perk-images/Styles/Domination/Electrocute/Electrocute.png' },
    })
  }
  return arr
}

const champs = ['Ahri', 'Ahri', 'Ahri', 'TahmKench', 'TwistedFate', 'Kaisa', 'Ahri', 'Ahri', 'Ahri']
const roles = ['MIDDLE', 'MIDDLE', 'MIDDLE', 'MIDDLE', 'MIDDLE', 'BOTTOM', 'MIDDLE', 'MIDDLE', 'MIDDLE']

export function mockData(now) {
  const starts = [now - 50 * 3600000, now - 26 * 3600000, now - 3 * 3600000]
  const matches = []
  let gi = 0
  for (let s = 0; s < 3; s++) for (let g = 0; g < 6 && gi < 16; g++) {
    const late = g >= 2
    const win = late ? gi % 3 === 0 : gi % 4 !== 0           // win-heavy early in a session, decays late
    const champ = gi < 9 ? champs[gi] : ['Sett', 'Viktor', 'Jhin', 'Lux', 'Zed', 'Orianna', 'Camille'][gi % 7]
    const role = gi < 9 ? roles[gi] : ['BOTTOM', 'TOP', 'JUNGLE', 'MIDDLE'][gi % 4]
    const fb = win ? gi % 3 !== 0 : gi % 4 === 0
    const k = (win ? 7 : 2) + (gi % 4), d = (win ? 2 : 6) + (gi % 3), a = 4 + (gi % 9)
    const cs = (win ? 175 : 125) + (gi % 30), dur = 1500 + (gi % 5) * 220
    const dmg = win ? 24000 + (gi % 5) * 1800 : 12000 + (gi % 5) * 1400
    const vis = (win ? 28 : 13) + (gi % 8)
    matches.push({
      win, champion: champ, kills: k, deaths: d, assists: a, cs, damageDealt: dmg, goldEarned: 13000,
      visionScore: vis, duration: dur, ts: starts[s] + g * 1900000, queueId: 420, queueLabel: 'Ranked Solo',
      role, firstBlood: fb, killParticipation: win ? 0.66 : 0.46, teamDmgPct: win ? 0.32 : 0.18,
      items: [3157, 6655, 4645, 3020, 3165, 3089], trinket: 3340, spell1: 'SummonerFlash', spell2: 'SummonerDot',
      keystone: { name: 'Electrocute', icon: 'perk-images/Styles/Domination/Electrocute/Electrocute.png' },
      allPlayers: players(win, champ, k, d, a, cs, dmg, vis),
    })
    gi++
  }
  return {
    gameName: 'Vanguard', tagLine: 'EUW', summonerLevel: 412, profileIconId: 29, region: 'EUW',
    rankedStats: { solo: { tier: 'GOLD', rank: 'II', lp: 64, wins: 58, losses: 51 }, flex: { tier: 'SILVER', rank: 'I', lp: 22, wins: 14, losses: 11 } },
    matches, ddVersion: '14.24.1',
  }
}
