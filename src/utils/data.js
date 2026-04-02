// ─── User roles ───────────────────────────────────────────────────────────────
export const USER_ROLES = {
  special_agent:    { label: 'Special Agent',     icon: '🕵️', color: '#ef4444', tabs: ['monitor','iri','bayesian','benford','line_movement','cases','dossiers','network','microbets','coverage','workgroup','alerts','api','analytics','security'] },
  regulator:        { label: 'Regulator',         icon: '⚖️', color: '#f97316', tabs: ['monitor','cases','api','coverage','benford','line_movement','analytics','workgroup','alerts','security'] },
  governance:       { label: 'Sports Governance', icon: '🏛️', color: '#eab308', tabs: ['monitor','cases','coverage','analytics','workgroup','alerts','help'] },
  integrity_officer:{ label: 'Integrity Officer', icon: '🛡️', color: '#84cc16', tabs: ['iri','bayesian','monitor','cases','dossiers','network','benford','line_movement','surface','microbets','workgroup','alerts','api'] },
  player:           { label: 'Tennis Player',     icon: '🎾', color: '#22c55e', tabs: ['iri','monitor','alerts','help'] },
  gambler:          { label: 'Gambler',           icon: '🎲', color: '#06b6d4', tabs: ['iri','monitor','parlay','line_movement','alerts','help'] },
  sportsbook:       { label: 'Sportsbook',        icon: '📊', color: '#8b5cf6', tabs: ['monitor','sportsbook','line_movement','microbets','api','alerts','workgroup','security'] },
  journalist:       { label: 'Journalist',        icon: '📰', color: '#ec4899', tabs: ['monitor','analytics','dossiers','benford','coverage','help'] },
}

// ─── Matches ──────────────────────────────────────────────────────────────────
export const MOCK_MATCHES = [
  { id:'M-001', p1:'R. Duran',  p2:'T. Ikeda',    tournament:'ITF M25 Antalya',     tier:'itf',        favOdds:1.19, dogOdds:4.95, rankingGap:11,  surface:'Clay',   date:'2026-03-31', volume:'$1.2M',  movement:'+210%' },
  { id:'M-002', p1:'J. Novak',  p2:'A. Vale',     tournament:'ATP Challenger Tunis', tier:'challenger', favOdds:1.44, dogOdds:2.88, rankingGap:39,  surface:'Hard',   date:'2026-03-31', volume:'$420K',  movement:'+38%'  },
  { id:'M-003', p1:'L. Hart',   p2:'M. Sato',     tournament:'WTA 250 Bogotá',       tier:'tour_250',   favOdds:1.31, dogOdds:3.35, rankingGap:21,  surface:'Clay',   date:'2026-03-31', volume:'$185K',  movement:'Stable'},
  { id:'M-004', p1:'S. Vega',   p2:'K. Rousseau', tournament:'Roland Garros',        tier:'grand_slam', favOdds:1.62, dogOdds:2.30, rankingGap:58,  surface:'Clay',   date:'2026-03-31', volume:'$8.4M',  movement:'+2%'   },
  { id:'M-005', p1:'A. Petrov', p2:'G. Müller',   tournament:'ATP 500 Vienna',       tier:'tour_500',   favOdds:1.55, dogOdds:2.55, rankingGap:44,  surface:'Indoor', date:'2026-03-31', volume:'$620K',  movement:'+5%'   },
  { id:'M-006', p1:'Y. Tanaka', p2:'B. Okafor',   tournament:'ITF M15 Cairo',        tier:'itf',        favOdds:1.22, dogOdds:4.20, rankingGap:8,   surface:'Clay',   date:'2026-03-30', volume:'$890K',  movement:'+310%' },
  { id:'M-007', p1:'C. Ferrer', p2:'D. Blanco',   tournament:'ATP Challenger Sofia', tier:'challenger', favOdds:1.38, dogOdds:3.05, rankingGap:28,  surface:'Hard',   date:'2026-03-30', volume:'$340K',  movement:'+42%'  },
]

