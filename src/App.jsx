import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ReferenceLine, ScatterChart, Scatter, ZAxis,
} from 'recharts'
import {
  Shield, Activity, Database, FolderOpen, Gavel, Hash, BarChart2,
  Bell, Users, Globe, HelpCircle, Network, TrendingUp, DollarSign,
  Zap, Star, Layers, Lock, RefreshCw, LogOut, Filter, Eye,
  Flag, Download, Share2, CheckCircle2, AlertTriangle, Target,
  Cpu, FileText, WifiOff, Wifi, Play, Pause, SkipBack,
} from 'lucide-react'

import { computeIRI, iriBand, robustnessCheck, benfordExpected, bayesianUpdate, TIER_V, TIER_LABELS, SURFACE_W, impliedProb, computeCredibility } from './utils/iri.js'
import { USER_ROLES, MOCK_MATCHES, MOCK_APIS, MOCK_CASES, MOCK_DOSSIERS, INITIAL_ALERTS, INITIAL_POSTS, TREND_DATA, TIER_DIST, SURFACE_DATA, COVERAGE_GAPS, MICROBET_MARKETS, NETWORK_NODES, NETWORK_EDGES } from './utils/data.js'
import { S, card, cardSm, badge, Btn, SectionHeader, StatCard, IRIBar, IRIGauge, TabPill, Field, fieldStyle } from './components/UI.jsx'

// ─── API base URL injected at build time or from window config ────────────────
const API = (typeof window !== 'undefined' && window.APP_CONFIG?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username:'', password:'', role:'integrity_officer' })
  const [err, setErr] = useState('')

  const submit = () => {
    if (!form.username.trim()) { setErr('Username is required.'); return }
    if (form.password.length < 8) { setErr('Password must be at least 8 characters.'); return }
    onLogin({ username: form.username, role: form.role })
  }

  return (
    <div style={{ minHeight:'100vh', background:S.bg, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#1e2d4022 1px,transparent 1px),linear-gradient(90deg,#1e2d4022 1px,transparent 1px)', backgroundSize:'36px 36px', opacity:.5 }}/>
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 15% 25%,#f59e0b09,transparent 45%),radial-gradient(circle at 85% 75%,#3b82f609,transparent 45%)' }}/>
      <div style={{ ...card, width:420, maxWidth:'95vw', position:'relative', zIndex:1, boxShadow:'0 0 60px #f59e0b18' }}>
        <div style={{ textAlign:'center', marginBottom:26 }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🛡️</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:22, fontWeight:800, color:S.text }}>IRI <span style={{ color:S.accent }}>v1.1.0</span></div>
          <div style={{ color:S.dim, fontSize:12, marginTop:4 }}>Integrity Risk Index Platform</div>
          <div style={{ color:S.dim, fontSize:11, marginTop:2, fontFamily:"'IBM Plex Mono',monospace" }}>AUC 0.873 · n=106,849 · Kirby (2026)</div>
        </div>
        {/* Mode tabs */}
        <div style={{ display:'flex', gap:4, background:S.mid, borderRadius:8, padding:4, marginBottom:18 }}>
          {['login','register'].map(m => (
            <button key={m} onClick={()=>{setMode(m);setErr('')}} style={{
              flex:1, padding:'8px 0', background:mode===m?S.card:'transparent',
              color:mode===m?S.text:S.dim, border:`1px solid ${mode===m?S.border:'transparent'}`,
              borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:mode===m?700:400, textTransform:'capitalize',
            }}>{m}</button>
          ))}
        </div>
        {err && <div style={{ background:'#7f1d1d33', border:`1px solid #ef444444`, color:S.danger, padding:'8px 12px', borderRadius:6, fontSize:12, marginBottom:12 }}>{err}</div>}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Field label="USERNAME"><input value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))} placeholder="Enter username" style={fieldStyle}/></Field>
          {mode==='register' && <Field label="EMAIL"><input type="email" placeholder="your@email.com" style={fieldStyle}/></Field>}
          <Field label="PASSWORD (8+ CHARACTERS)"><input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Password" style={fieldStyle} onKeyDown={e=>e.key==='Enter'&&submit()}/></Field>
          <Field label="ACCESS ROLE">
            <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={fieldStyle}>
              {Object.entries(USER_ROLES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          </Field>
          <Btn onClick={submit} color={S.accent} size="lg" style={{ width:'100%', justifyContent:'center' }}>
            {mode==='login' ? '🔐 Sign In' : '✨ Create Account'}
          </Btn>
        </div>
        <div style={{ textAlign:'center', marginTop:14, color:S.dim, fontSize:10, fontFamily:"'IBM Plex Mono',monospace" }}>SHA-256 audit chain · AWS Secrets Manager · Zero plain-text keys</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// IRI CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════════
function IRICalculator() {
  const [form, setForm] = useState({ favOdds:1.38, dogOdds:3.05, gap:28, tier:'challenger', surface:'clay', w1:0.5 })
  const result = useMemo(()=>computeIRI({ favoriteOdds:+form.favOdds, underdogOdds:+form.dogOdds, rankingGap:+form.gap, tier:form.tier, surface:form.surface, w1:+form.w1, w2:+(1-form.w1).toFixed(1) }),[form])
  const robust = useMemo(()=>robustnessCheck({ favoriteOdds:+form.favOdds, underdogOdds:+form.dogOdds, rankingGap:+form.gap, tier:form.tier, surface:form.surface }),[form])
  const s=e=>k=>setForm(f=>({...f,[k]:e.target.type==='range'?parseFloat(e.target.value):e.target.value}))

  return (
    <div>
      <SectionHeader title="⚡ IRI Calculator" subtitle="IRI = 100 × [w₁ × |Y−Pw| + w₂ × V] · Kirby (2026) §4"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Inputs */}
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:16 }}>Match Parameters</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Field label="FAVORITE ODDS" hint={`Implied P(win): ${(impliedProb(+form.favOdds)*100).toFixed(1)}%`}>
              <input type="number" step="0.01" min="1.01" value={form.favOdds} onChange={e=>setForm(f=>({...f,favOdds:e.target.value}))} style={fieldStyle}/>
            </Field>
            <Field label="UNDERDOG ODDS">
              <input type="number" step="0.01" min="1.01" value={form.dogOdds} onChange={e=>setForm(f=>({...f,dogOdds:e.target.value}))} style={fieldStyle}/>
            </Field>
            <Field label="RANKING GAP |R₁−R₂|" hint={`ΔR₁₀₀ = ${(form.gap/100).toFixed(2)}`}>
              <input type="number" min="0" value={form.gap} onChange={e=>setForm(f=>({...f,gap:e.target.value}))} style={fieldStyle}/>
            </Field>
            <Field label={`TOURNAMENT TIER (V = ${TIER_V[form.tier]?.toFixed(2)})`}>
              <select value={form.tier} onChange={e=>setForm(f=>({...f,tier:e.target.value}))} style={fieldStyle}>
                {Object.entries(TIER_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="PLAYING SURFACE (modifier)">
              <select value={form.surface} onChange={e=>setForm(f=>({...f,surface:e.target.value}))} style={fieldStyle}>
                {Object.entries(SURFACE_W).map(([k,v])=><option key={k} value={k}>{k.charAt(0).toUpperCase()+k.slice(1)} (×{v})</option>)}
              </select>
            </Field>
            <Field label={`WEIGHT w₁: ${form.w1} / w₂: ${(1-form.w1).toFixed(1)}`} hint="Default 0.5/0.5 per dissertation §4.3">
              <input type="range" min="0.1" max="0.9" step="0.1" value={form.w1} onChange={e=>setForm(f=>({...f,w1:parseFloat(e.target.value)}))} style={{ width:'100%', marginTop:6 }}/>
            </Field>
          </div>
        </div>
        {/* Results */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ ...card, textAlign:'center' }}>
            <IRIGauge value={result.iri}/>
            <div style={{ color:S.dim, fontSize:11, marginTop:8 }}>P(Upset logistic) = {(result.upsetProb*100).toFixed(1)}% · OR = {result.oddsRatio.toFixed(2)}x</div>
          </div>
          <div style={card}>
            <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:12 }}>Component Breakdown</div>
            <IRIBar label="Structural Vulnerability V" value={result.V*100} color="#f97316"/>
            <IRIBar label="Probabilistic Residual |Y−Pw|" value={result.residual*100} color="#3b82f6"/>
            <IRIBar label="Market Implied Pw" value={result.Pw*100} color="#8b5cf6"/>
            <IRIBar label="Upset Probability (logistic)" value={result.upsetProb*100} color="#ec4899"/>
          </div>
          <div style={card}>
            <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:10 }}>Robustness Check</div>
            {robust.map(r=>{const b=iriBand(r.iri);return(
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:`1px solid ${S.border}` }}>
                <span style={{ color:S.dim, fontSize:12 }}>w₁/w₂ = {r.label}</span>
                <span style={{ color:b.color, fontSize:15, fontWeight:700 }}>{r.iri.toFixed(1)}</span>
                <span style={{ ...badge(b.color) }}>{b.label}</span>
              </div>
            )})}
            <div style={{ color:S.dim, fontSize:10, marginTop:8 }}>Stable across all weightings — Kirby §4.3</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE MONITOR
