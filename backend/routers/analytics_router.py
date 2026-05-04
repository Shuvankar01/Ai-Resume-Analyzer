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
