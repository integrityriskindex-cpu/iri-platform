// IRI v1.6.0 — Extended God Mode Modules
// Sandbox Mode · Live Mode · Features API · Sports API · Workgroup · Data Points

import { useState, useRef } from 'react'
import { Plus, Trash2, CheckCircle2, Send, RefreshCw, Database, Zap, Globe } from 'lucide-react'
import { S, card, cardSm, badge, Btn, SectionHeader, StatCard, Field, fieldStyle, textareaStyle, Toggle, SportBadge, Modal } from './UI.jsx'
import { VERSION } from '../utils/iri.js'
import { ALL_ROLES, ALL_SPORTS, loadAllUsers, updateUser } from '../utils/auth.js'
import { SPORTS_CONFIG } from '../utils/data.js'
import { loadSandboxAccounts, enableSandbox, disableSandbox, isSandboxUser, loadLiveMode, saveLiveMode, loadFeatureApis, saveFeatureApis, loadSportApis, saveSportApis, loadDataPoints, saveDataPoints, loadPosts, savePosts, addPost, setInformantPin } from '../utils/store.js'

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5)
const ts  = () => new Date().toISOString().slice(0,16).replace('T',' ')

// ═══════════════════════════════════════════════════════════════════════════════
// SANDBOX MODE MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
export function SandboxManager({ currentUser }) {
  const [users,        setUsers]       = useState(loadAllUsers)
  const [sandboxAccts, setSandboxAccts]= useState(loadSandboxAccounts)
  const [liveMode,     setLiveMode]    = useState(loadLiveMode)
  const isGod = currentUser?.role === 'god'

  const toggle = async (user) => {
    if (isSandboxUser(user.id)) { disableSandbox(user.id) }
    else { enableSandbox(user.id) }
    setSandboxAccts(loadSandboxAccounts())
  }

  const toggleLive = (v) => { saveLiveMode(v); setLiveMode(v) }

  return (
    <div>
      <SectionHeader title="🧪 Sandbox & Live Mode" subtitle="Sandbox: safe training environment · Live: real API data, no mock data"/>

      {/* Live Mode — God Mode only */}
      {isGod && (
        <div style={{ ...card, marginBottom:16, borderColor:S.danger+'88', background:'#1a0000' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ color:S.danger, fontSize:14, fontWeight:700, marginBottom:4 }}>⚡ LIVE MODE — God Mode Only</div>
              <div style={{ color:S.dim, fontSize:12 }}>When enabled, all data comes directly from live APIs. No mock data, no demo matches. Requires API keys to be configured in Sports API menu. All IRI scores, odds, and alerts are real-time.</div>
            </div>
            <Toggle on={liveMode} onChange={toggleLive} color={S.danger} label={liveMode ? '🔴 LIVE — Real Data Active' : '⚫ Offline — Mock Data'}/>
          </div>
          {liveMode && (
            <div style={{ ...cardSm, background:'#2a0000', borderColor:S.danger, marginTop:12 }}>
              <div style={{ color:S.danger, fontSize:12, fontWeight:700 }}>⚠ LIVE MODE ACTIVE — All data is real. Cases created, alerts fired, and IRI scores calculated from live API feeds.</div>
            </div>
          )}
        </div>
      )}

      {/* Sandbox accounts */}
      <div style={{ ...card, marginBottom:14 }}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:6 }}>🧪 Sandbox Mode — Training Environment</div>
        <div style={{ color:S.dim, fontSize:12, marginBottom:14, lineHeight:1.7 }}>
          Sandbox accounts see a fully functional version of the platform pre-populated with realistic demo data. They cannot affect live cases, real alerts, or production data. Perfect for Special Agents learning the system or for onboarding demonstrations.
        </div>
        <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
          <StatCard label="Sandbox Accounts" value={sandboxAccts.length} color='#f59e0b'/>
          <StatCard label="Live Accounts" value={users.length - sandboxAccts.length} color={S.ok}/>
        </div>
        {users.map(u => {
          const inSandbox = sandboxAccts.includes(u.id)
          const canToggle = isGod || (currentUser?.role === 'main_account' && ['special_agent'].includes(u.role))
          return (
            <div key={u.id} style={{ ...cardSm, marginBottom:8, borderLeft:`3px solid ${inSandbox ? '#f59e0b' : S.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                <div>
                  <span style={{ color:S.text, fontSize:13, fontWeight:600 }}>{u.username}</span>
                  <span style={{ color:S.dim, fontSize:11, marginLeft:8 }}>{ALL_ROLES[u.role]?.icon} {ALL_ROLES[u.role]?.label}</span>
                  {inSandbox && <span style={{ ...badge('#f59e0b'), fontSize:9, marginLeft:8 }}>🧪 SANDBOX</span>}
                </div>
                {canToggle && (
                  <Btn size="sm" color={inSandbox ? S.ok : '#f59e0b'} onClick={()=>toggle(u)}>
                    {inSandbox ? '✓ Disable Sandbox' : '🧪 Enable Sandbox'}
                  </Btn>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sandbox indicator for current user */}
      {isSandboxUser(currentUser?.id) && (
        <div style={{ ...card, borderColor:'#f59e0b', background:'#1a1000' }}>
          <div style={{ color:'#f59e0b', fontSize:13, fontWeight:700 }}>🧪 You are viewing SANDBOX MODE</div>
          <div style={{ color:S.dim, fontSize:12, marginTop:4 }}>All data is simulated. Changes here do not affect the live platform. Contact your supervisor to exit sandbox mode.</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURES API MENU — Add any API with activate/deactivate
// ═══════════════════════════════════════════════════════════════════════════════
export function FeaturesAPIMenu() {
  const [apis,    setApis]    = useState(loadFeatureApis)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ name:'', category:'intelligence', description:'', endpoint:'', apiKey:'', authType:'header', headerName:'X-API-Key', testEndpoint:'' })
  const [testing, setTesting] = useState(null)

  const persist = (next) => { setApis(next); saveFeatureApis(next) }

  const categories = [
    ['intelligence',  '🧠 Intelligence / AI'],
    ['transcription', '🎙️ Audio / Transcription'],
    ['geospatial',    '🗺️ Geospatial / Mapping'],
    ['financial',     '💰 Financial / Crypto'],
    ['social',        '📱 Social Media / SOCMINT'],
    ['telecom',       '📡 Telecom / SIGINT'],
    ['legal',         '⚖️ Legal / Corporate Registry'],
    ['biometric',     '🔬 Biometric / Media'],
    ['notification',  '📧 Notifications (Email/SMS)'],
    ['accounting',    '📊 Accounting (QuickBooks etc.)'],
    ['other',         '🔧 Other'],
  ]

  const catColor = c => ({intelligence:S.god,transcription:S.info,geospatial:S.ok,financial:S.accent,social:'#ec4899',telecom:'#06b6d4',legal:S.warn,biometric:'#8b5cf6',notification:S.ok,accounting:S.info,other:S.dim}[c]||S.dim)

  const add = () => {
    if (!form.name.trim() || !form.endpoint.trim()) return
    const api = { id:`FAPI-${uid()}`, ...form, enabled:false, status:'unconfigured', addedAt:ts(), lastTested:null, testResult:null }
    persist([...apis, api])
    setShowAdd(false)
    setForm({ name:'', category:'intelligence', description:'', endpoint:'', apiKey:'', authType:'header', headerName:'X-API-Key', testEndpoint:'' })
  }

  const toggleApi = (id) => persist(apis.map(a=>a.id===id?{...a,enabled:!a.enabled,status:a.enabled?'disabled':'active'}:a))
  const removeApi = (id) => persist(apis.filter(a=>a.id!==id))

  const testApi = async (api) => {
    setTesting(api.id)
    try {
      const headers = {}
      if (api.authType==='header') headers[api.headerName||'X-API-Key'] = api.apiKey
      const url = api.testEndpoint || api.endpoint
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) })
      const result = res.ok ? 'success' : `error_${res.status}`
      persist(apis.map(a=>a.id===api.id?{...a,testResult:result,lastTested:ts(),status:res.ok?'active':'error'}:a))
      setApis(loadFeatureApis())
    } catch(e) {
      persist(apis.map(a=>a.id===api.id?{...a,testResult:'connection_error',lastTested:ts(),status:'error'}:a))
      setApis(loadFeatureApis())
    }
    setTesting(null)
  }

  const groupedApis = categories.map(([cat,label])=>({ cat, label, items:apis.filter(a=>a.category===cat) })).filter(g=>g.items.length>0)

  return (
    <div>
      <SectionHeader title="🔌 Features API Registry" subtitle="Add any external API · Activate/deactivate · Test connection · Used by Advanced modules"/>
      <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
        <StatCard label="Total APIs" value={apis.length}/>
        <StatCard label="Active" value={apis.filter(a=>a.enabled).length} color={S.ok}/>
        <StatCard label="Errors" value={apis.filter(a=>a.status==='error').length} color={S.danger}/>
      </div>
      <Btn color={S.god} style={{ marginBottom:16 }} onClick={()=>setShowAdd(true)}><Plus size={10}/>Add API</Btn>

      {apis.length===0 && <div style={{ ...card, textAlign:'center', padding:32 }}>
        <div style={{ fontSize:32, marginBottom:10 }}>🔌</div>
        <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>No APIs Configured</div>
        <div style={{ color:S.dim, fontSize:12, marginTop:6 }}>Add API endpoints for advanced features like audio transcription, geofencing, crypto tracing, and more.</div>
      </div>}

      {groupedApis.map(({cat, label, items})=>(
        <div key={cat} style={{ marginBottom:20 }}>
          <div style={{ color:catColor(cat), fontSize:12, fontWeight:700, marginBottom:8 }}>{label}</div>
          {items.map(api=>(
            <div key={api.id} style={{ ...card, marginBottom:8, borderLeft:`3px solid ${api.enabled?catColor(api.category):S.border}`, opacity:api.enabled?1:.7 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                    <span style={{ color:S.text, fontSize:13, fontWeight:700 }}>{api.name}</span>
                    <span style={{ ...badge(api.enabled?S.ok:S.dim), fontSize:9 }}>{api.status?.toUpperCase()}</span>
                    <span style={{ ...badge(catColor(api.category)), fontSize:9 }}>{api.category}</span>
                  </div>
                  <div style={{ color:S.dim, fontSize:11 }}>{api.endpoint}</div>
                  {api.description && <div style={{ color:S.midText, fontSize:11, marginTop:2 }}>{api.description}</div>}
                  {api.lastTested && <div style={{ color:api.testResult==='success'?S.ok:S.danger, fontSize:10, marginTop:2 }}>Last test: {api.lastTested} — {api.testResult}</div>}
                </div>
                <div style={{ display:'flex', gap:6, flexDirection:'column', alignItems:'flex-end' }}>
                  <Toggle on={api.enabled} onChange={()=>toggleApi(api.id)} color={S.ok}/>
                  <div style={{ display:'flex', gap:4 }}>
                    <Btn size="sm" color={S.info} variant="outline" disabled={testing===api.id} onClick={()=>testApi(api)}>{testing===api.id?'Testing…':'Test'}</Btn>
                    <Btn size="sm" color={S.danger} variant="outline" onClick={()=>removeApi(api.id)}><Trash2 size={9}/></Btn>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add API to Registry" width={700}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="API NAME" required><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Whisper Audio Transcription" style={fieldStyle}/></Field>
            <Field label="CATEGORY">
              <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={fieldStyle}>
                {categories.map(([k,l])=><option key={k} value={k}>{l}</option>)}
              </select>
            </Field>
            <Field label="BASE ENDPOINT URL" required><input value={form.endpoint} onChange={e=>setForm(f=>({...f,endpoint:e.target.value}))} placeholder="https://api.example.com/v1" style={fieldStyle}/></Field>
            <Field label="TEST ENDPOINT (optional)"><input value={form.testEndpoint} onChange={e=>setForm(f=>({...f,testEndpoint:e.target.value}))} placeholder="https://api.example.com/v1/health" style={fieldStyle}/></Field>
            <Field label="AUTH TYPE">
              <select value={form.authType} onChange={e=>setForm(f=>({...f,authType:e.target.value}))} style={fieldStyle}>
                <option value="header">Header Key</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="oauth">OAuth 2.0</option>
                <option value="none">No Auth</option>
              </select>
            </Field>
            <Field label="HEADER NAME"><input value={form.headerName} onChange={e=>setForm(f=>({...f,headerName:e.target.value}))} placeholder="X-API-Key" style={fieldStyle}/></Field>
            <Field label="API KEY / TOKEN"><input type="password" value={form.apiKey} onChange={e=>setForm(f=>({...f,apiKey:e.target.value}))} placeholder="Paste your API key" style={fieldStyle}/></Field>
          </div>
          <Field label="DESCRIPTION"><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What does this API do?" style={{ ...textareaStyle, minHeight:60 }}/></Field>
          <div style={{ display:'flex', gap:8 }}><Btn onClick={add} color={S.god}><Plus size={10}/>Add API</Btn><Btn onClick={()=>setShowAdd(false)} color={S.dim} variant="outline">Cancel</Btn></div>
        </div>
      </Modal>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPORTS API MENU — Per-sport API configuration
// ═══════════════════════════════════════════════════════════════════════════════
export function SportsAPIMenu() {
  const [sportApis,   setSportApis]   = useState(loadSportApis)
  const [activeSport, setActiveSport] = useState(Object.keys(SPORTS_CONFIG)[0])
  const [showAdd,     setShowAdd]     = useState(false)
  const [form, setForm] = useState({ name:'', endpoint:'', apiKey:'', dataType:'schedule', notes:'' })

  const persist = (next) => { setSportApis(next); saveSportApis(next) }

  const getSportApis = (sport) => sportApis[sport] || []

  const add = () => {
    if (!form.name.trim()) return
    const api = { id:`SAPI-${uid()}`, ...form, enabled:false, addedAt:ts() }
    const updated = { ...sportApis, [activeSport]: [...getSportApis(activeSport), api] }
    persist(updated)
    setShowAdd(false)
    setForm({ name:'', endpoint:'', apiKey:'', dataType:'schedule', notes:'' })
  }

  const toggleSportApi = (sport, id) => {
    const updated = { ...sportApis, [sport]: getSportApis(sport).map(a=>a.id===id?{...a,enabled:!a.enabled}:a) }
    persist(updated)
  }

  const removeSportApi = (sport, id) => {
    const updated = { ...sportApis, [sport]: getSportApis(sport).filter(a=>a.id!==id) }
    persist(updated)
  }

  const sc = Object.entries(SPORTS_CONFIG)
  const activeApis = getSportApis(activeSport)

  return (
    <div>
      <SectionHeader title="⚽ Sports API Manager" subtitle="Configure data sources per sport — schedule, odds, player data, rankings"/>
      <div style={{ display:'flex', gap:0, marginBottom:20, overflowX:'auto', borderBottom:`1px solid ${S.border}` }}>
        {sc.map(([k,v])=>{
          const count = getSportApis(k).length
          const active = getSportApis(k).filter(a=>a.enabled).length
          return (
            <button key={k} onClick={()=>setActiveSport(k)} style={{ padding:'8px 14px', borderBottom:activeSport===k?`2px solid ${S.accent}`:'2px solid transparent', background:'transparent', color:activeSport===k?S.accent:S.dim, fontSize:12, cursor:'pointer', whiteSpace:'nowrap', position:'relative' }}>
              {v.icon} {v.label.split(' ')[0]}
              {count>0 && <span style={{ ...badge(active>0?S.ok:S.dim), fontSize:8, marginLeft:4 }}>{active}/{count}</span>}
            </button>
          )
        })}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div>
          <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>{SPORTS_CONFIG[activeSport]?.icon} {SPORTS_CONFIG[activeSport]?.label}</div>
          <div style={{ color:S.dim, fontSize:11 }}>{activeApis.length} API{activeApis.length!==1?'s':''} configured · {activeApis.filter(a=>a.enabled).length} active</div>
        </div>
        <Btn color={S.accent} onClick={()=>setShowAdd(true)}><Plus size={10}/>Add API for {SPORTS_CONFIG[activeSport]?.label.split(' ')[0]}</Btn>
      </div>

      {activeApis.length===0 && (
        <div style={{ ...card, textAlign:'center', padding:32 }}>
          <div style={{ color:S.dim, fontSize:12 }}>No APIs configured for {SPORTS_CONFIG[activeSport]?.label}. Add your first data source.</div>
        </div>
      )}

      {activeApis.map(api=>(
        <div key={api.id} style={{ ...card, marginBottom:8, borderLeft:`3px solid ${api.enabled?S.ok:S.border}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                <span style={{ color:S.text, fontSize:13, fontWeight:700 }}>{api.name}</span>
                <span style={{ ...badge(S.info), fontSize:9 }}>{api.dataType?.toUpperCase()}</span>
                <span style={{ ...badge(api.enabled?S.ok:S.dim), fontSize:9 }}>{api.enabled?'ACTIVE':'INACTIVE'}</span>
              </div>
              <div style={{ color:S.dim, fontSize:11 }}>{api.endpoint}</div>
              {api.notes && <div style={{ color:S.midText, fontSize:11 }}>{api.notes}</div>}
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <Toggle on={api.enabled} onChange={()=>toggleSportApi(activeSport, api.id)} color={S.ok}/>
              <Btn size="sm" color={S.danger} variant="outline" onClick={()=>removeSportApi(activeSport, api.id)}><Trash2 size={9}/></Btn>
            </div>
          </div>
        </div>
      ))}

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title={`Add API — ${SPORTS_CONFIG[activeSport]?.label}`} width={650}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="API NAME" required><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Sportradar Tennis v3" style={fieldStyle}/></Field>
            <Field label="DATA TYPE">
              <select value={form.dataType} onChange={e=>setForm(f=>({...f,dataType:e.target.value}))} style={fieldStyle}>
                {['schedule','odds','players','rankings','injuries','results','officials','coaches','stats','alerts'].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="ENDPOINT URL"><input value={form.endpoint} onChange={e=>setForm(f=>({...f,endpoint:e.target.value}))} placeholder="https://api.sportradar.com/..." style={fieldStyle}/></Field>
            <Field label="API KEY"><input type="password" value={form.apiKey} onChange={e=>setForm(f=>({...f,apiKey:e.target.value}))} placeholder="Your API key" style={fieldStyle}/></Field>
          </div>
          <Field label="NOTES"><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="What data does this endpoint return?" style={{ ...textareaStyle, minHeight:60 }}/></Field>
          <div style={{ display:'flex', gap:8 }}><Btn onClick={add} color={S.accent}><Plus size={10}/>Add</Btn><Btn onClick={()=>setShowAdd(false)} color={S.dim} variant="outline">Cancel</Btn></div>
        </div>
      </Modal>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA POINT SELECTOR — All modes can choose what to track
// ═══════════════════════════════════════════════════════════════════════════════
export function DataPointSelector({ user }) {
  const [points, setPoints] = useState(loadDataPoints)

  const allPoints = [
    ['iri',        '⚡', 'IRI Score',             'Core integrity risk index score from the IRI engine'],
    ['odds',       '💰', 'Betting Odds',           'Live and pre-match odds from connected bookmakers'],
    ['volume',     '📊', 'Betting Volume',          'Total monetary volume placed per market'],
    ['rankings',   '🏆', 'Player Rankings',         'Current ATP/WTA/sport-specific rankings and changes'],
    ['weather',    '🌤️', 'Weather / Surface',       'Match conditions affecting play and potentially manipulation'],
    ['injuries',   '🏥', 'Injury Reports',          'Reported injuries, withdrawal risk, fitness flags'],
    ['social',     '📱', 'Social Media Signals',    'Unusual social activity, sentiment shifts around match entities'],
    ['travel',     '✈️', 'Travel & Fatigue',        'Cross-timezone travel load, jet lag risk index'],
    ['financial',  '🏦', 'Financial / FININT',      'Suspicious financial flows linked to match entities'],
    ['movement',   '📍', 'Physical Movement',       'Location tracking signals (requires geospatial API)'],
    ['comms',      '📡', 'Comms Metadata',          'Communication pattern anomalies (requires telecom API)'],
    ['benford',    '🔬', 'Benford Law Analysis',    'Statistical digit distribution tests on betting data'],
    ['syndicate',  '🎯', 'Syndicate Fingerprint',   'Coordinated bet-timing pattern detection'],
    ['cluster',    '🕸️', 'Cluster Exposure',        'Proximity to known corruption network nodes'],
    ['predictive', '🔮', 'Predictive Risk Score',   'Forward-looking vulnerability index'],
    ['sentiment',  '🧠', 'Psychographic Sentiment', 'Behavioral and language analysis signals'],
  ]

  const save = (key, val) => {
    const next = { ...points, [key]: val }
    setPoints(next)
    saveDataPoints(next)
  }

  return (
    <div>
      <SectionHeader title="📡 Data Point Selection" subtitle="Choose which data points to monitor and track across the platform"/>
      <div style={{ ...card, marginBottom:14, borderLeft:`3px solid ${S.info}` }}>
        <div style={{ color:S.info, fontSize:12, fontWeight:700, marginBottom:4 }}>HOW THIS WORKS</div>
        <div style={{ color:S.dim, fontSize:12, lineHeight:1.7 }}>Selected data points appear in Live Monitor, Triage briefings, Tracker alerts, and IRI calculations. Points marked with (requires API) need the corresponding API configured in the Features API or Sports API menu in God Mode.</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {allPoints.map(([key, icon, label, desc])=>{
          const on = points[key] !== false
          return (
            <div key={key} onClick={()=>save(key,!on)} style={{ ...cardSm, cursor:'pointer', borderLeft:`3px solid ${on?S.ok:S.border}`, background:on?S.ok+'08':S.card }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:3 }}>
                    <span style={{ fontSize:16 }}>{icon}</span>
                    <span style={{ color:S.text, fontSize:13, fontWeight:on?700:400 }}>{label}</span>
                    {on && <span style={{ ...badge(S.ok), fontSize:9 }}>ACTIVE</span>}
                  </div>
                  <div style={{ color:S.dim, fontSize:11 }}>{desc}</div>
                </div>
                <div style={{ width:20, height:20, borderRadius:4, background:on?S.ok:S.mid, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {on && <CheckCircle2 size={12} color="#000"/>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKGROUP / TEAM BOARD — Real-time posts between agents
// ═══════════════════════════════════════════════════════════════════════════════
export function WorkgroupBoard({ user }) {
  const [posts,    setPosts]   = useState(loadPosts)
  const [newPost,  setNewPost] = useState('')
  const [type,     setType]    = useState('update')
  const [pinned,   setPinned]  = useState(false)

  const postTypes = [
    ['update',  '📋', S.info,   'General Update'],
    ['intel',   '🔍', S.god,    'Intelligence Note'],
    ['alert',   '🚨', S.danger, 'Urgent Alert'],
    ['request', '🙋', S.accent, 'Request / Question'],
    ['resolved','✅', S.ok,     'Resolved'],
  ]

  const typeColor = t => ({ update:S.info, intel:S.god, alert:S.danger, request:S.accent, resolved:S.ok }[t] || S.dim)

  const submit = () => {
    if (!newPost.trim()) return
    const post = { id:`WG-${uid()}`, author:user.username, role:user.role, ts:ts(), text:newPost, type, pinned, reactions:{}, replies:[] }
    const next = addPost(post)
    setPosts([...next])
    setNewPost('')
    setPinned(false)
  }

  const react = (postId, emoji) => {
    const next = loadPosts().map(p=>{
      if (p.id !== postId) return p
      const reactions = { ...p.reactions }
      if (reactions[emoji]?.includes(user.username)) {
        reactions[emoji] = reactions[emoji].filter(u=>u!==user.username)
      } else {
        reactions[emoji] = [...(reactions[emoji]||[]), user.username]
      }
      return { ...p, reactions }
    })
    setPosts(next)
    savePosts(next)
  }

  const pinnedPosts = posts.filter(p=>p.pinned)
  const regularPosts = [...posts.filter(p=>!p.pinned)].reverse()

  return (
    <div>
      <SectionHeader title="👥 Workgroup Board" subtitle="Team intelligence sharing · Persistent · Role-tagged"/>

      {/* Compose */}
      <div style={{ ...card, marginBottom:20 }}>
        <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
          {postTypes.map(([k,icon,c,l])=>(
            <button key={k} onClick={()=>setType(k)} style={{ padding:'5px 10px', borderRadius:6, fontSize:11, cursor:'pointer', background:type===k?c+'22':'transparent', color:type===k?c:S.dim, border:`1px solid ${type===k?c+'44':'transparent'}`, fontWeight:type===k?700:400 }}>{icon} {l}</button>
          ))}
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
            <Toggle on={pinned} onChange={setPinned} label="📌 Pin"/>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="Share an update, intelligence note, or request with your team…" style={{ ...textareaStyle, flex:1, minHeight:70 }} onKeyDown={e=>{ if(e.key==='Enter'&&e.metaKey)submit() }}/>
          <Btn color={typeColor(type)} onClick={submit} style={{ alignSelf:'flex-end' }}><Send size={12}/> Post</Btn>
        </div>
        <div style={{ color:S.dim, fontSize:10, marginTop:4 }}>⌘+Enter to post</div>
      </div>

      {/* Pinned posts */}
      {pinnedPosts.length>0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ color:S.warn, fontSize:12, fontWeight:700, marginBottom:8 }}>📌 PINNED</div>
          {pinnedPosts.map(post=><WorkgroupPost key={post.id} post={post} user={user} onReact={react} typeColor={typeColor}/>)}
        </div>
      )}

      {/* Regular posts */}
      <div>
        {regularPosts.length===0 && pinnedPosts.length===0 && (
          <div style={{ ...card, textAlign:'center', padding:32 }}>
            <div style={{ fontSize:32, marginBottom:10 }}>👥</div>
            <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>No Posts Yet</div>
            <div style={{ color:S.dim, fontSize:12, marginTop:6 }}>Share updates, intelligence notes, or questions with your team.</div>
          </div>
        )}
        {regularPosts.map(post=><WorkgroupPost key={post.id} post={post} user={user} onReact={react} typeColor={typeColor}/>)}
      </div>
    </div>
  )
}

function WorkgroupPost({ post, user, onReact, typeColor }) {
  const emojis = ['👍','🚨','✅','❓','⚠️']
  const c = typeColor(post.type)
  return (
    <div style={{ ...card, marginBottom:10, borderLeft:`3px solid ${c}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8, marginBottom:8 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:c+'33', display:'flex', alignItems:'center', justifyContent:'center', color:c, fontSize:11, fontWeight:700 }}>{post.author?.[0]?.toUpperCase()}</div>
          <span style={{ color:S.text, fontSize:13, fontWeight:600 }}>{post.author}</span>
          <span style={{ color:S.dim, fontSize:11 }}>{ALL_ROLES[post.role]?.icon}</span>
          {post.pinned && <span style={{ ...badge(S.warn), fontSize:9 }}>📌 Pinned</span>}
        </div>
        <span style={{ color:S.dim, fontSize:10 }}>{post.ts}</span>
      </div>
      <div style={{ color:S.text, fontSize:13, lineHeight:1.7, whiteSpace:'pre-wrap', marginBottom:10 }}>{post.text}</div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {emojis.map(e=>{
          const count = post.reactions?.[e]?.length || 0
          const reacted = post.reactions?.[e]?.includes(user.username)
          return <button key={e} onClick={()=>onReact(post.id,e)} style={{ padding:'3px 8px', borderRadius:12, fontSize:13, cursor:'pointer', background:reacted?c+'22':'transparent', border:`1px solid ${reacted?c:S.border}`, color:S.text }}>{e}{count>0&&<span style={{ fontSize:10, marginLeft:3 }}>{count}</span>}</button>
        })}
      </div>
    </div>
  )
}
