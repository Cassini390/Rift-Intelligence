import { useState } from 'react'
import { motion } from 'framer-motion'
import { scoutingReport } from '../lib/analytics.js'
import { Eyebrow, GhostedNumeral } from './primitives.jsx'

const DOT = { good: '#4FA890', bad: '#C75D54', neutral: '#C7A86A' }

export default function Findings({ matches }) {
  const findings = scoutingReport(matches)
  const [showAll, setShowAll] = useState(false)
  const SHOW = 4
  const visible = showAll ? findings : findings.slice(0, SHOW)
  const extra = findings.length - SHOW

  if (!findings.length) {
    return (
      <div id="sec-find">
        <GhostedNumeral n={2}><Eyebrow className="block mb-5">§ Field findings</Eyebrow></GhostedNumeral>
        <p className="text-slate text-[13px] leading-relaxed max-w-lg">
          {matches.length < 6
            ? 'Insufficient intelligence — scout more engagements in this theatre for a full assessment.'
            : 'No standout patterns this stretch. The subject is unremarkable — itself a kind of stability.'}
        </p>
      </div>
    )
  }

  return (
    <div id="sec-find">
      <GhostedNumeral n={2}><Eyebrow className="block mb-5">§ Field findings</Eyebrow></GhostedNumeral>
      <div>
        {visible.map((f, i) => (
          <motion.div key={f.tag + i}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.07, ease: 'easeOut' }}
            className={`grid grid-cols-[1.6rem_1fr] gap-x-3.5 py-3.5 ${i < visible.length - 1 ? 'border-b border-hair' : ''}`}>
            <div className="font-mono text-[11px] tnum text-faint pt-0.5">{i < 9 ? '0' : ''}{i + 1}</div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-1 w-1 rounded-full" style={{ background: DOT[f.sev] }} />
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: DOT[f.sev] }}>{f.tag}</span>
              </div>
              <p className="font-display font-medium text-bone text-[15px] leading-snug">{f.headline}</p>
              <p className="text-slate text-[13px] leading-relaxed mt-1 max-w-xl">{f.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
      {extra > 0 && !showAll && (
        <button onClick={() => setShowAll(true)} className="mt-4 font-mono text-[10px] tracking-[0.14em] uppercase text-goldsoft hover:text-gold transition-colors">
          + {extra} further read{extra > 1 ? 's' : ''}
        </button>
      )}
    </div>
  )
}
