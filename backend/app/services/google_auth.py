import logging
from typing import Optional, Tuple
import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token
from app.models.user import User

logger = logging.getLogger("uvicorn.error")

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def get_google_auth_url(state: Optional[str] = None) -> str:
    client_id = settings.GOOGLE_CLIENT_ID or "YOUR_GOOGLE_CLIENT_ID"
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
        "&prompt=consent"
    )
    if state:
        url += f"&state={state}"
    return url


def exchange_google_code(code: str) -> Optional[dict]:
    try:
        data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        with httpx.Client(timeout=10.0) as client:
            res = client.post("https://oauth2.googleapis.com/token", data=data)
        if res.status_code == 200:
            return res.json()
        logger.error(f"Google code exchange failed ({res.status_code}): {res.text}")
    except Exception as exc:
        logger.error(f"Google code exchange error: {exc}")
    return None



def verify_google_token(
    id_token: Optional[str] = None,
    access_token: Optional[str] = None,
    fallback_email: Optional[str] = None,
    fallback_name: Optional[str] = None,
    fallback_picture: Optional[str] = None,
) -> Optional[dict]:
    # Development / local test support
    token_str = (id_token or access_token or "").strip()
    if token_str.startswith("dev-") or token_str == "demo-google-token" or token_str == "test-token":
        return {
            "email": fallback_email or "sggokul762@gmail.com",
            "name": fallback_name or "Gokul",
            "google_id": f"dev-google-{token_str}",
            "picture": fallback_picture or "https://lh3.googleusercontent.com/a/default-user",
        }


    # Verify ID token via Google tokeninfo endpoint
    if id_token:
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.get(f"{GOOGLE_TOKENINFO_URL}?id_token={id_token}")
            if res.status_code == 200:
                data = res.json()
                if settings.GOOGLE_CLIENT_ID and data.get("aud") != settings.GOOGLE_CLIENT_ID:
                    logger.warning(f"Google token audience mismatch: {data.get('aud')}")
                email = data.get("email")
                if email:
                    return {
                        "email": email,
                        "google_id": data.get("sub"),
                        "name": data.get("name"),
                        "picture": data.get("picture"),
                    }
        except Exception as exc:
            logger.error(f"Failed to verify Google ID token: {exc}")

    # Verify Access token via Google userinfo endpoint
    if access_token:
        try:
            headers = {"Authorization": f"Bearer {access_token}"}
            with httpx.Client(timeout=10.0) as client:
                res = client.get(GOOGLE_USERINFO_URL, headers=headers)
            if res.status_code == 200:
                data = res.json()
                email = data.get("email")
                if email:
                    return {
                        "email": email,
                        "google_id": data.get("sub"),
                        "name": data.get("name"),
                        "picture": data.get("picture"),
                    }
        except Exception as exc:
            logger.error(f"Failed to verify Google access token: {exc}")

    return None


def authenticate_google_user(
    db: Session,
    google_info: dict,
) -> Tuple[str, User]:
    email = google_info["email"].strip().lower()
    google_id = str(google_info.get("google_id") or "")
    name = google_info.get("name")
    picture = google_info.get("picture")

    # 1. Check if user with this google_id already exists
    user = None
    if google_id:
        user = db.query(User).filter(User.google_id == google_id).first()

    # 2. Check if user with this email already exists
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            # Link google_id and update name / avatar if missing
            if google_id and not user.google_id:
                user.google_id = google_id
            if not user.name and name:
                user.name = name
            if not user.avatar_url and picture:
                user.avatar_url = picture
            db.commit()
            db.refresh(user)

    # 3. Create new user if not exists
    if not user:
        user = User(
            email=email,
            name=name or "Google User",
            google_id=google_id if google_id else None,
            avatar_url=picture,
            is_active=True,
            password_hash=None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(user.id)
    return token, user
