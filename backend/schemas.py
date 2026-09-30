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


# --- Recruiter Profile Schemas (onboarding) ---
class RecruiterProfileBase(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    designation: Optional[str] = None
    hiring_goals: Optional[str] = None
    experience_level: Optional[str] = None
    bio_summary: Optional[str] = None

class RecruiterProfileUpdate(RecruiterProfileBase):
    """Option A payload — manual form entry. `tech_stack` is accepted as a list
    and stored as a JSON string column, matching the TEXT/JSON convention used
    by `analyses.matched_keywords` and `job_descriptions.required_skills`."""
    tech_stack: Optional[List[str]] = None
    source_filename: Optional[str] = None

    class Config:
        from_attributes = True

class RecruiterProfileResponse(RecruiterProfileBase):
    id: Optional[int] = None
    tech_stack: List[str] = []
    source_filename: Optional[str] = None
    # False for a brand new recruiter, which is what triggers the onboarding modal.
    onboarding_completed: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Candidate Action Schemas (recruiter pipeline) ---
class CandidateActionCreate(BaseModel):
    candidate_id: Optional[int] = None
    candidate_name: str
    action: str  # SHORTLIST | REJECT | INTERVIEW | OFFER
    ats_score: Optional[float] = None
    notes: Optional[str] = None
    scheduled_for: Optional[datetime] = None

class CandidateActionResponse(BaseModel):
    id: int
    recruiter_id: int
    candidate_id: Optional[int]
    candidate_name: str
    action: str
    status: str
    ats_score: Optional[float]
    notes: Optional[str]
    scheduled_for: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Recruiter Candidate Intelligence Schema ---
class CandidateContact(BaseModel):
    id: Optional[int] = None
    name: str
    email: Optional[str] = None
    resume_id: Optional[int] = None
    filename: Optional[str] = None

class CandidateIntelligence(BaseModel):
    """The complete AI-parsed dataset for one candidate, as shown on the
    recruiter spotlight / profile view. Every field is optional because it is
    derived from two independent AI passes (ATS analysis + resume preview) and
    either one can be missing for a given candidate."""
    contact: CandidateContact
    # ATS
    ats_score: Optional[float] = None
    keyword_match_percent: Optional[int] = None
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    candidate_strengths: List[str] = []
    ai_briefing: Optional[str] = None          # recruiter_summary
    recommendations: Optional[str] = None
    # Profile fields from the resume preview pass
    experience: Optional[str] = None
    expected_salary: Optional[str] = None
    location: Optional[str] = None
    availability: Optional[str] = None
    notice_period: Optional[str] = None
    career_stage: Optional[str] = None
    market_value: Optional[str] = None
    target_roles: List[str] = []
    summary: Optional[str] = None
    # Skills breakdown
    primary_tech_stack: List[str] = []
    skills_breakdown: dict = {}
    strengths: List[str] = []
    weaknesses: List[str] = []
    # Links
    report_url: Optional[str] = None
    has_analysis: bool = False
    has_preview: bool = False

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
    expected_salary: Optional[str] = None
    career_stage: Optional[str] = None
    market_value: Optional[str] = None
    notice_period: Optional[str] = None
    preferred_location: Optional[str] = None
    employment_type: Optional[str] = None
    availability: Optional[str] = None
    role_match_confidence: Optional[int] = None
    resume_strength: Optional[str] = None
    interview_readiness: Optional[str] = None

class PreviewMetadata(BaseModel):
    filename: str
    file_type: str
    file_size_mb: Optional[float] = None
    upload_timestamp: str
    version: str

class PreviewHealth(BaseModel):
    overall_score: int
    overall_score_explanation: Optional[str] = None
    ai_confidence: int
    ai_confidence_explanation: Optional[str] = None
    upload_quality: int
    upload_quality_explanation: Optional[str] = None
    completeness: int
    completeness_explanation: Optional[str] = None

class PreviewAtsMetrics(BaseModel):
    readability_score: int
    formatting_score: int
    buzzword_density: int
    explanation: Optional[str] = None

class CategorizedSkills(BaseModel):
    languages: List[str]
    frameworks: List[str]
    databases: List[str]
    cloud: List[str]
    devops: List[str]
    soft_skills: List[str]
    ai_ml: List[str] = []
    testing: List[str] = []
    version_control: List[str] = []

class MissingSkill(BaseModel):
    name: str
    category: str
    priority: str
    
class PreviewSkills(BaseModel):
    matched: CategorizedSkills
    missing: List[MissingSkill]
    recommended: List[str] = []

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
    strengths: List[str]
    weaknesses: List[str]
    interview_questions: List[str] = []
    learning_roadmap: List[str] = []
    career_growth_suggestions: List[str] = []