// ─── APIs ─────────────────────────────────────────────────────────────────────
export const MOCK_APIS = [
  { name:'Sportradar Tennis', key:'g5352b…', status:'live',  successCalls:4821, totalCalls:4900, stdDevOdds:0.08, confirmedAlerts:31, totalAlerts:35, avgLatencyMs:12, endpoint:'/sportradar', lastPing:'2s ago'  },
  { name:'The Odds API',      key:'178ebf…', status:'live',  successCalls:2931, totalCalls:3000, stdDevOdds:0.12, confirmedAlerts:18, totalAlerts:22, avgLatencyMs:18, endpoint:'/odds',       lastPing:'5s ago'  },
  { name:'RapidAPI Tennis',   key:'d7f079…', status:'warn',  successCalls:1450, totalCalls:1500, stdDevOdds:0.15, confirmedAlerts:12, totalAlerts:15, avgLatencyMs:24, endpoint:'(external)',  lastPing:'1m ago'  },
  { name:'API Tennis',        key:'10294f…', status:'live',  successCalls:980,  totalCalls:1000, stdDevOdds:0.09, confirmedAlerts:8,  totalAlerts:10, avgLatencyMs:16, endpoint:'(external)',  lastPing:'8s ago'  },
  { name:'DraftKings',        key:'(env)',   status:'error', successCalls:120,  totalCalls:400,  stdDevOdds:0.31, confirmedAlerts:2,  totalAlerts:18, avgLatencyMs:90, endpoint:'(external)',  lastPing:'4m ago'  },
  { name:'Kalshi Pred Mkt',   key:'(free)', status:'live',  successCalls:490,  totalCalls:500,  stdDevOdds:0.10, confirmedAlerts:5,  totalAlerts:6,  avgLatencyMs:20, endpoint:'(external)',  lastPing:'3s ago'  },
  { name:'Betfair Exchange',  key:'(free)', status:'warn',  successCalls:610,  totalCalls:700,  stdDevOdds:0.21, confirmedAlerts:9,  totalAlerts:14, avgLatencyMs:35, endpoint:'(external)',  lastPing:'1m ago'  },
  { name:'InjurySpy',         key:'(free)', status:'warn',  successCalls:200,  totalCalls:350,  stdDevOdds:0.00, confirmedAlerts:3,  totalAlerts:5,  avgLatencyMs:55, endpoint:'(external)',  lastPing:'8m ago'  },
]

// ─── Cases ────────────────────────────────────────────────────────────────────
export const MOCK_CASES = [
  { id:'CASE-24017', title:'Cluster volatility ITF M15 Monastir',           severity:'Critical', status:'Active',     stage:'Evidence Review',  assignee:'A. Morgan', iri:88, confidence:92, alerts:14, created:'2026-03-24', due:'2026-04-03', jurisdiction:'International / Tunisia', entities:['4 players','2 officials','3 bookmakers'] },
  { id:'CASE-24011', title:'Suspicious officiating Challenger clay events', severity:'High',     status:'Open',       stage:'Triage',           assignee:'D. Kim',    iri:76, confidence:81, alerts:9,  created:'2026-03-19', due:'2026-04-06', jurisdiction:'Europe',                  entities:['2 officials','6 matches','2 tournaments'] },
  { id:'CASE-23998', title:'Emerging player-bookie micro-cluster',          severity:'Medium',   status:'Monitoring', stage:'Network Analysis', assignee:'S. Patel',  iri:61, confidence:67, alerts:5,  created:'2026-03-15', due:'2026-04-12', jurisdiction:'South America',            entities:['3 players','2 accounts','1 coach'] },
  { id:'CASE-23881', title:'Line movement anomaly ITF Cairo W15',           severity:'High',     status:'Open',       stage:'Initial Alert',    assignee:'T. Walsh',  iri:82, confidence:88, alerts:12, created:'2026-03-10', due:'2026-04-01', jurisdiction:'Middle East / Africa',    entities:['2 players','1 official','4 bookmakers'] },
]

