// ─── User roles & permissions ─────────────────────────────────────────────────
export const USER_ROLES = {
  god:              { label: 'Integrity Chief (God Mode)', icon: '👁️', color: '#a855f7', tier: 0 },
  main_account:     { label: 'Main Account',               icon: '🏛️', color: '#ef4444', tier: 1 },
  supervisor:       { label: 'Supervisor',                 icon: '🎖️', color: '#f97316', tier: 2 },
  special_agent:    { label: 'Special Agent',              icon: '🕵️', color: '#eab308', tier: 3 },
  regulator:        { label: 'Regulator',                  icon: '⚖️', color: '#22c55e', tier: 3 },
  integrity_officer:{ label: 'Integrity Officer',          icon: '🛡️', color: '#84cc16', tier: 3 },
  governance:       { label: 'Sports Governance',          icon: '🏟️', color: '#06b6d4', tier: 3 },
  player:           { label: 'Athlete',                    icon: '🎾', color: '#3b82f6', tier: 4 },
  gambler:          { label: 'Gambler',                    icon: '🎲', color: '#8b5cf6', tier: 4 },
  sportsbook:       { label: 'Sportsbook',                 icon: '📊', color: '#ec4899', tier: 4 },
  journalist:       { label: 'Journalist',                 icon: '📰', color: '#6b7280', tier: 4 },
}

// Hierarchy: god > main_account > supervisor > special_agent/regulator/etc > player/gambler/etc
export const ROLE_HIERARCHY = {
  god: ['main_account','supervisor','special_agent','regulator','integrity_officer','governance','player','gambler','sportsbook','journalist'],
  main_account: ['supervisor','special_agent','regulator','integrity_officer','governance'],
  supervisor: ['special_agent'],
  special_agent: [], regulator: [], integrity_officer: [], governance: [],
  player: [], gambler: [], sportsbook: [], journalist: [],
}

export const ROLE_TABS = {
  god:              ['godmode','monitor','iri','sports_switch','cases','dossiers','network','benford','microbets','coverage','api','analytics','alerts','workgroup','security','help'],
  main_account:     ['monitor','iri','sports_switch','cases','dossiers','network','benford','microbets','coverage','api','analytics','alerts','workgroup','security','help'],
  supervisor:       ['monitor','iri','sports_switch','cases','dossiers','network','benford','microbets','analytics','alerts','workgroup','help'],
  special_agent:    ['monitor','iri','cases','dossiers','network','benford','microbets','alerts','workgroup','help'],
  regulator:        ['monitor','cases','api','coverage','benford','analytics','alerts','workgroup','help'],
  integrity_officer:['iri','monitor','cases','dossiers','network','benford','microbets','workgroup','alerts','api','help'],
  governance:       ['monitor','cases','coverage','analytics','alerts','workgroup','help'],
  player:           ['iri','monitor','alerts','help'],
  gambler:          ['iri','monitor','parlay','alerts','help'],
  sportsbook:       ['monitor','sportsbook','api','alerts','workgroup','security','help'],
  journalist:       ['monitor','analytics','dossiers','benford','coverage','help'],
}

