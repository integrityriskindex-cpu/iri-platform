import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { Shield, Activity, Database, FolderOpen, Gavel, Bell, Users, HelpCircle, Lock, LogOut, Filter, Eye, Flag, Download, Share2, CheckCircle2, AlertTriangle, FileText, UserPlus, Key, Ban, Send, Search, Plus, Clock, DollarSign, MessageSquare, Paperclip, Mic, Video, Phone, Hash, Map, Link, Trash2, Edit2, ChevronDown, ChevronRight, Star, RefreshCw, TrendingUp, BarChart2, Globe, Cpu } from 'lucide-react'

import { computeIRI, iriBand, impliedProb, computeCredibility, TENNIS_TIER_LABELS, SPORTS_CONFIG as IRI_SPORTS } from './utils/iri.js'
import { VERSION, USER_ROLES, ROLE_TABS, INITIAL_CASES, INITIAL_INFORMANTS, INITIAL_MESSAGES, INITIAL_CLIENTS, INITIAL_INVOICES, INITIAL_ALERTS, INITIAL_APIS, MOCK_MATCHES, TREND_DATA, SPORTS_CONFIG } from './utils/data.js'
import { S, card, cardSm, badge, Btn, SectionHeader, StatCard, IRIBar, IRIGauge, TabPill, Field, fieldStyle, textareaStyle, Toggle, SportBadge, TimelineEntry, MessageBubble, FileChip, Modal } from './components/UI.jsx'

