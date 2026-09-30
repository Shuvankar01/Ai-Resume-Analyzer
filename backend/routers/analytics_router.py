from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import logging
from database import get_db
import models
from utils.security import get_current_recruiter
from services import analytics_service, recruiter_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_recruiter_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_recruiter)):
    logger.info(f"Recruiter {current_user.email} is accessing the analytics dashboard")
    return analytics_service.get_recruiter_dashboard_stats(db, recruiter=current_user)

# Human-readable labels for the raw event vocabulary, so the client renders
# "Candidate Shortlisted" rather than an internal enum name.
_ACTION_HEADLINES = {
    "SHORTLIST": "Candidate Shortlisted",
    "REJECT": "Candidate Rejected",
    "INTERVIEW": "Interview Scheduled",
    "OFFER": "Offer Extended",
}

_STATUS_DETAILS = {
    "Shortlisted": "Moved into the active shortlist.",
    "Rejected": "Closed out at screening.",
    "Interview": "Technical interview booked.",
    "Offer": "Offer letter sent.",
    "Hired": "Offer accepted — candidate hired.",
}

@router.get("/activities")
def get_recruiter_activities(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_recruiter)
):
    """Recent sourcing activity, newest first.

    Combines the durable recruiter decisions with resume-analysis events so the
    feed reads as a human narrative rather than a system log.
    """
    logger.info(f"Recruiter {current_user.email} is fetching sourcing activity")

    activities = []

    for action in recruiter_service.list_actions(db, current_user, limit=50):
        activities.append({
            "id": f"action-{action.id}",
            "kind": "ACTION",
            "headline": _ACTION_HEADLINES.get(action.action, "Candidate Updated"),
            "detail": _STATUS_DETAILS.get(action.status, action.status),
            "candidate_name": action.candidate_name,
            "candidate_id": action.candidate_id,
            "ats_score": action.ats_score,
            "status": action.status,
            "action": action.action,
            "created_at": action.created_at.isoformat() if action.created_at else None,
        })

    recent_analyses = db.query(models.Analysis).order_by(models.Analysis.created_at.desc()).limit(20).all()
    for a in recent_analyses:
        resume = db.query(models.Resume).filter(models.Resume.id == a.resume_id).first()
        user = db.query(models.User).filter(models.User.id == resume.owner_id).first() if resume else None
        activities.append({
            "id": f"analysis-{a.id}",
            "kind": "ANALYSIS",
            "headline": "Resume Analyzed",
            "detail": f"AI finished scoring {resume.filename if resume else 'a resume'}.",
            "candidate_name": (user.full_name or user.email) if user else "Unknown Candidate",
            "candidate_id": user.id if user else None,
            "ats_score": a.ats_score,
            "status": None,
            "action": None,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })

    activities.sort(key=lambda item: item["created_at"] or "", reverse=True)
    return activities[:30]
