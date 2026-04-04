// IRI v1.5.1 data.js — Intelligence reference data only. No sample cases.

export const ROLE_TABS = {
  god:               ['triage','godmode','nexus','chrono','finint','overwatch','predictive','deconflict','cases','informants','trackers','dossiers','messaging','timekeeping','cease','monitor','iri','analytics','alerts','security','help'],
  main_account:      ['triage','nexus','chrono','finint','overwatch','predictive','deconflict','cases','informants','trackers','dossiers','messaging','timekeeping','cease','monitor','iri','analytics','alerts','security','help'],
  supervisor:        ['triage','nexus','chrono','finint','overwatch','cases','informants','trackers','dossiers','messaging','timekeeping','cease','monitor','iri','analytics','alerts','help'],
  special_agent:     ['triage','nexus','overwatch','cases','informants','trackers','messaging','monitor','iri','alerts','help'],
  regulator:         ['triage','nexus','overwatch','deconflict','cases','dossiers','monitor','analytics','alerts','help'],
  integrity_officer: ['triage','nexus','finint','overwatch','cases','informants','trackers','dossiers','messaging','monitor','iri','alerts','help'],
  governance:        ['triage','overwatch','cases','dossiers','monitor','analytics','alerts','help'],
  sportsbook:        ['triage','overwatch','finint','monitor','alerts','help'],
}

// ── Sports config ─────────────────────────────────────────────────────────────
export const SPORTS_CONFIG = {
  tennis:   { label:'Tennis (ATP/WTA)',   icon:'🎾' }, nfl:{ label:'NFL', icon:'🏈' },
  cfb:      { label:'College Football',   icon:'🏈' }, cbb:{ label:'College Basketball',icon:'🏀' },
  baseball: { label:'Baseball (MLB)',     icon:'⚾' }, hockey:{ label:'Hockey (NHL)',icon:'🏒' },
  golf_pga: { label:'Golf — PGA Tour',   icon:'⛳' }, golf_liv:{ label:'Golf — LIV',icon:'⛳' },
  soccer_epl:{ label:'Soccer — EPL',     icon:'⚽' }, soccer_mls:{ label:'Soccer — MLS',icon:'⚽' },
  wnba:     { label:'WNBA',              icon:'🏀' }, college_volleyball:{ label:'College Volleyball',icon:'🏐' },
}

// ── Demo triage items (intelligence data, not cases) ──────────────────────────
export const TRIAGE_ITEMS = [
  { id:'TR-001', severity:'Critical', type:'Betting Spike',     sport:'tennis', entity:'Market Alert — ITF Tier', detail:'IRI engine detected 210% above-baseline volume. Three coordinated EU bookmakers. Benford χ²=28.4.', ts:'03:42 AM', iriPrev:22, iriCurr:94, action:'Open Case' },
  { id:'TR-002', severity:'High',     type:'Cluster Threshold', sport:'nfl',    entity:'NFL Prop Alert',          detail:'Offshore prop volume +3740% above baseline. Injury latency 90 minutes. Shadow market divergence 18pt.', ts:'04:15 AM', iriPrev:31, iriCurr:88, action:'Review Graph' },
  { id:'TR-003', severity:'High',     type:'Pre-Match Alert',   sport:'tennis', entity:'Challenger Level Match',  detail:'22pt bookmaker dispersion detected. Cluster proximity score elevated.', ts:'05:30 AM', iriPrev:44, iriCurr:72, action:'Flag' },
]