// ─── Multi-sport mock matches ─────────────────────────────────────────────────
export const MOCK_MATCHES = {
  tennis: [
    { id:'T-001', p1:'R. Duran',  p2:'T. Ikeda',   event:'ITF M25 Antalya',       tier:'itf',        favOdds:1.19, dogOdds:4.95, rankingGap:11, surface:'Clay',   volume:'$1.2M', movement:'+210%', sport:'tennis' },
    { id:'T-002', p1:'J. Novak',  p2:'A. Vale',    event:'ATP Challenger Tunis',   tier:'challenger', favOdds:1.44, dogOdds:2.88, rankingGap:39, surface:'Hard',   volume:'$420K', movement:'+38%',  sport:'tennis' },
    { id:'T-003', p1:'L. Hart',   p2:'M. Sato',    event:'WTA 250 Bogotá',         tier:'tour_250',   favOdds:1.31, dogOdds:3.35, rankingGap:21, surface:'Clay',   volume:'$185K', movement:'Stable',sport:'tennis' },
    { id:'T-004', p1:'S. Vega',   p2:'K. Rousseau',event:'Roland Garros',          tier:'grand_slam', favOdds:1.62, dogOdds:2.30, rankingGap:58, surface:'Clay',   volume:'$8.4M', movement:'+2%',   sport:'tennis' },
    { id:'T-005', p1:'Y. Tanaka', p2:'B. Okafor',  event:'ITF M15 Cairo',          tier:'itf',        favOdds:1.22, dogOdds:4.20, rankingGap:8,  surface:'Clay',   volume:'$890K', movement:'+310%', sport:'tennis' },
  ],
  nfl: [
    { id:'N-001', p1:'Kansas City Chiefs', p2:'Las Vegas Raiders', event:'NFL Week 14', tier:'starter', favOdds:1.28, dogOdds:4.00, propType:'Rushing Yards O/U', normalVol:5000,  currentVol:187000, injuryLatency:45, offshoreDiv:12, sport:'nfl' },
    { id:'N-002', p1:'Dallas Cowboys',     p2:'NY Giants',         event:'NFL Week 14', tier:'backup',  favOdds:1.45, dogOdds:2.80, propType:'Receiving Yards O/U',normalVol:3000, currentVol:8200,   injuryLatency:0,  offshoreDiv:2,  sport:'nfl' },
    { id:'N-003', p1:'SF 49ers',           p2:'Seattle Seahawks',  event:'NFL Week 14', tier:'practice_squad', favOdds:1.55, dogOdds:2.50, propType:'Passing TDs O/U', normalVol:8000, currentVol:41000, injuryLatency:90, offshoreDiv:18, sport:'nfl' },
  ],
  cfb: [
    { id:'C-001', p1:'Ohio State',   p2:'Michigan',         event:'Big Ten Championship', tier:'power4_top',  favOdds:1.35, dogOdds:3.20, closingSpread:7,  finalMargin:3,  nilExposure:false, sport:'cfb' },
    { id:'C-002', p1:'Western Kentucky', p2:'Middle Tennessee', event:'CUSA Game',       tier:'group_of_5',  favOdds:1.52, dogOdds:2.55, closingSpread:10, finalMargin:1,  nilExposure:true,  sport:'cfb' },
    { id:'C-003', p1:'Alabama',      p2:'LSU',              event:'SEC Game',             tier:'power4',      favOdds:1.40, dogOdds:3.00, closingSpread:14, finalMargin:10, nilExposure:false, sport:'cfb' },
  ],
  cbb: [
    { id:'B-001', p1:'Duke',           p2:'UNC',            event:'ACC Tournament', tier:'power4_high', favOdds:1.60, dogOdds:2.40, kenpomDiff:8,  sport:'cbb' },
    { id:'B-002', p1:'Murray State',   p2:'Belmont',        event:'OVC Game',       tier:'mid_major',   favOdds:1.48, dogOdds:2.70, kenpomDiff:5,  sport:'cbb' },
    { id:'B-003', p1:'Valparaiso',     p2:'Bradley',        event:'MVC Game',       tier:'low_major',   favOdds:1.55, dogOdds:2.50, kenpomDiff:3,  sport:'cbb' },
  ],
  soccer_epl: [
    { id:'S-001', p1:'Manchester City', p2:'Arsenal',     event:'EPL Matchday 28', tier:'top6',    favOdds:1.72, dogOdds:4.50, volume:'$12.1M', movement:'+4%',   sport:'soccer_epl' },
    { id:'S-002', p1:'Sheffield Utd',   p2:'Luton Town',  event:'EPL Matchday 28', tier:'bottom',  favOdds:2.10, dogOdds:3.40, volume:'$1.8M',  movement:'+28%',  sport:'soccer_epl' },
  ],
  wnba: [
    { id:'W-001', p1:'Las Vegas Aces',     p2:'NY Liberty',       event:'WNBA Finals G3', tier:'playoff',  favOdds:1.55, dogOdds:2.50, volume:'$2.1M', movement:'+8%',  sport:'wnba' },
    { id:'W-002', p1:'Indiana Fever',      p2:'Dallas Wings',     event:'WNBA Regular',   tier:'standard', favOdds:1.38, dogOdds:3.10, volume:'$480K', movement:'+42%', sport:'wnba' },
  ],
}

