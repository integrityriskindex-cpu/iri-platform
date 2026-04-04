// IRI v1.6.0 — Roster Module
// Browse tournament rosters, filter by type, place trackers with duration

import { useState, useEffect } from 'react'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { S, card, cardSm, badge, Btn, SectionHeader, StatCard, Field, fieldStyle, Toggle, SportBadge, Modal } from './UI.jsx'
import { SPORTS_CONFIG } from '../utils/data.js'
import { addTracker, loadTrackers, saveTrackers, loadSportApis } from '../utils/store.js'

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5)
const ts  = () => new Date().toISOString().slice(0,16).replace('T',' ')

// Demo roster data (populated from API when configured)
const DEMO_ROSTER = {
  tennis: [
    { id:'p001', name:'Carlos Alcaraz',   type:'player',   gender:'male',   circuit:'ATP', ranking:2,  nationality:'ESP', tournament:'Madrid Open', coach:'Juan Carlos Ferrero' },
    { id:'p002', name:'Jannik Sinner',     type:'player',   gender:'male',   circuit:'ATP', ranking:1,  nationality:'ITA', tournament:'Madrid Open', coach:'Darren Cahill' },
    { id:'p003', name:'Novak Djokovic',    type:'player',   gender:'male',   circuit:'ATP', ranking:4,  nationality:'SRB', tournament:'Madrid Open', coach:'Andy Murray' },
    { id:'p004', name:'Iga Swiatek',       type:'player',   gender:'female', circuit:'WTA', ranking:1,  nationality:'POL', tournament:'Madrid Open', coach:'Wim Fissette' },
    { id:'p005', name:'Aryna Sabalenka',   type:'player',   gender:'female', circuit:'WTA', ranking:2,  nationality:'BLR', tournament:'Madrid Open', coach:'Anton Dubrov' },
    { id:'c001', name:'Juan Carlos Ferrero',type:'coach',  gender:'male',   circuit:'ATP', nationality:'ESP', players:['Carlos Alcaraz'] },
    { id:'c002', name:'Darren Cahill',     type:'coach',   gender:'male',   circuit:'ATP', nationality:'AUS', players:['Jannik Sinner'] },
    { id:'o001', name:'Carlos Bernardes', type:'official', gender:'male',   circuit:'ATP', nationality:'BRA', certLevel:'Gold Badge' },
    { id:'o002', name:'Marija Cicak',      type:'official', gender:'female', circuit:'WTA', nationality:'CRO', certLevel:'Silver Badge' },
  ],
  nfl: [
    { id:'f001', name:'Patrick Mahomes', type:'player', gender:'male', circuit:'AFC', ranking:0, nationality:'USA', tournament:'Super Bowl LX', position:'QB', team:'Kansas City Chiefs' },
    { id:'f002', name:'Josh Allen',       type:'player', gender:'male', circuit:'AFC', ranking:0, nationality:'USA', tournament:'Super Bowl LX', position:'QB', team:'Buffalo Bills' },
    { id:'f003', name:'Lamar Jackson',    type:'player', gender:'male', circuit:'AFC', ranking:0, nationality:'USA', tournament:'Super Bowl LX', position:'QB', team:'Baltimore Ravens' },
  ],
}

const DURATIONS = [
  { label:'24 Hours', value:'24h', ms:86400000 },
  { label:'1 Week',   value:'1w',  ms:604800000 },
  { label:'1 Month',  value:'1mo', ms:2592000000 },
  { label:'3 Months', value:'3mo', ms:7776000000 },
  { label:'1 Year',   value:'1yr', ms:31536000000 },
  { label:'Indefinite',value:'∞',  ms:0 },
]

