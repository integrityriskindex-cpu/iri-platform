export const VERSION = '1.4.0'

// ─── Roles ────────────────────────────────────────────────────────────────────
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
  journalist:       { label:'Journalist',                 icon:'📰', color:'#6b7280', tier:4 },
}

export const ROLE_TABS = {
  god:              ['godmode','cases','messaging','timekeeping','invoicing','monitor','iri','analytics','api','alerts','security','help'],
  main_account:     ['cases','messaging','timekeeping','invoicing','monitor','iri','analytics','api','alerts','security','help'],
  supervisor:       ['cases','messaging','timekeeping','monitor','iri','analytics','alerts','workgroup','help'],
  special_agent:    ['cases','messaging','monitor','iri','alerts','workgroup','help'],
  regulator:        ['cases','monitor','api','analytics','alerts','help'],
  integrity_officer:['cases','monitor','iri','alerts','workgroup','help'],
  governance:       ['cases','monitor','analytics','alerts','help'],
  player:           ['iri','monitor','alerts','help'],
  gambler:          ['iri','monitor','alerts','help'],
  sportsbook:       ['monitor','api','alerts','help'],
  journalist:       ['monitor','analytics','help'],
}

// ─── API registry (God Mode togglable) ───────────────────────────────────────
export const INITIAL_APIS = [
  { id:'api-001', name:'Sportradar Tennis',  key:'g5352b…', status:'live',  enabled:true,  successCalls:4821, totalCalls:4900, stdDevOdds:0.08, confirmedAlerts:31, totalAlerts:35, avgLatencyMs:12, endpoint:'/sportradar', sports:['tennis'],    credibility:88 },
  { id:'api-002', name:'The Odds API',       key:'178ebf…', status:'live',  enabled:true,  successCalls:2931, totalCalls:3000, stdDevOdds:0.12, confirmedAlerts:18, totalAlerts:22, avgLatencyMs:18, endpoint:'/odds',       sports:['all'],       credibility:81 },
  { id:'api-003', name:'Sportradar NFL',     key:'g5352b…', status:'live',  enabled:true,  successCalls:1820, totalCalls:1900, stdDevOdds:0.11, confirmedAlerts:14, totalAlerts:16, avgLatencyMs:14, endpoint:'/nfl',        sports:['nfl'],       credibility:84 },
  { id:'api-004', name:'KenPom CBB',         key:'(sub)',   status:'warn',  enabled:true,  successCalls:310,  totalCalls:400,  stdDevOdds:0.05, confirmedAlerts:4,  totalAlerts:5,  avgLatencyMs:28, endpoint:'(ext)',       sports:['cbb'],       credibility:64 },
  { id:'api-005', name:'DraftKings Props',   key:'(env)',   status:'error', enabled:false, successCalls:120,  totalCalls:400,  stdDevOdds:0.31, confirmedAlerts:2,  totalAlerts:18, avgLatencyMs:90, endpoint:'(ext)',       sports:['nfl','nba'], credibility:28 },
  { id:'api-006', name:'Kalshi Pred Mkt',    key:'(free)',  status:'live',  enabled:true,  successCalls:490,  totalCalls:500,  stdDevOdds:0.10, confirmedAlerts:5,  totalAlerts:6,  avgLatencyMs:20, endpoint:'(ext)',       sports:['all'],       credibility:72 },
  { id:'api-007', name:'QuickBooks Finance', key:'(oauth)', status:'warn',  enabled:false, successCalls:80,   totalCalls:100,  stdDevOdds:0.00, confirmedAlerts:0,  totalAlerts:0,  avgLatencyMs:38, endpoint:'(ext)',       sports:['financial'], credibility:60 },
  { id:'api-008', name:'Yahoo Fantasy',      key:'(oauth)', status:'warn',  enabled:false, successCalls:220,  totalCalls:300,  stdDevOdds:0.00, confirmedAlerts:1,  totalAlerts:3,  avgLatencyMs:42, endpoint:'(ext)',       sports:['fantasy'],   credibility:55 },
  { id:'api-009', name:'NFL Injury Reports', key:'(free)',  status:'live',  enabled:true,  successCalls:480,  totalCalls:500,  stdDevOdds:0.00, confirmedAlerts:6,  totalAlerts:7,  avgLatencyMs:18, endpoint:'(ext)',       sports:['nfl'],       credibility:79 },
  { id:'api-010', name:'Betfair Exchange',   key:'(free)',  status:'live',  enabled:true,  successCalls:610,  totalCalls:700,  stdDevOdds:0.21, confirmedAlerts:9,  totalAlerts:14, avgLatencyMs:35, endpoint:'(ext)',       sports:['all'],       credibility:71 },
]

