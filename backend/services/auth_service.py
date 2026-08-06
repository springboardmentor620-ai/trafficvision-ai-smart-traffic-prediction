"""Small development authentication store used when PostgreSQL is not configured.

It preserves the existing API contract and lets the application run locally; replace
with hashed database credentials before production deployment.
"""
_users = {
    "admin@trafficvision.com": {"password": "admin123", "role": "Admin"},
    "user@trafficvision.com": {"password": "user123", "role": "Public User"},
    "operator@trafficvision.com": {"password": "operator123", "role": "Traffic Operator"},
}


def authenticate(email, password):
    user = _users.get(email.lower())
    if user and user["password"] == password:
        return {"status": "success", "message": "Login successful", "email": email.lower(), "role": user["role"]}
    return {"status": "failed", "message": "Invalid email or password"}


def register(email, password, role):
    email = email.lower()
    if email in _users:
        return {"status": "failed", "message": "An account with this email already exists."}
    _users[email] = {"password": password, "role": role}
    return {"status": "success", "message": "Account created", "email": email, "role": role}