// ─── APIs ─────────────────────────────────────────────────────────────────────
export const MOCK_APIS = [
  { name:'Sportradar Tennis',  key:'g5352b…', status:'live',  successCalls:4821, totalCalls:4900, stdDevOdds:0.08, confirmedAlerts:31, totalAlerts:35, avgLatencyMs:12, endpoint:'/sportradar', lastPing:'2s ago',  sports:['tennis'] },
  { name:'The Odds API',       key:'178ebf…', status:'live',  successCalls:2931, totalCalls:3000, stdDevOdds:0.12, confirmedAlerts:18, totalAlerts:22, avgLatencyMs:18, endpoint:'/odds',       lastPing:'5s ago',  sports:['all'] },
  { name:'Sportradar NFL',     key:'g5352b…', status:'live',  successCalls:1820, totalCalls:1900, stdDevOdds:0.11, confirmedAlerts:14, totalAlerts:16, avgLatencyMs:14, endpoint:'/nfl',        lastPing:'3s ago',  sports:['nfl'] },
  { name:'KenPom CBB',         key:'(sub)',   status:'warn',  successCalls:310,  totalCalls:400,  stdDevOdds:0.05, confirmedAlerts:4,  totalAlerts:5,  avgLatencyMs:28, endpoint:'(external)',  lastPing:'2m ago',  sports:['cbb'] },
  { name:'RapidAPI Tennis',    key:'d7f079…', status:'warn',  successCalls:1450, totalCalls:1500, stdDevOdds:0.15, confirmedAlerts:12, totalAlerts:15, avgLatencyMs:24, endpoint:'(external)',  lastPing:'1m ago',  sports:['tennis'] },
  { name:'API Tennis',         key:'10294f…', status:'live',  successCalls:980,  totalCalls:1000, stdDevOdds:0.09, confirmedAlerts:8,  totalAlerts:10, avgLatencyMs:16, endpoint:'(external)',  lastPing:'8s ago',  sports:['tennis'] },
  { name:'DraftKings Props',   key:'(env)',   status:'error', successCalls:120,  totalCalls:400,  stdDevOdds:0.31, confirmedAlerts:2,  totalAlerts:18, avgLatencyMs:90, endpoint:'(external)',  lastPing:'4m ago',  sports:['nfl','nba'] },
  { name:'Kalshi Pred Mkt',    key:'(free)', status:'live',  successCalls:490,  totalCalls:500,  stdDevOdds:0.10, confirmedAlerts:5,  totalAlerts:6,  avgLatencyMs:20, endpoint:'(external)',  lastPing:'3s ago',  sports:['all'] },
  { name:'Betfair Exchange',   key:'(free)', status:'live',  successCalls:610,  totalCalls:700,  stdDevOdds:0.21, confirmedAlerts:9,  totalAlerts:14, avgLatencyMs:35, endpoint:'(external)',  lastPing:'1m ago',  sports:['all'] },
  { name:'Yahoo Fantasy API',  key:'(oauth)',status:'warn',  successCalls:220,  totalCalls:300,  stdDevOdds:0.00, confirmedAlerts:1,  totalAlerts:3,  avgLatencyMs:42, endpoint:'(external)',  lastPing:'5m ago',  sports:['fantasy'] },
  { name:'NFL Injury Reports', key:'(free)', status:'live',  successCalls:480,  totalCalls:500,  stdDevOdds:0.00, confirmedAlerts:6,  totalAlerts:7,  avgLatencyMs:18, endpoint:'(external)',  lastPing:'4s ago',  sports:['nfl'] },
]

