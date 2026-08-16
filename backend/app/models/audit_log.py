from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func

from app.database import Base


class AuditLog(Base):
    """
    Records security/administrative events (login, registration, account
    deletion, and - starting in later steps - suspensions, promotions,
    admin invitations, etc.).

    This is a brand-new table, so it is safe to create via
    Base.metadata.create_all() the normal way this project already
    creates new tables - no ALTER on any existing table is involved.
    See migrations/002_audit_logs.sql for the exact equivalent SQL if
    you'd rather run it manually before restarting the server.

    Deliberately never stores passwords, tokens, or other credentials -
    only actor/action/target identifiers and small, non-sensitive
    metadata (e.g. {"role_before": "operator", "role_after": "admin"}).
    """

    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Who performed the action. Nullable and ON DELETE SET NULL
    # (not CASCADE) on purpose: an audit trail must survive the
    # actor's account being deleted later - deleting a user must
    # never silently erase the history of what they did. actor_email
    # is stored separately (a plain string, not a foreign key) so the
    # record stays human-readable even after actor_user_id is nulled
    # out by that ON DELETE SET NULL.
    actor_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    actor_email = Column(
        String,
        nullable=True
    )

    # One of app.constants.ALL_AUDIT_ACTIONS (e.g. "LOGIN",
    # "REGISTER", "ACCOUNT_DELETED"). Plain string rather than a DB
    # enum/CHECK constraint, since this vocabulary is expected to
    # grow over Steps 3-5 (ADMIN_INVITED, USER_PROMOTED, etc.) and a
    # CHECK constraint would need a migration every time a new action
    # type is added.
    action = Column(
        String,
        nullable=False,
        index=True
    )

    # Who the action was performed on, when applicable (e.g. an
    # admin suspending an operator). Left NULL for self-actions like
    # a user's own login/registration, where actor already identifies
    # the relevant person. Same ON DELETE SET NULL reasoning as
    # actor_user_id above.
    target_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Small, non-sensitive structured detail about the event (e.g.
    # {"created_new_account": true}, {"role_before": "operator",
    # "role_after": "admin"}). Column name is "metadata" in the
    # database; the Python attribute is named event_metadata because
    # SQLAlchemy's declarative Base already reserves the name
    # "metadata" on every model class.
    event_metadata = Column(
        "metadata",
        JSON,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True
    )
