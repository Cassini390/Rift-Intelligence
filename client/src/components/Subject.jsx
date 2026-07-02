import { motion, useReducedMotion } from 'framer-motion'
import { iconImg } from '../lib/ddragon.js'
import { Meta, RankChip } from './primitives.jsx'

// Ink stamp that slams onto the file once it opens — re-keyed per subject so each new file gets stamped.
function Stamp() {
  const reduce = useReducedMotion()
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  return (
    <motion.div aria-hidden="true"
      className="stamp absolute -top-2.5 right-4 sm:right-6 hidden sm:block"
      initial={reduce ? { opacity: 0.92, rotate: -7 } : { opacity: 0, scale: 2.6, rotate: -20, filter: 'blur(3px)' }}
      animate={reduce
        ? { opacity: 0.92, rotate: -7 }
        : { opacity: [0, 1, 0.92], scale: [2.6, 0.96, 1], rotate: [-20, -6.5, -7], filter: 'blur(0px)' }}
      transition={{ duration: 0.42, delay: 0.6, times: [0, 0.62, 1], ease: [0.16, 1, 0.3, 1] }}>
      File opened · {date}
    </motion.div>
  )
}

export default function Subject({ data }) {
  const meta = ['#' + data.tagLine, data.region || '—', 'Level ' + data.summonerLevel].join('  ·  ')
  return (
    <section id="sec-subject" className="relative card mt-7 px-5 sm:px-6 py-5">
      {data.gameName && <Stamp key={data.gameName + '#' + data.tagLine} />}
      <div className="flex items-center justify-between gap-5 flex-wrap">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="shrink-0 h-14 w-14 rounded-lg overflow-hidden ring-1 ring-goldsoft/60 bg-ink2 grid place-items-center font-display text-xl text-faint"
          >
            {data.profileIconId
              ? <img src={iconImg(data.profileIconId)} alt="" className="h-full w-full object-cover" />
              : (data.gameName || '?')[0].toUpperCase()}
          </motion.div>
          <div>
            <Meta className="block mb-1.5 !text-goldsoft">Subject</Meta>
            <h1 className="relative inline-block font-display font-semibold text-bone leading-none tracking-tight"
                style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)' }}>
              {data.gameName}
              {/* Redaction reveal — wipes away left→right */}
              <motion.span
                initial={{ scaleX: 1 }} animate={{ scaleX: 0 }}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.25 }}
                style={{ originX: 1, position: 'absolute', inset: '-1px -5px', background: '#15171C', borderRadius: 2 }}
              />
            </h1>
            <span className="block mt-2 text-[12.5px] text-faint">{meta}</span>
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
