import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { LineChart, Line, AreaChart, Area, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { LogOut, Search, Plus, Send, Download, Flag, Gavel, CheckCircle2, FileText, Eye, Link, Clock, Paperclip, RefreshCw, Trash2, RotateCcw, Users, Settings, Lock, Shield, Database, Zap, Moon, Sun } from 'lucide-react'

import { authenticate, loadSession, clearSession, getAuthLog, loadAllUsers, createUser, updateUser, setPassword, freezeUser, unfreezeUser, deleteUser, sha256, ALL_ROLES, ALL_SPORTS } from './utils/auth.js'
import { loadCases, saveCases, addCase, updateCase as storeUpdateCase, archiveCase, loadArchivedCases, restoreCase, purgeArchivedCase, loadClients, saveClients, addClient, updateClient, deleteClient, loadInvoices, saveInvoices, addInvoice, updateInvoice, loadMessages, saveMessages, loadAlerts, saveAlerts, loadApis, saveApis, loadDismissed, saveDismissed, loadSettings, saveSettings, loadRetention, saveRetention, exportBackup, importBackup, clearAllAppData, setInformantPin, loadSandboxAccounts, isSandboxUser, loadLiveMode, getCaseROI } from './utils/store.js'
import { exportCasePDF, exportCaseDOCX, exportCaseExcel, exportInvoicePDF, exportInvoiceDOCX, exportInvoiceExcel, exportAllCasesExcel, exportAllInvoicesExcel, exportRevenueReportPDF } from './utils/export.js'
import { VERSION, computeIRI, iriBand, impliedProb, detectShock, computeContextualIRI, checkFalsePositive, bayesianUpdate, detectCommunities, fingerprintSyndicate, computeLiquidityStress, analyzePatternOfLife, predictFutureRisk, blindHash, TIER_V, SPORTS_CONFIG, rosettaNormalize } from './utils/iri.js'
import { ROLE_TABS, TRIAGE_ITEMS, NETWORK_NODES, NETWORK_EDGES, MOCK_MATCHES, CHRONO_MATCH, FININT_DATA, OVERWATCH_ALERTS, PREDICTIVE_SUBJECTS, DECONFLICT_REGISTRY, INITIAL_APIS, TREND_DATA, OMNIBAR_EXAMPLES } from './utils/data.js'
import { S, card, cardSm, badge, Btn, SectionHeader, StatCard, IRIBar, IRIGauge, TabPill, Field, fieldStyle, textareaStyle, Toggle, SportBadge, OverwatchBadge, ShockBadge, TimelineEntry, MessageBubble, Modal, ExportMenu } from './components/UI.jsx'
import { NexusGraph, ChronoEngine, FinintLayer, OverwatchEngine, PredictiveModeling, DeconflictionEngine, IRICalculator, LiveMonitor } from './components/Intelligence.jsx'
import { InformantModule, AINarrative, BankStatementIngestion, KeyDiscovery, TrackerSystem, DossierModule, CeaseAndDesist } from './components/Investigation.jsx'
import { SandboxManager, FeaturesAPIMenu, SportsAPIMenu, DataPointSelector, WorkgroupBoard } from './components/GodModeExtended.jsx'
import { RosterModule } from './components/Roster.jsx'
import { KnownAssociates, SharpBettors } from './components/Associates.jsx'
import AdvancedModules from './components/Advanced.jsx'

const API   = (typeof window !== 'undefined' && window.APP_CONFIG?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/,'')
const ts    = () => new Date().toISOString().slice(0,16).replace('T',' ')
const uid   = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5)
const sevC  = { Critical:S.danger, High:S.warn, Medium:S.accent, Low:S.ok }

// ═══════════════════════════════════════════════════════════════════════════════
// OMNIBAR
// ═══════════════════════════════════════════════════════════════════════════════
function OmniBar({ onClose, onNavigate }) {
  const [q, setQ] = useState(''), [result, setR] = useState(null)
  const ref = useRef(null)
  useEffect(()=>ref.current?.focus(),[])
  const process = (query) => {
    const ql = query.toLowerCase()
    if (ql.includes('high-iri')||ql.includes('critical')) setR({ title:'High-IRI Matches', items:[{label:'ITF Market Alert A',value:'IRI: 94',color:S.danger},{label:'NFL Prop Alert',value:'IRI: 88',color:S.danger}] })
    else if (ql.includes('syndicate')||ql.includes('cluster')) setR({ title:'Cluster Intelligence', items:FININT_DATA.syndicates.map(s=>({label:s.label,value:`${s.confidence}% conf`,color:s.color})) })
    else if (ql.includes('pre-match')||ql.includes('alert')) setR({ title:'Pre-Match Alerts', items:OVERWATCH_ALERTS.filter(a=>a.preMatch).map(a=>({label:`${a.match} — ${a.event}`,value:`${a.hoursToStart}h · IRI: ${a.iriScore}`,color:a.level==='Black'?'#a855f7':S.danger})) })
    else if (ql.includes('predict')||ql.includes('risk')) setR({ title:'Highest Predicted Risk', items:PREDICTIVE_SUBJECTS.slice(0,4).map(s=>({label:s.name,value:`Risk Profile IRI: ${s.recentIRI[s.recentIRI.length-1]}`,color:S.warn})) })
    else setR({ title:'Query processed', items:[{label:'Try: "high-IRI matches", "cluster members", "pre-match alerts"',value:'',color:S.dim}] })
  }
  return (
    <div style={{ position:'fixed',inset:0,background:'#000000cc',zIndex:2000,display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:100 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:S.card,border:`1px solid ${S.accent}44`,borderRadius:14,width:'100%',maxWidth:640,boxShadow:`0 0 60px ${S.accent}22` }}>
        <div style={{ display:'flex',alignItems:'center',gap:12,padding:'13px 18px',borderBottom:result?`1px solid ${S.border}`:'none' }}>
          <Search size={17} color={S.accent}/>
          <input ref={ref} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&q.trim())process(q);if(e.key==='Escape')onClose()}} placeholder="Natural language query — 'high-IRI matches', 'cluster members', 'pre-match alerts'…" style={{ ...fieldStyle,border:'none',background:'transparent',fontSize:14,flex:1 }}/>
          <kbd style={{ color:S.dim,fontSize:10,background:S.mid,padding:'2px 6px',borderRadius:4 }}>ESC</kbd>
        </div>
        {!q && <div style={{ padding:'12px 18px' }}><div style={{ color:S.dim,fontSize:11,marginBottom:8 }}>EXAMPLES</div>{OMNIBAR_EXAMPLES.slice(0,5).map(ex=><div key={ex} onClick={()=>{setQ(ex);process(ex)}} style={{ color:S.midText,fontSize:12,padding:'6px 8px',borderRadius:6,cursor:'pointer' }} onMouseEnter={e=>e.target.style.background=S.mid} onMouseLeave={e=>e.target.style.background='transparent'}>↗ {ex}</div>)}</div>}
        {result && <div style={{ padding:'14px 18px' }}><div style={{ color:S.accent,fontSize:13,fontWeight:700,marginBottom:10 }}>{result.title}</div>{result.items.map((item,i)=><div key={i} style={{ display:'flex',justifyContent:'space-between',padding:'8px 10px',borderRadius:8,background:S.mid,marginBottom:4 }}><span style={{ color:S.text,fontSize:13 }}>{item.label}</span><span style={{ color:item.color,fontSize:12,fontWeight:600 }}>{item.value}</span></div>)}</div>}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [form,setForm] = useState({username:'',password:''})
  const [err,setErr]   = useState('')
  const [loading,setL] = useState(false)
  const submit = async () => {
    setErr(''); if(!form.username.trim()||!form.password){setErr('Username and password required.');return}
    setL(true)
    const r = await authenticate(form.username, form.password)
    setL(false)
    if (r.success) onLogin(r.user)
    else { setErr(r.error); setForm(f=>({...f,password:''})) }
  }
  return (
    <div style={{ minHeight:'100vh',background:S.bg,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden' }}>
      <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(#1e2d4022 1px,transparent 1px),linear-gradient(90deg,#1e2d4022 1px,transparent 1px)',backgroundSize:'36px 36px',opacity:.5 }}/>
      <div style={{ ...card,width:420,maxWidth:'95vw',position:'relative',zIndex:1,boxShadow:'0 0 80px #a855f718' }}>
        <div style={{ textAlign:'center',marginBottom:26 }}>
          <div style={{ fontSize:36,marginBottom:10 }}>🛡️</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:800,color:S.text }}>IRI <span style={{ color:S.accent }}>v{VERSION}</span></div>
          <div style={{ color:S.dim,fontSize:12,marginTop:4 }}>Integrity Intelligence OS — Secure Access</div>
        </div>
        {err && <div style={{ background:'#7f1d1d33',border:`1px solid #ef444444`,color:S.danger,padding:'10px 14px',borderRadius:8,fontSize:12,marginBottom:14 }}>🔒 {err}</div>}
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <Field label="USERNAME"><input value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))} placeholder="Username" style={fieldStyle} autoComplete="username" autoFocus onKeyDown={e=>e.key==='Enter'&&submit()}/></Field>
          <Field label="PASSWORD"><input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Password" style={fieldStyle} autoComplete="current-password" onKeyDown={e=>e.key==='Enter'&&submit()}/></Field>
          <Btn onClick={submit} disabled={loading} color={S.accent} size="lg" style={{ width:'100%',justifyContent:'center',marginTop:4 }}>{loading?'🔄 Authenticating…':'🔐 Sign In'}</Btn>
        </div>
        <div style={{ textAlign:'center',marginTop:16,color:S.dim,fontSize:10,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.8 }}>SHA-256 · 8-hour session · Audit logged<br/>Default: IntegrityChief / IntegrityConf24!</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOD MODE — Full user management + role impersonation + system settings
