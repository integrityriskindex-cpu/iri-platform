// ─────────────────────────────────────────────────────────────────────────────
// IRI v1.5.1 — Persistence Layer
// All data persists in localStorage. Cases support soft-delete + recovery.
// ─────────────────────────────────────────────────────────────────────────────

const P = 'iri_v151_'
const K = {
  cases:      P+'cases',
  archived:   P+'cases_archived',
  clients:    P+'clients',
  invoices:   P+'invoices',
  messages:   P+'messages',
  alerts:     P+'alerts',
  apis:       P+'apis',
  settings:   P+'settings',
  dismissed:  P+'triage_dismissed',
  retention:  P+'retention',
}

const get  = (key, fb) => { try { const r=localStorage.getItem(key); return r===null?fb:JSON.parse(r) } catch { return fb } }
const set  = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); return true } catch { return false } }

// ── Cases (active) ─────────────────────────────────────────────────────────
export const loadCases    = ()          => get(K.cases, [])    // starts EMPTY
export const saveCases    = (cases)     => set(K.cases, cases)
export const addCase      = (c)         => { const cs=[...loadCases(),c]; saveCases(cs); return cs }
export const updateCase   = (id, fn)    => { const cs=loadCases().map(c=>c.id===id?fn(c):c); saveCases(cs); return cs }
export const getCase      = (id)        => loadCases().find(c=>c.id===id)

// ── Case soft-delete + recovery ────────────────────────────────────────────
export function archiveCase(id) {
  const cases    = loadCases()
  const target   = cases.find(c=>c.id===id)
  if (!target) return
  const archived = [...loadArchivedCases(), { ...target, archivedAt: new Date().toISOString() }]
  set(K.archived, archived)
  saveCases(cases.filter(c=>c.id!==id))
}

export const loadArchivedCases  = ()   => get(K.archived, [])
export const purgeArchivedCase  = (id) => set(K.archived, loadArchivedCases().filter(c=>c.id!==id))

export function restoreCase(id) {
  const archived = loadArchivedCases()
  const target   = archived.find(c=>c.id===id)
  if (!target) return
  const { archivedAt, ...restored } = target
  addCase({ ...restored, status:'Restored', restoredAt: new Date().toISOString() })
  set(K.archived, archived.filter(c=>c.id!==id))
}

// ── Clients ────────────────────────────────────────────────────────────────
export const loadClients  = ()          => get(K.clients, [])  // starts EMPTY
export const saveClients  = (c)         => set(K.clients, c)
export const addClient    = (c)         => { const cs=[...loadClients(),c]; saveClients(cs); return cs }
export const updateClient = (id, fn)    => { const cs=loadClients().map(c=>c.id===id?fn(c):c); saveClients(cs); return cs }
export const deleteClient = (id)        => { saveClients(loadClients().filter(c=>c.id!==id)) }

// ── Invoices ───────────────────────────────────────────────────────────────
export const loadInvoices  = ()         => get(K.invoices, []) // starts EMPTY
export const saveInvoices  = (i)        => set(K.invoices, i)
export const addInvoice    = (inv)      => { const is=[...loadInvoices(),inv]; saveInvoices(is); return is }
export const updateInvoice = (id, fn)   => { const is=loadInvoices().map(i=>i.id===id?fn(i):i); saveInvoices(is); return is }

// ── Messages ───────────────────────────────────────────────────────────────
export const loadMessages  = ()         => get(K.messages, {})
export const saveMessages  = (m)        => set(K.messages, m)

// ── Alerts ─────────────────────────────────────────────────────────────────
export const loadAlerts    = ()         => get(K.alerts, [])
export const saveAlerts    = (a)        => set(K.alerts, a)

// ── API registry ───────────────────────────────────────────────────────────
export const loadApis = (initial) => {
  const saved = get(K.apis, null)
  if (!saved) return initial
  return initial.map(a => { const s=saved.find(x=>x.id===a.id); return s?{...a,enabled:s.enabled,status:s.status}:a })
}
export const saveApis = (apis) => set(K.apis, apis.map(a=>({id:a.id,enabled:a.enabled,status:a.status})))

