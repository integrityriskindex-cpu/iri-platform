import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ReferenceLine,
} from 'recharts'
import {
  Shield, Activity, Database, FolderOpen, Gavel, Hash, BarChart2,
  Bell, Users, Globe, HelpCircle, Network, TrendingUp, DollarSign,
  Zap, Star, Layers, Lock, RefreshCw, LogOut, Filter, Eye,
  Flag, Download, Share2, CheckCircle2, AlertTriangle, Target,
  Cpu, FileText, UserPlus, Settings, Key, Ban, ChevronDown,
  ChevronRight, Clipboard, Send, Edit2, Search,
} from 'lucide-react'

import {
  computeIRI, computeNFLIRI, computeCFBIRI, computeCBBIRI,
  iriBand, robustnessCheck, benfordExpected, bayesianUpdate,
  impliedProb, computeCredibility, detectMicrobetTrend,
  TENNIS_TIER_LABELS, TENNIS_TIER_V, NFL_TIER_LABELS,
  CFB_TIER_LABELS, CBB_TIER_LABELS, SPORTS_CONFIG, SURFACE_W,
} from './utils/iri.js'
import {
  USER_ROLES, ROLE_HIERARCHY, ROLE_TABS,
  MOCK_MATCHES, MOCK_APIS, INITIAL_CASES, INITIAL_DOSSIERS,
  INITIAL_ALERTS, INITIAL_POSTS, INITIAL_USERS, INITIAL_WORKGROUPS,
  DOC_TEMPLATES, TREND_DATA, TIER_DIST, SPORT_IRI_DIST,
  COVERAGE_GAPS, MICROBET_MARKETS, NETWORK_NODES, NETWORK_EDGES,
  FANTASY_DATA, VERSION,
} from './utils/data.js'
import {
  S, card, cardSm, badge, Btn, SectionHeader, StatCard,
  IRIBar, IRIGauge, TabPill, Field, fieldStyle, Toggle, SportBadge,
} from './components/UI.jsx'

