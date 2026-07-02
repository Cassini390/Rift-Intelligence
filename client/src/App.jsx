import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { setVersion, loadChampNames, displayChamp } from './lib/ddragon.js'
import { mockData } from './lib/mock.js'
import Masthead from './components/Masthead.jsx'
import Subject from './components/Subject.jsx'
import Assessment from './components/Assessment.jsx'
import Findings from './components/Findings.jsx'
import Fingerprint from './components/Fingerprint.jsx'
import FieldRecord from './components/FieldRecord.jsx'
import { Eyebrow, Meta } from './components/primitives.jsx'

// Fixed corner registration ticks + diagonal CONFIDENTIAL watermark
function PageDecor() {
  const corners = [
    { top: 16, left: 16, borderTop: '1px solid rgba(199,168,106,0.16)', borderLeft: '1px solid rgba(199,168,106,0.16)' },
    { top: 16, right: 16, borderTop: '1px solid rgba(199,168,106,0.16)', borderRight: '1px solid rgba(199,168,106,0.16)' },
    { bottom: 16, left: 16, borderBottom: '1px solid rgba(199,168,106,0.16)', borderLeft: '1px solid rgba(199,168,106,0.16)' },
    { bottom: 16, right: 16, borderBottom: '1px solid rgba(199,168,106,0.16)', borderRight: '1px solid rgba(199,168,106,0.16)' },
  ]
  return (
    <div className="fixed inset-0 pointer-events-none select-none" style={{ zIndex: 9997 }} aria-hidden="true">
      {corners.map((s, i) => <div key={i} className="absolute w-4 h-4" style={s} />)}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '11vw', fontWeight: 700,
          color: 'rgba(233,230,221,0.016)', letterSpacing: '0.55em',
          textTransform: 'uppercase', transform: 'rotate(-25deg)', whiteSpace: 'nowrap',
        }}>CONFIDENTIAL</div>
      </div>
    </div>
  )
}

