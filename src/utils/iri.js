// ─────────────────────────────────────────────────────────────────────────────
// IRI v1.5 — Intelligence Engine v2
// Kirby (2026): IRI_i = 100 × [w₁ × |Y_i − P{w,i}| + w₂ × V_i]
// Extensions: Bayesian updating · Shock detection · Cluster exposure · FININT
// ─────────────────────────────────────────────────────────────────────────────

export const VERSION = '1.5.1'

// ── Tier vulnerability scores ─────────────────────────────────────────────────
export const TIER_V = {
  // Tennis
  grand_slam:0.08, masters:0.16, tour_500:0.24, tour_250:0.34, challenger:0.55, itf:0.78,
  // NFL
  franchise_qb:0.05, starter:0.18, backup:0.38, practice_squad:0.62,
  info_precariat:0.78, debt_vector:0.88,
  // CFB
  power4_top:0.08, power4:0.18, group_of_5:0.48, fcs:0.68, nil_zero:0.82,
  // CBB
  power4_high:0.10, mid_major:0.45, low_major:0.65, d1_bottom:0.80,
  // Generic
  top_tier:0.10, mid_tier:0.35, low_tier:0.65,
}

export const TIER_LABELS = {
  grand_slam:'Grand Slam', masters:'Masters / WTA 1000', tour_500:'ATP/WTA 500',
  tour_250:'250 / International', challenger:'Challenger', itf:'ITF / Futures',
  franchise_qb:'Franchise QB / Head Coach', starter:'Starting Skill Position',
  backup:'Backup / Rotational', practice_squad:'Practice Squad',
  info_precariat:'Info Precariat (Staff)', debt_vector:'Debt Vector',
  power4_top:'Power 4 — Top Program', power4:'Power 4 Conference',
  group_of_5:'Group of 5', fcs:'FCS / Lower Subdivision', nil_zero:'No NIL',
  power4_high:'Power 4 — Top 25 KenPom', mid_major:'Mid-Major',
  low_major:'Low Major', d1_bottom:'D1 Bottom Tier',
  top_tier:'Top Tier', mid_tier:'Mid Tier', low_tier:'Low Tier',
}

export const SURFACE_W = { carpet:1.10, clay:1.00, hard:0.95, grass:0.90, indoor:0.97 }

const B = { b0:-1.42, Pw:-3.81, dR100:-0.28, challenger:0.67, itf:0.94 }

export const SPORTS_CONFIG = {
  tennis:   { label:'Tennis (ATP/WTA)',   icon:'🎾', model:'dissertation' },
  nfl:      { label:'NFL',                icon:'🏈', model:'info_asymmetry' },
  cfb:      { label:'College Football',   icon:'🏈', model:'nil_ats' },
  cbb:      { label:'College Basketball', icon:'🏀', model:'kenpom' },
  baseball: { label:'Baseball (MLB)',     icon:'⚾', model:'generic' },
  hockey:   { label:'Hockey (NHL)',       icon:'🏒', model:'generic' },
  golf_pga: { label:'Golf — PGA Tour',    icon:'⛳', model:'generic' },
  golf_liv: { label:'Golf — LIV Tour',    icon:'⛳', model:'generic' },
  soccer_epl:{ label:'Soccer — EPL',      icon:'⚽', model:'generic' },
  soccer_mls:{ label:'Soccer — MLS',      icon:'⚽', model:'generic' },
  wnba:     { label:'WNBA',               icon:'🏀', model:'generic' },
  college_volleyball:{ label:'College Volleyball', icon:'🏐', model:'generic' },
}

// ── Core utilities ────────────────────────────────────────────────────────────
export function impliedProb(odds) {
  return Math.min(Math.max(1 / Math.max(odds, 1.01), 0.01), 0.99)
}

export function getTierV(sport, tier) {
  return TIER_V[tier] ?? (
    sport==='nfl'?0.38:sport==='cfb'?0.48:sport==='cbb'?0.45:
    sport==='baseball'?0.10:sport==='hockey'?0.12:
    sport==='soccer_epl'?0.08:sport==='soccer_mls'?0.38:
    sport==='wnba'?0.58:0.5
  )
}

