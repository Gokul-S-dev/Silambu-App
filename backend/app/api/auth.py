from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    GoogleAuthRequest,
    LoginRequest,
    SignupRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth import (
    login_user,
    signup_user,
)
from app.services.google_auth import (
    authenticate_google_user,
    exchange_google_code,
    get_google_auth_url,
    verify_google_token,
)



router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    data: SignupRequest,
    db: Session = Depends(get_db),
):
    user = signup_user(
        db=db,
        email=data.email,
        password=data.password,
        name=data.name,
        phone=data.phone,
        child_name=data.child_name,
        child_age=data.child_age,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    result = login_user(
        db=db,
        email=data.email,
        password=data.password,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token, user = result

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.get("/google/url")
def google_auth_url():
    """Retrieve the Google OAuth consent URL."""
    return {
        "url": get_google_auth_url()
    }


@router.post(
    "/google",
    response_model=TokenResponse,
)
def google_auth(
    data: GoogleAuthRequest,
    db: Session = Depends(get_db),
):
    """Authenticate or register a user with Google credentials."""
    google_info = verify_google_token(
        id_token=data.id_token,
        access_token=data.access_token,
        fallback_email=data.email,
        fallback_name=data.name,
        fallback_picture=data.picture,
    )

    if not google_info or not google_info.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google credentials or token expired",
        )

    token, user = authenticate_google_user(db=db, google_info=google_info)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@router.get(
    "/google/callback",
    response_model=TokenResponse,
)
def google_auth_callback(
    code: str,
    db: Session = Depends(get_db),
):
    """Callback for Google OAuth code exchange."""
    token_data = exchange_google_code(code)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to exchange Google authorization code",
        )

    google_info = verify_google_token(
        id_token=token_data.get("id_token"),
        access_token=token_data.get("access_token"),
    )

    if not google_info or not google_info.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve user info from Google",
        )

    token, user = authenticate_google_user(db=db, google_info=google_info)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }

