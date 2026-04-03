import { iriBand } from '../utils/iri.js'

export const S = {
  bg:'#0a0e1a', card:'#111827', mid:'#1f2937', border:'#1e2d40',
  accent:'#f59e0b', text:'#e5e7eb', dim:'#6b7280', midText:'#9ca3af',
  danger:'#ef4444', warn:'#f97316', ok:'#22c55e', info:'#3b82f6',
  god:'#a855f7', secure:'#06b6d4',
}
export const card   = { background:S.card, border:`1px solid ${S.border}`, borderRadius:12, padding:20 }
export const cardSm = { ...card, padding:14 }
export const badge  = (color) => ({
  display:'inline-block', background:color+'22', color,
  border:`1px solid ${color}44`, borderRadius:4, padding:'2px 8px', fontSize:11, fontWeight:600,
})
export const fieldStyle = {
  width:'100%', background:S.mid, border:`1px solid ${S.border}`,
  borderRadius:6, padding:'9px 11px', color:S.text, fontSize:13, outline:'none',
}
export const textareaStyle = {
  ...fieldStyle, resize:'vertical', minHeight:80, fontFamily:'inherit', lineHeight:1.6,
}

export function Btn({ children, onClick, color=S.accent, variant='fill', size='md', disabled, style={} }) {
  const pad = size==='sm'?'5px 12px':size==='lg'?'12px 24px':'8px 18px'
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background:variant==='fill'?color:'transparent',
      color:variant==='fill'?'#000':color,
      border:`1px solid ${color}`, borderRadius:6, padding:pad,
      fontSize:size==='sm'?12:13, fontWeight:700,
      cursor:disabled?'not-allowed':'pointer', opacity:disabled?.5:1,
      transition:'all .15s', whiteSpace:'nowrap', ...style,
    }}>{children}</button>
  )
}

export function SectionHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, gap:12 }}>
      <div>
        <div style={{ color:S.text, fontSize:18, fontWeight:700 }}>{title}</div>
        {subtitle && <div style={{ color:S.dim, fontSize:12, marginTop:3 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display:'flex', gap:8, flexWrap:'wrap', flexShrink:0 }}>{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, sub, color=S.accent, onClick }) {
  return (
    <div onClick={onClick} style={{ ...cardSm, flex:1, minWidth:120, cursor:onClick?'pointer':'default' }}>
      <div style={{ color:S.dim, fontSize:11, marginBottom:4 }}>{label}</div>
      <div style={{ color, fontSize:26, fontWeight:800 }}>{value}</div>
      {sub && <div style={{ color:S.dim, fontSize:10, marginTop:2 }}>{sub}</div>}
    </div>
  )
}

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

export function TabPill({ id, label, active, onClick, badgeCount }) {
  return (
    <button onClick={()=>onClick(id)} style={{
      display:'flex', alignItems:'center', gap:5, padding:'7px 13px',
      background:active?S.mid:'transparent', color:active?S.accent:S.dim,
      border:`1px solid ${active?S.border:'transparent'}`,
      borderRadius:7, cursor:'pointer', fontSize:13,
      fontWeight:active?700:400, whiteSpace:'nowrap', transition:'all .15s',
    }}>
      {label}
      {badgeCount>0 && <span style={{ ...badge(S.danger), padding:'1px 5px', fontSize:10 }}>{badgeCount}</span>}
    </button>
  )
}

export function Field({ label, children, hint, required }) {
  return (
    <div>
      {label && <label style={{ color:S.dim, fontSize:11, display:'block', marginBottom:5, letterSpacing:.4 }}>
        {label}{required && <span style={{ color:S.danger }}> *</span>}
      </label>}
      {children}
      {hint && <div style={{ color:S.dim, fontSize:10, marginTop:3 }}>{hint}</div>}
    </div>
  )
}

export function Toggle({ on, onChange, label, color=S.ok }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={()=>onChange(!on)}>
      <div style={{ width:40, height:20, borderRadius:10, background:on?color:S.mid, position:'relative', transition:'background .2s', flexShrink:0 }}>
        <div style={{ position:'absolute', top:2, left:on?22:2, width:16, height:16, borderRadius:'50%', background:'white', transition:'left .2s' }}/>
      </div>
      {label && <span style={{ color:S.text, fontSize:13 }}>{label}</span>}
    </div>
  )
}

