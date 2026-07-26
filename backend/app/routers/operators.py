from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from app.database.session import get_db
from app.middleware.dependencies import require_roles
from app.repositories.operator_repository import OperatorRepository
from app.schemas.operator import (
    CreateOperatorSchema,
    UpdateOperatorSchema,
    UpdateOperatorStatusSchema,
    OperatorResponseSchema,
    CreateOperatorResponseSchema,
    ResetPasswordResponseSchema
)

router = APIRouter(
    prefix="/operators",
    tags=["Operator Management"],
    dependencies=[Depends(require_roles(["Admin"]))]
)

from app.utils.cache import ttl_cache

@router.get("", response_model=List[OperatorResponseSchema])
@router.get("/", response_model=List[OperatorResponseSchema])
def list_operators(
    search: Optional[str] = Query(None, description="Search query by name, email, or phone"),
    zone: Optional[str] = Query(None, description="Filter by zone name"),
    status: Optional[str] = Query(None, description="Filter by status: ACTIVE or INACTIVE"),
    db: Session = Depends(get_db)
):
    """
    GET /api/v1/operators
    Retrieve filtered list of traffic operators stored in Supabase with 5-minute TTL caching.
    """
    cache_key = f"operators_list_{search or 'all'}_{zone or 'all'}_{status or 'all'}"
    cached = ttl_cache.get(cache_key)
    if cached:
        return cached

    res = OperatorRepository.get_all_operators(db, search=search, zone=zone, status_filter=status)
    ttl_cache.set(cache_key, res, ttl_seconds=300)
    return res

@router.get("/{id}", response_model=OperatorResponseSchema)
def get_operator(id: int, db: Session = Depends(get_db)):
    """
    GET /api/v1/operators/{id}
    Retrieve detailed profile for a specific operator.
    """
    op = OperatorRepository.get_operator_by_id(db, id)
    if not op:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Operator with ID {id} not found.")
    return op

@router.post("", response_model=CreateOperatorResponseSchema, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=CreateOperatorResponseSchema, status_code=status.HTTP_201_CREATED)
def create_operator(payload: CreateOperatorSchema, db: Session = Depends(get_db)):
    """
    POST /api/v1/operators
    Provision a new Traffic Operator in Supabase.
    Automatically generates a secure temporary password, bcrypt hashes it, and returns the temporary password ONCE.
    """
    return OperatorRepository.create_operator(db, payload.dict())

@router.put("/{id}", response_model=OperatorResponseSchema)
def update_operator(id: int, payload: UpdateOperatorSchema, db: Session = Depends(get_db)):
    """
    PUT /api/v1/operators/{id}
    Update operator profile details (Name, Email, Phone, Zone, Status).
    """
    updated = OperatorRepository.update_operator(db, id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Operator with ID {id} not found.")
    return updated

@router.delete("/{id}")
def delete_operator(id: int, db: Session = Depends(get_db)):
    """
    DELETE /api/v1/operators/{id}
    Delete an operator and unassign their roads in Supabase.
    """
    OperatorRepository.delete_operator(db, id)
    return {"message": f"Operator with ID {id} deleted successfully."}

@router.put("/{id}/status", response_model=OperatorResponseSchema)
def update_operator_status(id: int, payload: UpdateOperatorStatusSchema, db: Session = Depends(get_db)):
    """
    PUT /api/v1/operators/{id}/status
    Activate or Deactivate an operator account.
    """
    return OperatorRepository.update_operator_status(db, id, payload.status)

@router.post("/{id}/reset-password", response_model=ResetPasswordResponseSchema)
def reset_operator_password(id: int, db: Session = Depends(get_db)):
    """
    POST /api/v1/operators/{id}/reset-password
    Reset password for an operator: automatically generates a secure temporary password, bcrypt hashes it, and returns it.
    """
    return OperatorRepository.reset_operator_password(db, id)
