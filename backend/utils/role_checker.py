from fastapi import HTTPException


# ==========================================
# Admin Only
# ==========================================
def admin_only(current_user):

    if current_user.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Access Denied! Admin Only"
        )

    return current_user


# ==========================================
# Traffic Operator Only
# ==========================================
def operator_only(current_user):

    if current_user.role != "Traffic Operator":
        raise HTTPException(
            status_code=403,
            detail="Access Denied! Traffic Operator Only"
        )

    return current_user
