// ─────────────────────────────────────────────────────────────────────────────
// IRI v1.1.0 — Dissertation Mathematics
// Kirby (2026): IRI_i = 100 × [w₁ × |Y_i − P{w,i}| + w₂ × V_i]
// Validated: AUC = 0.873 · n = 106,849 · Gender invariant
// ─────────────────────────────────────────────────────────────────────────────

export const TIER_V = {
  grand_slam: 0.08,
  masters:    0.16,
  tour_500:   0.24,
  tour_250:   0.34,
  challenger: 0.55,
  itf:        0.78,
}

export const TIER_LABELS = {
  grand_slam: 'Grand Slam',
  masters:    'Masters / WTA 1000',
  tour_500:   'ATP/WTA 500',
  tour_250:   '250 / International',
  challenger: 'Challenger',
  itf:        'ITF / Futures',
}

export const SURFACE_W = {
  carpet: 1.10, clay: 1.00, hard: 0.95, grass: 0.90, indoor: 0.97,
}

// Logistic regression coefficients from dissertation §4.5
const B = { b0: -1.42, Pw: -3.81, dR100: -0.28, challenger: 0.67, itf: 0.94 }

export function impliedProb(odds) {
  return Math.min(Math.max(1 / Math.max(odds, 1.01), 0.01), 0.99)
}

export function computeIRI({ favoriteOdds, underdogOdds, rankingGap = 0, tier, surface, w1 = 0.5, w2 = 0.5 }) {
  const Pw      = impliedProb(favoriteOdds)
  const V_raw   = TIER_V[tier] ?? 0.5
  const V       = Math.min(1, V_raw * (SURFACE_W[surface?.toLowerCase()] ?? 1.0))
  const Y       = 0  // market-implied: assume favorite baseline
  const residual = Math.abs(Y - Pw)
  const iri     = Math.min(100 * (w1 * residual + w2 * V) * 100, 100)
  const dR100   = rankingGap / 100
  const tb      = tier === 'itf' ? B.itf : tier === 'challenger' ? B.challenger : 0
  const logit   = B.b0 + B.Pw * Pw + B.dR100 * dR100 + tb
  const upsetProb = 1 / (1 + Math.exp(-logit))
  return { iri, Pw, V, V_raw, residual, upsetProb, oddsRatio: Math.exp(tb), dR100 }
}

export function iriBand(s) {
  if (s >= 70) return { label: 'CRITICAL', color: '#ef4444', bg: '#7f1d1d' }
  if (s >= 50) return { label: 'HIGH',     color: '#f97316', bg: '#7c2d12' }
  if (s >= 30) return { label: 'ELEVATED', color: '#eab308', bg: '#713f12' }
  return              { label: 'LOW',      color: '#22c55e', bg: '#14532d' }
}

// Robustness check across 3 weighting schemes
export function robustnessCheck(params) {
  return [[0.5, 0.5], [0.7, 0.3], [0.3, 0.7]].map(([w1, w2]) => ({
    label: `${w1}/${w2}`,
    ...computeIRI({ ...params, w1, w2 }),
  }))
}

// Benford's Law: P(d) = log10(1 + 1/d)
export function benfordExpected() {
  return [1,2,3,4,5,6,7,8,9].map(d => ({
    digit: d,
    expected: Math.log10(1 + 1/d) * 100,
  }))
}

export function benfordChiSquare(values) {
  const counts = Array(9).fill(0)
  let total = 0
  values.forEach(v => {
    const s = String(Math.abs(v)).replace(/^0\./, '').replace(/^0+/, '')
    const d = parseInt(s[0])
    if (d >= 1 && d <= 9) { counts[d - 1]++; total++ }
  })
  if (!total) return null
  const observed = counts.map((c, i) => ({
    digit: i + 1,
    observed: (c / total) * 100,
    expected: Math.log10(1 + 1/(i+1)) * 100,
  }))
  const chi2 = observed.reduce((sum, o) => {
    const O = (o.observed / 100) * total
    const E = (o.expected / 100) * total
    return E > 0 ? sum + Math.pow(O - E, 2) / E : sum
  }, 0)
  return { observed, total, chi2, df: 8, suspicious: chi2 > 20.09 }
}

// API Credibility Layer (ACL)
export function computeCredibility({ successCalls, totalCalls, stdDevOdds, confirmedAlerts, totalAlerts, avgLatencyMs }) {
  const sr = totalCalls > 0 ? (successCalls / totalCalls) * 100 : 50
  const cs = Math.max(0, Math.min(100, 100 - (stdDevOdds || 0) * 100))
  const vr = totalAlerts > 0 ? (confirmedAlerts / totalAlerts) * 100 : 50
  const lt = Math.max(0, Math.min(100, 100 - (avgLatencyMs || 0)))
  return Math.round(sr * 0.35 + cs * 0.25 + vr * 0.25 + lt * 0.15)
}

// Bayesian posterior probability
export function bayesianUpdate({ prior, likelihood, evidenceWeight = 0.65 }) {
  const num = likelihood * prior
  const den = num + (1 - likelihood) * (1 - prior)
  const posterior = den === 0 ? prior : num / den
  return posterior * evidenceWeight + prior * (1 - evidenceWeight)
}
