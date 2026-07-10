from flask import Flask, send_from_directory, jsonify, request, abort
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
import sys
import sqlite3
import hashlib
from datetime import datetime

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

app = Flask(__name__)
CORS(app)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'your-super-secret-key-change-this-in-production'
jwt = JWTManager(app)

# IMPORTANT: Disable directory listings
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['EXPLAIN_TEMPLATE_LOADING'] = False

# ========== VALIDATION FUNCTIONS ==========

def validate_email(email):
    """Validate email must be @gmail.com"""
    if not email:
        return False
    return email.endswith('@gmail.com') and len(email) > 10

def validate_password(password):
    """Validate password: min 6 chars, at least 1 special char, 1 number"""
    if not password or len(password) < 6:
        return False, "Password must be at least 6 characters long"
    
    if not any(char in "!@#$%^&*(),.?\":{}|<>" for char in password):
        return False, "Password must contain at least 1 special character (!@#$%^&*)"
    
    if not any(char.isdigit() for char in password):
        return False, "Password must contain at least 1 number"
    
    return True, "Password is valid"

# Database setup
def get_db_connection():
    conn = sqlite3.connect('backend/traffic.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if users table exists and what columns it has
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    table_exists = cursor.fetchone()
    
    if table_exists:
        # Check if password column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        has_password = any(col['name'] == 'password' for col in columns)
        
        if not has_password:
            # Drop the old table and recreate
            print("⚠️ Old users table found without password column. Recreating...")
            cursor.execute("DROP TABLE users")
            table_exists = None
    
    if not table_exists:
        # Create users table with proper schema
        cursor.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        print("✅ Users table created successfully")
    
    conn.close()

def create_default_admin():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if admin exists
    admin = cursor.execute("SELECT * FROM users WHERE email = 'admin@gmail.com'").fetchone()
    
    if not admin:
        # Create default admin with valid password
        hashed_password = hashlib.sha256("Admin@123".encode()).hexdigest()
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ("Admin", "admin@gmail.com", hashed_password, "admin")
        )
        conn.commit()
        print("✅ Default admin user created: admin@gmail.com / Admin@123")
    else:
        print("✅ Admin user already exists")
    
    conn.close()

# Initialize database
init_db()
create_default_admin()

# ========== FRONTEND ROUTES (NO DIRECTORY LISTING) ==========