// ─── Cases ────────────────────────────────────────────────────────────────────
export const INITIAL_CASES = [
  { id:'CASE-24017', title:'Cluster volatility ITF M15 Monastir',             severity:'Critical', status:'Active',     stage:'Evidence Review',  assignee:'A. Morgan', supervisor:'D. Kim',    iri:88, confidence:92, alerts:14, created:'2026-03-24', due:'2026-04-03', sport:'tennis', jurisdiction:'Tunisia',       entities:['4 players','2 officials','3 bookmakers'], notes:[], pendingApproval:false },
  { id:'CASE-24011', title:'NFL Prop anomaly — practice squad WR',            severity:'High',     status:'Open',       stage:'Triage',           assignee:'S. Patel',  supervisor:'D. Kim',    iri:76, confidence:81, alerts:9,  created:'2026-03-19', due:'2026-04-06', sport:'nfl',    jurisdiction:'USA',           entities:['1 player','2 bookmakers'],                notes:[], pendingApproval:false },
  { id:'CASE-23998', title:'CFB point shaving — MAC Tuesday night game',      severity:'High',     status:'Monitoring', stage:'Network Analysis', assignee:'T. Walsh',  supervisor:'A. Morgan', iri:72, confidence:74, alerts:8,  created:'2026-03-15', due:'2026-04-12', sport:'cfb',    jurisdiction:'USA',           entities:['3 players','1 coach','2 accounts'],       notes:[], pendingApproval:false },
  { id:'CASE-23881', title:'Line movement anomaly ITF Cairo W15',             severity:'Medium',   status:'Open',       stage:'Initial Alert',    assignee:'R. Osei',   supervisor:'A. Morgan', iri:65, confidence:68, alerts:7,  created:'2026-03-10', due:'2026-04-01', sport:'tennis', jurisdiction:'Egypt',         entities:['2 players','1 official'],                 notes:[], pendingApproval:true  },
]

// ─── Dossiers ─────────────────────────────────────────────────────────────────
export const INITIAL_DOSSIERS = [
  { id:'D-001', type:'Player',     name:'R. Duran',        avgIri:81, flagged:7,  total:22, sport:'tennis', tier:'ITF/Challenger', surface:'Clay',  nationality:'ARG', history:[55,62,70,78,81,79,85], restricted:false },
  { id:'D-002', type:'Player',     name:'J. Novak',        avgIri:68, flagged:5,  total:18, sport:'tennis', tier:'Challenger',     surface:'Hard',  nationality:'CZE', history:[40,45,52,61,65,70,68], restricted:false },
  { id:'D-003', type:'Official',   name:'Umpire A. Silva', avgIri:88, flagged:9,  total:14, sport:'tennis', tier:'Mixed',          surface:'Mixed', nationality:'BRA', history:[60,70,75,82,88,85,88], restricted:true  },
  { id:'D-004', type:'Tournament', name:'ITF M25 Antalya', avgIri:76, flagged:18, total:48, sport:'tennis', tier:'ITF',            surface:'Clay',  nationality:'TUR', history:[50,55,62,70,74,73,76], restricted:false },
  { id:'D-005', type:'Player',     name:'WR — Practice Squad (NFL)', avgIri:74, flagged:3, total:8, sport:'nfl', tier:'practice_squad', surface:'N/A', nationality:'USA', history:[30,40,55,68,72,74,74], restricted:true },
  { id:'D-006', type:'Coach',      name:'B. Marconi',      avgIri:61, flagged:3,  total:12, sport:'tennis', tier:'ITF/Challenger', surface:'Clay',  nationality:'ITA', history:[30,35,40,55,58,60,61], restricted:false },
  { id:'D-007', type:'Sportsbook', name:'BetOnline',       avgIri:54, flagged:11, total:80, sport:'all',    tier:'Multi',          surface:'N/A',   nationality:'CUR', history:[40,42,48,50,52,53,54], restricted:false },
]

