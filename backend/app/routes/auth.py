from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

import secrets

from google.oauth2 import id_token
from google.auth.transport import requests

from app.database import get_db

from app.models.user import User
from app.models.deleted_account import DeletedAccount
from app.models.traffic_alert import TrafficAlert
from app.models.prediction_history import PredictionHistory
from app.models.traffic import TrafficRecord

from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    Token,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)

from app.dependencies import get_current_user

from app.constants import (
    ACTIVE,
    AUDIT_LOGIN,
    AUDIT_GOOGLE_LOGIN,
    AUDIT_REGISTER,
    AUDIT_ACCOUNT_DELETED,
)

from app.services.audit_service import (
    build_audit_log_entry,
    log_audit_event,
)

from app.security import (
    hash_password,
    verify_password,
    create_access_token
)

from app.services import password_reset_service

from app.config import GOOGLE_CLIENT_ID


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201
)
def register(
    payload: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new normal user account.

    Public registration can only create an operator account.
    The role is taken from the UserCreate schema and defaults
    to 'operator'.
    """

    # -----------------------------------------------------
    # CHECK WHETHER EMAIL ALREADY EXISTS
    # -----------------------------------------------------

    existing_user = db.query(User).filter(
        User.email == payload.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists."
        )

    # -----------------------------------------------------
    # CHECK WHETHER THIS EMAIL WAS PREVIOUSLY DELETED
    # -----------------------------------------------------

    deleted_account = db.query(DeletedAccount).filter(
        DeletedAccount.email == payload.email
    ).first()

    # -----------------------------------------------------
    # CREATE NEW USER
    # -----------------------------------------------------

    new_user = User(
        name=payload.name,
        email=payload.email,
        password=hash_password(payload.password),

        # Never trust the client with an admin role.
        role="operator",

        google_sub=None
    )

    db.add(new_user)

    # -----------------------------------------------------
    # REMOVE OLD DELETED-ACCOUNT RECORD
    #
    # This allows a previously deleted account to register
    # again using the same email address.
    # -----------------------------------------------------

    if deleted_account:

        db.delete(deleted_account)

    try:

        # Flush (not commit) assigns new_user.id without ending the
        # transaction, so the REGISTER audit entry below can
        # reference it and still roll back together with the user
        # row if anything fails before the real commit.
        db.flush()

        db.add(
            build_audit_log_entry(
                action=AUDIT_REGISTER,
                actor_user=new_user,
                target_user_id=new_user.id,
                metadata={"role": new_user.role}
            )
        )

        db.commit()

        db.refresh(new_user)

    except IntegrityError:

        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists."
        )

    except SQLAlchemyError:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to create account."
        )

    return new_user


# =========================================================
# NORMAL LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=Token
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    db_user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    # -----------------------------------------------------
    # USER DOES NOT EXIST
    # -----------------------------------------------------

    if not db_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # -----------------------------------------------------
    # VERIFY PASSWORD
    # -----------------------------------------------------

    if not verify_password(
        form_data.password,
        db_user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # -----------------------------------------------------
    # ACCOUNT LIFECYCLE CHECK
    #
    # Checked after password verification (not before) so a
    # wrong password on a suspended account still reports
    # "Invalid email or password" rather than leaking account
    # status to someone who doesn't actually own it.
    # -----------------------------------------------------

    if db_user.status != ACTIVE:

        raise HTTPException(
            status_code=403,
            detail=(
                "Your account has been suspended."
                if db_user.status == "suspended"
                else "Your account has been deactivated."
            )
        )

    # -----------------------------------------------------
    # CREATE JWT
    # -----------------------------------------------------

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    # Best-effort: never let an audit-logging hiccup turn a
    # successful login into a failed one.
    log_audit_event(
        db,
        action=AUDIT_LOGIN,
        actor_user=db_user
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role
    }


# =========================================================
# GOOGLE LOGIN
# =========================================================

@router.post(
    "/google",
    response_model=Token
)
def google_login(
    payload: dict,
    db: Session = Depends(get_db)
):

    credential = payload.get("credential")

    # -----------------------------------------------------
    # CHECK CREDENTIAL
    # -----------------------------------------------------

    if not credential:

        raise HTTPException(
            status_code=400,
            detail="Google credential is required"
        )

    # -----------------------------------------------------
    # VERIFY GOOGLE ID TOKEN
    # -----------------------------------------------------

    try:

        google_user = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

    except ValueError:

        raise HTTPException(
            status_code=401,
            detail="Invalid Google credential"
        )

    # -----------------------------------------------------
    # EXTRACT GOOGLE INFORMATION
    # -----------------------------------------------------

    google_email = google_user.get("email")
    google_name = google_user.get("name")
    google_sub = google_user.get("sub")

    if not google_email:

        raise HTTPException(
            status_code=400,
            detail="Google account email not available"
        )

    if not google_sub:

        raise HTTPException(
            status_code=400,
            detail="Google account ID not available"
        )

    # -----------------------------------------------------
    # FIND EXISTING USER
    #
    # IMPORTANT:
    #
    # Google login and normal registration both create
    # accounts, and they must not create duplicates of
    # each other.
    #
    # If no user exists for this verified Google email, that
    # means one of two things:
    #   1. This person has genuinely never signed up before, or
    #   2. Their previous account (this same email) was
    #      deleted via DELETE /auth/me.
    #
    # /auth/register already treats a deleted email as free to
    # re-register (it deletes the matching DeletedAccount row
    # and creates a brand-new User). Google login follows the
    # exact same policy for consistency: a missing User row
    # always means "create a fresh operator account", never
    # "resurrect the old one" - the old row and its data are
    # actually gone, so this is a genuinely new account with a
    # new id, not the deleted account coming back to life.
    # -----------------------------------------------------

    db_user = db.query(User).filter(
        User.email == google_email
    ).first()

    # Tracked for the GOOGLE_LOGIN audit entry's metadata below, so
    # the audit trail can distinguish "signed up via Google" from
    # "logged in via Google" without needing a separate action type.
    is_new_account = False

    # -----------------------------------------------------
    # NO EXISTING USER -> CREATE A FRESH ACCOUNT
    # -----------------------------------------------------

    if not db_user:

        is_new_account = True

        # Remove any stale deleted-account record for this
        # email, same as normal registration does, so it can
        # never block or confuse a future signup.
        stale_deleted_account = db.query(DeletedAccount).filter(
            DeletedAccount.email == google_email
        ).first()

        new_user = User(
            name=google_name or google_email.split("@")[0],
            email=google_email,

            # Google accounts have no TrafficVision password.
            # Store a securely-random hash (never shared with
            # the user) so POST /auth/login can never
            # authenticate this account with a guessed/empty
            # password.
            password=hash_password(secrets.token_urlsafe(32)),

            # Never trust the client with an admin role.
            role="operator",

            google_sub=google_sub
        )

        db.add(new_user)

        if stale_deleted_account:

            db.delete(stale_deleted_account)

        try:

            db.commit()

            db.refresh(new_user)

        except IntegrityError:

            db.rollback()

            raise HTTPException(
                status_code=409,
                detail="An account with this email already exists."
            )

        except SQLAlchemyError:

            db.rollback()

            raise HTTPException(
                status_code=500,
                detail="Failed to create account."
            )

        db_user = new_user

    # -----------------------------------------------------
    # CHECK GOOGLE SUB
    #
    # If the existing account has no Google account linked,
    # link this verified Google account.
    # -----------------------------------------------------

    elif not db_user.google_sub:

        db_user.google_sub = google_sub

        try:

            db.commit()

            db.refresh(db_user)

        except IntegrityError:

            db.rollback()

            raise HTTPException(
                status_code=409,
                detail="This Google account is already linked to another account."
            )

    # -----------------------------------------------------
    # GOOGLE SUB EXISTS BUT DOES NOT MATCH
    #
    # This means the email belongs to one account but the
    # Google identity being used is different.
    # -----------------------------------------------------

    elif db_user.google_sub != google_sub:

        raise HTTPException(
            status_code=403,
            detail=(
                "This Google account is not linked to this account."
            )
        )

    # -----------------------------------------------------
    # ACCOUNT LIFECYCLE CHECK
    #
    # Applies uniformly to all three branches above: a
    # brand-new user is always "active" by default so this
    # is a no-op for signup, but it stops a suspended or
    # deactivated existing account from getting a token just
    # because Google authentication succeeded. Google auth
    # proves *identity*, not *authorization* - it must not be
    # able to bypass a restriction normal login also enforces.
    # -----------------------------------------------------

    if db_user.status != ACTIVE:

        raise HTTPException(
            status_code=403,
            detail=(
                "Your account has been suspended."
                if db_user.status == "suspended"
                else "Your account has been deactivated."
            )
        )

    # -----------------------------------------------------
    # CREATE TRAFFICVISION JWT
    # -----------------------------------------------------

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    # Best-effort: never let an audit-logging hiccup turn a
    # successful Google login into a failed one.
    log_audit_event(
        db,
        action=AUDIT_GOOGLE_LOGIN,
        actor_user=db_user,
        metadata={"created_new_account": is_new_account}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role
    }


# =========================================================
# GET CURRENT USER
# =========================================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):

    return current_user


# =========================================================
# UPDATE CURRENT USER
# =========================================================

@router.put(
    "/me",
    response_model=UserResponse
)
def update_me(
    payload: UserUpdate,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)
):

    current_user.name = payload.name

    try:

        db.commit()

        db.refresh(current_user)

    except SQLAlchemyError:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to update account."
        )

    return current_user


# =========================================================
# DELETE ACCOUNT
# =========================================================

@router.delete("/me")
def delete_account(
    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)
):

    print()
    print("========== DELETE ACCOUNT START ==========")

    print(
        f"User ID: {current_user.id}"
    )

    print(
        f"User email: {current_user.email}"
    )

    try:

        # -------------------------------------------------
        # SAVE VALUES BEFORE DELETING USER
        # -------------------------------------------------

        user_id = current_user.id
        user_email = current_user.email
        google_sub = current_user.google_sub

        # -------------------------------------------------
        # STEP 1
        # SAVE DELETED ACCOUNT INFORMATION
        # -------------------------------------------------

        print(
            "Step 1: Saving deleted account..."
        )

        deleted_account = DeletedAccount(
            email=user_email,
            google_sub=google_sub
        )

        db.add(deleted_account)

        # -------------------------------------------------
        # STEP 2
        # DELETE TRAFFIC ALERTS
        # -------------------------------------------------

        print(
            "Step 2: Deleting traffic alerts..."
        )

        db.query(TrafficAlert).filter(
            TrafficAlert.user_id == user_id
        ).delete(
            synchronize_session=False
        )

        # -------------------------------------------------
        # STEP 3
        # DELETE PREDICTION HISTORY
        # -------------------------------------------------

        print(
            "Step 3: Deleting prediction history..."
        )

        db.query(PredictionHistory).filter(
            PredictionHistory.user_id == user_id
        ).delete(
            synchronize_session=False
        )

        # -------------------------------------------------
        # STEP 4
        # DELETE TRAFFIC RECORDS
        # -------------------------------------------------

        print(
            "Step 4: Deleting traffic records..."
        )

        db.query(TrafficRecord).filter(
            TrafficRecord.user_id == user_id
        ).delete(
            synchronize_session=False
        )

        # -------------------------------------------------
        # IMPORTANT:
        #
        # DO NOT DELETE FROM predictions USING user_id.
        #
        # Your actual PostgreSQL predictions table does not
        # currently contain a user_id column.
        #
        # Attempting:
        #
        # Prediction.user_id == current_user.id
        #
        # caused:
        #
        # psycopg2.errors.UndefinedColumn
        #
        # Therefore predictions are intentionally NOT
        # queried here.
        # -------------------------------------------------

        print(
            "Step 5: Deleting user..."
        )

        # -------------------------------------------------
        # STEP 5
        # DELETE USER
        # -------------------------------------------------

        db.delete(current_user)

        # -------------------------------------------------
        # AUDIT LOG
        #
        # Added to the SAME session/transaction as the
        # deletion above, not committed separately - if any
        # earlier step in this try block fails and we hit
        # one of the except branches below, this entry rolls
        # back along with everything else, so there is never
        # an ACCOUNT_DELETED audit row for a deletion that
        # didn't actually happen (same principle already
        # applied to the deleted_accounts row in Step 1).
        #
        # actor_user_id/target_user_id will end up NULL once
        # this commits (see AuditLog's ON DELETE SET NULL),
        # since the user row they'd reference is being
        # deleted in this same transaction. actor_email is a
        # plain string, not a foreign key, so it survives and
        # keeps the record readable.
        # -------------------------------------------------

        db.add(
            build_audit_log_entry(
                action=AUDIT_ACCOUNT_DELETED,
                actor_email=user_email,
                target_user_id=user_id,
                metadata={"email": user_email}
            )
        )

        # -------------------------------------------------
        # STEP 6
        # COMMIT EVERYTHING
        # -------------------------------------------------

        print(
            "Step 6: Committing..."
        )

        db.commit()

        print()
        print("========== DELETE ACCOUNT SUCCESS ==========")
        print()

        return {
            "message": "Account deleted successfully"
        }

    except IntegrityError as error:

        db.rollback()

        print()
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("ACCOUNT DELETE ERROR")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

        print(
            "ERROR TYPE: IntegrityError"
        )

        print(
            f"ERROR: {error}"
        )

        print(
            "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Account could not be deleted because "
                "related data still exists."
            )
        )

    except SQLAlchemyError as error:

        db.rollback()

        print()
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("ACCOUNT DELETE ERROR")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

        print(
            "ERROR TYPE: SQLAlchemyError"
        )

        print(
            f"ERROR: {error}"
        )

        print(
            "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete your account."
        )

    except Exception as error:

        db.rollback()

        print()
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("ACCOUNT DELETE ERROR")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

        print(
            "ERROR TYPE: Unexpected Error"
        )

        print(
            f"ERROR: {error}"
        )

        print(
            "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete your account."
        )


# =========================================================
# FORGOT PASSWORD
# =========================================================

@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,

    db: Session = Depends(get_db)
):

    password_reset_service.request_password_reset(
        db,
        payload.email
    )

    return {
        "message": (
            "If the email exists, "
            "a password reset link has been sent."
        )
    }


# =========================================================
# RESET PASSWORD
# =========================================================

@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,

    db: Session = Depends(get_db)
):

    success = password_reset_service.reset_password(
        db,
        payload.token,
        payload.new_password
    )

    if not success:

        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )

    return {
        "message": "Password reset successful."
    }