// ── IRI Engine v2 — Core formula ──────────────────────────────────────────────
export function computeIRI({ favoriteOdds, underdogOdds, rankingGap=0, tier, surface, sport='tennis', w1=0.5, w2=0.5, clusterExposure=0, playerHistory=[] }) {
  const Pw      = impliedProb(favoriteOdds)
  const V_raw   = getTierV(sport, tier)
  const surfMod = (sport==='tennis' ? (SURFACE_W[surface?.toLowerCase()] ?? 1.0) : 1.0)
  const V       = Math.min(1, V_raw * surfMod)
  const residual = Math.abs(0 - Pw)

  // Cluster exposure multiplier (v1.5 new) — up to +20% IRI for cluster members
  const clusterMult = 1 + Math.min(clusterExposure * 0.2, 0.2)

  // IRI = 100 × [w₁ × |Y−Pw| + w₂ × V] — dissertation §4 exact
  const baseIRI = Math.min(100 * (w1 * residual + w2 * V), 100)
  const iri     = Math.min(baseIRI * clusterMult, 100)

  const dR100   = rankingGap / 100
  const tb      = tier==='itf' ? B.itf : tier==='challenger' ? B.challenger : 0
  const logit   = B.b0 + B.Pw*Pw + B.dR100*dR100 + tb
  const upsetProb = 1 / (1 + Math.exp(-logit))

  return { iri, baseIRI, Pw, V, V_raw, residual, upsetProb, oddsRatio:Math.exp(tb), dR100, clusterMult }
}

// ── IRI Shock Detection (v1.5) ────────────────────────────────────────────────
// Detects sudden IRI jumps — "Black Swan micro-event forming"
export function detectShock(previousIRI, currentIRI, windowMinutes=30) {
  const delta      = currentIRI - previousIRI
  const isShock    = delta >= 20
  const isBlackSwan = delta >= 40
  const rate       = delta / Math.max(windowMinutes, 1)
  return {
    isShock, isBlackSwan, delta,
    rate: rate.toFixed(2),
    severity: isBlackSwan ? 'BLACK_SWAN' : isShock ? 'SHOCK' : 'NORMAL',
    label: isBlackSwan ? '🦢 BLACK SWAN EVENT' : isShock ? '⚡ IRI SHOCK' : 'Normal',
    color: isBlackSwan ? '#a855f7' : isShock ? '#ef4444' : '#22c55e',
  }
}

// ── Contextual IRI (v1.5) ─────────────────────────────────────────────────────
// Three layers: match-level, player rolling risk, tournament structural risk
export function computeContextualIRI({ matchIRI, playerHistory=[], tournamentMatches=[] }) {
  const playerRolling = playerHistory.length > 0
    ? playerHistory.reduce((s,v)=>s+v,0)/playerHistory.length : matchIRI
  const tournamentStructural = tournamentMatches.length > 0
    ? tournamentMatches.reduce((s,v)=>s+v,0)/tournamentMatches.length : matchIRI
  const composite = matchIRI*0.5 + playerRolling*0.3 + tournamentStructural*0.2
  return {
    matchLevel: matchIRI,
    playerLevel: parseFloat(playerRolling.toFixed(1)),
    tournamentLevel: parseFloat(tournamentStructural.toFixed(1)),
    compositeIRI: parseFloat(composite.toFixed(1)),
  }
}

// ── False Positive Guardrail (v1.5) ───────────────────────────────────────────
export function checkFalsePositive({ iri, injuryFlag=false, surfaceTransition=false, travelFatigue=false, rankingDrop=false }) {
  const flags = []
  let adjustment = 0
  if (injuryFlag)        { flags.push('Injury reported — odds naturally suppressed'); adjustment -= 15 }
  if (surfaceTransition) { flags.push('Surface transition — historical performance shift'); adjustment -= 8 }
  if (travelFatigue)     { flags.push('Travel fatigue — schedule density elevated'); adjustment -= 6 }
  if (rankingDrop)       { flags.push('Recent ranking drop — legitimate capability change'); adjustment -= 5 }
  const adjustedIRI = Math.max(0, Math.min(100, iri + adjustment))
  return { adjustedIRI, adjustment, flags, suppressed: flags.length > 0 }
}

