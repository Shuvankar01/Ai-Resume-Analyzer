import json
import logging
from database import SessionLocal
import models, schemas
from services.job_service import job_service
from services.gemini_service import gemini_service
from utils.cache import set_cached_analysis
from utils.serializer import redis_dumps, redis_loads

logger = logging.getLogger(__name__)

async def run_background_analysis(job_id: str, resume_id: int, job_description: str, user_id: int):
    """Background task to run AI analysis and update job status in Redis."""
    logger.info(f"Starting background job {job_id} for resume {resume_id}")
    job_service.update_job(job_id, "processing")
    
    db = SessionLocal()
    try:
        resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
        if not resume:
            job_service.update_job(job_id, "failed", error="Resume not found")
            return

        # Perform AI Analysis
        analysis_result = await gemini_service.analyze_resume(resume.extracted_text, job_description)
        
        # Save to PostgreSQL
        new_analysis = models.Analysis(
            resume_id=resume_id,
            ats_score=analysis_result.get("ats_score", 0),
            matched_keywords=redis_dumps(analysis_result.get("matched_keywords", [])),
            missing_keywords=redis_dumps(analysis_result.get("missing_keywords", [])),
            recommendations=analysis_result.get("recommendations", ""),
            recruiter_summary=analysis_result.get("recruiter_summary", ""),
            candidate_strengths=redis_dumps(analysis_result.get("candidate_strengths", []))
        )
        db.add(new_analysis)
        db.commit()
        db.refresh(new_analysis)

        response_data = schemas.AnalysisResponse(
            id=new_analysis.id,
            resume_id=new_analysis.resume_id,
            job_description_id=None,
            ats_score=new_analysis.ats_score,
            matched_keywords=json.loads(new_analysis.matched_keywords) if new_analysis.matched_keywords else [],
            missing_keywords=json.loads(new_analysis.missing_keywords) if new_analysis.missing_keywords else [],
            recommendations=new_analysis.recommendations,
            recruiter_summary=new_analysis.recruiter_summary,
            candidate_strengths=json.loads(new_analysis.candidate_strengths) if new_analysis.candidate_strengths else [],
            created_at=new_analysis.created_at
        )

        # Cache result
        job_id_hash = hash(job_description)
        set_cached_analysis(resume_id, job_id_hash, response_data.model_dump(), exp=3600*24)

        # Update Job Status
        job_service.update_job(job_id, "done", result=response_data.model_dump())
        logger.info(f"Job {job_id} completed successfully")

    except Exception as e:
        logger.error(f"Background Job {job_id} failed: {str(e)}")
        job_service.update_job(job_id, "failed", error=str(e))
    finally:
        db.close()
