import json
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from services import recruiter_service

logger = logging.getLogger(__name__)

def get_recruiter_dashboard_stats(db: Session, recruiter=None):
    logger.info("Generating recruiter dashboard analytics")
    
    try:
        total_candidates = db.query(models.User).filter(models.User.is_recruiter == False).count()
        
        # Average ATS score
        avg_score = db.query(func.avg(models.Analysis.ats_score)).scalar() or 0.0
        
        # Top missing skills
        analyses = db.query(models.Analysis).all()
        missing_skills_count = {}
        for a in analyses:
            skills = json.loads(a.missing_keywords) if a.missing_keywords else []
            for s in skills:
                missing_skills_count[s] = missing_skills_count.get(s, 0) + 1
                
        top_missing_skills = sorted(missing_skills_count.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Trending technologies: most frequently matched keywords across analyses.
        matched_skills_count = {}
        for a in analyses:
            skills = json.loads(a.matched_keywords) if a.matched_keywords else []
            for s in skills:
                matched_skills_count[s] = matched_skills_count.get(s, 0) + 1
        trending_skills = sorted(matched_skills_count.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Candidate ranking (Top 5 based on max ATS score)
        top_candidates = db.query(
            models.User.full_name,
            models.User.email,
            models.User.id.label("user_id"),
            func.max(models.Analysis.ats_score).label("max_score")
        ).join(models.Resume, models.User.id == models.Resume.owner_id)\
         .join(models.Analysis, models.Resume.id == models.Analysis.resume_id)\
         .group_by(models.User.id)\
         .order_by(func.max(models.Analysis.ats_score).desc())\
         .limit(5).all()
         
        candidate_ranking = [
            {
                "name": c.full_name or c.email,
                "score": c.max_score,
                # Additive: lets the client key candidate actions to a real user id
                # instead of a display name.
                "id": c.user_id,
                "email": c.email,
            }
            for c in top_candidates
        ]

        payload = {
            "total_candidates": total_candidates,
            "average_ats_score": round(avg_score, 2),
            "top_missing_skills": [{"skill": k, "count": v} for k, v in top_missing_skills],
            "candidate_ranking": candidate_ranking,
            "hiring_insights": "Focus on sourcing candidates with Docker and AWS experience based on the missing skills trend."
        }

        # Additive: real per-recruiter metrics for the consolidated KPI cards.
        # Skipped when no recruiter is supplied (internal/service callers).
        if recruiter is not None:
            payload["trending_skills"] = [{"skill": k, "count": v} for k, v in trending_skills]
            payload["metrics"] = recruiter_service.get_recruiter_metrics(db, recruiter)
            payload["pipeline"] = recruiter_service.get_pipeline_breakdown(db, recruiter)

        logger.info("Analytics generated successfully")
        return payload
    except Exception as e:
        logger.error(f"Failed to generate analytics: {str(e)}")
        raise
