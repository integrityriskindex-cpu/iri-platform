// ─── User roles ───────────────────────────────────────────────────────────────
export const USER_ROLES = {
  god:              { label:'Integrity Chief (God Mode)', icon:'👁️', color:'#a855f7', tier:0 },
  main_account:     { label:'Main Account',               icon:'🏛️', color:'#ef4444', tier:1 },
  supervisor:       { label:'Supervisor',                 icon:'🎖️', color:'#f97316', tier:2 },
  special_agent:    { label:'Special Agent',              icon:'🕵️', color:'#eab308', tier:3 },
  regulator:        { label:'Regulator',                  icon:'⚖️', color:'#22c55e', tier:3 },
  integrity_officer:{ label:'Integrity Officer',          icon:'🛡️', color:'#84cc16', tier:3 },
  governance:       { label:'Sports Governance',          icon:'🏟️', color:'#06b6d4', tier:3 },
  player:           { label:'Athlete',                    icon:'🎾', color:'#3b82f6', tier:4 },
  gambler:          { label:'Gambler',                    icon:'🎲', color:'#8b5cf6', tier:4 },
  sportsbook:       { label:'Sportsbook',                 icon:'📊', color:'#ec4899', tier:4 },
}

export const ROLE_TABS = {
  god:              ['triage','godmode','nexus','chrono','finint','overwatch','predictive','deconflict','cases','messaging','timekeeping','monitor','iri','api','analytics','alerts','security','help'],
  main_account:     ['triage','nexus','chrono','finint','overwatch','predictive','deconflict','cases','messaging','timekeeping','monitor','iri','api','analytics','alerts','security','help'],
  supervisor:       ['triage','nexus','chrono','finint','overwatch','cases','messaging','monitor','iri','analytics','alerts','help'],
  special_agent:    ['triage','nexus','overwatch','cases','messaging','monitor','iri','alerts','help'],
  regulator:        ['triage','nexus','overwatch','deconflict','cases','monitor','api','analytics','alerts','help'],
  integrity_officer:['triage','nexus','finint','overwatch','cases','monitor','iri','alerts','help'],
  governance:       ['triage','overwatch','cases','monitor','analytics','alerts','help'],
  player:           ['iri','monitor','alerts','help'],
  gambler:          ['iri','monitor','alerts','help'],
  sportsbook:       ['triage','overwatch','finint','monitor','api','alerts','help'],
}

// ─── Triage: Overnight AI analysis ───────────────────────────────────────────
export const TRIAGE_ITEMS = [
  { id:'TR-001', severity:'Critical', type:'Betting Spike',     sport:'tennis', entity:'R. Duran vs T. Ikeda', detail:'IRI: 22 → 94 overnight. Sportradar Benford χ²=28.4. Three coordinated EU books.', ts:'03:42 AM', iriPrev:22, iriCurr:94, action:'Open Case', caseId:'CASE-24017' },
  { id:'TR-002', severity:'Critical', type:'Cluster Threshold', sport:'nfl',    entity:'Practice Squad WR — Kansas City', detail:'Offshore prop volume +3,740%. Injury latency 90min. Shadow market divergence 18pt.', ts:'04:15 AM', iriPrev:31, iriCurr:88, action:'Review Graph', caseId:null },
  { id:'TR-003', severity:'High',     type:'Wire Transfer',     sport:'cfb',    entity:'MAC Tuesday Night Game', detail:'$50K wire from known shell company 4 hours pre-kickoff. ATS residual pattern (3rd instance).', ts:'05:00 AM', iriPrev:44, iriCurr:78, action:'Open Case', caseId:null },
  { id:'TR-004', severity:'High',     type:'Dark Web Monitor',  sport:'tennis', entity:'ITF Cluster — MENA Region', detail:'Three keyword matches on Telegram channel: match names + date references + betting amounts.', ts:'05:30 AM', iriPrev:55, iriCurr:76, action:'Flag', caseId:null },
  { id:'TR-005', severity:'Elevated', type:'Social Sentiment',  sport:'tennis', entity:'J. Novak — Social Media', detail:'Post frequency dropped 80% in last 72 hours. Last two posts reference financial stress.', ts:'06:10 AM', iriPrev:40, iriCurr:62, action:'Monitor', caseId:null },
]