// ── Triage dismissed ───────────────────────────────────────────────────────
export const loadDismissed  = ()        => get(K.dismissed, [])
export const saveDismissed  = (d)       => set(K.dismissed, d)

// ── Records retention settings ─────────────────────────────────────────────
export const DEFAULT_RETENTION = {
  casesMonths:    84,   // 7 years
  invoicesMonths: 84,
  messagesMonths: 24,
  alertsMonths:   12,
  auditMonths:    120,  // 10 years
  evidenceYears:  10,
  autoArchive:    true,
  archiveAfterDays: 365,
}

export const loadRetention  = ()        => ({ ...DEFAULT_RETENTION, ...get(K.retention, {}) })
export const saveRetention  = (r)       => set(K.retention, r)

// ── App settings ───────────────────────────────────────────────────────────
export const loadSettings   = ()        => get(K.settings, {
  orgName:'', orgAddress:'', orgPhone:'', orgEmail:'', orgWebsite:'',
  signatory:'', signatoryTitle:'', signatoryEmail:'',
  defaultSport:'tennis', alertThreshold:70,
  currency:'USD', taxIdLabel:'Tax ID', taxId:'',
  invoicePrefix:'INV', casePrefix:'CASE',
  footerText:'This document is confidential.',
})
export const saveSettings   = (s)       => set(K.settings, s)