// ── Bayesian Update (v1.5 enhanced) ──────────────────────────────────────────
export function bayesianUpdate({ prior, likelihood, evidenceWeight=0.65, priorStrength=1.0 }) {
  const adjustedPrior = Math.min(0.95, Math.max(0.05, prior * priorStrength))
  const num       = likelihood * adjustedPrior
  const den       = num + (1 - likelihood) * (1 - adjustedPrior)
  const posterior = den === 0 ? adjustedPrior : num / den
  const blended   = posterior * evidenceWeight + adjustedPrior * (1 - evidenceWeight)
  return {
    posterior: blended,
    rawPosterior: posterior,
    delta: blended - prior,
    divergence: Math.abs(blended - likelihood) * 100,
    significant: Math.abs(blended - likelihood) > 0.10,
  }
}

// ── Louvain Community Detection Simulation (v1.5) ─────────────────────────────
// Simulates graph community detection for corruption cluster identification
export function detectCommunities(nodes, edges) {
  // Simplified modularity-based community assignment
  const communities = {}
  const nodeEdgeCount = {}

  nodes.forEach(n => { communities[n.id] = n.id; nodeEdgeCount[n.id] = 0 })
  edges.forEach(e => {
    nodeEdgeCount[e.from] = (nodeEdgeCount[e.from]||0) + e.w
    nodeEdgeCount[e.to]   = (nodeEdgeCount[e.to]||0)   + e.w
  })

  // Assign communities based on high-weight edge clusters
  const sorted = [...edges].sort((a,b)=>b.w-a.w)
  const clusterMap = {}
  let clusterIdx = 0

  sorted.forEach(e => {
    const cA = clusterMap[e.from], cB = clusterMap[e.to]
    if (!cA && !cB) { const c = `C${clusterIdx++}`; clusterMap[e.from]=c; clusterMap[e.to]=c }
    else if (cA && !cB) clusterMap[e.to] = cA
    else if (!cA && cB) clusterMap[e.from] = cB
  })

  nodes.forEach(n => { if (!clusterMap[n.id]) clusterMap[n.id] = `C${clusterIdx++}` })

  // Compute betweenness centrality (simplified degree centrality)
  const centrality = {}
  nodes.forEach(n => {
    centrality[n.id] = edges.filter(e=>e.from===n.id||e.to===n.id).reduce((s,e)=>s+e.w,0)
  })
  const maxC = Math.max(...Object.values(centrality), 1)
  Object.keys(centrality).forEach(k => centrality[k] = Math.round((centrality[k]/maxC)*100))

  // Label clusters
  const clusterGroups = {}
  Object.entries(clusterMap).forEach(([nodeId, clusterId]) => {
    if (!clusterGroups[clusterId]) clusterGroups[clusterId] = []
    clusterGroups[clusterId].push(nodeId)
  })

  const clusterLabels = {}
  Object.entries(clusterGroups).forEach(([cId, members], idx) => {
    const avgRisk = members.reduce((s,m)=>s+(nodes.find(n=>n.id===m)?.risk||50),0)/members.length
    clusterLabels[cId] = {
      id: cId, members, size: members.length, avgRisk: Math.round(avgRisk),
      label: avgRisk>70 ? `Suspicious Syndicate ${String.fromCharCode(65+idx)}` :
             avgRisk>50 ? `Repeat Exposure Network ${String.fromCharCode(65+idx)}` :
             `Low-Risk Cluster ${String.fromCharCode(65+idx)}`,
      color: avgRisk>70?'#ef4444':avgRisk>50?'#f97316':'#22c55e',
    }
  })

  return { communities:clusterMap, centrality, clusters:clusterLabels }
}