export function RosterModule({ user }) {
  const [sport,      setSport]      = useState('tennis')
  const [filterType, setFilterType] = useState('all')
  const [filterGender,setFilterGender]=useState('all')
  const [filterCircuit,setFilterCircuit]=useState('all')
  const [search,     setSearch]     = useState('')
  const [selected,   setSelected]   = useState(null)
  const [showTracker,setShowTracker]=useState(null)
  const [duration,   setDuration]   = useState('1w')
  const [alertThreshold, setAlert]  = useState(70)
  const [loading,    setLoading]    = useState(false)
  const [roster,     setRoster]     = useState([])
  const [trackers,   setTrackers]   = useState(loadTrackers)

  const sportApis = loadSportApis()[sport] || []
  const hasLiveApi = sportApis.some(a=>a.enabled && a.dataType==='players')

  useEffect(()=>{
    setRoster(DEMO_ROSTER[sport] || [])
    setSelected(null)
  },[sport])

  const fetchLive = async () => {
    setLoading(true)
    // In production: call the configured sport API endpoint for this sport's players
    // For now show a message that it requires API configuration
    await new Promise(r=>setTimeout(r,1500))
    setLoading(false)
  }

  const filtered = roster.filter(p=>{
    if (filterType!=='all' && p.type!==filterType) return false
    if (filterGender!=='all' && p.gender!==filterGender) return false
    if (filterCircuit!=='all' && p.circuit!==filterCircuit) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.tournament||'').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const circuits = [...new Set(roster.map(p=>p.circuit).filter(Boolean))]

  const placeTracker = (entity) => {
    const dur = DURATIONS.find(d=>d.value===duration)
    const expires = dur.ms > 0 ? new Date(Date.now()+dur.ms).toISOString().slice(0,10) : null
    const t = {
      id:         `TRK-${uid()}`,
      name:       entity.name,
      type:       entity.type,
      sport,
      circuit:    entity.circuit,
      tournament: entity.tournament,
      alertThreshold,
      duration,
      expires,
      status:     'active',
      iriAlerts:  [],
      createdBy:  user.username,
      createdAt:  ts(),
      lastAlert:  null,
      alertCount: 0,
      triggered:  false,
      monitorBetting: true,
      monitorSocial:  false,
      monitorTravel:  false,
      linkedCase: '',
    }
    const next = [...loadTrackers(), t]
    saveTrackers(next)
    setTrackers(next)
    setShowTracker(null)
    setSelected(null)
  }

  const alreadyTracked = (id) => trackers.some(t=>t.name===roster.find(r=>r.id===id)?.name && t.status==='active')

  const typeColor = t=>({player:S.info,coach:S.accent,official:S.danger}[t]||S.dim)
  const typeIcon  = t=>({player:'🏃',coach:'🎓',official:'⚖️'}[t]||'🔷')

  return (
    <div>
      <SectionHeader title="📋 Roster Module" subtitle="Browse by tournament · Gender · Player · Circuit · Coach · Official · Place trackers with duration"/>

      {/* Sport selector */}
      <div style={{ display:'flex', gap:6, marginBottom:16, overflowX:'auto', flexWrap:'wrap' }}>
        {Object.entries(SPORTS_CONFIG).map(([k,v])=>(
          <button key={k} onClick={()=>setSport(k)} style={{ padding:'5px 11px', borderRadius:6, fontSize:11, cursor:'pointer', background:sport===k?S.mid:'transparent', color:sport===k?S.accent:S.dim, border:`1px solid ${sport===k?S.border:'transparent'}`, whiteSpace:'nowrap' }}>{v.icon} {v.label.split(' ')[0]}</button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ ...cardSm, marginBottom:16, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <Search size={13} color={S.dim}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, tournament…" style={{ ...fieldStyle, width:180 }}/>
        {[['all','All Types'],['player','Players'],['coach','Coaches'],['official','Officials']].map(([v,l])=>(
          <button key={v} onClick={()=>setFilterType(v)} style={{ padding:'4px 10px', borderRadius:5, fontSize:11, cursor:'pointer', background:filterType===v?S.mid:'transparent', color:filterType===v?S.text:S.dim, border:`1px solid ${filterType===v?S.border:'transparent'}` }}>{l}</button>
        ))}
        <select value={filterGender} onChange={e=>setFilterGender(e.target.value)} style={{ ...fieldStyle, width:100, fontSize:11 }}>
          <option value="all">All Genders</option><option value="male">Male</option><option value="female">Female</option>
        </select>
        {circuits.length>0 && <select value={filterCircuit} onChange={e=>setFilterCircuit(e.target.value)} style={{ ...fieldStyle, width:110, fontSize:11 }}>
          <option value="all">All Circuits</option>
          {circuits.map(c=><option key={c} value={c}>{c}</option>)}
        </select>}
        <Btn size="sm" color={hasLiveApi?S.ok:S.dim} variant="outline" onClick={fetchLive} disabled={loading || !hasLiveApi} title={!hasLiveApi?'Configure a Players API in Sports API menu':'Refresh from live API'}>
          <RefreshCw size={10}/>{loading?'Loading…':hasLiveApi?'Live Refresh':'Demo Data'}
        </Btn>
        {!hasLiveApi && <span style={{ color:S.dim, fontSize:10 }}>Configure Players API in God Mode → Sports API for live data</span>}
      </div>

      <div style={{ display:'flex', gap:14, marginBottom:14, flexWrap:'wrap' }}>
        <StatCard label="Total" value={filtered.length}/>
        <StatCard label="Players" value={filtered.filter(r=>r.type==='player').length} color={S.info}/>
        <StatCard label="Coaches" value={filtered.filter(r=>r.type==='coach').length} color={S.accent}/>
        <StatCard label="Officials" value={filtered.filter(r=>r.type==='official').length} color={S.danger}/>
        <StatCard label="Tracked" value={trackers.filter(t=>t.sport===sport&&t.status==='active').length} color={S.god}/>
      </div>

      {/* Roster list */}
      {filtered.map(entity=>{
        const tracked = alreadyTracked(entity.id)
        return (
          <div key={entity.id} style={{ ...card, marginBottom:8, borderLeft:`3px solid ${typeColor(entity.type)}`, cursor:'pointer' }} onClick={()=>setSelected(s=>s===entity.id?null:entity.id)}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:3, flexWrap:'wrap' }}>
                  <span style={{ fontSize:16 }}>{typeIcon(entity.type)}</span>
                  <span style={{ color:S.text, fontSize:14, fontWeight:700 }}>{entity.name}</span>
                  <span style={{ ...badge(typeColor(entity.type)), fontSize:9 }}>{entity.type.toUpperCase()}</span>
                  {entity.circuit && <span style={{ ...badge(S.dim), fontSize:9 }}>{entity.circuit}</span>}
                  {entity.gender && <span style={{ ...badge(S.dim), fontSize:9 }}>{entity.gender==='male'?'♂':'♀'}</span>}
                  {tracked && <span style={{ ...badge(S.god), fontSize:9 }}>📡 TRACKED</span>}
                </div>
                <div style={{ color:S.dim, fontSize:11 }}>
                  {entity.tournament && <span>{entity.tournament} · </span>}
                  {entity.nationality && <span>{entity.nationality}</span>}
                  {entity.ranking > 0 && <span> · Rank #{entity.ranking}</span>}
                  {entity.coach && <span> · Coach: {entity.coach}</span>}
                  {entity.position && <span> · {entity.position} — {entity.team}</span>}
                  {entity.certLevel && <span> · {entity.certLevel}</span>}
                </div>
              </div>
              <Btn size="sm" color={tracked?S.dim:S.god} variant={tracked?'outline':'fill'} onClick={e=>{e.stopPropagation();if(!tracked)setShowTracker(entity)}}>
                {tracked?'📡 Tracking':'+ Track'}
              </Btn>
            </div>
            {selected===entity.id && (
              <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${S.border}`, display:'flex', gap:8, flexWrap:'wrap' }}>
                <Btn size="sm" color={S.info} variant="outline" onClick={e=>{e.stopPropagation();setShowTracker(entity)}}>📡 Track This Entity</Btn>
                <Btn size="sm" color={S.accent} variant="outline" onClick={e=>{e.stopPropagation()}}>📁 View Dossier</Btn>
                <Btn size="sm" color={S.god} variant="outline" onClick={e=>{e.stopPropagation()}}>🕸️ Nexus Graph</Btn>
              </div>
            )}
          </div>
        )
      })}

      {filtered.length===0 && <div style={{ ...card, textAlign:'center', padding:32 }}><div style={{ color:S.dim, fontSize:12 }}>No roster entries match your filters.</div></div>}

      {/* Tracker placement modal */}
      {showTracker && (
        <Modal open={!!showTracker} onClose={()=>setShowTracker(null)} title={`Place Tracker — ${showTracker.name}`}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ ...cardSm, background:S.mid }}>
              <div style={{ color:S.text, fontSize:13, fontWeight:700 }}>{typeIcon(showTracker.type)} {showTracker.name}</div>
              <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>{showTracker.type} · {showTracker.circuit||''} · {showTracker.nationality||''}</div>
            </div>
            <Field label="TRACK DURATION">
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
                {DURATIONS.map(d=>(
                  <button key={d.value} onClick={()=>setDuration(d.value)} style={{ padding:'5px 12px', borderRadius:6, fontSize:12, cursor:'pointer', background:duration===d.value?S.god+'22':'transparent', color:duration===d.value?S.god:S.dim, border:`1px solid ${duration===d.value?S.god+'44':S.border}`, fontWeight:duration===d.value?700:400 }}>{d.label}</button>
                ))}
              </div>
              {duration!=='∞' && <div style={{ color:S.dim, fontSize:10, marginTop:6 }}>Expires: {new Date(Date.now()+(DURATIONS.find(d=>d.value===duration)?.ms||0)).toLocaleDateString()}</div>}
            </Field>
            <Field label={`IRI ALERT THRESHOLD: ${alertThreshold}`}>
              <input type="range" min="30" max="95" value={alertThreshold} onChange={e=>setAlert(+e.target.value)} style={{ width:'100%', accentColor:S.god, marginTop:6 }}/>
            </Field>
            <div style={{ display:'flex', gap:8 }}>
              <Btn color={S.god} onClick={()=>placeTracker(showTracker)}>📡 Start Tracking</Btn>
              <Btn color={S.dim} variant="outline" onClick={()=>setShowTracker(null)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
