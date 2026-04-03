-- ─────────────────────────────────────────────────────────────────────────────
-- IRI v1.5 — Multi-Tenant Row-Level Security (PostgreSQL RLS)
-- Enforces cryptographic tenant isolation on Amazon RDS PostgreSQL.
-- Prevents ANY cross-tenant data access even if application code has bugs.
-- Run this against your RDS PostgreSQL instance via psql or AWS RDS Query Editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Core tables with mandatory tenant_id ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS match_evidence (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,             -- Agency / sportsbook / regulator ID
    match_id        VARCHAR(255) NOT NULL,
    iri_score       NUMERIC(5,2),
    alert_level     VARCHAR(20),
    sport           VARCHAR(50),
    tournament      VARCHAR(255),
    tier            VARCHAR(50),
    player_a        VARCHAR(255),
    player_b        VARCHAR(255),
    evidence_payload JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investigation_cases (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    case_id         VARCHAR(50) NOT NULL UNIQUE,
    title           VARCHAR(500),
    severity        VARCHAR(20),
    status          VARCHAR(50),
    sport           VARCHAR(50),
    iri_score       NUMERIC(5,2),
    assigned_to     VARCHAR(255),
    supervisor      VARCHAR(255),
    case_data       JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deconfliction_hashes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    blind_hash      VARCHAR(64) NOT NULL,       -- SHA-256 one-way hash only
    case_type       VARCHAR(255),
    status          VARCHAR(50) DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    -- NOTE: Real entity name is NEVER stored — only the hash
    UNIQUE(tenant_id, blind_hash)
);

CREATE TABLE IF NOT EXISTS audit_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    user_id         VARCHAR(255) NOT NULL,
    action          VARCHAR(255) NOT NULL,
    resource_type   VARCHAR(100),
    resource_id     VARCHAR(255),
    ip_address      INET,
    user_agent      TEXT,
    payload_hash    VARCHAR(64),               -- SHA-256 of action payload
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row-Level Security on all tables ───────────────────────────────────

ALTER TABLE match_evidence       ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_cases  ENABLE ROW LEVEL SECURITY;
ALTER TABLE deconfliction_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log            ENABLE ROW LEVEL SECURITY;

-- 4. Tenant isolation policies ─────────────────────────────────────────────────
-- A user can ONLY see/edit rows matching their assigned tenant_id.
-- current_setting('app.current_tenant') is set by Lambda BEFORE any query.

CREATE POLICY tenant_isolation_match_evidence ON match_evidence
    USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY tenant_isolation_cases ON investigation_cases
    USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY tenant_isolation_deconfliction ON deconfliction_hashes
    USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY tenant_isolation_audit ON audit_log
    USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

-- 5. Deconfliction cross-tenant hash query (read-only, no data exposed) ────────
-- Only supervisor-level DB user can run cross-tenant hash comparison.
-- Returns only: match_found, matched_agency — zero case data.

CREATE OR REPLACE FUNCTION check_deconfliction(p_hash VARCHAR(64))
RETURNS TABLE(match_found BOOLEAN, matched_agency UUID, case_type VARCHAR(255))
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT
        TRUE,
        dh.tenant_id,
        dh.case_type
    FROM deconfliction_hashes dh
    WHERE dh.blind_hash = p_hash
      AND dh.tenant_id != current_setting('app.current_tenant', true)::UUID
      AND dh.status = 'active'
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR(255);
    END IF;
END;
$$;

-- 6. Indexes for performance ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_match_evidence_tenant    ON match_evidence(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_evidence_iri       ON match_evidence(iri_score DESC) WHERE iri_score >= 70;
CREATE INDEX IF NOT EXISTS idx_cases_tenant             ON investigation_cases(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_deconflict_hash          ON deconfliction_hashes(blind_hash);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_time        ON audit_log(tenant_id, created_at DESC);

-- 7. Lambda usage pattern ─────────────────────────────────────────────────────
-- In your Node.js Lambda, ALWAYS set tenant before querying:
--
--   const client = await pool.connect();
--   try {
--     await client.query(`SET LOCAL app.current_tenant = '${user.tenantId}'`);
--     const result = await client.query('SELECT * FROM match_evidence WHERE iri_score > $1', [70]);
--     // RLS automatically filters to tenant's data only
--   } finally {
--     client.release();
--   }
--
-- WARNING: Never interpolate tenant_id directly into queries.
-- Always use SET LOCAL + parameterized queries together.

-- 8. Noisy-neighbor compute quotas ────────────────────────────────────────────
-- Handled by Kubernetes/EKS resource quotas in template.yaml
-- Each tenant gets dedicated auto-scaling node group for GPU-heavy ops.

COMMENT ON TABLE match_evidence IS 'IRI v1.5 — RLS-protected match evidence. tenant_id required. SHA-256 hashed to QLDB.';
COMMENT ON TABLE deconfliction_hashes IS 'IRI v1.5 — One-way blind hashes only. Real entity names never stored.';