// ─── Cases (full v1.4 structure) ─────────────────────────────────────────────
export const INITIAL_CASES = [
  {
    id:'CASE-24017',
    title:'Cluster volatility ITF M15 Monastir',
    severity:'Critical', status:'Active', stage:'Evidence Review',
    assignee:'a.morgan', supervisor:'d.kim',
    iri:88, confidence:92, sport:'tennis',
    jurisdiction:'Tunisia', created:'2026-03-24', due:'2026-04-03',
    entities:['4 players','2 officials','3 bookmakers'],
    linkedCases:[], linkedDossiers:['D-001','D-003'],
    pendingApproval:false,
    // Notes
    notes:[
      { id:'N-001', type:'case_note', author:'a.morgan', role:'Special Agent', ts:'2026-03-24 09:15', text:'Initial alert received from Sportradar. Three bookmakers showing coordinated line movement 4 hours pre-match.', internal:false, signedOff:true, signedBy:'d.kim' },
      { id:'N-002', type:'interview_note', author:'a.morgan', role:'Special Agent', ts:'2026-03-25 14:30', text:'Phone interview with tournament director. Confirmed two players checked out of hotel at 02:00 the night before match.', internal:true, signedOff:false, signedBy:null },
    ],
    // Timeline
    timeline:[
      { id:'TL-001', ts:'2026-03-24 08:00', user:'SYSTEM',   type:'Alert Created',     icon:'🚨', color:'#ef4444', text:'IRI threshold breach: score 88. Automated alert generated.' },
      { id:'TL-002', ts:'2026-03-24 09:15', user:'a.morgan', type:'Case Opened',        icon:'📁', color:'#3b82f6', text:'Case file opened. Initial evidence collection begun.' },
      { id:'TL-003', ts:'2026-03-25 14:30', user:'a.morgan', type:'Interview Logged',   icon:'🎙️', color:'#8b5cf6', text:'Phone interview with tournament director. See interview notes.' },
      { id:'TL-004', ts:'2026-03-26 11:00', user:'d.kim',    type:'Supervisor Review',  icon:'🎖️', color:'#f97316', text:'Reviewed initial evidence. Approved escalation to Evidence Review stage.' },
    ],
    // Evidence files
    files:[
      { id:'F-001', name:'betting_data_export.csv',  type:'data',       size:'2.4 MB', uploadedBy:'a.morgan', ts:'2026-03-24 10:00', description:'Raw odds data from 3 bookmakers' },
      { id:'F-002', name:'hotel_cctv_screenshot.jpg',type:'image',      size:'1.1 MB', uploadedBy:'a.morgan', ts:'2026-03-25 16:00', description:'Hotel lobby CCTV 02:14 AM' },
      { id:'F-003', name:'phone_interview_audio.mp3',type:'audio',      size:'8.2 MB', uploadedBy:'a.morgan', ts:'2026-03-25 15:00', description:'Tournament director interview recording' },
    ],
    // Phone log
    phoneLog:[
      { id:'PH-001', number:'+216-XX-XXX-XXX', contact:'Tournament Director', date:'2026-03-25', time:'14:30', duration:'22 min', notes:'Confirmed hotel departure. Willing to cooperate.' },
    ],
    // Stakeout log
    stakeoutLog:[],
    // Leads
    leads:[],
    // Governance infractions
    infractions:[],
    // Trackers
    trackers:[],
    // Time logs
    timeLogs:[
      { agent:'a.morgan', date:'2026-03-24', hours:3.5, description:'Initial evidence review and case opening', approved:true },
      { agent:'a.morgan', date:'2026-03-25', hours:4.0, description:'Interview + file compilation', approved:false },
    ],
  },
  {
    id:'CASE-24011',
    title:'NFL Prop anomaly — practice squad WR',
    severity:'High', status:'Open', stage:'Triage',
    assignee:'s.patel', supervisor:'d.kim',
    iri:76, confidence:81, sport:'nfl',
    jurisdiction:'USA', created:'2026-03-19', due:'2026-04-06',
    entities:['1 player','2 bookmakers'],
    linkedCases:[], linkedDossiers:['D-005'],
    pendingApproval:false,
    notes:[], timeline:[
      { id:'TL-001', ts:'2026-03-19 10:00', user:'SYSTEM', type:'Alert Created', icon:'🚨', color:'#ef4444', text:'NFL prop volume spike: +3740% above baseline. Injury latency: 90 min.' },
    ],
    files:[], phoneLog:[], stakeoutLog:[], leads:[], infractions:[], trackers:[], timeLogs:[],
  },
]

