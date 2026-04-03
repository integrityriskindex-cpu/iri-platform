// ─────────────────────────────────────────────────────────────────────────────
// IRI v1.5 — Neptune Graph Ingest (Lambda)
// Reads from Kinesis stream (post-Rosetta Engine) and idempotently builds
// the Nexus Graph in Amazon Neptune using PARAMETERIZED Gremlin queries.
//
// SECURITY NOTE (Gemini review fix):
// All Neptune queries use the official 'gremlin' npm package with parameterized
// queries instead of string interpolation — eliminates Gremlin injection risk.
//
// Install: npm install gremlin
// VPC: Lambda must be in same VPC as Neptune, port 8182 open in security group.
// ─────────────────────────────────────────────────────────────────────────────

import gremlin from 'gremlin'

const { traversal }             = gremlin.process.AnonymousTraversalSource
const { DriverRemoteConnection } = gremlin.driver
const __                        = gremlin.process.statics
const { cardinality }           = gremlin.process

// Initialize connection outside handler for Lambda connection pooling
const endpoint = process.env.NEPTUNE_ENDPOINT || 'wss://your-neptune-cluster:8182/gremlin'
const dc       = new DriverRemoteConnection(endpoint, {
  mimeType: 'application/vnd.gremlin-v2.0+json',
  pingEnabled: false, // disable in Lambda — no long-lived connections
})
const g = traversal().withRemote(dc)

// ── Idempotent vertex upsert ──────────────────────────────────────────────────
// Uses fold().coalesce() to create-or-update — safe to call multiple times
async function upsertVertex(label, idKey, idValue, properties = {}) {
  let t = g.V().has(label, idKey, idValue)
    .fold()
    .coalesce(
      __.unfold(),
      __.addV(label).property(idKey, idValue)
    )
  // Set/update properties
  for (const [k, v] of Object.entries(properties)) {
    if (v !== undefined && v !== null) {
      t = t.property(cardinality.single, k, v)
    }
  }
  return t.next()
}

// ── Idempotent edge upsert ────────────────────────────────────────────────────
async function upsertEdge(fromLabel, fromKey, fromVal, edgeLabel, toLabel, toKey, toVal, properties = {}) {
  let t = g.V().has(fromLabel, fromKey, fromVal).as('a')
    .V().has(toLabel, toKey, toVal).as('b')
    .coalesce(
      __.inE(edgeLabel).where(__.outV().as('a')),
      __.addE(edgeLabel).from_('a').to('b')
    )
  for (const [k, v] of Object.entries(properties)) {
    if (v !== undefined && v !== null) {
      t = t.property(k, v)
    }
  }
  return t.next()
}

// ── Lambda handler ────────────────────────────────────────────────────────────
export const handler = async (event) => {
  const errors = []

  for (const record of event.Records) {
    try {
      const data = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString())

      // 1. Upsert Player A vertex
      if (data.playerA) {
        await upsertVertex('Player', 'name', data.playerA, {
          sport:      data.sport,
          rankingA:   data.rankingA,
          nationality: data.jurisdiction,
          lastUpdated: new Date().toISOString(),
        })
      }

      // 2. Upsert Player B vertex
      if (data.playerB) {
        await upsertVertex('Player', 'name', data.playerB, {
          sport:      data.sport,
          rankingB:   data.rankingB,
          lastUpdated: new Date().toISOString(),
        })
      }

      // 3. Upsert Tournament vertex
      if (data.tournament) {
        await upsertVertex('Tournament', 'name', data.tournament, {
          tier:        data.tier,
          sport:       data.sport,
          surface:     data.surface,
          jurisdiction: data.jurisdiction,
          lastUpdated: new Date().toISOString(),
        })
      }

      // 4. Upsert Match vertex
      if (data.matchId) {
        await upsertVertex('Match', 'matchId', data.matchId, {
          playerA:    data.playerA,
          playerB:    data.playerB,
          tournament: data.tournament,
          favOdds:    data.favOdds,
          dogOdds:    data.dogOdds,
          volume:     data.volume,
          tier:       data.tier,
          timestamp:  data.timestamp,
          iriScore:   data.iriScore || 0,
          source:     data.source,
        })
      }

      // 5. Create edges: Player → PLAYED_IN → Match
      if (data.playerA && data.matchId) {
        await upsertEdge(
          'Player', 'name', data.playerA,
          'PLAYED_IN',
          'Match', 'matchId', data.matchId,
          { role: 'home', odds: data.favOdds }
        )
      }

      if (data.playerB && data.matchId) {
        await upsertEdge(
          'Player', 'name', data.playerB,
          'PLAYED_IN',
          'Match', 'matchId', data.matchId,
          { role: 'away', odds: data.dogOdds }
        )
      }

      // 6. Create edge: Match → HELD_AT → Tournament
      if (data.matchId && data.tournament) {
        await upsertEdge(
          'Match', 'matchId', data.matchId,
          'HELD_AT',
          'Tournament', 'name', data.tournament,
          { date: data.timestamp }
        )
      }

      // 7. Mark high-IRI matches with risk property for cluster detection
      if (data.iriScore && data.iriScore >= 70 && data.matchId) {
        await g.V().has('Match', 'matchId', data.matchId)
          .property(cardinality.single, 'riskFlag', true)
          .property(cardinality.single, 'iriScore', data.iriScore)
          .property(cardinality.single, 'alertLevel', data.alertLevel || 'yellow')
          .next()
      }

      console.log(`Graph updated: Match=${data.matchId} | ${data.playerA} vs ${data.playerB}`)

    } catch (err) {
      console.error('Neptune write error:', err)
      errors.push({ record: record.kinesis.sequenceNumber, error: err.message })
      // Allow Kinesis to retry — throw only if all records fail
    }
  }

  if (errors.length === event.Records.length) {
    throw new Error(`All ${errors.length} records failed — triggering Kinesis retry`)
  }

  return { statusCode: 200, body: JSON.stringify({ processed: event.Records.length - errors.length, errors }) }
}
