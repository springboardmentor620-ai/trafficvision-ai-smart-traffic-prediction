"""Service layer for promote/demote, the admin request/approval flow,
user listing/suspend/restore (Step 5), plus the last-super-admin
protection helper reused by account deletion. Same pattern as
admin_invitation_service.py and password_reset_service.py: thin
routes, logic here, ValueError for any rejected case which the
calling route turns into an HTTPException.
"""
 
from datetime import datetime, timezone
 
from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
 
from app.models.user import User
from app.models.admin_request import AdminRequest
from app.constants import (
    OPERATOR,
    ADMIN,
    SUPER_ADMIN,
    ACTIVE,
    SUSPENDED,
    AUDIT_USER_PROMOTED,
    AUDIT_USER_DEMOTED,
    AUDIT_ADMIN_REQUEST_APPROVED,
    AUDIT_ADMIN_REQUEST_REJECTED,
    AUDIT_ACCOUNT_SUSPENDED,
    AUDIT_ACCOUNT_RESTORED,
)
from app.services.audit_service import build_audit_log_entry
 
 
def count_active_super_admins(db: Session, exclude_user_id=None) -> int:
    """
    Counts currently-active super_admin accounts, optionally
    excluding one user id (used to answer "how many OTHER active
    super_admins are there besides this one"). A suspended/
    deactivated super_admin is not counted - if the only other
    super_admin isn't actually usable, there is effectively no
    working backup.
    """
 
    query = db.query(User).filter(
        User.role == SUPER_ADMIN,
        User.status == ACTIVE
    )
 
    if exclude_user_id is not None:
 
        query = query.filter(User.id != exclude_user_id)
 
    return query.count()
 
 
def assert_not_last_super_admin(db: Session, user: User):
    """
    Raises ValueError if `user` is a super_admin and removing them
    (by deletion, demotion, suspension, etc.) would leave zero active
    super_admins. No-op for any non-super_admin user. Currently
    called from DELETE /auth/me; written as a standalone, reusable
    check so future operations (e.g. a Step 5 suspend/deactivate
    endpoint) can reuse it without duplicating this logic.
    """
 
    if user.role != SUPER_ADMIN:
 
        return
 
    remaining = count_active_super_admins(db, exclude_user_id=user.id)
 
    if remaining == 0:
 
        raise ValueError(
            "This is the last active super_admin account and "
            "cannot be removed. Promote another user to "
            "super_admin first."
        )
 
 
def promote_to_admin(db: Session, target_user_id: int, acted_by: User) -> User:
    """
    Promotes an OPERATOR to ADMIN. Never promotes to SUPER_ADMIN -
    that role is only ever assigned by a manual database bootstrap
    (see migrations/001_rbac_foundation.sql), never through any API
    endpoint, so this function structurally cannot be used to create
    a super_admin no matter who calls it.
    """
 
    target_user = db.query(User).filter(
        User.id == target_user_id
    ).first()
 
    if not target_user:
 
        raise ValueError(
            "User not found."
        )
 
    if target_user.role != OPERATOR:
 
        raise ValueError(
            "Only an operator can be promoted to admin."
        )
 
    role_before = target_user.role
 
    target_user.role = ADMIN
 
    db.add(
        build_audit_log_entry(
            action=AUDIT_USER_PROMOTED,
            actor_user=acted_by,
            target_user_id=target_user.id,
            metadata={
                "role_before": role_before,
                "role_after": ADMIN
            }
        )
    )
 
    try:
 
        db.commit()
 
        db.refresh(target_user)
 
    except SQLAlchemyError:
 
        db.rollback()
 
        raise
 
    return target_user
 
 
def demote_to_operator(db: Session, target_user_id: int, acted_by: User) -> User:
    """
    Demotes an ADMIN back to OPERATOR. Only ever operates on a
    target whose CURRENT role is exactly "admin" - a super_admin can
    never reach this function's role-change logic (they'd fail the
    check below), so no last-super-admin protection is needed here:
    this function structurally cannot touch a super_admin account.
    """
 
    target_user = db.query(User).filter(
        User.id == target_user_id
    ).first()
 
    if not target_user:
 
        raise ValueError(
            "User not found."
        )
 
    if target_user.role != ADMIN:
 
        raise ValueError(
            "Only an admin can be demoted to operator."
        )
 
    role_before = target_user.role
 
    target_user.role = OPERATOR
 
    db.add(
        build_audit_log_entry(
            action=AUDIT_USER_DEMOTED,
            actor_user=acted_by,
            target_user_id=target_user.id,
            metadata={
                "role_before": role_before,
                "role_after": OPERATOR
            }
        )
    )
 
    try:
 
        db.commit()
 
        db.refresh(target_user)
 
    except SQLAlchemyError:
 
        db.rollback()
 
        raise
 
    return target_user
 
 
