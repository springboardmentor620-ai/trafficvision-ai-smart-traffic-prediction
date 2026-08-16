from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional
 
from app.database import get_db
from app.dependencies import require_admin
from app.models.user import User
 
from app.schemas.user import UserResponse
from app.schemas.admin import AdminUserListResponse
 
from app.services import admin_management_service
 
 
router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)
 
 
# =========================================================
# LIST / SEARCH / FILTER USERS
# =========================================================
 
@router.get(
    "/users",
    response_model=AdminUserListResponse
)
def list_users(
    search: Optional[str] = Query(None, description="Matches name or email"),
    role: Optional[str] = Query(None, description="Exact role filter"),
    status: Optional[str] = Query(None, description="Exact status filter"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
 
    db: Session = Depends(get_db),
 
    # This is the real security boundary for "Admin can view/search
    # users" - not any frontend check. An operator calling this
    # directly gets 403, regardless of what the frontend shows.
    current_user: User = Depends(require_admin)
):
 
    items, total = admin_management_service.list_users(
        db,
        search=search,
        role=role,
        status=status,
        page=page,
        page_size=page_size
    )
 
    return AdminUserListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )
 
 
# =========================================================
# VIEW USER DETAILS
# =========================================================
 
@router.get(
    "/users/{user_id}",
    response_model=UserResponse
)
def get_user_detail(
    user_id: int,
 
    db: Session = Depends(get_db),
 
    current_user: User = Depends(require_admin)
):
 
    try:
 
        user = admin_management_service.get_user(db, user_id)
 
    except ValueError as error:
 
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )
 
    return user
 
 
# =========================================================
# SUSPEND USER
# =========================================================
 
@router.post(
    "/users/{user_id}/suspend",
    response_model=UserResponse
)
def suspend_user(
    user_id: int,
 
    db: Session = Depends(get_db),
 
    current_user: User = Depends(require_admin)
):
 
    try:
 
        target_user = admin_management_service.suspend_user(
            db,
            target_user_id=user_id,
            acted_by=current_user
        )
 
    except ValueError as error:
 
        raise HTTPException(
            status_code=409,
            detail=str(error)
        )
 
    except SQLAlchemyError:
 
        raise HTTPException(
            status_code=500,
            detail="Failed to suspend user."
        )
 
    return target_user
 
 
# =========================================================
# RESTORE USER
# =========================================================
 
@router.post(
    "/users/{user_id}/restore",
    response_model=UserResponse
)
def restore_user(
    user_id: int,
 
    db: Session = Depends(get_db),
 
    current_user: User = Depends(require_admin)
):
 
    try:
 
        target_user = admin_management_service.restore_user(
            db,
            target_user_id=user_id,
            acted_by=current_user
        )
 
    except ValueError as error:
 
        raise HTTPException(
            status_code=409,
            detail=str(error)
        )
 
    except SQLAlchemyError:
 
        raise HTTPException(
            status_code=500,
            detail="Failed to restore user."
        )
 
    return target_user
 