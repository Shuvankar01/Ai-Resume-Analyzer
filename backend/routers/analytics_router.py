from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import logging
from database import get_db
import models
from utils.security import get_current_recruiter
from services import analytics_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_recruiter_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_recruiter)):
    logger.info(f"Recruiter {current_user.email} is accessing the analytics dashboard")
    return analytics_service.get_recruiter_dashboard_stats(db)

@router.get("/activities")
def get_recruiter_activities(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_recruiter)
):
    logger.info(f"Recruiter {current_user.email} is fetching system activities")
    recent_analyses = db.query(models.Analysis).order_by(models.Analysis.created_at.desc()).limit(10).all()
    
    activities = []
    for a in recent_analyses:
        resume = db.query(models.Resume).filter(models.Resume.id == a.resume_id).first()
        user = db.query(models.User).filter(models.User.id == resume.owner_id).first() if resume else None
        activities.append({
            "id": a.id,
            "candidate_name": user.full_name or user.email if user else "Unknown Candidate",
            "ats_score": a.ats_score,
            "created_at": a.created_at.isoformat(),
            "filename": resume.filename if resume else "resume.pdf"
        })
    return activities
