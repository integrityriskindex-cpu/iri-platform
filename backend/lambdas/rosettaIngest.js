// ─────────────────────────────────────────────────────────────────────────────
// IRI v1.5 — Rosetta Engine (Lambda)
// Universal data normalization middleware: ingests chaotic multi-source API
// payloads and standardizes into a unified IRI schema before streaming.
// Triggered by: API Gateway POST /ingest or EventBridge scheduled rule.
// Output: normalized JSON → Amazon Kinesis stream for real-time IRI scoring.
// ─────────────────────────────────────────────────────────────────────────────

import AWS from 'aws-sdk'
const kinesis = new AWS.Kinesis()

// ── Name normalization ────────────────────────────────────────────────────────
function normalizeEntityName(raw = '') {
  return raw.toLowerCase().replace(/[^a-z0-9\s\-']/g, '').trim().replace(/\s+/g, ' ')
}

// ── Odds normalization (American → Decimal) ───────────────────────────────────
function normalizeOdds(odds, format = 'decimal') {
  if (format === 'american') {
    return odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1
  }
  return parseFloat(odds) || 1.5 // assume decimal
}

// ── Tournament tier normalization ─────────────────────────────────────────────
function normalizeTier(raw = '') {
  const t = raw.toLowerCase()
  if (t.includes('grand slam') || t.includes('gs'))           return 'grand_slam'
  if (t.includes('masters') || t.includes('wta 1000'))        return 'masters'
  if (t.includes('atp 500') || t.includes('wta 500'))         return 'tour_500'
  if (t.includes('250') || t.includes('international'))       return 'tour_250'
  if (t.includes('challenger'))                               return 'challenger'
  if (t.includes('itf') || t.includes('futures') || t.includes('m15') || t.includes('m25')) return 'itf'
  if (t.includes('nfl') || t.includes('super bowl'))          return 'nfl_premier'
  if (t.includes('cfb') || t.includes('ncaa football'))       return 'cfb_power4'
  return 'unknown'
}

// ── Player ID normalization (multi-source de-duplication) ─────────────────────
function normalizePlayerId(raw, source) {
  // In production: cross-reference against unified player registry in DynamoDB
  return `${source}:${(raw || '').toString().trim()}`
}

// ── Currency normalization ────────────────────────────────────────────────────
function normalizeCurrency(amount, currency = 'USD') {
  const rates = { EUR: 1.09, GBP: 1.27, AUD: 0.65, USD: 1.0 }
  return parseFloat((amount * (rates[currency] || 1)).toFixed(2))
}

// ── Main normalization logic ──────────────────────────────────────────────────
function normalizePayload(raw, source) {
  const oddsFormat = ['draftkings','fanduel','betmgm'].includes(source) ? 'american' : 'decimal'

  const normalized = {
    matchId:       raw.id || raw.match_id || raw.event_id || `${source}-${Date.now()}`,
    timestamp:     raw.commence_time || raw.start_time || new Date().toISOString(),
    ingestTime:    new Date().toISOString(),
    source,

    // Players / teams
    playerA:       normalizeEntityName(raw.home_player || raw.player_1 || raw.home_team || raw.playerA || ''),
    playerB:       normalizeEntityName(raw.away_player || raw.player_2 || raw.away_team || raw.playerB || ''),
    playerAId:     normalizePlayerId(raw.home_id || raw.player_1_id || '', source),
    playerBId:     normalizePlayerId(raw.away_id || raw.player_2_id || '', source),

    // Tournament / event
    tournament:    raw.tournament || raw.league || raw.event || 'Unknown',
    tier:          normalizeTier(raw.tournament_category || raw.sport_key || raw.tier || raw.league || ''),
    surface:       (raw.surface || 'hard').toLowerCase(),
    sport:         (raw.sport || raw.sport_key || 'tennis').toLowerCase().replace(/[-_]/g, '_'),
    jurisdiction:  raw.country || raw.jurisdiction || 'Unknown',

    // Odds (unified to decimal)
    favOdds:       normalizeOdds(raw.best_odds_home || raw.price_home || raw.odds_a || raw.favOdds || 1.5, oddsFormat),
    dogOdds:       normalizeOdds(raw.best_odds_away || raw.price_away || raw.odds_b || raw.dogOdds || 3.0, oddsFormat),
    bookmakerCount: raw.bookmakers?.length || raw.book_count || 1,
    oddsDispersion: raw.dispersion || raw.line_spread || 0,

    // Volume (normalized to USD)
    volume:        normalizeCurrency(raw.matched_volume || raw.total_volume || raw.volume || 0, raw.currency || 'USD'),
    normalVolume:  normalizeCurrency(raw.expected_volume || raw.baseline_volume || 0, raw.currency || 'USD'),

    // Rankings / context
    rankingA:      parseInt(raw.ranking_home || raw.player_1_rank || raw.rankingA || 0),
    rankingB:      parseInt(raw.ranking_away || raw.player_2_rank || raw.rankingB || 0),
    rankingGap:    Math.abs((raw.ranking_home || raw.rankingA || 0) - (raw.ranking_away || raw.rankingB || 0)),

    // Metadata
    injuryFlag:    !!(raw.injury_flag || raw.home_injury || raw.player_1_injury),
    normalized:    true,
    rosettaVersion:'1.5.0',
  }

  return normalized
}

// ── Lambda handler ────────────────────────────────────────────────────────────
export const handler = async (event) => {
  try {
    const source      = event.headers?.['x-api-source'] || event.source || 'unknown'
    const rawPayload  = JSON.parse(event.body || JSON.stringify(event))

    // Support batch payloads (array) or single match
    const payloads = Array.isArray(rawPayload) ? rawPayload : [rawPayload]
    const results  = []

    for (const raw of payloads) {
      const normalized = normalizePayload(raw, source)

      // Validate minimum required fields
      if (!normalized.matchId || !normalized.favOdds) {
        console.warn('Skipping invalid payload:', raw)
        continue
      }

      // Push to Kinesis for real-time IRI engine processing
      await kinesis.putRecord({
        Data:         JSON.stringify(normalized),
        PartitionKey: normalized.matchId.toString(),
        StreamName:   process.env.KINESIS_STREAM_NAME || 'iri-alert-stream',
      }).promise()

      results.push({ matchId: normalized.matchId, status: 'normalized_and_streamed' })
    }

    return {
      statusCode: 200,
      headers:    { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body:       JSON.stringify({ status: 'success', processed: results.length, results }),
    }
  } catch (err) {
    console.error('Rosetta Engine Error:', err)
    return {
      statusCode: 500,
      body:       JSON.stringify({ error: 'Normalization failed', details: err.message }),
    }
  }
}