// ─── Informants ───────────────────────────────────────────────────────────────
export const INITIAL_INFORMANTS = [
  {
    id:'INF-001', caseId:'CASE-24017', codeName:'FALCON',
    status:'witness', authLevel:2,
    notes:'Observed coordinated cash exchanges near tournament hotel bar night before match.',
    files:[], ts:'2026-03-25 22:00', addedBy:'a.morgan',
    unlockedBy:[], // requires multi-auth to reveal identity
  },
]

// ─── Secure messages ──────────────────────────────────────────────────────────
export const INITIAL_MESSAGES = {
  'a.morgan|d.kim': [
    { id:'M-001', from:'d.kim',    to:'a.morgan', ts:'2026-03-31 14:00', text:'Check the Sportradar feed for any additional markets flagged in the last 6 hours. Also pull the Betfair exchange volume on M-001.', read:true,  attachment:null },
    { id:'M-002', from:'a.morgan', to:'d.kim',    ts:'2026-03-31 14:22', text:"Done. Betfair shows £280K matched in 3 hours — that's abnormal for ITF level. I've attached the export.", read:true,  attachment:'betfair_export.csv' },
    { id:'M-003', from:'d.kim',    to:'a.morgan', ts:'2026-03-31 14:35', text:"Good work. Mark this as priority for tomorrow's brief. Escalate to main account if IRI hits 90.", read:false, attachment:null },
  ],
}

// ─── Clients / billing ────────────────────────────────────────────────────────
export const INITIAL_CLIENTS = [
  { id:'CLT-001', name:'International Tennis Integrity Agency', short:'ITIA', rate:185, rateType:'hourly', currency:'USD', taxRate:0, contact:'J. Robertson', email:'j.robertson@itia.tennis' },
  { id:'CLT-002', name:'NFL Security Division', short:'NFL-SEC', rate:220, rateType:'hourly', currency:'USD', taxRate:0, contact:'M. Harrison', email:'m.harrison@nfl.com' },
  { id:'CLT-003', name:'State Gaming Commission — NV', short:'SGC-NV', rate:3500, rateType:'monthly', currency:'USD', taxRate:0.086, contact:'R. Flores', email:'r.flores@gaming.nv.gov' },
]

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const INITIAL_INVOICES = [
  { id:'INV-2026-001', clientId:'CLT-001', period:'March 2026', hours:42.5, amount:7862.50, tax:0, total:7862.50, status:'sent',    due:'2026-04-15', issued:'2026-04-01' },
  { id:'INV-2026-002', clientId:'CLT-002', period:'Q1 2026',    hours:18.0, amount:3960.00, tax:0, total:3960.00, status:'draft',   due:'2026-04-30', issued:'2026-04-01' },
  { id:'INV-2026-003', clientId:'CLT-003', period:'March 2026', hours:0,    amount:3500.00, tax:301, total:3801.00, status:'paid',  due:'2026-04-01', issued:'2026-03-01' },
]

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const INITIAL_ALERTS = [
  { id:'ALT-001', matchId:'T-001', sport:'tennis', type:'Betting Spike',    severity:'Critical', message:'210% above-baseline volume on ITF M25 Antalya. IRI: 94.', ts:'2026-03-31 14:22', read:false, emailSent:true  },
  { id:'ALT-002', matchId:'N-003', sport:'nfl',    type:'Injury Latency',   severity:'Critical', message:'90min gap — offshore prop volume +412% vs DraftKings.', ts:'2026-03-31 13:55', read:false, emailSent:true  },
  { id:'ALT-003', matchId:'C-002', sport:'cfb',    type:'ATS Residual',     severity:'High',     message:'MAC game won by 1pt vs 10pt spread. Third instance.', ts:'2026-03-31 12:10', read:false, emailSent:false },
  { id:'ALT-004', matchId:'T-002', sport:'tennis', type:'Dispersion',       severity:'High',     message:'22pt bookmaker dispersion — ATP Challenger Tunis.', ts:'2026-03-30 17:44', read:true,  emailSent:false },
]