// ─── Dossiers ─────────────────────────────────────────────────────────────────
export const MOCK_DOSSIERS = [
  { id:'D-001', type:'Player',     name:'R. Duran',        avgIri:81, flagged:7, total:22, tour:'ATP', tier:'ITF/Challenger', surface:'Clay',  nationality:'ARG', history:[55,62,70,78,81,79,85] },
  { id:'D-002', type:'Player',     name:'J. Novak',        avgIri:68, flagged:5, total:18, tour:'ATP', tier:'Challenger',     surface:'Hard',  nationality:'CZE', history:[40,45,52,61,65,70,68] },
  { id:'D-003', type:'Official',   name:'Umpire A. Silva', avgIri:88, flagged:9, total:14, tour:'Both',tier:'Mixed',          surface:'Mixed', nationality:'BRA', history:[60,70,75,82,88,85,88] },
  { id:'D-004', type:'Tournament', name:'ITF M25 Antalya', avgIri:76, flagged:18,total:48, tour:'ATP', tier:'ITF',            surface:'Clay',  nationality:'TUR', history:[50,55,62,70,74,73,76] },
  { id:'D-005', type:'Coach',      name:'B. Marconi',      avgIri:61, flagged:3, total:12, tour:'ATP', tier:'ITF/Challenger', surface:'Clay',  nationality:'ITA', history:[30,35,40,55,58,60,61] },
  { id:'D-006', type:'Sportsbook', name:'BetOnline',       avgIri:54, flagged:11,total:80, tour:'Both',tier:'Multi',          surface:'N/A',   nationality:'CUR', history:[40,42,48,50,52,53,54] },
]

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const INITIAL_ALERTS = [
  { id:'ALT-001', matchId:'M-001', type:'Betting Spike',        severity:'Critical', message:'210% above-baseline volume on ITF M25 Antalya — R. Duran vs T. Ikeda. IRI: 94.', ts:'2026-03-31 14:22', read:false },
  { id:'ALT-002', matchId:'M-006', type:'Line Movement',        severity:'Critical', message:'310% abnormal pre-match movement — ITF M15 Cairo. Benford deviation elevated.', ts:'2026-03-31 13:55', read:false },
  { id:'ALT-003', matchId:'M-002', type:'Bookmaker Dispersion', severity:'High',     message:'22pt dispersion across EU markets — ATP Challenger Tunis.', ts:'2026-03-31 12:10', read:false },
  { id:'ALT-004', matchId:'M-007', type:'IRI Threshold',        severity:'Elevated', message:'IRI crossed 60 threshold — Challenger Sofia.', ts:'2026-03-30 17:44', read:true  },
  { id:'ALT-005', matchId:'M-003', type:'API Data Gap',         severity:'Info',     message:'DraftKings prop data unavailable for WTA 250 Bogotá. Manual check advised.', ts:'2026-03-30 10:20', read:true  },
]

// ─── Workgroup posts ──────────────────────────────────────────────────────────
export const INITIAL_POSTS = [
  { id:'WG-001', user:'A. Morgan', role:'Special Agent',    match:'M-001', note:'Coordinated movement across 3 EU-licensed books. Cross-reference CASE-24017.', ts:'2026-03-31 14:30', upvotes:3 },
  { id:'WG-002', user:'D. Kim',    role:'Regulator',        match:'M-006', note:'Cairo surface/round pattern matches 2024 precariat cluster.', ts:'2026-03-31 13:58', upvotes:2 },
  { id:'WG-003', user:'S. Patel',  role:'Integrity Officer',match:'M-002', note:'Novak/Vale association density rising — third time flagged in 60 days.', ts:'2026-03-31 11:20', upvotes:4 },
]

// ─── Chart data ───────────────────────────────────────────────────────────────
export const TREND_DATA = [
  {m:'Oct 25',iri:67,alerts:39},{m:'Nov 25',iri:71,alerts:48},{m:'Dec 25',iri:65,alerts:39},
  {m:'Jan 26',iri:74,alerts:53},{m:'Feb 26',iri:79,alerts:63},{m:'Mar 26',iri:83,alerts:71},
]

export const TIER_DIST = [
  { tier:'Grand Slam', upset:29.8, iriAvg:31, alerts:6,  color:'#22c55e' },
  { tier:'Masters',    upset:31.4, iriAvg:38, alerts:9,  color:'#84cc16' },
  { tier:'500 Level',  upset:33.1, iriAvg:45, alerts:14, color:'#eab308' },
  { tier:'250/Intl',   upset:36.8, iriAvg:54, alerts:22, color:'#f97316' },
  { tier:'Challenger', upset:38.2, iriAvg:66, alerts:47, color:'#ef4444' },
  { tier:'ITF/Futures',upset:41.5, iriAvg:79, alerts:94, color:'#dc2626' },
]

export const SURFACE_DATA = [
  { surface:'Clay',   upset:36.1, iriAvg:62, benford:8.4  },
  { surface:'Hard',   upset:33.2, iriAvg:55, benford:6.1  },
  { surface:'Grass',  upset:30.8, iriAvg:48, benford:4.8  },
  { surface:'Carpet', upset:37.6, iriAvg:68, benford:11.2 },
  { surface:'Indoor', upset:34.4, iriAvg:58, benford:7.3  },
]

export const COVERAGE_GAPS = [
  { region:'North Africa / MENA', tournaments:12, oversight:'Low',     iriAvg:78, risk:'Critical' },
  { region:'Eastern Europe',      tournaments:28, oversight:'Medium',  iriAvg:61, risk:'High'     },
  { region:'South America',       tournaments:31, oversight:'Low',     iriAvg:69, risk:'High'     },
  { region:'Southeast Asia',      tournaments:19, oversight:'Low',     iriAvg:74, risk:'Critical' },
  { region:'West Africa',         tournaments:8,  oversight:'Minimal', iriAvg:82, risk:'Critical' },
  { region:'Western Europe',      tournaments:89, oversight:'High',    iriAvg:38, risk:'Low'      },
  { region:'North America',       tournaments:44, oversight:'High',    iriAvg:35, risk:'Low'      },
  { region:'Oceania',             tournaments:16, oversight:'Medium',  iriAvg:44, risk:'Elevated' },
]