// ─── Network graph nodes + edges ──────────────────────────────────────────────
export const NETWORK_NODES = [
  { id:'p_duran',   label:'R. Duran',        type:'player',     risk:91, x:42, y:55, sport:'tennis', betweenness:85, flagged:true  },
  { id:'p_novak',   label:'J. Novak',         type:'player',     risk:82, x:28, y:68, sport:'tennis', betweenness:72, flagged:true  },
  { id:'p_ikeda',   label:'T. Ikeda',          type:'player',     risk:68, x:55, y:38, sport:'tennis', betweenness:48, flagged:false },
  { id:'p_okafor',  label:'B. Okafor',         type:'player',     risk:74, x:65, y:72, sport:'tennis', betweenness:55, flagged:false },
  { id:'o_silva',   label:'Umpire A. Silva',   type:'official',   risk:88, x:48, y:48, sport:'tennis', betweenness:92, flagged:true  },
  { id:'t_antalya', label:'ITF M25 Antalya',   type:'tournament', risk:76, x:58, y:18, sport:'tennis', betweenness:65, flagged:true  },
  { id:'t_cairo',   label:'ITF M15 Cairo',     type:'tournament', risk:82, x:74, y:52, sport:'tennis', betweenness:70, flagged:true  },
  { id:'b_marconi', label:'Coach B. Marconi',  type:'coach',      risk:61, x:32, y:22, sport:'tennis', betweenness:44, flagged:false },
  { id:'s_nitro',   label:'NitroBetting',      type:'sportsbook', risk:86, x:82, y:38, sport:'all',    betweenness:78, flagged:true  },
  { id:'n_wr01',    label:'WR — Practice Squad',type:'player',    risk:74, x:18, y:52, sport:'nfl',    betweenness:55, flagged:true  },
  { id:'bc_a',      label:'Bet Cluster A',     type:'bettor',     risk:88, x:88, y:62, sport:'all',    betweenness:68, flagged:true  },
]
export const NETWORK_EDGES = [
  { from:'p_duran',  to:'t_antalya', type:'played_in',    w:9 },
  { from:'p_duran',  to:'t_cairo',   type:'played_in',    w:5 },
  { from:'p_novak',  to:'t_antalya', type:'played_in',    w:6 },
  { from:'p_ikeda',  to:'t_antalya', type:'played_in',    w:4 },
  { from:'p_okafor', to:'t_cairo',   type:'played_in',    w:5 },
  { from:'o_silva',  to:'t_antalya', type:'officiated_at',w:11 },
  { from:'o_silva',  to:'t_cairo',   type:'officiated_at',w:7 },
  { from:'b_marconi',to:'p_duran',   type:'coaches',      w:8 },
  { from:'b_marconi',to:'p_novak',   type:'coaches',      w:4 },
  { from:'s_nitro',  to:'t_antalya', type:'markets',      w:18 },
  { from:'s_nitro',  to:'t_cairo',   type:'markets',      w:15 },
  { from:'s_nitro',  to:'bc_a',      type:'linked',       w:12 },
  { from:'p_duran',  to:'o_silva',   type:'co_match',     w:9 },
  { from:'p_novak',  to:'o_silva',   type:'co_match',     w:6 },
  { from:'n_wr01',   to:'bc_a',      type:'linked',       w:9 },
  { from:'p_duran',  to:'bc_a',      type:'linked',       w:7 },
]