export function SportBadge({ sport }) {
  const colors = { tennis:'#22c55e', nfl:'#3b82f6', cfb:'#f97316', cbb:'#8b5cf6', baseball:'#ef4444', hockey:'#06b6d4', wnba:'#ec4899', soccer_epl:'#84cc16', soccer_mls:'#eab308', golf_pga:'#f59e0b', golf_liv:'#a855f7', college_volleyball:'#f97316' }
  const icons  = { tennis:'🎾', nfl:'🏈', cfb:'🏈', cbb:'🏀', baseball:'⚾', hockey:'🏒', wnba:'🏀', soccer_epl:'⚽', soccer_mls:'⚽', golf_pga:'⛳', golf_liv:'⛳', college_volleyball:'🏐', all:'🌐' }
  const c = colors[sport] || S.midText
  return <span style={{ ...badge(c), fontSize:10 }}>{icons[sport]||'🏆'} {sport?.replace(/_/g,' ').toUpperCase()}</span>
}

// Timeline entry component
export function TimelineEntry({ ts, user, type, content, color=S.info, icon='📋' }) {
  return (
    <div style={{ display:'flex', gap:12, marginBottom:14 }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:color+'22', border:`2px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{icon}</div>
        <div style={{ width:2, flex:1, background:S.border, marginTop:4 }}/>
      </div>
      <div style={{ flex:1, paddingBottom:14 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
          <span style={{ ...badge(color), fontSize:10 }}>{type}</span>
          <span style={{ color:S.text, fontSize:12, fontWeight:600 }}>{user}</span>
          <span style={{ color:S.dim, fontSize:11, fontFamily:"'IBM Plex Mono',monospace" }}>{ts}</span>
        </div>
        <div style={{ color:S.midText, fontSize:12, lineHeight:1.6 }}>{content}</div>
      </div>
    </div>
  )
}

// Secure message bubble
export function MessageBubble({ msg, isMine }) {
  return (
    <div style={{ display:'flex', justifyContent:isMine?'flex-end':'flex-start', marginBottom:10 }}>
      <div style={{ maxWidth:'70%' }}>
        {!isMine && <div style={{ color:S.dim, fontSize:10, marginBottom:3, marginLeft:4 }}>{msg.from} · {msg.ts}</div>}
        <div style={{ background:isMine?S.secure+'33':S.mid, border:`1px solid ${isMine?S.secure+'44':S.border}`, borderRadius:isMine?'12px 12px 4px 12px':'12px 12px 12px 4px', padding:'10px 14px' }}>
          <div style={{ color:S.text, fontSize:13, lineHeight:1.5 }}>{msg.text}</div>
          {msg.attachment && <div style={{ color:S.secure, fontSize:11, marginTop:4 }}>📎 {msg.attachment}</div>}
        </div>
        {isMine && <div style={{ color:S.dim, fontSize:10, marginTop:3, textAlign:'right', marginRight:4 }}>{msg.ts} {msg.read?'✓✓':'✓'}</div>}
      </div>
    </div>
  )
}

// File attachment chip
export function FileChip({ name, type, size, onRemove }) {
  const icon = type?.includes('image')?'🖼️':type?.includes('video')?'🎬':type?.includes('audio')?'🎵':type?.includes('pdf')?'📄':type?.includes('text')||type?.includes('transcript')?'📝':'📎'
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:S.mid, border:`1px solid ${S.border}`, borderRadius:6, padding:'4px 10px', fontSize:11, margin:'3px' }}>
      <span>{icon}</span>
      <span style={{ color:S.text }}>{name}</span>
      {size && <span style={{ color:S.dim }}>({size})</span>}
      {onRemove && <button onClick={onRemove} style={{ background:'none', border:'none', color:S.danger, cursor:'pointer', fontSize:12, padding:0, marginLeft:2 }}>×</button>}
    </div>
  )
}

// Modal wrapper
export function Modal({ open, onClose, title, children, width=680 }) {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'#000000aa', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:14, width:'100%', maxWidth:width, maxHeight:'90vh', overflow:'auto', boxShadow:'0 0 80px #00000088' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:`1px solid ${S.border}` }}>
          <div style={{ color:S.text, fontSize:16, fontWeight:700 }}>{title}</div>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:S.dim, fontSize:20, cursor:'pointer', lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:20 }}>{children}</div>
      </div>
    </div>
  )
}
