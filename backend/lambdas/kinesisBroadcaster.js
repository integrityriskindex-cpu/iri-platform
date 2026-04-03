// ─────────────────────────────────────────────────────────────────────────────
// IRI v1.5 — Kinesis Broadcaster (Lambda)
// Reads Kinesis stream (from Rosetta Engine), computes IRI, and pushes
// real-time alerts to all connected investigators via WebSocket API Gateway.
// Stale connections (410) are automatically pruned from DynamoDB.
// ─────────────────────────────────────────────────────────────────────────────

import AWS from 'aws-sdk'
const dynamoDb = new AWS.DynamoDB.DocumentClient()

// IRI Engine v2 — matches dissertation formula §4
function computeIRI(favOdds, rankingGap = 0, tier = 'itf', clusterExposure = 0) {
  const TIER_V = {
    grand_slam: 0.08, masters: 0.16, tour_500: 0.24, tour_250: 0.34,
    challenger: 0.55, itf: 0.78, unknown: 0.60,
  }
  const Pw          = Math.min(Math.max(1 / Math.max(favOdds, 1.01), 0.01), 0.99)
  const V           = TIER_V[tier] ?? 0.60
  const residual    = Math.abs(0 - Pw)
  const clusterMult = 1 + Math.min(clusterExposure * 0.2, 0.2)
  const iri         = Math.min(100 * (0.5 * residual + 0.5 * V) * clusterMult, 100)
  return { iri: Math.round(iri * 10) / 10, Pw, V, residual, clusterMult }
}

// IRI Shock Detection
function detectShock(previousIRI, currentIRI) {
  const delta = currentIRI - previousIRI
  return {
    isShock:    delta >= 20,
    isBlackSwan: delta >= 40,
    delta,
    severity: delta >= 40 ? 'BLACK_SWAN' : delta >= 20 ? 'SHOCK' : 'NORMAL',
  }
}

// Determine alert level
function getAlertLevel(iri, isClusterMember = false, shock = {}) {
  if (shock.isBlackSwan || (iri >= 85 && isClusterMember)) return 'Black'
  if (iri >= 70 || shock.isShock)                          return 'Red'
  if (iri >= 50)                                            return 'Yellow'
  return null // below threshold — no alert
}

export const handler = async (event) => {
  const endpoint    = process.env.WSS_ENDPOINT?.replace('wss://', 'https://') || ''
  const apigw       = new AWS.ApiGatewayManagementApi({ endpoint })
  const tableName   = process.env.TABLE_NAME || 'IriWebSocketConnections'
  const alertTable  = process.env.ALERT_TABLE || 'IntegrityAuditLogs'
  const s3          = new AWS.S3()

  // Get all connected clients from DynamoDB connections table
  const connectionsData = await dynamoDb.scan({ TableName: tableName }).promise()
  const connections     = connectionsData.Items || []

  for (const record of event.Records) {
    try {
      const payload = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString())

      // Compute IRI from normalized Rosetta payload
      const { iri, Pw, V } = computeIRI(
        payload.favOdds,
        payload.rankingGap,
        payload.tier,
        payload.clusterExposure || 0
      )

      // Shock detection (compare to recent score in DynamoDB — simplified)
      const previousIRI = payload.previousIRI || 40
      const shock       = detectShock(previousIRI, iri)
      const alertLevel  = getAlertLevel(iri, payload.isClusterMember, shock)

      // Only broadcast if above threshold
      if (!alertLevel) continue

      const alert = {
        alertId:       `ALT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp:     new Date().toISOString(),
        matchId:       payload.matchId,
        sport:         payload.sport,
        playerA:       payload.playerA,
        playerB:       payload.playerB,
        tournament:    payload.tournament,
        tier:          payload.tier,
        iriScore:      iri,
        alertLevel,
        shock:         shock.severity,
        shockDelta:    shock.delta,
        Pw:            parseFloat(Pw.toFixed(3)),
        V:             parseFloat(V.toFixed(3)),
        volume:        payload.volume,
        source:        payload.source,
        message:       `${alertLevel.toUpperCase()} ALERT — IRI: ${iri} | ${payload.playerA} vs ${payload.playerB} | ${payload.tournament}`,
        preMatch:      true,
      }

      // Log to DynamoDB audit table
      await dynamoDb.put({
        TableName: alertTable,
        Item: {
          logId:     alert.alertId,
          type:      'OVERWATCH_ALERT',
          ...alert,
          ttl:       Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90-day TTL
        },
      }).promise().catch(err => console.warn('DynamoDB log error:', err))

      // Broadcast to all connected investigators
      const postCalls = connections.map(async ({ connectionId, tenantId }) => {
        try {
          await apigw.postToConnection({
            ConnectionId: connectionId,
            Data:         JSON.stringify(alert),
          }).promise()
        } catch (e) {
          if (e.statusCode === 410) {
            // Client disconnected — prune stale connection
            await dynamoDb.delete({
              TableName: tableName,
              Key:       { connectionId },
            }).promise().catch(() => {})
          } else {
            console.warn(`WebSocket send error for ${connectionId}:`, e.message)
          }
        }
      })

      await Promise.allSettled(postCalls)
      console.log(`Broadcast ${alertLevel} alert: IRI=${iri} | Match=${payload.matchId} | ${connections.length} clients`)

    } catch (err) {
      console.error('Broadcaster record error:', err)
    }
  }
}

// ── WebSocket connection handlers (separate Lambda, same file for reference) ──
export const connect = async (event) => {
  const { connectionId, authorizer } = event.requestContext
  await dynamoDb.put({
    TableName: process.env.TABLE_NAME || 'IriWebSocketConnections',
    Item: {
      connectionId,
      tenantId:  authorizer?.tenantId || 'default',
      userId:    authorizer?.userId   || 'anonymous',
      connectedAt: new Date().toISOString(),
    },
  }).promise()
  return { statusCode: 200, body: 'Connected to IRI Overwatch' }
}

export const disconnect = async (event) => {
  const { connectionId } = event.requestContext
  await dynamoDb.delete({
    TableName: process.env.TABLE_NAME || 'IriWebSocketConnections',
    Key:       { connectionId },
  }).promise()
  return { statusCode: 200, body: 'Disconnected' }
}
