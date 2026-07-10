"""
TrafficVision AI - Milestone 1 Backend
Modules covered:
 - User Management (register/login, roles: admin, operator, JWT auth, profile)
 - Traffic Monitoring (live vehicle density + congestion, road utilization)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta, datetime
import sqlite3
import random
import os

app = Flask(__name__)
CORS(app)  # allow the frontend (served from a different origin/port) to call this API

# ---- Config ----
app.config["JWT_SECRET_KEY"] = "trafficvision-super-secret-key-change-me"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=8)
jwt = JWTManager(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "traffic.db")
VALID_ROLES = ("admin", "operator")


# ---- Database helpers ----
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin','operator'))
        )
    """)
    conn.commit()
    conn.close()


init_db()


def now_iso():
    return datetime.utcnow().isoformat() + "Z"


# ============================================================
# 1. USER MANAGEMENT MODULE
# ============================================================

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role") or ""

    if not name or not email or not password or not role:
        return jsonify({"message": "All fields are required."}), 400
    if role not in VALID_ROLES:
        return jsonify({"message": "Invalid role selected."}), 400
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters."}), 400

    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"message": "Email already registered."}), 409

    password_hash = generate_password_hash(password)
    cur = conn.execute(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        (name, email, password_hash, role)
    )
    conn.commit()
    user_id = cur.lastrowid
    conn.close()

    token = create_access_token(
        identity=str(user_id),
        additional_claims={"role": role, "name": name, "email": email}
    )

    return jsonify({
        "message": "Registration successful.",
        "token": token,
        "user": {"id": user_id, "name": name, "email": email, "role": role}
    }), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"message": "Invalid email or password."}), 401

    token = create_access_token(
        identity=str(user["id"]),
        additional_claims={"role": user["role"], "name": user["name"], "email": user["email"]}
    )

    return jsonify({
        "message": "Login successful.",
        "token": token,
        "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}
    }), 200


@app.route("/api/profile", methods=["GET"])
@jwt_required()
def profile():
    claims = get_jwt()
    return jsonify({
        "id": get_jwt_identity(),
        "name": claims.get("name"),
        "email": claims.get("email"),
        "role": claims.get("role")
    }), 200


# ============================================================
# 2. TRAFFIC MONITORING MODULE
# ============================================================

ROADS = ["MG Road", "Ring Road", "Airport Highway", "Station Road", "City Centre Junction"]


@app.route("/api/traffic/live", methods=["GET"])
@jwt_required()
def live_traffic():
    """Live vehicle density tracking + congestion monitoring (visible to admin & operator)."""
    data = []
    for road in ROADS:
        vehicle_count = random.randint(20, 300)
        density = round(vehicle_count / 300 * 100, 1)
        if density > 75:
            status = "Heavy Congestion"
        elif density > 45:
            status = "Moderate"
        else:
            status = "Smooth"
        data.append({
            "road": road,
            "vehicle_count": vehicle_count,
            "density_percent": density,
            "status": status
        })
    return jsonify({"timestamp": now_iso(), "roads": data}), 200


@app.route("/api/traffic/roads", methods=["GET"])
@jwt_required()
def road_utilization():
    """Road utilization analysis - restricted to admin role (role-based access control)."""
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Access restricted to admin role."}), 403

    data = [{"road": r, "utilization_percent": round(random.uniform(30, 95), 1)} for r in ROADS]
    return jsonify({"roads": data}), 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)