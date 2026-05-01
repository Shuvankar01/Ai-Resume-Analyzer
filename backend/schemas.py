from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_recruiter: bool = False

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Resume Schemas ---
class ResumeBase(BaseModel):
    filename: str

class ResumeResponse(ResumeBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Analysis Schemas ---
class AnalysisResponse(BaseModel):
    id: int
    resume_id: int
    job_description_id: Optional[int]
    ats_score: float
    matched_keywords: List[str]
    missing_keywords: List[str]
    recommendations: str
    recruiter_summary: Optional[str] = None
    candidate_strengths: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Job Description Schemas ---
class JobDescriptionCreate(BaseModel):
    title: str
    description: str
    required_skills: str

class JobDescriptionResponse(JobDescriptionCreate):
    id: int
    recruiter_id: int
    created_at: datetime

    class Config:
        from_attributes = True