// ── Network graph data ────────────────────────────────────────────────────────
export const NETWORK_NODES = [
  { id:'p1',  label:'Player A',      type:'player',     risk:88, x:42, y:55, sport:'tennis', betweenness:85, flagged:true  },
  { id:'p2',  label:'Player B',      type:'player',     risk:74, x:28, y:68, sport:'tennis', betweenness:60, flagged:true  },
  { id:'p3',  label:'Player C',      type:'player',     risk:55, x:55, y:38, sport:'tennis', betweenness:40, flagged:false },
  { id:'o1',  label:'Official D',    type:'official',   risk:82, x:48, y:48, sport:'tennis', betweenness:90, flagged:true  },
  { id:'t1',  label:'ITF M25 Event', type:'tournament', risk:76, x:58, y:18, sport:'tennis', betweenness:65, flagged:true  },
  { id:'s1',  label:'Bookmaker X',   type:'sportsbook', risk:86, x:82, y:38, sport:'all',    betweenness:78, flagged:true  },
  { id:'bc1', label:'Bet Cluster A', type:'bettor',     risk:88, x:88, y:62, sport:'all',    betweenness:68, flagged:true  },
]
export const NETWORK_EDGES = [
  { from:'p1', to:'t1',  type:'played_in',    w:9 },
  { from:'p2', to:'t1',  type:'played_in',    w:6 },
  { from:'p3', to:'t1',  type:'played_in',    w:4 },
  { from:'o1', to:'t1',  type:'officiated_at',w:11 },
  { from:'s1', to:'t1',  type:'markets',      w:18 },
  { from:'s1', to:'bc1', type:'linked',       w:12 },
  { from:'p1', to:'o1',  type:'co_match',     w:9  },
  { from:'p1', to:'bc1', type:'linked',       w:7  },
]

// ── FININT data ───────────────────────────────────────────────────────────────
export const FININT_DATA = {
  syndicates:[
    { id:'SYN-001', label:'Syndicate Alpha', members:12, markets:['ITF','Challenger'], avgBetInterval:17, pattern:'18min±2 windows', detectedMatches:31, totalVolume:'$4.2M', status:'Active',  confidence:91, color:'#ef4444' },
    { id:'SYN-002', label:'Syndicate Beta',  members:6,  markets:['NFL Props'],       avgBetInterval:34, pattern:'34min±4 windows', detectedMatches:14, totalVolume:'$1.8M', status:'Active',  confidence:78, color:'#f97316' },
  ],
  flowData:[
    {ts:'00:00',legitimate:120000,suspicious:8000},{ts:'03:00',legitimate:95000,suspicious:12000},
    {ts:'06:00',legitimate:180000,suspicious:28000},{ts:'09:00',legitimate:240000,suspicious:95000},
    {ts:'12:00',legitimate:310000,suspicious:185000},{ts:'15:00',legitimate:280000,suspicious:142000},
    {ts:'18:00',legitimate:195000,suspicious:68000},{ts:'21:00',legitimate:140000,suspicious:22000},
  ],
  liquidityMarkets:[
    { market:'ITF Alert Market A', normalVol:8000,  currentVol:285000, books:3, dispersion:18, stress:94 },
    { market:'NFL Prop Alert',     normalVol:5000,  currentVol:187000, books:5, dispersion:14, stress:88 },
    { market:'Major Tournament',   normalVol:800000,currentVol:920000, books:14,dispersion:2,  stress:8  },
  ],
}

// ── Overwatch demo alerts ─────────────────────────────────────────────────────
export const OVERWATCH_ALERTS = [
  { id:'OW-001', level:'Black',  sport:'tennis', match:'Market Alert A', event:'ITF Level', hoursToStart:2.5, iriScore:94, trigger:'Syndicate Alpha + IRI Shock + Cluster threshold crossed', preMatch:true },
  { id:'OW-002', level:'Red',    sport:'nfl',    match:'NFL Prop Alert', event:'NFL',       hoursToStart:4.0, iriScore:88, trigger:'Injury latency 90min + offshore divergence 18pt',         preMatch:true },
  { id:'OW-003', level:'Yellow', sport:'tennis', match:'Market Alert B', event:'Challenger',hoursToStart:8.0, iriScore:63, trigger:'Bookmaker dispersion 22pt + cluster proximity',            preMatch:false },
]

