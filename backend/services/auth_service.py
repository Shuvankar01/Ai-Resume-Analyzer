import logging
from datetime import timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import models, schemas
from utils.security import verify_password, get_password_hash, create_access_token
from config import settings

logger = logging.getLogger(__name__)

def register_new_user(user_data: schemas.UserCreate, db: Session):
    logger.info(f"Registering new user with email: {user_data.email}")
    
    db_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if db_user:
        logger.warning(f"Registration failed: Email {user_data.email} already registered")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = models.User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        is_recruiter=user_data.is_recruiter
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    logger.info(f"User {new_user.email} registered successfully with ID: {new_user.id}")
    return new_user

def authenticate_user_and_create_token(form_data: OAuth2PasswordRequestForm, db: Session):
    logger.info(f"Login attempt for user: {form_data.username}")
    
    # Emails are stored normalized by pydantic's EmailStr on registration, which
    # lowercases the domain but preserves the local part (e.g. "Shuvankar@gmail.com").
    # The submitted identifier arrives as a raw string, so it has to be matched the same
    # way or a correctly-typed but differently-cased / whitespace-padded address is
    # reported as "Incorrect email or password". Password verification is unchanged.
    submitted_email = (form_data.username or "").strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == submitted_email).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Login failed for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "is_recruiter": user.is_recruiter},
        expires_delta=access_token_expires
    )
    
    logger.info(f"User {user.email} logged in successfully")
    return {"access_token": access_token, "token_type": "bearer"}
