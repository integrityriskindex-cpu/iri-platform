// IRI v1.5.2 — Investigation Modules
// Informant Module · AI Narrative · Bank Statement · Key Discovery
// Tracker System · Dossier · Cease & Desist Generator

import { useState, useRef } from 'react'
import { jsPDF }      from 'jspdf'
import autoTable      from 'jspdf-autotable'
import { Download, Plus, Lock, Eye, FileText, Search, Trash2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'

import { S, card, cardSm, badge, Btn, SectionHeader, StatCard, Field, fieldStyle, textareaStyle, Toggle, SportBadge, Modal, ExportMenu } from './UI.jsx'
import { generateCaseNarrative, parseBankStatement, generateCeaseAndDesist } from '../utils/ai.js'
import { VERSION, iriBand }  from '../utils/iri.js'
import { ALL_ROLES, ALL_SPORTS } from '../utils/auth.js'
import { loadInformants, saveInformants, addInformant, updateInformant, loadTrackers, saveTrackers, addTracker, updateTracker, deleteTracker, loadDossiers, saveDossiers, addDossier, updateDossier, deleteDossier, verifyInformantPin, loadSettings } from '../utils/store.js'
import { SPORTS_CONFIG } from '../utils/data.js'

const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5)
const ts   = () => new Date().toISOString().slice(0,16).replace('T',' ')

