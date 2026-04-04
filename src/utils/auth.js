// ─────────────────────────────────────────────────────────────────────────────
// IRI v1.5 — Real User Authentication
//
// HOW TO ADD / CHANGE USERS:
//   1. Generate a hash: open browser console and run:
//      crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword'))
//        .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
//   2. Paste the hex string as the passwordHash below.
//   3. Redeploy to Amplify (git push).
//
// For production: replace this entire file with AWS Cognito (see COGNITO_SETUP.md)
// ─────────────────────────────────────────────────────────────────────────────

// SHA-256 hashes of passwords — never store plain text
// To generate: in browser console: 
//   async function h(p){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(p));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
//   h('yourpassword').then(console.log)

const USER_DB = [
  // ── CHANGE THESE PASSWORDS — generate new hashes using the method above ──
  {
    username:     'IntegrityChief',
    // Password: IntegrityConf24!
    passwordHash: '49b3fd95830a3d04f3185c7b44c4ee7ccef40c293de9e09b73685f5abcecb19d', // placeholder — SHA-1, replace with SHA-256
    role:         'god',
    displayName:  'System Administrator',
    mfa:          false,
    active:       true,
  },
  {
    username:     'd.kim',
    // Password: replace with your own hash
    passwordHash: 'REPLACE_WITH_SHA256_HASH',
    role:         'supervisor',
    displayName:  'D. Kim',
    mfa:          false,
    active:       true,
  },
  {
    username:     'a.morgan',
    passwordHash: 'REPLACE_WITH_SHA256_HASH',
    role:         'special_agent',
    displayName:  'A. Morgan',
    mfa:          false,
    active:       true,
  },
  {
    username:     'regulator',
    passwordHash: 'REPLACE_WITH_SHA256_HASH',
    role:         'regulator',
    displayName:  'ITIA Regulator',
    mfa:          false,
    active:       true,
  },
]

// ── SHA-256 hash function (browser native, no dependencies) ──────────────────
async function sha256(str) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('')
}

// ── Session management (localStorage) ────────────────────────────────────────
const SESSION_KEY = 'iri_session_v15'
const SESSION_TTL = 8 * 60 * 60 * 1000 // 8 hours

export function saveSession(user) {
  const session = { user, expires: Date.now() + SESSION_TTL, version: '1.5.0' }
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)) } catch {}
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (session.expires < Date.now()) { localStorage.removeItem(SESSION_KEY); return null }
    return session.user
  } catch { return null }
}

export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY) } catch {}
}

// ── Audit log ────────────────────────────────────────────────────────────────
function logAuthEvent(username, event, success) {
  const entry = { ts: new Date().toISOString(), username, event, success, ua: navigator.userAgent.slice(0, 80) }
  try {
    const logs = JSON.parse(localStorage.getItem('iri_auth_log') || '[]')
    logs.unshift(entry)
    localStorage.setItem('iri_auth_log', JSON.stringify(logs.slice(0, 200))) // keep last 200
  } catch {}
  console.log('[IRI Auth]', entry)
}

// ── Main authenticate function ────────────────────────────────────────────────
export async function authenticate(username, password) {
  const trimUser = (username || '').trim().toLowerCase()

  if (!trimUser || !password) {
    return { success: false, error: 'Username and password are required.' }
  }

  // Find user
  const user = USER_DB.find(u => u.username.toLowerCase() === trimUser)

  if (!user) {
    logAuthEvent(trimUser, 'LOGIN_ATTEMPT', false)
    // Generic error — don't reveal whether username exists
    return { success: false, error: 'Invalid credentials. Contact your administrator if you need access.' }
  }

  if (!user.active) {
    logAuthEvent(trimUser, 'LOGIN_DISABLED', false)
    return { success: false, error: 'Account is disabled. Contact your administrator.' }
  }

  // Hash the entered password and compare
  const hash = await sha256(password)

  // NOTE: remove this check once you've set real hashes
  const isPlaceholder = user.passwordHash === 'REPLACE_WITH_SHA256_HASH' || user.passwordHash.length < 60
  if (isPlaceholder) {
    logAuthEvent(trimUser, 'LOGIN_NO_HASH_SET', false)
    return { success: false, error: 'This account has no password configured. Ask your administrator to set a password hash in auth.js.' }
  }

  if (hash !== user.passwordHash) {
    logAuthEvent(trimUser, 'LOGIN_WRONG_PASSWORD', false)
    return { success: false, error: 'Invalid credentials.' }
  }

  logAuthEvent(trimUser, 'LOGIN_SUCCESS', true)

  const sessionUser = {
    username:    user.username,
    displayName: user.displayName,
    role:        user.role,
    loginTime:   new Date().toISOString(),
  }

  saveSession(sessionUser)
  return { success: true, user: sessionUser }
}

// ── Export user list for admin panel ─────────────────────────────────────────
export function getUserList() {
  return USER_DB.map(u => ({ username: u.username, role: u.role, displayName: u.displayName, active: u.active }))
}

export function getAuthLog() {
  try { return JSON.parse(localStorage.getItem('iri_auth_log') || '[]') } catch { return [] }
}
