import { kdaOf, mean } from '../lib/analytics.js'
import { champImg, displayChamp } from '../lib/ddragon.js'
import { Meta } from './primitives.jsx'

const MIN = 3

function Sparkline({ values }) {
  if (values.length < 2) return <span className="text-faint font-mono text-[11px]">—</span>
  const W = 44, H = 16
  const mn = Math.min(...values), mx = Math.max(...values)
  const range = mx - mn || 0.01
  const pts = values.map((v, i) =>
    `${((i / (values.length - 1)) * W).toFixed(1)},${(H - 2 - ((v - mn) / range) * (H - 4)).toFixed(1)}`
  ).join(' ')
  const half = Math.floor(values.length / 2)
  const early = mean(values.slice(0, half)), late = mean(values.slice(half))
  const color = late > early * 1.05 ? '#4FA890' : late < early * 0.95 ? '#C75D54' : '#8A93A0'
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}

export default function ChampionPool({ matches }) {
  const c = {}
  matches.forEach((m) => {
    const x = c[m.champion] || (c[m.champion] = { g: 0, w: 0, k: 0, d: 0, a: 0, cs: 0, dmg: 0, vis: 0, kl: [] })
    x.g++; if (m.win) x.w++
    x.k += m.kills; x.d += m.deaths; x.a += m.assists; x.cs += m.cs; x.dmg += m.damageDealt || 0; x.vis += m.visionScore || 0
    x.kl.push(kdaOf(m))
  })
  const sorted = Object.keys(c).map((k) => [k, c[k]]).sort((a, b) => b[1].g - a[1].g)
  if (!sorted.length) return <p className="text-slate text-[13px] py-5">No champions in this theatre.</p>

  const total = matches.length
  const topShare = Math.round((sorted[0][1].g / total) * 100)
  const distinct = sorted.length
  const conc = topShare >= 50 ? `Concentrated — ${topShare}% of games on ${displayChamp(sorted[0][0])}.`
    : distinct >= 7 ? `Wide — ${distinct} champions across ${total} games.`
    : `Balanced — ${distinct} champions, top is ${topShare}%.`

  return (
    <div>
      <p className="text-slate text-[13px] mb-4"><span className="font-mono text-[10px] tracking-[0.2em] uppercase text-goldsoft mr-2">Pool</span>{conc}</p>
      <div className="card overflow-x-auto px-4.5 sm:px-5 py-3">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-hair">
              {['Champion', 'G', 'Win rate', 'KDA', 'Mastery', 'CS', 'Dmg', 'Vis'].map((h, i) => (
                <th key={h} className={`font-mono text-[10px] tracking-[0.14em] uppercase text-faint font-normal pb-2.5 pr-4 ${i > 1 ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(([ch, s]) => {
              const wr = Math.round((s.w / s.g) * 100)
              const kda = (s.k + s.a) / Math.max(1, s.d)
              const gated = s.g >= MIN
              const wc = wr >= 50 ? '#4FA890' : '#C75D54'
              const chrono = s.kl.slice().reverse()
              return (
                <tr key={ch} className="border-b border-hair/60">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <img src={champImg(ch)} className="h-6 w-6 rounded-sm object-cover scale-110" alt="" />
                      <span className="font-display font-medium text-[14px] text-bone">{displayChamp(ch)}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 font-mono tnum text-[12px] text-slate">{s.g}</td>
                  <td className="py-2.5 pr-4">
                    {gated ? (
                      <div className="flex items-center gap-2 justify-end">
                        <div className="h-[3px] w-12 bg-ink2 overflow-hidden rounded-full"><div className="h-full rounded-full" style={{ width: wr + '%', background: wc }} /></div>
                        <span className="font-mono tnum text-[12px]" style={{ color: wc }}>{wr}%</span>
                      </div>
                    ) : (
                      <div className="text-right"><span className="font-mono tnum text-[12px] text-faint" title={`Min ${MIN} games to rate`}>{wr}%*</span></div>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 font-mono tnum text-[12px] text-bone text-right">{kda.toFixed(2)}</td>
                  <td className="py-2.5 pr-4"><div className="flex justify-end"><Sparkline values={chrono} /></div></td>
                  <td className="py-2.5 pr-4 font-mono tnum text-[12px] text-slate text-right">{Math.round(s.cs / s.g)}</td>
                  <td className="py-2.5 pr-4 font-mono tnum text-[12px] text-slate text-right">{(s.dmg / s.g / 1000).toFixed(1)}k</td>
                  <td className="py-2.5 font-mono tnum text-[12px] text-slate text-right">{(s.vis / s.g).toFixed(1)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Meta className="block mt-2.5 !text-faint normal-case !tracking-[0.02em]">* Win rate not rated below {MIN} games — too small to read.</Meta>
    </div>
  )
}
