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

# --- Job Schemas ---
class JobResponse(BaseModel):
    id: str
    status: str
    job_name: Optional[str] = None
    job_metadata: Optional[dict] = None
    is_done: bool = False
    result: Optional[dict] = None
    error_message: Optional[str] = None

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

# --- Preview Schemas ---
class PreviewSnapshot(BaseModel):
    name: Optional[str] = None
    estimated_experience: Optional[str] = None
    target_roles: List[str]

class PreviewMetadata(BaseModel):
    filename: str
    file_type: str
    file_size_mb: Optional[float] = None
    upload_timestamp: str
    version: str

class PreviewHealth(BaseModel):
    overall_score: int
    ai_confidence: int
    upload_quality: int
    completeness: int

class PreviewAtsMetrics(BaseModel):
    readability_score: int
    formatting_score: int
    buzzword_density: int

class CategorizedSkills(BaseModel):
    languages: List[str]
    frameworks: List[str]
    tools: List[str]
    soft_skills: List[str]
    domain_keywords: List[str]
    
class PreviewSkills(BaseModel):
    matched: CategorizedSkills
    missing: CategorizedSkills

class SuggestedRole(BaseModel):
    title: str
    confidence: int

class PreviewRecommendation(BaseModel):
    priority: str
    category: str
    suggestion: str

class PreviewAction(BaseModel):
    id: str
    label: str
    action_type: str

class ResumePreviewResponse(BaseModel):
    snapshot: PreviewSnapshot
    metadata: PreviewMetadata
    health: PreviewHealth
    summary: str
    ats: PreviewAtsMetrics
    skills: PreviewSkills
    sections: List[str]
    roles: List[SuggestedRole]
    recommendations: List[PreviewRecommendation]
    actions: List[PreviewAction]
    risks: List[str]