def create_admin_request(db: Session, requester: User) -> AdminRequest:
    """
    Lets an OPERATOR ask to become an ADMIN. Only operators may
    submit a request - an existing admin/super_admin has no reason
    to "request" a role they already have or exceed.
    """
 
    if requester.role != OPERATOR:
 
        raise ValueError(
            "Only operators can request admin access."
        )
 
    existing_pending = db.query(AdminRequest).filter(
        AdminRequest.requester_id == requester.id,
        AdminRequest.status == "pending"
    ).first()
 
    if existing_pending:
 
        raise ValueError(
            "You already have a pending admin request."
        )
 
    request = AdminRequest(
        requester_id=requester.id,
        status="pending"
    )
 
    db.add(request)
 
    try:
 
        db.commit()
 
        db.refresh(request)
 
    except SQLAlchemyError:
 
        db.rollback()
 
        raise
 
    return request
 
 
def approve_admin_request(
    db: Session,
    request_id: int,
    reviewed_by: User
) -> User:
    """
    Approves a pending admin request, promoting its requester to
    ADMIN. Returns the newly-promoted User.
    """
 
    request = db.query(AdminRequest).filter(
        AdminRequest.id == request_id
    ).first()
 
    if not request:
 
        raise ValueError(
            "Admin request not found."
        )
 
    if request.status != "pending":
 
        raise ValueError(
            "This request has already been reviewed."
        )
 
    # An administrator must never be able to approve (or reject -
    # see reject_admin_request below) their own request, even if
    # they were promoted to super_admin sometime after submitting
    # it. require_super_admin already guarantees reviewed_by isn't
    # the operator who just submitted this in the normal case, but
    # this guard covers that edge case explicitly rather than
    # relying only on role timing.
    if request.requester_id == reviewed_by.id:
 
        raise ValueError(
            "You cannot approve your own admin request."
        )
 
    requester = db.query(User).filter(
        User.id == request.requester_id
    ).first()
 
    if not requester:
 
        raise ValueError(
            "The requesting account no longer exists."
        )
 
    if requester.role != OPERATOR:
 
        raise ValueError(
            "The requesting account is no longer an operator "
            "(its role may have already changed)."
        )
 
    role_before = requester.role
 
    requester.role = ADMIN
 
    request.status = "approved"
    request.reviewed_by_id = reviewed_by.id
    request.reviewed_at = datetime.now(timezone.utc)
 
    db.add(
        build_audit_log_entry(
            action=AUDIT_ADMIN_REQUEST_APPROVED,
            actor_user=reviewed_by,
            target_user_id=requester.id,
            metadata={
                "admin_request_id": request.id,
                "role_before": role_before,
                "role_after": ADMIN
            }
        )
    )
 
    try:
 
        db.commit()
 
        db.refresh(requester)
 
    except SQLAlchemyError:
 
        db.rollback()
 
        raise
 
    return requester
 
 
def reject_admin_request(
    db: Session,
    request_id: int,
    reviewed_by: User
) -> AdminRequest:
    """
    Rejects a pending admin request. Does not change the
    requester's role.
    """
 
    request = db.query(AdminRequest).filter(
        AdminRequest.id == request_id
    ).first()
 
    if not request:
 
        raise ValueError(
            "Admin request not found."
        )
 
    if request.status != "pending":
 
        raise ValueError(
            "This request has already been reviewed."
        )
 
    if request.requester_id == reviewed_by.id:
 
        raise ValueError(
            "You cannot reject your own admin request."
        )
 
    request.status = "rejected"
    request.reviewed_by_id = reviewed_by.id
    request.reviewed_at = datetime.now(timezone.utc)
 
    db.add(
        build_audit_log_entry(
            action=AUDIT_ADMIN_REQUEST_REJECTED,
            actor_user=reviewed_by,
            target_user_id=request.requester_id,
            metadata={"admin_request_id": request.id}
        )
    )
 
    try:
 
        db.commit()
 
        db.refresh(request)
 
    except SQLAlchemyError:
 
        db.rollback()
 
        raise
 
    return request
 
 
