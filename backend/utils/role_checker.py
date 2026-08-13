from fastapi import HTTPException


def _normalized_role(role: str) -> str:
    return str(role or "").strip().lower().replace(" ", "_")


def admin_only(current_user):
    if _normalized_role(current_user.role) != "admin":
        raise HTTPException(status_code=403, detail="Access Denied! Admin Only")
    return current_user


def operator_only(current_user):
    if _normalized_role(current_user.role) not in {"operator", "traffic_operator"}:
        raise HTTPException(
            status_code=403,
            detail="Access Denied! Traffic Operator Only",
        )
    return current_user
