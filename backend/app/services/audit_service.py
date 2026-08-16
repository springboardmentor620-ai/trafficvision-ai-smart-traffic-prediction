from sqlalchemy.exc import SQLAlchemyError

from app.models.audit_log import AuditLog


def build_audit_log_entry(
    action,
    actor_user=None,
    actor_email=None,
    target_user_id=None,
    metadata=None
):
    """
    Construct (but do not save) an AuditLog row.

    Use this when the audit entry must live or die with an existing
    database transaction - e.g. REGISTER should only be recorded if
    the new user row actually commits, and ACCOUNT_DELETED must only
    be recorded if the account deletion itself succeeds. Callers
    db.add() the returned object into their own session and let their
    existing commit()/rollback() handle it; this function never
    touches the database itself.
    """

    return AuditLog(
        actor_user_id=actor_user.id if actor_user else None,
        actor_email=actor_email or (actor_user.email if actor_user else None),
        action=action,
        target_user_id=target_user_id,
        event_metadata=metadata or {}
    )


def log_audit_event(
    db,
    action,
    actor_user=None,
    actor_email=None,
    target_user_id=None,
    metadata=None
):
    """
    Build and immediately save an AuditLog row in its own small,
    separate commit.

    Use this for events that are not otherwise inside a database
    transaction - e.g. a successful login doesn't write anything else
    to the database, so there's nothing for the audit row to "ride
    along" with. Deliberately best-effort: a failure to write the
    audit row is swallowed (rolled back and printed) rather than
    raised, so a hiccup in audit logging can never turn a successful
    login/registration response into a 500 error. Audit logging
    should observe the system, never be able to break it.
    """

    entry = build_audit_log_entry(
        action=action,
        actor_user=actor_user,
        actor_email=actor_email,
        target_user_id=target_user_id,
        metadata=metadata
    )

    try:

        db.add(entry)

        db.commit()

    except SQLAlchemyError as error:

        db.rollback()

        print(
            f"[audit] failed to log '{action}' event: {error}"
        )