// ── Syndicate Fingerprinting (v1.5 FININT) ────────────────────────────────────
export function fingerprintSyndicate(bets) {
  // Detect repeated timing patterns, same odds exploitation windows
  if (!bets || bets.length < 3) return { detected:false, confidence:0, pattern:null }

  const times     = bets.map(b => new Date(b.timestamp).getMinutes())
  const intervals = times.slice(1).map((t,i) => Math.abs(t - times[i]))
  const avgInt    = intervals.reduce((s,v)=>s+v,0) / Math.max(intervals.length,1)
  const stdDev    = Math.sqrt(intervals.map(v=>Math.pow(v-avgInt,2)).reduce((s,v)=>s+v,0)/intervals.length)
  const regularity = Math.max(0, 1 - stdDev/15) // Low std dev = highly regular = syndicate signal
  const confidence = Math.round(regularity * 100)

  return {
    detected: confidence > 65,
    confidence,
    pattern: confidence > 65 ? `Regular ${Math.round(avgInt)}min bet intervals` : null,
    risk: confidence > 80 ? 'CRITICAL' : confidence > 65 ? 'HIGH' : 'LOW',
    avgInterval: Math.round(avgInt),
    regularity: (regularity*100).toFixed(1),
  }
}

// ── Liquidity Stress Indicator (v1.5) ─────────────────────────────────────────
export function computeLiquidityStress({ normalVolume, currentVolume, bookmakerCount, oddsDispersion }) {
  const volRatio   = Math.min((currentVolume / Math.max(normalVolume,1)), 10)
  const volScore   = Math.min((volRatio-1) * 20, 60)
  const dispScore  = Math.min(oddsDispersion * 2.5, 25)
  const bookScore  = bookmakerCount < 3 ? 15 : bookmakerCount > 8 ? 0 : 5
  const stress     = Math.min(volScore + dispScore + bookScore, 100)
  return {
    stress: Math.round(stress),
    volRatio: volRatio.toFixed(2),
    level: stress>70?'CRITICAL':stress>50?'HIGH':stress>30?'ELEVATED':'NORMAL',
    color: stress>70?'#ef4444':stress>50?'#f97316':stress>30?'#eab308':'#22c55e',
  }
}

// ── Pattern of Life Analyzer (v1.5) ──────────────────────────────────────────
export function analyzePatternOfLife(historicalData=[]) {
  if (historicalData.length < 5) return { baseline:null, anomalies:[], deviation:0 }
  const vals    = historicalData.map(d=>d.value)
  const mean    = vals.reduce((s,v)=>s+v,0)/vals.length
  const std     = Math.sqrt(vals.map(v=>Math.pow(v-mean,2)).reduce((s,v)=>s+v,0)/vals.length)
  const anomalies = historicalData.filter(d => Math.abs(d.value-mean) > 2*std)
  const latestDeviation = historicalData.length > 0
    ? Math.abs(historicalData[historicalData.length-1].value - mean) / Math.max(std,1) : 0
  return {
    baseline: { mean:parseFloat(mean.toFixed(1)), std:parseFloat(std.toFixed(1)) },
    anomalies, deviation: parseFloat(latestDeviation.toFixed(2)),
    flagged: latestDeviation > 2,
  }
}

// ── Predictive Risk Score (v1.5) ──────────────────────────────────────────────
export function predictFutureRisk({ earningsInstability=0, travelLoad=0, clusterExposure=0, recentIRItrend=[] }) {
  const earningsRisk   = Math.min(earningsInstability * 30, 40)
  const travelRisk     = Math.min(travelLoad * 20, 25)
  const clusterRisk    = Math.min(clusterExposure * 35, 35)
  const trendRisk      = recentIRItrend.length > 1
    ? Math.min(Math.max(recentIRItrend[recentIRItrend.length-1]-recentIRItrend[0], 0), 20) : 0
  const score = Math.min(earningsRisk + travelRisk + clusterRisk + trendRisk, 100)
  return {
    score: Math.round(score), earningsRisk, travelRisk, clusterRisk, trendRisk,
    level: score>70?'HIGH':score>40?'ELEVATED':'LOW',
    color: score>70?'#ef4444':score>40?'#f97316':'#22c55e',
    recommendation: score>70?'Immediate monitoring':score>40?'Increased surveillance':'Standard monitoring',
  }
}

// ── Deconfliction blind hash (v1.5) ──────────────────────────────────────────
export function blindHash(value) {
  // Simple deterministic hash for deconfliction (in production: SHA-256)
  let hash = 0
  for (let i=0; i<value.length; i++) { hash = ((hash<<5)-hash) + value.charCodeAt(i); hash|=0 }
  return `BH-${Math.abs(hash).toString(16).padStart(8,'0').toUpperCase()}`
}