// ─── Workgroup posts ──────────────────────────────────────────────────────────
export const INITIAL_POSTS = [
  { id:'WG-001', user:'A. Morgan', role:'Special Agent',    from:'supervisor', match:'T-001', sport:'tennis', note:'Coordinated movement across 3 EU-licensed books. Cross-reference CASE-24017.', ts:'2026-03-31 14:30', upvotes:3, flagged:false, internal:false },
  { id:'WG-002', user:'D. Kim',    role:'Supervisor',       from:'supervisor', match:'N-003', sport:'nfl',    note:'Practice squad WR — injury latency 90min before offshore line moved. Escalate.', ts:'2026-03-31 13:58', upvotes:5, flagged:false, internal:true  },
  { id:'WG-003', user:'S. Patel',  role:'Special Agent',    from:'agent',      match:'C-002', sport:'cfb',    note:'Tuesday MAC game — no NIL, spread covered by 1pt. Third time this season.', ts:'2026-03-31 11:20', upvotes:4, flagged:false, internal:false },
]

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const INITIAL_ALERTS = [
  { id:'ALT-001', matchId:'T-001', sport:'tennis', type:'Betting Spike',        severity:'Critical', message:'210% above-baseline volume on ITF M25 Antalya. IRI: 94.', ts:'2026-03-31 14:22', read:false, emailSent:true  },
  { id:'ALT-002', matchId:'N-003', sport:'nfl',    type:'Injury Latency',       severity:'Critical', message:'90min injury report gap — offshore prop volume +412% vs DraftKings. Pre-Market Anomaly.', ts:'2026-03-31 13:55', read:false, emailSent:true  },
  { id:'ALT-003', matchId:'C-002', sport:'cfb',    type:'ATS Residual',         severity:'High',     message:'MAC game won by 1pt vs 10pt spread. Point shaving pattern (3rd instance).', ts:'2026-03-31 12:10', read:false, emailSent:false },
  { id:'ALT-004', matchId:'T-002', sport:'tennis', type:'Bookmaker Dispersion', severity:'High',     message:'22pt dispersion across EU markets — ATP Challenger Tunis.', ts:'2026-03-30 17:44', read:true,  emailSent:false },
  { id:'ALT-005', matchId:'W-002', sport:'wnba',   type:'Volume Anomaly',       severity:'Elevated', message:'WNBA regular season game — 42% volume spike, unusual for tier.', ts:'2026-03-30 10:20', read:true,  emailSent:false },
]

// ─── God Mode: managed users ──────────────────────────────────────────────────
export const INITIAL_USERS = [
  { id:'U-001', username:'a.morgan',  role:'special_agent',    workgroup:'WG-Alpha', status:'active',  lockedOut:false, lastLogin:'2026-03-31 14:30', createdBy:'main' },
  { id:'U-002', username:'d.kim',     role:'supervisor',        workgroup:'WG-Alpha', status:'active',  lockedOut:false, lastLogin:'2026-03-31 13:58', createdBy:'main' },
  { id:'U-003', username:'s.patel',   role:'special_agent',     workgroup:'WG-Beta',  status:'active',  lockedOut:false, lastLogin:'2026-03-31 11:20', createdBy:'main' },
  { id:'U-004', username:'r.osei',    role:'special_agent',     workgroup:'WG-Beta',  status:'active',  lockedOut:false, lastLogin:'2026-03-30 09:12', createdBy:'main' },
  { id:'U-005', username:'t.walsh',   role:'regulator',         workgroup:'WG-Gamma', status:'active',  lockedOut:false, lastLogin:'2026-03-29 16:45', createdBy:'main' },
  { id:'U-006', username:'suspect.user', role:'gambler',        workgroup:'none',     status:'flagged', lockedOut:true,  lastLogin:'2026-03-28 22:10', createdBy:'self' },
]

// ─── Workgroups ───────────────────────────────────────────────────────────────
export const INITIAL_WORKGROUPS = [
  { id:'WG-Alpha', name:'Alpha Team',  supervisor:'d.kim',    agents:['a.morgan','r.osei'], sport:'tennis', clearance:'Top Secret', restricted:false },
  { id:'WG-Beta',  name:'Beta Team',   supervisor:'d.kim',    agents:['s.patel'],           sport:'cfb',    clearance:'Secret',     restricted:false },
  { id:'WG-Gamma', name:'Gamma Team',  supervisor:'a.morgan', agents:['t.walsh'],           sport:'nfl',    clearance:'Confidential',restricted:true  },
]