// ─── Match data ───────────────────────────────────────────────────────────────
export const MOCK_MATCHES = {
  tennis:[
    { id:'T-001', p1:'R. Duran',  p2:'T. Ikeda',    event:'ITF M25 Antalya',     tier:'itf',        favOdds:1.19, dogOdds:4.95, rankingGap:11, surface:'Clay',   volume:'$1.2M', movement:'+210%', prevIRI:22, sport:'tennis' },
    { id:'T-002', p1:'J. Novak',  p2:'A. Vale',     event:'ATP Challenger Tunis', tier:'challenger', favOdds:1.44, dogOdds:2.88, rankingGap:39, surface:'Hard',   volume:'$420K', movement:'+38%',  prevIRI:45, sport:'tennis' },
    { id:'T-003', p1:'L. Hart',   p2:'M. Sato',     event:'WTA 250 Bogotá',       tier:'tour_250',   favOdds:1.31, dogOdds:3.35, rankingGap:21, surface:'Clay',   volume:'$185K', movement:'Stable',prevIRI:28, sport:'tennis' },
    { id:'T-004', p1:'Y. Tanaka', p2:'B. Okafor',   event:'ITF M15 Cairo',        tier:'itf',        favOdds:1.22, dogOdds:4.20, rankingGap:8,  surface:'Clay',   volume:'$890K', movement:'+310%', prevIRI:35, sport:'tennis' },
  ],
  nfl:[
    { id:'N-001', p1:'Kansas City Chiefs', p2:'Las Vegas Raiders', event:'NFL Week 14', tier:'starter',        favOdds:1.28, dogOdds:4.00, volume:'$2.1M', movement:'+12%',  prevIRI:28, sport:'nfl' },
    { id:'N-002', p1:'SF 49ers',           p2:'Seattle Seahawks',  event:'NFL Week 14', tier:'practice_squad', favOdds:1.55, dogOdds:2.50, volume:'$180K', movement:'+380%', prevIRI:31, sport:'nfl' },
  ],
}

// ─── Chrono engine data ───────────────────────────────────────────────────────
export const CHRONO_MATCH = {
  id:'T-001', p1:'R. Duran', p2:'T. Ikeda', event:'ITF M25 Antalya', date:'2026-03-31',
  timeline:[
    { ts:'06:00', event:'Market Opens',          iriScore:22, odds:1.18, volume:8000,   type:'market',  icon:'📈' },
    { ts:'07:30', event:'Offshore line moves',   iriScore:31, odds:1.21, volume:24000,  type:'betting', icon:'💰' },
    { ts:'09:00', event:'Betfair spike +120%',   iriScore:45, odds:1.19, volume:61000,  type:'alert',   icon:'⚠️' },
    { ts:'10:15', event:'EU book dispersion 18pt',iriScore:58,odds:1.22, volume:98000,  type:'alert',   icon:'⚠️' },
    { ts:'11:00', event:'Benford χ²=28.4',       iriScore:71, odds:1.20, volume:142000, type:'forensic',icon:'🔬' },
    { ts:'11:30', event:'Cluster link detected', iriScore:82, odds:1.19, volume:198000, type:'network', icon:'🕸️' },
    { ts:'12:00', event:'IRI SHOCK — Alert issued',iriScore:94,odds:1.19,volume:285000, type:'shock',   icon:'🚨' },
    { ts:'13:00', event:'Match Start',           iriScore:94, odds:1.19, volume:310000, type:'match',   icon:'🎾' },
    { ts:'14:22', event:'Set 1: Duran loses 3-6',iriScore:96, odds:1.45, volume:380000, type:'match',   icon:'🎾' },
    { ts:'15:10', event:'Match: Upset confirmed',iriScore:98, odds:null,  volume:412000, type:'result',  icon:'🏁' },
  ]
}