// ── Predictive subjects ────────────────────────────────────────────────────────
export const PREDICTIVE_SUBJECTS = [
  { name:'Risk Profile A', sport:'tennis', tier:'itf',           earningsInstability:0.85, travelLoad:0.90, clusterExposure:0.95, recentIRI:[55,62,70,78,81,94], ranking:312 },
  { name:'Risk Profile B', sport:'tennis', tier:'challenger',    earningsInstability:0.60, travelLoad:0.70, clusterExposure:0.80, recentIRI:[40,45,52,61,65,70], ranking:188 },
  { name:'Risk Profile C', sport:'nfl',    tier:'practice_squad',earningsInstability:0.70, travelLoad:0.40, clusterExposure:0.85, recentIRI:[30,40,55,68,72,88], ranking:0   },
  { name:'Risk Profile D', sport:'cfb',    tier:'nil_zero',      earningsInstability:0.90, travelLoad:0.30, clusterExposure:0.60, recentIRI:[20,28,35,45,55,72], ranking:0   },
]

// ── Deconfliction registry ────────────────────────────────────────────────────
export const DECONFLICT_REGISTRY = [
  { agency:'ITIA',           entity:'Entity A (hashed)', hash:'BH-A2F4C8E1', caseType:'Match Fixing',      status:'Active',  matched:true,  matchedAgency:'Europol'    },
  { agency:'Nevada Gaming',  entity:'Entity B (hashed)', hash:'BH-F3B2E7A5', caseType:'Illegal Bookmaking',status:'Active',  matched:true,  matchedAgency:'FBI'        },
  { agency:'UK Gambling',    entity:'Entity C (hashed)', hash:'BH-A2F4C8E1', caseType:'Money Laundering',  status:'Pending', matched:true,  matchedAgency:'ITIA'       },
]

// ── API registry ──────────────────────────────────────────────────────────────
export const INITIAL_APIS = [
  { id:'api-001', name:'Sportradar Tennis',  key:'g5352b…', status:'live',  enabled:true,  successCalls:4821, totalCalls:4900, stdDevOdds:0.08, confirmedAlerts:31, totalAlerts:35, avgLatencyMs:12, endpoint:'/sportradar', sports:['tennis'], credibility:88 },
  { id:'api-002', name:'The Odds API',       key:'178ebf…', status:'live',  enabled:true,  successCalls:2931, totalCalls:3000, stdDevOdds:0.12, confirmedAlerts:18, totalAlerts:22, avgLatencyMs:18, endpoint:'/odds',       sports:['all'],   credibility:81 },
  { id:'api-003', name:'Sportradar NFL',     key:'g5352b…', status:'live',  enabled:true,  successCalls:1820, totalCalls:1900, stdDevOdds:0.11, confirmedAlerts:14, totalAlerts:16, avgLatencyMs:14, endpoint:'/nfl',        sports:['nfl'],   credibility:84 },
  { id:'api-004', name:'IBIA Alert Feed',    key:'(auth)', status:'live',  enabled:true,  successCalls:290,  totalCalls:300,  stdDevOdds:0.06, confirmedAlerts:22, totalAlerts:24, avgLatencyMs:22, endpoint:'(ext)',       sports:['all'],   credibility:89 },
  { id:'api-005', name:'Betfair Exchange',   key:'(free)', status:'live',  enabled:true,  successCalls:610,  totalCalls:700,  stdDevOdds:0.21, confirmedAlerts:9,  totalAlerts:14, avgLatencyMs:35, endpoint:'(ext)',       sports:['all'],   credibility:71 },
  { id:'api-006', name:'NFL Injury Reports', key:'(free)', status:'live',  enabled:true,  successCalls:480,  totalCalls:500,  stdDevOdds:0.00, confirmedAlerts:6,  totalAlerts:7,  avgLatencyMs:18, endpoint:'(ext)',       sports:['nfl'],   credibility:79 },
  { id:'api-007', name:'Rosetta Engine',     key:'(int)',  status:'live',  enabled:true,  successCalls:8200, totalCalls:8300, stdDevOdds:0.02, confirmedAlerts:48, totalAlerts:50, avgLatencyMs:8,  endpoint:'/rosetta',    sports:['all'],   credibility:96 },
  { id:'api-008', name:'DraftKings Props',   key:'(env)',  status:'error', enabled:false, successCalls:120,  totalCalls:400,  stdDevOdds:0.31, confirmedAlerts:2,  totalAlerts:18, avgLatencyMs:90, endpoint:'(ext)',       sports:['nfl'],   credibility:28 },
]

