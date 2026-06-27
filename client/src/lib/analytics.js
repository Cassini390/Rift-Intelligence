// Pure analytics — ported verbatim in logic from the vanilla build.
// Framework-agnostic; consumed by the React components.

export const MIN_TREND_GAMES = 10

/* ── metrics ── */
export const kdaOf = (m) => (m.kills + m.assists) / Math.max(1, m.deaths)
export const csPerMin = (m) => m.cs / Math.max(1, m.duration / 60)
export function dmgShare(m) {
  if (m.teamDmgPct != null) return m.teamDmgPct
  if (!m.allPlayers) return null
  const you = m.allPlayers.find((p) => p.isYou); if (!you) return null
  const team = m.allPlayers.filter((p) => p.teamId === you.teamId)
  const tot = team.reduce((s, p) => s + (p.damageDealt || 0), 0)
  return tot ? m.damageDealt / tot : null
}
export const kpOf = (m) => (m.killParticipation != null ? m.killParticipation : null)
export const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0)
export function std(a) { if (a.length < 2) return 0; const mu = mean(a); return Math.sqrt(mean(a.map((v) => (v - mu) ** 2))) }
export const wrOf = (ms) => (ms.length ? ms.filter((m) => m.win).length / ms.length : 0)
export const pc = (x) => Math.round(x * 100)
export const roleName = (r) => ({ TOP: 'top', JUNGLE: 'jungle', MIDDLE: 'mid', BOTTOM: 'bot', UTILITY: 'support' }[r] || (r ? r.toLowerCase() : ''))

// One-line "why this game went the way it did".
export function matchReason(m) {
  const ds = dmgShare(m), kda = kdaOf(m), kp = kpOf(m)
  if (m.win) {
    if (ds != null && ds >= 0.30) return `Carried — ${pc(ds)}% of team damage.`
    if (kda >= 4) return `Clean execution — ${kda.toFixed(1)} KDA.`
    if (kp != null && kp >= 0.6) return `Omnipresent — ${pc(kp)}% kill participation.`
    if (m.firstBlood) return 'Drew first blood and pressed it.'
    return 'Secured the win.'
  }
  if (m.deaths >= 8) return `Overextended — ${m.deaths} deaths.`
  if (kda < 1.5) return `Outclassed — ${kda.toFixed(1)} KDA.`
  if (ds != null && ds < 0.18) return `Passenger — only ${pc(ds)}% of team damage.`
  return 'Lost the engagement.'
}

/* ── win-rate trend with binomial confidence check ── */
export function winRateTrend(matches) {
  const n = matches.length
  if (n < MIN_TREND_GAMES) return { state: 'insufficient', n }
  const half = Math.floor(n / 2)
  const recent = matches.slice(0, half), prior = matches.slice(half)
  const rw = recent.filter((m) => m.win).length, pw = prior.filter((m) => m.win).length
  const rp = rw / recent.length, pp = pw / prior.length, delta = rp - pp, pooled = (rw + pw) / n
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / recent.length + 1 / prior.length)) || 0
  const z = se > 0 ? delta / se : 0
  const confident = Math.abs(z) >= 1
  const state = !confident ? 'stable' : delta > 0 ? 'improving' : 'declining'
  return { state, n, recentPct: pc(rp), priorPct: pc(pp), deltaPts: pc(delta), confident }
}
export function getStreak(ms) {
  if (!ms.length) return null
  const t = ms[0].win; let c = 0
  for (let i = 0; i < ms.length; i++) { if (ms[i].win === t) c++; else break }
  return c < 2 ? null : { type: t, count: c }
}
export function confidenceOf(n) {
  return n >= 16 ? { lvl: 'HIGH', c: '#4FA890' } : n >= MIN_TREND_GAMES ? { lvl: 'MEDIUM', c: '#C7A86A' } : { lvl: 'LOW', c: '#C75D54' }
}

export function verdictOf(matches) {
  const t = winRateTrend(matches)
  if (t.state === 'insufficient') return { word: 'Inconclusive', color: '#8A93A0', note: `Sample too thin for a confident assessment — ${MIN_TREND_GAMES}+ games required in this theatre.` }
  if (t.state === 'improving') return { word: 'Ascending', color: '#4FA890', note: `Win rate up ${t.deltaPts} points across the recent window, beyond ordinary variance.` }
  if (t.state === 'declining') return { word: 'Declining', color: '#C75D54', note: `Win rate down ${Math.abs(t.deltaPts)} points across the recent window, beyond ordinary variance.` }
  let flips = 0; for (let i = 1; i < matches.length; i++) if (matches[i].win !== matches[i - 1].win) flips++
  return matches.length > 1 && flips / (matches.length - 1) > 0.6
    ? { word: 'Volatile', color: '#C7A86A', note: 'Results swing game to game; no directional trend beyond variance.' }
    : { word: 'Holding', color: '#C7A86A', note: 'Form is steady — recent and prior windows sit within ordinary variance.' }
}