// ─── FININT data ──────────────────────────────────────────────────────────────
export const FININT_DATA = {
  syndicates:[
    { id:'SYN-001', label:'Syndicate Alpha', members:12, markets:['ITF','Challenger'], avgBetInterval:17, pattern:'18min±2 windows', detectedMatches:31, totalVolume:'$4.2M', status:'Active',  confidence:91, color:'#ef4444' },
    { id:'SYN-002', label:'Syndicate Beta',  members:6,  markets:['NFL Props'],       avgBetInterval:34, pattern:'34min±4 windows', detectedMatches:14, totalVolume:'$1.8M', status:'Active',  confidence:78, color:'#f97316' },
    { id:'SYN-003', label:'Ghost Network',   members:3,  markets:['CFB ATS'],         avgBetInterval:52, pattern:'Irregular',        detectedMatches:8,  totalVolume:'$890K', status:'Dormant', confidence:61, color:'#eab308' },
  ],
  flowData:[
    { ts:'00:00', legitimate:120000, suspicious:8000  },
    { ts:'03:00', legitimate:95000,  suspicious:12000 },
    { ts:'06:00', legitimate:180000, suspicious:28000 },
    { ts:'09:00', legitimate:240000, suspicious:95000 },
    { ts:'12:00', legitimate:310000, suspicious:185000},
    { ts:'15:00', legitimate:280000, suspicious:142000},
    { ts:'18:00', legitimate:195000, suspicious:68000 },
    { ts:'21:00', legitimate:140000, suspicious:22000 },
  ],
  liquidityMarkets:[
    { market:'ITF M25 Antalya — Duran v Ikeda', normalVol:8000,  currentVol:285000, books:3, dispersion:18, stress:94 },
    { market:'ITF M15 Cairo — R1',              normalVol:5000,  currentVol:92000,  books:4, dispersion:12, stress:78 },
    { market:'NFL — KC Chiefs WR Rushing O/U',  normalVol:5000,  currentVol:187000, books:5, dispersion:14, stress:88 },
    { market:'CFB — MAC Tuesday R1',            normalVol:12000, currentVol:38000,  books:6, dispersion:7,  stress:52 },
    { market:'Roland Garros — SF',              normalVol:800000,currentVol:920000, books:14,dispersion:2,  stress:8  },
  ],
}

// ─── Overwatch (pre-match alerts) ─────────────────────────────────────────────
export const OVERWATCH_ALERTS = [
  { id:'OW-001', level:'Black',    sport:'tennis', match:'R. Duran vs T. Ikeda',    event:'ITF M25 Antalya',     hoursToStart:2.5, iriScore:94, trigger:'Syndicate Alpha + IRI Shock + Cluster threshold', preMatch:true  },
  { id:'OW-002', level:'Red',      sport:'nfl',    match:'KC Chiefs WR Prop',        event:'NFL Week 14',         hoursToStart:4.0, iriScore:88, trigger:'Injury latency 90min + offshore divergence',       preMatch:true  },
  { id:'OW-003', level:'Red',      sport:'tennis', match:'Y. Tanaka vs B. Okafor',  event:'ITF M15 Cairo',       hoursToStart:5.5, iriScore:82, trigger:'Volume +310% + Benford deviation + cluster member',  preMatch:true  },
  { id:'OW-004', level:'Yellow',   sport:'cfb',    match:'WKU vs Middle Tennessee', event:'CUSA Game',           hoursToStart:6.0, iriScore:72, trigger:'ATS pattern 3rd instance + NIL exposure + shell co', preMatch:true  },
  { id:'OW-005', level:'Yellow',   sport:'tennis', match:'J. Novak vs A. Vale',     event:'ATP Challenger Tunis',hoursToStart:8.0, iriScore:63, trigger:'Bookmaker dispersion 22pt + cluster proximity',      preMatch:false },
]

