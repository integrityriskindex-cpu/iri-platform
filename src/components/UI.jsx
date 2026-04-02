import { iriBand } from '../utils/iri.js'

// ─── Design tokens ────────────────────────────────────────────────────────────
export const S = {
  bg:'#0a0e1a', card:'#111827', mid:'#1f2937', border:'#1e2d40',
  accent:'#f59e0b', text:'#e5e7eb', dim:'#6b7280', midText:'#9ca3af',
  danger:'#ef4444', warn:'#f97316', ok:'#22c55e', info:'#3b82f6',
}

export const card   = { background:S.card, border:`1px solid ${S.border}`, borderRadius:12, padding:20 }
export const cardSm = { ...card, padding:14 }

export const badge = (color) => ({
  display:'inline-block', background:color+'22', color,
  border:`1px solid ${color}44`, borderRadius:4, padding:'2px 8px',
  fontSize:11, fontWeight:600,
})

// ─── Button ───────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, color=S.accent, variant='fill', size='md', disabled, style={} }) {
  const pad = size==='sm'?'5px 12px':size==='lg'?'12px 24px':'8px 18px'
  const fs  = size==='sm'?12:13
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background:variant==='fill'?color:'transparent',
      color:variant==='fill'?'#000':color,
      border:`1px solid ${color}`, borderRadius:6,
      padding:pad, fontSize:fs, fontWeight:700,
      cursor:disabled?'not-allowed':'pointer', opacity:disabled?.5:1,
      transition:'all .15s', ...style,
    }}>{children}</button>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
      <div>
        <div style={{ color:S.text, fontSize:18, fontWeight:700 }}>{title}</div>
        {subtitle && <div style={{ color:S.dim, fontSize:12, marginTop:3 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display:'flex', gap:8 }}>{actions}</div>}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color=S.accent }) {
  return (
    <div style={{ ...cardSm, flex:1, minWidth:130 }}>
      <div style={{ color:S.dim, fontSize:11, marginBottom:4 }}>{label}</div>
      <div style={{ color, fontSize:26, fontWeight:800 }}>{value}</div>
      {sub && <div style={{ color:S.dim, fontSize:10, marginTop:2 }}>{sub}</div>}
    </div>
  )
}

// ─── IRI progress bar ─────────────────────────────────────────────────────────
export function IRIBar({ label, value, color }) {
  return (
    <div style={{ marginBottom:9 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
        <span style={{ color:S.midText, fontSize:12 }}>{label}</span>
        <span style={{ color, fontSize:12, fontWeight:600 }}>{value.toFixed(1)}</span>
      </div>
      <div style={{ background:S.mid, borderRadius:4, height:7 }}>
        <div style={{ background:color, borderRadius:4, height:7, width:`${Math.min(value,100)}%`, transition:'width .4s' }}/>
      </div>
    </div>
  )
}

// ─── IRI Gauge SVG ────────────────────────────────────────────────────────────
export function IRIGauge({ value, size=150 }) {
  const band=iriBand(value), r=54, cx=70, cy=70
  const toR=d=>d*Math.PI/180, sA=-210, rng=240, pct=value/100
  const ap=(a1,a2,rad)=>{
    const x1=cx+rad*Math.cos(toR(a1)),y1=cy+rad*Math.sin(toR(a1))
    const x2=cx+rad*Math.cos(toR(a2)),y2=cy+rad*Math.sin(toR(a2))
    return `M${x1.toFixed(2)},${y1.toFixed(2)} A${rad},${rad} 0 ${Math.abs(a2-a1)>180?1:0},1 ${x2.toFixed(2)},${y2.toFixed(2)}`
  }
  const eA=sA+pct*rng, nx=cx+46*Math.cos(toR(eA)), ny=cy+46*Math.sin(toR(eA))
  return (
    <div style={{ textAlign:'center' }}>
      <svg width={size} height={size} viewBox="0 0 140 140">
        <path d={ap(sA,sA+rng,r)} fill="none" stroke="#1f2937" strokeWidth={10} strokeLinecap="round"/>
        <path d={ap(sA,eA,r)}     fill="none" stroke={band.color} strokeWidth={10} strokeLinecap="round"/>
        <line x1={cx} y1={cy} x2={nx.toFixed(2)} y2={ny.toFixed(2)} stroke={band.color} strokeWidth={2.5} strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r={4} fill={band.color}/>
        <text x={cx} y={cy+18} textAnchor="middle" fill={band.color} fontSize={28} fontWeight="800" fontFamily="'IBM Plex Mono',monospace">{Math.round(value)}</text>
        <text x={cx} y={cy+32} textAnchor="middle" fill={S.dim} fontSize={9}>IRI Score</text>
        <text x={cx} y={cy+46} textAnchor="middle" fill={band.color} fontSize={10} fontWeight="700">{band.label}</text>
      </svg>
      <span style={{ ...badge(band.color) }}>{band.label} RISK</span>
    </div>
  )
}

// ─── Tab pill ─────────────────────────────────────────────────────────────────
export function TabPill({ id, label, active, onClick, badgeCount }) {
  return (
    <button onClick={()=>onClick(id)} style={{
      display:'flex', alignItems:'center', gap:5,
      padding:'7px 13px',
      background:active?S.mid:'transparent',
      color:active?S.accent:S.dim,
      border:`1px solid ${active?S.border:'transparent'}`,
      borderRadius:7, cursor:'pointer', fontSize:13,
      fontWeight:active?700:400, whiteSpace:'nowrap', transition:'all .15s',
    }}>
      {label}
      {badgeCount>0 && <span style={{ ...badge(S.danger), padding:'1px 5px', fontSize:10 }}>{badgeCount}</span>}
    </button>
  )
}

// ─── Field input ──────────────────────────────────────────────────────────────
export function Field({ label, children, hint }) {
  return (
    <div>
      {label && <label style={{ color:S.dim, fontSize:11, display:'block', marginBottom:5, letterSpacing:.4 }}>{label}</label>}
      {children}
      {hint && <div style={{ color:S.dim, fontSize:10, marginTop:3 }}>{hint}</div>}
    </div>
  )
}

export const fieldStyle = {
  width:'100%', background:S.mid, border:`1px solid ${S.border}`,
  borderRadius:6, padding:'9px 11px', color:S.text, fontSize:13, outline:'none',
}