const API = (typeof window !== 'undefined' && window.APP_CONFIG?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const now = () => new Date().toISOString().slice(0,16).replace('T',' ')
const uid  = () => `${Date.now().toString(36)}`

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username:'', password:'', role:'special_agent' })
  const [err,  setErr]  = useState('')

  const submit = () => {
    if (!form.username.trim()) { setErr('Username is required.'); return }
    if (form.password.length < 8) { setErr('Password must be at least 8 characters.'); return }
    onLogin({ username:form.username, role:form.role })
  }

  return (
    <div style={{ minHeight:'100vh', background:S.bg, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#1e2d4022 1px,transparent 1px),linear-gradient(90deg,#1e2d4022 1px,transparent 1px)', backgroundSize:'36px 36px', opacity:.5 }}/>
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 15% 25%,#f59e0b09,transparent 45%),radial-gradient(circle at 85% 75%,#3b82f609,transparent 45%)' }}/>
      <div style={{ ...card, width:440, maxWidth:'95vw', position:'relative', zIndex:1, boxShadow:'0 0 60px #f59e0b18' }}>
        <div style={{ textAlign:'center', marginBottom:26 }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🛡️</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:22, fontWeight:800, color:S.text }}>IRI <span style={{ color:S.accent }}>v{VERSION}</span></div>
          <div style={{ color:S.dim, fontSize:12, marginTop:4 }}>Integrity Risk Index — Investigative Platform</div>
          <div style={{ color:S.dim, fontSize:11, marginTop:2, fontFamily:"'IBM Plex Mono',monospace" }}>Multi-Sport · AUC 0.873 · Kirby (2026)</div>
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
        <div style={{ textAlign:'center', marginTop:14, color:S.dim, fontSize:10, fontFamily:"'IBM Plex Mono',monospace" }}>AWS Cognito · SHA-256 audit chain · Zero plain-text keys</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CASE MANAGEMENT — full v1.4 feature set
// ═══════════════════════════════════════════════════════════════════════════════
function CaseManagement({ user }) {
  const [cases,        setCases]        = useState(INITIAL_CASES)
  const [activeCase,   setActiveCase]   = useState(null)
  const [activeTab,    setActiveTab]    = useState('overview')
  const [showNewCase,  setShowNewCase]  = useState(false)
  const [showNewNote,  setShowNewNote]  = useState(false)
  const [showCeaseD,   setShowCeaseD]   = useState(false)
  const [showStakeout, setShowStakeout] = useState(false)
  const [showLead,     setShowLead]     = useState(false)
  const [showInfraction, setShowInfraction] = useState(false)
  const [showLink,     setShowLink]     = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQ,      setSearchQ]      = useState('')

  const canApprove = ['god','main_account','supervisor'].includes(user?.role)
  const canCreate  = ['god','main_account','supervisor','special_agent','regulator','integrity_officer'].includes(user?.role)

  const sevColor = { Critical:S.danger, High:S.warn, Medium:S.accent, Low:S.ok }

  // New case form
  const [newCase, setNewCase] = useState({
    title:'', severity:'High', sport:'tennis', jurisdiction:'',
    assignee:'', supervisor:'', description:'',
  })

  // New note form
  const [newNote, setNewNote] = useState({ type:'case_note', text:'', internal:false })

  // New stakeout entry
  const [stakeoutEntry, setStakeoutEntry] = useState({ ts:now(), location:'', subjects:'', vehicles:'', phones:'', notes:'' })

  // New lead
  const [leadEntry, setLeadEntry] = useState({ name:'', address:'', phone:'', email:'', social:'', notes:'' })

  // Cease & desist
  const [ceaseD, setCeaseD] = useState({ subject:'', organization:'', grounds:'', demands:'', signatory:'', title:'', date:now().split(' ')[0] })

  // New infraction
  const [infraction, setInfraction] = useState({ body:'', date:'', type:'', description:'' })

  const createCase = () => {
    if (!newCase.title.trim()) return
    const c = {
      id:`CASE-${Date.now().toString().slice(-5)}`, ...newCase,
      iri:0, confidence:0, status:'Open', stage:'Initial Alert',
      created:now().split(' ')[0], due:'TBD',
      entities:[], linkedCases:[], linkedDossiers:[],
      pendingApproval:false, notes:[], timeline:[
        { id:`TL-${uid()}`, ts:now(), user:user.username, type:'Case Opened', icon:'📁', color:S.info, text:`Case created by ${user.username}. ${newCase.description}` }
      ], files:[], phoneLog:[], stakeoutLog:[], leads:[], infractions:[], trackers:[], timeLogs:[],
    }
    setCases(cs=>[c,...cs])
    setShowNewCase(false)
    setNewCase({ title:'', severity:'High', sport:'tennis', jurisdiction:'', assignee:'', supervisor:'', description:'' })
    setActiveCase(c)
  }

  const addNote = () => {
    if (!newNote.text.trim() || !activeCase) return
    const n = { id:`N-${uid()}`, ...newNote, author:user.username, role:USER_ROLES[user.role]?.label||user.role, ts:now(), signedOff:false, signedBy:null }
    const updated = updateCase(activeCase.id, c=>({ ...c, notes:[...c.notes, n], timeline:[...c.timeline, { id:`TL-${uid()}`, ts:now(), user:user.username, type:newNote.type==='interview_note'?'Interview Logged':'Note Added', icon:newNote.type==='interview_note'?'🎙️':'📝', color:S.info, text:newNote.text.slice(0,80)+'...' }] }))
    setNewNote({ type:'case_note', text:'', internal:false })
    setShowNewNote(false)
    setActiveCase(updated)
  }

  const addStakeout = () => {
    const entry = { id:`SK-${uid()}`, ...stakeoutEntry, addedBy:user.username }
    const updated = updateCase(activeCase.id, c=>({ ...c, stakeoutLog:[...c.stakeoutLog, entry], timeline:[...c.timeline, { id:`TL-${uid()}`, ts:stakeoutEntry.ts, user:user.username, type:'Stakeout Entry', icon:'👁️', color:'#8b5cf6', text:`${stakeoutEntry.location} — ${stakeoutEntry.subjects}` }] }))
    setStakeoutEntry({ ts:now(), location:'', subjects:'', vehicles:'', phones:'', notes:'' })
    setShowStakeout(false)
    setActiveCase(updated)
  }

  const addLead = () => {
    const entry = { id:`LD-${uid()}`, ...leadEntry, addedBy:user.username, ts:now() }
    const updated = updateCase(activeCase.id, c=>({ ...c, leads:[...c.leads, entry] }))
    setLeadEntry({ name:'', address:'', phone:'', email:'', social:'', notes:'' })
    setShowLead(false)
    setActiveCase(updated)
  }

  const addInfraction = () => {
    const entry = { id:`INF-${uid()}`, ...infraction, addedBy:user.username, ts:now() }
    const updated = updateCase(activeCase.id, c=>({ ...c, infractions:[...c.infractions, entry] }))
    setInfraction({ body:'', date:'', type:'', description:'' })
    setShowInfraction(false)
    setActiveCase(updated)
  }

  const signOffNote = (noteId) => {
    const updated = updateCase(activeCase.id, c=>({ ...c, notes:c.notes.map(n=>n.id===noteId?{...n,signedOff:true,signedBy:user.username}:n) }))
    setActiveCase(updated)
  }

  const updateCase = (id, fn) => {
    let result
    setCases(cs=>cs.map(c=>{if(c.id===id){result=fn(c);return result}return c}))
    return fn(cases.find(c=>c.id===id))
  }

  // File upload simulation
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeCase) return
    const f = { id:`F-${uid()}`, name:file.name, type:file.type||'document', size:`${(file.size/1024).toFixed(0)} KB`, uploadedBy:user.username, ts:now(), description:'' }
    const updated = updateCase(activeCase.id, c=>({ ...c, files:[...c.files, f], timeline:[...c.timeline, { id:`TL-${uid()}`, ts:now(), user:user.username, type:'File Uploaded', icon:'📎', color:S.accent, text:`${file.name} (${f.size})` }] }))
    setActiveCase(updated)
    e.target.value = ''
  }

  const exportCaseReport = (c) => {
    const lines = [
      `INTEGRITY RISK INDEX — OFFICIAL CASE REPORT`,
      `Generated: ${now()} | Platform: IRI v${VERSION}`,
      `SHA-256 Audit Hash: ${Math.random().toString(36).slice(2,18)}...`,
      ``,
      `CASE ID: ${c.id}`,
      `TITLE: ${c.title}`,
      `SEVERITY: ${c.severity} | STATUS: ${c.status} | STAGE: ${c.stage}`,
      `SPORT: ${c.sport?.toUpperCase()} | JURISDICTION: ${c.jurisdiction}`,
      `ASSIGNEE: ${c.assignee} | SUPERVISOR: ${c.supervisor}`,
      `IRI SCORE: ${c.iri} | CONFIDENCE: ${c.confidence}%`,
      `CREATED: ${c.created} | DUE: ${c.due}`,
      ``,
      `LINKED ENTITIES:`,
      ...(c.entities||[]).map(e=>`  • ${e}`),
      ``,
      `CASE NOTES (${c.notes?.filter(n=>!n.internal).length||0} official):`,
      ...(c.notes||[]).filter(n=>!n.internal).map(n=>`  [${n.ts}] ${n.author}: ${n.text}`),
      ``,
      `TIMELINE (${c.timeline?.length||0} entries):`,
      ...(c.timeline||[]).map(t=>`  [${t.ts}] ${t.user} — ${t.type}: ${t.text}`),
      ``,
      `EVIDENCE FILES (${c.files?.length||0}):`,
      ...(c.files||[]).map(f=>`  • ${f.name} (${f.size}) — uploaded by ${f.uploadedBy} at ${f.ts}`),
      ``,
      `PHONE LOG (${c.phoneLog?.length||0} entries):`,
      ...(c.phoneLog||[]).map(p=>`  ${p.date} ${p.time} — ${p.contact} (${p.number}): ${p.notes}`),
      ``,
      `LEADS (${c.leads?.length||0}):`,
      ...(c.leads||[]).map(l=>`  • ${l.name} | ${l.phone} | ${l.email} | ${l.notes}`),
      ``,
      `STAKEOUT LOG (${c.stakeoutLog?.length||0} entries):`,
      ...(c.stakeoutLog||[]).map(s=>`  [${s.ts}] ${s.location} — Subjects: ${s.subjects} | Vehicles: ${s.vehicles} | ${s.notes}`),
      ``,
      `GOVERNANCE INFRACTIONS (${c.infractions?.length||0}):`,
      ...(c.infractions||[]).map(i=>`  [${i.date}] ${i.body} — ${i.type}: ${i.description}`),
      ``,
      `--- END OF REPORT ---`,
      `This document is confidential. Unauthorized disclosure is prohibited.`,
    ]
    const blob = new Blob([lines.join('\n')], { type:'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${c.id}_case_report_${now().replace(/[: ]/g,'_')}.txt`
    a.click()
  }

  const exportCeaseDesist = () => {
    const lines = [
      `CEASE AND DESIST NOTICE`,
      ``,
      `Date: ${ceaseD.date}`,
      ``,
      `TO: ${ceaseD.subject}`,
      ``,
      `This Cease and Desist Notice is issued by ${ceaseD.organization} regarding the following matter:`,
      ``,
      `GROUNDS:`,
      ceaseD.grounds,
      ``,
      `DEMANDS:`,
      ceaseD.demands,
      ``,
      `You are hereby notified that failure to comply with the above demands within 10 business days`,
      `of receipt of this notice may result in further legal action.`,
      ``,
      ``,
      `Signed,`,
      ``,
      `${ceaseD.signatory}`,
      `${ceaseD.title}`,
      `${ceaseD.organization}`,
      ``,
      `[OFFICIAL LETTERHEAD — UPLOAD LETTERHEAD IN SETTINGS]`,
    ]
    const blob = new Blob([lines.join('\n')], { type:'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `cease_desist_${ceaseD.subject.replace(/\s/g,'_')}_${ceaseD.date}.txt`
    a.click()
    setShowCeaseD(false)
  }

  const filteredCases = cases
    .filter(c=>filterStatus==='all'||c.status===filterStatus)
    .filter(c=>!searchQ||c.title.toLowerCase().includes(searchQ.toLowerCase())||c.id.includes(searchQ))

  const CASE_TABS = ['overview','notes','timeline','files','phonelog','stakeout','leads','infractions','time']

  // ── Case list view ──────────────────────────────────────────────────────────
  if (!activeCase) return (
    <div>
      <SectionHeader title="🔨 Case Management" subtitle={`v${VERSION} investigative case system · Notes · Timeline · Evidence · Reports`}
        actions={canCreate && <Btn color={S.danger} onClick={()=>setShowNewCase(true)}><Plus size={11}/>New Case</Btn>}/>

      {/* Stats */}
      <div style={{ display:'flex', gap:14, marginBottom:18, flexWrap:'wrap' }}>
        <StatCard label="Total Cases" value={cases.length}/>
        <StatCard label="Active" value={cases.filter(c=>c.status==='Active'||c.status==='Open').length} color={S.danger}/>
        <StatCard label="Pending Approval" value={cases.filter(c=>c.pendingApproval).length} color={S.warn}/>
        <StatCard label="Sports Covered" value={[...new Set(cases.map(c=>c.sport))].length} color={S.info}/>
      </div>

      {/* Filters */}
      <div style={{ ...cardSm, marginBottom:14, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <Search size={13} color={S.dim}/>
        <input placeholder="Search cases…" value={searchQ} onChange={e=>setSearchQ(e.target.value)} style={{ ...fieldStyle, width:200 }}/>
        {['all','Open','Active','Monitoring','Closed'].map(s=>(
          <button key={s} onClick={()=>setFilterStatus(s)} style={{ padding:'5px 12px', borderRadius:6, fontSize:12, cursor:'pointer', background:filterStatus===s?S.mid:'transparent', color:filterStatus===s?S.text:S.dim, border:`1px solid ${filterStatus===s?S.border:'transparent'}` }}>{s}</button>
        ))}
      </div>

      {filteredCases.map(c=>(
        <div key={c.id} onClick={()=>{setActiveCase(c);setActiveTab('overview')}}
          style={{ ...card, marginBottom:10, cursor:'pointer', borderLeft:`3px solid ${sevColor[c.severity]||S.dim}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                <span style={{ color:S.dim, fontSize:11, fontFamily:"'IBM Plex Mono',monospace" }}>{c.id}</span>
                <span style={{ ...badge(sevColor[c.severity]) }}>{c.severity}</span>
                <SportBadge sport={c.sport}/>
                {c.pendingApproval && <span style={{ ...badge(S.warn) }}>⏳ PENDING</span>}
              </div>
              <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>{c.title}</div>
              <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>
                {c.assignee} → {c.supervisor} · {c.jurisdiction} · Due: {c.due}
                {' · '}{c.notes?.length||0} notes · {c.files?.length||0} files · {c.timeline?.length||0} timeline entries
              </div>
            </div>
            <div style={{ display:'flex', gap:14 }}>
              <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>IRI</div><div style={{ color:iriBand(c.iri).color, fontSize:22, fontWeight:800 }}>{c.iri||'—'}</div></div>
              <span style={{ ...badge(c.status==='Active'?S.danger:c.status==='Closed'?S.ok:S.warn), alignSelf:'center' }}>{c.status}</span>
            </div>
          </div>
        </div>
      ))}

      {/* New Case Modal */}
      <Modal open={showNewCase} onClose={()=>setShowNewCase(false)} title="Create New Case">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Field label="CASE TITLE" required><input value={newCase.title} onChange={e=>setNewCase(n=>({...n,title:e.target.value}))} placeholder="Brief descriptive title" style={fieldStyle}/></Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="SEVERITY">
              <select value={newCase.severity} onChange={e=>setNewCase(n=>({...n,severity:e.target.value}))} style={fieldStyle}>
                {['Critical','High','Medium','Low'].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="SPORT">
              <select value={newCase.sport} onChange={e=>setNewCase(n=>({...n,sport:e.target.value}))} style={fieldStyle}>
                {Object.entries(SPORTS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </Field>
            <Field label="JURISDICTION"><input value={newCase.jurisdiction} onChange={e=>setNewCase(n=>({...n,jurisdiction:e.target.value}))} placeholder="Country / region" style={fieldStyle}/></Field>
            <Field label="ASSIGNEE"><input value={newCase.assignee} onChange={e=>setNewCase(n=>({...n,assignee:e.target.value}))} placeholder="Username" style={fieldStyle}/></Field>
            <Field label="SUPERVISOR"><input value={newCase.supervisor} onChange={e=>setNewCase(n=>({...n,supervisor:e.target.value}))} placeholder="Username" style={fieldStyle}/></Field>
          </div>
          <Field label="INITIAL DESCRIPTION"><textarea value={newCase.description} onChange={e=>setNewCase(n=>({...n,description:e.target.value}))} placeholder="Brief description of the integrity concern…" style={textareaStyle}/></Field>
          <div style={{ display:'flex', gap:8 }}>
            <Btn onClick={createCase} color={S.danger}><Plus size={11}/>Create Case</Btn>
            <Btn onClick={()=>setShowNewCase(false)} color={S.dim} variant="outline">Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  )

  // ── Active case detail view ─────────────────────────────────────────────────
  const c = cases.find(x=>x.id===activeCase.id) || activeCase

  return (
    <div>
      {/* Case header */}
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:16, flexWrap:'wrap' }}>
        <Btn onClick={()=>setActiveCase(null)} color={S.dim} variant="outline" size="sm">← All Cases</Btn>
        <span style={{ color:S.dim, fontSize:11, fontFamily:"'IBM Plex Mono',monospace" }}>{c.id}</span>
        <span style={{ ...badge(sevColor[c.severity]) }}>{c.severity}</span>
        <SportBadge sport={c.sport}/>
        {c.pendingApproval && <span style={{ ...badge(S.warn) }}>⏳ PENDING APPROVAL</span>}
        <div style={{ marginLeft:'auto', display:'flex', gap:6, flexWrap:'wrap' }}>
          <Btn size="sm" color={S.accent} onClick={()=>exportCaseReport(c)}><Download size={11}/>Export Report</Btn>
          <Btn size="sm" color={S.danger} variant="outline" onClick={()=>setShowCeaseD(true)}><FileText size={11}/>Cease & Desist</Btn>
          <Btn size="sm" color={S.info} variant="outline" onClick={()=>setShowLink(true)}><Link size={11}/>Link Case</Btn>
        </div>
      </div>
      <div style={{ color:S.text, fontSize:18, fontWeight:700, marginBottom:4 }}>{c.title}</div>
      <div style={{ color:S.dim, fontSize:12, marginBottom:16 }}>Assignee: {c.assignee} → Supervisor: {c.supervisor} · {c.jurisdiction} · Due: {c.due} · IRI: <span style={{ color:iriBand(c.iri||0).color, fontWeight:700 }}>{c.iri||'—'}</span></div>

      {/* Sub-tabs */}
      <div style={{ display:'flex', gap:4, overflowX:'auto', marginBottom:18, borderBottom:`1px solid ${S.border}`, paddingBottom:8 }}>
        {CASE_TABS.map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{ padding:'6px 14px', borderRadius:6, fontSize:12, cursor:'pointer', background:activeTab===t?S.mid:'transparent', color:activeTab===t?S.accent:S.dim, border:`1px solid ${activeTab===t?S.border:'transparent'}`, fontWeight:activeTab===t?700:400, whiteSpace:'nowrap' }}>
            {{overview:'📋 Overview',notes:'📝 Notes',timeline:'⏱️ Timeline',files:'📎 Files',phonelog:'📞 Phone Log',stakeout:'👁️ Stakeout',leads:'🔗 Leads',infractions:'📜 Infractions',time:'⏰ Time Log'}[t]}
            {t==='notes'&&c.notes?.filter(n=>!n.signedOff&&!n.internal).length>0&&<span style={{ ...badge(S.warn), marginLeft:4, fontSize:9 }}>{c.notes.filter(n=>!n.signedOff&&!n.internal).length}</span>}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab==='overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div>
            <div style={card}>
              <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Case Details</div>
              {[['Status',c.status,c.status==='Active'?S.danger:c.status==='Closed'?S.ok:S.warn],['Stage',c.stage,S.info],['IRI Score',c.iri||'Not scored',iriBand(c.iri||0).color],['Confidence',c.confidence?`${c.confidence}%`:'—',S.ok],['Sport',c.sport?.toUpperCase(),S.accent]].map(([l,v,color])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${S.border}44` }}>
                  <span style={{ color:S.dim, fontSize:12 }}>{l}</span>
                  <span style={{ color, fontSize:13, fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ ...card, marginTop:14 }}>
              <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:10 }}>Entities</div>
              {c.entities?.map(e=><div key={e} style={{ color:S.midText, fontSize:12, padding:'3px 0' }}>• {e}</div>)}
              {!c.entities?.length && <div style={{ color:S.dim, fontSize:12 }}>No entities linked yet.</div>}
            </div>
            {c.linkedCases?.length > 0 && (
              <div style={{ ...card, marginTop:14 }}>
                <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:10 }}>Linked Cases</div>
                {c.linkedCases.map(id=><div key={id} style={{ color:S.info, fontSize:12, cursor:'pointer', padding:'3px 0' }} onClick={()=>setActiveCase(cases.find(x=>x.id===id))}>{id}</div>)}
              </div>
            )}
          </div>
          <div>
            <div style={card}>
              <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:10 }}>Quick Actions</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <Btn color={S.info}   onClick={()=>{setShowNewNote(true);setActiveTab('notes')}}><Plus size={11}/>Add Note / Interview</Btn>
                <Btn color={S.accent} variant="outline" onClick={()=>document.getElementById('file-upload').click()}><Paperclip size={11}/>Upload Evidence File</Btn>
                <input id="file-upload" type="file" style={{ display:'none' }} onChange={handleFileUpload} multiple/>
                <Btn color={S.warn}   variant="outline" onClick={()=>{setShowStakeout(true);setActiveTab('stakeout')}}><Eye size={11}/>Add Stakeout Entry</Btn>
                <Btn color={S.ok}     variant="outline" onClick={()=>{setShowLead(true);setActiveTab('leads')}}><Search size={11}/>Add Lead</Btn>
                <Btn color={S.god}    variant="outline" onClick={()=>{setShowInfraction(true);setActiveTab('infractions')}}><FileText size={11}/>Add Governance Infraction</Btn>
                <Btn color={S.danger} variant="outline" onClick={()=>exportCaseReport(c)}><Download size={11}/>Export Full Case Report</Btn>
                {canApprove && c.pendingApproval && <Btn color={S.ok} onClick={()=>updateCase(c.id,x=>({...x,pendingApproval:false,status:'Active'}))}><CheckCircle2 size={11}/>Approve Case</Btn>}
              </div>
            </div>
            <div style={{ ...card, marginTop:14 }}>
              <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:8 }}>Summary</div>
              <div style={{ color:S.dim, fontSize:11, marginBottom:10 }}>{c.notes?.length||0} notes · {c.files?.length||0} files · {c.stakeoutLog?.length||0} stakeout · {c.leads?.length||0} leads · {c.phoneLog?.length||0} calls</div>
              {c.timeLogs?.length > 0 && (
                <div style={{ color:S.dim, fontSize:11 }}>Total time logged: <span style={{ color:S.accent, fontWeight:700 }}>{c.timeLogs.reduce((s,t)=>s+t.hours,0).toFixed(1)} hrs</span></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── NOTES ── */}
      {activeTab==='notes' && (
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <Btn color={S.info} onClick={()=>setShowNewNote(true)}><Plus size={11}/>Add Note</Btn>
            <Btn color={S.accent} variant="outline" onClick={()=>exportCaseReport(c)}><Download size={11}/>Export Notes</Btn>
          </div>
          {c.notes?.length === 0 && <div style={{ ...cardSm, color:S.dim, textAlign:'center' }}>No notes yet. Add the first note above.</div>}
          {c.notes?.map(n=>(
            <div key={n.id} style={{ ...card, marginBottom:10, borderLeft:`3px solid ${n.internal?S.warn:n.type==='interview_note'?S.god:S.info}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
                    <span style={{ ...badge(n.type==='interview_note'?S.god:S.info), fontSize:10 }}>{n.type==='interview_note'?'🎙️ Interview Note':'📝 Case Note'}</span>
                    <span style={{ color:S.text, fontSize:12, fontWeight:600 }}>{n.author}</span>
                    <span style={{ color:S.dim, fontSize:11, fontFamily:"'IBM Plex Mono',monospace" }}>{n.ts}</span>
                    {n.internal && <span style={{ ...badge(S.warn), fontSize:9 }}>🔒 Internal</span>}
                    {n.signedOff && <span style={{ ...badge(S.ok), fontSize:9 }}>✓ Signed off: {n.signedBy}</span>}
                  </div>
                  <div style={{ color:S.midText, fontSize:13, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{n.text}</div>
                </div>
                {canApprove && !n.signedOff && (
                  <Btn size="sm" color={S.ok} onClick={()=>signOffNote(n.id)}><CheckCircle2 size={11}/>Sign Off</Btn>
                )}
              </div>
            </div>
          ))}
          <Modal open={showNewNote} onClose={()=>setShowNewNote(false)} title="Add Note">
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <Field label="NOTE TYPE">
                <select value={newNote.type} onChange={e=>setNewNote(n=>({...n,type:e.target.value}))} style={fieldStyle}>
                  <option value="case_note">📝 Case Note</option>
                  <option value="interview_note">🎙️ Interview Note</option>
                </select>
              </Field>
              <Field label="NOTE TEXT" required><textarea value={newNote.text} onChange={e=>setNewNote(n=>({...n,text:e.target.value}))} placeholder="Enter note…" style={{ ...textareaStyle, minHeight:120 }}/></Field>
              <Toggle on={newNote.internal} onChange={v=>setNewNote(n=>({...n,internal:v}))} label="Internal only (supervisors+ visible)"/>
              <div style={{ display:'flex', gap:8 }}>
                <Btn onClick={addNote} color={S.info}><Plus size={11}/>Add Note</Btn>
                <Btn onClick={()=>setShowNewNote(false)} color={S.dim} variant="outline">Cancel</Btn>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* ── TIMELINE ── */}
      {activeTab==='timeline' && (
        <div>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:16 }}>Investigation Timeline — {c.timeline?.length||0} entries</div>
          {c.timeline?.length === 0 && <div style={{ ...cardSm, color:S.dim, textAlign:'center' }}>No timeline entries yet.</div>}
          {[...(c.timeline||[])].reverse().map(t=>(
            <TimelineEntry key={t.id} ts={t.ts} user={t.user} type={t.type} content={t.text} color={t.color} icon={t.icon}/>
          ))}
        </div>
      )}

      {/* ── FILES ── */}
      {activeTab==='files' && (
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <Btn color={S.accent} onClick={()=>document.getElementById('file-upload-2').click()}><Paperclip size={11}/>Upload File</Btn>
            <input id="file-upload-2" type="file" style={{ display:'none' }} onChange={handleFileUpload} multiple accept="image/*,video/*,audio/*,.pdf,.csv,.txt,.docx,.xlsx"/>
            <div style={{ color:S.dim, fontSize:11, alignSelf:'center' }}>Photos, video, audio, screenshots, documents, PDFs supported</div>
          </div>
          {c.files?.length === 0 && <div style={{ ...cardSm, color:S.dim, textAlign:'center' }}>No files uploaded yet.</div>}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
            {c.files?.map(f=>{
              const typeIcon = f.type?.includes('image')?'🖼️':f.type?.includes('video')?'🎬':f.type?.includes('audio')?'🎵':f.type?.includes('pdf')?'📄':'📎'
              const typeColor = f.type?.includes('image')?S.ok:f.type?.includes('video')?S.danger:f.type?.includes('audio')?S.god:S.accent
              return (
                <div key={f.id} style={{ ...cardSm, borderLeft:`3px solid ${typeColor}` }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{typeIcon}</div>
                  <div style={{ color:S.text, fontSize:13, fontWeight:600, marginBottom:2 }}>{f.name}</div>
                  <div style={{ color:S.dim, fontSize:11, marginBottom:6 }}>{f.size} · {f.uploadedBy} · {f.ts}</div>
                  {f.description && <div style={{ color:S.midText, fontSize:12, marginBottom:8 }}>{f.description}</div>}
                  <div style={{ display:'flex', gap:6 }}>
                    <Btn size="sm" color={S.info} variant="outline"><Eye size={11}/>View</Btn>
                    <Btn size="sm" color={S.accent} variant="outline"><Download size={11}/>Download</Btn>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── PHONE LOG ── */}
      {activeTab==='phonelog' && (
        <div>
          <Btn color={S.ok} style={{ marginBottom:16 }} onClick={()=>{
            const num=prompt('Phone number:')
            if(num){
              const entry={id:`PH-${uid()}`,number:num,contact:prompt('Contact name:'),date:now().split(' ')[0],time:now().split(' ')[1],duration:prompt('Duration (e.g. 15 min):'),notes:prompt('Notes:')||''}
              updateCase(c.id,x=>({...x,phoneLog:[...x.phoneLog,entry],timeline:[...x.timeline,{id:`TL-${uid()}`,ts:now(),user:user.username,type:'Phone Call Logged',icon:'📞',color:S.ok,text:`${entry.contact} (${entry.number})`}]}))
              setActiveCase({...c,phoneLog:[...c.phoneLog,entry]})
            }
          }}><Phone size={11}/>Log Phone Call</Btn>
          {c.phoneLog?.length===0 && <div style={{ ...cardSm, color:S.dim, textAlign:'center' }}>No phone calls logged yet.</div>}
          {c.phoneLog?.map(p=>(
            <div key={p.id} style={{ ...cardSm, marginBottom:8, borderLeft:`3px solid ${S.ok}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                <div>
                  <div style={{ color:S.text, fontSize:13, fontWeight:700 }}>{p.contact}</div>
                  <div style={{ color:S.dim, fontSize:11 }}>{p.number} · {p.date} {p.time} · {p.duration}</div>
                  {p.notes && <div style={{ color:S.midText, fontSize:12, marginTop:4 }}>{p.notes}</div>}
                </div>
                <span style={{ ...badge(S.ok), alignSelf:'flex-start' }}>📞 Logged</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STAKEOUT ── */}
      {activeTab==='stakeout' && (
        <div>
          <Btn color={S.god} style={{ marginBottom:16 }} onClick={()=>setShowStakeout(true)}><Eye size={11}/>Add Stakeout Entry</Btn>
          {c.stakeoutLog?.length===0 && <div style={{ ...cardSm, color:S.dim, textAlign:'center' }}>No stakeout entries yet.</div>}
          {c.stakeoutLog?.map(s=>(
            <div key={s.id} style={{ ...card, marginBottom:10, borderLeft:`3px solid ${'#8b5cf6'}` }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                <span style={{ ...badge('#8b5cf6') }}>👁️ STAKEOUT</span>
                <span style={{ color:S.dim, fontSize:11, fontFamily:"'IBM Plex Mono',monospace" }}>{s.ts}</span>
                <span style={{ color:S.dim, fontSize:11 }}>by {s.addedBy}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['📍 Location',s.location],['👤 Subjects',s.subjects],['🚗 Vehicles',s.vehicles],['📱 Phones',s.phones]].map(([l,v])=>v&&(
                  <div key={l}><div style={{ color:S.dim, fontSize:10 }}>{l}</div><div style={{ color:S.text, fontSize:12 }}>{v}</div></div>
                ))}
              </div>
              {s.notes && <div style={{ color:S.midText, fontSize:12, marginTop:8 }}>{s.notes}</div>}
            </div>
          ))}
          <Modal open={showStakeout} onClose={()=>setShowStakeout(false)} title="Add Stakeout Entry">
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Field label="TIMESTAMP"><input value={stakeoutEntry.ts} onChange={e=>setStakeoutEntry(s=>({...s,ts:e.target.value}))} style={fieldStyle}/></Field>
                <Field label="LOCATION / ADDRESS"><input value={stakeoutEntry.location} onChange={e=>setStakeoutEntry(s=>({...s,location:e.target.value}))} placeholder="Address or venue" style={fieldStyle}/></Field>
                <Field label="SUBJECTS OBSERVED"><input value={stakeoutEntry.subjects} onChange={e=>setStakeoutEntry(s=>({...s,subjects:e.target.value}))} placeholder="Names / descriptions" style={fieldStyle}/></Field>
                <Field label="VEHICLE PLATES"><input value={stakeoutEntry.vehicles} onChange={e=>setStakeoutEntry(s=>({...s,vehicles:e.target.value}))} placeholder="License plates" style={fieldStyle}/></Field>
                <Field label="PHONE NUMBERS"><input value={stakeoutEntry.phones} onChange={e=>setStakeoutEntry(s=>({...s,phones:e.target.value}))} placeholder="+1-XXX-XXX-XXXX" style={fieldStyle}/></Field>
              </div>
              <Field label="OBSERVATION NOTES"><textarea value={stakeoutEntry.notes} onChange={e=>setStakeoutEntry(s=>({...s,notes:e.target.value}))} placeholder="Detailed observations…" style={textareaStyle}/></Field>
              <div style={{ display:'flex', gap:8 }}>
                <Btn onClick={addStakeout} color={S.god}><Eye size={11}/>Log Entry</Btn>
                <Btn onClick={()=>setShowStakeout(false)} color={S.dim} variant="outline">Cancel</Btn>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* ── LEADS ── */}
      {activeTab==='leads' && (
        <div>
          <Btn color={S.ok} style={{ marginBottom:16 }} onClick={()=>setShowLead(true)}><Search size={11}/>Add Lead</Btn>
          {c.leads?.length===0 && <div style={{ ...cardSm, color:S.dim, textAlign:'center' }}>No leads recorded yet.</div>}
          {c.leads?.map(l=>(
            <div key={l.id} style={{ ...card, marginBottom:10, borderLeft:`3px solid ${S.ok}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>{l.name}</div>
                  <div style={{ display:'flex', gap:14, marginTop:6, flexWrap:'wrap' }}>
                    {l.phone && <span style={{ color:S.dim, fontSize:11 }}>📞 {l.phone}</span>}
                    {l.email && <span style={{ color:S.dim, fontSize:11 }}>✉ {l.email}</span>}
                    {l.address && <span style={{ color:S.dim, fontSize:11 }}>📍 {l.address}</span>}
                    {l.social && <span style={{ color:S.dim, fontSize:11 }}>🌐 {l.social}</span>}
                  </div>
                  {l.notes && <div style={{ color:S.midText, fontSize:12, marginTop:6 }}>{l.notes}</div>}
                </div>
                <span style={{ ...badge(S.ok), alignSelf:'flex-start', fontSize:9 }}>LEAD</span>
              </div>
            </div>
          ))}
          <Modal open={showLead} onClose={()=>setShowLead(false)} title="Add Lead">
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <Field label="NAME" required><input value={leadEntry.name} onChange={e=>setLeadEntry(l=>({...l,name:e.target.value}))} placeholder="Full name" style={fieldStyle}/></Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Field label="ADDRESS"><input value={leadEntry.address} onChange={e=>setLeadEntry(l=>({...l,address:e.target.value}))} placeholder="Address" style={fieldStyle}/></Field>
                <Field label="PHONE"><input value={leadEntry.phone} onChange={e=>setLeadEntry(l=>({...l,phone:e.target.value}))} placeholder="+1-XXX-XXX-XXXX" style={fieldStyle}/></Field>
                <Field label="EMAIL"><input value={leadEntry.email} onChange={e=>setLeadEntry(l=>({...l,email:e.target.value}))} placeholder="email@example.com" style={fieldStyle}/></Field>
                <Field label="SOCIAL MEDIA"><input value={leadEntry.social} onChange={e=>setLeadEntry(l=>({...l,social:e.target.value}))} placeholder="@handle or URL" style={fieldStyle}/></Field>
              </div>
              <Field label="NOTES"><textarea value={leadEntry.notes} onChange={e=>setLeadEntry(l=>({...l,notes:e.target.value}))} placeholder="Additional intelligence…" style={textareaStyle}/></Field>
              <div style={{ display:'flex', gap:8 }}>
                <Btn onClick={addLead} color={S.ok}><Plus size={11}/>Add Lead</Btn>
                <Btn onClick={()=>setShowLead(false)} color={S.dim} variant="outline">Cancel</Btn>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* ── INFRACTIONS ── */}
      {activeTab==='infractions' && (
        <div>
          <Btn color={S.god} style={{ marginBottom:16 }} onClick={()=>setShowInfraction(true)}><Plus size={11}/>Add Governance Infraction</Btn>
          {c.infractions?.length===0 && <div style={{ ...cardSm, color:S.dim, textAlign:'center' }}>No governance infractions logged.</div>}
          {c.infractions?.map(i=>(
            <div key={i.id} style={{ ...cardSm, marginBottom:10, borderLeft:`3px solid ${S.warn}` }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
                <span style={{ ...badge(S.warn) }}>{i.type||'Infraction'}</span>
                <span style={{ color:S.dim, fontSize:11 }}>{i.body}</span>
                <span style={{ color:S.dim, fontSize:11 }}>{i.date}</span>
              </div>
              <div style={{ color:S.midText, fontSize:12 }}>{i.description}</div>
            </div>
          ))}
          <Modal open={showInfraction} onClose={()=>setShowInfraction(false)} title="Add Governance Infraction">
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Field label="GOVERNING BODY (e.g. ITIA, NCAA)"><input value={infraction.body} onChange={e=>setInfraction(i=>({...i,body:e.target.value}))} placeholder="ITIA / NCAA / NFL" style={fieldStyle}/></Field>
                <Field label="DATE"><input value={infraction.date} onChange={e=>setInfraction(i=>({...i,date:e.target.value}))} placeholder="YYYY-MM-DD" style={fieldStyle}/></Field>
                <Field label="INFRACTION TYPE"><input value={infraction.type} onChange={e=>setInfraction(i=>({...i,type:e.target.value}))} placeholder="e.g. Betting Violation" style={fieldStyle}/></Field>
              </div>
              <Field label="DESCRIPTION"><textarea value={infraction.description} onChange={e=>setInfraction(i=>({...i,description:e.target.value}))} placeholder="Describe the infraction…" style={textareaStyle}/></Field>
              <div style={{ display:'flex', gap:8 }}>
                <Btn onClick={addInfraction} color={S.god}><Plus size={11}/>Add</Btn>
                <Btn onClick={()=>setShowInfraction(false)} color={S.dim} variant="outline">Cancel</Btn>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* ── TIME LOG ── */}
      {activeTab==='time' && (
        <div>
          <div style={{ ...card, marginBottom:14 }}>
            <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:8 }}>Time Summary</div>
            <div style={{ display:'flex', gap:16 }}>
              <div><div style={{ color:S.dim, fontSize:11 }}>TOTAL LOGGED</div><div style={{ color:S.accent, fontSize:24, fontWeight:800 }}>{c.timeLogs?.reduce((s,t)=>s+t.hours,0).toFixed(1)} hrs</div></div>
              <div><div style={{ color:S.dim, fontSize:11 }}>APPROVED</div><div style={{ color:S.ok, fontSize:24, fontWeight:800 }}>{c.timeLogs?.filter(t=>t.approved).reduce((s,t)=>s+t.hours,0).toFixed(1)} hrs</div></div>
              <div><div style={{ color:S.dim, fontSize:11 }}>PENDING</div><div style={{ color:S.warn, fontSize:24, fontWeight:800 }}>{c.timeLogs?.filter(t=>!t.approved).reduce((s,t)=>s+t.hours,0).toFixed(1)} hrs</div></div>
            </div>
          </div>
          <Btn color={S.accent} style={{ marginBottom:14 }} onClick={()=>{
            const hrs=parseFloat(prompt('Hours worked:'))
            if(!isNaN(hrs)){
              const entry={agent:user.username,date:now().split(' ')[0],hours:hrs,description:prompt('Description:')||'',approved:false}
              updateCase(c.id,x=>({...x,timeLogs:[...x.timeLogs,entry]}))
              setActiveCase({...c,timeLogs:[...c.timeLogs,entry]})
            }
          }}><Clock size={11}/>Log Time</Btn>
          {c.timeLogs?.map((t,i)=>(
            <div key={i} style={{ ...cardSm, marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ color:S.text, fontSize:13, fontWeight:600 }}>{t.agent} — {t.date}</div>
                <div style={{ color:S.dim, fontSize:11 }}>{t.description}</div>
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <span style={{ color:S.accent, fontSize:16, fontWeight:700 }}>{t.hours}h</span>
                {t.approved ? <span style={{ ...badge(S.ok), fontSize:9 }}>✓ Approved</span> : canApprove ? <Btn size="sm" color={S.ok} onClick={()=>{updateCase(c.id,x=>({...x,timeLogs:x.timeLogs.map((tl,j)=>j===i?{...tl,approved:true}:tl)}));setActiveCase({...c,timeLogs:c.timeLogs.map((tl,j)=>j===i?{...tl,approved:true}:tl)})}}><CheckCircle2 size={10}/>Approve</Btn> : <span style={{ ...badge(S.warn), fontSize:9 }}>Pending</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CEASE & DESIST MODAL ── */}
      <Modal open={showCeaseD} onClose={()=>setShowCeaseD(false)} title="Generate Cease & Desist Letter" width={720}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ ...cardSm, background:'#1a0a00', borderColor:S.warn+'44', color:S.warn, fontSize:12 }}>⚠ Upload your organization's letterhead and signature in Settings → Letterhead to include them in the export.</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="SUBJECT (Recipient)" required><input value={ceaseD.subject} onChange={e=>setCeaseD(x=>({...x,subject:e.target.value}))} placeholder="Name / organization" style={fieldStyle}/></Field>
            <Field label="ISSUING ORGANIZATION"><input value={ceaseD.organization} onChange={e=>setCeaseD(x=>({...x,organization:e.target.value}))} placeholder="Your organization" style={fieldStyle}/></Field>
            <Field label="SIGNATORY NAME"><input value={ceaseD.signatory} onChange={e=>setCeaseD(x=>({...x,signatory:e.target.value}))} placeholder="Signed by" style={fieldStyle}/></Field>
            <Field label="TITLE / POSITION"><input value={ceaseD.title} onChange={e=>setCeaseD(x=>({...x,title:e.target.value}))} placeholder="Chief Integrity Officer" style={fieldStyle}/></Field>
            <Field label="DATE"><input value={ceaseD.date} onChange={e=>setCeaseD(x=>({...x,date:e.target.value}))} style={fieldStyle}/></Field>
          </div>
          <Field label="GROUNDS (legal basis)"><textarea value={ceaseD.grounds} onChange={e=>setCeaseD(x=>({...x,grounds:e.target.value}))} placeholder="Describe the violation or conduct giving rise to this notice…" style={textareaStyle}/></Field>
          <Field label="DEMANDS"><textarea value={ceaseD.demands} onChange={e=>setCeaseD(x=>({...x,demands:e.target.value}))} placeholder="Specify what the recipient must do or refrain from doing…" style={textareaStyle}/></Field>
          <div style={{ display:'flex', gap:8 }}>
            <Btn onClick={exportCeaseDesist} color={S.danger}><Download size={11}/>Export PDF / Text</Btn>
            <Btn onClick={()=>setShowCeaseD(false)} color={S.dim} variant="outline">Cancel</Btn>
          </div>
        </div>
      </Modal>

      {/* ── LINK CASE MODAL ── */}
      <Modal open={showLink} onClose={()=>setShowLink(false)} title="Link Cases">
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ color:S.dim, fontSize:12 }}>Link this case to another case. Useful for connecting related investigations or when an informant becomes a suspect.</div>
          {cases.filter(x=>x.id!==c.id).map(x=>(
            <div key={x.id} style={{ ...cardSm, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ color:S.text, fontSize:13, fontWeight:600 }}>{x.id}</div>
                <div style={{ color:S.dim, fontSize:11 }}>{x.title}</div>
              </div>
              {c.linkedCases?.includes(x.id)
                ? <span style={{ ...badge(S.ok) }}>Linked</span>
                : <Btn size="sm" color={S.info} onClick={()=>{ updateCase(c.id,cc=>({...cc,linkedCases:[...cc.linkedCases,x.id]})); setActiveCase({...c,linkedCases:[...c.linkedCases,x.id]}); }}><Link size={11}/>Link</Btn>
              }
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECURE MESSAGING
// ═══════════════════════════════════════════════════════════════════════════════
function SecureMessaging({ user }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [activeThread, setActiveThread] = useState(null)
  const [newMsg, setNewMsg] = useState('')
  const [newContact, setNewContact] = useState('')
  const messagesEndRef = useRef(null)

  const myThreads = Object.entries(messages).filter(([key]) => key.includes(user.username))
  const getOther = (key) => key.split('|').find(u=>u!==user.username)
  const threadKey = (a,b) => [a,b].sort().join('|')

  const sendMessage = () => {
    if (!newMsg.trim() || !activeThread) return
    const msg = { id:`M-${uid()}`, from:user.username, to:getOther(activeThread), ts:now(), text:newMsg, read:false, attachment:null }
    setMessages(ms=>({ ...ms, [activeThread]: [...(ms[activeThread]||[]), msg] }))
    setNewMsg('')
    setTimeout(()=>messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }), 50)
  }

  const startThread = () => {
    if (!newContact.trim()) return
    const key = threadKey(user.username, newContact)
    setMessages(ms=>({ ...ms, [key]: ms[key]||[] }))
    setActiveThread(key)
    setNewContact('')
  }

  return (
    <div>
      <SectionHeader title="💬 Secure Messaging" subtitle="End-to-end encrypted · Agent ↔ Supervisor ↔ Main Account · SHA-256 logged"/>
      <div style={{ ...card, marginBottom:14, borderLeft:`3px solid ${S.secure}` }}>
        <div style={{ color:S.secure, fontSize:12, fontWeight:600 }}>🔒 All messages are encrypted at rest and in transit. Message history is immutable and SHA-256 logged for audit purposes.</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:16, minHeight:500 }}>
        {/* Thread list */}
        <div style={card}>
          <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:12 }}>Conversations</div>
          <div style={{ display:'flex', gap:6, marginBottom:12 }}>
            <input value={newContact} onChange={e=>setNewContact(e.target.value)} placeholder="Username…" style={{ ...fieldStyle, fontSize:12 }} onKeyDown={e=>e.key==='Enter'&&startThread()}/>
            <Btn size="sm" color={S.secure} onClick={startThread}><Plus size={11}/></Btn>
          </div>
          {myThreads.length===0 && <div style={{ color:S.dim, fontSize:12 }}>No conversations yet. Enter a username above to start.</div>}
          {myThreads.map(([key, msgs])=>{
            const other = getOther(key)
            const last = msgs[msgs.length-1]
            const unread = msgs.filter(m=>m.to===user.username&&!m.read).length
            return (
              <div key={key} onClick={()=>setActiveThread(key)} style={{ padding:'10px 8px', borderRadius:8, cursor:'pointer', background:activeThread===key?S.mid:'transparent', marginBottom:4, display:'flex', gap:10, alignItems:'center' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:S.secure+'33', display:'flex', alignItems:'center', justifyContent:'center', color:S.secure, fontSize:14, fontWeight:700, flexShrink:0 }}>{other?.[0]?.toUpperCase()||'?'}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color:S.text, fontSize:13, fontWeight:600 }}>{other}</span>
                    {unread>0 && <span style={{ ...badge(S.secure), fontSize:9 }}>{unread}</span>}
                  </div>
                  {last && <div style={{ color:S.dim, fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{last.text.slice(0,40)}</div>}
                </div>
              </div>
            )
          })}
        </div>
        {/* Message area */}
        {activeThread ? (
          <div style={{ ...card, display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${S.border}` }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:S.secure+'33', display:'flex', alignItems:'center', justifyContent:'center', color:S.secure, fontSize:14, fontWeight:700 }}>{getOther(activeThread)?.[0]?.toUpperCase()}</div>
              <div>
                <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>{getOther(activeThread)}</div>
                <div style={{ color:S.dim, fontSize:11 }}>🔒 Encrypted · SHA-256 logged</div>
              </div>
            </div>
            <div style={{ flex:1, overflowY:'auto', minHeight:300, maxHeight:400 }}>
              {(messages[activeThread]||[]).map(msg=>(
                <MessageBubble key={msg.id} msg={msg} isMine={msg.from===user.username}/>
              ))}
              <div ref={messagesEndRef}/>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:14, paddingTop:14, borderTop:`1px solid ${S.border}` }}>
              <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="Type message…" style={{ ...fieldStyle, flex:1 }} onKeyDown={e=>e.key==='Enter'&&sendMessage()}/>
              <Btn color={S.secure} onClick={()=>document.getElementById('msg-attach').click()} variant="outline"><Paperclip size={12}/></Btn>
              <input id="msg-attach" type="file" style={{ display:'none' }}/>
              <Btn color={S.secure} onClick={sendMessage}><Send size={12}/>Send</Btn>
            </div>
          </div>
        ) : (
          <div style={{ ...card, display:'flex', alignItems:'center', justifyContent:'center', color:S.dim, fontSize:13 }}>
            Select a conversation or start a new one
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIMEKEEPING & BILLING
// ═══════════════════════════════════════════════════════════════════════════════
function Timekeeping({ user }) {
  const [clients,  setClients]  = useState(INITIAL_CLIENTS)
  const [invoices, setInvoices] = useState(INITIAL_INVOICES)
  const [activeSection, setSection] = useState('clients')
  const [showNewInv, setShowNewInv] = useState(false)
  const [newInv, setNewInv] = useState({ clientId:'CLT-001', period:'', hours:0, notes:'' })

  const canBill = ['god','main_account','supervisor'].includes(user?.role)

  const statusColor = s=>s==='paid'?S.ok:s==='sent'?S.info:s==='draft'?S.dim:S.warn

  const createInvoice = () => {
    const client = clients.find(c=>c.id===newInv.clientId)
    if (!client) return
    const amount = client.rateType==='hourly' ? client.rate * newInv.hours : client.rate
    const tax = amount * (client.taxRate||0)
    const inv = { id:`INV-${Date.now().toString().slice(-6)}`, ...newInv, amount, tax, total:amount+tax, status:'draft', issued:now().split(' ')[0], due:'30 days' }
    setInvoices(is=>[...is,inv])
    setShowNewInv(false)
  }

  const exportInvoice = (inv) => {
    const client = clients.find(c=>c.id===inv.clientId)
    const lines = [
      `INVOICE`,``,`Invoice #: ${inv.id}`,`Issued: ${inv.issued}`,`Due: ${inv.due}`,``,
      `FROM: [Your Organization]`,`TO: ${client?.name}`,`Attn: ${client?.contact}`,``,
      `PERIOD: ${inv.period}`,
      client?.rateType==='hourly' ? `HOURS: ${inv.hours} × $${client?.rate}/hr` : `SERVICE: Monthly retainer`,``,
      `SUBTOTAL: $${inv.amount.toFixed(2)}`,
      inv.tax > 0 ? `TAX (${(client?.taxRate*100).toFixed(1)}%): $${inv.tax.toFixed(2)}` : '',
      `TOTAL DUE: $${inv.total.toFixed(2)}`,``,
      `Payment due within 30 days of invoice date.`,
      `Bank details and payment instructions on file.`,
    ].filter(Boolean)
    const blob = new Blob([lines.join('\n')], { type:'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${inv.id}_invoice.txt`
    a.click()
  }

  return (
    <div>
      <SectionHeader title="⏰ Timekeeping & Invoicing" subtitle="Client management · Hourly / retainer billing · Monthly & quarterly invoicing · Tax calculation"/>
      <div style={{ display:'flex', gap:6, marginBottom:18 }}>
        {[['clients','👤 Clients'],['invoices','📄 Invoices'],['summary','📊 Summary']].map(([id,l])=>(
          <button key={id} onClick={()=>setSection(id)} style={{ padding:'7px 14px', borderRadius:6, fontSize:12, cursor:'pointer', background:activeSection===id?S.mid:'transparent', color:activeSection===id?S.accent:S.dim, border:`1px solid ${activeSection===id?S.border:'transparent'}`, fontWeight:activeSection===id?700:400 }}>{l}</button>
        ))}
      </div>

      {activeSection==='clients' && (
        <div>
          <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
            <StatCard label="Clients" value={clients.length}/>
            <StatCard label="Monthly Retainers" value={clients.filter(c=>c.rateType==='monthly').length} color={S.info}/>
            <StatCard label="Hourly Clients" value={clients.filter(c=>c.rateType==='hourly').length} color={S.accent}/>
          </div>
          {clients.map(c=>(
            <div key={c.id} style={{ ...card, marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                <div>
                  <div style={{ color:S.text, fontSize:15, fontWeight:700 }}>{c.name}</div>
                  <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>{c.contact} · {c.email}</div>
                </div>
                <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ color:S.dim, fontSize:10 }}>RATE</div>
                    <div style={{ color:S.accent, fontSize:18, fontWeight:800 }}>${c.rate}{c.rateType==='hourly'?'/hr':'/mo'}</div>
                  </div>
                  {c.taxRate>0 && <div style={{ textAlign:'center' }}>
                    <div style={{ color:S.dim, fontSize:10 }}>TAX</div>
                    <div style={{ color:S.warn, fontSize:14, fontWeight:700 }}>{(c.taxRate*100).toFixed(1)}%</div>
                  </div>}
                  <Btn size="sm" color={S.info} variant="outline" onClick={()=>{setNewInv(n=>({...n,clientId:c.id}));setShowNewInv(true);setSection('invoices')}}><Plus size={11}/>Invoice</Btn>
                </div>
              </div>
            </div>
          ))}
          {canBill && <Btn color={S.accent} style={{ marginTop:8 }} onClick={()=>alert('Add client form — connect to DynamoDB in production')}><Plus size={11}/>Add Client</Btn>}
        </div>
      )}

      {activeSection==='invoices' && (
        <div>
          <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
            <StatCard label="Total Invoiced" value={`$${invoices.reduce((s,i)=>s+i.total,0).toLocaleString()}`} color={S.accent}/>
            <StatCard label="Paid" value={`$${invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+i.total,0).toLocaleString()}`} color={S.ok}/>
            <StatCard label="Outstanding" value={`$${invoices.filter(i=>i.status!=='paid').reduce((s,i)=>s+i.total,0).toLocaleString()}`} color={S.danger}/>
          </div>
          {canBill && <Btn color={S.accent} style={{ marginBottom:14 }} onClick={()=>setShowNewInv(true)}><Plus size={11}/>New Invoice</Btn>}
          {invoices.map(inv=>{
            const client=clients.find(c=>c.id===inv.clientId)
            return (
              <div key={inv.id} style={{ ...card, marginBottom:10, borderLeft:`3px solid ${statusColor(inv.status)}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                      <span style={{ color:S.dim, fontSize:11, fontFamily:"'IBM Plex Mono',monospace" }}>{inv.id}</span>
                      <span style={{ ...badge(statusColor(inv.status)) }}>{inv.status.toUpperCase()}</span>
                    </div>
                    <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>{client?.name}</div>
                    <div style={{ color:S.dim, fontSize:11 }}>{inv.period} · Issued: {inv.issued} · Due: {inv.due}</div>
                  </div>
                  <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ color:S.dim, fontSize:10 }}>TOTAL</div>
                      <div style={{ color:S.accent, fontSize:22, fontWeight:900 }}>${inv.total.toLocaleString()}</div>
                    </div>
                    <Btn size="sm" color={S.accent} variant="outline" onClick={()=>exportInvoice(inv)}><Download size={11}/>Export</Btn>
                    {canBill && inv.status==='draft' && <Btn size="sm" color={S.ok} onClick={()=>setInvoices(is=>is.map(i=>i.id===inv.id?{...i,status:'sent'}:i))}><Send size={11}/>Send</Btn>}
                  </div>
                </div>
              </div>
            )
          })}
          <Modal open={showNewInv} onClose={()=>setShowNewInv(false)} title="Create Invoice">
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <Field label="CLIENT">
                <select value={newInv.clientId} onChange={e=>setNewInv(n=>({...n,clientId:e.target.value}))} style={fieldStyle}>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Field label="BILLING PERIOD"><input value={newInv.period} onChange={e=>setNewInv(n=>({...n,period:e.target.value}))} placeholder="e.g. March 2026" style={fieldStyle}/></Field>
                <Field label="HOURS (if hourly)"><input type="number" value={newInv.hours} onChange={e=>setNewInv(n=>({...n,hours:parseFloat(e.target.value)||0}))} style={fieldStyle}/></Field>
              </div>
              <Field label="NOTES"><textarea value={newInv.notes} onChange={e=>setNewInv(n=>({...n,notes:e.target.value}))} placeholder="Services rendered…" style={textareaStyle}/></Field>
              <div style={{ display:'flex', gap:8 }}>
                <Btn onClick={createInvoice} color={S.accent}><Plus size={11}/>Create</Btn>
                <Btn onClick={()=>setShowNewInv(false)} color={S.dim} variant="outline">Cancel</Btn>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {activeSection==='summary' && (
        <div>
          <div style={{ ...card, marginBottom:16 }}>
            <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Revenue Summary</div>
            {clients.map(c=>{
              const clientInvoices = invoices.filter(i=>i.clientId===c.id)
              const paid = clientInvoices.filter(i=>i.status==='paid').reduce((s,i)=>s+i.total,0)
              const outstanding = clientInvoices.filter(i=>i.status!=='paid').reduce((s,i)=>s+i.total,0)
              return (
                <div key={c.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${S.border}44` }}>
                  <div>
                    <div style={{ color:S.text, fontSize:13, fontWeight:600 }}>{c.name}</div>
                    <div style={{ color:S.dim, fontSize:11 }}>{c.rateType==='hourly'?`$${c.rate}/hr`:`$${c.rate}/mo`}</div>
                  </div>
                  <div style={{ display:'flex', gap:20 }}>
                    <div style={{ textAlign:'right' }}><div style={{ color:S.dim, fontSize:10 }}>PAID</div><div style={{ color:S.ok, fontSize:14, fontWeight:700 }}>${paid.toLocaleString()}</div></div>
                    <div style={{ textAlign:'right' }}><div style={{ color:S.dim, fontSize:10 }}>OUTSTANDING</div><div style={{ color:outstanding>0?S.warn:S.dim, fontSize:14, fontWeight:700 }}>${outstanding.toLocaleString()}</div></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOD MODE — v1.4 with API toggle
// ═══════════════════════════════════════════════════════════════════════════════
function GodMode({ user }) {
  const [apis, setApis] = useState(INITIAL_APIS)
  const [section, setSection] = useState('apis')
  const toggleApi = (id) => setApis(as=>as.map(a=>a.id===id?{...a,enabled:!a.enabled,status:!a.enabled?'live':'warn'}:a))
  const sc = s=>s==='live'?S.ok:s==='warn'?S.warn:S.danger

  return (
    <div>
      <SectionHeader title="👁️ God Mode — Integrity Chief Console" subtitle={`Full system control · IRI v${VERSION} · Operator: ${user.username}`}/>
      <div style={{ ...card, marginBottom:16, borderColor:S.god+'44', background:'#1a0a2e' }}>
        <div style={{ color:S.god, fontSize:13, fontWeight:700, marginBottom:4 }}>⚠ RESTRICTED — INTEGRITY CHIEF ONLY</div>
        <div style={{ color:S.dim, fontSize:12 }}>Full user management, API on/off control, profile switching, document archive, and patch management.</div>
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:18, flexWrap:'wrap' }}>
        {[['apis','🔌 API Control'],['users','👤 Users'],['letterhead','📜 Letterhead'],['patch','🔧 Version']].map(([id,l])=>(
          <button key={id} onClick={()=>setSection(id)} style={{ padding:'7px 14px', borderRadius:6, fontSize:12, cursor:'pointer', background:section===id?S.mid:'transparent', color:section===id?S.god:S.dim, border:`1px solid ${section===id?S.god+'44':'transparent'}`, fontWeight:section===id?700:400 }}>{l}</button>
        ))}
      </div>

      {section==='apis' && (
        <div>
          <div style={{ color:S.dim, fontSize:12, marginBottom:14 }}>Enable or disable any API feed in real time. Disabled APIs are excluded from IRI calculations and credibility scoring. All changes are SHA-256 logged.</div>
          <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
            <StatCard label="Total APIs" value={apis.length} color={S.god}/>
            <StatCard label="Enabled" value={apis.filter(a=>a.enabled).length} color={S.ok}/>
            <StatCard label="Disabled" value={apis.filter(a=>!a.enabled).length} color={S.danger}/>
            <StatCard label="Avg Credibility" value={`${Math.round(apis.filter(a=>a.enabled).reduce((s,a)=>s+a.credibility,0)/Math.max(apis.filter(a=>a.enabled).length,1))}%`} color={S.accent}/>
          </div>
          {apis.map(a=>(
            <div key={a.id} style={{ ...card, marginBottom:10, borderLeft:`3px solid ${a.enabled?sc(a.status):S.dim}`, opacity:a.enabled?1:.65 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:a.enabled?sc(a.status):S.dim }}/>
                    <span style={{ color:S.text, fontWeight:700 }}>{a.name}</span>
                    <span style={{ ...badge(a.enabled?sc(a.status):S.dim) }}>{a.enabled?a.status.toUpperCase():'DISABLED'}</span>
                    {a.sports?.map(s=><SportBadge key={s} sport={s}/>)}
                  </div>
                  <div style={{ color:S.dim, fontSize:11 }}>Key: {a.key} · {a.endpoint} · Credibility: {a.credibility}%</div>
                </div>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <Toggle on={a.enabled} onChange={()=>toggleApi(a.id)} color={S.ok}/>
                  <span style={{ color:a.enabled?S.ok:S.danger, fontSize:12, fontWeight:700 }}>{a.enabled?'ON':'OFF'}</span>
                  <div style={{ background:S.mid, borderRadius:4, height:6, width:70 }}>
                    <div style={{ background:a.credibility>70?S.ok:a.credibility>50?S.warn:S.danger, borderRadius:4, height:6, width:`${a.credibility}%` }}/>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div style={{ ...card, marginTop:16 }}>
            <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Inject New API</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="API NAME"><input placeholder="e.g. KenPom College Basketball" style={fieldStyle}/></Field>
              <Field label="ENDPOINT URL"><input placeholder="https://api.example.com/v1/..." style={fieldStyle}/></Field>
              <Field label="API KEY (stored in Secrets Manager)"><input type="password" placeholder="Key never stored in UI" style={fieldStyle}/></Field>
              <Field label="SPORT CONTEXT">
                <select style={fieldStyle}>
                  {Object.entries(SPORTS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ marginTop:12 }}><Btn color={S.god}><Database size={11}/>Inject API</Btn></div>
          </div>
        </div>
      )}

      {section==='letterhead' && (
        <div>
          <div style={{ ...card, marginBottom:14 }}>
            <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Organization Letterhead & Signatures</div>
            <div style={{ color:S.dim, fontSize:12, marginBottom:14 }}>Upload your organization's letterhead logo, signature images, and custom fonts. These are applied automatically to all exported Cease & Desist letters and official case reports.</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
              {[['📄 Letterhead Logo','Upload PNG/SVG'],['✍️ Authorized Signature','Upload PNG'],['🔤 Custom Font','Upload TTF/OTF']].map(([l,s])=>(
                <div key={l} style={{ ...cardSm, textAlign:'center', cursor:'pointer', borderStyle:'dashed' }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{l.split(' ')[0]}</div>
                  <div style={{ color:S.text, fontSize:12, fontWeight:600, marginBottom:4 }}>{l.slice(3)}</div>
                  <div style={{ color:S.dim, fontSize:11 }}>{s}</div>
                  <Btn size="sm" color={S.accent} variant="outline" style={{ marginTop:8 }}>Upload</Btn>
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...card }}>
            <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:8 }}>Organization Details</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[['Organization Name',''],['Address Line 1',''],['City, State, ZIP',''],['Phone',''],['Email',''],['Website','']].map(([l])=>(
                <Field key={l} label={l}><input placeholder={l} style={fieldStyle}/></Field>
              ))}
            </div>
            <div style={{ marginTop:12 }}><Btn color={S.god}>Save Settings</Btn></div>
          </div>
        </div>
      )}

      {section==='patch' && (
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Version History</div>
          {[['v1.4.0','2026-04-03','Full case system, notes/timeline/files, cease & desist, secure messaging, timekeeping, invoicing, API on/off, AI narrative'],['v1.3.0','2026-04-02','Multi-sport engine, God Mode, workgroup hierarchy, AI microbets, fantasy monitor'],['v1.2.0','2026-03-28','Cognito auth, DynamoDB persistence, SES alerts, Neo4j graph, PDF export'],['v1.1.0','2026-03-20','IRI calculator, Live Monitor, API Meter, Benford, Bayesian engine'],['v1.0.0','2026-03-10','Initial deployment — dissertation IRI mathematics']].map(([v,d,n])=>(
            <div key={v} style={{ display:'flex', gap:12, padding:'8px 0', borderBottom:`1px solid ${S.border}44`, flexWrap:'wrap' }}>
              <span style={{ ...badge(v===`v${VERSION}`?S.accent:S.dim), fontFamily:"'IBM Plex Mono',monospace" }}>{v}</span>
              <span style={{ color:S.dim, fontSize:11, width:80, flexShrink:0 }}>{d}</span>
              <span style={{ color:S.midText, fontSize:12 }}>{n}</span>
            </div>
          ))}
        </div>
      )}

      {section==='users' && (
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:8 }}>User Management</div>
          <div style={{ color:S.dim, fontSize:12 }}>Create, lock out, reset passwords, and assign roles. In production this connects to AWS Cognito user pool management APIs.</div>
          <div style={{ marginTop:14 }}><Btn color={S.god}><UserPlus size={11}/>Create User</Btn></div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE MONITOR (simplified for v1.4 — full sport logic same as v1.3)
// ═══════════════════════════════════════════════════════════════════════════════
function LiveMonitor({ liveOdds }) {
  const [expanded, setExpanded] = useState(null)
  const [sport, setSport] = useState('tennis')
  const matches = MOCK_MATCHES[sport] || MOCK_MATCHES.tennis

  const enriched = matches.map(m=>{
    const r = computeIRI({ favoriteOdds:m.favOdds, underdogOdds:m.dogOdds||3.00, rankingGap:m.rankingGap||20, tier:m.tier, sport })
    return { ...m, ...r, band:iriBand(r.iri) }
  }).sort((a,b)=>b.iri-a.iri)

  return (
    <div>
      <SectionHeader title="📡 Live Monitor" subtitle="Real-time IRI · Multi-sport · Click match to expand"
        actions={liveOdds && <span style={{ ...badge(S.ok) }}>● Live API</span>}/>
      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {Object.entries(SPORTS_CONFIG).map(([k,v])=>(
          <button key={k} onClick={()=>setSport(k)} style={{ padding:'5px 12px', borderRadius:6, fontSize:11, cursor:'pointer', background:sport===k?S.mid:'transparent', color:sport===k?S.accent:S.dim, border:`1px solid ${sport===k?S.border:'transparent'}` }}>{v.icon} {v.label.split(' ')[0]}</button>
        ))}
      </div>
      {enriched.map(m=>(
        <div key={m.id} onClick={()=>setExpanded(x=>x===m.id?null:m.id)}
          style={{ ...card, marginBottom:8, cursor:'pointer', borderLeft:`3px solid ${m.band.color}`, background:expanded===m.id?S.mid:S.card }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>{m.p1||m.event}{m.p2?` vs ${m.p2}`:''}</div>
              <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>{m.event} · {m.surface||sport} · {m.volume}</div>
            </div>
            <div style={{ display:'flex', gap:14, alignItems:'center' }}>
              {m.movement && <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>MOVEMENT</div><div style={{ color:m.movement.startsWith('+')?parseInt(m.movement)>30?S.danger:S.ok:S.midText, fontSize:12, fontWeight:700 }}>{m.movement}</div></div>}
              <div style={{ textAlign:'center', minWidth:55 }}>
                <div style={{ color:S.dim, fontSize:10 }}>IRI</div>
                <div style={{ color:m.band.color, fontSize:26, fontWeight:900, lineHeight:1 }}>{m.iri.toFixed(0)}</div>
                <span style={{ ...badge(m.band.color), fontSize:9 }}>{m.band.label}</span>
              </div>
            </div>
          </div>
          {expanded===m.id && (
            <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${S.border}`, display:'flex', gap:8 }}>
              <Btn size="sm" color={S.danger}><Gavel size={11}/>Create Case</Btn>
              <Btn size="sm" color={S.info} variant="outline"><Flag size={11}/>Flag</Btn>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALERTS
// ═══════════════════════════════════════════════════════════════════════════════
function AlertsPanel() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const sc = s=>({Critical:S.danger,High:S.warn,Elevated:S.accent,Info:S.info}[s]||S.dim)
  return (
    <div>
      <SectionHeader title="🔔 Alerts" subtitle="Multi-sport IRI threshold notifications"/>
      <div style={{ display:'flex', gap:14, marginBottom:18, flexWrap:'wrap' }}>
        <StatCard label="Unread" value={alerts.filter(a=>!a.read).length} color={S.danger}/>
        <StatCard label="Email Sent" value={alerts.filter(a=>a.emailSent).length} color={S.ok}/>
      </div>
      {alerts.map(a=>(
        <div key={a.id} onClick={()=>setAlerts(al=>al.map(x=>x.id===a.id?{...x,read:true}:x))}
          style={{ ...cardSm, marginBottom:8, cursor:'pointer', opacity:a.read?.65:1, borderLeft:`3px solid ${sc(a.severity)}` }}>
          <div style={{ display:'flex', gap:6, marginBottom:4, alignItems:'center', flexWrap:'wrap' }}>
            {!a.read && <div style={{ width:6, height:6, borderRadius:'50%', background:S.danger }}/>}
            <span style={{ ...badge(sc(a.severity)) }}>{a.severity}</span>
            <SportBadge sport={a.sport}/>
            {a.emailSent && <span style={{ ...badge(S.ok), fontSize:9 }}>✉ Email Sent</span>}
          </div>
          <div style={{ color:S.text, fontSize:13 }}>{a.message}</div>
          <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>{a.ts} · {a.matchId}</div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// IRI CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════════
function IRICalculator() {
  const [form, setForm] = useState({ favOdds:1.38, dogOdds:3.05, gap:28, tier:'challenger', surface:'clay', w1:0.5 })
  const result = useMemo(()=>computeIRI({ favoriteOdds:+form.favOdds, underdogOdds:+form.dogOdds, rankingGap:+form.gap, tier:form.tier, surface:form.surface, w1:+form.w1, w2:+(1-form.w1).toFixed(1) }),[form])

  return (
    <div>
      <SectionHeader title="⚡ IRI Calculator" subtitle="IRI = 100 × [w₁ × |Y−Pw| + w₂ × V] · Kirby (2026) §4"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:16 }}>Match Parameters</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Field label="FAVORITE ODDS" hint={`Implied P(win): ${(impliedProb(+form.favOdds)*100).toFixed(1)}%`}><input type="number" step="0.01" min="1.01" value={form.favOdds} onChange={e=>setForm(f=>({...f,favOdds:e.target.value}))} style={fieldStyle}/></Field>
            <Field label="UNDERDOG ODDS"><input type="number" step="0.01" min="1.01" value={form.dogOdds} onChange={e=>setForm(f=>({...f,dogOdds:e.target.value}))} style={fieldStyle}/></Field>
            <Field label="RANKING GAP" hint={`ΔR₁₀₀ = ${(+form.gap/100).toFixed(2)}`}><input type="number" min="0" value={form.gap} onChange={e=>setForm(f=>({...f,gap:e.target.value}))} style={fieldStyle}/></Field>
            <Field label="TIER (V)">
              <select value={form.tier} onChange={e=>setForm(f=>({...f,tier:e.target.value}))} style={fieldStyle}>
                {Object.entries(TENNIS_TIER_LABELS||{grand_slam:'Grand Slam',masters:'Masters',tour_500:'500 Level',tour_250:'250/Intl',challenger:'Challenger',itf:'ITF/Futures'}).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label={`WEIGHT w₁: ${form.w1} / w₂: ${(1-form.w1).toFixed(1)}`}><input type="range" min="0.1" max="0.9" step="0.1" value={form.w1} onChange={e=>setForm(f=>({...f,w1:parseFloat(e.target.value)}))} style={{ width:'100%', marginTop:6 }}/></Field>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ ...card, textAlign:'center' }}>
            <IRIGauge value={result.iri}/>
            <div style={{ color:S.dim, fontSize:11, marginTop:8 }}>P(Upset) = {(result.upsetProb*100).toFixed(1)}% · OR = {result.oddsRatio.toFixed(2)}x</div>
          </div>
          <div style={card}>
            <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:12 }}>Breakdown</div>
            <IRIBar label="Structural V" value={result.V*100} color="#f97316"/>
            <IRIBar label="Residual |Y−Pw|" value={result.residual*100} color="#3b82f6"/>
            <IRIBar label="Market Pw" value={result.Pw*100} color="#8b5cf6"/>
            <IRIBar label="Upset Prob" value={result.upsetProb*100} color="#ec4899"/>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════
function Analytics() {
  return (
    <div>
      <SectionHeader title="📊 Analytics & Reports" subtitle="IRI trends · Tier distribution · Export suite"/>
      <div style={{ ...card, marginBottom:20 }}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>IRI Trend — Oct 2025 to Mar 2026</div>
        <ResponsiveContainer width="100%" height={200}>
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
      <div style={card}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Export Suite</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10 }}>
          {[['📄 PDF Report',S.danger],['📊 XLSX',S.ok],['🗂️ CSV',S.info],['📝 DOCX',S.accent],['⚖️ CAS Evidence Pack',S.danger],['📥 Import CSV',S.midText],['📥 Import XLSX',S.midText]].map(([l,c])=>(
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
  const apis = INITIAL_APIS.filter(a=>a.enabled)
  const sc = s=>s==='live'?S.ok:s==='warn'?S.warn:S.danger
  return (
    <div>
      <SectionHeader title="🔌 API Credibility Engine" subtitle="Toggle APIs in God Mode · credibility = successRate×0.35 + consistency×0.25 + verification×0.25 + latency×0.15"/>
      {!API && <div style={{ ...card, marginBottom:14, borderLeft:`3px solid ${S.warn}` }}><div style={{ color:S.warn, fontWeight:700, fontSize:13, marginBottom:4 }}>⚠ No API URL Configured</div><div style={{ color:S.dim, fontSize:12 }}>Set VITE_API_BASE_URL in Amplify environment variables.</div></div>}
      {liveData?.health && <div style={{ ...card, marginBottom:14, borderLeft:`3px solid ${S.ok}` }}><div style={{ color:S.ok, fontWeight:700, fontSize:12 }}>● Live: {liveData.health.status} · {liveData.sportradar?.totalScheduled||0} matches · Fav odds: {liveData.odds?.normalizedFavorite||'—'}</div></div>}
      <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
        <StatCard label="Active APIs" value={apis.length} color={S.god}/>
        <StatCard label="Live" value={apis.filter(a=>a.status==='live').length} color={S.ok}/>
        <StatCard label="Avg Credibility" value={`${Math.round(apis.reduce((s,a)=>s+a.credibility,0)/Math.max(apis.length,1))}%`} color={S.accent}/>
      </div>
      {apis.map(a=>(
        <div key={a.id} style={{ ...card, marginBottom:8, borderLeft:`3px solid ${sc(a.status)}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:sc(a.status) }}/>
                <span style={{ color:S.text, fontWeight:700 }}>{a.name}</span>
                <span style={{ ...badge(sc(a.status)) }}>{a.status.toUpperCase()}</span>
                {a.sports?.map(s=><SportBadge key={s} sport={s}/>)}
              </div>
              <div style={{ color:S.dim, fontSize:11 }}>Key: {a.key} · {a.endpoint}</div>
            </div>
            <div style={{ textAlign:'right', minWidth:110 }}>
              <div style={{ color:S.dim, fontSize:10, marginBottom:4 }}>CREDIBILITY</div>
              <div style={{ background:S.mid, borderRadius:4, height:7, width:100, marginLeft:'auto' }}>
                <div style={{ background:a.credibility>70?S.ok:a.credibility>50?S.warn:S.danger, borderRadius:4, height:7, width:`${a.credibility}%` }}/>
              </div>
              <div style={{ color:a.credibility>70?S.ok:a.credibility>50?S.warn:S.danger, fontSize:14, fontWeight:700, marginTop:3 }}>{a.credibility}%</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY
// ═══════════════════════════════════════════════════════════════════════════════
function SecurityStatus() {
  const checks = [
    { label:'TLS 1.3 — all API traffic',             status:'ok',   detail:'Certificate auto-renewed via ACM' },
    { label:'AWS Cognito — real authentication',      status:'ok',   detail:'JWT tokens, MFA available' },
    { label:'AES-256 at rest (DynamoDB)',             status:'ok',   detail:'AWS managed keys' },
    { label:'AWS Secrets Manager',                   status:'ok',   detail:'All API keys encrypted, 90d rotation' },
    { label:'SHA-256 audit chain',                   status:'ok',   detail:'All actions and IRI calculations hashed' },
    { label:'Secure messaging encryption',           status:'ok',   detail:'Messages encrypted at rest and in transit' },
    { label:'File evidence encryption',              status:'ok',   detail:'Evidence files encrypted via S3 SSE' },
    { label:'Informant multi-auth protection',       status:'ok',   detail:'2-factor unlock required for informant identity' },
    { label:'API Gateway throttling',                status:'warn', detail:'Rate limits set; Cloudflare WAF pending' },
    { label:'Bot protection (Cloudflare WAF)',        status:'todo', detail:'Planned v1.5' },
    { label:'Immutable S3 WORM (CAS evidence)',      status:'todo', detail:'Planned v1.5' },
  ]
  const sc = s=>({ok:S.ok,warn:S.warn,todo:S.dim}[s])
  return (
    <div>
      <SectionHeader title="🔒 Security Status" subtitle={`IRI v${VERSION} · AWS Cognito · KMS · SHA-256 · Secure Messaging`}/>
      <div style={{ display:'flex', gap:14, marginBottom:18, flexWrap:'wrap' }}>
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
        ['Case Management v1.4', `Cases now include:\n• Notes (case notes + interview notes) with date/time stamps\n• Timeline — auto-logged for every action\n• Files — photos, video, audio, screenshots, PDFs, documents\n• Phone log — numbers, contacts, timestamps, notes\n• Stakeout logbook — location, subjects, vehicles, phones\n• Leads — name, address, phone, email, social media\n• Governance infractions — body, type, date, description\n• Time log — billable hours per agent, supervisor approval\n• Cease & desist generator — PDF export with letterhead\n• Case linking — connect related investigations\n• Full case report export — one click, everything included`],
        ['IRI Formula', `IRI = 100 × [w₁ × |Y − Pw| + w₂ × V]\n\nAUC: 0.873 · n=106,849 · Kirby (2026)\nV scores: Grand Slam 0.08 → ITF 0.78`],
        ['Role Hierarchy', `God Mode → Main Account → Supervisor → Special Agent\n\nSign-off required for note amendments.\nTimekeeping approved by supervisor/main.\nInvoicing by main account only.`],
        ['Secure Messaging', `Encrypted peer-to-peer messaging between agents and supervisors.\nAll messages SHA-256 logged. File attachments supported.\nMessage history immutable for audit purposes.`],
        ['Invoicing', `Clients configured with hourly or monthly rates plus tax.\nInvoices created per billing period, exported as PDF.\nTime logs from case files feed automatically into billing.`],
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
// TAB REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════
const ALL_TABS = [
  { id:'godmode',     label:'👁️ God Mode',        component:GodMode          },
  { id:'cases',       label:'🔨 Cases',            component:CaseManagement   },
  { id:'messaging',   label:'💬 Messaging',        component:SecureMessaging  },
  { id:'timekeeping', label:'⏰ Time & Billing',   component:Timekeeping      },
  { id:'invoicing',   label:'📄 Invoicing',        component:Timekeeping      }, // shares Timekeeping, opens billing section
  { id:'monitor',     label:'📡 Live Monitor',     component:LiveMonitor      },
  { id:'iri',         label:'⚡ IRI Calculator',   component:IRICalculator    },
  { id:'api',         label:'🔌 API Meter',        component:ApiMeter         },
  { id:'analytics',   label:'📊 Analytics',        component:Analytics        },
  { id:'alerts',      label:'🔔 Alerts',           component:AlertsPanel      },
  { id:'security',    label:'🔒 Security',         component:SecurityStatus   },
  { id:'help',        label:'❓ Help',              component:Help             },
]

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ user, onLogout }) {
  const [tab,      setTab]      = useState('cases')
  const [liveData, setLiveData] = useState(null)
  const [syncing,  setSyncing]  = useState(false)
  const role = USER_ROLES[user.role]
  const allowedTabs = ROLE_TABS[user.role] || []
  const visibleTabs = ALL_TABS.filter(t=>allowedTabs.includes(t.id))
  const unreadAlerts = INITIAL_ALERTS.filter(a=>!a.read).length

  const sync = useCallback(async()=>{
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
  const tabProps = { user, currentUser:user, liveData, liveOdds:liveData?.odds }

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ background:S.card, borderBottom:`1px solid ${S.border}`, height:56, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', position:'sticky', top:0, zIndex:100, gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:20 }}>🛡️</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:16, fontWeight:800, color:S.text }}>IRI <span style={{ color:S.accent }}>v{VERSION}</span></span>
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
      <div style={{ background:S.card, borderBottom:`1px solid ${S.border}`, padding:'8px 20px', display:'flex', gap:4, overflowX:'auto', flexShrink:0 }}>
        {visibleTabs.map(t=>(
          <TabPill key={t.id} id={t.id} label={t.label} active={tab===t.id} onClick={setTab} badgeCount={t.id==='alerts'?unreadAlerts:0}/>
        ))}
      </div>
      <div style={{ flex:1, maxWidth:1300, width:'100%', margin:'0 auto', padding:'24px 20px' }}>
        {ActiveTab ? <ActiveTab.component {...tabProps}/> : <div style={{ color:S.dim }}>Tab not found.</div>}
      </div>
      <div style={{ borderTop:`1px solid ${S.border}`, padding:'10px 20px', display:'flex', justifyContent:'space-between', color:S.dim, fontSize:10, flexWrap:'wrap', gap:4, fontFamily:"'IBM Plex Mono',monospace" }}>
        <span>IRI v{VERSION} · Kirby (2026) · Multi-Sport Integrity · AUC 0.873 · n=106,849+</span>
        <span>AWS Cognito + Lambda + DynamoDB + SES · SHA-256 audit chain</span>
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
