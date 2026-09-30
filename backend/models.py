import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_recruiter = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    resumes = relationship("Resume", back_populates="owner")
    recruiter_profile = relationship(
        "RecruiterProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    # Candidate actions this recruiter has taken. `actions` is deliberately not
    # named `recruiter_profile` to avoid colliding with the relationship above.
    # `foreign_keys` is required: `candidate_actions` has two FKs back to
    # `users` (recruiter_id and candidate_id), so SQLAlchemy cannot infer which
    # one this relationship joins on.
    candidate_actions = relationship(
        "CandidateAction",
        back_populates="recruiter",
        foreign_keys="CandidateAction.recruiter_id",
        cascade="all, delete-orphan",
    )


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String, nullable=False)
    extracted_text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="resumes")
    analysis = relationship("Analysis", back_populates="resume", uselist=False)


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(Text) # Stored as comma-separated or JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=True)
    
    ats_score = Column(Float)
    matched_keywords = Column(Text) # JSON string
    missing_keywords = Column(Text) # JSON string
    recommendations = Column(Text)
    recruiter_summary = Column(Text, nullable=True)
    candidate_strengths = Column(Text, nullable=True) # JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    resume = relationship("Resume", back_populates="analysis")


class RecruiterProfile(Base):
    """Hiring profile for a recruiter account.

    A brand new recruiter has no row here at all, which is what the frontend
    uses to detect a first-time login and trigger onboarding. Everything is
    nullable so a partially completed wizard is still persisted.
    """
    __tablename__ = "recruiter_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True, nullable=False)

    company_name = Column(String, nullable=True)
    industry = Column(String, nullable=True)       # Hiring domain / vertical
    designation = Column(String, nullable=True)     # Role / title
    hiring_goals = Column(Text, nullable=True)      # Free text or JSON list

    # Populated by the AI bio/resume parser (Option B) but editable afterwards.
    experience_level = Column(String, nullable=True)
    tech_stack = Column(Text, nullable=True)        # JSON string list
    bio_summary = Column(Text, nullable=True)
    source_filename = Column(String, nullable=True) # Bio/resume used for the parse

    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="recruiter_profile")


class CandidateAction(Base):
    """A recruiter decision on a candidate, persisted server-side.

    Candidate status used to live only in localStorage, which meant it was lost
    on another device and invisible to any other recruiter on the account. The
    row here is the durable record; the frontend keeps mirroring it locally so
    existing consumers of `activityService` keep working unchanged.
    """
    __tablename__ = "candidate_actions"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    candidate_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    candidate_name = Column(String, nullable=False)

    action = Column(String, nullable=False)  # SHORTLIST | REJECT | INTERVIEW | OFFER
    status = Column(String, nullable=False)  # Shortlisted | Rejected | Interview | Offer
    ats_score = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    scheduled_for = Column(DateTime, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    recruiter = relationship(
        "User",
        back_populates="candidate_actions",
        foreign_keys=[recruiter_id],
    )


class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True, index=True) # UUID string
    user_id = Column(Integer, index=True)
    resume_id = Column(Integer)
    status = Column(String, default="pending") # pending, processing, done, failed
    job_name = Column(String, nullable=True)
    job_metadata = Column(Text, nullable=True) # JSON string
    is_done = Column(Boolean, default=False)
    result = Column(Text, nullable=True) # JSON string
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
