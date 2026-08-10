-- Run this against your existing PostgreSQL database BEFORE starting the
-- backend with the updated code. This project has no Alembic/migration
-- runner, and SQLAlchemy's Base.metadata.create_all() only creates tables
-- that don't exist yet - it will NOT add new columns to the existing
-- `users` table. Skip this and the app will throw
-- "column users.reset_token does not exist" the first time
-- /auth/forgot-password or /auth/reset-password is hit.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reset_token VARCHAR NULL,
    ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS ix_users_reset_token ON users (reset_token);

-- Existing rows get reset_token = NULL, which is the correct default
-- (no active reset request).