export const MICROBET_MARKETS = [
  { market:'Medical Timeout Prop',    vuln:'Critical', inPlay:true,  window:'Any moment',   detect:'Very Hard', iriMod:30 },
  { market:'Double Fault Y/N',        vuln:'Critical', inPlay:true,  window:'Single serve', detect:'Very Hard', iriMod:28 },
  { market:'Next Point Winner',       vuln:'Critical', inPlay:true,  window:'Seconds',      detect:'Very Hard', iriMod:25 },
  { market:'Will Game Go to Deuce?',  vuln:'Critical', inPlay:true,  window:'<2 min',       detect:'Hard',      iriMod:22 },
  { market:'Next Game Winner',        vuln:'Critical', inPlay:true,  window:'<3 min',       detect:'Hard',      iriMod:20 },
  { market:'Tiebreak Y/N',            vuln:'High',     inPlay:true,  window:'Near 6-6',     detect:'Hard',      iriMod:18 },
  { market:'Exact Game Score',        vuln:'High',     inPlay:true,  window:'<5 min',       detect:'Medium',    iriMod:15 },
  { market:'Set Winner',              vuln:'High',     inPlay:false, window:'Pre-set',      detect:'Medium',    iriMod:12 },
  { market:'Total Games O/U',         vuln:'High',     inPlay:false, window:'Pre-match',    detect:'Medium',    iriMod:10 },
  { market:'First Set Result',        vuln:'Elevated', inPlay:false, window:'Pre-match',    detect:'Moderate',  iriMod:8  },
  { market:'Match Winner (H2H)',      vuln:'Low',      inPlay:false, window:'Pre-match',    detect:'Easy',      iriMod:0  },
]

export const NETWORK_NODES = [
  { id:'p_duran',    label:'R. Duran',        type:'player',     risk:91, centrality:85, x:45, y:60 },
  { id:'p_novak',    label:'J. Novak',         type:'player',     risk:82, centrality:78, x:30, y:70 },
  { id:'p_ikeda',    label:'T. Ikeda',          type:'player',     risk:68, centrality:55, x:55, y:40 },
  { id:'p_okafor',   label:'B. Okafor',         type:'player',     risk:74, centrality:60, x:65, y:75 },
  { id:'o_silva',    label:'Umpire A. Silva',   type:'official',   risk:88, centrality:92, x:50, y:50 },
  { id:'o_rossi',    label:'Umpire M. Rossi',   type:'official',   risk:22, centrality:30, x:20, y:30 },
  { id:'t_antalya',  label:'ITF M25 Antalya',   type:'tournament', risk:76, centrality:65, x:60, y:20 },
  { id:'t_cairo',    label:'ITF M15 Cairo',     type:'tournament', risk:82, centrality:70, x:75, y:55 },
  { id:'b_marconi',  label:'Coach B. Marconi',  type:'coach',      risk:61, centrality:48, x:35, y:25 },
  { id:'s_nitro',    label:'NitroBetting',      type:'sportsbook', risk:71, centrality:58, x:85, y:65 },
]
export const NETWORK_EDGES = [
  { from:'p_duran',  to:'t_antalya', type:'played_in',    w:7 },
  { from:'p_duran',  to:'t_cairo',   type:'played_in',    w:4 },
  { from:'p_novak',  to:'t_antalya', type:'played_in',    w:5 },
  { from:'p_ikeda',  to:'t_antalya', type:'played_in',    w:3 },
  { from:'p_okafor', to:'t_cairo',   type:'played_in',    w:4 },
  { from:'o_silva',  to:'t_antalya', type:'officiated_at',w:9 },
  { from:'o_silva',  to:'t_cairo',   type:'officiated_at',w:5 },
  { from:'b_marconi',to:'p_duran',   type:'coaches',      w:6 },
  { from:'b_marconi',to:'p_novak',   type:'coaches',      w:3 },
  { from:'s_nitro',  to:'t_antalya', type:'markets',      w:16 },
  { from:'s_nitro',  to:'t_cairo',   type:'markets',      w:14 },
  { from:'p_duran',  to:'o_silva',   type:'co_match',     w:7 },
  { from:'p_novak',  to:'o_silva',   type:'co_match',     w:5 },
]
