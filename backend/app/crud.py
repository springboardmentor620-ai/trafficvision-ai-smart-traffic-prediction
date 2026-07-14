from sqlalchemy.orm import Session
from app.models import User
from app.auth import hash_password


def create_user(db: Session, full_name, email, password):
    print("FUNCTION ENTERED")
    print(full_name)
    print(email)
    print(password)

    user = User(
        full_name=full_name,
        email=email,
        password=hash_password(password)
    )

    db.add(user)

    try:
        db.commit()
    except Exception as e:
        print("DATABASE ERROR:", e)
        db.rollback()
        raise

    db.refresh(user)
    return user


def get_user_by_email(db: Session, email):
    return db.query(User).filter(User.email == email).first()