// ─── Predictive risk models ────────────────────────────────────────────────────
export const PREDICTIVE_SUBJECTS = [
  { name:'R. Duran',     sport:'tennis', tier:'itf',        earningsInstability:0.85, travelLoad:0.90, clusterExposure:0.95, recentIRI:[55,62,70,78,81,94], nationality:'ARG', ranking:312 },
  { name:'J. Novak',     sport:'tennis', tier:'challenger', earningsInstability:0.60, travelLoad:0.70, clusterExposure:0.80, recentIRI:[40,45,52,61,65,70], nationality:'CZE', ranking:188 },
  { name:'WR Unknown',   sport:'nfl',    tier:'practice_squad', earningsInstability:0.70, travelLoad:0.40, clusterExposure:0.85, recentIRI:[30,40,55,68,72,88], nationality:'USA', ranking:0 },
  { name:'B. Okafor',    sport:'tennis', tier:'itf',        earningsInstability:0.75, travelLoad:0.80, clusterExposure:0.70, recentIRI:[28,35,40,52,58,74], nationality:'NGR', ranking:445 },
  { name:'MAC Player X', sport:'cfb',    tier:'nil_zero',   earningsInstability:0.90, travelLoad:0.30, clusterExposure:0.60, recentIRI:[20,28,35,45,55,72], nationality:'USA', ranking:0 },
  { name:'Y. Tanaka',    sport:'tennis', tier:'itf',        earningsInstability:0.65, travelLoad:0.85, clusterExposure:0.65, recentIRI:[22,30,38,44,52,68], nationality:'JPN', ranking:389 },
]

// ─── Deconfliction registry ────────────────────────────────────────────────────
export const DECONFLICT_REGISTRY = [
  { agency:'ITIA',            entity:'Player A (hashed)', hash:'BH-A2F4C8E1', caseType:'Match Fixing',     status:'Active',  matched:true,  matchedAgency:'Europol' },
  { agency:'ITIA',            entity:'Umpire B (hashed)', hash:'BH-C9D1E4A8', caseType:'Corruption',       status:'Active',  matched:false, matchedAgency:null },
  { agency:'Nevada Gaming',   entity:'Bookie X (hashed)', hash:'BH-F3B2E7A5', caseType:'Illegal Bookmaking',status:'Active',  matched:true,  matchedAgency:'FBI' },
  { agency:'UK Gambling Comm',entity:'Syndicate (hashed)',hash:'BH-A2F4C8E1', caseType:'Money Laundering', status:'Pending', matched:true,  matchedAgency:'ITIA' },
  { agency:'AUSTRAC',         entity:'Network (hashed)',  hash:'BH-D7C3F1B9', caseType:'FININT',           status:'Active',  matched:false, matchedAgency:null },
]

// ─── Cases ────────────────────────────────────────────────────────────────────
export const INITIAL_CASES = [
  {
    id:'CASE-24017', title:'Cluster volatility ITF M15 Monastir',
    severity:'Critical', status:'Active', stage:'Evidence Review',
    assignee:'a.morgan', supervisor:'d.kim', iri:88, confidence:92, sport:'tennis',
    jurisdiction:'Tunisia', created:'2026-03-24', due:'2026-04-03',
    entities:['4 players','2 officials','3 bookmakers','Syndicate Alpha'],
    linkedCases:[], linkedDossiers:['D-001','D-003'],
    pendingApproval:false,
    notes:[], timeline:[
      { id:'TL-001', ts:'2026-03-24 08:00', user:'SYSTEM', type:'Alert Created', icon:'🚨', color:'#ef4444', text:'IRI shock: 22 → 88. Syndicate Alpha cluster threshold crossed.' },
      { id:'TL-002', ts:'2026-03-24 09:15', user:'a.morgan', type:'Case Opened', icon:'📁', color:'#3b82f6', text:'Case file opened. Nexus Graph snapshot captured.' },
    ],
    files:[], phoneLog:[], stakeoutLog:[], leads:[], infractions:[], timeLogs:[],
  },
]

