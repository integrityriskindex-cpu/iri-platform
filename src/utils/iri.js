// ─────────────────────────────────────────────────────────────────────────────
// IRI v1.3.0 — Multi-Sport Integrity Risk Mathematics
// Base: Kirby (2026) IRI_i = 100 × [w₁ × |Y_i − P{w,i}| + w₂ × V_i]
// Extended: Sport-specific structural vulnerability models
// ─────────────────────────────────────────────────────────────────────────────

export const TENNIS_TIER_V = {
  grand_slam: 0.08, masters: 0.16, tour_500: 0.24,
  tour_250: 0.34, challenger: 0.55, itf: 0.78,
}
export const TENNIS_TIER_LABELS = {
  grand_slam: 'Grand Slam', masters: 'Masters / WTA 1000',
  tour_500: 'ATP/WTA 500', tour_250: '250 / International',
  challenger: 'Challenger', itf: 'ITF / Futures',
}

// NFL: Information Asymmetry model (not financial precarity)
export const NFL_TIER_V = {
  franchise_qb: 0.05, starter: 0.18, backup: 0.38,
  practice_squad: 0.62, info_precariat: 0.78, debt_vector: 0.88,
}
export const NFL_TIER_LABELS = {
  franchise_qb: 'Franchise QB / Head Coach', starter: 'Starting Skill Position',
  backup: 'Backup / Rotational', practice_squad: 'Practice Squad',
  info_precariat: 'Info Precariat (Staff)', debt_vector: 'Debt Vector (Coercion Risk)',
}

// College Football: NIL / Conference tier
export const CFB_TIER_V = {
  power4_top: 0.08, power4: 0.18, group_of_5: 0.48, fcs: 0.68, nil_zero: 0.82,
}
export const CFB_TIER_LABELS = {
  power4_top: 'Power 4 — Top Program', power4: 'Power 4 Conference',
  group_of_5: 'Group of 5', fcs: 'FCS / Lower Subdivision', nil_zero: 'No NIL — Amateur Precariat',
}

// College Basketball: KenPom-aware tiers
export const CBB_TIER_V = {
  power4_high: 0.10, power4: 0.22, mid_major: 0.45, low_major: 0.65, d1_bottom: 0.80,
}
export const CBB_TIER_LABELS = {
  power4_high: 'Power 4 — Top 25 KenPom', power4: 'Power 4', mid_major: 'Mid-Major',
  low_major: 'Low Major', d1_bottom: 'D1 Bottom Tier',
}

export const SURFACE_W = {
  carpet: 1.10, clay: 1.00, hard: 0.95, grass: 0.90, indoor: 0.97,
}

const TENNIS_B = { b0: -1.42, Pw: -3.81, dR100: -0.28, challenger: 0.67, itf: 0.94 }

export function impliedProb(odds) {
  return Math.min(Math.max(1 / Math.max(odds, 1.01), 0.01), 0.99)
}

export function getTierV(sport, tier) {
  switch (sport) {
    case 'tennis': return TENNIS_TIER_V[tier] ?? 0.5
    case 'nfl':    return NFL_TIER_V[tier] ?? 0.38
    case 'cfb':    return CFB_TIER_V[tier] ?? 0.48
    case 'cbb':    return CBB_TIER_V[tier] ?? 0.45
    case 'baseball':    return tier === 'mlb' ? 0.10 : 0.72
    case 'hockey':      return tier === 'nhl' ? 0.12 : 0.58
    case 'golf_pga':    return tier === 'major' ? 0.08 : 0.52
    case 'golf_liv':    return 0.20
    case 'soccer_epl':  return tier === 'top6' ? 0.08 : 0.42
    case 'soccer_mls':  return tier === 'playoff' ? 0.18 : 0.38
    case 'soccer_championship': return tier === 'top' ? 0.35 : 0.65
    case 'wnba':        return tier === 'playoff' ? 0.28 : 0.58
    case 'college_volleyball': return tier === 'power4' ? 0.20 : 0.55
    default: return 0.5
  }
}