/* ── scouting report findings ── */
import { displayChamp } from './ddragon.js'

function fOneTrick(ms) {
  const n = ms.length; if (n < 6) return null
  const c = {}; ms.forEach((m) => { c[m.champion] = (c[m.champion] || 0) + 1 })
  const top = Object.keys(c).sort((a, b) => c[b] - c[a])[0]
  const share = c[top] / n; if (share < 0.45) return null
  const on = ms.filter((m) => m.champion === top), off = ms.filter((m) => m.champion !== top)
  const detail = off.length >= 2 ? `${displayChamp(top)} holds ${pc(wrOf(on))}% · everything else ${pc(wrOf(off))}%.` : 'A very narrow pool this stretch.'
  return { sev: share >= 0.6 ? 'bad' : 'neutral', tag: 'POOL', headline: `${pc(share)}% of games on ${displayChamp(top)}.`, detail, score: share * 1.2 }
}
function fSnowball(ms) {
  const fb = ms.filter((m) => m.firstBlood), no = ms.filter((m) => !m.firstBlood)
  if (fb.length < 3 || no.length < 3) return null
  const wF = wrOf(fb), wN = wrOf(no), d = wF - wN; if (Math.abs(d) < 0.15) return null
  return { sev: wN < 0.4 ? 'bad' : 'neutral', tag: 'EARLY GAME', headline: `Snowball-dependent — ${pc(wF)}% with first blood, ${pc(wN)}% without.`,
    detail: wN < 0.4 ? 'The subject does not play from behind; losses cluster when the early lead slips.' : 'The early lead does the heavy lifting.', score: Math.abs(d) * 1.3 }
}
function fTilt(ms) {
  const asc = ms.slice().sort((a, b) => a.ts - b.ts); let idx = 0, last = null; const tagged = []
  asc.forEach((m) => { if (last != null && m.ts - last > 10800000) idx = 0; m._sess = idx; idx++; last = m.ts; tagged.push(m) })
  const first = tagged.filter((m) => m._sess === 0), late = tagged.filter((m) => m._sess >= 2)
  if (first.length < 3 || late.length < 3) return null
  const wF = wrOf(first), wL = wrOf(late); if (wF - wL < 0.15) return null
  return { sev: 'bad', tag: 'ENDURANCE', headline: `Session decay — ${pc(wF)}% on game one, ${pc(wL)}% by the third.`,
    detail: `Performance erodes the longer the subject stays queued. ${late.length} late-session games observed.`, score: (wF - wL) * 1.25 }
}
function fCarry(ms) {
  const w = ms.filter((m) => m.win), l = ms.filter((m) => !m.win)
  if (w.length < 3 || l.length < 3) return null
  const dw = w.map(dmgShare).filter((x) => x != null), dl = l.map(dmgShare).filter((x) => x != null)
  if (dw.length < 2 || dl.length < 2) return null
  const mw = mean(dw), ml = mean(dl), d = mw - ml; if (d < 0.04) return null
  return { sev: 'neutral', tag: 'AGENCY', headline: `Wins demand carry — ${pc(mw)}% of team damage in victories vs ${pc(ml)}% in defeats.`,
    detail: 'When the subject is not the primary threat, games tend to slip. Draft for agency.', score: d * 2 }
}
function fClosing(ms) {
  const s = ms.filter((m) => m.duration < 25 * 60), lo = ms.filter((m) => m.duration > 32 * 60)
  if (s.length < 3 || lo.length < 3) return null
  const wS = wrOf(s), wL = wrOf(lo), d = wS - wL; if (Math.abs(d) < 0.15) return null
  return d > 0
    ? { sev: 'bad', tag: 'TEMPO', headline: `Fades late — ${pc(wS)}% under 25 min, ${pc(wL)}% past 32.`, detail: 'Leads should be pressed early; the edge erodes the longer games run.', score: Math.abs(d) * 1.1 }
    : { sev: 'good', tag: 'TEMPO', headline: `Scales well — ${pc(wL)}% in long games, ${pc(wS)}% in short ones.`, detail: 'Strongest in extended games; play for the long game when behind.', score: Math.abs(d) * 1.1 }
}
function fComfort(ms) {
  const c = {}; ms.forEach((m) => { const x = c[m.champion] || (c[m.champion] = { g: 0, w: 0, kl: [] }); x.g++; if (m.win) x.w++; x.kl.push(kdaOf(m)) })
  let best = null; Object.keys(c).forEach((k) => { const x = c[k]; if (x.g >= 3) { const wr = x.w / x.g; if (!best || wr > best.wr || (wr === best.wr && x.g > best.g)) best = { champ: k, wr, g: x.g, kda: mean(x.kl) } } })
  if (!best || best.wr < 0.55) return null
  return { sev: 'good', tag: 'ASSET', headline: `Reliable asset — ${displayChamp(best.champ)} at ${pc(best.wr)}% over ${best.g} games.`, detail: `${best.kda.toFixed(1)} KDA. A dependable blind pick.`, score: 0.4 + best.wr * 0.5 }
}
function fTrap(ms) {
  const c = {}; ms.forEach((m) => { const x = c[m.champion] || (c[m.champion] = { g: 0, w: 0 }); x.g++; if (m.win) x.w++ })
  let worst = null; Object.keys(c).forEach((k) => { const x = c[k]; if (x.g >= 3) { const wr = x.w / x.g; if (!worst || wr < worst.wr) worst = { champ: k, wr, g: x.g } } })
  if (!worst || worst.wr > 0.4) return null
  return { sev: 'bad', tag: 'LIABILITY', headline: `Liability — ${displayChamp(worst.champ)} at ${pc(worst.wr)}% over ${worst.g} games.`, detail: 'Reads as comfortable, performs sour. Bench it or review the tape.', score: 0.4 + (1 - worst.wr) * 0.5 }
}
function fRole(ms) {
  const withRole = ms.filter((m) => m.role); if (withRole.length < 6) return null
  const c = {}; withRole.forEach((m) => { c[m.role] = (c[m.role] || 0) + 1 })
  const main = Object.keys(c).sort((a, b) => c[b] - c[a])[0]
  const off = withRole.filter((m) => m.role !== main); if (off.length < 3) return null
  const offShare = off.length / withRole.length, offWR = wrOf(off), mainWR = wrOf(withRole.filter((m) => m.role === main))
  if (offShare < 0.25) return null
  return { sev: 'bad', tag: 'POSTING', headline: `Off-posting tax — ${pc(offShare)}% of games off ${roleName(main)}, winning ${pc(offWR)}%.`, detail: `On ${roleName(main)} the subject wins ${pc(mainWR)}%. Hold the assigned role.`, score: offShare * (0.5 + Math.max(0, mainWR - offWR)) }
}
/* ── Tier-1 findings: mined from per-match `signals` (challenges + participant) ──
   Every value below already rides along in the match payload — zero extra API
   calls. Each read compares the win window against the loss window (the same
   effect-size logic the fingerprint uses) so it self-calibrates per player and
   per champion rather than leaning on absolute, role-dependent thresholds.
   All findings tolerate missing data: a signal the payload omits (older games,
   or the match-v4 LCU path) simply drops out of the sample. */
