from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
import logging
from database import get_db
import models, schemas
from utils.security import get_current_active_user
from services import resume_service
from services.job_service import job_service
from services.tasks import run_distributed_analysis
from utils.report_generator import generate_analysis_report
from fastapi.responses import Response

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload", response_model=schemas.ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    logger.info(f"User {current_user.email} is uploading a resume")
    return await resume_service.process_resume_upload(file, db, current_user.id)

@router.post("/{resume_id}/analyze", response_model=schemas.JobResponse)
async def analyze_resume(
    resume_id: int,
    job_description: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    logger.info(f"User {current_user.email} requested analysis for resume {resume_id}")
    
    # 1. Create Job ID and Persist to DB
    job_id = job_service.create_job(current_user.id, resume_id)
    
    # 2. Trigger Distributed Celery Task
    run_distributed_analysis.delay(
        job_id,
        resume_id,
        job_description,
        current_user.id
    )
    
    return {"id": job_id, "status": "pending"}

@router.get("/{resume_id}/report")
async def download_report(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    logger.info(f"User {current_user.email} is downloading report for resume {resume_id}")
    import json
    
    analysis = db.query(models.Analysis).filter(models.Analysis.resume_id == resume_id).order_by(models.Analysis.id.desc()).first()
    if not analysis:
        logger.warning(f"No analysis found for resume {resume_id}")
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        logger.warning(f"Resume {resume_id} not found")
        raise HTTPException(status_code=404, detail="Resume not found")

    if resume.owner_id != current_user.id and not current_user.is_recruiter:
         logger.warning(f"Unauthorized report access attempt by {current_user.email} for resume {resume_id}")
         raise HTTPException(status_code=403, detail="Not authorized")
         
    analysis_data = {
        "ats_score": analysis.ats_score,
        "matched_keywords": json.loads(analysis.matched_keywords) if analysis.matched_keywords else [],
        "missing_keywords": json.loads(analysis.missing_keywords) if analysis.missing_keywords else [],
        "recommendations": analysis.recommendations
    }
    
    pdf_bytes = generate_analysis_report(analysis_data, current_user.full_name or "Candidate")
    
    logger.info(f"Report generated successfully for resume {resume_id}")
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=report_{resume_id}.pdf"})