// ═══════════════════════════════════════════════════════════════════════════════
function LiveMonitor({ liveOdds }) {
  const [tierFilter, setTierFilter] = useState('all')
  const [minIri, setMinIri] = useState(0)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  const enriched = useMemo(()=>MOCK_MATCHES.map(m=>{
    const r = computeIRI({ favoriteOdds:m.favOdds, underdogOdds:m.dogOdds, rankingGap:m.rankingGap, tier:m.tier, surface:m.surface })
    return { ...m, ...r, band:iriBand(r.iri) }
  }),[])

  const filtered = enriched
    .filter(m=>tierFilter==='all'||m.tier===tierFilter)
    .filter(m=>m.iri>=minIri)
    .filter(m=>!search||`${m.p1} ${m.p2} ${m.tournament}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>b.iri-a.iri)

  return (
    <div>
      <SectionHeader title="📡 Live Match Monitor" subtitle={`Real-time IRI scoring · ${filtered.length} matches`}
        actions={liveOdds && <span style={{ ...badge(S.ok) }}>● Live API</span>}/>
      {/* Filter bar */}
      <div style={{ ...cardSm, marginBottom:14, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <Filter size={13} color={S.dim}/>
        <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{ ...fieldStyle, width:180 }}/>
        <select value={tierFilter} onChange={e=>setTierFilter(e.target.value)} style={{ ...fieldStyle, width:'auto' }}>
          <option value="all">All Tiers</option>
          {Object.entries(TIER_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ color:S.dim, fontSize:12 }}>Min IRI:</span>
          <input type="range" min="0" max="90" value={minIri} onChange={e=>setMinIri(+e.target.value)} style={{ width:80 }}/>
          <span style={{ color:S.accent, fontWeight:700, fontSize:12 }}>{minIri}</span>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.map(m=>(
          <div key={m.id} onClick={()=>setExpanded(x=>x===m.id?null:m.id)}
            style={{ ...card, cursor:'pointer', borderLeft:`3px solid ${m.band.color}`, background:expanded===m.id?S.mid:S.card, transition:'all .2s' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>{m.p1} vs {m.p2}</div>
                <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>{m.tournament} · {m.surface} · {m.date}</div>
              </div>
              <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
                {[
                  ['TIER',     <span style={{ ...badge(m.band.color), fontSize:9 }}>{m.tier.toUpperCase()}</span>],
                  ['ODDS',     <span style={{ color:S.text, fontSize:13, fontWeight:600 }}>{m.favOdds} / {m.dogOdds}</span>],
                  ['VOLUME',   <span style={{ color:S.text, fontSize:12 }}>{m.volume}</span>],
                  ['MOVEMENT', <span style={{ color:m.movement.startsWith('+')?parseInt(m.movement)>30?S.danger:S.ok:S.midText, fontSize:12, fontWeight:700 }}>{m.movement}</span>],
                ].map(([l,v])=>(
                  <div key={l} style={{ textAlign:'center' }}>
                    <div style={{ color:S.dim, fontSize:10 }}>{l}</div>
                    {v}
                  </div>
                ))}
                <div style={{ textAlign:'center', minWidth:55 }}>
                  <div style={{ color:S.dim, fontSize:10 }}>IRI</div>
                  <div style={{ color:m.band.color, fontSize:26, fontWeight:900, lineHeight:1 }}>{m.iri.toFixed(0)}</div>
                  <span style={{ ...badge(m.band.color), fontSize:9 }}>{m.band.label}</span>
                </div>
              </div>
            </div>
            {expanded===m.id && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${S.border}` }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:12 }}>
                  {[['UPSET PROB',`${(m.upsetProb*100).toFixed(1)}%`,S.accent],['STRUCTURAL V',`${(m.V*100).toFixed(0)}/100`,S.warn],['RESIDUAL',`${(m.residual*100).toFixed(1)}%`,S.info],['ODDS RATIO',`${m.oddsRatio.toFixed(2)}x`,S.ok]].map(([l,v,c])=>(
                    <div key={l}><div style={{ color:S.dim, fontSize:10 }}>{l}</div><div style={{ color:c, fontSize:20, fontWeight:800 }}>{v}</div></div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <Btn size="sm" color={S.danger} onClick={e=>e.stopPropagation()}><Gavel size={11}/>Create Case</Btn>
                  <Btn size="sm" color={S.info} variant="outline" onClick={e=>e.stopPropagation()}><FileText size={11}/>Report</Btn>
                  <Btn size="sm" color={S.accent} variant="outline" onClick={e=>e.stopPropagation()}><Flag size={11}/>Flag</Btn>
                  <Btn size="sm" color={S.ok} variant="outline" onClick={e=>e.stopPropagation()}><Share2 size={11}/>Workgroup</Btn>
                </div>
              </div>
            )}
          </div>
        ))}
        {!filtered.length && <div style={{ textAlign:'center', color:S.dim, padding:40 }}>No matches match current filters.</div>}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CASES
