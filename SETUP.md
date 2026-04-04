# IRI v1.5 — Making It Fully Operational Right Now

## What's Fixed in This Build

- **Real authentication** — login rejects wrong credentials. Passwords are SHA-256 hashed.
  You cannot access the platform without a valid username + correct password.

- **Session persistence** — login survives page refresh (8-hour session).

- **Data persistence** — cases, messages, alerts, and API toggle states survive
  page refreshes and browser closes (localStorage).

- **Role enforcement** — each user only sees tabs their role allows.
  A Special Agent cannot see God Mode, invoicing, etc.

---

## Step 1 — Set Real Passwords (Do This First)

Open `src/utils/auth.js`. You'll see the `USER_DB` array.

For each user, generate a SHA-256 hash of their password using any of:

**Option A — Browser console (easiest):**
```
Open Chrome DevTools → Console → paste:
async function h(p){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(p));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
h('YourActualPassword123!').then(console.log)
```

**Option B — Terminal:**
```bash
echo -n 'YourActualPassword123!' | shasum -a 256
```

**Option C — Online tool:** https://emn178.github.io/online-tools/sha256.html
(paste password, copy 64-character hex output)

Replace each `REPLACE_WITH_SHA256_HASH` in `auth.js` with the 64-character hex string.

**Example:**
```js
{
  username:     'a.morgan',
  passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
  role:         'special_agent',
  ...
}
```

To add a new user, add a new entry to USER_DB with a role from:
`god | main_account | supervisor | special_agent | regulator | integrity_officer | governance | sportsbook`

---

## Step 2 — Deploy to Amplify

1. Copy the `iri-v150-live` folder contents to your GitHub repo (`integrityriskindex-cpu/iri-platform`)
2. Git push to main
3. Amplify auto-builds in ~3 minutes

If Amplify hasn't built yet: AWS Console → Amplify → your app → Run build

---

## Step 3 — Set the API URL (for live match data)

In AWS Amplify Console:
1. App settings → Environment variables
2. Add: `VITE_API_BASE_URL` = your CloudFormation API Gateway URL
3. Redeploy

The Lambda `/health`, `/odds`, `/sportradar` endpoints are what the frontend calls.
These were deployed in your CloudFormation stack. Get the URL from:
```
AWS Console → CloudFormation → integrity-platform stack → Outputs
```
Or:
```bash
aws cloudformation describe-stacks --stack-name integrity-platform \
  --query 'Stacks[0].Outputs' --output table
```

---

## Step 4 — Deploy the Backend Lambdas

The backend folder contains:
- `rosettaIngest.js` — data normalization + Kinesis
- `kinesisBroadcaster.js` — real-time WebSocket alerts
- `graphIngest.js` — Neptune graph population
- `generateCasePdf.js` — CAS-ready PDF + QLDB

```bash
cd backend
npm install
sam build
sam deploy --guided --stack-name iri-v15-backend
```

You'll be prompted for:
- Neptune endpoint (from Neptune console)
- VPC ID + Subnet IDs
- Lambda security group ID

---

## Step 5 — Wire Real Match Data

The Live Monitor, IRI Calculator, and Triage currently use demo data in `data.js`.

To make them pull real data:

**Sportradar** (tennis matches):
- Your key: `g5352bTPV3B8xNJ1H3fUEZfLxsGtf6MQZab2VUC9`
- Endpoint: `https://api.sportradar.us/tennis/trial/v3/en/schedules/live/results.json`

**The Odds API** (betting lines):
- Your key: `178ebf4cf36432b279ca862595dcee15`
- Endpoint: `https://api.the-odds-api.com/v4/sports/tennis/odds?apiKey=KEY&regions=eu&markets=h2h`

These calls go through your Lambda `/sportradar` and `/odds` endpoints (already deployed).
The Lambda reads the keys from AWS Secrets Manager (already configured).

The frontend calls: `${VITE_API_BASE_URL}/sportradar` and `${VITE_API_BASE_URL}/odds`

---

## What Each Role Can Access

| Role              | Access                                              |
|-------------------|-----------------------------------------------------|
| god               | Everything — all 18 tabs                           |
| main_account      | Everything except God Mode                         |
| supervisor        | Triage, Nexus, Chrono, FININT, Overwatch, Cases, Messaging, Monitor, IRI, Analytics, Alerts |
| special_agent     | Triage, Nexus, Overwatch, Cases, Messaging, Monitor, IRI, Alerts |
| regulator         | Triage, Nexus, Overwatch, Deconflict, Cases, Monitor, API, Analytics, Alerts |
| sportsbook        | Triage, Overwatch, FININT, Monitor, API, Alerts    |
| integrity_officer | Triage, Nexus, FININT, Overwatch, Cases, Monitor, IRI, Alerts |
| governance        | Triage, Overwatch, Cases, Monitor, Analytics, Alerts |

---

## Production Path (Next Steps)

### Replace localStorage with DynamoDB
Once your Lambdas are deployed, swap functions in `store.js`:
```js
// Change this:
export function loadCases(initial) { return get(KEYS.cases, initial) }
export function saveCases(cases)   { set(KEYS.cases, cases) }

// To this:
export async function loadCases()  { return fetch(`${API}/cases`).then(r=>r.json()) }
export async function saveCases(c) { return fetch(`${API}/cases`, {method:'PUT', body:JSON.stringify(c)}) }
```
The App components don't change — only the store functions.

### Replace auth.js with AWS Cognito
```js
import { Auth } from 'aws-amplify'

export async function authenticate(username, password) {
  try {
    const user = await Auth.signIn(username, password)
    return { success: true, user: { username, role: user.attributes['custom:role'], ... } }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
```
Cognito setup: AWS Console → Cognito → Create User Pool → add `custom:role` attribute.

---

## Right Now Checklist

- [ ] Set real password hashes in `src/utils/auth.js`
- [ ] Push to GitHub → Amplify builds automatically
- [ ] Set `VITE_API_BASE_URL` in Amplify environment variables
- [ ] Verify login rejects wrong passwords
- [ ] Create first real case
- [ ] Test export (Cases → select case → Export Report)