// ── AI Microbet trend detector ────────────────────────────────────────────────
export function detectMicrobetTrend(volumeSeries=[]) {
  if (volumeSeries.length < 3) return { trending:false, direction:'neutral', acceleration:0, urgency:'NORMAL' }
  const deltas    = volumeSeries.slice(1).map((v,i) => v-volumeSeries[i])
  const avgDelta  = deltas.reduce((s,d)=>s+d,0)/deltas.length
  const accel     = deltas.length>1 ? deltas[deltas.length-1]-deltas[0] : 0
  const trending  = Math.abs(avgDelta) > volumeSeries[0]*0.15
  return {
    trending, direction:avgDelta>0?'rising':'falling', acceleration:accel,
    urgency: accel>volumeSeries[0]*0.5?'CRITICAL':trending?'ELEVATED':'NORMAL',
  }
}

// ── Benford's Law ─────────────────────────────────────────────────────────────
export function benfordExpected() {
  return [1,2,3,4,5,6,7,8,9].map(d=>({ digit:d, expected:Math.log10(1+1/d)*100 }))
}

// ── IRI risk band ─────────────────────────────────────────────────────────────
export function iriBand(s) {
  if (s>=70) return { label:'CRITICAL', color:'#ef4444', bg:'#7f1d1d' }
  if (s>=50) return { label:'HIGH',     color:'#f97316', bg:'#7c2d12' }
  if (s>=30) return { label:'ELEVATED', color:'#eab308', bg:'#713f12' }
  return            { label:'LOW',      color:'#22c55e', bg:'#14532d' }
}

// ── Robustness check ─────────────────────────────────────────────────────────
export function robustnessCheck(params) {
  return [[0.5,0.5],[0.7,0.3],[0.3,0.7]].map(([w1,w2])=>({
    label:`${w1}/${w2}`, ...computeIRI({...params,w1,w2}),
  }))
}

// ── API Credibility Layer ─────────────────────────────────────────────────────
export function computeCredibility({ successCalls, totalCalls, stdDevOdds, confirmedAlerts, totalAlerts, avgLatencyMs }) {
  const sr = totalCalls>0?(successCalls/totalCalls)*100:50
  const cs = Math.max(0,Math.min(100,100-(stdDevOdds||0)*100))
  const vr = totalAlerts>0?(confirmedAlerts/totalAlerts)*100:50
  const lt = Math.max(0,Math.min(100,100-(avgLatencyMs||0)))
  return Math.round(sr*0.35+cs*0.25+vr*0.25+lt*0.15)
}

// ── Rosetta Engine — data normalization ──────────────────────────────────────
export function rosettaNormalize(raw, source) {
  const normalizeOdds = (o, fmt) => fmt==='american'
    ? (o>0?(o/100)+1:(100/Math.abs(o))+1) : o
  const normalizeName = s => (s||'').trim().toLowerCase().replace(/\s+/g,' ')
  const normalizeTier = t => {
    const m = (t||'').toLowerCase()
    if (m.includes('grand slam')||m.includes('gs')) return 'grand_slam'
    if (m.includes('masters')||m.includes('wta 1000')) return 'masters'
    if (m.includes('500')) return 'tour_500'
    if (m.includes('250')) return 'tour_250'
    if (m.includes('challenger')) return 'challenger'
    return 'itf'
  }
  return {
    matchId:  raw.id || raw.match_id || `${source}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    playerA:  normalizeName(raw.home_player || raw.player_1 || raw.playerA),
    playerB:  normalizeName(raw.away_player || raw.player_2 || raw.playerB),
    favOdds:  normalizeOdds(raw.best_odds_home || raw.favOdds || 1.5, source==='draftkings'?'american':'decimal'),
    dogOdds:  normalizeOdds(raw.best_odds_away || raw.dogOdds || 3.0, source==='draftkings'?'american':'decimal'),
    tier:     normalizeTier(raw.tournament_category || raw.tier || 'itf'),
    source,   normalized: true,
  }
}