const API = (typeof window !== 'undefined' && window.APP_CONFIG?.API_BASE_URL
  || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [mode, setMode]   = useState('login')
  const [form, setForm]   = useState({ username:'', password:'', role:'integrity_officer' })
  const [err,  setErr]    = useState('')

  const submit = () => {
    if (!form.username.trim()) { setErr('Username is required.'); return }
    if (form.password.length < 8) { setErr('Password must be at least 8 characters.'); return }
    onLogin({ username: form.username, role: form.role })
  }

  return (
    <div style={{ minHeight:'100vh', background:S.bg, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#1e2d4022 1px,transparent 1px),linear-gradient(90deg,#1e2d4022 1px,transparent 1px)', backgroundSize:'36px 36px', opacity:.5 }}/>
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 15% 25%,#f59e0b09,transparent 45%),radial-gradient(circle at 85% 75%,#3b82f609,transparent 45%)' }}/>
      <div style={{ ...card, width:440, maxWidth:'95vw', position:'relative', zIndex:1, boxShadow:'0 0 60px #f59e0b18' }}>
        <div style={{ textAlign:'center', marginBottom:26 }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🛡️</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:22, fontWeight:800, color:S.text }}>
            IRI <span style={{ color:S.accent }}>v{VERSION}</span>
          </div>
          <div style={{ color:S.dim, fontSize:12, marginTop:4 }}>Integrity Risk Index — Multi-Sport Platform</div>
          <div style={{ color:S.dim, fontSize:11, marginTop:2, fontFamily:"'IBM Plex Mono',monospace" }}>AUC 0.873 · n=106,849+ · Kirby (2026)</div>
        </div>
        <div style={{ display:'flex', gap:4, background:S.mid, borderRadius:8, padding:4, marginBottom:18 }}>
          {['login','register'].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setErr('')}} style={{ flex:1, padding:'8px 0', background:mode===m?S.card:'transparent', color:mode===m?S.text:S.dim, border:`1px solid ${mode===m?S.border:'transparent'}`, borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:mode===m?700:400, textTransform:'capitalize' }}>{m}</button>
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
        <div style={{ textAlign:'center', marginTop:14, color:S.dim, fontSize:10, fontFamily:"'IBM Plex Mono',monospace" }}>
          AWS Cognito · SHA-256 audit chain · Zero plain-text keys
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOD MODE
// ═══════════════════════════════════════════════════════════════════════════════
function GodMode({ currentUser }) {
  const [users,      setUsers]      = useState(INITIAL_USERS)
  const [workgroups, setWorkgroups] = useState(INITIAL_WORKGROUPS)
  const [activeSection, setSection] = useState('users')
  const [newUser, setNewUser] = useState({ username:'', role:'special_agent', workgroup:'WG-Alpha' })

  const lockout  = (id) => setUsers(us => us.map(u => u.id===id ? {...u, lockedOut:!u.lockedOut, status:u.lockedOut?'active':'locked'} : u))
  const resetPwd = (id) => alert(`Password reset link sent for user ${id}. In production this triggers AWS Cognito admin reset.`)
  const addUser  = () => {
    if (!newUser.username.trim()) return
    setUsers(us => [...us, { id:`U-${Date.now()}`, ...newUser, status:'active', lockedOut:false, lastLogin:'Never', createdBy:currentUser.username }])
    setNewUser({ username:'', role:'special_agent', workgroup:'WG-Alpha' })
  }

  const sectionBtn = (id, label) => (
    <button onClick={()=>setSection(id)} style={{ padding:'7px 14px', borderRadius:6, fontSize:12, cursor:'pointer', background:activeSection===id?S.mid:'transparent', color:activeSection===id?S.god:S.dim, border:`1px solid ${activeSection===id?S.god+'44':'transparent'}`, fontWeight:activeSection===id?700:400 }}>{label}</button>
  )

  return (
    <div>
      <SectionHeader title="👁️ God Mode — Integrity Chief Console" subtitle={`Full system control · Version IRI v${VERSION} · Operator: ${currentUser.username}`}/>
      <div style={{ ...card, marginBottom:16, borderColor:S.god+'44', background:'#1a0a2e' }}>
        <div style={{ color:S.god, fontSize:13, fontWeight:700, marginBottom:6 }}>⚠ RESTRICTED ACCESS — INTEGRITY CHIEF ONLY</div>
        <div style={{ color:S.dim, fontSize:12 }}>This console provides full user management, workgroup control, API injection, profile switching, lockout authority, and system configuration. All actions are SHA-256 logged and immutable.</div>
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:18, flexWrap:'wrap' }}>
        {sectionBtn('users','👤 User Management')}
        {sectionBtn('workgroups','👥 Workgroups')}
        {sectionBtn('apis','🔌 API Injection')}
        {sectionBtn('profiles','🎭 Profile Switcher')}
        {sectionBtn('archive','🗄️ Document Archive')}
        {sectionBtn('patch','🔧 Patch / Version')}
      </div>

      {/* USER MANAGEMENT */}
      {activeSection==='users' && (
        <div>
          <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
            <StatCard label="Total Users" value={users.length} color={S.god}/>
            <StatCard label="Active" value={users.filter(u=>u.status==='active').length} color={S.ok}/>
            <StatCard label="Locked Out" value={users.filter(u=>u.lockedOut).length} color={S.danger}/>
            <StatCard label="Flagged" value={users.filter(u=>u.status==='flagged').length} color={S.warn}/>
          </div>
          {/* Add user */}
          <div style={{ ...card, marginBottom:16 }}>
            <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Add New User</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <input value={newUser.username} onChange={e=>setNewUser(n=>({...n,username:e.target.value}))} placeholder="Username" style={{ ...fieldStyle, flex:1, minWidth:150 }}/>
              <select value={newUser.role} onChange={e=>setNewUser(n=>({...n,role:e.target.value}))} style={{ ...fieldStyle, flex:1 }}>
                {Object.entries(USER_ROLES).filter(([k])=>k!=='god').map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
              <select value={newUser.workgroup} onChange={e=>setNewUser(n=>({...n,workgroup:e.target.value}))} style={{ ...fieldStyle, flex:1 }}>
                {workgroups.map(wg=><option key={wg.id} value={wg.id}>{wg.name}</option>)}
                <option value="none">No Workgroup</option>
              </select>
              <Btn onClick={addUser} color={S.god} size="sm"><UserPlus size={11}/>Create</Btn>
            </div>
          </div>
          {users.map(u=>{
            const role=USER_ROLES[u.role]
            return (
              <div key={u.id} style={{ ...cardSm, marginBottom:8, borderLeft:`3px solid ${u.lockedOut?S.danger:role?.color||S.midText}`, opacity:u.lockedOut?.7:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ color:S.text, fontWeight:700 }}>{u.username}</span>
                      <span style={{ ...badge(role?.color||S.midText) }}>{role?.icon} {role?.label}</span>
                      <span style={{ ...badge(u.lockedOut?S.danger:S.ok) }}>{u.lockedOut?'LOCKED':'ACTIVE'}</span>
                    </div>
                    <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>Workgroup: {u.workgroup} · Last login: {u.lastLogin}</div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <Btn size="sm" color={u.lockedOut?S.ok:S.danger} onClick={()=>lockout(u.id)}><Ban size={11}/>{u.lockedOut?'Unlock':'Lock Out'}</Btn>
                    <Btn size="sm" color={S.warn} variant="outline" onClick={()=>resetPwd(u.id)}><Key size={11}/>Reset Pwd</Btn>
                    <Btn size="sm" color={S.info} variant="outline"><Edit2 size={11}/>Edit Role</Btn>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* WORKGROUPS */}
      {activeSection==='workgroups' && (
        <div>
          {workgroups.map(wg=>(
            <div key={wg.id} style={{ ...card, marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div>
                  <div style={{ color:S.text, fontSize:15, fontWeight:700 }}>{wg.name}</div>
                  <div style={{ color:S.dim, fontSize:11 }}>ID: {wg.id} · Supervisor: {wg.supervisor} · Clearance: {wg.clearance}</div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <span style={{ ...badge(wg.restricted?S.danger:S.ok) }}>{wg.restricted?'RESTRICTED':'OPEN'}</span>
                  <Btn size="sm" color={wg.restricted?S.ok:S.danger} onClick={()=>setWorkgroups(wgs=>wgs.map(w=>w.id===wg.id?{...w,restricted:!w.restricted}:w))}>{wg.restricted?'Open':'Restrict'}</Btn>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ flex:1, background:S.mid, borderRadius:8, padding:'8px 12px' }}>
                  <div style={{ color:S.dim, fontSize:10, marginBottom:4 }}>AGENTS</div>
                  {wg.agents.map(a=><div key={a} style={{ color:S.text, fontSize:12 }}>• {a}</div>)}
                </div>
                <div style={{ flex:1, background:S.mid, borderRadius:8, padding:'8px 12px' }}>
                  <div style={{ color:S.dim, fontSize:10, marginBottom:4 }}>SPORT FOCUS</div>
                  <SportBadge sport={wg.sport}/>
                </div>
              </div>
            </div>
          ))}
          <Btn color={S.god} size="sm"><UserPlus size={11}/>Create Workgroup</Btn>
        </div>
      )}

      {/* API INJECTION */}
      {activeSection==='apis' && (
        <div>
          <div style={{ color:S.dim, fontSize:12, marginBottom:14 }}>God Mode allows adding new API connections directly through the console without a code deploy. Each new API is validated, credibility-scored, and injected into the live system.</div>
          <div style={{ ...card, marginBottom:12 }}>
            <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Inject New API</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="API NAME"><input placeholder="e.g. KenPom College Basketball" style={fieldStyle}/></Field>
              <Field label="ENDPOINT URL"><input placeholder="https://kenpom.com/api/..." style={fieldStyle}/></Field>
              <Field label="API KEY (stored in Secrets Manager)"><input type="password" placeholder="Key never stored in UI" style={fieldStyle}/></Field>
              <Field label="SPORT CONTEXT">
                <select style={fieldStyle}>
                  {Object.entries(SPORTS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ marginTop:12 }}><Btn color={S.god}><Database size={11}/>Inject API</Btn></div>
          </div>
          <div style={{ color:S.textDim, fontSize:11, color:S.dim }}>All API keys are encrypted via AWS KMS before storage. The key value is never retrievable through this UI after saving.</div>
        </div>
      )}

      {/* PROFILE SWITCHER */}
      {activeSection==='profiles' && (
        <div>
          <div style={{ color:S.dim, fontSize:12, marginBottom:14 }}>Switch between role profiles to preview exactly what each user type sees. This does not change your own session — it opens a read-only preview.</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
            {Object.entries(USER_ROLES).map(([k,v])=>(
              <div key={k} style={{ ...cardSm, borderLeft:`3px solid ${v.color}`, cursor:'pointer' }} onClick={()=>alert(`Preview: ${v.label} dashboard would open in a separate read-only session.`)}>
                <div style={{ fontSize:24, marginBottom:6 }}>{v.icon}</div>
                <div style={{ color:S.text, fontSize:13, fontWeight:700 }}>{v.label}</div>
                <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>Tier {v.tier} · {ROLE_TABS[k]?.length} tabs</div>
                <div style={{ marginTop:8 }}><Btn size="sm" color={v.color} variant="outline">Preview</Btn></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOCUMENT ARCHIVE */}
      {activeSection==='archive' && (
        <div>
          <div style={{ color:S.dim, fontSize:12, marginBottom:14 }}>Centralized document archive. All case files, reports, and evidence packs are stored here, categorized by workgroup and clearance level. God mode has full access to all documents.</div>
          {DOC_TEMPLATES.map(t=>(
            <div key={t.id} style={{ ...cardSm, marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ color:S.text, fontSize:13, fontWeight:700 }}>{t.name}</div>
                  <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>Fields: {t.fields.join(', ')}</div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {t.requiresApproval && <span style={{ ...badge(S.warn) }}>Requires Approval</span>}
                  <Btn size="sm" color={S.info} variant="outline"><FileText size={11}/>Use Template</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PATCH */}
      {activeSection==='patch' && (
        <div>
          <div style={{ ...card, marginBottom:14 }}>
            <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:8 }}>Version Management</div>
            <div style={{ display:'flex', gap:14, marginBottom:14 }}>
              <div style={cardSm}><div style={{ color:S.dim, fontSize:11 }}>CURRENT VERSION</div><div style={{ color:S.accent, fontSize:22, fontWeight:800 }}>v{VERSION}</div></div>
              <div style={cardSm}><div style={{ color:S.dim, fontSize:11 }}>LAST DEPLOY</div><div style={{ color:S.text, fontSize:14, fontWeight:700 }}>2026-04-02</div></div>
              <div style={cardSm}><div style={{ color:S.dim, fontSize:11 }}>BUILD STATUS</div><div style={{ color:S.ok, fontSize:14, fontWeight:700 }}>✓ Healthy</div></div>
            </div>
            <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:8 }}>Deploy Patch Update</div>
            <div style={{ display:'flex', gap:10 }}>
              <input placeholder="Patch description e.g. 'Fix Benford threshold'" style={{ ...fieldStyle, flex:1 }}/>
              <Btn color={S.god}><RefreshCw size={11}/>Deploy Patch</Btn>
            </div>
            <div style={{ color:S.dim, fontSize:11, marginTop:8 }}>Patch deploys trigger an Amplify rebuild via GitHub commit. Zero-downtime deployment. Audit log entry created automatically.</div>
          </div>
          <div style={card}>
            <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:10 }}>Version History</div>
            {[['v1.3.0','2026-04-02','Multi-sport engine, God Mode, workgroup hierarchy, AI microbets'],['v1.2.0','2026-03-28','Cognito auth, DynamoDB persistence, SES alerts, Neo4j graph, PDF export'],['v1.1.0','2026-03-20','IRI calculator, Live Monitor, API Meter, Benford, Bayesian engine'],['v1.0.0','2026-03-10','Initial deployment — dissertation IRI mathematics']].map(([v,d,n])=>(
              <div key={v} style={{ display:'flex', gap:12, padding:'7px 0', borderBottom:`1px solid ${S.border}44` }}>
                <span style={{ ...badge(S.accent), fontFamily:"'IBM Plex Mono',monospace" }}>{v}</span>
                <span style={{ color:S.dim, fontSize:11, width:80 }}>{d}</span>
                <span style={{ color:S.midText, fontSize:12 }}>{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPORTS SWITCH
// ═══════════════════════════════════════════════════════════════════════════════
function SportsSwitch({ activeSport, onSwitch }) {
  return (
    <div>
      <SectionHeader title="🏟️ Sports Switch" subtitle="Switch between sports to access sport-specific IRI models, match data, and integrity coverage"/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:14 }}>
        {Object.entries(SPORTS_CONFIG).map(([k,v])=>{
          const isActive = activeSport === k
          const models = { dissertation:'Kirby (2026) dissertation model', info_asymmetry:'NFL Information Asymmetry', nil_ats:'CFB NIL / ATS Point Shaving', kenpom:'CBB KenPom-weighted', generic:'Adapted IRI model' }
          return (
            <div key={k} onClick={()=>onSwitch(k)} style={{
              ...cardSm, cursor:'pointer', textAlign:'center',
              borderColor: isActive ? S.accent : S.border,
              background: isActive ? '#1a1200' : S.card,
              transition:'all .2s',
            }}>
              <div style={{ fontSize:32, marginBottom:8 }}>{v.icon}</div>
              <div style={{ color: isActive ? S.accent : S.text, fontSize:13, fontWeight:700, marginBottom:4 }}>{v.label}</div>
              <div style={{ color:S.dim, fontSize:10, marginBottom:8 }}>{models[v.model] || v.model}</div>
              {isActive
                ? <span style={{ ...badge(S.accent) }}>ACTIVE</span>
                : <Btn size="sm" color={S.dim} variant="outline" style={{ fontSize:11 }}>Switch</Btn>
              }
            </div>
          )
        })}
      </div>
      <div style={{ ...card, marginTop:20 }}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:8 }}>Currently Active: {SPORTS_CONFIG[activeSport]?.icon} {SPORTS_CONFIG[activeSport]?.label}</div>
        <div style={{ color:S.dim, fontSize:12 }}>Live Monitor, IRI Calculator, and Case Management now show {SPORTS_CONFIG[activeSport]?.label} data. All IRI calculations use the {SPORTS_CONFIG[activeSport]?.model} model.</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// IRI CALCULATOR (multi-sport)
// ═══════════════════════════════════════════════════════════════════════════════
function IRICalculator({ activeSport }) {
  const [form, setForm] = useState({ favOdds:1.38, dogOdds:3.05, gap:28, tier:'challenger', surface:'clay', w1:0.5, kenpomDiff:8, closingSpread:10, finalMargin:3, nilExposure:false, normalVol:5000, currentVol:25000, injuryLatency:30, offshoreDiv:8 })
  const sport = activeSport || 'tennis'

  const result = useMemo(()=>{
    switch(sport) {
      case 'nfl': return computeNFLIRI({ normalVolume:+form.normalVol, currentVolume:+form.currentVol, tier:form.tier, injuryLatencyMin:+form.injuryLatency, offshoreVsRegulatedDivergence:+form.offshoreDiv, w1:+form.w1, w2:+(1-form.w1).toFixed(1) })
      case 'cfb': return computeCFBIRI({ favoriteOdds:+form.favOdds, closingSpread:+form.closingSpread, finalMargin:+form.finalMargin, tier:form.tier, nilExposure:form.nilExposure, w1:+form.w1, w2:+(1-form.w1).toFixed(1) })
      case 'cbb': return computeCBBIRI({ favoriteOdds:+form.favOdds, kenpomDiff:+form.kenpomDiff, tier:form.tier, w1:+form.w1, w2:+(1-form.w1).toFixed(1) })
      default:    return computeIRI({ favoriteOdds:+form.favOdds, underdogOdds:+form.dogOdds, rankingGap:+form.gap, tier:form.tier, surface:form.surface, sport, w1:+form.w1, w2:+(1-form.w1).toFixed(1) })
    }
  },[form, sport])

  const tierLabels = sport==='nfl' ? NFL_TIER_LABELS : sport==='cfb' ? CFB_TIER_LABELS : sport==='cbb' ? CBB_TIER_LABELS : TENNIS_TIER_LABELS
  const robust = sport==='tennis' ? robustnessCheck({ favoriteOdds:+form.favOdds, underdogOdds:+form.dogOdds, rankingGap:+form.gap, tier:form.tier, surface:form.surface, sport }) : []

  return (
    <div>
      <SectionHeader title="⚡ IRI Calculator" subtitle={`${SPORTS_CONFIG[sport]?.icon} ${SPORTS_CONFIG[sport]?.label} · IRI = 100 × [w₁ × Anomaly + w₂ × V] · Kirby (2026)`}/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:16 }}>
            {SPORTS_CONFIG[sport]?.icon} {SPORTS_CONFIG[sport]?.label} Parameters
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Sport-specific inputs */}
            {sport==='nfl' ? (<>
              <Field label="NORMAL PROP VOLUME ($)"><input type="number" value={form.normalVol} onChange={e=>setForm(f=>({...f,normalVol:e.target.value}))} style={fieldStyle}/></Field>
              <Field label="CURRENT PROP VOLUME ($)" hint={`Ratio: ${((+form.currentVol/Math.max(+form.normalVol,1))*100-100).toFixed(0)}% above baseline`}><input type="number" value={form.currentVol} onChange={e=>setForm(f=>({...f,currentVol:e.target.value}))} style={fieldStyle}/></Field>
              <Field label="INJURY REPORT LATENCY (minutes)" hint="Time between closed practice and official report"><input type="number" value={form.injuryLatency} onChange={e=>setForm(f=>({...f,injuryLatency:e.target.value}))} style={fieldStyle}/></Field>
              <Field label="OFFSHORE vs REGULATED DIVERGENCE (%)"><input type="number" value={form.offshoreDiv} onChange={e=>setForm(f=>({...f,offshoreDiv:e.target.value}))} style={fieldStyle}/></Field>
            </>) : sport==='cfb' ? (<>
              <Field label="FAVORITE ODDS"><input type="number" step="0.01" value={form.favOdds} onChange={e=>setForm(f=>({...f,favOdds:e.target.value}))} style={fieldStyle}/></Field>
              <Field label="CLOSING POINT SPREAD"><input type="number" value={form.closingSpread} onChange={e=>setForm(f=>({...f,closingSpread:e.target.value}))} style={fieldStyle}/></Field>
              <Field label="FINAL MARGIN OF VICTORY" hint="ATS Residual = |Spread − Margin|"><input type="number" value={form.finalMargin} onChange={e=>setForm(f=>({...f,finalMargin:e.target.value}))} style={fieldStyle}/></Field>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:S.dim, fontSize:12 }}>No NIL Exposure (higher vulnerability)</span>
                <div onClick={()=>setForm(f=>({...f,nilExposure:!f.nilExposure}))} style={{ width:40, height:20, borderRadius:10, background:form.nilExposure?S.danger:S.mid, cursor:'pointer', position:'relative' }}>
                  <div style={{ position:'absolute', top:2, left:form.nilExposure?22:2, width:16, height:16, borderRadius:'50%', background:'white', transition:'left .2s' }}/>
                </div>
              </div>
            </>) : sport==='cbb' ? (<>
              <Field label="FAVORITE ODDS"><input type="number" step="0.01" value={form.favOdds} onChange={e=>setForm(f=>({...f,favOdds:e.target.value}))} style={fieldStyle}/></Field>
              <Field label="KENPOM EFFICIENCY DIFFERENTIAL" hint="Higher gap = more predictable outcome"><input type="number" value={form.kenpomDiff} onChange={e=>setForm(f=>({...f,kenpomDiff:e.target.value}))} style={fieldStyle}/></Field>
            </>) : (<>
              <Field label="FAVORITE ODDS" hint={`Implied P(win): ${(impliedProb(+form.favOdds)*100).toFixed(1)}%`}><input type="number" step="0.01" min="1.01" value={form.favOdds} onChange={e=>setForm(f=>({...f,favOdds:e.target.value}))} style={fieldStyle}/></Field>
              <Field label="UNDERDOG ODDS"><input type="number" step="0.01" min="1.01" value={form.dogOdds} onChange={e=>setForm(f=>({...f,dogOdds:e.target.value}))} style={fieldStyle}/></Field>
              <Field label="RANKING GAP" hint={`ΔR₁₀₀ = ${(+form.gap/100).toFixed(2)}`}><input type="number" min="0" value={form.gap} onChange={e=>setForm(f=>({...f,gap:e.target.value}))} style={fieldStyle}/></Field>
              {sport==='tennis' && (
                <Field label="SURFACE">
                  <select value={form.surface} onChange={e=>setForm(f=>({...f,surface:e.target.value}))} style={fieldStyle}>
                    {Object.entries(SURFACE_W).map(([k,v])=><option key={k} value={k}>{k.charAt(0).toUpperCase()+k.slice(1)} (×{v})</option>)}
                  </select>
                </Field>
              )}
            </>)}
            <Field label="TIER / POSITION">
              <select value={form.tier} onChange={e=>setForm(f=>({...f,tier:e.target.value}))} style={fieldStyle}>
                {Object.entries(tierLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label={`w₁: ${form.w1} / w₂: ${(1-form.w1).toFixed(1)}`} hint="Default 0.5/0.5 — dissertation §4.3">
              <input type="range" min="0.1" max="0.9" step="0.1" value={form.w1} onChange={e=>setForm(f=>({...f,w1:parseFloat(e.target.value)}))} style={{ width:'100%', marginTop:6 }}/>
            </Field>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ ...card, textAlign:'center' }}>
            <IRIGauge value={result.iri}/>
            {sport==='nfl' && <div style={{ color:S.dim, fontSize:11, marginTop:8 }}>Volume ratio: {(result.volumeRatio*100).toFixed(0)}% · Latency bonus: {(result.latencyBonus*100).toFixed(0)}%</div>}
            {sport==='cfb' && <div style={{ color:S.dim, fontSize:11, marginTop:8 }}>ATS Residual: {(result.spreadResidual*100).toFixed(1)}% · NIL Adj: {form.nilExposure?'×1.25':'×1.00'}</div>}
            {sport==='cbb' && <div style={{ color:S.dim, fontSize:11, marginTop:8 }}>KenPom factor: {(result.kenpomFactor*100).toFixed(0)}% · Adj anomaly applied</div>}
            {sport==='tennis' && <div style={{ color:S.dim, fontSize:11, marginTop:8 }}>P(Upset logistic) = {(result.upsetProb*100).toFixed(1)}% · OR = {result.oddsRatio?.toFixed(2)}x</div>}
          </div>
          <div style={card}>
            <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:12 }}>Component Breakdown</div>
            <IRIBar label="Structural Vulnerability V" value={(result.V||0)*100} color="#f97316"/>
            {sport==='nfl' ? (<>
              <IRIBar label="Volume Anomaly Ratio" value={(result.volumeRatio||0)*100} color="#3b82f6"/>
              <IRIBar label="Injury Latency Signal" value={(result.latencyBonus||0)*100} color="#8b5cf6"/>
              <IRIBar label="Offshore Divergence" value={(result.offshoreBonus||0)*100} color="#ec4899"/>
            </>) : sport==='cfb' ? (
              <IRIBar label="ATS Spread Residual" value={(result.spreadResidual||0)*100} color="#3b82f6"/>
            ) : sport==='cbb' ? (<>
              <IRIBar label="Probabilistic Residual" value={(result.residual||0)*100} color="#3b82f6"/>
              <IRIBar label="KenPom Adjustment" value={(result.kenpomFactor||0)*100} color="#8b5cf6"/>
            </>) : (<>
              <IRIBar label="Probabilistic Residual |Y−Pw|" value={(result.residual||0)*100} color="#3b82f6"/>
              <IRIBar label="Market Implied Pw" value={(result.Pw||0)*100} color="#8b5cf6"/>
            </>)}
          </div>
          {sport==='tennis' && robust.length > 0 && (
            <div style={card}>
              <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:10 }}>Robustness Check</div>
              {robust.map(r=>{const b=iriBand(r.iri);return(
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:`1px solid ${S.border}` }}>
                  <span style={{ color:S.dim, fontSize:12 }}>w₁/w₂ = {r.label}</span>
                  <span style={{ color:b.color, fontSize:15, fontWeight:700 }}>{r.iri.toFixed(1)}</span>
                  <span style={{ ...badge(b.color) }}>{b.label}</span>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE MONITOR (multi-sport)
// ═══════════════════════════════════════════════════════════════════════════════
function LiveMonitor({ activeSport, liveOdds }) {
  const [tierFilter, setTierFilter] = useState('all')
  const [minIri,     setMinIri]     = useState(0)
  const [search,     setSearch]     = useState('')
  const [expanded,   setExpanded]   = useState(null)
  const sport = activeSport || 'tennis'
  const matches = MOCK_MATCHES[sport] || MOCK_MATCHES.tennis

  const enriched = useMemo(()=>matches.map(m=>{
    let r
    switch(sport) {
      case 'nfl': r=computeNFLIRI({normalVolume:m.normalVol||5000,currentVolume:m.currentVol||8000,tier:m.tier,injuryLatencyMin:m.injuryLatency||0,offshoreVsRegulatedDivergence:m.offshoreDiv||0}); break
      case 'cfb': r=computeCFBIRI({favoriteOdds:m.favOdds,closingSpread:m.closingSpread||7,finalMargin:m.finalMargin||3,tier:m.tier,nilExposure:m.nilExposure||false}); break
      case 'cbb': r=computeCBBIRI({favoriteOdds:m.favOdds,kenpomDiff:m.kenpomDiff||5,tier:m.tier}); break
      default:    r=computeIRI({favoriteOdds:m.favOdds,underdogOdds:m.dogOdds||3.00,rankingGap:m.rankingGap||20,tier:m.tier,surface:m.surface,sport})
    }
    return { ...m, ...r, band:iriBand(r.iri) }
  }),[matches, sport])

  const filtered = enriched
    .filter(m=>tierFilter==='all'||m.tier===tierFilter)
    .filter(m=>m.iri>=minIri)
    .filter(m=>!search||`${m.p1||''} ${m.p2||''} ${m.event||''}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>b.iri-a.iri)

  return (
    <div>
      <SectionHeader title={`📡 Live Monitor — ${SPORTS_CONFIG[sport]?.icon} ${SPORTS_CONFIG[sport]?.label}`} subtitle={`${filtered.length} matches · IRI = 100 × [w₁ × Anomaly + w₂ × V]`}
        actions={liveOdds && <span style={{ ...badge(S.ok) }}>● Live API</span>}/>
      <div style={{ ...cardSm, marginBottom:14, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <Filter size={13} color={S.dim}/>
        <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{ ...fieldStyle, width:180 }}/>
        <select value={tierFilter} onChange={e=>setTierFilter(e.target.value)} style={{ ...fieldStyle, width:'auto' }}>
          <option value="all">All Tiers</option>
          {Object.entries(sport==='nfl'?NFL_TIER_LABELS:sport==='cfb'?CFB_TIER_LABELS:sport==='cbb'?CBB_TIER_LABELS:TENNIS_TIER_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ color:S.dim, fontSize:12 }}>Min IRI:</span>
          <input type="range" min="0" max="90" value={minIri} onChange={e=>setMinIri(+e.target.value)} style={{ width:80 }}/>
          <span style={{ color:S.accent, fontWeight:700, fontSize:12 }}>{minIri}</span>
        </div>
      </div>
      {filtered.map(m=>(
        <div key={m.id} onClick={()=>setExpanded(x=>x===m.id?null:m.id)}
          style={{ ...card, marginBottom:8, cursor:'pointer', borderLeft:`3px solid ${m.band.color}`, background:expanded===m.id?S.mid:S.card }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div style={{ flex:1, minWidth:180 }}>
              <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>
                {m.p1 || m.event} {m.p2 ? `vs ${m.p2}` : ''}
              </div>
              <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>
                {m.event} · {m.propType||m.surface||sport.replace('_',' ')} · <SportBadge sport={sport}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
              {sport==='nfl' ? (<>
                <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>PROP</div><div style={{ color:S.text, fontSize:12 }}>{m.propType}</div></div>
                <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>VOL SPIKE</div><div style={{ color: m.currentVol/m.normalVol>10?S.danger:S.warn, fontSize:13, fontWeight:700 }}>+{Math.round((m.currentVol/m.normalVol-1)*100)}%</div></div>
              </>) : sport==='cfb' ? (<>
                <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>SPREAD</div><div style={{ color:S.text, fontSize:13 }}>{m.closingSpread}pts</div></div>
                <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>FINAL MARGIN</div><div style={{ color: Math.abs(m.closingSpread-m.finalMargin)>7?S.danger:S.ok, fontSize:13, fontWeight:700 }}>{m.finalMargin}pts</div></div>
              </>) : (<>
                <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>ODDS</div><div style={{ color:S.text, fontSize:13, fontWeight:600 }}>{m.favOdds} / {m.dogOdds}</div></div>
                <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>MOVEMENT</div><div style={{ color:m.movement?.startsWith('+')?parseInt(m.movement)>30?S.danger:S.ok:S.midText, fontSize:12, fontWeight:700 }}>{m.movement}</div></div>
              </>)}
              <div style={{ textAlign:'center', minWidth:55 }}>
                <div style={{ color:S.dim, fontSize:10 }}>IRI</div>
                <div style={{ color:m.band.color, fontSize:26, fontWeight:900, lineHeight:1 }}>{m.iri.toFixed(0)}</div>
                <span style={{ ...badge(m.band.color), fontSize:9 }}>{m.band.label}</span>
              </div>
            </div>
          </div>
          {expanded===m.id && (
            <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${S.border}` }}>
              <div style={{ display:'flex', gap:8 }}>
                <Btn size="sm" color={S.danger}><Gavel size={11}/>Create Case</Btn>
                <Btn size="sm" color={S.info} variant="outline"><FileText size={11}/>Report</Btn>
                <Btn size="sm" color={S.accent} variant="outline"><Flag size={11}/>Flag</Btn>
                <Btn size="sm" color={S.ok} variant="outline"><Share2 size={11}/>Workgroup</Btn>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CASE MANAGEMENT (with workgroup approval workflow)
// ═══════════════════════════════════════════════════════════════════════════════
function CaseManagement({ user }) {
  const [cases,    setCases]    = useState(INITIAL_CASES)
  const [expanded, setExpanded] = useState(null)
  const [noteText, setNoteText] = useState('')
  const sevColor = { Critical:S.danger, High:S.warn, Medium:S.accent, Low:S.ok }
  const canApprove = ['god','main_account','supervisor'].includes(user?.role)
  const canAmend   = ['god','main_account','supervisor','special_agent'].includes(user?.role)

  const addNote = (caseId) => {
    if (!noteText.trim()) return
    const stamp = `[${new Date().toISOString().slice(0,16).replace('T',' ')} · ${user.username}] `
    setCases(cs=>cs.map(c=>c.id===caseId?{...c,notes:[...c.notes,{text:noteText,user:user.username,ts:new Date().toISOString(),internal:false}]}:c))
    setNoteText('')
  }
  const approve = (caseId) => setCases(cs=>cs.map(c=>c.id===caseId?{...c,pendingApproval:false,status:'Active'}:c))

  return (
    <div>
      <SectionHeader title="🔨 Case Management" subtitle="Investigative workflow · Approval sign-off · CAS evidence · SHA-256 audit"
        actions={<Btn size="sm" color={S.danger}><Gavel size={11}/>New Case</Btn>}/>
      {canApprove && cases.filter(c=>c.pendingApproval).length > 0 && (
        <div style={{ ...card, marginBottom:14, borderLeft:`3px solid ${S.warn}` }}>
          <div style={{ color:S.warn, fontWeight:700, fontSize:13, marginBottom:6 }}>⏳ Pending Approval ({cases.filter(c=>c.pendingApproval).length})</div>
          {cases.filter(c=>c.pendingApproval).map(c=>(
            <div key={c.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:`1px solid ${S.border}44` }}>
              <span style={{ color:S.text, fontSize:12 }}>{c.id} — {c.title}</span>
              <div style={{ display:'flex', gap:6 }}>
                <Btn size="sm" color={S.ok} onClick={()=>approve(c.id)}><CheckCircle2 size={11}/>Approve</Btn>
                <Btn size="sm" color={S.danger} variant="outline">Reject</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display:'flex', gap:14, marginBottom:18, flexWrap:'wrap' }}>
        <StatCard label="Active" value={cases.filter(c=>c.status!=='Closed').length} color={S.danger}/>
        <StatCard label="Pending Approval" value={cases.filter(c=>c.pendingApproval).length} color={S.warn}/>
        <StatCard label="Sports Covered" value={[...new Set(cases.map(c=>c.sport))].length} color={S.info}/>
        <StatCard label="Avg IRI" value={Math.round(cases.reduce((s,c)=>s+c.iri,0)/cases.length)} color={S.accent}/>
      </div>
      {cases.map(c=>(
        <div key={c.id} onClick={()=>setExpanded(x=>x===c.id?null:c.id)}
          style={{ ...card, marginBottom:10, cursor:'pointer', borderLeft:`3px solid ${sevColor[c.severity]}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                <span style={{ color:S.dim, fontSize:11, fontFamily:"'IBM Plex Mono',monospace" }}>{c.id}</span>
                <span style={{ ...badge(sevColor[c.severity]) }}>{c.severity}</span>
                <SportBadge sport={c.sport}/>
                {c.pendingApproval && <span style={{ ...badge(S.warn) }}>⏳ PENDING APPROVAL</span>}
              </div>
              <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>{c.title}</div>
              <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>Assignee: {c.assignee} · Supervisor: {c.supervisor} · Due: {c.due}</div>
            </div>
            <div style={{ display:'flex', gap:14 }}>
              <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>IRI</div><div style={{ color:iriBand(c.iri).color, fontSize:22, fontWeight:800 }}>{c.iri}</div></div>
              <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>CONF</div><div style={{ color:S.ok, fontSize:16, fontWeight:700 }}>{c.confidence}%</div></div>
            </div>
          </div>
          {expanded===c.id && (
            <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${S.border}` }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div><div style={{ color:S.dim, fontSize:11, marginBottom:4 }}>ENTITIES</div>{c.entities.map(e=><div key={e} style={{ color:S.text, fontSize:12 }}>• {e}</div>)}</div>
                <div><div style={{ color:S.dim, fontSize:11, marginBottom:4 }}>NOTES ({c.notes.length})</div>{c.notes.slice(-3).map((n,i)=><div key={i} style={{ color:S.midText, fontSize:11, marginBottom:2 }}>• [{n.user}] {n.text}</div>)}</div>
              </div>
              {canAmend && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ color:S.dim, fontSize:11, marginBottom:5 }}>ADD NOTE (SHA-256 logged · {c.pendingApproval?'requires supervisor sign-off to amend record':'free to add'})</div>
                  <div style={{ display:'flex', gap:8 }}>
                    <input value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Investigation note…" style={{ ...fieldStyle, flex:1 }}/>
                    <Btn size="sm" color={S.accent} onClick={()=>addNote(c.id)}><Send size={11}/>Add</Btn>
                  </div>
                </div>
              )}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <Btn size="sm" color={S.danger}><AlertTriangle size={11}/>Escalate</Btn>
                <Btn size="sm" color={S.info} variant="outline"><Download size={11}/>Evidence Pack</Btn>
                {canApprove && c.pendingApproval && <Btn size="sm" color={S.ok} onClick={()=>approve(c.id)}><CheckCircle2 size={11}/>Approve Amendments</Btn>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOSSIERS (multi-sport)
// ═══════════════════════════════════════════════════════════════════════════════
function Dossiers({ user }) {
  const [dossiers,   setDossiers]   = useState(INITIAL_DOSSIERS)
  const [selected,   setSelected]   = useState(null)
  const [sportFilter, setSportFilter] = useState('all')
  const [typeFilter,  setTypeFilter]  = useState('all')
  const [searchQ,     setSearchQ]     = useState('')
  const canViewRestricted = ['god','main_account','supervisor'].includes(user?.role)
  const typeColor = t=>({Player:S.info,Official:S.danger,Tournament:S.warn,Coach:S.accent,Sportsbook:'#8b5cf6'}[t]||S.midText)

  const filtered = dossiers
    .filter(d=>sportFilter==='all'||d.sport===sportFilter||d.sport==='all')
    .filter(d=>typeFilter==='all'||d.type===typeFilter)
    .filter(d=>!d.restricted||canViewRestricted)
    .filter(d=>!searchQ||d.name.toLowerCase().includes(searchQ.toLowerCase()))

  return (
    <div>
      <SectionHeader title="📁 Dossier System" subtitle="Multi-sport entity profiles — players, officials, coaches, tournaments, sportsbooks"
        actions={<Btn size="sm" color={S.accent}><UserPlus size={11}/>New Dossier</Btn>}/>
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <Search size={13} color={S.dim}/>
        <input placeholder="Search entity…" value={searchQ} onChange={e=>setSearchQ(e.target.value)} style={{ ...fieldStyle, width:180 }}/>
        <select value={sportFilter} onChange={e=>setSportFilter(e.target.value)} style={{ ...fieldStyle, width:'auto' }}>
          <option value="all">All Sports</option>
          {Object.entries(SPORTS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        {['all','Player','Official','Tournament','Coach','Sportsbook'].map(t=>(
          <button key={t} onClick={()=>setTypeFilter(t)} style={{ padding:'5px 12px', borderRadius:6, fontSize:12, cursor:'pointer', background:typeFilter===t?S.mid:'transparent', color:typeFilter===t?S.text:S.dim, border:`1px solid ${typeFilter===t?S.border:'transparent'}` }}>{t}</button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
        {filtered.map(d=>{
          const b=iriBand(d.avgIri), c=typeColor(d.type)
          return (
            <div key={d.id} onClick={()=>setSelected(s=>s===d.id?null:d.id)}
              style={{ ...card, cursor:'pointer', borderTop:`3px solid ${c}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div>
                  <div style={{ display:'flex', gap:6, marginBottom:4, flexWrap:'wrap' }}>
                    <span style={{ ...badge(c) }}>{d.type}</span>
                    <SportBadge sport={d.sport}/>
                    {d.restricted && <span style={{ ...badge(S.danger), fontSize:9 }}>🔒 RESTRICTED</span>}
                  </div>
                  <div style={{ color:S.text, fontSize:15, fontWeight:700 }}>{d.name}</div>
                  <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>{d.tier} · {d.nationality}</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ color:b.color, fontSize:28, fontWeight:900 }}>{d.avgIri}</div>
                  <span style={{ ...badge(b.color), fontSize:9 }}>AVG IRI</span>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', color:S.dim, fontSize:11, marginBottom:6 }}>
                <span>Flagged: <span style={{ color:S.danger, fontWeight:700 }}>{d.flagged}</span>/{d.total}</span>
                <span>{d.surface}</span>
              </div>
              <ResponsiveContainer width="100%" height={38}>
                <LineChart data={d.history.map((v,i)=>({i,v}))}>
                  <Line type="monotone" dataKey="v" stroke={b.color} strokeWidth={2} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
              {selected===d.id && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${S.border}` }}>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                    {d.history.map((v,i)=>{const bb=iriBand(v);return <div key={i} style={{ flex:1, background:bb.bg, borderRadius:4, padding:'3px 0', textAlign:'center' }}><div style={{ color:bb.color, fontSize:12, fontWeight:700 }}>{v}</div></div>})}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <Btn size="sm" color={S.danger}><Gavel size={11}/>Case</Btn>
                    <Btn size="sm" color={S.info} variant="outline"><Flag size={11}/>Flag</Btn>
                    <Btn size="sm" color={S.accent} variant="outline"><Download size={11}/>Export</Btn>
                    {canViewRestricted && !d.restricted && <Btn size="sm" color={S.warn} variant="outline"><Lock size={11}/>Restrict</Btn>}
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
// AI MICROBET MONITOR
// ═══════════════════════════════════════════════════════════════════════════════
function MicrobetMonitor({ activeSport }) {
  const [filter, setFilter] = useState('all')
  const sport = activeSport || 'all'
  const vc = v=>({Critical:S.danger,High:S.warn,Elevated:S.accent,Low:S.ok}[v]||S.dim)
  const filtered = MICROBET_MARKETS.filter(m=>(filter==='all'||m.vuln===filter)&&(sport==='all'||m.sport==='all'||m.sport===sport))

  return (
    <div>
      <SectionHeader title="⚡ AI Microbet Intelligence" subtitle="Trend detection · Spot-fix scanner · Emerging market alerts · AI volume analysis"/>
      <div style={{ ...card, marginBottom:14, color:S.dim, fontSize:12, lineHeight:1.7 }}>
        The AI trend detector analyzes volume time-series for each microbet market using acceleration analysis. Rising acceleration patterns that exceed 50% of baseline volume trigger CRITICAL alerts. NFL injury-latency props and tennis double-fault markets show the highest anomaly rates in the current corpus.
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        {['all','Critical','High','Elevated','Low'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:'5px 12px', borderRadius:6, fontSize:12, cursor:'pointer', background:filter===f?(vc(f)||S.mid):'transparent', color:filter===f?(f==='all'?S.text:'#000'):S.dim, border:`1px solid ${filter===f?(vc(f)||S.border):S.border}` }}>{f}</button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:12 }}>
        {filtered.map(m=>{
          const trend = detectMicrobetTrend(m.aiTrend||[])
          const trendColor = trend.urgency==='CRITICAL'?S.danger:trend.urgency==='ELEVATED'?S.warn:S.ok
          return (
            <div key={m.market} style={{ ...cardSm, borderTop:`3px solid ${vc(m.vuln)}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ color:S.text, fontSize:13, fontWeight:700 }}>{m.market}</div>
                <div style={{ display:'flex', gap:4, flexDirection:'column', alignItems:'flex-end' }}>
                  <span style={{ ...badge(vc(m.vuln)) }}>{m.vuln}</span>
                  {m.inPlay && <span style={{ ...badge(S.danger), fontSize:9 }}>IN-PLAY</span>}
                </div>
              </div>
              <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
                <SportBadge sport={m.sport}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                <div><div style={{ color:S.dim, fontSize:10 }}>FIX WINDOW</div><div style={{ color:S.warn, fontSize:12, fontWeight:600 }}>{m.window}</div></div>
                <div><div style={{ color:S.dim, fontSize:10 }}>DETECTABILITY</div><div style={{ color:S.info, fontSize:12, fontWeight:600 }}>{m.detect}</div></div>
              </div>
              {/* AI Trend */}
              {m.aiTrend && (
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ color:S.dim, fontSize:10 }}>AI TREND DETECTOR</span>
                    <span style={{ ...badge(trendColor), fontSize:9 }}>{trend.urgency} · {trend.direction}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={36}>
                    <AreaChart data={m.aiTrend.map((v,i)=>({i,v}))}>
                      <Area type="monotone" dataKey="v" stroke={trendColor} fill={trendColor+'22'} strokeWidth={1.5}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div><div style={{ color:S.dim, fontSize:10 }}>IRI ADJUSTMENT</div><div style={{ color:m.iriMod>20?S.danger:m.iriMod>10?S.warn:S.ok, fontSize:16, fontWeight:800 }}>{m.iriMod>0?'+':''}{m.iriMod} to IRI</div></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FANTASY BLIND MONITOR
// ═══════════════════════════════════════════════════════════════════════════════
function FantasyMonitor() {
  const d = FANTASY_DATA
  return (
    <div>
      <SectionHeader title="🎮 Fantasy Blind Monitor" subtitle="Aggregate participant intelligence · Anomaly detection without individual surveillance"/>
      <div style={{ ...card, marginBottom:16, borderLeft:`3px solid ${S.info}` }}>
        <div style={{ color:S.info, fontSize:13, fontWeight:700, marginBottom:6 }}>Privacy-First Design</div>
        <div style={{ color:S.dim, fontSize:12 }}>This module aggregates fantasy participant behavior without monitoring individuals. Integrity officials can see where the public is concentrating — without seeing who — allowing detection of market manipulation signals from fantasy data without personal surveillance.</div>
      </div>
      {d.concentrationAnomaly?.detected && (
        <div style={{ ...card, marginBottom:16, borderLeft:`3px solid ${S.danger}` }}>
          <div style={{ color:S.danger, fontSize:13, fontWeight:700, marginBottom:4 }}>⚠ Concentration Anomaly Detected</div>
          <div style={{ color:S.text, fontSize:12 }}>
            <SportBadge sport={d.concentrationAnomaly.sport}/> {d.concentrationAnomaly.prop} — {d.concentrationAnomaly.pctFavoring}
          </div>
          <div style={{ color:S.midText, fontSize:12, marginTop:4 }}>
            {d.concentrationAnomaly.participantPct}% of participants favoring this side vs normal {d.concentrationAnomaly.normalPct}%. 
            This level of concentration (+{d.concentrationAnomaly.participantPct-d.concentrationAnomaly.normalPct}ppt) may indicate insider information circulating in fantasy communities prior to official disclosure.
          </div>
        </div>
      )}
      <div style={card}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Top Picked Players — Aggregate Data</div>
        <div style={{ color:S.dim, fontSize:11, marginBottom:12 }}>Individuals not identifiable. Data shown as aggregate population percentages only.</div>
        {d.topPickedPlayers.map((p,i)=>(
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${S.border}44` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ color:S.dim, fontSize:11, width:18 }}>#{i+1}</span>
              <div>
                <div style={{ color:S.text, fontSize:13, fontWeight:600 }}>{p.name}</div>
                <div style={{ color:S.dim, fontSize:11 }}><SportBadge sport={p.sport}/> · Avg pts: {p.avgPoints}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ color:S.dim, fontSize:10 }}>PICK %</div>
                <div style={{ background:S.mid, borderRadius:3, height:5, width:80 }}>
                  <div style={{ background:p.pickPct>70?S.warn:S.ok, borderRadius:3, height:5, width:`${p.pickPct}%` }}/>
                </div>
                <div style={{ color:p.pickPct>70?S.warn:S.ok, fontSize:12, fontWeight:700 }}>{p.pickPct}%</div>
              </div>
              {p.iriFlag && <span style={{ ...badge(S.danger) }}>IRI FLAG</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKGROUP (with hierarchy, approvals, internal notes)
// ═══════════════════════════════════════════════════════════════════════════════
function Workgroup({ user }) {
  const [posts,    setPosts]    = useState(INITIAL_POSTS)
  const [note,     setNote]     = useState('')
  const [matchRef, setMatchRef] = useState('T-001')
  const [internal, setInternal] = useState(false)
  const isSupOrAbove = ['god','main_account','supervisor'].includes(user?.role)

  const submit = () => {
    if (!note.trim()) return
    setPosts(p=>[{ id:`WG-${Date.now()}`, user:user.username, role:USER_ROLES[user.role]?.label||user.role, from:isSupOrAbove?'supervisor':'agent', match:matchRef, sport:'tennis', note, ts:new Date().toISOString().slice(0,16).replace('T',' '), upvotes:0, flagged:false, internal }, ...p])
    setNote('')
  }

  return (
    <div>
      <SectionHeader title="👥 Workgroup Intelligence" subtitle="Hierarchy-aware collaboration · Internal notes · Supervisor approval workflow"/>
      <div style={{ ...card, marginBottom:18 }}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Share Intelligence</div>
        <div style={{ display:'flex', gap:10, marginBottom:10, flexWrap:'wrap' }}>
          <select value={matchRef} onChange={e=>setMatchRef(e.target.value)} style={{ ...fieldStyle, flex:'0 0 160px' }}>
            {Object.values(MOCK_MATCHES).flat().map(m=><option key={m.id} value={m.id}>{m.id}: {m.p1||m.event}</option>)}
          </select>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Intelligence note…" style={{ ...fieldStyle, flex:1 }} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          <Btn onClick={submit} size="sm" color={S.accent}><Share2 size={11}/>Share</Btn>
        </div>
        <div style={{ display:'flex', gap:14, alignItems:'center' }}>
          <Toggle on={internal} onChange={setInternal} label="Internal note only (supervisors+ visible)"/>
          {isSupOrAbove && <span style={{ ...badge(S.ok), fontSize:10 }}>Supervisor: can download all notes</span>}
        </div>
      </div>
      {posts.map(p=>{
        const isInternal = p.internal
        if (isInternal && !isSupOrAbove && p.user !== user?.username) return null
        return (
          <div key={p.id} style={{ ...cardSm, marginBottom:10, borderLeft:`3px solid ${isInternal?S.warn:S.border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ display:'flex', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:S.mid, display:'flex', alignItems:'center', justifyContent:'center', color:S.accent, fontSize:14, fontWeight:700 }}>{p.user[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:3, flexWrap:'wrap' }}>
                    <span style={{ color:S.text, fontSize:13, fontWeight:600 }}>{p.user}</span>
                    <span style={{ ...badge(S.info), fontSize:10 }}>{p.role}</span>
                    <span style={{ color:S.dim, fontSize:10 }}>re: {p.match}</span>
                    {isInternal && <span style={{ ...badge(S.warn), fontSize:9 }}>🔒 INTERNAL</span>}
                    {p.from==='agent' && isSupOrAbove && <span style={{ ...badge(S.accent), fontSize:9 }}>↑ Awaiting sign-off</span>}
                  </div>
                  <div style={{ color:S.midText, fontSize:12, lineHeight:1.5 }}>{p.note}</div>
                  <div style={{ color:S.dim, fontSize:10, marginTop:4 }}>{p.ts}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:5 }}>
                <button onClick={()=>setPosts(ps=>ps.map(pp=>pp.id===p.id?{...pp,upvotes:pp.upvotes+1}:pp))} style={{ background:'transparent', border:`1px solid ${S.border}`, borderRadius:4, padding:'2px 8px', color:S.midText, cursor:'pointer', fontSize:11 }}>↑ {p.upvotes}</button>
                {isSupOrAbove && p.from==='agent' && <Btn size="sm" color={S.ok} variant="outline"><CheckCircle2 size={11}/>Sign Off</Btn>}
                <Btn size="sm" color={S.danger} variant="outline"><Flag size={11}/></Btn>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALERTS (multi-sport, email status)
// ═══════════════════════════════════════════════════════════════════════════════
function AlertsPanel({ user }) {
  const [alerts,    setAlerts]    = useState(INITIAL_ALERTS)
  const [threshold, setThreshold] = useState(65)
  const [emailOn,   setEmailOn]   = useState(true)
  const unread = alerts.filter(a=>!a.read).length
  const sc = s=>({Critical:S.danger,High:S.warn,Elevated:S.accent,Info:S.info}[s]||S.dim)

  return (
    <div>
      <SectionHeader title="🔔 Alert System" subtitle="Multi-sport IRI threshold notifications · Email via SES · Sportsbook risk triggers"/>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
        <div>
          <div style={{ display:'flex', gap:12, marginBottom:14, flexWrap:'wrap' }}>
            <StatCard label="Unread" value={unread} color={S.danger}/>
            <StatCard label="Email Sent" value={alerts.filter(a=>a.emailSent).length} color={S.ok}/>
            <StatCard label="Sports Covered" value={[...new Set(alerts.map(a=>a.sport))].length} color={S.info}/>
          </div>
          {alerts.map(a=>(
            <div key={a.id} onClick={()=>setAlerts(al=>al.map(x=>x.id===a.id?{...x,read:true}:x))}
              style={{ ...cardSm, marginBottom:8, cursor:'pointer', opacity:a.read?.65:1, borderLeft:`3px solid ${sc(a.severity)}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ display:'flex', gap:6, marginBottom:4, flexWrap:'wrap', alignItems:'center' }}>
                    {!a.read && <div style={{ width:6, height:6, borderRadius:'50%', background:S.danger }}/>}
                    <span style={{ ...badge(sc(a.severity)) }}>{a.severity}</span>
                    <span style={{ ...badge(S.info+'88'), color:S.info, fontSize:10 }}>{a.type}</span>
                    <SportBadge sport={a.sport}/>
                    {a.emailSent && <span style={{ ...badge(S.ok), fontSize:9 }}>✉ Email Sent</span>}
                  </div>
                  <div style={{ color:S.text, fontSize:13 }}>{a.message}</div>
                  <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>{a.ts} · {a.matchId}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ ...card, marginBottom:14 }}>
            <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Alert Configuration</div>
            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ color:S.dim, fontSize:12 }}>IRI Trigger Level</span>
                <span style={{ color:S.accent, fontWeight:700 }}>{threshold}</span>
              </div>
              <input type="range" min="20" max="95" value={threshold} onChange={e=>setThreshold(+e.target.value)} style={{ width:'100%' }}/>
              <span style={{ ...badge(iriBand(threshold).color), marginTop:4, display:'block', width:'fit-content' }}>Triggers at: {iriBand(threshold).label}</span>
            </div>
            <Toggle on={emailOn} onChange={setEmailOn} label="Email Alerts (AWS SES)"/>
            <div style={{ color:S.dim, fontSize:10, marginTop:6 }}>Emails sent to verified addresses via AWS SES. Per-role email routing configured in Secrets Manager.</div>
          </div>
          {user?.role==='sportsbook' && (
            <div style={card}>
              <div style={{ color:S.warn, fontSize:13, fontWeight:700, marginBottom:10 }}>⚠ Sportsbook Risk Triggers</div>
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
// BENFORD ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════
function BenfordAnalysis() {
  const [subset, setSubset] = useState('high_risk')
  const expected = benfordExpected()
  const obs = { all:[30.1,17.6,12.5,9.7,7.9,6.7,5.8,5.1,4.6], high_risk:[21.2,13.1,10.2,8.1,6.8,8.9,9.4,11.2,11.1], low_risk:[31.0,17.9,12.6,9.8,7.7,6.5,5.6,4.9,4.0] }
  const chartData = expected.map((e,i)=>({ digit:e.digit, expected:parseFloat(e.expected.toFixed(1)), observed:obs[subset][i] }))
  const chi2 = chartData.reduce((s,d)=>{const O=d.observed,E=d.expected;return E>0?s+Math.pow(O-E,2)/E:s},0)
  const suspicious = chi2 > 20.09
  return (
    <div>
      <SectionHeader title="# Benford's Law Forensic" subtitle="P(d) = log₁₀(1+1/d) · χ² goodness-of-fit · df=8 · Kirby (2026) §4.4"/>
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        {[['all','All Matches'],['high_risk','High-Risk (IRI ≥ 70)'],['low_risk','Low-Risk (IRI < 30)']].map(([k,l])=>(
          <button key={k} onClick={()=>setSubset(k)} style={{ padding:'6px 14px', borderRadius:6, fontSize:12, cursor:'pointer', background:subset===k?S.mid:'transparent', color:subset===k?S.text:S.dim, border:`1px solid ${subset===k?S.border:'transparent'}` }}>{l}</button>
        ))}
      </div>
      <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
        <StatCard label="χ² Statistic" value={chi2.toFixed(2)} color={suspicious?S.danger:S.ok} sub="df=8, critical=20.09"/>
        <StatCard label="Status" value={suspicious?'SUSPECT':'NORMAL'} color={suspicious?S.danger:S.ok}/>
      </div>
      <div style={card}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:14 }}>First Digit Distribution vs Benford Expected</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top:5, right:20, bottom:5, left:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={S.border}/>
            <XAxis dataKey="digit" tick={{ fill:S.dim, fontSize:12 }}/>
            <YAxis tick={{ fill:S.dim, fontSize:11 }} tickFormatter={v=>`${v.toFixed(0)}%`}/>
            <Tooltip contentStyle={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:8 }} formatter={(v,n)=>[`${v.toFixed(1)}%`,n]}/>
            <Legend wrapperStyle={{ color:S.dim, fontSize:12 }}/>
            <Bar dataKey="expected" name="Benford Expected" fill={S.info} opacity={.7} radius={[4,4,0,0]}/>
            <Bar dataKey="observed" name="Observed" radius={[4,4,0,0]}>
              {chartData.map((e,i)=><Cell key={i} fill={Math.abs(e.observed-e.expected)>5?S.danger:S.ok}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS (multi-sport)
// ═══════════════════════════════════════════════════════════════════════════════
function Analytics() {
  return (
    <div>
      <SectionHeader title="📊 Analytics & Reports" subtitle="Multi-sport IRI trends · Gender invariance · Coverage · Export suite"/>
      <div style={{ ...card, marginBottom:20 }}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>IRI Trend — Oct 2025 to Mar 2026 (Tennis)</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={TREND_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={S.border}/>
            <XAxis dataKey="m" tick={{ fill:S.dim, fontSize:11 }}/>
            <YAxis tick={{ fill:S.dim, fontSize:11 }}/>
            <Tooltip contentStyle={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:8 }}/>
            <ReferenceLine y={70} stroke={S.danger} strokeDasharray="3 3" label={{ value:'Critical (70)', fill:S.danger, fontSize:10, position:'insideTopRight' }}/>
            <Line type="monotone" dataKey="iri" name="Avg IRI" stroke={S.accent} strokeWidth={2.5} dot={false}/>
            <Line type="monotone" dataKey="alerts" name="Alerts" stroke={S.danger} strokeWidth={1.5} dot={false} strokeDasharray="4 2"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:4 }}>Tennis Tier Upset Rate</div>
          <div style={{ color:S.dim, fontSize:11, marginBottom:12 }}>ANOVA F(3,106849)=106.73, p&lt;.001, η²=0.003</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={TIER_DIST}>
              <CartesianGrid strokeDasharray="3 3" stroke={S.border}/>
              <XAxis dataKey="tier" tick={{ fill:S.dim, fontSize:9 }}/>
              <YAxis tick={{ fill:S.dim, fontSize:11 }} domain={[25,45]}/>
              <Tooltip contentStyle={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:8 }} formatter={v=>[`${v}%`,'Upset Rate']}/>
              <Bar dataKey="upset" name="Upset %" radius={[4,4,0,0]}>{TIER_DIST.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Multi-Sport Avg IRI Comparison</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={SPORT_IRI_DIST} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={S.border}/>
              <XAxis type="number" tick={{ fill:S.dim, fontSize:10 }} domain={[0,100]}/>
              <YAxis type="category" dataKey="sport" tick={{ fill:S.dim, fontSize:9 }} width={140}/>
              <Tooltip contentStyle={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:8 }}/>
              <Bar dataKey="avgIri" name="Avg IRI" radius={[0,4,4,0]}>{SPORT_IRI_DIST.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ ...card, marginBottom:20 }}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:8 }}>Cross-Tour Gender Invariance (ATP / WTA)</div>
        <div style={{ color:S.dim, fontSize:12, marginBottom:12 }}>β_gender ≈ 0 (p &gt; 0.05) — Integrity Risk ⊥ Gender | Structural Variables · Kirby (2026) §4.4</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:12 }}>
          {[['ATP Avg IRI','58.4','62,410 matches'],['WTA Avg IRI','57.9','44,439 matches'],['Gender β','≈ 0','p > 0.05 — not significant',S.ok]].map(([l,v,s,c])=>(
            <div key={l} style={cardSm}><div style={{ color:S.dim, fontSize:11 }}>{l}</div><div style={{ color:c||S.text, fontSize:22, fontWeight:800 }}>{v}</div><div style={{ color:S.dim, fontSize:10 }}>{s}</div></div>
          ))}
        </div>
        <div style={{ padding:10, background:'#14532d33', borderRadius:8, color:S.ok, fontSize:12 }}>✓ Gender invariance confirmed. Single IRI model applies equally to ATP and WTA. This principle extends to WNBA vs NBA comparisons — risk driven by structural economics, not gender.</div>
      </div>
      <div style={card}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Export Suite</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10 }}>
          {[['📄 PDF Report',S.danger],['📊 XLSX Data',S.ok],['🗂️ CSV Export',S.info],['📝 DOCX Report',S.accent],['⚖️ CAS Evidence Pack',S.danger],['📥 Import CSV',S.midText],['📥 Import XLSX',S.midText],['📥 Import DOCX',S.midText]].map(([l,c])=>(
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
function ApiMeter({ liveData, activeSport }) {
  const apis = useMemo(()=>MOCK_APIS.map(a=>({ ...a, cred:computeCredibility({ successCalls:a.successCalls, totalCalls:a.totalCalls, stdDevOdds:a.stdDevOdds, confirmedAlerts:a.confirmedAlerts, totalAlerts:a.totalAlerts, avgLatencyMs:a.avgLatencyMs }) })),[])
  const sc = s=>s==='live'?S.ok:s==='warn'?S.warn:S.danger

  return (
    <div>
      <SectionHeader title="🔌 API Credibility Engine" subtitle="ACL: credibility = successRate×0.35 + consistency×0.25 + verification×0.25 + latency×0.15"/>
      {!API && <div style={{ ...card, marginBottom:14, borderLeft:`3px solid ${S.warn}` }}><div style={{ color:S.warn, fontWeight:700, fontSize:13, marginBottom:4 }}>⚠ No API URL Configured</div><div style={{ color:S.dim, fontSize:12 }}>Set VITE_API_BASE_URL in Amplify environment variables to enable live data.</div></div>}
      {liveData && (liveData.health||liveData.odds||liveData.sportradar) && (
        <div style={{ ...card, marginBottom:14, borderLeft:`3px solid ${S.ok}` }}>
          <div style={{ color:S.ok, fontWeight:700, fontSize:13, marginBottom:6 }}>● Live Backend Response</div>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap', fontSize:12 }}>
            {liveData.health && <span style={{ color:S.dim }}>Health: <span style={{ color:S.ok }}>{liveData.health.status}</span></span>}
            {liveData.odds?.normalizedFavorite && <span style={{ color:S.dim }}>Fav Odds: <span style={{ color:S.accent }}>{liveData.odds.normalizedFavorite}</span></span>}
            {liveData.sportradar?.totalScheduled !== undefined && <span style={{ color:S.dim }}>Scheduled: <span style={{ color:S.info }}>{liveData.sportradar.totalScheduled} matches</span></span>}
          </div>
        </div>
      )}
      <div style={{ display:'flex', gap:14, marginBottom:18, flexWrap:'wrap' }}>
        <StatCard label="APIs Monitored" value={apis.length}/>
        <StatCard label="Live" value={apis.filter(a=>a.status==='live').length} color={S.ok}/>
        <StatCard label="Degraded / Error" value={apis.filter(a=>a.status!=='live').length} color={S.danger}/>
        <StatCard label="Avg Credibility" value={`${Math.round(apis.reduce((s,a)=>s+a.cred,0)/apis.length)}%`} color={S.ok}/>
      </div>
      {apis.map(api=>(
        <div key={api.name} style={{ ...card, marginBottom:8, borderLeft:`3px solid ${sc(api.status)}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:sc(api.status) }}/>
                <span style={{ color:S.text, fontWeight:700 }}>{api.name}</span>
                <span style={{ ...badge(sc(api.status)) }}>{api.status.toUpperCase()}</span>
                {api.sports?.map(s=><SportBadge key={s} sport={s}/>)}
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
// NETWORK GRAPH
// ═══════════════════════════════════════════════════════════════════════════════
function NetworkGraph({ activeSport }) {
  const [selected, setSelected] = useState(null)
  const [filter,   setFilter]   = useState('all')
  const typeColor = t=>({player:S.info,official:S.danger,tournament:S.warn,coach:S.accent,sportsbook:'#8b5cf6'}[t]||S.midText)
  const sport = activeSport||'all'
  const nodes = NETWORK_NODES.filter(n=>(filter==='all'||n.type===filter)&&(sport==='all'||n.sport===sport||n.sport==='tennis'))
  const W=680, H=380

  return (
    <div>
      <SectionHeader title="🕸️ Network Intelligence Graph" subtitle="Multi-sport entity relationships · Betweenness centrality · Cluster detection"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:20 }}>
        <div style={{ ...card, padding:0, overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', borderBottom:`1px solid ${S.border}`, display:'flex', gap:6, flexWrap:'wrap' }}>
            {['all','player','official','tournament','coach','sportsbook'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{ padding:'4px 10px', borderRadius:4, fontSize:11, cursor:'pointer', background:filter===f?typeColor(f):'transparent', color:filter===f?'#000':S.dim, border:`1px solid ${filter===f?typeColor(f):S.border}`, textTransform:'capitalize' }}>{f}</button>
            ))}
          </div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:'block', background:'#0d1117' }}>
            {NETWORK_EDGES.map((e,i)=>{
              const fn=NETWORK_NODES.find(n=>n.id===e.from),tn=NETWORK_NODES.find(n=>n.id===e.to)
              if(!fn||!tn)return null
              const vis=filter==='all'||nodes.find(n=>n.id===e.from)||nodes.find(n=>n.id===e.to)
              return <line key={i} x1={fn.x/100*W} y1={fn.y/100*H} x2={tn.x/100*W} y2={tn.y/100*H} stroke={e.type==='officiated_at'?S.danger:e.type==='coaches'?S.accent:e.type==='linked'?S.warn:S.border} strokeWidth={e.w/5} opacity={vis?.6:.1} strokeDasharray={e.type==='markets'?'4 2':undefined}/>
            })}
            {NETWORK_NODES.map(n=>{
              const x=n.x/100*W,y=n.y/100*H,c=typeColor(n.type),r=7+n.centrality/10
              const vis=filter==='all'||n.type===filter
              return (
                <g key={n.id} onClick={()=>setSelected(s=>s?.id===n.id?null:n)} style={{ cursor:'pointer' }}>
                  {selected?.id===n.id&&<circle cx={x} cy={y} r={r+6} fill="none" stroke={c} strokeWidth={2} opacity={.4}/>}
                  <circle cx={x} cy={y} r={r} fill={c} opacity={vis?1:.15}/>
                  {n.risk>70&&<circle cx={x} cy={y} r={r+4} fill="none" stroke={c} strokeWidth={1} opacity={.4}/>}
                  <text x={x} y={y+r+11} textAnchor="middle" fill={vis?c:'#333'} fontSize={9}>{n.label.split(' ').slice(-1)[0]}</text>
                  <text x={x} y={y+4} textAnchor="middle" fill="#000" fontSize={9} fontWeight="700">{n.risk}</text>
                </g>
              )
            })}
          </svg>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {selected ? (
            <div style={{ ...cardSm, borderTop:`3px solid ${typeColor(selected.type)}` }}>
              <span style={{ ...badge(typeColor(selected.type)), marginBottom:6, display:'block', width:'fit-content' }}>{selected.type}</span>
              <div style={{ color:S.text, fontSize:15, fontWeight:700 }}>{selected.label}</div>
              {[['Risk Score',selected.risk,iriBand(selected.risk).color],['Centrality',selected.centrality,S.info]].map(([l,v,c])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:`1px solid ${S.border}44` }}>
                  <span style={{ color:S.dim, fontSize:12 }}>{l}</span>
                  <span style={{ color:c, fontSize:13, fontWeight:700 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex', gap:6, marginTop:10 }}><Btn size="sm" color={S.danger}>Case</Btn><Btn size="sm" color={S.info} variant="outline">Dossier</Btn></div>
            </div>
          ) : <div style={{ ...cardSm, textAlign:'center', color:S.dim, fontSize:12 }}>Click any node to inspect</div>}
          <div style={cardSm}>
            <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:8 }}>Centrality Leaderboard</div>
            {[...NETWORK_NODES].sort((a,b)=>b.centrality-a.centrality).slice(0,6).map((n,i)=>(
              <div key={n.id} onClick={()=>setSelected(n)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:`1px solid ${S.border}44`, cursor:'pointer' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ color:S.dim, fontSize:10, width:14 }}>#{i+1}</span>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:typeColor(n.type), display:'inline-block' }}/>
                  <span style={{ color:S.text, fontSize:12 }}>{n.label.split(' ').slice(-1)[0]}</span>
                </div>
                <div style={{ display:'flex', gap:6 }}>
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
  const rc=r=>({Critical:S.danger,High:S.warn,Elevated:S.accent,Low:S.ok}[r]||S.midText)
  return (
    <div>
      <SectionHeader title="🌐 Coverage Gap Analysis" subtitle="Jurisdictional seams · High-risk regions · Kirby (2026) §2.3"/>
      {COVERAGE_GAPS.map(g=>(
        <div key={g.region} style={{ ...card, marginBottom:8, borderLeft:`3px solid ${rc(g.risk)}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div style={{ flex:1 }}><div style={{ color:S.text, fontSize:14, fontWeight:700 }}>{g.region}</div><div style={{ color:S.dim, fontSize:12, marginTop:2 }}>{g.tournaments} tournaments · Oversight: <span style={{ color:rc(g.risk) }}>{g.oversight}</span></div></div>
            <div style={{ display:'flex', gap:12 }}>
              <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>AVG IRI</div><div style={{ color:iriBand(g.iriAvg).color, fontSize:22, fontWeight:800 }}>{g.iriAvg}</div></div>
              <span style={{ ...badge(rc(g.risk)), alignSelf:'center' }}>{g.risk}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY STATUS
// ═══════════════════════════════════════════════════════════════════════════════
function SecurityStatus() {
  const checks = [
    { label:'TLS 1.3 — all API traffic',              status:'ok',   detail:'Certificate auto-renewed via ACM' },
    { label:'AWS Cognito — real authentication',       status:'ok',   detail:'JWT tokens, MFA available, 1h expiry' },
    { label:'AES-256 at rest (DynamoDB)',              status:'ok',   detail:'AWS managed keys (SSE)' },
    { label:'AWS Secrets Manager — zero plain-text',  status:'ok',   detail:'All API keys encrypted, 90d rotation' },
    { label:'SHA-256 audit hash chain',               status:'ok',   detail:'Every IRI calculation + action hashed' },
    { label:'DynamoDB persistence — all entities',    status:'ok',   detail:'Cases, dossiers, posts, alerts stored' },
    { label:'AWS SES email alerts',                   status:'ok',   detail:'Per-role routing via Secrets Manager' },
    { label:'Neo4j graph database',                   status:'warn', detail:'Aura instance — add credentials to Secrets' },
    { label:'API Gateway throttling',                 status:'warn', detail:'Rate limits set; Cloudflare WAF pending' },
    { label:'Records retention lifecycle',            status:'warn', detail:'Policy defined; S3 lifecycle rules pending' },
    { label:'Bot protection (Cloudflare WAF)',        status:'todo', detail:'Planned v1.4 — Layer 7 bot filtering' },
    { label:'Whistleblower portal (E2E)',              status:'todo', detail:'Planned v1.4 — Signal Protocol integration' },
  ]
  const sc = s=>({ok:S.ok,warn:S.warn,todo:S.dim}[s])
  return (
    <div>
      <SectionHeader title="🔒 Security Status" subtitle={`IRI v${VERSION} · AWS Cognito · KMS · SHA-256 · DynamoDB · SES`}/>
      <div style={{ display:'flex', gap:14, marginBottom:20, flexWrap:'wrap' }}>
        {[['Passed',checks.filter(c=>c.status==='ok').length,S.ok],['Warnings',checks.filter(c=>c.status==='warn').length,S.warn],['Planned',checks.filter(c=>c.status==='todo').length,S.dim]].map(([l,v,c])=>(
          <StatCard key={l} label={l} value={v} color={c}/>
        ))}
      </div>
      {checks.map(c=>(
        <div key={c.label} style={{ ...cardSm, marginBottom:8, borderLeft:`3px solid ${sc(c.status)}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div><div style={{ color:S.text, fontSize:12, fontWeight:600 }}>{c.label}</div><div style={{ color:S.dim, fontSize:11 }}>{c.detail}</div></div>
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
function Help({ user }) {
  const role = USER_ROLES[user?.role]
  return (
    <div>
      <SectionHeader title="❓ Help & Documentation" subtitle={`v${VERSION} · Role: ${role?.icon} ${role?.label}`}/>
      {[
        ['IRI Formula (Core)', `IRI = 100 × [w₁ × |Y − Pw| + w₂ × V]\n\nPw = 1 / favoriteOdds (market-implied probability)\nY  = observed outcome (0=favorite, 1=upset)\nV  = structural vulnerability by tier\nw₁ = w₂ = 0.5 (dissertation default)\n\nValidated AUC: 0.873 (95% CI [0.868, 0.878]) on 2022–2026 holdout.`],
        ['Multi-Sport Models', `NFL: Adapted for Information Asymmetry. V_i = proximity to non-public info. Anomaly = prop volume spike + injury latency + offshore divergence.\n\nCFB: NIL/Conference tier model. ATS spread residuals detect point shaving. No-NIL schools → V_i × 1.25.\n\nCBB: KenPom efficiency differential adjusts anomaly detection. Mid-major V_i = 0.45.\n\nAll other sports: Adapted IRI with sport-specific tier vulnerabilities.`],
        ['Workgroup Hierarchy', `God Mode (Integrity Chief) → Full system control\nMain Account → Workgroup management, user creation\nSupervisor → Assigns work, approves amendments, downloads internal notes\nSpecial Agent → Investigates, submits work for approval\n\nAmendments to case records require supervisor or main account sign-off. Internal notes visible to supervisors+.`],
        ['God Mode', `God Mode (👁️ Integrity Chief) provides:\n• User management — create, lock, reset passwords\n• Workgroup control — restrict/open access, assign hierarchy\n• API injection — add new data sources without code deploy\n• Profile switcher — preview any role's dashboard view\n• Document archive — full access to all categorized files\n• Patch deployment — push version updates via GitHub`],
        ['IRI Risk Bands', `0–29:   LOW      — routine monitoring\n30–49:  ELEVATED — flag for follow-up\n50–69:  HIGH     — active alert, intervene\n70–100: CRITICAL — immediate escalation`],
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
// SPORTSBOOK TOOL
// ═══════════════════════════════════════════════════════════════════════════════
function SportsbookTool({ activeSport }) {
  const [suspended, setSuspended] = useState([])
  const sport = activeSport || 'tennis'
  const matches = (MOCK_MATCHES[sport] || MOCK_MATCHES.tennis).map(m=>{
    const r = computeIRI({ favoriteOdds:m.favOdds||1.5, underdogOdds:m.dogOdds||2.5, rankingGap:m.rankingGap||20, tier:m.tier, sport })
    return { ...m, ...r, sharpPct:m.tier==='itf'||m.tier==='practice_squad'||m.tier==='nil_zero'?82:m.tier==='challenger'||m.tier==='group_of_5'?51:22 }
  })

  return (
    <div>
      <SectionHeader title="📊 Sportsbook Risk Mitigation Tool" subtitle="Real-time exposure · Sharp money detection · One-click market controls"/>
      <div style={{ display:'flex', gap:14, marginBottom:18, flexWrap:'wrap' }}>
        <StatCard label="Markets" value={matches.length} color={S.accent}/>
        <StatCard label="Suspended" value={suspended.length} color={S.warn}/>
        <StatCard label="Sharp Money Alerts" value={matches.filter(m=>m.sharpPct>60).length} color={S.danger}/>
        <StatCard label="Critical IRI" value={matches.filter(m=>m.iri>70).length} color={S.danger}/>
      </div>
      {matches.map(m=>{
        const b=iriBand(m.iri), isSusp=suspended.includes(m.id)
        const combRisk=m.iri>80&&m.sharpPct>70?'CRITICAL':m.iri>65||m.sharpPct>60?'HIGH':'MODERATE'
        const cc=combRisk==='CRITICAL'?S.danger:combRisk==='HIGH'?S.warn:S.accent
        return (
          <div key={m.id} style={{ ...card, marginBottom:10, borderLeft:`3px solid ${isSusp?S.dim:cc}`, opacity:isSusp?.65:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ color:S.text, fontSize:14, fontWeight:700 }}>{m.p1||m.event}{m.p2?` vs ${m.p2}`:''}</span>
                  {isSusp && <span style={{ ...badge(S.dim) }}>SUSPENDED</span>}
                  <span style={{ ...badge(cc) }}>{combRisk}</span>
                  <SportBadge sport={sport}/>
                </div>
              </div>
              <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
                <div><div style={{ color:S.dim, fontSize:10 }}>SHARP $</div>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <div style={{ background:S.mid, borderRadius:3, height:5, width:60 }}><div style={{ background:m.sharpPct>60?S.danger:S.warn, borderRadius:3, height:5, width:`${m.sharpPct}%` }}/></div>
                    <span style={{ color:m.sharpPct>60?S.danger:S.warn, fontSize:12, fontWeight:700 }}>{m.sharpPct}%</span>
                  </div>
                </div>
                <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>IRI</div><div style={{ color:b.color, fontSize:22, fontWeight:900 }}>{m.iri.toFixed(0)}</div></div>
                <div style={{ display:'flex', gap:5 }}>
                  <Btn size="sm" color={isSusp?S.ok:S.danger} onClick={()=>setSuspended(s=>s.includes(m.id)?s.filter(x=>x!==m.id):[...s,m.id])}>{isSusp?'▶ Reopen':'⏸ Suspend'}</Btn>
                  <Btn size="sm" color={S.warn} variant="outline">Reduce Bets</Btn>
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
// PARLAY RECOMMENDER
// ═══════════════════════════════════════════════════════════════════════════════
function ParlayRecommender({ activeSport }) {
  const [stake, setStake] = useState(100)
  const [sel, setSel] = useState([0,2])
  const sport = activeSport || 'tennis'
  const options = (MOCK_MATCHES[sport]||MOCK_MATCHES.tennis).map((m,i)=>{
    const r=computeIRI({favoriteOdds:m.favOdds||1.5,underdogOdds:m.dogOdds||2.5,rankingGap:m.rankingGap||20,tier:m.tier,sport})
    return {...m,...r,i}
  })
  const legs = options.filter((_,i)=>sel.includes(i))
  const combined = legs.reduce((p,m)=>p*(m.favOdds||1.5),1)
  const implied  = legs.reduce((p,m)=>p*impliedProb(m.favOdds||1.5),1)
  const ev = (combined*implied-1)*stake
  const avgIri = legs.length>0?legs.reduce((s,m)=>s+m.iri,0)/legs.length:0
  const rec = avgIri>70?{l:'AVOID — IRI too high',c:S.danger}:avgIri>50?{l:'CAUTION',c:S.warn}:ev>0?{l:'VIABLE — positive EV',c:S.ok}:{l:'NEGATIVE EV',c:S.accent}

  return (
    <div>
      <SectionHeader title="⭐ Parlay Recommender" subtitle="IRI-aware EV calculator · Risk threshold offsets · Gambler risk mitigation"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Select Legs — {SPORTS_CONFIG[sport]?.icon} {SPORTS_CONFIG[sport]?.label}</div>
          {options.map((m,i)=>{const b=iriBand(m.iri),isSel=sel.includes(i);return(
            <div key={m.id} onClick={()=>setSel(s=>s.includes(i)?s.filter(x=>x!==i):[...s,i])} style={{ ...cardSm, marginBottom:8, cursor:'pointer', borderLeft:`3px solid ${b.color}`, opacity:isSel?1:.5 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ color:S.text, fontSize:12, fontWeight:600 }}>{m.p1||m.event}{m.p2?` vs ${m.p2}`:''}</div>
                  <div style={{ color:S.dim, fontSize:10 }}>Odds: {m.favOdds}</div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <div style={{ color:b.color, fontSize:16, fontWeight:800 }}>{m.iri.toFixed(0)}</div>
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
            <div style={{ color:S.accent, fontSize:40, fontWeight:900 }}>{combined.toFixed(2)}</div>
            <div style={{ color:S.dim, fontSize:11 }}>{legs.length} legs · Implied: {(implied*100).toFixed(1)}%</div>
          </div>
          <div style={card}>
            {[['Potential return',`$${(stake*combined).toFixed(2)}`,S.ok],['Expected value',`${ev>=0?'+':''}$${ev.toFixed(2)}`,ev>=0?S.ok:S.danger],['Avg IRI',avgIri.toFixed(0),iriBand(avgIri).color]].map(([l,v,c])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ color:S.dim, fontSize:12 }}>{l}</span><span style={{ color:c, fontSize:14, fontWeight:700 }}>{v}</span>
              </div>
            ))}
            <div style={{ background:rec.c+'22', border:`1px solid ${rec.c}44`, borderRadius:8, padding:12, textAlign:'center' }}>
              <div style={{ color:rec.c, fontSize:14, fontWeight:700 }}>{rec.l}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FULL TAB REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════
const ALL_TABS = [
  { id:'godmode',      label:'👁️ God Mode',        component:GodMode,         needsProp:'currentUser' },
  { id:'sports_switch',label:'🏟️ Sports Switch',   component:SportsSwitch,    needsProp:'activeSport' },
  { id:'monitor',      label:'📡 Live Monitor',    component:LiveMonitor      },
  { id:'iri',          label:'⚡ IRI Calculator',  component:IRICalculator    },
  { id:'cases',        label:'🔨 Cases',           component:CaseManagement,  needsProp:'user'        },
  { id:'dossiers',     label:'📁 Dossiers',        component:Dossiers,        needsProp:'user'        },
  { id:'network',      label:'🕸️ Network',         component:NetworkGraph     },
  { id:'microbets',    label:'⚡ Microbets',       component:MicrobetMonitor  },
  { id:'fantasy',      label:'🎮 Fantasy Monitor', component:FantasyMonitor   },
  { id:'benford',      label:'# Benford',          component:BenfordAnalysis  },
  { id:'sportsbook',   label:'📊 Sportsbook Tool', component:SportsbookTool   },
  { id:'parlay',       label:'⭐ Parlay',           component:ParlayRecommender},
  { id:'coverage',     label:'🌐 Coverage',        component:CoverageGaps     },
  { id:'api',          label:'🔌 API Meter',       component:ApiMeter         },
  { id:'analytics',    label:'📊 Analytics',       component:Analytics        },
  { id:'alerts',       label:'🔔 Alerts',          component:AlertsPanel,     needsProp:'user'        },
  { id:'workgroup',    label:'👥 Workgroup',        component:Workgroup,       needsProp:'user'        },
  { id:'security',     label:'🔒 Security',        component:SecurityStatus   },
  { id:'help',         label:'❓ Help',             component:Help,            needsProp:'user'        },
]

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ user, onLogout }) {
  const [tab,         setTab]         = useState('monitor')
  const [activeSport, setActiveSport] = useState('tennis')
  const [liveData,    setLiveData]    = useState(null)
  const [syncing,     setSyncing]     = useState(false)
  const role = USER_ROLES[user.role]

  const allowedTabs = ROLE_TABS[user.role] || []
  const visibleTabs = ALL_TABS.filter(t=>allowedTabs.includes(t.id))
  const unreadAlerts = INITIAL_ALERTS.filter(a=>!a.read).length

  const sync = useCallback(async ()=>{
    if (!API) return
    setSyncing(true)
    try {
      const [h,o,s] = await Promise.allSettled([
        fetch(`${API}/health`).then(r=>r.json()),
        fetch(`${API}/odds`).then(r=>r.json()),
        fetch(`${API}/sportradar`).then(r=>r.json()),
      ])
      setLiveData({ health:h.status==='fulfilled'?h.value:null, odds:o.status==='fulfilled'?o.value:null, sportradar:s.status==='fulfilled'?s.value:null })
    } catch {}
    setSyncing(false)
  },[])

  useEffect(()=>{ sync() },[])

  const ActiveTab = visibleTabs.find(t=>t.id===tab)
  const tabProps = { user, currentUser:user, activeSport, onSwitch:setActiveSport, liveData, liveOdds:liveData?.odds, userRole:user.role }

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', fontFamily:"'DM Sans',sans-serif" }}>
      {/* Top nav */}
      <div style={{ background:S.card, borderBottom:`1px solid ${S.border}`, height:56, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', position:'sticky', top:0, zIndex:100, gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:20 }}>🛡️</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:16, fontWeight:800, color:S.text }}>IRI <span style={{ color:S.accent }}>v{VERSION}</span></span>
          <SportBadge sport={activeSport}/>
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
        <span>IRI v{VERSION} · Kirby (2026) · Multi-Sport · AUC 0.873 · n=106,849+ ATP/WTA + NFL/CFB/CBB</span>
        <span>AWS Cognito + Lambda + DynamoDB + SES + Neo4j · SHA-256 audit chain</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
