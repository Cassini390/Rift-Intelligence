import { motion } from 'framer-motion'
import { kdaOf, mean, pc, verdictOf, winRateTrend, getStreak, confidenceOf } from '../lib/analytics.js'
import { displayChamp } from '../lib/ddragon.js'
import { Eyebrow, Meta, CountUp, useTip, tip, tierColor, GhostedNumeral } from './primitives.jsx'

function Stat({ label, children, sub, tipRef }) {
  return (
    <div ref={tipRef} className="card flex-1 min-w-[128px] px-4 py-3.5">
      <Meta className="block mb-1.5">{label}</Meta>
      <div className="font-display font-semibold tnum text-bone text-[27px] leading-none">{children}</div>
      <span className="block mt-1.5 text-[12px] text-faint tnum">{sub}</span>
    </div>
  )
}

export default function Assessment({ matches, queueLabel, ranked }) {
  const v = verdictOf(matches)
  const trend = winRateTrend(matches)
  const conf = confidenceOf(matches.length)
  const n = matches.length
  const wins = matches.filter((m) => m.win).length
  const wr = n ? wins / n : 0
  const avgKda = n ? mean(matches.map(kdaOf)) : 0
  const tk = matches.reduce((s, m) => s + m.kills, 0), td = matches.reduce((s, m) => s + m.deaths, 0), ta = matches.reduce((s, m) => s + m.assists, 0)

  const chrono = matches.slice().reverse()
  const kdas = chrono.map(kdaOf)
  const maxK = Math.max(3, Math.min(8, kdas.length ? Math.max(...kdas) : 3))

  let wrSub = `${wins}W · ${n - wins}L`
  if (trend.state === 'improving') wrSub = `▲ +${trend.deltaPts} pts`
  else if (trend.state === 'declining') wrSub = `▼ ${trend.deltaPts} pts`
  else if (trend.state === 'insufficient') wrSub = `${wins}W · ${n - wins}L · small sample`

  const rk = queueLabel === 'Ranked Solo' ? ranked?.solo : queueLabel === 'Ranked Flex' ? ranked?.flex : null
  const streak = getStreak(matches)

  const stampRef = useTip(tip('Confidence', 'How far to trust this assessment, set by how many games are in this queue.', '<div style="font-size:11px;color:#8A93A0;margin-top:6px;font-style:italic">16+ games High · 10–15 Medium · under 10 Low.</div>'))
  const wrRef = useTip(tip('Win rate', 'Wins divided by games in this queue. The arrow marks the recent-window trend — shown only when it beats normal variance.'))
  const kdaRef = useTip(tip('KDA', '(Kills + Assists) ÷ Deaths, averaged across these games.'))
  const thirdRef = useTip(rk ? tip('Rank', 'Current ranked tier, division and League Points in this queue.') : tip('Streak', 'Consecutive wins or losses, counting back from your most recent game.'))

  return (
    <section id="sec-assess" className="py-7 border-b border-hair">
      <div className="flex items-center justify-between mb-5">
        <GhostedNumeral n={1}><Eyebrow>§ Assessment</Eyebrow></GhostedNumeral>
        <motion.span ref={stampRef}
          initial={{ opacity: 0, scale: 1.4, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.35 }}
          className="font-mono text-[9px] tracking-[0.2em] uppercase border rounded-sm px-2 py-[3px] inline-flex items-center gap-1.5"
          style={{ color: conf.c, borderColor: conf.c, transformOrigin: 'center' }}>
          <span className="inline-block h-1 w-1 rounded-full" style={{ background: conf.c }} />
          Confidence · {conf.lvl}
        </motion.span>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-7 lg:gap-10 items-start">
        <div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="font-display font-semibold leading-[1] tracking-tight" style={{ fontSize: 'clamp(1.9rem,4.2vw,2.6rem)', color: v.color }}>
            {v.word}
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="text-slate text-[13px] leading-relaxed mt-3 max-w-md">{v.note}</motion.p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Stat tipRef={wrRef} label="Win rate" sub={wrSub}>
              <CountUp value={pc(wr)} suffix="%" style={{ color: wr >= 0.5 ? '#4FA890' : '#C75D54' }} />
            </Stat>
            <Stat tipRef={kdaRef} label="KDA" sub={n ? `${(tk / n).toFixed(1)} / ${(td / n).toFixed(1)} / ${(ta / n).toFixed(1)}` : '—'}>
              <CountUp value={avgKda} decimals={2} />
            </Stat>
            {rk
              ? <Stat tipRef={thirdRef} label="Rank" sub={`${rk.tier} ${rk.rank}`}>
                  <span style={{ color: tierColor(rk.tier) }}><CountUp value={rk.lp} /><span className="text-[15px]"> LP</span></span>
                </Stat>
              : <Stat tipRef={thirdRef} label="Streak" sub={streak ? (streak.type ? 'consecutive wins' : 'consecutive losses') : 'no active streak'}>
                  <span style={{ color: streak ? (streak.type ? '#4FA890' : '#C75D54') : '#8A93A0' }}>{streak ? streak.count + (streak.type ? 'W' : 'L') : '—'}</span>
                </Stat>}
          </div>
        </div>

        <div className="lg:pt-1">
          <div className="flex items-center justify-between mb-2">
            <Meta>Engagement log · {queueLabel}</Meta>
            <Meta>older → newer</Meta>
          </div>
          <div className="relative overflow-hidden">
            <div className="flex items-end gap-[3px] h-[34px]">
              {chrono.map((m, i) => {
                const h = 30 + Math.min(1, kdaOf(m) / maxK) * 70
                return (
                  <motion.div key={i} title={`${m.win ? 'Victory' : 'Defeat'} · ${displayChamp(m.champion)} · ${m.kills}/${m.deaths}/${m.assists}`}
                    initial={{ height: 0 }} animate={{ height: h + '%' }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.025, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-1 min-w-[4px] rounded-[1px]" style={{ background: m.win ? '#4FA890' : '#C75D54', opacity: 0.85 }} />
                )
              })}
            </div>
            {/* One-time shimmer sweep after bars have risen */}
            <motion.div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.07) 50%,transparent 100%)' }}
              initial={{ x: '-100%' }} animate={{ x: '120%' }}
              transition={{ duration: 0.65, delay: 0.2 + chrono.length * 0.025 + 0.55, ease: 'easeInOut' }} />
          </div>
        </div>
      </div>
    </section>
  )
}
