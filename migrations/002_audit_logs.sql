-- =========================================================
-- Migration 002: Audit logging (Step 2)
-- =========================================================
-- STRICTLY ADDITIVE. Creates one brand-new table only.
-- Does not touch users, predictions, prediction_history,
-- traffic_alerts, traffic_records, traffic_dataset, or
-- deleted_accounts in any way.
--
-- NOTE ON HOW THIS TABLE GETS CREATED:
--
-- Unlike migration 001 (which altered the existing `users`
-- table - something Base.metadata.create_all() can never do),
-- `audit_logs` is a brand-new table, and the app's model for it
-- (app/models/audit_log.py) is already registered in
-- app/models/__init__.py. That means the NEXT TIME YOU RESTART
-- THE BACKEND, Base.metadata.create_all() will create this
-- table automatically - the same mechanism that created every
-- other table in this project originally.
--
-- This file is provided so you can review the exact SQL and,
-- if you prefer, run it yourself BEFORE restarting the server.
-- Either order is safe: create_all() only creates tables that
-- don't already exist yet, so if you run this file first, the
-- next restart's create_all() will simply see the table is
-- already there and do nothing further.
-- =========================================================

BEGIN;

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,

    -- Nullable + ON DELETE SET NULL (not CASCADE): deleting a
    -- user later must never silently erase their audit history.
    actor_user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,

    -- Plain string, not a foreign key, so the record stays
    -- human-readable even after actor_user_id is nulled out by
    -- the user being deleted.
    actor_email VARCHAR NULL,

    action VARCHAR NOT NULL,

    target_user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,

    -- Small non-sensitive structured detail about the event.
    -- Never stores passwords, tokens, or other credentials.
    metadata JSON NULL,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_audit_logs_actor_user_id
    ON audit_logs (actor_user_id);

CREATE INDEX IF NOT EXISTS ix_audit_logs_target_user_id
    ON audit_logs (target_user_id);

CREATE INDEX IF NOT EXISTS ix_audit_logs_action
    ON audit_logs (action);

CREATE INDEX IF NOT EXISTS ix_audit_logs_created_at
    ON audit_logs (created_at);

COMMIT;

-- ---------------------------------------------------------
-- Verification queries (read-only, safe to run anytime)
-- ---------------------------------------------------------
-- SELECT column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--  WHERE table_name = 'audit_logs'
--  ORDER BY ordinal_position;
--
-- SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint
--  WHERE conrelid = 'audit_logs'::regclass;
--
-- SELECT * FROM audit_logs ORDER BY id DESC LIMIT 20;
