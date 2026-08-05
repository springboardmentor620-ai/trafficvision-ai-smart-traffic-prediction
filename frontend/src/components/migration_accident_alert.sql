-- Run this against your existing PostgreSQL database BEFORE starting the
-- backend with the updated code. Your project has no Alembic/migration
-- runner, and SQLAlchemy's Base.metadata.create_all() only creates tables
-- that don't exist yet - it will NOT add new columns to a table that's
-- already there. Without running this, the app will throw
-- "column traffic_alerts.is_read does not exist" as soon as any alert
-- endpoint is hit.

ALTER TABLE traffic_alerts
    ADD COLUMN IF NOT EXISTS accident_risk_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS ix_traffic_alerts_accident_risk_score
    ON traffic_alerts (accident_risk_score);

CREATE INDEX IF NOT EXISTS ix_traffic_alerts_is_read
    ON traffic_alerts (is_read);

-- Existing rows will get accident_risk_score = 0.0 and is_read = false,
-- which is the correct, safe default (nothing was "read" before this
-- feature existed).
