import { Meta } from './primitives.jsx'

const NAV = [
  ['#sec-assess', 'Assessment'],
  ['#sec-find', 'Findings'],
  ['#sec-prof', 'Profile'],
]

export default function Masthead({ caseNo, showNav }) {
  return (
    <header className="sticky top-0 z-50 bg-ink/90 backdrop-blur-md border-b border-hair">
      <div className="mx-auto max-w-[980px] px-5 sm:px-7 flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-2.5">
          <svg width="24" height="26" viewBox="0 0 24 26" fill="none" aria-hidden="true">
            <path d="M12 1L22 6.5v13L12 25 2 19.5v-13L12 1z" stroke="#C7A86A" strokeWidth="1" fill="rgba(199,168,106,0.06)" />
            <path d="M12 6l5 2.75v5.5L12 17l-5-2.75v-5.5L12 6z" stroke="#9A7F4E" strokeWidth="0.8" />
            <circle cx="12" cy="11.5" r="1.4" fill="#C7A86A" />
          </svg>
          <div className="leading-tight">
            <div className="font-mono text-[11px] tracking-[0.26em] text-bone uppercase">Rift Intelligence</div>
            <Meta className="!text-[8px] !tracking-[0.22em] hidden sm:block">Summoner Reconnaissance Division</Meta>
          </div>
        </div>
        {showNav && (
          <nav className="hidden md:flex items-center gap-5">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className="font-mono text-[11px] tracking-[0.14em] uppercase text-faint hover:text-gold transition-colors">{label}</a>
            ))}
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