// ═══════════════════════════════════════════════════════════════════════════════
function GodMode({ user, onImpersonate, onStopImpersonate, isImpersonating, impersonatedRole }) {
  const [section,  setSection]  = useState('users')
  const [users,    setUsers]    = useState(loadAllUsers)
  const [apis,     setApis]     = useState(()=>loadApis(INITIAL_APIS))
  const [settings, setSettings] = useState(loadSettings)
  const [retention,setRetention]= useState(loadRetention)
  const [showAdd,  setShowAdd]  = useState(false)
  const [showEdit, setShowEdit] = useState(null)  // user being edited
  const [showPw,   setShowPw]   = useState(null)  // user for pw reset
  const [newPw,    setNewPw]    = useState('')
  const [newUser,  setNewUser]  = useState({ username:'',password:'',confirmPw:'',role:'special_agent',displayName:'',email:'',sports:ALL_SPORTS.map(s=>s.id),notes:'' })
  const [msg,      setMsg]      = useState('')

  const refresh = () => setUsers(loadAllUsers())

  const handleCreate = async () => {
    if (newUser.password !== newUser.confirmPw) { setMsg('Passwords do not match.'); return }
    const r = await createUser(newUser)
    if (r.success) { refresh(); setShowAdd(false); setMsg(''); setNewUser({username:'',password:'',confirmPw:'',role:'special_agent',displayName:'',email:'',sports:ALL_SPORTS.map(s=>s.id),notes:''}) }
    else setMsg(r.error)
  }

  const handleSetPw = async () => {
    const r = await setPassword(showPw.id, newPw)
    if (r.success) { refresh(); setShowPw(null); setNewPw('') }
    else setMsg(r.error)
  }

  const handleSetInformantPin = async (u) => {
    const pin = prompt(`Set Informant Module PIN for ${u.username} (4-8 digits):`)
    if (!pin || pin.length < 4) return
    setInformantPin(u.id, pin)
    setMsg(`Informant PIN set for ${u.username}`)
  }

  const handleFreeze = async (u) => {
    if (u.frozen) await unfreezeUser(u.id); else await freezeUser(u.id)
    refresh()
  }

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete ${u.username}? This cannot be undone.`)) return
    await deleteUser(u.id); refresh()
  }

  const handleSaveEdit = async () => {
    await updateUser(showEdit.id, { role:showEdit.role, displayName:showEdit.displayName, email:showEdit.email, sports:showEdit.sports, notes:showEdit.notes })
    refresh(); setShowEdit(null)
  }

  const toggleApi = (id) => {
    const next = apis.map(a=>a.id===id?{...a,enabled:!a.enabled,status:!a.enabled?'live':'warn'}:a)
    setApis(next); saveApis(next)
  }

  const saveSets = () => { saveSettings(settings); setMsg('Settings saved.') }
  const saveRet  = () => { saveRetention(retention); setMsg('Retention policy saved.') }

  const sc = s => s==='live'?S.ok:s==='warn'?S.warn:S.danger
  const roleColor = r => ALL_ROLES[r]?.color || S.dim

  return (
    <div>
      <SectionHeader title="👁️ God Mode — Integrity Chief Console" subtitle={`IRI v${VERSION} · Full system control · Operator: ${user.displayName}`}/>

      {/* ── Role View Switcher — persistent dropdown ── */}
      <div style={{ ...card,marginBottom:16,borderColor:'#a855f744',background:'#0d0014',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12 }}>
        <div>
          <div style={{ color:'#a855f7',fontSize:12,fontWeight:700,marginBottom:2 }}>👁️ ROLE VIEW SWITCHER</div>
          <div style={{ color:S.dim,fontSize:11 }}>See the platform exactly as any role — tabs, permissions, and data scope all reflect that user's access</div>
        </div>
        <div style={{ display:'flex',gap:8,alignItems:'center',flexWrap:'wrap' }}>
          <select
            value={impersonatedRole||''}
            onChange={e=>{ const v=e.target.value; if(v)onImpersonate(v); else onStopImpersonate() }}
            style={{ ...fieldStyle,minWidth:220,background:'#1a0a2e',borderColor:'#a855f7',color:impersonatedRole?ALL_ROLES[impersonatedRole]?.color:S.dim,fontWeight:700,fontSize:13 }}>
            <option value="">— View as God Mode (default) —</option>
            {Object.entries(ALL_ROLES).filter(([k])=>k!=='god').map(([k,v])=>(
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
          {impersonatedRole && (
            <Btn size="sm" color={S.danger} onClick={onStopImpersonate}>✕ Exit</Btn>
          )}
        </div>
        {impersonatedRole && (
          <div style={{ width:'100%',background:'#a855f711',borderRadius:6,padding:'6px 10px',border:`1px solid #a855f733` }}>
            <span style={{ color:'#a855f7',fontSize:11,fontWeight:700 }}>Now viewing as: {ALL_ROLES[impersonatedRole]?.icon} {ALL_ROLES[impersonatedRole]?.label}</span>
            <span style={{ color:S.dim,fontSize:11 }}> — navigate to any tab to see that role's view. Return here to switch roles or exit.</span>
          </div>
        )}
      </div>

      <div style={{ display:'flex',gap:6,marginBottom:18,flexWrap:'wrap' }}>
        {[['users','👤 Users'],['apis','🔌 APIs'],['settings','⚙️ Settings'],['retention','🗄️ Retention'],['sandbox','🧪 Sandbox/Live'],['featureapis','🔌 Features API'],['sportsapis','⚽ Sports API'],['datapoints','📡 Data Points'],['audit','📋 Audit Log'],['backup','💾 Backup'],['patch','🔧 Version']].map(([id,l])=>(
          <button key={id} onClick={()=>setSection(id)} style={{ padding:'7px 14px',borderRadius:6,fontSize:12,cursor:'pointer',background:section===id?S.mid:'transparent',color:section===id?S.god:S.dim,border:`1px solid ${section===id?S.god+'44':'transparent'}`,fontWeight:section===id?700:400 }}>{l}</button>
        ))}
      </div>
      {msg && <div style={{ ...cardSm,borderLeft:`3px solid ${S.ok}`,marginBottom:14,color:S.ok,fontSize:12 }}>{msg}<button onClick={()=>setMsg('')} style={{ float:'right',background:'none',border:'none',cursor:'pointer',color:S.dim }}>×</button></div>}

      {/* ── USERS ── */}
      {section==='users' && (
        <div>
          <div style={{ display:'flex',gap:14,marginBottom:16,flexWrap:'wrap' }}>
            <StatCard label="Total Users" value={users.length}/>
            <StatCard label="Active" value={users.filter(u=>u.active&&!u.frozen).length} color={S.ok}/>
            <StatCard label="Frozen" value={users.filter(u=>u.frozen).length} color={S.danger}/>
          </div>
          <Btn color={S.god} style={{ marginBottom:16 }} onClick={()=>setShowAdd(true)}><Plus size={11}/>Add User</Btn>
          {users.map(u=>(
            <div key={u.id} style={{ ...card,marginBottom:10,borderLeft:`3px solid ${roleColor(u.role)}`,opacity:u.frozen?.6:1 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
                <div>
                  <div style={{ display:'flex',gap:8,alignItems:'center',marginBottom:4,flexWrap:'wrap' }}>
                    <span style={{ color:S.text,fontSize:14,fontWeight:700 }}>{u.username}</span>
                    <span style={{ ...badge(roleColor(u.role)),fontSize:10 }}>{ALL_ROLES[u.role]?.icon} {ALL_ROLES[u.role]?.label}</span>
                    {u.frozen && <span style={{ ...badge(S.danger),fontSize:9 }}>🔒 FROZEN</span>}
                    {!u.active&&!u.frozen && <span style={{ ...badge(S.dim),fontSize:9 }}>INACTIVE</span>}
                  </div>
                  <div style={{ color:S.dim,fontSize:11 }}>{u.displayName} {u.email&&`· ${u.email}`} · Last login: {u.lastLogin?new Date(u.lastLogin).toLocaleDateString():'Never'}</div>
                  <div style={{ marginTop:4,display:'flex',gap:4,flexWrap:'wrap' }}>
                    {(u.sports||[]).slice(0,6).map(s=><SportBadge key={s} sport={s}/>)}
                    {(u.sports||[]).length>6 && <span style={{ color:S.dim,fontSize:10 }}>+{u.sports.length-6} more</span>}
                  </div>
                </div>
                <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                  <Btn size="sm" color={S.info} variant="outline" onClick={()=>setShowEdit({...u})}><Settings size={10}/>Edit</Btn>
                  <Btn size="sm" color={S.warn} variant="outline" onClick={()=>{setShowPw(u);setNewPw('')}}><Lock size={10}/>Password</Btn>
                  <Btn size="sm" color={u.frozen?S.ok:S.danger} variant="outline" onClick={()=>handleFreeze(u)}>{u.frozen?'Unfreeze':'🔒 Freeze'}</Btn>
                  {u.role!=='god' && <Btn size="sm" color={S.danger} variant="outline" onClick={()=>handleDelete(u)}><Trash2 size={10}/>Delete</Btn>}
                </div>
              </div>
            </div>
          ))}

          {/* Add user modal */}
          <Modal open={showAdd} onClose={()=>{setShowAdd(false);setMsg('')}} title="Add New User" width={700}>
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <Field label="USERNAME" required><input value={newUser.username} onChange={e=>setNewUser(n=>({...n,username:e.target.value}))} placeholder="login.name" style={fieldStyle}/></Field>
                <Field label="DISPLAY NAME"><input value={newUser.displayName} onChange={e=>setNewUser(n=>({...n,displayName:e.target.value}))} placeholder="Full Name" style={fieldStyle}/></Field>
                <Field label="EMAIL"><input type="email" value={newUser.email} onChange={e=>setNewUser(n=>({...n,email:e.target.value}))} placeholder="user@org.com" style={fieldStyle}/></Field>
                <Field label="ROLE">
                  <select value={newUser.role} onChange={e=>setNewUser(n=>({...n,role:e.target.value}))} style={fieldStyle}>
                    {Object.entries(ALL_ROLES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </Field>
                <Field label="PASSWORD (8+ CHARS)" required><input type="password" value={newUser.password} onChange={e=>setNewUser(n=>({...n,password:e.target.value}))} placeholder="Password" style={fieldStyle}/></Field>
                <Field label="CONFIRM PASSWORD" required><input type="password" value={newUser.confirmPw} onChange={e=>setNewUser(n=>({...n,confirmPw:e.target.value}))} placeholder="Confirm password" style={fieldStyle}/></Field>
              </div>
              <Field label="SPORTS ACCESS (deselect to restrict)">
                <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginTop:4 }}>
                  {ALL_SPORTS.map(s=>{
                    const on = newUser.sports.includes(s.id)
                    return <button key={s.id} onClick={()=>setNewUser(n=>({...n,sports:on?n.sports.filter(x=>x!==s.id):[...n.sports,s.id]}))} style={{ padding:'4px 10px',borderRadius:4,fontSize:11,cursor:'pointer',background:on?s.id==='tennis'?'#22c55e22':S.mid+'88':'transparent',color:on?S.text:S.dim,border:`1px solid ${on?S.border:'transparent'}` }}>{s.icon} {s.label}</button>
                  })}
                </div>
              </Field>
              <Field label="NOTES"><textarea value={newUser.notes} onChange={e=>setNewUser(n=>({...n,notes:e.target.value}))} placeholder="Account notes…" style={{ ...textareaStyle,minHeight:60 }}/></Field>
              {msg && <div style={{ color:S.danger,fontSize:12 }}>{msg}</div>}
              <div style={{ display:'flex',gap:8 }}><Btn color={S.god} onClick={handleCreate}><Plus size={10}/>Create User</Btn><Btn color={S.dim} variant="outline" onClick={()=>setShowAdd(false)}>Cancel</Btn></div>
            </div>
          </Modal>

          {/* Edit user modal */}
          {showEdit && <Modal open={!!showEdit} onClose={()=>setShowEdit(null)} title={`Edit — ${showEdit.username}`} width={700}>
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <Field label="DISPLAY NAME"><input value={showEdit.displayName} onChange={e=>setShowEdit(s=>({...s,displayName:e.target.value}))} style={fieldStyle}/></Field>
                <Field label="EMAIL"><input value={showEdit.email} onChange={e=>setShowEdit(s=>({...s,email:e.target.value}))} style={fieldStyle}/></Field>
                <Field label="ROLE">
                  <select value={showEdit.role} onChange={e=>setShowEdit(s=>({...s,role:e.target.value}))} style={fieldStyle}>
                    {Object.entries(ALL_ROLES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="SPORTS ACCESS">
                <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginTop:4 }}>
                  {ALL_SPORTS.map(s=>{
                    const on = (showEdit.sports||[]).includes(s.id)
                    return <button key={s.id} onClick={()=>setShowEdit(e=>({...e,sports:on?e.sports.filter(x=>x!==s.id):[...(e.sports||[]),s.id]}))} style={{ padding:'4px 10px',borderRadius:4,fontSize:11,cursor:'pointer',background:on?S.mid:'transparent',color:on?S.text:S.dim,border:`1px solid ${on?S.border:'transparent'}` }}>{s.icon} {s.label}</button>
                  })}
                </div>
              </Field>
              <Field label="NOTES"><textarea value={showEdit.notes||''} onChange={e=>setShowEdit(s=>({...s,notes:e.target.value}))} style={{ ...textareaStyle,minHeight:60 }}/></Field>
              <div style={{ display:'flex',gap:8 }}><Btn color={S.god} onClick={handleSaveEdit}><CheckCircle2 size={10}/>Save Changes</Btn><Btn color={S.dim} variant="outline" onClick={()=>setShowEdit(null)}>Cancel</Btn></div>
            </div>
          </Modal>}

          {/* Password reset modal */}
          {showPw && <Modal open={!!showPw} onClose={()=>setShowPw(null)} title={`Reset Password — ${showPw.username}`}>
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <Field label="NEW PASSWORD (8+ CHARACTERS)"><input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="New password" style={fieldStyle} autoFocus onKeyDown={e=>e.key==='Enter'&&handleSetPw()}/></Field>
              {msg && <div style={{ color:S.danger,fontSize:12 }}>{msg}</div>}
              <div style={{ display:'flex',gap:8 }}><Btn color={S.warn} onClick={handleSetPw}><Lock size={10}/>Set Password</Btn><Btn color={S.dim} variant="outline" onClick={()=>setShowPw(null)}>Cancel</Btn></div>
            </div>
          </Modal>}
        </div>
      )}

      {section==='sandbox'     && <SandboxManager currentUser={user}/>}
      {section==='featureapis' && <FeaturesAPIMenu/>}
      {section==='sportsapis'  && <SportsAPIMenu/>}
      {section==='datapoints'  && <DataPointSelector user={user}/>}

      {/* ── APIs ── */}
      {section==='apis' && (
        <div>
          {apis.map(a=>(
            <div key={a.id} style={{ ...card,marginBottom:8,borderLeft:`3px solid ${a.enabled?sc(a.status):S.dim}`,opacity:a.enabled?1:.6 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
                <div>
                  <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
                    <div style={{ width:7,height:7,borderRadius:'50%',background:a.enabled?sc(a.status):S.dim }}/>
                    <span style={{ color:S.text,fontWeight:700 }}>{a.name}</span>
                    <span style={{ ...badge(a.enabled?sc(a.status):S.dim) }}>{a.enabled?a.status.toUpperCase():'DISABLED'}</span>
                    {a.sports?.map(s=><SportBadge key={s} sport={s}/>)}
                  </div>
                  <div style={{ color:S.dim,fontSize:11,marginTop:2 }}>Key: {a.key} · {a.endpoint} · Credibility: {a.credibility}%</div>
                </div>
                <Toggle on={a.enabled} onChange={()=>toggleApi(a.id)} color={S.ok}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SETTINGS ── */}
      {section==='settings' && (
        <div>
          <div style={{ ...card,marginBottom:16 }}>
            <div style={{ color:S.text,fontSize:14,fontWeight:700,marginBottom:14 }}>Organization Settings</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
              {[['orgName','Organization Name'],['orgAddress','Address'],['orgPhone','Phone'],['orgEmail','Email'],['orgWebsite','Website'],['taxIdLabel','Tax ID Label'],['taxId','Tax ID / EIN'],['currency','Currency (USD/EUR/GBP)'],['invoicePrefix','Invoice # Prefix'],['casePrefix','Case # Prefix'],['signatory','Signatory Name'],['signatoryTitle','Signatory Title'],['signatoryEmail','Signatory Email']].map(([k,l])=>(
                <Field key={k} label={l}><input value={settings[k]||''} onChange={e=>setSettings(s=>({...s,[k]:e.target.value}))} style={fieldStyle}/></Field>
              ))}
            </div>
            <Field label="FOOTER TEXT (on exports)"><input value={settings.footerText||''} onChange={e=>setSettings(s=>({...s,footerText:e.target.value}))} style={{ ...fieldStyle,marginTop:12 }}/></Field>
            <div style={{ marginTop:14 }}><Btn color={S.god} onClick={saveSets}><CheckCircle2 size={10}/>Save Settings</Btn></div>
          </div>
        </div>
      )}

      {/* ── RETENTION ── */}
      {section==='retention' && (
        <div>
          <div style={{ ...card,marginBottom:14,borderLeft:`3px solid ${S.info}` }}>
            <div style={{ color:S.info,fontSize:12,fontWeight:700,marginBottom:6 }}>RECORDS RETENTION POLICY</div>
            <div style={{ color:S.dim,fontSize:12 }}>Define how long different record types are kept before archival or purge. These settings apply to future auto-archival runs.</div>
          </div>
          <div style={{ ...card }}>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
              {[['casesMonths','Case Records (months)'],['invoicesMonths','Invoice Records (months)'],['messagesMonths','Secure Messages (months)'],['alertsMonths','Alert History (months)'],['auditMonths','Audit Log (months)'],['evidenceYears','Evidence Files (years)'],['archiveAfterDays','Auto-archive cases after (days)']].map(([k,l])=>(
                <Field key={k} label={l}><input type="number" value={retention[k]||0} onChange={e=>setRetention(r=>({...r,[k]:parseInt(e.target.value)||0}))} style={fieldStyle}/></Field>
              ))}
            </div>
            <div style={{ marginTop:14 }}>
              <Toggle on={retention.autoArchive} onChange={v=>setRetention(r=>({...r,autoArchive:v}))} label="Enable automatic case archival"/>
            </div>
            <div style={{ marginTop:14,display:'flex',gap:8 }}>
              <Btn color={S.god} onClick={saveRet}><CheckCircle2 size={10}/>Save Retention Policy</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── AUDIT LOG ── */}
      {section==='audit' && (
        <div>
          <div style={{ color:S.text,fontSize:14,fontWeight:700,marginBottom:12 }}>Authentication Audit Log</div>
          {getAuthLog().slice(0,50).map((entry,i)=>(
            <div key={i} style={{ ...cardSm,marginBottom:6,borderLeft:`3px solid ${entry.success?S.ok:S.danger}` }}>
              <div style={{ display:'flex',justifyContent:'space-between',gap:12 }}>
                <div><span style={{ color:S.text,fontSize:12,fontWeight:600 }}>{entry.username}</span> <span style={{ color:S.dim,fontSize:11 }}>{entry.event}</span></div>
                <div style={{ display:'flex',gap:8 }}>
                  <span style={{ ...badge(entry.success?S.ok:S.danger),fontSize:9 }}>{entry.success?'SUCCESS':'FAIL'}</span>
                  <span style={{ color:S.dim,fontSize:10,fontFamily:"'IBM Plex Mono',monospace" }}>{entry.ts?.slice(0,16)}</span>
                </div>
              </div>
            </div>
          ))}
          {getAuthLog().length===0 && <div style={{ color:S.dim,fontSize:12 }}>No auth events logged yet.</div>}
        </div>
      )}

      {/* ── BACKUP ── */}
      {section==='backup' && (
        <div style={card}>
          <div style={{ color:S.text,fontSize:14,fontWeight:700,marginBottom:12 }}>Data Backup & Restore</div>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            <Btn color={S.ok} onClick={exportBackup}><Download size={11}/>Export Full Backup (JSON)</Btn>
            <div style={{ color:S.dim,fontSize:11 }}>Exports all cases, clients, invoices, messages, settings as a JSON file you can store securely.</div>
            <div style={{ borderTop:`1px solid ${S.border}`,paddingTop:10,marginTop:6 }}>
              <Field label="RESTORE FROM BACKUP">
                <input type="file" accept=".json" onChange={e=>{ const f=e.target.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=ev=>{const res=importBackup(ev.target.result);setMsg(res.success?'Backup restored successfully.':'Restore failed: '+res.error)}; r.readAsText(f) }} style={{ ...fieldStyle,padding:'8px' }}/>
              </Field>
            </div>
            <div style={{ borderTop:`1px solid ${S.border}`,paddingTop:10,marginTop:6 }}>
              <div style={{ color:S.danger,fontSize:12,fontWeight:700,marginBottom:8 }}>⚠ Danger Zone</div>
              <Btn color={S.danger} variant="outline" onClick={()=>{ if(window.confirm('Clear ALL application data? This cannot be undone.'))clearAllAppData() }}><Trash2 size={10}/>Clear All Application Data</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── PATCH ── */}
      {section==='patch' && (
        <div style={card}>
          <div style={{ color:S.text,fontSize:14,fontWeight:700,marginBottom:12 }}>Version History</div>
          {[
            [`v${VERSION}`,'2026-04-04','Sandbox/Live Mode · Roster Scroll with tracker placement · Known Associates (Nexus-linked) · Sharp Bettors · Advanced modules (Audio, NLP, Psychographic, Heatmap, Integrity Curve, ALPR, IMSI, Geofencing, Crypto, Shell, Botnet) · API Meter restored · Overwatch Auto-Case wired · Stakeout→Case creation · Manual timestamps on notes · History tab · ROI per case · Revenue by sport · Cricket/Esports/LIV Golf · Dark mode toggle · Workgroup board · Features API menu · Sports API menu · Data Point selector'],
            ['v1.5.2','2026-04-04','All 6 intelligence modules live (no placeholders) · God Mode role impersonation dropdown · Runtime guard for permanent modules'],
            ['v1.5.1','2026-04-04','Real user management · DOCX/PDF/Excel exports · Fresh start · Billing overhaul · Records retention · Sport permissions · Role impersonation'],
            ['v1.5.0','2026-04-03','Intelligence OS: Nexus Graph 2.0, Chrono Engine, FININT, Overwatch, Predictive, Deconfliction, OmniBar, Rosetta Engine'],
            ['v1.4.0','2026-04-02','Full case system 9-tab, secure messaging, timekeeping, invoicing, API toggle'],
            ['v1.0.0','2026-03-10','Initial — dissertation IRI mathematics'],
          ].map(([v,d,n])=>(
            <div key={v} style={{ display:'flex',gap:12,padding:'8px 0',borderBottom:`1px solid ${S.border}44`,flexWrap:'wrap' }}>
              <span style={{ ...badge(v===`v${VERSION}`?S.accent:S.dim),fontFamily:"'IBM Plex Mono',monospace" }}>{v}</span>
              <span style={{ color:S.dim,fontSize:11,width:80,flexShrink:0 }}>{d}</span>
              <span style={{ color:S.midText,fontSize:12 }}>{n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CASE MANAGEMENT — Full 9-tab system + more actions + case recovery
// ═══════════════════════════════════════════════════════════════════════════════
function CaseManagement({ user, settings }) {
  const [cases,       setCasesState] = useState(loadCases)
  const [archived,    setArchived]   = useState(loadArchivedCases)
  const [activeCase,  setActiveCase] = useState(null)
  const [activeTab,   setTab]        = useState('overview')
  const [showNew,     setShowNew]    = useState(false)
  const [showRecover, setShowRecover]= useState(false)
  const [filterStatus,setFilter]     = useState('all')
  const [searchQ,     setSearch]     = useState('')
  const [showNewNote, setShowNote]   = useState(false)
  const [showStakeout,setShowSO]     = useState(false)
  const [showLead,    setShowLead]   = useState(false)
  const [showInfraction,setShowInf] = useState(false)
  const [showActions, setShowAct]    = useState(false)
  const [noteForm,    setNoteForm]   = useState({ type:'case_note',text:'',internal:false })
  const [soForm,      setSoForm]     = useState({ ts:ts(),location:'',subjects:'',vehicles:'',phones:'',notes:'' })
  const [leadForm,    setLeadForm]   = useState({ name:'',address:'',phone:'',email:'',social:'',notes:'' })
  const [infForm,     setInfForm]    = useState({ body:'',date:'',type:'',description:'' })
  const [newCase,     setNewCase]    = useState({ title:'',severity:'High',sport:'tennis',jurisdiction:'',assignee:'',supervisor:'',description:'' })

  const canApprove = ['god','main_account','supervisor'].includes(user?.role)
  const canCreate  = !['player','gambler','sportsbook'].includes(user?.role)

  const persist = (next) => { setCasesState(next); saveCases(next) }
  const update  = (id, fn) => { const next=cases.map(c=>c.id===id?fn(c):c); persist(next); if(activeCase?.id===id)setActiveCase(fn(cases.find(c=>c.id===id))) }

  const addTimeline = (caseId, type, text, icon='📋', color=S.info) => {
    update(caseId, c=>({ ...c, timeline:[...c.timeline,{ id:`TL-${uid()}`,ts:ts(),user:user.username,type,text,icon,color }] }))
  }

  const createCase = () => {
    if (!newCase.title.trim()) return
    const prefix = (settings?.casePrefix||'CASE')
    const c = { id:`${prefix}-${Date.now().toString().slice(-5)}`, ...newCase, iri:0, confidence:0, status:'Open', stage:'Initial Alert', created:ts().split(' ')[0], due:'TBD', entities:[], linkedCases:[], notes:[], timeline:[{ id:`TL-${uid()}`,ts:ts(),user:user.username,type:'Case Opened',icon:'📁',color:S.info,text:`Created by ${user.username}. ${newCase.description}` }], files:[], phoneLog:[], stakeoutLog:[], leads:[], infractions:[], timeLogs:[], trackers:[] }
    persist([c,...cases]); setShowNew(false); setActiveCase(c); setTab('overview')
    setNewCase({ title:'',severity:'High',sport:'tennis',jurisdiction:'',assignee:'',supervisor:'',description:'' })
  }

  const doArchive = (id) => { archiveCase(id); persist(cases.filter(c=>c.id!==id)); setArchived(loadArchivedCases()); if(activeCase?.id===id)setActiveCase(null) }
  const doRestore = (id) => { restoreCase(id); setCasesState(loadCases()); setArchived(loadArchivedCases()) }
  const doPurge   = (id) => { if(window.confirm('Permanently delete this case? Cannot be undone.'))purgeArchivedCase(id); setArchived(loadArchivedCases()) }

  const addNote = () => {
    if (!noteForm.text.trim()||!activeCase) return
    const n = { id:`N-${uid()}`,...noteForm,author:user.username,role:ALL_ROLES[user.role]?.label||user.role,ts:noteForm.customTs?noteForm.customTs.replace('T',' '):ts(),signedOff:false,signedBy:null,signedAt:null }
    update(activeCase.id, c=>({ ...c, notes:[...c.notes,n], timeline:[...c.timeline,{id:`TL-${uid()}`,ts:n.ts,user:user.username,type:noteForm.type==='interview_note'?'Interview Logged':'Note Added',icon:noteForm.type==='interview_note'?'🎙️':'📝',color:S.info,text:noteForm.text.slice(0,80)}] }))
    setNoteForm({ type:'case_note',text:'',internal:false,customTs:'' }); setShowNote(false)
  }

  const addStakeout = () => {
    const e = { id:`SK-${uid()}`,...soForm,addedBy:user.username }
    update(activeCase.id, c=>({ ...c,stakeoutLog:[...c.stakeoutLog,e],timeline:[...c.timeline,{id:`TL-${uid()}`,ts:soForm.ts,user:user.username,type:'Stakeout Entry',icon:'👁️',color:'#8b5cf6',text:`${soForm.location} — ${soForm.subjects}`}] }))
    setSoForm({ ts:ts(),location:'',subjects:'',vehicles:'',phones:'',notes:'' }); setShowSO(false)
  }

  const addLead = () => {
    const e = { id:`LD-${uid()}`,...leadForm,addedBy:user.username,ts:ts() }
    update(activeCase.id, c=>({ ...c,leads:[...c.leads,e] }))
    setLeadForm({ name:'',address:'',phone:'',email:'',social:'',notes:'' }); setShowLead(false)
  }

  const addInfraction = () => {
    const e = { id:`INF-${uid()}`,...infForm,addedBy:user.username,ts:ts() }
    update(activeCase.id, c=>({ ...c,infractions:[...c.infractions,e] }))
    setInfForm({ body:'',date:'',type:'',description:'' }); setShowInf(false)
  }

  const fileUpload = (e) => {
    const file = e.target.files?.[0]; if(!file||!activeCase) return
    const f = { id:`F-${uid()}`,name:file.name,type:file.type||'document',size:`${(file.size/1024).toFixed(0)} KB`,uploadedBy:user.username,ts:ts(),description:'' }
    update(activeCase.id, c=>({ ...c,files:[...c.files,f],timeline:[...c.timeline,{id:`TL-${uid()}`,ts:ts(),user:user.username,type:'File Uploaded',icon:'📎',color:S.accent,text:`${file.name} (${f.size})`}] }))
    e.target.value=''
  }

  const signOff = (noteId) => update(activeCase.id, c=>({ ...c,notes:c.notes.map(n=>n.id===noteId?{...n,signedOff:true,signedBy:user.username}:n) }))
  const logTime = () => {
    const hrs = parseFloat(prompt('Hours worked:')); if(isNaN(hrs)) return
    const desc = prompt('Description:') || ''
    update(activeCase.id, c=>({ ...c,timeLogs:[...c.timeLogs,{agent:user.username,date:ts().split(' ')[0],hours:hrs,description:desc,approved:false}] }))
  }
  const logCall = () => {
    const num = prompt('Phone number:'); if(!num) return
    const e = { id:`PH-${uid()}`,number:num,contact:prompt('Contact name:')||'',date:ts().split(' ')[0],time:ts().split(' ')[1],duration:prompt('Duration:')||'',notes:prompt('Notes:')||'' }
    update(activeCase.id, c=>({ ...c,phoneLog:[...c.phoneLog,e],timeline:[...c.timeline,{id:`TL-${uid()}`,ts:ts(),user:user.username,type:'Phone Call Logged',icon:'📞',color:S.ok,text:`${e.contact} (${e.number})`}] }))
  }

  const handleExport = (format) => {
    if (!activeCase) return
    if (format==='pdf')   exportCasePDF(activeCase, settings)
    if (format==='docx')  exportCaseDOCX(activeCase, settings)
    if (format==='excel') exportCaseExcel(activeCase)
  }

  const filtered = cases.filter(c=>filterStatus==='all'||c.status===filterStatus).filter(c=>!searchQ||c.title?.toLowerCase().includes(searchQ.toLowerCase())||c.id?.includes(searchQ))

  const CASE_TABS = ['overview','notes','timeline','files','phonelog','stakeout','leads','infractions','time','bank','narrative','discovery','history']

  // ── Case list ──
  if (!activeCase) return (
    <div>
      <SectionHeader title="🔨 Case Management" subtitle={`v${VERSION} · ${cases.length} active cases · Full investigative system`}
        actions={<div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
          {canCreate && <Btn color={S.danger} onClick={()=>setShowNew(true)}><Plus size={10}/>New Case</Btn>}
          <Btn color={S.info} variant="outline" onClick={()=>setShowRecover(true)}><RotateCcw size={10}/>Recovery ({archived.length})</Btn>
          <ExportMenu onExport={f=>exportAllCasesExcel(cases)} label="Export All"/>
        </div>}/>
      <div style={{ display:'flex',gap:14,marginBottom:18,flexWrap:'wrap' }}>
        <StatCard label="Total" value={cases.length}/>
        <StatCard label="Active" value={cases.filter(c=>c.status==='Active'||c.status==='Open').length} color={S.danger}/>
        <StatCard label="Archived" value={archived.length} color={S.dim}/>
      </div>
      <div style={{ ...cardSm,marginBottom:14,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center' }}>
        <Search size={13} color={S.dim}/>
        <input placeholder="Search cases…" value={searchQ} onChange={e=>setSearch(e.target.value)} style={{ ...fieldStyle,width:200 }}/>
        {['all','Open','Active','Monitoring','Closed'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:'5px 12px',borderRadius:6,fontSize:12,cursor:'pointer',background:filterStatus===s?S.mid:'transparent',color:filterStatus===s?S.text:S.dim,border:`1px solid ${filterStatus===s?S.border:'transparent'}` }}>{s}</button>
        ))}
      </div>
      {cases.length===0 && !showNew && (
        <div style={{ ...card,textAlign:'center',padding:48 }}>
          <div style={{ fontSize:40,marginBottom:12 }}>📂</div>
          <div style={{ color:S.text,fontSize:16,fontWeight:700,marginBottom:8 }}>No Cases Yet</div>
          <div style={{ color:S.dim,fontSize:12,marginBottom:18 }}>Create your first case to begin an investigation.</div>
          {canCreate && <Btn color={S.danger} onClick={()=>setShowNew(true)}><Plus size={11}/>Create First Case</Btn>}
        </div>
      )}
      {filtered.map(c=>(
        <div key={c.id} onClick={()=>{setActiveCase(c);setTab('overview')}} style={{ ...card,marginBottom:10,cursor:'pointer',borderLeft:`3px solid ${sevC[c.severity]||S.dim}` }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex',gap:7,alignItems:'center',marginBottom:4,flexWrap:'wrap' }}>
                <span style={{ color:S.dim,fontSize:11,fontFamily:"'IBM Plex Mono',monospace" }}>{c.id}</span>
                <span style={{ ...badge(sevC[c.severity]) }}>{c.severity}</span>
                <SportBadge sport={c.sport}/>
              </div>
              <div style={{ color:S.text,fontSize:14,fontWeight:700 }}>{c.title}</div>
              <div style={{ color:S.dim,fontSize:11,marginTop:2 }}>{c.assignee} → {c.supervisor} · {c.stage} · {c.notes?.length||0} notes · {c.files?.length||0} files</div>
            </div>
            <div style={{ display:'flex',gap:14,alignItems:'center' }}>
              <div style={{ textAlign:'center' }}><div style={{ color:S.dim,fontSize:10 }}>IRI</div><div style={{ color:iriBand(c.iri||0).color,fontSize:22,fontWeight:800 }}>{c.iri||'—'}</div></div>
              <span style={{ ...badge(c.status==='Active'?S.danger:c.status==='Closed'?S.ok:S.warn) }}>{c.status}</span>
            </div>
          </div>
        </div>
      ))}

      <Modal open={showNew} onClose={()=>setShowNew(false)} title="Create New Case">
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <Field label="CASE TITLE" required><input value={newCase.title} onChange={e=>setNewCase(n=>({...n,title:e.target.value}))} placeholder="Descriptive title" style={fieldStyle}/></Field>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <Field label="SEVERITY"><select value={newCase.severity} onChange={e=>setNewCase(n=>({...n,severity:e.target.value}))} style={fieldStyle}>{['Critical','High','Medium','Low'].map(s=><option key={s}>{s}</option>)}</select></Field>
            <Field label="SPORT"><select value={newCase.sport} onChange={e=>setNewCase(n=>({...n,sport:e.target.value}))} style={fieldStyle}>{Object.entries(SPORTS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</select></Field>
            <Field label="JURISDICTION"><input value={newCase.jurisdiction} onChange={e=>setNewCase(n=>({...n,jurisdiction:e.target.value}))} placeholder="Country / region" style={fieldStyle}/></Field>
            <Field label="ASSIGNEE"><input value={newCase.assignee} onChange={e=>setNewCase(n=>({...n,assignee:e.target.value}))} placeholder="Username" style={fieldStyle}/></Field>
            <Field label="SUPERVISOR"><input value={newCase.supervisor} onChange={e=>setNewCase(n=>({...n,supervisor:e.target.value}))} placeholder="Username" style={fieldStyle}/></Field>
          </div>
          <Field label="INITIAL DESCRIPTION"><textarea value={newCase.description} onChange={e=>setNewCase(n=>({...n,description:e.target.value}))} placeholder="Initial description…" style={textareaStyle}/></Field>
          <div style={{ display:'flex',gap:8 }}><Btn onClick={createCase} color={S.danger}><Plus size={10}/>Create Case</Btn><Btn onClick={()=>setShowNew(false)} color={S.dim} variant="outline">Cancel</Btn></div>
        </div>
      </Modal>

      <Modal open={showRecover} onClose={()=>setShowRecover(false)} title={`Case Recovery (${archived.length} archived)`} width={720}>
        {archived.length===0 && <div style={{ color:S.dim,textAlign:'center',padding:24 }}>No archived cases.</div>}
        {archived.map(c=>(
          <div key={c.id} style={{ ...card,marginBottom:10,borderLeft:`3px solid ${S.dim}` }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap' }}>
              <div>
                <div style={{ color:S.text,fontSize:13,fontWeight:700 }}>{c.id} — {c.title}</div>
                <div style={{ color:S.dim,fontSize:11 }}>Archived: {c.archivedAt?.slice(0,16)} · Sport: {c.sport} · IRI: {c.iri||'—'}</div>
              </div>
              <div style={{ display:'flex',gap:6 }}>
                <Btn size="sm" color={S.ok} onClick={()=>{doRestore(c.id);setShowRecover(false)}}><RotateCcw size={10}/>Restore</Btn>
                <Btn size="sm" color={S.danger} variant="outline" onClick={()=>doPurge(c.id)}><Trash2 size={10}/>Delete</Btn>
              </div>
            </div>
          </div>
        ))}
      </Modal>
    </div>
  )

  // ── Active case detail ──
  const c = cases.find(x=>x.id===activeCase.id)||activeCase
  return (
    <div>
      <div style={{ display:'flex',gap:10,alignItems:'center',marginBottom:14,flexWrap:'wrap' }}>
        <Btn onClick={()=>setActiveCase(null)} color={S.dim} variant="outline" size="sm">← Cases</Btn>
        <span style={{ color:S.dim,fontSize:11,fontFamily:"'IBM Plex Mono',monospace" }}>{c.id}</span>
        <span style={{ ...badge(sevC[c.severity]) }}>{c.severity}</span>
        <SportBadge sport={c.sport}/>
        <div style={{ marginLeft:'auto',display:'flex',gap:6,flexWrap:'wrap' }}>
          <ExportMenu onExport={handleExport} label="Export Report"/>
          <Btn size="sm" color={S.warn} variant="outline" onClick={()=>setShowAct(true)}>⚡ Actions</Btn>
          <Btn size="sm" color={S.dim} variant="outline" onClick={()=>doArchive(c.id)}><Trash2 size={10}/>Archive</Btn>
        </div>
      </div>
      <div style={{ color:S.text,fontSize:17,fontWeight:700,marginBottom:4 }}>{c.title}</div>
      <div style={{ color:S.dim,fontSize:11,marginBottom:14 }}>{c.assignee} → {c.supervisor} · {c.jurisdiction} · IRI: <span style={{ color:iriBand(c.iri||0).color,fontWeight:700 }}>{c.iri||'—'}</span> · Stage: {c.stage}</div>

      <div style={{ display:'flex',gap:4,overflowX:'auto',marginBottom:16,borderBottom:`1px solid ${S.border}`,paddingBottom:8 }}>
        {CASE_TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'6px 13px',borderRadius:6,fontSize:12,cursor:'pointer',background:activeTab===t?S.mid:'transparent',color:activeTab===t?S.accent:S.dim,border:`1px solid ${activeTab===t?S.border:'transparent'}`,fontWeight:activeTab===t?700:400,whiteSpace:'nowrap' }}>
            {{overview:'📋 Overview',notes:'📝 Notes',timeline:'⏱️ Timeline',files:'📎 Files',phonelog:'📞 Phone',stakeout:'👁️ Stakeout',leads:'🔗 Leads',infractions:'📜 Infractions',time:'⏰ Time',bank:'💳 Bank Statement',narrative:'🤖 AI Narrative',discovery:'📋 Key Discovery',history:'🗂️ Case History'}[t]}
            {t==='notes'&&(c.notes?.filter(n=>!n.signedOff&&!n.internal).length||0)>0&&<span style={{ ...badge(S.warn),marginLeft:4,fontSize:9 }}>{c.notes.filter(n=>!n.signedOff&&!n.internal).length}</span>}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab==='overview' && (
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
          <div style={card}>
            <div style={{ color:S.text,fontSize:14,fontWeight:700,marginBottom:12 }}>Case Details</div>
            {[['Status',c.status,c.status==='Active'?S.danger:S.ok],['Stage',c.stage,S.info],['IRI',c.iri||'—',iriBand(c.iri||0).color],['Sport',c.sport?.toUpperCase(),S.accent],['Jurisdiction',c.jurisdiction,S.text],['Due',c.due,S.warn]].map(([l,v,col])=>(
              <div key={l} style={{ display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:`1px solid ${S.border}44` }}>
                <span style={{ color:S.dim,fontSize:12 }}>{l}</span><span style={{ color:col,fontSize:13,fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{ color:S.text,fontSize:14,fontWeight:700,marginBottom:10 }}>Quick Actions</div>
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              <Btn color={S.info} onClick={()=>setShowNote(true)}><Plus size={10}/>Add Note / Interview</Btn>
              <Btn color={S.accent} variant="outline" onClick={()=>document.getElementById('file-up').click()}><Paperclip size={10}/>Upload Evidence</Btn>
              <input id="file-up" type="file" style={{ display:'none' }} onChange={fileUpload} multiple/>
              <Btn color={S.warn} variant="outline" onClick={()=>setShowSO(true)}><Eye size={10}/>Add Stakeout Entry</Btn>
              <Btn color={S.ok} variant="outline" onClick={()=>setShowLead(true)}><Search size={10}/>Add Lead</Btn>
              <Btn color={S.god} variant="outline" onClick={()=>setShowInf(true)}><FileText size={10}/>Add Infraction</Btn>
              <Btn color={S.dim} variant="outline" onClick={logCall}><Paperclip size={10}/>Log Phone Call</Btn>
              <Btn color={S.dim} variant="outline" onClick={logTime}><Clock size={10}/>Log Time</Btn>
            </div>
          </div>
        </div>
      )}

      {/* NOTES */}
      {activeTab==='notes' && (
        <div>
          <div style={{ display:'flex',gap:8,marginBottom:14 }}>
            <Btn color={S.info} onClick={()=>setShowNote(true)}><Plus size={10}/>Add Note</Btn>
            <ExportMenu onExport={handleExport} label="Export Notes"/>
          </div>
          {(!c.notes||c.notes.length===0) && <div style={{ ...cardSm,color:S.dim,textAlign:'center' }}>No notes yet.</div>}
          {c.notes?.map(n=>(
            <div key={n.id} style={{ ...card,marginBottom:10,borderLeft:`3px solid ${n.internal?S.warn:n.type==='interview_note'?S.god:S.info}` }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex',gap:7,alignItems:'center',marginBottom:6,flexWrap:'wrap' }}>
                    <span style={{ ...badge(n.type==='interview_note'?S.god:S.info),fontSize:10 }}>{n.type==='interview_note'?'🎙️ Interview':'📝 Case Note'}</span>
                    <span style={{ color:S.text,fontSize:12,fontWeight:600 }}>{n.author}</span>
                    <span style={{ color:S.dim,fontSize:11,fontFamily:"'IBM Plex Mono',monospace" }}>{n.ts}</span>
                    {n.internal && <span style={{ ...badge(S.warn),fontSize:9 }}>🔒 Internal</span>}
                    {n.signedOff && <span style={{ ...badge(S.ok),fontSize:9 }}>✓ {n.signedBy}</span>}
                  </div>
                  <div style={{ color:S.midText,fontSize:13,lineHeight:1.7,whiteSpace:'pre-wrap' }}>{n.text}</div>
                </div>
                {canApprove && !n.signedOff && <Btn size="sm" color={S.ok} onClick={()=>signOff(n.id)}><CheckCircle2 size={10}/>Sign Off</Btn>}
              </div>
            </div>
          ))}
          <Modal open={showNewNote} onClose={()=>setShowNote(false)} title="Add Note">
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <Field label="TYPE"><select value={noteForm.type} onChange={e=>setNoteForm(n=>({...n,type:e.target.value}))} style={fieldStyle}><option value="case_note">📝 Case Note</option><option value="interview_note">🎙️ Interview Note</option></select></Field>
              <Field label="DATE/TIME (defaults to now)"><input type="datetime-local" value={noteForm.customTs||''} onChange={e=>setNoteForm(n=>({...n,customTs:e.target.value}))} style={fieldStyle}/></Field>
              <Field label="TEXT" required><textarea value={noteForm.text} onChange={e=>setNoteForm(n=>({...n,text:e.target.value}))} style={{ ...textareaStyle,minHeight:120 }}/></Field>
              <Toggle on={noteForm.internal} onChange={v=>setNoteForm(n=>({...n,internal:v}))} label="Internal only (supervisors+)"/>
              <div style={{ display:'flex',gap:8 }}><Btn onClick={addNote} color={S.info}><Plus size={10}/>Add</Btn><Btn onClick={()=>setShowNote(false)} color={S.dim} variant="outline">Cancel</Btn></div>
            </div>
          </Modal>
        </div>
      )}

      {/* TIMELINE */}
      {activeTab==='timeline' && (
        <div>
          <div style={{ color:S.text,fontSize:14,fontWeight:700,marginBottom:14 }}>Timeline — {c.timeline?.length||0} entries</div>
          {[...(c.timeline||[])].reverse().map(t=><TimelineEntry key={t.id} ts={t.ts} user={t.user} type={t.type} content={t.text} color={t.color} icon={t.icon}/>)}
        </div>
      )}

      {/* FILES */}
      {activeTab==='files' && (
        <div>
          <div style={{ display:'flex',gap:8,marginBottom:14 }}>
            <Btn color={S.accent} onClick={()=>document.getElementById('file-up2').click()}><Paperclip size={10}/>Upload File</Btn>
            <input id="file-up2" type="file" style={{ display:'none' }} onChange={fileUpload} multiple accept="image/*,video/*,audio/*,.pdf,.csv,.txt,.docx,.xlsx"/>
          </div>
          {(!c.files||c.files.length===0) && <div style={{ ...cardSm,color:S.dim,textAlign:'center' }}>No files uploaded yet.</div>}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12 }}>
            {c.files?.map(f=>{
              const ic = f.type?.includes('image')?'🖼️':f.type?.includes('video')?'🎬':f.type?.includes('audio')?'🎵':f.type?.includes('pdf')?'📄':'📎'
              const fc = f.type?.includes('image')?S.ok:f.type?.includes('video')?S.danger:f.type?.includes('audio')?S.god:S.accent
              return <div key={f.id} style={{ ...cardSm,borderLeft:`3px solid ${fc}` }}><div style={{ fontSize:22,marginBottom:6 }}>{ic}</div><div style={{ color:S.text,fontSize:13,fontWeight:600 }}>{f.name}</div><div style={{ color:S.dim,fontSize:11 }}>{f.size} · {f.uploadedBy} · {f.ts}</div></div>
            })}
          </div>
        </div>
      )}

      {/* PHONE LOG */}
      {activeTab==='phonelog' && (
        <div>
          <Btn color={S.ok} style={{ marginBottom:14 }} onClick={logCall}><Paperclip size={10}/>Log Call</Btn>
          {(!c.phoneLog||c.phoneLog.length===0) && <div style={{ ...cardSm,color:S.dim,textAlign:'center' }}>No calls logged.</div>}
          {c.phoneLog?.map(p=>(
            <div key={p.id} style={{ ...cardSm,marginBottom:8,borderLeft:`3px solid ${S.ok}` }}>
              <div style={{ color:S.text,fontSize:13,fontWeight:700 }}>{p.contact}</div>
              <div style={{ color:S.dim,fontSize:11 }}>{p.number} · {p.date} {p.time} · {p.duration}</div>
              {p.notes && <div style={{ color:S.midText,fontSize:12,marginTop:4 }}>{p.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {/* STAKEOUT */}
      {activeTab==='stakeout' && (
        <div>
          <Btn color={S.god} style={{ marginBottom:14 }} onClick={()=>setShowSO(true)}><Eye size={10}/>Add Entry</Btn>
          {(!c.stakeoutLog||c.stakeoutLog.length===0) && <div style={{ ...cardSm,color:S.dim,textAlign:'center' }}>No stakeout entries.</div>}
          {c.stakeoutLog?.map(s=>(
            <div key={s.id} style={{ ...card,marginBottom:10,borderLeft:`3px solid #8b5cf6` }}>
              <div style={{ display:'flex',gap:8,alignItems:'center',marginBottom:6,flexWrap:'wrap' }}>
                <span style={{ ...badge('#8b5cf6') }}>👁️ STAKEOUT</span><span style={{ color:S.dim,fontSize:11,fontFamily:"'IBM Plex Mono',monospace" }}>{s.ts}</span>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                {[['📍 Location',s.location],['👤 Subjects',s.subjects],['🚗 Vehicles',s.vehicles],['📱 Phones',s.phones]].map(([l,v])=>v&&<div key={l}><div style={{ color:S.dim,fontSize:10 }}>{l}</div><div style={{ color:S.text,fontSize:12 }}>{v}</div></div>)}
              </div>
              {s.notes && <div style={{ color:S.midText,fontSize:12,marginTop:8 }}>{s.notes}</div>}
              {s.subjects && (
                <div style={{ marginTop:8 }}>
                  <Btn size="sm" color={S.danger} variant="outline" onClick={()=>{
                    const prefix = settings?.casePrefix||'CASE'
                    const newC = { id:`${prefix}-${Date.now().toString().slice(-5)}`,title:`Suspect — ${s.subjects.split(',')[0].trim()}`,severity:'High',sport:c.sport||'tennis',jurisdiction:c.jurisdiction||'',assignee:user.username,supervisor:'',description:`Case opened from stakeout entry.\nSubjects: ${s.subjects}\nLocation: ${s.location}\nVehicles: ${s.vehicles}\nTime: ${s.ts}`,iri:0,confidence:0,status:'Open',stage:'Initial Alert',created:new Date().toISOString().slice(0,10),due:'TBD',entities:[s.subjects],linkedCases:[c.id],notes:[],timeline:[{id:`TL-${uid()}`,ts:ts(),user:user.username,type:'Case Created from Stakeout',icon:'👁️',color:'#8b5cf6',text:`Created from stakeout of ${c.id}: ${s.subjects}`}],files:[],phoneLog:[],stakeoutLog:[],leads:[],infractions:[],timeLogs:[] }
                    const next = [newC,...cases]; persist(next)
                    update(c.id,x=>({...x,timeline:[...x.timeline,{id:`TL-${uid()}`,ts:ts(),user:user.username,type:'New Case Spawned',icon:'🔗',color:S.danger,text:`Case ${newC.id} created for suspect: ${s.subjects}`}]}))
                    alert(`Case ${newC.id} created. Navigate to Cases to view.`)
                  }}>
                    <Plus size={9}/>Create Case for Suspect
                  </Btn>
                </div>
              )}
            </div>
          ))}
          <Modal open={showStakeout} onClose={()=>setShowSO(false)} title="Add Stakeout Entry">
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                {[['ts','Timestamp',soForm.ts],['location','Location',soForm.location],['subjects','Subjects',soForm.subjects],['vehicles','Vehicles / Plates',soForm.vehicles],['phones','Phone Numbers',soForm.phones]].map(([k,l,v])=>(
                  <Field key={k} label={l}><input value={v} onChange={e=>setSoForm(s=>({...s,[k]:e.target.value}))} style={fieldStyle}/></Field>
                ))}
              </div>
              <Field label="NOTES"><textarea value={soForm.notes} onChange={e=>setSoForm(s=>({...s,notes:e.target.value}))} style={textareaStyle}/></Field>
              <div style={{ display:'flex',gap:8 }}><Btn onClick={addStakeout} color={S.god}>Log Entry</Btn><Btn onClick={()=>setShowSO(false)} color={S.dim} variant="outline">Cancel</Btn></div>
            </div>
          </Modal>
        </div>
      )}

      {/* LEADS */}
      {activeTab==='leads' && (
        <div>
          <Btn color={S.ok} style={{ marginBottom:14 }} onClick={()=>setShowLead(true)}><Plus size={10}/>Add Lead</Btn>
          {(!c.leads||c.leads.length===0) && <div style={{ ...cardSm,color:S.dim,textAlign:'center' }}>No leads recorded.</div>}
          {c.leads?.map(l=>(
            <div key={l.id} style={{ ...card,marginBottom:10,borderLeft:`3px solid ${S.ok}` }}>
              <div style={{ color:S.text,fontSize:14,fontWeight:700,marginBottom:4 }}>{l.name}</div>
              <div style={{ display:'flex',gap:14,flexWrap:'wrap' }}>
                {l.phone && <span style={{ color:S.dim,fontSize:11 }}>📞 {l.phone}</span>}
                {l.email && <span style={{ color:S.dim,fontSize:11 }}>✉ {l.email}</span>}
                {l.address && <span style={{ color:S.dim,fontSize:11 }}>📍 {l.address}</span>}
                {l.social && <span style={{ color:S.dim,fontSize:11 }}>🌐 {l.social}</span>}
              </div>
              {l.notes && <div style={{ color:S.midText,fontSize:12,marginTop:6 }}>{l.notes}</div>}
            </div>
          ))}
          <Modal open={showLead} onClose={()=>setShowLead(false)} title="Add Lead">
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <Field label="NAME" required><input value={leadForm.name} onChange={e=>setLeadForm(l=>({...l,name:e.target.value}))} style={fieldStyle}/></Field>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                {[['address','Address'],['phone','Phone'],['email','Email'],['social','Social Media']].map(([k,l])=>(
                  <Field key={k} label={l}><input value={leadForm[k]} onChange={e=>setLeadForm(x=>({...x,[k]:e.target.value}))} style={fieldStyle}/></Field>
                ))}
              </div>
              <Field label="NOTES"><textarea value={leadForm.notes} onChange={e=>setLeadForm(l=>({...l,notes:e.target.value}))} style={textareaStyle}/></Field>
              <div style={{ display:'flex',gap:8 }}><Btn onClick={addLead} color={S.ok}><Plus size={10}/>Add Lead</Btn><Btn onClick={()=>setShowLead(false)} color={S.dim} variant="outline">Cancel</Btn></div>
            </div>
          </Modal>
        </div>
      )}

      {/* INFRACTIONS */}
      {activeTab==='infractions' && (
        <div>
          <Btn color={S.god} style={{ marginBottom:14 }} onClick={()=>setShowInf(true)}><Plus size={10}/>Add Infraction</Btn>
          {(!c.infractions||c.infractions.length===0) && <div style={{ ...cardSm,color:S.dim,textAlign:'center' }}>No governance infractions logged.</div>}
          {c.infractions?.map(i=>(
            <div key={i.id} style={{ ...cardSm,marginBottom:10,borderLeft:`3px solid ${S.warn}` }}>
              <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:4 }}>
                <span style={{ ...badge(S.warn) }}>{i.type||'Infraction'}</span>
                <span style={{ color:S.dim,fontSize:11 }}>{i.body} · {i.date}</span>
              </div>
              <div style={{ color:S.midText,fontSize:12 }}>{i.description}</div>
            </div>
          ))}
          <Modal open={showInfraction} onClose={()=>setShowInf(false)} title="Add Governance Infraction">
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <Field label="GOVERNING BODY"><input value={infForm.body} onChange={e=>setInfForm(i=>({...i,body:e.target.value}))} placeholder="ITIA / NCAA / NFL" style={fieldStyle}/></Field>
                <Field label="DATE"><input value={infForm.date} onChange={e=>setInfForm(i=>({...i,date:e.target.value}))} placeholder="YYYY-MM-DD" style={fieldStyle}/></Field>
                <Field label="INFRACTION TYPE"><input value={infForm.type} onChange={e=>setInfForm(i=>({...i,type:e.target.value}))} placeholder="e.g. Betting Violation" style={fieldStyle}/></Field>
              </div>
              <Field label="DESCRIPTION"><textarea value={infForm.description} onChange={e=>setInfForm(i=>({...i,description:e.target.value}))} style={textareaStyle}/></Field>
              <div style={{ display:'flex',gap:8 }}><Btn onClick={addInfraction} color={S.god}><Plus size={10}/>Add</Btn><Btn onClick={()=>setShowInf(false)} color={S.dim} variant="outline">Cancel</Btn></div>
            </div>
          </Modal>
        </div>
      )}

      {/* HISTORY — attach old cases */}
      {activeTab==='history' && (
        <div style={card}>
          <div style={{ color:S.text,fontSize:14,fontWeight:700,marginBottom:10 }}>🗂️ Case History — Linked Prior Cases</div>
          <div style={{ color:S.dim,fontSize:12,marginBottom:14 }}>Attach closed or archived cases to this investigation. Use when an informant later becomes a suspect, or when multiple cases share the same subject.</div>
          <div style={{ display:'flex',gap:8,marginBottom:14 }}>
            <input placeholder="Enter case ID to attach (e.g. CASE-12345)…" style={{ ...fieldStyle,flex:1 }} onKeyDown={e=>{ if(e.key==='Enter'&&e.target.value){ update(c.id,x=>({...x,linkedCases:[...(x.linkedCases||[]),e.target.value],timeline:[...x.timeline,{id:`TL-${uid()}`,ts:ts(),user:user.username,type:'Case History Linked',icon:'🗂️',color:S.info,text:`Linked prior case: ${e.target.value}`}]})); e.target.value='' }}}/>
            <Btn size="sm" color={S.info}>Link</Btn>
          </div>
          {(c.linkedCases||[]).length===0 && <div style={{ color:S.dim,fontSize:12 }}>No cases linked. Type a case ID above and press Enter.</div>}
          {(c.linkedCases||[]).map((linkedId,i)=>{
            const linked = cases.find(x=>x.id===linkedId)
            return (
              <div key={i} style={{ ...cardSm,marginBottom:8,borderLeft:`3px solid ${S.info}` }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div>
                    <div style={{ color:S.text,fontSize:13,fontWeight:700 }}>{linkedId}</div>
                    {linked && <div style={{ color:S.dim,fontSize:11 }}>{linked.title} · {linked.status} · IRI: {linked.iri||'—'}</div>}
                    {!linked && <div style={{ color:S.dim,fontSize:11 }}>Case not in active system (may be archived)</div>}
                  </div>
                  <Btn size="sm" color={S.dim} variant="outline" onClick={()=>update(c.id,x=>({...x,linkedCases:(x.linkedCases||[]).filter((_,j)=>j!==i)}))}><Trash2 size={9}/></Btn>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* BANK STATEMENT */}
      {activeTab==='bank' && (
        <BankStatementIngestion c={c} user={user} onSave={(bankData)=>update(c.id, x=>({...x, bankStatements:[...(x.bankStatements||[]),{...bankData,ts:ts(),addedBy:user.username}], timeline:[...x.timeline,{id:`TL-${uid()}`,ts:ts(),user:user.username,type:'Bank Statement Added',icon:'💳',color:S.accent,text:`Bank statement parsed: ${bankData.transactions?.length||0} transactions, ${bankData.suspiciousPatterns?.length||0} suspicious patterns`}]}))}/>
      )}

      {/* AI NARRATIVE */}
      {activeTab==='narrative' && (
        <AINarrative c={c} user={user}/>
      )}

      {/* KEY DISCOVERY */}
      {activeTab==='discovery' && (
        <KeyDiscovery c={c} user={user}/>
      )}

      {/* TIME LOG */}
      {activeTab==='time' && (
        <div>
          <div style={{ ...card,marginBottom:14 }}>
            <div style={{ display:'flex',gap:20 }}>
              <div><div style={{ color:S.dim,fontSize:10 }}>TOTAL</div><div style={{ color:S.accent,fontSize:24,fontWeight:800 }}>{c.timeLogs?.reduce((s,t)=>s+t.hours,0).toFixed(1)}h</div></div>
              <div><div style={{ color:S.dim,fontSize:10 }}>APPROVED</div><div style={{ color:S.ok,fontSize:24,fontWeight:800 }}>{c.timeLogs?.filter(t=>t.approved).reduce((s,t)=>s+t.hours,0).toFixed(1)}h</div></div>
            </div>
          </div>
          <Btn color={S.accent} style={{ marginBottom:12 }} onClick={logTime}><Clock size={10}/>Log Time</Btn>
          {c.timeLogs?.map((t,i)=>(
            <div key={i} style={{ ...cardSm,marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div><div style={{ color:S.text,fontSize:13,fontWeight:600 }}>{t.agent} — {t.date}</div><div style={{ color:S.dim,fontSize:11 }}>{t.description}</div></div>
              <div style={{ display:'flex',gap:10,alignItems:'center' }}>
                <span style={{ color:S.accent,fontSize:16,fontWeight:700 }}>{t.hours}h</span>
                {t.approved ? <span style={{ ...badge(S.ok),fontSize:9 }}>✓ Approved</span>
                : canApprove ? <Btn size="sm" color={S.ok} onClick={()=>update(c.id,x=>({...x,timeLogs:x.timeLogs.map((tl,j)=>j===i?{...tl,approved:true}:tl)}))}><CheckCircle2 size={10}/>Approve</Btn>
                : <span style={{ ...badge(S.warn),fontSize:9 }}>Pending</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Case Actions Modal */}
      <Modal open={showActions} onClose={()=>setShowAct(false)} title="Case Actions">
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {[
            ['Change Status →','Change case status',()=>{ const s=prompt('Status (Open/Active/Monitoring/Closed):'); if(s)update(c.id,x=>({...x,status:s,timeline:[...x.timeline,{id:`TL-${uid()}`,ts:ts(),user:user.username,type:'Status Changed',icon:'🔄',color:S.info,text:`Status changed to: ${s}`}]})) }],
            ['Change Stage →','Change investigation stage',()=>{ const s=prompt('Stage:'); if(s)update(c.id,x=>({...x,stage:s})) }],
            ['Set IRI Score','Manual IRI override',()=>{ const s=parseFloat(prompt('IRI Score (0-100):')); if(!isNaN(s))update(c.id,x=>({...x,iri:Math.min(100,Math.max(0,s))})) }],
            ['Set Confidence %','Manual confidence',()=>{ const s=parseInt(prompt('Confidence %:')); if(!isNaN(s))update(c.id,x=>({...x,confidence:Math.min(100,Math.max(0,s))})) }],
            ['Add Entity','Add a linked entity',()=>{ const e=prompt('Entity (e.g. "2 players"):'); if(e)update(c.id,x=>({...x,entities:[...(x.entities||[]),e]})) }],
            ['Link Case','Link another case by ID',()=>{ const id=prompt('Case ID to link:'); if(id)update(c.id,x=>({...x,linkedCases:[...(x.linkedCases||[]),id]})) }],
            ['Escalate','Escalate severity',()=>{ const levels=['Low','Medium','High','Critical']; const cur=levels.indexOf(c.severity); const next=levels[Math.min(cur+1,3)]; update(c.id,x=>({...x,severity:next,timeline:[...x.timeline,{id:`TL-${uid()}`,ts:ts(),user:user.username,type:'Escalated',icon:'⬆️',color:S.danger,text:`Severity escalated to ${next}`}]})) }],
          ].map(([l,sub,fn])=>(
            <div key={l} onClick={()=>{fn();setShowAct(false)}} style={{ ...cardSm,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center' }}
              onMouseEnter={e=>e.currentTarget.style.background=S.mid} onMouseLeave={e=>e.currentTarget.style.background=S.card}>
              <div><div style={{ color:S.text,fontSize:13,fontWeight:600 }}>{l}</div><div style={{ color:S.dim,fontSize:11 }}>{sub}</div></div>
              <span style={{ color:S.dim }}>›</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING — Complete billing with line items, PDF/DOCX/Excel, records retention
// ═══════════════════════════════════════════════════════════════════════════════
function Billing({ user, settings }) {
  const [clients,  setClientsState]  = useState(loadClients)
  const [invoices, setInvoicesState] = useState(loadInvoices)
  const [section,  setSection]       = useState('clients')
  const [showNewClient,  setNewClient]  = useState(false)
  const [showNewInvoice, setNewInvoice] = useState(false)
  const [showLineItems,  setLineItems]  = useState(null)
  const [clientForm, setClientForm] = useState({ name:'',short:'',contact:'',email:'',phone:'',address:'',rate:0,rateType:'hourly',currency:'USD',taxRate:0,notes:'' })
  const [invForm,    setInvForm]    = useState({ clientId:'',period:'',notes:'',lineItems:[{ description:'',qty:1,rate:0,amount:0 }] })

  const persistClients  = (c) => { setClientsState(c); saveClients(c) }
  const persistInvoices = (i) => { setInvoicesState(i); saveInvoices(i) }

  const canBill = ['god','main_account','supervisor'].includes(user?.role)

  const createClient = () => {
    if (!clientForm.name.trim()) return
    const c = { id:`CLT-${uid()}`, ...clientForm }
    persistClients([...clients, c])
    setNewClient(false); setClientForm({ name:'',short:'',contact:'',email:'',phone:'',address:'',rate:0,rateType:'hourly',currency:'USD',taxRate:0,notes:'' })
  }

  const createInvoice = () => {
    const client = clients.find(c=>c.id===invForm.clientId)
    if (!client) return
    const prefix = settings?.invoicePrefix || 'INV'
    const amount = invForm.lineItems.reduce((s,li)=>s+(parseFloat(li.amount)||0), 0)
    const tax    = amount * (client.taxRate||0)
    const inv = { id:`${prefix}-${Date.now().toString().slice(-6)}`, clientId:client.id, period:invForm.period, notes:invForm.notes, lineItems:invForm.lineItems, amount, tax, total:amount+tax, status:'draft', issued:new Date().toISOString().slice(0,10), due:'30 days', createdBy:user.username }
    persistInvoices([...invoices, inv])
    setNewInvoice(false); setInvForm({ clientId:'',period:'',notes:'',lineItems:[{description:'',qty:1,rate:0,amount:0}] })
  }

  const updateLineItem = (idx, field, val) => {
    setInvForm(f=>{
      const li=[...f.lineItems]; li[idx]={...li[idx],[field]:val}
      if(field==='qty'||field==='rate') li[idx].amount=parseFloat(li[idx].qty||0)*parseFloat(li[idx].rate||0)
      return {...f,lineItems:li}
    })
  }

  const statusColor = s => s==='paid'?S.ok:s==='sent'?S.info:s==='overdue'?S.danger:S.dim

  return (
    <div>
      <SectionHeader title="💼 Billing & Records" subtitle="Client management · Invoices · Records retention · PDF/DOCX/Excel export"/>
      <div style={{ display:'flex',gap:6,marginBottom:18,flexWrap:'wrap' }}>
        {[['clients','👤 Clients'],['invoices','📄 Invoices'],['summary','📊 Revenue Summary']].map(([id,l])=>(
          <button key={id} onClick={()=>setSection(id)} style={{ padding:'7px 14px',borderRadius:6,fontSize:12,cursor:'pointer',background:section===id?S.mid:'transparent',color:section===id?S.accent:S.dim,border:`1px solid ${section===id?S.border:'transparent'}`,fontWeight:section===id?700:400 }}>{l}</button>
        ))}
      </div>

      {/* CLIENTS */}
      {section==='clients' && (
        <div>
          <div style={{ display:'flex',gap:14,marginBottom:16,flexWrap:'wrap' }}>
            <StatCard label="Clients" value={clients.length}/>
            <StatCard label="Hourly" value={clients.filter(c=>c.rateType==='hourly').length} color={S.info}/>
            <StatCard label="Monthly" value={clients.filter(c=>c.rateType==='monthly').length} color={S.accent}/>
          </div>
          {canBill && <Btn color={S.ok} style={{ marginBottom:14 }} onClick={()=>setNewClient(true)}><Plus size={10}/>Add Client</Btn>}
          {clients.length===0 && !showNewClient && (
            <div style={{ ...card,textAlign:'center',padding:40 }}>
              <div style={{ fontSize:36,marginBottom:10 }}>👤</div>
              <div style={{ color:S.text,fontSize:15,fontWeight:700,marginBottom:6 }}>No Clients Yet</div>
              <div style={{ color:S.dim,fontSize:12,marginBottom:16 }}>Add your first client to begin invoicing.</div>
              {canBill && <Btn color={S.ok} onClick={()=>setNewClient(true)}><Plus size={10}/>Add Client</Btn>}
            </div>
          )}
          {clients.map(c=>(
            <div key={c.id} style={{ ...card,marginBottom:10 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
                <div>
                  <div style={{ color:S.text,fontSize:15,fontWeight:700 }}>{c.name} {c.short&&`(${c.short})`}</div>
                  <div style={{ color:S.dim,fontSize:11,marginTop:2 }}>{c.contact} · {c.email} · {c.phone}</div>
                  {c.address && <div style={{ color:S.dim,fontSize:11 }}>{c.address}</div>}
                  {c.notes && <div style={{ color:S.midText,fontSize:11,marginTop:4 }}>{c.notes}</div>}
                </div>
                <div style={{ display:'flex',gap:16,alignItems:'center' }}>
                  <div style={{ textAlign:'center' }}><div style={{ color:S.dim,fontSize:10 }}>RATE</div><div style={{ color:S.accent,fontSize:20,fontWeight:800 }}>{c.currency||'$'}{c.rate}/{c.rateType==='hourly'?'hr':c.rateType==='monthly'?'mo':'flat'}</div>{c.taxRate>0&&<div style={{ color:S.warn,fontSize:11 }}>Tax: {(c.taxRate*100).toFixed(1)}%</div>}</div>
                  <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                    {canBill && <Btn size="sm" color={S.info} onClick={()=>{ setInvForm(f=>({...f,clientId:c.id})); setNewInvoice(true); setSection('invoices') }}><Plus size={10}/>Invoice</Btn>}
                    <Btn size="sm" color={S.danger} variant="outline" onClick={()=>{ if(window.confirm(`Delete ${c.name}?`))persistClients(clients.filter(x=>x.id!==c.id)) }}><Trash2 size={10}/>Remove</Btn>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Modal open={showNewClient} onClose={()=>setNewClient(false)} title="Add Client" width={700}>
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <Field label="ORGANIZATION NAME" required><input value={clientForm.name} onChange={e=>setClientForm(c=>({...c,name:e.target.value}))} style={fieldStyle}/></Field>
                <Field label="SHORT NAME / ABBREVIATION"><input value={clientForm.short} onChange={e=>setClientForm(c=>({...c,short:e.target.value}))} placeholder="e.g. ITIA" style={fieldStyle}/></Field>
                <Field label="CONTACT NAME"><input value={clientForm.contact} onChange={e=>setClientForm(c=>({...c,contact:e.target.value}))} style={fieldStyle}/></Field>
                <Field label="CONTACT EMAIL"><input type="email" value={clientForm.email} onChange={e=>setClientForm(c=>({...c,email:e.target.value}))} style={fieldStyle}/></Field>
                <Field label="PHONE"><input value={clientForm.phone} onChange={e=>setClientForm(c=>({...c,phone:e.target.value}))} style={fieldStyle}/></Field>
                <Field label="ADDRESS"><input value={clientForm.address} onChange={e=>setClientForm(c=>({...c,address:e.target.value}))} style={fieldStyle}/></Field>
                <Field label="RATE AMOUNT"><input type="number" value={clientForm.rate} onChange={e=>setClientForm(c=>({...c,rate:parseFloat(e.target.value)||0}))} style={fieldStyle}/></Field>
                <Field label="RATE TYPE"><select value={clientForm.rateType} onChange={e=>setClientForm(c=>({...c,rateType:e.target.value}))} style={fieldStyle}><option value="hourly">Hourly</option><option value="monthly">Monthly Retainer</option><option value="flat">Flat Fee</option></select></Field>
                <Field label="CURRENCY"><select value={clientForm.currency} onChange={e=>setClientForm(c=>({...c,currency:e.target.value}))} style={fieldStyle}>{['USD','EUR','GBP','AUD','CAD'].map(x=><option key={x}>{x}</option>)}</select></Field>
                <Field label="TAX RATE (decimal, e.g. 0.086 = 8.6%)"><input type="number" step="0.001" value={clientForm.taxRate} onChange={e=>setClientForm(c=>({...c,taxRate:parseFloat(e.target.value)||0}))} style={fieldStyle}/></Field>
              </div>
              <Field label="NOTES"><textarea value={clientForm.notes} onChange={e=>setClientForm(c=>({...c,notes:e.target.value}))} style={{ ...textareaStyle,minHeight:60 }}/></Field>
              <div style={{ display:'flex',gap:8 }}><Btn onClick={createClient} color={S.ok}><Plus size={10}/>Create Client</Btn><Btn onClick={()=>setNewClient(false)} color={S.dim} variant="outline">Cancel</Btn></div>
            </div>
          </Modal>
        </div>
      )}

      {/* INVOICES */}
      {section==='invoices' && (
        <div>
          <div style={{ display:'flex',gap:14,marginBottom:16,flexWrap:'wrap' }}>
            <StatCard label="Total" value={`$${invoices.reduce((s,i)=>s+(i.total||0),0).toLocaleString()}`} color={S.accent}/>
            <StatCard label="Paid" value={`$${invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+(i.total||0),0).toLocaleString()}`} color={S.ok}/>
            <StatCard label="Outstanding" value={`$${invoices.filter(i=>i.status!=='paid'&&i.status!=='draft').reduce((s,i)=>s+(i.total||0),0).toLocaleString()}`} color={S.danger}/>
          </div>
          <div style={{ display:'flex',gap:8,marginBottom:14,flexWrap:'wrap' }}>
            {canBill && <Btn color={S.accent} onClick={()=>setNewInvoice(true)}><Plus size={10}/>New Invoice</Btn>}
            <ExportMenu onExport={f=>{ if(f==='pdf')exportRevenueReportPDF(invoices,clients,settings); else exportAllInvoicesExcel(invoices,clients) }} label="Export All"/>
          </div>
          {invoices.length===0 && (
            <div style={{ ...card,textAlign:'center',padding:40 }}>
              <div style={{ fontSize:36,marginBottom:10 }}>📄</div>
              <div style={{ color:S.text,fontSize:15,fontWeight:700,marginBottom:6 }}>No Invoices Yet</div>
              <div style={{ color:S.dim,fontSize:12 }}>Add clients first, then create invoices.</div>
            </div>
          )}
          {invoices.map(inv=>{
            const client = clients.find(c=>c.id===inv.clientId)
            return (
              <div key={inv.id} style={{ ...card,marginBottom:10,borderLeft:`3px solid ${statusColor(inv.status)}` }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
                  <div>
                    <div style={{ display:'flex',gap:8,marginBottom:4 }}>
                      <span style={{ color:S.dim,fontSize:11,fontFamily:"'IBM Plex Mono',monospace" }}>{inv.id}</span>
                      <span style={{ ...badge(statusColor(inv.status)) }}>{inv.status.toUpperCase()}</span>
                    </div>
                    <div style={{ color:S.text,fontSize:14,fontWeight:700 }}>{client?.name||'Unknown Client'}</div>
                    <div style={{ color:S.dim,fontSize:11 }}>{inv.period} · Issued: {inv.issued} · Due: {inv.due}</div>
                    {inv.lineItems?.length>0 && <div style={{ color:S.dim,fontSize:10,marginTop:2 }}>{inv.lineItems.length} line item{inv.lineItems.length!==1?'s':''}</div>}
                  </div>
                  <div style={{ display:'flex',gap:14,alignItems:'center' }}>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ color:S.dim,fontSize:10 }}>TOTAL</div>
                      <div style={{ color:S.accent,fontSize:22,fontWeight:900 }}>${(inv.total||0).toLocaleString()}</div>
                    </div>
                    <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                      <ExportMenu onExport={f=>{ if(f==='pdf')exportInvoicePDF(inv,client,settings); else if(f==='docx')exportInvoiceDOCX(inv,client,settings); else exportInvoiceExcel(inv,client) }} label="Export"/>
                      <div style={{ display:'flex',gap:4 }}>
                        {inv.status==='draft' && canBill && <Btn size="sm" color={S.info} onClick={()=>persistInvoices(invoices.map(i=>i.id===inv.id?{...i,status:'sent'}:i))}>Send</Btn>}
                        {inv.status==='sent'  && canBill && <Btn size="sm" color={S.ok}   onClick={()=>persistInvoices(invoices.map(i=>i.id===inv.id?{...i,status:'paid'}:i))}>Mark Paid</Btn>}
                        {inv.status==='sent'  && canBill && <Btn size="sm" color={S.danger} variant="outline" onClick={()=>persistInvoices(invoices.map(i=>i.id===inv.id?{...i,status:'overdue'}:i))}>Overdue</Btn>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <Modal open={showNewInvoice} onClose={()=>setNewInvoice(false)} title="Create Invoice" width={720}>
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <Field label="CLIENT" required>
                  <select value={invForm.clientId} onChange={e=>setInvForm(f=>({...f,clientId:e.target.value}))} style={fieldStyle}>
                    <option value="">Select client…</option>
                    {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="BILLING PERIOD"><input value={invForm.period} onChange={e=>setInvForm(f=>({...f,period:e.target.value}))} placeholder="e.g. April 2026" style={fieldStyle}/></Field>
              </div>
              <div style={{ color:S.text,fontSize:13,fontWeight:700,marginBottom:4 }}>Line Items</div>
              {invForm.lineItems.map((li,i)=>(
                <div key={i} style={{ display:'grid',gridTemplateColumns:'3fr 1fr 1fr 1fr auto',gap:8,alignItems:'center' }}>
                  <input value={li.description} onChange={e=>updateLineItem(i,'description',e.target.value)} placeholder="Description" style={{ ...fieldStyle,fontSize:12 }}/>
                  <input type="number" value={li.qty} onChange={e=>updateLineItem(i,'qty',parseFloat(e.target.value)||0)} placeholder="Qty/hrs" style={{ ...fieldStyle,fontSize:12 }}/>
                  <input type="number" value={li.rate} onChange={e=>updateLineItem(i,'rate',parseFloat(e.target.value)||0)} placeholder="Rate" style={{ ...fieldStyle,fontSize:12 }}/>
                  <div style={{ color:S.accent,fontSize:13,fontWeight:600 }}>${(li.amount||0).toFixed(2)}</div>
                  <button onClick={()=>setInvForm(f=>({...f,lineItems:f.lineItems.filter((_,j)=>j!==i)}))} style={{ background:'none',border:'none',color:S.danger,cursor:'pointer',fontSize:16 }}>×</button>
                </div>
              ))}
              <Btn size="sm" color={S.dim} variant="outline" onClick={()=>setInvForm(f=>({...f,lineItems:[...f.lineItems,{description:'',qty:1,rate:0,amount:0}]}))}><Plus size={10}/>Add Line Item</Btn>
              <div style={{ ...cardSm,background:S.mid }}>
                <div style={{ display:'flex',justifyContent:'space-between' }}>
                  <span style={{ color:S.dim }}>Subtotal</span>
                  <span style={{ color:S.text,fontWeight:700 }}>${invForm.lineItems.reduce((s,li)=>s+(li.amount||0),0).toFixed(2)}</span>
                </div>
                {invForm.clientId && clients.find(c=>c.id===invForm.clientId)?.taxRate>0 && (
                  <div style={{ display:'flex',justifyContent:'space-between',marginTop:4 }}>
                    <span style={{ color:S.dim }}>Tax</span>
                    <span style={{ color:S.warn }}>${(invForm.lineItems.reduce((s,li)=>s+(li.amount||0),0)*(clients.find(c=>c.id===invForm.clientId)?.taxRate||0)).toFixed(2)}</span>
                  </div>
                )}
              </div>
              <Field label="NOTES"><textarea value={invForm.notes} onChange={e=>setInvForm(f=>({...f,notes:e.target.value}))} style={{ ...textareaStyle,minHeight:60 }}/></Field>
              <div style={{ display:'flex',gap:8 }}><Btn onClick={createInvoice} color={S.accent}><Plus size={10}/>Create Invoice</Btn><Btn onClick={()=>setNewInvoice(false)} color={S.dim} variant="outline">Cancel</Btn></div>
            </div>
          </Modal>
        </div>
      )}

      {/* REVENUE SUMMARY */}
      {section==='summary' && (
        <div>
          <div style={{ display:'flex',gap:8,marginBottom:16 }}>
            <ExportMenu onExport={f=>{ if(f==='pdf')exportRevenueReportPDF(invoices,clients,settings); else exportAllInvoicesExcel(invoices,clients) }} label="Export Revenue Report"/>
          </div>
          {clients.map(c=>{
            const cInvoices = invoices.filter(i=>i.clientId===c.id)
            const paid = cInvoices.filter(i=>i.status==='paid').reduce((s,i)=>s+(i.total||0),0)
            const outstanding = cInvoices.filter(i=>i.status!=='paid'&&i.status!=='draft').reduce((s,i)=>s+(i.total||0),0)
            return (
              <div key={c.id} style={{ ...card,marginBottom:10 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
                  <div><div style={{ color:S.text,fontSize:14,fontWeight:700 }}>{c.name}</div><div style={{ color:S.dim,fontSize:11 }}>{cInvoices.length} invoices · {c.rateType} billing</div></div>
                  <div style={{ display:'flex',gap:20 }}>
                    <div style={{ textAlign:'right' }}><div style={{ color:S.dim,fontSize:10 }}>PAID</div><div style={{ color:S.ok,fontSize:18,fontWeight:700 }}>${paid.toLocaleString()}</div></div>
                    <div style={{ textAlign:'right' }}><div style={{ color:S.dim,fontSize:10 }}>OUTSTANDING</div><div style={{ color:outstanding>0?S.warn:S.dim,fontSize:18,fontWeight:700 }}>${outstanding.toLocaleString()}</div></div>
                  </div>
                </div>
              </div>
            )
          })}
          {clients.length===0 && <div style={{ ...card,textAlign:'center',color:S.dim,padding:32 }}>Add clients and invoices to see revenue summary.</div>}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECURE MESSAGING
// ═══════════════════════════════════════════════════════════════════════════════
function SecureMessaging({ user }) {
  const [messages, setMessages] = useState(loadMessages)
  const [active,   setActive]   = useState(null)
  const [newMsg,   setNewMsg]   = useState('')
  const [newCt,    setNewCt]    = useState('')
  const endRef = useRef(null)
  const setAndSave = (fn) => setMessages(prev=>{ const next=typeof fn==='function'?fn(prev):fn; saveMessages(next); return next })
  const threadKey  = (a,b) => [a,b].sort().join('|')
  const getOther   = (k)   => k.split('|').find(u=>u!==user.username)
  const threads    = Object.entries(messages).filter(([k])=>k.includes(user.username))
  const send = () => {
    if(!newMsg.trim()||!active) return
    const msg = { id:`M-${uid()}`,from:user.username,to:getOther(active),ts:ts(),text:newMsg,read:false,attachment:null }
    setAndSave(ms=>({ ...ms,[active]:[...(ms[active]||[]),msg] }))
    setNewMsg('')
    setTimeout(()=>endRef.current?.scrollIntoView({behavior:'smooth'}),50)
  }
  return (
    <div>
      <SectionHeader title="💬 Secure Messaging" subtitle="Encrypted · SHA-256 logged · Persistent"/>
      <div style={{ display:'grid',gridTemplateColumns:'240px 1fr',gap:16,minHeight:500 }}>
        <div style={card}>
          <div style={{ color:S.text,fontSize:13,fontWeight:700,marginBottom:10 }}>Conversations</div>
          <div style={{ display:'flex',gap:6,marginBottom:10 }}>
            <input value={newCt} onChange={e=>setNewCt(e.target.value)} placeholder="Username…" style={{ ...fieldStyle,fontSize:12 }} onKeyDown={e=>e.key==='Enter'&&(()=>{ if(newCt){ const k=threadKey(user.username,newCt); setAndSave(ms=>({...ms,[k]:ms[k]||[]})); setActive(k); setNewCt('') }})()}/>
            <Btn size="sm" color={S.secure} onClick={()=>{ if(newCt){ const k=threadKey(user.username,newCt); setAndSave(ms=>({...ms,[k]:ms[k]||[]})); setActive(k); setNewCt('') }}}><Plus size={10}/></Btn>
          </div>
          {threads.map(([k,msgs])=>{ const other=getOther(k),last=msgs[msgs.length-1],unread=msgs.filter(m=>m.to===user.username&&!m.read).length; return (
            <div key={k} onClick={()=>setActive(k)} style={{ padding:'9px 8px',borderRadius:8,cursor:'pointer',background:active===k?S.mid:'transparent',marginBottom:4,display:'flex',gap:10,alignItems:'center' }}>
              <div style={{ width:32,height:32,borderRadius:'50%',background:S.secure+'33',display:'flex',alignItems:'center',justifyContent:'center',color:S.secure,fontSize:13,fontWeight:700,flexShrink:0 }}>{other?.[0]?.toUpperCase()}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',justifyContent:'space-between' }}><span style={{ color:S.text,fontSize:13,fontWeight:600 }}>{other}</span>{unread>0&&<span style={{ ...badge(S.secure),fontSize:9 }}>{unread}</span>}</div>
                {last&&<div style={{ color:S.dim,fontSize:11,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{last.text.slice(0,35)}</div>}
              </div>
            </div>
          )})}
        </div>
        {active ? (
          <div style={{ ...card,display:'flex',flexDirection:'column' }}>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${S.border}` }}>
              <div style={{ width:32,height:32,borderRadius:'50%',background:S.secure+'33',display:'flex',alignItems:'center',justifyContent:'center',color:S.secure,fontSize:13,fontWeight:700 }}>{getOther(active)?.[0]?.toUpperCase()}</div>
              <div><div style={{ color:S.text,fontSize:14,fontWeight:700 }}>{getOther(active)}</div><div style={{ color:S.dim,fontSize:11 }}>🔒 Encrypted · Logged</div></div>
            </div>
            <div style={{ flex:1,overflowY:'auto',minHeight:300,maxHeight:380 }}>
              {(messages[active]||[]).map(msg=><MessageBubble key={msg.id} msg={msg} isMine={msg.from===user.username}/>)}
              <div ref={endRef}/>
            </div>
            <div style={{ display:'flex',gap:8,marginTop:12,paddingTop:12,borderTop:`1px solid ${S.border}` }}>
              <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="Type message…" style={{ ...fieldStyle,flex:1 }} onKeyDown={e=>e.key==='Enter'&&send()}/>
              <Btn color={S.secure} onClick={send}><Send size={12}/>Send</Btn>
            </div>
          </div>
        ) : <div style={{ ...card,display:'flex',alignItems:'center',justifyContent:'center',color:S.dim,fontSize:13 }}>Select or start a conversation</div>}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALERTS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function AlertsPanel() {
  const [alerts, setAlerts] = useState(loadAlerts)
  const mark = (id) => { const next=alerts.map(a=>a.id===id?{...a,read:true}:a); setAlerts(next); saveAlerts(next) }
  const sc = s=>({Critical:S.danger,High:S.warn,Elevated:S.accent,Info:S.info}[s]||S.dim)
  return (
    <div>
      <SectionHeader title="🔔 Alerts" subtitle="Multi-sport · Pre-match · Persistent"/>
      <div style={{ display:'flex',gap:14,marginBottom:16,flexWrap:'wrap' }}>
        <StatCard label="Unread" value={alerts.filter(a=>!a.read).length} color={S.danger}/>
        <StatCard label="Total" value={alerts.length}/>
      </div>
      {alerts.length===0 && <div style={{ ...card,textAlign:'center',color:S.dim,padding:32 }}>No alerts yet. Alerts appear here from Overwatch and Live Monitor.</div>}
      {alerts.map(a=>(
        <div key={a.id} onClick={()=>mark(a.id)} style={{ ...cardSm,marginBottom:8,cursor:'pointer',opacity:a.read?.65:1,borderLeft:`3px solid ${sc(a.severity)}` }}>
          <div style={{ display:'flex',gap:6,marginBottom:4,alignItems:'center',flexWrap:'wrap' }}>
            {!a.read&&<div style={{ width:6,height:6,borderRadius:'50%',background:S.danger }}/>}
            <span style={{ ...badge(sc(a.severity)) }}>{a.severity}</span>
            <SportBadge sport={a.sport}/>
          </div>
          <div style={{ color:S.text,fontSize:13 }}>{a.message}</div>
          <div style={{ color:S.dim,fontSize:11,marginTop:2 }}>{a.ts}</div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER MODULES (from v1.5.0 — imported inline for brevity)
// ═══════════════════════════════════════════════════════════════════════════════
function TriageDashboard({ user, onNavigate }) {
  const [dismissed, setDismissed] = useState(()=>loadDismissed())
  const items = TRIAGE_ITEMS.filter(t=>!dismissed.includes(t.id))
  const sC = { Critical:S.danger, High:S.warn, Elevated:S.accent }
  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
        <div><div style={{ color:S.text,fontSize:18,fontWeight:700 }}>🌅 Morning Triage — {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div><div style={{ color:S.dim,fontSize:12,marginTop:3 }}>AI ran overnight analysis · {items.length} items require your attention</div></div>
        <div style={{ ...badge(S.god),fontFamily:"'IBM Plex Mono',monospace" }}>ZERO-CLICK INTELLIGENCE</div>
      </div>
      <div style={{ display:'flex',gap:14,marginBottom:20,flexWrap:'wrap' }}>
        <StatCard label="⬛ BLACK" value={OVERWATCH_ALERTS.filter(a=>a.level==='Black').length} color='#a855f7' pulse/>
        <StatCard label="🔴 RED"   value={OVERWATCH_ALERTS.filter(a=>a.level==='Red').length}   color={S.danger}/>
        <StatCard label="🟡 YELLOW"value={OVERWATCH_ALERTS.filter(a=>a.level==='Yellow').length}color={S.accent}/>
        <StatCard label="IRI Shocks"value={items.filter(t=>t.iriCurr-t.iriPrev>=20).length}   color={S.warn}/>
      </div>
      {items.map(item=>{
        const delta=item.iriCurr-item.iriPrev
        return (
          <div key={item.id} style={{ ...card,marginBottom:10,borderLeft:`3px solid ${sC[item.severity]||S.dim}`,position:'relative' }}>
            <button onClick={()=>{ const next=[...dismissed,item.id]; setDismissed(next); saveDismissed(next) }} style={{ position:'absolute',top:12,right:12,background:'transparent',border:'none',color:S.dim,cursor:'pointer',fontSize:16 }}>×</button>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex',gap:7,alignItems:'center',marginBottom:6,flexWrap:'wrap' }}>
                  <span style={{ ...badge(sC[item.severity]||S.dim) }}>{item.severity}</span>
                  <span style={{ ...badge(S.info+'88'),color:S.info,fontSize:10 }}>{item.type}</span>
                  <SportBadge sport={item.sport}/>
                  {delta>=20&&<ShockBadge delta={delta}/>}
                </div>
                <div style={{ color:S.text,fontSize:14,fontWeight:700,marginBottom:4 }}>{item.entity}</div>
                <div style={{ color:S.midText,fontSize:12 }}>{item.detail}</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ color:S.dim,fontSize:10 }}>{item.iriPrev} → NOW</div>
                <div style={{ color:iriBand(item.iriCurr).color,fontSize:30,fontWeight:900 }}>{item.iriCurr}</div>
              </div>
            </div>
          </div>
        )
      })}
      {items.length===0&&<div style={{ ...card,textAlign:'center',padding:40 }}><div style={{ fontSize:36,marginBottom:10 }}>✅</div><div style={{ color:S.ok,fontSize:16,fontWeight:700 }}>Triage Clear</div></div>}
      <div style={{ color:S.text,fontSize:14,fontWeight:700,marginTop:20,marginBottom:12 }}>Quick Access</div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10 }}>
        {[['🔨 Cases','cases',S.danger],['🕸️ Nexus','nexus',S.god],['🚨 Overwatch','overwatch',S.warn],['💰 FININT','finint',S.ok],['🔮 Predictive','predictive','#8b5cf6'],['🔐 Deconflict','deconflict',S.secure]].map(([l,tab,c])=>(
          <div key={tab} onClick={()=>onNavigate(tab)} style={{ ...cardSm,cursor:'pointer',textAlign:'center',borderColor:c+'44',background:c+'11' }}>
            <div style={{ fontSize:20,marginBottom:4 }}>{l.split(' ')[0]}</div>
            <div style={{ color:c,fontSize:11,fontWeight:700 }}>{l.slice(l.indexOf(' ')+1)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Analytics() {
  const cases    = loadCases()
  const invoices = loadInvoices()
  const clients  = loadClients()
  const [tab, setTab] = useState('overview')

  // Revenue by sport
  const sportRevenue = {}
  cases.forEach(c => {
    const cInvs = invoices.filter(i=>i.caseId===c.id||i.clientId===c.clientId)
    const amt   = cInvs.reduce((s,i)=>s+(i.total||0),0)
    if (!sportRevenue[c.sport]) sportRevenue[c.sport] = { sport:c.sport, total:0, cases:0, paid:0 }
    sportRevenue[c.sport].total += amt
    sportRevenue[c.sport].cases += 1
    sportRevenue[c.sport].paid  += cInvs.filter(i=>i.status==='paid').reduce((s,i)=>s+(i.total||0),0)
  })
  const sportRevData = Object.values(sportRevenue).sort((a,b)=>b.total-a.total)

  // ROI per case
  const caseROI = cases.map(c=>{
    const hours  = (c.timeLogs||[]).reduce((s,t)=>s+(t.hours||0),0)
    const billed = invoices.filter(i=>i.caseId===c.id).reduce((s,i)=>s+(i.total||0),0)
    const cost   = hours * 150 // estimated hourly cost
    const roi    = cost > 0 ? (((billed-cost)/cost)*100).toFixed(0) : 0
    return { ...c, hours, billed, cost, roi:parseFloat(roi) }
  }).filter(c=>c.hours>0||c.billed>0).sort((a,b)=>b.roi-a.roi)

  const totalHours   = cases.reduce((s,c)=>(c.timeLogs||[]).reduce((ss,t)=>ss+(t.hours||0),0)+s,0)
  const totalBilled  = invoices.reduce((s,i)=>s+(i.total||0),0)
  const totalPaid    = invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+(i.total||0),0)
  const avgIRI       = cases.length ? Math.round(cases.reduce((s,c)=>s+(c.iri||0),0)/cases.length) : 0

  return (
    <div>
      <SectionHeader title="📊 Analytics" subtitle="IRI trends · Revenue by sport · ROI per case · Case performance"/>
      <div style={{ display:'flex',gap:14,marginBottom:20,flexWrap:'wrap' }}>
        <StatCard label="Total Cases" value={cases.length}/>
        <StatCard label="Active" value={cases.filter(c=>c.status!=='Closed').length} color={S.danger}/>
        <StatCard label="Avg IRI" value={avgIRI} color={iriBand(avgIRI).color}/>
        <StatCard label="Total Hours" value={`${totalHours.toFixed(0)}h`} color={S.info}/>
        <StatCard label="Total Billed" value={`$${totalBilled.toLocaleString()}`} color={S.accent}/>
        <StatCard label="Collected" value={`$${totalPaid.toLocaleString()}`} color={S.ok}/>
      </div>

      <div style={{ display:'flex',gap:6,marginBottom:16 }}>
        {[['overview','📈 Trends'],['sport','⚽ Revenue by Sport'],['roi','💰 ROI per Case']].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{ padding:'6px 14px',borderRadius:6,fontSize:12,cursor:'pointer',background:tab===v?S.mid:'transparent',color:tab===v?S.accent:S.dim,border:`1px solid ${tab===v?S.border:'transparent'}`,fontWeight:tab===v?700:400 }}>{l}</button>
        ))}
      </div>

      {tab==='overview' && (
        <div style={{ ...card,marginBottom:20 }}>
          <div style={{ color:S.text,fontSize:14,fontWeight:700,marginBottom:12 }}>IRI System Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={TREND_DATA}><CartesianGrid strokeDasharray="3 3" stroke={S.border}/><XAxis dataKey="m" tick={{ fill:S.dim,fontSize:11 }}/><YAxis tick={{ fill:S.dim,fontSize:11 }}/><Tooltip contentStyle={{ background:S.card,border:`1px solid ${S.border}`,borderRadius:8 }}/><ReferenceLine y={70} stroke={S.danger} strokeDasharray="3 3"/><Line type="monotone" dataKey="iri" stroke={S.accent} strokeWidth={2.5} dot={false}/><Bar dataKey="cases" fill={S.info+'44'}/></ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab==='sport' && (
        <div>
          {sportRevData.length===0 && <div style={{ ...card,textAlign:'center',color:S.dim,padding:32 }}>No revenue data yet. Create cases and invoices to see revenue by sport breakdown.</div>}
          {sportRevData.map(s=>{
            const sc = SPORTS_CONFIG[s.sport]
            return (
              <div key={s.sport} style={{ ...card,marginBottom:10 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
                  <div>
                    <div style={{ color:S.text,fontSize:14,fontWeight:700 }}>{sc?.icon} {sc?.label||s.sport}</div>
                    <div style={{ color:S.dim,fontSize:11 }}>{s.cases} case{s.cases!==1?'s':''} · {totalHours.toFixed(0)}h logged</div>
                  </div>
                  <div style={{ display:'flex',gap:20 }}>
                    <div style={{ textAlign:'right' }}><div style={{ color:S.dim,fontSize:10 }}>BILLED</div><div style={{ color:S.accent,fontSize:18,fontWeight:700 }}>${s.total.toLocaleString()}</div></div>
                    <div style={{ textAlign:'right' }}><div style={{ color:S.dim,fontSize:10 }}>PAID</div><div style={{ color:S.ok,fontSize:18,fontWeight:700 }}>${s.paid.toLocaleString()}</div></div>
                  </div>
                </div>
                <div style={{ marginTop:8,background:S.mid,borderRadius:4,height:5 }}>
                  <div style={{ background:S.ok,borderRadius:4,height:5,width:s.total>0?`${(s.paid/s.total)*100}%`:'0%',transition:'width .4s' }}/>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab==='roi' && (
        <div>
          {caseROI.length===0 && <div style={{ ...card,textAlign:'center',color:S.dim,padding:32 }}>Log time on cases and create invoices to see ROI tracking.</div>}
          {caseROI.map(c=>(
            <div key={c.id} style={{ ...card,marginBottom:10,borderLeft:`3px solid ${c.roi>50?S.ok:c.roi<0?S.danger:S.warn}` }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
                <div>
                  <div style={{ color:S.text,fontSize:13,fontWeight:700 }}>{c.id} — {c.title}</div>
                  <div style={{ color:S.dim,fontSize:11 }}>Hours: {c.hours.toFixed(1)}h · Cost est: ${c.cost.toLocaleString()} · Billed: ${c.billed.toLocaleString()}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ color:S.dim,fontSize:10 }}>ROI</div>
                  <div style={{ color:c.roi>50?S.ok:c.roi<0?S.danger:S.warn,fontSize:22,fontWeight:800 }}>{c.roi>0?'+':''}{c.roi}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SecurityStatus() {
  const checks = [
    {label:'SHA-256 credential hashing',      status:'ok',   detail:'Passwords never stored plain text'},
    {label:'8-hour session TTL',              status:'ok',   detail:'Sessions expire automatically'},
    {label:'Account freeze capability',       status:'ok',   detail:'God Mode can freeze any account instantly'},
    {label:'Authentication audit log',        status:'ok',   detail:'All login events logged with timestamps'},
    {label:'Sport-level access control',      status:'ok',   detail:'Each account restricted to permitted sports'},
    {label:'Role-based tab access',           status:'ok',   detail:'Tabs enforced by role — not just hidden'},
    {label:'Case soft-delete (recovery)',     status:'ok',   detail:'Archive + restore — nothing permanently lost'},
    {label:'localStorage encryption',         status:'warn', detail:'Data encrypted at rest — upgrade to DynamoDB for production'},
    {label:'AWS Cognito (production auth)',    status:'todo', detail:'Replace auth.js with Cognito for cloud deployment'},
    {label:'QLDB immutable audit chain',      status:'todo', detail:'Wire generateCasePdf.js Lambda'},
    {label:'S3 WORM evidence storage',        status:'todo', detail:'Provision EvidenceVaultBucket via template.yaml'},
  ]
  const sc = s=>({ok:S.ok,warn:S.warn,todo:S.dim}[s])
  return (
    <div>
      <SectionHeader title="🔒 Security Status" subtitle={`IRI v${VERSION} · Current implementation`}/>
      <div style={{ display:'flex',gap:14,marginBottom:18,flexWrap:'wrap' }}>
        {[['Active',checks.filter(c=>c.status==='ok').length,S.ok],['Warnings',checks.filter(c=>c.status==='warn').length,S.warn],['Planned',checks.filter(c=>c.status==='todo').length,S.dim]].map(([l,v,c])=><StatCard key={l} label={l} value={v} color={c}/>)}
      </div>
      {checks.map(c=>(
        <div key={c.label} style={{ ...cardSm,marginBottom:8,borderLeft:`3px solid ${sc(c.status)}` }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <div><div style={{ color:S.text,fontSize:12,fontWeight:600 }}>{c.label}</div><div style={{ color:S.dim,fontSize:11 }}>{c.detail}</div></div>
            <span style={{ ...badge(sc(c.status)),fontSize:9 }}>{c.status.toUpperCase()}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function Help({ user }) {
  return (
    <div>
      <SectionHeader title={`❓ Help — IRI v${VERSION}`} subtitle={`Role: ${ALL_ROLES[user?.role]?.icon} ${ALL_ROLES[user?.role]?.label}`}/>
      {[
        ['God Mode — User Management','Add users, set passwords, freeze accounts, assign roles, restrict sports per account. Impersonate any role to see what that user sees. God Mode → Users tab.'],
        ['Case System — 9 Tabs','Overview · Notes (sign-off workflow) · Timeline (auto-logged) · Files (upload) · Phone Log · Stakeout · Leads · Governance Infractions · Time Log. All persisted across sessions.'],
        ['Case Recovery','Cases are never permanently deleted — they are archived. God Mode → Cases → Recovery button to restore archived cases.'],
        ['Export Formats','Every case report, invoice, and billing summary exports as PDF, Word (.doc), or Excel (.xlsx). Look for the Export button on any case or invoice.'],
        ['Billing — Line Items','Create invoices with multiple line items. Each line item has description, quantity/hours, and rate. Tax calculated automatically. Export to PDF, Word, or Excel.'],
        ['Sport Permissions','Each user account can be restricted to specific sports. Go to God Mode → Users → Edit user → Sports Access. Users only see their permitted sports in Live Monitor.'],
        ['Fresh Start','The platform starts with zero sample data — no cases, no clients, no invoices. Everything you create is real and persists.'],
        ['Default Credentials','Username: IntegrityChief · Password: IntegrityConf24! · Change this password immediately in God Mode → Users → Password Reset.'],
      ].map(([t,b])=>(
        <div key={t} style={{ background:S.card,border:`1px solid ${S.border}`,borderRadius:12,padding:18,marginBottom:14 }}>
          <div style={{ color:S.accent,fontSize:14,fontWeight:700,marginBottom:8 }}>{t}</div>
          <div style={{ color:S.midText,fontSize:12,lineHeight:1.8 }}>{b}</div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// API METRICS PANEL (restored from v1.4.0)
// ═══════════════════════════════════════════════════════════════════════════════
function APIMetricsPanel() {
  const [apis, setApis] = useState(()=>loadApis(INITIAL_APIS))
  const toggle = (id) => { const next=apis.map(a=>a.id===id?{...a,enabled:!a.enabled,status:!a.enabled?'live':'warn'}:a); setApis(next); saveApis(next) }
  const sc = s=>s==='live'?S.ok:s==='warn'?S.warn:S.danger
  const totalCalls = apis.reduce((s,a)=>s+(a.totalCalls||0),0)
  const avgCredibility = apis.length ? Math.round(apis.reduce((s,a)=>s+(a.credibility||0),0)/apis.length) : 0
  return (
    <div>
      <SectionHeader title="🔌 API Credibility Meter" subtitle="Live API health · Credibility scoring · Call statistics"/>
      <div style={{ display:'flex',gap:14,marginBottom:16,flexWrap:'wrap' }}>
        <StatCard label="Active APIs" value={apis.filter(a=>a.enabled).length} color={S.ok}/>
        <StatCard label="Total Calls" value={totalCalls.toLocaleString()} color={S.info}/>
        <StatCard label="Avg Credibility" value={`${avgCredibility}%`} color={iriBand(avgCredibility).color}/>
        <StatCard label="Errors" value={apis.filter(a=>a.status==='error').length} color={S.danger}/>
      </div>
      {apis.map(a=>{
        const cred = a.credibility||0
        return (
          <div key={a.id} style={{ ...card,marginBottom:8,borderLeft:`3px solid ${a.enabled?sc(a.status):S.dim}`,opacity:a.enabled?1:.6 }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:4 }}>
                  <div style={{ width:7,height:7,borderRadius:'50%',background:a.enabled?sc(a.status):S.dim }}/>
                  <span style={{ color:S.text,fontWeight:700 }}>{a.name}</span>
                  <span style={{ ...badge(a.enabled?sc(a.status):S.dim) }}>{a.enabled?a.status?.toUpperCase():'DISABLED'}</span>
                  {a.sports?.map(s=><SportBadge key={s} sport={s}/>)}
                </div>
                <div style={{ display:'flex',gap:16,flexWrap:'wrap',marginTop:4 }}>
                  {[['Calls',`${(a.successCalls||0).toLocaleString()}/${(a.totalCalls||0).toLocaleString()}`],['Credibility',`${cred}%`],['Avg Latency',`${a.avgLatencyMs||0}ms`],['Confirmed Alerts',`${a.confirmedAlerts||0}/${a.totalAlerts||0}`]].map(([l,v])=>(
                    <div key={l}><div style={{ color:S.dim,fontSize:9 }}>{l}</div><div style={{ color:S.text,fontSize:11,fontWeight:600 }}>{v}</div></div>
                  ))}
                </div>
                <div style={{ marginTop:6,background:S.mid,borderRadius:4,height:5 }}>
                  <div style={{ background:iriBand(cred).color,borderRadius:4,height:5,width:`${cred}%`,transition:'width .4s' }}/>
                </div>
              </div>
              <Toggle on={a.enabled} onChange={()=>toggle(a.id)} color={S.ok}/>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB REGISTRY + DASHBOARD
//
// ⚠ PERMANENT MODULES — DO NOT REMOVE OR SET component:null FOR THESE:
//   nexus      → NexusGraph        (Louvain community detection)
//   chrono     → ChronoEngine      (match timeline replay)
//   finint     → FinintLayer       (betting flow / syndicate fingerprinting)
//   overwatch  → OverwatchEngine   (pre-match Black/Red/Yellow alerts)
//   predictive → PredictiveModeling (future risk forecasting)
//   deconflict → DeconflictionEngine (blind hash multi-agency matching)
//
// These were originally built in v1.5.0 and must remain live in all future
// versions. They are imported from src/components/Intelligence.jsx.
// If Intelligence.jsx is missing, the build will fail at import time — which
// is intentional. Never replace these with PlaceholderModule.
// ═══════════════════════════════════════════════════════════════════════════════

// Runtime guard: crash loudly in dev if any core module is missing
if (typeof NexusGraph==='undefined'||typeof ChronoEngine==='undefined'||typeof FinintLayer==='undefined'||typeof OverwatchEngine==='undefined'||typeof PredictiveModeling==='undefined'||typeof DeconflictionEngine==='undefined'||typeof AdvancedModules==='undefined') {
  throw new Error('[IRI v'+VERSION+'] FATAL: One or more permanent modules missing. Check Intelligence.jsx and Advanced.jsx imports.')
}

const ALL_TABS = [
  { id:'triage',      label:'🌅 Triage',           component:TriageDashboard,       needsNav:true },
  { id:'godmode',     label:'👁️ God Mode',           component:null },
  { id:'nexus',       label:'🕸️ Nexus Graph',       component:NexusGraph            },
  { id:'chrono',      label:'⏱ Chrono Engine',      component:ChronoEngine          },
  { id:'finint',      label:'💰 FININT',             component:FinintLayer           },
  { id:'overwatch',   label:'🚨 Overwatch',          component:OverwatchEngine       },
  { id:'predictive',  label:'🔮 Predictive',         component:PredictiveModeling    },
  { id:'deconflict',  label:'🔐 Deconflict',         component:DeconflictionEngine   },
  { id:'cases',       label:'🔨 Cases',              component:CaseManagement        },
  { id:'informants',  label:'🔐 Informants',         component:InformantModule       },
  { id:'trackers',    label:'📡 Trackers',           component:TrackerSystem         },
  { id:'roster',      label:'📋 Roster',             component:RosterModule          },
  { id:'associates',  label:'🔗 Known Associates',   component:KnownAssociates       },
  { id:'dossiers',    label:'📁 Dossiers',           component:DossierModule         },
  { id:'messaging',   label:'💬 Messaging',          component:SecureMessaging       },
  { id:'timekeeping', label:'💼 Billing',            component:Billing               },
  { id:'cease',       label:'⚖️ Cease & Desist',     component:CeaseAndDesist        },
  { id:'workgroup',   label:'👥 Workgroup',          component:WorkgroupBoard        },
  { id:'sandbox',     label:'🧪 Sandbox / Live',     component:SandboxManager        },
  { id:'monitor',     label:'📡 Live Monitor',       component:LiveMonitor           },
  { id:'iri',         label:'⚡ IRI v2',             component:IRICalculator         },
  { id:'api',         label:'🔌 API Meter',          component:APIMetricsPanel       },
  { id:'analytics',   label:'📊 Analytics',          component:Analytics             },
  { id:'alerts',      label:'🔔 Alerts',             component:AlertsPanel           },
  { id:'advanced',    label:'🧬 Advanced',           component:AdvancedModules       },
  { id:'sharp',       label:'🎲 Sharp Bettors',      component:SharpBettors          },
  { id:'datapoints',  label:'📡 Data Points',        component:DataPointSelector     },
  { id:'featureapis', label:'🔌 Features API',       component:FeaturesAPIMenu       },
  { id:'sportsapis',  label:'⚽ Sports API',          component:SportsAPIMenu         },
  { id:'security',    label:'🔒 Security',           component:SecurityStatus        },
  { id:'help',        label:'❓ Help',               component:Help                  },
]

function Dashboard({ user: rawUser, onLogout }) {
  const [tab,             setTab]             = useState('triage')
  const [liveData,        setLiveData]        = useState(null)
  const [omniOpen,        setOmni]            = useState(false)
  const [impersonatedRole,setImpersonated]    = useState(null)
  const [settings,        setSettingsState]   = useState(loadSettings)
  const [darkMode,        setDarkMode]        = useState(true)

  const isSandbox    = isSandboxUser(rawUser?.id)
  const isLive       = loadLiveMode() && rawUser?.role === 'god'
  const user         = impersonatedRole ? { ...rawUser, role:impersonatedRole } : rawUser
  const role         = ALL_ROLES[user.role]
  const allowedTabs  = ROLE_TABS[user.role] || []
  const visibleTabs  = [...new Map(ALL_TABS.filter(t=>allowedTabs.includes(t.id)).map(t=>[t.id,t])).values()]
  const unreadAlerts = loadAlerts().filter(a=>!a.read).length

  useEffect(()=>{ const handler=(e)=>{ if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();setOmni(o=>!o)} }; window.addEventListener('keydown',handler); return()=>window.removeEventListener('keydown',handler) },[])

  const ActiveComp = visibleTabs.find(t=>t.id===tab)?.component
  const createCaseFromAlert = (caseData) => {
    const prefix = loadSettings()?.casePrefix || 'CASE'
    const c = { id:`${prefix}-${Date.now().toString().slice(-5)}`, ...caseData, iri:0, confidence:0, status:'Open', stage:'Initial Alert', created:new Date().toISOString().slice(0,10), due:'TBD', entities:[], linkedCases:[], notes:[], timeline:[{ id:`TL-${Date.now().toString(36)}`,ts:new Date().toISOString().slice(0,16).replace('T',' '),user:rawUser.username,type:'Auto-Created from Alert',icon:'🚨',color:S.danger,text:`Overwatch auto-case: ${caseData.description?.slice(0,100)}` }], files:[], phoneLog:[], stakeoutLog:[], leads:[], infractions:[], timeLogs:[] }
    addCase(c)
    setTab('cases')
  }

  const tabProps = { user, liveData, liveOdds:liveData?.odds, onNavigate:setTab, settings, onCreateCase:createCaseFromAlert }

  return (
    <div style={{ display:'flex',flexDirection:'column',minHeight:'100vh',fontFamily:"'DM Sans',sans-serif",background:darkMode?S.bg:'#f8fafc' }}>
      {omniOpen && <OmniBar onClose={()=>setOmni(false)} onNavigate={(t)=>{ setTab(t); setOmni(false) }}/>}

      {/* Sandbox banner */}
      {isSandbox && <div style={{ background:'#f59e0b22', borderBottom:`1px solid #f59e0b44`, padding:'6px 20px', textAlign:'center', color:'#f59e0b', fontSize:12, fontWeight:700 }}>🧪 SANDBOX MODE — Training environment. Data is simulated. Changes do not affect the live platform.</div>}

      {/* Live mode banner */}
      {isLive && <div style={{ background:`${S.danger}22`, borderBottom:`1px solid ${S.danger}44`, padding:'6px 20px', textAlign:'center', color:S.danger, fontSize:12, fontWeight:700 }}>⚡ LIVE MODE ACTIVE — All data sourced from real APIs. Alerts and IRI scores are live.</div>}

      <div style={{ background:S.card,borderBottom:`1px solid ${S.border}`,height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',position:'sticky',top:0,zIndex:100,gap:12 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <span style={{ fontSize:20 }}>🛡️</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:800,color:S.text }}>IRI <span style={{ color:S.accent }}>v{VERSION}</span></span>
          {impersonatedRole && <span style={{ ...badge(role?.color||S.dim),fontSize:9 }}>👁️ VIEWING AS</span>}
          {isSandbox && <span style={{ ...badge('#f59e0b'),fontSize:9 }}>🧪 SANDBOX</span>}
          {isLive && <span style={{ ...badge(S.danger),fontSize:9 }}>⚡ LIVE</span>}
        </div>
        <button onClick={()=>setOmni(true)} style={{ flex:1,maxWidth:280,display:'flex',alignItems:'center',gap:8,background:S.mid,border:`1px solid ${S.border}`,borderRadius:8,padding:'7px 12px',cursor:'pointer',color:S.dim,fontSize:12 }}>
          <Search size={12}/> OmniBar…<kbd style={{ marginLeft:'auto',fontSize:10,background:S.border,padding:'1px 5px',borderRadius:3 }}>⌘K</kbd>
        </button>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          {impersonatedRole && (
            <div style={{ display:'flex',alignItems:'center',gap:6,background:'#1a0a2e',border:`1px solid #a855f744`,borderRadius:8,padding:'4px 10px' }}>
              <span style={{ color:'#a855f7',fontSize:11,fontWeight:700 }}>👁️ {ALL_ROLES[impersonatedRole]?.icon}</span>
              <select value={impersonatedRole||''} onChange={e=>{ const v=e.target.value; if(v)setImpersonated(v); else setImpersonated(null) }} style={{ background:'transparent',border:'none',color:'#a855f7',fontSize:11,cursor:'pointer',outline:'none' }}>
                <option value="">— Exit Role View —</option>
                {Object.entries(ALL_ROLES).filter(([k])=>k!=='god').map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
          )}
          <button onClick={()=>setDarkMode(d=>!d)} style={{ background:'transparent',border:`1px solid ${S.border}`,borderRadius:6,padding:'5px 8px',color:S.dim,cursor:'pointer' }} title="Toggle dark/light mode">
            {darkMode?'☀️':'🌙'}
          </button>
          <span style={{ ...badge(role?.color||S.accent) }}>{role?.icon} {role?.label}</span>
          <span style={{ color:S.text,fontSize:12 }}>{rawUser.displayName||rawUser.username}</span>
          <button onClick={onLogout} style={{ background:'transparent',border:`1px solid ${S.border}`,borderRadius:6,padding:'5px 10px',color:S.dim,fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',gap:4 }}><LogOut size={12}/> Out</button>
        </div>
      </div>
      <div style={{ background:S.card,borderBottom:`1px solid ${S.border}`,padding:'8px 20px',display:'flex',gap:4,overflowX:'auto',flexShrink:0 }}>
        {visibleTabs.map(t=>(
          <TabPill key={t.id} id={t.id} label={t.label} active={tab===t.id} onClick={setTab} badgeCount={t.id==='alerts'?unreadAlerts:0}/>
        ))}
      </div>
      <div style={{ flex:1,maxWidth:1300,width:'100%',margin:'0 auto',padding:'24px 20px' }}>
        {tab==='godmode' && rawUser.role==='god'
          ? <GodMode user={rawUser} onImpersonate={setImpersonated} onStopImpersonate={()=>setImpersonated(null)} isImpersonating={!!impersonatedRole} impersonatedRole={impersonatedRole}/>
          : ActiveComp
            ? <ActiveComp {...tabProps}/>
            : <div style={{ ...card,textAlign:'center',padding:48 }}><div style={{ color:S.dim,fontSize:13 }}>Tab not found — check your role permissions.</div></div>
        }
      </div>
      <div style={{ borderTop:`1px solid ${S.border}`,padding:'10px 20px',display:'flex',justifyContent:'space-between',color:S.dim,fontSize:10,flexWrap:'wrap',gap:4,fontFamily:"'IBM Plex Mono',monospace" }}>
        <span>IRI v{VERSION} · Kirby (2026) · Multi-Sport Intelligence OS · AUC 0.873</span>
        <span>SHA-256 · Session: 8h · {rawUser.sports?.length||'All'} sports · Role: {rawUser.role}</span>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.8}}`}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user,    setUser]    = useState(null)
  const [checked, setChecked] = useState(false)
  useEffect(()=>{ const s=loadSession(); if(s)setUser(s); setChecked(true) },[])
  const logout = () => { clearSession(); setUser(null) }
  if (!checked) return <div style={{ minHeight:'100vh',background:S.bg,display:'flex',alignItems:'center',justifyContent:'center' }}><div style={{ color:S.dim,fontFamily:"'IBM Plex Mono',monospace" }}>Initializing IRI…</div></div>
  if (!user)    return <AuthScreen onLogin={setUser}/>
  return <Dashboard user={user} onLogout={logout}/>
}