// ─── Document templates ───────────────────────────────────────────────────────
export const DOC_TEMPLATES = [
  { id:'TPL-001', name:'Case File Report',        fields:['case_id','date','investigator','subject','iri_score','summary','evidence','recommendation'], requiresApproval:true  },
  { id:'TPL-002', name:'Integrity Alert Notice',  fields:['alert_id','match','sport','iri','threshold','action_taken'],                                  requiresApproval:false },
  { id:'TPL-003', name:'Network Analysis Report', fields:['entities','edges','centrality_scores','cluster_findings','risk_assessment'],                  requiresApproval:true  },
  { id:'TPL-004', name:'CAS Evidence Pack',       fields:['case_id','timeline','odds_data','benford_result','methodology_plain_english','audit_hash'],   requiresApproval:true  },
  { id:'TPL-005', name:'Fantasy Monitoring Brief', fields:['participant_pool','favored_players','anomaly_flags','date_range'],                            requiresApproval:false },
]

// ─── Analytics data ───────────────────────────────────────────────────────────
export const TREND_DATA = [
  {m:'Oct 25',iri:67,alerts:39},{m:'Nov 25',iri:71,alerts:48},{m:'Dec 25',iri:65,alerts:39},
  {m:'Jan 26',iri:74,alerts:53},{m:'Feb 26',iri:79,alerts:63},{m:'Mar 26',iri:83,alerts:71},
]

export const TIER_DIST = [
  { tier:'Grand Slam', upset:29.8, color:'#22c55e' },
  { tier:'Masters',    upset:31.4, color:'#84cc16' },
  { tier:'500 Level',  upset:33.1, color:'#eab308' },
  { tier:'250/Intl',   upset:36.8, color:'#f97316' },
  { tier:'Challenger', upset:38.2, color:'#ef4444' },
  { tier:'ITF/Futures',upset:41.5, color:'#dc2626' },
]

export const SPORT_IRI_DIST = [
  { sport:'ITF Tennis',         avgIri:79, color:'#dc2626' },
  { sport:'CFB Group of 5',     avgIri:72, color:'#ef4444' },
  { sport:'WNBA Regular',       avgIri:68, color:'#f97316' },
  { sport:'NFL Practice Squad', avgIri:65, color:'#f97316' },
  { sport:'CBB Low Major',      avgIri:61, color:'#eab308' },
  { sport:'Soccer — Championship', avgIri:55, color:'#eab308' },
  { sport:'CFB Power 4',        avgIri:38, color:'#22c55e' },
  { sport:'NFL Starter',        avgIri:28, color:'#22c55e' },
  { sport:'Tennis Grand Slam',  avgIri:22, color:'#22c55e' },
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
  { market:'Medical Timeout Prop',    vuln:'Critical', inPlay:true,  window:'Any moment',   detect:'Very Hard', iriMod:30, sport:'tennis', aiTrend:[2200,4100,8900,18000,41000] },
  { market:'Double Fault Y/N',        vuln:'Critical', inPlay:true,  window:'Single serve', detect:'Very Hard', iriMod:28, sport:'tennis', aiTrend:[1100,1800,2200,2100,2400] },
  { market:'Next Point Winner',       vuln:'Critical', inPlay:true,  window:'Seconds',      detect:'Very Hard', iriMod:25, sport:'tennis', aiTrend:[500,600,800,900,880] },
  { market:'NFL Player Prop (Rush Yds O/U)', vuln:'Critical', inPlay:false, window:'Pre-game', detect:'Hard', iriMod:32, sport:'nfl', aiTrend:[5000,12000,48000,187000,210000] },
  { market:'NFL Injury Latency Prop', vuln:'Critical', inPlay:false,  window:'Practice close', detect:'Very Hard', iriMod:35, sport:'nfl', aiTrend:[200,800,3200,14000,38000] },
  { market:'CFB First Half Spread',   vuln:'High',     inPlay:false, window:'Pre-game',     detect:'Medium',    iriMod:22, sport:'cfb', aiTrend:[3000,3200,3500,3400,3800] },
  { market:'Will Game Go to Deuce?',  vuln:'Critical', inPlay:true,  window:'<2 min',       detect:'Hard',      iriMod:22, sport:'tennis', aiTrend:[800,900,1100,1000,1200] },
  { market:'CBB First Basket',        vuln:'High',     inPlay:false, window:'Pre-game',     detect:'Hard',      iriMod:18, sport:'cbb', aiTrend:[1200,1400,1300,1600,1800] },
  { market:'Soccer First Goalscorer', vuln:'High',     inPlay:false, window:'Pre-match',    detect:'Medium',    iriMod:15, sport:'soccer_epl', aiTrend:[8000,8200,8400,8800,9200] },
  { market:'Total Games O/U',         vuln:'High',     inPlay:false, window:'Pre-match',    detect:'Medium',    iriMod:10, sport:'tennis', aiTrend:[2000,2100,2300,2200,2400] },
  { market:'Match Winner (H2H)',      vuln:'Low',      inPlay:false, window:'Pre-match',    detect:'Easy',      iriMod:0,  sport:'all',    aiTrend:[50000,51000,49000,52000,50000] },
]