# Allowed file extensions
ALLOWED_EXTENSIONS = {'.html', '.css', '.js', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.json', '.txt'}

def is_allowed_file(filename):
    """Check if file extension is allowed"""
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS

@app.route('/')
def serve_index():
    """Serve the main page (index.html) - NO directory listing"""
    try:
        return send_from_directory('frontend', 'index.html')
    except FileNotFoundError:
        abort(404)

@app.route('/<path:filename>')
def serve_file(filename):
    """Serve any file from frontend folder - NO directory listing"""
    # Security: Prevent directory traversal
    if '..' in filename or filename.startswith('/') or filename.startswith('\\'):
        abort(404)
    
    # Check if it's a directory request (ends with /)
    if filename.endswith('/'):
        abort(404)  # Don't show directory listings
    
    # Check if file exists in frontend folder
    file_path = os.path.join('frontend', filename)
    
    # Security: Only serve from frontend folder
    if not os.path.exists(file_path):
        abort(404)
    
    # Check if it's a file (not a directory)
    if os.path.isdir(file_path):
        abort(404)  # Don't show directory listings
    
    # Check file extension
    if not is_allowed_file(filename):
        abort(404)
    
    try:
        return send_from_directory('frontend', filename)
    except FileNotFoundError:
        abort(404)

# ========== AUTH API ROUTES WITH VALIDATION ==========

@app.route('/api/register', methods=['POST'])
def register():
    """User registration with validation"""
    try:
        data = request.json
        
        # Get user data
        name = data.get('fullname') or data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'operator')
        
        # Validate input - all fields required
        if not name or not email or not password or not role:
            return jsonify({"error": "All fields are required"}), 400
        
        # Validate email - must be @gmail.com
        if not validate_email(email):
            return jsonify({"error": "Email must be a valid @gmail.com address"}), 400
        
        # Validate password
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({"error": message}), 400
        
        # Validate role
        if role not in ['admin', 'operator']:
            return jsonify({"error": "Invalid role selected. Choose 'admin' or 'operator'"}), 400
        
        # Hash password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        # Save to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                (name, email, hashed_password, role)
            )
            conn.commit()
            user_id = cursor.lastrowid
            conn.close()
        except sqlite3.IntegrityError:
            return jsonify({"error": "Email already registered"}), 400
        
        # Create JWT token
        access_token = create_access_token(
            identity=email,
            additional_claims={
                "id": user_id,
                "name": name,
                "email": email,
                "role": role
            }
        )
        
        return jsonify({
            "message": "User registered successfully!",
            "access_token": access_token,
            "token": access_token,
            "user": {
                "id": user_id,
                "name": name,
                "email": email,
                "role": role
            }
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
    """User login with validation"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        # Validate email - must be @gmail.com
        if not validate_email(email):
            return jsonify({"error": "Email must be a valid @gmail.com address"}), 400
        
        # Hash the password to check
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        # Check in database
        conn = get_db_connection()
        cursor = conn.cursor()
        user = cursor.execute(
            "SELECT * FROM users WHERE email = ? AND password = ?",
            (email, hashed_password)
        ).fetchone()
        conn.close()
        
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Create JWT token
        access_token = create_access_token(
            identity=email,
            additional_claims={
                "id": user['id'],
                "name": user['name'],
                "email": user['email'],
                "role": user['role']
            }
        )
        
        return jsonify({
            "message": "Login successful!",
            "access_token": access_token,
            "token": access_token,
            "user": {
                "id": user['id'],
                "name": user['name'],
                "email": user['email'],
                "role": user['role']
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def profile():
    """Get user profile"""
    try:
        current_user = get_jwt_identity()
        
        # Get full user data from database
        conn = get_db_connection()
        cursor = conn.cursor()
        user = cursor.execute(
            "SELECT id, name, email, role, created_at FROM users WHERE email = ?",
            (current_user,)
        ).fetchone()
        conn.close()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "user": {
                "id": user['id'],
                "name": user['name'],
                "email": user['email'],
                "role": user['role'],
                "created_at": user['created_at']
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def dashboard_data():
    """Get dashboard data"""
    try:
        current_user = get_jwt_identity()
        
        # Get user info from database
        conn = get_db_connection()
        cursor = conn.cursor()
        user = cursor.execute(
            "SELECT name, email, role FROM users WHERE email = ?",
            (current_user,)
        ).fetchone()
        conn.close()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "user": user['name'],
            "email": user['email'],
            "role": user['role'],
            "stats": {
                "tasks": 24,
                "comments": 43,
                "activity": "87%"
            },
            "projects": [
                {"name": "Light UI Kit", "status": "Active", "team": "Design", "due": "Aug 12"},
                {"name": "Pro Dashboard", "status": "Review", "team": "Dev", "due": "Jul 28"},
                {"name": "Mobile App", "status": "Active", "team": "Mobile", "due": "Sep 4"},
                {"name": "Landing page", "status": "Delayed", "team": "Marketing", "due": "Jul 20"}
            ]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "Server is running!",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }), 200

# ========== ERROR HANDLERS ==========

@app.errorhandler(404)
def not_found(error):
    """Custom 404 page - NO directory listing"""
    return jsonify({
        "error": "Resource not found",
        "message": "The requested resource does not exist"
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Custom 405 error"""
    return jsonify({
        "error": "Method not allowed",
        "message": "The HTTP method is not allowed for this endpoint"
    }), 405

@app.errorhandler(500)
def internal_error(error):
    """Custom 500 page"""
    return jsonify({
        "error": "Internal server error",
        "message": "Something went wrong on the server"
    }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Starting TrafficVision AI Server...")
    print("=" * 60)
    print(f"📁 Frontend folder: {os.path.abspath('frontend')}")
    print(f"📁 Backend folder: {os.path.abspath('backend')}")
    print(f"📁 Database: {os.path.abspath('backend/traffic.db')}")
    print("🌐 Server running at: http://localhost:5500")
    print("📝 API Endpoints:")
    print("   - POST /api/register     Register new user")
    print("   - POST /api/login        Login user")
    print("   - GET  /api/profile      Get user profile (JWT required)")
    print("   - GET  /api/dashboard    Get dashboard data (JWT required)")
    print("   - GET  /api/health       Health check")
    print("=" * 60)
    print("📋 Validation Rules:")
    print("   - Email: Must be @gmail.com")
    print("   - Password: Min 6 chars, 1 special char, 1 number")
    print("   - Roles: admin, operator")
    print("=" * 60)
    print("🔑 Demo Admin: admin@gmail.com / Admin@123")
    print("=" * 60)
    print("⚠️  IMPORTANT: Directory listings are DISABLED")
    print("✅ Only files in 'frontend' folder are served")
    print("=" * 60)
    print("Press CTRL+C to quit")
    print("=" * 60)
    
    # Run the app with debug mode off to prevent directory listing
    app.run(debug=False, host='0.0.0.0', port=5500)