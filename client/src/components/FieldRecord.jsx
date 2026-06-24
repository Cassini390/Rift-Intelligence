import { useState } from 'react'
import MatchRow from './MatchRow.jsx'
import ChampionPool from './ChampionPool.jsx'
import { Eyebrow, GhostedNumeral } from './primitives.jsx'

const CAP = 8

function Engagements({ matches }) {
  const [showAll, setShowAll] = useState(false)
  if (!matches.length) return <p className="text-slate text-[13px] py-5">No engagements in this theatre.</p>
  const visible = showAll ? matches : matches.slice(0, CAP)
  return (
    <div>
      {visible.map((m, i) => <MatchRow key={(m.ts || 0) + '-' + i} m={m} />)}
      {matches.length > CAP && !showAll && (
        <button onClick={() => setShowAll(true)} className="mt-4 font-mono text-[10px] tracking-[0.14em] uppercase text-goldsoft hover:text-gold transition-colors">
          + show all {matches.length} engagements
        </button>
      )}
    </div>
  )
}

export default function FieldRecord({ matches }) {
  const [view, setView] = useState('matches')
  const tab = (id, label) => (
    <button onClick={() => setView(id)}
      className={`font-mono text-[11px] tracking-[0.16em] uppercase pb-1 border-b transition-colors ${view === id ? 'text-bone border-gold' : 'text-faint hover:text-slate border-transparent'}`}>
      {label}
    </button>
  )
  return (
    <section id="sec-rec" className="py-7">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <GhostedNumeral n={4}><Eyebrow>§ Field record</Eyebrow></GhostedNumeral>
        <div className="flex gap-4">{tab('matches', 'Engagements')}{tab('champions', 'Champion dossier')}</div>
      </div>
      {view === 'matches' ? <Engagements matches={matches} /> : <ChampionPool matches={matches} />}
    </section>
  )
}
