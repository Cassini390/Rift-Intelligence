import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { kdaOf, csPerMin, dmgShare, pc, roleName, matchReason } from '../lib/analytics.js'
import { champImg, itemImg, spellImg, displayChamp } from '../lib/ddragon.js'
import Scoreboard from './Scoreboard.jsx'

export default function MatchRow({ m }) {
  const [open, setOpen] = useState(false)
  const win = m.win
  const col = win ? '#4FA890' : '#C75D54'
  const mins = Math.floor(m.duration / 60), secs = String(m.duration % 60).padStart(2, '0')
  const date = m.ts ? new Date(m.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''
  const kda = kdaOf(m), ds = dmgShare(m), cspm = csPerMin(m)
  const kdaColor = kda >= 4 ? '#4FA890' : kda >= 2.5 ? '#E9E6DD' : kda >= 1.5 ? '#8A93A0' : '#C75D54'

  return (
    <div className="match-row border-b border-hair">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left flex items-center gap-3 sm:gap-4 py-2.5 group">
        <span className="shrink-0 w-11">
          <span className="font-mono text-[11px] tracking-[0.14em] uppercase" style={{ color: col }}>{win ? 'Win' : 'Loss'}</span>
          <span className="block font-mono text-[10px] tracking-[0.04em] text-faint tnum mt-0.5">{mins}:{secs}</span>
        </span>
        <span className="shrink-0 relative">
          <span className="block h-10 w-10 rounded-sm overflow-hidden ring-1" style={{ '--tw-ring-color': col + '40' }}>
            <img src={champImg(m.champion)} className="h-full w-full object-cover scale-110" alt={m.champion} />
          </span>
          <span className="absolute -bottom-1 -right-1 flex gap-0.5">
            {m.spell1 && <span className="h-3.5 w-3.5 rounded-[2px] overflow-hidden bg-ink2"><img src={spellImg(m.spell1)} className="h-full w-full" alt="" /></span>}
            {m.spell2 && <span className="h-3.5 w-3.5 rounded-[2px] overflow-hidden bg-ink2"><img src={spellImg(m.spell2)} className="h-full w-full" alt="" /></span>}
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display font-medium text-bone text-[14px] leading-tight">{displayChamp(m.champion)}</span>
          <span className="block font-mono text-[10px] tracking-[0.08em] uppercase text-faint mt-0.5">{m.role ? roleName(m.role) + ' · ' : ''}{m.queueLabel}</span>
        </span>
        <span className="shrink-0 text-right hidden sm:block">
          <span className="block font-mono tnum text-[13px] text-bone">{m.kills} / <span style={{ color: '#C75D54' }}>{m.deaths}</span> / {m.assists}</span>
          <span className="block font-mono text-[10px] tracking-[0.04em] uppercase mt-0.5" style={{ color: kdaColor }}>{kda.toFixed(2)} KDA</span>
        </span>
        <span className="shrink-0 text-right hidden md:block w-16">
          <span className="block font-mono tnum text-[12px] text-slate">{cspm.toFixed(1)} cs/m</span>
          <span className="block font-mono text-[10px] tracking-[0.04em] uppercase text-faint mt-0.5">{ds != null ? pc(ds) + '% dmg' : ''}</span>
        </span>
        <span className="shrink-0 font-mono text-[10px] tracking-[0.14em] uppercase text-faint hidden sm:inline">{date}</span>
        <span className="shrink-0 font-mono text-[10px] text-faint group-hover:text-slate transition-colors">{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }} style={{ overflow: 'hidden' }}>
            <div className="pb-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const id = (m.items || [])[i]
                    return id
                      ? <div key={i} className="h-6 w-6 rounded-[2px] bg-ink2 overflow-hidden"><img src={itemImg(id)} className="h-full w-full" alt="" /></div>
                      : <div key={i} className="h-6 w-6 rounded-[2px] bg-ink2/50 ring-1 ring-hair" />
                  })}
                  {m.trinket && <div className="h-6 w-6 rounded-full bg-ink2 overflow-hidden ml-1"><img src={itemImg(m.trinket)} className="h-full w-full" alt="" /></div>}
                </div>
                <div className="font-mono text-[11px]">
                  <span className="tracking-[0.2em] uppercase text-goldsoft mr-2">Read</span>
                  <span style={{ color: col }}>{matchReason(m)}</span>
                </div>
              </div>
              <Scoreboard m={m} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
