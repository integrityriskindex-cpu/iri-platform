// IRI v1.6.0 — Known Associates + Sharp Bettors

import { useState } from 'react'
import { Plus, Trash2, Search, Link } from 'lucide-react'
import { S, card, cardSm, badge, Btn, SectionHeader, StatCard, Field, fieldStyle, textareaStyle, Toggle, SportBadge, Modal } from './UI.jsx'
import { loadAssociates, saveAssociates, addAssociate, updateAssociate, deleteAssociate, loadBettors, saveBettors, addBettor, updateBettor } from '../utils/store.js'
import { SPORTS_CONFIG } from '../utils/data.js'

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5)
const ts  = () => new Date().toISOString().slice(0,16).replace('T',' ')

// ═══════════════════════════════════════════════════════════════════════════════
// KNOWN ASSOCIATES MODULE
// ═══════════════════════════════════════════════════════════════════════════════
export function KnownAssociates({ user }) {
  const [associates, setAssociates] = useState(loadAssociates)
  const [showAdd,    setShowAdd]    = useState(false)
  const [showLink,   setShowLink]   = useState(null)
  const [search,     setSearch]     = useState('')
  const [filterType, setFilterType] = useState('all')
  const [form, setForm] = useState({
    primaryName:'', primaryType:'player', primarySport:'tennis', primaryCircuit:'', primaryNationality:'',
    associateName:'', associateType:'player', associateSport:'tennis', associateCircuit:'', associateNationality:'',
    relationshipType:'', strength:'medium', notes:'', riskScore:0, addToNexus:true,
  })

  const persist = (next) => { setAssociates(next); saveAssociates(next) }

  const entityTypes = [['player','🏃 Player'],['coach','🎓 Coach'],['official','⚖️ Official'],['agent','🤝 Agent'],['family','👨‍👩‍👦 Family'],['bettor','💰 Bettor'],['fixer','🎯 Fixer'],['associate','🔷 Associate']]
  const relationTypes = ['Coached By','Managed By','Represents','Family Member','Known Associate','Financial Connection','Betting Link','Suspected Collaboration','Match Fixed Together','Travel Partner','Communication Link','Business Partner']
  const strengthColor = s=>({high:S.danger,medium:S.warn,low:S.ok,unknown:S.dim}[s]||S.dim)

  const add = () => {
    if (!form.primaryName.trim() || !form.associateName.trim()) return
    const entry = {
      id:               `ASSOC-${uid()}`,
      primary:          { name:form.primaryName, type:form.primaryType, sport:form.primarySport, circuit:form.primaryCircuit, nationality:form.primaryNationality },
      associate:        { name:form.associateName, type:form.associateType, sport:form.associateSport, circuit:form.associateCircuit, nationality:form.associateNationality },
      relationship:     form.relationshipType,
      strength:         form.strength,
      notes:            form.notes,
      riskScore:        form.riskScore,
      addToNexus:       form.addToNexus,
      createdBy:        user.username,
      createdAt:        ts(),
      verified:         false,
    }
    persist(addAssociate(entry))
    setShowAdd(false)
    setForm({ primaryName:'', primaryType:'player', primarySport:'tennis', primaryCircuit:'', primaryNationality:'', associateName:'', associateType:'player', associateSport:'tennis', associateCircuit:'', associateNationality:'', relationshipType:'', strength:'medium', notes:'', riskScore:0, addToNexus:true })
  }

  const filtered = associates.filter(a=>{
    if (filterType!=='all' && a.primary.type!==filterType && a.associate.type!==filterType) return false
    if (search && !a.primary.name.toLowerCase().includes(search.toLowerCase()) && !a.associate.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Group by primary entity
  const grouped = {}
  filtered.forEach(a=>{
    const key = a.primary.name
    if (!grouped[key]) grouped[key] = { entity:a.primary, links:[] }
    grouped[key].links.push(a)
  })

  return (
    <div>
      <SectionHeader title="🔗 Known Associates" subtitle="Link players · Coaches · Officials · Agents · Bettors · Auto-feeds Nexus Graph 2.0"/>
      <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
        <StatCard label="Total Links" value={associates.length}/>
        <StatCard label="High Risk" value={associates.filter(a=>a.strength==='high').length} color={S.danger}/>
        <StatCard label="In Nexus" value={associates.filter(a=>a.addToNexus).length} color={S.god}/>
        <StatCard label="Verified" value={associates.filter(a=>a.verified).length} color={S.ok}/>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <Btn color={S.accent} onClick={()=>setShowAdd(true)}><Plus size={10}/>Link Associates</Btn>
        <Search size={13} color={S.dim}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name…" style={{ ...fieldStyle, width:160 }}/>
        {[['all','All'],['player','Players'],['coach','Coaches'],['official','Officials'],['bettor','Bettors'],['fixer','Fixers']].map(([v,l])=>(
          <button key={v} onClick={()=>setFilterType(v)} style={{ padding:'4px 10px', borderRadius:5, fontSize:11, cursor:'pointer', background:filterType===v?S.mid:'transparent', color:filterType===v?S.accent:S.dim, border:`1px solid ${filterType===v?S.border:'transparent'}` }}>{l}</button>
        ))}
      </div>

      {associates.length===0 && (
        <div style={{ ...card, textAlign:'center', padding:40 }}>
          <div style={{ fontSize:32, marginBottom:10 }}>🔗</div>
          <div style={{ color:S.text, fontSize:15, fontWeight:700 }}>No Associates Linked</div>
          <div style={{ color:S.dim, fontSize:12, marginTop:6 }}>Create association links between players, coaches, officials, agents, and bettors. Links automatically populate the Nexus Graph.</div>
        </div>
      )}

      {Object.entries(grouped).map(([primaryName, {entity, links}])=>(
        <div key={primaryName} style={{ ...card, marginBottom:14 }}>
          <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10, flexWrap:'wrap' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:S.accent+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
              {({player:'🏃',coach:'🎓',official:'⚖️',agent:'🤝',bettor:'💰',fixer:'🎯'}[entity.type]||'🔷')}
            </div>
            <div>
              <div style={{ color:S.text, fontSize:15, fontWeight:700 }}>{primaryName}</div>
              <div style={{ color:S.dim, fontSize:11 }}>{entity.type} · {entity.sport} · {entity.nationality} · {links.length} link{links.length!==1?'s':''}</div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {links.map(link=>(
              <div key={link.id} style={{ ...cardSm, borderLeft:`3px solid ${strengthColor(link.strength)}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:2 }}>
                      <span style={{ color:S.dim, fontSize:11 }}>→</span>
                      <span style={{ color:S.text, fontSize:13, fontWeight:600 }}>{link.associate.name}</span>
                      <span style={{ ...badge(S.info), fontSize:9 }}>{link.associate.type}</span>
                      {link.relationship && <span style={{ ...badge(strengthColor(link.strength)), fontSize:9 }}>{link.relationship}</span>}
                      <span style={{ ...badge(strengthColor(link.strength)), fontSize:9 }}>{link.strength?.toUpperCase()} LINK</span>
                      {link.addToNexus && <span style={{ ...badge(S.god), fontSize:9 }}>🕸️ Nexus</span>}
                      {link.verified && <span style={{ ...badge(S.ok), fontSize:9 }}>✓ Verified</span>}
                    </div>
                    {link.notes && <div style={{ color:S.midText, fontSize:11 }}>{link.notes}</div>}
                  </div>
                  <div style={{ display:'flex', gap:4 }}>
                    {!link.verified && ['supervisor','god','main_account'].includes(user?.role) && (
                      <Btn size="sm" color={S.ok} onClick={()=>{ const next=associates.map(a=>a.id===link.id?{...a,verified:true}:a); persist(next) }}>Verify</Btn>
                    )}
                    <Btn size="sm" color={S.danger} variant="outline" onClick={()=>{ deleteAssociate(link.id); setAssociates(loadAssociates()) }}><Trash2 size={9}/></Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Link Known Associates" width={750}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {/* Primary entity */}
            <div style={{ ...cardSm, background:S.mid }}>
              <div style={{ color:S.accent, fontSize:12, fontWeight:700, marginBottom:10 }}>PRIMARY ENTITY</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <Field label="NAME" required><input value={form.primaryName} onChange={e=>setForm(f=>({...f,primaryName:e.target.value}))} placeholder="Entity name" style={fieldStyle}/></Field>
                <Field label="TYPE"><select value={form.primaryType} onChange={e=>setForm(f=>({...f,primaryType:e.target.value}))} style={fieldStyle}>{entityTypes.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></Field>
                <Field label="SPORT"><select value={form.primarySport} onChange={e=>setForm(f=>({...f,primarySport:e.target.value}))} style={fieldStyle}>{Object.entries(SPORTS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</select></Field>
                <Field label="CIRCUIT / LEAGUE"><input value={form.primaryCircuit} onChange={e=>setForm(f=>({...f,primaryCircuit:e.target.value}))} style={fieldStyle}/></Field>
                <Field label="NATIONALITY"><input value={form.primaryNationality} onChange={e=>setForm(f=>({...f,primaryNationality:e.target.value}))} style={fieldStyle}/></Field>
              </div>
            </div>
            {/* Associate */}
            <div style={{ ...cardSm, background:S.mid }}>
              <div style={{ color:S.god, fontSize:12, fontWeight:700, marginBottom:10 }}>ASSOCIATE / LINKED ENTITY</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <Field label="NAME" required><input value={form.associateName} onChange={e=>setForm(f=>({...f,associateName:e.target.value}))} placeholder="Associate name" style={fieldStyle}/></Field>
                <Field label="TYPE"><select value={form.associateType} onChange={e=>setForm(f=>({...f,associateType:e.target.value}))} style={fieldStyle}>{entityTypes.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></Field>
                <Field label="SPORT"><select value={form.associateSport} onChange={e=>setForm(f=>({...f,associateSport:e.target.value}))} style={fieldStyle}>{Object.entries(SPORTS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</select></Field>
                <Field label="CIRCUIT / LEAGUE"><input value={form.associateCircuit} onChange={e=>setForm(f=>({...f,associateCircuit:e.target.value}))} style={fieldStyle}/></Field>
                <Field label="NATIONALITY"><input value={form.associateNationality} onChange={e=>setForm(f=>({...f,associateNationality:e.target.value}))} style={fieldStyle}/></Field>
              </div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="RELATIONSHIP TYPE">
              <select value={form.relationshipType} onChange={e=>setForm(f=>({...f,relationshipType:e.target.value}))} style={fieldStyle}>
                <option value="">Select relationship…</option>
                {relationTypes.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="LINK STRENGTH">
              <select value={form.strength} onChange={e=>setForm(f=>({...f,strength:e.target.value}))} style={fieldStyle}>
                <option value="high">High — Confirmed</option>
                <option value="medium">Medium — Probable</option>
                <option value="low">Low — Suspected</option>
                <option value="unknown">Unknown</option>
              </select>
            </Field>
          </div>
          <Field label="NOTES / EVIDENCE BASIS"><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Evidence basis for this link…" style={{ ...textareaStyle, minHeight:70 }}/></Field>
          <Toggle on={form.addToNexus} onChange={v=>setForm(f=>({...f,addToNexus:v}))} label="🕸️ Automatically add this link to Nexus Graph 2.0 as an edge"/>
          <div style={{ display:'flex', gap:8 }}><Btn onClick={add} color={S.accent}><Plus size={10}/>Create Link</Btn><Btn onClick={()=>setShowAdd(false)} color={S.dim} variant="outline">Cancel</Btn></div>
        </div>
      </Modal>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARP BETTORS (Sportsbook module)
// ═══════════════════════════════════════════════════════════════════════════════
export function SharpBettors({ user }) {
  const [bettors,  setBettors]  = useState(loadBettors)
  const [showAdd,  setShowAdd]  = useState(false)
  const [active,   setActive]   = useState(null)
  const [filter,   setFilter]   = useState('all')
  const [form, setForm] = useState({
    cardNumber:'', displayName:'', totalWins:0, totalLosses:0, totalWagered:0, totalWon:0,
    sports:[], notes:'', riskLevel:'medium', limitAction:false, limitAmount:0, flagged:false,
    bettingPattern:'straight', marketAccess:'all', preferred:[]
  })

  const persist = (next) => { setBettors(next); saveBettors(next) }

  const riskColor = r=>({high:S.danger,medium:S.warn,low:S.ok,unknown:S.dim}[r]||S.dim)
  const riskIcon  = r=>({high:'🔴',medium:'🟡',low:'🟢',unknown:'⚫'}[r]||'⚫')

  const add = () => {
    if (!form.cardNumber.trim()) return
    const roi    = form.totalWagered > 0 ? (((form.totalWon - form.totalWagered) / form.totalWagered)*100).toFixed(1) : 0
    const winRate= (form.totalWins + form.totalLosses) > 0 ? ((form.totalWins / (form.totalWins+form.totalLosses))*100).toFixed(1) : 0
    const b = { id:`BET-${uid()}`, ...form, roi, winRate, addedBy:user.username, addedAt:ts(), lastActivity:ts(), history:[], alerts:[] }
    persist(addBettor(b))
    setShowAdd(false)
    setForm({ cardNumber:'', displayName:'', totalWins:0, totalLosses:0, totalWagered:0, totalWon:0, sports:[], notes:'', riskLevel:'medium', limitAction:false, limitAmount:0, flagged:false, bettingPattern:'straight', marketAccess:'all', preferred:[] })
  }

  const toggleLimit = (id) => {
    const next = loadBettors().map(b=>b.id===id?{...b,limitAction:!b.limitAction}:b)
    persist(next); setBettors(next)
  }

  const setRisk = (id, riskLevel) => {
    const next = loadBettors().map(b=>b.id===id?{...b,riskLevel}:b)
    persist(next); setBettors(next)
  }

  const filtered = bettors.filter(b=>{
    if (filter==='flagged') return b.flagged
    if (filter==='limited') return b.limitAction
    if (filter==='high')    return b.riskLevel==='high'
    return true
  })

  return (
    <div>
      <SectionHeader title="🎲 Sharp Bettors — Risk Management" subtitle="Track by player card · Win/loss assessment · Limit action · Sportsbook-only"/>
      <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
        <StatCard label="Total Bettors" value={bettors.length}/>
        <StatCard label="High Risk" value={bettors.filter(b=>b.riskLevel==='high').length} color={S.danger}/>
        <StatCard label="Limited" value={bettors.filter(b=>b.limitAction).length} color={S.warn}/>
        <StatCard label="Flagged" value={bettors.filter(b=>b.flagged).length} color={S.danger}/>
        <StatCard label="Total Exposure" value={`$${bettors.reduce((s,b)=>s+(parseFloat(b.totalWagered)||0),0).toLocaleString()}`} color={S.accent}/>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <Btn color={S.accent} onClick={()=>setShowAdd(true)}><Plus size={10}/>Add Bettor</Btn>
        {[['all','All'],['high','High Risk'],['flagged','Flagged'],['limited','Limited']].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{ padding:'5px 12px', borderRadius:6, fontSize:12, cursor:'pointer', background:filter===v?S.mid:'transparent', color:filter===v?S.accent:S.dim, border:`1px solid ${filter===v?S.border:'transparent'}` }}>{l}</button>
        ))}
      </div>

      {bettors.length===0 && (
        <div style={{ ...card, textAlign:'center', padding:40 }}>
          <div style={{ fontSize:32, marginBottom:10 }}>🎲</div>
          <div style={{ color:S.text, fontSize:15, fontWeight:700 }}>No Sharp Bettors Tracked</div>
          <div style={{ color:S.dim, fontSize:12, marginTop:6 }}>Add bettors by player card number to assess win/loss risk and manage action limits.</div>
        </div>
      )}

      {filtered.map(b=>{
        const roi    = b.totalWagered > 0 ? (((b.totalWon - b.totalWagered)/b.totalWagered)*100).toFixed(1) : 0
        const winRate= (b.totalWins+b.totalLosses)>0 ? ((b.totalWins/(b.totalWins+b.totalLosses))*100).toFixed(1) : 0
        return (
          <div key={b.id} style={{ ...card, marginBottom:10, borderLeft:`4px solid ${riskColor(b.riskLevel)}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                  <span style={{ color:S.text, fontSize:15, fontWeight:700 }}>{b.displayName||'Anonymous'}</span>
                  <span style={{ ...badge(S.dim), fontSize:10, fontFamily:"'IBM Plex Mono',monospace" }}>Card: {b.cardNumber}</span>
                  <span style={{ ...badge(riskColor(b.riskLevel)) }}>{riskIcon(b.riskLevel)} {b.riskLevel?.toUpperCase()} RISK</span>
                  {b.limitAction && <span style={{ ...badge(S.warn) }}>🚫 ACTION LIMITED</span>}
                  {b.flagged && <span style={{ ...badge(S.danger) }}>⚠ FLAGGED</span>}
                </div>
                <div style={{ display:'flex', gap:20, flexWrap:'wrap', marginTop:6 }}>
                  {[['Win Rate',`${winRate}%`,parseFloat(winRate)>55?S.danger:S.ok],['ROI',`${roi}%`,parseFloat(roi)>15?S.danger:S.ok],['Wagered',`$${(b.totalWagered||0).toLocaleString()}`,S.accent],['Won',`$${(b.totalWon||0).toLocaleString()}`,S.ok],['W/L',`${b.totalWins}/${b.totalLosses}`,S.text]].map(([l,v,c])=>(
                    <div key={l}><div style={{ color:S.dim, fontSize:10 }}>{l}</div><div style={{ color:c, fontSize:14, fontWeight:700 }}>{v}</div></div>
                  ))}
                </div>
                {b.notes && <div style={{ color:S.midText, fontSize:11, marginTop:6 }}>{b.notes}</div>}
                {b.limitAction && b.limitAmount>0 && <div style={{ color:S.warn, fontSize:11, marginTop:4 }}>Max bet limit: ${b.limitAmount.toLocaleString()}</div>}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <div style={{ display:'flex', gap:4 }}>
                  {['low','medium','high'].map(r=>(
                    <Btn key={r} size="sm" color={riskColor(r)} variant={b.riskLevel===r?'fill':'outline'} onClick={()=>setRisk(b.id,r)}>{riskIcon(r)}</Btn>
                  ))}
                </div>
                <Btn size="sm" color={b.limitAction?S.ok:S.warn} onClick={()=>toggleLimit(b.id)}>{b.limitAction?'✓ Remove Limit':'🚫 Limit Action'}</Btn>
                <Btn size="sm" color={b.flagged?S.dim:S.danger} variant="outline" onClick={()=>{ const next=loadBettors().map(x=>x.id===b.id?{...x,flagged:!x.flagged}:x); persist(next); setBettors(next) }}>{b.flagged?'Unflag':'🚩 Flag'}</Btn>
              </div>
            </div>
          </div>
        )
      })}

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Sharp Bettor" width={700}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="PLAYER CARD NUMBER" required><input value={form.cardNumber} onChange={e=>setForm(f=>({...f,cardNumber:e.target.value}))} placeholder="e.g. SB-2847491" style={fieldStyle}/></Field>
            <Field label="DISPLAY NAME / ALIAS"><input value={form.displayName} onChange={e=>setForm(f=>({...f,displayName:e.target.value}))} placeholder="Public name or alias" style={fieldStyle}/></Field>
            <Field label="TOTAL WINS"><input type="number" value={form.totalWins} onChange={e=>setForm(f=>({...f,totalWins:+e.target.value}))} style={fieldStyle}/></Field>
            <Field label="TOTAL LOSSES"><input type="number" value={form.totalLosses} onChange={e=>setForm(f=>({...f,totalLosses:+e.target.value}))} style={fieldStyle}/></Field>
            <Field label="TOTAL WAGERED ($)"><input type="number" value={form.totalWagered} onChange={e=>setForm(f=>({...f,totalWagered:+e.target.value}))} style={fieldStyle}/></Field>
            <Field label="TOTAL WON ($)"><input type="number" value={form.totalWon} onChange={e=>setForm(f=>({...f,totalWon:+e.target.value}))} style={fieldStyle}/></Field>
            <Field label="INITIAL RISK LEVEL">
              <select value={form.riskLevel} onChange={e=>setForm(f=>({...f,riskLevel:e.target.value}))} style={fieldStyle}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </Field>
            <Field label="BETTING PATTERN">
              <select value={form.bettingPattern} onChange={e=>setForm(f=>({...f,bettingPattern:e.target.value}))} style={fieldStyle}>
                {['straight','parlay','futures','props','live','arbitrage','steam_chasing','syndicate'].map(p=><option key={p} value={p}>{p.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
              </select>
            </Field>
          </div>
          <Field label="NOTES"><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{ ...textareaStyle, minHeight:60 }}/></Field>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Toggle on={form.limitAction} onChange={v=>setForm(f=>({...f,limitAction:v}))} label="Limit Action"/>
            <Toggle on={form.flagged}     onChange={v=>setForm(f=>({...f,flagged:v}))}     label="Flag Immediately"/>
          </div>
          {form.limitAction && <Field label="MAX BET LIMIT ($)"><input type="number" value={form.limitAmount} onChange={e=>setForm(f=>({...f,limitAmount:+e.target.value}))} style={fieldStyle}/></Field>}
          <div style={{ display:'flex', gap:8 }}><Btn onClick={add} color={S.accent}><Plus size={10}/>Add Bettor</Btn><Btn onClick={()=>setShowAdd(false)} color={S.dim} variant="outline">Cancel</Btn></div>
        </div>
      </Modal>
    </div>
  )
}
