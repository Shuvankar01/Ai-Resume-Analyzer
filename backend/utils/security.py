from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from config import settings
from database import get_db
import models
import schemas

import hashlib

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password: str, hashed_password: str):
    """
    Verifies a password against a hash.
    Uses SHA-256 pre-hashing to support passwords > 72 bytes.
    """
    if len(plain_password) > 128:
        return False
    
    # Pre-hash to handle bcrypt's 72-byte limit
    # Using hexdigest() ensures a fixed 64-character safe-length string
    pre_hash = hashlib.sha256(plain_password.encode()).hexdigest()
    return pwd_context.verify(pre_hash, hashed_password)

def get_password_hash(password: str):
    """
    Hashes a password using bcrypt with SHA-256 pre-hashing.
    """
    if len(password) > 128:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is too long (max 128 characters)"
        )
    
    # Pre-hash to handle bcrypt's 72-byte limit
    # Using hexdigest() ensures a fixed 64-character safe-length string
    pre_hash = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(pre_hash)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    return current_user

def get_current_recruiter(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_recruiter:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
