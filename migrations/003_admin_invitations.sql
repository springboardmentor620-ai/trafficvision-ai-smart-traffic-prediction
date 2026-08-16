-- =========================================================
-- Migration 003: Admin invitations (Step 3)
-- =========================================================
-- STRICTLY ADDITIVE. Creates one brand-new table only.
-- Does not touch users, audit_logs, or any other existing table.
--
-- Same mechanism as migration 002 (audit_logs): this is a
-- brand-new table, and app/models/admin_invitation.py is already
-- registered in app/models/__init__.py, so Base.metadata.create_all()
-- will create it automatically on your next backend restart. This
-- file is provided so you can review the exact SQL and, if you
-- prefer, run it yourself first - either order is safe, since
-- create_all() only creates tables that don't already exist.
-- =========================================================

BEGIN;

CREATE TABLE IF NOT EXISTS admin_invitations (
    id SERIAL PRIMARY KEY,

    -- The only email this invitation can ever be accepted for.
    email VARCHAR NOT NULL,

    -- SHA-256 hex digest of the invitation token. The raw token
    -- itself is never stored anywhere - only returned once, at
    -- creation time, in the API response and the invitation email.
    token_hash VARCHAR NOT NULL UNIQUE,

    -- 'pending' | 'accepted' | 'revoked'. 'expired' is intentionally
    -- NOT a stored value here - it's derived by comparing
    -- expires_at to the current time when the invitation is used,
    -- so no background job is needed to keep this column accurate.
    status VARCHAR NOT NULL DEFAULT 'pending',

    -- Nullable + ON DELETE SET NULL (not CASCADE): the invitation
    -- record must survive the inviting super_admin's account being
    -- deleted later.
    invited_by_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,

    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE NULL,

    -- The admin account this invitation resulted in, once accepted.
    accepted_user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_admin_invitations_email
    ON admin_invitations (email);

CREATE INDEX IF NOT EXISTS ix_admin_invitations_token_hash
    ON admin_invitations (token_hash);

CREATE INDEX IF NOT EXISTS ix_admin_invitations_invited_by_id
    ON admin_invitations (invited_by_id);

CREATE INDEX IF NOT EXISTS ix_admin_invitations_status
    ON admin_invitations (status);

COMMIT;

-- ---------------------------------------------------------
-- Verification queries (read-only, safe to run anytime)
-- ---------------------------------------------------------
-- SELECT column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--  WHERE table_name = 'admin_invitations'
--  ORDER BY ordinal_position;
--
-- SELECT id, email, status, expires_at, invited_by_id, accepted_user_id
--   FROM admin_invitations
--  ORDER BY id DESC;
