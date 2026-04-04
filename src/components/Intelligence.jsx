// IRI v1.5.2 — Intelligence Modules
// Nexus Graph 2.0 · Chrono Engine · FININT · Overwatch · Predictive · Deconfliction · IRI Calc

import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, AreaChart, Area, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Download, Gavel, Eye, Search, Plus } from 'lucide-react'
import { ALL_ROLES } from '../utils/auth.js'
import { S, card, cardSm, badge, Btn, SectionHeader, StatCard, IRIBar, IRIGauge, Field, fieldStyle, textareaStyle, Toggle, SportBadge, OverwatchBadge, ShockBadge, TabPill } from './UI.jsx'
import { VERSION, computeIRI, iriBand, impliedProb, detectShock, computeContextualIRI, checkFalsePositive, bayesianUpdate, detectCommunities, fingerprintSyndicate, computeLiquidityStress, analyzePatternOfLife, predictFutureRisk, blindHash, TIER_V, SPORTS_CONFIG } from '../utils/iri.js'
import { TRIAGE_ITEMS, NETWORK_NODES, NETWORK_EDGES, MOCK_MATCHES, CHRONO_MATCH, FININT_DATA, OVERWATCH_ALERTS, PREDICTIVE_SUBJECTS, DECONFLICT_REGISTRY, OMNIBAR_EXAMPLES, INITIAL_APIS } from '../utils/data.js'
import { loadDismissed, saveDismissed, loadAlerts, saveAlerts, loadApis, saveApis } from '../utils/store.js'

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5)

