// ─────────────────────────────────────────────────────────────────────────────
// IRI v1.5.2 — AI Engine (Anthropic API)
// AI Narrative Generator · Bank Statement Parser · Case Summary
// Uses claude-sonnet-4-20250514 via /v1/messages
// ─────────────────────────────────────────────────────────────────────────────

const MODEL   = 'claude-sonnet-4-20250514'
const API_URL = 'https://api.anthropic.com/v1/messages'

async function callClaude(messages, system, maxTokens = 1000) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.content?.map(b => b.text || '').join('') || ''
}

// ── AI Narrative Generator ────────────────────────────────────────────────────
// Reads full case file and produces a structured investigation narrative
export async function generateCaseNarrative(c) {
  const system = `You are an expert intelligence analyst writing structured investigation narratives for sports integrity investigations.
Be precise, professional, and legally careful. Write in past tense where events are confirmed, present tense for ongoing.
Format your response with clear sections. Never speculate beyond the evidence. Flag gaps explicitly.`

  const caseData = {
    id: c.id, title: c.title, sport: c.sport, severity: c.severity,
    stage: c.stage, status: c.status, jurisdiction: c.jurisdiction,
    iriScore: c.iri, confidence: c.confidence,
    noteCount: c.notes?.length || 0, fileCount: c.files?.length || 0,
    timelineCount: c.timeline?.length || 0, leadCount: c.leads?.length || 0,
    notes: (c.notes || []).map(n => ({ type: n.type, author: n.author, ts: n.ts, text: n.text?.slice(0, 300) })),
    timeline: (c.timeline || []).map(t => ({ ts: t.ts, type: t.type, text: t.text?.slice(0, 150) })),
    leads: (c.leads || []).map(l => ({ name: l.name, notes: l.notes?.slice(0, 100) })),
    infractions: (c.infractions || []).map(i => ({ body: i.body, type: i.type, date: i.date })),
    entities: c.entities || [],
    linkedCases: c.linkedCases || [],
    stakeoutCount: c.stakeoutLog?.length || 0,
    phoneCallCount: c.phoneLog?.length || 0,
    totalHoursLogged: c.timeLogs?.reduce((s, t) => s + (t.hours || 0), 0) || 0,
  }

  const prompt = `Generate a comprehensive investigation narrative for this integrity case. Structure it as:

1. CASE SUMMARY (2-3 sentences, key facts only)
2. EVIDENCE OVERVIEW (what has been collected and its significance)
3. KEY FINDINGS (most important discoveries from notes and timeline)
4. PERSONS OF INTEREST (from leads — describe without full PII)
5. INVESTIGATION GAPS (what is missing or unverified)
6. RECOMMENDED NEXT STEPS (3-5 specific actions)
7. RISK ASSESSMENT (IRI context and what it means legally)

Case data:
${JSON.stringify(caseData, null, 2)}`

  return callClaude([{ role: 'user', content: prompt }], system, 1000)
}

// ── Bank Statement Parser ─────────────────────────────────────────────────────
// Parses a bank statement image/PDF and extracts structured transaction data
export async function parseBankStatement(base64Image, mediaType = 'image/jpeg') {
  const system = `You are a forensic financial analyst specialized in detecting suspicious transaction patterns.
Extract all transactions from this bank statement and return ONLY valid JSON — no markdown, no backticks, no preamble.`

  const prompt = `Extract all transactions from this bank statement. Return ONLY a JSON object with this exact structure:
{
  "accountHolder": "name or Unknown",
  "accountNumber": "last 4 digits or masked",
  "institution": "bank name or Unknown",
  "statementPeriod": "start to end date",
  "openingBalance": 0,
  "closingBalance": 0,
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "transaction description",
      "amount": 0,
      "type": "debit or credit",
      "balance": 0,
      "flagged": false,
      "flagReason": ""
    }
  ],
  "suspiciousPatterns": ["list any round-number deposits, structured transactions, unusual frequencies"],
  "totalDebits": 0,
  "totalCredits": 0,
  "largestTransaction": 0
}`

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL, max_tokens: 1000,
      system,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Image } },
          { type: 'text', text: prompt },
        ],
      }],
    }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  const text = data.content?.map(b => b.text || '').join('') || '{}'
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return { error: 'Parse failed', raw: text }
  }
}

// ── Case Summary (short, for triage) ──────────────────────────────────────────
export async function generateCaseSummary(c) {
  const system = `You are a sports integrity investigator. Write concise, factual briefings. Max 3 sentences.`
  const prompt = `Summarize this investigation in 2-3 sentences for a morning briefing: Case ${c.id} — ${c.title}. Sport: ${c.sport}. IRI: ${c.iri}. Stage: ${c.stage}. Notes: ${c.notes?.length}. Key facts from timeline: ${c.timeline?.slice(-3).map(t=>t.text).join('; ')}`
  return callClaude([{ role: 'user', content: prompt }], system, 200)
}

// ── Cease & Desist Letter Generator ───────────────────────────────────────────
export async function generateCeaseAndDesist({ caseId, caseTitle, sport, jurisdiction, subject, violations, orgName, signatory, signatoryTitle }) {
  const system = `You are a legal counsel for a sports integrity organization. Write formal cease and desist letters in professional legal language.`
  const prompt = `Write a formal cease and desist letter with the following details:
- Organization: ${orgName}
- Case Reference: ${caseId}
- Subject of letter: ${subject}
- Violations: ${violations}
- Sport: ${sport}
- Jurisdiction: ${jurisdiction}
- Signatory: ${signatory}, ${signatoryTitle}
- Date: ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}

Include: formal header, recitation of violations with legal framing, specific demands to cease, deadline (14 days), consequences of non-compliance, signature block. Keep it to 4-6 paragraphs.`
  return callClaude([{ role: 'user', content: prompt }], system, 800)
}