// ── Mock matches (for Live Monitor demo) ──────────────────────────────────────
export const MOCK_MATCHES = {
  tennis:[
    { id:'T-001', p1:'Player A', p2:'Player B', event:'ITF M25 Alert',      tier:'itf',        favOdds:1.19, dogOdds:4.95, rankingGap:11, surface:'Clay', volume:'$1.2M', movement:'+210%', prevIRI:22, sport:'tennis' },
    { id:'T-002', p1:'Player C', p2:'Player D', event:'ATP Challenger',     tier:'challenger', favOdds:1.44, dogOdds:2.88, rankingGap:39, surface:'Hard', volume:'$420K', movement:'+38%',  prevIRI:45, sport:'tennis' },
    { id:'T-003', p1:'Player E', p2:'Player F', event:'WTA 250',           tier:'tour_250',   favOdds:1.31, dogOdds:3.35, rankingGap:21, surface:'Clay', volume:'$185K', movement:'Stable',prevIRI:28, sport:'tennis' },
  ],
  nfl:[
    { id:'N-001', p1:'Team A', p2:'Team B', event:'NFL Week Alert', tier:'starter',        favOdds:1.28, dogOdds:4.00, volume:'$2.1M', movement:'+12%',  prevIRI:28, sport:'nfl' },
    { id:'N-002', p1:'Team C', p2:'Team D', event:'NFL Prop Alert', tier:'practice_squad', favOdds:1.55, dogOdds:2.50, volume:'$180K', movement:'+380%', prevIRI:31, sport:'nfl' },
  ],
}

// ── Chrono match ──────────────────────────────────────────────────────────────
export const CHRONO_MATCH = {
  id:'DEMO-001', p1:'Player A', p2:'Player B', event:'ITF Demo Match', date:'2026-04-03',
  timeline:[
    {ts:'06:00',event:'Market Opens',           iriScore:22, odds:1.18, volume:8000,   type:'market',  icon:'📈'},
    {ts:'09:00',event:'Offshore line moves',    iriScore:45, odds:1.21, volume:61000,  type:'betting', icon:'💰'},
    {ts:'11:00',event:'Benford deviation',      iriScore:71, odds:1.20, volume:142000, type:'forensic',icon:'🔬'},
    {ts:'11:30',event:'Cluster link detected',  iriScore:82, odds:1.19, volume:198000, type:'network', icon:'🕸️'},
    {ts:'12:00',event:'IRI SHOCK — Alert',      iriScore:94, odds:1.19, volume:285000, type:'shock',   icon:'🚨'},
    {ts:'13:00',event:'Match Start',            iriScore:94, odds:1.19, volume:310000, type:'match',   icon:'🎾'},
    {ts:'14:22',event:'Upset in progress',      iriScore:96, odds:1.45, volume:380000, type:'match',   icon:'🎾'},
    {ts:'15:10',event:'Result confirmed',       iriScore:98, odds:null,  volume:412000, type:'result',  icon:'🏁'},
  ],
}

export const TREND_DATA = [
  {m:'Oct 25',iri:67,alerts:39,cases:8},{m:'Nov 25',iri:71,alerts:48,cases:11},
  {m:'Dec 25',iri:65,alerts:39,cases:9},{m:'Jan 26',iri:74,alerts:53,cases:14},
  {m:'Feb 26',iri:79,alerts:63,cases:18},{m:'Mar 26',iri:83,alerts:71,cases:22},
]

export const OMNIBAR_EXAMPLES = [
  'Show all high-IRI ITF matches last 30 days',
  'Find cluster members linked to Syndicate Alpha',
  'Pre-match alerts firing in next 6 hours',
  'Players with IRI > 70 and earnings instability > 0.8',
  'Predictive: who is at highest risk next 30 days?',
  'Show FININT flow anomalies above $100K',
  'Deconfliction: search all agencies for entity',
]
