"""
Shared role/status constants for the RBAC system.

Centralized here so app/models/user.py, app/dependencies.py, and every
route that checks a role or status string all agree on the same set of
values instead of re-typing (and risking a typo in) magic strings.
"""

# Ordered from least to most privileged. Public self-registration
# (POST /auth/register, POST /auth/google) may ONLY ever assign
# OPERATOR - nothing in this file grants a route the ability to
# create an ADMIN or SUPER_ADMIN account directly from user input.
OPERATOR = "operator"
ADMIN = "admin"
SUPER_ADMIN = "super_admin"

ALL_ROLES = (OPERATOR, ADMIN, SUPER_ADMIN)

# Account lifecycle. "deleted" is intentionally NOT a status - a
# deleted account has its User row removed entirely (see
# DELETE /auth/me), not a status flag on a row that still exists.
ACTIVE = "active"
SUSPENDED = "suspended"
DEACTIVATED = "deactivated"

ALL_STATUSES = (ACTIVE, SUSPENDED, DEACTIVATED)

# Roles that satisfy each require_* dependency (each includes every
# role above it, since a super_admin can do everything an admin can,
# etc.)
OPERATOR_OR_ABOVE = (OPERATOR, ADMIN, SUPER_ADMIN)
ADMIN_OR_ABOVE = (ADMIN, SUPER_ADMIN)
SUPER_ADMIN_ONLY = (SUPER_ADMIN,)

# ---------------------------------------------------------------
# Audit log actions (Step 2).
#
# Only the four below are actually written anywhere yet - see
# app/services/audit_service.py call sites in app/routes/auth.py.
# The rest of the vocabulary from the original RBAC spec
# (suspend/deactivate, promote/demote, admin invitations, admin
# request approval, system settings) is listed here so every step
# that adds those features reuses the same constant instead of a
# fresh magic string, but none of them are logged anywhere until the
# corresponding feature (Steps 3-5) actually exists - there is
# nothing in this codebase yet that would suspend a user, promote
# someone, or send an invitation.
# ---------------------------------------------------------------

# Wired in and actively logged as of Step 2:
AUDIT_LOGIN = "LOGIN"
AUDIT_GOOGLE_LOGIN = "GOOGLE_LOGIN"
AUDIT_REGISTER = "REGISTER"
AUDIT_ACCOUNT_DELETED = "ACCOUNT_DELETED"

# Reserved for later steps - not yet written anywhere:
AUDIT_ACCOUNT_RESTORED = "ACCOUNT_RESTORED"
AUDIT_ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED"
AUDIT_ACCOUNT_DEACTIVATED = "ACCOUNT_DEACTIVATED"
AUDIT_USER_PROMOTED = "USER_PROMOTED"
AUDIT_USER_DEMOTED = "USER_DEMOTED"
AUDIT_ADMIN_INVITED = "ADMIN_INVITED"
AUDIT_ADMIN_INVITATION_ACCEPTED = "ADMIN_INVITATION_ACCEPTED"
AUDIT_ADMIN_REQUEST_APPROVED = "ADMIN_REQUEST_APPROVED"
AUDIT_ADMIN_REQUEST_REJECTED = "ADMIN_REQUEST_REJECTED"
AUDIT_SYSTEM_SETTING_CHANGED = "SYSTEM_SETTING_CHANGED"
