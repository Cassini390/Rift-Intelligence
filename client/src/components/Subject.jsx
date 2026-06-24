import { motion } from 'framer-motion'
import { iconImg } from '../lib/ddragon.js'
import { Meta, RankChip } from './primitives.jsx'

export default function Subject({ data }) {
  const meta = ['#' + data.tagLine, data.region || '—', 'Level ' + data.summonerLevel].join('  ·  ')
  return (
    <section id="sec-subject" className="py-7 border-b border-hair">
      <div className="flex items-start justify-between gap-5 flex-wrap">
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="shrink-0 h-14 w-14 rounded-sm overflow-hidden ring-1 ring-hair bg-ink2 grid place-items-center font-display text-xl text-faint"
          >
            {data.profileIconId
              ? <img src={iconImg(data.profileIconId)} alt="" className="h-full w-full object-cover" />
              : (data.gameName || '?')[0].toUpperCase()}
          </motion.div>
          <div>
            <Meta className="block mb-1.5">Subject</Meta>
            <h1 className="relative inline-block font-display font-semibold text-bone leading-none tracking-tight"
                style={{ fontSize: 'clamp(1.9rem,4.2vw,2.6rem)' }}>
              {data.gameName}
              {/* Redaction reveal — wipes away left→right */}
              <motion.span
                initial={{ scaleX: 1 }} animate={{ scaleX: 0 }}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.25 }}
                style={{ originX: 1, position: 'absolute', inset: '-1px -5px', background: '#15171C', borderRadius: 2 }}
              />
            </h1>
            <Meta className="block mt-2.5 !tracking-[0.12em] text-slate normal-case">{meta}</Meta>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <RankChip label="Solo" r={data.rankedStats?.solo} />
          {data.rankedStats?.flex && <RankChip label="Flex" r={data.rankedStats.flex} />}
        </div>
      </div>
    </section>
  )
}
