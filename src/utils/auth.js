// ─────────────────────────────────────────────────────────────────────────────
// IRI v1.5.1 — Dynamic User Authentication + Management
// Users are stored in localStorage and managed entirely through God Mode UI.
// No hardcoded users except the bootstrap admin (first-run only).
// ─────────────────────────────────────────────────────────────────────────────

const USERS_KEY   = 'iri_users_v151'
const SESSION_KEY = 'iri_session_v151'
const AUTH_LOG    = 'iri_auth_log_v151'
const SESSION_TTL = 8 * 60 * 60 * 1000  // 8 hours

export const ALL_ROLES = {
  god:               { label:'Integrity Chief (God Mode)', icon:'👁️', color:'#a855f7' },
  main_account:      { label:'Main Account',               icon:'🏛️', color:'#ef4444' },
  supervisor:        { label:'Supervisor',                 icon:'🎖️', color:'#f97316' },
  special_agent:     { label:'Special Agent',              icon:'🕵️', color:'#eab308' },
  regulator:         { label:'Regulator',                  icon:'⚖️', color:'#22c55e' },
  integrity_officer: { label:'Integrity Officer',          icon:'🛡️', color:'#84cc16' },
  governance:        { label:'Sports Governance',          icon:'🏟️', color:'#06b6d4' },
  sportsbook:        { label:'Sportsbook',                 icon:'📊', color:'#ec4899' },
}

export const ALL_SPORTS = [
  { id:'tennis',    label:'Tennis (ATP/WTA)', icon:'🎾' },
  { id:'nfl',       label:'NFL',              icon:'🏈' },
  { id:'cfb',       label:'College Football', icon:'🏈' },
  { id:'cbb',       label:'College Basketball',icon:'🏀' },
  { id:'baseball',  label:'Baseball (MLB)',   icon:'⚾' },
  { id:'hockey',    label:'Hockey (NHL)',     icon:'🏒' },
  { id:'golf_pga',  label:'Golf — PGA',      icon:'⛳' },
  { id:'golf_liv',  label:'Golf — LIV',      icon:'⛳' },
  { id:'soccer_epl',label:'Soccer — EPL',    icon:'⚽' },
  { id:'soccer_mls',label:'Soccer — MLS',    icon:'⚽' },
  { id:'wnba',      label:'WNBA',             icon:'🏀' },
  { id:'college_volleyball',label:'College Volleyball',icon:'🏐' },
]

// ── SHA-256 (browser native) ──────────────────────────────────────────────────
export async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2,'0')).join('')
}

// ── Bootstrap: create first-run admin if no users exist ───────────────────────
async function bootstrap() {
  const existing = loadAllUsers()
  if (existing.length > 0) return
  const hash = await sha256('IntegrityConf24!')
  const admin = {
    id:          'usr_admin',
    username:    'IntegrityChief',
    passwordHash: hash,
    role:        'god',
    displayName: 'Integrity Chief',
    email:       '',
    sports:      ALL_SPORTS.map(s => s.id), // all sports
    active:      true,
    frozen:      false,
    createdAt:   new Date().toISOString(),
    lastLogin:   null,
    notes:       'Bootstrap administrator — change password immediately',
  }
  saveAllUsers([admin])
}

// ── User storage ──────────────────────────────────────────────────────────────
export function loadAllUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}

export function saveAllUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)) } catch {}
}

// ── CRUD operations (used by God Mode UI) ─────────────────────────────────────
export async function createUser({ username, password, role, displayName, email, sports, notes }) {
  const users = loadAllUsers()
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, error: 'Username already exists.' }
  }
  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' }
  }
  const hash = await sha256(password)
  const user = {
    id:          `usr_${Date.now()}`,
    username:    username.trim(),
    passwordHash: hash,
    role:        role || 'special_agent',
    displayName: displayName || username,
    email:       email || '',
    sports:      sports || ALL_SPORTS.map(s => s.id),
    active:      true,
    frozen:      false,
    createdAt:   new Date().toISOString(),
    lastLogin:   null,
    notes:       notes || '',
  }
  saveAllUsers([...users, user])
  return { success: true, user }
}

export async function updateUser(id, changes) {
  const users = loadAllUsers()
  const idx   = users.findIndex(u => u.id === id)
  if (idx === -1) return { success: false, error: 'User not found.' }
  users[idx] = { ...users[idx], ...changes, id }
  saveAllUsers(users)
  return { success: true, user: users[idx] }
}

export async function setPassword(id, newPassword) {
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' }
  }
  const hash = await sha256(newPassword)
  return updateUser(id, { passwordHash: hash })
}

export function freezeUser(id)   { return updateUser(id, { frozen: true,  active: false }) }
export function unfreezeUser(id) { return updateUser(id, { frozen: false, active: true  }) }
export function deleteUser(id) {
  const users = loadAllUsers().filter(u => u.id !== id)
  saveAllUsers(users)
  return { success: true }
}

// ── Session management ────────────────────────────────────────────────────────
export function saveSession(user) {
  const session = { user, expires: Date.now() + SESSION_TTL, version:'1.5.1' }
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)) } catch {}
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    if (s.expires < Date.now()) { localStorage.removeItem(SESSION_KEY); return null }
    return s.user
  } catch { return null }
}

export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY) } catch {}
}

// ── Auth log ──────────────────────────────────────────────────────────────────
function logAuth(username, event, success) {
  const entry = { ts: new Date().toISOString(), username, event, success }
  try {
    const logs = JSON.parse(localStorage.getItem(AUTH_LOG) || '[]')
    logs.unshift(entry)
    localStorage.setItem(AUTH_LOG, JSON.stringify(logs.slice(0, 500)))
  } catch {}
}

export function getAuthLog() {
  try { return JSON.parse(localStorage.getItem(AUTH_LOG) || '[]') } catch { return [] }
}

// ── Main login ────────────────────────────────────────────────────────────────
export async function authenticate(username, password) {
  await bootstrap()

  const trimUser = (username || '').trim()
  if (!trimUser || !password) {
    return { success: false, error: 'Username and password are required.' }
  }

  const users = loadAllUsers()
  const user  = users.find(u => u.username.toLowerCase() === trimUser.toLowerCase())

  if (!user) {
    logAuth(trimUser, 'LOGIN_FAIL_NO_USER', false)
    return { success: false, error: 'Invalid credentials. Contact your administrator for access.' }
  }
  if (user.frozen) {
    logAuth(trimUser, 'LOGIN_FAIL_FROZEN', false)
    return { success: false, error: 'This account has been suspended. Contact your administrator.' }
  }
  if (!user.active) {
    logAuth(trimUser, 'LOGIN_FAIL_INACTIVE', false)
    return { success: false, error: 'Account inactive. Contact your administrator.' }
  }

  const hash = await sha256(password)
  if (hash !== user.passwordHash) {
    logAuth(trimUser, 'LOGIN_FAIL_WRONG_PW', false)
    return { success: false, error: 'Invalid credentials.' }
  }

  // Update last login
  updateUser(user.id, { lastLogin: new Date().toISOString() })
  logAuth(trimUser, 'LOGIN_SUCCESS', true)

  const sessionUser = {
    id:          user.id,
    username:    user.username,
    displayName: user.displayName,
    role:        user.role,
    sports:      user.sports || ALL_SPORTS.map(s => s.id),
    email:       user.email,
    loginTime:   new Date().toISOString(),
  }
  saveSession(sessionUser)
  return { success: true, user: sessionUser }
}