function NexusGraph() {
  const [selected, setSelected]     = useState(null)
  const [filter,   setFilter]       = useState('all')
  const [showClusters, setShowC]    = useState(true)
  const [expandNode, setExpand]      = useState(null)

  const { communities, centrality, clusters } = useMemo(()=>detectCommunities(NETWORK_NODES, NETWORK_EDGES),[])

  const typeColor = t=>({ player:S.info, official:S.danger, tournament:S.warn, coach:S.accent, sportsbook:'#8b5cf6', bettor:'#ec4899' }[t]||S.midText)
  const W=700, H=420

  const clusterColors = Object.values(clusters)
  const getNodeCluster = (nodeId) => communities[nodeId]
  const getClusterColor = (clusterId) => clusters[clusterId]?.color || S.midText

  return (
    <div>
      <SectionHeader title="🕸️ Nexus Graph 2.0 — Network Intelligence" subtitle="Louvain community detection · Betweenness centrality · Corruption cluster auto-labeling · Kingpin identification"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        <div style={{ ...card, padding:0, overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', borderBottom:`1px solid ${S.border}`, display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            {['all','player','official','tournament','coach','sportsbook','bettor'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{ padding:'3px 10px', borderRadius:4, fontSize:11, cursor:'pointer', background:filter===f?typeColor(f):'transparent', color:filter===f?'#000':S.dim, border:`1px solid ${filter===f?typeColor(f):S.border}`, textTransform:'capitalize' }}>{f}</button>
            ))}
            <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
              <Toggle on={showClusters} onChange={setShowC}/>
              <span style={{ color:S.dim, fontSize:11 }}>Show clusters</span>
            </div>
          </div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:'block', background:'#0d1117' }}>
            {/* Cluster backgrounds */}
            {showClusters && Object.values(clusters).map(cl=>{
              const memberNodes = NETWORK_NODES.filter(n=>communities[n.id]===cl.id)
              if (memberNodes.length < 2) return null
              const xs = memberNodes.map(n=>n.x/100*W), ys = memberNodes.map(n=>n.y/100*H)
              const cx = xs.reduce((s,v)=>s+v,0)/xs.length, cy = ys.reduce((s,v)=>s+v,0)/ys.length
              const r  = Math.max(...memberNodes.map(n=>Math.sqrt(Math.pow(n.x/100*W-cx,2)+Math.pow(n.y/100*H-cy,2))))+30
              return <circle key={cl.id} cx={cx} cy={cy} r={r} fill={cl.color+'10'} stroke={cl.color+'33'} strokeWidth={1.5} strokeDasharray="4 2"/>
            })}
            {/* Cluster labels */}
            {showClusters && Object.values(clusters).map(cl=>{
              const memberNodes = NETWORK_NODES.filter(n=>communities[n.id]===cl.id)
              if (memberNodes.length < 2) return null
              const xs = memberNodes.map(n=>n.x/100*W), ys = memberNodes.map(n=>n.y/100*H)
              const cx = xs.reduce((s,v)=>s+v,0)/xs.length, cy = Math.min(...ys)-38
              return <text key={`lbl-${cl.id}`} x={cx} y={cy} textAnchor="middle" fill={cl.color} fontSize={9} opacity={.8}>{cl.label}</text>
            })}
            {/* Edges */}
            {NETWORK_EDGES.map((e,i)=>{
              const fn=NETWORK_NODES.find(n=>n.id===e.from), tn=NETWORK_NODES.find(n=>n.id===e.to)
              if(!fn||!tn) return null
              const vis=filter==='all'||fn.type===filter||tn.type===filter
              return <line key={i} x1={fn.x/100*W} y1={fn.y/100*H} x2={tn.x/100*W} y2={tn.y/100*H} stroke={e.type==='officiated_at'?S.danger:e.type==='coaches'?S.accent:e.type==='linked'?'#a855f7':S.border} strokeWidth={e.w/4} opacity={vis?.6:.08} strokeDasharray={e.type==='markets'?'3 2':undefined}/>
            })}
            {/* Nodes */}
            {NETWORK_NODES.map(n=>{
              const x=n.x/100*W, y=n.y/100*H, c=typeColor(n.type)
              const r=7+centrality[n.id]/12
              const vis=filter==='all'||n.type===filter
              const isSel=selected?.id===n.id
              const clColor=getClusterColor(communities[n.id])
              return (
                <g key={n.id} onClick={()=>setSelected(s=>s?.id===n.id?null:n)} style={{ cursor:'pointer' }}>
                  {showClusters && <circle cx={x} cy={y} r={r+5} fill={clColor+'15'}/>}
                  {isSel && <circle cx={x} cy={y} r={r+8} fill="none" stroke={c} strokeWidth={2} opacity={.5}/>}
                  {n.flagged && <circle cx={x} cy={y} r={r+4} fill="none" stroke={c} strokeWidth={1} opacity={.4}/>}
                  <circle cx={x} cy={y} r={r} fill={c} opacity={vis?1:.12}/>
                  <text x={x} y={y+4} textAnchor="middle" fill="#000" fontSize={9} fontWeight="700">{n.risk}</text>
                  <text x={x} y={y+r+12} textAnchor="middle" fill={vis?c:'#333'} fontSize={8}>{n.label.split(' ').slice(-1)[0]}</text>
                </g>
              )
            })}
          </svg>
          <div style={{ padding:'8px 14px', borderTop:`1px solid ${S.border}`, display:'flex', gap:12, flexWrap:'wrap', fontSize:10, color:S.dim }}>
            <span>Node size = betweenness centrality</span><span>Number = risk score</span><span>Dashed rings = corruption clusters</span>
            <span style={{ marginLeft:'auto' }}>Louvain community detection · {Object.keys(clusters).length} clusters found</span>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Cluster list */}
          <div style={card}>
            <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:10 }}>Detected Clusters</div>
            {Object.values(clusters).map(cl=>(
              <div key={cl.id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${S.border}44`, cursor:'pointer' }}>
                <div>
                  <div style={{ color:cl.color, fontSize:12, fontWeight:700 }}>{cl.label}</div>
                  <div style={{ color:S.dim, fontSize:10 }}>{cl.members.length} entities · Avg risk: {cl.avgRisk}</div>
                </div>
                <span style={{ ...badge(cl.color), fontSize:9, alignSelf:'center' }}>{cl.avgRisk>70?'CRITICAL':cl.avgRisk>50?'HIGH':'LOW'}</span>
              </div>
            ))}
          </div>

          {/* Centrality leaderboard */}
          <div style={card}>
            <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:10 }}>👑 Kingpin Detection</div>
            <div style={{ color:S.dim, fontSize:11, marginBottom:8 }}>Betweenness centrality — bridge actors</div>
            {[...NETWORK_NODES].sort((a,b)=>b.betweenness-a.betweenness).slice(0,5).map((n,i)=>(
              <div key={n.id} onClick={()=>setSelected(n)} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${S.border}44`, cursor:'pointer' }}>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <span style={{ color:S.dim, fontSize:10, width:14 }}>#{i+1}</span>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:typeColor(n.type), display:'inline-block' }}/>
                  <span style={{ color:S.text, fontSize:12 }}>{n.label}</span>
                  {n.flagged && <span style={{ color:S.danger, fontSize:9 }}>⚑</span>}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <span style={{ color:S.god, fontSize:11 }}>{n.betweenness}</span>
                  <span style={{ ...badge(iriBand(n.risk).color), fontSize:9 }}>{n.risk}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected node detail */}
          {selected ? (
            <div style={{ ...cardSm, borderTop:`3px solid ${typeColor(selected.type)}` }}>
              <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                <span style={{ ...badge(typeColor(selected.type)) }}>{selected.type}</span>
                <SportBadge sport={selected.sport}/>
              </div>
              <div style={{ color:S.text, fontSize:15, fontWeight:700, marginBottom:4 }}>{selected.label}</div>
              {[['Risk Score',selected.risk,iriBand(selected.risk).color],['Centrality',selected.betweenness,S.god],['Cluster',clusters[communities[selected.id]]?.label||'—',getClusterColor(communities[selected.id])]].map(([l,v,c])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:`1px solid ${S.border}44` }}>
                  <span style={{ color:S.dim, fontSize:12 }}>{l}</span>
                  <span style={{ color:c, fontSize:12, fontWeight:700 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex', gap:6, marginTop:10 }}>
                <Btn size="sm" color={S.danger}><Gavel size={10}/>Case</Btn>
                <Btn size="sm" color={S.info} variant="outline">Dossier</Btn>
              </div>
            </div>
          ) : <div style={{ ...cardSm, textAlign:'center', color:S.dim, fontSize:12 }}>Click any node to inspect</div>}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHRONO ENGINE — Match timeline replay with odds movement overlay
// ═══════════════════════════════════════════════════════════════════════════════
function ChronoEngine() {
  const [playing,  setPlaying]  = useState(false)
  const [position, setPosition] = useState(0)
  const [speed,    setSpeed]    = useState(1)
  const match = CHRONO_MATCH

  useEffect(()=>{
    if (!playing) return
    const interval = setInterval(()=>{
      setPosition(p=>{ if(p>=match.timeline.length-1){setPlaying(false);return p} return p+1 })
    }, 1500/speed)
    return ()=>clearInterval(interval)
  },[playing,speed])

  const current = match.timeline[position]
  const chartData = match.timeline.slice(0,position+1)

  const eventColor = t=>({ market:S.info, betting:S.warn, alert:S.danger, forensic:'#8b5cf6', network:'#a855f7', shock:'#ef4444', match:S.ok, result:S.accent }[t]||S.dim)

  return (
    <div>
      <SectionHeader title="⏱ Chrono Engine — Match Timeline Replay" subtitle="Odds movement vs match events · IRI progression · Black Swan animation · Pattern of Life"/>
      <div style={{ ...card, marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, flexWrap:'wrap', gap:8 }}>
          <div>
            <div style={{ color:S.text, fontSize:15, fontWeight:700 }}>{match.p1} vs {match.p2}</div>
            <div style={{ color:S.dim, fontSize:11 }}>{match.event} · {match.date}</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ color:S.dim, fontSize:11 }}>Speed:</span>
            {[1,2,4].map(s=><button key={s} onClick={()=>setSpeed(s)} style={{ padding:'3px 10px', borderRadius:4, fontSize:11, cursor:'pointer', background:speed===s?S.accent:'transparent', color:speed===s?'#000':S.dim, border:`1px solid ${speed===s?S.accent:S.border}` }}>{s}×</button>)}
            <Btn size="sm" color={playing?S.danger:S.ok} onClick={()=>setPlaying(p=>!p)}>{playing?'⏸ Pause':'▶ Replay'}</Btn>
            <Btn size="sm" color={S.dim} variant="outline" onClick={()=>{setPosition(0);setPlaying(false)}}>↺ Reset</Btn>
          </div>
        </div>
        <input type="range" min="0" max={match.timeline.length-1} value={position} onChange={e=>setPosition(+e.target.value)} style={{ width:'100%', accentColor:S.accent }}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* IRI progression chart */}
        <div style={card}>
          <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:12 }}>IRI Score Progression</div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={S.border}/>
              <XAxis dataKey="ts" tick={{ fill:S.dim, fontSize:9 }}/>
              <YAxis tick={{ fill:S.dim, fontSize:10 }} domain={[0,100]}/>
              <Tooltip contentStyle={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:8 }}/>
              <ReferenceLine y={70} stroke={S.danger} strokeDasharray="3 3"/>
              <Area type="monotone" dataKey="iriScore" fill={`${S.danger}22`} stroke={S.danger} strokeWidth={2.5} fillOpacity={0.4}/>
              <Bar dataKey="volume" fill={S.info+'44'} yAxisId={0}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {/* Odds movement */}
        <div style={card}>
          <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:12 }}>Betting Volume (units)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={S.border}/>
              <XAxis dataKey="ts" tick={{ fill:S.dim, fontSize:9 }}/>
              <YAxis tick={{ fill:S.dim, fontSize:10 }}/>
              <Tooltip contentStyle={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:8 }}/>
              <Area type="monotone" dataKey="volume" stroke={S.accent} fill={`${S.accent}22`} strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Current event */}
      {current && (
        <div style={{ ...card, marginBottom:16, borderLeft:`3px solid ${eventColor(current.type)}`, background:current.type==='shock'?'#1a0000':S.card }}>
          <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ fontSize:28 }}>{current.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                <span style={{ ...badge(eventColor(current.type)), fontSize:10 }}>{current.type.toUpperCase()}</span>
                <span style={{ color:S.dim, fontSize:11, fontFamily:"'IBM Plex Mono',monospace" }}>{current.ts}</span>
                {current.type==='shock' && <span style={{ ...badge('#a855f7') }}>🦢 BLACK SWAN FORMING</span>}
              </div>
              <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>{current.event}</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ color:S.dim, fontSize:10 }}>IRI AT THIS POINT</div>
              <div style={{ color:iriBand(current.iriScore).color, fontSize:36, fontWeight:900 }}>{current.iriScore}</div>
            </div>
          </div>
        </div>
      )}

      {/* Full timeline */}
      <div style={card}>
        <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:14 }}>Full Integrity Timeline</div>
        {match.timeline.map((t,i)=>(
          <div key={t.ts} onClick={()=>setPosition(i)} style={{ display:'flex', gap:12, padding:'6px 8px', borderRadius:8, cursor:'pointer', background:i===position?S.mid:'transparent', marginBottom:2 }}>
            <span style={{ color:S.dim, fontSize:11, fontFamily:"'IBM Plex Mono',monospace", width:46, flexShrink:0 }}>{t.ts}</span>
            <span style={{ fontSize:14, flexShrink:0 }}>{t.icon}</span>
            <span style={{ color:i<=position?S.text:S.dim, fontSize:12, flex:1 }}>{t.event}</span>
            <span style={{ color:iriBand(t.iriScore).color, fontSize:12, fontWeight:700 }}>{t.iriScore}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FININT LAYER — Betting flow, syndicate fingerprinting, liquidity stress
// ═══════════════════════════════════════════════════════════════════════════════
function FinintLayer() {
  const [activeSection, setSection] = useState('flow')

  return (
    <div>
      <SectionHeader title="💰 FININT Layer — Financial Intelligence" subtitle="Betting flow analysis · Syndicate fingerprinting · Liquidity stress · Follow the money"/>
      <div style={{ display:'flex', gap:6, marginBottom:18, flexWrap:'wrap' }}>
        {[['flow','📊 Flow Analysis'],['syndicates','🎯 Syndicate IDs'],['liquidity','💧 Liquidity Stress']].map(([id,l])=>(
          <button key={id} onClick={()=>setSection(id)} style={{ padding:'7px 14px', borderRadius:6, fontSize:12, cursor:'pointer', background:activeSection===id?S.mid:'transparent', color:activeSection===id?S.ok:S.dim, border:`1px solid ${activeSection===id?S.ok+'44':'transparent'}`, fontWeight:activeSection===id?700:400 }}>{l}</button>
        ))}
      </div>

      {activeSection==='flow' && (
        <div>
          <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
            <StatCard label="Total Flow (24h)"    value="$12.4M" color={S.accent}/>
            <StatCard label="Suspicious Flow"     value="$2.1M"  color={S.danger}/>
            <StatCard label="Suspicious %"        value="16.9%"  color={S.warn}/>
            <StatCard label="Flagged Markets"     value={FININT_DATA.liquidityMarkets.filter(m=>m.stress>60).length} color={S.danger}/>
          </div>
          <div style={{ ...card, marginBottom:16 }}>
            <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Legitimate vs Suspicious Betting Flow (24h)</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={FININT_DATA.flowData}>
                <CartesianGrid strokeDasharray="3 3" stroke={S.border}/>
                <XAxis dataKey="ts" tick={{ fill:S.dim, fontSize:10 }}/>
                <YAxis tick={{ fill:S.dim, fontSize:10 }} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
                <Tooltip contentStyle={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:8 }} formatter={v=>[`$${(v/1000).toFixed(0)}K`]}/>
                <Area type="monotone" dataKey="legitimate" name="Legitimate" stroke={S.ok} fill={`${S.ok}22`} strokeWidth={2}/>
                <Area type="monotone" dataKey="suspicious"  name="Suspicious"  stroke={S.danger} fill={`${S.danger}22`} strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ color:S.dim, fontSize:12, ...cardSm }}>FININT Note: Suspicious flow peaks at 09:00–12:00 window correspond with match start times for ITF Antalya and ITF Cairo — coordinated pre-match market seeding detected. Cross-reference Syndicate Alpha 18-minute bet interval fingerprint.</div>
        </div>
      )}

      {activeSection==='syndicates' && (
        <div>
          <div style={{ ...card, marginBottom:14, color:S.dim, fontSize:12, lineHeight:1.7 }}>
            Syndicate Fingerprinting detects repeated bet timing patterns and odds exploitation windows. A confidence score ≥ 65% indicates statistically non-random betting behavior consistent with coordinated market manipulation.
          </div>
          {FININT_DATA.syndicates.map(s=>(
            <div key={s.id} style={{ ...card, marginBottom:12, borderLeft:`3px solid ${s.color}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                    <span style={{ color:S.text, fontSize:15, fontWeight:700 }}>{s.label}</span>
                    <span style={{ ...badge(s.color) }}>{s.confidence}% confidence</span>
                    <span style={{ ...badge(s.status==='Active'?S.danger:S.dim) }}>{s.status}</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[['Members',s.members],['Markets',s.markets.join(', ')],['Avg Bet Interval',`${s.avgBetInterval} min`],['Pattern',s.pattern],['Detected Matches',s.detectedMatches],['Total Volume',s.totalVolume]].map(([l,v])=>(
                      <div key={l}><div style={{ color:S.dim, fontSize:10 }}>{l}</div><div style={{ color:S.text, fontSize:12, fontWeight:600 }}>{v}</div></div>
                    ))}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <Btn size="sm" color={S.danger}><Gavel size={10}/>Open Case</Btn>
                  <Btn size="sm" color={S.info} variant="outline"><Download size={10}/>Report</Btn>
                </div>
              </div>
              <div style={{ marginTop:12, background:S.mid, borderRadius:8, padding:10 }}>
                <div style={{ color:S.dim, fontSize:10, marginBottom:4 }}>EXPLAINABILITY (XAI) — Why flagged?</div>
                <div style={{ color:S.midText, fontSize:11 }}>Betting intervals show σ={Math.round(s.avgBetInterval*0.12)} min standard deviation against {s.avgBetInterval} min mean — regularity score {(100-s.avgBetInterval*0.5).toFixed(0)}%. Combined with shared odds exploitation windows across {s.markets.length} market types and volume concentration 40× above baseline.</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection==='liquidity' && (
        <div>
          <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:14 }}>Liquidity Stress Indicators</div>
          {FININT_DATA.liquidityMarkets.map(m=>{
            const ls = computeLiquidityStress({ normalVolume:m.normalVol, currentVolume:m.currentVol, bookmakerCount:m.books, oddsDispersion:m.dispersion })
            return (
              <div key={m.market} style={{ ...card, marginBottom:10, borderLeft:`3px solid ${ls.color}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ color:S.text, fontSize:13, fontWeight:700 }}>{m.market}</div>
                    <div style={{ display:'flex', gap:16, marginTop:6, flexWrap:'wrap' }}>
                      <span style={{ color:S.dim, fontSize:11 }}>Vol ratio: <span style={{ color:ls.color, fontWeight:600 }}>{ls.volRatio}×</span></span>
                      <span style={{ color:S.dim, fontSize:11 }}>Books: {m.books}</span>
                      <span style={{ color:S.dim, fontSize:11 }}>Dispersion: {m.dispersion}pt</span>
                    </div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ color:S.dim, fontSize:10 }}>STRESS</div>
                    <div style={{ color:ls.color, fontSize:28, fontWeight:900 }}>{ls.stress}</div>
                    <span style={{ ...badge(ls.color), fontSize:9 }}>{ls.level}</span>
                  </div>
                </div>
                <div style={{ marginTop:8, background:S.mid, borderRadius:4, height:7 }}>
                  <div style={{ background:ls.color, borderRadius:4, height:7, width:`${ls.stress}%`, transition:'width .4s' }}/>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERWATCH ENGINE — Multi-tier pre-match alerts
// ═══════════════════════════════════════════════════════════════════════════════
function OverwatchEngine({ onCreateCase }) {
  const [alerts, setAlerts] = useState(OVERWATCH_ALERTS)
  const [created, setCreated] = useState({})
  const levelColor = l=>({ Black:'#a855f7', Red:S.danger, Yellow:S.accent }[l]||S.dim)

  const autoCase = (a) => {
    if (onCreateCase) {
      onCreateCase({
        title:       `[OVERWATCH ${a.level?.toUpperCase()}] ${a.match} — ${a.event}`,
        severity:    a.level==='Black'?'Critical':a.level==='Red'?'High':'Medium',
        sport:       a.sport,
        jurisdiction:'',
        assignee:    '',
        supervisor:  '',
        description: `Auto-created from Overwatch ${a.level} alert.\nTrigger: ${a.trigger}\nIRI Score: ${a.iriScore}\nHours to start: ${a.hoursToStart}h\nAlert ID: ${a.id}`,
      })
    }
    setCreated(c=>({...c,[a.id]:true}))
  }

  return (
    <div>
      <SectionHeader title="🚨 Overwatch Engine — Pre-Match Intelligence" subtitle="Multi-tier alerts: ⬛ Black · 🔴 Red · 🟡 Yellow · Real-time pre-match detection · Auto case creation"/>
      <div style={{ ...card, marginBottom:16, borderColor:'#a855f744', background:'#0d0014' }}>
        <div style={{ color:'#a855f7', fontSize:12, fontWeight:700, marginBottom:4 }}>OVERWATCH SYSTEM STATUS</div>
        <div style={{ display:'flex', gap:20, flexWrap:'wrap', fontSize:12 }}>
          {[['⬛ BLACK',alerts.filter(a=>a.level==='Black').length,'#a855f7'],['🔴 RED',alerts.filter(a=>a.level==='Red').length,S.danger],['🟡 YELLOW',alerts.filter(a=>a.level==='Yellow').length,S.accent],['Pre-Match Active',alerts.filter(a=>a.preMatch).length,S.ok]].map(([l,v,c])=>(
            <div key={l}><span style={{ color:S.dim }}>{l}: </span><span style={{ color:c, fontWeight:700 }}>{v}</span></div>
          ))}
        </div>
      </div>

      {/* Level guide */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:18 }}>
        {[['⬛ OVERWATCH BLACK','#a855f7','Systemic risk event. Multi-cluster convergence. IRI > 85. Immediate intervention required. All supervisors notified.'],['🔴 OVERWATCH RED',S.danger,'Cluster-linked anomaly. IRI > 70. Open case recommended. Email + SMS notification.'],['🟡 OVERWATCH YELLOW',S.accent,'Standard anomaly. IRI > 50. Monitor and flag. Standard email notification.']].map(([l,c,d])=>(
          <div key={l} style={{ ...cardSm, borderLeft:`3px solid ${c}` }}>
            <div style={{ color:c, fontSize:12, fontWeight:700, marginBottom:4 }}>{l}</div>
            <div style={{ color:S.dim, fontSize:11 }}>{d}</div>
          </div>
        ))}
      </div>

      {alerts.map(a=>(
        <div key={a.id} style={{ ...card, marginBottom:10, borderLeft:`4px solid ${levelColor(a.level)}`, background:a.level==='Black'?'#0d0014':S.card }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
                <OverwatchBadge level={a.level}/>
                <SportBadge sport={a.sport}/>
                {a.preMatch && <span style={{ ...badge(S.ok), fontSize:9 }}>PRE-MATCH</span>}
                <span style={{ color:S.dim, fontSize:11 }}>Starts in {a.hoursToStart}h</span>
              </div>
              <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:2 }}>{a.match}</div>
              <div style={{ color:S.dim, fontSize:11, marginBottom:8 }}>{a.event}</div>
              <div style={{ ...cardSm, background:S.mid, fontSize:11, color:S.midText, lineHeight:1.6 }}>
                <span style={{ color:S.dim }}>Trigger: </span>{a.trigger}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ color:S.dim, fontSize:10 }}>IRI</div>
                <div style={{ color:iriBand(a.iriScore).color, fontSize:32, fontWeight:900 }}>{a.iriScore}</div>
              </div>
              <Btn size="sm" color={created[a.id]?S.ok:levelColor(a.level)} onClick={()=>autoCase(a)} disabled={created[a.id]}>{created[a.id]?'✓ Case Created':'Auto Case'}</Btn>
              <Btn size="sm" color={S.info} variant="outline"><Download size={10}/>Brief</Btn>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREDICTIVE MODELING — Future risk forecasting
// ═══════════════════════════════════════════════════════════════════════════════
function PredictiveModeling() {
  const [selected, setSelected] = useState(null)

  const scored = PREDICTIVE_SUBJECTS.map(s=>{
    const pred = predictFutureRisk({ earningsInstability:s.earningsInstability, travelLoad:s.travelLoad, clusterExposure:s.clusterExposure, recentIRItrend:s.recentIRI })
    const pol  = analyzePatternOfLife(s.recentIRI.map((v,i)=>({value:v,ts:`T-${i}`})))
    return { ...s, pred, pol }
  }).sort((a,b)=>b.pred.score-a.pred.score)

  return (
    <div>
      <SectionHeader title="🔮 Predictive Integrity Modeling" subtitle="Future risk forecasting · Earnings instability · Travel load · Cluster exposure · Rational Choice Theory"/>
      <div style={{ ...card, marginBottom:16, borderLeft:`3px solid #8b5cf6` }}>
        <div style={{ color:'#8b5cf6', fontSize:12, fontWeight:700, marginBottom:4 }}>PREDICTIVE MODEL BASIS</div>
        <div style={{ color:S.dim, fontSize:12, lineHeight:1.7 }}>Inputs: Financial precarity (earnings instability index), cognitive load (travel density), network contamination (cluster exposure score), and trend velocity (recent IRI trajectory). Directly implements Rational Choice Theory from Kirby (2026) — individuals most susceptible when perceived benefit exceeds perceived risk.</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {scored.map(s=>(
          <div key={s.name} onClick={()=>setSelected(x=>x?.name===s.name?null:s)}
            style={{ ...card, cursor:'pointer', borderLeft:`3px solid ${s.pred.color}`, background:selected?.name===s.name?S.mid:S.card }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div>
                <div style={{ color:S.text, fontSize:14, fontWeight:700 }}>{s.name}</div>
                <div style={{ display:'flex', gap:6, marginTop:4 }}>
                  <SportBadge sport={s.sport}/>
                  <span style={{ ...badge(s.pred.color) }}>{s.pred.level} RISK</span>
                  {s.pol.flagged && <span style={{ ...badge(S.warn), fontSize:9 }}>⚠ POL DEVIATION</span>}
                </div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ color:S.dim, fontSize:10 }}>PREDICTED RISK</div>
                <div style={{ color:s.pred.color, fontSize:32, fontWeight:900 }}>{s.pred.score}</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {[['Earnings Instability',s.earningsInstability],['Travel Load',s.travelLoad],['Cluster Exposure',s.clusterExposure],['Current IRI Trend',s.recentIRI[s.recentIRI.length-1]]].map(([l,v])=>(
                <div key={l}>
                  <div style={{ color:S.dim, fontSize:9 }}>{l}</div>
                  <div style={{ background:S.mid, borderRadius:3, height:5, marginTop:2 }}>
                    <div style={{ background:s.pred.color, borderRadius:3, height:5, width:`${typeof v==='number'&&v<=1?v*100:Math.min(v,100)}%` }}/>
                  </div>
                </div>
              ))}
            </div>
            {selected?.name===s.name && (
              <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${S.border}` }}>
                <div style={{ color:S.dim, fontSize:11, marginBottom:6 }}>IRI TRAJECTORY</div>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={s.recentIRI.map((v,i)=>({i,v}))}>
                    <Line type="monotone" dataKey="v" stroke={s.pred.color} strokeWidth={2} dot={{ r:3, fill:s.pred.color }}/>
                    <ReferenceLine y={70} stroke={S.danger} strokeDasharray="3 2" strokeWidth={1}/>
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ color:S.dim, fontSize:10, marginTop:8 }}>Recommendation: <span style={{ color:s.pred.color, fontWeight:600 }}>{s.pred.recommendation}</span></div>
                <div style={{ display:'flex', gap:6, marginTop:8 }}>
                  <Btn size="sm" color={s.pred.color}><Eye size={10}/>Watch List</Btn>
                  <Btn size="sm" color={S.info} variant="outline">Dossier</Btn>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DECONFLICTION ENGINE — Multi-agency blind hash matching
// ═══════════════════════════════════════════════════════════════════════════════
function DeconflictionEngine({ user }) {
  const [registry, setRegistry] = useState(DECONFLICT_REGISTRY)
  const [query,    setQuery]    = useState('')
  const [result,   setResult]   = useState(null)
  const [addForm,  setAddForm]  = useState({ entity:'', caseType:'' })

  const search = () => {
    if (!query.trim()) return
    const hash = blindHash(query.trim())
    const match = registry.find(r=>r.hash===hash)
    setResult({ hash, found:!!match, match })
  }

  const addEntity = () => {
    if (!addForm.entity.trim()) return
    const hash = blindHash(addForm.entity)
    const existing = registry.find(r=>r.hash===hash)
    const entry = {
      agency: ALL_ROLES[user?.role]?.label || 'Unknown',
      entity: `${addForm.entity} (hashed)`, hash, caseType: addForm.caseType,
      status:'Active', matched:!!existing,
      matchedAgency: existing?.agency || null,
    }
    setRegistry(r=>[...r,entry])
    setResult({ hash, found:!!existing, match:existing, newEntry:true })
    setAddForm({ entity:'', caseType:'' })
    if (existing) alert(`⚠ DECONFLICTION ALERT: Hash ${hash} already registered by ${existing.agency}. Supervisors of both agencies have been notified.`)
  }

  return (
    <div>
      <SectionHeader title="🔐 Deconfliction Engine" subtitle="Prevent duplicate investigations · Blind hash matching · Multi-agency coordination without data exposure"/>
      <div style={{ ...card, marginBottom:16, borderLeft:`3px solid ${S.secure}` }}>
        <div style={{ color:S.secure, fontSize:12, fontWeight:700, marginBottom:6 }}>HOW IT WORKS</div>
        <div style={{ color:S.dim, fontSize:12, lineHeight:1.7 }}>When you add an entity to your investigation, the system runs a one-way cryptographic hash (SHA-256). It then compares that hash against all other agencies on the platform. Neither agency can see the other's case file — only a "collision" alert is generated, prompting secure channel contact. This prevents two agencies from simultaneously investigating (or accidentally compromising) the same target.</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Search */}
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Search Registry</div>
          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Enter entity name or identifier…" style={{ ...fieldStyle, flex:1 }} onKeyDown={e=>e.key==='Enter'&&search()}/>
            <Btn color={S.secure} onClick={search}><Search size={11}/>Hash & Search</Btn>
          </div>
          {result && (
            <div style={{ ...cardSm, borderLeft:`3px solid ${result.found?S.warn:S.ok}` }}>
              <div style={{ color:S.dim, fontSize:10, marginBottom:4 }}>BLIND HASH</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", color:S.accent, fontSize:13, marginBottom:8 }}>{result.hash}</div>
              {result.found ? (
                <div>
                  <div style={{ ...badge(S.warn), marginBottom:6 }}>⚠ DECONFLICTION MATCH</div>
                  <div style={{ color:S.midText, fontSize:12 }}>This entity is already under investigation by <span style={{ color:S.warn, fontWeight:700 }}>{result.match?.agency}</span>. Case type: {result.match?.caseType}. A secure deconfliction channel has been opened.</div>
                </div>
              ) : (
                <div style={{ color:S.ok, fontSize:12 }}>✓ No match found. Entity not in any other agency's registry.</div>
              )}
              {result.newEntry && <div style={{ color:S.info, fontSize:11, marginTop:6 }}>✓ Added to your agency's registry.</div>}
            </div>
          )}
        </div>

        {/* Add entity */}
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Add to Registry</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Field label="ENTITY NAME / IDENTIFIER"><input value={addForm.entity} onChange={e=>setAddForm(f=>({...f,entity:e.target.value}))} placeholder="Player name, phone, email, alias…" style={fieldStyle}/></Field>
            <Field label="CASE TYPE"><input value={addForm.caseType} onChange={e=>setAddForm(f=>({...f,caseType:e.target.value}))} placeholder="Match Fixing / Money Laundering / etc." style={fieldStyle}/></Field>
            <Btn color={S.secure} onClick={addEntity}><Plus size={11}/>Add (Hashed & Private)</Btn>
          </div>
          <div style={{ color:S.dim, fontSize:10, marginTop:10 }}>The entity's real name is never stored. Only the one-way hash is retained. Your case details remain fully private.</div>
        </div>
      </div>

      {/* Registry */}
      <div style={card}>
        <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:12 }}>Deconfliction Registry ({registry.length} entries)</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {registry.map((r,i)=>(
            <div key={i} style={{ ...cardSm, borderLeft:`3px solid ${r.matched?S.warn:S.ok}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                <div>
                  <div style={{ color:S.dim, fontSize:10 }}>{r.agency}</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", color:S.accent, fontSize:11, margin:'2px 0' }}>{r.hash}</div>
                  <div style={{ color:S.midText, fontSize:11 }}>{r.caseType}</div>
                </div>
                {r.matched && (
                  <div>
                    <div style={{ ...badge(S.warn), fontSize:9 }}>⚠ MATCHED</div>
                    <div style={{ color:S.dim, fontSize:9, marginTop:3 }}>↔ {r.matchedAgency}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// IRI CALCULATOR v2 — Bayesian + shock detection + false positive guardrail
// ═══════════════════════════════════════════════════════════════════════════════
function IRICalculator() {
  const [form, setForm] = useState({ favOdds:1.38, dogOdds:3.05, gap:28, tier:'challenger', surface:'clay', w1:0.5, prevIRI:45, clusterExposure:0, injury:false, surfaceTrans:false, travel:false })
  const [showXAI, setShowXAI] = useState(false)

  const result  = useMemo(()=>computeIRI({ favoriteOdds:+form.favOdds, underdogOdds:+form.dogOdds, rankingGap:+form.gap, tier:form.tier, surface:form.surface, w1:+form.w1, w2:+(1-form.w1).toFixed(1), clusterExposure:+form.clusterExposure }),[form])
  const shock   = useMemo(()=>detectShock(+form.prevIRI, result.iri),[result.iri, form.prevIRI])
  const fp      = useMemo(()=>checkFalsePositive({ iri:result.iri, injuryFlag:form.injury, surfaceTransition:form.surfaceTrans, travelFatigue:form.travel }),[result.iri, form.injury, form.surfaceTrans, form.travel])
  const ctxIRI  = useMemo(()=>computeContextualIRI({ matchIRI:result.iri }),[result.iri])
  const bayes   = useMemo(()=>bayesianUpdate({ prior:0.18, likelihood:result.Pw }),[result.Pw])

  const TIER_LABELS_MAP = { grand_slam:'Grand Slam',masters:'Masters',tour_500:'500 Level',tour_250:'250/Intl',challenger:'Challenger',itf:'ITF/Futures' }

  return (
    <div>
      <SectionHeader title="⚡ IRI Calculator v2" subtitle="IRI = 100 × [w₁ × |Y−Pw| + w₂ × V] · Bayesian layer · Shock detection · Contextual IRI · XAI"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={card}>
          <div style={{ color:S.text, fontSize:14, fontWeight:700, marginBottom:16 }}>Parameters</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <Field label="FAVORITE ODDS" hint={`Implied P(win): ${(impliedProb(+form.favOdds)*100).toFixed(1)}%`}><input type="number" step="0.01" min="1.01" value={form.favOdds} onChange={e=>setForm(f=>({...f,favOdds:e.target.value}))} style={fieldStyle}/></Field>
            <Field label="UNDERDOG ODDS"><input type="number" step="0.01" min="1.01" value={form.dogOdds} onChange={e=>setForm(f=>({...f,dogOdds:e.target.value}))} style={fieldStyle}/></Field>
            <Field label="RANKING GAP"><input type="number" min="0" value={form.gap} onChange={e=>setForm(f=>({...f,gap:e.target.value}))} style={fieldStyle}/></Field>
            <Field label={`TIER (V = ${(TIER_V[form.tier]||0.5).toFixed(2)})`}>
              <select value={form.tier} onChange={e=>setForm(f=>({...f,tier:e.target.value}))} style={fieldStyle}>
                {Object.entries(TIER_LABELS_MAP).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label={`w₁: ${form.w1} / w₂: ${(1-form.w1).toFixed(1)}`}><input type="range" min="0.1" max="0.9" step="0.1" value={form.w1} onChange={e=>setForm(f=>({...f,w1:parseFloat(e.target.value)}))} style={{ width:'100%', marginTop:6 }}/></Field>
            <Field label="CLUSTER EXPOSURE (0–1)" hint="Network contamination multiplier"><input type="range" min="0" max="1" step="0.1" value={form.clusterExposure} onChange={e=>setForm(f=>({...f,clusterExposure:parseFloat(e.target.value)}))} style={{ width:'100%', marginTop:6 }}/><div style={{ color:S.god, fontSize:10, marginTop:2 }}>Cluster mult: {(result.clusterMult||1).toFixed(2)}×</div></Field>
            <Field label="PREVIOUS IRI (for shock detection)"><input type="number" min="0" max="100" value={form.prevIRI} onChange={e=>setForm(f=>({...f,prevIRI:e.target.value}))} style={fieldStyle}/></Field>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ color:S.dim, fontSize:11 }}>FALSE POSITIVE GUARDRAILS</div>
              {[['injury','Injury Reported'],['surfaceTrans','Surface Transition'],['travel','Travel Fatigue']].map(([k,l])=>(
                <Toggle key={k} on={form[k]} onChange={v=>setForm(f=>({...f,[k]:v}))} label={l}/>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ ...card, textAlign:'center' }}>
            <IRIGauge value={fp.adjustedIRI}/>
            {fp.suppressed && <div style={{ ...badge(S.ok), marginTop:8, display:'inline-block' }}>FP Adjusted: {result.iri.toFixed(0)} → {fp.adjustedIRI.toFixed(0)}</div>}
            {shock.isShock && <div style={{ marginTop:8 }}><ShockBadge delta={Math.round(shock.delta)}/></div>}
          </div>

          {/* Shock detection */}
          {shock.isShock && (
            <div style={{ ...card, borderLeft:`3px solid ${shock.color}`, background:shock.isBlackSwan?'#0d0014':S.card }}>
              <div style={{ color:shock.color, fontSize:13, fontWeight:700 }}>{shock.label}</div>
              <div style={{ color:S.dim, fontSize:11, marginTop:4 }}>Δ = +{shock.delta.toFixed(0)} points · Rate: {shock.rate} pts/min</div>
              <div style={{ color:S.midText, fontSize:11, marginTop:4 }}>{"Interpret as: 'Black Swan micro-event forming' — Kirby (2026) §3.4"}</div>
            </div>
          )}

          {/* Contextual IRI */}
          <div style={card}>
            <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:10 }}>Contextual IRI Layers</div>
            {[['Match-Level',ctxIRI.matchLevel,iriBand(ctxIRI.matchLevel).color],['Player Rolling',ctxIRI.playerLevel,iriBand(ctxIRI.playerLevel).color],['Tournament Structural',ctxIRI.tournamentLevel,iriBand(ctxIRI.tournamentLevel).color],['Composite (50/30/20)',ctxIRI.compositeIRI,iriBand(ctxIRI.compositeIRI).color]].map(([l,v,c])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${S.border}44` }}>
                <span style={{ color:S.dim, fontSize:12 }}>{l}</span>
                <span style={{ color:c, fontSize:13, fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Bayesian update */}
          <div style={card}>
            <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:10 }}>Bayesian Update</div>
            {[['Market Implied',`${(bayes.rawPosterior*100).toFixed(1)}%`,S.warn],['Prior (18%)',`${18}%`,S.info],['Posterior',`${(bayes.posterior*100).toFixed(1)}%`,S.ok],['Divergence',`${bayes.divergence.toFixed(1)}ppt`,bayes.significant?S.danger:S.ok]].map(([l,v,c])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${S.border}44` }}>
                <span style={{ color:S.dim, fontSize:12 }}>{l}</span>
                <span style={{ color:c, fontSize:12, fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* XAI panel */}
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div style={{ color:S.text, fontSize:13, fontWeight:700 }}>🧠 Explainability (XAI)</div>
              <Btn size="sm" color={S.dim} variant="outline" onClick={()=>setShowXAI(x=>!x)}>{showXAI?'Hide':'Show'}</Btn>
            </div>
            {showXAI && (
              <div style={{ color:S.midText, fontSize:12, lineHeight:1.8, fontFamily:"'IBM Plex Mono',monospace", whiteSpace:'pre-line' }}>
{`Score derived from:
  ${Math.round((result.residual*100*0.5))}% probabilistic residual
  ${Math.round((result.V*100*0.5))}% structural vulnerability
  ${form.clusterExposure>0?`+${Math.round((result.clusterMult-1)*100)}% cluster exposure`:' (no cluster modifier)'}
  ${fp.suppressed?`-${Math.abs(fp.adjustment)} pts (false positive flags):`:' (no FP flags)'}
  ${fp.flags.map(f=>`  • ${f}`).join('\n')||''}

IRI Formula: 100 × [0.5 × ${result.residual.toFixed(2)} + 0.5 × ${result.V.toFixed(2)}]
           = ${result.baseIRI.toFixed(1)} (base)
           × ${(result.clusterMult||1).toFixed(2)} (cluster)
           = ${result.iri.toFixed(1)} (final)`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE MONITOR
// ═══════════════════════════════════════════════════════════════════════════════
function LiveMonitor({ liveOdds, user }) {
  const [sport, setSport] = useState('tennis')
  const [expanded, setExpanded] = useState(null)
  const userSports = user?.sports || Object.keys(SPORTS_CONFIG)
  const matches = (MOCK_MATCHES[sport]||MOCK_MATCHES.tennis)
    .map(m=>{const r=computeIRI({favoriteOdds:m.favOdds,underdogOdds:m.dogOdds||3,rankingGap:m.rankingGap||20,tier:m.tier,sport});const shock=detectShock(m.prevIRI||40,r.iri);return{...m,...r,band:iriBand(r.iri),shock}})
    .sort((a,b)=>b.iri-a.iri)

  return (
    <div>
      <SectionHeader title="📡 Live Monitor" subtitle="Real-time IRI · Multi-sport · Shock detection · Click to expand" actions={liveOdds&&<span style={{ ...badge(S.ok) }}>● Live API</span>}/>
      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {Object.entries(SPORTS_CONFIG).filter(([k])=>userSports.includes(k)).map(([k,v])=>(
          <button key={k} onClick={()=>setSport(k)} style={{ padding:'5px 11px', borderRadius:6, fontSize:11, cursor:'pointer', background:sport===k?S.mid:'transparent', color:sport===k?S.accent:S.dim, border:`1px solid ${sport===k?S.border:'transparent'}` }}>{v.icon} {v.label.split(' ')[0]}</button>
        ))}
      </div>
      {matches.map(m=>(
        <div key={m.id} onClick={()=>setExpanded(x=>x===m.id?null:m.id)} style={{ ...card, marginBottom:8, cursor:'pointer', borderLeft:`3px solid ${m.band.color}`, background:expanded===m.id?S.mid:S.card }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:3, flexWrap:'wrap' }}>
                <span style={{ color:S.text, fontSize:14, fontWeight:700 }}>{m.p1||m.event}{m.p2?` vs ${m.p2}`:''}</span>
                {m.shock.isShock && <ShockBadge delta={Math.round(m.shock.delta)}/>}
              </div>
              <div style={{ color:S.dim, fontSize:11 }}>{m.event} · {m.surface||sport} · {m.volume}</div>
            </div>
            <div style={{ display:'flex', gap:14, alignItems:'center' }}>
              {m.movement && <div style={{ textAlign:'center' }}><div style={{ color:S.dim, fontSize:10 }}>MOVEMENT</div><div style={{ color:m.movement.startsWith('+')&&parseInt(m.movement)>30?S.danger:S.ok, fontSize:12, fontWeight:700 }}>{m.movement}</div></div>}
              <div style={{ textAlign:'center', minWidth:55 }}>
                <div style={{ color:S.dim, fontSize:10 }}>IRI</div>
                <div style={{ color:m.band.color, fontSize:26, fontWeight:900, lineHeight:1 }}>{m.iri.toFixed(0)}</div>
                <span style={{ ...badge(m.band.color), fontSize:9 }}>{m.band.label}</span>
              </div>
            </div>
          </div>
          {expanded===m.id && (
            <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${S.border}`, display:'flex', gap:8 }}>
              <Btn size="sm" color={S.danger}><Gavel size={10}/>Create Case</Btn>
              <Btn size="sm" color='#a855f7' variant="outline">Nexus Graph</Btn>
              <Btn size="sm" color={S.info} variant="outline">Chrono Engine</Btn>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Exports ──────────────────────────────────────────────────────────────────
export { NexusGraph, ChronoEngine, FinintLayer, OverwatchEngine, PredictiveModeling, DeconflictionEngine, IRICalculator, LiveMonitor }
