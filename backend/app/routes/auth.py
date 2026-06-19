from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.security import hash_password, verify_password, create_access_token, verify_token

router = APIRouter()
security = HTTPBearer()


# -------------------------
# Database Dependency
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# Register Route (JSON body)
# -------------------------
@router.post("/register")
def register(
    email: str = Body(..., embed=True),
    password: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=email,
        hashed_password=hash_password(password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


# -------------------------
# Login Route (OAuth2 compatible)
# -------------------------
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login using OAuth2PasswordRequestForm (username + password)
    Compatible with frontend fetch sending x-www-form-urlencoded.
    """
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# -------------------------
# Get Current User Route
# -------------------------
@router.get("/me")
def get_current_user_route(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Returns currently logged-in user info using JWT token from Authorization header.
    """
    current_user = verify_token(credentials)
    return {
        "id": current_user.id,
        "email": current_user.email
    }