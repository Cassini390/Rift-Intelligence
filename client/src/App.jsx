import { useEffect, useMemo, useRef, useState } from 'react'
import { setVersion, loadChampNames } from './lib/ddragon.js'
import { mockData } from './lib/mock.js'
import Masthead from './components/Masthead.jsx'
import Subject from './components/Subject.jsx'
import Assessment from './components/Assessment.jsx'
import Findings from './components/Findings.jsx'
import Fingerprint from './components/Fingerprint.jsx'
import FieldRecord from './components/FieldRecord.jsx'
import { Eyebrow, Meta } from './components/primitives.jsx'

function caseNumber(name) {
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return 'Case No. ' + (1000 + (h % 8999))
}

export default function App() {
  const [data, setData] = useState(() => mockData(1735689600000)) // fixed timestamp → deterministic sample
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [region, setRegion] = useState('euw1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeQueue, setActiveQueue] = useState(null)
  const [activeChamp, setActiveChamp] = useState('All')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const lastQuery = useRef(null)

  useEffect(() => { loadChampNames(data.ddVersion) }, [data.ddVersion])

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
      <Masthead caseNo={caseNumber((data.gameName || '') + (data.tagLine || ''))} showNav />
      <div className="mx-auto max-w-[980px] px-5 sm:px-7 pb-24">

        {/* Intake */}
        <section className="py-7">
          <Eyebrow className="block mb-4">§ Open a file</Eyebrow>
          <form onSubmit={scout} className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
            <div className="flex-1">
              <Meta className="block mb-1.5">Subject codename</Meta>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summoner name"
                className="w-full bg-transparent border-b border-hair focus:border-gold outline-none transition-colors font-display font-medium text-bone text-xl sm:text-2xl placeholder:text-faint pb-1.5" />
            </div>
            <div className="w-full sm:w-20">
              <Meta className="block mb-1.5">Tag</Meta>
              <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="EUW"
                className="w-full bg-transparent border-b border-hair focus:border-gold outline-none transition-colors font-mono text-bone text-base placeholder:text-faint pb-1.5" />
            </div>
            <div className="w-full sm:w-24">
              <Meta className="block mb-1.5">Server</Meta>
              <select value={region} onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-transparent border-b border-hair focus:border-gold outline-none transition-colors font-mono text-bone text-base pb-1.5 cursor-pointer">
                {['na1', 'euw1', 'eune1', 'kr', 'br1', 'la1', 'la2', 'oc1', 'tr1', 'ru'].map((r) => <option key={r} className="bg-ink" value={r}>{r.replace(/\d/g, '').toUpperCase()}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="group shrink-0 font-mono text-[11px] tracking-[0.2em] uppercase text-gold hover:text-bone transition-colors pb-2 flex items-center gap-2">
              {loading ? 'Scouting…' : <>Open file <span className="transition-transform group-hover:translate-x-1">→</span></>}
            </button>
          </form>
          {error && <p className="text-oxblood text-[13px] mt-3 font-mono">{error}</p>}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
            <button type="button" onClick={() => setAutoRefresh((v) => !v)}
              className={`font-mono text-[10px] tracking-[0.14em] uppercase transition-colors ${autoRefresh ? 'text-gold' : 'text-faint hover:text-slate'}`}>
              ↻ Auto-refresh: {autoRefresh ? 'On' : 'Off'}
            </button>
            <Meta className="!text-faint normal-case !tracking-[0.04em]">
              {autoRefresh ? 'Re-running your last search every 5 minutes.' : 'Showing sample data — run a search against your local server for live results.'}
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
                {ch === 'All' ? 'all' : ch.toLowerCase()}
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