// ═══════════════════════════════════════════════════════════════════════════════
// INFORMANT MODULE — Multi-auth protected, suspect vs witness, audio/video
// ═══════════════════════════════════════════════════════════════════════════════
export function InformantModule({ user }) {
  const [pinVerified, setPinVerified] = useState(false)
  const [pinInput,    setPinInput]    = useState('')
  const [pinError,    setPinError]    = useState('')
  const [informants,  setInformants]  = useState(loadInformants)
  const [showAdd,     setShowAdd]     = useState(false)
  const [active,      setActive]      = useState(null)
  const [form, setForm] = useState({ codename:'', classification:'witness', sport:'tennis', handler:'', dateRecruited:ts().split(' ')[0], credibility:50, notes:'', riskToSubject:'low', contactMethod:'encrypted_message', status:'active' })

  const persist = (next) => { setInformants(next); saveInformants(next) }

  const verifyPin = () => {
    // God mode always has access; others need a PIN
    if (user.role === 'god' || user.role === 'main_account') { setPinVerified(true); return }
    const ok = verifyInformantPin(user.id, pinInput)
    if (ok) { setPinVerified(true); setPinError('') }
    else { setPinError('Incorrect PIN. Contact your supervisor.'); setPinInput('') }
  }

  const create = () => {
    if (!form.codename.trim()) return
    const inf = { id:`INF-${uid()}`, ...form, addedBy:user.username, createdAt:ts(), media:[], contacts:[], interviews:[], lastModified:ts() }
    persist(addInformant(inf))
    setShowAdd(false)
    setForm({ codename:'', classification:'witness', sport:'tennis', handler:'', dateRecruited:ts().split(' ')[0], credibility:50, notes:'', riskToSubject:'low', contactMethod:'encrypted_message', status:'active' })
  }

  const classColor = c => ({ witness:S.ok, suspect:S.danger, informant:S.warn, converted_suspect:S.god }[c] || S.dim)

  if (!pinVerified) return (
    <div>
      <SectionHeader title="🔐 Informant Module" subtitle="Multi-authentication required · Identity protection active"/>
      <div style={{ ...card, maxWidth:400, margin:'40px auto', textAlign:'center', borderColor:'#a855f7', borderWidth:2 }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🔒</div>
        <div style={{ color:'#a855f7', fontSize:15, fontWeight:700, marginBottom:6 }}>Restricted Access</div>
        <div style={{ color:S.dim, fontSize:12, marginBottom:20 }}>This module contains protected informant records. A secondary PIN is required beyond your login credentials.</div>
        <Field label="SECONDARY PIN">
          <input type="password" value={pinInput} onChange={e=>setPinInput(e.target.value)} placeholder="Enter your informant module PIN" style={fieldStyle} onKeyDown={e=>e.key==='Enter'&&verifyPin()} autoFocus/>
        </Field>
        {pinError && <div style={{ color:S.danger, fontSize:12, marginTop:8 }}>{pinError}</div>}
        <div style={{ marginTop:14 }}>
          <Btn color='#a855f7' onClick={verifyPin} style={{ width:'100%', justifyContent:'center' }}><Lock size={11}/>Authenticate</Btn>
        </div>
        <div style={{ color:S.dim, fontSize:10, marginTop:12 }}>God Mode / Main Account bypass this gate.<br/>PINs are set by God Mode in User Management.</div>
      </div>
    </div>
  )

  if (active) {
    const inf = informants.find(i=>i.id===active.id) || active
    return (
      <div>
        <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14, flexWrap:'wrap' }}>
          <Btn onClick={()=>setActive(null)} color={S.dim} variant="outline" size="sm">← Informants</Btn>
          <span style={{ ...badge(classColor(inf.classification)) }}>{inf.classification.toUpperCase()}</span>
          <span style={{ color:'#a855f7', fontSize:12, fontWeight:700 }}>🔒 PROTECTED RECORD</span>
        </div>
        <div style={{ ...card, marginBottom:14, borderColor:'#a855f7', borderWidth:2 }}>
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ color:'#a855f7', fontSize:10, fontFamily:"'IBM Plex Mono',monospace" }}>CODENAME</div>
              <div style={{ color:S.text, fontSize:22, fontWeight:900 }}>{inf.codename}</div>
              <div style={{ color:S.dim, fontSize:11 }}>Handler: {inf.handler} · Recruited: {inf.dateRecruited} · Method: {inf.contactMethod}</div>
            </div>
            <div style={{ display:'flex', gap:14 }}>
              <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>CREDIBILITY</div><div style={{ color:iriBand(inf.credibility).color, fontSize:26, fontWeight:800 }}>{inf.credibility}%</div></div>
              <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>RISK TO SUBJECT</div><div style={{ color:inf.riskToSubject==='high'?S.danger:inf.riskToSubject==='medium'?S.warn:S.ok, fontSize:14, fontWeight:700, textTransform:'uppercase' }}>{inf.riskToSubject}</div></div>
            </div>
          </div>
        </div>
        {/* Convert witness ↔ suspect */}
        <div style={{ ...card, marginBottom:12 }}>
          <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:8 }}>Classification</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['witness','informant','suspect','converted_suspect'].map(cl=>(
              <Btn key={cl} size="sm" color={classColor(cl)} variant={inf.classification===cl?'solid':'outline'}
                onClick={()=>{ const next=informants.map(i=>i.id===inf.id?{...i,classification:cl,lastModified:ts()}:i); persist(next); setActive({...inf,classification:cl}) }}>
                {cl.replace('_',' ').toUpperCase()}
              </Btn>
            ))}
          </div>
          <div style={{ color:S.dim, fontSize:11, marginTop:8 }}>History attachment: if this subject was a prior case informant who became a suspect, link their old case via Case Management → Link Case.</div>
        </div>
        {/* Notes */}
        <div style={{ ...card, marginBottom:12 }}>
          <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:8 }}>Notes</div>
          <div style={{ color:S.midText, fontSize:12, whiteSpace:'pre-wrap', marginBottom:10 }}>{inf.notes}</div>
          <textarea defaultValue={inf.notes} onBlur={e=>{ const next=informants.map(i=>i.id===inf.id?{...i,notes:e.target.value,lastModified:ts()}:i); persist(next) }} style={{ ...textareaStyle, minHeight:80, width:'100%', boxSizing:'border-box' }}/>
        </div>
        {/* Media */}
        <div style={card}>
          <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:8 }}>Protected Media (Audio · Video · Documents)</div>
          <div style={{ ...cardSm, background:'#0d0014', borderColor:'#a855f7', marginBottom:10 }}>
            <div style={{ color:'#a855f7', fontSize:11 }}>🔒 All media in this section is protected. Only authorized personnel with module PIN access can view these files. Media is not included in standard case exports.</div>
          </div>
          <input type="file" accept="audio/*,video/*,.pdf,.txt,.docx" onChange={e=>{ const f=e.target.files?.[0]; if(!f)return; const entry={id:`M-${uid()}`,name:f.name,type:f.type,size:`${(f.size/1024).toFixed(0)} KB`,addedBy:user.username,ts:ts()}; const next=informants.map(i=>i.id===inf.id?{...i,media:[...i.media,entry]}:i); persist(next) }} style={{ ...fieldStyle, marginBottom:10 }}/>
          {inf.media?.map(m=>(
            <div key={m.id} style={{ ...cardSm, marginBottom:6, display:'flex', justifyContent:'space-between' }}>
              <div><div style={{ color:S.text, fontSize:12 }}>{m.name}</div><div style={{ color:S.dim, fontSize:10 }}>{m.size} · {m.addedBy} · {m.ts}</div></div>
              <Btn size="sm" color={S.danger} variant="outline" onClick={()=>{ const next=informants.map(i=>i.id===inf.id?{...i,media:i.media.filter(x=>x.id!==m.id)}:i); persist(next) }}><Trash2 size={9}/></Btn>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <SectionHeader title="🔐 Informant Module" subtitle="Protected · Multi-auth verified · Classification system"/>
      <div style={{ ...card, marginBottom:14, borderColor:'#a855f7', background:'#0d0014' }}>
        <div style={{ color:'#a855f7', fontSize:12, fontWeight:700 }}>🔒 AUTHENTICATED — Module access logged · All actions audit-trailed</div>
      </div>
      <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
        <StatCard label="Total" value={informants.length}/>
        <StatCard label="Witnesses" value={informants.filter(i=>i.classification==='witness').length} color={S.ok}/>
        <StatCard label="Suspects" value={informants.filter(i=>i.classification==='suspect'||i.classification==='converted_suspect').length} color={S.danger}/>
        <StatCard label="Active" value={informants.filter(i=>i.status==='active').length} color={S.info}/>
      </div>
      <Btn color='#a855f7' style={{ marginBottom:16 }} onClick={()=>setShowAdd(true)}><Plus size={10}/>Add Protected Record</Btn>
      {informants.length===0 && !showAdd && (
        <div style={{ ...card, textAlign:'center', padding:40 }}>
          <div style={{ fontSize:32, marginBottom:10 }}>🔐</div>
          <div style={{ color:S.text, fontSize:15, fontWeight:700, marginBottom:6 }}>No Informant Records</div>
          <div style={{ color:S.dim, fontSize:12 }}>Add a protected informant, witness, or suspect record.</div>
        </div>
      )}
      {informants.map(inf=>(
        <div key={inf.id} onClick={()=>setActive(inf)} style={{ ...card, marginBottom:10, cursor:'pointer', borderLeft:`3px solid ${'#a855f7'}`, opacity:inf.status==='inactive'?.6:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                <span style={{ color:'#a855f7', fontSize:14, fontWeight:800 }}>{inf.codename}</span>
                <span style={{ ...badge(classColor(inf.classification)), fontSize:10 }}>{inf.classification.replace('_',' ').toUpperCase()}</span>
                <SportBadge sport={inf.sport}/>
              </div>
              <div style={{ color:S.dim, fontSize:11 }}>Handler: {inf.handler} · Recruited: {inf.dateRecruited} · Media: {inf.media?.length||0} files · Risk: {inf.riskToSubject}</div>
            </div>
            <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>CREDIBILITY</div><div style={{ color:iriBand(inf.credibility).color, fontSize:20, fontWeight:800 }}>{inf.credibility}%</div></div>
          </div>
        </div>
      ))}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Protected Informant Record" width={700}>
        <div style={{ ...cardSm, background:'#0d0014', borderColor:'#a855f7', marginBottom:12 }}>
          <div style={{ color:'#a855f7', fontSize:11 }}>🔒 This record will be stored in the protected informant registry. A codename must be used — never real names in this field.</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="CODENAME (no real names)" required><input value={form.codename} onChange={e=>setForm(f=>({...f,codename:e.target.value}))} placeholder="e.g. SPARROW-7" style={fieldStyle}/></Field>
            <Field label="CLASSIFICATION"><select value={form.classification} onChange={e=>setForm(f=>({...f,classification:e.target.value}))} style={fieldStyle}><option value="witness">Witness</option><option value="informant">Informant</option><option value="suspect">Suspect</option><option value="converted_suspect">Converted Suspect</option></select></Field>
            <Field label="SPORT"><select value={form.sport} onChange={e=>setForm(f=>({...f,sport:e.target.value}))} style={fieldStyle}>{Object.entries(SPORTS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</select></Field>
            <Field label="HANDLER (username)"><input value={form.handler} onChange={e=>setForm(f=>({...f,handler:e.target.value}))} style={fieldStyle}/></Field>
            <Field label="CONTACT METHOD"><select value={form.contactMethod} onChange={e=>setForm(f=>({...f,contactMethod:e.target.value}))} style={fieldStyle}><option value="encrypted_message">Encrypted Message</option><option value="dead_drop">Dead Drop</option><option value="phone">Phone (Burner)</option><option value="in_person">In Person</option><option value="lawyer">Through Lawyer</option></select></Field>
            <Field label="RISK TO SUBJECT"><select value={form.riskToSubject} onChange={e=>setForm(f=>({...f,riskToSubject:e.target.value}))} style={fieldStyle}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical — Witness Protection Level</option></select></Field>
            <Field label={`CREDIBILITY: ${form.credibility}%`}><input type="range" min="0" max="100" value={form.credibility} onChange={e=>setForm(f=>({...f,credibility:+e.target.value}))} style={{ width:'100%', accentColor:'#a855f7', marginTop:8 }}/></Field>
            <Field label="DATE RECRUITED"><input type="date" value={form.dateRecruited} onChange={e=>setForm(f=>({...f,dateRecruited:e.target.value}))} style={fieldStyle}/></Field>
          </div>
          <Field label="PROTECTED NOTES"><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Initial notes — this will be stored in the protected registry" style={{ ...textareaStyle, minHeight:80 }}/></Field>
          <div style={{ display:'flex', gap:8 }}><Btn color='#a855f7' onClick={create}><Plus size={10}/>Create Record</Btn><Btn color={S.dim} variant="outline" onClick={()=>setShowAdd(false)}>Cancel</Btn></div>
        </div>
      </Modal>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI NARRATIVE — Reads case file, generates investigation narrative
// ═══════════════════════════════════════════════════════════════════════════════
export function AINarrative({ c, user }) {
  const [narrative,  setNarrative]  = useState(c.aiNarrative || '')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [saved,      setSaved]      = useState(!!c.aiNarrative)

  const generate = async () => {
    setLoading(true); setError('')
    try {
      const text = await generateCaseNarrative(c)
      setNarrative(text); setSaved(false)
    } catch(e) { setError(e.message || 'AI generation failed') }
    setLoading(false)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(14).setFont('helvetica','bold').text(`AI NARRATIVE — ${c.id}`, 14, 20)
    doc.setFontSize(9).setFont('helvetica','normal').setTextColor(100).text(`Generated by IRI v${VERSION} · ${new Date().toLocaleDateString()}`, 14, 28)
    doc.setTextColor(0).setFontSize(10)
    const lines = doc.splitTextToSize(narrative, 180)
    doc.text(lines, 14, 38)
    doc.save(`${c.id}_ai_narrative.pdf`)
  }

  return (
    <div style={{ ...card }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, flexWrap:'wrap', gap:8 }}>
        <div>
          <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>🤖 AI Case Narrative</div>
          <div style={{ color:S.dim, fontSize:11 }}>Claude reads all case notes, timeline, leads and generates a structured investigation brief</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Btn color={S.god} onClick={generate} disabled={loading}>{loading?'🔄 Generating…':'✨ Generate Narrative'}</Btn>
          {narrative && <Btn color={S.info} variant="outline" onClick={downloadPDF}><Download size={10}/>PDF</Btn>}
        </div>
      </div>
      {error && <div style={{ ...cardSm, borderLeft:`3px solid ${S.danger}`, color:S.danger, fontSize:12, marginBottom:10 }}>⚠ {error}</div>}
      {!narrative && !loading && (
        <div style={{ ...cardSm, background:S.mid, textAlign:'center', padding:24 }}>
          <div style={{ color:S.dim, fontSize:12 }}>Click "Generate Narrative" to have the AI read through all {c.notes?.length||0} notes, {c.timeline?.length||0} timeline entries, and {c.files?.length||0} files and produce a structured investigation narrative.</div>
        </div>
      )}
      {loading && (
        <div style={{ ...cardSm, background:'#0d0014', textAlign:'center', padding:24 }}>
          <div style={{ color:'#a855f7', fontSize:12 }}>🤖 AI is reading your case file…</div>
        </div>
      )}
      {narrative && (
        <div style={{ background:S.mid, borderRadius:8, padding:16 }}>
          <pre style={{ color:S.text, fontSize:12, lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:"'DM Sans',sans-serif", margin:0 }}>{narrative}</pre>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BANK STATEMENT INGESTION — AI parses uploaded PDF/image into structured data
// ═══════════════════════════════════════════════════════════════════════════════
export function BankStatementIngestion({ c, user, onSave }) {
  const [loading,   setLoading]  = useState(false)
  const [result,    setResult]   = useState(null)
  const [error,     setError]    = useState('')
  const [saved,     setSaved]    = useState(false)
  const fileRef = useRef(null)

  const upload = async (e) => {
    const file = e.target.files?.[0]; if(!file) return
    if (file.size > 5*1024*1024) { setError('File too large. Max 5MB.'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const base64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=ev=>res(ev.target.result.split(',')[1]); r.onerror=rej; r.readAsDataURL(file) })
      const mediaType = file.type || 'image/jpeg'
      const parsed = await parseBankStatement(base64, mediaType)
      if (parsed.error) throw new Error(parsed.error)
      setResult(parsed)
    } catch(e) { setError(e.message||'AI parsing failed') }
    setLoading(false)
    e.target.value = ''
  }

  const save = () => {
    if (!result || !onSave) return
    onSave(result)
    setSaved(true)
  }

  const riskColor = t => t==='debit'?S.danger:S.ok

  return (
    <div style={card}>
      <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:6 }}>💳 Bank Statement Ingestion (AI)</div>
      <div style={{ color:S.dim, fontSize:11, marginBottom:14 }}>Upload a bank statement PDF or photo. AI extracts all transactions, flags suspicious patterns, and attaches structured data to the case.</div>
      <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
        <Btn color={S.accent} onClick={()=>fileRef.current?.click()} disabled={loading}><FileText size={10}/>{loading?'Parsing…':'Upload Statement'}</Btn>
        <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={upload} style={{ display:'none' }}/>
        {result && !saved && <Btn color={S.ok} onClick={save}><CheckCircle2 size={10}/>Save to Case</Btn>}
        {saved && <span style={{ ...badge(S.ok), alignSelf:'center' }}>✓ Saved to case file</span>}
      </div>
      {error && <div style={{ ...cardSm, borderLeft:`3px solid ${S.danger}`, color:S.danger, fontSize:12, marginBottom:10 }}>⚠ {error}</div>}
      {loading && <div style={{ ...cardSm, background:'#0d0014', textAlign:'center', padding:20 }}><div style={{ color:S.god, fontSize:12 }}>🤖 AI is parsing your bank statement…</div></div>}
      {result && (
        <div>
          <div style={{ ...cardSm, marginBottom:10, background:S.mid }}>
            <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
              {[['Account',result.accountHolder],['Institution',result.institution],['Period',result.statementPeriod],['Opening Bal',`$${(result.openingBalance||0).toLocaleString()}`],['Closing Bal',`$${(result.closingBalance||0).toLocaleString()}`],['Total Credits',`$${(result.totalCredits||0).toLocaleString()}`],['Total Debits',`$${(result.totalDebits||0).toLocaleString()}`]].map(([l,v])=>(
                <div key={l}><div style={{ color:S.dim, fontSize:9 }}>{l}</div><div style={{ color:S.text, fontSize:12, fontWeight:600 }}>{v||'—'}</div></div>
              ))}
            </div>
          </div>
          {result.suspiciousPatterns?.length>0 && (
            <div style={{ ...cardSm, borderLeft:`3px solid ${S.danger}`, marginBottom:10 }}>
              <div style={{ color:S.danger, fontSize:11, fontWeight:700, marginBottom:4 }}>⚠ Suspicious Patterns Detected</div>
              {result.suspiciousPatterns.map((p,i)=><div key={i} style={{ color:S.midText, fontSize:11 }}>• {p}</div>)}
            </div>
          )}
          <div style={{ color:S.text, fontSize:12, fontWeight:700, marginBottom:8 }}>Transactions ({result.transactions?.length||0})</div>
          <div style={{ maxHeight:320, overflowY:'auto' }}>
            {result.transactions?.map((t,i)=>(
              <div key={i} style={{ ...cardSm, marginBottom:4, borderLeft:`3px solid ${t.flagged?S.danger:riskColor(t.type)}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                  <div style={{ flex:1 }}><div style={{ color:S.text, fontSize:12 }}>{t.description}</div><div style={{ color:S.dim, fontSize:10 }}>{t.date} · Balance: ${(t.balance||0).toLocaleString()}</div>{t.flagged&&<div style={{ color:S.danger, fontSize:10 }}>⚠ {t.flagReason}</div>}</div>
                  <div style={{ color:riskColor(t.type), fontSize:13, fontWeight:700, whiteSpace:'nowrap' }}>{t.type==='debit'?'-':'+'} ${Math.abs(t.amount||0).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEY DISCOVERY — Selective document sharing to outside entities
// ═══════════════════════════════════════════════════════════════════════════════
export function KeyDiscovery({ c, user }) {
  const [selected, setSelected]   = useState({ notes:[], files:[], timeline:[], leads:[], infractions:[] })
  const [recipient, setRecipient] = useState({ name:'', org:'', purpose:'' })
  const [generated, setGenerated] = useState(false)
  const [section,   setSection]   = useState('select')

  const toggle = (type, id) => setSelected(s=>({ ...s, [type]: s[type].includes(id) ? s[type].filter(x=>x!==id) : [...s[type],id] }))
  const count  = Object.values(selected).flat().length

  const generate = () => {
    const doc = new jsPDF()
    const now  = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})
    const settings = loadSettings()

    doc.setFillColor(10,14,26); doc.rect(0,0,220,30,'F')
    doc.setTextColor(245,158,11); doc.setFontSize(14).setFont('helvetica','bold')
    doc.text('KEY DISCOVERY PACKAGE', 14, 12)
    doc.setTextColor(200,200,200); doc.setFontSize(9).setFont('helvetica','normal')
    doc.text(`Case: ${c.id} · Prepared for: ${recipient.name}, ${recipient.org}`, 14, 20)
    doc.text(`Purpose: ${recipient.purpose} · Generated: ${now} · IRI v${VERSION}`, 14, 27)
    doc.setTextColor(0)

    let y = 38
    doc.setFontSize(8).setTextColor(150)
    doc.text(`IMPORTANT: This discovery package contains ${count} selected item(s) from case ${c.id}. Additional investigation materials exist but have been withheld per investigative privilege. This document is confidential.`, 14, y, { maxWidth:180 })
    y += 16

    // Selected notes
    const selNotes = (c.notes||[]).filter(n=>selected.notes.includes(n.id))
    if (selNotes.length) {
      doc.setTextColor(0); doc.setFontSize(11).setFont('helvetica','bold').text('Case Notes', 14, y); y+=5
      autoTable(doc, { startY:y, head:[['Date/Time','Author','Note']], body:selNotes.map(n=>[n.ts,n.author,n.text?.slice(0,150)]), styles:{fontSize:8}, headStyles:{fillColor:[31,41,55]}, theme:'striped' })
      y = doc.lastAutoTable.finalY + 8
    }

    // Selected timeline
    const selTL = (c.timeline||[]).filter(t=>selected.timeline.includes(t.id))
    if (selTL.length) {
      doc.setFontSize(11).setFont('helvetica','bold').text('Timeline Events', 14, y); y+=5
      autoTable(doc, { startY:y, head:[['Timestamp','Agent','Event','Detail']], body:selTL.map(t=>[t.ts,t.user,t.type,t.text?.slice(0,120)]), styles:{fontSize:8}, headStyles:{fillColor:[31,41,55]}, theme:'striped' })
      y = doc.lastAutoTable.finalY + 8
    }

    // Selected files
    const selFiles = (c.files||[]).filter(f=>selected.files.includes(f.id))
    if (selFiles.length) {
      doc.setFontSize(11).setFont('helvetica','bold').text('Evidence Files', 14, y); y+=5
      autoTable(doc, { startY:y, head:[['Filename','Type','Size','Uploaded By']], body:selFiles.map(f=>[f.name,f.type,f.size,f.uploadedBy]), styles:{fontSize:8}, headStyles:{fillColor:[31,41,55]}, theme:'striped' })
    }

    // Chain of custody footer
    doc.addPage()
    doc.setFontSize(10).setFont('helvetica','bold').text('Chain of Custody — Key Discovery Log', 14, 20)
    autoTable(doc, { startY:28, body:[['Prepared by', user.displayName||user.username],['Recipient',`${recipient.name} — ${recipient.org}`],['Purpose',recipient.purpose],['Items disclosed',count.toString()],['Items withheld','[Withheld per investigative privilege]'],['Date',now],['Case',c.id],['Platform',`IRI v${VERSION}`]], styles:{fontSize:9}, columnStyles:{0:{fontStyle:'bold',cellWidth:50}}, theme:'grid' })

    doc.save(`${c.id}_discovery_${recipient.org?.replace(/\s/g,'_')||'package'}.pdf`)
    setGenerated(true)
  }

  const allItems = [
    ...(c.notes||[]).map(n=>({id:n.id,type:'notes',label:`[Note] ${n.ts} — ${n.author}: ${n.text?.slice(0,60)}…`})),
    ...(c.timeline||[]).map(t=>({id:t.id,type:'timeline',label:`[Timeline] ${t.ts} — ${t.type}: ${t.text?.slice(0,60)}`})),
    ...(c.files||[]).map(f=>({id:f.id,type:'files',label:`[File] ${f.name} (${f.size})`})),
    ...(c.leads||[]).map(l=>({id:l.id,type:'leads',label:`[Lead] ${l.name} — ${l.notes?.slice(0,50)}`})),
    ...(c.infractions||[]).map(i=>({id:i.id,type:'infractions',label:`[Infraction] ${i.body} — ${i.type}`})),
  ]

  return (
    <div style={card}>
      <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:6 }}>📋 Key Discovery</div>
      <div style={{ color:S.dim, fontSize:11, marginBottom:14 }}>Select which documents, notes, files and evidence to share with outside entities. Unselected items are withheld. A redacted discovery PDF is generated.</div>
      <div style={{ display:'flex', gap:6, marginBottom:14 }}>
        {[['select',`📂 Select Items (${count})`],['recipient','📬 Recipient'],['generate','📄 Generate']].map(([id,l])=>(
          <button key={id} onClick={()=>setSection(id)} style={{ padding:'6px 12px', borderRadius:6, fontSize:12, cursor:'pointer', background:section===id?S.mid:'transparent', color:section===id?S.accent:S.dim, border:`1px solid ${section===id?S.border:'transparent'}`, fontWeight:section===id?700:400 }}>{l}</button>
        ))}
      </div>
      {section==='select' && (
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
            <Btn size="sm" color={S.dim} variant="outline" onClick={()=>setSelected({notes:(c.notes||[]).map(n=>n.id),files:(c.files||[]).map(f=>f.id),timeline:(c.timeline||[]).map(t=>t.id),leads:(c.leads||[]).map(l=>l.id),infractions:(c.infractions||[]).map(i=>i.id)})}>Select All</Btn>
            <Btn size="sm" color={S.dim} variant="outline" onClick={()=>setSelected({notes:[],files:[],timeline:[],leads:[],infractions:[]})}>Clear All</Btn>
          </div>
          {allItems.length===0 && <div style={{ color:S.dim, fontSize:12 }}>No items in this case yet.</div>}
          <div style={{ maxHeight:400, overflowY:'auto' }}>
            {allItems.map(item=>{
              const on = selected[item.type]?.includes(item.id)
              return <div key={item.id} onClick={()=>toggle(item.type,item.id)} style={{ ...cardSm, marginBottom:4, cursor:'pointer', borderLeft:`3px solid ${on?S.ok:S.border}`, background:on?S.ok+'11':S.card }}>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <div style={{ width:16, height:16, borderRadius:4, background:on?S.ok:S.mid, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {on && <CheckCircle2 size={11} color="#000"/>}
                  </div>
                  <span style={{ color:S.midText, fontSize:11 }}>{item.label}</span>
                </div>
              </div>
            })}
          </div>
        </div>
      )}
      {section==='recipient' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Field label="RECIPIENT NAME"><input value={recipient.name} onChange={e=>setRecipient(r=>({...r,name:e.target.value}))} placeholder="Prosecutor / Regulator name" style={fieldStyle}/></Field>
          <Field label="ORGANIZATION"><input value={recipient.org} onChange={e=>setRecipient(r=>({...r,org:e.target.value}))} placeholder="ITIA / USADA / FBI / Prosecution" style={fieldStyle}/></Field>
          <Field label="PURPOSE / LEGAL BASIS"><textarea value={recipient.purpose} onChange={e=>setRecipient(r=>({...r,purpose:e.target.value}))} placeholder="Reason for disclosure…" style={{ ...textareaStyle, minHeight:70 }}/></Field>
        </div>
      )}
      {section==='generate' && (
        <div>
          <div style={{ ...cardSm, marginBottom:12 }}>
            <div style={{ color:S.text, fontSize:12 }}>Ready to generate discovery package</div>
            <div style={{ color:S.dim, fontSize:11, marginTop:4 }}>Items selected: <span style={{ color:S.accent, fontWeight:700 }}>{count}</span> · Recipient: <span style={{ color:S.text }}>{recipient.name||'Not set'}</span>, {recipient.org||'—'}</div>
          </div>
          {!recipient.name && <div style={{ color:S.warn, fontSize:12, marginBottom:10 }}>⚠ Set a recipient first (previous tab)</div>}
          <Btn color={S.accent} onClick={generate} disabled={!recipient.name||count===0}><Download size={10}/>Generate Discovery PDF</Btn>
          {generated && <div style={{ ...badge(S.ok), display:'inline-block', marginLeft:10 }}>✓ Generated and logged</div>}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRACKER SYSTEM — Watch players, officials, micro-bets, social media
// ═══════════════════════════════════════════════════════════════════════════════
export function TrackerSystem({ user }) {
  const [trackers, setTrackers] = useState(loadTrackers)
  const [showAdd,  setShowAdd]  = useState(false)
  const [form, setForm] = useState({ name:'', type:'player', sport:'tennis', alertThreshold:70, notes:'', monitorBetting:true, monitorSocial:false, monitorTravel:false, linkedCase:'' })

  const persist = (next) => { setTrackers(next); saveTrackers(next) }
  const entityTypes = [['player','🏃 Player'],['official','⚖️ Official'],['coach','🎓 Coach'],['tournament','🏆 Tournament'],['micro_bet','📊 Micro-Bet Pattern'],['social_media','📱 Social Media Account'],['bookmaker','💰 Bookmaker'],['entity','🔷 Generic Entity']]
  const typeColor = t=>({player:S.info,official:S.danger,coach:S.accent,tournament:S.warn,micro_bet:S.ok,social_media:'#ec4899',bookmaker:'#8b5cf6',entity:S.dim}[t]||S.dim)

  const create = () => {
    if (!form.name.trim()) return
    const t = { id:`TRK-${uid()}`, ...form, status:'active', iriAlerts:[], createdBy:user.username, createdAt:ts(), lastAlert:null, alertCount:0, triggered:false }
    persist(addTracker(t))
    setShowAdd(false)
    setForm({ name:'', type:'player', sport:'tennis', alertThreshold:70, notes:'', monitorBetting:true, monitorSocial:false, monitorTravel:false, linkedCase:'' })
  }

  const simulateAlert = (id) => {
    const iriScore = Math.floor(Math.random()*30)+70
    persist(loadTrackers().map(t=>t.id===id?{...t, triggered:true, lastAlert:ts(), alertCount:(t.alertCount||0)+1, iriAlerts:[...t.iriAlerts,{ts:ts(),iri:iriScore,note:`IRI ${iriScore} — suspicious activity detected`}]}:t))
    setTrackers(loadTrackers())
  }

  return (
    <div>
      <SectionHeader title="📡 Tracker System" subtitle="Monitor players · Officials · Micro-bet patterns · Social media · Bookmakers"/>
      <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
        <StatCard label="Active Trackers" value={trackers.filter(t=>t.status==='active').length}/>
        <StatCard label="Triggered" value={trackers.filter(t=>t.triggered).length} color={S.danger}/>
        <StatCard label="Total Alerts" value={trackers.reduce((s,t)=>s+(t.alertCount||0),0)} color={S.warn}/>
      </div>
      <Btn color={S.accent} style={{ marginBottom:16 }} onClick={()=>setShowAdd(true)}><Plus size={10}/>Add Tracker</Btn>
      {trackers.length===0 && !showAdd && (
        <div style={{ ...card, textAlign:'center', padding:40 }}>
          <div style={{ fontSize:32, marginBottom:10 }}>📡</div>
          <div style={{ color:S.text, fontSize:15, fontWeight:700, marginBottom:6 }}>No Trackers Active</div>
          <div style={{ color:S.dim, fontSize:12 }}>Add a tracker to monitor an entity for IRI changes, betting anomalies, or social media activity.</div>
        </div>
      )}
      {trackers.map(t=>(
        <div key={t.id} style={{ ...card, marginBottom:10, borderLeft:`3px solid ${t.triggered?S.danger:typeColor(t.type)}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                <span style={{ ...badge(typeColor(t.type)), fontSize:10 }}>{entityTypes.find(([k])=>k===t.type)?.[1]||t.type}</span>
                <SportBadge sport={t.sport}/>
                {t.triggered && <span style={{ ...badge(S.danger), fontSize:9 }}>⚠ TRIGGERED</span>}
                {t.monitorBetting && <span style={{ ...badge(S.dim), fontSize:9 }}>📊 Betting</span>}
                {t.monitorSocial  && <span style={{ ...badge(S.dim), fontSize:9 }}>📱 Social</span>}
                {t.monitorTravel  && <span style={{ ...badge(S.dim), fontSize:9 }}>✈ Travel</span>}
              </div>
              <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>{t.name}</div>
              <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>Threshold: IRI {t.alertThreshold} · Alerts: {t.alertCount||0} · Last: {t.lastAlert||'Never'}</div>
              {t.linkedCase && <div style={{ color:S.info, fontSize:11 }}>→ Case: {t.linkedCase}</div>}
              {t.iriAlerts?.length>0 && (
                <div style={{ marginTop:8 }}>
                  {t.iriAlerts.slice(-3).map((a,i)=>(
                    <div key={i} style={{ ...cardSm, marginBottom:3, background:'#1a0000', borderLeft:`2px solid ${S.danger}` }}>
                      <span style={{ color:S.danger, fontSize:11, fontWeight:700 }}>IRI {a.iri}</span> <span style={{ color:S.dim, fontSize:10 }}>· {a.ts} · {a.note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <Btn size="sm" color={S.warn} variant="outline" onClick={()=>simulateAlert(t.id)}><AlertTriangle size={10}/>Simulate Alert</Btn>
              <Btn size="sm" color={S.ok} variant="outline" onClick={()=>{ persist(loadTrackers().map(x=>x.id===t.id?{...x,triggered:false}:x)); setTrackers(loadTrackers()) }}><CheckCircle2 size={10}/>Acknowledge</Btn>
              <Btn size="sm" color={S.danger} variant="outline" onClick={()=>{ deleteTracker(t.id); setTrackers(loadTrackers()) }}><Trash2 size={10}/>Remove</Btn>
            </div>
          </div>
        </div>
      ))}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Tracker" width={650}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Field label="ENTITY NAME" required><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Player name, account handle, bet pattern ID…" style={fieldStyle}/></Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="ENTITY TYPE"><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={fieldStyle}>{entityTypes.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></Field>
            <Field label="SPORT"><select value={form.sport} onChange={e=>setForm(f=>({...f,sport:e.target.value}))} style={fieldStyle}>{Object.entries(SPORTS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</select></Field>
            <Field label="LINKED CASE ID (optional)"><input value={form.linkedCase} onChange={e=>setForm(f=>({...f,linkedCase:e.target.value}))} placeholder="CASE-XXXXX" style={fieldStyle}/></Field>
            <Field label={`ALERT THRESHOLD: IRI ${form.alertThreshold}`}><input type="range" min="30" max="95" value={form.alertThreshold} onChange={e=>setForm(f=>({...f,alertThreshold:+e.target.value}))} style={{ width:'100%', accentColor:S.accent, marginTop:8 }}/></Field>
          </div>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            <Toggle on={form.monitorBetting} onChange={v=>setForm(f=>({...f,monitorBetting:v}))} label="Monitor Betting Lines"/>
            <Toggle on={form.monitorSocial}  onChange={v=>setForm(f=>({...f,monitorSocial:v}))}  label="Monitor Social Media"/>
            <Toggle on={form.monitorTravel}  onChange={v=>setForm(f=>({...f,monitorTravel:v}))}  label="Monitor Travel/Movement"/>
          </div>
          <Field label="NOTES"><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={textareaStyle}/></Field>
          <div style={{ display:'flex', gap:8 }}><Btn onClick={create} color={S.accent}><Plus size={10}/>Add Tracker</Btn><Btn onClick={()=>setShowAdd(false)} color={S.dim} variant="outline">Cancel</Btn></div>
        </div>
      </Modal>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOSSIER MODULE — Subject profiles linked to multiple cases
// ═══════════════════════════════════════════════════════════════════════════════
export function DossierModule({ user }) {
  const [dossiers, setDossiers] = useState(loadDossiers)
  const [active,   setActive]   = useState(null)
  const [showAdd,  setShowAdd]  = useState(false)
  const [form, setForm] = useState({ subject:'', codename:'', sport:'tennis', role:'player', nationality:'', dob:'', knownAssociates:'', linkedCases:'', riskHistory:'', notes:'', shielded:false })

  const persist = (next) => { setDossiers(next); saveDossiers(next) }
  const canShield = ['god','main_account','supervisor'].includes(user?.role)

  const create = () => {
    if (!form.subject.trim()) return
    const d = { id:`DOS-${uid()}`, ...form, linkedCases:form.linkedCases.split(',').map(s=>s.trim()).filter(Boolean), createdBy:user.username, createdAt:ts(), timeline:[], documents:[] }
    persist(addDossier(d)); setShowAdd(false)
    setForm({ subject:'', codename:'', sport:'tennis', role:'player', nationality:'', dob:'', knownAssociates:'', linkedCases:'', riskHistory:'', notes:'', shielded:false })
  }

  const roleColor = r=>({player:S.info,official:S.danger,coach:S.accent,bettor:'#ec4899',fixer:'#a855f7',associate:S.dim}[r]||S.dim)

  if (active) {
    const d = dossiers.find(x=>x.id===active.id)||active
    return (
      <div>
        <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14 }}>
          <Btn onClick={()=>setActive(null)} color={S.dim} variant="outline" size="sm">← Dossiers</Btn>
          <span style={{ ...badge(roleColor(d.role)) }}>{d.role?.toUpperCase()}</span>
          {d.shielded && <span style={{ ...badge('#a855f7') }}>🔒 SHIELDED FROM EXPORTS</span>}
        </div>
        <div style={{ ...card, marginBottom:14 }}>
          <div style={{ color:S.text, fontSize:22, fontWeight:900, marginBottom:4 }}>{d.shielded&&canShield?d.subject:<span style={{ color:'#a855f7' }}>[SHIELDED]</span>}</div>
          {d.codename && <div style={{ color:'#a855f7', fontSize:12 }}>Codename: {d.codename}</div>}
          <div style={{ display:'flex', gap:20, marginTop:8, flexWrap:'wrap' }}>
            {[['Sport',d.sport],['Nationality',d.nationality],['DOB',d.dob],['Cases',d.linkedCases?.join(', ')||'—']].map(([l,v])=>(
              <div key={l}><div style={{ color:S.dim, fontSize:10 }}>{l}</div><div style={{ color:S.text, fontSize:12 }}>{v||'—'}</div></div>
            ))}
          </div>
        </div>
        {d.knownAssociates && <div style={card}><div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:6 }}>Known Associates</div><div style={{ color:S.midText, fontSize:12, whiteSpace:'pre-wrap' }}>{d.knownAssociates}</div></div>}
        {d.riskHistory && <div style={{ ...card, marginTop:12 }}><div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:6 }}>Risk History</div><div style={{ color:S.midText, fontSize:12, whiteSpace:'pre-wrap' }}>{d.riskHistory}</div></div>}
        {d.notes && <div style={{ ...card, marginTop:12 }}><div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:6 }}>Notes</div><div style={{ color:S.midText, fontSize:12, whiteSpace:'pre-wrap' }}>{d.notes}</div></div>}
        {canShield && <div style={{ marginTop:14 }}><Toggle on={d.shielded} onChange={v=>{ const next=dossiers.map(x=>x.id===d.id?{...x,shielded:v}:x); persist(next) }} label="Shield from case exports and discovery packages"/></div>}
      </div>
    )
  }

  return (
    <div>
      <SectionHeader title="📁 Dossier Module" subtitle="Subject profiles · Linked cases · Known associates · Identity shielding"/>
      <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
        <StatCard label="Total Dossiers" value={dossiers.length}/>
        <StatCard label="Shielded" value={dossiers.filter(d=>d.shielded).length} color='#a855f7'/>
      </div>
      <Btn color={S.accent} style={{ marginBottom:16 }} onClick={()=>setShowAdd(true)}><Plus size={10}/>Create Dossier</Btn>
      {dossiers.length===0 && (
        <div style={{ ...card, textAlign:'center', padding:40 }}>
          <div style={{ fontSize:32, marginBottom:10 }}>📁</div>
          <div style={{ color:S.text, fontSize:15, fontWeight:700 }}>No Dossiers Yet</div>
          <div style={{ color:S.dim, fontSize:12, marginTop:6 }}>Create subject dossiers that link across multiple cases.</div>
        </div>
      )}
      {dossiers.map(d=>(
        <div key={d.id} onClick={()=>setActive(d)} style={{ ...card, marginBottom:10, cursor:'pointer', borderLeft:`3px solid ${roleColor(d.role)}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:4 }}>
                <span style={{ color:S.text, fontSize:14, fontWeight:700 }}>{d.shielded&&!canShield?'[SHIELDED]':d.subject}</span>
                <span style={{ ...badge(roleColor(d.role)), fontSize:10 }}>{d.role}</span>
                <SportBadge sport={d.sport}/>
                {d.shielded && <span style={{ ...badge('#a855f7'), fontSize:9 }}>🔒</span>}
              </div>
              <div style={{ color:S.dim, fontSize:11 }}>{d.nationality} · Cases: {d.linkedCases?.join(', ')||'—'} · Created: {d.createdAt?.slice(0,10)}</div>
            </div>
          </div>
        </div>
      ))}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Create Dossier" width={700}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="SUBJECT NAME" required><input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} style={fieldStyle}/></Field>
            <Field label="CODENAME (optional)"><input value={form.codename} onChange={e=>setForm(f=>({...f,codename:e.target.value}))} placeholder="Protected alias" style={fieldStyle}/></Field>
            <Field label="ROLE"><select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={fieldStyle}>{['player','official','coach','bettor','fixer','associate'].map(r=><option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}</select></Field>
            <Field label="SPORT"><select value={form.sport} onChange={e=>setForm(f=>({...f,sport:e.target.value}))} style={fieldStyle}>{Object.entries(SPORTS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</select></Field>
            <Field label="NATIONALITY"><input value={form.nationality} onChange={e=>setForm(f=>({...f,nationality:e.target.value}))} style={fieldStyle}/></Field>
            <Field label="DATE OF BIRTH"><input type="date" value={form.dob} onChange={e=>setForm(f=>({...f,dob:e.target.value}))} style={fieldStyle}/></Field>
          </div>
          <Field label="LINKED CASE IDs (comma-separated)"><input value={form.linkedCases} onChange={e=>setForm(f=>({...f,linkedCases:e.target.value}))} placeholder="CASE-12345, CASE-67890" style={fieldStyle}/></Field>
          <Field label="KNOWN ASSOCIATES"><textarea value={form.knownAssociates} onChange={e=>setForm(f=>({...f,knownAssociates:e.target.value}))} placeholder="Names, roles, relationships…" style={{ ...textareaStyle, minHeight:60 }}/></Field>
          <Field label="RISK HISTORY"><textarea value={form.riskHistory} onChange={e=>setForm(f=>({...f,riskHistory:e.target.value}))} placeholder="Prior infractions, investigations, suspensions…" style={{ ...textareaStyle, minHeight:60 }}/></Field>
          <Field label="NOTES"><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{ ...textareaStyle, minHeight:60 }}/></Field>
          {canShield && <Toggle on={form.shielded} onChange={v=>setForm(f=>({...f,shielded:v}))} label="Shield this subject from exports and discovery packages"/>}
          <div style={{ display:'flex', gap:8 }}><Btn onClick={create} color={S.accent}><Plus size={10}/>Create Dossier</Btn><Btn onClick={()=>setShowAdd(false)} color={S.dim} variant="outline">Cancel</Btn></div>
        </div>
      </Modal>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CEASE & DESIST GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
export function CeaseAndDesist({ user }) {
  const [form, setForm] = useState({ caseId:'', caseTitle:'', sport:'tennis', jurisdiction:'', subject:'', violations:'', customLetter:'' })
  const [loading,    setLoading]    = useState(false)
  const [generated,  setGenerated]  = useState('')
  const [error,      setError]      = useState('')
  const [mode,       setMode]       = useState('ai') // 'ai' or 'manual'
  const [letterhead, setLetterhead] = useState(null)
  const settings = loadSettings()
  const fileRef  = useRef(null)

  const generate = async () => {
    setLoading(true); setError('')
    try {
      const text = await generateCeaseAndDesist({ ...form, orgName:settings.orgName||'Integrity Organization', signatory:settings.signatory||user.displayName, signatoryTitle:settings.signatoryTitle||ALL_ROLES[user.role]?.label })
      setGenerated(text)
    } catch(e) { setError(e.message||'Generation failed') }
    setLoading(false)
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    // Letterhead
    if (letterhead) { try { doc.addImage(letterhead,'JPEG',14,10,182,30) } catch {} }
    else {
      doc.setFontSize(16).setFont('helvetica','bold').setTextColor(0).text(settings.orgName||'INTEGRITY ORGANIZATION', 105, 20, { align:'center' })
      doc.setFontSize(9).setFont('helvetica','normal').setTextColor(100)
      doc.text([settings.orgAddress||'', settings.orgPhone||'', settings.orgEmail||''].filter(Boolean).join(' · '), 105, 28, { align:'center' })
    }
    doc.setDrawColor(200).line(14, 38, 196, 38)
    doc.setTextColor(0).setFontSize(14).setFont('helvetica','bold').text('CEASE AND DESIST', 105, 50, { align:'center' })
    doc.setFontSize(10).setFont('helvetica','normal')
    const bodyText = mode==='ai' ? generated : form.customLetter
    const lines = doc.splitTextToSize(bodyText, 180)
    doc.text(lines, 14, 62)
    // Signature block
    const sigY = Math.min(62 + lines.length*4.5, 260)
    doc.text(`\n\nSincerely,\n\n${settings.signatory||user.displayName}\n${settings.signatoryTitle||ALL_ROLES[user.role]?.label}\n${settings.orgName||''}`, 14, sigY)
    doc.save(`cease_desist_${form.caseId||'letter'}_${new Date().toISOString().slice(0,10)}.pdf`)
  }

  return (
    <div>
      <SectionHeader title="⚖️ Cease & Desist Generator" subtitle="AI-drafted · Custom letterhead · PDF export · Case-linked"/>
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        <button onClick={()=>setMode('ai')} style={{ padding:'7px 14px', borderRadius:6, fontSize:12, cursor:'pointer', background:mode==='ai'?S.mid:'transparent', color:mode==='ai'?S.accent:S.dim, border:`1px solid ${mode==='ai'?S.border:'transparent'}`, fontWeight:mode==='ai'?700:400 }}>🤖 AI-Drafted</button>
        <button onClick={()=>setMode('manual')} style={{ padding:'7px 14px', borderRadius:6, fontSize:12, cursor:'pointer', background:mode==='manual'?S.mid:'transparent', color:mode==='manual'?S.accent:S.dim, border:`1px solid ${mode==='manual'?S.border:'transparent'}`, fontWeight:mode==='manual'?700:400 }}>✏️ Manual</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={card}>
          <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:12 }}>Letter Details</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Field label="CASE REFERENCE"><input value={form.caseId} onChange={e=>setForm(f=>({...f,caseId:e.target.value}))} placeholder="CASE-XXXXX" style={fieldStyle}/></Field>
            <Field label="SUBJECT OF LETTER"><input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} placeholder="Full legal name of recipient" style={fieldStyle}/></Field>
            <Field label="SPORT"><select value={form.sport} onChange={e=>setForm(f=>({...f,sport:e.target.value}))} style={fieldStyle}>{Object.entries(SPORTS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</select></Field>
            <Field label="JURISDICTION"><input value={form.jurisdiction} onChange={e=>setForm(f=>({...f,jurisdiction:e.target.value}))} style={fieldStyle}/></Field>
            <Field label="VIOLATIONS / CONDUCT"><textarea value={form.violations} onChange={e=>setForm(f=>({...f,violations:e.target.value}))} placeholder="Specific violations or conduct to cease…" style={{ ...textareaStyle, minHeight:80 }}/></Field>
            <div style={{ color:S.text, fontSize:12, fontWeight:700, marginTop:4 }}>Letterhead</div>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <Btn size="sm" color={S.dim} variant="outline" onClick={()=>fileRef.current?.click()}><FileText size={10}/>Upload Letterhead (JPG)</Btn>
              <input ref={fileRef} type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=ev=>setLetterhead(ev.target.result); r.readAsDataURL(f) }} style={{ display:'none' }}/>
              {letterhead && <span style={{ ...badge(S.ok), fontSize:9 }}>✓ Letterhead loaded</span>}
              {!letterhead && <span style={{ color:S.dim, fontSize:10 }}>Uses org name from Settings if no image</span>}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {mode==='ai' && (
            <div style={card}>
              <Btn color={S.god} onClick={generate} disabled={loading||!form.subject} style={{ width:'100%', justifyContent:'center', marginBottom:12 }}>{loading?'🔄 Drafting…':'✨ Generate with AI'}</Btn>
              {error && <div style={{ color:S.danger, fontSize:12 }}>{error}</div>}
              {generated && <pre style={{ color:S.midText, fontSize:11, lineHeight:1.7, whiteSpace:'pre-wrap', maxHeight:350, overflowY:'auto', margin:0 }}>{generated}</pre>}
            </div>
          )}
          {mode==='manual' && (
            <div style={card}>
              <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:8 }}>Manual Letter Text</div>
              <textarea value={form.customLetter} onChange={e=>setForm(f=>({...f,customLetter:e.target.value}))} placeholder="Type your cease & desist letter here…" style={{ ...textareaStyle, minHeight:300 }}/>
            </div>
          )}
          {(generated||form.customLetter) && (
            <Btn color={S.accent} onClick={exportPDF}><Download size={10}/>Export PDF with Letterhead</Btn>
          )}
          <div style={{ ...cardSm, fontSize:11, color:S.dim }}>
            <div style={{ fontWeight:700, marginBottom:4 }}>Org Details (from Settings)</div>
            {settings.orgName && <div>{settings.orgName}</div>}
            {settings.signatory && <div>{settings.signatory} · {settings.signatoryTitle}</div>}
            {!settings.orgName && <div style={{ color:S.warn }}>⚠ Set org name in God Mode → Settings</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
