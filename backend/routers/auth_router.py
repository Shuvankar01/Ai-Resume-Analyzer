from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
import logging
from database import get_db
import schemas
from services import auth_service
from utils.security import get_current_user
import models
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Registration request for: {user.email}")
    return auth_service.register_new_user(user, db)

@router.post("/login", response_model=schemas.Token)
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info(f"Login request for: {form_data.username}")
    token_data = auth_service.authenticate_user_and_create_token(form_data, db)
    
    # Set HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=token_data["access_token"],
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,  # secure=False for local docker development on HTTP
        path="/"
    )
    return token_data

@router.post("/logout")
def logout(response: Response):
    logger.info("Logout request received, clearing session cookie")
    response.delete_cookie("access_token", path="/")
    return {"message": "Session terminated successfully"}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
