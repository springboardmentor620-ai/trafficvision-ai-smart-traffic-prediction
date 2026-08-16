-- =========================================================
-- Migration 001: RBAC foundation + password-reset fix
-- =========================================================
-- STRICTLY ADDITIVE. Nothing here drops, renames, or
-- overwrites any existing column, table, or row.
--
-- Safe to run multiple times up to the point of failure
-- (each statement below is idempotent via IF NOT EXISTS /
-- guarded DO blocks), but it is NOT wrapped in one single
-- transaction on purpose - if you want strict all-or-nothing
-- semantics, wrap the whole file yourself in BEGIN; ... COMMIT;
-- (Postgres supports transactional DDL, so that is safe here).
-- =========================================================

BEGIN;

-- ---------------------------------------------------------
-- 1. Account lifecycle status on users
--    Existing rows all get 'active' via DEFAULT - no user
--    is suspended/deactivated by this migration.
-- ---------------------------------------------------------
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS status VARCHAR NOT NULL DEFAULT 'active';

-- ---------------------------------------------------------
-- 2. Password-reset columns
--    app/services/password_reset_service.py already reads/
--    writes user.reset_token and user.reset_token_expiry,
--    but the users table has never had these columns - this
--    is what makes /auth/reset-password crash today.
-- ---------------------------------------------------------
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reset_token VARCHAR NULL;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP NULL;

-- ---------------------------------------------------------
-- 3. Constrain role/status to known values going forward.
--    Existing 'operator'/'admin' rows already satisfy this
--    (guarded with DO blocks so re-running is a no-op).
-- ---------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT users_role_check
            CHECK (role IN ('operator', 'admin', 'super_admin'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_status_check'
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT users_status_check
            CHECK (status IN ('active', 'suspended', 'deactivated'));
    END IF;
END $$;

COMMIT;

-- ---------------------------------------------------------
-- 4. Bootstrap your first super_admin.
--    Not run automatically - review and run this yourself,
--    AFTER the block above has been applied, once you know
--    which existing account should become super_admin.
--
--    >>> REPLACE THE EMAIL BELOW BEFORE RUNNING <<<
-- ---------------------------------------------------------
-- UPDATE users
--     SET role = 'super_admin'
--     WHERE email = '<YOUR_ACTUAL_EMAIL_HERE>';

-- ---------------------------------------------------------
-- 5. Verification queries (read-only, safe to run anytime)
-- ---------------------------------------------------------
-- SELECT column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--  WHERE table_name = 'users'
--  ORDER BY ordinal_position;
--
-- SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint
--  WHERE conrelid = 'users'::regclass;
--
-- SELECT id, email, role, status FROM users ORDER BY id;