// ── Core IRI — dissertation exact formula ────────────────────────────────────
export function computeIRI({ favoriteOdds, underdogOdds, rankingGap = 0, tier, surface, sport = 'tennis', w1 = 0.5, w2 = 0.5 }) {
  const Pw = impliedProb(favoriteOdds)
  const V_raw = getTierV(sport, tier)
  const V = sport === 'tennis'
    ? Math.min(1, V_raw * (SURFACE_W[surface?.toLowerCase()] ?? 1.0))
    : V_raw
  const residual = Math.abs(0 - Pw)
  const iri = Math.min(100 * (w1 * residual + w2 * V), 100)
  const dR100 = rankingGap / 100
  const tb = tier === 'itf' ? TENNIS_B.itf : tier === 'challenger' ? TENNIS_B.challenger : 0
  const logit = TENNIS_B.b0 + TENNIS_B.Pw * Pw + TENNIS_B.dR100 * dR100 + tb
  const upsetProb = 1 / (1 + Math.exp(-logit))
  return { iri, Pw, V, V_raw, residual, upsetProb, oddsRatio: Math.exp(tb), dR100 }
}

// ── NFL Prop Anomaly IRI ──────────────────────────────────────────────────────
export function computeNFLIRI({ normalVolume, currentVolume, tier = 'starter', injuryLatencyMin = 0, offshoreVsRegulatedDivergence = 0, w1 = 0.5, w2 = 0.5 }) {
  const V = NFL_TIER_V[tier] ?? 0.38
  const volumeRatio = Math.min((currentVolume / Math.max(normalVolume, 1)) - 1, 5) / 5
  const latencyBonus = Math.min(injuryLatencyMin / 120, 1) * 0.3
  const offshoreBonus = Math.min(offshoreVsRegulatedDivergence / 20, 1) * 0.2
  const anomaly = Math.min(volumeRatio + latencyBonus + offshoreBonus, 1)
  const iri = Math.min(100 * (w1 * anomaly + w2 * V), 100)
  return { iri, V, anomaly, volumeRatio, latencyBonus, offshoreBonus }
}

// ── CFB ATS (Point Shaving) IRI ───────────────────────────────────────────────
export function computeCFBIRI({ favoriteOdds, closingSpread, finalMargin, tier = 'group_of_5', nilExposure = false, w1 = 0.5, w2 = 0.5 }) {
  const Pw = impliedProb(favoriteOdds)
  let V = CFB_TIER_V[tier] ?? 0.48
  if (nilExposure) V = Math.min(1, V * 1.25)
  const spreadResidual = closingSpread && finalMargin !== undefined
    ? Math.min(Math.abs((closingSpread - finalMargin) / Math.max(closingSpread, 1)), 1)
    : Math.abs(0 - Pw)
  const iri = Math.min(100 * (w1 * spreadResidual + w2 * V), 100)
  return { iri, Pw, V, spreadResidual }
}

// ── CBB KenPom IRI ────────────────────────────────────────────────────────────
export function computeCBBIRI({ favoriteOdds, kenpomDiff = 0, tier = 'mid_major', w1 = 0.5, w2 = 0.5 }) {
  const Pw = impliedProb(favoriteOdds)
  const V = CBB_TIER_V[tier] ?? 0.45
  const kenpomFactor = Math.min(Math.abs(kenpomDiff) / 30, 1)
  const residual = Math.abs(0 - Pw)
  const anomaly = Math.min(residual * (1 + kenpomFactor * 0.3), 1)
  const iri = Math.min(100 * (w1 * anomaly + w2 * V), 100)
  return { iri, Pw, V, residual, kenpomFactor }
}

