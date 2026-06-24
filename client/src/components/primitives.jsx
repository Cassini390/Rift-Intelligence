import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'

// §-section eyebrow label
export function Eyebrow({ children, className = '' }) {
  return (
    <span className={`font-mono text-[10px] tracking-[0.24em] uppercase text-goldsoft ${className}`}>
      {children}
    </span>
  )
}

export function Meta({ children, className = '' }) {
  return <span className={`font-mono text-[10px] tracking-[0.14em] uppercase text-faint ${className}`}>{children}</span>
}

// Mono metadata divider line label (e.g. "§ Assessment ─────")
export function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3">
      <Eyebrow>{children}</Eyebrow>
      <span className="flex-1 h-px bg-hair" />
    </div>
  )
}

// Animated number that counts up to `value` once on mount/update.
export function CountUp({ value, decimals = 0, suffix = '', className = '', style }) {
  const ref = useRef(null)
  useEffect(() => {
    const node = ref.current; if (!node) return
    const controls = animate(0, value, {
      duration: 0.7, ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { node.textContent = v.toFixed(decimals) + suffix },
    })
    return () => controls.stop()
  }, [value, decimals, suffix])
  return <span ref={ref} className={className} style={style}>{(0).toFixed(decimals) + suffix}</span>
}

const TIER = (t) => `var(--t-${(t || 'UNRANKED').toUpperCase()}, var(--t-UNRANKED))`
export const tierColor = TIER

export function RankChip({ label, r }) {
  if (!r) return <Meta>{label} · Unranked</Meta>
  const col = TIER(r.tier)
  const wr = r.wins + r.losses ? Math.round((r.wins / (r.wins + r.losses)) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-[12px] font-mono">
      <span className="emblem" style={{ background: col }}>{r.tier ? r.tier[0] : '?'}</span>
      <Meta>{label}</Meta>
      <span style={{ color: col }}>{r.tier} {r.rank}</span>
      <span className="text-slate tnum">{r.lp} LP</span>
      <span className="text-faint tnum">{wr}%</span>
    </div>
  )
}

// Lightweight hover/focus tooltip.
let tipNode
function ensureTip() {
  if (!tipNode) {
    tipNode = document.createElement('div')
    tipNode.style.cssText = 'position:fixed;z-index:200;pointer-events:none;opacity:0;transition:opacity .12s ease;max-width:260px'
    document.body.appendChild(tipNode)
  }
  return tipNode
}
export function useTip(html) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    el.style.cursor = 'help'; if (el.tabIndex < 0) el.tabIndex = 0
    const card = `<div style="background:#10131A;border:1px solid #2A313B;border-radius:6px;padding:9px 11px;box-shadow:0 12px 30px rgba(0,0,0,.55)">${html}</div>`
    const move = (e) => { const t = ensureTip(); const r = t.getBoundingClientRect()
      t.style.left = Math.min(Math.max(8, e.clientX + 14), window.innerWidth - r.width - 8) + 'px'
      let top = e.clientY - r.height - 14; if (top < 8) top = e.clientY + 14; t.style.top = top + 'px' }
    const show = (e) => { const t = ensureTip(); t.innerHTML = card; t.style.opacity = '1'; if (e.clientX != null) move(e) }
    const showF = () => { const t = ensureTip(); t.innerHTML = card; t.style.opacity = '1'; const r = el.getBoundingClientRect(); t.style.left = Math.min(r.left, window.innerWidth - 268) + 'px'; t.style.top = r.bottom + 8 + 'px' }
    const hide = () => { if (tipNode) tipNode.style.opacity = '0' }
    el.addEventListener('mouseenter', show); el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', hide); el.addEventListener('focus', showF); el.addEventListener('blur', hide)
    return () => { el.removeEventListener('mouseenter', show); el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', hide); el.removeEventListener('focus', showF); el.removeEventListener('blur', hide); hide() }
  }, [html])
  return ref
}

// Large ghost numeral behind a section header — pure editorial background texture.
export function GhostedNumeral({ n, children }) {
  return (
    <div className="relative">
      <span aria-hidden="true" className="absolute select-none pointer-events-none font-mono font-bold leading-none"
        style={{ top: '-1.4rem', left: 0, fontSize: '5rem', color: 'rgba(199,168,106,0.055)', letterSpacing: '-0.03em' }}>
        {String(n).padStart(2, '0')}
      </span>
      {children}
    </div>
  )
}

export function tip(label, desc, extra = '') {
  return `<div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#C7A86A;margin-bottom:4px">${label}</div><div style="font-size:12px;line-height:1.45;color:#C2C8D2">${desc}</div>${extra}`
}