# =========================================================
# USER MANAGEMENT (Step 5)
# =========================================================
 
def list_users(
    db: Session,
    search: str = None,
    role: str = None,
    status: str = None,
    page: int = 1,
    page_size: int = 20
):
    """
    Lists users with optional search (matches name or email,
    case-insensitive substring) and exact role/status filters, plus
    pagination. Returns (items, total).
    """
 
    query = db.query(User)
 
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(User.name.ilike(pattern), User.email.ilike(pattern))
        )
 
    if role:
        query = query.filter(User.role == role)
 
    if status:
        query = query.filter(User.status == status)
 
    total = query.count()
 
    page = max(page, 1)
    page_size = max(min(page_size, 100), 1)
 
    items = (
        query
        .order_by(User.id.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
 
    return items, total
 
 
def get_user(db: Session, user_id: int) -> User:
    """Fetches a single user by id. Raises ValueError if not found."""
 
    user = db.query(User).filter(User.id == user_id).first()
 
    if not user:
        raise ValueError("User not found.")
 
    return user
 
 
def _assert_can_target_for_suspend_restore(target_user: User, acted_by: User):
    """
    Shared authorization guard for suspend_user/restore_user:
 
    - A super_admin can never be targeted through this action at
      all, by anyone, regardless of who's asking. This is a
      deliberately stronger guarantee than "protect the LAST
      super_admin" - no super_admin can be suspended/restored here,
      full stop. If a super_admin genuinely needs to be suspended,
      that's a manual database operation, consistent with how
      super_admin accounts are only ever created manually (see
      migrations/001_rbac_foundation.sql).
    - An admin target can only be acted on by a super_admin (matches
      the spec: "Super Admin can: Suspend/deactivate administrators
      where appropriate"; "Admins MUST NOT: Perform unrestricted
      security-critical operations").
    - An operator target can be acted on by an admin or a
      super_admin (both already pass require_admin at the route
      level).
    - Acting on your own account is never allowed here (an admin
      suspending themselves would lock themselves out).
    """
 
    if target_user.id == acted_by.id:
        raise ValueError(
            "You cannot suspend or restore your own account."
        )
 
    if target_user.role == SUPER_ADMIN:
        raise ValueError(
            "Super admin accounts cannot be suspended or restored "
            "through this action."
        )
 
    if target_user.role == ADMIN and acted_by.role != SUPER_ADMIN:
        raise ValueError(
            "Only a super_admin can suspend or restore an admin."
        )
 
 
def suspend_user(db: Session, target_user_id: int, acted_by: User) -> User:
    """Suspends a user (operator, by an admin or super_admin; admin,
    by a super_admin only)."""
 
    target_user = db.query(User).filter(
        User.id == target_user_id
    ).first()
 
    if not target_user:
        raise ValueError("User not found.")
 
    _assert_can_target_for_suspend_restore(target_user, acted_by)
 
    if target_user.status == SUSPENDED:
        raise ValueError("This account is already suspended.")
 
    status_before = target_user.status
 
    target_user.status = SUSPENDED
 
    db.add(
        build_audit_log_entry(
            action=AUDIT_ACCOUNT_SUSPENDED,
            actor_user=acted_by,
            target_user_id=target_user.id,
            metadata={
                "status_before": status_before,
                "status_after": SUSPENDED
            }
        )
    )
 
    try:
 
        db.commit()
 
        db.refresh(target_user)
 
    except SQLAlchemyError:
 
        db.rollback()
 
        raise
 
    return target_user
 
 
def restore_user(db: Session, target_user_id: int, acted_by: User) -> User:
    """Restores a suspended user back to active (same authorization
    rules as suspend_user)."""
 
    target_user = db.query(User).filter(
        User.id == target_user_id
    ).first()
 
    if not target_user:
        raise ValueError("User not found.")
 
    _assert_can_target_for_suspend_restore(target_user, acted_by)
 
    if target_user.status != SUSPENDED:
        raise ValueError("This account is not currently suspended.")
 
    target_user.status = ACTIVE
 
    db.add(
        build_audit_log_entry(
            action=AUDIT_ACCOUNT_RESTORED,
            actor_user=acted_by,
            target_user_id=target_user.id,
            metadata={
                "status_before": SUSPENDED,
                "status_after": ACTIVE
            }
        )
    )
 
    try:
 
        db.commit()
 
        db.refresh(target_user)
 
    except SQLAlchemyError:
 
        db.rollback()
 
        raise
 
    return target_user
 