// ─── Alerts ──────────────────────────────────────────────────────────────────
export const INITIAL_ALERTS = [
  { id:'ALT-001', matchId:'T-001', sport:'tennis', type:'IRI Shock',         severity:'Critical', message:'IRI: 22→94 in 6 hours. Black Swan forming — Syndicate Alpha linked. Overwatch BLACK issued.', ts:'2026-03-31 12:00', read:false, emailSent:true  },
  { id:'ALT-002', matchId:'N-002', sport:'nfl',    type:'Injury Latency',    severity:'Critical', message:'90min injury latency + offshore prop +3740%. Pre-match BLACK alert.', ts:'2026-03-31 11:55', read:false, emailSent:true  },
  { id:'ALT-003', matchId:'T-004', sport:'tennis', type:'Pre-Match Alert',   severity:'High',     message:'ITF Cairo +310% volume. Cluster member. RED overwatch issued 5.5hrs pre-match.', ts:'2026-03-31 07:30', read:false, emailSent:true  },
  { id:'ALT-004', matchId:'T-002', sport:'tennis', type:'Dispersion',        severity:'High',     message:'22pt bookmaker dispersion. Network proximity alert.', ts:'2026-03-30 17:44', read:true,  emailSent:false },
]

// ─── OmniBar query examples ───────────────────────────────────────────────────
export const OMNIBAR_EXAMPLES = [
  'Show all high-IRI ITF matches last 30 days',
  'Find cluster members linked to Syndicate Alpha',
  'Pre-match alerts firing in next 6 hours',
  'Players with IRI > 70 and earnings instability > 0.8',
  'Which umpires have officiated flagged matches in MENA?',
  'Deconfliction: search all agencies for R. Duran',
  'Show FININT flow anomalies above $100K',
  'Predictive: who is at highest risk next 30 days?',
]

// ─── API registry ─────────────────────────────────────────────────────────────
export const INITIAL_APIS = [
  { id:'api-001', name:'Sportradar Tennis',  key:'g5352b…', status:'live',  enabled:true,  successCalls:4821, totalCalls:4900, stdDevOdds:0.08, confirmedAlerts:31, totalAlerts:35, avgLatencyMs:12, endpoint:'/sportradar', sports:['tennis'],    credibility:88 },
  { id:'api-002', name:'The Odds API',       key:'178ebf…', status:'live',  enabled:true,  successCalls:2931, totalCalls:3000, stdDevOdds:0.12, confirmedAlerts:18, totalAlerts:22, avgLatencyMs:18, endpoint:'/odds',       sports:['all'],       credibility:81 },
  { id:'api-003', name:'Sportradar NFL',     key:'g5352b…', status:'live',  enabled:true,  successCalls:1820, totalCalls:1900, stdDevOdds:0.11, confirmedAlerts:14, totalAlerts:16, avgLatencyMs:14, endpoint:'/nfl',        sports:['nfl'],       credibility:84 },
  { id:'api-004', name:'KenPom CBB',         key:'(sub)',   status:'warn',  enabled:true,  successCalls:310,  totalCalls:400,  stdDevOdds:0.05, confirmedAlerts:4,  totalAlerts:5,  avgLatencyMs:28, endpoint:'(ext)',       sports:['cbb'],       credibility:64 },
  { id:'api-005', name:'Betfair Exchange',   key:'(free)', status:'live',  enabled:true,  successCalls:610,  totalCalls:700,  stdDevOdds:0.21, confirmedAlerts:9,  totalAlerts:14, avgLatencyMs:35, endpoint:'(ext)',       sports:['all'],       credibility:71 },
  { id:'api-006', name:'IBIA Alert Feed',    key:'(auth)', status:'live',  enabled:true,  successCalls:290,  totalCalls:300,  stdDevOdds:0.06, confirmedAlerts:22, totalAlerts:24, avgLatencyMs:22, endpoint:'(ext)',       sports:['all'],       credibility:89 },
  { id:'api-007', name:'NFL Injury Reports', key:'(free)', status:'live',  enabled:true,  successCalls:480,  totalCalls:500,  stdDevOdds:0.00, confirmedAlerts:6,  totalAlerts:7,  avgLatencyMs:18, endpoint:'(ext)',       sports:['nfl'],       credibility:79 },
  { id:'api-008', name:'DraftKings Props',   key:'(env)',  status:'error', enabled:false, successCalls:120,  totalCalls:400,  stdDevOdds:0.31, confirmedAlerts:2,  totalAlerts:18, avgLatencyMs:90, endpoint:'(ext)',       sports:['nfl'],       credibility:28 },
  { id:'api-009', name:'QuickBooks Finance', key:'(oauth)',status:'warn',  enabled:false, successCalls:80,   totalCalls:100,  stdDevOdds:0.00, confirmedAlerts:0,  totalAlerts:0,  avgLatencyMs:38, endpoint:'(ext)',       sports:['financial'], credibility:60 },
  { id:'api-010', name:'Rosetta Engine',     key:'(int)',  status:'live',  enabled:true,  successCalls:8200, totalCalls:8300, stdDevOdds:0.02, confirmedAlerts:48, totalAlerts:50, avgLatencyMs:8,  endpoint:'/rosetta',    sports:['all'],       credibility:96 },
]

