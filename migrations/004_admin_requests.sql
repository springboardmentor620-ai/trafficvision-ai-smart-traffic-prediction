-- =========================================================
-- Migration 004: Admin requests (Step 4)
-- =========================================================
-- STRICTLY ADDITIVE. Creates one brand-new table only.
-- Does not touch users, audit_logs, admin_invitations, or any
-- other existing table. No column added to `users` in this step -
-- promote/demote only change the existing `role` column's VALUE
-- (already allowed by the users_role_check constraint from
-- migration 001), never its structure.
--
-- Same mechanism as migrations 002/003: this is a brand-new table,
-- and app/models/admin_request.py is already registered in
-- app/models/__init__.py, so Base.metadata.create_all() will create
-- it automatically on your next backend restart. This file is
-- provided so you can review the exact SQL and, if you prefer, run
-- it yourself first - either order is safe.
-- =========================================================
 
BEGIN;
 
CREATE TABLE IF NOT EXISTS admin_requests (
    id SERIAL PRIMARY KEY,
 
    -- Nullable + ON DELETE SET NULL (not CASCADE): the request's
    -- history should survive the requester's account being deleted
    -- later, same reasoning as every other actor/target reference
    -- in this project.
    requester_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
 
    -- 'pending' | 'approved' | 'rejected'
    status VARCHAR NOT NULL DEFAULT 'pending',
 
    reviewed_by_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE NULL,
 
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
 
CREATE INDEX IF NOT EXISTS ix_admin_requests_requester_id
    ON admin_requests (requester_id);
 
CREATE INDEX IF NOT EXISTS ix_admin_requests_status
    ON admin_requests (status);
 
COMMIT;
 
-- ---------------------------------------------------------
-- Verification queries (read-only, safe to run anytime)
-- ---------------------------------------------------------
-- SELECT column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--  WHERE table_name = 'admin_requests'
--  ORDER BY ordinal_position;
--
-- SELECT id, requester_id, status, reviewed_by_id, reviewed_at
--   FROM admin_requests
--  ORDER BY id DESC;
--
-- -- Verify last-super-admin protection is meaningful in your data
-- -- (i.e. you actually have at least one super_admin right now):
-- SELECT id, email, role, status FROM users WHERE role = 'super_admin';
 