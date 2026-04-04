// ─────────────────────────────────────────────────────────────────────────────
// IRI v1.5 — LocalStorage Persistence Layer
//
// Replaces in-memory React state with persistent localStorage storage.
// All cases, notes, timeline entries, files, stakeout logs, leads, time logs,
// invoices, and settings survive page refreshes and browser closes.
//
// Production path: swap these functions to call your DynamoDB Lambda APIs.
// The function signatures stay identical — only the internals change.
// ─────────────────────────────────────────────────────────────────────────────

const PREFIX = 'iri_v15_'
const KEYS = {
  cases:      PREFIX + 'cases',
  clients:    PREFIX + 'clients',
  invoices:   PREFIX + 'invoices',
  messages:   PREFIX + 'messages',
  alerts:     PREFIX + 'alerts',
  apis:       PREFIX + 'apis',
  settings:   PREFIX + 'settings',
  dismissed:  PREFIX + 'triage_dismissed',
}

// ── Generic get/set helpers ───────────────────────────────────────────────────
function get(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error('[IRI Store] write error:', e)
    return false
  }
}

// ── Cases ────────────────────────────────────────────────────────────────────
export function loadCases(initialCases) {
  return get(KEYS.cases, initialCases)
}

export function saveCases(cases) {
  set(KEYS.cases, cases)
}

export function saveCase(updatedCase, allCases) {
  const next = allCases.map(c => c.id === updatedCase.id ? updatedCase : c)
  set(KEYS.cases, next)
  return next
}

// ── Clients ──────────────────────────────────────────────────────────────────
export function loadClients(initialClients) {
  return get(KEYS.clients, initialClients)
}

export function saveClients(clients) {
  set(KEYS.clients, clients)
}

// ── Invoices ─────────────────────────────────────────────────────────────────
export function loadInvoices(initialInvoices) {
  return get(KEYS.invoices, initialInvoices)
}

export function saveInvoices(invoices) {
  set(KEYS.invoices, invoices)
}

// ── Messages ─────────────────────────────────────────────────────────────────
export function loadMessages(initialMessages) {
  return get(KEYS.messages, initialMessages)
}

export function saveMessages(messages) {
  set(KEYS.messages, messages)
}

// ── Alerts ───────────────────────────────────────────────────────────────────
export function loadAlerts(initialAlerts) {
  return get(KEYS.alerts, initialAlerts)
}

export function saveAlerts(alerts) {
  set(KEYS.alerts, alerts)
}

// ── API registry (God Mode on/off toggles) ────────────────────────────────────
export function loadApis(initialApis) {
  const saved = get(KEYS.apis, null)
  if (!saved) return initialApis
  // Merge saved enabled/status with initial data (preserves new APIs added in code)
  return initialApis.map(api => {
    const s = saved.find(x => x.id === api.id)
    return s ? { ...api, enabled: s.enabled, status: s.status } : api
  })
}

export function saveApis(apis) {
  // Only persist enabled/status — don't store keys
  set(KEYS.apis, apis.map(a => ({ id: a.id, enabled: a.enabled, status: a.status })))
}

// ── Triage dismissed items ────────────────────────────────────────────────────
export function loadDismissed() {
  return get(KEYS.dismissed, [])
}

export function saveDismissed(dismissed) {
  set(KEYS.dismissed, dismissed)
}

// ── App settings ─────────────────────────────────────────────────────────────
export function loadSettings() {
  return get(KEYS.settings, {
    defaultSport:    'tennis',
    alertThreshold:  70,
    emailAlerts:     true,
    darkMode:        true,
    orgName:         '',
    orgAddress:      '',
    signatory:       '',
    signatoryTitle:  '',
  })
}

export function saveSettings(settings) {
  set(KEYS.settings, settings)
}

// ── Full reset (for testing / God Mode) ──────────────────────────────────────
export function clearAllData() {
  Object.values(KEYS).forEach(k => { try { localStorage.removeItem(k) } catch {} })
}

// ── Export all data (backup) ──────────────────────────────────────────────────
export function exportAllData() {
  const data = {}
  Object.entries(KEYS).forEach(([name, key]) => {
    data[name] = get(key, null)
  })
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a    = document.createElement('a')
  a.href     = URL.createObjectURL(blob)
  a.download = `iri_backup_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
}

// ── Import data (restore from backup) ────────────────────────────────────────
export function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString)
    Object.entries(KEYS).forEach(([name, key]) => {
      if (data[name] !== undefined) set(key, data[name])
    })
    return { success: true }
  } catch (e) {
    return { success: false, error: e.message }
  }
}