// ─── Trend data ───────────────────────────────────────────────────────────────
export const TREND_DATA = [
  {m:'Oct 25',iri:67,alerts:39,cases:8}, {m:'Nov 25',iri:71,alerts:48,cases:11},
  {m:'Dec 25',iri:65,alerts:39,cases:9}, {m:'Jan 26',iri:74,alerts:53,cases:14},
  {m:'Feb 26',iri:79,alerts:63,cases:18},{m:'Mar 26',iri:83,alerts:71,cases:22},
]

export const COVERAGE_GAPS = [
  { region:'North Africa / MENA', tournaments:12, oversight:'Low',     iriAvg:78, risk:'Critical' },
  { region:'Eastern Europe',      tournaments:28, oversight:'Medium',  iriAvg:61, risk:'High'     },
  { region:'South America',       tournaments:31, oversight:'Low',     iriAvg:69, risk:'High'     },
  { region:'Southeast Asia',      tournaments:19, oversight:'Low',     iriAvg:74, risk:'Critical' },
  { region:'West Africa',         tournaments:8,  oversight:'Minimal', iriAvg:82, risk:'Critical' },
  { region:'Western Europe',      tournaments:89, oversight:'High',    iriAvg:38, risk:'Low'      },
]

export const INITIAL_MESSAGES = {
  'a.morgan|d.kim': [
    { id:'M-001', from:'d.kim',    to:'a.morgan', ts:'2026-03-31 14:00', text:'Duran case — Nexus Graph now shows Syndicate Alpha bridge actor. Escalate to Black.', read:true,  attachment:null },
    { id:'M-002', from:'a.morgan', to:'d.kim',    ts:'2026-03-31 14:22', text:'Done. Betfair export attached. Three coordinated accounts — 18min betting intervals.', read:true,  attachment:'betfair_export.csv' },
    { id:'M-003', from:'d.kim',    to:'a.morgan', ts:'2026-03-31 14:35', text:'Push to CAS evidence pack. Overwatch BLACK issued. Pre-match alert active.', read:false, attachment:null },
  ],
}

export const INITIAL_CLIENTS = [
  { id:'CLT-001', name:'International Tennis Integrity Agency', short:'ITIA', rate:185, rateType:'hourly', currency:'USD', taxRate:0, contact:'J. Robertson', email:'j.robertson@itia.tennis' },
  { id:'CLT-002', name:'NFL Security Division', short:'NFL-SEC', rate:220, rateType:'hourly', currency:'USD', taxRate:0, contact:'M. Harrison', email:'m.harrison@nfl.com' },
]

export const INITIAL_INVOICES = [
  { id:'INV-2026-001', clientId:'CLT-001', period:'March 2026', hours:42.5, amount:7862.50, tax:0, total:7862.50, status:'sent', due:'2026-04-15', issued:'2026-04-01' },
]