// Full-screen loading overlay with typewriter + scan line + flickering case number
function LoadingScreen({ name }) {
  const [text, setText] = useState('')
  const [flicker, setFlicker] = useState(true)
  const target = `DECRYPTING SUBJECT FILE — ${(name || 'SUBJECT').toUpperCase()}`

  useEffect(() => {
    let i = 0
    const id = setInterval(() => { i++; setText(target.slice(0, i)); if (i >= target.length) clearInterval(id) }, 38)
    return () => clearInterval(id)
  }, [target])

  useEffect(() => {
    const id = setInterval(() => setFlicker(Math.random() > 0.12), 90)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 bg-ink flex flex-col items-center justify-center"
      style={{ zIndex: 9999 }}>
      {/* Scan-line sweep */}
      <motion.div className="absolute inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(199,168,106,0.35),transparent)' }}
        initial={{ top: '0%' }} animate={{ top: '100%' }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'linear' }} />
      <div className="text-center px-6">
        <div className="font-mono text-[9px] tracking-[0.42em] text-goldsoft mb-7 uppercase">Rift Intelligence</div>
        <div className="font-mono text-[11px] sm:text-[13px] tracking-[0.1em] text-gold" style={{ minHeight: '1.5em' }}>
          {text}<motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>_</motion.span>
        </div>
        <div className="font-mono text-[9px] tracking-[0.22em] mt-5 uppercase"
          style={{ color: `rgba(86,94,107,${flicker ? 0.9 : 0.2})`, transition: 'color 0.05s' }}>
          Case No. — — — — —
        </div>
        <div className="flex gap-2 justify-center mt-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div key={i} className="rounded-full" style={{ width: 3, height: 3, background: '#9A7F4E' }}
              animate={{ opacity: [0.15, 1, 0.15], scaleY: [0.7, 1.6, 0.7] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function caseNumber(name) {
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return 'Case No. ' + (1000 + (h % 8999))
}

const BLANK_DATA = { gameName: '', tagLine: '', summonerLevel: 0, profileIconId: 29, region: '', rankedStats: {}, matches: [], ddVersion: '14.24.1' }

function getSamplePref() {
  try { return localStorage.getItem('lol_sample_data') !== 'off' } catch { return true }
}

export default function App() {
  const [useSample, setUseSample] = useState(getSamplePref)
  const [data, setData] = useState(() => getSamplePref() ? mockData(1735689600000) : BLANK_DATA)
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [region, setRegion] = useState('euw1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeQueue, setActiveQueue] = useState(null)
  const [activeChamp, setActiveChamp] = useState('All')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [, setChampNamesVersion] = useState(0)
  const lastQuery = useRef(null)

  useEffect(() => {
    loadChampNames(data.ddVersion).then(() => setChampNamesVersion((v) => v + 1))
  }, [data.ddVersion])

  // Restore the last search into the inputs (shared key with the vanilla build).
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('lol_last_search') || 'null')
      if (s) { setName(s.name || ''); setTag(s.tag || ''); if (s.region) setRegion(s.region) }
    } catch { /* ignore */ }
  }, [])

  // Auto-refresh: re-run the last search every 5 minutes while enabled.
  useEffect(() => {
    if (!autoRefresh || !lastQuery.current) return
    const id = setInterval(() => { doFetch(lastQuery.current) }, 300000)
    return () => clearInterval(id)
  }, [autoRefresh])

  // queues present, default to most-played (strict per-queue, no cross-queue aggregate)
  const queues = useMemo(() => {
    const c = {}; data.matches.forEach((m) => { c[m.queueLabel] = (c[m.queueLabel] || 0) + 1 })
    return Object.keys(c).sort((a, b) => c[b] - c[a]).map((q) => ({ q, n: c[q] }))
  }, [data])
  const queue = activeQueue && queues.some((x) => x.q === activeQueue) ? activeQueue : queues[0]?.q

  const champsInQueue = useMemo(() => {
    const c = {}; data.matches.filter((m) => m.queueLabel === queue).forEach((m) => { c[m.champion] = (c[m.champion] || 0) + 1 })
    return Object.keys(c).sort((a, b) => c[b] - c[a])
  }, [data, queue])

  const matches = useMemo(
    () => data.matches.filter((m) => m.queueLabel === queue && (activeChamp === 'All' || m.champion === activeChamp)),
    [data, queue, activeChamp],
  )

  async function doFetch(q) {
    setLoading(true); setError('')
    try {
      const r = await fetch(`/api/summoner?name=${encodeURIComponent(q.name)}&tag=${encodeURIComponent(q.tag || 'NA1')}&region=${q.region}`)
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'HTTP ' + r.status)
      setVersion(d.ddVersion); setActiveQueue(null); setActiveChamp('All'); setData(d)
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'No contact with the server. Is "node server.js" running?' : 'Error: ' + err.message)
    } finally { setLoading(false) }
  }
  function toggleSample() {
    setUseSample((prev) => {
      const next = !prev
      try { localStorage.setItem('lol_sample_data', next ? 'on' : 'off') } catch { /* ignore */ }
      if (next) { setData(mockData(1735689600000)); setActiveQueue(null); setActiveChamp('All') }
      else { setData(BLANK_DATA); setActiveQueue(null); setActiveChamp('All') }
      return next
    })
  }

  function scout(e) {
    e?.preventDefault()
    if (!name.trim()) { setError('Enter a subject codename.'); return }
    const q = { name: name.trim(), tag: tag.trim(), region }
    lastQuery.current = q
    try { localStorage.setItem('lol_last_search', JSON.stringify(q)) } catch { /* ignore */ }
    doFetch(q)
  }

  return (
    <>
      <PageDecor />
      <AnimatePresence>
        {loading && <LoadingScreen key="loading" name={lastQuery.current?.name} />}
      </AnimatePresence>
      <Masthead caseNo={caseNumber((data.gameName || '') + (data.tagLine || ''))} showNav />
      <div className="mx-auto max-w-[980px] px-5 sm:px-7 pb-24">

        {/* Intake */}
        <section className="py-7">
          <Eyebrow className="block mb-4">§ Open a file</Eyebrow>
          <form onSubmit={scout} className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
            <div className="flex-1">
              <Meta className="block mb-1.5">Subject codename</Meta>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summoner name"
                className="w-full bg-ink2/70 border border-hair rounded-md focus:border-gold outline-none transition-colors font-display font-medium text-bone text-lg placeholder:text-faint px-3.5 py-2" />
            </div>
            <div className="w-full sm:w-24">
              <Meta className="block mb-1.5">Tag</Meta>
              <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="EUW"
                className="w-full bg-ink2/70 border border-hair rounded-md focus:border-gold outline-none transition-colors font-mono text-bone text-sm placeholder:text-faint px-3.5 py-[13px]" />
            </div>
            <div className="w-full sm:w-28">
              <Meta className="block mb-1.5">Server</Meta>
              <select value={region} onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-ink2/70 border border-hair rounded-md focus:border-gold outline-none transition-colors font-mono text-bone text-sm px-3 py-[13px] cursor-pointer">
                {['na1', 'euw1', 'eune1', 'kr', 'br1', 'la1', 'la2', 'oc1', 'tr1', 'ru'].map((r) => <option key={r} className="bg-ink" value={r}>{r.replace(/\d/g, '').toUpperCase()}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="group shrink-0 font-mono text-[11px] tracking-[0.2em] uppercase text-gold border border-goldsoft/60 rounded-md px-4 py-[13px] hover:border-gold hover:bg-gold/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? 'Scouting…' : <>Open file <span className="transition-transform group-hover:translate-x-1">→</span></>}
            </button>
          </form>
          {error && <p className="text-oxblood text-[13px] mt-3 font-mono">{error}</p>}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
            <button type="button" onClick={() => setAutoRefresh((v) => !v)}
              className={`font-mono text-[10px] tracking-[0.14em] uppercase transition-colors ${autoRefresh ? 'text-gold' : 'text-faint hover:text-slate'}`}>
              ↻ Auto-refresh: {autoRefresh ? 'On' : 'Off'}
            </button>
            <button type="button" onClick={toggleSample}
              className={`font-mono text-[10px] tracking-[0.14em] uppercase transition-colors ${useSample ? 'text-gold' : 'text-faint hover:text-slate'}`}>
              ◈ Sample data: {useSample ? 'On' : 'Off'}
            </button>
            <Meta className="!text-faint normal-case !tracking-[0.04em]">
              {autoRefresh ? 'Re-running your last search every 5 minutes.' : useSample ? 'Showing sample data — run a search for live results.' : 'Blank slate — run a search to load a subject file.'}
            </Meta>
          </div>
        </section>

        <Subject data={data} />

        {/* Queue tabs */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-7">
          {queues.map(({ q, n }) => (
            <button key={q} onClick={() => { setActiveQueue(q); setActiveChamp('All') }}
              className={`font-mono text-[11px] tracking-[0.14em] uppercase transition-colors ${q === queue ? 'text-gold' : 'text-faint hover:text-slate'}`}>
              {q} <span className="tnum opacity-60">{n}</span>
            </button>
          ))}
        </div>
        {champsInQueue.length > 1 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3">
            <Meta className="mr-1">Filter</Meta>
            {['All', ...champsInQueue].map((ch) => (
              <button key={ch} onClick={() => setActiveChamp(ch)}
                className={`font-mono text-[11px] tracking-[0.04em] transition-colors ${ch === activeChamp ? 'text-bone' : 'text-faint hover:text-slate'}`}>
                {ch === 'All' ? 'All' : displayChamp(ch)}
              </button>
            ))}
          </div>
        )}

        <div className="pt-2">
          <Assessment matches={matches} queueLabel={queue} ranked={data.rankedStats} />
        </div>

        <section className="py-7 border-b border-hair">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
            <Findings matches={matches} />
            <Fingerprint matches={matches} />
          </div>
        </section>

        <FieldRecord matches={matches} />
      </div>
    </>
  )
}
