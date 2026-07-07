import { useEffect, useRef, useState } from 'react'
import { Meta } from './primitives.jsx'

const NAV = [
  ['sec-assess', 'Assessment'],
  ['sec-find', 'Findings'],
  ['sec-rec', 'Record'],
]

export default function Masthead({ caseNo, showNav }) {
  const headerRef = useRef(null)
  const [spot, setSpot] = useState(null)
  const [active, setActive] = useState(NAV[0][0])
  const onMove = (e) => {
    const r = headerRef.current?.getBoundingClientRect()
    if (r) setSpot({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  // Scrollspy — highlight the nav item for whichever section is currently in view.
  useEffect(() => {
    if (!showNav) return
    const sections = NAV.map(([id]) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [showNav])

  return (
    <header ref={headerRef} onMouseMove={onMove} onMouseLeave={() => setSpot(null)}
      className="sticky top-0 z-50 bg-ink/90 backdrop-blur-md border-b border-hair relative overflow-hidden">
      {spot && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(180px circle at ${spot.x}px ${spot.y}px, rgba(199,168,106,0.08) 0%, transparent 70%)` }} />
      )}
      <div className="relative mx-auto max-w-[980px] px-5 sm:px-7 flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-2.5">
          <svg width="24" height="26" viewBox="0 0 24 26" fill="none" aria-hidden="true">
            <path d="M12 1L22 6.5v13L12 25 2 19.5v-13L12 1z" stroke="#C7A86A" strokeWidth="1" fill="rgba(199,168,106,0.06)" />
            <path d="M12 6l5 2.75v5.5L12 17l-5-2.75v-5.5L12 6z" stroke="#9A7F4E" strokeWidth="0.8" />
            <circle cx="12" cy="11.5" r="1.4" fill="#C7A86A" />
          </svg>
          <div className="leading-tight">
            <div className="font-mono text-[11px] tracking-[0.26em] uppercase" style={{
              background: 'linear-gradient(105deg, #9A7F4E 0%, #C7A86A 35%, #E9E6DD 58%, #C7A86A 78%, #9A7F4E 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.9)) drop-shadow(0 -0.5px 0 rgba(255,255,255,0.07))',
            }}>Rift Intelligence</div>
            <Meta className="!text-[8px] !tracking-[0.22em] hidden sm:block">Summoner Reconnaissance Division</Meta>
          </div>
        </div>
        {showNav && (
          <nav className="hidden md:flex items-center gap-5">
            {NAV.map(([id, label]) => {
              const on = active === id
              return (
                <a key={id} href={'#' + id} aria-current={on ? 'true' : undefined}
                  className={`relative font-mono text-[11px] tracking-[0.14em] uppercase transition-colors ${on ? 'text-gold' : 'text-faint hover:text-gold'}`}>
                  {label}
                  <span className={`absolute -bottom-1 left-0 right-0 h-px bg-gold transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`} />
                </a>
              )
            })}
          </nav>
        )}
        <div className="text-right">
          <Meta className="text-goldsoft">Confidential</Meta>
          {caseNo && <Meta className="block !text-faint">{caseNo}</Meta>}
        </div>
      </div>
    </header>
  )
}