const sig = (m, k) => (m.signals ? m.signals[k] : null)
// Mean of a signal in wins vs losses; null unless both windows clear `minEach`.
function splitMean(ms, get, minEach = 3) {
  const w = [], l = []
  ms.forEach((m) => { const v = get(m); if (v == null) return; (m.win ? w : l).push(v) })
  if (w.length < minEach || l.length < minEach) return null
  return { mw: mean(w), ml: mean(l), nw: w.length, nl: l.length }
}
// Plain mean of a signal across games with the field present.
function avgOf(ms, get, min = 5) {
  const v = ms.map(get).filter((x) => x != null)
  return v.length < min ? null : { m: mean(v), n: v.length }
}
// ARAM-family theatres have no lanes/epic objectives — suppress those reads.
const isAramSet = (ms) => ms.length > 0 && ms.every((m) => m.queueId === 450 || m.queueId === 2400 || /ARAM/i.test(m.queueLabel || ''))

// LANE — do you win the matchup outright? (max CS lead over your lane opponent)
function fLaneDominance(ms) {
  if (isAramSet(ms)) return null
  const laners = ms.filter((m) => m.role)
  const r = avgOf(laners, (m) => sig(m, 'maxCsAdvantage'), 5)
  if (!r) return null
  const cs = Math.round(r.m)
  if (cs >= 10) return { sev: 'good', tag: 'LANE', headline: `Lane bully — peaks at +${cs} CS on your opponent.`, detail: 'You win the matchup outright. Cash the lead into plates and roams before it normalises.', score: 0.5 + Math.min(0.6, cs / 60) }
  if (cs <= -10) return { sev: 'bad', tag: 'LANE', headline: `Losing lane — down ${Math.abs(cs)} CS to your opponent at peak.`, detail: 'The early matchup runs against you. Review trades, wave management and recall timing.', score: 0.5 + Math.min(0.6, Math.abs(cs) / 60) }
  return null
}

