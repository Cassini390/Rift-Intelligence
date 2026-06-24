import { champImg, itemImg, spellImg, runeImg } from '../lib/ddragon.js'
import { Meta } from './primitives.jsx'

function Spell({ id }) {
  return <div className="h-3.5 w-3.5 rounded-[2px] overflow-hidden bg-ink2">{id && <img src={spellImg(id)} className="h-full w-full" alt="" />}</div>
}

function PlayerRow({ p }) {
  return (
    <div className={`sb-grid sb-row${p.isYou ? ' you' : ''}`}>
      <div className="h-6 w-6 rounded-[2px] overflow-hidden ring-1 ring-hair"><img src={champImg(p.champion)} className="h-full w-full object-cover scale-110" alt={p.champion} /></div>
      <Spell id={p.spell1} />
      <Spell id={p.spell2} />
      <div className="h-5 w-5 grid place-items-center">{p.keystone && <img src={runeImg(p.keystone.icon)} className="h-4 w-4" alt="" title={p.keystone.name} />}</div>
      <div className={`truncate text-[11px] ${p.isYou ? 'text-gold' : 'text-slate'}`} title={p.summonerName}>{p.isYou ? '★ ' : ''}{p.summonerName}</div>
      <div className="font-mono tnum text-[11px] text-bone text-right">{p.kills}/{p.deaths}/{p.assists}</div>
      <div className="font-mono tnum text-[11px] text-faint text-right">{p.cs}</div>
      <div className="flex gap-0.5 justify-end">
        {Array.from({ length: 6 }).map((_, i) => {
          const id = (p.items || [])[i]
          return id
            ? <div key={i} className="h-4 w-4 rounded-[2px] bg-ink2 overflow-hidden"><img src={itemImg(id)} className="h-full w-full" alt="" /></div>
            : <div key={i} className="h-4 w-4 rounded-[2px] bg-ink2/50" />
        })}
      </div>
    </div>
  )
}

export default function Scoreboard({ m }) {
  if (!m.allPlayers?.length) return <Meta className="normal-case text-slate">Scoreboard unavailable for this engagement.</Meta>
  return (
    <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
      {[{ id: 100, label: 'Blue side' }, { id: 200, label: 'Red side' }].map((side) => {
        const players = m.allPlayers.filter((p) => p.teamId === side.id)
        if (!players.length) return null
        const win = players[0].win
        return (
          <div key={side.id}>
            <div className="flex items-center justify-between mb-2">
              <Meta>{side.label}</Meta>
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase" style={{ color: win ? '#4FA890' : '#C75D54' }}>{win ? 'Victory' : 'Defeat'}</span>
            </div>
            {players.map((p, i) => <PlayerRow key={i} p={p} />)}
          </div>
        )
      })}
    </div>
  )
}