// ─── Matches (simplified for v1.4) ───────────────────────────────────────────
export const MOCK_MATCHES = {
  tennis:[
    { id:'T-001', p1:'R. Duran',  p2:'T. Ikeda',    event:'ITF M25 Antalya',    tier:'itf',        favOdds:1.19, dogOdds:4.95, rankingGap:11, surface:'Clay',   volume:'$1.2M', movement:'+210%' },
    { id:'T-002', p1:'J. Novak',  p2:'A. Vale',     event:'ATP Challenger Tunis',tier:'challenger', favOdds:1.44, dogOdds:2.88, rankingGap:39, surface:'Hard',   volume:'$420K', movement:'+38%'  },
    { id:'T-003', p1:'L. Hart',   p2:'M. Sato',     event:'WTA 250 Bogotá',     tier:'tour_250',   favOdds:1.31, dogOdds:3.35, rankingGap:21, surface:'Clay',   volume:'$185K', movement:'Stable'},
    { id:'T-004', p1:'Y. Tanaka', p2:'B. Okafor',   event:'ITF M15 Cairo',      tier:'itf',        favOdds:1.22, dogOdds:4.20, rankingGap:8,  surface:'Clay',   volume:'$890K', movement:'+310%' },
  ],
  nfl:[
    { id:'N-001', p1:'Kansas City Chiefs', p2:'Las Vegas Raiders', event:'NFL Week 14', tier:'starter',        favOdds:1.28, dogOdds:4.00, volume:'$2.1M', movement:'+12%' },
    { id:'N-002', p1:'SF 49ers',           p2:'Seattle Seahawks',  event:'NFL Week 14', tier:'practice_squad', favOdds:1.55, dogOdds:2.50, volume:'$180K', movement:'+380%' },
  ],
}

export const TREND_DATA = [
  {m:'Oct 25',iri:67,alerts:39},{m:'Nov 25',iri:71,alerts:48},{m:'Dec 25',iri:65,alerts:39},
  {m:'Jan 26',iri:74,alerts:53},{m:'Feb 26',iri:79,alerts:63},{m:'Mar 26',iri:83,alerts:71},
]

export const SPORTS_CONFIG = {
  tennis:    { label:'Tennis (ATP/WTA)',   icon:'🎾' },
  nfl:       { label:'NFL',                icon:'🏈' },
  cfb:       { label:'College Football',   icon:'🏈' },
  cbb:       { label:'College Basketball', icon:'🏀' },
  baseball:  { label:'Baseball (MLB)',     icon:'⚾' },
  hockey:    { label:'Hockey (NHL)',       icon:'🏒' },
  golf_pga:  { label:'Golf — PGA Tour',    icon:'⛳' },
  golf_liv:  { label:'Golf — LIV Tour',    icon:'⛳' },
  soccer_epl:{ label:'Soccer — EPL',       icon:'⚽' },
  soccer_mls:{ label:'Soccer — MLS',       icon:'⚽' },
  wnba:      { label:'WNBA',               icon:'🏀' },
  college_volleyball:{ label:'College Volleyball', icon:'🏐' },
}