// POSTURE — are your wins built on winning isolated duels?
function fAggression(ms) {
  const s = splitMean(ms, (m) => sig(m, 'soloKills'))
  if (!s) return null
  const d = s.mw - s.ml
  if (Math.abs(d) < 0.5) return null
  if (d > 0) return { sev: 'neutral', tag: 'POSTURE', headline: `Pick-driven — ${s.mw.toFixed(1)} solo kills a game in wins vs ${s.ml.toFixed(1)} in losses.`, detail: 'Your wins are built on winning isolated duels. Hunt picks; decline even 50/50s when behind.', score: 0.4 + Math.min(0.5, d / 3) }
  return { sev: 'bad', tag: 'POSTURE', headline: `Forcing duels — more solo kills in losses (${s.ml.toFixed(1)}) than wins (${s.mw.toFixed(1)}).`, detail: 'Hunting picks is pulling you out of position when it counts. Group and play for objectives instead.', score: 0.4 + Math.min(0.5, -d / 3) }
}

// MECHANICS — when your hands show up (skillshots / CC landed), do you win?
function fMechanics(ms) {
  const cand = []
  const cc = splitMean(ms, (m) => sig(m, 'enemyImmobilizations'))
  const sk = splitMean(ms, (m) => sig(m, 'skillshotsHit'))
  if (cc) cand.push({ ...cc, label: 'crowd-control landed', fmt: (v) => v.toFixed(1) })
  if (sk) cand.push({ ...sk, label: 'skillshots landed', fmt: (v) => String(Math.round(v)) })
  if (!cand.length) return null
  cand.forEach((c) => { c.rel = (c.mw - c.ml) / Math.max(0.5, (c.mw + c.ml) / 2) })
  cand.sort((a, b) => b.rel - a.rel)
  const c = cand[0]
  if (c.rel < 0.15) return null
  return { sev: 'good', tag: 'MECHANICS', headline: `Hands win games — ${c.fmt(c.mw)} ${c.label} in wins vs ${c.fmt(c.ml)} in losses.`, detail: 'A trainable, repeatable edge: when your mechanics land, results follow. Warm up before you queue.', score: 0.4 + Math.min(0.5, c.rel) }
}

// DISCIPLINE — how much of a loss is spent waiting on the respawn timer?
function fDeadWeight(ms) {
  const s = splitMean(ms, (m) => { const t = sig(m, 'timeSpentDead'); return t != null && m.duration ? t / m.duration : null })
  if (!s) return null
  const lossPct = pc(s.ml), winPct = pc(s.mw), gap = s.ml - s.mw
  if (lossPct < 18 || gap < 0.05) return null
  return { sev: 'bad', tag: 'DISCIPLINE', headline: `Dead weight — ${lossPct}% of every loss spent waiting to respawn.`, detail: `In wins that falls to ${winPct}%. Death timers, not teamfights, are deciding these — spend your life only on objectives.`, score: 0.45 + Math.min(0.5, gap) }
}

// TEAMFIGHT — fight impact that survives ARAM (no lanes/objectives needed).
function fTeamfight(ms) {
  // Enchanter/tank expression first: sustain output that tracks wins.
  const healAvg = avgOf(ms, (m) => sig(m, 'effectiveHealAndShielding'), 5)
  if (healAvg && healAvg.m > 3000) {
    const h = splitMean(ms, (m) => sig(m, 'effectiveHealAndShielding'))
    if (h && h.mw > h.ml) {
      const rel = (h.mw - h.ml) / Math.max(1, h.ml)
      if (rel >= 0.1) return { sev: 'good', tag: 'TEAMFIGHT', headline: `Keeps the team alive — ${Math.round(h.mw).toLocaleString()} effective healing & shielding in wins.`, detail: `Versus ${Math.round(h.ml).toLocaleString()} in losses. Your wins track your sustain — peel for the carries and stay in range.`, score: 0.45 + Math.min(0.45, rel) }
    }
  }
  // Damage-dealer expression: multikills that cluster in wins.
  const mk = splitMean(ms, (m) => sig(m, 'multikills')) || splitMean(ms, (m) => sig(m, 'largestMultiKill'))
  if (mk) {
    const d = mk.mw - mk.ml
    if (d >= 0.25) return { sev: 'good', tag: 'TEAMFIGHT', headline: `Fight-winner — bigger multikills in wins (${mk.mw.toFixed(1)} vs ${mk.ml.toFixed(1)}).`, detail: 'You convert teamfights into multikills when you win. Itemise and position to be the one who cleans up.', score: 0.4 + Math.min(0.4, d / 2) }
  }
  return null
}

