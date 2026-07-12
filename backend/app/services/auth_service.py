from app.database import db
from app.utils.security import hash_password, verify_password
from app.utils.jwt_handler import create_access_token


async def register_user(user):

    existing_user = await db.users.find_one(
        {"email": user.email}
    )

    if existing_user:
        return {
            "success": False,
            "message": "Email already exists"
        }

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role
    }

    await db.users.insert_one(new_user)

    return {
        "success": True,
        "message": "Account created successfully"
    }


async def login_user(user):

    existing_user = await db.users.find_one(
        {"email": user.email}
    )

    if not existing_user:
        return {
            "success": False,
            "message": "Invalid email or password"
        }

    if not verify_password(
        user.password,
        existing_user["password"]
    ):
        return {
            "success": False,
            "message": "Invalid email or password"
        }

    token = create_access_token(
        {
            "email": existing_user["email"],
            "role": existing_user["role"]
        }
    )

    return {
        "success": True,
        "message": "Login Successful",
        "access_token": token,
        "role": existing_user["role"],
        "name": existing_user["name"]

    }