export function iriBand(s) {
  if (s >= 70) return { label: 'CRITICAL', color: '#ef4444', bg: '#7f1d1d' }
  if (s >= 50) return { label: 'HIGH',     color: '#f97316', bg: '#7c2d12' }
  if (s >= 30) return { label: 'ELEVATED', color: '#eab308', bg: '#713f12' }
  return              { label: 'LOW',      color: '#22c55e', bg: '#14532d' }
}

export function robustnessCheck(params) {
  return [[0.5, 0.5], [0.7, 0.3], [0.3, 0.7]].map(([w1, w2]) => ({
    label: `${w1}/${w2}`, ...computeIRI({ ...params, w1, w2 }),
  }))
}

export function benfordExpected() {
  return [1,2,3,4,5,6,7,8,9].map(d => ({
    digit: d, expected: Math.log10(1 + 1/d) * 100,
  }))
}

export function computeCredibility({ successCalls, totalCalls, stdDevOdds, confirmedAlerts, totalAlerts, avgLatencyMs }) {
  const sr = totalCalls > 0 ? (successCalls / totalCalls) * 100 : 50
  const cs = Math.max(0, Math.min(100, 100 - (stdDevOdds || 0) * 100))
  const vr = totalAlerts > 0 ? (confirmedAlerts / totalAlerts) * 100 : 50
  const lt = Math.max(0, Math.min(100, 100 - (avgLatencyMs || 0)))
  return Math.round(sr * 0.35 + cs * 0.25 + vr * 0.25 + lt * 0.15)
}

export function bayesianUpdate({ prior, likelihood, evidenceWeight = 0.65 }) {
  const num = likelihood * prior
  const den = num + (1 - likelihood) * (1 - prior)
  const posterior = den === 0 ? prior : num / den
  return posterior * evidenceWeight + prior * (1 - evidenceWeight)
}

// AI Microbet Trend Detector
export function detectMicrobetTrend(volumeSeries = []) {
  if (volumeSeries.length < 3) return { trending: false, direction: 'neutral', acceleration: 0, urgency: 'NORMAL' }
  const deltas = volumeSeries.slice(1).map((v, i) => v - volumeSeries[i])
  const avgDelta = deltas.reduce((s, d) => s + d, 0) / deltas.length
  const acceleration = deltas.length > 1 ? deltas[deltas.length - 1] - deltas[0] : 0
  const trending = Math.abs(avgDelta) > volumeSeries[0] * 0.15
  return {
    trending,
    direction: avgDelta > 0 ? 'rising' : 'falling',
    acceleration,
    urgency: acceleration > volumeSeries[0] * 0.5 ? 'CRITICAL' : trending ? 'ELEVATED' : 'NORMAL',
  }
}

export const SPORTS_CONFIG = {
  tennis:              { label: 'Tennis (ATP/WTA)',    icon: '🎾', model: 'dissertation' },
  nfl:                 { label: 'NFL',                 icon: '🏈', model: 'info_asymmetry' },
  cfb:                 { label: 'College Football',    icon: '🏈', model: 'nil_ats' },
  cbb:                 { label: 'College Basketball',  icon: '🏀', model: 'kenpom' },
  baseball:            { label: 'Baseball (MLB)',      icon: '⚾', model: 'generic' },
  hockey:              { label: 'Hockey (NHL)',        icon: '🏒', model: 'generic' },
  golf_pga:            { label: 'Golf — PGA Tour',     icon: '⛳', model: 'generic' },
  golf_liv:            { label: 'Golf — LIV Tour',     icon: '⛳', model: 'generic' },
  soccer_epl:          { label: 'Soccer — EPL',        icon: '⚽', model: 'generic' },
  soccer_mls:          { label: 'Soccer — MLS',        icon: '⚽', model: 'generic' },
  soccer_championship: { label: 'Soccer — Championship', icon: '⚽', model: 'generic' },
  wnba:                { label: 'WNBA',                icon: '🏀', model: 'generic' },
  college_volleyball:  { label: 'College Volleyball',  icon: '🏐', model: 'generic' },
}