// OBJECTIVES — do dragons, heralds and barons track your wins? (SR only)
function fObjectives(ms) {
  if (isAramSet(ms)) return null
  const s = splitMean(ms, (m) => {
    const sg = m.signals; if (!sg) return null
    const parts = ['dragonTakedowns', 'riftHeraldTakedowns', 'baronTakedowns'].map((k) => sg[k]).filter((x) => x != null)
    return parts.length ? parts.reduce((a, b) => a + b, 0) : null
  })
  if (!s) return null
  const d = s.mw - s.ml
  if (d < 0.4) return null
  return { sev: 'good', tag: 'OBJECTIVES', headline: `Plays the map — ${s.mw.toFixed(1)} epic-objective takedowns in wins vs ${s.ml.toFixed(1)} in losses.`, detail: 'Dragons, heralds and barons track your wins. Keep prioritising tempo and objective setups over chasing kills.', score: 0.4 + Math.min(0.45, d / 3) }
}

export function scoutingReport(ms) {
  return [fOneTrick, fSnowball, fTilt, fCarry, fClosing, fComfort, fTrap, fRole,
    fLaneDominance, fAggression, fMechanics, fDeadWeight, fTeamfight, fObjectives]
    .map((b) => { try { return b(ms) } catch { return null } })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
}

/* ── win-condition fingerprint ── */
export function fingerprint(ms) {
  const w = ms.filter((m) => m.win), l = ms.filter((m) => !m.win)
  if (w.length < 3 || l.length < 3) return null
  const f1 = (v) => v.toFixed(1), fp = (v) => pc(v) + '%', fk = (v) => v.toFixed(2)
  const fd = (v) => Math.floor(v / 60) + ':' + String(Math.round(v % 60)).padStart(2, '0')
  const factors = [
    { k: 'KDA', get: kdaOf, hi: true, fmt: fk, desc: '(Kills + Assists) ÷ Deaths. Higher means more impact per death.' },
    { k: 'Kill participation', get: kpOf, hi: true, fmt: fp, desc: "Share of your team's kills you took part in." },
    { k: 'Damage share', get: dmgShare, hi: true, fmt: fp, desc: "Your share of your team's damage to champions." },
    { k: 'Vision score', get: (m) => m.visionScore || 0, hi: true, fmt: f1, desc: 'Wards placed and cleared, plus overall vision contribution.' },
    { k: 'CS / min', get: csPerMin, hi: true, fmt: f1, desc: 'Minions and monsters killed per minute — farming efficiency.' },
    { k: 'Game length', get: (m) => m.duration, hi: null, fmt: fd, desc: 'Match duration — reveals whether you favour short or long games.' },
    { k: 'Deaths', get: (m) => m.deaths, hi: false, fmt: f1, desc: 'Average deaths per game. Lower is better.' },
  ]
  const rows = []
  factors.forEach((f) => {
    const all = ms.map(f.get).filter((x) => x != null), ww = w.map(f.get).filter((x) => x != null), ll = l.map(f.get).filter((x) => x != null)
    if (ww.length < 2 || ll.length < 2) return
    const sd = std(all); if (!sd) return
    rows.push({ k: f.k, eff: (mean(ww) - mean(ll)) / sd, hi: f.hi, fmt: f.fmt, desc: f.desc, mw: mean(ww), ml: mean(ll) })
  })
  rows.sort((a, b) => Math.abs(b.eff) - Math.abs(a.eff))
  const top = rows.slice(0, 6)
  const maxAbs = Math.max(...top.map((r) => Math.abs(r.eff)), 0.8)
  return top.map((r) => {
    const posWin = r.eff > 0, good = r.hi === null ? posWin : posWin === r.hi
    const widthPct = Math.min(1, Math.abs(r.eff) / maxAbs) * 50
    const mag = widthPct >= 38 ? 'strongly' : widthPct >= 20 ? 'clearly' : 'slightly'
    return { ...r, posWin, good, widthPct, read: good ? `Runs ${mag} higher when you win — lean into it.` : `Runs ${mag} higher when you lose — worth watching.` }
  })
}