export const NETWORK_NODES = [
  { id:'p_duran',   label:'R. Duran',        type:'player',     risk:91, centrality:85, x:45, y:60, sport:'tennis' },
  { id:'p_novak',   label:'J. Novak',         type:'player',     risk:82, centrality:78, x:30, y:70, sport:'tennis' },
  { id:'o_silva',   label:'Umpire A. Silva',  type:'official',   risk:88, centrality:92, x:50, y:50, sport:'tennis' },
  { id:'t_antalya', label:'ITF M25 Antalya',  type:'tournament', risk:76, centrality:65, x:60, y:20, sport:'tennis' },
  { id:'t_cairo',   label:'ITF M15 Cairo',    type:'tournament', risk:82, centrality:70, x:75, y:55, sport:'tennis' },
  { id:'b_marconi', label:'Coach B. Marconi', type:'coach',      risk:61, centrality:48, x:35, y:25, sport:'tennis' },
  { id:'n_wr01',    label:'WR — Practice Squad', type:'player',  risk:74, centrality:55, x:20, y:55, sport:'nfl'    },
  { id:'n_bookie',  label:'Offshore Book X',  type:'sportsbook', risk:86, centrality:72, x:80, y:35, sport:'nfl'    },
  { id:'c_coach',   label:'MAC Coach A',      type:'coach',      risk:68, centrality:44, x:15, y:35, sport:'cfb'    },
]
export const NETWORK_EDGES = [
  { from:'p_duran',  to:'t_antalya', type:'played_in',    w:7 },
  { from:'p_duran',  to:'t_cairo',   type:'played_in',    w:4 },
  { from:'p_novak',  to:'t_antalya', type:'played_in',    w:5 },
  { from:'o_silva',  to:'t_antalya', type:'officiated_at',w:9 },
  { from:'o_silva',  to:'t_cairo',   type:'officiated_at',w:5 },
  { from:'b_marconi',to:'p_duran',   type:'coaches',      w:6 },
  { from:'n_wr01',   to:'n_bookie',  type:'linked',       w:8 },
  { from:'c_coach',  to:'n_bookie',  type:'linked',       w:5 },
  { from:'p_duran',  to:'o_silva',   type:'co_match',     w:7 },
]

// ─── Fantasy blind monitoring mock data ──────────────────────────────────────
export const FANTASY_DATA = {
  topPickedPlayers: [
    { name:'Patrick Mahomes', sport:'nfl', pickPct:78, avgPoints:38.2, iriFlag:false },
    { name:'Caitlin Clark',   sport:'wnba', pickPct:71, avgPoints:28.4, iriFlag:false },
    { name:'Travis Kelce',    sport:'nfl', pickPct:65, avgPoints:22.1, iriFlag:false },
    { name:'Lamar Jackson',   sport:'nfl', pickPct:61, avgPoints:35.8, iriFlag:false },
    { name:'Player X (Anon)',  sport:'tennis', pickPct:44, avgPoints:18.0, iriFlag:true  },
  ],
  concentrationAnomaly: { detected:true, sport:'nfl', prop:'Rush Yards O/U', pctFavoring:'Over', participantPct:84, normalPct:52 },
}

export const VERSION = '1.3.0'
