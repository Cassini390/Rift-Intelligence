import { motion } from 'framer-motion'
import { fingerprint } from '../lib/analytics.js'
import { Eyebrow, Meta, useTip, tip } from './primitives.jsx'

function Row({ r }) {
  const ref = useTip(tip(
    r.k, r.desc,
    `<div style="display:flex;gap:14px;margin-top:7px;font-family:'JetBrains Mono',monospace;font-size:11px"><span style="color:#4FA890">Wins ${r.fmt(r.mw)}</span><span style="color:#C75D54">Losses ${r.fmt(r.ml)}</span></div><div style="font-size:11px;line-height:1.4;color:#8A93A0;margin-top:6px;font-style:italic">${r.read}</div>`,
  ))
  return (
    <div ref={ref}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] text-slate">{r.k}</span>
        <Meta>{r.posWin ? 'in wins' : 'in losses'}</Meta>
      </div>
      <div className="relative h-3">
        <span className="absolute left-1/2 top-0 bottom-0 w-px bg-hair" />
        <motion.span
          initial={{ width: 0 }} animate={{ width: r.widthPct + '%' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="absolute top-[3px] bottom-[3px] rounded-[1px]"
          style={{ [r.posWin ? 'left' : 'right']: '50%', background: r.good ? '#4FA890' : '#C75D54' }}
        />
      </div>
    </div>
  )
}

export default function Fingerprint({ matches }) {
  const rows = fingerprint(matches)
  return (
    <div id="sec-prof">
      <Eyebrow className="block mb-1.5">§ Biometric profile</Eyebrow>
      <p className="text-slate text-[13px] mb-6 max-w-lg">How each trait separates the subject's victories from defeats, in this theatre.</p>
      {rows
        ? <div className="space-y-3.5">{rows.map((r) => <Row key={r.k} r={r} />)}</div>
        : <Meta className="normal-case !tracking-[0.04em] text-slate">Need at least three victories and three defeats to profile.</Meta>}
    </div>
  )
}