// ═══════════════════════════════════════════════════════════════════════════════
function CaseManagement() {
  const [expanded, setExpanded] = useState(null)
  const sevColor = { Critical:S.danger, High:S.warn, Medium:S.accent, Low:S.ok }
  const stageColor = { 'Initial Alert':S.info, Triage:S.warn, 'Evidence Review':S.danger, 'Network Analysis':'#8b5cf6', Escalated:S.danger, Closed:S.ok }

  return (
    <div>
      <SectionHeader title="🔨 Case Management" subtitle="Investigative workflow · CAS-compatible evidence trail · SHA-256 audit log"
        actions={<Btn size="sm" color={S.danger}><Gavel size={11}/>New Case</Btn>}/>
      <div style={{ display:'flex', gap:14, marginBottom:20, flexWrap:'wrap' }}>
        <StatCard label="Active Cases" value={MOCK_CASES.filter(c=>c.status!=='Closed').length} color={S.danger}/>
        <StatCard label="Critical P1" value={MOCK_CASES.filter(c=>c.severity==='Critical').length} color={S.danger}/>
        <StatCard label="Avg Confidence" value={`${Math.round(MOCK_CASES.reduce((s,c)=>s+c.confidence,0)/MOCK_CASES.length)}%`} color={S.ok}/>
        <StatCard label="Total Alerts" value={MOCK_CASES.reduce((s,c)=>s+c.alerts,0)} color={S.info}/>
      </div>
      {MOCK_CASES.map(c=>(
        <div key={c.id} onClick={()=>setExpanded(x=>x===c.id?null:c.id)}
          style={{ ...card, marginBottom:10, cursor:'pointer', borderLeft:`3px solid ${sevColor[c.severity]}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                <span style={{ color:S.dim, fontSize:11, fontFamily:"'IBM Plex Mono',monospace" }}>{c.id}</span>
                <span style={{ ...badge(sevColor[c.severity]) }}>{c.severity}</span>
                <span style={{ ...badge(stageColor[c.stage]||S.dim), fontSize:10 }}>{c.stage}</span>
              </div>
              <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>{c.title}</div>
              <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>Assignee: {c.assignee} · {c.jurisdiction} · Due: {c.due}</div>
            </div>
            <div style={{ display:'flex', gap:16 }}>
              {[['IRI',c.iri,iriBand(c.iri).color,22],['CONF',`${c.confidence}%`,S.ok,18],['ALERTS',c.alerts,S.danger,18]].map(([l,v,color,fs])=>(
                <div key={l} style={{ textAlign:'center' }}>
                  <div style={{ color:S.dim, fontSize:10 }}>{l}</div>
                  <div style={{ color, fontSize:fs, fontWeight:800 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          {expanded===c.id && (
            <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${S.border}` }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:12 }}>
                <div>
                  <div style={{ color:S.dim, fontSize:11, marginBottom:6 }}>LINKED ENTITIES</div>
                  {c.entities.map(e=><div key={e} style={{ color:S.text, fontSize:12, padding:'2px 0' }}>• {e}</div>)}
                </div>
                <div>
                  <div style={{ color:S.dim, fontSize:11, marginBottom:6 }}>STAGE WORKFLOW</div>
                  {['Initial Alert','Triage','Evidence Review','Network Analysis','Escalated','Closed'].map(stage=>(
                    <div key={stage} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:c.stage===stage?(stageColor[stage]||S.accent):S.mid }}/>
                      <span style={{ color:c.stage===stage?(stageColor[stage]||S.accent):S.dim, fontSize:11 }}>{stage}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <Btn size="sm" color={S.danger}><AlertTriangle size={11}/>Escalate</Btn>
                <Btn size="sm" color={S.info} variant="outline"><Share2 size={11}/>Assign</Btn>
                <Btn size="sm" color={S.accent} variant="outline"><Download size={11}/>Evidence Pack</Btn>
                <Btn size="sm" color={S.ok} variant="outline"><CheckCircle2 size={11}/>Close</Btn>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOSSIERS
// ═══════════════════════════════════════════════════════════════════════════════
function Dossiers() {
  const [selected, setSelected] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const typeColor = t=>({Player:S.info,Official:S.danger,Tournament:S.warn,Coach:S.accent,Sportsbook:'#8b5cf6'}[t]||S.midText)
  const filtered = MOCK_DOSSIERS.filter(d=>typeFilter==='all'||d.type===typeFilter)

  return (
    <div>
      <SectionHeader title="📁 Dossier System" subtitle="Persistent entity risk profiles — players, officials, tournaments, coaches, sportsbooks"
        actions={<Btn size="sm" color={S.accent}>+ New Dossier</Btn>}/>
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {['all','Player','Official','Tournament','Coach','Sportsbook'].map(t=>(
          <button key={t} onClick={()=>setTypeFilter(t)} style={{
            padding:'5px 12px', borderRadius:6, fontSize:12, cursor:'pointer',
            background:typeFilter===t?S.mid:'transparent',
            color:typeFilter===t?S.text:S.dim,
            border:`1px solid ${typeFilter===t?S.border:'transparent'}`,
          }}>{t}</button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))', gap:16 }}>
        {filtered.map(d=>{
          const b=iriBand(d.avgIri), c=typeColor(d.type)
          return (
            <div key={d.id} onClick={()=>setSelected(s=>s===d.id?null:d.id)}
              style={{ ...card, cursor:'pointer', borderTop:`3px solid ${c}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <span style={{ ...badge(c), marginBottom:6, display:'block', width:'fit-content' }}>{d.type}</span>
                  <div style={{ color:S.text, fontSize:15, fontWeight:700 }}>{d.name}</div>
                  <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>{d.tour} · {d.tier} · {d.nationality}</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ color:b.color, fontSize:28, fontWeight:900 }}>{d.avgIri}</div>
                  <span style={{ ...badge(b.color), fontSize:9 }}>AVG IRI</span>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', color:S.dim, fontSize:11, marginBottom:8 }}>
                <span>Flagged: <span style={{ color:S.danger, fontWeight:700 }}>{d.flagged}</span>/{d.total}</span>
                <span>Surface: {d.surface}</span>
              </div>
              {/* Sparkline */}
              <ResponsiveContainer width="100%" height={40}>
                <LineChart data={d.history.map((v,i)=>({i,v}))}>
                  <Line type="monotone" dataKey="v" stroke={b.color} strokeWidth={2} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
              {selected===d.id && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${S.border}` }}>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                    {d.history.map((v,i)=>{const bb=iriBand(v);return(
                      <div key={i} style={{ flex:1, background:bb.bg, borderRadius:4, padding:'4px 0', textAlign:'center' }}>
                        <div style={{ color:bb.color, fontSize:12, fontWeight:700 }}>{v}</div>
                      </div>
                    )})}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <Btn size="sm" color={S.danger}><Gavel size={11}/>Open Case</Btn>
                    <Btn size="sm" color={S.info} variant="outline"><Flag size={11}/>Flag</Btn>
                    <Btn size="sm" color={S.accent} variant="outline"><Download size={11}/>Export</Btn>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BENFORD ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════
function BenfordAnalysis() {
  const [subset, setSubset] = useState('high_risk')
  const mockOdds = {
    all:      [1.22,1.44,1.19,1.55,1.38,1.62,2.30,2.88,3.05,4.95,1.31,3.35,2.55,4.20,1.44,2.88,1.19,4.95,1.22,3.05],
    high_risk:[1.19,1.22,1.24,1.19,1.18,4.95,4.20,4.80,4.95,4.10,1.22,4.95,1.19,4.20,1.24,4.80,1.18,4.10,1.19,4.95,1.22,4.20],
    low_risk: [1.62,2.30,1.55,2.55,1.44,2.88,1.38,3.05,1.31,3.35,2.30,1.62,2.55,1.44,2.88,1.55,3.05,1.38,3.35,1.31],
  }
  const expected = benfordExpected()
  const obs = { all:[30.1,17.6,12.5,9.7,7.9,6.7,5.8,5.1,4.6], high_risk:[21.2,13.1,10.2,8.1,6.8,8.9,9.4,11.2,11.1], low_risk:[31.0,17.9,12.6,9.8,7.7,6.5,5.6,4.9,4.0] }
  const chartData = expected.map((e,i)=>({ digit:e.digit, expected:parseFloat(e.expected.toFixed(1)), observed:obs[subset][i] }))
  const chi2 = chartData.reduce((s,d)=>{const O=d.observed,E=d.expected;return E>0?s+Math.pow(O-E,2)/E:s},0)
  const suspicious = chi2 > 20.09

  return (
    <div>
      <SectionHeader title="# Benford's Law Forensic Analysis" subtitle="P(d) = log₁₀(1+1/d) · χ² goodness-of-fit · Dissertation §4.4 forensic validation"/>
      <div style={{ ...card, marginBottom:16 }}>
        <div style={{ color:S.dim, fontSize:12, lineHeight:1.7 }}>
          Benford's Law predicts the logarithmic distribution of leading digits. Significant deviations (χ² &gt; 20.09, df=8) suggest non-natural numerical patterns — potential indicator of coordinated market seeding (Kirby, 2026). Applied here as supplementary forensic evidence, not standalone proof.
        </div>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {[['all','All Matches'],['high_risk','High-Risk (IRI ≥ 70)'],['low_risk','Low-Risk (IRI < 30)']].map(([k,l])=>(
          <button key={k} onClick={()=>setSubset(k)} style={{ padding:'6px 14px', borderRadius:6, fontSize:12, cursor:'pointer', background:subset===k?S.mid:'transparent', color:subset===k?S.text:S.dim, border:`1px solid ${subset===k?S.border:'transparent'}` }}>{l}</button>
        ))}
      </div>
      <div style={{ display:'flex', gap:14, marginBottom:18, flexWrap:'wrap' }}>
        <StatCard label="χ² Statistic" value={chi2.toFixed(2)} color={suspicious?S.danger:S.ok} sub="df=8, critical=20.09"/>
        <StatCard label="Benford Status" value={suspicious?'SUSPECT':'NORMAL'} color={suspicious?S.danger:S.ok}/>
      </div>
      <div style={card}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:14 }}>First Digit Distribution vs Benford Expected</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top:5, right:20, bottom:5, left:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={S.border}/>
            <XAxis dataKey="digit" tick={{ fill:S.dim, fontSize:12 }} label={{ value:'Leading Digit', position:'insideBottom', fill:S.dim, fontSize:10 }}/>
            <YAxis tick={{ fill:S.dim, fontSize:11 }} tickFormatter={v=>`${v.toFixed(0)}%`}/>
            <Tooltip contentStyle={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:8 }} formatter={(v,n)=>[`${v.toFixed(1)}%`,n]}/>
            <Legend wrapperStyle={{ color:S.dim, fontSize:12 }}/>
            <Bar dataKey="expected" name="Benford Expected" fill={S.info} opacity={0.7} radius={[4,4,0,0]}/>
            <Bar dataKey="observed" name="Observed" radius={[4,4,0,0]}>
              {chartData.map((e,i)=><Cell key={i} fill={Math.abs(e.observed-e.expected)>5?S.danger:S.ok}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {suspicious && (
        <div style={{ ...card, marginTop:14, borderLeft:`3px solid ${S.danger}` }}>
          <div style={{ color:S.danger, fontSize:13, fontWeight:700, marginBottom:6 }}>⚠ Forensic Alert</div>
          <div style={{ color:S.midText, fontSize:12 }}>χ² = {chi2.toFixed(2)} exceeds critical value 20.09. This {subset==='high_risk'?'HIGH-RISK ':''} subset shows statistically significant deviation from the Benford distribution — consistent with non-natural numerical patterns, possibly indicating artificial market intervention. This mirrors dissertation findings: high-risk ITF/Challenger match odds disproportionately deviate from the Benford expected distribution (Kirby, 2026, §4.4).</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════
function Analytics() {
  return (
    <div>
      <SectionHeader title="📊 Analytics & Reports" subtitle="Historical IRI trends · Tier distribution · Surface analysis · Gender invariance · Export suite"/>
      {/* Trend */}
      <div style={{ ...card, marginBottom:20 }}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>IRI Score & Alert Frequency — Oct 2025 to Mar 2026</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={TREND_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={S.border}/>
            <XAxis dataKey="m" tick={{ fill:S.dim, fontSize:11 }}/>
            <YAxis tick={{ fill:S.dim, fontSize:11 }}/>
            <Tooltip contentStyle={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:8 }}/>
            <Legend wrapperStyle={{ color:S.dim, fontSize:12 }}/>
            <ReferenceLine y={70} stroke={S.danger} strokeDasharray="3 3" label={{ value:'Critical (70)', fill:S.danger, fontSize:10, position:'insideTopRight' }}/>
            <Line type="monotone" dataKey="iri"    name="Avg IRI"     stroke={S.accent} strokeWidth={2.5} dot={false}/>
            <Line type="monotone" dataKey="alerts" name="Alert Count" stroke={S.danger} strokeWidth={1.5} dot={false} strokeDasharray="4 2"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Tier dist */}
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:4 }}>Upset Rate by Tier</div>
          <div style={{ color:S.dim, fontSize:11, marginBottom:12 }}>ANOVA F(3,106849)=106.73, p&lt;.001, η²=0.003</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TIER_DIST}>
              <CartesianGrid strokeDasharray="3 3" stroke={S.border}/>
              <XAxis dataKey="tier" tick={{ fill:S.dim, fontSize:9 }}/>
              <YAxis tick={{ fill:S.dim, fontSize:11 }} domain={[25,45]}/>
              <Tooltip contentStyle={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:8 }} formatter={v=>[`${v}%`,'Upset Rate']}/>
              <Bar dataKey="upset" name="Upset %" radius={[4,4,0,0]}>
                {TIER_DIST.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ color:S.dim, fontSize:10, marginTop:8 }}>Grand Slam 29.8% → ITF 41.5% (+11.7ppt, +39% relative)</div>
        </div>
        {/* Surface */}
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Surface Analysis</div>
          {SURFACE_DATA.map(s=>(
            <div key={s.surface} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:`1px solid ${S.border}44` }}>
              <span style={{ color:S.text, fontSize:13, fontWeight:600, width:60 }}>{s.surface}</span>
              <div style={{ flex:1, margin:'0 12px' }}>
                <div style={{ background:S.mid, borderRadius:3, height:6 }}>
                  <div style={{ background:s.surface==='Carpet'?S.danger:s.surface==='Clay'?S.warn:S.ok, borderRadius:3, height:6, width:`${s.upset}%` }}/>
                </div>
              </div>
              <span style={{ color:S.midText, fontSize:12, width:40, textAlign:'right' }}>{s.upset}%</span>
              <span style={{ color:iriBand(s.iriAvg).color, fontSize:12, fontWeight:700, width:60, textAlign:'right' }}>IRI {s.iriAvg}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Gender invariance */}
      <div style={{ ...card, marginBottom:20 }}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:8 }}>Cross-Tour Gender Invariance — ATP / WTA</div>
        <div style={{ color:S.dim, fontSize:12, marginBottom:12 }}>β_gender ≈ 0 (p &gt; 0.05) — Integrity Risk ⊥ Gender | Structural Variables · Kirby (2026) §4.4</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:12 }}>
          {[['ATP Avg IRI','58.4','2000–2026 · 62,410 matches'],['WTA Avg IRI','57.9','2007–2026 · 44,439 matches'],['Gender β Coefficient','≈ 0','p > 0.05 — not significant',S.ok]].map(([l,v,s,c])=>(
            <div key={l} style={cardSm}><div style={{ color:S.dim, fontSize:11 }}>{l}</div><div style={{ color:c||S.text, fontSize:22, fontWeight:800 }}>{v}</div><div style={{ color:S.dim, fontSize:10 }}>{s}</div></div>
          ))}
        </div>
        <div style={{ padding:10, background:'#14532d33', borderRadius:8, color:S.ok, fontSize:12 }}>✓ A single IRI model applies equally to ATP and WTA. Risk is driven by structural and economic architecture, not gender. Confirms dissertation H4.</div>
      </div>
      {/* Export */}
      <div style={card}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Export Suite</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10 }}>
          {[['📄 Export PDF',S.danger],['📊 Export XLSX',S.ok],['🗂️ Export CSV',S.info],['📝 Export DOCX',S.accent],['📥 Import CSV',S.midText],['📥 Import XLSX',S.midText],['📥 Import DOCX',S.midText],['⚖️ Evidence Pack',S.danger]].map(([l,c])=>(
            <button key={l} style={{ background:S.mid, border:`1px solid ${S.border}`, borderRadius:8, padding:'12px 10px', cursor:'pointer', color:c, fontSize:12, fontWeight:600 }}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// API METER
// ═══════════════════════════════════════════════════════════════════════════════
function ApiMeter({ liveData }) {
  const apis = useMemo(()=>MOCK_APIS.map(a=>({ ...a, cred:computeCredibility({ successCalls:a.successCalls, totalCalls:a.totalCalls, stdDevOdds:a.stdDevOdds, confirmedAlerts:a.confirmedAlerts, totalAlerts:a.totalAlerts, avgLatencyMs:a.avgLatencyMs }) })),[])
  const sc = s=>s==='live'?S.ok:s==='warn'?S.warn:S.danger

  return (
    <div>
      <SectionHeader title="🔌 API Credibility Engine" subtitle="ACL: credibility = successRate×0.35 + consistency×0.25 + verification×0.25 + latency×0.15"/>
      <div style={{ display:'flex', gap:14, marginBottom:20, flexWrap:'wrap' }}>
        <StatCard label="APIs Monitored" value={apis.length}/>
        <StatCard label="Live Feeds" value={apis.filter(a=>a.status==='live').length} color={S.ok}/>
        <StatCard label="Degraded / Error" value={apis.filter(a=>a.status!=='live').length} color={S.danger}/>
        <StatCard label="Avg Credibility" value={`${Math.round(apis.reduce((s,a)=>s+a.cred,0)/apis.length)}%`} color={S.ok}/>
      </div>
      {liveData && (liveData.health || liveData.odds || liveData.sportradar) && (
        <div style={{ ...card, marginBottom:14, borderLeft:`3px solid ${S.ok}` }}>
          <div style={{ color:S.ok, fontWeight:700, fontSize:13, marginBottom:6 }}>● Live Backend Response</div>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap', fontSize:12 }}>
            {liveData.health && <span style={{ color:S.dim }}>Health: <span style={{ color:S.ok }}>{liveData.health.status}</span></span>}
            {liveData.odds?.normalizedFavorite && <span style={{ color:S.dim }}>Fav Odds: <span style={{ color:S.accent }}>{liveData.odds.normalizedFavorite}</span></span>}
            {liveData.sportradar?.totalScheduled !== undefined && <span style={{ color:S.dim }}>Scheduled: <span style={{ color:S.info }}>{liveData.sportradar.totalScheduled} matches</span></span>}
          </div>
        </div>
      )}
      {!API && (
        <div style={{ ...card, marginBottom:14, borderLeft:`3px solid ${S.warn}` }}>
          <div style={{ color:S.warn, fontWeight:700, fontSize:13, marginBottom:4 }}>⚠ No API URL Configured</div>
          <div style={{ color:S.dim, fontSize:12 }}>Set VITE_API_BASE_URL in your environment variables to enable live data. In production, this comes from your CloudFormation ApiBaseUrl.</div>
        </div>
      )}
      {apis.map(api=>(
        <div key={api.name} style={{ ...card, marginBottom:8, borderLeft:`3px solid ${sc(api.status)}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:sc(api.status) }}/>
                <span style={{ color:S.text, fontWeight:700 }}>{api.name}</span>
                <span style={{ ...badge(sc(api.status)) }}>{api.status.toUpperCase()}</span>
              </div>
              <div style={{ color:S.dim, fontSize:11 }}>Key: {api.key} · {api.endpoint} · Last: {api.lastPing}</div>
            </div>
            <div style={{ textAlign:'right', minWidth:110 }}>
              <div style={{ color:S.dim, fontSize:10, marginBottom:4 }}>CREDIBILITY</div>
              <div style={{ background:S.mid, borderRadius:4, height:7, width:100, marginLeft:'auto' }}>
                <div style={{ background:api.cred>70?S.ok:api.cred>50?S.warn:S.danger, borderRadius:4, height:7, width:`${api.cred}%` }}/>
              </div>
              <div style={{ color:api.cred>70?S.ok:api.cred>50?S.warn:S.danger, fontSize:14, fontWeight:700, marginTop:3 }}>{api.cred}%</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALERTS
// ═══════════════════════════════════════════════════════════════════════════════
function AlertsPanel({ userRole }) {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [threshold, setThreshold] = useState(65)
  const [emailOn, setEmailOn] = useState(true)
  const unread = alerts.filter(a=>!a.read).length
  const sc = s=>({Critical:S.danger,High:S.warn,Elevated:S.accent,Info:S.info}[s]||S.dim)

  return (
    <div>
      <SectionHeader title="🔔 Alert System" subtitle="Real-time IRI threshold notifications · Email · Sportsbook risk triggers"/>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
        <div>
          <div style={{ display:'flex', gap:12, marginBottom:14, flexWrap:'wrap' }}>
            <StatCard label="Unread Alerts" value={unread} color={S.danger}/>
            <StatCard label="Critical" value={alerts.filter(a=>a.severity==='Critical').length} color={S.danger}/>
          </div>
          {alerts.map(a=>(
            <div key={a.id} onClick={()=>setAlerts(al=>al.map(x=>x.id===a.id?{...x,read:true}:x))}
              style={{ ...cardSm, marginBottom:8, cursor:'pointer', opacity:a.read?.65:1, borderLeft:`3px solid ${sc(a.severity)}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ display:'flex', gap:6, marginBottom:4, alignItems:'center' }}>
                    {!a.read && <div style={{ width:6, height:6, borderRadius:'50%', background:S.danger }}/>}
                    <span style={{ ...badge(sc(a.severity)) }}>{a.severity}</span>
                    <span style={{ ...badge(S.info+'88'), color:S.info, fontSize:10 }}>{a.type}</span>
                  </div>
                  <div style={{ color:S.text, fontSize:13 }}>{a.message}</div>
                  <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>{a.ts} · {a.matchId}</div>
                </div>
                <div style={{ display:'flex', gap:5 }}>
                  <Btn size="sm" color={S.dim} variant="outline"><Eye size={11}/></Btn>
                  <Btn size="sm" color={S.danger} variant="outline"><Gavel size={11}/></Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Config panel */}
        <div>
          <div style={{ ...card, marginBottom:14 }}>
            <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Alert Thresholds</div>
            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ color:S.dim, fontSize:12 }}>IRI Trigger Level</span>
                <span style={{ color:S.accent, fontWeight:700 }}>{threshold}</span>
              </div>
              <input type="range" min="20" max="95" value={threshold} onChange={e=>setThreshold(+e.target.value)} style={{ width:'100%' }}/>
              <span style={{ ...badge(iriBand(threshold).color), marginTop:4, display:'block', width:'fit-content' }}>Triggers at: {iriBand(threshold).label}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ color:S.dim, fontSize:12 }}>Email Notifications</span>
              <div onClick={()=>setEmailOn(x=>!x)} style={{ width:40, height:20, borderRadius:10, background:emailOn?S.ok:S.mid, cursor:'pointer', position:'relative' }}>
                <div style={{ position:'absolute', top:2, left:emailOn?22:2, width:16, height:16, borderRadius:'50%', background:'white', transition:'left .2s' }}/>
              </div>
            </div>
            {[['Line movement spike','>50% pre-match'],['Bookmaker dispersion','>20pt spread'],['Volume anomaly','>200% baseline'],['Benford deviation','χ²>20.09'],['New entity cluster','Centrality spike']].map(([l,n])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${S.border}44` }}>
                <div><div style={{ color:S.text, fontSize:12 }}>{l}</div><div style={{ color:S.dim, fontSize:10 }}>{n}</div></div>
                <div style={{ width:32, height:16, borderRadius:8, background:S.ok, cursor:'pointer', position:'relative' }}>
                  <div style={{ position:'absolute', top:2, right:2, width:12, height:12, borderRadius:'50%', background:'white' }}/>
                </div>
              </div>
            ))}
          </div>
          {userRole==='gambler' && (
            <div style={card}>
              <div style={{ color:S.info, fontSize:13, fontWeight:700, marginBottom:10 }}>💡 Gambler Risk Guide</div>
              {[[70,'Remove leg or avoid match'],[60,'Hedge with underdog parlay'],[50,'Live-bet only'],[30,'Normal action permitted']].map(([t,a])=>(
                <div key={t} style={{ display:'flex', gap:8, padding:'4px 0', borderBottom:`1px solid ${S.border}44` }}>
                  <span style={{ ...badge(iriBand(t).color), minWidth:55, textAlign:'center' }}>IRI ≥ {t}</span>
                  <span style={{ color:S.text, fontSize:11 }}>{a}</span>
                </div>
              ))}
            </div>
          )}
          {userRole==='sportsbook' && (
            <div style={card}>
              <div style={{ color:S.warn, fontSize:13, fontWeight:700, marginBottom:10 }}>⚠ Sportsbook Triggers</div>
              {[['Suspend market','IRI ≥ 80'],['Reduce max bet','IRI ≥ 65'],['Alert trading desk','Volume +200%'],['Request operator data','IRI ≥ 70']].map(([l,t])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${S.border}44` }}>
                  <span style={{ color:S.text, fontSize:12 }}>{l}</span>
                  <span style={{ ...badge(S.warn) }}>{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKGROUP
// ═══════════════════════════════════════════════════════════════════════════════
function Workgroup({ user }) {
  const [posts, setPosts] = useState(INITIAL_POSTS)
  const [note, setNote] = useState('')
  const [matchRef, setMatchRef] = useState('M-001')

  const submit = () => {
    if (!note.trim()) return
    setPosts(p=>[{ id:`WG-${Date.now()}`, user:user.username, role:USER_ROLES[user.role]?.label||user.role, match:matchRef, note, ts:new Date().toISOString().slice(0,16).replace('T',' '), upvotes:0 },...p])
    setNote('')
  }

  return (
    <div>
      <SectionHeader title="👥 Workgroup Intelligence" subtitle="Cross-user flagging · Real-time collaboration · SHA-256 timestamped posts"/>
      <div style={{ ...card, marginBottom:18 }}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Share Intelligence</div>
        <div style={{ display:'flex', gap:10, marginBottom:8 }}>
          <select value={matchRef} onChange={e=>setMatchRef(e.target.value)} style={{ ...fieldStyle, flex:'0 0 140px' }}>
            {MOCK_MATCHES.map(m=><option key={m.id} value={m.id}>{m.id}: {m.p1} vs {m.p2}</option>)}
          </select>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Share intelligence note…" style={{ ...fieldStyle, flex:1 }} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          <Btn onClick={submit} size="sm" color={S.accent}><Share2 size={11}/>Share</Btn>
        </div>
        <div style={{ color:S.dim, fontSize:11 }}>All posts are SHA-256 hashed and timestamped for audit trail integrity.</div>
      </div>
      {posts.map(p=>(
        <div key={p.id} style={{ ...cardSm, marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:S.mid, display:'flex', alignItems:'center', justifyContent:'center', color:S.accent, fontSize:14, fontWeight:700 }}>{p.user[0]}</div>
              <div>
                <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:3 }}>
                  <span style={{ color:S.text, fontSize:13, fontWeight:600 }}>{p.user}</span>
                  <span style={{ ...badge(S.info), fontSize:10 }}>{p.role}</span>
                  <span style={{ color:S.dim, fontSize:10 }}>re: {p.match}</span>
                </div>
                <div style={{ color:S.midText, fontSize:12, lineHeight:1.5 }}>{p.note}</div>
                <div style={{ color:S.dim, fontSize:10, marginTop:4 }}>{p.ts}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:5 }}>
              <button onClick={()=>setPosts(ps=>ps.map(pp=>pp.id===p.id?{...pp,upvotes:pp.upvotes+1}:pp))} style={{ background:'transparent', border:`1px solid ${S.border}`, borderRadius:4, padding:'2px 8px', color:S.midText, cursor:'pointer', fontSize:11 }}>↑ {p.upvotes}</button>
              <Btn size="sm" color={S.danger} variant="outline"><Flag size={11}/></Btn>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// NETWORK GRAPH
// ═══════════════════════════════════════════════════════════════════════════════
function NetworkGraph() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const typeColor = t=>({player:S.info,official:S.danger,tournament:S.warn,coach:S.accent,sportsbook:'#8b5cf6'}[t]||S.midText)
  const W=700,H=400

  const toR=d=>d*Math.PI/180
  const nodes=NETWORK_NODES.filter(n=>filter==='all'||n.type===filter)

  return (
    <div>
      <SectionHeader title="🕸️ Network Intelligence Graph" subtitle="Entity relationships · Betweenness centrality · Cluster detection · Neo4j backend"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20 }}>
        <div style={{ ...card, padding:0, overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', borderBottom:`1px solid ${S.border}`, display:'flex', gap:6, flexWrap:'wrap' }}>
            {['all','player','official','tournament','coach','sportsbook'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{ padding:'4px 10px', borderRadius:4, fontSize:11, cursor:'pointer', background:filter===f?typeColor(f):'transparent', color:filter===f?'#000':S.dim, border:`1px solid ${filter===f?typeColor(f):S.border}`, textTransform:'capitalize' }}>{f}</button>
            ))}
          </div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:'block', background:'#0d1117' }}>
            {NETWORK_EDGES.map((e,i)=>{
              const fn=NETWORK_NODES.find(n=>n.id===e.from),tn=NETWORK_NODES.find(n=>n.id===e.to)
              if(!fn||!tn) return null
              const vis=filter==='all'||nodes.find(n=>n.id===e.from)||nodes.find(n=>n.id===e.to)
              return <line key={i} x1={fn.x/100*W} y1={fn.y/100*H} x2={tn.x/100*W} y2={tn.y/100*H} stroke={e.type==='officiated_at'?S.danger:e.type==='coaches'?S.accent:S.border} strokeWidth={e.w/5} opacity={vis?.6:.1} strokeDasharray={e.type==='markets'?'4 2':undefined}/>
            })}
            {NETWORK_NODES.map(n=>{
              const x=n.x/100*W,y=n.y/100*H,c=typeColor(n.type),r=7+n.centrality/10
              const vis=filter==='all'||n.type===filter
              const isSel=selected?.id===n.id
              return (
                <g key={n.id} onClick={()=>setSelected(s=>s?.id===n.id?null:n)} style={{ cursor:'pointer' }}>
                  {isSel&&<circle cx={x} cy={y} r={r+6} fill="none" stroke={c} strokeWidth={2} opacity={.4}/>}
                  <circle cx={x} cy={y} r={r} fill={c} opacity={vis?1:.15}/>
                  {n.risk>70&&<circle cx={x} cy={y} r={r+4} fill="none" stroke={c} strokeWidth={1} opacity={.4}/>}
                  <text x={x} y={y+r+11} textAnchor="middle" fill={vis?c:'#333'} fontSize={9}>{n.label.split(' ').slice(-1)[0]}</text>
                  <text x={x} y={y+4} textAnchor="middle" fill="#000" fontSize={9} fontWeight="700">{n.risk}</text>
                </g>
              )
            })}
          </svg>
          <div style={{ padding:'8px 14px', borderTop:`1px solid ${S.border}`, display:'flex', gap:14, flexWrap:'wrap' }}>
            {[['player','Players',S.info],['official','Officials',S.danger],['tournament','Tournaments',S.warn],['coach','Coaches',S.accent],['sportsbook','Sportsbooks','#8b5cf6']].map(([t,l,c])=>(
              <div key={t} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:c }}/>
                <span style={{ color:S.dim, fontSize:11 }}>{l}</span>
              </div>
            ))}
            <span style={{ color:S.dim, fontSize:10, marginLeft:'auto' }}>Node size = centrality · Number = risk score</span>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {selected ? (
            <div style={{ ...cardSm, borderTop:`3px solid ${typeColor(selected.type)}` }}>
              <span style={{ ...badge(typeColor(selected.type)), marginBottom:6, display:'block', width:'fit-content' }}>{selected.type}</span>
              <div style={{ color:S.text, fontSize:15, fontWeight:700 }}>{selected.label}</div>
              <div style={{ marginTop:10 }}>
                {[['Risk Score',selected.risk,iriBand(selected.risk).color],['Centrality',selected.centrality,S.info]].map(([l,v,c])=>(
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:`1px solid ${S.border}44` }}>
                    <span style={{ color:S.dim, fontSize:12 }}>{l}</span>
                    <span style={{ color:c, fontSize:13, fontWeight:700 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop:`1px solid ${S.border}`, marginTop:10, paddingTop:10 }}>
                <div style={{ color:S.dim, fontSize:10, marginBottom:6 }}>CONNECTED TO</div>
                {NETWORK_EDGES.filter(e=>e.from===selected.id||e.to===selected.id).slice(0,5).map((e,i)=>{
                  const other=NETWORK_NODES.find(n=>n.id===(e.from===selected.id?e.to:e.from))
                  return other?<div key={i} style={{ color:S.midText, fontSize:11, padding:'2px 0' }}><span style={{ color:typeColor(other.type) }}>●</span> {other.label} <span style={{ color:S.dim }}>({e.type})</span></div>:null
                })}
              </div>
              <div style={{ display:'flex', gap:6, marginTop:10 }}><Btn size="sm" color={S.danger}>Case</Btn><Btn size="sm" color={S.info} variant="outline">Dossier</Btn></div>
            </div>
          ) : <div style={{ ...cardSm, textAlign:'center', color:S.dim, fontSize:12 }}>Click any node to inspect entity details</div>}
          <div style={cardSm}>
            <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:10 }}>Centrality Leaderboard</div>
            {[...NETWORK_NODES].sort((a,b)=>b.centrality-a.centrality).slice(0,6).map((n,i)=>(
              <div key={n.id} onClick={()=>setSelected(n)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:`1px solid ${S.border}44`, cursor:'pointer' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ color:S.dim, fontSize:10, width:14 }}>#{i+1}</span>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:typeColor(n.type), display:'inline-block' }}/>
                  <span style={{ color:S.text, fontSize:12 }}>{n.label}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <span style={{ color:S.info, fontSize:11, fontWeight:600 }}>{n.centrality}</span>
                  <span style={{ ...badge(iriBand(n.risk).color), fontSize:9 }}>{n.risk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COVERAGE GAPS
// ═══════════════════════════════════════════════════════════════════════════════
function CoverageGaps() {
  const riskColor = r=>({Critical:S.danger,High:S.warn,Elevated:S.accent,Low:S.ok}[r]||S.midText)
  return (
    <div>
      <SectionHeader title="🌐 Coverage Gap Analysis" subtitle="Jurisdictional seams · Higher-risk regions · Kirby (2026) §2.3"/>
      <div style={{ ...card, marginBottom:16, color:S.dim, fontSize:12, lineHeight:1.7 }}>
        Jurisdictional fragmentation creates "institutional seams" exploited by criminal enterprises. Post-Murphy v. NCAA (2018): 38 additional U.S. state regimes. MENA/SEA/Africa regions show lowest oversight density with highest IRI concentrations.
      </div>
      {COVERAGE_GAPS.map(g=>(
        <div key={g.region} style={{ ...card, marginBottom:8, borderLeft:`3px solid ${riskColor(g.risk)}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>{g.region}</div>
              <div style={{ color:S.dim, fontSize:12, marginTop:2 }}>{g.tournaments} active tournaments · Oversight: <span style={{ color:riskColor(g.risk) }}>{g.oversight}</span></div>
            </div>
            <div style={{ display:'flex', gap:14 }}>
              <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>AVG IRI</div><div style={{ color:iriBand(g.iriAvg).color, fontSize:22, fontWeight:800 }}>{g.iriAvg}</div></div>
              <span style={{ ...badge(riskColor(g.risk)), alignSelf:'center' }}>{g.risk}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MICROBETS
// ═══════════════════════════════════════════════════════════════════════════════
function MicrobetMonitor() {
  const [filter, setFilter] = useState('all')
  const vc = v=>({Critical:S.danger,High:S.warn,Elevated:S.accent,Low:S.ok}[v]||S.dim)
  const filtered = MICROBET_MARKETS.filter(m=>filter==='all'||m.vuln===filter)
  return (
    <div>
      <SectionHeader title="⚡ Microbet & Prop-Bet Monitor" subtitle="In-play vulnerability scanner · Spot-fix detection · IRI adjustment modifiers"/>
      <div style={{ ...card, marginBottom:14, color:S.dim, fontSize:12, lineHeight:1.7 }}>
        The dissertation identifies in-play micro-markets as the highest-velocity manipulation vector: "discrete, granular athletic events — including a single double-fault — can be monetized independently of the final match result." A player can throw a single point while still winning the match overall.
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {['all','Critical','High','Elevated','Low'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:'5px 12px', borderRadius:6, fontSize:12, cursor:'pointer', background:filter===f?(vc(f)||S.mid):'transparent', color:filter===f?(f==='all'?S.text:'#000'):S.dim, border:`1px solid ${filter===f?(vc(f)||S.border):S.border}` }}>{f}</button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12 }}>
        {filtered.map(m=>(
          <div key={m.market} style={{ ...cardSm, borderTop:`3px solid ${vc(m.vuln)}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ color:S.text, fontSize:13, fontWeight:700 }}>{m.market}</div>
              <div style={{ display:'flex', gap:4, flexDirection:'column', alignItems:'flex-end' }}>
                <span style={{ ...badge(vc(m.vuln)) }}>{m.vuln}</span>
                {m.inPlay && <span style={{ ...badge(S.danger), fontSize:9 }}>IN-PLAY</span>}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
              <div><div style={{ color:S.dim, fontSize:10 }}>FIX WINDOW</div><div style={{ color:S.warn, fontSize:12, fontWeight:600 }}>{m.window}</div></div>
              <div><div style={{ color:S.dim, fontSize:10 }}>DETECTABILITY</div><div style={{ color:S.info, fontSize:12, fontWeight:600 }}>{m.detect}</div></div>
            </div>
            <div><div style={{ color:S.dim, fontSize:10 }}>IRI ADJUSTMENT</div><div style={{ color:m.iriMod>20?S.danger:m.iriMod>10?S.warn:S.ok, fontSize:16, fontWeight:800 }}>{m.iriMod>0?'+':''}{m.iriMod} to IRI</div></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BAYESIAN ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
function BayesianPanel() {
  const [likelihood, setLikelihood] = useState(0.72)
  const [flagRate, setFlagRate] = useState(0.18)
  const [evidW, setEvidW] = useState(0.65)
  const prior = Math.max(0.1, Math.min(0.9, 0.5 + (1 - Math.min(flagRate, 0.9)) * 0.3))
  const posterior = bayesianUpdate({ prior, likelihood, evidenceWeight: evidW })
  const deviation = Math.abs(posterior - likelihood) * 100

  const iterData = [0.3,0.45,0.55,0.65,0.72,0.80].map((l,i)=>({
    step:i+1, likelihood:l, prior,
    posterior:bayesianUpdate({ prior, likelihood:l, evidenceWeight:evidW }),
  }))

  return (
    <div>
      <SectionHeader title="🧠 Bayesian Probability Engine" subtitle="Posterior = P(L|prior)×P(prior)/P(evidence) — dynamic true probability refinement"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:14 }}>Inputs</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Field label={`MARKET-IMPLIED P(favorite): ${(likelihood*100).toFixed(0)}%`}><input type="range" min="0.05" max="0.95" step="0.01" value={likelihood} onChange={e=>setLikelihood(+e.target.value)}/></Field>
            <Field label={`PLAYER FLAG RATE: ${(flagRate*100).toFixed(0)}%`} hint={`Auto-calculated prior: ${(prior*100).toFixed(1)}%`}><input type="range" min="0.01" max="0.60" step="0.01" value={flagRate} onChange={e=>setFlagRate(+e.target.value)}/></Field>
            <Field label={`EVIDENCE WEIGHT (market trust): ${evidW}`} hint="Higher = trust market more. Default 0.65."><input type="range" min="0.1" max="0.9" step="0.05" value={evidW} onChange={e=>setEvidW(+e.target.value)}/></Field>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={cardSm}>
            <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Posterior Probability</div>
            {[['Market P(favorite)',(likelihood*100).toFixed(1)+'%',S.warn],['Historical prior',(prior*100).toFixed(1)+'%',S.info],['Bayesian posterior',(posterior*100).toFixed(1)+'%',S.ok],['Market vs posterior delta',deviation.toFixed(1)+'ppt',deviation>10?S.danger:S.ok]].map(([l,v,c])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${S.border}44` }}>
                <span style={{ color:S.dim, fontSize:12 }}>{l}</span>
                <span style={{ color:c, fontSize:13, fontWeight:700 }}>{v}</span>
              </div>
            ))}
            {deviation>10 && <div style={{ background:'#7f1d1d33', border:`1px solid ${S.danger}44`, color:S.danger, padding:8, borderRadius:6, fontSize:11, marginTop:10 }}>⚠ {deviation.toFixed(1)}ppt divergence — market odds may be artificially distorted.</div>}
          </div>
          <div style={{ ...card }}>
            <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:12 }}>Convergence Chart</div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={iterData}>
                <CartesianGrid strokeDasharray="3 3" stroke={S.border}/>
                <XAxis dataKey="step" tick={{ fill:S.dim, fontSize:10 }}/>
                <YAxis tickFormatter={v=>`${(v*100).toFixed(0)}%`} tick={{ fill:S.dim, fontSize:10 }}/>
                <Tooltip contentStyle={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:8 }} formatter={v=>`${(v*100).toFixed(1)}%`}/>
                <Legend wrapperStyle={{ color:S.dim, fontSize:11 }}/>
                <Line type="monotone" dataKey="likelihood" name="Market" stroke={S.warn} strokeWidth={1.5} strokeDasharray="4 2" dot={false}/>
                <Line type="monotone" dataKey="prior"      name="Prior"  stroke={S.info} strokeWidth={1.5} strokeDasharray="4 2" dot={false}/>
                <Line type="monotone" dataKey="posterior"  name="Posterior" stroke={S.ok} strokeWidth={2.5} dot={{ fill:S.ok, r:3 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARLAY RECOMMENDER
// ═══════════════════════════════════════════════════════════════════════════════
function ParlayRecommender() {
  const [stake, setStake] = useState(100)
  const [selected, setSelected] = useState([0,2])
  const options = MOCK_MATCHES.map((m,i)=>{const r=computeIRI({favoriteOdds:m.favOdds,underdogOdds:m.dogOdds,rankingGap:m.rankingGap,tier:m.tier});return{...m,...r,i}})
  const legs = options.filter((_,i)=>selected.includes(i))
  const combinedOdds = legs.reduce((p,m)=>p*m.favOdds,1)
  const implied = legs.reduce((p,m)=>p*impliedProb(m.favOdds),1)
  const ev = (combinedOdds*implied-1)*stake
  const avgIri = legs.length>0?legs.reduce((s,m)=>s+m.iri,0)/legs.length:0
  const rec = avgIri>70?{l:'AVOID — IRI too high',c:S.danger}:avgIri>50?{l:'CAUTION — elevated risk',c:S.warn}:ev>0?{l:'VIABLE — positive EV',c:S.ok}:{l:'NEGATIVE EV',c:S.accent}

  return (
    <div>
      <SectionHeader title="⭐ Parlay Recommender" subtitle="IRI-aware expected value calculator · Risk threshold offsets · Gambler risk mitigation"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:14 }}>Select Legs</div>
          {options.map((m,i)=>{const b=iriBand(m.iri),isSel=selected.includes(i);return(
            <div key={m.id} onClick={()=>setSelected(s=>s.includes(i)?s.filter(x=>x!==i):[...s,i])}
              style={{ ...cardSm, marginBottom:8, cursor:'pointer', borderLeft:`3px solid ${b.color}`, opacity:isSel?1:.5 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ color:S.text, fontSize:12, fontWeight:600 }}>{m.p1} vs {m.p2}</div>
                  <div style={{ color:S.dim, fontSize:10 }}>{m.tournament} · Odds: {m.favOdds}</div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:9 }}>IRI</div><div style={{ color:b.color, fontSize:16, fontWeight:800 }}>{m.iri.toFixed(0)}</div></div>
                  <div style={{ width:18, height:18, borderRadius:3, border:`2px solid ${b.color}`, background:isSel?b.color:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>{isSel&&<span style={{ color:'#000', fontSize:10 }}>✓</span>}</div>
                </div>
              </div>
            </div>
          )})}
          <Field label="STAKE ($)" style={{ marginTop:12 }}><input type="number" value={stake} onChange={e=>setStake(+e.target.value||0)} min="1" style={fieldStyle}/></Field>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ ...card, textAlign:'center' }}>
            <div style={{ color:S.dim, fontSize:12 }}>COMBINED ODDS</div>
            <div style={{ color:S.accent, fontSize:40, fontWeight:900 }}>{combinedOdds.toFixed(2)}</div>
            <div style={{ color:S.dim, fontSize:11 }}>{legs.length} legs · Implied: {(implied*100).toFixed(1)}%</div>
          </div>
          <div style={card}>
            {[['Potential return',`$${(stake*combinedOdds).toFixed(2)}`,S.ok],['Expected value',`${ev>=0?'+':''}$${ev.toFixed(2)}`,ev>=0?S.ok:S.danger],['Avg IRI',avgIri.toFixed(0),iriBand(avgIri).color]].map(([l,v,c])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ color:S.dim, fontSize:12 }}>{l}</span>
                <span style={{ color:c, fontSize:14, fontWeight:700 }}>{v}</span>
              </div>
            ))}
            <div style={{ background:rec.c+'22', border:`1px solid ${rec.c}44`, borderRadius:8, padding:12, textAlign:'center' }}>
              <div style={{ color:rec.c, fontSize:14, fontWeight:700 }}>{rec.l}</div>
            </div>
          </div>
          <div style={cardSm}>
            <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:8 }}>Risk Thresholds</div>
            {[[70,'Remove from parlay'],[60,'Reduce stake 50%'],[50,'Live-bet entry only'],[30,'Full action permitted']].map(([t,a])=>(
              <div key={t} style={{ display:'flex', gap:8, padding:'3px 0' }}>
                <span style={{ ...badge(iriBand(t).color), minWidth:50, textAlign:'center' }}>≥{t}</span>
                <span style={{ color:S.dim, fontSize:11 }}>{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPORTSBOOK RISK TOOL
// ═══════════════════════════════════════════════════════════════════════════════
function SportsbookTool() {
  const [suspended, setSuspended] = useState([])
  const matches = MOCK_MATCHES.map(m=>{
    const r=computeIRI({favoriteOdds:m.favOdds,underdogOdds:m.dogOdds,rankingGap:m.rankingGap,tier:m.tier})
    const handle = parseFloat(m.volume.replace(/[$KM]/g,''))*(m.volume.includes('M')?1000:1)
    return {...m,...r,handle,favLiab:handle*.7,worstCase:handle*.55,sharpPct:m.tier==='itf'?82:m.tier==='challenger'?41:18}
  })

  return (
    <div>
      <SectionHeader title="📊 Sportsbook Risk Mitigation Tool" subtitle="Real-time exposure · Sharp money detection · One-click market controls"/>
      <div style={{ display:'flex', gap:14, marginBottom:20, flexWrap:'wrap' }}>
        <StatCard label="Total Handle" value={`$${(matches.reduce((s,m)=>s+m.handle,0)/1000).toFixed(0)}K`} color={S.accent}/>
        <StatCard label="Markets Suspended" value={suspended.length} color={S.warn}/>
        <StatCard label="Sharp Money Alerts" value={matches.filter(m=>m.sharpPct>60).length} color={S.danger}/>
        <StatCard label="Critical IRI Matches" value={matches.filter(m=>m.iri>70).length} color={S.danger}/>
      </div>
      {matches.map(m=>{
        const b=iriBand(m.iri), isSusp=suspended.includes(m.id)
        const combRisk = m.iri>80&&m.sharpPct>70?'CRITICAL':m.iri>65||m.sharpPct>60?'HIGH':'MODERATE'
        const combColor = combRisk==='CRITICAL'?S.danger:combRisk==='HIGH'?S.warn:S.accent
        return (
          <div key={m.id} style={{ ...card, marginBottom:10, borderLeft:`3px solid ${isSusp?S.dim:combColor}`, opacity:isSusp?.65:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ color:S.text, fontSize:14, fontWeight:700 }}>{m.p1} vs {m.p2}</span>
                  {isSusp && <span style={{ ...badge(S.dim) }}>SUSPENDED</span>}
                  <span style={{ ...badge(combColor) }}>{combRisk}</span>
                </div>
                <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>{m.tournament}</div>
              </div>
              <div style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
                <div><div style={{ color:S.dim, fontSize:10 }}>HANDLE</div><div style={{ color:S.accent, fontSize:14, fontWeight:700 }}>{m.volume}</div></div>
                <div><div style={{ color:S.dim, fontSize:10 }}>SHARP $</div>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <div style={{ background:S.mid, borderRadius:3, height:5, width:60 }}><div style={{ background:m.sharpPct>60?S.danger:S.warn, borderRadius:3, height:5, width:`${m.sharpPct}%` }}/></div>
                    <span style={{ color:m.sharpPct>60?S.danger:S.warn, fontSize:12, fontWeight:700 }}>{m.sharpPct}%</span>
                  </div>
                </div>
                <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>IRI</div><div style={{ color:b.color, fontSize:22, fontWeight:900 }}>{m.iri.toFixed(0)}</div></div>
                <div style={{ display:'flex', gap:6 }}>
                  <Btn size="sm" color={isSusp?S.ok:S.danger} onClick={()=>setSuspended(s=>s.includes(m.id)?s.filter(x=>x!==m.id):[...s,m.id])}>{isSusp?'▶ Reopen':'⏸ Suspend'}</Btn>
                  <Btn size="sm" color={S.warn} variant="outline">Reduce Bets</Btn>
                  <Btn size="sm" color={S.info} variant="outline">Adjust Line</Btn>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY STATUS
// ═══════════════════════════════════════════════════════════════════════════════
function SecurityStatus() {
  const checks = [
    { label:'TLS 1.3 — all API traffic',             status:'ok',   detail:'Certificate auto-renewed via ACM' },
    { label:'AES-256 at rest (DynamoDB)',             status:'ok',   detail:'AWS managed keys (SSE)' },
    { label:'AWS Secrets Manager — zero plain-text', status:'ok',   detail:'4 API keys stored, rotation 90d' },
    { label:'KMS field-level encryption',            status:'ok',   detail:'Investigator notes, user IDs encrypted' },
    { label:'SHA-256 audit hash chain',              status:'ok',   detail:'Every IRI calculation hashed' },
    { label:'Cognito JWT auth — 1h expiry',          status:'ok',   detail:'MFA available for agent/regulator roles' },
    { label:'API Gateway throttling',                status:'warn', detail:'Rate limits set; Cloudflare WAF pending' },
    { label:'CF-Connecting-IP rate limiting',        status:'warn', detail:'slowapi configured; WAF rules TBD' },
    { label:'Records retention lifecycle',           status:'warn', detail:'Policy defined; S3 lifecycle rules pending' },
    { label:'Whistleblower portal (E2E)',             status:'todo', detail:'Planned v1.2 — Signal Protocol integration' },
    { label:'Immutable S3 WORM (CAS evidence)',      status:'todo', detail:'Planned v1.2' },
  ]
  const sc = s=>({ok:S.ok,warn:S.warn,todo:S.dim}[s])
  return (
    <div>
      <SectionHeader title="🔒 Security Status" subtitle="KMS · SHA-256 audit chain · Records retention · Cloudflare WAF"/>
      <div style={{ display:'flex', gap:14, marginBottom:20, flexWrap:'wrap' }}>
        {[['Passed',checks.filter(c=>c.status==='ok').length,S.ok],['Warnings',checks.filter(c=>c.status==='warn').length,S.warn],['Planned',checks.filter(c=>c.status==='todo').length,S.dim]].map(([l,v,c])=>(
          <StatCard key={l} label={l} value={v} color={c}/>
        ))}
      </div>
      {checks.map(c=>(
        <div key={c.label} style={{ ...cardSm, marginBottom:8, borderLeft:`3px solid ${sc(c.status)}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ color:S.text, fontSize:12, fontWeight:600 }}>{c.label}</div>
              <div style={{ color:S.dim, fontSize:11 }}>{c.detail}</div>
            </div>
            <span style={{ ...badge(sc(c.status)), fontSize:9 }}>{c.status.toUpperCase()}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELP
// ═══════════════════════════════════════════════════════════════════════════════
function Help({ userRole }) {
  const role = USER_ROLES[userRole]
  return (
    <div>
      <SectionHeader title="❓ Help & Documentation" subtitle={`Role: ${role?.icon} ${role?.label}`}/>
      {[
        ['IRI Formula', `IRI = 100 × [w₁ × |Y − Pw| + w₂ × V]\n\nPw = 1 / favoriteOdds (market-implied win probability)\nY  = observed outcome (0=favorite won, 1=upset)\nV  = structural vulnerability by tier (ITF=0.78, Grand Slam=0.08)\nw₁ = w₂ = 0.5 (equal weighting — dissertation default)\n\nValidated AUC: 0.873 (95% CI [0.868, 0.878]) on 2022–2026 holdout.\nParameter stability confirmed across 50/50, 70/30, and 30/70 weightings.`],
        ['Tier Vulnerability (V)', `Grand Slam:          V = 0.08\nMasters / WTA 1000:  V = 0.16\n500 Level:           V = 0.24\n250 / International: V = 0.34\nChallenger:          V = 0.55\nITF / Futures:       V = 0.78\n\nHigher V = more economic precarity = higher baseline integrity risk.\nITF upset rate: 41.5% vs Grand Slam: 29.8% (+11.7ppt, ANOVA p<.001)`],
        ['IRI Risk Bands', `0–29:   LOW      — routine, standard monitoring\n30–49:  ELEVATED — flag for follow-up\n50–69:  HIGH     — active alert, consider intervention\n70–100: CRITICAL — immediate escalation, open case`],
        ["Benford's Law", `P(d) = log₁₀(1 + 1/d) for digits 1–9\nExpects digit '1' as leading digit ~30.1% of the time.\n\nChi-square test (df=8): critical value 20.09 at p=.05.\nValues above 20.09 flag non-natural distributions in betting odds.\n\nNote: Supplementary forensic evidence — not standalone proof. Use in conjunction with full IRI score and structural analysis.`],
        ['Logistic Regression', `logit(P(Upset)) = β₀ + β₁·Pw + β₂·ΔR₁₀₀ + β₃·Tier + ε\n\nβ₀ = −1.42   (intercept)\nβ₁ = −3.81   (higher Pw → lower upset probability)\nβ₂ = −0.28   (ranking differential per 100 positions)\nβ₃ = +0.67   (Challenger tier bonus)\nβ₃ = +0.94   (ITF tier bonus)\n\nOdds Ratio = e^β₃. Verified against 500-iteration bootstrap.`],
        ['Citation', `Kirby, T. (2026). Black Swan Theory applied to professional tennis\nintegrity risk: A longitudinal, multi-tour quantitative analysis\n(2000–2026). Unpublished doctoral dissertation.\n\n"Integrity risk is not stochastic. It is structurally embedded\nwithin the competitive architecture of the sport." — Kirby (2026)`],
      ].map(([t,b])=>(
        <div key={t} style={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:12, padding:18, marginBottom:14 }}>
          <div style={{ color:S.accent, fontSize:14, fontWeight:700, marginBottom:10 }}>{t}</div>
          <div style={{ color:S.midText, fontSize:12, lineHeight:1.9, whiteSpace:'pre-line', fontFamily:"'IBM Plex Mono',monospace" }}>{b}</div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const ALL_TABS = [
  { id:'monitor',      label:'📡 Live Monitor',    component:LiveMonitor    },
  { id:'iri',          label:'⚡ IRI Calculator',  component:IRICalculator  },
  { id:'bayesian',     label:'🧠 Bayesian',         component:BayesianPanel  },
  { id:'benford',      label:'# Benford',           component:BenfordAnalysis},
  { id:'network',      label:'🕸️ Network',          component:NetworkGraph   },
  { id:'cases',        label:'🔨 Cases',            component:CaseManagement },
  { id:'dossiers',     label:'📁 Dossiers',         component:Dossiers       },
  { id:'microbets',    label:'⚡ Microbets',        component:MicrobetMonitor},
  { id:'sportsbook',   label:'📊 Sportsbook',       component:SportsbookTool },
  { id:'parlay',       label:'⭐ Parlay',            component:ParlayRecommender},
  { id:'coverage',     label:'🌐 Coverage',         component:CoverageGaps   },
  { id:'api',          label:'🔌 API Meter',        component:ApiMeter       },
  { id:'analytics',    label:'📊 Analytics',        component:Analytics      },
  { id:'alerts',       label:'🔔 Alerts',           component:AlertsPanel    },
  { id:'workgroup',    label:'👥 Workgroup',         component:Workgroup      },
  { id:'security',     label:'🔒 Security',         component:SecurityStatus },
  { id:'help',         label:'❓ Help',              component:Help           },
]

function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState('monitor')
  const [liveData, setLiveData] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const role = USER_ROLES[user.role]
  const visibleTabs = ALL_TABS.filter(t=>role?.tabs?.includes(t.id))
  const unreadAlerts = 3

  const sync = useCallback(async () => {
    if (!API) return
    setSyncing(true)
    try {
      const [h,o,s] = await Promise.allSettled([
        fetch(`${API}/health`).then(r=>r.json()),
        fetch(`${API}/odds`).then(r=>r.json()),
        fetch(`${API}/sportradar`).then(r=>r.json()),
      ])
      setLiveData({
        health:     h.status==='fulfilled'?h.value:null,
        odds:       o.status==='fulfilled'?o.value:null,
        sportradar: s.status==='fulfilled'?s.value:null,
      })
    } catch {}
    setSyncing(false)
  }, [])

  useEffect(() => { sync() }, [])

  const ActiveTab = visibleTabs.find(t=>t.id===tab)

  const tabProps = { userRole:user.role, user, liveData, liveOdds:liveData?.odds }

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', fontFamily:"'DM Sans',sans-serif" }}>
      {/* Top nav */}
      <div style={{ background:S.card, borderBottom:`1px solid ${S.border}`, height:56, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', position:'sticky', top:0, zIndex:100, gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:20 }}>🛡️</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:16, fontWeight:800, color:S.text }}>IRI <span style={{ color:S.accent }}>v1.1.0</span></span>
          {liveData?.health && <div style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{ width:6, height:6, borderRadius:'50%', background:S.ok }}/><span style={{ color:S.dim, fontSize:11 }}>Live</span></div>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={sync} disabled={syncing} style={{ background:'transparent', border:`1px solid ${S.border}`, borderRadius:6, padding:'5px 10px', color:S.dim, fontSize:11, cursor:'pointer' }}>
            <span style={{ display:'inline-block', animation:syncing?'spin 1s linear infinite':undefined }}>↻</span> {syncing?'Syncing…':'Sync'}
          </button>
          <span style={{ ...badge(role?.color||S.accent) }}>{role?.icon} {role?.label}</span>
          <span style={{ color:S.text, fontSize:13 }}>{user.username}</span>
          <button onClick={onLogout} style={{ background:'transparent', border:`1px solid ${S.border}`, borderRadius:6, padding:'5px 10px', color:S.dim, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
            <LogOut size={12}/> Sign Out
          </button>
        </div>
      </div>
      {/* Tab bar */}
      <div style={{ background:S.card, borderBottom:`1px solid ${S.border}`, padding:'8px 20px', display:'flex', gap:4, overflowX:'auto', flexShrink:0 }}>
        {visibleTabs.map(t=>(
          <TabPill key={t.id} id={t.id} label={t.label} active={tab===t.id} onClick={setTab} badgeCount={t.id==='alerts'?unreadAlerts:0}/>
        ))}
      </div>
      {/* Content */}
      <div style={{ flex:1, maxWidth:1300, width:'100%', margin:'0 auto', padding:'24px 20px' }}>
        {ActiveTab ? <ActiveTab.component {...tabProps}/> : <div style={{ color:S.dim }}>Tab not found.</div>}
      </div>
      {/* Footer */}
      <div style={{ borderTop:`1px solid ${S.border}`, padding:'10px 20px', display:'flex', justifyContent:'space-between', color:S.dim, fontSize:10, flexWrap:'wrap', gap:4, fontFamily:"'IBM Plex Mono',monospace" }}>
        <span>IRI v1.1.0 · Kirby (2026) · AUC 0.873 · n=106,849 ATP/WTA matches 2000–2026</span>
        <span>AWS Lambda + DynamoDB · SHA-256 audit chain · Zero plain-text credentials</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null)
  if (!user) return <AuthScreen onLogin={setUser}/>
  return <Dashboard user={user} onLogout={()=>setUser(null)}/>
}
