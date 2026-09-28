from typing import Optional, Tuple
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.models.child import Child


def signup_user(
    db: Session,
    email: str,
    password: str,
    name: Optional[str] = None,
    phone: Optional[str] = None,
    child_name: Optional[str] = None,
    child_age: Optional[int] = None,
) -> Optional[User]:
    normalized_email = email.strip().lower()
    clean_name = name.strip() if name else None
    clean_phone = phone.strip() if phone else None

    existing_user = (
        db.query(User)
        .filter(User.email == normalized_email)
        .first()
    )

    if existing_user:
        return None

    user = User(
        name=clean_name,
        email=normalized_email,
        phone=clean_phone,
        password_hash=hash_password(password),
        is_active=True,
    )

    try:
        db.add(user)
        db.flush()
        
        if child_name:
            child = Child(
                user_id=user.id,
                name=child_name.strip(),
                age=child_age
            )
            db.add(child)
            
        db.commit()
        db.refresh(user)
        return user
    except IntegrityError:
        db.rollback()
        return None
    except Exception:
        db.rollback()
        raise


def login_user(
    db: Session,
    email: str,
    password: str,
) -> Optional[Tuple[str, User]]:
    normalized_email = email.strip().lower()

    user = (
        db.query(User)
        .filter(User.email == normalized_email)
        .first()
    )

    if not user:
        return None

    if not user.is_active:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    token = create_access_token(user.id)

    return token, user