// ── Full export (backup) ───────────────────────────────────────────────────
export function exportBackup() {
  const data = {}
  Object.entries(K).forEach(([name,key]) => { data[name] = get(key, null) })
  const blob = new Blob([JSON.stringify(data,null,2)], { type:'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `iri_backup_${new Date().toISOString().slice(0,10)}.json`
  a.click()
}

export function importBackup(jsonStr) {
  try {
    const data = JSON.parse(jsonStr)
    Object.entries(K).forEach(([name,key]) => { if(data[name]!==undefined) set(key, data[name]) })
    return { success:true }
  } catch(e) { return { success:false, error:e.message } }
}

export function clearAllAppData() {
  Object.values(K).forEach(k => { try { localStorage.removeItem(k) } catch {} })
}

// ── Informants ─────────────────────────────────────────────────────────────
const KI = {
  informants: P+'informants',
  informantPins: P+'inf_pins',
}
export const loadInformants   = ()       => get(KI.informants, [])
export const saveInformants   = (i)      => set(KI.informants, i)
export const addInformant     = (inf)    => { const is=[...loadInformants(),inf]; saveInformants(is); return is }
export const updateInformant  = (id,fn)  => { const is=loadInformants().map(i=>i.id===id?fn(i):i); saveInformants(is); return is }

// Informant PINs stored separately (only God/Main can set)
export const loadInformantPins = ()      => get(KI.informantPins, {})
export const setInformantPin  = (userId, pin) => {
  const pins = loadInformantPins()
  set(KI.informantPins, { ...pins, [userId]: pin })
}
export const verifyInformantPin = (userId, pin) => {
  const pins = loadInformantPins()
  return pins[userId] === pin
}

// ── Trackers ────────────────────────────────────────────────────────────────
const KT = { trackers: P+'trackers' }
export const loadTrackers  = ()       => get(KT.trackers, [])
export const saveTrackers  = (t)      => set(KT.trackers, t)
export const addTracker    = (t)      => { const ts=[...loadTrackers(),t]; saveTrackers(ts); return ts }
export const updateTracker = (id, fn) => { const ts=loadTrackers().map(t=>t.id===id?fn(t):t); saveTrackers(ts); return ts }
export const deleteTracker = (id)     => { saveTrackers(loadTrackers().filter(t=>t.id!==id)) }

// ── Dossiers ────────────────────────────────────────────────────────────────
const KD = { dossiers: P+'dossiers' }
export const loadDossiers  = ()       => get(KD.dossiers, [])
export const saveDossiers  = (d)      => set(KD.dossiers, d)
export const addDossier    = (d)      => { const ds=[...loadDossiers(),d]; saveDossiers(ds); return ds }
export const updateDossier = (id, fn) => { const ds=loadDossiers().map(d=>d.id===id?fn(d):d); saveDossiers(ds); return ds }
export const deleteDossier = (id)     => { saveDossiers(loadDossiers().filter(d=>d.id!==id)) }

// ── Sandbox Mode ────────────────────────────────────────────────────────────
const KSB = { sandboxAccounts: P+'sandbox_accounts', sandboxData: P+'sandbox_data', liveMode: P+'live_mode' }
export const loadSandboxAccounts = ()        => get(KSB.sandboxAccounts, [])
export const saveSandboxAccounts = (a)       => set(KSB.sandboxAccounts, a)
export const enableSandbox  = (userId)       => { const a=loadSandboxAccounts(); if(!a.includes(userId))saveSandboxAccounts([...a,userId]) }
export const disableSandbox = (userId)       => saveSandboxAccounts(loadSandboxAccounts().filter(id=>id!==userId))
export const isSandboxUser  = (userId)       => loadSandboxAccounts().includes(userId)
export const loadLiveMode   = ()             => get(KSB.liveMode, false)
export const saveLiveMode   = (v)            => set(KSB.liveMode, v)

// ── Known Associates ─────────────────────────────────────────────────────────
const KA = { associates: P+'associates' }
export const loadAssociates  = ()            => get(KA.associates, [])
export const saveAssociates  = (a)           => set(KA.associates, a)
export const addAssociate    = (a)           => { const as=[...loadAssociates(),a]; saveAssociates(as); return as }
export const updateAssociate = (id, fn)      => { const as=loadAssociates().map(a=>a.id===id?fn(a):a); saveAssociates(as); return as }
export const deleteAssociate = (id)          => { saveAssociates(loadAssociates().filter(a=>a.id!==id)) }

// ── Sharp Bettors (Sportsbook) ───────────────────────────────────────────────
const KBT = { bettors: P+'sharp_bettors' }
export const loadBettors  = ()               => get(KBT.bettors, [])
export const saveBettors  = (b)              => set(KBT.bettors, b)
export const addBettor    = (b)              => { const bs=[...loadBettors(),b]; saveBettors(bs); return bs }
export const updateBettor = (id, fn)         => { const bs=loadBettors().map(b=>b.id===id?fn(b):b); saveBettors(bs); return bs }

// ── Workgroup / Team Board ────────────────────────────────────────────────────
const KW = { posts: P+'workgroup_posts' }
export const loadPosts  = ()                 => get(KW.posts, [])
export const savePosts  = (p)               => set(KW.posts, p)
export const addPost    = (p)               => { const ps=[...loadPosts(),p]; savePosts(ps); return ps }

// ── Features API Registry ─────────────────────────────────────────────────────
const KF = { featureApis: P+'feature_apis', sportApis: P+'sport_apis' }
export const loadFeatureApis  = ()           => get(KF.featureApis, [])
export const saveFeatureApis  = (a)          => set(KF.featureApis, a)
export const loadSportApis    = ()           => get(KF.sportApis, {})
export const saveSportApis    = (a)          => set(KF.sportApis, a)

// ── Data Point Selections ─────────────────────────────────────────────────────
const KDP = { dataPoints: P+'data_points' }
export const loadDataPoints   = ()           => get(KDP.dataPoints, { iri:true, odds:true, volume:true, rankings:true, weather:true, injuries:true, social:true, travel:true, financial:true })
export const saveDataPoints   = (d)          => set(KDP.dataPoints, d)

// ── ROI / Case Cost Tracking ──────────────────────────────────────────────────
export function getCaseROI(caseId, invoices, timeLogs=[]) {
  const caseInvoices = invoices.filter(i=>i.caseId===caseId)
  const billed = caseInvoices.reduce((s,i)=>s+(i.total||0),0)
  const hours   = timeLogs.reduce((s,t)=>s+(t.hours||0),0)
  return { billed, hours, roi: billed > 0 ? ((billed / Math.max(hours*150,1))*100).toFixed(0) : 0 }
}
