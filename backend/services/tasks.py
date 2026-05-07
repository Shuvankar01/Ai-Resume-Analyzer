import json
import logging
import asyncio
from celery_app import celery_app
from database import SessionLocal
import models, schemas
from services.job_service import job_service
from services.gemini_service import gemini_service
from utils.cache import set_cached_analysis
from utils.serializer import redis_dumps

logger = logging.getLogger(__name__)

@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=30,
    retry_backoff=True,
    retry_backoff_max=600,
    retry_jitter=True
)
def run_distributed_analysis(self, job_id: str, resume_id: int, job_description: str, user_id: int):
    """Distributed Celery task for AI analysis with automatic retries."""
    logger.info(f"⚡ [Task Start] Job: {job_id} | Resume: {resume_id}")
    job_service.update_job(job_id, "processing")
    
    db = SessionLocal()
    try:
        resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
        if not resume:
            logger.error(f"❌ Resume {resume_id} not found for Job {job_id}")
            job_service.update_job(job_id, "failed", error="Resume not found")
            return

        # Perform AI Analysis
        logger.info(f"🧠 Running AI Analysis for Job {job_id}")
        loop = asyncio.get_event_loop()
        analysis_result = loop.run_until_complete(gemini_service.analyze_resume(resume.extracted_text, job_description))
        
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
        logger.info(f"✅ [Task Success] Job: {job_id}")

    except Exception as e:
        logger.error(f"💥 [Task Error] Job: {job_id} | Error: {str(e)}")
        
        # FATAL ERRORS: Do not retry (Code issues, missing imports, data type issues)
        if isinstance(e, (NameError, TypeError, ValueError, ImportError)):
            logger.critical(f"🚫 Fatal task error in {job_id}: {str(e)}")
            job_service.update_job(job_id, "failed", error=f"Fatal System Error: {str(e)}")
            return
            
        # TRANSIENT ERRORS: Auto-retry (Network, API timeouts, DB locks)
        try:
            logger.warning(f"🔄 Retrying job {job_id}... Attempt {self.request.retries + 1}/3")
            self.retry(exc=e)
        except self.MaxRetriesExceededError:
            logger.error(f"💀 Max retries exceeded for job {job_id}")
            job_service.update_job(job_id, "failed", error=f"Max retries exceeded: {str(e)}")
    finally:
        db.close()
